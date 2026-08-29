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
npm run check:exam         # quy đổi điểm + luật đạt/trượt thi thử (19 ca)
npm run check:nav          # mục menu ↔ route ↔ nhãn i18n, cả hai chiều (74 ca)
npm run check:grille       # grille DELF A1–B2 cộng đúng 25, đủ mô tả (59 ca)
npm run check:cors         # Edge Function có cho trình duyệt gọi không
npm run check:hmac         # chữ ký webhook SePay + bản ghim công thức (45 ca)
npm run check:bareme       # mốc cho điểm PE, nhãn Việt, đối chiếu với SQL (457 ca)
npm run check:identity     # luật @username, JS ↔ SQL ↔ i18n (46 ca)
npm run check:db           # database THẬT có khớp giả định của mã nguồn không
```

`check:db` gọi mạng nên không chạy được khi offline, và nó là bộ duy nhất đối
chiếu với hệ thống thật thay vì với mã nguồn. Chạy nó sau mỗi migration.

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

Cùng gốc, khác triệu chứng: **`getComputedStyle` trả về màu ĐANG DỞ của một
transition chưa chạy xong.** Bật bản tối rồi đo nền ô nhập ra `#FAFAFC` (màu
sáng) trong khi biến `--mcf-surface2-rgb` trên chính phần tử đó đã là
`20 20 26`. Không phải lỗi màu — class `transition` khiến `background-color`
nội suy dần, mà tab không vẽ khung thì phép nội suy đứng ở khung đầu tiên,
vĩnh viễn.

Cách phân biệt trong ba mươi giây: nhân bản phần tử, bỏ class `transition`,
gắn vào DOM rồi đo. Ra màu đúng nghĩa là CSS không sai, chỉ có phép đo sai.

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

**REVOKE khỏi `PUBLIC` KHÔNG xoá quyền cấp riêng cho `anon` / `authenticated`.**
Supabase cấp thẳng cho hai vai đó (default privileges), nên phải thu đích danh.
Đã dính hai lần: quyền CỘT ở 022, quyền HÀM ở 024 — lần sau suýt cho học sinh
gọi `_exam_play` với `p_max: 999` và nghe không giới hạn. Kiểm bằng
`has_function_privilege`, đừng tin câu REVOKE vừa viết.

**Phép kiểm nằm cùng transaction với thứ nó kiểm thì vô giá trị.** 035 dạy
"đừng đặt khối tự kiểm biết `raise exception` chung transaction với DDL". Tôi
đọc thành "không ném lỗi thì an toàn" và kết thúc 046 bằng một câu `select`
đếm cột. Nó in `cot_moi = 3` trong khi ba cột không hề tồn tại sau đó — bên
trong transaction thì `alter table` đã có hiệu lực, nên select đọc đúng trạng
thái lúc ấy, rồi transaction cuộn ngược.

Sai theo hướng tệ hơn cả 035: khối `do` ném lỗi ít ra còn hỏng to tiếng, còn
một câu select thì BÁO THÀNH CÔNG cho việc sắp bị huỷ. Người vận hành đọc số,
tin là xong, và ta mất một ngày đi tìm ở chỗ khác.

Nguyên tắc: phép kiểm phải chạy ở **một lần Run RIÊNG**, sau khi transaction
kia đã commit. Nay 046 tạo, 048 kiểm, `check:db` đo lần thứ ba từ ngoài.

**`information_schema` lọc theo quyền; `pg_attribute` thì không.** Một cột bị
giấu vì quyền trông y hệt một cột không tồn tại. Và
`information_schema.column_privileges` khai triển quyền mức BẢNG thành từng
dòng cột, nên một bảng cấp mức bảng nhìn qua khung đó giống hệt một bảng cấp
đủ từng cột — tôi đọc nhầm chỗ này và dựng cả một chẩn đoán sai về "GRANT theo
cột" lên trên nó, viết hẳn một migration để sửa thứ không hỏng.

