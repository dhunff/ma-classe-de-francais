-- THÁCH ĐẤU BẠN BÈ (30/09) — hai người làm CÙNG một đề, so số câu đúng rồi so giờ.
--
-- ══ MÁY CHỦ LÀM CẢ BA VIỆC ══
--   phát đề  : tao_thach_dau rút 8 thẻ + phương án nhiễu, lưu vào `de` — hai
--              bên nhận đúng một đề, đúng một thứ tự;
--   bấm giờ  : lay_de_thach_dau ghi `*_bat_dau` LẦN ĐẦU gọi (tải lại trang
--              không đặt lại đồng hồ), nop_thach_dau lấy now() − bat_dau;
--   chấm     : client chỉ gửi vị trí đã chọn, không gửi điểm.
--
-- Giới hạn đã biết, ghi ra để không ai tưởng là kín: thẻ của bộ công khai thì
-- học sinh vốn đọc được (màn Flashcard, Từ điển), nên tra đáp án là CÓ THỂ —
-- nhưng tra thì tốn giờ, mà giờ do máy chủ đo. Không cộng XP: hai tài khoản
-- thông đồng sẽ cày được.
--
-- Không policy nào: mọi đường đọc/ghi là RPC security definer. Điểm của đối
-- thủ bị GIẤU cho tới khi mình nộp — biết trước 6/8 là biết mình cần mấy câu.

create table if not exists public.thach_dau (
  id          uuid primary key default gen_random_uuid(),
  nguoi_thach uuid not null references public.profiles(id) on delete cascade,
  doi_thu     uuid not null references public.profiles(id) on delete cascade,
  bo_id       uuid not null references public.the_bo(id) on delete cascade,
  de          jsonb not null,
  a_bat_dau timestamptz, a_xong timestamptz, a_dung int, a_giay int,
  b_bat_dau timestamptz, b_xong timestamptz, b_dung int, b_giay int,
  created_at  timestamptz not null default now(),
  check (nguoi_thach <> doi_thu)
);
create index if not exists thach_dau_a_idx on public.thach_dau (nguoi_thach, created_at desc);
create index if not exists thach_dau_b_idx on public.thach_dau (doi_thu, created_at desc);
alter table public.thach_dau enable row level security;
revoke all on public.thach_dau from anon, authenticated;

