# Kế hoạch bài tập ở thẻ Luyện tập theo DELF A1–B2

> Viết ngày 31/10/2026. Số liệu thư viện đo trực tiếp trên database thật cùng ngày.
> Đây là kế hoạch, chưa có gì trong tài liệu này được xây dựng.

## 1. Mục tiêu

Mỗi bài ở thẻ Luyện tập phải trả lời được ba câu:

1. Bài này luyện **kỹ năng nhỏ** nào?
2. Kỹ năng đó phục vụ **bài thi nào, tiêu chí chấm nào** của DELF?
3. Làm tốt thì học sinh **tiến gần mốc nào**?

Kế hoạch gồm 4 trình độ × 4 kỹ năng, tổng 188 bài. 42 bài đang có có thể dùng lại sau khi rà nhãn, cần soạn mới khoảng 146 bài.

**Đã chốt mặc định (đổi được):**

- Tài liệu này chi tiết A1, A2, B1, B2. Bản đầy đủ gồm cả DALF C1, C2 nằm ở `docs/ke-hoach-ky-nang-DELF-DALF.xlsx` (112 kỹ năng nhỏ, 278 bài), và file Excel đó là bản mới nhất.
- Soạn theo format 2 của DELF (phần hiểu chủ yếu QCM), như ghi chú trong `docs/format-de-thi-DELF-A1-B2.xlsx`.
- Ngữ pháp, Từ vựng, Dịch không bị xoá, chúng chuyển thành nhóm « Nền tảng » hỗ trợ bốn kỹ năng.
- Ưu tiên A1–A2 trước: đó là nhóm đang có trình độ ghi rõ nhiều nhất (24 hồ sơ Débutant, A1, A2 so với 3 hồ sơ B2) và thư viện hổng nặng nhất.

## 2. Hiện trạng đo được

Kho `practice` có **92 bài, 848 câu**. Kho `exam` có 167 bài riêng và không tính ở đây.

| Trình độ | Nghe | Đọc | Viết | Nói | Ngữ pháp | Từ vựng | Dịch |
|---|---|---|---|---|---|---|---|
| A1 | 3 bài, 13 câu | **0** | **0** | **0** | 6 bài | 2 bài | 2 bài |
| A2 | 1 bài, 6 câu | 12 bài, 86 câu | **0** | **0** | 6 bài | 2 bài | 1 bài |
| B1 | 9 bài, 71 câu | 5 bài, 25 câu | 4 bài, 4 câu | **0** | 9 bài | 3 bài | 2 bài |
| B2 | 3 bài, 27 câu | 2 bài, 23 câu | 3 bài (*) | **0** | 6 bài | 0 | 1 bài |

(*) Gồm 2 bài « Production écrite » và 1 bài gắn nhãn « Écriture » toàn QCM. Nhãn này lệch khỏi danh sách `SKILLS` và cần được xếp lại.

Những điểm đáng chú ý:

- **Luyện nói: 0 bài ở cả bốn trình độ**, dù phần nói chiếm 25/100 điểm. Màn Nghe & Nói chỉ có chép chính tả và phát âm từng câu, chưa luyện được ba phần của bài thi nói.
- **Luyện viết: 0 bài ở A1 và A2.** B1 và B2 chỉ có đề viết, chưa có bài dạy từng tiêu chí.
- **Đọc A1: 0 bài.**
- Chỉ **54/848 câu** có nhãn `competence`, nên chưa nói được « bạn yếu ở dạng suy luận ».
- Chưa bài nào cho biết mình phục vụ phần thi nào.
- Nhiều lượt làm tập trung ở ngữ pháp và từ vựng (B1 Ngữ pháp 17 lượt, A2 Từ vựng 16 lượt). Thư viện đang dạy kiến thức nhiều hơn kỹ năng thi.

## 3. Cách tổ chức bài tập

### 3.1 Ba tầng cho mỗi kỹ năng

