/* Lô 7 (02/10) — nâng hai đề nháp A2/C1 lên SỐ CÂU NHƯ ĐỀ THẬT.
 *
 *   A2 Nghe : 13 → 25 câu  (+ « 6 annonces » 6 câu, + « 3 messages » 6 câu; giọng tổng hợp)
 *   A2 Đọc  :  9 → 25 câu  (+ 2 bài đọc × 8 câu)
 *   C1 Nghe : 23 → 29 câu  (bài khí hậu cắt dài thành 5 phút, + 6 câu theo bản chép lời)
 *   C1 Đọc  : 10 → 15 câu  (+ 5 câu cho bài « La ville à l'heure du télétravail »)
 *
 * Câu thêm vào bài ĐANG CÓ thì chèn vào bảng questions với ord nối tiếp, qua
 * đúng toRows (đáp án vào answer_key). Bài mới vào thẳng hai đề, rồi đánh số
 * lại thứ tự phần thi theo CO → CE → PE → PO.
 *
 * Chạy: TTS_ADMIN_TOKEN=… node scripts/nhap/lo7_tang_cau.mjs > lo7.sql */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const TOKEN = process.env.TTS_ADMIN_TOKEN;
if (!TOKEN) { console.error("Thiếu TTS_ADMIN_TOKEN"); process.exit(1); }

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261005;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  if (o.length > 2) for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const vf = (prompt, dung, explanation) => qcm(prompt, dung ? "Vrai" : "Faux", [dung ? "Faux" : "Vrai"], explanation);

const RADIO = "Parle en français de France, comme une annonce publique, débit clair.";
const THUONG = "Parle en français de France, débit naturel de conversation.";

/* ── A2 Nghe: hai bài mới ── */
const ANNONCES = [
  { giong: "sage", cach: RADIO, chu: "Annonce numéro un. Mesdames et messieurs, le train TER à destination de Lyon, prévu à quinze heures dix, partira avec vingt minutes de retard. Merci de votre compréhension." },
  { giong: "coral", cach: RADIO, chu: "Annonce numéro deux. Chers clients, aujourd'hui seulement, les fruits et légumes sont à moins trente pour cent au rayon frais. Profitez-en !" },
  { giong: "onyx", cach: RADIO, chu: "Annonce numéro trois. Le musée fermera ses portes dans quinze minutes. Nous vous remercions de vous diriger vers la sortie." },
  { giong: "nova", cach: RADIO, chu: "Annonce numéro quatre. Les passagers du vol AF 742 pour Marseille sont priés de se présenter porte douze. L'embarquement va commencer." },
  { giong: "echo", cach: RADIO, chu: "Annonce numéro cinq. À cause de travaux, la piscine municipale sera fermée du lundi douze au vendredi seize. Réouverture le samedi dix-sept." },
  { giong: "shimmer", cach: RADIO, chu: "Annonce numéro six. Un petit garçon de cinq ans, Léo, attend ses parents à l'accueil du magasin, au rez-de-chaussée." },
];
const MESSAGES = [
  { giong: "nova", cach: THUONG, chu: "Message un. Salut Paul, c'est Marie. Je ne peux pas venir au cinéma ce soir, je suis malade. On peut y aller samedi ? Rappelle-moi !" },
  { giong: "ash", cach: THUONG, chu: "Message deux. Bonjour, ici le cabinet du docteur Martin. Votre rendez-vous de jeudi est déplacé à vendredi, même heure, dix heures trente. Si cela ne vous convient pas, appelez-nous au 03 45 67 89 10." },
  { giong: "coral", cach: THUONG, chu: "Message trois. Bonjour madame Dupont, c'est l'agence immobilière. L'appartement de la rue des Lilas est toujours libre. Vous pouvez le visiter mercredi à dix-sept heures. Le loyer est de six cent cinquante euros, charges comprises." },
];

