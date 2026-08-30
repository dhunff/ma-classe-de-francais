-- 058 — KIỂM 057 (chạy RIÊNG, sau khi 057 đã chạy xong). Chỉ ĐỌC.

-- Bucket phải tồn tại và phải RIÊNG TƯ. `public = true` ở đây nghĩa là mọi
-- bản ghi âm của học sinh nằm ở URL đoán được.
select id, public as cong_khai, file_size_limit as gioi_han_byte
from storage.buckets
where id = 'bai-noi';                       -- cong_khai phải là false

-- Đúng ba policy, và KHÔNG có policy nào cho xoá hay sửa.
--
-- polcmd: r = select, a = insert, w = update, d = delete, * = all
-- Thấy 'w', 'd' hay '*' ở đây nghĩa là ai đó đã mở đường ghi đè lên bản ghi
-- của học sinh — hoặc đường xoá, và xoá thì không lấy lại được.
select polname, polcmd
from pg_policy
where polrelid = 'storage.objects'::regclass
  and polname like 'bai_noi%'
order by polname;

-- Phân quyền dựa vào đoạn thư mục đầu tiên bằng auth.uid(). Câu này in ra biểu
-- thức thật của từng policy để đọc bằng mắt — chỗ dễ sai nhất là chỉ số mảng:
-- `foldername(name)` đánh số từ 1, viết [0] thì luôn NULL và policy luôn sai.
select polname, pg_get_expr(polqual, polrelid) as dieu_kien_doc,
       pg_get_expr(polwithcheck, polrelid) as dieu_kien_ghi
from pg_policy
where polrelid = 'storage.objects'::regclass and polname like 'bai_noi%'
order by polname;

-- Bucket cũ vẫn công khai — đúng như thế, nó chứa đề bài. Câu này để thấy rõ
-- hai kho có chế độ khác nhau, và khác nhau là CÓ CHỦ Ý.
select id, public as cong_khai from storage.buckets order by id;
