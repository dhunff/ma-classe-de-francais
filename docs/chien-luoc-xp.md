# Chiến lược XP · đổi bài trả phí (06/10/2026)

## Mục tiêu

1. **Gắn bó:** cho người học một lý do quay lại MỖI NGÀY (điểm danh, chuỗi ngày, trần ngày).
2. **Doanh thu:** XP chỉ đủ để người **chăm** mở khoảng **một bài trả phí mỗi tuần**.
   Muốn nhiều hơn hoặc nhanh hơn thì trả tiền. XP là « mẫu thử » của nội dung trả phí,
   không phải đường thay thế cho thanh toán.

## Kiếm XP

| Nguồn | XP | Tính vào trần |
|---|---|---|
| Nộp một bài **lần đầu** | 10 + điểm đạt được | có |
| Qua một màn Lộ trình lần đầu | 5 | có |
| Thử thách cuối chủ đề | 15 | có |
| Điểm danh (bài nộp đầu tiên trong ngày) | 5 | có |
| Chuỗi 7 / 30 / 100 ngày liên tiếp | 30 / 100 / 300 | **không** |

**Trần:** 60 XP mỗi ngày, 300 XP mỗi tuần (giờ Việt Nam, tuần bắt đầu thứ Hai).
Phần vượt trần không được cộng và không đòi lại được sau. Lần đầu làm một bài đã
« dùng » rồi. Nhờ vậy không cày được bằng cách làm thật nhiều bài trong một buổi.

Vì sao 60/300: một buổi học thật (2–3 bài mới) cho khoảng 50–60 XP, nên người học
đều đặn chạm trần ngày mà không thấy bị « phạt ». Trần tuần 300 < 7 × 60, để học
5 ngày/tuần cũng gần đạt tối đa: không bắt học 7/7.

## Giá đổi

**Giá XP = giá tiền ÷ 100**, làm tròn tới chục, tối thiểu 100, tối đa 600 XP.

| Giá tiền | Giá XP | Thời gian kiếm (học đều, chạm trần) |
|---|---|---|
| 10.000 đ | 100 XP | 2 ngày |
| 20.000 đ | 200 XP | 4 ngày |
| 30.000 đ | 300 XP | 5 ngày (≈ 1 tuần) |
| 50.000 đ | 500 XP | gần 2 tuần |
| ≥ 60.000 đ | 600 XP | 2 tuần |

Giáo viên vẫn đặt riêng `xpCost` trong Builder được (≥ 50 XP; dưới 50 coi là số
thử và bị bỏ qua). Muốn một bài **chỉ bán bằng tiền**: hiện chưa có công tắc
riêng, xem « Việc tiếp theo ».

## Chỗ XP chuyển thành doanh thu

- Hộp « Đổi XP » khi THIẾU XP hiện: thanh tiến độ, « còn thiếu N XP, ít nhất K
  ngày học », cách kiếm XP, và nút **Mua ngay** dẫn thẳng tới thanh toán.
- Nhãn XP trên thanh trên có vạch « hôm nay đã kiếm bao nhiêu / 60 ». Đầy thì
  rê chuột thấy « mai quay lại nhé », kéo người học trở lại hôm sau.

## Cài đặt kỹ thuật

- Migration 117: mọi lần cộng đi qua MỘT hàm `cong_xp` (trigger nộp bài, lộ
  trình, điểm danh), nên không có đường cộng nào lách được trần. Sổ cái
  `xp_so_cai` ghi cả phần bị cắt (`bi_cat`).
- `gia_xp(meta)` (SQL) và `giaXp(ex)` (`src/shared/premium.js`) phải giữ CÙNG
  công thức. Máy chủ là bên trừ XP thật; số ở client chỉ để hiển thị.
- `get_xp_tong_quan()`: số dư, đã nhận hôm nay/tuần này, trần, chuỗi.

## Số liệu nên theo dõi (sau 2–4 tuần)

1. **Tỷ lệ chạm trần ngày**: nếu > 50% người hoạt động chạm trần mỗi ngày thì
   trần hơi thấp (hoặc bài quá ngắn). Nếu < 10% thì trần không có tác dụng.
2. **Số lượt đổi XP / tuần** so với **số lượt mua**. Mục tiêu: đổi XP không lấn
   át mua. Nếu đổi > 3 × mua, nâng giá XP (÷ 80 thay vì ÷ 100).
3. **Người học quay lại ngày hôm sau** sau khi chạm trần: đo tác dụng của « mai
   quay lại ».
4. Số người giữ chuỗi 7 ngày.

## Việc tiếp theo có thể làm

- Công tắc « chỉ bán bằng tiền » cho bài mới / bài quan trọng (đề thi thử đầy đủ).
- Gói tháng (mở toàn bộ) bán qua SePay, đặt giá thấp hơn tổng giá lẻ để người
  học chăm chuyển sang trả theo tháng.
- « Tuần nhân đôi XP » dịp ra mắt nội dung mới: tăng trần tạm thời, có hạn.
