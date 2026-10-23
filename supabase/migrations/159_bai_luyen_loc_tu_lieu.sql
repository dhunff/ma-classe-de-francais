-- 159 · Sửa 158: tư liệu của bài nằm ở CỘT reading_text / audio_url / image_url, không ở
-- meta (chỉ audioLuyen ở meta). Bản 158 lọc theo meta nên vẫn chọn câu của bài nghe
-- (đo được: câu « Quelle mesure Donald Trump… » của một bài nghe B2).
create or replace function public.bai_luyen_cua_toi()
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); kq jsonb;
begin
  if u is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  with ket_qua as (
    select an.question_id, an.correct, a.finished_at luc
      from answers an join attempts a on a.id = an.attempt_id
     where a.user_id = u and an.correct is not null and a.finished_at is not null
    union all
    select o.question_id, o.correct, o.luc from on_tap_luot o where o.user_id = u),
  moi_nhat as (
    select distinct on (question_id) question_id, correct, luc from ket_qua order by question_id, luc desc),
  so_sai as (select question_id, count(*) filter (where not correct) n from ket_qua group by question_id),
  hop_le as (
    select q.id, q.exercise_id, q.type, q.prompt, q.payload, q.point_gram, x.title, x.level
      from questions q join exercises x on x.id = q.exercise_id
     where q.type not in ('open') and x.store in ('practice', 'assignment')
       and coalesce(x.reading_text, '') = '' and coalesce(x.audio_url, '') = '' and coalesce(x.image_url, '') = ''
       and coalesce(x.meta->>'audioLuyen', '') = ''
       and public.can_open_exercise(x.id)),
  sai as (
    select h.*, 'sai' ly_do, s.n so_lan_sai, m.luc
      from hop_le h join moi_nhat m on m.question_id = h.id join so_sai s on s.question_id = h.id
     where not m.correct
     order by s.n desc, m.luc asc limit 10),
  them as (
    select h.*, 'cung_diem' ly_do, 0 so_lan_sai, null::timestamptz luc
      from hop_le h
     where h.point_gram is not null and h.point_gram in (select point_gram from sai where point_gram is not null)
       and not exists (select 1 from ket_qua k where k.question_id = h.id)
     order by random() limit greatest(0, 10 - (select count(*) from sai)))
  select jsonb_build_object('ok', true,
    'so_cau_sai', (select count(*) from moi_nhat m join hop_le h on h.id = m.question_id where not m.correct),
    'cau', coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'exercise_id', c.exercise_id, 'type', c.type, 'prompt', c.prompt,
      'payload', c.payload, 'point_gram', c.point_gram, 'title', c.title, 'level', c.level, 'ly_do', c.ly_do, 'so_lan_sai', c.so_lan_sai)), '[]'::jsonb))
    into kq
    from (select * from sai union all select * from them) c;
  return kq;
end $$;
