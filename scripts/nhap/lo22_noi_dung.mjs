/* Lô 22 (19/10): NỘI DUNG 3 đề DELF B1 mới (Đề 4, 5, 6), chủ đề nghị luận xã hội CẬP NHẬT 2026.
 *
 * Bài đọc chính mỗi đề: FRACILE VIẾT LẠI HOÀN TOÀN bằng lời của mình từ THÔNG TIN trong
 * bài báo uy tín (không chép câu gốc; dữ kiện và con số giữ đúng nguồn), cuối bài ghi
 * « Sources : … » kèm tên báo, ngày, đường link. Kịch bản nghe, thông báo, đề nói do
 * FRACILE soạn, không gán cho người thật. Không dùng dấu gạch dài (quy tắc 7).
 * Máy dựng: lo22_de_moi.mjs (khuôn lo18/lo21). */

let dem = 0;
export const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261020;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
export const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const vf = (prompt, dung, justification) => ({ id: id("q"), type: "vf", prompt, answer: dung ? 0 : 1, justification });
const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
const S = (ma, ...ds) => ({ ma, html: p(...ds) });
const d = (giong, cach, chu) => ({ giong, cach, chu });
const nguon = (...ds) => `<p><small><em>Texte rédigé par FRACILE à partir de : ${ds.join(" ; ")}.</em></small></p>`;

const VUA = "Parle en français de France, débit modéré et clair.";
const RADIO = "Parle en français de France, comme un journaliste de radio, débit naturel et posé.";
const KHACH = "Parle en français de France, comme une personne interviewée à la radio, débit naturel.";

const PO_DAU = (ten) => ({ tieuDe: `Production orale B1 · ${ten}`,
  consigne: p("<strong>Production orale : 15 minutes environ.</strong> 10 minutes de préparation pour la partie 3.", "<strong>1. Entretien dirigé</strong> (2 à 3 minutes, sans préparation) : parlez de vous, de vos études ou de votre travail, de vos loisirs et de vos projets.", "Pour les parties 2 et 3, vous tirez au sort deux sujets et vous en choisissez un.") });

