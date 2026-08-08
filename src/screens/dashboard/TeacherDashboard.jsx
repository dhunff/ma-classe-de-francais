import React from "react";
import { ClipboardCheck, Users, BookOpen, Inbox } from "lucide-react";
import { Card, StatTile, EmptyState } from "./parts.jsx";
import { totalScore, fmtDate } from "../../shared/exercises.js";

/* Trang chủ giáo viên.

   Brief chỉ đặc tả trang chủ học sinh; bản này cố ý gọn — trả lời đúng một
   câu hỏi giáo viên hỏi mỗi khi mở máy: "có gì cần chấm?". Mọi số đều đếm
   từ dữ liệu thật. */

export default function TeacherDashboard({ exercises, submissions, accounts, t, onOpen }) {
  const exById = new Map(exercises.map((ex) => [ex.id, ex]));

  const toGrade = submissions.filter((s) => {
    const ex = exById.get(s.exerciseId);
    if (!ex) return false;
    return totalScore(s, ex).pending;
  });

  const recent = [...submissions]
    .filter((s) => exById.has(s.exerciseId))
    .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
    .slice(0, 6);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <section className="rounded-md border border-solid border-line bg-surface p-6 shadow-sm">
        <p className="text-sm font-semibold text-soft">{t("dash.hello")}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
          {t("header.teacher")}
        </h1>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          Icon={ClipboardCheck}
          label={t("dash.to_grade")}
          value={toGrade.length}
          tone={toGrade.length > 0 ? "warn" : "ok"}
        />
        <StatTile Icon={Users} label={t("nav.students")} value={accounts.length} />
        <StatTile Icon={BookOpen} label={t("nav.exercises")} value={exercises.length} />
      </div>

      <Card title={t("dash.recent_submissions")}>
        {recent.length === 0 ? (
          <EmptyState
            Icon={Inbox}
            title={t("empty.no_submission")}
            body={t("dash.recent_empty_body")}
          />
        ) : (
          <ul className="flex flex-col divide-y divide-solid divide-line">
            {recent.map((s) => {
              const ex = exById.get(s.exerciseId);
              const { score, max, pending } = totalScore(s, ex);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onOpen?.(ex)}
                    className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-surface2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink">{s.student}</span>
                      <span className="block truncate text-xs text-soft">{ex.title}</span>
                    </span>
                    {s.at && <span className="hidden shrink-0 text-xs text-soft sm:block">{fmtDate(s.at)}</span>}
                    <span
                      className={[
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                        pending ? "bg-warn-soft text-warn" : "bg-ok-soft text-ok",
                      ].join(" ")}
                    >
                      {pending ? t("dash.awaiting") : `${score}/${max}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
