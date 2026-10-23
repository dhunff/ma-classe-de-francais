import React from "react";
import { PenLine, CheckCircle2, XCircle } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Ô gõ câu trả lời (câu điền / chia động từ / trả lời ngắn), làm lại 23/10:
   trải hết ngang thẻ, biểu tượng bút bên trái, viền sáng khi gõ, đổi màu khi
   đã chấm (dung = true / false; null là chưa chấm). */
export default function OTraLoi({ value, onChange, disabled, dung = null }) {
  const daCham = dung !== null;
  const vien = !daCham ? "border-line focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
    : dung ? "border-ok bg-ok-soft" : "border-danger bg-danger-soft";
  return (
    <label className={`flex w-full items-center gap-3 rounded-2xl border-2 border-solid bg-surface2 px-4 py-1 transition-all ${vien}`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${!daCham ? "bg-primary-soft text-primary" : dung ? "bg-ok text-white" : "bg-danger text-white"}`}>
        {!daCham ? <PenLine size={16} /> : dung ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      </span>
      <input lang="fr" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} autoComplete="off" spellCheck={false}
        placeholder={tr("Gõ câu trả lời của bạn…", "Tape ta réponse…", "Type your answer…")}
        className={`min-w-0 flex-1 border-0 bg-transparent py-2.5 font-sans text-[15px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-soft ${daCham && !dung ? "line-through" : ""}`} />
    </label>
  );
}
