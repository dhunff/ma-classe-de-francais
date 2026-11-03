/* Lô 36 (04/11/2026): 23 bài ĐỌC B1 cho cây Luyện tập theo trình độ. Khuôn lo32_doc_a2.mjs.
 *
 * Bài gắn cây bằng meta.kyNang + meta.thuTu + meta.vong; thuTu tính tiếp sau bài đã có trong `kn.bai`.
 * Bài trong `mienPhi` miễn phí, còn lại VIP 19.000 đ. Bảng tick chấm theo từng ô (tableauDiem).
 * Tự kiểm trước khi in SQL: đủ số bài, số câu đúng kế hoạch, không gạch dài, đoạn trích « » trong
 * lời giải có trong văn bản (hoặc câu hỏi, phương án), đáp án câu tìm từ có trong văn bản, và không
 * bài nào có mọi đáp án QCM cùng một vị trí (máy dựng tự trộn lại, như lô 35).
 *
 * Chạy: node scripts/nhap/lo36_doc_b1.mjs > lo36.sql */
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG } from "../../src/content/luyenTap/kyNang.js";
import { dungBai } from "./lo36_doc_b1_noi_dung.mjs";

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261104;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const tron = (q) => {
  const dung = q.options[q.answer];
  for (let i = q.options.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [q.options[i], q.options[k]] = [q.options[k], q.options[i]]; }
  q.answer = q.options.indexOf(dung);
  return q;
};
const qcm = (prompt, dung, sai, explanation) => tron({ id: id("q"), type: "qcm", prompt, options: [dung, ...sai], answer: 0, explanation });
const vf = (prompt, dung, explanation) => ({ id: id("q"), type: "qcm", prompt, options: ["Vrai", "Faux"], answer: dung ? 0 : 1, explanation, coDinh: true });
const tim = (prompt, accepted, explanation) => ({ id: id("q"), type: "fill", prompt, accepted, explanation });
const tick = (prompt, cot, hang, explanation) => {
  if (hang.some(([, o]) => o.length !== cot.length)) throw new Error("Bảng tick lệch cột: " + prompt);
  const colonnes = cot.map((titre) => ({ id: id("c"), titre }));
  const criteres = hang.map(([texte]) => ({ id: id("r"), texte }));
  const answers = {};
  hang.forEach(([, o], i) => colonnes.forEach((co, k) => { answers[`${criteres[i].id}_${co.id}`] = o[k] ? "OUI" : "NON"; }));
  return { id: id("q"), type: "tableau", prompt, colonnes, criteres, answers, explanation };
};
const ghep = (prompt, items, choix, dap, explanation) => {
  const I = items.map((texte) => ({ id: id("i"), texte }));
  const C = choix.map((texte) => ({ id: id("c"), texte }));
  return { id: id("q"), type: "apparier", prompt, items: I, choix: C, answers: Object.fromEntries(I.map((x, k) => [x.id, C[dap[k]].id])), explanation };
};
const xep = (prompt, thuTu, explanation) => ({ id: id("q"), type: "ordre", prompt, elements: thuTu.map((texte) => ({ id: id("e"), texte })), explanation });

const BAI = dungBai({ qcm, vf, tick, tim, ghep, xep });

/* Câu « chọn tài liệu nào » có phương án mang chữ A., B., C., D.: xếp theo chữ cho dễ đọc. */
for (const b of BAI) for (const c of b.cau) {
  if (c.type !== "qcm" || !c.options.every((o) => /^[A-D]\. /.test(o))) continue;
  const dung = c.options[c.answer];
  c.options.sort();
  c.answer = c.options.indexOf(dung);
  c.coDinh = true;
}

/* Mọi đáp án QCM của một bài cùng vị trí thì trộn lại câu trộn được (Vrai/Faux giữ cố định). */
for (const b of BAI) {
  const ds = b.cau.filter((c) => c.type === "qcm");
  for (let lan = 0; ds.length >= 3 && new Set(ds.map((c) => c.answer)).size === 1 && lan < 20; lan++) ds.filter((c) => !c.coDinh).forEach(tron);
}