/* ══════════════════════════ B1 · Đề 4 : réseaux sociaux et adolescents ══════════════════════════ */
export const B1_4 = { level: "B1", ten: "DELF B1 · Đề 4", kieuNghe: "a",
  CO: [
    { ten: "b1-de4-co1", tieuDe: "Écoute B1 · Đề 4 · Exercice 1 : une semaine sans écran", gioiThieu: "Vous écoutez une émission de radio locale.",
      doan: [d("sage", RADIO, "Dans notre rubrique « Vie de quartier », nous sommes au collège Jean-Moulin, où une classe de quatrième vient de vivre une semaine sans réseaux sociaux. Madame Perrin, vous êtes leur professeure principale. D'où vient l'idée ?"),
        d("shimmer", KHACH, "Ce sont les élèves eux-mêmes qui l'ont proposée ! Ils avaient remarqué qu'ils se couchaient trop tard. On a fait un contrat : pendant sept jours, pas d'applications le soir, seulement les messages à la famille. Pour les aider, on a organisé des activités après les cours : un tournoi de jeux de société, un atelier de cuisine et des matchs de basket."),
        d("sage", RADIO, "Et le bilan ?"),
        d("shimmer", KHACH, "Plutôt positif. La plupart disent qu'ils ont mieux dormi. Le plus difficile, c'était les deux premiers jours : ils avaient peur de rater quelque chose. Trois élèves n'ont pas tenu jusqu'au bout, et ce n'est pas grave, ils en ont parlé honnêtement. Maintenant, la classe veut présenter l'expérience aux parents, lors d'une réunion en décembre.")],
      cau: [
        qcm("Qui a eu l'idée de la semaine sans réseaux sociaux ?", "les élèves", ["la professeure", "les parents"], "« Ce sont les élèves eux-mêmes qui l'ont proposée »."),
        qcm("Pourquoi les élèves ont-ils voulu faire cette expérience ?", "Ils se couchaient trop tard.", ["Ils avaient de mauvaises notes.", "Leurs parents étaient fâchés."], "« ils se couchaient trop tard »."),
        qcm("Pendant la semaine, les élèves pouvaient…", "envoyer des messages à leur famille", ["utiliser les applications le week-end", "jouer en ligne une heure par jour"], "« seulement les messages à la famille »."),
        qcm("Quelle activité n'est PAS citée ?", "un club de lecture", ["un atelier de cuisine", "des matchs de basket"], "Sont cités : jeux de société, cuisine, basket."),
        qcm("Selon la professeure, la plupart des élèves…", "ont mieux dormi", ["ont eu de meilleures notes", "ont arrêté les réseaux sociaux"], "« La plupart disent qu'ils ont mieux dormi »."),
        qcm("Les deux premiers jours étaient difficiles parce que les élèves…", "avaient peur de rater quelque chose", ["s'ennuyaient à l'école", "étaient malades"], "« ils avaient peur de rater quelque chose »."),
        qcm("Que veut faire la classe maintenant ?", "présenter l'expérience aux parents", ["recommencer chaque mois", "écrire un livre"], "« la classe veut présenter l'expérience aux parents »."),
      ] },
    { ten: "b1-de4-co2", tieuDe: "Écoute B1 · Đề 4 · Exercice 2 : un message du lycée", gioiThieu: "Vous êtes parent d'élève. Vous écoutez un message du lycée.",
      doan: [d("onyx", VUA, "Bonjour, ici le secrétariat du lycée Victor-Hugo. Comme vous le savez, à partir de cette année, les téléphones portables ne peuvent plus être utilisés dans l'établissement. Concrètement, les élèves rangent leur téléphone éteint dans leur sac. Ils peuvent l'utiliser uniquement en cours, si le professeur le demande pour une activité. En cas d'urgence, vous pouvez toujours appeler le secrétariat. Une réunion d'information aura lieu jeudi à dix-huit heures, en salle polyvalente. Merci.")],
      cau: [
        qcm("Cette année, au lycée, les élèves…", "ne peuvent plus utiliser leur téléphone", ["doivent laisser leur téléphone à la maison", "peuvent utiliser leur téléphone à la récréation"], "« les téléphones portables ne peuvent plus être utilisés dans l'établissement »."),
        qcm("Où les élèves gardent-ils leur téléphone ?", "éteint, dans leur sac", ["dans un casier à l'entrée", "chez le surveillant"], "« les élèves rangent leur téléphone éteint dans leur sac »."),
        qcm("Les élèves peuvent utiliser leur téléphone…", "en cours, si le professeur le demande", ["à la cantine", "jamais"], "« uniquement en cours, si le professeur le demande »."),
        qcm("En cas d'urgence, les parents doivent…", "appeler le secrétariat", ["envoyer un message à leur enfant", "venir au lycée"], "« vous pouvez toujours appeler le secrétariat »."),
        qcm("La réunion d'information a lieu…", "jeudi à 18 h", ["jeudi à 8 h", "mardi à 18 h"], "« jeudi à dix-huit heures »."),
      ] },
  ],
  CE: [
    { tieuDe: "Lecture B1 · Đề 4 · Exercice 1 : choisir une activité pour un adolescent", consigne: "<p>Vous cherchez une activité pour votre neveu de 14 ans. Lisez les annonces et répondez aux questions.</p>",
      readingText: p("<strong>A. Club de robotique</strong> : mercredi 14 h à 16 h, 12 à 16 ans, 80 € l'année. Matériel fourni.", "<strong>B. Atelier photo au smartphone</strong> : samedi matin, 10 séances, 60 €. Apporter son téléphone.", "<strong>C. Théâtre d'improvisation</strong> : mardi 18 h, groupe de 10 jeunes maximum, spectacle en juin, 150 € l'année.", "<strong>D. Randonnée nature</strong> : un dimanche par mois, gratuit, sans écran : téléphones laissés au départ.", "<strong>E. Cours de guitare en ligne</strong> : horaires libres, 15 € par mois, premier mois offert."),
      cau: [
        qcm("Votre neveu veut une activité où il ne paie rien. Vous choisissez…", "D", ["A", "E"], "D : « gratuit »."),
        qcm("Il veut apprendre chez lui, quand il veut. Vous choisissez…", "E", ["B", "C"], "E : « en ligne, horaires libres »."),
        qcm("Il aime monter sur scène. Vous choisissez…", "C", ["A", "D"], "C : « spectacle en juin »."),
        qcm("Pour quelle activité n'a-t-il pas besoin d'acheter de matériel ?", "A", ["B", "E"], "A : « Matériel fourni »."),
        qcm("Dans l'activité D, les téléphones…", "sont laissés au départ", ["servent à prendre des photos", "sont obligatoires pour la sécurité"], "« téléphones laissés au départ »."),
      ] },
    { tieuDe: "Lecture B1 · Đề 4 · Exercice 2 : réseaux sociaux avant 15 ans, la loi bloquée", consigne: "<p>Lisez l'article puis répondez aux questions.</p>",
      readingText: p("<strong>Réseaux sociaux avant 15 ans : une interdiction votée… puis bloquée</strong>",
        "Le 21 juillet 2026, après des mois de débats, les députés et les sénateurs ont adopté une loi très attendue par de nombreux parents : à partir du 1er septembre, les jeunes de moins de 15 ans ne pourraient plus créer de compte sur les réseaux sociaux, et les comptes déjà ouverts devaient être supprimés avant le 1er janvier 2027. La France devenait ainsi le premier pays de l'Union européenne à voter une telle interdiction générale.",
        "Mais la mesure n'est jamais entrée en vigueur. Saisi par des députés, le Conseil constitutionnel l'a censurée le 14 août. Les juges n'ont pas contesté l'objectif de protéger les adolescents. Ils ont estimé que le texte allait trop loin : il pouvait concerner des services sans danger prouvé pour les jeunes, il limitait la liberté d'expression, et il obligeait à vérifier l'âge de tous les utilisateurs sans préciser comment protéger leurs données personnelles.",
        "Une autre partie de la loi, en revanche, a été conservée : depuis la rentrée 2026, l'interdiction du téléphone portable, qui existait déjà à l'école et au collège, s'applique aussi au lycée. Chaque établissement fixe les règles précises dans son règlement intérieur.",
        "Le débat n'est pas terminé. Le gouvernement doit présenter un nouveau projet avant le printemps 2027. De son côté, la Commission européenne prépare un outil commun de vérification de l'âge, sur lequel travaillent sept pays, dont la France. Une question reste au centre des discussions : comment protéger les plus jeunes sans surveiller tout le monde ?",
        nguon("Toute l'Europe, « Les députés et sénateurs français approuvent l'interdiction de l'accès aux réseaux sociaux pour les moins de 15 ans », 21 juillet 2026 (touteleurope.eu)", "Toute l'Europe, « Pourquoi l'interdiction des réseaux sociaux aux moins de 15 ans reste un casse-tête en France et en Europe », mis à jour le 17 septembre 2026 (touteleurope.eu)")),
      cau: [
        qcm("Que prévoyait la loi votée en juillet 2026 ?", "interdire aux moins de 15 ans de créer un compte sur les réseaux sociaux", ["interdire Internet aux moins de 15 ans", "limiter le temps d'écran à deux heures"], "« les jeunes de moins de 15 ans ne pourraient plus créer de compte »."),
        vf("D'après l'article, la France était le premier pays de l'Union européenne à voter une telle interdiction.", true, "« La France devenait ainsi le premier pays de l'Union européenne à voter une telle interdiction générale »"),
        qcm("Qu'a décidé le Conseil constitutionnel le 14 août ?", "Il a censuré l'interdiction.", ["Il a avancé la date de la loi.", "Il a approuvé toute la loi."], "« le Conseil constitutionnel l'a censurée le 14 août »."),
        vf("Les juges ont critiqué l'objectif de protéger les adolescents.", false, "« Les juges n'ont pas contesté l'objectif de protéger les adolescents »"),
        qcm("Quel problème posait la vérification de l'âge ?", "La protection des données personnelles n'était pas précisée.", ["Elle coûtait trop cher.", "Elle était impossible techniquement."], "« sans préciser comment protéger leurs données personnelles »."),
        qcm("Quelle partie de la loi s'applique depuis la rentrée 2026 ?", "l'interdiction du portable au lycée", ["la suppression des comptes", "l'interdiction des jeux vidéo"], "« l'interdiction du téléphone portable… s'applique aussi au lycée »."),
        qcm("Que doit faire le gouvernement avant le printemps 2027 ?", "présenter un nouveau projet", ["supprimer les réseaux sociaux", "organiser un référendum"], "« Le gouvernement doit présenter un nouveau projet avant le printemps 2027 »."),
        qcm("La question finale de l'article porte sur…", "l'équilibre entre protection des jeunes et surveillance", ["le prix des téléphones", "les résultats scolaires"], "« comment protéger les plus jeunes sans surveiller tout le monde ? »."),
      ] },
  ],
  PE: { tieuDe: "Production écrite B1 · Đề 4 : les réseaux sociaux à 15 ans", consigne: "<p><strong>Production écrite : 45 minutes, 160 mots minimum.</strong></p>",
    questions: [{ type: "open", prompt: "Sur un forum, un lycéen écrit : « En France, on voulait interdire les réseaux sociaux avant 15 ans. Moi, j'ai eu mon premier compte à 12 ans et ça m'a beaucoup aidé à garder contact avec mes amis. » Vous lui répondez : vous donnez votre opinion sur cette interdiction, vous racontez votre propre expérience et vous proposez une solution. (160 mots minimum)" }] },
  PO: { ...PO_DAU("Đề 4"),
    bocTham: { chuanBi: 10, phan: [
      { ten: "2. Exercice en interaction (3 à 4 minutes)", cachLam: "Jouez la situation. L'examinateur joue l'autre personne.", soRut: 2, sujets: [
        S("1", "Votre petit frère de 12 ans veut un compte sur un réseau social. Vous en discutez avec vos parents pour trouver une règle juste."),
        S("2", "Au lycée, votre téléphone a été confisqué pendant une journée. Vous trouvez cela injuste. Vous en parlez au conseiller principal d'éducation."),
        S("3", "Un ami passe tout son temps sur son téléphone quand vous sortez ensemble. Vous lui en parlez sans le vexer."),
        S("4", "Vous voulez organiser une soirée « sans écran » avec vos colocataires. L'un d'eux n'est pas d'accord. Vous essayez de le convaincre.")] },
      { ten: "3. Expression d'un point de vue (5 à 7 minutes)", cachLam: "Dégagez le thème du document, puis présentez votre opinion. L'examinateur vous pose ensuite quelques questions.", soRut: 2, sujets: [
        S("1", "« Interdire les réseaux sociaux aux moins de 15 ans : protection nécessaire ou mesure impossible à appliquer ? »", "<em>Thème d'actualité 2026 (loi votée en juillet, censurée en août).</em>"),
        S("2", "« Depuis la rentrée 2026, le portable est interdit au lycée. Les élèves sont-ils plus attentifs ? »", "<em>Thème d'actualité 2026.</em>"),
        S("3", "« Faut-il montrer sa carte d'identité pour utiliser Internet ? »", "<em>Thème d'actualité 2026 (vérification de l'âge en ligne).</em>"),
        S("4", "« Les parents doivent-ils contrôler le téléphone de leurs enfants ? »", "<em>Sujet de débat.</em>")] },
    ] } },
};

