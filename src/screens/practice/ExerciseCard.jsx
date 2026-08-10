import React, { useRef, useState } from "react";
import { Lock, ChevronDown, BookOpen, Lightbulb, FileCheck, Folder } from "lucide-react";
import { FloatingLayer, KebabMenu } from "../../shared/ui.jsx";
import { S } from "../../shared/tokens.js";
import { fmtPrice } from "../../shared/access.js";

/* Thẻ bài tập trong Thư viện luyện tập.

   Bố cục ngang: ảnh 16:9 bên trái cố định 14/16rem, nội dung bên phải. Dưới
   640px thì xếp dọc — ảnh 16:9 tràn ngang, vì ở bề rộng đó thẻ ngang sẽ bóp
   tiêu đề xuống còn hai ba chữ mỗi dòng.

   MÀU: dùng token (surface/ink/soft/line/primary) chứ không phải slate cứng.
   Token tự đảo ở bản tối qua tokens.css và được scripts/check-design.mjs đo
   tương phản WCAG. Viết `dark:bg-slate-800` vào đây thì thẻ này sẽ lệch tông
   với phần còn lại của Thư viện ở bản tối.

   PORTAL: cả hai menu (▾ tài liệu và ⋮ tuỳ chọn) đi qua FloatingLayer, vốn
   createPortal thẳng vào document.body với z-index 9999 và nền đặc. Bắt buộc
   phải vậy: thẻ có transition + shadow nên tự tạo stacking context, menu render
   tại chỗ sẽ bị thẻ hàng dưới đè lên. */

const MATERIALS = [
  ["vocab", BookOpen, "Vocabulaire"],
  ["expl", Lightbulb, "Explications"],
  ["corrige", FileCheck, "Sujet et Corrigé"],
];

/* Nút ghép "S'entraîner ▾": nửa trái vào thẳng bài, nửa phải mở tài liệu. */
function TrainButton({ onStart, onPickMaterial }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={onStart}
        className="cursor-pointer border-0 bg-primary py-2.5 pl-5 pr-4 font-[inherit] text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
        style={{ borderRadius: "999px 0 0 999px" }}
      >
        S'entraîner
      </button>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Ressources de l'exercice"
        className="ml-px cursor-pointer border-0 bg-primary px-3 font-[inherit] text-on-primary transition-opacity hover:opacity-90"
        style={{ borderRadius: "0 999px 999px 0" }}
      >
        <ChevronDown size={17} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      <FloatingLayer anchorRef={ref} open={open} onClose={() => setOpen(false)} width={210} radius={20} padding={6}>
        {MATERIALS.map(([kind, Icon, label]) => (
          <button
            key={kind}
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onPickMaterial(kind); }}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-transparent px-3.5 py-2.5 text-left font-[inherit] text-sm font-semibold text-ink hover:bg-bg"
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </FloatingLayer>
    </div>
  );
}

/* Ảnh 16:9. Bài chưa có ảnh thì dựng ô trung tính mang ký hiệu kỹ năng —
   cố tình không sinh ảnh giả, vì ảnh giả trông như dữ liệu thật. */
function Thumb({ ex }) {
  const base = "aspect-video w-full shrink-0 overflow-hidden rounded-xl sm:w-56 lg:w-64";

  if (ex.imageUrl) {
    return <img src={ex.imageUrl} alt="" loading="lazy" className={`${base} border-0 object-cover`} />;
  }
  return (
    <div aria-hidden className={`${base} grid place-items-center bg-surface2 text-3xl text-soft`}>
      {ex.audioUrl ? "🎧" : ex.readingText ? "📖" : "✎"}
    </div>
  );
}

export default function ExerciseCard({
  ex,
  premium = false,
  locked = false,
  best = null,
  typesLabel = "",
  folderLabel = null,
  t,
  onStart,
  onPickMaterial,
  onBuy,
  teacherActions = null,
}) {
  const nQ = ex.questions?.length ?? 0;

  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-surface p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row">
      <Thumb ex={ex} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span style={S.badge(ex.level)}>{ex.level}</span>

          {/* Bài đã mở khoá không hiện nhãn nào — nhắc "đã mua" trên mọi thẻ chỉ làm nhiễu. */}
          {!premium ? (
            <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-[11px] font-bold text-ok">
              {t("pay.free")}
            </span>
          ) : locked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] font-bold text-warn">
              <Lock size={11} /> {fmtPrice(ex.price)}
            </span>
          ) : null}

          {folderLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface2 px-2.5 py-0.5 text-[11px] font-bold text-soft">
              <Folder size={11} /> {folderLabel}
            </span>
          )}
        </div>

        <strong className="mb-1 block text-[15px] leading-snug text-ink">{ex.title}</strong>

        <div className="text-xs leading-relaxed text-soft">
          {nQ} question{nQ > 1 ? "s" : ""}
          {typesLabel && ` · ${typesLabel}`}
          {ex.audioUrl && " · 🎧"}
          {ex.readingText && " · 📖"}
          {ex.timeLimit && ` · ⏱ ${ex.timeLimit} min`}
        </div>

        {best && (
          <div className={`mt-1 text-xs font-bold ${best.max && best.best / best.max >= 0.8 ? "text-ok" : "text-primary"}`}>
            🏆 Meilleur : {best.best}/{best.max} ({best.tries} essai{best.tries > 1 ? "s" : ""})
          </div>
        )}

        <div className="mt-auto flex items-center justify-end gap-2 pt-4">
          {locked ? (
            <button
              type="button"
              onClick={onBuy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-5 py-2.5 font-[inherit] text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              <Lock size={15} /> {t("pay.buy")}
            </button>
          ) : (
            <TrainButton onStart={onStart} onPickMaterial={onPickMaterial} />
          )}

          {teacherActions && <KebabMenu items={teacherActions} />}
        </div>
      </div>
    </article>
  );
}
