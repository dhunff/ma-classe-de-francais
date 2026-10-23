import React, { useEffect, useState, useCallback, useRef, createContext } from "react";
import { createPortal } from "react-dom";
import { Highlighter, BookMarked, X, Trash2, Eraser } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { docSoTu, themTu, xoaTu } from "../../shared/soTu.js";

/* Tô sáng + sổ từ mới trong bài luyện tập (20/10, theo chủ dự án).
 *
 * Bôi đen chữ ở bất kỳ đâu trong vùng `vungRef` (đề bài, văn bản, câu hỏi) thì
 * hiện thanh nhỏ: « Tô sáng » hoặc « Ghi vào sổ từ ». Cả hai lưu vào bảng
 * `so_tu` (151/152), nên nộp bài xong, tải lại trang hay đổi máy vẫn còn.
 *
 * Tô màu bằng CSS Custom Highlight API, KHÔNG chèn <mark> vào DOM: văn bản dựng
 * bằng dangerouslySetInnerHTML, sửa DOM ở đó thì React có ngày ghi đè hoặc vỡ.
 * Trình duyệt chưa có API này thì vẫn lưu được, chỉ không tô màu. */

/* Hai nút nhỏ (bút tô + sổ từ) đặt ngay dưới văn bản đọc: SplitPane đọc context này. */
export const SoTuCtx = createContext(null);

const coHighlight = () => typeof CSS !== "undefined" && "highlights" in CSS && typeof window.Highlight !== "undefined";

function timRange(goc, chuoi) {
  const ra = [];
  if (!goc || !chuoi) return ra;
  const w = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const s = n.nodeValue; let i = s.indexOf(chuoi);
    while (i !== -1) {
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + chuoi.length); ra.push(r);
      i = s.indexOf(chuoi, i + chuoi.length);
    }
  }
  return ra;
}

