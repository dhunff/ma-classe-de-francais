-- Quyền truy cập bài tập trả phí.
--
-- Vì sao tách khỏi kv_store: kv_store cho `anon` toàn quyền đọc ghi, mà anon
-- key nằm sẵn trong bundle gửi xuống trình duyệt. Bất cứ thứ gì lưu ở đó đều
-- có thể bị người dùng tự sửa. Với quyền truy cập trả phí thì điều đó nghĩa là
-- ai cũng tự mở khoá được mà không trả tiền.
--
-- Bảng này đảo lại: ĐỌC thoải mái, GHI thì không client nào làm được. Chỉ
-- Edge Function giữ service_role mới ghi — service_role bỏ qua RLS.
--
-- Chạy trong SQL Editor của Supabase project.

create table if not exists public.exercise_access (
  id           bigserial primary key,
  student      text        not null,
  exercise_id  text        not null,
  status       text        not null check (status in ('PURCHASED', 'GRANTED_BY_TEACHER')),
  amount       integer,                  -- số tiền thực nhận, để đối chiếu về sau
  ref          text unique,              -- mã giao dịch SePay; chống ghi trùng khi webhook gửi lại
  created_at   timestamptz not null default now(),
  unique (student, exercise_id)
);

create index if not exists exercise_access_student_idx
  on public.exercise_access (student);

alter table public.exercise_access enable row level security;

-- Đọc: mở cho anon. Danh sách "ai được mở bài nào" không phải thông tin nhạy cảm,
-- và giao diện cần nó để biết hiện ổ khoá hay nút luyện tập.
drop policy if exists "anon can read access" on public.exercise_access;
create policy "anon can read access"
  on public.exercise_access
  for select
  to anon
  using (true);

-- KHÔNG có policy insert/update/delete cho anon.
-- Thiếu policy nghĩa là bị từ chối — đó chính là mục đích. Đừng thêm vào.
-- Mọi thao tác ghi phải đi qua Edge Function dùng service_role.
