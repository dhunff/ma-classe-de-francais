/* Lô 15 (11/10): đề DELF B2 NHÁP · Đề 2, theo khuôn ba đề mẫu « tout public »
 * chủ dự án gửi (TP46, TP43, TP56):
 *
 *   CO 30'  : bài 1 ~5 phút, NGHE HAI LẦN (1' đọc câu hỏi, 3' nghỉ, 5' hoàn thành), 12 câu
 *             bài 2 ~2 phút, NGHE MỘT LẦN (1' đọc câu hỏi, 3' trả lời), 7 câu
 *   CE 60'  : bài 1 văn bản thông tin (13 điểm ở đề thật), 10 câu
 *             bài 2 văn bản nghị luận (12 điểm), 9 câu
 *   PE 60'  : lấy lập trường có lập luận, có tài liệu dẫn nhập, 250 mots minimum
 *   PO 20'  : trình bày + bảo vệ quan điểm từ một tài liệu ngắn (30' chuẩn bị), không chấm
 *
 * Câu hỏi mở của đề giấy (« Citez deux… ») đổi thành QCM ba phương án vì ứng
 * dụng chấm tự động; câu Vrai/Faux giữ nguyên dạng « cochez + recopiez la
 * phrase » (ô justification). Bài đọc do FRACILE viết theo phong cách báo chí
 * Pháp, KHÔNG chép báo thật và không ghi tên báo thật làm nguồn.
 *
 * Chạy: TTS_ADMIN_TOKEN=… FFMPEG=…/ffmpeg.exe node scripts/nhap/lo15_de_b2_2.mjs <uuid_gv> > lo15.sql */
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

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261011;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
/* Vrai/Faux kiểu DELF: chọn + chép câu chứng minh. answer 0 = Vrai, 1 = Faux. */
const vf = (prompt, dung, justification) => ({ id: id("q"), type: "vf", prompt: `${prompt} Cochez la bonne réponse et recopiez la phrase ou la partie du texte qui justifie votre réponse.`, answer: dung ? 0 : 1, justification });

const RADIO = "Parle en français de France, comme un journaliste de radio publique, débit naturel et posé.";
const KHACH = "Parle en français de France, comme un chercheur interviewé à la radio, débit naturel, ton réfléchi.";
const KHACH2 = "Parle en français de France, comme une élue locale interviewée, débit naturel, ton convaincu.";
const TIN = "Parle en français de France, comme une présentatrice de journal radio, débit rapide et clair.";
const GIAM_KHAO = "Parle en français de France, ton neutre et posé, comme les consignes d'un examen officiel.";
const d = (giong, cach, chu) => ({ giong, cach, chu });

