-- 132 · « Nghe điền từ » (10/10): dùng lại câu chép chính tả, ẩn vài từ để điền.
-- Kết quả ghi chung bảng cau_luyen_ket_qua, phân biệt bằng cột kieu.
alter table public.cau_luyen_ket_qua add column if not exists kieu text not null default 'chep'
  check (kieu in ('chep', 'dien_tu', 'phat_am'));
update public.cau_luyen_ket_qua k set kieu = 'phat_am'
  from public.cau_luyen c where c.id = k.cau_id and c.loai = 'phat_am' and k.kieu = 'chep';

create or replace function public.ghi_chinh_ta(p_cau uuid, p_diem numeric, p_chu text, p_kieu text default 'chep')
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_kieu not in ('chep', 'dien_tu') then raise exception 'SAI_KIEU'; end if;
  if not exists (select 1 from public.cau_luyen where id = p_cau and loai = 'chinh_ta' and cong_khai) then
    raise exception 'KHONG_THAY_CAU';
  end if;
  insert into public.cau_luyen_ket_qua (user_id, cau_id, diem, chu, kieu)
  values (v_uid, p_cau, least(1, greatest(0, coalesce(p_diem, 0))), left(coalesce(p_chu, ''), 600), p_kieu);
  return jsonb_build_object('ok', true);
end $$;
drop function if exists public.ghi_chinh_ta(uuid, numeric, text);
revoke all on function public.ghi_chinh_ta(uuid, numeric, text, text) from public, anon;
grant execute on function public.ghi_chinh_ta(uuid, numeric, text, text) to authenticated;
notify pgrst, 'reload schema';
