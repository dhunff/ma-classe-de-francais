-- 043 — xoá 6 bài tập trùng lặp
--
-- ══ XOÁ CÁI GÌ ══
--
--   L'environnement et les défis écologiques — 5 bản, giữ bản MỚI NHẤT
--       xoá: mrj6t5wali67qy · mrj6wcudr2r79s · mrj70scogofu3t · mrj7nahwn1ul5c
--       giữ: msetswhmv6iywm  (2026-08-04)
--
--   La technologie et ses enjeux sociétaux — 3 bản, giữ bản MỚI NHẤT
--       xoá: mrkly9hcips8yj · mrkm005o8boc8u
--       giữ: mrkm0jxn35lxlm  (2026-07-14)
--
-- Sáu bài này chứa 60 câu là bản sao ĐÚNG TỪNG CHỮ của 20 câu trong hai bản
-- được giữ. Đã đối chiếu bằng cách băm tập câu hỏi của từng bài.
--
-- ══ ĐÃ SOÁT RÀNG BUỘC TRƯỚC ══
--
-- Đo ngày 27/08 bằng khoá anon:
--   · 0 dòng `exam_sections` trỏ tới sáu bài này — không đề thi nào dùng
--   · 0 dòng `exercise_access` — không ai đã trả tiền cho chúng
--
-- Cột `exam_sections.exercise_id` khai `on delete restrict`, nên nếu có đề thi
-- nào trỏ tới thì câu lệnh dưới đây sẽ LỖI chứ không âm thầm phá đề. Đó là
-- hàng rào thật, không phải phép đo của tôi.
--
-- ══ CÒN LỊCH SỬ HỌC SINH THÌ SAO ══
--
-- `attempts` và `submissions` bị RLS che khỏi khoá anon, nên tôi KHÔNG đo được
-- từ ngoài. Câu lệnh dưới đây tự lo: nó chỉ xoá bài nào KHÔNG có lượt làm và
-- KHÔNG có bài nộp nào.
--
-- Bài nào có lịch sử thì được giữ lại, và số bài xoá sẽ ít hơn 6. Đó là kết
-- quả ĐÚNG: một bản sao mà học sinh đã làm rồi thì không còn chỉ là bản sao —
-- xoá nó là xoá điểm và bài làm của người ta.
--
-- Chạy xong, đối chiếu bằng `npm run check:db` và bằng số bài trong thư viện.
--
-- ══ MỘT CÂU LỆNH DUY NHẤT ══
--
-- Xem 042: ba lần một file nhiều câu lệnh "chạy xong" mà dữ liệu không đổi, và
-- tôi không tìm ra cơ chế. Nên file này cũng chỉ có đúng một câu.
--
-- `questions` khai `on delete cascade` theo `exercise_id`, nên xoá bài là câu
-- hỏi của nó đi theo. Không cần dọn tay, và cũng không được dọn tay: xoá câu
-- hỏi trước rồi mới xoá bài là để lại một quãng bài rỗng.

delete from public.exercises e
 where e.id in (
         'mrj6t5wali67qy', 'mrj6wcudr2r79s', 'mrj70scogofu3t',
         'mrj7nahwn1ul5c', 'mrkly9hcips8yj', 'mrkm005o8boc8u'
       )
   and not exists (select 1 from public.attempts a    where a.exercise_id = e.id)
   and not exists (select 1 from public.submissions s where s.exercise_id = e.id);