/* ───────────── CO · EXERCICE 1 (deux écoutes) ───────────── */
const CO1 = { ten: "b2-de2-co1", so: "un", hai: true,
  tieuDe: "Écoute B2 · Đề 2 · Exercice 1 : les tiers-lieux à la campagne",
  gioiThieu: "Vous allez entendre une émission de radio consacrée aux tiers-lieux en milieu rural.",
  doan: [
    d("sage", RADIO, "Bonjour et bienvenue dans « Territoires », l'émission qui s'intéresse à la vie loin des grandes villes. Depuis quelques années, on voit fleurir dans les villages des lieux d'un genre nouveau : on y travaille, on y répare son vélo, on y boit un café, on y suit un atelier d'informatique. On les appelle des tiers-lieux. Ils seraient aujourd'hui plus de trois mille cinq cents en France, dont près de la moitié hors des grandes agglomérations. Pour en parler, nous recevons Marc Lefèvre, sociologue à l'université de Tours, qui vient de publier une enquête sur le sujet. Marc Lefèvre, bonjour. D'abord, qu'est-ce qu'un tiers-lieu, exactement ?"),
    d("echo", KHACH, "Bonjour. L'expression vient d'un sociologue américain, Ray Oldenburg, qui parlait dans les années quatre-vingt de ces endroits qui ne sont ni la maison, le premier lieu, ni le travail, le deuxième lieu. Le café, le salon de coiffure, la place du marché. En France, le mot a pris un sens un peu différent. Un tiers-lieu, c'est un espace partagé, souvent géré par une association, où l'on mélange les usages : un espace de travail pour des indépendants, un atelier de fabrication, parfois une épicerie ou une cantine. Ce qui compte, ce n'est pas tant ce qu'on y fait, c'est le fait qu'on y fait les choses ensemble."),
    d("sage", RADIO, "Pourquoi ce succès à la campagne, précisément ?"),
    d("echo", KHACH, "Il y a deux raisons principales. La première, c'est la disparition des services. Dans beaucoup de communes, la poste a fermé, le dernier café aussi, et les habitants n'avaient plus de lieu pour se croiser. Le tiers-lieu vient combler ce vide. La seconde raison, c'est l'arrivée de nouveaux habitants après la crise sanitaire. Des cadres, des graphistes, des consultants ont quitté les métropoles pour s'installer dans des villages. Ils peuvent travailler à distance, mais ils ne veulent pas rester seuls dans leur cuisine toute la journée. Ils cherchent une connexion internet fiable et, surtout, des collègues."),
    d("sage", RADIO, "Justement, ne risque-t-on pas de créer des lieux réservés à ces nouveaux arrivants, plutôt aisés ?"),
    d("echo", KHACH, "C'est la grande question, et c'est d'ailleurs le point le plus intéressant de notre enquête. Dans les lieux que nous avons étudiés, environ un tiers seulement réussit vraiment à mélanger les publics. Ce sont ceux qui ont été construits avec les habitants dès le départ, et pas imposés de l'extérieur. Quand un tiers-lieu propose uniquement des bureaux à louer, il attire les télétravailleurs et personne d'autre. Quand il propose aussi un atelier de réparation, une aide pour les démarches administratives en ligne, ou simplement un repas partagé le vendredi soir, les agriculteurs, les retraités, les jeunes du village viennent aussi. Le mélange ne se décrète pas, il se construit."),
    d("sage", RADIO, "Et sur le plan économique, ces lieux sont-ils viables ?"),
    d("echo", KHACH, "C'est leur point faible. Très peu d'entre eux s'autofinancent. La location des bureaux ne rapporte pas grand-chose à la campagne, les tarifs doivent rester bas. La plupart dépendent de subventions publiques, de l'État ou des régions. L'État a lancé en deux mille dix-neuf un programme de soutien qui a financé plusieurs centaines de lieux pendant trois ans. Le problème, c'est que ce soutien est limité dans le temps. Nous avons observé que les lieux qui ferment le font souvent au moment où l'aide s'arrête, et parfois avec beaucoup d'amertume chez les bénévoles qui s'y étaient investis."),
    d("sage", RADIO, "Que faudrait-il faire, selon vous ?"),
    d("echo", KHACH, "Je crois qu'il faut arrêter de considérer les tiers-lieux comme des start-up qui devraient devenir rentables en trois ans. Ce sont des services d'intérêt général, au même titre qu'une bibliothèque ou une salle des fêtes. Personne ne demande à une bibliothèque municipale d'être rentable. Il faudrait donc un financement stable, modeste mais durable, en contrepartie de missions précises : accompagner les personnes éloignées du numérique, accueillir des formations, faire vivre le lien social. Et il faut aussi former les animateurs, car c'est un vrai métier, qui demande des compétences de médiation."),
    d("sage", RADIO, "Marc Lefèvre, merci. Son enquête, « Les nouveaux cafés du village », est parue aux Presses universitaires de Tours."),
  ],
  cau: [
    qcm("Cette émission a pour thème principal…", "le développement d'espaces partagés dans les villages", ["la disparition des cafés dans les campagnes françaises", "les difficultés du télétravail après la crise sanitaire"], "L'animateur présente « des lieux d'un genre nouveau » dans les villages : les tiers-lieux."),
    qcm("Selon l'animateur, les tiers-lieux en France…", "sont nombreux, et près de la moitié se trouvent hors des grandes villes", ["sont surtout installés dans les grandes métropoles", "sont encore très rares en milieu rural"], "« plus de trois mille cinq cents en France, dont près de la moitié hors des grandes agglomérations »."),
    qcm("Pour Ray Oldenburg, le « troisième lieu » est un endroit…", "distinct à la fois du domicile et du lieu de travail", ["où l'on travaille à distance avec d'autres personnes", "géré par une association de quartier"], "« ni la maison, le premier lieu, ni le travail, le deuxième lieu »."),
    qcm("D'après Marc Lefèvre, ce qui définit avant tout un tiers-lieu en France, c'est…", "le fait de faire les choses ensemble", ["la présence d'un espace de travail", "la vente de produits locaux"], "« Ce qui compte, ce n'est pas tant ce qu'on y fait, c'est le fait qu'on y fait les choses ensemble »."),
    qcm("Quelle est l'une des raisons du succès des tiers-lieux à la campagne ?", "la fermeture des services et des lieux de rencontre", ["la baisse du prix des bureaux en ville", "une loi obligeant les communes à en ouvrir"], "« la disparition des services… la poste a fermé, le dernier café aussi »."),
    qcm("Les nouveaux habitants venus des villes recherchent surtout…", "une bonne connexion et la présence de collègues", ["un logement moins cher", "des formations professionnelles"], "« Ils cherchent une connexion internet fiable et, surtout, des collègues »."),
    qcm("Selon l'enquête, quelle proportion des lieux étudiés réussit à mélanger les publics ?", "environ un tiers", ["environ la moitié", "presque tous"], "« environ un tiers seulement réussit vraiment à mélanger les publics »."),
    qcm("Les tiers-lieux qui attirent des publics variés sont ceux qui…", "ont été conçus avec les habitants dès le départ", ["louent leurs bureaux le moins cher possible", "sont dirigés par des professionnels de la ville"], "« ceux qui ont été construits avec les habitants dès le départ, et pas imposés de l'extérieur »."),
    qcm("Que signifie la phrase « Le mélange ne se décrète pas, il se construit » ?", "La mixité des publics demande un travail progressif et ne peut pas être imposée.", ["La mixité dépend d'abord d'une décision de la mairie.", "Il faut construire de nouveaux bâtiments pour accueillir tout le monde."], "Le sociologue oppose une décision venue d'en haut à un travail mené avec les habitants."),
    qcm("Sur le plan économique, la plupart des tiers-lieux…", "dépendent de subventions publiques", ["sont rentables grâce à la location de bureaux", "sont financés par des entreprises privées"], "« Très peu d'entre eux s'autofinancent… La plupart dépendent de subventions publiques »."),
    qcm("Selon Marc Lefèvre, quand de nombreux tiers-lieux ferment-ils ?", "au moment où l'aide publique s'arrête", ["après le départ des télétravailleurs", "pendant les premiers mois d'activité"], "« les lieux qui ferment le font souvent au moment où l'aide s'arrête »."),
    qcm("Pourquoi Marc Lefèvre compare-t-il les tiers-lieux à une bibliothèque ?", "pour montrer qu'ils rendent un service public et n'ont pas à être rentables", ["pour proposer qu'ils remplacent les bibliothèques municipales", "pour regretter que les habitants lisent de moins en moins"], "« Ce sont des services d'intérêt général… Personne ne demande à une bibliothèque municipale d'être rentable »."),
  ] };

