/* Lô 6 (02/10) — 3 bài nghe C1 cắt từ Wikipédia parlée + ghép phần NGHE vào
 * hai đề nháp A2 và C1 (lo4).
 *
 * Audio đã cắt bằng ffmpeg và tải lên kho `nghe` (c1-*.mp3). Câu hỏi viết theo
 * BẢN CHÉP LỜI của chính đoạn đã cắt, không theo bài Wikipédia hiện hành (bài
 * có thể đã sửa sau ngày ghi âm).
 *
 * Giấy phép, ghi trong đề bài của từng bài:
 *   · Changement climatique — ghi âm CC0 (Jfade2c), văn bản CC BY-SA 4.0
 *   · Déni du changement climatique — ghi âm phạm vi công cộng (Jfade2c),
 *     văn bản CC BY-SA 4.0
 *   · Histoire du féminisme — ghi âm GFDL (Arctara), văn bản CC BY-SA 4.0
 *
 * Phần Nghe đề A2 dùng 3 bài giọng tổng hợp A2 của lo5 (đã ghi rõ trong bài).
 *
 * Chạy: node scripts/nhap/lo6_nghe_c1.mjs > lo6.sql  (rồi db query -f) */
import { toRows } from "../../src/shared/exerciseMap.js";

const KHO = "https://cdszvnuaibnnkrvynyck.supabase.co/storage/v1/object/public/nghe/";
let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261004;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const nguon = (ghiAm, bai) => `<p>Écoutez le document (deux écoutes), puis répondez aux questions.</p><p><em>Source : Wikipédia en version parlée, article « ${bai} ». ${ghiAm} Texte de l'article : contributeurs de Wikipédia, licence CC BY-SA 4.0. Extrait.</em></p>`;

