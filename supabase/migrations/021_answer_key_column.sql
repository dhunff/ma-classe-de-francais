-- 021 — thêm cột `answer_key`, CHƯA chuyển gì vào
--
-- Bước một của hai. Tách ra vì hàm `grade` phải đọc được cột này TRƯỚC khi có
-- dữ liệu trong đó — `select ... answer_key` trên cột chưa tồn tại là lỗi, và
-- lỗi đó làm hỏng việc chấm của mọi học sinh cho tới khi migration chạy xong.
--
-- Thứ tự an toàn:
--   021 (đây)  thêm cột rỗng          → không ai bị ảnh hưởng
--   deploy     hàm đọc cả hai nguồn   → vẫn chấm bằng payload
--   022        chuyển đáp án + khoá   → hàm tự chuyển sang answer_key
--
-- Làm ngược bất kỳ chỗ nào cũng tạo ra một quãng thời gian mà bài không chấm
-- được. Với dữ liệu tĩnh thì quãng đó vô hại; với việc chấm bài thì nó nghĩa
-- là điểm sai gửi tới học sinh thật.
alter table public.questions
  add column if not exists answer_key jsonb not null default '{}'::jsonb;

comment on column public.questions.answer_key is
  'Đáp án. KHÔNG cấp SELECT cho anon/authenticated — xem migration 022.';
