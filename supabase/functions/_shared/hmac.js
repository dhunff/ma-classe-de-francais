/* Xác minh chữ ký HMAC-SHA256 của webhook.
 *
 * JS thuần, chỉ dùng Web Crypto — nên chạy được cả trong Deno (Edge Function)
 * lẫn Node ≥18 (bộ kiểm). Nhờ vậy logic mật mã được KIỂM THẬT bằng
 * `npm run check:hmac`, thay vì chỉ đọc mã rồi tin.
 *
 * ══ HMAC HƠN API KEY Ở ĐÂU ══
 *
 * Với API Key, bí mật đi kèm MỌI request. Ai chặn được đường truyền là có luôn
 * nó, và từ đó tự gọi webhook để cấp quyền cho mình.
 *
 * Với HMAC, bí mật KHÔNG BAO GIỜ rời khỏi hai đầu. SePay dùng nó để ký nội
 * dung rồi chỉ gửi chữ ký. Chữ ký lại phụ thuộc từng byte của nội dung, nên
 * sửa một chữ số tiền là chữ ký hỏng — thứ mà API Key không phát hiện được.
 *
 * ══ KÝ TRÊN BODY THÔ ══
 *
 * Phải ký đúng chuỗi byte nhận được, KHÔNG phải object đã parse rồi serialize
 * lại. `JSON.parse` rồi `JSON.stringify` có thể đổi thứ tự khoá, khoảng trắng,
 * cách escape unicode — chữ ký sẽ khác dù dữ liệu y hệt, và lỗi đó chỉ xuất
 * hiện với vài payload nhất định nên rất khó truy.
 */

const enc = new TextEncoder();

/* So sánh không phụ thuộc vị trí khác nhau đầu tiên.
 *
 * `a === b` thoát ngay khi gặp byte lệch, nên thời gian trả lời rò rỉ độ dài
 * tiền tố đúng. Kẻ tấn công đoán được từng ký tự một là dò ra cả chữ ký.
 * Ở đây luôn duyệt hết, và gộp bằng OR nên không rẽ nhánh sớm. */
export function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function rawHmac(secret, body) {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body)));
}

