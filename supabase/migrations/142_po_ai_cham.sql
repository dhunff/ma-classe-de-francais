-- 142 · Phần nói: AI CHẤM TỰ ĐỘNG như phần viết (14/10, theo chủ dự án).
-- Mở trang Kết quả thi → Edge Function cham-po (chinhThuc) chấm theo grille
-- chính thức và ghi điểm nếu MỌI tiêu chí có giá trị hợp lệ. Học sinh vẫn tự
-- chấm lại được (luu_po_tu_cham), khi đó điểm tự chấm thay điểm AI.
alter table public.po_cham add column if not exists nguon text check (nguon in ('ai', 'tu_cham'));
update public.po_cham set nguon = 'tu_cham' where diem is not null and nguon is null;

create or replace function public.luu_po_tu_cham(p_attempt uuid, p_bang jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_cap text; v_thang jsonb; k text; v numeric; v_tong numeric := 0;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  select cap into v_cap from po_cham where attempt_id = p_attempt and user_id = v_uid;
  if not found then raise exception 'KHONG_THAY_BAI_NOI' using errcode = '42501'; end if;
  v_thang := public._thang_po(v_cap);
  for k in select jsonb_object_keys(v_thang) loop
    begin v := (p_bang ->> k)::numeric; exception when others then v := null; end;
    if v is null or not (v_thang -> k) @> to_jsonb(v) then
      raise exception 'SAI_THANG:%', k using errcode = '22023';
    end if;
    v_tong := v_tong + v;
  end loop;
  update po_cham set tu_cham = (select jsonb_object_agg(key, (p_bang ->> key)::numeric) from jsonb_object_keys(v_thang) key),
                     diem = v_tong, nguon = 'tu_cham', cap_nhat = now()
   where attempt_id = p_attempt;
  return jsonb_build_object('ok', true, 'diem', v_tong, 'cap', v_cap);
end $$;
revoke all on function public.luu_po_tu_cham(uuid, jsonb) from public, anon;
grant execute on function public.luu_po_tu_cham(uuid, jsonb) to authenticated;
notify pgrst, 'reload schema';