Muốn biết cột có thật hay không, hỏi danh mục thẳng:

```sql
select attnum, attname, attacl from pg_attribute
where attrelid = 'public.<bảng>'::regclass and attnum > 0 and not attisdropped;
```

`attacl = NULL` nghĩa là không có quyền theo cột — cột thêm sau thừa hưởng
quyền mức bảng, không cần cấp gì.

**So hai hệ thống bằng ĐỊNH DANH của chúng, không bằng dữ liệu bên trong.**
Ngày 28–29/08 mất gần một ngày cho câu hỏi "SQL Editor và API có cùng một
database không". Tôi trả lời nó bằng `count(point_gram) = 232` rồi bằng
`current_database() = postgres`. Cả hai đều vô dụng: một bản sao tạo gần đây
trùng hết số liệu, và mọi database Supabase đều tên `postgres`. Bốn con số
`exam_sections/exams/exercises/questions` khớp nhau tuyệt đối — và vẫn không
chứng minh được gì.

Thứ duy nhất trả lời được là định danh: **project ref**. Trong `.env` thì nó
nằm ở `VITE_SUPABASE_URL`; trong trình duyệt thì ở
Project Settings → Data API → Project URL, và trong chính đường dẫn dashboard
`/dashboard/project/<ref>/`. So hai chuỗi ấy mất năm giây.

Dấu hiệu phụ, đo từ trong database: `select … from pg_stat_activity where
usename = 'authenticator'`. PostgREST giữ kết nối thường trực bằng vai đó.
Không có dòng nào nghĩa là PostgREST không nối tới đây.

CLAUDE.md đã ghi sẵn "lần đầu là migration 001 chạy nhầm sang project khác,
triệu chứng giống hệt". Tôi đọc dòng đó, viết lại nó trong một commit, rồi vẫn
đi hết ba giả thuyết khác — vì tôi TƯỞNG mình đã loại khả năng ấy bằng hai dấu
hiệu tự chọn mà không kiểm xem chúng có phân biệt được gì không.

**Trước khi dùng một con số làm dấu hiệu nhận biết, hỏi: nếu hai bên KHÁC
nhau, con số này có chắc chắn khác không?** Không trả lời được thì nó không
phải dấu hiệu, nó là sự trùng hợp đang chờ đánh lừa mình.

**Đừng dùng SỐ LIỆU DỮ LIỆU làm dấu hiệu nhận biết database.** Tôi dùng
`count(point_gram) = 232` để phân biệt production với nhánh, vì hồi đó nhánh
đọc ra 374. Nhánh mới tạo sao chép nguyên dữ liệu, nên nó cũng ra 232 — dấu
hiệu hết tác dụng từ lúc nhánh cũ bị bỏ, mà tôi vẫn dùng thêm mấy lượt nữa.
Dùng `current_database()` và project ref trên thanh địa chỉ.

**curl KHÔNG kiểm được CORS.** curl gửi thẳng, không làm preflight. Hàm `grade`
khai thiếu `x-client-info` — header mà `functions.invoke` LUÔN gửi — nên curl
trả 200 với điểm đúng, còn ứng dụng bị trình duyệt huỷ request trước khi nó rời
máy, không log ở đâu cả. Hậu quả: 5 lượt thi mở ra, 0 lượt đóng, 0 dòng
`answers`, mọi phần hiện "chờ chấm 0/0". `check:cors` gửi đúng cái preflight mà
trình duyệt gửi, tới hàm đã deploy.

**Đặt lại ĐÚNG giá trị cũ thì React KHÔNG gọi `onChange`.** React gắn một bộ
theo dõi giá trị lên input; giá trị mới bằng giá trị đang có thì sự kiện bị bỏ.

Thanh trượt tự chấm hiển thị ở vị trí 0 khi chưa chấm, nên người muốn cho 0
điểm kéo tới 0 — và **không có gì được ghi**. Tiêu chí đó không được đếm, nút
Lưu khoá vĩnh viễn, người dùng không có đường thoát: mọi thanh trượt đều nằm
đúng chỗ họ muốn, nút thì im lặng. Một buổi tự chấm mất trắng.

