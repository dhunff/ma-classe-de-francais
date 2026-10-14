# XSS Fix Plan

## Changes

- `src/shared/lamSachHtml.js` (mới): giữ thẻ định dạng chữ, bỏ mọi thuộc tính và thẻ nguy hiểm (DOMParser, không chạy script).
- `src/screens/teacher/TeacherScreens.jsx`, `src/screens/student/Student.jsx`: lọc bài học sinh trước khi hiển thị.

## Verification goals

- [x] 6 chuỗi tấn công (img onerror, script, javascript: href, svg onload, iframe, style) đều bị gỡ, chữ hợp lệ giữ nguyên (ĐÃ ĐO trong trình duyệt)
