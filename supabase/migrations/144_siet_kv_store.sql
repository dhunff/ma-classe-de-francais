-- 144 · Siết kv_store (15/10, rà bảo mật vibe-check, nhóm DATABASE_ACCESS).
--
-- Hai lỗ đã đo được bằng khoá anon / claim giả:
--   1. Blob cũ `s:mcf-practice`, `s:mcf-exercises` (+ bản sao lưu __backup_016) ĐỌC
--      ĐƯỢC BẰNG KHOÁ ANON và chứa 185 đáp án: vô hiệu hoá việc giấu answer_key (022)
--      cho 37 bài gốc. Ứng dụng không còn đọc hai blob này (check:store), chỉ giáo
--      viên cần thấy chúng như bản sao lưu.
--   2. Mọi học sinh đã đăng nhập đọc / sửa / XOÁ được mọi khoá riêng `p:…` của
--      người khác (lịch sử luyện tập, lịch, bản nháp), vì policy chỉ xét tiền tố.
--
-- Chủ của khoá riêng = phần đuôi khoá (`p:mcf-<loại>-<tên>`) trùng `profiles.name`
-- của người gọi. Đo 15/10: 25/25 học sinh có tên phiên trùng profiles.name, và học
-- sinh KHÔNG tự sửa được profiles.name (chỉ giáo viên). Không dùng user_metadata:
-- người dùng tự sửa được nó.

create or replace function public._ten_cua_toi()
returns text language sql stable security definer set search_path = public as $$
  select name from public.profiles where id = (select auth.uid())
$$;
revoke all on function public._ten_cua_toi() from public, anon;
grant execute on function public._ten_cua_toi() to authenticated;

create or replace function public._kv_cua_toi(p_key text)
returns boolean language sql stable as $$
  select p_key like 'p:%'
     and substring(p_key from '^p:mcf-[a-z]+-(.*)$') is not null
     and substring(p_key from '^p:mcf-[a-z]+-(.*)$') = public._ten_cua_toi()
$$;

-- Khoá dùng chung học sinh KHÔNG được đọc.
create or replace function public._kv_cam_hoc_sinh(p_key text)
returns boolean language sql immutable as $$
  select p_key like 's:mcf-practice%' or p_key like 's:mcf-exercises%'
      or p_key in ('s:mcf-teacher-notes', 's:mcf-profiles', 's:mcf-teacher-pin')
$$;

drop policy if exists kv_anon_read_catalogue on public.kv_store;
create policy kv_anon_read_catalogue on public.kv_store for select to anon
  using (key in ('s:mcf-folders', 's:mcf-custom-cats'));

drop policy if exists kv_auth_read on public.kv_store;
create policy kv_auth_read on public.kv_store for select to authenticated
  using (public.is_teacher()
         or public._kv_cua_toi(key)
         or (key like 's:%' and not public._kv_cam_hoc_sinh(key)));

drop policy if exists kv_student_insert on public.kv_store;
create policy kv_student_insert on public.kv_store for insert to authenticated
  with check (public._kv_cua_toi(key) or key in ('s:mcf-submissions', 's:mcf-presence'));

drop policy if exists kv_student_update on public.kv_store;
create policy kv_student_update on public.kv_store for update to authenticated
  using (public._kv_cua_toi(key) or key in ('s:mcf-submissions', 's:mcf-presence'))
  with check (public._kv_cua_toi(key) or key in ('s:mcf-submissions', 's:mcf-presence'));

drop policy if exists kv_student_delete on public.kv_store;
create policy kv_student_delete on public.kv_store for delete to authenticated
  using (public._kv_cua_toi(key));

notify pgrst, 'reload schema';
