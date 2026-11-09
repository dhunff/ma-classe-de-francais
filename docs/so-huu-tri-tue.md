# Đăng ký quyền sở hữu trí tuệ cho FRACILE

Checklist thực thi. Phần giải thích « vì sao » nằm trong phiên làm việc
09/11/2026; file này chỉ ghi việc phải làm và giấy phải nộp.

**Cảnh báo về số liệu trong file này.** Mức phí và tên văn bản ghi theo quy
định tôi biết tới tháng 5/2026. Phí sở hữu trí tuệ ở Việt Nam đã đổi nhiều
lần. **Kiểm lại trên trang của chính cơ quan trước khi chuyển tiền** —
`ipvietnam.gov.vn` cho nhãn hiệu, `cov.gov.vn` cho quyền tác giả. Đừng dùng
con số ở đây để lập dự toán.

Và: đây không phải tư vấn pháp lý. Với nhãn hiệu, một buổi tư vấn với đại diện
sở hữu công nghiệp có đăng ký (danh sách trên trang Cục SHTT) thường đáng tiền
hơn là tự mò — không phải vì thủ tục khó, mà vì phần phân nhóm và tra cứu
tương tự là chỗ sai thì mất cả phí thẩm định.

---

## Thứ tự làm

Làm theo đúng thứ tự này. Việc 1 và 2 không phụ thuộc gì nhau nhưng việc 1 là
việc có đồng hồ chạy.

| # | Việc | Gấp | Vì sao thứ tự này |
|---|---|---|---|
| 1 | Tra cứu nhãn hiệu | Tuần này | Miễn phí. Kết quả xấu thì phải tính lại tên trước khi tiêu tiền |
| 2 | Lập vi bằng nội dung website | Tuần này | Rẻ, nhanh, và giá trị chứng cứ tính từ NGÀY LẬP — lập muộn là mất quãng thời gian trước đó |
| 3 | Chốt nguồn gốc hình Léon | Trước việc 4, 5 | Quyết định Léon đăng ký được gì. Xem mục riêng bên dưới |
| 4 | Nộp đơn nhãn hiệu | Ngay sau việc 1 | First-to-file. Mỗi ngày chờ là một ngày người khác nộp được trước |
| 5 | Nộp đơn quyền tác giả mã nguồn | Trong tháng | Không có đồng hồ chạy, nhưng rẻ và dễ nhất |
| 6 | Quyền tác giả hình Léon, nội dung bài | Sau khi xong việc 3 | Phụ thuộc kết quả việc 3 |

---

## 1. Tra cứu nhãn hiệu (miễn phí, tự làm)

Hai cơ sở dữ liệu:

- `wipopublish.ipvietnam.gov.vn` — của Cục SHTT Việt Nam
- `branddb.wipo.int` — WIPO Global Brand Database, nhớ chọn lọc Việt Nam

Tra các chuỗi: `FRACILE`, `FRACIL`, `FRACILLE`, `FRAGILE`, và cả `FRA CILE`.
Lọc theo **Nhóm 41** và **Nhóm 42**.

Đọc kết quả:

- Không có gì trong nhóm 41, 42 → đi tiếp việc 4.
- Có nhãn hiệu **giống hoặc gần giống** trong nhóm 41 → dừng, hỏi đại diện
  SHCN trước khi nộp. Nộp vào chỗ đã có người là mất phí thẩm định mà không
  được gì.
- Có trong nhóm khác hẳn (ví dụ nhóm 25 quần áo) → thường không chặn, nhưng
  vẫn nên hỏi.

Ghi lại ngày tra và ảnh chụp kết quả. Nếu sau này bị phản đối, đó là bằng chứng
mình đã kiểm tra có thiện chí.

---

## 2. Lập vi bằng (làm sớm, giá trị tính từ ngày lập)

Đến **Văn phòng Thừa phát lại** (tỉnh/thành nào cũng có), yêu cầu lập vi bằng
ghi nhận:

