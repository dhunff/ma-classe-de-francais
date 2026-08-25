-- 026 — đề thi thử do GIÁO VIÊN soạn
--
-- ══ VÌ SAO CẦN BẢNG NÀY ══
--
-- Mode Examen hiện lắp đề bằng `assemblePaper`: bốc ngẫu nhiên một bài mỗi kỹ
-- năng từ thư viện luyện tập. Chạy được, nhưng không phải một đề thi.
--
-- Đề thi thật là một VẬT PHẨM CÓ CHỦ Ý: ba phần chọn cho hợp nhau về chủ đề và
-- độ khó, cân theo đúng thang điểm, giáo viên chịu trách nhiệm. Máy bốc ngẫu
-- nhiên thì học sinh có thể trúng phần CO trình độ B1 dễ đi kèm phần CE khó
-- nhất thư viện, và điểm cuối cùng chẳng nói lên gì.
--
-- ══ VÌ SAO KHÔNG DỰNG KHO CÂU HỎI MỚI ══
--
-- Cách hiển nhiên là cho `exams` một cột jsonb chứa thẳng câu hỏi, audio, bài
-- đọc, đề viết. Đừng. Ba thứ sẽ bị tách đôi ngay lập tức:
--
--   1. ĐÁP ÁN. Từ 022, đáp án nằm ở `questions.answer_key`, không cấp SELECT
--      cho anon/authenticated. Câu hỏi trong một cột jsonb của `exams` sẽ mang
--      đáp án theo, và cả tường đó sập.
--   2. VIỆC CHẤM. Edge Function `grade` đọc bảng `questions`. Kho thứ hai
--      nghĩa là đường chấm thứ hai — và `check:parity` không canh được nó.
--   3. TRÌNH SOẠN. Builder.jsx đã làm đủ sáu loại câu hỏi, nhập DOCX, nhập
--      JSON. Viết lại một bản rút gọn cho riêng đề thi là hai trình soạn cùng
--      tồn tại, và cái nào cũng thiếu tính năng của cái kia.
--
-- Nên đề thi CHỈ THAM CHIẾU bài có sẵn. Giáo viên soạn bài bằng Builder như
-- thường, rồi chọn ba bài ghép thành đề. Mỗi thứ ở đúng một chỗ.

create table if not exists public.exams (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  level         text not null default 'B1',
  /* Thời lượng thật nằm ở từng phần (exam_sections.minutes) vì DELF tính giờ
     riêng cho mỗi kỹ năng. Cột này chỉ để hiện nhanh trên thẻ danh sách. */
  duration_min  int,
  is_published  boolean not null default false,
  created_by    uuid references auth.users on delete set null,
  created_at    timestamptz not null default now()
);

create table if not exists public.exam_sections (
  id           uuid primary key default gen_random_uuid(),
  exam_id      uuid not null references public.exams on delete cascade,
  code         text not null check (code in ('CO', 'CE', 'PE')),
  /* Trỏ tới bài trong thư viện. `text` vì id của exercises là text — ràng buộc
     số 1 của migration 010, không đổi được. */
  exercise_id  text not null references public.exercises on delete restrict,
  minutes      int  not null,
  points       int  not null default 25,
  ord          int  not null default 0,

  /* Mỗi kỹ năng đúng một lần trong một đề. Thiếu ràng buộc này thì giáo viên
     bấm lưu hai lần là đề có hai phần CO, và tổng điểm vượt 100. */
  unique (exam_id, code)
);

/* `on delete restrict` ở trên là cố ý: xoá một bài đang nằm trong đề thi sẽ bị
   TỪ CHỐI, chứ không âm thầm làm rỗng một phần của đề. Giáo viên phải gỡ khỏi
   đề trước — hơi phiền một lần, còn hơn một đề thi thủng lỗ mà không ai biết
   cho tới lúc học sinh mở ra. */

create index if not exists exam_sections_exam_idx on public.exam_sections (exam_id, ord);
create index if not exists exams_published_idx on public.exams (is_published, level);

/* Nối lần làm bài với đề thi. Nullable vì luyện tập không thuộc đề nào. */
alter table public.attempts
  add column if not exists exam_id uuid references public.exams on delete set null;

-- ─────────────────────────── RLS ───────────────────────────
alter table public.exams enable row level security;
alter table public.exam_sections enable row level security;

drop policy if exists exams_read       on public.exams;
drop policy if exists exams_write      on public.exams;
drop policy if exists exam_sec_read    on public.exam_sections;
drop policy if exists exam_sec_write   on public.exam_sections;

/* Học sinh chỉ thấy đề ĐÃ PHÁT HÀNH. Giáo viên thấy cả bản nháp — nếu không,
   họ không mở lại được đề mình đang soạn dở. */
create policy exams_read on public.exams
  for select to anon, authenticated
  using (is_published or public.is_teacher());

create policy exams_write on public.exams
  for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

/* Phần thi đi theo đề: thấy đề thì thấy phần. Viết lại điều kiện thay vì mở
   `using (true)` — mở ra là lộ cấu trúc đề nháp trước ngày thi. */
create policy exam_sec_read on public.exam_sections
  for select to anon, authenticated
  using (exists (select 1 from public.exams e
                  where e.id = exam_sections.exam_id
                    and (e.is_published or public.is_teacher())));

create policy exam_sec_write on public.exam_sections
  for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

-- ─────────────────────── Tự đối chiếu ───────────────────────
do $$
declare n_rls int; n_pol int; loi text := '';
begin
  select count(*) into n_rls from pg_tables
   where schemaname = 'public' and tablename in ('exams','exam_sections') and rowsecurity;
  if n_rls <> 2 then loi := loi || 'RLS chưa bật đủ (' || n_rls || '/2); '; end if;

  select count(*) into n_pol from pg_policies
   where schemaname = 'public' and tablename in ('exams','exam_sections');
  if n_pol < 4 then loi := loi || 'thiếu policy (' || n_pol || '); '; end if;

  if not exists (select 1 from information_schema.columns
                  where table_schema='public' and table_name='attempts' and column_name='exam_id')
    then loi := loi || 'attempts thiếu exam_id; '; end if;

  /* Ràng buộc quan trọng nhất của file này — kiểm cho chắc nó tồn tại thật. */
  if not exists (select 1 from pg_constraint
                  where conrelid = 'public.exam_sections'::regclass and contype = 'u')
    then loi := loi || 'thiếu unique(exam_id, code); '; end if;

  if loi <> '' then raise exception 'lược đồ đề thi HỎNG: %', loi; end if;
  raise notice 'exams + exam_sections OK, attempts.exam_id OK';
end $$;
