/* Sinh SQL dữ liệu CHƯƠNG 2 của Lộ trình (23/10) từ chuong2-a..d.mjs.
 * Chạy: node scripts/lo-trinh/sinh-chuong2.mjs > lo-trinh-chuong2.sql (rồi db query -f).
 * Kiểm trước khi in: đủ 16 chủ đề × 10 màn × 8 mục, loại hợp lệ, không trùng từ với
 * chương 1 cùng chủ đề, không trùng trong chương 2 cùng chủ đề, không dấu gạch dài.
 * Upsert màn theo id `<chủ đề>-c2-<n>`; mục từ của màn thì xoá rồi chèn lại. */
/* ĐÃ THAY bởi sinh-ba-chuong.mjs (23/10): màn <cd>-c2-n nay là CHƯƠNG 3 (B2). Đừng chạy file này. */
if (!process.env.CHAY_CU) { console.error("Dùng scripts/lo-trinh/sinh-ba-chuong.mjs"); process.exit(1); }
import { CHU_DE } from "./chu-de.mjs";
import { CHUONG2_A } from "./chuong2-a.mjs";
import { CHUONG2_B } from "./chuong2-b.mjs";
import { CHUONG2_C } from "./chuong2-c.mjs";
import { CHUONG2_D } from "./chuong2-d.mjs";

const C2 = { ...CHUONG2_A, ...CHUONG2_B, ...CHUONG2_C, ...CHUONG2_D };
const loi = [];
const chuan = (s) => s.toLowerCase().replace(/^(le |la |les |l'|un |une |des )/, "").trim();
for (const c of CHU_DE) {
  const ds = C2[c.id];
  if (!ds) { loi.push("thiếu chủ đề " + c.id); continue; }
  if (ds.length !== 10) loi.push(`${c.id}: ${ds.length} màn`);
  const c1 = new Set(c.man.flatMap((m) => m.tu.map((t) => chuan(t.fr))));
  const daCo = new Set();
  ds.forEach((m, i) => {
    if (m.tu.length !== 8) loi.push(`${c.id} màn ${i + 1}: ${m.tu.length} mục`);
    for (const t of m.tu) {
      if (!t.fr || !t.vi || !["n", "v", "a", "x", "d"].includes(t.loai)) loi.push(`${c.id} màn ${i + 1}: mục hỏng ${JSON.stringify(t)}`);
      const k = chuan(t.fr);
      if (c1.has(k)) loi.push(`${c.id}: « ${t.fr} » trùng chương 1`);
      if (daCo.has(k)) loi.push(`${c.id}: « ${t.fr} » lặp trong chương 2`);
      daCo.add(k);
      if ((t.fr + t.vi).includes("—")) loi.push("gạch dài: " + t.fr);
    }
  });
}
if (Object.keys(C2).some((k) => !CHU_DE.find((c) => c.id === k))) loi.push("chủ đề lạ trong chương 2");
if (loi.length) { console.error(loi.join("\n")); process.exit(1); }

const q = (x) => "'" + String(x).replace(/'/g, "''") + "'";
const man = [], tu = [], ids = [];
for (const c of CHU_DE) C2[c.id].forEach((m, i) => {
  const id = `${c.id}-c2-${i + 1}`; ids.push(q(id));
  man.push(`  (${q(id)}, ${q(c.id)}, ${100 + i}, ${q(m.ten)}, ${q(m.cap)}, 2)`);
  m.tu.forEach((t, k) => tu.push(`  (${q(id)}, ${k}, ${q(t.fr)}, ${q(t.vi)}, ${q(t.loai)})`));
});
console.log([
  "-- SINH TỰ ĐỘNG bởi scripts/lo-trinh/sinh-chuong2.mjs. Đừng sửa tay.",
  "insert into public.lo_trinh_man (id, chu_de_id, ord, ten, cap, chuong) values",
  man.join(",\n"),
  "on conflict (id) do update set chu_de_id = excluded.chu_de_id, ord = excluded.ord, ten = excluded.ten, cap = excluded.cap, chuong = excluded.chuong;",
  `delete from public.lo_trinh_tu where man_id in (${ids.join(", ")});`,
  "insert into public.lo_trinh_tu (man_id, ord, fr, vi, loai) values",
  tu.join(",\n") + ";",
].join("\n"));
console.error(`ok: ${man.length} màn, ${tu.length} mục`);
