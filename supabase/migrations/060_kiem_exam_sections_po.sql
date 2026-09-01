-- 060 — kiểm chứng 059, chạy ở một lần Run RIÊNG
--
-- Tách khỏi 059 vì một khối kiểm nằm cùng transaction với DDL sẽ báo thành
-- công cho việc có thể bị cuộn ngược ngay sau đó. Đây là bài học đắt nhất của
-- dự án (046) — xem CLAUDE.md.

do $$
declare
  dinh_nghia text;
begin
  select pg_get_constraintdef(oid) into dinh_nghia
    from pg_constraint
   where conrelid = 'public.exam_sections'::regclass
     and conname = 'exam_sections_code_check';

  if dinh_nghia is null then
    raise exception 'KHÔNG có exam_sections_code_check — hàng rào đã biến mất hẳn';
  end if;

  if dinh_nghia not like '%PO%' then
    raise exception 'exam_sections_code_check vẫn chưa nhận PO: %', dinh_nghia;
  end if;

  if pg_get_constraintdef((
        select oid from pg_constraint
         where conrelid = 'public.exam_sections'::regclass
           and conname = 'exam_sections_po_khong_diem')) is null then
    raise exception 'thiếu exam_sections_po_khong_diem';
  end if;

  raise notice 'OK — % ', dinh_nghia;
end $$;

/* Ràng buộc điểm phải THẬT SỰ chặn, không chỉ tồn tại. Chèn thử một dòng sai
   rồi cuộn ngược: một hàng rào chưa ai thử đẩy vào thì chưa biết có đứng
   không. */
do $$
declare
  de uuid;
  bai text;
begin
  select id into de from public.exams limit 1;
  select id into bai from public.exercises limit 1;
  if de is null or bai is null then
    raise notice 'BỎ QUA phép thử chèn: chưa có đề hoặc bài nào';
    return;
  end if;

  begin
    insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord)
    values (de, 'PO', bai, 15, 25, 99);
    raise exception 'HỎNG — database nhận một dòng PO mang 25 điểm';
  exception
    when check_violation then
      raise notice 'OK — PO mang điểm bị từ chối đúng như mong đợi';
  end;

  /* Không để lại gì: phép thử trên đã bị chặn nên không có dòng nào, nhưng nói
     ra để người đọc sau không phải tự suy. */
end $$;
