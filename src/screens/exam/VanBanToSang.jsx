import React, { useRef, useState } from "react";
import { Highlighter, Eraser } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Bài đọc có BÚT TÔ SÁNG (14/10, theo chủ dự án), như gạch chân trên tờ đề.
 *
 * Bật bút → bôi đen một đoạn là đoạn đó được tô vàng. Bấm vào chỗ đã tô để
 * bỏ tô. Tô theo TỪNG NÚT CHỮ (không bọc cả thẻ <p>), nên bôi qua nhiều đoạn
 * văn vẫn giữ đúng cấu trúc HTML.
 *
 * React chỉ đặt innerHTML MỘT lần (giá trị ban đầu giữ trong useState): sau đó
 * DOM do chính bút tô sửa, và bản đã tô được nhớ theo bài trong phiên, để
 * chuyển sang bài khác rồi quay lại vẫn còn. Không gửi lên máy chủ. */
const DA_TO = new Map();   // exerciseId → innerHTML đã tô (trong phiên)

function toVung(range, goc) {
  const walker = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT);
  const ds = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (range.intersectsNode(n) && n.nodeValue.trim() && !n.parentElement.closest("mark.de-to")) ds.push(n);
  }
  for (const n of ds) {
    let dau = n === range.startContainer ? range.startOffset : 0;
    let cuoi = n === range.endContainer ? range.endOffset : n.nodeValue.length;
    if (dau >= cuoi) continue;
    let t = n;
    if (dau > 0) t = t.splitText(dau);
    if (cuoi - dau < t.nodeValue.length) t.splitText(cuoi - dau);
    const m = document.createElement("mark");
    m.className = "de-to";
    t.parentNode.insertBefore(m, t);
    m.appendChild(t);
  }
  return ds.length > 0;
}

export default function VanBanToSang({ exId, html, className = "" }) {
  const goc = useRef(null);
  const [banDau] = useState(() => DA_TO.get(exId) ?? html);
  const [bat, setBat] = useState(true);
  const [coTo, setCoTo] = useState(() => DA_TO.has(exId));
  const luu = () => { DA_TO.set(exId, goc.current.innerHTML); setCoTo(!!goc.current.querySelector("mark.de-to")); };

  const khiNha = () => {
    if (!bat || !goc.current) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const r = sel.getRangeAt(0);
    if (!goc.current.contains(r.commonAncestorContainer)) return;
    if (toVung(r, goc.current)) { sel.removeAllRanges(); luu(); }
  };
  const khiBam = (e) => {
    const m = e.target.closest?.("mark.de-to");
    if (!m || !window.getSelection()?.isCollapsed) return;
    m.replaceWith(...m.childNodes);
    goc.current.normalize();
    luu();
  };
  const xoaHet = () => {
    goc.current.querySelectorAll("mark.de-to").forEach((m) => m.replaceWith(...m.childNodes));
    goc.current.normalize();
    luu();
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>
        <button type="button" onClick={() => setBat((x) => !x)} aria-pressed={bat}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-none border-[1.5px] border-solid border-[#111] px-3 py-1 text-xs font-bold uppercase tracking-wide ${bat ? "bg-[#fde047] text-[#111]" : "bg-white text-[#555]"}`}>
          <Highlighter size={14} /> {bat ? tr("Bút tô sáng: bật", "Surligneur : activé", "Highlighter: on") : tr("Bút tô sáng: tắt", "Surligneur : désactivé", "Highlighter: off")}
        </button>
        {coTo && (
          <button type="button" onClick={xoaHet}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-none border-[1.5px] border-solid border-[#999] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#555] hover:border-[#111] hover:text-[#111]">
            <Eraser size={14} /> {tr("Xoá tô sáng", "Effacer", "Clear")}
          </button>
        )}
        <span className="text-[11px] italic text-[#555]">{bat ? tr("Bôi đen để tô, bấm vào chỗ tô để bỏ.", "Sélectionnez pour surligner, cliquez pour retirer.", "Select to highlight, click to remove.") : ""}</span>
      </div>
      <div ref={goc} onMouseUp={khiNha} onTouchEnd={khiNha} onClick={khiBam} className={className}
        dangerouslySetInnerHTML={{ __html: banDau }} />
    </div>
  );
}
