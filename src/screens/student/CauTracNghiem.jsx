import React from "react";
import { tr } from "../../shared/i18n.jsx";
import { tron } from "../../shared/troChoiNhanh.js";

/* kieu: "manh" = mảnh giấy ghim (Thám tử) · "tv" = bốn ô màu A–D (Đố vui)
   · "thoai" = bong bóng lời thoại của người chơi (Phiêu lưu). */
const MAU_TV = ["bg-rose-500", "bg-sky-500", "bg-amber-500", "bg-emerald-500"];
export default function CauTracNghiem({ pa, onTra, daChon, laPhap, kieu, bo, an = [] }) {
  const thuTu = React.useMemo(() => tron(pa.map((x, k) => ({ x, k }))), [pa]);
  const lang = laPhap ? "fr" : undefined;
  if (kieu === "tv") return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {thuTu.map(({ x, k }, j) => {
        const dung = daChon != null && k === 0, mo = daChon != null && !dung;
        return (
          <button key={k} type="button" onClick={() => onTra(k)} lang={lang}
            className={`flex min-h-[72px] cursor-pointer items-center gap-3 rounded-xl border-0 ${MAU_TV[j]} px-4 py-3 text-left font-sans text-base font-bold text-white shadow-[0_5px_0_rgba(0,0,0,0.25)] transition-[opacity,transform] duration-200 active:translate-y-1 active:shadow-none ${dung ? "scale-[1.03] ring-4 ring-white" : ""} ${mo ? "opacity-30" : ""}`}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-black/20 text-sm">{"ABCD"[j]}</span>{x}
          </button>
        );
      })}
    </div>
  );
  if (kieu === "manh") return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {thuTu.map(({ x, k }, j) => {
        const dung = daChon != null && k === 0, sai = daChon === k && k !== 0;
        return (
          <button key={k} type="button" disabled={an.includes(k)} onClick={() => onTra(k)} lang={lang} style={{ rotate: `${[-1.5, 1.2, 0.8, -1][j % 4]}deg` }}
            className={`relative ${an.includes(k) ? "mcf-tt-chay" : ""} cursor-pointer border-0 bg-[#fef9c3] px-4 pb-3 pt-5 text-left font-sans text-sm text-[#1f2937] shadow-[0_6px_14px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.02] ${sai ? "mcf-rung opacity-60" : ""}`}>
            <span aria-hidden className="absolute left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-red-600 shadow" />
            {x}
            {dung && <span className="mcf-dong absolute -right-2 -top-3 rounded border-2 border-solid border-green-700 bg-[#fef9c3] px-1.5 text-[11px] font-black text-green-700">{tr("CHỨNG CỨ", "PREUVE", "PROOF")}</span>}
          </button>
        );
      })}
    </div>
  );
  return (
    <div className="mt-4 flex flex-col items-end gap-2.5">
      {thuTu.filter(({ k }) => !bo?.includes(k)).map(({ x, k }) => {
        const dung = daChon != null && k === 0, sai = daChon === k && k !== 0;
        return (
          <button key={k} type="button" onClick={() => onTra(k)} lang={lang}
            className={`max-w-[90%] cursor-pointer rounded-3xl rounded-br-md border-2 border-solid px-4 py-2.5 text-left font-sans text-base transition-colors duration-150 ${dung ? "border-ok bg-ok text-white" : sai ? "border-danger bg-danger-soft text-ink line-through" : "border-orange-300 bg-surface text-ink hover:bg-orange-50 dark:hover:bg-orange-950/30"}`}>
            {x}
          </button>
        );
      })}
    </div>
  );
}
