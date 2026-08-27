import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const SRC = "src";
const files = [];
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".js", ".jsx"].includes(extname(p))) files.push(p);
  }
})(SRC);
const read = (p) => readFileSync(p, "utf8");
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok, detail });

// --- 1. Không còn màu và font của thiết kế cũ trong mã nguồn ---
const BANNED = ["#3D5AF1", "#F26B4E", "Playfair", "Lora", "C.accent"];
for (const token of BANNED) {
  const hits = files.filter((f) => read(f).includes(token));
  check(`banned:${token}`, hits.length === 0, hits.join(", "));
}


/* --- 1b. Lớp Tailwind trỏ tới token KHÔNG tồn tại ---
 *
 * tailwind.config.js khai `danger: { DEFAULT, soft }`, nên lớp đúng là
 * `bg-danger-soft`. Viết `bg-dangerSoft` thì Tailwind KHÔNG báo lỗi, không
 * cảnh báo, không sinh CSS — nó chỉ bỏ qua, và phần tử mất nền.
 *
 * Đã lọt lên production ở 5 chỗ: thẻ "dưới ngưỡng" của ExamResults và ExamMode,
 * ô lỗi, và bảng chấm PE — tất cả đều mất nền cảnh báo màu đỏ. Không ai phát
 * hiện vì chữ vẫn đọc được.
 *
 * Chỉ bắt trong CHUỖI LỚP. `C.dangerSoft` là object màu trong JS dùng cho
 * inline style — hợp lệ, và tên camelCase ở đó là đúng.
 *
 * Dùng `(?![A-Za-z])` chứ KHÔNG dùng `\b`. Bản đầu viết `\b`, và bộ kiểm báo
 * xanh trên một file có lỗi thật: chuỗi đi qua một lệnh shell, `\b` thành ký
 * tự backspace 0x08, và regex hoá ra đang đòi một byte điều khiển vô hình sau
 * chữ "soft". Đọc mã nguồn không thấy gì sai.
 *
 * Đúng loại lỗi mà chính bộ kiểm này sinh ra để bắt — một thứ trông đúng và
 * không làm gì cả. Sửa file có cấu trúc bằng công cụ Edit, đừng qua shell:
 * CLAUDE.md quy tắc 4. */
const SAI_LOP = /(?:bg|text|border|ring|from|to|via)-(?:danger|warn|ok|primary)(?:Soft|soft)(?![A-Za-z])/g;
for (const f of files) {
  const hits = [...read(f).matchAll(SAI_LOP)].map((m) => m[0]);
  check(`tokens:lop-hop-le:${f}`, hits.length === 0,
    hits.join(", ") + " → dùng gạch nối, ví dụ bg-danger-soft");
}

/* --- 1c. `consigne` là HTML, phải dựng bằng dangerouslySetInnerHTML ---
 *
 * Trình soạn bài sinh ra thẻ và lưu nguyên vào `consigne`. Dựng bằng
 * `{ex.consigne}` thì React escape hết, và học sinh đọc đúng nghĩa đen của mã
 * nguồn: `<div style="text-align: center;"> <span style=…>Depuis une dizaine…`
 *
 * ExamMode dính đúng lỗi này, và nó chỉ lộ ra khi có người thi thật. 23 trong
 * 40 bài của thư viện có HTML trong consigne — hơn nửa số đề.
 *
 * Chỉ bắt ở VỊ TRÍ CON của JSX — tức có `>` ngay trước. Bản đầu bắt mọi
 * `{...consigne}` và kêu oan ba chỗ: cú pháp rút gọn `{ consigne }` trong
 * object của Builder, và chính đoạn chú thích này. Một bộ kiểm hay báo động
 * giả là bộ kiểm người ta học cách bỏ qua — lúc đó nó tệ hơn là không có. */
const CONSIGNE_THUAN = />\s*\{\s*(?:\w+\.)?consigne\s*\}/g;
for (const f of files) {
  const hits = [...read(f).matchAll(CONSIGNE_THUAN)].map((m) => m[0]);
  check(`consigne:html:${f}`, hits.length === 0,
    hits.join(", ") + " → dùng dangerouslySetInnerHTML, xem ExamMode.jsx");
}

