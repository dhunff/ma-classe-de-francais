-- 172 · Lịch học tự đặt + mail Léon nhắc trước 30 phút (28/10, theo chủ dự án).
--
-- Trước đây sự kiện tự thêm nằm trong blob kv_store `mcf-cal-<tên>`: máy chủ không truy vấn được
-- nên không có cách nào gửi mail đúng giờ. Bảng này thay cho blob ở đường GHI; blob cũ vẫn được
-- đọc (và xoá được) ở màn lịch, không chép sang vì khoá blob theo TÊN chứ không theo user_id.
--
-- Mail: pg_cron mỗi 5 phút gọi Edge Function `gui-nhac-lich` (cùng bí mật vault với 167).
-- `nhan_lich_can_nhac()` NHẬN (claim) các lịch bắt đầu trong ≤ 31 phút tới bằng một câu UPDATE …
-- RETURNING, nên hai lượt cron chồng nhau không gửi trùng. Đánh đổi: gửi lỗi thì không gửi lại.

create table if not exists public.lich_hoc (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  tieu_de    text not null check (char_length(tieu_de) between 1 and 120),
  muc        text check (muc in ('lo-trinh', 'luyen-tap', 'flashcard', 'thi-thu', 'nghe-noi', 'thach-dau', 'tro-choi', 'ngu-phap')),
  luc        timestamptz not null,
  nhac_mail  boolean not null default true,
  da_nhac    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists lich_hoc_nguoi_luc on public.lich_hoc (user_id, luc);
create index if not exists lich_hoc_cho_nhac on public.lich_hoc (luc) where nhac_mail and da_nhac is null;

alter table public.lich_hoc enable row level security;
create policy lich_hoc_doc on public.lich_hoc for select to authenticated using (user_id = (select auth.uid()));
create policy lich_hoc_them on public.lich_hoc for insert to authenticated with check (user_id = (select auth.uid()));
create policy lich_hoc_sua on public.lich_hoc for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy lich_hoc_xoa on public.lich_hoc for delete to authenticated using (user_id = (select auth.uid()));
revoke all on public.lich_hoc from anon, authenticated;
grant select, delete on public.lich_hoc to authenticated;
grant insert (tieu_de, muc, luc, nhac_mail) on public.lich_hoc to authenticated;
grant update (tieu_de, muc, luc, nhac_mail) on public.lich_hoc to authenticated;

-- Dời giờ thì được nhắc lại; chặn lũ: tối đa 100 lịch còn ở tương lai mỗi người.
create or replace function public._lich_hoc_truoc_ghi() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if (select count(*) from public.lich_hoc where user_id = new.user_id and luc > now()) >= 100 then
      raise exception 'QUA_NHIEU_LICH' using errcode = 'P0001';
    end if;
    new.da_nhac := null;
  elsif new.luc is distinct from old.luc then
    new.da_nhac := null;
  end if;
  return new;
end $$;
drop trigger if exists lich_hoc_truoc_ghi on public.lich_hoc;
create trigger lich_hoc_truoc_ghi before insert or update on public.lich_hoc
  for each row execute function public._lich_hoc_truoc_ghi();

create or replace function public.nhan_lich_can_nhac()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  with nhan as (
    update public.lich_hoc l set da_nhac = now()
     where l.nhac_mail and l.da_nhac is null
       and l.luc > now() and l.luc <= now() + interval '31 minutes'
    returning l.id, l.user_id, l.tieu_de, l.muc, l.luc
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', n.id, 'email', u.email, 'tieu_de', n.tieu_de, 'muc', n.muc, 'luc', n.luc,
           'ten', coalesce(nullif(p.display_name, ''), split_part(u.email, '@', 1)))), '[]'::jsonb)
    into v
    from nhan n join auth.users u on u.id = n.user_id join public.profiles p on p.id = n.user_id
   where u.email is not null;
  return v;
end $$;
revoke all on function public.nhan_lich_can_nhac() from public, anon, authenticated;
grant execute on function public.nhan_lich_can_nhac() to service_role;

create or replace function public._goi_nhac_lich()
returns bigint language sql security definer set search_path = public as $$
  select net.http_post(
    url := 'https://cdszvnuaibnnkrvynyck.supabase.co/functions/v1/gui-nhac-lich',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-cron-bi-mat', (select decrypted_secret from vault.decrypted_secrets where name = 'mail_cron_bi_mat')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000);
$$;
revoke all on function public._goi_nhac_lich() from public, anon, authenticated;

select cron.schedule('mail-nhac-lich', '*/5 * * * *', $$select public._goi_nhac_lich()$$);
