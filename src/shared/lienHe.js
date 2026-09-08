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
