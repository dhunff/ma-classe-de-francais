import React, { useEffect, useRef, useState } from "react";
import { Search, BookOpen, FlaskConical, PhoneCall, Coffee, Award, Briefcase, Lock, Eye, Feather } from "lucide-react";
import { tr } from "../../../shared/i18n.jsx";
import { UY_TIN_DAU, NGHI_MAX } from "./luat.js";

/* Túi đồ thám tử (30/10, giai đoạn 2). Toàn bộ biểu tượng là lucide + CSS, không emoji.
 * MON là hàm vì tr() phải chạy lúc dựng. */
export const MON = () => [
  { ma: "kinh", Icon: Search, ten: tr("Kính lúp", "Loupe", "Magnifier"), gia: tr("−1 giờ", "−1 h", "−1 h"), mo: tr("Tô đoạn chứa câu trả lời", "Surligne le passage clé", "Highlights the key passage"), nen: "from-amber-500 to-orange-600" },
  { ma: "tu", Icon: BookOpen, ten: tr("Từ điển Odile", "Dico d'Odile", "Odile's dictionary"), gia: tr("Miễn phí", "Gratuit", "Free"), mo: tr("Dịch 3 từ khó", "Traduit 3 mots", "Translates 3 words"), nen: "from-sky-500 to-indigo-600" },
  { ma: "ines", Icon: FlaskConical, ten: tr("Phân tích của Inès", "Analyse d'Inès", "Inès's analysis"), gia: tr("−1 vật chứng", "−1 preuve", "−1 evidence"), mo: tr("Loại 1 đáp án sai", "Élimine 1 réponse", "Removes 1 wrong answer"), nen: "from-emerald-500 to-teal-600" },
  { ma: "leon", Icon: PhoneCall, ten: tr("Gọi Léon", "Appeler Léon", "Call Léon"), gia: tr("−1 uy tín", "−1 réputation", "−1 reputation"), mo: tr("Mẹo đọc câu hỏi", "Astuce de lecture", "A reading tip"), nen: "from-rose-500 to-red-600" },
  { ma: "cafe", Icon: Coffee, ten: tr("Nghỉ cà phê", "Pause café", "Coffee break"), gia: tr("−2 giờ", "−2 h", "−2 h"), mo: tr("Hồi 1 uy tín", "Rend 1 réputation", "Restores 1 reputation"), nen: "from-yellow-700 to-amber-900" },
  { ma: "theo", Icon: Eye, hiem: true, ten: tr("Theo dõi ngầm", "Filature", "Undercover tail"), gia: tr("Hiếm", "Rare", "Rare"), mo: tr("Thấy trước và chặn nước đi kế của P.G.", "Voit et déjoue le prochain coup de P.G.", "Sees and foils P.G.'s next move"), nen: "from-slate-500 to-slate-800" },
];
export const monCua = (ma) => MON().find((m) => m.ma === ma);

/* Một lá bài dụng cụ. `khoaLyDo` có chữ thì lá mờ và nói vì sao chưa dùng được. */
export function LaMon({ m, onClick, chon, khoaLyDo, moi, nho }) {
  return (
    <button type="button" onClick={onClick} disabled={!!khoaLyDo} title={khoaLyDo || m.mo} aria-pressed={chon}
      className={`mcf-tt-la group relative cursor-pointer overflow-hidden rounded-2xl border-0 bg-gradient-to-br ${m.nen} p-3 text-left font-sans text-white disabled:cursor-not-allowed disabled:opacity-45 ${moi ? "mcf-tt-la-moi" : ""} ${chon ? "mcf-tt-la-chon" : ""}`}>
      <span aria-hidden className="mcf-tt-la-sang" />
      <span className="relative flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20"><m.Icon size={20} /></span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-extrabold leading-tight">{m.ten}</span>
          <span className="block text-[11px] font-bold text-white/85">{m.gia}</span>
        </span>
      </span>
      {!nho && <span className="relative mt-2 block text-xs leading-snug text-white/90">{m.mo}</span>}
    </button>
  );
}

/* Khay túi đồ: luôn vẽ đủ 3 ô, ô trống vẫn hiện để thấy còn chỗ. */
export function KhayTui({ tui, lyDo, onDung, moi }) {
  return (
    <div className="mt-4 rounded-2xl bg-black/25 p-3">
      <p className="m-0 mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#e7dcc8]"><Briefcase size={13} /> {tr("Túi thám tử", "Sacoche", "Detective's bag")}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {[0, 1, 2].map((k) => {
          const ma = tui[k];
          return ma
            ? <LaMon key={`${ma}${k}`} m={monCua(ma)} nho moi={moi === k} khoaLyDo={lyDo(ma)} onClick={() => onDung(k)} />
            : <span key={k} className="grid min-h-[60px] place-items-center rounded-2xl border-2 border-dashed border-white/15 text-white/30"><Lock size={16} /></span>;
        })}
      </div>
    </div>
  );
}

