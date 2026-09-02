-- 064 — kiểm chứng 063, chạy ở một lần Run RIÊNG
--
-- Tách khỏi 063 vì khối kiểm cùng transaction với DDL sẽ báo thành công cho
-- việc có thể bị cuộn ngược (bài học 046 — xem CLAUDE.md).

/* ── Ràng buộc phải THẬT SỰ chặn, không chỉ tồn tại ──
   Một hàng rào chưa ai thử đẩy vào thì chưa biết có đứng không. */
do $$
declare
  ai uuid;
  the uuid;
begin
  select id into ai from auth.users limit 1;
  if ai is null then
    raise notice 'BỎ QUA: chưa có người dùng nào';
    return;
  end if;

  insert into public.cards (user_id, kind, front, back)
  values (ai, 'mot', '__kiem_064__', '__kiem_064__')
  returning id into the;

  insert into public.reviews (card_id, user_id) values (the, ai);

  /* interval_days = 0 → thẻ đến hạn mãi mãi, buổi ôn không bao giờ kết thúc. */
  begin
    update public.reviews set interval_days = 0 where card_id = the;
    raise exception 'HỎNG — database nhận interval_days = 0';
  exception when check_violation then
    raise notice 'OK — quãng 0 bị từ chối';
  end;

  /* ease dưới 1.3 → quãng co lại mãi, thẻ không bao giờ ra khỏi vòng. */
  begin
    update public.reviews set ease = 1.0 where card_id = the;
    raise exception 'HỎNG — database nhận ease = 1.0';
  exception when check_violation then
    raise notice 'OK — ease dưới sàn bị từ chối';
  end;

  delete from public.cards where id = the;
  raise notice 'OK — đã dọn thẻ thử';
end $$;

/* ── Một thẻ mỗi câu mỗi người ── */
do $$
declare
  ai uuid;
  cau text;
begin
  select id into ai from auth.users limit 1;
  select id into cau from public.questions limit 1;
  if ai is null or cau is null then
    raise notice 'BỎ QUA: thiếu người dùng hoặc câu hỏi';
    return;
  end if;

  insert into public.cards (user_id, front, back, source_question_id)
  values (ai, 'a', 'b', cau);

  begin
    insert into public.cards (user_id, front, back, source_question_id)
    values (ai, 'a2', 'b2', cau);
    raise exception 'HỎNG — database nhận thẻ thứ hai cho cùng một câu';
  exception when unique_violation then
    raise notice 'OK — thẻ trùng câu bị từ chối';
  end;

  delete from public.cards where user_id = ai and source_question_id = cau;
end $$;

/* ── Quyền ── */
do $$
begin
  if has_table_privilege('authenticated', 'public.cards', 'insert') then
    raise exception 'authenticated vẫn chèn thẳng được vào cards';
  end if;
  if has_column_privilege('authenticated', 'public.reviews', 'user_id', 'update') then
    raise exception 'authenticated vẫn sửa được reviews.user_id';
  end if;
  if has_function_privilege('anon', 'public.ghi_lan_on(uuid, date, int, real, int, int)', 'execute') then
    raise exception 'anon vẫn gọi được ghi_lan_on';
  end if;
  if not has_function_privilege('authenticated', 'public.tao_the_tu_lo_hong(int)', 'execute') then
    raise exception 'authenticated KHÔNG gọi được tao_the_tu_lo_hong';
  end if;
  raise notice 'OK — quyền đúng như thiết kế';
end $$;

/* ── Cột được phép sửa thì PHẢI sửa được ──
   Thu quyền quá tay cũng là một cách làm hỏng: nếu `due_at` bị khoá luôn thì
   không ai ghi được kết quả một lần ôn, và triệu chứng là "bấm Tốt xong không
   có gì xảy ra". Kiểm cả hai chiều. */
do $$
begin

  if not has_column_privilege('authenticated', 'public.reviews', 'due_at', 'update') then
    raise exception 'authenticated KHÔNG sửa được due_at — thu quyền quá tay';
  end if;
  if not has_column_privilege('authenticated', 'public.reviews', 'ease', 'update') then
    raise exception 'authenticated KHÔNG sửa được ease';
  end if;
  raise notice 'OK — sửa được đúng những cột cần sửa';
end $$;
