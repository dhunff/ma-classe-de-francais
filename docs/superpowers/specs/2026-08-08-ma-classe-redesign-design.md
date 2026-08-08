# Ma Classe — Thiết kế lại giao diện

**Ngày:** 2026-08-08
**Phạm vi:** Toàn bộ ứng dụng (landing/login, khu học sinh, khu giáo viên)
**Trạng thái:** Chờ duyệt

---

## 1. Bối cảnh

`ma-classe-de-francais` là nền tảng bài tập tiếng Pháp: giáo viên soạn và chấm bài, học sinh làm bài và theo dõi tiến độ. React 18 + Vite, dữ liệu qua `src/storageShim.js` (localStorage).

### Hiện trạng kỹ thuật

- **Không có file CSS nào.** Style nằm trong ~512 object `style={{}}` inline, chủ yếu trong `src/App.jsx` (3.441 dòng) và `src/PracticeHub.jsx`. Chỉ ~50 chỗ dùng `className`.
- Design token duy nhất là khối template string `FONTS` (`App.jsx:152–193`), khai báo 11 biến `--mcf-*` cho bản sáng và bản tối.
- Object `C` (`App.jsx:25`) map tên ngữ nghĩa → giá trị. Một nửa trỏ vào biến CSS, một nửa **hardcode literal**: `primary "#3D5AF1"`, `accent "#F26B4E"`, `ok "#1E9E6A"`, `warn "#C98412"`, `danger "#DE4B4B"`.
- Font hiện tại: Playfair Display, Lora, Be Vietnam Pro — nạp bằng `@import` bên trong template string JS.
- Ba ngôn ngữ (vi mặc định, fr, en), hai vai trò (prof, élève).
- **Không có test nào.**

### Vấn đề thiết kế

Bản hiện tại là nền kem `#F8F5F0` + Playfair Display + accent nâu-đất (con dấu sáp), kèm icon trang trí tháp Eiffel / croissant / ly rượu / tem thư. Đây vừa là khuôn mẫu giao diện phổ biến nhất, vừa là hình dung "nước Pháp" theo kiểu bưu thiếp du lịch — không liên quan đến việc *học tiếng Pháp*.

### Đối tượng

Học sinh cấp 3 (15–18), sinh viên đại học, và người mới bắt đầu chưa biết tiếng Pháp. Ưu tiên tiếng Việt. Tông cần ấm và rõ ràng — không hàn lâm lạnh lùng, không trẻ con.

---

## 2. Hướng thiết kế

**Sạch và bình thường, kỷ luật về cấu trúc.** Không dùng ẩn dụ vật thể (giấy, vở, bảng đen). Tính cách đến từ typography, hệ màu, và việc cấu trúc mang thông tin thật — không đến từ hoạ tiết.

### Ba nguyên tắc

1. **Cấu trúc phải mã hoá thông tin đúng.** Cấp độ CECRL A1→B2+ là thang *có thứ tự* nên được thể hiện như một thang, vị trí mang nghĩa. Bảy kỹ năng (Grammaire, Vocabulaire, Écoute, Lecture, Production écrite, Traduction, Communication) là *phân loại* không thứ hạng — chip phẳng, **không đánh số 01/02/03**.
2. **Đỏ chỉ có một nghĩa: lỗi và lời chữa.** Không dùng đỏ làm màu trang trí hay đường kẻ cấu trúc ở bất kỳ đâu.
3. **Chỉ một chỗ được to tiếng.** Signature là cột lề dành cho lời chữa (mục 4). Mọi thứ khác giữ im lặng.

---

## 3. Hệ token

### 3.1 Màu — bản sáng

| Biến CSS | Hex | Việc |
|---|---|---|
| `--mcf-bg` | `#F5F5F7` | Nền trang. Xám trung tính, **không** phải kem. |
| `--mcf-surface` | `#FFFFFF` | Thẻ, panel. |
| `--mcf-card` | `#FFFFFF` | Bí danh của `surface`; giữ tên vì code cũ đang dùng. |
| `--mcf-surface2` | `#FAFAFC` | Bề mặt lùi (header bảng, vùng chìm). |
| `--mcf-ink` | `#23232E` | Chữ chính. |
| `--mcf-soft` | `#6E7280` | Chữ phụ, nhãn. |
| `--mcf-line` | `#E4E4EA` | Viền, đường kẻ phân cách. |
| `--mcf-primary` | `#5B4B9E` | **Mới.** Màu chính, tím. Thay `#3D5AF1`. |
| `--mcf-primarysoft` | `#EFECF9` | Nền nhạt của primary. |
| `--mcf-ok` | `#2F7D5C` | **Mới.** Câu đúng, trạng thái hoàn thành. |
| `--mcf-oksoft` | `#E6F3EC` | |
| `--mcf-warn` | `#B87514` | **Mới.** Sắp hết hạn, cảnh báo nhẹ. |
| `--mcf-warnsoft` | `#FBF1E0` | |
| `--mcf-danger` | `#D64545` | **Mới.** Lỗi, câu sai, lời chữa, nộp trễ. |
| `--mcf-dangersoft` | `#FBEAEA` | |