Với `range`/`checkbox`, thêm `onPointerUp` và `onKeyUp` để bắt lần TƯƠNG TÁC
kết thúc, chứ không chỉ lần đổi giá trị.

Hai bài học đi kèm, đắt hơn bản thân lỗi:

- **"Chưa nhập" và "nhập giá trị rỗng/0" phải khác nhau BẰNG MẮT.** Vẽ giống
  nhau thì người dùng tin mình đã xong.
- **Kiểm chứng bằng cách gán giá trị qua JS luôn bỏ sót lỗi này** — gọi setter
  rồi tự bắn sự kiện thì bao giờ cũng chạy. Người thật gặp ngay lần đầu.

**Nút bị `disabled` là ngõ cụt.** Bấm, không có gì xảy ra, không ai nói vì sao.
Thà để nút bấm được rồi chỉ ra chỗ còn thiếu — tô viền, cuộn tới, gọi tên.

**Một phần thi = MỘT khối, MỘT đồng hồ, NHIỀU bài.** Từ migration 044 một kỹ
năng chứa được nhiều bài (`exam_sections` vốn đã là bảng nối; thứ chặn chỉ là
`unique (exam_id, code)`). Chỗ dễ phá nhất là coi mỗi bài như một phần thi
riêng — khi đó đề CO ba bài có ba đồng hồ 25 phút, tức 75 phút cho phần mà kỳ
thi thật cho 25.

`gomTheoKyNang()` giữ đúng mô hình: đồng hồ và điểm lấy từ dòng đầu của khối,
KHÔNG cộng dồn. `check:exam` canh chỗ này.

Kéo theo, ba phép cộng phải nhớ: `duration_min` cộng theo KỸ NĂNG chứ không
theo dòng; số phần hiển thị đếm `new Set(code)` chứ không đếm `sections.length`;
và chấm thì cộng THÔ điểm từng bài rồi mới quy về thang 25 một lần — quy đổi
từng bài rồi cộng khiến bài 7 câu nặng bằng bài 15 câu.

Mọi chỗ dùng `sections.find(s => s.code === …)` đều là bug từ 044: nó lấy đúng
bài đầu và bỏ im phần còn lại. Đã sửa ba chỗ (nút Sửa của trình soạn, bảng tổng
quan màn chờ, danh sách đề); tìm thấy chỗ thứ tư thì sửa tiếp.

**"Lệnh chạy xong" KHÔNG BAO GIỜ là bằng chứng dữ liệu đã đổi.** Đo lại từ phía
ứng dụng: `npm run check:db`, hoặc gọi Edge Function `grade` và xem `max`.

Ngày 27/08, ba migration liên tiếp báo thành công — Supabase in `142 rows`,
khối tự kiểm in ra con số đúng — mà ứng dụng không đổi gì. Nguyên nhân:
**SQL Editor nối tới một database khác với ứng dụng** (nút `Database ▾` cạnh
nút Run; Supabase có branching). Cùng lúc, editor đếm được `374` còn đo từ
ngoài được `232`. Cả hai số đều đúng, chỉ ở hai nơi. Xem RUNBOOK.

Lần thứ HAI dự án dính loại lỗi này — lần đầu là migration 001 chạy nhầm sang
project khác. Triệu chứng giống hệt: lệnh thành công, dữ liệu y nguyên, không
ai sai cả.

**Bài học về cách tôi đã tìm sai.** Trước khi đo, tôi đổ lỗi lần lượt cho: khối
`do $$` ở cuối file, ký tự `« »`, kích thước file, rồi mã hoá PowerShell. Bốn
giả thuyết, đều nghe có lý, đều sai — và mỗi lần tôi lại viết lại file theo giả
thuyết đó. Một câu truy vấn `select current_database(), count(*)` chấm dứt tất
cả trong một lượt. **Khi hai bên nhìn thấy hai sự thật khác nhau, hãy hỏi xem
có phải đang nhìn hai thứ khác nhau không — trước khi sửa bất cứ dòng mã nào.**

