/* Lô 20 (15/10): NỘI DUNG 3 đề DELF B2 theo FORMAT MỚI (mẫu: đề TP68 chủ dự án gửi,
 * chỉ dùng làm khuôn cấu trúc; mọi văn bản và kịch bản dưới đây do FRACILE soạn).
 *
 *   Nghe (25 đ): Ex1 phỏng vấn radio, 2 lượt, 7 câu = 9 đ
 *                Ex2 phóng sự radio, 2 lượt, 7 câu = 9 đ
 *                Ex3 ba tài liệu ngắn, 1 lượt, 6 câu = 7 đ
 *   Đọc (25 đ): Ex1 bài báo, 7 câu = 9 đ · Ex2 bài báo, 7 câu = 9 đ
 *                Ex3 ba ý kiến trên diễn đàn, ghép người ↔ quan điểm, 6 câu = 7 đ
 * Mọi câu là trắc nghiệm A/B/C, điểm riêng từng câu (`heSo` = số nửa điểm).
 * Không dùng dấu gạch dài (quy tắc 7). */

let dem = 0;
export const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261015;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
/* q(đề, đáp án đúng, [2 phương án sai], lời giải, điểm) */
const q = (prompt, dung, sai, explanation, diem) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation, heSo: Math.round(diem * 2) };
};
/* Ghép ý kiến diễn đàn: phương án cố định theo thứ tự tên. */
const ai = (ten) => (prompt, dungLa, explanation, diem) =>
  ({ id: id("q"), type: "qcm", prompt, options: ten.map((t) => `${t}.`), answer: ten.indexOf(dungLa), explanation, heSo: Math.round(diem * 2) });
const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
const d = (giong, cach, chu) => ({ giong, cach, chu });
const RADIO = "Parle en français de France, comme un journaliste de radio, débit naturel et posé.";
const KHACH = "Parle en français de France, comme une personne interviewée à la radio, débit naturel.";
const TIN = "Parle en français de France, comme une chronique radio courte, débit naturel et vif.";

