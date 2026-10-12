import React, { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { tr } from "./i18n.jsx";

/* Bộ chọn giờ cùng kiểu với ChonNgay (14/10) — thay <input type="time"> mặc
 * định của trình duyệt (khung xám, AM/PM tiếng Anh, lệch hẳn giao diện).
 *
 *   value / onChange : chuỗi "HH:MM" 24 giờ, giống <input type="time">.
 *   Hai cột cuộn: giờ 00–23, phút theo bước `buoc` (mặc định 5). */
const pad = (n) => String(n).padStart(2, "0");

export default function ChonGio({ value, onChange, className = "", buoc = 5 }) {
  const [mo, setMo] = useState(false);
  const goc = useRef(null);
  const cotGio = useRef(null);
  const cotPhut = useRef(null);
  const [h, m] = String(value || "09:00").split(":").map(Number);

  useEffect(() => {
    if (!mo) return undefined;
    const ngoai = (e) => { if (!goc.current?.contains(e.target)) setMo(false); };
    const esc = (e) => { if (e.key === "Escape") setMo(false); };
    document.addEventListener("mousedown", ngoai); document.addEventListener("keydown", esc);
    /* Mở ra thì cuộn tới giờ đang chọn, không bắt người dùng lăn từ 00. */
    /* Đặt scrollTop của CỘT, không dùng scrollIntoView: nó cuộn luôn mọi khung
       cha (cả lưới lịch lẫn trang). */
    requestAnimationFrame(() => {
      for (const cot of [cotGio.current, cotPhut.current]) {
        const el = cot?.querySelector("[data-chon]");
        if (el) cot.scrollTop = el.offsetTop - cot.offsetTop - cot.clientHeight / 2 + el.clientHeight / 2;
      }
    });
    return () => { document.removeEventListener("mousedown", ngoai); document.removeEventListener("keydown", esc); };
  }, [mo]);

  const dat = (gio, phut) => onChange(`${pad(gio)}:${pad(phut)}`);
  const phutDs = Array.from({ length: Math.ceil(60 / buoc) }, (_, i) => i * buoc);
  const o = (chon) => `grid h-9 w-full shrink-0 cursor-pointer place-items-center rounded-xl border-0 p-0 text-sm font-bold tabular-nums transition-colors ${
    chon ? "bg-surface text-primary shadow-sm" : "bg-transparent text-on-primary hover:bg-white/20"}`;

  return (
    <div ref={goc} className="relative">
      <button type="button" onClick={() => setMo(!mo)} aria-haspopup="dialog" aria-expanded={mo}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 text-left ${className}`}>
        <span className="tabular-nums">{pad(h || 0)}:{pad(m || 0)}</span>
        <Clock size={16} className="shrink-0 text-soft" />
      </button>

      {mo && (
        <div role="dialog" aria-label={tr("Chọn giờ", "Choisir l'heure", "Pick a time")}
          className="absolute bottom-full right-0 z-50 mb-2 w-48 rounded-3xl bg-primary p-3 shadow-[0_20px_50px_rgb(0,0,0,0.25)]">
          <div className="grid grid-cols-2 gap-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wide text-on-primary/70">{tr("Giờ", "Heure", "Hour")}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-on-primary/70">{tr("Phút", "Min", "Min")}</span>
            <div ref={cotGio} className="no-scrollbar flex h-56 flex-col gap-1 overflow-y-auto">
              {Array.from({ length: 24 }, (_, g) => (
                <button key={g} type="button" data-chon={g === h ? "" : undefined} className={o(g === h)}
                  onClick={() => dat(g, m || 0)}>{pad(g)}</button>
              ))}
            </div>
            <div ref={cotPhut} className="no-scrollbar flex h-56 flex-col gap-1 overflow-y-auto">
              {phutDs.map((p) => (
                <button key={p} type="button" data-chon={p === m ? "" : undefined} className={o(p === m)}
                  onClick={() => { dat(h || 0, p); setMo(false); }}>{pad(p)}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
