-- 149 · « Học ngữ pháp »: báo lỗi câu luyện + ôn lại câu sai (16/10, theo chủ dự án).
--
-- 1. ngu_phap_bao_loi: học sinh / giáo viên báo một câu luyện sai đề, sai đáp án,
--    lời giải khó hiểu. Giáo viên đọc và đánh dấu đã xử lý. Nội dung câu nằm trong
--    mã nguồn, nên bảng lưu NGUYÊN VĂN đề câu (cau) để giáo viên tìm lại được.
-- 2. ngu_phap_cau_sai: câu ngữ pháp một người từng làm sai, kèm lịch ôn giãn cách
--    (sai → ôn ngay; đúng → khoảng cách gấp đôi, tối đa 60 ngày). « Ngày » là ngày
--    của người dùng, máy chủ chặn ±1 ngày (như ghi_hoat_dong).
-- Không policy ghi trên cả hai bảng: đường ghi duy nhất là RPC bên dưới.

create table if not exists public.ngu_phap_bao_loi (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  ma_bai     text not null check (ma_bai ~ '^[a-z0-9-]{3,60}$'),
  cau        text not null check (char_length(cau) between 1 and 600),
  ghi_chu    text not null default '' check (char_length(ghi_chu) <= 1000),
  tao_luc    timestamptz not null default now(),
  da_xu_ly   boolean not null default false,
  xu_ly_luc  timestamptz
);
create index if not exists ngu_phap_bao_loi_mo on public.ngu_phap_bao_loi (da_xu_ly, tao_luc desc);
alter table public.ngu_phap_bao_loi enable row level security;
drop policy if exists ngu_phap_bao_loi_doc on public.ngu_phap_bao_loi;
create policy ngu_phap_bao_loi_doc on public.ngu_phap_bao_loi for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke insert, update, delete on public.ngu_phap_bao_loi from anon, authenticated;
revoke select on public.ngu_phap_bao_loi from anon;

create or replace function public.bao_loi_ngu_phap(p_ma text, p_cau text, p_ghi_chu text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id bigint;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_ma is null or p_ma !~ '^[a-z0-9-]{3,60}$' or coalesce(char_length(p_cau), 0) not between 1 and 600
     or char_length(coalesce(p_ghi_chu, '')) > 1000 then
    raise exception 'SAI_DU_LIEU' using errcode = '22023';
  end if;
  -- Chặn lũ: 20 báo cáo / 24 giờ trượt mỗi người.
  if (select count(*) from public.ngu_phap_bao_loi where user_id = v_uid and tao_luc > now() - interval '24 hours') >= 20 then
    raise exception 'HET_LUOT_BAO_LOI' using errcode = 'P0001';
  end if;
  insert into public.ngu_phap_bao_loi (user_id, ma_bai, cau, ghi_chu)
  values (v_uid, p_ma, p_cau, coalesce(p_ghi_chu, '')) returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;
revoke all on function public.bao_loi_ngu_phap(text, text, text) from public, anon;
grant execute on function public.bao_loi_ngu_phap(text, text, text) to authenticated;

create or replace function public.xu_ly_bao_loi_ngu_phap(p_id bigint, p_xong boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public.is_teacher() then raise exception 'CHI_GIAO_VIEN' using errcode = '42501'; end if;
  update public.ngu_phap_bao_loi set da_xu_ly = p_xong, xu_ly_luc = case when p_xong then now() end where id = p_id;
  get diagnostics n = row_count;
  return jsonb_build_object('ok', n = 1, 'so_dong', n);
end $$;
revoke all on function public.xu_ly_bao_loi_ngu_phap(bigint, boolean) from public, anon;
grant execute on function public.xu_ly_bao_loi_ngu_phap(bigint, boolean) to authenticated;

create table if not exists public.ngu_phap_cau_sai (
  user_id      uuid not null references auth.users(id) on delete cascade,
  ma_bai       text not null check (ma_bai ~ '^[a-z0-9-]{3,60}$'),
  cau          text not null check (char_length(cau) between 1 and 600),
  lan_sai      int not null default 1 check (lan_sai >= 0),
  khoang_ngay  int not null default 0 check (khoang_ngay between 0 and 60),
  han          date not null,
  cap_nhat     timestamptz not null default now(),
  primary key (user_id, ma_bai, cau)
);
create index if not exists ngu_phap_cau_sai_han on public.ngu_phap_cau_sai (user_id, han);
alter table public.ngu_phap_cau_sai enable row level security;
drop policy if exists ngu_phap_cau_sai_doc on public.ngu_phap_cau_sai;
create policy ngu_phap_cau_sai_doc on public.ngu_phap_cau_sai for select to authenticated
  using (user_id = (select auth.uid()));
revoke insert, update, delete on public.ngu_phap_cau_sai from anon, authenticated;
revoke select on public.ngu_phap_cau_sai from anon;

-- Ghi một lần trả lời. Sai: tạo / đặt lại về ôn ngay hôm nay. Đúng: chỉ cập nhật
-- câu ĐÃ có trong danh sách (khoảng 0 → 1 → 2 → 4 … ≤ 60 ngày). Trả biên nhận.
create or replace function public.ghi_cau_ngu_phap(p_ma text, p_cau text, p_dung boolean, p_ngay date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r public.ngu_phap_cau_sai;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_ma is null or p_ma !~ '^[a-z0-9-]{3,60}$' or coalesce(char_length(p_cau), 0) not between 1 and 600 or p_dung is null then
    raise exception 'SAI_DU_LIEU' using errcode = '22023';
  end if;
  if p_ngay is null or p_ngay < current_date - 1 or p_ngay > current_date + 1 then
    raise exception 'SAI_NGAY' using errcode = '22023';
  end if;
  if not p_dung then
    insert into public.ngu_phap_cau_sai (user_id, ma_bai, cau, lan_sai, khoang_ngay, han)
    values (v_uid, p_ma, p_cau, 1, 0, p_ngay)
    on conflict (user_id, ma_bai, cau) do update
      set lan_sai = ngu_phap_cau_sai.lan_sai + 1, khoang_ngay = 0, han = p_ngay, cap_nhat = now()
    returning * into r;
  else
    update public.ngu_phap_cau_sai
      set khoang_ngay = least(60, greatest(1, khoang_ngay * 2)),
          han = p_ngay + least(60, greatest(1, khoang_ngay * 2)), cap_nhat = now()
      where user_id = v_uid and ma_bai = p_ma and cau = p_cau
      returning * into r;
  end if;
  return jsonb_build_object('ok', true, 'co_dong', r.user_id is not null, 'han', r.han, 'khoang', r.khoang_ngay);
end $$;
revoke all on function public.ghi_cau_ngu_phap(text, text, boolean, date) from public, anon;
grant execute on function public.ghi_cau_ngu_phap(text, text, boolean, date) to authenticated;

notify pgrst, 'reload schema';
