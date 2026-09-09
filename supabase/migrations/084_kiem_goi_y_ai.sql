-- Kiểm 083 — CHẠY Ở MỘT LẦN RUN RIÊNG, sau khi 083 đã commit.
--
-- Bài học 035 rồi 046: phép kiểm nằm cùng transaction với thứ nó kiểm thì vô
-- giá trị. 046 kết thúc bằng một câu `select` đếm cột, in ra `cot_moi = 3`
-- trong khi ba cột đó không hề tồn tại sau đó — bên trong transaction thì
-- `alter table` đã có hiệu lực, rồi transaction cuộn ngược. Sai theo hướng tệ
-- hơn cả một exception: nó BÁO THÀNH CÔNG cho việc sắp bị huỷ.
--
-- File riêng ⇒ transaction riêng ⇒ đọc được trạng thái đã commit thật.

do $$
declare n int; begin

  -- ── Bảng có thật, không phải "thấy trong Table Editor" ──
  select count(*) into n from pg_class
   where oid = 'public.pe_ai_goi_y'::regclass;
  if n <> 1 then raise exception 'thiếu bảng pe_ai_goi_y'; end if;

  -- ── RLS bật ──
  select count(*) into n from pg_class
   where oid = 'public.pe_ai_goi_y'::regclass and relrowsecurity;
  if n <> 1 then raise exception 'pe_ai_goi_y chưa bật RLS'; end if;

  -- ── ĐÚNG MỘT policy, và là policy ĐỌC ──
  --
  -- Đây là ca quan trọng nhất trong file. Một policy `for all` lỡ tay viết ra
  -- sẽ mở luôn đường ghi, và khi đó học sinh tự chèn được một "gợi ý của AI"
  -- cho 25/25 — hạn mức lẫn tính xác thực của bảng này mất sạch cùng lúc.
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'pe_ai_goi_y';
  if n <> 1 then
    raise exception 'pe_ai_goi_y phải có ĐÚNG 1 policy, đang có %', n;
  end if;

  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename = 'pe_ai_goi_y' and cmd = 'SELECT';
  if n <> 1 then raise exception 'policy duy nhất phải là SELECT'; end if;

  -- ── Quyền mức BẢNG: chỉ còn SELECT ──
  --
  -- `revoke ... from public` KHÔNG gỡ quyền cấp thẳng cho anon/authenticated.
  -- Đã dính ba lần (022, 024, 063), nên hỏi thẳng catalog thay vì tin câu
  -- revoke vừa viết ở file trước.
  if has_table_privilege('authenticated', 'public.pe_ai_goi_y', 'INSERT')
     or has_table_privilege('authenticated', 'public.pe_ai_goi_y', 'UPDATE')
     or has_table_privilege('authenticated', 'public.pe_ai_goi_y', 'DELETE') then
    raise exception 'authenticated còn quyền GHI trên pe_ai_goi_y';
  end if;

  if not has_table_privilege('authenticated', 'public.pe_ai_goi_y', 'SELECT') then
    raise exception 'authenticated mất quyền ĐỌC pe_ai_goi_y';
  end if;

  -- anon không được đụng vào gì cả: bảng này chứa bài viết đã được phân tích
  -- của người thật.
  if has_table_privilege('anon', 'public.pe_ai_goi_y', 'SELECT') then
    raise exception 'anon đọc được pe_ai_goi_y';
  end if;

  -- ── Hàm đọc: có, và anon không gọi được ──
  if not has_function_privilege('authenticated', 'public.doc_goi_y_ai(uuid)', 'EXECUTE') then
    raise exception 'authenticated không gọi được doc_goi_y_ai';
  end if;
  if has_function_privilege('anon', 'public.doc_goi_y_ai(uuid)', 'EXECUTE') then
    raise exception 'anon gọi được doc_goi_y_ai';
  end if;

  -- ── Khoá ngoại có ON DELETE CASCADE ──
  --
  -- Xoá một lượt trả lời mà để lại gợi ý mồ côi thì bảng này giữ nguyên văn
  -- một đoạn bài viết của người đã rời đi, không gắn với gì cả.
  select count(*) into n from pg_constraint
   where conrelid = 'public.pe_ai_goi_y'::regclass
     and contype = 'f' and confdeltype = 'c';
  if n <> 2 then
    raise exception 'phải có 2 khoá ngoại ON DELETE CASCADE, đang có %', n;
  end if;

  raise notice 'pe_ai_goi_y: đủ 9 ca kiểm.';
end $$;
