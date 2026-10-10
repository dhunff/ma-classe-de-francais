-- 129 · Phương án Thách đấu: cùng DẠNG, cùng chủ đề, không có ngoặc giải thích (10/10).
--
-- Chủ dự án: « phương án rất rối, đừng để dấu ngoặc giải thích, phải chung chủ
-- đề, chung dạng từ ». Nên:
--   · the_bo_the.loai: dạng của thẻ (so | cau | nhom_tu | tu_noi | mo_dau | dong_tu),
--     gán lần đầu bằng quy tắc dưới đây, giáo viên sửa được ở màn soạn.
--   · sach_pa(): bỏ phần « (…) » khi HIỆN câu hỏi và phương án. Mặt thẻ gốc
--     giữ nguyên lời giải thích, vì ở màn Flashcard nó có ích.
--   · Nhiễu: CÙNG dạng, ưu tiên cùng chủ đề rồi mới sang chủ đề khác; thẻ nào
--     không đủ 3 nhiễu cùng dạng thì KHÔNG đưa vào đề.

alter table public.the_bo_the add column if not exists loai text
  check (loai in ('so', 'cau', 'nhom_tu', 'tu_noi', 'mo_dau', 'dong_tu'));

create or replace function public.sach_pa(t text)
returns text language sql immutable as $$
  select btrim(regexp_replace(regexp_replace(coalesce(t, ''), '\s*\([^)]*\)', '', 'g'), '\s{2,}', ' ', 'g'));
$$;

update public.the_bo_the t set loai = x.loai
from (
  select t2.id,
    case
      when b.chu_de = 'di-lai-so' and t2.mat_sau ~* '^[0-9]|giờ|phút|tiếng|^năm|ngày|thứ|tỷ' then 'so'
      when t2.mat_truoc ~* '^(sensibiliser|se réjouir)' then 'dong_tu'
      when t2.mat_truoc ~ '[.!?]\s*$' or b.chu_de = 'di-lai-so' then 'cau'
      when t2.mat_truoc ~* '^(un|une|le|la|les|l'')\s?[a-zàâçéèêëîïôûùüÿœ]' and t2.mat_truoc !~ '…' then 'nhom_tu'
      when b.chu_de = 'moi-truong' then 'tu_noi'
      when t2.mat_truoc !~ '[…,]' and array_length(regexp_split_to_array(btrim(public.sach_pa(t2.mat_truoc)), '\s+'), 1) <= 3 then 'tu_noi'
      else 'mo_dau'
    end as loai
  from public.the_bo_the t2 join public.the_bo b on b.id = t2.bo_id
) x
where t.id = x.id and t.loai is null;

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

  with tat_ca as (   -- mọi thẻ công khai, miễn phí, đã có dạng; mỗi mặt trước (đã làm sạch) một lần
    select distinct on (lower(public.sach_pa(t.mat_truoc)))
           t.id, t.loai, t.nhieu, b.chu_de,
           public.sach_pa(t.mat_truoc) as truoc, public.sach_pa(t.mat_sau) as sau
      from public.the_bo b join public.the_bo_the t on t.bo_id = b.id
     where b.cong_khai and not b.tra_phi and t.loai is not null
       and public.sach_pa(t.mat_truoc) <> '' and public.sach_pa(t.mat_sau) <> ''
     order by lower(public.sach_pa(t.mat_truoc)), random()
  ), cau_hoi as (
    select c.*, row_number() over (order by random()) as rn
      from tat_ca c
     where c.chu_de = p_chu_de
       and (coalesce(array_length(c.nhieu, 1), 0) = 3
            or (select count(distinct lower(o.sau)) from tat_ca o
                 where o.loai = c.loai and o.id <> c.id
                   and lower(o.sau) <> lower(c.sau) and lower(o.truoc) <> lower(c.truoc)) >= 3)
  ), chon as (
    select *, case when rn % 2 = 1 then 'nghia' else 'phap' end as chieu from cau_hoi where rn <= 10
  )
  select jsonb_agg(jsonb_build_object(
           'the', c.id,
           'chieu', c.chieu,
           'lua_chon', case
             when c.chieu = 'nghia' and coalesce(array_length(c.nhieu, 1), 0) = 3 then
               (select jsonb_agg(x.v order by random())
                  from (select c.id::text as v union all select 'txt:' || n from unnest(c.nhieu) n) x)
             else
               (select jsonb_agg(x.id order by random())
                  from (select c.id as id
                        union all
                        (select d.id from (
                           select distinct on (lower(case when c.chieu = 'nghia' then o.sau else o.truoc end))
                                  o.id, (o.chu_de = c.chu_de) as cung_cd
                             from tat_ca o
                            where o.loai = c.loai and o.id <> c.id
                              and lower(o.sau) <> lower(c.sau) and lower(o.truoc) <> lower(c.truoc)
                            order by lower(case when c.chieu = 'nghia' then o.sau else o.truoc end), random()
                         ) d
                         order by d.cung_cd desc, random() limit 3)) x)
           end
         ) order by c.rn)
    into v_de from chon c;

  if v_de is null or jsonb_array_length(v_de) < 4 then raise exception 'BO_QUA_IT_THE'; end if;

  insert into public.thach_dau (nguoi_thach, doi_thu, bo_id, chu_de, de)
  values (v_uid, p_doi_thu, null, p_chu_de, v_de) returning id into v_id;
  return v_id;