const SO_CAU = { "B1-CE-1": [2, 2, 2, 2], "B1-CE-2": [7, 7, 7, 6, 8], "B1-CE-3": [6, 6, 6, 8], "B1-CE-4": [8, 8, 6, 6, 6], "B1-CE-5": [8, 8, 6, 8, 6] };
const chuan = (s) => s.replace(/<[^>]+>/g, " ").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const loi = [];
const ten = new Set();
const demKn = {};
for (const b of BAI) {
  if (ten.has(b.tieuDe)) loi.push("Trùng tên: " + b.tieuDe);
  ten.add(b.tieuDe);
  const n = (demKn[b.ma] = (demKn[b.ma] || 0) + 1);
  if (b.cau.length !== SO_CAU[b.ma][n - 1]) loi.push(`${b.tieuDe}: ${b.cau.length} câu, kế hoạch ${SO_CAU[b.ma][n - 1]}`);
  if (JSON.stringify(b).includes("—")) loi.push("Dấu gạch dài: " + b.tieuDe);
  const van = chuan(b.van);
  for (const c of b.cau) {
    const quanh = chuan([c.prompt, ...(c.options || [])].join(" "));
    for (const t of (c.explanation || "").match(/« [^»]+ »/g) || []) {
      for (const manh of t.slice(2, -2).split("…").map((x) => chuan(x).replace(/^[.,;]|[.,;]$/g, "").trim()).filter(Boolean)) {
        if (!van.includes(manh) && !quanh.includes(manh)) loi.push(`${b.tieuDe}: « ${manh} » không có trong văn bản`);
      }
    }
    if (c.type === "fill" && !c.accepted.split("|").some((a) => van.includes(chuan(a)))) loi.push(`${b.tieuDe}: đáp án « ${c.accepted} » không có trong văn bản`);
  }
  const dap = b.cau.filter((c) => c.type === "qcm").map((c) => c.answer);
  if (dap.length >= 3 && new Set(dap).size === 1) loi.push(`${b.tieuDe}: mọi đáp án QCM đều ở vị trí ${dap[0]}`);
}
for (const kn of KY_NANG.B1.CE) if (kn.bai.length + (demKn[kn.ma] || 0) !== kn.duKien) loi.push(`${kn.ma}: có ${kn.bai.length} + ${demKn[kn.ma] || 0} bài, kế hoạch ${kn.duKien}`);
if (loi.length) { console.error(loi.join("\n")); process.exit(1); }
for (const b of BAI) for (const c of b.cau) delete c.coDinh;

const moc = Date.UTC(2026, 10, 4);
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const daGap = {};
let mien = 0;
for (const [i, b] of BAI.entries()) {
  const kn = KY_NANG.B1.CE.find((k) => k.ma === b.ma);
  daGap[b.ma] = (daGap[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + daGap[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  if (mienPhi) mien++;
  console.error(`· ${b.ma} #${thuTu} ${b.tieuDe}: ${b.cau.length} câu (${b.cau.map((c) => c.type).join(", ")}), ${mienPhi ? "miễn phí" : "VIP"}`);
  const ex = {
    title: b.tieuDe, level: "B1", skills: ["Lecture"], id: `b1ce${String(i + 1).padStart(2, "0")}${id("x").slice(-6)}`, audioUrl: "", questions: b.cau,
    consigne: `<p>Lisez ${b.loai}, puis répondez aux questions.</p>`, readingText: b.van,
    imageUrl: "", usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: moc + i * 1000,
    vocabulaire: b.tu.map((x) => "• " + x).join("\n"), explications: b.meo.map((x) => "• " + x).join("\n"),
    kyNang: b.ma, vong: b.vong, thuTu,
    ...(mienPhi ? {} : { isPremium: true, price: 19000 }),
  };
  const { exRow, qRows } = toRows(ex, "practice");
  exRow.store = "practice";
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}
console.error(`${BAI.length} bài, ${BAI.reduce((n, b) => n + b.cau.length, 0)} câu, ${mien} miễn phí, ${BAI.length - mien} VIP`);
console.log(ra.join("\n"));
