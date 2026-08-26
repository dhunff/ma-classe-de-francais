/* Kiểm webhook SePay mà KHÔNG cấp quyền thật, và không lộ bí mật.
 *
 * ══ CÁCH DÙNG ══
 *
 *   SEPAY_HMAC_SECRET=... node scripts/test-webhook.mjs
 *
 * Trên PowerShell:
 *   $env:SEPAY_HMAC_SECRET="..."; node scripts/test-webhook.mjs
 *
 * Bí mật đọc từ biến môi trường, không bao giờ được in ra và không ghi vào file
 * nào. Đừng dán nó vào mã, đừng commit, đừng gửi cho ai — kể cả tôi.
 *
 * ══ VÌ SAO GỬI SỐ TIỀN 0 ══
 *
 * Webhook xử lý theo thứ tự: xác thực chữ ký → đọc memo → tìm học sinh → TÌM
 * BÀI TẬP → đối chiếu giá → cấp quyền.
 *
 * Gửi `transferAmount: 0` thì nó đi qua được bước tìm bài rồi dừng ở bước đối
 * chiếu giá. Nghĩa là ta kiểm chứng được đúng thứ vừa sửa — bài có tìm thấy
 * trong BẢNG hay không — mà KHÔNG ghi một dòng quyền nào. Không có dữ liệu giả
 * nào rơi vào lớp học thật.
 *
 * ══ ĐỌC KẾT QUẢ ══
 *
 *   exercise_not_found  → LỖI CŨ CÒN NGUYÊN. Webhook vẫn không thấy bài.
 *   exercise_not_paid   → ĐÃ SỬA. Tìm thấy bài, nhưng bài đó chưa bật trả phí.
 *   amount_too_low      → ĐÃ SỬA, và bài có giá. Đây là kết quả tốt nhất.
 *   student_not_found   → tên trong memo không khớp học sinh nào.
 *   unauthorized        → chữ ký sai, bí mật lệch, hoặc công thức ký đã đổi.
 */

import { readFileSync } from "node:fs";

import { signHex } from "../supabase/functions/_shared/hmac.js";

/* Chỉ còn một cách: HMAC. Nhánh API Key đã gỡ khỏi webhook, nên script giữ nó
   chỉ tạo ra một phép thử luôn thất bại và một thông báo lỗi nói sai nguyên
   nhân. */
const hmacSecret = process.env.SEPAY_HMAC_SECRET;

