-- Kiểm 089 — lần Run RIÊNG (bài học 035/046).

do $$
declare dinhNghia text; n int; begin

  -- ── CHECK đã nới, và KHÔNG nới quá tay ──
  -- Kiểm NỘI DUNG ràng buộc, không kiểm tên: một CHECK tên đúng mà vẫn chỉ có
  -- hai giá trị cũ thì mọi lần mở bộ đều hỏng.
  select pg_get_constraintdef(oid) into dinhNghia
    from pg_constraint
   where conrelid = 'public.cards'::regclass and conname = 'cards_nguon_hop_le';
  if dinhNghia is null then raise exception 'mất ràng buộc cards_nguon_hop_le'; end if;
  if dinhNghia not like '%bo_giao_vien%' then
    raise exception 'cards_nguon_hop_le chưa nhận bo_giao_vien: %', dinhNghia;
  end if;
  if dinhNghia not like '%loi_sai%' or dinhNghia not like '%tu_tao%' then
    raise exception 'nới CHECK mà làm rơi giá trị cũ — 37 thẻ đang có sẽ vi phạm: %', dinhNghia;
  end if;

  -- ── Cột nối + index duy nhất ──
  select count(*) into n from pg_attribute
   where attrelid = 'public.cards'::regclass and attname = 'bo_the_id' and not attisdropped;
  if n <> 1 then raise exception 'cards thiếu bo_the_id'; end if;

  select count(*) into n from pg_index i join pg_class c on c.oid = i.indexrelid
   where c.relname = 'cards_mot_lich_moi_the_goc' and i.indisunique;
  if n <> 1 then raise exception 'thiếu index duy nhất (user_id, bo_the_id) — mở bộ lần hai sẽ đẻ thẻ trùng'; end if;

  -- ── Quyền hàm ──
  if not has_function_privilege('authenticated', 'public.hoc_bo(uuid)', 'EXECUTE') then
    raise exception 'authenticated không gọi được hoc_bo';
  end if;
  if has_function_privilege('anon', 'public.hoc_bo(uuid)', 'EXECUTE') then
    raise exception 'anon gọi được hoc_bo';
  end if;

  -- ── Học sinh VẪN không chèn thẳng được vào cards ──
  -- Hàm mới là security definer; cửa chèn trực tiếp phải vẫn đóng như 063.
  if has_table_privilege('authenticated', 'public.cards', 'INSERT') then
    raise exception 'authenticated chèn thẳng được vào cards';
  end if;

  -- ── Dữ liệu cũ vẫn thoả ràng buộc mới ──
  select count(*) into n from public.cards
   where nguon not in ('loi_sai', 'tu_tao', 'bo_giao_vien');
  if n <> 0 then raise exception '% thẻ có nguon ngoài danh sách', n; end if;

  raise notice 'lịch ôn bộ thẻ: đủ 8 ca.';
end $$;
