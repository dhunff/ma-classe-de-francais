import React from "react";
import { Calculator } from "lucide-react";
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
const khoang = (tu, den) => (tu === den ? tu : `${tu} – ${den}`);

function GioiThieuCanada() {
  return (
    <NutCuaSo icon={Calculator} nhan={tr("Quy đổi điểm", "Conversion", "Score table")} phu="NCLC" rong="max-w-xl"
      tieuDe={tr("Điểm TCF quy ra NCLC thế nào?", "Comment le score TCF devient-il un NCLC ?", "How does a TCF score map to NCLC?")}>
      <div className="overflow-x-auto">
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
      </div>
    </NutCuaSo>
  );
}

function GioiThieuPhap() {
  return (
    <NutCuaSo icon={Calculator} nhan={tr("Quy đổi điểm", "Conversion", "Score table")} phu="CECRL" rong="max-w-xl"
      tieuDe={tr("Điểm TCF quy ra trình độ thế nào?", "Comment le score TCF devient-il un niveau ?", "How does a TCF score map to a level?")}>
      <div className="overflow-x-auto">
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
      </div>
    </NutCuaSo>
  );
}

export function TcfPhap({ name }) {
  return <ExamMode name={name} loai="tcf_tp" gioiThieu={<GioiThieuPhap />} />;
}

export default function TcfCanada({ name }) {
  return <ExamMode name={name} loai="tcf" gioiThieu={<GioiThieuCanada />} />;
}
