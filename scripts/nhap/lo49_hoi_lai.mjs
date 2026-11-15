/* Lô 49 (15/11/2026): câu hỏi của GIÁM KHẢO cho phần tranh luận trong thi thử Nói B2 và C1.
 *
 * Đề thi thật: B2 = monologue suivi rồi exercice en interaction (giám khảo phản biện), C1 = exposé rồi
 * entretien với hội đồng. Màn thi thử trước đây chỉ có một bản ghi, nên tiêu chí tương tác (B2
 * `interaction`, C1 `entretien`) luôn bị chấm mức thấp nhất. Lô này gắn vào mỗi chủ đề bốc thăm một
 * danh sách `hoiLai` (câu giám khảo hỏi, hiện chữ): BocThamNoi hiện lần lượt sau phần độc thoại, học
 * sinh ghi âm từng câu trả lời, cham-po chấm tiêu chí tương tác trên các câu trả lời đó.
 *
 * Dữ liệu: meta.bocTham.phan[0].sujets[i].hoiLai. Ghi bằng jsonb_set theo đúng vị trí, có điều kiện
 * mã thẻ (`ma`) VÀ một đoạn tiêu đề (`khoa`) khớp: nếu giáo viên đã sửa hoặc đảo chủ đề thì câu lệnh
 * không chạm vào chủ đề đó (không ghi nhầm câu hỏi sang chủ đề khác).
 *
 * B2: 6 đề dùng chung một kho 15 chủ đề, 5 câu mỗi chủ đề. C1: 3 đề, mỗi đề 4 chủ đề riêng, 6 câu.
 * Tự kiểm: đủ số câu, không gạch dài, mỗi câu kết thúc bằng « ? », không trùng câu trong một chủ đề.
 *
 * Chạy: node scripts/nhap/lo49_hoi_lai.mjs > supabase/migrations/213_hoi_lai_noi.sql */

const B2_DE = ["nhapmur616oz002", "nhapmv3lbczp018", "lo18mv42hjcr04y", "lo23mven531h03k", "lo23mven72cw03t", "lo23mven91gc042"];

