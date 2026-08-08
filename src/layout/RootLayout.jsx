import React, { useState, useEffect } from "react";
import Sidebar, { MobileNav } from "./Sidebar.jsx";
import Header from "./Header.jsx";
import { navFor } from "./navItems.js";

const COLLAPSE_KEY = "fracile-sidebar-collapsed";

/* Vỏ ứng dụng: Sidebar + Topbar + vùng nội dung.

   RootLayout sở hữu state điều hướng và báo ra qua `onSection`. Nó KHÔNG
   quyết định render màn hình nào — nơi gọi quyết định, bằng cách đọc
   `section` trong hàm `children`. Nhờ vậy vỏ app tách rời hoàn toàn với
   Teacher/Student, vốn còn đang giữ tab riêng bên trong. */

export default function RootLayout({
  session, t, lang, langs, onLang, dark, onToggleDark, bell, onLogout,
  section, onSection, children,
}) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === "1"; } catch { return false; }
  });
  const [query, setQuery] = useState("");

  const toggleCollapse = () =>
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0"); } catch {}
      return next;
    });

  // Vai trò đổi thì bộ menu đổi — đưa lựa chọn về mục đầu nếu mục cũ không còn.
  const role = session?.role;
  useEffect(() => {
    const ids = navFor(role).map((i) => i.id);
    if (!ids.includes(section)) onSection(ids[0]);
  }, [role, section, onSection]);

  return (
    <div className="flex min-h-screen bg-bg font-sans text-ink">
      <Sidebar
        role={role}
        active={section}
        onSelect={onSection}
        collapsed={collapsed}
        onToggle={toggleCollapse}
        onLogout={onLogout}
        t={t}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          session={session}
          t={t}
          lang={lang}
          langs={langs}
          onLang={onLang}
          dark={dark}
          onToggleDark={onToggleDark}
          bell={bell}
          query={query}
          onQuery={setQuery}
        />

        {/* pb-20 chừa chỗ cho thanh điều hướng đáy trên màn hình hẹp. */}
        <main className="min-w-0 flex-1 px-4 pb-20 pt-6 md:px-6 md:pb-10">
          {typeof children === "function" ? children({ section, query }) : children}
        </main>
      </div>

      <MobileNav role={role} active={section} onSelect={onSection} t={t} />
    </div>
  );
}
