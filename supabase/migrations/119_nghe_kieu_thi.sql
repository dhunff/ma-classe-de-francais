-- 119 (07/10): bài nghe « kiểu phòng thi ».
--
-- File nghe dựng theo đúng trình tự đề DELF: thời gian đọc câu hỏi → lượt nghe 1
-- → nghỉ → lượt nghe 2 → thời gian hoàn thành. Hai lượt nghe đã nằm TRONG file,
-- nên ở màn thi thử chỉ được bấm phát MỘT lần; để mặc định 2 lần là cho nghe 4.
--
-- Cờ nằm ở exercises.meta.ngheKieuThi (giáo viên không sửa được qua đường nào
-- học sinh chạm tới). Bài không có cờ giữ nguyên 2 lượt như 024.
create or replace function public.exam_play_audio(p_attempt uuid, p_question text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select public._exam_play((select auth.uid()), p_attempt, p_question,
    case when exists (select 1 from public.exercises e
                      where p_question = 'ex:' || e.id and (e.meta ->> 'ngheKieuThi')::boolean is true)
         then 1 else 2 end);
$$;
revoke execute on function public.exam_play_audio(uuid, text) from anon, public;
grant  execute on function public.exam_play_audio(uuid, text) to authenticated;
