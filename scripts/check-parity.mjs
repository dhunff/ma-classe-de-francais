/* Bộ chấm ở máy chủ và bộ chấm ở trình duyệt phải là MỘT.
 *
 * Từ khi việc chấm chuyển lên Edge Function, cùng một câu trả lời đi qua hai
 * đoạn mã ở hai nơi. Nếu chúng lệch nhau, triệu chứng là thứ tệ nhất có thể:
 * học sinh làm đúng mà bị chấm sai, hoặc ngược lại, không có lỗi nào trong
 * console, không có gì đỏ, và gần như không truy ra được — vì để tái hiện thì
 * phải so hai lần chấm của cùng một câu ở hai môi trường khác nhau.
 *
 * Nên `supabase/functions/_shared/*.js` là BẢN SAO NGUYÊN VĂN của
 * `src/shared/*.js`. Bộ kiểm này so từng byte. Sửa một bên mà quên bên kia là
 * đỏ ngay, kèm lệnh copy để sửa.
 *
 * Vì sao so byte chứ không so hành vi: so hành vi chỉ phủ được những ca ta
 * nghĩ ra. So byte phủ tất cả, kể cả những ca chưa ai nghĩ tới. Hai file thuần
 * hàm, không import gì ngoài nhau, nên copy nguyên văn là chuyện làm được —
 * và khi làm được thì đó là ràng buộc chặt nhất có thể.
 *
 * Chứng minh nó bắt được lỗi: thêm một dòng trắng vào một trong hai bản rồi
 * chạy lại — phải FAIL.
 */

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const CAP = [
  ["src/shared/gradingEngine.js", "supabase/functions/_shared/gradingEngine.js"],
  ["src/shared/questions.js",     "supabase/functions/_shared/questions.js"],
];

const bam = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

let pass = 0, fail = 0;

for (const [gocPath, saoPath] of CAP) {
  if (!existsSync(gocPath)) { fail++; console.log(`  ✗ thiếu bản gốc ${gocPath}`); continue; }
  if (!existsSync(saoPath)) {
    fail++;
    console.log(`  ✗ thiếu bản sao ${saoPath}`);
    console.log(`      sửa: cp ${gocPath} ${saoPath}`);
    continue;
  }

  const a = bam(gocPath), b = bam(saoPath);
  if (a === b) {
    pass++;
    console.log(`  ✓ ${saoPath.split("/").pop()} khớp bản gốc`);
  } else {
    fail++;
    const dongA = readFileSync(gocPath, "utf8").split(/\r?\n/);
    const dongB = readFileSync(saoPath, "utf8").split(/\r?\n/);
    const i = dongA.findIndex((l, k) => l !== dongB[k]);
    console.log(`  ✗ ${saoPath} ĐÃ TRÔI khỏi ${gocPath}`);
    if (i >= 0) {
      console.log(`      lệch từ dòng ${i + 1}`);
      console.log(`      gốc: ${JSON.stringify((dongA[i] ?? "").slice(0, 70))}`);
      console.log(`      sao: ${JSON.stringify((dongB[i] ?? "").slice(0, 70))}`);
    }
    console.log(`      sửa: cp ${gocPath} ${saoPath}`);
  }
}

/* Bản sao phải thật sự dùng được trong Deno: chỉ import lẫn nhau bằng đường
   dẫn tương đối, không import gì từ src/ hay từ node_modules — Edge Function
   chỉ đóng gói thư mục supabase/functions. */
for (const [, saoPath] of CAP) {
  if (!existsSync(saoPath)) continue;
  const src = readFileSync(saoPath, "utf8");
  const xau = [...src.matchAll(/^\s*import\s[^;]*?from\s+["']([^"']+)["']/gm)]
    .map((m) => m[1])
    .filter((s) => !s.startsWith("./"));
  if (xau.length) {
    fail++;
    console.log(`  ✗ ${saoPath} import thứ Deno không thấy: ${xau.join(", ")}`);
  } else {
    pass++;
  }
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
