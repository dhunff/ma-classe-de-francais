import React from "react";
import { Lock, Sparkles, ShieldCheck, NotebookPen, Infinity as InfinityIcon } from "lucide-react";

/* Thẻ hiện thay cho bài tập khi học sinh chưa có quyền mở bài trả phí.
 *
 * ══ ĐIỀU QUAN TRỌNG NHẤT VỀ FILE NÀY ══
 *
 * Nó KHÔNG phải hàng rào bảo mật. Nó là lời giải thích.
 *
 * Hàng rào nằm ở RLS trong Postgres (migration 019): khi học sinh chưa trả
 * tiền, database đơn giản là không trả về câu hỏi nào. Component này chỉ nói
 * cho người dùng biết vì sao màn hình trống.
 *
 * Phân biệt này quan trọng vì nó quyết định ĐIỀU KIỆN hiện thẻ. Cách sai:
 *
 *     if (!canOpen(ex, access, name)) return <PremiumLockCard/>;
 *
 * Sai không phải vì nó hỏng, mà vì nó tự quyết định — trong khi người duy nhất
 * có thẩm quyền quyết định là server. Nếu client nghĩ "được mở" mà server nghĩ
 * "không", người dùng thấy bài rỗng và không hiểu chuyện gì.
 *
 * Cách đúng: hỏi xem SERVER đã đưa gì. Không có câu hỏi nào về nghĩa là RLS đã
 * chặn — dựng thẻ này. Giao diện đi theo dữ liệu thật, nên hai bên không bao
 * giờ nói khác nhau.
 *
 * Preflight của Tailwind ĐANG TẮT trong dự án này (xem CLAUDE.md), nên mọi
 * <button> phải tự khai `border-0` và nền, mọi tiêu đề phải có `m-0`. Thiếu là
 * trình duyệt trả lại viền xám và margin mặc định.
 */

const LOI_ICH = [
  { icon: Sparkles,     text: "Phân tích lỗi sai chi tiết theo phương pháp Linear Thinking." },
  { icon: NotebookPen,  text: "Sổ tay mẹo làm bài độc quyền (Mon Carnet)." },
  { icon: InfinityIcon, text: "Không giới hạn số lần làm bài và chấm điểm tự động." },
];

export default function PremiumLockCard({ ex, onBuy, onBack, price }) {
  return (
    <div className="mx-auto max-w-2xl py-10">
      {/* Siêu dữ liệu vẫn hiện được vì RLS CỐ Ý mở bảng `exercises` — chỉ
          `questions` mới bị khoá. Nhờ vậy mời chào được mà không lộ đề. */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-8 shadow-xl">

        {/* Nền mờ gợi ý "có nội dung phía sau", thuần trang trí, aria-hidden để
            trình đọc màn hình bỏ qua. */}
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-soft blur-3xl opacity-60" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            <Lock size={13} /> Premium
          </span>

          <h2 className="m-0 mt-4 text-2xl font-extrabold leading-snug text-ink">
            Exercice Réservé aux Membres Premium (DELF B1–B2)
          </h2>

          {ex && (
            <p className="m-0 mt-2 text-sm text-soft">
              <strong className="text-ink">{ex.title}</strong>
              {ex.level ? ` · ${ex.level}` : ""}
              {Array.isArray(ex.skills) && ex.skills.length ? ` · ${ex.skills.join(", ")}` : ""}
            </p>
          )}

          <ul className="m-0 mt-6 list-none space-y-3 p-0">
            {LOI_ICH.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icon size={14} />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBuy}
              className="inline-flex items-center gap-2 rounded-full border-0 bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Sparkles size={16} />
              Nâng cấp gói học ngay
              {price ? <span className="opacity-80">· {price}</span> : null}
            </button>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-full border-0 bg-transparent px-4 py-3 text-sm font-semibold text-soft transition hover:text-ink"
              >
                Quay lại
              </button>
            )}
          </div>

          <p className="m-0 mt-6 flex items-center gap-2 text-xs text-soft">
            <ShieldCheck size={13} className="shrink-0" />
            Nội dung bài học được khoá ở phía máy chủ — không tải về trình duyệt
            trước khi bạn có quyền truy cập.
          </p>
        </div>
      </div>
    </div>
  );
}
