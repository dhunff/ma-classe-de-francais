import React, { useEffect } from "react";
import { tr } from "../../shared/i18n.jsx";

/* Khung làm bài dùng chung cho Luyện tập (PracticeHub) và Bài được giao
   (Taking) — 07/10. Chủ dự án muốn chế độ Focus trông chuyên nghiệp, không
   emoji, và chạy đúng với mọi dạng bài (chỉ câu hỏi, có audio, có bài đọc).

   Ngoài Focus: tiêu đề + dòng thông tin dạng chữ + nút « Mode focus ».
   Trong Focus: phủ toàn màn hình, một thanh trên cố định chứa tên bài, tiến độ
   trả lời, đồng hồ (nếu có) và nút thoát; nội dung cuộn bên dưới. Thanh nghe /
   khoang bài đọc dính ngay dưới thanh này nhờ `FOCUS_TOP`.

   Esc thoát Focus — người dùng thử phím này đầu tiên. */
export const FOCUS_TOP = 72;

const fmtLeft = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function MetaLine({ items }) {
  const ok = items.filter(Boolean);
  if (!ok.length) return null;
  return (
    <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-soft">
      {ok.map((x, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden className="text-line-strong">·</span>}
          <span>{x}</span>
        </React.Fragment>
      ))}
    </p>
  );
}

export default function FocusShell({ zen, setZen, title, meta = [], answered, total, remaining, children }) {
  useEffect(() => {
    if (!zen) return;
    const k = (e) => { if (e.key === "Escape") setZen(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [zen, setZen]);

  if (!zen) {
    return (
      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="m-0 font-display text-2xl font-extrabold text-ink" style={{ textWrap: "balance" }}>{title}</h2>
            <div className="mt-1.5"><MetaLine items={meta} /></div>
          </div>
          <button type="button" onClick={() => setZen(true)}
            className="h-9 shrink-0 cursor-pointer rounded-full border border-solid border-line bg-surface px-4 font-sans text-sm font-bold text-ink transition-colors hover:border-primary hover:text-primary">
            {tr("Chế độ tập trung", "Mode focus", "Focus mode")}
          </button>
        </div>
        {children}
      </div>
    );
  }

  const pct = total ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="mcf-scroll fixed inset-0 z-[90] overflow-y-auto bg-bg">
      <header className="sticky top-0 z-30 border-0 border-b border-solid border-line bg-surface/95 backdrop-blur" style={{ height: FOCUS_TOP - 12 }}>
        <div className="mx-auto flex h-full max-w-6xl items-center gap-4 px-4">
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-sm font-extrabold text-ink">{title}</p>
            <MetaLine items={meta.slice(0, 2)} />
          </div>
          {total > 0 && (
            <div className="hidden w-48 shrink-0 sm:block">
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span className="text-soft">{tr("Đã làm", "Réponses", "Answered")}</span>
                <span className="tabular-nums text-ink">{answered}/{total}</span>
              </div>
              <div role="progressbar" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={total}
                className="h-1.5 overflow-hidden rounded-full bg-primary-soft">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
          {remaining != null && (
            <span className={["shrink-0 rounded-md px-3 py-1.5 text-base font-extrabold tabular-nums",
              remaining <= 300 ? "bg-danger-soft text-danger" : "bg-surface2 text-ink"].join(" ")}>
              {fmtLeft(remaining)}
            </span>
          )}
          <button type="button" onClick={() => setZen(false)} title="Échap"
            className="h-9 shrink-0 cursor-pointer rounded-full border-0 bg-ink px-4 font-sans text-sm font-bold text-bg transition-opacity hover:opacity-85">
            {tr("Thoát", "Quitter", "Exit")}
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6">{children}</div>
    </div>
  );
}
