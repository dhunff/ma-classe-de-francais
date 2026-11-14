/* Lô 44: NỘI DUNG đề TCF tout public (« TCF Pháp ») · Đề 1 (FRACILE soạn, bối cảnh Pháp).
 * Nghe 29, Cấu trúc ngôn ngữ 18, Đọc 29 (khung FEI từ 01/09/2026); mức khó trải theo tỉ lệ của 39 câu. */
import { datHat, d, ngheTranh, ngheDap, ngheHoi, doc, ms, DOI_THOAI, RADIO, ANNONCE, p } from "./lo44_tcf_chung.mjs";

datHat(20261115);
const ANH_VELO = "https://ouch-prod-var-cdn.icons8.com/bi/illustrations/previews/KyegRyiXrYkcf-kl.webp";

/* ═════════════ COMPRÉHENSION ORALE : 29 câu (3 A1, 5 A2, 7 B1, 7 B2, 5 C1, 2 C2) ═════════════ */
export const CO = [
  ngheTranh(ANH_VELO, ["Un homme répare son vélo.", "Un homme attend le bus.", "Un cycliste porte un casque.", "Un homme promène son chien."], 2,
    "Sur l'image, l'homme roule à vélo avec un casque."),
  ngheDap([d("nova", DOI_THOAI, "Bonjour, une baguette, s'il vous plaît.")],
    ["Voilà, un euro dix.", "Il pleut ce matin.", "Je suis professeur.", "À la gare."], 0,
    "À la boulangerie, la vendeuse donne le pain et annonce le prix."),
  ngheDap([d("echo", DOI_THOAI, "Tu habites où ?")],
    ["J'ai vingt ans.", "Dans le quinzième arrondissement.", "Avec plaisir.", "En voiture."], 1,
    "La question porte sur le lieu d'habitation."),
  ngheDap([d("shimmer", DOI_THOAI, "Excusez-moi, le train pour Lyon part de quel quai ?")],
    ["Il coûte quarante euros.", "C'est un TGV.", "Voie sept, dans dix minutes.", "Je descends à Dijon."], 2,
    "On demande le quai : la réponse donne la voie."),
  ngheDap([d("onyx", DOI_THOAI, "On se retrouve devant le cinéma à vingt heures ?")],
    ["Le film est américain.", "Plutôt vingt heures trente, je finis tard.", "J'ai vu ce film hier.", "Le cinéma est fermé le lundi."], 1,
    "On propose un rendez-vous : la réponse propose une autre heure."),
  ngheHoi([d("fable", ANNONCE, "Mesdames et messieurs, le TER à destination de Rouen, prévu à quatorze heures douze, partira avec un retard d'environ vingt minutes en raison d'un incident technique.")],
    "Que se passe-t-il ?", "Le train part en retard.", ["Le train est annulé.", "Le train change de quai.", "Le train part plus tôt."], "« partira avec un retard d'environ vingt minutes »."),
  ngheHoi([d("coral", DOI_THOAI, "Salut, c'est Sophie. Je ne pourrai pas venir à la réunion des parents ce soir, ma fille est malade. Est-ce que tu peux prendre des notes pour moi ?")],
    "Que demande Sophie ?", "De noter les informations de la réunion.", ["De garder sa fille.", "D'annuler la réunion.", "D'appeler le médecin."], "« Est-ce que tu peux prendre des notes pour moi ? »"),
  ngheHoi([d("nova", DOI_THOAI, "Bonjour, je voudrais échanger ce pull, il est trop petit."), d("ash", DOI_THOAI, "Vous avez le ticket de caisse ? Sans ticket, je ne peux pas faire l'échange.")],
    "Qu'est-ce qui est nécessaire pour échanger le pull ?", "Le ticket de caisse.", ["Une carte de fidélité.", "Une pièce d'identité.", "L'emballage d'origine."], "« Sans ticket, je ne peux pas faire l'échange »."),
  /* B1 */
  ngheHoi([d("onyx", RADIO, "À partir du premier mars, les bus de la ville seront gratuits le samedi pour tous les habitants. La mairie espère ainsi réduire la circulation automobile dans le centre-ville les jours de marché.")],
    "Pourquoi la mairie rend-elle les bus gratuits le samedi ?", "Pour diminuer le nombre de voitures en ville.", ["Pour aider les commerçants du marché.", "Pour attirer les touristes.", "Pour fêter une nouvelle ligne."], "Elle espère « réduire la circulation automobile »."),
  ngheHoi([d("echo", DOI_THOAI, "Tu pars en vacances quand, finalement ?"), d("shimmer", DOI_THOAI, "Normalement en août. Mais mon chef me demande de rester jusqu'à la fin du projet, alors je vais sûrement décaler à septembre.")],
    "Pourquoi la femme va-t-elle changer ses dates de vacances ?", "Pour terminer un travail.", ["Pour payer moins cher.", "Pour partir avec sa famille.", "À cause du climat."], "Son chef lui demande de rester « jusqu'à la fin du projet »."),
  ngheHoi([d("coral", ANNONCE, "Bonjour Monsieur Lefèvre, la salle de réunion que vous aviez réservée pour jeudi est en travaux. Je vous propose la salle deux cent quatre, au deuxième étage, qui peut accueillir le même nombre de personnes.")],
    "Que propose la personne ?", "Une autre salle.", ["Une autre date.", "Une réunion en ligne.", "Un repas d'équipe."], "Elle propose « la salle deux cent quatre »."),
  ngheHoi([d("nova", RADIO, "J'ai appris à nager à quarante ans. Je n'avais pas honte, mais je pensais que c'était trop tard. En fait, le plus difficile n'a pas été la technique : ça a été de surmonter ma peur de l'eau.")],
    "Qu'est-ce qui a été le plus difficile pour cette femme ?", "Vaincre sa peur.", ["Apprendre les mouvements.", "Trouver une piscine.", "Trouver du temps."], "« le plus difficile… ça a été de surmonter ma peur de l'eau »."),
  ngheHoi([d("fable", ANNONCE, "La médiathèque propose désormais des ateliers numériques pour les seniors : envoyer un courriel, faire une démarche administrative en ligne, partager des photos avec sa famille. Les ateliers sont gratuits, mais le nombre de places est limité.")],
    "À qui s'adressent ces ateliers ?", "Aux personnes âgées.", ["Aux enfants.", "Aux étudiants.", "Aux familles nombreuses."], "Ateliers « pour les seniors »."),
  ngheHoi([d("ash", DOI_THOAI, "L'appartement est très lumineux, mais il n'y a pas d'ascenseur, et c'est au cinquième étage."), d("coral", DOI_THOAI, "Ah… Avec la poussette du bébé, ça risque d'être compliqué.")],
    "Quel problème pose l'appartement pour la femme ?", "L'accès difficile.", ["Le manque de lumière.", "Le prix du loyer.", "La petite surface."], "Cinquième étage sans ascenseur, avec une poussette."),
  ngheHoi([d("onyx", RADIO, "Les ventes de vélos à assistance électrique ont doublé en trois ans. Les acheteurs sont souvent des personnes qui habitent à plus de dix kilomètres de leur travail et qui veulent éviter les embouteillages.")],
    "Qui achète surtout ces vélos ?", "Des personnes qui habitent loin de leur travail.", ["Des sportifs de haut niveau.", "Des touristes.", "Des étudiants."], "Personnes « qui habitent à plus de dix kilomètres de leur travail »."),
  /* B2 */
  ngheHoi([d("shimmer", RADIO, "De plus en plus de communes rurales rachètent le dernier café du village pour éviter sa fermeture. Pour les élus, il ne s'agit pas de faire du commerce, mais de préserver un lieu où les habitants se croisent et échangent des nouvelles.")],
    "Pourquoi les communes rachètent-elles ces cafés ?", "Pour garder un lieu de rencontre.", ["Pour gagner de l'argent.", "Pour attirer des touristes.", "Pour loger des habitants."], "« préserver un lieu où les habitants se croisent »."),
  ngheHoi([d("echo", RADIO, "Le jardinage urbain est à la mode. Mais attention : cultiver des légumes au bord d'une route très fréquentée n'est pas sans risque. Les spécialistes recommandent de faire analyser la terre et de laver soigneusement les récoltes.")],
    "Que conseillent les spécialistes ?", "Faire vérifier la qualité du sol.", ["Arrêter de jardiner en ville.", "Planter loin des écoles.", "Utiliser davantage d'engrais."], "« faire analyser la terre »."),
  ngheHoi([d("nova", RADIO, "Faut-il interdire les téléphones portables au collège ?"), d("onyx", RADIO, "J'y suis plutôt favorable. Mais l'interdiction ne réglera rien si on n'apprend pas aussi aux élèves à s'en servir de façon raisonnable, y compris à la maison.")],
    "Quel est l'avis de l'homme ?", "L'interdiction ne suffit pas sans éducation.", ["Il faut autoriser les téléphones.", "Les parents sont seuls responsables.", "Les élèves utilisent peu leur téléphone."], "« l'interdiction ne réglera rien si on n'apprend pas… »."),
  ngheHoi([d("coral", RADIO, "Dans cette entreprise lyonnaise, les salariés peuvent venir au bureau avec leur chien. Selon la direction, la mesure a réduit le stress, mais elle a surtout eu un effet inattendu : des collègues de services différents, qui ne se parlaient presque jamais, discutent désormais pendant les promenades.")],
    "Quel effet inattendu la mesure a-t-elle eu ?", "Rapprocher des collègues de services différents.", ["Augmenter la productivité.", "Attirer de nouveaux clients.", "Réduire les absences."], "Des collègues « qui ne se parlaient presque jamais » discutent."),
  ngheHoi([d("shimmer", RADIO, "Je suis viticultrice depuis vingt ans. Avec le réchauffement, nous vendangeons trois semaines plus tôt qu'autrefois. Certains collègues plantent déjà des cépages venus du sud de l'Europe, plus résistants à la chaleur.")],
    "Comment certains viticulteurs s'adaptent-ils ?", "En choisissant d'autres variétés de vigne.", ["En vendangeant plus tard.", "En s'installant plus au nord.", "En arrêtant le vin rouge."], "Ils plantent « des cépages venus du sud de l'Europe »."),
  ngheHoi([d("ash", RADIO, "La consigne des bouteilles en verre fait son retour dans plusieurs régions. Le client paie quelques centimes de plus, qu'il récupère en rapportant la bouteille, qui sera lavée et réutilisée. Les industriels restent prudents : il faut créer des circuits de collecte et de lavage qui n'existent plus.")],
    "Pourquoi les industriels restent-ils prudents ?", "Il faut organiser la collecte et le lavage.", ["Les clients refusent de payer plus.", "Le verre est trop cher.", "Les bouteilles cassent facilement."], "Il faut « créer des circuits de collecte et de lavage »."),
  ngheHoi([d("nova", DOI_THOAI, "Tu as choisi ton master ?"), d("echo", DOI_THOAI, "J'hésite entre un master très réputé à Paris et un autre, moins connu, à Nantes, mais avec un stage garanti en entreprise. Je crois que l'expérience concrète compte plus que le nom de l'université.")],
    "Qu'est-ce qui oriente le choix de l'étudiant ?", "La possibilité de faire un stage.", ["La réputation de l'université.", "La ville d'études.", "Le coût des études."], "« l'expérience concrète compte plus que le nom »."),
  /* C1 */
  ngheHoi([d("onyx", RADIO, "On présente souvent la lecture sur écran comme l'ennemie du livre. Les études sont plus nuancées : pour des textes courts, la compréhension est équivalente. C'est sur les textes longs et complexes que le papier conserve un avantage, sans doute parce qu'il favorise une lecture plus lente et un meilleur repérage dans le texte.")],
    "Que montrent les études ?", "Le papier reste préférable pour les textes complexes.", ["L'écran nuit toujours à la compréhension.", "Le papier n'a aucun avantage.", "Les textes courts se lisent mieux sur papier."], "Le papier garde un avantage « sur les textes longs et complexes »."),
  ngheHoi([d("coral", RADIO, "La gentrification de ce quartier ne s'est pas faite par la force, mais par petites touches : un café branché, une galerie, puis des loyers qui augmentent. Les anciens habitants ne sont pas expulsés ; ils partent d'eux-mêmes, faute de pouvoir suivre. Et c'est précisément ce qui rend le phénomène si difficile à combattre.")],
    "Pourquoi ce phénomène est-il difficile à combattre ?", "Parce que les départs semblent volontaires.", ["Parce que les habitants l'approuvent.", "Parce qu'il est très rapide.", "Parce que la loi l'encourage."], "Les habitants « partent d'eux-mêmes »."),
  ngheHoi([d("echo", RADIO, "Les zoos se présentent volontiers comme des arches de Noé modernes. Pourtant, rares sont les espèces réellement réintroduites dans la nature grâce à eux. Leur rôle principal reste l'éducation du public, ce qui n'est pas négligeable, à condition de ne pas le confondre avec la sauvegarde de la biodiversité.")],
    "Quel est, selon l'intervenant, le rôle principal des zoos ?", "Sensibiliser le public.", ["Réintroduire des espèces menacées.", "Soigner les animaux blessés.", "Financer la recherche."], "« Leur rôle principal reste l'éducation du public »."),
  ngheHoi([d("shimmer", RADIO, "L'essor du commerce en ligne n'a pas fait disparaître les magasins physiques ; il en a transformé la fonction. Ils deviennent des vitrines où l'on vient voir, toucher, essayer, avant de commander ailleurs. Les enseignes qui l'ont compris réduisent leurs stocks et misent sur le conseil.")],
    "Comment la fonction des magasins a-t-elle changé ?", "Ils servent surtout à découvrir les produits.", ["Ils vendent moins cher qu'en ligne.", "Ils disparaissent progressivement.", "Ils stockent davantage de produits."], "Ils deviennent « des vitrines où l'on vient voir, toucher, essayer »."),
  ngheHoi([d("nova", RADIO, "Contrairement à ce que l'on croit, la solitude touche fortement les jeunes adultes, notamment ceux qui viennent de quitter le domicile familial pour leurs études. Les réseaux sociaux donnent l'illusion d'un entourage nombreux, sans offrir la qualité de relation qui protège réellement de l'isolement.")],
    "Que dit-on des réseaux sociaux ?", "Ils donnent une impression trompeuse de compagnie.", ["Ils protègent de l'isolement.", "Ils poussent les jeunes à partir.", "Ils remplacent la famille."], "Ils « donnent l'illusion d'un entourage nombreux »."),
  /* C2 */
  ngheHoi([d("onyx", RADIO, "On aurait tort de réduire la politesse à un ensemble de conventions désuètes. Elle constitue une forme d'économie des relations : en ritualisant les échanges, elle épargne à chacun l'effort de renégocier sans cesse la distance qui convient, et désamorce bien des conflits avant même qu'ils n'éclatent.")],
    "Quelle fonction l'intervenant attribue-t-il à la politesse ?", "Elle facilite et apaise les relations.", ["Elle marque les différences sociales.", "Elle est une tradition dépassée.", "Elle empêche d'être sincère."], "Elle « désamorce bien des conflits »."),
  ngheHoi([d("coral", RADIO, "Cet architecte défend une idée à rebours de son époque : construire moins. Plutôt que de bâtir du neuf, il plaide pour la transformation de l'existant, bureaux vides, entrepôts, casernes, convaincu que le bâtiment le plus écologique est celui que l'on n'a pas besoin de construire.")],
    "Quelle conviction l'architecte exprime-t-il ?", "Il vaut mieux transformer l'existant que construire.", ["Il faut démolir les bâtiments anciens.", "Les matériaux écologiques suffisent.", "Les villes doivent s'étendre."], "« le bâtiment le plus écologique est celui que l'on n'a pas besoin de construire »."),
];

