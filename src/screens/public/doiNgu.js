/* Đội ngũ chuyên môn hiện lên trang giới thiệu.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * DANH SÁCH NÀY BẮT ĐẦU RỖNG, VÀ ĐÓ LÀ CÓ CHỦ ĐÍCH
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Bản mô tả đề nghị điền sẵn dữ liệu mẫu — « Giảng viên · DALF C2 », « 5 năm
 * kinh nghiệm » — kèm ảnh từ `i.pravatar.cc`, rồi thay bằng người thật sau.
 *
 * Không làm vậy, vì hai lý do khác nhau và cả hai đều nặng:
 *
 * 1. BẰNG CẤP BỊA LÀ QUẢNG CÁO SAI SỰ THẬT. Người đọc trang này đang quyết
 *    định có trả tiền cho một khoá luyện thi hay không, và họ quyết định dựa
 *    trên việc ai sẽ dạy họ. Một dòng "DALF C2" viết tạm không phải chỗ giữ
 *    chỗ — nó là một lời khẳng định về trình độ của một con người, và trong
 *    vài phút nữa nó có thể đang chạy trên production.
 *
 * 2. `i.pravatar.cc` PHỤC VỤ ẢNH CHÂN DUNG CỦA NGƯỜI THẬT. Đặt chúng lên trang
 *    và gắn nhãn "giáo viên tiếng Pháp của FRACILE" là dùng khuôn mặt của
 *    những người không hề biết chuyện đó. Khác hẳn một hình hộp xám.
 *
 * Rỗng thì khối đội ngũ KHÔNG hiện ra. Không có trạng thái nào để lỡ tay đẩy
 * lên. Điền vào đây là nó xuất hiện — không phải sửa mã, không phải nhớ xoá gì.
 *
 * Muốn XEM THỬ bố cục trước khi có người thật: mở /preview.html, mục
 * « Đội ngũ chuyên môn ». Dữ liệu giả sống ở đó, đúng quy tắc 1 của dự án.
 *
 * ══ HÌNH DẠNG MỘT DÒNG ══
 *
 *   {
 *     ten:      "Nguyễn Văn A",           // bắt buộc
 *     chucDanh: "Giáo viên · DALF C1",    // bắt buộc — chỉ ghi bằng cấp CÓ THẬT
 *     gioiThieu:"Bảy năm luyện thi DELF B1–B2, chuyên phần nói.",
 *     anh:      "https://…/a.jpg",        // tuỳ chọn; thiếu thì hiện chữ cái đầu
 *   }
 *
 * `anh` nên là ảnh tự chụp, đặt trong Supabase Storage hoặc `public/`. Ảnh lấy
 * từ dịch vụ ngoài có thể đổi hoặc biến mất, và khi đó trang chủ vỡ mặt.
 */

export const DOI_NGU = [];
