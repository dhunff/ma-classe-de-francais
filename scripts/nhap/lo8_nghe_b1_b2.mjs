/* Lô 8 (02/10) — 6 bài nghe DÀI cho B1 và B2, giọng tổng hợp, 12–14 câu/bài.
 *
 * Phản hồi chủ dự án: « phần nghe phải có nhiều câu hỏi hơn, đặc biệt B1–B2 ».
 * Bài cũ dài 40–65 giây, không đủ chất liệu cho hơn 5 câu; bài mới 2–3 phút
 * theo đúng dạng đề DELF (phỏng vấn radio, tranh luận, chuyên mục, phóng sự),
 * mỗi câu hỏi có câu trích làm bằng chứng.
 *
 * Kịch bản do FRACILE viết; đề bài ghi rõ « voix de synthèse ».
 * Chạy: TTS_ADMIN_TOKEN=… node scripts/nhap/lo8_nghe_b1_b2.mjs > lo8.sql */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const TOKEN = process.env.TTS_ADMIN_TOKEN;
if (!TOKEN) { console.error("Thiếu TTS_ADMIN_TOKEN"); process.exit(1); }

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261006;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  if (o.length > 2) for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const vf = (prompt, dung, explanation) => qcm(prompt, dung ? "Vrai" : "Faux", [dung ? "Faux" : "Vrai"], explanation);

const RADIO = "Parle en français de France, comme un animateur de radio, débit naturel.";
const NOI = "Parle en français de France, débit naturel de conversation, ton engagé.";
const d = (giong, chu, cach = NOI) => ({ giong, cach, chu });

