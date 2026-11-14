import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion, animate } from "framer-motion";
import { Download, Share2, Loader2 } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";
import { LUA_NGOAI_DANG, LUA_GIUA_DANG, LUA_LOI_DANG, BANG_DUOI_TRAI, BANG_DUOI_PHAI, BANG_THAN, mocGanNhat, mauCua, loiMung, taoAnhChuoi, luuAnh, chiaSeAnh } from "../../shared/anhChuoi.js";

/* Ăn mừng mốc chuỗi ngày học (14/11, chủ dự án): 3, 10, 30, 100 rồi mỗi 100 ngày (200, 300…).
 * Lớp phủ tối kín màn hình: tia sáng xoay chậm, quầng sáng thở, ngọn lửa BA LỚP (ngoài, giữa, lõi) mỗi
 * lớp lay động lệch nhịp như lửa thật, tàn lửa bay lên, dải băng số ngày đếm lên, lấp lánh, pháo giấy
 * rơi, âm « mungChuoi » nhiều lớp. Nút lưu / chia sẻ ẢNH STORY (anhChuoi.js, 1080 × 1920).
 * Hình vẽ tự dựng bằng SVG (không dùng tài sản của ứng dụng khác).
 *
 * Mỗi mốc chỉ mừng MỘT lần trong một chuỗi, trên mỗi máy (localStorage `mcf-mung-chuoi`): lưu mốc và
 * ngày đã mừng. Chuỗi đứt rồi lên lại mốc cũ thì mừng lại. Chỉ mừng khi vừa qua mốc tối đa 3 ngày. Đây là
 * tiện ích hiển thị, không phải dữ liệu: số chuỗi vẫn do máy chủ tính (get_student_streak). */

export { laMocChuoi, mocGanNhat } from "../../shared/anhChuoi.js";
const KHOA = "mcf-mung-chuoi";
const homNay = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const soNgayTu = (iso) => Math.round((new Date(homNay()) - new Date(iso)) / 86400000);

/** Mốc cần mừng bây giờ (0 = không). */
export function mocCanMung(chuoi) {
  const moc = mocGanNhat(chuoi);
  if (!moc || chuoi - moc > 3) return 0;
  try {
    const cu = JSON.parse(localStorage.getItem(KHOA) || "null");
    if (cu && cu.moc === moc && soNgayTu(cu.ngay) < chuoi) return 0;
  } catch { /* bỏ qua: mừng luôn */ }
  return moc;
}
export function ghiDaMung(moc) {
  try { localStorage.setItem(KHOA, JSON.stringify({ moc, ngay: homNay() })); } catch { /* bỏ qua */ }
}

/* Ngọn lửa ba lớp, BIẾN HÌNH mềm (14/11 lần 3): mỗi lớp uốn qua lại giữa ba dáng (đứng → nghiêng phải →
   đứng → nghiêng trái) bằng cách nội suy đường vẽ `d`, nhịp mỗi lớp lẻ nhau (3,2 / 2,4 / 1,7 giây) nên
   không bao giờ trùng pha. Thêm nhịp « thở » rất nhẹ theo chiều cao ở cả khối. Giảm chuyển động: đứng yên. */
export function NgonLua({ mau, id, dong = true }) {
  const uon = (dang, dai, tre = 0) => (dong
    ? { initial: { d: dang[0] }, animate: { d: [dang[0], dang[1], dang[0], dang[2], dang[0]] }, transition: { duration: dai, delay: tre, repeat: Infinity, ease: "easeInOut" } }
    : { d: dang[0] });
  return (
    <svg viewBox="-20 -20 240 280" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-n`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mau[0]} /><stop offset="0.55" stopColor={mau[1]} /><stop offset="1" stopColor={mau[4]} /></linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0.15" x2="0" y2="1"><stop offset="0" stopColor={mau[2]} stopOpacity="0.95" /><stop offset="1" stopColor={mau[3]} stopOpacity="0.85" /></linearGradient>
        <radialGradient id={`${id}-l`} cx="0.5" cy="0.74" r="0.45"><stop offset="0" stopColor="#ffffff" /><stop offset="0.6" stopColor={mau[2]} stopOpacity="0.85" /><stop offset="1" stopColor={mau[2]} stopOpacity="0.1" /></radialGradient>
        {/* Mép lửa hơi nhoè + quầng sáng: mềm hơn viền cắt sắc. */}
        <filter id={`${id}-sang`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="quang" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="mem" />
          <feMerge><feMergeNode in="quang" /><feMergeNode in="mem" /></feMerge>
        </filter>
        <filter id={`${id}-mem`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4" /></filter>
      </defs>
      <motion.g style={{ transformOrigin: "100px 236px" }}
        animate={dong ? { scaleY: [1, 1.035, 1], scaleX: [1, 0.985, 1] } : undefined}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
        <g filter={`url(#${id}-sang)`}><motion.path fill={`url(#${id}-n)`} {...uon(LUA_NGOAI_DANG, 3.2)} /></g>
        <g filter={`url(#${id}-mem)`}><motion.path fill={`url(#${id}-g)`} {...uon(LUA_GIUA_DANG, 2.4, 0.3)} /></g>
        <g filter={`url(#${id}-mem)`}><motion.path fill={`url(#${id}-l)`} {...uon(LUA_LOI_DANG, 1.7, 0.15)} /></g>
      </motion.g>
    </svg>
  );
}

function DaiBang({ mau, so, id }) {
  return (
    <div className="relative mx-auto -mt-16 w-[300px] max-w-[86vw]">
      <svg viewBox="0 0 300 90" className="w-full" aria-hidden="true">
        <defs><linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mau[0]} /><stop offset="1" stopColor={mau[4]} /></linearGradient></defs>
        <path d={BANG_DUOI_TRAI} fill={mau[4]} opacity="0.9" />
        <path d={BANG_DUOI_PHAI} fill={mau[4]} opacity="0.9" />
        <path d={BANG_THAN} fill={`url(#${id}-b)`} />
      </svg>
      <span className="absolute inset-0 grid place-items-center pb-2 text-[64px] font-black leading-none tabular-nums text-white"
        style={{ WebkitTextStroke: `5px ${mau[4]}`, paintOrder: "stroke fill", textShadow: `0 4px 0 ${mau[4]}, 0 0 24px rgba(255,255,255,0.45)` }}>
        {so}
      </span>
    </div>
  );
}

