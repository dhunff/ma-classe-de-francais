-- Ngân hàng đề: chuyển `mcf-exercises` và `mcf-practice` từ blob sang bảng.
--
-- VÌ SAO: `s:mcf-practice` đã 144 KB. Mỗi lần mở thư viện là tải trọn cả khối;
-- mỗi lần giáo viên sửa một bài là ghi lại cả khối, nên hai người sửa cùng lúc
-- thì một người mất trắng. Và không có `GROUP BY` nào chạy được trên nó, tức
-- toàn bộ phần phân tích theo kỹ năng trong docs/roadmap-delf.md bị chặn ở đây.
--
-- BA RÀNG BUỘC ĐÃ ĐỌC RA TỪ DỮ LIỆU THẬT TRƯỚC KHI THIẾT KẾ:
--
-- 1. GIỮ NGUYÊN ID CŨ. `submissions.exercise_id` là `text` chứa đúng id trong
--    blob. Sinh uuid mới là mọi bài nộp mất liên kết với bài tập của nó.
--
-- 2. GIỮ HAI KHO TÁCH BIỆT. App đọc `mcf-exercises` cho bài được giao và
--    `mcf-practice` cho thư viện luyện tập. Cột `store` tái tạo đúng ranh giới
--    đó; gộp làm một là thư viện luyện tập nuốt cả bài đang giao.
--
-- 3. SÁU LOẠI CÂU HỎI, TẬP TRƯỜNG KHÁC NHAU. qcm có `options`+`answer`,
--    fill/conj có `accepted`, ordre có `elements`, tableau có
--    `colonnes`/`criteres`/`answers`, vf có `justification`, open có `model`.
--    Nâng hết thành cột là một bảng đầy null. Phần riêng của từng loại vào
--    `payload`; chỉ nâng thứ cần cho truy vấn và phân quyền.
--
-- Theo khuôn 005/007: chép sang, GIỮ blob làm sao lưu, tự in số liệu đối chiếu.
-- KHÔNG xoá blob. Ứng dụng chỉ chuyển sang bảng sau khi hai số khớp.
--
-- Cần 002 (is_teacher) và 007 (parse_submission_at). Chạy qua `supabase db push`.

-- ───────────────────────────── Bảng ─────────────────────────────

create table if not exists public.exercises (
  id           text primary key,               -- GIỮ id cũ, xem ràng buộc 1
  store        text not null check (store in ('practice', 'assignment')),
  title        text not null default '(Sans titre)',
  level        text not null default 'B1',
  skills       text[] not null default '{}',
  usage_type   text,
  deadline     timestamptz,
  time_limit   int,
  consigne     text,
  reading_text text,
  audio_url    text,
  image_url    text,
  /* Phần còn lại của bản ghi cũ: targeted, assignedTo, assignedClasses,
     assignedExtra, folderId, customCat. Cố ý không tách cột — hình dạng đó do
     mã ứng dụng quyết định và còn đổi, mà mỗi lần đổi lại phải viết migration. */
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz,
  imported_at  timestamptz not null default now()
);

create index if not exists exercises_store_idx on public.exercises (store, created_at desc);
create index if not exists exercises_level_idx on public.exercises (level);

create table if not exists public.questions (
  id           text primary key,               -- GIỮ id cũ: đáp án học sinh khoá theo id này
  exercise_id  text not null references public.exercises on delete cascade,
  ord          int  not null default 0,
  type         text not null,
  prompt       text not null default '',
  payload      jsonb not null default '{}'::jsonb,
  explanation  text,
  /* Hai trục phân loại, chốt ngày 2026-08-19 — xem docs/roadmap-delf.md §1.2
     và §1.2b. Để null cho tới khi gắn nhãn; đó là việc tiếp theo. */
  competence   text,
  point_gram   text
);

create index if not exists questions_exercise_idx on public.questions (exercise_id, ord);
create index if not exists questions_competence_idx on public.questions (competence)
  where competence is not null;

