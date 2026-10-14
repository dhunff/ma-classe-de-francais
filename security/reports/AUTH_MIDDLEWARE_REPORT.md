# AUTH_MIDDLEWARE Security Report

## Status: PASS

## Findings

- Không có server riêng: « route » là RPC Postgres + 12 Edge Function.
- Chỉ 5 hàm security definer anon gọi được: 3 hàm trigger (gọi trực tiếp lỗi), `gui_lien_he` (form liên hệ, có chặn lũ), `can_open_exercise`.
- Mọi Edge Function đọc người gọi bằng `auth.getUser(token)`; hàm quản trị (`dong-bo-sheets`, `tao-audio`, `soan-tai-lieu`) đòi app_metadata.role = 'prof' hoặc mã quản trị; `grant-access` so bí mật bằng safeEqual; `sepay-webhook` ghim HMAC.
- `grade` cho gọi không đăng nhập có chủ ý (chấm bài ở /decouvrir) nhưng chỉ ghi khi nhận ra người gọi, và chỉ lộ đáp án câu đã làm.

## What's already secure

- Hàm giáo viên (chi_tiet_hoc_sinh, gv_gia_han_vip, send_announcement…) đều kiểm is_teacher().

## Recommendations

- (LOW) `tao-audio`, `soan-tai-lieu` so mã quản trị bằng `===` thay vì so thời gian hằng; rủi ro thấp qua mạng.
