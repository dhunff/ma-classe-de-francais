-- 147 · Xem lại câu sai trong Thách đấu (15/10, theo chủ dự án).
-- Trước: nop_thach_dau chỉ chấm và lưu SỐ câu đúng; lựa chọn của học sinh không
-- được lưu, nên không ai biết mình sai câu nào. Nay lưu mảng trả lời, và thêm
-- xem_lai_thach_dau() trả từng câu kèm đáp án đúng, CHỈ cho người đã NỘP (trước khi
-- nộp mà lộ đáp án thì trận đấu vô nghĩa). Trận cũ không có mảng trả lời: chon = null.

alter table public.thach_dau add column if not exists a_tra_loi int[];
alter table public.thach_dau add column if not exists b_tra_loi int[];

create or replace function public.nop_thach_dau(p_id uuid, p_tra_loi integer[])
returns table(r_dung integer, r_tong integer, r_giay integer)
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r public.thach_dau; v_la_a boolean; v_bd timestamptz; v_dung int; v_giay int; v_tl int[];
begin
  select * into r from public.thach_dau t where t.id = p_id for update;
  if r.id is null or v_uid is null or v_uid not in (r.nguoi_thach, r.doi_thu) then
    raise exception 'KHONG_CO_QUYEN' using errcode = '42501';
  end if;
  v_la_a := v_uid = r.nguoi_thach;
  v_bd := case when v_la_a then r.a_bat_dau else r.b_bat_dau end;
  if v_bd is null then raise exception 'CHUA_BAT_DAU'; end if;
  if (case when v_la_a then r.a_xong else r.b_xong end) is not null then raise exception 'DA_NOP'; end if;

  -- Chặn ngoài 0..3: chỉ số ÂM trong jsonb đếm từ cuối mảng, -1 sẽ trúng phương án cuối.
  select count(*) filter (where p_tra_loi[q.ord::int] between 0 and 3
                            and q.v->'lua_chon'->>(p_tra_loi[q.ord::int]) = q.v->>'the')::int
    into v_dung
    from jsonb_array_elements(r.de) with ordinality q(v, ord);
  v_giay := least(greatest(extract(epoch from now() - v_bd)::int, 1), 3600);
  -- Lưu trả lời đã làm sạch (giá trị lạ → null), cắt đúng số câu của đề.
  select array_agg(case when p_tra_loi[g] between 0 and 3 then p_tra_loi[g] end order by g)
    into v_tl from generate_series(1, jsonb_array_length(r.de)) g;

  if v_la_a then
    update public.thach_dau t set a_xong = now(), a_dung = v_dung, a_giay = v_giay, a_tra_loi = v_tl where t.id = p_id;
  else
    update public.thach_dau t set b_xong = now(), b_dung = v_dung, b_giay = v_giay, b_tra_loi = v_tl where t.id = p_id;
  end if;
  return query select v_dung, jsonb_array_length(r.de), v_giay;
end $$;

create or replace function public.xem_lai_thach_dau(p_id uuid)
returns table(stt int, chieu text, de text, lua_chon text[], dap_an int, chon int, mat_truoc text, mat_sau text)
language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); r public.thach_dau; v_tl int[];
begin
  select * into r from public.thach_dau t where t.id = p_id;
  if r.id is null or v_uid is null or v_uid not in (r.nguoi_thach, r.doi_thu) then
    raise exception 'KHONG_CO_QUYEN' using errcode = '42501';
  end if;
  if (case when v_uid = r.nguoi_thach then r.a_xong else r.b_xong end) is null then
    raise exception 'CHUA_NOP' using errcode = '42501';
  end if;
  v_tl := case when v_uid = r.nguoi_thach then r.a_tra_loi else r.b_tra_loi end;

  return query
  select q.ord::int, q.v->>'chieu',
         public.sach_pa(case when q.v->>'chieu' = 'nghia' then t.mat_truoc else t.mat_sau end),
         (select array_agg(public.sach_pa(case
                   when l.the_id like 'txt:%' then substr(l.the_id, 5)
                   when q.v->>'chieu' = 'nghia' then o.mat_sau else o.mat_truoc end) order by l.ord)
            from jsonb_array_elements_text(q.v->'lua_chon') with ordinality l(the_id, ord)
            left join public.the_bo_the o on o.id::text = l.the_id),
         (select (l.ord - 1)::int from jsonb_array_elements_text(q.v->'lua_chon') with ordinality l(the_id, ord)
           where l.the_id = q.v->>'the' limit 1),
         v_tl[q.ord::int],
         t.mat_truoc, t.mat_sau
    from jsonb_array_elements(r.de) with ordinality q(v, ord)
    join public.the_bo_the t on t.id::text = q.v->>'the'
   order by q.ord;
end $$;
revoke all on function public.xem_lai_thach_dau(uuid) from public, anon;
grant execute on function public.xem_lai_thach_dau(uuid) to authenticated;
notify pgrst, 'reload schema';
