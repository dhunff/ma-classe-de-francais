/* Lô 23 (19/10): NỘI DUNG 3 đề DELF B2 mới (Đề 4, 5, 6) theo FORMAT MỚI (khuôn lo20),
 * chủ đề nghị luận xã hội CẬP NHẬT 2026.
 *
 *   Nghe (25 đ): Ex1 phỏng vấn 2 lượt, 7 câu = 9 đ · Ex2 phóng sự 2 lượt, 7 câu = 9 đ
 *                Ex3 ba tài liệu ngắn 1 lượt, 6 câu = 7 đ
 *   Đọc (25 đ): Ex1, Ex2 bài báo 7 câu = 9 đ · Ex3 ba ý kiến diễn đàn, 6 câu = 7 đ
 *
 * Bài đọc Ex1, Ex2: FRACILE VIẾT LẠI HOÀN TOÀN từ THÔNG TIN trong bài báo uy tín (không
 * chép câu gốc, dữ kiện và con số giữ đúng nguồn), cuối bài « Sources : … ». Kịch bản
 * nghe, ý kiến diễn đàn, đề viết, đề nói do FRACILE soạn, nhân vật hư cấu, không gán cho
 * người thật. Không dùng dấu gạch dài (quy tắc 7). Máy dựng: lo23_b2_moi.mjs. */

let dem = 0;
export const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261021;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const q = (prompt, dung, sai, explanation, diem) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation, heSo: Math.round(diem * 2) };
};
const ai = (ten) => (prompt, dungLa, explanation, diem) =>
  ({ id: id("q"), type: "qcm", prompt, options: ten.map((t) => `${t}.`), answer: ten.indexOf(dungLa), explanation, heSo: Math.round(diem * 2) });
const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
const S = (ma, ...ds) => ({ ma, html: p(...ds) });
const d = (giong, cach, chu) => ({ giong, cach, chu });
const nguon = (...ds) => `<p><small><em>Texte rédigé par FRACILE à partir de : ${ds.join(" ; ")}.</em></small></p>`;
const RADIO = "Parle en français de France, comme un journaliste de radio, débit naturel et posé.";
const KHACH = "Parle en français de France, comme une personne interviewée à la radio, débit naturel.";
const TIN = "Parle en français de France, comme une chronique radio courte, débit naturel et vif.";
/* Điểm từng câu: 7 câu = 9 đ, 6 câu = 7 đ (giống lo20). */
const D9 = [1, 1.5, 0.5, 1, 1.5, 2, 1.5], D7 = [2, 1, 1.5, 1, 1, 0.5], D7F = [2, 1.5, 1, 1.5, 0.5, 0.5];
const cham = (ds, diem) => ds.map((x, i) => q(...x, diem[i]));
const PE = (ten, tinh, yeuCau) => ({ tieuDe: `Production écrite B2 · ${ten}`,
  consigne: `<p><strong>Production écrite : 60 minutes, 250 mots minimum.</strong></p><blockquote><p>${tinh}</p></blockquote><p>${yeuCau}</p>`,
  questions: [{ type: "open", prompt: "Rédigez votre texte (250 mots minimum)." }] });
const PO = (ten, sujets) => ({ tieuDe: `Production orale B2 · ${ten}`,
  consigne: p("<strong>Production orale : 20 minutes environ.</strong> 30 minutes de préparation.", "Vous tirez au sort deux documents et vous en choisissez un. Vous dégagez le problème soulevé par ce document, puis vous présentez votre opinion sous la forme d'un exposé argumenté de 5 à 7 minutes. Ensuite, vous défendez votre point de vue au cours d'un débat avec l'examinateur."),
  bocTham: { chuanBi: 30, phan: [{ ten: "Monologue suivi puis exercice en interaction", cachLam: "Choisissez un document.", soRut: 2, sujets }] } });

