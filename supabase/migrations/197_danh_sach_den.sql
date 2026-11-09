-- 197 · Danh sách đen: giáo viên chặn một email đăng nhập (09/11, theo chủ dự án).
--
-- ══ CHẶN Ở ĐÂU ══
-- Ở tầng xác thực, không ở giao diện: đặt auth.users.banned_until thì GoTrue từ chối MỌI cách
-- đăng nhập (mật khẩu, Google) và từ chối làm mới phiên. Chặn ở giao diện thì ai gọi thẳng API vẫn
-- vào được. Phiên đang mở bị xoá ngay; access token đã cấp hết hạn sau tối đa khoảng 1 giờ.
-- banned_until đặt 100 năm chứ không 'infinity': GoTrue đọc cột này bằng kiểu thời gian của Go,
-- và 'infinity' không phải một thời điểm nó hiểu.
--
-- ══ EMAIL CHƯA CÓ TÀI KHOẢN ══
-- Vẫn lưu được: trigger BEFORE INSERT trên auth.users chặn đăng ký mới bằng email đó, kể cả khi
-- tài khoản cũ bị xoá rồi tạo lại.
--
-- ══ KHÔNG CHẶN GIÁO VIÊN ══
-- Không chặn được tài khoản giáo viên, kể cả chính mình: một cú bấm nhầm không được khoá người
-- quản trị ra khỏi hệ thống.
--
-- Email nằm trong database, KHÔNG nằm trong git: migration này không ghi sẵn email nào.

create table if not exists public.danh_sach_den (
  id        bigserial primary key,
  email     text not null unique check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  user_id   uuid references auth.users(id) on delete set null,
  ly_do     text not null default '' check (char_length(ly_do) <= 500),
  chan_boi  uuid references auth.users(id) on delete set null,
  chan_luc  timestamptz not null default now()
);

alter table public.danh_sach_den enable row level security;
drop policy if exists danh_sach_den_gv_doc on public.danh_sach_den;
create policy danh_sach_den_gv_doc on public.danh_sach_den for select to authenticated
  using (public.is_teacher());
revoke all on public.danh_sach_den from anon;
revoke insert, update, delete on public.danh_sach_den from authenticated;
grant select on public.danh_sach_den to authenticated;

-- ── Chặn ──
create or replace function public.chan_tai_khoan(p_email text, p_ly_do text default '')
returns jsonb language plpgsql security definer set search_path = public, auth as $$
declare v_email text := lower(trim(coalesce(p_email, ''))); v_uid uuid; v_role text; v_id bigint;
begin
  if not public.is_teacher() then raise exception 'CHI_GIAO_VIEN' using errcode = '42501'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(coalesce(p_ly_do, '')) > 500 then
    raise exception 'SAI_DU_LIEU' using errcode = '22023';
  end if;

  select u.id into v_uid from auth.users u where lower(u.email) = v_email limit 1;
  if v_uid is not null then
    if v_uid = auth.uid() then raise exception 'KHONG_CHAN_CHINH_MINH' using errcode = '42501'; end if;
    select role into v_role from public.profiles where id = v_uid;
    if v_role = 'prof' then raise exception 'KHONG_CHAN_GIAO_VIEN' using errcode = '42501'; end if;
  end if;

  insert into public.danh_sach_den (email, user_id, ly_do, chan_boi)
  values (v_email, v_uid, coalesce(trim(p_ly_do), ''), auth.uid())
  on conflict (email) do update set user_id = excluded.user_id, ly_do = excluded.ly_do,
    chan_boi = excluded.chan_boi, chan_luc = now()
  returning id into v_id;

  if v_uid is not null then
    update auth.users set banned_until = now() + interval '100 years' where id = v_uid;
    delete from auth.refresh_tokens where user_id = v_uid::text;
    delete from auth.sessions where user_id = v_uid;
  end if;

  return jsonb_build_object('ok', true, 'id', v_id, 'co_tai_khoan', v_uid is not null);
end $$;
revoke all on function public.chan_tai_khoan(text, text) from public, anon;
grant execute on function public.chan_tai_khoan(text, text) to authenticated;

-- ── Bỏ chặn ──
create or replace function public.bo_chan_tai_khoan(p_id bigint)
returns jsonb language plpgsql security definer set search_path = public, auth as $$
declare v_email text;
begin
  if not public.is_teacher() then raise exception 'CHI_GIAO_VIEN' using errcode = '42501'; end if;
  delete from public.danh_sach_den where id = p_id returning email into v_email;
  if v_email is null then return jsonb_build_object('ok', false); end if;
  update auth.users set banned_until = null where lower(email) = v_email;
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.bo_chan_tai_khoan(bigint) from public, anon;
grant execute on function public.bo_chan_tai_khoan(bigint) to authenticated;

-- ── Chặn đăng ký mới bằng email trong danh sách đen ──
create or replace function public.chan_dang_ky_danh_sach_den()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is not null and exists (select 1 from public.danh_sach_den where email = lower(new.email)) then
    raise exception 'EMAIL_BI_CHAN' using errcode = '42501';
  end if;
  return new;
end $$;
revoke all on function public.chan_dang_ky_danh_sach_den() from public, anon, authenticated;

drop trigger if exists chan_dang_ky_danh_sach_den on auth.users;
create trigger chan_dang_ky_danh_sach_den
  before insert on auth.users
  for each row execute function public.chan_dang_ky_danh_sach_den();
