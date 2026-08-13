import React from "react";
import { ClipboardCheck, Users, BookOpen, Inbox } from "lucide-react";
import { Card, StatTile, EmptyState, Rise } from "./parts.jsx";
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
    /* Cùng vỏ nền với trang chủ học sinh: nền chuyển sắc rất nhạt để thẻ nền
       mờ có thứ để nổi lên trên. Bản tối ăn theo token nên không đen thuần. */
    <div className="-mx-4 -mt-6 min-h-full bg-gradient-to-br from-[#eef2f6] to-[#f4f7fa] px-4 pt-6 md:-mx-6 md:px-6 dark:from-bg dark:to-surface2">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <Rise delay={0}>
          <section className="rounded-3xl bg-surface/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
            <p className="m-0 text-sm font-semibold text-soft">{t("dash.hello")}</p>
            <h1 className="m-0 mt-1 text-3xl font-extrabold tracking-tight text-ink">
              {t("header.teacher")}
            </h1>
          </section>
        </Rise>

        <Rise delay={80} className="grid gap-4 sm:grid-cols-3">
        <StatTile
          Icon={ClipboardCheck}
          label={t("dash.to_grade")}
          value={toGrade.length}
          tone={toGrade.length > 0 ? "warn" : "ok"}
        />
        <StatTile Icon={Users} label={t("nav.students")} value={accounts.length} />
          <StatTile Icon={BookOpen} label={t("nav.exercises")} value={exercises.length} />
        </Rise>

        <Rise delay={160}>
        <Card title={t("dash.recent_submissions")}>
        {recent.length === 0 ? (
          <EmptyState
            Icon={Inbox}
            title={t("empty.no_submission")}
            body={t("dash.recent_empty_body")}
          />
        ) : (
          /* list-none và p-0 là bắt buộc: preflight bị tắt nên <ul> giữ nguyên
             chấm đầu dòng và thụt lề mặc định của trình duyệt. */
          <ul className="m-0 flex list-none flex-col divide-y divide-solid divide-line p-0">
            {recent.map((s) => {
              const ex = exById.get(s.exerciseId);
              const { score, max, pending } = totalScore(s, ex);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onOpen?.(ex)}
                    className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent py-3 text-left transition-colors hover:bg-surface2"
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
        </Rise>
      </div>
    </div>
  );
}
