-- Cho người ĐÃ ĐĂNG NHẬP đọc bảng quyền truy cập.
--
-- LỖI ĐANG SỬA: policy trong 001 viết `to anon`, tức chỉ phủ vai khách. Trong
-- PostgreSQL, policy gắn với vai nào thì chỉ áp cho vai đó — `authenticated`
-- KHÔNG kế thừa từ `anon`. Nên học sinh sau khi đăng nhập thấy 0 dòng, và mọi
-- bài trả phí ở lại trạng thái khoá dù đã trả tiền.
--
-- Lúc viết 001 thì hệ thống chưa có Supabase Auth, mọi người đều là anon nên
-- policy đó đủ. Nó lặng lẽ sai kể từ ngày thêm đăng nhập.
--
-- Rất khó thấy khi kiểm bằng công cụ: gọi REST bằng anon key thì đọc được
-- bình thường. Chỉ phiên đăng nhập thật mới lộ ra.

drop policy if exists "anon can read access" on public.exercise_access;
drop policy if exists "read access"          on public.exercise_access;

create policy "read access"
  on public.exercise_access
  for select
  to anon, authenticated
  using (true);

-- Vẫn KHÔNG có policy insert/update/delete cho bất kỳ vai nào của client.
-- Chỉ Edge Function giữ service_role mới ghi được — service_role bỏ qua RLS.
-- Client ghi được nghĩa là học sinh tự mở khoá bài mà không trả tiền.
--
-- Kiểm tra sau khi chạy — phải thấy đúng một policy, cmd = SELECT, roles gồm
-- cả anon lẫn authenticated:
--
--   select policyname, cmd, roles from pg_policies
--   where tablename = 'exercise_access';
