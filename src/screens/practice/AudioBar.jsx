import React, { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";

/* Thanh nghe gọn cho bài CHỈ có audio (07/10).

   Trước đây bài nghe dùng chung bố cục hai cột với bài đọc: khoang trái chỉ có
   một trình phát nhỏ, câu hỏi bị nhốt trong khung cuộn 76vh bên phải, nên vừa
   nghe vừa không đọc trước được hết câu hỏi. Nay trình phát là một dải mỏng
   dính trên đầu, câu hỏi trải hết chiều rộng bên dưới.

   Nút lùi/tiến 5 giây vì người học nghe lại một đoạn nhiều hơn mọi thao tác
   khác; kéo thanh tiến trình trên điện thoại rất khó trúng. Không có nút đổi
   tốc độ, giữ như trình phát cũ (noplaybackrate).

   01/11: dải mang màu kỹ năng, thanh tiến trình là các vạch sóng. Sóng chỉ để nhìn,
   không phải dạng sóng thật của audio; kéo tua vẫn là ô range trong suốt phủ lên trên. */
const fmt = (s) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

const SONG = Array.from({ length: 44 }, (_, i) => Math.round(32 + 30 * Math.abs(Math.sin(i * 0.9)) + 26 * Math.abs(Math.sin(i * 0.37))));

export default function AudioBar({ src, stickyTop = 8, nen = "linear-gradient(135deg,#2563EB,#1E40AF)", dam = "#1D4ED8" }) {
  const ref = useRef(null);
  const [chay, setChay] = useState(false);
  const [t, setT] = useState(0);
  const [dai, setDai] = useState(0);

  useEffect(() => { setChay(false); setT(0); setDai(0); }, [src]);

  const bat = () => { const a = ref.current; if (!a) return; if (a.paused) a.play().catch(() => {}); else a.pause(); };
  const nhay = (d) => { const a = ref.current; if (a) a.currentTime = Math.max(0, Math.min((a.duration || 0), a.currentTime + d)); };

  const nut = "grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white/20 text-white transition-colors hover:bg-white/35";
  const daNghe = dai ? t / dai : 0;

  return (
    <div className="z-20 mb-5 flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2.5 text-white shadow-md sm:flex-nowrap sm:gap-3 sm:px-4"
      style={{ position: "sticky", top: stickyTop, background: nen }}>
      <audio ref={ref} src={src} preload="metadata" onContextMenu={(e) => e.preventDefault()}
        onPlay={() => setChay(true)} onPause={() => setChay(false)} onEnded={() => setChay(false)}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDai(e.currentTarget.duration)} />
      <button type="button" className={nut} onClick={() => nhay(-5)} aria-label="Reculer de 5 secondes"><RotateCcw size={16} /></button>
      <button type="button" onClick={bat} aria-label={chay ? "Pause" : "Lecture"}
        className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white shadow-md transition-transform hover:scale-105 motion-reduce:hover:scale-100" style={{ color: dam }}>
        {chay ? <Pause size={22} className="fill-current" /> : <Play size={22} className="ml-0.5 fill-current" />}
      </button>
      <button type="button" className={nut} onClick={() => nhay(5)} aria-label="Avancer de 5 secondes"><RotateCw size={16} /></button>
      <span className="ml-auto w-9 shrink-0 text-right text-xs font-bold tabular-nums sm:ml-0">{fmt(t)}</span>
      {/* Điện thoại: sóng xuống hàng riêng, chung hàng với ba nút thì chỉ còn vài vạch. */}
      <div className="relative order-last h-9 min-w-0 basis-full rounded-lg focus-within:outline sm:order-none sm:flex-1 sm:basis-0 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white">
        <div aria-hidden className={`flex h-full items-center gap-[2px] overflow-hidden ${chay ? "mcf-song-chay" : ""}`}>
          {SONG.map((cao, i) => (
            <span key={i} className={`min-w-[2px] flex-1 rounded-full ${(i + 0.5) / SONG.length <= daNghe ? "bg-white" : "bg-white/35"}`} style={{ height: `${cao}%`, "--i": i }} />
          ))}
        </div>
        <input type="range" min={0} max={dai || 0} step={0.1} value={Math.min(t, dai || 0)} aria-label="Position"
          onChange={(e) => { const a = ref.current; if (a) a.currentTime = Number(e.target.value); setT(Number(e.target.value)); }}
          className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0" />
      </div>
      <span className="w-9 shrink-0 text-xs font-bold tabular-nums">{fmt(dai)}</span>
    </div>
  );
}
