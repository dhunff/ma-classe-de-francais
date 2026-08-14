import React from "react";
import { Search, Moon, Sun, Menu } from "lucide-react";

/* Topbar tối giản.

   Trái: nút hamburger (chỉ trên mobile) + tiêu đề trang hiện tại.
   Phải: tìm kiếm, ngôn ngữ, sáng/tối, chuông, hồ sơ.

   Khối hồ sơ hiện cả tên lẫn vai trò, để người dùng luôn biết mình đang
   đăng nhập dưới tư cách nào — nhất là khi giáo viên và học sinh dùng chung
   một máy. */

/* AVATAR_BG và avatarColor đã bỏ cùng khối hồ sơ — thanh bên tự dựng ảnh đại
   diện từ màu chủ đạo, không cần bảng màu theo tên ở đây nữa. */

export default function Topbar({
  title, t, lang, langs, onLang, dark, onToggleDark, bell,
  query, onQuery, onOpenMenu,
}) {

  return (
    /* Khối thứ hai của nhịp vào trang: thanh bên (0ms) → topbar (60ms) →
       nội dung (RISE_BASE=140ms trở đi, xem screens/dashboard/parts.jsx). */
    <header
      className="mcf-rise sticky top-0 z-20 border-0 border-b border-solid border-line bg-surface/95 backdrop-blur"
      style={{ "--mcf-delay": "60ms" }}
    >
      <div className="flex h-16 items-center gap-2 px-4 md:gap-3 md:px-6">
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

          <label className="relative">
            <span className="sr-only">{t("lang_label")}</span>
            <select
              value={lang}
              onChange={(e) => onLang(e.target.value)}
              className="h-10 cursor-pointer rounded-md border border-solid border-line bg-surface2 px-2 text-sm font-semibold text-ink transition-colors focus:border-primary focus:outline-none"
            >
              {langs.map(([code, flag, label]) => (
                <option key={code} value={code}>{flag} {label}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onToggleDark}
            title={dark ? t("header.light_mode") : t("header.dark_mode")}
            aria-pressed={dark}
            className="grid h-10 w-10 place-items-center rounded-md border border-solid border-line bg-surface2 text-soft transition-colors hover:text-ink"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Khối hồ sơ đã bỏ: tên, ảnh và vai trò đều đã nằm ở chân thanh
              bên, hiện cùng lúc trên cùng màn hình. Nhắc lại hai lần không
              thêm thông tin, chỉ lấy mất chỗ của ô tìm kiếm. */}
          {bell}
        </div>
      </div>
    </header>
  );
}
