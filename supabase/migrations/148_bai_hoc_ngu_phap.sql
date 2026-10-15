-- 148 · Tiến độ « Học ngữ pháp » (15/10, theo chủ dự án).
-- Nội dung bài học nằm trong mã nguồn (src/content/nguPhap); bảng này chỉ lưu
-- kết quả phần thực hành của từng người: điểm cao nhất, số lần làm.
-- Không policy ghi: đường ghi duy nhất là RPC ghi_bai_hoc (kiểm phạm vi điểm).
create table if not exists public.bai_hoc_ket_qua (
  user_id   uuid not null references auth.users(id) on delete cascade,
  ma_bai    text not null check (ma_bai ~ '^[a-z0-9-]{3,60}$'),
  diem      int not null check (diem >= 0),
  tong      int not null check (tong > 0 and tong <= 50),
  so_lan    int not null default 1,
  cap_nhat  timestamptz not null default now(),
  primary key (user_id, ma_bai)
);
alter table public.bai_hoc_ket_qua enable row level security;
drop policy if exists bai_hoc_ket_qua_doc on public.bai_hoc_ket_qua;
create policy bai_hoc_ket_qua_doc on public.bai_hoc_ket_qua for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke insert, update, delete on public.bai_hoc_ket_qua from anon, authenticated;

create or replace function public.ghi_bai_hoc(p_ma text, p_diem int, p_tong int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r public.bai_hoc_ket_qua;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_tong is null or p_tong < 1 or p_tong > 50 or p_diem is null or p_diem < 0 or p_diem > p_tong then
    raise exception 'SAI_DIEM' using errcode = '22023';
  end if;
  insert into public.bai_hoc_ket_qua (user_id, ma_bai, diem, tong) values (v_uid, p_ma, p_diem, p_tong)
  on conflict (user_id, ma_bai) do update
    set diem = greatest(bai_hoc_ket_qua.diem, excluded.diem), tong = excluded.tong,
        so_lan = bai_hoc_ket_qua.so_lan + 1, cap_nhat = now()
  returning * into r;
  return jsonb_build_object('ok', true, 'diem', r.diem, 'tong', r.tong, 'so_lan', r.so_lan);
end $$;
revoke all on function public.ghi_bai_hoc(text, int, int) from public, anon;
grant execute on function public.ghi_bai_hoc(text, int, int) to authenticated;
notify pgrst, 'reload schema';
