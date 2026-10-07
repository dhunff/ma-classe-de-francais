/* Lô 10 (07/10): đề DELF A1 NHÁP, theo format 2 (docs/format-de-thi-DELF-A1-B2.xlsx).
 *
 *   CO 20'  : 4 bài, 16 câu. Bài 1–3 QCM, bài 4 GHÉP CẶP 4 hội thoại ↔ 6 tình huống.
 *             Giọng tổng hợp (tao-audio), ghi rõ trong đề bài.
 *   CE 30'  : 4 bài, 17 câu. Bài 3 ghép cặp 4 người ↔ 6 quảng cáo nhỏ.
 *   PE 30'  : 1 bài, 2 câu: PHIẾU (formulaire) + tin nhắn ≥ 40 từ.
 *   PO 10'  : 3 phần (entretien dirigé, échange d'informations, dialogue simulé), không chấm.
 *
 * Nội dung học KHÔNG dùng « — » (quy tắc 7).
 *
 * Chạy: TTS_ADMIN_TOKEN=… node scripts/nhap/lo10_de_a1.mjs <uuid_giao_vien> > lo10.sql */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";

const GV = process.argv[2];
if (!/^[0-9a-f-]{36}$/.test(GV || "")) { console.error("Cần uuid giáo viên"); process.exit(1); }
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
const ANON = env.VITE_SUPABASE_ANON_KEY;
const TOKEN = process.env.TTS_ADMIN_TOKEN;
if (!TOKEN) { console.error("Thiếu TTS_ADMIN_TOKEN"); process.exit(1); }

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261007;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
/* Ghép cặp: `dap` = chỉ số phương án đúng cho từng mục. */
const ghep = (prompt, items, choix, dap) => {
  const I = items.map((texte) => ({ id: id("i"), texte }));
  const C = choix.map((texte) => ({ id: id("c"), texte }));
  return { id: id("q"), type: "apparier", prompt, items: I, choix: C, answers: Object.fromEntries(I.map((x, k) => [x.id, C[dap[k]].id])) };
};

const CHAM = "Parle en français de France, lentement et très clairement, comme pour des débutants.";
const RADIO = "Parle en français de France, comme une annonce dans une gare, lentement et clairement.";
const DOC = "<p><em>Enregistrement réalisé avec une voix de synthèse (giọng tổng hợp).</em></p>";

