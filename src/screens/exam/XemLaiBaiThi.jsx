import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Minus, Sparkles, Loader2, BookOpen, Headphones, ChevronDown, Lightbulb } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { docBaiThi } from "../../shared/xemLaiThi.js";

/* « Xem lại bài thi » (14/11, chủ dự án): sau khi thi (DELF, DALF, TCF) xem lại từng câu: mình chọn gì,
 * đúng hay sai, đáp án đúng, VÌ SAO (lời giải CỐ ĐỊNH của đề). 14/11 (chủ dự án): trắc nghiệm, điền từ KHÔNG
 * dùng AI; AI chỉ cho phần phải tự viết/nói (câu court có nhận xét AI từ grade).
 * Dữ liệu: rpc xem_lai_bai_thi (migration 207), chỉ lượt đã nộp của chính mình. Viết/Nói có phiếu
 * chấm riêng nên không có ở đây. KHÔNG hiện số câu đúng/sai (quy tắc: không tự thêm số đếm). */

const CHU = ["A", "B", "C", "D", "E", "F"];
const TEN_PHAN = () => ({ CO: tr("Nghe hiểu", "Compréhension de l'oral", "Listening"), CE: tr("Đọc hiểu", "Compréhension des écrits", "Reading"), MS: tr("Cấu trúc ngôn ngữ", "Structures de la langue", "Language structures") });
const docJSON = (s) => { try { const o = JSON.parse(s ?? ""); return o && typeof o === "object" ? o : null; } catch { return null; } };
const rong = (v) => v == null || v === "" || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) || (Array.isArray(v) && !v.length);

/* Trạng thái một câu: dung | sai | trong (bỏ trống) | mot_phan (câu chấm điểm lẻ). */
function trangThai(q) {
  if (q.type === "court") {
    if (rong(q.raw)) return "trong";
    if (q.score == null || q.max_score == null) return null;
    return Number(q.score) >= Number(q.max_score) ? "dung" : Number(q.score) > 0 ? "mot_phan" : "sai";
  }
  if (q.type === "vf" ? q.raw?.choice == null : rong(q.raw)) return "trong";
  return q.correct === true ? "dung" : q.correct === false ? "sai" : null;
}

function Nhan({ tt }) {
  if (!tt) return null;
  const m = {
    dung: ["bg-ok-soft text-ok", <Check key="i" size={13} strokeWidth={3} />, tr("Đúng", "Juste", "Correct")],
    sai: ["bg-danger-soft text-danger", <X key="i" size={13} strokeWidth={3} />, tr("Sai", "Faux", "Wrong")],
    mot_phan: ["bg-warn-soft text-warn", <Minus key="i" size={13} strokeWidth={3} />, tr("Đúng một phần", "Partiel", "Partly right")],
    trong: ["bg-surface2 text-soft", <Minus key="i" size={13} strokeWidth={3} />, tr("Bỏ trống", "Sans réponse", "Blank")],
  }[tt];
  return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${m[0]}`}>{m[1]}{m[2]}</span>;
}

/* Một phương án: tô theo đúng / mình chọn. */
function DongPA({ chu, chuHien, dung, chon }) {
  const lop = dung ? "border-ok bg-ok-soft" : chon ? "border-danger bg-danger-soft" : "border-line bg-surface";
  return (
    <li className={`flex items-start gap-2.5 rounded-xl border border-solid px-3 py-2 text-sm ${lop}`}>
      <strong className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${dung ? "bg-ok text-white" : chon ? "bg-danger text-white" : "bg-surface2 text-soft"}`}>{chu}</strong>
      <span lang="fr" className="min-w-0 flex-1 pt-0.5 text-ink">{chuHien || <em className="text-soft">{tr("(phương án đọc trong audio)", "(proposition entendue)", "(heard in the audio)")}</em>}</span>
      {dung && <span className="shrink-0 pt-0.5 text-[11px] font-extrabold text-ok">{tr("Đáp án đúng", "Bonne réponse", "Correct answer")}</span>}
      {chon && !dung && <span className="shrink-0 pt-0.5 text-[11px] font-extrabold text-danger">{tr("Bạn chọn", "Votre choix", "Your choice")}</span>}
      {chon && dung && <span className="shrink-0 pt-0.5 text-[11px] font-extrabold text-ok">· {tr("bạn chọn", "votre choix", "your choice")}</span>}
    </li>
  );
}

