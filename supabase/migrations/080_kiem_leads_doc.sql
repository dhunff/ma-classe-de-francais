-- 080 — kiểm chứng 079, chạy ở một lần Run RIÊNG
do $$
begin
  if has_table_privilege('anon', 'public.leads', 'select') then
    raise exception 'HỎNG — anon vẫn còn quyền đọc leads ở mức bảng';
  end if;
  /* Thu quá tay cũng là hỏng: giáo viên đọc qua vai `authenticated`, mất
     quyền đó thì màn xem liên hệ trắng xoá. */
  if not has_table_privilege('authenticated', 'public.leads', 'select') then
    raise exception 'HỎNG — thu quá tay, giáo viên không đọc được leads';
  end if;
  /* Và anon vẫn phải GỬI được, nếu không thì form công khai vô dụng. */
  if not has_function_privilege('anon', 'public.gui_lien_he(text, text, text, text, text, text, text)', 'execute') then
    raise exception 'HỎNG — anon không gọi được gui_lien_he';
  end if;
  raise notice 'OK — anon gửi được, không đọc được; giáo viên đọc được';
end $$;