| Tầng | Tên | Điều kiện làm bài | Kết quả mong đợi |
|---|---|---|---|
| 1 | **Luyện kỹ năng** | Không tính giờ, có gợi ý, nghe lại tuỳ ý | Hiểu cách làm một kỹ năng nhỏ |
| 2 | **Luyện dạng đề** | Đúng dạng câu của đề thật, đúng số lần nghe, có chữa chi tiết | Quen dạng bài và bẫy |
| 3 | **Phần thi thu nhỏ** | Tính giờ, không gợi ý, quy về thang /25 | Biết mình đang ở đâu so với mốc |

Trong các bảng ở mục 4, cột « Bài » là tổng bài tầng 1 và 2 của dòng đó. Mỗi kỹ năng có thêm **2 bài tầng 3**.

### 3.2 Mã kỹ năng

Mỗi kỹ năng nhỏ có một mã đóng, dạng `A1-CO-4`, lưu ở `exercises.meta`, không cần thêm cột:

```json
{ "kyNang": "A1-CO-4", "tang": 2, "baiThi": "Bài 4" }
```

Câu hỏi đọc hiểu và nghe hiểu mới vẫn gắn `competence` như roadmap §1.2. Câu viết và nói gắn tiêu chí grille.

### 3.3 Nền tảng phục vụ kỹ năng

Mỗi điểm `point_gram` chỉ ra tiêu chí nó giúp nâng điểm. Ví dụ `temps_passe` phục vụ « Choix des temps et des modes » ở A2 và B1. Bài ngữ pháp sai thì học sinh được đưa về đúng bài học, không học ngữ pháp rời khỏi mục tiêu thi.

### 3.4 Mốc sẵn sàng

Đây là **mốc sản phẩm đề xuất, không phải dự đoán điểm thi**. Cần chỉnh lại khi có số liệu thật, và màn hình không được ghi « bạn sẽ đậu ».

| Mốc | Điều kiện |
|---|---|
| Xong kỹ năng nhỏ | Tầng 2 đạt từ 70% |
| Vững kỹ năng | Xong mọi kỹ năng nhỏ của kỹ năng đó |
| Sẵn sàng thi thử | Tầng 3 đạt từ 15/25, hai lần liên tiếp |

Luật thi vẫn là từ 50/100 và mỗi kỹ năng từ 5/25. Mốc 15/25 tạo khoảng dự phòng cho ngày thi, kể cả khi một kỹ năng tụt xuống.

## 4. Bản đồ kỹ năng theo trình độ

Ký hiệu tiêu chí viết và nói lấy từ `delfGrille.js` và `grillePO.js`, số trong ngoặc là điểm tối đa.

---

### A1

**Đích của trình độ:** xử lý được thông tin rất cụ thể về bản thân và đời sống hằng ngày.

#### Nghe (CO): 20 phút, 25 điểm, 5 bài (4 + 4 + 4 + 8 + 5), mỗi bài nghe 2 lần

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Phục vụ |
|---|---|---|---|---|---|
| A1-CO-1 | Nghe số, giờ, ngày, giá | Nghe rồi chọn hoặc gõ con số | qcm, fill | 2 | Bài 1–3 |
| A1-CO-2 | Hiểu tin nhắn thoại: ai, việc gì, khi nào | Tin nhắn ngắn kèm QCM chữ và hình | qcm | 2 | Bài 1, 3 |
| A1-CO-3 | Hiểu thông báo nơi công cộng | Thông báo ga tàu, siêu thị, trường học | qcm | 2 | Bài 2 |
| A1-CO-4 | Nhận ra tình huống hội thoại | Ghép 4 hội thoại với 6 hình | apparier | 2 | Bài 4 (8 đ) |
| A1-CO-5 | Nhận ra đồ vật được nhắc tới | Nghe tin nhắn, chọn Có/Không cho 5 đồ vật | vf | 2 | Bài 5 (5 đ) |