const A2_NGHE = [
  { tep: "a2-six-annonces", doan: ANNONCES, tieuDe: "Écoute A2 : six annonces",
    cau: [
      qcm("Annonce 1 — Le train pour Lyon…", "a vingt minutes de retard", ["est annulé", "part en avance", "part de la voie 20"], "« partira avec vingt minutes de retard »."),
      qcm("Annonce 2 — Qu'est-ce qui est en promotion ?", "les fruits et légumes", ["les vêtements", "la viande", "les boissons"], "« les fruits et légumes sont à moins trente pour cent »."),
      qcm("Annonce 3 — Où est-on ?", "dans un musée", ["dans une gare", "dans un magasin", "dans une école"], "« Le musée fermera ses portes »."),
      qcm("Annonce 4 — Les passagers pour Marseille doivent aller…", "porte 12", ["porte 7", "porte 42", "à l'accueil"], "« se présenter porte douze »."),
      qcm("Annonce 5 — Quand la piscine rouvre-t-elle ?", "le samedi 17", ["le lundi 12", "le vendredi 16", "le dimanche 18"], "« Réouverture le samedi dix-sept »."),
      qcm("Annonce 6 — Où se trouve le petit Léo ?", "à l'accueil du magasin", ["au parking", "au premier étage", "devant la caisse"], "« attend ses parents à l'accueil du magasin, au rez-de-chaussée »."),
    ] },
  { tep: "a2-trois-messages", doan: MESSAGES, tieuDe: "Écoute A2 : trois messages téléphoniques",
    cau: [
      qcm("Message 1 — Pourquoi Marie ne va-t-elle pas au cinéma ?", "elle est malade", ["elle travaille", "elle n'a pas d'argent", "le film est complet"], "« je suis malade »."),
      qcm("Message 1 — Que propose Marie ?", "d'y aller samedi", ["d'y aller demain matin", "de regarder un film chez elle", "d'aller au restaurant"], "« On peut y aller samedi ? »."),
      qcm("Message 2 — Le rendez-vous chez le médecin est déplacé à…", "vendredi 10 h 30", ["jeudi 10 h 30", "vendredi 13 h", "lundi"], "« déplacé à vendredi, même heure, dix heures trente »."),
      qcm("Message 2 — Si la nouvelle date ne convient pas, il faut…", "téléphoner au cabinet", ["envoyer un courriel", "venir jeudi quand même", "ne rien faire"], "« appelez-nous »."),
      qcm("Message 3 — Quand peut-on visiter l'appartement ?", "mercredi à 17 h", ["mardi à 17 h", "mercredi à 7 h", "samedi matin"], "« mercredi à dix-sept heures »."),
      qcm("Message 3 — Le loyer est de…", "650 € charges comprises", ["650 € sans les charges", "560 €", "615 €"], "« six cent cinquante euros, charges comprises »."),
    ] },
];

/* ── A2 Đọc: hai bài mới ── */
const A2_DOC = [
  { tieuDe: "Lecture A2 : petites annonces", consigne: "Lisez les annonces, puis répondez aux questions.",
    readingText: "<p><strong>A.</strong> Étudiante sérieuse propose garde d'enfants le mercredi après-midi et le samedi. 10 € de l'heure. Expérience de deux ans. Tél. : 06 12 34 56 78.</p><p><strong>B.</strong> Vends vélo de ville, bleu, très bon état, avec panier. 120 €. À voir le week-end, quartier de la gare.</p><p><strong>C.</strong> Cherche colocataire pour appartement de trois pièces, près du centre. Chambre de 14 m², 380 € par mois. Non-fumeur. Animaux acceptés.</p><p><strong>D.</strong> Cours de guitare pour débutants, enfants et adultes. Premier cours gratuit ! Le lundi et le jeudi soir, à la maison des associations.</p>",
    cau: [
      qcm("L'annonce A propose…", "de garder des enfants", ["de donner des cours", "de vendre un vélo", "de louer une chambre"], "« propose garde d'enfants »."),
      qcm("L'étudiante est disponible…", "le mercredi après-midi et le samedi", ["tous les jours", "le lundi et le jeudi", "le dimanche"], "« le mercredi après-midi et le samedi »."),
      qcm("Combien coûte une heure de garde ?", "10 €", ["12 €", "14 €", "20 €"], "« 10 € de l'heure »."),
      qcm("Le vélo de l'annonce B…", "est en très bon état", ["est neuf", "est rouge", "n'a pas de panier"], "« très bon état, avec panier »."),
      vf("Annonce C — Un fumeur peut louer la chambre.", false, "« Non-fumeur »."),
      vf("Annonce C — On peut venir avec un chat.", true, "« Animaux acceptés »."),
      qcm("Annonce D — Le premier cours de guitare…", "est gratuit", ["coûte 10 €", "a lieu le samedi", "est réservé aux enfants"], "« Premier cours gratuit ! »."),
      qcm("Où ont lieu les cours de guitare ?", "à la maison des associations", ["à la gare", "chez le professeur", "à l'école de musique"], "« à la maison des associations »."),
    ] },
  { tieuDe: "Lecture A2 : un courriel d'une collègue", consigne: "Lisez le courriel, puis répondez aux questions.",
    readingText: "<p><strong>De :</strong> Claire Martin<br><strong>À :</strong> l'équipe<br><strong>Objet :</strong> Pot de départ de Jean</p><p>Bonjour à tous,</p><p>Comme vous le savez, Jean part à la retraite à la fin du mois, après vingt-deux ans dans l'entreprise. Nous organisons un petit pot de départ le vendredi 28, à 17 h 30, dans la salle de réunion du deuxième étage.</p><p>Nous voulons lui offrir un cadeau : un appareil photo, parce qu'il adore voyager. Si vous voulez participer, vous pouvez donner de l'argent à Sophie, à l'accueil, avant mercredi. Il n'y a pas de somme obligatoire.</p><p>Merci aussi d'apporter quelque chose à manger ou à boire (sans alcool, s'il vous plaît). Répondez-moi avant lundi pour me dire si vous venez.</p><p>À bientôt,<br>Claire</p>",
    cau: [
      qcm("Pourquoi Claire écrit-elle ?", "pour organiser le départ à la retraite de Jean", ["pour annoncer une réunion de travail", "pour inviter à un anniversaire", "pour présenter un nouveau collègue"], "« Jean part à la retraite… Nous organisons un petit pot de départ »."),
      qcm("Depuis combien de temps Jean travaille-t-il dans l'entreprise ?", "22 ans", ["12 ans", "20 ans", "28 ans"], "« après vingt-deux ans dans l'entreprise »."),
      qcm("Où aura lieu le pot ?", "dans la salle de réunion du 2ᵉ étage", ["au restaurant", "à l'accueil", "chez Claire"], "« dans la salle de réunion du deuxième étage »."),
      qcm("Quel cadeau l'équipe veut-elle offrir ?", "un appareil photo", ["une valise", "un voyage", "un livre"], "« un appareil photo, parce qu'il adore voyager »."),
      qcm("À qui faut-il donner l'argent ?", "à Sophie, à l'accueil", ["à Claire", "à Jean", "au directeur"], "« donner de l'argent à Sophie, à l'accueil »."),
      vf("Chaque personne doit donner la même somme.", false, "« Il n'y a pas de somme obligatoire »."),
      qcm("Qu'est-ce qu'on ne doit pas apporter ?", "de l'alcool", ["des gâteaux", "des jus de fruits", "des fleurs"], "« sans alcool, s'il vous plaît »."),
      qcm("Avant quand faut-il répondre à Claire ?", "avant lundi", ["avant mercredi", "avant vendredi", "le jour du pot"], "« Répondez-moi avant lundi »."),
    ] },
];

