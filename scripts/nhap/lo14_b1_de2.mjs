/* Lô 14 (10/10): thay 3 bài DELF B1 · Đề 2 đang TRÙNG với Đề 1
 * (« Le smartphone… », « Activité 1 », « Activité 2 » viết).
 *
 *   CO : 1 bài nghe kiểu phòng thi (giọng tổng hợp), 8 câu QCM.
 *   CE : 1 bài đọc, 8 câu QCM.
 *   PE : 1 bài tự luận, 160 mots minimum.
 *
 * Bài mới vào kho practice rồi THAY exercise_id của đúng ba dòng exam_sections
 * trong B1 · Đề 2. Bài cũ không bị đụng (Đề 1 vẫn dùng).
 *
 * Chạy: TTS_ADMIN_TOKEN=… FFMPEG=…/ffmpeg.exe node scripts/nhap/lo14_b1_de2.mjs > lo14.sql */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toRows } from "../../src/shared/exerciseMap.js";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
const ANON = env.VITE_SUPABASE_ANON_KEY;
const TOKEN = process.env.TTS_ADMIN_TOKEN;
const FFMPEG = process.env.FFMPEG;
if (!TOKEN || !FFMPEG) { console.error("Thiếu TTS_ADMIN_TOKEN hoặc FFMPEG"); process.exit(1); }

const DOC_CAU = 30, NGHI = 30, HOAN_THANH = 30;

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261010;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};

const RADIO = "Parle en français de France, comme un animateur de radio, débit naturel.";
const KHACH = "Parle en français de France, débit naturel, ton convaincu mais calme.";
const GIAM_KHAO = "Parle en français de France, ton neutre et posé, comme les consignes d'un examen officiel.";

/* ───────────── CO ───────────── */
const CO = { ten: "b1-de2-co1", tieuDe: "Écoute B1 · Đề 2 : le covoiturage pour aller au travail",
  gioiThieu: "Vous écoutez une émission de radio sur les déplacements domicile-travail.",
  doan: [
    { giong: "sage", cach: RADIO, chu: "Bonjour à tous. Aujourd'hui, nous parlons du covoiturage pour aller au travail. Avec nous, Julien Martin, qui a créé une application de covoiturage à Lyon il y a trois ans. Julien, pourquoi cette idée ?" },
    { giong: "echo", cach: KHACH, chu: "Tout simplement parce que je passais une heure par jour seul dans ma voiture, dans les embouteillages. J'ai remarqué que mes voisins faisaient exactement le même trajet que moi. Alors je me suis dit : pourquoi ne pas partager la voiture ?" },
    { giong: "sage", cach: RADIO, chu: "Et aujourd'hui, combien de personnes utilisent votre application ?" },
    { giong: "echo", cach: KHACH, chu: "Environ douze mille personnes, surtout des salariés de grandes entreprises en banlieue. Le passager paie quatre-vingts centimes pour dix kilomètres, et cet argent va directement au conducteur. Nous, nous ne prenons aucune commission : ce sont les entreprises qui nous paient un abonnement." },
    { giong: "sage", cach: RADIO, chu: "Quels sont les avantages, selon vous ?" },
    { giong: "echo", cach: KHACH, chu: "D'abord l'argent, évidemment : un conducteur économise environ cent euros par mois. Ensuite l'environnement, puisqu'il y a moins de voitures sur la route. Mais ce qui surprend le plus nos utilisateurs, c'est le côté humain. Beaucoup nous disent qu'ils ont rencontré des collègues qu'ils ne connaissaient pas, et parfois de vrais amis." },
    { giong: "sage", cach: RADIO, chu: "Il y a quand même des difficultés ?" },
    { giong: "echo", cach: KHACH, chu: "Oui, la principale, c'est la flexibilité. Si vous devez rester tard au bureau, vous perdez votre trajet. C'est pour ça que nous avons signé un accord avec les taxis de la ville : en cas de problème, le retour est remboursé deux fois par mois." },
  ],
  cau: [
    qcm("Julien Martin a créé…", "une application de covoiturage", ["une entreprise de taxis", "une émission de radio"], "« qui a créé une application de covoiturage à Lyon »."),
    qcm("Pourquoi a-t-il eu cette idée ?", "Ses voisins faisaient le même trajet que lui.", ["Il n'avait pas de voiture.", "Son entreprise le lui a demandé."], "« mes voisins faisaient exactement le même trajet que moi »."),
    qcm("Qui utilise surtout l'application ?", "des salariés de grandes entreprises", ["des étudiants", "des touristes"], "« surtout des salariés de grandes entreprises en banlieue »."),
    qcm("Combien paie le passager ?", "80 centimes pour 10 kilomètres", ["10 euros par mois", "1 euro par trajet"], "« quatre-vingts centimes pour dix kilomètres »."),
    qcm("Comment l'application gagne-t-elle de l'argent ?", "Les entreprises paient un abonnement.", ["Elle prend une commission sur chaque trajet.", "Grâce à la publicité."], "« ce sont les entreprises qui nous paient un abonnement »."),
    qcm("Combien un conducteur économise-t-il environ ?", "100 euros par mois", ["100 euros par an", "12 euros par semaine"], "« environ cent euros par mois »."),
    qcm("Qu'est-ce qui surprend le plus les utilisateurs ?", "les rencontres avec d'autres personnes", ["les économies d'argent", "la rapidité du trajet"], "« ce qui surprend le plus… c'est le côté humain »."),
    qcm("Si on doit rester tard au bureau…", "le retour en taxi peut être remboursé", ["on ne peut plus utiliser l'application", "le conducteur attend gratuitement"], "« en cas de problème, le retour est remboursé deux fois par mois »."),
  ] };