Biến `--mcf-accent` **bị loại**. Màu `#F26B4E` (accent cũ) không còn vai trò: mọi chỗ đang dùng nó phải chuyển sang `primary`, `warn`, hoặc `danger` tuỳ ngữ nghĩa thật của chỗ đó.

### 3.2 Màu — bản tối

Không đảo màu máy móc. Bản tối được chọn riêng.

| Biến CSS | Hex |
|---|---|
| `--mcf-bg` | `#16161C` |
| `--mcf-surface` / `--mcf-card` | `#1E1E27` |
| `--mcf-surface2` | `#14141A` |
| `--mcf-ink` | `#E6E6EC` |
| `--mcf-soft` | `#9A9AA8` |
| `--mcf-line` | `#33333F` |
| `--mcf-primary` | `#9E8FD8` |
| `--mcf-primarysoft` | `#2A2440` |
| `--mcf-ok` | `#4FA07C` |
| `--mcf-oksoft` | `#14301F` |
| `--mcf-warn` | `#D0982F` |
| `--mcf-warnsoft` | `#33280F` |
| `--mcf-danger` | `#E07070` |
| `--mcf-dangersoft` | `#331A1A` |

### 3.3 Thang cấp độ

`LEVEL_COLORS` và `LEVEL_PASTEL` (`App.jsx:31–32`) hiện là 7 màu pastel rời rạc, không mã hoá thứ tự. Thay bằng thang đơn sắc theo `primary`, đậm dần:

| Cấp | Màu chữ/badge (sáng) | Nền nhạt (sáng) |
|---|---|---|
| A1 | `#7E74A8` | `#F2EFFA` |
| A2 | `#6E61A3` | `#EDE9F7` |
| B1 | `#5B4B9E` | `#E7E2F4` |
| B2 | `#4A3B85` | `#E1DBF1` |
| B2+ | `#382C68` | `#DAD3EC` |

**Yêu cầu bắt buộc:** mỗi màu chữ phải đạt tương phản ≥ 4.5:1 trên nền nhạt tương ứng *và* trên `--mcf-surface`. Giá trị trên là điểm xuất phát; phải đo thật khi thi công và chỉnh nếu chưa đạt. Bản tối cần một thang riêng đạt cùng ngưỡng.

### 3.4 Chữ

Đã xác minh cả ba đều có bộ dấu tiếng Việt đầy đủ (subset `U+1EA0-1EF9` trên Google Fonts).

| Vai | Font | Phạm vi dùng |
|---|---|---|
| Display | **Bricolage Grotesque** | *Chỉ* tiêu đề lớn (≥ 28px). Không bao giờ dùng cho chữ chạy. |
| Giao diện | **Be Vietnam Pro** | Mặc định toàn app: nav, nút, nhãn, form, bảng, số liệu. |
| Nội dung đọc | **Newsreader** | *Chỉ* văn bản đọc dài trong bài tập (`ReadingPanel`) và đề bài dạng đoạn văn. |

Playfair Display và Lora bị bỏ. Số họ font nạp về giữ nguyên là 3.

Nạp font chuyển từ `@import` trong template string JS sang thẻ `<link>` kèm `preconnect` trong `index.html` — `@import` chặn render và không cho phép `preconnect`.

**Thang cỡ chữ** (rem, gốc 16px):

| Bậc | Cỡ | Dùng cho |
|---|---|---|
| `display` | 2.5rem → 3.5rem (clamp) | Tiêu đề landing |
| `h1` | 1.75rem | Tiêu đề trang |
| `h2` | 1.25rem | Tiêu đề khối |
| `body` | 1rem | Chữ thường |
| `small` | 0.875rem | Chữ phụ |
| `label` | 0.6875rem, uppercase, letter-spacing 0.12em | Nhãn trường |

### 3.5 Nhịp và hình khối

