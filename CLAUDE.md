# FRACILE — ghi chú cho phiên làm việc

LMS tự học tiếng Pháp, nhắm DELF B1/B2. React 18 + Vite + Tailwind + Supabase.
Deploy tự động lên Vercel khi push `main` → https://fracile.vercel.app

---

## Chạy thử

```bash
npm run dev              # ứng dụng thật, cần đăng nhập
npm run build
```

`/preview.html` là trang xem thử **không cần đăng nhập** — dựng vỏ app thật với
dữ liệu giả. Đây là cách duy nhất xem được các màn hình sau cổng đăng nhập.
Nó có từ điển i18n RIÊNG; thêm khoá vào `shared/i18n.jsx` mà quên chỗ này thì
trang xem thử hiện khoá thô như `nav.menu`.

## Bộ kiểm — chạy hết trước khi commit

```bash
npm run check:design       # tương phản màu WCAG, token, font
npm run check:imports      # định danh dùng trong JSX mà chưa import
npm run check:grading      # chấm bài tiếng Pháp (46 ca)
npm run check:hooks        # hook đặt sau `return` sớm
npm run check:submissions  # ánh xạ bài nộp ↔ bảng (50 ca)
```

Mỗi bộ sinh ra từ một lỗi thật đã lọt lên production. **Build xanh không có
nghĩa là đúng** — cả năm loại lỗi này đều để build đi qua.

Viết bộ kiểm mới thì phải **chứng minh nó bắt được lỗi**: tạm hoàn tác bản sửa,
chạy lại, thấy nó FAIL. Bộ kiểm chỉ biết xanh là đồ trang trí.

---

## Nguyên tắc không thương lượng

### 1. Không bịa dữ liệu

Mọi con số trên màn hình phải tính được từ dữ liệu thật. Chưa có nguồn thì hiện
**trạng thái rỗng nói rõ lý do**, đừng dựng số minh hoạ — học sinh tin vào những
gì trang này nói.

Ví dụ đang áp dụng: "Chuỗi ngày học" và "Giờ học" hiện dấu gạch kèm câu giải
thích, vì hệ thống chưa ghi hoạt động theo ngày.

Dữ liệu giả để xem bố cục **chỉ** sống trong `src/preview.jsx`.

### 2. Màu đi qua token, không viết cứng

`bg-surface`, `text-ink`, `text-soft`, `bg-primary-soft`… định nghĩa ở
`styles/tokens.css`, khai báo cho Tailwind ở `tailwind.config.js`. Token tự đảo
ở bản tối và được `check:design` đo tương phản.

Ngoại lệ có chủ ý, đã ghi lý do tại chỗ: bốn ô số liệu nhiều màu
(`STAT_GRADIENTS`), dải màu trình độ (`LEVEL_COLORS`), và thanh bên dùng trắng
thẳng vì nền khung không đảo theo bản sáng/tối.

### 3. Tailwind preflight ĐANG TẮT

Nên `<button>` còn viền xám mặc định, `<h1>`/`<p>` còn margin. Mọi nút phải có
`border-0` và nền rõ ràng, mọi tiêu đề phải có `m-0`. Bỏ qua là giao diện vỡ.

### 4. Sửa file bằng công cụ Edit/Write, KHÔNG qua đường ống PowerShell

`Get-Content` của PowerShell 5.1 đọc mặc định bằng ANSI, nên
`Get-Content x | … | Set-Content x -Encoding utf8` biến chú thích tiếng Việt
thành mojibake. Đã xảy ra một lần với `HomeDashboard.jsx`.

Bash + `node -e` an toàn hơn, nhưng chuỗi JSX nhiều dòng vẫn hay vỡ — với sửa
đổi có cấu trúc thì dùng thẳng công cụ Edit.

### 5. Trả lời bằng tiếng Việt

Kể cả khi câu hỏi viết bằng tiếng Anh. Chú thích trong mã cũng tiếng Việt.
Giữ tiếng Anh cho tên biến, lệnh shell, thuật ngữ không có bản dịch quen.

### 6. Tự commit và push, không hỏi

Trong repo này đã được cấp quyền thường trực. Xong việc thì chạy đủ bộ kiểm,
kiểm chứng trên trình duyệt nếu thay đổi nhìn thấy được, rồi commit + push.
Vẫn phải **nói rõ những gì chưa kiểm chứng được**.

Vẫn dừng lại hỏi khi: xoá dữ liệu, đổi cấu hình hạ tầng, hoặc làm hỏng đường vào
hiện có của người dùng.

---

## Kiến trúc

