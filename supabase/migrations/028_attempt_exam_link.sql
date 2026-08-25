-- 028 — nối lần làm bài với ĐỀ THI
--
-- LỖI Ở 026. File đó thêm cột `attempts.exam_id` rồi… không bao giờ điền vào.
-- `exam_start` chỉ nhận (exercise_id, mode), nên mọi lượt thi đều để cột đó
-- NULL. Đã đếm trên dữ liệu thật: 2 lượt thi, 0 lượt có exam_id.
--
-- HẬU QUẢ. Mỗi phần thi là một `attempt` riêng (một bài = một attempt). Không
-- có exam_id thì ba dòng CO/CE/PE của cùng một buổi thi trông y như ba lần
-- luyện tập rời rạc — không gom lại thành một lượt thi để tính tổng /100 và
-- kết luận đạt/trượt. Tức là màn hình kết quả không dựng được.
--
-- Kiểu lỗi đáng ghi nhớ: thêm cột là việc dễ, và chính vì dễ nên dễ quên vế
-- thứ hai. Một cột không ai ghi vào thì im lặng y như cột không tồn tại, chỉ
-- khác là nó khiến người đọc lược đồ tưởng tính năng đã có.

/* Đổi chữ ký nên phải drop rồi tạo lại — `create or replace` không đổi được
   danh sách tham số. Drop kéo theo mất quyền, nên phải cấp lại ở dưới. */
drop function if exists public.exam_start(text, text);

create or replace function public.exam_start(
  p_exercise_id text,
  p_exam_id     uuid default null,
  p_mode        text default 'exam'
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := (select auth.uid());
  cu uuid;
begin
  if me is null then
    raise exception 'chưa đăng nhập' using errcode = '28000';
  end if;

  /* Dùng lại lần chưa kết thúc — đây là thứ chặn "F5 để nghe lại" (xem 024).
     So cả `exam_id`: hai đề khác nhau có thể dùng chung một bài, và khi đó
     lượt thi dở của đề A không được nhận nhầm sang đề B. `is not distinct
     from` chứ không phải `=`, vì cả hai vế có thể NULL (luyện tập). */
  select id into cu
    from public.attempts
   where user_id = me
     and exercise_id = p_exercise_id
     and mode = p_mode
     and exam_id is not distinct from p_exam_id
     and finished_at is null
   order by started_at desc limit 1;

  if cu is not null then return cu; end if;

  insert into public.attempts (user_id, exercise_id, mode, exam_id)
       values (me, p_exercise_id, p_mode, p_exam_id)
    returning id into cu;
  return cu;
end $$;

revoke execute on function public.exam_start(text, uuid, text) from anon, public;
grant  execute on function public.exam_start(text, uuid, text) to authenticated;

do $$
declare loi text := '';
begin
  if has_function_privilege('anon', 'public.exam_start(text,uuid,text)', 'execute')
     then loi := loi || 'anon gọi được exam_start; '; end if;
  if not has_function_privilege('authenticated', 'public.exam_start(text,uuid,text)', 'execute')
     then loi := loi || 'authenticated MẤT quyền exam_start; '; end if;
  /* Bản 2 tham số phải biến mất hẳn: còn nó thì client gọi nhầm bản cũ và
     exam_id lại NULL, đúng lỗi file này sinh ra để sửa. */
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname='public' and p.proname='exam_start'
                and pg_get_function_identity_arguments(p.oid) = 'text, text')
     then loi := loi || 'bản exam_start(text,text) cũ vẫn còn; '; end if;

  if loi <> '' then raise exception 'exam_start HỎNG: %', loi; end if;
  raise notice 'exam_start nhận exam_id, quyền đúng vai, bản cũ đã gỡ';
end $$;
