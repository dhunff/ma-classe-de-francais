-- 207 (14/11, chủ dự án): « Xem lại bài thi » cho đề thi thử DELF/DALF và TCF.
-- Trả về, cho các lượt làm ĐÃ NỘP của CHÍNH người gọi (mode 'exam'): câu hỏi, đáp án đúng
-- (answer_key), lời giải, câu trả lời đã nộp, đúng/sai, điểm và nhận xét đã lưu (câu court,
-- lời giải thích AI của giai-thich-cau). Bỏ phần Viết/Nói (đã có phiếu chấm riêng) và câu `open`.
--
-- Vì sao được lộ answer_key ở đây: bài ĐÃ NỘP, không sửa lại được; Edge Function `grade` vốn đã trả
-- đáp án cho câu làm sai. Chưa nộp (finished_at null) thì không trả gì. `evidence` (neo) không trả.
-- Một câu lệnh tạo hàm + hai câu quyền (thu khỏi anon/public, cấp cho authenticated).
create or replace function public.xem_lai_bai_thi(p_attempts uuid[])
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'attempt_id', a.id, 'exam_id', a.exam_id, 'code', s.code, 'ord', s.ord,
      'exercise_id', x.id, 'title', x.title, 'level', x.level, 'consigne', x.consigne,
      'reading_text', x.reading_text, 'image_url', x.image_url,
      'questions', (
        select coalesce(jsonb_agg(jsonb_build_object(
            'id', q.id, 'ord', q.ord, 'type', q.type, 'prompt', q.prompt,
            'payload', q.payload, 'answer_key', q.answer_key, 'explanation', q.explanation,
            'raw', an.raw, 'correct', an.correct, 'score', an.score, 'max_score', an.max_score, 'feedback', an.feedback
          ) order by q.ord, q.id), '[]'::jsonb)
        from public.questions q
        left join public.answers an on an.attempt_id = a.id and an.question_id = q.id
        where q.exercise_id = x.id and q.type not in ('open', 'formulaire'))
    ) order by s.ord nulls last, a.started_at), '[]'::jsonb)
  from public.attempts a
  join public.exercises x on x.id = a.exercise_id
  left join public.exam_sections s on s.exam_id = a.exam_id and s.exercise_id = a.exercise_id
  where a.id = any(p_attempts)
    and a.user_id = (select auth.uid())
    and a.mode = 'exam'
    and a.finished_at is not null
    and coalesce(s.code, '') not in ('PE', 'PO');
$$;
revoke all on function public.xem_lai_bai_thi(uuid[]) from public, anon;
grant execute on function public.xem_lai_bai_thi(uuid[]) to authenticated;
