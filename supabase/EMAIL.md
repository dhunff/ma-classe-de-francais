# Thư đi ra: SMTP và mẫu thư

Supabase tự gửi thư xác minh tài khoản và đặt lại mật khẩu. Ứng dụng **không**
gửi thư — không có `nodemailer` ở đâu cả, và cũng không thể có: đây là SPA
chạy trong trình duyệt, mọi biến `VITE_*` đều nằm trong gói tải về máy khách,
nên đặt mật khẩu SMTP vào đó là công khai nó.

## 1. Vì sao phải cấu hình SMTP riêng

Supabase có sẵn một máy chủ thư dùng chung, nhưng nó giới hạn khoảng **3
thư/giờ** và chỉ dành cho lúc thử nghiệm. Với một lớp học thật thì đó là
không đủ: ba học sinh đăng ký liên tiếp là người thứ tư không nhận được gì,
và không có thông báo lỗi nào cho họ thấy.

## 2. Resend

Tạo API key tại <https://resend.com/api-keys> — quyền **Sending access** là đủ,
không cần Full access. Key chỉ hiện đúng một lần lúc tạo.

Điền vào Supabase Dashboard → **Authentication → Emails → SMTP Settings** →
bật **Enable Custom SMTP**:

| Trường | Giá trị |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` — đúng chữ này, không phải tên tài khoản của bạn |
| Password | API key ở bước trên |
| Sender email | xem mục 3 |
| Sender name | `FRACILE` |

## 3. Địa chỉ gửi — chỗ dễ vấp nhất

Tài khoản Resend mới **chỉ gửi được tới đúng email đã dùng để đăng ký
Resend**, với địa chỉ gửi `onboarding@resend.dev`. Đủ để tự kiểm thử, nhưng
**học sinh sẽ không nhận được gì**.

Muốn gửi cho người khác thì phải xác minh một domain mình sở hữu: Resend →
**Domains → Add Domain**, rồi thêm các bản ghi DNS (TXT, MX, CNAME) mà Resend
đưa ra vào nơi quản lý domain. Xong thì đặt Sender email thành địa chỉ thuộc
domain đó, ví dụ `noreply@fracile.com`.

Không có domain riêng thì không có đường tắt nào — đó là cách chống giả mạo
người gửi, không phải hạn chế của Resend.

## 4. Mẫu thư

Dán nội dung hai file trong `supabase/templates/` vào Dashboard →
**Authentication → Emails**:

| File | Mục trong Dashboard |
|---|---|
| `confirm-signup.html` | Confirm signup |
| `reset-password.html` | Reset password |

Chúng viết bằng bảng và style nội tuyến vì ứng dụng thư không phải trình
duyệt: Outlook dựng bằng engine của Word, Gmail cắt bỏ thẻ `<style>` ở đầu
trang. Song ngữ Pháp–Việt vì người nhận là học sinh Việt mới học tiếng Pháp —
thư toàn tiếng Pháp thì họ không biết phải bấm gì.

## 5. Xác minh email đang bật hay tắt

Kiểm bằng một lệnh, không cần vào Dashboard:

```bash
curl -s "$VITE_SUPABASE_URL/auth/v1/settings" -H "apikey: $VITE_SUPABASE_ANON_KEY"
```

- `mailer_autoconfirm: false` → người đăng ký phải bấm link xác minh. Đây là
  hành vi đúng, **nhưng nếu SMTP chưa cấu hình thì thư không tới và tài khoản
  mới kẹt lại vĩnh viễn.**
- `mailer_autoconfirm: true` → tài khoản dùng được ngay, không cần xác minh.
  Tiện lúc thử, không nên để vậy khi chạy thật.

## 6. Thử thật

Sau khi cấu hình, mở `/login` → **Quên mật khẩu?** → nhập email của chính bạn.
Thư phải tới trong vòng một phút. Không tới thì xem Resend → **Logs**: ở đó
ghi rõ thư bị từ chối ở bước nào, thông tin hữu ích hơn nhiều so với việc đoán
từ phía Supabase.