/* ═══════════════════════════ ĐỀ 1 ═══════════════════════════ */
const DE1 = { ten: "DELF B2 · Đề 1",
  CO1: { ten: "b2n-de1-co1", tieuDe: "Écoute B2 · Đề 1 · Exercice 1 : le droit à la déconnexion",
    gioiThieu: "Vous écoutez une émission à la radio.",
    doan: [
      d("sage", RADIO, "Bonjour à toutes et à tous. Depuis 2017, la loi française reconnaît aux salariés un droit à la déconnexion. Mais, dans les faits, les courriels du soir et les messages du week-end n'ont pas disparu. Une étude publiée ce mois-ci montre même que près d'un salarié sur deux consulte sa messagerie professionnelle pendant ses congés. Pour en parler, nous recevons Claire Marchand, psychologue du travail. Claire Marchand, pourquoi est-ce si difficile de décrocher ?"),
      d("shimmer", KHACH, "Parce que ce n'est pas seulement une question d'outils. Le téléphone, on peut l'éteindre. Ce qui est plus compliqué, c'est la peur de passer pour quelqu'un de moins investi. Beaucoup de salariés me disent : si je ne réponds pas dans l'heure, mon chef va penser que je ne suis pas motivé. Personne ne leur demande explicitement de répondre le soir, mais tout le monde le fait, alors on s'aligne. C'est une norme invisible."),
      d("sage", RADIO, "La loi n'a donc servi à rien ?"),
      d("shimmer", KHACH, "Je ne dirais pas cela. La loi oblige les entreprises à négocier des règles, et certaines l'ont fait sérieusement : serveurs de messagerie coupés après vingt heures, messages programmés pour partir le lendemain matin. Mais dans beaucoup de petites structures, on s'est contenté d'une charte que personne n'a lue. Le texte existe ; ce qui manque, c'est la manière de le faire vivre au quotidien."),
      d("sage", RADIO, "Quels sont les risques pour la santé ?"),
      d("shimmer", KHACH, "Le cerveau a besoin de vraies coupures. Quand on reste en alerte en permanence, on dort moins bien, on récupère mal, et à long terme on s'expose à l'épuisement professionnel. Ce qui est paradoxal, c'est que les entreprises y perdent aussi : un salarié fatigué fait plus d'erreurs et finit parfois par partir."),
      d("sage", RADIO, "Alors, que conseillez-vous ?"),
      d("shimmer", KHACH, "Que l'exemple vienne d'en haut. Quand un directeur arrête d'écrire à vingt-trois heures, toute l'équipe respire. Et puis il faut accepter que l'urgence soit l'exception, pas la règle. Dans les équipes que j'accompagne, on définit ensemble ce qui mérite vraiment une réponse immédiate. En général, la liste est très courte.")],
    cau: [
      q("Selon l'étude citée, que font de nombreux salariés pendant leurs congés ?", "Ils lisent leurs messages professionnels.", ["Ils travaillent plusieurs heures par jour.", "Ils éteignent complètement leur téléphone."], "« près d'un salarié sur deux consulte sa messagerie professionnelle pendant ses congés ».", 1.5),
      q("D'après Claire Marchand, pourquoi les salariés ont-ils du mal à décrocher ?", "Ils craignent de paraître peu impliqués.", ["Leurs outils ne permettent pas de se déconnecter.", "Leur contrat les oblige à répondre."], "« la peur de passer pour quelqu'un de moins investi ».", 1),
      q("Pour Claire Marchand, l'habitude de répondre le soir est…", "une règle implicite que chacun suit.", ["une demande écrite des employeurs.", "un choix personnel de quelques salariés."], "« Personne ne leur demande explicitement… c'est une norme invisible ».", 1.5),
      q("Que reproche-t-elle à certaines petites entreprises ?", "D'avoir adopté des règles qui restent théoriques.", ["De refuser d'appliquer la loi.", "D'interdire le téléphone au bureau."], "« on s'est contenté d'une charte que personne n'a lue ».", 1),
      q("Selon elle, l'absence de coupure finit par…", "nuire aussi à l'entreprise.", ["améliorer la productivité.", "concerner seulement les cadres."], "« les entreprises y perdent aussi : un salarié fatigué fait plus d'erreurs ».", 1.5),
      q("Quel rôle attribue-t-elle aux dirigeants ?", "Montrer l'exemple en limitant leurs propres messages.", ["Contrôler les horaires de chaque salarié.", "Sanctionner ceux qui écrivent le soir."], "« Que l'exemple vienne d'en haut ».", 1.5),
      q("Dans les équipes qu'elle accompagne, on s'aperçoit que…", "peu de situations exigent une réponse immédiate.", ["les urgences sont très nombreuses.", "les salariés préfèrent travailler le soir."], "« En général, la liste est très courte ».", 1),
    ] },
  CO2: { ten: "b2n-de1-co2", tieuDe: "Écoute B2 · Đề 1 · Exercice 2 : un atelier de réparation de vélos",
    gioiThieu: "Vous écoutez une émission à la radio.",
    doan: [
      d("nova", RADIO, "Direction Nantes, où une association a transformé un ancien garage en atelier de réparation de vélos. Ici, on ne répare pas votre vélo à votre place : on vous apprend à le faire. Rencontre avec Samir, l'un des fondateurs."),
      d("echo", KHACH, "Au début, on était trois amis qui réparaient les vélos du quartier dans une cave. Le problème, c'est qu'on n'avait ni place ni outillage correct. On prêtait nos clés, on ne les revoyait jamais. Quand la mairie a mis ce garage à notre disposition, tout a changé."),
      d("nova", RADIO, "Qui vient dans l'atelier ?"),
      d("echo", KHACH, "Absolument tout le monde. Des étudiants qui n'ont pas les moyens d'aller chez un réparateur, des retraités, des mères de famille qui veulent apprendre à changer une chambre à air pour ne plus dépendre de personne. L'adhésion coûte vingt euros par an. Ensuite, l'accès aux outils et aux conseils est illimité."),
      d("nova", RADIO, "Et les pièces détachées ?"),
      d("echo", KHACH, "On récupère des vélos abandonnés, notamment ceux que la ville retire des rues. On les démonte et on réutilise tout ce qui peut l'être. Une selle, un dérailleur, une roue : rien ne part à la poubelle si ça fonctionne encore. L'an dernier, on a remis en circulation plus de quatre cents vélos."),
      d("nova", RADIO, "Ce qui frappe, c'est l'ambiance."),
      d("echo", KHACH, "Oui, c'est devenu un vrai lieu de rencontre. Les gens viennent pour réparer un frein et restent deux heures à discuter. Certains adhérents ont même commencé à animer eux-mêmes des ateliers. Pour moi, c'est la plus belle réussite : les gens repartent avec un vélo qui roule, mais aussi avec la confiance de pouvoir se débrouiller."),
      d("nova", RADIO, "Et la suite ?"),
      d("echo", KHACH, "On aimerait ouvrir un deuxième atelier, mobile cette fois, dans une camionnette, pour aller dans les quartiers éloignés du centre où il n'existe aucun réparateur.")],
    cau: [
      q("Quelle est la particularité de cet atelier ?", "Les usagers apprennent à réparer eux-mêmes.", ["Les réparations sont gratuites.", "Il vend des vélos neufs à bas prix."], "« on ne répare pas votre vélo à votre place : on vous apprend à le faire ».", 1.5),
      q("Au départ, quelle difficulté les fondateurs rencontraient-ils ?", "Ils manquaient d'espace et de matériel.", ["Ils n'avaient pas assez de clients.", "Ils ne savaient pas bien réparer."], "« on n'avait ni place ni outillage correct ».", 1),
      q("D'après Samir, certaines femmes viennent à l'atelier pour…", "devenir autonomes.", ["rencontrer d'autres parents.", "faire réparer le vélo de leurs enfants."], "« pour ne plus dépendre de personne ».", 2),
      q("Comment l'association obtient-elle ses pièces ?", "En démontant des vélos abandonnés.", ["Grâce aux dons des magasins.", "En les achetant d'occasion sur Internet."], "« On récupère des vélos abandonnés… On les démonte ».", 1.5),
      q("Pour Samir, l'atelier est aussi…", "un lieu de lien social.", ["une entreprise rentable.", "un centre de formation professionnelle."], "« c'est devenu un vrai lieu de rencontre ».", 1.5),
      q("Ce dont Samir est le plus fier, c'est que les adhérents…", "gagnent en confiance.", ["achètent ensuite un vélo neuf.", "deviennent salariés de l'association."], "« la confiance de pouvoir se débrouiller ».", 0.5),
      q("Quel est le prochain projet de l'association ?", "Se déplacer dans les quartiers mal servis.", ["Ouvrir un magasin de pièces détachées.", "Organiser une course cycliste."], "« un deuxième atelier, mobile… pour aller dans les quartiers éloignés ».", 1),
    ] },
  CO3: { ten: "b2n-de1-co3", tieuDe: "Écoute B2 · Đề 1 · Exercice 3 : trois courts documents",
    docs: [
      { gioiThieu: "Document 1.", doan: [d("alloy", TIN, "Ils ont moins de trente ans et ils ont choisi la terre. De plus en plus de jeunes diplômés, souvent sans origine agricole, s'installent comme maraîchers. Mais le rêve se heurte vite à la réalité : trouver des terres à un prix abordable reste le principal obstacle. Résultat, beaucoup commencent sur de petites surfaces louées et vendent directement aux habitants, sur les marchés ou via des paniers hebdomadaires, pour mieux gagner leur vie.")],
        cau: [
          q("D'après le document, quel est le principal obstacle pour ces jeunes agriculteurs ?", "Le coût d'accès aux terres.", ["Le manque de formation agricole.", "La concurrence des grandes surfaces."], "« trouver des terres à un prix abordable reste le principal obstacle ».", 2),
          q("Pourquoi vendent-ils directement aux habitants ?", "Pour obtenir de meilleurs revenus.", ["Parce que la loi les y oblige.", "Pour se faire connaître des restaurants."], "« vendent directement… pour mieux gagner leur vie ».", 1),
        ] },
      { gioiThieu: "Document 2.", doan: [d("nova", TIN, "Bonne nouvelle pour les lecteurs du dimanche : la médiathèque centrale ouvrira désormais ses portes le dimanche après-midi. Cette décision fait suite à une consultation des habitants, qui réclamaient surtout plus de places pour travailler. Pour que les agents ne soient pas pénalisés, l'ouverture repose sur des volontaires, qui récupèrent ces heures en semaine.")],
        cau: [
          q("Pourquoi la médiathèque ouvre-t-elle le dimanche ?", "Pour répondre à une demande des habitants.", ["Pour attirer les touristes.", "Pour compenser une fermeture en semaine."], "« Cette décision fait suite à une consultation des habitants ».", 1.5),
          q("Comment l'ouverture est-elle organisée ?", "Avec des agents volontaires.", ["Avec des étudiants recrutés.", "Avec des bénévoles d'associations."], "« l'ouverture repose sur des volontaires ».", 1),
        ] },
      { gioiThieu: "Document 3.", doan: [d("echo", TIN, "Dans son atelier de Mirecourt, Julien Arnaud fabrique des guitares à partir de bois de récupération : vieux meubles, planchers anciens, tonneaux. Il ne s'agit pas seulement d'écologie, explique-t-il : un bois qui a vieilli pendant des décennies sonne mieux. Victime de son succès, il cherche maintenant un apprenti pour répondre aux commandes.")],
        cau: [
          q("Selon Julien Arnaud, le bois ancien est intéressant parce qu'il…", "produit un meilleur son.", ["coûte moins cher.", "est plus facile à travailler."], "« un bois qui a vieilli pendant des décennies sonne mieux ».", 1),
          q("Que souhaite faire Julien Arnaud ?", "Former quelqu'un pour l'aider.", ["Ouvrir une boutique à Paris.", "Fabriquer d'autres instruments."], "« il cherche maintenant un apprenti ».", 0.5),
        ] },
    ] },
  CE1: { tieuDe: "Lecture B2 · Đề 1 · Exercice 1 : faut-il supprimer les vols courts ?",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p("<strong>Vols courts : une interdiction plus symbolique qu'efficace ?</strong>",
      "Depuis 2023, la France interdit les vols intérieurs lorsqu'un trajet équivalent en train dure moins de deux heures trente. Présentée comme une mesure phare pour le climat, cette interdiction ne concerne pourtant que trois liaisons, dont Paris-Orly vers Bordeaux, Nantes et Lyon. Les vols de correspondance, eux, restent autorisés.",
      "Pour Hélène Garnier, qui fait chaque semaine l'aller-retour entre Bordeaux et Paris, le changement est passé presque inaperçu. « Je prenais déjà le train : il me dépose en plein centre-ville et je peux travailler pendant le trajet. Ce qui me pose problème, ce n'est pas l'interdiction, c'est le prix des billets, qui a beaucoup augmenté aux heures de pointe. » Plusieurs associations d'usagers font le même constat : sans tarifs accessibles, le report vers le rail profite surtout aux voyageurs aisés.",
      "Le chercheur en économie des transports Paul Lemaire se montre plus critique encore. « Les trois lignes supprimées représentaient une part infime des émissions du transport aérien français. L'essentiel des émissions vient des vols long-courriers, que personne ne propose de limiter. » Selon lui, la mesure aurait surtout une valeur de signal : montrer que l'avion n'est plus toujours le choix évident. « Ce signal n'est pas inutile, ajoute-t-il, mais il ne faut pas le confondre avec une politique climatique. »",
      "Du côté des compagnies aériennes, on dénonce une décision qui fragilise l'aménagement du territoire. Certaines villes moyennes, mal desservies par le train, craignent d'être les prochaines visées. À l'inverse, des élus écologistes réclament d'étendre l'interdiction aux trajets de moins de quatre heures, à condition d'investir massivement dans les lignes ferroviaires, notamment les trains de nuit.",
      "Entre symbole et efficacité, le débat révèle une question plus large : peut-on demander aux citoyens de changer leurs habitudes sans leur proposer, en échange, une alternative fiable et abordable ?"),
    cau: [
      q("Quelle est la particularité de l'interdiction des vols courts en France ?", "Elle s'applique à un petit nombre de lignes.", ["Elle concerne tous les vols intérieurs.", "Elle vise surtout les vols internationaux."], "« cette interdiction ne concerne pourtant que trois liaisons ».", 1),
      q("Pour Hélène Garnier, la mesure…", "n'a pas changé ses habitudes.", ["l'a obligée à changer de travail.", "lui a fait perdre beaucoup de temps."], "« le changement est passé presque inaperçu… Je prenais déjà le train ».", 1.5),
      q("Quel inconvénient Hélène Garnier souligne-t-elle ?", "Le coût élevé du train à certaines heures.", ["Le manque de confort dans les trains.", "Les retards fréquents."], "« c'est le prix des billets, qui a beaucoup augmenté aux heures de pointe ».", 0.5),
      q("Selon les associations d'usagers, le report vers le train…", "favorise surtout les voyageurs les plus riches.", ["a réduit le nombre de voyageurs.", "a fait baisser les prix."], "« le report vers le rail profite surtout aux voyageurs aisés ».", 1),
      q("Pour Paul Lemaire, l'impact environnemental de la mesure est…", "très limité.", ["impossible à mesurer.", "plus important que prévu."], "« une part infime des émissions du transport aérien ».", 1.5),
      q("D'après Paul Lemaire, l'intérêt principal de cette interdiction est de…", "faire évoluer la perception de l'avion.", ["réduire les émissions des vols longs.", "financer les lignes de train."], "« montrer que l'avion n'est plus toujours le choix évident ».", 2),
      q("À quelle condition les élus écologistes veulent-ils étendre l'interdiction ?", "Un investissement important dans le rail.", ["Une baisse du prix des billets d'avion.", "L'accord des compagnies aériennes."], "« à condition d'investir massivement dans les lignes ferroviaires ».", 1.5),
    ] },
  CE2: { tieuDe: "Lecture B2 · Đề 1 · Exercice 2 : faut-il supprimer les devoirs à la maison ?",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p("<strong>Devoirs à la maison : la fin d'une tradition ?</strong>",
      "Officiellement, les devoirs écrits sont interdits à l'école élémentaire depuis… 1956. Dans la pratique, pourtant, la plupart des enfants rentrent chaque soir avec des leçons à apprendre et des exercices à terminer. Plusieurs écoles ont décidé de franchir le pas et de les supprimer vraiment, en les remplaçant par un temps de travail encadré en fin de journée.",
      "Directrice d'une école à Rennes, Sophie Le Guen défend ce choix. « Les devoirs creusent les inégalités. Certains enfants sont aidés par des parents disponibles et diplômés, d'autres se retrouvent seuls devant une consigne qu'ils ne comprennent pas. Quand le travail se fait en classe, avec un adulte, chacun part avec les mêmes chances. » Elle reconnaît que les débuts ont été difficiles : certains parents craignaient que leurs enfants « ne fassent plus rien » et que le niveau baisse. Un an plus tard, les résultats aux évaluations nationales sont restés stables, et les familles se disent soulagées de soirées plus calmes.",
      "Tous les spécialistes ne partagent pas cet enthousiasme. Le psychologue de l'éducation Marc Dufour rappelle que le travail personnel développe l'autonomie. « Apprendre à s'organiser seul, à revenir sur une notion sans le professeur, c'est une compétence essentielle pour le collège. Supprimer totalement les devoirs, c'est risquer de reporter cet apprentissage à plus tard, au moment où il sera plus difficile. » Il plaide plutôt pour des devoirs courts, que l'enfant peut réaliser sans aide.",
      "Pour les parents, le sujet est souvent sensible. Les devoirs sont parfois le seul moment où ils voient concrètement ce que leur enfant apprend. Certains enseignants proposent donc de les remplacer par un cahier de liaison détaillé ou par des « devoirs de curiosité » : lire, cuisiner une recette, observer la nature, puis en parler en classe.",
      "Entre suppression et allègement, une chose semble acquise : le devoir qui dépend entièrement de l'aide d'un adulte n'a plus vraiment sa place."),
    cau: [
      q("Que révèle l'article sur l'interdiction des devoirs écrits ?", "Elle existe depuis longtemps mais n'est pas respectée.", ["Elle vient d'être décidée.", "Elle ne concerne que le collège."], "« interdits… depuis 1956. Dans la pratique, pourtant, la plupart des enfants rentrent… avec des exercices ».", 1),
      q("Selon Sophie Le Guen, les devoirs à la maison…", "accentuent les différences entre élèves.", ["fatiguent surtout les enseignants.", "sont trop faciles pour les enfants."], "« Les devoirs creusent les inégalités ».", 1.5),
      q("Au début, certains parents avaient peur…", "d'une baisse du niveau scolaire.", ["que l'école ferme plus tard.", "de devoir payer des cours."], "« certains parents craignaient… que le niveau baisse ».", 1),
      q("Après un an, quel bilan l'école fait-elle ?", "Les résultats n'ont pas baissé.", ["Les résultats ont nettement progressé.", "Les parents ont demandé le retour des devoirs."], "« les résultats aux évaluations nationales sont restés stables ».", 1.5),
      q("Pour Marc Dufour, le travail personnel permet surtout…", "d'apprendre à travailler de façon autonome.", ["de mieux préparer les examens.", "de renforcer le lien avec les parents."], "« le travail personnel développe l'autonomie ».", 2),
      q("Que propose Marc Dufour ?", "Des devoirs brefs, faisables seul.", ["La suppression complète des devoirs.", "Des cours de soutien payants."], "« des devoirs courts, que l'enfant peut réaliser sans aide ».", 0.5),
      q("Pour certains parents, les devoirs représentent…", "un moyen de suivre ce que l'enfant apprend.", ["une source de conflits inutiles.", "une occasion de jouer avec l'enfant."], "« le seul moment où ils voient concrètement ce que leur enfant apprend ».", 1.5),
    ] },
  CE3: { tieuDe: "Lecture B2 · Đề 1 · Exercice 3 : des voitures en centre-ville ?",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Faut-il interdire les voitures dans le centre-ville ? »</p>",
    ten: ["Nadia", "Bertrand", "Lucas"],
    readingText: p("<strong>Nadia</strong>",
      "J'habite en plein centre depuis dix ans et la piétonnisation de ma rue a changé ma vie : moins de bruit, des enfants qui jouent dehors, des terrasses. Mais il faut être honnête, ce n'est possible que parce que les bus sont fréquents. Interdire la voiture sans proposer de transports efficaces, ce serait punir ceux qui n'ont pas le choix. La transformation doit se faire progressivement, quartier par quartier.",
      "<strong>Bertrand</strong>",
      "Je suis artisan et j'interviens chez mes clients avec mon matériel. Un plombier ne se déplace pas à vélo avec cinquante kilos d'outils ! Chaque nouvelle rue fermée me fait perdre du temps et donc de l'argent. On parle toujours des habitants du centre, jamais de ceux qui y travaillent. Avant de fermer les rues, qu'on consulte enfin les professionnels.",
      "<strong>Lucas</strong>",
      "La question ne devrait même plus se poser. La pollution de l'air provoque des milliers de décès chaque année : c'est un problème de santé publique, pas de confort. Les villes qui ont osé interdire les voitures, comme Pontevedra en Espagne, ont vu leurs commerces revivre. Il faut aller vite et accepter que certaines habitudes disparaissent."),
    cau: null },
};
DE1.CE3.cau = (() => { const x = ai(DE1.CE3.ten); return [
  x("Les commerces profitent de la fermeture des rues aux voitures.", "Lucas", "Lucas : « ont vu leurs commerces revivre ».", 2),
  x("Il faut changer les choses par étapes.", "Nadia", "Nadia : « progressivement, quartier par quartier ».", 1.5),
  x("Les décisions sont prises sans écouter certains usagers.", "Bertrand", "Bertrand : « qu'on consulte enfin les professionnels ».", 1),
  x("La santé doit passer avant tout.", "Lucas", "Lucas : « c'est un problème de santé publique ».", 1.5),
  x("Une interdiction serait injuste sans alternative.", "Nadia", "Nadia : « ce serait punir ceux qui n'ont pas le choix ».", 0.5),
  x("Ces mesures ont un coût pour certains travailleurs.", "Bertrand", "Bertrand : « me fait perdre du temps et donc de l'argent ».", 0.5),
]; })();