/* ───────────── CO · EXERCICE 2 (une seule écoute) ───────────── */
const CO2 = { ten: "b2-de2-co2", so: "deux", hai: false,
  tieuDe: "Écoute B2 · Đề 2 · Exercice 2 : le bonus réparation",
  gioiThieu: "Vous allez entendre un court reportage diffusé dans un journal radio.",
  doan: [
    d("shimmer", TIN, "Réparer plutôt que jeter : c'est l'objectif du bonus réparation, en place depuis fin deux mille vingt-deux. Le principe est simple. Quand vous faites réparer un appareil chez un réparateur labellisé, une partie du prix est directement déduite de votre facture : par exemple vingt-cinq euros pour un lave-linge, quinze euros pour un grille-pain. Pas de dossier à remplir, la réduction s'applique immédiatement en caisse."),
    d("onyx", KHACH2, "Au début, honnêtement, presque personne ne le connaissait. Dans notre ville, nous avons organisé des après-midi d'information sur le marché, avec les réparateurs du quartier. Les gens découvraient qu'on pouvait encore réparer leur aspirateur pour moins cher qu'un neuf."),
    d("shimmer", TIN, "Le dispositif a pourtant démarré lentement : moins de la moitié des sommes prévues ont été utilisées la première année. Le gouvernement a donc doublé le montant du bonus pour une trentaine d'appareils et allongé la liste des produits concernés, qui inclut désormais les vêtements et les chaussures. Reste un obstacle de taille : le manque de réparateurs. Dans certains départements ruraux, il faut faire plus de cinquante kilomètres pour en trouver un. Les chambres de métiers lancent cette année une campagne pour attirer des jeunes vers ces métiers de la réparation."),
  ],
  cau: [
    qcm("Le bonus réparation a pour objectif…", "d'encourager les consommateurs à faire réparer leurs objets", ["de rembourser l'achat d'appareils neufs", "de former les consommateurs à réparer eux-mêmes"], "« Réparer plutôt que jeter : c'est l'objectif du bonus réparation »."),
    qcm("Comment le consommateur bénéficie-t-il du bonus ?", "La réduction est déduite directement de la facture.", ["Il doit envoyer un dossier pour être remboursé.", "Il reçoit un bon d'achat valable dans un magasin."], "« une partie du prix est directement déduite de votre facture… Pas de dossier à remplir »."),
    qcm("Pour faire connaître le dispositif, l'élue interrogée…", "a organisé des après-midi d'information avec des réparateurs", ["a fait distribuer des prospectus dans les boîtes aux lettres", "a ouvert un atelier de réparation à la mairie"], "« nous avons organisé des après-midi d'information sur le marché, avec les réparateurs du quartier »."),
    qcm("La première année, le dispositif…", "a été peu utilisé", ["a coûté plus cher que prévu", "a connu un grand succès"], "« moins de la moitié des sommes prévues ont été utilisées la première année »."),
    qcm("Quelle mesure le gouvernement a-t-il prise ensuite ?", "Il a doublé le bonus pour certains appareils.", ["Il a supprimé le bonus pour les petits appareils.", "Il a réservé le bonus aux appareils électroniques."], "« Le gouvernement a donc doublé le montant du bonus pour une trentaine d'appareils »."),
    qcm("Le bonus concerne désormais aussi…", "les vêtements et les chaussures", ["les voitures et les vélos", "les meubles et la décoration"], "« la liste des produits concernés, qui inclut désormais les vêtements et les chaussures »."),
    qcm("Quel obstacle le reportage mentionne-t-il ?", "Il manque des réparateurs, surtout dans les zones rurales.", ["Les réparations restent plus chères que les produits neufs.", "Les pièces détachées sont introuvables."], "« Reste un obstacle de taille : le manque de réparateurs »."),
  ] };

