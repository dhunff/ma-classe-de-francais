import React, { useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { LogIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { navFor } from "./navItems.js";

/* Thanh điều hướng trái — nằm thẳng trên nền xanh của khung, không có nền
   riêng.

   Desktop: một phần tử flex bình thường cạnh tấm thẻ nội dung (xem
   AppLayout). Rộng 16rem, thu còn 5.5rem. KHÔNG `fixed` nữa: mục đang chọn
   phải chạm được vào mép tấm thẻ để trông như liền một khối, mà hai bên nằm
   ở hai tầng khác nhau thì không làm được.

   Mobile: trượt vào từ trái kèm lớp phủ; luôn ở trạng thái mở rộng, vì thu
   gọn một ngăn kéo vốn đã chiếm hết màn hình thì chẳng để làm gì. Ngăn kéo
   giữ nền `surface` riêng — nó nổi lên trên nội dung chứ không nằm trên nền
   xanh.

   DANH SÁCH MENU lấy từ navItems.js, không phải danh sách viết tay. Mọi mục ở
   đó đều có route thật; viết tay một danh sách khác sẽ vừa bỏ sót đường vào
   (học sinh mất lối tới bài tập) vừa đẻ ra nút chết trỏ tới route không tồn
   tại.

   MÀU: trên nền khung dùng TRẮNG thẳng và các mức mờ của nó, không qua token.
   Đây là ngoại lệ có lý do — `on-primary` đảo theo bản sáng/tối, mà nền khung
   thì không: sáng là xanh đậm, tối là navy gần đen, cả hai đều cần chữ trắng.
   Đi qua token thì bản tối sẽ ra chữ sẫm trên nền sẫm.

   Ngăn kéo mobile thì ngược lại: nền ở đó là `surface`, nên nó dùng
   `ink`/`soft` như mọi nơi khác. Đó là việc của cờ `onBlue`. */

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
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 scale-95 whitespace-nowrap rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-primary opacity-0 shadow-lg transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
    >
      {children}
    </span>
  );
}

/* KHÔNG đặt overflow-y-auto ở <nav>. Theo chuẩn CSS, khi một trục là `visible`
   còn trục kia không phải, trình duyệt ép trục `visible` thành `auto` — sinh ra
   thanh cuộn ngang ngay dưới danh sách menu ở trạng thái thu gọn. Mà
   `overflow-x` phải để `visible` thì chú giải mới trôi ra ngoài được.

   `onBlue` phân biệt hai chỗ dùng: cột bên trái nằm trên nền xanh, ngăn kéo
   mobile nằm trên nền `surface`. Cùng một danh sách, hai bảng màu. */
