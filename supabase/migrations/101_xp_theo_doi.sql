-- ═══════════════════════════════════════════════════════════════════════════
-- XP · THEO DÕI (@username) · ĐỔI XP LẤY BÀI TRẢ PHÍ   (26/09)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ══ XP: CHỈ MÁY CHỦ CỘNG, CHỈ MÁY CHỦ TRỪ ══
-- · `profiles.xp_balance`: học sinh KHÔNG ghi được profiles (chỉ policy của
--   giáo viên + RPC update_my_identity vốn không đụng cột này).
-- · CỘNG bằng trigger trên `attempts` — bảng học sinh KHÔNG có quyền INSERT
--   /UPDATE (đã đo: chỉ Edge Function `grade` bằng service_role ghi). Tự chấm
--   không được, nên tự bơm XP cũng không được.
-- · Chống cày: chỉ LƯỢT NỘP ĐẦU TIÊN của mỗi bài mới được cộng. Làm lại một
--   bài 50 lần không ra thêm XP. Mức cộng: 10 XP hoàn thành + 1 XP mỗi điểm đạt.
-- · Mọi lần cộng/trừ ghi vào `xp_so_cai` (sổ cái) — số dư luôn giải thích được
--   bằng các dòng sổ, và "sao tôi mất XP" có câu trả lời.
--
-- ══ ĐỔI XP: GIÁ DO GIÁO VIÊN ĐẶT, KHÔNG DO CLIENT GỬI ══
-- Giá nằm ở `exercises.meta.xpCost` (giáo viên đặt trong Builder; bảng
-- exercises chỉ giáo viên ghi được). RPC không nhận tham số giá — nhận giá
-- từ client thì học sinh gửi `0` là mở được mọi bài.
-- Mở khoá ghi vào `exercise_access` (status 'XP') — CHÍNH bảng mà
-- can_open_exercise() đang đọc, nên câu hỏi mở ra qua đúng đường RLS cũ, không
-- cần bảng `unlocked_exercises` thứ hai.
-- Chống bấm hai lần / hai tab: `select … for update` khoá dòng profiles của
-- người đó trong transaction của hàm; lần gọi thứ hai chờ, rồi thấy đã mở.
--
-- ══ THEO DÕI MỘT CHIỀU ══
-- `follows(follower_id, following_id)`. Ghi/xoá CHỈ qua RPC (không policy
-- ghi). Danh sách người mình theo dõi trả về qua RPC security definer và chỉ
-- lộ: tên hiển thị, @username, ảnh đại diện, và "hôm nay đã học chưa" — KHÔNG
-- email, không điểm, không hồ sơ.

-- ── XP ──
alter table public.profiles add column if not exists xp_balance integer not null default 0;
alter table public.profiles drop constraint if exists profiles_xp_khong_am;
alter table public.profiles add constraint profiles_xp_khong_am check (xp_balance >= 0);

create table if not exists public.xp_so_cai (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  delta      integer not null,
  ly_do      text not null check (ly_do in ('hoan_thanh_bai', 'doi_bai')),
  ref        text,
  created_at timestamptz not null default now()
);
create index if not exists xp_so_cai_user_idx on public.xp_so_cai (user_id, created_at desc);
alter table public.xp_so_cai enable row level security;
drop policy if exists xp_so_cai_doc on public.xp_so_cai;
create policy xp_so_cai_doc on public.xp_so_cai for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke all on public.xp_so_cai from anon;
revoke insert, update, delete, truncate on public.xp_so_cai from authenticated;

create or replace function public.cong_xp_khi_nop()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  diem int;
begin
  if new.finished_at is null or new.user_id is null or new.exercise_id is null then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.finished_at is not null then
    return new;
  end if;
  -- Chỉ lượt nộp ĐẦU TIÊN của bài này.
  if exists (select 1 from public.attempts a
              where a.user_id = new.user_id and a.exercise_id = new.exercise_id
                and a.finished_at is not null and a.id <> new.id) then
    return new;
  end if;

  diem := 10 + greatest(coalesce(new.score, 0), 0);
  update public.profiles set xp_balance = xp_balance + diem where id = new.user_id;
  if found then
    insert into public.xp_so_cai (user_id, delta, ly_do, ref)
    values (new.user_id, diem, 'hoan_thanh_bai', new.exercise_id);
  end if;
  return new;
end $$;

drop trigger if exists cong_xp_khi_nop on public.attempts;
create trigger cong_xp_khi_nop
  after insert or update of finished_at on public.attempts
  for each row execute function public.cong_xp_khi_nop();