/* ══════════════════════════ B1 · Đề 5 : santé mentale des jeunes ══════════════════════════ */
export const B1_5 = { level: "B1", ten: "DELF B1 · Đề 5", kieuNghe: "a",
  CO: [
    { ten: "b1-de5-co1", tieuDe: "Écoute B1 · Đề 5 · Exercice 1 : une ligne d'écoute étudiante", gioiThieu: "Vous écoutez une émission de radio étudiante.",
      doan: [d("sage", RADIO, "Bienvenue dans « Campus Info ». Aujourd'hui, nous parlons d'une ligne d'écoute créée par des étudiants pour des étudiants. Inès, vous êtes bénévole. Comment ça fonctionne ?"),
        d("nova", KHACH, "C'est un numéro qu'on peut appeler tous les soirs, de vingt et une heures à deux heures du matin. Ce sont des étudiants qui répondent, mais ils ont tous suivi une formation de trente heures avec des psychologues. On n'est pas là pour soigner : on écoute, et si la personne en a besoin, on l'oriente vers un professionnel."),
        d("sage", RADIO, "Pourquoi le soir ?"),
        d("nova", KHACH, "Parce que c'est le moment où on se sent le plus seul, surtout quand on vient d'arriver dans une nouvelle ville. Beaucoup d'appels concernent le stress des examens, mais aussi la solitude et les problèmes d'argent. Ce qui revient souvent, c'est : « Je ne voulais pas déranger. » On répète toujours qu'on ne dérange jamais. Et on rappelle aussi que les étudiants peuvent avoir des séances gratuites avec un psychologue.")],
      cau: [
        qcm("Qui répond aux appels ?", "des étudiants formés", ["des psychologues", "des médecins"], "« Ce sont des étudiants qui répondent… ils ont tous suivi une formation »."),
        qcm("La ligne fonctionne…", "le soir, de 21 h à 2 h", ["toute la journée", "le week-end seulement"], "« tous les soirs, de vingt et une heures à deux heures »."),
        qcm("La formation des bénévoles dure…", "30 heures", ["3 heures", "13 heures"], "« une formation de trente heures »."),
        qcm("Quel est le rôle des bénévoles ?", "écouter et orienter vers un professionnel", ["soigner les étudiants", "donner des médicaments"], "« on écoute, et… on l'oriente vers un professionnel »."),
        qcm("Pourquoi la ligne est-elle ouverte le soir ?", "C'est le moment où l'on se sent le plus seul.", ["Les bénévoles travaillent la journée.", "Les appels coûtent moins cher."], "« c'est le moment où on se sent le plus seul »."),
        qcm("Quel sujet n'est PAS cité parmi les motifs d'appel ?", "les problèmes de santé physique", ["la solitude", "les problèmes d'argent"], "Sont cités : stress des examens, solitude, argent."),
        qcm("Que disent souvent les personnes qui appellent ?", "qu'elles ne voulaient pas déranger", ["qu'elles veulent changer d'études", "qu'elles n'ont pas de téléphone"], "« Je ne voulais pas déranger »."),
      ] },
    { ten: "b1-de5-co2", tieuDe: "Écoute B1 · Đề 5 · Exercice 2 : un message de la mutuelle", gioiThieu: "Vous écoutez un message de votre mutuelle étudiante.",
      doan: [d("shimmer", VUA, "Bonjour, ici votre mutuelle étudiante. Nous vous informons qu'à partir du premier octobre, plusieurs changements vous concernent. Les culottes et les coupes menstruelles achetées en pharmacie sont remboursées pour les moins de vingt-six ans. Et pour le dispositif « Mon soutien psy », vous n'avez plus besoin d'avancer l'argent chez le psychologue. Pour plus d'informations, rendez-vous sur notre site ou passez à notre accueil, ouvert du lundi au vendredi. Bonne journée.")],
      cau: [
        qcm("Les changements commencent…", "le 1er octobre", ["le 1er septembre", "le 1er janvier"], "« à partir du premier octobre »."),
        qcm("Les protections menstruelles sont remboursées si elles sont achetées…", "en pharmacie", ["au supermarché", "sur Internet"], "« achetées en pharmacie »."),
        qcm("Ce remboursement concerne les personnes de moins de…", "26 ans", ["16 ans", "30 ans"], "« pour les moins de vingt-six ans »."),
        qcm("Pour « Mon soutien psy », qu'est-ce qui change ?", "On n'avance plus l'argent.", ["Les séances sont supprimées.", "Il faut une ordonnance."], "« vous n'avez plus besoin d'avancer l'argent »."),
        qcm("L'accueil de la mutuelle est ouvert…", "du lundi au vendredi", ["tous les jours", "le samedi seulement"], "« ouvert du lundi au vendredi »."),
      ] },
  ],
  CE: [
    { tieuDe: "Lecture B1 · Đề 5 · Exercice 1 : prendre soin de soi en ville", consigne: "<p>Vous cherchez une activité pour vous détendre. Lisez les annonces et répondez aux questions.</p>",
      readingText: p("<strong>A. Yoga au parc</strong> : dimanche 10 h, en plein air, gratuit, annulé en cas de pluie.", "<strong>B. Groupe de parole étudiant</strong> : jeudi 19 h, avec une psychologue, 8 personnes maximum, gratuit sur inscription.", "<strong>C. Chorale du quartier</strong> : lundi 20 h, aucun niveau demandé, 40 € l'année.", "<strong>D. Jardin partagé</strong> : samedi matin, venez planter et récolter avec vos voisins, outils prêtés.", "<strong>E. Méditation en ligne</strong> : application, 10 minutes par jour, 5 € par mois."),
      cau: [
        qcm("Vous voulez parler de vos difficultés avec un professionnel. Vous choisissez…", "B", ["C", "E"], "B : « avec une psychologue »."),
        qcm("Vous aimez chanter. Vous choisissez…", "C", ["A", "D"], "C : « Chorale »."),
        qcm("Vous voulez une activité courte, chez vous. Vous choisissez…", "E", ["A", "B"], "E : « application, 10 minutes par jour »."),
        qcm("Quelle activité dépend de la météo ?", "A", ["C", "D"], "A : « annulé en cas de pluie »."),
        qcm("Pour l'activité D, les outils…", "sont prêtés", ["sont à acheter", "ne sont pas nécessaires"], "« outils prêtés »."),
      ] },
    { tieuDe: "Lecture B1 · Đề 5 · Exercice 2 : la santé mentale des jeunes, grande cause nationale", consigne: "<p>Lisez l'article puis répondez aux questions.</p>",
      readingText: p("<strong>Santé mentale des jeunes : une grande cause qui continue</strong>",
        "En 2025, la santé mentale avait été déclarée « grande cause nationale » en France. Fin novembre 2025, le gouvernement a annoncé qu'elle le resterait en 2026, avec la promesse d'actions plus concrètes. Cette décision répondait notamment à une demande des hôpitaux publics, qui voulaient que l'effort porte en priorité sur les jeunes.",
        "Les chiffres expliquent cette inquiétude. Selon une étude de Santé publique France menée auprès de 17 000 jeunes, environ un tiers des 11 à 24 ans présente des signes de détresse anxieuse ou dépressive, de modérée à sévère. Les hôpitaux constatent aussi que les jeunes de 5 à 19 ans ont été beaucoup plus nombreux que prévu à être hospitalisés pour des troubles psychiatriques en 2024.",
        "Le problème, c'est que l'offre de soins ne suit pas. Les services de psychiatrie sont saturés, de nombreux postes ne sont pas pourvus, et beaucoup de patients disent avoir déjà renoncé à un rendez-vous faute de place. Des députés ont d'ailleurs regretté que les mesures avancent trop lentement.",
        "Quelques changements concrets arrivent malgré tout. Depuis le 1er octobre 2026, les patients du dispositif « Mon soutien psy » n'ont plus à avancer les frais chez le psychologue, et les étudiants peuvent toujours bénéficier de séances gratuites. Pour les spécialistes, ces aides sont utiles, mais elles ne remplacent pas un vrai plan pour former et recruter des soignants.",
        nguon("Fédération hospitalière de France, lettre ouverte, 27 novembre 2025 (fhf.fr)", "CIDJ, « Ce qui change en octobre 2026 », 1er octobre 2026 (cidj.com)", "Pourquoi Docteur, « Santé mentale, grande cause nationale 2026 » (pourquoidocteur.fr)")),
      cau: [
        qcm("En 2026, la santé mentale est…", "toujours grande cause nationale", ["remplacée par une autre cause", "une cause européenne"], "« elle le resterait en 2026 »."),
        qcm("Qui demandait que l'effort porte en priorité sur les jeunes ?", "les hôpitaux publics", ["les écoles privées", "les étudiants"], "« une demande des hôpitaux publics »."),
        qcm("Selon Santé publique France, environ quelle part des 11-24 ans montre des signes de détresse ?", "un tiers", ["la moitié", "un dixième"], "« environ un tiers des 11 à 24 ans »."),
        vf("En 2024, moins de jeunes que prévu ont été hospitalisés pour des troubles psychiatriques.", false, "« beaucoup plus nombreux que prévu à être hospitalisés »"),
        qcm("Quel problème l'article souligne-t-il ?", "Il n'y a pas assez de soignants et de places.", ["Les jeunes refusent de se soigner.", "Les médicaments sont interdits."], "« Les services de psychiatrie sont saturés, de nombreux postes ne sont pas pourvus »."),
        qcm("Qu'ont regretté des députés ?", "la lenteur des mesures", ["le coût des psychologues", "la fermeture des écoles"], "« les mesures avancent trop lentement »."),
        vf("Depuis le 1er octobre 2026, on n'avance plus les frais avec « Mon soutien psy ».", true, "« n'ont plus à avancer les frais chez le psychologue »"),
        qcm("Selon les spécialistes, les nouvelles aides…", "sont utiles mais insuffisantes", ["sont inutiles", "règlent le problème"], "« utiles, mais elles ne remplacent pas un vrai plan »."),
      ] },
  ],
  PE: { tieuDe: "Production écrite B1 · Đề 5 : parler de son stress", consigne: "<p><strong>Production écrite : 45 minutes, 160 mots minimum.</strong></p>",
    questions: [{ type: "open", prompt: "Le journal de votre université publie un dossier : « Stress, solitude : les étudiants osent-ils demander de l'aide ? » Vous écrivez un article pour ce journal : vous racontez une période difficile que vous ou un proche avez vécue, vous expliquez ce qui a aidé et vous donnez des conseils aux nouveaux étudiants. (160 mots minimum)" }] },
  PO: { ...PO_DAU("Đề 5"),
    bocTham: { chuanBi: 10, phan: [
      { ten: "2. Exercice en interaction (3 à 4 minutes)", cachLam: "Jouez la situation. L'examinateur joue l'autre personne.", soRut: 2, sujets: [
        S("1", "Votre colocataire ne sort plus de sa chambre depuis une semaine. Vous lui parlez avec délicatesse et vous lui proposez de l'aide."),
        S("2", "Vous avez trop de travail et vous voulez demander un délai à votre professeur pour rendre un dossier. Vous lui expliquez la situation."),
        S("3", "Votre ami veut faire une nuit blanche pour réviser avant un examen. Vous essayez de le convaincre de dormir."),
        S("4", "Vous voulez créer un club de sport à l'université pour lutter contre le stress. Vous présentez votre projet au responsable de la vie étudiante.")] },
      { ten: "3. Expression d'un point de vue (5 à 7 minutes)", cachLam: "Dégagez le thème du document, puis présentez votre opinion. L'examinateur vous pose ensuite quelques questions.", soRut: 2, sujets: [
        S("1", "« Santé mentale des jeunes : grande cause nationale pour la deuxième année. Les choses changent-elles vraiment ? »", "<em>Thème d'actualité 2026.</em>"),
        S("2", "« Faut-il un psychologue dans chaque lycée ? »", "<em>Sujet de débat.</em>"),
        S("3", "« Les réseaux sociaux rendent-ils les jeunes plus seuls ? »", "<em>Sujet de débat.</em>"),
        S("4", "« Le sport devrait-il être obligatoire à l'université ? »", "<em>Sujet de débat.</em>")] },
    ] } },
};

