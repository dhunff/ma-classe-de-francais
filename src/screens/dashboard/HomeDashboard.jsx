import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tr } from "../../shared/i18n.jsx";
import {
  ArrowRight, Clock, AlertTriangle, UserPlus, Inbox, CheckCircle,
} from "lucide-react";
import { Card, EmptyState, HeroBanner, Rise, Ring } from "./parts.jsx";
import GioHocWidget from "./GioHocWidget.jsx";
import {
  Carousel, CARD_SHELL, LevelBadge, NewestPracticeRail, iconFor,
} from "./PracticeRail.jsx";
import {
  exSkills, isLate, fmtDate, studentWorkload, nextUp,
} from "../../shared/exercises.js";

/* Trang chủ chung — khách và người đã đăng nhập cùng vào một cửa.

   MỘT component cho cả hai trạng thái, không phải hai trang song song: hai
   bản sao sẽ lệch nhau ngay lần sửa thứ hai. Khác biệt duy nhất nằm ở
   `signedIn`, và nó chỉ quyết định hai điều — khối "Cần làm" có tồn tại
   trong DOM hay không, và cột phải hiện thống kê hay lời mời lập tài khoản.

   DỮ LIỆU THẬT, không có bài minh hoạ. Nguyên tắc này viết ở đầu
   StudentDashboard.jsx và áp cả ở đây: học sinh tin vào những gì trang này
   nói. Chưa có bài thì hiện trạng thái rỗng nói rõ lý do. Fixture để xem bố
   cục nằm trong preview.jsx, không nằm trong đường chạy thật.

   "Giờ học" vì vậy cũng là một ô rỗng có giải thích, không phải biểu đồ: hệ
   thống chưa ghi thời gian học theo ngày, vẽ ra là bịa. */

/* Thẻ rộng cho "Cần làm": một hàng ngang, có hạn nộp và nút hành động chính. */
function TaskCard({ ex, t, onOpen }) {
  const late = isLate(ex);
  const skill = exSkills(ex)[0];
  const Icon = iconFor(skill);

  return (
    <article className={`${CARD_SHELL} w-[300px] p-5 sm:w-[360px]`}>
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Icon size={20} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {skill && <span className="truncate text-xs font-bold text-primary">{skill}</span>}
            <LevelBadge level={ex.level} />
          </div>
          <h3 className="m-0 mt-1.5 truncate text-sm font-extrabold text-ink">{ex.title}</h3>
          <p className="m-0 mt-1 flex items-center gap-1.5 text-xs font-medium text-soft">
            {ex.deadline ? (
              <>
                {late
                  ? <AlertTriangle size={13} className="shrink-0 text-danger" />
                  : <Clock size={13} className="shrink-0" />}
                <span className={late ? "font-bold text-danger" : ""}>
                  {late ? t("dash.was_due") : t("dash.due")} {fmtDate(ex.deadline)}
                </span>
              </>
            ) : (
              <>
                <Clock size={13} className="shrink-0" />
                {t("home.questions", { n: (ex.questions || []).length })}
              </>
            )}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpen?.(ex)}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary px-4 py-2.5 font-[inherit] text-sm font-bold text-on-primary transition-transform duration-200 hover:scale-[1.02]"
      >
        {t("home.start")}
        <ArrowRight size={16} />
      </button>
    </article>
  );
}

