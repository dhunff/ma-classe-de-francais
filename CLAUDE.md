# FRACILE — ghi chú cho phiên làm việc

LMS tự học tiếng Pháp, nhắm DELF B1/B2. React 18 + Vite + Tailwind + Supabase.
Deploy tự động lên Vercel khi push `main` → https://www.fracile.vn (fracile.vercel.app vẫn chạy song song)

---

## Chạy thử

```bash
npm run dev              # ứng dụng thật, cần đăng nhập
npm run build            # vite build + dựng sẵn HTML trang công khai (scripts/prerender.mjs)
```

Trang công khai (giới thiệu, ngữ pháp công khai, grille, FAQ, pháp lý) được
dựng sẵn thành dist/<route>/index.html lúc build (18/10). Thêm trang công khai
mới thì thêm vào DUONG_DAN + Routes trong src/prerender.jsx, và module nào chạm
window/document lúc NẠP sẽ làm build dừng.

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
npm run check:exam         # quy đổi điểm + luật đạt/trượt thi thử (85 ca)
npm run check:nav          # mục menu ↔ route ↔ nhãn i18n, cả hai chiều (74 ca)
npm run check:grille       # grille DELF A1–B2 cộng đúng 25, đủ mô tả (59 ca)
npm run check:cors         # Edge Function có cho trình duyệt gọi không
npm run check:hmac         # chữ ký webhook SePay + bản ghim công thức (45 ca)
npm run check:bareme       # mốc cho điểm PE, nhãn Việt, đối chiếu với SQL (457 ca)
npm run check:identity     # luật @username + hồ sơ, JS ↔ SQL ↔ i18n (61 ca)
npm run check:notifs       # gửi thông báo + chuông + luật RPC (38 ca)
npm run check:hoatdong     # nhật ký theo ngày + chuỗi ngày học (32 ca)
npm run check:sm2          # SM-2, lời giải, và đường sinh thẻ cũ PHẢI đang tắt (70 ca)
npm run check:neo          # neo đáp án vào ngữ liệu (59 ca)
npm run check:champe       # khuôn gợi ý chấm PE do AI trả về (38 ca)
npm run check:troichay     # đo độ trôi chảy bài nói từ dấu thời gian từng từ (21 ca)
npm run check:champo       # gộp điểm hai lượt AI chấm phần nói theo grille PO (19 ca)
npm run check:tcf          # TCF Canada + tout public: điểm /699, NCLC (IRCC), CECRL (FEI) (127 ca)
npm run check:tuvung       # Học từ vựng: mạo từ, giống, hình (lucide + Icons8), bộ sinh bài tập
npm run check:dapan        # đáp án phía học sinh + chốt chặn câu ordre (33 ca)
npm run check:dovui        # Đố vui: kho câu, địa danh, giả lập 1 500 Tour không kẹt đường
npm run check:phientoa     # Phiên toà: vụ án, điều luật, luật chấm ba nhát
npm run check:luyentap     # cây Luyện tập theo trình độ + luật tiến trình, chống ngõ cụt
npm run check:css          # lớp Tailwind có thật sinh ra CSS không
npm run check:db           # database THẬT có khớp giả định của mã nguồn không
```

## Chạy migration — dùng CLI, đừng dùng SQL Editor

```bash
npx supabase db push --remote --dry-run   # xem sẽ chạy file nào
npx supabase db push --remote             # CLI mới (11/11) mặc định nhắm DB local, phải có --remote
npm run check:db                 # đo lại TỪ NGOÀI
```

Ngày 28–29/08 mất gần hai ngày vì SQL Editor và Table Editor **báo thành
công mà lược đồ không bao giờ tới được PostgREST**. Cột hiện trong Table
Editor, `pg_attribute` lúc thấy lúc không, `notify pgrst` vô ích, Restart
project vô ích. CLI nối thẳng tới Postgres thì tám migration chạy sạch trong
một lượt và PostgREST thấy ngay.

CLI còn hai thứ SQL Editor không có: `--dry-run` cho biết trước sẽ chạy file
nào (nó đọc `supabase_migrations.schema_migrations`, nên không chạy lại file
cũ — kể cả file xoá dữ liệu như 043), và **thông báo lỗi thật**. File đã chạy
tay trước đó sẽ lỗi "already exists"; đánh dấu bằng
`npx supabase migration repair --status applied <số>` rồi đẩy tiếp.

Migration nào ĐÓNG một đường cũ (siết policy, thu quyền) thì tạm dời ra khỏi
thư mục trước khi đẩy, và chỉ chạy sau khi xác nhận đường mới đã mở. Nhánh
lùi trong mã giả định cửa cũ còn đó.

Cần đọc một câu SQL trên database thật thì dùng:

```bash
npx supabase db query --linked "select …"
```

**Nhớ `--linked`** — thiếu nó thì CLI nối tới Postgres CỤC BỘ (cổng 54322,
cần Docker) và báo `ECONNREFUSED`, chứ không phải nối tới production. Đây là
cách duy nhất đọc được những thứ PostgREST không phơi ra: `pg_publication_tables`,
`pg_policy`, `pg_attribute`, quyền theo cột.

**`db query` KHÔNG giữ khối `begin … commit;` tường minh.** Một câu lệnh đơn thì
tự commit và persist. Nhưng một kịch bản có `begin; … commit;` báo chạy xong,
không lỗi, mà `count(*)` đo ngay sau đó vẫn ra 0 — đã dính 09/09 khi tạo bộ
thẻ thử. Cần ghi nhiều bảng thì viết thành MỘT câu lệnh (CTE ghi dữ liệu), hoặc
nhiều câu chạy riêng. Và luôn đếm lại ở một lần chạy khác.

**Câu SQL dài thì chạy bằng `-f <tệp>`, đừng truyền làm tham số.** Trên Windows, chuỗi
quá ~8 nghìn ký tự làm CLI in « The command line is too long » rồi THOÁT KHÔNG LỖI
— vòng lặp `grep ERROR` không bắt được, bài đọc C1 (02/10) lặng lẽ không vào database
và đề thi tham chiếu tới nó hỏng khoá ngoại. Luôn đếm lại sau khi ghi.

Ngược lại, `begin; … rollback;` thì lại rất hữu ích — đó là cách thử RLS mà
không đụng dữ liệu (xem ngay dưới).

**Thử RLS bằng claim giả, không cần mật khẩu của ai.** Đi thẳng bằng `db query`
là đi bằng vai `postgres`, BỎ QUA mọi policy — ghi được bằng đường đó không
chứng minh gì về đường ghi của ứng dụng. Muốn thử đúng cái PostgREST sẽ làm:

```sql
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"<uuid>","app_metadata":{"role":"eleve"}}';
insert into public.<bảng> …;          -- phải ra 42501 nếu policy đúng
rollback;
```

`is_teacher()` đọc đúng `request.jwt.claims`, nên claim giả đi qua đúng hàm mà
JWT thật đi qua. Đổi vai giữa chừng được: `set local` lần nữa trong cùng khối.

**Ca "không sửa được" chỉ có nghĩa khi vai đó NHÌN THẤY dòng.** Học sinh xoá
được 0 thẻ lúc mọi bộ còn nháp là đúng một cách VÔ NGHĨA — họ không thấy dòng
nào để xoá. Công khai bộ trước (bằng claim giáo viên, cùng khối), rồi mới thử:
"thấy 8, sửa 0, xoá 0" mới là bằng chứng policy ghi đứng vững.

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

Ví dụ đang áp dụng: "Giờ học" hiện dấu gạch kèm câu giải thích, vì hệ thống
chưa đo được thời gian học thật. Cột `daily_activity.minutes` để sẵn cho lúc
đo được và KHÔNG được điền số ước lượng.

"Chuỗi ngày học" từng là ví dụ chính ở đây suốt nhiều tháng. Nó có nguồn thật
từ 02/09 (migration 061). Câu trả lời đúng cho "chưa có nguồn" cuối cùng vẫn
là DỰNG NGUỒN, không phải giữ mãi một ô trống lịch sự — nhưng chỉ khi dựng
được thật, và trong lúc chờ thì ô trống vẫn hơn một con số bịa.

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

Nút/ô nhập CÓ viền thì viết `border border-solid border-line` — thiếu
`border-solid` thì trình duyệt giữ kiểu `outset`/`inset` và vẽ viền 3D có
cạnh đen, dù màu viền đã là xám nhạt (dính 25/09 ở trang giới thiệu).

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

### 6b. Chữ giao diện phải đủ BA thứ tiếng (08/10)

Không viết chữ tiếng Việt/Pháp cứng trong JSX. Dùng khoá i18n (`t("…")`)
hoặc `tr("vi", "fr", "en")` từ `shared/i18n.jsx` (nhận cả JSX). KHÔNG gọi
`tr()` ở cấp module: hằng số tính một lần lúc nạp file sẽ đứng yên ở một
ngôn ngữ, viết thành hàm (`const X = () => [...]`). Rà chữ sót bằng
`RONG=1 node scripts/i18n/trich.cjs <file…>`; áp bản dịch bằng
`node scripts/i18n/ap.cjs <ban-dich.json>`. Nội dung học (đề, câu hỏi tiếng
Pháp) KHÔNG dịch.

### 7. Nội dung học KHÔNG dùng dấu gạch dài « — »

Tiêu đề, đề bài, ngữ liệu, câu hỏi, phương án, lời giải, flashcard, tên đề thi:
dùng « : » (tiếng Pháp có khoảng trắng trước), dấu phẩy, ngoặc đơn cho ý chen,
« • » cho gạch đầu dòng. Chủ dự án yêu cầu 06/10; đã dọn toàn bộ database (sao
lưu trước khi sửa ở bảng `_sao_luu_gach_0610`, khoá kín với anon/authenticated).
Chú thích mã nguồn không thuộc quy tắc này.

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
| `profiles`, `exercise_access`, `submissions`, `tips`, `exercises`, `questions` | `mcf-accounts`, `mcf-classes`, `mcf-folders`, `mcf-custom-cats`, `mcf-ph-<tên>`… |

Hồ sơ mở rộng (địa chỉ, điện thoại, ngày sinh, trường, trình độ, mục tiêu) đã
rời `s:mcf-profiles` sang chín cột trên `profiles` — migration 049–052, đi qua
`shared/profileStore.js`. Blob còn đó làm sao lưu nhưng học sinh không đọc,
không ghi được nữa.

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

**Bẫy này áp cho MỌI thuộc tính có transition, không riêng màu.** Ngày 03/09
nó quay lại ở `transform`, và triệu chứng đọc còn giống một lỗi thật hơn: rê
chuột khỏi thẻ bộ rồi đo, `matches(':hover')` trả `false` mà `transform` vẫn
là `translateY(-6px)`, mũi tên vẫn `translateX(6px)`, bóng vẫn ở mức hover.
Đọc thẳng thì đó là "hiệu ứng dính, không bao giờ trở về" — tôi đã định đi
sửa một thứ hoàn toàn đúng.

Lý do y hệt: chuột rời đi, transition NGƯỢC bắt đầu, tab không vẽ khung nên nó
đóng băng ở khung đầu — tức đúng giá trị hover. Phép nhân bản trả về
`transform: none` và bóng nghỉ, và bản gốc cũng tự về `none` ngay khi trang vẽ
lại.

Đoạn trên viết cho `background-color` nên tôi không nhận ra ngay. Khi đo bất kỳ
thuộc tính nào có `transition`, hỏi trước: **giá trị này có đang trên đường đi
tới đâu đó không?**

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

**Mã trạng thái 200 KHÔNG chứng minh tệp tồn tại.** `vercel.json` rewrite mọi
đường dẫn về `/index.html` cho SPA, nên `/preview.html`, `/abc`, và một chuỗi
bịa hẳn tên đều trả 200 với nội dung y hệt trang chủ. Tôi đọc một mã 200 rồi
kết luận "trang xem thử đang được deploy ra internet" và viết nó vào commit —
trong khi `dist/` không hề có tệp đó, và chính phép đo đầu tiên của tôi đã in
ra dấu hiệu ngược lại.

So NỘI DUNG, đừng nhìn mã trạng thái:

```bash
curl -s https://<host>/<đường> -o /tmp/a; curl -s https://<host>/ -o /tmp/b
cmp -s /tmp/a /tmp/b && echo "chỉ là rewrite" || echo "tệp thật"
```

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

**PostgREST chỉ NHÚNG được qua khoá ngoại TRỰC TIẾP giữa hai bảng trong schema
được phơi.** `the_bo.tac_gia` ban đầu trỏ `auth.users(id)` — đúng về toàn vẹn,
nhưng `select("…, profiles!the_bo_tac_gia_fkey(display_name)")` sẽ không bao
giờ chạy được: `auth` không được phơi, nên không có đường nào từ `the_bo` sang
`profiles` dù `profiles.id` cũng trỏ tới đúng `auth.users.id` đó. Màn thư viện
học sinh khi đó hiện « Không đọc được thư viện » cho MỌI bộ, và mọi bộ kiểm đọc
mã nguồn vẫn xanh. Migration 087 trỏ lại sang `public.profiles(id)` — không nới
lỏng gì, vì `profiles.id` vốn đã trỏ `auth.users`.

Phân biệt hai loại lỗi mất năm giây, và không cần đăng nhập:

```bash
curl "$URL/rest/v1/the_bo?select=id,profiles!the_bo_tac_gia_fkey(x)" -H "apikey: $ANON"
#   42501 permission denied   → quan hệ GIẢI ĐƯỢC, chỉ là anon không có quyền
#   PGRST200 Could not find a relationship → quan hệ KHÔNG tồn tại
```

PostgREST phân giải quan hệ TRƯỚC khi xét quyền, nên khoá anon — vốn bị từ chối
đọc — vẫn đủ để hỏi câu này. Luôn chạy kèm một câu đối chứng với tên bảng bịa,
để chắc hai mã lỗi đó thật sự khác nhau ở đây.

**Bộ kiểm neo vào SỰ TỒN TẠI của một file màn hình thì VỠ, không báo đỏ.**
`check:sm2` đọc `OTaoThe.jsx` rồi `TheGhiNho.jsx` bằng `readFileSync` — hai lần
trong cùng ngày 09/09, mỗi lần gỡ một tính năng là bộ kiểm chết hẳn với
`ENOENT`, và một bộ kiểm chết thì không ai đọc được nó đang nói gì. Neo ca kiểm
vào BẤT BIẾN còn sống ("đường ghi phải tắt cùng lúc với đường đọc"), không vào
việc một file màn hình còn đó.

**Ghi mà không trả gì về thì "không lỗi" không chứng minh đã lưu.** 21–22/09:
học sinh bấm « Tốt » ở màn Flashcard, màn hình lật thẻ, trình duyệt báo 204 —
và database không đổi một dòng; n_tup_upd của `reviews` đứng yên (đã hiệu
chuẩn: một UPDATE kể cả bị rollback luôn làm nó tăng). Cùng hàm, cùng tài
khoản chạy bằng claim giả thì lưu được; đầu dò qua PostgREST bằng khoá anon
cũng lưu được.

Migration 091 thêm `cham_the()` trả BIÊN NHẬN (uid, số dòng đã sửa, reps
sau), và `chamThe()` đối chiếu biên nhận trước khi lật thẻ — hỏng thì chữ đỏ
kèm nguyên biên nhận. Sau đó, tải lại bằng Ctrl+F5 rồi bấm lại: LƯU ĐƯỢC.

**NGUYÊN NHÂN: TAB CHẠY BẢN JS CŨ — chứng minh 23/09.** Phép thử có đối chứng
trên `luu_loi_giai`: đếm trước = 207 câu có lời giải.

  · Viết một lời giải KHÔNG tải lại trang → dòng xanh, đếm lại vẫn 207,
    n_tup_upd của `questions` không đổi. Ghi không tới database.
  · Ctrl+F5 rồi viết HAI lời giải → dòng xanh, đếm lại 209, n_tup_upd +2.

Lặp lại y hệt trên `luu_neo` ngày 23/09: đặt neo ở một tab CHƯA tải lại →
dòng xanh, 7 neo không đổi một ký tự; Ctrl+F5 NGAY TẠI trang đó rồi đặt lại →
dòng xanh, và nội dung bẫy đổi đúng như vừa sửa. Mỗi TAB giữ riêng bản mã của
nó: tải lại tab này không làm mới tab kia.

Cùng cơ chế giải thích cả ba triệu chứng: chấm thẻ Flashcard (22/09), và
`luu_neo` / `luu_loi_giai` đầu tháng 9 — lần đó không ai bắt được vì cả ba
đường đều "thành công" im lặng.

VÌ SAO NÓ IM LẶNG: SPA không tự nạp lại mã khi điều hướng nội bộ, nên một tab
mở từ trước lúc deploy giữ nguyên bản JS cũ vô thời hạn. Bản cũ gọi hàm cũ —
và với hàm cũ, "không lỗi" được coi là "đã lưu".

HAI VIỆC PHẢI LÀM TỪ NAY:
  · Nhờ ai thử sau một lần deploy thì LUÔN bảo họ Ctrl+F5 TRƯỚC. Không có câu
    đó thì mọi kết quả họ báo về đều có thể là kết quả của bản cũ.
  · Hàm ghi phải TRẢ VỀ thứ nó vừa ghi, và client đối chiếu trước khi báo xong
    (migration 091 cho chấm thẻ, 092 cho lời giải + neo). Một hàm `void` thành
    công trông y hệt một hàm chưa từng chạy — đó là thứ đã giấu lỗi này ba tuần.

**VỚI HỌC SINH, `q.answer` LÀ `undefined` — VÀ NÓ IM LẶNG.** Từ migration 022
`answer_key` không cấp SELECT cho trình duyệt; giáo viên vẫn nhận đáp án qua RPC
`get_answer_keys`, học sinh thì không. Mọi đoạn mã so với `q.answer` vì thế chạy
sai mà không ném lỗi nào.

Chạy trên production nhiều tuần, phát hiện 23/09/2026 nhờ chủ dự án gửi ảnh chụp:
  · mọi câu hiện SAI HẾT, kể cả câu đúng — `j === q.answer` không bao giờ khớp,
    còn nhánh `else if` tô đỏ ô học sinh chọn;
  · chữ gạch ngang trên chính ô đang tô xanh;
  · « Tu as obtenu 0/7 » cho bài làm đúng gần hết, trong khi điểm máy chủ lưu vào
    lịch sử lại ĐÚNG — hai con số cho cùng một bài;
  · màn Devoirs in « Bonne réponse : undefined »;
  · mục « Sujet et Corrigé » mở ra một bảng đáp án rỗng.

VÌ SAO KHÔNG BỘ KIỂM NÀO BẮT ĐƯỢC: build xanh, mọi ca đọc mã nguồn xanh, và
/preview.html KHÔNG lộ ra — dữ liệu giả ở đó có sẵn `answer`. Chỉ một tài khoản
học sinh THẬT mới thấy. Đây là lý do "xem thử bằng dữ liệu giả" không thay được
một lần đăng nhập thật.

NGUỒN ĐÚNG là kết quả máy chủ: Edge Function `grade` trả `correct` cho từng câu
và `expected` (đáp án) cho câu làm sai — nó vốn đã trả từ lâu, màn hình chỉ chưa
bao giờ dùng. Điểm hiển thị cũng phải lấy `score`/`max` của máy chủ, đừng cộng
lại ở client.

`check:dapan` ghim danh sách mọi chỗ còn đọc `q.answer` kèm lý do — thêm một chỗ
mới mà không khai thì đỏ. Đã thử phá ba lần (trả điểm về tính tại chỗ, trả gạch
ngang về `q.answer`, mở lại mục Corrigé cho học sinh): cả ba đều bị bắt.

**Câu `ordre`: 4/4 câu trên production mang ĐÁP ÁN BỊ XÁO — sửa 23/09.** Học
sinh xếp ĐÚNG câu sẽ bị chấm SAI. Chưa ai làm (0 lượt) nên chưa ai bị chấm oan.

Cơ chế: `toRows` lấy thứ tự ĐANG CÓ trong trình duyệt làm `answer_key.elements`
rồi xáo bản gửi cho học sinh. Giáo viên mở bài mà KHÔNG nhận được đáp án (RPC
hỏng, hoặc tab chạy bản mã cũ) thì trình duyệt cầm bản đã xáo — bấm Lưu là bản
xáo thành đáp án, mỗi lần lưu thêm một lớp. Bản sao lưu blob không có các câu
này nên không khôi phục được; chủ dự án duyệt lại 4 câu đúng rồi mới ghi.

Chốt chặn: exerciseStore gắn cờ `__daXao` cho câu ordre tải về không kèm đáp
án; `toRows` TỪ CHỐI lưu câu mang cờ; `saveExercise` bắt lỗi đó TRƯỚC lệnh
xoá câu hỏi (ném sau lệnh xoá là mất cả bài).

Kèm hai sửa:
· `ordreOk` so theo CHỮ, không theo id — câu « Le train de nuit… chutes de
  neige » có hai mảnh « de », đổi chỗ chúng ra đúng câu y hệt mà vẫn bị chấm sai.
· màn Luyện tập tô màu câu ordre theo `expected` của máy chủ — với học sinh
  `q.elements` là bản đã xáo, nên câu đúng bị tô đỏ và « Phrase correcte » in
  ra chuỗi lộn xộn.

Đo trên hàm `grade` đã deploy: xếp đúng → đúng; đổi chỗ hai « de » → đúng;
xếp sai → sai, kèm câu đúng.

**`upsert` (INSERT … ON CONFLICT DO UPDATE) đòi quyền SELECT trên cột bị
ghi.** 24/09 tôi đổi saveExercise sang `upsert` để khỏi xoá lịch sử trả lời;
vì `answer_key`/`evidence` cố ý không cấp SELECT, MỌI lần bấm Lưu bài hỏng
(42501) suốt 24–26/09 — chủ dự án phát hiện qua alert « Échec de
l'enregistrement » không kèm lý do. Phép thử lúc sửa chỉ ghi các cột KHÔNG bị
khoá nên xanh. Sửa: RPC `luu_cau_hoi` (104), một transaction. Bài học kép:
thử quyền thì thử ĐÚNG tập cột ứng dụng gửi; và thông báo lỗi phải kèm
`error.message`, không chỉ một câu chung.

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

**Số migration trong câu chữ HIỂN THỊ là một chỗ trôi, và trôi im lặng.** Ba
dải cảnh báo trên trang Tài khoản nói thẳng với người vận hành phải chạy file
nào. Sau khi gộp nhánh hồ sơ, 048–051 dời thành 049–052 — nhưng chuỗi i18n vẫn
nói "migration 048", mà 048 lúc đó đã là file KIỂM của việc danh tính. Chạy nó
thì không có gì xảy ra và không có gì giải thích vì sao.

`check:identity` nay tìm file migration THẬT SỰ chứa thứ đang thiếu (theo nội
dung: `add column … display_name`, `create … update_my_identity`) rồi đối chiếu
với con số trong câu chữ. Đánh số lại lần nữa cũng không làm nó xanh nhầm.

**Script sửa file bằng `String.replace` có thể chèn nguyên bản sao của file vào
giữa một câu.** CLAUDE.md từng phình từ ~440 lên 880 dòng đúng như vậy, và
không ai thấy — file vẫn đọc được, `git diff` thì dài nên lướt qua. Sau mỗi
script sửa file lớn, đếm lại:

```bash
grep -c '^## ' CLAUDE.md      # mỗi tiêu đề phải xuất hiện đúng một lần
```

**Hai lớp Tailwind đánh nhau thì lớp sai có thể thắng, và cũng im lặng.**
`line-clamp-2` đặt `display: -webkit-box`; viết kèm `block` là ghi đè đúng
thuộc tính ấy, và `-webkit-line-clamp: 2` vẫn nằm trong CSS mà không cắt gì.
Đo được: `display` ra `block`, chiều cao 520px thay vì hai dòng 40px.

Khác với bẫy ngay dưới: ở đó lớp KHÔNG sinh ra CSS, `check:css` bắt được. Ở
đây lớp có sinh ra, nên `check:css` xanh — chỉ đo giá trị TÍNH RA mới thấy:

```js
getComputedStyle(el).display        // phải là -webkit-box, không phải block
el.scrollHeight > el.clientHeight   // true nghĩa là thật sự có cắt
```

**GHIM phiên bản thư viện trong Edge Function.** `@supabase/supabase-js@2`
trỏ tới bản v2 mới nhất tại lúc hàm khởi động nguội — hành vi đổi được mà
không ai deploy gì, và không có dòng nào trong git ghi lại.

Ngày 28–30/08 mất hai ngày vì đúng chuyện đó: `auth.getUser()` thôi đọc
header `Authorization` đặt ở `global.headers`, nên `grade` không nhận ra
người gọi. Phần ghi `attempts` nằm trong `if (userId)` còn câu `return` nằm
ngoài — hàm vẫn chấm, vẫn trả điểm ĐÚNG, và không lưu gì.

Hai bài học đi kèm:

- **Dùng `auth.getUser(token)`**, không gọi rỗng. Trong Deno không có nơi
  lưu phiên, nên dạng rỗng phụ thuộc vào việc thư viện có tự đọc header hay
  không — điều không nằm trong hợp đồng.
- **Ghim vào bản `@2` ĐANG phân giải ra**, đo bằng header `X-Esm-Path`:
  `curl -sI https://esm.sh/@supabase/supabase-js@2 | grep X-Esm-Path`.
  Ghim vào đúng bản đang chạy thì thay đổi bằng không; chọn một số cũ hơn là
  vừa ghim vừa nâng cấp ngược, và khi hỏng thì không biết vì cái nào.

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