/* ───────────── CE · EXERCICE 1 (texte informatif) ───────────── */
const CE1 = { tieuDe: "Lecture B2 · Đề 2 · Exercice 1 : le sommeil des adolescents",
  consigne: "<p><strong>Comprendre un texte informatif.</strong> Lisez le document puis répondez aux questions.</p>",
  readingText: "<p><strong>Adolescents : le sommeil, grand oublié de la santé</strong></p><p>Ils se couchent tard, se lèvent tôt et rattrapent le week-end. Selon une enquête nationale menée auprès de huit mille collégiens et lycéens, un adolescent français dort en moyenne sept heures par nuit en semaine, alors que les médecins en recommandent entre huit et dix. Près d'un lycéen sur trois serait même en situation de dette de sommeil chronique, c'est-à-dire qu'il dort moins de six heures plusieurs nuits par semaine.</p><p>Les écrans sont souvent désignés comme les premiers responsables. L'enquête confirme que neuf adolescents sur dix gardent leur téléphone dans leur chambre la nuit, et que plus de la moitié le consultent après l'extinction des lumières. « La lumière bleue retarde la production de mélatonine, l'hormone qui prépare au sommeil, explique Claire Morel, neurologue spécialiste du sommeil. Mais c'est surtout le contenu qui pose problème : une conversation, une vidéo, une notification maintiennent le cerveau en éveil. »</p><p>Les écrans ne sont pourtant pas les seuls en cause. À l'adolescence, l'horloge biologique se décale naturellement : le besoin de dormir arrive plus tard le soir, vers vingt-trois heures, voire minuit. « Demander à un adolescent de s'endormir à vingt-deux heures, c'est un peu comme demander à un adulte de se coucher à vingt heures », résume la spécialiste. Or les cours commencent souvent à huit heures, et parfois dès sept heures trente avec le temps de transport. Le réveil sonne donc au milieu de la nuit biologique.</p><p>Les conséquences sont bien documentées : baisse de l'attention et de la mémoire, irritabilité, risque accru d'accidents de deux-roues, mais aussi prise de poids, car le manque de sommeil dérègle l'appétit. Plusieurs études associent également la privation de sommeil à des symptômes anxieux et dépressifs.</p><p>Face à ce constat, certains pays ont choisi d'agir sur les horaires. En Californie, une loi impose depuis 2022 que les lycées ne commencent pas avant huit heures trente. Les premiers bilans font état d'un gain de sommeil de près d'une demi-heure par nuit et d'une baisse des retards et des absences. En France, quelques établissements expérimentent un début des cours à neuf heures le lundi, mais la mesure reste rare, car elle bouscule l'organisation des transports scolaires et l'emploi du temps des enseignants.</p><p>Pour Claire Morel, les familles ont aussi un rôle à jouer, sans tomber dans l'interdiction pure et simple. « Confisquer le téléphone provoque des conflits et ne règle rien si l'adolescent ne comprend pas pourquoi. Il vaut mieux fixer ensemble une heure de déconnexion et laisser l'appareil se recharger hors de la chambre. » Elle plaide surtout pour une véritable éducation au sommeil à l'école, au même titre que l'éducation à l'alimentation : « On apprend aux enfants à bien manger. Personne ne leur apprend à bien dormir. »</p><p><em>Document rédigé pour FRACILE, dans le style d'un article de presse.</em></p>",
  cau: [
    qcm("Ce texte a pour thème…", "le manque de sommeil chez les adolescents et ses causes", ["l'interdiction des téléphones dans les lycées", "les nouvelles méthodes pour mieux apprendre"], "Tout l'article traite du manque de sommeil des adolescents, de ses causes et de ses conséquences."),
    vf("Les adolescents français dorment autant que le recommandent les médecins.", false, "« un adolescent français dort en moyenne sept heures par nuit en semaine, alors que les médecins en recommandent entre huit et dix »"),
    qcm("D'après l'enquête, une « dette de sommeil chronique » signifie…", "dormir moins de six heures plusieurs nuits par semaine", ["se réveiller plusieurs fois par nuit", "dormir beaucoup trop le week-end"], "« c'est-à-dire qu'il dort moins de six heures plusieurs nuits par semaine »."),
    qcm("Selon Claire Morel, ce qui pose surtout problème avec les écrans, c'est…", "le contenu, qui maintient le cerveau éveillé", ["la lumière bleue, qui abîme les yeux", "le bruit des notifications pendant la nuit"], "« Mais c'est surtout le contenu qui pose problème »."),
    vf("Le décalage du sommeil à l'adolescence s'explique uniquement par l'usage des écrans.", false, "« Les écrans ne sont pourtant pas les seuls en cause. À l'adolescence, l'horloge biologique se décale naturellement »"),
    qcm("Avec la comparaison entre l'adolescent et l'adulte, la spécialiste veut montrer que…", "s'endormir tôt est biologiquement difficile pour un adolescent", ["les adultes dorment moins bien que les adolescents", "les adolescents devraient se coucher à vingt heures"], "« Demander à un adolescent de s'endormir à vingt-deux heures, c'est un peu comme demander à un adulte de se coucher à vingt heures »."),
    qcm("Parmi les conséquences du manque de sommeil, le texte cite…", "un risque plus élevé d'accidents de deux-roues", ["une meilleure résistance au stress", "une perte d'appétit durable"], "« risque accru d'accidents de deux-roues »."),
    vf("En Californie, le changement d'horaires a permis aux lycéens de dormir davantage.", true, "« Les premiers bilans font état d'un gain de sommeil de près d'une demi-heure par nuit »"),
    qcm("En France, commencer les cours plus tard reste rare parce que…", "cela complique les transports scolaires et l'emploi du temps des enseignants", ["les parents s'y opposent majoritairement", "la loi l'interdit dans les lycées publics"], "« elle bouscule l'organisation des transports scolaires et l'emploi du temps des enseignants »."),
    qcm("Que conseille Claire Morel aux familles ?", "fixer ensemble une heure de déconnexion", ["confisquer le téléphone chaque soir", "interdire les écrans pendant la semaine"], "« Il vaut mieux fixer ensemble une heure de déconnexion et laisser l'appareil se recharger hors de la chambre »."),
  ] };

