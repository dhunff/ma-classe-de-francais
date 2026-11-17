import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Loader2, X, Clock } from "lucide-react";
import { tr } from "./i18n.jsx";
import { kiemDonMoMo, laMaDonMoMo } from "./momo.js";

/* Màn quay về từ MoMo (17/11/2026). MoMo đưa người dùng về trang đã mở thanh toán, kèm `?orderId=FRM…
 * &resultCode=…`. KHÔNG tin resultCode trên địa chỉ (ai cũng sửa được): hỏi máy chủ tra lại đơn ở MoMo
 * (momo-don « kiem »), máy chủ mới là bên cấp VIP. Xong thì xoá tham số khỏi địa chỉ để tải lại trang
 * không hỏi lại. Gắn một lần trong vỏ app. */
export default function KetQuaMoMo() {
  const [tt, setTt] = useState(null); // null | "dang" | "da_tra" | "cho" | { loi }
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const ma = q.get("orderId");
    if (!laMaDonMoMo(ma)) return;
    const huyBo = q.get("resultCode") && q.get("resultCode") !== "0";
    for (const k of ["partnerCode", "orderId", "requestId", "amount", "orderInfo", "orderType", "transId", "resultCode", "message", "payType", "responseTime", "extraData", "signature"]) q.delete(k);
    window.history.replaceState(null, "", window.location.pathname + (q.toString() ? `?${q}` : "") + window.location.hash);
    setTt("dang");
    kiemDonMoMo(ma).then((r) => setTt(!r.ok ? { loi: r.thongBao } : r.trangThai === "da_tra" ? "da_tra" : huyBo ? "huy" : "cho"));
  }, []);
  if (!tt) return null;

  const [Ic, mau, tieuDe, moTa] = tt === "dang"
    ? [Loader2, "text-primary", tr("Đang kiểm tra thanh toán MoMo…", "Vérification du paiement MoMo…", "Checking your MoMo payment…"), ""]
    : tt === "da_tra"
      ? [CheckCircle2, "text-ok", tr("Đã nhận thanh toán, gói VIP đã mở", "Paiement reçu, VIP activé", "Payment received, VIP unlocked"), tr("Tải lại trang (Ctrl+F5) nếu bài VIP vẫn còn khoá.", "Rechargez la page si un exercice reste verrouillé.", "Reload the page if a VIP exercise still looks locked.")]
      : tt === "huy"
        ? [X, "text-danger", tr("Thanh toán MoMo chưa hoàn tất", "Paiement MoMo non finalisé", "MoMo payment not completed"), tr("Bạn chưa bị trừ tiền. Muốn mua VIP thì mở lại phần thanh toán.", "Vous n'avez pas été débité. Relancez le paiement si besoin.", "You weren't charged. Start the payment again if you wish.")]
        : tt === "cho"
          ? [Clock, "text-warn", tr("MoMo chưa báo đã nhận tiền", "MoMo n'a pas encore confirmé", "MoMo hasn't confirmed yet"), tr("Nếu bạn đã trả, gói VIP sẽ tự mở khi MoMo báo về (thường trong vài phút). Mở lại phần thanh toán và bấm « Tôi đã thanh toán xong » để kiểm lại.", "Si vous avez payé, le VIP s'activera dès la confirmation de MoMo.", "If you paid, VIP will activate once MoMo confirms (usually within minutes).")]
          : [X, "text-danger", tr("Chưa kiểm tra được thanh toán", "Vérification impossible", "Couldn't check the payment"), tt.loi];

  return createPortal(
    <div role="status" className="fixed inset-x-4 bottom-4 z-[9998] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-solid border-line bg-surface p-4 shadow-lg">
      <Ic size={22} className={`mt-0.5 shrink-0 ${mau} ${tt === "dang" ? "mcf-spin" : ""}`} />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-extrabold text-ink">{tieuDe}</p>
        {moTa && <p className="m-0 mt-1 text-sm text-soft">{moTa}</p>}
      </div>
      {tt !== "dang" && (
        <button type="button" onClick={() => setTt(null)} aria-label={tr("Đóng", "Fermer", "Close")}
          className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-ink"><X size={16} /></button>
      )}
    </div>,
    document.body,
  );
}
