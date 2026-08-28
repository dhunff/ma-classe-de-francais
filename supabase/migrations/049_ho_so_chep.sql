-- 049 — chép hồ sơ mở rộng từ blob `s:mcf-profiles` sang cột
--
-- Cần 048 chạy trước (chín cột + tám ràng buộc).
--
-- ══════════════════════════════════════════════════════════════════════════
-- BLOB VẪN GIỮ NGUYÊN
-- ══════════════════════════════════════════════════════════════════════════
--
-- File này KHÔNG xoá `s:mcf-profiles`. Đó là khuôn của 005 và 007: tạo bảng,
-- chép dữ liệu, giữ blob làm sao lưu, đối chiếu số lượng, chỉ chuyển ứng dụng
-- sau khi hai số khớp. Xoá được thì để sau, khi đường ghi mới đã chạy qua
-- người dùng thật — và lúc đó là một migration riêng, để nếu sai thì biết
-- chính xác cái gì sai.
--
-- 051 sẽ gỡ quyền GHI của học sinh vào khoá này. Blob thành bản đông cứng chỉ
-- giáo viên đụng được: đúng thứ một bản sao lưu cần là.
--
-- ══════════════════════════════════════════════════════════════════════════
-- KHỚP NGƯỜI: qua TÊN, và đó là chỗ sẽ mất dữ liệu
-- ══════════════════════════════════════════════════════════════════════════
--
-- Blob khoá theo tên hiển thị lúc người đó điền biểu mẫu. `profiles` khoá theo
-- `auth.uid()`. Không có cầu nối nào ngoài `profiles.name`, nên khớp bằng
-- `lower(name)` — y như 005 đã làm cho bài nộp.
--
-- Hệ quả phải nói thẳng: ai đã ĐỔI TÊN kể từ lúc điền hồ sơ thì không khớp
-- được, và hồ sơ của họ nằm lại trong blob. Câu đối chiếu cuối file in ra danh
-- sách những người đó bằng TÊN, để người vận hành nhìn được từng ca thay vì
-- chỉ thấy một con số lệch. Đây chính là lý do khoá theo tên là sai ngay từ
-- đầu, và cũng là lý do file này tồn tại.
--
-- Trùng tên: `update ... from` chọn một dòng bất kỳ trong các dòng khớp. Câu
-- đối chiếu đếm luôn số tên trùng — khác 0 thì phải xử lý tay trước khi tin
-- vào kết quả.
--
-- ══════════════════════════════════════════════════════════════════════════
-- LỌC GIÁ TRỊ HỎNG THAY VÌ ĐỂ CẢ CÂU CHẾT
-- ══════════════════════════════════════════════════════════════════════════
--
-- Dữ liệu trong blob chưa từng đi qua ràng buộc nào: `validateProfile()` chạy
-- ở client, và client là thứ bỏ qua được. Nên trong đó có thể có số điện thoại
-- sai khuôn, mục tiêu học đã bị đổi tên từ phiên bản cũ, ngày "2020-02-31".
--
-- Ghi thẳng vào cột có ràng buộc thì MỘT giá trị hỏng làm hỏng CẢ câu update,
-- và không ai chép được gì. Nên mỗi trường đi qua một `case`: hợp lệ thì lấy,
-- không thì `null`. Mất một ô còn hơn mất cả đợt chuyển kho — và câu đối chiếu
-- cuối file đếm riêng số ô bị bỏ, nên "mất" không có nghĩa là "lặng lẽ".
--
-- `dob` cần hai lớp: regex chặn dạng, rồi vòng `to_date` → `to_char` chặn ngày
-- không tồn tại. `to_date` KHÔNG ném lỗi với "2020-02-31" — nó lặng lẽ trả về
-- 2020-03-02. Cast thẳng `::date` thì ném lỗi và giết cả câu. Vòng round-trip
-- là cách duy nhất vừa không nổ vừa không bịa ra một ngày khác.
--
-- Chạy lại được: câu này ghi đè bằng đúng giá trị đã tính, không cộng dồn.
-- Nhưng CHẠY SAU KHI ỨNG DỤNG ĐÃ CHUYỂN thì nó ghi đè dữ liệu mới bằng dữ
-- liệu blob cũ. Chạy đúng một lần, ở bước này.

