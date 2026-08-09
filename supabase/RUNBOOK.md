# Triển khai phần thanh toán tự động

Hai việc: tạo bảng quyền truy cập, và deploy hai Edge Function.

Bạn làm **bước 1 và 2**. Phần còn lại tôi chạy được.

---

## Bước 1 — Tạo bảng (bạn làm, 1 lần)

Mở **SQL Editor** trong Supabase project, dán toàn bộ nội dung file
`supabase/migrations/001_exercise_access.sql` rồi Run.

Cách này tránh phải chia sẻ mật khẩu database. Sau khi chạy, kiểm nhanh:

```sql
select tablename, rowsecurity from pg_tables where tablename = 'exercise_access';
select policyname, cmd from pg_policies where tablename = 'exercise_access';
```

Kết quả đúng: `rowsecurity = true`, và **chỉ có một policy duy nhất, cmd = SELECT**.
Nếu thấy policy INSERT/UPDATE/DELETE nào cho `anon` thì lỗ hổng vẫn còn — xoá đi.

---

## Bước 2 — Đăng nhập CLI (bạn làm, 1 lần)

Trong terminal **của bạn**, tại thư mục `ma-classe/ma-classe`:

```bash
npx supabase login
```

Lệnh này mở trình duyệt để bạn xác nhận. Token được lưu vào hồ sơ người dùng
trên máy bạn — **bạn không phải gửi nó cho ai**. Sau đó các lệnh CLI tiếp theo
tự dùng token đó.

Xong bước này thì nhắn tôi.

---

## Bước 3 — Deploy (tôi chạy)

```bash
npx supabase link --project-ref psnrkpccevwetznreuqz
npx supabase secrets set --env-file .env.secrets.local
npx supabase functions deploy sepay-webhook --no-verify-jwt
npx supabase functions deploy grant-access
```

`--no-verify-jwt` cho `sepay-webhook` là bắt buộc: SePay gọi tới bằng token
riêng của nó ở header `Authorization`, không phải JWT của Supabase. Hàm tự kiểm
token đó. `grant-access` giữ nguyên xác thực mặc định.

---

## Bước 4 — Nối SePay (bạn làm)

Trong bảng điều khiển SePay, thêm webhook:

- **URL**: `https://psnrkpccevwetznreuqz.supabase.co/functions/v1/sepay-webhook`
- **Kiểu xác thực**: API Key / Bearer token
- **Giá trị**: chuỗi `SEPAY_TOKEN` trong `.env.secrets.local`

---

## Bước 5 — Token giáo viên

Mở app, vào **Theo dõi học sinh**, dán chuỗi `TEACHER_TOKEN` từ
`.env.secrets.local` vào ô token. Nó nằm trong `localStorage` máy bạn, **không
bao giờ ghi vào `kv_store`** — chỗ đó ai cũng đọc được.

Đổi token: sửa `.env.secrets.local`, chạy lại `secrets set`, rồi nhập lại trong app.

---

## Sau khi xong: quyền cũ phải cấp lại

Các quyền cấp trước đây nằm ở `kv_store` và **không còn được đọc nữa** — đó là
chủ đích, vì bản ghi ở đó giả mạo được. Vào bảng cấp quyền bấm lại một lượt cho
những học sinh đã thực sự trả tiền.

## Điều này chặn được gì, và không chặn được gì

**Chặn được**: học sinh tự cấp quyền cho mình. Bảng `exercise_access` không
client nào ghi được.

**Chưa chặn**: mọi thứ còn lại trong `kv_store` — điểm số, bài nộp, mã PIN giáo
viên — vẫn để `anon` ghi thoải mái. Muốn đóng nốt thì phải có danh tính thật cho
từng người dùng (Supabase Auth), và đó là dự án riêng.
