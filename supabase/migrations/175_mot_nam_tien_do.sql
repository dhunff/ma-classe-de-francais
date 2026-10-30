-- Một năm ở Paris: ván chơi trên máy chủ, kết cục, kỷ lục, bảng bạn bè (31/10, giai đoạn 6).
--
-- Trò chạy ở trình duyệt nên máy chủ KHÔNG kiểm chứng được ván chơi. Dữ liệu ở đây chỉ để chơi tiếp
-- trên máy khác, mở thành tích và so với bạn bè; XP vẫn đi qua ghi_tro_choi với trần cũ. Vì vậy chỉ
-- chặn giá trị vô lý bằng CHECK. Thêm kết cục mới thì phải sửa CHECK của mot_nam_ket.ma.
--
-- Không có policy nào: đường đọc và ghi duy nhất là bốn RPC dưới đây.
-- Bảng bạn bè theo khuôn 105: chỉ mình + người mình theo dõi, KHÔNG xếp hạng toàn trường.

create table public.mot_nam_van (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  van jsonb not null,
  cap_nhat timestamptz not null default now(),
  constraint mot_nam_van_co_do check (pg_column_size(van) <= 32768)
);

create table public.mot_nam_ket (
  user_id uuid not null references public.profiles(id) on delete cascade,
  ma text not null check (ma in ('olai', 'hoc', 've', 'di', 'nha')),
  ban text not null check (ban in ('dat', 'do')),
  so_lan int not null default 1 check (so_lan >= 0),
  nam_cuoi text not null default '',
  noi int not null default 0 check (noi between 0 and 100),
  anh int not null default 0 check (anh between 0 and 100),
  cau int not null default 0 check (cau between 0 and 1000),
  ngu int not null default 0 check (ngu between 0 and 100),
  tien int not null default 0 check (tien between 0 and 1000000),
  than_nhat int not null default 0 check (than_nhat between 0 and 5),
  vay int check (vay between 0 and 12),
  cap_nhat timestamptz not null default now(),
  primary key (user_id, ma)
);

alter table public.mot_nam_van enable row level security;
alter table public.mot_nam_ket enable row level security;
revoke all on public.mot_nam_van, public.mot_nam_ket from public, anon, authenticated;

create or replace function public.mot_nam_doc()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  return jsonb_build_object(
    'uid', v_uid,
    'van', (select van from public.mot_nam_van where user_id = v_uid),
    'ket', coalesce((select jsonb_object_agg(ma, jsonb_build_object('ban', ban, 'so_lan', so_lan, 'noi', noi, 'anh', anh, 'cau', cau, 'ngu', ngu, 'tien', tien, 'than', than_nhat, 'vay', vay))
                       from public.mot_nam_ket where user_id = v_uid), '{}'::jsonb));
end $$;

-- p_van null: xoá ván (người chơi bắt đầu lại hoặc đã xong năm). Trả lại mốc luc để client đối chiếu.
create or replace function public.mot_nam_luu(p_van jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_van is null or p_van = 'null'::jsonb then
    delete from public.mot_nam_van where user_id = v_uid;
    return jsonb_build_object('luc', null);
  end if;
  if jsonb_typeof(p_van) <> 'object' then raise exception 'SAI_DU_LIEU' using errcode = '22023'; end if;
  insert into public.mot_nam_van (user_id, van) values (v_uid, p_van)
  on conflict (user_id) do update set van = excluded.van, cap_nhat = now();
  return jsonb_build_object('luc', p_van->'luc');
end $$;

-- p_ds: [{ ma, ban, nam, noi, anh, cau, ngu, tien, than, vay }]. Bản trọn vẹn không bị bản dở dang đè;
-- kỷ lục chỉ tăng (vay chỉ giảm). so_lan đếm mỗi năm chơi một lần: cùng mã nam gửi lại thì không cộng.
create or replace function public.mot_nam_ket_luu(p_ds jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r jsonb;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if jsonb_typeof(p_ds) is distinct from 'array' or jsonb_array_length(p_ds) > 20 then raise exception 'SAI_DU_LIEU' using errcode = '22023'; end if;
  for r in select * from jsonb_array_elements(p_ds) loop
    insert into public.mot_nam_ket as k (user_id, ma, ban, nam_cuoi, noi, anh, cau, ngu, tien, than_nhat, vay)
    values (v_uid, r->>'ma', r->>'ban', coalesce(r->>'nam', ''), (r->>'noi')::int, (r->>'anh')::int, (r->>'cau')::int, (r->>'ngu')::int, (r->>'tien')::int, (r->>'than')::int, (r->>'vay')::int)
    on conflict (user_id, ma) do update
      set ban = case when 'dat' in (k.ban, excluded.ban) then 'dat' else 'do' end,
          so_lan = k.so_lan + case when excluded.nam_cuoi = k.nam_cuoi then 0 else 1 end,
          nam_cuoi = excluded.nam_cuoi,
          noi = greatest(k.noi, excluded.noi), anh = greatest(k.anh, excluded.anh), cau = greatest(k.cau, excluded.cau),
          ngu = greatest(k.ngu, excluded.ngu), tien = greatest(k.tien, excluded.tien),
          than_nhat = greatest(k.than_nhat, excluded.than_nhat), vay = least(k.vay, excluded.vay),
          cap_nhat = now();
  end loop;
  return public.mot_nam_doc();
end $$;

create or replace function public.mot_nam_bang_ban()
returns jsonb language sql stable security definer set search_path = public as $$
  with nhom as (
    select auth.uid() as id
    union
    select following_id from public.follows where follower_id = auth.uid()
  ), tong as (
    select n.id, count(k.ma)::int as so_ket, count(*) filter (where k.ban = 'dat')::int as so_dat, coalesce(sum(k.so_lan), 0)::int as so_nam
      from nhom n left join public.mot_nam_ket k on k.user_id = n.id
     group by n.id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'hang', x.hang, 'id', x.id, 'name', x.ten, 'avatar', x.avatar,
           'so_ket', x.so_ket, 'so_dat', x.so_dat, 'so_nam', x.so_nam, 'la_toi', x.id = auth.uid()
         ) order by x.hang, x.ten), '[]'::jsonb)
    from (
      select p.id, coalesce(nullif(p.display_name, ''), p.name) as ten, p.avatar, t.so_ket, t.so_dat, t.so_nam,
             rank() over (order by t.so_dat desc, t.so_ket desc) as hang
        from tong t join public.profiles p on p.id = t.id
    ) x
   where auth.uid() is not null;
$$;

revoke all on function public.mot_nam_doc(), public.mot_nam_luu(jsonb), public.mot_nam_ket_luu(jsonb), public.mot_nam_bang_ban() from public, anon;
grant execute on function public.mot_nam_doc(), public.mot_nam_luu(jsonb), public.mot_nam_ket_luu(jsonb), public.mot_nam_bang_ban() to authenticated;