// --- 2. Font nạp qua index.html, không qua @import trong JS ---
const jsHasImport = files.some((f) => read(f).includes("@import url('https://fonts.googleapis"));
check("fonts:no-js-import", !jsHasImport);
const html = read("index.html");
check("fonts:link-in-html", html.includes("fonts.googleapis.com/css2"));
for (const fam of ["Plus+Jakarta+Sans"]) {
  check(`fonts:${fam}`, html.includes(fam));
}

// --- 3. Không file nào import từ App.jsx ---
// main.jsx là entry point — nó BẮT BUỘC phải import App.jsx. Chỉ các module
// khác import ngược lên App.jsx mới là vấn đề (import vòng, xem Task 5).
const ENTRY = [join("src", "App.jsx"), join("src", "main.jsx")];
const importers = files.filter((f) => !ENTRY.includes(f) && /from\s+["'][^"']*App\.jsx["']/.test(read(f)));
check("imports:no-app-jsx-importers", importers.length === 0, importers.join(", "));

// --- 4. Tương phản màu theo WCAG 2.1 ---
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (h) => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const safe = (label, fn) => { try { fn(); } catch (e) { check(label, false, e.message); } };

let css = "";
try {
  css = readFileSync("src/styles/tokens.css", "utf8");
  check("tokens:file-exists", true);
} catch {
  check("tokens:file-exists", false, "chưa có src/styles/tokens.css");
}
const varOf = (name, scope) => {
  const start = css.indexOf(scope);
  if (start === -1) throw new Error(`không tìm thấy khối ${scope}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  const block = css.slice(open, close === -1 ? css.length : close + 1);
  const m = block.match(new RegExp(`--mcf-${name}\\s*:\\s*(#[0-9A-Fa-f]{6})`));
  if (!m) throw new Error(`không tìm thấy --mcf-${name} trong ${scope}`);
  return m[1];
};

const suites = [
  { scope: ":root", label: "light", min: 4.5, pairs: [["ink", "bg"], ["soft", "surface"], ["primary", "surface"], ["ok", "surface"], ["warn", "surface"], ["danger", "surface"], ["on-primary", "primary"]] },
  { scope: "html.mcf-dark-root", label: "dark", min: 4.5, pairs: [["ink", "bg"], ["soft", "surface"], ["primary", "surface"], ["ok", "surface"], ["warn", "surface"], ["danger", "surface"], ["on-primary", "primary"]] },
];
for (const s of suites) {
  for (const [fg, bg] of s.pairs) {
    safe(`contrast:${s.label}:${fg}/${bg}`, () => {
      const r = ratio(varOf(fg, s.scope), varOf(bg, s.scope));
      check(`contrast:${s.label}:${fg}/${bg}`, r >= s.min, `${r.toFixed(2)} < ${s.min}`);
    });
  }
  safe(`contrast:${s.label}:line-strong/surface`, () => {
    const r = ratio(varOf("line-strong", s.scope), varOf("surface", s.scope));
    check(`contrast:${s.label}:line-strong/surface`, r >= 3, `${r.toFixed(2)} < 3`);
  });
}

// --- 5. Thang cấp độ ---
safe("level:scale", () => {
  const levels = readFileSync("src/shared/tokens.js", "utf8");
  const grab = (obj) => {
    const m = levels.match(new RegExp(`${obj}\\s*=\\s*\\{([^}]*)\\}`));
    if (!m) throw new Error(`không tìm thấy ${obj}`);
    return Object.fromEntries([...m[1].matchAll(/"?([A-B][12]\+?)"?\s*:\s*"(#[0-9A-Fa-f]{6})"/g)].map((x) => [x[1], x[2]]));
  };
  const fg = grab("LEVEL_COLORS"), bg = grab("LEVEL_PASTEL");
  for (const lv of Object.keys(fg)) {
    const onPastel = ratio(fg[lv], bg[lv]);
    const onWhite = ratio(fg[lv], varOf("surface", ":root"));
    check(`level:${lv}`, onPastel >= 4.5 && onWhite >= 4.5, `pastel ${onPastel.toFixed(2)}, surface ${onWhite.toFixed(2)}`);
  }
});

// --- Kết quả ---
let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail && !r.ok ? `  → ${r.detail}` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} đạt`);
process.exit(failed ? 1 : 0);
