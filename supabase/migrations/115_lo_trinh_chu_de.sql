-- LỘ TRÌNH THEO CHỦ ĐỀ XÃ HỘI (06/10) — thay lộ trình theo kỹ năng (108–113).
--
-- Chủ dự án: lộ trình không xếp theo kỹ năng nữa mà theo 16 chủ đề nghị luận
-- xã hội, 100 màn. Màn không còn là một bộ flashcard của giáo viên mà là một
-- nhóm 8 mục từ có LOẠI TỪ, để phương án nhiễu luôn cùng loại với đáp án.
--
--   lo_trinh_chu_de  16 chủ đề (id dạng chữ, vd. 'moi-truong')
--   lo_trinh_man     100 màn, mỗi màn thuộc một chủ đề; giáo viên bật/tắt và
--                    đặt số câu ngay trên dòng này (thay lo_trinh_cau_hinh)
--   lo_trinh_tu      800 mục: fr, vi, loai (n/v/a/x/d)
--
-- Học sinh ĐỌC (đã đăng nhập), giáo viên GHI — ba policy ghi khai riêng, không
-- `for all` (CLAUDE.md: `for all` đè quyền đọc).
--
-- Kết quả vẫn ở lo_trinh_ket_qua; khoá màn đổi dạng:
--   'man:<id màn>'  và  'trum:<id chủ đề>'
-- Dòng cũ ('bo:…', 'trum:CO'…) GIỮ NGUYÊN — không xoá dữ liệu người học.

create table if not exists public.lo_trinh_chu_de (
  id      text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  ten_fr  text not null,
  ten_vi  text not null,
  mau     text not null default '#2563EB',
  ord     int  not null default 0
);

create table if not exists public.lo_trinh_man (
  id        text primary key check (id ~ '^[a-z0-9-]{2,60}$'),
  chu_de_id text not null references public.lo_trinh_chu_de(id) on delete cascade,
  ord       int  not null default 0,
  ten       text not null,
  cap       text not null check (cap in ('A1','A2','B1','B2','B2+','C1')),
  bat       boolean not null default true,
  so_cau    int not null default 8 check (so_cau between 4 and 15)
);
create index if not exists lo_trinh_man_chu_de_idx on public.lo_trinh_man (chu_de_id, ord);

create table if not exists public.lo_trinh_tu (
  id      bigint generated always as identity primary key,
  man_id  text not null references public.lo_trinh_man(id) on delete cascade,
  ord     int  not null default 0,
  fr      text not null check (char_length(btrim(fr)) between 1 and 120),
  vi      text not null check (char_length(btrim(vi)) between 1 and 120),
  loai    text not null check (loai in ('n','v','a','x','d'))
);
create index if not exists lo_trinh_tu_man_idx on public.lo_trinh_tu (man_id, ord);

do $$
declare b text;
begin
  foreach b in array array['lo_trinh_chu_de','lo_trinh_man','lo_trinh_tu'] loop
    execute format('alter table public.%I enable row level security', b);
    execute format('drop policy if exists %I on public.%I', b || '_doc', b);
    execute format('drop policy if exists %I on public.%I', b || '_them', b);
    execute format('drop policy if exists %I on public.%I', b || '_sua', b);
    execute format('drop policy if exists %I on public.%I', b || '_xoa', b);
    execute format('create policy %I on public.%I for select to authenticated using (true)', b || '_doc', b);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_teacher())', b || '_them', b);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_teacher()) with check (public.is_teacher())', b || '_sua', b);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_teacher())', b || '_xoa', b);
    execute format('revoke all on public.%I from anon', b);
  end loop;
end $$;

-- Khoá màn mới. Giữ dạng cũ để không làm hỏng dòng đã có.
alter table public.lo_trinh_ket_qua drop constraint if exists lo_trinh_ket_qua_ma_man_check;
alter table public.lo_trinh_ket_qua add constraint lo_trinh_ket_qua_ma_man_check
  check (ma_man ~ '^(bo:[0-9a-f-]{36}|trum:[A-Za-z0-9-]{2,40}|man:[a-z0-9-]{2,60})$');

-- Ghi kết quả + XP: giữ đúng luật 110 (5 XP màn, 15 XP thử thách, một lần mỗi
-- màn), chỉ đổi phép kiểm « màn có thật »: màn phải tồn tại VÀ đang bật;
-- thử thách phải thuộc một chủ đề có ít nhất một màn đang bật.
create or replace function public.ghi_ket_qua_man(p_ma_man text, p_sao int)
returns table (r_ma_man text, r_sao smallint, r_lan_choi int, r_xp int)
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_sao_cu smallint;
  v_xp int := 0;
  v_hop_le boolean;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_sao is null or p_sao < 0 or p_sao > 3 then raise exception 'SAO_KHONG_HOP_LE'; end if;

  if p_ma_man like 'man:%' then
    select exists (select 1 from public.lo_trinh_man m where m.id = substr(p_ma_man, 5) and m.bat) into v_hop_le;
  elsif p_ma_man like 'trum:%' then
    select exists (select 1 from public.lo_trinh_man m where m.chu_de_id = substr(p_ma_man, 6) and m.bat) into v_hop_le;
  else
    v_hop_le := false;   -- khoá cũ 'bo:…' không còn nhận kết quả mới
  end if;
  if not v_hop_le then raise exception 'MAN_KHONG_TON_TAI'; end if;

  select k.sao into v_sao_cu from public.lo_trinh_ket_qua k
   where k.user_id = v_uid and k.ma_man = p_ma_man for update;

  insert into public.lo_trinh_ket_qua as k (user_id, ma_man, sao)
  values (v_uid, p_ma_man, p_sao)
  on conflict on constraint lo_trinh_ket_qua_pkey do update
    set sao = greatest(k.sao, excluded.sao), lan_choi = k.lan_choi + 1, cap_nhat = now();

  if p_sao > 0 and coalesce(v_sao_cu, 0) = 0
     and not exists (select 1 from public.xp_so_cai x
                      where x.user_id = v_uid and x.ly_do = 'qua_man_lo_trinh' and x.ref = p_ma_man) then
    v_xp := case when p_ma_man like 'trum:%' then 15 else 5 end;
    update public.profiles set xp_balance = xp_balance + v_xp where id = v_uid;
    if found then
      insert into public.xp_so_cai (user_id, delta, ly_do, ref) values (v_uid, v_xp, 'qua_man_lo_trinh', p_ma_man);
    else
      v_xp := 0;
    end if;
  end if;

  return query
  select k.ma_man, k.sao, k.lan_choi, v_xp from public.lo_trinh_ket_qua k
   where k.user_id = v_uid and k.ma_man = p_ma_man;
end $$;

revoke all on function public.ghi_ket_qua_man(text, int) from public, anon;
grant execute on function public.ghi_ket_qua_man(text, int) to authenticated;
