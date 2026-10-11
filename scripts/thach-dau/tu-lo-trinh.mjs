/* Sinh migration 141 (13/10): bộ từ vựng Thách đấu theo 16 chủ đề của Lộ trình.
 *
 * Nguồn: scripts/lo-trinh/chu-de.mjs (800 mục « tiếng Pháp | nghĩa | loại »).
 * Mỗi chủ đề Lộ trình → một chủ đề Thách đấu (chu_de_the, nhóm tu_vung) + một
 * bộ thẻ công khai, miễn phí (the_bo + the_bo_the). « Môi trường » và
 * « Truyền thông » gộp vào hai chủ đề đã có cùng tên mã.
 * Loại từ → dạng thẻ (để nhiễu CÙNG dạng): n → nhom_tu, v → dong_tu,
 * a → tinh_tu (mới), x → thanh_ngu (mới).
 * Chạy lại không nhân đôi: bộ trùng tên thì bỏ qua.
 *
 * Chạy: node scripts/thach-dau/tu-lo-trinh.mjs <uuid_giao_vien> > supabase/migrations/141_….sql */
import { CHU_DE } from "../lo-trinh/chu-de.mjs";

const GV = process.argv[2];
if (!/^[0-9a-f-]{36}$/.test(GV || "")) { console.error("Cần uuid giáo viên"); process.exit(1); }
const q = (x) => "'" + String(x).replace(/'/g, "''") + "'";
const LOAI = { n: "nhom_tu", v: "dong_tu", a: "tinh_tu", x: "thanh_ngu", d: "tu_noi" };
const GOP = { "moi-truong": "moi-truong", "truyen-thong": "truyen-thong" };
const EN = {
  "nang-luong": "Energy and sustainable consumption", "binh-dang-gioi": "Gender equality",
  "cong-nghe-so": "Digital tech and AI", "mang-xa-hoi": "Social media and information",
  "viec-lam": "Work and remote work", "nhap-cu": "Migration and integration",
  "suc-khoe": "Health, sport and food", "giao-duc": "Education", "gia-dinh": "Family and generations",
  "do-thi": "City, transport and housing", "du-lich": "Tourism and culture",
  "tieu-dung": "Consumption and advertising", "cong-dong": "Volunteering and community",
  "nghien": "Tobacco and addictions",
};

const ra = [`-- 141 · Bộ từ vựng Thách đấu theo 16 chủ đề Lộ trình (sinh bởi scripts/thach-dau/tu-lo-trinh.mjs).
alter table public.the_bo_the drop constraint if exists the_bo_the_loai_check;
alter table public.the_bo_the add constraint the_bo_the_loai_check
  check (loai in ('so', 'cau', 'nhom_tu', 'tu_noi', 'mo_dau', 'dong_tu', 'tinh_tu', 'thanh_ngu'));`];

let ord = 10;
for (const c of CHU_DE) {
  const ma = GOP[c.id] ?? `lt-${c.id}`;
  if (!GOP[c.id]) {
    ra.push(`insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values (${q(ma)}, 'tu_vung', ${q(c.vi)}, ${q(c.fr)}, ${q(EN[c.id])}, ${ord++}) on conflict (ma) do nothing;`);
  }
  const ten = `Từ vựng Lộ trình: ${c.vi}`;
  const tu = c.man.flatMap((m) => m.tu);
  const dong = tu.map((t, i) => `(${q(t.fr)}, ${q(t.vi)}, ${q(LOAI[t.loai] ?? "nhom_tu")}, ${i})`).join(",\n    ");
  ra.push(`with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select ${q(ten)}, 'CE', ${q(`${tu.length} từ của chủ đề « ${c.vi} » trong Lộ trình học tập.`)}, ${q(GV)}, true, ${q(ma)}, false, 0
  where not exists (select 1 from public.the_bo where ten = ${q(ten)})
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ${dong}
) as v(fr, vi, loai, o);`);
}
const out = ra.join("\n\n") + "\n";
if (out.includes("—")) { console.error("Còn dấu gạch dài"); process.exit(1); }
process.stdout.write(out);
