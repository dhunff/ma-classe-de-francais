import { supabase } from "../storageShim.js";
import { tr } from "./i18n.jsx";
import { loiTranVip } from "./loiTranVip.js";

/* Vỏ mỏng quanh Edge Function `cham-tcf` (14/11): AI chấm Viết / Nói TCF theo thang 0..20.
   Mọi phép kiểm thật ở máy chủ; ở đây chỉ dịch mã lỗi thành câu người đọc được (ba thứ tiếng).
   Câu chữ là HÀM để tr() chạy lúc gọi, không đứng yên ở ngôn ngữ lúc nạp file. */
const cau = (ma, than) => ({
  CHUA_DANG_NHAP: tr("Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử lại.", "Session expirée. Reconnectez-vous puis réessayez.", "Session expired. Sign in again and retry."),
  CHUA_CAU_HINH_KHOA: tr("Máy chủ chưa bật AI chấm. Đây là việc của người quản trị, thử lại cũng vậy.", "La correction IA n'est pas activée sur le serveur.", "AI grading isn't enabled on the server."),
  HET_LUOT: tr(`Bạn đã dùng hết ${than?.han_muc ?? 6} lượt AI chấm TCF trong 24 giờ. Thử lại sau; gói VIP tới 100 lượt AI/ngày.`, `Vous avez utilisé vos ${than?.han_muc ?? 6} corrections IA TCF sur 24 h.`, `You've used your ${than?.han_muc ?? 6} TCF AI gradings for 24 h.`),
  HET_LUOT_VIP: loiTranVip(),
  CHUA_CO_BAN_GHI: tr("Chưa có bản ghi âm nào cho phần nói này.", "Aucun enregistrement pour cette épreuve orale.", "No recording for this speaking part."),
  KHONG_NGHE_RO: tr("Bản ghi gần như không có tiếng nói nên chưa chấm được.", "L'enregistrement est presque silencieux.", "The recording is almost silent."),
  DINH_DANG_KHONG_HO_TRO: tr("Định dạng bản ghi này chưa chấm được (thử ghi lại bằng Chrome hoặc Edge).", "Format d'enregistrement non pris en charge.", "Recording format not supported."),
  BAN_GHI_QUA_LON: tr("Bản ghi quá dài để chấm (tối đa 25 MB).", "Enregistrement trop volumineux (25 Mo max).", "Recording too large (25 MB max)."),
  AI_TRA_VE_SAI_KHUON: tr("Máy chấm trả về kết quả không khớp thang điểm, nên bị bỏ. Mở lại trang để thử lại.", "Résultat de l'IA non conforme à l'échelle, ignoré. Réessayez.", "The AI result didn't fit the scale and was discarded. Retry."),
  AI_TRA_LOI_LOI: tr("Máy chấm đang lỗi. Mở lại trang sau ít phút để thử lại.", "Le correcteur IA a échoué. Réessayez dans quelques minutes.", "The AI grader failed. Retry in a few minutes."),
}[ma]);

/** Chấm (hoặc lấy lại phiếu đã chấm) cho một lượt làm phần PE/PO của đề TCF. */
export async function chamTcf(attemptId) {
  if (!attemptId) return { ok: false, ma: "THIEU_THAM_SO", thongBao: tr("Phần này chưa được lưu nên chưa chấm được.", "Cette épreuve n'est pas enregistrée.", "This part isn't saved.") };
  const { data, error } = await supabase.functions.invoke("cham-tcf", { body: { attemptId } });
  if (error) {
    let than = null;
    try { than = await error.context?.json?.(); } catch { /* không đọc được thì thôi */ }
    const ma = than?.ma ?? "KHONG_RO";
    return { ok: false, ma, thongBao: cau(ma, than) ?? tr("Chưa chấm được lúc này. Mở lại trang sau ít phút.", "Correction impossible pour le moment.", "Can't grade right now.") };
  }
  if (!data?.ok) return { ok: false, ma: data?.ma ?? "KHONG_RO", thongBao: cau(data?.ma) ?? tr("Chưa chấm được.", "Correction impossible.", "Couldn't grade.") };
  return { ok: true, ketQua: data.ket_qua, diem: data.diem, cap: data.cap, nclc: data.nclc, code: data.code, level: data.level };
}
