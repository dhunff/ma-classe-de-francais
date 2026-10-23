-- 158 · « Bài luyện của tôi » (23/10, theo chủ dự án): mỗi ngày tối đa 10 câu
-- ghép từ CHÍNH các câu học sinh làm sai, thêm câu cùng điểm ngữ pháp chưa làm.
--
-- Chấm bằng Edge Function `cham-on-tap` (dùng lại bộ chấm của `grade`), ghi vào bảng
-- RIÊNG on_tap_luot, KHÔNG ghi attempts: một lượt ôn 10 câu rải trên nhiều bài mà
-- ghi vào attempts sẽ thành điểm từng phần (2/2, 1/1…) chen vào lịch sử, điểm trung
-- bình, XP « nộp lần đầu » của các bài gốc.
--
-- Chỉ lấy câu KHÔNG cần tư liệu: bài có văn bản đọc / audio thì câu hỏi tách khỏi
-- tư liệu là câu không trả lời được. Bỏ câu tự luận (open).

create table if not exists public.on_tap_luot (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  correct boolean not null,
  luc timestamptz not null default now()
);
create index if not exists on_tap_luot_user_idx on public.on_tap_luot (user_id, question_id, luc desc);
alter table public.on_tap_luot enable row level security;
drop policy if exists on_tap_luot_doc on public.on_tap_luot;
create policy on_tap_luot_doc on public.on_tap_luot for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete on public.on_tap_luot from anon, authenticated;
grant select on public.on_tap_luot to authenticated;

-- Ôn câu cũng là một ngày học (153).
drop trigger if exists ngay_hoc on public.on_tap_luot;
create trigger ngay_hoc after insert on public.on_tap_luot for each row execute function public._trg_ngay_hoc();

create or replace function public.bai_luyen_cua_toi()
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); kq jsonb;
begin
  if u is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  with ket_qua as (                       -- mọi lần trả lời của người này
    select an.question_id, an.correct, a.finished_at luc
      from answers an join attempts a on a.id = an.attempt_id
     where a.user_id = u and an.correct is not null and a.finished_at is not null
    union all
    select o.question_id, o.correct, o.luc from on_tap_luot o where o.user_id = u),
  moi_nhat as (
    select distinct on (question_id) question_id, correct, luc from ket_qua order by question_id, luc desc),
  so_sai as (select question_id, count(*) filter (where not correct) n from ket_qua group by question_id),
  hop_le as (                             -- câu dùng được cho bài luyện
    select q.id, q.exercise_id, q.type, q.prompt, q.payload, q.point_gram, x.title, x.level
      from questions q join exercises x on x.id = q.exercise_id
     where q.type not in ('open') and x.store in ('practice', 'assignment')
       and coalesce(x.meta->>'readingText', '') = '' and coalesce(x.meta->>'audioUrl', '') = ''
       and public.can_open_exercise(x.id)),
  sai as (
    select h.*, 'sai' ly_do, s.n so_lan_sai, m.luc
      from hop_le h join moi_nhat m on m.question_id = h.id join so_sai s on s.question_id = h.id
     where not m.correct
     order by s.n desc, m.luc asc limit 10),
  them as (                               -- câu CÙNG điểm ngữ pháp, chưa từng làm
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
revoke execute on function public.bai_luyen_cua_toi() from public, anon;
grant execute on function public.bai_luyen_cua_toi() to authenticated;
