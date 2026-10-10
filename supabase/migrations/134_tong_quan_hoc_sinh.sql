-- 134 · Tổng quan học sinh cho giáo viên (10/10). Hai RPC chỉ ĐỌC, chỉ giáo viên.
-- Số liệu đều tính từ bảng thật: attempts, daily_activity, profiles.

-- Mỗi học sinh một dòng: hoạt động gần nhất, chuỗi ngày, bài/giờ 7 ngày, điểm TB,
-- XP, VIP, lượt thi thử gần nhất (điểm theo kỹ năng, quy về /25).
create or replace function public.tong_quan_hoc_sinh()
returns table (
  id uuid, lan_cuoi_online timestamptz, hoat_dong_cuoi timestamptz, chuoi int,
  bai_7_ngay int, giay_7_ngay int, diem_tb numeric, tong_bai int,
  xp int, vip_den timestamptz, thi jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'KHONG_PHAI_GIAO_VIEN' using errcode = '42501'; end if;
  return query
  select p.id, p.lan_cuoi_online,
    greatest(p.lan_cuoi_online, (select max(a.finished_at) from attempts a where a.user_id = p.id)),
    coalesce(public._chuoi_ngay(p.id), 0)::int,
    (select count(*) from attempts a where a.user_id = p.id and a.finished_at > now() - interval '7 days')::int,
    (select coalesce(sum(a.giay_lam), 0) from attempts a where a.user_id = p.id and a.finished_at > now() - interval '7 days')::int,
    (select round(avg(a.score::numeric / nullif(a.max, 0)) * 100, 0) from attempts a where a.user_id = p.id and a.finished_at is not null and a.max > 0),
    (select count(*) from attempts a where a.user_id = p.id and a.finished_at is not null)::int,
    coalesce(p.xp_balance, 0)::int, p.vip_den,
    (select jsonb_build_object('exam_id', t.exam_id, 'title', e.title, 'luc', t.luc, 'phan', t.phan)
       from (select a.exam_id, max(a.finished_at) luc,
               jsonb_object_agg(k.code, k.diem) phan
             from attempts a
             join lateral (select a2.exam_id from attempts a2 where a2.user_id = p.id and a2.exam_id is not null and a2.finished_at is not null
                           order by a2.finished_at desc limit 1) gn on gn.exam_id = a.exam_id
             join lateral (
               select s.code, case when sum(a3.max) > 0 and bool_and(a3.score is not null)
                                   then round(sum(a3.score)::numeric / sum(a3.max) * 25, 1) end as diem
               from exam_sections s join attempts a3 on a3.exercise_id = s.exercise_id and a3.exam_id = s.exam_id and a3.user_id = p.id
               where s.exam_id = a.exam_id and s.code <> 'PO'
               group by s.code) k on true
             where a.user_id = p.id
             group by a.exam_id) t
       join exams e on e.id = t.exam_id)
  from profiles p where p.role = 'eleve';
end $$;
revoke all on function public.tong_quan_hoc_sinh() from public, anon;
grant execute on function public.tong_quan_hoc_sinh() to authenticated;

-- Chi tiết một học sinh: 30 lượt làm gần nhất + các câu sai nhiều nhất.
create or replace function public.chi_tiet_hoc_sinh(p_uid uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'KHONG_PHAI_GIAO_VIEN' using errcode = '42501'; end if;
  return jsonb_build_object(
    'luot', coalesce((select jsonb_agg(r order by r.luc desc) from (
        select a.id, x.title, x.level, x.skills, a.mode, a.score, a.max, a.giay_lam, a.finished_at luc, e.title de
        from attempts a join exercises x on x.id = a.exercise_id left join exams e on e.id = a.exam_id
        where a.user_id = p_uid and a.finished_at is not null
        order by a.finished_at desc limit 30) r), '[]'::jsonb),
    'cau_sai', coalesce((select jsonb_agg(r) from (
        select q.prompt, x.title, count(*) so_lan
        from answers an join attempts a on a.id = an.attempt_id join questions q on q.id = an.question_id join exercises x on x.id = q.exercise_id
        where a.user_id = p_uid and an.correct = false
        group by q.id, q.prompt, x.title order by count(*) desc, max(a.finished_at) desc limit 10) r), '[]'::jsonb),
    'theo_ky_nang', coalesce((select jsonb_object_agg(k, v) from (
        select sk k, round(avg(a.score::numeric / nullif(a.max, 0)) * 100, 0) v
        from attempts a join exercises x on x.id = a.exercise_id, unnest(x.skills) sk
        where a.user_id = p_uid and a.finished_at is not null and a.max > 0
        group by sk) r), '{}'::jsonb));
end $$;
revoke all on function public.chi_tiet_hoc_sinh(uuid) from public, anon;
grant execute on function public.chi_tiet_hoc_sinh(uuid) to authenticated;
notify pgrst, 'reload schema';
