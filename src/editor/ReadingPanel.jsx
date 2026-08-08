import React, { useState, useRef, useEffect } from "react";
import { C, S } from "../shared/tokens.js";

function ReadingPanel({ text, stickyTop = 8 }) {
  const boxRef = React.useRef(null);
  const [btn, setBtn] = useState(null); // {x, y}
  const [fontSize, setFontSize] = useState(16); // 14 → 24 px

  const onSelect = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) { setBtn(null); return; }
    const range = sel.getRangeAt(0);
    if (!boxRef.current?.contains(range.commonAncestorContainer)) { setBtn(null); return; }
    const rect = range.getBoundingClientRect();
    setBtn({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const highlight = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const mark = document.createElement("mark");
    mark.className = "mcf-hl";
    try { range.surroundContents(mark); }
    catch { mark.appendChild(range.extractContents()); range.insertNode(mark); }
    sel.removeAllRanges();
    setBtn(null);
  };

  return (
    <>
      {btn && (
        <button onMouseDown={(e) => { e.preventDefault(); highlight(); }}
          style={{ position: "fixed", left: btn.x, top: btn.y - 44, transform: "translateX(-50%)", zIndex: 200,
            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 999, border: "none",
            background: "#111827", color: "#FFD43B", fontWeight: 800, fontSize: 13, cursor: "pointer",
            boxShadow: "0 8px 20px rgba(17,24,39,.3)", fontFamily: "inherit" }}>
          🖍 Surligner
        </button>
      )}
      <div ref={boxRef} className="mcf-card mcf-scroll"
        onMouseUp={onSelect} onTouchEnd={onSelect}
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ ...S.card, flex: "6 1 380px", minWidth: 0, maxHeight: "76vh", overflowY: "auto",
          position: "sticky", top: stickyTop }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <div style={S.label}>📖 Texte à lire <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>· surlignez une phrase pour la marquer 🖍</span></div>
          {/* A- / A+ : chỉnh cỡ chữ 14-24px */}
          <div style={{ display: "flex", gap: 6 }}>
            {[["A−", -2], ["A+", 2]].map(([lbl, delta]) => (
              <button key={lbl} title={delta > 0 ? "Agrandir le texte" : "Réduire le texte"}
                disabled={delta > 0 ? fontSize >= 24 : fontSize <= 14}
                onClick={() => setFontSize((f) => Math.min(24, Math.max(14, f + delta)))}
                style={{ width: 36, height: 30, borderRadius: 999, border: `1.5px solid ${C.line}`,
                  background: "var(--mcf-surface)", color: C.ink, cursor: "pointer", fontWeight: 800,
                  fontSize: delta > 0 ? 14 : 11.5, fontFamily: "inherit",
                  opacity: (delta > 0 ? fontSize >= 24 : fontSize <= 14) ? 0.35 : 1 }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.9, fontSize }}>{text}</div>
      </div>
    </>
  );
}

export default ReadingPanel;