**Đạt được cho DELF:** chủ động được hai bài nhiều điểm nhất (13/25) và không mất điểm oan ở số, giờ, ngày.

#### Đọc (CE): 30 phút, 25 điểm, 4 bài (6 + 6 + 6 + 7)

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Phục vụ |
|---|---|---|---|---|---|
| A1-CE-1 | Tìm ai, ở đâu, khi nào trong tin nhắn | Đọc tin nhắn, email bạn bè | qcm, fill | 2 | Bài 1 |
| A1-CE-2 | Đọc chỉ dẫn đường | Nối chỉ dẫn với sơ đồ | qcm có hình | 2 | Bài 2 |
| A1-CE-3 | Đọc lịch, thời gian biểu | Tra bảng giờ, lịch hoạt động | qcm, tableau | 2 | Bài 3 |
| A1-CE-4 | Đọc quảng cáo, tờ thông tin | Tìm giá, địa chỉ, giờ mở cửa | qcm, fill | 2 | Bài 4 (7 đ) |
| A1-CE-5 | Chép đúng thông tin khi trả lời ngắn | Trả lời bằng đúng từ trong tài liệu | fill | 2 | Câu trả lời ngắn |

**Đạt được cho DELF:** đọc được bốn loại tài liệu của đề, biết tìm thông tin thay vì dịch từng chữ, và đủ thời gian trong 30 phút.

#### Viết (PE): 30 phút, 25 điểm, phiếu 10 ô + thư từ 40 từ

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Tiêu chí |
|---|---|---|---|---|---|
| A1-PE-1 | Điền phiếu thông tin | Phiếu khách sạn, đăng ký: 10 ô | formulaire | 2 | Điền phiếu (3) |
| A1-PE-2 | Giới thiệu và mô tả | Viết về mình, gia đình, sở thích | open + AI | 2 | Giới thiệu, mô tả (6) |
| A1-PE-3 | Viết thư ngắn đúng yêu cầu | Mời, kể hoạt động, từ 40 từ | open + AI | 2 | Bám đề (3) |
| A1-PE-4 | Viết câu đơn đúng | Chia présent, hợp giống và số | fill, conj | 1 | Hình thái cú pháp (5) |
| A1-PE-5 | Viết đúng từ, nối câu | Chính tả từ thường gặp, dùng *et, mais, alors* | fill, ordre | 1 | Từ vựng (5), Mạch lạc (3) |

**Đạt được cho DELF:** có điểm chắc từ phần phiếu và viết được thư đủ từ, đủ ý, có mở đầu và kết thúc.

#### Nói (PO): 5–7 phút, 25 điểm, 10 phút chuẩn bị cho phần 2 và 3

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Tiêu chí |
|---|---|---|---|---|---|
| A1-PO-1 | Trả lời về bản thân | Nghe câu hỏi, ghi âm câu trả lời | ghi âm + AI | 2 | Entretien (5) |
| A1-PO-2 | Đặt câu hỏi từ thẻ gợi ý | Nhìn từ khoá, nói thành câu hỏi | ghi âm + AI | 2 | Échange (4) |
| A1-PO-3 | Nhập vai mua bán | Hỏi giá, đặt hàng, trả tiền | ghi âm + AI | 2 | Dialogue (4) |
| A1-PO-4 | Dùng công thức lịch sự | Chào, xin, cảm ơn đúng tình huống | qcm, ghi âm | 1 | Lịch sự (3) |
| A1-PO-5 | Nói rõ để người nghe hiểu | Đọc theo câu mẫu, chấm phát âm | Nghe & Nói | 1 | Phát âm (3) |

**Đạt được cho DELF:** đi hết ba phần của bài nói, không im lặng, và biết tự xử lý khi nghe không rõ.

---

### A2

**Đích của trình độ:** xử lý được việc quen thuộc, kể lại được chuyện đã xảy ra.

