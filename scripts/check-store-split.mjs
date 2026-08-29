/* Ngân hàng đề phải đọc và ghi CÙNG MỘT nguồn.
 *
 * Bộ kiểm này sinh ra từ việc nối ứng dụng vào bảng `exercises`/`questions`
 * (migration 010). Nguy cơ thật của lần chuyển đó không phải build đỏ — mà là
 * chuyển một nửa: màn hình A đọc bảng, màn hình B còn ghi blob. Không có gì
 * nổ. Giáo viên sửa bài, học sinh thấy bản cũ, và phải vài ngày sau mới có
 * người nhận ra. Chính xác chuyện đã xảy ra với `explanation`: migration
 * 012–014 ghi vào bảng suốt ba lượt trong khi ứng dụng vẫn đọc blob.
 *
 * Nên bộ kiểm quét MÃ NGUỒN, không quét dữ liệu: mọi lối vào kho đề phải đi
 * qua shared/exerciseStore.js.
 *
 * Chứng minh nó bắt được lỗi: đổi một dòng trong PracticeHub về
 * `load("mcf-practice", [])` rồi chạy lại — phải FAIL.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SRC = join(ROOT, "src");

/* preview.jsx cố ý dùng dữ liệu giả, không chạm database. Còn exerciseStore.js
   là chính lớp thay thế — tên khoá cũ nằm trong chú thích giải thích lý do. */
const MIEN_TRU = ["preview.jsx", "preview", "shared/exerciseStore.js"];

/* QUÉT CẢ supabase/functions, không chỉ src/.
 *
 * Bản đầu chỉ quét src/ và vì thế bỏ lọt đúng lỗi nghiêm trọng nhất của lần
 * chuyển đổi: `sepay-webhook` vẫn đọc hai blob để tìm bài tập và giá. Mọi bài
 * tạo sau khi nối bảng đều không có trong blob, nên webhook trả
 * `exercise_not_found` và học sinh trả tiền xong không được cấp quyền — màn
 * chờ quay mãi, không ai biết vì sao.
 *
 * Bài học: "chuyển nguồn dữ liệu" nghĩa là đi hết MỌI nơi đọc nó. Mã chạy trên
 * máy chủ không nằm trong src/, và bộ kiểm chỉ nhìn src/ thì mù đúng chỗ đó. */
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(jsx?|mjs|ts)$/.test(name)) files.push(p);
  }
})(SRC);
walk2(join(ROOT, "supabase", "functions"));
function walk2(dir) {
  let ds; try { ds = readdirSync(dir); } catch { return; }
  for (const name of ds) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk2(p);
    else if (/\.(ts|jsx?|mjs)$/.test(name)) files.push(p);
  }
}

let pass = 0, fail = 0;
const loi = [];

/* Bắt lời gọi thật, không bắt chú thích: `load("mcf-practice"` chứ không phải
   chữ "mcf-practice" đứng một mình trong một câu tiếng Việt. */
