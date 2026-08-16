/* Dò hook React đặt SAU một `return` sớm trong cùng component.

   React đếm hook theo thứ tự gọi. Một component thoát sớm rồi bỏ qua vài hook
   sẽ ném "Rendered fewer hooks than expected" (error #300) và error boundary
   nuốt cả trang. Bundler không bắt được: mã hợp lệ về cú pháp, build vẫn xanh,
   lỗi chỉ nổ đúng lúc nhánh thoát sớm được đi qua.

   Đây chính là lỗi đã nằm im trong Student.jsx từ 14/08 tới 16/08: ba hook
   nằm dưới `if (taking) return …`, nên trang chỉ vỡ khi học sinh bấm vào một
   bài để làm.

   Cách dò: lần theo độ sâu ngoặc nhọn để chỉ xét `return` ở THÂN component
   (độ sâu 1), bỏ qua return trong callback, trong .map(), trong useEffect. */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".js", ".jsx"].includes(extname(p))) files.push(p);
  }
})("src");

const HOOK = /(?:^|[^.\w])(use[A-Z]\w*)\s*\(/;
const COMP_START = /^(?:export\s+(?:default\s+)?)?function\s+([A-Z]\w*)\s*\(/;

let problems = 0;

for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");

  let comp = null;      // { name, startLine }
  let depth = 0;        // độ sâu ngoặc nhọn tính từ đầu component
  let earlyReturn = 0;  // dòng của `return` sớm đầu tiên ở thân component

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const code = line.replace(/\/\/.*$/, "");

    if (!comp) {
      const m = COMP_START.exec(line);
      if (m) { comp = { name: m[1], startLine: i + 1 }; depth = 0; earlyReturn = 0; }
      else continue;
    }

    const opens = (code.match(/\{/g) || []).length;
    const closes = (code.match(/\}/g) || []).length;
    const depthBefore = depth;
    depth += opens - closes;

    /* `return` ở ngay thân component: độ sâu TRƯỚC dòng này đúng bằng 1.
       Bỏ qua `return (` mở JSX cuối hàm — nó không phải thoát sớm nếu là
       return duy nhất; nhưng nếu đã có hook phía sau thì vẫn báo, nên chỉ
       ghi nhận return nào KHÔNG phải dòng cuối cùng của thân. */
    if (depthBefore === 1 && /^\s*(?:if\s*\(.*\)\s*)?return\b/.test(code) && !earlyReturn) {
      earlyReturn = i + 1;
    }

    if (earlyReturn && depthBefore >= 1) {
      const h = HOOK.exec(code);
      if (h) {
        console.log(`FAIL  ${file.replace(/\\/g, "/")}:${i + 1}`);
        console.log(`        ${comp.name}() — ${h[1]}() nằm sau \`return\` ở dòng ${earlyReturn}`);
        problems++;
        earlyReturn = 0;   // báo một lần cho mỗi component
      }
    }

    if (depth <= 0 && i + 1 > comp.startLine) comp = null;
  }
}

console.log(problems
  ? `\n${problems} hook đặt sau return sớm`
  : "\nKhông có hook nào đặt sau return sớm");
process.exit(problems ? 1 : 0);
