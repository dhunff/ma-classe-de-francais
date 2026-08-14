import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, ChevronLeft, ChevronRight, ArrowRight, Clock, AlertTriangle,
  BookOpen, Headphones, PenLine, BookA, Languages, MessagesSquare, Puzzle,
  UserPlus, Inbox, CheckCircle, Timer,
} from "lucide-react";
import { Card, EmptyState, Rise, Ring } from "./parts.jsx";
import { LEVEL_COLORS, LEVEL_PASTEL } from "../../shared/tokens.js";
import {
  exSkills, isLate, fmtDate, studentWorkload, nextUp,
} from "../../shared/exercises.js";
import { load } from "../../shared/storage.js";

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

/* Bài luyện tập nằm ở kho riêng "mcf-practice" — khác "mcf-exercises" vốn là
   bài giáo viên giao. Trang này khoe kho luyện tập, nên đọc đúng kho đó. */
const PRACTICE_KEY = "mcf-practice";

/* Biểu tượng theo kỹ năng. Khoá là chuỗi trong SKILLS (shared/exercises.js).
   Kỹ năng lạ rơi về Puzzle thay vì vỡ — danh sách kỹ năng do giáo viên nhập
   nên không đóng được. */
const SKILL_ICON = {
  "Grammaire": BookOpen,
  "Vocabulaire": BookA,
  "Écoute": Headphones,
  "Lecture": BookOpen,
  "Production écrite": PenLine,
  "Traduction": Languages,
  "Communication": MessagesSquare,
};
const iconFor = (skill) => SKILL_ICON[skill] || Puzzle;

/* Viên trình độ. Màu lấy từ LEVEL_COLORS/LEVEL_PASTEL của dự án — một dải
   xanh đậm dần theo trình độ, KHÔNG phải mỗi bậc một sắc riêng.

   Hai lý do giữ nguyên: dải đơn sắc tự nó mã hoá thứ tự (B2 đậm hơn A1, nhìn
   là biết cái nào cao hơn), còn bảng nhiều sắc thì không; và
   scripts/check-design.mjs đo tương phản từng cặp màu chữ/nền ở đây, nên màu
   tự chế sẽ làm hỏng kiểm tra. */
function LevelBadge({ level }) {
  if (!level) return null;
  return (
    <span
      className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-wide"
      style={{
        color: LEVEL_COLORS[level] || LEVEL_COLORS.B1,
        background: LEVEL_PASTEL[level] || LEVEL_PASTEL.B1,
      }}
    >
      {level}
    </span>
  );
}

/* Băng chuyền ngang có bắt điểm dừng.

   Mũi tên chỉ hiện khi thật sự cuộn được, và tự tắt khi chạm hai đầu — một
   nút bấm vào không có gì xảy ra thì tệ hơn là không có nút. Trạng thái đo
   lại khi cuộn, khi đổi kích thước, và khi danh sách đổi.

   Trên cảm ứng không cần mũi tên: vuốt là hành vi sẵn có. */
function Carousel({ title, action, children, t, count }) {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ scrollable: false, left: false, right: false });

  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    /* `max > 4` chứ không phải `> 0`: sai số làm tròn của bố cục hay để lại
       một hai pixel thừa, đủ để một hàng vừa khít bị coi là cuộn được. */
    setEdge({
      scrollable: max > 4,
      left: el.scrollLeft > 4,
      right: el.scrollLeft < max - 4,
    });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [count]);

  /* Cuộn theo bề rộng thấy được trừ một khoảng chồng lấn, để thẻ ở mép không
     bị nhảy mất hẳn khỏi tầm mắt sau mỗi lần bấm. */
  const nudge = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth - 120), behavior: "smooth" });
  };

  const arrow = "grid h-8 w-8 place-items-center rounded-full border-0 bg-surface text-soft shadow-sm transition-all duration-200 enabled:cursor-pointer enabled:hover:scale-105 enabled:hover:text-primary disabled:opacity-30";

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="m-0 text-base font-extrabold tracking-tight text-ink">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          {/* Hàng vừa khít thì bỏ hẳn mũi tên. Để lại hai nút xám vĩnh viễn là
              hứa một hành động không tồn tại — tệ hơn là không có nút nào. */}
          {edge.scrollable && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <button type="button" className={arrow} onClick={() => nudge(-1)}
                disabled={!edge.left} aria-label={t("home.scroll_prev")}>
                <ChevronLeft size={16} />
              </button>
              <button type="button" className={arrow} onClick={() => nudge(1)}
                disabled={!edge.right} aria-label={t("home.scroll_next")}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* -mx/px cân nhau để bóng đổ của thẻ không bị khung cuộn cắt cụt. */}
      <div ref={ref}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto scroll-smooth px-1 pb-2">
        {children}
      </div>
    </section>
  );
}

