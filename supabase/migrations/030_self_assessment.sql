-- 030 — học sinh TỰ CHẤM bài viết, và xem bài mẫu sau khi nộp
--
-- ══ ĐỔI HƯỚNG ══
--
-- 029 cho AI chấm và ghi thẳng vào điểm chính thức. Người dùng đổi ý: thay vì
-- vậy, học sinh tự chấm theo tiêu chí DELF và đối chiếu với bài mẫu.
--
-- Đổi hướng này tốt hơn ở ba mặt, không chỉ mặt tiền bạc:
--   · Không có bài viết nào của học sinh rời khỏi hệ thống.
--   · Không có con số nào chưa ai đọc mà đã thành điểm chính thức.
--   · Đọc lại bài mình theo từng tiêu chí là chỗ người học vỡ ra nhiều nhất —
--     một con số ai đó đưa cho thì không dạy được điều đó.
--
-- Gỡ hẳn các cột AI thay vì để đó: chưa dòng nào dùng (đã đếm: ai_score = 0),
-- và cột không ai ghi vào thì chỉ khiến người đọc lược đồ tưởng tính năng còn
-- sống. Lịch sử nằm trong git.

alter table public.answers
  drop column if exists ai_score,
  drop column if exists ai_breakdown,
  drop column if exists ai_model,
  drop column if exists ai_at,
  drop column if exists score_from_ai;

/* `_grade_pe` từng hạ cờ `score_from_ai`; cờ không còn nên viết lại cho khớp. */
create or replace function public._grade_pe(
  p_teacher uuid, p_answer uuid, p_score numeric, p_max numeric, p_feedback text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare loai text;
begin
  select q.type into loai
    from public.answers a join public.questions q on q.id = a.question_id
   where a.id = p_answer;

  if loai is null then return jsonb_build_object('ok', false, 'reason', 'not_found'); end if;
  if loai <> 'open' then return jsonb_build_object('ok', false, 'reason', 'not_open'); end if;
  if p_score is null or p_score < 0 or p_score > p_max then
    return jsonb_build_object('ok', false, 'reason', 'score_out_of_range');
  end if;

  update public.answers
     set score = p_score, max_score = p_max, feedback = nullif(btrim(p_feedback), ''),
         graded_by = p_teacher, graded_at = now()
   where id = p_answer;

  return jsonb_build_object('ok', true, 'score', p_score);
end $$;
revoke execute on function public._grade_pe(uuid, uuid, numeric, numeric, text)
  from anon, authenticated, public;

-- ─────────────── Chỗ lưu bản tự chấm ───────────────
--
-- TÁCH HẲN khỏi `score`. Tự chấm KHÔNG phải điểm — nhập chung một cột thì
-- không còn cách nào phân biệt "em tự cho mình 20" với "giáo viên cho 20", và
-- mọi thống kê sau này đều lẫn.
alter table public.answers
  add column if not exists self_score      numeric(4,1),
  add column if not exists self_breakdown  jsonb,
  add column if not exists self_at         timestamptz;

comment on column public.answers.self_score is
  'Điểm học sinh TỰ chấm theo grille DELF. Không phải điểm chính thức — xem `score`.';

-- ─────────────── Ghi bản tự chấm ───────────────
--
-- Qua RPC vì 024 đã thu quyền ghi thẳng vào `answers` khỏi trình duyệt.
-- Chỉ CHỦ bài làm được tự chấm, và chỉ sau khi đã NỘP — tự chấm trước khi nộp
-- thì không còn là tự chấm, mà là xem trước rồi sửa bài cho khớp.
create or replace function public.save_self_assessment(
  p_answer uuid, p_score numeric, p_max numeric, p_breakdown jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare me uuid := (select auth.uid()); chu uuid; xong timestamptz; loai text;
begin
  if me is null then return jsonb_build_object('ok', false, 'reason', 'unauthenticated'); end if;

  select t.user_id, t.finished_at, q.type into chu, xong, loai
    from public.answers a
    join public.attempts t on t.id = a.attempt_id
    join public.questions q on q.id = a.question_id
   where a.id = p_answer;

  if chu is null or chu <> me then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if loai <> 'open' then
    return jsonb_build_object('ok', false, 'reason', 'not_open');
  end if;
  if xong is null then
    return jsonb_build_object('ok', false, 'reason', 'not_submitted');
  end if;
  if p_score is null or p_score < 0 or p_score > p_max then
    return jsonb_build_object('ok', false, 'reason', 'score_out_of_range');
  end if;

  update public.answers
     set self_score = p_score, max_score = coalesce(max_score, p_max),
         self_breakdown = p_breakdown, self_at = now()
   where id = p_answer;

  return jsonb_build_object('ok', true, 'score', p_score);
end $$;

-- ─────────────── Xem bài mẫu — CHỈ sau khi nộp ───────────────
--
-- Bài mẫu nằm ở `questions.answer_key.model`, mà `answer_key` không cấp SELECT
-- cho trình duyệt (022). Đúng như vậy: thấy bài mẫu TRƯỚC khi làm thì bài viết
-- không còn đo được gì.
--
-- Hàm này mở đúng một khe: người đã NỘP câu đó thì đọc được bài mẫu của nó.
create or replace function public.get_model_answer(p_question text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare me uuid := (select auth.uid()); da_nop boolean;
begin
  if me is null then return null; end if;

  /* Giáo viên xem lúc nào cũng được — họ soạn ra nó. */
  if public.is_teacher() then
    return (select answer_key ->> 'model' from public.questions where id = p_question);
  end if;

  select exists (
    select 1 from public.answers a
      join public.attempts t on t.id = a.attempt_id
     where a.question_id = p_question and t.user_id = me and t.finished_at is not null
  ) into da_nop;

  if not da_nop then return null; end if;
  return (select answer_key ->> 'model' from public.questions where id = p_question);
end $$;

/* Thu đích danh anon + authenticated, không chỉ public — bài học từ 024/025. */
revoke execute on function public.save_self_assessment(uuid, numeric, numeric, jsonb)
  from anon, public;
revoke execute on function public.get_model_answer(text) from anon, public;
grant  execute on function public.save_self_assessment(uuid, numeric, numeric, jsonb)
  to authenticated;
grant  execute on function public.get_model_answer(text) to authenticated;

-- ─────────────────── Tự đối chiếu ───────────────────
do $$
declare loi text := '';
begin
  if exists (select 1 from information_schema.columns
              where table_schema='public' and table_name='answers'
                and column_name in ('ai_score','ai_breakdown','ai_model','ai_at','score_from_ai'))
     then loi := loi || 'còn sót cột AI; '; end if;

  if not exists (select 1 from information_schema.columns
                  where table_schema='public' and table_name='answers' and column_name='self_score')
     then loi := loi || 'thiếu self_score; '; end if;

  if has_function_privilege('anon', 'public.get_model_answer(text)', 'execute')
     then loi := loi || 'anon đọc được bài mẫu; '; end if;
  if has_function_privilege('anon', 'public.save_self_assessment(uuid,numeric,numeric,jsonb)', 'execute')
     then loi := loi || 'anon ghi được tự chấm; '; end if;
  if not has_function_privilege('authenticated', 'public.get_model_answer(text)', 'execute')
     then loi := loi || 'authenticated MẤT quyền xem bài mẫu; '; end if;

  if loi <> '' then raise exception 'tự chấm HỎNG: %', loi; end if;
  raise notice 'gỡ cột AI, thêm self_score, hai RPC khoá đúng vai';
end $$;
