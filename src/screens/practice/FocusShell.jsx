import React, { useEffect } from "react";
import { tr } from "../../shared/i18n.jsx";
import NutTieng from "../../shared/NutTieng.jsx";

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

/* Đầu bài có màu kỹ năng (01/11): `mau` = { nen, dam, Icon }. Không truyền thì giữ đầu trang
   cũ. Vòng tiến độ đọc từ `answered`/`total`, cùng nguồn với thanh ở chế độ tập trung. */
function DauBaiMau({ mau, title, meta, answered, total, onTapTrung }) {
  const pct = total ? Math.round((answered / total) * 100) : 0;
  return (
    <header className="mcf-cau-vao relative mb-5 overflow-hidden rounded-3xl px-5 py-4 text-white shadow-md sm:px-6" style={{ background: mau.nen }}>
      <mau.Icon aria-hidden size={132} strokeWidth={1.25} className="pointer-events-none absolute -bottom-8 right-24 text-white/10" />
      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20"><mau.Icon size={24} /></span>
        <div className="min-w-[12rem] flex-1">
          <h2 className="m-0 font-display text-2xl font-extrabold leading-tight" style={{ textWrap: "balance" }}>{title}</h2>
          <p className="m-0 mt-2 flex flex-wrap gap-1.5">
            {meta.filter(Boolean).map((x) => <span key={x} className="rounded-full bg-black/20 px-2.5 py-0.5 text-xs font-bold">{x}</span>)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {total > 0 && (
            <span role="img" aria-label={tr(`Đã làm ${answered} trên ${total} câu`, `${answered} réponses sur ${total}`, `${answered} of ${total} answered`)}
              className="grid h-14 w-14 place-items-center rounded-full" style={{ background: `conic-gradient(#fff ${pct * 3.6}deg, rgba(255,255,255,0.25) 0)` }}>
              <span className="grid h-11 w-11 place-items-center rounded-full text-xs font-extrabold tabular-nums" style={{ background: mau.dam }}>{answered}/{total}</span>
            </span>
          )}
          <NutTieng />
          <button type="button" onClick={onTapTrung} className="h-9 cursor-pointer rounded-full border-0 bg-white px-4 font-sans text-sm font-bold shadow-sm" style={{ color: mau.dam }}>
            {tr("Chế độ tập trung", "Mode focus", "Focus mode")}
          </button>
        </div>
      </div>
    </header>
  );
}

export default function FocusShell({ zen, setZen, title, meta = [], answered, total, remaining, mau = null, children }) {
  useEffect(() => {
    if (!zen) return;
    const k = (e) => { if (e.key === "Escape") setZen(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [zen, setZen]);

  if (!zen && mau) {
    return <div><DauBaiMau mau={mau} title={title} meta={meta} answered={answered} total={total} onTapTrung={() => setZen(true)} />{children}</div>;
  }

  if (!zen) {
    return (
      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="m-0 font-display text-2xl font-extrabold text-ink" style={{ textWrap: "balance" }}>{title}</h2>
            <div className="mt-1.5"><MetaLine items={meta} /></div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
          <NutTieng />
          <button type="button" onClick={() => setZen(true)}
            className="h-9 shrink-0 cursor-pointer rounded-full border border-solid border-line bg-surface px-4 font-sans text-sm font-bold text-ink transition-colors hover:border-primary hover:text-primary">
            {tr("Chế độ tập trung", "Mode focus", "Focus mode")}
          </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  const pct = total ? Math.round((answered / total) * 100) : 0;
  return (
    <div data-che-do-thi className="mcf-scroll fixed inset-0 z-[90] overflow-y-auto bg-bg">
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
          <NutTieng />
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
