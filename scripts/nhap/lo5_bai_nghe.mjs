/* Lô 5 (02/10) — 9 bài nghe A1–B1 từ docs/nghe/kich-ban-nghe.md, GIỌNG TỔNG HỢP.
 *
 * Bước 1: gọi Edge Function tao-audio cho từng bài (cần TTS_ADMIN_TOKEN trong
 *         biến môi trường, URL + khoá anon đọc từ .env) → mp3 ở kho `nghe`.
 * Bước 2: in SQL tạo 9 bài NHÁP « Écoute » trỏ tới các mp3 đó.
 *
 * Đề bài ghi rõ « giọng tổng hợp » — chủ dự án chọn TTS 02/10; đừng gỡ dòng đó
 * để bài trông như audio bản xứ.
 *
 * Chạy: TTS_ADMIN_TOKEN=… node scripts/nhap/lo5_bai_nghe.mjs > lo5.sql */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
const ANON = env.VITE_SUPABASE_ANON_KEY;
const TOKEN = process.env.TTS_ADMIN_TOKEN;
if (!TOKEN) { console.error("Thiếu TTS_ADMIN_TOKEN"); process.exit(1); }

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261003;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};

const CHAM = "Parle en français de France, lentement et très clairement, comme pour des débutants.";
const THUONG = "Parle en français de France, débit naturel de conversation.";
const RADIO = "Parle en français de France, comme un présentateur de radio, débit naturel.";

