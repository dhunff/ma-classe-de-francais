import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Award, ArrowRight, Sparkles } from "lucide-react";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import { Leon, leonVai } from "../../../shared/leon.jsx";
import { UY_TIN_DAU } from "./luat.js";

/* Màn công bố hạng khi đóng hồ sơ (31/10). Thứ tự: hồ sơ vào → số chạy → dấu đập xuống → pháo giấy →
   thành tích và nút. Bấm vào đâu cũng tua tới cuối; máy bật giảm chuyển động thì hiện ngay kết quả. */
const KIEU = {
  S: { a: "#fbbf24", b: "#b45309", muc: "#92400e", cam: "tuyet-voi", so: 170, mau: ["#fbbf24", "#fde68a", "#f59e0b", "#fff7d6", "#ef4444"] },
  A: { a: "#7dd3fc", b: "#1d4ed8", muc: "#1e40af", cam: "yeah", so: 90, mau: ["#7dd3fc", "#bae6fd", "#60a5fa", "#e0f2fe"] },
  B: { a: "#d6a06a", b: "#7c4a21", muc: "#7c4a21", cam: "hum", so: 32, mau: ["#d6a06a", "#e7c9a5", "#a8703f"] },
};
const LOI = () => ({
  S: [tr("Phá án hoàn hảo", "Enquête parfaite", "Perfect investigation"), tr("Không một sai sót. Trợ lý giỏi nhất Paris là đây!", "Pas une erreur. Le meilleur assistant de Paris, c'est vous !", "Not a single mistake. Paris's finest assistant!")],
  A: [tr("Phá án xuất sắc", "Excellente enquête", "Excellent investigation"), tr("Chỉ một lần vấp. Léon rất hài lòng.", "Un seul faux pas. Léon est ravi.", "Just one slip. Léon is delighted.")],
  B: [tr("Vụ án đã khép lại", "Affaire classée", "Case closed"), tr("Phá được rồi, nhưng lần sau hồ sơ phải chắc tay hơn.", "C'est résolu, mais le dossier peut être plus solide.", "Solved, but the file can be stronger next time.")],
});
const giamChuyenDong = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function PhaoGiay({ so, mau, lan }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, x = c?.getContext("2d");
    if (!x) return undefined;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr; x.scale(dpr, dpr);
    const tao = (n, y0) => Array.from({ length: n }, () => {
      const goc = Math.random() * Math.PI * 2, toc = 4 + Math.random() * 11;
      return { x: W / 2, y: y0, vx: Math.cos(goc) * toc, vy: Math.sin(goc) * toc - 5, r: Math.random() * 6.3, vr: -0.2 + Math.random() * 0.4, w: 5 + Math.random() * 7, h: 8 + Math.random() * 9, mau: mau[Math.floor(Math.random() * mau.length)], long: Math.random() < 0.18 };
    });
    let ds = tao(so, H * 0.34), f, t0 = performance.now(), doi = lan > 1;
    const ve = (t) => {
      const tuoi = (t - t0) / 1000;
      if (doi && tuoi > 0.45) { ds = ds.concat(tao(Math.round(so * 0.6), H * 0.26)); doi = false; }
      x.clearRect(0, 0, W, H);
      x.globalAlpha = Math.max(0, Math.min(1, 4.6 - tuoi));
      for (const p of ds) {
        p.vy += 0.16; p.vx *= 0.99; p.vy *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.mau;
        if (p.long) { x.beginPath(); x.ellipse(0, 0, 3.5, 11, 0, 0, 6.3); x.fill(); x.strokeStyle = "rgba(0,0,0,.25)"; x.beginPath(); x.moveTo(0, -11); x.lineTo(0, 11); x.stroke(); }
        else x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(t / 180 + p.r)));
        x.restore();
      }
      if (tuoi < 4.8) f = requestAnimationFrame(ve);
    };
    f = requestAnimationFrame(ve);
    return () => cancelAnimationFrame(f);
  }, [so, mau, lan]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-10 h-full w-full" />;
}

