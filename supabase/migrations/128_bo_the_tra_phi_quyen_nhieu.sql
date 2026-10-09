-- 128 · Flashcard: bộ trả phí, cấp quyền cho học sinh, phương án sai do giáo viên soạn (10/10).
--
-- · the_bo.tra_phi + gia: bộ trả phí. Thẻ của bộ trả phí chỉ đọc được khi là
--   giáo viên, VIP còn hạn, hoặc được cấp quyền (the_bo_quyen).
-- · the_bo_quyen: giáo viên cấp / thu quyền mở một bộ cho từng học sinh.
-- · the_bo_the.nhieu: tối đa 3 NGHĨA SAI do giáo viên viết; Thách đấu dùng chúng
--   làm phương án ở câu « nghĩa là gì » thay cho nhiễu rút ngẫu nhiên.
-- · Bộ trả phí KHÔNG vào Thách đấu: đề thách đấu lộ mặt thẻ cho cả hai bên.

alter table public.the_bo add column if not exists tra_phi boolean not null default false;
alter table public.the_bo add column if not exists gia int not null default 0 check (gia >= 0);
alter table public.the_bo_the add column if not exists nhieu text[] not null default '{}'
  check (coalesce(array_length(nhieu, 1), 0) <= 3);

create table if not exists public.the_bo_quyen (
  bo_id      uuid not null references public.the_bo(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  cap_boi    uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (bo_id, user_id)
);
alter table public.the_bo_quyen enable row level security;
drop policy if exists the_bo_quyen_doc on public.the_bo_quyen;
create policy the_bo_quyen_doc on public.the_bo_quyen for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
drop policy if exists the_bo_quyen_them on public.the_bo_quyen;
create policy the_bo_quyen_them on public.the_bo_quyen for insert to authenticated with check (public.is_teacher());
drop policy if exists the_bo_quyen_xoa on public.the_bo_quyen;
create policy the_bo_quyen_xoa on public.the_bo_quyen for delete to authenticated using (public.is_teacher());
revoke all on public.the_bo_quyen from anon;
grant select, insert, delete on public.the_bo_quyen to authenticated;

/* Ai được mở thẻ của một bộ. */
create or replace function public.co_quyen_bo(p_bo uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_teacher() or exists (
    select 1 from public.the_bo b
     where b.id = p_bo and b.cong_khai
       and (not b.tra_phi
            or public.la_vip((select auth.uid()))
            or exists (select 1 from public.the_bo_quyen q where q.bo_id = b.id and q.user_id = (select auth.uid()))));
$$;
revoke all on function public.co_quyen_bo(uuid) from public, anon;
grant execute on function public.co_quyen_bo(uuid) to authenticated;

/* Thẻ: chỉ đọc khi có quyền với bộ. Danh sách BỘ vẫn thấy (để hiện ổ khoá + giá). */
drop policy if exists the_bo_the_doc on public.the_bo_the;
create policy the_bo_the_doc on public.the_bo_the for select to authenticated
  using (public.co_quyen_bo(bo_id));

/* hoc_bo: thay phép kiểm cũ (cong_khai or is_teacher) bằng co_quyen_bo. */
do $$
declare d text;
begin
  d := pg_get_functiondef('public.hoc_bo(uuid)'::regprocedure);
  if position('select (b.cong_khai or is_teacher()) into duoc' in d) = 0 then
    raise exception 'hoc_bo đã khác bản dự kiến, không vá được';
  end if;
  execute replace(d, 'select (b.cong_khai or is_teacher()) into duoc', 'select public.co_quyen_bo(b.id) into duoc');
end $$;

/* Thách đấu theo chủ đề: bỏ bộ trả phí; dùng nghĩa sai của giáo viên khi có. */
create or replace function public.ds_chu_de_thach_dau()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'ma', c.ma, 'nhom', c.nhom, 'ten_vi', c.ten_vi, 'ten_fr', c.ten_fr, 'ten_en', c.ten_en,
           'so_the', (select count(distinct lower(btrim(t.mat_truoc)))
                        from public.the_bo b join public.the_bo_the t on t.bo_id = b.id
                       where b.chu_de = c.ma and b.cong_khai and not b.tra_phi
                         and btrim(t.mat_truoc) <> '' and btrim(t.mat_sau) <> ''),
           'so_bo', (select count(*) from public.the_bo b where b.chu_de = c.ma and b.cong_khai and not b.tra_phi)
         ) order by c.ord), '[]'::jsonb)
    from public.chu_de_the c;
