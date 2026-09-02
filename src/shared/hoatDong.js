import { supabase } from "../storageShim.js";

/* Nhật ký hoạt động theo ngày → chuỗi ngày học (migration 061).
 *
 * ══ NGÀY LÀ NGÀY CỦA NGƯỜI DÙNG, KHÔNG PHẢI CỦA MÁY CHỦ ══
 *
 * PostgREST chạy ở UTC. Để máy chủ tự lấy `current_date` thì học sinh học lúc
 * 8 giờ tối ở Hà Nội (13:00 UTC — vẫn cùng ngày) thì không sao, nhưng lúc 7
 * giờ sáng (00:00 UTC hôm đó) lại bị ghi sang ngày hôm trước. Chuỗi đứt vì
 * một chuyện chẳng liên quan gì tới việc học.
 *
 * Nên ngày được tính ở TRÌNH DUYỆT và gửi xuống. Máy chủ vẫn chặn khoảng ±1
 * ngày để không ai tự đắp một chuỗi dài tuỳ thích — client là thứ người dùng
 * sửa được. */

/* `toISOString()` chuyển sang UTC trước khi cắt chuỗi, nên nó trả về ngày SAI
   cho đúng những giờ hay lệch nhất. Phải dựng tay từ giờ địa phương. */
export function ngayHomNay(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* Ghi một mục hoạt động. Gọi khi học sinh LÀM XONG một việc có thật.
 *
 * Trả về `{ ok }` và KHÔNG ném lỗi: đây là việc phụ. Ghi hỏng thì chuỗi thiếu
 * một ngày — khó chịu, nhưng không được phép làm đổ cái việc chính mà học sinh
 * vừa hoàn thành. Nuốt lỗi ở đây là có chủ đích, ngược hẳn với đường ghi bài
 * làm, nơi nuốt lỗi là tội nặng.
 *
 * `soPhut` mặc định 0 và hiện KHÔNG có chỗ gọi nào truyền vào. Cố ý: hệ thống
 * chưa đo được thời gian học thật, và ghi một con số ước lượng vào cột
 * `minutes` là bịa dữ liệu (quy tắc 1). Cột để sẵn cho lúc đo được. */
export async function ghiHoatDong({ soMuc = 1, soPhut = 0 } = {}) {
  try {
    const { error } = await supabase.rpc("ghi_hoat_dong", {
      p_ngay: ngayHomNay(), p_so_muc: soMuc, p_so_phut: soPhut,
    });
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}

/* Chuỗi ngày học. Trả về `null` khi KHÔNG ĐỌC ĐƯỢC, và `0` khi đọc được mà
   chuỗi bằng không.
 *
 * Hai thứ đó phải khác nhau trên màn hình: "chưa học ngày nào" là một sự thật
 * về người dùng, còn "không hỏi được máy chủ" là một sự cố. Gộp cả hai thành
 * số 0 là nói với người vừa học ba ngày liền rằng họ chưa học buổi nào. */
export async function docChuoiNgay() {
  try {
    const { data, error } = await supabase.rpc("chuoi_ngay_hoc", { p_ngay: ngayHomNay() });
    if (error) return null;
    return Number(data) || 0;
  } catch {
    return null;
  }
}
