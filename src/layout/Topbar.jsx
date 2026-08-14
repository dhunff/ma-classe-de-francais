import React from "react";
import { Search, Menu, Moon, Sun } from "lucide-react";
import LangMenu from "./LangMenu.jsx";
import MessagesMenu from "./MessagesMenu.jsx";
import AvatarMenu from "./AvatarMenu.jsx";

/* Topbar tối giản.

   Trái: nút hamburger (chỉ trên mobile) + tiêu đề trang hiện tại.
   Phải: tìm kiếm, ngôn ngữ, tin nhắn, chuông, | , ảnh đại diện.

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

  return (
    /* Khối thứ hai của nhịp vào trang: thanh bên (0ms) → topbar (60ms) →
       nội dung (RISE_BASE=140ms trở đi, xem screens/dashboard/parts.jsx).

       Trong suốt, không viền, không `sticky`: nó nằm SẴN trong tấm thẻ nội
       dung và chỉ <main> mới cuộn (xem AppLayout), nên topbar đứng yên mà
       không cần neo. Thêm nền hay viền ở đây là vẽ một đường chia cắt ngang
       tấm thẻ vốn phải liền mạch. */
    <header className="mcf-rise shrink-0 bg-transparent" style={{ "--mcf-delay": "60ms" }}>
      <div className="flex h-20 items-center gap-2 px-4 md:gap-3 md:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t("nav.open_menu")}
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-soft transition-colors hover:bg-surface2 hover:text-ink md:hidden"
        >
          <Menu size={20} />
        </button>

        {title && (
          <h1 className="min-w-0 shrink truncate text-base font-bold tracking-tight text-ink md:text-lg">
            {title}
          </h1>
        )}

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <label className="relative hidden items-center lg:flex">
            <Search size={16} className="pointer-events-none absolute left-3 text-soft" />
            <span className="sr-only">{t("header.search")}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={t("header.search")}
              className="h-10 w-56 rounded-md border border-solid border-line bg-surface2 pl-9 pr-3 text-sm text-ink transition-colors placeholder:text-soft focus:border-primary focus:outline-none xl:w-72"
            />
          </label>

          <LangMenu lang={lang} langs={langs} onLang={onLang} t={t} />

          <MessagesMenu t={t} conversations={conversations} />

          {bell}

          {signedIn ? (
            <>
              {/* Vạch ngăn: tách nhóm "thông báo" khỏi "tài khoản". Thuần
                  trang trí nên ẩn với trình đọc màn hình. */}
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