/* ───────────── CE · EXERCICE 2 (texte argumentatif) ───────────── */
const CE2 = { tieuDe: "Lecture B2 · Đề 2 · Exercice 2 : faut-il en finir avec les devoirs à la maison ?",
  consigne: "<p><strong>Comprendre un texte argumentatif.</strong> Lisez le document puis répondez aux questions.</p>",
  readingText: "<p><strong>Devoirs à la maison : cessons de faire semblant</strong></p><p>Depuis 1956, une circulaire interdit officiellement les devoirs écrits à l'école élémentaire. Soixante-dix ans plus tard, chaque soir, des millions d'enfants sortent pourtant leur cahier sur la table de la cuisine. Tout le monde le sait, personne ne s'en offusque, et le rituel se poursuit au collège et au lycée avec une intensité croissante. Il est temps de poser une question simple : à qui profitent réellement les devoirs ?</p><p>Aux élèves, répondent leurs défenseurs. Les devoirs permettraient de consolider ce qui a été vu en classe et de développer l'autonomie. L'argument serait recevable si tous les enfants rentraient dans les mêmes conditions. Or ce n'est pas le cas. L'un retrouve une chambre calme, des parents disponibles qui ont eux-mêmes fait des études, parfois un professeur particulier. L'autre partage une pièce avec ses frères et sœurs, et ses parents, qui rentrent tard, ne maîtrisent pas toujours le français ou les mathématiques du programme. Le travail à la maison ne mesure donc pas ce que l'élève a compris : il mesure ce que sa famille peut lui offrir.</p><p>On objectera que le travail personnel est indispensable pour apprendre. C'est vrai, et c'est précisément pour cela qu'il doit se faire à l'école, encadré par des professionnels. Plusieurs collèges ont mis en place des heures d'étude accompagnée en fin de journée : les élèves y travaillent avec un enseignant ou un assistant d'éducation, et repartent le cartable léger. Les résultats sont encourageants, en particulier pour les élèves les plus fragiles. Mais ces dispositifs restent facultatifs, et ce sont souvent ceux qui en auraient le plus besoin qui ne s'y inscrivent pas.</p><p>Il ne s'agit pas pour autant de diaboliser toute activité à la maison. Lire un roman, regarder un documentaire, apprendre une poésie, discuter en famille d'un sujet vu en classe : voilà des prolongements qui ont du sens et qui ne transforment pas la soirée en épreuve. Ce qui doit disparaître, c'est l'exercice écrit noté, celui qui pénalise l'enfant pour une aide qu'il n'a pas reçue.</p><p>Les devoirs sont devenus une habitude que plus personne n'interroge, une sorte de vitrine du sérieux de l'école. Les parents s'y raccrochent pour suivre la scolarité de leurs enfants, les enseignants pour terminer un programme trop chargé. Mais une habitude n'est pas une méthode. Si l'école veut vraiment réduire les inégalités, elle doit commencer par reprendre ce qu'elle a laissé, depuis trop longtemps, sur la table de la cuisine.</p><p><em>Tribune rédigée pour FRACILE, dans le style d'une page « Débats » de la presse.</em></p>",
  cau: [
    qcm("Quelle est l'idée principale de ce texte ?", "Les devoirs écrits à la maison renforcent les inégalités et devraient se faire à l'école.", ["Les devoirs sont indispensables pour développer l'autonomie des élèves.", "Les parents ne s'intéressent plus à la scolarité de leurs enfants."], "L'auteur conclut que l'école « doit commencer par reprendre ce qu'elle a laissé… sur la table de la cuisine »."),
    vf("Les devoirs écrits sont autorisés à l'école élémentaire depuis 1956.", false, "« Depuis 1956, une circulaire interdit officiellement les devoirs écrits à l'école élémentaire »"),
    qcm("En évoquant la « table de la cuisine », l'auteur souligne que…", "les devoirs continuent malgré l'interdiction, dans la vie quotidienne des familles", ["les familles manquent de place pour travailler", "les enfants préfèrent travailler en mangeant"], "« chaque soir, des millions d'enfants sortent pourtant leur cahier sur la table de la cuisine »."),
    qcm("Selon l'auteur, le travail à la maison mesure surtout…", "les ressources dont dispose la famille", ["le niveau réel de compréhension de l'élève", "la qualité de l'enseignement reçu en classe"], "« il mesure ce que sa famille peut lui offrir »."),
    vf("L'auteur pense que le travail personnel est inutile pour apprendre.", false, "« C'est vrai, et c'est précisément pour cela qu'il doit se faire à l'école »"),
    qcm("Quelle limite l'auteur voit-il aux heures d'étude accompagnée ?", "Elles sont facultatives, et les élèves qui en ont le plus besoin n'y vont pas toujours.", ["Elles coûtent trop cher aux familles.", "Elles ne donnent aucun résultat pour les élèves fragiles."], "« ces dispositifs restent facultatifs, et ce sont souvent ceux qui en auraient le plus besoin qui ne s'y inscrivent pas »."),
    qcm("D'après l'auteur, quelles activités à la maison restent souhaitables ?", "lire, regarder un documentaire ou discuter en famille", ["des exercices écrits courts et notés", "des révisions avec un professeur particulier"], "« Lire un roman, regarder un documentaire, apprendre une poésie, discuter en famille »."),
    qcm("Que veut dire l'auteur par « une habitude n'est pas une méthode » ?", "Les devoirs existent par tradition, sans preuve de leur efficacité.", ["Il faut changer de méthode chaque année.", "Les élèves doivent prendre de bonnes habitudes de travail."], "L'auteur présente les devoirs comme « une habitude que plus personne n'interroge »."),
    qcm("Le ton de ce texte est…", "engagé", ["neutre", "humoristique"], "L'auteur prend clairement position (« cessons de faire semblant », « Il est temps de poser une question »)."),
  ] };

