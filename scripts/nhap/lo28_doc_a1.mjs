/* Lô 28 (01/11/2026): 25 bài ĐỌC A1 cho cây Luyện tập theo trình độ.
 *
 * Khuôn lo27_nghe_a1.mjs, bỏ phần audio. Bài gắn cây bằng meta.kyNang + meta.thuTu + meta.vong.
 * Bài nền (trong `mienPhi` của kỹ năng) miễn phí, phần còn lại là bài VIP giá 19.000 đ.
 * Tự kiểm trước khi in SQL: đủ số bài theo kế hoạch, không có dấu gạch dài, đoạn trích trong
 * lời giải và đáp án điền từ có thật trong văn bản đọc.
 *
 * Chạy: node scripts/nhap/lo28_doc_a1.mjs > lo28.sql */
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG } from "../../src/content/luyenTap/kyNang.js";
import { dungBai } from "./lo28_doc_a1_noi_dung.mjs";

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261102;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const dien = (prompt, accepted, explanation) => ({ id: id("q"), type: "fill", prompt, accepted, explanation });
const tick = (prompt, tieuDe, hang, explanation) => {
  const co = { id: id("c"), titre: tieuDe };
  const criteres = hang.map(([texte]) => ({ id: id("r"), texte }));
  return { id: id("q"), type: "tableau", prompt, colonnes: [co], criteres, answers: Object.fromEntries(hang.map(([, oui], i) => [`${criteres[i].id}_${co.id}`, oui ? "OUI" : "NON"])), explanation };
};

const BAI = dungBai({ qcm, dien, tick });

const thuong = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
const loi = [];
const demKn = {};
const ten = new Set();
for (const b of BAI) {
  if (ten.has(b.tieuDe)) loi.push("Trùng tên: " + b.tieuDe);
  ten.add(b.tieuDe);
  demKn[b.ma] = (demKn[b.ma] || 0) + 1;
  const van = thuong(b.van);
  if (JSON.stringify(b).includes("—")) loi.push("Dấu gạch dài: " + b.tieuDe);
  for (const c of b.cau) {
    for (const t of c.explanation.match(/« [^»]+ »/g) || []) {
      const trich = t.slice(2, -2).toLowerCase();
      if (!van.includes(trich) && !/^(à droite|tout droit)/.test(trich) && !c.prompt.toLowerCase().includes(trich)) loi.push(`${b.tieuDe}: « ${trich} » không có trong văn bản`);
    }
    if (c.type === "fill" && !van.includes(c.accepted.split("|")[0].toLowerCase())) loi.push(`${b.tieuDe}: đáp án « ${c.accepted.split("|")[0]} » không có trong văn bản`);
  }
}
for (const kn of KY_NANG.A1.CE) if (demKn[kn.ma] !== kn.duKien) loi.push(`${kn.ma}: có ${demKn[kn.ma] || 0} bài, kế hoạch ${kn.duKien}`);
if (loi.length) { console.error(loi.join("\n")); process.exit(1); }

const moc = Date.UTC(2026, 10, 1, 12);
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const dinhDeBai = (b) => `<p>Lisez ${b.loai}, puis répondez aux questions.</p>`;
const ra = [];
const daGap = {};
let mien = 0;
for (const [i, b] of BAI.entries()) {
  const kn = KY_NANG.A1.CE.find((k) => k.ma === b.ma);
  daGap[b.ma] = (daGap[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + daGap[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  if (mienPhi) mien++;
  const ex = {
    title: b.tieuDe, level: "A1", skills: ["Lecture"], id: `a1ce${String(i + 1).padStart(2, "0")}${id("x").slice(-6)}`, audioUrl: "", questions: b.cau,
    consigne: dinhDeBai(b), readingText: b.van,
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
