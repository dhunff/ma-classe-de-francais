/* Sinh migration DỮ LIỆU cho lộ trình chủ đề từ scripts/lo-trinh/chu-de.mjs.
 *
 * Chạy: node scripts/lo-trinh/sinh-sql.mjs > supabase/migrations/116_lo_trinh_du_lieu.sql
 *
 * Upsert theo id, nên chạy lại sau khi sửa chu-de.mjs không nhân đôi chủ đề
 * hay màn. Mục từ của một màn thì XOÁ RỒI CHÈN LẠI (không ai tham chiếu tới
 * id mục từ; kết quả học sinh gắn với MÀN, không gắn với mục từ). Cột `bat` và
 * `so_cau` do giáo viên chỉnh trên giao diện thì KHÔNG bị ghi đè khi chạy lại. */
import { CHU_DE } from "./chu-de.mjs";

const q = (x) => "'" + String(x).replace(/'/g, "''") + "'";
const ra = ["-- SINH TỰ ĐỘNG bởi scripts/lo-trinh/sinh-sql.mjs từ scripts/lo-trinh/chu-de.mjs. Đừng sửa tay.", ""];

ra.push("insert into public.lo_trinh_chu_de (id, ten_fr, ten_vi, mau, ord) values");
ra.push(CHU_DE.map((c, i) => `  (${q(c.id)}, ${q(c.fr)}, ${q(c.vi)}, ${q(c.mau)}, ${i})`).join(",\n"));
ra.push("on conflict (id) do update set ten_fr = excluded.ten_fr, ten_vi = excluded.ten_vi, mau = excluded.mau, ord = excluded.ord;", "");

const man = [], tu = [];
for (const c of CHU_DE) c.man.forEach((m, i) => {
  const id = `${c.id}-${i + 1}`;
  man.push(`  (${q(id)}, ${q(c.id)}, ${i}, ${q(m.ten)}, ${q(m.cap)})`);
  m.tu.forEach((t, k) => tu.push(`  (${q(id)}, ${k}, ${q(t.fr)}, ${q(t.vi)}, ${q(t.loai)})`));
});
ra.push("insert into public.lo_trinh_man (id, chu_de_id, ord, ten, cap) values");
ra.push(man.join(",\n"));
ra.push("on conflict (id) do update set chu_de_id = excluded.chu_de_id, ord = excluded.ord, ten = excluded.ten, cap = excluded.cap;", "");
ra.push(`delete from public.lo_trinh_tu where man_id in (${CHU_DE.flatMap((c) => c.man.map((_, i) => q(`${c.id}-${i + 1}`))).join(", ")});`);
ra.push("insert into public.lo_trinh_tu (man_id, ord, fr, vi, loai) values");
ra.push(tu.join(",\n") + ";");
console.log(ra.join("\n"));