### Vỏ ứng dụng — "thẻ lồng"

`AppLayout.jsx`: nền xanh đặc làm khung, nội dung là tấm thẻ trắng bo góc trái.
Thanh bên **không** `fixed` — nó là phần tử flex cạnh tấm thẻ, để mục đang chọn
chạm được vào mép thẻ (`-mr-3 rounded-l-full bg-bg`) trông như liền khối.

**Trang không cuộn.** Khung cao đúng một màn hình, khoá tràn; chỉ `<main>` cuộn.
Panel phụ (sổ tay) là con `absolute` của tấm thẻ, không phải `fixed` — nhờ vậy
`overflow-hidden` cắt nó theo đúng khung và nó không liếm sang thanh bên.

### Dữ liệu — đang chuyển từ blob sang bảng

| Đã là bảng thật | Còn là blob `kv_store` |
|---|---|
| `profiles`, `exercise_access`, `submissions`, `tips` | `mcf-exercises`, `mcf-practice` (144 KB), `mcf-profiles`, `mcf-accounts`… |

Blob có ba vấn đề: đọc-sửa-ghi làm mất dữ liệu khi hai người sửa cùng lúc, chi
phí đọc tăng tuyến tính, không truy vấn được. **Đừng thêm blob mới.**

Chuyển blob → bảng thì theo khuôn `migrations/005` + `007`: tạo bảng, chép dữ
liệu, **giữ blob làm sao lưu**, kèm câu SQL đối chiếu số lượng, chỉ chuyển ứng
dụng sau khi hai số khớp. `009_tips.sql` là bản mẫu gọn nhất.

RLS: dùng lại `public.is_teacher()` (migration 002) — nó đọc `app_metadata`, chỗ
duy nhất người dùng không tự sửa được. Bọc `(select auth.uid())` trong subquery
để Postgres tính một lần cho cả câu.

### Chấm bài

`shared/gradingEngine.js` — hàm thuần. `fillOk()` trong `shared/questions.js`
gọi vào đó; năm màn hình gọi `fillOk`, nên chỉ có **một** đường chấm.

Dấu tiếng Pháp **được tính** (`strictAccents` mặc định `true`): `ou` ≠ `où`,
`a` ≠ `à`. Bài cho người mới đặt cờ riêng qua `q.strictAccents` hoặc
`exercise.strictAccents`.

Đáp án đọc được cả hai lược đồ: mảng `correctAnswers` (mới) và chuỗi ngăn bằng
`|` (đang có trong kho).

---

## Bẫy đã gặp

**Hook sau `return` sớm** → React error #300, error boundary nuốt cả trang.
Lỗi nằm im 5 ngày trong `Student.jsx`. `check:hooks` bắt được.

**`overflow-x: auto` ép luôn `overflow-y` thành `auto`** → thanh cuộn dọc thừa.
Dùng `.no-scrollbar`. Đã cắn hai lần: thanh bên và lịch.

**Flex/grid item mặc định `min-width: auto`** → cột phình theo nội dung thay vì
để con cuộn. Băng chuyền cần `min-w-0` ở cột chứa nó.

**`rAF` đóng băng ở tab nền** → framer-motion và `ResizeObserver` đứng im khi
kiểm chứng bằng công cụ. Không phải lỗi mã; chụp màn hình để kích hoạt tab.

**Cờ emoji không hiện trên Windows** — nó vẽ thành hai chữ cái vùng, nên
`🇻🇳 VN` đọc ra "VN VN".

**Trình nhập JSON của Builder** phải được cập nhật khi thêm trường vào câu hỏi —
mọi bài đều vào bằng đường đó, quên là trường mới lặng lẽ bị bỏ.

---

## Việc còn treo

Xem `docs/roadmap-delf.md` — có nhật ký quyết định ở §5.

- **Chấm ở client hay server?** Đáp án đang nằm trong bundle. Chấp nhận được cho
  tự luyện, **không** cho thi thử. Phải quyết trước khi làm Mode Examen.
- **Gắn nhãn `competence` + `point_gram` cho 415 câu** — việc tay, mở khoá toàn
  bộ phần phân tích theo kỹ năng.
- **0/415 câu có `explanation`** — hộp giải thích khi sai đã dựng xong nhưng
  chưa có nội dung.
- **Chuyển `exercises`/`questions` sang bảng** — `mcf-practice` đã 144 KB.
- **Không có Production Orale** — 25/100 điểm của kỳ thi, chưa có gì.
- `s:mcf-submissions` vẫn giữ làm sao lưu, chưa xoá.
