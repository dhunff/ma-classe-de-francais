-- 143 · Quyền lợi VIP mới (14/10, theo chủ dự án).
--   1. Đề thi thử: tài khoản thường chỉ làm « Đề 1 » mỗi trình độ; đề khác cần VIP.
--   2. Bài viết mẫu do AI viết lại từ bài của học sinh (bảng bai_viet_mau, Edge Function viet-mau).
--   3. Báo cáo tiến bộ tuần (bao_cao_tuan).
--   4. Ôn lại câu sai (cau_sai_cua_toi).
-- Mọi kiểm tra VIP nằm ở MÁY CHỦ (la_vip), giao diện chỉ hiện khoá cho rõ.

-- ── 1. Đề chỉ dành cho VIP ──
alter table public.exams add column if not exists chi_vip boolean not null default false;
update public.exams set chi_vip = (title !~ 'Đề 1$');

create or replace function public.bat_dau_thi(p_exam_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); da int; v uuid;
begin
  if u is null then return jsonb_build_object('ok', false, 'ma', 'CHUA_DANG_NHAP'); end if;
  if exists (select 1 from public.exams where id = p_exam_id and chi_vip)
     and not public.is_teacher() and not public.la_vip(u) then
    return jsonb_build_object('ok', false, 'ma', 'CAN_VIP');
  end if;
  perform pg_advisory_xact_lock(hashtext('luot_thi:' || u::text));
  select count(*) into da from public.luot_thi where user_id = u and ngay = public._ngay_vn();
  if da >= 2 and not public.is_teacher() and not public.la_vip(u) then
    return jsonb_build_object('ok', false, 'ma', 'HET_LUOT', 'da_dung', da, 'gioi_han', 2);
  end if;
  update public.luot_thi set trang_thai = 'bo_do', ket_thuc = now() where user_id = u and trang_thai = 'dang_lam';
  insert into public.luot_thi (user_id, exam_id, ngay) values (u, p_exam_id, public._ngay_vn()) returning id into v;
  return jsonb_build_object('ok', true, 'luot_id', v, 'da_dung', da + 1, 'gioi_han', 2);
end $$;

-- Cửa thứ hai: mở attempt cho một bài trong đề VIP cũng bị chặn.
create or replace function public.exam_start(p_exercise_id text, p_exam_id uuid default null, p_mode text default 'exam')
returns uuid language plpgsql security definer set search_path = public as $$
declare me uuid := (select auth.uid()); cu uuid; moc timestamptz;
begin
  if me is null then raise exception 'chưa đăng nhập' using errcode = '28000'; end if;
  if p_exam_id is not null and exists (select 1 from public.exams where id = p_exam_id and chi_vip)
     and not public.is_teacher() and not public.la_vip(me) then
    raise exception 'CAN_VIP' using errcode = '42501';
  end if;
  if p_mode = 'exam' then
    select bat_dau into moc from public.luot_thi where user_id = me and trang_thai = 'dang_lam' order by bat_dau desc limit 1;
  end if;
  select id into cu from public.attempts
   where user_id = me and exercise_id = p_exercise_id and mode = p_mode
     and exam_id is not distinct from p_exam_id and finished_at is null
     and (moc is null or started_at >= moc)
   order by started_at desc limit 1;
  if cu is not null then return cu; end if;
  insert into public.attempts (user_id, exercise_id, mode, exam_id) values (me, p_exercise_id, p_mode, p_exam_id) returning id into cu;
  return cu;
end $$;

