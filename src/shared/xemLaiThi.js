import { supabase } from "../storageShim.js";
import { tr } from "./i18n.jsx";

/* « Xem lại bài thi » (14/11): đọc câu hỏi + đáp án + bài đã nộp qua rpc xem_lai_bai_thi (migration 207,
   chỉ lượt ĐÃ NỘP của chính mình) (lời giải cố định của đề, không gọi AI). */
export async function docBaiThi(attemptIds) {
  const ids = [...new Set((attemptIds ?? []).filter(Boolean))];
  if (!ids.length) return { ok: false, thongBao: tr("Chưa có phần nào được lưu để xem lại.", "Aucune épreuve enregistrée à revoir.", "Nothing saved to review yet.") };
  const { data, error } = await supabase.rpc("xem_lai_bai_thi", { p_attempts: ids });
  if (error) return { ok: false, thongBao: tr("Chưa đọc được bài thi. Tải lại trang (Ctrl+F5) rồi thử lại.", "Impossible de charger la copie. Rechargez la page.", "Couldn't load the paper. Reload the page.") + ` (${error.message})` };
  return { ok: true, bai: Array.isArray(data) ? data : [] };
}