**Bộ kiểm đọc mã nguồn thì PHẢI bỏ chú thích trước khi soi.** Ba lần dính:
check:identity với SQL, rồi lần `` ngay dưới, rồi check:notifs với JSX. Lý
do luôn giống nhau — chú thích tử tế TRÍCH DẪN đoạn mã sai để giải thích vì
sao không được viết nó, và bộ kiểm đọc trúng câu trích dẫn ấy rồi báo đỏ trên
một file hoàn toàn đúng.

Hậu quả tinh vi hơn con số đỏ: cách nhanh nhất làm nó xanh trở lại là **xoá
đoạn giải thích**. Tức là bộ kiểm phạt đúng thứ ta muốn khuyến khích.

Với JS/JSX, chỉ bỏ khối `/* */` và dòng bắt đầu bằng `//`. Đừng bỏ `//` giữa
dòng — `"https://…"` trong một chuỗi cũng có hai dấu chéo.

**Và đừng ràng ca kiểm vào MỘT lối viết.** Ca "huỷ lượt fetch khi gỡ" tìm
`if (con) setAnnonces`; bản viết lại dùng `if (!con) return;` — đúng hơn, và
làm ca kiểm đỏ. Kiểm cái Ý ĐỊNH, chấp nhận nhiều cách viết.

**Trong JavaScript, `.` không khớp `\r` — không chỉ `\n`.** Bộ lọc chú thích
SQL của `check:identity` viết `d.replace(/--.*$/, "")` trên từng dòng tách bằng
`split("\n")`. Trên file lưu CRLF thì `.*` dừng TRƯỚC `\r`, và `$` (không có cờ
`m`) không khớp ở đó, cả biểu thức trượt, và **không một dòng chú thích nào bị
bỏ**. Hậu quả: ca "046 không thêm policy update nào trên profiles" báo ĐỎ trên
một file đúng, vì nó đọc được câu `create policy … for update` nằm trong khối
chú thích giải thích vì sao KHÔNG viết câu đó. Dùng `split(/\r?\n/)`.

