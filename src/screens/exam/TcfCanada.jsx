import React from "react";
import { Calculator, Headphones, BookOpen, PenLine, Mic, Puzzle } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { NCLC_TCF, CECRL_TCF_TP } from "../../shared/tcfCanada.js";
import ExamMode from "./ExamMode.jsx";
import { NutCuaSo } from "./FormatDe.jsx";

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
const khoang = (tu, den) => (tu === den ? <strong>{tu}</strong> : <><strong>{tu}</strong><span className="px-1 text-soft">–</span><strong>{den}</strong></>);

const ICON = { CO: Headphones, CE: BookOpen, PE: PenLine, PO: Mic, MS: Puzzle };
const MAU = { CO: "from-sky-500 to-blue-600", CE: "from-emerald-500 to-teal-600", PE: "from-amber-500 to-orange-600", PO: "from-fuchsia-500 to-purple-600", MS: "from-indigo-500 to-violet-600" };

/* Bảng quy đổi (15/11, chủ dự án: bảng cũ đơn điệu). Đầu cột là ô màu theo kỹ năng (cùng màu với
 * Format đề), cột mức là huy hiệu đậm dần theo mức cao, dòng xen kẽ nền để dò ngang dễ. */
function BangQuyDoi({ tenMuc, cot, dong, goiY }) {
  const n = dong.length;
  return (
    <div className="grid gap-3">
      <p className="m-0 text-[13px] text-soft">{goiY}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-separate border-spacing-0 text-left text-[13px] tabular-nums text-ink">
          <thead>
            <tr>
              <th className="px-2 pb-3 text-[11px] font-extrabold uppercase tracking-wide text-soft">{tenMuc}</th>
              {cot.map((c) => (
                <th key={c.nhan} className="px-2 pb-3 font-normal">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex -space-x-1.5">
                      {c.ma.map((m) => { const I = ICON[m]; return <span key={m} className={`grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br ${MAU[m]} text-white ring-2 ring-surface`}><I size={12} /></span>; })}
                    </span>
                    <span className="text-xs font-extrabold">{c.nhan}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dong.map((d, i) => {
              const dam = 1 - (i / Math.max(1, n - 1)) * 0.65;
              return (
                <tr key={d.muc} className={i % 2 ? "" : "[&>td]:bg-surface2"}>
                  <td className="rounded-l-xl px-2 py-2">
                    <span className="inline-grid h-8 min-w-[2.5rem] place-items-center rounded-xl px-2 text-sm font-extrabold"
                      style={{ background: `rgb(var(--mcf-primary-rgb) / ${dam})`, color: dam > 0.55 ? "#fff" : "rgb(var(--mcf-primary-rgb))" }}>{d.muc}</span>
                  </td>
                  {d.gt.map((g, k) => <td key={k} className={`px-2 py-2 ${k === d.gt.length - 1 ? "rounded-r-xl" : ""}`}>{g}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GioiThieuCanada() {
  const ma = ["CO", "CE", "PE", "PO"];
  return (
    <NutCuaSo icon={Calculator} nhan={tr("Quy đổi điểm", "Conversion", "Score table")} phu="NCLC" rong="max-w-2xl"
      tieuDe={tr("Điểm TCF quy ra NCLC thế nào?", "Comment le score TCF devient-il un NCLC ?", "How does a TCF score map to NCLC?")}>
      <BangQuyDoi tenMuc="NCLC"
        goiY={tr("Tìm điểm của bạn trong cột kỹ năng, mức NCLC nằm ở đầu dòng.", "Repérez votre score dans la colonne de l'épreuve : le NCLC est en début de ligne.", "Find your score in the skill column; the NCLC level is at the start of the row.")}
        cot={ma.map((c) => ({ ma: [c], nhan: tenViet(c) }))}
        dong={NCLC_TCF.CO.map(([muc], i) => ({ muc: `${muc}${muc === 10 ? "+" : ""}`, gt: ma.map((c) => { const [, tu, den] = NCLC_TCF[c][i]; return khoang(tu, den); }) }))} />
    </NutCuaSo>
  );
}

function GioiThieuPhap() {
  return (
    <NutCuaSo icon={Calculator} nhan={tr("Quy đổi điểm", "Conversion", "Score table")} phu="CECRL" rong="max-w-xl"
      tieuDe={tr("Điểm TCF quy ra trình độ thế nào?", "Comment le score TCF devient-il un niveau ?", "How does a TCF score map to a level?")}>
      <BangQuyDoi tenMuc={tr("Trình độ", "Niveau", "Level")}
        goiY={tr("Tìm điểm của bạn trong cột tương ứng, trình độ nằm ở đầu dòng.", "Repérez votre score dans la bonne colonne : le niveau est en début de ligne.", "Find your score in the matching column; the level is at the start of the row.")}
        cot={[{ ma: ["CO", "MS", "CE"], nhan: tr("Nghe, Cấu trúc, Đọc", "Écoute, structures, lecture", "Listening, structures, reading") }, { ma: ["PE", "PO"], nhan: tr("Viết, Nói", "Écrit, oral", "Writing, speaking") }]}
        dong={CECRL_TCF_TP.QCM.map(([muc, tu, den], i) => { const [, tuN, denN] = CECRL_TCF_TP.NOTE[i]; return { muc, gt: [khoang(tu, den), khoang(tuN, denN)] }; })} />
    </NutCuaSo>
  );
}

export function TcfPhap({ name }) {
  return <ExamMode name={name} loai="tcf_tp" gioiThieu={<GioiThieuPhap />} />;
}

export default function TcfCanada({ name }) {
  return <ExamMode name={name} loai="tcf" gioiThieu={<GioiThieuCanada />} />;
}
