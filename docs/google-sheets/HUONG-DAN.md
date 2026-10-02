# Nối FRACILE với Google Sheets (làm một lần, khoảng 5 phút)

Sau khi làm xong, nút **« Đồng bộ Google Sheets »** ở trang Thống kê sẽ tự ghi số
liệu vào bảng tính của bạn: ba trang tính *Tổng quan học sinh*, *Theo ngày*,
*Lượt làm bài* (30 ngày gần nhất), ghi đè mỗi lần bấm.

## 1. Tạo bảng tính và dán mã

1. Mở <https://sheets.new> (đăng nhập Google của bạn), đặt tên, ví dụ « FRACILE — Thống kê ».
2. **Tiện ích mở rộng → Apps Script**.
3. Xoá hết mã mẫu, dán toàn bộ nội dung tệp `docs/google-sheets/Code.gs`, bấm 💾 Lưu.

## 2. Sinh khoá bí mật

1. Ở thanh trên, chọn hàm **`taoKhoa`** rồi bấm **▶ Chạy**.
2. Lần đầu Google hỏi quyền → **Xem lại quyền** → chọn tài khoản → *Nâng cao* →
   *Đi tới …(không an toàn)* → **Cho phép**. (Cảnh báo này xuất hiện với mọi
   script tự viết chưa qua Google duyệt; script chỉ đụng vào chính bảng tính này.)
3. Mở **Nhật ký thực thi**: có dòng `SHEETS_TOKEN = …`. Giữ chuỗi đó, **đừng dán
   vào chat hay vào mã nguồn**.

## 3. Triển khai thành web app

1. **Triển khai → Tùy chọn triển khai mới** → biểu tượng ⚙ → **Ứng dụng web**.
2. *Thực thi với tư cách*: **Tôi**. *Người có quyền truy cập*: **Bất kỳ ai**.
   (Bất kỳ ai *gọi được* địa chỉ, nhưng không có khoá thì script từ chối và không
   ghi gì.)
3. **Triển khai** → chép **URL ứng dụng web** (kết thúc bằng `/exec`).

## 4. Đặt hai bí mật cho máy chủ FRACILE

Chạy trong thư mục dự án (thay hai chỗ `…`):

```bash
npx supabase secrets set SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/…/exec SHEETS_TOKEN=…
```

## 5. Thử

Ctrl+F5 trang Thống kê → **« Đồng bộ Google Sheets »**. Thành công thì hiện số
dòng Google xác nhận đã ghi và nút mở bảng tính.

## Khi có lỗi

| Thông báo | Nghĩa |
|---|---|
| Chưa nối Google Sheets | Bước 4 chưa làm. |
| Sai khoá | `SHEETS_TOKEN` khác khoá trong script — chạy lại `taoKhoa` và đặt lại bí mật. |
| Google trả về không phải dữ liệu | Thường do bước 3 chọn sai *Người có quyền truy cập*, hoặc dán URL của bản nháp thay vì `/exec`. |

Sửa `Code.gs` sau này thì phải **Triển khai → Quản lý triển khai → Chỉnh sửa → Phiên bản mới**, nếu không web app vẫn chạy bản cũ.
