-- 074 — kiểm chứng 073, chạy ở một lần Run RIÊNG.
--
-- Hạn mức là thứ chỉ chứng minh được bằng cách ĐẨY VÀO NÓ. Đọc lại câu `if
-- da_co >= 10` và gật đầu là chưa kiểm gì cả — 063 đã cho thấy một câu lệnh
-- trông đúng vẫn có thể không làm gì (revoke theo cột).

do $$
declare
  hs   uuid;
  kq   record;
  i    int;
  dem  int;
  loi  text;
begin
  select p.id into hs from public.profiles p where p.role = 'eleve' limit 1;
  if hs is null then
    raise notice 'BỎ QUA: chưa có học sinh nào';
    return;
  end if;

  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    json_build_object('sub', hs::text, 'role', 'authenticated')::text, true);

  /* 10 thẻ đầu phải VÀO ĐƯỢC. Một hạn mức chặn nhầm ở thẻ thứ 8 cũng hỏng y
     như một hạn mức không chặn gì. */
  for i in 1..10 loop
    select * into kq from public.tao_the_tu_viet(
      '__KIEM074__ mặt trước ' || i, 'mặt sau ' || i, 'ví dụ ' || i, current_date);
    if kq.card_id is null then
      raise exception 'HỎNG — thẻ thứ % không tạo được', i;
    end if;
  end loop;

  select public.dem_the_tu_viet(current_date) into dem;
  if dem < 10 then
    raise exception 'HỎNG — đếm được % thẻ thay vì ít nhất 10', dem;
  end if;

  /* Thẻ thứ 11 phải BỊ CHẶN, và chặn bằng đúng mã lỗi giao diện đang chờ. */
  begin
    perform public.tao_the_tu_viet('__KIEM074__ thẻ thứ 11', 'mặt sau', null, current_date);
    raise exception 'HỎNG — thẻ thứ 11 vẫn tạo được, hạn mức không chặn gì';
  exception when sqlstate 'P0001' then
    get stacked diagnostics loi = message_text;
    if loi <> 'DAILY_LIMIT_REACHED' then
      raise exception 'HỎNG — chặn đúng nhưng sai mã: %', loi;
    end if;
  end;

  /* Mỗi thẻ tự tạo phải có một dòng lịch ôn. Thiếu thì thẻ tồn tại mà không
     bao giờ đến hạn — người học tạo xong rồi không thấy nó ở đâu nữa. */
  if exists (
    select 1 from public.cards c
     where c.user_id = hs and c.front like '__KIEM074__%'
       and not exists (select 1 from public.reviews r where r.card_id = c.id)
  ) then
    raise exception 'HỎNG — có thẻ tự tạo không có lịch ôn';
  end if;

  /* Nội dung rỗng và nội dung quá dài đều phải bị từ chối. */
  begin
    perform public.tao_the_tu_viet('   ', 'có nội dung', null, current_date);
    raise exception 'HỎNG — nhận mặt trước rỗng';
  exception when sqlstate '22023' then null;
  end;

  raise notice 'OK — 10 thẻ vào được, thẻ 11 bị chặn đúng mã';
end $$;

/* Trả vai Ở NGOÀI khối DO.
   `reset role` bên trong khối không trả lại quyền cho câu lệnh sau nó — lượt
   push đầu tiên chết ở đúng chỗ này với "permission denied for table cards",
   và đó là bằng chứng phép đổi vai có hiệu lực thật. Dọn ở cấp câu lệnh. */
reset role;
select set_config('request.jwt.claims', '', true);

delete from public.cards where front like '__KIEM074__%';

/* Quyền: đường ghi duy nhất là hàm. Còn policy INSERT trên `cards` thì hạn mức
   thành đồ trang trí — client ghi thẳng, khỏi qua hàm. */
do $$
begin
  if has_table_privilege('authenticated', 'public.cards', 'insert') then
    raise exception 'authenticated vẫn chèn thẳng được vào cards — hạn mức vô nghĩa';
  end if;
  if has_function_privilege('anon', 'public.tao_the_tu_viet(text, text, text, date)', 'execute') then
    raise exception 'anon vẫn gọi được tao_the_tu_viet';
  end if;
  raise notice 'OK — đường ghi duy nhất là hàm';
end $$;
