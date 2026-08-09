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

### 5. Deploy hàm cấp quyền của giáo viên

```bash
supabase secrets set TEACHER_TOKEN=<chuỗi bí mật khác, dài, tự đặt>
supabase functions deploy grant-access --no-verify-jwt
```

Rồi mở app với tư cách giáo viên → **Theo dõi học sinh** → nhập đúng chuỗi đó
vào ô **Khoá giáo viên**. Khoá nằm trong `localStorage` của máy bạn và **không
bao giờ** được ghi vào cơ sở dữ liệu — ở đó ai cũng đọc được.

Ai có khoá này thì cấp được quyền cho bất kỳ ai. Đừng dùng chung máy đã nhập
khoá, và đừng đặt khoá trùng `SEPAY_TOKEN`.

## Di trú: các quyền cũ không còn hiệu lực

Trước bước này, quyền do giáo viên cấp nằm trong `kv_store`. Ứng dụng **không
còn đọc nguồn đó nữa** — vì chính nó là lỗ hổng: trình duyệt ghi được, nên học
sinh tự cấp quyền cho mình được.

Nghĩa là sau khi triển khai, **mọi quyền đã cấp trước đây sẽ mất**. Số lượng
thường rất ít; cách xử lý là mở bảng cấp quyền và bấm lại cho từng em. Xong thì
xoá khoá cũ cho gọn:

```sql
delete from public.kv_store where key = 's:mcf-access';
```

## Mức bảo vệ sau khi làm đủ 5 bước

Cả hai đường cấp quyền — **mua** và **giáo viên cấp** — đều đi qua Edge Function
giữ `service_role`. Trình duyệt không ghi được vào bảng quyền, nên không còn gì
để giả mạo.

Cái còn lại **không** phải lỗ hổng của phần này, nhưng nên biết: `kv_store` vẫn
cho `anon` toàn quyền đọc ghi. Học sinh vẫn sửa được điểm và bài nộp của người
khác. Đó là việc riêng, cần Supabase Auth để có danh tính thật cho RLS bám vào.
