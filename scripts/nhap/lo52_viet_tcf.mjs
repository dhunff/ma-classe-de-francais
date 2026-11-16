/* Lô 52 (16/11/2026): MÁY DỰNG bài Viết TCF cho cây Luyện thi TCF. Nội dung: lo52_viet_tcf_noi_dung.mjs.
 *
 * Bài PE-1..3: đề (+ hai tài liệu của tâche 3) ở readingText, vài câu QCM phân tích đề, rồi MỘT câu `open`
 * mang payload.tache (1, 2, 3) và payload.taiLieu (đề đầy đủ, để cham-tcf đọc; giao diện không hiện).
 * Bài PE-4: ba câu `open`, đề của từng tâche ở payload.doc (hiện dưới câu hỏi), time_limit 60.
 * Nộp xong, màn luyện gọi cham-tcf chế độ luyenTap (tiêu chí TCF của FEI, mức CECRL từng tâche, điểm /20)
 * và hiện bài mẫu (`model` nằm ở answer_key, đọc qua get_model_answer).
 *
 *   1. Kiểm: mã kỹ năng có trong cây, bài mẫu đúng khoảng số từ của tâche, tâche 3 có đủ hai tài liệu,
 *      không dấu gạch dài, QCM đủ phương án, đoạn trích « » có trong đề/tài liệu/phương án, không bài nào
 *      dồn đáp án một vị trí, tỉ lệ đáp án đúng là phương án dài nhất ≤ 40 %.
 *   2. Ghi supabase/migrations/216_luyen_viet_tcf.sql. Chạy lại an toàn (on conflict do nothing).
 *
 * Chạy: node scripts/nhap/lo52_viet_tcf.mjs   (--kho: chỉ kiểm) */
import { writeFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG_TCF } from "../../src/content/luyenTap/kyNangTCF.js";
import { demTu, GIOI_HAN_TU } from "../../supabase/functions/_shared/chamTcf.js";
import { BAI } from "./lo52_viet_tcf_noi_dung.mjs";

