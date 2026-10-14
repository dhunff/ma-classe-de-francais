# PASSWORD_HASHING Security Report

## Status: N/A

## Findings

- Dùng Supabase Auth (Google OAuth); ứng dụng không tự băm mật khẩu.
- Blob cũ `s:mcf-accounts` (từng chứa mật khẩu thô) hiện rỗng; script strip-account-passwords đã xoá.

## What's already secure

- (không có)

## Recommendations

- (không có)
