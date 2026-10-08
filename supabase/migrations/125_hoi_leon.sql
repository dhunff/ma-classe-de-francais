-- 125 · Hỏi Leon (09/10): trợ lý chat của linh vật Leon.
--
-- Mỗi câu hỏi + câu trả lời là một dòng. Bảng vừa là lịch sử chat (học sinh
-- mở lại thấy cuộc trò chuyện) vừa là sổ đếm hạn mức theo ngày giờ Việt Nam.
-- KHÔNG có policy ghi: đường ghi duy nhất là Edge Function `hoi-leon` giữ
-- service_role, nên không ai tự chèn lượt hay sửa lời Leon.
create table if not exists public.leon_hoi (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  cau_hoi text not null check (char_length(cau_hoi) <= 1200),
  tra_loi text not null,
  cam text,
  model text,
  token_vao int,
  token_ra int,
  created_at timestamptz not null default now()
);
create index if not exists leon_hoi_user_tg on public.leon_hoi (user_id, created_at desc);
alter table public.leon_hoi enable row level security;
drop policy if exists leon_hoi_doc_cua_minh on public.leon_hoi;
create policy leon_hoi_doc_cua_minh on public.leon_hoi
  for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.leon_hoi from anon;
revoke insert, update, delete on public.leon_hoi from authenticated;
grant select on public.leon_hoi to authenticated;
