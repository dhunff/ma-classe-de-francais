-- 054 — KIỂM 053 (chạy RIÊNG, sau khi 053 đã chạy xong)
--
-- Vì sao ở file riêng: cả file SQL chạy trong MỘT transaction, nên một phép
-- kiểm nằm cuối 053 chỉ đọc được trạng thái bên trong transaction ấy — nó xác
-- nhận câu lệnh đã chạy, điều ta vốn đã biết, và vẫn báo thành công cho việc
-- sắp bị cuộn ngược. Xem đầu 048 và CLAUDE.md.
--
-- Chỉ ĐỌC. Không ghi gì, chạy trên production an toàn.

-- ── Bảng và index ──

select
  (select count(*) from pg_class
    where relname = 'notifications' and relnamespace = 'public'::regnamespace)  as bang,      -- 1
  (select count(*) from pg_class
    where relname = 'notifications_user_idx')                                   as idx,       -- 1
  (select relrowsecurity from pg_class
    where oid = 'public.notifications'::regclass)                               as rls_bat;   -- true

-- ── Policy: đúng ba, và KHÔNG có policy insert nào ──
--
-- Một policy insert xuất hiện ở đây nghĩa là ai đó đã mở đường ghi thứ hai,
-- vòng qua hàm — và khi đó phần kiểm quyền trong hàm thành đồ trang trí.

select polname, polcmd
from pg_policy
where polrelid = 'public.notifications'::regclass
order by polname;
-- Phải thấy đúng 3 dòng: notifications_mark_self (w), notifications_read_self (r),
-- notifications_read_teacher (r). KHÔNG có dòng nào polcmd = 'a' (insert).

-- ── Quyền UPDATE chỉ ở cột is_read ──
--
-- RLS phân quyền theo dòng, nên policy `notifications_mark_self` cho học sinh
-- update CẢ DÒNG của mình, kể cả `message`. Quyền mức cột là thứ chặn điều đó.

select
  has_table_privilege('authenticated', 'public.notifications', 'update')            as ca_bang,   -- false
  has_column_privilege('authenticated', 'public.notifications', 'is_read', 'update') as is_read,   -- true
  has_column_privilege('authenticated', 'public.notifications', 'message', 'update') as message_;  -- false

-- ── Hàm và quyền gọi ──

select
  (select count(*) from pg_proc
    where proname = 'send_announcement_to_students'
      and pronamespace = 'public'::regnamespace)                                     as ham,        -- 1
  (select prosecdef from pg_proc
    where proname = 'send_announcement_to_students'
      and pronamespace = 'public'::regnamespace)                                     as sec_definer,-- true
  has_function_privilege('anon',
    'public.send_announcement_to_students(text, boolean, uuid[])', 'execute')        as anon_goi,   -- false
  has_function_privilege('authenticated',
    'public.send_announcement_to_students(text, boolean, uuid[])', 'execute')        as auth_goi;   -- true

-- ── Còn cột nào vô hình với ứng dụng không ──
--
-- Bẫy đã trả giá ở 046: cột PostgREST không đọc được thì nó bỏ khỏi lược đồ và
-- trả về "column does not exist" — không phân biệt được với cột chưa tồn tại.
-- Câu này nên rỗng.

select a.attname as cot_anon_khong_doc_duoc
from pg_attribute a
where a.attrelid = 'public.notifications'::regclass
  and a.attnum > 0 and not a.attisdropped
  and not has_column_privilege('authenticated', a.attrelid, a.attname, 'select')
order by a.attnum;

-- Sau khi cả bốn khối đúng, đo lần cuối TỪ NGOÀI: npm run check:db