-- ───────────────────────────── RLS ─────────────────────────────
--
-- Đề dùng chung toàn hệ thống (chốt 2026-08-19). Đọc mở cho cả khách — thư
-- viện luyện tập ở /decouvrir vốn đã cho anon xem, và policy
-- `kv_anon_read_catalogue` của 002 cũng mở đúng hai khoá này.

alter table public.exercises enable row level security;
alter table public.questions enable row level security;

drop policy if exists exercises_read  on public.exercises;
drop policy if exists exercises_write on public.exercises;
drop policy if exists questions_read  on public.questions;
drop policy if exists questions_write on public.questions;

create policy exercises_read on public.exercises
  for select to anon, authenticated using (true);

create policy exercises_write on public.exercises
  for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

/* CẢNH BÁO CÒN MỞ: bảng này chứa ĐÁP ÁN trong `payload`, và policy đọc mở cho
   mọi người. Học sinh mở DevTools là thấy trước khi làm.

   Hiện trạng không tệ hơn trước — blob cũ cũng cho anon đọc nguyên đáp án, và
   gradingEngine chấm ở client nên đáp án vốn đã nằm trong bundle. Chấp nhận
   được cho TỰ LUYỆN.

   KHÔNG chấp nhận được cho thi thử. Trước khi làm Mode Examen phải chọn một
   trong hai: tách đáp án sang bảng riêng chỉ mở sau khi nộp, hoặc chuyển việc
   chấm lên Edge Function. Đây là câu hỏi còn treo ở docs/roadmap-delf.md §5. */
create policy questions_read on public.questions
  for select to anon, authenticated using (true);

create policy questions_write on public.questions
  for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

-- ───────────────────── Số liệu TRƯỚC khi chép ─────────────────────
do $$
declare n_ex int; n_q int;
begin
  select count(*) into n_ex from public.exercises;
  select count(*) into n_q  from public.questions;
  raise notice 'TRUOC: exercises=% questions=%', n_ex, n_q;
end $$;

-- ───────────────────────── Chép bài tập ─────────────────────────
--
-- `on conflict do nothing`: chạy lại không nhân đôi, và bài giáo viên đã sửa
-- trong bảng thì không bị blob cũ ghi đè ngược.

insert into public.exercises (
  id, store, title, level, skills, usage_type, deadline, time_limit,
  consigne, reading_text, audio_url, image_url, meta, created_at
)
select
  e ->> 'id',
  case k.key when 's:mcf-practice' then 'practice' else 'assignment' end,
  coalesce(nullif(trim(e ->> 'title'), ''), '(Sans titre)'),
  coalesce(nullif(e ->> 'level', ''), 'B1'),
  /* `skills` là mảng; bài cũ chỉ có `skill` dạng chuỗi. Gộp cả hai để không
     bài nào rơi ra khỏi bộ lọc kỹ năng. */
  coalesce(
    (select array_agg(distinct x) from jsonb_array_elements_text(
        case when jsonb_typeof(e -> 'skills') = 'array' then e -> 'skills' else '[]'::jsonb end
     ) as x where x <> ''),
    case when coalesce(e ->> 'skill', '') <> '' then array[e ->> 'skill'] else '{}' end
  ),
  nullif(e ->> 'usageType', ''),
  case when e ->> 'deadline' ~ '^\d{4}-' then (e ->> 'deadline')::timestamptz else null end,
  nullif(e ->> 'timeLimit', '')::int,
  nullif(e ->> 'consigne', ''),
  nullif(e ->> 'readingText', ''),
  nullif(e ->> 'audioUrl', ''),
  nullif(e ->> 'imageUrl', ''),
  jsonb_strip_nulls(jsonb_build_object(
    'targeted',        e -> 'targeted',
    'assignedTo',      e -> 'assignedTo',
    'assignedClasses', e -> 'assignedClasses',
    'assignedExtra',   e -> 'assignedExtra',
    'folderId',        e -> 'folderId',
    'customCat',       e -> 'customCat'
  )),
  public.parse_submission_at(e ->> 'createdAt')
