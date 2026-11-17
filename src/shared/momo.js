import { supabase } from "../storageShim.js";
import { tr } from "./i18n.jsx";

/* Thanh toán VIP qua ví MoMo (17/11/2026). Mọi việc ký, giá, cấp VIP nằm ở Edge Function momo-don /
 * momo-ipn; ở đây chỉ gọi và dịch mã lỗi ra câu người đọc hiểu. */
const LOI = () => ({
  CHUA_CAU_HINH_MOMO: tr("Thanh toán MoMo chưa được bật trên máy chủ. Đây là việc của người quản trị; tạm thời bạn dùng chuyển khoản ngân hàng.", "Le paiement MoMo n'est pas encore activé. Utilisez le virement bancaire pour l'instant.", "MoMo payment is not enabled yet. Please use bank transfer for now."),
  CHUA_DANG_NHAP: tr("Bạn cần đăng nhập lại rồi thử lại.", "Reconnectez-vous puis réessayez.", "Please sign in again and retry."),
  QUA_NHIEU_DON: tr("Bạn đã tạo nhiều đơn MoMo trong một giờ qua. Đợi một lúc rồi thử lại.", "Trop de commandes MoMo en une heure. Réessayez plus tard.", "Too many MoMo orders in the last hour. Try again later."),
  MOMO_TU_CHOI: tr("MoMo chưa nhận tạo đơn lúc này. Thử lại sau ít phút, hoặc dùng chuyển khoản ngân hàng.", "MoMo a refusé la commande. Réessayez dans quelques minutes ou utilisez le virement.", "MoMo declined the order. Retry in a few minutes or use bank transfer."),
});

async function goi(than) {
  const { data, error } = await supabase.functions.invoke("momo-don", { body: than });
  if (!error && data?.ok) return data;
  let ma = data?.ma, chiTiet = data?.thongBao || "";
  try { const b = await error?.context?.json?.(); ma = b?.ma ?? ma; chiTiet = b?.thongBao || chiTiet; } catch { /* không đọc được thân lỗi */ }
  const cau = LOI()[ma] ?? tr("Chưa kết nối được tới máy chủ thanh toán. Tải lại trang (Ctrl+F5) rồi thử lại.", "Serveur de paiement injoignable. Rechargez la page.", "Couldn't reach the payment server. Reload the page.");
  return { ok: false, ma, thongBao: chiTiet ? `${cau} (${chiTiet})` : cau };
}

/* Tạo đơn VIP: trả { ok, ma, payUrl, deeplink, qrCodeUrl }. `ve` = trang MoMo đưa người dùng quay lại. */
export const taoDonMoMo = (ve) => goi({ hanh_dong: "tao", ve });
/* Hỏi máy chủ tra lại đơn ở MoMo: { ok, trangThai: "da_tra" | "cho" }. */
export const kiemDonMoMo = (ma) => goi({ hanh_dong: "kiem", ma });
/* MoMo đưa người dùng về `ve?partnerCode=…&orderId=FRM…&resultCode=…`. */
export const laMaDonMoMo = (ma) => /^FRM[0-9A-Z]+$/.test(String(ma ?? ""));