/* ───────────── COMPRÉHENSION DE L'ORAL ───────────── */
const CO = [
  { ten: "a1-de1-co1-message", tieuDe: "Écoute A1 · Đề 1 · Exercice 1 : un message de Julie",
    consigne: "<p>Vous écoutez un message sur votre répondeur. Lisez les questions. Écoutez le document puis répondez.</p>",
    doan: [{ giong: "nova", cach: CHAM, chu: "Salut, c'est Julie ! Samedi, c'est mon anniversaire. Je fais une petite fête chez moi, à dix-neuf heures. J'habite au douze, rue des Lilas. Tu peux apporter des boissons ? Moi, je prépare les pizzas. Appelle-moi au zéro six, vingt-deux, quarante-cinq, dix-huit, trente. Bisous !" }],
    cau: [
      qcm("Julie fait une fête pour…", "son anniversaire", ["son mariage", "son nouveau travail"], "« Samedi, c'est mon anniversaire »."),
      qcm("La fête commence à quelle heure ?", "19 h", ["17 h", "21 h"], "« à dix-neuf heures »."),
      qcm("Qu'est-ce que vous devez apporter ?", "des boissons", ["des pizzas", "un gâteau"], "« Tu peux apporter des boissons ? »."),
      qcm("Le numéro de Julie est le…", "06 22 45 18 30", ["06 22 54 18 30", "06 12 45 18 30"], "« zéro six, vingt-deux, quarante-cinq, dix-huit, trente »."),
    ] },
  { ten: "a1-de1-co2-gare", tieuDe: "Écoute A1 · Đề 1 · Exercice 2 : une annonce à la gare",
    consigne: "<p>Vous êtes à la gare. Vous entendez cette annonce. Lisez les questions. Écoutez le document puis répondez.</p>",
    doan: [{ giong: "sage", cach: RADIO, chu: "Mesdames et messieurs, le train à destination de Lyon, prévu à quatorze heures dix, partira avec vingt minutes de retard. Il partira de la voie numéro six. La voiture-bar se trouve au milieu du train. Nous vous rappelons que les billets doivent être achetés avant de monter dans le train. Merci de votre attention." }],
    cau: [
      qcm("Le train va à…", "Lyon", ["Lille", "Nice"], "« le train à destination de Lyon »."),
      qcm("Le train a…", "20 minutes de retard", ["10 minutes de retard", "une heure de retard"], "« avec vingt minutes de retard »."),
      qcm("Le train part de la voie…", "6", ["2", "10"], "« de la voie numéro six »."),
      qcm("Où est la voiture-bar ?", "au milieu du train", ["au début du train", "à la fin du train"], "« au milieu du train »."),
    ] },
  { ten: "a1-de1-co3-magasin", tieuDe: "Écoute A1 · Đề 1 · Exercice 3 : dans un supermarché",
    consigne: "<p>Vous êtes dans un supermarché. Vous entendez cette annonce. Lisez les questions. Écoutez le document puis répondez.</p>",
    doan: [{ giong: "coral", cach: CHAM, chu: "Chers clients, bonjour ! Aujourd'hui, au rayon fruits, les pommes sont à deux euros le kilo. Au rayon boulangerie, pour deux baguettes achetées, la troisième est gratuite. Attention : ce soir, le magasin ferme à vingt heures, et pas à vingt et une heures. Bonnes courses !" }],
    cau: [
      qcm("Les pommes coûtent…", "2 € le kilo", ["3 € le kilo", "2 € la pièce"], "« les pommes sont à deux euros le kilo »."),
      qcm("Au rayon boulangerie, on peut avoir…", "une baguette gratuite", ["un gâteau gratuit", "du pain à 1 €"], "« pour deux baguettes achetées, la troisième est gratuite »."),
      qcm("Ce soir, le magasin ferme à…", "20 h", ["21 h", "19 h"], "« ce soir, le magasin ferme à vingt heures »."),
      qcm("Cette annonce est pour…", "les clients", ["les employés", "les enfants"], "« Chers clients »."),
    ] },
  { ten: "a1-de1-co4-dialogues", tieuDe: "Écoute A1 · Đề 1 · Exercice 4 : quatre petits dialogues",
    consigne: "<p>Vous allez entendre quatre petits dialogues. Associez chaque dialogue à la bonne situation. Attention : il y a six situations mais seulement quatre dialogues.</p>",
    doan: [
      { giong: "sage", cach: CHAM, chu: "Dialogue un." },
      { giong: "ash", cach: CHAM, chu: "Bonjour, un café et un croissant, s'il vous plaît." },
      { giong: "shimmer", cach: CHAM, chu: "Voilà. Ça fait trois euros cinquante." },
      { giong: "sage", cach: CHAM, chu: "Dialogue deux." },
      { giong: "nova", cach: CHAM, chu: "Pardon, monsieur, la poste, c'est loin ?" },
      { giong: "onyx", cach: CHAM, chu: "Non, c'est tout droit, puis à gauche. À cinq minutes à pied." },
      { giong: "sage", cach: CHAM, chu: "Dialogue trois." },
      { giong: "coral", cach: CHAM, chu: "Bonjour, je voudrais une chambre pour deux nuits." },
      { giong: "echo", cach: CHAM, chu: "Pour une personne ? C'est soixante euros la nuit, avec le petit-déjeuner." },
      { giong: "sage", cach: CHAM, chu: "Dialogue quatre." },
      { giong: "echo", cach: CHAM, chu: "Alors, qu'est-ce qui ne va pas ?" },
      { giong: "nova", cach: CHAM, chu: "J'ai mal à la tête et j'ai de la fièvre depuis hier." },
    ],
    cau: [
      ghep("Associez chaque dialogue à la situation.", ["Dialogue 1", "Dialogue 2", "Dialogue 3", "Dialogue 4"],
        ["Demander son chemin", "Réserver une chambre d'hôtel", "Commander au café", "Acheter un billet de train", "Parler à un médecin", "Inviter un ami"],
        [2, 0, 1, 4]),
    ] },
];

