-- Tách bài nộp thành bảng riêng, mỗi bài một dòng.
--
-- VẤN ĐỀ: toàn bộ bài nộp của cả lớp nằm chung trong MỘT dòng kv_store
-- (`s:mcf-submissions`, một mảng JSON). Học sinh nộp bài nghĩa là ghi đè cả
-- dòng đó. RLS chỉ phân quyền được ở mức dòng, nên không có cách nào cho phép
-- "sửa bài của chính mình" mà cấm "ghi đè bài của người khác".
--
-- Sau 002, người lạ đã bị chặn. Nhưng một học sinh ĐÃ ĐĂNG NHẬP, nếu cố tình,
-- vẫn xoá sạch được bài của cả lớp. Bảng này đóng nốt lỗ đó.
--
-- Cần 003_profiles.sql chạy trước (dùng is_teacher và profiles).
--
-- CHÚ Ý: file này CHỈ tạo bảng và chép dữ liệu sang. Nó KHÔNG xoá
-- s:mcf-submissions — bản cũ ở lại làm bản sao lưu cho tới khi phía ứng dụng
-- đã chuyển hẳn và bạn xác nhận mọi thứ chạy đúng.

create table if not exists public.submissions (
  id           text primary key,
  exercise_id  text not null,
  student      text not null,
  user_id      uuid references auth.users on delete set null,
  graded       boolean not null default false,
  at           timestamptz,
  payload      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists submissions_student_idx  on public.submissions (student);
create index if not exists submissions_exercise_idx on public.submissions (exercise_id);
create index if not exists submissions_user_idx     on public.submissions (user_id);

/* `payload` giữ nguyên phần còn lại của bản ghi cũ (answers, autoScore,
   autoMax, openMarks, qComments, late, comment, redo…). Cố ý không tách từng
   trường thành cột: hình dạng đó do mã ứng dụng quyết định và còn đổi, mà mỗi
   lần đổi lại phải viết thêm một migration. Những trường CẦN cho phân quyền
   và tra cứu — student, exercise_id, user_id, graded — mới nâng lên thành cột. */

-- ─────────────────── Chép dữ liệu cũ sang (chạy một lần) ───────────────────
--
-- Khớp user_id qua tên trong profiles. Không khớp được thì để null: bài nộp
-- vẫn giữ nguyên, chỉ là chưa gắn được với tài khoản đăng nhập nào — thường
-- là bài của học sinh cũ đã bị xoá khỏi danh bạ.

insert into public.submissions (id, exercise_id, student, user_id, graded, at, payload)
select
  coalesce(s ->> 'id', gen_random_uuid()::text),
  coalesce(s ->> 'exerciseId', ''),
  coalesce(s ->> 'student', ''),
  p.id,
  coalesce((s ->> 'graded')::boolean, false),
  case when s ->> 'at' ~ '^\d{4}-' then (s ->> 'at')::timestamptz else null end,
  s - 'id' - 'exerciseId' - 'student' - 'graded' - 'at'
from public.kv_store k
cross join lateral jsonb_array_elements(k.value::jsonb) as s
left join public.profiles p on lower(p.name) = lower(s ->> 'student')
where k.key = 's:mcf-submissions'
  and jsonb_typeof(k.value::jsonb) = 'array'
on conflict (id) do nothing;

-- ─────────────────────────────── RLS ───────────────────────────────

alter table public.submissions enable row level security;

drop policy if exists submissions_read_own      on public.submissions;
drop policy if exists submissions_read_teacher  on public.submissions;
drop policy if exists submissions_insert_own    on public.submissions;
drop policy if exists submissions_update_own    on public.submissions;
drop policy if exists submissions_teacher_all   on public.submissions;

-- Học sinh đọc bài của chính mình.
create policy submissions_read_own on public.submissions
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Giáo viên đọc tất cả — cần để chấm.
create policy submissions_read_teacher on public.submissions
  for select to authenticated
  using (public.is_teacher());

/* Học sinh chỉ thêm được bài MANG TÊN MÌNH. `with check` bắt buộc phải có:
   thiếu nó thì ai cũng chèn được dòng gắn user_id của người khác. */
create policy submissions_insert_own on public.submissions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

/* Sửa bài của chính mình — dùng khi làm lại. Cả `using` lẫn `with check` đều
   khoá theo user_id, để không ai đổi được user_id sang người khác giữa chừng.

   KHÔNG cho học sinh sửa cột `graded`: RLS phân quyền theo dòng chứ không
   theo cột, nên chặn ở đây là không đủ — phía ứng dụng phải không gửi trường
   đó lên. Điểm số thì nằm trong payload và học sinh sửa được; đó là hạn chế
   còn lại, cần tách điểm ra cột riêng do giáo viên giữ mới đóng hẳn. */
create policy submissions_update_own on public.submissions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Giáo viên toàn quyền: chấm, sửa, xoá.
create policy submissions_teacher_all on public.submissions
  for all to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

-- Cố ý KHÔNG có policy delete cho học sinh: nộp rồi thì không tự xoá được.

-- ──────────────────────── Kiểm tra sau khi chạy ────────────────────────
--
--   select count(*) from public.submissions;
--   select count(*) from public.kv_store k,
--     lateral jsonb_array_elements(k.value::jsonb) where k.key = 's:mcf-submissions';
--
-- Hai số phải bằng nhau. Lệch nghĩa là phần chép sang bỏ sót — đừng chuyển
-- ứng dụng sang bảng mới cho tới khi khớp.
--
--   select count(*) from public.submissions where user_id is null;
--
-- Số này là những bài không khớp được tài khoản nào; chúng vẫn đọc được với
-- giáo viên nhưng học sinh sẽ không thấy bài cũ của mình cho tới khi gắn lại.
