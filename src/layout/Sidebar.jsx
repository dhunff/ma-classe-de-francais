import React, { useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { LogIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, MotionConfig } from "framer-motion";
import { navTheoNhom } from "./navItems.js";
import { tr } from "../shared/i18n.jsx";

/* Tên nhóm menu (13/10). Hàm, không hằng số: tr() phải chạy lúc dựng. */
const tenNhom = (n) => ({
  hoc: tr("Học tập", "Apprendre", "Learn"),
  on: tr("Ôn luyện", "S'entraîner", "Practice"),
  thi: tr("Bài tập & thi", "Devoirs et examens", "Homework & exams"),
  toi: tr("Của tôi", "Mon espace", "My space"),
  tong: tr("Tổng quan", "Vue d'ensemble", "Overview"),
  lop: tr("Học sinh", "Élèves", "Students"),
  noi_dung: tr("Nội dung", "Contenus", "Content"),
  tro_giup: tr("Trợ giúp", "Aide", "Help"),
}[n] ?? n);

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
        /* 27/10: max-width thay cho width auto (auto không nội suy được nên chữ
           bật/tắt chứ không trượt). Đường cong ease-out mạnh, mở 300ms. */
        "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-[cubic-bezier(.23,1,.32,1)]",
        expanded ? "ml-3 max-w-[12rem] opacity-100" : "ml-0 max-w-0 opacity-0",
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
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 -translate-x-1 whitespace-nowrap rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-primary opacity-0 shadow-lg transition-[opacity,transform] duration-150 ease-[cubic-bezier(.23,1,.32,1)] group-hover:translate-x-0 group-hover:opacity-100 group-hover:delay-100"
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
  const { pathname } = useLocation();   // mục có `khop` sáng lên ở nhiều đường dẫn
  return (
    <MotionConfig reducedMotion="user">
    <nav className={`flex flex-1 flex-col ${onBlue ? "pl-3" : "px-3"}`} aria-label={t("nav.primary")}>
      {navTheoNhom(role).map(({ nhom, muc }, gi) => (
        <div key={nhom} className={nhom === "tro_giup" ? "mt-auto pb-2 pt-4" : gi ? "mt-4 [@media(max-height:760px)]:mt-2" : ""}>
          {/* Tên nhóm khi mở rộng; khi thu gọn thì một vạch ngắn ngăn nhóm. */}
          {expanded ? (
            <span className={`mb-1.5 block px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] ${onBlue ? "text-white/55" : "text-soft"}`}>{tenNhom(nhom)}</span>
          ) : gi > 0 && (
            <span aria-hidden className={`mx-auto mb-3 block h-px w-8 ${onBlue ? "bg-white/25" : "bg-line"}`} />
          )}
          <div className="flex flex-col gap-0.5">
            {muc.map(({ to, labelKey, Icon, khop }) => { const them = !!khop?.some((p) => pathname.startsWith(p)); return (
              <NavLink
                key={to}
                to={to}
                onClick={onNavigate}
                className={({ isActive: dung }) => { const isActive = dung || them; return [
                    "group relative flex items-center rounded-2xl py-1.5 text-sm no-underline outline-none [@media(max-height:760px)]:py-1",
                    "transition-[color,background-color,transform] duration-200 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.98]",
                    "focus-visible:ring-2 focus-visible:ring-white/60",
                    expanded ? "px-2" : "justify-center px-0",
                    onBlue ? "mr-3" : "",
                    onBlue
                      ? isActive ? "font-bold text-primary" : "font-medium text-white/75 hover:bg-white/[0.08] hover:text-white"
                      : isActive ? "font-bold text-primary" : "font-medium text-soft hover:bg-surface2/70 hover:text-ink",
                  ].join(" "); }}
              >
                {({ isActive: dung }) => { const isActive = dung || them; return (
                  <>
                    {/* 27/10: nền « đang chọn » trượt từ mục cũ sang mục mới (layoutId).
                        Trên nền khung: bo trái, kéo -right-3 chạm mép tấm thẻ cho liền
                        khối (xem chú thích đầu file). */}
                    {isActive && (
                      <motion.span aria-hidden layoutId={onBlue ? "nav-dang-chon" : "nav-dang-chon-m"}
                        transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.8 }}
                        className={onBlue ? "absolute inset-y-0 left-0 -right-3 rounded-l-2xl bg-bg" : "absolute inset-0 rounded-2xl bg-primary-soft"} />
                    )}
                    {/* Biểu tượng trong ô bo góc: đang chọn thì ô đặc màu chính, có quầng. */}
                    <span className={[
                      "relative grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(.23,1,.32,1)]",
                      isActive
                        ? "bg-primary text-white shadow-[0_6px_16px_rgb(var(--mcf-primary-rgb)/0.35)]"
                        : onBlue ? "bg-white/[0.08] text-white/85 group-hover:bg-white/[0.16] group-hover:text-white" : "bg-surface2 group-hover:text-ink",
                    ].join(" ")}>
                      <Icon size={18} strokeWidth={isActive ? 2.25 : 1.85} className="transition-transform duration-200 ease-[cubic-bezier(.23,1,.32,1)] group-hover:-translate-y-px" />
                    </span>
                    <Label expanded={expanded} className="relative truncate">{t(labelKey)}</Label>
                    <Tip show={!expanded}>{t(labelKey)}</Tip>
                  </>
                ); }}
              </NavLink>
            ); })}
          </div>
        </div>
      ))}
    </nav>
    </MotionConfig>
  );
}

