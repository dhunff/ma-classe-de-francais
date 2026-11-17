import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Minus, Sparkles, Loader2, Headphones, Lightbulb, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { docBaiThi } from "../../shared/xemLaiThi.js";
import LoiNgheBai from "../practice/LoiNgheBai.jsx";
import { BangOuiNon } from "./ToDe.jsx";

/* « Xem lại bài thi » (14/11, chủ dự án): sau khi thi (DELF, DALF, TCF) xem lại từng câu: mình chọn gì,
 * đúng hay sai, đáp án đúng, VÌ SAO (lời giải CỐ ĐỊNH của đề). 14/11 (chủ dự án): trắc nghiệm, điền từ KHÔNG
 * dùng AI; AI chỉ cho phần phải tự viết/nói (câu court có nhận xét AI từ grade).
 * Dữ liệu: rpc xem_lai_bai_thi (migration 207), chỉ lượt đã nộp của chính mình. Viết/Nói có phiếu
 * chấm riêng nên không có ở đây. KHÔNG hiện số câu đúng/sai (quy tắc: không tự thêm số đếm).
 * 17/11 (chủ dự án): trình bày như TỜ ĐỀ của màn thi (de-ban, de-giay), mỗi bài một trang, có tài liệu đọc,
 * audio nghe lại, lời nghe (VIP), và chỗ chứa đáp án tô xanh ngay trong tài liệu. */

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
    /* 17/11: cùng cách trình bày với màn thi (ToDe.jsx), ô đúng tô xanh, ô chọn sai tô đỏ. */
    return <BangOuiNon colonnes={p.colonnes ?? []} criteres={p.criteres ?? []} value={q.raw ?? {}} xemLai={{ dapAn: k.answers ?? {} }} />;
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

/* ══ CHỖ CHỨA ĐÁP ÁN (17/11, chủ dự án: « học sinh cần xem đề bài để biết đáp án nằm ở đâu ») ══
 * Lời giải của đề trích NGUYÊN VĂN tài liệu trong « » (máy dựng lô 20 đến 55 kiểm điều đó), câu Vrai/Faux
 * có câu trích ở answer_key.justification. Dò lại các đoạn trích ấy trong tài liệu rồi tô xanh kèm số câu.
 * Đoạn có « … » ở giữa là hai mảnh; mảnh dưới 6 ký tự bỏ qua để không tô nhầm chữ ngắn lặp lại. */
const kyChuan = (c) => (c === "’" ? "'" : c === " " ? " " : c.toLowerCase());
function manhCau(q) {
  const nguon = [q.explanation || ""];
  if (q.type === "vf" && q.answer_key?.justification) nguon.push(`« ${String(q.answer_key.justification).replace(/[«»]/g, "")} »`);
  const ra = [];
  for (const chu of nguon) for (const m of chu.matchAll(/«\s*([^»]+?)\s*»/g)) for (const manh of m[1].split("…")) {
    const x = manh.trim().replace(/^[.,;:!?"“”]+|[.,;:!?"“”]+$/g, "").trim();
    if (x.length >= 6) ra.push(x);
  }
  return ra;
}

/* Bọc các mảnh tìm thấy bằng <mark class="de-dap" data-cau="…">, kể cả khi mảnh vắt qua <strong>, <em>.
   Bọc từ CUỐI lên: tách một nút chữ chỉ cắt phần sau, nên vị trí của các vùng phía trước vẫn đúng.
   Trả về tập số câu có chỗ trong tài liệu này. */