function NoiDungCau({ q }) {
  const p = q.payload ?? {}, k = q.answer_key ?? {};
  if (q.type === "qcm") {
    const ds = Array.isArray(p.options) ? p.options : [];
    return <ul className="m-0 mt-3 grid list-none gap-1.5 p-0">{ds.map((o, j) => <DongPA key={j} chu={CHU[j]} chuHien={String(o ?? "").trim()} dung={k.answer === j} chon={q.raw === j} />)}</ul>;
  }
  if (q.type === "vf") {
    return (
      <>
        <ul className="m-0 mt-3 grid list-none gap-1.5 p-0 sm:grid-cols-2">
          {["Vrai", "Faux"].map((o, j) => <DongPA key={j} chu={CHU[j]} chuHien={o} dung={k.answer === j} chon={q.raw?.choice === j} />)}
        </ul>
        {q.raw?.just && <p className="m-0 mt-2 text-xs text-soft">{tr("Câu bạn trích:", "Votre justification :", "Your quote:")} <em lang="fr" className="text-ink">« {q.raw.just} »</em></p>}
        {k.justification && <p className="m-0 mt-1 text-xs text-soft">{tr("Câu cần trích:", "Justification attendue :", "Expected quote:")} <em lang="fr" className="text-ink">{k.justification}</em></p>}
      </>
    );
  }
  if (q.type === "fill" || q.type === "conj" || q.type === "nghe" || q.type === "ghi") {
    const dap = String(k.accepted ?? k.answer ?? "").split("|").filter(Boolean);
    return (
      <div className="mt-3 grid gap-1 text-sm">
        <p className="m-0"><span className="text-soft">{tr("Bạn viết:", "Votre réponse :", "You wrote:")}</span> <strong lang="fr" className={q.correct ? "text-ok" : "text-danger"}>{rong(q.raw) ? "—" : String(q.raw)}</strong></p>
        <p className="m-0"><span className="text-soft">{tr("Đáp án:", "Réponse :", "Answer:")}</span> <strong lang="fr" className="text-ok">{dap.join(" / ") || "—"}</strong></p>
      </div>
    );
  }
  if (q.type === "court") {
    const f = docJSON(q.feedback) ?? {};
    return (
      <div className="mt-3 grid gap-2 text-sm">
        <p className="m-0"><span className="text-soft">{tr("Bạn trả lời:", "Votre réponse :", "Your answer:")}</span> <em lang="fr" className="text-ink">{rong(q.raw) ? "—" : `« ${q.raw} »`}</em></p>
        {q.score != null && <p className="m-0 text-xs font-bold text-ink">{tr("Điểm:", "Note :", "Score:")} {String(q.score).replace(".", ",")}/{String(q.max_score).replace(".", ",")}</p>}
        {f.nhan_xet && <p className="m-0 flex items-start gap-2 rounded-lg bg-primary-soft px-3 py-2 text-xs text-ink"><Sparkles size={13} className="mt-0.5 shrink-0 text-primary" /> {f.nhan_xet}</p>}
        {(k.model || f.mau) && <p className="m-0 text-xs text-soft"><strong className="text-ink">{tr("Đáp án mẫu:", "Corrigé :", "Model answer:")}</strong> <span lang="fr">{k.model || f.mau}</span></p>}
      </div>
    );
  }
  if (q.type === "tableau") {
    const dongs = p.criteres ?? [], cots = p.colonnes ?? [], dap = k.answers ?? {}, ban = q.raw ?? {};
    return (
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead><tr><th className="border border-solid border-line p-1.5" />{cots.map((c) => <th key={c.id} className="border border-solid border-line bg-surface2 p-1.5">{c.titre}</th>)}</tr></thead>
          <tbody>{dongs.map((cr) => (
            <tr key={cr.id}><td className="border border-solid border-line p-1.5 text-ink">{cr.texte}</td>
              {cots.map((co) => { const key = `${cr.id}_${co.id}`; const d = dap[key], b = ban[key];
                return <td key={co.id} className={`border border-solid border-line p-1.5 text-center font-bold ${b == null ? "text-soft" : b === d ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger"}`}>{b ?? "—"}{b !== d && d ? <span className="block text-[10px] text-ok">→ {d}</span> : null}</td>; })}
            </tr>))}</tbody>
        </table>
      </div>
    );
  }
  if (q.type === "apparier") {
    const items = p.items ?? [], choix = Object.fromEntries((p.choix ?? []).map((c) => [c.id, c.texte])), dap = k.answers ?? {}, ban = q.raw ?? {};
    return (
      <ul className="m-0 mt-3 grid list-none gap-1.5 p-0 text-sm">{items.map((it) => (
        <li key={it.id} className={`rounded-xl border border-solid px-3 py-2 ${ban[it.id] === dap[it.id] ? "border-ok bg-ok-soft" : "border-danger bg-danger-soft"}`}>
          <strong className="text-ink">{it.texte}</strong> → <span className="text-ink">{choix[ban[it.id]] ?? "—"}</span>
          {ban[it.id] !== dap[it.id] && <span className="block text-xs font-bold text-ok">{tr("Đúng:", "Juste :", "Correct:")} {choix[dap[it.id]]}</span>}
        </li>))}</ul>
    );
  }
  if (q.type === "ordre") {
    const chu = Object.fromEntries((p.elements ?? []).map((e) => [e.id, e.texte]));
    return (
      <div className="mt-3 grid gap-1 text-sm">
        <p className="m-0"><span className="text-soft">{tr("Bạn xếp:", "Votre ordre :", "Your order:")}</span> <span lang="fr" className={q.correct ? "text-ok" : "text-danger"}>{Array.isArray(q.raw) ? q.raw.map((id) => chu[id]).join(" ") : "—"}</span></p>
        <p className="m-0"><span className="text-soft">{tr("Câu đúng:", "Phrase correcte :", "Correct:")}</span> <span lang="fr" className="font-semibold text-ok">{(k.elements ?? []).map((e) => e.texte).join(" ")}</span></p>
      </div>
    );
  }
  return null;
}

