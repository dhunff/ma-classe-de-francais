import React, { useState } from "react";
import { Headphones, BookOpen, PenLine, Mic, Info, ChevronDown } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { BAI_THI_TCF, NCLC_TCF } from "../../shared/tcfCanada.js";
import ExamMode from "./ExamMode.jsx";

/* Thi thử TCF Canada (09/11, theo chủ dự án). Mục « TCF Canada » trong nhóm « Thi thử » ở thanh bên.
 *
 * Dùng lại ExamMode với loai="tcf": đề TCF là đề thi thử thường có level = 'TCF', giáo viên soạn
 * ở trình soạn đề (chọn « TCF Canada »). Trang này chỉ thêm khối giới thiệu: bốn bài thi và bảng
 * quy đổi NCLC (IRCC). Chưa có đề nào thì màn chờ tự nói là đề đang được soạn. */

const ICON = { CO: Headphones, CE: BookOpen, PE: PenLine, PO: Mic };
const MAU = { CO: "from-sky-500 to-blue-600", CE: "from-emerald-500 to-teal-600", PE: "from-amber-500 to-orange-600", PO: "from-fuchsia-500 to-purple-600" };
const tenViet = (code) => ({
  CO: tr("Nghe hiểu", "Écoute", "Listening"),
  CE: tr("Đọc hiểu", "Lecture", "Reading"),
  PE: tr("Viết", "Écrit", "Writing"),
  PO: tr("Nói", "Oral", "Speaking"),
}[code]);
const donVi = (d, n) => ({
  cau: tr(`${n} câu trắc nghiệm`, `${n} questions (QCM)`, `${n} multiple-choice questions`),
  bai: tr(`${n} bài viết`, `${n} tâches`, `${n} tasks`),
  phan: tr(`${n} phần`, `${n} tâches`, `${n} tasks`),
}[d]);

function GioiThieuTCF() {
  const [moBang, setMoBang] = useState(false);
  return (
    <section className="mt-6 grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {BAI_THI_TCF.map((b) => {
          const Icon = ICON[b.code];
          return (
            <div key={b.code} className="relative overflow-hidden rounded-3xl bg-surface p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <span aria-hidden className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${MAU[b.code]} opacity-15`} />
              <div className="relative flex items-center gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${MAU[b.code]} text-white shadow-[0_8px_16px_rgba(15,23,42,0.15)]`}><Icon size={20} /></span>
                <div className="min-w-0">
                  <p lang="fr" className="m-0 truncate text-sm font-extrabold text-ink">{b.ten}</p>
                  <p className="m-0 text-xs text-soft">{tenViet(b.code)}</p>
                </div>
              </div>
              <div className="relative mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
                <span className="rounded-full bg-surface2 px-2.5 py-1 text-ink">{donVi(b.don, b.so)}</span>
                <span className="rounded-full bg-surface2 px-2.5 py-1 text-ink">{b.phut} {tr("phút", "min", "min")}</span>
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-primary">{tr("Điểm", "Score", "Score")} 0 – {b.thang}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl bg-surface p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-5">
        <button type="button" onClick={() => setMoBang((x) => !x)} aria-expanded={moBang}
          className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left font-sans">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><Info size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold text-ink">{tr("Điểm TCF quy ra NCLC thế nào?", "Comment le score TCF devient-il un NCLC ?", "How does a TCF score map to NCLC?")}</span>
            <span className="block text-xs text-soft">{tr("Bảng quy đổi của IRCC, dùng cho hồ sơ định cư Canada", "Tableau d'équivalence d'IRCC pour l'immigration au Canada", "IRCC's equivalency table for Canadian immigration")}</span>
          </span>
          <ChevronDown size={18} className={`shrink-0 text-soft transition-transform ${moBang ? "rotate-180" : ""}`} />
        </button>
        {moBang && (
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-left text-xs tabular-nums">
                <thead>
                  <tr className="text-soft">
                    <th className="px-2 py-2 font-bold">NCLC</th>
                    <th className="px-2 py-2 font-bold">{tenViet("CO")}</th>
                    <th className="px-2 py-2 font-bold">{tenViet("CE")}</th>
                    <th className="px-2 py-2 font-bold">{tenViet("PE")}</th>
                    <th className="px-2 py-2 font-bold">{tenViet("PO")}</th>
                  </tr>
                </thead>
                <tbody>
                  {NCLC_TCF.CO.map(([muc], i) => (
                    <tr key={muc} className="border-0 border-t border-solid border-line">
                      <td className="px-2 py-2 font-extrabold text-ink">{muc}{muc === 10 ? "+" : ""}</td>
                      {["CO", "CE", "PE", "PO"].map((c) => {
                        const [, tu, den] = NCLC_TCF[c][i];
                        return <td key={c} className="px-2 py-2 text-ink">{tu === den ? tu : `${tu} – ${den}`}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="m-0 mt-3 text-xs leading-relaxed text-soft">
              {tr("Nghe và Đọc chấm trên thang 0 đến 699, Viết và Nói trên thang 0 đến 20. Điểm Nghe, Đọc của bài thi thử ở đây là ƯỚC LƯỢNG: câu khó được nhiều điểm hơn câu dễ, vì FEI không công bố cách tính điểm từng câu.",
                "Écoute et lecture sur 699, écrit et oral sur 20. Les scores d'écoute et de lecture de l'examen blanc sont ESTIMÉS : les questions difficiles valent plus, car FEI ne publie pas son barème.",
                "Listening and reading are scored out of 699, writing and speaking out of 20. Mock listening and reading scores here are ESTIMATES: harder questions weigh more, since FEI doesn't publish its scoring.")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function TcfCanada({ name }) {
  return <ExamMode name={name} loai="tcf" gioiThieu={<GioiThieuTCF />} />;
}
