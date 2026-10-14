-- 145 · Siết quyền đọc exercise_access (15/10, rà bảo mật vibe-check).
-- Trước: policy « read access » using (true) cho cả anon, nên người CHƯA đăng nhập
-- liệt kê được tên học sinh + bài đã mua + số tiền. Nay: chính chủ (student =
-- profiles.name của người gọi, xem _ten_cua_toi ở 144) hoặc giáo viên.
-- loadAccess() vốn đọc cả bảng rồi lọc theo tên ở client, nên hành vi không đổi;
-- can_open_exercise / co_quyen_bo là security definer, không phụ thuộc policy này.
drop policy if exists "read access" on public.exercise_access;
create policy exercise_access_doc on public.exercise_access for select to authenticated
  using (public.is_teacher() or student = public._ten_cua_toi());
notify pgrst, 'reload schema';
