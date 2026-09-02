-- 070 — kiểm chứng 069, chạy ở một lần Run RIÊNG

do $$
declare
  ham text;
begin
  /* `is_teacher()` phải nằm TRONG câu, không chỉ dựa vào RLS: hàm security
     definer chạy vòng qua RLS, nên thiếu nó là mọi học sinh đọc được danh
     sách câu hỏi kèm số người sai. */
  select pg_get_functiondef(p.oid) into ham
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'cau_can_loi_giai';
  if ham not like '%is_teacher()%' then
    raise exception 'cau_can_loi_giai KHÔNG kiểm vai giáo viên';
  end if;

  select pg_get_functiondef(p.oid) into ham
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'luu_loi_giai';
  if ham not like '%is_teacher()%' then
    raise exception 'luu_loi_giai KHÔNG kiểm vai giáo viên';
  end if;
  /* Nửa dễ quên nhất: viết lời giải mà không làm mới thẻ đã sinh thì giáo viên
     thấy "đã lưu" và phía học sinh không có gì đổi. */
  if ham not like '%update public.cards%' then
    raise exception 'luu_loi_giai KHÔNG làm mới thẻ đã sinh';
  end if;

  if has_function_privilege('anon', 'public.luu_loi_giai(text, text)', 'execute') then
    raise exception 'anon vẫn gọi được luu_loi_giai';
  end if;

  raise notice 'OK — hai hàm kiểm vai đúng, và lời giải kéo theo thẻ';
end $$;

/* Chạy thử THẬT với tư cách một học sinh: hàm phải trả về RỖNG.
   Kiểm "có kiểm vai không" bằng cách đọc mã là chưa đủ — phải thấy nó từ chối. */
do $$
declare
  hs uuid;
  n  int;
begin
  select p.id into hs from public.profiles p where p.role = 'eleve' limit 1;
  if hs is null then
    raise notice 'BỎ QUA: chưa có học sinh nào';
    return;
  end if;

  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    json_build_object('sub', hs::text, 'role', 'authenticated')::text, true);

  select count(*) into n from public.cau_can_loi_giai(10);
  if n <> 0 then
    raise exception 'HỎNG — học sinh đọc được % dòng danh sách lời giải', n;
  end if;

  begin
    perform public.luu_loi_giai('bat_ky', 'thử ghi');
    raise exception 'HỎNG — học sinh ghi được lời giải';
  exception when sqlstate '42501' then
    null;   -- đúng như mong đợi
  end;

  reset role;
  raise notice 'OK — học sinh không đọc và không ghi được';
end $$;
