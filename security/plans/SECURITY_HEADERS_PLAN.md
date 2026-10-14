# SECURITY_HEADERS Fix Plan

## Changes

- `vercel.json`: CSP (default-src 'self'; script-src 'self'; object-src 'none'; base-uri, form-action, frame-ancestors 'none'…), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy (micro chỉ self).

## Verification goals

- [x] vibe-check quét lại: 0 FAIL (ĐÃ ĐO: fail 0, warn 1, pass 19)
- [x] Trang giới thiệu và /decouvrir trên production: không lỗi CSP trong console (ĐÃ ĐO)
