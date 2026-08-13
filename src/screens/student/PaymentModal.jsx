import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, Info, Loader2, CheckCircle2 } from "lucide-react";
import { useT } from "../../shared/i18n.jsx";
import { fmtPrice, paymentMemo, vietQrUrl } from "../../shared/access.js";
import { supabase } from "../../storageShim.js";

/* Modal mua bài tập.

   Không hứa hẹn tự động. Sau khi chuyển khoản, giáo viên đối chiếu sao kê
   rồi mới mở khoá — và modal nói đúng như vậy thay vì để học sinh ngồi chờ
   một thứ không bao giờ xảy ra. Khi nào có webhook chạy phía máy chủ thì
   sửa lại đoạn `pay.manual` và thêm cơ chế cập nhật trạng thái. */

function Row({ label, value, copyable, t }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* trình duyệt chặn clipboard — người dùng vẫn đọc và gõ tay được */ }
  };
  return (
    <div className="flex items-start justify-between gap-3 border-0 border-b border-solid border-line py-2.5 last:border-b-0">
      <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-soft">{label}</span>
      <span className="flex min-w-0 items-center gap-2 text-right">
        <span className="break-all text-sm font-bold text-ink">{value}</span>
        {copyable && (
          <button type="button" onClick={copy} aria-label={t("pay.copied")}
            className="shrink-0 rounded-sm p-1 text-soft transition-colors hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/40">
            {copied ? <Check size={14} className="text-ok" /> : <Copy size={14} />}
          </button>
        )}
      </span>
    </div>
  );
}

export default function PaymentModal({ ex, student, config, onClose, onUnlocked }) {
  const t = useT();
  const memo = paymentMemo(student, ex.id);
  const qr = vietQrUrl(config, ex.price, memo);
  const [paid, setPaid] = useState(false);

  /* Hỏi lại máy chủ mỗi 4 giây xem webhook SePay đã ghi quyền chưa.

     Đọc thẳng bảng exercise_access chứ không cần endpoint riêng: migration 001
     cho anon ĐỌC thoải mái và chặn mọi lệnh ghi, nên client hỏi được mà không
     tự cấp quyền cho mình.

     Dừng hẳn khi thấy đã trả — để nguyên thì modal đóng rồi mà bộ đếm vẫn gọi
     mạng mãi. `cancelled` chặn setState sau khi component đã tháo. */
  useEffect(() => {
    if (paid) return;
    let cancelled = false;

    const check = async () => {
      const { data } = await supabase
        .from("exercise_access")
        .select("id")
        .eq("student", student)
        .eq("exercise_id", ex.id)
        .limit(1);
      if (cancelled || !data?.length) return;
      setPaid(true);
      /* Chờ một nhịp để học sinh kịp thấy dấu tích, rồi mới đóng. Đóng ngay
         thì họ không biết vì sao modal biến mất. */
      setTimeout(() => { if (!cancelled) { onUnlocked?.(ex); onClose(); } }, 1600);
    };

    check();
    const id = setInterval(check, 4000);
    return () => { cancelled = true; clearInterval(id); };
  }, [paid, student, ex.id, onUnlocked, onClose, ex]);

  return createPortal(
    <div className="mcf-float fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-ink/50 p-4 sm:items-center"
      onClick={onClose} role="dialog" aria-modal="true" aria-label={t("pay.title")}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-md border border-solid border-line bg-surface shadow-md">
        <div className="flex items-center justify-between gap-3 border-0 border-b border-solid border-line px-5 py-4">
          <h2 className="text-base font-bold text-ink">{t("pay.title")}</h2>
          <button type="button" onClick={onClose} aria-label={t("pay.close")}
            className="grid h-9 w-9 place-items-center rounded-md text-soft transition-colors hover:bg-surface2 hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/40">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="mb-1 text-sm font-bold text-ink">{ex.title}</p>
          <p className="mb-4 text-2xl font-extrabold tracking-tight text-primary">{fmtPrice(ex.price)}</p>

          {!qr ? (
            <p className="rounded-md bg-warn-soft px-3 py-2.5 text-sm text-warn">{t("pay.no_config")}</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-soft">{t("pay.scan")}</p>
              <img src={qr} alt="" className="mx-auto mb-4 w-full max-w-[260px] rounded-md border border-solid border-line" />

              <div className="mb-3">
                <Row label={t("pay.bank")} value={config.bank} t={t} />
                <Row label={t("pay.account")} value={config.account} copyable t={t} />
                {config.accountName && <Row label={t("pay.holder")} value={config.accountName} t={t} />}
                <Row label={t("pay.amount")} value={fmtPrice(ex.price)} t={t} />
                <Row label={t("pay.memo")} value={memo} copyable t={t} />
              </div>

              <p className="mb-3 rounded-md bg-danger-soft px-3 py-2.5 text-sm font-semibold text-danger">
                {t("pay.memo_warning")}
              </p>
            </>
          )}

          {/* Trạng thái chờ. Webhook SePay ghi quyền ngay khi tiền về, nên câu
              chữ nói đúng thứ đang xảy ra: máy đang chờ, không phải người. */}
          {paid ? (
            <p role="status" className="flex items-center gap-2 rounded-md bg-ok-soft px-3 py-3 text-sm font-bold text-ok">
              <CheckCircle2 size={18} className="shrink-0" />
              {t("pay.unlocked")}
            </p>
          ) : (
            <p role="status" className="flex items-center gap-2 rounded-md bg-primary-soft px-3 py-3 text-sm font-semibold text-primary">
              <Loader2 size={16} className="mcf-spin shrink-0" />
              {t("pay.waiting")}
            </p>
          )}

          <p className="mt-3 flex items-start gap-2 rounded-md bg-surface2 px-3 py-2.5 text-sm leading-relaxed text-soft">
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>{t("pay.manual")}</span>
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
