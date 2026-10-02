/* Lô 4 (02/10) — hai đề thi thử A2 và C1, NHÁP.
 *
 * Đề chỉ THAM CHIẾU bài trong thư viện (CLAUDE.md, « Đề thi thử do giáo viên
 * soạn »), nên lô này tạo:
 *   · bài nháp mới cho từng phần còn thiếu: Đọc hiểu, Viết, Nói;
 *   · hai dòng `exams` ở trạng thái CHƯA PHÁT HÀNH, ghép các bài đó.
 *
 * THIẾU PHẦN NGHE (CO): không có file âm thanh A2/C1. Đề thiếu CO mà phát hành
 * thì tổng tối đa còn 50/75, và luật đạt (≥ 50) bắt học sinh phải tuyệt đối —
 * kết luận đạt/trượt sai. Nên đề nằm nháp cho tới khi giáo viên ghép một bài CO.
 *
 * C1 là DALF, không phải DELF. Ở đây giữ khuôn 4 phần × 25 của hệ thống; bài
 * viết là MỘT essai (DALF thật có thêm phần tổng hợp tài liệu), chấm bằng thang
 * C1 phỏng theo trong delfGrille.js.
 *
 * Chạy: node scripts/nhap/lo4_de_thi.mjs <uuid_giao_vien> > lo4.sql */
import { toRows } from "../../src/shared/exerciseMap.js";

const GIAO_VIEN = process.argv[2];
if (!/^[0-9a-f-]{36}$/.test(GIAO_VIEN || "")) { console.error("Cần uuid giáo viên"); process.exit(1); }

