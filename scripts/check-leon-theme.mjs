/* check:leon (18/11): tương phản màu các chủ đề của khung chat « Hỏi Leon » (src/styles/base.css, khối
 * .leon-chat[data-chu-de=…] và bản tối html.mcf-dark-root …). Mỗi cặp chữ / nền phải đạt WCAG AA 4,5:1.
 * Chủ đề « mac-dinh » đi theo token của app, check:design đo phần đó; ở đây đo các chủ đề có màu riêng.
 * Bản tối kế thừa mọi biến bản sáng không ghi lại (đúng như CSS cascade). */
import { readFileSync } from "node:fs";

const css = readFileSync("src/styles/base.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const sang = {}, toi = {};
for (const m of css.matchAll(/([^{}]*\.leon-chat\[data-chu-de="([a-z-]+)"\][^{}]*)\{([^}]*)\}/g)) {
  const [, sel, ten, than] = m;
  const bien = Object.fromEntries([...than.matchAll(/--(l-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)].map((x) => [x[1], x[2]]));
  if (/mcf-dark/.test(sel)) toi[ten] = { ...(toi[ten] ?? {}), ...bien }; else sang[ten] = { ...(sang[ten] ?? {}), ...bien };
}
const kenh = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
const sang_ = (h) => { const [r, g, b] = kenh(h); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const tuongPhan = (a, b) => { const [x, y] = [sang_(a), sang_(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const CAP = [["l-chu", "l-nen"], ["l-mo", "l-nen"], ["l-chu-dau", "l-dau1"], ["l-chu-dau", "l-dau2"], ["l-chu-hs", "l-hs"],
  ["l-chu-leon", "l-leon"], ["l-chu-nhan", "l-nhan"], ["l-chu-chip", "l-chip"], ["l-chu", "l-o"]];

let dat = 0, hong = 0;
const ds = Object.keys(sang);
if (ds.length < 4) { console.log(`  ✗ chỉ đọc được ${ds.length} chủ đề, bộ kiểm không còn đọc đúng base.css`); process.exit(1); }
for (const ten of ds) {
  for (const [loai, bo] of [["sáng", sang[ten]], ["tối", { ...sang[ten], ...(toi[ten] ?? {}) }]]) {
    for (const [chu, nen] of CAP) {
      if (!bo[chu] || !bo[nen]) { hong++; console.log(`  ✗ ${ten} (${loai}): thiếu --${chu} hoặc --${nen}`); continue; }
      const t = tuongPhan(bo[chu], bo[nen]);
      if (t >= 4.5) dat++; else { hong++; console.log(`  ✗ ${ten} (${loai}): --${chu} ${bo[chu]} trên --${nen} ${bo[nen]} = ${t.toFixed(2)} (cần 4,5)`); }
    }
  }
}
console.log(`\n${ds.length} chủ đề · ${dat} đạt, ${hong} hỏng`);
process.exit(hong ? 1 : 0);
