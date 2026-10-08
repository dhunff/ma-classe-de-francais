import React, { useEffect, useMemo, useState } from "react";
import { Headphones, BookOpen, PenLine, Mic, Clock, Trophy, Target, Hourglass } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";

/* Thành phần hiển thị kết quả thi thử (09/10) — dùng chung cho màn ngay sau
 * khi nộp (ExamMode/KetQua) và trang « Kết quả thi » (ExamResults).
 *
 * Chỉ VẼ số liệu được đưa vào; không tự tính điểm hay kết luận. Kết luận
 * (passed: true | false | null) vẫn do verdict() quyết định ở nơi gọi. */

export const ICON_PHAN = { CO: Headphones, CE: BookOpen, PE: PenLine, PO: Mic };
export const MAU_PHAN = {
  CO: ["from-sky-500 to-blue-600", "#3b82f6"],
  CE: ["from-emerald-500 to-teal-600", "#10b981"],
  PE: ["from-amber-500 to-orange-600", "#f59e0b"],
  PO: ["from-fuchsia-500 to-purple-600", "#a855f7"],
};

/* Số đếm dần tới giá trị thật. Tắt khi người dùng bật giảm chuyển động. */
export function useDemLen(dich, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const n = Number(dich) || 0;
    const giam = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (giam || !n) { setV(n); return undefined; }
    const t0 = performance.now();
    let id;
    const buoc = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(n * (1 - Math.pow(1 - p, 3)) * 10) / 10);
      if (p < 1) id = requestAnimationFrame(buoc);
    };
    id = requestAnimationFrame(buoc);
    return () => cancelAnimationFrame(id);
  }, [dich, ms]);
  return v;
}

/* Vòng điểm tự vẽ. */
export function VongDiem({ diem, toiDa, passed, size = 168 }) {
  const so = useDemLen(diem);
  const r = (size - 18) / 2;
  const cv = 2 * Math.PI * r;
  const tl = toiDa ? Math.max(0, Math.min(1, diem / toiDa)) : 0;
  const mau = passed === true ? "#22c55e" : passed === false ? "#ef4444" : "#f59e0b";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="12" className="stroke-white/25" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="12" strokeLinecap="round" stroke={mau}
          strokeDasharray={cv} strokeDashoffset={cv * (1 - tl)}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)", filter: `drop-shadow(0 0 6px ${mau}88)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold tabular-nums leading-none">{so}</span>
        <span className="mt-1 text-sm font-bold opacity-75">/ {toiDa}</span>
      </div>
    </div>
  );
}

/* Băng kết luận lớn: vòng điểm + Leon + chữ Đạt/Chưa đạt/Chưa kết luận. */
export function BangKetLuan({ tieuDe, phu, diem, toiDa, passed, children }) {
  const nen = passed === true ? "from-emerald-500 via-green-500 to-teal-600"
    : passed === false ? "from-rose-500 via-red-500 to-orange-500"
      : "from-amber-400 via-orange-400 to-amber-500";
  const cam = passed === true ? "yeah" : passed === false ? "co-len" : "suy-nghi";
  const chu = passed === true ? tr("Đạt", "Réussi", "Pass") : passed === false ? tr("Chưa đạt", "Non réussi", "Not passed") : tr("Chưa kết luận", "Non conclu", "Pending");
  const Icon = passed === true ? Trophy : passed === false ? Target : Hourglass;
  return (
    <section className={`mcf-cau-vao relative overflow-hidden rounded-3xl bg-gradient-to-br ${nen} p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]`}>
      <span aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-wrap items-center gap-5">
        <VongDiem diem={diem} toiDa={toiDa} passed={passed} />
        <div className="min-w-0 flex-1">
          {tieuDe && <p className="m-0 text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">{tieuDe}</p>}
          <p className="m-0 mt-1 inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight"><Icon size={28} />{chu}</p>
          {phu && <p className="m-0 mt-1 text-sm text-white/85">{phu}</p>}
          {children}
        </div>
        <Leon cam={cam} size={120} className="mcf-nay shrink-0 drop-shadow-[0_12px_18px_rgba(0,0,0,0.25)] max-sm:hidden" />
      </div>
    </section>
  );
}