/* ═══════════════════════════ ĐỀ 4 : enfants, écrans, IA ═══════════════════════════ */
const DE4 = { ten: "DELF B2 · Đề 4",
  CO1: { ten: "b2n-de4-co1", tieuDe: "Écoute B2 · Đề 4 · Exercice 1 : vérifier l'âge en ligne",
    gioiThieu: "Vous écoutez une émission à la radio.",
    doan: [d("sage", RADIO, "Interdire certains contenus aux mineurs, tout le monde semble d'accord. Mais comment vérifier l'âge d'un internaute sans collecter ses données ? Nous en parlons avec une juriste spécialiste du numérique. Bonjour."),
      d("shimmer", KHACH, "Bonjour. Le problème est simple à poser et très difficile à résoudre. Aujourd'hui, la plupart des sites se contentent de demander : « Avez-vous plus de 18 ans ? » Un enfant de dix ans clique sur oui en une seconde. À l'autre extrême, demander une pièce d'identité à chaque connexion reviendrait à confier des données très sensibles à des entreprises privées."),
      d("sage", RADIO, "Il existe une voie intermédiaire ?"),
      d("shimmer", KHACH, "C'est tout l'enjeu des outils dits de « double anonymat ». Un tiers de confiance vérifie votre âge, puis transmet seulement une réponse au site : oui ou non. Le site ne sait pas qui vous êtes, et le vérificateur ne sait pas quel site vous visitez. Sur le papier, c'est élégant. En pratique, il faut que ce tiers soit réellement indépendant et que les plateformes jouent le jeu."),
      d("sage", RADIO, "Et les parents dans tout ça ?"),
      d("shimmer", KHACH, "Ils restent essentiels. Aucun outil technique ne remplacera le dialogue. Je dis souvent que la vérification de l'âge, c'est la ceinture de sécurité : utile, nécessaire même, mais elle n'apprend pas à conduire.")],
    cau: cham([
      ["Quel est le problème principal évoqué au début ?", "Vérifier l'âge sans collecter trop de données.", ["Le coût des abonnements.", "Le manque de sites pour enfants."], "« comment vérifier l'âge d'un internaute sans collecter ses données ? »."],
      ["Que font aujourd'hui la plupart des sites ?", "Ils demandent simplement si l'on est majeur.", ["Ils exigent une carte d'identité.", "Ils bloquent tous les mineurs."], "« la plupart des sites se contentent de demander : Avez-vous plus de 18 ans ? »."],
      ["Pourquoi cette méthode est-elle inefficace ?", "Un enfant peut mentir facilement.", ["Elle coûte trop cher.", "Elle est interdite."], "« Un enfant de dix ans clique sur oui en une seconde »."],
      ["Quel est le risque de demander une pièce d'identité ?", "Confier des données sensibles à des entreprises.", ["Ralentir Internet.", "Exclure les adultes."], "« confier des données très sensibles à des entreprises privées »."],
      ["Dans le « double anonymat », que reçoit le site ?", "seulement une réponse oui ou non", ["le nom de l'utilisateur", "une copie de la carte d'identité"], "« transmet seulement une réponse au site : oui ou non »."],
      ["Selon la juriste, à quelle condition ce système peut-il fonctionner ?", "Le tiers doit être indépendant et les plateformes coopérer.", ["L'État doit le financer entièrement.", "Les parents doivent payer."], "« il faut que ce tiers soit réellement indépendant et que les plateformes jouent le jeu »."],
      ["Que veut dire la comparaison avec la ceinture de sécurité ?", "La technique protège mais n'éduque pas.", ["La vérification est inutile.", "Il faut interdire Internet aux enfants."], "« utile, nécessaire même, mais elle n'apprend pas à conduire »."],
    ], D9) },
  CO2: { ten: "b2n-de4-co2", tieuDe: "Écoute B2 · Đề 4 · Exercice 2 : un lycée sans portable",
    gioiThieu: "Vous écoutez un reportage à la radio.",
    doan: [d("onyx", RADIO, "Depuis la rentrée, au lycée Marie-Curie, les téléphones restent éteints au fond des sacs. Une règle désormais appliquée dans tous les lycées. Six semaines après, ambiance."),
      d("nova", KHACH, "Au début, on râlait tous. Moi, je pensais que ce serait l'horreur. Et en fait, à la pause, on se parle vraiment. Il y a même des parties de cartes dans le hall, ce que je n'avais jamais vu en trois ans."),
      d("onyx", RADIO, "Côté professeurs, le constat est plus nuancé. Un enseignant d'histoire explique que les élèves sont plus concentrés en début de cours, mais qu'il a dû revoir certaines activités : il utilisait les téléphones pour des quiz en ligne. L'établissement prête désormais des tablettes pour ces moments-là. Le proviseur, lui, retient surtout une baisse des conflits liés aux photos prises en classe et partagées sans autorisation. Reste une inquiétude chez certains parents : ne plus pouvoir joindre leur enfant directement. La réponse du lycée : passer par la vie scolaire, comme autrefois.")],
    cau: cham([
      ["Depuis quand les téléphones sont-ils éteints au lycée Marie-Curie ?", "depuis la rentrée", ["depuis l'année dernière", "depuis six mois"], "« Depuis la rentrée »."],
      ["Comment la lycéenne a-t-elle réagi au début ?", "Elle était contre la règle.", ["Elle était enthousiaste.", "Elle était indifférente."], "« Au début, on râlait tous »."],
      ["Qu'est-ce qui a changé pendant les pauses ?", "Les élèves se parlent et jouent aux cartes.", ["Les élèves restent en classe.", "Les élèves lisent davantage."], "« on se parle vraiment… des parties de cartes »."],
      ["Quel effet l'enseignant d'histoire observe-t-il ?", "plus de concentration en début de cours", ["de meilleures notes", "moins d'absences"], "« les élèves sont plus concentrés en début de cours »."],
      ["Comment le lycée remplace-t-il les quiz sur téléphone ?", "Il prête des tablettes.", ["Il les a supprimés.", "Il les fait sur papier."], "« L'établissement prête désormais des tablettes »."],
      ["Qu'a constaté le proviseur ?", "moins de conflits liés aux photos partagées", ["plus de vols dans les sacs", "moins de retards"], "« une baisse des conflits liés aux photos prises en classe »."],
      ["Que doivent faire les parents pour joindre leur enfant ?", "passer par la vie scolaire", ["envoyer un courriel au professeur", "attendre la fin des cours"], "« passer par la vie scolaire, comme autrefois »."],
    ], D9) },
  CO3: { ten: "b2n-de4-co3", tieuDe: "Écoute B2 · Đề 4 · Exercice 3 : trois courts documents",
    docs: [
      { doan: [d("alloy", TIN, "Une bibliothèque de Lille propose depuis septembre des « ateliers parents-écrans ». Le principe : apprendre à paramétrer les téléphones des enfants, mais surtout échanger entre parents sur les règles à la maison. Les places partent en quelques heures.")],
        cau: [["Que propose la bibliothèque ?", "des ateliers sur les écrans pour les parents", ["des cours d'informatique pour enfants", "des prêts de tablettes"], "« ateliers parents-écrans »."],
          ["Qu'apprécient surtout les participants ?", "échanger entre parents", ["réparer les téléphones", "obtenir des réductions"], "« mais surtout échanger entre parents »."]] },
      { doan: [d("nova", TIN, "Dans une école d'ingénieurs, les examens écrits ont été réorganisés : les étudiants doivent désormais présenter oralement leur raisonnement après chaque devoir. Objectif : vérifier qu'ils ont vraiment compris, à l'heure où l'intelligence artificielle peut rédiger une copie à leur place.")],
        cau: [["Qu'est-ce qui a changé dans cette école ?", "Les étudiants expliquent oralement leur raisonnement.", ["Les examens sont supprimés.", "Les ordinateurs sont interdits."], "« présenter oralement leur raisonnement »."],
          ["Pourquoi ce changement ?", "L'IA peut rédiger les copies à la place des étudiants.", ["Les professeurs manquent de temps.", "Les étudiants le demandaient."], "« l'intelligence artificielle peut rédiger une copie à leur place »."]] },
      { doan: [d("echo", TIN, "Un village de la Drôme a lancé un défi original : un mois sans écran le soir pour toutes les familles volontaires. En échange, la mairie organise chaque soir une activité gratuite : chorale, astronomie, jeux. Une quarantaine de foyers participent.")],
        cau: [["Que propose le village ?", "un mois sans écran le soir", ["une semaine sans voiture", "un an sans télévision"], "« un mois sans écran le soir »."],
          ["Combien de foyers participent environ ?", "une quarantaine", ["une dizaine", "une centaine"], "« Une quarantaine de foyers participent »."]] },
    ] },
  CE1: { tieuDe: "Lecture B2 · Đề 4 · Exercice 1 : l'Europe veut protéger les enfants en ligne",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p("<strong>Protéger les enfants en ligne : l'Europe prend le relais</strong>",
      "L'été 2026 aura été mouvementé pour les défenseurs d'une « majorité numérique ». En juillet, le Parlement français adoptait une interdiction des réseaux sociaux aux moins de 15 ans ; en août, le Conseil constitutionnel la censurait, jugeant notamment que la vérification de l'âge de tous les utilisateurs portait une atteinte excessive à la vie privée. Le gouvernement promet un nouveau texte avant le printemps 2027.",
      "Entre-temps, c'est Bruxelles qui a repris l'initiative. Le 17 septembre, la Commission européenne a présenté un projet de règlement baptisé « EU Kids Act ». Le texte propose une approche graduée plutôt qu'un âge couperet : pas de réseaux sociaux avant 13 ans, un accès sous contrôle parental entre 13 et 15 ans, puis un accès sécurisé jusqu'à 18 ans. Il prévoit aussi de supprimer, pour les mineurs, les fonctionnalités jugées addictives, et d'imposer la sécurité dès la conception des services.",
      "L'avantage d'un règlement européen est évident : il s'appliquerait de la même manière dans les vingt-sept pays et éviterait le conflit permanent entre lois nationales et droit européen, celui-là même qui avait fragilisé la loi française. La Commission travaille par ailleurs avec sept États, dont la France, sur un outil commun de vérification de l'âge respectueux de la vie privée, qu'elle espère rendre disponible d'ici à la fin de l'année.",
      "Rien n'est pourtant joué. Le projet doit encore être adopté par le Parlement européen et par les États, ce qui peut prendre des mois, voire des années. Et l'exemple australien, où l'interdiction en vigueur depuis décembre 2025 est largement contournée, rappelle qu'une règle ne vaut que par les moyens de la faire respecter.",
      nguon("Toute l'Europe, « Pourquoi l'interdiction des réseaux sociaux aux moins de 15 ans reste un casse-tête en France et en Europe », mis à jour le 17 septembre 2026 (touteleurope.eu)", "CB News / AFP, « Australie : bilan mitigé pour l'interdiction des réseaux sociaux pour les moins de 16 ans », 25 juin 2026 (cbnews.fr)")),
    cau: cham([
      ["Pourquoi le Conseil constitutionnel a-t-il censuré la loi française ?", "La vérification de l'âge portait trop atteinte à la vie privée.", ["La loi coûtait trop cher.", "Les plateformes avaient refusé."], "« la vérification de l'âge de tous les utilisateurs portait une atteinte excessive à la vie privée »."],
      ["Qu'est-ce que l'« EU Kids Act » ?", "un projet de règlement européen", ["une loi française", "une application mobile"], "« un projet de règlement baptisé EU Kids Act »."],
      ["Quelle est la particularité de l'approche proposée ?", "Elle est progressive selon l'âge.", ["Elle interdit tout avant 18 ans.", "Elle laisse les parents décider seuls."], "« une approche graduée plutôt qu'un âge couperet »."],
      ["Entre 13 et 15 ans, l'accès aux réseaux se ferait…", "sous contrôle parental", ["librement", "pas du tout"], "« un accès sous contrôle parental entre 13 et 15 ans »."],
      ["Quel est l'intérêt d'un règlement européen selon l'article ?", "Il s'appliquerait partout pareil et éviterait les conflits juridiques.", ["Il serait adopté plus vite.", "Il serait moins strict."], "« s'appliquerait de la même manière… éviterait le conflit permanent »."],
      ["Pourquoi le projet n'est-il pas encore certain ?", "Il doit être adopté par le Parlement européen et les États.", ["Les entreprises l'ont refusé.", "La France s'y oppose."], "« doit encore être adopté par le Parlement européen et par les États »."],
      ["Que montre l'exemple australien selon l'auteur ?", "Une règle n'est efficace que si on peut la faire respecter.", ["L'interdiction est un succès total.", "Les jeunes ont quitté les réseaux."], "« une règle ne vaut que par les moyens de la faire respecter »."],
    ], D9) },
  CE2: { tieuDe: "Lecture B2 · Đề 4 · Exercice 2 : l'école à l'heure de l'IA",
    consigne: "<p>Vous lisez un article dans un magazine francophone.</p>",
    readingText: p("<strong>Avec l'IA, l'école doit-elle encore transmettre des savoirs ?</strong>",
      "Le 13 octobre 2026, à Paris, des responsables d'écoles, d'entreprises de la tech éducative et d'institutions culturelles se sont réunis autour d'une question qui agite tous les enseignants : à quoi sert l'école quand une machine peut répondre à presque toutes les questions en quelques secondes ?",
      "Pour certains intervenants, l'intelligence artificielle est d'abord une chance. Elle permettrait d'adapter les exercices au rythme de chaque élève, ce qu'aucun professeur ne peut faire seul devant trente élèves. Mais ils distinguent soigneusement les outils généralistes, conçus pour tout faire, des outils pensés pour apprendre, et réclament une meilleure formation des enseignants pour choisir les bons.",
      "D'autres insistent sur ce que la technologie ne remplacera pas : la classe comme lieu collectif, où l'on apprend aussi avec et contre les autres. L'objectif ne serait pas de remplacer le professeur, mais d'« augmenter l'humain ». Et puisque l'école a perdu le monopole du savoir, le rôle de l'enseignant changerait de nature : apprendre aux élèves à construire un raisonnement, à vérifier une source, à comprendre leurs propres erreurs.",
      "La question du diplôme a aussi divisé. Pour les uns, il garde toute sa valeur, car il atteste d'un parcours de transformation et de qualités comme l'esprit critique ou la créativité. Pour les autres, les employeurs devraient évaluer davantage les compétences réelles que les titres.",
      "Au bout du compte, les participants ont refusé d'opposer savoirs et réflexion : sans connaissances solides, on ne peut pas penser par soi-même, et sans esprit critique, les connaissances ne protègent de rien. Une conviction a fait l'unanimité : les écrans ne remplaceront pas les échanges humains.",
      nguon("WE DEMAIN, « Avec l'IA, l'école doit-elle encore transmettre des savoirs ou apprendre à penser ? », Florence Santrot, 13 octobre 2026 (wedemain.fr)")),
    cau: cham([
      ["Quelle question était au cœur de la rencontre du 13 octobre ?", "le rôle de l'école face à l'IA", ["le salaire des enseignants", "la durée des vacances scolaires"], "« à quoi sert l'école quand une machine peut répondre à presque toutes les questions »."],
      ["Selon certains intervenants, quel est l'atout de l'IA ?", "adapter les exercices au rythme de chaque élève", ["remplacer les professeurs", "réduire le nombre d'élèves"], "« adapter les exercices au rythme de chaque élève »."],
      ["Quelle distinction font-ils entre les outils ?", "outils généralistes et outils pensés pour apprendre", ["outils gratuits et payants", "outils français et étrangers"], "« les outils généralistes… des outils pensés pour apprendre »."],
      ["Que signifie « augmenter l'humain » ?", "utiliser la technologie pour renforcer le travail du professeur", ["recruter plus de professeurs", "allonger les journées de classe"], "« pas de remplacer le professeur, mais d'augmenter l'humain »."],
      ["Puisque l'école a perdu le monopole du savoir, le professeur doit surtout…", "apprendre à raisonner et à vérifier les sources", ["faire apprendre plus de leçons par cœur", "utiliser uniquement des manuels"], "« construire un raisonnement, vérifier une source, comprendre leurs erreurs »."],
      ["Sur la valeur du diplôme, les participants étaient…", "divisés", ["tous d'accord pour le supprimer", "tous d'accord pour le renforcer"], "« La question du diplôme a aussi divisé »."],
      ["Quelle est la conclusion de l'article ?", "Il ne faut pas opposer savoirs et réflexion.", ["Il faut interdire l'IA à l'école.", "Les connaissances ne servent plus à rien."], "« les participants ont refusé d'opposer savoirs et réflexion »."],
    ], D9) },
  CE3: { tieuDe: "Lecture B2 · Đề 4 · Exercice 3 : l'IA pour faire ses devoirs ?",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Faut-il interdire l'IA pour les devoirs à la maison ? »</p>",
    ten: ["Claire", "Mehdi", "Paul"],
    readingText: p("<strong>Claire</strong>", "Je suis professeure de français. Interdire, c'est impossible à contrôler : on ne peut pas vérifier ce qui se passe dans chaque chambre. Je préfère changer mes devoirs : plus de travail en classe, plus d'oral, des sujets qui demandent l'avis personnel de l'élève. Il faut s'adapter plutôt que faire la police.",
      "<strong>Mehdi</strong>", "Mon fils est en troisième. Je vois bien que certains copient directement les réponses de l'IA et ont de bonnes notes sans rien comprendre. C'est injuste pour ceux qui travaillent. Il faut des règles claires, sinon ce sont les élèves honnêtes qui sont pénalisés.",
      "<strong>Paul</strong>", "Je suis lycéen. Moi, j'utilise l'IA comme un professeur particulier : quand je bloque sur un exercice de maths, je lui demande de m'expliquer, pas de faire à ma place. Mes parents ne peuvent pas m'aider et les cours particuliers coûtent cher. Interdire, ce serait priver ceux qui n'ont pas d'autre aide."),
    cau: null },
  PE: PE("Đề 4", "<strong>Le portable interdit au lycée : un an pour juger ?</strong><br>Depuis la rentrée 2026, l'interdiction du téléphone portable, déjà appliquée à l'école et au collège, concerne aussi les lycées.",
    "Le conseil d'administration de votre lycée vous demande votre avis. Vous écrivez une lettre au proviseur dans laquelle vous présentez les avantages et les limites de cette règle, et vous proposez des aménagements argumentés."),
  PO: PO("Đề 4", [
    S("1", "<strong>Une majorité numérique à 15 ans ?</strong>", "En 2026, la France a voté puis vu censurer une interdiction des réseaux sociaux aux moins de 15 ans. Pour ses défenseurs, il s'agit de protéger la santé des adolescents. Pour ses critiques, une telle règle est impossible à appliquer et menace la vie privée de tous les internautes."),
    S("2", "<strong>L'IA, nouveau professeur particulier ?</strong>", "De plus en plus d'élèves demandent de l'aide à une intelligence artificielle pour leurs devoirs. Certains y voient une chance pour ceux qui n'ont personne pour les aider ; d'autres craignent qu'ils n'apprennent plus à réfléchir seuls."),
    S("3", "<strong>Des écrans en classe ?</strong>", "Tablettes, tableaux numériques, applications : l'école n'a jamais autant utilisé les écrans, alors même qu'elle interdit le téléphone aux élèves. Faut-il plus ou moins de numérique à l'école ?"),
    S("4", "<strong>Le diplôme a-t-il encore de la valeur ?</strong>", "Certains recruteurs affirment préférer les compétences réelles aux diplômes. D'autres estiment que le diplôme reste la meilleure preuve d'un parcours sérieux et d'un esprit critique."),
  ]),
};
DE4.CE3.cau = (() => { const x = ai(DE4.CE3.ten); return [
  x("L'IA peut aider ceux qui n'ont pas d'autre soutien.", "Paul", "Paul : « priver ceux qui n'ont pas d'autre aide ».", 2),
  x("Une interdiction ne peut pas être vérifiée.", "Claire", "Claire : « impossible à contrôler ».", 1.5),
  x("L'usage de l'IA crée une injustice entre élèves.", "Mehdi", "Mehdi : « C'est injuste pour ceux qui travaillent ».", 1),
  x("Il faut transformer la manière de donner des devoirs.", "Claire", "Claire : « Je préfère changer mes devoirs ».", 1.5),
  x("Il demande des règles claires.", "Mehdi", "Mehdi : « Il faut des règles claires ».", 0.5),
  x("Il utilise l'IA pour comprendre, pas pour copier.", "Paul", "Paul : « je lui demande de m'expliquer, pas de faire à ma place ».", 0.5),
]; })();