/* ───────────── CE ───────────── */
const CE = { tieuDe: "Lecture B1 · Đề 2 : la semaine de quatre jours",
  consigne: "<p>Vous lisez cet article dans un magazine. Lisez le document puis répondez aux questions.</p>",
  readingText: "<p><strong>Travailler quatre jours par semaine : le pari d'une PME bretonne</strong></p><p>Depuis janvier, les quarante salariés de Kerlab, une entreprise de Rennes qui fabrique du matériel de laboratoire, ne travaillent plus le vendredi. Leur salaire, lui, n'a pas changé. « Nous avons gardé 35 heures par semaine, mais réparties sur quatre jours », explique la directrice, Anne Le Goff.</p><p>L'idée est née après une enquête interne : plus de la moitié des employés se disaient fatigués et beaucoup passaient plus d'une heure par jour dans les transports. « Supprimer un jour de trajet, c'était déjà un vrai cadeau », raconte Thomas, technicien.</p><p>Six mois plus tard, le bilan est plutôt positif. Les absences pour maladie ont baissé de 30 % et l'entreprise reçoit trois fois plus de candidatures qu'avant. La production, elle, est restée stable.</p><p>Tout n'est pas parfait pour autant. Les journées de neuf heures sont longues, surtout pour les parents qui doivent récupérer leurs enfants à l'école. Le service client, de son côté, reste ouvert le vendredi grâce à un système de rotation : chaque salarié de ce service choisit un autre jour de repos.</p><p>Pour Anne Le Goff, il n'est pas question de revenir en arrière : « Ce n'est pas une solution miracle, mais nos salariés sont plus motivés. Et un salarié motivé travaille mieux. »</p>",
  cau: [
    qcm("Que fabrique l'entreprise Kerlab ?", "du matériel de laboratoire", ["des logiciels", "des vêtements de travail"], "« une entreprise de Rennes qui fabrique du matériel de laboratoire »."),
    qcm("Avec la semaine de quatre jours, le salaire des employés…", "est resté le même", ["a augmenté", "a un peu baissé"], "« Leur salaire, lui, n'a pas changé »."),
    qcm("Combien d'heures travaillent les salariés par semaine ?", "35 heures", ["32 heures", "28 heures"], "« Nous avons gardé 35 heures par semaine »."),
    qcm("D'où vient l'idée de ce changement ?", "d'une enquête auprès des employés", ["d'une loi du gouvernement", "d'une autre entreprise"], "« L'idée est née après une enquête interne »."),
    qcm("Pour Thomas, le principal avantage est…", "d'avoir un jour de trajet en moins", ["de gagner plus d'argent", "de travailler moins d'heures"], "« Supprimer un jour de trajet, c'était déjà un vrai cadeau »."),
    qcm("Quel résultat l'article ne mentionne-t-il PAS ?", "une hausse de la production", ["moins d'absences pour maladie", "plus de candidatures"], "« La production, elle, est restée stable »."),
    qcm("Quelle difficulté est citée ?", "Les journées sont longues pour les parents.", ["Les clients ne peuvent plus appeler le vendredi.", "Les salariés ont perdu des congés."], "« Les journées de neuf heures sont longues, surtout pour les parents »."),
    qcm("Quelle est l'opinion de la directrice ?", "Ce n'est pas parfait, mais elle veut continuer.", ["Elle veut revenir à cinq jours.", "C'est une solution miracle."], "« Ce n'est pas une solution miracle… il n'est pas question de revenir en arrière »."),
  ] };

/* ───────────── PE ───────────── */
const PE = { title: "Production écrite B1 · Đề 2 : Faut-il fermer le centre-ville aux voitures ?", level: "B1", skills: ["Production écrite"], timeLimit: 45,
  consigne: "<p>Production écrite : 45 minutes. <strong>160 mots minimum</strong>.</p>",
  questions: [
    { id: id("q"), type: "open", prompt: "La mairie de votre ville veut interdire les voitures dans le centre-ville le week-end. Sur le forum du journal local, vous donnez votre opinion : vous présentez les avantages et les inconvénients de ce projet, vous donnez des exemples tirés de votre expérience et vous proposez une solution. (160 mots minimum)" },
  ] };

