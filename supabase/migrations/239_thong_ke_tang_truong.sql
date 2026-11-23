-- 239 · Thống kê tăng trưởng cho giáo viên (23/11, theo chủ dự án: « tích hợp phần xem dữ liệu
-- vào tài khoản giáo viên », trang /professeur/tang-truong).
--
-- MỘT hàm đọc, trả jsonb. Chỉ giáo viên gọi được (is_teacher(), đọc app_metadata). security
-- definer để đếm được qua mọi bảng mà không mở thêm policy đọc nào cho authenticated.
-- Chỉ trả SỐ ĐẾM và tổng tiền, không trả tên, email hay id học sinh nào.
--
-- ══ ĐỊNH NGHĨA (giao diện in lại đúng các định nghĩa này) ══
-- · Học sinh: profiles.role = 'eleve'. Tài khoản thử của chủ dự án nếu là eleve thì vẫn được đếm.
-- · Ngày có hoạt động: ngày nộp một bài (attempts.finished_at) hoặc có dòng daily_activity, giờ VN.
-- · Giữ chân tuần 2: có hoạt động trong ngày 7 đến 13 sau ngày đăng ký, chỉ xét người đăng ký
--   từ 14 ngày trước. Giữ chân tháng 2: ngày 30 đến 59, xét người đã đủ 60 ngày.
-- · Nhóm người học (thứ tự ưu tiên, theo nhóm mũi nhọn chủ dự án chọn 23/11):
--     canada    : mục tiêu « TCF Canada » hoặc đã nộp bài/đề TCF Canada (level 'TCF');
--     du_hoc    : mục tiêu du học Pháp, TCF tout public, DELF B2, DALF C1/C2, hoặc đã làm TCF_TP;
--     hoc_duong : mục tiêu DELF A1 đến B1 (học sinh song ngữ, chuyên Pháp, sinh viên);
--     khac      : mục tiêu khác (đi làm, du lịch, sở thích);
--     chua_ro   : chưa khai mục tiêu và chưa làm TCF.
--   Đây là SUY ĐOÁN từ hồ sơ và hành vi, không phải người học tự chọn nhóm.
-- · Doanh thu: vip_giao_dich có so_tien > 0 (VIP giáo viên cấp ghi 0 nên không tính) và
--   exercise_access status PURCHASED (mua bài lẻ). Chưa có bộ thẻ trả phí hay MoMo vì chưa có giao dịch.

create or replace function public.thong_ke_tang_truong()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.is_teacher() then raise exception 'CHI_GIAO_VIEN' using errcode = '42501'; end if;
  with
  hom_nay as (select (now() at time zone 'Asia/Ho_Chi_Minh')::date as d),
  hs as (
    select p.id, p.goal, p.level, p.vip_den,
           (p.created_at at time zone 'Asia/Ho_Chi_Minh')::date as dk
    from public.profiles p where p.role = 'eleve'
  ),
  -- Ngày có hoạt động: ngày nộp bài (attempts) hoặc ngày ghi_hoat_dong.
  ngay as (
    select user_id, day as d from public.daily_activity
    union
    select user_id, (finished_at at time zone 'Asia/Ho_Chi_Minh')::date from public.attempts where finished_at is not null
  ),
  -- Nội dung đã làm, theo họ kỳ thi của bài hoặc của đề.
  lam as (
    select a.user_id, a.mode, a.finished_at,
           case when coalesce(ex.level, e.level) = 'TCF' then 'tcf_ca'
                when coalesce(ex.level, e.level) = 'TCF_TP' then 'tcf_tp'
                else 'delf' end as ho
    from public.attempts a
    left join public.exams ex on ex.id = a.exam_id
    left join public.exercises e on e.id = a.exercise_id
    where a.finished_at is not null
  ),
  tra as (
    select user_id, sum(so_tien) as tien from public.vip_giao_dich where so_tien > 0 group by user_id
  ),
  phan as (
    select hs.*,
      case
        when hs.goal = 'TCF Canada' or exists (select 1 from lam where lam.user_id = hs.id and lam.ho = 'tcf_ca') then 'canada'
        when hs.goal in ('Étudier en France', 'TCF tout public', 'DELF B2', 'DALF C1', 'DALF C2')
             or exists (select 1 from lam where lam.user_id = hs.id and lam.ho = 'tcf_tp') then 'du_hoc'
        when hs.goal in ('DELF A1', 'DELF A2', 'DELF B1') then 'hoc_duong'
        when hs.goal is not null and hs.goal <> '' then 'khac'
        else 'chua_ro'
      end as nhom,
      exists (select 1 from ngay n, hom_nay h where n.user_id = hs.id and n.d > h.d - 7) as hd7,
      exists (select 1 from ngay n, hom_nay h where n.user_id = hs.id and n.d > h.d - 30) as hd30,
      -- Giữ chân tuần 2: có hoạt động trong ngày 7 đến 13 sau đăng ký; chỉ xét người đã đủ 14 ngày.
      (select h.d - hs.dk >= 14 from hom_nay h) as du7,
      exists (select 1 from ngay n where n.user_id = hs.id and n.d between hs.dk + 7 and hs.dk + 13) as giu7,
      (select h.d - hs.dk >= 60 from hom_nay h) as du30,
      exists (select 1 from ngay n where n.user_id = hs.id and n.d between hs.dk + 30 and hs.dk + 59) as giu30,
      coalesce(hs.vip_den > now(), false) as vip,
      exists (select 1 from tra where tra.user_id = hs.id) as da_tra
    from hs
  )
