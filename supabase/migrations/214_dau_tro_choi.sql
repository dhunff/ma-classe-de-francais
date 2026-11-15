-- 214 — PvP cho MỌI trò chơi nhanh (15/11, theo chủ dự án: « các trò đều có PVP hết »).
--
-- Kiểu đấu: thách đấu KHÔNG đồng thời, cùng đề. Người thách chơi trước với một hạt giống
-- ngẫu nhiên (`hat`); nộp điểm thì dòng đấu mới được tạo, nên không có trận bỏ dở nào nằm
-- treo ở phía bạn bè. Đối thủ mở trận, chơi lại ĐÚNG hạt giống đó (cùng thứ tự câu, cùng mức,
-- cùng cách chơi), nộp một lần. Điểm cao hơn thắng; bằng điểm thì đúng nhiều hơn thắng.
--
-- GIỚI HẠN ĐÃ BIẾT: điểm do trình duyệt báo (các trò chấm ở client), máy chủ chỉ chặn giá trị
-- vô lý như ghi_tro_choi. Muốn chống gian lận thật phải chấm ở máy chủ từng trò.
--
-- Thách đấu từ vựng cũ (thach_dau, 111/127) giữ nguyên: nó chấm ở máy chủ.

create table if not exists public.tro_choi_dau (
  id         uuid primary key default gen_random_uuid(),
  tro_choi   text not null,
  muc        text not null check (muc in ('de', 'vua', 'kho')),
  kieu       text,
  vu         text,                -- vụ án đã chơi (Thám tử, Phiên toà): đối thủ chơi đúng vụ đó
  hat        bigint not null check (hat between 1 and 2147483646),
  nguoi_moi  uuid not null references public.profiles(id) on delete cascade,
  doi_thu    uuid not null references public.profiles(id) on delete cascade,
  diem_moi   int not null, dung_moi int not null, tong_moi int not null,
  diem_doi   int, dung_doi int, tong_doi int,
  xong_doi   timestamptz,
  tao_luc    timestamptz not null default now()
);
create index if not exists tro_choi_dau_moi_idx on public.tro_choi_dau (nguoi_moi, tao_luc desc);
create index if not exists tro_choi_dau_doi_idx on public.tro_choi_dau (doi_thu, tao_luc desc);

alter table public.tro_choi_dau enable row level security;
-- Không policy nào: chỉ đọc/ghi qua ba RPC bên dưới.
revoke all on public.tro_choi_dau from anon, authenticated;

alter table public.notifications drop constraint if exists notifications_type_hop_le;
alter table public.notifications add constraint notifications_type_hop_le
  check (type in ('announcement', 'follow', 'tro_choi_dau'));

create or replace function public._kiem_luot_choi(p_tro_choi text, p_diem int, p_dung int, p_tong int)
returns void language plpgsql immutable as $$
begin
  if p_tro_choi not in ('gioi_tinh', 'nghe_chon', 'mua_chu', 'xep_cau', 'san_loi', 'dung_sai', 'chep_nhanh', 'noi_mo_khoa', 'tham_tu', 'do_vui', 'phieu_luu')
     or p_tong is null or p_tong not between 1 and 500
     or p_dung is null or p_dung not between 0 and p_tong
     or p_diem is null or p_diem not between 0 and 100000 then
    raise exception 'SAI_DU_LIEU' using errcode = '22023';
  end if;
end $$;