/* ══════════════════════════ B1 · Đề 6 : l'été 2026 et la chaleur ══════════════════════════ */
export const B1_6 = { level: "B1", ten: "DELF B1 · Đề 6", kieuNghe: "a",
  CO: [
    { ten: "b1-de6-co1", tieuDe: "Écoute B1 · Đề 6 · Exercice 1 : une cour d'école transformée", gioiThieu: "Vous écoutez une émission de radio locale.",
      doan: [d("sage", RADIO, "Dans « Ma ville demain », nous sommes à l'école Jules-Ferry, où la cour a été entièrement refaite cet été. Monsieur Lambert, vous êtes le directeur. Qu'est-ce qui a changé ?"),
        d("echo", KHACH, "Avant, la cour était en goudron noir. En juin, avec la canicule, on ne pouvait plus y jouer l'après-midi : le sol devenait brûlant. Maintenant, on a enlevé une grande partie du goudron, planté quinze arbres et installé un petit jardin et des fontaines à eau. Les enfants ont participé : ce sont eux qui ont dessiné les plans avec un architecte."),
        d("sage", RADIO, "Les parents sont contents ?"),
        d("echo", KHACH, "Oui, même si certains avaient peur de la boue en hiver ! On a gardé un terrain de jeu dur pour le ballon. Et le samedi matin, la cour est ouverte aux habitants du quartier, qui viennent s'y reposer à l'ombre. C'est devenu un vrai lieu de vie.")],
      cau: [
        qcm("Avant les travaux, la cour était…", "en goudron noir", ["en herbe", "en sable"], "« la cour était en goudron noir »."),
        qcm("Pourquoi ne pouvait-on plus jouer dans la cour en juin ?", "Le sol devenait brûlant.", ["Il pleuvait trop.", "Il y avait des travaux."], "« le sol devenait brûlant »."),
        qcm("Combien d'arbres ont été plantés ?", "15", ["5", "50"], "« planté quinze arbres »."),
        qcm("Qui a dessiné les plans avec l'architecte ?", "les enfants", ["les parents", "les professeurs"], "« ce sont eux qui ont dessiné les plans »."),
        qcm("De quoi certains parents avaient-ils peur ?", "de la boue en hiver", ["des insectes", "du bruit"], "« certains avaient peur de la boue en hiver »."),
        qcm("Qu'est-ce qu'on a gardé pour le ballon ?", "un terrain de jeu dur", ["un gymnase", "une piscine"], "« On a gardé un terrain de jeu dur pour le ballon »."),
        qcm("Le samedi matin, la cour…", "est ouverte aux habitants", ["est fermée", "accueille un marché"], "« la cour est ouverte aux habitants du quartier »."),
      ] },
    { ten: "b1-de6-co2", tieuDe: "Écoute B1 · Đề 6 · Exercice 2 : un message de la mairie", gioiThieu: "Vous écoutez un message de la mairie sur votre répondeur.",
      doan: [d("shimmer", VUA, "Bonjour, ici le service des solidarités de la mairie. Vous êtes inscrit sur notre registre des personnes à contacter pendant les fortes chaleurs. Nous préparons déjà l'été prochain. Pour mettre votre dossier à jour, merci de nous rappeler avant le trente novembre. Nous voulons aussi vous informer que trois salles rafraîchies seront ouvertes dans la ville en cas de canicule, dont une à la médiathèque. Nous restons à votre disposition au zéro un, quarante-cinq, vingt, trente, dix. Merci.")],
      cau: [
        qcm("Qui appelle ?", "la mairie", ["un hôpital", "une agence de voyage"], "« ici le service des solidarités de la mairie »."),
        qcm("Pourquoi la personne est-elle contactée ?", "Elle est inscrite sur un registre pour les fortes chaleurs.", ["Elle a gagné un concours.", "Elle a oublié de payer."], "« inscrit sur notre registre… pendant les fortes chaleurs »."),
        qcm("Avant quelle date faut-il rappeler ?", "le 30 novembre", ["le 13 novembre", "le 30 décembre"], "« avant le trente novembre »."),
        qcm("Combien de salles rafraîchies ouvriront en cas de canicule ?", "3", ["2", "13"], "« trois salles rafraîchies »."),
        qcm("Où se trouve une de ces salles ?", "à la médiathèque", ["à la piscine", "à la gare"], "« dont une à la médiathèque »."),
      ] },
  ],
  CE: [
    { tieuDe: "Lecture B1 · Đề 6 · Exercice 1 : sortir quand il fait chaud", consigne: "<p>C'est l'été et il fait très chaud. Lisez les annonces et répondez aux questions.</p>",
      readingText: p("<strong>A. Musée des Beaux-Arts</strong> : climatisé, ouvert jusqu'à 21 h en juillet, gratuit le premier dimanche du mois.", "<strong>B. Baignade au lac</strong> : surveillée de 11 h à 19 h, parking payant, interdite aux chiens.", "<strong>C. Cinéma en plein air</strong> : vendredi 22 h, apportez votre couverture, gratuit.", "<strong>D. Visite des grottes</strong> : 13 °C toute l'année, départ toutes les heures, 9 €, chaussures fermées obligatoires.", "<strong>E. Balade à vélo de nuit</strong> : mercredi 21 h 30, 15 km, vélo et casque prêtés, 5 €."),
      cau: [
        qcm("Vous voulez avoir frais et voir des œuvres d'art. Vous choisissez…", "A", ["C", "D"], "A : « climatisé »."),
        qcm("Vous voulez nager. Vous choisissez…", "B", ["D", "E"], "B : « Baignade au lac »."),
        qcm("Vous n'avez pas de vélo mais vous aimez pédaler. Vous choisissez…", "E", ["A", "B"], "E : « vélo et casque prêtés »."),
        qcm("Quelle activité demande des chaussures particulières ?", "D", ["C", "E"], "D : « chaussures fermées obligatoires »."),
        qcm("Pour le cinéma en plein air, il faut apporter…", "une couverture", ["un billet", "une lampe"], "« apportez votre couverture »."),
      ] },
    { tieuDe: "Lecture B1 · Đề 6 · Exercice 2 : l'été 2026, le plus chaud jamais mesuré", consigne: "<p>Lisez l'article puis répondez aux questions.</p>",
      readingText: p("<strong>Été 2026 : la France n'a jamais eu aussi chaud</strong>",
        "Le verdict de Météo-France est tombé : l'été 2026 est le plus chaud jamais mesuré en France, devant 2003 et 2022. Juillet a même été le mois le plus chaud depuis le début des relevés, en 1900. Partout dans le pays, les records sont tombés : Strasbourg a dépassé 40 °C, une première dans l'histoire de la ville.",
        "La vague de chaleur de la fin juin a été particulièrement violente. Le 25 juin, 72 départements ont été placés en vigilance rouge canicule, une situation jamais vue depuis la création de ce système d'alerte, en 2004. Les écoles ont adapté leurs horaires, et de nombreuses villes ont ouvert des salles rafraîchies pour les personnes âgées.",
        "Le bilan humain est lourd. Selon les premières estimations de Santé publique France, plus de 7 300 décès supplémentaires sont liés aux épisodes de chaleur de cet été. L'Île-de-France a été la région la plus touchée, en partie parce que les grandes villes, avec leur béton et leur goudron, gardent la chaleur la nuit.",
        "À la chaleur s'est ajoutée la sécheresse : jamais les sols n'avaient été aussi secs, et des dizaines de départements ont dû limiter l'usage de l'eau. Pour beaucoup d'experts, cet été n'est pas une exception mais un aperçu de l'avenir. La question n'est plus seulement de réduire les émissions de gaz à effet de serre, mais aussi d'adapter nos villes, nos écoles et nos logements à des étés de plus en plus brûlants.",
        nguon("Banque des Territoires, « Canicule, sécheresse, incendies : le bilan climatique hors normes de l'été 2026 » (banquedesterritoires.fr)", "Selectra, « Canicules de l'été 2026 : bilan » (selectra.info)", "données Météo-France et Santé publique France citées par ces articles")),
      cau: [
        qcm("D'après Météo-France, l'été 2026 est…", "le plus chaud jamais mesuré en France", ["plus frais que l'été 2003", "le deuxième été le plus chaud"], "« l'été 2026 est le plus chaud jamais mesuré en France »."),
        qcm("Juillet 2026 a été le mois le plus chaud depuis…", "1900", ["2003", "2004"], "« depuis le début des relevés, en 1900 »."),
        vf("Strasbourg avait déjà dépassé 40 °C avant 2026.", false, "« Strasbourg a dépassé 40 °C, une première dans l'histoire de la ville »"),
        qcm("Que s'est-il passé le 25 juin ?", "72 départements étaient en vigilance rouge.", ["Les écoles ont fermé.", "Il a plu dans toute la France."], "« 72 départements ont été placés en vigilance rouge canicule »."),
        qcm("Selon Santé publique France, combien de décès supplémentaires sont liés aux chaleurs ?", "plus de 7 300", ["environ 700", "plus de 73 000"], "« plus de 7 300 décès supplémentaires »."),
        qcm("Pourquoi les grandes villes ont-elles été plus touchées ?", "Le béton et le goudron gardent la chaleur la nuit.", ["Il y a plus de personnes âgées.", "Il n'y a pas d'hôpitaux."], "« avec leur béton et leur goudron, gardent la chaleur la nuit »."),
        vf("Pendant l'été, des départements ont dû limiter l'usage de l'eau.", true, "« des dizaines de départements ont dû limiter l'usage de l'eau »"),
        qcm("Selon les experts, il faut maintenant aussi…", "adapter les villes, les écoles et les logements", ["arrêter de partir en vacances", "construire plus de routes"], "« adapter nos villes, nos écoles et nos logements »."),
      ] },
  ],
  PE: { tieuDe: "Production écrite B1 · Đề 6 : une ville plus fraîche", consigne: "<p><strong>Production écrite : 45 minutes, 160 mots minimum.</strong></p>",
    questions: [{ type: "open", prompt: "Après un été très chaud, votre mairie demande aux habitants des idées pour rendre la ville plus agréable pendant les canicules. Vous écrivez au maire : vous racontez comment vous avez vécu les fortes chaleurs, vous proposez au moins deux actions et vous expliquez pourquoi elles sont utiles. (160 mots minimum)" }] },
  PO: { ...PO_DAU("Đề 6"),
    bocTham: { chuanBi: 10, phan: [
      { ten: "2. Exercice en interaction (3 à 4 minutes)", cachLam: "Jouez la situation. L'examinateur joue l'autre personne.", soRut: 2, sujets: [
        S("1", "Votre voisine âgée vit seule et il va faire très chaud cette semaine. Vous allez la voir pour lui donner des conseils et proposer votre aide."),
        S("2", "Votre colocataire veut acheter un climatiseur. Vous pensez qu'il existe d'autres solutions. Vous en discutez."),
        S("3", "Vous travaillez dans un bureau très chaud. Vous demandez à votre responsable de changer les horaires de travail en été."),
        S("4", "Vous voulez planter des fleurs et des arbres dans la cour de votre immeuble. Vous convainquez le gardien.")] },
      { ten: "3. Expression d'un point de vue (5 à 7 minutes)", cachLam: "Dégagez le thème du document, puis présentez votre opinion. L'examinateur vous pose ensuite quelques questions.", soRut: 2, sujets: [
        S("1", "« Été 2026, le plus chaud jamais mesuré : faut-il changer notre façon de vivre l'été ? »", "<em>Thème d'actualité 2026.</em>"),
        S("2", "« Faut-il commencer l'école plus tôt le matin quand il fait trop chaud ? »", "<em>Sujet de débat.</em>"),
        S("3", "« La climatisation : confort indispensable ou fausse solution ? »", "<em>Sujet de débat.</em>"),
        S("4", "« Faut-il remplacer le goudron des cours d'école par des arbres ? »", "<em>Sujet de débat.</em>")] },
    ] } },
};

export const CAC_DE = [B1_4, B1_5, B1_6];