export default function HomeDashboard({
  session, exercises = [], submissions = [], t, onOpen, onRequireLogin, practice,
}) {
  const signedIn = !!session;
  const name = session?.name || "";
  const navigate = useNavigate();

  /* Bấm vào thẻ thì sang thư viện luyện tập. CHƯA mở thẳng đúng bài đó:
     PracticeHub giữ bài đang xem trong state nội bộ, không đọc từ URL, nên
     muốn deep-link phải sửa nó nhận id — việc riêng, không gộp vào đây.
     `onOpen` để preview.jsx chặn điều hướng khi chỉ dựng bố cục. */
  const openEx = onOpen || (() => navigate("/decouvrir/entrainement"));

  /* "Cần làm" chỉ tính cho người đã đăng nhập. nextUp đã lọc theo người được
     giao và bỏ bài đã nộp, đồng thời đẩy bài còn kịp hạn lên trước bài đã
     quá hạn — bài chưa trễ thì còn cứu được. */
  const pendingTasks = useMemo(
    () => (signedIn ? nextUp(exercises, submissions, name, 6) : []),
    [signedIn, exercises, submissions, name],
  );

  const { assigned, done } = useMemo(
    () => (signedIn
      ? studentWorkload(exercises, submissions, name)
      : { assigned: [], done: [] }),
    [signedIn, exercises, submissions, name],
  );
  const donePct = assigned.length ? Math.round((done.length / assigned.length) * 100) : 0;

  const recent = useMemo(() => {
    if (!signedIn) return [];
    return [...done]
      .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
      .slice(0, 5);
  }, [signedIn, done]);

  return (
    /* Không còn tự vẽ nền tràn viền: AppLayout đã bọc mọi trang trong tấm thẻ
       nội dung, nên một lớp nền nữa ở đây thành thẻ lồng trong thẻ. */
    <div className="pt-2">
      <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-[1fr_340px]">

        {/* ─────────────── Cột chính ─────────────── */}
        <div className="flex min-w-0 flex-col gap-6">

          <Rise delay={0}>
            <HeroBanner t={t} signedIn={signedIn} name={name} />
          </Rise>

          {/* "Cần làm" — chỉ tồn tại trong DOM khi đã đăng nhập VÀ còn bài.
              Khách không có khối này, không phải khối rỗng bị ẩn. */}
          {signedIn && pendingTasks.length > 0 && (
            <Rise delay={80}>
              <Carousel t={t} title={t("home.todo_title")} count={pendingTasks.length}>
                {pendingTasks.map((ex) => (
                  <TaskCard key={ex.id} ex={ex} t={t} onOpen={openEx} />
                ))}
              </Carousel>
            </Rise>
          )}

          <Rise delay={160}>
            <NewestPracticeRail t={t} onOpen={openEx} practice={practice} />
          </Rise>
        </div>

        {/* ─────────────── Cột phải ─────────────── */}
        <div className="flex flex-col gap-4">
          {signedIn ? (
            <>
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

              {/* Giờ học: số THẬT từ 27/09 (migration 106). Khách chưa đăng nhập
                  thì không có gì để đo — vẫn ô rỗng có lý do. */}
              <Rise delay={200}>
                <Card title={t("home.hours_title")}>
                  {session ? <GioHocWidget t={t} /> : <EmptyState Icon={Clock} title={t("home.hours_empty")} />}
                </Card>
              </Rise>

              <Rise delay={280}>
                <Card title={t("home.activity_title")}>
                  {recent.length === 0 ? (
                    <EmptyState Icon={Inbox} title={t("home.activity_empty")} />
                  ) : (
                    <ul className="m-0 flex list-none flex-col gap-2 p-0">
                      {recent.map((ex) => (
                        <li key={ex.id} className="flex items-center gap-3 rounded-2xl bg-surface2/70 p-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ok-soft text-ok">
                            <CheckCircle size={16} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                            {ex.title}
                          </span>
                          <LevelBadge level={ex.level} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </Rise>
            </>
          ) : (
            <Rise delay={120}>
              <section className="relative overflow-hidden rounded-3xl bg-surface/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                <h2 className="m-0 flex items-center gap-2 text-base font-extrabold leading-snug text-ink">
                  <UserPlus size={18} strokeWidth={2.2} className="text-primary" />
                  {t("home.guest_promo_title")}
                </h2>
                <p className="m-0 mt-2 text-sm text-soft">{t("home.guest_promo_body")}</p>
                <button
                  type="button"
                  onClick={() => onRequireLogin?.()}
                  className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5 font-[inherit] text-sm font-bold text-on-primary transition-transform duration-200 hover:scale-[1.02]"
                >
                  {t("home.signup")}
                  <ArrowRight size={16} />
                </button>
                <Link to="/login"
                  className="mt-2.5 flex w-full items-center justify-center rounded-full border border-solid border-line bg-transparent px-5 py-2.5 text-sm font-bold text-ink no-underline transition-colors hover:border-primary hover:text-primary">
                  {tr("Đã có tài khoản? Đăng nhập", "Déjà inscrit ? Se connecter", "Have an account? Sign in")}
                </Link>
              </section>
              {/* Leon mời đăng nhập / đăng ký (09/10): nằm ở khoảng trống DƯỚI thẻ đăng ký;
                  bong bóng đặt PHÍA TRÊN đầu, không che mặt Leon. */}
              <div className="relative mt-4 flex flex-col items-center">
                <span aria-hidden className="absolute bottom-2 left-1/2 h-[62%] w-[95%] -translate-x-1/2 rounded-full bg-primary-soft" />
                <div className="mcf-leon-vao-bong relative z-10 -mb-2 max-w-[16rem] self-start rounded-3xl rounded-bl-md bg-surface px-4 py-3 text-ink shadow-[0_18px_40px_rgb(0,0,0,0.12)]">
                  <span className="block text-base font-extrabold"><em>Bonjour !</em> 🐾</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-soft">{tr("Vào lớp cùng Leon nhé, mình giữ tiến độ cho bạn!", "Rejoins Leon, je garde ta progression !", "Join Leon, I'll keep your progress!")}</span>
                </div>
                <img src="/leon/leon-lon.webp" alt={tr("Leon mời bạn tham gia FRACILE", "Leon t'invite à rejoindre FRACILE", "Leon invites you to join FRACILE")}
                  width={300} height={460} className="mcf-leon-bay relative h-[460px] w-auto max-w-full object-contain drop-shadow-[0_16px_24px_rgb(0,0,0,0.15)]" />
              </div>
            </Rise>
          )}
        </div>
      </div>
    </div>
  );
}
