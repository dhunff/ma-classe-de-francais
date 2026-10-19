import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Eye, ChevronRight } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { PhanThi } from "../exam/ExamMode.jsx";
import { gomTheoKyNang } from "../exam/examPaper.js";

/* « Xem như học sinh » (19/10, theo chủ dự án): giáo viên mở đề thi thử bằng ĐÚNG màn
 * thi của học sinh (PhanThi), để biết đề trông thế nào: tờ đề, đồng hồ, bài nghe,
 * bài đọc, bốc thăm đề nói.
 *
 * KHÔNG tạo lượt thi, KHÔNG chấm, KHÔNG lưu gì: PhanThi chạy với cờ `xemThu` nên
 * bài nghe đếm lượt tại chỗ và bộ ghi âm phần nói bị tắt. Câu trả lời chỉ nằm trong
 * state, đóng là mất. Bài tập lấy từ kho đề thi giáo viên đã nạp. */
export default function XemDeThu({ exam, kho, dong }) {
  const khoi = gomTheoKyNang((exam.sections ?? []).map((s, i) => ({
    ...s, ord: s.ord ?? i, exercise: kho.find((x) => x.id === s.exercise_id),
  })));
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [xong, setXong] = useState(false);
  const phan = khoi[i];

  return createPortal(
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-bg font-sans">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-0 border-b border-solid border-line bg-surface px-4 py-2.5 shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-3 py-1 text-xs font-extrabold text-warn">
          <Eye size={13} /> {tr("Xem như học sinh: không lưu gì", "Aperçu élève : rien n'est enregistré", "Student preview: nothing is saved")}
        </span>
        <span className="min-w-0 truncate text-sm font-bold text-ink">{exam.title}</span>
        <div className="flex flex-wrap gap-1">
          {khoi.map((k, j) => (
            <button key={k.code} type="button" onClick={() => { setXong(false); setI(j); }}
              className={`cursor-pointer rounded-full border-0 px-3 py-1 font-sans text-xs font-extrabold ${j === i && !xong ? "bg-primary text-white" : "bg-surface2 text-ink hover:bg-primary-soft"}`}>
              {k.code} · {k.exercises.length} {tr("bài", "épr.", "ex.")}
            </button>
          ))}
        </div>
        <button type="button" onClick={dong} aria-label={tr("Đóng", "Fermer", "Close")}
          className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-full border-0 bg-surface2 px-3 py-1.5 font-sans text-xs font-bold text-ink hover:bg-danger-soft hover:text-danger">
          <X size={14} /> {tr("Đóng xem thử", "Fermer", "Close preview")}
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-3 py-6">
        {!khoi.length ? (
          <p className="m-0 rounded-2xl bg-surface2 p-6 text-center text-sm text-soft">{tr("Đề này chưa có bài nào để xem.", "Ce sujet ne contient aucune épreuve.", "This exam has no exercises yet.")}</p>
        ) : xong ? (
          <div className="rounded-2xl bg-surface p-8 text-center">
            <p className="m-0 text-lg font-extrabold text-ink">{tr("Đã xem hết các phần của đề", "Vous avez parcouru tout le sujet", "You've seen the whole exam")}</p>
            <p className="m-0 mt-1 text-sm text-soft">{tr("Học sinh thật sẽ thấy trang kết quả và chấm điểm ở bước này.", "Un élève verrait ici ses résultats.", "A student would see results here.")}</p>
            <button type="button" onClick={dong} className="mt-4 cursor-pointer rounded-full border-0 bg-primary px-5 py-2 font-sans text-sm font-bold text-white">{tr("Đóng", "Fermer", "Close")}</button>
          </div>
        ) : phan.exercises.some((x) => !x) ? (
          <p className="m-0 rounded-2xl bg-danger-soft p-6 text-sm text-danger">{tr("Phần này có bài đã bị xoá khỏi kho đề thi.", "Une épreuve de cette partie a été supprimée.", "An exercise in this part was deleted.")}</p>
        ) : (
          <PhanThi key={`${phan.code}-${i}`} section={phan} attemptId="xem-thu" xemThu examId={`xem-thu-${exam.id ?? "moi"}`}
            answers={answers} setAnswers={setAnswers} onBlur={() => {}}
            onDone={() => { if (i + 1 < khoi.length) setI(i + 1); else setXong(true); }} />
        )}
        {!xong && i + 1 < khoi.length && (
          <button type="button" onClick={() => setI(i + 1)}
            className="mx-auto mt-6 flex cursor-pointer items-center gap-1 rounded-full border-0 bg-surface2 px-4 py-2 font-sans text-sm font-bold text-ink hover:bg-primary-soft">
            {tr("Sang phần tiếp theo", "Partie suivante", "Next part")} ({khoi[i + 1].code}) <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