const GOI_BLOB = /\b(load|save|del)\s*\(\s*["'`]mcf-(practice|exercises)["'`]/;

/* Edge Function không dùng `load()` — nó truy vấn kv_store thẳng bằng khoá
   `"s:mcf-practice"`. Mẫu trên không bắt được hình dạng đó, và đúng vì thế mà
   `sepay-webhook` đọc blob suốt một thời gian dài mà bộ kiểm vẫn xanh. */
const KHOA_BLOB = /["'`]s:mcf-(practice|exercises)["'`]/;

for (const f of files) {
  const rel = relative(ROOT, f).replace(/\\/g, "/");
  if (MIEN_TRU.some((m) => rel.includes(m))) continue;

  const lines = readFileSync(f, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    /* Bỏ qua dòng CHÚ THÍCH. Bản đầu của mẫu `KHOA_BLOB` bắt trúng chính đoạn
       chú thích giải thích vì sao không được đọc blob nữa — bộ kiểm báo lỗi ở
       đúng dòng nói rằng lỗi đã được sửa. Một bộ kiểm kêu oan thì người ta học
       cách ngó lơ nó, và khi đó nó vô dụng. */
    const t = line.trimStart();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return;

    const m = line.match(GOI_BLOB);
    if (m) loi.push(`${rel}:${i + 1}  ${m[1]}("mcf-${m[2]}"…)  → dùng exerciseStore.js`);

    const k = line.match(KHOA_BLOB);
    if (k) {
      loi.push(`${rel}:${i + 1}  đọc thẳng khoá blob "s:mcf-${k[1]}"`
        + `  → truy vấn bảng exercises (blob đã đóng băng từ migration 010)`);
    }
  });
}

if (loi.length) { fail += loi.length; loi.forEach((l) => console.log("  ✗ " + l)); }
else { pass++; console.log("  ✓ không còn lời gọi blob nào cho kho đề"); }

/* Lớp thay thế phải thật sự xuất đủ các thao tác — thiếu một cái là chỗ gọi
   tương ứng buộc phải quay về blob. */
const store = readFileSync(join(SRC, "shared/exerciseStore.js"), "utf8");
for (const fn of ["loadPractice", "loadAssignments", "saveExercise",
                  "deleteExercise", "patchExerciseMeta", "clearFolder"]) {
  if (new RegExp(`export (async function|function|const) ${fn}\\b`).test(store)) {
    pass++;
  } else {
    fail++;
    console.log(`  ✗ exerciseStore.js thiếu ${fn}`);
  }
}

/* Ranh giới hai kho phải còn nguyên: gộp lại là thư viện luyện tập nuốt cả
   bài đang giao (ràng buộc 2 của migration 010). */
if (/store\s*===?\s*["'`]assignment["'`]|loadExercises\(["'`]assignment["'`]\)/.test(store)) pass++;
else { fail++; console.log("  ✗ không thấy kho 'assignment' được phân biệt"); }


/* Từ migration 022, cột `answer_key` không cấp SELECT cho anon/authenticated.
   PostgREST khai triển `select("*")` thành MỌI cột, kể cả cột bị khoá, nên cả
   câu truy vấn trả 401 — không phải trả về ít cột hơn. Một dấu sao là cả thư
   viện bài tập trắng xoá. Đã xảy ra thật, ngay sau khi chạy 022. */
const saoTrenQuestions = /from\(\s*["'`]questions["'`]\s*\)[\s\S]{0,40}?\.select\(\s*["'`]\*/;
if (saoTrenQuestions.test(store)) {
  fail++;
  console.log("  ✗ exerciseStore.js dùng select(\"*\") trên questions — sẽ 401 vì answer_key bị khoá");
} else {
  pass++;
}
/* ── saveExercise phải ĐẾM LẠI trước khi báo thành công ──
 *
 * Nó xoá sạch câu hỏi rồi chèn lại, và PostgREST không cho transaction. Chèn
 * hỏng sau khi xoá xong thì bài tập còn nguyên mà mất hết câu hỏi — nếu lúc đó
 * vẫn trả { ok: true }, giáo viên đóng tab và bài thành vỏ rỗng.
 *
 * Đã xảy ra với saveExam: "✅ Đã lưu đề" cho một việc chưa làm, phát hiện ở
 * chỗ khác và muộn hơn nhiều. Ca này canh không cho ai lặng lẽ gỡ lớp đếm lại
 * để tiết kiệm một vòng mạng.
 *
 * Kiểm bằng văn bản: chỉ soi RIÊNG thân hàm saveExercise, vì cả file có nhiều
 * chỗ đếm khác và một phép tìm trên toàn file sẽ xanh nhầm. */
{
  const dau = store.indexOf("export async function saveExercise");
  const sau = store.indexOf("export async function deleteExercise");
  const than = dau >= 0 && sau > dau ? store.slice(dau, sau) : "";

  const coDem = /count:\s*["'`]exact["'`]/.test(than) && /head:\s*true/.test(than);
  if (coDem) pass++;
  else { fail++; console.log("  ✗ saveExercise không đếm lại sau khi ghi"); }

  /* Đếm rồi mà không SO thì cũng như không. */
  if (/count\s*!==?\s*qRows\.length/.test(than)) pass++;
  else { fail++; console.log("  ✗ saveExercise đếm nhưng không so với số câu đã gửi"); }
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
