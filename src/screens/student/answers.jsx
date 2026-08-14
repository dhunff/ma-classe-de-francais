import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS as DndCSS } from "@dnd-kit/utilities";
import { C, S, VF_OPTS } from "../../shared/tokens.js";
import { seedShuffle, tableauCells, ordreOk } from "../../shared/questions.js";
import { useT } from "../../shared/i18n.jsx";

function OrdreChip({ id, texte, onClick, tone, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const colors = tone === "ok" ? { bg: C.okSoft, bd: C.ok, tx: C.ok }
    : tone === "bad" ? { bg: C.dangerSoft, bd: C.danger, tx: C.danger }
    : { bg: "var(--mcf-surface)", bd: "var(--mcf-line)", tx: "var(--mcf-ink)" };
  return (
    <span ref={setNodeRef} {...attributes} {...listeners} onClick={onClick}
      style={{ transform: DndCSS.Transform.toString(transform), transition,
        display: "inline-block", padding: "9px 16px", borderRadius: 12, fontWeight: 700, fontSize: 14.5,
        background: colors.bg, color: colors.tx, cursor: disabled ? "default" : "grab", userSelect: "none", touchAction: "none",
        borderStyle: "solid", borderColor: colors.bd, borderWidth: "1.5px 1.5px 4px 1.5px",
        opacity: isDragging ? 0.4 : 1,
        /* Bóng lúc nhấc lấy màu chủ đạo qua biến CSS, không phải mã màu cứng:
           bản tối dùng primary sáng hơn, nên rgba(61,90,241) cũ vừa lệch tông
           vừa gần như vô hình trên nền đen. */
        boxShadow: isDragging ? "0 8px 20px rgb(var(--mcf-primary-rgb) / .35)" : "none" }}>
      {texte}
    </span>
  );
}

/* Vùng thả. Tách thành component riêng vì useDroppable phải chạy BÊN TRONG
   <DndContext> mới đăng ký được với nó.

   Trước đây hook gọi ngay trong OrdreBlocks — cùng component render ra
   DndContext, tức nằm ngoài provider. Thiếu import thì crash; thêm import
   xong sẽ hết crash nhưng vùng thả im lặng không hoạt động: `isOver` không
   bao giờ đúng, và thả vào ô trống không ăn vì droppable chưa từng được ghi
   danh. Lỗi thứ hai khó thấy hơn lỗi đầu nhiều. */
function DropZone({ id, style, overStyle, idleStyle, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} style={{ ...style, ...(isOver ? overStyle : idleStyle) }}>
      {children}
    </div>
  );
}

function OrdreBlocks({ q, value, onChange, readOnly, correction }) {
  const chosen = Array.isArray(value) ? value : [];
  const elements = q.elements || [];
  const byId = Object.fromEntries(elements.map((e) => [e.id, e.texte]));
  const shuffled = React.useMemo(() => seedShuffle(elements.map((e) => e.id), q.id), [q.id, elements.length]);
  const bank = shuffled.filter((id) => !chosen.includes(id));
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } })
  );

  const onDragEnd = ({ active, over }) => {
    if (readOnly || !over) return;
    const aId = active.id, oId = over.id;
    const inChosen = chosen.includes(aId);
    if (inChosen && chosen.includes(oId) && aId !== oId) {
      onChange(arrayMove(chosen, chosen.indexOf(aId), chosen.indexOf(oId)));
    } else if (!inChosen && (chosen.includes(oId) || oId === "zone1-" + q.id)) {
      const idx = chosen.includes(oId) ? chosen.indexOf(oId) : chosen.length;
      const next = [...chosen]; next.splice(idx, 0, aId); onChange(next);
    } else if (inChosen && (oId === "bank-" + q.id || bank.includes(oId))) {
      onChange(chosen.filter((x) => x !== aId));
    }
  };

  const toneFor = (id, i) => !correction ? null : (elements[i] && elements[i].id === id ? "ok" : "bad");

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      {/* Zone 1 — zone de réponse */}
      <DropZone id={"zone1-" + q.id}
        style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start",
          minHeight: 62, padding: 12, borderRadius: 16, marginBottom: correction ? 8 : 14,
          background: "var(--mcf-surface2)", transition: "border-color .15s ease" }}
        overStyle={{ border: `2px dashed ${C.primary}` }}
        idleStyle={{ border: "2px dashed var(--mcf-line)" }}>
        <SortableContext items={chosen} strategy={rectSortingStrategy}>
          {chosen.length === 0 && (
            <span style={{ color: C.soft, fontSize: 13, padding: "8px 4px" }}>
              Glissez ou cliquez sur les mots ci-dessous pour construire la phrase…
            </span>
          )}
          {chosen.map((id, i) => (
            <OrdreChip key={id} id={id} texte={byId[id]} tone={toneFor(id, i)} disabled={readOnly}
              onClick={() => !readOnly && onChange(chosen.filter((x) => x !== id))} />
          ))}
        </SortableContext>
      </DropZone>
      {/* Zone 2 — banque de mots */}
      {!correction && bank.length > 0 && (
        <DropZone id={"bank-" + q.id}
          style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "4px 2px", minHeight: 50 }}>
          <SortableContext items={bank} strategy={rectSortingStrategy}>
            {bank.map((id) => (
              <OrdreChip key={id} id={id} texte={byId[id]} disabled={readOnly}
                onClick={() => !readOnly && onChange([...chosen, id])} />
            ))}
          </SortableContext>
        </DropZone>
      )}
      {correction && !ordreOk(q, chosen) && (
        <div style={{ marginTop: 6, background: C.okSoft, border: `1.5px solid ${C.ok}55`, borderRadius: 12, padding: "10px 14px", fontSize: 14 }}>
          <strong style={{ color: C.ok }}>💡 Phrase correcte :</strong> {elements.map((e) => e.texte).join(" ")}
        </div>
      )}
    </DndContext>
  );
}

