-- Kiểm 097 — lần Run RIÊNG (bài học 035/046).
do $$
declare dinh boolean;
begin
  if to_regprocedure('public.global_search(text)') is null then
    raise exception 'thiếu global_search';
  end if;
  select prosecdef into dinh from pg_proc where oid = 'public.global_search(text)'::regprocedure;
  if dinh then
    raise exception 'global_search phải là SECURITY INVOKER để RLS áp nguyên vẹn';
  end if;
  if not has_function_privilege('authenticated', 'public.global_search(text)', 'EXECUTE') then
    raise exception 'authenticated không gọi được global_search';
  end if;
  if has_function_privilege('anon', 'public.global_search(text)', 'EXECUTE') then
    raise exception 'anon gọi được global_search';
  end if;
  raise notice 'global_search: 4 ca đạt.';
end $$;
