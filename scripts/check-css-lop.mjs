import fs from "node:fs";

/* Tailwind BỎ QUA lớp không tồn tại, không báo gì — `bg-dangerSoft` từng làm
   mất nền cảnh báo ở 5 chỗ trên production. Cách chắc chắn nhất để biết một
   lớp có thật: tìm nó trong CSS đã build.

   Gỡ mọi dấu thoát của CSS trước khi so. Tailwind thoát `/`, `:`, `[`, `]`,
   `(`, `)`, `.` — dựng lại đúng bộ thoát đó bằng regex là chỗ tôi đã sai hai
   lần liền. Bỏ hết dấu `\` đi rồi so chuỗi thô thì không còn gì để sai. */
const f = fs.readdirSync("dist/assets").find((x) => x.endsWith(".css"));
const css = fs.readFileSync("dist/assets/" + f, "utf8").split("\\").join("");

const LOP = [
  "bg-surface2", "ring-line", "ring-inset", "bg-primary-soft", "bg-danger-soft",
  "text-warn", "text-on-primary", "bg-ink/50", "shadow-primary/30",
  "backdrop-blur-sm", "accent-[color:var(--mcf-primary)]", "disabled:opacity-60",
  "disabled:cursor-not-allowed", "hover:bg-primary-soft", "focus:ring-2",
  "min-h-[110px]", "z-[9999]", "rounded-3xl", "shadow-2xl", "hover:ring-primary/40",
];

let thieu = 0;
for (const l of LOP) {
  const co = css.includes("." + l);
  if (!co) thieu++;
  console.log(" ", co ? "✓" : "✗", l);
}
console.log(thieu ? `\n${thieu} lớp KHÔNG sinh ra CSS` : "\nTất cả đều sinh ra CSS");

process.exit(thieu ? 1 : 0);
