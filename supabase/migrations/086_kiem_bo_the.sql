-- Kiểm 085 — LẦN RUN RIÊNG, sau khi 085 đã commit.
-- Bài học 035/046: phép kiểm cùng transaction với DDL thì nó đọc trạng thái
-- sắp bị cuộn ngược, và BÁO THÀNH CÔNG cho việc sắp bị huỷ.

do $$
declare n int; begin

  -- ── Hai bảng có thật ──
  if to_regclass('public.the_bo') is null then raise exception 'thiếu the_bo'; end if;
  if to_regclass('public.the_bo_the') is null then raise exception 'thiếu the_bo_the'; end if;

  -- ── Cột nối trên cards ──
  select count(*) into n from pg_attribute
   where attrelid = 'public.cards'::regclass and attname = 'bo_id' and not attisdropped;
  if n <> 1 then raise exception 'cards thiếu cột bo_id'; end if;

  -- ── RLS bật ở CẢ HAI ──
  select count(*) into n from pg_class
   where oid in ('public.the_bo'::regclass, 'public.the_bo_the'::regclass)
     and relrowsecurity;
  if n <> 2 then raise exception 'RLS chưa bật đủ hai bảng (đang %)', n; end if;

  -- ── ĐÚNG 4 policy mỗi bảng, và KHÔNG có policy nào `for all` ──
  --
  -- Ca quan trọng nhất file. Một policy `ALL` gộp cả SELECT vào chung `using`,
  -- nên nó lặng lẽ đè chính sách đọc và học sinh mất quyền xem — triệu chứng
  -- là "thư viện trống", không phải một thông báo lỗi.

  select count(*) into n from pg_policies
   where schemaname='public' and tablename='the_bo' and cmd='ALL';
  if n <> 0 then raise exception 'the_bo có policy FOR ALL — sẽ đè quyền đọc'; end if;

  select count(*) into n from pg_policies
   where schemaname='public' and tablename='the_bo_the' and cmd='ALL';
  if n <> 0 then raise exception 'the_bo_the có policy FOR ALL'; end if;

  select count(*) into n from pg_policies
   where schemaname='public' and tablename='the_bo' and cmd='SELECT';
  if n <> 1 then raise exception 'the_bo phải có đúng 1 policy SELECT'; end if;

  -- ── Ba lệnh ghi đều phải nhắc is_teacher() ──
  --
  -- Hỏi NỘI DUNG policy, không đếm số lượng: một policy INSERT tồn tại mà
  -- `with_check` là `true` thì vẫn đếm được 1, và cho cả trường soạn bộ thẻ.
  select count(*) into n from pg_policies
   where schemaname='public' and tablename='the_bo'
     and cmd in ('INSERT','UPDATE','DELETE')
     and coalesce(with_check, qual) like '%is_teacher()%';
  if n <> 3 then
    raise exception 'the_bo: chỉ % / 3 policy ghi có is_teacher()', n;
  end if;

  select count(*) into n from pg_policies
   where schemaname='public' and tablename='the_bo_the'
     and cmd in ('INSERT','UPDATE','DELETE')
     and coalesce(with_check, qual) like '%is_teacher()%';
  if n <> 3 then
    raise exception 'the_bo_the: chỉ % / 3 policy ghi có is_teacher()', n;
  end if;

  -- ── KHÔNG policy nào được đọc profiles.role ──
  --
  -- Nguồn sự thật thứ hai về "ai là giáo viên". Không thủng hôm nay, nhưng nó
  -- phụ thuộc vào việc `profiles` mãi mãi không có policy update cho chính
  -- chủ — một dòng ai cũng có lúc muốn viết để cho người dùng tự sửa tên.
  select count(*) into n from pg_policies
   where schemaname='public' and tablename in ('the_bo','the_bo_the')
     and coalesce(with_check,'') || coalesce(qual,'') like '%profiles%';
  if n <> 0 then
    raise exception '% policy đang đọc profiles thay vì is_teacher()', n;
  end if;

  -- ── HỌC SINH KHÔNG CÒN TẠO THẺ ──
  if has_function_privilege('authenticated',
       'public.tao_the_tu_viet(text,text,text,date)', 'EXECUTE') then
    raise exception 'authenticated VẪN gọi được tao_the_tu_viet';
  end if;
  if has_function_privilege('anon',
       'public.tao_the_tu_viet(text,text,text,date)', 'EXECUTE') then
    raise exception 'anon gọi được tao_the_tu_viet';
  end if;

  -- ── …nhưng đường SINH TỰ ĐỘNG từ lỗi sai phải còn sống ──
  -- 35/37 thẻ đến từ đó. Cắt nhầm nó là xoá sổ cả tính năng.
  select count(*) into n from public.cards where nguon = 'loi_sai';
  if n < 1 then raise exception 'không còn thẻ loi_sai nào — đã cắt nhầm đường sinh?'; end if;

  -- ── Quyền mức bảng ──
  if not has_table_privilege('authenticated','public.the_bo','SELECT') then
    raise exception 'authenticated không đọc được the_bo';
  end if;
  if has_table_privilege('anon','public.the_bo','SELECT') then
    raise exception 'anon đọc được the_bo';
  end if;

  raise notice 'the_bo / the_bo_the: đủ 14 ca kiểm.';
end $$;
