/* Kiểm webhook SePay mà KHÔNG cấp quyền thật, và không lộ token.
 *
 * ══ CÁCH DÙNG ══
 *
 *   SEPAY_TOKEN=... node scripts/test-webhook.mjs
 *
 * Trên PowerShell:
 *   $env:SEPAY_TOKEN="..."; node scripts/test-webhook.mjs
 *
 * Token đọc từ biến môi trường, không bao giờ được in ra và không ghi vào file
 * nào. Đừng dán nó vào mã, đừng commit, đừng gửi cho ai — kể cả tôi.
 *
 * ══ VÌ SAO GỬI SỐ TIỀN 0 ══
 *
 * Webhook xử lý theo thứ tự: xác thực token → đọc memo → tìm học sinh → TÌM
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
 *   unauthorized        → token sai hoặc chưa đặt.
 */

import { readFileSync } from "node:fs";

const token = process.env.SEPAY_TOKEN;
if (!token) {
  console.log("Chưa có SEPAY_TOKEN.\n"
    + "  bash:       SEPAY_TOKEN=... node scripts/test-webhook.mjs\n"
    + "  PowerShell: $env:SEPAY_TOKEN=\"...\"; node scripts/test-webhook.mjs");
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

const res = await fetch(`${URL_BASE}/functions/v1/sepay-webhook`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: ANON,
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ content: memo, transferAmount: 0, referenceCode: "TEST-DRY-RUN" }),
});

const body = await res.text();
console.log(`HTTP ${res.status}`);
console.log(body.slice(0, 400));

const ok = /exercise_not_paid|amount_too_low|student_not_found/.test(body);
const hong = /exercise_not_found/.test(body);

console.log("");
if (hong) {
  console.log("✗ VẪN HỎNG — webhook không tìm thấy bài trong bảng `exercises`.");
  process.exit(1);
} else if (/unauthorized/.test(body)) {
  console.log("✗ Token không đúng, hoặc SEPAY_TOKEN trên máy khác với secret trên Supabase.");
  process.exit(1);
} else if (ok) {
  console.log("✓ Webhook TÌM THẤY bài trong bảng. Bản vá đã ăn, và không dòng quyền nào được ghi.");
} else {
  console.log("? Kết quả lạ — đọc phần chú thích đầu file để đối chiếu.");
  process.exit(1);
}
