import React, { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, RotateCcw, RotateCw } from "lucide-react";

/* Thanh nghe gọn cho bài CHỈ có audio (07/10).

   Trước đây bài nghe dùng chung bố cục hai cột với bài đọc: khoang trái chỉ có
   một trình phát nhỏ, câu hỏi bị nhốt trong khung cuộn 76vh bên phải, nên vừa
   nghe vừa không đọc trước được hết câu hỏi. Nay trình phát là một dải mỏng
   dính trên đầu, câu hỏi trải hết chiều rộng bên dưới.

   Nút lùi/tiến 5 giây vì người học nghe lại một đoạn nhiều hơn mọi thao tác
   khác; kéo thanh tiến trình trên điện thoại rất khó trúng. Không có nút đổi
   tốc độ, giữ như trình phát cũ (noplaybackrate). */
const fmt = (s) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

export default function AudioBar({ src, stickyTop = 8 }) {
  const ref = useRef(null);
  const [chay, setChay] = useState(false);
  const [t, setT] = useState(0);
  const [dai, setDai] = useState(0);

  useEffect(() => { setChay(false); setT(0); setDai(0); }, [src]);

  const bat = () => { const a = ref.current; if (!a) return; if (a.paused) a.play().catch(() => {}); else a.pause(); };
  const nhay = (d) => { const a = ref.current; if (a) a.currentTime = Math.max(0, Math.min((a.duration || 0), a.currentTime + d)); };

  const nut = "grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-ink transition-colors hover:bg-primary-soft";

  return (
    <div className="z-20 mb-4 flex items-center gap-2 rounded-2xl border border-solid border-line bg-surface px-3 py-2 shadow-sm sm:gap-3 sm:px-4"
      style={{ position: "sticky", top: stickyTop }}>
      <audio ref={ref} src={src} preload="metadata" onContextMenu={(e) => e.preventDefault()}
        onPlay={() => setChay(true)} onPause={() => setChay(false)} onEnded={() => setChay(false)}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDai(e.currentTarget.duration)} />
      <Headphones size={18} className="hidden shrink-0 text-soft sm:block" />
      <button type="button" className={nut} onClick={() => nhay(-5)} aria-label="Reculer de 5 secondes"><RotateCcw size={16} /></button>
      <button type="button" onClick={bat} aria-label={chay ? "Pause" : "Lecture"}
        className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-primary text-white shadow-sm">
        {chay ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
      </button>
      <button type="button" className={nut} onClick={() => nhay(5)} aria-label="Avancer de 5 secondes"><RotateCw size={16} /></button>
      <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-soft">{fmt(t)}</span>
      <input type="range" min={0} max={dai || 0} step={0.1} value={Math.min(t, dai || 0)} aria-label="Position"
        onChange={(e) => { const a = ref.current; if (a) a.currentTime = Number(e.target.value); setT(Number(e.target.value)); }}
        className="min-w-0 flex-1 cursor-pointer accent-primary" />
      <span className="w-10 shrink-0 text-xs font-bold tabular-nums text-soft">{fmt(dai)}</span>
    </div>
  );
}
