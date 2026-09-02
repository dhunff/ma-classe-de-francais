import { supabase } from "../storageShim.js";

/* Có phiên đăng nhập THẬT ở máy chủ không?
 *
 * ══ VÌ SAO CẦN HÀM NÀY ══
 *
 * App có HAI đường đăng nhập. `supabase.auth` là đường thật; `mcf-session`
 * trong localStorage là đường cũ, chỉ chứa tên và vai, không có token nào.
 * App.jsx hỏi Supabase trước rồi mới rơi về localStorage — nên một người có
 * `mcf-session` mà không có phiên Supabase vẫn đi qua được `RequireRole`, vẫn
 * thấy thanh bên, vẫn vào được phòng thi.
 *
 * Nhưng mọi lời gọi tới máy chủ của người đó là lời gọi VÔ DANH:
 *
 *   · Edge Function `grade` chấm xong, trả điểm đúng, `attemptId: null`,
 *     không ghi một dòng nào.
 *   · Tải bản ghi âm lên kho riêng bị RLS từ chối.
 *
 * Đã đo được ngày 01/09: một buổi thi đủ ba phần cộng một lần ghi âm, và
 * database không thêm một dòng nào — `attempts` đứng yên ở 41, kho bản ghi
 * rỗng. Giao diện thì cư xử như mọi thứ bình thường.
 *
 * ══ GIAO DIỆN KHÔNG ĐƯỢC MỜI NGƯỜI TA LÀM VIỆC SẼ MẤT ══
 *
 * Đây mới là điều đáng sửa. Một buổi thi thử là 115 phút; mời ai đó bỏ ra 115
 * phút rồi mới nói "phiên hết hạn, không lưu được gì" là hỏng ở chỗ tệ nhất.
 * Cửa phải khoá TRƯỚC, không phải báo lỗi SAU.
 *
 * Hàm trả về `null` khi chưa biết — chỗ gọi phải phân biệt "chưa hỏi xong" với
 * "hỏi rồi, không có". Coi hai thứ đó như nhau thì màn hình chớp một cảnh báo
 * sai ngay lần render đầu. */
export async function coPhienMayChu() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return false;
    return !!data?.session?.user;
  } catch {
    /* Mạng hỏng cũng là "không có phiên dùng được lúc này". Đoán rộng rãi ở
       đây thì học sinh bắt đầu thi và mất bài — đoán chặt thì tệ nhất là họ
       phải đăng nhập lại một lần thừa. */
    return false;
  }
}
