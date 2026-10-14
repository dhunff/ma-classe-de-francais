# Security Audit Summary

Date: 2026-10-15 · Công cụ: vibe-check (live scan + AI-CHECKLIST)

## Results

| # | Category | Status | Report | Plan |
|---|----------|--------|--------|------|
| 1 | SECRETS_EXPOSURE | PASS | [report](reports/SECRETS_EXPOSURE_REPORT.md) | [plan](plans/SECRETS_EXPOSURE_PLAN.md) |
| 2 | DATABASE_ACCESS | HIGH → đã sửa | [report](reports/DATABASE_ACCESS_REPORT.md) | [plan](plans/DATABASE_ACCESS_PLAN.md) |
| 3 | AUTH_MIDDLEWARE | PASS | [report](reports/AUTH_MIDDLEWARE_REPORT.md) | [plan](plans/AUTH_MIDDLEWARE_PLAN.md) |
| 4 | ACCESS_CONTROL | PASS (1 điểm LOW) | [report](reports/ACCESS_CONTROL_REPORT.md) | [plan](plans/ACCESS_CONTROL_PLAN.md) |
| 5 | FRONTEND_SECRETS | PASS | [report](reports/FRONTEND_SECRETS_REPORT.md) | [plan](plans/FRONTEND_SECRETS_PLAN.md) |
| 6 | SSRF | PASS | [report](reports/SSRF_REPORT.md) | [plan](plans/SSRF_PLAN.md) |
| 7 | CSRF | PASS (N/A) | [report](reports/CSRF_REPORT.md) | [plan](plans/CSRF_PLAN.md) |
| 8 | SECURITY_HEADERS | HIGH → đã sửa | [report](reports/SECURITY_HEADERS_REPORT.md) | [plan](plans/SECURITY_HEADERS_PLAN.md) |
| 9 | CORS | LOW → đã sửa trang web | [report](reports/CORS_REPORT.md) | [plan](plans/CORS_PLAN.md) |
| 10 | RATE_LIMITING | LOW | [report](reports/RATE_LIMITING_REPORT.md) | [plan](plans/RATE_LIMITING_PLAN.md) |
| 11 | SQL_INJECTION | PASS | [report](reports/SQL_INJECTION_REPORT.md) | [plan](plans/SQL_INJECTION_PLAN.md) |
| 12 | XSS | MEDIUM → đã sửa | [report](reports/XSS_REPORT.md) | [plan](plans/XSS_PLAN.md) |
| 13 | PAYMENT_WEBHOOKS | PASS | [report](reports/PAYMENT_WEBHOOKS_REPORT.md) | [plan](plans/PAYMENT_WEBHOOKS_PLAN.md) |
| 14 | FILE_UPLOADS | PASS (1 điểm LOW) | [report](reports/FILE_UPLOADS_REPORT.md) | [plan](plans/FILE_UPLOADS_PLAN.md) |
| 15 | ERROR_HANDLING | PASS | [report](reports/ERROR_HANDLING_REPORT.md) | [plan](plans/ERROR_HANDLING_PLAN.md) |
| 16 | PASSWORD_HASHING | N/A | [report](reports/PASSWORD_HASHING_REPORT.md) | [plan](plans/PASSWORD_HASHING_PLAN.md) |
| 17 | DEPENDENCIES | MEDIUM → giảm còn LOW | [report](reports/DEPENDENCIES_REPORT.md) | [plan](plans/DEPENDENCIES_PLAN.md) |

## Live scan (https://fracile.vercel.app)

- Trước: fail 3 · warn 4 · pass 7
- Sau: fail 0 · warn 1 · pass 19 (warn còn lại: img-src https có chủ ý)

## Critical / High issues

- HIGH (đã sửa, migration 144): khoá anon đọc được 185 đáp án trong blob cũ s:mcf-practice / s:mcf-exercises.
- HIGH (đã sửa, vercel.json): thiếu CSP và các header bảo mật.
- HIGH (đã sửa, npm audit fix): @xmldom/xmldom.

## Remaining manual verification

- Ctrl+F5 rồi đăng nhập Google bằng tài khoản học sinh: làm một bài luyện tập, một đề thi thử có phần nghe + ghi âm phần nói; xác nhận không có gì bị CSP chặn.
- Đăng nhập học sinh đã mua bài trả phí: bài vẫn mở (exercise_access chỉ còn đọc được dòng của chính mình).
- Mở trang Luyện tập: lịch sử « đã làm » vẫn hiện đúng (khoá p:mcf-ph-<tên> giờ chỉ chủ đọc).
- Đăng nhập giáo viên: màn chấm bài tự luận hiển thị bài học sinh bình thường.
