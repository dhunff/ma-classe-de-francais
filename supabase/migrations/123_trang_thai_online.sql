-- 123 (08/10): trạng thái online / offline cho người theo dõi nhau.
--
-- Trước đây « online » sống trong blob kv_store `mcf-presence`, ghi kiểu
-- đọc-sửa-ghi: hai học sinh ghi cùng lúc thì một người bị đè, và ai đọc được
-- blob là đọc được giờ hoạt động của cả trường. Nay là MỘT CỘT trên profiles,
-- chỉ người dùng tự chạm vào dòng của mình qua RPC, và người khác chỉ thấy
-- qua hai RPC danh sách theo dõi (101, 112).
--
-- Quyền riêng tư: `an_trang_thai = true` thì người theo dõi KHÔNG thấy gì
-- (RPC trả null), giáo viên vẫn thấy để theo dõi lớp.
alter table public.profiles add column if not exists lan_cuoi_online timestamptz;
alter table public.profiles add column if not exists an_trang_thai boolean not null default false;

-- Nhịp tim: gọi khi có tương tác. Ghi tối đa mỗi 30 giây để không ghi dồn.
create or replace function public.cham_online()
returns jsonb language sql security definer set search_path = public as $$
  with s as (
    update public.profiles set lan_cuoi_online = now()
     where id = (select auth.uid())
       and (lan_cuoi_online is null or lan_cuoi_online < now() - interval '30 seconds')
    returning 1)
  select jsonb_build_object('ok', true, 'ghi', (select count(*) from s));
$$;

create or replace function public.dat_an_trang_thai(p_an boolean)
returns jsonb language sql security definer set search_path = public as $$
  with s as (update public.profiles set an_trang_thai = coalesce(p_an, false) where id = (select auth.uid()) returning an_trang_thai)
  select jsonb_build_object('ok', exists (select 1 from s), 'an', (select an_trang_thai from s));
$$;

create or replace function public.get_an_trang_thai()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select an_trang_thai from public.profiles where id = (select auth.uid())), false);
$$;

create or replace function public.get_following_streaks()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.id,
           'name', coalesce(nullif(p.display_name, ''), p.name),
           'username', p.username,
           'avatar', p.avatar,
           'has_studied_today', exists (
             select 1 from public.attempts a
              where a.user_id = p.id and a.finished_at is not null
                and (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date
                    = (now() at time zone 'Asia/Ho_Chi_Minh')::date),
           'lan_cuoi_online', case when p.an_trang_thai then null else p.lan_cuoi_online end
         ) order by f.created_at), '[]'::jsonb)
    from public.follows f
    join public.profiles p on p.id = f.following_id
   where f.follower_id = auth.uid();
$$;

create or replace function public.get_nguoi_theo_doi_toi()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.id,
           'name', coalesce(nullif(p.display_name, ''), p.name),
           'username', p.username,
           'avatar', p.avatar,
           'theo_doi_lai', exists (select 1 from public.follows x
                                    where x.follower_id = auth.uid() and x.following_id = p.id),
           -- chỉ lộ trạng thái khi MÌNH cũng theo dõi họ (theo dõi một chiều
           -- không cho quyền xem giờ hoạt động của người theo dõi mình)
           'lan_cuoi_online', case when p.an_trang_thai then null
             when exists (select 1 from public.follows x where x.follower_id = auth.uid() and x.following_id = p.id)
             then p.lan_cuoi_online end
         ) order by f.created_at desc), '[]'::jsonb)
    from public.follows f
    join public.profiles p on p.id = f.follower_id
   where f.following_id = auth.uid();
$$;

revoke all on function public.cham_online() from public, anon;
revoke all on function public.dat_an_trang_thai(boolean) from public, anon;
revoke all on function public.get_an_trang_thai() from public, anon;
grant execute on function public.cham_online() to authenticated;
grant execute on function public.dat_an_trang_thai(boolean) to authenticated;
grant execute on function public.get_an_trang_thai() to authenticated;
