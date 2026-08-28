import { supabase } from "../storageShim.js";
import { emptyProfile } from "./profile.js";

/* Hồ sơ mở rộng — địa chỉ, điện thoại, ngày sinh, trường, trình độ, mục tiêu.
 *
 * ══ VÌ SAO KHÔNG CÒN Ở kv_store ══
 *
 * Trước migration 048, cả chín trường này nằm trong MỘT object JSON dưới khoá
 * dùng chung `s:mcf-profiles`, khoá theo TÊN người dùng. Policy của 002 biến
 * chuyện đó thành hai lỗ hổng, và cả hai đều không vá được bằng cách sửa policy:
 *
 *   ĐỌC   mọi người đã đăng nhập đọc được mọi khoá `s:%` trừ ghi chú giáo
 *         viên. Một học sinh mở DevTools là có địa chỉ nhà và số điện thoại
 *         của cả lớp.
 *
 *   GHI   học sinh được ghi vào `s:mcf-profiles`, mà ghi kv là ghi đè CẢ
 *         object — xoá được hồ sơ của mọi người khác, không để lại dấu vết.
 *
 * RLS phân quyền theo DÒNG, mà cả lớp chung một dòng. Nên không có policy nào
 * viết được để "mỗi người chỉ thấy hồ sơ của mình" chừng nào dữ liệu còn nằm
 * chung một ô. Chín cột trên `profiles`, khoá theo `auth.uid()`, thì RLS của
 * 003 đã sẵn đúng hình dạng cần — không phải viết policy mới nào cả.
 *
 * Khoá theo TÊN còn sai độc lập với bảo mật: đổi tên là mất hồ sơ.
 *
 * ══ ĐƯỜNG GHI ĐI QUA RPC ══
 *
 * `update_my_profile`, không phải `.update()`. Lý do đầy đủ ở đầu migration
 * 050 và 046; tóm tắt: RLS phân quyền theo dòng, nên cho học sinh ghi dòng của
 * mình đồng thời là cho họ tự đặt `role = 'prof'` và `has_premium_access`.
 *
 * Cùng khuôn với `identity.js`. Hai file tách nhau vì hai nhóm trường có luật
 * khác nhau — `username` phải duy nhất toàn hệ thống, chín trường này thì
 * không — và gộp lại thì một hàm SQL phải mang mười hai tham số. */

/* Chín trường, đúng thứ tự tham số của `update_my_profile`. Danh sách này phải
   khớp với `PROFILE_FIELDS` trong profile.js và với chín cột của migration
   048 — `check:identity` so cả ba. */
const TRUONG = ["genre", "prenom", "nom", "adresse", "phone", "dob", "level", "goal", "school"];

/* Chỉ lấy đúng chín trường, bỏ mọi thứ khác.
 *
 * Blob cũ có `updatedAt` (Student.jsx ghi vào), và `select` trả về cả `id`,
 * `name`, `email`. Để chúng lọt vào state của biểu mẫu thì `calculateProfileCompletion`
 * vẫn đúng (nó đếm theo danh sách riêng) nhưng chỗ gọi sau này dễ tưởng chúng
 * là trường hồ sơ. Cắt ở đây, một lần. */
const chiChinTruong = (o) => {
  const r = emptyProfile();
  for (const k of TRUONG) r[k] = o?.[k] ?? "";
  return r;
};

/* ── Đọc hồ sơ của chính mình ──
 *
 * `maybeSingle` chứ không `single`: người vừa đăng ký bằng Google có thể chưa
 * kịp có dòng trong `profiles` (trigger chạy sau), và `single` thì ném lỗi.
 * Chưa có hồ sơ không phải sự cố — chỉ là chưa có gì để hiện.
 *
 * Trả về `{ ...chín trường, chuaCoCot }`. `chuaCoCot` là true khi mã đã deploy
 * mà 048 chưa chạy trên database này: PostgREST trả 42703 và HUỶ CẢ CÂU chứ
 * không bỏ qua cột lạ, nên không lùi về thì trang tài khoản trắng trơn. */
export async function loadHoSo() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(TRUONG.join(","))
    .eq("id", uid)
    .maybeSingle();

  if (error?.code === "42703") return { ...emptyProfile(), chuaCoCot: true };
  if (error) return null;
  return { ...chiChinTruong(data), chuaCoCot: false };
}

/* ── Đọc hồ sơ của MỘT học sinh — chỉ giáo viên gọi được ──
 *
 * Không cần hàm riêng ở database: `profiles_read_teacher` (003) đã cho giáo
 * viên đọc mọi dòng, còn học sinh gọi hàm này sẽ nhận về `null` vì RLS lọc
 * mất dòng. Đúng chiều hỏng cần có — hỏng theo hướng KHOÁ.
 *
 * Nhận `id` (uuid) chứ không phải tên. Học sinh chỉ được mời mà chưa đăng ký
 * thì không có `id` và cũng không có hồ sơ; chỗ gọi phải xử lý `null`. */
export async function loadHoSoHocSinh(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select(TRUONG.join(","))
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return chiChinTruong(data);
}

/* ── Ghi ──
 *
 * Trả về `{ ok }` hoặc `{ ok: false, loi }` với `loi` là mã chuỗi từ hàm SQL.
 * Giao diện tra mã sang câu chữ; không đọc lời văn lỗi của Postgres, vì lời
 * văn đổi theo phiên bản và theo ngôn ngữ máy chủ.
 *
 * GỬI ĐỦ CHÍN TRƯỜNG mỗi lần. Hàm SQL ghi cả chín, nên thiếu một trường là
 * XOÁ trường đó. Đây là lý do `chiChinTruong` chạy ở cả đường đọc lẫn đường
 * ghi: hai đầu nói cùng một hình dạng thì không có chỗ cho một trường lặng lẽ
 * biến mất. */
export async function luuHoSo(p) {
  const v = chiChinTruong(p);
  const { data, error } = await supabase.rpc("update_my_profile", {
    p_genre: v.genre || null,
    p_prenom: v.prenom || null,
    p_nom: v.nom || null,
    p_adresse: v.adresse || null,
    p_phone: v.phone || null,
    p_dob: v.dob || null,
    p_level: v.level || null,
    p_goal: v.goal || null,
    p_school: v.school || null,
  });

  /* PGRST202 = không tìm thấy hàm. Với một hàm đã khoá quyền, "chưa chạy
     migration" và "không được phép gọi" trông giống hệt nhau từ phía client —
     nên nói cả hai khả năng thay vì đoán một. */
  if (error?.code === "PGRST202") return { ok: false, loi: "chua_co_ham" };
  if (error) return { ok: false, loi: "mang", chiTiet: error.message };
  if (data?.ok) return { ok: true };
  return { ok: false, loi: data?.error || "khong_ro" };
}
