-- 157 · Sổ từ thành thẻ ôn SM-2 (23/10, theo chủ dự án).
-- Từ học sinh tự ghi (loai = 'tu') có lịch ôn riêng, cùng thuật toán với Flashcard
-- (shared/sm2.js tính ở client, như cards/reviews). Học sinh sửa được lịch của CHÍNH
-- MÌNH qua policy so_tu_cua_toi (151): không ai có động cơ, người chịu là họ. CHECK
-- chặn giá trị vô lý, giống reviews (063).
alter table public.so_tu
  add column if not exists due_at date not null default current_date,
  add column if not exists interval_days int not null default 1 check (interval_days between 1 and 365),
  add column if not exists ease real not null default 2.5 check (ease between 1.3 and 3.0),
  add column if not exists reps int not null default 0 check (reps >= 0),
  add column if not exists lapses int not null default 0 check (lapses >= 0);