/* ═══════════════════════════ ĐỀ 5 : logement et travail des jeunes ═══════════════════════════ */
const DE5 = { ten: "DELF B2 · Đề 5",
  CO1: { ten: "b2n-de5-co1", tieuDe: "Écoute B2 · Đề 5 · Exercice 1 : la colocation intergénérationnelle",
    gioiThieu: "Vous écoutez une émission à la radio.",
    doan: [d("sage", RADIO, "Un étudiant qui loge chez une personne âgée, contre un loyer modeste et un peu de présence : la colocation intergénérationnelle séduit de plus en plus. Nous recevons la responsable d'une association qui organise ces rencontres. Bonjour."),
      d("nova", KHACH, "Bonjour. Le principe est simple : une personne âgée qui vit seule dans un logement trop grand propose une chambre à un jeune. En échange, le jeune s'engage à être présent certains soirs, à partager un repas de temps en temps. Ce n'est ni un emploi d'aide à domicile, ni une simple location : c'est une cohabitation."),
      d("sage", RADIO, "Comment choisissez-vous les binômes ?"),
      d("nova", KHACH, "Par des entretiens, longs, des deux côtés. On parle des habitudes : l'heure du coucher, la musique, les invités. Les conflits naissent rarement de grandes questions, mais des petites choses du quotidien. Nous signons ensuite une charte, et nous restons joignables toute l'année."),
      d("sage", RADIO, "Est-ce une solution à la crise du logement étudiant ?"),
      d("nova", KHACH, "Ce serait malhonnête de le prétendre. Cela concerne quelques milliers de personnes, pas des centaines de milliers. Mais c'est une réponse à deux solitudes à la fois, et les retours sont très positifs. Beaucoup de binômes restent en contact des années après.")],
    cau: cham([
      ["Qui propose une chambre dans ce dispositif ?", "une personne âgée qui vit seule", ["une agence immobilière", "une université"], "« une personne âgée qui vit seule… propose une chambre »."],
      ["Qu'est-ce que le jeune s'engage à faire ?", "être présent certains soirs", ["faire le ménage tous les jours", "payer le loyer du marché"], "« le jeune s'engage à être présent certains soirs »."],
      ["Comment la responsable définit-elle cette relation ?", "comme une cohabitation", ["comme un emploi", "comme une location classique"], "« Ce n'est ni un emploi… ni une simple location : c'est une cohabitation »."],
      ["Comment l'association forme-t-elle les binômes ?", "par de longs entretiens des deux côtés", ["par tirage au sort", "selon la distance avec l'université"], "« Par des entretiens, longs, des deux côtés »."],
      ["D'où viennent le plus souvent les conflits ?", "des petites choses du quotidien", ["de l'argent", "des différences politiques"], "« des petites choses du quotidien »."],
      ["Selon la responsable, ce dispositif peut-il résoudre la crise du logement étudiant ?", "Non, il concerne trop peu de personnes.", ["Oui, entièrement.", "Oui, dans les grandes villes."], "« Ce serait malhonnête de le prétendre »."],
      ["Quel est, selon elle, le principal intérêt du dispositif ?", "répondre à la solitude des jeunes et des personnes âgées", ["faire baisser les loyers", "créer des emplois"], "« une réponse à deux solitudes à la fois »."],
    ], D9) },
  CO2: { ten: "b2n-de5-co2", tieuDe: "Écoute B2 · Đề 5 · Exercice 2 : télétravail, le grand flou",
    gioiThieu: "Vous écoutez un reportage à la radio.",
    doan: [d("onyx", RADIO, "Dans cette entreprise de conseil lyonnaise, la direction a annoncé en septembre un retour au bureau trois jours par semaine, contre deux auparavant. Réaction immédiate des salariés."),
      d("shimmer", KHACH, "Je comprends l'idée : on se voyait de moins en moins, les nouveaux arrivants ne connaissaient personne. Mais moi, j'habite à une heure de transport. Un jour de plus, c'est deux heures de vie en moins chaque semaine. J'ai demandé à pouvoir choisir mes jours, au moins."),
      d("onyx", RADIO, "La directrice des ressources humaines défend une décision réfléchie : selon elle, les échanges informels manquaient, et l'innovation en souffrait. Elle reconnaît toutefois que deux salariés ont déjà démissionné. Un délégué syndical, lui, rappelle que dans l'entreprise, le télétravail est prévu par un accord collectif : le modifier suppose une négociation, pas une simple annonce. Les discussions doivent reprendre en novembre.")],
    cau: cham([
      ["Qu'a annoncé la direction en septembre ?", "trois jours de présence au bureau par semaine", ["la fin totale du télétravail", "le passage au télétravail complet"], "« un retour au bureau trois jours par semaine »."],
      ["Combien de jours de présence avant ce changement ?", "deux", ["trois", "un"], "« contre deux auparavant »."],
      ["Quel argument de la direction la salariée comprend-elle ?", "Les collègues se voyaient de moins en moins.", ["Les résultats avaient baissé.", "Les bureaux étaient vides."], "« on se voyait de moins en moins »."],
      ["Quel est le problème pour la salariée ?", "le temps de transport", ["le prix de la cantine", "le bruit au bureau"], "« j'habite à une heure de transport »."],
      ["Que demande-t-elle ?", "pouvoir choisir ses jours", ["un meilleur salaire", "un bureau individuel"], "« J'ai demandé à pouvoir choisir mes jours »."],
      ["Quelle conséquence la DRH reconnaît-elle ?", "Deux salariés ont démissionné.", ["Les arrêts maladie ont augmenté.", "Les clients sont mécontents."], "« deux salariés ont déjà démissionné »."],
      ["Selon le délégué syndical, pourquoi la décision pose-t-elle problème ?", "Le télétravail est prévu par un accord collectif.", ["La loi interdit le retour au bureau.", "Les salariés n'ont pas été informés."], "« le télétravail est prévu par un accord collectif : le modifier suppose une négociation »."],
    ], D9) },
  CO3: { ten: "b2n-de5-co3", tieuDe: "Écoute B2 · Đề 5 · Exercice 3 : trois courts documents",
    docs: [
      { doan: [d("alloy", TIN, "À Grenoble, une résidence étudiante d'un nouveau genre a ouvert ses portes : des studios de dix-huit mètres carrés, mais une grande cuisine commune, une salle de travail et un potager sur le toit. Le loyer est plafonné pour les boursiers.")],
        cau: [["Qu'est-ce qui caractérise cette résidence ?", "des studios petits mais beaucoup d'espaces partagés", ["de grands appartements", "des chambres sans cuisine"], "« des studios de dix-huit mètres carrés, mais une grande cuisine commune… »."],
          ["Pour qui le loyer est-il plafonné ?", "pour les étudiants boursiers", ["pour tous les étudiants", "pour les étudiants étrangers"], "« plafonné pour les boursiers »."]] },
      { doan: [d("nova", TIN, "Une enquête menée dans une grande école montre que la moitié des jeunes diplômés regarde d'abord la politique de télétravail avant même le salaire. Un argument que les recruteurs ont désormais du mal à ignorer.")],
        cau: [["Selon l'enquête, que regardent d'abord la moitié des jeunes diplômés ?", "la politique de télétravail", ["le salaire", "la localisation"], "« regarde d'abord la politique de télétravail »."],
          ["Quelle est la conséquence pour les recruteurs ?", "Ils doivent en tenir compte.", ["Ils baissent les salaires.", "Ils recrutent moins."], "« les recruteurs ont désormais du mal à ignorer »."]] },
      { doan: [d("echo", TIN, "Dans le Cantal, des villages offrent un logement à prix réduit aux jeunes professionnels qui acceptent de s'installer au moins deux ans. Médecins, enseignants, artisans : plusieurs ont déjà répondu à l'appel.")],
        cau: [["Que proposent ces villages ?", "un logement à prix réduit", ["un salaire plus élevé", "une voiture gratuite"], "« un logement à prix réduit »."],
          ["Quelle condition doivent accepter les jeunes ?", "rester au moins deux ans", ["travailler pour la mairie", "avoir des enfants"], "« s'installer au moins deux ans »."]] },
    ] },
  CE1: { tieuDe: "Lecture B2 · Đề 5 · Exercice 1 : se loger, le premier obstacle des jeunes",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p("<strong>Logement : quand trouver un toit devient un frein à l'emploi</strong>",
      "Pour une grande partie des jeunes, trouver un logement n'est plus une étape parmi d'autres, mais un véritable parcours d'obstacles. Selon un sondage Odoxa réalisé pour Nexity en janvier 2026, six jeunes sur dix déclarent avoir déjà rencontré des difficultés pour se loger. Le chiffre le plus frappant est ailleurs : 30 % affirment avoir renoncé à postuler à un emploi faute de solution de logement.",
      "Le constat n'est pas nouveau. Dès mars 2025, la Cour des comptes plaçait les étudiants, les alternants et les jeunes actifs parmi les profils les plus exposés aux tensions du marché locatif. En octobre 2025, un rapport du Sénat pointait le manque de petites surfaces abordables, précisément celles que recherchent les jeunes. Dans certaines régions, la hausse des prix aggrave encore la situation.",
      "Le sujet s'est invité dans la campagne des élections municipales de mars 2026. Selon le même sondage, 63 % des moins de 35 ans pourraient voter pour un candidat proposant des mesures concrètes sur le logement. Les associations spécialisées dans le logement des jeunes ont profité de la campagne pour avancer leurs propositions : faciliter l'accès au logement, mieux utiliser les logements existants, construire davantage de logements adaptés, encadrer les loyers et soutenir les structures d'accompagnement.",
      "Quelques mesures nationales apportent un peu d'air : les aides personnelles au logement ont ainsi été revalorisées de 1,15 % au 1er octobre 2026, au rythme de l'indice de référence des loyers. Mais pour les associations, ces ajustements ne compensent pas la rareté de l'offre. Tant que les jeunes devront choisir entre un emploi et un toit, préviennent-elles, c'est toute l'économie qui en paiera le prix.",
      nguon("Pretto, « Municipales 2026 : le logement, un enjeu clé pour séduire le vote des jeunes ? », mis à jour le 18 septembre 2026 (pretto.fr), qui cite le sondage Odoxa pour Nexity, la Cour des comptes et le Sénat", "CIDJ, « Ce qui change en octobre 2026 », 1er octobre 2026 (cidj.com)")),
    cau: cham([
      ["Selon le sondage Odoxa, quelle part des jeunes a eu des difficultés pour se loger ?", "six sur dix", ["trois sur dix", "neuf sur dix"], "« six jeunes sur dix »."],
      ["Quel chiffre l'auteur trouve-t-il le plus frappant ?", "30 % ont renoncé à postuler à un emploi.", ["63 % pourraient changer de vote.", "La hausse de 1,15 % des aides."], "« Le chiffre le plus frappant… 30 % affirment avoir renoncé à postuler »."],
      ["Qu'a souligné la Cour des comptes en 2025 ?", "Les jeunes sont parmi les plus exposés aux tensions du marché locatif.", ["Les loyers ont baissé.", "Les jeunes préfèrent la colocation."], "« les plus exposés aux tensions du marché locatif »."],
      ["Quel manque le rapport du Sénat pointe-t-il ?", "les petites surfaces abordables", ["les grandes maisons", "les résidences de luxe"], "« le manque de petites surfaces abordables »."],
      ["Pourquoi le logement est-il devenu un enjeu électoral ?", "Beaucoup de jeunes pourraient voter selon ce critère.", ["Les maires construisent tous les logements.", "Les jeunes votent obligatoirement."], "« 63 % des moins de 35 ans pourraient voter pour un candidat proposant des mesures »."],
      ["Quelle mesure nationale l'article cite-t-il ?", "la revalorisation des aides au logement", ["la baisse des loyers de 10 %", "la construction de résidences étudiantes"], "« les aides personnelles au logement ont ainsi été revalorisées de 1,15 % »."],
      ["Quelle est la position des associations ?", "Ces aides ne suffisent pas face au manque de logements.", ["Le problème est réglé.", "Il faut supprimer les aides."], "« ces ajustements ne compensent pas la rareté de l'offre »."],
    ], D9) },
  CE2: { tieuDe: "Lecture B2 · Đề 5 · Exercice 2 : le télétravail résiste",
    consigne: "<p>Vous lisez un article dans un journal économique francophone.</p>",
    readingText: p("<strong>Télétravail : la fin annoncée n'a pas eu lieu</strong>",
      "Aux États-Unis, plusieurs géants comme Amazon ou Tesla ont largement mis fin au travail à distance, et les annonces de « retour au bureau » font régulièrement les gros titres. En France, pourtant, la réalité est beaucoup plus calme. Selon une étude de l'Apec réalisée fin 2025 auprès de 2 000 cadres et de 1 000 entreprises, 89 % des entreprises n'ont pas modifié leur politique de télétravail en 2025, et 94 % ne prévoient pas de changer le nombre de jours autorisés en 2026.",
      "Les ajustements existent, mais ils restent limités et inégaux. Les petites et moyennes entreprises sont un peu plus nombreuses à réduire le télétravail que les grands groupes, où le modèle hybride s'est installé avec des règles de présence plus précises. Surtout, le débat se déplace : la question n'est plus tant « combien de jours ? » que « lesquels ? ». Une majorité de cadres en télétravail peuvent aujourd'hui choisir leurs jours chaque semaine, et cette souplesse est devenue un enjeu central.",
      "Pourquoi les employeurs hésitent-ils à revenir en arrière ? D'abord parce que le télétravail est devenu un argument de recrutement et de fidélisation : un cadre sur deux envisagerait de quitter son entreprise s'il était supprimé. Ensuite parce que le droit protège les salariés : lorsqu'il est prévu par un accord collectif ou par le contrat, le télétravail ne peut pas toujours être supprimé par une décision unilatérale de l'employeur.",
      "Les partisans d'un retour plus marqué avancent toutefois des arguments sérieux : renforcer la cohésion des équipes, faciliter l'intégration des nouveaux arrivants, entretenir une culture commune. Entre ces deux exigences, la plupart des entreprises françaises semblent avoir choisi la voie du compromis plutôt que celle de la rupture.",
      nguon("TPE Actu, « Télétravail : la fin annoncée ? Ce que disent vraiment les chiffres pour 2026 », 13 mars 2026 (tpeactu.fr), qui cite l'étude de l'Apec de décembre 2025")),
    cau: cham([
      ["Quelle est la situation en France selon l'article ?", "Le télétravail se maintient largement.", ["Le télétravail a disparu.", "Le télétravail est devenu obligatoire."], "« En France, pourtant, la réalité est beaucoup plus calme »."],
      ["Sur qui porte l'étude de l'Apec ?", "des cadres et des entreprises", ["des étudiants", "des fonctionnaires"], "« auprès de 2 000 cadres et de 1 000 entreprises »."],
      ["Selon l'étude, combien d'entreprises ne prévoient pas de changer le nombre de jours en 2026 ?", "94 %", ["89 %", "47 %"], "« 94 % ne prévoient pas de changer »."],
      ["Quels employeurs réduisent un peu plus le télétravail ?", "les petites et moyennes entreprises", ["les grands groupes", "les entreprises publiques"], "« Les petites et moyennes entreprises sont un peu plus nombreuses à réduire »."],
      ["Comment le débat évolue-t-il ?", "On discute surtout du choix des jours.", ["On discute de supprimer les bureaux.", "On discute des salaires."], "« la question n'est plus tant combien de jours que lesquels »."],
      ["Pourquoi le télétravail est-il un argument pour les employeurs ?", "Il aide à recruter et à garder les salariés.", ["Il fait baisser les impôts.", "Il est imposé par la loi."], "« un argument de recrutement et de fidélisation »."],
      ["Quelle est la conclusion de l'article ?", "La plupart des entreprises cherchent un compromis.", ["Le retour au bureau va s'imposer partout.", "Le télétravail complet va se généraliser."], "« la voie du compromis plutôt que celle de la rupture »."],
    ], D9) },
  CE3: { tieuDe: "Lecture B2 · Đề 5 · Exercice 3 : vivre chez ses parents après 25 ans ?",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Vivre chez ses parents après 25 ans, un échec ? »</p>",
    ten: ["Sarah", "Antoine", "Lina"],
    readingText: p("<strong>Sarah</strong>", "J'ai 27 ans et je suis retournée chez mes parents l'an dernier pour économiser un apport et acheter un appartement. Ce n'est pas un échec, c'est une stratégie. Dans beaucoup de pays, vivre en famille plus longtemps est normal ; c'est en France qu'on en a honte.",
      "<strong>Antoine</strong>", "Je comprends les raisons économiques, mais je pense qu'on perd quelque chose. Quand j'ai pris mon premier studio, minuscule, j'ai appris à gérer un budget, à cuisiner, à me débrouiller. Ces apprentissages-là, on ne les fait pas chez ses parents, même avec la meilleure volonté.",
      "<strong>Lina</strong>", "Le vrai problème, ce sont les loyers, pas les jeunes. On culpabilise des gens qui n'ont simplement pas le choix. Plutôt que de juger, il faudrait construire des logements abordables et encadrer les prix. Ce n'est pas une question de maturité, c'est une question politique."),
    cau: null },
  PE: PE("Đề 5", "<strong>Logement : un jeune sur trois renonce à un emploi</strong><br>Selon un sondage publié en 2026, 30 % des jeunes disent avoir déjà renoncé à postuler à un emploi faute de logement.",
    "Vous écrivez un article pour le journal de votre université. Vous analysez les causes de cette situation, ses conséquences pour les jeunes et pour la société, et vous proposez des solutions argumentées."),
  PO: PO("Đề 5", [
    S("1", "<strong>Choisir entre un emploi et un logement</strong>", "En 2026, près d'un jeune sur trois affirme avoir renoncé à un emploi faute de pouvoir se loger. Pour certains, c'est aux pouvoirs publics d'agir ; pour d'autres, les jeunes doivent accepter de s'installer là où les logements sont moins chers."),
    S("2", "<strong>Retour au bureau</strong>", "Certaines entreprises demandent à leurs salariés de revenir plus souvent au bureau pour renforcer l'esprit d'équipe. Les salariés, eux, mettent en avant le temps de transport et l'équilibre entre vie professionnelle et vie personnelle."),
    S("3", "<strong>Vivre à plusieurs générations</strong>", "Colocation entre étudiants et personnes âgées, retour chez les parents : la cohabitation entre générations progresse. Simple nécessité économique ou nouvelle façon de vivre ensemble ?"),
    S("4", "<strong>Quitter la grande ville</strong>", "Des villages offrent des logements bon marché aux jeunes qui acceptent de s'y installer. Une chance pour redynamiser les campagnes, ou une solution qui ne convient qu'à certains métiers ?"),
  ]),
};
DE5.CE3.cau = (() => { const x = ai(DE5.CE3.ten); return [
  x("Le problème vient du prix des logements.", "Lina", "Lina : « Le vrai problème, ce sont les loyers ».", 2),
  x("Vivre seul permet d'apprendre l'autonomie.", "Antoine", "Antoine : « j'ai appris à gérer un budget… à me débrouiller ».", 1.5),
  x("Rester chez ses parents peut être un choix réfléchi.", "Sarah", "Sarah : « Ce n'est pas un échec, c'est une stratégie ».", 1),
  x("La société juge injustement ces jeunes.", "Lina", "Lina : « On culpabilise des gens qui n'ont simplement pas le choix ».", 1.5),
  x("L'attitude des Français est différente de celle d'autres pays.", "Sarah", "Sarah : « c'est en France qu'on en a honte ».", 0.5),
  x("Il reconnaît les raisons économiques mais reste réservé.", "Antoine", "Antoine : « Je comprends les raisons économiques, mais… ».", 0.5),
]; })();

