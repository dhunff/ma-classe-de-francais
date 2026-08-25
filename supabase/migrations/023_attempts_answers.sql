-- 023 — bảng `attempts` + `answers`: ghi lại TỪNG CÂU, không chỉ điểm cả bài
--
-- ══ VÌ SAO ĐÂY LÀ VIỆC PHẢI LÀM TRƯỚC MODE EXAMEN ══
--
-- docs/roadmap-delf.md nói thẳng: "Đừng đảo thứ tự này. Làm thi thử trước khi
-- có bảng `attempts` nghĩa là làm lại nó ở giai đoạn 2." Lý do cụ thể:
--
--   · `attempts.mode` là ranh giới giữa luyện tập và thi thử. Không có cột đó
--     thì hai thang điểm trộn vào nhau ngay từ dòng dữ liệu đầu tiên, và tách
--     lại thì phải đoán dòng nào thuộc loại nào.
--   · Giới hạn nghe 2 lần (§2.3) phải đếm ở máy chủ, và chỗ đếm là
--     `attempts.audio_plays`. Giữ trong state React thì học sinh tải lại trang
--     là đếm lại từ đầu — mà đó chính là thứ họ sẽ thử.
--
-- Và nó đóng luôn một câu hỏi treo suốt từ lúc bắt đầu viết giải thích:
-- **"câu nào học sinh hay sai"** hiện KHÔNG đo được. `submissions` chỉ có vài
-- dòng, còn lịch sử luyện tập ghi điểm theo CẢ BÀI. Có `answers` thì thứ tự ưu
-- tiên viết giải thích lấy được từ dữ liệu thay vì từ phán đoán sư phạm.
--
-- ══ SỬA MỘT CHỖ SPEC ĐÃ LỖI THỜI ══
--
-- Roadmap viết `exercise_id uuid references exercises`. Sai — id của
-- `exercises` và `questions` là TEXT, giữ nguyên từ blob cũ, đúng ràng buộc số
-- 1 của migration 010 (`submissions.exercise_id` trỏ vào chúng). Dùng uuid ở
-- đây là khoá ngoại không tạo được. Đã sửa trong file này; roadmap cập nhật
-- sau.

create table if not exists public.attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  exercise_id  text not null references public.exercises on delete cascade,

  /* Ranh giới hai thang điểm (§3.0). MỌI truy vấn thống kê phải lọc theo cột
     này — bỏ sót một chỗ là số liệu lẫn ngay, và lẫn rồi thì không tách lại
     được vì không còn gì phân biệt. */
  mode         text not null default 'practice' check (mode in ('practice', 'exam')),

  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  score        int,
  max          int,

  /* {question_id: số lượt đã phát} — xem §2.3. */
  audio_plays  jsonb not null default '{}'::jsonb,

  /* Số lần rời tab. Roadmap §2.2: ghi nhận và nhắc nhẹ, KHÔNG chặn. Đây là tự
     học, không phải phòng thi có giám thị. */
  blur_count   int not null default 0
);

create table if not exists public.answers (
  id           uuid primary key default gen_random_uuid(),
  attempt_id   uuid not null references public.attempts on delete cascade,
  question_id  text not null references public.questions on delete cascade,
  raw          jsonb,
  correct      boolean,
  ms_spent     int,

  /* Một câu chỉ có một dòng trong mỗi lần làm. Thiếu ràng buộc này thì gọi
     hàm chấm hai lần là dữ liệu nhân đôi và mọi tỉ lệ đều sai. */
  unique (attempt_id, question_id)
);

/* Truy vấn "câu này bao nhiêu người sai" chạy trên đúng cặp cột này. */
create index if not exists answers_question_correct_idx
  on public.answers (question_id, correct);
create index if not exists attempts_user_finished_idx
  on public.attempts (user_id, finished_at desc);
/* Lọc theo mode xảy ra ở gần như mọi truy vấn thống kê. */
create index if not exists attempts_mode_idx on public.attempts (mode, finished_at desc);

-- ─────────────────────────── RLS ───────────────────────────
--
-- Học sinh chỉ thấy bài làm của chính mình. Giáo viên cần xem thì THÊM policy
-- riêng cho vai prof, giống cách 005 làm với submissions — đừng nới policy này
-- thành "prof đọc tất", vì khi đó một lỗi ở hàm is_teacher() là lộ toàn bộ.
alter table public.attempts enable row level security;
alter table public.answers  enable row level security;

drop policy if exists attempts_own on public.attempts;
drop policy if exists answers_own  on public.answers;

/* `(select auth.uid())` chứ không phải `auth.uid()` trần: bọc trong subquery
   thì PostgreSQL tính một lần cho cả câu thay vì tính lại trên từng dòng. */
create policy attempts_own on public.attempts for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy answers_own on public.answers for all to authenticated
  using (exists (select 1 from public.attempts a
                  where a.id = answers.attempt_id
                    and a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.attempts a
                       where a.id = answers.attempt_id
                         and a.user_id = (select auth.uid())));

-- ─────────────────────── Tự đối chiếu ───────────────────────
do $$
declare n_rls int; n_pol int; kieu text;
begin
  select count(*) into n_rls from pg_tables
   where schemaname = 'public' and tablename in ('attempts','answers') and rowsecurity;

  select count(*) into n_pol from pg_policies
   where schemaname = 'public' and tablename in ('attempts','answers');

  select data_type into kieu from information_schema.columns
   where table_schema = 'public' and table_name = 'answers' and column_name = 'question_id';

  raise notice 'bảng bật RLS: %/2 · policy: % · answers.question_id kiểu %',
    n_rls, n_pol, kieu;

  if n_rls <> 2 then raise exception 'RLS chưa bật đủ: %/2', n_rls; end if;
  if n_pol < 2  then raise exception 'thiếu policy: chỉ có %', n_pol; end if;
  /* Khoá ngoại kiểu sai thì insert sẽ hỏng lúc chạy thật, không phải lúc này. */
  if kieu <> 'text' then raise exception 'question_id phải là text, đang là %', kieu; end if;
end $$;
