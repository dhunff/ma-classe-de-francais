-- 131 · Luyện « Nghe & Nói » (10/10): chép chính tả + luyện phát âm.
--
-- cau_luyen: kho câu tiếng Pháp theo trình độ. Audio là GIỌNG TỔNG HỢP (OpenAI
-- TTS qua tao-audio), giao diện phải ghi rõ, không gọi là audio bản xứ.
-- cau_luyen_ket_qua: mỗi lần làm một dòng (điểm 0..1) để hiện tiến độ.
--   · chép chính tả: trình duyệt so từng từ rồi ghi qua RPC ghi_chinh_ta
--     (không có XP, nên tự chấm ở trình duyệt là đủ; máy chủ kẹp điểm 0..1);
--   · phát âm: chỉ Edge Function cham-phat-am ghi (service_role), sau khi AI
--     chép lại bản ghi âm. Bản ghi âm KHÔNG được lưu.

create table if not exists public.cau_luyen (
  id         uuid primary key default gen_random_uuid(),
  loai       text not null check (loai in ('chinh_ta', 'phat_am')),
  cap        text not null check (cap in ('A1', 'A2', 'B1', 'B2', 'C1')),
  ma         text not null unique,           -- tên file audio, ví dụ ct-a1-01
  cau        text not null,
  nghia      text,
  meo        text,                           -- mẹo phát âm (chỉ bài phát âm)
  audio_url  text,
  ord        int  not null default 0,
  cong_khai  boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.cau_luyen enable row level security;
drop policy if exists cau_luyen_doc on public.cau_luyen;
create policy cau_luyen_doc on public.cau_luyen for select to authenticated using (cong_khai or public.is_teacher());
drop policy if exists cau_luyen_sua on public.cau_luyen;
create policy cau_luyen_sua on public.cau_luyen for update to authenticated using (public.is_teacher()) with check (public.is_teacher());
revoke all on public.cau_luyen from anon;
grant select, update on public.cau_luyen to authenticated;

create table if not exists public.cau_luyen_ket_qua (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  cau_id     uuid not null references public.cau_luyen(id) on delete cascade,
  diem       numeric(4,3) not null check (diem between 0 and 1),
  chu        text,                           -- chữ học sinh gõ / chữ AI nghe ra
  created_at timestamptz not null default now()
);
create index if not exists cau_luyen_kq_user on public.cau_luyen_ket_qua (user_id, created_at desc);
alter table public.cau_luyen_ket_qua enable row level security;
drop policy if exists cau_luyen_kq_doc on public.cau_luyen_ket_qua;
create policy cau_luyen_kq_doc on public.cau_luyen_ket_qua for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke all on public.cau_luyen_ket_qua from anon;
revoke insert, update, delete on public.cau_luyen_ket_qua from authenticated;
grant select on public.cau_luyen_ket_qua to authenticated;

create or replace function public.ghi_chinh_ta(p_cau uuid, p_diem numeric, p_chu text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if not exists (select 1 from public.cau_luyen where id = p_cau and loai = 'chinh_ta' and cong_khai) then
    raise exception 'KHONG_THAY_CAU';
  end if;
  insert into public.cau_luyen_ket_qua (user_id, cau_id, diem, chu)
  values (v_uid, p_cau, least(1, greatest(0, coalesce(p_diem, 0))), left(coalesce(p_chu, ''), 600));
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.ghi_chinh_ta(uuid, numeric, text) from public, anon;
grant execute on function public.ghi_chinh_ta(uuid, numeric, text) to authenticated;
notify pgrst, 'reload schema';
