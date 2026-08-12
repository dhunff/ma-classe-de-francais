-- RLS cho kv_store.
--
-- Hiện trạng: bảng này mở toàn quyền đọc và ghi cho `anon`, mà anon key nằm sẵn
-- trong bundle gửi xuống trình duyệt. Bất kỳ ai trên Internet đều có thể sửa
-- bài tập, sửa điểm, xoá bài nộp của cả lớp, hoặc đọc ghi chú riêng của giáo
-- viên về từng học sinh. Migration này đóng cửa đó lại.
--
-- ĐIỀU MIGRATION NÀY *KHÔNG* SỬA ĐƯỢC — đọc kỹ trước khi yên tâm:
--
--   Mỗi bộ sưu tập là MỘT dòng. Toàn bộ bài nộp của cả lớp nằm chung trong
--   `s:mcf-submissions`. Học sinh nộp bài nghĩa là ghi đè cả dòng đó. RLS chỉ
--   phân quyền được ở mức dòng, nên không có cách nào cho phép "học sinh sửa
--   bài nộp của chính mình" mà cấm "học sinh ghi đè bài nộp của người khác".
--
--   Nói cách khác: sau migration này, người LẠ không phá được nữa, nhưng một
--   học sinh ĐÃ ĐĂNG NHẬP vẫn có thể xoá sạch bài nộp của cả lớp nếu cố tình.
--   Muốn chặn hẳn thì phải tách bài nộp thành bảng riêng, mỗi bài một dòng, gắn
--   với auth.uid() — đó là việc lớn hơn và nên làm sau.
--
-- THỨ TỰ CHẠY — làm sai là tự khoá mình ra ngoài:
--
--   1. Đăng ký tài khoản giáo viên trong app trước (email hoặc Google).
--   2. Chạy lệnh update auth.users ở phần chú thích ngay dưới đây để gắn
--      role 'prof' cho email đó.
--   3. Đăng xuất, đăng nhập lại (vai trò nằm trong token, cần token mới).
--   4. Xác nhận vẫn tạo/sửa được bài tập.
--   5. Lúc đó mới chạy phần còn lại của file này.
--
-- Bật RLS khi chưa có tài khoản nào mang role 'prof' nghĩa là không ai ghi
-- được gì nữa, kể cả bạn.
--
-- Chạy trong SQL Editor của Supabase project.

-- ───────────────────────────── Vai trò ─────────────────────────────
-- Đọc vai trò từ app_metadata, KHÔNG phải user_metadata: user_metadata do
-- chính người dùng ghi được bằng một lời gọi updateUser từ trình duyệt, nên
-- tin vào nó là để học sinh tự phong mình làm giáo viên. app_metadata chỉ
-- service role hoặc SQL sửa được.
--
-- Cấp quyền giáo viên:
--   update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"role":"prof"}'
--   where email = '…';

create or replace function public.is_teacher()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'prof';
$$;

-- ───────────────────────────── Bật RLS ─────────────────────────────

alter table public.kv_store enable row level security;

-- Dọn policy cũ nếu chạy lại migration này.
drop policy if exists kv_anon_read_catalogue on public.kv_store;
drop policy if exists kv_auth_read           on public.kv_store;
drop policy if exists kv_teacher_insert      on public.kv_store;
drop policy if exists kv_teacher_update      on public.kv_store;
drop policy if exists kv_teacher_delete      on public.kv_store;
drop policy if exists kv_student_insert      on public.kv_store;
drop policy if exists kv_student_update      on public.kv_store;
drop policy if exists kv_student_delete      on public.kv_store;

-- ──────────────────────────── ĐỌC ────────────────────────────

-- Khách chưa đăng nhập: chỉ đọc đúng những khoá mà Thư viện công khai cần.
-- Chế độ xem thử ở /decouvrir dựa vào đây. Không thấy bài nộp, tài khoản,
-- lớp, hồ sơ hay ghi chú giáo viên.
create policy kv_anon_read_catalogue on public.kv_store
  for select to anon
  using (key in (
    's:mcf-exercises',
    's:mcf-practice',
    's:mcf-folders',
    's:mcf-custom-cats'
  ));

-- Đã đăng nhập: đọc mọi thứ dùng chung, TRỪ ghi chú riêng của giáo viên —
-- đó là nhận xét về từng học sinh, không phải thứ để học sinh đọc.
-- Khoá `p:` là vùng nháp theo từng người (bản nháp bài làm, cờ đã xem, giờ bắt
-- đầu). Chúng gắn theo TÊN chứ không theo auth.uid() nên không phân quyền chặt
-- hơn được; ít nhất giờ phải đăng nhập mới đụng tới.
create policy kv_auth_read on public.kv_store
  for select to authenticated
  using (
    public.is_teacher()
    or key like 'p:%'
    or (key like 's:%' and key <> 's:mcf-teacher-notes')
  );

-- ──────────────────────────── GHI ────────────────────────────
-- Nhiều policy permissive được OR với nhau, nên giáo viên vẫn ghi được mọi
-- khoá nhờ cặp policy riêng bên dưới.

-- Giáo viên: toàn quyền.
create policy kv_teacher_insert on public.kv_store
  for insert to authenticated
  with check (public.is_teacher());

create policy kv_teacher_update on public.kv_store
  for update to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

create policy kv_teacher_delete on public.kv_store
  for delete to authenticated
  using (public.is_teacher());

-- Học sinh: chỉ ba bộ dùng chung mà giao diện của họ thật sự ghi vào —
-- nộp bài, hồ sơ cá nhân, tín hiệu đang online — cộng vùng nháp `p:`.
-- Không đụng được vào bài tập, tài khoản, lớp, thông báo, ghi chú.
create policy kv_student_insert on public.kv_store
  for insert to authenticated
  with check (
    key like 'p:%'
    or key in ('s:mcf-submissions', 's:mcf-profiles', 's:mcf-presence')
  );

create policy kv_student_update on public.kv_store
  for update to authenticated
  using (
    key like 'p:%'
    or key in ('s:mcf-submissions', 's:mcf-profiles', 's:mcf-presence')
  )
  with check (
    key like 'p:%'
    or key in ('s:mcf-submissions', 's:mcf-profiles', 's:mcf-presence')
  );

-- Học sinh xoá được vùng nháp của mình, và CHỈ vùng nháp. Taking.jsx gọi
-- del(draftKey) cùng del(startKey) ngay sau khi nộp bài. Thiếu policy này thì
-- lệnh xoá thất bại lặng lẽ — del() bọc trong try/catch — và bản nháp cũ nằm
-- lại, có thể được nạp đè lên bài đã nộp ở lần mở sau.
create policy kv_student_delete on public.kv_store
  for delete to authenticated
  using (key like 'p:%');

-- ──────────────────────── Kiểm tra sau khi chạy ────────────────────────
-- Chạy đoạn này để xem policy đã vào chưa:
--
--   select policyname, cmd, roles
--   from pg_policies
--   where tablename = 'kv_store'
--   order by cmd, policyname;
--
-- Và kiểm vai trò của chính bạn sau khi đăng nhập lại:
--
--   select email, raw_app_meta_data ->> 'role' as role
--   from auth.users;

-- ──────────────────────────── Gỡ bỏ ────────────────────────────
-- Nếu app hỏng và cần quay lại ngay:
--
--   alter table public.kv_store disable row level security;