- Nội dung trang `https://www.fracile.vn` tại thời điểm lập — các trang chính,
  trang giới thiệu, có logo Léon hiện ra
- Bộ hình Léon (mở từng tệp `public/leon/*.webp`)
- Lịch sử commit trên GitHub, nếu repo để public hoặc cho xem được

Chi phí khoảng 1–3 triệu, lấy trong vài ngày. Giá trị: chứng cứ trước toà về
việc « tôi đã dùng cái này từ ngày này ».

Vì sao không chỉ dựa vào git: timestamp trong git local sửa được bằng một biến
môi trường, nên giá trị chứng cứ yếu. Bản push lên GitHub có mốc thời gian của
bên thứ ba nên tốt hơn, nhưng vẫn không bằng một văn bản do người có thẩm quyền
lập.

---

## 3. Chốt nguồn gốc hình Léon — làm trước khi khai tờ nào

`src/shared/leon.jsx` ghi ảnh « cắt từ bảng sticker của chủ dự án » và
« cắt từ hai bảng sticker chủ dự án gửi » (bộ MC và bộ thám tử). Repo không ghi
bảng sticker đó từ đâu ra. Trả lời câu đó trước, vì **khai sai trong tờ khai
quyền tác giả là khai không đúng sự thật**, và Giấy chứng nhận cấp trên cơ sở
khai sai có thể bị huỷ.

| Nguồn gốc | Quyền tác giả | Nhãn hiệu hình | Việc phải làm |
|---|---|---|---|
| Tự vẽ | Đăng ký được, mình là tác giả | Được | Không có gì thêm |
| Thuê người vẽ | Tác giả là NGƯỜI VẼ | Được | Cần hợp đồng chuyển nhượng quyền tài sản có chữ ký. Chưa có thì ký ngay |
| AI sinh ra | Gần như KHÔNG — quyền tác giả đòi tác phẩm do con người sáng tạo | **Vẫn được** | Bỏ phần đăng ký quyền tác giả cho hình, chỉ đăng ký nhãn hiệu hình |
| Mua / tải kho ảnh | Không | Rủi ro bị phản đối | Kiểm giấy phép NGAY — đang dùng làm logo thương mại |

Ghi chú về nhánh AI: nhãn hiệu không đòi tính sáng tạo của tác giả, chỉ đòi
**khả năng phân biệt** và **không trùng nhãn hiệu có trước**. Nên hình do AI
vẽ vẫn đăng ký nhãn hiệu hình được bình thường. Đây là đường đi thực tế nếu
Léon không phải do người vẽ.

Nếu thuê người vẽ: quyền nhân thân (đứng tên tác giả, bảo vệ sự toàn vẹn tác
phẩm) **không chuyển nhượng được** theo luật Việt Nam. Hợp đồng chỉ chuyển được
quyền tài sản. Nghĩa là trong tờ khai, mục tác giả vẫn ghi tên người vẽ, mục
chủ sở hữu ghi tên bạn.

---

## 4. Nộp đơn nhãn hiệu

**Cơ quan:** Cục Sở hữu trí tuệ, Bộ Khoa học và Công nghệ
- Hà Nội: 386 Nguyễn Trãi, Thanh Xuân
- Có Văn phòng đại diện tại TP. Hồ Chí Minh và Đà Nẵng
- Nộp trực tuyến được qua hệ thống trên `ipvietnam.gov.vn` — nên nộp online,
  có dấu thời gian ngay

### Nộp mấy đơn

Một đơn khai được nhiều nhóm, nhưng **phí tính theo từng nhóm**. Hai lựa chọn:

- **Một đơn, nhiều nhóm** (41 + 42) — gọn, một số đơn, một lần theo dõi
- **Nhiều đơn riêng** — nếu một nhóm bị từ chối thì nhóm kia không bị kéo theo

Với FRACILE, một đơn hai nhóm là đủ. Thêm nhóm 9 nếu có kế hoạch làm app tải về.

### Nhóm và mô tả dịch vụ

