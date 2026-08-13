# Triển khai phần thanh toán tự động

Hai việc: chạy các migration, và deploy hai Edge Function.

Bạn làm **bước 0, 1 và 2**. Phần còn lại tôi chạy được.

> **Dự án hiện tại là `cdszvnuaibnnkrvynyck`.**
> Tài liệu này từng ghi `psnrkpccevwetznreuqz` — một dự án khác. Hậu quả thật:
> migration `001` được chạy ở đó, còn app chạy ở đây, nên bảng `exercise_access`
> không tồn tại. Hàm webhook vẫn deploy trót lọt và chỉ vỡ khi có người trả tiền
> thật, trả về `write_failed: Could not find the table`.
>
> Trước khi chạy bất cứ lệnh nào bên dưới, đối chiếu `VITE_SUPABASE_URL` trong
> `.env` với project-ref bạn đang thao tác. Hai thứ đó phải khớp.

---

## Bước 0 — Kiểm xem migration nào đã chạy (làm trước tiên)

Dán vào **SQL Editor**. Một lệnh, cho biết cả bốn:

```sql
select
  to_regclass('public.exercise_access') is not null as "001_exercise_access",
  (select count(*) from pg_policies where tablename = 'kv_store') > 1 as "002_kv_store_rls",
  to_regclass('public.profiles') is not null as "003_profiles",
  exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'has_premium_access'
  ) as "004_full_access";
```

Cột nào ra `false` thì chạy file tương ứng trong `supabase/migrations/`.

Chạy **theo đúng thứ tự số**: `002` tạo hàm `public.is_teacher()` mà `003` và
`004` dùng lại, còn `004` thêm cột vào bảng do `003` tạo. Chạy ngược là lỗi
"function does not exist" hoặc "relation does not exist".

---

## Bước 1 — Chạy các migration còn thiếu (bạn làm, 1 lần)

Mở **SQL Editor**, dán toàn bộ nội dung từng file rồi Run, theo thứ tự.

Cách này tránh phải chia sẻ mật khẩu database.

Riêng `001`, kiểm lại sau khi chạy:

```sql
select tablename, rowsecurity from pg_tables where tablename = 'exercise_access';
select policyname, cmd from pg_policies where tablename = 'exercise_access';
```

Kết quả đúng: `rowsecurity = true`, và **chỉ có một policy duy nhất, cmd = SELECT**.
Nếu thấy policy INSERT/UPDATE/DELETE nào cho `anon` thì lỗ hổng vẫn còn — xoá đi.
Bảng này cố tình chỉ cho đọc: client ghi được nghĩa là học sinh tự mở khoá bài
trả phí mà không trả tiền.

Trước khi chạy `002`, phải có ít nhất một tài khoản mang `role: 'prof'`:

```sql
select email, raw_app_meta_data ->> 'role' as role from auth.users;
```

Không có ai là `prof` thì sau khi bật RLS **không ai ghi được gì nữa, kể cả bạn**.
Cấp quyền bằng:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"prof"}'
where email = '…';
```

Rồi đăng xuất và đăng nhập lại — vai trò nằm trong token, cần token mới.

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
npx supabase link --project-ref cdszvnuaibnnkrvynyck
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

- **URL**: `https://cdszvnuaibnnkrvynyck.supabase.co/functions/v1/sepay-webhook`
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
