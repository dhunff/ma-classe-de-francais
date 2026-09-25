import React, { useEffect, useState } from "react";
import Joyride, { STATUS, ACTIONS, EVENTS } from "react-joyride";
import { X } from "lucide-react";

/* Tour giới thiệu màn Lịch cho người mới (25/09).
 *
 * Chỉ hiện MỘT lần trên mỗi máy: cờ `hasSeenCalendarTour` trong localStorage.
 * Đọc/ghi đều bọc try — trình duyệt chặn storage (chế độ riêng tư) thì tour
 * hiện lại mỗi lần, còn hơn là làm vỡ cả màn Lịch.
 *
 * Ba phần tử đích mang id cố định trong CalendarView.jsx:
 *   #tour-cal-grid  — hàng tên thứ ở đầu lưới tuần (cả lưới cao hơn màn hình
 *                     và nằm trong <main> cuộn riêng, Joyride không cuộn tới được)
 *   #tour-cal-form  — khối « Sự kiện mới » bên phải
 *   #tour-cal-nav   — cụm « Hôm nay / ‹ / › »
 * Đổi tên id ở đó thì tour mất đích (Joyride bỏ qua bước không tìm thấy).
 *
 * Tooltip là component RIÊNG bằng Tailwind + token màu, nên tự đổi theo
 * sáng/tối như mọi thẻ khác — không dùng style mặc định của Joyride. */

const KHOA = "hasSeenCalendarTour";
const daXem = () => { try { return localStorage.getItem(KHOA) === "true"; } catch { return false; } };
const danhDau = () => { try { localStorage.setItem(KHOA, "true"); } catch { /* bỏ qua */ } };

function TooltipRieng({ index, size, step, isLastStep, backProps, primaryProps, skipProps, closeProps, tooltipProps, t }) {
  return (
    <div {...tooltipProps}
      className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-solid border-line bg-surface p-5 font-sans shadow-2xl">
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
          className="cursor-pointer rounded-xl border-0 bg-primary px-4 py-2 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90">
          {isLastStep ? t("tour.finish") : t("tour.next")}
        </button>
      </div>
    </div>
  );
}

export default function CalendarTour({ t }) {
  const [chay, setChay] = useState(false);

  /* Chờ một nhịp cho màn Lịch dựng xong (có hoạt ảnh vào trang) rồi mới bắt
     đầu — bắt đầu ngay thì Joyride đo vị trí lúc phần tử còn đang trượt vào. */
  useEffect(() => {
    if (daXem()) return;
    const hen = setTimeout(() => setChay(true), 700);
    return () => clearTimeout(hen);
  }, []);

  const steps = [
    { target: "#tour-cal-grid", title: t("tour.cal1_title"), content: t("tour.cal1_body"), disableBeacon: true, placement: "auto" },
    { target: "#tour-cal-form", title: t("tour.cal2_title"), content: t("tour.cal2_body"), disableBeacon: true, placement: "auto" },
    { target: "#tour-cal-nav", title: t("tour.cal3_title"), content: t("tour.cal3_body"), disableBeacon: true, placement: "bottom-end" },
  ];

  const xuLy = ({ status, action, type }) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)
        || (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER)) {
      danhDau();
      setChay(false);
    }
  };

  if (!chay) return null;
  return (
    <Joyride
      steps={steps}
      run={chay}
      continuous
      showSkipButton
      disableOverlayClose
      scrollToFirstStep
      scrollOffset={120}
      callback={xuLy}
      tooltipComponent={(p) => <TooltipRieng {...p} t={t} />}
      styles={{
        options: { zIndex: 10000, arrowColor: "var(--mcf-surface)" },
        /* Không dùng backdrop-filter: nó làm mờ CẢ vùng được chiếu sáng. */
        overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        spotlight: { borderRadius: 24 },
      }}
    />
  );
}
