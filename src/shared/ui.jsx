import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { C, S } from "./tokens.js";

function FloatingLayer({ anchorRef, open, onClose, children, width = 300, align = "right", radius = 24, padding = 10 }) {
  const [pos, setPos] = useState(null);
  const layerRef = useRef(null);
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const place = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r) return;
      let left = align === "right" ? r.right - width : r.left;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
      const h = layerRef.current?.offsetHeight || 200;
      const below = r.bottom + 6;
      const top = (below + h > window.innerHeight - 8 && r.top - h - 6 > 8) ? r.top - h - 6 : below;
      setPos({ top, left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => { window.removeEventListener("scroll", place, true); window.removeEventListener("resize", place); };
  }, [open, width, align, anchorRef]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (layerRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return;
      onClose();
    };
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, onClose, anchorRef]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div ref={layerRef} className="mcf-float" style={{ position: "fixed", top: pos?.top ?? -9999, left: pos?.left ?? -9999, width,
      zIndex: 9999, background: "var(--mcf-surface, #FFFFFF)", borderRadius: radius, padding, color: "var(--mcf-ink, #111827)",
      border: "1px solid var(--mcf-line, #EEF0F4)", boxShadow: "0 18px 44px rgba(17,24,39,.28)", opacity: 1,
      visibility: pos ? "visible" : "hidden" }}>
      {children}
    </div>,
    document.body
  );
}

function KebabMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} title="Plus d'options"
        style={{ width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${C.line}`, background: "var(--mcf-surface)",
          cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "0 2px 8px rgba(17,24,39,.06)" }}>
        <MoreVertical size={18} color={C.ink} />
      </button>
      <FloatingLayer anchorRef={ref} open={open} onClose={() => setOpen(false)} width={200} radius={20} padding={6}>
        {items.map(({ label, icon, danger, onClick }, i) => (
          <button key={i} onClick={() => { setOpen(false); onClick(); }} role="menuitem"
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px",
              border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit",
              fontSize: 14, fontWeight: 600, borderRadius: 14, textAlign: "left",
              color: danger ? C.danger : "var(--mcf-ink, #111827)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = danger ? C.dangerSoft : "var(--mcf-bg)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            {icon} {label}
          </button>
        ))}
      </FloatingLayer>
    </div>
  );
}

/* Tab gạch chân dùng chung cho các hàng điều hướng chính.

   Thay cho hàng nút viền xám cũ: bỏ hẳn viền và nền, chỉ còn chữ và một
   đường gạch chân dưới mục đang chọn. Ít đường kẻ hơn thì mắt bám vào chữ,
   là thứ mang thông tin.

   Trạng thái đang chọn được đánh dấu bằng ba tín hiệu: gạch chân, chữ đậm,
   và `aria-selected` — không phụ thuộc riêng vào màu.

   Hàng cuộn ngang trên màn hình hẹp thay vì xuống dòng, để chiều cao không
   nhảy khi số tab thay đổi. */
function UnderlineTabs({ items, active, onSelect, ariaLabel, trailing }) {
  return (
    <div className="mb-4 flex items-end gap-1 border-0 border-b border-solid border-line">
      <div role="tablist" aria-label={ariaLabel}
        className="mcf-scroll -mb-px flex flex-1 gap-1 overflow-x-auto">
        {items.map(([key, label]) => {
          const on = active === key;
          return (
            <button key={key} type="button" role="tab" aria-selected={on}
              onClick={() => onSelect(key)}
              className={[
                "shrink-0 whitespace-nowrap px-3 py-2.5 text-sm transition-colors",
                "border-0 border-b-2 border-solid bg-transparent",
                on
                  ? "border-primary font-bold text-primary"
                  : "border-transparent font-medium text-soft hover:text-ink",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
      {trailing && <div className="shrink-0 pb-1.5">{trailing}</div>}
    </div>
  );
}

/* Hộp giải thích khi trả lời sai.

   Chỉ hiện khi SAI, và chỉ khi câu hỏi có lời giải thích. Hiện cả khi đúng thì
   nó thành chú thích nền — người làm đúng không cần đọc lại lý do, và một hộp
   đỏ dưới câu trả lời đúng gây hoang mang.

   Màu qua token `danger`/`dangerSoft` chứ không phải red-50/red-700 viết cứng:
   token tự đảo ở bản tối, còn nền đỏ nhạt cố định trên nền tối thì chói và
   chữ đỏ đậm trên đó gần như không đọc được.

   Dùng ở hai màn hình chấm (Student.jsx và PracticeHub.jsx) nên đặt chung —
   chép hai bản là bảo đảm hai nơi lệch nhau. */
function WrongExplanation({ explanation, show = true }) {
  const text = String(explanation || "").trim();
  if (!show || !text) return null;

  return (
    <div
      role="note"
      style={{
        marginTop: 8, background: C.dangerSoft, border: `1.5px solid ${C.danger}55`,
        borderRadius: 12, padding: "9px 13px", fontSize: 13.5, lineHeight: 1.6,
        color: C.ink,
      }}
    >
      <strong style={{ color: C.danger }}>Attention :</strong> {text}
    </div>
  );
}

export { FloatingLayer, KebabMenu, UnderlineTabs, WrongExplanation };
