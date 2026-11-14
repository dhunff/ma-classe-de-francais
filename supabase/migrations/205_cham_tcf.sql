-- 205 (14/11, chủ dự án): AI chấm Viết (PE) và Nói (PO) của đề TCF Canada / TCF tout public
-- theo thang 0 đến 20 của France Éducation international (Edge Function `cham-tcf`).
--
-- Bảng `tcf_cham`: một dòng cho mỗi lượt làm phần PE hoặc PO của đề TCF. `ket_qua` là phiếu AI
-- (mức từng tâche, nhận xét theo ba nhóm tiêu chí FEI, lỗi, lời khuyên), `diem` 0..20, `cap` mức
-- CECRL, `nclc` (chỉ TCF Canada). `de_boc` = đề nói học sinh đã bốc (ghi lúc đóng phần nói).
-- Học sinh CHỈ ĐỌC dòng của mình; giáo viên đọc được hết; KHÔNG ai ghi qua API: đường ghi duy nhất
-- là Edge Function (service_role) và hàm ket_thuc_po (security definer) bên dưới.
create table if not exists public.tcf_cham (
  attempt_id uuid primary key references public.attempts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  code       text not null check (code in ('PE', 'PO')),
  level      text not null check (level in ('TCF', 'TCF_TP')),
  de_boc     jsonb,
  ket_qua    jsonb,
  diem       integer check (diem between 0 and 20),
  cap        text,
  nclc       integer,
  ai_luc     timestamptz,
  tao_luc    timestamptz not null default now()
);
create index if not exists tcf_cham_user_idx on public.tcf_cham (user_id, ai_luc);
alter table public.tcf_cham enable row level security;
drop policy if exists tcf_cham_doc on public.tcf_cham;
create policy tcf_cham_doc on public.tcf_cham for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke all on public.tcf_cham from anon;
revoke insert, update, delete on public.tcf_cham from authenticated;
grant select on public.tcf_cham to authenticated;

-- Đóng phần nói: đề TCF không có grille DELF nên trước đây không lưu đề đã bốc. Nay ghi vào tcf_cham.
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
  elsif v_cap in ('TCF', 'TCF_TP') then
    insert into tcf_cham (attempt_id, user_id, code, level, de_boc)
    values (p_attempt, v_uid, 'PO', v_cap, case when jsonb_typeof(p_de) = 'array' then p_de end)
    on conflict (attempt_id) do nothing;
  end if;
  return jsonb_build_object('ok', true, 'attempt', p_attempt, 'cap', v_cap,
    'cham', public._thang_po(v_cap) is not null or v_cap in ('TCF', 'TCF_TP'));
end $$;
revoke all on function public.ket_thuc_po(uuid, jsonb) from public, anon;
grant execute on function public.ket_thuc_po(uuid, jsonb) to authenticated;
notify pgrst, 'reload schema';
