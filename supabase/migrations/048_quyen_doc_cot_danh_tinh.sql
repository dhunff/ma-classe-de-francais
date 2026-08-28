-- 048 — cấp quyền ĐỌC cho ba cột danh tính
--
-- Chạy sau 046. Không phụ thuộc 047, chạy trước hay sau đều được.
--
-- ══════════════════════════════════════════════════════════════════════════
-- TRIỆU CHỨNG
-- ══════════════════════════════════════════════════════════════════════════
--
-- 046 chạy xong, SQL Editor xác nhận ba cột có mặt:
--
--     cot_moi = 3    rang_buoc = 4
--
-- Ứng dụng vẫn không thấy gì:
--
--     {"code":"42703","message":"column profiles.display_name does not exist"}
--
-- Hai bên nói ngược nhau, và cả hai đều đúng.
--
-- ══════════════════════════════════════════════════════════════════════════
-- NGUYÊN NHÂN: GRANT Ở MỨC CỘT KHÔNG ÁP CHO CỘT THÊM SAU
-- ══════════════════════════════════════════════════════════════════════════
--
-- `public.profiles` được cấp SELECT theo TỪNG CỘT, không phải cả bảng. Quyền
-- kiểu đó là một danh sách tên cột đóng băng tại thời điểm cấp — thêm cột mới
-- thì cột ấy KHÔNG có trong danh sách, và không có gì báo.
--
-- Đo được:
--
--     has_column_privilege('anon','public.profiles','name','select')          → true
--     has_column_privilege('anon','public.profiles','display_name','select')  → false
--
-- PostgREST dựng lược đồ từ những cột nó ĐỌC ĐƯỢC. Cột không có quyền thì
-- không vào lược đồ, và câu trả lời cho nó là "column does not exist" — do
-- chính PostgREST sinh ra, không phải Postgres. Nhận ra bằng `details` và
-- `hint` đều null; lỗi 42703 thật của Postgres gần như luôn kèm gợi ý
-- "Perhaps you meant to reference the column …".
--
-- Vì vậy `notify pgrst, 'reload schema'` không cứu được: nạp lại bao nhiêu lần
-- thì cột vẫn nằm ngoài tầm đọc, và lược đồ mới vẫn không có nó.
--
-- ── Dự án đã dính bẫy này một lần, theo chiều NGƯỢC LẠI ──
--
-- Migration 022 thu quyền cột `questions.answer_key`, và `select("*")` trên
-- bảng đó trả 401 cho CẢ CÂU thay vì trả về ít cột hơn — cả thư viện trắng
-- xoá. CLAUDE.md ghi lại rồi.
--
-- Cùng một cơ chế, hai triệu chứng khác nhau, nên tôi không nối được hai
-- chuyện với nhau: lần đó thu quyền làm HỎNG CẢ CÂU, lần này thiếu quyền làm
-- MỘT CỘT TRÔNG NHƯ KHÔNG TỒN TẠI. Bài học chung, viết cho lần sau:
--
--     Thêm cột vào một bảng có quyền cấp theo cột thì PHẢI cấp quyền cho cột
--     mới trong cùng migration. Nếu không, cột ấy vô hình với ứng dụng và
--     hoàn toàn không có dấu hiệu nào chỉ về phía quyền hạn.

-- ══════════════════════════════════════════════════════════════════════════
-- CẤP QUYỀN
-- ══════════════════════════════════════════════════════════════════════════
--
-- ── Vì sao `anon` cũng được đọc ──
--
-- Nghe như nới lỏng, nhưng không: RLS quyết định THẤY DÒNG NÀO, GRANT quyết
-- định thấy CỘT NÀO, và hai lớp nhân với nhau chứ không cộng. Cả hai policy
-- đọc của 003 (`profiles_read_self`, `profiles_read_teacher`) đều `to
-- authenticated`, nên `anon` không khớp policy nào và luôn nhận về MẢNG RỖNG.
--
-- Đúng như hiện trạng: `anon` đọc được cột `email` của bảng này từ lâu, và
-- vẫn không lấy ra được email của ai. Ba cột mới cũng vậy.
--
-- Cấp cho `anon` để bộ kiểm ĐO ĐƯỢC TỪ NGOÀI bằng khoá công khai. Nếu chỉ cấp
-- cho `authenticated` thì `check:db` không bao giờ phân biệt nổi "cột chưa
-- tồn tại" với "cột có nhưng khoá anon không đọc được" — và ta lại rơi đúng
-- vào tình trạng ba ngày qua: một triệu chứng, bốn nguyên nhân, không có phép
-- đo nào chia được chúng.
--
-- ── KHÔNG cấp UPDATE ──
--
-- Đường ghi đi qua `update_my_identity()` trong 047, là `security definer`.
-- Lý do đầy đủ ở đầu 046: GRANT gắn với VAI, mà giáo viên và học sinh cùng là
-- vai `authenticated`, nên cấp UPDATE ở đây là cấp cho cả hai.

grant select (display_name, username, avatar)
  on public.profiles to anon, authenticated;

-- ══════════════════════════════════════════════════════════════════════════
-- KIỂM TRA SAU KHI CHẠY
-- ══════════════════════════════════════════════════════════════════════════
--
-- Ba cột mới phải `true`. Cột `role` để đối chiếu — nếu nó cũng false thì vấn
-- đề rộng hơn ba cột này và đừng dừng ở đây.
--
-- Rồi đo lại TỪ NGOÀI: `npm run check:db`. Lệnh chạy xong không bao giờ là
-- bằng chứng — riêng lần này thì câu đó đã đúng theo nghĩa đen ba lần liền.

select
  has_column_privilege('anon', 'public.profiles', 'display_name', 'select') as dn,   -- true
  has_column_privilege('anon', 'public.profiles', 'username',     'select') as un,   -- true
  has_column_privilege('anon', 'public.profiles', 'avatar',       'select') as av,   -- true
  has_column_privilege('anon', 'public.profiles', 'role',         'select') as role_cu;  -- true

-- Còn cột nào khác của `profiles` đang bị bỏ quên không?
--
-- Câu này liệt kê mọi cột `anon` KHÔNG đọc được. Sau khi chạy phần trên, nó
-- nên rỗng. Ra tên cột nào thì cột đó cũng đang vô hình với ứng dụng, và sẽ
-- gây đúng loại lỗi vừa mất ba ngày để tìm.

select a.attname as cot_anon_khong_doc_duoc
from pg_attribute a
where a.attrelid = 'public.profiles'::regclass
  and a.attnum > 0
  and not a.attisdropped
  and not has_column_privilege('anon', a.attrelid, a.attname, 'select')
order by a.attnum;
