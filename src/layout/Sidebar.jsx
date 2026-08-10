import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { navFor } from "./navItems.js";

/* Thanh điều hướng trái.

   Desktop (≥768px): cố định, rộng 16rem, cao hết màn hình.
   Mobile: trượt vào từ trái (offcanvas) kèm lớp phủ; đóng bằng nút X,
   bằng phím Esc, hoặc bấm ra ngoài.

   Trạng thái đang chọn dùng ba tín hiệu chồng nhau — nền, chữ đậm, và thanh
   dọc bên trái — để không phụ thuộc riêng vào màu. */

const itemClass = ({ isActive }) =>
  [
    "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
    isActive
      ? "bg-primary-soft font-bold text-primary"
      : "font-medium text-soft hover:bg-surface2 hover:text-ink",
  ].join(" ");

function NavList({ role, t, onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label={t("nav.primary")}>
      {navFor(role).map(({ to, labelKey, Icon }) => (
        <NavLink key={to} to={to} className={itemClass} onClick={onNavigate}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary"
                />
              )}
              <Icon size={19} strokeWidth={isActive ? 2.4 : 2} className="shrink-0" />
              <span className="truncate">{t(labelKey)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <span className="text-[19px] font-extrabold tracking-tight text-ink">
      FRACILE<span className="text-primary">.</span>
    </span>
  );
}

function LogoutButton({ t, onLogout }) {
  return (
    <div className="border-0 border-t border-solid border-line p-3">
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full cursor-pointer items-center gap-3 rounded-md border-0 bg-transparent px-3 py-2.5 text-left text-sm font-medium text-soft transition-colors hover:bg-danger-soft hover:text-danger"
      >
        <LogOut size={19} />
        <span className="truncate">{t("header.logout")}</span>
      </button>
    </div>
  );
}

export default function Sidebar({ role, t, onLogout, open, onClose }) {
  const panelRef = useRef(null);

  // Esc đóng ngăn kéo; khoá cuộn nền khi ngăn kéo đang mở.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <>
      {/* Desktop: cố định bên trái */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-0 border-r border-solid border-line bg-surface md:flex">
        <div className="flex h-16 shrink-0 items-center border-0 border-b border-solid border-line px-5">
          <Brand />
        </div>
        <NavList role={role} t={t} />
        <LogoutButton t={t} onLogout={onLogout} />
      </aside>

      {/* Mobile: lớp phủ + ngăn kéo trượt từ trái */}
      <div
        className={[
          "fixed inset-0 z-40 bg-ink/40 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-hidden
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        aria-hidden={!open}
        {...(open ? {} : { inert: "" })}
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-0 border-r border-solid border-line bg-surface",
          "transition-transform duration-200 md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-0 border-b border-solid border-line pl-5 pr-3">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("nav.close")}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-soft transition-colors hover:bg-surface2 hover:text-ink"
          >
            <X size={19} />
          </button>
        </div>
        <NavList role={role} t={t} onNavigate={onClose} />
        <LogoutButton t={t} onLogout={onLogout} />
      </aside>
    </>
  );
}
