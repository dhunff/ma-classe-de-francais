-- 136 · (13/10) Thang chấm nói DALF C1 + đồng bộ thời lượng PO hai đề A2.
--
-- C1: grille PO chính thức (delfdalf.ch): exposé, entretien, lexique,
-- morphosyntaxe, phonologie, mỗi tiêu chí 0/1/3/5. Bản JS ở
-- supabase/functions/_shared/grillePO.js — hai bản phải khớp.

alter table public.po_cham drop constraint if exists po_cham_cap_check;
alter table public.po_cham add constraint po_cham_cap_check check (cap in ('A1', 'A2', 'B1', 'B2', 'C1'));

create or replace function public._thang_po(p_cap text)
returns jsonb language sql immutable as $$
  select case p_cap
    when 'A1' then '{"entretien":[0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5],"echange":[0,0.5,1,1.5,2,2.5,3,3.5,4],"dialogue":[0,0.5,1,1.5,2,2.5,3,3.5,4],"politesse":[0,0.5,1,1.5,2,2.5,3],"lexique":[0,0.5,1,1.5,2,2.5,3],"morpho":[0,0.5,1,1.5,2,2.5,3],"phono":[0,0.5,1,1.5,2,2.5,3]}'::jsonb
    when 'A2' then '{"entretien":[0,1,2.5,4],"monologue":[0,1,2.5,4],"interaction":[0,1,2.5,4],"lexique":[0,1,3,5],"morpho":[0,1,2.5,4],"phono":[0,1,2.5,4]}'::jsonb
    when 'B1' then '{"entretien":[0,1,2.5,4],"interaction":[0,1,2.5,4],"point_de_vue":[0,1,2.5,4],"lexique":[0,1,3,5],"morpho":[0,1,2.5,4],"phono":[0,1,2.5,4]}'::jsonb
    when 'B2' then '{"monologue":[0,1,3,5],"interaction":[0,1,3,5],"lexique":[0,1,3,5],"morpho":[0,1,3,5],"phono":[0,1,3,5]}'::jsonb
    when 'C1' then '{"expose":[0,1,3,5],"entretien":[0,1,3,5],"lexique":[0,1,3,5],"morpho":[0,1,3,5],"phono":[0,1,3,5]}'::jsonb
  end
$$;

-- Phần nói của đề C1 giờ mang 25 điểm (dòng PO đầu tiên của đề).
update public.exam_sections s set points = 25
  from public.exams e
 where e.id = s.exam_id and s.code = 'PO' and e.level = 'C1'
   and s.ord = (select min(s2.ord) from public.exam_sections s2 where s2.exam_id = s.exam_id and s2.code = 'PO');

-- A2 · Đề 1 đặt PO 8 phút, Đề 2 đặt 12 (= EXAM_STRUCTURE.A2) → tổng 108 vs 112.
update public.exam_sections s set minutes = 12
  from public.exams e
 where e.id = s.exam_id and e.title = 'DELF A2 · Đề 1' and s.code = 'PO' and s.minutes = 8;
update public.exams set duration_min = 112 where title = 'DELF A2 · Đề 1' and duration_min = 108;
