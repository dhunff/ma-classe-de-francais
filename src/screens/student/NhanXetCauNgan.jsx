import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, MessageSquareText } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Nhận xét AI cho câu trả lời ngắn (loại `court`, phần Đọc C1, lô 43) ở trang Kết quả thi.
 * Dữ liệu do Edge Function `grade` ghi vào answers (score, max_score, feedback JSON) lúc nộp
 * bài; điểm đã nằm trong điểm phần Đọc, ở đây chỉ HIỆN lại: câu hỏi, bài làm, điểm, nhận xét,
 * đáp án mẫu. Mặc định thu gọn để thẻ kết quả không dài ra. */

const so = (x) => String(x).replace(".", ",");

function MotCau({ c }) {
  const du = c.score != null && c.max != null && c.score >= c.max;
  const khong = c.score === 0;
  const mau = du ? "bg-ok-soft text-ok" : khong ? "bg-danger-soft text-danger" : "bg-warn-soft text-warn";
  return (
    <li className="grid gap-2 rounded-xl border border-solid border-line bg-surface p-3">
      <div className="flex items-start gap-3">
        <p lang="fr" className="m-0 min-w-0 flex-1 text-[13px] font-bold leading-snug text-ink">
          {c.ord != null && <span className="text-soft">{c.ord}. </span>}{c.prompt}
        </p>
        {c.score != null && c.max != null && (
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-extrabold tabular-nums ${mau}`}>{so(c.score)}/{so(c.max)}</span>
        )}
      </div>
      <p className="m-0 text-xs text-soft">
        {tr("Bạn trả lời:", "Votre réponse :", "Your answer:")}{" "}
        {c.raw.trim()
          ? <em lang="fr" className="text-ink">« {c.raw.trim()} »</em>
          : <span className="italic">{tr("(bỏ trống)", "(sans réponse)", "(blank)")}</span>}
      </p>
      {c.nhanXet && (
        <p className="m-0 flex items-start gap-2 rounded-lg bg-primary-soft px-2.5 py-2 text-xs leading-relaxed text-ink">
          <Sparkles size={13} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <span>{c.nhanXet}</span>
        </p>
      )}
      {c.mau && !du && (
        <p className="m-0 text-xs leading-relaxed text-soft">
          <strong className="text-ink">{tr("Đáp án mẫu:", "Corrigé :", "Model answer:")}</strong>{" "}
          <span lang="fr">{c.mau}</span>
        </p>
      )}
    </li>
  );
}

export default function NhanXetCauNgan({ ds }) {
  const [mo, setMo] = useState(false);
  if (!ds?.length) return null;
  return (
    <div className="mt-2">
      <button type="button" onClick={() => setMo((v) => !v)} aria-expanded={mo}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-surface px-3 py-2.5 text-left font-sans text-xs font-bold text-ink transition hover:bg-primary-soft">
        <MessageSquareText size={13} className="shrink-0 text-primary" aria-hidden="true" />
        {tr("Nhận xét AI cho các câu trả lời ngắn", "Commentaires de l'IA sur les réponses courtes", "AI feedback on short answers")}
        <ChevronDown size={14} className={`ml-auto shrink-0 text-soft transition-transform ${mo ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {mo && (
          <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }} className="m-0 mt-2 grid list-none gap-2 overflow-hidden p-0">
            {ds.map((c) => <MotCau key={c.answerId} c={c} />)}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
