-- 124 (08/10): VIP còn hạn KHÔNG bị giới hạn lượt thi thử (120). Hai giới
-- hạn AI (cham-pe gợi ý, nhan-xet-noi) miễn ở Edge Function bằng cùng hàm này.
-- Giới hạn LƯỢT NGHE trong bài thi (024/119) GIỮ NGUYÊN: đó là luật phòng thi,
-- không phải hạn mức sử dụng.
create or replace function public.la_vip(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select vip_den > now() from public.profiles where id = p_user), false);
$$;
revoke all on function public.la_vip(uuid) from public, anon, authenticated;

create or replace function public.luot_thi_hom_nay()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'gioi_han', 2,
    'da_dung', (select count(*) from public.luot_thi where user_id = (select auth.uid()) and ngay = public._ngay_vn()),
    'khong_gioi_han', public.is_teacher() or public.la_vip((select auth.uid())),
    'vip', public.la_vip((select auth.uid())));
$$;

create or replace function public.bat_dau_thi(p_exam_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); da int; v uuid;
begin
  if u is null then return jsonb_build_object('ok', false, 'ma', 'CHUA_DANG_NHAP'); end if;
  perform pg_advisory_xact_lock(hashtext('luot_thi:' || u::text));
  select count(*) into da from public.luot_thi where user_id = u and ngay = public._ngay_vn();
  if da >= 2 and not public.is_teacher() and not public.la_vip(u) then
    return jsonb_build_object('ok', false, 'ma', 'HET_LUOT', 'da_dung', da, 'gioi_han', 2);
  end if;
  update public.luot_thi set trang_thai = 'bo_do', ket_thuc = now() where user_id = u and trang_thai = 'dang_lam';
  insert into public.luot_thi (user_id, exam_id, ngay) values (u, p_exam_id, public._ngay_vn()) returning id into v;
  return jsonb_build_object('ok', true, 'luot_id', v, 'da_dung', da + 1, 'gioi_han', 2);
end $$;

-- Cho client biết mình có đang VIP (huy hiệu trên avatar).
create or replace function public.toi_la_vip()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('vip', public.la_vip((select auth.uid())),
    'vip_den', (select vip_den from public.profiles where id = (select auth.uid())));
$$;
revoke all on function public.toi_la_vip() from public, anon;
grant execute on function public.toi_la_vip() to authenticated;