/* ── Câu thêm cho bài đang có ── */
const THEM_KHI_HAU = [   // phần 2'44 → 5'00 của đoạn cắt mới
  qcm("Selon le document, certains effets du changement climatique…", "continueront pendant des siècles même si l'on réduit le réchauffement", ["disparaîtront dès 2050", "ne concernent que l'Arctique", "sont encore hypothétiques"], "« certains effets se poursuivront pendant des siècles »."),
  qcm("De combien la température moyenne mondiale a-t-elle déjà augmenté par rapport à 1890 ?", "de plus de 1,2 °C", ["de 0,5 °C", "de 2 °C", "de 3 °C"], "« plus de 1,2 °C… par rapport au niveau de 1890 »."),
  qcm("Que sont les « points de basculement » ?", "des seuils critiques dont le risque augmente avec le réchauffement", ["des objectifs fixés par l'accord de Paris", "des lieux où la température baisse", "des mesures d'adaptation"], "« des seuils critiques appelés points de basculement »."),
  qcm("Le document distingue deux réponses au changement climatique :", "l'atténuation et l'adaptation", ["la prévention et la réparation", "la taxation et l'interdiction", "la recherche et l'éducation"], "« Répondre au changement climatique implique l'atténuation et l'adaptation »."),
  qcm("Lequel de ces exemples relève de l'ADAPTATION ?", "une meilleure protection du littoral", ["l'abandon progressif du charbon", "le reboisement", "le développement des énergies renouvelables"], "Adaptation : « meilleure protection du littoral… gestion des catastrophes… cultures plus résistantes »; les autres sont de l'atténuation."),
  qcm("Pour limiter le réchauffement à 1,5 °C, il faudrait…", "réduire les émissions de moitié d'ici 2030 et viser presque zéro en 2050", ["arrêter toutes les émissions dès 2030", "réduire les émissions de 10 % d'ici 2050", "compter seulement sur l'adaptation"], "« réduire de moitié les émissions d'ici 2030 et… proches de zéro d'ici 2050 »."),
];
const THEM_DOC_C1 = [
  qcm("Dans le premier paragraphe, l'expression « prophéties de l'époque » est employée avec une nuance…", "ironique, pour souligner que les prévisions étaient exagérées", ["admirative", "neutre", "nostalgique"], "Parler de « prophéties » pour des prévisions démenties par les faits marque une distance ironique."),
  qcm("« évincés du marché » signifie que les ménages locaux…", "ne peuvent plus se loger dans leur ville à cause des prix", ["quittent volontairement la ville", "deviennent propriétaires", "sont expulsés par la mairie"], "évincer = écarter, exclure; ici par la hausse des prix."),
  qcm("Le mot « circonscrit » (2ᵉ paragraphe) signifie :", "limité", ["généralisé", "récent", "contesté"], "« ce mouvement reste circonscrit » = il reste limité."),
  qcm("Pourquoi certains quartiers d'affaires « s'interrogent sur leur avenir » ?", "parce qu'ils se vident, notamment le vendredi", ["parce qu'ils manquent de transports", "parce que les loyers baissent trop", "parce qu'on y construit des logements"], "« certains quartiers d'affaires, désertés le vendredi, s'interrogent sur leur avenir »."),
  qcm("Quelle est la thèse implicite du dernier paragraphe ?", "réorganiser la ville autour du télétravail risque d'aggraver les inégalités", ["le télétravail devrait être interdit", "tous les métiers deviendront télétravaillables", "les inégalités vont disparaître"], "« on risque d'accentuer une fracture déjà profonde entre deux catégories de travailleurs »."),
];

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const baiMoi = (ex) => {
  const full = { ...ex, id: id("nhap"), usageType: "assignment", targeted: true, assignedTo: ["__nhap__"], assignedClasses: [], assignedExtra: [], createdAt: Date.now() };
  const { exRow, qRows } = toRows(full, "assignment");
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
  return full.id;
};
/* Câu thêm vào bài có sẵn: tra bài theo tiêu đề, ord nối tiếp ord lớn nhất. */
const themCau = (tieuDe, cau) => {
  const { qRows } = toRows({ id: "tam", title: "tam", questions: cau }, "assignment");
  const dong = qRows.map((x, i) => `(${q(x.id)}, ${i}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.id, e.id, (select coalesce(max(ord), -1) + 1 from public.questions where exercise_id = e.id) + v.o, v.type, v.prompt, v.payload, v.answer_key, v.explanation from public.exercises e, (values ${dong}) as v(id, o, type, prompt, payload, answer_key, explanation) where e.title = ${q(tieuDe)};`);
};

