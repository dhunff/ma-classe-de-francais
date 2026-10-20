/* Lô 25 (20/10): 10 bài ĐỌC HIỂU A2 miễn phí cho kho luyện tập (trước đó A2 chỉ có 1 bài đọc miễn phí).
 * Dạng tài liệu đời thường của DELF A2: email, thông báo, quảng cáo, bài báo ngắn, chương trình,
 * nội quy, tin rao, blog. Nội dung do FRACILE soạn, nhân vật và địa điểm hư cấu; không dấu gạch dài.
 * Máy dựng: lo25_doc_a2.mjs. */
let dem = 0;
export const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261021;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const vf = (prompt, dung, justification) => ({ id: id("q"), type: "vf", prompt, answer: dung ? 0 : 1, justification });
const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
const C = (loai) => p(`Vous lisez ${loai}. Lisez le document puis répondez aux questions.`);

export const BAI = [
  { title: "Lecture A2 : un courriel de Camille", consigne: C("ce courriel"),
    readingText: p("<strong>De :</strong> Camille", "<strong>Objet :</strong> Mon nouveau travail", "Salut Julien !", "Je t'écris de Lyon ! Depuis lundi, je travaille dans une librairie près de la place Bellecour. Je commence à 9 h 30 et je finis à 18 h. Mes collègues sont très gentils, surtout Marc, qui m'explique tout.", "Le seul problème, c'est le logement : pour l'instant, j'habite chez ma tante, à quarante minutes en bus. Je cherche un petit studio dans le centre.", "Tu viens me voir en novembre ? On pourrait visiter le musée des Confluences et manger dans un bouchon lyonnais.", "Bises,<br>Camille"),
    questions: [
      qcm("Où travaille Camille ?", "dans une librairie", ["dans un musée", "dans un restaurant"], "« je travaille dans une librairie »."),
      qcm("Camille travaille depuis…", "lundi", ["un mois", "novembre"], "« Depuis lundi »."),
      qcm("À quelle heure finit-elle ?", "18 h", ["9 h 30", "17 h"], "« je finis à 18 h »."),
      qcm("Qui l'aide au travail ?", "Marc", ["Julien", "sa tante"], "« surtout Marc, qui m'explique tout »."),
      vf("Camille a déjà trouvé un studio.", false, "« Je cherche un petit studio »."),
      qcm("Où habite-t-elle pour l'instant ?", "chez sa tante", ["dans un studio", "à l'hôtel"], "« j'habite chez ma tante »."),
      qcm("Que propose Camille à Julien ?", "de venir la voir en novembre", ["de travailler à la librairie", "de partager un appartement"], "« Tu viens me voir en novembre ? »."),
    ] },
  { title: "Lecture A2 : la piscine municipale", consigne: C("cette affiche"),
    readingText: p("<strong>PISCINE MUNICIPALE DES TILLEULS : NOUVEAUX HORAIRES</strong>", "À partir du 3 novembre :", "• Lundi, mardi, jeudi, vendredi : 12 h – 14 h et 17 h – 21 h", "• Mercredi : 10 h – 19 h (cours pour enfants de 14 h à 16 h)", "• Samedi et dimanche : 9 h – 18 h", "<strong>Tarifs :</strong> adulte 4 €, enfant (moins de 12 ans) 2,50 €, carte 10 entrées 35 €.", "Le bonnet de bain est obligatoire. Les shorts de bain sont interdits.", "Fermeture exceptionnelle le 11 novembre (jour férié)."),
    questions: [
      qcm("Les nouveaux horaires commencent…", "le 3 novembre", ["le 11 novembre", "le 1er novembre"], "« À partir du 3 novembre »."),
      qcm("Le mercredi après-midi, il y a…", "des cours pour enfants", ["une fermeture", "des cours pour adultes"], "« cours pour enfants de 14 h à 16 h »."),
      qcm("Le samedi, la piscine ouvre à…", "9 h", ["10 h", "12 h"], "« Samedi et dimanche : 9 h – 18 h »."),
      qcm("Combien coûte une entrée pour un enfant de 8 ans ?", "2,50 €", ["4 €", "3,50 €"], "« enfant (moins de 12 ans) 2,50 € »."),
      qcm("Avec la carte 10 entrées, une entrée coûte…", "3,50 €", ["4 €", "3 €"], "35 € ÷ 10 = 3,50 €."),
      vf("On peut nager avec un short de bain.", false, "« Les shorts de bain sont interdits »."),
      vf("La piscine est fermée le 11 novembre.", true, "« Fermeture exceptionnelle le 11 novembre »."),
    ] },
  { title: "Lecture A2 : une petite annonce de colocation", consigne: C("cette petite annonce"),
    readingText: p("<strong>Cherche colocataire à Bordeaux</strong>", "Bonjour ! Nous sommes deux étudiants (Inès, 21 ans, et Hugo, 23 ans) et nous cherchons une troisième personne pour notre appartement de 75 m², quartier Saint-Michel.", "La chambre fait 12 m², avec un lit, un bureau et une grande fenêtre. Cuisine et salle de bain à partager.", "Loyer : 380 € par mois, charges comprises (eau, électricité, Internet).", "Le tram est à 3 minutes et le marché le dimanche matin juste en bas !", "Nous cherchons une personne calme et non-fumeuse. Les animaux ne sont pas acceptés.", "Disponible le 1er décembre. Contact : coloc.stmichel@mail.fr"),
    questions: [
      qcm("Qui écrit l'annonce ?", "deux étudiants", ["un propriétaire", "une agence"], "« Nous sommes deux étudiants »."),
      qcm("Quelle est la surface de la chambre ?", "12 m²", ["75 m²", "21 m²"], "« La chambre fait 12 m² »."),
      qcm("Le loyer comprend…", "l'eau, l'électricité et Internet", ["seulement l'eau", "le repas du soir"], "« charges comprises (eau, électricité, Internet) »."),
      qcm("Qu'est-ce qui est à 3 minutes ?", "le tram", ["l'université", "le marché"], "« Le tram est à 3 minutes »."),
      vf("Une personne qui fume peut répondre à l'annonce.", false, "« non-fumeuse »."),
      vf("On peut venir avec son chat.", false, "« Les animaux ne sont pas acceptés »."),
      qcm("La chambre est libre…", "le 1er décembre", ["tout de suite", "le dimanche"], "« Disponible le 1er décembre »."),
    ] },
  { title: "Lecture A2 : une recette de crêpes", consigne: C("cette recette"),
    readingText: p("<strong>Crêpes faciles (pour 4 personnes)</strong>", "<strong>Ingrédients :</strong> 250 g de farine, 4 œufs, un demi-litre de lait, une pincée de sel, 2 cuillères à soupe de sucre, 50 g de beurre fondu.", "<strong>Préparation :</strong>", "1. Mettez la farine, le sel et le sucre dans un grand bol.", "2. Ajoutez les œufs, puis versez le lait petit à petit en mélangeant.", "3. Ajoutez le beurre fondu. Laissez reposer la pâte une heure.", "4. Faites chauffer une poêle et versez une petite louche de pâte. Faites cuire une minute de chaque côté.", "<strong>Conseil :</strong> servez avec du sucre, de la confiture ou du chocolat. Pour des crêpes salées, enlevez le sucre !"),
    questions: [
      qcm("Cette recette est pour combien de personnes ?", "4", ["2", "6"], "« pour 4 personnes »."),
      qcm("Combien d'œufs faut-il ?", "4", ["2", "250"], "« 4 œufs »."),
      qcm("Comment faut-il verser le lait ?", "petit à petit", ["en une seule fois", "avant la farine"], "« versez le lait petit à petit »."),
      qcm("Combien de temps la pâte doit-elle reposer ?", "une heure", ["une minute", "une nuit"], "« Laissez reposer la pâte une heure »."),
      qcm("Combien de temps cuit chaque côté ?", "une minute", ["cinq minutes", "une heure"], "« une minute de chaque côté »."),
      vf("On peut faire des crêpes salées avec cette recette.", true, "« Pour des crêpes salées, enlevez le sucre »."),
      qcm("Que met-on en dernier dans la pâte ?", "le beurre fondu", ["la farine", "le sel"], "Étape 3 : ajoutez le beurre fondu."),
    ] },
  { title: "Lecture A2 : un article sur le vélo en ville", consigne: C("cet article"),
    readingText: p("<strong>À Nantes, les vélos gagnent la ville</strong>", "Depuis deux ans, la ville de Nantes a créé quarante kilomètres de nouvelles pistes cyclables. Résultat : de plus en plus d'habitants vont au travail à vélo.", "Sophie, 34 ans, est infirmière. « Avant, je prenais la voiture et je perdais vingt minutes dans les embouteillages. Maintenant, je mets quinze minutes à vélo et je fais du sport sans aller à la salle ! »", "La ville propose aussi des vélos en location : 1 euro pour une heure, 30 euros pour un an. Les étudiants paient moitié prix.", "Mais tout n'est pas parfait. Certains cyclistes se plaignent du manque de parkings pour vélos près des gares, et l'hiver, beaucoup reprennent le bus."),
    questions: [
      qcm("Combien de kilomètres de pistes cyclables la ville a-t-elle créés ?", "40", ["20", "15"], "« quarante kilomètres »."),
      qcm("Quel est le métier de Sophie ?", "infirmière", ["étudiante", "professeure"], "« est infirmière »."),
      qcm("Combien de temps Sophie met-elle à vélo ?", "15 minutes", ["20 minutes", "34 minutes"], "« je mets quinze minutes à vélo »."),
      qcm("Selon Sophie, un avantage du vélo est…", "faire du sport", ["gagner de l'argent", "rencontrer des amis"], "« je fais du sport sans aller à la salle »."),
      qcm("Pour un étudiant, l'abonnement d'un an coûte…", "15 euros", ["30 euros", "1 euro"], "30 € moitié prix = 15 €."),
      qcm("De quoi se plaignent certains cyclistes ?", "du manque de parkings près des gares", ["du prix des vélos", "des pistes trop étroites"], "« manque de parkings pour vélos près des gares »."),
      vf("En hiver, tout le monde continue à prendre le vélo.", false, "« l'hiver, beaucoup reprennent le bus »."),
    ] },
  { title: "Lecture A2 : le règlement de la bibliothèque", consigne: C("ce règlement"),
    readingText: p("<strong>Médiathèque Jean-Moulin : règles à respecter</strong>", "• L'inscription est gratuite pour tous. Apportez une pièce d'identité et un justificatif de domicile.", "• Vous pouvez emprunter 10 documents (livres, BD, DVD) pendant trois semaines.", "• Vous pouvez prolonger une fois vos emprunts sur Internet, sauf les nouveautés.", "• En cas de retard, vous ne pouvez plus emprunter pendant une semaine.", "• Les téléphones doivent être en mode silencieux. Les appels sont autorisés seulement dans le hall.", "• Il est interdit de manger dans les salles de lecture. Les boissons avec un couvercle sont acceptées.", "• Un espace jeux vidéo est ouvert le samedi après-midi pour les 12-17 ans."),
    questions: [
      qcm("Pour s'inscrire, il faut…", "une pièce d'identité et un justificatif de domicile", ["payer 10 euros", "une photo"], "Premier point."),
      qcm("Combien de documents peut-on emprunter ?", "10", ["3", "12"], "« emprunter 10 documents »."),
      qcm("Pendant combien de temps ?", "trois semaines", ["une semaine", "un mois"], "« pendant trois semaines »."),
      vf("On peut prolonger les nouveautés.", false, "« sauf les nouveautés »."),
      qcm("Que se passe-t-il en cas de retard ?", "On ne peut plus emprunter pendant une semaine.", ["On paie une amende.", "On perd sa carte."], "Quatrième point."),
      qcm("Où peut-on téléphoner ?", "dans le hall", ["dans les salles de lecture", "nulle part"], "« seulement dans le hall »."),
      vf("On peut boire un café avec un couvercle dans les salles.", true, "« Les boissons avec un couvercle sont acceptées »."),
    ] },
  { title: "Lecture A2 : une invitation au mariage", consigne: C("ce faire-part"),
    readingText: p("<strong>Léa et Thomas</strong> ont la joie de vous inviter à leur mariage", "le <strong>samedi 14 juin</strong>", "Cérémonie à 15 h à la mairie de Saint-Malo, puis vin d'honneur dans les jardins du château de la Roche, à 17 h.", "Le dîner et la soirée dansante auront lieu au château à partir de 20 h.", "Un bus partira de la mairie à 16 h 30 pour aller au château. Pour dormir sur place, des chambres sont réservées à l'hôtel des Remparts (dites « mariage Léa et Thomas »).", "Merci de répondre avant le 1er mai.", "Pas de cadeau, s'il vous plaît : une urne sera à votre disposition pour notre voyage au Japon !"),
    questions: [
      qcm("Le mariage a lieu…", "le samedi 14 juin", ["le dimanche 14 juin", "le 1er mai"], "« le samedi 14 juin »."),
      qcm("Où a lieu la cérémonie ?", "à la mairie de Saint-Malo", ["au château", "à l'hôtel des Remparts"], "« Cérémonie à 15 h à la mairie de Saint-Malo »."),
      qcm("À quelle heure commence le dîner ?", "20 h", ["17 h", "15 h"], "« à partir de 20 h »."),
      qcm("À quoi sert le bus ?", "aller de la mairie au château", ["aller à la gare", "rentrer à l'hôtel"], "« Un bus partira de la mairie… pour aller au château »."),
      qcm("Pour réserver une chambre, il faut dire…", "« mariage Léa et Thomas »", ["son numéro de téléphone", "« château de la Roche »"], "Indiqué entre guillemets."),
      qcm("Avant quelle date faut-il répondre ?", "le 1er mai", ["le 14 juin", "le 30 avril"], "« répondre avant le 1er mai »."),
      vf("Les mariés souhaitent recevoir des cadeaux.", false, "« Pas de cadeau, s'il vous plaît »."),
    ] },
  { title: "Lecture A2 : un blog de voyage", consigne: C("cet article de blog"),
    readingText: p("<strong>Trois jours à Marseille</strong> (par Antoine, voyageur)", "Je suis arrivé à Marseille vendredi matin en train. Il faisait déjà chaud ! Mon hôtel était près du Vieux-Port, très pratique pour tout visiter à pied.", "Le premier jour, j'ai monté les escaliers jusqu'à Notre-Dame-de-la-Garde : la vue sur la ville et la mer est magnifique. Le soir, j'ai mangé une bouillabaisse, le plat typique, mais c'était un peu cher : 45 euros !", "Samedi, j'ai pris le bateau pour les calanques. Nous avons nagé dans une eau très claire. C'était le meilleur moment du voyage.", "Dimanche, il a plu toute la journée, alors je suis resté au musée des Civilisations (le MuCEM). Je suis reparti le soir, fatigué mais content."),
    questions: [
      qcm("Comment Antoine est-il arrivé à Marseille ?", "en train", ["en avion", "en voiture"], "« arrivé à Marseille vendredi matin en train »."),
      qcm("Pourquoi son hôtel était-il pratique ?", "Il pouvait tout visiter à pied.", ["Il était bon marché.", "Il avait une piscine."], "« très pratique pour tout visiter à pied »."),
      qcm("Qu'a-t-il vu depuis Notre-Dame-de-la-Garde ?", "la ville et la mer", ["les calanques", "le musée"], "« la vue sur la ville et la mer »."),
      qcm("Que pense-t-il de la bouillabaisse ?", "C'était un peu cher.", ["C'était mauvais.", "C'était gratuit."], "« c'était un peu cher : 45 euros »."),
      qcm("Quel a été le meilleur moment ?", "nager dans les calanques", ["visiter le musée", "manger la bouillabaisse"], "« C'était le meilleur moment du voyage »."),
      qcm("Pourquoi est-il allé au musée dimanche ?", "Il a plu.", ["Il faisait trop chaud.", "Le bateau était complet."], "« il a plu toute la journée »."),
      vf("Antoine est rentré lundi matin.", false, "« Je suis reparti le soir » (dimanche)."),
    ] },
  { title: "Lecture A2 : le programme d'une journée portes ouvertes", consigne: C("ce programme"),
    readingText: p("<strong>Lycée Victor-Hugo : journée portes ouvertes, samedi 7 mars</strong>", "9 h 30 : accueil des familles dans le hall, café offert.", "10 h : présentation du lycée par la directrice (amphithéâtre).", "10 h 45 – 12 h : visite des salles de classe, des laboratoires et du CDI avec des élèves de terminale.", "12 h – 13 h 30 : repas possible à la cantine (5 € par personne, réservation obligatoire).", "14 h : démonstration de robotique par le club des élèves.", "15 h : rencontre avec les professeurs de langues : anglais, espagnol, allemand et chinois.", "Fin de la journée : 16 h. Parking gratuit derrière le gymnase."),
    questions: [
      qcm("À quelle heure commence la journée ?", "9 h 30", ["10 h", "8 h"], "« 9 h 30 : accueil des familles »."),
      qcm("Qui présente le lycée ?", "la directrice", ["les élèves de terminale", "les professeurs de langues"], "« présentation du lycée par la directrice »."),
      qcm("Qui fait visiter les salles ?", "des élèves de terminale", ["la directrice", "le club de robotique"], "« avec des élèves de terminale »."),
      vf("On peut manger à la cantine sans réserver.", false, "« réservation obligatoire »."),
      qcm("Combien coûte le repas ?", "5 € par personne", ["gratuit", "5 € par famille"], "« 5 € par personne »."),
      qcm("Quelle langue n'est PAS citée ?", "l'italien", ["le chinois", "l'allemand"], "Langues citées : anglais, espagnol, allemand, chinois."),
      qcm("Où peut-on se garer ?", "derrière le gymnase", ["devant le lycée", "à la cantine"], "« Parking gratuit derrière le gymnase »."),
    ] },
  { title: "Lecture A2 : un message du propriétaire", consigne: C("ce message"),
    readingText: p("Bonjour à tous les locataires,", "Je vous informe que des travaux auront lieu dans l'immeuble du lundi 18 au vendredi 22 novembre. Les ouvriers vont repeindre l'escalier et changer l'ascenseur.", "Pendant cette semaine, l'ascenseur ne fonctionnera pas. Pour les personnes âgées ou qui ont des difficultés à marcher, mon fils peut aider à monter les courses : appelez-le au 06 12 34 56 78.", "Les ouvriers travailleront de 8 h à 17 h. Il y aura du bruit, je m'excuse pour la gêne.", "Attention : la peinture sera fraîche. Ne touchez pas les murs et ne laissez pas vos vélos dans l'escalier.", "Merci de votre compréhension.", "M. Durand, propriétaire"),
    questions: [
      qcm("Pendant combien de jours dureront les travaux ?", "5 jours", ["2 jours", "une semaine et demie"], "Du lundi 18 au vendredi 22."),
      qcm("Quels travaux sont prévus ?", "repeindre l'escalier et changer l'ascenseur", ["refaire les fenêtres", "changer les portes"], "Premier paragraphe."),
      vf("L'ascenseur fonctionnera pendant les travaux.", false, "« l'ascenseur ne fonctionnera pas »."),
      qcm("Qui peut aider à monter les courses ?", "le fils du propriétaire", ["les ouvriers", "le gardien"], "« mon fils peut aider »."),
      qcm("À quelle heure finissent les ouvriers ?", "17 h", ["8 h", "18 h"], "« de 8 h à 17 h »."),
      qcm("Que demande le propriétaire ?", "ne pas toucher les murs", ["fermer les fenêtres", "partir en vacances"], "« Ne touchez pas les murs »."),
      qcm("Pourquoi le propriétaire s'excuse-t-il ?", "pour le bruit", ["pour le prix du loyer", "pour le retard"], "« Il y aura du bruit, je m'excuse pour la gêne »."),
    ] },
];
