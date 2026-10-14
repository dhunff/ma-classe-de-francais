# XSS Security Report

## Status: MEDIUM → đã sửa

## Findings

- 15 chỗ dangerouslySetInnerHTML. Phần lớn hiển thị đề bài do GIÁO VIÊN soạn (tin cậy).
- (MEDIUM, đã sửa) Bài tự luận của HỌC SINH được hiển thị dạng HTML thô ở màn chấm của giáo viên (`TeacherScreens.jsx`) và màn chữa bài (`Student.jsx`): nộp `<img src=x onerror=…>` là chạy mã trong trình duyệt giáo viên. CSP mới đã chặn thuộc tính sự kiện, đây là lớp thứ hai.

## What's already secure

- Neo đáp án dựng bằng mảng React, không dùng HTML thô.

## Recommendations

- (LOW) Có thể lọc cả nội dung giáo viên bằng cùng hàm, phòng tài khoản giáo viên bị chiếm.
