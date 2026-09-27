-- AI NHẬN XÉT BÀI NÓI (27/09) — Edge Function nhan-xet-noi ghi vào đây.
--
-- KHÔNG có điểm số (quy tắc của PO: DELF chấm nói bằng đối thoại với giám
-- khảo). Chỉ có bản chép lời + nhận xét tiếng Việt.
--
-- Không policy ghi: đường ghi duy nhất là Edge Function giữ service_role —
-- cùng lý do với pe_ai_goi_y (083): cho học sinh ghi thẳng thì họ tự chèn một
-- "nhận xét của AI" bất kỳ. Học sinh đọc được dòng của CHÍNH MÌNH; giáo viên
-- đọc hết. Một bản ghi âm đã có nhận xét thì hàm trả lại nhận xét cũ, không gọi
-- AI lần nữa (không tốn tiền, không tốn lượt).

create table if not exists public.po_ai_nhan_xet (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  duong_dan  text not null,
  model      text not null,
  chep_loi   text,
  ket_qua    jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, duong_dan)
);
create index if not exists po_ai_nhan_xet_user_idx on public.po_ai_nhan_xet (user_id, created_at desc);

alter table public.po_ai_nhan_xet enable row level security;
drop policy if exists po_ai_nhan_xet_doc on public.po_ai_nhan_xet;
create policy po_ai_nhan_xet_doc on public.po_ai_nhan_xet for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke all on public.po_ai_nhan_xet from anon;
revoke insert, update, delete, truncate on public.po_ai_nhan_xet from authenticated;
