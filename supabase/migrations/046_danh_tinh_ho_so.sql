-- 046 — cột danh tính: tên hiển thị, @username, ảnh đại diện
--
-- CHỈ TẠO CẤU TRÚC. Hàm và quyền nằm ở 047 — chạy file này trước.
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO KHÔNG THÊM POLICY "HỌC SINH SỬA HỒ SƠ CỦA MÌNH"
-- ══════════════════════════════════════════════════════════════════════════
--
-- Đó là cách hiển nhiên, và nó mở một lỗ hổng. Migration 003 đã viết sẵn lý do
-- và lý do đó vẫn đúng: RLS phân quyền theo DÒNG, không theo CỘT. Một policy
--
--     create policy ... for update using (id = auth.uid())
--
-- không có nghĩa "sửa được tên của mình" mà là "sửa được MỌI CỘT trên dòng của
-- mình". Bảng này có `role` và `has_premium_access`. Nghĩa là mọi học sinh tự
-- phong mình làm giáo viên, và tự mở khoá toàn bộ bài trả phí, bằng một lời
-- gọi supabase-js gõ thẳng trong DevTools.
--
-- ── Vậy cấp quyền theo CỘT thì sao? ──
--
--     revoke update on public.profiles from authenticated;
--     grant  update (display_name, username, avatar) on public.profiles
--       to authenticated;
--
-- Cũng không được, và đây là chỗ dễ nhầm nhất: GRANT gắn với VAI, còn giáo
-- viên và học sinh CÙNG là vai `authenticated`. Phân biệt hai bên là việc của
-- `public.is_teacher()` bên trong RLS, mà GRANT thì chạy trước RLS và không
-- biết gì về nó. Thu hồi UPDATE của `authenticated` là chặn luôn giáo viên gán
-- lớp (`class_id`, roster.js) và cấp premium (`has_premium_access`,
-- AccessPanel.jsx).
--
-- ── Nên: một cửa hẹp, không phải một cửa rộng có khoá ──
--
-- `update_my_identity()` là `security definer`, chỉ ghi đúng ba cột, chỉ trên
-- dòng của `auth.uid()`. RLS của 003 giữ NGUYÊN — không thêm, không sửa, không
-- nới. Bề mặt tấn công là ba cột, chứ không phải cả bảng.
--
-- Đánh đổi: mỗi trường mới về sau phải sửa hàm này. Đó là cái giá đúng — nó
-- buộc người thêm cột phải nghĩ xem học sinh có được tự ghi cột đó không.


-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO FILE NÀY CHỈ CÓ DDL
-- ══════════════════════════════════════════════════════════════════════════
--
-- Bản đầu của 046 gộp cả cột, ràng buộc, hai hàm, phần cấp quyền và một khối
-- tự kiểm vào một file. Người vận hành chạy nó và báo đã xong; đo từ ứng dụng
-- thì `profiles.display_name` vẫn không tồn tại. Cả hai đều đúng.
--
-- SQL Editor chạy NGUYÊN FILE trong MỘT transaction. Một câu lỗi ở cuối file
-- cuộn ngược luôn `alter table` ở đầu file — và trạng thái sau khi cuộn ngược
-- không phân biệt được với "chưa chạy bao giờ". Không có lỗi nào còn lại để
-- đọc, không có nửa việc nào được giữ.
--
-- Đây là lần thứ HAI dự án dính đúng chuyện này; lần đầu là 035, và bài học đã
-- nằm trong CLAUDE.md khi tôi viết bản gộp. Nên tách theo đúng khuôn 035/036:
--
--     046  chỉ tạo CẤU TRÚC — cột, ràng buộc, index
--     047  hàm, quyền gọi, và khối tự kiểm
--
-- Chạy 046 trước. Nó ngắn, chỉ có DDL, và `npm run check:db` xác nhận được
-- ngay từ bên ngoài. Chạy 047 sau. Nếu 047 hỏng thì 046 vẫn còn nguyên, và
-- thông báo lỗi nói về đúng thứ đang hỏng.
--
-- Chạy lại được cả hai lần: `if not exists` cho cột, `drop ... if exists`
-- trước mỗi `add constraint`, `create or replace` cho hàm.

-- ══════════════════════════════════════════════════════════════════════════
-- CỘT
-- ══════════════════════════════════════════════════════════════════════════
--
-- Cả ba đều `null` được. Toàn bộ người dùng hiện có sẽ có `username` rỗng, và
-- ứng dụng phải chạy được với hồ sơ chưa đặt tên — ép `not null` ở đây nghĩa là
-- phải bịa ra username cho từng người đang có, mà bịa thì họ không nhận ra
-- chính mình.
--
-- `avatar` — KHÔNG phải `avatar_url`. Nó chứa khoá của một hình vẽ có sẵn
-- ("renard", "chouette"), không phải địa chỉ tệp. Hệ thống chưa có chỗ lưu
-- ảnh, nên một cột tên `_url` chỉ toàn chứa những đường dẫn không tải được là
-- một lời hứa sai. Ràng buộc bên dưới vẫn nhận `https://…` để sau này bật
-- Supabase Storage thì không phải đổi tên cột.

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists username     text,
  add column if not exists avatar       text;

