import React, { useEffect, useState } from "react";
import { Star, X, Loader2, Lock } from "lucide-react";
import { doiXpLayBai } from "../../shared/xp.js";
import { giaXp, TRAN_XP } from "../../shared/premium.js";
import { fmtPrice } from "../../shared/access.js";

/* Hộp xác nhận « Đổi XP để mở khoá bài » (26/09).
 *
 * Giá hiển thị lấy từ `ex.xpCost`, nhưng máy chủ KHÔNG tin con số đó: RPC
 * redeem_exercise_with_xp đọc lại giá trong exercises.meta rồi mới trừ. Nếu
 * giáo viên vừa đổi giá, số trừ là giá mới và hộp này báo lại số dư thật. */
export default function DoiXpModal({ ex, xp, t, onClose, onDone, onBuy }) {
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState("");
  const gia = giaXp(ex) || 0;
  const thieu = xp !== null && xp < gia;

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape" && !dang) onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [dang, onClose]);

  const xacNhan = async () => {
    setDang(true); setLoi("");
    const kq = await doiXpLayBai(ex.id);
    setDang(false);
    if (kq.ok) { onDone(kq.xp_balance ?? xp); return; }
    setLoi(kq.loi === "khong_du_xp"
      ? t("xp.err_khong_du_xp", { n: kq.xp_balance ?? xp ?? 0, gia: kq.gia ?? gia })
      : t(`xp.err_${kq.loi}`));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !dang) onClose(); }}>
      <div role="dialog" aria-modal="true"
        className="w-full max-w-sm rounded-3xl border border-solid border-line bg-surface p-6 font-sans shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Lock size={22} />
          </span>
          <button type="button" onClick={onClose} disabled={dang} aria-label={t("identity.close")}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <h3 className="m-0 mt-4 text-lg font-bold text-ink">{t("xp.confirm_title", { n: gia })}</h3>
        <p className="m-0 mt-1 text-sm text-soft">{ex.title}</p>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface2 px-4 py-3 text-sm">
          <span className="text-soft">{t("xp.balance")}</span>
          <span className="inline-flex items-center gap-1 font-bold tabular-nums text-ink">
            <Star size={14} className="fill-current text-primary" /> {xp ?? "—"} → {xp !== null ? Math.max(xp - gia, 0) : "—"}
          </span>
        </div>

        {/* Thiếu XP (06/10): nói rõ còn bao nhiêu, ít nhất mấy ngày học (trần
            60 XP/ngày), và mở đường MUA NGAY — đây là chỗ XP chuyển thành doanh thu. */}
        {thieu && (
          <div className="mt-3 rounded-2xl bg-warn-soft p-4 text-sm text-ink">
            <div className="h-2 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-warn" style={{ width: Math.min(100, Math.round((xp / gia) * 100)) + "%" }} />
            </div>
            <p className="m-0 mt-2 font-semibold">{t("xp.con_thieu", { n: gia - xp, ngay: Math.ceil((gia - xp) / TRAN_XP.ngay) })}</p>
            <p className="m-0 mt-1 text-xs text-soft">{t("xp.cach_kiem")}</p>
          </div>
        )}
        {loi && <p className="m-0 mt-3 text-sm text-danger">{loi}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={dang}
            className="cursor-pointer rounded-xl border-0 bg-transparent px-4 py-2.5 font-sans text-sm font-semibold text-soft hover:text-ink">
            {t("xp.cancel")}
          </button>
          {thieu && onBuy && Number(ex.price) > 0 && (
            <button type="button" onClick={onBuy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 font-sans text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
              <Lock size={15} /> {t("xp.mua_ngay", { gia: fmtPrice(ex.price) })}
            </button>
          )}
          <button type="button" onClick={xacNhan} disabled={dang || thieu}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 font-sans text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {dang ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />} {t("xp.confirm_btn")}
          </button>
        </div>
      </div>
    </div>
  );
}
