/* Luật đặt tên hiển thị và @username. THUẦN, không import gì.
 *
 * Tách khỏi identity.js vì file đó `import { supabase } from storageShim.js`,
 * mà storageShim đọc `import.meta.env` — chạy được trong Vite, nổ ngay khi
 * `node` nạp nó. Nghĩa là gộp chung thì `check:identity` không kiểm được luật
 * nào cả, và phần dễ sai nhất (biểu thức chính quy, chuẩn hoá dấu) thành phần
 * duy nhất không có ai canh.
 *
 * Cùng lý do đã khiến exerciseMap.js không import gì. */

/* ══ DẠNG USERNAME ══
 *
 * Chuỗi này PHẢI khớp TỪNG KÝ TỰ với ràng buộc `profiles_username_dang` trong
 * migration 046. `check:identity` đọc cả hai file và so.
 *
 * Lệch nhau không làm gì hỏng ngay — nó chỉ khiến giao diện báo hợp lệ rồi
 * database từ chối, và người dùng không có cách nào biết vì sao. Kiểu lỗi tệ
 * nhất trong biểu mẫu: quy tắc nói một đằng, hệ thống làm một nẻo.
 *
 * Không bắt đầu bằng số, để `@123` không lẫn với một mã số nào đó về sau. */
export const DANG_USERNAME = "^[a-z_][a-z0-9_]{2,19}$";
export const USERNAME_TOI_THIEU = 3;
export const USERNAME_TOI_DA = 20;
export const TEN_HIEN_THI_TOI_DA = 40;

const RE_USERNAME = new RegExp(DANG_USERNAME);

/* Bỏ dấu tiếng Việt và tiếng Pháp trước khi lọc ký tự.
 *
 * Thiếu bước này thì « Đỗ Quốc Hùng » ra `_qu_c_h_ng` — mỗi chữ có dấu thành
 * một gạch dưới, và gợi ý trở nên vô dụng đúng với những cái tên cần nó nhất.
 *
 * NFD tách « ế » thành « e » + dấu kết hợp, rồi xoá dải U+0300–U+036F. Viết
 * bằng mã \u chứ không dán ký tự dấu vào regex: dấu kết hợp không nhìn thấy
 * được trong trình soạn thảo, nên một lần sao chép nhầm là không ai phát hiện.
 *
 * « đ/Đ » không phải chữ có dấu mà là một chữ cái riêng — NFD không tách được,
 * phải thay tay. Đây chính là chữ hay bị bỏ sót nhất trong tên tiếng Việt. */
const boDau = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

/* Gợi ý username từ một cái tên. Chỉ để điền sẵn — người dùng sửa thoải mái. */
export function goiYUsername(ten) {
  const s = boDau(ten || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, USERNAME_TOI_DA);
  if (!s) return "";
  /* Quá ngắn thì đệm thêm. Trả về một gợi ý mà chính nó không hợp lệ là mời
     người dùng bấm Lưu rồi nhận lỗi. */
  return s.length < USERNAME_TOI_THIEU ? (s + "___").slice(0, USERNAME_TOI_THIEU) : s;
}

/* Chuẩn hoá thứ người dùng đang gõ: bỏ khoảng trắng, bỏ « @ » đầu, thường hoá.
 *
 * KHÔNG lọc ký tự lạ ở đây. Vừa gõ vừa bị xoá ký tự thì con trỏ nhảy lung tung
 * và không ai hiểu chuyện gì đang xảy ra — cứ để họ gõ « é », rồi nói rõ là
 * không dùng được. */
export const chuanHoaUsername = (s) =>
  String(s ?? "").trim().replace(/^@+/, "").toLowerCase();

/* Trả về MÃ lỗi, không phải câu chữ. Câu chữ nằm ở i18n theo ba thứ tiếng, và
   file này phải chạy được dưới node nơi không có React context nào. */
export function kiemUsername(raw) {
  const u = chuanHoaUsername(raw);
  if (!u) return { ok: true, username: "", loi: null };        // bỏ trống là hợp lệ
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
