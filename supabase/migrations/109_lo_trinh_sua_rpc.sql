-- 108 đặt tên cột trả về trùng tên cột bảng (ma_man, sao, lan_choi) → PL/pgSQL
-- báo 42702 "ambiguous" ở ON CONFLICT. Đổi tên cột trả về.
drop function if exists public.ghi_ket_qua_man(text, int);

create function public.ghi_ket_qua_man(p_ma_man text, p_sao int)
returns table (r_ma_man text, r_sao smallint, r_lan_choi int)
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_sao is null or p_sao < 0 or p_sao > 3 then raise exception 'SAO_KHONG_HOP_LE'; end if;
  return query
  insert into public.lo_trinh_ket_qua as k (user_id, ma_man, sao)
  values (v_uid, p_ma_man, p_sao)
  on conflict on constraint lo_trinh_ket_qua_pkey do update
    set sao = greatest(k.sao, excluded.sao), lan_choi = k.lan_choi + 1, cap_nhat = now()
  returning k.ma_man, k.sao, k.lan_choi;
end $$;

revoke all on function public.ghi_ket_qua_man(text, int) from public, anon;
grant execute on function public.ghi_ket_qua_man(text, int) to authenticated;