end $$;

/* lay_de: hiện câu hỏi + phương án ĐÃ BỎ NGOẶC. */
create or replace function public.lay_de_thach_dau(p_id uuid)
returns table (stt int, chieu text, de text, lua_chon text[])
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r public.thach_dau;
begin
  select * into r from public.thach_dau t where t.id = p_id for update;
  if r.id is null or v_uid is null or v_uid not in (r.nguoi_thach, r.doi_thu) then
    raise exception 'KHONG_CO_QUYEN' using errcode = '42501';
  end if;
  if v_uid = r.nguoi_thach then
    if r.a_xong is not null then raise exception 'DA_NOP'; end if;
    update public.thach_dau t set a_bat_dau = coalesce(t.a_bat_dau, now()) where t.id = p_id;
  else
    if r.b_xong is not null then raise exception 'DA_NOP'; end if;
    update public.thach_dau t set b_bat_dau = coalesce(t.b_bat_dau, now()) where t.id = p_id;
  end if;

  return query
  select q.ord::int, q.v->>'chieu',
         public.sach_pa(case when q.v->>'chieu' = 'nghia' then t.mat_truoc else t.mat_sau end),
         (select array_agg(public.sach_pa(case
                   when l.the_id like 'txt:%' then substr(l.the_id, 5)
                   when q.v->>'chieu' = 'nghia' then o.mat_sau else o.mat_truoc end) order by l.ord)
            from jsonb_array_elements_text(q.v->'lua_chon') with ordinality l(the_id, ord)
            left join public.the_bo_the o on o.id::text = l.the_id)
    from jsonb_array_elements(r.de) with ordinality q(v, ord)
    join public.the_bo_the t on t.id::text = q.v->>'the'
   order by q.ord;
end $$;

/* Số thẻ dùng được cho thách đấu: chỉ thẻ đã có dạng. */
create or replace function public.ds_chu_de_thach_dau()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'ma', c.ma, 'nhom', c.nhom, 'ten_vi', c.ten_vi, 'ten_fr', c.ten_fr, 'ten_en', c.ten_en,
           'so_the', (select count(distinct lower(public.sach_pa(t.mat_truoc)))
                        from public.the_bo b join public.the_bo_the t on t.bo_id = b.id
                       where b.chu_de = c.ma and b.cong_khai and not b.tra_phi and t.loai is not null
                         and btrim(t.mat_truoc) <> '' and btrim(t.mat_sau) <> ''),
           'so_bo', (select count(*) from public.the_bo b where b.chu_de = c.ma and b.cong_khai and not b.tra_phi)
         ) order by c.ord), '[]'::jsonb)
    from public.chu_de_the c;
$$;
notify pgrst, 'reload schema';
