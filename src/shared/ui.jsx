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

export { FloatingLayer, KebabMenu };