-- ══════════════════════════════════════════════════════════════════════════
-- RÀNG BUỘC
-- ══════════════════════════════════════════════════════════════════════════
--
-- ── Dạng của username ──
--
-- Chỉ chữ thường, số, gạch dưới; 3–20 ký tự; không bắt đầu bằng số (để `@123`
-- không lẫn với một mã số nào đó về sau).
--
-- Chuỗi này PHẢI khớp từng ký tự với `DANG_USERNAME` trong
-- src/shared/identityRules.js. `check:identity` so hai bên và đỏ nếu lệch — vì lệch
-- ở đây không gây lỗi, nó chỉ khiến người dùng gõ một username mà giao diện
-- bảo hợp lệ rồi database từ chối, và không ai hiểu vì sao.
--
-- ── Vì sao không cần unique index trên lower(username) ──
--
-- Ràng buộc dạng đã cấm chữ hoa, nên `unique (username)` là đủ: không tồn tại
-- được hai dòng chỉ khác nhau ở hoa/thường. Client cũng `toLowerCase()` trước
-- khi gửi. Nhiều dòng `null` vẫn hợp lệ với unique — đúng thứ ta cần cho những
-- người chưa đặt username.

alter table public.profiles
  drop constraint if exists profiles_username_dang,
  add  constraint profiles_username_dang
    check (username is null or username ~ '^[a-z_][a-z0-9_]{2,19}$');

alter table public.profiles
  drop constraint if exists profiles_username_duy_nhat,
  add  constraint profiles_username_duy_nhat unique (username);

-- Tên hiển thị: được trùng nhau (hai bạn cùng tên là chuyện bình thường),
-- nhưng không được rỗng-mà-khác-null và không dài quá một dòng.
alter table public.profiles
  drop constraint if exists profiles_display_name_dai,
  add  constraint profiles_display_name_dai
    check (display_name is null
           or char_length(btrim(display_name)) between 1 and 40);

-- Ảnh đại diện: khoá hình có sẵn, hoặc một địa chỉ https cho mai sau.
-- `http://` bị loại: trang chạy trên https, ảnh http sẽ bị trình duyệt chặn.
alter table public.profiles
  drop constraint if exists profiles_avatar_dang,
  add  constraint profiles_avatar_dang
    check (avatar is null
           or avatar ~ '^[a-z][a-z0-9_]{1,23}$'
           or avatar ~ '^https://[^\s]{5,300}$');
-- ══════════════════════════════════════════════════════════════════════════
-- CHO GIÁO VIÊN TÌM HỌC SINH BẰNG @username
-- ══════════════════════════════════════════════════════════════════════════
--
-- Không cần policy mới: `profiles_read_teacher` của 003 đã cho giáo viên đọc
-- mọi dòng. Chỉ cần một index để `where username = …` và `ilike 'ma%'` không
-- quét cả bảng khi lớp đông lên.
--
-- `text_pattern_ops` để index dùng được cho tiền tố (`like 'ma%'`). Ràng buộc
-- unique ở trên đã tạo index thường cho phép so bằng.

create index if not exists profiles_username_prefix_idx
  on public.profiles (username text_pattern_ops)
  where username is not null;

-- ══════════════════════════════════════════════════════════════════════════
-- ĐỪNG KIỂM Ở ĐÂY — PHÉP KIỂM NẰM Ở 048
-- ══════════════════════════════════════════════════════════════════════════
--
-- Bản trước của file này kết thúc bằng một câu select đếm cột, và nó in ra
--
--     cot_moi = 3    rang_buoc = 4
--
-- trong khi ba cột KHÔNG hề tồn tại sau đó. Câu select không nói dối: SQL
-- Editor chạy nguyên file trong MỘT transaction, nên bên trong transaction
-- thì `alter table` đã có hiệu lực và select đọc đúng trạng thái lúc ấy. Nếu
-- transaction cuộn ngược sau đó, cột biến mất còn con số 3 thì người vận hành
-- đã đọc rồi — và tin rằng đã xong.
--
-- Bài học 035 nói đừng đặt khối tự kiểm biết `raise exception` chung
-- transaction với DDL. Tôi đọc thành "không ném lỗi thì an toàn" và vẫn để
-- câu kiểm ở đây. Sai, và sai theo hướng tệ hơn: một khối `do` ném lỗi ít ra
-- còn làm hỏng to tiếng, còn một câu select thì BÁO THÀNH CÔNG cho việc sắp
-- bị huỷ.
--
-- Nguyên tắc rút ra, rộng hơn 035:
--
--     Một phép kiểm chạy trong cùng transaction với thứ nó kiểm thì không
--     kiểm được gì. Nó chỉ xác nhận câu lệnh đã chạy — điều ta vốn đã biết.
--
-- Nên: chạy file này tới hết, ĐỌC thông báo lỗi nếu có, rồi chạy 048 trong
-- một lần Run RIÊNG. Rồi đo lần thứ ba từ ngoài bằng `npm run check:db`.