Cùng họ với bẫy `\b` ở trên, và cùng một bài học: bộ kiểm đọc mã nguồn bằng
regex thì chính nó là chỗ dễ sai nhất, vì sai ở đó không tạo ra triệu chứng nào
ngoài một con số pass/fail mà không ai đối chiếu với gì.

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
  19/10: KHÔNG chọn bài từ thư viện nữa. Mỗi phần thi có « Soạn nội dung / Thêm bài » và
  « Sửa nội dung », mở Builder ngay trong ExamComposer, lưu vào kho `exam`.
  « Xem như học sinh » (XemDeThu.jsx): PhanThi với cờ `xemThu` (nghe đếm lượt tại chỗ, tắt ghi
  âm), KHÔNG tạo attempt, không lưu gì. Xem được cả đề đã lưu lẫn bản đang soạn.
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
- **Production Orale — có, nhưng KHÔNG chấm điểm** (migration 057/058).
  DELF chấm phần nói bằng đối thoại với giám khảo; app tự học không mô phỏng
  được, và cho ra một con số là bịa (quy tắc 1). Nên PO cho đề bài, đồng hồ,
  và ghi âm để tự nghe lại — hết.

  `points: 0` và `khongCham: true`. `verdict` LOẠI HẲN phần không chấm trước
  mọi phép tính: để nó lọt vào thì nó rơi vào nhóm "chờ chấm" và kết luận
  đạt/trượt treo vĩnh viễn ở `null`. Tổng vẫn /75, không phải /100, nên lượt
  thi cũ và mới so sánh được.

  Học sinh bỏ chọn được PO ở màn chờ; khi đó tổng phút cam kết cũng giảm
  theo — hứa "tôi có 130 phút" cho một buổi 115 phút là bắt người ta cam kết
  một điều sai.

  **Bản ghi âm nằm ở bucket RIÊNG (`bai-noi`, `public = false`)**, không phải
  bucket đề bài vốn công khai. Giọng nói của trẻ vị thành niên ở một URL đoán
  được là chuyện khác hẳn về pháp lý lẫn đạo đức. Đường dẫn mang phân quyền:
  `<user_id>/<exam_id>/<exercise_id>-<mốc>.webm`, policy chỉ so đoạn thư mục
  đầu với `auth.uid()`. Không có policy xoá và không có policy sửa — ghi lại
  thì tạo file mới, giữ được cả quá trình luyện tập.

  **`exam_sections.code` có một CHECK đóng** (`CO/CE/PE/PO`, migration 059).
  Trước 059 nó chỉ nhận ba mã, nên toàn bộ tính năng PO — cấu trúc, ô bỏ
  chọn, bộ ghi âm, kho file riêng, màn nghe — không tới được ai, vì không
  ghép nổi PO vào một đề nào. Thêm mã phần thi mới thì phải sửa cả ràng buộc
  này. Dòng PO còn bị chặn cứng `points = 0`.

  **Không bộ kiểm nào bắt được chuyện đó.** `check:exam` đọc mã nguồn,
  `check:db` đọc CỘT chứ không đọc ràng buộc CHECK — cả hai xanh trong khi
  tính năng chết ở tầng dưới cùng. Chỗ canh hiện nay là migration 060, và nó
  chỉ chạy một lần lúc push. Khoảng trống này vẫn còn.

  Giáo viên nghe ở `/professeur/oral`. Màn này KHÔNG có ô điểm — cùng lý do
  ở trên. Nhận xét đi đường THÔNG BÁO đang có, không dựng bảng mới: hệ thống
  đã có cách đưa chữ từ giáo viên tới đúng một học sinh, kèm chuông và dấu đã
  đọc. Đánh đổi: nhận xét không dính vào file, nên phần mở đầu tin nhắn tự
  nói rõ nó nói về bản ghi nào.
- **Chuỗi ngày học — xong 02/09** (migration 061/062). Bảng `daily_activity`,
  một dòng mỗi người mỗi ngày, theo đúng roadmap §1.3.

  **Ngày là ngày của NGƯỜI DÙNG, không của máy chủ.** PostgREST chạy ở UTC, nên
  `current_date` ghi sai cho đúng những giờ hay lệch nhất. Client gửi ngày địa
  phương xuống; máy chủ chặn khoảng ±1 ngày để không ai tự đắp chuỗi. Và
  `toISOString()` KHÔNG dùng được — nó đổi sang UTC trước khi cắt chuỗi.

  **Không có policy ghi.** Đường ghi duy nhất là RPC `ghi_hoat_dong`; cho ghi
  thẳng thì phép chặn khoảng ngày thành đồ trang trí. Chuỗi tính ở máy chủ
  (`chuoi_ngay_hoc`) bằng thủ thuật gaps-and-islands, và vẫn sống nếu hôm nay
  chưa học nhưng hôm qua có — đứt lúc 00:00 là trừng phạt người ta đúng lúc họ
  vừa định học.

  **Ba trạng thái trên màn hình, không hai:** chưa hỏi xong / không đọc được /
  số thật kể cả 0. Gộp "không đọc được" với "0 ngày" là nói với người vừa học
  ba ngày liền rằng họ chưa học buổi nào.
- **Thẻ ghi nhớ SM-2 — xong 02/09, GỠ KHỎI GIAO DIỆN 09/09.** (migration
  063–066). Màn `/etudiant/the-ghi-nho` và `TheGhiNho.jsx` đã đi; flashcard giờ
  là bộ do giáo viên soạn (xem mục « Flashcard » cuối danh sách). Đường SINH
  thẻ ở `gradeRemote.js` cũng tắt cùng lúc — để nguyên thì mỗi lần chấm bài lại
  ghi thẻ vào chỗ không màn nào mở được. Bảng `cards`/`reviews`, 37 thẻ, và
  `shared/theGhiNho.js` + `shared/sm2.js` VẪN CÒN; bật lại là gỡ một khối chú
  thích và dựng lại một route. Phần dưới giữ làm lịch sử quyết định.

  **Thẻ SINH TỪ LỖI SAI, không nhập tay.** Thẻ nhập tay là thứ người học không
  bao giờ làm — mọi app thẻ ghi nhớ đều chết ở đó. Câu vừa sai thì đã có sẵn
  đề bài, lời giải thích, và bằng chứng rằng người này chưa nắm được nó. Sinh
  tự động ngay sau khi máy chủ chấm, không nằm sau một cái nút.

  Mặt sau là LỜI GIẢI THÍCH, không phải đáp án trần — "đáp án là B" không dạy
  gì. Câu chưa có `explanation` thì nói thẳng là chưa có.

  **Sai lại câu đã có thẻ → KÉO thẻ về hôm nay**, không đẻ thẻ mới (ràng buộc
  `unique (user_id, source_question_id)`). "Đã có thẻ rồi nên bỏ qua" là bỏ
  mất đúng tín hiệu quan trọng nhất mà lần làm bài đó cung cấp.

  **Phép tính SM-2 nằm ở JS** (`shared/sm2.js`, thuần, 57 ca kiểm), không ở
  SQL. Ở SQL thì nó chỉ chạy được trên production và không bộ kiểm nào đọc
  nổi; đặt ở cả hai thì có hai bản phải khớp — dự án đã nuôi `check:parity`
  cho đúng một cặp như thế rồi. Database chặn giá trị vô lý bằng CHECK
  (`interval_days` 1–365, `ease` 1.3–3.0). Đánh đổi: người dùng sửa được lịch
  ôn của CHÍNH MÌNH — không ai có động cơ, và người chịu là họ.

  Hai chỗ dễ viết sai, đều có ca kiểm đã thử phá: quãng lần 2 là HẰNG SỐ 6
  chứ không phải `1 × ease`; và `ease` phải có SÀN 1.3, nếu không quên nhiều
  lần làm quãng về 0 và thẻ đến hạn mãi mãi.

  **Lần thứ BA dính bẫy quyền cột** (022, 024, rồi 063): `revoke update (cột)`
  KHÔNG gỡ được quyền cấp ở mức BẢNG. Lần này bộ kiểm ở 064 bắt được và cả
  lượt push dừng lại — 065 thu mức bảng rồi cấp lại năm cột. Đây chính là lý
  do phép kiểm phải nằm ở lần Run riêng và phải THẬT SỰ đo.
- **Câu cần lời giải — xong 02/09** (migration 069/070), `/professeur/loi-giai`.

  Thư viện thiếu 166 lời giải, gần hết là bài đọc–nghe hiểu. Trước đó điều này
  chỉ làm trang kết quả nghèo đi; từ khi có thẻ ghi nhớ nó thành chặn đường —
  đo được 18/18 thẻ đầu tiên đều rỗng nghĩa, vì chỗ người ta SAI và chỗ có lời
  giải gần như không giao nhau.

  Bày cả 166 câu là bày một việc không bao giờ xong. Nhưng chúng KHÔNG đáng
  giá như nhau, và dữ liệu để xếp thứ tự đã nằm sẵn trong `answers` từ lâu —
  chỉ là chưa ai hỏi. Xếp theo SỐ NGƯỜI từng sai; câu đứng đầu hiện có 3 học
  sinh sai 9 lượt.

  Đếm NGƯỜI và đếm LƯỢT là hai con số, hiện cả hai: một người làm lại mười lần
  trông y hệt mười người cùng sai nếu chỉ đếm lượt.

  Câu `vf` bị loại khỏi danh sách — chúng đã có `justification` hiện ngay dưới
  đáp án, đưa vào là tạo ra 25 việc không có thật.

  **NỬA DỄ QUÊN NHẤT: viết lời giải phải KÉO THEO thẻ đã sinh.** `cards.back`
  là bản chép của `explanation` tại lúc thẻ được sinh, và thẻ không bao giờ
  sinh lại (ràng buộc unique). Không đè lên thẻ còn mang câu dự phòng thì giáo
  viên viết xong, thấy "đã lưu", và phía học sinh không đổi gì — mãi mãi, im
  lặng tuyệt đối. `luu_loi_giai` làm cả hai việc và TRẢ VỀ số thẻ vừa làm mới;
  giao diện nói ra con số đó.
- **Thẻ tự tạo + giao diện lật 3D — xong 02/09; thẻ tự tạo GỠ 09/09**
  (migration 073/074; 085 thu `execute` trên `tao_the_tu_viet` khỏi
  `authenticated`). Học sinh không còn tạo thẻ nào. Hàm KHÔNG bị drop — 2 thẻ
  `nguon='tu_tao'` còn đó và câu hỏi "thẻ này từ đâu ra" phải trả lời được.
  `TheLat3D.jsx` SỐNG SÓT và giờ vẽ thẻ ở màn luyện Flashcard: thứ bị bỏ là
  màn ôn SM-2, không phải cách vẽ một cái thẻ.

  **KHÔNG dựng bảng `flashcards` riêng.** Bản mô tả giả định có bảng đó; thứ
  đang có là `cards` + `reviews`. Hai bảng cho cùng một khái niệm nghĩa là màn
  ôn phải đọc hai chỗ rồi trộn, SM-2 phải ghi hai chỗ, `reviews` khoá ngoại
  tới `cards` nên thẻ tự tạo hoặc không có lịch hoặc cần bảng lịch thứ hai, và
  phép đếm hạn mức thành phép cộng hai truy vấn. Nên: một bảng, thêm cột
  `example_sentence` + `nguon` ('loi_sai' | 'tu_tao').

  **Hạn mức 10 thẻ/ngày ở MÁY CHỦ.** `cards` không cấp INSERT cho
  `authenticated`, đường ghi duy nhất là `tao_the_tu_viet`. "Hôm nay" là ngày
  của NGƯỜI DÙNG — client gửi `p_ngay`, máy chủ chặn ±1 ngày; để máy chủ tự
  lấy `current_date` (UTC) thì học sinh ở Hà Nội tạo thẻ lúc 6 giờ sáng bị
  tính vào hạn mức hôm qua.

  Mã lỗi RIÊNG `DAILY_LIMIT_REACHED`: giao diện phải nói "mai tạo tiếp được"
  chứ không phải "thử lại sau" — thử lại sẽ không thành công cho tới sáng mai.
  Con số « 3/10 » đọc TRƯỚC khi người ta gõ.

  **Bốn nút SRS, không phải ba** — khác có chủ đích với bản mô tả. Ba nút thì
  nút thấp nhất vẫn là "nhớ được, hơi khó"; không có cách nào nói "quên sạch",
  mà chính vế đó (q < 3) mới đặt lại quãng và tăng `lapses`.

  **Lật 3D cần đủ bốn mảnh**, thiếu mảnh nào hỏng theo một kiểu khác:
  `perspective` ở thẻ cha (thiếu → quay bẹp), `transform-style: preserve-3d` ở
  lớp quay (thiếu → mặt sau không bao giờ ngửa ra), `backface-visibility:
  hidden` ở CẢ HAI mặt (thiếu → đọc được chữ ngược lúc quay), và mặt sau quay
  sẵn 180°. Tailwind 3 không có tiện ích xoay trục Y nên phải dùng giá trị tuỳ
  ý; `check:css` canh cả bốn lớp đó sinh ra CSS thật.

  Độ lệch chồng thẻ phải TÍNH: `scale-90` thu quanh tâm nên mép trên tụt xuống
  5% chiều cao, và `-translate-y-4` chỉ bù được một phần — bản đầu nhô ra ≈5px
  và trên màn hình không thấy gì. Đo bằng ảnh chụp mới ra.
- **Neo đáp án vào ngữ liệu — nền móng xong 03/09** (migration 075/076).
  roadmap §3.2 gọi đây là "tính năng đáng giá nhất trong cả tài liệu này".

  **`evidence` LÀ ĐÁP ÁN TRÁ HÌNH.** "Đoạn văn chứa câu trả lời" chính là câu
  trả lời, nói vòng. Nên nó bị khoá y như `answer_key`: không cấp SELECT cho
  anon lẫn authenticated, đọc qua RPC `doc_neo` và CHỈ cho những câu người đó
  ĐÃ trả lời (đọc từ `answers`, không đọc `attempts.finished_at` — lượt bỏ dở
  vẫn có câu đã làm và những câu ấy chữa được).

  **Đường rò nguy hiểm nhất không nằm ở SQL mà ở `toRows`:** nó quét MỌI trường
  lạ vào `payload`, mà `payload` thì anon đọc được. Không tách `evidence` đích
  danh thì mỗi lần giáo viên bấm Lưu là neo được bày ra chỗ ai cũng đọc — đúng
  cơ chế đã làm lộ đáp án câu `tableau` trước 022, nơi 022 dọn còn Builder bày
  lại.

  **Lưu ĐOẠN TRÍCH, không lưu offset** — khác roadmap có chủ đích. Offset trôi
  khi giáo viên sửa một dấu phẩy và trôi IM LẶNG; `reading_text` lại là HTML
  nên offset vào chuỗi HTML sẽ cắt giữa một thẻ. Đoạn trích thì hoặc khớp hoặc
  không, và "không khớp" là trạng thái hiện được ra màn hình.

  Dựng bằng MẢNG mảnh + React, không `dangerouslySetInnerHTML`: phải chèn
  `<mark>` vào giữa nên chèn theo vị trí vào chuỗi HTML sẽ có ngày làm vỡ trang.
  Đánh đổi: mất định dạng in đậm của giáo viên. Ở màn chữa bài thì tô sáng
  quan trọng hơn in đậm.

  Chỉ tô bẫy mà CHÍNH học sinh đó đã sa vào. Tô hết mọi bẫy là biến phần chữa
  bài thành bài giảng, và thứ đáng học nhất — vì sao TÔI bị dụ — chìm trong đó.