/* Hai nút lưu / chia sẻ ảnh story. Dùng ở lớp phủ và ở ô chuỗi (StreakWidget). `toi`: nền tối. */
export function NutChiaSeChuoi({ so, ten = "", toi = false, gon = false, trai = false }) {
  const [dang, setDang] = useState("");
  const [bao, setBao] = useState("");
  const lam = async (kieu, e) => {
    e?.stopPropagation();
    if (dang) return;
    setDang(kieu); setBao("");
    try {
      const blob = await taoAnhChuoi(so, ten);
      if (!blob) throw new Error("no blob");
      if (kieu === "luu") { luuAnh(blob, so); setBao(tr("Đã lưu ảnh. Mở Instagram hoặc Facebook để đăng story.", "Image enregistrée. Publiez-la en story.", "Image saved. Post it to your story.")); }
      else {
        const kq = await chiaSeAnh(blob, so);
        if (kq === "da_tai") setBao(tr("Máy này chưa chia sẻ trực tiếp được nên ảnh đã được lưu về. Mở Instagram hoặc Facebook để đăng story.", "Partage direct indisponible : l'image a été enregistrée.", "Direct sharing isn't available: the image was saved."));
      }
    } catch { setBao(tr("Chưa tạo được ảnh, thử lại nhé.", "Impossible de créer l'image.", "Couldn't create the image.")); }
    setDang("");
  };
  const nut = toi
    ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
    : "border-line bg-surface text-ink hover:border-primary hover:text-primary";
  return (
    <div className={gon ? "" : "mt-4"} onClick={(e) => e.stopPropagation()}>
      <div className={`flex flex-wrap gap-2 ${trai ? "justify-start" : "justify-center"}`}>
        <button type="button" onClick={(e) => lam("chia_se", e)} disabled={!!dang}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-solid px-4 py-2 font-sans text-xs font-bold transition-colors disabled:cursor-wait ${nut}`}>
          {dang === "chia_se" ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />} {tr("Chia sẻ story", "Partager en story", "Share to story")}
        </button>
        <button type="button" onClick={(e) => lam("luu", e)} disabled={!!dang}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-solid px-4 py-2 font-sans text-xs font-bold transition-colors disabled:cursor-wait ${nut}`}>
          {dang === "luu" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} {tr("Lưu ảnh", "Enregistrer l'image", "Save image")}
        </button>
      </div>
      {bao && <p className={`m-0 mt-2 text-xs ${trai ? "text-left" : "text-center"} ${toi ? "text-white/90" : "text-soft"}`}>{bao}</p>}
    </div>
  );
}

