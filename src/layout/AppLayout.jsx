import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { titleKeyFor } from "./navItems.js";

/* Vỏ ứng dụng: Sidebar cố định + Topbar + vùng nội dung.

   Desktop: sidebar `fixed` rộng 16rem, nội dung đẩy sang bằng `md:pl-64`.
   Dùng padding thay vì margin để nền của <main> vẫn trải hết chiều rộng —
   với margin thì mép trái lộ nền trang khi nội dung có nền riêng.

   Mobile: sidebar thành ngăn kéo, nội dung chiếm trọn chiều rộng. */

export default function AppLayout({
  session, t, lang, langs, onLang, dark, onToggleDark, bell, onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();

  // Đổi trang thì đóng ngăn kéo — nếu không nó che mất trang vừa mở.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const titleKey = titleKeyFor(location.pathname);

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <Sidebar
        role={session?.role}
        t={t}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex min-h-screen flex-col md:pl-64">
        <Topbar
          session={session}
          title={titleKey ? t(titleKey) : null}
          t={t}
          lang={lang}
          langs={langs}
          onLang={onLang}
          dark={dark}
          onToggleDark={onToggleDark}
          bell={bell}
          query={query}
          onQuery={setQuery}
          onOpenMenu={() => setMenuOpen(true)}
        />

        <main className="min-w-0 flex-1 px-4 pb-10 pt-6 md:px-6">
          <Outlet context={{ query }} />
        </main>
      </div>
    </div>
  );
}
