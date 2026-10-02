-- DUYỆT NHÁP + LỘ TRÌNH DO GIÁO VIÊN KIỂM SOÁT (02/10).
--
-- ══ 1. XUẤT BẢN NHÁP ══
-- Nháp = bài kho 'assignment', giao cho `__nhap__`, tiêu đề « [NHÁP] … »
-- (scripts/nhap/). Xuất bản = chuyển sang kho 'practice', bỏ tiền tố, bỏ người
-- nhận giả. Làm bằng MỘT lệnh UPDATE trong RPC, không qua saveExercise: lối đó
-- xoá rồi chèn lại câu hỏi (mất lịch sử trả lời, và từng xoá neo — CLAUDE.md).
-- Chỉ đụng bài còn mang tiền tố, nên gọi lại lần hai là vô hại. Trả BIÊN NHẬN.
--
-- ══ 2. CẤU HÌNH LỘ TRÌNH ══
-- Một dòng cho mỗi bộ flashcard giáo viên đã chỉnh. Bộ KHÔNG có dòng thì theo
-- mặc định (bật, xếp theo the_bo.ord, 8 câu) — nên bảng rỗng = lộ trình y như
-- trước, và bộ mới công khai tự vào lộ trình.
-- Học sinh ĐỌC được (màn Lộ trình cần), chỉ giáo viên ghi (is_teacher(), ba
-- policy khai riêng — `for all` đè quyền đọc, xem CLAUDE.md mục Flashcard).
--
-- ══ 3. TIẾN ĐỘ ══
-- Giáo viên đọc được lo_trinh_ket_qua của mọi người (policy 108); RPC gom sẵn
-- theo học sinh kèm tên, để màn hình không phải ghép bảng.

create or replace function public.xuat_ban_nhap(p_id text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if not public.is_teacher() then raise exception 'CHI_GIAO_VIEN' using errcode = '42501'; end if;
  update public.exercises e
     set store = 'practice',
         usage_type = 'practice',
         title = btrim(regexp_replace(e.title, '^\[NHÁP\]\s*', '')),
         meta = (coalesce(e.meta, '{}'::jsonb) - 'assignedTo') || '{"targeted": false}'::jsonb
   where e.id = p_id and e.title like '[NHÁP]%'
  returning e.id, e.title, e.store into r;
  if r.id is null then
    return jsonb_build_object('ok', false, 'loi', 'KHONG_PHAI_NHAP');
  end if;
  return jsonb_build_object('ok', true, 'id', r.id, 'title', r.title, 'store', r.store);
end $$;

create table if not exists public.lo_trinh_cau_hinh (
  bo_id     uuid primary key references public.the_bo(id) on delete cascade,
  bat       boolean not null default true,
  ord       int not null default 0,
  so_cau    int not null default 8 check (so_cau between 4 and 15),
  cap_nhat  timestamptz not null default now()
);
alter table public.lo_trinh_cau_hinh enable row level security;
drop policy if exists lo_trinh_ch_doc on public.lo_trinh_cau_hinh;
drop policy if exists lo_trinh_ch_them on public.lo_trinh_cau_hinh;
drop policy if exists lo_trinh_ch_sua on public.lo_trinh_cau_hinh;
drop policy if exists lo_trinh_ch_xoa on public.lo_trinh_cau_hinh;
create policy lo_trinh_ch_doc on public.lo_trinh_cau_hinh for select to authenticated using (true);
create policy lo_trinh_ch_them on public.lo_trinh_cau_hinh for insert to authenticated with check (public.is_teacher());
create policy lo_trinh_ch_sua on public.lo_trinh_cau_hinh for update to authenticated using (public.is_teacher()) with check (public.is_teacher());
create policy lo_trinh_ch_xoa on public.lo_trinh_cau_hinh for delete to authenticated using (public.is_teacher());
revoke all on public.lo_trinh_cau_hinh from anon;

create or replace function public.lo_trinh_tien_do()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'CHI_GIAO_VIEN' using errcode = '42501'; end if;
  return (
    select coalesce(jsonb_agg(x order by (x->>'sao')::int desc, x->>'name'), '[]'::jsonb) from (
      select jsonb_build_object(
        'id', p.id,
        'name', coalesce(nullif(p.display_name, ''), p.name),
        'username', p.username,
        'avatar', p.avatar,
        'sao', sum(k.sao)::int,
        'man_qua', count(*) filter (where k.sao > 0)::int,
        'trum_qua', count(*) filter (where k.sao > 0 and k.ma_man like 'trum:%')::int,
        'ket_qua', jsonb_object_agg(k.ma_man, k.sao),
        'gan_nhat', max(k.cap_nhat)) as x
      from public.lo_trinh_ket_qua k
      join public.profiles p on p.id = k.user_id
      group by p.id
    ) s
  );
end $$;

revoke all on function public.xuat_ban_nhap(text) from public, anon;
revoke all on function public.lo_trinh_tien_do() from public, anon;
grant execute on function public.xuat_ban_nhap(text) to authenticated;
grant execute on function public.lo_trinh_tien_do() to authenticated;