select jsonb_build_object(
  'hom_nay', (select d from hom_nay),
  'tong', (select jsonb_build_object(
      'hoc_sinh', count(*),
      'moi_7', count(*) filter (where dk > (select d from hom_nay) - 7),
      'moi_30', count(*) filter (where dk > (select d from hom_nay) - 30),
      'hd7', count(*) filter (where hd7), 'hd30', count(*) filter (where hd30),
      'vip', count(*) filter (where vip), 'da_tra', count(*) filter (where da_tra),
      'du7', count(*) filter (where du7), 'giu7', count(*) filter (where du7 and giu7),
      'du30', count(*) filter (where du30), 'giu30', count(*) filter (where du30 and giu30),
      'dau_tien', min(dk)) from phan),
  'doanh_thu', jsonb_build_object(
      'vip', (select coalesce(sum(so_tien), 0) from public.vip_giao_dich where so_tien > 0),
      'vip_gd', (select count(*) from public.vip_giao_dich where so_tien > 0),
      'vip_30', (select coalesce(sum(so_tien), 0) from public.vip_giao_dich where so_tien > 0 and created_at > now() - interval '30 days'),
      'bai', (select coalesce(sum(amount), 0) from public.exercise_access where status = 'PURCHASED'),
      'bai_gd', (select count(*) from public.exercise_access where status = 'PURCHASED')),
  'nhom', (select coalesce(jsonb_agg(jsonb_build_object('nhom', nhom, 'n', n, 'hd30', hd30, 'vip', vip, 'da_tra', da_tra, 'du7', du7, 'giu7', giu7) order by n desc), '[]')
           from (select nhom, count(*) n, count(*) filter (where hd30) hd30, count(*) filter (where vip) vip, count(*) filter (where da_tra) da_tra,
                        count(*) filter (where du7) du7, count(*) filter (where du7 and giu7) giu7 from phan group by nhom) x),
  'dang_ky_tuan', (select coalesce(jsonb_agg(jsonb_build_object('tuan', t, 'n', (select count(*) from hs where dk >= t and dk < t + 7)) order by t), '[]')
           from (select (date_trunc('week', (select d from hom_nay)) - make_interval(weeks => g))::date t from generate_series(0, 11) g) w),
  'hoat_dong_ngay', (select coalesce(jsonb_agg(jsonb_build_object('ngay', d, 'n', (select count(distinct n.user_id) from ngay n join hs on hs.id = n.user_id where n.d = x.d)) order by d), '[]')
           from (select (select d from hom_nay) - g as d from generate_series(0, 29) g) x),
  'muc_tieu', (select coalesce(jsonb_agg(jsonb_build_object('k', k, 'n', n) order by n desc), '[]')
           from (select coalesce(nullif(goal, ''), '') k, count(*) n from hs group by 1) x),
  'trinh_do', (select coalesce(jsonb_agg(jsonb_build_object('k', k, 'n', n) order by n desc), '[]')
           from (select coalesce(nullif(level, ''), '') k, count(*) n from hs group by 1) x),
  'noi_dung_30', (select coalesce(jsonb_agg(jsonb_build_object('ho', ho, 'mode', mode, 'luot', luot, 'nguoi', nguoi)), '[]')
           from (select lam.ho, lam.mode, count(*) luot, count(distinct lam.user_id) nguoi from lam join hs on hs.id = lam.user_id
                 where lam.finished_at > now() - interval '30 days' group by 1, 2) x),
  'ai_30', jsonb_build_object(
      'hoi_leon', (select count(*) from public.leon_hoi l join hs on hs.id = l.user_id where l.created_at > now() - interval '30 days'),
      'hoi_leon_nguoi', (select count(distinct l.user_id) from public.leon_hoi l join hs on hs.id = l.user_id where l.created_at > now() - interval '30 days'),
      'cham_viet', (select count(*) from public.pe_ai_goi_y g join hs on hs.id = g.user_id where g.created_at > now() - interval '30 days'))
)
  into v;
  return v;
end $$;

revoke all on function public.thong_ke_tang_truong() from public, anon;
grant execute on function public.thong_ke_tang_truong() to authenticated;
