-- 161 · Câu luyện phát âm cho các bài phát âm A0 (25/10). Nới CHECK trình độ cho 'A0'.
-- Màn « Nghe & Nói » lọc theo A1–C1 nên câu A0 không lẫn vào đó; chúng chỉ hiện trong
-- khối « Luyện nói » của bài học ngữ pháp A0 và dùng chung hàm chấm cham-phat-am.
alter table public.cau_luyen drop constraint if exists cau_luyen_cap_check;
alter table public.cau_luyen add constraint cau_luyen_cap_check check (cap in ('A0', 'A1', 'A2', 'B1', 'B2', 'C1'));