Danh mục phải cụ thể, không viết chung chung « giáo dục ».

**Nhóm 41:**
> Giáo dục; đào tạo; dạy ngoại ngữ; dạy tiếng Pháp; tổ chức và tiến hành
> các kỳ thi, bài kiểm tra trình độ ngoại ngữ; cung cấp khoá học trực tuyến;
> xuất bản tài liệu giảng dạy điện tử; tư vấn giáo dục.

**Nhóm 42:**
> Cung cấp phần mềm không tải về (SaaS); thiết kế và phát triển phần mềm máy
> tính; cung cấp nền tảng trực tuyến không tải về; lưu trữ nội dung số.

**Nhóm 9, nếu lấy:**
> Phần mềm máy tính tải về được; ứng dụng di động tải về được; dữ liệu và
> tài liệu giảng dạy điện tử tải về được.

Lưu ý: mỗi nhóm được tính phí cho **6 sản phẩm/dịch vụ đầu tiên**; từ mục thứ
7 trở đi tính thêm. Danh sách trên đã quanh mức 6–8 mục, nên kiểm lại nếu muốn
tiết kiệm.

### Nộp mấy nhãn hiệu

Hai nhãn hiệu riêng, **hai đơn khác nhau**:

1. **Nhãn hiệu chữ** `FRACILE` — chữ trơn, không kiểu chữ riêng. Loại này bảo
   hộ rộng nhất: ai viết FRACILE kiểu gì cũng bị chặn.
2. **Nhãn hiệu hình** — hình đầu Léon (`public/leon/dau.webp`, đang dùng làm
   logo và favicon), hoặc hình Léon đứng kèm chữ FRACILE.

Đăng ký chữ trơn quan trọng hơn hình. Nếu chỉ đủ tiền cho một đơn, lấy chữ.

### Hồ sơ

- Tờ khai đăng ký nhãn hiệu, **02 bản** (mẫu của Cục SHTT — tải trên
  `ipvietnam.gov.vn`, đừng dùng mẫu tìm được trên blog)
- **05 mẫu nhãn hiệu**, kích thước trong khung 80 × 80 mm
- Danh mục hàng hoá/dịch vụ đã phân nhóm (phần trên)
- Chứng từ nộp phí
- Giấy uỷ quyền, nếu nộp qua đại diện SHCN
- Bản sao CCCD (cá nhân) hoặc Giấy chứng nhận đăng ký doanh nghiệp (công ty)

### Nên đứng tên ai

Cá nhân hay công ty đều được. Cân nhắc:

- **Cá nhân** — đơn giản, giữ được khi công ty thay đổi. Nhưng nếu sau này gọi
  vốn hoặc bán, nhãn hiệu không nằm trong công ty là điểm trừ trong soát xét.
- **Công ty** — gọn cho nhà đầu tư. Nhưng công ty giải thể thì phải làm thủ
  tục chuyển nhượng.

Chưa có công ty thì đứng tên cá nhân, sau chuyển nhượng được (có phí và thủ tục
riêng).

### Phí (kiểm lại trước khi nộp)

Theo Thông tư 263/2016/TT-BTC, cho **một nhóm, tối đa 6 dịch vụ**:

| Khoản | Mức |
|---|---|
| Lệ phí nộp đơn | 150.000 đ |
| Phí công bố đơn | 120.000 đ |
| Phí tra cứu phục vụ thẩm định nội dung | 180.000 đ / nhóm |
| Phí thẩm định nội dung | 550.000 đ / nhóm |
| **Tạm tính một nhóm** | **~1.000.000 đ** |

Nhóm thứ hai cộng thêm khoảng 730.000 đ (tra cứu + thẩm định). Mỗi dịch vụ từ
thứ 7 trong một nhóm cộng thêm (tra cứu + thẩm định).

Khi được cấp văn bằng, nộp thêm: lệ phí cấp Giấy chứng nhận, phí công bố quyết
định cấp, phí đăng bạ — tổng khoảng 360.000 đ.

