import React, { useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { LogOut, LogIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { navFor } from "./navItems.js";

/* Thanh điều hướng trái — khối kính nổi, thu gọn được.

   Desktop (≥768px): cố định bên trái, cách mép 1rem nên trông như một khối
   nổi chứ không dán vào cạnh màn hình. Rộng 18rem, thu còn 6rem.
   Mobile: trượt vào từ trái kèm lớp phủ; luôn ở trạng thái mở rộng, vì thu
   gọn một ngăn kéo vốn đã chiếm hết màn hình thì chẳng để làm gì.

   DANH SÁCH MENU lấy từ navItems.js, không phải danh sách viết tay. Mọi mục ở
   đó đều có route thật; viết tay một danh sách khác sẽ vừa bỏ sót đường vào
   (học sinh mất lối tới bài tập) vừa đẻ ra nút chết trỏ tới route không tồn
   tại.

   Trạng thái đang chọn dùng ba tín hiệu chồng nhau — nền, chữ đậm, và thanh
   dọc bên trái — để không phụ thuộc riêng vào màu. */

const GLASS =
  "bg-surface/70 backdrop-blur-xl border border-solid border-line/60 " +
  "shadow-[0_18px_50px_rgb(0,0,0,0.08)]";

/* Chữ trong mục menu: thu gọn thì co bề rộng về 0 và mờ đi, chứ không phải
   gỡ khỏi cây DOM. Gỡ ra thì chữ nhảy xuống dòng đúng một khung hình trước
   khi biến mất, thấy rõ thành một cái giật. */
function Label({ expanded, children, className = "" }) {
  return (
    <span
      className={[
        "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
        expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

/* Chú giải khi thu gọn: viên thuốc trôi ra bên phải khi rê chuột.
   Làm bằng group-hover thuần CSS — không cần thêm thư viện cho một cái nhãn.
   `pointer-events-none` để nó không tự chắn chuột và gây nhấp nháy. */
function Tip({ show, children }) {
  if (!show) return null;
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 scale-95 whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-on-primary opacity-0 shadow-lg transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
    >
      {children}
    </span>
  );
}

function NavList({ role, t, expanded, onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-visible px-3" aria-label={t("nav.primary")}>
      <Label expanded={expanded} className="mb-1 block px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-soft">
        {t("nav.menu")}
      </Label>

      {navFor(role).map(({ to, labelKey, Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              "group relative flex items-center rounded-2xl py-2.5 text-sm no-underline",
              "transition-all duration-200 ease-out",
              expanded ? "px-3" : "justify-center px-0",
              isActive
                ? "bg-surface font-bold text-primary shadow-sm"
                : "font-medium text-soft hover:scale-[1.02] hover:bg-surface2/70 hover:text-ink",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              {isActive && expanded && (
                <span aria-hidden className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
              )}
              <Icon size={19} strokeWidth={isActive ? 2.4 : 2} className="shrink-0" />
              <Label expanded={expanded} className="truncate">{t(labelKey)}</Label>
              <Tip show={!expanded}>{t(labelKey)}</Tip>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand({ expanded }) {
  return (
    <div className={`flex items-center ${expanded ? "px-5" : "justify-center px-0"}`}>
      <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-base font-extrabold text-on-primary">
        F
      </span>
      <Label expanded={expanded} className="text-[19px] font-extrabold tracking-tight text-ink">
        FRACILE<span className="text-primary">.</span>
      </Label>
    </div>
  );
}

/* Ba chấm kiểu cửa sổ macOS. Thuần trang trí — chúng không đóng, không thu
   nhỏ, không làm gì cả. `aria-hidden` để trình đọc màn hình không đọc chúng
   như thể là nút bấm. */
function WindowDots() {
  return (
    <span aria-hidden className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
    </span>
  );
}

/* Thẻ trắng lồng trong khối kính. Chỉ hiện khi có dữ liệu thật truyền vào —
   dựng vài avatar giả cho đẹp là bịa ra người không tồn tại. */
function PeopleCard({ people, t, expanded }) {
  if (!people?.length) return null;
  const shown = people.slice(0, 4);

  return (
    <div className={`mx-3 rounded-2xl bg-surface/80 p-3 shadow-sm ${expanded ? "" : "px-2"}`}>
      <Label expanded={expanded} className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-soft">
        {t("nav.people")}
      </Label>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {shown.map((p) => (
          <li key={p.name} className="group relative flex items-center">
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary"
            >
              {p.name.trim().charAt(0).toUpperCase()}
            </span>
            <Label expanded={expanded} className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">
              {p.name}
            </Label>
            {expanded && p.badge > 0 && (
              <span className="ml-auto shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-on-primary">
                {p.badge}
              </span>
            )}
            <Tip show={!expanded}>{p.name}</Tip>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer({ t, session, signedIn, onLogout, expanded, onNavigate }) {
  const base =
    "flex w-full cursor-pointer items-center rounded-2xl border-0 bg-transparent py-2.5 text-left text-sm font-medium no-underline transition-colors";

  return (
    <div className="mt-auto border-0 border-t border-solid border-line/60 p-3">
      {signedIn && (
        <div className={`mb-2 flex items-center ${expanded ? "px-2" : "justify-center px-0"}`}>
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-on-primary"
          >
            {(session?.name || "?").trim().charAt(0).toUpperCase()}
          </span>
          <Label expanded={expanded} className="min-w-0">
            <span className="block truncate text-sm font-bold text-ink">{session?.name}</span>
            <span className="block truncate text-xs text-soft">
              {session?.role === "prof" ? t("header.teacher") : t("header.student")}
            </span>
          </Label>
        </div>
      )}

      {signedIn ? (
        <button
          type="button"
          onClick={onLogout}
          className={`${base} group text-soft hover:bg-danger-soft hover:text-danger ${expanded ? "px-3" : "justify-center px-0"}`}
        >
          <LogOut size={19} className="shrink-0" />
          <Label expanded={expanded} className="truncate">{t("header.logout")}</Label>
          <Tip show={!expanded}>{t("header.logout")}</Tip>
        </button>
      ) : (
        <Link
          to="/login"
          onClick={onNavigate}
          className={`${base} group text-primary hover:bg-primary-soft ${expanded ? "px-3" : "justify-center px-0"}`}
        >
          <LogIn size={19} className="shrink-0" />
          <Label expanded={expanded} className="truncate">{t("login.signin")}</Label>
          <Tip show={!expanded}>{t("login.signin")}</Tip>
        </Link>
      )}
    </div>
  );
}

export default function Sidebar({
  role, t, onLogout, open, onClose, signedIn = false, session,
  expanded = true, onToggle, people = [],
}) {
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

  const inner = (isExpanded, onNavigate) => (
    <>
      <div className={`flex shrink-0 items-center justify-between px-4 pt-4 ${isExpanded ? "" : "flex-col gap-3"}`}>
        <WindowDots />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={isExpanded ? t("nav.collapse") : t("nav.expand")}
            aria-expanded={isExpanded}
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface text-soft shadow-sm transition-colors hover:text-primary"
          >
            {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>

      <div className="shrink-0 py-5">
        <Brand expanded={isExpanded} />
      </div>

      <NavList role={role} t={t} expanded={isExpanded} onNavigate={onNavigate} />

      <div className="shrink-0 pt-3">
        <PeopleCard people={people} t={t} expanded={isExpanded} />
      </div>

      <Footer t={t} session={session} signedIn={signedIn} onLogout={onLogout}
        expanded={isExpanded} onNavigate={onNavigate} />
    </>
  );

  return (
    <>
      {/* Desktop: khối kính nổi, cách mép 1rem ở mọi phía */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 m-4 hidden h-[calc(100vh-2rem)] flex-col rounded-[2rem] md:flex",
          "transition-all duration-300 ease-in-out",
          GLASS,
          expanded ? "w-72" : "w-24",
        ].join(" ")}
      >
        {inner(expanded)}
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
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface",
          "border-0 border-r border-solid border-line",
          "transition-transform duration-200 md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-center justify-between px-4 pt-4">
          <WindowDots />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("nav.close")}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft transition-colors hover:text-ink"
          >
            <X size={19} />
          </button>
        </div>

        <div className="shrink-0 py-5">
          <Brand expanded />
        </div>

        {/* Ngăn kéo luôn mở rộng: thu gọn một tấm đã chiếm hết màn hình thì
            chẳng tiết kiệm được gì. */}
        <NavList role={role} t={t} expanded onNavigate={onClose} />

        <div className="shrink-0 pt-3">
          <PeopleCard people={people} t={t} expanded />
        </div>

        <Footer t={t} session={session} signedIn={signedIn} onLogout={onLogout}
          expanded onNavigate={onClose} />
      </aside>
    </>
  );
}