/* ───────────── PE / PO ───────────── */
const PE = { title: "[NHÁP] Production écrite B2 · Đề 2 : la vidéosurveillance dans votre ville", level: "B2", skills: ["Production écrite"], timeLimit: 60,
  consigne: "<p><strong>Production écrite : 60 minutes, 250 mots minimum.</strong></p><blockquote><p><strong>Sécurité : 40 nouvelles caméras dans le centre-ville</strong><br>Le conseil municipal a voté l'installation de quarante caméras de vidéosurveillance dans les rues commerçantes et autour des écoles. Coût du projet : 600 000 euros. « Les habitants nous le demandent », affirme le maire.</p></blockquote><p>Vous habitez dans cette ville. Vous écrivez une <strong>lettre au maire</strong> pour lui faire part de votre position sur ce projet. Vous présentez des arguments précis, illustrés d'exemples, et vous proposez d'autres façons d'utiliser ce budget pour améliorer la sécurité et la qualité de vie des habitants.</p>",
  questions: [{ id: id("q"), type: "open", prompt: "Rédigez votre lettre au maire (250 mots minimum)." }] };

const PO = { title: "[NHÁP] Production orale B2 · Đề 2 : faut-il interdire les voitures devant les écoles ?", level: "B2", skills: ["Production orale"],
  consigne: "<p><strong>Production orale : 20 minutes environ, 30 minutes de préparation.</strong></p><p>Vous tirez au sort un document. Vous dégagez le problème soulevé par ce document, puis vous présentez votre opinion sous la forme d'un exposé argumenté de 5 à 7 minutes. Ensuite, vous défendez votre point de vue au cours d'un débat avec l'examinateur.</p><blockquote><p><strong>Des « rues aux écoles » sans voitures</strong><br>Plusieurs villes ferment désormais à la circulation les rues situées devant les écoles, au moment de l'entrée et de la sortie des classes. Objectif : réduire la pollution respirée par les enfants et sécuriser leurs trajets. Mais certains parents, qui déposent leurs enfants en voiture avant d'aller travailler, dénoncent une mesure qui complique leur quotidien.</p></blockquote>",
  questions: [] };

