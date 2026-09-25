-- Kiểm 095 — lần Run RIÊNG (bài học 035/046).
do $$ begin
  if to_regprocedure('public.get_student_streak()') is null then
    raise exception 'thiếu get_student_streak';
  end if;
  if not has_function_privilege('authenticated', 'public.get_student_streak()', 'EXECUTE') then
    raise exception 'authenticated không gọi được get_student_streak';
  end if;
  if has_function_privilege('anon', 'public.get_student_streak()', 'EXECUTE') then
    raise exception 'anon gọi được get_student_streak';
  end if;
  raise notice 'get_student_streak: 3 ca đạt.';
end $$;
