# FRACILE — Lộ trình sản phẩm & Khung phương pháp luyện thi DELF

> Viết ngày 2026-08-19. Phần "hiện trạng" dựa trên mã và dữ liệu thật đo được
> tại thời điểm đó, không phải trên giả định.

**Phạm vi đã chốt:** DELF **B1 và B2**. Không làm DALF C1 — quyết định ngày
2026-08-19. Mọi chỗ trong tài liệu này đã bỏ C1; nếu sau này mở lại thì cần
thêm bậc vào `LEVEL_COLORS` và chạy `npm run check:design` để kiểm tương phản.

---

## 0. Điều phải giải quyết trước mọi thứ khác

Ba nhóm tính năng bạn muốn — phân tích theo kỹ năng, thẻ ghi nhớ lặp lại ngắt
quãng, thi thử có tính giờ — đều cần **truy vấn theo dòng**. Dữ liệu hiện tại
không truy vấn được.

### Hiện trạng đo được

| | |
|---|---|
| Bảng Postgres thật | `profiles`, `exercise_access` — hết |
| Mọi thứ còn lại | blob JSON trong `kv_store` |
| `mcf-practice` | **144 KB** cho 39 bài / 415 câu |
| `mcf-submissions` | một blob chứa bài nộp của **toàn bộ** học sinh |

### Vì sao đây là chặn đường

**Ghi đè mất dữ liệu.** Mọi thao tác lưu đều là đọc-sửa-ghi cả blob. Hai giáo
viên sửa bài cùng lúc thì một người mất trắng. `AccountPage.jsx` đã có chú thích
cảnh báo đúng chuyện này cho `mcf-profiles` — nhưng cách chữa ở đó (đọc lại
trước khi ghi) chỉ thu hẹp cửa sổ, không đóng được nó.

**Chi phí đọc tuyến tính.** Mỗi học sinh mở thư viện là tải trọn 144 KB. Ở 200
bài sẽ là ~750 KB, ở 500 bài là ~1,8 MB — mỗi lần mở trang, cho mỗi người.

**Không thể hỏi câu hỏi nào có ích.** "Học sinh này yếu ở dạng câu suy luận"
là một câu `GROUP BY`. Trên blob JSON thì không có `GROUP BY`.

### Đề xuất: chuyển sang bảng thật, làm dần

Không đập đi làm lại. Ghi song song (dual-write) trong 2–4 tuần, đọc từ bảng
mới, giữ blob làm bản dự phòng, rồi mới cắt.

```sql
create table exercises (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  level         text not null,              -- A1 A2 B1 B2 B2+  (không có C1)
  usage_type    text not null default 'practice',
  time_limit    int,                        -- phút, null = không giới hạn
  reading_text  text,
  audio_url     text,
  created_by    uuid references auth.users,
  created_at    timestamptz default now(),
  published     boolean default false
);

create table questions (
  id            uuid primary key default gen_random_uuid(),
  exercise_id   uuid references exercises on delete cascade,
  ord           int not null,
  type          text not null,              -- qcm fill conj vf tableau ordre open
  prompt        text not null,
  payload       jsonb not null,             -- options / accepted / elements…
  explanation   text,
  -- HAI TRỤC PHÂN LOẠI, không phải một:
  competence    text,                       -- xem §1.2 — nuôi phần phân tích
  point_gram    text,                       -- 'cause', 'subjonctif'… — nuôi ôn tập
  difficulty    smallint,                   -- 1–5, hiệu chỉnh theo số liệu thật
  evidence      jsonb                       -- xem §3.2 — neo vào ngữ liệu
);

-- Mỗi LẦN làm bài là một dòng. Đây là thứ mở khoá toàn bộ phần phân tích.
create table attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  exercise_id   uuid references exercises not null,
  mode          text not null default 'practice',   -- practice | exam
  started_at    timestamptz default now(),
  finished_at   timestamptz,
  score         int,
  max           int,
  audio_plays   jsonb default '{}'          -- {question_id: số lần} — xem §2.3
);

create table answers (
  id            uuid primary key default gen_random_uuid(),
  attempt_id    uuid references attempts on delete cascade,
  question_id   uuid references questions not null,
  raw           jsonb,
  correct       boolean,
  ms_spent      int                         -- thời gian trên câu đó
);

create index on answers (question_id, correct);
create index on attempts (user_id, finished_at desc);
```

