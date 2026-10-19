-- 150 · Kết nối học sinh dễ hơn (19/10, theo chủ dự án).
--
-- Đo 18/10: chỉ 11/34 học sinh có @username, mà follow_user CHỈ nhận @username gõ
-- đúng từng ký tự. 23 em còn lại không ai theo dõi được, và người có username cũng
-- phải đi hỏi nhau ngoài đời. Migration này:
--   1. _slug_ten(): tên « Ngọc Anh Trịnh » → « ngocanhtrinh » (bỏ dấu, kể cả đ).
--   2. _cap_username(): slug + số đuôi nếu trùng, luôn khớp profiles_username_dang.
--   3. Cấp @username cho MỌI hồ sơ đang thiếu, và trigger cấp cho hồ sơ mới.
--      Người dùng vẫn tự đổi được qua update_my_identity như cũ.
--   4. tim_ban(q): tìm theo TÊN hoặc @username, không cần gõ đúng, không cần dấu.
--   5. goi_y_ban(): gợi ý theo dõi kèm lý do (theo dõi bạn, bạn chung, cùng trường,
--      cùng trình độ, cùng mục tiêu, mới tham gia).
--   6. theo_doi_id(id): theo dõi bằng id (nút trong danh sách gợi ý / kết quả tìm).
--
-- Chỉ lộ đúng thứ get_nguoi_theo_doi_toi đã lộ: tên, @username, ảnh. Trường học
-- KHÔNG trả về (dữ liệu của trẻ vị thành niên): chỉ trả lý do « cùng trường ».
-- Chỉ tìm / gợi ý trong vai học sinh (role = 'eleve').

create or replace function public._slug_ten(p text)
returns text language sql immutable as $$
  select regexp_replace(
    translate(lower(coalesce(p, '')),
      'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđçëïîôûüœæ',
      'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyydceiiouuoa'),
    '[^a-z0-9]', '', 'g')
$$;

create or replace function public._cap_username(p_ten text, p_id uuid)
returns text language plpgsql as $$
declare
  goc text := left(public._slug_ten(p_ten), 16);
  thu text;
  n int := 0;
begin
  if goc = '' or goc is null then goc := 'banfracile'; end if;
  if goc ~ '^[0-9]' then goc := 'u' || goc; end if;
  if length(goc) < 3 then goc := rpad(goc, 3, '_'); end if;
  thu := goc;
  while exists (select 1 from public.profiles where username = thu and id <> p_id) loop
    n := n + 1;
    thu := left(goc, 20 - length(n::text)) || n::text;
  end loop;
  return thu;
end $$;

-- 3a. Cấp cho hồ sơ đang thiếu (từng dòng, để số đuôi tính đúng khi trùng).
do $$
declare r record;
begin
  for r in select id, coalesce(nullif(btrim(display_name), ''), nullif(btrim(name), ''), split_part(email, '@', 1)) as ten
           from public.profiles where username is null order by created_at
  loop
    update public.profiles set username = public._cap_username(r.ten, r.id) where id = r.id;
  end loop;
end $$;

-- 3b. Hồ sơ mới / bị xoá username: tự cấp lại.
create or replace function public._tu_cap_username()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.username is null or btrim(new.username) = '' then
    new.username := public._cap_username(coalesce(nullif(btrim(new.display_name), ''), nullif(btrim(new.name), ''), split_part(new.email, '@', 1)), new.id);
  end if;
  return new;
end $$;

drop trigger if exists profiles_tu_cap_username on public.profiles;
create trigger profiles_tu_cap_username
  before insert or update of username on public.profiles
  for each row execute function public._tu_cap_username();

-- 4. Tìm bạn theo tên hoặc @username.
create or replace function public.tim_ban(p_q text)
returns table (id uuid, name text, username text, avatar text, dang_theo_doi boolean, theo_doi_toi boolean)
language sql stable security definer set search_path = public as $$
  with q as (select public._slug_ten(ltrim(btrim(coalesce(p_q, '')), '@')) as k)
  select p.id, coalesce(nullif(p.display_name, ''), p.name), p.username, p.avatar,
         exists (select 1 from follows f where f.follower_id = auth.uid() and f.following_id = p.id),
         exists (select 1 from follows f where f.follower_id = p.id and f.following_id = auth.uid())
  from profiles p, q
  where auth.uid() is not null and length(q.k) >= 2
    and p.role = 'eleve' and p.id <> auth.uid()
    and (public._slug_ten(coalesce(p.display_name, '') || ' ' || coalesce(p.name, '')) like '%' || q.k || '%'
         or p.username like q.k || '%')
  order by (p.username like q.k || '%') desc, coalesce(nullif(p.display_name, ''), p.name)
  limit 12
$$;

-- 5. Gợi ý theo dõi, kèm lý do.
create or replace function public.goi_y_ban()
returns table (id uuid, name text, username text, avatar text, ly_do text, ban_chung int, theo_doi_toi boolean)
language sql stable security definer set search_path = public as $$
  with toi as (select * from profiles where id = auth.uid()),
  dang as (select following_id as id from follows where follower_id = auth.uid()),
  ung as (
    select p.*,
      exists (select 1 from follows f where f.follower_id = p.id and f.following_id = auth.uid()) as td_toi,
      (select count(*)::int from follows f where f.following_id = p.id and f.follower_id in (select id from dang)) as chung
    from profiles p
    where auth.uid() is not null and p.role = 'eleve' and p.id <> auth.uid()
      and p.id not in (select id from dang)
  )
  select u.id, coalesce(nullif(u.display_name, ''), u.name), u.username, u.avatar,
    case when u.td_toi then 'theo_doi_ban'
         when u.chung > 0 then 'ban_chung'
         when coalesce(nullif(lower(btrim(u.school)), '') = nullif(lower(btrim(t.school)), ''), false) then 'cung_truong'
         when coalesce(u.level = t.level, false) then 'cung_trinh_do'
         when coalesce(u.goal = t.goal, false) then 'cung_muc_tieu'
         when u.created_at > now() - interval '14 days' then 'moi_tham_gia'
         else 'hoc_vien' end,
    u.chung, u.td_toi
  from ung u, toi t
  -- coalesce từng vế: một so sánh với NULL làm cả tổng thành NULL và rơi xuống cuối.
  order by (u.td_toi::int * 100
          + u.chung * 20
          + coalesce(nullif(lower(btrim(u.school)), '') = nullif(lower(btrim(t.school)), ''), false)::int * 30
          + coalesce(u.level = t.level, false)::int * 10
          + coalesce(u.goal = t.goal, false)::int * 5
          + coalesce(u.lan_cuoi_online > now() - interval '7 days', false)::int * 5) desc,
           u.lan_cuoi_online desc nulls last
  limit 12
$$;

-- 6. Theo dõi bằng id.
create or replace function public.theo_doi_id(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return jsonb_build_object('ok', false, 'loi', 'chua_dang_nhap'); end if;
  if p_id = auth.uid() then return jsonb_build_object('ok', false, 'loi', 'chinh_minh'); end if;
  if not exists (select 1 from profiles where id = p_id and role = 'eleve') then
    return jsonb_build_object('ok', false, 'loi', 'khong_thay');
  end if;
  insert into follows (follower_id, following_id) values (auth.uid(), p_id) on conflict do nothing;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.tim_ban(text), public.goi_y_ban(), public.theo_doi_id(uuid) from public, anon;
grant execute on function public.tim_ban(text), public.goi_y_ban(), public.theo_doi_id(uuid) to authenticated;
revoke all on function public._slug_ten(text), public._cap_username(text, uuid), public._tu_cap_username() from public, anon, authenticated;