export default function MungChuoi({ moc, ten = "", onDong }) {
  const giam = useReducedMotion();
  const mau = mauCua(moc);
  const id = `mc${moc}`;
  const [so, setSo] = useState(giam ? moc : 0);
  const manh = useMemo(() => Array.from({ length: 46 }, (_, k) => ({
    k, trai: Math.random() * 100, tre: Math.random() * 1.6, lau: 2.6 + Math.random() * 2.4,
    rong: 6 + Math.random() * 8, xoay: Math.random() * 360, lech: (Math.random() - 0.5) * 120,
    mau: [mau[0], mau[1], mau[3], "#ffffff", mau[2]][k % 5],
  })), [moc]); // eslint-disable-line react-hooks/exhaustive-deps
  /* Tàn lửa bay lên từ ngọn lửa. */
  const tan = useMemo(() => Array.from({ length: 16 }, (_, k) => ({
    k, x: 30 + Math.random() * 160, tre: Math.random() * 2.4, lau: 1.8 + Math.random() * 1.6, r: 3 + Math.random() * 4, lech: (Math.random() - 0.5) * 70,
  })), [moc]);

  useEffect(() => {
    phat("mungChuoi");
    if (giam) return undefined;
    const ctl = animate(0, moc, { duration: Math.min(1.6, 0.6 + moc / 400), delay: 0.5, ease: "easeOut", onUpdate: (v) => setSo(Math.round(v)) });
    return () => ctl.stop();
  }, [moc, giam]);
  useEffect(() => {
    const thoat = (e) => { if (e.key === "Escape") onDong(); };
    window.addEventListener("keydown", thoat);
    return () => window.removeEventListener("keydown", thoat);
  }, [onDong]);

  return createPortal(
    <motion.div role="dialog" aria-modal="true" aria-label={tr(`Chuỗi ${moc} ngày học`, `Série de ${moc} jours`, `${moc}-day streak`)}
      onClick={onDong} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[400] grid cursor-pointer place-items-center overflow-y-auto overflow-x-hidden bg-[#0b0712]/85 backdrop-blur-sm">
      <div aria-hidden className={`pointer-events-none absolute left-1/2 top-[40%] h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-45 ${giam ? "" : "mcf-tia-xoay"}`}
        style={{ background: `repeating-conic-gradient(from 0deg, ${mau[3]}66 0deg 6deg, transparent 6deg 18deg)`, maskImage: "radial-gradient(circle, black 0%, transparent 55%)", WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)" }} />
      <motion.div aria-hidden className="pointer-events-none absolute left-1/2 top-[40%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${mau[1]}cc, ${mau[4]}55 45%, transparent 70%)` }}
        animate={giam ? undefined : { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />

      {!giam && manh.map((m) => (
        <span key={m.k} aria-hidden className="mcf-giay-roi pointer-events-none absolute -top-8 rounded-[2px]"
          style={{ left: `${m.trai}%`, width: m.rong, height: m.rong * 1.6, background: m.mau, animationDelay: `${m.tre}s`, animationDuration: `${m.lau}s`, "--xoay": `${m.xoay}deg`, "--lech": `${m.lech}px` }} />
      ))}

      <div className="relative z-10 flex flex-col items-center px-4 py-8 text-center">
        <motion.div className="relative h-[270px] w-[230px]"
          initial={giam ? false : { scale: 0.15, y: 80, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 170, damping: 11, delay: 0.45 }}>
          <NgonLua mau={mau} id={id} dong={!giam} />
          {!giam && tan.map((t) => (
            <span key={t.k} aria-hidden className="mcf-tan-lua pointer-events-none absolute rounded-full"
              style={{ left: t.x, top: 70, width: t.r, height: t.r, background: t.k % 3 ? mau[0] : "#ffffff", boxShadow: `0 0 10px ${mau[0]}`, animationDelay: `${t.tre}s`, animationDuration: `${t.lau}s`, "--lech": `${t.lech}px` }} />
          ))}
          {[[-34, 70, 24], [222, 118, 18], [204, 24, 12], [-14, 196, 14]].map(([x, y, c], k) => (
            <motion.svg key={k} viewBox="0 0 24 24" width={c} height={c} aria-hidden className="absolute" style={{ left: x, top: y }}
              initial={{ scale: 0, opacity: 0 }} animate={giam ? { scale: 1, opacity: 1 } : { scale: [0, 1.2, 0.9, 1.1], opacity: [0, 1, 0.7, 1] }}
              transition={{ duration: 1.8, delay: 0.9 + k * 0.2, repeat: giam ? 0 : Infinity, repeatType: "reverse" }}>
              <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill={k % 2 ? "#ffffff" : mau[0]} />
            </motion.svg>
          ))}
        </motion.div>

        <motion.div initial={giam ? false : { scale: 0.6, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.7 }}>
          <DaiBang mau={mau} so={so} id={id} />
        </motion.div>

        <motion.div initial={giam ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.4 }}>
          <p className="m-0 mt-4 text-2xl font-extrabold text-white">{tr(`Chuỗi ${moc} ngày học!`, `${moc} jours d'affilée !`, `${moc}-day streak!`)}</p>
          <p className="m-0 mt-1 max-w-sm text-sm text-white/80">{loiMung(moc)}</p>
          <NutChiaSeChuoi so={moc} ten={ten} toi />
          <button type="button" onClick={(e) => { e.stopPropagation(); onDong(); }}
            className="mt-5 cursor-pointer rounded-full border-0 px-8 py-3 font-sans text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${mau[1]}, ${mau[4]})` }}>
            {tr("Tiếp tục giữ lửa", "Garder la flamme", "Keep the flame going")}
          </button>
        </motion.div>
      </div>
    </motion.div>,
    document.body,
  );
}
