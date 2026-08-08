import React from "react";
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { navFor } from "./navItems.js";

/* Thanh điều hướng bên trái, thu gọn được.
   Dưới 768px component này không hiện — RootLayout đổi sang MobileNav.

   Trạng thái đang chọn được đánh dấu bằng ba tín hiệu chồng nhau, để không
   phụ thuộc riêng vào màu: thanh dọc bên trái, nền primary nhạt, và chữ đậm
   hơn. Người mù màu vẫn đọc được. */

function NavButton({ item, active, collapsed, label, onSelect }) {
  const { Icon } = item;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={[
        "group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5",
        "text-left text-sm transition-colors",
        collapsed ? "justify-center px-0" : "",
        active
          ? "bg-primary-soft font-bold text-primary"
          : "font-medium text-soft hover:bg-surface2 hover:text-ink",
      ].join(" ")}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary"
        />
      )}
      <Icon size={19} strokeWidth={active ? 2.4 : 2} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

export default function Sidebar({ role, active, onSelect, collapsed, onToggle, onLogout, t }) {
  const items = navFor(role);

  return (
    <aside
      className={[
        "hidden md:flex md:flex-col md:shrink-0",
        "sticky top-0 h-screen border-0 border-r border-solid border-line bg-surface",
        "transition-[width] duration-200",
        collapsed ? "md:w-sidebar-collapsed" : "md:w-sidebar",
      ].join(" ")}
    >
      {/* Nhãn hiệu */}
      <div
        className={[
          "flex h-16 items-center border-0 border-b border-solid border-line",
          collapsed ? "justify-center px-0" : "px-5",
        ].join(" ")}
      >
        <span className="font-extrabold tracking-tight text-ink">
          {collapsed ? (
            <span className="text-xl">F</span>
          ) : (
            <span className="text-[19px]">
              FRACILE<span className="text-primary">.</span>
            </span>
          )}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label={t("nav.primary")}>
        {items.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            label={t(item.labelKey)}
            active={active === item.id}
            collapsed={collapsed}
            onSelect={onSelect}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-0 border-t border-solid border-line p-3">
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? t("header.logout") : undefined}
          className={[
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5",
            "text-sm font-medium text-soft transition-colors",
            "hover:bg-danger-soft hover:text-danger",
            collapsed ? "justify-center px-0" : "",
          ].join(" ")}
        >
          <LogOut size={19} />
          {!collapsed && <span className="truncate">{t("header.logout")}</span>}
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          title={collapsed ? t("nav.expand") : t("nav.collapse")}
          className={[
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5",
            "text-sm font-medium text-soft transition-colors",
            "hover:bg-surface2 hover:text-ink",
            collapsed ? "justify-center px-0" : "",
          ].join(" ")}
        >
          {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          {!collapsed && <span className="truncate">{t("nav.collapse")}</span>}
        </button>
      </div>
    </aside>
  );
}

/* Thanh điều hướng dưới đáy cho màn hình hẹp. Cùng bộ item, cùng state. */
export function MobileNav({ role, active, onSelect, t }) {
  const items = navFor(role);
  return (
    <nav
      aria-label={t("nav.primary")}
      className="fixed inset-x-0 bottom-0 z-40 flex border-0 border-t border-solid border-line bg-surface md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ id, labelKey, Icon }) => {
        const on = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-current={on ? "page" : undefined}
            className={[
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors",
              on ? "font-bold text-primary" : "font-medium text-soft",
            ].join(" ")}
          >
            <Icon size={20} strokeWidth={on ? 2.4 : 2} />
            <span className="truncate px-1">{t(labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
