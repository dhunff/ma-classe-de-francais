import React, { useRef, useState } from "react";
import { Headphones, Check, RotateCcw } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Audio RIÊNG của một câu ở bài luyện (16/11, Luyện thi TCF): như đề TCF trên máy, mỗi câu một
 * đoạn nghe và chỉ nghe MỘT lần. Đây là bài luyện nên luật mềm hơn phòng thi:
 *   · trước khi nộp: một lượt, không tua, không dừng;
 *   · nộp rồi (`moLai`): nghe lại bao nhiêu lần cũng được, có thanh tua, để đối chiếu lời giải.
 * Lượt chỉ đếm ở giao diện (tải lại trang là nghe lại được): máy chủ không chặn ở bài luyện. */
export default function NgheMotLan({ src, moLai = false, mau }) {
  const ref = useRef(null);
  const [tt, setTt] = useState("chua"); // "chua" | "dang" | "xong"
  if (moLai) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-surface2 px-3 py-2">
        <RotateCcw size={15} className="shrink-0 text-soft" />
        <span className="shrink-0 text-xs font-bold text-soft">{tr("Nghe lại", "Réécouter", "Listen again")}</span>
        <audio src={src} controls preload="none" className="h-8 min-w-0 flex-1" />
      </div>
    );
  }
  const phat = () => {
    const a = ref.current;
    if (!a || tt !== "chua") return;
    a.play().then(() => setTt("dang")).catch(() => setTt("chua"));
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <audio ref={ref} src={src} preload="auto" onEnded={() => setTt("xong")} onError={() => setTt("chua")} />
      <button type="button" onClick={phat} disabled={tt !== "chua"}
        className={`inline-flex items-center gap-2 rounded-2xl border-0 px-4 py-2.5 font-sans text-sm font-extrabold transition-colors ${tt === "chua" ? "cursor-pointer text-white hover:brightness-110" : "cursor-default bg-surface2 text-soft"}`}
        style={tt === "chua" ? { background: mau } : undefined}>
        {tt === "xong" ? <Check size={16} /> : <Headphones size={16} className={tt === "dang" ? "animate-pulse" : ""} />}
        {tt === "chua" ? tr("Nghe (1 lần)", "Écouter (1 fois)", "Listen (once)") : tt === "dang" ? tr("Đang phát…", "Lecture…", "Playing…") : tr("Đã nghe", "Écouté", "Played")}
      </button>
      {tt === "chua" && <span className="text-xs font-semibold text-soft">{tr("Như đề TCF: chỉ nghe một lần. Nộp bài xong được nghe lại.", "Comme au TCF : une seule écoute. Réécoute possible après correction.", "Like the TCF: one listening only. You can replay after checking.")}</span>}
    </div>
  );
}