/* ═══════════════════════════ ĐỀ 2 ═══════════════════════════ */
const DE2 = { ten: "DELF B2 · Đề 2",
  CO1: { ten: "b2n-de2-co1", tieuDe: "Écoute B2 · Đề 2 · Exercice 1 : la sobriété numérique",
    gioiThieu: "Vous écoutez une émission à la radio.",
    doan: [
      d("sage", RADIO, "Bonsoir. On l'oublie souvent, mais le numérique a un coût écologique. Selon plusieurs estimations, il représenterait aujourd'hui environ quatre pour cent des émissions mondiales de gaz à effet de serre. Notre invité, Thomas Renaud, est ingénieur et auteur d'un guide sur la sobriété numérique. Thomas Renaud, qu'est-ce qui pollue le plus : nos mails, nos vidéos ?"),
      d("echo", KHACH, "Ni l'un ni l'autre, en réalité. Contrairement à ce qu'on croit, l'essentiel de l'impact vient de la fabrication des appareils. Extraire les métaux, assembler un smartphone, le transporter : tout cela pèse bien plus lourd que des années d'utilisation. Supprimer ses vieux mails, c'est sympathique, mais c'est un peu comme fermer le robinet pendant que la baignoire déborde."),
      d("sage", RADIO, "Le geste le plus utile serait donc…"),
      d("echo", KHACH, "De garder ses appareils plus longtemps. Aujourd'hui, en France, on change de téléphone en moyenne tous les deux ans et demi, alors qu'il pourrait fonctionner deux fois plus longtemps. Faire réparer son écran, changer la batterie, acheter reconditionné : ce sont les vraies priorités."),
      d("sage", RADIO, "Mais les fabricants ne nous aident pas toujours…"),
      d("echo", KHACH, "C'est vrai. Pendant longtemps, certains appareils étaient pratiquement impossibles à ouvrir. L'indice de réparabilité, obligatoire en France depuis 2021, a un peu changé les choses : il oblige les marques à afficher une note, et elles ont commencé à faire des efforts pour ne pas être mal classées. Ce n'est pas parfait, mais c'est un levier."),
      d("sage", RADIO, "Et les usages ? Le streaming, par exemple ?"),
      d("echo", KHACH, "Ils comptent aussi, surtout quand ils poussent à renouveler le matériel. Regarder une vidéo en très haute définition sur un petit écran n'apporte rien. Mon message, ce n'est pas de renoncer au numérique, qui rend d'immenses services. C'est de l'utiliser en conscience, comme on a appris à le faire pour l'eau ou l'électricité.")],
    cau: [
      q("Selon le journaliste, le numérique représente…", "une part non négligeable des émissions mondiales.", ["la principale source de pollution.", "une part impossible à estimer."], "« environ quatre pour cent des émissions mondiales ».", 1.5),
      q("D'après Thomas Renaud, la plus grande partie de l'impact provient…", "de la production des appareils.", ["de l'envoi des courriels.", "du visionnage de vidéos."], "« l'essentiel de l'impact vient de la fabrication des appareils ».", 1),
      q("Que pense-t-il de la suppression des vieux mails ?", "C'est un geste peu efficace.", ["C'est la priorité absolue.", "C'est inutile et même nuisible."], "« c'est sympathique, mais… fermer le robinet pendant que la baignoire déborde ».", 1.5),
      q("Quel est, selon lui, le geste le plus utile ?", "Prolonger la durée de vie de ses appareils.", ["Acheter des appareils plus puissants.", "Éteindre son téléphone la nuit."], "« De garder ses appareils plus longtemps ».", 1),
      q("Qu'a permis l'indice de réparabilité ?", "Inciter les fabricants à améliorer leurs produits.", ["Baisser le prix des réparations.", "Interdire les appareils non réparables."], "« elles ont commencé à faire des efforts pour ne pas être mal classées ».", 1.5),
      q("À propos du streaming, Thomas Renaud estime que…", "la très haute définition est souvent superflue.", ["il faut l'interdire sur les téléphones.", "son impact est nul."], "« Regarder une vidéo en très haute définition sur un petit écran n'apporte rien ».", 1.5),
      q("Quel est le message principal de Thomas Renaud ?", "Utiliser le numérique de façon raisonnée.", ["Renoncer progressivement au numérique.", "Faire payer davantage les utilisateurs."], "« de l'utiliser en conscience ».", 1),
    ] },
  CO2: { ten: "b2n-de2-co2", tieuDe: "Écoute B2 · Đề 2 · Exercice 2 : la vie d'une gardienne de refuge",
    gioiThieu: "Vous écoutez une émission à la radio.",
    doan: [
      d("nova", RADIO, "Nous sommes à deux mille quatre cents mètres d'altitude, dans les Pyrénées. Depuis douze ans, Marion garde ce refuge de juin à septembre. Elle accueille chaque soir une quarantaine de randonneurs."),
      d("shimmer", KHACH, "Au début, je pensais que mon métier, ce serait surtout cuisiner et faire les lits. En fait, je passe beaucoup de temps à informer les gens sur la météo et l'état des chemins. Beaucoup de randonneurs arrivent mal préparés, avec des chaussures de ville, sans vêtements chauds. Mon rôle, c'est aussi d'éviter les accidents."),
      d("nova", RADIO, "Comment le refuge est-il approvisionné ?"),
      d("shimmer", KHACH, "Par hélicoptère, deux fois par saison. C'est très cher et ça pollue, donc on a appris à tout calculer. On cuisine avec des produits locaux qui se conservent, on limite les déchets au maximum, et chaque randonneur redescend ses propres emballages. Au début, certains râlaient ; maintenant, la plupart trouvent ça normal."),
      d("nova", RADIO, "Le refuge a beaucoup changé ces dernières années."),
      d("shimmer", KHACH, "Oui. On a installé des panneaux solaires et des toilettes sèches. Mais le vrai changement, c'est le climat. Le glacier qu'on voyait depuis la terrasse a presque disparu, et l'eau devient rare en fin d'été. L'an dernier, on a dû fermer deux semaines plus tôt faute d'eau. C'est quelque chose que je n'aurais jamais imaginé en commençant."),
      d("nova", RADIO, "Qu'est-ce qui vous fait rester ?"),
      d("shimmer", KHACH, "Les rencontres. Des gens qui ne se seraient jamais parlé en bas partagent la même table, le même dortoir. Le soir, on regarde le coucher de soleil ensemble. Il y a une forme d'égalité ici : peu importe ce que vous faites dans la vie, vous avez marché comme les autres."),
      d("nova", RADIO, "Et pour l'avenir ?"),
      d("shimmer", KHACH, "On réfléchit avec le parc national à accueillir des classes, au printemps, pour sensibiliser les enfants à la montagne et au changement climatique.")],
    cau: [
      q("Selon Marion, une partie importante de son travail consiste à…", "conseiller les randonneurs pour leur sécurité.", ["guider des groupes en montagne.", "entretenir les sentiers."], "« je passe beaucoup de temps à informer les gens… Mon rôle, c'est aussi d'éviter les accidents ».", 1.5),
      q("D'après elle, beaucoup de randonneurs…", "ne sont pas bien équipés.", ["arrivent trop tard le soir.", "refusent de partager le dortoir."], "« arrivent mal préparés, avec des chaussures de ville ».", 1),
      q("Pourquoi l'organisation des repas demande-t-elle beaucoup de calcul ?", "Le ravitaillement est rare et coûteux.", ["Les randonneurs ont des régimes particuliers.", "La cuisine est trop petite."], "« Par hélicoptère, deux fois par saison. C'est très cher ».", 2),
      q("Que doivent faire les randonneurs avec leurs emballages ?", "Les rapporter dans la vallée.", ["Les trier au refuge.", "Les payer à l'arrivée."], "« chaque randonneur redescend ses propres emballages ».", 1.5),
      q("Quelle conséquence du réchauffement Marion a-t-elle observée ?", "Le manque d'eau a écourté la saison.", ["Il y a moins de randonneurs.", "Les orages sont plus violents."], "« on a dû fermer deux semaines plus tôt faute d'eau ».", 1.5),
      q("Ce que Marion apprécie dans la vie au refuge, c'est…", "le sentiment d'égalité entre les visiteurs.", ["le calme et la solitude.", "la possibilité de faire du sport."], "« Il y a une forme d'égalité ici ».", 0.5),
      q("Quel projet est envisagé pour l'avenir ?", "Recevoir des groupes scolaires.", ["Agrandir le refuge.", "Ouvrir toute l'année."], "« accueillir des classes, au printemps ».", 1),
    ] },
  CO3: { ten: "b2n-de2-co3", tieuDe: "Écoute B2 · Đề 2 · Exercice 3 : trois courts documents",
    docs: [
      { gioiThieu: "Document 1.", doan: [d("alloy", TIN, "Et si l'on apprenait l'histoire en jouant ? Dans plusieurs collèges, des professeurs transforment leurs cours en jeux d'évasion : pour sortir de la salle, les élèves doivent résoudre des énigmes liées au programme. Les enseignants constatent une meilleure mémorisation, surtout chez les élèves qui décrochent habituellement. Le revers : préparer une seule séance peut demander plusieurs semaines de travail.")],
        cau: [
          q("D'après les enseignants, à qui ces jeux profitent-ils particulièrement ?", "Aux élèves habituellement en difficulté.", ["Aux meilleurs élèves.", "Aux élèves les plus âgés."], "« surtout chez les élèves qui décrochent habituellement ».", 2),
          q("Quel inconvénient le document mentionne-t-il ?", "Le temps de préparation nécessaire.", ["Le coût du matériel.", "Le bruit dans la classe."], "« préparer une seule séance peut demander plusieurs semaines de travail ».", 1),
        ] },
      { gioiThieu: "Document 2.", doan: [d("nova", TIN, "Pour inciter les salariés à partager leur voiture, une agglomération de l'Ouest a lancé une prime : deux euros par trajet pour le conducteur, gratuité pour les passagers. En six mois, le nombre de covoitureurs a triplé. Le dispositif n'est pourtant pas éternel : il est financé pour deux ans, le temps de transformer les habitudes.")],
        cau: [
          q("Quel est l'objectif de cette mesure ?", "Encourager le partage de voiture pour aller travailler.", ["Réduire le prix de l'essence.", "Financer de nouvelles routes."], "« inciter les salariés à partager leur voiture ».", 1.5),
          q("D'après le document, la prime…", "est prévue pour une durée limitée.", ["sera bientôt doublée.", "ne concerne que les passagers."], "« il est financé pour deux ans ».", 1),
        ] },
      { gioiThieu: "Document 3.", doan: [d("echo", TIN, "Céramiste installée en Bourgogne, Léa Morel a longtemps travaillé seule. Aujourd'hui, elle accueille chaque année deux apprentis. Pour elle, transmettre est devenu une évidence : de nombreux savoir-faire disparaissent faute de successeurs. Elle prépare d'ailleurs un livre pour partager ses techniques avec les amateurs.")],
        cau: [
          q("Pourquoi Léa Morel forme-t-elle des apprentis ?", "Pour éviter la disparition de certains savoir-faire.", ["Pour augmenter sa production.", "Pour obtenir des aides publiques."], "« de nombreux savoir-faire disparaissent faute de successeurs ».", 1),
          q("Quel projet prépare-t-elle ?", "L'écriture d'un ouvrage.", ["L'ouverture d'une école.", "Une exposition à l'étranger."], "« Elle prépare d'ailleurs un livre ».", 0.5),
        ] },
    ] },
  CE1: { tieuDe: "Lecture B2 · Đề 2 · Exercice 1 : la semaine de quatre jours",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p("<strong>Travailler quatre jours par semaine : la fausse bonne idée ?</strong>",
      "Séduisante sur le papier, la semaine de quatre jours gagne du terrain. Plusieurs entreprises françaises l'ont adoptée, et certaines administrations l'expérimentent. Le principe : effectuer le même nombre d'heures sur quatre jours au lieu de cinq, ou, dans sa version la plus ambitieuse, réduire le temps de travail sans baisser les salaires.",
      "Dans une entreprise lyonnaise de logiciels, le passage aux quatre jours a eu un effet inattendu sur le recrutement. « Nous recevons trois fois plus de candidatures qu'avant, explique la directrice des ressources humaines, Anne Perrin. Dans un secteur où tout le monde se dispute les mêmes profils, c'est devenu notre meilleur argument. » Les salariés, eux, évoquent surtout un meilleur équilibre : un jour par semaine pour les enfants, les démarches administratives ou simplement le repos.",
      "Mais le modèle a ses limites. Lorsqu'il s'agit de faire les mêmes heures en moins de jours, les journées s'allongent et la fatigue augmente. Le sociologue Laurent Simon met en garde : « Pour un salarié qui n'a pas de longs trajets, dix heures de travail par jour peuvent passer. Pour un parent qui dépend d'une crèche qui ferme à dix-huit heures, c'est tout simplement impossible. » La mesure risquerait ainsi de profiter davantage à ceux qui ont déjà le plus de liberté.",
      "Certains métiers se prêtent par ailleurs mal à l'exercice. Dans le commerce, la santé ou l'industrie, où une présence continue est nécessaire, réorganiser les plannings relève du casse-tête. Des syndicats craignent même que la semaine de quatre jours serve de prétexte pour intensifier le travail.",
      "Pour Laurent Simon, la vraie question n'est pas le nombre de jours, mais la charge de travail. « Si l'on se contente de concentrer les mêmes tâches sur moins de temps, on déplace la fatigue sans la réduire. Une réforme réussie suppose d'abord de supprimer les tâches inutiles. »"),
    cau: [
      q("Selon l'article, la semaine de quatre jours…", "se développe progressivement.", ["est désormais obligatoire.", "a été abandonnée par les entreprises."], "« la semaine de quatre jours gagne du terrain ».", 1),
      q("Dans l'entreprise lyonnaise, quel avantage la mesure a-t-elle apporté ?", "Elle attire davantage de candidats.", ["Elle a réduit les coûts de l'entreprise.", "Elle a augmenté les ventes."], "« Nous recevons trois fois plus de candidatures ».", 1.5),
      q("Pour les salariés, le principal bénéfice est…", "une meilleure conciliation des temps de vie.", ["une hausse de salaire.", "la possibilité de télétravailler."], "« un meilleur équilibre ».", 1),
      q("Quel risque Laurent Simon souligne-t-il ?", "Des journées trop longues pour certains salariés.", ["Une baisse générale des salaires.", "Une augmentation du chômage."], "« les journées s'allongent… c'est tout simplement impossible ».", 1.5),
      q("D'après Laurent Simon, la mesure pourrait…", "renforcer certaines inégalités.", ["réduire les écarts entre salariés.", "aider en priorité les parents."], "« profiter davantage à ceux qui ont déjà le plus de liberté ».", 2),
      q("Pourquoi certains secteurs sont-ils peu adaptés à ce modèle ?", "Ils nécessitent une présence permanente.", ["Leurs salariés travaillent déjà à temps partiel.", "Ils manquent de travail."], "« où une présence continue est nécessaire ».", 0.5),
      q("Pour Laurent Simon, une réforme réussie passe d'abord par…", "la réduction de la charge de travail.", ["l'allongement des journées.", "le recrutement de nouveaux salariés."], "« supprimer les tâches inutiles ».", 1.5),
    ] },
  CE2: { tieuDe: "Lecture B2 · Đề 2 · Exercice 2 : le retour des jeux de société",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p("<strong>Jeux de société : pourquoi on s'y remet</strong>",
      "On les croyait condamnés par les écrans. Pourtant, les jeux de société n'ont jamais aussi bien marché : en France, leurs ventes ont presque doublé en dix ans, et chaque année plus de mille nouveaux titres arrivent dans les rayons. Les bars à jeux se multiplient, et les festivals attirent des dizaines de milliers de visiteurs.",
      "Pour l'anthropologue Julie Lambert, ce succès n'a rien d'un paradoxe. « Plus nous passons de temps devant des écrans, plus nous ressentons le besoin de moments partagés, physiques, où l'on se regarde. Le jeu de société offre un cadre : on pose son téléphone, on s'assoit autour d'une table, et pendant une heure on accepte les mêmes règles. » Elle observe aussi que le jeu permet de rencontrer des inconnus sans la gêne d'une conversation à inventer : « Les règles parlent à notre place. »",
      "Les créateurs ont su accompagner ce mouvement. Fini les parties interminables qui se terminaient en dispute familiale : les jeux actuels sont plus courts, plus variés, souvent coopératifs. Dans ces derniers, les joueurs ne s'affrontent pas mais gagnent ou perdent ensemble, ce qui séduit particulièrement les familles et les entreprises, qui les utilisent lors de séminaires.",
      "Ce succès cache cependant une réalité plus contrastée pour les auteurs. Le marché est saturé : un jeu reste en moyenne quelques mois en magasin avant d'être remplacé. « On vit difficilement de la création, confie Romain Petit, auteur d'une quinzaine de jeux. Beaucoup d'entre nous ont un autre emploi. » Les éditeurs, eux, misent sur des valeurs sûres et rééditent les classiques.",
      "Reste une question : cet engouement durera-t-il ? Pour Julie Lambert, oui, tant que le besoin de se retrouver ensemble restera plus fort que la tentation de rester seul derrière son écran."),
    cau: [
      q("D'après l'article, le marché des jeux de société…", "est en forte croissance.", ["est en déclin à cause des écrans.", "est stable depuis dix ans."], "« leurs ventes ont presque doublé en dix ans ».", 1),
      q("Pour Julie Lambert, le succès des jeux s'explique par…", "un besoin de relations directes.", ["la baisse de leur prix.", "la publicité sur les réseaux sociaux."], "« le besoin de moments partagés, physiques ».", 1.5),
      q("Selon elle, les règles du jeu facilitent…", "les échanges entre personnes qui ne se connaissent pas.", ["l'apprentissage des enfants.", "la concentration au travail."], "« rencontrer des inconnus… Les règles parlent à notre place ».", 1),
      q("Comment les jeux actuels ont-ils évolué ?", "Ils sont plus courts et plus diversifiés.", ["Ils sont plus difficiles.", "Ils utilisent tous des écrans."], "« les jeux actuels sont plus courts, plus variés ».", 1.5),
      q("Dans les jeux coopératifs, les joueurs…", "partagent le même objectif.", ["jouent chacun pour soi.", "doivent être nombreux."], "« ne s'affrontent pas mais gagnent ou perdent ensemble ».", 2),
      q("Pourquoi les auteurs de jeux ont-ils du mal à vivre de leur travail ?", "Les jeux restent peu de temps en vente.", ["Les éditeurs ne paient pas les droits.", "Les joueurs achètent surtout d'occasion."], "« un jeu reste en moyenne quelques mois en magasin ».", 0.5),
      q("D'après Julie Lambert, l'intérêt pour les jeux…", "dépend du désir de se réunir.", ["va bientôt disparaître.", "dépendra des prix."], "« tant que le besoin de se retrouver ensemble restera plus fort ».", 1.5),
    ] },
  CE3: { tieuDe: "Lecture B2 · Đề 2 · Exercice 3 : un service civique obligatoire ?",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Faut-il rendre le service civique obligatoire pour tous les jeunes ? »</p>",
    ten: ["Camille", "Hugo", "Martine"],
    readingText: p("<strong>Camille</strong>",
      "J'ai fait six mois de service civique dans une association d'aide aux personnes âgées, et c'est la meilleure expérience de ma vie. Mais je l'ai choisie ! Si on l'impose, beaucoup de jeunes le feront à reculons, et ce sont les associations qui en souffriront. L'engagement ne se décrète pas : il faut plutôt mieux le faire connaître et mieux l'indemniser.",
      "<strong>Hugo</strong>",
      "Je suis pour. Aujourd'hui, les jeunes de milieux différents ne se croisent jamais : chacun dans son lycée, son quartier, ses réseaux. Un service obligatoire de quelques mois serait l'un des rares moments où tout le monde se retrouve au même endroit. C'est ça qui fait une société. Bien sûr, il faudra que ce soit utile, et pas une simple occupation.",
      "<strong>Martine</strong>",
      "Comme enseignante, je vois des élèves épuisés par la pression des études. Leur imposer une année supplémentaire avant d'entrer dans la vie active, c'est retarder leur autonomie financière, alors que beaucoup doivent déjà travailler pour payer leurs études. Et qui va financer tout ça ? Commençons par donner les moyens aux écoles."),
    cau: null },
};
DE2.CE3.cau = (() => { const x = ai(DE2.CE3.ten); return [
  x("Un service obligatoire favoriserait la mixité sociale.", "Hugo", "Hugo : « l'un des rares moments où tout le monde se retrouve au même endroit ».", 2),
  x("Rendre l'engagement obligatoire lui ferait perdre son sens.", "Camille", "Camille : « L'engagement ne se décrète pas ».", 1.5),
  x("Cette mesure pénaliserait financièrement les jeunes.", "Martine", "Martine : « retarder leur autonomie financière ».", 1),
  x("La qualité des missions est une condition indispensable.", "Hugo", "Hugo : « il faudra que ce soit utile, et pas une simple occupation ».", 1.5),
  x("L'argent devrait aller en priorité à l'éducation.", "Martine", "Martine : « Commençons par donner les moyens aux écoles ».", 0.5),
  x("Cette expérience a été très enrichissante pour moi.", "Camille", "Camille : « c'est la meilleure expérience de ma vie ».", 0.5),
]; })();