const CHI_KIEM = process.argv.includes("--kho");
let hat = Number(process.env.HAT || 20261119);
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const p = (ds) => ds.map((x) => `<p>${x}</p>`).join("");
const deHtml = (sujet, docs = []) => p([`<strong>Sujet</strong> : ${sujet}`, ...docs]);
const tron = (dung, sai) => {
  const o = [dung, ...sai].map((x, i) => ({ x, dung: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { options: o.map((y) => y.x), answer: o.findIndex((y) => y.dung) };
};
const khoang = (t) => `(${GIOI_HAN_TU[t - 1][0]} à ${GIOI_HAN_TU[t - 1][1]} mots)`;

/* ── Dựng câu hỏi ── */
for (const b of BAI) {
  if (b.taches) {
    b.cau = b.taches.map((t) => ({ type: "open", prompt: `Tâche ${t.tache} : écrivez votre texte ${khoang(t.tache)}.`, doc: deHtml(t.sujet, t.docs), tache: t.tache, model: t.model }));
    b.docLon = "";
  } else {
    b.docLon = deHtml(b.sujet, b.docs);
    b.cau = [
      ...b.qcm.map(([prompt, dung, sai, explanation]) => ({ type: "qcm", prompt, ...tron(dung, sai), explanation })),
      { type: "open", prompt: `Écrivez votre texte en suivant le sujet ci-dessus ${khoang(b.tache)}.`, taiLieu: b.docLon, tache: b.tache, model: b.model },
    ];
  }
}

/* ── 1. Kiểm ── */
const chuan = (s) => s.replace(/<[^>]+>/g, " ").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const CAY = Object.values(KY_NANG_TCF.TCF).flat();
const loi = [];
const ten = new Set();
let dai = 0, tong = 0;
for (const b of BAI) {
  if (!CAY.some((k) => k.ma === b.ma)) loi.push(`${b.tieuDe}: mã ${b.ma} không có trong cây`);
  if (ten.has(b.tieuDe)) loi.push("Trùng: " + b.tieuDe);
  ten.add(b.tieuDe);
  if (JSON.stringify(b).includes("—")) loi.push("Dấu gạch dài: " + b.tieuDe);
  if (!b.tu?.length || !b.meo?.length) loi.push(`${b.tieuDe}: thiếu từ vựng hoặc mẹo`);
  for (const c of b.cau.filter((x) => x.type === "open")) {
    const [tu, den] = GIOI_HAN_TU[c.tache - 1];
    const so = demTu(c.model);
    if (so < tu || so > den) loi.push(`${b.tieuDe} tâche ${c.tache}: bài mẫu ${so} từ, cần ${tu} à ${den}`);
    if (c.tache === 3 && ((c.taiLieu ?? c.doc).match(/Document \d/g) || []).length !== 2) loi.push(`${b.tieuDe}: tâche 3 thiếu tài liệu`);
  }
  const qs = b.cau.filter((x) => x.type === "qcm");
  for (const [i, c] of qs.entries()) {
    tong++;
    if (c.options.length < 3 || new Set(c.options).size !== c.options.length) loi.push(`${b.tieuDe} câu ${i + 1}: phương án hỏng`);
    if (c.options[c.answer].length === Math.max(...c.options.map((x) => x.length))) dai++;
    const van = chuan(b.docLon + " " + c.prompt + " " + c.options.join(" "));
    for (const m of c.explanation.matchAll(/«\s*([^»]+?)\s*»/g)) {
      for (const manh of m[1].split("…").map((x) => x.trim()).filter((x) => x.length >= 4)) if (!van.includes(chuan(manh))) loi.push(`${b.tieuDe} câu ${i + 1}: « ${manh} » không có trong đề`);
    }
  }
  const da = qs.map((c) => c.answer);
  if (da.length >= 3 && new Set(da).size === 1) loi.push(`${b.tieuDe}: mọi đáp án cùng vị trí`);
}
if (dai / tong > 0.4) loi.push(`Đáp án đúng dài nhất ở ${Math.round((dai / tong) * 100)} % câu (ngưỡng 40 %)`);
if (loi.length) { console.error("LỖI:\n" + loi.join("\n")); process.exit(1); }
const soOpen = BAI.reduce((n, b) => n + b.cau.filter((c) => c.type === "open").length, 0);
console.error(`Kiểm xong: ${BAI.length} bài, ${tong} câu QCM + ${soOpen} bài viết; đáp án đúng dài nhất ở ${Math.round((dai / tong) * 100)} % câu.`);
for (const b of BAI) for (const c of b.cau.filter((x) => x.type === "open")) console.error(`  ${b.ma} tâche ${c.tache}: bài mẫu ${demTu(c.model)} từ`);
if (CHI_KIEM) process.exit(0);

/* ── 2. SQL ── */
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const DE = "<p><strong>Comme au TCF :</strong> lisez le sujet, répondez aux questions de préparation, puis écrivez votre texte en respectant le nombre de mots. Après l'envoi, l'IA évalue votre texte selon les critères du TCF et vous montre une copie modèle.</p>";
const DE4 = "<p><strong>Comme au TCF :</strong> écrivez les trois tâches en 60 minutes. Conseil : environ 15 minutes pour la tâche 1, 20 pour la tâche 2, 25 pour la tâche 3.</p>";
const moc = Date.UTC(2026, 10, 16, 12);
const daGap = {};
const ra = [];
let mien = 0;
for (const [i, b] of BAI.entries()) {
  const kn = CAY.find((k) => k.ma === b.ma);
  daGap[b.ma] = (daGap[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + daGap[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  if (mienPhi) mien++;
  const exId = `lo52tcfpe${String(i + 1).padStart(2, "0")}`;
  const ex = {
    id: exId, title: b.tieuDe, level: "TCF", skills: ["Écriture"], consigne: b.taches ? DE4 : DE, audioUrl: "", imageUrl: "",
    readingText: b.docLon || "",
    ...(b.phut ? { timeLimit: b.phut } : {}),
    questions: b.cau.map((c, k) => ({ ...c, id: `${exId}q${String(k + 1).padStart(2, "0")}` })),
    usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: moc + i * 1000,
    vocabulaire: b.tu.map((x) => "• " + x).join("\n"), explications: b.meo.map((x) => "• " + x).join("\n"),
    kyNang: b.ma, vong: b.vong, thuTu,
    ...(mienPhi ? {} : { isPremium: true, price: 19000 }),
  };
  const { exRow, qRows } = toRows(ex, "practice");
  exRow.store = "practice";
  for (const r of qRows) {
    if ("answer" in r.payload || "model" in r.payload) throw new Error("Đáp án hoặc bài mẫu lọt vào payload: " + r.id);
    if (r.type === "open" && !r.payload.tache) throw new Error("Câu viết thiếu tache: " + r.id);
    if (r.type === "open" && !r.answer_key?.model) throw new Error("Bài mẫu không vào answer_key: " + r.id);
  }
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `  (${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(",\n");
  ra.push(`-- ${b.ma} #${thuTu} ${b.tieuDe} (${mienPhi ? "miễn phí" : "VIP"})\nwith e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) on conflict (id) do nothing returning id)\ninsert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation)\nselect v.* from e, (values\n${dong}\n) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}
const dau = `-- 216 (16/11/2026, lô 52): ${BAI.length} bài Viết TCF cho cây Luyện thi TCF, ${mien} miễn phí, ${BAI.length - mien} VIP.\n-- Sinh bởi scripts/nhap/lo52_viet_tcf.mjs. Câu viết mang payload.tache; AI chấm bằng cham-tcf (luyenTap). Chạy lại an toàn.\n`;
writeFileSync("supabase/migrations/216_luyen_viet_tcf.sql", dau + ra.join("\n\n") + "\n");
console.error(`Đã ghi supabase/migrations/216_luyen_viet_tcf.sql: ${BAI.length} bài, ${mien} miễn phí.`);