update public.profiles p
set
  genre   = case when src.v ->> 'genre' in ('homme', 'femme', 'autre')
                 then src.v ->> 'genre' end,
  prenom  = nullif(left(btrim(coalesce(src.v ->> 'prenom',  '')), 80),  ''),
  nom     = nullif(left(btrim(coalesce(src.v ->> 'nom',     '')), 80),  ''),
  adresse = nullif(left(btrim(coalesce(src.v ->> 'adresse', '')), 200), ''),
  school  = nullif(left(btrim(coalesce(src.v ->> 'school',  '')), 120), ''),
  phone   = case when btrim(coalesce(src.v ->> 'phone', '')) ~ '^[+]?[0-9 .()-]{8,20}$'
                 then btrim(src.v ->> 'phone') end,
  dob     = case when src.v ->> 'dob' ~ '^\d{4}-\d{2}-\d{2}$'
                  and to_char(to_date(src.v ->> 'dob', 'YYYY-MM-DD'), 'YYYY-MM-DD')
                      = src.v ->> 'dob'
                 then to_date(src.v ->> 'dob', 'YYYY-MM-DD') end,
  level   = case when src.v ->> 'level' in
                   ('Débutant', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2')
                 then src.v ->> 'level' end,
  goal    = case when src.v ->> 'goal' in
                   ('DELF A1', 'DELF A2', 'DELF B1', 'DELF B2', 'DALF C1', 'DALF C2',
                    'Étudier en France', 'Travailler en français',
                    'Communication quotidienne', 'Voyage', 'Plaisir personnel')
                 then src.v ->> 'goal' end
from (
  select j.key as ten, j.value as v
  from public.kv_store k
  cross join lateral jsonb_each(k.value::jsonb) as j
  where k.key = 's:mcf-profiles'
    and jsonb_typeof(k.value::jsonb) = 'object'
) src
where lower(p.name) = lower(src.ten)
  and jsonb_typeof(src.v) = 'object';

-- ══════════════════════════════════════════════════════════════════════════
-- ĐỐI CHIẾU SỐ LƯỢNG — chạy sau, đọc từng con số
-- ══════════════════════════════════════════════════════════════════════════
--
-- `trong_blob` và `khop_duoc` phải BẰNG NHAU. Lệch nghĩa là có người không
-- khớp được tên, và `ten_khong_khop` in ra chính xác là những ai — ĐỪNG chuyển
-- ứng dụng sang bảng cho tới khi hoặc hai số khớp, hoặc đã nhìn từng cái tên
-- trong danh sách kia và quyết định bỏ qua có ý thức.
--
-- `ten_trung` phải là 0. Khác 0 thì có hai dòng `profiles` cùng tên và câu
-- update ở trên đã chọn một dòng tuỳ ý — con số "khớp được" không còn nghĩa gì.
--
-- `o_bi_bo` đếm số Ô bị lọc vì giá trị hỏng (không phải số người). Khác 0
-- không phải lỗi, nhưng phải biết là bao nhiêu.

select
  (select count(*) from public.kv_store k,
     lateral jsonb_each(k.value::jsonb) j
   where k.key = 's:mcf-profiles')                                as trong_blob,

  (select count(*) from public.kv_store k,
     lateral jsonb_each(k.value::jsonb) j
   join public.profiles p on lower(p.name) = lower(j.key)
   where k.key = 's:mcf-profiles')                                as khop_duoc,

  (select coalesce(json_agg(j.key), '[]'::json)
   from public.kv_store k, lateral jsonb_each(k.value::jsonb) j
   where k.key = 's:mcf-profiles'
     and not exists (select 1 from public.profiles p
                     where lower(p.name) = lower(j.key)))         as ten_khong_khop,

  (select count(*) from (
     select lower(name) from public.profiles
     where name is not null group by 1 having count(*) > 1) d)    as ten_trung,

  (select count(*) from public.kv_store k,
     lateral jsonb_each(k.value::jsonb) j
   join public.profiles p on lower(p.name) = lower(j.key)
   where k.key = 's:mcf-profiles'
     and (   (nullif(btrim(coalesce(j.value ->> 'phone', '')), '') is not null and p.phone is null)
          or (nullif(btrim(coalesce(j.value ->> 'dob',   '')), '') is not null and p.dob   is null)
          or (nullif(btrim(coalesce(j.value ->> 'level', '')), '') is not null and p.level is null)
          or (nullif(btrim(coalesce(j.value ->> 'goal',  '')), '') is not null and p.goal  is null)
          or (nullif(btrim(coalesce(j.value ->> 'genre', '')), '') is not null and p.genre is null)
         ))                                                       as o_bi_bo;
