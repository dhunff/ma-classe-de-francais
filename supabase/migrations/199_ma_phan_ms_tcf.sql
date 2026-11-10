-- 199 — cho phép phần MS (Maîtrise des structures de la langue) trong exam_sections
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- TCF tout public (TCF của Pháp, 10/11 theo chủ dự án) có BA bài trắc nghiệm bắt buộc:
-- Compréhension orale, Maîtrise des structures de la langue, Compréhension écrite. Bài giữa
-- không có trong DELF lẫn TCF Canada, nên mã phần 'MS' chưa có trong danh sách đóng của
-- exam_sections_code_check. Không thêm thì giáo viên soạn đề TCF Pháp, bấm « Lưu đề » và
-- nhận lỗi 23514, đúng bức tường 059 từng gặp với PO.
--
-- Mở rộng danh sách, không dỡ hàng rào (lý do giữ danh sách đóng: xem 059).

alter table public.exam_sections
  drop constraint if exists exam_sections_code_check;

alter table public.exam_sections
  add constraint exam_sections_code_check
  check (code = any (array['CO', 'CE', 'PE', 'PO', 'MS']));
