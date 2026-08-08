/* Hàm thuần về câu hỏi: chấm tự động, đếm câu chưa trả lời, tiện ích chuỗi. */

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const norm = (s) => (s || "").trim().toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")   // bỏ toàn bộ dấu tiếng Pháp (é→e, à→a…)
  .replace(/\s+/g, " ").replace(/[’]/g, "'");
const stripHtml = (h) => (h || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
const wordCount = (h) => { const t = stripHtml(h); return t ? t.split(" ").length : 0; };

const vfOk = (q, ans) => ans != null && ans.choice === q.answer;
const fillAccepted = (q) => q.accepted ?? q.answer ?? "";  // tương thích bài import cũ dùng "answer"
const fillOk = (q, ans) => String(fillAccepted(q)).split("|").map(norm).filter(Boolean).includes(norm(ans));
const autoQ = (q) => q.type === "qcm" || q.type === "fill" || q.type === "conj" || q.type === "vf" || q.type === "tableau" || q.type === "ordre";
const ordreOk = (q, ans) => Array.isArray(ans) && ans.length === (q.elements || []).length && ans.every((id, i) => q.elements[i] && q.elements[i].id === id);
const seedShuffle = (arr, seedStr) => {
  let sd = 0; for (const c of String(seedStr)) sd = (sd * 31 + c.charCodeAt(0)) >>> 0; sd = sd || 1;
  const rnd = () => ((sd = (sd * 1103515245 + 12345) >>> 0) / 4294967296);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const tableauCells = (q) => (q.criteres || []).flatMap((cr) => (q.colonnes || []).map((co) => `${cr.id}_${co.id}`));
const tableauOk = (q, ans) => { const cells = tableauCells(q); return cells.length > 0 && cells.every((k) => ans && ans[k] === q.answers?.[k]); };

const isQuestionAnswered = (q, answers) => {
  const a = answers ? answers[q.id] : undefined;
  switch (q.type) {
    case "qcm": return a != null;
    case "tableau": {
      // répondu seulement si CHAQUE ligne × colonne est cochée
      const cells = tableauCells(q);
      return cells.length > 0 && cells.every((k) => a && a[k]);
    }
    case "ordre": return Array.isArray(a) && a.length === (q.elements || []).length && a.length > 0;
    case "vf": return a?.choice != null && (a.choice === 2 || String(a.just || "").trim() !== "");
    case "open": return stripHtml(a) !== "";
    default: return String(a || "").trim() !== "";   // fill / conj
  }
};
const getUnansweredQuestionsCount = (answers, questions) =>
  (Array.isArray(questions) ? questions : []).filter((q) => !isQuestionAnswered(q, answers)).length;

export { uid, norm, stripHtml, wordCount, vfOk, fillAccepted, fillOk, autoQ, ordreOk, seedShuffle, tableauCells, tableauOk, isQuestionAnswered, getUnansweredQuestionsCount };
