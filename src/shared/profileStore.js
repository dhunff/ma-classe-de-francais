import { supabase } from "../storageShim.js";
import { emptyProfile } from "./profile.js";
import { load, save } from "./storage.js";

/* Hồ sơ mở rộng — địa chỉ, điện thoại, ngày sinh, trường, trình độ, mục tiêu.
 *
 * ══ VÌ SAO KHÔNG CÒN Ở kv_store ══
 *
 * Trước migration 049, cả chín trường này nằm trong MỘT object JSON dưới khoá
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
 * 051 và 046; tóm tắt: RLS phân quyền theo dòng, nên cho học sinh ghi dòng của
 * mình đồng thời là cho họ tự đặt `role = 'prof'` và `has_premium_access`.
 *
 * Cùng khuôn với `identity.js`. Hai file tách nhau vì hai nhóm trường có luật
 * khác nhau — `username` phải duy nhất toàn hệ thống, chín trường này thì
 * không — và gộp lại thì một hàm SQL phải mang mười hai tham số. */

/* Chín trường, đúng thứ tự tham số của `update_my_profile`. Danh sách này phải
   khớp với `PROFILE_FIELDS` trong profile.js và với chín cột của migration
   049 — `check:identity` so cả ba. */
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
 * mà 049 chưa chạy trên database này: PostgREST trả 42703 và HUỶ CẢ CÂU chứ
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

  /* ── Cột chưa có: ĐỌC LẠI TỪ BLOB CŨ, đừng trả về hồ sơ rỗng ──
   *
   * Bản đầu trả `emptyProfile()` kèm cờ `chuaCoCot`. Không sập, nhưng nó biến
   * một quãng "mã đã deploy, migration chưa chạy" thành quãng mà MỌI học sinh
   * mở trang Tài khoản và thấy địa chỉ, số điện thoại, ngày sinh của mình
   * trắng trơn. Dữ liệu vẫn còn nguyên trong `kv_store`, nhưng người dùng
   * không biết điều đó — họ thấy hồ sơ mình biến mất.
   *
   * Tệ hơn nữa: nếu ai đó bấm Lưu trong quãng ấy trên một bản không có nhánh
   * lùi ở đường GHI, hồ sơ rỗng sẽ ghi đè bản thật.
   *
   * Nên: cột chưa có thì lùi hẳn về đường cũ, cả đọc lẫn ghi. Ứng dụng chạy y
   * như trước migration, và tự chuyển sang cột ngay khi 049 chạy — không cần
   * canh thứ tự deploy với thứ tự chạy migration. Đó cũng chính là điều
   * CLAUDE.md dặn: giữ blob làm sao lưu, chỉ chuyển ứng dụng sau khi hai số
   * đối chiếu khớp. */
  if (error?.code === "42703") {
    const cu = await docBlobCu();
    return { ...emptyProfile(), ...cu, chuaCoCot: true };
  }
  if (error) return null;
  return { ...chiChinTruong(data), chuaCoCot: false };
}

/* Cột đã có hay chưa? Hỏi MỘT LẦN cho cả phiên rồi nhớ lại.
 *
 * Đường ghi cần biết điều này trước khi quyết ghi đi đâu, và hỏi lại ở mỗi lần
 * bấm Lưu là một vòng mạng thừa. Nhớ theo phiên chứ không theo module-load:
 * người vận hành chạy 049 giữa chừng thì chỉ cần tải lại trang, không phải
 * deploy lại.
 *
 * Mặc định khi KHÔNG BIẾT là "thiếu cột" — tức là đi đường cũ. Đoán sai theo
 * hướng đó thì ghi vào blob, dữ liệu vẫn còn và chép sang được bằng 050. Đoán
 * sai theo hướng kia thì lời gọi RPC hỏng và người dùng mất bản vừa sửa. */
let coCot = null;
async function thieuCot() {
  if (coCot !== null) return !coCot;
  const { error } = await supabase.from("profiles").select(TRUONG[0]).limit(1);
  coCot = error?.code !== "42703";
  return !coCot;
}

/* ── Đường cũ, chỉ dùng khi 049 chưa chạy ──
 *
 * Khoá theo TÊN vì blob cũ khoá như vậy. Đây là một trong những lý do phải bỏ
 * nó: đổi tên là mất hồ sơ. Giữ lại ở đây đúng chừng nào database chưa có cột,
 * và xoá được ngay khi `check:db` báo chín cột đã có.
 *
 * `name` lấy từ phiên đăng nhập chứ không nhận từ chỗ gọi — chỗ gọi truyền tên
 * người khác vào thì đây thành cửa đọc hồ sơ của người khác, đúng lỗ hổng mà
 * cả việc này sinh ra để bịt. */
async function docBlobCu() {
  const { data: u } = await supabase.auth.getUser();
  const ten = u?.user?.user_metadata?.name
    || u?.user?.user_metadata?.full_name
    || (u?.user?.email || "").split("@")[0];
  if (!ten) return {};
  const all = await load("mcf-profiles", {});
  return chiChinTruong((all && all[ten]) || {});
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

  /* Cột chưa có thì ghi vào blob cũ, y như trước. Cặp với nhánh lùi ở đường
     đọc: hai đầu phải cùng nhìn vào một chỗ, nếu không thì đọc ra dữ liệu cũ
     rồi ghi vào chỗ mới, và bản người dùng vừa sửa biến mất khi tải lại.
     Đọc-rồi-ghi-đè cả object vẫn là lỗ hổng — nhưng nó là lỗ hổng ĐANG CÓ, và
     quãng này chỉ kéo dài tới lúc 049 chạy. Thêm một hồ sơ rỗng đè lên bản
     thật thì mới là làm hỏng thêm. */
  if (await thieuCot()) {
    const { data: u } = await supabase.auth.getUser();
    const ten = u?.user?.user_metadata?.name
      || u?.user?.user_metadata?.full_name
      || (u?.user?.email || "").split("@")[0];
    if (!ten) return { ok: false, loi: "not_signed_in" };
    const all = await load("mcf-profiles", {});
    const xong = await save("mcf-profiles", { ...all, [ten]: { ...(all[ten] || {}), ...v } });
    return xong ? { ok: true, duongCu: true } : { ok: false, loi: "mang" };
  }

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