create or replace function public.tao_dau_tro_choi(p_doi uuid, p_tro_choi text, p_muc text, p_kieu text, p_vu text, p_hat bigint,
  p_diem int, p_dung int, p_tong int)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid(); v_id uuid; v_ten text;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_doi = v_uid then raise exception 'KHONG_TU_THACH_MINH'; end if;
  perform public._kiem_luot_choi(p_tro_choi, p_diem, p_dung, p_tong);
  if p_muc not in ('de', 'vua', 'kho') or p_hat is null or p_hat not between 1 and 2147483646
     or (p_kieu is not null and length(p_kieu) > 20) or (p_vu is not null and length(p_vu) > 60) then
    raise exception 'SAI_DU_LIEU' using errcode = '22023';
  end if;
  if not exists (select 1 from public.follows f where f.follower_id = v_uid and f.following_id = p_doi) then
    raise exception 'CHUA_THEO_DOI';
  end if;
  if (select count(*) from public.tro_choi_dau where nguoi_moi = v_uid and tao_luc > now() - interval '24 hours') >= 30 then
    raise exception 'DAILY_LIMIT_REACHED';
  end if;
  insert into public.tro_choi_dau (tro_choi, muc, kieu, vu, hat, nguoi_moi, doi_thu, diem_moi, dung_moi, tong_moi)
  values (p_tro_choi, p_muc, nullif(p_kieu, ''), nullif(p_vu, ''), p_hat, v_uid, p_doi, p_diem, p_dung, p_tong) returning id into v_id;
  select coalesce(nullif(btrim(p.display_name), ''), nullif(btrim(p.name), ''), 'Một bạn học')
    into v_ten from public.profiles p where p.id = v_uid;
  insert into public.notifications (user_id, actor_id, type, message)
  values (p_doi, v_uid, 'tro_choi_dau', coalesce(v_ten, 'Một bạn học') || ' thách bạn một ván trò chơi. Vào Trò chơi để nhận lời.');
  return v_id;
end $$;

create or replace function public.nop_dau_tro_choi(p_id uuid, p_diem int, p_dung int, p_tong int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid(); r public.tro_choi_dau;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  select * into r from public.tro_choi_dau where id = p_id for update;
  if r.id is null or r.doi_thu <> v_uid then raise exception 'KHONG_CO_QUYEN' using errcode = '42501'; end if;
  if r.xong_doi is not null then raise exception 'DA_NOP'; end if;
  perform public._kiem_luot_choi(r.tro_choi, p_diem, p_dung, p_tong);
  update public.tro_choi_dau set diem_doi = p_diem, dung_doi = p_dung, tong_doi = p_tong, xong_doi = now()
   where id = p_id;
  return jsonb_build_object('ok', true, 'diem_moi', r.diem_moi, 'dung_moi', r.dung_moi, 'tong_moi', r.tong_moi);
end $$;

-- Danh sách trận của mình (50 trận gần nhất). Điểm của người thách lộ cho đối thủ ngay
-- (đó là mục tiêu cần vượt); điểm của đối thủ chỉ có sau khi họ nộp.
create or replace function public.ds_dau_tro_choi()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(d order by (d->>'tao_luc') desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', t.id, 'tro_choi', t.tro_choi, 'muc', t.muc, 'kieu', t.kieu, 'vu', t.vu, 'hat', t.hat,
      'toi_moi', t.nguoi_moi = auth.uid(),
      'doi_phuong', jsonb_build_object('id', p.id, 'name', coalesce(nullif(p.display_name, ''), p.name),
                                       'username', p.username, 'avatar', p.avatar),
      'diem_moi', t.diem_moi, 'dung_moi', t.dung_moi, 'tong_moi', t.tong_moi,
      'diem_doi', t.diem_doi, 'dung_doi', t.dung_doi, 'tong_doi', t.tong_doi,
      'xong', t.xong_doi is not null, 'tao_luc', t.tao_luc) as d
    from public.tro_choi_dau t
    join public.profiles p on p.id = case when t.nguoi_moi = auth.uid() then t.doi_thu else t.nguoi_moi end
    where auth.uid() in (t.nguoi_moi, t.doi_thu)
    order by t.tao_luc desc limit 50
  ) s;
$$;

revoke all on function public._kiem_luot_choi(text, int, int, int) from public, anon, authenticated;
revoke all on function public.tao_dau_tro_choi(uuid, text, text, text, text, bigint, int, int, int) from public, anon;
revoke all on function public.nop_dau_tro_choi(uuid, int, int, int) from public, anon;
revoke all on function public.ds_dau_tro_choi() from public, anon;
grant execute on function public.tao_dau_tro_choi(uuid, text, text, text, text, bigint, int, int, int) to authenticated;
grant execute on function public.nop_dau_tro_choi(uuid, int, int, int) to authenticated;
grant execute on function public.ds_dau_tro_choi() to authenticated;