/* ───────────── FILE NGHE KIỂU THI ─────────────
 * Bài 1 (deux écoutes) : giới thiệu → 60" đọc câu hỏi → lượt 1 → 180" → lượt 2 → 300" → hết.
 * Bài 2 (une écoute)   : giới thiệu → 60" đọc câu hỏi → nghe → 180" → hết. */
const goi = (than) => fetch(URL_FN, { method: "POST",
  headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify(than) }).then((r) => r.json());
const taiVe = async (url, tep) => writeFileSync(tep, Buffer.from(await (await fetch(url)).arrayBuffer()));
const DIR = mkdtempSync(join(tmpdir(), "nghe-b2-"));
const LOI = {
  e1: "Première écoute.",
  nghi: "Fin de la première écoute. Vous avez trois minutes pour commencer à répondre aux questions.",
  e2: "Deuxième écoute.",
  het2: "Fin de la deuxième écoute. Vous avez cinq minutes pour compléter vos réponses.",
  het1: "Fin de l'enregistrement. Vous avez trois minutes pour répondre aux questions.",
  xong: "Fin de l'exercice.",
};
const tep = {};
for (const [k, chu] of Object.entries(LOI)) {
  const r = await goi({ ten: `b2-de2-loi-${k}`, doan: [d("sage", GIAM_KHAO, chu)] });
  if (!r.ok) { console.error(k, r); process.exit(1); }
  tep[k] = join(DIR, `${k}.mp3`); await taiVe(r.url, tep[k]);
}
const URL_THI = {}, URL_LUYEN = {};
for (const b of [CO1, CO2]) {
  const gt = await goi({ ten: `${b.ten}-gioi-thieu`, doan: [d("sage", GIAM_KHAO,
    `Exercice ${b.so}. ${b.gioiThieu} ${b.hai ? "Vous allez entendre deux fois l'enregistrement." : "Vous allez entendre une seule fois l'enregistrement."} Vous avez une minute pour lire les questions.`)] });
  const tl = await goi({ ten: `${b.ten}-tai-lieu`, doan: b.doan });
  if (!gt.ok || !tl.ok) { console.error(b.ten, gt, tl); process.exit(1); }
  const fGt = join(DIR, `${b.ten}-gt.mp3`), fTl = join(DIR, `${b.ten}-tl.mp3`);
  await taiVe(gt.url, fGt); await taiVe(tl.url, fTl);
  URL_LUYEN[b.ten] = tl.url;
  const seq = b.hai
    ? [fGt, 60, tep.e1, fTl, tep.nghi, 180, tep.e2, fTl, tep.het2, 300, tep.xong]
    : [fGt, 60, fTl, tep.het1, 180, tep.xong];
  const args = ["-y", "-hide_banner", "-loglevel", "error"];
  const nhan = [];
  seq.forEach((x, i) => {
    if (typeof x === "number") args.push("-f", "lavfi", "-t", String(x), "-i", "anullsrc=r=24000:cl=mono");
    else args.push("-i", x);
    nhan.push(`[${i}:a]aresample=24000,aformat=channel_layouts=mono[a${i}]`);
  });
  const out = join(DIR, `${b.ten}.mp3`);
  args.push("-filter_complex", `${nhan.join(";")};${seq.map((_, i) => `[a${i}]`).join("")}concat=n=${seq.length}:v=0:a=1[o]`, "-map", "[o]", "-b:a", "48k", out);
  execFileSync(FFMPEG, args);
  const bin = readFileSync(out);
  const up = await goi({ taiLen: true, ten: `${b.ten}-thi`, base64: bin.toString("base64") });
  if (!up.ok) { console.error(b.ten, up); process.exit(1); }
  console.error(`✔ ${b.ten}-thi: ${Math.round(bin.length / 1024)} KB`);
  URL_THI[b.ten] = up.url;
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
const TU = JSON.parse(readFileSync(new URL("./lo15_tu_vung.json", import.meta.url), "utf8"));
const PHAN = [];
for (const [k, b] of [CO1, CO2].entries()) {
  const ex = { ...chung, ...TU[b.ten], id: id("nhap"), title: "[NHÁP] " + b.tieuDe, level: "B2", skills: ["Écoute"], ngheKieuThi: true, audioLuyen: URL_LUYEN[b.ten],
    consigne: b.hai
      ? `<p>${b.gioiThieu}</p><p>Comme à l'examen, l'enregistrement contient tout le déroulement : 1 minute pour lire les questions, première écoute, 3 minutes pour commencer à répondre, deuxième écoute, puis 5 minutes pour compléter vos réponses.</p>`
      : `<p>${b.gioiThieu}</p><p>Comme à l'examen, vous n'entendrez le document <strong>qu'une seule fois</strong> : 1 minute pour lire les questions, l'écoute, puis 3 minutes pour répondre.</p>`,
    audioUrl: URL_THI[b.ten], questions: b.cau, createdAt: Date.now() };
  ghi(ex); PHAN.push(["CO", ex.id, k ? 0 : 30, k ? 0 : 25]);
}
for (const [k, b] of [["b2-de2-ce1", CE1], ["b2-de2-ce2", CE2]].entries()) {
  const ex = { ...chung, ...TU[b[0]], id: id("nhap"), title: "[NHÁP] " + b[1].tieuDe, level: "B2", skills: ["Lecture"],
    consigne: b[1].consigne, readingText: b[1].readingText, questions: b[1].cau, createdAt: Date.now() };
  ghi(ex); PHAN.push(["CE", ex.id, k ? 0 : 60, k ? 0 : 25]);
}
for (const [code, b, m, p, k] of [["PE", PE, 60, 25, "b2-de2-pe"], ["PO", PO, 20, 0, "b2-de2-po"]]) {
  const ex = { ...chung, ...TU[k], ...b, id: id("nhap"), createdAt: Date.now() };
  ghi(ex); PHAN.push([code, ex.id, m, p]);
}
ra.push(`with e as (insert into public.exams (title, level, duration_min, is_published, created_by) values ('[NHÁP] DELF B2 · Đề 2', 'B2', 170, false, ${q(GV)}) returning id) insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord) select (select id from e), v.code, v.ex, v.m, v.p, v.o from (values ${PHAN.map(([c, e, m, p], i) => `(${q(c)}, ${q(e)}, ${m}, ${p}, ${i})`).join(", ")}) as v(code, ex, m, p, o);`);
console.log(ra.join("\n"));