function SoChay({ den, chay }) {
  const [v, setV] = useState(chay ? 0 : den);
  useEffect(() => {
    if (!chay) { setV(den); return undefined; }
    const t0 = Date.now();
    const t = setInterval(() => {
      const k = Math.min(1, (Date.now() - t0) / 850);
      setV(Math.round(den * (1 - (1 - k) ** 3)));
      if (k >= 1) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [den, chay]);
  return <>{v}</>;
}

export default function ManHang({ vu, hang, diem, sai, uy, soNoi, moi, kyLuc, onTiep }) {
  const [b, setB] = useState(() => (giamChuyenDong() ? 3 : 0));   // 0 hồ sơ · 1 số · 2 dấu · 3 xong
  const [ban, setBan] = useState(false);
  const K = KIEU[hang] ?? KIEU.B, [tieu, loi] = LOI()[hang] ?? LOI().B;
  const hen = useRef([]);
  useEffect(() => {
    if (giamChuyenDong()) return undefined;
    phat("lat");
    hen.current = [setTimeout(() => setB(1), 550), setTimeout(() => { setB(2); phat(hang === "S" ? "combo" : "sao"); }, 1650), setTimeout(() => setB(3), 2500)];
    return () => hen.current.forEach(clearTimeout);
  }, [hang]);
  const tua = () => { if (b < 3) { hen.current.forEach(clearTimeout); setB(3); } };
  const dong = [
    [tr("Điểm", "Points", "Score"), <SoChay key="d" den={diem} chay={b === 1} />],
    [tr("Địa điểm đã đến", "Lieux visités", "Places visited"), `${soNoi}/${vu.canh.length}`],
    [tr("Sai sót", "Erreurs", "Mistakes"), sai],
  ];
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${tr("Hạng", "Rang", "Rank")} ${hang}`} onClick={tua} className="fixed inset-0 z-[85] grid place-items-center overflow-y-auto bg-[#0f0b08]/85 p-4 font-sans" style={{ "--hang-a": K.a, "--hang-b": K.b, "--hang-muc": K.muc }}>
      {b >= 2 && <span aria-hidden className="mcf-hang-tia pointer-events-none fixed left-1/2 top-[38%] h-[170vmax] w-[170vmax]" />}
      {b >= 2 && !giamChuyenDong() && <PhaoGiay so={K.so} mau={K.mau} lan={hang === "S" ? 2 : 1} />}
      <div className={`mcf-hang-the relative z-[5] w-full max-w-md ${b === 2 ? "mcf-hang-rung" : ""}`}>
        <span className="relative ml-6 inline-block rounded-t-xl bg-[#e8d3a5] px-4 py-1 text-[11px] font-black uppercase tracking-widest text-[#7c5c2e]">{tr("Hồ sơ", "Dossier", "Case")} {vu.so}</span>
        <div className="relative overflow-hidden rounded-2xl rounded-tl-none bg-[#f5ecd7] p-5 text-[#2b2118] shadow-[0_30px_70px_rgba(0,0,0,.6)]">
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(#b89b6a_1px,transparent_1px)] bg-[length:9px_9px] opacity-25" />
          <div className="relative min-h-[6.5rem] pr-28">
            <p lang="fr" className="m-0 text-xl font-black leading-tight">{vu.ten}</p>
            <p className="m-0 mt-0.5 text-sm text-[#6b5435]">{vu.tenVi}</p>
          </div>

          <div className="relative mt-5 grid gap-1.5">
            {dong.map(([ten, gt], k) => (
              <div key={ten} style={{ animationDelay: `${k * 0.12}s` }} className={`flex items-baseline justify-between border-0 border-b border-dotted border-[#b89b6a] pb-1 text-sm ${b >= 1 ? "mcf-hang-dong" : "opacity-0"}`}>
                <span className="text-[#6b5435]">{ten}</span><b className="text-lg font-black tabular-nums">{gt}</b>
              </div>
            ))}
            <div style={{ animationDelay: "0.36s" }} className={`flex items-center justify-between pt-1 text-sm ${b >= 1 ? "mcf-hang-dong" : "opacity-0"}`}>
              <span className="text-[#6b5435]">{tr("Uy tín còn lại", "Réputation restante", "Reputation left")}</span>
              <span className="flex gap-1">{Array.from({ length: UY_TIN_DAU }, (_, k) => <span key={k} className={`grid h-6 w-6 place-items-center rounded-full ${k < uy ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-[#5b3a06]" : "bg-[#d9c9a8] text-[#a8956f]"}`}><Award size={14} /></span>)}</span>
            </div>
          </div>

          {b >= 2 && (
            <div className="mcf-hang-dau absolute right-3 top-3 grid h-28 w-28 place-items-center rounded-full border-[5px] border-double text-[var(--hang-muc)]" style={{ borderColor: "var(--hang-muc)" }}>
              <span className="absolute inset-1.5 rounded-full border-2 border-solid border-current opacity-60" />
              <span className="flex flex-col items-center leading-none">
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{tr("Hạng", "Rang", "Rank")}</span>
                <span className="font-serif text-6xl font-black">{hang}</span>
              </span>
            </div>
          )}

          {b >= 2 && <p className="mcf-hang-tieu relative m-0 mt-4 text-center text-lg font-black" style={{ color: "var(--hang-muc)" }}>{tieu}</p>}
        </div>

        {b >= 3 && <div className="mcf-hang-sau mt-3 grid gap-2">
          <div className="flex items-start gap-3">
            <Leon cam={leonVai("tham-tu", K.cam)} size={60} className="shrink-0" />
            <p className="m-0 rounded-3xl rounded-tl-md bg-[#fef3c7] px-4 py-3 text-sm text-[#2b2118]">{loi}</p>
          </div>
          {kyLuc && <p className="mcf-dong m-0 flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-extrabold text-amber-200"><Sparkles size={16} /> {tr("Kỷ lục mới của vụ này!", "Nouveau record pour cette affaire !", "New record for this case!")}</p>}
          {moi.map((t, k) => <p key={t.ma} style={{ animationDelay: `${0.15 + k * 0.15}s` }} className="mcf-hang-dong m-0 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-200 px-4 py-2 text-sm font-extrabold text-[#2b2118]"><t.Icon size={18} className="shrink-0" />{tr("Thành tích mới: ", "Nouveau succès : ", "New achievement: ")}{t.ten}</p>)}
          <div className="mt-1 text-right">
            <button type="button" disabled={ban} onClick={async (e) => { e.stopPropagation(); setBan(true); await onTiep(); }} className="cursor-pointer rounded-full border-0 bg-amber-400 px-7 py-3 font-sans text-sm font-extrabold text-[#2b2118] disabled:opacity-60">{tr("Tiếp tục", "Continuer", "Continue")} <ArrowRight size={15} className="inline align-[-3px]" /></button>
          </div>
        </div>}
      </div>
    </div>,
    document.body,
  );
}
