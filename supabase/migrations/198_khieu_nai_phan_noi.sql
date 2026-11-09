-- 198 · Khiếu nại điểm AI phần NÓI thi thử (09/11, giai đoạn 5 chấm AI chuyên sâu).
--
-- Như 196 cho phần viết, nhưng phần nói lưu theo LƯỢT THI ở po_cham (một dòng mỗi attempt), nên
-- khiếu nại cũng khoá theo attempt_id. Chỉ khiếu nại được phiếu CÓ gợi ý AI (po_cham.ai_goi_y).
-- Giáo viên nghe lại bản ghi (policy bai_noi_giao_vien_doc đã có), đọc bản chép lời, rồi:
--   · giu_nguyen   : điểm AI đúng;
--   · da_cham_lai  : chấm lại từng tiêu chí, CHỈ nhận giá trị có trên grille (_thang_po), và điểm
--                    giáo viên thay điểm phần nói (po_cham.tu_cham/diem, nguon = 'giao_vien').
--
-- Không ai ghi thẳng vào bảng: mọi thay đổi đi qua RPC security definer bên dưới.

alter table public.po_cham drop constraint if exists po_cham_nguon_check;
alter table public.po_cham add constraint po_cham_nguon_check check (nguon in ('ai', 'tu_cham', 'giao_vien'));

create table if not exists public.po_khieu_nai (
  attempt_id  uuid primary key references public.po_cham(attempt_id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  ly_do       text not null check (char_length(ly_do) between 5 and 1000),
  tieu_chi    text[] not null default '{}',
  trang_thai  text not null default 'cho' check (trang_thai in ('cho', 'giu_nguyen', 'da_cham_lai')),
  diem_ai     jsonb,          -- điểm AI lúc gửi khiếu nại, để bộ hiệu chỉnh so được về sau
  diem_gv     jsonb,
  tong_gv     numeric,
  ghi_chu_gv  text not null default '' check (char_length(ghi_chu_gv) <= 1000),
  tao_luc     timestamptz not null default now(),
  xu_ly_luc   timestamptz,
  xu_ly_boi   uuid references auth.users(id) on delete set null
);
create index if not exists po_khieu_nai_trang_thai on public.po_khieu_nai (trang_thai, tao_luc desc);
create index if not exists po_khieu_nai_user on public.po_khieu_nai (user_id, tao_luc desc);

alter table public.po_khieu_nai enable row level security;
drop policy if exists po_khieu_nai_doc on public.po_khieu_nai;
create policy po_khieu_nai_doc on public.po_khieu_nai for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke all on public.po_khieu_nai from anon;
revoke insert, update, delete on public.po_khieu_nai from authenticated;
grant select on public.po_khieu_nai to authenticated;

-- ── Học sinh gửi ──
create or replace function public.gui_khieu_nai_po(p_attempt uuid, p_ly_do text, p_tieu_chi text[] default '{}')
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); pc record;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if coalesce(char_length(trim(p_ly_do)), 0) not between 5 and 1000
     or coalesce(array_length(p_tieu_chi, 1), 0) > 15 then
    raise exception 'SAI_DU_LIEU' using errcode = '22023';
  end if;
  select attempt_id, user_id, ai_goi_y into pc from public.po_cham where attempt_id = p_attempt;
  if not found or pc.user_id <> v_uid or pc.ai_goi_y is null then
    raise exception 'KHONG_THAY_PHIEU' using errcode = '42501';
  end if;
  if exists (select 1 from public.po_khieu_nai where attempt_id = p_attempt) then
    return jsonb_build_object('ok', true, 'da_co', true);
  end if;
  if (select count(*) from public.po_khieu_nai where user_id = v_uid and tao_luc > now() - interval '24 hours') >= 5 then
    raise exception 'HET_LUOT_KHIEU_NAI' using errcode = 'P0001';
  end if;
  insert into public.po_khieu_nai (attempt_id, user_id, ly_do, tieu_chi, diem_ai)
  values (p_attempt, v_uid, trim(p_ly_do), coalesce(p_tieu_chi, '{}'), pc.ai_goi_y -> 'diem');
  return jsonb_build_object('ok', true, 'da_co', false);
end $$;
revoke all on function public.gui_khieu_nai_po(uuid, text, text[]) from public, anon;
grant execute on function public.gui_khieu_nai_po(uuid, text, text[]) to authenticated;

