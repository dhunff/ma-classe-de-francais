-- 138 · ĐÓNG BĂNG CHUỖI NGÀY HỌC (13/10, theo chủ dự án).
--
-- Ngày không làm bài nào được TỰ ĐỘNG đóng băng để giữ chuỗi, tối đa 5 ngày
-- mỗi THÁNG DƯƠNG LỊCH (theo tháng của chính ngày bị lỡ). Lỡ ngày thứ 6 trong
-- cùng một tháng thì chuỗi đứt tại đó.
--
-- Không lưu trạng thái: tính lại từ `attempts` mỗi lần đọc (như 095), nên
-- không có bảng nào để lệch, và đổi đồng hồ máy không có tác dụng.
--   · Hôm nay chưa học KHÔNG phải ngày lỡ (ngày chưa hết).
--   · Chuỗi đếm NGÀY ĐÃ HỌC; ngày đóng băng chỉ nối chuỗi, không cộng thêm.
--   · Không đóng băng trước ngày học đầu tiên (không có gì để giữ).
-- Giới hạn của cách tính: ngân sách 5 lần chỉ đếm trong CHUỖI HIỆN TẠI; một
-- chuỗi đã đứt trước đó trong cùng tháng không trừ vào ngân sách.

create or replace function public._chuoi_tinh(p_uid uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  ds date[]; dau date; d date; n int := 0; vong int := 0;
  da_dung jsonb := '{}'::jsonb; thang text; bang date[] := '{}'; cho date[] := '{}';
begin
  select array_agg(distinct (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date), min((a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date)
    into ds, dau
    from attempts a where a.user_id = p_uid and a.finished_at is not null;
  if ds is null then
    return jsonb_build_object('chuoi', 0, 'dong_bang', '[]'::jsonb, 'con_lai_thang', 5);
  end if;

  d := case when hom_nay = any(ds) then hom_nay else hom_nay - 1 end;
  loop
    vong := vong + 1;
    exit when vong > 1200 or d < dau;
    if d = any(ds) then
      n := n + 1;
      -- Ngày đóng băng chỉ có nghĩa khi NỐI hai ngày đã học: chốt các ngày chờ.
      bang := bang || cho; cho := '{}';
    else
      thang := to_char(d, 'YYYY-MM');
      exit when coalesce((da_dung ->> thang)::int, 0) >= 5;
      da_dung := da_dung || jsonb_build_object(thang, coalesce((da_dung ->> thang)::int, 0) + 1);
      cho := cho || d;
    end if;
    d := d - 1;
  end loop;

  -- `cho` còn lại lúc dừng là đuôi không nối được gì: bỏ, không tính vào ngân sách.
  return jsonb_build_object(
    'chuoi', n,
    'dong_bang', coalesce((select jsonb_agg(to_char(x, 'YYYY-MM-DD') order by x) from unnest(bang) x), '[]'::jsonb),
    'con_lai_thang', greatest(0, 5 - (select count(*) from unnest(bang) x where to_char(x, 'YYYY-MM') = to_char(hom_nay, 'YYYY-MM'))::int)
  );
end $$;
revoke all on function public._chuoi_tinh(uuid) from public, anon, authenticated;

-- Mọi nơi đọc chuỗi (thưởng XP mốc chuỗi 117, tổng quan giáo viên 134) đi qua đây.
create or replace function public._chuoi_ngay(p_uid uuid)
returns integer language sql stable security definer set search_path = public as $$
  select (public._chuoi_tinh(p_uid) ->> 'chuoi')::int
$$;
revoke all on function public._chuoi_ngay(uuid) from public, anon, authenticated;

create or replace function public.get_student_streak()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  nguoi uuid := auth.uid();
  hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  ds date[]; thu_hai date; kq jsonb; tuan jsonb; tuan_bang jsonb;
begin
  if nguoi is null then raise exception 'chưa đăng nhập' using errcode = '42501'; end if;
  kq := public._chuoi_tinh(nguoi);
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
notify pgrst, 'reload schema';
