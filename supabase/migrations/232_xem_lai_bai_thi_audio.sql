-- 232 (17/11, chủ dự án: « xem lại bài thi giống giao diện thi, học sinh cần xem đề để biết đáp án nằm ở đâu »).
-- xem_lai_bai_thi (207) trả thêm audio của bài nghe: 'audio_url' (file kiểu phòng thi) và 'audio_luyen'
-- (meta.audioLuyen: chỉ tài liệu, không có khoảng lặng, để nghe lại khi chữa bài). Mọi điều kiện khác giữ
-- nguyên 207: chỉ lượt ĐÃ NỘP, mode exam, của chính người gọi; bỏ phần Viết/Nói và câu open/formulaire;
-- KHÔNG trả evidence. Lời nghe (loi_nghe) vẫn chỉ đọc qua xem_loi_nghe (VIP), không thêm vào đây.
create or replace function public.xem_lai_bai_thi(p_attempts uuid[])
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'attempt_id', a.id, 'exam_id', a.exam_id, 'code', s.code, 'ord', s.ord,
      'exercise_id', x.id, 'title', x.title, 'level', x.level, 'consigne', x.consigne,
      'reading_text', x.reading_text, 'image_url', x.image_url,
      'audio_url', x.audio_url, 'audio_luyen', x.meta->>'audioLuyen',
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
