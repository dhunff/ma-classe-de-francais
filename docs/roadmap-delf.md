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

Nền tảng máy chủ đã khá hơn nhiều so với những gì nhìn từ `src/`. Có **6
migration**, **4 bảng thật**, RLS đầy đủ, và **2 Edge Function** đang chạy.

| Bảng | Trạng thái |
|---|---|
| `profiles` | Xong. Trigger tự điền từ `auth.users`, RLS theo vai |
| `exercise_access` | Xong. Client chỉ đọc; ghi qua Edge Function giữ `service_role` |
| `submissions` | **Tạo rồi nhưng ứng dụng chưa dùng** — xem cảnh báo dưới |
| `kv_store` | Còn là kho chính. RLS đã siết ở migration 002 |

| Blob còn lại trong `kv_store` | Kích thước |
|---|---|
| `s:mcf-practice` | **144 KB** — 39 bài / 415 câu |
| `s:mcf-exercises` | 9 KB |
| `s:mcf-submissions` | bài nộp của **toàn bộ** học sinh trong một dòng |

Hàm `public.is_teacher()` (migration 002) đọc vai từ `app_metadata` chứ không
phải `user_metadata` — đúng, vì `user_metadata` do chính người dùng ghi được.
Mọi policy mới đều nên dùng lại hàm này.

### ⚠️ Việc dở dang cần đóng trước tiên

Migration 005 tạo bảng `submissions`, chép dữ liệu sang, viết đủ RLS theo dòng.
**Nhưng `src/` chưa hề đụng tới bảng đó** — `Taking.jsx` và `App.jsx` vẫn
`load`/`save` blob `s:mcf-submissions`.

Hai hệ quả, cái sau nặng hơn cái trước:

1. **Bảng đang trôi khỏi thực tế.** Mọi bài nộp kể từ lúc chạy 005 chỉ vào
   blob. Bước kiểm trong chính file đó — *"hai số phải bằng nhau"* — bây giờ
   chắc chắn lệch.
2. **Lỗ hổng mà 005 sinh ra để vá vẫn đang mở.** Migration 002 nói thẳng: RLS
   phân quyền theo dòng, mà cả lớp chung một dòng, nên *"một học sinh ĐÃ ĐĂNG
   NHẬP vẫn có thể xoá sạch bài nộp của cả lớp nếu cố tình"*. Bảng mới đóng
   được lỗ đó, nhưng chỉ khi ứng dụng thật sự chuyển sang dùng.

Chuyển `Taking.jsx` sang ghi vào bảng là việc nhỏ hơn nhiều so với phần còn lại
của Giai đoạn 1, và nó vá một lỗ bảo mật đang mở. Làm trước.

### Vì sao phần blob còn lại vẫn là chặn đường

**Ghi đè mất dữ liệu.** Mọi thao tác lưu đều là đọc-sửa-ghi cả blob. Hai giáo
viên sửa bài cùng lúc thì một người mất trắng. `AccountPage.jsx` đã có chú thích
cảnh báo đúng chuyện này cho `mcf-profiles` — nhưng cách chữa ở đó (đọc lại
trước khi ghi) chỉ thu hẹp cửa sổ, không đóng được nó.

**Chi phí đọc tuyến tính.** Mỗi học sinh mở thư viện là tải trọn 144 KB. Ở 200
bài sẽ là ~750 KB, ở 500 bài là ~1,8 MB — mỗi lần mở trang, cho mỗi người.

**Không thể hỏi câu hỏi nào có ích.** "Học sinh này yếu ở dạng câu suy luận"
là một câu `GROUP BY`. Trên blob JSON thì không có `GROUP BY`.

### Đề xuất: chuyển sang bảng thật, theo đúng khuôn 005

Không cần phát minh quy trình — migration 005 đã là bản mẫu chạy được:

1. Tạo bảng mới, bật RLS, viết policy dùng `is_teacher()`
2. Chép dữ liệu từ blob sang bằng `jsonb_array_elements`
3. **Giữ nguyên blob làm bản sao lưu**, không xoá
4. Kèm sẵn câu SQL đối chiếu số lượng ở cuối file
5. Chỉ chuyển ứng dụng sang bảng mới **sau khi** hai số khớp
6. Xoá blob sau cùng, khi đã chạy ổn một thời gian

Bước 5 chính là bước `submissions` đang mắc kẹt. Đừng lặp lại với `exercises`.

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

### RLS — hệ quả của quyết định "đề dùng chung"

Chốt ngày 2026-08-19: **một ngân hàng đề chung cho toàn hệ thống**, không chia
theo giáo viên. Điều đó làm phần phân quyền đơn giản hẳn.

Dùng lại `public.is_teacher()` đã có từ migration 002 — đừng viết hàm kiểm vai
thứ hai. Nó đọc `app_metadata`, là chỗ duy nhất người dùng không tự sửa được.

