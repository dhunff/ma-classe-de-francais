-- 027 — giáo viên chấm bài viết (Production écrite)
--
-- ══ BA THỨ CÒN THIẾU ══
--
-- 1. GIÁO VIÊN KHÔNG ĐỌC ĐƯỢC BÀI LÀM. Policy `attempts_own` / `answers_own`
--    (023) chỉ mở cho chính chủ. Đúng cho học sinh, nhưng giáo viên thì không
--    thấy gì để mà chấm.
--
-- 2. KHÔNG CÓ CHỖ LƯU ĐIỂM. `answers.correct` là boolean — đủ cho trắc nghiệm,
--    không đủ cho bài viết chấm trên thang 25 kèm nhận xét.
--
-- 3. KHÔNG CÓ ĐƯỜNG GHI. Migration 024 thu hết INSERT/UPDATE/DELETE trên
--    `answers` khỏi anon và authenticated, để bộ đếm lượt nghe không bị sửa.
--    Giáo viên cũng nằm trong `authenticated`, nên họ cũng không ghi được.
--
-- ══ CÁCH LÀM, VÀ VÌ SAO ══
--
-- Thêm policy RIÊNG cho vai prof, KHÔNG nới `attempts_own` thành "ai cũng đọc
-- nếu là giáo viên". Hai policy tách bạch thì mỗi cái đọc một câu là hiểu; gộp
-- lại thì một lỗi nhỏ trong `is_teacher()` mở luôn cả cửa của học sinh.
--
-- Đường ghi đi qua RPC `security definer` thay vì cấp lại UPDATE. Cấp lại
-- UPDATE cho authenticated là mở đúng cái cửa 024 vừa đóng — học sinh cũng là
-- `authenticated`, và policy dòng không phân biệt được họ đang sửa cột `score`
-- hay cột `audio_plays`.

-- ─────────────── Chỗ lưu điểm bài viết ───────────────
alter table public.answers
  add column if not exists score      numeric(4,1),   -- 0–25, nửa điểm
  add column if not exists max_score  numeric(4,1),
  add column if not exists feedback   text,
  add column if not exists graded_by  uuid references auth.users on delete set null,
  add column if not exists graded_at  timestamptz;

comment on column public.answers.score is
  'Điểm giáo viên chấm cho câu tự luận. NULL = chưa chấm. Câu trắc nghiệm dùng cột `correct`.';

-- ─────────────── Giáo viên đọc được bài làm ───────────────
drop policy if exists attempts_teacher_read on public.attempts;
drop policy if exists answers_teacher_read  on public.answers;

create policy attempts_teacher_read on public.attempts
  for select to authenticated using (public.is_teacher());

create policy answers_teacher_read on public.answers
  for select to authenticated using (public.is_teacher());

-- ─────────────── Đường ghi điểm ───────────────
--
-- Nhận `p_teacher` tường minh để kiểm được trong migration (không có phiên
-- đăng nhập ở đây). Hàm vỏ bên dưới bơm auth.uid() vào — xem bài học ở 024/025.
create or replace function public._grade_pe(
  p_teacher uuid, p_answer uuid, p_score numeric, p_max numeric, p_feedback text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare loai text;
begin
  select q.type into loai
    from public.answers a join public.questions q on q.id = a.question_id
   where a.id = p_answer;

  if loai is null then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  /* Chỉ chấm tay câu TỰ LUẬN. Cho phép ghi đè điểm câu trắc nghiệm là mở đường
     sửa kết quả đã chấm máy — và khi đó `answers.correct` với `answers.score`
     có thể nói hai điều khác nhau về cùng một câu. */
  if loai <> 'open' then
    return jsonb_build_object('ok', false, 'reason', 'not_open');
  end if;

  if p_score is null or p_score < 0 or p_score > p_max then
    return jsonb_build_object('ok', false, 'reason', 'score_out_of_range');
  end if;

  update public.answers
     set score = p_score, max_score = p_max, feedback = nullif(btrim(p_feedback), ''),
         graded_by = p_teacher, graded_at = now()
   where id = p_answer;

  return jsonb_build_object('ok', true, 'score', p_score);
end $$;

create or replace function public.grade_pe(
  p_answer uuid, p_score numeric, p_max numeric default 25, p_feedback text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_teacher() then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;
  return public._grade_pe((select auth.uid()), p_answer, p_score, p_max, p_feedback);
end $$;

/* Thu đích danh `anon` và `authenticated`, KHÔNG chỉ `public`.
   Supabase cấp EXECUTE thẳng cho hai vai đó, và `revoke ... from public` không
   đụng tới quyền riêng — đã dính đúng lỗi này ở 024, suýt cho học sinh gọi
   `_exam_play` với p_max 999. */
revoke execute on function public._grade_pe(uuid, uuid, numeric, numeric, text)
  from anon, authenticated, public;
revoke execute on function public.grade_pe(uuid, numeric, numeric, text)
  from anon, public;
grant  execute on function public.grade_pe(uuid, numeric, numeric, text)
  to authenticated;

-- ─────────────────── Tự đối chiếu ───────────────────
do $$
declare loi text := '';
begin
  if has_function_privilege('anon', 'public._grade_pe(uuid,uuid,numeric,numeric,text)', 'execute')
     then loi := loi || 'anon gọi được _grade_pe; '; end if;
  if has_function_privilege('authenticated', 'public._grade_pe(uuid,uuid,numeric,numeric,text)', 'execute')
     then loi := loi || 'authenticated gọi được _grade_pe; '; end if;
  if has_function_privilege('anon', 'public.grade_pe(uuid,numeric,numeric,text)', 'execute')
     then loi := loi || 'anon gọi được grade_pe; '; end if;
  if not has_function_privilege('authenticated', 'public.grade_pe(uuid,numeric,numeric,text)', 'execute')
     then loi := loi || 'authenticated MẤT quyền grade_pe; '; end if;

  /* Quyền GHI thẳng vẫn phải đóng — 024 đóng, file này không được mở lại. */
  if exists (select 1 from information_schema.table_privileges
              where table_schema='public' and table_name='answers'
                and grantee in ('anon','authenticated')
                and privilege_type in ('INSERT','UPDATE','DELETE'))
     then loi := loi || 'answers lại ghi thẳng được; '; end if;

  if loi <> '' then raise exception 'chấm PE HỎNG: %', loi; end if;
  raise notice 'chấm PE OK: cột điểm, policy đọc cho prof, RPC khoá đúng vai';
end $$;