const toHex = (buf) =>
  [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");

const toBase64 = (buf) => {
  let s = "";
  for (const b of buf) s += String.fromCharCode(b);
  return btoa(s);
};

/* Chữ ký dạng hex — dạng phổ biến nhất, và là dạng bộ kiểm dùng. */
export async function signHex(secret, body) {
  return toHex(await rawHmac(secret, body));
}

export async function signBase64(secret, body) {
  return toBase64(await rawHmac(secret, body));
}

/* Xác minh, chấp nhận cả hex lẫn base64.
 *
 * Nhận cả hai vì mỗi nhà cung cấp chọn một dạng, và đoán sai thì triệu chứng
 * là "chữ ký luôn sai" — không phân biệt được với "bí mật sai". Thử cả hai tốn
 * thêm một phép băm và bỏ được cả một loại nhầm lẫn.
 *
 * Tiền tố kiểu `sha256=` cũng được bóc: một số nhà gửi kèm tên thuật toán. */
export async function verifySignature(secret, body, provided) {
  if (!secret || typeof provided !== "string" || !provided) return false;
  const got = provided.trim().replace(/^sha256[=\s]/i, "").trim();

  const buf = await rawHmac(secret, body);
  return safeEqual(got.toLowerCase(), toHex(buf).toLowerCase())
      || safeEqual(got, toBase64(buf));
}

/* ══ KÝ TRÊN CHUỖI NÀO ══
 *
 * Biết bí mật và biết thuật toán vẫn chưa đủ: phải biết nhà cung cấp ký trên
 * ĐÚNG chuỗi nào. SePay gửi kèm `x-sepay-timestamp`, và một timestamp chỉ có
 * ích nếu nó nằm trong phần được ký — nếu không, kẻ tấn công sửa nó tuỳ ý và
 * nó chẳng chống được gì.
 *
 * Không có tài liệu SePay trong tay, nên thay vì đoán MỘT công thức rồi hỏng
 * im lặng, ta thử các cách thông dụng và TRẢ VỀ TÊN cách đã khớp. Lần chạy
 * thật đầu tiên sẽ nói cho ta biết sự thật, và khi đó ghim lại đúng một cách.
 *
 * Thử nhiều cách KHÔNG làm yếu bảo mật: mỗi cách vẫn là một phép xác minh HMAC
 * đầy đủ với cùng bí mật. Không biết bí mật thì không giả được cách nào. */
export function candidateBodies(raw, timestamp) {
  const c = [{ label: "raw", value: raw }];
  if (timestamp) {
    c.push({ label: "ts.raw", value: `${timestamp}.${raw}` });   // kiểu Stripe
    c.push({ label: "ts+raw", value: `${timestamp}${raw}` });
    c.push({ label: "raw+ts", value: `${raw}${timestamp}` });
  }
  return c;
}

/* Trả về nhãn của cách khớp, hoặc null. Nhãn đi vào phản hồi để ta đọc được
   từ lần gọi thật đầu tiên. */
export async function verifyAny(secret, candidates, provided) {
  for (const c of candidates) {
    if (await verifySignature(secret, c.value, provided)) return c.label;
  }
  return null;
}

/* Timestamp còn tươi không.
 *
 * ══ CỬA SỔ RỘNG, VÀ ĐÂY LÀ LÝ DO ══
 *
 * Công dụng của timestamp là chặn PHÁT LẠI: kẻ bắt được một request hợp lệ gửi
 * lại nó về sau. Nhưng ở đây phát lại gần như vô hại — `exercise_access.ref` là
 * UNIQUE, nên gửi lại cùng giao dịch chỉ ra `duplicate: true`, không cấp thêm
 * quyền cho ai.
 *
 * Trong khi đó, cửa sổ HẸP có hại thật: nút « Gọi lại » của SePay là thứ đang
 * được dùng để cứu những giao dịch hỏng, và nếu SePay gửi lại kèm timestamp
 * GỐC thì một cửa sổ 5 phút sẽ chặn đúng thao tác cứu vãn đó. Hôm nay đã có
 * 94.000₫ phải cứu bằng tay vì webhook từ chối.
 *
 * Nên: 24 giờ. Đủ để chặn một bản ghi cũ bị phát lại tuần sau, không đủ hẹp để
 * phá thao tác sửa lỗi trong ngày. Hàng rào chính vẫn là `ref` unique.
 *
 * Nhận cả giây lẫn mili-giây: không biết SePay dùng đơn vị nào, và đoán sai thì
 * mọi request đều "quá cũ" hoặc mọi request đều lọt. Số lớn hơn 1e12 chắc chắn
 * là mili-giây (1e12 giây là năm 33658). */
export const CUA_SO_GIAY = 24 * 60 * 60;

export function timestampConLai(timestamp, nowMs = Date.now()) {
  if (!timestamp) return { ok: true, reason: "no_timestamp" };
  const n = Number(String(timestamp).trim());
  if (!Number.isFinite(n) || n <= 0) return { ok: true, reason: "unparsable" };

  const giay = n > 1e12 ? n / 1000 : n;
  const lech = Math.abs(nowMs / 1000 - giay);
  return lech <= CUA_SO_GIAY
    ? { ok: true, age: Math.round(lech) }
    : { ok: false, reason: "timestamp_too_old", age: Math.round(lech) };
}

export const TIMESTAMP_HEADERS = ["x-sepay-timestamp", "x-timestamp", "x-webhook-timestamp"];

export function findTimestamp(headers) {
  for (const h of TIMESTAMP_HEADERS) {
    const v = headers.get(h);
    if (v) return v;
  }
  return null;
}

/* Tên header mà các nhà cung cấp hay dùng cho chữ ký.
 *
 * Tài liệu SePay không nằm trong tay lúc viết hàm này, nên thay vì đoán MỘT
 * tên rồi hỏng im lặng, ta thử cả danh sách. Khi không tìm thấy cái nào, hàm
 * gọi sẽ liệt kê TÊN các header đã nhận (không kèm giá trị) để lần sau biết
 * chính xác phải đọc cái nào. */
export const SIGNATURE_HEADERS = [
  "x-signature",
  "x-sepay-signature",
  "x-webhook-signature",
  "x-hub-signature-256",
  "signature",
];

export function findSignature(headers) {
  for (const h of SIGNATURE_HEADERS) {
    const v = headers.get(h);
    if (v) return { header: h, value: v };
  }
  return null;
}
