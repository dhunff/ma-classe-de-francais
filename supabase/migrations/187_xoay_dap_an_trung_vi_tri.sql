-- 187 · XOAY PHƯƠNG ÁN CỦA 3 BÀI CÓ MỌI ĐÁP ÁN CÙNG MỘT VỊ TRÍ (03/11).
--
-- Máy dựng lô 27, 28, 31 trộn phương án bằng số giả ngẫu nhiên có hạt cố định; ba bài rơi vào
-- trường hợp mọi câu QCM đều đáp án C, học sinh đoán được. Mỗi câu xoay trái k = ord mod n vị trí
-- (n là số phương án), đáp án dời theo. Chỉ đụng câu QCM của đúng ba bài này.

with c as (
  select q.id, q.ord, q.payload->'options' as op, (q.answer_key->>'answer')::int as dap,
         jsonb_array_length(q.payload->'options') as n
  from public.questions q
  where q.exercise_id in ('a1ce0407204m', 'a1ce0507204n', 'a2co03u1z05h') and q.type = 'qcm'
), moi as (
  select c.id, c.ord % c.n as k, c.n, c.dap,
         (select jsonb_agg(c.op->((i + c.ord % c.n) % c.n) order by i) from generate_series(0, c.n - 1) i) as op_moi
  from c
)
update public.questions q
set payload = jsonb_set(q.payload, '{options}', moi.op_moi),
    answer_key = jsonb_set(q.answer_key, '{answer}', to_jsonb(((moi.dap - moi.k) % moi.n + moi.n) % moi.n))
from moi
where q.id = moi.id;

do $$
declare n int;
begin
  select count(*) into n from (
    select q.exercise_id from public.questions q
    where q.exercise_id in ('a1ce0407204m', 'a1ce0507204n', 'a2co03u1z05h') and q.type = 'qcm'
    group by 1 having count(distinct q.answer_key->>'answer') = 1
  ) x;
  if n <> 0 then raise exception 'còn % bài có mọi đáp án cùng vị trí', n; end if;
end $$;
