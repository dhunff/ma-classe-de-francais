# SECURITY_HEADERS Security Report

## Status: HIGH → đã sửa

## Findings

- Trước: thiếu CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy (vibe-check: 3 FAIL).

## What's already secure

- HSTS mạnh do Vercel cấp; HTTP → HTTPS 308.

## Recommendations

- (LOW) img-src cho phép mọi https (giáo viên gắn ảnh từ trang ngoài) — giữ có chủ ý.
- Có thể bỏ 'unsafe-inline' ở style-src khi không còn style nội dòng (hiện React dùng style={…} rất nhiều).
