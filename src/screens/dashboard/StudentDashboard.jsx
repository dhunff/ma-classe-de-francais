import React, { useEffect, useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import { CheckCircle, Target, Clock, Flame, Radar as RadarIcon, PartyPopper, AlertTriangle, Inbox, UserCircle, ChevronRight } from "lucide-react";
import { Card, StatTile, EmptyState, ProgressBar } from "./parts.jsx";
import {
  studentWorkload, averageScore, skillBreakdown, nextUp, isLate, exSkills, fmtDate,
} from "../../shared/exercises.js";
import { calculateProfileCompletion } from "../../shared/profile.js";

/* Trang chủ học sinh.

   Nguyên tắc: mỗi con số ở đây phải tính được từ dữ liệu thật (exercises,
   submissions, profiles). Thứ nào chưa có nguồn dữ liệu thì hiện trạng thái
   rỗng nói rõ lý do — tuyệt đối không dựng số minh hoạ, vì học sinh sẽ tin
   vào nó. Hiện "chuỗi ngày học" thuộc diện này: hệ thống chưa ghi nhật ký
   hoạt động theo ngày nên không thể tính. */

export default function StudentDashboard({ name, exercises, submissions, profile, t, onOpen }) {
  const { assigned, done, todo, subOf } = studentWorkload(exercises, submissions, name);
  const avg = averageScore(exercises, submissions, name);
  const skills = skillBreakdown(exercises, submissions, name);
  const upcoming = nextUp(exercises, submissions, name, 3);
  const overdue = todo.filter((ex) => isLate(ex)).length;
  const goal = profile?.goal || "";
  const profilePct = calculateProfileCompletion(profile);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      {/* Chào mừng + tiến độ tổng quan */}
      <section className="rounded-md border border-solid border-line bg-surface p-6 shadow-sm">
        <p className="text-sm font-semibold text-soft">{t("dash.hello")}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{name}</h1>

        <div className="mt-5 max-w-xl">
          <p className="mb-3 text-sm text-soft">
            {goal ? (
              <>
                {t("dash.goal")}: <span className="font-bold text-ink">{goal}</span>
              </>
            ) : (
              t("dash.no_goal")
            )}
          </p>
          {/* Chưa có bài nào được giao thì không vẽ thanh tiến độ: 0/0 là
              phép chia vô nghĩa và 0% trông như thất bại chứ không như "chưa
              bắt đầu". */}
          {assigned.length > 0 ? (
            <ProgressBar value={done.length} max={assigned.length} label={t("dash.completion")} />
          ) : (
            <p className="text-sm text-soft">{t("dash.no_exercise_yet")}</p>
          )}
        </div>
      </section>

      {/* Hoàn thiện hồ sơ.

          Hồ sơ đầy đủ thì không hiện gì cả. Một thanh đứng mãi ở 100% không
          còn nói điều gì, mà vẫn chiếm chỗ ngay dưới phần chào — chỗ đắt nhất
          của trang. Thẻ này chỉ tồn tại khi còn việc để làm. */}
      {profilePct < 100 && (
        <Link
          to="/etudiant/compte"
          className="group flex items-center gap-4 rounded-md bg-surface p-5 no-underline shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
            <UserCircle size={22} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-bold text-ink">
              {t("dash.profile_completion", { pct: profilePct })}
            </p>
            <p className="m-0 mt-0.5 text-xs text-soft">{t("dash.profile_hint")}</p>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${profilePct}%` }} />
            </div>
          </div>

          <ChevronRight size={18} className="shrink-0 text-soft transition-colors group-hover:text-primary" />
        </Link>
      )}

      {/* Số liệu */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          Icon={CheckCircle}
          label={t("dash.submitted")}
          value={done.length}
          hint={t("dash.of_assigned", { n: assigned.length })}
          tone="ok"
        />
        <StatTile
          Icon={Target}
          label={t("dash.avg_score")}
          value={avg}
          unit={avg === null ? "" : "%"}
          hint={avg === null ? t("dash.avg_empty") : undefined}
          tone="primary"
        />
        <StatTile
          Icon={Clock}
          label={t("dash.pending")}
          value={todo.length}
          hint={overdue > 0 ? t("dash.overdue", { n: overdue }) : undefined}
          tone={overdue > 0 ? "danger" : "ink"}
        />
        {/* Chuỗi ngày học: chưa có nguồn dữ liệu. Hiện gạch ngang kèm lý do. */}
        <StatTile
          Icon={Flame}
          label={t("dash.streak")}
          value={null}
          hint={t("dash.streak_empty")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Biểu đồ mạng nhện theo kỹ năng */}
        <Card title={t("dash.skills")} className="lg:col-span-3">
          {skills.length >= 3 ? (
            <>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skills} outerRadius="72%">
                    <PolarGrid stroke="var(--mcf-line)" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fill: "var(--mcf-soft)", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 100]}
                      tick={{ fill: "var(--mcf-soft)", fontSize: 10 }}
                      axisLine={false}
                    />
                    <Radar
                      name={t("dash.avg_score")}
                      dataKey="value"
                      stroke="var(--mcf-primary)"
                      fill="var(--mcf-primary)"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-soft">{t("dash.skills_note")}</p>
            </>
          ) : (
            <EmptyState
              Icon={RadarIcon}
              title={t("dash.skills_empty_title")}
              body={t("dash.skills_empty_body")}
            />
          )}
        </Card>

        {/* Học tiếp */}
        <Card title={t("dash.continue")} className="lg:col-span-2">
          {upcoming.length === 0 ? (
            /* Hai lý do rỗng rất khác nhau: đã nộp hết, và chưa ai giao bài.
               Nói nhầm cái thứ hai thành cái thứ nhất là khen sai người học. */
            assigned.length === 0 ? (
              <EmptyState
                Icon={Inbox}
                title={t("dash.nothing_assigned_title")}
                body={t("dash.no_exercise_yet")}
              />
            ) : (
              <EmptyState
                Icon={PartyPopper}
                title={t("dash.continue_empty_title")}
                body={t("dash.continue_empty_body")}
              />
            )
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((ex) => {
                const late = isLate(ex);
                return (
                  <li key={ex.id}>
                    <button
                      type="button"
                      onClick={() => onOpen?.(ex)}
                      className={[
                        "w-full rounded-md border border-solid border-line bg-surface2 p-3 text-left",
                        "transition-colors hover:border-line-strong",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">
                          {ex.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
                          {ex.level}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-soft">
                        <span>{t("dash.questions", { n: (ex.questions || []).length })}</span>
                        {exSkills(ex).slice(0, 2).map((s) => (
                          <span key={s} className="rounded-sm bg-surface px-1.5 py-0.5">{s}</span>
                        ))}
                      </div>
                      {ex.deadline && (
                        <div
                          className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${
                            late ? "text-danger" : "text-soft"
                          }`}
                        >
                          {late && <AlertTriangle size={13} />}
                          {late ? t("dash.was_due") : t("dash.due")} {fmtDate(ex.deadline)}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