```sql
alter table exercises enable row level security;
alter table questions enable row level security;
alter table attempts  enable row level security;
alter table answers   enable row level security;

-- Đề: ai đăng nhập cũng ĐỌC được bài đã xuất bản; chỉ giáo viên GHI.
create policy exercises_read on exercises for select to authenticated
  using (published or public.is_teacher());

create policy exercises_write_teacher on exercises for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

-- Bài làm: mỗi người chỉ thấy của mình.
-- Giáo viên cần xem bài học sinh thì thêm policy RIÊNG cho vai prof, giống
-- cách 005 làm với submissions — đừng nới policy này thành "prof đọc tất".
create policy attempts_own on attempts for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy answers_own on answers for all to authenticated
  using (exists (select 1 from attempts
                 where id = answers.attempt_id
                   and user_id = (select auth.uid())));
```

`(select auth.uid())` chứ không phải `auth.uid()` trần: bọc trong subquery thì
PostgreSQL tính một lần cho cả câu thay vì tính lại trên từng dòng. Migration
003 và 005 đã viết theo lối này — giữ nhất quán.

Điểm dễ sai nhất: `questions` chứa **đáp án**. Nếu policy của nó chỉ là "ai đăng
nhập cũng đọc" thì học sinh mở DevTools là thấy đáp án trước khi làm. Hai cách
xử lý:

- Tách cột đáp án sang bảng `question_keys` riêng, chỉ đọc được sau khi có
  `attempts.finished_at`; hoặc
- Chấm ở phía server bằng Edge Function, client không bao giờ nhận đáp án.

Cách thứ hai sạch hơn nhưng phải chuyển `gradingEngine.js` lên server. Hiện tại
bài luyện tập chấm ở client và đáp án nằm sẵn trong bundle — chấp nhận được cho
tự luyện, **không** chấp nhận được cho thi thử. Quyết định này gắn liền với việc
làm Mode Examen ở Giai đoạn 2.

`ms_spent` trông nhỏ nhặt nhưng nó là dữ liệu quý nhất: một câu **trả lời đúng
nhưng mất 90 giây** ở kỳ thi tính giờ vẫn là điểm yếu, và không có trường này
thì không phát hiện được.

### Đã có sẵn, dùng lại đừng viết lại

Thư mục `supabase/` chứa nhiều thứ có thể sao chép thẳng cho các bảng mới:

| Có sẵn | Dùng lại vào việc gì |
|---|---|
| `public.is_teacher()` — migration 002 | Mọi policy phân vai. Đọc `app_metadata`, an toàn |
| Khuôn migration 005 | Bản mẫu đầy đủ cho việc blob → bảng, kèm bước đối chiếu |
| `functions/sepay-webhook/` | Bản mẫu Edge Function có bí mật + `service_role` |
| `functions/grant-access/` | Bản mẫu Edge Function được client gọi |
| Trigger `handle_new_user` — 003 | Nếp tự điền bảng phụ từ `auth.users` |
| `RUNBOOK.md`, `README.md` | Quy trình vận hành đã viết sẵn |

Nghĩa là Giai đoạn 1 **không phải dựng móng** — móng có rồi. Chỉ là xây tiếp
theo đúng nếp đã có.

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

### 1.2b Trục thứ hai: `point_gram`

Chốt ngày 2026-08-19: dùng **hai trục**. `competence` trả lời *"em yếu kỹ năng
thi nào"*, `point_gram` trả lời *"em cần ôn lại bài gì"*. Hai câu hỏi khác nhau,
hai danh sách khác nhau.

Danh sách đóng — thêm giá trị mới thì thêm vào đây trước, đừng gõ tự do vào ô
nhập, nếu không sáu tháng nữa sẽ có `subjonctif`, `Subjonctif` và `le subjonctif`
nằm cạnh nhau và không nhóm được.

> `temps_present` và `formation_mots` được thêm ngày 2026-08-20, lúc gắn nhãn
> thật (migration 011): thư viện có **ba bài luyện thì hiện** (60 câu) và **hai
> bài về họ từ** (24 câu) mà bảng ban đầu không có chỗ chứa. Bảng này được viết
> trước khi nhìn dữ liệu — đó là cái giá của việc thiết kế phân loại từ lý
> thuyết.

| Nhóm | Mã | Bao gồm |
|---|---|---|
| Động từ | `temps_present` | présent de l'indicatif, ba nhóm động từ |
| | `temps_passe` | passé composé, imparfait, plus-que-parfait |
| | `temps_futur` | futur simple, futur proche, futur antérieur |
| | `subjonctif` | présent + passé, các mệnh đề đòi subjonctif |
| | `conditionnel` | ba loại câu điều kiện |
| | `voix_passive` | bị động, *se faire + inf.* |
| Cấu trúc câu | `pronoms` | COD/COI, *y*, *en*, đại từ quan hệ |
| | `articles_determinants` | mạo từ, sở hữu, chỉ định, số lượng |
| | `negation` | *ne… que*, *ne… plus*, phủ định kép |
| | `interrogation` | ba dạng câu hỏi, *quel/lequel* |
| | `accord` | hợp giống số, hợp phân từ quá khứ |
| Liên kết ý | `cause_consequence` | *parce que, car, grâce à, à cause de, donc* |
| | `opposition_concession` | *mais, néanmoins, bien que, malgré* |
| | `but_hypothese` | *pour que, afin de, au cas où* |
| | `temps_connecteurs` | *depuis, pendant, il y a, dès que* |
| | `discours_rapporte` | tường thuật, chuyển thì |
| Từ vựng | `lexique_thematique` | theo chủ đề của kỳ thi |
| | `formation_mots` | cấu tạo từ, họ từ, tiền tố/hậu tố |
| | `registre` | trang trọng / thân mật |