/* Thanh điểm một phần, có vạch ngưỡng loại (nguong). */
export function ThanhPhan({ code, label, phu, score, points, nguong, choCham, tre = 0, children }) {
  const Icon = ICON_PHAN[code] ?? BookOpen;
  const [nenIcon, mau] = MAU_PHAN[code] ?? ["from-slate-500 to-slate-600", "#64748b"];
  const yeu = score != null && nguong != null && score < nguong;
  const tl = score != null && points ? Math.max(0, Math.min(1, score / points)) : 0;
  const [rong, setRong] = useState(0);
  useEffect(() => { const h = setTimeout(() => setRong(tl), 120 + tre); return () => clearTimeout(h); }, [tl, tre]);
  const so = useDemLen(score ?? 0, 800);
  return (
    <div className={`mcf-cau-vao rounded-2xl border-2 border-solid p-4 ${yeu ? "border-danger/50 bg-danger-soft" : "border-line bg-surface"}`}
      style={{ animationDelay: `${tre}ms` }}>
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${nenIcon} text-white shadow-md`}><Icon size={20} /></span>
        <div className="min-w-0 flex-1">
          <p className="m-0 flex items-baseline gap-2"><span className="text-base font-extrabold text-ink">{code}</span>{label && <span className="truncate text-xs text-soft">{label}</span>}</p>
          {phu && <p className="m-0 truncate text-xs text-soft">{phu}</p>}
        </div>
        <span className="shrink-0 text-right">
          {score == null
            ? <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-1 text-xs font-bold text-warn"><Clock size={12} />{choCham ?? tr("chưa chấm", "non noté", "not graded")}</span>
            : <span className="text-2xl font-extrabold tabular-nums text-ink">{so}<span className="text-sm text-soft">/{points}</span></span>}
        </span>
      </div>
      {points > 0 && (
        <div className="relative mt-3 h-2.5 rounded-full bg-surface2">
          <div className={`h-full rounded-full transition-[width] duration-1000 ease-out ${yeu ? "bg-danger" : ""}`} style={{ width: `${rong * 100}%`, ...(yeu ? {} : { background: mau }) }} />
          {nguong != null && (
            <span className="absolute -top-1 w-0.5 rounded bg-ink/40" style={{ left: `${(nguong / points) * 100}%`, height: 18 }}
              title={tr(`Ngưỡng loại ${nguong}/${points}`, `Seuil éliminatoire ${nguong}/${points}`, `Minimum ${nguong}/${points}`)} />
          )}
        </div>
      )}
      {yeu && (
        <p className="m-0 mt-2 text-xs font-bold text-danger">
          {tr("Dưới", "Moins de", "Below")} {nguong}/{points} {tr("— riêng phần này đã đủ làm trượt cả bài.", "— cette partie suffit à faire échouer l'examen.", "— this part alone fails the exam.")}
        </p>
      )}
      {children}
    </div>
  );
}

/* Pháo giấy cho kết quả đạt. */
export function PhaoGiayLon() {
  const mau = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#a855f7", "#06b6d4", "#fde047"];
  const manh = useMemo(() => Array.from({ length: 34 }, (_, k) => {
    const goc = (k / 34) * Math.PI * 2 + Math.random() * 0.3;
    const xa = 120 + Math.random() * 160;
    return { k, c: mau[k % mau.length], dx: `${Math.cos(goc) * xa}px`, dy: `${Math.sin(goc) * xa - 40}px`, r: `${Math.random() * 720 - 360}deg` };
  }), []);
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 z-10">
      {manh.map((m) => <span key={m.k} className="mcf-phao absolute h-3 w-2 rounded-[2px]" style={{ background: m.c, "--dx": m.dx, "--dy": m.dy, "--r": m.r }} />)}
    </span>
  );
}
