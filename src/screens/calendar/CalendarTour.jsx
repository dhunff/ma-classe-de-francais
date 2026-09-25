import React from "react";
import TourGioiThieu from "../../shared/TourGioiThieu.jsx";

/* Tour màn Lịch (25/09). Phần máy móc nằm ở shared/TourGioiThieu.jsx.
 *
 * Đích (id đặt trong CalendarView.jsx):
 *   #tour-cal-grid  — hàng tên thứ ở đầu lưới tuần (cả lưới cao hơn màn hình
 *                     và nằm trong <main> cuộn riêng, Joyride không cuộn tới được)
 *   #tour-cal-form  — khối « Sự kiện mới » bên phải
 *   #tour-cal-nav   — cụm « Hôm nay / ‹ / › » */
export default function CalendarTour({ t }) {
  return (
    <TourGioiThieu khoa="hasSeenCalendarTour" steps={[
      { target: "#tour-cal-grid", title: t("tour.cal1_title"), content: t("tour.cal1_body") },
      { target: "#tour-cal-form", title: t("tour.cal2_title"), content: t("tour.cal2_body") },
      { target: "#tour-cal-nav", title: t("tour.cal3_title"), content: t("tour.cal3_body"), placement: "bottom-end" },
    ]} />
  );
}
