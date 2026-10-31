-- Đố vui nước Pháp: ván dở và hộ chiếu tem trên máy chủ (31/10, giai đoạn 5), theo khuôn 175.
--
-- Trò chạy ở trình duyệt nên máy chủ KHÔNG kiểm chứng được ván chơi. Dữ liệu ở đây chỉ để chơi tiếp
-- trên máy khác và giữ hộ chiếu; XP vẫn đi qua ghi_tro_choi với trần cũ. Vì vậy chỉ chặn giá trị vô
-- lý bằng CHECK. Huy hiệu vùng tính từ tem ở client, không lưu riêng.
--
-- Không có policy nào: đường đọc và ghi duy nhất là ba RPC dưới đây.

create table public.do_vui_van (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  van jsonb not null,
  cap_nhat timestamptz not null default now(),
  constraint do_vui_van_co_do check (pg_column_size(van) <= 32768)
);

create table public.do_vui_tem (
  user_id uuid not null references public.profiles(id) on delete cascade,
  noi text not null check (noi ~ '^[a-z-]{2,40}$'),
  diem int not null default 1 check (diem between 0 and 100),
  cap_nhat timestamptz not null default now(),
  primary key (user_id, noi)
);

alter table public.do_vui_van enable row level security;
alter table public.do_vui_tem enable row level security;
revoke all on public.do_vui_van, public.do_vui_tem from public, anon, authenticated;

create or replace function public.do_vui_doc()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  return jsonb_build_object(
    'uid', v_uid,
    'van', (select van from public.do_vui_van where user_id = v_uid),
    'tem', coalesce((select jsonb_object_agg(noi, diem) from public.do_vui_tem where user_id = v_uid), '{}'::jsonb));
end $$;

-- p_van null: xoá ván (Tour đã xong). Trả lại mốc luc để client đối chiếu.
create or replace function public.do_vui_luu(p_van jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_van is null or p_van = 'null'::jsonb then
    delete from public.do_vui_van where user_id = v_uid;
    return jsonb_build_object('luc', null);
  end if;
  if jsonb_typeof(p_van) <> 'object' then raise exception 'SAI_DU_LIEU' using errcode = '22023'; end if;
  insert into public.do_vui_van (user_id, van) values (v_uid, p_van)
  on conflict (user_id) do update set van = excluded.van, cap_nhat = now();
  return jsonb_build_object('luc', p_van->'luc');
end $$;

-- p_ds: [{ noi, diem }]. Tem chỉ tăng, gửi lại nhiều lần không sao: client đẩy tem trên máy lên mỗi khi thấy máy chủ thiếu.
create or replace function public.do_vui_tem_luu(p_ds jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r jsonb;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if jsonb_typeof(p_ds) is distinct from 'array' or jsonb_array_length(p_ds) > 60 then raise exception 'SAI_DU_LIEU' using errcode = '22023'; end if;
  for r in select * from jsonb_array_elements(p_ds) loop
    insert into public.do_vui_tem as t (user_id, noi, diem)
    values (v_uid, r->>'noi', (r->>'diem')::int)
    on conflict (user_id, noi) do update set diem = greatest(t.diem, excluded.diem), cap_nhat = now();
  end loop;
  return public.do_vui_doc();
end $$;

revoke all on function public.do_vui_doc(), public.do_vui_luu(jsonb), public.do_vui_tem_luu(jsonb) from public, anon;
grant execute on function public.do_vui_doc(), public.do_vui_luu(jsonb), public.do_vui_tem_luu(jsonb) to authenticated;
