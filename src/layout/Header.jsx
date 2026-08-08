import React from "react";
import { Search, Moon, Sun } from "lucide-react";

/* Topbar tối giản: tìm kiếm, ngôn ngữ, sáng/tối, chuông, avatar.
   Chuông (`bell`) được truyền vào từ ngoài — App.jsx đã có component Bell
   riêng cho học sinh, không dựng lại ở đây. */

const AVATAR_BG = ["#5B4B9E", "#41608F", "#2C7573", "#327654", "#8F5E22", "#9B3D66"];
const avatarColor = (name) => {
  let h = 0;
  for (const ch of String(name || "?")) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return AVATAR_BG[h % AVATAR_BG.length];
};

export default function Header({
  session, t, lang, langs, onLang, dark, onToggleDark, bell, query, onQuery,
}) {
  const isProf = session?.role === "prof";
  const name = isProf ? t("header.teacher") : session?.name || "";

  return (
    <header className="sticky top-0 z-30 border-0 border-b border-solid border-line bg-surface/95 backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-4 md:gap-3 md:px-6">
        {/* Tìm kiếm nhanh */}
        <label className="relative flex min-w-0 flex-1 items-center md:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 text-soft" />
          <span className="sr-only">{t("header.search")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t("header.search")}
            className={[
              "h-10 w-full rounded-md border border-solid border-line bg-surface2 pl-9 pr-3",
              "text-sm text-ink placeholder:text-soft",
              "transition-colors focus:border-primary focus:outline-none",
            ].join(" ")}
          />
        </label>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          {/* Ngôn ngữ */}
          <label className="relative">
            <span className="sr-only">{t("lang_label")}</span>
            <select
              value={lang}
              onChange={(e) => onLang(e.target.value)}
              className={[
                "h-10 cursor-pointer rounded-md border border-solid border-line bg-surface2 px-2",
                "text-sm font-semibold text-ink transition-colors",
                "focus:border-primary focus:outline-none",
              ].join(" ")}
            >
              {langs.map(([code, flag, label]) => (
                <option key={code} value={code}>{flag} {label}</option>
              ))}
            </select>
          </label>

          {/* Sáng / tối */}
          <button
            type="button"
            onClick={onToggleDark}
            title={dark ? t("header.light_mode") : t("header.dark_mode")}
            aria-pressed={dark}
            className={[
              "grid h-10 w-10 place-items-center rounded-md border border-solid border-line",
              "bg-surface2 text-soft transition-colors hover:text-ink",
            ].join(" ")}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {bell}

          {/* Hồ sơ */}
          <div className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1 md:pr-3">
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
              style={{ background: avatarColor(name) }}
            >
              {String(name).trim().charAt(0).toUpperCase() || "?"}
            </span>
            <span className="hidden min-w-0 flex-col leading-tight md:flex">
              <span className="truncate text-sm font-bold text-ink">{name}</span>
              <span className="truncate text-xs text-soft">
                {isProf ? t("header.teacher") : t("header.student")}
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
