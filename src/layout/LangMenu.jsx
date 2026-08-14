import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

/* Bộ chọn ngôn ngữ — nút viên thuốc + menu thả xuống.

   Thay cho <select> gốc vì thẻ đó không tạo kiểu được phần danh sách: trình
   duyệt tự vẽ theo hệ điều hành, nên nó luôn lạc lõng giữa giao diện Soft UI
   và không bao giờ đổi theo bản tối.

   MÀU đi qua token chứ không phải slate/blue viết cứng — token tự đảo ở bản
   tối và được scripts/check-design.mjs đo tương phản.

   BÀN PHÍM phải chạy đủ, vì <select> vốn đã làm được và thay bằng thứ kém hơn
   là đi lùi: Enter/Space mở, Escape đóng và trả tiêu điểm về nút, mũi tên
   lên/xuống di chuyển trong danh sách.

   Preflight bị tắt nên mọi <button> ở đây đều tự khai báo border và nền. */

export default function LangMenu({ lang, langs, onLang, t }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);

  const current = langs.find(([code]) => code === lang) || langs[0];
  const [, flag, , short] = current;

  /* Bấm ra ngoài hoặc nhấn Escape thì đóng. `mousedown` chứ không phải
     `click`: nút mở menu cũng nghe click, nghe cùng sự kiện sẽ thành đóng rồi
     mở lại ngay trong một nhịp bấm. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Mở ra thì đưa tiêu điểm vào mục đang chọn, để bàn phím đi tiếp được ngay.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector('[data-active="true"]') || listRef.current?.querySelector("button");
    el?.focus();
  }, [open]);

  const move = (e, i) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...(listRef.current?.querySelectorAll("button") || [])];
    const next = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  const pick = (code) => {
    onLang(code);
    setOpen(false);
    btnRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang_label")}
        className="flex h-10 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-3 font-[inherit] text-sm font-bold text-ink transition-colors hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <span aria-hidden className="text-base leading-none">{flag}</span>
        <span>{short}</span>
        <ChevronDown size={14} aria-hidden
          className={`text-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-label={t("lang_label")}
          className="mcf-float absolute right-0 top-full z-50 mt-2 min-w-[176px] rounded-xl border border-solid border-line bg-surface p-2 shadow-[0_18px_44px_rgb(0,0,0,0.16)]"
        >
          {langs.map(([code, f, label], i) => {
            const active = code === lang;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={active}
                data-active={active}
                onClick={() => pick(code)}
                onKeyDown={(e) => move(e, i)}
                className={[
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 px-3 py-2 text-left font-[inherit] text-sm",
                  "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40",
                  active
                    ? "bg-primary-soft font-bold text-primary"
                    : "bg-transparent font-medium text-ink hover:bg-primary-soft/60",
                ].join(" ")}
              >
                <span aria-hidden className="text-base leading-none">{f}</span>
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {/* Dấu tích chứ không chỉ đổi màu: ngôn ngữ đang dùng phải
                    nhận ra được mà không cần phân biệt màu. */}
                {active && <Check size={15} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
