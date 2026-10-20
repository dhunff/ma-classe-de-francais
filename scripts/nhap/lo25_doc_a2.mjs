/* Lô 25 (20/10): MÁY DỰNG 10 bài đọc hiểu A2 MIỄN PHÍ (kho practice) từ lo25_doc_a2_noi_dung.mjs.
 * Khuôn lo24_tra_phi.mjs, bỏ phần trả phí và audio. In SQL ra stdout.
 * Chạy: node scripts/nhap/lo25_doc_a2.mjs > lo25.sql */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import { BAI, id } from "./lo25_doc_a2_noi_dung.mjs";

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
for (const [k, b] of BAI.entries()) {
  const ex = { id: id("lo25"), title: b.title, level: "A2", skill: "Lecture", skills: ["Lecture"], consigne: b.consigne, readingText: b.readingText, audioUrl: "",
    imageUrl: "", usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [],
    questions: b.questions, createdAt: Date.now() };
  const { exRow, qRows } = toRows(ex, "practice");
  exRow.store = "practice";
  const cot = Object.keys(exRow);
  const gt = cot.map((c) => (c === "meta" ? j(exRow[c]) : Array.isArray(exRow[c]) ? `array[${exRow[c].map(q).join(",")}]::text[]` : typeof exRow[c] === "number" ? exRow[c] : q(exRow[c])));
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}
const out = ra.join("\n");
if (out.includes("—")) { console.error("Còn dấu gạch dài"); process.exit(1); }
console.log(out);