const BAI = [
  { tep: "c1-changement-climatique", tieuDe: "Écoute C1 : le changement climatique",
    consigne: nguon("Enregistrement : Jfade2c (2024), domaine public — CC0.", "Changement climatique"),
    cau: [
      qcm("Selon le document, à quoi le changement climatique est-il attribué ?", "aux émissions de gaz à effet de serre d'origine humaine", ["aux cycles naturels du soleil", "uniquement à la déforestation", "aux éruptions volcaniques"], "« L'une comme l'autre sont attribuées aux émissions de gaz à effet de serre d'origine humaine »."),
      qcm("Quelle part des émissions humaines représentent le CO₂ et le méthane ?", "90 %", ["50 %", "75 %", "100 %"], "« représentent 90 % des émissions de gaz à effet de serre dues aux activités humaines »."),
      qcm("Quelle est la principale source de ces émissions ?", "la combustion des énergies fossiles pour produire de l'énergie", ["l'agriculture", "l'industrie", "les transports aériens"], "« La combustion de combustibles fossiles… pour la production d'énergie est la principale source »; agriculture, déforestation, industrie « s'y ajoutent »."),
      qcm("Le terme « rétroactions climatiques » désigne ici des phénomènes qui…", "accélèrent ou tempèrent la hausse de la température", ["mesurent la température", "annulent les émissions", "concernent seulement les océans"], "« L'augmentation de la température est accélérée ou tempérée par les rétroactions climatiques »."),
      qcm("Sur les terres émergées, la hausse de la température est…", "environ le double de la moyenne mondiale", ["égale à la moyenne mondiale", "deux fois plus faible", "nulle"], "« environ le double de l'augmentation moyenne mondiale »."),
      qcm("Quelle région connaît une hausse amplifiée des températures ?", "l'Arctique", ["l'Antarctique", "les tropiques", "les déserts"], "« La hausse des températures est également amplifiée dans l'Arctique »."),
      qcm("Pourquoi les tempêtes deviennent-elles plus intenses ?", "parce que la chaleur augmente l'évaporation", ["parce que les glaciers reculent", "à cause de la pollution de l'air", "à cause des feux de forêt"], "« Les températures plus chaudes augmentent les taux d'évaporation, ce qui provoque des tempêtes plus intenses »."),
      qcm("Comment l'Organisation mondiale de la santé qualifie-t-elle le changement climatique ?", "la plus grande menace pour la santé mondiale au XXIᵉ siècle", ["un risque modéré", "une menace limitée aux pays du Sud", "un problème économique avant tout"], "Dernière phrase de l'extrait."),
    ] },
  { tep: "c1-deni-changement-climatique", tieuDe: "Écoute C1 : le déni du changement climatique",
    consigne: nguon("Enregistrement : Jfade2c (2024), domaine public.", "Déni du changement climatique"),
    cau: [
      qcm("Comment le document définit-il le déni du changement climatique ?", "une attitude de dénégation face au consensus scientifique", ["une théorie scientifique concurrente", "une simple erreur de mesure", "un mouvement écologiste"], "Première phrase de l'extrait."),
      qcm("Que pensent certaines personnes qui admettent le réchauffement ?", "qu'il est uniquement dû à des variations naturelles", ["qu'il est entièrement dû à l'homme", "qu'il va s'arrêter bientôt", "qu'il ne concerne que l'Europe"], "« nient que ce changement a une origine… anthropique. Ils l'attribuent exclusivement aux variations naturelles du climat »."),
      qcm("Selon certains négateurs, le réchauffement pourrait même être une chance pour…", "le tourisme ou l'agriculture", ["la santé publique", "la biodiversité", "les assurances"], "« une chance pour le tourisme ou l'agriculture »."),
      qcm("Pourquoi de nombreux scientifiques refusent-ils le mot « scepticisme » ?", "ils le jugent inexact pour qualifier une négation", ["ils le trouvent trop agressif", "il est réservé à la philosophie", "il est trop récent"], "« le mot scepticisme est désormais inexact pour qualifier l'attitude de négation »."),
      qcm("Qu'est-ce que le déni « implicite » ?", "accepter la science sans changer de comportement", ["refuser publiquement la science", "ne pas connaître le sujet", "douter des chiffres officiels"], "« acceptent les hypothèses et démonstrations scientifiques, mais sans parvenir à les traduire en action »."),
      qcm("Les campagnes contre les sciences du climat ont été décrites comme…", "une machine à produire du déni", ["un débat scientifique légitime", "des initiatives spontanées de citoyens", "des erreurs de journalistes"], "« décrites comme une machine à produire du déni »."),
      qcm("Selon le document, quel est l'objectif de ces campagnes ?", "faire croire qu'il existe une grande incertitude sur les données", ["promouvoir les énergies renouvelables", "financer la recherche", "informer objectivement le public"], "« afin de créer l'impression qu'il existe une grande incertitude autour des données »."),
    ] },
  { tep: "c1-histoire-feminisme", tieuDe: "Écoute C1 : histoire du féminisme",
    consigne: nguon("Enregistrement : Arctara (2015), licence GNU Free Documentation License (https://www.gnu.org/licenses/fdl-1.3.html).", "Histoire du féminisme"),
    cau: [
      qcm("Quelle critique le document fait-il à la littérature sur l'histoire du féminisme ?", "elle privilégie les luttes des femmes blanches occidentales", ["elle est trop récente", "elle ignore la période moderne", "elle est écrite seulement par des hommes"], "« fait la part belle aux luttes des femmes blanches occidentales et tend à délaisser d'autres civilisations »."),
      qcm("Pour la plupart des historiens occidentaux, un mouvement est féministe…", "dès qu'il cherche à obtenir des droits pour les femmes, même sans se dire féministe", ["seulement s'il se revendique féministe", "seulement après 1960", "seulement s'il est organisé en parti"], "« doivent être considérés comme des mouvements féministes, même si leurs membres ne se revendiquent pas comme tels »."),
      qcm("Comment certains historiens appellent-ils les mouvements pré-modernes ?", "proto-féministes", ["post-féministes", "néo-féministes", "anti-féministes"], "« Ces historiens parlent de proto-féministes »."),
      qcm("Quelles étaient les revendications principales de la première vague ?", "le vote, les conditions de travail et l'éducation", ["l'égalité des salaires et la contraception", "la parité en politique", "les droits culturels"], "« au vote, aux conditions de travail et aux droits à l'éducation »."),
      qcm("La deuxième vague (1960–1980) dénonce…", "l'inégalité des lois et le rôle de la femme dans la société", ["uniquement le droit de vote", "l'échec de la troisième vague", "le travail des enfants"], "« dénonce l'inégalité des lois, mais aussi les inégalités culturelles et le rôle de la femme »."),
      qcm("Comment la troisième vague est-elle perçue ?", "à la fois comme une continuation et une réponse à l'échec de la deuxième", ["comme une rupture totale", "comme un retour à la première vague", "comme la fin du féminisme"], "« à la fois continuation de la seconde vague et réponse à l'échec de celle-ci »."),
      qcm("Selon le document, le mot « féminisme »…", "a été attribué à tort à Charles Fourier", ["a été inventé par Charles Fourier", "apparaît pour la première fois aux États-Unis", "date du XXᵉ siècle"], "« a longtemps été attribué à tort à Charles Fourier »."),
      qcm("Dans quel domaine le mot aurait-il été inventé vers 1870 ?", "le domaine médical", ["le droit", "la littérature", "la politique"], "« inventé vers 1870 par le monde médical »."),
    ] },
];

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const ids = [];
for (const b of BAI) {
  const ex = { title: "[NHÁP] " + b.tieuDe, level: "C1", skills: ["Écoute"], id: id("nhap"), consigne: b.consigne,
    audioUrl: KHO + b.tep + ".mp3", questions: b.cau, usageType: "assignment",
    targeted: true, assignedTo: ["__nhap__"], assignedClasses: [], assignedExtra: [], createdAt: Date.now() };
  ids.push(ex.id);
  const { exRow, qRows } = toRows(ex, "assignment");
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}

