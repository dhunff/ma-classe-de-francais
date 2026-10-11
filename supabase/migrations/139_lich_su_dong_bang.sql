-- 139 · LỊCH SỬ ĐÓNG BĂNG CHUỖI (13/10, theo chủ dự án).
--
-- 138 tính đóng băng thuần từ `attempts`, nên ngân sách 5 lần/tháng chỉ đếm
-- trong CHUỖI HIỆN TẠI: một chuỗi đã đứt trước đó trong cùng tháng không bị
-- trừ. Nay mỗi ngày đóng băng ĐÃ NỐI được chuỗi (có ngày học ở cả hai phía)
-- được ghi vào `chuoi_dong_bang`, và ngân sách đếm MỌI dòng của tháng đó.
--
-- Ghi khi: học sinh mở widget chuỗi (get_student_streak) và mỗi lần nộp xong
-- một bài (trigger). Ngày đã có trong bảng thì không trừ thêm lần nữa.
-- Không có policy ghi: chỉ đi qua _chuoi_tinh (security definer).

create table if not exists public.chuoi_dong_bang (
  user_id  uuid not null references auth.users(id) on delete cascade,
  ngay     date not null,
  tao_luc  timestamptz not null default now(),
  primary key (user_id, ngay)
);
alter table public.chuoi_dong_bang enable row level security;
drop policy if exists chuoi_dong_bang_doc on public.chuoi_dong_bang;
create policy chuoi_dong_bang_doc on public.chuoi_dong_bang for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke insert, update, delete on public.chuoi_dong_bang from anon, authenticated;

create or replace function public._chuoi_tinh(p_uid uuid, p_ghi boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  ds date[]; dau date; d date; n int := 0; vong int := 0;
  da date[]; thang text; moi jsonb := '{}'::jsonb;
  bang date[] := '{}'; cho date[] := '{}';
begin
  select array_agg(distinct (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date),
         min((a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date)
    into ds, dau
    from attempts a where a.user_id = p_uid and a.finished_at is not null;
  -- Ngày đã đóng băng từ trước (mọi chuỗi, kể cả chuỗi đã đứt).
  select coalesce(array_agg(ngay), '{}') into da from chuoi_dong_bang where user_id = p_uid;

  if ds is null then
    return jsonb_build_object('chuoi', 0, 'dong_bang', '[]'::jsonb,
      'con_lai_thang', greatest(0, 5 - (select count(*) from unnest(da) x where to_char(x, 'YYYY-MM') = to_char(hom_nay, 'YYYY-MM'))::int));
  end if;

  d := case when hom_nay = any(ds) then hom_nay else hom_nay - 1 end;
  loop
    vong := vong + 1;
    exit when vong > 1200 or d < dau;
    if d = any(ds) then
      n := n + 1;
      bang := bang || cho; cho := '{}';
    elsif d = any(da) then
      cho := cho || d;                 -- đã đóng băng từ trước: không trừ thêm
    else
      thang := to_char(d, 'YYYY-MM');
      -- Ngân sách tháng = dòng đã lưu của tháng đó + dòng mới trong lượt duyệt này.
      exit when (select count(*) from unnest(da) x where to_char(x, 'YYYY-MM') = thang)
                + coalesce((moi ->> thang)::int, 0) >= 5;
      moi := moi || jsonb_build_object(thang, coalesce((moi ->> thang)::int, 0) + 1);
      cho := cho || d;
    end if;
    d := d - 1;
  end loop;

  -- Chỉ ngày ĐÃ NỐI được chuỗi (bang) mới ghi; đuôi `cho` lúc dừng bị bỏ.
  if p_ghi and array_length(bang, 1) > 0 then
    insert into chuoi_dong_bang (user_id, ngay)
    select p_uid, x from unnest(bang) x on conflict do nothing;
  end if;

  return jsonb_build_object(
    'chuoi', n,
    'dong_bang', coalesce((select jsonb_agg(to_char(x, 'YYYY-MM-DD') order by x) from unnest(bang) x), '[]'::jsonb),
    'con_lai_thang', greatest(0, 5 - (select count(distinct x) from unnest(da || bang) x
                                      where to_char(x, 'YYYY-MM') = to_char(hom_nay, 'YYYY-MM'))::int)
  );
end $$;
revoke all on function public._chuoi_tinh(uuid, boolean) from public, anon, authenticated;
drop function if exists public._chuoi_tinh(uuid);

-- Đọc không ghi (thưởng XP mốc chuỗi, tổng quan giáo viên).
create or replace function public._chuoi_ngay(p_uid uuid)
returns integer language sql volatile security definer set search_path = public as $$
  select (public._chuoi_tinh(p_uid, false) ->> 'chuoi')::int
$$;
revoke all on function public._chuoi_ngay(uuid) from public, anon, authenticated;

create or replace function public.get_student_streak()
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  nguoi uuid := auth.uid();
  hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  ds date[]; thu_hai date; kq jsonb; tuan jsonb; tuan_bang jsonb;
begin
  if nguoi is null then raise exception 'chưa đăng nhập' using errcode = '42501'; end if;
  kq := public._chuoi_tinh(nguoi, true);
  select array_agg(distinct (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date) into ds
    from attempts a where a.user_id = nguoi and a.finished_at is not null;
  thu_hai := hom_nay - (extract(isodow from hom_nay)::int - 1);
  select jsonb_agg(coalesce((thu_hai + i) = any(ds), false) order by i),
         jsonb_agg((kq -> 'dong_bang') ? to_char(thu_hai + i, 'YYYY-MM-DD') order by i)
    into tuan, tuan_bang
    from generate_series(0, 6) as i;
  return jsonb_build_object(
    'current_streak', (kq ->> 'chuoi')::int,
    'weekly_status',  tuan,
    'weekly_frozen',  tuan_bang,
    'freeze_left',    (kq ->> 'con_lai_thang')::int,
    'freeze_per_month', 5,
    'today_index',    extract(isodow from hom_nay)::int - 1,
    'today',          hom_nay
  );
end $$;

-- Mỗi lần nộp xong một bài: chốt các ngày đóng băng vừa được nối.
create or replace function public._ghi_dong_bang_khi_nop()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.finished_at is not null and (tg_op = 'INSERT' or old.finished_at is null) then
    perform public._chuoi_tinh(new.user_id, true);
  end if;
  return new;
end $$;
drop trigger if exists ghi_dong_bang_khi_nop on public.attempts;
create trigger ghi_dong_bang_khi_nop after insert or update of finished_at on public.attempts
  for each row execute function public._ghi_dong_bang_khi_nop();
notify pgrst, 'reload schema';