from public.kv_store k
cross join lateral jsonb_array_elements(k.value::jsonb) as e
where k.key in ('s:mcf-practice', 's:mcf-exercises')
  and jsonb_typeof(k.value::jsonb) = 'array'
  and coalesce(e ->> 'id', '') <> ''
on conflict (id) do nothing;

-- ───────────────────────── Chép câu hỏi ─────────────────────────
--
-- `with ordinality` giữ đúng thứ tự câu trong bài — thứ tự trong mảng JSON là
-- thứ tự giáo viên xếp, mất nó là bài tập xáo trộn.

insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation)
select
  q ->> 'id',
  e ->> 'id',
  qi::int,
  coalesce(nullif(q ->> 'type', ''), 'fill'),
  coalesce(q ->> 'prompt', ''),
  q - 'id' - 'type' - 'prompt' - 'explanation',
  nullif(q ->> 'explanation', '')
from public.kv_store k
cross join lateral jsonb_array_elements(k.value::jsonb) as e
cross join lateral jsonb_array_elements(
  case when jsonb_typeof(e -> 'questions') = 'array' then e -> 'questions' else '[]'::jsonb end
) with ordinality as t(q, qi)
where k.key in ('s:mcf-practice', 's:mcf-exercises')
  and jsonb_typeof(k.value::jsonb) = 'array'
  and coalesce(q ->> 'id', '') <> ''
  and coalesce(e ->> 'id', '') <> ''
on conflict (id) do nothing;

-- ───────────────────── Số liệu SAU khi chép ─────────────────────
do $$
declare
  n_ex int; n_q int; n_ex_blob int; n_q_blob int; n_mo_coi int;
begin
  select count(*) into n_ex from public.exercises;
  select count(*) into n_q  from public.questions;

  select count(*) into n_ex_blob
    from public.kv_store k, lateral jsonb_array_elements(k.value::jsonb) e
   where k.key in ('s:mcf-practice','s:mcf-exercises')
     and jsonb_typeof(k.value::jsonb) = 'array';

  select count(*) into n_q_blob
    from public.kv_store k,
         lateral jsonb_array_elements(k.value::jsonb) e,
         lateral jsonb_array_elements(
           case when jsonb_typeof(e->'questions')='array' then e->'questions' else '[]'::jsonb end) q
   where k.key in ('s:mcf-practice','s:mcf-exercises')
     and jsonb_typeof(k.value::jsonb) = 'array';

  select count(*) into n_mo_coi from public.questions where prompt = '';

  raise notice 'SAU  : exercises=%/% questions=%/% (bang/blob)',
    n_ex, n_ex_blob, n_q, n_q_blob;
  raise notice 'Cau khong co de bai: %', n_mo_coi;

  if n_ex < n_ex_blob or n_q < n_q_blob then
    raise warning 'CHEP HUT — dung chuyen ung dung sang bang, va dung xoa blob';
  end if;
end $$;

-- ──────────────────────── Kiểm tra sau khi chạy ────────────────────────
--
--   select store, count(*) from public.exercises group by store;
--
--   select
--     (select count(*) from public.exercises) as bai_bang,
--     (select count(*) from public.kv_store k, lateral jsonb_array_elements(k.value::jsonb)
--       where k.key in ('s:mcf-practice','s:mcf-exercises')) as bai_blob,
--     (select count(*) from public.questions) as cau_bang;
--
-- Mọi bài nộp phải còn trỏ đúng bài tập — số này phải bằng 0:
--
--   select count(*) from public.submissions s
--    where not exists (select 1 from public.exercises e where e.id = s.exercise_id);
--
-- CHƯA XOÁ blob. Giữ tới khi ứng dụng chạy ổn trên bảng mới.
