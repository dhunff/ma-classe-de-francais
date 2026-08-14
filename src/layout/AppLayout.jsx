import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { titleKeyFor } from "./navItems.js";

/* Vỏ ứng dụng — kiểu "thẻ lồng": nền xanh đặc làm khung, nội dung là một tấm
   thẻ trắng lớn đặt lên trên, thanh bên nằm thẳng trên nền xanh.

   Thanh bên KHÔNG còn `fixed`. Nó là một phần tử flex bình thường cạnh tấm
   thẻ, vì mục đang chọn phải chạm được vào mép thẻ để trông như liền một
   khối — thứ đó không làm được khi hai bên nằm ở hai tầng khác nhau. Vì vậy
   biến --mcf-rail và mẹo padding-left cũng biến mất: khoảng chỗ nay do chính
   flex chia.

   TRANG KHÔNG CÒN CUỘN. Khung ngoài cao đúng một màn hình và khoá tràn; chỉ
   <main> cuộn. Nhờ đó thanh bên và topbar đứng yên mà không cần `sticky`, và
   tấm thẻ không bao giờ trôi khỏi nền xanh.

   Mobile: thanh bên thành ngăn kéo (vẫn `fixed`, nằm trong Sidebar), tấm thẻ
   chiếm trọn bề rộng và bỏ bo góc trái — không có gì để tách khỏi nữa. */

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
    /* Bản tối KHÔNG dùng `primary`: ở bản tối token đó là xanh nhạt (nó sinh
       ra để làm điểm nhấn trên nền tối), trải ra cả màn hình thì thành một
       mảng chói. Nền khung đổi sang xanh navy gần đen — thanh bên vẫn "xanh
       đậm hoặc đen" như thiết kế muốn, và chữ trắng vẫn đọc được trên cả hai
       bản. */
    <div className="flex h-screen w-full overflow-hidden bg-primary font-sans text-ink dark:bg-[#0e1526]">
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

      {/* Tấm thẻ nội dung. `min-w-0` là bắt buộc: phần tử flex mặc định
          `min-width: auto`, nên một bảng rộng bên trong sẽ nong cả thẻ ra thay
          vì để chính nó cuộn ngang. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-bg shadow-2xl md:rounded-l-[2.5rem]">
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

        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-8 md:px-8">
          <Outlet context={{ query }} />
        </main>
      </div>
    </div>
  );
}
