/* Bài trả phí — hàm thuần, không import gì, nên `check:exercises` chạy được
 * thẳng bằng node.
 *
 * ══ LỖI ĐÃ SỬA Ở ĐÂY ══
 *
 * Bản cũ:
 *     isPremium = (ex) => !!ex.isPremium && Number(ex.price) > 0;
 *
 * Builder cho phép tick « bài trả phí » rồi để trống ô giá. Khi đó
 * `Number("") === 0`, nên hàm trên trả về FALSE và bài hiện ra **miễn phí** với
 * học sinh — đúng lỗi giáo viên báo: "đặt trả phí mà bên học sinh thấy free".
 *
 * Điều tệ nhất không phải là nó sai, mà là nó sai theo chiều MỞ KHOÁ. Một
 * thiếu sót khi soạn bài (quên gõ giá) biến thành nội dung phát miễn phí, âm
 * thầm, không có gì báo cho ai.
 *
 * Nay cờ `isPremium` MỘT MÌNH quyết định khoá. Giá chỉ dùng để hiển thị và để
 * dựng mã thanh toán. Thiếu giá là lỗi cấu hình — bài vẫn khoá, và giao diện
 * nói rõ là chưa có giá thay vì im lặng mở cửa.
 */

/* Bài này có khoá không. KHÔNG phụ thuộc giá — xem chú thích trên. */
export const isPremium = (ex) => !!ex?.isPremium;

/* Có bán được không: đã đặt giá hợp lệ chưa.
 * Tách khỏi `isPremium` vì hai câu hỏi khác nhau — "có khoá không" và "trả
 * tiền được chưa" — và gộp chúng lại chính là lỗi vừa sửa. */
export const hasPrice = (ex) => Number(ex?.price) > 0;

/* Cấu hình lỗi: đã khoá nhưng chưa có giá. Học sinh không mua được, giáo viên
 * cần biết. Giao diện dùng hàm này để hiện cảnh báo đúng chỗ. */
export const premiumThieuGia = (ex) => isPremium(ex) && !hasPrice(ex);

/* Giá đổi XP của một bài trả phí (06/10). PHẢI khớp hàm SQL public.gia_xp
   (migration 117) — máy chủ mới là bên trừ XP; số ở đây chỉ để hiển thị.
   Giáo viên đặt xpCost ≥ 50 thì dùng số đó; dưới 50 coi là số thử. Không có
   thì theo giá tiền: giá ÷ 100, làm tròn chục, kẹp 100–600. */
export const TRAN_XP = { ngay: 60, tuan: 300 };
export const giaXp = (ex) => {
  const dat = Number(ex?.xpCost);
  if (dat >= 50) return dat;
  const tien = Number(ex?.price);
  if (tien > 0) return Math.max(100, Math.min(600, Math.round(tien / 1000) * 10));
  return null;
};
