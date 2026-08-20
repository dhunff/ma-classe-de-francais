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

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(jsx?|mjs)$/.test(name)) files.push(p);
  }
})(SRC);

let pass = 0, fail = 0;
const loi = [];

/* Bắt lời gọi thật, không bắt chú thích: `load("mcf-practice"` chứ không phải
   chữ "mcf-practice" đứng một mình trong một câu tiếng Việt. */
const GOI_BLOB = /\b(load|save|del)\s*\(\s*["'`]mcf-(practice|exercises)["'`]/;

for (const f of files) {
  const rel = relative(ROOT, f).replace(/\\/g, "/");
  if (MIEN_TRU.some((m) => rel.includes(m))) continue;

  const lines = readFileSync(f, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const m = line.match(GOI_BLOB);
    if (m) loi.push(`${rel}:${i + 1}  ${m[1]}("mcf-${m[2]}"…)  → dùng exerciseStore.js`);
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

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