#### Nghe (CO): 25 phút, 25 điểm, khoảng 14 tài liệu ngắn, khoảng 20 câu

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Phục vụ |
|---|---|---|---|---|---|
| A2-CO-1 | Hiểu thông báo công cộng | Thông báo giao thông, cửa hàng | qcm | 2 | Bài 1 |
| A2-CO-2 | Hiểu tin nhắn, bản tin ngắn | Lấy ý chính và một chi tiết | qcm | 2 | Bài 2 |
| A2-CO-3 | Hiểu radio, phỏng vấn ngắn | Xác định chủ đề, ý kiến đơn giản | qcm | 2 | Bài 3 |
| A2-CO-4 | Nhận diện tình huống | Ghép 4 hội thoại với 6 tình huống | apparier | 2 | Bài 4 |
| A2-CO-5 | Giữ nhịp qua nhiều tài liệu | Chuỗi tài liệu ngắn liên tiếp | qcm | 2 | Toàn bài |

**Đạt được cho DELF:** quen tốc độ chuyển tài liệu nhanh. Lỡ một câu cũng không kéo theo câu sau.

#### Đọc (CE): 30 phút, 25 điểm, khoảng 15–20 câu (đã có 12 bài cần rà lại)

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Phục vụ |
|---|---|---|---|---|---|
| A2-CE-1 | Hiểu thư, email đời sống | Mục đích người viết và yêu cầu | qcm | 3 | Tài liệu thư |
| A2-CE-2 | Đọc quảng cáo, chỉ dẫn | Tìm điều kiện, bước thực hiện | qcm | 3 | Tài liệu đời sống |
| A2-CE-3 | Tra bảng, lịch trình | So sánh lựa chọn | qcm, tableau | 2 | Tài liệu dạng bảng |
| A2-CE-4 | Hiểu bài báo ngắn | Ý chính và chi tiết | qcm | 2 | Bài báo ngắn |
| A2-CE-5 | Nhận ra cách nói khác | Đáp án đổi từ so với văn bản | qcm | 2 | Bẫy trùng từ |

**Đạt được cho DELF:** không bị lừa bởi đáp án trùng chữ và làm đủ các tài liệu trong 30 phút.

#### Viết (PE): 45 phút, 25 điểm, 2 bài, mỗi bài từ 60 từ

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Tiêu chí |
|---|---|---|---|---|---|
| A2-PE-1 | Kể một sự kiện | Kể chuyến đi, ngày đặc biệt | open + AI | 2 | Kể và mô tả (4) |
| A2-PE-2 | Nói cảm nhận | Thêm cảm xúc và đánh giá | open + AI | 1 | Cảm nhận (3) |
| A2-PE-3 | Thư mời, cảm ơn | Đúng mục đích, đúng giọng thân mật | open + AI | 2 | Bám đề (2) |
| A2-PE-4 | Thư xin lỗi, yêu cầu | Nêu lý do, đề nghị cách xử lý | open + AI | 1 | Bám đề (2) |
| A2-PE-5 | Chọn đúng thì | Phân biệt passé composé, imparfait | fill, conj | 1 | Thì và thức (3) |
| A2-PE-6 | Nối ý trong đoạn | Dùng *d'abord, ensuite, parce que* | fill, ordre | 1 | Mạch lạc (2) |

**Đạt được cho DELF:** viết được cả hai dạng bài, kể đúng thì quá khứ và có câu nêu cảm nhận.

#### Nói (PO): 6–8 phút, 25 điểm, 10 phút chuẩn bị cho phần 2 và 3

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Tiêu chí |
|---|---|---|---|---|---|
| A2-PO-1 | Trò chuyện về bản thân | Trả lời mở rộng, không chỉ một câu | ghi âm + AI | 2 | Entretien (4) |
| A2-PO-2 | Độc thoại ngắn | Chọn đề, nói liền về đời sống | ghi âm + AI | 3 | Monologue (4) |
| A2-PO-3 | Nhập vai tình huống | Đặt lịch, mua hàng, thương lượng đơn giản | ghi âm + AI | 3 | Interaction (4) |

