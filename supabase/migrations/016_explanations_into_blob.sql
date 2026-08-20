-- 016 — đẩy 190 giải thích từ bảng `questions` NGƯỢC vào hai blob
--
-- LÝ DO. Migration 012–015 ghi `explanation` vào bảng `questions`. Nhưng ứng
-- dụng CHƯA đọc bảng đó — `PracticeHub.jsx:107` vẫn `load("mcf-practice")` và
-- `App.jsx:73` vẫn `load("mcf-exercises")`. Nên 190 giải thích ấy nằm im, học
-- sinh không thấy chữ nào. Đối chiếu trước khi chạy:
--
--     bảng questions   : 190/416 câu có explanation
--     blob mcf-practice:   0/395
--     blob mcf-exercises:  0/21
--
-- Blob vẫn là nguồn sự thật cho tới khi nối xong 20 chỗ gọi (xem CLAUDE.md).
-- Chép sang blob là cách duy nhất để công việc đến được người học.
--
-- HAI BLOB, KHÔNG PHẢI MỘT. Bản đầu của migration này chỉ xử lý mcf-practice
-- và bộ đối chiếu ở cuối đã bắt được: 170 thay vì 190. Hai mươi câu còn lại là
-- bài A2 « L’expression de la cause », nằm ở mcf-exercises. Giữ lại ghi chú
-- này vì cái bẫy sẽ lặp ở mọi lần chép blob về sau.
--
-- AN TOÀN. Chỉ THÊM trường `explanation`; không xoá, không sửa đề bài, không
-- đụng `answer`/`options`. Ba đáp án `accepted` sửa riêng, liệt kê từng id.
-- Bản gốc lưu vào `<key>__backup_016` trước khi ghi.

-- ── 1. sao lưu cả hai ──
insert into public.kv_store (key, value)
select key || '__backup_016', value
  from public.kv_store
 where key in ('s:mcf-practice', 's:mcf-exercises')
    on conflict (key) do update set value = excluded.value;

-- ── 2. chép explanation theo id câu hỏi, cho cả hai blob ──
update public.kv_store k
   set value = (
     select jsonb_agg(
              ex || jsonb_build_object('questions', (
                select coalesce(jsonb_agg(
                         case when tq.explanation is null then qj
                              else qj || jsonb_build_object('explanation', tq.explanation)
                         end
                         order by qo
                       ), '[]'::jsonb)
                  from jsonb_array_elements(ex -> 'questions')
                       with ordinality as qs(qj, qo)
                       left join public.questions tq on tq.id = qs.qj ->> 'id'
              ))
              order by eo
            )::text
       from jsonb_array_elements(k.value::jsonb) with ordinality as es(ex, eo)
   )
 where k.key in ('s:mcf-practice', 's:mcf-exercises');

-- ── 3. ba đáp án mẫu sai, sửa từng câu một ──
-- Học sinh gõ đúng tiếng Pháp chuẩn mà vẫn bị chấm sai. Chi tiết ở 015.
--   mrh4vaysa3ptm6  aboriculture → arboriculture
--   mrh4uuybxo82yr  rejète       → rejette|rejète
--   mrh5c6y9bnitt3  insoucieuse  → insouciante|insoucieuse
update public.kv_store k
   set value = (
     select jsonb_agg(
              ex || jsonb_build_object('questions', (
                select coalesce(jsonb_agg(
                         case qj ->> 'id'
                           when 'mrh4vaysa3ptm6' then qj || '{"accepted":"arboriculture"}'::jsonb
                           when 'mrh4uuybxo82yr' then qj || '{"accepted":"rejette|rejète"}'::jsonb
                           when 'mrh5c6y9bnitt3' then qj || '{"accepted":"insouciante|insoucieuse"}'::jsonb
                           else qj
                         end
                         order by qo
                       ), '[]'::jsonb)
                  from jsonb_array_elements(ex -> 'questions')
                       with ordinality as qs(qj, qo)
              ))
              order by eo
            )::text
       from jsonb_array_elements(k.value::jsonb) with ordinality as es(ex, eo)
   )
 where k.key = 's:mcf-practice';

-- ── 4. tự đối chiếu ──
-- Con số phải khớp bảng `questions`: 170 ở mcf-practice, 20 ở mcf-exercises,
-- và 3 đáp án đã sửa. Lệch một câu là dừng, không ghi nửa vời.
do $$
declare
  prac int; exo int; da_sua int; tong_bang int;
begin
  select count(*) filter (where k.key = 's:mcf-practice'  and q ->> 'explanation' is not null),
         count(*) filter (where k.key = 's:mcf-exercises' and q ->> 'explanation' is not null),
         count(*) filter (where q ->> 'id' in
                 ('mrh4vaysa3ptm6','mrh4uuybxo82yr','mrh5c6y9bnitt3')
             and q ->> 'accepted' in
                 ('arboriculture','rejette|rejète','insouciante|insoucieuse'))
    into prac, exo, da_sua
    from public.kv_store k,
         lateral jsonb_array_elements(k.value::jsonb) ex,
         lateral jsonb_array_elements(ex -> 'questions') q
   where k.key in ('s:mcf-practice', 's:mcf-exercises');

  select count(*) into tong_bang
    from public.questions where explanation is not null;

  raise notice 'blob: % (practice) + % (exercises) = % · bảng: % · đáp án sửa: %',
    prac, exo, prac + exo, tong_bang, da_sua;

  if prac <> 170 or exo <> 20 or da_sua <> 3 or prac + exo <> tong_bang then
    raise exception 'đối chiếu HỎNG: practice=% exercises=% bảng=% đáp án=%',
      prac, exo, tong_bang, da_sua;
  end if;
end $$;
