-- Kiểm 093 — lần Run RIÊNG (bài học 035/046).
do $$ begin
  if to_regprocedure('public.get_neo_giao_vien(text[])') is null then
    raise exception 'thiếu get_neo_giao_vien';
  end if;
  if not has_function_privilege('authenticated', 'public.get_neo_giao_vien(text[])', 'EXECUTE') then
    raise exception 'authenticated không gọi được get_neo_giao_vien';
  end if;
  if has_function_privilege('anon', 'public.get_neo_giao_vien(text[])', 'EXECUTE') then
    raise exception 'anon gọi được get_neo_giao_vien — neo là đáp án trá hình';
  end if;
  -- Cột evidence vẫn phải KHÔNG đọc thẳng được: hàm mới không được là cớ để
  -- ai đó cấp lại SELECT cho tiện.
  if has_column_privilege('authenticated', 'public.questions', 'evidence', 'SELECT') then
    raise exception 'authenticated đọc thẳng được questions.evidence';
  end if;
  raise notice 'get_neo_giao_vien: 4 ca đạt.';
end $$;
