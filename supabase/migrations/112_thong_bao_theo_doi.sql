-- THÔNG BÁO KHI CÓ NGƯỜI THEO DÕI + MẠNG LƯỚI (01/10).
--
-- KHÔNG dựng bảng `notifications` mới như bản mô tả: bảng đó ĐÃ CÓ từ 053, và
-- chuông đọc từ nó (kèm realtime). Hai bảng cùng tên khái niệm = chuông phải
-- đọc hai chỗ. Nên: thêm hai cột `type` + `actor_id` vào bảng đang có. Dòng cũ
-- mặc định 'announcement'. RLS giữ nguyên (053): mỗi người đọc/đánh dấu đúng
-- dòng của mình; không ai INSERT thẳng được — dòng 'follow' chỉ do trigger ghi.
--
-- `message` vẫn được điền (CHECK 053 đòi 1–2000 ký tự) để bản JS cũ đang mở ở
-- tab nào đó vẫn hiện được một câu có nghĩa thay vì dòng trống.
--
-- Chống spam: bỏ theo dõi rồi theo dõi lại liên tục thì chỉ MỘT thông báo mỗi
-- 24 giờ cho cùng một cặp người.

alter table public.notifications add column if not exists type text not null default 'announcement';
alter table public.notifications drop constraint if exists notifications_type_hop_le;
alter table public.notifications add constraint notifications_type_hop_le check (type in ('announcement', 'follow'));
alter table public.notifications add column if not exists actor_id uuid references public.profiles(id) on delete cascade;

create or replace function public.bao_khi_theo_doi()
returns trigger
language plpgsql security definer set search_path = public as $$
declare v_ten text;
begin
  if exists (select 1 from public.notifications n
              where n.user_id = new.following_id and n.actor_id = new.follower_id
                and n.type = 'follow' and n.created_at > now() - interval '24 hours') then
    return new;
  end if;
  select coalesce(nullif(btrim(p.display_name), ''), nullif(btrim(p.name), ''), 'Một bạn học')
    into v_ten from public.profiles p where p.id = new.follower_id;
  insert into public.notifications (user_id, actor_id, type, message)
  values (new.following_id, new.follower_id, 'follow', coalesce(v_ten, 'Một bạn học') || ' đã bắt đầu theo dõi bạn.');
  return new;
end $$;

drop trigger if exists bao_khi_theo_doi on public.follows;
create trigger bao_khi_theo_doi after insert on public.follows
  for each row execute function public.bao_khi_theo_doi();

-- Những người đang theo dõi MÌNH, kèm cờ mình đã theo dõi lại chưa.
-- Chỉ lộ tên, @username, ảnh — y như get_following_streaks.
create or replace function public.get_nguoi_theo_doi_toi()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.id,
           'name', coalesce(nullif(p.display_name, ''), p.name),
           'username', p.username,
           'avatar', p.avatar,
           'theo_doi_lai', exists (select 1 from public.follows x
                                    where x.follower_id = auth.uid() and x.following_id = p.id)
         ) order by f.created_at desc), '[]'::jsonb)
    from public.follows f
    join public.profiles p on p.id = f.follower_id
   where f.following_id = auth.uid();
$$;

-- Theo dõi lại bằng ID: người theo dõi mình có thể chưa đặt @username.
-- Chỉ cho theo dõi NGƯỢC một người đang theo dõi mình — không mở thêm đường
-- theo dõi người lạ bằng id đoán được.
create or replace function public.theo_doi_lai(p_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return jsonb_build_object('ok', false, 'loi', 'chua_dang_nhap'); end if;
  if not exists (select 1 from public.follows f where f.follower_id = p_id and f.following_id = auth.uid()) then
    return jsonb_build_object('ok', false, 'loi', 'khong_theo_doi_ban');
  end if;
  insert into public.follows (follower_id, following_id) values (auth.uid(), p_id) on conflict do nothing;
  return jsonb_build_object('ok', true);
end $$;

-- Ảnh + tên của người gửi, CHỈ cho những người đang có thông báo gửi tới mình.
create or replace function public.nguoi_gui_thong_bao()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(p.id, jsonb_build_object(
           'name', coalesce(nullif(p.display_name, ''), p.name), 'username', p.username, 'avatar', p.avatar)), '{}'::jsonb)
    from public.profiles p
   where p.id in (select n.actor_id from public.notifications n
                   where n.user_id = auth.uid() and n.actor_id is not null);
$$;

revoke all on function public.get_nguoi_theo_doi_toi() from public, anon;
revoke all on function public.theo_doi_lai(uuid) from public, anon;
revoke all on function public.nguoi_gui_thong_bao() from public, anon;
revoke all on function public.bao_khi_theo_doi() from public, anon, authenticated;
grant execute on function public.get_nguoi_theo_doi_toi() to authenticated;
grant execute on function public.theo_doi_lai(uuid) to authenticated;
grant execute on function public.nguoi_gui_thong_bao() to authenticated;
