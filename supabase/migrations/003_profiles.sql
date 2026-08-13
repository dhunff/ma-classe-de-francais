-- Bảng hồ sơ người dùng — cầu nối giữa auth.users và ứng dụng.
--
-- VẤN ĐỀ NÓ GIẢI QUYẾT: học sinh tự đăng ký thì tài khoản nằm trong
-- auth.users, còn danh sách của giáo viên lại đọc mcf-accounts trong kv_store
-- — một danh bạ do giáo viên tự gõ tay. Hai kho tách rời, nên đăng ký xong
-- giáo viên không thấy ai cả.
--
-- Không thể sửa bằng cách cho client đọc thẳng auth.users: liệt kê người dùng
-- đòi service_role key, mà key đó không được phép nằm trong bundle gửi xuống
-- trình duyệt. Cách chuẩn là bảng công khai được trigger tự điền.
--
-- Chạy trong SQL Editor. Cần chạy 002_kv_store_rls.sql trước, vì file này
-- dùng lại hàm public.is_teacher().

create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text not null,
  name        text,
  role        text not null default 'eleve' check (role in ('eleve', 'prof')),
  class_id    text,
  created_at  timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- ─────────────────────── Tự điền khi có người đăng ký ───────────────────────
--
-- security definer để trigger ghi được vào public.profiles bất kể RLS — người
-- vừa đăng ký chưa có phiên nào, và policy bên dưới cũng không cho họ tự thêm
-- dòng.
--
-- Vai trò đọc từ raw_app_meta_data, KHÔNG phải raw_user_meta_data:
-- user_metadata do chính người dùng ghi được lúc gọi signUp, nên ai cũng có
-- thể tự khai mình là 'prof'. app_metadata chỉ service role hoặc SQL sửa được.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_app_meta_data ->> 'role', 'eleve')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────── Bù cho những người đã đăng ký trước ────────────────────
-- Trigger chỉ bắt người mới. Ai đăng ký trước khi chạy file này sẽ không có
-- hồ sơ, nên phải chép sang một lần.

insert into public.profiles (id, email, name, role, created_at)
select
  u.id,
  u.email,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    split_part(u.email, '@', 1)
  ),
  coalesce(u.raw_app_meta_data ->> 'role', 'eleve'),
  u.created_at
from auth.users u
on conflict (id) do nothing;

-- ─────────────────────────────── RLS ───────────────────────────────

alter table public.profiles enable row level security;

drop policy if exists profiles_read_self    on public.profiles;
drop policy if exists profiles_read_teacher on public.profiles;
drop policy if exists profiles_write_teacher on public.profiles;

-- Người dùng đọc được hồ sơ của chính mình.
create policy profiles_read_self on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

-- Giáo viên đọc được tất cả — đó là toàn bộ mục đích của trang Suivi.
create policy profiles_read_teacher on public.profiles
  for select to authenticated
  using (public.is_teacher());

-- Chỉ giáo viên sửa được, và đó là cách duy nhất để gán lớp.
--
-- Cố ý KHÔNG cho học sinh update hồ sơ của chính mình: RLS phân quyền theo
-- dòng chứ không theo cột, nên "cho sửa tên mình" đồng thời là "cho tự đổi
-- role thành prof". Đổi tên hiển thị thì đi qua user_metadata.
create policy profiles_write_teacher on public.profiles
  for all to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

-- ──────────────────────── Kiểm tra sau khi chạy ────────────────────────
--
--   select role, count(*) from public.profiles group by role;
--
-- Con số phải khớp với:
--
--   select count(*) from auth.users;
