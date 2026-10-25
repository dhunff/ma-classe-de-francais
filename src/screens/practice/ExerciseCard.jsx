import React, { useRef, useState } from "react";
import { Lock, ChevronDown, Play, BookOpen, Lightbulb, FileCheck, Folder, Star, Trophy } from "lucide-react";
import { FloatingLayer, KebabMenu } from "../../shared/ui.jsx";
import { S } from "../../shared/tokens.js";
import { fmtPrice } from "../../shared/access.js";
import { giaXp as tinhGiaXp } from "../../shared/premium.js";
import { anhMacDinh } from "../../shared/anhMacDinh.js";
import { tr } from "../../shared/i18n.jsx";

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

const MATERIALS = () => [
  ["vocab", BookOpen, tr("Từ vựng", "Vocabulaire", "Vocabulary")],
  ["expl", Lightbulb, tr("Giải thích", "Explications", "Explanations")],
  ["corrige", FileCheck, tr("Đề và đáp án", "Sujet et corrigé", "Task and answer key")],
];

/* Nút ghép "S'entraîner ▾": nửa trái vào thẳng bài, nửa phải mở tài liệu. */
function TrainButton({ onStart, onPickMaterial }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  return (
    /* 23/10: nút trải hết ngang thẻ, nền chuyển màu + gờ dưới kiểu nút bấm nổi;
       nút tài liệu tách thành ô vuông riêng bên phải. */
    <div ref={ref} className="relative flex w-full items-stretch gap-2">
      <button
        type="button"
        onClick={onStart}
        className="group inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 border-b-4 border-solid border-blue-800 bg-gradient-to-r from-primary to-indigo-600 px-4 py-2.5 font-[inherit] text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 transition-transform group-hover:scale-110"><Play size={13} fill="currentColor" /></span>
        {tr("Luyện tập", "S'entraîner", "Practice")}
      </button>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={tr("Tài liệu của bài", "Ressources de l'exercice", "Exercise resources")}
        title={tr("Từ vựng, giải thích, đáp án", "Vocabulaire, explications, corrigé", "Vocabulary, tips, answer key")}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-2xl border border-solid border-line bg-surface px-3 font-[inherit] text-primary transition-colors hover:bg-primary-soft"
      >
        <BookOpen size={17} />
        <ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      <FloatingLayer anchorRef={ref} open={open} onClose={() => setOpen(false)} width={210} radius={20} padding={6}>
        {MATERIALS().map(([kind, Icon, label]) => (
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

/* Ảnh 16:9. Bài chưa có ảnh thì dùng ẢNH MẶC ĐỊNH THEO KỸ NĂNG (bucket
   `Default`, 06/10) — hình minh hoạ chung, không phải ngữ liệu. Ảnh mặc định
   tải hỏng thì lùi về ô trung tính mang ký hiệu kỹ năng như trước. */
function Thumb({ ex }) {
  const base = "aspect-video w-full shrink-0 overflow-hidden rounded-2xl";
  const [hong, setHong] = useState(false);

  if (ex.imageUrl) {
    return <img src={ex.imageUrl} alt="" loading="lazy" className={`${base} border-0 object-cover`} />;
  }
  if (!hong) {
    return <img src={anhMacDinh(ex)} alt="" loading="lazy" onError={() => setHong(true)}
      className={`${base} border-0 object-cover`} />;
  }
  return (
    <div aria-hidden className={`${base} grid place-items-center bg-surface2 text-4xl text-soft`}>
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
  onDoiXp = null,
  teacherActions = null,
}) {
  const giaXp = tinhGiaXp(ex);
  const nQ = ex.questions?.length ?? 0;

  return (
    <article className="flex h-full flex-col gap-3 rounded-3xl border border-solid border-line bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className={`relative ${locked ? "opacity-75" : ""}`}>
        <Thumb ex={ex} />
        {locked && (
          <span className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white">
            <Lock size={15} />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span style={S.badge(ex.level)}>{ex.level}</span>
          {/* 26/10: bài tạo trong 30 ngày gần nhất. */}
          {Number(ex.createdAt) > Date.now() - 30 * 864e5 && (
            <span className="rounded-full bg-danger px-2.5 py-0.5 text-[11px] font-extrabold text-white">{tr("Mới", "Nouveau", "New")}</span>
          )}

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
          {premium && locked && giaXp ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-primary">
              <Star size={11} /> {giaXp} XP
            </span>
          ) : null}

          {folderLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface2 px-2.5 py-0.5 text-[11px] font-bold text-soft">
              <Folder size={11} /> {folderLabel}
            </span>
          )}
        </div>

        <strong className="mb-1 block text-base font-extrabold leading-snug text-ink">{ex.title}</strong>

        <div className="text-xs leading-relaxed text-soft">
          {nQ} {tr("câu", "question", "question")}{nQ > 1 ? "s" : ""}
          {typesLabel && ` · ${typesLabel}`}
          {ex.audioUrl && " · 🎧"}
          {ex.readingText && " · 📖"}
          {ex.timeLimit && ` · ⏱ ${ex.timeLimit} min`}
        </div>

        {best && (
          <div className={`mt-1 text-xs font-bold ${best.max && best.best / best.max >= 0.8 ? "text-ok" : "text-primary"}`}>
            <Trophy size={12} className="inline align-[-1px]" /> {tr(`Tốt nhất: ${best.best}/${best.max} (${best.tries} lượt)`, `Meilleur : ${best.best}/${best.max} (${best.tries} essai${best.tries > 1 ? "s" : ""})`, `Best: ${best.best}/${best.max} (${best.tries} tr${best.tries > 1 ? "ies" : "y"})`)}
          </div>
        )}

        <div className="mt-auto flex items-stretch gap-2 pt-3">
          {locked && giaXp && onDoiXp && (
            <button type="button" onClick={onDoiXp}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border border-solid border-primary bg-transparent px-3 py-2 font-[inherit] text-[13px] font-bold text-primary transition-colors hover:bg-primary-soft">
              <Star size={15} /> {t("xp.unlock_btn", { n: giaXp })}
            </button>
          )}
          {locked ? (
            <button
              type="button"
              onClick={onBuy}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-0 border-b-4 border-solid border-amber-700 bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 font-[inherit] text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(245,158,11,0.3)] transition-transform hover:-translate-y-0.5"
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