let dem = 0;
const id = (tien) => `${tien}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261002;
const ngauNhien = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, options, answer, explanation) => {
  let o = options.map((x, i) => ({ x, d: i === answer }));
  if (o.length > 2) for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(ngauNhien() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const open = (prompt) => ({ id: id("q"), type: "open", prompt });

const A2_CE = { title: "Lecture A2 : le programme d'une maison de quartier", level: "A2", skills: ["Lecture"], timeLimit: 30,
  consigne: "Lisez le programme, puis répondez aux questions.",
  readingText: "<p><strong>Maison de quartier des Lilas — Programme d'octobre</strong></p><p><strong>Atelier cuisine du monde</strong> — le mercredi de 18 h à 20 h. Chaque semaine, un habitant présente une recette de son pays. Participation : 5 € (ingrédients compris). Inscription obligatoire à l'accueil.</p><p><strong>Club de lecture</strong> — le premier samedi du mois, à 10 h. Gratuit. Ce mois-ci, on parle d'un roman policier. Café et croissants offerts.</p><p><strong>Cours d'informatique pour débutants</strong> — le lundi et le jeudi de 14 h à 16 h. Apprenez à envoyer un courriel et à faire des démarches en ligne. 30 € pour le mois. Apportez votre ordinateur portable si vous en avez un.</p><p><strong>Sortie au marché de producteurs</strong> — dimanche 19 octobre, départ à 8 h 30 devant la maison de quartier. Transport en minibus : 3 €. Places limitées à 12 personnes.</p><p>Accueil ouvert du mardi au samedi, de 9 h à 18 h. Téléphone : 04 72 00 00 00.</p>",
  questions: [
    qcm("Quand a lieu l'atelier cuisine ?", ["Le mercredi soir", "Le lundi après-midi", "Le samedi matin", "Le dimanche"], 0, "« le mercredi de 18 h à 20 h »."),
    qcm("Combien coûte l'atelier cuisine ?", ["Gratuit", "3 €", "5 €", "30 €"], 2, "« Participation : 5 € (ingrédients compris) »."),
    qcm("Pour l'atelier cuisine, il faut :", ["apporter les ingrédients", "s'inscrire à l'accueil", "venir avec un ami", "téléphoner le dimanche"], 1, "« Inscription obligatoire à l'accueil »."),
    qcm("Le club de lecture est gratuit.", ["Vrai", "Faux"], 0, "« Gratuit »."),
    qcm("Dans le cours d'informatique, on apprend à :", ["réparer un ordinateur", "envoyer un courriel", "créer un site", "jouer en ligne"], 1, "« Apprenez à envoyer un courriel et à faire des démarches en ligne »."),
    qcm("Combien de fois par semaine a lieu le cours d'informatique ?", ["Une fois", "Deux fois", "Trois fois", "Tous les jours"], 1, "« le lundi et le jeudi »."),
    qcm("À quelle heure part la sortie au marché ?", ["8 h", "8 h 30", "9 h", "10 h"], 1, "« départ à 8 h 30 »."),
    qcm("Combien de personnes peuvent participer à la sortie ?", ["5", "10", "12", "30"], 2, "« Places limitées à 12 personnes »."),
    qcm("Vous voulez vous inscrire un lundi. C'est possible à l'accueil.", ["Vrai", "Faux"], 1, "Faux : l'accueil est ouvert « du mardi au samedi »."),
  ] };

const A2_PE = { title: "Production écrite A2 — Un week-end et une invitation", level: "A2", skills: ["Production écrite"], timeLimit: 45,
  consigne: "<p>Cette épreuve comporte deux exercices.</p><p><strong>Exercice 1.</strong> Vous avez passé un week-end dans une ville que vous ne connaissiez pas. Vous écrivez un message à un ami français : vous racontez ce que vous avez fait et vous dites ce que vous avez aimé ou pas aimé. (60 mots minimum)</p><p><strong>Exercice 2.</strong> Votre amie Julie vous invite à son anniversaire samedi soir, mais vous ne pouvez pas venir. Vous lui répondez : vous la remerciez, vous vous excusez, vous expliquez pourquoi et vous proposez une autre date. (60 mots minimum)</p>",
  questions: [
    open("Exercice 1 — Racontez votre week-end à votre ami (60 mots minimum)."),
    open("Exercice 2 — Répondez à l'invitation de Julie (60 mots minimum)."),
  ] };

const A2_PO = { title: "Production orale A2 — Se présenter, parler de ses habitudes, acheter", level: "A2", skills: ["Production orale"],
  consigne: "Production orale — 6 à 8 minutes (10 min de préparation pour les parties 2 et 3).\n   1. Entretien dirigé (1 min 30) — Présentez-vous : votre nom, votre âge, votre famille, vos études ou votre travail, vos loisirs.\n   2. Monologue suivi (2 min) — Parlez d'une journée typique : à quelle heure vous vous levez, ce que vous faites le matin, l'après-midi, le soir. Qu'est-ce que vous préférez dans la journée ? Pourquoi ?\n   3. Exercice en interaction (3 à 4 min) — Vous êtes dans une boutique de vêtements. Vous voulez acheter un cadeau pour un ami. Vous demandez des conseils, le prix, les tailles et les couleurs, puis vous payez.",
  questions: [] };

const C1_CE = { title: "Lecture C1 : la ville à l'heure du télétravail", level: "C1", skills: ["Lecture"], timeLimit: 50,
  consigne: "Lisez le texte, puis répondez aux questions.",
  readingText: "<p><strong>La ville à l'heure du télétravail : une révolution en trompe-l'œil ?</strong></p><p>On a beaucoup annoncé, au lendemain de la crise sanitaire, l'exode massif des cadres vers les villes moyennes et les campagnes. Le télétravail, devenu pratique courante dans de nombreux secteurs, devait rendre caduque la nécessité de vivre à proximité de son lieu de travail. Quelques années plus tard, le bilan est plus contrasté que ne le laissaient présager les prophéties de l'époque.</p><p>Certes, certaines villes situées à une ou deux heures des grandes métropoles ont vu leur population augmenter et les prix de l'immobilier s'envoler, au point de fragiliser les ménages locaux, désormais évincés du marché. Mais ce mouvement reste circonscrit : il concerne avant tout des actifs qualifiés, dont le métier se prête au travail à distance, et qui conservent de surcroît un pied-à-terre ou des allers-retours réguliers vers la capitale. Loin d'un exode, il s'agirait plutôt d'une recomposition des modes de vie, à l'échelle de quelques milliers de foyers.</p><p>Les métropoles, elles, s'adaptent. Les surfaces de bureaux se contractent, les entreprises privilégient des locaux plus petits mais mieux situés, et certains quartiers d'affaires, désertés le vendredi, s'interrogent sur leur avenir. Des urbanistes y voient une occasion inespérée : reconvertir une partie de ces bureaux en logements permettrait de répondre à la pénurie sans artificialiser de nouveaux sols. Encore faut-il que les contraintes techniques — épaisseur des bâtiments, absence de balcons, normes de ventilation — ne rendent pas l'opération prohibitive.</p><p>Reste une question que le débat a longtemps occultée : celle des inégalités. Le télétravail demeure un privilège réservé à environ un tiers des actifs. Infirmiers, caissiers, ouvriers ou livreurs n'ont jamais eu le choix. En reconfigurant la ville autour des besoins de ceux qui peuvent travailler de chez eux, on risque d'accentuer une fracture déjà profonde entre deux catégories de travailleurs.</p>",
  questions: [
    qcm("Selon l'auteur, les prévisions faites après la crise sanitaire :", ["se sont entièrement réalisées", "étaient exagérées", "concernaient seulement les campagnes", "ont été confirmées par les urbanistes"], 1, "« le bilan est plus contrasté que ne le laissaient présager les prophéties » → les prévisions étaient exagérées."),
    qcm("Dans le texte, « rendre caduque » signifie :", ["rendre obsolète", "rendre obligatoire", "rendre plus coûteuse", "rendre plus facile"], 0, "caduc = qui n'a plus de valeur, dépassé."),
    qcm("Quelle conséquence négative de l'arrivée de nouveaux habitants dans les villes moyennes est évoquée ?", ["La hausse du chômage", "La hausse des prix de l'immobilier pour les habitants locaux", "La fermeture des commerces", "La pollution"], 1, "« les prix de l'immobilier s'envoler, au point de fragiliser les ménages locaux »."),
    qcm("D'après l'auteur, le mouvement vers les villes moyennes concerne surtout :", ["les retraités", "les étudiants", "des actifs qualifiés pouvant télétravailler", "les familles nombreuses"], 2, "« il concerne avant tout des actifs qualifiés, dont le métier se prête au travail à distance »."),
    qcm("L'auteur préfère parler de :", ["exode massif", "recomposition des modes de vie", "fin des métropoles", "retour à la campagne"], 1, "« Loin d'un exode, il s'agirait plutôt d'une recomposition des modes de vie »."),
    qcm("Quel avantage les urbanistes voient-ils à la transformation de bureaux en logements ?", ["Elle rapporte des impôts", "Elle évite de construire sur de nouveaux sols", "Elle est techniquement simple", "Elle attire les entreprises"], 1, "« sans artificialiser de nouveaux sols »."),
    qcm("La phrase « Encore faut-il que… » introduit :", ["une condition, une réserve", "une conséquence", "un exemple", "une conclusion définitive"], 0, "« Encore faut-il que » pose une condition qui nuance l'enthousiasme."),
    qcm("Quelle question, selon l'auteur, a été négligée dans le débat ?", ["Le coût des transports", "Les inégalités entre travailleurs", "La qualité des bureaux", "L'avenir des campagnes"], 1, "« Reste une question que le débat a longtemps occultée : celle des inégalités »."),
    qcm("Quelle proportion des actifs peut télétravailler selon le texte ?", ["Environ un quart", "Environ un tiers", "La moitié", "Les deux tiers"], 1, "« environ un tiers des actifs »."),
    qcm("Le ton général de l'auteur est :", ["enthousiaste", "nuancé et critique", "indifférent", "humoristique"], 1, "Il relativise les prévisions, pèse avantages et limites, et termine sur un risque : ton nuancé, critique."),
  ] };

const C1_PE = { title: "Production écrite C1 — Essai argumenté : le télétravail", level: "C1", skills: ["Production écrite"], timeLimit: 150,
  consigne: "<p>Dans le cadre d'un dossier publié par un magazine d'actualité, vous rédigez un <strong>essai argumenté</strong> (environ 250 mots) sur la question suivante :</p><p><em>« Le télétravail est-il une avancée sociale ou un facteur de nouvelles inégalités ? »</em></p><p>Vous prendrez position de manière nuancée, en vous appuyant sur des arguments et des exemples précis, et vous donnerez un titre à votre texte.</p>",
  questions: [open("Rédigez votre essai argumenté (environ 250 mots), avec un titre.")] };

const C1_PO = { title: "Production orale C1 — Exposé et débat : la ville de demain", level: "C1", skills: ["Production orale"],
  consigne: "Production orale — environ 30 minutes (60 min de préparation).\n   1. Exposé (environ 10 min) — À partir du texte « La ville à l'heure du télétravail » (épreuve de lecture), dégagez une problématique et présentez un exposé structuré : introduction, plan en deux ou trois parties, conclusion. Vous ne devez pas résumer le texte mais l'utiliser pour construire votre réflexion.\n   2. Débat (environ 20 min) — L'examinateur vous interroge pour vous amener à préciser, nuancer ou défendre votre position. Sujets possibles : faut-il limiter le télétravail ? Les bureaux vides doivent-ils devenir des logements ? Comment réduire l'écart entre métiers « télétravaillables » et les autres ?",
  questions: [] };

/* Mỗi câu lệnh phải nằm trên MỘT dòng (chạy từng dòng qua db query): xuống
   dòng trong chuỗi đổi thành chr(10). Lần chạy đầu dính đúng chỗ này. */
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const ids = {};
for (const [khoa, b] of Object.entries({ A2_CE, A2_PE, A2_PO, C1_CE, C1_PE, C1_PO })) {
  const ex = { ...b, id: id("nhap"), title: "[NHÁP] " + b.title, usageType: "assignment",
    targeted: true, assignedTo: ["__nhap__"], assignedClasses: [], assignedExtra: [], createdAt: Date.now() };
  ids[khoa] = ex.id;
  const { exRow, qRows } = toRows(ex, "assignment");
  const cot = Object.keys(exRow);
  const giaTri = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  if (!qRows.length) { ra.push(`insert into public.exercises (${cot.join(", ")}) values (${giaTri.join(", ")})`); continue; }
  const dong = qRows.map((r) => `(${q(r.id)}, ${q(r.exercise_id)}, ${r.ord}, ${q(r.type)}, ${q(r.prompt)}, ${j(r.payload)}, ${j(r.answer_key)}, ${q(r.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${giaTri.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation)`);
}

/* Phút và điểm theo đề thật: A2 — CE 30', PE 45', PO ~8' (không chấm);
   C1 — CE 50', PE 150', PO 30' (không chấm, cùng quy ước toàn hệ thống). */
const de = (ten, cap, phan) => {
  const tong = phan.reduce((n, p) => n + p[2], 0);
  const dong = phan.map(([code, ex, phut, diem], i) => `((select id from e), ${q(code)}, ${q(ex)}, ${phut}, ${diem}, ${i})`).join(", ");
  return `with e as (insert into public.exams (title, level, duration_min, is_published, created_by) values (${q(ten)}, ${q(cap)}, ${tong}, false, ${q(GIAO_VIEN)}) returning id) insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord) values ${dong}`;
};
ra.push(de("[NHÁP] DELF A2 — Đề 1 (thiếu phần Nghe)", "A2", [["CE", ids.A2_CE, 30, 25], ["PE", ids.A2_PE, 45, 25], ["PO", ids.A2_PO, 8, 0]]));
ra.push(de("[NHÁP] DALF C1 — Đề 1 (thiếu phần Nghe)", "C1", [["CE", ids.C1_CE, 50, 25], ["PE", ids.C1_PE, 150, 25], ["PO", ids.C1_PO, 30, 0]]));
console.log(ra.join("\n"));
