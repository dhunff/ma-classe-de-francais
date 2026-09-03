-- 076 — kiểm chứng 075, chạy ở một lần Run RIÊNG

/* ── Cột mới có LỌT ra ngoài không ──
   Đây là phép đo thay cho trí nhớ: CLAUDE.md ghi rằng cột thêm sau thừa hưởng
   quyền MỨC BẢNG khi `attacl` là NULL. `questions` lại đang cấp theo CỘT, nên
   kết quả phải ngược lại. Hai tình huống chỉ khác nhau ở một chi tiết không ai
   nhớ nổi — nên đo. */
do $$
begin
  if has_column_privilege('anon', 'public.questions', 'evidence', 'select') then
    raise exception 'HỎNG — anon đọc được evidence, tức là đọc được đáp án trước khi làm';
  end if;
  if has_column_privilege('authenticated', 'public.questions', 'evidence', 'select') then
    raise exception 'HỎNG — authenticated đọc thẳng được evidence, không cần qua hàm';
  end if;

  /* Chín cột kia PHẢI còn đọc được. Thu quyền quá tay cũng là một cách làm
     hỏng: mất `prompt` thì cả thư viện trắng xoá — đã xảy ra ngay sau 022. */
  if not has_column_privilege('anon', 'public.questions', 'prompt', 'select') then
    raise exception 'HỎNG — thu quyền quá tay, anon mất luôn prompt';
  end if;

  raise notice 'OK — evidence bị khoá, các cột khác còn nguyên';
end $$;

/* ── Học sinh CHƯA làm thì KHÔNG được thấy neo ──
   Đây là ca quan trọng nhất của cả migration. Đọc mã và gật đầu là chưa kiểm
   gì cả. */
do $$
declare
  hs   uuid;
  bai  text;
  cau  text;
  n    int;
begin
  /* Chọn một câu mà học sinh này CHƯA từng trả lời. */
  select p.id into hs from public.profiles p where p.role = 'eleve' limit 1;
  if hs is null then
    raise notice 'BỎ QUA: chưa có học sinh nào';
    return;
  end if;

  select q.id, q.exercise_id into cau, bai
    from public.questions q
   where not exists (
     select 1 from public.answers a join public.attempts t on t.id = a.attempt_id
      where a.question_id = q.id and t.user_id = hs)
   limit 1;
  if cau is null then
    raise notice 'BỎ QUA: học sinh này đã trả lời mọi câu';
    return;
  end if;

  update public.questions set evidence = '{"trich":"__KIEM076__"}'::jsonb where id = cau;

  perform set_config('role','authenticated',true);
  perform set_config('request.jwt.claims',
    json_build_object('sub', hs::text, 'role','authenticated')::text, true);

  select count(*) into n from public.doc_neo(bai) where question_id = cau;
  if n <> 0 then
    raise exception 'HỎNG — học sinh CHƯA làm bài vẫn đọc được neo';
  end if;

  /* Và ghi thì phải bị từ chối. */
  begin
    perform public.luu_neo(cau, '{"trich":"hoc sinh tu dat"}'::jsonb);
    raise exception 'HỎNG — học sinh đặt được neo';
  exception when sqlstate '42501' then null;
  end;

  raise notice 'OK — chưa làm thì không thấy neo, và không đặt được neo';
end $$;

reset role;
select set_config('request.jwt.claims', '', true);
update public.questions set evidence = null where evidence::text like '%__KIEM076__%';

/* ── Giáo viên thì thấy ── */
do $$
declare
  gv  uuid;
  bai text;
  cau text;
  n   int;
begin
  select id into gv from public.profiles where role = 'prof' limit 1;
  select id, exercise_id into cau, bai from public.questions limit 1;
  if gv is null or cau is null then
    raise notice 'BỎ QUA: thiếu giáo viên hoặc câu hỏi';
    return;
  end if;

  perform set_config('role','authenticated',true);
  perform set_config('request.jwt.claims',
    json_build_object('sub', gv::text, 'role','authenticated',
                      'app_metadata', json_build_object('role','prof'))::text, true);

  perform public.luu_neo(cau, '{"trich":"__KIEM076B__"}'::jsonb);
  select count(*) into n from public.doc_neo(bai) where question_id = cau;
  if n <> 1 then
    raise exception 'HỎNG — giáo viên đặt neo xong không đọc lại được (n=%)', n;
  end if;
  raise notice 'OK — giáo viên đặt và đọc được neo';
end $$;

reset role;
select set_config('request.jwt.claims', '', true);
update public.questions set evidence = null where evidence::text like '%__KIEM076B__%';
