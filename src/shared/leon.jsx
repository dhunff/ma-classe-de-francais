import React, { useEffect, useState } from "react";
import { tr } from "./i18n.jsx";

/* Leon (09/10): linh vật FRACILE, bulldog Pháp áo sọc, khăn đỏ.
 *
 * Ảnh ở public/leon/*.webp, cắt từ bảng sticker của chủ dự án (đã bỏ nền và
 * bỏ chữ in sẵn, để nhãn đổi được theo 3 ngôn ngữ). `leon` là dáng đứng,
 * `dau` là phần đầu dùng làm logo và favicon.
 *
 * Nhãn sticker là HÀM: tr() đọc ngôn ngữ lúc gọi, không gọi ở cấp module. */
export const STICKER = [
  ["chao", () => tr("Chào nhé!", "Coucou !", "Hi there!")],
  ["nhay-mat", () => tr("Nháy mắt", "Clin d'œil", "Wink")],
  ["tuyet-voi", () => tr("Tuyệt vời!", "Génial !", "Awesome!")],
  ["duoc-do", () => tr("Được đó!", "Pas mal !", "Nice!")],
  ["yeu-qua", () => tr("Yêu quá!", "Trop mignon !", "Love it!")],
  ["hum", () => tr("Hửm?", "Hein ?", "Huh?")],
  ["suy-nghi", () => tr("Suy nghĩ", "Je réfléchis", "Thinking")],
  ["gian", () => tr("Giận rồi!", "Fâché !", "Grumpy!")],
  ["buon", () => tr("Buồn quá...", "Trop triste…", "So sad…")],
  ["ngac-nhien", () => tr("Ngạc nhiên!", "Surprise !", "Wow!")],
  ["haha", () => tr("Haha!", "Haha !", "Haha!")],
  ["buon-ngu", () => tr("Buồn ngủ", "Dodo", "Sleepy")],
  ["lam-viec", () => tr("Làm việc", "Au travail", "Working")],
  ["hoc", () => tr("Học nhé!", "On révise !", "Study time!")],
  ["co-len", () => tr("Cố lên!", "Courage !", "You got this!")],
  ["tam-biet", () => tr("Tạm biệt!", "Au revoir !", "Bye!")],
  ["xin-loi", () => tr("Xin lỗi", "Pardon", "Sorry")],
  ["yeah", () => tr("Yeah!", "Youpi !", "Yay!")],
  ["ok", () => tr("OK!", "D'accord !", "OK!")],
  ["phap", () => tr("Học tiếng Pháp cùng Fracile!", "Le français avec Fracile !", "French with Fracile!")],
];
const CO = new Set(STICKER.map((s) => s[0]).concat(["leon", "dau"]));
export const nhanSticker = (id) => STICKER.find((s) => s[0] === id)?.[1]() ?? "Leon";

export function Leon({ cam = "leon", size = 64, className = "", alt }) {
  const id = CO.has(cam) ? cam : "leon";
  return (
    <img src={`/leon/${id}.webp`} width={size} height={size} alt={alt ?? (id === "leon" || id === "dau" ? "Leon" : nhanSticker(id))}
      draggable={false} loading="lazy" className={`select-none object-contain ${className}`} style={{ width: size, height: size }} />
  );
}

/* Leon kèm bong bóng lời. */
export function LeonNoi({ cam = "chao", size = 56, children, className = "" }) {
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <Leon cam={cam} size={size} className="shrink-0" />
      <div className="relative min-w-0 rounded-2xl rounded-bl-md bg-primary-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">
        {children}
      </div>
    </div>
  );
}

/* Sticker trong chữ: mã [leon:chao] trong nhận xét của giáo viên hiện thành
   ảnh. Chữ thường giữ nguyên, nên bản cũ không bị ảnh hưởng. */
const MA = /\[leon:([a-z-]+)\]/g;
export const maSticker = (id) => `[leon:${id}]`;
export function ChuCoSticker({ text, size = 72 }) {
  const s = String(text ?? "");
  const phan = [];
  let cuoi = 0, m;
  MA.lastIndex = 0;
  while ((m = MA.exec(s))) {
    if (m.index > cuoi) phan.push(s.slice(cuoi, m.index));
    phan.push(CO.has(m[1]) ? <Leon key={m.index} cam={m[1]} size={size} className="inline-block align-middle" /> : m[0]);
    cuoi = m.index + m[0].length;
  }
  if (cuoi < s.length) phan.push(s.slice(cuoi));
  return <span className="whitespace-pre-line">{phan}</span>;
}

/* Bảng chọn sticker (giáo viên chèn vào nhận xét, học sinh gửi trong Hỏi Leon). */
export function BangSticker({ onChon, className = "" }) {
  return (
    <div className={`grid grid-cols-5 gap-1 ${className}`}>
      {STICKER.map(([id, nhan]) => (
        <button key={id} type="button" onClick={() => onChon(id)} title={nhan()}
          className="grid cursor-pointer place-items-center rounded-xl border-0 bg-transparent p-1 transition-transform hover:-translate-y-0.5 hover:bg-surface2">
          <Leon cam={id} size={44} />
        </button>
      ))}
    </div>
  );
}

/* Chúc mừng sau khi nộp bài: phát sự kiện, <LeonChucMung/> trong App hiện
   Leon vài giây. tiLe = phần câu chấm tự động làm đúng (0..1) hoặc null. */
export const SU_KIEN_LEON = "fracile:leon";
export const leonChucMung = (tiLe) => window.dispatchEvent(new CustomEvent(SU_KIEN_LEON, { detail: { tiLe } }));

export function LeonChucMung() {
  const [tb, setTb] = useState(null);
  useEffect(() => {
    let hen;
    const nghe = (e) => {
      const tl = e.detail?.tiLe;
      const [cam, loi] = tl == null ? ["yeah", tr("Bài đã nộp! Leon chờ kết quả cùng bạn nhé. À bientôt !", "Copie rendue ! Leon attend le résultat avec toi. À bientôt !", "Submitted! Leon will wait for the result with you. À bientôt!")]
        : tl >= 0.8 ? ["tuyet-voi", tr("C'est super ! Bạn làm đúng gần hết rồi!", "C'est super ! Presque tout juste !", "C'est super! Almost everything right!")]
        : tl >= 0.5 ? ["duoc-do", tr("Pas mal ! Xem lại câu sai là lên điểm ngay.", "Pas mal ! Revois les erreurs et ça monte.", "Pas mal! Review your mistakes and you'll climb.")]
        : ["co-len", tr("Allez, courage ! Xem lời giải rồi làm lại nhé, Leon tin bạn.", "Allez, courage ! Regarde la correction et recommence.", "Allez, courage! Check the corrections and try again.")];
      setTb({ cam, loi, k: Date.now() });
      clearTimeout(hen); hen = setTimeout(() => setTb(null), 5000);
    };
    window.addEventListener(SU_KIEN_LEON, nghe);
    return () => { window.removeEventListener(SU_KIEN_LEON, nghe); clearTimeout(hen); };
  }, []);
  if (!tb) return null;
  return (
    <div key={tb.k} role="status" className="mcf-leon-vao fixed bottom-6 left-1/2 z-[60] w-[min(92vw,380px)] -translate-x-1/2 rounded-3xl bg-surface p-3 shadow-[0_20px_50px_rgb(0,0,0,0.2)]">
      <button type="button" onClick={() => setTb(null)} className="w-full cursor-pointer border-0 bg-transparent p-0 text-left font-sans">
        <LeonNoi cam={tb.cam} size={72}><strong>{tb.loi}</strong></LeonNoi>
      </button>
    </div>
  );
}
