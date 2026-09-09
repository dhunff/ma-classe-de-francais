-- Kiểm 087 — lần Run RIÊNG.
--
-- Ca ở đây kiểm ĐÍCH của khoá ngoại, không kiểm sự tồn tại của nó. Một ràng
-- buộc tên đúng mà trỏ sai chỗ thì `pg_constraint` vẫn đếm ra 1, còn PostgREST
-- thì vẫn không nhúng được — và triệu chứng duy nhất là một màn hình học sinh
-- báo "không đọc được", ở phía không ai đang nhìn.

do $$
declare dich text; xoa char; begin

  select confrelid::regclass::text, confdeltype into dich, xoa
    from pg_constraint
   where conrelid = 'public.the_bo'::regclass
     and conname = 'the_bo_tac_gia_fkey';

  if dich is null then
    raise exception 'không còn ràng buộc the_bo_tac_gia_fkey — tên này bị mã nguồn gọi đích danh';
  end if;

  if dich <> 'profiles' then
    raise exception 'the_bo_tac_gia_fkey trỏ tới % — PostgREST không nhúng profiles qua đó được', dich;
  end if;

  if xoa <> 'r' then
    raise exception 'phải là ON DELETE RESTRICT, đang là %', xoa;
  end if;

  -- Và dữ liệu đang có phải thoả ràng buộc mới. `alter table ... add
  -- constraint` đã tự kiểm lúc chạy, nhưng đọc lại từ một transaction khác thì
  -- mới biết nó đã COMMIT thật — bài học 046.
  if exists (
    select 1 from public.the_bo b
     left join public.profiles p on p.id = b.tac_gia
     where p.id is null
  ) then
    raise exception 'có bộ thẻ mang tác giả không nằm trong profiles';
  end if;

  raise notice 'the_bo_tac_gia_fkey: trỏ đúng public.profiles, 4 ca đạt.';
end $$;
