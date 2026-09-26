-- Cộng bù XP cho các lượt nộp TRƯỚC khi có trigger 101 — cùng quy tắc:
-- lượt nộp ĐẦU TIÊN của mỗi bài, 10 + điểm. Ghi sổ cái để số dư giải thích
-- được. Chạy lại không cộng hai lần: bỏ qua bài đã có dòng sổ 'hoan_thanh_bai'.
with dau as (
  select distinct on (a.user_id, a.exercise_id)
         a.user_id, a.exercise_id, 10 + greatest(coalesce(a.score, 0), 0) as diem
    from public.attempts a
    join public.profiles p on p.id = a.user_id
   where a.finished_at is not null and a.exercise_id is not null
     and not exists (select 1 from public.xp_so_cai s
                      where s.user_id = a.user_id and s.ly_do = 'hoan_thanh_bai'
                        and s.ref = a.exercise_id)
   order by a.user_id, a.exercise_id, a.finished_at
), so as (
  insert into public.xp_so_cai (user_id, delta, ly_do, ref)
  select user_id, diem, 'hoan_thanh_bai', exercise_id from dau
  returning user_id, delta
)
update public.profiles p
   set xp_balance = p.xp_balance + t.tong
  from (select user_id, sum(delta)::int as tong from so group by user_id) t
 where t.user_id = p.id;
