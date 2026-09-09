/* Bốn kỹ năng DELF, dùng cho dải tab dọc ở thư viện bộ thẻ.
 *
 * File RIÊNG và KHÔNG import gì cả — đó là cả mục đích của nó. `boThe.js`
 * import `storageShim`, vốn mở kết nối Supabase thật ngay lúc nạp module, nên
 * bất cứ màn nào chạm vào nó đều không vào được /preview.html (xem đầu
 * preview.jsx: đã có lần một trang xem thử gửi lệnh ghi thật lên production).
 *
 * Tách hằng số ra đây thì `ThuVienBoThe.jsx` sạch phụ thuộc và xem thử được —
 * cùng lý do `ChonDoanVan.jsx` được tách khỏi `DatNeo.jsx`.
 *
 * Mã trùng với `exam_sections.code` và với CHECK của `the_bo.ky_nang`
 * (migration 085). Thêm mã mới thì phải sửa cả ràng buộc SQL đó.
 */
export const KY_NANG = [
  { ma: "CO", ten: "Nghe" },
  { ma: "CE", ten: "Đọc" },
  { ma: "PE", ten: "Viết" },
  { ma: "PO", ten: "Nói" },
];
