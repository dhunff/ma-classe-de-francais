-- 166 · Giáo viên sửa câu luyện « Học ngữ pháp » ngay trên web (25/10).
-- Nội dung gốc nằm trong mã nguồn (src/content/nguPhap); bảng này là LỚP ĐÈ:
-- khoá theo (mã bài, đề GỐC), client áp đè lúc dựng bài. Xoá dòng = trả về bản gốc.
-- Mọi người đọc được (trang ngữ pháp công khai cũng dùng); chỉ giáo viên ghi.
create table if not exists public.ngu_phap_sua (
  ma_bai   text not null check (ma_bai ~ '^[a-z0-9-]{3,60}$'),
  cau_goc  text not null check (char_length(cau_goc) between 1 and 600),
  noi_dung jsonb not null default '{}'::jsonb,
  an       boolean not null default false,
  sua_boi  uuid default auth.uid(),
  sua_luc  timestamptz not null default now(),
  primary key (ma_bai, cau_goc)
);
alter table public.ngu_phap_sua enable row level security;
create policy ngu_phap_sua_doc on public.ngu_phap_sua for select to anon, authenticated using (true);
create policy ngu_phap_sua_them on public.ngu_phap_sua for insert to authenticated with check (public.is_teacher());
create policy ngu_phap_sua_sua on public.ngu_phap_sua for update to authenticated using (public.is_teacher()) with check (public.is_teacher());
create policy ngu_phap_sua_xoa on public.ngu_phap_sua for delete to authenticated using (public.is_teacher());
grant select on public.ngu_phap_sua to anon, authenticated;
grant insert, update, delete on public.ngu_phap_sua to authenticated;
