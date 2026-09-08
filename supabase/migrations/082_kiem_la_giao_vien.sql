-- 082 — kiểm chứng 081, chạy ở một lần Run RIÊNG
do $$
declare hs uuid; gv uuid; kq boolean;
begin
  select id into hs from public.profiles where role = 'eleve' limit 1;
  select id into gv from public.profiles where role = 'prof'  limit 1;
  if hs is null or gv is null then
    raise notice 'BỎ QUA: thiếu học sinh hoặc giáo viên';
    return;
  end if;

  perform set_config('role', 'authenticated', true);

  perform set_config('request.jwt.claims',
    json_build_object('sub', hs::text, 'role', 'authenticated')::text, true);
  select public.la_giao_vien() into kq;
  if kq then raise exception 'HỎNG — học sinh được coi là giáo viên'; end if;

  perform set_config('request.jwt.claims',
    json_build_object('sub', gv::text, 'role', 'authenticated',
      'app_metadata', json_build_object('role','prof'))::text, true);
  select public.la_giao_vien() into kq;
  if not kq then raise exception 'HỎNG — giáo viên KHÔNG được nhận ra'; end if;

  raise notice 'OK — phân biệt đúng hai vai';
end $$;

reset role;
select set_config('request.jwt.claims', '', true);

do $$
begin
  if has_function_privilege('anon', 'public.la_giao_vien()', 'execute') then
    raise exception 'anon vẫn gọi được la_giao_vien';
  end if;
  raise notice 'OK — anon không gọi được';
end $$;