**Đạt được cho DELF:** nói liền mạch, không học thuộc, và giữ được hội thoại khi giám khảo đổi hướng. Điểm từ vựng (5), ngữ pháp (4), phát âm (4) đến từ cùng các bài này.

---

### B1

**Đích của trình độ:** hiểu ý chính và nêu được quan điểm có lý do.

#### Nghe (CO): 25 phút, 25 điểm, các bài 5–8 câu, câu đầu thường hỏi ý tổng quát

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Phục vụ |
|---|---|---|---|---|---|
| B1-CO-1 | Bắt ý tổng quát sau lần nghe đầu | Chủ đề, người nói, mục đích | qcm | 2 | Câu đầu mỗi bài |
| B1-CO-2 | Bắt chi tiết đúng chủ thể | Ai nói gì, số liệu nào trả lời câu hỏi | qcm | 3 | Toàn bài |
| B1-CO-3 | Nhận thái độ người nói | Đồng ý, nghi ngờ, phàn nàn | qcm | 2 | Câu thái độ |
| B1-CO-4 | Hiểu radio về nghề nghiệp | Phỏng vấn, bản tin nghề nghiệp | qcm | 2 | Bài nghề nghiệp |
| B1-CO-5 | Hiểu radio chủ đề thông thường | Chương trình xã hội, đời sống | qcm | 2 | Bài chủ đề chung |
| B1-CO-6 | Ghi chú khi nghe | Ghi từ khoá trên giấy nháp, rồi chọn đáp án | fill, qcm | 1 | Mọi bài dài |

**Đạt được cho DELF:** nghe bản ghi dài vẫn giữ mạch và biết tận dụng hai lần nghe.

#### Đọc (CE): 45 phút, 25 điểm, 2–3 bài

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Phục vụ |
|---|---|---|---|---|---|
| B1-CE-1 | Tìm thông tin để giải quyết nhiệm vụ | Đối chiếu tài liệu với bảng tick | tableau, qcm | 3 | Bài 1 |
| B1-CE-2 | Nắm ý chính bài báo | Chủ đề và ý từng đoạn | qcm | 2 | Bài 2, 3 |
| B1-CE-3 | Đúng/sai có trích dẫn | Chọn và chép câu làm bằng chứng | vf, fill | 2 | Bài báo |
| B1-CE-4 | Suy luận, đoán từ theo ngữ cảnh | Câu không có từ trùng văn bản | qcm | 2 | Câu khó |
| B1-CE-5 | Theo dõi lập luận | Hiểu vai trò của *pourtant, donc, en effet* | qcm | 1 | Bài báo |

**Đạt được cho DELF:** đọc lướt có mục tiêu ở bài 1, có bằng chứng cho đáp án, và phân bổ được 45 phút.

#### Viết (PE): 45 phút, 25 điểm, 1 bài từ 160 từ, bày tỏ quan điểm

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Tiêu chí |
|---|---|---|---|---|---|
| B1-PE-1 | Phân tích đề, lập dàn ý | Xác định thể loại, người nhận, ba ý chính | open | 2 | Bám đề (2) |
| B1-PE-2 | Trình bày sự việc | Viết đoạn nêu tình huống | open + AI | 2 | Sự việc (4) |
| B1-PE-3 | Nêu ý kiến có lý do, ví dụ | Viết đoạn quan điểm | open + AI | 2 | Suy nghĩ (4) |
| B1-PE-4 | Liên kết các đoạn | Nối đoạn rời thành bài | fill, ordre, open | 2 | Mạch lạc (3) |
| B1-PE-5 | Đa dạng câu và thì | Viết lại câu đơn thành câu phức | fill, open | 1 | Cấu trúc câu (2), Thì (2) |
| B1-PE-6 | Viết đúng thể loại | Thư, email, bài diễn đàn, bài báo | open + AI | 1 | Bám đề (2) |

