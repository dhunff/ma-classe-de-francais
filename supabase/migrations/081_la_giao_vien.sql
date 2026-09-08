-- 081 — hỏi thẳng: phiên này có phải giáo viên không?
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO CẦN, DÙ ĐÃ CÓ `is_teacher()`
-- ══════════════════════════════════════════════════════════════════════════
--
-- `is_teacher()` chỉ gọi được từ trong SQL. Phía trình duyệt không có cách nào
-- hỏi "máy chủ có coi tôi là giáo viên không" — và sự thiếu vắng đó vừa làm
-- tôi kết luận sai.
--
-- Màn `/professeur/lien-he` đọc bảng `leads`. Người KHÔNG phải giáo viên vẫn
-- có quyền SELECT ở mức bảng; RLS lọc sạch mọi dòng và trả về một mảng RỖNG,
-- KHÔNG lỗi. Giao diện đọc mảng rỗng đó là "chưa có ai đăng ký".
--
-- Nghĩa là hai trạng thái hoàn toàn khác nhau —
--     · giáo viên, và chưa ai gửi
--     · không phải giáo viên, nên không thấy gì
-- — hiện ra y hệt nhau. Tôi đã dùng chính màn hình đó làm bằng chứng rằng
-- phiên của người dùng là giáo viên. Nó không chứng minh được điều đó.
--
-- Đây là lần thứ TƯ trong dự án cùng một họ lỗi: gộp "không làm được" với
-- "không có gì để làm". Ba lần trước ở `cau_can_loi_giai`, ở chuỗi ngày học,
-- và ở danh sách thẻ. Lần này nó còn làm hỏng một phép CHẨN ĐOÁN, nên nó tốn
-- hơn: tôi đi sai một lượt vì tin vào chính màn hình mình vừa viết.
--
-- Hàm này trả lời thẳng, không vòng qua dữ liệu. Không nhận tham số, không đọc
-- bảng nào, không lộ gì: nó chỉ nói lại điều mà máy chủ vốn đã biết về người
-- đang gọi.

create or replace function public.la_giao_vien()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select public.is_teacher(); $$;

revoke all on function public.la_giao_vien() from public, anon;
grant execute on function public.la_giao_vien() to authenticated;
