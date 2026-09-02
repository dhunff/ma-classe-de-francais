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

  /* Bốn lớp của thẻ lật 3D (TheLat3D.jsx). Đây là loại RỦI RO NHẤT trong cả
     danh sách: Tailwind 3 không có tiện ích xoay theo trục Y, nên phải viết
     bằng giá trị tuỳ ý — và một dấu ngoặc sai thì lớp im lặng biến mất, thẻ
     vẫn hiện, chỉ là không bao giờ lật.

     `preserve-3d` thiếu → mặt sau không bao giờ ngửa ra.
     `backface-visibility` thiếu → hai mặt vẽ đè, đọc được chữ ngược.
     `perspective` thiếu → quay bẹp, không có chiều sâu. */
  "[perspective:1200px]", "[transform-style:preserve-3d]",
  "[backface-visibility:hidden]", "[transform:rotateY(180deg)]",

  /* Hiệu ứng thẻ bộ. `active:scale-[0.98]` là giá trị tuỳ ý; hai lớp kia là
     biến thể ghép (group-hover, motion-reduce) — cả ba đều thuộc loại viết
     sai một ký tự thì lớp im lặng biến mất và thẻ vẫn hiện bình thường,
     chỉ là không phản ứng gì khi trỏ vào. */
  "active:scale-[0.98]", "group-hover:translate-x-1.5", "motion-reduce:transition-none",
];

let thieu = 0;
for (const l of LOP) {
  const co = css.includes("." + l);
  if (!co) thieu++;
  console.log(" ", co ? "✓" : "✗", l);
}
console.log(thieu ? `\n${thieu} lớp KHÔNG sinh ra CSS` : "\nTất cả đều sinh ra CSS");

process.exit(thieu ? 1 : 0);
