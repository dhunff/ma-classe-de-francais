import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, SquarePen, Inbox } from "lucide-react";
import { POP_MOTION } from "./AvatarMenu.jsx";

/* Bảng tin nhắn — mới là phần vỏ. Chỗ này dành cho trao đổi tay đôi giữa học
   sinh và giáo viên; phần Supabase realtime nối sau.

   KHÔNG có hội thoại bịa trong đường chạy thật. Hệ thống chưa có bảng tin
   nhắn nào, nên `conversations` để trống và bảng hiện trạng thái rỗng nói rõ
   tính năng chưa nối. Nhét vài cuộc trò chuyện giả vào đây là để học sinh mở
   ra, thấy tên giáo viên, bấm vào rồi không có gì xảy ra. Fixture để xem bố
   cục nằm trong preview.jsx.

   Vì vậy chấm đỏ cũng chỉ sáng khi thật sự có tin chưa đọc — không có dữ
   liệu thì không có chấm. */

function Avatar({ name }) {
  return (
    <span
      aria-hidden
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary"
    >
      {(name || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}

export default function MessagesMenu({ t, conversations = [] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);

  const unread = conversations.filter((c) => c.unread).length;

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
        aria-label={unread ? t("msg.title_unread", { n: unread }) : t("msg.title")}
        className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-soft transition-all duration-200 hover:scale-110 hover:bg-surface2 hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <MessageCircle size={20} />

        {/* Chấm đỏ hai lớp: một chấm đặc, một chấm loang ra phía sau. Lớp
            loang là `aria-hidden` và cả cụm không mang chữ — số tin chưa đọc
            đã nằm trong aria-label của nút, nói hai lần là thừa. */}
        {unread > 0 && (
          <span aria-hidden className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-surface" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...POP_MOTION}
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-solid border-line bg-surface p-2 shadow-[0_20px_50px_rgb(0,0,0,0.22)]"
          >
            <div className="flex items-center justify-between gap-2 px-2 pb-2 pt-1">
              <h2 className="m-0 text-sm font-extrabold text-ink">{t("msg.title")}</h2>
              {/* Nút soạn tin để `disabled`: chưa có chỗ gửi tới. Một nút bấm
                  vào im lặng còn tệ hơn là không có nút. */}
              <button
                type="button"
                disabled
                title={t("msg.soon")}
                aria-label={t("msg.new")}
                className="grid h-8 w-8 cursor-not-allowed place-items-center rounded-full border-0 bg-surface2 p-0 text-soft opacity-60"
              >
                <SquarePen size={15} />
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <Inbox size={24} className="text-soft" strokeWidth={1.6} />
                <p className="m-0 text-sm font-bold text-ink">{t("msg.empty_title")}</p>
                <p className="m-0 text-sm text-soft">{t("msg.empty_body")}</p>
              </div>
            ) : (
              <ul className="m-0 flex max-h-[22rem] list-none flex-col gap-0.5 overflow-y-auto p-0">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent p-3 text-left font-[inherit] transition-colors duration-200 hover:bg-surface2"
                    >
                      <Avatar name={c.name} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={`min-w-0 flex-1 truncate text-sm ${c.unread ? "font-extrabold text-ink" : "font-semibold text-ink"}`}>
                            {c.name}
                          </span>
                          {c.at && <span className="shrink-0 text-[11px] font-medium text-soft">{c.at}</span>}
                        </span>
                        <span className={`mt-0.5 block truncate text-xs ${c.unread ? "font-semibold text-ink" : "text-soft"}`}>
                          {c.preview}
                        </span>
                      </span>
                      {c.unread && <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
