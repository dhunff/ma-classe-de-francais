import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle, Target, Clock, Flame, PartyPopper, AlertTriangle, Inbox,
  UserCircle, ChevronRight, Sparkles,
} from "lucide-react";
import { Card, StatTile, EmptyState, HeroBanner, Rise, Ring } from "./parts.jsx";
import { NewestPracticeRail } from "./PracticeRail.jsx";
import {
  studentWorkload, averageScore, skillBreakdown, nextUp, isLate, exSkills, fmtDate,
} from "../../shared/exercises.js";
import { calculateProfileCompletion } from "../../shared/profile.js";

/* Trang chủ học sinh.

   Nguyên tắc không đổi: mỗi con số ở đây phải tính được từ dữ liệu thật.
   Thứ nào chưa có nguồn thì hiện trạng thái rỗng nói rõ lý do — tuyệt đối
   không dựng số minh hoạ, vì học sinh sẽ tin vào nó. "Chuỗi ngày học" vẫn
   thuộc diện đó: hệ thống chưa ghi nhật ký hoạt động theo ngày.

   Bố cục hai cột, không phải ba: cột điều hướng bên trái đã do AppLayout cấp.
   Dựng thêm một sidebar nữa trong đây là lặp lại đúng thứ vừa được gỡ bỏ.

   Hoạt ảnh xuất hiện xếp so le qua <Rise delay>. Mọi hoạt ảnh đều tự tắt khi
   người dùng bật giảm chuyển động — xem base.css. */

/* `practice` chỉ để preview.jsx bơm fixture vào; lúc chạy thật bỏ trống và
   khối tự nạp từ kho. */
