-- 151 · Sổ từ mới trong phần luyện tập (20/10, theo chủ dự án).
--
-- Học sinh ghi lại từ chưa biết ngay lúc làm bài, và xem lại được sau khi nộp
-- (cũng như ở mọi bài khác). Mỗi dòng là của MỘT người: RLS chỉ cho chủ dòng
-- đọc, ghi, xoá. Không dùng kv_store vì khoá ở đó không gắn với người dùng.

create table if not exists public.so_tu (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exercise_id text,
  ten_bai     text check (char_length(ten_bai) <= 200),
  tu          text not null check (char_length(btrim(tu)) between 1 and 120),
  nghia       text check (char_length(nghia) <= 300),
  ghi_chu     text check (char_length(ghi_chu) <= 300),
  tao_luc     timestamptz not null default now()
);

create index if not exists so_tu_user_idx on public.so_tu (user_id, tao_luc desc);

alter table public.so_tu enable row level security;

drop policy if exists so_tu_cua_toi on public.so_tu;
create policy so_tu_cua_toi on public.so_tu
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.so_tu to authenticated;