`ms_spent` trông nhỏ nhặt nhưng nó là dữ liệu quý nhất: một câu **trả lời đúng
nhưng mất 90 giây** ở kỳ thi tính giờ vẫn là điểm yếu, và không có trường này
thì không phát hiện được.

### Hai lỗ hổng còn lại, phát hiện khi đọc mã

1. **Hệ kỹ năng lệch trục với DELF.** `SKILLS` hiện là `Grammaire, Vocabulaire,
   Écoute, Lecture…` — phân loại theo *nội dung ngữ pháp*. DELF chấm theo
   *kỹ năng thi*: CO, CE, PE, PO. Cần **cả hai trục**, đó là lý do lược đồ trên
   có `competence` lẫn `point_gram`.
2. **Không có Production Orale.** Không có ghi âm, không có gì. Đây là lỗ hổng
   lớn nhất của một sản phẩm luyện DELF — PO chiếm 25/100 điểm.

> Bậc C1 từng nằm ở đây như một lỗ hổng thứ ba. Đã bỏ khỏi phạm vi — xem đầu
> tài liệu. `LEVEL_COLORS` giữ nguyên tới `B2+`, không cần đụng.

---

## 1. Khung phương pháp

### 1.1 "Pensée Linéaire" — đọc/nghe theo cấu trúc, không theo từ

Vấn đề của người học Việt: dịch từng từ, hết giờ, và vẫn không nắm được lập
luận. Bốn kỹ năng cần dạy, theo thứ tự:

**a. Đọc bộ khung trước khi đọc chữ.**
Văn bản lập luận tiếng Pháp được đánh dấu đường rất rõ. Dạy học sinh quét
connecteurs trước:

| Nhóm | Từ | Ý nghĩa với người đọc |
|---|---|---|
| Bổ sung | *de plus, en outre, par ailleurs* | Còn cùng luận điểm — đọc lướt |
| **Đảo chiều** | *néanmoins, cependant, toutefois, en revanche, or* | **DỪNG** — quan điểm thật thường nằm ngay sau |
| Nhân quả | *car, puisque, étant donné que, faute de* | Đang giải thích, không phải luận điểm mới |
| Kết luận | *ainsi, donc, en somme, force est de constater* | Câu trả lời cho "ý chính" hay nằm ở đây |

Từ đảo chiều là quan trọng nhất. Trong bài thi CE, câu hỏi "quan điểm của tác
giả là gì?" gần như luôn bẫy bằng cách đặt quan điểm *đối lập* ở trước
*néanmoins*, và người dịch từng từ sẽ chọn đúng cái bẫy đó.

**b. Tính năng cụ thể: "Mode Squelette".**
Một biến thể bài đọc: ban đầu giao diện chỉ hiện **các connecteurs và câu đầu
mỗi đoạn**, phần còn lại làm mờ. Học sinh phải đoán hình dạng lập luận
(thèse → antithèse → synthèse?) rồi mới được mở toàn văn.

Đây là tính năng khác biệt, dựng được, và dạy đúng thứ không sách nào dạy được:
*thói quen* nhìn khung trước.

Lược đồ: không cần bảng mới. Thêm `exercises.skeleton_mode boolean` và tính
mờ ở phía giao diện bằng regex connecteurs — không cần đánh dấu tay.

**c. Đoán từ theo ngữ cảnh, ép buộc.**
Bài tập có đồng hồ đếm ngược và **không có nút tra từ**. Sau khi nộp mới hiện
nghĩa. Ghi lại từ nào học sinh đoán sai → tự thành thẻ ghi nhớ (§1.3).

