-- 052 — đóng `s:mcf-profiles` lại trong kv_store
--
-- ══════════════════════════════════════════════════════════════════════════
-- CHẠY CUỐI CÙNG, VÀ CHỈ SAU KHI ỨNG DỤNG ĐÃ CHUYỂN
-- ══════════════════════════════════════════════════════════════════════════
--
-- Thứ tự bắt buộc: 049 (cột) → 050 (chép, hai số đối chiếu khớp) → 051 (hàm)
-- → deploy mã đọc/ghi từ bảng → RỒI mới tới file này.
--
-- Chạy sớm thì trang « Mon Compte » của học sinh im lặng không lưu được gì:
-- `save()` trong src/shared/storage.js bọc trong try/catch và trả `false` mà
-- không ai đọc giá trị đó. Đúng loại hỏng tệ nhất — biểu mẫu báo đã lưu, dữ
-- liệu không đi đâu cả.
--
-- ══════════════════════════════════════════════════════════════════════════
-- HAI THỨ FILE NÀY ĐÓNG
-- ══════════════════════════════════════════════════════════════════════════
--
-- GHI  `kv_student_insert` / `kv_student_update` của 002 cho học sinh ghi vào
--      `s:mcf-profiles`. Ghi kv là ghi đè CẢ object, nên một học sinh xoá
--      được hồ sơ của cả lớp bằng một lời gọi. Gỡ khoá đó khỏi danh sách.
--
-- ĐỌC  `kv_auth_read` cho MỌI người đã đăng nhập đọc mọi khoá `s:%` trừ
--      `s:mcf-teacher-notes`. Địa chỉ nhà và số điện thoại của cả lớp nằm
--      trong danh sách đó. Thêm `s:mcf-profiles` vào chỗ loại trừ.
--
-- Sau file này, `s:mcf-profiles` chỉ còn GIÁO VIÊN đọc và ghi được — nhánh
-- `public.is_teacher()` ở đầu policy đọc, và cặp `kv_teacher_*` cho ghi. Đó
-- đúng là thứ một bản sao lưu cần: còn nguyên, đọc được khi cần đối chiếu,
-- không ai vô tình đè lên.
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO KHÔNG SIẾT `kv_auth_read` MẠNH HƠN
-- ══════════════════════════════════════════════════════════════════════════
--
-- Cách đúng về nguyên tắc là đảo lại: liệt kê những khoá `s:%` học sinh ĐƯỢC
-- đọc, thay vì liệt kê những khoá bị cấm. Danh sách cho phép thì thêm một blob
-- mới là mặc định ĐÓNG; danh sách cấm thì mặc định MỞ, và lỗ hổng này sinh ra
-- đúng từ mặc định đó.
--
-- Không làm ở đây, có ý thức. Còn hơn chục khoá `mcf-*` mà không đọc hết mã
-- nguồn thì không biết màn hình nào cần khoá nào — và đoán sai một cái là một
-- màn hình trắng trơn không báo lỗi, vì `load()` nuốt lỗi và trả về fallback.
-- Một thay đổi vừa siết bảo mật vừa có thể làm hỏng năm màn hình là một thay
-- đổi không ai dám chạy.
--
-- File này sửa đúng cái đã biết là hỏng. Việc đảo sang danh sách cho phép cần
-- một lượt rà từng khoá `load(...)` trong src/, và nó xứng đáng một migration
-- riêng có bộ kiểm riêng.
--
-- Chạy lại được: `drop policy if exists` trước mỗi `create policy`.

-- ──────────────────────────── ĐỌC ────────────────────────────

drop policy if exists kv_auth_read on public.kv_store;

create policy kv_auth_read on public.kv_store
  for select to authenticated
  using (
    public.is_teacher()
    or key like 'p:%'
    or (key like 's:%'
        and key not in ('s:mcf-teacher-notes', 's:mcf-profiles'))
  );

-- ──────────────────────────── GHI ────────────────────────────
--
-- Còn lại `s:mcf-submissions` và `s:mcf-presence`. Cả hai vẫn mang đúng vấn đề
-- mà 002 đã ghi ra: một học sinh cố ý vẫn xoá được bài nộp của cả lớp. Bảng
-- `submissions` (005) đã tồn tại và ứng dụng đã dùng nó; khoá blob kia còn ở
-- đây là do chưa ai gỡ nốt. Đó là việc riêng, không gộp vào file này.

drop policy if exists kv_student_insert on public.kv_store;
drop policy if exists kv_student_update on public.kv_store;

create policy kv_student_insert on public.kv_store
  for insert to authenticated
  with check (
    key like 'p:%'
    or key in ('s:mcf-submissions', 's:mcf-presence')
  );

create policy kv_student_update on public.kv_store
  for update to authenticated
  using (
    key like 'p:%'
    or key in ('s:mcf-submissions', 's:mcf-presence')
  )
  with check (
    key like 'p:%'
    or key in ('s:mcf-submissions', 's:mcf-presence')
  );

-- ══════════════════════════════════════════════════════════════════════════
-- KIỂM TRA SAU KHI CHẠY 052
-- ══════════════════════════════════════════════════════════════════════════
--
-- Cả ba số phải là 0. Khác 0 nghĩa là còn một policy nhắc tới
-- `s:mcf-profiles` — và policy permissive cộng dồn bằng OR, nên chỉ cần MỘT
-- cái sót lại là mọi thứ ở trên thành vô nghĩa.

select
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'kv_store'
      and cmd = 'SELECT' and qual like '%mcf-profiles%'
      and policyname <> 'kv_anon_read_catalogue')                as doc_con_lo,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'kv_store'
      and policyname like 'kv_student_%'
      and coalesce(qual, '') || coalesce(with_check, '') like '%mcf-profiles%')
                                                                 as ghi_con_lo,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'kv_store'
      and policyname = 'kv_auth_read'
      and qual not like '%mcf-profiles%')                        as doc_thieu_loai_tru;