-- ── Đổi XP lấy bài ──
alter table public.exercise_access drop constraint if exists exercise_access_status_check;
alter table public.exercise_access add constraint exercise_access_status_check
  check (status = any (array['PURCHASED', 'GRANTED_BY_TEACHER', 'XP']));

create or replace function public.redeem_exercise_with_xp(target_exercise_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  nguoi uuid := auth.uid();
  ten   text;
  du    int;
  gia   int;
begin
  if nguoi is null then
    return jsonb_build_object('ok', false, 'loi', 'chua_dang_nhap');
  end if;

  select nullif(e.meta ->> 'xpCost', '')::int into gia
    from public.exercises e
   where e.id = target_exercise_id and (e.meta ->> 'isPremium')::boolean is true;
  if gia is null or gia <= 0 then
    return jsonb_build_object('ok', false, 'loi', 'khong_doi_duoc');
  end if;

  -- Khoá dòng của người này tới hết hàm: hai lần bấm liền nhau xếp hàng.
  select p.name, p.xp_balance into ten, du
    from public.profiles p where p.id = nguoi for update;
  if ten is null then
    return jsonb_build_object('ok', false, 'loi', 'khong_co_ho_so');
  end if;

  if exists (select 1 from public.exercise_access a
              where a.student = ten and a.exercise_id = target_exercise_id) then
    return jsonb_build_object('ok', true, 'da_mo_san', true, 'xp_balance', du);
  end if;

  if du < gia then
    return jsonb_build_object('ok', false, 'loi', 'khong_du_xp', 'xp_balance', du, 'gia', gia);
  end if;

  update public.profiles set xp_balance = xp_balance - gia where id = nguoi;
  insert into public.exercise_access (student, exercise_id, status, amount, ref)
  values (ten, target_exercise_id, 'XP', 0, 'xp:' || nguoi || ':' || target_exercise_id);
  insert into public.xp_so_cai (user_id, delta, ly_do, ref)
  values (nguoi, -gia, 'doi_bai', target_exercise_id);

  return jsonb_build_object('ok', true, 'xp_balance', du - gia, 'gia', gia);
end $$;

revoke all on function public.redeem_exercise_with_xp(text) from public, anon;
grant execute on function public.redeem_exercise_with_xp(text) to authenticated;

create or replace function public.get_my_xp()
returns integer
language sql
stable
security definer
set search_path = public
as $$ select xp_balance from public.profiles where id = auth.uid() $$;
revoke all on function public.get_my_xp() from public, anon;
grant execute on function public.get_my_xp() to authenticated;

-- ── Theo dõi ──
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows (following_id);
alter table public.follows enable row level security;
drop policy if exists follows_doc on public.follows;
create policy follows_doc on public.follows for select to authenticated
  using (follower_id = (select auth.uid()) or following_id = (select auth.uid()));
revoke all on public.follows from anon;
revoke insert, update, delete, truncate on public.follows from authenticated;

create or replace function public.follow_user(target_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  nguoi uuid := auth.uid();
  dich  uuid;
begin
  if nguoi is null then
    return jsonb_build_object('ok', false, 'loi', 'chua_dang_nhap');
  end if;
  select id into dich from public.profiles
   where username = lower(ltrim(btrim(coalesce(target_username, '')), '@'));
  if dich is null then
    return jsonb_build_object('ok', false, 'loi', 'khong_thay');
  end if;
  if dich = nguoi then
    return jsonb_build_object('ok', false, 'loi', 'chinh_minh');
  end if;
  insert into public.follows (follower_id, following_id) values (nguoi, dich)
  on conflict do nothing;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.unfollow_user(target_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with x as (
    delete from public.follows where follower_id = auth.uid() and following_id = target_id returning 1
  )
  select jsonb_build_object('ok', true, 'da_xoa', (select count(*) from x));
$$;

-- "Hôm nay" theo giờ Việt Nam, cùng quy ước với get_student_streak (095).
create or replace function public.get_following_streaks()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
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
         ) order by f.created_at), '[]'::jsonb)
    from public.follows f
    join public.profiles p on p.id = f.following_id
   where f.follower_id = auth.uid();
$$;

revoke all on function public.follow_user(text) from public, anon;
revoke all on function public.unfollow_user(uuid) from public, anon;
revoke all on function public.get_following_streaks() from public, anon;
grant execute on function public.follow_user(text) to authenticated;
grant execute on function public.unfollow_user(uuid) to authenticated;
grant execute on function public.get_following_streaks() to authenticated;
