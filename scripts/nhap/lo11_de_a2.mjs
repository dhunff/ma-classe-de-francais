/* Lô 11 (07/10): đề DELF A2 NHÁP · Đề 2, theo format 2, NGHE KIỂU PHÒNG THI.
 *
 *   CO 25'  : 4 bài, 20 câu (5 + 5 + 6 QCM, bài 4 ghép 4 hội thoại ↔ 6 tình huống).
 *   CE 30'  : 4 bài, 20 câu (bài 1 ghép 5 người ↔ 7 hoạt động; bài 2–4 QCM).
 *   PE 45'  : 2 bài tự luận, mỗi bài ≥ 60 từ.
 *   PO 6–8' : 3 phần (10' chuẩn bị), không chấm.
 *
 * ══ FILE NGHE KIỂU PHÒNG THI ══
 * Mỗi bài nghe là MỘT file dựng theo trình tự đề DELF:
 *
 *   giới thiệu bài ("Exercice 1. Vous allez entendre deux fois…")
 *   → im lặng ĐỌC CÂU HỎI          (DOC_CAU giây)
 *   → « Première écoute. » + tài liệu
 *   → « Vous avez … pour commencer à répondre. » + im lặng (NGHI giây)
 *   → « Deuxième écoute. » + tài liệu
 *   → « Vous avez … pour compléter vos réponses. » + im lặng (HOAN_THANH giây)
 *   → « Fin de l'exercice. »
 *
 * Cờ `ngheKieuThi` làm màn thi thử chỉ cho phát MỘT lần (migration 119).
 * Ghép bằng ffmpeg-static (trong thư mục nháp), tải lên kho `nghe` qua chế độ
 * `taiLen` của tao-audio.
 *
 * Chạy: TTS_ADMIN_TOKEN=… FFMPEG=…/ffmpeg.exe node scripts/nhap/lo11_de_a2.mjs <uuid_gv> > lo11.sql */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toRows } from "../../src/shared/exerciseMap.js";

const GV = process.argv[2];
if (!/^[0-9a-f-]{36}$/.test(GV || "")) { console.error("Cần uuid giáo viên"); process.exit(1); }
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
const ANON = env.VITE_SUPABASE_ANON_KEY;
const TOKEN = process.env.TTS_ADMIN_TOKEN;
const FFMPEG = process.env.FFMPEG;
if (!TOKEN || !FFMPEG) { console.error("Thiếu TTS_ADMIN_TOKEN hoặc FFMPEG"); process.exit(1); }

/* Thời lượng các khoảng im lặng (giây). Ghi y hệt trong lời đọc. */
const DOC_CAU = 30, NGHI = 30, HOAN_THANH = 30;

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261008;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const ghep = (prompt, items, choix, dap) => {
  const I = items.map((texte) => ({ id: id("i"), texte }));
  const C = choix.map((texte) => ({ id: id("c"), texte }));
  return { id: id("q"), type: "apparier", prompt, items: I, choix: C, answers: Object.fromEntries(I.map((x, k) => [x.id, C[dap[k]].id])) };
};

const CHAM = "Parle en français de France, lentement et clairement, pour des apprenants de niveau A2.";
const THUONG = "Parle en français de France, débit naturel mais clair.";
const RADIO = "Parle en français de France, comme un animateur de radio, débit naturel.";
const GIAM_KHAO = "Parle en français de France, ton neutre et posé, comme les consignes d'un examen officiel.";

