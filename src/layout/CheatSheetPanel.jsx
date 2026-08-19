import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Lightbulb, Inbox, SearchX } from "lucide-react";
import { loadTips } from "../shared/tips.js";

/* Sổ tay — tấm trượt ra từ mép phải, chứa mẹo và cấu trúc hay quên.
 *
 * ĐẶT TRONG TẤM THẺ NỘI DUNG, không phải `fixed` toàn màn hình. AppLayout bọc
 * nội dung trong một thẻ có `overflow-hidden` và bo góc trái; đặt panel
 * `absolute` bên trong thẻ đó thì nó tự bị cắt theo đúng khung ấy — trượt đè
 * lên phần trắng, không bao giờ liếm sang thanh bên xanh. Dùng `fixed` là mất
 * đúng hiệu ứng "lồng trong thẻ" mà cả bố cục đang dựa vào.
 *
 * DỮ LIỆU THẬT, từ bảng `public.tips` (migration 009). Giáo viên soạn ở
 * /professeur/carnet. Chưa có mẹo nào thì hiện trạng thái rỗng nói rõ lý do —
 * không nhét mẹo mẫu vào mã, vì học sinh sẽ tưởng giáo viên viết mà giáo viên
 * lại không sửa được. Fixture để xem bố cục nằm ở preview.jsx.
 *
 * Preflight bị tắt nên mọi <button>/<input> đều tự khai border và nền.
 */

/* Màu viền theo nhóm mẹo. Đi qua token để đảo đúng ở bản tối. */
const TAG_TONE = {
  grammaire: "border-l-primary",
  vocabulaire: "border-l-ok",
  méthode: "border-l-warn",
  piège: "border-l-danger",
};
const toneOf = (tag) => TAG_TONE[String(tag || "").toLowerCase()] || "border-l-primary";

/* Bỏ dấu để tìm kiếm không phụ thuộc việc gõ dấu — người học tiếng Pháp gõ
   "elision" phải ra được mẹo viết "élision". */
const fold = (s) => String(s ?? "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().trim();

function TipCard({ tip }) {
  return (
    <article
      className={[
        "group cursor-pointer rounded-2xl border-0 border-l-4 border-solid bg-surface2/70 p-4",
        toneOf(tip.tag),
        "transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)]",
        "hover:-translate-y-0.5 hover:bg-surface hover:shadow-[0_10px_28px_rgb(0,0,0,0.10)]",
      ].join(" ")}
    >
      {tip.tag && (
        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.14em] text-soft">
          {tip.tag}
        </p>
      )}
      <h3 className="m-0 mt-1 text-sm font-extrabold leading-snug text-ink">{tip.title}</h3>
      {tip.body && (
        <p className="m-0 mt-1.5 whitespace-pre-line text-xs leading-relaxed text-soft">
          {tip.body}
        </p>
      )}
    </article>
  );
}

function Empty({ Icon, title, body }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <Icon size={26} className="text-soft" strokeWidth={1.6} />
      <p className="m-0 text-sm font-bold text-ink">{title}</p>
      <p className="m-0 max-w-xs text-sm text-soft">{body}</p>
    </div>
  );
}

export default function CheatSheetPanel({ open, onClose, t, tips: tipsProp }) {
  const [loaded, setLoaded] = useState(null);
  const [q, setQ] = useState("");
  const searchRef = useRef(null);

  /* Chỉ nạp khi mở lần đầu. Nạp lúc dựng vỏ ứng dụng là bắt mọi người tải một
     danh sách mà phần lớn không bao giờ mở. */
  useEffect(() => {
    if (tipsProp || !open || loaded !== null) return;
    let off = false;
    loadTips().then((rows) => { if (!off) setLoaded(rows); })
      .catch(() => { if (!off) setLoaded([]); });
    return () => { off = true; };
  }, [open, tipsProp, loaded]);

  // Escape đóng panel — cùng nếp với các menu thả xuống ở topbar.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Mở ra thì con trỏ nhảy thẳng vào ô tìm — mở sổ tay là để tra.
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 220);
  }, [open]);

  const tips = tipsProp ?? loaded;

  const shown = useMemo(() => {
    if (!tips) return null;
    const needle = fold(q);
    if (!needle) return tips;
    return tips.filter((x) =>
      fold(x.title).includes(needle)
      || fold(x.body).includes(needle)
      || fold(x.tag).includes(needle));
  }, [tips, q]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Lớp phủ chỉ trong tấm thẻ, nên phần thanh bên vẫn bấm được — đây
              là ngăn kéo phụ trợ, không phải hộp thoại chặn đường. */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-ink/20"
            aria-hidden
          />

          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="false"
            aria-label={t("carnet.title")}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-0 border-l border-solid border-line bg-surface shadow-2xl sm:w-96"
          >
            <header className="flex shrink-0 items-start gap-3 border-0 border-b border-solid border-line px-5 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Lightbulb size={19} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="m-0 truncate text-sm font-extrabold text-ink">{t("carnet.title")}</h2>
                <p className="m-0 mt-0.5 truncate text-xs text-soft">
                  {shown && shown.length ? t("carnet.count", { n: shown.length }) : t("carnet.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("carnet.close")}
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-soft transition-colors hover:bg-surface2 hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <X size={18} />
              </button>
            </header>

            <div className="shrink-0 px-5 pt-4">
              <label className="relative flex items-center">
                <Search size={15} className="pointer-events-none absolute left-3.5 text-soft" />
                <span className="sr-only">{t("carnet.search")}</span>
                <input
                  ref={searchRef}
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("carnet.search")}
                  className="h-10 w-full rounded-xl border-0 bg-surface2 pl-10 pr-3 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-soft focus:ring-2 focus:ring-primary/40"
                />
              </label>
            </div>

            <div className="mcf-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">
              {shown === null ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface2/70" />
                  ))}
                </div>
              ) : shown.length === 0 ? (
                q.trim()
                  ? <Empty Icon={SearchX} title={t("carnet.no_result_title")} body={t("carnet.no_result_body")} />
                  : <Empty Icon={Inbox} title={t("carnet.empty_title")} body={t("carnet.empty_body")} />
              ) : (
                <div className="flex flex-col gap-3">
                  {shown.map((tip, i) => <TipCard key={tip.id ?? i} tip={tip} />)}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
