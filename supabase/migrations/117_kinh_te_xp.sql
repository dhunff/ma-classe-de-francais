-- KINH TẾ XP (06/10) — trần ngày/tuần, điểm danh, mốc chuỗi, giá đổi theo giá tiền.
--
-- MỤC TIÊU (chủ dự án): XP giữ người học quay lại mỗi ngày; TIỀN là đường thu
-- chính. Nên XP được thiết kế để người học CHĂM mở được khoảng MỘT bài trả phí
-- mỗi tuần — ai muốn nhiều hơn / nhanh hơn thì mua.
--
--   Nguồn                          XP      Trần
--   nộp bài lần đầu               10+điểm  có
--   qua màn lộ trình / thử thách   5 / 15  có
--   điểm danh (bài đầu trong ngày)   5     có
--   mốc chuỗi 7 / 30 / 100 ngày   30/100/300  KHÔNG (hiếm, là phần thưởng gắn bó)
--
--   Trần: 60 XP/ngày, 300 XP/tuần (giờ Việt Nam, tuần bắt đầu thứ Hai).
--   Giá đổi mặc định: giá tiền ÷ 100, làm tròn chục, kẹp 100–600 XP
--     (20 000 đ → 200 XP ≈ 4–7 ngày học đều). Giáo viên đặt xpCost riêng thì
--     dùng số đó.
--
-- MỌI lần cộng đi qua MỘT hàm `cong_xp` — trigger nộp bài, lộ trình, điểm danh
-- — để trần không bị lách bằng một đường cộng thứ hai. Phần bị chặn vì vượt
-- trần ghi vào `bi_cat` (sổ cái vẫn có dòng, delta có thể là 0): « lần đầu »
-- đã dùng thì không đòi lại được bằng cách chờ sang ngày.

alter table public.xp_so_cai add column if not exists bi_cat int not null default 0;
alter table public.xp_so_cai drop constraint if exists xp_so_cai_ly_do_check;
alter table public.xp_so_cai add constraint xp_so_cai_ly_do_check
  check (ly_do in ('hoan_thanh_bai', 'doi_bai', 'qua_man_lo_trinh', 'diem_danh', 'moc_chuoi'));

create or replace function public.xp_tran() returns jsonb language sql immutable as
$$ select jsonb_build_object('ngay', 60, 'tuan', 300) $$;

-- XP ĐÃ NHẬN (tính vào trần) kể từ một mốc. Không tính mốc chuỗi.
create or replace function public._xp_da_nhan(p_uid uuid, p_tu timestamptz)
returns int language sql stable security definer set search_path = public as $$
  select coalesce(sum(delta), 0)::int from public.xp_so_cai
   where user_id = p_uid and delta > 0 and created_at >= p_tu
     and ly_do in ('hoan_thanh_bai', 'qua_man_lo_trinh', 'diem_danh')
$$;

create or replace function public.cong_xp(p_uid uuid, p_muon int, p_ly_do text, p_ref text, p_mien_tran boolean default false)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_ngay timestamptz := date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh';
  v_tuan timestamptz := date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh';
  v_cho int;
begin
  if p_uid is null or coalesce(p_muon, 0) <= 0 then return 0; end if;
  -- Khoá dòng hồ sơ: hai lần cộng cùng lúc không cùng đọc một "đã nhận" cũ.
  perform 1 from public.profiles where id = p_uid for update;
  if not found then return 0; end if;
  if p_mien_tran then
    v_cho := p_muon;
  else
    v_cho := greatest(0, least(p_muon,
      (public.xp_tran()->>'ngay')::int - public._xp_da_nhan(p_uid, v_ngay),
      (public.xp_tran()->>'tuan')::int - public._xp_da_nhan(p_uid, v_tuan)));
  end if;
  if v_cho > 0 then update public.profiles set xp_balance = xp_balance + v_cho where id = p_uid; end if;
  insert into public.xp_so_cai (user_id, delta, ly_do, ref, bi_cat) values (p_uid, v_cho, p_ly_do, p_ref, p_muon - v_cho);
  return v_cho;
end $$;
revoke all on function public.cong_xp(uuid, int, text, text, boolean) from public, anon, authenticated;
revoke all on function public._xp_da_nhan(uuid, timestamptz) from public, anon, authenticated;

