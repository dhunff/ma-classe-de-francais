-- 156 · Theo 155: CHECK của lo_trinh_ket_qua.ma_man chỉ nhận 'trum:<chủ đề>', nên
-- thử thách cuối chương 2 ('trum:<chủ đề>:2') bị database từ chối (bẫy 059/090 lần nữa).
alter table public.lo_trinh_ket_qua drop constraint if exists lo_trinh_ket_qua_ma_man_check;
alter table public.lo_trinh_ket_qua add constraint lo_trinh_ket_qua_ma_man_check
  check (ma_man ~ '^(bo:[0-9a-f-]{36}|trum:[A-Za-z0-9-]{2,40}(:[1-9])?|man:[a-z0-9-]{2,60})$');
