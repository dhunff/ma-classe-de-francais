-- 127 · Thách đấu theo CHỦ ĐỀ (10/10, theo chủ dự án).
--
-- Trước: thách đấu trên MỘT bộ thẻ, 8 câu. Nay: chọn một chủ đề từ vựng hoặc
-- ngữ pháp; máy chủ gộp thẻ của MỌI bộ công khai cùng chủ đề, rút ngẫu nhiên
-- 10 câu (mỗi mặt trước chỉ một lần, vì vài bộ có thẻ trùng nhau), nhiễu lấy
-- từ cùng chủ đề.
--
-- Chủ đề là một danh mục nhỏ (chu_de_the); mỗi bộ trỏ tới một chủ đề qua
-- the_bo.chu_de. Giáo viên đổi được ở màn soạn bộ. lay_de_thach_dau và
-- nop_thach_dau KHÔNG đổi: đề vẫn lưu theo id thẻ.

create table if not exists public.chu_de_the (
  ma     text primary key,
  nhom   text not null check (nhom in ('tu_vung', 'ngu_phap')),
  ten_vi text not null,
  ten_fr text not null,
  ten_en text not null,
  ord    int  not null default 0
);
alter table public.chu_de_the enable row level security;
drop policy if exists chu_de_the_doc on public.chu_de_the;
create policy chu_de_the_doc on public.chu_de_the for select to anon, authenticated using (true);
grant select on public.chu_de_the to anon, authenticated;

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values
  ('moi-truong',  'tu_vung',  'Môi trường',                  'Environnement',               'Environment',              1),
  ('di-lai-so',   'tu_vung',  'Đi lại, con số và thời gian', 'Transports, nombres et heures','Travel, numbers and time', 2),
  ('truyen-thong','tu_vung',  'Truyền thông và phỏng vấn',   'Médias et interviews',        'Media and interviews',     3),
  ('tu-noi',      'ngu_phap', 'Từ nối và lập luận',          'Connecteurs et argumentation','Connectors and argument',  4),
  ('y-kien',      'ngu_phap', 'Bày tỏ ý kiến',               'Exprimer son opinion',        'Expressing opinions',      5),
  ('thu-tu',      'ngu_phap', 'Thư trang trọng',             'Lettre formelle',             'Formal letters',           6),
  ('ke-chuyen',   'ngu_phap', 'Kể chuyện ở quá khứ',         'Raconter au passé',           'Telling a story in the past', 7)
on conflict (ma) do nothing;

alter table public.the_bo add column if not exists chu_de text references public.chu_de_the(ma) on update cascade on delete set null;

update public.the_bo set chu_de = case ten
  when 'Từ vựng báo chí: môi trường'    then 'moi-truong'
  when 'Thông báo ở nhà ga'             then 'di-lai-so'
  when 'Số, giờ và ngày tháng khi nghe' then 'di-lai-so'
  when 'Phỏng vấn trên đài phát thanh'  then 'truyen-thong'
  when 'Từ nối trong bài đọc'           then 'tu-noi'
  when 'Lập luận trong bài luận'        then 'tu-noi'
  when 'Nhận ra quan điểm tác giả'      then 'y-kien'
  when 'Đồng ý và phản bác khi nói'     then 'y-kien'
  when 'Nêu và bảo vệ ý kiến'           then 'y-kien'
  when 'Mở và kết thư trang trọng'      then 'thu-tu'
  when 'Viết thư khiếu nại'             then 'thu-tu'
  when 'Kể lại một trải nghiệm'         then 'ke-chuyen'
  else chu_de end
where chu_de is null;

alter table public.thach_dau add column if not exists chu_de text references public.chu_de_the(ma) on update cascade on delete set null;
alter table public.thach_dau alter column bo_id drop not null;

/* Danh sách chủ đề cho màn thách đấu: số thẻ KHÁC NHAU trong các bộ công khai. */
create or replace function public.ds_chu_de_thach_dau()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'ma', c.ma, 'nhom', c.nhom, 'ten_vi', c.ten_vi, 'ten_fr', c.ten_fr, 'ten_en', c.ten_en,
           'so_the', (select count(distinct lower(btrim(t.mat_truoc)))
                        from public.the_bo b join public.the_bo_the t on t.bo_id = b.id
                       where b.chu_de = c.ma and b.cong_khai
                         and btrim(t.mat_truoc) <> '' and btrim(t.mat_sau) <> ''),
           'so_bo', (select count(*) from public.the_bo b where b.chu_de = c.ma and b.cong_khai)
         ) order by c.ord), '[]'::jsonb)
    from public.chu_de_the c;
$$;