- **Spacing chạy trên bội số 8px**, nửa bước 4px. Token: `--sp-1: 4px` … `--sp-10: 80px`.
- **Bo góc:** `--r-sm: 8px` (chip, input), `--r-md: 12px` (nút, thẻ), `--r-full: 999px` (pill, avatar). Bỏ các giá trị rời rạc hiện có (`2rem`, `24px`, `999`, `3`…).
- **Đổ bóng:** đúng hai bậc. `--sh-1: 0 1px 2px rgba(35,35,46,.06), 0 1px 3px rgba(35,35,46,.04)` cho thẻ; `--sh-2: 0 8px 24px rgba(35,35,46,.10)` cho lớp nổi (modal, popover). Bỏ toàn bộ bóng nhiều lớp màu hiện có.

---

## 4. Cấu trúc và signature

### 4.1 Signature — cột lề chữa bài

**Lời chữa của giáo viên hiển thị ở một cột lề riêng bên phải nội dung bài làm**, thẳng hàng theo chiều dọc với câu hỏi mà nó nhận xét. Đây là thứ duy nhất được phép nổi bật trong toàn bộ thiết kế.

Lý do: app này về bản chất là vòng lặp *làm bài → nộp → chữa*. Hiện tại `qComments` bị nhét lẫn vào luồng nội dung nên khó phân biệt "đề bài", "bài em viết" và "thầy nhận xét". Tách lời chữa ra cột riêng là quyết định chức năng, không phải trang trí.

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   Câu 3 — Conjuguez au passé composé          │            │
│   ────────────────────────────────────────    │  ← lề chữa │
│   Hier, je ______ (aller) au marché.          │            │
│                                               │  ✕ "suis   │
│   Bài làm: « j'ai allé »                      │    allé »  │
│                                               │    — être, │
│                                               │    pas     │
│                                               │    avoir   │
│                                               │            │
│   Câu 4 — …                                   │            │
│                                               │            │
└───────────────────────────────────────────────┴────────────┘
                                                ↑ đường kẻ dọc
                                                  màu --mcf-line
```

- Đường kẻ dọc ngăn cách dùng `--mcf-line`, **không dùng đỏ**.
- Chữ trong lời chữa dùng `--mcf-danger` khi là sửa lỗi, `--mcf-ok` khi là lời khen/xác nhận.
- **Dưới 900px:** cột lề gập xuống, mỗi lời chữa hiện ngay dưới câu hỏi tương ứng, thụt lề trái 16px và có một đường kẻ dọc `--mcf-danger` dày 2px ở cạnh trái để giữ liên hệ thị giác. Đây là phần khó nhất của thiết kế và phải làm đến nơi đến chốn.

### 4.2 Vỏ ứng dụng

Một đường kẻ dọc `--mcf-line` là ranh giới thật giữa thanh điều hướng và vùng nội dung — cạnh cấu trúc, không phải viền trang trí. Dưới 768px, nav chuyển thành thanh ngang trên đầu và đường kẻ này biến mất.

### 4.3 Landing / Login

Màn hình đăng nhập chính là landing (`Login`, `App.jsx:568`). Bố cục:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│      apprendre                                      │  ← Bricolage Grotesque
│      le français                                    │    tracking siết chặt
│      ──────────────                                 │
│      avec Do Hung                                   │
│                                                     │
│      ┌───────────────────────────────┐              │
│      │  Élève  ·  Professeur         │              │
│      │                               │              │
│      │  TÊN CỦA BẠN                  │              │
│      │  _________________________    │  ← input chỉ │
│      │                               │    gạch chân │
│      │  MẬT KHẨU                     │    không khung
│      │  _________________________    │              │
│      │                               │              │
│      │  [       Vào lớp       ]      │              │
│      └───────────────────────────────┘              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Loại bỏ:** toàn bộ mảng `DECOR` (`App.jsx:617–629` — 11 icon tháp/croissant/rượu/tem/lông vũ), component `FlagFR` (`App.jsx:637`), con dấu sáp chữ H (`App.jsx:678–683`), và các hằng cục bộ `NAVY`/`CREAM`/`GOLD` (`App.jsx:613`).

**Giữ:** tên thương hiệu "Apprendre le français avec Do Hung" (tài sản thật của giáo viên) và `public/logo.png`. Cách trình bày được làm lại hoàn toàn; logo đặt nhỏ, cạnh tiêu đề, không phải icon 46px lẫn trong dòng h1 như hiện tại.

### 4.4 Chuyển động

Đúng một khoảnh khắc dàn dựng khi tải landing: tiêu đề và thẻ đăng nhập vào theo thứ tự, tổng cộng dưới 600ms. Ngoài ra chỉ còn trạng thái `:hover` và `:focus-visible`.

Quy tắc `@media (prefers-reduced-motion: reduce)` hiện có (`App.jsx:179`) được giữ và chuyển vào `base.css`.

---

## 5. Kiến trúc thi công

### 5.1 Cơ chế đổi token không gây vỡ

Đây là mấu chốt khiến việc này khả thi với 512 inline style.

Object `C` (`App.jsx:25`) đã map tên ngữ nghĩa → giá trị, và phần lớn inline style đọc màu qua `C`. Bước một là **trỏ toàn bộ `C` vào biến CSS**, kể cả 5 khoá đang hardcode literal:

```js
const C = {
  bg: "var(--mcf-bg)", card: "var(--mcf-card)", ink: "var(--mcf-ink)",
  soft: "var(--mcf-soft)", line: "var(--mcf-line)",
  primary: "var(--mcf-primary)", primarySoft: "var(--mcf-primarysoft)",
  ok: "var(--mcf-ok)", okSoft: "var(--mcf-oksoft)",
  warn: "var(--mcf-warn)", warnSoft: "var(--mcf-warnsoft)",
  danger: "var(--mcf-danger)", dangerSoft: "var(--mcf-dangersoft)",
};
```

Sau bước này, đổi một dòng trong `tokens.css` là toàn bộ inline style cũ đổi theo, không cần sửa JSX. Khoá `accent` bị xoá khỏi `C`; mọi chỗ tham chiếu `C.accent` phải được xử lý từng chỗ theo ngữ nghĩa thật.

### 5.2 Cấu trúc file style mới

```
src/styles/
  tokens.css       — biến :root, bản sáng + bản tối
  base.css         — reset, body, :focus-visible, prefers-reduced-motion
  components.css   — .mcf-btn .mcf-card .mcf-input .mcf-chip .mcf-level .mcf-table
