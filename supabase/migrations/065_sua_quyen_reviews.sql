-- 065 — sửa quyền cột trên `reviews`
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- ══════════════════════════════════════════════════════════════════════════
-- LẦN THỨ BA CÙNG MỘT CÁI BẪY TRONG DỰ ÁN
-- ══════════════════════════════════════════════════════════════════════════
--
-- Migration 063 viết:
--
--     revoke update (user_id, card_id) on public.reviews from anon, authenticated;
--
-- Câu đó KHÔNG làm gì cả. Supabase cấp UPDATE ở mức BẢNG cho `anon` và
-- `authenticated`, mà thu hồi một tập con cột không gỡ được một quyền cấp ở
-- mức bảng — quyền bảng phủ mọi cột, kể cả cột vừa "thu". Đo được ngay sau khi
-- 063 chạy: cả `user_id` lẫn `card_id` vẫn hiện trong
-- `information_schema.column_privileges` cho cả hai vai.
--
-- Dự án đã trả giá cho đúng chuyện này ở 022 và 024. Lần này bộ kiểm bắt được
-- trước khi ai kịp dùng — 064 (nay là 066) ném lỗi và cả lượt push dừng lại.
-- Đó chính là lý do phép kiểm phải nằm ở một lần Run riêng và phải THẬT SỰ đo,
-- chứ không chỉ đọc lại câu lệnh mình vừa viết.
--
-- Cách đúng, giống hệt migration 053 làm với `notifications.is_read`: thu
-- UPDATE ở MỨC BẢNG trước, rồi cấp lại đúng những cột được phép sửa.
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO `user_id` VÀ `card_id` PHẢI KHOÁ
-- ══════════════════════════════════════════════════════════════════════════
--
-- Policy `reviews_sua_cua_minh` kiểm cả `using` lẫn `with check`, nên về lý
-- thuyết không đổi dòng sang người khác được. Nhưng khoá quyền cột là lớp thứ
-- hai và nó không phụ thuộc vào việc đọc đúng một policy — mà policy thì sửa
-- được ở bất kỳ migration nào sau này, còn ai sửa nó sẽ không nghĩ tới đây.
--
-- `card_id` là khoá chính: đổi nó là trỏ dòng lịch của mình sang thẻ người
-- khác, tức là vòng qua mọi phép kiểm ở trên.

revoke update on public.reviews from anon, authenticated;

grant update (due_at, interval_days, ease, lapses, reps)
  on public.reviews to authenticated;

-- Kiểm chứng ở một lần Run RIÊNG — xem 066.
