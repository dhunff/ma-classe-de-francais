-- 056 — KIỂM 055 (chạy RIÊNG, sau khi 055 đã chạy xong)
--
-- Chỉ ĐỌC. Chạy trên production an toàn.

-- Phải ra đúng một dòng: public / notifications
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
  and schemaname = 'public'
  and tablename = 'notifications';

-- Toàn bộ bảng đang bật Realtime — để biết có bảng nào bật ngoài ý muốn không.
--
-- Đáng liếc qua: mỗi bảng ở đây là một luồng dữ liệu đẩy tới trình duyệt. RLS
-- vẫn lọc theo người đăng ký, nên không lộ dữ liệu — nhưng một bảng ghi nhiều
-- mà bật Realtime thì tốn băng thông cho thứ không ai nghe.
select tablename
from pg_publication_tables
where pubname = 'supabase_realtime' and schemaname = 'public'
order by tablename;

-- RLS phải đang BẬT trên notifications. Realtime áp RLS cho `postgres_changes`,
-- nên tắt RLS ở đây là đẩy mọi thông báo của mọi người tới mọi người đăng ký.
select relrowsecurity as rls_bat
from pg_class
where oid = 'public.notifications'::regclass;   -- phải là true
