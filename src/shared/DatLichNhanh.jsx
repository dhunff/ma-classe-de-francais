import React, { useEffect, useRef, useState } from "react";
import { Map, Dumbbell, Layers, Timer, AudioLines, Swords, Gamepad2, GraduationCap, Mail, Plus, Loader2 } from "lucide-react";
import { tr } from "./i18n.jsx";
import ChonNgay from "./ChonNgay.jsx";
import ChonGio from "./ChonGio.jsx";
import { themLich } from "./lichHoc.js";

/* Biểu mẫu đặt lịch dùng chung (28/10): ô bấm trên lưới Lịch, thẻ « Lịch học » ở trang chủ và
   khoang phải của Lịch đều dùng nó, nên chỉ có MỘT đường ghi (themLich). Mặc định bật « Léon nhắc
   qua mail trước 30 phút ». Hàm MUC_LICH chứ không hằng số: tr() phải chạy lúc dựng. */
export const MUC_LICH = () => [
  { id: "luyen-tap", to: "/etudiant/entrainement", Icon: Dumbbell, nhan: tr("Luyện tập", "Entraînement", "Practice") },
  { id: "ngu-phap", to: "/etudiant/ngu-phap", Icon: GraduationCap, nhan: tr("Ngữ pháp", "Grammaire", "Grammar") },
  { id: "lo-trinh", to: "/etudiant/lo-trinh", Icon: Map, nhan: tr("Lộ trình", "Parcours", "Path") },
  { id: "flashcard", to: "/etudiant/bo-the", Icon: Layers, nhan: "Flashcard" },
  { id: "thi-thu", to: "/etudiant/examen", Icon: Timer, nhan: tr("Thi thử", "Examen blanc", "Mock exam") },
  { id: "nghe-noi", to: "/etudiant/nghe-noi", Icon: AudioLines, nhan: tr("Nghe & Nói", "Écoute & Oral", "Listen & Speak") },
  { id: "tro-choi", to: "/etudiant/tro-choi", Icon: Gamepad2, nhan: tr("Trò chơi", "Jeux", "Games") },
  { id: "thach-dau", to: "/etudiant/thach-dau", Icon: Swords, nhan: tr("Thách đấu", "Défi", "Duel") },
];
export const mucLich = (id) => MUC_LICH().find((x) => x.id === id);

const pad2 = (n) => String(n).padStart(2, "0");
export const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const O = "w-full rounded-xl border-0 bg-surface2 px-3.5 py-2.5 font-sans text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-soft focus:ring-2 focus:ring-primary/40";

/* luc: Date gợi ý ban đầu. gon: bản nhỏ cho ô nổi trên lưới (ẩn ô ngày, chips một hàng cuộn). */
export default function DatLichNhanh({ luc, gon = false, onXong, onLuuBlob, autoFocus = false }) {
  const [muc, setMuc] = useState("luyen-tap");
  const [ghiChu, setGhiChu] = useState("");
  const [ngay, setNgay] = useState(ymd(luc));
  const [gio, setGio] = useState(`${pad2(luc.getHours())}:${pad2(luc.getMinutes())}`);
  const [nhac, setNhac] = useState(true);
  const [tt, setTt] = useState(null);           // null | "gui" | { loi }
  const o = useRef(null);
  useEffect(() => { setNgay(ymd(luc)); setGio(`${pad2(luc.getHours())}:${pad2(luc.getMinutes())}`); }, [luc]);
  useEffect(() => { if (autoFocus) o.current?.focus(); }, [autoFocus]);

  const gui = async (e) => {
    e.preventDefault();
    const [h, m] = gio.split(":").map(Number);
    const d = new Date(`${ngay}T00:00:00`); d.setHours(h || 0, m || 0, 0, 0);
    if (d.getTime() < Date.now() - 60000) { setTt({ loi: tr("Giờ này đã qua rồi, chọn giờ sau nhé.", "Cette heure est passée.", "That time has passed.") }); return; }
    const tieuDe = ghiChu.trim() || mucLich(muc)?.nhan || "";
    setTt("gui");
    const r = await themLich({ tieuDe, muc, luc: d, nhacMail: nhac });
    if (r.lich) { setTt(null); setGhiChu(""); onXong?.(r.lich); return; }
    if (r.chuaCoBang && onLuuBlob) { await onLuuBlob({ tieuDe, muc, luc: d }); setTt(null); setGhiChu(""); onXong?.(null); return; }
    setTt({ loi: r.loi === "qua_nhieu" ? tr("Bạn đã có 100 lịch sắp tới, xoá bớt rồi đặt tiếp nhé.", "Déjà 100 créneaux à venir.", "You already have 100 upcoming sessions.") : tr("Chưa lưu được, thử lại nhé.", "Échec de l'enregistrement.", "Couldn't save, try again.") });
  };

  return (
    <form onSubmit={gui} onKeyDown={(e) => { if (e.key === "Escape") onXong?.(undefined); }} className="flex flex-col gap-2.5">
      <div className={gon ? "no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5" : "grid grid-cols-2 gap-1.5"} role="radiogroup" aria-label={tr("Bạn sẽ học gì?", "Que travaillerez-vous ?", "What will you study?")}>
        {MUC_LICH().map((x) => (
          <button key={x.id} type="button" role="radio" aria-checked={muc === x.id} onClick={() => setMuc(x.id)}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-0 px-2.5 py-2 text-left font-sans text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-95 ${muc === x.id ? "bg-primary text-on-primary" : "bg-surface2 text-ink hover:bg-primary-soft hover:text-primary"}`}>
            <x.Icon size={14} className="shrink-0" /> <span className="truncate">{x.nhan}</span>
          </button>
        ))}
      </div>
      <input ref={o} value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} maxLength={120}
        placeholder={tr("Ghi chú (tuỳ chọn)", "Note (facultatif)", "Note (optional)")} aria-label={tr("Ghi chú", "Note", "Note")} className={O} />
      <div className="flex gap-2">
        <div className="min-w-0 flex-1"><ChonNgay value={ngay} onChange={setNgay} className={O} /></div>
        <div className="w-[104px] shrink-0"><ChonGio value={gio} onChange={setGio} className={O} /></div>
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-surface2 px-3 py-2.5 text-xs font-bold text-ink">
        <input type="checkbox" checked={nhac} onChange={(e) => setNhac(e.target.checked)} className="h-4 w-4 cursor-pointer accent-[rgb(var(--mcf-primary-rgb))]" />
        <Mail size={14} className="shrink-0 text-primary" />
        <span>{tr("Léon nhắc qua mail trước 30 phút", "Rappel de Léon par e-mail 30 min avant", "Léon emails a reminder 30 min before")}</span>
      </label>
      {tt?.loi && <p className="m-0 text-xs font-bold text-danger">{tt.loi}</p>}
      <button type="submit" disabled={tt === "gui"}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary px-4 py-2.5 font-sans text-sm font-bold text-on-primary transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70">
        {tt === "gui" ? <Loader2 size={16} className="mcf-spin" /> : <Plus size={16} />} {tr("Đặt lịch", "Planifier", "Schedule")}
      </button>
    </form>
  );
}