**Đạt được cho DELF:** có một quy trình viết 45 phút: phân tích, dàn ý, viết, soát lỗi. Bài có bố cục rõ, không dừng ở trình bày ý kiến chung chung.

#### Nói (PO): 10–15 phút, 25 điểm, 10 phút chuẩn bị cho phần 3

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Tiêu chí |
|---|---|---|---|---|---|
| B1-PO-1 | Trò chuyện có hướng dẫn | Nói về kinh nghiệm, dự định | ghi âm + AI | 2 | Entretien (4) |
| B1-PO-2 | Xử lý tình huống | Giải quyết vấn đề, thuyết phục, phản đối lịch sự | ghi âm + AI | 3 | Interaction (4) |
| B1-PO-3 | Rút ý từ tài liệu ngắn | Tìm vấn đề chính, ghi dàn ý trong 10 phút | open + AI | 2 | Quan điểm (4) |
| B1-PO-4 | Trình bày quan điểm | Nói có mở đầu, lý do, ví dụ, kết | ghi âm + AI | 3 | Quan điểm (4) |

**Đạt được cho DELF:** dùng hết 10 phút chuẩn bị hiệu quả, nói được 2–3 phút có cấu trúc, và trả lời được câu hỏi tiếp theo.

---

### B2

**Đích của trình độ:** hiểu tài liệu dài, lập luận và bảo vệ quan điểm.

Đề B2 trong app theo cấu trúc: Nghe 9 + 9 + 7, Đọc 9 + 9 + 7, câu A/B/C.

#### Nghe (CO): 30 phút, 25 điểm, 3 bài

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Phục vụ |
|---|---|---|---|---|---|
| B2-CO-1 | Ghi chú tài liệu dài | Bài nói, phóng sự: ghi cấu trúc khi nghe | fill, qcm | 3 | Bài 1, 2 (nghe 2 lần) |
| B2-CO-2 | Hiểu sau một lần nghe | Tin ngắn, phỏng vấn ngắn | qcm | 2 | Bài 3 (nghe 1 lần) |
| B2-CO-3 | Nhận hàm ý, thái độ | Mỉa mai, dè dặt, phê phán | qcm | 2 | Câu khó |
| B2-CO-4 | Theo dõi lập luận | Luận điểm, phản đề, ví dụ | qcm | 2 | Bài 1, 2 |
| B2-CO-5 | Hiểu từ theo ngữ cảnh | Thành ngữ và từ trừu tượng | qcm | 1 | Toàn bài |

**Đạt được cho DELF:** theo được tài liệu dài mà không cần hiểu từng từ, và không mất bình tĩnh ở bài chỉ nghe một lần.

#### Đọc (CE): 60 phút, 25 điểm, 3 bài

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Phục vụ |
|---|---|---|---|---|---|
| B2-CE-1 | Đọc cấu trúc bài nghị luận | Tìm luận điểm, phản đề, kết luận | qcm | 3 | Bài 1, 2 |
| B2-CE-2 | Suy luận ý ngầm | Đáp án không trùng từ văn bản | qcm | 2 | Câu khó |
| B2-CE-3 | Ghép ý kiến trên diễn đàn | So sánh nhiều quan điểm | apparier, qcm | 3 | Bài 3 |
| B2-CE-4 | Phân biệt sắc thái | Chắc chắn, giả định, nhượng bộ | qcm | 1 | Toàn bài |
| B2-CE-5 | Phân bổ 60 phút | Làm liên tiếp ba văn bản có đồng hồ | qcm | 1 | Toàn bài |

**Đạt được cho DELF:** đọc theo lập luận thay vì đọc chữ, và không hết giờ ở bài cuối.