/* ───────────── COMPRÉHENSION DE L'ORAL ───────────── */
const CO = [
  { ten: "a2-de2-co1", so: "un", tieuDe: "Écoute A2 · Đề 2 · Exercice 1 : un message du cabinet médical",
    gioiThieu: "Vous écoutez un message sur votre répondeur téléphonique.",
    doan: [{ giong: "shimmer", cach: CHAM, chu: "Bonjour, ici le cabinet du docteur Moreau. Votre rendez-vous de mardi à dix heures est annulé, parce que le docteur est malade. Nous vous proposons un nouveau rendez-vous jeudi à quinze heures trente. Si cet horaire ne vous convient pas, vous pouvez prendre rendez-vous sur notre site internet. N'oubliez pas votre carte vitale et vos dernières analyses de sang. Merci et bonne journée." }],
    cau: [
      qcm("Qui laisse ce message ?", "le cabinet d'un médecin", ["une pharmacie", "un hôpital"], "« ici le cabinet du docteur Moreau »."),
      qcm("Pourquoi le rendez-vous de mardi est-il annulé ?", "Le docteur est malade.", ["Le docteur est en vacances.", "Le cabinet est fermé pour travaux."], "« parce que le docteur est malade »."),
      qcm("Quel nouveau rendez-vous propose-t-on ?", "jeudi à 15 h 30", ["mardi à 15 h 30", "jeudi à 10 h"], "« jeudi à quinze heures trente »."),
      qcm("Si l'horaire ne convient pas, vous pouvez…", "prendre rendez-vous sur internet", ["rappeler le soir", "venir sans rendez-vous"], "« vous pouvez prendre rendez-vous sur notre site internet »."),
      qcm("Qu'est-ce qu'il faut apporter ?", "la carte vitale et des analyses", ["une ordonnance et de l'argent", "une photo d'identité"], "« votre carte vitale et vos dernières analyses de sang »."),
    ] },
  { ten: "a2-de2-co2", so: "deux", tieuDe: "Écoute A2 · Đề 2 · Exercice 2 : une annonce à l'aéroport",
    gioiThieu: "Vous êtes à l'aéroport. Vous entendez une annonce.",
    doan: [{ giong: "sage", cach: CHAM, chu: "Mesdames et messieurs, votre attention s'il vous plaît. Les passagers du vol AF 214 à destination de Montréal sont priés de se présenter à la porte vingt-trois, et non à la porte douze. L'embarquement commencera à seize heures quinze. Nous rappelons que chaque passager peut prendre un seul bagage à main de dix kilos maximum. Les familles avec de jeunes enfants embarqueront en premier. Nous vous souhaitons un agréable voyage." }],
    cau: [
      qcm("Le vol va à…", "Montréal", ["Marseille", "Madrid"], "« à destination de Montréal »."),
      qcm("Les passagers doivent aller à la porte…", "23", ["12", "32"], "« à la porte vingt-trois, et non à la porte douze »."),
      qcm("L'embarquement commence à…", "16 h 15", ["15 h 16", "16 h 50"], "« à seize heures quinze »."),
      qcm("Chaque passager peut prendre…", "un bagage à main de 10 kg maximum", ["deux bagages à main", "un bagage à main de 20 kg"], "« un seul bagage à main de dix kilos maximum »."),
      qcm("Qui embarque en premier ?", "les familles avec de jeunes enfants", ["les personnes âgées", "les passagers en première classe"], "« Les familles avec de jeunes enfants embarqueront en premier »."),
    ] },
  { ten: "a2-de2-co3", so: "trois", tieuDe: "Écoute A2 · Đề 2 · Exercice 3 : une émission sur le vélo en ville",
    gioiThieu: "Vous écoutez une émission à la radio.",
    doan: [
      { giong: "coral", cach: RADIO, chu: "Bonjour à tous ! Aujourd'hui, nous parlons du vélo en ville avec Hugo, trente-deux ans. Hugo, vous allez au travail à vélo ?" },
      { giong: "ash", cach: THUONG, chu: "Oui, depuis deux ans. Avant, je prenais la voiture et je perdais une heure dans les embouteillages chaque matin. Maintenant, je mets vingt minutes." },
      { giong: "coral", cach: RADIO, chu: "Et quand il pleut ?" },
      { giong: "ash", cach: THUONG, chu: "J'ai un bon imperméable ! Mais quand il neige, je prends le tramway. Le vélo, c'est aussi bon pour la santé : j'ai perdu cinq kilos la première année." },
      { giong: "coral", cach: RADIO, chu: "Et votre vélo, il vous a coûté cher ?" },
      { giong: "ash", cach: THUONG, chu: "Non, je l'ai acheté d'occasion, cent cinquante euros. Et la mairie m'a donné une aide de cinquante euros. Mon conseil : achetez un bon antivol ! On m'a déjà volé un vélo devant la gare." },
    ],
    cau: [
      qcm("Depuis combien de temps Hugo va-t-il au travail à vélo ?", "deux ans", ["deux mois", "cinq ans"], "« depuis deux ans »."),
      qcm("Avant, Hugo allait au travail…", "en voiture", ["en tramway", "à pied"], "« Avant, je prenais la voiture »."),
      qcm("Maintenant, il met combien de temps ?", "20 minutes", ["une heure", "10 minutes"], "« Maintenant, je mets vingt minutes »."),
      qcm("Quand il neige, Hugo…", "prend le tramway", ["prend sa voiture", "reste à la maison"], "« quand il neige, je prends le tramway »."),
      qcm("Combien Hugo a-t-il payé son vélo ?", "150 €", ["50 €", "500 €"], "« d'occasion, cent cinquante euros »."),
      qcm("Quel conseil donne Hugo ?", "acheter un bon antivol", ["acheter un vélo neuf", "porter un casque"], "« achetez un bon antivol ! »."),
    ] },
  { ten: "a2-de2-co4", so: "quatre", tieuDe: "Écoute A2 · Đề 2 · Exercice 4 : quatre dialogues",
    gioiThieu: "Vous allez entendre quatre petits dialogues. Associez chaque dialogue à la bonne situation. Attention, il y a six situations mais seulement quatre dialogues.",
    doan: [
      { giong: "sage", cach: GIAM_KHAO, chu: "Dialogue un." },
      { giong: "nova", cach: THUONG, chu: "Excusez-moi, ce pull est trop petit. Je peux l'échanger contre une taille plus grande ?" },
      { giong: "echo", cach: THUONG, chu: "Bien sûr. Vous avez le ticket de caisse ?" },
      { giong: "sage", cach: GIAM_KHAO, chu: "Dialogue deux." },
      { giong: "ash", cach: THUONG, chu: "Allô, je vous appelle parce que je suis en retard. Il y a un accident sur l'autoroute." },
      { giong: "shimmer", cach: THUONG, chu: "Ce n'est pas grave, la réunion commence à dix heures. On vous attend." },
      { giong: "sage", cach: GIAM_KHAO, chu: "Dialogue trois." },
      { giong: "coral", cach: THUONG, chu: "Tu viens au cinéma avec nous samedi soir ?" },
      { giong: "onyx", cach: THUONG, chu: "Désolé, je ne peux pas, je travaille. Mais dimanche, je suis libre !" },
      { giong: "sage", cach: GIAM_KHAO, chu: "Dialogue quatre." },
      { giong: "echo", cach: THUONG, chu: "Bonjour, je cherche un appartement avec deux chambres, près d'une école." },
      { giong: "nova", cach: THUONG, chu: "J'ai quelque chose pour vous : un trois pièces dans le quartier Saint-Michel, à huit cents euros par mois." },
    ],
    cau: [
      ghep("Associez chaque dialogue à la situation.", ["Dialogue 1", "Dialogue 2", "Dialogue 3", "Dialogue 4"],
        ["Refuser une invitation", "Échanger un vêtement", "Chercher un logement", "Prendre un rendez-vous chez le dentiste", "Prévenir d'un retard", "Commander un repas"],
        [1, 4, 0, 2]),
    ] },
];