const B2 = [
  { ma: "1", khoa: "SORTIR DE L", hoi: [
    "Vous semblez convaincu(e), mais un enfant qui apprend dehors apprend-il vraiment à lire et à compter ?",
    "Certains parents disent que l’école en forêt est un luxe réservé aux familles aisées. Qu’en pensez-vous ?",
    "Si l’on supprime les heures fixes en classe, comment les élèves apprendront-ils la discipline dont ils auront besoin au travail ?",
    "Dans votre pays, les sorties scolaires sont-elles fréquentes ? Est-ce qu’elles vous ont appris quelque chose de durable ?",
    "Finalement, quel équilibre proposeriez-vous concrètement entre la classe et l’extérieur ?",
  ] },
  { ma: "2", khoa: "LE NUMÉRIQUE", hoi: [
    "Le télétravail permet aussi d’éviter des heures de transport. N’est-ce pas un vrai progrès pour la qualité de vie ?",
    "Vous parlez de liberté de choix, mais avant Internet, la publicité influençait déjà nos achats. Qu’est-ce qui a vraiment changé ?",
    "Pour une personne isolée ou handicapée, le numérique n’est-il pas au contraire une ouverture sur le monde ?",
    "Personnellement, avez-vous déjà essayé de vous déconnecter ? Qu’est-ce que cela vous a appris ?",
    "Faudrait-il, selon vous, des règles pour limiter le numérique, ou est-ce à chacun de décider ?",
  ] },
  { ma: "3", khoa: "PEUT-ON SE PASSER DE VOITURE", hoi: [
    "Interdire les voitures en ville, n’est-ce pas pénaliser ceux qui habitent loin et n’ont pas d’autre choix ?",
    "Les commerçants craignent de perdre leurs clients. Comment répondriez-vous à leur inquiétude ?",
    "La voiture électrique ne règle-t-elle pas le problème de la pollution sans changer nos habitudes ?",
    "Dans la ville où vous vivez, pourriez-vous vous passer de voiture au quotidien ? Pourquoi ?",
    "Que faudrait-il mettre en place avant d’interdire les voitures dans un quartier ?",
  ] },
  { ma: "4", khoa: "TRE GUID", hoi: [
    "Consulter un spécialiste quand on a un problème, n’est-ce pas simplement une preuve de bon sens ?",
    "Vous parlez de l’aide des proches, mais tout le monde n’a pas une famille disponible. Que faire dans ce cas ?",
    "Les forums sur Internet sont gratuits et accessibles à tous. Pourquoi s’en méfier ?",
    "Avez-vous déjà fait appel à un coach ou à un spécialiste ? Est-ce que cela vous a aidé(e) ?",
    "Où placeriez-vous la limite entre prendre soin de soi et dépendre des autres ?",
  ] },
  { ma: "5", khoa: "PROPRIÉTAIRES", hoi: [
    "Acheter un logement, c’est s’endetter pour vingt ou trente ans. Est-ce vraiment raisonnable pour un jeune ?",
    "Être locataire permet de déménager facilement pour un travail. N’est-ce pas plus adapté au monde actuel ?",
    "Selon vous, devenir propriétaire, est-ce un signe de réussite personnelle ?",
    "Dans votre pays, est-il facile pour les jeunes d’acheter un logement ?",
    "Que devraient faire les pouvoirs publics pour aider les jeunes à se loger ?",
  ] },
  { ma: "6", khoa: "LES JEUX VIDÉO", hoi: [
    "Une seule étude suffit-elle à prouver que les jeux vidéo sont bons pour les seniors ?",
    "Ne vaudrait-il pas mieux que les personnes âgées fassent du sport ou voient leurs amis plutôt que de jouer devant un écran ?",
    "Vous défendez les jeux vidéo pour les seniors. Diriez-vous la même chose pour les adolescents ?",
    "Connaissez-vous des personnes âgées qui jouent aux jeux vidéo ? Qu’en pensent-elles ?",
    "Faudrait-il que les maisons de retraite proposent des jeux vidéo à leurs résidents ?",
  ] },
  { ma: "7", khoa: "UN BON ROMAN", hoi: [
    "Regarder une bonne série, n’est-ce pas aussi une manière d’entrer dans la peau des personnages ?",
    "Beaucoup de jeunes disent qu’ils n’ont pas le temps de lire. Que leur répondriez-vous ?",
    "Lire des romans est agréable, mais est-ce vraiment utile pour réussir ses études ou sa carrière ?",
    "Y a-t-il un livre qui vous a changé(e) ? En quoi ?",
    "L’école devrait-elle obliger les élèves à lire des romans, ou les laisser choisir leurs lectures ?",
  ] },
  { ma: "8", khoa: "LE CINÉMA PROFITE", hoi: [
    "Avec un grand écran et une bonne connexion chez soi, pourquoi payer une place de cinéma ?",
    "Les plateformes produisent maintenant leurs propres films. Est-ce une menace pour les salles ?",
    "Vous parlez de complémentarité. N’est-ce pas un peu optimiste quand on voit la baisse de fréquentation ?",
    "Et vous, comment regardez-vous les films le plus souvent ? Pourquoi ?",
    "Que pourraient faire les cinémas pour attirer un public plus jeune ?",
  ] },
  { ma: "9", khoa: "OBSOLESCENCE", hoi: [
    "Si les consommateurs veulent toujours le dernier modèle, peut-on vraiment accuser les fabricants ?",
    "Un produit moins cher permet aux personnes modestes de s’équiper. Faut-il le leur reprocher ?",
    "Une loi qui obligerait les fabricants à garantir leurs produits dix ans, serait-ce réaliste ?",
    "Avez-vous déjà fait réparer un appareil plutôt que d’en acheter un nouveau ? Comment cela s’est-il passé ?",
    "Selon vous, qui doit agir en premier : les entreprises, les consommateurs ou l’État ?",
  ] },
  { ma: "10", khoa: "LA JOURNÉE DES PARENTS", hoi: [
    "Inviter ses parents au bureau, n’est-ce pas un peu infantilisant pour un adulte ?",
    "Certains employés préfèrent séparer complètement leur vie privée et leur vie professionnelle. Ont-ils tort ?",
    "Cette journée ne sert-elle pas surtout l’image de l’entreprise ?",
    "Vos parents comprennent-ils bien votre métier ou vos études ? Cela a-t-il de l’importance pour vous ?",
    "Comment, selon vous, mieux valoriser l’expérience des seniors dans le monde du travail ?",
  ] },
  { ma: "11", khoa: "L’AMBIANCE AU TRAVAIL", hoi: [
    "Quand on a un loyer à payer, le salaire ne passe-t-il pas forcément avant l’ambiance ?",
    "Changer d’emploi à cause d’un collègue désagréable, n’est-ce pas manquer de patience ?",
    "Est-ce vraiment à l’entreprise de créer une bonne ambiance, ou cela dépend-il de chaque salarié ?",
    "Avez-vous déjà connu une très bonne ou une très mauvaise ambiance dans un groupe ? Racontez.",
    "Si vous dirigiez une équipe, que feriez-vous concrètement pour améliorer l’ambiance ?",
  ] },
  { ma: "12", khoa: "LES MÉTIERS MANUELS", hoi: [
    "Les métiers manuels sont souvent fatigants et mal payés. Est-ce vraiment un bon choix pour un jeune diplômé ?",
    "Le bâtiment attire moins que la gastronomie. Comment l’expliquez-vous ?",
    "N’est-ce pas un peu dommage de faire des études générales pour finalement choisir un métier manuel ?",
    "Dans votre pays, comment considère-t-on les métiers manuels ?",
    "Que devrait faire l’école pour mieux faire connaître ces métiers ?",
  ] },
  { ma: "13", khoa: "L’ÉDUCATION DES CITOYENS", hoi: [
    "Si l’école passe du temps sur la citoyenneté, n’en perd-elle pas pour les connaissances de base ?",
    "L’éducation à la citoyenneté, n’est-ce pas d’abord le rôle des parents ?",
    "Comment un professeur peut-il parler d’engagement sans influencer politiquement ses élèves ?",
    "Qu’avez-vous appris à l’école sur la vie en société ? Est-ce que cela vous a servi ?",
    "Quelle activité concrète proposeriez-vous pour former de jeunes citoyens ?",
  ] },
  { ma: "14", khoa: "LA PROCRASTINATION", hoi: [
    "Remettre à plus tard, n’est-ce pas parfois une bonne façon de mieux réfléchir ?",
    "Les étudiants ont toujours procrastiné. Peut-on vraiment accuser les nouvelles technologies ?",
    "Se déconnecter physiquement, est-ce réaliste quand tous les cours sont en ligne ?",
    "Et vous, procrastinez-vous ? Quelle méthode utilisez-vous pour vous concentrer ?",
    "Les universités devraient-elles aider les étudiants à s’organiser, ou est-ce leur responsabilité ?",
  ] },
  { ma: "15", khoa: "COMMENT LA MUSIQUE", hoi: [
    "Les élèves qui font de la musique viennent souvent de familles favorisées. Est-ce vraiment la musique qui améliore leurs résultats ?",
    "Faut-il rendre la pratique d’un instrument obligatoire au collège ?",
    "Écouter de la musique en travaillant, est-ce que cela aide ou est-ce que cela distrait ?",
    "Avez-vous appris à jouer d’un instrument ? Qu’est-ce que cela vous a apporté ?",
    "Si les budgets sont limités, l’école doit-elle choisir la musique plutôt que le sport ou les langues ?",
  ] },
];

