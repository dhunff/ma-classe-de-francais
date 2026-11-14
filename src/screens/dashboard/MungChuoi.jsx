import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion, animate } from "framer-motion";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";

/* Ăn mừng mốc chuỗi ngày học (14/11, chủ dự án): 3, 10, 30, 100 rồi mỗi 100 ngày (200, 300…).
 * Lớp phủ tối kín màn hình: tia sáng xoay chậm, ngọn lửa lớn bật lên (màu đổi theo mốc), dải băng
 * ghi số ngày đếm lên, lấp lánh, pháo giấy rơi; chạm bất kỳ đâu hoặc bấm nút để đóng.
 * Hình vẽ tự dựng bằng SVG (không dùng tài sản của ứng dụng khác).
 *
 * Mỗi mốc chỉ mừng MỘT lần trong một chuỗi, trên mỗi máy (localStorage `mcf-mung-chuoi`): lưu mốc và
 * ngày đã mừng. Chuỗi đứt rồi lên lại mốc cũ thì mừng lại (ngày mừng cũ cách hôm nay nhiều hơn độ dài
 * chuỗi hiện tại, nghĩa là thuộc chuỗi trước). Chỉ mừng khi vừa qua mốc tối đa 3 ngày, để máy mới mở
 * ở ngày 150 không bật lại mốc 100. Đây là tiện ích hiển thị, không phải dữ liệu: số chuỗi vẫn do
 * máy chủ tính (get_student_streak). */

export const laMocChuoi = (n) => n === 3 || n === 10 || n === 30 || (n >= 100 && n % 100 === 0);
/* Mốc lớn nhất ≤ n. */
export const mocGanNhat = (n) => {
  if (n >= 100) return Math.floor(n / 100) * 100;
  return n >= 30 ? 30 : n >= 10 ? 10 : n >= 3 ? 3 : 0;
};
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

/* Bảng màu theo mốc: [đỉnh lửa, thân, lõi sáng, tia sáng, dải băng]. Màu cố định có chủ đích: đây là
   khoảnh khắc trang trí trên nền tối riêng, không đổi theo sáng/tối như token. */
const BANG_MAU = {
  3: ["#ffb347", "#ff7a1a", "#fff1c1", "#ff9a3c", "#ff6a00"],
  10: ["#ff8a8a", "#f43f5e", "#ffe0e6", "#fb7185", "#e11d48"],
  30: ["#7dd3fc", "#0ea5e9", "#e0f7ff", "#38bdf8", "#0284c7"],
  100: ["#e9a8ff", "#a855f7", "#f6e6ff", "#c084fc", "#9333ea"],
  200: ["#fde68a", "#f59e0b", "#fffbe6", "#fbbf24", "#d97706"],
  300: ["#f9a8d4", "#d946ef", "#ffe4f6", "#f0abfc", "#c026d3"],
};
const mauCua = (moc) => BANG_MAU[moc] ?? (moc >= 400 ? [BANG_MAU[100], BANG_MAU[200], BANG_MAU[30], BANG_MAU[300]][(moc / 100) % 4] : BANG_MAU[3]);

const loiMung = (moc) => moc === 3 ? tr("Khởi đầu rực lửa! Giữ nhịp mỗi ngày nhé.", "Un départ en feu ! Gardez le rythme.", "A blazing start! Keep it daily.")
  : moc === 10 ? tr("10 ngày liền: thói quen đang thành hình.", "10 jours d'affilée : l'habitude s'installe.", "10 days straight: the habit is forming.")
  : moc === 30 ? tr("Một tháng không nghỉ buổi nào, quá đỉnh!", "Un mois sans pause, bravo !", "A whole month without a break!")
  : moc === 100 ? tr("100 ngày! Bạn thuộc nhóm bền bỉ nhất FRACILE.", "100 jours ! Vous faites partie des plus constants.", "100 days! You're among the most consistent.")
  : tr(`${moc} ngày liên tục. Huyền thoại thật sự!`, `${moc} jours d'affilée. Légendaire !`, `${moc} days in a row. Legendary!`);