const CARD_SHELL =
  "snap-start shrink-0 rounded-3xl bg-surface/80 backdrop-blur-md " +
  "shadow-[0_8px_30px_rgb(0,0,0,0.04)] " +
  "transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)] " +
  "hover:-translate-y-1 hover:shadow-[0_18px_40px_rgb(0,0,0,0.10)]";

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

/* Thẻ bài luyện tập. Bốn tầng thông tin theo đúng thứ tự mắt quét:
   kỹ năng → trình độ → tên bài → số câu và thời lượng.

   Thời lượng CHỈ hiện khi bài có đặt `timeLimit`. Suy ra "khoảng 20 phút" từ
   số câu là đoán, mà con số đoán đặt cạnh con số thật thì người đọc không
   phân biệt được cái nào là cái nào. */
function PracticeCard({ ex, t, onOpen }) {
  const skill = exSkills(ex)[0];
  const Icon = iconFor(skill);
  const nQ = (ex.questions || []).length;
  const mins = Number(ex.timeLimit) || 0;

  return (
    <article className={`${CARD_SHELL} flex w-[240px] flex-col p-5 sm:w-[260px]`}>
      <div className="flex items-center justify-between gap-2">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Icon size={20} strokeWidth={2.2} />
        </span>
        <LevelBadge level={ex.level} />
      </div>

      {skill && (
        <p className="m-0 mt-4 truncate text-xs font-bold uppercase tracking-wider text-primary">
          {skill}
        </p>
      )}
      <h3 className="m-0 mt-1.5 line-clamp-2 text-sm font-extrabold leading-snug text-ink">
        {ex.title}
      </h3>

      <p className="m-0 mt-2 flex flex-wrap items-center gap-x-1.5 text-xs font-medium text-soft">
        <span>{t("home.questions", { n: nQ })}</span>
        {mins > 0 && (
          <>
            <span aria-hidden>•</span>
            <span className="inline-flex items-center gap-1">
              <Timer size={12} />{t("home.minutes", { n: mins })}
            </span>
          </>
        )}
      </p>

      <button
        type="button"
        onClick={() => onOpen?.(ex)}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-surface2 px-4 py-2 font-[inherit] text-xs font-bold text-ink transition-all duration-200 hover:scale-[1.02] hover:bg-primary-soft hover:text-primary"
      >
        {t("home.start")}
        <ArrowRight size={14} />
      </button>
    </article>
  );
}

