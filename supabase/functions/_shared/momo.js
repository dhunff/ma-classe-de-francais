/* MoMo (17/11/2026): ký và xác minh. JS THUẦN, không import gì, dùng chung cho Edge Function
 * (momo-don, momo-ipn) và bộ kiểm Node (scripts/check-momo.mjs). HMAC qua Web Crypto (Deno và Node 20+).
 *
 * Quy tắc ký của MoMo cổng v2 (developers.momo.vn; mã mẫu chính thức github.com/momo-wallet/payment):
 * ghép các cặp `khoá=giá trị` theo THỨ TỰ BẢNG CHỮ CÁI của tên khoá, nối bằng `&`, rồi HMAC-SHA256 bằng
 * secretKey, ra chuỗi hex. Tạo đơn ký 10 khoá cố định (accessKey … requestType); tra cứu ký 4 khoá.
 *
 * IPN: MoMo ký mọi trường nó gửi (trừ `signature`) cộng accessKey, cũng theo bảng chữ cái. Tài liệu của
 * MoMo hiện chặn truy cập tự động (403), nên CHƯA đối chiếu được danh sách trường của IPN với một lần
 * thanh toán thật. Vì vậy momo-ipn KHÔNG cấp VIP dựa trên chữ ký IPN: nó chỉ ghi chữ ký khớp hay không
 * (để chẩn đoán), rồi TỰ HỎI LẠI MoMo bằng API tra cứu (chính máy chủ mình gọi đi, qua HTTPS, ký bằng khoá
 * của mình). Cấp VIP chỉ khi kết quả tra cứu nói đã trả đủ tiền. */

export const MAY_CHU = { test: "https://test-payment.momo.vn", that: "https://payment.momo.vn" };

export const chuoiKy = (o) => Object.keys(o).sort().map((k) => `${k}=${o[k] ?? ""}`).join("&");

export async function hmacHex(khoa, chu) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(khoa), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(chu));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* So hai chuỗi hex không để lộ thời gian (đủ dùng cho chữ ký 64 ký tự). */
export function bangNhau(a, b) {
  a = String(a ?? ""); b = String(b ?? "");
  if (a.length !== b.length || !a.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/* Chuỗi ký khi TẠO ĐƠN: đúng 10 khoá như mã mẫu của MoMo. */
export const chuoiTaoDon = ({ accessKey, amount, extraData = "", ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType }) =>
  chuoiKy({ accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType });

/* Chuỗi ký khi TRA CỨU trạng thái đơn. */
export const chuoiTraCuu = ({ accessKey, orderId, partnerCode, requestId }) => chuoiKy({ accessKey, orderId, partnerCode, requestId });

/* Chuỗi ký của IPN: mọi trường MoMo gửi trừ `signature`, cộng accessKey (xem chú thích đầu file). */
export function chuoiIpn(than, accessKey) {
  const { signature: _bo, ...con } = than ?? {};
  return chuoiKy({ ...con, accessKey });
}

/* Mã đơn: tiền tố FRM (để màn trả về nhận ra), thời điểm, 6 ký tự ngẫu nhiên. MoMo đòi orderId duy nhất. */
export const maDonMoi = () => `FRM${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