const BAI = [
  { ten: "a1-salle-de-sport", tieuDe: "Écoute A1 : un message de la salle de sport", level: "A1",
    doan: [{ giong: "nova", cach: CHAM, chu: "Bonjour, c'est Sophie, de la salle de sport Forme Plus. Vous avez demandé des informations sur nos cours. Le cours de yoga a lieu le mardi et le jeudi, à dix-huit heures. Le cours de natation, c'est le samedi matin, à neuf heures. L'abonnement coûte vingt-cinq euros par mois. Pour l'inscription, apportez une photo et un certificat médical. Notre numéro : le 04 56 32 18 90. À bientôt !" }],
    cau: [
      qcm("Le cours de yoga a lieu…", "le mardi et le jeudi", ["le lundi et le mercredi", "le samedi"], "« Le cours de yoga a lieu le mardi et le jeudi »."),
      qcm("À quelle heure est le cours de natation ?", "9 h", ["18 h", "10 h"], "« le samedi matin, à neuf heures »."),
      qcm("L'abonnement coûte…", "25 € par mois", ["15 € par mois", "25 € par semaine"], "« vingt-cinq euros par mois »."),
      qcm("Pour s'inscrire, il faut apporter…", "une photo et un certificat médical", ["un passeport", "une serviette"], "« apportez une photo et un certificat médical »."),
    ] },
  { ten: "a1-horaires-lycee", tieuDe: "Écoute A1 : une annonce au lycée", level: "A1",
    doan: [{ giong: "onyx", cach: CHAM, chu: "Attention, information pour tous les élèves. À partir de lundi, la cantine ouvre à onze heures trente, et non à midi. La bibliothèque est fermée mercredi après-midi. Les cours de sport ont lieu au gymnase, rue Victor-Hugo, et pas au stade. Merci !" }],
    cau: [
      qcm("À partir de lundi, la cantine ouvre à…", "11 h 30", ["12 h", "11 h"], "« à onze heures trente, et non à midi »."),
      qcm("Quand la bibliothèque est-elle fermée ?", "mercredi après-midi", ["lundi matin", "vendredi"], "« fermée mercredi après-midi »."),
      qcm("Où ont lieu les cours de sport ?", "au gymnase", ["au stade", "à la piscine"], "« au gymnase, rue Victor-Hugo, et pas au stade »."),
    ] },
  { ten: "a2-dimanche-grands-parents", tieuDe: "Écoute A2 : le dimanche chez mes grands-parents", level: "A2",
    doan: [{ giong: "shimmer", cach: THUONG, chu: "Tous les dimanches, je déjeune chez mes grands-parents avec mes parents et mon petit frère. Ma grand-mère prépare toujours un gâteau au chocolat. Après le repas, mon grand-père me raconte des histoires de sa jeunesse : il a travaillé quarante ans dans une usine de chaussures. Moi, je lui montre comment utiliser son téléphone pour appeler ma tante, qui habite au Canada. Il apprend vite ! Quand il fait beau, on se promène tous ensemble au bord de la rivière. Ces dimanches sont mes moments préférés de la semaine." }],
    cau: [
      qcm("Avec qui la jeune fille déjeune-t-elle le dimanche ?", "avec sa famille, chez ses grands-parents", ["avec ses amis", "seule"], "« chez mes grands-parents avec mes parents et mon petit frère »."),
      qcm("Qu'est-ce que la grand-mère prépare ?", "un gâteau au chocolat", ["une tarte aux pommes", "une soupe"], "« un gâteau au chocolat »."),
      qcm("Le grand-père a travaillé…", "dans une usine de chaussures", ["dans un restaurant", "au Canada"], "« quarante ans dans une usine de chaussures »."),
      qcm("La jeune fille aide son grand-père à…", "utiliser son téléphone", ["cuisiner", "marcher"], "« je lui montre comment utiliser son téléphone »."),
      qcm("Quand il fait beau, ils…", "se promènent au bord de la rivière", ["vont au cinéma", "restent à la maison"], "« on se promène tous ensemble au bord de la rivière »."),
    ] },
  { ten: "a2-greve-bus", tieuDe: "Écoute A2 : info trafic, grève des bus", level: "A2",
    doan: [{ giong: "echo", cach: RADIO, chu: "Info trafic. Demain jeudi, en raison d'une grève, seulement un bus sur deux circulera sur les lignes 3 et 7. Le tramway fonctionnera normalement. Les vélos en libre-service seront gratuits toute la journée. La mairie conseille aux habitants de partir plus tôt ou de privilégier le covoiturage. Retour à la normale prévu vendredi matin." }],
    cau: [
      qcm("Quel jour a lieu la grève ?", "jeudi", ["vendredi", "mercredi"], "« Demain jeudi »."),
      qcm("Sur les lignes 3 et 7…", "un bus sur deux circule", ["aucun bus ne circule", "tous les bus circulent"], "« seulement un bus sur deux circulera »."),
      qcm("Le tramway…", "fonctionne normalement", ["est fermé", "est gratuit"], "« Le tramway fonctionnera normalement »."),
      qcm("Qu'est-ce qui est gratuit demain ?", "les vélos en libre-service", ["le tramway", "les parkings"], "« Les vélos en libre-service seront gratuits »."),
    ] },
  { ten: "a2-office-tourisme", tieuDe: "Écoute A2 : à l'office de tourisme", level: "A2",
    doan: [
      { giong: "coral", cach: THUONG, chu: "Bonjour monsieur, je peux vous aider ?" },
      { giong: "ash", cach: THUONG, chu: "Oui, bonjour. Je reste deux jours à Annecy. Qu'est-ce que vous me conseillez ?" },
      { giong: "coral", cach: THUONG, chu: "Alors, il faut absolument faire le tour du lac. Vous pouvez louer un vélo près de la gare, c'est dix euros la demi-journée." },
      { giong: "ash", cach: THUONG, chu: "Et pour visiter la vieille ville ?" },
      { giong: "coral", cach: THUONG, chu: "Il y a une visite guidée tous les jours à quatorze heures, devant l'office. Elle dure une heure et demie." },
      { giong: "ash", cach: THUONG, chu: "Parfait. Et pour manger une spécialité ?" },
      { giong: "coral", cach: THUONG, chu: "Essayez la tartiflette, c'est un plat avec des pommes de terre et du fromage. Voici un plan de la ville." },
      { giong: "ash", cach: THUONG, chu: "Merci beaucoup !" },
    ],
    cau: [
      qcm("Combien de temps reste le touriste à Annecy ?", "deux jours", ["une semaine", "une journée"], "« Je reste deux jours à Annecy »."),
      qcm("Combien coûte la location de vélo ?", "10 € la demi-journée", ["10 € la journée", "20 €"], "« dix euros la demi-journée »."),
      qcm("La visite guidée commence à…", "14 h", ["10 h", "15 h 30"], "« tous les jours à quatorze heures »."),
      qcm("La tartiflette, c'est un plat avec…", "des pommes de terre et du fromage", ["du poisson", "de la viande et du riz"], "« un plat avec des pommes de terre et du fromage »."),
    ] },
  { ten: "b1-colis-service-client", tieuDe: "Écoute B1 : un colis qui n'arrive pas", level: "B1",
    doan: [
      { giong: "ash", cach: THUONG, chu: "Service client de MaBoutique, bonjour, Thomas à votre écoute." },
      { giong: "shimmer", cach: THUONG, chu: "Bonjour. J'ai commandé une paire de chaussures il y a deux semaines, et je n'ai toujours rien reçu. Pourtant, on m'avait promis une livraison en trois jours." },
      { giong: "ash", cach: THUONG, chu: "Je suis désolé. Vous avez votre numéro de commande ?" },
      { giong: "shimmer", cach: THUONG, chu: "Oui, c'est le 4-7-8-2-1." },
      { giong: "ash", cach: THUONG, chu: "Merci. Je vois que le colis est bloqué au centre de tri depuis dix jours, à cause d'une adresse incomplète : il manque le numéro de l'appartement." },
      { giong: "shimmer", cach: THUONG, chu: "Ah, je ne savais pas. Qu'est-ce qu'on peut faire ?" },
      { giong: "ash", cach: THUONG, chu: "Je corrige l'adresse tout de suite, et le colis vous sera livré d'ici vendredi. Pour nous excuser, nous vous remboursons les frais de livraison, soit six euros quatre-vingt-dix." },
      { giong: "shimmer", cach: THUONG, chu: "C'est gentil, merci. Et si les chaussures ne me vont pas ?" },
      { giong: "ash", cach: THUONG, chu: "Vous avez trente jours pour les retourner gratuitement." },
    ],
    cau: [
      qcm("Qu'a commandé la cliente ?", "des chaussures", ["un manteau", "un sac"], "« une paire de chaussures »."),
      qcm("Pourquoi le colis est-il bloqué ?", "une adresse incomplète", ["une grève", "un produit en rupture de stock"], "« à cause d'une adresse incomplète »."),
      qcm("Quand le colis sera-t-il livré ?", "d'ici vendredi", ["demain", "dans deux semaines"], "« livré d'ici vendredi »."),
      qcm("Quel geste fait l'entreprise ?", "elle rembourse les frais de livraison", ["elle offre un bon de réduction", "elle envoie un cadeau"], "« nous vous remboursons les frais de livraison »."),
      qcm("Combien de jours la cliente a-t-elle pour retourner les chaussures ?", "30", ["14", "60"], "« trente jours pour les retourner gratuitement »."),
    ] },
  { ten: "b1-benevolat", tieuDe: "Écoute B1 : pourquoi je suis bénévole", level: "B1",
    doan: [
      { giong: "coral", cach: RADIO, chu: "Aujourd'hui, nous recevons Karim, vingt-quatre ans, bénévole aux Restos du quartier. Karim, depuis quand faites-vous du bénévolat ?" },
      { giong: "echo", cach: THUONG, chu: "Depuis trois ans. Au début, j'étais étudiant et j'avais du temps libre le samedi. Une amie m'a proposé de venir aider à la distribution des repas, et je ne suis jamais reparti." },
      { giong: "coral", cach: RADIO, chu: "Concrètement, que faites-vous ?" },
      { giong: "echo", cach: THUONG, chu: "Le samedi matin, je trie les produits que nous donnent les supermarchés. L'après-midi, je sers les repas. Mais le plus important, pour moi, c'est de discuter avec les gens. Beaucoup de personnes âgées viennent surtout pour parler, pas seulement pour manger." },
      { giong: "coral", cach: RADIO, chu: "Qu'est-ce que le bénévolat vous a apporté ?" },
      { giong: "echo", cach: THUONG, chu: "De la patience, d'abord. Et puis, ça m'a aidé à trouver du travail : j'ai mis cette expérience sur mon CV, et mon employeur actuel m'a dit que c'était ce qui l'avait convaincu." },
      { giong: "coral", cach: RADIO, chu: "Un conseil pour les jeunes qui hésitent ?" },
      { giong: "echo", cach: THUONG, chu: "Commencez par deux heures par mois. On n'a pas besoin de donner tout son temps pour être utile." },
    ],
    cau: [
      qcm("Depuis combien de temps Karim est-il bénévole ?", "trois ans", ["un an", "six mois"], "« Depuis trois ans »."),
      qcm("Comment a-t-il commencé ?", "une amie le lui a proposé", ["grâce à une annonce", "son école l'a obligé"], "« Une amie m'a proposé de venir aider »."),
      qcm("Selon Karim, le plus important est…", "de parler avec les gens", ["de trier les produits", "de servir vite"], "« le plus important, pour moi, c'est de discuter avec les gens »."),
      qcm("Le bénévolat l'a aidé à…", "trouver un emploi", ["réussir ses examens", "déménager"], "« ça m'a aidé à trouver du travail »."),
      qcm("Quel conseil donne-t-il ?", "commencer par deux heures par mois", ["s'engager tous les week-ends", "attendre la fin des études"], "« Commencez par deux heures par mois »."),
    ] },
  { ten: "b1-verifier-information", tieuDe: "Écoute B1 : vérifier une information", level: "B1",
    doan: [{ giong: "sage", cach: RADIO, chu: "Vous avez sûrement déjà reçu ce genre de message : « Partagez vite, le gouvernement va interdire les voitures à essence dès l'année prochaine ! » Avant de partager, prenez trente secondes. D'abord, regardez la source : est-ce un média connu, ou une page que personne ne connaît ? Ensuite, vérifiez la date : beaucoup de fausses informations sont en réalité de vieilles nouvelles sorties de leur contexte. Troisième réflexe : cherchez la même information sur deux autres sites sérieux. Si vous ne la trouvez nulle part ailleurs, méfiez-vous. Enfin, attention aux titres qui provoquent la peur ou la colère : ils sont faits pour être partagés, pas pour informer. Et vous, avez-vous déjà partagé une fausse information sans le savoir ?" }],
    cau: [
      qcm("Le premier réflexe conseillé est de…", "regarder la source", ["partager rapidement", "lire les commentaires"], "« D'abord, regardez la source »."),
      qcm("Pourquoi faut-il vérifier la date ?", "beaucoup de fausses informations sont de vieilles nouvelles", ["les nouvelles changent vite", "pour savoir l'heure"], "« de vieilles nouvelles sorties de leur contexte »."),
      qcm("Si l'information n'apparaît sur aucun autre site sérieux, il faut…", "se méfier", ["la partager", "l'oublier"], "« méfiez-vous »."),
      qcm("Les titres qui provoquent la peur sont faits pour…", "être partagés", ["informer", "rassurer"], "« ils sont faits pour être partagés, pas pour informer »."),
    ] },
  { ten: "b1-arreter-de-fumer", tieuDe: "Écoute B1 : arrêter de fumer", level: "B1",
    doan: [
      { giong: "coral", cach: RADIO, chu: "Bonjour, nous faisons une enquête : avez-vous déjà essayé d'arrêter de fumer ?" },
      { giong: "onyx", cach: THUONG, chu: "Oui, trois fois. La dernière fois, j'ai tenu six mois, et puis j'ai recommencé pendant une période de stress au travail. Le plus dur, c'est le café du matin sans cigarette." },
      { giong: "nova", cach: THUONG, chu: "Moi, j'ai arrêté il y a deux ans, quand j'étais enceinte. J'ai utilisé des patchs, et j'ai économisé presque deux cents euros par mois. Avec cet argent, on est partis en vacances !" },
      { giong: "verse", cach: "Parle en français de France, voix jeune, débit naturel.", chu: "Je n'ai jamais fumé de cigarettes, mais beaucoup de mes amis vapotent. Ils pensent que ce n'est pas dangereux. Moi, je ne suis pas sûr." },
    ],
    cau: [
      qcm("Combien de fois l'homme a-t-il essayé d'arrêter ?", "trois fois", ["une fois", "deux fois"], "« Oui, trois fois »."),
      qcm("Pourquoi a-t-il recommencé ?", "à cause du stress au travail", ["à cause de ses amis", "pendant des vacances"], "« pendant une période de stress au travail »."),
      qcm("La femme a arrêté…", "quand elle était enceinte", ["pour le sport", "sur conseil de son patron"], "« quand j'étais enceinte »."),
      qcm("Grâce à l'argent économisé, elle…", "est partie en vacances", ["a acheté une voiture", "a changé d'appartement"], "« on est partis en vacances »."),
      qcm("Que pense le jeune homme du vapotage ?", "il n'est pas sûr que ce soit sans danger", ["que c'est dangereux", "que ce n'est pas dangereux"], "« Moi, je ne suis pas sûr »."),
    ] },
];

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
for (const b of BAI) {
  const r = await fetch(URL_FN, { method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ ten: b.ten, doan: b.doan }) });
  const kq = await r.json();
  if (!kq.ok) { console.error(b.ten, kq); process.exit(1); }
  console.error(`✔ ${b.ten}: ${Math.round(kq.so_byte / 1024)} KB, ${kq.so_doan} đoạn`);
  const ex = { title: "[NHÁP] " + b.tieuDe, level: b.level, skills: ["Écoute"], id: id("nhap"),
    consigne: "<p>Écoutez le document, puis répondez aux questions.</p><p><em>Enregistrement réalisé avec une voix de synthèse (giọng tổng hợp).</em></p>",
    audioUrl: kq.url, questions: b.cau, usageType: "assignment",
    targeted: true, assignedTo: ["__nhap__"], assignedClasses: [], assignedExtra: [], createdAt: Date.now() };
  const { exRow, qRows } = toRows(ex, "assignment");
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}
console.log(ra.join("\n"));
