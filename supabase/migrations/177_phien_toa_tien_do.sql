-- Phiên toà ngữ pháp: phiên dở và lịch sử vụ án trên máy chủ (31/10, giai đoạn 5), theo khuôn 175.
--
-- Trò chạy ở trình duyệt nên máy chủ KHÔNG kiểm chứng được ván chơi. Dữ liệu ở đây chỉ để chơi tiếp
-- trên máy khác, mở khoá vụ và thống kê điều luật hay sai; XP vẫn đi qua ghi_tro_choi với trần cũ.
-- Mỗi phiên xong là một dòng, khoá theo mã do client sinh, nên gửi lại nhiều lần không bị cộng đôi.
-- Cấp bậc và điều luật đã mở tính từ các dòng này ở client, không lưu riêng.
--
-- Không có policy nào: đường đọc và ghi duy nhất là ba RPC dưới đây.

create table public.phien_toa_van (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  van jsonb not null,
  cap_nhat timestamptz not null default now(),
  constraint phien_toa_van_co_do check (pg_column_size(van) <= 32768)
);

create table public.phien_toa_lan (
  user_id uuid not null references public.profiles(id) on delete cascade,
  ma text not null check (length(ma) between 6 and 40),
  vu text not null check (vu ~ '^[a-z-]{2,40}$'),
  thang boolean not null default false,
  phieu int not null default 0 check (phieu between 0 and 7),
  diem int not null default 0 check (diem between 0 and 100000),
  tk jsonb not null default '{}'::jsonb,
  luc timestamptz not null default now(),
  primary key (user_id, ma),
  constraint phien_toa_lan_tk check (jsonb_typeof(tk) = 'object' and pg_column_size(tk) <= 4096)
);

alter table public.phien_toa_van enable row level security;
alter table public.phien_toa_lan enable row level security;
revoke all on public.phien_toa_van, public.phien_toa_lan from public, anon, authenticated;

create or replace function public.phien_toa_doc()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  return jsonb_build_object(
    'uid', v_uid,
    'van', (select van from public.phien_toa_van where user_id = v_uid),
    'vu', coalesce((select jsonb_object_agg(vu, jsonb_build_object('thang', t, 'phieu', p, 'diem', d, 'so_lan', n))
                      from (select vu, bool_or(thang) t, max(phieu) p, max(diem) d, count(*) n
                              from public.phien_toa_lan where user_id = v_uid group by vu) x), '{}'::jsonb),
    'tk', coalesce((select jsonb_object_agg(k, jsonb_build_object('dung', d, 'sai', s))
                      from (select e.key k, sum((e.value->>0)::int) d, sum((e.value->>1)::int) s
                              from public.phien_toa_lan l, jsonb_each(l.tk) e
                             where l.user_id = v_uid group by e.key) y), '{}'::jsonb));
end $$;

-- p_van null: xoá phiên dở. Trả lại mốc luc để client đối chiếu.
create or replace function public.phien_toa_luu(p_van jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_van is null or p_van = 'null'::jsonb then
    delete from public.phien_toa_van where user_id = v_uid;
    return jsonb_build_object('luc', null);
  end if;
  if jsonb_typeof(p_van) <> 'object' then raise exception 'SAI_DU_LIEU' using errcode = '22023'; end if;
  insert into public.phien_toa_van (user_id, van) values (v_uid, p_van)
  on conflict (user_id) do update set van = excluded.van, cap_nhat = now();
  return jsonb_build_object('luc', p_van->'luc');
end $$;

-- p_ds: [{ ma, vu, thang, phieu, diem, tk: { luat: [dung, sai] } }]. Mã đã có thì bỏ qua.
create or replace function public.phien_toa_ket_luu(p_ds jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r jsonb;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if jsonb_typeof(p_ds) is distinct from 'array' or jsonb_array_length(p_ds) > 30 then raise exception 'SAI_DU_LIEU' using errcode = '22023'; end if;
  for r in select * from jsonb_array_elements(p_ds) loop
    insert into public.phien_toa_lan (user_id, ma, vu, thang, phieu, diem, tk)
    values (v_uid, r->>'ma', r->>'vu', (r->>'thang')::boolean, (r->>'phieu')::int, (r->>'diem')::int, coalesce(r->'tk', '{}'::jsonb))
    on conflict (user_id, ma) do nothing;
  end loop;
  return public.phien_toa_doc();
end $$;

revoke all on function public.phien_toa_doc(), public.phien_toa_luu(jsonb), public.phien_toa_ket_luu(jsonb) from public, anon;
grant execute on function public.phien_toa_doc(), public.phien_toa_luu(jsonb), public.phien_toa_ket_luu(jsonb) to authenticated;
