-- 137 · (13/10) Bốc thăm đề nói: lưu ĐỀ học sinh đã bốc + chọn vào po_cham,
-- để màn tự chấm và AI (cham-po) biết bài nói trả lời đề nào.
alter table public.po_cham add column if not exists de_boc jsonb;

drop function if exists public.ket_thuc_po(uuid);
create or replace function public.ket_thuc_po(p_attempt uuid, p_de jsonb default null)
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
    insert into po_cham (attempt_id, user_id, cap, de_boc)
    values (p_attempt, v_uid, v_cap, case when jsonb_typeof(p_de) = 'array' then p_de end)
    on conflict (attempt_id) do nothing;
  end if;
  return jsonb_build_object('ok', true, 'attempt', p_attempt, 'cap', v_cap, 'cham', public._thang_po(v_cap) is not null);
end $$;
revoke all on function public.ket_thuc_po(uuid, jsonb) from public, anon;
grant execute on function public.ket_thuc_po(uuid, jsonb) to authenticated;
notify pgrst, 'reload schema';
