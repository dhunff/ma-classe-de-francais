-- 130 · Mua bộ Flashcard trả phí bằng chuyển khoản (10/10).
--
-- Nội dung chuyển khoản: `LMS <tên 12 ký tự> BO<4 ký tự cuối id bộ>` (6 ký tự
-- cuối là mã bộ, cùng chỗ với mã bài lẻ và mã VIP1TH). Webhook SePay nhận ra
-- tiền tố BO, đối chiếu giá ở máy chủ, rồi gọi mua_bo_the() bằng service_role.
--
-- the_bo_quyen thêm so_tien + ref (mã giao dịch, duy nhất): SePay gửi lại cùng
-- giao dịch thì không ghi hai lần. Quyền do giáo viên cấp tay có ref = NULL.

alter table public.the_bo_quyen add column if not exists so_tien int;
alter table public.the_bo_quyen add column if not exists ref text;
create unique index if not exists the_bo_quyen_ref_uq on public.the_bo_quyen (ref) where ref is not null;

create or replace function public.mua_bo_the(p_bo uuid, p_user uuid, p_ref text, p_so_tien int)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare b public.the_bo;
begin
  select * into b from public.the_bo where id = p_bo;
  if b.id is null or not b.tra_phi or not b.cong_khai then
    return jsonb_build_object('ok', false, 'ly_do', 'BO_KHONG_BAN');
  end if;
  if p_so_tien < b.gia then
    return jsonb_build_object('ok', false, 'ly_do', 'THIEU_TIEN', 'gia', b.gia);
  end if;
  if exists (select 1 from public.the_bo_quyen where ref = p_ref) then
    return jsonb_build_object('ok', true, 'trung', true);
  end if;
  insert into public.the_bo_quyen (bo_id, user_id, so_tien, ref)
  values (p_bo, p_user, p_so_tien, p_ref)
  on conflict (bo_id, user_id) do update set so_tien = excluded.so_tien, ref = coalesce(the_bo_quyen.ref, excluded.ref);
  return jsonb_build_object('ok', true, 'bo', b.ten);
end $$;
-- Chỉ webhook (service_role) gọi được.
revoke all on function public.mua_bo_the(uuid, uuid, text, int) from public, anon, authenticated;
