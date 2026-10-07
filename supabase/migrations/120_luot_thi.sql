-- 120 (07/10): GIỚI HẠN 2 LƯỢT THI THỬ MỖI NGÀY.
--
-- Mỗi lần bấm « Bắt đầu thi » là TIÊU MỘT LƯỢT, ngay lúc bắt đầu. Thoát giữa
-- chừng, đóng tab, F5 đều không hoàn lại — đúng điều màn hình báo trước cho học
-- sinh. Đếm ở máy chủ: đếm ở trình duyệt thì xoá localStorage là có lượt mới.
--
-- « Ngày » là ngày giờ Việt Nam (Asia/Ho_Chi_Minh), không phải UTC: dùng
-- current_date (UTC) thì lượt « hôm nay » làm mới lúc 7 giờ sáng.
--
-- Giáo viên không bị giới hạn (cần thử đề trước khi phát hành).
create table if not exists public.luot_thi (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  exam_id    uuid references public.exams(id) on delete set null,
  ngay       date not null,
  bat_dau    timestamptz not null default now(),
  ket_thuc   timestamptz,
  trang_thai text not null default 'dang_lam' check (trang_thai in ('dang_lam', 'xong', 'bo_do'))
);
create index if not exists luot_thi_nguoi_ngay on public.luot_thi (user_id, ngay);
alter table public.luot_thi enable row level security;
drop policy if exists luot_thi_doc on public.luot_thi;
create policy luot_thi_doc on public.luot_thi for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke all on public.luot_thi from anon;
revoke insert, update, delete, truncate on public.luot_thi from authenticated;

create or replace function public._ngay_vn() returns date language sql stable as $$
  select (now() at time zone 'Asia/Ho_Chi_Minh')::date;
$$;

-- Còn mấy lượt hôm nay. Trả về cho màn chờ đọc TRƯỚC khi học sinh bấm.
create or replace function public.luot_thi_hom_nay()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'gioi_han', 2,
    'da_dung', (select count(*) from public.luot_thi where user_id = (select auth.uid()) and ngay = public._ngay_vn()),
    'khong_gioi_han', public.is_teacher());
$$;

-- Bắt đầu một lượt. Hết lượt thì trả ok=false, ma='HET_LUOT' (không ném lỗi,
-- để giao diện nói đúng câu « mai quay lại » thay vì « thử lại sau »).
create or replace function public.bat_dau_thi(p_exam_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); da int; v uuid;
begin
  if u is null then return jsonb_build_object('ok', false, 'ma', 'CHUA_DANG_NHAP'); end if;
  -- khoá theo người: hai tab bấm cùng lúc không lọt được lượt thứ ba
  perform pg_advisory_xact_lock(hashtext('luot_thi:' || u::text));
  select count(*) into da from public.luot_thi where user_id = u and ngay = public._ngay_vn();
  if da >= 2 and not public.is_teacher() then
    return jsonb_build_object('ok', false, 'ma', 'HET_LUOT', 'da_dung', da, 'gioi_han', 2);
  end if;
  -- lượt cũ còn « đang làm » mà bắt đầu lượt mới = lượt cũ đã bị bỏ dở
  update public.luot_thi set trang_thai = 'bo_do', ket_thuc = now() where user_id = u and trang_thai = 'dang_lam';
  insert into public.luot_thi (user_id, exam_id, ngay) values (u, p_exam_id, public._ngay_vn()) returning id into v;
  return jsonb_build_object('ok', true, 'luot_id', v, 'da_dung', da + 1, 'gioi_han', 2);
end $$;

create or replace function public.ket_thuc_thi(p_luot uuid, p_xong boolean)
returns jsonb language sql security definer set search_path = public as $$
  with s as (
    update public.luot_thi set trang_thai = case when p_xong then 'xong' else 'bo_do' end, ket_thuc = now()
    where id = p_luot and user_id = (select auth.uid()) and trang_thai = 'dang_lam' returning id)
  select jsonb_build_object('ok', true, 'so_dong', (select count(*) from s));
$$;

revoke all on function public.luot_thi_hom_nay() from public, anon;
revoke all on function public.bat_dau_thi(uuid) from public, anon;
revoke all on function public.ket_thuc_thi(uuid, boolean) from public, anon;
grant execute on function public.luot_thi_hom_nay() to authenticated;
grant execute on function public.bat_dau_thi(uuid) to authenticated;
grant execute on function public.ket_thuc_thi(uuid, boolean) to authenticated;
