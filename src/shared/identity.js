import { supabase } from "../storageShim.js";

/* Danh tính người dùng: tên hiển thị, @username, ảnh đại diện.
 *
 * Ba trường này KHÔNG nằm chung với phần hồ sơ còn lại (địa chỉ, ngày sinh,
 * mục tiêu học). Phần kia lưu trong `kv_store` dưới khoá dùng chung
 * `s:mcf-profiles`, khoá theo TÊN. Ba trường này lưu trong bảng `profiles`,
 * khoá theo `auth.uid()`.
 *
 * ══ VÌ SAO TÁCH ══
 *
 * `username` phải DUY NHẤT toàn hệ thống, và giáo viên dùng nó để tìm học
 * sinh. Một object JSON dùng chung không làm được cả hai:
 *
 *   • Không ép được duy nhất. Postgres không nhìn thấy bên trong một cột
 *     `text` chứa JSON, nên "duy nhất" sẽ phải do client tự giữ — tức là không
 *     giữ được, vì hai tab mở cùng lúc là đã hỏng.
 *
 *   • Khoá theo tên thì đổi tên là mất hồ sơ. `auth.uid()` không đổi.
 *
 *   • Cả object nằm dưới một khoá dùng chung mà policy 002 cho MỌI học sinh
 *     ghi đè. Một `username` đặt ở đó không phải danh tính, nó là một ghi chú
 *     ai cũng sửa được.
 *
 * Đường ghi đi qua RPC `update_my_identity`, không phải `.update()`. Lý do đầy
 * đủ ở đầu migration 046; tóm tắt: RLS phân quyền theo dòng, nên cho học sinh
 * ghi dòng của mình là cho họ tự đặt `role = 'prof'`. */

/* ══ DẠNG USERNAME ══
 *
 * Chuỗi này PHẢI khớp từng ký tự với ràng buộc `profiles_username_dang` trong
 * migration 046. `check:identity` so hai bên.
 *
 * Lệch nhau không làm gì hỏng ngay — nó chỉ khiến giao diện báo hợp lệ rồi
 * database từ chối, và người dùng không có cách nào biết vì sao. Kiểu lỗi tệ
 * nhất trong biểu mẫu: quy tắc nói một đằng, hệ thống làm một nẻo.
 *
 * Không bắt đầu bằng số, để `@123` không bị nhầm với một mã số nào đó sau này. */
export const DANG_USERNAME = "^[a-z_][a-z0-9_]{2,19}$";
export const USERNAME_TOI_THIEU = 3;
export const USERNAME_TOI_DA = 20;
export const TEN_HIEN_THI_TOI_DA = 40;

const RE_USERNAME = new RegExp(DANG_USERNAME);

/* Bỏ dấu tiếng Việt và tiếng Pháp trước khi lọc ký tự.
 *
 * Không có bước này thì « Đỗ Quốc Hùng » ra `_qu_c_h_ng` — mỗi chữ có dấu
 * thành một gạch dưới. NFD tách « ế » thành « e » + dấu, rồi xoá dải dấu.
 * Riêng « đ/Đ » không tách được bằng NFD nên phải thay tay. */
const boDau = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"));

/* Gợi ý username từ một cái tên. Chỉ để điền sẵn — người dùng sửa thoải mái. */
export function goiYUsername(ten) {
  const s = boDau(ten || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, USERNAME_TOI_DA);
  if (!s) return "";
  /* Quá ngắn thì đệm thêm, vì trả về một gợi ý mà chính nó không hợp lệ là
     mời người dùng bấm Lưu rồi nhận lỗi. */
  return s.length < USERNAME_TOI_THIEU ? (s + "___").slice(0, USERNAME_TOI_THIEU) : s;
}

/* Chuẩn hoá thứ người dùng đang gõ: thường hoá, bỏ khoảng trắng, bỏ « @ » đầu.
 *
 * KHÔNG lọc ký tự lạ ở đây. Nếu vừa gõ vừa xoá ký tự thì con trỏ nhảy lung
 * tung và người dùng không hiểu chuyện gì đang xảy ra — cứ để họ gõ « é », rồi
 * nói rõ là không dùng được. */
export const chuanHoaUsername = (s) =>
  String(s ?? "").trim().replace(/^@+/, "").toLowerCase();

