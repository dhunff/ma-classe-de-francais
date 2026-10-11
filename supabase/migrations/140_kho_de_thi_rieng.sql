-- 140 · BÀI THI THỬ Ở KHO RIÊNG (13/10, theo chủ dự án): « bài ở đề thi thử
-- riêng, bài ở thư viện riêng ».
--
-- Thêm store = 'exam'. Mọi bài đang được đề thi tham chiếu chuyển sang kho đó
-- (GIỮ NGUYÊN id: lịch sử lượt thi, kết quả, bản ghi âm đều trỏ theo id).
-- Sáu bài vốn là bài THƯ VIỆN từ trước khi được ghép vào đề (id không phải
-- dạng nhap…/b1d2…/po_…) được NHÂN BẢN lại vào thư viện (id + '_tv', câu hỏi
-- kèm đáp án và neo) để thư viện không mất bài.
-- Màn thi đọc bài theo id (examStore.loadExam) nên không phụ thuộc kho.

alter table public.exercises drop constraint if exists exercises_store_check;
alter table public.exercises add constraint exercises_store_check
  check (store in ('practice', 'assignment', 'exam'));

-- 1. Bản sao cho thư viện của các bài thư viện gốc.
with goc as (
  select distinct x.* from public.exercises x
  join public.exam_sections s on s.exercise_id = x.id
  where x.id !~ '^(nhap|b1d2|po_)'
    and not exists (select 1 from public.exercises y where y.id = x.id || '_tv')
),
ex_moi as (
  insert into public.exercises (id, store, title, level, skills, usage_type, deadline, time_limit, consigne, reading_text, audio_url, image_url, meta, created_at, imported_at)
  select id || '_tv', 'practice', title, level, skills, usage_type, deadline, time_limit, consigne, reading_text, audio_url, image_url, meta, created_at, imported_at
  from goc
  returning id
)
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram, answer_key, evidence)
select q.id || '_tv', q.exercise_id || '_tv', q.ord, q.type, q.prompt, q.payload, q.explanation, q.competence, q.point_gram, q.answer_key, q.evidence
from public.questions q
where q.exercise_id in (select left(id, length(id) - 3) from ex_moi);

-- 2. Mọi bài trong đề thi → kho 'exam'.
update public.exercises x set store = 'exam'
 where exists (select 1 from public.exam_sections s where s.exercise_id = x.id)
   and x.store <> 'exam';