/* ═════════════ MAÎTRISE DES STRUCTURES DE LA LANGUE : 18 câu (2 A1, 3 A2, 4 B1, 5 B2, 3 C1, 1 C2) ═════════════ */
export const MS = [
  ms("Nous ____ français à la maison.", "parlons", ["parlez", "parlent", "parle"], "Avec « nous », le verbe se termine par -ons."),
  ms("J'habite ____ Marseille depuis deux ans.", "à", ["en", "au", "dans"], "On utilise « à » devant un nom de ville."),
  ms("Hier, elle ____ au cinéma avec ses amies.", "est allée", ["a allé", "va", "allait aller"], "« Aller » se conjugue avec « être » au passé composé, accordé au féminin."),
  ms("Tu as vu Marie ? Oui, je ____ ai vue hier.", "l'", ["la", "lui", "le"], "Complément d'objet direct féminin devant une voyelle : « l' »."),
  ms("Quand j'étais petit, je ____ à la campagne.", "vivais", ["ai vécu", "vivrai", "vis"], "L'imparfait exprime une habitude ou une situation dans le passé."),
  ms("C'est le livre ____ je t'ai parlé hier.", "dont", ["que", "où", "lequel"], "« Parler de » : le pronom relatif est « dont »."),
  ms("Si j'avais plus de temps, je ____ plus souvent.", "voyagerais", ["voyagerai", "voyage", "voyageais"], "Si + imparfait, conditionnel présent."),
  ms("Il faut que tu ____ tes papiers avant lundi.", "fasses", ["fais", "feras", "faisais"], "« Il faut que » est suivi du subjonctif."),
  ms("Elle a réussi l'examen ____ elle n'avait pas beaucoup révisé.", "alors qu'", ["parce qu'", "puisqu'", "afin qu'"], "« Alors que » exprime une opposition."),
  ms("Je regrette qu'il ____ partir si tôt hier soir.", "ait dû", ["a dû", "devra", "devait"], "« Regretter que » demande le subjonctif ; l'action est passée : subjonctif passé."),
  ms("____ la pluie, le match a été maintenu.", "Malgré", ["Bien que", "Grâce à", "Pourtant"], "« Malgré » est suivi d'un nom et exprime la concession."),
  ms("Les documents ____ vous m'avez envoyés sont incomplets.", "que", ["dont", "lesquels", "qui"], "« Envoyer quelque chose » : complément direct, pronom « que »."),
  ms("Il m'a demandé si je ____ venir le lendemain.", "pouvais", ["peux", "pourrai", "puisse"], "Discours indirect au passé : le présent devient imparfait."),
  ms("Une fois les travaux ____, nous emménagerons.", "terminés", ["terminant", "terminer", "termineront"], "« Une fois » + participe passé accordé avec le nom."),
  ms("Il est parti sans que personne ne s'en ____ compte.", "rende", ["rend", "rendait", "rendra"], "« Sans que » est suivi du subjonctif."),
  ms("____ soient ses arguments, il ne me convaincra pas.", "Quels que", ["Quelques", "Quoique", "Quel que"], "« Quel que » + être au subjonctif, accordé avec « arguments » (masculin pluriel)."),
  ms("Le projet ____ on avait tant parlé a finalement été abandonné.", "dont", ["auquel", "lequel", "où"], "« Parler d'un projet » : « dont »."),
  ms("Pour peu qu'il ____ le moindre effort, il réussirait.", "fasse", ["fait", "ferait", "a fait"], "« Pour peu que » exprime une condition minimale et est suivi du subjonctif."),
];

