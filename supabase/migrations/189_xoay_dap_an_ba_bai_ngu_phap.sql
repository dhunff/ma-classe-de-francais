-- 189 · XOAY PHƯƠNG ÁN CỦA 3 BÀI NGỮ PHÁP NHẬP 09/2026 CÓ MỌI ĐÁP ÁN LÀ B (03/11).
--
-- Rà toàn kho sau migration 187 còn ba bài ngoài cây Luyện tập (10 câu QCM, 4 phương án, đáp án
-- đều ở vị trí 1). Cách xoay giống 187: mỗi câu xoay trái k = ord mod n vị trí, đáp án dời theo.
-- Không phương án nào phụ thuộc vị trí (« toutes », « aucune »…), đã kiểm trước khi viết.

with c as (
  select q.id, q.ord, q.payload->'options' as op, (q.answer_key->>'answer')::int as dap,
         jsonb_array_length(q.payload->'options') as n
  from public.questions q
  where q.exercise_id in ('nhapmuhwc8h701q', 'nhapmuhwc8h801t', 'nhapmuo5ehj4021') and q.type = 'qcm'
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
    where q.exercise_id in ('nhapmuhwc8h701q', 'nhapmuhwc8h801t', 'nhapmuo5ehj4021') and q.type = 'qcm'
    group by 1 having count(distinct q.answer_key->>'answer') = 1
  ) x;
  if n <> 0 then raise exception 'còn % bài có mọi đáp án cùng vị trí', n; end if;
end $$;
