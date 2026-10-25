-- 167 · Mail nhắc học (25/10). Gửi qua Resend từ Edge Function `gui-nhac-hoc`,
-- pg_cron gọi theo giờ VN: « giu_chuoi » 19:00 hằng ngày, « tom_tat_tuan » 8:00 thứ Hai.
--
-- · mail_cai_dat: mỗi học sinh một dòng, hai công tắc (mặc định BẬT) + token huỷ nhận
--   (link trong mail, không cần đăng nhập). Người dùng đọc/sửa dòng của chính mình.
-- · mail_da_gui: nhật ký, khoá (user, loại, ngày VN) nên một ngày không gửi trùng.
-- · ds_mail_nhac(loai): danh sách cần gửi, CHỈ service_role gọi được (có email).
-- · Bí mật cho cron nằm trong vault; Edge Function hỏi lại qua kiem_bi_mat_cron().
create extension if not exists pg_cron;

create table if not exists public.mail_cai_dat (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  giu_chuoi    boolean not null default true,
  tom_tat_tuan boolean not null default true,
  token        uuid not null unique default gen_random_uuid(),
  cap_nhat     timestamptz not null default now()
);
alter table public.mail_cai_dat enable row level security;
create policy mail_cai_dat_doc on public.mail_cai_dat for select to authenticated using (user_id = (select auth.uid()));
create policy mail_cai_dat_them on public.mail_cai_dat for insert to authenticated with check (user_id = (select auth.uid()));
create policy mail_cai_dat_sua on public.mail_cai_dat for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.mail_cai_dat from anon;
grant select, insert, update (giu_chuoi, tom_tat_tuan, cap_nhat) on public.mail_cai_dat to authenticated;

create table if not exists public.mail_da_gui (
  user_id uuid not null references public.profiles(id) on delete cascade,
  loai    text not null check (loai in ('giu_chuoi', 'tom_tat_tuan')),
  ngay    date not null,
  luc     timestamptz not null default now(),
  resend_id text,
  primary key (user_id, loai, ngay)
);
alter table public.mail_da_gui enable row level security;
revoke all on public.mail_da_gui from anon, authenticated;

-- Huỷ nhận từ link trong mail (không đăng nhập): token là thứ duy nhất cần.
create or replace function public.huy_nhan_mail(p_token uuid, p_loai text default 'tat')
returns jsonb language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update public.mail_cai_dat set
    giu_chuoi    = case when p_loai in ('tat', 'giu_chuoi') then false else giu_chuoi end,
    tom_tat_tuan = case when p_loai in ('tat', 'tom_tat_tuan') then false else tom_tat_tuan end,
    cap_nhat = now()
  where token = p_token;
  get diagnostics n = row_count;
  return jsonb_build_object('ok', n = 1);
end $$;
revoke all on function public.huy_nhan_mail(uuid, text) from public, anon, authenticated;
grant execute on function public.huy_nhan_mail(uuid, text) to anon, authenticated;

create or replace function public.ds_mail_nhac(p_loai text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date; v jsonb;
begin
  insert into public.mail_cai_dat (user_id)
  select p.id from public.profiles p where p.role = 'eleve'
  on conflict (user_id) do nothing;

  select coalesce(jsonb_agg(x), '[]'::jsonb) into v from (
    select u.id as uid, u.email, coalesce(nullif(p.display_name, ''), split_part(u.email, '@', 1)) as ten,
           c.token, (public._chuoi_tinh(u.id) ->> 'chuoi')::int as chuoi,
           (select count(*) from public.ngay_hoc n where n.user_id = u.id and n.ngay > v_hom_nay - 7 and n.ngay <= v_hom_nay) as ngay_tuan,
           (select coalesce(sum(delta), 0) from public.xp_so_cai x where x.user_id = u.id and x.created_at > now() - interval '7 days' and x.delta > 0) as xp_tuan
    from public.profiles p
    join auth.users u on u.id = p.id
    join public.mail_cai_dat c on c.user_id = p.id
    where p.role = 'eleve' and u.email is not null
      and case p_loai when 'giu_chuoi' then c.giu_chuoi when 'tom_tat_tuan' then c.tom_tat_tuan else false end
      and not exists (select 1 from public.mail_da_gui g where g.user_id = p.id and g.loai = p_loai and g.ngay = v_hom_nay)
      and (p_loai <> 'giu_chuoi' or not exists (select 1 from public.ngay_hoc n where n.user_id = p.id and n.ngay = v_hom_nay))
  ) x where p_loai <> 'giu_chuoi' or x.chuoi > 0;
  return jsonb_build_object('ngay', v_hom_nay, 'ds', v);
end $$;
revoke all on function public.ds_mail_nhac(text) from public, anon, authenticated;
grant execute on function public.ds_mail_nhac(text) to service_role;

-- Bí mật dùng chung cron ↔ Edge Function, sinh một lần, không ai phải chép tay.
do $$ begin
  if not exists (select 1 from vault.secrets where name = 'mail_cron_bi_mat') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(24), 'hex'), 'mail_cron_bi_mat');
  end if;
end $$;
create or replace function public.kiem_bi_mat_cron(p text)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from vault.decrypted_secrets where name = 'mail_cron_bi_mat' and decrypted_secret = p);
$$;
revoke all on function public.kiem_bi_mat_cron(text) from public, anon, authenticated;
grant execute on function public.kiem_bi_mat_cron(text) to service_role;

create or replace function public._goi_gui_nhac(p_loai text)
returns bigint language sql security definer set search_path = public as $$
  select net.http_post(
    url := 'https://cdszvnuaibnnkrvynyck.supabase.co/functions/v1/gui-nhac-hoc',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-cron-bi-mat', (select decrypted_secret from vault.decrypted_secrets where name = 'mail_cron_bi_mat')),
    body := jsonb_build_object('loai', p_loai),
    timeout_milliseconds := 60000);
$$;
revoke all on function public._goi_gui_nhac(text) from public, anon, authenticated;

select cron.schedule('mail-giu-chuoi', '0 12 * * *', $$select public._goi_gui_nhac('giu_chuoi')$$);       -- 19:00 VN
select cron.schedule('mail-tom-tat-tuan', '0 1 * * 1', $$select public._goi_gui_nhac('tom_tat_tuan')$$);  -- 8:00 VN thứ Hai
