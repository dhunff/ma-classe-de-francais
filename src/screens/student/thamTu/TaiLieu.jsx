import React from "react";
import { Volume2, Mail, MessageSquareQuote, FileText } from "lucide-react";
import { tr } from "../../../shared/i18n.jsx";

/* neo: đoạn chứa câu trả lời, luôn nằm gọn trong một dòng (thamTuTroGiup.js).
   to: Kính lúp tô neo. chay: P.G. đốt cách một từ trong neo, chữ bị đốt KHÔNG nằm trong DOM. */
export default function TaiLieu({ tl, neo, to, chay }) {
  const doan = (s) => (!chay ? s : s.split(" ").map((w, j) => (j % 2
    ? <React.Fragment key={j}><span role="img" aria-label={tr("chữ bị cháy", "mot brûlé", "burnt word")} style={{ width: `${Math.max(1.4, w.length * 0.55)}em` }} className="mcf-tt-than" /> </React.Fragment>
    : `${w} `)));
  const boi = (t) => {
    const k = neo && (to || chay) ? t.indexOf(neo) : -1;
    if (k < 0) return t;
    return <>{t.slice(0, k)}{to ? <mark className="mcf-tt-mark">{doan(neo)}</mark> : doan(neo)}{t.slice(k + neo.length)}</>;
  };
  const dong = tl.van.split("\n").map((d, k) => <span key={k} className="block min-h-[1em]">{boi(d)}</span>);
  if (tl.loai === "sms") return (
    <div className="mx-auto max-w-sm rounded-[1.75rem] bg-[#111827] p-3 shadow-xl">
      <p className="m-0 pb-2 text-center text-xs font-bold text-white/70">{tl.tieuDe}</p>
      <p lang="fr" className="m-0 max-w-[85%] rounded-2xl rounded-bl-md bg-[#e5e7eb] px-4 py-2.5 text-[15px] leading-snug text-[#111]">{dong}</p>
    </div>
  );
  if (tl.loai === "ve" || tl.loai === "hoaDon") return (
    <div className="mx-auto max-w-sm border-0 border-y-4 border-dotted border-[#9ca3af] bg-[#fff] px-5 py-4 text-sm text-[#111] shadow-lg">
      <p className="m-0 mb-2 text-center font-bold uppercase tracking-widest">{tl.tieuDe}</p><div lang="fr">{dong}</div>
    </div>
  );
  if (tl.loai === "email") return (
    <div className="overflow-hidden rounded-xl bg-[#fff] text-[#111] shadow-lg">
      <p className="m-0 bg-[#e0e7ff] px-4 py-2 text-sm font-bold text-[#3730a3]"><Mail size={14} className="mr-1 inline align-[-2px]" />{tl.tieuDe}</p>
      <div lang="fr" className="px-4 py-3 text-[15px] leading-relaxed">{dong}</div>
    </div>
  );
  if (tl.loai === "bao") return (
    <div className="bg-[#f5f1e6] px-5 py-4 text-[#1f1f1f] shadow-lg">
      <p className="m-0 border-0 border-b-2 border-solid border-[#1f1f1f] pb-1 text-sm font-black uppercase tracking-wider">{tl.tieuDe}</p>
      <p lang="fr" className="m-0 mt-3 text-[15px] leading-relaxed [column-gap:1.5rem] sm:columns-2">{boi(tl.van)}</p>
    </div>
  );
  if (tl.loai === "affiche" || tl.loai === "bien") return (
    <div className={`mx-auto max-w-md rounded-lg px-5 py-4 text-center shadow-lg ${tl.loai === "affiche" ? "bg-[#fde047] text-[#111]" : "bg-[#1e3a8a] text-white"}`}>
      <p className="m-0 text-lg font-black uppercase tracking-wider">{tl.tieuDe}</p>
      <div lang="fr" className="mt-2 text-[15px] leading-relaxed">{dong}</div>
    </div>
  );
  if (tl.loai === "loa") return (
    <div className="rounded-2xl bg-[#0f172a] px-5 py-4 text-[#e2e8f0] shadow-lg">
      <p className="m-0 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300"><Volume2 size={14} /> {tl.tieuDe}</p>
      <div lang="fr" className="mt-2 text-[15px] italic leading-relaxed">{dong}</div>
    </div>
  );
  // note · loiKhai · thu · bang · the · bai: tờ giấy viết tay / đánh máy
  return (
    <div className={`px-5 py-4 text-[#1f2937] shadow-lg ${tl.loai === "thu" ? "bg-[#fdf6e3]" : tl.loai === "bang" ? "bg-[#fff] text-sm" : "bg-[#fffbeb]"}`}>
      <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-wider text-[#92400e]">{tl.loai === "loiKhai" ? <MessageSquareQuote size={13} className="mr-1 inline align-[-2px]" /> : <FileText size={13} className="mr-1 inline align-[-2px]" />}{tl.tieuDe}</p>
      <div lang="fr" className="text-[15px] leading-relaxed">{dong}</div>
    </div>
  );
}