function NavList({ role, t, expanded, onNavigate, onBlue = true }) {
  return (
    <nav className={`flex flex-1 flex-col gap-1 ${onBlue ? "pl-3" : "px-3"}`} aria-label={t("nav.primary")}>
      <Label
        expanded={expanded}
        className={`mb-1 block px-2 text-[10px] font-bold uppercase tracking-[0.14em] ${onBlue ? "text-white/60" : "text-soft"}`}
      >
        {t("nav.menu")}
      </Label>

      {navFor(role).map(({ to, labelKey, Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              "group relative flex items-center py-2.5 text-sm no-underline",
              "transition-all duration-200 ease-out",
              expanded ? "px-3" : "justify-center px-0",
              /* Mục đang chọn trên nền xanh: cùng màu với tấm thẻ, bo tròn bên
                 TRÁI và vuông bên PHẢI, rồi kéo dài thêm 12px sang phải bằng
                 `-mr-3` để nuốt trọn khoảng đệm của <nav> và chạm vào mép thẻ.
                 Thiếu bước đó thì còn một khe xanh mỏng, và cái ảo giác "liền
                 khối" hỏng ngay. */
              onBlue
                ? isActive
                  ? "-mr-3 rounded-l-full bg-bg pr-6 font-bold text-primary"
                  : "mr-3 rounded-full font-medium text-white/70 hover:bg-white/15 hover:text-white"
                : isActive
                  ? "rounded-2xl bg-primary-soft font-bold text-primary"
                  : "rounded-2xl font-medium text-soft hover:bg-surface2/70 hover:text-ink",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
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

/* Chỉ còn chữ, bỏ ô vuông "F" và ba chấm kiểu macOS.

   Thu gọn thì hiện "F" — chữ đầu của tên, không phải biểu tượng riêng — để
   khoảng trống trên cùng không rỗng hoác. */
function Brand({ expanded, onBlue = true }) {
  const tone = onBlue ? "text-white" : "text-ink";
  const dot = onBlue ? "text-white/60" : "text-primary";
  return (
    <div className={`flex items-center overflow-hidden ${expanded ? "px-5" : "justify-center px-0"}`}>
      {expanded ? (
        <span className={`whitespace-nowrap text-2xl font-bold tracking-tight ${tone}`}>
          FRACILE<span className={dot}>.</span>
        </span>
      ) : (
        <span className={`text-2xl font-bold tracking-tight ${tone}`}>F</span>
      )}
    </div>
  );
}

/* Thẻ lồng trong thanh bên. Chỉ hiện khi có dữ liệu thật truyền vào —
   dựng vài avatar giả cho đẹp là bịa ra người không tồn tại. */
function PeopleCard({ people, t, expanded, onBlue = true }) {
  if (!people?.length) return null;
  const shown = people.slice(0, 4);

  return (
    <div className={`mx-3 rounded-2xl p-3 ${onBlue ? "bg-white/10" : "bg-surface2/80"} ${expanded ? "" : "px-2"}`}>
      <Label
        expanded={expanded}
        className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] ${onBlue ? "text-white/60" : "text-soft"}`}
      >
        {t("nav.people")}
      </Label>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {shown.map((p) => (
          <li key={p.name} className="group relative flex items-center">
            <span
              aria-hidden
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${onBlue ? "bg-white/25 text-white" : "bg-primary-soft text-primary"}`}
            >
              {p.name.trim().charAt(0).toUpperCase()}
            </span>
            <Label expanded={expanded} className={`min-w-0 flex-1 truncate text-xs font-semibold ${onBlue ? "text-white" : "text-ink"}`}>
              {p.name}
            </Label>
            {expanded && p.badge > 0 && (
              <span className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${onBlue ? "bg-white/25 text-white" : "bg-primary text-white"}`}>
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

/* Chân thanh bên. Khối hồ sơ (ảnh, tên, vai trò) và nút đăng xuất đã CHUYỂN
   lên menu ảnh đại diện ở topbar — nhắc cùng một thông tin ở hai chỗ trên
   cùng một màn hình không thêm gì, mà lại đẻ ra hai nút đăng xuất.

   Còn lại đúng một việc: lối đăng nhập cho khách. Người chưa đăng nhập không
   có ảnh đại diện để bấm, nên bỏ nốt chỗ này là họ mất hẳn đường vào. */
function Footer({ t, signedIn, expanded, onNavigate, onBlue = true }) {
  if (signedIn) return null;

  const base =
    "flex w-full cursor-pointer items-center rounded-2xl border-0 bg-transparent py-2.5 text-left text-sm font-medium no-underline transition-colors";

  return (
    <div className={`mt-auto border-0 border-t border-solid p-3 ${onBlue ? "border-white/20" : "border-line"}`}>
      <Link
        to="/login"
        onClick={onNavigate}
        className={`${base} group ${expanded ? "px-3" : "justify-center px-0"} ${onBlue ? "text-white/70 hover:bg-white/15 hover:text-white" : "text-primary hover:bg-primary-soft"}`}
      >
        <LogIn size={19} className="shrink-0" />
        <Label expanded={expanded} className="truncate">{t("login.signin")}</Label>
        <Tip show={!expanded}>{t("login.signin")}</Tip>
      </Link>
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

  return (
    <>
      {/* Desktop: cột nằm thẳng trên nền xanh của khung. Không nền riêng, không
          bo góc — nó CHÍNH LÀ nền, tấm thẻ trắng bên phải mới là thứ nổi lên. */}
      <aside
        className={[
          "mcf-rise hidden h-screen shrink-0 flex-col py-5 md:flex",
          "transition-[width] duration-300 ease-in-out",
          expanded ? "w-64" : "w-[5.5rem]",
        ].join(" ")}
      >
        <div className={`flex shrink-0 items-center px-4 ${expanded ? "justify-end" : "justify-center"}`}>
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={expanded ? t("nav.collapse") : t("nav.expand")}
              aria-expanded={expanded}
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>

        <div className="shrink-0 py-5">
          <Brand expanded={expanded} />
        </div>

        <NavList role={role} t={t} expanded={expanded} />

        <div className="shrink-0 pt-3">
          <PeopleCard people={people} t={t} expanded={expanded} />
        </div>

        <Footer t={t} signedIn={signedIn} expanded={expanded} />
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
        <div className="flex shrink-0 items-center justify-end px-4 pt-4">
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
          <Brand expanded onBlue={false} />
        </div>

        {/* Ngăn kéo luôn mở rộng: thu gọn một tấm đã chiếm hết màn hình thì
            chẳng tiết kiệm được gì. */}
        <NavList role={role} t={t} expanded onNavigate={onClose} onBlue={false} />

        <div className="shrink-0 pt-3">
          <PeopleCard people={people} t={t} expanded onBlue={false} />
        </div>

        <Footer t={t} signedIn={signedIn} expanded onNavigate={onClose} onBlue={false} />
      </aside>
    </>
  );
}