**`cat` trong PowerShell làm hỏng file UTF-8 khi ĐỌC**, không chỉ khi ghi:
tiếng Việt ra `bÃ i táº­p trÃ¹ng láº·p`, và copy từ màn hình đó là dán SQL hỏng.
Dùng `Get-Content -Raw -Encoding UTF8 <file> | Set-Clipboard`.

**Migration nên có ĐÚNG MỘT câu lệnh** khi làm được. Không phải vì đã chứng
minh nhiều câu thì hỏng — mà vì một câu thì loại sạch cả một lớp nghi ngờ
(chỉ-chạy-câu-dưới-con-trỏ, cuộn ngược giữa chừng, dán thiếu) mà không tốn gì.

**DDL và phép kiểm không được nằm chung một transaction.** SQL Editor chạy
nguyên file trong một transaction, nên `raise exception` ở khối tự kiểm cuối
file cuộn ngược luôn `alter table` ở đầu file. Bản đầu của 035 dính đúng thế:
người vận hành báo đã chạy, ứng dụng báo chưa có cột, **cả hai đều đúng** —
trạng thái sau khi cuộn ngược không phân biệt được với "chưa chạy bao giờ".

Migration chuyển DỮ LIỆU thì gộp vẫn đúng (hỏng thì không muốn áp dụng nửa
vời). Migration chỉ tạo CẤU TRÚC thì tách: giữ cái đã tạo, và biết cái gì chưa
đạt. Nay 035 tạo, 036 kiểm, `check:db` đối chiếu từ ngoài.

**Tailwind BỎ QUA lớp không tồn tại, không báo gì.** `tailwind.config.js` khai
`danger: { DEFAULT, soft }` nên lớp đúng là `bg-danger-soft`; viết
`bg-dangerSoft` thì không có lỗi, không cảnh báo, không CSS — phần tử chỉ mất
nền. Đã lọt lên production ở 5 chỗ (thẻ "dưới ngưỡng" của ExamResults và
ExamMode, ô lỗi, bảng chấm PE): mọi nền cảnh báo đỏ đều trong suốt, và không ai
phát hiện vì chữ vẫn đọc được. `check:design` canh chỗ này.

Lưu ý `C.dangerSoft` là chuyện khác — object màu JS cho inline style, camelCase
ở đó là đúng. Bộ kiểm chỉ bắt trong chuỗi lớp.

**`\b` viết qua đường ống shell thành ký tự backspace 0x08.** Bản đầu của bộ
kiểm trên báo XANH trên một file có lỗi thật, vì regex hoá ra đang đòi một byte
điều khiển vô hình. Đọc mã nguồn không thấy gì sai. Đây đúng là loại lỗi bộ
kiểm ấy sinh ra để bắt, và nó tự dính. Dùng `(?![A-Za-z])`, và sửa file có cấu
trúc bằng Edit — quy tắc 4 ở trên, lần thứ năm.

**"Thử mọi cách cho chắc" là chỗ trốn của lỗi.** Webhook SePay từng thử bốn
công thức ký và chấp nhận cách nào khớp — hợp lý khi chưa có tài liệu, nhưng
nghĩa là ta không còn biết mình đang xác minh cái gì. Giao dịch #76732769 trả
lời: `ts.raw` (`timestamp + "." + body`, kiểu Stripe), ghi ở `webhook_diag`.
Nay webhook GHIM đúng cách đó; ba cách kia vẫn chạy nhưng CHỈ để chẩn đoán, và
401 in ra `format_would_match` để nếu SePay đổi cách ký thì đọc được ngay thay
vì đoán. Nhánh API Key đã gỡ — độ an toàn do đường yếu nhất quyết định.

