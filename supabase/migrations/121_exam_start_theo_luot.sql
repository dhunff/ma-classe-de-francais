-- 121 (07/10): lần thi mới KHÔNG dùng lại lượt làm bài của lần thi cũ.
--
-- Lỗi thật: học sinh thoát giữa buổi thi, attempts của buổi đó còn
-- finished_at NULL (10 dòng lúc sửa). Lần thi sau, exam_start « dùng lại lần
-- chưa kết thúc » (024) và nhận luôn bộ đếm lượt nghe đã tiêu → vừa bấm phát
-- đã báo hết lượt.
--
-- Từ 120 mỗi buổi thi có một dòng luot_thi. Chỉ dùng lại attempt mở SAU lúc
-- lượt thi đang làm bắt đầu. Không sửa dòng cũ nào (giữ nguyên lịch sử).
-- Chưa có lượt thi (luyện tập, mode khác) thì giữ hành vi cũ.
create or replace function public.exam_start(p_exercise_id text, p_exam_id uuid default null, p_mode text default 'exam')
returns uuid language plpgsql security definer set search_path = public as $$
declare
  me uuid := (select auth.uid());
  cu uuid;
  moc timestamptz;
begin
  if me is null then
    raise exception 'chưa đăng nhập' using errcode = '28000';
  end if;
  if p_mode = 'exam' then
    select bat_dau into moc from public.luot_thi
     where user_id = me and trang_thai = 'dang_lam' order by bat_dau desc limit 1;
  end if;
  select id into cu
    from public.attempts
   where user_id = me
     and exercise_id = p_exercise_id
     and mode = p_mode
     and exam_id is not distinct from p_exam_id
     and finished_at is null
     and (moc is null or started_at >= moc)
   order by started_at desc limit 1;
  if cu is not null then return cu; end if;
  insert into public.attempts (user_id, exercise_id, mode, exam_id)
       values (me, p_exercise_id, p_mode, p_exam_id)
    returning id into cu;
  return cu;
end $$;
