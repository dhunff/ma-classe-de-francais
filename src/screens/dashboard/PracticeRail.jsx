import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, ArrowRight, Timer, Inbox,
  BookOpen, Headphones, PenLine, BookA, Languages, MessagesSquare, Puzzle,
} from "lucide-react";
import { Card, EmptyState } from "./parts.jsx";
import { LEVEL_COLORS, LEVEL_PASTEL } from "../../shared/tokens.js";
import { exSkills } from "../../shared/exercises.js";
import { load } from "../../shared/storage.js";
import { loadPractice } from "../../shared/exerciseStore.js";

/* Băng chuyền "Mới ra · Luyện tập" — dùng chung cho trang chủ chung và cho
   trang tổng quan của học sinh.

   Đặt ở file riêng vì cả hai màn hình đều phải khoe kho luyện tập: học sinh
   đã đăng nhập mà chỉ thấy bài được giao thì hôm nào giáo viên chưa giao gì,
   trang chủ của họ trống trơn trong khi kho vẫn đầy bài. Chép sang màn hình
   thứ hai thì hai bản sẽ lệch nhau ngay lần sửa sau. */

/* Bài luyện tập nằm ở kho `store = 'practice'` — khác `'assignment'` vốn là
   bài giáo viên giao. Ranh giới đó nay là một cột, không còn là hai khoá blob. */

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
export const iconFor = (skill) => SKILL_ICON[skill] || Puzzle;

/* Viên trình độ. Màu lấy từ LEVEL_COLORS/LEVEL_PASTEL của dự án — một dải
   xanh đậm dần theo trình độ, KHÔNG phải mỗi bậc một sắc riêng.

   Hai lý do giữ nguyên: dải đơn sắc tự nó mã hoá thứ tự (B2 đậm hơn A1, nhìn
   là biết cái nào cao hơn), còn bảng nhiều sắc thì không; và
   scripts/check-design.mjs đo tương phản từng cặp màu chữ/nền ở đây, nên màu
   tự chế sẽ làm hỏng kiểm tra. */
export function LevelBadge({ level }) {
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
export function Carousel({ title, action, children, t, count }) {
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

  /* ResizeObserver chứ không phải sự kiện `resize` của window: khung này hẹp
     đi mỗi khi thanh bên bung ra, mà việc đó không phát `resize` nào cả —
     nghe window thì mũi tên sẽ kẹt ở trạng thái đo được lần trước.
     Theo dõi cả khung cuộn (bề rộng thấy được) lẫn hàng thẻ bên trong (tổng
     bề rộng nội dung), vì một trong hai đổi là kết luận cuộn được đã khác. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
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

export const CARD_SHELL =
  "snap-start shrink-0 rounded-3xl bg-surface/80 backdrop-blur-md " +
  "shadow-[0_8px_30px_rgb(0,0,0,0.04)] " +
  "transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)] " +
  "hover:-translate-y-1 hover:shadow-[0_18px_40px_rgb(0,0,0,0.10)]";

/* Thẻ bài luyện tập. Bốn tầng thông tin theo đúng thứ tự mắt quét:
   kỹ năng → trình độ → tên bài → số câu và thời lượng.

   Thời lượng CHỈ hiện khi bài có đặt `timeLimit`. Suy ra "khoảng 20 phút" từ
   số câu là đoán, mà con số đoán đặt cạnh con số thật thì người đọc không
   phân biệt được cái nào là cái nào. */
export function PracticeCard({ ex, t, onOpen }) {
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

/* Nạp kho luyện tập, mới nhất trước.

   Trả `null` khi chưa nạp xong để phía gọi phân biệt được "đang chờ" với
   "kho rỗng" — hai trạng thái phải hiện khác nhau, gộp lại thì lúc mạng chậm
   người dùng đọc được câu "chưa có bài nào" trong khi thật ra là có. */
export function usePracticeStore(preset) {
  const [loaded, setLoaded] = useState(null);

  useEffect(() => {
    if (preset) return;
    let off = false;
    loadPractice().then((raw) => {
      if (!off) setLoaded(Array.isArray(raw) ? raw : []);
    }).catch(() => { if (!off) setLoaded([]); });
    return () => { off = true; };
  }, [preset]);

  return preset ?? loaded;
}

/* Lịch sử luyện tập của CHÍNH học sinh đang đăng nhập: `shared = false`, nên
   mỗi người chỉ đọc được kho của mình. Dạng { [exId]: {best, max, tries, at} }.

   Không có `name` thì không có kho nào để đọc — trả {} chứ đừng hỏi, vì khoá
   `mcf-ph-undefined` là một kho có thật và sẽ lẫn dữ liệu giữa các phiên. */
export function usePracticeHistory(name, preset) {
  const [hist, setHist] = useState(null);

  useEffect(() => {
    if (preset) return;
    if (!name) { setHist({}); return; }
    let off = false;
    load(`mcf-ph-${name}`, {}, false).then((raw) => {
      if (!off) setHist(raw && typeof raw === "object" ? raw : {});
    }).catch(() => { if (!off) setHist({}); });
    return () => { off = true; };
  }, [name, preset]);

  return preset ?? hist;
}

export function usePractice(preset) {
  const list = usePracticeStore(preset);

  /* `createdAt` là Date.now() lúc tạo (xem PracticeHub); bài cũ chưa có
     trường này thì rơi về 0 và xuống cuối, chứ không đẩy NaN vào phép so
     sánh làm thứ tự loạn. */
  return useMemo(() => {
    if (!list) return null;
    return [...list]
      .filter((e) => e && e.title)
      .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
      .slice(0, 12);
  }, [list]);
}

/* Khối hoàn chỉnh: tiêu đề, link "Xem tất cả", và ba trạng thái (đang nạp /
   rỗng / có bài). Màn hình gọi chỉ cần cắm vào. */
export function NewestPracticeRail({ t, onOpen, practice: preset }) {
  const newest = usePractice(preset);

  return (
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
        /* Đang nạp: khung xám giữ đúng chỗ để trang không giật khi dữ liệu về. */
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
        newest.map((ex) => <PracticeCard key={ex.id} ex={ex} t={t} onOpen={onOpen} />)
      )}
    </Carousel>
  );
}