const C1 = {
  nhapmuqwmabz00r: [
    { ma: "1", khoa: "télétravail", hoi: [
      "Vous évoquez les bureaux vides. Les transformer en logements est-il vraiment réaliste, techniquement et financièrement ?",
      "Le télétravail ne crée-t-il pas une nouvelle inégalité entre les cadres et ceux qui doivent se déplacer ?",
      "Certaines entreprises imposent un retour au bureau. Est-ce une question de productivité ou de contrôle ?",
      "Ne risque-t-on pas de vider les centres-villes de leurs commerces ?",
      "Si vous étiez maire d’une grande ville, quelle serait votre première mesure ?",
      "Dans votre pays, le télétravail a-t-il modifié la façon d’habiter ?",
    ] },
    { ma: "2", khoa: "intelligence artificielle", hoi: [
      "Les photographes ont été accusés de tuer la peinture. L’IA n’est-elle pas simplement un nouvel outil ?",
      "Si le public ne fait pas la différence entre une œuvre humaine et une œuvre produite par une IA, où est le problème ?",
      "Qui devrait être considéré comme l’auteur d’une image créée avec une IA ?",
      "Faut-il interdire l’IA dans les écoles d’art, ou au contraire l’enseigner ?",
      "Vous défendez la créativité humaine. Pouvez-vous la définir précisément ?",
      "Utilisez-vous vous-même ce type d’outil ? Dans quelles limites ?",
    ] },
    { ma: "3", khoa: "mineurs en ligne", hoi: [
      "Interdire les réseaux sociaux aux moins de quinze ans, n’est-ce pas une mesure facile à contourner ?",
      "Vous insistez sur le rôle des parents. Mais tous les parents ont-ils les compétences nécessaires ?",
      "Les plateformes gagnent de l’argent grâce au temps passé par les jeunes. Peut-on leur faire confiance ?",
      "Protéger les mineurs justifie-t-il de vérifier l’identité de tous les internautes ?",
      "À quel âge, selon vous, un adolescent est-il capable de gérer seul sa vie en ligne ?",
      "Comment ce débat se pose-t-il dans votre pays ?",
    ] },
    { ma: "4", khoa: "analogiques", hoi: [
      "Ce retour des vinyles ne concerne-t-il pas surtout une minorité aisée ?",
      "Ne s’agit-il pas d’une mode lancée par les entreprises pour vendre plus cher ?",
      "Vous parlez de notre rapport au temps. Un objet analogique nous rend-il vraiment plus patients ?",
      "Ces objets sont souvent moins écologiques à produire. Est-ce un paradoxe gênant ?",
      "Pensez-vous que ce phénomène va durer, ou disparaître dans quelques années ?",
      "Avez-vous vous-même un objet analogique auquel vous tenez ? Pourquoi ?",
    ] },
  ],
  lo18mv42i4db054: [
    { ma: "1", khoa: "Les jeunes et le travail", hoi: [
      "Vous parlez de rationalité. N’est-ce pas une façon élégante de justifier un manque d’engagement ?",
      "Les générations précédentes ont accepté des conditions difficiles. Les jeunes sont-ils plus exigeants ou plus lucides ?",
      "Les entreprises doivent-elles s’adapter aux jeunes, ou les jeunes aux entreprises ?",
      "Le discours sur la « génération Z » ne caricature-t-il pas des jeunes très différents les uns des autres ?",
      "Quelle place le travail devrait-il occuper dans une vie réussie ?",
      "Et dans votre entourage, observez-vous ce changement de rapport au travail ?",
    ] },
    { ma: "2", khoa: "Communiquer en temps réel", hoi: [
      "Attendre une réponse pendant des heures, est-ce vraiment devenu insupportable ?",
      "L’auteur dit que l’attente s’est métamorphosée. Pouvez-vous donner un exemple concret ?",
      "La messagerie instantanée ne nous oblige-t-elle pas à être disponibles en permanence ?",
      "Faudrait-il un droit à la déconnexion en dehors du travail, aussi dans la vie privée ?",
      "Une lettre écrite à la main a-t-elle encore un sens aujourd’hui ?",
      "Comment gérez-vous vous-même les messages auxquels on attend une réponse rapide ?",
    ] },
    { ma: "3", khoa: "Villes et inégalités", hoi: [
      "Les toilettes publiques, n’est-ce pas un sujet secondaire face aux autres problèmes urbains ?",
      "Comment un aménagement apparemment neutre peut-il produire des inégalités ?",
      "Qui devrait participer à la conception des espaces publics : les architectes, les élus ou les habitants ?",
      "Adapter la ville à tous les publics coûte cher. Comment fixer les priorités ?",
      "Pouvez-vous citer un autre exemple d’espace urbain pensé pour une seule partie de la population ?",
      "Dans votre ville, quels espaces publics vous semblent mal conçus ?",
    ] },
    { ma: "4", khoa: "Écologie et justice sociale", hoi: [
      "Si une mesure écologique est efficace, faut-il l’appliquer même si elle est impopulaire ?",
      "Les zones à faibles émissions touchent surtout ceux qui ne peuvent pas changer de voiture. Comment compenser cette injustice ?",
      "La défiance envers l’écologie ne vient-elle pas aussi d’un manque d’explications ?",
      "Est-ce aux individus ou aux grandes entreprises de faire le plus d’efforts ?",
      "Une écologie juste socialement est-elle possible sans augmenter les impôts ?",
      "Comment ces questions se posent-elles dans votre pays ?",
    ] },
  ],
  lo21mvemnf4g01y: [
    { ma: "1", khoa: "Réparer ou racheter", hoi: [
      "Réparer coûte souvent plus cher que racheter. Peut-on reprocher aux consommateurs de faire ce calcul ?",
      "Un indice de réparabilité obligatoire suffit-il à changer les comportements ?",
      "Vous parlez de refus. Réparer est-il un acte politique ou simplement économique ?",
      "Les fabricants devraient-ils être obligés de fournir des pièces détachées pendant dix ans ?",
      "Ce retour à la réparation ne menace-t-il pas certains emplois dans l’industrie ?",
      "Savez-vous réparer vous-même certains objets ? Qui vous l’a appris ?",
    ] },
    { ma: "2", khoa: "Le bureau ouvert", hoi: [
      "L’open space favorise aussi les échanges informels. Faut-il vraiment y renoncer ?",
      "Le choix de l’open space n’est-il pas surtout une question d’économie de surface ?",
      "Vous défendez le droit de s’isoler. Comment le concilier avec le travail d’équipe ?",
      "Le télétravail n’a-t-il pas déjà réglé la question ?",
      "À quoi ressemblerait pour vous un espace de travail idéal ?",
      "Avez-vous déjà travaillé ou étudié dans un espace ouvert ? Comment l’avez-vous vécu ?",
    ] },
    { ma: "3", khoa: "traduction automatique", hoi: [
      "Les traducteurs automatiques progressent chaque année. Dans vingt ans, apprendre une langue servira-t-il encore ?",
      "Vous dites qu’une langue est une manière de voir le monde. Pouvez-vous l’illustrer ?",
      "Pour un voyageur ou un professionnel pressé, l’application n’est-elle pas suffisante ?",
      "L’école devrait-elle réduire le nombre d’heures de langues étrangères ?",
      "Utiliser un traducteur pour apprendre, est-ce tricher ou est-ce une aide ?",
      "Pourquoi avez-vous choisi, vous, d’apprendre le français ?",
    ] },
    { ma: "4", khoa: "La ville sans voiture", hoi: [
      "Rendre le centre aux piétons, n’est-ce pas d’abord rendre la ville plus agréable pour ceux qui y vivent déjà ?",
      "Comment éviter que la ville sans voiture devienne une ville interdite pour les habitants des périphéries ?",
      "Les transports en commun gratuits seraient-ils une solution, ou coûteraient-ils trop cher ?",
      "Les commerçants du centre ont-ils raison de s’inquiéter ?",
      "Faut-il laisser chaque ville décider, ou fixer une règle nationale ?",
      "Comment se déplace-t-on dans la ville où vous vivez ?",
    ] },
  ],
};