/* Một câu nói rõ chỗ sai của câu chọn đáp án: « Bạn chọn A, đáp án đúng là C. » */
function dongSai(q, tt) {
  const k = q.answer_key ?? {};
  if (q.type === "qcm" && Number.isInteger(k.answer)) {
    if (tt === "sai" && Number.isInteger(q.raw)) return tr(`Bạn chọn ${CHU[q.raw]}, đáp án đúng là ${CHU[k.answer]}.`, `Vous avez choisi ${CHU[q.raw]}, la bonne réponse est ${CHU[k.answer]}.`, `You chose ${CHU[q.raw]}; the answer is ${CHU[k.answer]}.`);
    if (tt === "trong") return tr(`Bạn bỏ trống, đáp án đúng là ${CHU[k.answer]}.`, `Sans réponse ; la bonne réponse est ${CHU[k.answer]}.`, `Left blank; the answer is ${CHU[k.answer]}.`);
  }
  if (q.type === "vf" && Number.isInteger(k.answer)) {
    const ten = ["Vrai", "Faux"][k.answer];
    if (tt === "sai") return tr(`Bạn chọn ${["Vrai", "Faux"][q.raw?.choice] ?? "?"}, đáp án đúng là ${ten}.`, `Vous avez choisi ${["Vrai", "Faux"][q.raw?.choice] ?? "?"}, la bonne réponse est ${ten}.`, `You chose ${["Vrai", "Faux"][q.raw?.choice] ?? "?"}; the answer is ${ten}.`);
    if (tt === "trong") return tr(`Bạn bỏ trống, đáp án đúng là ${ten}.`, `Sans réponse ; la bonne réponse est ${ten}.`, `Left blank; the answer is ${ten}.`);
  }
  return "";
}

