-- 153 · Chuỗi ngày học tính MỌI hoạt động (22/10, theo chủ dự án).
--
-- Trước đây _chuoi_tinh() chỉ đọc attempts (bài tập + thi thử), nên học sinh chơi
-- Thách đấu, Lộ trình, Flashcard, Nghe & Nói, Học ngữ pháp cả ngày mà chuỗi vẫn đứt.
--
-- Bảng ngay_hoc: một dòng mỗi người mỗi ngày (giờ VN), CHỈ trigger ghi vào. Không
-- dùng daily_activity vì bảng đó nhận ngày do client gửi (ghi_hoat_dong), gọi RPC
-- không cần làm bài là tự đắp được chuỗi. Không đọc thẳng các cột cap_nhat vì chúng
-- bị ghi đè mỗi lần chơi lại: ngày cũ biến mất và chuỗi đứt ngược về quá khứ.

create table if not exists public.ngay_hoc (
  user_id uuid not null references auth.users(id) on delete cascade,
  ngay    date not null,
  primary key (user_id, ngay)
);
alter table public.ngay_hoc enable row level security;
drop policy if exists ngay_hoc_doc on public.ngay_hoc;
create policy ngay_hoc_doc on public.ngay_hoc for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete on public.ngay_hoc from anon, authenticated;
grant select on public.ngay_hoc to authenticated;

create or replace function public._ghi_ngay_hoc(p_uid uuid, p_luc timestamptz default now())
returns void language sql security definer set search_path = public as $$
  insert into ngay_hoc (user_id, ngay)
  select p_uid, (coalesce(p_luc, now()) at time zone 'Asia/Ho_Chi_Minh')::date
  where p_uid is not null
  on conflict do nothing
$$;
revoke execute on function public._ghi_ngay_hoc(uuid, timestamptz) from public, anon, authenticated;

-- Trigger chung: bảng có user_id, mỗi lần ghi (thêm hoặc cập nhật) là một lượt học.
create or replace function public._trg_ngay_hoc()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform _ghi_ngay_hoc(new.user_id);
  return new;
end $$;

-- Thách đấu: tính cho người vừa NỘP (a_xong / b_xong chuyển từ null sang có).
create or replace function public._trg_ngay_hoc_thach_dau()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.a_xong is not null and (tg_op = 'INSERT' or old.a_xong is null) then perform _ghi_ngay_hoc(new.nguoi_thach, new.a_xong); end if;
  if new.b_xong is not null and (tg_op = 'INSERT' or old.b_xong is null) then perform _ghi_ngay_hoc(new.doi_thu, new.b_xong); end if;
  return new;
end $$;

do $$
declare t text;
begin
  -- Học ngữ pháp, Nghe & Nói, Lộ trình, ôn câu ngữ pháp sai, chấm thẻ Flashcard (reviews).
  foreach t in array array['bai_hoc_ket_qua', 'cau_luyen_ket_qua', 'lo_trinh_ket_qua', 'ngu_phap_cau_sai'] loop
    execute format('drop trigger if exists ngay_hoc on public.%I', t);
    execute format('create trigger ngay_hoc after insert or update on public.%I for each row execute function public._trg_ngay_hoc()', t);
  end loop;
  -- reviews: dòng được TẠO lúc mở bộ (chưa học gì), chỉ tính khi chấm thẻ (update).
  drop trigger if exists ngay_hoc on public.reviews;
  create trigger ngay_hoc after update on public.reviews for each row execute function public._trg_ngay_hoc();
  drop trigger if exists ngay_hoc on public.thach_dau;
  create trigger ngay_hoc after insert or update on public.thach_dau for each row execute function public._trg_ngay_hoc_thach_dau();
end $$;

-- Bù lịch sử từ những nguồn còn giữ được ngày.
insert into public.ngay_hoc (user_id, ngay)
select u, (l at time zone 'Asia/Ho_Chi_Minh')::date from (
  select user_id u, created_at l from cau_luyen_ket_qua
  union all select nguoi_thach, a_xong from thach_dau where a_xong is not null
  union all select doi_thu, b_xong from thach_dau where b_xong is not null
  union all select user_id, created_at from xp_so_cai where ly_do = 'qua_man_lo_trinh'
  union all select user_id, cap_nhat from bai_hoc_ket_qua
  union all select user_id, cap_nhat from lo_trinh_ket_qua
  union all select user_id, cap_nhat from ngu_phap_cau_sai
) x where u is not null and exists (select 1 from auth.users where id = u)
on conflict do nothing;

-- _chuoi_tinh: y nguyên 138/139, chỉ đổi nguồn ngày học = attempts ∪ ngay_hoc.
create or replace function public._chuoi_tinh(p_uid uuid, p_ghi boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $function$
declare
  hom_nay date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  ds date[]; dau date; d date; n int := 0; vong int := 0;
  da date[]; thang text; moi jsonb := '{}'::jsonb;
  bang date[] := '{}'; cho date[] := '{}';
begin
  select array_agg(distinct x), min(x) into ds, dau from (
    select (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date x
      from attempts a where a.user_id = p_uid and a.finished_at is not null
    union all
    select h.ngay from ngay_hoc h where h.user_id = p_uid
  ) s;
  select coalesce(array_agg(ngay), '{}') into da from chuoi_dong_bang where user_id = p_uid;

  if ds is null then
    return jsonb_build_object('chuoi', 0, 'dong_bang', '[]'::jsonb,
      'con_lai_thang', greatest(0, 5 - (select count(*) from unnest(da) x where to_char(x, 'YYYY-MM') = to_char(hom_nay, 'YYYY-MM'))::int));
  end if;

  d := case when hom_nay = any(ds) then hom_nay else hom_nay - 1 end;
  loop
    vong := vong + 1;
    exit when vong > 1200 or d < dau;
    if d = any(ds) then
      n := n + 1;
      bang := bang || cho; cho := '{}';
    elsif d = any(da) then
      cho := cho || d;
    else
      thang := to_char(d, 'YYYY-MM');
      exit when (select count(*) from unnest(da) x where to_char(x, 'YYYY-MM') = thang)
                + coalesce((moi ->> thang)::int, 0) >= 5;
      moi := moi || jsonb_build_object(thang, coalesce((moi ->> thang)::int, 0) + 1);
      cho := cho || d;
    end if;
    d := d - 1;
  end loop;

  if p_ghi and array_length(bang, 1) > 0 then
    insert into chuoi_dong_bang (user_id, ngay)
    select p_uid, x from unnest(bang) x on conflict do nothing;
  end if;

  return jsonb_build_object(
    'chuoi', n,
    'dong_bang', coalesce((select jsonb_agg(to_char(x, 'YYYY-MM-DD') order by x) from unnest(bang) x), '[]'::jsonb),
    'con_lai_thang', greatest(0, 5 - (select count(distinct x) from unnest(da || bang) x
                                      where to_char(x, 'YYYY-MM') = to_char(hom_nay, 'YYYY-MM'))::int)
  );
end $function$;