function NgonLua({ mau, id }) {
  return (
    <svg viewBox="0 0 200 240" className="h-full w-full drop-shadow-[0_0_40px_rgba(255,255,255,0.25)]" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-than`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mau[0]} />
          <stop offset="1" stopColor={mau[1]} />
        </linearGradient>
        <radialGradient id={`${id}-loi`} cx="0.5" cy="0.7" r="0.5">
          <stop offset="0" stopColor={mau[2]} stopOpacity="1" />
          <stop offset="1" stopColor={mau[2]} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Thân lửa: ba lưỡi trên đỉnh, đáy tròn. */}
      <path fill={`url(#${id}-than)`}
        d="M100 6 C110 40 128 56 138 40 C142 62 138 78 132 90 C150 78 162 58 160 36 C182 66 190 102 186 142 C182 198 144 234 100 234 C56 234 18 198 14 142 C11 106 26 78 44 60 C46 82 56 94 68 98 C62 70 74 32 100 6 Z" />
      {/* Lõi sáng. */}
      <path fill={`url(#${id}-loi)`}
        d="M100 92 C112 116 132 132 128 168 C125 196 112 210 100 210 C88 210 75 196 72 168 C69 140 86 124 100 92 Z" />
    </svg>
  );
}

function DaiBang({ mau, so, id }) {
  return (
    <div className="relative mx-auto -mt-16 w-[300px] max-w-[86vw]">
      <svg viewBox="0 0 300 90" className="w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-bang`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={mau[0]} />
            <stop offset="1" stopColor={mau[4]} />
          </linearGradient>
        </defs>
        {/* Hai đuôi băng gấp phía sau. */}
        <path d="M18 30 L60 30 L60 74 L18 74 L32 52 Z" fill={mau[4]} opacity="0.85" />
        <path d="M282 30 L240 30 L240 74 L282 74 L268 52 Z" fill={mau[4]} opacity="0.85" />
        <path d="M48 18 Q150 4 252 18 L252 66 Q150 52 48 66 Z" fill={`url(#${id}-bang)`} />
      </svg>
      <span className="absolute inset-0 grid place-items-center pb-2 text-[64px] font-black leading-none tabular-nums text-white"
        style={{ WebkitTextStroke: `5px ${mau[4]}`, paintOrder: "stroke fill", textShadow: `0 4px 0 ${mau[4]}, 0 0 24px rgba(255,255,255,0.45)` }}>
        {so}
      </span>
    </div>
  );
}

export default function MungChuoi({ moc, onDong }) {
  const giam = useReducedMotion();
  const mau = mauCua(moc);
  const id = `mc${moc}`;
  const [so, setSo] = useState(giam ? moc : 0);
  /* Pháo giấy rơi: vị trí, độ trễ, tốc độ ngẫu nhiên, tính một lần. */
  const manh = useMemo(() => Array.from({ length: 46 }, (_, k) => ({
    k, trai: Math.random() * 100, tre: Math.random() * 1.6, lau: 2.6 + Math.random() * 2.4,
    rong: 6 + Math.random() * 8, xoay: Math.random() * 360, lech: (Math.random() - 0.5) * 120,
    mau: [mau[0], mau[1], mau[3], "#ffffff", mau[2]][k % 5],
  })), [moc]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    phat("thang");
    if (giam) return undefined;
    const ctl = animate(0, moc, { duration: Math.min(1.6, 0.6 + moc / 400), delay: 0.45, ease: "easeOut", onUpdate: (v) => setSo(Math.round(v)) });
    return () => ctl.stop();
  }, [moc, giam]);
  useEffect(() => {
    const thoat = (e) => { if (e.key === "Escape" || e.key === "Enter") onDong(); };
    window.addEventListener("keydown", thoat);
    return () => window.removeEventListener("keydown", thoat);
  }, [onDong]);

  return createPortal(
    <motion.div role="dialog" aria-modal="true" aria-label={tr(`Chuỗi ${moc} ngày học`, `Série de ${moc} jours`, `${moc}-day streak`)}
      onClick={onDong} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[400] grid cursor-pointer place-items-center overflow-hidden bg-black/80 backdrop-blur-sm">
      {/* Tia sáng xoay chậm sau ngọn lửa. */}
      <div aria-hidden className={`pointer-events-none absolute left-1/2 top-[42%] h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-40 ${giam ? "" : "mcf-tia-xoay"}`}
        style={{ background: `repeating-conic-gradient(from 0deg, ${mau[3]}55 0deg 7deg, transparent 7deg 20deg)`, maskImage: "radial-gradient(circle, black 0%, transparent 55%)", WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)" }} />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[42%] h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${mau[1]}aa, transparent 70%)` }} />

      {/* Pháo giấy rơi. */}
      {!giam && manh.map((m) => (
        <span key={m.k} aria-hidden className="mcf-giay-roi pointer-events-none absolute -top-8 rounded-[2px]"
          style={{ left: `${m.trai}%`, width: m.rong, height: m.rong * 1.6, background: m.mau, animationDelay: `${m.tre}s`, animationDuration: `${m.lau}s`, "--xoay": `${m.xoay}deg`, "--lech": `${m.lech}px` }} />
      ))}

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        <motion.div className="relative h-[260px] w-[220px]"
          initial={giam ? false : { scale: 0.2, y: 60, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.1 }}>
          <motion.div className="h-full w-full origin-bottom" animate={giam ? undefined : { scaleY: [1, 1.04, 0.98, 1], scaleX: [1, 0.98, 1.02, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
            <NgonLua mau={mau} id={id} />
          </motion.div>
          {/* Lấp lánh. */}
          {[[-28, 70, 22], [214, 120, 18], [196, 30, 12], [-10, 190, 14]].map(([x, y, c], k) => (
            <motion.svg key={k} viewBox="0 0 24 24" width={c} height={c} aria-hidden className="absolute" style={{ left: x, top: y }}
              initial={{ scale: 0, opacity: 0 }} animate={giam ? { scale: 1, opacity: 1 } : { scale: [0, 1.2, 0.9, 1.1], opacity: [0, 1, 0.7, 1] }}
              transition={{ duration: 1.8, delay: 0.6 + k * 0.2, repeat: giam ? 0 : Infinity, repeatType: "reverse" }}>
              <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill={k % 2 ? "#ffffff" : mau[0]} />
            </motion.svg>
          ))}
        </motion.div>

        <motion.div initial={giam ? false : { scale: 0.6, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.35 }}>
          <DaiBang mau={mau} so={so} id={id} />
        </motion.div>

        <motion.div initial={giam ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.4 }}>
          <p className="m-0 mt-4 text-2xl font-extrabold text-white">{tr(`Chuỗi ${moc} ngày học!`, `${moc} jours d'affilée !`, `${moc}-day streak!`)}</p>
          <p className="m-0 mt-1 max-w-sm text-sm text-white/80">{loiMung(moc)}</p>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDong(); }}
            className="mt-6 cursor-pointer rounded-full border-0 px-8 py-3 font-sans text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${mau[1]}, ${mau[4]})` }}>
            {tr("Tiếp tục giữ lửa", "Garder la flamme", "Keep the flame going")}
          </button>
        </motion.div>
      </div>
    </motion.div>,
    document.body,
  );
}
