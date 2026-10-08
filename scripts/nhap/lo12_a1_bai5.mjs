/* Lô 12 (08/10): bổ sung BÀI NGHE 5 cho đề DELF A1 · Đề 1.
 *
 * Đối chiếu sujet d'exemple A1 tout public (delfdalf.ch 2022): phần nghe có 5
 * bài (4 + 4 + 4 + 8 + 5 điểm), bài 5 là một tin nhắn, thí sinh đánh dấu Có /
 * Không cho 5 đồ vật « có được nhắc tới không ». Đề 1 soạn ở lô 10 chỉ có 4 bài.
 *
 * Giọng tổng hợp, ghi rõ trong đề bài. Xuất bản thẳng (store practice) và gắn
 * vào phần CO của đề, ord sau bài 4. Không dùng « — » trong nội dung.
 *
 * Chạy: TTS_ADMIN_TOKEN=… node scripts/nhap/lo12_a1_bai5.mjs > lo12.sql */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const TOKEN = process.env.TTS_ADMIN_TOKEN;
if (!TOKEN) { console.error("Thiếu TTS_ADMIN_TOKEN"); process.exit(1); }

const kq = await (await fetch(`${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`, { method: "POST",
  headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, "x-admin-token": TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify({ ten: "a1-de1-co5-valise", doan: [{ giong: "shimmer",
    cach: "Parle en français de France, lentement et très clairement, comme pour des débutants.",
    chu: "Salut Tom, c'est Inès ! Pour le week-end à la mer, n'oublie pas de prendre ton maillot de bain et une serviette. Prends aussi des lunettes de soleil, il va faire très chaud. Moi, j'apporte l'appareil photo. Et toi, prends ton téléphone et le chargeur, s'il te plaît. À samedi !" }] }) })).json();
if (!kq.ok) { console.error(kq); process.exit(1); }
console.error(`✔ a1-de1-co5-valise: ${Math.round(kq.so_byte / 1024)} KB`);

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
/* Có / Không: QCM hai phương án, A = Oui, B = Non (đúng thứ tự trên phiếu thi). */
const yn = (doVat, co) => ({ id: id("q"), type: "qcm", prompt: `Inès parle de : ${doVat} ?`, options: ["Oui", "Non"], answer: co ? 0 : 1,
  explanation: co ? `Oui, ${doVat} est dans le message.` : `Non, le message ne parle pas de ${doVat}.` });

const ex = {
  id: id("nhap"), title: "Écoute A1 · Đề 1 · Exercice 5 : la valise du week-end", level: "A1", skills: ["Écoute"],
  usageType: "practice", targeted: false, createdAt: Date.now(),
  consigne: "<p>Vous allez entendre un message. Quels objets sont donnés dans le message ? Vous entendez le nom de l'objet : cochez « Oui ». Sinon, cochez « Non ». Puis vous allez entendre à nouveau le message.</p><p><em>Enregistrement réalisé avec une voix de synthèse (giọng tổng hợp).</em></p>",
  audioUrl: kq.url,
  questions: [yn("un maillot de bain", true), yn("un parapluie", false), yn("des lunettes de soleil", true), yn("un livre", false), yn("un chargeur", true)],
};

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const { exRow, qRows } = toRows(ex, "practice");
const cot = Object.keys(exRow);
const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
console.log(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
/* Gắn vào phần CO của đề A1 · Đề 1, sau bài 4: dời mọi phần từ CE trở đi lên 1. */
console.log(`update public.exam_sections s set ord = s.ord + 1 from public.exams e where e.id = s.exam_id and e.title = 'DELF A1 · Đề 1' and s.ord >= 4;`);
console.log(`insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord) select e.id, 'CO', ${q(ex.id)}, 0, 0, 4 from public.exams e where e.title = 'DELF A1 · Đề 1';`);
