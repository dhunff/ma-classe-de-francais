-- 055 — bật Realtime cho bảng notifications
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- ══════════════════════════════════════════════════════════════════════════
-- REALTIME LÀ MỘT PUBLICATION, KHÔNG PHẢI MỘT CÁI CÔNG TẮC
-- ══════════════════════════════════════════════════════════════════════════
--
-- Nút "Enable Realtime" trong dashboard (Database → Replication) thực chất chỉ
-- thêm bảng vào publication `supabase_realtime`. Làm bằng SQL thì cùng kết quả,
-- và có mặt trong lịch sử migration — nghĩa là dựng lại database từ đầu sẽ tự
-- có, không phải nhớ bấm tay.
--
-- Bell.jsx đăng ký kênh `postgres_changes` lọc `user_id=eq.<uid>`. Chưa có
-- dòng này thì kênh vẫn kết nối, vẫn `subscribe()` thành công, và KHÔNG BAO GIỜ
-- nhận được sự kiện nào — không lỗi, không cảnh báo. Đó là lý do Bell giữ luôn
-- vòng lặp 60 giây: thiếu realtime thì nó chậm đi, chứ không câm.
--
-- ══════════════════════════════════════════════════════════════════════════
-- CÓ LỘ DỮ LIỆU KHÔNG
-- ══════════════════════════════════════════════════════════════════════════
--
-- Không. Realtime của Supabase áp RLS cho `postgres_changes`: mỗi người đăng ký
-- chỉ nhận được dòng mà policy SELECT của họ cho phép đọc. `notifications` đã
-- bật RLS (migration 053), nên học sinh chỉ nhận thông báo của chính mình.
--
-- Giáo viên thì `notifications_read_teacher` cho đọc mọi dòng, nên về lý thuyết
-- họ đăng ký được kênh không lọc và nhận mọi thông báo. Đó KHÔNG phải quyền mới
-- — họ vốn đã `select` được mọi dòng để xem lại những gì đã gửi. Realtime không
-- mở thêm gì; nó chỉ đẩy sớm hơn cùng thứ dữ liệu ấy.
--
-- ══════════════════════════════════════════════════════════════════════════
-- KHÔNG ĐỔI REPLICA IDENTITY
-- ══════════════════════════════════════════════════════════════════════════
--
-- Bell chỉ nghe `INSERT`, và với INSERT thì Postgres gửi đủ dòng mới bằng
-- replica identity mặc định. `replica identity full` chỉ cần khi muốn đọc giá
-- trị CŨ của UPDATE/DELETE — và nó bắt Postgres ghi cả dòng cũ vào WAL cho mọi
-- lệnh ghi, tức là đắt hơn cho một thứ ta không dùng. Thêm khi nào thật sự cần.
--
-- ══════════════════════════════════════════════════════════════════════════
-- CHẠY LẠI ĐƯỢC
-- ══════════════════════════════════════════════════════════════════════════
--
-- `alter publication … add table` KHÔNG có dạng `if not exists`, và chạy lần
-- hai thì lỗi "relation is already member of publication". `db push` có thể
-- chạy lại cả thư mục, nên phải tự canh. Khối `do` ở đây là DDL, không phải
-- phép kiểm — nó không cuộn ngược thứ gì như bẫy đã ghi ở 046.
--
-- Cũng kiểm publication có tồn tại không: Supabase tạo sẵn `supabase_realtime`,
-- nhưng một database dựng tay thì không có, và khi đó câu lệnh sẽ nổ với thông
-- báo khó hiểu thay vì bỏ qua.

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    raise notice 'không có publication supabase_realtime — bỏ qua, Realtime chưa bật cho project này';
    return;
  end if;

  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    raise notice 'notifications đã có trong supabase_realtime — không làm gì';
    return;
  end if;

  alter publication supabase_realtime add table public.notifications;
  raise notice 'đã thêm notifications vào supabase_realtime';
end $$;

-- ══════════════════════════════════════════════════════════════════════════
-- KIỂM TRA — chạy ở một lần Run RIÊNG
-- ══════════════════════════════════════════════════════════════════════════
--
-- Đặt ở 056, không đặt ở đây: câu kiểm nằm cùng transaction với DDL chỉ đọc
-- được trạng thái BÊN TRONG transaction đó, nên nó báo thành công cho việc có
-- thể bị cuộn ngược ngay sau. 046 đã trả giá cho đúng chuyện này.