if (!hmacSecret) {
  console.log("Chưa đặt SEPAY_HMAC_SECRET.\n\n"
    + '  PowerShell: $env:SEPAY_HMAC_SECRET="..."; npm run test:webhook\n'
    + "  bash:       SEPAY_HMAC_SECRET=... npm run test:webhook");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split(/\r?\n/).filter(Boolean)
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_BASE = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;

/* Giống hệt `memoSafe` trong src/shared/access.js và `normalize` trong webhook.
   Lệch một ký tự là memo không khớp và không ai biết vì sao. */
const normalize = (s) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d").replace(/[^A-Za-z0-9]/g, "").toUpperCase();

/* Lấy một bài CHỈ có trong bảng, không có trong blob — đó là loại bài mà
   webhook cũ không bao giờ tìm thấy. Nếu bài đó cho ra `exercise_not_found`
   thì bản vá chưa ăn. */
const exRes = await fetch(`${URL_BASE}/rest/v1/exercises?select=id,title,meta&order=id.desc`,
  { headers: { apikey: ANON } });
const exs = await exRes.json();
if (!Array.isArray(exs) || !exs.length) {
  console.log("✗ không đọc được danh sách bài tập");
  process.exit(1);
}

const blobRes = await fetch(
  `${URL_BASE}/rest/v1/kv_store?select=value&key=in.(s:mcf-practice,s:mcf-exercises)`,
  { headers: { apikey: ANON } });
const trongBlob = new Set();
for (const r of await blobRes.json()) {
  try { for (const x of JSON.parse(r.value)) trongBlob.add(x.id); } catch { /* bỏ qua */ }
}

const chiCoOBang = exs.filter((e) => !trongBlob.has(e.id));
const bai = chiCoOBang[0] ?? exs[0];
const laPhepThuThat = !trongBlob.has(bai.id);

console.log(`Bài thử: ${bai.id}  «${String(bai.title).slice(0, 34)}»`);
console.log(laPhepThuThat
  ? "  → bài này KHÔNG có trong blob: đúng loại mà webhook cũ bỏ sót."
  : "  ⚠ mọi bài đều có trong blob, nên phép thử này yếu hơn — hãy tạo một bài mới rồi chạy lại.");

const memo = `LMS TEST ${normalize(bai.id).slice(-6)}`;
console.log(`Memo gửi đi: ${memo}   ·   số tiền: 0 (cố ý, để KHÔNG cấp quyền)\n`);

/* Ký trên ĐÚNG chuỗi sẽ gửi đi. Dựng body trước, ký nó, rồi gửi chính chuỗi đó
   — không serialize lại lần thứ hai, vì hai lần stringify có thể ra hai chuỗi
   khác nhau và chữ ký sẽ hỏng dù dữ liệu y hệt. */
const body = JSON.stringify({ content: memo, transferAmount: 0, referenceCode: "TEST-DRY-RUN" });

/* Ký ĐÚNG công thức webhook đã ghim: `timestamp + "." + body`, kiểu Stripe.
 *
 * Trước đây script ký body trần và webhook thì thử cả bốn công thức, nên nó
 * vẫn qua. Từ khi webhook ghim `ts.raw`, ký body trần là 401 — và triệu chứng
 * sẽ trông y hệt "bí mật sai", tức là bộ kiểm sẽ nói dối về nguyên nhân.
 * Muốn giả được SePay thì phải giả cho giống. */
const ts = String(Math.floor(Date.now() / 1000));

const headers = {
  "Content-Type": "application/json",
  apikey: ANON,
  "x-sepay-timestamp": ts,
  "x-sepay-signature": await signHex(hmacSecret, `${ts}.${body}`),
};
console.log("Xác thực: HMAC-SHA256, công thức ts.raw (x-sepay-signature)\n");

const res = await fetch(`${URL_BASE}/functions/v1/sepay-webhook`, {
  method: "POST", headers, body,
});

/* Tên khác `body` — biến đó đang giữ chuỗi ĐÃ KÝ. Đặt trùng tên thì chữ ký
   tính trên một thứ, còn thứ gửi đi là thứ khác, và lỗi ấy chỉ lộ ra bằng
   "chữ ký luôn sai" mà không rõ vì sao. */
const traLoi = await res.text();
console.log(`HTTP ${res.status}`);
console.log(traLoi.slice(0, 400));

const ok = /exercise_not_paid|amount_too_low|student_not_found/.test(traLoi);
const hong = /exercise_not_found/.test(traLoi);

console.log("");
if (hong) {
  console.log("✗ VẪN HỎNG — webhook không tìm thấy bài trong bảng `exercises`.");
  process.exit(1);
} else if (/unauthorized/.test(traLoi)) {
  console.log([
    "✗ Chữ ký bị từ chối. Đọc các trường trong phản hồi ở trên:",
    "    hmac_configured=false        → chưa đặt SEPAY_HMAC_SECRET bên Supabase",
    "    signature_header_found=null  → tên header chữ ký ngoài danh sách đã biết",
    "    format_would_match=<nhãn>    → bí mật ĐÚNG, nhưng công thức ký đã đổi;",
    "                                   sửa CONG_THUC trong webhook cho khớp nhãn đó",
    "    format_would_match=null      → hai đầu đang giữ hai chuỗi bí mật khác nhau",
  ].join("\n"));
  process.exit(1);
} else if (ok) {
  console.log("✓ Webhook TÌM THẤY bài trong bảng. Bản vá đã ăn, và không dòng quyền nào được ghi.");
} else {
  console.log("? Kết quả lạ — đọc phần chú thích đầu file để đối chiếu.");
  process.exit(1);
}