#### Viết (PE): 60 phút, 25 điểm, 1 bài từ 250 từ, nghị luận

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Tiêu chí |
|---|---|---|---|---|---|
| B2-PE-1 | Phân tích đề, chọn thể loại | Đóng góp tranh luận, thư trang trọng, bài phê bình, báo cáo | open | 2 | Bám đề (2) |
| B2-PE-2 | Chọn đúng giọng văn | Viết lại câu theo mức trang trọng | fill, open + AI | 2 | Giọng văn (2) |
| B2-PE-3 | Lập luận có ví dụ | Luận điểm, phản biện, nhượng bộ | open + AI | 3 | Lập luận (4), Sự việc (3) |
| B2-PE-4 | Liên kết văn bản | Chuyển đoạn, liên từ nghị luận | fill, ordre, open | 2 | Mạch lạc (3) |
| B2-PE-5 | Dùng cấu trúc phức | Subjonctif, nhượng bộ, câu danh hoá | fill, open | 1 | Nhóm ngôn ngữ |

**Đạt được cho DELF:** viết bài có luận điểm và phản biện, đúng thể loại và đúng giọng trong 60 phút.

#### Nói (PO): 20 phút, 25 điểm, 30 phút chuẩn bị

| Mã | Kỹ năng | Bài tập | Dạng | Bài | Tiêu chí |
|---|---|---|---|---|---|
| B2-PO-1 | Rút vấn đề từ tài liệu gợi ý | Đọc tài liệu, nêu vấn đề | open + AI | 2 | Monologue (5) |
| B2-PO-2 | Lập dàn ý trong 30 phút | Dàn ý hai hoặc ba phần có ví dụ | open + AI | 2 | Monologue (5) |
| B2-PO-3 | Trình bày có lập luận | Nói liền, bố cục rõ | ghi âm + AI | 3 | Monologue (5) |
| B2-PO-4 | Tranh luận | Phản hồi phản biện, bảo vệ và nhấn sắc thái | ghi âm + AI | 3 | Interaction (5) |

**Đạt được cho DELF:** chuẩn bị được bài trong 30 phút và giữ quan điểm khi bị phản biện. Điểm từ vựng, ngữ pháp, phát âm (15/25) được tích luỹ qua cùng các bài này.

## 5. Số bài cần có

Mỗi ô là **bài cần có / bài đang có**.

| Trình độ | Nghe | Đọc | Viết | Nói | Tổng |
|---|---|---|---|---|---|
| A1 | 12 / 3 | 12 / 0 | 10 / 0 | 10 / 0 | 44 / 3 |
| A2 | 12 / 1 | 14 / 12 | 10 / 0 | 10 / 0 | 46 / 13 |
| B1 | 14 / 9 | 12 / 5 | 12 / 4 | 12 / 0 | 50 / 18 |
| B2 | 12 / 3 | 12 / 2 | 12 / 3 | 12 / 0 | 48 / 8 |
| **Tổng** | 50 / 16 | 50 / 19 | 44 / 7 | 44 / 0 | **188 / 42** |

Số 146 bài mới là mức trần. Bài cũ không khớp kỹ năng nào sau khi rà nhãn sẽ làm số này tăng thêm.

## 6. App cần thêm gì