/* Ô « Cần trợ giúp? » cuối thanh GỠ 28/10 (chủ dự án): thay bằng nhóm menu « Trợ giúp »
   (mục FAQ) dồn xuống đáy nav bằng mt-auto. */

/* Logo (09/10): đầu Leon + chữ FRACILE. Thu gọn thì chỉ còn đầu Leon. */
/* 27/10: Leon trong huy hiệu trắng bo góc (nghiêng nhẹ, rê chuột thì thẳng lại),
   chữ FRACILE đậm kèm chấm đỏ. */
function Huy({ onBlue, size = "h-11 w-11" }) {
  return (
    <span className={`relative grid ${size} shrink-0 -rotate-6 place-items-center rounded-2xl transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] group-hover:rotate-0 ${onBlue ? "bg-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] ring-4 ring-white/15" : "bg-primary-soft"}`}>
      <img src="/leon/dau.webp" alt="" width={34} height={34} className="h-[34px] w-[34px] object-contain" />
    </span>
  );
}
function Brand({ expanded, onBlue = true }) {
  const tone = onBlue ? "text-white" : "text-ink";
  return (
    <div aria-label="FRACILE" className={`group flex items-center overflow-hidden ${expanded ? "px-5" : "justify-center px-0"}`}>
      {expanded ? (
        <span className="flex items-center gap-3">
          <Huy onBlue={onBlue} />
          <span className="min-w-0">
            <span className={`block whitespace-nowrap text-[22px] font-extrabold leading-none tracking-tight ${tone}`}>
              FRACILE<span className="ml-0.5 inline-block h-[7px] w-[7px] rounded-full bg-[#EF4444] align-baseline" />
            </span>
          </span>
        </span>
      ) : (
        <Huy onBlue={onBlue} />
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
          "mcf-rise relative hidden h-[100dvh] shrink-0 flex-col py-5 md:flex [@media(max-height:760px)]:py-3",
          "transition-[width] duration-300 ease-[cubic-bezier(.23,1,.32,1)]",
          expanded ? "w-64" : "w-[5.5rem]",
        ].join(" ")}
      >
        {/* Đốm sáng trang trí trên nền xanh (13/10). */}
        {/* Lớp cắt riêng: đốm tràn ra ngoài sẽ làm khung overflow-hidden cuộn được. */}
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <span className="absolute -bottom-20 left-6 h-48 w-48 rounded-full bg-sky-300/15 blur-3xl" />
        </span>
        <div className={`relative flex shrink-0 items-center px-4 ${expanded ? "justify-end" : "justify-center"}`}>
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

        <div className="shrink-0 py-5 [@media(max-height:760px)]:py-2">
          <Brand expanded={expanded} />
        </div>

        {/* Màn hình thấp (laptop nhỏ, 18/10): danh sách cuộn trong cột thay vì bị cắt.
            Chỉ khi MỞ RỘNG: thu gọn cần overflow visible cho chú giải. */}
        <div className={`flex min-h-0 flex-1 flex-col ${expanded ? "no-scrollbar overflow-y-auto overscroll-contain" : ""}`}>
          <NavList role={role} t={t} expanded={expanded} />
        </div>
        {/* Khối « Lớp của bạn » gỡ 24/09 theo yêu cầu chủ dự án; PeopleCard
            còn đó nếu cần dựng lại. */}

        <Footer t={t} signedIn={signedIn} expanded={expanded} />
      </aside>

      {/* Mobile: lớp phủ + ngăn kéo trượt từ trái */}
      <div
        className={[
          "fixed inset-0 z-40 bg-ink/40 transition-opacity duration-200 md:hidden",
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
          "fixed left-0 top-0 z-50 flex h-[100dvh] w-72 max-w-[85vw] flex-col bg-surface",
          "border-0 border-r border-solid border-line",
          "transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] md:hidden",
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

        <div className="shrink-0 py-3">
          <Brand expanded onBlue={false} />
        </div>

        {/* Ngăn kéo luôn mở rộng. Toàn bộ phần dưới cuộn được (18/10): trên điện
            thoại mục cuối (« Tài khoản ») từng bị thanh trình duyệt che mất.
            pb theo safe-area để không nằm dưới thanh Home của iPhone. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
          <NavList role={role} t={t} expanded onNavigate={onClose} onBlue={false} />
          <Footer t={t} signedIn={signedIn} expanded onNavigate={onClose} onBlue={false} />
        </div>
      </aside>
    </>
  );
}