Nên ước **3–4 triệu** cho hai nhãn hiệu × hai nhóm, chưa tính phí đại diện
SHCN (thường 2–5 triệu/đơn nếu thuê).

### Thời gian

| Giai đoạn | Theo luật | Thực tế |
|---|---|---|
| Thẩm định hình thức | 1 tháng | 1–2 tháng |
| Công bố đơn | 2 tháng từ khi chấp nhận đơn | |
| Thẩm định nội dung | 9 tháng | 18–30 tháng |

**Quyền tính từ NGÀY NỘP ĐƠN**, không phải ngày được cấp. Nên nộp sớm có giá
trị ngay cả khi phải chờ hai năm mới có giấy.

Bảo hộ **10 năm** từ ngày nộp đơn, gia hạn được không giới hạn số lần.

Trong lúc chờ, dùng ký hiệu `™` được. Chỉ dùng `®` sau khi đã có Giấy chứng
nhận — dùng sớm là hành vi bị xử phạt.

---

## 5. Nộp đơn quyền tác giả

**Cơ quan:** Cục Bản quyền tác giả, Bộ Văn hoá, Thể thao và Du lịch
- Hà Nội: số 33 ngõ 294/2 Kim Mã, Ba Đình
- Có Văn phòng đại diện tại TP. Hồ Chí Minh và Đà Nẵng

Văn bản hướng dẫn hiện hành: **Nghị định 17/2023/NĐ-CP** (hướng dẫn Luật Sở
hữu trí tuệ về quyền tác giả, quyền liên quan). Kiểm lại hiệu lực và mẫu tờ
khai trên `cov.gov.vn`.

### Ba đơn riêng, ba loại hình

**a) Chương trình máy tính — mã nguồn FRACILE**

Hồ sơ:
- Tờ khai đăng ký quyền tác giả (mẫu của Cục)
- **02 bản sao tác phẩm**: thực tế là 02 đĩa CD/USB chứa mã nguồn, **kèm bản
  in** mã nguồn (hoặc trích đoạn tiêu biểu nếu quá dài — hỏi trước Cục nhận
  kiểu nào), **có chữ ký hoặc dấu giáp lai từng trang**
- Bản mô tả chương trình: chức năng, môi trường chạy, ngôn ngữ lập trình
- Bản sao CCCD
- Giấy uỷ quyền nếu nộp qua đại diện
- Văn bản đồng ý của các đồng tác giả, nếu có người khác tham gia viết mã

Phí: **600.000 đ**

Điểm phải xử lý trước khi nộp: repo dùng thư viện nguồn mở (React, Tailwind,
Supabase client, recharts, framer-motion…). Đó là mã của người khác, có giấy
phép riêng. Khi khai, phạm vi tác phẩm là **mã do bạn viết**, không phải cả
`node_modules`. Nếu in mã nguồn thì đừng in thư viện.

**b) Tác phẩm mỹ thuật ứng dụng — bộ hình Léon**

Chỉ nộp sau khi đã trả lời xong mục 3. Nếu Léon do AI vẽ thì **bỏ đơn này**.

Hồ sơ: như trên, bản sao tác phẩm là 02 bộ ảnh in màu + đĩa.

Phí: **400.000 đ**

**c) Tác phẩm viết — nội dung bài học**

76 bài ngữ pháp trong `src/content/nguPhap`, đề luyện tập, nội dung Đố vui,
Phiên toà, Lộ trình.

Phí: **100.000 đ**

**Phải loại trừ phần không phải của mình.** Hai chỗ đã biết:
- **Grille chấm DELF** (`supabase/functions/_shared/grillePO.js`,
  `delfGrille.js`) — repo ghi « chép từ tờ grille giám khảo chủ dự án cung
  cấp ». Đó là của France Éducation international.
- Bất kỳ đoạn nào lấy nguyên văn từ đề thi thật hoặc sách giáo trình.

