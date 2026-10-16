/* Thứ tự lần đầu vào app (16/10, theo chủ dự án): hộp « Hoàn thiện hồ sơ » hiện
 * TRƯỚC, phần hướng dẫn (TourGioiThieu) chỉ chạy sau khi hộp đóng, không đè nhau.
 *
 * HoanThienHoSo báo « đang xét » ngay khi gắn (đọc hồ sơ là việc bất đồng bộ), rồi
 * « mở » / « đóng ». Tour hỏi hoSoDangCho() trước khi chạy và nghe SU_KIEN để xét
 * lại. Màn nào không gắn HoanThienHoSo (giáo viên) thì cờ mặc định là không chờ. */
export const SU_KIEN_HO_SO = "fracile-ho-so";
let dangXet = false;
let dangMo = false;

const bao = () => { try { window.dispatchEvent(new Event(SU_KIEN_HO_SO)); } catch { /* bỏ qua */ } };

export function hoSoBatDauXet() { dangXet = true; bao(); }
export function hoSoKetQua(mo) { dangXet = false; dangMo = !!mo; bao(); }
export function hoSoDangCho() { return dangXet || dangMo; }
