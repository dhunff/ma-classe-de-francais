-- 155 · Lộ trình có CHƯƠNG (23/10, theo chủ dự án).
-- Mỗi chủ đề: chương 1 (màn cũ, A2 → B2) và chương 2 (10 màn B2 khó hơn, dữ liệu
-- sinh bởi scripts/lo-trinh/sinh-chuong2.mjs). Thử thách cuối chương 1 giữ khoá
-- cũ 'trum:<chủ đề>' (kết quả cũ không mất); chương 2 là 'trum:<chủ đề>:2'.

alter table public.lo_trinh_man add column if not exists chuong smallint not null default 1 check (chuong between 1 and 9);

create or replace function public.ghi_ket_qua_man(p_ma_man text, p_sao integer)
returns table(r_ma_man text, r_sao smallint, r_lan_choi integer, r_xp integer)
language plpgsql security definer set search_path to 'public' as $function$
declare
  v_uid uuid := auth.uid();
  v_sao_cu smallint;
  v_xp int := 0;
  v_hop_le boolean;
  v_cd text; v_ch int;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_sao is null or p_sao < 0 or p_sao > 3 then raise exception 'SAO_KHONG_HOP_LE'; end if;
  if p_ma_man like 'man:%' then
    select exists (select 1 from public.lo_trinh_man m where m.id = substr(p_ma_man, 5) and m.bat) into v_hop_le;
  elsif p_ma_man like 'trum:%' then
    v_cd := split_part(substr(p_ma_man, 6), ':', 1);
    v_ch := coalesce(nullif(split_part(substr(p_ma_man, 6), ':', 2), '')::int, 1);
    select exists (select 1 from public.lo_trinh_man m where m.chu_de_id = v_cd and m.chuong = v_ch and m.bat) into v_hop_le;
  else
    v_hop_le := false;
  end if;
  if not v_hop_le then raise exception 'MAN_KHONG_TON_TAI'; end if;

  select k.sao into v_sao_cu from public.lo_trinh_ket_qua k where k.user_id = v_uid and k.ma_man = p_ma_man for update;
  insert into public.lo_trinh_ket_qua as k (user_id, ma_man, sao) values (v_uid, p_ma_man, p_sao)
  on conflict on constraint lo_trinh_ket_qua_pkey do update
    set sao = greatest(k.sao, excluded.sao), lan_choi = k.lan_choi + 1, cap_nhat = now();

  if p_sao > 0 and coalesce(v_sao_cu, 0) = 0
     and not exists (select 1 from public.xp_so_cai x where x.user_id = v_uid and x.ly_do = 'qua_man_lo_trinh' and x.ref = p_ma_man) then
    v_xp := public.cong_xp(v_uid, case when p_ma_man like 'trum:%' then 15 else 5 end, 'qua_man_lo_trinh', p_ma_man);
  end if;

  return query select k.ma_man, k.sao, k.lan_choi, v_xp from public.lo_trinh_ket_qua k where k.user_id = v_uid and k.ma_man = p_ma_man;
end $function$;