**d. Với CO: nghe phần "annonce", đừng nghe từ.**
Audio DELF (phỏng vấn, bản tin) hầu như luôn tự công bố cấu trúc: *"Trois
points aujourd'hui…"*, *"Nous verrons d'abord…"*. Dạy nghe lấy bộ khung ở 15
giây đầu, rồi mới nghe chi tiết ở lượt hai — khớp đúng với giới hạn nghe 2 lần
của kỳ thi.

### 1.2 Bảng phân loại `competence` — mấu chốt của toàn bộ phần phân tích

Đây là trường quan trọng nhất trong cả lược đồ. Không có nó thì không bao giờ
nói được câu "bạn yếu ở dạng suy luận".

| Mã | Tên hiển thị | Bẫy điển hình của người ra đề |
|---|---|---|
| `idee_generale` | Ý chính | Nhắc lại một chi tiết phụ nghe rất quen |
| `detail` | Chi tiết cụ thể | Đúng thông tin, sai chủ thể |
| `inference` | Suy luận | Đáp án đúng **không** có từ nào trùng văn bản |
| `opinion_ton` | Thái độ người nói | Trích đúng lời nhưng đảo sắc thái |
| `structure_logique` | Quan hệ lập luận | Bỏ qua *néanmoins* |
| `lexique_contexte` | Từ vựng theo ngữ cảnh | Nghĩa từ điển ≠ nghĩa trong câu |
| `chiffre_date` | Số liệu, ngày tháng | Đọc hai con số, chỉ một cái trả lời câu hỏi |

Gắn nhãn này cho **mọi** câu hỏi. Với 415 câu hiện có, đây là việc tay — nhưng
làm một lần và mở khoá vĩnh viễn phần phân tích.

### 1.3 Vi học tập & tích luỹ

**Thẻ ghi nhớ sinh từ lỗi sai, không phải nhập tay.**
Đây là điểm nối quan trọng: mỗi câu trả lời sai tự sinh một thẻ. Học sinh không
phải tự soạn gì — thứ họ không bao giờ làm.

```sql
create table cards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  kind          text not null,           -- mot | structure | astuce
  front         text not null,
  back          text not null,
  source_question_id uuid references questions,
  created_at    timestamptz default now()
);

create table reviews (
  card_id       uuid references cards on delete cascade primary key,
  user_id       uuid references auth.users not null,
  due_at        date not null,
  interval_days int not null default 1,
  ease          real not null default 2.5,
  lapses        int not null default 0
);
create index on reviews (user_id, due_at);
```

Dùng **SM-2**, đừng sáng tạo thuật toán mới. Nó cũ, đơn giản, và đủ tốt.
Truy vấn hằng ngày là `where user_id = $1 and due_at <= current_date`.

**"Mẹo" là một loại nội dung hạng nhất.**
Không nhét mẹo vào chú thích bài tập. Cho nó bảng riêng, gắn thẻ theo
`point_gram`, và **hiện đúng lúc**: học sinh vừa sai một câu về *à cause de /
grâce à* → hiện mẹo về cực tính của nguyên nhân, ngay tại đó.

**Chuỗi ngày học — đang hỏng, và biết vì sao.**
Ô "Chuỗi ngày học" trên trang chủ đang hiện `—` kèm dòng "hệ thống chưa ghi
hoạt động theo ngày". Đúng như vậy. Cần:

```sql
create table daily_activity (
  user_id  uuid references auth.users,
  day      date,
  minutes  int default 0,
  items    int default 0,
  primary key (user_id, day)
);
```

Một dòng mỗi người mỗi ngày. Chuỗi là một truy vấn cửa sổ. Rẻ, và biến một ô
trống thành thứ kéo người dùng quay lại.

---

## 2. Bộ máy thi thử

### 2.1 Cấu trúc thật của kỳ thi