-- ── Giáo viên: danh sách kèm phiếu AI, đề đã bốc, đường dẫn bản ghi ──
create or replace function public.ds_khieu_nai_po()
returns table (
  attempt_id uuid, trang_thai text, ly_do text, tieu_chi text[], tao_luc timestamptz,
  diem_ai jsonb, diem_gv jsonb, tong_gv numeric, ghi_chu_gv text, xu_ly_luc timestamptz,
  cap text, tu_cham jsonb, diem numeric, nguon text, ai_goi_y jsonb, de_boc jsonb,
  user_id uuid, exam_id uuid, tieu_de text, hoc_sinh text
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'CHI_GIAO_VIEN' using errcode = '42501'; end if;
  return query
  select k.attempt_id, k.trang_thai, k.ly_do, k.tieu_chi, k.tao_luc,
         k.diem_ai, k.diem_gv, k.tong_gv, k.ghi_chu_gv, k.xu_ly_luc,
         pc.cap, pc.tu_cham, pc.diem, pc.nguon, pc.ai_goi_y, pc.de_boc,
         k.user_id, t.exam_id, coalesce(ex.title, e.title),
         coalesce(nullif(p.display_name, ''), nullif(p.name, ''), p.email)
    from public.po_khieu_nai k
    join public.po_cham pc on pc.attempt_id = k.attempt_id
    join public.attempts t on t.id = k.attempt_id
    left join public.exams ex on ex.id = t.exam_id
    left join public.exercises e on e.id = t.exercise_id
    left join public.profiles p on p.id = k.user_id
   order by (k.trang_thai = 'cho') desc, k.tao_luc desc
   limit 300;
end $$;
revoke all on function public.ds_khieu_nai_po() from public, anon;
grant execute on function public.ds_khieu_nai_po() to authenticated;

-- ── Giáo viên xử lý ──
-- da_cham_lai: p_diem phải có ĐỦ mọi tiêu chí của grille trình độ đó, mỗi giá trị đúng một mức in
-- trên tờ grille (cùng phép kiểm với luu_po_tu_cham). Điểm giáo viên thay điểm phần nói.
create or replace function public.xu_ly_khieu_nai_po(
  p_attempt uuid, p_trang_thai text, p_diem jsonb default null, p_ghi_chu text default ''
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_cap text; v_thang jsonb; k text; v numeric; v_tong numeric := 0;
begin
  if not public.is_teacher() then raise exception 'CHI_GIAO_VIEN' using errcode = '42501'; end if;
  if p_trang_thai not in ('cho', 'giu_nguyen', 'da_cham_lai') or char_length(coalesce(p_ghi_chu, '')) > 1000 then
    raise exception 'SAI_DU_LIEU' using errcode = '22023';
  end if;
  perform 1 from public.po_khieu_nai where attempt_id = p_attempt for update;
  if not found then raise exception 'KHONG_THAY' using errcode = 'P0002'; end if;

  if p_trang_thai = 'da_cham_lai' then
    select cap into v_cap from public.po_cham where attempt_id = p_attempt;
    v_thang := public._thang_po(v_cap);
    if v_thang is null then raise exception 'KHONG_CO_THANG' using errcode = '22023'; end if;
    for k in select jsonb_object_keys(v_thang) loop
      begin v := (p_diem ->> k)::numeric; exception when others then v := null; end;
      if v is null or not (v_thang -> k) @> to_jsonb(v) then
        raise exception 'SAI_THANG:%', k using errcode = '22023';
      end if;
      v_tong := v_tong + v;
    end loop;
  end if;

  update public.po_khieu_nai set
    trang_thai = p_trang_thai,
    diem_gv    = case when p_trang_thai = 'da_cham_lai' then (select jsonb_object_agg(key, (p_diem ->> key)::numeric) from jsonb_object_keys(v_thang) key) end,
    tong_gv    = case when p_trang_thai = 'da_cham_lai' then v_tong end,
    ghi_chu_gv = coalesce(p_ghi_chu, ''),
    xu_ly_luc  = case when p_trang_thai = 'cho' then null else now() end,
    xu_ly_boi  = case when p_trang_thai = 'cho' then null else auth.uid() end
  where attempt_id = p_attempt;

  if p_trang_thai = 'da_cham_lai' then
    update public.po_cham set
      tu_cham = (select jsonb_object_agg(key, (p_diem ->> key)::numeric) from jsonb_object_keys(v_thang) key),
      diem = v_tong, nguon = 'giao_vien', cap_nhat = now()
    where attempt_id = p_attempt;
  end if;

  return jsonb_build_object('ok', true, 'tong', case when p_trang_thai = 'da_cham_lai' then v_tong end);
end $$;
revoke all on function public.xu_ly_khieu_nai_po(uuid, text, jsonb, text) from public, anon;
grant execute on function public.xu_ly_khieu_nai_po(uuid, text, jsonb, text) to authenticated;

-- ── Tự chấm không đè điểm giáo viên ──
-- Trước 198 học sinh tự chấm lại thì điểm tự chấm thay điểm AI (đúng ý 142). Điểm giáo viên chấm
-- lại sau khiếu nại là chuyện khác: học sinh tự chấm đè lên thì khiếu nại mất nghĩa.
create or replace function public.luu_po_tu_cham(p_attempt uuid, p_bang jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_cap text; v_nguon text; v_thang jsonb; k text; v numeric; v_tong numeric := 0;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  select cap, nguon into v_cap, v_nguon from po_cham where attempt_id = p_attempt and user_id = v_uid;
  if not found then raise exception 'KHONG_THAY_BAI_NOI' using errcode = '42501'; end if;
  if v_nguon = 'giao_vien' then raise exception 'DA_CO_DIEM_GIAO_VIEN' using errcode = '42501'; end if;
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