/* ───────────── COMPRÉHENSION DES ÉCRITS ───────────── */
const CE = [
  { tieuDe: "Lecture A1 · Đề 1 · Exercice 1 : un courriel de Paul",
    consigne: "<p>Vous recevez ce courriel. Lisez le document puis répondez aux questions.</p>",
    readingText: "<p><strong>De :</strong> paul.martin@mail.fr<br><strong>Objet :</strong> Dimanche</p><p>Salut !</p><p>Dimanche, je vais au marché de la place Carnot avec ma sœur. Le marché ouvre à huit heures et ferme à treize heures. Après, nous mangeons au restaurant « Chez Lili », à côté du musée. Tu viens avec nous ? On se retrouve devant la boulangerie à neuf heures et demie.</p><p>Réponds-moi avant vendredi.</p><p>Paul</p>",
    cau: [
      qcm("Paul va au marché avec…", "sa sœur", ["sa mère", "un collègue"], "« avec ma sœur »."),
      qcm("Le marché ferme à…", "13 h", ["8 h", "12 h"], "« ferme à treize heures »."),
      qcm("Où est le restaurant ?", "à côté du musée", ["sur la place Carnot", "devant la boulangerie"], "« à côté du musée »."),
      qcm("Paul vous donne rendez-vous à…", "9 h 30, devant la boulangerie", ["8 h, au marché", "13 h, au restaurant"], "« devant la boulangerie à neuf heures et demie »."),
      qcm("Vous devez répondre avant…", "vendredi", ["dimanche", "samedi"], "« Réponds-moi avant vendredi »."),
    ] },
  { tieuDe: "Lecture A1 · Đề 1 · Exercice 2 : l'affiche de la piscine",
    consigne: "<p>Vous lisez cette affiche à l'entrée de la piscine. Lisez le document puis répondez aux questions.</p>",
    readingText: "<p><strong>PISCINE MUNICIPALE</strong></p><p>Horaires : du mardi au samedi, de 10 h à 19 h • Fermée le dimanche et le lundi</p><p>Prix : adulte 4 € • enfant (moins de 12 ans) 2 €</p><p>Obligatoire : bonnet de bain</p><p>Interdit : manger au bord de la piscine</p><p>Cours de natation pour enfants : le mercredi à 14 h</p>",
    cau: [
      qcm("La piscine est fermée…", "le dimanche et le lundi", ["le mardi", "le samedi"], "« Fermée le dimanche et le lundi »."),
      qcm("Pour un enfant de 8 ans, l'entrée coûte…", "2 €", ["4 €", "gratuit"], "« enfant (moins de 12 ans) 2 € »."),
      qcm("Qu'est-ce qui est obligatoire ?", "un bonnet de bain", ["des lunettes", "une serviette"], "« Obligatoire : bonnet de bain »."),
      qcm("Les cours de natation pour enfants ont lieu…", "le mercredi à 14 h", ["le samedi à 10 h", "tous les jours"], "« le mercredi à 14 h »."),
    ] },
  { tieuDe: "Lecture A1 · Đề 1 · Exercice 3 : petites annonces",
    consigne: "<p>Quatre personnes cherchent quelque chose. Lisez les petites annonces et associez chaque personne à la bonne annonce. Attention : il y a six annonces mais seulement quatre personnes.</p>",
    readingText: "<p><strong>A.</strong> Vends vélo pour enfant, bleu, 30 €. Tél. 06 11 22 33 44.</p><p><strong>B.</strong> Étudiante donne cours d'anglais, 15 € l'heure.</p><p><strong>C.</strong> Appartement 2 pièces à louer, centre-ville, 550 € par mois.</p><p><strong>D.</strong> Restaurant cherche serveur pour le week-end.</p><p><strong>E.</strong> Chat perdu, noir et blanc, quartier de la gare.</p><p><strong>F.</strong> Club de football cherche joueurs, 18 à 30 ans, entraînement le jeudi soir.</p>",
    cau: [
      ghep("Associez chaque personne à une annonce.",
        ["Marc veut travailler le samedi et le dimanche.", "Léa veut apprendre l'anglais.", "Karim cherche un logement en ville.", "Tom, 22 ans, aime le sport en équipe."],
        ["Annonce A", "Annonce B", "Annonce C", "Annonce D", "Annonce E", "Annonce F"],
        [3, 1, 2, 5]),
    ] },
  { tieuDe: "Lecture A1 · Đề 1 · Exercice 4 : un mot de la voisine",
    consigne: "<p>Vous trouvez ce mot sur votre porte. Lisez le document puis répondez aux questions.</p>",
    readingText: "<p>Bonjour,</p><p>Je suis votre nouvelle voisine, au deuxième étage. Je m'appelle Anna. Samedi prochain, je fais des travaux dans ma cuisine, de 9 h à 17 h. Excusez-moi pour le bruit !</p><p>Pour m'excuser, je vous invite à prendre un thé chez moi dimanche, à 16 h. Mon appartement, c'est le numéro 24.</p><p>À bientôt,<br>Anna</p>",
    cau: [
      qcm("Anna habite…", "au deuxième étage", ["au premier étage", "au rez-de-chaussée"], "« au deuxième étage »."),
      qcm("Samedi, Anna va…", "faire des travaux dans sa cuisine", ["déménager", "faire une fête"], "« je fais des travaux dans ma cuisine »."),
      qcm("Anna vous invite à…", "prendre un thé", ["dîner", "aller au cinéma"], "« je vous invite à prendre un thé »."),
      qcm("Le numéro de l'appartement d'Anna est le…", "24", ["2", "16"], "« c'est le numéro 24 »."),
    ] },
];