/* Đồng hồ vòng + huy chương + vật chứng. Số đổi thì bay ra một nhãn −1 / +1. */
export function HudVu({ hud, gioDau, vatChung }) {
  const R = 19, chuVi = 2 * Math.PI * R, nguy = hud.gio <= 1;
  const truoc = useRef(hud); const [bay, setBay] = useState(null);
  useEffect(() => {
    const dg = hud.gio - truoc.current.gio, du = hud.uy - truoc.current.uy;
    truoc.current = hud;
    if (dg || du) setBay({ dg, du, k: Date.now() });
  }, [hud]);
  const nhan = (v, duoi) => `${v > 0 ? "+" : "−"}${Math.abs(v)}${duoi}`;
  return (
    <div className="relative mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className={`relative grid h-12 w-12 place-items-center ${nguy ? "mcf-tt-nguy" : ""}`} role="img" aria-label={tr(`Còn ${hud.gio} giờ`, `${hud.gio} h restantes`, `${hud.gio} h left`)}>
        <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="24" cy="24" r={R} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="5" />
          <circle cx="24" cy="24" r={R} fill="none" stroke={nguy ? "#f87171" : "#fbbf24"} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={chuVi} strokeDashoffset={chuVi * (1 - Math.min(1, hud.gio / Math.max(1, gioDau)))} className="transition-[stroke-dashoffset] duration-700" />
        </svg>
        <span className="text-sm font-extrabold tabular-nums text-white">{hud.gio}<span className="text-[10px]">h</span></span>
      </span>
      <span className="flex items-center gap-1" role="img" aria-label={tr(`Uy tín ${hud.uy}/${UY_TIN_DAU}`, `Réputation ${hud.uy}/${UY_TIN_DAU}`, `Reputation ${hud.uy}/${UY_TIN_DAU}`)}>
        {Array.from({ length: UY_TIN_DAU }, (_, k) => (
          <span key={k} className={`grid h-8 w-8 place-items-center rounded-full ${k < hud.uy ? "mcf-tt-huy bg-gradient-to-br from-yellow-300 to-amber-500 text-[#5b3a06]" : "mcf-tt-huy-mat bg-white/10 text-white/25"}`}><Award size={17} /></span>
        ))}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-bold text-[#fef3c7]" title={tr("Vật chứng: mỗi câu đúng được 1, dùng cho phân tích của Inès", "Preuves : 1 par bonne réponse", "Evidence: 1 per correct answer")}>
        <FlaskConical size={16} className="text-emerald-300" /> <span className="tabular-nums">{vatChung}</span>
      </span>
      <span key={hud.nghi} className="mcf-tt-nghi flex items-center gap-0.5" role="img" aria-label={tr(`P.G. nghi ngờ ${hud.nghi}/${NGHI_MAX}`, `Soupçons de P.G. ${hud.nghi}/${NGHI_MAX}`, `P.G.'s suspicion ${hud.nghi}/${NGHI_MAX}`)} title={tr("Mức nghi ngờ của P.G.: càng cao thì cản trở càng nặng. Sai làm tăng, hoá giải cản trở làm giảm.", "Soupçons de P.G. : plus ils sont hauts, plus les obstacles sont durs.", "P.G.'s suspicion: the higher it is, the harder the obstacles.")}>
        {Array.from({ length: NGHI_MAX }, (_, k) => <Feather key={k} size={15} className={k < hud.nghi ? (hud.nghi >= 4 ? "text-red-300" : "text-[#d6d3d1]") : "text-white/15"} />)}
      </span>
      {bay && (
        <span key={bay.k} className="mcf-tt-bay pointer-events-none absolute left-14 top-0 text-sm font-black" aria-hidden>
          {bay.dg ? <span className={bay.dg < 0 ? "text-red-300" : "text-emerald-300"}>{nhan(bay.dg, "h")} </span> : null}
          {bay.du ? <span className={bay.du < 0 ? "text-red-300" : "text-emerald-300"}>{nhan(bay.du, "")}</span> : null}
        </span>
      )}
    </div>
  );
}

/* Hiệu ứng toàn khung khi dùng một món, chạy 1,3 giây rồi tự gỡ (ThamTu giữ trạng thái). */
export function HieuUng({ ma }) {
  const m = monCua(ma);
  return (
    <div aria-hidden className={`mcf-tt-man mcf-tt-man-${ma} pointer-events-none absolute inset-0 z-20 grid place-items-center overflow-hidden`}>
      {ma === "kinh" && <span className="mcf-tt-quet absolute left-0 top-1/3 grid h-28 w-28 place-items-center rounded-full border-4 border-solid border-amber-300 bg-amber-200/20 text-amber-200"><Search size={46} /></span>}
      {ma === "ines" && <span className="mcf-tt-tia absolute inset-x-0 top-0 h-1.5 bg-emerald-300 shadow-[0_0_24px_8px_rgba(110,231,183,.7)]" />}
      {ma === "theo" && <span className="mcf-tt-radar absolute h-64 w-64 rounded-full" />}
      {ma === "leon" && <><span className="mcf-tt-song absolute h-24 w-24 rounded-full border-2 border-solid border-rose-300" /><span className="mcf-tt-song mcf-tt-song2 absolute h-24 w-24 rounded-full border-2 border-solid border-rose-300" /></>}
      <span className={`relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br ${m.nen} text-white shadow-2xl ${ma === "leon" ? "mcf-tt-reo" : ma === "tu" ? "mcf-tt-lat" : "mcf-tt-noi"}`}>
        <m.Icon size={38} />
        {ma === "cafe" && [0, 1, 2].map((k) => <span key={k} style={{ left: `${30 + k * 18}%`, animationDelay: `${k * 0.18}s` }} className="mcf-tt-khoi absolute -top-2 h-6 w-1.5 rounded-full bg-white/70" />)}
      </span>
    </div>
  );
}
