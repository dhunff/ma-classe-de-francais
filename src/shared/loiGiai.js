import { supabase } from "../storageShim.js";

/* Lời giải thích cho câu hỏi — lớp truy cập (migration 069).
 *
 * Vì sao có màn hình này: 166/373 câu trong thư viện chưa có `explanation`,
 * gần hết là bài đọc–nghe hiểu. Trước 02/09 điều đó chỉ làm trang kết quả
 * nghèo đi; từ khi có thẻ ghi nhớ nó thành chặn đường, vì thẻ sinh từ câu SAI
 * và chỗ người ta sai gần như không giao với chỗ có lời giải. */

/* Danh sách câu cần viết, xếp theo SỐ NGƯỜI từng sai giảm dần.
 *
 * Trả `null` khi không đọc được, `[]` khi đọc được mà không còn câu nào. Hai
 * thứ đó cần hai câu khác nhau trên màn hình: "viết xong hết rồi" là tin vui,
 * "không gọi được máy chủ" là việc phải xử lý. */
export async function docCauCanLoiGiai(gioiHan = 40) {
  const { data, error } = await supabase.rpc("cau_can_loi_giai", { p_gioi_han: gioiHan });
  if (error) return null;
  return data ?? [];
}

/* Lưu lời giải. Trả về SỐ THẺ vừa được làm mới cùng lúc.
 *
 * `cards.back` là bản chép của `explanation` tại lúc thẻ được sinh, và thẻ
 * không bao giờ sinh lại (ràng buộc unique). Nên nếu hàm SQL không đè lên
 * những thẻ còn mang câu dự phòng thì giáo viên viết xong, thấy "đã lưu", và
 * phía học sinh không có gì đổi — mãi mãi. Con số trả về ở đây tồn tại để nói
 * ra điều đó đã xảy ra thật. */
export async function luuLoiGiai(questionId, loiGiai) {
  const { data, error } = await supabase.rpc("luu_loi_giai", {
    p_question_id: questionId, p_loi_giai: loiGiai,
  });
  if (error) {
    /* 42501 = hàm từ chối vì người gọi không phải giáo viên. Không phải sự cố
       kỹ thuật — là câu trả lời đúng cho một yêu cầu sai, nên phải nói khác. */
    if (error.code === "42501") return { ok: false, loi: "khong_phai_giao_vien" };
    if (error.code === "22023") return { ok: false, loi: "trong" };
    return { ok: false, loi: "mang", chiTiet: error.message };
  }
  return { ok: true, soTheLamMoi: Number(data) || 0 };
}