**Nối vào màn chữa bài — 03/09.** Và việc nối lộ ra một lỗ cũ: câu `qcm`
  KHÔNG hề được dựng trong khối « Voir ma copie corrigée », lại còn không nằm
  trong điều kiện mở khối đó. Nghĩa là một bài đọc hiểu toàn trắc nghiệm mở ra
  là danh sách rỗng — đúng loại bài mà việc chữa quan trọng nhất.

  Nhánh qcm KHÔNG hiện "đáp án đúng là B": `answer_key` không cấp SELECT cho
  học sinh (022), nên phía client không có con số đó, và dựng ra một cái là
  bịa. Neo thay thế nó — chỉ ra CHỖ chứa câu trả lời, dạy nhiều hơn một chữ
  cái, và không lộ đáp án của câu chưa làm.

  Nạp neo đặt ở component CẤP MODULE (`NeoCauHoi`), không trong `Card`: `Card`
  được định nghĩa bên trong `Student` nên nó là component MỚI sau mỗi lần cha
  dựng lại, và mọi state trong đó bị đặt lại theo — một `useEffect` ở đó sẽ gọi
  mạng lại sau mỗi lần gõ phím ở chỗ khác trong trang.

  `docNeo` nhớ theo BÀI và nhớ cả PROMISE, không chỉ kết quả: mười câu cùng bài
  dựng trong một khung hình thì lời gọi thứ hai xuất phát TRƯỚC khi lời gọi thứ
  nhất trả về, nên bộ nhớ chỉ giữ kết quả sẽ không chặn được gì. Hỏng thì quên
  đi, để một lần mất mạng không thành mất neo tới khi tải lại trang.

  Bài không có `reading_text` thì không gọi mạng — phép lọc rẻ nhất, cắt phần
  lớn lời gọi vì bài ngữ pháp không có ngữ liệu.

  **Phát hiện kèm theo, CHƯA sửa:** nhánh `vf` hiện « Bonne réponse :
  {VF_OPTS[q.answer]} », mà `answer` đã bị chuyển sang `answer_key` từ 022 —
  nên học sinh nhiều khả năng đang đọc `undefined` ở đó. Cần đo trên tài khoản
  học sinh thật trước khi sửa.

  **Màn đặt neo — `/professeur/neo`, 03/09.** Giáo viên BÔI ĐEN đoạn văn chứ
  không gõ lại: neo lưu đoạn trích nguyên văn, nên gõ lại là mời một lỗi
  chính tả vào đúng chỗ không chịu được lỗi chính tả — sai một ký tự thì học
  sinh nhận cảnh báo "chỗ đánh dấu không còn khớp" cho một bài chưa ai sửa.

  `window.getSelection()` trả về vùng bôi đen của CẢ TRANG, nên phải kiểm cả
  hai đầu (`anchorNode` và `focusNode`) có nằm trong đoạn văn không. Thiếu
  phép kiểm đó thì bôi đen ở tiêu đề cũng được nhận.

  `kiemNeo` chạy ngay lúc chọn và KHOÁ nút Lưu khi neo hỏng — đừng lưu xong
  rồi để học sinh phát hiện hộ. Khối xem trước dùng thẳng `NeoNguLieu`, không
  dựng lại bản gần giống: hai bản dựng cho cùng dữ liệu là hai chỗ để trôi
  khỏi nhau, và chỗ trôi chỉ lộ ra ở phía học sinh nơi không ai đang nhìn.

  `ChonDoanVan.jsx` tách riêng vì `DatNeo` import `exerciseStore` nên không
  vào được /preview.html — mà `getSelection` phụ thuộc hành vi trình duyệt,
  không bộ kiểm nào thay được việc bôi đen thật một lần.

  CÒN TREO: chưa câu nào trong thư viện có neo, nên chưa chạy được đầu-cuối.
- **Form tư vấn + bảng `leads` — 03/09** (migration 077–080).

  **Đây là bảng DUY NHẤT người chưa đăng nhập ghi được.** Mọi bảng khác đòi
  `auth.uid()`; bảng này thì không, vì cả mục đích của nó là nhận thông tin từ
  người chưa có tài khoản. Nên nó là bề mặt tấn công duy nhất kiểu này:

  · KHÔNG policy INSERT — đường ghi duy nhất là RPC `gui_lien_he`, nơi có chỗ
    để kiểm và chặn. Cho anon insert thẳng thì mọi phép kiểm chỉ còn là lời
    khuyên.
  · `anon` KHÔNG đọc được, hai lớp: không policy SELECT (077) và thu hẳn quyền
    mức bảng (079). Một lớp đủ chặn hôm nay; không đủ cho ngày ai đó thêm một
    policy rộng tay. Dữ liệu ở đây là tên, email, số điện thoại người thật.
  · Giáo viên đọc qua `authenticated` — nên 079 KHÔNG thu quyền của vai đó.

  **Chặn lũ có giới hạn, và giới hạn đó được ghi ra:** 3 lượt/ngày cho một
  email, 10 lượt/giờ cho một IP (`x-forwarded-for` do cổng Supabase đặt; đọc
  không được thì lớp này tự tắt chứ không chặn nhầm người thật). Cả hai KHÔNG
  chặn được tấn công có chủ đích — muốn thế cần captcha. Ghi rõ để lần sau
  không ai đọc hai câu `if` rồi tưởng đã đủ.

  **Thu ít nhất có thể.** Không hỏi năm sinh như form đối thủ: không cần để
  gọi lại, mà lại là dữ liệu cá nhân của người có thể là trẻ vị thành niên.
  Số điện thoại để tuỳ chọn.

  IP lưu trong cột `nguon` dạng `ip:…`, không dựng cột riêng — đủ cho việc
  chặn lũ mà không mời ai đi phân tích nó.

  **FORM ĐÃ GỠ KHỎI TRANG GIỚI THIỆU — 03/09.** Bảng, RPC và màn xem của giáo
  viên (`/professeur/lien-he`) vẫn còn nguyên; chỉ ô nhập biến mất. Nên hiện
  KHÔNG có đường nào để ai gửi thông tin vào, và màn xem nói thẳng điều đó
  thay vì để giáo viên mở mỗi ngày rồi tưởng chưa ai quan tâm.

  Đưa lại thì lấy `FormTuVan.jsx` từ commit 6cc2cd3. Trước khi làm: thu dữ
  liệu cá nhân mà chưa có trang Chính sách bảo mật là chỗ dễ vướng nhất, và
  trang đó vẫn chưa có.

  Màn xem KHÔNG có nút xoá. Xoá một dòng liên hệ là xoá dấu vết duy nhất rằng
  có người đã tìm tới, và một cú bấm nhầm ở đó không hoàn lại được. Cả `anon`
  lẫn `authenticated` đều không có quyền DELETE, nên kể cả có nút cũng không
  chạy — dọn thì dọn bằng SQL, có chủ đích.
- **Chấm PE bằng AI — dựng xong 09/09** (migration 083/084, Edge Function
  `cham-pe`). Đi sau việc gỡ `/professeur/copies` cùng ngày: giáo viên thôi
  chấm bài thì bài viết chỉ còn một đường là học sinh tự chấm, và đây là chỗ
  lấp lại khoảng trống đó.

  **CẦN MỘT BƯỚC TAY TRƯỚC KHI CHẠY ĐƯỢC:**

  ```bash
  npx supabase secrets set OPENAI_API_KEY=sk-...
  ```

  **26/09: đổi sang OpenAI gpt-6-luna** (chủ dự án chọn — rẻ nhất). Nhà cung
  cấp suy ra từ tên model: `gpt-…` → OpenAI + OPENAI_API_KEY, `claude-…` →
  Anthropic + ANTHROPIC_API_KEY. Đổi lại Claude: `secrets set PE_AI_MODEL=claude-haiku-4-5`.
  Trang /bao-mat đã ghi OpenAI là nhà xử lý.

  ```bash
  # (lệnh cũ, khi dùng Claude)
  npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
  ```

  Chưa đặt thì hàm trả 503 kèm mã `CHUA_CAU_HINH_KHOA`, và giao diện nói thẳng
  "đây là việc của người quản trị, bạn thử lại bao nhiêu lần cũng vậy" — chứ
  không phải "thử lại sau", vì thử lại sẽ không bao giờ thành công.

  Model mặc định `gpt-6-luna` (trước 26/09 là `claude-sonnet-5`), đổi được bằng biến `PE_AI_MODEL` mà không
  cần deploy. Giá trị mặc định vẫn nằm trong git để câu hỏi "đang chạy model
  nào" luôn trả lời được từ mã nguồn.

  **AI ĐỀ XUẤT, HỌC SINH KÝ.** Gợi ý KHÔNG bao giờ tự điền vào thanh trượt —
  nó nằm cạnh, và phải bấm « dùng số này ». Tự điền thì thao tác duy nhất còn
  lại là bấm Lưu, và cả màn hình này (vốn tồn tại để bắt người học đọc lại bài
  mình qua mắt người chấm) rút xuống một cú bấm: con số vẫn đúng, thứ đáng giá
  thì mất sạch.

  **Bài viết đọc từ DATABASE, không nhận từ client.** Client chỉ gửi
  `answerId`. Nhận chữ do client gửi thì học sinh gửi được một bài khác bài đã
  nộp, và ai đó gửi được 40 nghìn chữ để tiêu tiền token của bạn. Đọc từ DB thì
  cả hai biến mất mà không cần một dòng kiểm nào.

  **Chỗ duy nhất hỏng ÂM THẦM là khuôn mô hình trả về** — mọi thứ khác hỏng thì
  có mã lỗi. `_shared/goiYPE.js` kiểm trước khi ghi, và luật quan trọng nhất là
  **vượt khung thì BỎ, không kẹp về biên**: kẹp 9 về 5.5 tạo ra một điểm tuyệt
  đối cho đúng cái tiêu chí mô hình vừa chứng minh là nó hiểu sai thang, và
  trên màn hình nó trông y hệt một điểm được chấm cẩn thận. Thiếu cũng vậy —
  bỏ, đừng điền 0; điền 0 là bịa ra nhận định nặng nhất đúng lúc ta biết ít
  nhất. `check:champe` (38 ca) đã thử phá và bắt được cả hai.

  **Hạn mức 6 lượt / 24 GIỜ TRƯỢT**, cố ý KHÁC `tao_the_tu_viet` vốn dùng ngày
  địa phương. Ở đó "hôm nay" là khái niệm của người học nên phải theo giờ của
  họ; ở đây hạn mức chỉ để chặn chi phí, và cửa sổ trượt không có nửa đêm để ai
  đứng chờ bấm hai lượt liền, cũng không có múi giờ nào để sai.

  Bảng `pe_ai_goi_y` KHÔNG ghi đè `answers.self_score` — tách ra để sau này còn
  trả lời được "học sinh chấm mình bao nhiêu, AI chấm bao nhiêu, lệch thế nào".
  Không policy ghi; đường ghi duy nhất là Edge Function giữ service_role, nếu
  không thì học sinh tự chèn một "gợi ý của AI" cho 25/25 rồi chụp màn hình.

  Xem thử ở /preview.html mục « Tự chấm Production écrite »: fixture cố ý
  THIẾU hai tiêu chí để nhánh cảnh báo « 2 tiêu chí không có gợi ý » thật sự
  được dựng ra — nhánh đó chỉ chạy khi mô hình trả sai thang, tức là lúc không
  ai đang nhìn.

  CÒN TREO: chưa chạy được đầu-cuối với khoá thật, nên chưa ai từng đọc một
  gợi ý do mô hình sinh ra. Và 10 bài tự luận đang treo vẫn chưa được báo gì.
- **Flashcard do GIÁO VIÊN soạn — xong 09/09, đo đủ đường 21/09**
  (migration 085–088). Học sinh `/etudiant/bo-the`, giáo viên `/professeur/bo-the`.
  Nhãn menu là « Flashcard » ở cả vi/fr/en.

  **KHÔNG có bảng `flashcards` / `flashcard_decks`** dù bản mô tả gọi tên như
  vậy. `the_bo` (bộ, dùng chung) + `the_bo_the` (thẻ trong bộ) là một khái niệm
  KHÁC `cards` (thẻ của một người học). `cards.bo_id` để sẵn cho ngày nối SM-2
  vào bộ giáo viên; hiện chưa ai ghi vào nó.

  **RLS dùng `is_teacher()`, KHÔNG dùng `profiles.role = 'prof'`** — dù bản mô
  tả chỉ định cách sau. `profiles.role` là bản sao để hiển thị; `app_metadata`
  mới là chỗ người dùng không tự sửa được. Cách kia không thủng hôm nay (profiles
  chỉ có một policy ghi, teacher-only), nhưng một dòng `for update using (id =
  auth.uid())` thêm vào sau này — dòng ai cũng có lúc viết để cho người dùng tự
  sửa tên — là học sinh tự phong mình làm giáo viên. 086 có ca canh không policy
  nào của hai bảng được đọc `profiles`.

  Ba policy ghi KHAI RIÊNG, không `for all`: `for all` gộp cả SELECT vào chung
  `using` nên lặng lẽ đè quyền đọc — triệu chứng là « thư viện trống » chứ
  không phải một lỗi.

  **Đã đo đủ, 21/09** (claim giả, mọi lượt `rollback`):
  · Học sinh insert → `42501`. Giáo viên insert → được.
  · Giáo viên bật công khai → 1 dòng. Sau đó học sinh thấy ĐÚNG 1 bộ + 8 thẻ,
    không thấy bộ nháp lẫn thẻ của nó (policy con đi theo bộ cha).
  · Học sinh THẤY 8 thẻ nhưng sửa 0, xoá 0, và không giấu được bộ.
  · Giáo viên xoá bộ → thẻ đi theo (CASCADE), 0 thẻ mồ côi.
  · Và đường INSERT qua GIAO DIỆN đã chạy thật: chủ dự án tạo bộ « Économie »
    ngày 12/09 từ `/professeur/bo-the`, `bocDong` tách đúng ba vế.

  **Chạy thật đầu-cuối 21/09:** bộ « Thông báo ở nhà ga » công khai, học sinh
  mở `/etudiant/bo-the` bằng tài khoản thật và thấy đủ 8 thẻ; bấm vào bộ thì
  trượt sang màn luyện và thẻ lật 3D chạy. Bộ thử « Économie » đã xoá.

  21/09 tối: đủ bốn bộ (Nghe 8 · Đọc 10 · Viết 8 · Nói 9 thẻ), cả bốn công khai;
  học sinh mở bằng tài khoản thật thấy đủ bốn bộ. Ba bộ Đọc/Viết/Nói soạn bằng
  SQL, phiên âm để trống có chủ ý.

  CÒN TREO: nút công khai trên màn soạn chưa ai bấm qua giao diện (bộ đầu tiên
  được bật bằng SQL trực tiếp); đường UPDATE mới chỉ được chứng minh qua claim giả.

  **Lịch ôn SM-2 cho bộ giáo viên — 21/09** (migration 089/090). Trước đó hai
  nút « Chưa nhớ / Nhớ rồi » KHÔNG GHI GÌ. Nay mở bộ lần đầu thì `hoc_bo()` tạo
  cho người đó một dòng `cards` (`nguon='bo_giao_vien'`, `bo_the_id`) + `reviews`
  cho mỗi thẻ; màn chỉ hiện thẻ ĐẾN HẠN, bốn nút SM-2 sau khi lật, ghi qua
  `ghi_lan_on` có sẵn. Chữ trên thẻ đọc từ THẺ GỐC `the_bo_the`, không từ bản
  chép trong `cards` — giáo viên sửa thì học sinh thấy ngay (bẫy luu_loi_giai).

  Bẫy 059 lần hai: `cards_nguon_hop_le` là CHECK đóng chỉ nhận loi_sai|tu_tao;
  không nới thì mọi lần mở bộ bị database từ chối. 090 kiểm NỘI DUNG CHECK.

  Đo bằng claim giả: mở bộ hai lần vẫn 8 thẻ (không nhân đôi); chấm 1 thẻ →
  còn 7 đến hạn, 1 sang mai; giáo viên sửa thẻ gốc → học sinh thấy ngay; bộ nháp
  → 42501; học sinh khác ghi đè lịch → 42501.

  Màn luyện CỐ Ý không có ô SCORE như bản thiết kế gốc: không có mô hình giọng
  nói nào trong dự án, và một con số 68 vẽ ra ở đó là số bịa (quy tắc 1).
