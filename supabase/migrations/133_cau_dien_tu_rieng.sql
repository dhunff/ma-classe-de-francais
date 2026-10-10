-- 133 · « Nghe điền từ » có kho câu RIÊNG (10/10): loai = 'dien_tu'.
-- Trước đó dạng này dùng lại câu chép chính tả, học sinh gặp một câu hai lần.
alter table public.cau_luyen drop constraint if exists cau_luyen_loai_check;
alter table public.cau_luyen add constraint cau_luyen_loai_check check (loai in ('chinh_ta', 'phat_am', 'dien_tu'));

create or replace function public.ghi_chinh_ta(p_cau uuid, p_diem numeric, p_chu text, p_kieu text default 'chep')
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_kieu not in ('chep', 'dien_tu') then raise exception 'SAI_KIEU'; end if;
  -- chep → câu chinh_ta; dien_tu → câu dien_tu (kết quả cũ trên câu chinh_ta vẫn giữ).
  if not exists (select 1 from public.cau_luyen where id = p_cau and cong_khai
                 and loai = case p_kieu when 'chep' then 'chinh_ta' else 'dien_tu' end) then
    raise exception 'KHONG_THAY_CAU';
  end if;
  insert into public.cau_luyen_ket_qua (user_id, cau_id, diem, chu, kieu)
  values (v_uid, p_cau, least(1, greatest(0, coalesce(p_diem, 0))), left(coalesce(p_chu, ''), 600), p_kieu);
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.ghi_chinh_ta(uuid, numeric, text, text) from public, anon;
grant execute on function public.ghi_chinh_ta(uuid, numeric, text, text) to authenticated;
notify pgrst, 'reload schema';
