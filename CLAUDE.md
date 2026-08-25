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
npm run check:exercises    # ánh xạ bài tập ↔ hai bảng (53 ca)
npm run check:store        # kho đề có chỗ nào còn gọi blob không (8 ca)
npm run check:parity       # bộ chấm server vs client có trôi khỏi nhau không
npm run check:exam         # quy đổi điểm + luật đạt/trượt thi thử (29 ca)
```

Mỗi bộ sinh ra từ một lỗi thật đã lọt lên production. **Build xanh không có
nghĩa là đúng** — cả sáu loại lỗi này đều để build đi qua.

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
| `profiles`, `exercise_access`, `submissions`, `tips`, `exercises`, `questions` | `mcf-profiles`, `mcf-accounts`, `mcf-classes`, `mcf-folders`, `mcf-custom-cats`, `mcf-ph-<tên>`… |

Kho đề đi qua `shared/exerciseStore.js`, KHÔNG gọi `load("mcf-practice")` nữa —
`check:store` canh chỗ này. Hai kho phân biệt bằng cột `store`
('practice' | 'assignment'), nên chuyển bài giữa hai bên giờ là một lệnh ghi
chứ không phải ghi hai blob rồi cầu cho đừng hỏng giữa chừng.

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

**Một câu `fill`/`conj` = MỘT ô trống.** Giao diện chỉ dựng một ô nhập, và
`|` trong `accepted` nghĩa là CÁC CÁCH VIẾT được chấp nhận cho cùng một đáp án.
Viết đề hai ô rồi ghi `"arrive|allume"` thì học sinh gõ một vế là được điểm
trọn. Ghi `"a/b"` thì hỏng ngược lại — `/` không phải dấu phân tách nào cả, nên
gõ đúng cả hai vế vẫn sai. Cả 17 câu mắc lỗi này đã tách đôi (migration 017 và
018); **thư viện hiện không còn câu nào ≥2 ô trống**. Đừng tạo câu mới như vậy.

**REVOKE khỏi  KHÔNG xoá quyền cấp riêng cho /.**
Supabase cấp thẳng cho hai vai đó (default privileges), nên phải thu đích danh.
Đã dính hai lần: quyền CỘT ở 022, quyền HÀM ở 024 — lần sau suýt cho học sinh
gọi  với  và nghe không giới hạn. Kiểm bằng
, đừng tin câu REVOKE vừa viết.

**Đếm ô trống thì đếm SỐ DÃY gạch dưới.** Regex `_{3,}.*_{3,}` khớp được với
một dãy bảy gạch (ba cho vế trước, bốn cho vế sau) và báo động giả. Dùng
`array_length(regexp_split_to_array(prompt, '_{3,}'), 1) - 1`.

---

## Việc còn treo

Xem `docs/roadmap-delf.md` — có nhật ký quyết định ở §5.

- ~~Chấm ở server~~ — xong 2026-08-25. Edge Function `grade` chấm, đáp án nằm
  ở cột `answer_key` KHÔNG cấp SELECT cho anon/authenticated (migration 022).
  `payload` chỉ còn phần để dựng câu hỏi.

  **Khoá quyền ở mức CỘT nghĩa là `select("*")` trên bảng đó trả 401**, không
  phải trả về ít cột hơn. Dính đúng một lần ngay sau 022 — cả thư viện trắng
  xoá. `check:store` canh chỗ này.
- ~~Gắn nhãn phân loại~~ — xong 2026-08-20 (migration 011): 215 câu có
  `point_gram`, 54 câu có `competence`. Số sau thấp vì thư viện chỉ có 54 câu
  đọc/nghe hiểu thật; xem docs/roadmap-delf.md §1.2.
- ~~Viết `explanation` cho các nhóm đã gắn nhãn~~ — xong 2026-08-20.
  **190/416 câu**, hết cả bảy nhóm (012–015), và migration 016 chép ngược vào
  hai blob nên học sinh THẬT SỰ thấy được.

  Câu `vf` không có `explanation` (25 câu): chúng đã có `justification` sẵn
  trong payload và giao diện hiện nó ngay dưới đáp án — thêm nữa là hai khối
  chữ nói cùng một điều.

  Còn **201 câu chưa gắn nhãn `point_gram`** — bài đọc/nghe, dịch, viết. Không
  xếp nhóm được thì cũng không viết theo lô được.

  **Bẫy đã trả giá:** viết vào bảng `questions` là viết vào chỗ ứng dụng CHƯA
  đọc. Ba migration đầu (012–014) nằm im, học sinh không thấy chữ nào, cho tới
  khi 016 chép sang blob. Chừng nào chưa nối xong (mục dưới), mọi thay đổi nội
  dung đều phải chạm vào **cả hai blob** — `mcf-practice` (37 bài) VÀ
  `mcf-exercises` (2 bài). Bản đầu của 016 quên blob thứ hai và bộ đối chiếu
  bắt được: 170 thay vì 190.

  Câu `vf` đã có sẵn `justification` trong payload và giao diện hiện nó ngay
  dưới đáp án, nên **không viết `explanation` cho chúng** — sẽ thành hai khối
  chữ nói cùng một điều. 15 câu vf của `temps_present` bỏ qua vì lý do này.

  Lưu ý: **"câu hay sai" vẫn chưa đo được** — `submissions` chỉ 3 dòng và lịch
  sử luyện tập ghi điểm theo cả bài. Cần bảng `answers` mới xếp được thứ tự ưu
  tiên bằng dữ liệu thay vì bằng phán đoán.
- ~~Nối ứng dụng vào bảng `exercises`/`questions`~~ — xong 2026-08-20. Cả 20
  chỗ gọi đã chuyển, `check:store` (8 ca) canh không cho quay lại blob.

  **Đường ĐỌC đã kiểm chứng trên trình duyệt**: `/decouvrir` không đăng nhập,
  không còn lời gọi `kv_store` nào cho kho đề, sáu nhóm đếm ra đủ 37 bài, số
  câu mỗi bài hiện đúng.

  **Đường GHI CHƯA kiểm chứng được** — RLS đòi `is_teacher()`, mà không mở được
  phiên giáo viên. Cần thử tay: soạn bài mới, sửa bài cũ, xoá bài, đổi thư mục,
  và chuyển bài giữa Entraînement ↔ Devoir.

  Blob `s:mcf-practice` / `s:mcf-exercises` VẪN GIỮ làm sao lưu, cộng bản
  `__backup_016`. Chưa xoá, và đừng xoá cho tới khi đường ghi được thử tay.
- **Không có Production Orale** — 25/100 điểm của kỳ thi, chưa có gì.
- `s:mcf-submissions` vẫn giữ làm sao lưu, chưa xoá.
