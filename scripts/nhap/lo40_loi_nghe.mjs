/* Lô 40 (04/11/2026): nạp lời nghe và phân tích vào bảng `loi_nghe` (migration 194, chỉ VIP xem).
 *
 * Lời nghe lấy từ CHÍNH các script đã tạo audio (scripts/nhap/*.mjs): tìm `tep|ten: "tên"` rồi mảng
 * `doan: [...]` gần nhất phía sau, tính lại mảng đó với các tên biến (CHAM, RADIO…) thay bằng chính
 * tên của chúng. Hàm `d` có hai dạng: d(giọng, lời) và d(giọng, cách, lời) hoặc d(giọng, lời, cách);
 * đối số là tên biến thì đó là « cách đọc », không phải lời.
 * Bài khớp lời theo tên file audio. Phân tích: lo40_loi_nghe_phan_tich.mjs (khoá cũng là tên file).
 * Danh sách bài nghe luyện tập lúc soạn: lo40_bai_nghe.json (xuất read-only từ DB).
 *
 * Chạy: node scripts/nhap/lo40_loi_nghe.mjs > lo40.sql */
import { readFileSync, readdirSync } from "node:fs";
import { PHAN_TICH } from "./lo40_loi_nghe_phan_tich.mjs";

const DIR = "scripts/nhap";
const khop = (s, i) => { let d = 0; for (let k = i; k < s.length; k++) { const c = s[k]; if (c === '"' || c === "'" || c === "`") { const q = c; k++; while (k < s.length && s[k] !== q) { if (s[k] === "\\") k++; k++; } continue; } if (c === "[") d++; else if (c === "]") { d--; if (!d) return k; } } return -1; };
const laTenBien = (x) => typeof x === "string" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(x);
const dd = (...a) => (a.length >= 3 ? { giong: a[0], chu: laTenBien(a[2]) ? a[1] : a[2] } : { giong: a[0], chu: a[1] });
const gia = new Proxy({}, { has: () => true, get: (_, k) => (k === Symbol.unscopables ? undefined : k === "d" ? dd : typeof k === "string" ? k : undefined) });

const LOI = {};
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".mjs"))) {
  const s = readFileSync(`${DIR}/${f}`, "utf8");
  const re = /\b(?:tep|ten)\s*:\s*"([a-z0-9-]+)"/g; let m; const vt = [];
  while ((m = re.exec(s))) vt.push([m[1], m.index]);
  vt.forEach(([ten, i], n) => {
    const het = n + 1 < vt.length ? vt[n + 1][1] : s.length;
    const j = s.indexOf("doan:", i); if (j < 0 || j > het) return;
    const a = s.indexOf("[", j), b = khop(s, a); if (b < 0) return;
    try {
      const arr = new Function("gia", `with (gia) { return (${s.slice(a, b + 1)}); }`)(gia);
      const dong = arr.map((x) => (Array.isArray(x) ? { giong: x[0], chu: x[1] } : { giong: x.giong, chu: x.chu })).filter((x) => typeof x.chu === "string" && !laTenBien(x.chu));
      if (dong.length && !LOI[ten]) LOI[ten] = dong;
    } catch { /* mảng dựng bằng hàm khác (ví dụ qcm) thì bỏ qua */ }
  });
}

const tho = readFileSync(`${DIR}/lo40_bai_nghe.json`, "utf8");
const BAI = JSON.parse(tho.slice(tho.indexOf("{"))).rows;
const loi = [];
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
let coPt = 0;
for (const b of BAI) {
  const tep = decodeURIComponent(b.tep).replace(/\.mp3$/, "");
  const dong = LOI[tep];
  if (!dong) continue;
  const pt = PHAN_TICH[tep];
  if (pt) coPt++;
  if (JSON.stringify(pt || {}).includes("—")) loi.push(`${tep}: dấu gạch dài`);
  const phan_tich = pt ? { loai: pt.loai, chu_de: pt.chu_de, y_chinh: pt.y } : null;
  ra.push(`insert into public.loi_nghe (exercise_id, loi, phan_tich) values (${q(b.id)}, ${j(dong.map(({ giong, chu }) => ({ giong, chu })))}, ${j(phan_tich)}) on conflict (exercise_id) do update set loi = excluded.loi, phan_tich = excluded.phan_tich, cap_nhat = now();`);
}
for (const k of Object.keys(PHAN_TICH)) if (!BAI.some((b) => decodeURIComponent(b.tep).replace(/\.mp3$/, "") === k && LOI[k])) loi.push(`phân tích « ${k} » không khớp bài nào`);
if (loi.length) { console.error(loi.join("\n")); process.exit(1); }
console.error(`${ra.length} bài có lời nghe, ${coPt} bài có phân tích`);
console.log(ra.join("\n"));
