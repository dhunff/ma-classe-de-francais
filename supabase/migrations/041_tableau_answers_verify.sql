-- 041 — kiểm kết quả của 039 (CHỈ ĐỌC, chạy SAU 039)
--
-- Tách khỏi 039 vì lý do đã trả giá hai lần: khối `raise exception` nằm cùng
-- transaction với `update` thì kiểm hỏng là cuộn ngược luôn phần cập nhật, và
-- trạng thái sau đó không phân biệt được với "chưa chạy bao giờ".
--
-- File này không ghi gì. Chạy lại bao nhiêu lần cũng được.

do $$
declare
  con_lo int;
  j jsonb;
  so_o int;
  so_dap_an int;
  thieu text;
begin
  -- ── 1. Không câu nào còn để đáp án ở chỗ công khai ──
  --
  -- `payload` cấp SELECT cho anon. Một tên trường sót lại ở đây nghĩa là đáp án
  -- của câu đó đọc được bằng một lệnh curl.
  select count(*) into con_lo from public.questions
   where payload ?| array['answer', 'accepted', 'justification', 'answers', 'model'];
  if con_lo > 0 then
    raise warning 'CÒN % câu để đáp án trong payload:', con_lo;
    for thieu in
      select id from public.questions
       where payload ?| array['answer', 'accepted', 'justification', 'answers', 'model']
       limit 10
    loop
      raise warning '   %', thieu;
    end loop;
  end if;

  -- ── 2. Bảng CE đủ 16 ô có đáp án ──
  select payload || answer_key into j from public.questions where id = 'mrigyggjafq4jz';
  if j is null then
    raise exception 'không tìm thấy câu mrigyggjafq4jz';
  end if;

  select count(*) into so_o
    from jsonb_array_elements(j -> 'criteres') cr,
         jsonb_array_elements(j -> 'colonnes') co;

  select count(*) into so_dap_an
    from jsonb_array_elements(j -> 'criteres') cr,
         jsonb_array_elements(j -> 'colonnes') co
   where coalesce(j -> 'answers' ->> ((cr ->> 'id') || '_' || (co ->> 'id')), '') <> '';

  -- ── 3. Ô từng thiếu phải đúng bằng NON ──
  --
  -- Kiểm GIÁ TRỊ chứ không chỉ kiểm "có gì đó": điền nhầm OUI thì bảng vẫn đủ
  -- 16/16 và mọi phép đếm vẫn xanh, chỉ có học sinh bị chấm sai.
  if coalesce(j -> 'answers' ->> 'mrih0l77jiug8j_mrigyggjk7utu3', '') <> 'NON' then
    raise exception 'ô « Accès en transports publics × Grande Galerie » đang là "%", phải là NON',
      coalesce(j -> 'answers' ->> 'mrih0l77jiug8j_mrigyggjk7utu3', '(trống)');
  end if;

  if con_lo > 0 or so_dap_an <> so_o then
    raise exception 'chưa xong — payload còn lộ: % câu · bảng CE: %/% ô',
      con_lo, so_dap_an, so_o;
  end if;

  raise notice 'xong — 0 câu lộ đáp án, bảng CE %/% ô, ô Grande Galerie = NON',
    so_dap_an, so_o;
end $$;
