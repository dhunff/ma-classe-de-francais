# Thu phí tự động — hướng dẫn triển khai

Hai tệp trong thư mục này chuyển việc cấp quyền từ **giáo viên bấm tay** sang
**máy chủ tự ghi nhận khi tiền vào**.

## Vì sao phải có máy chủ

`VITE_SUPABASE_ANON_KEY` được Vite nhúng vào bundle gửi xuống mọi trình duyệt.
Bất cứ quyết định nào giao cho trình duyệt đều giả mạo được bằng devtools. Nên
quyền truy cập trả phí **không thể** do trình duyệt ghi.

Edge Function chạy phía Supabase, giữ `service_role`, và `service_role` bỏ qua
RLS. Đó là lý do nó ghi được vào bảng mà trình duyệt bị chặn.

## Thứ tự triển khai

### 1. Tạo bảng và bật RLS

Mở **SQL Editor** của project, chạy `migrations/001_exercise_access.sql`.

Sau bước này: ai cũng **đọc** được `exercise_access`, **không ai ghi** được từ
trình duyệt. Đó là chủ đích — đừng thêm policy insert.

### 2. Deploy Edge Function

```bash
supabase login
supabase link --project-ref psnrkpccevwetznreuqz
supabase secrets set SEPAY_TOKEN=<chuỗi bí mật bạn tự đặt>
supabase functions deploy sepay-webhook --no-verify-jwt
```

`--no-verify-jwt` là bắt buộc: SePay gọi tới mà không có JWT của Supabase. Việc
xác thực do `SEPAY_TOKEN` đảm nhiệm, kiểm ngay ở đầu hàm.

URL nhận được có dạng:
`https://psnrkpccevwetznreuqz.supabase.co/functions/v1/sepay-webhook`

### 3. Khai báo ở SePay

Trong bảng điều khiển SePay, thêm webhook:

- **URL**: URL ở bước 2
- **Header**: `Authorization: Apikey <đúng chuỗi SEPAY_TOKEN>`
- **Sự kiện**: có tiền vào

### 4. Thử trước khi dùng thật

```bash
curl -X POST "https://psnrkpccevwetznreuqz.supabase.co/functions/v1/sepay-webhook" \
  -H "Authorization: Apikey <SEPAY_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"id":"test-1","transferType":"in","transferAmount":30000,"content":"LMS TestLinh CPAID"}'
```

Trả về `{"ok":true,...}` là đúng. Các phản hồi `{"ignored":...}` nói rõ vì sao
không cấp: sai memo, không tìm thấy bài, thiếu tiền, không có học sinh đó.

## Hàm này từ chối những gì

- Sai hoặc thiếu token → `401`, không ghi gì.
- Tiền ra thay vì tiền vào → bỏ qua.
- Memo không đọc được → bỏ qua, có ghi lại nội dung để bạn xem.
- **Chuyển thiếu tiền → không cấp quyền.** Chuyển 20.000 cho bài 30.000 vẫn là
  chưa mua.
- Tên trong memo không khớp tài khoản có thật → bỏ qua.
- SePay gửi lại cùng một giao dịch → `ref` là `unique` nên không cấp hai lần.

Giá **luôn đọc từ máy chủ**, không bao giờ lấy từ dữ liệu client gửi lên.

## Việc còn lại để bịt kín

Sau khi làm xong hai bước trên, **đường mua bằng tiền đã an toàn**. Nhưng còn
một lối vòng:

Nút *Cấp quyền* của giáo viên hiện vẫn ghi vào `kv_store`, nơi trình duyệt ghi
được. Một học sinh biết kỹ thuật vẫn có thể tự tạo một bản ghi "giáo viên cấp"
cho mình và mở khoá mà không trả tiền.

Bịt lối này cần thêm một Edge Function `grant-access` nhận một khoá bí mật của
giáo viên, và ứng dụng gọi hàm đó thay vì ghi thẳng. Khoá đó **không được** lưu
trong `kv_store` — vì ai cũng đọc được.

Chừng nào chưa làm, hãy hiểu đúng mức bảo vệ hiện có: **webhook chống được việc
khai khống đã trả tiền, chưa chống được việc tự nhận đã được giáo viên cấp.**
