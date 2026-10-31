import React from "react";
import { Menu, Moon, Sun } from "lucide-react";
import SearchBox from "./SearchBox.jsx";
import XPBadge from "./XPBadge.jsx";
import TourGioiThieu from "../shared/TourGioiThieu.jsx";
import LangMenu from "./LangMenu.jsx";
import MessagesMenu from "./MessagesMenu.jsx";
import AvatarMenu from "./AvatarMenu.jsx";

/* Topbar: thanh nổi riêng trên nền trang (31/10, chủ dự án: bản trong suốt cũ hoà vào nội dung).

   Trái: nút hamburger (chỉ trên mobile) + vạch màu, tiêu đề trang, ngày hôm nay.
   Phải: tìm kiếm, cụm ngôn ngữ, tin nhắn, chuông, rồi XP và ảnh đại diện.

   Nút sáng/tối RIÊNG đã bỏ — nó chuyển vào menu ảnh đại diện. Cùng lý do,
   khối hồ sơ ở chân thanh bên cũng đi: mọi thao tác về tài khoản nay gom về
   một cửa duy nhất, thay vì rải ba chỗ.

   Khách chưa đăng nhập không có ảnh đại diện để bấm, nên với họ menu đó không
   dựng ra — lối đăng nhập vẫn nằm ở chân thanh bên. Vì vậy nút sáng/tối phải
   có đường thay thế cho khách; xem `onToggleDark` bên dưới. */

export default function Topbar({
  session, title, t, lang, langs, onLang, dark, onToggleDark, onLogout, bell,
  conversations = [], query, onQuery, onOpenMenu,
}) {
  const signedIn = !!session;
  const homNay = new Date().toLocaleDateString({ vi: "vi-VN", fr: "fr-FR", en: "en-GB" }[lang] ?? "vi-VN", { weekday: "long", day: "numeric", month: "long" });

  return (
    /* Khối thứ hai của nhịp vào trang: thanh bên (0ms) → topbar (60ms) →
       nội dung (RISE_BASE=140ms trở đi, xem screens/dashboard/parts.jsx).

       Không cần `sticky`: nó nằm SẴN trong tấm thẻ nội dung và chỉ <main> mới cuộn
       (xem AppLayout). z-30 để menu thả xuống nằm trên nội dung. KHÔNG đặt
       overflow-hidden ở thanh: nó sẽ cắt mất các menu đó, nên vạch màu đáy là
       phần tử riêng. */
    <header className="mcf-rise relative z-30 shrink-0 px-3 pt-3 md:px-6 md:pt-4" style={{ "--mcf-delay": "60ms" }}>
      <div className="relative flex h-16 items-center gap-2 rounded-2xl bg-surface bg-[linear-gradient(100deg,rgb(var(--mcf-primary-rgb)/0.14)_0%,rgb(var(--mcf-primary-rgb)/0.03)_38%,transparent_64%)] px-3 shadow-[0_10px_28px_rgb(var(--mcf-primary-rgb)/0.14)] ring-1 ring-primary/10 md:gap-3 md:px-5">
        <span aria-hidden className="absolute inset-x-6 bottom-0 h-[3px] rounded-t-full bg-gradient-to-r from-primary via-violet-500 to-rose-500" />
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t("nav.open_menu")}
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-soft transition-colors hover:bg-surface2 hover:text-ink md:hidden"
        >
          <Menu size={20} />
        </button>

        {title && (
          <div className="flex min-w-0 shrink items-center gap-3">
            <span aria-hidden className="hidden h-9 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-primary to-violet-500 md:block" />
            <div className="min-w-0">
              <h1 className="m-0 truncate text-base font-extrabold leading-tight tracking-tight text-ink md:text-xl">{title}</h1>
              <p className="m-0 hidden truncate text-xs font-medium capitalize text-soft md:block">{homNay}</p>
            </div>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <SearchBox session={session} query={query} onQuery={onQuery} t={t} />

          <div className="flex items-center rounded-full bg-surface2 p-0.5">
            <LangMenu lang={lang} langs={langs} onLang={onLang} t={t} />

            <MessagesMenu t={t} conversations={conversations} />

            {bell}
          </div>

          {/* « Sổ tay » GỠ 15/10 theo chủ dự án (ít dùng). Bảng tips vẫn còn. */}
          {signedIn ? (
            <>
              {/* Vạch ngăn: tách nhóm "thông báo" khỏi "tài khoản". Thuần
                  trang trí nên ẩn với trình đọc màn hình. */}
              {/* Tour giao diện (27/09): chỉ cho người mới chỗ bật NỀN TỐI — công tắc
                  nằm trong menu ảnh đại diện nên khó tìm — và sổ tay. Một lần
                  mỗi trình duyệt, chỉ khi đã đăng nhập (menu ảnh mới có). */}
              <TourGioiThieu khoa="hasSeenGiaoDienTour" steps={[
                { target: "#tour-gd-avatar", title: t("tour.gd1_title"), content: t("tour.gd1_body"), placement: "bottom-end" },
              ]} />
              {/* XP ngay trước ảnh đại diện — chỉ học sinh có số dư XP. */}
              {session?.role === "eleve" && <XPBadge t={t} />}
              <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-line" />
              <AvatarMenu
                session={session}
                t={t}
                dark={dark}
                onToggleDark={onToggleDark}
                onLogout={onLogout}
              />
            </>
          ) : (
            /* Khách không có menu ảnh đại diện, mà nút sáng/tối vừa dọn vào
               trong đó. Giữ lại nút riêng cho họ, nếu không người chưa đăng
               nhập mất hẳn đường đổi nền. */
            <button
              type="button"
              onClick={onToggleDark}
              title={dark ? t("header.light_mode") : t("header.dark_mode")}
              aria-pressed={dark}
              className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-soft transition-all duration-200 hover:scale-110 hover:bg-surface2 hover:text-ink"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