- **FAQ · Điều khoản sử dụng — 21/09** (`/faq`, `/dieu-khoan`, file
  `screens/public/TrangPhapLy.jsx`). Mọi câu đối chiếu được với mã nguồn. Bản
  nháp chưa qua luật sư. `EMAIL_LIEN_HE` để trống có chủ ý — trống thì trang tự
  hiện cảnh báo.

  **Chính sách bảo mật: DỰNG LẠI 25/09** (`/bao-mat`) khi form « Gửi câu hỏi »
  bật lại — thêm mục dữ liệu form đó thu (tên, SĐT, năm sinh, email, IP).
  Thêm tính năng thu dữ liệu mới thì sửa trang này TRƯỚC. Lịch sử bên dưới:

  **Chính sách bảo mật: dựng xong rồi GỠ cùng ngày, theo yêu cầu chủ dự án.**
  Nội dung đầy đủ nằm trong commit « Ba trang FAQ · Điều khoản sử dụng · Chính
  sách bảo mật ». Khi trang này vắng mặt: form tư vấn KHÔNG nên bật lại, và
  thêm tính năng thu dữ liệu mới là lúc cân nhắc dựng lại nó.
- **23/09 — dọn theo quyết định chủ dự án.**
  · Gỡ màn nghe bài nói `/professeur/oral`. Học sinh vẫn ghi âm để tự nghe lại.
  · Xoá hai tài khoản thử `doquochung2k6@` và `doquochung8a@` (không có hồ sơ
    học sinh). Kéo theo 41 lượt làm bài, 50 câu trả lời, 36 thẻ + 36 lịch ôn,
    2 thông báo, 1 ngày học; và 3 bài nộp — xoá TƯỜNG MINH, vì khoá ngoại
    `submissions.user_id` là SET NULL, để nguyên thì thành bài nộp không chủ
    vẫn hiện trong thống kê. Sao lưu JSON (không kèm mật khẩu) trước khi xoá,
    để ngoài git vì chứa email người thật.
  · Email liên hệ của FAQ + Điều khoản: contact.fracile@gmail.com.
  · **LƯU BÀI TỪNG XOÁ SẠCH NEO** — `saveExercise` xoá rồi chèn lại câu hỏi,
    mà trình duyệt giáo viên không cầm `evidence` (không cấp SELECT) nên ghi
    `null`. 7 neo mất thật, khôi phục từ bản chụp. Sửa: RPC
    `get_neo_giao_vien` (093/094) nạp neo lúc mở bài; tải thiếu đáp án HOẶC
    neo thì `saveExercise` từ chối lưu. Nay 22 neo / 2 bài (thêm 15 neo + 13
    bẫy cho « Dans le Gard… »). `check:dapan` 33 ca, đã thử phá hai lần.
  · CÒN 5 tài khoản auth KHÔNG có hồ sơ (14 auth.users, 9 profiles) — chưa ai
    xem chúng là gì.
- **XP · theo dõi · đổi XP lấy bài — 26/09** (migration 101–103).
  · XP chỉ máy chủ cộng: trigger `cong_xp_khi_nop` trên `attempts` (học sinh
    không ghi được bảng đó). Chỉ LƯỢT NỘP ĐẦU TIÊN mỗi bài: 10 + điểm. Mọi
    cộng/trừ ghi `xp_so_cai`; 103 cộng bù lịch sử theo cùng quy tắc.
  · Giá đổi ở `exercises.meta.xpCost` (Builder, ô cạnh giá tiền). RPC
    `redeem_exercise_with_xp(id)` KHÔNG nhận tham số giá — đừng thêm. Mở khoá
    ghi `exercise_access` status 'XP' để đi đúng đường `can_open_exercise`.
  · Theo dõi một chiều `follows`, ghi/xoá chỉ qua RPC; danh sách chỉ lộ tên,
    @username, ảnh và cờ "hôm nay đã học".
- **AI nhận xét bài nói — 27/09** (migration 107, Edge Function `nhan-xet-noi`).
  OpenAI `gpt-transcribe` chép lời → gpt-6-luna nhận xét tiếng Việt. KHÔNG điểm
  số. Chỉ file trong thư mục `<user_id>/` của người gọi (so tiền tố — service_role
  bỏ qua RLS kho). 6 lượt/24 giờ; bản đã nhận xét trả lại không tốn lượt.
  OpenAI không nhận .ogg (Firefox) → báo DINH_DANG_KHONG_HO_TRO. Chưa chạy
  đầu-cuối: kho bai-noi đang 0 file.
- **Giờ học — 27/09** (migration 106): `attempts.giay_lam` (mở bài → nộp, kẹp 3 giờ),
  RPC `get_gio_hoc`. Trước đó KHÔNG đo được: bài luyện tập tạo attempt lúc nộp.
- **Lộ trình theo CHỦ ĐỀ — 06/10** (migration 115/116). 16 chủ đề xã hội, 100 màn,
  800 mục từ có LOẠI TỪ, soạn ở `scripts/lo-trinh/chu-de.mjs` rồi sinh 116 bằng
  `scripts/lo-trinh/sinh-sql.mjs` (chạy lại không đè `bat`/`so_cau` giáo viên đã chỉnh).
  Phương án nhiễu (`shared/troChoiThe.js`) BẮT BUỘC cùng loại từ, ưu tiên cùng chủ
  đề + độ dài gần + cùng số/phản thân; thiếu nhiễu cùng loại thì BỎ câu chứ không
  chèn nhiễu khác loại. Lộ trình cũ theo kỹ năng (108–113, khoá `bo:`/`trum:CO`)
  ngừng nhận kết quả mới nhưng dữ liệu cũ GIỮ NGUYÊN. Thách đấu vẫn rút từ bộ
  flashcard, nhiễu chưa theo loại từ.
- **Kinh tế XP — 06/10** (migration 117, `docs/chien-luoc-xp.md`). Trần 60 XP/ngày,
  300 XP/tuần (giờ VN); điểm danh +5; mốc chuỗi 7/30/100 ngày (ngoài trần). MỌI lần
  cộng qua `cong_xp` — thêm nguồn XP mới thì gọi hàm này, đừng `update xp_balance`
  thẳng. Giá đổi `gia_xp(meta)` = giá tiền ÷ 100 (100–600), xpCost < 50 coi là số
  thử; `giaXp()` ở `shared/premium.js` PHẢI khớp.
- **Nghe kiểu phòng thi — 07/10** (migration 119, `scripts/nhap/lo11_de_a2.mjs`).
  File nghe CHỨA SẴN cả trình tự thi: giới thiệu → 30 s đọc câu hỏi → lượt 1 →
  30 s nghỉ → lượt 2 → 30 s hoàn thành. Ghép bằng ffmpeg-static, tải lên qua
  `taiLen`. Bài mang cờ `meta.ngheKieuThi` thì `exam_play_audio` chỉ cho phát
  MỘT lần (không có cờ vẫn 2). Đề A2 · Đề 2 dùng cách này; A1 · Đề 1 chưa.
- **Thu gọn vai giáo viên — 07/10** (theo chủ dự án): giáo viên quản lý học
  sinh, cấp quyền bài, gói VIP (`QuanLyVip.jsx`, RPC 122), giao bài; vẫn soạn
  bài, đề thi thử, Flashcard, neo, duyệt nháp, xem thống kê. ĐÃ GỠ màn « Câu
  cần lời giải », « Sổ tay lớp », « Lộ trình » giáo viên, « Đăng ký tư vấn »,
  và chức năng tạo lớp (dữ liệu `mcf-classes`, `tips`, `leads`, `lo_trinh_*`
  vẫn nguyên). « Thư viện luyện tập » thành tab thứ hai trong « Bài tập ».
  Lấy lại màn nào thì lấy file từ git trước commit 35759f3.
- **Linh vật Leon — 09/10** (`shared/leon.jsx`, ảnh `public/leon/*.webp` cắt từ bảng sticker, đã bỏ nền và chữ). Logo + favicon là `dau`. « Hỏi Leon » (`shared/HoiLeon.jsx`, Edge Function `hoi-leon`, bảng `leon_hoi` migration 125): 10 câu/ngày giờ VN, VIP không giới hạn, lịch sử đọc từ DB chứ không nhận từ client, ẩn ở màn thi và khi `[data-che-do-thi]` đang mở. Sticker trong nhận xét giáo viên là mã `[leon:id]`. AI chấm PE và nhận xét bài nói trả thêm `loi_leon`.
- **Thách đấu theo CHỦ ĐỀ — 10/10** (migration 127). Bảng `chu_de_the` (7 chủ đề, nhóm tu_vung/ngu_phap), `the_bo.chu_de` (giáo viên chọn ở màn soạn bộ). `tao_thach_dau_chu_de` gộp thẻ mọi bộ công khai cùng chủ đề, bỏ trùng mặt trước, rút 10 câu; `thach_dau.bo_id` giờ có thể NULL (trận cũ vẫn theo bộ). `lay_de`/`nop` không đổi.
- **Phương án Thách đấu — 10/10** (migration 128/129). `the_bo_the.loai` (so|cau|nhom_tu|tu_noi|mo_dau|dong_tu, giáo viên chọn ở màn soạn thẻ), `the_bo_the.nhieu` (3 nghĩa sai tự soạn). Nhiễu CÙNG dạng, ưu tiên cùng chủ đề; thẻ không đủ 3 nhiễu cùng dạng thì không vào đề. `sach_pa()` bỏ « (…) » khi HIỆN câu hỏi/phương án, mặt thẻ gốc giữ nguyên. Bộ trả phí (`tra_phi`, `the_bo_quyen`, `co_quyen_bo`) không vào Thách đấu.
- **Nghe & Nói — 10/10** (migration 131, `/etudiant/nghe-noi`). Kho `cau_luyen` (200 chép chính tả + 200 phát âm, soạn ở `scripts/nghe-noi/cau.mjs` + `cau2.mjs`, nạp + tạo audio giọng tổng hợp bằng `nap.mjs`). So từng từ ở `supabase/functions/_shared/soCau.js` (client import thẳng). Phát âm: Edge Function `cham-phat-am` chép lời bằng whisper KHÔNG gửi câu gốc làm prompt, so theo âm (bỏ đuôi câm), 20 lượt/ngày; bản ghi âm không lưu; `x-admin-token` = chế độ thử không ghi.
- **Phần nói ĐƯỢC CHẤM — 12/10** (migration 135, Edge Function `cham-po`, theo chủ dự án).
  Thay quyết định « PO không chấm » ở trên. Học sinh TỰ CHẤM theo grille PO chính thức
  (A1–B2, chép từ tờ grille giám khảo chủ dự án cung cấp, ở
  `supabase/functions/_shared/grillePO.js` + bản SQL `_thang_po()` — hai bản phải khớp);
  AI gợi ý từng tiêu chí, phải bấm « dùng số này ». Ghi chỉ qua `ket_thuc_po` (đóng
  attempt PO) và `luu_po_tu_cham` (máy chủ tự cộng, từ chối giá trị không có trên grille).
  Thi PO → /100; bỏ PO ở màn chờ → /75. Ngưỡng tổng TỈ LỆ (`nguongTong`): 50/100 hoặc
  37,5/75. `khongCham` giờ nhận theo ĐIỂM của dòng: PO 0 điểm (đề C1, chưa có grille)
  vẫn không chấm. 13/10 (migration 136): thêm grille C1 (5 tiêu chí × 0/1/3/5), đề C1 PO = 25 điểm.
  13/10 (137, lô 17): BỐC THĂM đề nói + thời gian CHUẨN BỊ như thi thật (`meta.bocTham`, `BocThamNoi.jsx`): A1 bốc 1, A2–C1 bốc 2 chọn 1; chuẩn bị 10/10/10/30/60 phút, cộng vào đồng hồ phần PO. Đề đã chọn lưu ở `po_cham.de_boc` để tự chấm và AI biết bài nói trả lời đề nào.
- **Đóng băng chuỗi — 13/10** (migration 138). Ngày không làm bài tự đóng băng để giữ chuỗi,
  tối đa 5 ngày mỗi tháng dương lịch (theo tháng của ngày bị lỡ); lỡ ngày thứ 6 thì chuỗi đứt.
  Không lưu trạng thái: `_chuoi_tinh()` tính lại từ `attempts` mỗi lần đọc; `_chuoi_ngay`
  (thưởng XP mốc chuỗi, tổng quan giáo viên) và `get_student_streak` đều đi qua nó. Chuỗi đếm
  NGÀY ĐÃ HỌC, ngày đóng băng chỉ nối. 139: lịch sử ở bảng `chuoi_dong_bang` (ghi khi mở widget
  và khi nộp bài, chỉ ngày đã NỐI được chuỗi), nên ngân sách tháng đếm cả chuỗi đã đứt.
- **Kho bài thi thử RIÊNG — 13/10** (migration 140). `exercises.store` thêm `'exam'`: mọi bài
  đề thi tham chiếu nằm ở đó (giữ nguyên id), không hiện trong thư viện luyện tập lẫn tìm kiếm
  học sinh. 6 bài thư viện gốc từng ghép vào đề được nhân bản lại (`<id>_tv`). Giáo viên sửa
  bài thi ở tab « Bài thi thử » (PracticeHub, biến `kho`); ExamComposer chỉ nạp kho `exam`.
  LƯU Ý: `xuat_ban_nhap` (Duyệt nháp) vẫn xuất bản vào `practice`: đề nháp mới phải chuyển kho.
- **Từ vựng Thách đấu theo Lộ trình — 13/10** (migration 141, sinh bởi
  `scripts/thach-dau/tu-lo-trinh.mjs`). 16 chủ đề Lộ trình → chủ đề Thách đấu (`lt-…`; Môi trường
  và Truyền thông gộp vào mã có sẵn) + 16 bộ « Từ vựng Lộ trình: … » công khai, 800 thẻ. Dạng thẻ
  thêm `tinh_tu`, `thanh_ngu` (n→nhom_tu, v→dong_tu). Thử: 10 câu, 0 phương án lệch dạng.
