-- Thám tử Léon mùa 2 (31/10): sáu mã vụ mới, và nới giới hạn một lượt gửi từ 9 lên 15 hồ sơ
-- (người chơi cũ có thể phải gửi cả 15 vụ từ máy lên trong một lần).

alter table public.tham_tu_ket drop constraint tham_tu_ket_vu_id_check;
alter table public.tham_tu_ket add constraint tham_tu_ket_vu_id_check check (vu_id in (
  'croissant', 'valise', 'minou', 'tableau', 'marche', 'concert', 'lettres', 'chronique', 'kiosque',
  'recette', 'biblio', 'collier', 'librairie', 'editions', 'chapitre'));

create or replace function public.tham_tu_luu(p_ds jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r jsonb; v_ket text[]; v_marcel text;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if jsonb_typeof(p_ds) is distinct from 'array' or jsonb_array_length(p_ds) > 15 then raise exception 'SAI_DU_LIEU' using errcode = '22023'; end if;
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