/* Ghép phần NGHE vào hai đề nháp: dời các phần cũ xuống một bậc, CO đứng đầu
   như đề thật. Một khối CO = MỘT đồng hồ + điểm lấy từ dòng đầu
   (gomTheoKyNang, CLAUDE.md) — nên chỉ dòng đầu mang phút/điểm thật. */
const ghep = (tenDe, phut, exIds) => [
  `update public.exam_sections set ord = ord + ${exIds.length} where exam_id = (select id from public.exams where title = ${q(tenDe)});`,
  `insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord) select e.id, 'CO', v.ex, v.m, v.p, v.o from public.exams e, (values ${exIds.map((x, i) => `(${q(x)}, ${i === 0 ? phut : 0}, ${i === 0 ? 25 : 0}, ${i})`).join(", ")}) as v(ex, m, p, o) where e.title = ${q(tenDe)};`,
  `update public.exams set duration_min = duration_min + ${phut}, title = replace(title, ' (thiếu phần Nghe)', '') where title = ${q(tenDe)};`,
];
ra.push(...ghep("[NHÁP] DALF C1 — Đề 1 (thiếu phần Nghe)", 40, ids));
ra.push(`-- A2: ba bài nghe A2 giọng tổng hợp của lo5, tra theo tiêu đề`);
ra.push(`update public.exam_sections set ord = ord + 3 where exam_id = (select id from public.exams where title = '[NHÁP] DELF A2 — Đề 1 (thiếu phần Nghe)');`);
ra.push(`insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord) select e.id, 'CO', x.id, case when x.o = 0 then 25 else 0 end, case when x.o = 0 then 25 else 0 end, x.o from public.exams e, (select id, row_number() over (order by title) - 1 as o from public.exercises where title in ('[NHÁP] Écoute A2 : le dimanche chez mes grands-parents', '[NHÁP] Écoute A2 : info trafic, grève des bus', '[NHÁP] Écoute A2 : à l''office de tourisme')) x where e.title = '[NHÁP] DELF A2 — Đề 1 (thiếu phần Nghe)';`);
ra.push(`update public.exams set duration_min = duration_min + 25, title = replace(title, ' (thiếu phần Nghe)', '') where title = '[NHÁP] DELF A2 — Đề 1 (thiếu phần Nghe)';`);
console.log(ra.join("\n"));
