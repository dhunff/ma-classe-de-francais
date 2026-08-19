-- Đồng bộ lại bảng submissions từ blob, và vá lỗi mất mốc thời gian của 005.
--
-- HAI VIỆC FILE NÀY LÀM:
--
-- 1. Chép nốt những bài nộp phát sinh SAU khi 005 chạy. Bảng được tạo và chép
--    dữ liệu từ lâu, nhưng ứng dụng vẫn ghi vào blob cho tới bản deploy
--    chuyển sang bảng — nên bảng đã trôi khỏi thực tế suốt quãng đó.
--
-- 2. Vá lỗi trong bước chép của 005. Câu lệnh ở đó là:
--
--      case when s ->> 'at' ~ '^\d{4}-' then (s ->> 'at')::timestamptz else null end
--
--    tức chỉ nhận mốc thời gian dạng chuỗi ISO. Nhưng ứng dụng ghi
--    `at: Date.now()` — một SỐ mili-giây. Số không khớp `^\d{4}-` nên cột `at`
--    thành null, mà cùng lúc payload lại bị `- 'at'` cắt trường đó đi. Kết quả:
--    mốc thời gian của những bài đã chép biến mất hoàn toàn.
--
--    Không khôi phục lại được từ bảng, nhưng blob vẫn còn nguyên — nên lấy lại
--    từ đó.
--
-- CHẠY ĐƯỢC NHIỀU LẦN, không hỏng gì. Chạy trong SQL Editor.

-- ───────────── Hàm đọc mốc thời gian, nhận cả hai kiểu ─────────────
create or replace function public.parse_submission_at(v text)
returns timestamptz
language plpgsql
immutable
as $$
begin
  if v is null or v = '' then
    return null;
  end if;
  -- số mili-giây kể từ epoch (thứ ứng dụng thật sự ghi)
  if v ~ '^\d{10,}$' then
    return to_timestamp(v::bigint / 1000.0);
  end if;
  -- chuỗi ISO
  return v::timestamptz;
exception when others then
  return null;
end;
$$;

-- ───────────── 1. Chép nốt bài nộp còn thiếu ─────────────
insert into public.submissions (id, exercise_id, student, user_id, graded, at, payload)
select
  coalesce(s ->> 'id', gen_random_uuid()::text),
  coalesce(s ->> 'exerciseId', ''),
  coalesce(s ->> 'student', ''),
  p.id,
  coalesce((s ->> 'graded')::boolean, false),
  public.parse_submission_at(s ->> 'at'),
  s - 'id' - 'exerciseId' - 'student' - 'graded' - 'at'
from public.kv_store k
cross join lateral jsonb_array_elements(k.value::jsonb) as s
left join public.profiles p on lower(p.name) = lower(s ->> 'student')
where k.key = 's:mcf-submissions'
  and jsonb_typeof(k.value::jsonb) = 'array'
on conflict (id) do nothing;

-- ───────────── 2. Vá mốc thời gian đã mất ─────────────
-- Chỉ đụng những dòng đang null; không ghi đè mốc đã đúng.
update public.submissions t
set at = public.parse_submission_at(s ->> 'at')
from public.kv_store k
cross join lateral jsonb_array_elements(k.value::jsonb) as s
where k.key = 's:mcf-submissions'
  and jsonb_typeof(k.value::jsonb) = 'array'
  and s ->> 'id' = t.id
  and t.at is null
  and public.parse_submission_at(s ->> 'at') is not null;

-- ───────────── 3. Gắn lại user_id cho dòng chưa khớp ─────────────
-- Học sinh đăng ký sau lúc 005 chạy thì hồ sơ mới có; khớp lại theo tên.
update public.submissions t
set user_id = p.id
from public.profiles p
where t.user_id is null
  and lower(p.name) = lower(t.student);

-- ──────────────────────── Kiểm tra sau khi chạy ────────────────────────
--
-- a) Số bài trong bảng phải >= số bài trong blob:
--
--      select
--        (select count(*) from public.submissions) as trong_bang,
--        (select count(*) from public.kv_store k,
--           lateral jsonb_array_elements(k.value::jsonb)
--         where k.key = 's:mcf-submissions') as trong_blob;
--
--    Lớn hơn là bình thường — bài nộp mới đi thẳng vào bảng, không vào blob.
--
-- b) Không còn dòng nào mất mốc thời gian:
--
--      select count(*) from public.submissions where at is null;
--
-- c) Còn bao nhiêu dòng chưa gắn được tài khoản:
--
--      select count(*) from public.submissions where user_id is null;
--
--    Những dòng này giáo viên vẫn đọc được, nhưng học sinh sẽ không thấy bài
--    cũ của mình cho tới khi khớp được tên. Nếu số này lớn, kiểm lại
--    profiles.name có trùng với tên dùng lúc nộp bài không.
--
-- CHƯA XOÁ s:mcf-submissions. Giữ làm bản sao lưu tới khi chạy ổn một thời
-- gian, và tới khi shared/submissions.js bỏ nhánh đọc blob.
