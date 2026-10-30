import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, RotateCcw, KeyRound, GraduationCap, Coffee, TrainFront, Heart, Check, Circle, Lock, Sparkles } from "lucide-react";
import { KET_CUC } from "../../../content/troChoi/parisKyUc.js";
import { NHAN_VAT } from "../../../content/troChoi/parisNhanh.js";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import { Leon } from "../../../shared/leon.jsx";
import { AnhKyNiem } from "./KyUc.jsx";
import { hopGiong, ketCuc, nguoiThan } from "./luat.js";

/* Màn kết năm (31/10, giai đoạn 5). Thứ tự: trời tối và tháp Eiffel → pháo hoa, tên kết cục → lá thư,
   ảnh, hồ sơ năm. Bấm vào đâu cũng tua tới cuối; máy bật giảm chuyển động thì hiện ngay. */
const KHOA_KET = "mcf-mot-nam-ket-v1";
const docKet = () => { try { return JSON.parse(localStorage.getItem(KHOA_KET)) || {}; } catch { return {}; } };
const ghiKet = (ma, dat) => {
  const cu = docKet(), moi = cu[ma] == null;
  try { localStorage.setItem(KHOA_KET, JSON.stringify({ ...cu, [ma]: dat ? "dat" : (cu[ma] ?? "do") })); } catch { /* chế độ riêng tư: bỏ qua */ }
  return moi;
};
const HINH = { chia: KeyRound, mu: GraduationCap, ly: Coffee, tau: TrainFront, tim: Heart };
const giamChuyenDong = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function PhaoHoa({ a, b, lan }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, x = c?.getContext("2d");
    if (!x) return undefined;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr; x.scale(dpr, dpr);
    const mau = [a, b, "#ffffff", "#fde68a"];
    let ds = [], da = 0, f, t0 = performance.now();
    const no = () => {
      const px = W * (0.15 + Math.random() * 0.7), py = H * (0.1 + Math.random() * 0.35), m = mau[Math.floor(Math.random() * mau.length)], so = 46 + Math.floor(Math.random() * 28);
      for (let k = 0; k < so; k++) { const goc = (k / so) * 6.283, toc = 1.6 + Math.random() * 3.1; ds.push({ x: px, y: py, vx: Math.cos(goc) * toc, vy: Math.sin(goc) * toc, song: 1, m }); }
    };
    const ve = (t) => {
      const tuoi = (t - t0) / 1000;
      if (da < lan && tuoi > da * 0.62) { no(); da++; if (da % 3 === 1) phat("bam"); }
      x.globalCompositeOperation = "destination-out"; x.fillStyle = "rgba(0,0,0,.2)"; x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = "lighter";
      ds = ds.filter((p) => p.song > 0);
      for (const p of ds) {
        p.vy += 0.032; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy; p.song -= 0.0115;
        x.globalAlpha = Math.max(0, p.song); x.fillStyle = p.m; x.beginPath(); x.arc(p.x, p.y, 1.8, 0, 6.283); x.fill();
      }
      x.globalAlpha = 1;
      if (da < lan || ds.length) f = requestAnimationFrame(ve); else x.clearRect(0, 0, W, H);
    };
    f = requestAnimationFrame(ve);
    return () => cancelAnimationFrame(f);
  }, [a, b, lan]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[1] h-full w-full" />;
}

/* Tháp Eiffel lấp lánh: đốm đặt theo công thức dọc thân tháp. */
const DOM = Array.from({ length: 42 }, (_, k) => {
  const y = 14 + ((k * 61) % 270), rong = y < 116 ? 2 + y * 0.07 : y < 214 ? 10 + (y - 116) * 0.19 : 28 + (y - 214) * 0.17;
  return { y, x: 60 + (((k * 37) % 21) / 10 - 1) * rong, tre: (k * 0.29) % 1.6 };
});
const ThapEiffel = ({ sang }) => (
  <svg viewBox="0 0 120 300" aria-hidden className="mcf-ket-thap pointer-events-none fixed bottom-0 left-1/2 z-0 h-[62vh] -translate-x-1/2">
    <path fill="#0b1020" stroke="#fbbf24" strokeOpacity=".5" strokeWidth=".7" d="M59 0h2l2 46 5 70 8 44h6v8h-6l10 46 14 76H78c-2-26-9-44-18-44s-16 18-18 44H20l14-76 10-46h-6v-8h6l8-44 5-70z" />
    <rect x="48" y="112" width="24" height="4" fill="#fbbf24" fillOpacity=".55" />
    {sang && DOM.map((d, k) => <circle key={k} cx={d.x} cy={d.y} r="1.1" fill="#fff7d6" className="mcf-ket-dom" style={{ animationDelay: `${d.tre}s` }} />)}
  </svg>
);