### Đã gắn xong — 2026-08-20 (migration 011)

| | `point_gram` | `competence` |
|---|---|---|
| Có nhãn | 215 / 416 | **54 / 416** |
| Để trống | 201 | 362 |

Con số `competence` thấp là **đúng**, không phải làm dở. Bảng đó thiết kế cho
câu hỏi đọc/nghe hiểu, mà thư viện chỉ có 54 câu như vậy; 362 câu còn lại là
bài luyện rời — ngữ pháp, dịch, viết. Gắn `inference` cho một bài chia động từ
là bịa ra một phép đo không tồn tại.

Hệ quả cho phần phân tích: **thống kê theo `competence` chỉ có ý nghĩa khi thư
viện có thêm bài CE/CO.** Với thư viện hiện tại, trục dùng được là `point_gram`.

`competence` gắn cho **mọi** câu. `point_gram` chỉ gắn khi câu thật sự kiểm một
điểm ngữ pháp cụ thể — bài đọc hiểu hỏi ý chính thì để trống, đừng cố nhét.

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

**Chuỗi ngày học — xong 2026-09-02 (migration 061).**
Ô trên trang chủ từng hiện `—` kèm dòng "hệ thống chưa ghi hoạt động theo
ngày". Nay có nguồn thật. Lược đồ dựng đúng như phác dưới đây, thêm ba thứ mà
bản phác không lường:

- ngày do CLIENT gửi xuống (múi giờ), máy chủ chặn khoảng ±1 để không ai tự
  đắp chuỗi;
- không có policy ghi — đường ghi duy nhất là RPC `ghi_hoat_dong`;
- `minutes` để sẵn nhưng KHÔNG ghi: hệ thống chưa đo được thời gian học thật,
  và một con số ước lượng ở đó là bịa dữ liệu.

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
| **Chuyển `Taking.jsx` sang bảng `submissions`** | Bảng đã sẵn từ migration 005; lỗ bảo mật ở 002 vẫn đang mở tới khi làm xong |
| Chuyển `exercises` / `questions` sang bảng thật, theo khuôn 005 | Chặn mọi thứ phía sau |
| Thêm `attempts` + `answers` | Không có nó thì không có phân tích |
| Gắn nhãn `competence` + `point_gram` cho 415 câu | Việc tay, làm một lần |
| ~~Viết `explanation` cho các câu hay sai~~ | 207/373 câu có. Màn xếp thứ tự ưu tiên: `/professeur/loi-giai` (02/09) |
| Neo `evidence` cho bài CE | Tính năng khác biệt lớn nhất |

Việc đầu tiên nhỏ và nên làm ngay: bảng, dữ liệu và policy đều đã có, chỉ thiếu
phía ứng dụng đọc ghi vào đó.

Cuối giai đoạn 1, sản phẩm chưa có tính năng mới nào long lanh — nhưng mỗi bài
tập đã dạy được điều gì đó, và dữ liệu đã sẵn cho phân tích.

**Đừng đảo thứ tự này.** Làm thi thử trước khi có bảng `attempts` nghĩa là làm
lại nó ở giai đoạn 2.

### Giai đoạn 2 — Thi thử & tích luỹ (8–10 tuần)

- Bộ máy thi thử đủ CO + CE + PE, tính giờ theo từng phần
- Giới hạn nghe 2 lần, đếm ở máy chủ
- Giao diện chữa bài có neo ngữ liệu (§3.2)
- ~~Thẻ ghi nhớ SM-2, sinh tự động từ lỗi sai~~ — xong 02/09,
  migration 063–066. Chi tiết và hai chỗ dễ viết sai ở CLAUDE.md.
- ~~`daily_activity` → chuỗi ngày học hết là ô trống~~ — xong 02/09,
  migration 061/062. Chi tiết và ba cái bẫy ở CLAUDE.md.
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

**Hai trục phân loại: `competence` + `point_gram`.**
Danh sách giá trị đóng của cả hai ở §1.2 và §1.2b. `competence` gắn cho mọi câu,
`point_gram` chỉ gắn khi câu thật sự kiểm một điểm ngữ pháp.

**Một ngân hàng đề dùng chung toàn hệ thống.**
Không chia kho theo giáo viên. Policy RLS tương ứng ở §0 — viết ngay lúc tạo
bảng, đừng để sau.

### ⏳ Còn treo

**Chấm ở client hay ở server?**
Hiện chấm ở client, đáp án nằm trong bundle. Chấp nhận được cho tự luyện, không
chấp nhận được cho thi thử. Phải quyết trước khi làm Mode Examen (Giai đoạn 2) —
xem cuối §0.
