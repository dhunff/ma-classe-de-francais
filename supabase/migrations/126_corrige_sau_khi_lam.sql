-- 126 · « Đề và đáp án » cho học sinh (09/10).
--
-- Học sinh không đọc được answer_key (022). Hàm này trả đáp án của MỘT bài,
-- CHỈ khi người gọi đã nộp bài đó ít nhất một lần (attempts.finished_at), hoặc
-- là giáo viên. Chưa làm thì 0 dòng: xem đáp án trước khi làm là phá cả bài
-- luyện tập lẫn XP (lượt nộp đầu tiên mới được cộng).
create or replace function public.corrige_bai(p_exercise_id text)
returns table (question_id text, answer_key jsonb)
language sql
stable
security definer
set search_path = public
as $fn$
  select q.id, q.answer_key
    from public.questions q
   where q.exercise_id = p_exercise_id
     and (public.is_teacher() or exists (
           select 1 from public.attempts a
            where a.user_id = (select auth.uid())
              and a.exercise_id = p_exercise_id
              and a.finished_at is not null))
$fn$;
revoke all on function public.corrige_bai(text) from public, anon, authenticated;
grant execute on function public.corrige_bai(text) to authenticated;
notify pgrst, 'reload schema';
