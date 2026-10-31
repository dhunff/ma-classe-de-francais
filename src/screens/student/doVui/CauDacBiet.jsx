import React, { useCallback, useEffect, useState } from "react";
import { Volume2, RotateCcw } from "lucide-react";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import { dungThuTu } from "./dangCau.js";

const giongPhap = () => { try { return window.speechSynthesis?.getVoices().find((v) => /^fr/i.test(v.lang)) ?? null; } catch { return null; } };

/* Danh sách giọng của trình duyệt nạp muộn, nên phải nghe thêm sự kiện voiceschanged. */
export function useCoGiongPhap() {
  const [co, setCo] = useState(() => !!giongPhap());
  useEffect(() => {
    const s = window.speechSynthesis;
    if (!s?.addEventListener) return undefined;
    const xem = () => setCo(!!giongPhap());
    xem();
    s.addEventListener("voiceschanged", xem);
    return () => s.removeEventListener("voiceschanged", xem);
  }, []);
  return co;
}

/* Nút nghe câu tiếng Pháp: tự đọc một lần khi hiện ra, bấm để nghe lại. Trả lời xong thì hiện chữ. */
export function NutNghe({ loi, toc = 1, daTra }) {
  const doc = useCallback(() => {
    const s = window.speechSynthesis;
    if (!s) return;
    try {
      s.cancel();
      const u = new window.SpeechSynthesisUtterance(loi);
      u.lang = "fr-FR"; u.rate = 0.9 * toc;
      const g = giongPhap();
      if (g) u.voice = g;
      s.speak(u);
    } catch { /* không đọc được thì vẫn còn nút nghe lại, câu hỏi không vỡ */ }
  }, [loi, toc]);
  useEffect(() => { doc(); return () => window.speechSynthesis?.cancel(); }, [doc]);
  return (
    <div className="mt-3 grid justify-items-center gap-2">
      <button type="button" onClick={doc} className="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-amber-400 px-5 py-2.5 font-sans text-sm font-extrabold text-[#140b33]"><Volume2 size={18} className="mcf-lua-nhun" />{tr("Nghe lại", "Réécouter", "Listen again")}</button>
      {daTra && <p lang="fr" className="mcf-cau-vao m-0 text-sm italic text-white/85">« {loi} »</p>}
    </div>
  );
}

/* Xếp mốc lịch sử: bấm lần lượt từ xưa tới nay, đủ thì tự nộp. Trả lời xong hiện năm và thứ tự đúng. */
export function XepMoc({ su, daChon, onXong, laPhap }) {
  const [thu, setThu] = useState([]);
  const xong = daChon != null;
  const bam = (k) => {
    if (xong || thu.includes(k)) return;
    phat("bam");
    const moi = [...thu, k];
    setThu(moi);
    if (moi.length === su.length) onXong(dungThuTu(su, moi));
  };
  const hang = xong ? su.map((s, k) => k).sort((a, b) => su[a].nam - su[b].nam) : su.map((_, k) => k);
  return (
    <div className="mt-4 grid gap-2">
      {hang.map((k) => {
        const so = thu.indexOf(k);
        return (
          <button key={k} type="button" disabled={xong} onClick={() => bam(k)} lang={laPhap ? "fr" : undefined}
            className={`mcf-cau-vao flex items-center gap-3 rounded-xl border-2 border-solid px-3 py-2.5 text-left font-sans text-sm font-bold text-white transition-colors ${so >= 0 && !xong ? "border-amber-300 bg-amber-400/25" : xong ? "border-emerald-400/60 bg-emerald-500/15" : "cursor-pointer border-white/20 bg-white/10 hover:bg-white/20"}`}>
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-black tabular-nums ${so >= 0 && !xong ? "bg-amber-400 text-[#140b33]" : "bg-black/25 text-white/70"}`}>{so >= 0 ? so + 1 : ""}</span>
            <span className="min-w-0 flex-1">{su[k].ten}</span>
            {xong && <span className="shrink-0 text-xs font-black tabular-nums text-emerald-300">{su[k].nam < 0 ? `${-su[k].nam} TCN` : su[k].nam}</span>}
          </button>
        );
      })}
      {!xong && thu.length > 0 && <button type="button" onClick={() => setThu([])} className="mx-auto flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-white/10 px-3 py-1.5 font-sans text-xs font-bold text-white"><RotateCcw size={13} />{tr("Xếp lại", "Recommencer", "Start over")}</button>}
    </div>
  );
}