/* ═══════════════════════════ ĐỀ 3 ═══════════════════════════ */
const DE3 = { ten: "DELF B2 · Đề 3",
  CO1: { ten: "b2n-de3-co1", tieuDe: "Écoute B2 · Đề 3 · Exercice 1 : la fatigue informationnelle",
    gioiThieu: "Vous écoutez une émission à la radio.",
    doan: [
      d("sage", RADIO, "Bonjour. Alertes, notifications, chaînes d'information en continu : jamais nous n'avons eu accès à autant d'informations. Et pourtant, de plus en plus de Français disent éviter l'actualité. Un sondage récent indique qu'un tiers d'entre eux déclare s'en détourner volontairement. Nous en parlons avec Nadia Belkacem, chercheuse en sciences de l'information. Nadia Belkacem, comment expliquer ce phénomène ?"),
      d("shimmer", KHACH, "On parle de fatigue informationnelle. Ce n'est pas un désintérêt pour le monde, au contraire. Les personnes qui se détournent de l'actualité sont souvent celles qui la suivaient le plus. À un moment, elles se sentent submergées : trop de mauvaises nouvelles, trop vite, sans possibilité d'agir. L'évitement devient alors une manière de se protéger."),
      d("sage", RADIO, "Les médias ont-ils une part de responsabilité ?"),
      d("shimmer", KHACH, "En partie. La logique de l'information en continu pousse à répéter les mêmes images et à privilégier ce qui choque. Et sur les réseaux sociaux, les algorithmes mettent en avant les contenus qui suscitent de l'émotion, souvent de la colère. Le problème n'est pas l'information en elle-même, c'est la manière dont elle nous parvient."),
      d("sage", RADIO, "Faut-il s'inquiéter de cette tendance ?"),
      d("shimmer", KHACH, "Oui, pour la démocratie. Des citoyens qui ne s'informent plus votent moins et deviennent plus vulnérables aux rumeurs, parce qu'ils n'ont plus de repères. Mais on peut aussi y voir un signal positif : les gens ne veulent pas moins d'information, ils en veulent une meilleure."),
      d("sage", RADIO, "Que conseillez-vous concrètement ?"),
      d("shimmer", KHACH, "De choisir ses moments. Plutôt que de recevoir des alertes toute la journée, on peut consulter l'actualité une ou deux fois, à heure fixe, sur des sources fiables. Et pourquoi pas privilégier les formats longs, qui expliquent au lieu de simplement annoncer. On ressort d'une bonne enquête mieux informé et souvent moins angoissé qu'après une heure de fil d'actualité.")],
    cau: [
      q("Selon le sondage cité, une partie des Français…", "évite délibérément l'actualité.", ["ne fait plus confiance aux journalistes.", "s'informe uniquement sur Internet."], "« un tiers d'entre eux déclare s'en détourner volontairement ».", 1.5),
      q("D'après Nadia Belkacem, les personnes qui évitent l'actualité…", "étaient souvent très informées auparavant.", ["ne s'y sont jamais intéressées.", "sont surtout des jeunes."], "« sont souvent celles qui la suivaient le plus ».", 1),
      q("Pour elle, éviter l'actualité est une façon de…", "se préserver.", ["protester contre les médias.", "gagner du temps."], "« L'évitement devient alors une manière de se protéger ».", 1.5),
      q("Que reproche-t-elle aux algorithmes des réseaux sociaux ?", "De favoriser les contenus qui provoquent des émotions fortes.", ["De cacher les informations importantes.", "De diffuser trop de publicité."], "« les algorithmes mettent en avant les contenus qui suscitent de l'émotion ».", 1),
      q("Quel danger voit-elle pour la démocratie ?", "Des citoyens plus exposés aux fausses informations.", ["La disparition des journaux.", "Une hausse de la violence."], "« plus vulnérables aux rumeurs ».", 1.5),
      q("Selon elle, cette tendance montre aussi que le public…", "souhaite une information de meilleure qualité.", ["n'a plus besoin des médias.", "préfère les divertissements."], "« ils en veulent une meilleure ».", 1.5),
      q("Que conseille-t-elle ?", "S'informer à des moments précis.", ["Supprimer ses comptes sur les réseaux sociaux.", "Lire uniquement la presse étrangère."], "« consulter l'actualité une ou deux fois, à heure fixe ».", 1),
    ] },
  CO2: { ten: "b2n-de3-co2", tieuDe: "Écoute B2 · Đề 3 · Exercice 2 : un potager sur les toits",
    gioiThieu: "Vous écoutez une émission à la radio.",
    doan: [
      d("nova", RADIO, "Sur le toit d'un centre commercial, au cœur de Paris, poussent des tomates, des fraises et une centaine de variétés de plantes. Ce potager de quatorze mille mètres carrés est l'un des plus grands d'Europe. Rencontre avec Pauline, responsable du site."),
      d("shimmer", KHACH, "Quand on a commencé, beaucoup de gens étaient sceptiques. On nous disait que la pollution de l'air rendrait les légumes impropres à la consommation. On a fait analyser nos récoltes par un laboratoire indépendant : les résultats sont tout à fait comparables à ceux de légumes cultivés à la campagne. Ça a rassuré tout le monde."),
      d("nova", RADIO, "Comment cultive-t-on sans terre, sur un toit ?"),
      d("shimmer", KHACH, "Le poids est la grande contrainte : un toit ne supporte pas des tonnes de terre. On utilise donc des colonnes verticales et des bacs légers, avec un substrat à base de fibre de coco. L'eau circule en circuit fermé, ce qui nous permet d'en consommer beaucoup moins qu'une exploitation classique."),
      d("nova", RADIO, "À qui vendez-vous vos produits ?"),
      d("shimmer", KHACH, "Surtout aux restaurants du quartier, qui viennent chercher les légumes à pied le matin même de la récolte. Pour eux, c'est une fraîcheur impossible à trouver ailleurs. Et on propose aussi des paniers aux habitants."),
      d("nova", RADIO, "Peut-on nourrir une ville comme Paris de cette façon ?"),
      d("shimmer", KHACH, "Non, soyons honnêtes. Même si on couvrait tous les toits disponibles, on ne produirait qu'une petite partie de ce que consomment les Parisiens. L'intérêt est ailleurs : ces fermes rafraîchissent les bâtiments en été, accueillent des insectes pollinisateurs et, surtout, elles reconnectent les citadins avec l'origine de leur nourriture. Beaucoup d'enfants qui viennent en visite n'avaient jamais vu un plant de tomate."),
      d("nova", RADIO, "Et demain ?"),
      d("shimmer", KHACH, "On aimerait former des jeunes au maraîchage urbain, pour qu'ils puissent créer leurs propres fermes ailleurs.")],
    cau: [
      q("Au début du projet, quelle crainte certaines personnes exprimaient-elles ?", "Que les légumes soient pollués.", ["Que le toit s'effondre.", "Que les légumes coûtent trop cher."], "« la pollution de l'air rendrait les légumes impropres à la consommation ».", 1.5),
      q("Les analyses du laboratoire ont montré que les légumes…", "étaient aussi sains que ceux de la campagne.", ["contenaient des traces de pollution.", "étaient plus nutritifs."], "« les résultats sont tout à fait comparables ».", 1),
      q("Pourquoi utilise-t-on des colonnes et des bacs légers ?", "À cause du poids que le toit peut supporter.", ["Pour gagner du temps à la récolte.", "Pour attirer les visiteurs."], "« Le poids est la grande contrainte ».", 2),
      q("Quel avantage présente le système d'arrosage ?", "Il économise l'eau.", ["Il est entièrement automatique.", "Il utilise l'eau de pluie seulement."], "« d'en consommer beaucoup moins qu'une exploitation classique ».", 1.5),
      q("Les restaurants apprécient ces produits surtout pour…", "leur fraîcheur.", ["leur prix.", "leur variété."], "« une fraîcheur impossible à trouver ailleurs ».", 1.5),
      q("D'après Pauline, ces fermes urbaines…", "ne peuvent pas nourrir toute la ville.", ["pourraient remplacer l'agriculture.", "devraient se développer sur tous les toits."], "« on ne produirait qu'une petite partie ».", 0.5),
      q("Quel est le projet de l'équipe ?", "Former des jeunes à cette activité.", ["Ouvrir un restaurant sur le toit.", "Vendre dans les supermarchés."], "« former des jeunes au maraîchage urbain ».", 1),
    ] },
  CO3: { ten: "b2n-de3-co3", tieuDe: "Écoute B2 · Đề 3 · Exercice 3 : trois courts documents",
    docs: [
      { gioiThieu: "Document 1.", doan: [d("alloy", TIN, "Le train de nuit revient. Après des années de fermetures, plusieurs lignes ont rouvert, vers la Côte d'Azur, l'Italie ou l'Autriche. Les voyageurs y voient une façon de voyager sans culpabilité écologique et de gagner une nuit d'hôtel. Mais le confort reste inégal : rames anciennes, couchettes étroites, retards fréquents. Pour séduire durablement, il faudra moderniser le matériel.")],
        cau: [
          q("Pourquoi les voyageurs choisissent-ils le train de nuit ?", "Pour voyager de façon plus écologique.", ["Parce que c'est le moyen le plus rapide.", "Pour profiter d'animations à bord."], "« voyager sans culpabilité écologique ».", 2),
          q("Selon le document, que faut-il améliorer ?", "L'état des trains.", ["Le nombre de destinations.", "Le prix des billets."], "« il faudra moderniser le matériel ».", 1),
        ] },
      { gioiThieu: "Document 2.", doan: [d("nova", TIN, "Dans ce centre social de Lille, on apprend à cuisiner avec les restes. Chaque mercredi, une cheffe montre comment transformer le pain rassis ou les légumes abîmés en plats savoureux. L'idée est née d'un constat : les participants jetaient beaucoup, faute de savoir quoi faire des produits. Les cours sont gratuits, et les recettes sont publiées dans un petit livret.")],
        cau: [
          q("Quel constat est à l'origine de ces cours ?", "Les habitants gaspillaient par manque de connaissances.", ["Les habitants mangeaient trop de plats préparés.", "Le centre manquait d'activités."], "« les participants jetaient beaucoup, faute de savoir quoi faire des produits ».", 1.5),
          q("Comment les recettes sont-elles diffusées ?", "Dans une brochure.", ["Sur un site internet.", "À la radio locale."], "« les recettes sont publiées dans un petit livret ».", 1),
        ] },
      { gioiThieu: "Document 3.", doan: [d("echo", TIN, "Photographe animalier, Antoine Roux peut attendre des jours entiers, caché dans la forêt, pour une seule image. Il refuse d'appâter les animaux avec de la nourriture, une pratique de plus en plus répandue. Pour lui, une belle photo ne justifie jamais de modifier le comportement de la faune. Ses images seront exposées cet hiver à Grenoble.")],
        cau: [
          q("Que refuse de faire Antoine Roux ?", "Attirer les animaux avec de la nourriture.", ["Photographier des espèces rares.", "Utiliser un appareil numérique."], "« Il refuse d'appâter les animaux avec de la nourriture ».", 1),
          q("Qu'apprend-on sur son actualité ?", "Il va présenter ses photos dans une exposition.", ["Il publie un livre de photos.", "Il part vivre en forêt."], "« Ses images seront exposées cet hiver à Grenoble ».", 0.5),
        ] },
    ] },
  CE1: { tieuDe: "Lecture B2 · Đề 3 · Exercice 1 : les villes face aux canicules",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p("<strong>Canicules : les villes cherchent la fraîcheur</strong>",
      "Les étés deviennent plus chauds, et les villes en souffrent davantage que les campagnes. Le béton et le bitume accumulent la chaleur le jour et la restituent la nuit : c'est le phénomène des îlots de chaleur urbains. Dans certains quartiers, l'écart de température avec la campagne voisine peut dépasser huit degrés en pleine nuit, ce qui empêche les habitants de récupérer.",
      "Pour y faire face, de nombreuses municipalités misent sur la végétalisation. À Lyon, des cours d'école goudronnées sont remplacées par de la terre, des arbres et des jeux en bois. « Les enfants ont plus d'ombre, mais ils jouent aussi différemment, plus calmement », constate une enseignante. Ces « cours oasis » sont ouvertes le week-end aux habitants du quartier, faute d'espaces verts à proximité.",
      "Planter des arbres n'est cependant pas une solution miracle. Un arbre met une quinzaine d'années à offrir une ombre véritablement efficace, rappelle l'urbaniste Karim Haddad. « Il faut planter dès maintenant pour les étés de 2040. Et il faut choisir des espèces capables de résister à la sécheresse, sinon on plante des arbres qui mourront dans dix ans. » Il insiste aussi sur la nécessité d'agir sur les bâtiments eux-mêmes : isolation, toits clairs, volets.",
      "Ces transformations ont un coût, et toutes les villes ne disposent pas des mêmes moyens. Les quartiers populaires, souvent plus denses et moins verts, sont aussi ceux où les habitants ont le moins de possibilités de fuir la chaleur : peu de résidences secondaires, logements mal isolés, climatisation rare. Pour plusieurs associations, l'adaptation au climat est donc aussi une question de justice sociale.",
      "Faut-il pour autant généraliser la climatisation ? La plupart des experts s'y opposent : elle consomme beaucoup d'énergie et rejette de l'air chaud dans la rue, aggravant le problème qu'elle prétend résoudre. Elle pourrait néanmoins rester indispensable dans les lieux qui accueillent les personnes les plus fragiles, comme les hôpitaux ou les maisons de retraite."),
    cau: [
      q("D'après l'article, les îlots de chaleur…", "empêchent la ville de se rafraîchir la nuit.", ["concernent surtout les campagnes.", "apparaissent seulement en journée."], "« accumulent la chaleur le jour et la restituent la nuit ».", 1),
      q("Que sont les « cours oasis » ?", "Des cours d'école transformées en espaces verts.", ["Des parcs réservés aux enfants.", "Des piscines municipales."], "« des cours d'école goudronnées sont remplacées par de la terre, des arbres ».", 1.5),
      q("Pourquoi ces cours sont-elles ouvertes le week-end ?", "Le quartier manque d'espaces verts.", ["Les écoles organisent des fêtes.", "Les parents l'ont demandé."], "« faute d'espaces verts à proximité ».", 0.5),
      q("Selon Karim Haddad, planter des arbres…", "produit des effets seulement à long terme.", ["est la seule solution efficace.", "coûte trop cher aux villes."], "« Un arbre met une quinzaine d'années à offrir une ombre véritablement efficace ».", 1),
      q("Pourquoi faut-il choisir les arbres avec soin ?", "Certains ne supporteront pas le manque d'eau.", ["Certains sont dangereux pour les enfants.", "Certains poussent trop vite."], "« des espèces capables de résister à la sécheresse ».", 1.5),
      q("D'après les associations, l'adaptation à la chaleur est aussi une question…", "d'égalité entre habitants.", ["de santé des enfants seulement.", "d'esthétique urbaine."], "« une question de justice sociale ».", 2),
      q("Que pensent la plupart des experts de la climatisation ?", "Elle peut aggraver la chaleur en ville.", ["Elle doit être installée partout.", "Elle est trop bruyante."], "« rejette de l'air chaud dans la rue, aggravant le problème ».", 1.5),
    ] },
  CE2: { tieuDe: "Lecture B2 · Đề 3 · Exercice 2 : apprendre à coder à l'école ?",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p("<strong>Faut-il apprendre à coder dès l'école primaire ?</strong>",
      "Depuis quelques années, l'initiation à la programmation fait partie des programmes scolaires, du primaire au lycée. Les enfants apprennent à donner des instructions à un petit robot ou à créer un jeu simple sur une tablette. Pour ses défenseurs, il s'agit d'une compétence aussi indispensable que la lecture ou le calcul dans un monde transformé par le numérique.",
      "Professeure des écoles à Toulouse, Isabelle Roche a d'abord été réticente. « Je ne suis pas informaticienne et je craignais de ne pas être à la hauteur. » Une formation de quelques jours lui a pourtant suffi. Ce qu'elle a découvert l'a surprise : « Coder, ce n'est pas d'abord une affaire de machines. C'est apprendre à décomposer un problème, à se tromper, à recommencer. Des élèves très discrets en classe se révèlent dans ces activités. »",
      "Le chercheur en sciences de l'éducation Pierre Vidal tempère cet enthousiasme. Selon lui, le risque est de confondre l'outil et la compétence. « Ce qui compte, c'est la logique, et on peut très bien la travailler sans écran, avec des jeux, des cartes ou des déplacements dans la cour. » Il s'inquiète aussi de voir les enfants, déjà très exposés aux écrans à la maison, passer encore plus de temps devant une tablette à l'école.",
      "Reste la question des moyens. Dans de nombreuses écoles, le matériel est insuffisant ou ancien, et les enseignants manquent de formation continue. Certains parents s'étonnent aussi de cette priorité quand les résultats en lecture et en mathématiques restent préoccupants.",
      "Pour Pierre Vidal, la réponse n'est pas de renoncer, mais de remettre la programmation à sa juste place : « un moyen d'apprendre à raisonner, pas une fin en soi »."),
    cau: [
      q("Pour les défenseurs de cet enseignement, savoir coder est…", "une compétence fondamentale aujourd'hui.", ["utile seulement aux futurs informaticiens.", "un simple loisir."], "« aussi indispensable que la lecture ou le calcul ».", 1),
      q("Pourquoi Isabelle Roche hésitait-elle au départ ?", "Elle doutait de ses compétences.", ["Elle trouvait le matériel trop cher.", "Ses élèves n'étaient pas intéressés."], "« je craignais de ne pas être à la hauteur ».", 1.5),
      q("Qu'a-t-elle découvert en enseignant la programmation ?", "Que cela développe la capacité à résoudre des problèmes.", ["Que les élèves s'ennuient rapidement.", "Que cela demande des connaissances avancées."], "« apprendre à décomposer un problème, à se tromper, à recommencer ».", 1),
      q("Selon elle, ces activités permettent à certains élèves…", "de révéler leurs qualités.", ["de rattraper leur retard en lecture.", "de travailler seuls."], "« Des élèves très discrets en classe se révèlent ».", 1.5),
      q("D'après Pierre Vidal, la logique…", "peut s'apprendre sans ordinateur.", ["nécessite obligatoirement une tablette.", "s'apprend surtout au lycée."], "« on peut très bien la travailler sans écran ».", 2),
      q("Quelle inquiétude exprime-t-il ?", "Une exposition encore plus grande aux écrans.", ["La fermeture de certaines écoles.", "Le désintérêt des enseignants."], "« passer encore plus de temps devant une tablette à l'école ».", 0.5),
      q("Pour Pierre Vidal, la programmation doit être considérée comme…", "un outil pour apprendre à raisonner.", ["une matière principale.", "une option facultative."], "« un moyen d'apprendre à raisonner, pas une fin en soi ».", 1.5),
    ] },
  CE3: { tieuDe: "Lecture B2 · Đề 3 · Exercice 3 : un smartphone avant 15 ans ?",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Faut-il interdire le smartphone aux enfants de moins de 15 ans ? »</p>",
    ten: ["Élise", "Karim", "Joséphine"],
    readingText: p("<strong>Élise</strong>",
      "Mère de deux ados, j'ai tenu jusqu'à leurs quatorze ans, et je ne le regrette pas. Mais une interdiction par la loi ? Impossible à appliquer. Ce qui marche, c'est l'accord entre parents : dans la classe de mon fils, on s'est mis d'accord pour retarder l'achat ensemble. Comme ça, aucun enfant ne se sent exclu.",
      "<strong>Karim</strong>",
      "Je suis pédiatre et je vois chaque semaine les effets des écrans : troubles du sommeil, difficultés de concentration, anxiété. Les enfants ne sont pas armés face à des applications conçues par des ingénieurs pour capter leur attention. On interdit bien l'alcool aux mineurs ; il faut une règle claire, posée par la société et pas seulement par les familles.",
      "<strong>Joséphine</strong>",
      "J'ai seize ans et je trouve qu'on diabolise beaucoup le téléphone. C'est grâce à lui que je garde le contact avec mes amis qui ont déménagé, et j'apprends plein de choses sur Internet. Le problème, ce n'est pas l'objet, c'est qu'on ne nous apprend jamais à bien l'utiliser. Plutôt qu'interdire, il faudrait éduquer."),
    cau: null },
};
DE3.CE3.cau = (() => { const x = ai(DE3.CE3.ten); return [
  x("Une loi est nécessaire pour protéger les enfants.", "Karim", "Karim : « il faut une règle claire, posée par la société ».", 2),
  x("Une décision collective entre familles est plus efficace.", "Élise", "Élise : « on s'est mis d'accord pour retarder l'achat ensemble ».", 1.5),
  x("Il faut apprendre aux jeunes à se servir du téléphone.", "Joséphine", "Joséphine : « Plutôt qu'interdire, il faudrait éduquer ».", 1),
  x("Les applications sont pensées pour retenir l'attention.", "Karim", "Karim : « conçues… pour capter leur attention ».", 1.5),
  x("Le téléphone permet de garder des liens.", "Joséphine", "Joséphine : « je garde le contact avec mes amis ».", 0.5),
  x("Une interdiction légale ne pourrait pas être respectée.", "Élise", "Élise : « Impossible à appliquer ».", 0.5),
]; })();

export const CAC_DE = [
  { ...DE1, peId: "nhapmur616ox001", poId: "nhapmur616oz002", chiVip: false },
  { ...DE2, peId: "nhapmv3lbczp017", poId: "nhapmv3lbczp018", chiVip: true },
  { ...DE3, peId: "lo18mv42hjcq04w", poId: "lo18mv42hjcr04y", chiVip: true },
];
