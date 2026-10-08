import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useT, tr } from "./i18n.jsx";

/* Bộ chọn ngày cùng kiểu với lịch nhỏ của thẻ Lịch (09/10) — thay hộp chọn
 * ngày mặc định của trình duyệt (mỗi trình duyệt một kiểu, tiếng Anh, lệch
 * hẳn giao diện).
 *
 *   value / onChange : chuỗi "YYYY-MM-DD" (hoặc "") — giống <input type="date">,
 *   nên thay vào chỗ cũ không phải đổi gì ở phần lưu.
 *   Bấm tên tháng để chuyển sang chọn NĂM (ngày sinh thường lùi nhiều năm).
 *   Tuần bắt đầu thứ Hai, nhãn thứ và tháng lấy từ khoá cal.* như thẻ Lịch. */
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const doc = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const cung = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function ChonNgay({ value, onChange, className = "", min, max, placeholder }) {
  const t = useT();
  const chon = doc(value);
  const [mo, setMo] = useState(false);
  const [thang, setThang] = useState(() => chon ?? new Date());
  const [cheDo, setCheDo] = useState("ngay");   // ngay | nam
  const goc = useRef(null);
  const homNay = new Date();

  useEffect(() => { if (mo) { setThang(chon ?? new Date()); setCheDo("ngay"); } }, [mo]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!mo) return undefined;
    const ngoai = (e) => { if (!goc.current?.contains(e.target)) setMo(false); };
    const esc = (e) => { if (e.key === "Escape") setMo(false); };
    document.addEventListener("mousedown", ngoai); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", ngoai); document.removeEventListener("keydown", esc); };
  }, [mo]);

  const o = useMemo(() => {
    const dau = new Date(thang.getFullYear(), thang.getMonth(), 1);
    const lui = (dau.getDay() + 6) % 7;   // thứ Hai đầu tuần
    return Array.from({ length: 42 }, (_, i) => new Date(dau.getFullYear(), dau.getMonth(), 1 - lui + i));
  }, [thang]);
  const minD = doc(min), maxD = doc(max);
  const ngoaiKhoang = (d) => (minD && d < minD) || (maxD && d > maxD);
  const nam0 = homNay.getFullYear();
  const dsNam = Array.from({ length: 101 }, (_, i) => nam0 + 1 - i);

  const nut = "grid h-7 w-7 cursor-pointer place-items-center rounded-full border-0 bg-white/15 p-0 text-on-primary transition-colors hover:bg-white/25";

  return (
    <div ref={goc} className="relative">
      <button type="button" onClick={() => setMo(!mo)} aria-haspopup="dialog" aria-expanded={mo}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 text-left ${className}`}>
        <span className={chon ? "" : "text-soft"}>
          {chon ? `${pad(chon.getDate())}/${pad(chon.getMonth() + 1)}/${chon.getFullYear()}` : (placeholder ?? tr("Chọn ngày", "Choisir une date", "Pick a date"))}
        </span>
        <CalendarDays size={16} className="shrink-0 text-soft" />
      </button>

      {mo && (
        <div role="dialog" className="absolute left-0 top-full z-50 mt-2 w-72 rounded-3xl bg-primary p-4 shadow-[0_20px_50px_rgb(0,0,0,0.25)]">
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => setCheDo(cheDo === "ngay" ? "nam" : "ngay")}
              className="cursor-pointer rounded-full border-0 bg-transparent px-1 py-0.5 font-sans text-sm font-extrabold text-on-primary hover:bg-white/15">
              {t(`cal.m${thang.getMonth() + 1}`)} {thang.getFullYear()} ▾
            </button>
            {cheDo === "ngay" && (
              <div className="flex items-center gap-1.5">
                <button type="button" className={nut} aria-label={tr("Tháng trước", "Mois précédent", "Previous month")}
                  onClick={() => setThang(new Date(thang.getFullYear(), thang.getMonth() - 1, 1))}><ChevronLeft size={14} /></button>
                <button type="button" className={nut} aria-label={tr("Tháng sau", "Mois suivant", "Next month")}
                  onClick={() => setThang(new Date(thang.getFullYear(), thang.getMonth() + 1, 1))}><ChevronRight size={14} /></button>
              </div>
            )}
          </div>

          {cheDo === "nam" ? (
            <div className="mcf-scroll mt-3 grid max-h-56 grid-cols-4 gap-1.5 overflow-y-auto pr-1">
              {dsNam.map((n) => (
                <button key={n} type="button" onClick={() => { setThang(new Date(n, thang.getMonth(), 1)); setCheDo("ngay"); }}
                  className={`cursor-pointer rounded-full border-0 py-1.5 font-sans text-xs font-bold ${n === thang.getFullYear() ? "bg-surface text-primary" : "bg-transparent text-on-primary hover:bg-white/20"}`}>
                  {n}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <span key={d} className="text-[10px] font-bold uppercase tracking-wide text-on-primary/60">{t(`cal.s${d}`)}</span>
              ))}
              {o.map((d) => {
                const ngoai = d.getMonth() !== thang.getMonth();
                const la = cung(d, chon);
                const khoa = ngoaiKhoang(d);
                return (
                  <button key={ymd(d)} type="button" disabled={khoa}
                    onClick={() => { onChange?.(ymd(d)); setMo(false); }}
                    aria-current={la ? "date" : undefined}
                    className={["mx-auto grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 p-0 font-sans text-xs font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30",
                      la ? "bg-surface text-primary shadow-sm" : ngoai ? "bg-transparent text-on-primary/35" : "bg-transparent text-on-primary hover:bg-white/20",
                      !la && cung(d, homNay) ? "ring-1 ring-inset ring-white/70" : ""].join(" ")}>
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-0 border-t border-solid border-white/20 pt-3">
            <button type="button" onClick={() => { onChange?.(""); setMo(false); }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border-0 bg-transparent px-2 py-1 font-sans text-xs font-bold text-on-primary/80 hover:bg-white/15">
              <X size={12} /> {tr("Xoá", "Effacer", "Clear")}
            </button>
            <button type="button" onClick={() => { if (!ngoaiKhoang(homNay)) { onChange?.(ymd(homNay)); setMo(false); } }}
              className="cursor-pointer rounded-full border-0 bg-surface px-3 py-1 font-sans text-xs font-bold text-primary">
              {tr("Hôm nay", "Aujourd'hui", "Today")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