function TableauCompare({ q, value, onChange, readOnly, correction }) {
  const set = (key, v) => { if (readOnly) return; onChange({ ...value, [key]: value?.[key] === v ? undefined : v }); };
  return (
    <div style={{ overflowX: "auto" }} className="mcf-scroll">
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 420, fontSize: 13.5 }}>
        <thead>
          <tr>
            <th rowSpan={2} style={{ border: `1px solid ${C.line}`, padding: "8px 12px", textAlign: "left", background: "var(--mcf-surface2)", position: "sticky", left: 0, zIndex: 1 }}></th>
            {q.colonnes.map((co) => (
              <th key={co.id} colSpan={2} style={{ border: `1px solid ${C.line}`, padding: "8px 12px", background: "var(--mcf-surface2)", fontSize: 13 }}>{co.titre}</th>
            ))}
          </tr>
          <tr>
            {q.colonnes.map((co) => (
              <React.Fragment key={co.id}>
                <th style={{ border: `1px solid ${C.line}`, padding: "5px 10px", background: "var(--mcf-surface2)", fontSize: 12, color: C.ok }}>OUI</th>
                <th style={{ border: `1px solid ${C.line}`, padding: "5px 10px", background: "var(--mcf-surface2)", fontSize: 12, color: C.danger }}>NON</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {q.criteres.map((cr, ri) => (
            <tr key={cr.id} style={{ background: ri % 2 ? "var(--mcf-surface2)" : "transparent" }}>
              <td style={{ border: `1px solid ${C.line}`, padding: "8px 12px", fontWeight: 600, position: "sticky", left: 0, background: ri % 2 ? "var(--mcf-surface2)" : "var(--mcf-surface)", zIndex: 1 }}>{cr.texte}</td>
              {q.colonnes.map((co) => {
                const key = `${cr.id}_${co.id}`;
                const stu = value?.[key];
                const good = q.answers?.[key];
                return ["OUI", "NON"].map((v) => {
                  let bg = "transparent", mark = null;
                  if (correction) {
                    if (good === v) { bg = C.okSoft; if (stu === v) mark = "✓"; }
                    if (stu === v && good !== v) { bg = C.dangerSoft; mark = "✗"; }
                  }
                  return (
                    <td key={v} onClick={() => set(key, v)}
                      style={{ border: `1px solid ${C.line}`, padding: "8px 10px", textAlign: "center", cursor: readOnly ? "default" : "pointer", background: bg }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 6,
                        border: `2px solid ${stu === v ? (v === "OUI" ? C.ok : C.danger) : C.line}`,
                        background: stu === v ? (v === "OUI" ? C.ok : C.danger) : "transparent", color: "#fff", fontWeight: 800, fontSize: 13 }}>
                        {stu === v ? (mark || "✓") : (correction && good === v ? "·" : "")}
                      </span>
                    </td>
                  );
                });
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---- ⚠️ Modal de confirmation : copie incomplète ---- */
function ConfirmSubmitModal({ count, onCancel, onConfirm }) {
  const t = useT();
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="mcf-float" style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", backdropFilter: "blur(4px)",
      display: "grid", placeItems: "center", padding: 16, zIndex: 9999 }} onClick={onCancel}>
      <div style={{ ...S.card, width: "100%", maxWidth: 460, background: "var(--mcf-card, #FFFFFF)",
        color: "var(--mcf-ink, #111827)", opacity: 1, border: "1px solid var(--mcf-line, #EEF0F4)",
        boxShadow: "0 24px 60px rgba(15,23,42,.35)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 38, marginBottom: 6 }}>⚠️</div>
        <h3 style={{ ...S.display, fontSize: 20, margin: "0 0 10px" }}>{t("incomplete_title")}</h3>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, margin: "0 0 20px", color: "var(--mcf-ink, #111827)" }}>
          {t("incomplete_body", { count })}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={S.btn(false)} onClick={onCancel}>{t("keep_working")}</button>
          <button style={{ ...S.btn(true), background: C.danger, boxShadow: "none" }} onClick={onConfirm}>{t("submit_anyway")}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export { OrdreChip, OrdreBlocks, TableauCompare, ConfirmSubmitModal };