-- ── 2. Bài viết mẫu ──
create table if not exists public.bai_viet_mau (
  answer_id  uuid primary key references public.answers(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  noi_dung   jsonb not null,          -- { ban_mau, giai_thich: [...] }
  model      text,
  created_at timestamptz not null default now()
);
alter table public.bai_viet_mau enable row level security;
drop policy if exists bai_viet_mau_doc on public.bai_viet_mau;
create policy bai_viet_mau_doc on public.bai_viet_mau for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke insert, update, delete on public.bai_viet_mau from anon, authenticated;

-- ── 3. Báo cáo tiến bộ tuần (VIP) ──
create or replace function public.bao_cao_tuan()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare u uuid := auth.uid(); hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
  if u is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if not public.la_vip(u) and not public.is_teacher() then return jsonb_build_object('ok', false, 'ma', 'CAN_VIP'); end if;
  return jsonb_build_object('ok', true,
    'tu', hom_nay - 6, 'den', hom_nay,
    'ky_nang', coalesce((select jsonb_agg(r order by r.sk) from (
        select sk,
          round(avg(a.score::numeric / nullif(a.max, 0)) filter (where (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date > hom_nay - 7) * 100) tuan_nay,
          round(avg(a.score::numeric / nullif(a.max, 0)) filter (where (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date between hom_nay - 13 and hom_nay - 7) * 100) tuan_truoc,
          count(*) filter (where (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date > hom_nay - 7) so_bai
        from attempts a join exercises x on x.id = a.exercise_id, unnest(x.skills) sk
        where a.user_id = u and a.finished_at is not null and a.max > 0
          and (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date > hom_nay - 14
        group by sk) r), '[]'::jsonb),
    'so_bai', (select count(*) from attempts where user_id = u and finished_at is not null and (finished_at at time zone 'Asia/Ho_Chi_Minh')::date > hom_nay - 7),
    'giay', (select coalesce(sum(giay_lam), 0) from attempts where user_id = u and finished_at is not null and (finished_at at time zone 'Asia/Ho_Chi_Minh')::date > hom_nay - 7),
    'ngay_hoc', (select count(distinct (finished_at at time zone 'Asia/Ho_Chi_Minh')::date) from attempts where user_id = u and finished_at is not null and (finished_at at time zone 'Asia/Ho_Chi_Minh')::date > hom_nay - 7),
    'sai_lap', coalesce((select jsonb_agg(r) from (
        select q.prompt, x.title, x.id exercise_id, count(*) so_lan
        from answers an join attempts a on a.id = an.attempt_id join questions q on q.id = an.question_id join exercises x on x.id = q.exercise_id
        where a.user_id = u and an.correct = false
        group by q.id, q.prompt, x.title, x.id having count(*) >= 2
        order by count(*) desc limit 5) r), '[]'::jsonb),
    'goi_y', coalesce((select jsonb_agg(r) from (
        select x.id, x.title, x.level from exercises x
        where x.store = 'practice' and x.skills && array[(
            select sk from attempts a join exercises y on y.id = a.exercise_id, unnest(y.skills) sk
            where a.user_id = u and a.finished_at is not null and a.max > 0
            group by sk order by avg(a.score::numeric / a.max) asc limit 1)]
          and not exists (select 1 from attempts a where a.user_id = u and a.exercise_id = x.id)
          and coalesce((x.meta ->> 'isPremium')::boolean, false) = false
        order by x.created_at limit 3) r), '[]'::jsonb));
end $$;

-- ── 4. Câu sai chưa sửa được (VIP) ──
-- Một câu « chưa thuộc » khi LẦN TRẢ LỜI GẦN NHẤT của câu đó vẫn sai.
create or replace function public.cau_sai_cua_toi()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if not public.la_vip(u) and not public.is_teacher() then return jsonb_build_object('ok', false, 'ma', 'CAN_VIP'); end if;
  return (with moi as (
      select distinct on (an.question_id) an.question_id, an.correct, a.finished_at
      from answers an join attempts a on a.id = an.attempt_id
      where a.user_id = u and an.correct is not null and a.finished_at is not null
      order by an.question_id, a.finished_at desc),
    dem as (
      select an.question_id, count(*) filter (where an.correct = false) so_lan_sai
      from answers an join attempts a on a.id = an.attempt_id where a.user_id = u group by an.question_id)
    select jsonb_build_object('ok', true,
      'da_sua', (select count(*) from moi m join dem d using (question_id) where m.correct and d.so_lan_sai > 0),
      'cau', coalesce(jsonb_agg(jsonb_build_object('question_id', q.id, 'prompt', q.prompt, 'type', q.type,
               'exercise_id', x.id, 'title', x.title, 'level', x.level, 'store', x.store,
               'so_lan_sai', d.so_lan_sai, 'lan_cuoi', m.finished_at, 'loi_giai', q.explanation)
               order by d.so_lan_sai desc, m.finished_at desc), '[]'::jsonb))
    from moi m join dem d using (question_id) join questions q on q.id = m.question_id join exercises x on x.id = q.exercise_id
    where m.correct = false);
end $$;

revoke all on function public.bao_cao_tuan() from public, anon;
revoke all on function public.cau_sai_cua_toi() from public, anon;
grant execute on function public.bao_cao_tuan() to authenticated;
grant execute on function public.cau_sai_cua_toi() to authenticated;
notify pgrst, 'reload schema';
