-- 154 · Theo 153: dấu tích các ngày trong tuần và cờ « hôm nay đã học » của bạn bè
-- cũng tính mọi hoạt động (attempts ∪ ngay_hoc), không chỉ bài tập.

create or replace function public.get_student_streak()
returns jsonb language plpgsql security definer set search_path = public as $function$
declare
  nguoi uuid := auth.uid();
  hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  ds date[]; thu_hai date; kq jsonb; tuan jsonb; tuan_bang jsonb;
begin
  if nguoi is null then raise exception 'chưa đăng nhập' using errcode = '42501'; end if;
  kq := public._chuoi_tinh(nguoi, true);
  select array_agg(distinct x) into ds from (
    select (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date x
      from attempts a where a.user_id = nguoi and a.finished_at is not null
    union all select h.ngay from ngay_hoc h where h.user_id = nguoi
  ) s;
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
end $function$;

create or replace function public.get_following_streaks()
returns jsonb language sql stable security definer set search_path = public as $function$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.id,
           'name', coalesce(nullif(p.display_name, ''), p.name),
           'username', p.username,
           'avatar', p.avatar,
           'has_studied_today', exists (
             select 1 from public.attempts a
              where a.user_id = p.id and a.finished_at is not null
                and (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date
                    = (now() at time zone 'Asia/Ho_Chi_Minh')::date)
             or exists (select 1 from public.ngay_hoc h where h.user_id = p.id
                and h.ngay = (now() at time zone 'Asia/Ho_Chi_Minh')::date),
           'lan_cuoi_online', case when p.an_trang_thai then null else p.lan_cuoi_online end
         ) order by f.created_at), '[]'::jsonb)
    from public.follows f
    join public.profiles p on p.id = f.following_id
   where f.follower_id = auth.uid();
$function$;
