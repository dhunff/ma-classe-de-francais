-- 072 — kiểm chứng 071, chạy ở một lần Run RIÊNG

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

  /* Phải NÉM LỖI, không được trả rỗng. Trả rỗng thì giao diện đọc là "đã viết
     hết rồi" và chúc mừng đúng cái thất bại vừa xảy ra. */
  begin
    select count(*) into n from public.cau_can_loi_giai(5);
    raise exception 'HỎNG — học sinh nhận % dòng thay vì bị từ chối', n;
  exception when sqlstate '42501' then
    null;   -- đúng như mong đợi
  end;

  reset role;
  perform set_config('request.jwt.claims', '', true);
  raise notice 'OK — người không phải giáo viên bị TỪ CHỐI, không nhận danh sách rỗng';
end $$;
