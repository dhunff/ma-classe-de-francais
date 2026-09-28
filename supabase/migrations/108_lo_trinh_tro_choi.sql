-- LỘ TRÌNH DẠNG GAME (28/09) — kết quả màn chơi dựng từ bộ flashcard.
--
-- Mỗi màn là một bộ thẻ công khai (the_bo) hoặc « trùm » cuối chương kỹ năng
-- (bo_id null, ky_nang đặt). Giữ SAO TỐT NHẤT, không giữ lịch sử từng lượt.
--
-- KHÔNG cộng XP ở đây: kết quả do client báo lên, nên cho nó sinh XP là mời
-- người ta gọi RPC để cày điểm. Sao chỉ mở màn kế tiếp của CHÍNH người đó.
-- Không policy ghi — đường ghi duy nhất là RPC ghi_ket_qua_man.

create table if not exists public.lo_trinh_ket_qua (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  ma_man     text not null check (ma_man ~ '^(bo:[0-9a-f-]{36}|trum:(CO|CE|PE|PO))$'),
  sao        smallint not null check (sao between 0 and 3),
  lan_choi   int not null default 1,
  cap_nhat   timestamptz not null default now(),
  primary key (user_id, ma_man)
);

alter table public.lo_trinh_ket_qua enable row level security;
drop policy if exists lo_trinh_ket_qua_doc on public.lo_trinh_ket_qua;
create policy lo_trinh_ket_qua_doc on public.lo_trinh_ket_qua for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke all on public.lo_trinh_ket_qua from anon;
revoke insert, update, delete, truncate on public.lo_trinh_ket_qua from authenticated;

create or replace function public.ghi_ket_qua_man(p_ma_man text, p_sao int)
returns table (ma_man text, sao smallint, lan_choi int)
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_sao is null or p_sao < 0 or p_sao > 3 then raise exception 'SAO_KHONG_HOP_LE'; end if;
  return query
  insert into public.lo_trinh_ket_qua as k (user_id, ma_man, sao)
  values (v_uid, p_ma_man, p_sao)
  on conflict (user_id, ma_man) do update
    set sao = greatest(k.sao, excluded.sao), lan_choi = k.lan_choi + 1, cap_nhat = now()
  returning k.ma_man, k.sao, k.lan_choi;
end $$;

revoke all on function public.ghi_ket_qua_man(text, int) from public, anon;
grant execute on function public.ghi_ket_qua_man(text, int) to authenticated;
