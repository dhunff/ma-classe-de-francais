-- 044 — cho phép nhiều bài tập trong cùng một kỹ năng
--
-- ══ KHÔNG CẦN ĐỔI LƯỢC ĐỒ ══
--
-- `exam_sections` ĐÃ là bảng nối: (exam_id, code, exercise_id, ord). Nó vốn
-- chứa được nhiều dòng cùng `code`. Thứ duy nhất chặn là một ràng buộc:
--
--     unique (exam_id, code)
--
-- Nên không thêm cột mảng `co_exercise_ids uuid[]`, không dựng bảng mới. Cột
-- mảng nghe gọn nhưng mất `ord`, mất khoá ngoại tới `exercises`, và mọi truy
-- vấn "bài này đang nằm trong đề nào" thành quét mảng.
--
-- ══ THAY BẰNG RÀNG BUỘC KHÁC, KHÔNG BỎ TRỐNG ══
--
-- `unique (exam_id, code, exercise_id)` chặn việc thêm CÙNG một bài hai lần vào
-- cùng một kỹ năng. Gỡ ràng buộc cũ mà không đặt gì vào chỗ đó thì giáo viên
-- bấm nhầm hai lần là đề có hai bản của một bài, và học sinh làm lại y hệt —
-- không có gì báo, và điểm phần đó bị nhân đôi trọng số.
--
-- ══ MỘT CÂU LỆNH ══
--
-- `alter table` nhận nhiều hành động ngăn bằng dấu phẩy, nên drop và add đi
-- cùng nhau trong một câu. Xem CLAUDE.md: ba migration liên tiếp từng "chạy
-- xong" mà dữ liệu không đổi, và một câu lệnh loại sạch cả một lớp nghi ngờ.
--
-- Chạy lại được: `drop ... if exists` và tên ràng buộc mới cố định, nên lần
-- chạy thứ hai chỉ báo lỗi trùng tên chứ không làm hỏng gì.

-- ══ TÊN RÀNG BUỘC: ĐÃ XÁC NHẬN ══
--
-- Ràng buộc cũ khai inline trong `create table` ở 026 nên Postgres tự đặt tên.
-- Tên thật là `exam_sections_exam_id_code_key` — không phải đoán nữa: chính
-- production nói ra nó, qua thông báo lỗi khi giáo viên bấm Lưu một đề có hai
-- bài trong cùng một kỹ năng:
--
--     duplicate key value violates unique constraint
--     "exam_sections_exam_id_code_key"
--
-- Tên thứ hai giữ lại cho chắc, và vô hại: `drop ... if exists` không nổ khi
-- tên không tồn tại.
--
-- Vẫn chạy 045 sau. Không phải để biết tên — mà vì `drop ... if exists` im lặng
-- khi trượt, và im lặng thì trông y hệt thành công.

alter table public.exam_sections
  drop constraint if exists exam_sections_exam_id_code_key,
  drop constraint if exists exam_sections_exam_id_code_unique,
  add  constraint exam_sections_khong_trung_bai unique (exam_id, code, exercise_id);
