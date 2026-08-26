-- 034 — ghi lại công thức ký mà SePay dùng
--
-- ══ VÌ SAO KHÔNG GHIM CỨNG ══
--
-- Hàm đang thử bốn cách ký (body trần, và timestamp ghép ba kiểu) rồi nhận cái
-- nào khớp. Đúng cho giai đoạn dò, nhưng để mãi thì có hai cái giá:
--
--   · Mỗi request tốn bốn phép băm thay vì một (nhỏ, nhưng vô ích).
--   · Nếu SePay ĐỔI cách ký, ta không nhận ra — nó vẫn khớp một cách nào đó,
--     và ta mất khả năng biết mình đang xác minh cái gì.
--
-- Cách đúng là ghim đúng một công thức. Nhưng ghim thì phải BIẾT nó là cách
-- nào, và hiện chưa ai đọc được trường `auth` của giao dịch đã thành công.
-- Ghim bừa là đánh cược cả luồng thanh toán đang chạy tốt.
--
-- Nên: cho hàm tự ghi lại. Giao dịch thật kế tiếp sẽ điền vào đây, và từ đó
-- ghim được bằng dữ liệu thay vì bằng phỏng đoán.
--
-- Bảng riêng chứ không nhét vào kv_store: đây là quan sát vận hành, không phải
-- dữ liệu ứng dụng, và trộn hai thứ vào một chỗ là cách kv_store phình ra thành
-- cái sọt như hiện nay.

create table if not exists public.webhook_diag (
  ten        text primary key,
  gia_tri    text not null,
  lan_dau    timestamptz not null default now(),
  lan_cuoi   timestamptz not null default now(),
  so_lan     int not null default 1
);

comment on table public.webhook_diag is
  'Quan sát vận hành webhook. Chỉ service_role ghi; không phải dữ liệu ứng dụng.';

alter table public.webhook_diag enable row level security;

drop policy if exists webhook_diag_read on public.webhook_diag;

/* Đọc mở cho giáo viên — họ là người cần biết webhook đang xác minh kiểu gì.
   KHÔNG mở cho học sinh: không liên quan tới họ, và càng ít bề mặt càng tốt. */
create policy webhook_diag_read on public.webhook_diag
  for select to authenticated using (public.is_teacher());

/* Không có policy ghi. Thiếu policy nghĩa là bị từ chối — service_role bỏ qua
   RLS nên webhook vẫn ghi được, còn trình duyệt thì không. */

do $$
begin
  if exists (select 1 from pg_policy where polrelid='public.webhook_diag'::regclass
              and polcmd in ('a','w','d')) then
    raise exception 'webhook_diag không được có policy ghi';
  end if;
  raise notice 'webhook_diag sẵn sàng, chỉ service_role ghi được';
end $$;