-- Số ngày học liên tiếp tính tới hôm nay (giờ VN), theo lượt nộp bài.
create or replace function public._chuoi_ngay(p_uid uuid)
returns int language plpgsql stable security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Ho_Chi_Minh')::date; n int := 0;
begin
  loop
    exit when not exists (select 1 from public.attempts a where a.user_id = p_uid and a.finished_at is not null
                            and (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date = d);
    n := n + 1; d := d - 1;
    exit when n > 400;
  end loop;
  return n;
end $$;
revoke all on function public._chuoi_ngay(uuid) from public, anon, authenticated;

-- ── Trigger nộp bài: giữ luật 101 (lần nộp ĐẦU mỗi bài: 10 + điểm), nay qua cong_xp,
--    cộng thêm điểm danh + mốc chuỗi. ──
create or replace function public.cong_xp_khi_nop()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_chuoi int;
  v_moc int;
begin
  if new.finished_at is null or new.user_id is null then return new; end if;
  if tg_op = 'UPDATE' and old.finished_at is not null then return new; end if;

  -- Điểm danh: một lần mỗi ngày, cho lượt nộp đầu tiên của ngày.
  if not exists (select 1 from public.xp_so_cai x where x.user_id = new.user_id and x.ly_do = 'diem_danh'
                  and x.ref = v_hom_nay::text) then
    perform public.cong_xp(new.user_id, 5, 'diem_danh', v_hom_nay::text);
    v_chuoi := public._chuoi_ngay(new.user_id);
    v_moc := case v_chuoi when 7 then 30 when 30 then 100 when 100 then 300 else 0 end;
    if v_moc > 0 and not exists (select 1 from public.xp_so_cai x where x.user_id = new.user_id
                                   and x.ly_do = 'moc_chuoi' and x.ref = 'chuoi:' || v_chuoi || ':' || v_hom_nay) then
      perform public.cong_xp(new.user_id, v_moc, 'moc_chuoi', 'chuoi:' || v_chuoi || ':' || v_hom_nay, true);
    end if;
  end if;

  if new.exercise_id is not null and not exists (
       select 1 from public.attempts a where a.user_id = new.user_id and a.exercise_id = new.exercise_id
          and a.finished_at is not null and a.id <> new.id) then
    perform public.cong_xp(new.user_id, 10 + greatest(coalesce(new.score, 0), 0), 'hoan_thanh_bai', new.exercise_id);
  end if;
  return new;
end $$;

-- ── Lộ trình: giữ luật 115, phần cộng đi qua cong_xp. ──
create or replace function public.ghi_ket_qua_man(p_ma_man text, p_sao int)
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
  if p_ma_man like 'man:%' then
    select exists (select 1 from public.lo_trinh_man m where m.id = substr(p_ma_man, 5) and m.bat) into v_hop_le;
  elsif p_ma_man like 'trum:%' then
    select exists (select 1 from public.lo_trinh_man m where m.chu_de_id = substr(p_ma_man, 6) and m.bat) into v_hop_le;
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
end $$;
revoke all on function public.ghi_ket_qua_man(text, int) from public, anon;
grant execute on function public.ghi_ket_qua_man(text, int) to authenticated;

-- ── Giá đổi: xpCost do giáo viên đặt, nếu không thì theo giá tiền. ──
create or replace function public.gia_xp(p_meta jsonb)
returns int language sql immutable as $$
  select case
    -- Dưới 50 XP coi là số thử (bài đầu tiên đặt 1 XP): dùng công thức theo giá tiền.
    when nullif(p_meta->>'xpCost', '')::int >= 50 then (p_meta->>'xpCost')::int
    when nullif(p_meta->>'price', '')::numeric > 0
      then greatest(100, least(600, (round((p_meta->>'price')::numeric / 1000) * 10)::int))
    else null end
$$;

create or replace function public.redeem_exercise_with_xp(target_exercise_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare nguoi uuid := auth.uid(); ten text; du int; gia int;
begin
  if nguoi is null then return jsonb_build_object('ok', false, 'loi', 'chua_dang_nhap'); end if;
  select public.gia_xp(e.meta) into gia from public.exercises e
   where e.id = target_exercise_id and (e.meta ->> 'isPremium')::boolean is true;
  if gia is null or gia <= 0 then return jsonb_build_object('ok', false, 'loi', 'khong_doi_duoc'); end if;
  select p.name, p.xp_balance into ten, du from public.profiles p where p.id = nguoi for update;
  if ten is null then return jsonb_build_object('ok', false, 'loi', 'khong_co_ho_so'); end if;
  if exists (select 1 from public.exercise_access a where a.student = ten and a.exercise_id = target_exercise_id) then
    return jsonb_build_object('ok', true, 'da_mo_san', true, 'xp_balance', du);
  end if;
  if du < gia then return jsonb_build_object('ok', false, 'loi', 'khong_du_xp', 'xp_balance', du, 'gia', gia); end if;
  update public.profiles set xp_balance = xp_balance - gia where id = nguoi;
  insert into public.exercise_access (student, exercise_id, status, amount, ref)
  values (ten, target_exercise_id, 'XP', 0, 'xp:' || nguoi || ':' || target_exercise_id);
  insert into public.xp_so_cai (user_id, delta, ly_do, ref) values (nguoi, -gia, 'doi_bai', target_exercise_id);
  return jsonb_build_object('ok', true, 'xp_balance', du - gia, 'gia', gia);
end $$;
revoke all on function public.redeem_exercise_with_xp(text) from public, anon;
grant execute on function public.redeem_exercise_with_xp(text) to authenticated;

-- ── Tổng quan cho giao diện: số dư, đã nhận hôm nay / tuần này, trần, chuỗi. ──
create or replace function public.get_xp_tong_quan()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_ngay timestamptz := date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh';
  v_tuan timestamptz := date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh';
begin
  if v_uid is null then return null; end if;
  return jsonb_build_object(
    'so_du', (select xp_balance from public.profiles where id = v_uid),
    'hom_nay', public._xp_da_nhan(v_uid, v_ngay),
    'tuan', public._xp_da_nhan(v_uid, v_tuan),
    'tran_ngay', (public.xp_tran()->>'ngay')::int,
    'tran_tuan', (public.xp_tran()->>'tuan')::int,
    'chuoi', public._chuoi_ngay(v_uid),
    'da_diem_danh', exists (select 1 from public.xp_so_cai x where x.user_id = v_uid and x.ly_do = 'diem_danh'
                             and x.ref = ((now() at time zone 'Asia/Ho_Chi_Minh')::date)::text));
end $$;
revoke all on function public.get_xp_tong_quan() from public, anon;
grant execute on function public.get_xp_tong_quan() to authenticated;
