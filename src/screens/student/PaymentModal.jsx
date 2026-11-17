import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, Info, Loader2, CheckCircle2, Wallet, Landmark, ExternalLink } from "lucide-react";
import { useT, tr } from "../../shared/i18n.jsx";
import { taoDonMoMo, kiemDonMoMo } from "../../shared/momo.js";
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
  /* 17/11 (chủ dự án): gói VIP trả được bằng ví MoMo, cạnh chuyển khoản. Bài lẻ, bộ thẻ vẫn chỉ chuyển khoản. */
  const [cach, setCach] = useState("ck");
  const [momo, setMomo] = useState({ dang: false, loi: "", ma: "", kiem: false, ghiChu: "" });
  /* Mở cửa sổ NGAY trong cú bấm (trình duyệt chặn cửa sổ mở sau một lời gọi mạng), rồi mới gán địa chỉ
     trang thanh toán. Modal ở lại và vẫn hỏi vip_den mỗi 4 giây, nên trả xong là tự báo mở khoá. */
  const moMoMo = async () => {
    if (momo.dang) return;
    const cua = window.open("", "_blank");
    setMomo((m) => ({ ...m, dang: true, loi: "", ghiChu: "" }));
    const r = await taoDonMoMo(window.location.origin + window.location.pathname);
    if (!r.ok) { cua?.close(); setMomo((m) => ({ ...m, dang: false, loi: r.thongBao })); return; }
    if (cua && !cua.closed) cua.location.href = r.payUrl; else window.location.href = r.payUrl;
    setMomo((m) => ({ ...m, dang: false, ma: r.ma }));
  };
  const kiemMoMo = async () => {
    if (!momo.ma || momo.kiem) return;
    setMomo((m) => ({ ...m, kiem: true, ghiChu: "" }));
    const r = await kiemDonMoMo(momo.ma);
    setMomo((m) => ({ ...m, kiem: false, ghiChu: !r.ok ? r.thongBao : r.trangThai === "da_tra" ? "" : tr("MoMo chưa báo đã nhận tiền. Nếu bạn vừa trả xong, đợi vài giây rồi bấm lại.", "MoMo n'a pas encore confirmé le paiement. Réessayez dans quelques secondes.", "MoMo hasn't confirmed the payment yet. Try again in a few seconds.") }));
  };

  /* Hỏi lại máy chủ mỗi 4 giây xem webhook SePay đã ghi quyền chưa.

     Đọc thẳng bảng exercise_access chứ không cần endpoint riêng: migration 001
     cho anon ĐỌC thoải mái và chặn mọi lệnh ghi, nên client hỏi được mà không
     tự cấp quyền cho mình.

     Dừng hẳn khi thấy đã trả — để nguyên thì modal đóng rồi mà bộ đếm vẫn gọi
     mạng mãi. `cancelled` chặn setState sau khi component đã tháo. */
  /* Gói VIP (06/10): không có dòng exercise_access nào để chờ. Chờ `vip_den`
     LỚN HƠN giá trị lúc mở hộp — người đang còn hạn mà gia hạn thì hạn vẫn
     « còn » ngay từ đầu, so với hiện tại sẽ báo xong khi chưa trả. */
  const [vipLucMo, setVipLucMo] = useState(undefined);
  useEffect(() => {
    if (!ex.laVip) return;
    supabase.from("profiles").select("vip_den").limit(1).maybeSingle()
      .then(({ data }) => setVipLucMo(data?.vip_den ?? null)).catch(() => setVipLucMo(null));
  }, [ex.laVip]);

  useEffect(() => {
    if (paid) return;
    if (ex.laVip && vipLucMo === undefined) return;
    let cancelled = false;

    const check = async () => {
      let xong = false;
      if (ex.laBo) {
        /* Bộ Flashcard (130): quyền nằm ở the_bo_quyen, học sinh đọc được dòng của mình. */
        const { data } = await supabase.from("the_bo_quyen").select("bo_id").eq("bo_id", ex.boId).limit(1);
        xong = !!data?.length;
      } else if (ex.laVip) {
        const { data } = await supabase.from("profiles").select("vip_den").limit(1).maybeSingle();
        const moi = data?.vip_den ? new Date(data.vip_den).getTime() : 0;
        xong = moi > (vipLucMo ? new Date(vipLucMo).getTime() : 0) && moi > Date.now();
      } else {
        const { data } = await supabase
          .from("exercise_access")
          .select("id")
          .eq("student", student)
          .eq("exercise_id", ex.id)
          .limit(1);
        xong = !!data?.length;
      }
      if (cancelled || !xong) return;
      setPaid(true);
      /* Chờ một nhịp để học sinh kịp thấy dấu tích, rồi mới đóng. Đóng ngay
         thì họ không biết vì sao modal biến mất. */
      setTimeout(() => { if (!cancelled) { onUnlocked?.(ex); onClose(); } }, 1600);
    };

    check();
    const id = setInterval(check, 4000);
    return () => { cancelled = true; clearInterval(id); };
  }, [paid, student, ex.id, onUnlocked, onClose, ex, vipLucMo]);

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

          {ex.laVip && (
            <div role="tablist" aria-label={tr("Cách thanh toán", "Moyen de paiement", "Payment method")} className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-surface2 p-1">
              {[["ck", Landmark, tr("Chuyển khoản", "Virement", "Bank transfer")], ["momo", Wallet, tr("Ví MoMo", "Portefeuille MoMo", "MoMo wallet")]].map(([k, Ic, nhan]) => (
                <button key={k} type="button" role="tab" aria-selected={cach === k} onClick={() => setCach(k)}
                  className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border-0 px-3 py-2 text-sm font-bold transition-colors ${cach === k ? "bg-surface text-ink shadow-sm" : "bg-transparent text-soft hover:text-ink"}`}>
                  <Ic size={15} /> {nhan}
                </button>
              ))}
            </div>
          )}

          {ex.laVip && cach === "momo" ? (
            <div className="mb-3 grid gap-3">
              <p className="m-0 text-sm text-soft">{tr("Bấm nút dưới đây: trang thanh toán của MoMo mở ra ở thẻ mới. Trên điện thoại, MoMo mở thẳng ứng dụng; trên máy tính, bạn quét mã QR bằng ứng dụng MoMo. Trả xong, quay lại đây: gói VIP tự mở trong vài giây.", "Cliquez ci-dessous : la page de paiement MoMo s'ouvre dans un nouvel onglet. Revenez ici après le paiement : le VIP s'active en quelques secondes.", "Click below: MoMo's payment page opens in a new tab. Come back here after paying: VIP activates within seconds.")}</p>
              {/* Màu hồng MoMo: ngoại lệ có chủ ý (màu thương hiệu để người dùng nhận ra nút), như STAT_GRADIENTS. */}
              <button type="button" onClick={moMoMo} disabled={momo.dang}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#A50064] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#8a0054] disabled:cursor-wait disabled:opacity-70">
                {momo.dang ? <Loader2 size={16} className="mcf-spin" /> : <Wallet size={16} />}
                {momo.ma ? tr("Mở lại trang thanh toán MoMo", "Rouvrir la page MoMo", "Reopen MoMo payment") : tr("Thanh toán bằng MoMo", "Payer avec MoMo", "Pay with MoMo")} <ExternalLink size={14} />
              </button>
              {momo.loi && <p role="alert" className="m-0 rounded-md bg-danger-soft px-3 py-2.5 text-sm font-semibold text-danger">{momo.loi}</p>}
              {momo.ma && !paid && (
                <button type="button" onClick={kiemMoMo} disabled={momo.kiem}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-solid border-line bg-surface px-4 py-2.5 text-sm font-bold text-ink hover:bg-surface2 disabled:cursor-wait">
                  {momo.kiem && <Loader2 size={15} className="mcf-spin" />} {tr("Tôi đã thanh toán xong", "J'ai payé", "I've paid")}
                </button>
              )}
              {momo.ghiChu && <p role="status" className="m-0 text-sm text-soft">{momo.ghiChu}</p>}
            </div>
          ) : !qr ? (
            <p className="rounded-md bg-warn-soft px-3 py-2.5 text-sm text-warn">{t("pay.no_config")}</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-soft">{t("pay.scan")}</p>
              {/* 14/10: căn giữa. Preflight tắt nên <img> vẫn là inline và
                  mx-auto không có tác dụng: mã QR dạt sang trái. Bọc trong khung flex. */}
              <div className="mb-4 flex justify-center">
                <div className="rounded-2xl border border-solid border-line bg-white p-3 shadow-sm">
                  <img src={qr} alt={t("pay.scan")} width={240} height={240}
                    className="block h-auto w-[min(240px,70vw)]" />
                </div>
              </div>

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
              {ex.laVip ? t("vip.unlocked") : t("pay.unlocked")}
            </p>
          ) : ex.laVip && cach === "momo" && !momo.ma ? null : (
            <p role="status" className="flex items-center gap-2 rounded-md bg-primary-soft px-3 py-3 text-sm font-semibold text-primary">
              <Loader2 size={16} className="mcf-spin shrink-0" />
              {t("pay.waiting")}
            </p>
          )}

          {!(ex.laVip && cach === "momo") && (
            <p className="mt-3 flex items-start gap-2 rounded-md bg-surface2 px-3 py-2.5 text-sm leading-relaxed text-soft">
              <Info size={16} className="mt-0.5 shrink-0" />
              <span>{t("pay.manual")}</span>
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