Repo ghi rõ đề thi mới soạn theo khuôn mẫu đề chính thức mà **không chép nội
dung** (lô 20 trở đi) — phần đó là của bạn, khai được.

### Thời gian và kết quả

15 ngày làm việc theo luật, thực tế 1–2 tháng. Kết quả: **Giấy chứng nhận đăng
ký quyền tác giả**.

Nhắc lại cho rõ: quyền tác giả **đã có từ khi tác phẩm được tạo ra**, không
đăng ký vẫn có. Giấy chứng nhận không « tạo ra » quyền — nó chuyển gánh nặng
chứng minh sang phía bên kia khi có tranh chấp. Đó là toàn bộ giá trị của nó,
và với 600.000 đ thì rất đáng.

---

## 6. Rủi ro về nhãn hiệu của người khác

Hai chỗ FRACILE đang chạm vào tài sản của người khác. Không phải việc đăng ký,
nhưng là việc phải biết trước khi đăng ký.

### DELF / DALF

« DELF » và « DALF » là nhãn hiệu của **France Éducation international**.

Được:
- Dùng để chỉ dẫn trung thực: « luyện thi DELF B2 », « đề theo format DELF ».
  Đây là dùng mang tính mô tả, pháp luật nhãn hiệu không cấm.

Không được:
- Đăng ký nhãn hiệu nào **có chứa** chữ DELF hoặc DALF.
- Viết theo cách khiến người đọc hiểu FRACILE được DELF công nhận, liên kết,
  hay là trung tâm được uỷ quyền.

Nên kiểm lại trang giới thiệu và các trang công khai (`/`, `/decouvrir`,
`/faq`) xem có câu nào có thể hiểu thành « được DELF chứng nhận » không. Nếu
có, sửa trước. Đây là chỗ dễ bị khiếu nại nhất và sửa thì rẻ.

Cân nhắc thêm một dòng trong `/dieu-khoan`: nói rõ FRACILE là nền tảng luyện
thi độc lập, không liên kết với France Éducation international hay cơ quan tổ
chức thi nào.

### Hình Léon và các nhân vật bulldog Pháp khác

Léon là « bulldog Pháp áo sọc, khăn đỏ ». Trước khi nộp đơn nhãn hiệu hình,
tra `branddb.wipo.int` bằng tìm theo hình (image search) hoặc theo từ khoá
`bulldog`, `dog mascot` trong nhóm 41 và 9. Mục đích không phải là lo xa — mà
là tránh nộp phí thẩm định cho một hình sẽ bị từ chối.

---

## 7. Giữ tên miền

`fracile.vn` đã có. Tên miền không phải quyền SHTT nhưng mất là mất.

- Bật tự động gia hạn, và kiểm email đăng ký tên miền còn dùng được không
- Cân nhắc lấy `fracile.com` nếu chưa có — chặn người khác lập trang giống
- Giữ bản ghi ai là chủ thể đăng ký tên miền, khớp với tên trên đơn nhãn hiệu

---

## Tóm lại chi phí

| Việc | Tạm tính |
|---|---|
| Tra cứu nhãn hiệu | 0 đ |
| Vi bằng website | 1–3 triệu |
| Nhãn hiệu chữ FRACILE, 2 nhóm | ~1,8 triệu + ~0,4 triệu khi cấp |
| Nhãn hiệu hình Léon, 2 nhóm | ~1,8 triệu + ~0,4 triệu khi cấp |
| Quyền tác giả mã nguồn | 600.000 đ |
| Quyền tác giả hình Léon | 400.000 đ (bỏ nếu do AI vẽ) |
| Quyền tác giả nội dung bài | 100.000 đ |
| **Tự làm, tổng** | **~7–9 triệu** |
| Thuê đại diện SHCN cho phần nhãn hiệu | thêm 4–10 triệu |

Nếu phải cắt: giữ **nhãn hiệu chữ FRACILE nhóm 41** và **quyền tác giả mã
nguồn**. Hai món đó khoảng 1,6 triệu và che được phần lớn rủi ro thực tế.
