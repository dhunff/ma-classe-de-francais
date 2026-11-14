-- 202 (14/11, lô 44, đề TCF): audio RIÊNG cho từng câu nghe, như thi TCF trên máy (mỗi câu một
-- đoạn, nghe MỘT lần). Màn thi gọi exam_play_audio với p_question = id câu; câu có `payload.audio`
-- thì giới hạn 1 lượt. Bài « nghe kiểu thi » (ex:<id> + meta.ngheKieuThi) vẫn 1, còn lại 2 như cũ.
-- Một câu lệnh; quyền giữ nguyên như 119 (create or replace không đổi grant, cấp lại cho chắc).
create or replace function public.exam_play_audio(p_attempt uuid, p_question text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select public._exam_play((select auth.uid()), p_attempt, p_question,
    case when exists (select 1 from public.exercises e
                      where p_question = 'ex:' || e.id and (e.meta ->> 'ngheKieuThi')::boolean is true)
           or exists (select 1 from public.questions q
                      where q.id = p_question and q.payload ? 'audio')
         then 1 else 2 end);
$$;
revoke execute on function public.exam_play_audio(uuid, text) from anon, public;
grant  execute on function public.exam_play_audio(uuid, text) to authenticated;
