-- 135 · Phần nói (PO) ĐƯỢC CHẤM trong thi thử (12/10, theo chủ dự án).
--
-- Trước đây PO « không chấm » (057–060): tổng luôn /75. Nay học sinh TỰ CHẤM
-- theo grille PO chính thức (A1–B2, tờ grille do chủ dự án cung cấp), có AI
-- gợi ý từng tiêu chí (Edge Function cham-po); học sinh bấm chọn thì mới tính.
-- Thi PO → tổng /100; bỏ PO ở màn chờ → tổng /75.
-- C1/C2: chưa có grille → PO vẫn 0 điểm, không chấm.

-- 1. Bỏ chốt « PO = 0 điểm » của 059, đặt 25 cho các đề A1–B2.
alter table public.exam_sections drop constraint if exists exam_sections_po_khong_diem;
update public.exam_sections s set points = 25
  from public.exams e
 where e.id = s.exam_id and s.code = 'PO' and e.level in ('A1', 'A2', 'B1', 'B2')
   and s.ord = (select min(s2.ord) from public.exam_sections s2 where s2.exam_id = s.exam_id and s2.code = 'PO');

-- 2. Bản chấm phần nói: một dòng cho một attempt PO.
create table if not exists public.po_cham (
  attempt_id   uuid primary key references public.attempts(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  cap          text not null check (cap in ('A1', 'A2', 'B1', 'B2')),
  tu_cham      jsonb,                                        -- { tieuChi: số }
  diem         numeric(4,1) check (diem between 0 and 25),   -- tổng tự chấm, null = chưa chấm
  ai_goi_y     jsonb,                                        -- { tieuChi: số, nhan_xet, chep_loi... }
  ai_luc       timestamptz,
  cap_nhat     timestamptz not null default now()
);
alter table public.po_cham enable row level security;
drop policy if exists po_cham_doc on public.po_cham;
create policy po_cham_doc on public.po_cham for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
-- KHÔNG có policy ghi: chỉ đi qua hai RPC dưới và Edge Function (service_role).
revoke insert, update, delete on public.po_cham from anon, authenticated;

-- Thang hợp lệ, CHÉP từ supabase/functions/_shared/grillePO.js. Hai bản phải khớp.
create or replace function public._thang_po(p_cap text)
returns jsonb language sql immutable as $$
  select case p_cap
    when 'A1' then '{"entretien":[0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5],"echange":[0,0.5,1,1.5,2,2.5,3,3.5,4],"dialogue":[0,0.5,1,1.5,2,2.5,3,3.5,4],"politesse":[0,0.5,1,1.5,2,2.5,3],"lexique":[0,0.5,1,1.5,2,2.5,3],"morpho":[0,0.5,1,1.5,2,2.5,3],"phono":[0,0.5,1,1.5,2,2.5,3]}'::jsonb
    when 'A2' then '{"entretien":[0,1,2.5,4],"monologue":[0,1,2.5,4],"interaction":[0,1,2.5,4],"lexique":[0,1,3,5],"morpho":[0,1,2.5,4],"phono":[0,1,2.5,4]}'::jsonb
    when 'B1' then '{"entretien":[0,1,2.5,4],"interaction":[0,1,2.5,4],"point_de_vue":[0,1,2.5,4],"lexique":[0,1,3,5],"morpho":[0,1,2.5,4],"phono":[0,1,2.5,4]}'::jsonb
    when 'B2' then '{"monologue":[0,1,3,5],"interaction":[0,1,3,5],"lexique":[0,1,3,5],"morpho":[0,1,3,5],"phono":[0,1,3,5]}'::jsonb
  end
$$;

-- 3. Kết thúc phần nói: đóng attempt PO (máy không chấm gì: score null, max 0)
--    và mở dòng po_cham để học sinh tự chấm sau.
create or replace function public.ket_thuc_po(p_attempt uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_cap text;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  select e.level into v_cap
    from attempts a join exams e on e.id = a.exam_id
    join exam_sections s on s.exam_id = a.exam_id and s.exercise_id = a.exercise_id and s.code = 'PO'
   where a.id = p_attempt and a.user_id = v_uid and a.mode = 'exam';
  if not found then raise exception 'KHONG_PHAI_PHAN_NOI' using errcode = '42501'; end if;
  update attempts set finished_at = coalesce(finished_at, now()), score = null, max = 0 where id = p_attempt;
  if public._thang_po(v_cap) is not null then
    insert into po_cham (attempt_id, user_id, cap) values (p_attempt, v_uid, v_cap)
    on conflict (attempt_id) do nothing;
  end if;
  return jsonb_build_object('ok', true, 'attempt', p_attempt, 'cap', v_cap, 'cham', public._thang_po(v_cap) is not null);
end $$;

-- 4. Lưu bản tự chấm. Máy chủ TỰ CỘNG; mọi tiêu chí phải có và đúng giá trị
--    in trên grille. Trả lại đúng thứ đã ghi (biên nhận, bài học 091).
create or replace function public.luu_po_tu_cham(p_attempt uuid, p_bang jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_cap text; v_thang jsonb; k text; v numeric; v_tong numeric := 0;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  select cap into v_cap from po_cham where attempt_id = p_attempt and user_id = v_uid;
  if not found then raise exception 'KHONG_THAY_BAI_NOI' using errcode = '42501'; end if;
  v_thang := public._thang_po(v_cap);
  for k in select jsonb_object_keys(v_thang) loop
    begin v := (p_bang ->> k)::numeric; exception when others then v := null; end;
    if v is null or not (v_thang -> k) @> to_jsonb(v) then
      raise exception 'SAI_THANG:%', k using errcode = '22023';
    end if;
    v_tong := v_tong + v;
  end loop;
  update po_cham set tu_cham = (select jsonb_object_agg(key, (p_bang ->> key)::numeric) from jsonb_object_keys(v_thang) key),
                     diem = v_tong, cap_nhat = now()
   where attempt_id = p_attempt;
  return jsonb_build_object('ok', true, 'diem', v_tong, 'cap', v_cap);
end $$;

revoke all on function public.ket_thuc_po(uuid) from public, anon;
revoke all on function public.luu_po_tu_cham(uuid, jsonb) from public, anon;
grant execute on function public.ket_thuc_po(uuid) to authenticated;
grant execute on function public.luu_po_tu_cham(uuid, jsonb) to authenticated;
notify pgrst, 'reload schema';