/* ═══════════════════════════ ĐỀ 6 : chaleur et réseaux sociaux ═══════════════════════════ */
const DE6 = { ten: "DELF B2 · Đề 6",
  CO1: { ten: "b2n-de6-co1", tieuDe: "Écoute B2 · Đề 6 · Exercice 1 : faut-il climatiser les écoles ?",
    gioiThieu: "Vous écoutez une émission à la radio.",
    doan: [d("sage", RADIO, "Après un été record, une question revient dans de nombreuses communes : faut-il équiper les écoles en climatisation ? Nous recevons un architecte spécialiste des bâtiments scolaires. Bonjour."),
      d("echo", KHACH, "Bonjour. Ma réponse va peut-être surprendre : la climatisation doit être le dernier recours, pas le premier. D'abord parce qu'elle rejette de la chaleur dehors, ce qui réchauffe la ville. Ensuite parce qu'elle consomme beaucoup d'électricité, au moment précis où le réseau est le plus sollicité."),
      d("sage", RADIO, "Que proposez-vous à la place ?"),
      d("echo", KHACH, "Il faut commencer par empêcher la chaleur d'entrer : des volets extérieurs, des toitures claires ou végétalisées, une bonne isolation. Ensuite, ventiler la nuit, quand l'air est plus frais. Et transformer les cours : un arbre, c'est une climatisation naturelle, qui ne consomme rien. Avec ces mesures, on gagne plusieurs degrés dans les classes."),
      d("sage", RADIO, "Mais tout cela prend du temps."),
      d("echo", KHACH, "C'est vrai, et c'est cher. Pour les écoles qui ne peuvent pas attendre, je conseille d'équiper au moins une salle de repli, où les enfants les plus fragiles peuvent se reposer. Le vrai danger serait de climatiser partout sans rien changer au bâtiment : on paierait plus, et on chaufferait encore davantage les villes.")],
    cau: cham([
      ["Quelle est la position de l'architecte sur la climatisation ?", "Elle doit être un dernier recours.", ["Elle est indispensable partout.", "Elle doit être interdite."], "« la climatisation doit être le dernier recours, pas le premier »."],
      ["Pourquoi la climatisation réchauffe-t-elle la ville ?", "Elle rejette de la chaleur à l'extérieur.", ["Elle produit de la fumée.", "Elle attire le soleil."], "« elle rejette de la chaleur dehors »."],
      ["Quel autre inconvénient cite-t-il ?", "une forte consommation d'électricité", ["un bruit insupportable", "un risque d'incendie"], "« elle consomme beaucoup d'électricité »."],
      ["Quelle est la première étape selon lui ?", "empêcher la chaleur d'entrer", ["acheter des ventilateurs", "fermer les écoles l'après-midi"], "« Il faut commencer par empêcher la chaleur d'entrer »."],
      ["Quand faut-il ventiler les bâtiments ?", "la nuit", ["à midi", "le week-end"], "« ventiler la nuit, quand l'air est plus frais »."],
      ["Que conseille-t-il aux écoles qui ne peuvent pas attendre ?", "équiper au moins une salle de repli", ["fermer en juin", "climatiser toutes les classes"], "« équiper au moins une salle de repli »."],
      ["Quel est, selon lui, le vrai danger ?", "climatiser partout sans adapter les bâtiments", ["planter trop d'arbres", "ventiler la nuit"], "« climatiser partout sans rien changer au bâtiment »."],
    ], D9) },
  CO2: { ten: "b2n-de6-co2", tieuDe: "Écoute B2 · Đề 6 · Exercice 2 : une ville face à la sécheresse",
    gioiThieu: "Vous écoutez un reportage à la radio.",
    doan: [d("onyx", RADIO, "Dans cette commune du Gers, l'été 2026 restera dans les mémoires : pendant trois semaines, l'eau du robinet a été coupée la nuit pour préserver les réserves. Le maire raconte."),
      d("shimmer", KHACH, "On n'avait jamais connu ça. On a distribué des bouteilles aux personnes âgées et aux familles avec des bébés. Les habitants ont été très solidaires, mais on a aussi vu des tensions, par exemple avec ceux qui continuaient à remplir leur piscine."),
      d("onyx", RADIO, "Depuis, la commune a voté un plan : récupération de l'eau de pluie dans les bâtiments publics, réparation des fuites du réseau, qui faisaient perdre une part importante de l'eau, et aides pour les habitants qui installent des récupérateurs. Les agriculteurs, eux, s'inquiètent : sans eau, certaines cultures ne seront plus possibles. Une réunion publique est prévue en décembre pour parler du partage de l'eau.")],
    cau: cham([
      ["Que s'est-il passé dans la commune pendant l'été ?", "L'eau a été coupée la nuit.", ["La ville a été inondée.", "Les habitants ont été évacués."], "« l'eau du robinet a été coupée la nuit »."],
      ["Pendant combien de temps ?", "trois semaines", ["trois jours", "trois mois"], "« pendant trois semaines »."],
      ["À qui la mairie a-t-elle distribué des bouteilles ?", "aux personnes âgées et aux familles avec bébés", ["à tous les habitants", "aux touristes"], "« aux personnes âgées et aux familles avec des bébés »."],
      ["Quelle source de tension le maire évoque-t-il ?", "le remplissage des piscines", ["le prix de l'eau", "les coupures d'électricité"], "« ceux qui continuaient à remplir leur piscine »."],
      ["Quelle mesure du plan concerne le réseau ?", "réparer les fuites", ["construire un barrage", "augmenter le prix de l'eau"], "« réparation des fuites du réseau »."],
      ["De quoi s'inquiètent les agriculteurs ?", "de ne plus pouvoir faire certaines cultures", ["de perdre leurs aides", "de la concurrence étrangère"], "« certaines cultures ne seront plus possibles »."],
      ["Quel sera le thème de la réunion de décembre ?", "le partage de l'eau", ["les élections", "le tourisme"], "« pour parler du partage de l'eau »."],
    ], D9) },
  CO3: { ten: "b2n-de6-co3", tieuDe: "Écoute B2 · Đề 6 · Exercice 3 : trois courts documents",
    docs: [
      { doan: [d("alloy", TIN, "À Strasbourg, où le thermomètre a dépassé quarante degrés cet été pour la première fois, la ville prévoit de planter plusieurs milliers d'arbres d'ici 2030, en priorité près des écoles et des maisons de retraite.")],
        cau: [["Qu'est-il arrivé à Strasbourg cet été ?", "La température a dépassé 40 °C pour la première fois.", ["Il y a eu des inondations.", "La ville a manqué d'électricité."], "« a dépassé quarante degrés cet été pour la première fois »."],
          ["Où les arbres seront-ils plantés en priorité ?", "près des écoles et des maisons de retraite", ["dans les parcs", "le long des autoroutes"], "« en priorité près des écoles et des maisons de retraite »."]] },
      { doan: [d("nova", TIN, "Un réseau social populaire chez les adolescents annonce qu'il désactivera par défaut les notifications nocturnes pour les comptes de mineurs. Une mesure saluée par les associations de parents, qui la jugent toutefois tardive.")],
        cau: [["Que va faire ce réseau social ?", "désactiver les notifications la nuit pour les mineurs", ["interdire les mineurs", "supprimer les vidéos"], "« désactivera par défaut les notifications nocturnes »."],
          ["Comment les associations de parents réagissent-elles ?", "Elles saluent la mesure mais la trouvent tardive.", ["Elles la critiquent fortement.", "Elles ne réagissent pas."], "« saluée… qui la jugent toutefois tardive »."]] },
      { doan: [d("echo", TIN, "Dans un collège de Bretagne, les élèves ont créé une « carte des îlots de fraîcheur » de leur ville : parcs, églises, bibliothèques. Elle sera distribuée aux habitants avant l'été prochain.")],
        cau: [["Qu'ont créé les élèves ?", "une carte des lieux frais de leur ville", ["une application de météo", "un jardin"], "« une carte des îlots de fraîcheur »."],
          ["Quand la carte sera-t-elle distribuée ?", "avant l'été prochain", ["à Noël", "à la rentrée"], "« avant l'été prochain »."]] },
    ] },
  CE1: { tieuDe: "Lecture B2 · Đề 6 · Exercice 1 : après l'été 2026, s'adapter",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p("<strong>Été 2026 : un record qui ressemble à un avertissement</strong>",
      "Les chiffres sont désormais officiels : selon Météo-France, l'été 2026 est le plus chaud jamais mesuré en France, devant 2003 et 2022, et juillet a été le mois le plus chaud depuis le début des relevés, en 1900. La vague de chaleur de la fin juin a été la plus intense jamais enregistrée : le 25 juin, 72 départements se trouvaient en vigilance rouge, du jamais-vu depuis la création du dispositif en 2004.",
      "Le coût humain est considérable. Santé publique France estime à plus de 7 300 le nombre de décès en excès liés aux épisodes de chaleur, l'Île-de-France étant la région la plus touchée. Les grandes agglomérations paient le prix de leur minéralité : le béton et le bitume emmagasinent la chaleur le jour et la restituent la nuit, empêchant les corps de récupérer.",
      "À la chaleur s'est ajoutée une sécheresse inédite. Les sols n'ont jamais été aussi secs depuis le début des mesures, et une large partie du territoire a connu des restrictions d'eau. Le système électrique a lui aussi été mis sous tension : la demande de climatisation augmentait au moment même où la sécheresse réduisait la production hydroélectrique et obligeait certaines centrales à baisser leur production.",
      "Ce cercle vicieux résume le défi des prochaines années. Climatiser davantage, c'est consommer plus d'électricité et rejeter plus de chaleur dans les rues. S'adapter durablement suppose donc de transformer les villes elles-mêmes : végétaliser, isoler, repenser les horaires. Le gouvernement a promis de nouvelles mesures ; elles seront jugées à leur capacité à préparer le pays, non pas à un été exceptionnel, mais à des étés qui risquent de devenir ordinaires.",
      nguon("Selectra, « Canicules de l'été 2026 : bilan des décès, records et sécheresse » (selectra.info)", "Banque des Territoires, « Canicule, sécheresse, incendies : le bilan climatique hors normes de l'été 2026 » (banquedesterritoires.fr)", "données Météo-France et Santé publique France citées par ces articles")),
    cau: cham([
      ["Selon Météo-France, l'été 2026 est…", "le plus chaud jamais mesuré en France", ["le deuxième plus chaud", "plus frais que 2003"], "« le plus chaud jamais mesuré en France, devant 2003 et 2022 »."],
      ["Qu'a eu d'exceptionnel le 25 juin ?", "72 départements étaient en vigilance rouge.", ["Il a neigé dans les Alpes.", "Toutes les écoles ont fermé."], "« 72 départements se trouvaient en vigilance rouge, du jamais-vu »."],
      ["Quelle région a été la plus touchée par les décès ?", "l'Île-de-France", ["la Bretagne", "l'Occitanie"], "« l'Île-de-France étant la région la plus touchée »."],
      ["Pourquoi la chaleur est-elle plus dangereuse dans les grandes villes ?", "Le béton et le bitume restituent la chaleur la nuit.", ["Il y a plus de voitures électriques.", "Les hôpitaux sont fermés l'été."], "« le béton et le bitume emmagasinent la chaleur… la restituent la nuit »."],
      ["Pourquoi le système électrique a-t-il été sous tension ?", "La demande augmentait alors que la production baissait.", ["Les centrales étaient en grève.", "Les prix ont doublé."], "« la demande de climatisation augmentait au moment même où la sécheresse réduisait la production »."],
      ["Qu'est-ce que le « cercle vicieux » évoqué par l'auteur ?", "Climatiser consomme plus et réchauffe davantage les rues.", ["La sécheresse provoque des inondations.", "Les arbres coûtent trop cher."], "« Climatiser davantage, c'est consommer plus d'électricité et rejeter plus de chaleur »."],
      ["Selon l'auteur, comment faudra-t-il juger les nouvelles mesures ?", "à leur capacité à préparer des étés chauds devenus ordinaires", ["à leur coût", "à leur popularité"], "« à des étés qui risquent de devenir ordinaires »."],
    ], D9) },
  CE2: { tieuDe: "Lecture B2 · Đề 6 · Exercice 2 : l'Australie, laboratoire d'une interdiction",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p("<strong>Réseaux sociaux interdits aux moins de 16 ans : le bilan mitigé de l'Australie</strong>",
      "Quand l'Australie a interdit, en décembre 2025, l'accès des moins de 16 ans à des plateformes comme Facebook, Instagram ou TikTok, le monde entier a regardé. C'était le premier pays à aller aussi loin. Quelques mois plus tard, les premiers résultats invitent à la prudence.",
      "Une étude publiée dans le British Medical Journal, après relecture par d'autres chercheurs, a interrogé plus de 400 jeunes juste avant l'entrée en vigueur de la loi, puis trois mois après. Ses conclusions sont nuancées : peu de changements chez les 12-13 ans, une légère baisse d'utilisation chez les 14-15 ans, et une hausse chez les 16 ans et plus. Les auteurs ne trouvent pas de preuves suffisantes d'un effet important à court terme, et décrivent une loi appliquée de manière incomplète.",
      "Les moyens de contournement ne manquent pas : comptes ouverts au nom d'un adulte, faux profils, navigation privée. Les plateformes, elles, risquent pourtant des amendes très élevées, jusqu'à 49,5 millions de dollars australiens, si elles ne prouvent pas des efforts significatifs. Pour la ministre des Communications, ce n'est pas la loi qui est défaillante, mais les géants du numérique qui ne la respectent pas.",
      "L'expérience australienne est observée de près par d'autres pays, du Royaume-Uni à la Nouvelle-Zélande, et nourrit le débat européen. Elle montre qu'une interdiction, aussi populaire soit-elle auprès des parents, ne suffit pas : sans outils de contrôle fiables et sans coopération des entreprises, la règle reste en partie théorique. Trois mois, rappellent cependant les chercheurs, c'est bien peu pour juger d'un changement de société.",
      nguon("CB News / AFP, « Australie : bilan mitigé pour l'interdiction des réseaux sociaux pour les moins de 16 ans », 25 juin 2026 (cbnews.fr)", "Toute l'Europe, dossier mis à jour le 17 septembre 2026 (touteleurope.eu)")),
    cau: cham([
      ["Depuis quand l'Australie interdit-elle les réseaux sociaux aux moins de 16 ans ?", "décembre 2025", ["juin 2026", "janvier 2025"], "« en décembre 2025 »."],
      ["Comment l'étude a-t-elle été menée ?", "en interrogeant des jeunes avant et trois mois après la loi", ["en analysant les données des plateformes", "en interrogeant les parents"], "« interrogé plus de 400 jeunes juste avant… puis trois mois après »."],
      ["Qu'a-t-on observé chez les 16 ans et plus ?", "une hausse de l'utilisation", ["une forte baisse", "aucun changement"], "« une hausse chez les 16 ans et plus »."],
      ["Quelle est la conclusion des chercheurs ?", "Pas de preuve suffisante d'un effet important à court terme.", ["La loi est un échec total.", "Les jeunes ont quitté les réseaux."], "« ne trouvent pas de preuves suffisantes d'un effet important à court terme »."],
      ["Quel moyen de contournement l'article cite-t-il ?", "ouvrir un compte au nom d'un adulte", ["changer de pays", "acheter un nouveau téléphone"], "« comptes ouverts au nom d'un adulte »."],
      ["Selon la ministre, qui est responsable du problème ?", "les géants du numérique", ["les parents", "les écoles"], "« les géants du numérique qui ne la respectent pas »."],
      ["Que rappellent les chercheurs à la fin ?", "Trois mois, c'est trop court pour juger.", ["La loi doit être abandonnée.", "Il faut interdire jusqu'à 18 ans."], "« Trois mois… c'est bien peu pour juger »."],
    ], D9) },
  CE3: { tieuDe: "Lecture B2 · Đề 6 · Exercice 3 : la climatisation, pour ou contre ?",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Faut-il installer la climatisation dans tous les logements ? »</p>",
    ten: ["Gérard", "Yasmine", "Hugo"],
    readingText: p("<strong>Gérard</strong>", "J'ai 78 ans et cet été, mon appartement au dernier étage est monté à 35 degrés la nuit. Mon médecin m'a dit que c'était dangereux. Alors oui, j'ai fait installer un climatiseur, et je ne le regrette pas. Pour les personnes âgées, ce n'est pas un luxe, c'est une question de santé.",
      "<strong>Yasmine</strong>", "Je suis ingénieure en énergie. Si tout le monde climatise, on consomme énormément d'électricité et on réchauffe les rues avec l'air chaud rejeté. C'est un cercle vicieux. La priorité, c'est d'isoler les logements, d'installer des volets et de planter des arbres. La climatisation doit rester l'exception.",
      "<strong>Hugo</strong>", "Je suis locataire et je n'ai pas les moyens d'acheter un climatiseur, ni le droit de faire des travaux. On parle toujours de solutions, mais ce sont les propriétaires qui décident. Il faudrait obliger les propriétaires à rendre les logements vivables l'été, comme on les oblige à les chauffer l'hiver."),
    cau: null },
  PE: PE("Đề 6", "<strong>Été 2026 : plus de 7 300 décès liés à la chaleur</strong><br>Selon Santé publique France, les vagues de chaleur de l'été 2026, le plus chaud jamais mesuré, ont causé plus de 7 300 décès en excès.",
    "Vous écrivez au courrier des lecteurs d'un journal régional. Vous expliquez pourquoi, selon vous, la France n'est pas encore prête à affronter de tels étés, et vous proposez des mesures concrètes et argumentées pour les villes et pour les habitants."),
  PO: PO("Đề 6", [
    S("1", "<strong>Climatiser ou adapter ?</strong>", "Après l'été le plus chaud jamais mesuré, les ventes de climatiseurs explosent. Pour les uns, c'est une protection indispensable pour les plus fragiles ; pour les autres, une fausse solution qui consomme de l'énergie et réchauffe les villes."),
    S("2", "<strong>L'eau, un bien à partager</strong>", "Pendant la sécheresse de 2026, des communes ont dû couper l'eau la nuit. Faut-il interdire certains usages, comme les piscines privées, pour préserver l'eau potable et l'agriculture ?"),
    S("3", "<strong>Interdire les réseaux sociaux aux adolescents ?</strong>", "L'Australie a interdit les réseaux sociaux aux moins de 16 ans, mais les premiers résultats sont mitigés. Une interdiction peut-elle vraiment protéger les jeunes, ou faut-il plutôt les éduquer ?"),
    S("4", "<strong>Changer nos horaires l'été ?</strong>", "Commencer le travail et l'école plus tôt, faire une pause l'après-midi : certains proposent d'adopter les rythmes des pays du Sud pendant les canicules. Bonne idée ou fausse bonne idée ?"),
  ]),
};
DE6.CE3.cau = (() => { const x = ai(DE6.CE3.ten); return [
  x("La climatisation est une nécessité pour certaines personnes.", "Gérard", "Gérard : « ce n'est pas un luxe, c'est une question de santé ».", 2),
  x("Il faut d'abord isoler et végétaliser.", "Yasmine", "Yasmine : « La priorité, c'est d'isoler les logements ».", 1.5),
  x("Les locataires n'ont pas le pouvoir d'agir.", "Hugo", "Hugo : « ce sont les propriétaires qui décident ».", 1),
  x("Une généralisation de la climatisation aggraverait le problème.", "Yasmine", "Yasmine : « C'est un cercle vicieux ».", 1.5),
  x("Il propose une obligation pour les propriétaires.", "Hugo", "Hugo : « Il faudrait obliger les propriétaires ».", 0.5),
  x("Il a suivi un conseil médical.", "Gérard", "Gérard : « Mon médecin m'a dit que c'était dangereux ».", 0.5),
]; })();

export const CAC_DE = [DE4, DE5, DE6];

/* Ex3 nghe: 6 câu của 3 tài liệu chấm theo D7 (= 7 đ), theo thứ tự xuất hiện. */
for (const de of CAC_DE) { let k = 0; for (const doc of de.CO3.docs) doc.cau = doc.cau.map((x) => q(...x, D7[k++])); }