function toChoDapAn(goc, ds) {
  const map = [];
  let full = "";
  const w = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const t = n.nodeValue;
    for (let i = 0; i < t.length; i++) { full += kyChuan(t[i]); map.push([n, i]); }
  }
  const vung = [], co = new Set();
  for (const { x, so } of ds) {
    const k = [...x].map(kyChuan).join("");
    const i = full.indexOf(k);
    if (i >= 0) { vung.push([i, i + k.length, so]); co.add(so); }
  }
  vung.sort((a, b) => a[0] - b[0]);
  const gop = [];
  for (const [a, b, so] of vung) {
    const cuoi = gop[gop.length - 1];
    if (cuoi && a <= cuoi.b) { cuoi.b = Math.max(cuoi.b, b); if (!cuoi.so.includes(so)) cuoi.so.push(so); }
    else gop.push({ a, b, so: [so] });
  }
  for (const g of gop.reverse()) {
    const doan = [];
    for (let i = g.a; i < g.b; i++) {
      const [n, o] = map[i], cuoi = doan[doan.length - 1];
      if (cuoi && cuoi[0] === n && cuoi[2] === o) cuoi[2] = o + 1; else doan.push([n, o, o + 1]);
    }
    const nhan = g.so.sort((x, y) => x - y).join(",");
    doan.reverse().forEach(([n, a, b], k) => {
      let t = n;
      if (a > 0) t = t.splitText(a);
      if (b - a < t.nodeValue.length) t.splitText(b - a);
      const m = document.createElement("mark");
      m.className = "de-dap"; m.dataset.cau = nhan; m.title = tr(`Chỗ chứa đáp án câu ${nhan}`, `Réponse à la question ${nhan}`, `Answer to question ${nhan}`);
      t.parentNode.insertBefore(m, t); m.appendChild(t);
      if (k === 0) { const sup = document.createElement("sup"); sup.textContent = nhan; m.appendChild(sup); }
    });
  }
  return co;
}

/* Tài liệu có tô chỗ đáp án. Nội dung đặt bằng innerHTML trong effect (React không quản con của div này),
   nên việc bọc <mark> không bị React ghi đè. Bấm vào chỗ tô thì nhảy tới câu đó. */
function VanBanDapAn({ html, ds, className, onCo, onBamCau }) {
  const ref = useRef(null);
  const khoaDs = JSON.stringify(ds);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html || "";
    onCo?.(toChoDapAn(el, ds));
  }, [html, khoaDs]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={ref} lang="fr" className={className}
      onClick={(e) => { const m = e.target.closest?.("mark.de-dap"); if (m) onBamCau?.(Number(m.dataset.cau.split(",")[0])); }} />
  );
}

/* Ô đánh dấu như tờ đề: ✕ ở phương án đã chọn. */
const O = ({ chon }) => <span aria-hidden className="de-o inline-grid h-[18px] w-[18px] shrink-0 place-items-center text-[15px] font-bold leading-none">{chon ? "✕" : ""}</span>;

