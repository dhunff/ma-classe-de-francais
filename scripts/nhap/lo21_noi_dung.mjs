/* Lô 21 (19/10): NỘI DUNG 2 đề thi thử mới (A1 Đề 3, C1 Đề 3), để mỗi trình độ có 3 đề.
 *
 * TOÀN BỘ do FRACILE soạn: tài liệu đời thường A1, kịch bản nghe, bài đọc C1 và
 * tài liệu nói C1. KHÔNG trích báo, KHÔNG số liệu, nguồn hay tên người thật trình
 * bày như thật (quy tắc 1). Bài đọc C1 ghi rõ « Texte rédigé pour l'entraînement ».
 * Không dùng dấu gạch dài (quy tắc 7). Máy dựng (âm thanh + SQL) ở lo21_de_moi.mjs. */

let dem = 0;
export const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261019;
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

const CHAM = "Parle en français de France, lentement et clairement, pour des apprenants débutants.";
const RADIO = "Parle en français de France, comme un journaliste de radio, débit naturel et posé.";
const KHACH = "Parle en français de France, comme une personne interviewée à la radio, débit naturel.";

/* ══════════════════════════ A1 · Đề 3 ══════════════════════════ */
export const A1 = { level: "A1", ten: "DELF A1 · Đề 3", kieuNghe: "a",
  CO: [
    { ten: "a1-de3-co1", tieuDe: "Écoute A1 · Đề 3 · Exercice 1 : un message de Marc", gioiThieu: "Vous écoutez un message sur votre répondeur.",
      doan: [d("echo", CHAM, "Bonjour, c'est Marc. Vendredi soir, je vais au cinéma avec Paul. Le film commence à huit heures et demie. On se retrouve devant le cinéma à huit heures. Le billet coûte neuf euros. Après le film, on mange une pizza. Tu viens avec nous ? Envoie-moi un message. Salut !")],
      cau: [
        qcm("Marc va au cinéma…", "vendredi soir", ["samedi soir", "vendredi matin"], "« Vendredi soir, je vais au cinéma »."),
        qcm("Le film commence à…", "20 h 30", ["20 h", "18 h 30"], "« Le film commence à huit heures et demie »."),
        qcm("Le billet coûte…", "9 euros", ["19 euros", "5 euros"], "« Le billet coûte neuf euros »."),
        qcm("Après le film, ils vont…", "manger une pizza", ["danser", "rentrer à la maison"], "« Après le film, on mange une pizza »."),
      ] },
    { ten: "a1-de3-co2", tieuDe: "Écoute A1 · Đề 3 · Exercice 2 : à l'aéroport", gioiThieu: "Vous êtes à l'aéroport. Vous entendez cette annonce.",
      doan: [d("shimmer", CHAM, "Mesdames et messieurs, le vol pour Rome de onze heures quarante part de la porte douze. L'embarquement commence à onze heures. Préparez votre passeport et votre carte d'embarquement. Merci.")],
      cau: [
        qcm("L'avion va à…", "Rome", ["Londres", "Madrid"], "« le vol pour Rome »."),
        qcm("L'avion part de la porte…", "12", ["2", "20"], "« part de la porte douze »."),
        qcm("L'embarquement commence à…", "11 h", ["11 h 40", "10 h"], "« L'embarquement commence à onze heures »."),
      ] },
    { ten: "a1-de3-co3", tieuDe: "Écoute A1 · Đề 3 · Exercice 3 : à l'école de langues", gioiThieu: "Vous êtes à l'école de langues. Vous entendez cette annonce.",
      doan: [d("sage", CHAM, "Bonjour à tous ! Aujourd'hui, le cours de français est dans la salle quatre, au premier étage. Le professeur arrive à dix heures. La cafétéria est ouverte de neuf heures à quinze heures. Et n'oubliez pas : jeudi, il n'y a pas de cours. Bonne journée !")],
      cau: [
        qcm("Le cours de français est dans la salle…", "4", ["14", "1"], "« dans la salle quatre »."),
        qcm("La salle est…", "au premier étage", ["au deuxième étage", "au rez-de-chaussée"], "« au premier étage »."),
        qcm("La cafétéria ferme à…", "15 h", ["9 h", "13 h"], "« de neuf heures à quinze heures »."),
        qcm("Il n'y a pas de cours…", "jeudi", ["mardi", "vendredi"], "« jeudi, il n'y a pas de cours »."),
      ] },
    { ten: "a1-de3-co4", tieuDe: "Écoute A1 · Đề 3 · Exercice 4 : la famille d'Hugo", gioiThieu: "Hugo parle de sa famille.",
      doan: [d("onyx", CHAM, "Je m'appelle Hugo, j'ai quinze ans. J'habite à Nantes avec mes parents et ma petite sœur, Emma. Mon père est cuisinier. Ma mère est professeure de musique. Nous avons un chat noir, il s'appelle Pilou. Le week-end, nous faisons du vélo ensemble.")],
      cau: [
        qcm("Hugo a…", "15 ans", ["13 ans", "50 ans"], "« j'ai quinze ans »."),
        qcm("Hugo habite à…", "Nantes", ["Nice", "Nancy"], "« J'habite à Nantes »."),
        qcm("Le père d'Hugo est…", "cuisinier", ["professeur", "médecin"], "« Mon père est cuisinier »."),
        qcm("Le week-end, la famille…", "fait du vélo", ["va à la piscine", "regarde la télévision"], "« Le week-end, nous faisons du vélo ensemble »."),
      ] },
  ],
  CE: [
    { tieuDe: "Lecture A1 · Đề 3 · Exercice 1 : un courriel de Nadia", consigne: "<p>Vous recevez ce courriel. Lisez le document puis répondez aux questions.</p>",
      readingText: p("<strong>De :</strong> Nadia", "<strong>Objet :</strong> Promenade samedi", "Salut !", "Samedi, je fais une promenade à la montagne avec ma cousine. On part en bus à huit heures, de la place de la gare. On rentre le soir, vers dix-huit heures. Tu viens ? Prends des chaussures de marche, une bouteille d'eau et un sandwich. Réponds-moi avant vendredi !", "À samedi,<br>Nadia"),
      cau: [
        qcm("Samedi, Nadia va…", "à la montagne", ["à la plage", "au musée"], "« je fais une promenade à la montagne »."),
        qcm("Elles partent…", "en bus, à 8 h", ["en train, à 8 h", "en voiture, à 18 h"], "« On part en bus à huit heures »."),
        qcm("Le départ est…", "place de la gare", ["devant la mairie", "chez Nadia"], "« de la place de la gare »."),
        qcm("Vous devez prendre…", "des chaussures de marche", ["un maillot de bain", "un livre"], "« Prends des chaussures de marche »."),
      ] },
    { tieuDe: "Lecture A1 · Đề 3 · Exercice 2 : un cours de cuisine", consigne: "<p>Vous lisez cette affiche. Lisez le document puis répondez aux questions.</p>",
      readingText: p("<strong>COURS DE CUISINE FRANÇAISE</strong>", "Tous les mardis, de 18 h à 20 h.", "Au centre culturel, 5 rue Pasteur.", "Prix : 15 euros par cours. Gratuit pour les étudiants.", "Ce mois-ci : la crêpe et la soupe à l'oignon.", "Inscription à l'accueil ou par téléphone."),
      cau: [
        qcm("Le cours a lieu…", "le mardi", ["le jeudi", "le samedi"], "« Tous les mardis »."),
        qcm("Le cours dure…", "2 heures", ["1 heure", "3 heures"], "« de 18 h à 20 h »."),
        qcm("Pour les étudiants, le cours est…", "gratuit", ["à 15 euros", "à 5 euros"], "« Gratuit pour les étudiants »."),
        qcm("Ce mois-ci, on prépare…", "des crêpes et une soupe", ["une pizza", "un gâteau au chocolat"], "« la crêpe et la soupe à l'oignon »."),
      ] },
    { tieuDe: "Lecture A1 · Đề 3 · Exercice 3 : un message de la voisine", consigne: "<p>Vous lisez ce message. Lisez le document puis répondez aux questions.</p>",
      readingText: p("Bonjour Lucas,", "Je pars en vacances demain, pour une semaine. Est-ce que tu peux donner à manger à mon chat, le matin et le soir ? La clé est sous le pot de fleurs, devant la porte. Merci beaucoup ! Je te rapporte des chocolats de Belgique.", "Martine, appartement 3"),
      cau: [
        qcm("Martine part en vacances pour…", "une semaine", ["un mois", "un week-end"], "« pour une semaine »."),
        qcm("Martine demande à Lucas de…", "donner à manger à son chat", ["arroser ses fleurs", "garder sa voiture"], "« donner à manger à mon chat »."),
        qcm("La clé est…", "sous le pot de fleurs", ["chez le voisin", "dans la boîte aux lettres"], "« La clé est sous le pot de fleurs »."),
        qcm("Martine va rapporter…", "des chocolats", ["des fleurs", "du fromage"], "« Je te rapporte des chocolats de Belgique »."),
      ] },
  ],
  PE: { tieuDe: "Production écrite A1 · Đề 3", consigne: "<p><strong>Production écrite : 30 minutes.</strong></p>",
    questions: [
      { type: "open", prompt: "Exercice 1 : vous vous inscrivez à un cours de français. Complétez la fiche : nom, prénom, âge, nationalité, téléphone, langues parlées, jours et heures disponibles." },
      { type: "open", prompt: "Exercice 2 : vous invitez un ami à votre anniversaire. Vous lui écrivez un message : le jour, l'heure, le lieu et ce qu'il doit apporter. (40 mots minimum)" },
    ] },
  PO: { tieuDe: "Production orale A1 · Đề 3",
    consigne: p("<strong>Production orale : 5 à 7 minutes.</strong> 10 minutes de préparation pour les parties 2 et 3.", "<strong>1. Entretien dirigé</strong> (environ 1 minute, sans préparation) : présentez-vous. Votre nom, votre âge, votre famille, vos loisirs.", "Pour les parties 2 et 3, vous tirez au sort une carte pour chaque partie."),
    bocTham: { chuanBi: 10, phan: [
      { ten: "2. Échange d'informations (environ 2 minutes)", cachLam: "Posez des questions à l'examinateur à partir des mots de la carte.", soRut: 1, sujets: [
        S("A", "âge • quartier • petit déjeuner • couleur • chanteur • dimanche"), S("B", "famille • travail • plat • été • voiture • fête"),
        S("C", "sœur • ordinateur • boisson • hiver • livre • jardin"), S("D", "pays • matin • sport • chien • restaurant • cadeau")] },
      { ten: "3. Dialogue simulé (environ 2 minutes)", cachLam: "Jouez la situation. L'examinateur joue l'autre personne.", soRut: 1, sujets: [
        S("1", "<strong>À la boulangerie.</strong> Vous achetez du pain et des croissants pour quatre personnes. Vous demandez le prix et vous payez."),
        S("2", "<strong>À la gare.</strong> Vous achetez un billet aller-retour pour Lyon. Vous demandez l'heure du train et le prix."),
        S("3", "<strong>Dans un magasin de vêtements.</strong> Vous cherchez un tee-shirt pour un ami. Vous demandez la taille, la couleur et le prix."),
        S("4", "<strong>À l'hôtel.</strong> Vous réservez une chambre pour deux nuits. Vous demandez le prix et l'heure du petit déjeuner.")] },
    ] } },
};

