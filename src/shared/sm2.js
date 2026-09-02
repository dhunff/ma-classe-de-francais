/* SM-2 — lịch ôn thẻ ghi nhớ. THUẦN, không import gì.
 *
 * Cùng lý do với identityRules.js và exerciseMap.js: file nào import
 * `storageShim.js` là file `node` không nạp được, nên phần dễ sai nhất trở
 * thành phần duy nhất không có bộ kiểm nào canh. Ở đây phần dễ sai chính là
 * mấy phép tính dưới đây.
 *
 * ══ VÌ SAO SM-2, KHÔNG SÁNG TẠO THUẬT TOÁN MỚI ══
 *
 * roadmap-delf.md §1.3 đã chốt: nó cũ, đơn giản, và đủ tốt. Một thuật toán tự
 * nghĩ ra sẽ mất nhiều tháng mới lộ ra là sai, và cái sai đó tiêu bằng thời
 * gian học của người thật.
 *
 * ══ VÌ SAO PHÉP TÍNH CHẠY Ở TRÌNH DUYỆT ══
 *
 * Đặt ở SQL thì máy chủ là nguồn duy nhất, đúng nếp dự án. Nhưng khi đó thuật
 * toán chỉ chạy được trên production, không bộ kiểm nào đọc nổi, và một phép
 * chia sai sẽ sống rất lâu.
 *
 * Đặt ở CẢ HAI thì có hai bản phải khớp nhau — dự án đã có đúng một chỗ như
 * thế (bộ chấm client/server) và phải nuôi `check:parity` để canh. Thêm một
 * cặp nữa là thêm một chỗ trôi.
 *
 * Nên: MỘT bản, ở đây, có 60+ ca kiểm. Client gửi kết quả xuống, và database
 * chặn giá trị vô lý bằng ràng buộc CHECK (migration 063). Đánh đổi: người
 * dùng sửa được lịch ôn của CHÍNH MÌNH. Không ai có động cơ làm thế, và nếu
 * làm thì người chịu là họ — khác hẳn điểm thi, nơi con số đi tới người khác.
 */

/* Bốn nút, ánh xạ sang thang 0–5 của SM-2.
 *
 * Không hiện thang sáu mức cho người dùng: "3 hay 4?" là câu hỏi không ai trả
 * lời nhất quán được, và một thang đo không nhất quán thì đo sai. Bốn nút mô
 * tả CẢM GIÁC, và mã chuyển sang số. */
export const MUC = {
  lai:  { q: 1, nhan: "Quên rồi" },
  kho:  { q: 3, nhan: "Khó" },
  tot:  { q: 4, nhan: "Tốt" },
  de:   { q: 5, nhan: "Dễ" },
};

export const NGUONG_NHO = 3;      // q < 3 là quên — SM-2 gốc dùng đúng mốc này
export const EASE_SAN = 1.3;
export const EASE_TRAN = 3.0;
export const QUANG_TOI_DA = 365;

const kep = (v, min, max) => Math.min(max, Math.max(min, v));

/* Ngày địa phương + n ngày, trả về "YYYY-MM-DD".
 *
 * KHÔNG dùng toISOString(): nó đổi sang UTC trước khi cắt chuỗi, nên trả về
 * ngày sai đúng vào những giờ hay lệch nhất. Cùng cái bẫy đã ghi ở
 * hoatDong.js — và ở đây nó tệ hơn, vì lệch một ngày nghĩa là thẻ đến hạn sai
 * ngày và người học không có cách nào biết. */
export function ngayCong(soNgay, moc = new Date()) {
  const d = new Date(moc.getFullYear(), moc.getMonth(), moc.getDate() + soNgay);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* Một lần ôn. Nhận trạng thái cũ + chất lượng nhớ, trả trạng thái mới.
 *
 * HÀM THUẦN: không đọc đồng hồ, không chạm mạng. `moc` truyền vào được để bộ
 * kiểm cố định được ngày — một hàm tự gọi `new Date()` bên trong thì ca kiểm
 * phải đoán hôm nay là ngày nào, và nó sẽ đỏ vào lúc nửa đêm. */
export function onLai(cu, q, moc = new Date()) {
  const ease0 = Number.isFinite(cu?.ease) ? cu.ease : 2.5;
  const reps0 = Math.max(0, Math.trunc(cu?.reps ?? 0));
  const lapses0 = Math.max(0, Math.trunc(cu?.lapses ?? 0));

  /* Công thức ease của SM-2, nguyên văn:
       EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
     Với q=4 thì số hạng bằng 0 — "Tốt" không đổi ease, đúng như thiết kế. */
  const d = 5 - q;
  const ease = kep(ease0 + (0.1 - d * (0.08 + d * 0.02)), EASE_SAN, EASE_TRAN);

  if (q < NGUONG_NHO) {
    /* Quên thì về đầu. KHÔNG giữ lại quãng cũ: cả điểm mạnh của SM-2 nằm ở
       chỗ nó thừa nhận rằng một thẻ quên rồi thì phải học lại từ đầu.

       `ease` VẪN giảm và VẪN được giữ — đó là trí nhớ dài hạn của thuật toán
       về việc thẻ này khó. Đặt lại ease về 2.5 mỗi lần quên thì một thẻ khó
       mãi mãi được xếp lịch như một thẻ dễ. */
    return { reps: 0, lapses: lapses0 + 1, ease, interval_days: 1, due_at: ngayCong(1, moc) };
  }

  const reps = reps0 + 1;
  /* Hai quãng đầu là HẰNG SỐ, không nhân ease. Đây là chỗ hay bị viết sai
     thành `interval * ease` ngay từ lần đầu — khi đó lần ôn đầu tiên nhảy
     thẳng sang 2–3 ngày và thẻ mới không bao giờ được củng cố. */
  const quang = reps === 1 ? 1
    : reps === 2 ? 6
    : Math.round((cu?.interval_days ?? 1) * ease);

  const interval_days = kep(Math.max(1, quang), 1, QUANG_TOI_DA);
  return { reps, lapses: lapses0, ease, interval_days, due_at: ngayCong(interval_days, moc) };
}

/* Thẻ đến hạn: due_at <= hôm nay. Sắp xếp để buổi ôn có ích nhất:
   thẻ QUÁ HẠN LÂU NHẤT trước, rồi thẻ khó (ease thấp) trước.

   Không xáo ngẫu nhiên: người học bỏ dở giữa chừng là chuyện thường, nên thứ
   tự phải đặt thứ cần nhất lên đầu chứ không rải đều. */
export function xepLichOn(ds, homNay = ngayCong(0)) {
  return (ds ?? [])
    .filter((r) => String(r?.due_at ?? "") <= homNay)
    .sort((a, b) =>
      String(a.due_at).localeCompare(String(b.due_at)) || (a.ease ?? 2.5) - (b.ease ?? 2.5));
}
