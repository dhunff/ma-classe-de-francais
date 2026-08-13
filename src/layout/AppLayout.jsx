import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { titleKeyFor } from "./navItems.js";

/* Vỏ ứng dụng: Sidebar nổi + Topbar + vùng nội dung.

   Desktop: sidebar `fixed`, cách mép 1rem mỗi phía, rộng 18rem và thu còn
   6rem. Nội dung tránh nó bằng padding-left đọc từ biến CSS --mcf-rail, để
   khoảng đó co giãn cùng nhịp với sidebar. Viết cứng `md:pl-64` như trước là
   thu gọn xong nội dung vẫn đứng nguyên, chừa một khoảng trắng bằng cả gang
   tay.

   Dùng padding thay vì margin để nền của <main> vẫn trải hết chiều rộng —
   với margin thì mép trái lộ nền trang khi nội dung có nền riêng.

   Mobile: sidebar thành ngăn kéo, nội dung chiếm trọn chiều rộng. */

const RAIL_KEY = "mcf-rail-expanded";

export default function AppLayout({
  session, t, lang, langs, onLang, dark, onToggleDark, bell, onLogout, people = [],
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();

  /* Trạng thái thu gọn sống qua các lần chuyển trang và cả lần mở sau. Ai đã
     thu sidebar lại thì không muốn nó bung ra mỗi lần bấm sang trang khác. */
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem(RAIL_KEY) !== "0"; } catch { return true; }
  });
  const toggleRail = () => setExpanded((v) => {
    const next = !v;
    try { localStorage.setItem(RAIL_KEY, next ? "1" : "0"); } catch {}
    return next;
  });

  // Đổi trang thì đóng ngăn kéo — nếu không nó che mất trang vừa mở.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const titleKey = titleKeyFor(location.pathname);

  return (
    <div
      className="min-h-screen bg-bg font-sans text-ink"
      /* 18rem/6rem của sidebar + 1rem lề trái + 1rem khoảng thở bên phải. */
      style={{ "--mcf-rail": expanded ? "20rem" : "8rem" }}
    >
      <Sidebar
        role={session?.role}
        session={session}
        signedIn={!!session}
        people={people}
        t={t}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        expanded={expanded}
        onToggle={toggleRail}
      />

      <div className="flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out md:pl-[var(--mcf-rail)]">
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