function CauXemLai({ q, i, exId, coCho, onChiCho, laCO }) {
  const p = q.payload ?? {}, k = q.answer_key ?? {};
  const tt = trangThai(q);
  const loiGiai = q.type === "vf" ? "" : q.explanation;
  const so = i + 1;
  return (
    <li id={`xl-${exId}-${so}`} className="flex scroll-mt-28 gap-3">
      <span className="de-tron mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[12px] font-bold">{so}</span>
      <div className="min-w-0 flex-1">
        {p.audio && (
          <audio controls preload="none" src={p.audio} className="mb-3 block w-full max-w-md">
            <track kind="captions" />
          </audio>
        )}
        {p.anh && <img src={p.anh} alt={tr("Hình của câu hỏi", "Image de la question", "Question picture")} loading="lazy" className="mb-3 block max-h-64 max-w-full border border-solid border-[#111] bg-white object-contain p-2" />}
        {p.doc && (
          <VanBanDapAn html={p.doc} ds={manhCau(q).map((x) => ({ x, so }))} onCo={(c) => c.size && onChiCho(so, true)}
            className="de-van mb-3 p-4 text-[15px] leading-[1.45] [&_p]:m-0 [&_p+p]:mt-2" />
        )}
        <div className="flex items-start gap-3">
          <div lang="fr" className="m-0 min-w-0 flex-1 whitespace-pre-line">{q.prompt}</div>
          <Nhan tt={tt} />
        </div>

        {q.type === "qcm" ? (
          <div className="mt-2 grid gap-1">
            {(p.options ?? []).map((o, j) => {
              const dung = k.answer === j, chon = q.raw === j;
              return (
                <div key={j} className={`flex items-center gap-2.5 rounded px-1.5 py-1 text-[15.5px] ${dung ? "bg-ok-soft" : chon ? "bg-danger-soft" : ""}`}>
                  <strong className="w-3 shrink-0">{CHU[j]}</strong><O chon={chon} />
                  <span lang="fr" className="min-w-0 flex-1">{String(o ?? "").trim() || <em className="text-[#666]">{tr("(phương án đọc trong audio)", "(proposition entendue)", "(heard in the audio)")}</em>}</span>
                  {dung && <span className="shrink-0 text-[11.5px] font-extrabold text-ok">✓ {tr("Đáp án đúng", "Bonne réponse", "Correct answer")}</span>}
                  {chon && !dung && <span className="shrink-0 text-[11.5px] font-extrabold text-danger">{tr("Bạn chọn", "Votre choix", "Your choice")}</span>}
                </div>
              );
            })}
          </div>
        ) : <NoiDungCau q={q} />}

        {(loiGiai || tt === "sai" || tt === "trong") && q.type !== "court" && (
          <div className="mt-3 flex items-start gap-2 border-0 border-l-[3px] border-solid border-[#b45309] bg-[#fdf6e9] px-3 py-2 text-[13.5px] leading-relaxed text-[#111]">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-[#b45309]" />
            <div className="grid min-w-0 flex-1 gap-1">
              {dongSai(q, tt) && <span className="font-bold">{dongSai(q, tt)}</span>}
              {loiGiai
                ? <span><strong>{tr("Vì sao:", "Pourquoi :", "Why:")}</strong> {loiGiai}</span>
                : q.type !== "vf" && <span className="text-[#555]">{tr("Câu này chưa có lời giải chi tiết.", "Pas encore d'explication détaillée.", "No detailed explanation yet.")}</span>}
            </div>
          </div>
        )}
        {coCho && (
          <button type="button" onClick={() => onChiCho(so)}
            className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded border border-solid border-[#166534] bg-white px-2.5 py-1 text-[12.5px] font-bold text-[#166534] hover:bg-[#f0fdf4]">
            <MapPin size={13} /> {tr("Chỉ chỗ đáp án trong bài", "Voir la réponse dans le texte", "Show it in the text")}
          </button>
        )}
        {laCO && !p.audio && manhCau(q).length > 0 && (
          <p className="m-0 mt-2 text-[12.5px] italic text-[#555]">{tr(`Chỗ chứa đáp án được tô xanh, số ${so}, trong lời nghe ở đầu bài.`, `La réponse est surlignée (n° ${so}) dans la transcription.`, `The answer is highlighted (no. ${so}) in the transcript.`)}</p>
        )}
        {p.audio && k.model && (
          <details className="mt-2 text-[13px]">
            <summary className="cursor-pointer font-bold"><Headphones size={12} className="mr-1 inline" />{tr("Lời chép audio", "Transcription", "Transcript")}</summary>
            <p lang="fr" className="m-0 mt-1 whitespace-pre-line leading-relaxed">{k.model}</p>
          </details>
        )}
      </div>
    </li>
  );
}

const TEN_PHAN_DE = { CO: "Compréhension de l'oral", CE: "Compréhension des écrits", MS: "Maîtrise des structures de la langue" };
const TEN_NGAN = () => ({ CO: tr("Nghe", "Oral", "Listening"), CE: tr("Đọc", "Écrit", "Reading"), MS: tr("Cấu trúc", "Structures", "Structures") });

/* Một bài = một trang giấy như màn thi: đầu trang, ô số phần, « ▶ EXERCICE », consigne, audio nghe lại,
   tài liệu (tô chỗ đáp án), rồi các câu đã chấm. */
function TrangBai({ b, soPhan, dauPhan, soBai, chiSai, trang, tongTrang, tieuDe }) {
  const [coCho, setCoCho] = useState(() => new Set());
  const laCO = b.code === "CO";
  const qs = b.questions ?? [];
  const dsManh = useMemo(() => qs.flatMap((q, i) => manhCau(q).map((x) => ({ x, so: i + 1 }))), [b.attempt_id]); // eslint-disable-line react-hooks/exhaustive-deps
  const ghiCo = (so, co) => setCoCho((s) => (co && !s.has(so) ? new Set([...s, so]) : s));
  const chiCho = (so, chiGhi) => {
    if (chiGhi === true) { ghiCo(so, true); return; }
    const ms = [...document.querySelectorAll(`[data-trang="${b.attempt_id}"] mark.de-dap[data-cau]`)].filter((m) => m.dataset.cau.split(",").includes(String(so)));
    if (!ms.length) return;
    ms[0].scrollIntoView({ behavior: "smooth", block: "center" });
    ms.forEach((m) => m.classList.add("de-dap-nhay"));
    setTimeout(() => ms.forEach((m) => m.classList.remove("de-dap-nhay")), 1800);
  };
  const toiCau = (so) => document.getElementById(`xl-${b.attempt_id}-${so}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const ds = qs.map((q, i) => ({ q, i })).filter(({ q }) => !chiSai || ["sai", "trong", "mot_phan"].includes(trangThai(q)));
  const nghe = b.audio_luyen || b.audio_url;

  return (
    <article data-trang={b.attempt_id} className="de-giay mx-auto max-w-[840px]">
      <div className="de-dau-trang px-6 pb-3 pt-6 text-center text-[13px] uppercase sm:pt-8">Corrigé – document réservé au candidat</div>
      <div className="px-5 pb-8 pt-6 sm:px-14">
        {dauPhan && (
          <div className="mb-7 flex items-center gap-4">
            <span className="de-so-phan grid h-14 w-14 shrink-0 place-items-center text-[34px] font-bold">{soPhan}</span>
            <h1 className="m-0 flex-1 text-[28px] font-extrabold leading-tight text-[#111] sm:text-[36px]">{TEN_PHAN_DE[b.code] ?? b.title}</h1>
          </div>
        )}
        <div className="mb-1 flex items-start gap-3">
          <span aria-hidden className="mt-1 text-[22px] leading-none">▶</span>
          <h2 className="m-0 flex-1 text-[24px] font-extrabold uppercase leading-none text-[#111]">Exercice {soBai}</h2>
        </div>
        <p className="m-0 mb-4 text-[12.5px] italic text-[#555] sm:ml-9">{b.title}</p>
        {b.consigne && (
          <div className="mb-5 text-[15px] font-bold leading-snug text-[#111] sm:ml-9 [&_em]:font-normal [&_p]:m-0 [&_p+p]:mt-2" dangerouslySetInnerHTML={{ __html: b.consigne }} />
        )}

        {nghe && (
          <div className="mb-6 sm:ml-9">
            <p className="m-0 mb-1.5 flex items-center gap-1.5 text-[13px] font-bold"><Headphones size={14} /> {tr("Nghe lại tài liệu (không giới hạn số lần)", "Réécouter le document (sans limite)", "Listen again (no limit)")}</p>
            <audio controls preload="none" src={nghe} className="block w-full max-w-lg"><track kind="captions" /></audio>
          </div>
        )}
        {laCO && (
          <div className="mb-6">
            <LoiNgheBai exId={b.exercise_id} cau={qs.map((q) => ({ explanation: [q.explanation, q.type === "vf" && q.answer_key?.justification ? `« ${String(q.answer_key.justification).replace(/[«»]/g, "")} »` : ""].filter(Boolean).join(" ") }))} />
          </div>
        )}
        {b.image_url && !laCO && <img src={b.image_url} alt={tr("Tài liệu của bài", "Document de l'exercice", "Exercise document")} loading="lazy" className="mx-auto mb-6 block w-full border border-solid border-[#111] object-contain" />}
        {b.reading_text && (
          <>
            {coCho.size > 0 && (
              <p className="m-0 mb-2 text-[13px] text-[#333]">
                <mark className="de-dap">{tr("Chỗ tô xanh", "En vert", "Green")}<sup>3</sup></mark> {tr("là nơi chứa đáp án, số nhỏ là số câu. Bấm vào để tới câu đó.", ": là où se trouve la réponse, avec le numéro de la question. Cliquez pour y aller.", ": where the answer is, with the question number. Click to jump to it.")}
              </p>
            )}
            <div className="de-van mb-8 p-5 text-[15px] leading-[1.45] sm:p-7">
              <VanBanDapAn html={b.reading_text} ds={dsManh} onCo={(c) => setCoCho(new Set(c))} onBamCau={toiCau}
                className="de-van-cot [&_strong:first-child]:block [&_p:first-child]:mb-4 [&_p:first-child]:text-center [&_p:first-child]:text-[20px] [&_p:first-child]:font-bold [&_p:first-child]:[column-span:all]" />
            </div>
          </>
        )}

        {ds.length ? (
          <ol className="m-0 list-none space-y-7 p-0 text-[15.5px] leading-snug text-[#111]">
            {ds.map(({ q, i }) => (
              <React.Fragment key={q.id}>
                {q.payload?.nhom && q.payload.nhom !== qs[i - 1]?.payload?.nhom && <li className="text-[20px] font-extrabold uppercase tracking-wide">{q.payload.nhom}</li>}
                <CauXemLai q={q} i={i} exId={b.attempt_id} coCho={coCho.has(i + 1)} onChiCho={chiCho} laCO={laCO} />
              </React.Fragment>
            ))}
          </ol>
        ) : (
          <p className="m-0 border border-solid border-[#166534] bg-[#f0fdf4] px-3 py-2 text-[14px] font-bold text-[#166534]">{tr("Bài này không có câu sai.", "Aucune erreur dans cet exercice.", "No mistakes in this exercise.")}</p>
        )}
      </div>
      <div className="de-chan-trang mx-5 flex items-center justify-between gap-3 py-3 text-[12px] sm:mx-14">
        <strong>FRACILE</strong>
        <span className="truncate">{tieuDe}</span>
        <span className="shrink-0 tabular-nums">Page {trang} sur {tongTrang}</span>
      </div>
    </article>
  );
}

/* `duLieu`: chỉ để /preview.html dựng màn này bằng dữ liệu giả, không gọi máy chủ. */
export default function XemLaiBaiThi({ attemptIds, tieuDe = "", onDong, duLieu = null }) {
  const [bai, setBai] = useState(duLieu);
  const [loi, setLoi] = useState("");
  const [chiSai, setChiSai] = useState(false);
  const [idx, setIdx] = useState(0);
  const khung = useRef(null);
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

  /* Số phần như tờ đề (DELF, TCF Canada: CO 1, CE 2; TCF tout public: CO 1, MS 2, CE 3), số bài trong phần. */
  const ds = useMemo(() => {
    const coMS = (bai ?? []).some((b) => b.code === "MS"), dem = {};
    const SO = { CO: 1, MS: 2, CE: coMS ? 3 : 2 };
    return (bai ?? []).map((b) => {
      dem[b.code] = (dem[b.code] ?? 0) + 1;
      return { b, soPhan: SO[b.code] ?? 1, soBai: dem[b.code], dauPhan: dem[b.code] === 1 };
    });
  }, [bai]);
  const chon = Math.min(idx, Math.max(0, ds.length - 1));
  const sang = (k) => { setIdx(k); khung.current?.scrollTo({ top: 0 }); };
  const hien = ds[chon];

  return createPortal(
    <div ref={khung} role="dialog" aria-modal="true" aria-label={tr("Xem lại bài thi", "Revoir ma copie", "Review my paper")} className="de-ban mcf-scroll fixed inset-0 z-[320] overflow-y-auto">
      <div className="sticky top-0 z-10 border-0 border-b border-solid border-[#bbb] bg-white/95 backdrop-blur" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>
        <div className="mx-auto flex max-w-[840px] flex-wrap items-center gap-3 px-4 py-2.5 text-[#111]">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#555]">{tr("Xem lại bài thi", "Revoir ma copie", "Review my paper")}</div>
            <div className="truncate text-[15px] font-bold">{tieuDe || " "}</div>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-bold">
            <input type="checkbox" checked={chiSai} onChange={(e) => setChiSai(e.target.checked)} className="h-4 w-4 accent-[#111]" />
            {tr("Chỉ xem câu sai và bỏ trống", "Seulement les erreurs", "Mistakes only")}
          </label>
          <button type="button" onClick={onDong}
            className="h-9 shrink-0 cursor-pointer rounded-md border border-solid border-[#999] bg-white px-4 text-xs font-bold text-[#333] hover:border-[#111]">
            {tr("Đóng", "Fermer", "Close")}
          </button>
        </div>
      </div>

      <div className="px-2 pb-12 pt-5 sm:px-6">
        {loi && <p className="mx-auto m-0 max-w-[840px] bg-white p-4 text-sm font-semibold text-danger">{loi}</p>}
        {!bai && !loi && <p className="mx-auto m-0 flex max-w-[840px] items-center gap-2 text-sm text-[#333]"><Loader2 size={16} className="animate-spin" /> {tr("Đang mở bài thi…", "Chargement de la copie…", "Loading the paper…")}</p>}
        {bai && !bai.length && <p className="mx-auto m-0 max-w-[840px] bg-white p-4 text-sm text-[#333]">{tr("Không có phần trắc nghiệm nào để xem lại (Viết và Nói xem ở phiếu chấm).", "Aucune épreuve à revoir (écrit et oral : voir la fiche d'évaluation).", "Nothing to review (writing and speaking have their own feedback).")}</p>}

        {ds.length > 1 && (
          <nav aria-label={tr("Các bài của bài thi", "Exercices de la copie", "Exercises")} className="mx-auto flex max-w-[840px] flex-wrap gap-1 px-2" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>
            {ds.map((x, j) => (
              <button key={x.b.attempt_id} type="button" onClick={() => sang(j)} aria-current={j === chon ? "step" : undefined}
                className={`cursor-pointer rounded-t-md border border-b-0 border-solid px-4 py-2 text-sm font-bold uppercase ${j === chon ? "border-[#111] bg-white text-[#111]" : "border-[#aaa] bg-[#ececec] text-[#555] hover:bg-white"}`}>
                {TEN_NGAN()[x.b.code] ?? x.b.code} · {tr("Bài", "Exercice", "Exercise")} {x.soBai}
              </button>
            ))}
          </nav>
        )}
        {hien && (
          <TrangBai key={hien.b.attempt_id} b={hien.b} soPhan={hien.soPhan} dauPhan={hien.dauPhan} soBai={hien.soBai}
            chiSai={chiSai} trang={chon + 1} tongTrang={ds.length} tieuDe={tieuDe} />
        )}
        {ds.length > 1 && (
          <div className="mx-auto mt-6 flex max-w-[840px] items-center gap-2" style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>
            <button type="button" disabled={chon === 0} onClick={() => sang(chon - 1)}
              className="inline-flex h-10 cursor-pointer items-center gap-1 rounded-none border-[1.5px] border-solid border-[#111] bg-white px-4 text-[13px] font-bold uppercase tracking-wide text-[#111] hover:bg-[#f2f2f2] disabled:invisible"><ChevronLeft size={15} /> {tr("Bài trước", "Précédent", "Previous")}</button>
            <span className="flex-1 text-center text-[13px] italic text-[#444]">{chon + 1} / {ds.length}</span>
            <button type="button" disabled={chon === ds.length - 1} onClick={() => sang(chon + 1)}
              className="inline-flex h-10 cursor-pointer items-center gap-1 rounded-none border-[1.5px] border-solid border-[#111] bg-[#111] px-4 text-[13px] font-bold uppercase tracking-wide text-white hover:bg-[#333] disabled:invisible">{tr("Bài sau", "Suivant", "Next")} <ChevronRight size={15} /></button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