```

Nạp trong `src/main.jsx` theo thứ tự `tokens → base → components`. Khối `FONTS` template string trong `App.jsx` bị xoá sau khi nội dung đã chuyển hết sang các file này.

**Về độ ưu tiên selector:** `components.css` chỉ dùng selector một lớp (`.mcf-btn`), không dùng selector kiểu phần tử (`button.mcf-btn`), không dùng `!important`. Padding và margin giữa các khối do lớp cha bố cục quyết định, không do lớp con tự đặt — đây là nguồn xung đột phổ biến nhất khi trộn class với inline style.

**Về thứ tự thắng thua:** inline style luôn thắng class. Trong lúc chuyển đổi, một component chỉ được ở một trong hai trạng thái — hoặc còn nguyên inline, hoặc đã chuyển hẳn sang class. **Không trộn hai cách trên cùng một phần tử.**

### 5.3 Tách file

`App.jsx` 3.441 dòng chứa 512 style object là không thể sửa đáng tin cậy trong một file. Tách theo đúng ranh giới component đã tồn tại, **thuần cơ học, không đổi logic**:

| File mới | Component |
|---|---|
| `src/shared/tokens.js` | `C`, `LEVEL_COLORS`, `LEVEL_PASTEL`, `SKILLS`, `QTYPES`, `VF_OPTS` |
| `src/shared/i18n.jsx` | `I18N`, `LangCtx`, `useT`, `getLang` |
| `src/shared/ui.jsx` | `FloatingLayer`, `KebabMenu`, `Doodles`, `Bell` |
| `src/screens/Login.jsx` | `Login` |
| `src/screens/teacher/*.jsx` | `Teacher`, `Accounts`, `StudentDossier`, `Stats`, `StudentTable`, `Builder`, `Progress` (màn hình giáo viên chấm bài) |
| `src/screens/student/*.jsx` | `Student`, `Taking`, `ProfileForm`, `PasswordForm` |
| `src/screens/student/answers/*.jsx` | `OrdreChip`, `OrdreBlocks`, `TableauCompare`, `ConfirmSubmitModal` |
| `src/editor/*.jsx` | `RichTextEditor`, `ReadingPanel` |
| `src/App.jsx` | `App`, `AppInner` — chỉ còn vỏ và định tuyến |

`src/PracticeHub.jsx` (68KB) giữ nguyên vị trí ở đợt 1 — nó đã là file riêng nên không chặn việc gì. Nếu khi vào đợt 2 thấy quá lớn để sửa đáng tin cậy thì tách lúc đó, theo cùng nguyên tắc cơ học.

Hàm thuần và hằng dùng chung (`isQuestionAnswered`, `stripHtml`, `tableauCells`, `validateProfile`, `calculateProfileCompletion`, `PROFILE_FIELDS`, `LEVELS_PROFILE`, `GOALS_PROFILE`) chuyển vào `src/shared/`.

### 5.4 Ba đợt

Mỗi đợt có plan thi công riêng và được nghiệm thu trước khi sang đợt sau.

**Đợt 1 — Nền tảng và mặt tiền**
1. Tạo `tokens.css`, `base.css`, `components.css`; nạp trong `main.jsx`; chuyển font sang `<link>` trong `index.html`.
2. Trỏ `C` vào biến CSS, xoá khoá `accent`, xử lý từng chỗ dùng `C.accent`.
3. Thay `LEVEL_COLORS` / `LEVEL_PASTEL` bằng thang đơn sắc, đo tương phản.
4. Tách file theo mục 5.3.
5. Làm lại `Login` theo mục 4.3.
6. Làm lại vỏ app: header, nav, đường kẻ ranh giới (mục 4.2).

**Đợt 2 — Khu học sinh**
`Student`, `Taking`, `PracticeHub`, `RichTextEditor`, `ReadingPanel`, các component trả lời, `ProfileForm`, `PasswordForm`.

Đây là nơi **cột lề chữa bài** (mục 4.1) được dựng, ở phía học sinh *đọc* lời chữa — tức `Taking` ở chế độ xem lại. Đợt này sinh ra lớp bố cục dùng chung cho cột lề; đợt 3 tái sử dụng nó cho phía giáo viên *viết* lời chữa. Đây là phần rủi ro cao nhất của toàn bộ dự án.

**Đợt 3 — Khu giáo viên**
`Teacher`, `Builder`, `Accounts`, `StudentDossier`, `Stats`, `StudentTable`, và `Progress` (màn hình chấm bài — áp cột lề chữa bài từ đợt 2 vào phía giáo viên nhập nhận xét). Bao gồm biểu đồ Recharts — màu chuỗi dữ liệu phải lấy từ token, không hardcode.

---

## 6. Sàn chất lượng

Áp dụng cho mọi đợt:

- **Responsive** xuống 360px. Không có thanh cuộn ngang ở cấp trang; bảng và biểu đồ tự cuộn ngang trong hộp của chúng.
- **Focus bàn phím thấy được** trên mọi phần tử tương tác, qua `:focus-visible` với vòng `--mcf-primary`. Quy tắc `outline: none` hiện tại ở `App.jsx:178` phải được thay, không được bê nguyên.
- **Tương phản** chữ ≥ 4.5:1, phần tử giao diện ≥ 3:1, ở cả bản sáng và bản tối.
- **`prefers-reduced-motion`** được tôn trọng.
- **Không đổi hành vi.** Đây là việc thiết kế lại. Logic lưu trữ, chấm điểm, i18n, phân quyền giữ nguyên. Mọi thay đổi hành vi phát sinh phải báo riêng, không lặng lẽ gộp vào.

---

## 7. Kiểm chứng

**Dự án không có test tự động nào.** Không giả vờ có. Nghiệm thu mỗi đợt bằng cách chạy dev server và kiểm tra tận mắt:

1. `npm run dev`, mở từng màn hình thuộc đợt đó.
2. Chụp màn hình **bản sáng và bản tối**.
3. Chụp ở **360px** và ở desktop.
4. Đi hết một lượt bằng bàn phím (Tab / Shift+Tab / Enter), xác nhận focus luôn nhìn thấy được.
5. Chạy một luồng thật đầu-cuối: giáo viên tạo bài → học sinh làm và nộp → giáo viên chấm → học sinh xem lời chữa.

Không tuyên bố "xong" cho đợt nào trước khi 5 bước trên chạy thật và kết quả được thuật lại trung thực, kể cả khi có chỗ chưa đạt.

---

## 8. Ngoài phạm vi

Những việc sau **không** thuộc lần này, dù có thể đáng làm:

- Chuyển `storageShim.js` sang Supabase. `@supabase/supabase-js` đã nằm trong `package.json` nhưng chưa được dùng; dữ liệu vẫn ở localStorage.
- Thêm test tự động.
- Thay đổi tính năng, thêm loại câu hỏi mới, đổi cách tính điểm.
- Tối ưu hiệu năng ngoài việc chuyển cách nạp font.
- Trang giới thiệu công khai tách khỏi màn hình đăng nhập.
- Dịch bổ sung. Ba ngôn ngữ hiện có được giữ nguyên; chuỗi mới phát sinh phải thêm đủ vào cả `vi`, `fr`, `en`.