/* ══════════════════════════ C1 · Đề 3 ══════════════════════════ */
export const C1 = { level: "C1", ten: "DALF C1 · Đề 3", kieuNghe: "b2",
  CO: [
    { ten: "c1-de3-co1", hai: true, tieuDe: "Écoute C1 · Đề 3 · Exercice 1 : réparer plutôt que jeter", gioiThieu: "Vous allez entendre un entretien radiophonique sur la réparation des objets.",
      doan: [d("sage", RADIO, "Un grille-pain qui tombe en panne, un téléphone dont la batterie faiblit, une machine à laver qui fuit : trop souvent, le premier réflexe est de racheter. Pourtant, les ateliers de réparation se multiplient dans les quartiers. Faut-il y voir une simple mode ou un vrai changement de société ? J'en parle avec une économiste spécialiste de la consommation. Bonjour."),
        d("shimmer", KHACH, "Bonjour. Je dirais que ce n'est ni tout à fait une mode, ni encore un changement de société. C'est un signal. Pendant longtemps, réparer était une évidence, presque une nécessité économique. Puis les prix des objets neufs ont baissé, ceux de la main-d'œuvre ont augmenté, et la réparation est devenue, pour beaucoup de ménages, plus chère que le remplacement. Ce que l'on observe aujourd'hui, c'est une remise en question de ce calcul."),
        d("sage", RADIO, "Une remise en question pour quelles raisons ?"),
        d("shimmer", KHACH, "Il y a d'abord une prise de conscience écologique : on sait désormais que l'essentiel de l'impact d'un appareil se situe au moment de sa fabrication, pas de son utilisation. Prolonger sa durée de vie, c'est donc éviter une nouvelle fabrication. Mais je ne voudrais pas idéaliser : il y a aussi une dimension très pragmatique. Quand le pouvoir d'achat se tend, garder plus longtemps ce qu'on possède devient une stratégie."),
        d("sage", RADIO, "Et pourtant, beaucoup de gens disent que réparer, c'est compliqué."),
        d("shimmer", KHACH, "Ils ont raison, et c'est là que la responsabilité des fabricants est engagée. Des vis spéciales, des pièces collées au lieu d'être vissées, des pièces détachées introuvables ou vendues à un prix dissuasif : tout cela n'est pas une fatalité technique, ce sont des choix de conception. Un objet peut être pensé dès le départ pour être démonté. Ce qui manque, ce n'est pas la compétence, c'est l'incitation."),
        d("sage", RADIO, "Les ateliers de quartier peuvent-ils changer la donne ?"),
        d("shimmer", KHACH, "Ils jouent un rôle précieux, mais pas forcément celui qu'on croit. Leur intérêt n'est pas tant le nombre d'objets sauvés que la transmission d'un savoir-faire et d'une confiance : on y découvre qu'un objet n'est pas une boîte noire. Cela dit, on ne peut pas faire reposer toute la transition sur la bonne volonté de bénévoles. Sans règles claires imposées aux producteurs, ces initiatives resteront marginales.")],
      cau: [
        qcm("Comment l'économiste qualifie-t-elle le développement des ateliers de réparation ?", "comme un signal", ["comme une simple mode", "comme un changement de société accompli"], "« ce n'est ni tout à fait une mode, ni encore un changement de société. C'est un signal »."),
        qcm("Pourquoi la réparation est-elle devenue moins fréquente autrefois ?", "Réparer coûtait plus cher que remplacer.", ["Les objets étaient plus solides.", "Les réparateurs avaient disparu."], "« la réparation est devenue… plus chère que le remplacement »."),
        qcm("Selon l'économiste, l'impact écologique d'un appareil se situe surtout…", "au moment de sa fabrication", ["pendant son utilisation", "au moment de son recyclage"], "« l'essentiel de l'impact d'un appareil se situe au moment de sa fabrication »."),
        qcm("Quelle autre raison, plus pragmatique, explique le retour de la réparation ?", "la baisse du pouvoir d'achat", ["la mode du fait main", "l'obligation légale"], "« Quand le pouvoir d'achat se tend, garder plus longtemps ce qu'on possède devient une stratégie »."),
        qcm("Que veut dire l'économiste par « je ne voudrais pas idéaliser » ?", "Les motivations ne sont pas seulement écologiques.", ["La réparation n'a aucun intérêt.", "Les consommateurs sont égoïstes."], "Elle nuance : il y a aussi une dimension économique."),
        qcm("Selon elle, les vis spéciales et les pièces collées sont…", "des choix de conception", ["une fatalité technique", "des exigences de sécurité"], "« ce n'est pas une fatalité technique, ce sont des choix de conception »."),
        qcm("D'après l'économiste, ce qui manque pour que les objets soient réparables, c'est…", "l'incitation", ["la compétence", "la technologie"], "« Ce qui manque, ce n'est pas la compétence, c'est l'incitation »."),
        qcm("Quel est, selon elle, le principal intérêt des ateliers de quartier ?", "transmettre un savoir-faire et une confiance", ["réparer un grand nombre d'objets", "vendre des pièces détachées"], "« leur intérêt n'est pas tant le nombre d'objets sauvés que la transmission d'un savoir-faire et d'une confiance »."),
        qcm("Que signifie l'expression « un objet n'est pas une boîte noire » ?", "On peut comprendre comment un objet fonctionne.", ["Les objets sont de couleur sombre.", "Les objets cachent des données."], "Une boîte noire est un système dont on ne voit pas le fonctionnement."),
        qcm("Quelle est la conclusion de l'économiste ?", "Sans règles imposées aux producteurs, les ateliers resteront marginaux.", ["Les bénévoles suffisent pour changer les choses.", "Il faut interdire les objets neufs."], "« Sans règles claires imposées aux producteurs, ces initiatives resteront marginales »."),
      ] },
    { ten: "c1-de3-co2", hai: false, tieuDe: "Écoute C1 · Đề 3 · Exercice 2 : le silence au bureau", gioiThieu: "Vous allez entendre une courte chronique radio.",
      doan: [d("onyx", RADIO, "Dans de nombreux bureaux, les cloisons ont disparu au nom de la communication. L'idée semblait généreuse : en supprimant les murs, on favoriserait les échanges spontanés. Or beaucoup de salariés racontent l'inverse. Exposés en permanence au regard et au bruit des autres, ils mettent un casque sur les oreilles et échangent davantage par messagerie, même avec un collègue assis à deux mètres. Certaines entreprises font aujourd'hui marche arrière : elles recréent des pièces fermées, des zones de silence, et réservent les espaces ouverts aux réunions. Comme si l'on redécouvrait qu'on ne peut bien travailler ensemble que si l'on peut aussi, parfois, travailler seul.")],
      cau: [
        qcm("Pourquoi les cloisons ont-elles été supprimées dans les bureaux ?", "pour favoriser la communication", ["pour réduire les coûts de chauffage", "pour accueillir plus de clients"], "« les cloisons ont disparu au nom de la communication »."),
        qcm("Que racontent beaucoup de salariés ?", "Ils communiquent moins directement qu'avant.", ["Ils parlent davantage à leurs collègues.", "Ils travaillent plus vite."], "« beaucoup de salariés racontent l'inverse… échangent davantage par messagerie »."),
        qcm("Pourquoi les salariés mettent-ils un casque ?", "pour se protéger du bruit et du regard des autres", ["pour écouter des réunions en ligne", "parce que l'entreprise l'exige"], "« Exposés en permanence au regard et au bruit des autres, ils mettent un casque »."),
        qcm("Que font aujourd'hui certaines entreprises ?", "Elles recréent des pièces fermées et des zones de silence.", ["Elles suppriment les réunions.", "Elles interdisent la messagerie."], "« elles recréent des pièces fermées, des zones de silence »."),
        qcm("Quelle idée résume la chronique ?", "Pour bien travailler ensemble, il faut aussi pouvoir travailler seul.", ["Le travail en équipe est inutile.", "Les bureaux ouverts sont plus économiques."], "« on ne peut bien travailler ensemble que si l'on peut aussi, parfois, travailler seul »."),
      ] },
  ],
  CE: [
    { tieuDe: "Lecture C1 · Đề 3 : la semaine de quatre jours, promesse ou illusion ?", consigne: "<p><strong>Compréhension des écrits.</strong> Lisez le texte puis répondez aux questions.</p>",
      readingText: p("<strong>La semaine de quatre jours : promesse ou illusion ?</strong>",
        "Il y a encore quelques années, l'idée de travailler quatre jours par semaine relevait de l'utopie, voire de la provocation. Elle s'invite désormais dans les négociations de nombreuses entreprises, dans les programmes politiques et dans les conversations de bureau. Son succès tient sans doute à sa simplicité : un jour de plus pour soi, sans renoncer à son salaire. Mais derrière ce slogan séduisant se cachent des réalités très différentes, qu'il serait imprudent de confondre.",
        "La première ambiguïté porte sur le temps de travail lui-même. Pour certains employeurs, la semaine de quatre jours consiste simplement à répartir le même nombre d'heures sur une journée de moins. Les journées s'allongent alors, et la fatigue avec elles. Pour d'autres, il s'agit d'une véritable réduction du temps de travail, compensée par une meilleure organisation : moins de réunions inutiles, moins d'interruptions, des priorités mieux définies. Les deux modèles portent le même nom ; ils n'ont pourtant presque rien en commun.",
        "Les défenseurs de la réforme avancent un argument que l'on aurait cru paradoxal : travailler moins permettrait de travailler mieux. Un salarié reposé serait plus concentré, moins souvent absent et plus fidèle à son entreprise. L'argument n'est pas absurde. Chacun a fait l'expérience de ces fins de journée où l'on reste devant son écran sans rien produire de bon. Encore faut-il que le travail se prête à une telle densification. Un infirmier, un chauffeur de bus ou une vendeuse ne peuvent pas « optimiser » leur présence : leur travail consiste précisément à être là.",
        "C'est sans doute la limite la plus sérieuse du débat. La semaine de quatre jours est souvent pensée depuis les métiers de bureau, où l'on mesure le travail en tâches accomplies. Appliquée sans discernement, elle risquerait de creuser l'écart entre ceux qui peuvent réorganiser leur temps et ceux dont le temps appartient au service qu'ils rendent. Une réforme présentée comme un progrès collectif deviendrait alors un privilège de plus pour les mieux lotis.",
        "Faut-il pour autant renoncer à l'idée ? Ce serait jeter le bébé avec l'eau du bain. Le débat a au moins un mérite : il oblige les organisations à se demander ce que vaut vraiment chaque heure de travail. Combien de réunions pourraient être remplacées par un courriel ? Combien de tâches ne servent qu'à rassurer la hiérarchie ? Interroger le temps de travail, c'est aussi interroger son sens.",
        "Plutôt qu'une formule unique, imposée partout de la même manière, la semaine de quatre jours pourrait devenir un horizon négocié, métier par métier. Là où le travail s'y prête, elle peut améliorer la vie des salariés sans nuire à l'entreprise. Là où il ne s'y prête pas, d'autres formes de réduction de la pénibilité restent à inventer. L'essentiel est de ne pas confondre le symbole avec la solution.",
        "<em>Texte rédigé par FRACILE pour l'entraînement au DALF C1.</em>"),
      cau: [
        qcm("Comment l'auteur explique-t-il le succès de l'idée de semaine de quatre jours ?", "par sa simplicité", ["par les résultats d'études scientifiques", "par les pressions des syndicats"], "« Son succès tient sans doute à sa simplicité »."),
        qcm("Selon l'auteur, quel est le risque du premier modèle de semaine de quatre jours ?", "des journées plus longues et plus fatigantes", ["une baisse des salaires", "la disparition des réunions"], "« Les journées s'allongent alors, et la fatigue avec elles »."),
        vf("Pour l'auteur, les deux modèles de semaine de quatre jours sont très proches.", false, "« Les deux modèles portent le même nom ; ils n'ont pourtant presque rien en commun »"),
        qcm("Quel argument « que l'on aurait cru paradoxal » avancent les défenseurs de la réforme ?", "Travailler moins permettrait de travailler mieux.", ["Travailler plus rendrait plus heureux.", "Les salariés préfèrent les longues journées."], "« travailler moins permettrait de travailler mieux »."),
        qcm("Pourquoi l'auteur cite-t-il l'infirmier, le chauffeur de bus et la vendeuse ?", "Leur travail consiste à être présent et ne peut pas être densifié.", ["Ils travaillent déjà quatre jours par semaine.", "Ils sont opposés à la réforme."], "« leur travail consiste précisément à être là »."),
        qcm("D'après le texte, la semaine de quatre jours est souvent pensée à partir…", "des métiers de bureau", ["des métiers de la santé", "des métiers manuels"], "« La semaine de quatre jours est souvent pensée depuis les métiers de bureau »."),
        qcm("Quel danger l'auteur voit-il dans une application « sans discernement » ?", "creuser les inégalités entre les travailleurs", ["ruiner les entreprises", "augmenter le chômage"], "« elle risquerait de creuser l'écart… un privilège de plus pour les mieux lotis »."),
        qcm("Que signifie l'expression « jeter le bébé avec l'eau du bain » ?", "rejeter une idée entière à cause de ses défauts", ["agir avec trop de prudence", "changer d'avis trop vite"], "L'auteur refuse d'abandonner l'idée à cause de ses limites."),
        qcm("Selon l'auteur, quel est le principal mérite du débat ?", "Il oblige à réfléchir à la valeur de chaque heure de travail.", ["Il réduit immédiatement la fatigue.", "Il augmente les salaires."], "« il oblige les organisations à se demander ce que vaut vraiment chaque heure de travail »."),
        vf("L'auteur suggère que certaines tâches servent surtout à rassurer la hiérarchie.", true, "« Combien de tâches ne servent qu'à rassurer la hiérarchie ? »"),
        qcm("Quelle solution l'auteur propose-t-il ?", "une semaine de quatre jours négociée métier par métier", ["une loi identique pour tous", "l'abandon de la réforme"], "« un horizon négocié, métier par métier »."),
        qcm("Que veut dire la dernière phrase (« ne pas confondre le symbole avec la solution ») ?", "La semaine de quatre jours n'est pas une réponse automatique aux problèmes du travail.", ["Il faut supprimer tous les symboles.", "Les solutions doivent être symboliques."], "L'auteur met en garde contre une mesure-slogan appliquée sans réflexion."),
      ] },
  ],
  PE: { tieuDe: "Production écrite C1 · Đề 3 : essai sur le temps de travail", consigne: "<p><strong>Production écrite : 2 h 30.</strong></p><p>À partir de votre lecture du texte « La semaine de quatre jours : promesse ou illusion ? » et de votre expérience, rédigez un <strong>essai argumenté</strong> (250 mots minimum) en réponse à la question suivante :</p><blockquote><p>« Réduire le temps de travail est-il un progrès pour tous, ou seulement pour certains ? »</p></blockquote><p>Votre essai présentera une introduction avec une problématique, un développement structuré et une conclusion.</p>",
    questions: [{ type: "open", prompt: "Rédigez votre essai argumenté (250 mots minimum)." }] },
  PO: { tieuDe: "Production orale C1 · Đề 3",
    consigne: p("<strong>Production orale : 30 minutes environ.</strong> 60 minutes de préparation.", "Vous tirez au sort deux thèmes et vous en choisissez un. À partir du document, vous préparez un <strong>exposé</strong> structuré (8 à 10 minutes) avec une problématique, un plan et une conclusion, puis vous participez à un <strong>entretien</strong> avec le jury (15 à 20 minutes)."),
    bocTham: { chuanBi: 60, phan: [
      { ten: "Exposé puis entretien avec le jury", cachLam: "Choisissez un thème.", soRut: 2, sujets: [
        S("1", "<strong>Réparer ou racheter ?</strong>", "« Réparer un objet, ce n'est pas seulement prolonger sa vie : c'est refuser l'idée que tout ce qui s'use doit être remplacé. Mais peut-on demander aux consommateurs de réparer quand les objets sont conçus pour ne pas l'être ? »", "<em>Document rédigé par FRACILE.</em>"),
        S("2", "<strong>Le bureau ouvert</strong>", "« On a abattu les murs pour que les gens se parlent. Ils ont mis des casques pour ne plus s'entendre. Et si le travail en équipe commençait par le droit de s'isoler ? »", "<em>Document rédigé par FRACILE.</em>"),
        S("3", "<strong>Apprendre une langue à l'ère de la traduction automatique</strong>", "« Pourquoi passer des années à apprendre une langue quand une application traduit instantanément ? Parce qu'une langue n'est pas qu'un outil : c'est une manière de voir le monde. »", "<em>Document rédigé par FRACILE.</em>"),
        S("4", "<strong>La ville sans voiture</strong>", "« Rendre les centres-villes aux piétons améliore l'air et le calme. Mais pour ceux qui habitent loin et n'ont pas d'autre moyen de transport, la ville sans voiture peut devenir une ville interdite. »", "<em>Document rédigé par FRACILE.</em>")] },
    ] } },
};

export const CAC_DE = [A1, C1];
