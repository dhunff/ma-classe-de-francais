-- Bảng xếp hạng XP trong nhóm « mình + những người mình theo dõi » (26/09).
--
-- KHÔNG xếp hạng toàn trường: người ta chỉ thấy XP của người họ chủ động theo
-- dõi (và của chính mình). Trả về đúng các trường get_following_streaks đã lộ
-- (tên, @username, ảnh) + xp_balance — không email, không điểm từng bài.
-- Hạng tính ở máy chủ; hoà XP thì xếp theo tên để thứ tự ổn định.

create or replace function public.get_bang_xep_hang()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with nhom as (
    select auth.uid() as id
    union
    select following_id from public.follows where follower_id = auth.uid()
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'hang', x.hang, 'id', x.id, 'name', x.ten, 'username', x.username,
           'avatar', x.avatar, 'xp', x.xp_balance, 'la_toi', x.id = auth.uid()
         ) order by x.hang, x.ten), '[]'::jsonb)
    from (
      select p.id, coalesce(nullif(p.display_name, ''), p.name) as ten, p.username, p.avatar, p.xp_balance,
             rank() over (order by p.xp_balance desc) as hang
        from nhom n join public.profiles p on p.id = n.id
    ) x
   where auth.uid() is not null;
$$;

revoke all on function public.get_bang_xep_hang() from public, anon;
grant execute on function public.get_bang_xep_hang() to authenticated;