/* ───────────── FILE NGHE KIỂU THI ───────────── */
const goi = (than) => fetch(URL_FN, { method: "POST",
  headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify(than) }).then((r) => r.json());
const taiVe = async (url, tep) => writeFileSync(tep, Buffer.from(await (await fetch(url)).arrayBuffer()));
const DIR = mkdtempSync(join(tmpdir(), "nghe-b1-"));
const LOI = {
  gt: `Exercice un. ${CO.gioiThieu} Vous allez entendre deux fois le document. Vous avez trente secondes pour lire les questions.`,
  e1: "Première écoute.",
  nghi: "Fin de la première écoute. Vous avez trente secondes pour commencer à répondre aux questions.",
  e2: "Deuxième écoute.",
  het: "Fin de la deuxième écoute. Vous avez trente secondes pour compléter vos réponses.",
  xong: "Fin de l'exercice.",
};
const tep = {};
for (const [k, chu] of Object.entries(LOI)) {
  const r = await goi({ ten: `${CO.ten}-loi-${k}`, doan: [{ giong: "sage", cach: GIAM_KHAO, chu }] });
  if (!r.ok) { console.error(k, r); process.exit(1); }
  tep[k] = join(DIR, `${k}.mp3`); await taiVe(r.url, tep[k]);
}
const tl = await goi({ ten: `${CO.ten}-tai-lieu`, doan: CO.doan });
if (!tl.ok) { console.error(tl); process.exit(1); }
tep.tl = join(DIR, "tl.mp3"); await taiVe(tl.url, tep.tl);

const seq = [tep.gt, DOC_CAU, tep.e1, tep.tl, tep.nghi, NGHI, tep.e2, tep.tl, tep.het, HOAN_THANH, tep.xong];
const args = ["-y", "-hide_banner", "-loglevel", "error"];
const nhan = [];
seq.forEach((x, i) => {
  if (typeof x === "number") args.push("-f", "lavfi", "-t", String(x), "-i", "anullsrc=r=24000:cl=mono");
  else args.push("-i", x);
  nhan.push(`[${i}:a]aresample=24000,aformat=channel_layouts=mono[a${i}]`);
});
const out = join(DIR, "thi.mp3");
args.push("-filter_complex", `${nhan.join(";")};${seq.map((_, i) => `[a${i}]`).join("")}concat=n=${seq.length}:v=0:a=1[o]`, "-map", "[o]", "-b:a", "64k", out);
execFileSync(FFMPEG, args);
const bin = readFileSync(out);
const up = await goi({ taiLen: true, ten: `${CO.ten}-thi`, base64: bin.toString("base64") });
if (!up.ok) { console.error(up); process.exit(1); }
console.error(`✔ ${CO.ten}-thi: ${Math.round(bin.length / 1024)} KB`);

/* ───────────── SQL ───────────── */
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const chung = { usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [] };
const ghi = (ex) => {
  const { exRow, qRows } = toRows(ex, "practice");
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
};
const exCO = { ...chung, id: id("b1d2"), title: CO.tieuDe, level: "B1", skills: ["Écoute"], ngheKieuThi: true, audioLuyen: tl.url,
  consigne: `<p>${CO.gioiThieu} Lisez les questions, puis écoutez le document.</p><p>Comme à l'examen, l'enregistrement contient tout le déroulement : ${DOC_CAU} secondes pour lire les questions, première écoute, ${NGHI} secondes de pause, deuxième écoute, puis ${HOAN_THANH} secondes pour compléter vos réponses.</p>`,
  audioUrl: up.url, questions: CO.cau, createdAt: Date.now() };
const exCE = { ...chung, id: id("b1d2"), title: CE.tieuDe, level: "B1", skills: ["Lecture"], consigne: CE.consigne, readingText: CE.readingText, questions: CE.cau, createdAt: Date.now() };
const exPE = { ...chung, ...PE, id: id("b1d2"), createdAt: Date.now() };
[exCO, exCE, exPE].forEach(ghi);
/* Thay đúng ba dòng đang trùng của B1 · Đề 2 (nhận theo mã + bài cũ của Đề 1). */
ra.push(`update public.exam_sections s set exercise_id = v.moi from (values ('CO', ${q(exCO.id)}), ('CE', ${q(exCE.id)}), ('PE', ${q(exPE.id)})) v(code, moi) where s.exam_id = (select id from public.exams where title = 'DELF B1 · Đề 2') and s.code = v.code and s.exercise_id in (select s1.exercise_id from public.exam_sections s1 join public.exams e1 on e1.id = s1.exam_id where e1.title = 'DELF B1 · Đề 1');`);
console.log(ra.join("\n"));
