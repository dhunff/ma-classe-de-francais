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

---

## Thang chấm PE — migration 035 + 036

Chạy **theo thứ tự**, mỗi file một lần dán:

1. `035_exam_grille.sql` — tạo cột `exams.grille`, hàm `grille_hop_le`, ràng
   buộc, và `notify pgrst`. In ba dòng trạng thái, **không** raise exception.
2. `036_exam_grille_check.sql` — 16 phép thử hành vi. Không ghi gì vào bảng.

Rồi đối chiếu từ máy mình:

```bash
npm run check:db
```

### Vì sao tách làm hai file

Bản đầu gộp chung. SQL Editor chạy nguyên file trong **một transaction**, nên
`raise exception` ở khối kiểm cuối file cuộn ngược luôn `alter table` ở đầu
file. Người vận hành báo đã chạy, ứng dụng báo chưa có cột, và **cả hai đều
đúng** — trạng thái sau khi cuộn ngược không phân biệt được với "chưa chạy bao
giờ".

Quy tắc rút ra: **DDL và phép kiểm không nằm chung transaction.** Với migration
chuyển dữ liệu thì gộp là đúng (hỏng thì không muốn áp dụng nửa vời). Với
migration chỉ tạo cấu trúc thì tách, vì bạn muốn giữ cái đã tạo và biết cái gì
chưa đạt.

### Đọc kết quả `check:db`

| Dòng | Nghĩa |
|---|---|
| `exams: thang chấm PE` ✗ | chưa chạy 035, hoặc 035 đã cuộn ngược |
| `hàm grille_hop_le` ✗ | 035 chạy nửa chừng, hoặc PostgREST chưa nạp lại lược đồ |
| `grille_hop_le từ chối thang có tổng lệch` ✗ | hàm có nhưng luôn trả true — ràng buộc là đồ trang trí |
| `answer_key KHÔNG đọc được` ✗ | **đáp án đang lộ.** Xem migration 022, xử lý ngay |

Hai dòng cuối bảng là loại hỏng không nhìn ra được từ giao diện.

### Ứng dụng không hỏng khi thiếu cột

`examStore.js` bắt mã lỗi `42703` rồi truy vấn lại không có cột, và tab soạn
thang hiện hướng dẫn chạy migration. Nghĩa là deploy mã trước migration thì mọi
đề vẫn chấm bằng thang chuẩn — không đề nào vỡ. Không có bước này thì chỉ cần
nhắc tới một cột chưa tồn tại là mất luôn cả danh sách đề thi, vì PostgREST huỷ
cả câu chứ không trả về ít cột hơn.

---

## Kiểm bản tự chấm — 037

```
037_self_assessment_check.sql
```

Chỉ đọc, chạy lại bao nhiêu lần cũng được. Dán vào SQL Editor sau mỗi đợt học
sinh tự chấm, hoặc bất cứ khi nào nghi ngờ.

Nó kiểm năm thứ mà **không ràng buộc nào ở database bắt buộc**:

| Kiểm | Hỏng thì sao |
|---|---|
| `self_score` = tổng các tiêu chí | Con số học sinh nhìn thấy không phải con số họ tạo ra |
| Không tiêu chí nào `note` NULL | Lưu lúc chưa chấm xong |
| Điểm nằm trong 0..`max_score` | — |
| Đủ số tiêu chí của thang | **Âm thầm nhất**: tổng vẫn đúng, màn hình vẫn đẹp, học sinh chấm thiếu mà không ai nói |
| Không có khoá lạ | Giáo viên sửa thang sau khi học sinh đã chấm; điểm cũ neo vào tiêu chí không còn tồn tại |

`check:db` **không** kiểm được những thứ này: `answers` bị RLS lọc theo
`auth.uid()`, nên khoá anon thấy mảng rỗng — đúng như phải thế. Đây là lý do
tồn tại của một file SQL chạy tay bên cạnh bộ kiểm tự động.

---

## Trước khi chạy BẤT KỲ migration nào: kiểm mình đang ở database nào

```sql
select current_database() as db,
       (select count(*) from public.questions) as tong_cau,
       (select count(*) from public.questions where point_gram is not null) as da_gan;
```

Rồi đối chiếu với số đo từ ngoài:

```bash
npm run check:db
```

### Vì sao bước này bắt buộc

Ngày 27/08, ba migration liên tiếp "chạy xong" mà dữ liệu không đổi. Supabase
báo `142 rows`, khối tự kiểm in ra con số ĐÚNG, người vận hành thấy mọi thứ
bình thường — còn ứng dụng thì y nguyên.

Nguyên nhân: **SQL Editor nối tới một database khác với ứng dụng.** Cùng lúc
đó, câu đếm trong editor cho `da_gan = 374` còn đo từ ngoài cho `232`. Cả hai
số đều đúng; chúng chỉ ở hai nơi.

Nút **`Database ▾`** cạnh nút Run là thứ chọn nơi chạy. Supabase có tính năng
branching, và một nhánh preview trông giống hệt production trong trình soạn.

Đây là lần thứ HAI dự án dính đúng loại lỗi này — lần đầu là migration 001 chạy
nhầm sang project `psnrkpccevwetznreuqz` (xem đầu file). Lần đầu là nhầm
PROJECT, lần này là nhầm DATABASE trong cùng project. Triệu chứng giống hệt:
lệnh thành công, dữ liệu không đổi, và không ai sai cả.

**"Lệnh chạy xong" không bao giờ là bằng chứng.** Bằng chứng là đo lại từ phía
ứng dụng.

### Lấy nội dung file migration (Windows)

KHÔNG dùng `cat` trong PowerShell — nó đọc UTF-8 bằng bảng mã ANSI và tiếng
Việt thành `bÃ i táº­p trÃ¹ng láº·p`. Copy từ màn hình đó là dán SQL đã hỏng.

```powershell
Get-Content -Raw -Encoding UTF8 supabase\migrations\042_point_gram_traduction.sql | Set-Clipboard
```

Đọc đúng mã và vào thẳng clipboard — không qua hiển thị, không chọn tay, không
sót dòng.