/* ═════════════ COMPRÉHENSION ÉCRITE : 29 câu ═════════════ */
export const CE = [
  doc(["Chère Julie,", "Je suis à la plage avec mes parents. Il fait beau et chaud. Je rentre dimanche.", "Bisous, Emma"], "Où est Emma ?", "Au bord de la mer.", ["À la montagne.", "À la maison.", "À l'école."], "« Je suis à la plage »."),
  doc(["<strong>Boulangerie Martin</strong>", "Ouvert de 7 h à 19 h.", "Fermé le mercredi."], "Quel jour la boulangerie est-elle fermée ?", "Le mercredi.", ["Le dimanche.", "Le lundi.", "Le samedi."], "« Fermé le mercredi »."),
  doc(["Maman,", "Je mange chez Lucas ce soir. Je rentre à 21 h.", "Léo"], "Que fait Léo ce soir ?", "Il dîne chez un ami.", ["Il va au restaurant.", "Il reste à la maison.", "Il fait du sport."], "« Je mange chez Lucas »."),
  doc(["Bonjour,", "Je voudrais réserver une table pour quatre personnes samedi soir à 20 h. C'est pour l'anniversaire de mon père. Pouvez-vous me confirmer ?", "Merci, Karine Dubois"], "Pourquoi Karine écrit-elle ?", "Pour réserver un repas.", ["Pour annuler une réservation.", "Pour inviter son père.", "Pour commander un gâteau."], "« Je voudrais réserver une table »."),
  doc(["<strong>Mairie de Villeneuve : collecte des encombrants</strong>", "Jeudi 6 juin. Déposez vos vieux meubles devant votre immeuble la veille au soir.", "Les appareils électriques ne sont pas acceptés."], "Qu'est-ce qui est interdit ?", "Déposer des appareils électriques.", ["Déposer des meubles.", "Sortir les objets le mercredi soir.", "Déposer les objets devant l'immeuble."], "« Les appareils électriques ne sont pas acceptés »."),
  doc(["Salut Nora,", "Je ne peux pas venir au cours de danse mardi : j'ai un rendez-vous chez le dentiste. Tu peux le dire au professeur ? Merci !", "Inès"], "Que demande Inès à Nora ?", "De prévenir le professeur.", ["De l'accompagner chez le dentiste.", "De changer de cours.", "De danser avec elle."], "« Tu peux le dire au professeur ? »"),
  doc(["<strong>Cherche baby-sitter</strong>", "Pour deux enfants (5 et 8 ans), le mercredi après-midi, à Montpellier centre.", "Aller chercher les enfants à l'école et les aider à faire leurs devoirs. 12 € de l'heure."], "Que doit faire la baby-sitter ?", "Aller chercher les enfants et les aider pour les devoirs.", ["Préparer le dîner.", "Garder les enfants le soir.", "Faire le ménage."], "« Aller chercher les enfants à l'école et les aider à faire leurs devoirs »."),
  doc(["Chers résidents,", "L'eau sera coupée mardi de 9 h à 12 h pour des travaux dans l'immeuble. Pensez à faire des réserves.", "Le gardien"], "Que se passera-t-il mardi matin ?", "Il n'y aura pas d'eau.", ["Il n'y aura pas d'électricité.", "L'ascenseur sera en panne.", "Le gardien sera absent."], "« L'eau sera coupée mardi de 9 h à 12 h »."),
  /* B1 */
  doc("La ville de Bordeaux lance un service de location de vélos à la journée pour les touristes. Les vélos sont disponibles dans dix stations proches des monuments. Le tarif comprend un casque et une carte des pistes cyclables.",
    "Qu'est-ce qui est inclus dans le prix ?", "Un casque et une carte.", ["Un guide touristique.", "L'entrée des monuments.", "Une assurance."], "« Le tarif comprend un casque et une carte »."),
  doc(["Madame, Monsieur,", "Suite à votre réclamation, nous vous informons que votre facture d'électricité du mois de mars contenait une erreur. Le montant payé en trop, soit 45 euros, sera déduit de votre prochaine facture.", "Le service clients"],
    "Que va faire l'entreprise ?", "Réduire la prochaine facture.", ["Rembourser par chèque.", "Changer le compteur.", "Annuler le contrat."], "Le trop-payé « sera déduit de votre prochaine facture »."),
  doc("L'association Les Amis du livre recherche des bénévoles pour lire des histoires aux enfants hospitalisés, une heure par semaine. Aucune expérience n'est demandée, mais une formation de deux heures est obligatoire avant de commencer.",
    "Que doivent faire les bénévoles avant de commencer ?", "Suivre une formation.", ["Avoir de l'expérience.", "Travailler à l'hôpital.", "Écrire des histoires."], "« une formation de deux heures est obligatoire »."),
  doc(["Chère Valérie,", "Nous voulions passer nos vacances en Bretagne, mais la maison que nous avions louée a été endommagée par une tempête. Le propriétaire nous a proposé un autre logement en Normandie, où nous sommes depuis lundi. Nous irons peut-être en Bretagne à la Toussaint.", "Je t'embrasse, Hélène"],
    "Où Hélène passe-t-elle ses vacances ?", "En Normandie.", ["En Bretagne.", "Chez Valérie.", "Chez le propriétaire."], "« un autre logement en Normandie, où nous sommes depuis lundi »."),
  doc("Le collège Jean-Moulin teste cette année la « journée sans cartable » : un vendredi par mois, les élèves participent à des ateliers (théâtre, jardinage, sciences) au lieu des cours habituels. Les professeurs remarquent que certains élèves en difficulté se révèlent dans ces activités.",
    "Qu'observent les professeurs ?", "Des élèves en difficulté montrent d'autres talents.", ["Les élèves sont moins fatigués.", "Les notes augmentent.", "Les parents participent davantage."], "Certains élèves en difficulté « se révèlent »."),
  doc(["<strong>Camping Les Pins : règlement</strong>", "Les barbecues sont interdits dans tout le camping en raison du risque d'incendie.", "Un espace de cuisine collective est à votre disposition près de l'accueil."],
    "Que propose le camping ?", "Un lieu commun pour cuisiner.", ["Des barbecues électriques.", "Un restaurant.", "Des repas livrés."], "« Un espace de cuisine collective est à votre disposition »."),
  doc("Selon un sondage, 60 % des Français disent faire attention à l'origine des produits qu'ils achètent. Mais au moment de passer en caisse, le prix reste le premier critère de choix pour la majorité d'entre eux.",
    "Que révèle ce sondage ?", "Le prix compte plus que l'origine au moment d'acheter.", ["Les Français achètent surtout des produits locaux.", "L'origine des produits ne les intéresse pas.", "Les produits locaux sont moins chers."], "« le prix reste le premier critère de choix »."),
  /* B2 */
  doc("Les librairies indépendantes résistent mieux que prévu à la concurrence des grandes plateformes. Leur atout : le conseil personnalisé et l'organisation de rencontres avec des auteurs, qui transforment la boutique en lieu de vie. Leur fragilité demeure cependant économique, la marge réalisée sur un livre restant très faible.",
    "Quelle est la principale fragilité de ces librairies ?", "Leur faible rentabilité.", ["Le manque de conseils.", "Le désintérêt des auteurs.", "L'absence de clients."], "« la marge réalisée sur un livre restant très faible »."),
  doc("Faut-il supprimer le redoublement ? Ses partisans y voient une seconde chance. Ses opposants rappellent que les études montrent rarement un bénéfice durable, et soulignent le coût, pour l'élève, de la séparation d'avec ses camarades.",
    "Quel argument avancent les opposants au redoublement ?", "Ses effets positifs sont rarement durables.", ["Il coûte cher à l'État.", "Les élèves le refusent.", "Les professeurs ne l'appliquent pas."], "« les études montrent rarement un bénéfice durable »."),
  doc("Depuis le début de l'année, une jeune entreprise nantaise propose de louer des vêtements pour enfants plutôt que de les acheter. Les parents reçoivent un colis adapté à la taille de l'enfant et le renvoient quand celui-ci a grandi. Le service séduit surtout les familles soucieuses de réduire leurs déchets.",
    "Qui est surtout intéressé par ce service ?", "Les familles qui veulent limiter les déchets.", ["Les familles nombreuses.", "Les parents pressés.", "Les familles aisées."], "Il séduit « les familles soucieuses de réduire leurs déchets »."),
  doc("La fermeture de la maternité de cette petite ville inquiète les habitants : les futures mères devront désormais faire une heure de route pour accoucher. L'agence régionale de santé justifie sa décision par le faible nombre de naissances et le manque de médecins spécialistes.",
    "Comment l'agence justifie-t-elle la fermeture ?", "Par le manque d'activité et de spécialistes.", ["Par le coût des travaux.", "Par la demande des habitants.", "Par l'ouverture d'un nouvel hôpital."], "« le faible nombre de naissances et le manque de médecins spécialistes »."),
  doc("Le tourisme de masse menace certains sites naturels. Dans les calanques près de Marseille, l'accès à une plage très fréquentée est désormais limité en été grâce à un système de réservation gratuite en ligne. L'objectif n'est pas de faire payer les visiteurs, mais de protéger une végétation piétinée chaque été.",
    "Pourquoi l'accès à la plage est-il limité ?", "Pour préserver la nature.", ["Pour gagner de l'argent.", "Pour la sécurité des baigneurs.", "Pour réduire le bruit."], "« protéger une végétation piétinée »."),
  doc("Les entreprises qui recrutent des seniors constatent souvent une meilleure stabilité de leurs équipes. Pourtant, après cinquante-cinq ans, retrouver un emploi reste difficile : les recruteurs craignent, à tort selon de nombreuses études, un manque d'adaptation aux nouvelles technologies.",
    "Que craignent les recruteurs ?", "Que les seniors maîtrisent mal les outils numériques.", ["Que les seniors coûtent trop cher.", "Qu'ils restent peu de temps dans l'entreprise.", "Qu'ils soient souvent malades."], "« un manque d'adaptation aux nouvelles technologies »."),
  doc("La généralisation des caisses automatiques dans les supermarchés divise. Les enseignes mettent en avant la rapidité ; les syndicats dénoncent la suppression d'emplois ; et certains clients, notamment âgés, regrettent la disparition d'un contact humain parfois unique dans leur journée.",
    "Que regrettent certains clients ?", "La perte d'échanges humains.", ["La lenteur des caisses.", "La hausse des prix.", "La fermeture des magasins."], "La disparition d'« un contact humain »."),
  /* C1 */
  doc("Les neurosciences ont mis en évidence l'importance du sommeil dans la consolidation des apprentissages. Pendant la nuit, le cerveau rejoue en quelque sorte les informations de la journée et trie ce qui mérite d'être conservé. Réviser toute la nuit avant un examen apparaît dès lors comme une stratégie contre-productive.",
    "Que conclut le texte sur les révisions de nuit ?", "Elles nuisent à la mémorisation.", ["Elles sont efficaces la veille d'un examen.", "Elles améliorent le sommeil.", "Elles sont indispensables."], "Stratégie « contre-productive » : le sommeil consolide les apprentissages."),
  doc("La médiation animale se développe dans les établissements pour personnes âgées. La présence d'un chien ou d'un lapin ne guérit évidemment aucune maladie, mais elle stimule la parole et l'attention de résidents qui sortaient peu de leur réserve, et apaise les tensions au moment des soins.",
    "Quel bénéfice attribue-t-on à la médiation animale ?", "Elle favorise la communication des résidents.", ["Elle soigne certaines maladies.", "Elle remplace une partie du personnel.", "Elle réduit les coûts."], "Elle « stimule la parole et l'attention »."),
  doc("La mise en scène, d'une sobriété remarquable, laisse toute la place au texte et aux comédiens. On regrettera seulement que la seconde partie, étirée en longueur, affaiblisse la tension patiemment construite pendant la première heure.",
    "Quelle critique est formulée sur ce spectacle ?", "La seconde partie est trop longue.", ["La mise en scène est trop chargée.", "Les comédiens jouent mal.", "Le texte est faible."], "« la seconde partie, étirée en longueur »."),
  doc("Les plateformes de location touristique ont transformé l'économie de nombreux centres historiques. Si elles procurent des revenus complémentaires aux propriétaires, elles réduisent l'offre de logements à l'année et contribuent à vider certains quartiers de leurs habitants permanents, au point que plusieurs villes ont décidé de limiter le nombre de nuitées autorisées.",
    "Pourquoi certaines villes limitent-elles ces locations ?", "Pour préserver les logements des habitants.", ["Pour augmenter les impôts.", "Pour protéger les hôtels.", "Pour réduire le tourisme étranger."], "Elles « réduisent l'offre de logements à l'année »."),
  doc("La chercheuse souligne que le mot « résilience », à force d'être employé à tout propos, a perdu de sa précision. Appliqué aux individus comme aux villes ou aux économies, il tend à faire peser sur chacun la responsabilité de s'adapter aux crises, plutôt qu'à interroger les causes de celles-ci.",
    "Que reproche la chercheuse à l'usage de ce mot ?", "Il détourne l'attention des causes des crises.", ["Il est trop technique.", "Il ne s'applique qu'aux individus.", "Il décrit mal les villes."], "Il fait peser l'adaptation sur chacun « plutôt qu'à interroger les causes »."),
  /* C2 */
  doc("Le progrès technique n'est pas neutre : chaque outil porte en lui une certaine conception de l'existence. Le GPS, en nous épargnant l'effort de nous orienter, nous dispense aussi de cette attention au paysage par laquelle on finissait par habiter un lieu. Ce que nous gagnons en efficacité, nous le perdons peut-être en familiarité avec le monde.",
    "Quelle idée l'auteur développe-t-il ?", "Nos outils transforment notre rapport au monde.", ["Le GPS est devenu indispensable.", "La technique est toujours neutre.", "Il faut refuser le progrès."], "« chaque outil porte en lui une certaine conception de l'existence »."),
  doc("L'ironie, disait-on autrefois, est la politesse du désespoir. Il faut sans doute nuancer : bien maniée, elle n'est ni fuite ni mépris, mais une manière de tenir le réel à distance juste assez pour le penser, sans se laisser écraser par lui ni prétendre le dominer.",
    "Comment l'auteur conçoit-il l'ironie ?", "Comme une distance qui permet de réfléchir.", ["Comme une forme de mépris.", "Comme une fuite devant la réalité.", "Comme un moyen de dominer autrui."], "« une manière de tenir le réel à distance juste assez pour le penser »."),
];

