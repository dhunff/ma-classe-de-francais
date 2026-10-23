-- 160 · Kế hoạch tới ngày thi (23/10, theo chủ dự án).
-- Học sinh chọn trình độ thi + ngày thi; máy chủ chia phần việc còn lại thành chỉ tiêu
-- MỖI TUẦN (bài luyện tập, đề thi thử, màn Lộ trình) và đếm tiến độ tuần này từ dữ
-- liệu thật (attempts, lo_trinh_ket_qua). Tuần tính theo giờ Việt Nam, bắt đầu thứ Hai.
-- Một kế hoạch mỗi người; đặt lại thì ghi đè.

create table if not exists public.ke_hoach_thi (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  cap_dich text not null check (cap_dich in ('A1', 'A2', 'B1', 'B2', 'C1')),
  ngay_thi date not null,
  tao_luc timestamptz not null default now()
);
alter table public.ke_hoach_thi enable row level security;
drop policy if exists ke_hoach_thi_cua_toi on public.ke_hoach_thi;
create policy ke_hoach_thi_cua_toi on public.ke_hoach_thi for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update, delete on public.ke_hoach_thi to authenticated;

create or replace function public.tien_do_ke_hoach()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  u uuid := auth.uid();
  kh record;
  hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  dau_tuan timestamptz;
  so_tuan int;
  cap_duoi text; ch int;
  con_bai int; con_de int; con_man int;
  tuan_bai int; tuan_de int; tuan_man int;
begin
  if u is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  select * into kh from ke_hoach_thi where user_id = u;
  if not found then return jsonb_build_object('ok', true, 'co', false); end if;

  dau_tuan := ((hom_nay - (extract(isodow from hom_nay)::int - 1))::timestamp) at time zone 'Asia/Ho_Chi_Minh';
  so_tuan := greatest(1, ceil((kh.ngay_thi - hom_nay + 1) / 7.0)::int);
  cap_duoi := case kh.cap_dich when 'A2' then 'A1' when 'B1' then 'A2' when 'B2' then 'B1' when 'C1' then 'B2' else null end;
  ch := case when kh.cap_dich in ('A1', 'A2') then 1 when kh.cap_dich = 'B1' then 2 else 3 end;

  -- Phần việc CÒN LẠI (chưa làm lần nào).
  select count(*) into con_bai from exercises x
   where x.store = 'practice' and (x.level = kh.cap_dich or x.level = kh.cap_dich || '+' or x.level = cap_duoi)
     and not exists (select 1 from attempts a where a.user_id = u and a.exercise_id = x.id and a.finished_at is not null);
  select count(*) into con_de from exams e
   where e.is_published and e.level = kh.cap_dich
     and not exists (select 1 from attempts a where a.user_id = u and a.exam_id = e.id and a.finished_at is not null);
  select count(*) into con_man from lo_trinh_man m
   where m.bat and m.chuong = ch
     and not exists (select 1 from lo_trinh_ket_qua k where k.user_id = u and k.ma_man = 'man:' || m.id and k.sao > 0);

  -- Đã làm TUẦN NÀY.
  select count(distinct a.exercise_id) into tuan_bai from attempts a
   where a.user_id = u and a.mode = 'practice' and a.finished_at >= dau_tuan;
  select count(distinct a.exam_id) into tuan_de from attempts a
   where a.user_id = u and a.mode = 'exam' and a.exam_id is not null and a.finished_at >= dau_tuan;
  select count(*) into tuan_man from lo_trinh_ket_qua k
   where k.user_id = u and k.ma_man like 'man:%' and k.sao > 0 and k.cap_nhat >= dau_tuan;

  return jsonb_build_object('ok', true, 'co', true,
    'cap_dich', kh.cap_dich, 'ngay_thi', kh.ngay_thi, 'con_ngay', kh.ngay_thi - hom_nay, 'so_tuan', so_tuan, 'chuong', ch,
    'con', jsonb_build_object('bai', con_bai, 'de', con_de, 'man', con_man),
    -- Chỉ tiêu tuần: chia đều phần còn lại, có sàn/trần cho hợp sức một tuần.
    'chi_tieu', jsonb_build_object(
      'bai', case when con_bai = 0 then 2 else least(10, greatest(2, ceil(con_bai::numeric / so_tuan)::int)) end,
      'de', case when con_de = 0 then 0 else least(2, greatest(case when so_tuan <= 3 then 1 else 0 end, ceil(con_de::numeric / so_tuan)::int)) end,
      'man', case when con_man = 0 then 0 else least(15, greatest(3, ceil(con_man::numeric / so_tuan)::int)) end),
    'tuan_nay', jsonb_build_object('bai', tuan_bai, 'de', tuan_de, 'man', tuan_man));
end $$;
revoke execute on function public.tien_do_ke_hoach() from public, anon;
grant execute on function public.tien_do_ke_hoach() to authenticated;
