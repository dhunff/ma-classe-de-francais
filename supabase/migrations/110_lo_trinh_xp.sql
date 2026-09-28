-- XP KHI QUA MÀN LỘ TRÌNH (29/09).
--
-- Kết quả màn do client báo lên, nên XP ở đây được CHẶN TRẦN thay vì tin số:
--   · chỉ LẦN ĐẦU một màn đạt ≥1 sao mới được cộng (chơi lại không ra thêm);
--   · mức cố định: 5 XP một màn thường, 15 XP một thử thách cuối chương;
--   · màn phải có thật: bộ công khai ≥4 thẻ, hoặc chương có ít nhất một bộ như vậy.
-- Tổng XP cày được từ lộ trình vì thế bị chặn bởi số màn có thật (12 bộ + 4
-- chương ≈ 120 XP), không phụ thuộc vào việc ai gọi RPC bao nhiêu lần.

alter table public.xp_so_cai drop constraint if exists xp_so_cai_ly_do_check;
alter table public.xp_so_cai add constraint xp_so_cai_ly_do_check
  check (ly_do in ('hoan_thanh_bai', 'doi_bai', 'qua_man_lo_trinh'));

drop function if exists public.ghi_ket_qua_man(text, int);

create function public.ghi_ket_qua_man(p_ma_man text, p_sao int)
returns table (r_ma_man text, r_sao smallint, r_lan_choi int, r_xp int)
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_sao_cu smallint;
  v_xp int := 0;
  v_hop_le boolean;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_sao is null or p_sao < 0 or p_sao > 3 then raise exception 'SAO_KHONG_HOP_LE'; end if;

  -- Màn phải có thật — nếu không, tên màn bịa sẽ là một nguồn XP vô hạn.
  if p_ma_man like 'bo:%' then
    select exists (select 1 from public.the_bo b
                    where b.id::text = substr(p_ma_man, 4) and b.cong_khai
                      and (select count(*) from public.the_bo_the t where t.bo_id = b.id) >= 4)
      into v_hop_le;
  else
    select exists (select 1 from public.the_bo b
                    where b.ky_nang = substr(p_ma_man, 6) and b.cong_khai
                      and (select count(*) from public.the_bo_the t where t.bo_id = b.id) >= 4)
      into v_hop_le;
  end if;
  if not v_hop_le then raise exception 'MAN_KHONG_TON_TAI'; end if;

  select k.sao into v_sao_cu from public.lo_trinh_ket_qua k
   where k.user_id = v_uid and k.ma_man = p_ma_man for update;

  insert into public.lo_trinh_ket_qua as k (user_id, ma_man, sao)
  values (v_uid, p_ma_man, p_sao)
  on conflict on constraint lo_trinh_ket_qua_pkey do update
    set sao = greatest(k.sao, excluded.sao), lan_choi = k.lan_choi + 1, cap_nhat = now();

  if p_sao > 0 and coalesce(v_sao_cu, 0) = 0
     and not exists (select 1 from public.xp_so_cai x
                      where x.user_id = v_uid and x.ly_do = 'qua_man_lo_trinh' and x.ref = p_ma_man) then
    v_xp := case when p_ma_man like 'trum:%' then 15 else 5 end;
    update public.profiles set xp_balance = xp_balance + v_xp where id = v_uid;
    if found then
      insert into public.xp_so_cai (user_id, delta, ly_do, ref)
      values (v_uid, v_xp, 'qua_man_lo_trinh', p_ma_man);
    else
      v_xp := 0;
    end if;
  end if;

  return query
  select k.ma_man, k.sao, k.lan_choi, v_xp from public.lo_trinh_ket_qua k
   where k.user_id = v_uid and k.ma_man = p_ma_man;
end $$;

revoke all on function public.ghi_ket_qua_man(text, int) from public, anon;
grant execute on function public.ghi_ket_qua_man(text, int) to authenticated;
