-- 146 · Trần 100 lượt AI mỗi ngày (giờ VN) cho tài khoản VIP (15/10, chủ dự án; đề
-- xuất từ rà bảo mật: VIP không giới hạn thì một tài khoản bị lộ đốt được chi phí).
-- Tài khoản thường giữ hạn mức riêng của từng hàm như cũ; trần này CỘNG CHUNG mọi
-- hàm AI (cham-pe, cham-po, nhan-xet-noi, cham-phat-am, hoi-leon, viet-mau).
-- Chỉ Edge Function (service_role) ghi/đọc; học sinh không có quyền gì trên bảng.
create table if not exists public.ai_luot (
  id      bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  ham     text not null,
  ngay    date not null default ((now() at time zone 'Asia/Ho_Chi_Minh')::date),
  luc     timestamptz not null default now()
);
create index if not exists ai_luot_nguoi_ngay on public.ai_luot (user_id, ngay);
alter table public.ai_luot enable row level security;
revoke all on public.ai_luot from anon, authenticated;

-- Dùng một lượt: khoá theo người để hai yêu cầu song song không cùng lọt ở lượt 100.
-- Trả số lượt CÒN LẠI sau khi dùng, hoặc -1 khi đã chạm trần (không ghi thêm).
create or replace function public.ai_dung_luot(p_user uuid, p_ham text, p_tran int default 100)
returns int language plpgsql security definer set search_path = public as $$
declare da int; hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
  perform pg_advisory_xact_lock(hashtext('ai_luot:' || p_user::text));
  select count(*) into da from public.ai_luot where user_id = p_user and ngay = hom_nay;
  if da >= p_tran then return -1; end if;
  insert into public.ai_luot (user_id, ham) values (p_user, left(p_ham, 40));
  return p_tran - da - 1;
end $$;
revoke all on function public.ai_dung_luot(uuid, text, int) from public, anon, authenticated;
