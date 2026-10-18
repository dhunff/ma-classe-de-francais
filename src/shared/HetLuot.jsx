import React, { useEffect, useState } from "react";
import { Crown, Check, X, Clock } from "lucide-react";
import { tr, useT } from "./i18n.jsx";
import { Leon } from "./leon.jsx";
import { VIP, goiVip } from "./vip.js";
import { fmtPrice, PAYMENT_KEY } from "./access.js";
import { load } from "./storage.js";
import PaymentModal from "../screens/student/PaymentModal.jsx";

/* Màn hình hết lượt dùng thử (18/10, việc B3 trong kế hoạch quảng bá).
 *
 * Trước đây mỗi chỗ chạm giới hạn (AI chấm bài viết, AI nhận xét bài nói, hỏi
 * Leon, chấm phát âm, đề thi thử ngoài Đề 1) tự in một dòng chữ đỏ riêng, và
 * không chỗ nào cho bấm mua VIP ngay. Nay chúng gọi baoHetLuot(), một cửa sổ
 * chung nói rõ: hết cái gì, khi nào có lại, VIP được gì, và nút đăng ký.
 *
 * Chỉ dùng cho tài khoản THƯỜNG hết lượt (HET_LUOT, CAN_VIP). VIP chạm trần 100
 * lượt/ngày (HET_LUOT_VIP) thì không chào mua: họ đã là VIP rồi.
 * Mọi con số lấy từ phản hồi máy chủ (han_muc, cua_so_gio), không đoán. */
const SU_KIEN = "mcf:het-luot";

/* loai: "pe" | "po" | "leon" | "phat_am" | "de_vip" | "khac" */
export function baoHetLuot({ loai = "khac", hanMuc, cuaSoGio } = {}) {
  try { window.dispatchEvent(new CustomEvent(SU_KIEN, { detail: { loai, hanMuc, cuaSoGio } })); } catch { /* không có window */ }
}

const TEN = () => ({
  pe: tr("lượt AI chấm bài Viết", "corrections IA de l'écrit", "AI writing reviews"),
  po: tr("lượt AI nhận xét bài Nói", "commentaires IA de l'oral", "AI speaking feedback"),
  leon: tr("câu hỏi Leon", "questions à Leon", "questions to Leon"),
  phat_am: tr("lượt chấm phát âm", "corrections de prononciation", "pronunciation checks"),
});

function moTa({ loai, hanMuc, cuaSoGio }) {
  if (loai === "de_vip") return tr("Tài khoản miễn phí làm được Đề 1 của mỗi trình độ. Các đề còn lại dành cho thành viên VIP.",
    "Le compte gratuit donne accès au Sujet 1 de chaque niveau. Les autres sujets sont réservés aux membres VIP.",
    "Free accounts get Paper 1 of each level. Other papers are for VIP members.");
  const ten = TEN()[loai] ?? tr("lượt miễn phí", "essais gratuits", "free uses");
  const so = hanMuc ? `${hanMuc} ` : "";
  const khi = cuaSoGio
    ? tr(`trong ${cuaSoGio} giờ. Lượt cũ nhất được trả lại sau ${cuaSoGio} giờ kể từ lúc dùng.`, `sur ${cuaSoGio} h. Chaque essai revient ${cuaSoGio} h après utilisation.`, `in ${cuaSoGio} hours. Each use comes back ${cuaSoGio} hours after it was spent.`)
    : tr("hôm nay. Lượt mới mở lúc 0 giờ.", "aujourd'hui. De nouveaux essais à minuit.", "today. New uses unlock at midnight.");
  return tr(`Bạn đã dùng hết ${so}${ten} miễn phí ${khi}`, `Vous avez utilisé vos ${so}${ten} gratuites ${khi}`, `You've used your ${so}free ${ten} ${khi}`);
}

export default function CuaHetLuot({ session }) {
  const t = useT();
  const [bao, setBao] = useState(null);
  const [mua, setMua] = useState(false);
  const [payCfg, setPayCfg] = useState(null);

  useEffect(() => {
    const nghe = (e) => setBao(e.detail || {});
    window.addEventListener(SU_KIEN, nghe);
    return () => window.removeEventListener(SU_KIEN, nghe);
  }, []);
  useEffect(() => { if (bao && !payCfg) load(PAYMENT_KEY, null).then(setPayCfg).catch(() => {}); }, [bao, payCfg]);

  if (!bao) return null;
  if (mua) {
    return <PaymentModal ex={goiVip(t("vip.pay_title"))} student={session?.name} config={payCfg}
      onClose={() => { setMua(false); setBao(null); }} onUnlocked={() => { setMua(false); setBao(null); }} />;
  }

  const LOI = [
    tr("Mọi đề thi thử DELF A1 đến DALF C1", "Tous les examens blancs DELF A1 à DALF C1", "Every DELF A1 to DALF C1 mock exam"),
    tr("Tới 100 lượt AI mỗi ngày (chấm Viết, nhận xét Nói, hỏi Leon…)", "Jusqu'à 100 requêtes IA par jour", "Up to 100 AI requests per day"),
    tr("Bài viết mẫu từ chính bài của bạn", "Version modèle de votre propre texte", "Model version of your own text"),
    tr("Báo cáo tiến bộ tuần và ôn lại câu sai", "Bilan hebdomadaire et révision des erreurs", "Weekly progress report and mistake review"),
  ];

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={() => setBao(null)}>
      <div className="relative w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => setBao(null)} aria-label={tr("Đóng", "Fermer", "Close")}
          className="absolute right-3 top-3 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-ink"><X size={16} /></button>
        <div className="flex items-center gap-3">
          <Leon cam="buon" size={72} />
          <div className="min-w-0">
            <p className="m-0 text-lg font-extrabold text-ink">
              {bao.loai === "de_vip" ? tr("Đề này dành cho VIP", "Sujet réservé aux VIP", "This paper is VIP-only") : tr("Hết lượt miễn phí rồi!", "Plus d'essais gratuits !", "Out of free uses!")}
            </p>
            <p className="m-0 mt-1 flex items-start gap-1.5 text-sm leading-relaxed text-soft"><Clock size={14} className="mt-0.5 shrink-0" />{moTa(bao)}</p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-warn-soft p-4">
          <p className="m-0 flex items-center gap-1.5 text-sm font-extrabold text-ink"><Crown size={16} className="text-amber-500" /> {t("vip.title", { gia: fmtPrice(VIP.gia) })}</p>
          <ul className="m-0 mt-2 list-none space-y-1.5 p-0 text-sm text-ink">
            {LOI.map((l) => <li key={l} className="flex items-start gap-1.5"><Check size={14} className="mt-0.5 shrink-0 text-ok" />{l}</li>)}
          </ul>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => setMua(true)} disabled={!session}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-amber-500 px-5 py-3 font-sans text-sm font-extrabold text-white hover:bg-amber-600 disabled:opacity-60">
            <Crown size={16} /> {t("vip.cta", { gia: fmtPrice(VIP.gia) })}
          </button>
          <button type="button" onClick={() => setBao(null)}
            className="cursor-pointer rounded-xl border-0 bg-surface2 px-4 py-3 font-sans text-sm font-bold text-ink hover:bg-primary-soft">
            {tr("Để sau", "Plus tard", "Later")}
          </button>
        </div>
      </div>
    </div>
  );
}