export default function SoTuMoi({ ex, children }) {
  const vungRef = useRef(null);
  const [ds, setDs] = useState(null);
  const [thanh, setThanh] = useState(null);     // { chu, x, y }
  const [moSo, setMoSo] = useState(false);
  const [form, setForm] = useState(null);       // { tu, nghia }
  const [tatCa, setTatCa] = useState(null);     // sổ từ mọi bài, nạp khi bấm
  const [loi, setLoi] = useState("");
  const [but, setBut] = useState(false);   // bật bút: bôi đen là tô luôn
  const butRef = useRef(false); butRef.current = but;
  const ghiRef = useRef(null);

  useEffect(() => { let con = true; docSoTu(ex.id).then((d) => { if (con) setDs(d); }); return () => { con = false; }; }, [ex.id]);

  /* Tô lại sau MỖI lần dựng: câu hỏi dựng lại thì text node cũ mất, range theo. */
  useEffect(() => {
    if (!coHighlight() || !ds) return;
    const goc = vungRef.current;
    const to = ds.filter((d) => d.loai === "to").flatMap((d) => timRange(goc, d.tu));
    const tu = ds.filter((d) => d.loai !== "to").flatMap((d) => timRange(goc, d.tu));
    CSS.highlights.set("mcf-to-sang", new window.Highlight(...to));
    CSS.highlights.set("mcf-so-tu", new window.Highlight(...tu));
  });
  useEffect(() => () => { if (coHighlight()) { CSS.highlights.delete("mcf-to-sang"); CSS.highlights.delete("mcf-so-tu"); } }, []);

  /* Bôi đen trong vùng bài → hiện thanh công cụ ngay trên chỗ bôi. */
  useEffect(() => {
    const xet = () => setTimeout(() => {
      const sel = window.getSelection();
      const chu = sel?.toString().replace(/\s+/g, " ").trim();
      const goc = vungRef.current;
      if (!chu || chu.length > 300 || !goc || !sel.rangeCount || !goc.contains(sel.anchorNode) || !goc.contains(sel.focusNode)) { setThanh(null); return; }
      const r = sel.getRangeAt(0).getBoundingClientRect();
      if (butRef.current) { ghiRef.current?.("to", chu); sel.removeAllRanges(); setThanh(null); return; }
      setThanh({ chu, x: r.left + r.width / 2, y: r.top });
    }, 0);
    document.addEventListener("mouseup", xet);
    document.addEventListener("touchend", xet);
    document.addEventListener("keyup", xet);
    return () => { document.removeEventListener("mouseup", xet); document.removeEventListener("touchend", xet); document.removeEventListener("keyup", xet); };
  }, [vungRef]);

  const ghi = useCallback(async (loai, tu, nghia) => {
    setLoi("");
    const dong = await themTu({ exerciseId: ex.id, tenBai: ex.title, loai, tu, nghia });
    if (!dong) { setLoi(tr("Chưa lưu được, thử lại nhé.", "Échec de l'enregistrement, réessaie.", "Could not save, try again.")); return false; }
    setDs((d) => [dong, ...(d ?? [])]);
    setTatCa(null);
    return true;
  }, [ex.id, ex.title]);

  ghiRef.current = ghi;

  const xoa = async (id) => {
    if (await xoaTu(id)) { setDs((d) => (d ?? []).filter((x) => x.id !== id)); setTatCa((t) => t && t.filter((x) => x.id !== id)); }
    else setLoi(tr("Chưa xoá được, thử lại nhé.", "Échec de la suppression.", "Could not delete."));
  };

  const boChon = () => { window.getSelection()?.removeAllRanges(); setThanh(null); };
  const daTo = thanh && (ds ?? []).find((d) => d.loai === "to" && d.tu === thanh.chu);
  const soTu = (ds ?? []).filter((d) => d.loai !== "to");
  const nutThanh = "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-transparent px-2.5 py-1.5 font-sans text-xs font-bold text-white hover:bg-white/15";

  const nutNho = "relative grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-solid";
  const congCu = (
    <div className="flex shrink-0 items-center gap-2">
      <button type="button" onClick={() => setBut((x) => !x)} aria-pressed={but}
        title={but ? tr("Tắt bút tô", "Désactiver le surligneur", "Turn off highlighter") : tr("Bút tô: bôi đen chữ để tô sáng", "Surligneur : sélectionne du texte", "Highlighter: select text to highlight")}
        className={nutNho + (but ? " border-warn bg-warn-soft text-warn" : " border-line bg-surface text-soft hover:text-ink")}>
        <Highlighter size={17} />
      </button>
      <button type="button" onClick={() => setMoSo(true)} title={tr("Sổ từ", "Carnet de mots", "Word list")}
        className={nutNho + " border-line bg-surface text-soft hover:text-ink"}>
        <BookMarked size={17} />
        {soTu.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">{soTu.length}</span>}
      </button>
    </div>
  );

  const noiDung = (
    <>
      <div className="flex items-center justify-between border-0 border-b border-solid border-line px-5 py-4">
        <p className="m-0 text-base font-extrabold text-ink">{tatCa ? tr("Sổ từ của tôi", "Mon carnet", "My word list") : tr("Sổ từ của bài này", "Carnet de l'exercice", "This exercise's words")}</p>
        <button type="button" onClick={() => setMoSo(false)} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-ink"><X size={18} /></button>
      </div>

      <div className="mcf-scroll flex-1 overflow-y-auto px-5 py-4">
        {!tatCa && (
          <form className="mb-4 grid gap-2 rounded-2xl bg-surface2 p-3"
            onSubmit={async (e) => { e.preventDefault(); if (!form?.tu?.trim()) return; if (await ghi("tu", form.tu, form.nghia)) setForm({ tu: "", nghia: "" }); }}>
            <input lang="fr" value={form?.tu ?? ""} maxLength={120} onChange={(e) => setForm({ ...(form ?? {}), tu: e.target.value })}
              placeholder={tr("Từ mới (tiếng Pháp)", "Mot nouveau", "New word")}
              className="rounded-lg border border-solid border-line bg-surface px-3 py-2 font-sans text-sm text-ink" />
            <input value={form?.nghia ?? ""} maxLength={300} onChange={(e) => setForm({ ...(form ?? {}), nghia: e.target.value })}
              placeholder={tr("Nghĩa (không bắt buộc)", "Sens (facultatif)", "Meaning (optional)")}
              className="rounded-lg border border-solid border-line bg-surface px-3 py-2 font-sans text-sm text-ink" />
            <button type="submit" className="cursor-pointer rounded-lg border-0 bg-primary px-3 py-2 font-sans text-sm font-bold text-on-primary disabled:opacity-50" disabled={!form?.tu?.trim()}>
              {tr("Lưu vào sổ", "Enregistrer", "Save")}
            </button>
            <p className="m-0 text-xs text-soft">{tr("Mẹo: bôi đen một từ trong bài để ghi nhanh.", "Astuce : sélectionne un mot dans l'exercice.", "Tip: select a word in the exercise.")}</p>
          </form>
        )}
        {loi && <p className="m-0 mb-3 text-sm font-semibold text-danger">{loi}</p>}

        {(() => {
          const list = tatCa ?? soTu;
          if (ds === null && !tatCa) return <p className="m-0 text-sm text-danger">{tr("Không đọc được sổ từ.", "Impossible de lire le carnet.", "Could not load the word list.")}</p>;
          if (!list.length) return <p className="m-0 text-sm text-soft">{tr("Chưa có từ nào.", "Aucun mot pour l'instant.", "No words yet.")}</p>;
          return (
            <ul className="m-0 grid list-none gap-2 p-0">
              {list.map((d) => (
                <li key={d.id} className="flex items-start gap-3 rounded-xl border border-solid border-line px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p lang="fr" className="m-0 break-words text-sm font-bold text-ink">{d.tu}</p>
                    {d.nghia && <p className="m-0 mt-0.5 break-words text-sm text-soft">{d.nghia}</p>}
                    {tatCa && d.ten_bai && <p className="m-0 mt-1 text-[11px] text-soft">{d.ten_bai}</p>}
                  </div>
                  <button type="button" onClick={() => xoa(d.id)} title={tr("Xoá", "Supprimer", "Delete")}
                    className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-soft hover:bg-danger-soft hover:text-danger"><Trash2 size={15} /></button>
                </li>
              ))}
            </ul>
          );
        })()}
      </div>

      <div className="grid gap-2 border-0 border-t border-solid border-line px-5 py-3">
        {/* 23/10: từ trong sổ có lịch ôn SM-2, ôn ở màn Flashcard (?so-tu mở thẳng). */}
        <a href="/etudiant/bo-the?so-tu=1" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 font-sans text-sm font-bold text-on-primary no-underline hover:opacity-90">
          <BookMarked size={15} /> {tr("Ôn sổ từ bằng thẻ lật", "Réviser en flashcards", "Review as flashcards")}
        </a>
        <button type="button"
          onClick={async () => { if (tatCa) { setTatCa(null); return; } const d = await docSoTu(); setTatCa((d ?? []).filter((x) => x.loai !== "to")); }}
          className="w-full cursor-pointer rounded-lg border border-solid border-line bg-surface px-3 py-2 font-sans text-sm font-bold text-primary hover:bg-surface2">
          {tatCa ? tr("Chỉ xem bài này", "Cet exercice seulement", "This exercise only") : tr("Xem sổ từ mọi bài", "Voir tout mon carnet", "See all my words")}
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`::highlight(mcf-to-sang){background-color:rgb(250 204 21 / .45);color:inherit}
::highlight(mcf-so-tu){background-color:rgb(56 189 248 / .25);text-decoration:underline 2px rgb(14 165 233);text-underline-offset:3px}`}</style>

      {thanh && createPortal(
        <div onMouseDown={(e) => e.preventDefault()}
          className="fixed z-[500] flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-xl bg-gray-900 p-1 shadow-lg"
          style={{ left: Math.max(90, Math.min(window.innerWidth - 90, thanh.x)), top: Math.max(48, thanh.y - 8) }}>
          {daTo
            ? <button type="button" className={nutThanh} onClick={() => { xoa(daTo.id); boChon(); }}><Eraser size={14} />{tr("Bỏ tô", "Effacer", "Remove")}</button>
            : <button type="button" className={nutThanh} onClick={() => { ghi("to", thanh.chu); boChon(); }}><Highlighter size={14} />{tr("Tô sáng", "Surligner", "Highlight")}</button>}
          {thanh.chu.length <= 120 && (
            <button type="button" className={nutThanh} onClick={() => { setForm({ tu: thanh.chu, nghia: "" }); setTatCa(null); setMoSo(true); boChon(); }}>
              <BookMarked size={14} />{tr("Ghi vào sổ từ", "Ajouter au carnet", "Add to word list")}
            </button>
          )}
        </div>, document.body)}

      {/* Bài không có văn bản đọc: hai nút nằm ngay trên câu hỏi. */}
      {!ex.readingText && <div className="mb-3">{congCu}</div>}
      <SoTuCtx.Provider value={ex.readingText ? congCu : null}>
        <div ref={vungRef}>{children}</div>
      </SoTuCtx.Provider>

      {moSo && createPortal(
        <div className="fixed inset-0 z-[450] flex justify-end bg-black/40" onClick={() => setMoSo(false)}>
          <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-md flex-col bg-surface shadow-2xl" style={{ height: "100dvh" }}>
            {noiDung}
          </div>
        </div>, document.body)}
    </>
  );
}

/* Bọc vùng bài: `bat` tắt (khách, giáo viên) thì trả nguyên nội dung. */
export function BocSoTu({ bat, ex, children }) {
  return bat ? <SoTuMoi ex={ex}>{children}</SoTuMoi> : children;
}
