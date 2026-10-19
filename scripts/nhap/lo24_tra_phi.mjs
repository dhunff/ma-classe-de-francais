/* Lô 24 (20/10): MÁY DỰNG 14 bài luyện tập trả phí từ lo24_tra_phi_noi_dung.mjs.
 * Bài Nghe tạo audio bằng Edge Function tao-audio (một file, không khoảng nghỉ). Ghi vào kho
 * 'practice' với isPremium = true, price = 29000 (đổi 290 XP, khớp gia_xp). In SQL ra stdout.
 * Chạy: TTS_ADMIN_TOKEN=… node scripts/nhap/lo24_tra_phi.mjs > lo24.sql */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import { BAI, id } from "./lo24_tra_phi_noi_dung.mjs";

const GIA = 29000;
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`, ANON = env.VITE_SUPABASE_ANON_KEY, TOKEN = process.env.TTS_ADMIN_TOKEN;
if (!TOKEN) { console.error("Thiếu TTS_ADMIN_TOKEN"); process.exit(1); }
const goi = async (than) => {
  for (let lan = 0; lan < 3; lan++) {
    const r = await fetch(URL_FN, { method: "POST", headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(than) }).then((x) => x.json()).catch((e) => ({ ok: false, loi: String(e) }));
    if (r.ok) return r;
    console.error("thử lại", than.ten, JSON.stringify(r).slice(0, 150));
  }
  throw new Error("tao-audio hỏng: " + than.ten);
};
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
for (const [k, b] of BAI.entries()) {
  let audioUrl = "";
  if (b.audio) { audioUrl = (await goi({ ten: `lo24-${k}`, doan: b.doan })).url; console.error(`✔ audio ${b.title}`); }
  const ex = { id: id("lo24"), title: b.title, level: b.level, skill: b.skill, skills: [b.skill], consigne: b.consigne, readingText: b.readingText ?? "", audioUrl,
    imageUrl: "", usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [],
    isPremium: true, price: GIA, questions: b.questions, createdAt: Date.now() };
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
