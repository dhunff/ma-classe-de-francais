/* Dò định danh viết hoa được dùng nhưng chưa import và cũng không định nghĩa
   trong file. Bundler không bắt được loại lỗi này: chúng chỉ nổ lúc render,
   nên một màn hình có thể hỏng hoàn toàn mà `npm run build` vẫn xanh. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const files = [];
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".js", ".jsx"].includes(extname(p))) files.push(p);
  }
})("src");

// Tên viết hoa có sẵn trong môi trường hoặc là hằng cục bộ hợp lệ.
const GLOBALS = new Set([
  "React", "Object", "Array", "String", "Number", "Boolean", "Date", "Math", "JSON",
  "Promise", "Map", "Set", "Error", "RegExp", "Intl", "URL", "Blob", "FileReader",
  "Image", "Audio", "Event", "KeyboardEvent", "CustomEvent", "DOMParser", "Infinity", "NaN",
  "HTMLInputElement", "HTMLSelectElement", "HTMLElement", "MutationObserver",
]);

let problems = 0;

for (const file of files) {
  const src = readFileSync(file, "utf8");

  const imported = new Set();
  for (const m of src.matchAll(/import\s+(?:([A-Za-z_$][\w$]*)\s*,?\s*)?(?:\{([^}]*)\})?\s*from/g)) {
    if (m[1]) imported.add(m[1]);
    if (m[2]) {
      for (const part of m[2].split(",")) {
        const name = part.trim().split(/\s+as\s+/).pop().trim();
        if (name) imported.add(name);
      }
    }
  }

  const declared = new Set();
  for (const m of src.matchAll(/(?:^|\n)\s*(?:export\s+(?:default\s+)?)?(?:function|class)\s+([A-Z][\w$]*)/g)) declared.add(m[1]);
  for (const m of src.matchAll(/(?:^|\n)\s*(?:export\s+)?(?:const|let|var)\s+([A-Z][\w$]*)/g)) declared.add(m[1]);
  // Tham số huỷ cấu trúc và biến cục bộ viết hoa (ví dụ { Icon }) .
  for (const m of src.matchAll(/(?:const|let|var|\(|,|\{)\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(":").pop().trim().replace(/\s*=.*/, "");
      if (/^[A-Z][\w$]*$/.test(name)) declared.add(name);
    }
  }
  for (const m of src.matchAll(/\(\s*\{?\s*([A-Z][\w$]*)\s*[,}\)]/g)) declared.add(m[1]);
  // Huỷ cấu trúc mảng: ([k, label, Icon]) => … — tên viết hoa ở đây là biến cục bộ.
  for (const m of src.matchAll(/\[([^\]\n]*)\]\s*(?:=|\)?\s*=>)/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().replace(/\s*=.*/, "");
      if (/^[A-Z][\w$]*$/.test(name)) declared.add(name);
    }
  }

  const used = new Set();
  for (const m of src.matchAll(/<([A-Z][\w$.]*)/g)) used.add(m[1].split(".")[0]);

  const missing = [...used].filter((n) => !imported.has(n) && !declared.has(n) && !GLOBALS.has(n));
  if (missing.length) {
    problems += missing.length;
    console.log(`FAIL  ${file}`);
    for (const n of missing) console.log(`        ${n}  — dùng trong JSX nhưng không import, không định nghĩa`);
  }
}

console.log(problems ? `\n${problems} định danh thiếu` : "\nKhông có định danh nào thiếu");
process.exit(problems ? 1 : 0);
