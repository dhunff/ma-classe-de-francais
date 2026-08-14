import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Moon, Sun, LogOut, ChevronRight } from "lucide-react";

/* Menu bật ra từ ảnh đại diện — cửa duy nhất tới cài đặt, đổi nền và đăng
   xuất, sau khi khối hồ sơ ở chân thanh bên bị gỡ.

   MÀU đi qua token chứ không phải slate/blue viết cứng: token tự đảo ở bản
   tối và được scripts/check-design.mjs đo tương phản.

   Preflight bị tắt nên mọi <button> đều tự khai báo border và nền. */

/* Cùng một nhịp cho cả menu này lẫn bảng tin nhắn — hai tấm bật ra từ cùng
   một hàng biểu tượng, lệch nhịp nhau thì thấy rõ là hai thứ chắp vá. */
export const POP_MOTION = {
  initial: { opacity: 0, y: -15, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
  transition: { type: "spring", stiffness: 300, damping: 25 },
};

/* Hàng trong menu. `group` để biểu tượng phóng nhẹ theo khi rê chuột cả dòng,
   chứ không phải chỉ khi trỏ đúng vào biểu tượng. */
function Row({ Icon, children, onClick, to, after }) {
  const cls =
    "group flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent p-3 text-left font-[inherit] text-sm font-semibold text-ink no-underline transition-colors duration-200 hover:bg-surface2";

  const inner = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface2 text-ink transition-transform duration-200 group-hover:scale-110">
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {after}
    </>
  );

  if (to) return <Link to={to} onClick={onClick} className={cls}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

export default function AvatarMenu({ session, t, dark, onToggleDark, onLogout }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);

  const name = session?.name || "";
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const roleLabel = session?.role === "prof" ? t("header.teacher") : t("header.student");

  /* `mousedown` chứ không phải `click`: nút mở cũng nghe click, nghe cùng sự
     kiện sẽ thành đóng rồi mở lại ngay trong một nhịp bấm. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={name || t("header.student")}
        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border-0 bg-primary p-0 text-sm font-bold text-on-primary ring-0 ring-primary/30 transition-all duration-300 hover:ring-4 focus:outline-none focus:ring-4"
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...POP_MOTION}
            role="menu"
            /* z-50: tấm thẻ nội dung của AppLayout khoá tràn, nên menu phải nổi
               hẳn lên trên nó thay vì bị cắt. */
            className="absolute right-0 top-full z-50 mt-2 w-80 origin-top-right rounded-2xl border border-solid border-line bg-surface p-2 shadow-[0_20px_50px_rgb(0,0,0,0.22)]"
          >
            <div className="border-0 border-b border-solid border-line px-2 pb-3 pt-1">
              <Link
                to="/etudiant/compte"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-xl p-2 no-underline transition-colors duration-200 hover:bg-surface2"
              >
                <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-on-primary">
                  {initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">{name}</span>
                  <span className="block truncate text-xs text-soft">{roleLabel}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-soft transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-1 flex flex-col">
              <Row Icon={Settings} to="/etudiant/compte" onClick={() => setOpen(false)}>
                {t("header.settings")}
              </Row>

              {/* Đổi nền chuyển vào đây sau khi nút riêng trên thanh trên bị gỡ.
                  Công tắc nhỏ bên phải chỉ để nhìn — cả hàng đều bấm được, nên
                  nó `pointer-events-none` để không nuốt mất cú bấm. */}
              <Row
                Icon={dark ? Sun : Moon}
                onClick={onToggleDark}
                after={
                  <span
                    aria-hidden
                    className={`pointer-events-none flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${dark ? "bg-primary" : "bg-line-strong"}`}
                  >
                    <span className={`h-5 w-5 rounded-full bg-surface shadow transition-transform duration-200 ${dark ? "translate-x-5" : "translate-x-0"}`} />
                  </span>
                }
              >
                {t("header.dark_mode_label")}
              </Row>

              <Row Icon={LogOut} onClick={() => { setOpen(false); onLogout?.(); }}>
                {t("header.logout")}
              </Row>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