/* ───────────── COMPRÉHENSION DES ÉCRITS ───────────── */
const CE = [
  { tieuDe: "Lecture A2 · Đề 2 · Exercice 1 : activités du centre culturel",
    consigne: "<p>Cinq personnes cherchent une activité. Lisez le programme du centre culturel et associez chaque personne à une activité. Attention : il y a sept activités mais seulement cinq personnes.</p>",
    readingText: "<p><strong>A.</strong> Atelier cuisine du monde : le samedi de 10 h à 12 h. Chaque semaine, un nouveau pays.</p><p><strong>B.</strong> Club photo : sorties en ville le dimanche matin. Apportez votre appareil.</p><p><strong>C.</strong> Cours de guitare pour débutants : le mardi soir, de 19 h à 20 h.</p><p><strong>D.</strong> Yoga doux pour les plus de 60 ans : le lundi et le jeudi matin.</p><p><strong>E.</strong> Théâtre pour enfants de 6 à 10 ans : le mercredi après-midi.</p><p><strong>F.</strong> Conversation en espagnol : le vendredi soir, autour d'un café.</p><p><strong>G.</strong> Atelier informatique : apprendre à utiliser internet et les courriels, le jeudi après-midi.</p>",
    cau: [
      ghep("Associez chaque personne à une activité.",
        ["Mme Dupont, 68 ans, veut faire du sport sans se fatiguer.", "Lucas veut apprendre à jouer de la musique après le travail.", "Nadia part bientôt à Madrid et veut parler la langue.", "M. Petit ne sait pas envoyer un courriel à ses petits-enfants.", "Emma cherche une activité pour sa fille de 8 ans."],
        ["Activité A", "Activité B", "Activité C", "Activité D", "Activité E", "Activité F", "Activité G"],
        [3, 2, 5, 6, 4]),
    ] },
  { tieuDe: "Lecture A2 · Đề 2 · Exercice 2 : un courriel de Clara",
    consigne: "<p>Vous recevez ce courriel d'une amie. Lisez le document puis répondez aux questions.</p>",
    readingText: "<p><strong>Objet :</strong> Nouvelles de Bordeaux</p><p>Salut Thomas,</p><p>Ça fait un mois que je suis à Bordeaux pour mon nouveau travail ! Je travaille dans une agence de voyages, près de la cathédrale. Mes collègues sont très sympathiques, mais les journées sont longues : je finis souvent à dix-neuf heures.</p><p>J'ai trouvé un petit studio au troisième étage, sans ascenseur. Il est un peu cher, mais il a un joli balcon. Le week-end, je visite la région à vélo. Samedi dernier, je suis allée jusqu'à la mer : quatre-vingts kilomètres !</p><p>Tu veux venir me voir au mois de mai ? Il y a un canapé-lit pour toi.</p><p>Bises,<br>Clara</p>",
    cau: [
      qcm("Clara habite à Bordeaux depuis…", "un mois", ["un an", "une semaine"], "« Ça fait un mois que je suis à Bordeaux »."),
      qcm("Où travaille Clara ?", "dans une agence de voyages", ["dans une cathédrale", "dans un hôtel"], "« dans une agence de voyages »."),
      qcm("Qu'est-ce que Clara dit de son travail ?", "Les journées sont longues.", ["Ses collègues ne sont pas gentils.", "Elle finit tôt."], "« les journées sont longues »."),
      qcm("Comment est le studio de Clara ?", "un peu cher, avec un balcon", ["grand, avec un ascenseur", "au rez-de-chaussée"], "« Il est un peu cher, mais il a un joli balcon »."),
      qcm("Clara propose à Thomas de…", "venir la voir en mai", ["faire du vélo samedi", "travailler avec elle"], "« Tu veux venir me voir au mois de mai ? »."),
    ] },
  { tieuDe: "Lecture A2 · Đề 2 · Exercice 3 : le règlement de la médiathèque",
    consigne: "<p>Vous lisez le règlement de la médiathèque de votre quartier. Lisez le document puis répondez aux questions.</p>",
    readingText: "<p><strong>MÉDIATHÈQUE JEAN-MOULIN : RÈGLEMENT</strong></p><p><strong>Inscription :</strong> gratuite pour les moins de 18 ans et les étudiants ; 12 € par an pour les adultes. Apportez une pièce d'identité et un justificatif de domicile.</p><p><strong>Prêt :</strong> 6 livres et 2 DVD maximum, pour trois semaines. Vous pouvez prolonger une fois sur notre site internet.</p><p><strong>Retard :</strong> après une semaine de retard, vous ne pouvez plus emprunter pendant un mois.</p><p><strong>Sur place :</strong> wifi gratuit, salle de travail silencieuse. Les boissons sont autorisées, mais pas la nourriture.</p>",
    cau: [
      qcm("Pour un étudiant, l'inscription coûte…", "0 €", ["12 €", "6 €"], "« gratuite pour les moins de 18 ans et les étudiants »."),
      qcm("Pour s'inscrire, il faut apporter…", "une pièce d'identité et un justificatif de domicile", ["une photo", "un livre"], "« Apportez une pièce d'identité et un justificatif de domicile »."),
      qcm("On peut emprunter…", "6 livres et 2 DVD", ["2 livres et 6 DVD", "autant de livres qu'on veut"], "« 6 livres et 2 DVD maximum »."),
      qcm("Comment peut-on prolonger un prêt ?", "sur le site internet", ["par téléphone", "on ne peut pas"], "« Vous pouvez prolonger une fois sur notre site internet »."),
      qcm("Dans la médiathèque, il est interdit de…", "manger", ["boire", "utiliser le wifi"], "« Les boissons sont autorisées, mais pas la nourriture »."),
    ] },
  { tieuDe: "Lecture A2 · Đề 2 · Exercice 4 : un article sur un jardin partagé",
    consigne: "<p>Vous lisez cet article dans le journal de votre ville. Lisez le document puis répondez aux questions.</p>",
    readingText: "<p><strong>Un jardin pour tout le quartier</strong></p><p>Depuis le mois d'avril, les habitants du quartier des Tilleuls ont un jardin partagé, derrière l'école primaire. L'idée vient de Fatima, une retraitée de soixante-cinq ans : « Beaucoup de personnes ici vivent en appartement et n'ont pas de jardin. Je voulais créer un lieu pour cultiver des légumes et se rencontrer. »</p><p>Aujourd'hui, trente familles participent. Chaque famille a une petite parcelle, et tout le monde partage les outils. Le mercredi après-midi, les enfants de l'école viennent apprendre à planter des tomates et des salades.</p><p>Le jardin organise une grande fête le 21 juin, avec un repas préparé avec les légumes du jardin. L'entrée est libre.</p>",
    cau: [
      qcm("Où se trouve le jardin ?", "derrière l'école primaire", ["devant la mairie", "à la campagne"], "« derrière l'école primaire »."),
      qcm("Qui a eu l'idée du jardin ?", "une retraitée du quartier", ["le directeur de l'école", "la mairie"], "« L'idée vient de Fatima, une retraitée »."),
      qcm("Pourquoi Fatima a-t-elle créé ce jardin ?", "pour cultiver des légumes et se rencontrer", ["pour vendre des légumes", "pour les touristes"], "« un lieu pour cultiver des légumes et se rencontrer »."),
      qcm("Que font les enfants le mercredi ?", "Ils apprennent à planter des légumes.", ["Ils jouent au football.", "Ils vendent des tomates."], "« les enfants de l'école viennent apprendre à planter »."),
      qcm("La fête du 21 juin est…", "gratuite", ["réservée aux familles du jardin", "payante"], "« L'entrée est libre »."),
    ] },
];

