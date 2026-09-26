import React, { useEffect, useState } from "react";
import Joyride, { STATUS, ACTIONS, EVENTS } from "react-joyride";
import { X } from "lucide-react";
import { useT } from "./i18n.jsx";

/* Tour giới thiệu dùng chung (react-joyride) — màn Lịch, màn Flashcard, …
 *
 * Chỉ hiện MỘT lần trên mỗi máy: cờ `khoa` trong localStorage. Đọc/ghi bọc
 * try — trình duyệt chặn storage thì tour hiện lại, còn hơn làm vỡ màn hình.
 *
 * `sanSang`: màn có dữ liệu tải về (vd. danh sách bộ thẻ) thì chỉ bắt đầu khi
 * phần tử đích ĐÃ có trong DOM. Joyride gặp đích không tồn tại sẽ lặng lẽ bỏ
 * bước đó — tour 3 bước còn 1 bước mà không ai biết vì sao.
 *
 * Đích nên là phần tử NẰM TRONG màn hình lúc mở trang: trang cuộn trong
 * <main> (xem AppLayout) chứ không cuộn cửa sổ, nên Joyride không cuộn tới
 * phần tử ở dưới xa — tooltip sẽ tràn khỏi màn hình (đã đo ở màn Lịch).
 *
 * Tooltip là component riêng bằng Tailwind + token màu, tự đổi sáng/tối. */

const daXem = (k) => { try { return localStorage.getItem(k) === "true"; } catch { return false; } };
const danhDau = (k) => { try { localStorage.setItem(k, "true"); } catch { /* bỏ qua */ } };

/* `giao`: "xp" cho tour về XP — viền + nút hổ phách, cùng tông nhãn XP trên
   thanh trên. Mặc định là màu thương hiệu. */
function TooltipRieng({ index, size, step, isLastStep, backProps, primaryProps, skipProps, closeProps, tooltipProps, t, giao }) {
  const xp = giao === "xp";
  return (
    <div {...tooltipProps}
      className={`relative w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-solid bg-surface p-5 font-sans shadow-2xl ${xp ? "border-amber-100 ring-1 ring-amber-500/20 dark:border-amber-900/30" : "border-line"}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="m-0 text-lg font-bold text-ink">{step.title}</h3>
        <button {...closeProps} type="button" aria-label={t("identity.close")}
          className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft transition-colors hover:text-ink">
          <X size={16} />
        </button>
      </div>
      <p className="m-0 mb-6 mt-2 text-sm leading-relaxed text-soft">{step.content}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold tabular-nums text-soft">{index + 1} / {size}</span>
        <span className="flex-1" />
        {!isLastStep && (
          <button {...skipProps} type="button"
            className="cursor-pointer rounded-xl border-0 bg-transparent px-3 py-2 font-sans text-sm font-medium text-soft transition-colors hover:text-ink">
            {t("tour.skip")}
          </button>
        )}
        {index > 0 && (
          <button {...backProps} type="button"
            className="cursor-pointer rounded-xl border-0 bg-surface2 px-3 py-2 font-sans text-sm font-medium text-ink transition-colors hover:bg-primary-soft">
            {t("tour.back")}
          </button>
        )}
        <button {...primaryProps} type="button"
          className={xp
            ? "cursor-pointer rounded-xl border-0 bg-amber-500 px-4 py-2 font-sans text-sm font-bold text-white shadow-md transition-colors hover:bg-amber-600"
            : "cursor-pointer rounded-xl border-0 bg-primary px-4 py-2 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90"}>
          {isLastStep ? (step.finishLabel ?? t("tour.finish")) : t("tour.next")}
        </button>
      </div>
    </div>
  );
}

export default function TourGioiThieu({ khoa, steps, sanSang = true, giao }) {
  const t = useT();
  const [chay, setChay] = useState(false);

  /* Chờ một nhịp cho hoạt ảnh vào trang xong rồi mới đo vị trí. */
  useEffect(() => {
    if (!sanSang || daXem(khoa)) return;
    const hen = setTimeout(() => setChay(true), 700);
    return () => clearTimeout(hen);
  }, [khoa, sanSang]);

  const xuLy = ({ status, action, type }) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)
        || (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER)) {
      danhDau(khoa);
      setChay(false);
    }
  };

  if (!chay) return null;
  return (
    <Joyride
      steps={steps.map((s) => ({ disableBeacon: true, placement: "auto", ...s }))}
      run={chay}
      continuous
      showSkipButton
      disableOverlayClose
      callback={xuLy}
      tooltipComponent={(p) => <TooltipRieng {...p} t={t} giao={giao} />}
      styles={{
        options: { zIndex: 10000, arrowColor: "var(--mcf-surface)" },
        /* Không dùng backdrop-filter: nó làm mờ CẢ vùng được chiếu sáng. */
        overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        spotlight: { borderRadius: 24 },
      }}
    />
  );
}
