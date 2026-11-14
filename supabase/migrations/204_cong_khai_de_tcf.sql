-- 204 (14/11, chủ dự án duyệt): công khai hai đề TCF đầu tiên, bỏ tiền tố « [NHÁP] ».
-- Đề 1 của mỗi loại miễn phí (chi_vip false), như quy ước đề DELF (migration 143).
-- Một câu lệnh; chỉ đụng đúng hai đề nháp của lô 44.
update public.exams
set title = replace(title, '[NHÁP] ', ''), is_published = true, chi_vip = false
where title in ('[NHÁP] TCF Canada · Đề 1', '[NHÁP] TCF Pháp · Đề 1') and level in ('TCF', 'TCF_TP');