/* ───────────── PRODUCTION ÉCRITE ───────────── */
const PE = { title: "[NHÁP] Production écrite A1 · Đề 1", level: "A1", skills: ["Production écrite"], timeLimit: 30,
  consigne: "<p><strong>Exercice 1.</strong> Vous voulez vous inscrire dans une école de langues. Remplissez le formulaire.</p><p><strong>Exercice 2.</strong> Vous êtes en vacances. Vous écrivez une carte postale à un ami : vous dites où vous êtes, avec qui, le temps qu'il fait et ce que vous faites. (<strong>40 mots minimum</strong>)</p>",
  questions: [
    { id: id("q"), type: "formulaire", prompt: "Exercice 1 : remplissez le formulaire d'inscription.",
      champs: ["Nom", "Prénom", "Nationalité", "Âge", "Adresse", "Profession", "Langue que vous voulez apprendre", "Jours disponibles"].map((nhan) => ({ id: id("f"), nhan })) },
    { id: id("q"), type: "open", prompt: "Exercice 2 : écrivez votre carte postale (40 mots minimum)." },
  ] };

/* ───────────── PRODUCTION ORALE ───────────── */
const PO = { title: "[NHÁP] Production orale A1 · Đề 1", level: "A1", skills: ["Production orale"],
  consigne: "<p>Production orale : 5 à 7 minutes, 10 minutes de préparation pour les parties 2 et 3.</p><p><strong>1. Entretien dirigé</strong> (environ 1 minute, sans préparation) : présentez-vous. Votre nom, votre âge, votre pays, votre famille, vos goûts.</p><p><strong>2. Échange d'informations</strong> (environ 2 minutes) : posez des questions à l'examinateur avec ces mots : <em>habiter • travail • sport • week-end • musique • animal</em>.</p><p><strong>3. Dialogue simulé</strong> (environ 2 minutes) : vous êtes dans une boulangerie. Vous achetez du pain et des gâteaux pour un repas de famille. Vous demandez les prix et vous payez. L'examinateur joue le rôle du boulanger.</p>",
  questions: [] };

/* ───────────── SQL ───────────── */
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const chung = { usageType: "assignment", targeted: true, assignedTo: ["__nhap__"], assignedClasses: [], assignedExtra: [] };
const ghi = (ex) => {
  const { exRow, qRows } = toRows(ex, "assignment");
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  if (!qRows.length) { ra.push(`insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")});`); return; }
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
};

const PHAN = []; // [code, exercise_id, minutes, points]
const kq = await Promise.all(CO.map((b) => fetch(URL_FN, { method: "POST",
  headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify({ ten: b.ten, doan: b.doan }) }).then((r) => r.json())));
CO.forEach((b, k) => {
  if (!kq[k].ok) { console.error(b.ten, kq[k]); process.exit(1); }
  console.error(`✔ ${b.ten}: ${Math.round(kq[k].so_byte / 1024)} KB`);
  const ex = { ...chung, id: id("nhap"), title: "[NHÁP] " + b.tieuDe, level: "A1", skills: ["Écoute"],
    consigne: b.consigne + DOC, audioUrl: kq[k].url, questions: b.cau, createdAt: Date.now() };
  ghi(ex); PHAN.push(["CO", ex.id, k ? 0 : 20, k ? 0 : 25]);
});
CE.forEach((b, k) => {
  const ex = { ...chung, id: id("nhap"), title: "[NHÁP] " + b.tieuDe, level: "A1", skills: ["Lecture"],
    consigne: b.consigne, readingText: b.readingText, questions: b.cau, createdAt: Date.now() };
  ghi(ex); PHAN.push(["CE", ex.id, k ? 0 : 30, k ? 0 : 25]);
});
for (const [code, b, m, p] of [["PE", PE, 30, 25], ["PO", PO, 10, 0]]) {
  const ex = { ...chung, ...b, id: id("nhap"), createdAt: Date.now() };
  ghi(ex); PHAN.push([code, ex.id, m, p]);
}
ra.push(`with e as (insert into public.exams (title, level, duration_min, is_published, created_by) values ('[NHÁP] DELF A1 · Đề 1', 'A1', 90, false, ${q(GV)}) returning id) insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord) select (select id from e), v.code, v.ex, v.m, v.p, v.o from (values ${PHAN.map(([c, e, m, p], i) => `(${q(c)}, ${q(e)}, ${m}, ${p}, ${i})`).join(", ")}) as v(code, ex, m, p, o);`);
console.log(ra.join("\n"));