| | DELF B1 | DELF B2 |
|---|---|---|
| CO | 25 phút · 25đ | 30 phút · 25đ |
| CE | 45 phút · 25đ | 60 phút · 25đ |
| PE | 45 phút · 25đ | 60 phút · 25đ |
| PO | 15' chuẩn bị + 15' | 30' chuẩn bị + 20' |

Đạt: **50/100 toàn bài VÀ ≥ 5/25 mỗi phần**. Ngưỡng thứ hai quan trọng hơn —
học sinh trượt vì một kỹ năng chết chứ hiếm khi vì tổng điểm. Giao diện kết quả
phải nói rõ điều đó.

### 2.2 Luồng giao diện "Mode Examen"

App đã có "🎯 Focus" trong PracticeHub — dựng tiếp trên đó, đừng làm lại.

```
Màn chờ  →  đọc quy tắc, xác nhận "tôi có 25 phút liên tục"
   ↓
CO       →  đồng hồ chạy, audio giới hạn 2 lượt, KHÔNG quay lại được
   ↓
CE       →  đồng hồ riêng, được quay lại giữa các câu trong phần
   ↓
PE       →  đếm từ, tự lưu nháp mỗi 10 giây
   ↓
Nộp      →  chấm tự động CO+CE ngay; PE chờ AI/giáo viên
```

Nguyên tắc giao diện quan trọng nhất: **không hiện đúng/sai trong lúc thi.**
Toàn bộ giá trị của bài thi thử nằm ở chỗ nó mô phỏng áp lực. Hiện phản hồi
ngay là biến nó về bài luyện tập.

Chi tiết Soft UI, hợp tông app hiện tại:
- Đồng hồ ở góc, `rounded-full bg-surface2`, chuyển `text-warn` ở 5 phút cuối,
  `text-danger` ở 1 phút. **Không nhấp nháy** — gây hoảng, không giúp gì.
- Thanh tiến độ theo *phần thi*, không theo câu.
- Rời tab → ghi nhận vào `attempts`, hiện nhắc nhẹ khi quay lại. **Không chặn.**
  Đây là tự học, không phải giám thị.

### 2.3 Giới hạn nghe 2 lần

Phải **lưu xuống máy chủ**, không giữ trong state React. Học sinh tải lại trang
là đếm lại từ đầu — mà đó chính là thứ họ sẽ thử.

Dùng `attempts.audio_plays jsonb`: `{"q_abc": 2}`. Tăng đếm ở phía server khi
phát. Hết 2 lượt thì nút phát chuyển `disabled` kèm lời giải thích, không im
lặng.

---

## 3. Phân tích & chữa bài

### 3.0 Hai thang điểm, tách hẳn nhau

**Đã chốt ngày 2026-08-19: điểm thi thử KHÔNG trộn vào thống kê luyện tập.**

Lý do là hai thang đo hai thứ khác nhau:

| | Luyện tập | Thi thử |
|---|---|---|
| Cách tính | **Điểm tốt nhất** sau nhiều lần thử | **Một lần duy nhất**, không làm lại |
| Ý nghĩa | Đã học được chưa | Hôm nay thi thì được bao nhiêu |
| Áp lực thời gian | Không | Có |

Trộn vào nhau thì hỏng cả hai: điểm luyện tập kéo dự đoán thi lên quá lạc quan,
còn một lần thi thử tệ lại làm biểu đồ tiến bộ trông như đi lùi trong khi người
học chẳng quên gì.

**Hệ quả kỹ thuật, phải nhớ khi code:**

1. `attempts.mode` (`practice` | `exam`) là ranh giới. **Mọi** truy vấn thống kê
   phải lọc theo nó — bỏ sót một chỗ là số liệu lẫn ngay.
2. `skillBreakdown()` trong `shared/exercises.js` hiện gộp *bài được giao* +
   *điểm tốt nhất khi luyện*. Khi có thi thử, nó vẫn chỉ được đọc hai nguồn đó.
   Hàm này đã trả kèm `sources` để phần chú thích nói rõ dữ liệu từ đâu — giữ
   nếp đó, thêm nguồn thứ ba thì thêm khoá vào `sources`.
