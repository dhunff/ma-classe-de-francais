-- 162 · Khách chưa đăng nhập đọc được câu luyện nói A0 (bài phát âm A0 là trang công khai)
-- để nghe mẫu. Chỉ A0 + công khai; kho Nghe & Nói A1–C1 vẫn đòi đăng nhập. Chấm vẫn đòi
-- đăng nhập (cham-phat-am trả 401).
grant select on public.cau_luyen to anon;
drop policy if exists cau_luyen_doc_khach on public.cau_luyen;
create policy cau_luyen_doc_khach on public.cau_luyen for select to anon using (cong_khai and cap = 'A0');
