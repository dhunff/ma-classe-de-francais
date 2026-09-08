import { supabase } from "../storageShim.js";

/* Form đăng ký tư vấn (migration 077–080).
 *
 * ══ NGƯỜI GỬI CHƯA ĐĂNG NHẬP ══
 *
 * Đây là lời gọi ghi DUY NHẤT trong dự án mà người gọi không có `auth.uid()`.
 * Nó đi qua RPC `gui_lien_he` chứ không insert thẳng: `anon` không có quyền
 * chèn vào `leads`, và mọi phép kiểm — dạng email, độ dài, chặn lũ — nằm
 * trong hàm, nơi người dùng không sửa được.
 *
 * `anon` cũng KHÔNG đọc lại được bảng đó (079). Nên sau khi gửi, giao diện
 * không có cách nào xác nhận bằng cách đọc lại — nó chỉ biết máy chủ đã nhận
 * hay chưa. Ghi ra đây để lần sau không ai đi tìm một hàm `docLienHe`. */

export const VAI = [
  ["hoc_sinh", "Học sinh / sinh viên"],
  ["giao_vien", "Giáo viên"],
  ["phu_huynh", "Phụ huynh"],
  ["khac", "Khác"],
];

export const MUC_TIEU = [
  ["chua_biet", "Chưa rõ"],
  ["A1", "A1"], ["A2", "A2"], ["B1", "B1"], ["B2", "B2"],
  ["C1", "C1"], ["C2", "C2"],
];

export async function guiLienHe({ hoTen, email, dienThoai, vai, mucTieu, noiDung, nguon }) {
  const { error } = await supabase.rpc("gui_lien_he", {
    p_ho_ten: hoTen,
    p_email: email,
    p_dien_thoai: dienThoai || null,
    p_vai: vai || "hoc_sinh",
    p_muc_tieu: mucTieu || null,
    p_noi_dung: noiDung || null,
    p_nguon: nguon || "gioi-thieu",
  });
  if (error) {
    /* "Gửi quá nhiều" KHÔNG phải sự cố kỹ thuật, và tuyệt đối không được nói
       "thử lại sau" — thử lại sẽ hỏng y hệt cho tới sáng mai. */
    if (/GUI_QUA_NHIEU/.test(error.message || "")) return { ok: false, loi: "qua_nhieu" };
    if (error.code === "22023") return { ok: false, loi: "thieu_hoac_sai" };
    return { ok: false, loi: "mang", chiTiet: error.message };
  }
  return { ok: true };
}

/* Đọc danh sách liên hệ — CHỈ giáo viên.
 *
 * Không có RPC riêng: policy `leads_giao_vien_doc` đã làm đúng việc, và
 * `anon` không còn quyền đọc ở mức bảng (079). Thêm một hàm security definer
 * ở đây chỉ là một cửa nữa phải canh.
 *
 * Trả `null` khi KHÔNG đọc được, `[]` khi đọc được mà chưa ai gửi. Hai thứ đó
 * cần hai câu khác nhau: "chưa có ai đăng ký" là một sự thật, "không đọc được"
 * là việc phải xử lý. */
/* Máy chủ có coi phiên này là giáo viên không.
 *
 * Cần một câu hỏi RIÊNG vì dữ liệu KHÔNG trả lời được nó: người không phải
 * giáo viên vẫn có quyền SELECT mức bảng trên `leads`, RLS lọc sạch mọi dòng
 * và trả về mảng RỖNG không kèm lỗi. "Giáo viên, chưa ai gửi" và "không phải
 * giáo viên" hiện ra y hệt nhau.
 *
 * Tôi đã dùng chính màn hình đó làm bằng chứng rằng một phiên là giáo viên.
 * Nó không chứng minh được điều đó, và tôi đi sai một lượt vì tin vào nó. */
export async function laGiaoVien() {
  const { data, error } = await supabase.rpc("la_giao_vien");
  return error ? null : !!data;      // null = không hỏi được
}

export async function docLienHe(gioiHan = 200) {
  const { data, error } = await supabase
    .from("leads")
    .select("id, ho_ten, email, dien_thoai, vai, muc_tieu, noi_dung, nguon, created_at")
    .order("created_at", { ascending: false })
    .limit(gioiHan);
  return error ? null : (data ?? []);
}
