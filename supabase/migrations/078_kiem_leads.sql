-- 078 — kiểm chứng 077, chạy ở một lần Run RIÊNG

/* ── Người CHƯA đăng nhập: ghi được, KHÔNG đọc được ──
   Đây là ca quan trọng nhất. `leads` chứa tên, email, số điện thoại của người
   thật; đọc được nghĩa là ai cũng tải về được cả danh sách khách hàng. */
do $$
declare n int;
begin
  perform set_config('role', 'anon', true);

  perform public.gui_lien_he('__KIEM078__ Nguyễn Văn A', 'kiem078@vidu.test',
                             null, 'hoc_sinh', 'B1', 'thử', null);

  begin
    select count(*) into n from public.leads;
    /* RLS chặn theo DÒNG nên `anon` có thể select mà thấy 0 dòng — đó cũng là
       kết quả đúng. Thứ KHÔNG được xảy ra là thấy dòng nào. */
    if n > 0 then
      raise exception 'HỎNG — anon đọc được % dòng leads', n;
    end if;
  exception when insufficient_privilege then
    null;   -- bị chặn ở tầng quyền, còn tốt hơn
  end;

  reset role;
  raise notice 'OK — anon ghi được, không đọc được dòng nào';
end $$;

reset role;

/* ── Chặn lũ theo email phải THẬT SỰ chặn ──
   Một hàng rào chưa ai thử đẩy vào thì chưa biết có đứng không. */
do $$
declare i int;
begin
  perform set_config('role', 'anon', true);
  /* Lượt 1 đã gửi ở khối trên → gửi thêm 2 lượt nữa là chạm mốc 3. */
  for i in 1..2 loop
    perform public.gui_lien_he('__KIEM078__ lượt ' || i, 'kiem078@vidu.test',
                               null, 'hoc_sinh', null, null, null);
  end loop;

  begin
    perform public.gui_lien_he('__KIEM078__ lượt 4', 'kiem078@vidu.test',
                               null, 'hoc_sinh', null, null, null);
    raise exception 'HỎNG — lượt thứ tư vẫn gửi được, phanh không ăn';
  exception when sqlstate 'P0001' then null;
  end;

  reset role;
  raise notice 'OK — quá 3 lượt/ngày cho một email thì bị chặn';
end $$;

reset role;

/* ── Dữ liệu rác bị từ chối ── */
do $$
begin
  perform set_config('role', 'anon', true);

  begin
    perform public.gui_lien_he('  ', 'a@b.co', null, 'hoc_sinh', null, null, null);
    raise exception 'HỎNG — nhận tên rỗng';
  exception when sqlstate '22023' then null;
  end;

  begin
    perform public.gui_lien_he('Tên có thật', 'khong-phai-email', null, 'hoc_sinh', null, null, null);
    raise exception 'HỎNG — nhận email sai dạng';
  exception when sqlstate '22023' then null;
  end;

  reset role;
  raise notice 'OK — tên rỗng và email sai dạng đều bị từ chối';
end $$;

reset role;

/* ── Quyền ── */
do $$
begin
  if has_table_privilege('anon', 'public.leads', 'insert') then
    raise exception 'HỎNG — anon chèn thẳng được, mọi phép kiểm trong hàm thành đồ trang trí';
  end if;
  if has_table_privilege('anon', 'public.leads', 'delete') then
    raise exception 'HỎNG — anon xoá được leads';
  end if;
  if not has_function_privilege('anon', 'public.gui_lien_he(text, text, text, text, text, text, text)', 'execute') then
    raise exception 'HỎNG — anon KHÔNG gọi được gui_lien_he, form công khai vô dụng';
  end if;
  raise notice 'OK — quyền đúng: gọi hàm được, chèn thẳng thì không';
end $$;

delete from public.leads where ho_ten like '__KIEM078__%';
