-- 233 (17/11/2026, chủ dự án: « thanh toán VIP qua MoMo »). Bảng đơn MoMo.
--
-- Một dòng mỗi lần học sinh bấm « Thanh toán bằng MoMo ». Edge Function momo-don ghi dòng (giá do MÁY CHỦ
-- đặt), momo-ipn và momo-don (« kiem ») xác nhận bằng cách TỰ tra cứu đơn ở MoMo rồi gọi gia_han_vip với
-- ref = 'momo:<transId>' (vip_giao_dich.ref UNIQUE nên IPN gửi lại hay học sinh bấm kiểm nhiều lần không
-- cộng ngày hai lần).
--
-- Học sinh chỉ ĐỌC đơn của mình (để màn hình biết đơn đã xong), giáo viên đọc hết. KHÔNG ai ghi qua API:
-- đường ghi duy nhất là Edge Function giữ service_role.
create table if not exists public.momo_don (
  ma          text primary key,                       -- orderId gửi MoMo (FRM…)
  user_id     uuid not null references public.profiles(id) on delete cascade,
  goi         text not null,                          -- 'VIP1TH'
  so_tien     int  not null check (so_tien > 0),
  trang_thai  text not null default 'cho' check (trang_thai in ('cho', 'da_tra', 'that_bai')),
  ma_gd_momo  text,                                   -- transId của MoMo khi đã trả
  ket_qua     jsonb,                                  -- phản hồi tạo đơn / tra cứu gần nhất (chẩn đoán)
  ipn         jsonb,                                  -- IPN gần nhất + chữ ký có khớp không (chẩn đoán)
  tao_luc     timestamptz not null default now(),
  xong_luc    timestamptz
);
create index if not exists momo_don_user_idx on public.momo_don (user_id, tao_luc desc);
alter table public.momo_don enable row level security;
drop policy if exists momo_don_doc on public.momo_don;
create policy momo_don_doc on public.momo_don for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke all on public.momo_don from anon;
revoke insert, update, delete, truncate on public.momo_don from authenticated;