3. Giao diện tách làm **hai khối riêng**, không phải hai đường trên cùng biểu đồ:
   - *Tiến độ luyện tập* — như hiện nay
   - *Kết quả thi thử* — danh sách theo thời gian, mỗi lần một dòng, kèm điểm
     từng phần CO/CE/PE và cảnh báo phần nào dưới 5/25
4. Chuỗi ngày học và thẻ ghi nhớ tính **cả hai** — chúng đo thói quen, không đo
   trình độ, nên ranh giới trên không áp dụng.

### 3.1 Điểm theo kỹ năng, không phải "7/10"

Có trường `competence` rồi thì đây chỉ là một truy vấn:

```sql
select q.competence,
       count(*) filter (where a.correct) as dung,
       count(*)                          as tong,
       round(avg(a.ms_spent))            as ms_tb
from answers a join questions q on q.id = a.question_id
where a.attempt_id in (
  select id from attempts
  where user_id = $1
    and mode = 'practice'      -- BẮT BUỘC: xem §3.0, không trộn thi thử vào
)
group by q.competence;
```

Trình bày: **đừng dùng biểu đồ radar.** Nó đẹp và khó đọc. Dùng các thanh ngang
xếp theo độ yếu tăng dần, câu yếu nhất trên cùng, kèm một câu hành động:

> **Suy luận · 3/11**
> Bạn hay chọn đáp án có chữ trùng với văn bản. Ở dạng câu này, đáp án đúng
> thường **diễn đạt lại** chứ không lặp từ.
> → *Luyện 5 câu suy luận*

Con số một mình không dạy được gì. Câu chẩn đoán mới dạy.

### 3.2 Neo đáp án vào ngữ liệu — chỗ tạo khác biệt lớn nhất

Đây là tính năng đáng giá nhất trong cả tài liệu này, và cũng ít ai làm.

Với mỗi câu hỏi CE/CO, lưu **vị trí chính xác** của đoạn chứa câu trả lời:

```jsonc
// questions.evidence
{
  "justification": { "start": 412, "end": 507 },   // offset ký tự trong reading_text
  "pieges": [
    { "option": 2, "start": 88, "end": 140,
      "pourquoi": "Đúng số liệu, nhưng nói về năm 2019, không phải 2023." }
  ]
}
```

Với CO, thay offset ký tự bằng mốc thời gian: `{ "from": 47.2, "to": 61.8 }` —
bấm vào là audio nhảy tới đúng giây đó.

Giao diện khi chữa bài:
- Chọn một đáp án → đoạn tương ứng trong văn bản **sáng lên**.
- Đáp án đúng: nền `ok-soft`. Bẫy đã chọn: nền `danger-soft` + câu giải thích
  *tại sao nó hấp dẫn*.
- Đây là chỗ học sinh học được nhiều nhất — không phải từ đáp án đúng, mà từ
  việc hiểu vì sao mình bị dụ.

Chi phí soạn đề tăng thật. Nhưng nó là thứ phân biệt "kho đề" với "gia sư".

### 3.3 AI chấm Production Écrite

`shared/gradingEngine.js` đã có sẵn `evaluateEssayWithAI()` trả về
`connected: false` cùng phác thảo. Ba điều bắt buộc khi nối thật:

**a. Chấm theo đúng lưới chính thức, không phải "cho điểm bài này".**
Lưới PE của DELF B1:

| Tiêu chí | Điểm |
|---|---|
| Respect de la consigne | 2 |
| Capacité à raconter et à décrire | 4 |
| Capacité à donner ses impressions | 4 |
| Lexique / orthographe lexicale | 4 |
| Morphosyntaxe / orthographe grammaticale | 5 |
| Cohérence et cohésion | 3 |

Buộc mô hình trả JSON đúng khuôn này. Một con số tổng thì vô dụng cho việc học.