| Việc | Hiện có | Cần làm |
|---|---|---|
| Nhãn bài | `exercises.meta` | Danh sách mã đóng, gắn nhãn 92 bài cũ |
| Bộ kiểm | Chưa có | `check:luyentap`: mã đúng danh sách, đủ tầng, và phải chứng minh bắt được lỗi |
| Màn Luyện tập | Chia theo kỹ năng | Bản đồ Trình độ → Kỹ năng → Kỹ năng nhỏ, mỗi bài có một dòng « Phục vụ phần thi nào » |
| Viết + AI | `cham-pe`, tự chấm, bài viết mẫu đang nối từ thi thử | Nối vào bài luyện, hoặc dựng đường nhẹ cho tầng 1–2 |
| Nói | Ghi âm, `nhan-xet-noi`, `cham-po` đang nối từ thi thử | Thêm dạng bài ghi âm ở Luyện tập, chỉ lưu theo thư mục của người học |
| Dạng câu | qcm, fill, conj, vf, tableau, ordre, open, apparier, formulaire | Kiểm tra apparier với hình và luật số lần nghe ở bài luyện |
| Tầng 3 | Đồng hồ, thang /25 ở thi thử | Chế độ thi thu nhỏ, nhưng lượt làm vẫn tách khỏi đề thi thử |
| Tiến độ | Lịch sử luyện tập | Tính « Xong kỹ năng nhỏ » từ điểm thật, chưa đủ dữ liệu thì để trống |
| Đề xuất | `deXuat.js` | Đề xuất theo kỹ năng nhỏ yếu nhất |
| Nhãn lệch | « Écriture » ở B2 | Xếp lại nhãn cho đúng `SKILLS` |

Hai điều cần giữ từ các quy tắc của dự án:

- Bài mới không chép nội dung đề thật, chỉ dùng khuôn của đề.
- Điểm phần nói vẫn theo nguyên tắc « AI đề xuất, học sinh ký ». Bài luyện nói dùng nhận xét, không đưa ra con số nếu chưa có thang chấm hợp lệ.

## 7. Lộ trình làm

| GĐ | Việc | Kết quả kiểm được |
|---|---|---|
| 1 | Chốt bảng mã, gắn nhãn 92 bài, thêm `check:luyentap` | Mọi bài đều có mã hoặc được xếp vào Nền tảng |
| 2 | Bản đồ kỹ năng ở thẻ Luyện tập, hiện dòng « Phục vụ phần thi » | Học sinh thấy ngay ô đã có và ô chưa có |
| 3 | Đường Viết + AI và Nói + ghi âm trong Luyện tập, thử bằng 1 bài mỗi loại | Chạy thật đầu cuối với tài khoản học sinh |
| 4 | Nội dung A1 (41 bài mới) | Đủ 44 bài, giáo viên đã đọc lại |
| 5 | Nội dung A2 (33 bài mới) | Đủ 46 bài, giáo viên đã đọc lại |
| 6 | Tầng 3, mốc sẵn sàng, đề xuất theo kỹ năng yếu | Tiến độ tính từ lượt làm thật |
| 7 | Nội dung B1 (32 bài mới) | Đủ 50 bài |
| 8 | Nội dung B2 (40 bài mới) | Đủ 48 bài |

Nội dung chia theo lô trong `scripts/nhap`. Mỗi lô gồm một trình độ và một kỹ năng để giáo viên đọc lại dễ hơn.

## 8. Điều chưa chắc

- **Format đề:** A1, B1, B2 trong `format-de-thi-DELF-A1-B2.xlsx` có nguồn chính thức, A2 mới từ tài liệu thứ cấp. Lần này trang France Éducation International chặn truy cập tự động nên chưa đối chiếu lại được từng trang. Cần so với sujet mẫu của FEI trước khi soạn A2. Thời lượng nói và phút từng phần lấy theo `examPaper.js` và bảng trên.
- **Đường AI cho bài luyện:** cần đọc kỹ `cham-pe` và `cham-po` ở GĐ3, vì hai hàm này đang gắn với lượt thi thử. Chi phí AI cũng tăng khi mở cho bài luyện, nên phải quyết định hạn mức lượt.
- **Mốc 70% và 15/25** là đề xuất, chưa có dữ liệu để hiệu chỉnh.
- **Giọng đọc:** audio tổng hợp có thể chưa giống đề thật về nhịp, nhiều giọng nói, tiếng nền.
- **Nội dung tiếng Pháp** do AI soạn luôn cần giáo viên đọc lại trước khi xuất bản.
- **27 hồ sơ học sinh chưa có trình độ**, nên việc ưu tiên A1–A2 dựa trên phần dữ liệu có ghi.