const nhanDk = (c, s, soNoi) => {
  if (c.chi === "phap") return [tr("Tiếng Pháp", "Français", "French"), `${s.phap}/${c.min}`];
  if (c.chi === "tt") return [tr("Tinh thần", "Moral", "Mood"), `${s.tt}/${c.min}`];
  if (c.chi === "tien") return [tr("Tiền dành dụm", "Économies", "Savings"), `${s.tien}/${c.min} €`];
  if (c.than) return [tr(`Thân với ${NHAN_VAT[c.than].ten}`, `Proche de ${NHAN_VAT[c.than].ten}`, `Close to ${NHAN_VAT[c.than].ten}`), `${s.than[c.than] ?? 0}/${c.min}`];
  if (c.noi) return [tr("Nơi đã tới", "Lieux visités", "Places visited"), `${soNoi}/${c.noi}`];
  if (c.ban) return [tr("Bạn thân (4 tim)", "Amis proches (4 cœurs)", "Close friends (4 hearts)"), `${Object.values(s.than).filter((v) => v >= 4).length}/${c.ban}`];
  return [tr("Thư giới thiệu của giáo sư", "Lettre de recommandation", "Recommendation letter"), ""];
};

export default function ManKet({ s, ky, onLai, onLuu }) {
  const soNoi = ky.noi.length;
  const [kq] = useState(() => ketCuc(s, KET_CUC, soNoi));
  const K = KET_CUC[kq.ma], B = kq.dat ? K.dat : K.do;
  const [moi] = useState(() => ghiKet(kq.ma, kq.dat));
  const [da] = useState(docKet);
  const [b, setB] = useState(() => (giamChuyenDong() ? 2 : 0));   // 0 trời tối · 1 tên kết cục · 2 lá thư và hồ sơ
  const [ban, setBan] = useState(false);
  const hen = useRef([]);
  useEffect(() => {
    if (giamChuyenDong()) return undefined;
    phat("lat");
    hen.current = [setTimeout(() => { setB(1); phat(kq.dat ? "combo" : "sao"); }, 1300), setTimeout(() => setB(2), 3300)];
    return () => hen.current.forEach(clearTimeout);
  }, [kq.dat]);
  const tua = () => { if (b < 2) { hen.current.forEach(clearTimeout); setB(2); } };
  const ban_ = nguoiThan(s, NHAN_VAT), van = B.van.replaceAll("{ban}", ban_).replaceAll("{noi}", soNoi);
  const Icon = HINH[K.hinh], anh = ky.anh.slice(-3);
  const dong = [[tr("Tiếng Pháp", "Français", "French"), s.phap], [tr("Tinh thần", "Moral", "Mood"), s.tt], [tr("Tiền còn lại", "Argent restant", "Money left"), `${s.tien} €`], [tr("Nơi đã tới", "Lieux visités", "Places visited"), soNoi], [tr("Câu trong sổ tay", "Phrases notées", "Lines noted"), ky.cau.length + s.ngu.length], [tr("Ảnh kỷ niệm", "Souvenirs", "Memories"), ky.anh.length]];
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={K.ten} onClick={tua} className="mcf-ket-troi fixed inset-0 z-[85] overflow-y-auto font-sans text-white" style={{ "--ket-a": K.a, "--ket-b": K.b }}>
      <ThapEiffel sang={b >= 1} />
      {b >= 1 && !giamChuyenDong() && <PhaoHoa a={K.a} b={K.b} lan={kq.dat ? 9 : 3} />}
      <div className="relative z-[2] mx-auto flex min-h-full w-full max-w-lg flex-col items-center px-4 py-8">
        <p className="mcf-hang-sau m-0 text-xs font-extrabold uppercase tracking-[0.3em] text-white/75">{tr("Một năm đã qua", "Une année à Paris", "A year in Paris")}</p>
        {b >= 1 && <div className="mcf-ket-ten mt-4 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-solid border-white/70 bg-black/25" style={{ boxShadow: `0 0 34px ${K.a}` }}><Icon size={30} /></span>
          <h2 lang="fr" className="m-0 mt-3 font-serif text-4xl font-black leading-tight" style={{ color: K.a }}>{K.ten}</h2>
          <p className="m-0 mt-1 text-base font-bold">{B.tieu}</p>
          {!kq.dat && <p className="m-0 mt-1 text-xs font-bold text-white/70">{tr("Bản dở dang: còn cơ hội ở năm sau", "Version inachevée : tout reste possible", "Unfinished version: there's always next year")}</p>}
          {moi && <p className="mcf-dong mx-auto mt-2 flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold"><Sparkles size={13} /> {tr("Kết cục mới", "Nouvelle fin", "New ending")}</p>}
        </div>}
        {b >= 2 && <div className="mcf-hang-sau mt-5 grid w-full gap-3">
          <div className="mcf-pl-thu rounded-2xl bg-[#fdf6e3] p-4 text-[#2b2118] shadow-xl">
            <p className="m-0 text-sm leading-relaxed">{van}</p>
            <p lang="fr" className="m-0 mt-3 font-serif text-base font-bold italic text-[#92400e]">« {hopGiong(B.fr, s.gioi)} »</p>
          </div>
          {anh.length > 0 && <div className="grid grid-cols-3 gap-3 px-1">{anh.map((a, k) => <AnhKyNiem key={a.id} a={a} k={k} nho />)}</div>}
          <div className="rounded-2xl bg-[#0b1020]/80 p-4">
            <p className="m-0 text-xs font-extrabold uppercase tracking-widest text-white/75">{tr("Hồ sơ năm của bạn", "Votre bilan", "Your year")}</p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">{dong.map(([t, v]) => <p key={t} className="m-0 flex items-baseline justify-between gap-2 text-xs text-white/85"><span>{t}</span><b className="text-base font-black tabular-nums text-white">{v}</b></p>)}</div>
            <p className="m-0 mt-3 text-xs font-extrabold uppercase tracking-widest text-white/75">{tr("Điều kiện của kết cục này", "Conditions de cette fin", "This ending's conditions")}</p>
            <div className="mt-1.5 grid gap-1">{kq.dk.map((c, k) => { const [t, v] = nhanDk(c, s, soNoi); return <p key={k} className="m-0 flex items-center gap-2 text-sm">{c.dat ? <Check size={15} className="shrink-0 text-emerald-300" /> : <Circle size={13} className="shrink-0 text-white/50" />}<span className="min-w-0 flex-1">{t}</span><b className="tabular-nums">{v}</b></p>; })}</div>
          </div>
          <div className="rounded-2xl bg-[#0b1020]/80 p-4">
            <p className="m-0 text-xs font-extrabold uppercase tracking-widest text-white/75">{tr("Các kết cục", "Les fins", "Endings")}</p>
            <div className="mt-2 grid grid-cols-5 gap-2">{Object.entries(KET_CUC).map(([ma, x]) => {
              const co = da[ma];
              const HinhKet = HINH[x.hinh];
              return <div key={ma} className="text-center">
                <span className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${co === "dat" ? "text-[#2b2118]" : co ? "bg-white/20 text-white" : "bg-black/30 text-white/40"}`} style={co === "dat" ? { background: x.a } : undefined}>{co ? <HinhKet size={19} /> : <Lock size={15} />}</span>
                <span lang="fr" className="mt-1 block text-[10px] font-bold leading-tight text-white/85">{co || !x.an ? x.ten : "???"}</span>
              </div>;
            })}</div>
          </div>
          <div className="flex items-start gap-3"><Leon cam={kq.dat ? "yeu-qua" : "co-len"} size={60} className="shrink-0" /><p className="m-0 rounded-3xl rounded-tl-md bg-[#fef3c7] px-4 py-3 text-sm text-[#2b2118]">{kq.dat ? tr("Ta tự hào về bạn. Paris sẽ nhớ bạn lắm.", "Je suis fier de toi. Paris se souviendra de toi.", "I'm proud of you. Paris will remember you.") : tr("Chưa tới đích không có nghĩa là thua. Thử sống lại một năm khác xem?", "Ne pas arriver au but, ce n'est pas perdre. On revit une année ?", "Not reaching the goal isn't losing. Live another year?")}</p></div>
          <div className="flex flex-wrap justify-end gap-2 pb-2">
            <button type="button" onClick={(e) => { e.stopPropagation(); onLai(); }} className="cursor-pointer rounded-full border-0 bg-white/15 px-6 py-3 font-sans text-sm font-extrabold text-white"><RotateCcw size={14} className="mr-1 inline align-[-2px]" />{tr("Sống lại một năm", "Revivre l'année", "Live it again")}</button>
            <button type="button" disabled={ban} onClick={(e) => { e.stopPropagation(); setBan(true); onLuu(); }} className="cursor-pointer rounded-full border-0 bg-amber-400 px-7 py-3 font-sans text-sm font-extrabold text-[#2b2118] disabled:opacity-60">{tr("Lưu điểm", "Enregistrer", "Save score")} <ArrowRight size={15} className="inline align-[-3px]" /></button>
          </div>
        </div>}
      </div>
    </div>,
    document.body,
  );
}
