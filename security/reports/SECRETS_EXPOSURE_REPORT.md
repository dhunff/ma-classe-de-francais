# SECRETS_EXPOSURE Security Report

## Status: PASS

## Findings

- Không có khoá bí mật trong mã nguồn hay lịch sử git (grep sk-, sk-ant-, sk-proj-, sk_live_, AKIA, JWT service_role: 0 kết quả).
- `.env` được theo dõi có chủ ý, chỉ chứa VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY (vốn nằm trong bundle).
- `supabase/.env` (khoá thật) bị .gitignore che; `*.backup.json`, `_*.json` cũng bị che.
- Quét trang thật: `/.env`, `/.git/config`, file sao lưu đều không phục vụ; không có liệt kê thư mục.

## What's already secure

- Khoá OpenAI / SePay / TTS chỉ nằm trong Supabase secrets, đọc ở Edge Function.

## Recommendations

- (LOW) Chưa có `.env.example` mô tả biến cần đặt.