export default function HomeDashboard({
  session, exercises = [], submissions = [], t, onOpen, onRequireLogin, practice: practiceProp,
}) {
  const signedIn = !!session;
  const name = session?.name || "";
  const navigate = useNavigate();

  /* Bấm vào thẻ thì sang thư viện luyện tập. CHƯA mở thẳng đúng bài đó:
     PracticeHub giữ bài đang xem trong state nội bộ, không đọc từ URL, nên
     muốn deep-link phải sửa nó nhận id — việc riêng, không gộp vào đây.
     `onOpen` để preview.jsx chặn điều hướng khi chỉ dựng bố cục. */
  const openEx = onOpen || (() => navigate("/decouvrir/entrainement"));

  /* Bài luyện tập tự nạp, vì kho này không đi qua state của App. Cho phép
     truyền sẵn qua prop để preview.jsx dựng bố cục bằng fixture mà không cần
     mạng. */
  const [loadedPractice, setLoadedPractice] = useState(null);
  useEffect(() => {
    if (practiceProp) return;
    let off = false;
    load(PRACTICE_KEY, []).then((raw) => {
      if (!off) setLoadedPractice(Array.isArray(raw) ? raw : []);
    }).catch(() => { if (!off) setLoadedPractice([]); });
    return () => { off = true; };
  }, [practiceProp]);

  const practice = practiceProp ?? loadedPractice;

  /* Mới nhất lên trước. `createdAt` là Date.now() lúc tạo (xem PracticeHub);
     bài cũ chưa có trường này thì rơi về 0 và xuống cuối, chứ không đẩy
     NaN vào phép so sánh làm thứ tự loạn. */
  const newest = useMemo(() => {
    if (!practice) return null;
    return [...practice]
      .filter((e) => e && e.title)
      .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
      .slice(0, 12);
  }, [practice]);

  /* "Cần làm" chỉ tính cho người đã đăng nhập. nextUp đã lọc theo người được
     giao và bỏ bài đã nộp, đồng thời xếp bài quá hạn lên đầu. */
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
    <div className="-mx-4 -mt-6 min-h-full bg-gradient-to-br from-[#eef2f6] to-[#f4f7fa] px-4 pt-6 md:-mx-6 md:px-6 dark:from-bg dark:to-surface2">
      <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-[1fr_340px]">

        {/* ─────────────── Cột chính ─────────────── */}
        <div className="flex min-w-0 flex-col gap-6">

          {/* Banner. Chuyển sắc + hai vòng tròn mờ tạo chiều sâu; trang trí
              thuần tuý nên ẩn với trình đọc màn hình. */}
          <Rise delay={0}>
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-[#6d5ce7] p-6 text-on-primary shadow-[0_14px_34px_rgb(0,0,0,0.14)] sm:p-8">
              <span aria-hidden className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/15" />
              <span aria-hidden className="absolute -bottom-16 right-10 h-28 w-28 rounded-full bg-white/10" />

              <div className="relative max-w-lg">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20">
                  <Sparkles size={21} strokeWidth={2.3} />
                </span>
                <h1 className="m-0 mt-4 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                  {signedIn ? t("home.welcome_back", { name }) : t("home.welcome_guest")}
                </h1>
                <p className="m-0 mt-2 text-sm font-medium opacity-90">
                  {signedIn ? t("home.hero_sub_user") : t("home.hero_sub_guest")}
                </p>
                <Link
                  to="/decouvrir/entrainement"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-sm font-bold text-primary no-underline shadow-[0_6px_16px_rgb(0,0,0,0.15)] transition-transform duration-200 hover:scale-[1.03]"
                >
                  {t("home.discover")}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>
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
            <Carousel
              t={t}
              title={t("home.new_practice")}
              count={newest?.length || 0}
              action={
                <Link to="/decouvrir/entrainement"
                  className="mr-1 text-xs font-bold text-primary no-underline hover:underline">
                  {t("home.see_all")}
                </Link>
              }
            >
              {newest === null ? (
                /* Đang nạp: khung xám giữ đúng chỗ để trang không giật khi
                   dữ liệu về. */
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[212px] w-[240px] shrink-0 animate-pulse rounded-3xl bg-surface/60 sm:w-[260px]" />
                ))
              ) : newest.length === 0 ? (
                <div className="w-full">
                  <Card>
                    <EmptyState Icon={Inbox} title={t("home.no_practice_title")} body={t("home.no_practice_body")} />
                  </Card>
                </div>
              ) : (
                newest.map((ex) => (
                  <PracticeCard key={ex.id} ex={ex} t={t} onOpen={openEx} />
                ))
              )}
            </Carousel>
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

              {/* Giờ học: ô rỗng có lý do, không phải biểu đồ. Hệ thống chưa
                  ghi thời gian học, nên mọi đường cong vẽ ra ở đây đều là bịa
                  — cùng lý do với "Chuỗi ngày học" ở StudentDashboard. */}
              <Rise delay={200}>
                <Card title={t("home.hours_title")}>
                  <EmptyState Icon={Clock} title={t("home.hours_empty")} />
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
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <UserPlus size={21} strokeWidth={2.2} />
                </span>
                <h2 className="m-0 mt-4 text-base font-extrabold leading-snug text-ink">
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
              </section>
            </Rise>
          )}
        </div>
      </div>
    </div>
  );
}
