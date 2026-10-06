/* Gói VIP 1 tháng (06/10, migration 118). Hàm thuần, không import gì.
 *
 * Mã, giá, số ngày PHẢI khớp hằng số trong supabase/functions/sepay-webhook.
 * Lệch giá thì học sinh chuyển đúng số trên màn hình mà webhook báo thiếu tiền.
 *
 * Nội dung chuyển khoản dùng lại paymentMemo(student, id) của bài lẻ: id gói
 * là đúng mã VIP1TH nên 6 ký tự cuối chính là mã — webhook nhận ra ở đó. */
export const VIP = { ma: "VIP1TH", gia: 99000, ngay: 30 };

export const vipConHan = (vipDen) => !!vipDen && new Date(vipDen).getTime() > Date.now();

/* Đối tượng « bài » giả để đưa vào PaymentModal — không phải bài tập thật. */
export const goiVip = (tieuDe) => ({ id: VIP.ma, price: VIP.gia, title: tieuDe, laVip: true });
