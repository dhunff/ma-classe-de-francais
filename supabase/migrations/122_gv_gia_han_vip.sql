-- 122 (07/10): giáo viên tự gia hạn / thu hồi VIP (học sinh trả tiền mặt,
-- tặng, sửa sai sót). Đi qua đúng gia_han_vip (118) để mọi lần cộng ngày đều
-- có một dòng vip_giao_dich — so_tien = 0, ref bắt đầu bằng 'gv:'.
create or replace function public.gv_gia_han_vip(p_user uuid, p_so_ngay int)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.is_teacher() then return jsonb_build_object('ok', false, 'ma', 'CHI_GIAO_VIEN'); end if;
  if p_so_ngay not between 1 and 366 then return jsonb_build_object('ok', false, 'ma', 'SO_NGAY'); end if;
  return public.gia_han_vip(p_user, 'gv:' || gen_random_uuid()::text, 0, p_so_ngay);
end $$;

create or replace function public.gv_thu_hoi_vip(p_user uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.is_teacher() then return jsonb_build_object('ok', false, 'ma', 'CHI_GIAO_VIEN'); end if;
  update public.profiles set vip_den = null where id = p_user;
  return jsonb_build_object('ok', found);
end $$;

revoke all on function public.gv_gia_han_vip(uuid, int) from public, anon;
revoke all on function public.gv_thu_hoi_vip(uuid) from public, anon;
grant execute on function public.gv_gia_han_vip(uuid, int) to authenticated;
grant execute on function public.gv_thu_hoi_vip(uuid) to authenticated;
