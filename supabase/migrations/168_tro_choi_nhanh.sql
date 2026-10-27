-- 168 · Ba trò chơi nhanh (27/10): Giống đực/cái (gioi_tinh), Nghe và chọn (nghe_chon),
-- Mưa chữ (mua_chu). Câu hỏi dựng ở client từ dữ liệu có sẵn (lo_trinh_tu, cau_luyen);
-- máy chủ chỉ ghi lượt + kỷ lục + XP.
--
-- Điểm do client gửi nên KHÔNG tin tuyệt đối: chặn khoảng giá trị, và XP có hai trần
-- (tối đa 5 XP/lượt, chỉ 6 lượt đầu mỗi ngày giờ VN được XP) cộng trần ngày/tuần
-- chung của cong_xp. Gian lận tối đa được 30 XP/ngày, bằng nửa trần ngày.
-- Mỗi lượt chơi tính là một ngày học cho chuỗi (_ghi_ngay_hoc, migration 153).

create table if not exists public.tro_choi_luot (
  id       bigint generated always as identity primary key,
  user_id  uuid not null references public.profiles(id) on delete cascade,
  tro_choi text not null check (tro_choi in ('gioi_tinh', 'nghe_chon', 'mua_chu')),
  diem     int  not null check (diem between 0 and 100000),
  dung     int  not null check (dung between 0 and 500),
  tong     int  not null check (tong between 1 and 500 and dung <= tong),
  xp       int  not null default 0,
  tao_luc  timestamptz not null default now()
);
create index if not exists tro_choi_luot_user on public.tro_choi_luot (user_id, tro_choi, diem desc);
alter table public.tro_choi_luot enable row level security;
create policy tro_choi_luot_doc on public.tro_choi_luot for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.tro_choi_luot from anon;
revoke insert, update, delete on public.tro_choi_luot from authenticated;
grant select on public.tro_choi_luot to authenticated;

alter table public.xp_so_cai drop constraint if exists xp_so_cai_ly_do_check;
alter table public.xp_so_cai add constraint xp_so_cai_ly_do_check
  check (ly_do = any (array['hoan_thanh_bai', 'doi_bai', 'qua_man_lo_trinh', 'diem_danh', 'moc_chuoi', 'tro_choi']));

create or replace function public.ghi_tro_choi(p_tro_choi text, p_diem int, p_dung int, p_tong int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_ngay timestamptz := date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh';
  v_ky_luc int; v_luot_xp int; v_xp int := 0; v_id bigint;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_tro_choi not in ('gioi_tinh', 'nghe_chon', 'mua_chu')
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
