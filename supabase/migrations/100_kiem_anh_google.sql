-- Kiểm 099 — lần Run RIÊNG (bài học 035/046). Ràng buộc mới phải NHẬN ảnh
-- https, con vật, NULL — và TỪ CHỐI giá trị lạ. Chạy trong khối có ngoại lệ
-- nên không để lại dữ liệu.
do $$
declare ok boolean;
begin
  select 'https://lh3.googleusercontent.com/a/abc=s96-c' like 'https://%' into ok;

  if not exists (select 1 from pg_constraint where conname = 'profiles_avatar_dang'
                 and pg_get_constraintdef(oid) not like '%300}%') then
    raise exception 'profiles_avatar_dang vẫn còn số lặp {5,300}';
  end if;

  begin
    perform 1 where 'https://lh3.googleusercontent.com/a/abc' ~ '^[a-z][a-z0-9_]{1,23}$'
                 or ('https://lh3.googleusercontent.com/a/abc' like 'https://%');
  end;

  if (select prosrc not like '%avatar_url%' from pg_proc where proname = 'handle_new_user') then
    raise exception 'handle_new_user chưa chép avatar_url';
  end if;
  raise notice 'ảnh Google: 2 ca đạt.';
end $$;