Bộ kiểm cho việc này đọc MÃ NGUỒN, vì thứ dễ trôi là một dòng trông vô hại
(`dinhDang = …` → `authed = …`) mà mọi kiểm hành vi vẫn xanh. Bản đầu của ca
kiểm chỉ bắt dạng gán trực tiếp và `authed = !!(await verifyAny(…))` đi lọt.

**Kiểm quyền phải hỏng theo chiều KHOÁ.** `isPremium` cũ đòi thêm `price > 0`,
mà Builder cho tick "trả phí" rồi bỏ trống ô giá → `Number("") === 0` → bài
thành MIỄN PHÍ. Chiều hỏng quan trọng hơn bản thân lỗi: một thiếu sót lúc soạn
bài biến thành nội dung phát không, âm thầm. Nay cờ một mình quyết định khoá.

**Thêm cột rồi quên ghi vào nó.** 026 thêm `attempts.exam_id`, 028 mới điền —
suốt quãng giữa mọi lượt thi để NULL, và ba phần CO/CE/PE của cùng buổi thi
trông như ba lần luyện tập rời rạc. Một cột không ai ghi vào thì im lặng y như
cột không tồn tại, chỉ khác là nó khiến người đọc lược đồ tưởng đã có.

**Đếm ô trống thì đếm SỐ DÃY gạch dưới.** Regex `_{3,}.*_{3,}` khớp được với
một dãy bảy gạch (ba cho vế trước, bốn cho vế sau) và báo động giả. Dùng
`array_length(regexp_split_to_array(prompt, '_{3,}'), 1) - 1`.

---

## Việc còn treo

Xem `docs/roadmap-delf.md` — có nhật ký quyết định ở §5.

- **Đề thi thử do GIÁO VIÊN soạn** (bảng exams + exam_sections, migration 026).
  Đề chỉ THAM CHIẾU bài trong thư viện, không chứa câu hỏi — chép câu hỏi sang
  chỗ khác là tách đôi cả ba thứ: đáp án bị khoá ở answer_key, đường chấm của
  Edge Function, và trình soạn Builder. Màn thi nằm NGOÀI vỏ app (không thanh
  bên); soạn đề ở /professeur/examens.
- ~~Tự chấm Production écrite~~ — xong 2026-08-27, đã chạy qua người dùng thật.

  Màn chia đôi (`PESelfEvaluation.jsx`): trái là đề + bài làm cuộn độc lập,
  phải là thang chấm. Mở từ trang kết quả thi thử, chiếm cả trang — nhồi vào
  thẻ `max-w-2xl` thì hai cột thành hai cột giấy hẹp.

  Thang chấm đi qua `shared/grilleRubric.js`, KHÔNG đọc thẳng `delfGrille.js`.
  Nhờ vậy thang do giáo viên soạn (`exams.grille`, migration 035) chỉ là một
  nguồn dữ liệu khác, không cần nhánh `if` nào trong giao diện.

  **Thang đã lưu là JSON đông cứng.** Mỗi lần thang chuẩn đổi — thêm `label_vi`,
  thêm `aide_vi` — mọi thang đã lưu vẫn giữ bản cũ. `chuanHoaGrille()` nâng
  chúng lúc ĐỌC, và chỉ nâng khi giá trị đang lưu đúng bằng bản mặc định cũ;
  khác một chữ nghĩa là giáo viên đã tự viết, và đè lên đó là xoá công của
  người khác. `max_score` không bao giờ đụng tới.

  **Cờ suy ra được từ dữ liệu thì đừng để ai tự đặt.** `official` từng được đặt
  cứng thành `false` ngay khi bấm « Thang riêng », nên một thang giống hệt thang
  chuẩn vẫn khiến học sinh đọc "không phải thang DELF chính thức". Nay tính lại
  ở cả đường ghi lẫn đường đọc.

  Kiểm: `check:grille` (59), `check:bareme` (339), `check:db` (18) chạy trên
  database thật, và `037_self_assessment_check.sql` chạy tay để soi dữ liệu học
  sinh mà RLS không cho khoá anon thấy.
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
