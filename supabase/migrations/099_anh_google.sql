-- ═══════════════════════════════════════════════════════════════════════════
-- ẢNH ĐẠI DIỆN GOOGLE → profiles.avatar
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Đăng nhập bằng Google thì Supabase để đường dẫn ảnh trong
-- `raw_user_meta_data` (`avatar_url`, có khi là `picture`). Cột
-- `profiles.avatar` đã định nhận `https://…` từ 046, và giao diện đã có nhánh
-- dựng ảnh — chỉ thiếu bước chép sang.
--
-- Giữ NGUYÊN phần còn lại của handle_new_user (security definer,
-- search_path rỗng, tên lấy từ name/full_name/email, role từ app_metadata).
-- Chỉ nhận đường dẫn https hợp lệ — giá trị lạ thì bỏ, vì một lỗi ở trigger
-- này làm hỏng CẢ lượt đăng ký.
--
-- ══ SỬA KÈM: RÀNG BUỘC CỦA 046 CHƯA BAO GIỜ CHẠY ĐƯỢC VỚI ẢNH https ══
-- `profiles_avatar_dang` viết `[^\s]{5,300}`, mà regex Postgres chỉ cho số lặp
-- tối đa 255: mọi giá trị https đều ném 2201B "invalid repetition count".
-- Không ai thấy vì chưa ai lưu ảnh thật — nhánh https chỉ là "để sẵn". Viết
-- lại bằng like + length, không dùng số lặp.

alter table public.profiles drop constraint if exists profiles_avatar_dang;
alter table public.profiles add constraint profiles_avatar_dang check (
  avatar is null
  or avatar ~ '^[a-z][a-z0-9_]{1,23}$'
  or (avatar like 'https://%' and length(avatar) between 13 and 308 and avatar !~ '\s')
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  anh text := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'picture'), ''));
begin
  if anh is not null
     and not (anh like 'https://%' and length(anh) between 13 and 308 and anh !~ '\s') then
    anh := null;
  end if;

  insert into public.profiles (id, email, name, role, avatar)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_app_meta_data ->> 'role', 'eleve'),
    anh
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Người đã đăng ký bằng Google trước hôm nay: gán ảnh Google CHỈ cho ai còn
-- để trống (đang hiện chữ cái đầu). Ai đã tự chọn con vật thì giữ nguyên.
update public.profiles p
   set avatar = x.anh
  from (
    select u.id, coalesce(
             nullif(trim(u.raw_user_meta_data ->> 'avatar_url'), ''),
             nullif(trim(u.raw_user_meta_data ->> 'picture'), '')) as anh
      from auth.users u
  ) x
 where x.id = p.id
   and p.avatar is null
   and x.anh like 'https://%'
   and length(x.anh) between 13 and 308
   and x.anh !~ '\s';
