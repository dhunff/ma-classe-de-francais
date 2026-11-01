/* Lô 27 (01/11/2026): 29 bài NGHE A1 cho cây Luyện tập theo trình độ.
 *
 * Bài gắn vào cây bằng meta.kyNang + meta.thuTu, không cần sửa kyNang.js. Bài nền
 * (trong `mienPhi` của kỹ năng) miễn phí, phần còn lại là bài VIP giá 19.000 đ.
 * Tạo audio bằng tao-audio, giọng tổng hợp.
 *
 * Chạy: TTS_ADMIN_TOKEN=… node scripts/nhap/lo27_nghe_a1.mjs > lo27.sql
 * Thêm KHO=1 để chỉ dựng SQL kiểm tra, không gọi TTS. */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG } from "../../src/content/luyenTap/kyNang.js";
import { dungBai } from "./lo27_nghe_a1_noi_dung.mjs";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "")]));
const TOKEN = process.env.TTS_ADMIN_TOKEN;
const KHO = process.env.KHO === "1";
if (!TOKEN && !KHO) { console.error("Thiếu TTS_ADMIN_TOKEN"); process.exit(1); }

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261101;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const oui = (prompt, co, explanation) => ({ id: id("q"), type: "qcm", prompt, options: ["Oui", "Non"], answer: co ? 0 : 1, explanation });
const dien = (prompt, accepted, explanation) => ({ id: id("q"), type: "fill", prompt, accepted, explanation });
const ghep = (prompt, items, choix, dap, explanation) => {
  const I = items.map((texte) => ({ id: id("i"), texte }));
  const C = choix.map((texte) => ({ id: id("c"), texte }));
  return { id: id("q"), type: "apparier", prompt, items: I, choix: C, answers: Object.fromEntries(I.map((x, k) => [x.id, C[dap[k]].id])), explanation };
};

const CHAM = "Parle en français de France, lentement et clairement, pour des apprenants de niveau A1.";
const CONSIGNE = {
  "A1-CO-4": "<p>Écoutez les dialogues, puis associez chaque dialogue à la bonne situation.</p>",
  "A1-CO-5": "<p>Écoutez le message. Pour chaque objet, choisissez Oui s'il faut le prendre ou s'il est présent, sinon Non.</p>",
};

const BAI = dungBai({ qcm, oui, dien, ghep });
const moc = Date.UTC(2026, 10, 1);
const ten = new Set();
const demKn = {};
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
for (const [i, b] of BAI.entries()) {
  if (ten.has(b.tep) || ten.has(b.tieuDe)) throw new Error("Trùng: " + b.tep);
  ten.add(b.tep); ten.add(b.tieuDe);
  const kn = KY_NANG.A1.CO.find((k) => k.ma === b.ma);
  demKn[b.ma] = (demKn[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + demKn[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  let url = `https://kho.invalid/${b.tep}.mp3`;
  if (!KHO) {
    const r = await fetch(URL_FN, { method: "POST", headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, "x-admin-token": TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ ten: b.tep, doan: b.doan.map(([giong, chu]) => ({ giong, cach: CHAM, chu })) }) });
    const kq = await r.json();
    if (!kq.ok) { console.error(b.tep, JSON.stringify(kq).slice(0, 200)); process.exit(1); }
    url = kq.url;
    console.error(`✔ ${b.tep}: ${Math.round(kq.so_byte / 1024)} KB, ${b.cau.length} câu, ${mienPhi ? "miễn phí" : "VIP"}`);
  }
  const ex = {
    title: b.tieuDe, level: "A1", skills: ["Écoute"], id: `a1co${String(i + 1).padStart(2, "0")}${id("x").slice(-6)}`, audioUrl: url, questions: b.cau,
    consigne: CONSIGNE[b.ma] || "<p>Écoutez le document, puis répondez aux questions.</p>",
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
console.error(`${BAI.length} bài, ${BAI.reduce((n, b) => n + b.cau.length, 0)} câu`);
console.log(ra.join("\n"));
