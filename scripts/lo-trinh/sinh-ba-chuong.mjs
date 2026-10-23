/* Sắp Lộ trình thành BA CHƯƠNG theo trình độ (23/10, theo chủ dự án):
 *   chương 1 = A1–A2 : màn A1 mới (chuong1-a1.mjs) + màn A2 cũ của chu-de.mjs
 *   chương 2 = B1    : màn B1 cũ của chu-de.mjs + màn B1 mới (chuong-b1-*.mjs)
 *   chương 3 = B2    : màn B2 cũ của chu-de.mjs + 10 màn B2 (chuong2-*.mjs, id <cd>-c2-n)
 * Màn cũ GIỮ NGUYÊN id (kết quả học sinh gắn theo id), chỉ đổi chuong + ord.
 * Kiểm: ch1 = 7, ch2 = 10, ch3 = 12 màn mỗi chủ đề; 8 mục/màn; loại hợp lệ; không
 * trùng từ giữa mọi màn cùng chủ đề; không dấu gạch dài. In SQL ra stdout. */
import { CHU_DE } from "./chu-de.mjs";
import { A1 } from "./chuong1-a1.mjs";
import { B1_A } from "./chuong-b1-a.mjs";
import { B1_B } from "./chuong-b1-b.mjs";
import { CHUONG2_A } from "./chuong2-a.mjs";
import { CHUONG2_B } from "./chuong2-b.mjs";
import { CHUONG2_C } from "./chuong2-c.mjs";
import { CHUONG2_D } from "./chuong2-d.mjs";

const B1 = { ...B1_A, ...B1_B };
const B2 = { ...CHUONG2_A, ...CHUONG2_B, ...CHUONG2_C, ...CHUONG2_D };
const loi = [];
const chuan = (s) => s.toLowerCase().replace(/^(le |la |les |l'|un |une |des )/, "").trim();
const q = (x) => "'" + String(x).replace(/'/g, "''") + "'";
const moi = [], cu = [], tu = [];

for (const c of CHU_DE) {
  const cuMan = c.man.map((m, i) => ({ ...m, id: `${c.id}-${i + 1}` }));
  const ch = [
    [...(A1[c.id] ?? []).map((m, i) => ({ ...m, id: `${c.id}-a1-${i + 1}`, moi: true })), ...cuMan.filter((m) => m.cap === "A2")],
    [...cuMan.filter((m) => m.cap === "B1"), ...(B1[c.id] ?? []).map((m, i) => ({ ...m, id: `${c.id}-b1-${i + 1}`, moi: true }))],
    [...cuMan.filter((m) => m.cap === "B2"), ...(B2[c.id] ?? []).map((m, i) => ({ ...m, id: `${c.id}-c2-${i + 1}` }))],
  ];
  [7, 10, 12].forEach((n, k) => { if (ch[k].length !== n) loi.push(`${c.id} chương ${k + 1}: ${ch[k].length} màn (cần ${n})`); });
  const thay = new Map();
  ch.forEach((ds, k) => ds.forEach((m, i) => {
    if (m.tu.length !== 8) loi.push(`${m.id}: ${m.tu.length} mục`);
    for (const t of m.tu) {
      if (!t.fr || !t.vi || !["n", "v", "a", "x", "d"].includes(t.loai)) loi.push(`${m.id}: mục hỏng ${JSON.stringify(t)}`);
      const kk = chuan(t.fr);
      /* Hai màn CŨ trùng nhau (có sẵn từ 116, vd « bénévole » / « le bénévole ») thì bỏ
         qua: sửa chúng là đổi nội dung học sinh đã chơi. Màn mới thì không được trùng. */
      const cuCu = !m.moi && !/-a1-|-b1-|-c2-/.test(m.id) && !/-a1-|-b1-|-c2-/.test(thay.get(kk) ?? "x-a1-");
      if (thay.has(kk) && !cuCu) loi.push(`${c.id}: « ${t.fr} » ở ${m.id} trùng ${thay.get(kk)}`); else if (!thay.has(kk)) thay.set(kk, m.id);
      if ((t.fr + t.vi).includes("—")) loi.push("gạch dài: " + t.fr);
    }
    const ord = (k + 1) * 100 + i;
    if (m.moi) {
      moi.push(`  (${q(m.id)}, ${q(c.id)}, ${ord}, ${q(m.ten)}, ${q(m.cap)}, ${k + 1})`);
      m.tu.forEach((t, j) => tu.push(`  (${q(m.id)}, ${j}, ${q(t.fr)}, ${q(t.vi)}, ${q(t.loai)})`));
    } else cu.push(`  (${q(m.id)}, ${ord}, ${k + 1})`);
  }));
}
if (loi.length) { console.error(loi.join("\n")); console.error(loi.length + " lỗi"); process.exit(1); }

console.log([
  "-- SINH TỰ ĐỘNG bởi scripts/lo-trinh/sinh-ba-chuong.mjs. Đừng sửa tay.",
  "insert into public.lo_trinh_man (id, chu_de_id, ord, ten, cap, chuong) values",
  moi.join(",\n"),
  "on conflict (id) do update set ord = excluded.ord, ten = excluded.ten, cap = excluded.cap, chuong = excluded.chuong;",
  "update public.lo_trinh_man m set ord = v.ord, chuong = v.chuong from (values",
  cu.join(",\n"),
  ") as v(id, ord, chuong) where m.id = v.id;",
  `delete from public.lo_trinh_tu where man_id like '%-a1-%' or man_id like '%-b1-%';`,
  "insert into public.lo_trinh_tu (man_id, ord, fr, vi, loai) values",
  tu.join(",\n") + ";",
].join("\n"));
console.error(`ok: ${moi.length} màn mới, ${tu.length} mục mới, ${cu.length} màn cũ đổi chương`);