const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
const idNghe = [];
for (const b of A2_NGHE) {
  const r = await fetch(URL_FN, { method: "POST", headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, "x-admin-token": TOKEN, "Content-Type": "application/json" }, body: JSON.stringify({ ten: b.tep, doan: b.doan }) });
  const kq = await r.json();
  if (!kq.ok) { console.error(b.tep, kq); process.exit(1); }
  console.error(`✔ ${b.tep}: ${Math.round(kq.so_byte / 1024)} KB`);
  idNghe.push(baiMoi({ title: "[NHÁP] " + b.tieuDe, level: "A2", skills: ["Écoute"], audioUrl: kq.url, questions: b.cau,
    consigne: "<p>Écoutez le document (deux écoutes), puis répondez aux questions.</p><p><em>Enregistrement réalisé avec une voix de synthèse (giọng tổng hợp).</em></p>" }));
}
const idDoc = A2_DOC.map((b) => baiMoi({ title: "[NHÁP] " + b.tieuDe, level: "A2", skills: ["Lecture"], consigne: b.consigne, readingText: b.readingText, questions: b.cau }));
themCau("[NHÁP] Écoute C1 : le changement climatique", THEM_KHI_HAU);
themCau("[NHÁP] Lecture C1 : la ville à l'heure du télétravail", THEM_DOC_C1);

const DE_A2 = "[NHÁP] DELF A2 — Đề 1";
ra.push(`insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord) select e.id, v.code, v.ex, 0, 0, v.o from public.exams e, (values ('CO', ${q(idNghe[0])}, 100), ('CO', ${q(idNghe[1])}, 101), ('CE', ${q(idDoc[0])}, 200), ('CE', ${q(idDoc[1])}, 201)) as v(code, ex, o) where e.title = ${q(DE_A2)};`);
/* Đánh số lại: CO → CE → PE → PO, giữ thứ tự cũ trong từng khối. Dòng ĐẦU mỗi
   khối giữ phút/điểm (bài cũ vẫn đứng đầu vì ord cũ < 100). */
ra.push(`update public.exam_sections s set ord = x.n from (select id, row_number() over (order by case code when 'CO' then 0 when 'CE' then 1 when 'PE' then 2 else 3 end, ord) - 1 as n from public.exam_sections where exam_id = (select id from public.exams where title = ${q(DE_A2)})) x where s.id = x.id;`);
console.log(ra.join("\n"));