/* ───────────── PRODUCTION ÉCRITE ───────────── */
const PE = { title: "[NHÁP] Production écrite A2 · Đề 2", level: "A2", skills: ["Production écrite"], timeLimit: 45,
  consigne: "<p>Production écrite : 45 minutes. Deux exercices, <strong>60 mots minimum</strong> chacun.</p>",
  questions: [
    { id: id("q"), type: "open", prompt: "Exercice 1 : vous avez passé un week-end dans une ville que vous ne connaissiez pas. Sur votre blog, vous racontez : où vous êtes allé(e), avec qui, ce que vous avez fait et vos impressions. (60 mots minimum)" },
    { id: id("q"), type: "open", prompt: "Exercice 2 : votre collègue Marie vous invite à son pot de départ vendredi soir, mais vous ne pouvez pas venir. Vous lui répondez : vous la remerciez, vous expliquez pourquoi vous ne pouvez pas venir et vous proposez une autre sortie. (60 mots minimum)" },
  ] };

/* ───────────── PRODUCTION ORALE ───────────── */
const PO = { title: "[NHÁP] Production orale A2 · Đề 2", level: "A2", skills: ["Production orale"],
  consigne: "<p>Production orale : 6 à 8 minutes, 10 minutes de préparation pour les parties 2 et 3.</p><p><strong>1. Entretien dirigé</strong> (environ 1 minute 30, sans préparation) : vous parlez de vous, de votre famille, de vos activités, de vos goûts.</p><p><strong>2. Monologue suivi</strong> (environ 2 minutes) : choisissez un sujet. <em>Sujet A</em> : parlez de votre fête préférée. Comment la célébrez-vous ? <em>Sujet B</em> : décrivez un voyage qui vous a plu.</p><p><strong>3. Exercice en interaction</strong> (environ 3 à 4 minutes) : vous voulez vous inscrire dans une salle de sport. Vous posez des questions sur les horaires, les prix et les activités, puis vous choisissez une formule. L'examinateur joue le rôle de l'employé.</p>",
  questions: [] };

