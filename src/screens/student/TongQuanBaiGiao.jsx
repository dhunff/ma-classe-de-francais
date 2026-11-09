import React from "react";
import { studentWorkload, averageScore, isLate } from "../../shared/exercises.js";
import { tr } from "../../shared/i18n.jsx";

/* Số liệu bài được giao (08/10): chuyển từ trang chủ sang đây, vì chúng nói về
   đúng danh sách bên dưới. Cùng công thức như trước (studentWorkload /
   averageScore), nên con số không đổi, chỉ đổi chỗ.
   09/11 (chủ dự án: « làm lại cho gọn »): bốn thẻ lớn thành một dải số nằm TRONG khối đầu trang
   (nền xanh, chữ trắng), tiến độ hoàn thành là thanh mảnh thay cho vòng tròn. */
export default function TongQuanBaiGiao({ exercises, submissions, name, t }) {
  const { assigned, done, todo } = studentWorkload(exercises, submissions, name);
  const avg = averageScore(exercises, submissions, name);
  const overdue = todo.filter((ex) => isLate(ex)).length;
  const pct = assigned.length ? Math.round((done.length / assigned.length) * 100) : 0;
  const O = ({ nhan, children, phu }) => (
    <div className="min-w-0 rounded-2xl bg-white/15 px-3 py-2.5 backdrop-blur">
      <p className="m-0 truncate text-[11px] font-bold text-white/80">{nhan}</p>
      <p className="m-0 mt-0.5 text-xl font-extrabold leading-tight tabular-nums">{children}</p>
      {phu && <p className="m-0 truncate text-[11px] text-white/75">{phu}</p>}
    </div>
  );
  return (
    <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <O nhan={t("dash.submitted")}>{done.length}<span className="text-sm font-bold text-white/70">/{assigned.length}</span></O>
      <O nhan={t("dash.avg_score")} phu={avg === null ? t("dash.avg_empty") : null}>{avg === null ? "–" : `${avg}%`}</O>
      <O nhan={t("dash.pending")} phu={overdue ? t("dash.overdue", { n: overdue }) : null}>{todo.length}</O>
      <div className="min-w-0 rounded-2xl bg-white/15 px-3 py-2.5 backdrop-blur">
        <p className="m-0 truncate text-[11px] font-bold text-white/80">{t("dash.completion")}</p>
        <p className="m-0 mt-0.5 text-xl font-extrabold leading-tight tabular-nums">{pct}%</p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/25" title={assigned.length ? t("dash.of_assigned", { n: assigned.length }) : tr("Chưa có bài nào được giao", "Aucun devoir pour l'instant", "No assignments yet")}>
          <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
