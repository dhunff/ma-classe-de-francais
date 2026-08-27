-- 045 — kiểm 044 đã ăn chưa (CHỈ ĐỌC, chạy SAU 044)
--
-- 044 gỡ ràng buộc `unique (exam_id, code)` bằng cách đoán tên nó. Đoán sai thì
-- `drop constraint if exists` im lặng không làm gì và câu lệnh vẫn báo thành
-- công — nên phải nhìn vào catalog, không nhìn vào việc "không có lỗi".
--
-- Một câu lệnh, chỉ đọc, chạy lại bao nhiêu lần cũng được.

select
  /* Còn ràng buộc nào chỉ gồm đúng (exam_id, code) không? Phải là 0.
     Còn nó thì mỗi kỹ năng vẫn chỉ nhận một bài, và giáo viên bấm thêm bài thứ
     hai sẽ nhận một lỗi trùng khoá khó hiểu. */
  (select count(*)
     from pg_constraint c
    where c.conrelid = 'public.exam_sections'::regclass
      and c.contype = 'u'
      and (select array_agg(a.attname::text order by a.attname)
             from unnest(c.conkey) k
             join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k)
          = array['code', 'exam_id']
  ) as con_chan_mot_bai,

  /* Ràng buộc mới đã vào chưa? Phải là 1. Nó chặn thêm CÙNG một bài hai lần
     vào cùng một kỹ năng — gỡ cái cũ mà bỏ trống chỗ đó thì giáo viên bấm nhầm
     là điểm phần ấy bị nhân đôi trọng số, âm thầm. */
  (select count(*)
     from pg_constraint c
    where c.conrelid = 'public.exam_sections'::regclass
      and c.conname = 'exam_sections_khong_trung_bai'
  ) as rang_buoc_moi,

  /* Đề nào đang có nhiều hơn một bài trong cùng một kỹ năng — sau khi giáo viên
     soạn thì con số này lớn hơn 0. */
  (select count(*) from (
      select exam_id, code from public.exam_sections
       group by exam_id, code having count(*) > 1) t
  ) as ky_nang_da_co_nhieu_bai;

-- Mong đợi ngay sau 044:  con_chan_mot_bai = 0 · rang_buoc_moi = 1
-- `ky_nang_da_co_nhieu_bai` = 0 lúc này là bình thường: chưa ai soạn đề nhiều
-- bài. Nó chỉ có ý nghĩa sau khi bạn thử soạn một đề như vậy.
