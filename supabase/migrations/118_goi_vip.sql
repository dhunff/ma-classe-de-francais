-- GÓI VIP 1 THÁNG (06/10) — 99 000 đ, mở mọi bài trả phí trong 30 ngày.
--
-- Đi đúng đường thanh toán đang chạy (SePay webhook, migration 0xx): học sinh
-- chuyển khoản với nội dung `LMS <tên> VIP1TH`. Webhook nhận ra mã VIP1TH thay
-- vì 6 ký tự cuối id bài, kiểm số tiền ≥ 99 000 đ, rồi gọi `gia_han_vip`.
--
--   profiles.vip_den   hạn VIP. Học sinh KHÔNG ghi được profiles (chỉ giáo viên
--                      + RPC không đụng cột này), nên không tự gia hạn được.
--   vip_giao_dich      mỗi giao dịch một dòng, `ref` UNIQUE: SePay gửi lại cùng
--                      giao dịch thì không cộng ngày lần hai.
--
-- Gia hạn NỐI TIẾP: còn hạn thì cộng 30 ngày vào hạn cũ, hết hạn thì tính từ
-- lúc nhận tiền — trả tiền sớm không bao giờ mất ngày.
--
-- Quyền mở bài: can_open_exercise thêm điều kiện « VIP còn hạn ». Hết hạn thì
-- tự khoá lại, không cần ai bấm gì.

alter table public.profiles add column if not exists vip_den timestamptz;

create table if not exists public.vip_giao_dich (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  ref        text not null unique,
  so_tien    int not null,
  so_ngay    int not null,
  vip_den    timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.vip_giao_dich enable row level security;
drop policy if exists vip_giao_dich_doc on public.vip_giao_dich;
create policy vip_giao_dich_doc on public.vip_giao_dich for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke all on public.vip_giao_dich from anon;
revoke insert, update, delete, truncate on public.vip_giao_dich from authenticated;

-- Chỉ service_role (webhook) gọi. Trả hạn mới; giao dịch trùng ref → trả hạn
-- hiện tại kèm cờ trung = true, KHÔNG cộng thêm.
create or replace function public.gia_han_vip(p_user uuid, p_ref text, p_so_tien int, p_so_ngay int default 30)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_cu timestamptz; v_moi timestamptz;
begin
  select vip_den into v_cu from public.profiles where id = p_user for update;
  if not found then return jsonb_build_object('ok', false, 'loi', 'khong_co_ho_so'); end if;
  if exists (select 1 from public.vip_giao_dich where ref = p_ref) then
    return jsonb_build_object('ok', true, 'trung', true, 'vip_den', v_cu);
  end if;
  v_moi := greatest(coalesce(v_cu, now()), now()) + make_interval(days => p_so_ngay);
  update public.profiles set vip_den = v_moi where id = p_user;
  insert into public.vip_giao_dich (user_id, ref, so_tien, so_ngay, vip_den) values (p_user, p_ref, p_so_tien, p_so_ngay, v_moi);
  return jsonb_build_object('ok', true, 'vip_den', v_moi);
end $$;
revoke all on function public.gia_han_vip(uuid, text, int, int) from public, anon, authenticated;

-- Quyền đọc câu hỏi bài trả phí: giữ nguyên 019, thêm nhánh VIP còn hạn.
create or replace function public.can_open_exercise(ex_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select
    not exists (select 1 from public.exercises e where e.id = ex_id and (e.meta ->> 'isPremium')::boolean is true)
    or public.is_teacher()
    or exists (select 1 from public.profiles p where p.id = (select auth.uid())
                and (p.has_premium_access or p.vip_den > now()))
    or exists (select 1 from public.exercise_access a join public.profiles p on p.name = a.student
                where a.exercise_id = ex_id and p.id = (select auth.uid()));
$$;
