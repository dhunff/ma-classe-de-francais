-- Xoá bài nộp mồ côi — tài khoản thử từ trước khi có Supabase Auth.
--
-- BỐI CẢNH: sau khi 007 chạy, 9 trong 12 dòng có user_id null. Truy vấn chẩn
-- đoán cho thấy chúng mang những tên không khớp hồ sơ nào và cũng không có
-- trong danh bạ mời: cuong123, admin, pnlinh, sutuhadong, thanhtu_hvt, ytue,
-- 1, ytuexinhgai. Đây là dữ liệu thử từ thời đăng nhập bằng mã tự chế, không
-- phải bài của học sinh thật.
--
-- VÌ SAO CHÚNG PHIỀN: policy submissions_read_own lọc theo
-- `user_id = auth.uid()`, nên dòng user_id null không ai đọc được ngoài giáo
-- viên. Chúng chỉ làm nhiễu bảng theo dõi và làm số liệu thống kê sai.
--
-- LÙI LẠI ĐƯỢC: blob `s:mcf-submissions` KHÔNG bị đụng tới và vẫn chứa đủ 12
-- bản ghi. Muốn khôi phục thì chạy lại phần chèn của 007 — nó có
-- `on conflict (id) do nothing` nên chỉ thêm lại những dòng đã mất.
--
-- Chạy trong SQL Editor, hoặc qua `supabase db push`.

-- ───────────── Trước khi xoá ─────────────
do $$
declare n_xoa int; n_giu int;
begin
  select count(*) into n_xoa from public.submissions t
   where t.user_id is null
     and not exists (select 1 from public.profiles p
                      where lower(trim(p.name)) = lower(trim(t.student)));
  select count(*) into n_giu from public.submissions where user_id is not null;
  raise notice 'Se xoa % dong mo coi, giu lai % dong co tai khoan', n_xoa, n_giu;
end $$;

-- ───────────── Xoá ─────────────
--
-- Điều kiện hẹp có chủ ý: CHỈ xoá dòng vừa thiếu user_id VỪA không khớp tên
-- hồ sơ nào. Một học sinh thật mà chưa gắn được tài khoản — ví dụ đăng ký sau
-- khi nộp bài — vẫn khớp được theo tên, nên không bị đụng tới.
--
-- Không dùng danh sách tên cứng: hôm nay đúng 8 tên đó, nhưng nếu chạy lại
-- sau khi có thêm rác thì điều kiện vẫn còn đúng, còn danh sách cứng thì không.
delete from public.submissions t
where t.user_id is null
  and not exists (
    select 1 from public.profiles p
     where lower(trim(p.name)) = lower(trim(t.student))
  );

-- ───────────── Sau khi xoá ─────────────
do $$
declare n_con int; n_null int;
begin
  select count(*) into n_con  from public.submissions;
  select count(*) into n_null from public.submissions where user_id is null;
  raise notice 'Con lai % dong, trong do % chua gan tai khoan', n_con, n_null;

  if n_null > 0 then
    raise warning 'Van con % dong chua gan tai khoan — kiem lai truoc khi bo nhanh doc blob', n_null;
  end if;
end $$;

-- ──────────────────────── Kiểm tra sau khi chạy ────────────────────────
--
--   select count(*) as con_lai,
--          count(*) filter (where user_id is null) as chua_gan
--     from public.submissions;
--
-- `chua_gan` phải bằng 0. Còn dòng nào nghĩa là có học sinh thật chưa nối
-- được tài khoản — đừng bỏ nhánh đọc blob trong shared/submissions.js cho tới
-- khi xử lý xong, nếu không họ mất lịch sử bài làm.
