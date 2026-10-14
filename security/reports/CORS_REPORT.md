# CORS Security Report

## Status: LOW → đã sửa trang web

## Findings

- Trước: trang và file tĩnh trả Access-Control-Allow-Origin: * (mặc định Vercel).
- Edge Function trả `*` (supabase/functions/_shared/cors.ts) nhưng xác thực bằng Bearer token, không cookie: trang lạ gọi được nhưng không mang quyền của ai.

## What's already secure

- Allow-Methods của Edge Function chỉ POST, OPTIONS.

## Recommendations

- (LOW) Có thể giới hạn origin của Edge Function về fracile.vercel.app + localhost (cần giữ preflight chạy ở môi trường dev).
