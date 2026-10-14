# DATABASE_ACCESS Security Report

## Status: HIGH → đã sửa

## Findings

- RLS BẬT trên cả 40 bảng public.
- (HIGH, đã sửa) Khoá ANON đọc được blob cũ `s:mcf-practice` / `s:mcf-exercises` chứa 185 đáp án của 37 bài gốc, vô hiệu hoá việc giấu answer_key (migration 022). Đo bằng curl với khoá anon.
- (MEDIUM, đã sửa) Mọi học sinh đăng nhập ĐỌC / SỬA / XOÁ được khoá riêng `p:…` của người khác (lịch sử luyện tập, lịch, bản nháp) vì policy kv_store chỉ xét tiền tố; học sinh còn đọc được `s:mcf-teacher-pin`.
- (MEDIUM, đã sửa) Bảng `exercise_access` có policy `using (true)` cho cả anon: người chưa đăng nhập liệt kê được tên học sinh + bài đã mua + số tiền.
- `attempts`, `answers` KHÔNG cấp INSERT/UPDATE cho authenticated (học sinh không tự sửa điểm); `profiles` chỉ giáo viên ghi.

## What's already secure

- Đáp án ở cột answer_key không cấp SELECT; neo đáp án (evidence) cũng khoá.
- Policy dùng is_teacher() (app_metadata) thay vì profiles.role.

## Recommendations

- Theo dõi khi thêm bảng mới: luôn bật RLS + policy theo auth.uid().