**b. Chạy phía máy chủ, không có ngoại lệ.**
Edge Function của Supabase. Khoá API nhúng trong mã trình duyệt là khoá đã lộ —
ai mở DevTools cũng lấy được và tiêu tiền của bạn.

**c. Điểm AI là ĐỀ XUẤT, không phải điểm.**
Ghi vào `openMarks` kèm cờ `source: 'ai'`, giáo viên chốt. Điểm của một con
người phải do một con người ký. Ngoài lý do sư phạm, đây còn là hàng rào khi mô
hình chấm sai — mà nó sẽ sai.

---

## 4. Lộ trình ba giai đoạn

### Giai đoạn 1 — Nền móng (6–8 tuần)

Phần lớn là việc không hào nhoáng. Cố ý.

| Việc | Vì sao trước |
|---|---|
| Chuyển `exercises` / `questions` sang bảng thật, ghi song song | Chặn mọi thứ phía sau |
| Thêm `attempts` + `answers` | Không có nó thì không có phân tích |
| Gắn nhãn `competence` cho 415 câu hiện có | Việc tay, làm một lần |
| Viết `explanation` cho các câu hay sai | Hiện **0/415 câu** có |
| Neo `evidence` cho bài CE | Tính năng khác biệt lớn nhất |

Cuối giai đoạn 1, sản phẩm chưa có tính năng mới nào long lanh — nhưng mỗi bài
tập đã dạy được điều gì đó, và dữ liệu đã sẵn cho phân tích.

**Đừng đảo thứ tự này.** Làm thi thử trước khi có bảng `attempts` nghĩa là làm
lại nó ở giai đoạn 2.

### Giai đoạn 2 — Thi thử & tích luỹ (8–10 tuần)

- Bộ máy thi thử đủ CO + CE + PE, tính giờ theo từng phần
- Giới hạn nghe 2 lần, đếm ở máy chủ
- Giao diện chữa bài có neo ngữ liệu (§3.2)
- Thẻ ghi nhớ SM-2, sinh tự động từ lỗi sai
- `daily_activity` → chuỗi ngày học hết là ô trống
- "Mode Squelette" cho bài đọc

### Giai đoạn 3 — AI & cá nhân hoá (10–12 tuần)

- Chấm PE bằng LLM theo lưới, qua Edge Function, ra đề xuất
- **Production Orale**: ghi âm trình duyệt (`MediaRecorder`) → Supabase Storage
  → chuyển văn bản → chấm theo lưới PO. Đây là lỗ hổng lớn nhất hiện nay.
- Lộ trình cá nhân: chọn bài tiếp theo theo `competence` yếu nhất và `due_at`
  của thẻ
- Dự đoán điểm thi từ lịch sử — chỉ làm khi đã có đủ số liệu để không nói bừa

---

## 5. Nhật ký quyết định

### ✅ Đã chốt — 2026-08-19

**Phạm vi dừng ở B2, không làm DALF C1.**
`LEVEL_COLORS` giữ nguyên tới `B2+`. Mở lại sau này thì thêm một bậc và chạy
`npm run check:design`.

**Thi thử tách hẳn khỏi thống kê luyện tập.**
Ranh giới là `attempts.mode`. Chi tiết và hệ quả kỹ thuật ở §3.0.

### ⏳ Còn treo

**Một trục hay hai trục phân loại?**
Khuyến nghị hai: `competence` (kỹ năng thi) và `point_gram` (điểm ngữ pháp).
Gộp làm một sẽ phải chọn giữa "phân tích được" và "ôn tập được". Chốt trước khi
bắt đầu gắn nhãn 415 câu — làm lại là gắn lại từ đầu.

**Đề dùng chung hay mỗi giáo viên một kho?**
Hiện tại dùng chung toàn hệ thống. Với sản phẩm tự học thì đúng. Nhưng nếu định
mở cho giáo viên khác, phải quyết **trước khi** ngân hàng đề lớn — về sau tách
ra là một cuộc di trú đau đớn.