/* ═════════════ EXPRESSION ÉCRITE ═════════════ */
export const PE = {
  consigne: p("<strong>Expression écrite : 60 minutes, 3 tâches.</strong> Respectez le nombre de mots demandé pour chaque tâche."),
  questions: [
    { type: "open", prompt: "Tâche 1 (60 mots minimum, 120 mots maximum)\nVous organisez un repas entre voisins dans la cour de votre immeuble. Écrivez un message aux habitants pour les inviter. Précisez la date, l'heure, le lieu et ce que chacun peut apporter." },
    { type: "open", prompt: "Tâche 2 (120 mots minimum, 150 mots maximum)\nVous venez de déménager dans une nouvelle ville. Dans un courriel à un(e) ami(e), décrivez votre nouveau quartier et dites ce que vous en pensez." },
    { type: "open", prompt: "Tâche 3 (120 mots minimum, 180 mots maximum)\nFaut-il rendre les transports en commun gratuits ?\n\nDocument 1 : Plusieurs villes françaises ont rendu leurs bus gratuits. Les élus se félicitent d'une hausse importante de la fréquentation et d'un centre-ville moins encombré. Pour les familles modestes, la mesure représente aussi une économie non négligeable à la fin du mois.\n\nDocument 2 : La gratuité a un coût : ce que les voyageurs ne paient plus, ce sont les impôts locaux qui le financent. Certains experts rappellent aussi que les nouveaux passagers sont souvent d'anciens piétons ou cyclistes, et non des automobilistes. Mieux vaudrait, selon eux, investir dans la fréquence et la qualité du service.\n\nVous écrivez un article pour le site d'un journal. Dans une première partie (40 à 60 mots), présentez les deux points de vue. Dans une seconde partie (80 à 120 mots), donnez votre opinion en l'illustrant d'exemples." },
  ],
};

