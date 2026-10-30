-- Thám tử Léon: tiến độ trên máy chủ, lựa chọn cốt truyện, bảng hạng nhóm (31/10, giai đoạn 6).
--
-- Trò chạy ở trình duyệt nên máy chủ KHÔNG kiểm chứng được người chơi có thật sự phá án. Điểm
-- ở đây chỉ để mở khoá và so với bạn bè, XP vẫn đi qua ghi_tro_choi với trần cũ. Vì vậy chỉ
-- chặn giá trị vô lý (diem 0–1000: tối đa thật là 800) chứ không kiểm thứ tự mở vụ.
--
-- Không có policy nào: đường đọc và ghi duy nhất là bốn RPC dưới đây.
-- Bảng hạng theo khuôn 105: chỉ mình + người mình theo dõi, KHÔNG xếp hạng toàn trường.

create table public.tham_tu_ket (
  user_id uuid not null references public.profiles(id) on delete cascade,
  vu_id text not null check (vu_id in ('croissant', 'valise', 'minou', 'tableau', 'marche', 'concert', 'lettres', 'chronique', 'kiosque')),
  diem int not null default 0 check (diem between 0 and 1000),
  hang text check (hang in ('S', 'A', 'B')),
  cac_ket text[] not null default '{}',
  cap_nhat timestamptz not null default now(),
  primary key (user_id, vu_id)
);

create table public.tham_tu_chon (
  user_id uuid not null references public.profiles(id) on delete cascade,
  ma text not null check (ma in ('bruno', 'marcel')),
  gt text not null,
  cap_nhat timestamptz not null default now(),
  primary key (user_id, ma),
  constraint tham_tu_chon_hop_le check ((ma = 'bruno' and gt in ('giup', 'bao')) or (ma = 'marcel' and gt in ('noi', 'giau')))
);

alter table public.tham_tu_ket enable row level security;
alter table public.tham_tu_chon enable row level security;
revoke all on public.tham_tu_ket, public.tham_tu_chon from public, anon, authenticated;

create or replace function public.tham_tu_doc()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  return jsonb_build_object(
    'vu', coalesce((select jsonb_object_agg(vu_id, jsonb_build_object('diem', diem, 'hang', hang, 'ket', to_jsonb(cac_ket))) from public.tham_tu_ket where user_id = v_uid), '{}'::jsonb),
    'chon', coalesce((select jsonb_object_agg(ma, gt) from public.tham_tu_chon where user_id = v_uid), '{}'::jsonb));
end $$;

-- p_ds: [{ vu, diem, hang, ket }]. Trả lại đúng trạng thái sau khi ghi để client đối chiếu.
-- Giữ điểm cao nhất và hạng tốt nhất; nhánh Marcel do máy chủ tự ghi vào kết của vụ cuối.
create or replace function public.tham_tu_luu(p_ds jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r jsonb; v_ket text[]; v_marcel text;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if jsonb_typeof(p_ds) is distinct from 'array' or jsonb_array_length(p_ds) > 9 then raise exception 'SAI_DU_LIEU' using errcode = '22023'; end if;
  select gt into v_marcel from public.tham_tu_chon where user_id = v_uid and ma = 'marcel';
  for r in select * from jsonb_array_elements(p_ds) loop
    v_ket := case when r->>'ket' in ('du', 'thieu') then array[r->>'ket'] else '{}' end;
    if r->>'vu' = 'kiosque' and v_marcel is not null then v_ket := v_ket || v_marcel; end if;
    insert into public.tham_tu_ket as k (user_id, vu_id, diem, hang, cac_ket)
    values (v_uid, r->>'vu', (r->>'diem')::int, nullif(r->>'hang', ''), v_ket)
    on conflict (user_id, vu_id) do update
      set diem = greatest(k.diem, excluded.diem),
          hang = case when 'S' in (k.hang, excluded.hang) then 'S' when 'A' in (k.hang, excluded.hang) then 'A' else coalesce(k.hang, excluded.hang) end,
          cac_ket = (select coalesce(array_agg(distinct x), '{}') from unnest(k.cac_ket || excluded.cac_ket) x),
          cap_nhat = now();
  end loop;
  return public.tham_tu_doc();
end $$;

create or replace function public.tham_tu_chon_luu(p_ma text, p_gt text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  insert into public.tham_tu_chon (user_id, ma, gt) values (v_uid, p_ma, p_gt)
  on conflict (user_id, ma) do update set gt = excluded.gt, cap_nhat = now();
  return public.tham_tu_doc();
end $$;

create or replace function public.tham_tu_bang_hang()
returns jsonb language sql stable security definer set search_path = public as $$
  with nhom as (
    select auth.uid() as id
    union
    select following_id from public.follows where follower_id = auth.uid()
  ), tong as (
    select n.id, coalesce(sum(k.diem), 0)::int as diem, count(k.vu_id)::int as so_vu, count(*) filter (where k.hang = 'S')::int as so_s
      from nhom n left join public.tham_tu_ket k on k.user_id = n.id
     group by n.id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'hang', x.hang, 'id', x.id, 'name', x.ten, 'username', x.username, 'avatar', x.avatar,
           'diem', x.diem, 'so_vu', x.so_vu, 'so_s', x.so_s, 'la_toi', x.id = auth.uid()
         ) order by x.hang, x.ten), '[]'::jsonb)
    from (
      select p.id, coalesce(nullif(p.display_name, ''), p.name) as ten, p.username, p.avatar, t.diem, t.so_vu, t.so_s,
             rank() over (order by t.diem desc) as hang
        from tong t join public.profiles p on p.id = t.id
    ) x
   where auth.uid() is not null;
$$;

revoke all on function public.tham_tu_doc(), public.tham_tu_luu(jsonb), public.tham_tu_chon_luu(text, text), public.tham_tu_bang_hang() from public, anon;
grant execute on function public.tham_tu_doc(), public.tham_tu_luu(jsonb), public.tham_tu_chon_luu(text, text), public.tham_tu_bang_hang() to authenticated;
