import React, { useState } from "react";
import { Info, ChevronDown } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { NCLC_TCF, CECRL_TCF_TP } from "../../shared/tcfCanada.js";
import ExamMode from "./ExamMode.jsx";

/* Thi thử TCF (09/11 Canada, 10/11 tout public, theo chủ dự án). Hai mục « TCF Canada » và
 * « TCF Pháp » trong nhóm « Thi thử » ở thanh bên.
 *
 * Dùng lại ExamMode với loai="tcf" / "tcf_tp": đề TCF là đề thi thử thường có level 'TCF' hoặc
 * 'TCF_TP', giáo viên soạn ở trình soạn đề. Trang này chỉ thêm khối giới thiệu: các bài thi và
 * bảng quy đổi (NCLC của IRCC cho Canada, trình độ CECRL của FEI cho tout public). Chưa có đề nào
 * thì màn chờ tự nói là đề đang được soạn. */

const tenViet = (code) => ({
  CO: tr("Nghe hiểu", "Écoute", "Listening"),
  CE: tr("Đọc hiểu", "Lecture", "Reading"),
  PE: tr("Viết", "Écrit", "Writing"),
  PO: tr("Nói", "Oral", "Speaking"),
  MS: tr("Cấu trúc ngôn ngữ", "Structures", "Language structures"),
}[code]);
const khoang = (tu, den) => (tu === den ? tu : `${tu} – ${den}`);

/* Khối thu gọn chứa bảng quy đổi. */
function BangGap({ tieuDe, children }) {
  const [mo, setMo] = useState(false);
  return (
    <div className="rounded-3xl bg-surface p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-5">
      <button type="button" onClick={() => setMo((x) => !x)} aria-expanded={mo}
        className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left font-sans">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><Info size={18} /></span>
        <span className="min-w-0 flex-1 text-sm font-extrabold text-ink">{tieuDe}</span>
        <ChevronDown size={18} className={`shrink-0 text-soft transition-transform ${mo ? "rotate-180" : ""}`} />
      </button>
      {mo && <div className="mt-4 overflow-x-auto">{children}</div>}
    </div>
  );
}

function GioiThieuCanada() {
  return (
    <section className="mt-4 grid gap-4">
      <BangGap tieuDe={tr("Điểm TCF quy ra NCLC thế nào?", "Comment le score TCF devient-il un NCLC ?", "How does a TCF score map to NCLC?")}>
        <table className="w-full min-w-[30rem] border-collapse text-left text-xs tabular-nums">
          <thead>
            <tr className="text-soft">
              <th className="px-2 py-2 font-bold">NCLC</th>
              {["CO", "CE", "PE", "PO"].map((c) => <th key={c} className="px-2 py-2 font-bold">{tenViet(c)}</th>)}
            </tr>
          </thead>
          <tbody>
            {NCLC_TCF.CO.map(([muc], i) => (
              <tr key={muc} className="border-0 border-t border-solid border-line">
                <td className="px-2 py-2 font-extrabold text-ink">{muc}{muc === 10 ? "+" : ""}</td>
                {["CO", "CE", "PE", "PO"].map((c) => {
                  const [, tu, den] = NCLC_TCF[c][i];
                  return <td key={c} className="px-2 py-2 text-ink">{khoang(tu, den)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </BangGap>
    </section>
  );
}

function GioiThieuPhap() {
  return (
    <section className="mt-4 grid gap-4">
      <BangGap tieuDe={tr("Điểm TCF quy ra trình độ thế nào?", "Comment le score TCF devient-il un niveau ?", "How does a TCF score map to a level?")}>
        <table className="w-full min-w-[22rem] border-collapse text-left text-xs tabular-nums">
          <thead>
            <tr className="text-soft">
              <th className="px-2 py-2 font-bold">{tr("Trình độ", "Niveau", "Level")}</th>
              <th className="px-2 py-2 font-bold">{tr("Nghe, Cấu trúc, Đọc", "Écoute, structures, lecture", "Listening, structures, reading")}</th>
              <th className="px-2 py-2 font-bold">{tr("Viết, Nói", "Écrit, oral", "Writing, speaking")}</th>
            </tr>
          </thead>
          <tbody>
            {CECRL_TCF_TP.QCM.map(([muc, tu, den], i) => {
              const [, tuN, denN] = CECRL_TCF_TP.NOTE[i];
              return (
                <tr key={muc} className="border-0 border-t border-solid border-line">
                  <td className="px-2 py-2 font-extrabold text-ink">{muc}</td>
                  <td className="px-2 py-2 text-ink">{khoang(tu, den)}</td>
                  <td className="px-2 py-2 text-ink">{khoang(tuN, denN)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </BangGap>
    </section>
  );
}

export function TcfPhap({ name }) {
  return <ExamMode name={name} loai="tcf_tp" gioiThieu={<GioiThieuPhap />} />;
}

export default function TcfCanada({ name }) {
  return <ExamMode name={name} loai="tcf" gioiThieu={<GioiThieuCanada />} />;
}
