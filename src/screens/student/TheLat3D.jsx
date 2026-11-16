import React from "react";
import { RotateCw, Volume2, Quote } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Thẻ lật 3D + hiệu ứng chồng thẻ. Làm lại phần NHÌN 17/11 (chủ dự án: « màn luyện thẻ đẹp hơn »);
 * cách lật giữ nguyên.
 *
 * ══ LẬT 3D HOẠT ĐỘNG THẾ NÀO ══
 *
 * Bốn mảnh, thiếu một mảnh là hỏng theo một kiểu khác nhau (check:css canh cả bốn lớp):
 *
 * 1. `perspective` đặt ở thẻ CHA: khoảng cách từ mắt tới mặt phẳng. Thiếu thì phép quay chiếu song
 *    song, chữ chỉ bẹp dần rồi nở ra.
 * 2. `transform-style: preserve-3d` ở lớp QUAY. Mặc định trình duyệt bẹp mọi con cháu về một mặt
 *    phẳng, khi đó mặt sau không bao giờ ngửa ra.
 * 3. `backface-visibility: hidden` ở CẢ HAI mặt: thiếu thì giữa cú lật đọc được chữ ngược.
 * 4. Mặt sau quay sẵn `rotateY(180deg)`, nên khi cả khối quay 180° thì nó về đúng 0°.
 *
 * Hai mặt CHỒNG lên nhau (`absolute inset-0`), không xếp dọc. Tailwind 3 không có tiện ích xoay
 * trục Y nên dùng giá trị tuỳ ý `[transform:rotateY(180deg)]`.
 *
 * ══ CHỒNG THẺ ══
 *
 * Thẻ giả phía sau chỉ vẽ theo số thẻ CÒN LẠI thật (tối đa hai): vẽ cứng hai thẻ khi chỉ còn một
 * là nói dối bằng hình ảnh. Chúng `aria-hidden`, không nhận chuột. Độ lệch phải TÍNH: `scale`
 * thu quanh tâm nên mép trên tụt xuống, phải kéo lên đủ mới thấy nhô ra.
 *
 * ══ NÚT NGHE ══
 *
 * `onNghe` (tuỳ chọn): nút loa ở góc mặt trước. Nó là anh em của nút lật chứ không nằm trong,
 * vì nút lồng trong nút là HTML sai. Chỉ hiện ở mặt trước: mặt sau là nghĩa tiếng Việt.
 *
 * `prefers-reduced-motion`: vẫn lật được, chỉ đổi mặt tức thì. */

export default function TheLat3D({ mat, sau, viDu, daLat, onLat, conLai = 0, onNghe }) {
  return (
    <div className="relative mx-auto mt-4 w-full max-w-xl [perspective:1200px]">
      {conLai > 2 && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -translate-y-8 scale-[0.90] rounded-[2rem] border border-solid border-line bg-surface2" />
      )}
      {conLai > 1 && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -translate-y-[1.125rem] scale-[0.95] rounded-[2rem] border border-solid border-line bg-surface shadow-sm" />
      )}

      {onNghe && !daLat && (
        <button type="button" onClick={onNghe} title={tr("Nghe", "Écouter", "Listen")} aria-label={tr("Nghe từ này", "Écouter ce mot", "Listen to this word")}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 cursor-pointer place-items-center rounded-full border-0 bg-white/20 text-white backdrop-blur transition-transform hover:scale-110 hover:bg-white/30 active:scale-95">
          <Volume2 size={18} />
        </button>
      )}

      <button type="button" onClick={onLat} aria-pressed={daLat}
        className="group relative block w-full cursor-pointer rounded-[2rem] border-0 bg-transparent p-0 text-left font-sans outline-none focus-visible:ring-4 focus-visible:ring-primary/40">
        <div className={`relative min-h-72 w-full transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none ${daLat ? "[transform:rotateY(180deg)]" : ""}`}>

          {/* MẶT TRƯỚC: từ tiếng Pháp. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-8 shadow-[0_22px_48px_rgba(99,102,241,0.35)] [backface-visibility:hidden]">
            <span aria-hidden className="absolute -right-14 -top-16 h-52 w-52 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-110" />
            <span aria-hidden className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-110" />
            <span className="absolute left-5 top-5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold text-white">Français</span>
            <p lang="fr" className="relative m-0 text-balance break-words text-center text-4xl font-extrabold leading-tight tracking-tight text-white max-sm:text-3xl">{mat}</p>
            <span className="absolute bottom-5 inline-flex items-center gap-1.5 rounded-full bg-black/15 px-3.5 py-1.5 text-xs font-bold text-white/90">
              <RotateCw size={13} className="transition-transform duration-500 group-hover:rotate-180" /> {tr("Chạm để lật", "Touchez pour retourner", "Tap to flip")}
            </span>
          </div>

          {/* MẶT SAU: nghĩa, quay sẵn 180° nên khi cả khối quay 180° thì nó về 0°. */}
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] border border-solid border-line bg-surface shadow-[0_22px_48px_rgba(0,0,0,0.1)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span aria-hidden className="h-2 shrink-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 overflow-y-auto p-7">
              <p lang="fr" className="m-0 text-center text-sm font-bold text-soft">{mat}</p>
              <p className="m-0 text-balance break-words text-center text-3xl font-extrabold leading-snug text-ink max-sm:text-2xl">{sau}</p>
              {viDu && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-surface2 p-4">
                  <Quote size={16} className="mt-0.5 shrink-0 text-primary" />
                  <p lang="fr" className="m-0 text-sm italic leading-relaxed text-ink">{viDu}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
