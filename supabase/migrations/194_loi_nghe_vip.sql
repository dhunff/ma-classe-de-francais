-- 194 · LỜI NGHE VÀ PHÂN TÍCH BÀI NGHE, CHỈ VIP XEM SAU KHI NỘP (04/11).
--
-- Theo chủ dự án: làm xong bài nghe thì xem được lời nghe (transcription) và phân tích chủ đề, ý chính
-- của bài; chỉ tài khoản VIP. Đây là nội dung trả phí nên KHÔNG để trong `exercises` (bảng đó anon đọc
-- được): bảng riêng, bật RLS, không có policy, thu hết quyền. Chỉ hàm `xem_loi_nghe` (security definer)
-- đọc được, và chỉ trả nội dung khi người gọi là giáo viên, hoặc VIP (vip_den còn hạn, hay
-- has_premium_access) ĐÃ NỘP bài đó ít nhất một lần.
--
-- Dữ liệu: `loi` là mảng {giong, chu} theo đúng thứ tự audio (giong là tên giọng TTS, giao diện chỉ dùng
-- để biết đổi người nói); `phan_tich` là {loai, chu_de, y_chinh[]} bằng tiếng Việt. Nạp ở migration sau.

create table if not exists public.loi_nghe (
  exercise_id text primary key references public.exercises(id) on delete cascade,
  loi jsonb not null,
  phan_tich jsonb,
  cap_nhat timestamptz not null default now()
);
alter table public.loi_nghe enable row level security;
revoke all on table public.loi_nghe from public, anon, authenticated;

/* Trả về:
     null                     bài không có lời nghe (giao diện ẩn hẳn mục này)
     {"khoa": "vip"}          có lời nghe, người gọi chưa là VIP (giao diện mời mở VIP)
     {"khoa": "chua_nop"}     VIP nhưng chưa nộp bài này
     {"loi": …, "phan_tich": …} */
create or replace function public.xem_loi_nghe(p_ex text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare me uuid := (select auth.uid()); r public.loi_nghe;
begin
  select * into r from public.loi_nghe where exercise_id = p_ex;
  if not found then return null; end if;
  if me is null then return jsonb_build_object('khoa', 'vip'); end if;
  if not public.is_teacher() then
    if not (public.la_vip(me) or coalesce((select has_premium_access from public.profiles where id = me), false)) then
      return jsonb_build_object('khoa', 'vip');
    end if;
    if not exists (select 1 from public.attempts where user_id = me and exercise_id = p_ex and finished_at is not null) then
      return jsonb_build_object('khoa', 'chua_nop');
    end if;
  end if;
  return jsonb_build_object('loi', r.loi, 'phan_tich', r.phan_tich);
end $$;
revoke execute on function public.xem_loi_nghe(text) from public, anon;
grant execute on function public.xem_loi_nghe(text) to authenticated;

do $$
begin
  if has_table_privilege('anon', 'public.loi_nghe', 'select') or has_table_privilege('authenticated', 'public.loi_nghe', 'select') then
    raise exception 'loi_nghe không được đọc thẳng';
  end if;
  if has_function_privilege('anon', 'public.xem_loi_nghe(text)', 'execute') then
    raise exception 'anon không được gọi xem_loi_nghe';
  end if;
end $$;
