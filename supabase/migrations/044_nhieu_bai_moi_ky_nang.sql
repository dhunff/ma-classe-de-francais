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

-- ══ VÌ SAO LIỆT KÊ HAI TÊN ══
--
-- Ràng buộc cũ khai inline trong `create table` ở migration 026, nên Postgres
-- TỰ đặt tên. Tên chuẩn là `<bảng>_<cột>_<cột>_key`, nhưng nếu nó khác thì
-- `drop constraint if exists` IM LẶNG không làm gì, câu `add` vẫn thành công,
-- và mọi thứ trông như đã xong trong khi vẫn bị chặn.
--
-- Nên thử cả hai cách đặt tên thường gặp. Và chạy 045 sau để biết chắc — đừng
-- tin vào việc câu lệnh này không báo lỗi.

alter table public.exam_sections
  drop constraint if exists exam_sections_exam_id_code_key,
  drop constraint if exists exam_sections_exam_id_code_unique,
  add  constraint exam_sections_khong_trung_bai unique (exam_id, code, exercise_id);
