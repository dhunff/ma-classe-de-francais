-- ═══════════════════════════════════════════════════════════════════════════
-- LƯU CÂU HỎI CỦA MỘT BÀI — MỘT HÀM, MỘT TRANSACTION   (26/09)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ══ LỖI ĐANG SỐNG TỪ 24/09: MỌI LẦN BẤM LƯU BÀI ĐỀU HỎNG ══
-- 24/09 saveExercise đổi từ "xoá rồi chèn" sang `upsert` để không xoá lịch sử
-- trả lời (answers.question_id ON DELETE CASCADE). Nhưng
-- INSERT … ON CONFLICT DO UPDATE đòi quyền SELECT trên các cột bị ghi, mà
-- `answer_key` + `evidence` CỐ Ý không cấp SELECT cho authenticated (022,
-- 075) → 42501 "permission denied for table questions". Phép thử hôm đó chỉ
-- dùng các cột không bị khoá nên xanh.
--
-- Hàm này làm việc đó ở máy chủ: kiểm is_teacher(), ghi đè từng câu theo id,
-- xoá câu không còn trong bài — tất cả trong MỘT transaction, nên hoặc đủ hết
-- hoặc không gì cả (bản client cũ là nhiều lời gọi rời, hỏng giữa chừng thì
-- bài dở dang). Trả về số câu của bài sau khi ghi để client đối chiếu.

create or replace function public.luu_cau_hoi(p_exercise_id text, p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r   jsonb;
  ids text[] := '{}';
  so  int;
begin
  if not public.is_teacher() then
    raise exception 'chỉ giáo viên mới lưu được bài' using errcode = '42501';
  end if;
  if not exists (select 1 from public.exercises where id = p_exercise_id) then
    raise exception 'không có bài %', p_exercise_id using errcode = '22023';
  end if;
  if jsonb_typeof(p_rows) <> 'array' then
    raise exception 'p_rows phải là mảng' using errcode = '22023';
  end if;

  for r in select * from jsonb_array_elements(p_rows) loop
    ids := ids || (r ->> 'id');
    insert into public.questions
      (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram, answer_key, evidence)
    values (
      r ->> 'id', p_exercise_id, (r ->> 'ord')::int, r ->> 'type', r ->> 'prompt',
      coalesce(r -> 'payload', '{}'::jsonb), r ->> 'explanation', r ->> 'competence', r ->> 'point_gram',
      case when r ? 'answer_key' and jsonb_typeof(r -> 'answer_key') <> 'null' then r -> 'answer_key' end,
      case when r ? 'evidence'   and jsonb_typeof(r -> 'evidence')   <> 'null' then r -> 'evidence' end)
    on conflict (id) do update set
      exercise_id = excluded.exercise_id, ord = excluded.ord, type = excluded.type,
      prompt = excluded.prompt, payload = excluded.payload, explanation = excluded.explanation,
      competence = excluded.competence, point_gram = excluded.point_gram,
      answer_key = excluded.answer_key, evidence = excluded.evidence;
  end loop;

  delete from public.questions
   where exercise_id = p_exercise_id and not (id = any(ids));

  select count(*) into so from public.questions where exercise_id = p_exercise_id;
  return jsonb_build_object('ok', true, 'so_cau', so);
end $$;

revoke all on function public.luu_cau_hoi(text, jsonb) from public, anon;
grant execute on function public.luu_cau_hoi(text, jsonb) to authenticated;
