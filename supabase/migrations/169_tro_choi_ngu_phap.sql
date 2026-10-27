-- 169 · Thêm ba trò chơi ngữ pháp (27/10): xep_cau, san_loi, dung_sai. Chỉ nới danh sách mã.
alter table public.tro_choi_luot drop constraint if exists tro_choi_luot_tro_choi_check;
alter table public.tro_choi_luot add constraint tro_choi_luot_tro_choi_check check (tro_choi in ('gioi_tinh', 'nghe_chon', 'mua_chu', 'xep_cau', 'san_loi', 'dung_sai'));

create or replace function public.ghi_tro_choi(p_tro_choi text, p_diem int, p_dung int, p_tong int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_ngay timestamptz := date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh';
  v_ky_luc int; v_luot_xp int; v_xp int := 0; v_id bigint;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_tro_choi not in ('gioi_tinh', 'nghe_chon', 'mua_chu', 'xep_cau', 'san_loi', 'dung_sai')
     or p_tong is null or p_tong not between 1 and 500
     or p_dung is null or p_dung not between 0 and p_tong
     or p_diem is null or p_diem not between 0 and 100000 then
    raise exception 'SAI_DU_LIEU' using errcode = '22023';
  end if;
  select max(diem) into v_ky_luc from public.tro_choi_luot where user_id = v_uid and tro_choi = p_tro_choi;
  select count(*) into v_luot_xp from public.tro_choi_luot where user_id = v_uid and tao_luc >= v_ngay and xp > 0;
  if v_luot_xp < 6 and p_dung > 0 then
    v_xp := public.cong_xp(v_uid, least(5, 1 + p_dung / 4), 'tro_choi', p_tro_choi);
  end if;
  insert into public.tro_choi_luot (user_id, tro_choi, diem, dung, tong, xp)
  values (v_uid, p_tro_choi, p_diem, p_dung, p_tong, v_xp) returning id into v_id;
  perform public._ghi_ngay_hoc(v_uid);
  return jsonb_build_object('ok', true, 'id', v_id, 'xp', v_xp,
    'ky_luc_cu', coalesce(v_ky_luc, 0), 'ky_luc_moi', p_diem > coalesce(v_ky_luc, 0));
end $$;
revoke all on function public.ghi_tro_choi(text, int, int, int) from public, anon;
grant execute on function public.ghi_tro_choi(text, int, int, int) to authenticated;