/* ── Tự kiểm ── */
const loi = [];
const kiem = (ten, s, so) => {
  if (s.hoi.length !== so) loi.push(`${ten} sujet ${s.ma}: ${s.hoi.length} câu, cần ${so}`);
  if (new Set(s.hoi).size !== s.hoi.length) loi.push(`${ten} sujet ${s.ma}: trùng câu`);
  for (const h of s.hoi) {
    if (h.includes("—")) loi.push(`${ten} sujet ${s.ma}: gạch dài « ${h} »`);
    if (!/[?.]$/.test(h.trim())) loi.push(`${ten} sujet ${s.ma}: câu không kết thúc bằng ? hoặc . « ${h} »`);
  }
};
B2.forEach((s) => kiem("B2", s, 5));
if (B2.length !== 15) loi.push(`B2: ${B2.length} chủ đề, cần 15`);
for (const [id, ds] of Object.entries(C1)) { ds.forEach((s) => kiem(id, s, 6)); if (ds.length !== 4) loi.push(`${id}: ${ds.length} chủ đề`); }
if (loi.length) { console.error(loi.join("\n")); process.exit(1); }

/* ── SQL ── */
const q = (x) => "'" + String(x).replace(/'/g, "''") + "'";
const lenh = (id, i, s) =>
  `update public.exercises set meta = jsonb_set(meta, '{bocTham,phan,0,sujets,${i},hoiLai}', ${q(JSON.stringify(s.hoi))}::jsonb)\n` +
  ` where id = ${q(id)} and meta->'bocTham'->'phan'->0->'sujets'->${i}->>'ma' = ${q(s.ma)}\n` +
  `   and meta->'bocTham'->'phan'->0->'sujets'->${i}->>'html' like ${q("%" + s.khoa + "%")};`;
const ra = [
  "-- 213 · (15/11) Câu hỏi của giám khảo cho phần tranh luận thi thử Nói B2 (exercice en interaction)",
  "-- và C1 (entretien). Sinh bởi scripts/nhap/lo49_hoi_lai.mjs. Chỉ thêm khoá hoiLai vào chủ đề có",
  "-- đúng mã thẻ và tiêu đề; chủ đề đã bị sửa thì bỏ qua.",
];
for (const id of B2_DE) B2.forEach((s, i) => ra.push(lenh(id, i, s)));
for (const [id, ds] of Object.entries(C1)) ds.forEach((s, i) => ra.push(lenh(id, i, s)));
console.error(`B2: ${B2.length} chủ đề × ${B2_DE.length} đề, C1: ${Object.values(C1).flat().length} chủ đề. ${ra.length - 3} câu lệnh.`);
console.log(ra.join("\n"));
