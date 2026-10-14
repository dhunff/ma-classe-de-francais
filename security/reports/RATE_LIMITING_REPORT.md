# RATE_LIMITING Security Report

## Status: LOW

## Findings

- Đăng nhập do Supabase Auth (Google OAuth) có giới hạn sẵn.
- Mọi Edge Function tốn tiền có hạn mức: cham-pe 3/ngày, cham-po & nhan-xet-noi 6/24 giờ, cham-phat-am 20/ngày, hoi-leon 10/ngày (VIP không giới hạn), viet-mau chỉ VIP + mỗi bài một bản; gui_lien_he 3/ngày/email + 10/giờ/IP.

## What's already secure

- (không có)

## Recommendations

- (LOW) `grade` không giới hạn lượt gọi (chỉ tốn tính toán, không tốn tiền AI).
- (LOW) Tài khoản VIP không giới hạn lượt AI: một tài khoản VIP bị lộ có thể đốt chi phí; cân nhắc trần cứng ví dụ 100 lượt/ngày.
