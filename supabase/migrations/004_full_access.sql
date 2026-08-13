-- Quyền mở toàn bộ bài trả phí cho một học sinh.
--
-- Trước đây giáo viên muốn mở hết cho một em thì phải cấp từng bài một, và
-- mỗi bài mới tạo lại phải nhớ cấp lại. Cột này là "mở tất, kể cả bài sau
-- này" — dùng cho học sinh đã đóng học phí trọn gói.
--
-- Cần 003_profiles.sql chạy trước. Chạy trong SQL Editor.

alter table public.profiles
  add column if not exists has_premium_access boolean not null default false;

-- Ai đang được mở toàn quyền — tiện đối chiếu về sau.
create index if not exists profiles_premium_idx
  on public.profiles (has_premium_access)
  where has_premium_access;

-- RLS không cần đổi: policy trong 003 đã cho giáo viên toàn quyền ghi
-- profiles, và học sinh chỉ đọc được dòng của chính mình. Nghĩa là học sinh
-- ĐỌC được cờ này của mình (giao diện cần biết để bỏ ổ khoá) nhưng không tự
-- bật lên được.
--
-- Kiểm tra sau khi chạy:
--
--   select email, has_premium_access from public.profiles order by email;