function TheCau({ q, i }) {
  const p = q.payload ?? {}, k = q.answer_key ?? {};
  const tt = trangThai(q);
  const loiGiai = q.type === "vf" ? "" : q.explanation;
  return (
    <li className="rounded-2xl border border-solid border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface2 text-xs font-extrabold text-ink">{i + 1}</span>
        <div className="min-w-0 flex-1">
          {p.anh && <img src={p.anh} alt="" loading="lazy" className="mb-2 block max-h-40 max-w-full object-contain" />}
          {p.doc && <div lang="fr" className="mb-2 rounded-xl bg-surface2 p-3 text-sm text-ink [&_p]:m-0 [&_p+p]:mt-1" dangerouslySetInnerHTML={{ __html: p.doc }} />}
          <p lang="fr" className="m-0 whitespace-pre-line text-sm font-bold text-ink">{q.prompt}</p>
        </div>
        <Nhan tt={tt} />
      </div>
      <NoiDungCau q={q} />
      {/* Lời giải CỐ ĐỊNH của đề (14/11, chủ dự án: trắc nghiệm, điền từ không dùng AI; AI chỉ cho phần
          phải tự viết / nói, đã có nhận xét riêng). Làm sai thì nói rõ chọn gì, đúng là gì, rồi vì sao. */}
      {(loiGiai || tt === "sai" || tt === "trong") && q.type !== "court" && (
        <div className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-surface2 px-3 py-2 text-xs leading-relaxed text-ink">
          <Lightbulb size={14} className="mt-0.5 shrink-0 text-warn" />
          <div className="grid gap-1">
            {dongSai(q, tt) && <span>{dongSai(q, tt)}</span>}
            {loiGiai
              ? <span><strong>{tr("Vì sao:", "Pourquoi :", "Why:")}</strong> <span lang="fr">{loiGiai}</span></span>
              : q.type !== "vf" && <span className="text-soft">{tr("Câu này chưa có lời giải chi tiết.", "Pas encore d'explication détaillée.", "No detailed explanation yet.")}</span>}
          </div>
        </div>
      )}
      {p.audio && k.model && (
        <details className="mt-2 text-xs text-soft">
          <summary className="cursor-pointer font-bold text-ink"><Headphones size={12} className="mr-1 inline" />{tr("Lời chép audio", "Transcription", "Transcript")}</summary>
          <p lang="fr" className="m-0 mt-1 whitespace-pre-line leading-relaxed">{k.model}</p>
        </details>
      )}
    </li>
  );
}