create or replace function public.tao_thach_dau(p_doi_thu uuid, p_bo uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_de jsonb; v_id uuid;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_doi_thu = v_uid then raise exception 'KHONG_TU_THACH_MINH'; end if;
  -- Chỉ thách người mình đang theo dõi: không ai bị người lạ gửi thách đấu.
  if not exists (select 1 from public.follows f where f.follower_id = v_uid and f.following_id = p_doi_thu) then
    raise exception 'CHUA_THEO_DOI';
  end if;
  if not exists (select 1 from public.the_bo b where b.id = p_bo and b.cong_khai) then
    raise exception 'BO_KHONG_TON_TAI';
  end if;
  if (select count(*) from public.thach_dau t
       where t.nguoi_thach = v_uid and t.created_at > now() - interval '24 hours') >= 10 then
    raise exception 'DAILY_LIMIT_REACHED';
  end if;

  with chon as (
    select s.id, s.mat_truoc, s.mat_sau, row_number() over () as rn
      from (select t.id, t.mat_truoc, t.mat_sau from public.the_bo_the t
             where t.bo_id = p_bo and btrim(t.mat_truoc) <> '' and btrim(t.mat_sau) <> ''
             order by random() limit 8) s
  )
  select jsonb_agg(jsonb_build_object(
           'the', c.id,
           'chieu', case when c.rn % 2 = 1 then 'nghia' else 'phap' end,
           'lua_chon', (select jsonb_agg(x.id order by random())
                          from (select c.id as id
                                union all
                                (select o.id from public.the_bo_the o
                                  where o.bo_id = p_bo and o.id <> c.id
                                    and lower(o.mat_sau) <> lower(c.mat_sau)
                                    and lower(o.mat_truoc) <> lower(c.mat_truoc)
                                  order by random() limit 3)) x)
         ) order by c.rn)
    into v_de from chon c;

  if v_de is null or jsonb_array_length(v_de) < 4 then raise exception 'BO_QUA_IT_THE'; end if;

  insert into public.thach_dau (nguoi_thach, doi_thu, bo_id, de)
  values (v_uid, p_doi_thu, p_bo, v_de) returning id into v_id;
  return v_id;
end $$;

create or replace function public.lay_de_thach_dau(p_id uuid)
returns table (stt int, chieu text, de text, lua_chon text[])
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r public.thach_dau;
begin
  select * into r from public.thach_dau t where t.id = p_id for update;
  if r.id is null or v_uid is null or v_uid not in (r.nguoi_thach, r.doi_thu) then
    raise exception 'KHONG_CO_QUYEN' using errcode = '42501';
  end if;
  if v_uid = r.nguoi_thach then
    if r.a_xong is not null then raise exception 'DA_NOP'; end if;
    update public.thach_dau t set a_bat_dau = coalesce(t.a_bat_dau, now()) where t.id = p_id;
  else
    if r.b_xong is not null then raise exception 'DA_NOP'; end if;
    update public.thach_dau t set b_bat_dau = coalesce(t.b_bat_dau, now()) where t.id = p_id;
  end if;

  return query
  select q.ord::int, q.v->>'chieu',
         case when q.v->>'chieu' = 'nghia' then t.mat_truoc else t.mat_sau end,
         (select array_agg(case when q.v->>'chieu' = 'nghia' then o.mat_sau else o.mat_truoc end order by l.ord)
            from jsonb_array_elements_text(q.v->'lua_chon') with ordinality l(the_id, ord)
            join public.the_bo_the o on o.id::text = l.the_id)
    from jsonb_array_elements(r.de) with ordinality q(v, ord)
    join public.the_bo_the t on t.id::text = q.v->>'the'
   order by q.ord;
end $$;

-- p_tra_loi: vị trí đã chọn (0..3) cho từng câu, theo thứ tự đề; -1 = bỏ qua.
create or replace function public.nop_thach_dau(p_id uuid, p_tra_loi int[])
returns table (r_dung int, r_tong int, r_giay int)
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r public.thach_dau; v_la_a boolean; v_bd timestamptz; v_dung int; v_giay int;
begin
  select * into r from public.thach_dau t where t.id = p_id for update;
  if r.id is null or v_uid is null or v_uid not in (r.nguoi_thach, r.doi_thu) then
    raise exception 'KHONG_CO_QUYEN' using errcode = '42501';
  end if;
  v_la_a := v_uid = r.nguoi_thach;
  v_bd := case when v_la_a then r.a_bat_dau else r.b_bat_dau end;
  if v_bd is null then raise exception 'CHUA_BAT_DAU'; end if;
  if (case when v_la_a then r.a_xong else r.b_xong end) is not null then raise exception 'DA_NOP'; end if;

  -- Chặn ngoài 0..3: chỉ số ÂM trong jsonb đếm từ cuối mảng, -1 sẽ trúng phương án cuối.
  select count(*) filter (where p_tra_loi[q.ord::int] between 0 and 3
                            and q.v->'lua_chon'->>(p_tra_loi[q.ord::int]) = q.v->>'the')::int
    into v_dung
    from jsonb_array_elements(r.de) with ordinality q(v, ord);
  v_giay := least(greatest(extract(epoch from now() - v_bd)::int, 1), 3600);

  if v_la_a then
    update public.thach_dau t set a_xong = now(), a_dung = v_dung, a_giay = v_giay where t.id = p_id;
  else
    update public.thach_dau t set b_xong = now(), b_dung = v_dung, b_giay = v_giay where t.id = p_id;
  end if;
  return query select v_dung, jsonb_array_length(r.de), v_giay;
end $$;

create or replace function public.ds_thach_dau()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(d order by (d->>'created_at') desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', t.id, 'bo', b.ten, 'ky_nang', b.ky_nang, 'tong', jsonb_array_length(t.de),
      'toi_thach', t.nguoi_thach = auth.uid(),
      'doi_phuong', jsonb_build_object('name', coalesce(nullif(p.display_name, ''), p.name),
                                       'username', p.username, 'avatar', p.avatar),
      'toi_xong', m.toi_xong is not null, 'toi_dung', m.toi_dung, 'toi_giay', m.toi_giay,
      'ho_xong', m.ho_xong is not null,
      -- Điểm đối thủ chỉ lộ sau khi MÌNH đã nộp.
      'ho_dung', case when m.toi_xong is not null then m.ho_dung end,
      'ho_giay', case when m.toi_xong is not null then m.ho_giay end,
      'created_at', t.created_at) as d
    from public.thach_dau t
    join public.the_bo b on b.id = t.bo_id
    cross join lateral (select
        case when t.nguoi_thach = auth.uid() then t.a_xong else t.b_xong end as toi_xong,
        case when t.nguoi_thach = auth.uid() then t.a_dung else t.b_dung end as toi_dung,
        case when t.nguoi_thach = auth.uid() then t.a_giay else t.b_giay end as toi_giay,
        case when t.nguoi_thach = auth.uid() then t.b_xong else t.a_xong end as ho_xong,
        case when t.nguoi_thach = auth.uid() then t.b_dung else t.a_dung end as ho_dung,
        case when t.nguoi_thach = auth.uid() then t.b_giay else t.a_giay end as ho_giay) m
    join public.profiles p on p.id = case when t.nguoi_thach = auth.uid() then t.doi_thu else t.nguoi_thach end
    where auth.uid() in (t.nguoi_thach, t.doi_thu)
    order by t.created_at desc limit 50
  ) s;
$$;

revoke all on function public.tao_thach_dau(uuid, uuid) from public, anon;
revoke all on function public.lay_de_thach_dau(uuid) from public, anon;
revoke all on function public.nop_thach_dau(uuid, int[]) from public, anon;
revoke all on function public.ds_thach_dau() from public, anon;
grant execute on function public.tao_thach_dau(uuid, uuid) to authenticated;
grant execute on function public.lay_de_thach_dau(uuid) to authenticated;
grant execute on function public.nop_thach_dau(uuid, int[]) to authenticated;
grant execute on function public.ds_thach_dau() to authenticated;