const BAI = [
  /* ───── B1 ───── */
  { tep: "b1-semaine-quatre-jours", level: "B1", tieuDe: "Écoute B1 : la semaine de quatre jours",
    doan: [
      d("coral", "Bonjour à tous et bienvenue dans « Vie pro ». Aujourd'hui, nous parlons de la semaine de quatre jours. Avec nous, Nadia Benali, directrice d'une entreprise de quarante salariés à Nantes, qui l'a adoptée il y a un an. Nadia, pourquoi ce choix ?", RADIO),
      d("shimmer", "Bonjour. Au départ, nous avions un vrai problème de recrutement : sur certains postes, nous ne recevions presque aucune candidature. Nous avons cherché un avantage que les grandes entreprises n'offraient pas. La semaine de quatre jours nous a semblé une bonne idée."),
      d("coral", "Concrètement, comment ça fonctionne ? Les salariés travaillent moins ?", RADIO),
      d("shimmer", "Non, et c'est important de le préciser. Ils font toujours trente-cinq heures, mais sur quatre jours au lieu de cinq. Les journées sont donc un peu plus longues, de huit heures trente à dix-sept heures quarante-cinq. Chacun choisit son jour de repos, le lundi ou le vendredi, en accord avec son équipe."),
      d("coral", "Et après un an, quel bilan ?", RADIO),
      d("shimmer", "Plutôt positif. Les arrêts maladie ont baissé d'environ vingt pour cent, et nous avons reçu trois fois plus de candidatures qu'avant. Les salariés disent qu'ils ont plus de temps pour leur famille et pour leurs démarches administratives."),
      d("coral", "Il y a quand même des difficultés ?", RADIO),
      d("shimmer", "Oui, bien sûr. Les journées longues fatiguent certains salariés, surtout ceux qui ont beaucoup de transport. Et pour nos clients, il a fallu s'organiser : le service client reste ouvert cinq jours sur cinq, grâce à un système de roulement. Deux personnes ont d'ailleurs préféré revenir à la semaine de cinq jours, et nous l'avons accepté."),
      d("coral", "Un conseil pour les entreprises qui hésitent ?", RADIO),
      d("shimmer", "Faire un test de six mois, et surtout demander l'avis des salariés avant de commencer. Ce n'est pas une solution magique, mais chez nous, ça a changé l'ambiance."),
    ],
    cau: [
      qcm("Combien de salariés compte l'entreprise de Nadia ?", "40", ["14", "400", "4"], "« une entreprise de quarante salariés »."),
      qcm("Depuis quand l'entreprise applique-t-elle la semaine de quatre jours ?", "depuis un an", ["depuis six mois", "depuis deux ans", "depuis cette semaine"], "« qui l'a adoptée il y a un an »."),
      qcm("Pourquoi l'entreprise a-t-elle fait ce choix ?", "elle avait du mal à recruter", ["pour faire des économies", "à cause d'une loi", "à la demande des clients"], "« nous avions un vrai problème de recrutement »."),
      vf("Les salariés travaillent moins d'heures qu'avant.", false, "« Ils font toujours trente-cinq heures, mais sur quatre jours »."),
      qcm("Les journées de travail vont de…", "8 h 30 à 17 h 45", ["9 h à 17 h", "8 h à 18 h 30", "7 h 30 à 16 h 45"], "« de huit heures trente à dix-sept heures quarante-cinq »."),
      qcm("Qui choisit le jour de repos ?", "chaque salarié, en accord avec son équipe", ["la directrice", "les clients", "c'est toujours le vendredi"], "« Chacun choisit son jour de repos… en accord avec son équipe »."),
      qcm("De combien les arrêts maladie ont-ils baissé ?", "d'environ 20 %", ["de moitié", "d'environ 10 %", "ils n'ont pas changé"], "« ont baissé d'environ vingt pour cent »."),
      qcm("Combien de candidatures l'entreprise reçoit-elle maintenant ?", "trois fois plus qu'avant", ["deux fois plus", "autant qu'avant", "moins qu'avant"], "« trois fois plus de candidatures qu'avant »."),
      qcm("Quelle difficulté est mentionnée pour certains salariés ?", "la fatigue due aux longues journées", ["la baisse de salaire", "le manque de travail", "les conflits entre collègues"], "« Les journées longues fatiguent certains salariés »."),
      qcm("Comment le service client reste-t-il ouvert cinq jours ?", "grâce à un système de roulement", ["grâce à des intérimaires", "il ferme le vendredi", "les clients appellent un robot"], "« grâce à un système de roulement »."),
      vf("Deux salariés sont revenus à la semaine de cinq jours.", true, "« Deux personnes ont d'ailleurs préféré revenir à la semaine de cinq jours »."),
      qcm("Quel conseil donne Nadia ?", "tester six mois et demander l'avis des salariés", ["l'appliquer tout de suite à tout le monde", "attendre une loi", "réduire les salaires"], "« Faire un test de six mois, et surtout demander l'avis des salariés »."),
    ] },
  { tep: "b1-gaspillage-alimentaire", level: "B1", tieuDe: "Écoute B1 : le gaspillage alimentaire",
    doan: [
      d("sage", "Chronique « Consommer mieux ». Saviez-vous qu'en France, chaque habitant jette en moyenne trente kilos de nourriture par an, dont sept kilos de produits encore emballés ? Le gaspillage alimentaire ne se passe pas seulement dans les supermarchés : près de la moitié a lieu à la maison. Alors, comment faire mieux ? Voici cinq conseils simples.", RADIO),
      d("sage", "Premier conseil : faites une liste avant d'aller faire les courses, et regardez d'abord ce qu'il reste dans votre réfrigérateur. C'est la meilleure façon d'éviter d'acheter deux fois la même chose.", RADIO),
      d("sage", "Deuxième conseil : comprenez les dates. La mention « à consommer jusqu'au » concerne les produits frais comme la viande ou le poisson : après cette date, il ne faut plus les manger. En revanche, « à consommer de préférence avant » concerne les pâtes, le riz ou les biscuits : après la date, le produit peut perdre un peu de goût, mais il ne présente pas de danger.", RADIO),
      d("sage", "Troisième conseil : rangez bien votre réfrigérateur. Placez devant les produits qui doivent être mangés en premier. Quatrième conseil : cuisinez les restes. Un reste de légumes devient une soupe, du pain sec devient un pain perdu. Enfin, cinquième conseil : utilisez les applications anti-gaspillage. Elles permettent d'acheter à petit prix, souvent moins de cinq euros, des paniers d'invendus dans les boulangeries et les restaurants du quartier.", RADIO),
      d("sage", "Selon une association de consommateurs, une famille de quatre personnes peut économiser jusqu'à quatre cents euros par an en suivant ces conseils. Bon pour la planète, et bon pour le porte-monnaie !", RADIO),
    ],
    cau: [
      qcm("Combien de kilos de nourriture un Français jette-t-il en moyenne par an ?", "30 kg", ["7 kg", "13 kg", "50 kg"], "« trente kilos de nourriture par an »."),
      qcm("Parmi ces 30 kg, combien sont des produits encore emballés ?", "7 kg", ["3 kg", "15 kg", "30 kg"], "« dont sept kilos de produits encore emballés »."),
      qcm("Où a lieu près de la moitié du gaspillage ?", "à la maison", ["dans les supermarchés", "dans les restaurants", "dans les cantines"], "« près de la moitié a lieu à la maison »."),
      qcm("Avant de faire les courses, il faut…", "faire une liste et regarder le réfrigérateur", ["manger", "comparer les prix sur Internet", "acheter en grande quantité"], "Premier conseil."),
      qcm("La mention « à consommer jusqu'au » concerne surtout…", "les produits frais comme la viande et le poisson", ["les pâtes et le riz", "les biscuits", "les boissons"], "Deuxième conseil."),
      vf("Après la date « à consommer de préférence avant », le riz est dangereux.", false, "« il peut perdre un peu de goût, mais il ne présente pas de danger »."),
      qcm("Dans le réfrigérateur, il faut mettre devant…", "les produits à manger en premier", ["les boissons", "les produits les plus chers", "les légumes"], "Troisième conseil."),
      qcm("Selon la chronique, du pain sec peut devenir…", "un pain perdu", ["une soupe", "un gâteau au chocolat", "une salade"], "« du pain sec devient un pain perdu »."),
      qcm("Les applications anti-gaspillage permettent…", "d'acheter des paniers d'invendus à petit prix", ["de livrer des repas gratuits", "de trouver des recettes", "de donner de la nourriture aux voisins"], "Cinquième conseil."),
      qcm("Combien coûte souvent un panier d'invendus ?", "moins de 5 €", ["environ 10 €", "15 €", "il est gratuit"], "« souvent moins de cinq euros »."),
      qcm("Combien une famille de quatre peut-elle économiser par an ?", "jusqu'à 400 €", ["40 €", "1 000 €", "4 000 €"], "« jusqu'à quatre cents euros par an »."),
      qcm("Quel est le but principal de cette chronique ?", "donner des conseils pratiques", ["critiquer les supermarchés", "présenter une nouvelle loi", "vendre une application"], "« Voici cinq conseils simples »."),
    ] },
  { tep: "b1-vacances-jeunes-voyage", level: "B1", tieuDe: "Écoute B1 : partir en voyage seul à vingt ans",
    doan: [
      d("ash", "Dans « Ils l'ont fait », nous rencontrons aujourd'hui Lucie, vingt et un ans, qui est partie seule pendant trois mois en Amérique du Sud. Lucie, pourquoi ce voyage ?", RADIO),
      d("nova", "Après ma licence de géographie, je ne savais pas quoi faire ensuite. Je voulais prendre du temps pour réfléchir, et aussi améliorer mon espagnol. J'ai travaillé tout l'été dans un camping pour économiser deux mille cinq cents euros."),
      d("ash", "Trois mois avec deux mille cinq cents euros, c'est possible ?", RADIO),
      d("nova", "Oui, si on fait attention. Je dormais dans des auberges de jeunesse ou chez l'habitant, et je prenais le bus, jamais l'avion sur place. Et pendant un mois, j'ai fait du volontariat dans une ferme au Pérou : je travaillais quatre heures par jour, et en échange, j'étais logée et nourrie."),
      d("ash", "Vos parents n'avaient pas peur ?", RADIO),
      d("nova", "Ma mère, si, beaucoup ! Alors on a fixé une règle : je lui envoyais un message tous les soirs. Et je lui partageais ma position. Honnêtement, je me suis toujours sentie en sécurité, sauf une fois, à Lima, quand on m'a volé mon téléphone dans un marché."),
      d("ash", "Qu'est-ce que ce voyage vous a apporté ?", RADIO),
      d("nova", "De la confiance en moi, surtout. Quand on doit tout organiser seule, dans une autre langue, on découvre qu'on est capable de beaucoup de choses. Et j'ai trouvé ma voie : en rentrant, je me suis inscrite en master de tourisme durable."),
      d("ash", "Un conseil pour ceux qui veulent partir ?", RADIO),
      d("nova", "Ne pas tout planifier. Gardez des jours libres : les meilleurs moments, ce sont souvent ceux qu'on n'a pas prévus."),
    ],
    cau: [
      qcm("Combien de temps Lucie a-t-elle voyagé ?", "trois mois", ["trois semaines", "un an", "six mois"], "« pendant trois mois en Amérique du Sud »."),
      qcm("Qu'a-t-elle étudié avant de partir ?", "la géographie", ["l'espagnol", "le tourisme", "l'agriculture"], "« Après ma licence de géographie »."),
      qcm("Comment a-t-elle financé son voyage ?", "en travaillant l'été dans un camping", ["grâce à ses parents", "avec une bourse", "en travaillant sur place"], "« J'ai travaillé tout l'été dans un camping »."),
      qcm("Quel budget avait-elle ?", "2 500 €", ["1 500 €", "5 200 €", "25 000 €"], "« deux mille cinq cents euros »."),
      qcm("Sur place, pour se déplacer, elle prenait…", "le bus", ["l'avion", "le train", "une voiture de location"], "« je prenais le bus, jamais l'avion sur place »."),
      qcm("Que faisait-elle dans la ferme au Pérou ?", "du volontariat : 4 h de travail contre le logement et les repas", ["un stage payé", "des cours d'espagnol", "des vacances"], "« je travaillais quatre heures par jour… logée et nourrie »."),
      vf("Sa mère était tranquille pendant tout le voyage.", false, "« Ma mère, si, beaucoup ! » (elle avait peur)."),
      qcm("Quelle règle avaient-elles fixée ?", "envoyer un message tous les soirs", ["appeler une fois par semaine", "rentrer au bout d'un mois", "voyager avec une amie"], "« je lui envoyais un message tous les soirs »."),
      qcm("Que lui est-il arrivé à Lima ?", "on lui a volé son téléphone", ["elle s'est perdue", "elle est tombée malade", "elle a raté son bus"], "« on m'a volé mon téléphone dans un marché »."),
      qcm("Selon Lucie, le voyage lui a surtout apporté…", "de la confiance en elle", ["de l'argent", "un travail", "un diplôme"], "« De la confiance en moi, surtout »."),
      qcm("Qu'a-t-elle fait en rentrant ?", "elle s'est inscrite en master de tourisme durable", ["elle a trouvé un emploi au Pérou", "elle est repartie", "elle a écrit un livre"], "« je me suis inscrite en master de tourisme durable »."),
      qcm("Quel conseil donne-t-elle ?", "garder des jours libres, ne pas tout planifier", ["tout réserver à l'avance", "partir en groupe", "voyager avec beaucoup d'argent"], "« Ne pas tout planifier. Gardez des jours libres »."),
    ] },

  /* ───── B2 ───── */
  { tep: "b2-telephones-ecole", level: "B2", tieuDe: "Écoute B2 : faut-il interdire le téléphone à l'école ?",
    doan: [
      d("coral", "Bonsoir et bienvenue dans « Le Grand Débat ». Depuis la rentrée, plusieurs collèges expérimentent une « pause numérique » : les élèves déposent leur téléphone dans un casier en arrivant et le récupèrent le soir. Faut-il généraliser la mesure ? Nous en débattons avec Marc Lefèvre, principal de collège, et Inès Moreau, sociologue spécialiste des usages numériques. Monsieur Lefèvre, quel bilan tirez-vous dans votre établissement ?", RADIO),
      d("onyx", "Un bilan très encourageant. En trois mois, les incidents liés au harcèlement en ligne pendant la journée ont nettement diminué, et les surveillants constatent que les élèves se parlent davantage dans la cour. Ils jouent, ils discutent. Certains m'ont même dit qu'ils se sentaient soulagés de ne plus être joignables en permanence."),
      d("coral", "Inès Moreau, vous êtes plus réservée ?", RADIO),
      d("shimmer", "Je ne suis pas contre, mais je mets en garde contre une vision un peu magique de l'interdiction. Le harcèlement ne s'arrête pas à la sortie du collège : il se déplace simplement vers la soirée, quand les adultes sont moins présents. Interdire, c'est facile ; apprendre aux jeunes à utiliser leurs écrans de façon responsable, c'est beaucoup plus exigeant, et c'est pourtant l'enjeu principal."),
      d("onyx", "Mais l'un n'empêche pas l'autre ! Nous avons justement mis en place des ateliers d'éducation aux médias. La pause numérique crée simplement un temps protégé, où l'école redevient un lieu de concentration."),
      d("shimmer", "Sur ce point, je vous rejoins. Les études montrent qu'une simple notification suffit à faire perdre le fil d'un raisonnement, et qu'il faut parfois plusieurs minutes pour retrouver sa concentration. Ma crainte, c'est plutôt l'inégalité de traitement : dans certains établissements, on a les moyens d'installer des casiers et d'organiser des ateliers ; dans d'autres, l'interdiction se résume à une sanction."),
      d("coral", "Et les parents ? Beaucoup s'inquiètent de ne pas pouvoir joindre leur enfant.", RADIO),
      d("onyx", "C'est l'argument qu'on entend le plus. Mais en cas d'urgence, le secrétariat peut toujours joindre les familles, comme avant les téléphones portables. Et dans les faits, après quelques semaines, les demandes de dérogation ont presque disparu."),
      d("shimmer", "Je dirais simplement qu'une règle est mieux acceptée quand elle est construite avec les élèves et les parents, plutôt qu'imposée d'en haut. C'est la condition pour qu'elle dure."),
    ],
    cau: [
      qcm("En quoi consiste la « pause numérique » ?", "les élèves déposent leur téléphone dans un casier pour la journée", ["les cours se font sans ordinateur", "les téléphones sont interdits à la maison", "les élèves ont un téléphone fourni par l'école"], "« déposent leur téléphone dans un casier en arrivant et le récupèrent le soir »."),
      qcm("Quelle est la fonction de Marc Lefèvre ?", "principal de collège", ["sociologue", "professeur de mathématiques", "parent d'élève"], "Présentation de l'animatrice."),
      qcm("Selon M. Lefèvre, qu'est-ce qui a diminué en trois mois ?", "les incidents de harcèlement en ligne pendant la journée", ["les retards", "les mauvaises notes", "les absences"], "« les incidents liés au harcèlement en ligne pendant la journée ont nettement diminué »."),
      qcm("Qu'observent les surveillants dans la cour ?", "les élèves se parlent et jouent davantage", ["les élèves s'ennuient", "il y a plus de conflits", "les élèves lisent plus"], "« les élèves se parlent davantage dans la cour »."),
      qcm("Quelle est la position d'Inès Moreau ?", "elle n'est pas contre, mais met en garde contre une vision « magique » de l'interdiction", ["elle est totalement opposée à la mesure", "elle veut interdire aussi les ordinateurs", "elle n'a pas d'avis"], "« Je ne suis pas contre, mais je mets en garde… »."),
      qcm("Selon elle, que devient le harcèlement avec l'interdiction ?", "il se déplace vers la soirée", ["il disparaît", "il augmente à l'école", "il passe par les professeurs"], "« il se déplace simplement vers la soirée »."),
      qcm("Pour Inès Moreau, l'enjeu principal est…", "d'apprendre aux jeunes un usage responsable des écrans", ["de punir les élèves", "d'installer des casiers partout", "de supprimer les réseaux sociaux"], "« apprendre aux jeunes à utiliser leurs écrans de façon responsable… c'est pourtant l'enjeu principal »."),
      qcm("Que répond M. Lefèvre à cette objection ?", "son collège organise aussi des ateliers d'éducation aux médias", ["l'éducation aux médias est inutile", "c'est le rôle des parents", "il va lever l'interdiction"], "« Nous avons justement mis en place des ateliers d'éducation aux médias »."),
      qcm("Sur quel point les deux invités sont-ils d'accord ?", "les notifications nuisent à la concentration", ["le harcèlement a disparu", "il faut sanctionner davantage", "les parents ont raison de s'inquiéter"], "« Sur ce point, je vous rejoins… une simple notification suffit à faire perdre le fil »."),
      qcm("Quelle crainte exprime la sociologue ?", "une inégalité entre établissements selon leurs moyens", ["une baisse des résultats scolaires", "une hausse des vols de téléphones", "le refus des professeurs"], "« Ma crainte, c'est plutôt l'inégalité de traitement »."),
      qcm("Quel est l'argument des parents le plus souvent entendu ?", "ne pas pouvoir joindre leur enfant", ["le coût des casiers", "la perte de temps", "le risque de vol"], "« Beaucoup s'inquiètent de ne pas pouvoir joindre leur enfant »."),
      qcm("Que s'est-il passé avec les demandes de dérogation ?", "elles ont presque disparu après quelques semaines", ["elles ont doublé", "elles sont toutes acceptées", "elles sont interdites"], "« les demandes de dérogation ont presque disparu »."),
      qcm("Selon Inès Moreau, une règle dure davantage quand…", "elle est construite avec les élèves et les parents", ["elle est très sévère", "elle est imposée par le ministère", "elle s'applique seulement aux plus jeunes"], "Dernière réplique."),
      qcm("Le ton général du débat est…", "nuancé et courtois", ["agressif", "ironique", "indifférent"], "Les invités reconnaissent les arguments de l'autre (« je vous rejoins », « l'un n'empêche pas l'autre »)."),
    ] },
  { tep: "b2-tourisme-masse", level: "B2", tieuDe: "Écoute B2 : le tourisme de masse",
    doan: [
      d("sage", "Bonjour, ici « Le monde en question ». Venise, Barcelone, Dubrovnik, mais aussi le Mont-Saint-Michel ou certaines calanques de Marseille : de plus en plus de sites font face à ce qu'on appelle le surtourisme, c'est-à-dire une fréquentation si forte qu'elle dégrade la vie des habitants et l'environnement. Depuis 2024, Venise fait payer un droit d'entrée de cinq euros aux visiteurs qui viennent pour la journée, certains jours de forte affluence. L'objectif n'est pas de gagner de l'argent, mais de dissuader les excursions d'un seul jour, qui rapportent peu à la ville et la saturent.", RADIO),
      d("sage", "En France, les calanques de Marseille ont choisi une autre méthode : la réservation obligatoire. En été, pour accéder à la calanque de Sugiton, il faut réserver gratuitement en ligne, et le nombre de places est limité à quatre cents personnes par jour, contre deux mille cinq cents auparavant. Résultat, selon le parc national : la végétation, qui était piétinée, commence à repousser.", RADIO),
      d("sage", "Ces mesures ne font pas l'unanimité. Les commerçants craignent une baisse de leur chiffre d'affaires, et certains dénoncent un tourisme réservé à ceux qui savent anticiper ou qui ont les moyens de payer. Les chercheurs, eux, rappellent qu'il ne s'agit pas de moins de touristes partout, mais de mieux les répartir : dans le temps, en encourageant les visites hors saison, et dans l'espace, en faisant découvrir des lieux moins connus.", RADIO),
      d("sage", "Enfin, les comportements individuels comptent aussi. Rester plus longtemps au même endroit, privilégier le train à l'avion, ou loger chez des habitants plutôt que dans des locations de courte durée, qui font grimper les loyers dans les centres-villes : autant de gestes qui permettent de voyager sans abîmer ce qu'on vient admirer.", RADIO),
    ],
    cau: [
      qcm("Comment le document définit-il le « surtourisme » ?", "une fréquentation si forte qu'elle dégrade la vie des habitants et l'environnement", ["le tourisme d'affaires", "le tourisme de luxe", "la baisse du nombre de touristes"], "Définition donnée au début."),
      qcm("Depuis quand Venise fait-elle payer un droit d'entrée ?", "depuis 2024", ["depuis 2020", "depuis 2014", "depuis cette année seulement"], "« Depuis 2024 »."),
      qcm("Combien coûte ce droit d'entrée ?", "5 €", ["10 €", "15 €", "50 €"], "« un droit d'entrée de cinq euros »."),
      qcm("Qui doit payer à Venise ?", "les visiteurs venus pour la journée, certains jours d'affluence", ["tous les touristes, toute l'année", "les habitants", "seulement les étrangers"], "« aux visiteurs qui viennent pour la journée, certains jours de forte affluence »."),
      qcm("Quel est l'objectif de cette mesure ?", "dissuader les excursions d'un seul jour", ["gagner de l'argent", "financer les musées", "attirer plus de touristes"], "« L'objectif n'est pas de gagner de l'argent, mais de dissuader les excursions d'un seul jour »."),
      qcm("Quelle méthode utilisent les calanques de Marseille ?", "la réservation obligatoire et gratuite", ["un péage de 5 €", "la fermeture en été", "un quota pour les étrangers"], "« il faut réserver gratuitement en ligne »."),
      qcm("Combien de personnes par jour peuvent accéder à la calanque de Sugiton ?", "400", ["2 500", "4 000", "250"], "« limité à quatre cents personnes par jour »."),
      qcm("Quel résultat observe le parc national ?", "la végétation commence à repousser", ["les commerçants gagnent plus", "il n'y a plus de déchets", "les touristes sont mécontents"], "« la végétation… commence à repousser »."),
      qcm("Que craignent les commerçants ?", "une baisse de leur chiffre d'affaires", ["une hausse des loyers", "trop de touristes", "la concurrence étrangère"], "« Les commerçants craignent une baisse de leur chiffre d'affaires »."),
      qcm("Quelle critique sociale est faite à ces mesures ?", "elles favoriseraient ceux qui anticipent ou peuvent payer", ["elles coûtent trop cher aux villes", "elles sont illégales", "elles attirent les mauvais touristes"], "« un tourisme réservé à ceux qui savent anticiper ou qui ont les moyens de payer »."),
      qcm("Selon les chercheurs, la solution est de…", "mieux répartir les touristes dans le temps et l'espace", ["réduire les touristes partout", "interdire les avions", "construire plus d'hôtels"], "« il ne s'agit pas de moins de touristes partout, mais de mieux les répartir »."),
      qcm("Pourquoi le document déconseille-t-il les locations de courte durée ?", "elles font grimper les loyers dans les centres-villes", ["elles sont dangereuses", "elles sont trop chères pour les touristes", "elles polluent davantage"], "« qui font grimper les loyers dans les centres-villes »."),
      qcm("Lequel de ces gestes est recommandé ?", "privilégier le train à l'avion", ["voyager plus souvent pour de courtes durées", "visiter en haute saison", "loger dans le centre historique"], "« privilégier le train à l'avion »."),
    ] },
  { tep: "b2-ia-travail", level: "B2", tieuDe: "Écoute B2 : l'intelligence artificielle au travail",
    doan: [
      d("ash", "Bienvenue dans « Futurs ». L'intelligence artificielle générative s'installe dans les bureaux : rédaction de courriels, résumés de réunions, traduction. Va-t-elle supprimer des emplois ? Nous recevons Claire Dubois, économiste du travail. Claire, faut-il avoir peur ?", RADIO),
      d("nova", "Il faut surtout éviter deux erreurs : croire que rien ne va changer, et croire que tout va disparaître. Les études récentes montrent que l'IA remplace rarement un métier entier. Elle remplace des tâches. Un comptable, par exemple, passera moins de temps à saisir des données et davantage à conseiller ses clients. Le métier se transforme plus qu'il ne disparaît."),
      d("ash", "Mais certains postes sont quand même menacés ?", RADIO),
      d("nova", "Oui, et il ne faut pas le nier. Les emplois très répétitifs et peu qualifiés dans les services administratifs sont les plus exposés, et ce sont souvent des emplois occupés par des femmes. Paradoxalement, des métiers qualifiés comme traducteur ou rédacteur sont aussi touchés, alors qu'on les pensait protégés. En revanche, les métiers qui demandent un contact humain, de la dextérité ou un jugement en situation, comme infirmier, électricien ou enseignant, sont beaucoup moins concernés."),
      d("ash", "Comment les salariés peuvent-ils s'y préparer ?", RADIO),
      d("nova", "Par la formation, évidemment, mais pas seulement la formation technique. Savoir formuler une demande à un outil, c'est utile, mais savoir vérifier ce qu'il produit l'est encore plus. Ces outils se trompent avec beaucoup d'assurance. L'esprit critique devient une compétence professionnelle à part entière."),
      d("ash", "Et les entreprises ?", RADIO),
      d("nova", "Elles ont une responsabilité. Les gains de productivité peuvent servir à réduire les effectifs, ou bien à libérer du temps pour des tâches plus intéressantes, voire à réduire le temps de travail. C'est un choix, pas une fatalité technologique. Et ce choix devrait se discuter avec les salariés et leurs représentants, pas être décidé seul par la direction."),
    ],
    cau: [
      qcm("Quelles tâches de bureau sont citées comme exemples d'usage de l'IA ?", "rédaction de courriels, résumés de réunions, traduction", ["comptabilité, vente, livraison", "recrutement, licenciement, formation", "nettoyage, sécurité, accueil"], "Introduction de l'animateur."),
      qcm("Quelle est la profession de Claire Dubois ?", "économiste du travail", ["ingénieure en IA", "cheffe d'entreprise", "syndicaliste"], "« Claire Dubois, économiste du travail »."),
      qcm("Selon elle, quelles sont les deux erreurs à éviter ?", "croire que rien ne change ou que tout va disparaître", ["utiliser l'IA ou la refuser", "former trop ou pas assez", "payer trop ou pas assez"], "« croire que rien ne va changer, et croire que tout va disparaître »."),
      qcm("D'après les études, l'IA remplace surtout…", "des tâches", ["des métiers entiers", "les cadres", "les jeunes"], "« Elle remplace des tâches »."),
      qcm("Que fera davantage un comptable selon l'exemple ?", "conseiller ses clients", ["saisir des données", "programmer des logiciels", "chercher un autre métier"], "« davantage à conseiller ses clients »."),
      qcm("Quels emplois sont les plus exposés ?", "les emplois répétitifs et peu qualifiés des services administratifs", ["les métiers manuels", "les métiers de soin", "l'enseignement"], "« Les emplois très répétitifs et peu qualifiés dans les services administratifs sont les plus exposés »."),
      vf("Ces emplois exposés sont souvent occupés par des femmes.", true, "« ce sont souvent des emplois occupés par des femmes »."),
      qcm("Pourquoi le cas des traducteurs est-il qualifié de « paradoxal » ?", "parce qu'on pensait ces métiers qualifiés protégés", ["parce qu'ils utilisent déjà l'IA", "parce qu'ils sont très bien payés", "parce qu'ils travaillent à domicile"], "« alors qu'on les pensait protégés »."),
      qcm("Quel métier est cité comme peu concerné ?", "électricien", ["rédacteur", "traducteur", "agent administratif"], "« infirmier, électricien ou enseignant, sont beaucoup moins concernés »."),
      qcm("Selon Claire Dubois, quelle compétence devient essentielle ?", "l'esprit critique pour vérifier ce que produit l'outil", ["la vitesse de frappe", "la programmation", "la connaissance de plusieurs outils"], "« L'esprit critique devient une compétence professionnelle à part entière »."),
      qcm("Que dit-elle des erreurs de ces outils ?", "ils se trompent avec beaucoup d'assurance", ["ils ne se trompent jamais", "leurs erreurs sont faciles à voir", "ils signalent toujours leurs doutes"], "« Ces outils se trompent avec beaucoup d'assurance »."),
      qcm("Pour elle, l'usage des gains de productivité est…", "un choix, pas une fatalité technologique", ["déterminé par la technologie", "imposé par la loi", "sans importance"], "« C'est un choix, pas une fatalité technologique »."),
      qcm("Selon elle, qui devrait participer à ce choix ?", "les salariés et leurs représentants, avec la direction", ["la direction seule", "l'État seul", "les clients"], "« ce choix devrait se discuter avec les salariés et leurs représentants »."),
    ] },
];

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
for (const b of BAI) {
  const r = await fetch(URL_FN, { method: "POST", headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, "x-admin-token": TOKEN, "Content-Type": "application/json" }, body: JSON.stringify({ ten: b.tep, doan: b.doan }) });
  const kq = await r.json();
  if (!kq.ok) { console.error(b.tep, kq); process.exit(1); }
  console.error(`✔ ${b.tep}: ${Math.round(kq.so_byte / 1024)} KB, ${b.cau.length} câu`);
  const ex = { title: "[NHÁP] " + b.tieuDe, level: b.level, skills: ["Écoute"], id: id("nhap"), audioUrl: kq.url, questions: b.cau,
    consigne: "<p>Écoutez le document (deux écoutes), puis répondez aux questions.</p><p><em>Enregistrement réalisé avec une voix de synthèse (giọng tổng hợp).</em></p>",
    usageType: "assignment", targeted: true, assignedTo: ["__nhap__"], assignedClasses: [], assignedExtra: [], createdAt: Date.now() };
  const { exRow, qRows } = toRows(ex, "assignment");
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}
console.log(ra.join("\n"));
