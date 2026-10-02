/* Lô 9 (02/10) — đề DELF B2 NHÁP, đủ 4 phần, số câu như đề thật.
 *
 *   CO 30'  : « Faut-il interdire le téléphone à l'école ? » (14) + « Le tourisme de masse » (13) = 27 câu
 *   CE 60'  : « Dans le Gard… » (15, ĐÃ XUẤT BẢN, có neo) + « Les jardins partagés » (8) = 23 câu
 *   PE 60'  : MỚI — bài lập luận ~250 từ (chấm bằng grille B2 chính thức)
 *   PO 20'  : MỚI — trình bày quan điểm từ một tài liệu ngắn + tranh luận (không chấm)
 *
 * Bài viết B2 có sẵn (« Activité 1 ») là thư 160–180 từ, sát dạng B1 hơn, nên
 * không dùng. Bài nghe/đọc tra theo TIÊU ĐỀ.
 *
 * Chạy: node scripts/nhap/lo9_de_b2.mjs <uuid_giao_vien> > lo9.sql */
import { toRows } from "../../src/shared/exerciseMap.js";

const GV = process.argv[2];
if (!/^[0-9a-f-]{36}$/.test(GV || "")) { console.error("Cần uuid giáo viên"); process.exit(1); }
let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");

const PE = { title: "[NHÁP] Production écrite B2 — Contribution : la gratuité des transports en commun", level: "B2", skills: ["Production écrite"], timeLimit: 60,
  consigne: "<p>Votre ville envisage de rendre les transports en commun (bus, tramway) <strong>gratuits</strong> pour tous les habitants, ce qui serait financé par une hausse des impôts locaux. Le journal local ouvre un espace de débat et invite les habitants à donner leur avis.</p><p>Vous écrivez une <strong>contribution argumentée</strong> au courrier des lecteurs (<strong>250 mots minimum</strong>) : vous prenez position, vous développez au moins deux arguments illustrés d'exemples, et vous répondez à un argument du camp opposé.</p>",
  questions: [{ id: id("q"), type: "open", prompt: "Rédigez votre contribution (250 mots minimum)." }] };

const PO = { title: "[NHÁP] Production orale B2 — Faut-il limiter la publicité destinée aux enfants ?", level: "B2", skills: ["Production orale"],
  consigne: "Production orale — 20 minutes (30 minutes de préparation).\n   Document : « Une étude récente indique qu'un enfant voit en moyenne plusieurs milliers de publicités par an, à la télévision mais surtout sur les plateformes de vidéos et les jeux en ligne. Plusieurs associations demandent l'interdiction de la publicité pour les produits trop sucrés pendant les programmes jeunesse. Les annonceurs répondent qu'il revient aux parents d'éduquer leurs enfants. »\n   1. Monologue suivi (5 à 7 min) — Dégagez le problème soulevé par ce document, puis présentez votre opinion de manière argumentée et structurée (introduction, deux ou trois arguments avec des exemples, conclusion).\n   2. Exercice en interaction (10 à 13 min) — L'examinateur vous pose des questions et peut défendre un point de vue opposé au vôtre. Vous devez nuancer, défendre ou préciser votre position.",
  questions: [] };

const ra = [];
const ids = {};
for (const [k, b] of Object.entries({ PE, PO })) {
  const ex = { ...b, id: id("nhap"), usageType: "assignment", targeted: true, assignedTo: ["__nhap__"], assignedClasses: [], assignedExtra: [], createdAt: Date.now() };
  ids[k] = ex.id;
  const { exRow, qRows } = toRows(ex, "assignment");
  const cot = Object.keys(exRow);
  const gt = cot.map((c) => (c === "meta" ? j(exRow[c]) : Array.isArray(exRow[c]) ? `array[${exRow[c].map(q).join(",")}]::text[]` : typeof exRow[c] === "number" ? exRow[c] : q(exRow[c])));
  if (!qRows.length) { ra.push(`insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")});`); continue; }
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}

const TEN = "[NHÁP] DELF B2 — Đề 1";
/* [code, tiêu đề bài, phút, điểm] — dòng ĐẦU mỗi khối mang phút/điểm. */
const PHAN = [
  ["CO", "[NHÁP] Écoute B2 : faut-il interdire le téléphone à l'école ?", 30, 25],
  ["CO", "[NHÁP] Écoute B2 : le tourisme de masse", 0, 0],
  ["CE", "Dans le Gard, le feu est fixé mais les habitants sont toujours inquiets : « La suite va être tout aussi éprouvante »", 60, 25],
  ["CE", "[NHÁP] Lecture : un article sur les jardins partagés", 0, 0],
];
const tong = 30 + 60 + 60 + 20;
ra.push(`with e as (insert into public.exams (title, level, duration_min, is_published, created_by) values (${q(TEN)}, 'B2', ${tong}, false, ${q(GV)}) returning id) insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord) select (select id from e), v.code, x.id, v.m, v.p, v.o from (values ${PHAN.map(([c, t, m, p], i) => `(${q(c)}, ${q(t)}, ${m}, ${p}, ${i})`).join(", ")}, ('PE', null, 60, 25, 4), ('PO', null, 20, 0, 5)) as v(code, tieu_de, m, p, o) left join public.exercises x on x.title = v.tieu_de where v.tieu_de is not null union all select (select id from e), v.code, v.ex, v.m, v.p, v.o from (values ('PE', ${q(ids.PE)}, 60, 25, 4), ('PO', ${q(ids.PO)}, 20, 0, 5)) as v(code, ex, m, p, o);`);
console.log(ra.join("\n"));