$$;

create or replace function public.tao_thach_dau_chu_de(p_doi_thu uuid, p_chu_de text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_de jsonb; v_id uuid;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_doi_thu = v_uid then raise exception 'KHONG_TU_THACH_MINH'; end if;
  if not exists (select 1 from public.follows f where f.follower_id = v_uid and f.following_id = p_doi_thu) then
    raise exception 'CHUA_THEO_DOI';
  end if;
  if not exists (select 1 from public.chu_de_the c where c.ma = p_chu_de) then
    raise exception 'CHU_DE_KHONG_TON_TAI';
  end if;
  if (select count(*) from public.thach_dau t
       where t.nguoi_thach = v_uid and t.created_at > now() - interval '24 hours') >= 10 then
    raise exception 'DAILY_LIMIT_REACHED';
  end if;

  with kho as (
    select distinct on (lower(btrim(t.mat_truoc))) t.id, t.mat_truoc, t.mat_sau, t.nhieu
      from public.the_bo b join public.the_bo_the t on t.bo_id = b.id
     where b.chu_de = p_chu_de and b.cong_khai and not b.tra_phi
       and btrim(t.mat_truoc) <> '' and btrim(t.mat_sau) <> ''
     order by lower(btrim(t.mat_truoc)), random()
  ), chon as (
    select s.*, row_number() over () as rn
      from (select * from kho order by random() limit 10) s
  )
  select jsonb_agg(jsonb_build_object(
           'the', c.id,
           'chieu', case when c.rn % 2 = 1 then 'nghia' else 'phap' end,
           'lua_chon', case
             /* Câu « nghĩa là gì » + giáo viên đã soạn đủ 3 nghĩa sai → dùng chúng. */
             when c.rn % 2 = 1 and coalesce(array_length(c.nhieu, 1), 0) = 3 then
               (select jsonb_agg(x.v order by random())
                  from (select c.id::text as v
                        union all select 'txt:' || n from unnest(c.nhieu) n) x)
             else
               (select jsonb_agg(x.id order by random())
                  from (select c.id as id
                        union all
                        (select o.id from kho o
                          where o.id <> c.id
                            and lower(o.mat_sau) <> lower(c.mat_sau)
                            and lower(o.mat_truoc) <> lower(c.mat_truoc)
                          order by random() limit 3)) x)
           end
         ) order by c.rn)
    into v_de from chon c;

  if v_de is null or jsonb_array_length(v_de) < 4 then raise exception 'BO_QUA_IT_THE'; end if;

  insert into public.thach_dau (nguoi_thach, doi_thu, bo_id, chu_de, de)
  values (v_uid, p_doi_thu, null, p_chu_de, v_de) returning id into v_id;
  return v_id;
end $$;

/* lay_de: phương án dạng 'txt:<chữ>' là nghĩa sai do giáo viên viết. */
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
         (select array_agg(case
                   when l.the_id like 'txt:%' then substr(l.the_id, 5)
                   when q.v->>'chieu' = 'nghia' then o.mat_sau else o.mat_truoc end order by l.ord)
            from jsonb_array_elements_text(q.v->'lua_chon') with ordinality l(the_id, ord)
            left join public.the_bo_the o on o.id::text = l.the_id)
    from jsonb_array_elements(r.de) with ordinality q(v, ord)
    join public.the_bo_the t on t.id::text = q.v->>'the'
   order by q.ord;
end $$;
notify pgrst, 'reload schema';