- **Quyền lợi VIP mới — 14/10** (migration 143, Edge Function `viet-mau`). `exams.chi_vip` (mọi đề không kết thúc bằng « Đề 1 »): `bat_dau_thi` trả CAN_VIP, `exam_start` ném CAN_VIP; màn chờ hiện nhãn + nút mua VIP. Bài viết mẫu: AI viết lại bài PE của chính học sinh, lưu ở `bai_viet_mau` (mỗi answer một bản). `/etudiant/tien-bo` (`TienBoVip.jsx`): `bao_cao_tuan()` + `cau_sai_cua_toi()`, không VIP thì trả CAN_VIP. Đề mới phải đặt `chi_vip` tay (update lúc 143 chỉ chạy một lần).
- **DELF B2 format mới — 15/10** (lô 20, `scripts/nhap/lo20_b2_*.mjs`, khuôn: đề TP68 chủ dự án gửi, KHÔNG chép nội dung đề thật). Nghe 3 bài (9 + 9 + 7 đ; bài 3 = ba tài liệu ngắn nghe 1 lượt), Đọc 3 bài (9 + 9 + 7 đ; bài 3 ghép ý kiến diễn đàn), mọi câu trắc nghiệm A/B/C với ĐIỂM RIÊNG từng câu: `q.heSo` = số NỬA điểm (1,5 đ → 3), `diemCau` nhân theo nó nên score/max vẫn nguyên và quy về /25 như cũ (check:exercises canh). Viết/Nói dùng lại bài đề cũ. Ba đề B2 cũ đổi tên « [Format cũ] … » và ẩn, KHÔNG xoá (lượt thi cũ trỏ tới).
- **Học ngữ pháp — 15–16/10** (`/etudiant/ngu-phap`, công khai `/ngu-phap`; migration 148, 149). 76 bài A0–C1 trong `src/content/nguPhap` (dữ liệu chung ở `index.js`: TAT_CA, chiaPhan, timCau, BAI_CONG_KHAI). Báo lỗi câu → bảng `ngu_phap_bao_loi`, giáo viên xem ở `/professeur/bao-loi-ngu-phap`. Câu sai → `ngu_phap_cau_sai` (ôn giãn cách, tab « Ôn ngữ pháp » ở Tiến bộ VIP); khoá câu là NGUYÊN VĂN đề, nên sửa đề một câu thì lịch ôn cũ của câu đó bị bỏ qua (timCau trả null). Gợi ý bài theo nhãn `point_gram` ở `shared/GoiYNguPhap.jsx`. 17/10: chia CHI TIẾT ở `chiTiet*.js` (346 phần, 2 750 câu) ghi đè `cauTruc.js` / `boSung*.js`: khoi / cau dạng số = chỉ số trong bai.phan / bai.baiTap (giữ câu cũ và lịch ôn), "b:j" = câu bổ sung của phần cũ j. « Ôn tập cả bài » vẫn là bai.baiTap.
- **Kết bạn — 19/10** (migration 150). Trước đó chỉ 11/34 học sinh có @username và theo dõi đòi gõ đúng username. 150 cấp @username cho MỌI hồ sơ từ tên (`_slug_ten`: bỏ dấu kể cả đ, « Ngọc Anh Trịnh » → ngocanhtrinh, trùng thì thêm số) + trigger cấp cho hồ sơ mới / khi xoá trống. RPC `tim_ban(q)` (tên hoặc @username, không dấu, ≥2 ký tự, 12 kết quả), `goi_y_ban()` (lý do: theo_doi_ban, ban_chung, cung_truong, cung_trinh_do, cung_muc_tieu, moi_tham_gia; KHÔNG trả tên trường), `theo_doi_id(id)`. Giao diện: `TimBan.jsx` (portal ra body: thẻ trang chủ có backdrop-blur làm kẹt `fixed`), gợi ý 3 người ngay trên thẻ, link kết bạn `/etudiant/dashboard?ket_ban=<username>`.
- **Lộ trình ba chương — 23/10** (migration 155/156, `scripts/lo-trinh/sinh-ba-chuong.mjs`). Cột `lo_trinh_man.chuong`: 1 = A1–A2 (7 màn/chủ đề), 2 = B1 (10), 3 = B2 (12); tổng 464 màn, 3.712 mục. Màn cũ GIỮ id, chỉ đổi chuong + ord. Thử thách: chương 1 vẫn `trum:<cd>`, chương n là `trum:<cd>:n` (CHECK 156). Chương sau mở khi qua thử thách chương trước. Chạy lại `sinh-sql.mjs` (116) sẽ ghi đè `ord` của màn cũ: chạy `sinh-ba-chuong.mjs` sau nó.
- **Luyện tập theo trình độ — 01/11** (`/etudiant/entrainement`, `src/screens/practice/LuyenTheoCap.jsx`, luật ở `shared/tienTrinhLuyenTap.js`). Trình độ → 4 kỹ năng lớn → kỹ năng nhỏ (`content/luyenTap/kyNang.js`, 112 mục) → bài. Học sinh và khách vào cây, giáo viên giữ màn cũ; tab « Thư viện bài » giữ lưới cũ. Bài vào cây bằng id trong `kyNang.js` hoặc `meta.kyNang`. Kỹ năng chưa có bài và bài khoá phí KHÔNG chặn bước sau. Đạt = làm hết bài + trung bình từ 70%. Tiến độ đọc từ blob `mcf-ph-<tên>` như thư viện; mức Vững chưa làm vì blob không có lịch sử từng lượt. VIP không chia theo trình độ: `mienPhi` trong cây là bộ bài nền của kế hoạch, nhưng hàng rào thật vẫn là cờ `isPremium` từng bài, nên đổi kế hoạch KHÔNG tự đổi giá. Chỉ mời mua VIP ở kỹ năng thật sự có bài đang khoá. 01/11: đổi 18 bài theo hướng này (8 về miễn phí, 10 sang VIP giá 19.000 đ); người đã làm 10 bài đó được giữ quyền bằng dòng `exercise_access` có ref `vip0111-…`. Lô 27 (`scripts/nhap/lo27_nghe_a1*.mjs`): 29 bài Nghe A1, gắn cây bằng `meta.kyNang` + `meta.thuTu` + `meta.vong`, không phải sửa `kyNang.js`; ba trường này đã vào danh sách meta của `exerciseMap.js`, thiếu là mất khi giáo viên bấm Lưu.
- **Hạng S, A, B, C, D, F + chứng nhận — 01/11** (`shared/hangLuyenTap.js`, tab « Thành tựu » `screens/practice/ThanhTuu.jsx`). Ngưỡng 95/85/70/60/50, B = `NGUONG_DAT`. Có hạng: bài, kỹ năng nhỏ (làm đủ bài), kỹ năng lớn, trình độ. Bài không có điểm máy chấm (Viết, Nói) KHÔNG có hạng, chỉ ghi Hoàn thành. Chứng nhận kỹ năng lớn đòi đạt mọi kỹ năng nhỏ; kỹ năng đang soạn chặn chứng nhận (dù không chặn đường đi), kỹ năng chỉ có bài VIP thì không. Tính lại từ blob `mcf-ph-<tên>`, KHÔNG lưu riêng: nên học sinh tự sửa được blob của mình, và kỹ năng có thêm bài thì hạng + chứng nhận tạm ẩn. Muốn chứng nhận có giá trị đối chiếu thì phải tính ở máy chủ từ `attempts` và trao một lần.
- **VIP vào thẳng mọi kỹ năng nhỏ — 01/11** (`duongKyLon(..., laVip)`, bước `tuDo` thay `khoa`). `laVip` là `fullAccess` (còn hạn VIP hoặc giáo viên cấp toàn quyền). Bài trong một kỹ năng vẫn mở lần lượt; bước gợi ý và điều kiện chứng nhận không đổi, nhảy cóc không tính là đạt. Chỉ khoá ở giao diện: máy chủ không biết thứ tự bước, gọi thẳng API vẫn lấy được câu hỏi bài miễn phí. Hết hạn VIP thì bước chưa đạt khoá lại, điểm vẫn giữ.
- **26 bài Nói A1 — 01/11** (lô 30, migration 181; `scripts/nhap/lo30_noi_a1*.mjs`). `meta.ghiAm` (trong `EX_META`) bật chế độ nói ở `PracticeWorkspace`: câu `open` chỉ là đề, không có ô gõ; mỗi câu một `GhiAmBaiNoi gon` (examId rỗng nên file vào `<uid>/khong-de/<exId>__c<qId>-<mốc>`, migration 182 đổi đề bài cho khớp; `nhan-xet-noi` tách `__c` để lấy đề của đúng câu, phải deploy lại hàm); số câu đã làm chỉ đếm câu chấm được. Mỗi câu chỉ hiện và chỉ tính BẢN GHI MỚI NHẤT, không hiện lịch sử; nút Ghi lại có sẵn cho tới khi nộp, file cũ vẫn nằm trong kho; Làm lại bài đặt `luotLai` nên bản cũ hơn mốc đó không tính. Chấm điểm (02/11): ghi xong tự gửi `nhan-xet-noi` (chép lời bằng `whisper-1` từ v8, 02/11 chấm được 4/4 bản `.m4a`; v7 dùng `gpt-transcribe` đã chấm được cả 17 bản `.m4a`, còn bản `.webm` chưa có kết quả nào và chưa rõ lý do; `cham-po` cũng đổi sang `whisper-1` từ 02/11), trả `ket_qua.diem` 0 đến 10; câu đọc theo mẫu so từ bằng `soCau`, không gọi AI; hạn mức riêng 30 câu/24 giờ cho học sinh thường, không chung với màn thi. `gopDiemNoi` gộp vào điểm bài, CHỈ tính câu đã có điểm để không có ngõ cụt, nên không ghi cả bài vẫn được Hoàn thành. Điểm nói chỉ vào blob `mcf-ph-<tên>`, KHÔNG vào `attempts`. Ngoài ra không có điểm, trừ câu QCM của A1-PO-4. A1-PO-5 lấy câu và audio từ `cau_luyen` (`q.audioMau`), nhưng KHÔNG chấm từng câu như Nghe & Nói. 6 bài A1-PO-1 chưa có audio câu hỏi: file token TTS không còn, chạy lại máy dựng có `TTS_ADMIN_TOKEN` thì sinh SQL có audio, cần cập nhật `audio_url` và sửa đề từ « Lisez » sang « Écoutez ». Bài nói màu tím riêng (`MAU_NOI`) vì Production orale không nằm trong `CATS`.
- **26 bài Nghe A2 — 02/11** (lô 31, migration 183; `scripts/nhap/lo31_nghe_a2*.mjs`), theo tab « A2 danh sách bài » của Excel kế hoạch (A2-CO-4.1 là bài cũ `lo24mvfc69q702q`, miễn phí, nên bài mới của A2-CO-4 bắt đầu từ thuTu 2). 9 bài miễn phí, 17 VIP, id tiền tố `a2co`, audio `nghe/a2-*.mp3`. Máy dựng dùng lại file đã có trong kho và thử lại 3 lần khi lỗi mạng (lần đầu đứt ở bài 21). Token TTS ở `tts_token.txt` trong scratchpad; giá trị `TTS_ADMIN_TOKEN` trên máy chủ (đặt 02/11) có kèm dấu `<` `>` nên phải gửi `<token>`. A2-CO-1 trong Excel ghi « có tiếng nền », giọng tổng hợp không làm được.
- **16 bài Đọc A2 — 03/11** (lô 32, migration 184; `scripts/nhap/lo32_doc_a2*.mjs`): các dòng « Cần soạn » của A2-CE trong Excel, xếp sau bài Đọc A2 đã có nên phần lớn là VIP (3 miễn phí, 13 VIP), id tiền tố `a2ce`. Vrai/Faux là `qcm` hai phương án cố định, không dùng `vf` (dạng `vf` bắt gõ câu chứng minh mới tính là đã trả lời, đề A2 không đòi). Bảng tick nhiều cột (`tableau`) như bài 1 của đề. A2-CE-4.5 trong Excel tên « Un article à la fin », bài thật tên « le marché de nuit ».
- **27 bài Viết A2 — 03/11** (lô 33, migration 185; `scripts/nhap/lo33_viet_a2*.mjs`): các dòng « Cần soạn » của A2-PE trong Excel, trừ hai bài thi thu nhỏ A2-PE-T3. 7 miễn phí, 20 VIP, id tiền tố `a2pe`; A2-PE-5 xếp sau 2 bài đã có nên cả 4 bài mới là VIP. Viết tự do là câu `open` có bài mẫu từ 60 từ (theo đề A2), không chấm điểm; Excel ghi « AI nhận xét » nhưng màn luyện tập chưa có, nên A2-PE-1 đến PE-4 chỉ ghi Hoàn thành. PE-5, PE-6 là điền từ và xếp thứ tự, có điểm.
- **20 bài Nói A2 — 03/11** (lô 34, migration 186; `scripts/nhap/lo34_noi_a2*.mjs`): các dòng « Cần soạn » của A2-PO trong Excel, trừ hai bài thi thu nhỏ A2-PO-T3. 8 miễn phí, 12 VIP, id tiền tố `a2po`, `meta.ghiAm` như Nói A1. Ba phần như đề: PO-1 hỏi đáp (có audio câu hỏi `nghe/a2-noi-*.mp3`, tạo bằng token TTS có dấu `<` `>`), PO-2 độc thoại một đề, PO-3 nhập vai bốn lượt lời theo thẻ tình huống (`readingText`).
- **Mất câu khi tải theo trang — sửa 03/11** (`exerciseStore.js`). `layHet` lấy 1000 dòng một trang nhưng câu hỏi chỉ sắp theo `ord`; hàng trăm câu cùng ord nên mỗi lần gọi `range` Postgres trả thứ tự khác, 74/2648 câu bị lặp và 74 câu khác mất (bài 5 câu hiện 4, máy chủ vẫn chấm trên 5). Đo lại bằng ba câu select `limit 1000 offset k` riêng rẽ. Mọi truy vấn theo trang phải sắp theo khoá DUY NHẤT: thêm `id` sau cùng. Cùng ngày: nút « Bài tiếp theo » ở màn kết quả (`baiTiepTheo` trong `tienTrinhLuyenTap.js`), migration 187 xoay phương án 3 bài có mọi đáp án QCM cùng vị trí.
- **27 bài Nghe B1 — 03/11** (lô 35, migration 188; `scripts/nhap/lo35_nghe_b1*.mjs`): các dòng « Cần soạn » của B1-CO, trừ hai bài thi thu nhỏ. 4 miễn phí, 23 VIP, id tiền tố `b1co`, audio `nghe/b1-*.mp3`. Theo chủ dự án, không chỉ QCM: câu điền từ nghe được (`nghe`, máy dựng kiểm đáp án khớp nguyên văn ba từ quanh chỗ trống), ô ghi chú (`ghi`), câu xếp lại câu đã nghe (`ordre`). Máy dựng tự trộn lại khi mọi đáp án QCM của một bài cùng vị trí.
- **23 bài Đọc B1 — 04/11** (lô 36, migration 190; `scripts/nhap/lo36_doc_b1*.mjs`): các dòng « Cần soạn » của B1-CE, trừ hai bài thi thu nhỏ. 5 miễn phí, 18 VIP, 139 câu, id tiền tố `b1ce`. B1-CE-1 là bảng tick 4 tài liệu × 4 tiêu chí (chấm từng ô) kèm câu chọn tài liệu, phương án xếp theo chữ A, B, C, D. Có câu tìm từ trong bài (`fill`, máy dựng kiểm đáp án có trong văn bản), ghép đoạn với tiêu đề, xếp thứ tự các phần bài.
- **26 bài Viết B1 — 04/11** (lô 37, migration 191; `scripts/nhap/lo37_viet_b1*.mjs`): các dòng « Cần soạn » của B1-PE, trừ hai bài thi thu nhỏ. 4 miễn phí, 22 VIP, 65 câu, id tiền tố `b1pe`. Viết tự do là `open` có bài mẫu, máy dựng đếm từ theo khoảng trắng (cách DELF đếm) với ngưỡng riêng từng câu (`toi`, không lưu); bài trọn vẹn từ 160 từ. Phân tích đề và lạc đề dùng QCM để có điểm; B1-PE-4, PE-5 có điền từ, xếp thứ tự.
- **24 bài Nói B1 — 04/11** (lô 38, migration 192; `scripts/nhap/lo38_noi_b1*.mjs`): các dòng « Cần soạn » của B1-PO, trừ hai bài thi thu nhỏ. 10 miễn phí, 14 VIP, 65 câu, id tiền tố `b1po`. Ba phần như đề DELF B1: trò chuyện (PO-1, audio câu hỏi `nghe/b1-noi-*.mp3`), tương tác bốn lượt lời (PO-2), quan điểm từ tài liệu (PO-4, bài mẫu từ 170 từ). PO-3 là phần chuẩn bị 10 phút nên KHÔNG có `meta.ghiAm` (viết dàn ý, có QCM).
- **Nghe, Đọc A1 đến B1 theo đúng khung đề — từ 04/11** (theo chủ dự án: mỗi bài = MỘT activité của đề, bám sát đề 100 %, sửa thẳng bài cũ, thứ tự A2 rồi B1 rồi A1). Khung lấy từ mẫu đề chính thức format mới, bản người chấm trên delfdalf.fr (A2: Sujet_démo_A2TP_02; B1: Sujet_démo_B1TP_02; A1: Sujet_démo_A1TP). A2 CO 6/6/6 QCM + ghép 4 hội thoại với 6 tình huống; A2 CE ghép 6 tài liệu với 8 người, rồi 6/6 QCM, bài 4 có thêm Vrai/Faux; B1 CO 6/7/7 QCM; B1 CE bảng OUI/NON 16 ô, rồi 7/7 QCM + Vrai/Faux. Câu điền từ, xếp câu ở Nghe/Đọc B1 (lô 35, 36) sẽ bỏ khi làm tới B1. Ghi đè câu giữ id cũ, chỉ xoá câu thừa (câu trả lời cũ của câu đó mất theo, chủ dự án đồng ý). Lô 39 (migration 193): 28 bài Đọc A2.
- **Lời nghe và phân tích bài nghe, chỉ VIP — 04/11** (migration 194, 195; lô 40): bảng `loi_nghe` (exercise_id, loi [{giong, chu}], phan_tich {loai, chu_de, y_chinh}) bật RLS, KHÔNG policy, thu hết quyền; chỉ đọc qua rpc `xem_loi_nghe(p_ex)` (security definer): giáo viên, hoặc VIP (`la_vip` hay `has_premium_access`) ĐÃ NỘP bài (attempts.finished_at). Trả null (không có lời) / {khoa:"vip"} / {khoa:"chua_nop"} / nội dung. Giao diện `LoiNgheBai.jsx` ở màn kết quả bài có audio (học sinh đăng nhập), không đánh số người nói theo giọng TTS. Lời nghe rút nguyên văn từ script nhập (`lo40_loi_nghe.mjs`, khớp theo tên file audio); 74/98 bài luyện tập có lời, còn lại là bài dựng lời theo cách khác hoặc audio giáo viên tải lên. Bài nghe soạn mới hay viết lại phải nạp `loi_nghe` kèm phân tích.
- **Chấm AI chuyên sâu, giai đoạn 1 — 06/11** (`supabase/functions/_shared/loiViet.js`, `cham-pe`, `screens/practice/LoiVietAI.jsx`). Máy đếm từ theo luật DELF và đọc số từ đề yêu cầu, đưa vào lời nhắc như sự thật đã đo. AI trả thêm `loi` (đoạn trích, sửa, loại, giải thích) và `yeu_cau` (từng ý của đề: co, mot_phan, khong). Lỗi có đoạn trích KHÔNG nằm nguyên văn trong bài bị bỏ ở máy chủ; trình duyệt tô lại bằng cùng `chuThuan` + `chiaDoan`. Chế độ `luyenTap` (attemptId + questionId + rubric): nộp bài xong là AI TỰ chấm câu viết tự do ở Luyện tập, CÓ điểm theo thang DELF của trình độ bài (máy chủ lấy trình độ từ `exercises.level`, từ chối thang khác trình độ, bỏ tiêu chí `fiche`), kèm `tang_diem` (việc cụ thể, tiêu chí, điểm có thể thêm) và `bai_sua` (chính bài học sinh viết lại tốt hơn); chung hạn mức với chấm PE. Câu VIẾT không còn « đáp án gợi ý » của đề (câu nói vẫn giữ câu mẫu). Đề gửi AI = `exercises.consigne` + câu hỏi. Phiếu chấm trước 06/11 không có các trường mới, giao diện tự bỏ khối đó. Phải deploy lại `cham-pe` thì mới chạy.
- **Chấm AI chuyên sâu, giai đoạn 2 — 06/11** (`_shared/loiNhacPE.js`, `goiYPE.js › gopDiemNhieuLuot`, migration 196, `scripts/check-chamai.mjs`). Lời nhắc và lời gọi mô hình nằm ở `loiNhacPE.js`, dùng chung cho `cham-pe` và `check:chamai` (đổi lời nhắc ở MỘT chỗ). Chấm hai lượt: lượt 1 viết cả phiếu, lượt 2 là giám khảo độc lập chỉ cho điểm, chạy song song; lệch quá 1 điểm ở một tiêu chí hoặc quá 2,5 ở tổng thì chấm lượt 3 và lấy trung vị; ba lượt vẫn không có hai lượt gần nhau thì `cham_doi.chua_chac`. Khiếu nại: bảng `pe_khieu_nai` (một phiếu một khiếu nại, 5 lần/24 giờ), RPC `gui_khieu_nai`, `ds_khieu_nai`, `xu_ly_khieu_nai`; giáo viên xem ở `/professeur/khieu-nai-diem`, « Đã chấm lại » bài thi thử thì thay `answers.score`. `npm run check:chamai` chấm lại các khiếu nại đã xử lý (và `scripts/chamai/bo-them.json`, git bỏ qua) bằng máy chấm thật rồi in độ lệch từng tiêu chí; cần OPENAI_API_KEY, tốn tiền, `--tu-kiem` không gọi mạng.
- **Chấm AI chuyên sâu, giai đoạn 3 — 09/11** (`shared/hoSoLoi.js`, `screens/student/HoSoLoiViet.jsx`, vòng viết lại trong `LoiVietAI.jsx` + `PracticeWorkspace`). Tab « Lỗi viết » ở Tiến bộ VIP: cộng dồn `ket_qua.loi` của các phiếu AI (học sinh đọc phiếu của mình), so 30 ngày gần nhất với 30 ngày trước theo số lỗi MỖI BÀI (tăng, giảm, chưa đổi, mới, tháng này không còn); mỗi loại lỗi trỏ bài « Học ngữ pháp » theo trình độ hồ sơ (`baiChoLoi`, `lexique` cố ý không nối). Viết lại: nút « Sửa bài theo nhận xét » giữ bài, mở khoá ô viết, hiện lỗi cũ kèm giải thích nhưng KHÔNG kèm bản sửa; nộp lại thì phiếu mới có « So với bản trước » (lỗi cũ còn nguyên văn, không phân biệt hoa thường, là chưa sửa). Mỗi lần nộp lại tốn một lượt AI. Không có bảng mới.
- **Danh sách đen — 09/11** (migration 197, `/professeur/danh-sach-den`). Chặn bằng `auth.users.banned_until` (+100 năm, không dùng infinity), xoá `auth.sessions` + `auth.refresh_tokens`, trigger BEFORE INSERT trên auth.users chặn đăng ký lại. Không chặn được giáo viên hay chính mình. Email KHÔNG ghi vào git: thêm qua giao diện. Màn đăng nhập báo `login.err_banned` khi GoTrue trả `user_banned`.
- **Chấm AI chuyên sâu, giai đoạn 4 — 09/11** (`_shared/troiChay.js`, `nhan-xet-noi`, `KhoiTroiChay` trong `GhiAmBaiNoi.jsx`, `npm run check:troichay`). `nhan-xet-noi` xin whisper-1 `verbose_json` + dấu thời gian từng từ (kèm câu gợi ý có từ đệm để whisper chép lại « euh »; bản chép chứa nguyên câu gợi ý thì coi như KHONG_NGHE_RO), máy tự đo tốc độ, chỗ ngập ngừng từ 1 giây, từ đệm, lặp từ theo ngưỡng từng trình độ (ước lượng sư phạm, không phải chuẩn DELF), lưu `ket_qua.troi_chay` + `troi_chay_nx`, đưa số đo vào lời nhắc như sự thật. Theo chủ dự án, học sinh CHỈ thấy mức (chậm, vừa, tốt; ít, vừa, nhiều), không thấy số; lời AI có chữ số thì bỏ. Câu đọc theo mẫu và model STT khác whisper-1 thì không đo. Phải deploy lại `nhan-xet-noi`; bản ghi đã nhận xét trước đó trả lại bản cũ (không có khối này).
- **Chấm AI chuyên sâu, giai đoạn 5 (phần NÓI thi thử) — 09/11** (`cham-po` viết lại, `_shared/gopDiemPO.js`, migration 198, `npm run check:champo`). `cham-po` chép lời whisper-1 kèm dấu thời gian từng từ → `doTroiChay` (học sinh chỉ thấy mức); hai giám khảo AI song song (lượt 2 chỉ điểm, qua `goiMoHinh` của loiNhacPE), gộp về ĐÚNG mức có trên grille PO (trung bình rồi lấy mức gần nhất, hoà lấy cao), lệch quá một mức (A1: quá 1 điểm) hoặc tổng quá 3 thì lượt 3 trung vị, `cham_doi.chua_chac`; lượt 1 trả `loi` (lọc bằng `locLoi` trên bản chép, bỏ chính tả/dấu câu), vào hồ sơ lỗi (tab Tiến bộ VIP đổi tên « Lỗi hay mắc », ví dụ có nhãn « bài nói »). Khiếu nại phần nói: bảng `po_khieu_nai` (khoá attempt_id), RPC `gui_khieu_nai_po`, `ds_khieu_nai_po`, `xu_ly_khieu_nai_po` (kiểm bằng `_thang_po`), chung hàng đợi `/professeur/khieu-nai-diem` (giáo viên nghe bản ghi qua signed URL); « Đã chấm lại » ghi `po_cham.nguon = giao_vien` và `luu_po_tu_cham` từ chối tự chấm đè (DA_CO_DIEM_GIAO_VIEN). Phải `db push` (198) và deploy lại `cham-po`.
- **Thi thử trong vỏ app + TCF Canada — 09/11** (theo chủ dự án; `shared/tcfCanada.js`, `screens/exam/TcfCanada.jsx`, `npm run check:tcf`). Thanh bên có nhóm « Thi thử » với hai mục: DELF-DALF (`/etudiant/examen`) và TCF Canada (`/etudiant/tcf-canada`), cả hai TRONG vỏ app; lúc ĐANG làm bài, ExamMode portal phần thi ra body thành lớp phủ kín màn hình (`#mcf-phong-thi`, `data-che-do-thi`), nên cuộn về đầu bài phải qua `cuonLenDau()` chứ không `window.scrollTo`. Đề TCF là đề thi thử thường có `level = 'TCF'` (cột level không ràng buộc, mã phần vẫn CO/CE/PE/PO, KHÔNG migration); `EXAM_STRUCTURE.TCF` mang thời lượng thật (35/60/60/12 phút) và thang 699/699/20/20; trang DELF lọc bỏ, trang TCF chỉ hiện level này; trình soạn đề có nút « TCF Canada » và ẩn tab thang chấm. Kết quả TCF (`KetQuaTCF`): Nghe, Đọc là điểm ƯỚC LƯỢNG (theo chủ dự án, màn hình KHÔNG ghi chữ « ước lượng » nữa) (câu sau nặng hơn, 3/9/15/21/26/33 điểm cho sáu mức, cộng 699; đề ít hơn 39 câu thì trải theo tỉ lệ) + NCLC theo bảng IRCC (canada.ca, đọc 09/11/2026); Viết, Nói CHƯA chấm theo thang TCF (cham-pe, cham-po, `_thang_po` chỉ biết DELF), màn hình nói thẳng. Chưa có đề TCF nào. `/etudiant/resultats` vẫn tính đề TCF theo kiểu DELF.
- **TCF tout public (« TCF Pháp ») — 10/11** (theo chủ dự án; migration 199, `TcfPhap` trong `screens/exam/TcfCanada.jsx`, `/etudiant/tcf-phap`). Đề có `level = 'TCF_TP'`; `EXAM_STRUCTURE.TCF_TP` theo trang FEI (cập nhật cho đợt 01/09/2026): Nghe 29 câu / 25′, **Maîtrise des structures de la langue 18 câu / 15′ (mã phần MS, migration 199 mở `exam_sections_code_check`)**, Đọc 29 câu / 45′ bắt buộc; Viết 3 bài / 60′, Nói 3 phần / 12′ tự chọn. `LA_TCF` nay đúng cho cả TCF và TCF_TP; `loaiDe(level)` chọn trang (delf | tcf | tcf_tp), `tenKyThi(level)` cho tiêu đề tờ đề và trình soạn đề. Kết quả: ba bài trắc nghiệm ra điểm ước lượng /699 (cùng `diemUocLuongTCF`) + trình độ CECRL theo bảng France Compétences RS 6460 (`capTcfTP`: A1 từ 101, Viết/Nói A1 = 1/20); KHÔNG tính « điểm chung QCM » vì FEI không công bố trọng số. Khối đầu màu tím (DELF xanh, Canada đỏ). Viết, Nói chưa chấm theo thang TCF. Chưa có đề. Phải `db push` (199) trước khi soạn đề có bài MS.
- **Học từ vựng theo chủ đề — 10/11** (theo chủ dự án; `content/tuVung/index.js`, `screens/student/TuVung.jsx` + `hinhTuVung.jsx`, `/etudiant/tu-vung(/:ma)`, tab « Từ vựng » của mục Học tập, `npm run check:tuvung`). 10 chủ đề A1 + 7 chủ đề A2 (11/11: quần áo, nghề nghiệp, bếp, du lịch, thiên nhiên, mua sắm, đồ công nghệ) + 6 chủ đề B1 (11/11: bệnh viện, môi trường, văn phòng, thể thao, văn hoá, giao thông) + 6 chủ đề B2 (11/11: khoa học, kinh tế, đời sống công dân, truyền thông, y học, đô thị), + 6 chủ đề C1 (11/11: tư pháp, thiên tai, nghệ thuật, công nghệ số, năng lượng, ẩm thực; từ không có hình trong bộ « color » thì THAY từ, ví dụ huître → crevette, vitrail → statue), + 6 chủ đề C2 (11/11: hàng hải, thiên văn, khảo cổ, tài chính, nông nghiệp, thời trang cao cấp), C1 và C2 là THUẬT NGỮ, CỤM TỪ chuyên ngành (11/11, chủ dự án: « C1 C2 phải là terminologie »: « la présomption d'innocence », « la fabrication additive », « la cessation de paiements »…), không phải danh từ đồ vật; hình Icons8 minh hoạ khái niệm, từ không trùng giữa các trình độ, × 10 từ có hình, danh sách chia theo trình độ (`CAP_TU_VUNG`); 11/11 làm lại giao diện có chuyển động (thanh chọn trình độ, thẻ chủ đề màu xếp quạt, trang chủ đề chia ba bước có vệt trượt; KHÔNG dùng hiệu ứng thoát AnimatePresence cho lưới chủ đề vì thẻ thoát dở nằm lại khi tab ngừng vẽ); mỗi chủ đề HỌC TRƯỚC, LÀM BÀI SAU (11/11, chủ dự án: « đã học đâu mà cho làm thẻ »): bước Học từ hiện ĐỦ hình, từ, giống, nghĩa, ví dụ (đã BỎ thẻ lật vì thẻ lật giấu từ, là kiểm tra chứ chưa phải học); Ghép hình và Luyện tập KHOÁ tới khi xem hết các từ (hoặc chủ đề đã có điểm, hoặc đã học xong trên máy này: localStorage `mcf-tv-da-hoc`, chỉ là tiện lợi, không phải hàng rào); nút « làm bài tập » không disabled mà đưa tới từ chưa xem → ghép hình với từ (pháo giấy khi xong) → bài luyện 16 câu TỰ SINH (`taoBaiTap`: chọn hình, chọn từ, chọn mạo từ, gõ từ; gõ thì dấu tính, « oe » nhận cho « œ »). Tiến độ lưu ở `bai_hoc_ket_qua` với mã `tv-…` qua `ghi_bai_hoc` (chung với Học ngữ pháp, KHÔNG migration). Nghe là giọng đọc của trình duyệt (speechSynthesis fr-FR), không phải audio thu sẵn. HÌNH: Icons8 bộ « color », id ở `HINH_ICONS8`, khoá bộ ở `icons8.json` (gốc dự án; thêm từ thì tìm trong ĐÚNG bộ này, id lấy từ công cụ tìm của Icons8 chứ không tự đặt), tải qua img.icons8.com, hỏng thì lùi về icon lucide (`tu.icon`); bản miễn phí đòi link nguồn, nhưng 11/11 chủ dự án yêu cầu BỎ dòng chữ ghi nguồn trên trang (vẫn dùng hình): điều kiện giấy phép là việc của chủ dự án với Icons8. Chưa xác nhận từng hình thuộc bộ miễn phí hay cần gói trả phí của Icons8. Plugin Icons8 cài ở phạm vi người dùng (`claude plugin install icons8@icons8`); phiên không có công cụ MCP thì gọi được qua `claude -p … --allowedTools mcp__plugin_icons8_icons8mcp__search_icons`.
- **Nói theo trong Học từ — 11/11** (theo chủ dự án; `screens/student/noiTuVung.jsx`). Dưới thẻ học: nói TỪ (kèm mạo từ) rồi CÂU VÍ DỤ; đạt hoặc « Bỏ qua » cả hai thì từ mới tính là đã học (mở Ghép hình, Luyện tập). Nhận giọng bằng Web Speech API của trình duyệt (fr-FR, miễn phí, KHÔNG dùng cham-phat-am vì một chủ đề tới 22 lượt, quá hạn mức 20/ngày); chấm bằng soCau (không dấu, gần theo âm), từ ≥ 75 % (được nuốt mạo từ), câu ≥ 70 %; không hiện điểm, chỉ tô màu từng từ. « Không tiện nói lúc này » tắt cho mọi chủ đề trên máy (localStorage `mcf-tv-tat-noi`), có nút bật lại. Trình duyệt không có bộ nhận giọng (Firefox) thì học như cũ. Chrome gửi tiếng nói tới máy chủ Google để nhận dạng.
- **Đọc C1 Đề 1 soạn lại + câu trả lời ngắn AI chấm — 12/11** (theo chủ dự án; lô 43, `scripts/nhap/lo43_c1_de1_doc.mjs` → migration 201). Khung theo đề mẫu chủ dự án gửi (KHÔNG chép nội dung): phỏng vấn tưởng tượng ~2 050 từ về nỗi sợ buồn chán, 12 câu = 14 dòng, 25 điểm (`heSo` nửa điểm): QCM 1–4 và 11, Vrai/Faux có trích dẫn (câu 6 ba ý, 8, 12; chấm theo lựa chọn như mọi đề B2/C1), 4 câu trả lời ngắn loại MỚI `court`. `court`: đáp án mẫu `model` + ý bắt buộc `answers` nằm ở answer_key; Edge Function `grade` gom mọi câu court của bài, gọi AI MỘT lần (model `gpt-6-luna`, đổi bằng `CE_AI_MODEL`, khoá OPENAI_API_KEY như cham-pe, KHÔNG trừ hạn mức AI của học sinh), điểm từng câu 0..heSo nửa điểm; AI hỏng thì câu đó `graded:false` và không tính vào tổng; bỏ trống = 0 không gọi AI. Màn thi hiện ô 3 dòng (ExamMode). Bài cũ `nhapmuqwmabz00p` giữ nguyên, migration chỉ đổi exam_sections phần CE của Đề 1. Builder giáo viên CHƯA biết loại `court` (đừng mở bài này trong Builder rồi lưu).
- **Audio Nghe thi thử B2, C1 khó hơn — 11/11** (theo chủ dự án; migration 200, `scripts/nhap/lo41_audio_thi_kho.py`). Chỉ xử lý ĐOẠN HỘI THOẠI trong file thi (dò vị trí bằng tương quan chéo với file `-tai-lieu`, `-docN` hoặc bản Wikipédia, 54/54 đoạn khớp ≥ 0,95 cả đoạn), lời dẫn và khoảng lặng giữ nguyên. B2 nhanh x1,12; C1 nhanh x1,2 + chỗ ngập ngừng (kéo dài nghỉ, lặp đầu cụm như vấp lời, cùng giọng vì cắt từ chính đoạn đó) + ồn nền khoảng -28 dB. File mới `…-thi-kho.mp3`, file cũ còn nguyên để lùi. Đề B2, C1 mới thì chạy lại máy này. **Từ đệm thật (cùng ngày, lô 42):** C1 Đề 2, Đề 3 đọc lại tài liệu bằng chính giọng cũ với « euh », « bon », lặp đầu câu viết tay trong bảng `SUA` của `scripts/nhap/lo42_c1_tu_dem.mjs` (chỉ thêm, script kiểm mọi đoạn trích trong lời giải còn nguyên), rồi `lo42_c1_tu_dem.py` ghép vào file thi (không vấp nhân tạo, tăng tốc 1,2 đến 1,35 theo bài vì giọng « spontanée » chậm hơn, ồn nền) → `…-thi-euh.mp3`, migration 200 trỏ 4 bài này vào đó. C1 Đề 1 là ghi âm người thật (Wikipédia parlée) nên chỉ có bản `-kho`. Lời chép/lời giải KHÔNG ghi từ đệm (như bản chép DELF). Đề C1 mới: thêm từ đệm vào lời thoại ngay khi soạn.
- **Điểm F chặn đi tiếp — 03/11** (theo chủ dự án; migration 189 cùng ngày xoay đáp án 3 bài ngữ pháp `nhap*` ngoài cây): bài dưới `NGUONG_F` (50%, điểm cao nhất) khoá các bài chưa làm phía sau trong kỹ năng nhỏ (`dsBaiKyNho` gắn `doF`), làm kỹ năng chưa đạt và chưa có hạng dù trung bình ≥ 70%, và `baiTiepTheo` trả null kể cả VIP. Bài Viết, Nói không điểm không bao giờ là F. Ca kiểm trong `check:luyentap`.
- **25 bài Viết A1 — 01/11** (lô 29, migration 180; `scripts/nhap/lo29_viet_a1*.mjs`). Phiếu: dùng câu `fill` cho một nhân vật để máy chấm được, khác đề thi thật là điền thông tin của mình; `formulaire` không có đáp án. Viết tự do là câu `open`, không chấm điểm, nên kỹ năng A1-PE-2, PE-3 chỉ ghi Hoàn thành; PE-1, PE-4, PE-5 có điểm và hạng. Bài mẫu: `PracticeWorkspace` gọi RPC `get_model_answer` sau khi nộp, vì `model` nằm ở `answer_key`. Chưa có AI nhận xét ở màn luyện tập.
- **25 bài Đọc A1 — 01/11** (lô 28, migration 179; `scripts/nhap/lo28_doc_a1*.mjs`, sơ đồ `lo28_so_do.mjs` ra `public/images/doc-a1/`). Sơ đồ là ảnh trong `readingText` (`<img>`), bảng là `<div class="mcf-bang"><table>`, kiểu ở `base.css`. Máy dựng tự kiểm: đủ số bài theo `duKien`, đoạn trích « » trong lời giải và đáp án điền từ phải có trong văn bản. Chấm điền từ BỎ DẤU (`norm`), nên kỹ năng A1-CE-5 « chép đúng dấu » hiện chưa bắt lỗi thiếu dấu.
- **Làm lại màn làm bài luyện tập — 01/11** (`PracticeWorkspace`, `KhoiDeBai`, `AudioBar`, `FocusShell` prop `mau`). Màu theo kỹ năng lấy từ `CATS[].dai`, `dam`. Đề bài là bong bóng thoại của Léon. Đáp án QCM ngắn (tối đa 12 ký tự, không ảnh, 2 đến 4 phương án) thành ô ngang. Thanh nộp bài dính đáy kèm ô số từng câu, đồng hồ nằm trong thanh này; bên phải chừa chỗ cho nút Léon nổi. `Taking` dùng chung bong bóng và trình phát nhưng thẻ câu hỏi, đầu bài vẫn kiểu cũ. Xem thử: `/preview.html`, màn « Luyện tập theo trình độ », ô « Xem màn làm bài » (chấm bằng hàm giả).
- **Bỏ dòng « voix de synthèse » khỏi đề bài — 01/11** (migration 178, theo chủ dự án, đảo quyết định 02/10). 29 bài Nghe A1; bản cũ ở `_sao_luu_consigne_0111`. Bài nghe mới KHÔNG thêm dòng này. Trang pháp lý vẫn nói audio luyện nghe là giọng tổng hợp, giữ nguyên.
- **Thư viện bài là bài bổ sung — 01/11** (`baiThuVien` ở PracticeHub). 11/11 (chủ dự án): tab « Thư viện bài » ĐÃ ẨN với học sinh; thanh tab học sinh chỉ còn « Theo trình độ » + « Thành tựu » (`TabLuyenTap.jsx`), khối đầu Luyện tập màu vàng. Học sinh chỉ thấy bài KHÔNG thuộc cây (`!kyNhoCuaBai(e)`), không tính vào tiến độ, hạng, chứng nhận; danh mục rỗng thì ẩn. Giáo viên vẫn thấy cả kho để quản lý. Muốn bài vào Thư viện thì đừng gắn `kyNang` và đừng ghi id trong `kyNang.js`.
- **Thứ tự cây áp cả ngoài cây — 01/11** (`khoaThuTu`, `khoaBai` ở PracticeHub). Mở thẳng qua state `moBai` (ô tìm kiếm, Tiến bộ VIP) gặp `ManKhoaThuTu` ở màn quiz. Gợi ý trang chủ lọc bài chưa tới lượt qua `chonDeXuat({ boQua })`. Bài đã làm luôn mở lại được; bài không thuộc cây, bài khoá phí và giáo viên không bị chặn. Bài giao ở kho riêng (`/etudiant/devoirs`), không đi qua đây. Màn quiz phải chờ `loaded` mới xét, chưa có `hist` thì bài đã làm bị khoá nhầm.
- `s:mcf-submissions` vẫn giữ làm sao lưu, chưa xoá.


Cách chắc chắn nhất để biết một lớp có thật: tìm nó trong CSS đã build. Nhưng
Tailwind THOÁT ký tự trong tên selector — `/`, `:`, `[`, `]`, `(`, `)`, `.`
đều được thêm dấu chéo ngược — nên dựng lại bộ thoát bằng regex là chỗ rất dễ
sai. Tôi sai hai lần liên tiếp và suýt "sửa" ba lớp hoàn toàn đúng.

Gỡ hết dấu thoát rồi so chuỗi thô, không còn gì để sai — `npm run check:css`
làm đúng việc đó:

```js
const css = fs.readFileSync(cssDaBuild, "utf8").split("\\").join("");
css.includes(".hover:ring-primary/40");   // tên lớp y như viết trong JSX
```

Nhớ tìm ĐÚNG tên trong mã, kể cả biến thể: `ring-primary/40` không tồn tại
nhưng `hover:ring-primary/40` thì có.