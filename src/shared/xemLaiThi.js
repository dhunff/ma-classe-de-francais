import { supabase } from "../storageShim.js";
import { tr } from "./i18n.jsx";
import { loiTranVip } from "./loiTranVip.js";

/* « Xem lại bài thi » (14/11): đọc câu hỏi + đáp án + bài đã nộp qua rpc xem_lai_bai_thi (migration 207,
   chỉ lượt ĐÃ NỘP của chính mình), và xin AI giải thích một câu qua Edge Function giai-thich-cau. */
export async function docBaiThi(attemptIds) {
  const ids = [...new Set((attemptIds ?? []).filter(Boolean))];
  if (!ids.length) return { ok: false, thongBao: tr("Chưa có phần nào được lưu để xem lại.", "Aucune épreuve enregistrée à revoir.", "Nothing saved to review yet.") };
  const { data, error } = await supabase.rpc("xem_lai_bai_thi", { p_attempts: ids });
  if (error) return { ok: false, thongBao: tr("Chưa đọc được bài thi. Tải lại trang (Ctrl+F5) rồi thử lại.", "Impossible de charger la copie. Rechargez la page.", "Couldn't load the paper. Reload the page.") + ` (${error.message})` };
  return { ok: true, bai: Array.isArray(data) ? data : [] };
}

export async function xinGiaiThich(attemptId, questionId) {
  const { data, error } = await supabase.functions.invoke("giai-thich-cau", { body: { attemptId, questionId } });
  if (error) {
    let than = null;
    try { than = await error.context?.json?.(); } catch { /* không đọc được thì thôi */ }
    const ma = than?.ma ?? "KHONG_RO";
    const cau = {
      HET_LUOT: tr(`Bạn đã dùng hết ${than?.han_muc ?? 30} lượt AI giải thích trong 24 giờ. Gói VIP tới 100 lượt AI/ngày.`, `Plus d'explications IA pour 24 h (${than?.han_muc ?? 30}).`, `No AI explanations left for 24 h (${than?.han_muc ?? 30}).`),
      HET_LUOT_VIP: loiTranVip(),
      CHUA_CAU_HINH_KHOA: tr("Máy chủ chưa bật AI.", "L'IA n'est pas activée.", "AI isn't enabled."),
      CHUA_DANG_NHAP: tr("Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử lại.", "Session expirée.", "Session expired."),
    }[ma];
    return { ok: false, thongBao: cau ?? tr("AI chưa giải thích được lúc này, thử lại sau ít phút.", "Explication impossible pour le moment.", "Can't explain right now.") };
  }
  if (!data?.ok) return { ok: false, thongBao: tr("AI chưa giải thích được câu này.", "Explication impossible.", "Couldn't explain.") };
  return { ok: true, giaiThich: data.giai_thich };
}