create or replace function public.tao_thach_dau_chu_de(p_doi_thu uuid, p_chu_de text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_de jsonb; v_id uuid;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if p_doi_thu = v_uid then raise exception 'KHONG_TU_THACH_MINH'; end if;
  if not exists (select 1 from public.follows f where f.follower_id = v_uid and f.following_id = p_doi_thu) then
    raise exception 'CHUA_THEO_DOI';
  end if;
  if not exists (select 1 from public.chu_de_the c where c.ma = p_chu_de) then
    raise exception 'CHU_DE_KHONG_TON_TAI';
  end if;
  if (select count(*) from public.thach_dau t
       where t.nguoi_thach = v_uid and t.created_at > now() - interval '24 hours') >= 10 then
    raise exception 'DAILY_LIMIT_REACHED';
  end if;

  with kho as (   -- mỗi mặt trước một thẻ: bộ khác nhau có thể trùng thẻ
    select distinct on (lower(btrim(t.mat_truoc))) t.id, t.mat_truoc, t.mat_sau
      from public.the_bo b join public.the_bo_the t on t.bo_id = b.id
     where b.chu_de = p_chu_de and b.cong_khai
       and btrim(t.mat_truoc) <> '' and btrim(t.mat_sau) <> ''
     order by lower(btrim(t.mat_truoc)), random()
  ), chon as (
    select s.id, s.mat_truoc, s.mat_sau, row_number() over () as rn
      from (select * from kho order by random() limit 10) s
  )
  select jsonb_agg(jsonb_build_object(
           'the', c.id,
           'chieu', case when c.rn % 2 = 1 then 'nghia' else 'phap' end,
           'lua_chon', (select jsonb_agg(x.id order by random())
                          from (select c.id as id
                                union all
                                (select o.id from kho o
                                  where o.id <> c.id
                                    and lower(o.mat_sau) <> lower(c.mat_sau)
                                    and lower(o.mat_truoc) <> lower(c.mat_truoc)
                                  order by random() limit 3)) x)
         ) order by c.rn)
    into v_de from chon c;

  if v_de is null or jsonb_array_length(v_de) < 4 then raise exception 'BO_QUA_IT_THE'; end if;

  insert into public.thach_dau (nguoi_thach, doi_thu, bo_id, chu_de, de)
  values (v_uid, p_doi_thu, null, p_chu_de, v_de) returning id into v_id;
  return v_id;
end $$;

/* ds_thach_dau: trận theo chủ đề không có bộ → LEFT JOIN, tên lấy từ chủ đề. */
create or replace function public.ds_thach_dau()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(d order by (d->>'created_at') desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', t.id, 'bo', coalesce(c.ten_vi, b.ten), 'chu_de', t.chu_de,
      'chu_de_ten', case when c.ma is null then null else jsonb_build_object('vi', c.ten_vi, 'fr', c.ten_fr, 'en', c.ten_en) end,
      'nhom', c.nhom, 'ky_nang', b.ky_nang, 'tong', jsonb_array_length(t.de),
      'toi_thach', t.nguoi_thach = auth.uid(),
      'doi_phuong', jsonb_build_object('name', coalesce(nullif(p.display_name, ''), p.name),
                                       'username', p.username, 'avatar', p.avatar),
      'toi_xong', m.toi_xong is not null, 'toi_dung', m.toi_dung, 'toi_giay', m.toi_giay,
      'ho_xong', m.ho_xong is not null,
      'ho_dung', case when m.toi_xong is not null then m.ho_dung end,
      'ho_giay', case when m.toi_xong is not null then m.ho_giay end,
      'created_at', t.created_at) as d
    from public.thach_dau t
    left join public.the_bo b on b.id = t.bo_id
    left join public.chu_de_the c on c.ma = t.chu_de
    cross join lateral (select
        case when t.nguoi_thach = auth.uid() then t.a_xong else t.b_xong end as toi_xong,
        case when t.nguoi_thach = auth.uid() then t.a_dung else t.b_dung end as toi_dung,
        case when t.nguoi_thach = auth.uid() then t.a_giay else t.b_giay end as toi_giay,
        case when t.nguoi_thach = auth.uid() then t.b_xong else t.a_xong end as ho_xong,
        case when t.nguoi_thach = auth.uid() then t.b_dung else t.a_dung end as ho_dung,
        case when t.nguoi_thach = auth.uid() then t.b_giay else t.a_giay end as ho_giay) m
    join public.profiles p on p.id = case when t.nguoi_thach = auth.uid() then t.doi_thu else t.nguoi_thach end
    where auth.uid() in (t.nguoi_thach, t.doi_thu)
    order by t.created_at desc limit 50
  ) s;
$$;

revoke all on function public.ds_chu_de_thach_dau() from public, anon;
revoke all on function public.tao_thach_dau_chu_de(uuid, text) from public, anon;
grant execute on function public.ds_chu_de_thach_dau() to authenticated;
grant execute on function public.tao_thach_dau_chu_de(uuid, text) to authenticated;
notify pgrst, 'reload schema';