function KhoiBai({ b, chiSai }) {
  const [moBai, setMoBai] = useState(false);
  const ds = (b.questions ?? []).map((q, i) => ({ q, i })).filter(({ q }) => !chiSai || ["sai", "trong", "mot_phan"].includes(trangThai(q)));
  return (
    <section className="grid gap-3">
      <header className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-on-primary">{b.code ?? ""}</span>
        <h3 className="m-0 min-w-0 flex-1 text-base font-extrabold text-ink">{TEN_PHAN()[b.code] ?? ""}<span className="block text-xs font-semibold text-soft">{b.title}</span></h3>
      </header>
      {(b.reading_text || b.image_url) && (
        <div>
          <button type="button" onClick={() => setMoBai((v) => !v)} aria-expanded={moBai}
            className="flex w-full cursor-pointer items-center gap-2 rounded-xl border-0 bg-surface2 px-3 py-2 text-left font-sans text-xs font-bold text-ink hover:bg-primary-soft">
            <BookOpen size={13} className="text-primary" /> {tr("Xem lại tài liệu của bài", "Revoir le document", "Review the document")}
            <ChevronDown size={14} className={`ml-auto text-soft transition-transform ${moBai ? "rotate-180" : ""}`} />
          </button>
          {moBai && (
            <div className="mt-2 rounded-xl border border-solid border-line bg-surface p-4">
              {b.image_url && <img src={b.image_url} alt="" className="mb-3 block max-w-full" />}
              {b.reading_text && <div lang="fr" className="text-sm leading-relaxed text-ink [&_p]:m-0 [&_p+p]:mt-2" dangerouslySetInnerHTML={{ __html: b.reading_text }} />}
            </div>
          )}
        </div>
      )}
      {ds.length ? (
        <ol className="m-0 grid list-none gap-3 p-0">{ds.map(({ q, i }) => <TheCau key={q.id} q={q} i={i} />)}</ol>
      ) : (
        <p className="m-0 rounded-xl bg-ok-soft px-3 py-2 text-xs font-bold text-ok">{tr("Bài này không có câu sai.", "Aucune erreur dans cet exercice.", "No mistakes in this exercise.")}</p>
      )}
    </section>
  );
}

/* `duLieu`: chỉ để /preview.html dựng màn này bằng dữ liệu giả, không gọi máy chủ. */
export default function XemLaiBaiThi({ attemptIds, tieuDe = "", onDong, duLieu = null }) {
  const [bai, setBai] = useState(duLieu);
  const [loi, setLoi] = useState("");
  const [chiSai, setChiSai] = useState(false);
  const khoa = useMemo(() => (attemptIds ?? []).join(","), [attemptIds]);
  useEffect(() => {
    if (duLieu) return undefined;
    let huy = false;
    docBaiThi(attemptIds).then((r) => { if (huy) return; if (r.ok) setBai(r.bai); else setLoi(r.thongBao); });
    return () => { huy = true; };
  }, [khoa]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const thoat = (e) => { if (e.key === "Escape") onDong?.(); };
    window.addEventListener("keydown", thoat);
    return () => window.removeEventListener("keydown", thoat);
  }, [onDong]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={tr("Xem lại bài thi", "Revoir ma copie", "Review my paper")} className="mcf-scroll fixed inset-0 z-[320] overflow-y-auto bg-bg">
      <div className="sticky top-0 z-10 border-0 border-b border-solid border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-lg font-extrabold text-ink">{tr("Xem lại bài thi", "Revoir ma copie", "Review my paper")}</h2>
            {tieuDe && <p className="m-0 truncate text-xs text-soft">{tieuDe}</p>}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-ink">
            <input type="checkbox" checked={chiSai} onChange={(e) => setChiSai(e.target.checked)} className="h-4 w-4 accent-primary" />
            {tr("Chỉ xem câu sai và bỏ trống", "Seulement les erreurs", "Mistakes only")}
          </label>
          <button type="button" onClick={onDong} aria-label={tr("Đóng", "Fermer", "Close")}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-ink hover:bg-primary-soft"><X size={18} /></button>
        </div>
      </div>
      <div className="mx-auto grid max-w-3xl gap-8 px-4 py-6">
        {loi && <p className="m-0 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger">{loi}</p>}
        {!bai && !loi && <p className="m-0 flex items-center gap-2 text-sm text-soft"><Loader2 size={16} className="animate-spin text-primary" /> {tr("Đang mở bài thi…", "Chargement de la copie…", "Loading the paper…")}</p>}
        {bai && !bai.length && <p className="m-0 text-sm text-soft">{tr("Không có phần trắc nghiệm nào để xem lại (Viết và Nói xem ở phiếu chấm).", "Aucune épreuve à revoir (écrit et oral : voir la fiche d'évaluation).", "Nothing to review (writing and speaking have their own feedback).")}</p>}
        {bai?.map((b) => <KhoiBai key={b.attempt_id} b={b} chiSai={chiSai} />)}
      </div>
    </div>,
    document.body,
  );
}