/* ───────────── DỰNG FILE NGHE KIỂU THI ───────────── */
const goi = (than) => fetch(URL_FN, { method: "POST",
  headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify(than) }).then((r) => r.json());
const taiVe = async (url, tep) => writeFileSync(tep, Buffer.from(await (await fetch(url)).arrayBuffer()));
const DIR = mkdtempSync(join(tmpdir(), "nghe-a2-"));
const so = (n) => ({ 30: "trente", 20: "vingt", 15: "quinze" }[n] ?? String(n));

/* Lời giám khảo dùng chung cho mọi bài. */
const LOI = {
  e1: `Première écoute.`,
  nghi: `Fin de la première écoute. Vous avez ${so(NGHI)} secondes pour commencer à répondre aux questions.`,
  e2: `Deuxième écoute.`,
  het: `Fin de la deuxième écoute. Vous avez ${so(HOAN_THANH)} secondes pour compléter vos réponses.`,
  xong: `Fin de l'exercice.`,
};
const loiChung = Object.entries(LOI);
const kqChung = await Promise.all(loiChung.map(([k, chu]) => goi({ ten: `thi-loi-a2-${k}`, doan: [{ giong: "sage", cach: GIAM_KHAO, chu }] })));
const tepChung = {};
for (const [i, [k]] of loiChung.entries()) {
  if (!kqChung[i].ok) { console.error(k, kqChung[i]); process.exit(1); }
  tepChung[k] = join(DIR, `loi-${k}.mp3`); await taiVe(kqChung[i].url, tepChung[k]);
}
/* Câu giới thiệu + tài liệu riêng của từng bài. */
const kqBai = await Promise.all(CO.flatMap((b) => [
  goi({ ten: `${b.ten}-gioi-thieu`, doan: [{ giong: "sage", cach: GIAM_KHAO,
    chu: `Exercice ${b.so}. ${b.gioiThieu} Vous allez entendre deux fois le document. Vous avez ${so(DOC_CAU)} secondes pour lire les questions.` }] }),
  goi({ ten: `${b.ten}-tai-lieu`, doan: b.doan }),
]));
const URL_THI = [];
for (const [k, b] of CO.entries()) {
  const [gt, tl] = [kqBai[2 * k], kqBai[2 * k + 1]];
  if (!gt.ok || !tl.ok) { console.error(b.ten, gt, tl); process.exit(1); }
  const fGt = join(DIR, `${b.ten}-gt.mp3`), fTl = join(DIR, `${b.ten}-tl.mp3`);
  await taiVe(gt.url, fGt); await taiVe(tl.url, fTl);
  /* Trình tự: [tệp | im lặng n giây]. */
  const seq = [fGt, DOC_CAU, tepChung.e1, fTl, tepChung.nghi, NGHI, tepChung.e2, fTl, tepChung.het, HOAN_THANH, tepChung.xong];
  const args = ["-y", "-hide_banner", "-loglevel", "error"];
  const nhan = [];
  seq.forEach((x, i) => {
    if (typeof x === "number") args.push("-f", "lavfi", "-t", String(x), "-i", "anullsrc=r=24000:cl=mono");
    else args.push("-i", x);
    nhan.push(`[${i}:a]aresample=24000,aformat=channel_layouts=mono[a${i}]`);
  });
  const out = join(DIR, `${b.ten}.mp3`);
  args.push("-filter_complex", `${nhan.join(";")};${seq.map((_, i) => `[a${i}]`).join("")}concat=n=${seq.length}:v=0:a=1[o]`,
    "-map", "[o]", "-b:a", "64k", out);
  execFileSync(FFMPEG, args);
  const bin = readFileSync(out);
  const up = await goi({ taiLen: true, ten: `${b.ten}-thi`, base64: bin.toString("base64") });
  if (!up.ok) { console.error(b.ten, up); process.exit(1); }
  console.error(`✔ ${b.ten}-thi: ${Math.round(bin.length / 1024)} KB`);
  URL_THI.push(up.url);
}

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
const PHAN = [];
CO.forEach((b, k) => {
  const ex = { ...chung, id: id("nhap"), title: "[NHÁP] " + b.tieuDe, level: "A2", skills: ["Écoute"], ngheKieuThi: true,
    consigne: `<p>${b.gioiThieu} Lisez les questions, puis écoutez le document.</p><p>Comme à l'examen, l'enregistrement contient tout le déroulement : ${DOC_CAU} secondes pour lire les questions, première écoute, ${NGHI} secondes de pause, deuxième écoute, puis ${HOAN_THANH} secondes pour compléter vos réponses.</p>`,
    audioUrl: URL_THI[k], questions: b.cau, createdAt: Date.now() };
  ghi(ex); PHAN.push(["CO", ex.id, k ? 0 : 25, k ? 0 : 25]);
});
CE.forEach((b, k) => {
  const ex = { ...chung, id: id("nhap"), title: "[NHÁP] " + b.tieuDe, level: "A2", skills: ["Lecture"],
    consigne: b.consigne, readingText: b.readingText, questions: b.cau, createdAt: Date.now() };
  ghi(ex); PHAN.push(["CE", ex.id, k ? 0 : 30, k ? 0 : 25]);
});
for (const [code, b, m, p] of [["PE", PE, 45, 25], ["PO", PO, 12, 0]]) {
  const ex = { ...chung, ...b, id: id("nhap"), createdAt: Date.now() };
  ghi(ex); PHAN.push([code, ex.id, m, p]);
}
ra.push(`with e as (insert into public.exams (title, level, duration_min, is_published, created_by) values ('[NHÁP] DELF A2 · Đề 2', 'A2', 112, false, ${q(GV)}) returning id) insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord) select (select id from e), v.code, v.ex, v.m, v.p, v.o from (values ${PHAN.map(([c, e, m, p], i) => `(${q(c)}, ${q(e)}, ${m}, ${p}, ${i})`).join(", ")}) as v(code, ex, m, p, o);`);
console.log(ra.join("\n"));