/* Kiểm dạng. Trả về mã lỗi chứ không phải câu chữ — câu chữ nằm ở i18n, và
   `check:identity` chạy bằng node thì không dựng được React context. */
export function kiemUsername(raw) {
  const u = chuanHoaUsername(raw);
  if (!u) return { ok: true, username: "", loi: null };          // bỏ trống là hợp lệ
  if (u.length < USERNAME_TOI_THIEU) return { ok: false, username: u, loi: "ngan" };
  if (u.length > USERNAME_TOI_DA) return { ok: false, username: u, loi: "dai" };
  if (/^[0-9]/.test(u)) return { ok: false, username: u, loi: "bat_dau_so" };
  if (!RE_USERNAME.test(u)) return { ok: false, username: u, loi: "ky_tu_la" };
  return { ok: true, username: u, loi: null };
}

export function kiemTenHienThi(raw) {
  const s = String(raw ?? "").trim();
  if (s.length > TEN_HIEN_THI_TOI_DA) return { ok: false, loi: "dai" };
  return { ok: true, loi: null };
}

/* ── Đọc danh tính của chính mình ──
 *
 * `maybeSingle` chứ không `single`: người dùng vừa đăng ký bằng Google có thể
 * chưa kịp có dòng trong `profiles` (trigger chạy sau), và `single` thì ném
 * lỗi. Không có hồ sơ không phải sự cố — nó chỉ là chưa có gì để hiện. */
export async function loadDanhTinh() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, display_name, username, avatar")
    .eq("id", uid)
    .maybeSingle();

  /* 42703 = cột chưa tồn tại: mã đã deploy nhưng 046 chưa chạy. PostgREST huỷ
     CẢ CÂU chứ không bỏ qua cột lạ, nên không lùi về thì trang tài khoản trắng
     trơn. Lùi về đọc các cột cũ, và báo cho giao diện biết bằng `chuaCoCot`. */
  if (error?.code === "42703") {
    const lai = await supabase
      .from("profiles").select("id, name, email").eq("id", uid).maybeSingle();
    return lai.data ? { ...lai.data, display_name: null, username: null, avatar: null, chuaCoCot: true } : null;
  }
  if (error) return null;
  return data;
}

/* ── Còn trống không? ──
 *
 * Đi qua RPC, không phải `select`. RLS chỉ cho học sinh thấy dòng của chính
 * mình, nên một câu `select … where username = 'marie'` luôn trả về rỗng —
 * kể cả khi Marie đã tồn tại — và giao diện sẽ hiện dấu tích xanh cho một
 * username đã có người lấy.
 *
 * Trả về `null` khi KHÔNG BIẾT (mất mạng, chưa chạy 046). Ba trạng thái, không
 * phải hai: còn trống / đã có / chưa kiểm được. Gộp "chưa kiểm được" vào "còn
 * trống" là nói dối lúc mạng chập chờn. */
export async function usernameConTrong(username) {
  const u = chuanHoaUsername(username);
  if (!u) return null;
  const { data, error } = await supabase.rpc("username_available", { p_username: u });
  if (error) return null;
  return data === true;
}

/* ── Ghi ──
 *
 * Trả về `{ ok }` hoặc `{ ok: false, loi }` với `loi` là mã chuỗi từ hàm SQL.
 * Giao diện tra mã sang câu chữ; không đọc lời văn lỗi của Postgres, vì lời
 * văn đổi theo phiên bản và theo ngôn ngữ của máy chủ. */
export async function luuDanhTinh({ displayName, username, avatar }) {
  const { data, error } = await supabase.rpc("update_my_identity", {
    p_display_name: displayName ?? null,
    p_username: chuanHoaUsername(username) || null,
    p_avatar: avatar || null,
  });

  /* PGRST202 = không tìm thấy hàm. Với một hàm đã khoá quyền, "chưa chạy
     migration" và "không được phép gọi" trông giống hệt nhau từ phía client —
     nên nói cả hai khả năng thay vì đoán một. */
  if (error?.code === "PGRST202") return { ok: false, loi: "chua_co_ham" };
  if (error) return { ok: false, loi: "mang", chiTiet: error.message };
  if (data?.ok) return { ok: true };
  return { ok: false, loi: data?.error || "khong_ro" };
}
