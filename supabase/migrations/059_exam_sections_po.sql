-- 059 — cho phép phần PO trong exam_sections
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- ══════════════════════════════════════════════════════════════════════════
-- CHỖ NÀY LÀ BỨC TƯỜNG MÀ CẢ TÍNH NĂNG PO ĐÂM VÀO
-- ══════════════════════════════════════════════════════════════════════════
--
-- Ràng buộc đang có:
--
--     check (code = any (array['CO', 'CE', 'PE']))
--
-- Nghĩa là mọi thứ đã làm cho Production orale — cấu trúc đề, ô bỏ chọn, bộ
-- ghi âm, kho file riêng, màn nghe của giáo viên — đều không tới được người
-- dùng, vì không ghép được PO vào một đề nào cả. Giáo viên bấm « Lưu đề » và
-- nhận một lỗi 23514 khô khốc.
--
-- Đáng chú ý: KHÔNG bộ kiểm nào bắt được. `check:exam` đọc mã nguồn,
-- `check:db` đọc cột chứ không đọc ràng buộc CHECK. Cả hai đều xanh trong khi
-- tính năng chết ở tầng dưới cùng. Đã thêm ca kiểm ở 060 và ở check:db.
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO KHÔNG BỎ HẲN RÀNG BUỘC
-- ══════════════════════════════════════════════════════════════════════════
--
-- Danh sách đóng vẫn đáng giữ: nó chặn một mã gõ sai ('CQ', 'PO ') đi thẳng
-- vào database rồi hiện ra như một phần thi ma mà không màn hình nào dựng nổi.
-- Nên mở rộng danh sách, không dỡ hàng rào.

alter table public.exam_sections
  drop constraint if exists exam_sections_code_check;

alter table public.exam_sections
  add constraint exam_sections_code_check
  check (code = any (array['CO', 'CE', 'PE', 'PO']));

-- ══════════════════════════════════════════════════════════════════════════
-- ĐIỂM CỦA PHẦN PO PHẢI LÀ 0
-- ══════════════════════════════════════════════════════════════════════════
--
-- `verdict` loại PO khỏi mọi phép tính theo MÃ, nên một dòng PO mang 25 điểm
-- không làm sai kết quả hôm nay. Nhưng nó là một quả mìn: bất kỳ chỗ nào về
-- sau cộng `points` thẳng từ database — một bảng thống kê, một bản xuất Excel —
-- sẽ ra /100 cho một kỳ thi /75, và con số đó trông hoàn toàn hợp lý.
--
-- Rẻ hơn nhiều nếu database từ chối ngay từ đầu.

alter table public.exam_sections
  drop constraint if exists exam_sections_po_khong_diem;

alter table public.exam_sections
  add constraint exam_sections_po_khong_diem
  check (code <> 'PO' or points = 0);

-- Kiểm chứng chạy ở một lần Run RIÊNG — xem 060.
-- KHÔNG đặt câu kiểm ở đây: nó nằm cùng transaction với DDL nên báo thành công
-- cho việc có thể bị cuộn ngược. 046 đã trả giá cho đúng chuyện này.
