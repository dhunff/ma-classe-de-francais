-- 020 — dọn hai bài thử mà 019 để lại
--
-- 019 giữ chúng lại để chứng minh policy bằng HTTP thật (curl với anon key),
-- vì đó mới là đường tấn công thật. Bằng chứng đã lấy được:
--
--     questions?exercise_id=eq.__test_premium__  → []          ← bị chặn
--     questions?exercise_id=eq.__test_free__     → [{...}]     ← vẫn mở
--     exercises?id=eq.__test_premium__           → [{title, level}]  ← cần cho thẻ khoá
--
-- Bản đầu của migration này khẳng định "tổng phải còn đúng 433" và tự huỷ.
-- Con số hard-code ấy sai — tôi đếm nhầm giữa các lần migration. Đối chiếu
-- TƯƠNG ĐỐI thì không bao giờ mắc lỗi đó: đếm trước, xoá, đòi hiệu đúng bằng
-- số dòng vừa xoá. Nó cũng tự đúng khi có ai thêm bài trong lúc này.
do $$
declare truoc int; sau int; con_bai int; con_cau int;
begin
  select count(*) into truoc from public.questions;

  delete from public.exercises where id in ('__test_premium__', '__test_free__');

  select count(*) into sau from public.questions;
  select count(*) into con_bai from public.exercises
   where id in ('__test_premium__', '__test_free__');
  select count(*) into con_cau from public.questions
   where exercise_id in ('__test_premium__', '__test_free__');

  raise notice 'câu: % → % (bớt %) · bài thử còn %, câu thử còn %',
    truoc, sau, truoc - sau, con_bai, con_cau;

  if con_bai <> 0 or con_cau <> 0 then
    raise exception 'dọn HỎNG: còn % bài thử, % câu thử', con_bai, con_cau;
  end if;
  if truoc - sau <> 2 then
    raise exception 'cascade HỎNG: mong bớt đúng 2 câu, bớt %', truoc - sau;
  end if;
end $$;
