import React from "react";
import { CheckCircle, Target, Clock } from "lucide-react";
import { StatTile, Ring } from "../dashboard/parts.jsx";
import { studentWorkload, averageScore, isLate } from "../../shared/exercises.js";
import { tr } from "../../shared/i18n.jsx";

/* Số liệu bài được giao (08/10): chuyển từ trang chủ sang đây, vì chúng nói về
   đúng danh sách bên dưới. Cùng công thức như trước (studentWorkload /
   averageScore), nên con số không đổi, chỉ đổi chỗ. */
export default function TongQuanBaiGiao({ exercises, submissions, name, t }) {
  const { assigned, done, todo } = studentWorkload(exercises, submissions, name);
  const avg = averageScore(exercises, submissions, name);
  const overdue = todo.filter((ex) => isLate(ex)).length;
  const pct = assigned.length ? Math.round((done.length / assigned.length) * 100) : 0;
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_220px]">
      <StatTile gradient="indigo" Icon={CheckCircle} label={t("dash.submitted")} value={done.length}
        hint={t("dash.of_assigned", { n: assigned.length })} />
      <StatTile gradient="blue" Icon={Target} label={t("dash.avg_score")} value={avg} unit="%"
        hint={avg === null ? t("dash.avg_empty") : undefined} />
      <StatTile gradient="fuchsia" Icon={Clock} label={t("dash.pending")} value={todo.length}
        hint={overdue ? t("dash.overdue", { n: overdue }) : undefined} />
      <div className="flex items-center gap-4 rounded-3xl bg-surface p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:flex-col lg:justify-center lg:gap-2">
        <Ring pct={pct} label={t("dash.completion")} />
        <div className="lg:text-center">
          <p className="m-0 text-sm font-bold text-ink">{t("dash.completion")}</p>
          <p className="m-0 text-xs text-soft">{assigned.length ? t("dash.of_assigned", { n: assigned.length }) : tr("Chưa có bài nào được giao", "Aucun devoir pour l'instant", "No assignments yet")}</p>
        </div>
      </div>
    </div>
  );
}