/* ═════════════ EXPRESSION ORALE ═════════════ */
const S = (ma, html) => ({ ma, html: p(html) });
export const PO = {
  consigne: p("<strong>Expression orale : 12 minutes environ, 3 tâches.</strong>",
    "<strong>Tâche 1. Entretien dirigé</strong> (2 minutes, sans préparation) : présentez-vous. Parlez de vous, de votre famille, de votre travail ou de vos études, de vos loisirs et de vos projets.",
    "<strong>Tâche 2. Exercice en interaction</strong> (5 minutes 30, dont 2 minutes de préparation) : l'examinateur joue un rôle, vous lui posez des questions.",
    "<strong>Tâche 3. Expression d'un point de vue</strong> (4 minutes 30, sans préparation) : vous donnez votre opinion sur un sujet et vous la justifiez."),
  bocTham: { chuanBi: 2, phan: [
    { ten: "Tâche 2. Exercice en interaction (5 min 30)", cachLam: "Posez des questions à l'examinateur pour obtenir les informations dont vous avez besoin.", soRut: 1, sujets: [
      S("1", "Je suis votre ami(e). Je viens de rentrer d'un voyage en Corse. Vous voulez y aller cet été. Posez-moi des questions (transport, logement, activités, budget, etc.)."),
      S("2", "Je travaille à la mairie. Vous voulez inscrire votre enfant au centre de loisirs pendant les vacances. Posez-moi des questions (âge, horaires, activités, tarifs, etc.)."),
      S("3", "Je suis votre voisin(e). Je vends ma voiture. Vous êtes intéressé(e). Posez-moi des questions (prix, état, kilométrage, entretien, etc.)."),
      S("4", "Je suis bénévole dans une association d'aide aux devoirs. Vous voulez devenir bénévole. Posez-moi des questions (public, horaires, formation, matières, etc.).")] },
    { ten: "Tâche 3. Expression d'un point de vue (4 min 30)", cachLam: "Donnez votre opinion et justifiez-la avec des arguments et des exemples.", soRut: 1, sujets: [
      S("A", "Faut-il interdire la publicité destinée aux enfants ?"),
      S("B", "Faudrait-il consacrer plus d'heures au sport à l'école ?"),
      S("C", "Est-il préférable de voyager seul ou en groupe ? Pourquoi ?"),
      S("D", "Les réseaux sociaux rapprochent-ils ou éloignent-ils les gens ?")] },
  ] },
};