export default function StudentDashboard({ name, exercises, submissions, profile, t, onOpen, practice }) {
  const navigate = useNavigate();
  const { assigned, done, todo } = studentWorkload(exercises, submissions, name);
  const avg = averageScore(exercises, submissions, name);
  const skills = skillBreakdown(exercises, submissions, name);
  const upcoming = nextUp(exercises, submissions, name, 4);
  const overdue = todo.filter((ex) => isLate(ex)).length;
  const goal = profile?.goal || "";
  const profilePct = calculateProfileCompletion(profile);
  const donePct = assigned.length ? Math.round((done.length / assigned.length) * 100) : 0;

  return (
    /* Nền chuyển sắc rất nhạt để thẻ nền mờ có thứ để mờ lên trên. Bản tối
       dùng token nên ăn theo nền chung của app, không phải đen thuần. */
    <div className="-mx-4 -mt-6 min-h-full bg-gradient-to-br from-[#eef2f6] to-[#f4f7fa] px-4 pt-6 md:-mx-6 md:px-6 dark:from-bg dark:to-surface2">
      <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-[1fr_340px]">

        {/* ─────────────── Cột chính ───────────────
            `min-w-0` là bắt buộc từ khi có băng chuyền: flex/grid item mặc
            định `min-width: auto`, nên cột sẽ nong ra bằng tổng bề rộng thẻ
            thay vì để khung con tự cuộn — kéo tràn ngang cả trang. */}
        <div className="flex min-w-0 flex-col gap-4">

          {/* Cùng banner với trang chủ chung — đăng nhập rồi đi qua hai màn
              hình phải thấy một sản phẩm, không phải hai.

              Khối chào cũ đã bỏ: hai con số của nó (đã nộp / điểm trung bình)
              lặp y nguyên ở hàng ô số liệu ngay bên dưới, chỉ riêng "Mục tiêu"
              là không lặp nên được mang vào banner. */}
          <Rise delay={0}>
            <HeroBanner t={t} signedIn name={name} as="h2"
              note={goal
                ? <>{t("dash.goal")}: <span className="font-extrabold">{goal}</span></>
                : t("dash.no_goal")} />
          </Rise>

          {/* Hồ sơ chưa đầy thì mời điền. Đầy rồi thì biến mất — một thanh
              đứng mãi ở 100% không còn nói điều gì. */}
          {profilePct < 100 && (
            <Rise delay={80}>
              <Link to="/etudiant/compte"
                className="group flex items-center gap-4 rounded-3xl bg-surface/80 p-5 no-underline shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <UserCircle size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-sm font-bold text-ink">{t("dash.profile_completion", { pct: profilePct })}</p>
                  <p className="m-0 mt-0.5 text-xs text-soft">{t("dash.profile_hint")}</p>
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
                    <div className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-out"
                      style={{ width: `${profilePct}%` }} />
                  </div>
                </div>
                <ChevronRight size={18} className="shrink-0 text-soft transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </Rise>
          )}

          <Rise delay={160} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile Icon={CheckCircle} label={t("dash.submitted")} value={done.length}
              hint={t("dash.of_assigned", { n: assigned.length })} tone="ok" />
            <StatTile Icon={Target} label={t("dash.avg_score")} value={avg} unit="%"
              hint={avg === null ? t("dash.avg_empty") : undefined} tone="primary" />
            <StatTile Icon={Clock} label={t("dash.pending")} value={todo.length}
              hint={overdue ? t("dash.overdue", { n: overdue }) : undefined}
              tone={overdue ? "danger" : "ink"} />
            <StatTile Icon={Flame} label={t("dash.streak")} value={null}
              hint={t("dash.streak_empty")} />
          </Rise>

          {/* Biểu đồ cột thuần CSS. Không phải "hoạt động theo ngày" như bản
              thiết kế gợi ý — hệ thống chưa ghi nhật ký theo ngày, nên vẽ nó
              là bịa. Đây là điểm theo kỹ năng, tính từ bài đã chốt điểm. */}
          <Rise delay={240}>
            <Card title={t("dash.skills")}>
              {skills.length ? (
                <>
                  <div className="flex h-48 items-end justify-around gap-3 pt-2">
                    {skills.map(({ skill, value }) => {
                      const best = value === Math.max(...skills.map((s) => s.value));
                      return (
                        <div key={skill} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                          <span className="text-xs font-bold text-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            {value}%
                          </span>
                          <div
                            className={[
                              "w-full max-w-[42px] rounded-full transition-all duration-500 ease-out",
                              "group-hover:brightness-110",
                              best ? "bg-primary shadow-[0_6px_20px_rgb(var(--mcf-primary-rgb)/0.45)]" : "bg-primary-soft",
                            ].join(" ")}
                            style={{ height: `${Math.max(value, 4)}%` }}
                          />
                          <span className="w-full truncate text-center text-[11px] font-semibold text-soft">
                            {skill}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="m-0 mt-3 text-xs text-soft">{t("dash.skills_note")}</p>
                </>
              ) : (
                <EmptyState Icon={Sparkles} title={t("dash.skills_empty_title")} body={t("dash.skills_empty_body")} />
              )}
            </Card>
          </Rise>

          {/* Kho luyện tập, mới nhất trước — cùng khối với trang chủ chung.
              Không có nó thì hôm nào giáo viên chưa giao bài, trang này trắng
              trơn trong khi thư viện vẫn đầy bài học sinh tự làm được. */}
          <Rise delay={320}>
            <NewestPracticeRail t={t} practice={practice}
              onOpen={() => navigate("/decouvrir/entrainement")} />
          </Rise>
        </div>

        {/* ─────────────── Cột phải ─────────────── */}
        <div className="flex flex-col gap-4">

          <Rise delay={120}>
            <Card>
              <div className="flex flex-col items-center gap-3 py-2">
                <Ring pct={donePct} label={t("dash.completion")} />
                <p className="m-0 text-center text-sm font-bold text-ink">{t("dash.completion")}</p>
                <p className="m-0 text-center text-xs text-soft">
                  {assigned.length
                    ? t("dash.of_assigned", { n: assigned.length })
                    : t("dash.no_exercise_yet")}
                </p>
              </div>
            </Card>
          </Rise>

          <Rise delay={200}>
            <Card title={t("dash.continue")}>
              {upcoming.length === 0 ? (
                assigned.length === 0 ? (
                  <EmptyState Icon={Inbox} title={t("dash.no_exercise_yet")} />
                ) : (
                  <EmptyState Icon={PartyPopper} title={t("dash.continue_empty_title")} body={t("dash.continue_empty_body")} />
                )
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {upcoming.map((ex) => {
                    const late = isLate(ex);
                    return (
                      <li key={ex.id}>
                        <button type="button" onClick={() => onOpen?.(ex)}
                          className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border-0 bg-surface2/70 p-3 text-left font-[inherit] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
                          <span className="min-w-0 flex-1">
                            <span className="mb-1 flex items-center justify-between gap-2">
                              <span className="min-w-0 truncate text-sm font-bold text-ink">{ex.title}</span>
                              <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
                                {ex.level}
                              </span>
                            </span>
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-soft">
                              <span>{t("dash.questions", { n: (ex.questions || []).length })}</span>
                              {exSkills(ex).slice(0, 2).map((s) => (
                                <span key={s} className="rounded-sm bg-surface px-1.5 py-0.5">{s}</span>
                              ))}
                              {ex.deadline && (
                                <span className={late ? "font-bold text-danger" : ""}>
                                  {late ? t("dash.was_due") : t("dash.due")} {fmtDate(ex.deadline)}
                                </span>
                              )}
                            </span>
                          </span>
                          {late
                            ? <AlertTriangle size={16} className="shrink-0 text-danger" />
                            : <ChevronRight size={16} className="shrink-0 text-soft transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />}
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
    </div>
  );
}
