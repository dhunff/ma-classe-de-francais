/* Lô 29 (01/11/2026): 25 bài VIẾT A1 cho cây Luyện tập theo trình độ. Khuôn lo28_doc_a1.mjs.
 *
 * Bài gắn cây bằng meta.kyNang + meta.thuTu + meta.vong. Kỹ năng A1-PE-4 đã có 2 bài trong
 * kyNang.js, nên chỉ thêm 4. Bài trong `mienPhi` của kỹ năng miễn phí, còn lại VIP 19.000 đ.
 * Tự kiểm: đủ số bài, số câu đúng kế hoạch, không dấu gạch dài, đoạn trích và đáp án phiếu có
 * trong văn bản, bài mẫu đủ số từ tối thiểu của đề.
 *
 * Chạy: node scripts/nhap/lo29_viet_a1.mjs > lo29.sql */
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG } from "../../src/content/luyenTap/kyNang.js";
import { dungBai } from "./lo29_viet_a1_noi_dung.mjs";

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
const dien = (prompt, accepted, explanation) => ({ id: id("q"), type: "fill", prompt, accepted, explanation });
const ordre = (prompt, thuTu, explanation) => ({ id: id("q"), type: "ordre", prompt, elements: thuTu.map((texte) => ({ id: id("e"), texte })), explanation });
const viet = (prompt, model) => ({ id: id("q"), type: "open", prompt, model });

const BAI = dungBai({ dien, ordre, viet });

const SO_CAU = { "A1-PE-1": [10, 10, 10, 10, 10], "A1-PE-2": [1, 1, 1, 1, 1, 1], "A1-PE-3": [1, 1, 1, 1, 1, 1], "A1-PE-4": [10, 10, 10, 10], "A1-PE-5": [8, 8, 5, 6] };
const thuong = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
const loi = [];
const ten = new Set();
const demKn = {};
for (const b of BAI) {
  if (ten.has(b.tieuDe)) loi.push("Trùng tên: " + b.tieuDe);
  ten.add(b.tieuDe);
  const n = (demKn[b.ma] = (demKn[b.ma] || 0) + 1);
  if (b.cau.length !== SO_CAU[b.ma][n - 1]) loi.push(`${b.tieuDe}: ${b.cau.length} câu, kế hoạch ${SO_CAU[b.ma][n - 1]}`);
  if (JSON.stringify(b).includes("—")) loi.push("Dấu gạch dài: " + b.tieuDe);
  const van = thuong(b.van || "");
  for (const c of b.cau) {
    if (c.type === "open") {
      const so = c.model.trim().split(/\s+/).length;
      if (so < b.toiThieu) loi.push(`${b.tieuDe}: bài mẫu ${so} từ, cần ${b.toiThieu}`);
      continue;
    }
    if (!b.van) continue;
    for (const t of (c.explanation || "").match(/« [^»]+ »/g) || []) if (!van.includes(t.slice(2, -2).toLowerCase())) loi.push(`${b.tieuDe}: « ${t.slice(2, -2)} » không có trong văn bản`);
    const dau = c.accepted?.split("|")[0].toLowerCase();
    if (dau && !["2", "1", "30 ans", "16 ans"].includes(dau) && !van.includes(dau)) loi.push(`${b.tieuDe}: đáp án « ${dau} » không có trong văn bản`);
  }
}
for (const kn of KY_NANG.A1.PE) if ((demKn[kn.ma] || 0) + kn.bai.length !== kn.duKien) loi.push(`${kn.ma}: có ${(demKn[kn.ma] || 0) + kn.bai.length} bài, kế hoạch ${kn.duKien}`);
if (loi.length) { console.error(loi.join("\n")); process.exit(1); }

const moc = Date.UTC(2026, 10, 1, 13);
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const daGap = {};
let mien = 0;
for (const [i, b] of BAI.entries()) {
  const kn = KY_NANG.A1.PE.find((k) => k.ma === b.ma);
  daGap[b.ma] = (daGap[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + daGap[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  if (mienPhi) mien++;
  const ex = {
    title: b.tieuDe, level: "A1", skills: ["Production écrite"], id: `a1pe${String(i + 1).padStart(2, "0")}${id("x").slice(-6)}`, audioUrl: "", questions: b.cau,
    consigne: b.de, readingText: b.van || "",
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
