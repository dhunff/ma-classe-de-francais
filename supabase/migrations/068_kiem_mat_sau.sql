-- 068 — kiểm chứng 067, chạy ở một lần Run RIÊNG

do $$
declare
  con int;
  ham text;
begin
  select count(*) into con from public.cards
   where back like '%Mở lại bài để xem đáp án%';
  if con > 0 then
    raise exception 'còn % thẻ chỉ đường tới chỗ không tồn tại', con;
  end if;

  select pg_get_functiondef(p.oid) into ham
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'tao_the_tu_lo_hong';

  if ham like '%Mở lại bài để xem đáp án%' then
    raise exception 'hàm sinh thẻ vẫn dựng câu cũ — thẻ MỚI sẽ lại sai';
  end if;

  /* Điều kiện lọc theo người dùng phải còn nguyên sau khi viết lại hàm. Đây là
     chỗ dễ mất nhất khi chép lại một hàm dài, và mất nó nghĩa là mọi học sinh
     nhận thẻ dựng từ câu sai của người khác. */
  if ham not like '%t.user_id = ai%' then
    raise exception 'hàm sinh thẻ MẤT điều kiện lọc theo người dùng';
  end if;

  raise notice 'OK — mặt sau đã thật thà, hàm giữ nguyên phép lọc';
end $$;
