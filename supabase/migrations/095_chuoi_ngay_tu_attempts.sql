-- ═══════════════════════════════════════════════════════════════════════════
-- CHUỖI NGÀY HỌC TÍNH HOÀN TOÀN Ở MÁY CHỦ, TỪ `attempts.finished_at`
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Khác `chuoi_ngay_hoc` (061): hàm đó đọc `daily_activity`, nơi CLIENT gửi
-- ngày địa phương lên (máy chủ chỉ chặn ±1 ngày). Ở đây không có ngày nào do
-- client gửi: `finished_at` do máy chủ đóng dấu khi chấm, và "hôm nay" là
-- now() quy về giờ Việt Nam. Đổi đồng hồ máy không làm chuỗi dài thêm.
--
-- Múi giờ CỐ ĐỊNH Asia/Ho_Chi_Minh: người học của FRACILE ở Việt Nam. Lấy
-- `current_date` (UTC) thì bài làm lúc 6 giờ sáng bị tính vào hôm qua.
--
-- Cách đếm: gom các NGÀY (giờ VN) có ít nhất một lượt nộp. Điểm neo là hôm
-- nay nếu hôm nay đã học, nếu không thì hôm qua — chưa học hôm nay không làm
-- đứt chuỗi trước nửa đêm. Từ điểm neo lùi từng ngày, đếm cho tới ngày đầu
-- tiên không có lượt nào. Không có điểm neo nào thì chuỗi = 0.
--
-- `weekly_status`: 7 giá trị Thứ Hai → Chủ Nhật của tuần hiện tại.

create or replace function public.get_student_streak()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  nguoi   uuid := auth.uid();
  hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  ds      date[];
  ngay    date;
  chuoi   int := 0;
  thu_hai date;
  tuan    jsonb;
begin
  if nguoi is null then
    raise exception 'chưa đăng nhập' using errcode = '42501';
  end if;

  select array_agg(distinct (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date)
    into ds
    from public.attempts a
   where a.user_id = nguoi
     and a.finished_at is not null;

  ngay := case
            when hom_nay = any(coalesce(ds, '{}')) then hom_nay
            when hom_nay - 1 = any(coalesce(ds, '{}')) then hom_nay - 1
          end;

  while ngay is not null and ngay = any(ds) loop
    chuoi := chuoi + 1;
    ngay  := ngay - 1;
  end loop;

  thu_hai := hom_nay - (extract(isodow from hom_nay)::int - 1);
  select jsonb_agg(coalesce((thu_hai + i) = any(ds), false) order by i)
    into tuan
    from generate_series(0, 6) as i;

  return jsonb_build_object(
    'current_streak', chuoi,
    'weekly_status',  tuan,
    'today_index',    extract(isodow from hom_nay)::int - 1,
    'today',          hom_nay
  );
end $$;

revoke all on function public.get_student_streak() from public, anon;
grant execute on function public.get_student_streak() to authenticated;
