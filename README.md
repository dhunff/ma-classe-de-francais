# Ma Classe de Français

Nền tảng bài tập tiếng Pháp cho giáo viên và học sinh.

## Chạy trên máy (Cursor / VS Code)

```bash
npm install
npm run dev
```

Mở http://localhost:5173

## Đăng nhập lần đầu

- Tab **Professeur**: nhập mã PIN bất kỳ (>= 4 ký tự) — đây sẽ là PIN của bạn từ đó về sau.
- Vào tab **Élèves** để tạo tài khoản cho học sinh (tên + mật khẩu ban đầu).
- Học sinh đăng nhập tab **Élève** và có thể đổi mật khẩu trong "Mon compte".

## Lưu ý về dữ liệu

Bản chạy local này lưu dữ liệu vào **localStorage của trình duyệt** (xem `src/storageShim.js`),
nghĩa là dữ liệu chỉ nằm trên máy/trình duyệt đang mở — phù hợp để dùng thử.
Muốn nhiều học sinh dùng chung qua Internet, cần thay shim bằng backend thật
(khuyên dùng Supabase: Auth + Postgres + Storage) — cấu trúc hàm get/set/delete/list giữ nguyên.
