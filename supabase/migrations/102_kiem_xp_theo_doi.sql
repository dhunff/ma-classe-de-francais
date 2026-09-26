-- Kiểm 101 — lần Run RIÊNG (bài học 035/046).
do $$ begin
  if has_table_privilege('authenticated', 'public.follows', 'INSERT')
     or has_table_privilege('authenticated', 'public.xp_so_cai', 'INSERT') then
    raise exception 'authenticated ghi thẳng được follows/xp_so_cai';
  end if;
  if has_column_privilege('authenticated', 'public.profiles', 'xp_balance', 'UPDATE')
     and exists (select 1 from pg_policy where polrelid = 'public.profiles'::regclass
                 and polcmd in ('w', '*') and pg_get_expr(polqual, polrelid) not like '%is_teacher%') then
    raise exception 'có policy cho học sinh sửa profiles — xp_balance tự bơm được';
  end if;
  if has_function_privilege('anon', 'public.redeem_exercise_with_xp(text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.follow_user(text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.get_following_streaks()', 'EXECUTE') then
    raise exception 'anon gọi được RPC XP/theo dõi';
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'cong_xp_khi_nop') then
    raise exception 'thiếu trigger cộng XP';
  end if;
  raise notice 'XP + theo dõi: 4 ca đạt.';
end $$;
