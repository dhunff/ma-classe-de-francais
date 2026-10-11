/* Lô 18 (13/10): NỘI DUNG 5 đề thi thử mới (A1 Đề 2, A2 Đề 3, B1 Đề 3, B2 Đề 3, C1 Đề 2).
 *
 * Bài đọc B1/B2/C1 và tài liệu nói B2/C1 lấy từ BÀI BÁO THẬT của The
 * Conversation France (rút gọn bằng cách cắt đoạn, giữ câu gốc, « […] » ở chỗ
 * lược, ghi « D'après … »). Tài liệu đời thường A1/A2 (email, thông báo, quảng
 * cáo) và kịch bản nghe do FRACILE soạn, như đề DELF thật, KHÔNG số liệu hay
 * nguồn bịa trình bày như thật. Không dùng dấu gạch dài (quy tắc 7).
 * Máy dựng (âm thanh + SQL) ở lo18_de_moi.mjs. */

let dem = 0;
export const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261013;
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
const VUA = "Parle en français de France, débit modéré et clair.";
const RADIO = "Parle en français de France, comme un journaliste de radio, débit naturel et posé.";
const KHACH = "Parle en français de France, comme une personne interviewée à la radio, débit naturel.";

/* ══════════════════════════ A1 · Đề 2 ══════════════════════════ */
export const A1 = { level: "A1", ten: "DELF A1 · Đề 2", kieuNghe: "a",
  CO: [
    { ten: "a1-de2-co1", tieuDe: "Écoute A1 · Đề 2 · Exercice 1 : un message de Thomas", gioiThieu: "Vous écoutez un message sur votre répondeur.",
      doan: [d("echo", CHAM, "Salut, c'est Thomas. Samedi, c'est mon anniversaire. Je fais une petite fête chez moi, à sept heures du soir. Mon adresse, c'est douze rue des Lilas. Tu peux apporter un dessert ? Un gâteau au chocolat, par exemple. Appelle-moi avant jeudi. À bientôt !")],
      cau: [
        qcm("Thomas organise une fête pour…", "son anniversaire", ["son mariage", "la fin de l'école"], "« Samedi, c'est mon anniversaire »."),
        qcm("La fête est à quelle heure ?", "19 h", ["17 h", "12 h"], "« à sept heures du soir »."),
        qcm("Thomas habite…", "12 rue des Lilas", ["2 rue des Lilas", "12 rue des Roses"], "« douze rue des Lilas »."),
        qcm("Qu'est-ce que vous devez apporter ?", "un dessert", ["des boissons", "de la musique"], "« Tu peux apporter un dessert ? »."),
      ] },
    { ten: "a1-de2-co2", tieuDe: "Écoute A1 · Đề 2 · Exercice 2 : une annonce au magasin", gioiThieu: "Vous êtes dans un magasin. Vous entendez cette annonce.",
      doan: [d("shimmer", CHAM, "Bonjour à tous nos clients. Aujourd'hui, au rayon fruits, les pommes sont à deux euros le kilo. Au rayon vêtements, les pulls pour enfants sont à moitié prix. Attention, le magasin ferme à vingt heures. Merci et bonne journée !")],
      cau: [
        qcm("Les pommes coûtent…", "2 euros le kilo", ["3 euros le kilo", "2 euros la pièce"], "« les pommes sont à deux euros le kilo »."),
        qcm("Qu'est-ce qui est à moitié prix ?", "les pulls pour enfants", ["les chaussures", "les pantalons"], "« les pulls pour enfants sont à moitié prix »."),
        qcm("Le magasin ferme à…", "20 h", ["18 h", "22 h"], "« le magasin ferme à vingt heures »."),
      ] },
    { ten: "a1-de2-co3", tieuDe: "Écoute A1 · Đề 2 · Exercice 3 : à la gare", gioiThieu: "Vous êtes à la gare. Vous entendez cette annonce.",
      doan: [d("sage", CHAM, "Mesdames et messieurs, le train pour Bordeaux de dix heures quinze partira voie trois. Le train a dix minutes de retard. La voiture-bar se trouve au milieu du train. Bon voyage !")],
      cau: [
        qcm("Le train va à…", "Bordeaux", ["Lyon", "Marseille"], "« le train pour Bordeaux »."),
        qcm("Le train part de la voie…", "3", ["13", "10"], "« voie trois »."),
        qcm("Le train a…", "10 minutes de retard", ["15 minutes de retard", "pas de retard"], "« dix minutes de retard »."),
        qcm("Où est la voiture-bar ?", "au milieu du train", ["au début du train", "à la fin du train"], "« au milieu du train »."),
      ] },
    { ten: "a1-de2-co4", tieuDe: "Écoute A1 · Đề 2 · Exercice 4 : la semaine de Léa", gioiThieu: "Léa parle de sa semaine.",
      doan: [d("nova", CHAM, "Je m'appelle Léa. Le lundi, je vais à la piscine. Le mercredi, j'ai un cours de guitare. Le vendredi soir, je regarde un film avec ma sœur. Et le dimanche, je mange chez mes grands-parents.")],
      cau: [
        qcm("Le lundi, Léa…", "va à la piscine", ["fait de la guitare", "regarde un film"], "« Le lundi, je vais à la piscine »."),
        qcm("Le mercredi, Léa…", "a un cours de guitare", ["va au cinéma", "mange chez ses grands-parents"], "« Le mercredi, j'ai un cours de guitare »."),
        qcm("Avec qui Léa regarde un film ?", "avec sa sœur", ["avec sa mère", "avec ses amis"], "« je regarde un film avec ma sœur »."),
        qcm("Le dimanche, Léa mange…", "chez ses grands-parents", ["au restaurant", "chez une amie"], "« je mange chez mes grands-parents »."),
      ] },
  ],
  CE: [
    { tieuDe: "Lecture A1 · Đề 2 · Exercice 1 : un courriel de Sophie", consigne: "<p>Vous recevez ce courriel. Lisez le document puis répondez aux questions.</p>",
      readingText: p("<strong>De :</strong> Sophie", "<strong>Objet :</strong> Dimanche", "Bonjour !", "Dimanche, je vais au marché avec mon frère. Après, nous mangeons au restaurant italien près de la mairie, à midi et demi. Tu viens avec nous ? On peut se retrouver devant la mairie à midi. Prends ton vélo, il fait beau !", "Bises,<br>Sophie"),
      cau: [
        qcm("Dimanche, Sophie va au marché avec…", "son frère", ["sa mère", "une amie"], "« je vais au marché avec mon frère »."),
        qcm("Où vont-ils manger ?", "au restaurant italien", ["chez Sophie", "au marché"], "« nous mangeons au restaurant italien »."),
        qcm("Le rendez-vous est…", "devant la mairie à midi", ["au marché à midi et demi", "chez vous à midi"], "« On peut se retrouver devant la mairie à midi »."),
        qcm("Sophie vous demande de prendre…", "votre vélo", ["votre voiture", "un parapluie"], "« Prends ton vélo »."),
      ] },
    { tieuDe: "Lecture A1 · Đề 2 · Exercice 2 : la bibliothèque", consigne: "<p>Vous lisez cette affiche. Lisez le document puis répondez aux questions.</p>",
      readingText: p("<strong>BIBLIOTHÈQUE DU QUARTIER</strong>", "Ouverte du mardi au samedi, de 10 h à 18 h.", "Fermée le dimanche et le lundi.", "Inscription gratuite pour les enfants. Adultes : 10 euros par an.", "Le mercredi à 15 h : histoires pour les enfants de 4 à 8 ans."),
      cau: [
        qcm("La bibliothèque est fermée…", "le dimanche et le lundi", ["le mardi et le mercredi", "le samedi"], "« Fermée le dimanche et le lundi »."),
        qcm("Pour un adulte, l'inscription coûte…", "10 euros par an", ["rien", "4 euros par an"], "« Adultes : 10 euros par an »."),
        qcm("Le mercredi à 15 h, il y a…", "des histoires pour les enfants", ["un cours d'anglais", "un film"], "« Le mercredi à 15 h : histoires pour les enfants »."),
      ] },
    { tieuDe: "Lecture A1 · Đề 2 · Exercice 3 : un mot sur la porte", consigne: "<p>Vous trouvez ce mot sur votre porte. Lisez le document puis répondez aux questions.</p>",
      readingText: p("Bonjour,", "Je suis votre nouvelle voisine, au deuxième étage. Je m'appelle Clara. Samedi, je fais une petite fête pour mon arrivée, de 18 h à 22 h. Il y aura de la musique. Excusez-moi pour le bruit ! Vous êtes invités : venez boire un verre.", "Clara"),
      cau: [
        qcm("Clara habite…", "au deuxième étage", ["au premier étage", "au rez-de-chaussée"], "« au deuxième étage »."),
        qcm("Pourquoi Clara fait-elle une fête ?", "pour son arrivée dans l'immeuble", ["pour son anniversaire", "pour son mariage"], "« pour mon arrivée »."),
        qcm("Clara s'excuse pour…", "le bruit", ["le retard", "la porte"], "« Excusez-moi pour le bruit »."),
        qcm("Clara invite ses voisins à…", "boire un verre", ["dîner", "danser toute la nuit"], "« venez boire un verre »."),
      ] },
  ],
  PE: { tieuDe: "Production écrite A1 · Đề 2", consigne: "<p><strong>Production écrite : 30 minutes.</strong></p>",
    questions: [
      { type: "open", prompt: "Exercice 1 : vous vous inscrivez dans un club de sport. Complétez la fiche : nom, prénom, âge, nationalité, adresse, sport préféré, jours libres." },
      { type: "open", prompt: "Exercice 2 : vous êtes en vacances. Vous écrivez une carte postale à un ami : où vous êtes, le temps qu'il fait, ce que vous faites. (40 mots minimum)" },
    ] },
  PO: { tieuDe: "Production orale A1 · Đề 2",
    consigne: p("<strong>Production orale : 5 à 7 minutes.</strong> 10 minutes de préparation pour les parties 2 et 3.", "<strong>1. Entretien dirigé</strong> (environ 1 minute, sans préparation) : présentez-vous. Votre nom, votre âge, votre ville, vos goûts.", "Pour les parties 2 et 3, vous tirez au sort une carte pour chaque partie."),
    bocTham: { chuanBi: 10, phan: [
      { ten: "2. Échange d'informations (environ 2 minutes)", cachLam: "Posez des questions à l'examinateur à partir des mots de la carte.", soRut: 1, sujets: [
        S("A", "frères • métier • petit-déjeuner • sport • vacances • couleur"), S("B", "ville • transport • film • week-end • animal • langue"),
        S("C", "maison • cuisine • musique • ami • matin • anniversaire"), S("D", "école • fruit • voyage • soir • téléphone • saison")] },
      { ten: "3. Dialogue simulé (environ 2 minutes)", cachLam: "Jouez la situation. L'examinateur joue l'autre personne.", soRut: 1, sujets: [
        S("1", "<strong>À la pharmacie.</strong> Vous avez mal à la tête. Vous demandez un médicament et le prix, puis vous payez."),
        S("2", "<strong>À l'office de tourisme.</strong> Vous demandez un plan de la ville et les horaires du musée."),
        S("3", "<strong>Au marché.</strong> Vous achetez des légumes pour une soupe. Vous demandez les prix et vous payez."),
        S("4", "<strong>Au cinéma.</strong> Vous achetez deux billets pour le film de 20 h. Vous demandez le prix.")] },
    ] } },
};

/* ══════════════════════════ A2 · Đề 3 ══════════════════════════ */
export const A2 = { level: "A2", ten: "DELF A2 · Đề 3", kieuNghe: "a",
  CO: [
    { ten: "a2-de3-co1", tieuDe: "Écoute A2 · Đề 3 · Exercice 1 : un message de l'agence", gioiThieu: "Vous écoutez un message sur votre répondeur.",
      doan: [d("shimmer", VUA, "Bonjour, ici l'agence Soleil Location. Nous avons bien reçu votre demande pour l'appartement de la rue Victor-Hugo. La visite est possible jeudi à dix-sept heures trente. L'appartement fait quarante-cinq mètres carrés, avec une petite terrasse. Le loyer est de sept cent vingt euros par mois, charges comprises. Pour la visite, pensez à apporter une pièce d'identité. Rappelez-nous pour confirmer. Merci !")],
      cau: [
        qcm("Qui laisse ce message ?", "une agence de location", ["une banque", "un hôtel"], "« ici l'agence Soleil Location »."),
        qcm("La visite est prévue…", "jeudi à 17 h 30", ["mardi à 17 h 30", "jeudi à 7 h 30"], "« jeudi à dix-sept heures trente »."),
        qcm("L'appartement a…", "une petite terrasse", ["un grand jardin", "un garage"], "« avec une petite terrasse »."),
        qcm("Le loyer est de…", "720 euros, charges comprises", ["720 euros, sans les charges", "270 euros, charges comprises"], "« sept cent vingt euros par mois, charges comprises »."),
        qcm("Pour la visite, il faut apporter…", "une pièce d'identité", ["un chèque", "une photo"], "« pensez à apporter une pièce d'identité »."),
      ] },
    { ten: "a2-de3-co2", tieuDe: "Écoute A2 · Đề 3 · Exercice 2 : une annonce à la piscine", gioiThieu: "Vous êtes à la piscine. Vous entendez cette annonce.",
      doan: [d("sage", VUA, "Chers nageurs, la piscine fermera exceptionnellement à dix-neuf heures ce soir, à cause d'un entraînement de l'équipe de natation. Le grand bassin sera fermé dès dix-huit heures trente. Le petit bassin reste ouvert pour les enfants jusqu'à la fermeture. Nous rappelons que le bonnet de bain est obligatoire. Merci de votre compréhension.")],
      cau: [
        qcm("Ce soir, la piscine ferme à…", "19 h", ["18 h 30", "20 h"], "« la piscine fermera exceptionnellement à dix-neuf heures »."),
        qcm("Pourquoi la piscine ferme-t-elle plus tôt ?", "pour un entraînement d'une équipe", ["pour des travaux", "pour un nettoyage"], "« à cause d'un entraînement de l'équipe de natation »."),
        qcm("Le grand bassin ferme à…", "18 h 30", ["19 h", "17 h 30"], "« Le grand bassin sera fermé dès dix-huit heures trente »."),
        qcm("Qu'est-ce qui est obligatoire ?", "le bonnet de bain", ["les lunettes", "la carte d'abonnement"], "« le bonnet de bain est obligatoire »."),
      ] },
    { ten: "a2-de3-co3", tieuDe: "Écoute A2 · Đề 3 · Exercice 3 : une émission sur les jardins", gioiThieu: "Vous écoutez une émission à la radio.",
      doan: [d("sage", RADIO, "Bienvenue dans « Ma ville verte ». Aujourd'hui, nous sommes avec Karim, qui s'occupe d'un jardin sur le toit d'un immeuble. Karim, comment est né ce projet ?"),
        d("echo", KHACH, "Il y a deux ans, avec mes voisins, on a vu que le toit était vide. On a demandé l'autorisation au propriétaire, et on a commencé avec dix bacs de légumes. Aujourd'hui, on a des tomates, des salades, des fraises et même des abeilles. Chaque famille vient arroser une fois par semaine, et le samedi matin, on récolte ensemble. Le plus important pour moi, ce ne sont pas les légumes : c'est que les voisins se parlent enfin !")],
      cau: [
        qcm("Le jardin de Karim se trouve…", "sur le toit d'un immeuble", ["dans un parc", "derrière une école"], "« un jardin sur le toit d'un immeuble »."),
        qcm("Le projet a commencé il y a…", "deux ans", ["dix ans", "deux mois"], "« Il y a deux ans »."),
        qcm("Au début, il y avait…", "dix bacs de légumes", ["des abeilles", "deux arbres"], "« on a commencé avec dix bacs de légumes »."),
        qcm("Chaque famille vient…", "arroser une fois par semaine", ["récolter tous les jours", "le dimanche après-midi"], "« Chaque famille vient arroser une fois par semaine »."),
        qcm("Pour Karim, le plus important, c'est…", "que les voisins se parlent", ["de manger des légumes", "de vendre les fraises"], "« c'est que les voisins se parlent enfin »."),
      ] },
    { ten: "a2-de3-co4", tieuDe: "Écoute A2 · Đề 3 · Exercice 4 : trois messages", gioiThieu: "Vous écoutez trois courts messages.",
      doan: [d("nova", VUA, "Message un. Bonjour, c'est Julie. Je suis malade, je ne peux pas venir au cours de danse ce soir. Désolée !"),
        d("onyx", VUA, "Message deux. Bonjour, ici le garage Martin. Votre voiture est prête. Vous pouvez venir la chercher demain matin."),
        d("shimmer", VUA, "Message trois. Coucou, c'est maman. N'oublie pas d'acheter du pain en rentrant, on mange tous ensemble ce soir.")],
      cau: [
        qcm("Message 1 : Julie…", "annule sa venue au cours", ["propose un nouveau cours", "demande une adresse"], "« je ne peux pas venir au cours de danse ce soir »."),
        qcm("Message 2 : le garage annonce que…", "la voiture est prête", ["la voiture a un problème", "le garage est fermé"], "« Votre voiture est prête »."),
        qcm("Message 3 : la mère demande…", "d'acheter du pain", ["de préparer le dîner", "de rentrer tard"], "« N'oublie pas d'acheter du pain »."),
      ] },
  ],
  CE: [
    { tieuDe: "Lecture A2 · Đề 3 · Exercice 1 : choisir une sortie", consigne: "<p>Vous lisez le programme du week-end. Répondez aux questions.</p>",
      readingText: p("<strong>A.</strong> Concert de jazz au parc, samedi 18 h. Gratuit.", "<strong>B.</strong> Atelier de cuisine japonaise, samedi 10 h. 25 euros, inscription obligatoire.", "<strong>C.</strong> Randonnée en forêt, dimanche 9 h. Prévoir de bonnes chaussures.", "<strong>D.</strong> Exposition de photos à la mairie, tout le week-end. Entrée libre.", "<strong>E.</strong> Match de football des enfants, dimanche 15 h, au stade."),
      cau: [
        qcm("Vous voulez une activité gratuite le samedi soir. Vous choisissez…", "A", ["B", "D"], "A : samedi 18 h, gratuit."),
        qcm("Vous aimez cuisiner. Vous choisissez…", "B", ["C", "E"], "B : atelier de cuisine japonaise."),
        qcm("Vous aimez la nature et marcher. Vous choisissez…", "C", ["A", "D"], "C : randonnée en forêt."),
        qcm("Pour l'activité B, il faut…", "s'inscrire", ["venir avec des chaussures de marche", "avoir un enfant"], "« inscription obligatoire »."),
        qcm("L'exposition de photos a lieu…", "à la mairie, samedi et dimanche", ["au stade, le dimanche", "au parc, le samedi"], "« à la mairie, tout le week-end »."),
      ] },
    { tieuDe: "Lecture A2 · Đề 3 · Exercice 2 : un courriel de Marc", consigne: "<p>Vous recevez ce courriel. Lisez le document puis répondez aux questions.</p>",
      readingText: p("<strong>Objet :</strong> Mon nouveau travail", "Salut Anna,", "Depuis lundi, je travaille dans une boulangerie à Nantes. Je commence très tôt, à cinq heures du matin, mais je finis à midi : j'ai donc mes après-midis libres. Mon patron est sympathique et il m'apprend à faire des croissants. Le seul problème, c'est le réveil !", "Je cherche un appartement plus près du travail, parce que maintenant je prends le bus pendant quarante minutes.", "Tu viens me voir en juillet ?", "Marc"),
      cau: [
        qcm("Marc travaille…", "dans une boulangerie", ["dans un restaurant", "dans une école"], "« je travaille dans une boulangerie »."),
        qcm("Marc finit son travail à…", "midi", ["cinq heures", "dix-huit heures"], "« je finis à midi »."),
        qcm("Qu'est-ce qui est difficile pour Marc ?", "se lever tôt", ["son patron", "faire des croissants"], "« Le seul problème, c'est le réveil »."),
        qcm("Pourquoi Marc cherche-t-il un appartement ?", "pour habiter plus près du travail", ["parce qu'il est trop cher", "pour avoir un jardin"], "« un appartement plus près du travail »."),
        qcm("Marc propose à Anna de…", "venir le voir en juillet", ["travailler avec lui", "prendre le bus avec lui"], "« Tu viens me voir en juillet ? »."),
      ] },
    { tieuDe: "Lecture A2 · Đề 3 · Exercice 3 : les règles du camping", consigne: "<p>Vous lisez le règlement d'un camping. Répondez aux questions.</p>",
      readingText: p("<strong>CAMPING DES PINS : RÈGLEMENT</strong>", "Arrivée à partir de 14 h, départ avant 11 h.", "Silence entre 22 h et 7 h.", "Les animaux sont acceptés, mais ils doivent rester attachés.", "Les barbecues sont interdits. Utilisez l'espace grillade près de l'accueil.", "Piscine ouverte de 9 h à 20 h, short de bain interdit."),
      cau: [
        qcm("On peut arriver au camping…", "à partir de 14 h", ["avant 11 h", "à partir de 7 h"], "« Arrivée à partir de 14 h »."),
        qcm("Le silence est obligatoire…", "de 22 h à 7 h", ["de 20 h à 9 h", "toute la journée"], "« Silence entre 22 h et 7 h »."),
        qcm("Les animaux…", "doivent rester attachés", ["sont interdits", "peuvent aller à la piscine"], "« ils doivent rester attachés »."),
        qcm("Pour faire une grillade, il faut…", "utiliser l'espace près de l'accueil", ["apporter son barbecue", "demander à la piscine"], "« Utilisez l'espace grillade près de l'accueil »."),
        qcm("À la piscine, il est interdit de porter…", "un short de bain", ["un bonnet", "des lunettes"], "« short de bain interdit »."),
      ] },
  ],
  PE: { tieuDe: "Production écrite A2 · Đề 3", consigne: "<p>Production écrite : 45 minutes. Deux exercices, <strong>60 mots minimum</strong> chacun.</p>",
    questions: [
      { type: "open", prompt: "Exercice 1 : vous avez participé à une fête dans votre quartier. Sur votre blog, vous racontez : quand, où, avec qui, ce que vous avez fait et vos impressions. (60 mots minimum)" },
      { type: "open", prompt: "Exercice 2 : un ami vous propose d'aller à un concert samedi. Vous acceptez, vous demandez des informations (heure, lieu, prix) et vous proposez de dîner avant. (60 mots minimum)" },
    ] },
  PO: { tieuDe: "Production orale A2 · Đề 3",
    consigne: p("<strong>Production orale : 6 à 8 minutes.</strong> 10 minutes de préparation pour les parties 2 et 3.", "<strong>1. Entretien dirigé</strong> (environ 1 minute 30, sans préparation) : parlez de vous, de votre famille, de vos activités, de vos goûts.", "Pour les parties 2 et 3, vous tirez au sort deux sujets et vous en choisissez un."),
    bocTham: { chuanBi: 10, phan: [
      { ten: "2. Monologue suivi (environ 2 minutes)", cachLam: "Parlez du sujet choisi.", soRut: 2, sujets: [
        S("1", "Parlez de votre restaurant préféré. Où est-il ? Qu'est-ce que vous mangez ? Avec qui y allez-vous ?"), S("2", "Racontez votre meilleur souvenir d'école."),
        S("3", "Présentez une fête traditionnelle de votre pays."), S("4", "Parlez de votre sport ou de votre loisir préféré. Depuis quand le pratiquez-vous ?")] },
      { ten: "3. Exercice en interaction (3 à 4 minutes)", cachLam: "Jouez la situation. L'examinateur joue l'autre personne.", soRut: 2, sujets: [
        S("1", "Vous avez acheté un pantalon trop petit. Vous retournez au magasin pour l'échanger."), S("2", "Vous voulez réserver une chambre d'hôtel pour deux nuits. Vous téléphonez : prix, petit-déjeuner, parking."),
        S("3", "Vous organisez un pique-nique avec un ami : vous choisissez le jour, le lieu et ce que chacun apporte."), S("4", "Vous êtes à la poste. Vous voulez envoyer un colis à l'étranger : prix, délai, assurance.")] },
    ] } },
};

/* ══════════════════════════ B1 · Đề 3 ══════════════════════════ */
export const B1 = { level: "B1", ten: "DELF B1 · Đề 3", kieuNghe: "a",
  CO: [
    { ten: "b1-de3-co1", tieuDe: "Écoute B1 · Đề 3 · Exercice 1 : le repair café", gioiThieu: "Vous écoutez une émission de radio locale.",
      doan: [d("sage", RADIO, "Dans notre rubrique « Près de chez vous », nous sommes allés au repair café de la maison de quartier. Nathalie, vous êtes bénévole ici. Comment ça marche ?"),
        d("shimmer", KHACH, "C'est très simple. Le premier samedi du mois, les habitants viennent avec un objet cassé : un grille-pain, une lampe, un vélo, un vêtement. Des bénévoles, souvent des retraités qui étaient électriciens ou couturières, les aident à le réparer. C'est gratuit, mais on n'est pas un service de réparation : les gens doivent participer. L'idée, c'est d'apprendre."),
        d("sage", RADIO, "Et ça marche ?"),
        d("shimmer", KHACH, "Plutôt bien ! On répare environ deux objets sur trois. Ceux qu'on ne peut pas réparer, on explique pourquoi. Et puis il y a le café et les gâteaux : beaucoup de gens viennent aussi pour discuter. Notre problème, c'est qu'il nous manque des bénévoles pour les téléphones et les ordinateurs. Si vous savez réparer un écran, venez nous voir !")],
      cau: [
        qcm("Le repair café a lieu…", "le premier samedi du mois", ["tous les samedis", "le dernier dimanche du mois"], "« Le premier samedi du mois »."),
        qcm("Les bénévoles sont souvent…", "des retraités", ["des étudiants", "des professionnels payés"], "« souvent des retraités »."),
        qcm("Le service est…", "gratuit, mais les visiteurs doivent participer", ["payant pour les gros objets", "réservé aux habitants du quartier"], "« C'est gratuit… les gens doivent participer »."),
        qcm("Quel est le but principal ?", "apprendre à réparer", ["vendre des objets d'occasion", "recycler les déchets"], "« L'idée, c'est d'apprendre »."),
        qcm("On répare environ…", "deux objets sur trois", ["un objet sur deux", "tous les objets"], "« On répare environ deux objets sur trois »."),
        qcm("Beaucoup de gens viennent aussi pour…", "discuter", ["acheter des gâteaux", "trouver un travail"], "« beaucoup de gens viennent aussi pour discuter »."),
        qcm("Le repair café cherche des bénévoles pour…", "les téléphones et les ordinateurs", ["les vélos", "les vêtements"], "« il nous manque des bénévoles pour les téléphones et les ordinateurs »."),
      ] },
    { ten: "b1-de3-co2", tieuDe: "Écoute B1 · Đề 3 · Exercice 2 : un message professionnel", gioiThieu: "Vous travaillez dans une entreprise. Vous écoutez un message de votre responsable.",
      doan: [d("onyx", VUA, "Bonjour à tous, c'est Hélène. Petite information pour la semaine prochaine : la réunion d'équipe du lundi est déplacée au mardi, même heure, neuf heures. Elle aura lieu en salle trois, car la grande salle est en travaux. Merci de préparer chacun un court bilan de vos projets, cinq minutes maximum. Et autre chose : à partir du premier novembre, le télétravail passe à deux jours par semaine. Vous choisirez vos jours avec votre chef d'équipe. Bonne journée !")],
      cau: [
        qcm("La réunion d'équipe aura lieu…", "mardi à 9 h", ["lundi à 9 h", "mardi à 10 h"], "« déplacée au mardi, même heure, neuf heures »."),
        qcm("Pourquoi la réunion change-t-elle de salle ?", "La grande salle est en travaux.", ["Il y a plus de participants.", "La salle 3 est plus proche."], "« la grande salle est en travaux »."),
        qcm("Chacun doit préparer…", "un court bilan de ses projets", ["une présentation de 15 minutes", "un rapport écrit"], "« un court bilan de vos projets, cinq minutes maximum »."),
        qcm("À partir du 1er novembre, le télétravail sera de…", "deux jours par semaine", ["un jour par semaine", "trois jours par semaine"], "« le télétravail passe à deux jours par semaine »."),
        qcm("Qui choisit les jours de télétravail ?", "chaque salarié avec son chef d'équipe", ["Hélène seule", "la direction générale"], "« Vous choisirez vos jours avec votre chef d'équipe »."),
      ] },
  ],
  CE: [
    { tieuDe: "Lecture B1 · Đề 3 · Exercice 1 : choisir un cours", consigne: "<p>Vous voulez suivre un cours le soir. Lisez les annonces et répondez aux questions.</p>",
      readingText: p("<strong>A. Photo numérique</strong> : mardi 19 h à 21 h, 10 séances, 120 €. Apporter son appareil.", "<strong>B. Espagnol débutant</strong> : lundi et jeudi 18 h 30, en ligne, 90 € le trimestre.", "<strong>C. Théâtre</strong> : mercredi 20 h, spectacle de fin d'année en juin, 150 € l'année.", "<strong>D. Cuisine du monde</strong> : vendredi 19 h, 4 participants maximum, 35 € la séance.", "<strong>E. Yoga</strong> : samedi 9 h, cours d'essai gratuit, ensuite 8 € la séance."),
      cau: [
        qcm("Vous préférez suivre un cours depuis chez vous. Vous choisissez…", "B", ["A", "D"], "B : « en ligne »."),
        qcm("Vous voulez essayer avant de payer. Vous choisissez…", "E", ["C", "A"], "E : « cours d'essai gratuit »."),
        qcm("Vous aimez être en petit groupe. Vous choisissez…", "D", ["B", "C"], "D : « 4 participants maximum »."),
        qcm("Quel cours se termine par un spectacle ?", "C", ["A", "E"], "C : « spectacle de fin d'année en juin »."),
        qcm("Pour le cours A, il faut…", "apporter son propre appareil", ["payer chaque séance", "venir le samedi"], "« Apporter son appareil »."),
      ] },
    { tieuDe: "Lecture B1 · Đề 3 · Exercice 2 : les adolescents et le téléphone", consigne: "<p>Lisez l'article puis répondez aux questions.</p>",
      readingText: p("<strong>Au téléphone, les adolescents ne répondent plus : manque de politesse ou nouveaux usages ?</strong>",
        "Les adolescents ont un téléphone greffé à la main… mais ne répondent pas quand on les appelle. Cette situation, familière à bien des parents, peut sembler absurde, frustrante ou inquiétante. Pourtant, elle dit beaucoup des nouvelles manières pour les 13-18 ans d’entrer (ou de ne pas entrer) en relation.",
        "Chez les adolescents, l’appel vocal n’est plus le canal par défaut. Il tend même à devenir une exception, réservée à certaines circonstances très spécifiques : situations urgentes, moments d’angoisse, besoin d’un réconfort immédiat. Dans les autres cas, on préfère écrire. Non pas par paresse, mais parce que la communication écrite (SMS, messages vocaux, DM sur Snapchat ou Instagram) offre un tout autre rapport à la temporalité, à l’émotion, à la maîtrise de soi.",
        "Car répondre au téléphone, c’est devoir être disponible ici et maintenant, sans filet ni délai. Pour beaucoup d’adolescents, cette immédiateté est perçue comme un stress, une perte de contrôle : on n’a pas le temps de réfléchir à ce qu’on veut dire, on risque de bafouiller, de dire trop ou pas assez. La communication écrite, elle, permet de reprendre la main. On peut formuler, reformuler, supprimer, différer.",
        "« Mes potes savent que je réponds pas direct. Ils m’envoient un snap d’abord, genre “dispo pour ‘call’ ?” Sinon, c’est mort. » Ce petit rituel illustre un changement de posture : appeler quelqu’un sans prévenir peut être perçu comme un manque de tact numérique. À l’inverse, attendre le bon moment, sonder l’autre avant de se lancer dans un appel, devient une preuve de respect.",
        "[…] Plutôt que de voir dans ce silence téléphonique une crise du dialogue, pourquoi ne pas y lire une occasion de réinventer nos façons de se parler ? Cela peut commencer par une discussion franche et tranquille sur les préférences de chacun en matière de communication. Avant d’appeler, on peut aussi tout simplement demander par un petit message si l’autre est disponible.",
        "<em>D'après Anne Cordier, professeure à l'Université de Lorraine, The Conversation, 21 juillet 2025.</em>"),
      cau: [
        qcm("Le thème de l'article est…", "la façon dont les adolescents utilisent le téléphone", ["le prix des forfaits téléphoniques", "les dangers des réseaux sociaux"], "Tout l'article explique pourquoi les adolescents ne décrochent plus."),
        vf("Pour les adolescents, l'appel vocal reste le moyen de communication le plus courant.", false, "« Chez les adolescents, l’appel vocal n’est plus le canal par défaut. »"),
        qcm("Dans quelles situations les adolescents acceptent-ils d'appeler ?", "en cas d'urgence ou d'angoisse", ["pour parler de leurs devoirs", "le soir uniquement"], "« situations urgentes, moments d’angoisse, besoin d’un réconfort immédiat »."),
        qcm("Selon l'auteure, les adolescents préfèrent écrire parce que…", "l'écrit leur permet de mieux contrôler ce qu'ils disent", ["c'est moins cher", "ils sont paresseux"], "« Non pas par paresse… On peut formuler, reformuler, supprimer, différer »."),
        vf("Répondre immédiatement au téléphone peut être stressant pour les adolescents.", true, "« cette immédiateté est perçue comme un stress, une perte de contrôle »"),
        qcm("Pour les adolescents, appeler sans prévenir peut être vu comme…", "un manque de tact", ["une preuve d'amitié", "une habitude normale"], "« appeler quelqu’un sans prévenir peut être perçu comme un manque de tact numérique »."),
        qcm("Que conseille l'auteure aux adultes ?", "demander par message si l'autre est disponible avant d'appeler", ["confisquer le téléphone", "appeler plus souvent"], "« Avant d’appeler, on peut aussi tout simplement demander par un petit message si l’autre est disponible »."),
        qcm("Le ton de l'auteure est plutôt…", "compréhensif", ["moqueur", "alarmiste"], "Elle refuse de voir « une crise du dialogue » et propose de « réinventer nos façons de se parler »."),
      ] },
  ],
  PE: { tieuDe: "Production écrite B1 · Đề 3 : le téléphone à table", consigne: "<p><strong>Production écrite : 45 minutes, 160 mots minimum.</strong></p>",
    questions: [{ type: "open", prompt: "Sur un forum, une mère écrit : « Mon fils de 15 ans regarde son téléphone pendant tous les repas. Faut-il interdire les téléphones à table ? » Vous lui répondez : vous donnez votre opinion, vous racontez une expérience personnelle et vous proposez une solution. (160 mots minimum)" }] },
  PO: { tieuDe: "Production orale B1 · Đề 3",
    consigne: p("<strong>Production orale : 15 minutes environ.</strong> 10 minutes de préparation pour la partie 3.", "<strong>1. Entretien dirigé</strong> (2 à 3 minutes, sans préparation) : parlez de vous, de vos études ou de votre travail, de vos loisirs.", "Pour les parties 2 et 3, vous tirez au sort deux sujets et vous en choisissez un."),
    bocTham: { chuanBi: 10, phan: [
      { ten: "2. Exercice en interaction (3 à 4 minutes)", cachLam: "Jouez la situation. L'examinateur joue l'autre personne.", soRut: 2, sujets: [
        S("1", "Votre ami veut acheter une voiture. Vous pensez que ce n'est pas utile en ville. Vous en discutez."), S("2", "Vous avez réservé un voyage, mais l'hôtel n'est pas comme sur les photos. Vous parlez au réceptionniste."),
        S("3", "Votre voisin fait du bruit tous les soirs. Vous allez lui parler poliment pour trouver une solution."), S("4", "Votre collègue veut organiser la fête de fin d'année au bureau. Vous préférez un restaurant. Vous discutez.")] },
      { ten: "3. Expression d'un point de vue (5 à 7 minutes)", cachLam: "Dégagez le thème du titre, puis présentez votre opinion. L'examinateur vous pose ensuite quelques questions.", soRut: 2, sujets: [
        S("1", "« Au téléphone, les adolescents ne répondent plus : manque de politesse ou nouveaux usages ? »", "<em>Titre d'un article de The Conversation, 2025.</em>"),
        S("2", "« Apprendre à bien manger : comment penser l’éducation à l’alimentation ? »", "<em>Titre d'un article de The Conversation, 2026.</em>"),
        S("3", "« À quoi pourrait ressembler une journée à l’école en 2035 ? »", "<em>Titre d'un article de The Conversation, 2026.</em>"),
        S("4", "« De la lettre à Internet : communiquons-nous désormais en temps réel ? »", "<em>Titre d'un article de The Conversation, 2026.</em>")] },
    ] } },
};

/* ══════════════════════════ B2 · Đề 3 ══════════════════════════ */
export const B2 = { level: "B2", ten: "DELF B2 · Đề 3", kieuNghe: "b2",
  CO: [
    { ten: "b2-de3-co1", hai: true, tieuDe: "Écoute B2 · Đề 3 · Exercice 1 : la semaine de quatre jours à l'école ?", gioiThieu: "Vous allez entendre un débat radiophonique sur les rythmes scolaires.",
      doan: [d("sage", RADIO, "Bonsoir. Faut-il revoir l'organisation de la semaine des écoliers ? Le débat revient régulièrement en France. Pour en parler, nous recevons une enseignante de primaire et un parent d'élève. Madame, vous travaillez avec des enfants de huit ans. Qu'observez-vous en classe ?"),
        d("shimmer", KHACH, "Ce que je vois surtout, c'est la fatigue. Les journées sont longues : beaucoup d'enfants arrivent à la garderie à sept heures et demie et repartent à dix-huit heures. L'après-midi, après quinze heures, leur attention baisse beaucoup. À mon avis, le problème n'est pas tant le nombre de jours que la longueur des journées. Je préférerais des matinées plus longues et des après-midi consacrés au sport, à la musique, aux activités artistiques."),
        d("sage", RADIO, "Monsieur, en tant que parent, qu'en pensez-vous ?"),
        d("echo", KHACH, "Je comprends l'argument, mais il faut regarder la réalité des familles. Quand on travaille tous les deux, le mercredi libre ou des après-midi plus courtes, cela veut dire trouver une solution de garde. Et ça a un coût. Les familles qui ont les moyens inscrivent leurs enfants au conservatoire ou au club de sport ; les autres les laissent devant les écrans. Donc toute réforme doit s'accompagner d'activités gratuites, organisées par les communes, sinon on augmente les inégalités."),
        d("shimmer", KHACH, "Je suis d'accord sur ce point. Une réforme sans moyens, c'est une réforme qui échoue. Mais il faut aussi associer les enseignants dès le départ. Trop souvent, on nous demande d'appliquer des changements décidés sans nous."),
        d("sage", RADIO, "Un dernier mot ?"),
        d("echo", KHACH, "Oui : qu'on écoute aussi les enfants. Mon fils m'a dit l'autre jour qu'il aimerait apprendre dehors, dans la nature. Ce n'est peut-être pas si bête.")],
      cau: [
        qcm("Le sujet de l'émission est…", "l'organisation du temps scolaire", ["le salaire des enseignants", "la cantine scolaire"], "« Faut-il revoir l'organisation de la semaine des écoliers ? »."),
        qcm("Selon l'enseignante, que constate-t-elle chez les enfants ?", "une grande fatigue", ["un manque d'intérêt pour la lecture", "trop de devoirs"], "« Ce que je vois surtout, c'est la fatigue »."),
        qcm("D'après l'enseignante, à partir de quand l'attention baisse-t-elle ?", "après 15 h", ["dès le matin", "après le déjeuner seulement le vendredi"], "« après quinze heures, leur attention baisse beaucoup »."),
        qcm("Pour l'enseignante, le vrai problème est…", "la longueur des journées", ["le nombre de jours d'école", "le nombre d'élèves par classe"], "« le problème n'est pas tant le nombre de jours que la longueur des journées »."),
        qcm("Que propose l'enseignante pour l'après-midi ?", "des activités sportives et artistiques", ["des cours de mathématiques", "rentrer plus tôt à la maison"], "« des après-midi consacrés au sport, à la musique, aux activités artistiques »."),
        qcm("Quelle difficulté le parent souligne-t-il ?", "le coût de la garde des enfants", ["la distance entre la maison et l'école", "le manque de professeurs"], "« trouver une solution de garde. Et ça a un coût »."),
        qcm("Selon le parent, sans activités gratuites, une réforme risque de…", "augmenter les inégalités", ["fatiguer les parents", "réduire le niveau scolaire"], "« sinon on augmente les inégalités »."),
        qcm("Sur quel point les deux invités sont-ils d'accord ?", "Une réforme a besoin de moyens.", ["Il faut supprimer le mercredi libre.", "Les écrans sont utiles pour apprendre."], "« Je suis d'accord sur ce point. Une réforme sans moyens, c'est une réforme qui échoue »."),
        qcm("Que reproche l'enseignante aux réformes passées ?", "Elles ont été décidées sans les enseignants.", ["Elles étaient trop chères.", "Elles ont trop duré."], "« on nous demande d'appliquer des changements décidés sans nous »."),
        qcm("Que demande le parent pour conclure ?", "qu'on écoute aussi l'avis des enfants", ["qu'on supprime les devoirs", "qu'on ferme les écoles le vendredi"], "« qu'on écoute aussi les enfants »."),
      ] },
    { ten: "b2-de3-co2", hai: false, tieuDe: "Écoute B2 · Đề 3 · Exercice 2 : les cuisines fantômes", gioiThieu: "Vous allez entendre une courte chronique radio.",
      doan: [d("shimmer", RADIO, "Vous avez peut-être déjà commandé un repas sans savoir qu'il venait d'une cuisine fantôme. Ces restaurants n'ont ni salle, ni terrasse, ni vitrine : ils préparent uniquement des plats pour la livraison. Leur adresse compte moins pour les passants que pour les livreurs : l'essentiel est d'être proche des quartiers où l'on commande beaucoup. Pour certains, c'est une simple évolution du commerce. Pour d'autres, c'est une perte pour la ville : le restaurant n'est plus un lieu où l'on se rencontre. Des questions restent aussi ouvertes, comme les emballages ou les conditions de travail des livreurs.")],
      cau: [
        qcm("Une cuisine fantôme est un restaurant…", "qui prépare des repas uniquement pour la livraison", ["qui ouvre seulement la nuit", "qui n'a pas de cuisinier"], "« ils préparent uniquement des plats pour la livraison »."),
        qcm("Pour ces restaurants, l'emplacement idéal est…", "près des quartiers où l'on commande beaucoup", ["dans une rue très passante", "près des gares"], "« l'essentiel est d'être proche des quartiers où l'on commande beaucoup »."),
        qcm("Pour certains, ces cuisines représentent une perte car…", "le restaurant n'est plus un lieu de rencontre", ["les plats sont moins bons", "elles sont trop chères"], "« le restaurant n'est plus un lieu où l'on se rencontre »."),
        qcm("Quelles questions restent ouvertes ?", "les emballages et les conditions de travail des livreurs", ["le prix des repas et la qualité", "les horaires et le bruit"], "« les emballages ou les conditions de travail des livreurs »."),
      ] },
  ],
  CE: [
    { tieuDe: "Lecture B2 · Đề 3 · Exercice 1 : les « dark kitchens »", consigne: "<p><strong>Comprendre un texte informatif.</strong> Lisez le document puis répondez aux questions.</p>",
      readingText: p("<strong>« Dark kitchens » : comment les cuisines fantômes transforment nos villes et notre manière de manger</strong>",
        "Vous avez peut-être déjà commandé un repas de cuisine fantôme sans le savoir. On ne peut pas s’y attabler, il n’y a aucune salle à l’adresse indiquée sur l’application. Ni terrasse, ni vitrine, ni enseigne. Dans la rue, on passe sans le savoir devant ces restaurants invisibles, qui redessinent nos villes depuis plusieurs années.",
        "On appelle ces établissements des « dark kitchens » ou « cuisines fantômes ». Le principe est simple : on y prépare des repas uniquement pour la livraison. Des commandes arrivent par écran. Les préparateurs s’activent aux fourneaux. Enfin, des livreurs viennent récupérer les sacs de nourriture et repartent aussitôt.",
        "La Direction générale de la concurrence, de la consommation et de la répression des fraudes (DGCCRF) a contrôlé 646 établissements proposant des plats livrés en 2023, dont 103 dark kitchens, confirmant l’installation de ce modèle dans le paysage français.",
        "Dans le commerce de restauration traditionnel, l’emplacement compte avant toute chose. L’attractivité du quartier. La visibilité de la façade. Le passage piéton à proximité. Mais quelle est la valeur de l’emplacement lorsque le client ne se déplace plus ? Pour une dark kitchen, la localisation compte toujours. Mais ses critères changent de nature. La visibilité de la façade compte moins. Ce qui importe, c’est la capacité à couvrir rapidement une zone de livraison dense.",
        "[…] L’Atelier parisien d’urbanisme observe quant à lui que ces établissements s’installent souvent dans d’anciens commerces ou restaurants, en rez-de-chaussée, au pied des immeubles parisiens. […] Plus un restaurant devient visible sur un écran, moins il a besoin de l’être dans la rue.",
        "Cette réorganisation spatiale ne se fait pas sans conséquences sociales. Car les cuisines fantômes défont ce qui réunissait la préparation, la commande, le service et la consommation d’un repas. Des étapes qui étaient souvent réunies dans un même lieu, au même moment.",
        "Faut-il pour autant accuser les dark kitchens d’avoir inventé l’isolement alimentaire ? Non, ce serait excessif. […] Les dark kitchens n’inventent rien. Elles offrent simplement à ces pratiques une infrastructure économique et spatiale sur mesure. Elles pourraient ainsi en accélérer la diffusion.",
        "[…] De la gestion des emballages aux conditions de travail des livreurs, le cadre réglementaire reste encore largement à construire.",
        "<em>D'après Jean-Baptiste Welté et Khuong Nguyen Huy, Université Paris-Panthéon-Assas, The Conversation, 11 octobre 2026.</em>"),
      cau: [
        qcm("Ce texte a pour thème…", "le développement des restaurants qui ne font que de la livraison", ["la fermeture des restaurants traditionnels", "les applications de recettes"], "« on y prépare des repas uniquement pour la livraison »."),
        vf("Dans une cuisine fantôme, les clients peuvent manger sur place.", false, "« On ne peut pas s’y attabler, il n’y a aucune salle à l’adresse indiquée sur l’application. »"),
        qcm("Que montrent les contrôles de la DGCCRF en 2023 ?", "Ce modèle s'est installé en France.", ["Les cuisines fantômes ne respectent pas l'hygiène.", "Les cuisines fantômes ont disparu."], "« confirmant l’installation de ce modèle dans le paysage français »."),
        qcm("Pour un restaurant traditionnel, l'emplacement idéal dépend surtout…", "de la visibilité et du passage dans la rue", ["de la proximité des livreurs", "du prix du loyer"], "« L’attractivité du quartier. La visibilité de la façade. Le passage piéton à proximité »."),
        qcm("Pour une dark kitchen, ce qui compte avant tout, c'est…", "de pouvoir livrer vite une zone dense", ["d'avoir une belle façade", "d'être dans une rue touristique"], "« la capacité à couvrir rapidement une zone de livraison dense »."),
        vf("À Paris, les cuisines fantômes s'installent souvent dans d'anciens commerces au rez-de-chaussée.", true, "« ces établissements s’installent souvent dans d’anciens commerces ou restaurants, en rez-de-chaussée »"),
        qcm("Que veut dire « Plus un restaurant devient visible sur un écran, moins il a besoin de l’être dans la rue » ?", "La visibilité en ligne remplace la visibilité de la façade.", ["Les restaurants doivent faire de la publicité à la télévision.", "Les clients n'utilisent plus les écrans."], "Le restaurant attire désormais ses clients par l'application, pas par sa vitrine."),
        qcm("Quelle conséquence sociale l'article souligne-t-il ?", "Les étapes du repas sont séparées et ne se font plus dans un même lieu.", ["Les livreurs deviennent cuisiniers.", "Les prix des repas augmentent."], "« les cuisines fantômes défont ce qui réunissait la préparation, la commande, le service et la consommation d’un repas »."),
        vf("Selon les auteurs, les dark kitchens ont inventé le fait de manger seul.", false, "« Faut-il pour autant accuser les dark kitchens d’avoir inventé l’isolement alimentaire ? Non, ce serait excessif. »"),
        qcm("Selon la fin du texte, les règles concernant les emballages et les livreurs…", "restent en grande partie à créer", ["sont déjà très strictes", "ont été supprimées"], "« le cadre réglementaire reste encore largement à construire »."),
      ] },
    { tieuDe: "Lecture B2 · Đề 3 · Exercice 2 : aimer son travail", consigne: "<p><strong>Comprendre un texte argumentatif.</strong> Lisez le document puis répondez aux questions.</p>",
      readingText: p("<strong>Ce que signifie vraiment « aimer son travail » et quand cet amour peut devenir un problème</strong>",
        "Que signifie aimer son travail ? Le champ lexical de l’amour revient souvent dans les débats lorsqu’on parle du monde du travail. Les gens disent vouloir aimer leur travail ; les entreprises promettent des postes que les candidats adoreront ; les offres d’emploi présentent le travail comme un engagement émotionnel davantage qu’une simple transaction économique. Malgré son omniprésence, l’expression « aimer son travail » est rarement définie avec précision.",
        "À travers plusieurs études impliquant des milliers d’employés, nous nous sommes rendu compte qu’aimer son travail n’a pas la même signification qu’être satisfait de son travail ou se sentir impliqué. Au contraire, cette locution est au croisement de trois situations professionnelles singulières.",
        "La première concerne l’enthousiasme pour son travail. […] La seconde a trait à l’engagement envers son entreprise. […] La troisième porte sur le lien avec l’autre au travail : se sentir émotionnellement connecté à ses collègues ou à l’équipe.",
        "Lorsque ces éléments convergent, l’amour de son métier peut constituer une ressource psychologique considérable. […] Les employés qui aimaient leur travail déclarent ressentir un meilleur bien-être psychologique et se sentent davantage impliqués au quotidien.",
        "Il existe toutefois certains inconvénients potentiels. […] Dans des environnements favorables, c’est sans doute un atout ; dans des environnements toxiques, c’est peut-être plus difficile de prendre du recul, de fixer ses limites ou se rendre compte que les exigences deviennent déraisonnables.",
        "Lorsqu’une organisation valorise un attachement émotionnel fort sans proposer une charge de travail réaliste, une rémunération équitable ou un respect des limites posé par l’employé, le dévouement peut se transformer en obligation.",
        "[…] L’amour ne peut être fabriqué, exigé ou traité comme un indicateur de performance. Il ne peut pas non plus se substituer à de bonnes pratiques de management. […] L’amour du travail ne remplace pas un bon management ; il en dépend.",
        "<em>D'après Julian Barling et ses co-auteurs (Queen’s University, University of Calgary, Simon Fraser University), The Conversation, 2 juillet 2026.</em>"),
      cau: [
        qcm("Quelle est l'idée principale du texte ?", "Aimer son travail est positif, mais cela ne remplace pas un bon management.", ["Il faut éviter d'aimer son travail.", "Seules les entreprises riches rendent leurs employés heureux."], "« L’amour du travail ne remplace pas un bon management ; il en dépend »."),
        qcm("Selon les auteurs, l'expression « aimer son travail »…", "est souvent utilisée mais rarement définie", ["est réservée aux métiers artistiques", "n'apparaît jamais dans les offres d'emploi"], "« Malgré son omniprésence, l’expression… est rarement définie avec précision »."),
        vf("Pour les auteurs, aimer son travail signifie la même chose qu'être satisfait de son travail.", false, "« aimer son travail n’a pas la même signification qu’être satisfait de son travail ou se sentir impliqué »"),
        qcm("Les trois éléments de l'amour du travail sont…", "l'enthousiasme, l'engagement envers l'entreprise et le lien avec les collègues", ["le salaire, les horaires et les vacances", "la réussite, la promotion et le prestige"], "Le texte présente « la première… la seconde… la troisième »."),
        qcm("Quand les trois éléments sont réunis, l'amour du travail…", "aide au bien-être psychologique", ["provoque toujours de la fatigue", "n'a aucun effet"], "« Les employés qui aimaient leur travail déclarent ressentir un meilleur bien-être psychologique »."),
        qcm("Dans un environnement toxique, aimer son travail peut…", "empêcher de fixer ses limites", ["protéger contre le stress", "augmenter le salaire"], "« c’est peut-être plus difficile de prendre du recul, de fixer ses limites »."),
        vf("Selon le texte, le dévouement peut devenir une obligation si l'entreprise ne respecte pas ses employés.", true, "« le dévouement peut se transformer en obligation »"),
        qcm("Que signifie « L’amour ne peut être fabriqué, exigé » ?", "Une entreprise ne peut pas imposer à ses employés d'aimer leur travail.", ["Il faut payer davantage les employés.", "Les employés doivent cacher leurs émotions."], "L'amour du travail naît de bonnes conditions, il ne se commande pas."),
        qcm("Le ton du texte est…", "nuancé", ["humoristique", "indigné"], "Les auteurs présentent les avantages puis les « inconvénients potentiels »."),
      ] },
  ],
  PE: { tieuDe: "Production écrite B2 · Đề 3 : les cuisines fantômes dans votre ville", consigne: "<p><strong>Production écrite : 60 minutes, 250 mots minimum.</strong></p><blockquote><p><strong>Une cuisine fantôme s'installe rue de la Gare</strong><br>Un ancien café du centre-ville va devenir une cuisine qui prépare uniquement des repas livrés. Les commerçants du quartier sont inquiets.</p></blockquote><p>Vous habitez ce quartier. Vous écrivez au courrier des lecteurs du journal local pour donner votre avis sur ce projet. Vous présentez des arguments précis, illustrés d'exemples, et vous faites des propositions pour garder une rue vivante.</p>",
    questions: [{ type: "open", prompt: "Rédigez votre lettre au courrier des lecteurs (250 mots minimum)." }] },
  PO: { tieuDe: "Production orale B2 · Đề 3",
    consigne: p("<strong>Production orale : 20 minutes environ.</strong> 30 minutes de préparation.", "Vous tirez au sort deux documents et vous en choisissez un. Vous dégagez le problème soulevé par ce document, puis vous présentez votre opinion sous la forme d'un exposé argumenté de 5 à 7 minutes. Ensuite, vous défendez votre point de vue au cours d'un débat avec l'examinateur."),
    bocTham: { chuanBi: 30, phan: [
      { ten: "Monologue suivi puis exercice en interaction", cachLam: "Choisissez un document.", soRut: 2, sujets: [
        S("1", "<strong>À quoi pourrait ressembler une journée à l’école en 2035 ?</strong>", "En 2035, l’intelligence artificielle et les technologies immersives pourraient transformer profondément les façons d’apprendre. Les examens traditionnels laisseraient alors place à des projets collaboratifs et à une évaluation continue des compétences. On peut imaginer que les enseignants resteraient essentiels, mais leur rôle évoluerait vers l’accompagnement personnalisé et le développement de l’esprit critique.", "<em>D'après Guillermo José Navarro del Toro, The Conversation, 9 octobre 2026.</em>"),
        S("2", "<strong>Apprendre à bien manger</strong>", "L’éducation à l’alimentation est un enjeu essentiel à tous les âges de la vie. Pour bien manger, il faut un minimum de connaissances en santé. Mais il s’agit aussi de comprendre comment les aliments arrivent dans notre assiette. S’il y a un certain nombre de paramètres à respecter, y a-t-il pour autant une seule recette ?", "<em>D'après Kim Hyeongyeong, The Conversation, 3 octobre 2026.</em>"),
        S("3", "<strong>Ce que l’accès aux toilettes publiques révèle des inégalités de genre dans les villes</strong>", "Dans les gares, dans les festivals ou sur les stations d’autoroutes, accéder aux toilettes relève pour les femmes de l’épreuve de patience. Le design uniformisé des toilettes publiques cache des normes de genre qui produisent des inégalités. Loin d’être triviale, la question des sanitaires interroge la conception des espaces urbains.", "<em>D'après Belen Martinez, The Conversation, 4 août 2026.</em>"),
        S("4", "<strong>Les zones à faibles émissions (ZFE)</strong>", "En France, les zones à faibles émissions (ZFE) se trouvent au cœur d’une saga politique et réglementaire ; accusées d’être socialement injustes, elles alimentent la défiance d’une partie de la population. […] Le groupe des « alliés potentiels », convaincus des bienfaits de la ZFE pour la santé publique, mais inquiets de ses potentielles répercussions sociales, est un groupe qu’il est possible de convaincre à travers des mesures d’accompagnement ciblées.", "<em>D'après Carole Treibich, The Conversation, 6 octobre 2026.</em>")] },
    ] } },
};

/* ══════════════════════════ C1 · Đề 2 ══════════════════════════ */
export const C1 = { level: "C1", ten: "DALF C1 · Đề 2", kieuNghe: "b2",
  CO: [
    { ten: "c1-de2-co1", hai: true, tieuDe: "Écoute C1 · Đề 2 · Exercice 1 : l'insertion professionnelle des jeunes", gioiThieu: "Vous allez entendre un entretien radiophonique sur l'emploi des jeunes.",
      doan: [d("sage", RADIO, "On entend souvent dire que les jeunes ne veulent plus travailler, qu'ils changent d'emploi au moindre désaccord, qu'ils refusent les heures supplémentaires. Ce discours résiste-t-il à l'analyse ? Nous en parlons avec une sociologue du travail. Bonjour."),
        d("shimmer", KHACH, "Bonjour. Il faut d'abord rappeler que ces reproches ne sont pas nouveaux. Si l'on relit la presse des années quatre-vingt ou quatre-vingt-dix, on y trouve exactement les mêmes plaintes sur la jeunesse de l'époque, c'est-à-dire sur les parents d'aujourd'hui. Chaque génération d'employeurs semble découvrir que les jeunes sont différents."),
        d("sage", RADIO, "Mais les comportements ont tout de même changé, non ?"),
        d("shimmer", KHACH, "Ils ont changé, oui, mais pas forcément dans le sens qu'on imagine. Ce que je constate dans mes entretiens, c'est une forme de lucidité. Beaucoup de jeunes ont vu leurs parents s'épuiser dans des entreprises qui les ont ensuite licenciés. Ils en ont tiré une conclusion assez rationnelle : l'engagement doit être réciproque. Si l'employeur propose un salaire correct, de la formation et des perspectives, ils s'investissent. Sinon, ils partent. Ce n'est pas de l'infidélité, c'est une négociation."),
        d("sage", RADIO, "Les employeurs, eux, parlent souvent de difficultés de recrutement."),
        d("shimmer", KHACH, "Et c'est une réalité dans certains secteurs. Mais quand on interroge les mêmes employeurs, une partie reconnaît que les salaires proposés ne sont pas attractifs. Autrement dit, le problème n'est pas seulement la motivation des jeunes, c'est aussi ce qu'on leur offre. J'ajouterais un point souvent oublié : les jeunes peu diplômés ne sont pas concernés par ces débats sur la quête de sens. Pour eux, la priorité reste très concrète : un contrat stable et un revenu suffisant."),
        d("sage", RADIO, "Que faudrait-il changer, selon vous ?"),
        d("shimmer", KHACH, "D'abord, arrêter de parler des jeunes comme d'un bloc homogène. Ensuite, investir dans l'accueil des nouveaux salariés : un tuteur, un vrai parcours d'intégration. Les entreprises qui le font fidélisent beaucoup mieux. Enfin, être transparent sur les conditions de travail dès l'offre d'emploi. La confiance se construit dès le premier contact.")],
      cau: [
        qcm("Selon la sociologue, les reproches faits aux jeunes…", "existaient déjà dans les générations précédentes", ["sont apparus avec Internet", "concernent seulement les étudiants"], "« ces reproches ne sont pas nouveaux… les mêmes plaintes sur la jeunesse de l'époque »."),
        qcm("Que veut dire « les parents d'aujourd'hui » dans ce contexte ?", "Les jeunes critiqués autrefois sont devenus les parents actuels.", ["Les parents critiquent leurs enfants.", "Les parents travaillent plus que leurs enfants."], "Les jeunes des années 80-90 sont les parents d'aujourd'hui."),
        qcm("D'après la sociologue, l'attitude des jeunes au travail relève surtout…", "d'une forme de lucidité", ["de la paresse", "de l'ignorance du monde du travail"], "« Ce que je constate… c'est une forme de lucidité »."),
        qcm("Qu'est-ce qui explique cette lucidité ?", "Ils ont vu leurs parents s'épuiser puis être licenciés.", ["Ils ont fait de longues études.", "Ils ont voyagé à l'étranger."], "« Beaucoup de jeunes ont vu leurs parents s'épuiser dans des entreprises qui les ont ensuite licenciés »."),
        qcm("Pour les jeunes, l'engagement au travail doit être…", "réciproque", ["total", "temporaire"], "« l'engagement doit être réciproque »."),
        qcm("Comment la sociologue interprète-t-elle le fait que les jeunes quittent leur emploi ?", "comme une négociation", ["comme de l'infidélité", "comme un manque de courage"], "« Ce n'est pas de l'infidélité, c'est une négociation »."),
        qcm("Qu'a reconnu une partie des employeurs ?", "Les salaires proposés ne sont pas attractifs.", ["Les jeunes sont plus compétents.", "Ils recrutent trop de jeunes."], "« une partie reconnaît que les salaires proposés ne sont pas attractifs »."),
        qcm("Pour les jeunes peu diplômés, la priorité est…", "un contrat stable et un revenu suffisant", ["la quête de sens", "le télétravail"], "« la priorité reste très concrète : un contrat stable et un revenu suffisant »."),
        qcm("Quelle mesure les entreprises qui fidélisent bien appliquent-elles ?", "un vrai parcours d'accueil avec un tuteur", ["des primes de départ", "des horaires plus longs"], "« investir dans l'accueil… un tuteur, un vrai parcours d'intégration »."),
        qcm("Selon la sociologue, la confiance se construit…", "dès l'offre d'emploi", ["après plusieurs années", "grâce aux réseaux sociaux"], "« être transparent… dès l'offre d'emploi. La confiance se construit dès le premier contact »."),
      ] },
    { ten: "c1-de2-co2", hai: false, tieuDe: "Écoute C1 · Đề 2 · Exercice 2 : les toilettes publiques et l'égalité", gioiThieu: "Vous allez entendre une courte chronique radio.",
      doan: [d("onyx", RADIO, "Dans les théâtres, les gares ou les festivals, le constat est le même : les femmes font la queue devant les toilettes, les hommes presque jamais. Pourquoi ? Dans la plupart des bâtiments, on attribue aux hommes et aux femmes une surface à peu près égale. Cela paraît équitable. Mais les toilettes pour hommes combinent cabines et urinoirs, qui prennent moins de place : à surface égale, elles servent donc davantage de personnes. Des chercheuses y voient l'exemple d'une égalité de façade qui produit en réalité des inégalités, et plaident pour que la conception des espaces publics tienne compte des usages réels.")],
      cau: [
        qcm("Quel constat la chronique fait-elle ?", "Les femmes attendent beaucoup plus longtemps devant les toilettes.", ["Il n'y a pas assez de toilettes dans les gares.", "Les toilettes sont souvent sales."], "« les femmes font la queue devant les toilettes, les hommes presque jamais »."),
        qcm("Comment l'espace des toilettes est-il généralement réparti ?", "avec une surface à peu près égale pour les hommes et les femmes", ["avec plus de place pour les femmes", "selon le nombre de visiteurs"], "« on attribue aux hommes et aux femmes une surface à peu près égale »."),
        qcm("Pourquoi les toilettes pour hommes servent-elles plus de personnes ?", "Les urinoirs prennent moins de place.", ["Les hommes sont moins nombreux.", "Elles sont ouvertes plus longtemps."], "« les toilettes pour hommes combinent cabines et urinoirs, qui prennent moins de place »."),
        qcm("Que signifie « une égalité de façade » ?", "une égalité apparente qui cache des inégalités réelles", ["une égalité inscrite dans la loi", "une égalité entre les bâtiments"], "« une égalité de façade qui produit en réalité des inégalités »."),
        qcm("Que demandent les chercheuses ?", "concevoir les espaces selon les usages réels", ["fermer les toilettes mixtes", "supprimer les urinoirs"], "« que la conception des espaces publics tienne compte des usages réels »."),
      ] },
  ],
  CE: [
    { tieuDe: "Lecture C1 · Đề 2 : lutter contre les informations toxiques", consigne: "<p><strong>Compréhension des écrits.</strong> Lisez le texte puis répondez aux questions.</p>",
      readingText: p("<strong>Comment lutter contre les informations toxiques ? Trois leviers pour protéger le débat démocratique</strong>",
        "Qu’elles soient émises par des entreprises pour préserver leurs marchés, par des États cherchant à justifier leurs prétentions territoriales, par des militants promouvant leur agenda ou par des individus en quête de reconnaissance, les informations toxiques saturent aujourd’hui l’espace informationnel. Les informations toxiques sont définies comme tout contenu dégradant la capacité des destinataires à comprendre leur environnement et à agir dans leur intérêt ou dans l’intérêt général.",
        "Face à ce TsuNumi (tsunami numérique) d’informations douteuses ou sorties de leur contexte, d’opinions présentées comme des faits, de vérités alternatives, il est difficile de savoir qui croire et que penser. Sombrer dans un relativisme consistant à mettre toutes les informations sur le même plan devient tentant, avec des effets délétères sur la démocratie. Car celle-ci ne repose pas seulement sur le suffrage universel et sur l’État de droit. Elle s’appuie aussi sur la pratique du débat public, fondé sur l’accès de chacun à des informations fiables.",
        "[…] Après deux ans de mise en œuvre du DSA*, sur la dizaine de procédures qui ont été initiées au titre de sa violation, seules quatre ont été clôturées. […] La quatrième procédure a débouché sur la condamnation d’X/Twitter à 120 M€ d’amende. Ce montant, dérisoire par rapport aux profits tirés des comportements délictueux, est intégré au cost of doing business et n’a donc aucun réel effet incitatif.",
        "Le cadre européen ne pèche donc pas tant par son architecture, certes perfectible, que par la timidité de sa mise en application. […] Mais la régulation, pour importante qu’elle soit, n’est qu’une des composantes d’un vaste dispositif de lutte contre les informations toxiques. D’après nos travaux, trois types de lutte doivent être simultanément menés : des mesures d’atténuation des émissions toxiques et de leurs effets ; des modalités d’adaptation à un contexte dans lequel le faux et le manipulatoire ne pourront être totalement éradiqués ; des initiatives de contre-offensive visant à donner l’envie et les moyens de faire valoir le vrai.",
        "Autre instrument, et non le moindre, pour tarir l’infox : couper son financement publicitaire, qui se chiffre en dizaines de milliards de dollars. […] Se tournant maintenant vers l’aval de la chaîne, selon le psychiatre Serge Tisseron, l’information toxique exploite les fragilités psychologiques et sociales, qu’elle contribue à renforcer. Ainsi, les « infoxiqués » sont-ils pour une grande part des personnes en manque de respect, d’écoute et de visibilité. Afin de réduire leur appétence pour les vérités alternatives, il faudrait donc alléger leur colère et leur frustration, les considérer avec bienveillance, prendre le temps d’aller à leur rencontre et de les entendre.",
        "Ensuite, l’éducation aux médias et à l’information, animée en France par le CLEMI, à l’école au collège et au lycée, est indispensable. D’une part, pour stimuler la prise de conscience de nos biais cognitifs, comme celui de confirmation, par lequel nous accordons plus de foi aux informations confortant nos croyances a priori. D’autre part, pour développer l’esprit critique : non pas se méfier de tout, mais doser les degrés de confiance accordés à diverses sources. Notons que les faussaires informationnels dévoient l’esprit critique, dont souvent ils se réclament.",
        "[…] S’agissant enfin de contre-offensive du vrai contre le faux, une action prioritaire mais de longue haleine consiste à construire un socle de savoir scientifique de base au sein de la population dans son ensemble. […] Les soldats de la résistance à l’information toxique doivent être convenablement armés.",
        "<em>D'après Nicolas Curien et Thierry Weil, Académie des technologies, The Conversation, 26 juillet 2026.</em>",
        "<small>* DSA : règlement européen sur les services numériques.</small>"),
      cau: [
        qcm("D'après le texte, une information toxique est…", "un contenu qui réduit notre capacité à comprendre notre environnement et à agir", ["une information publiée par un État", "une rumeur diffusée uniquement par des individus"], "« tout contenu dégradant la capacité des destinataires à comprendre leur environnement et à agir »."),
        qcm("Quel risque le « relativisme » fait-il courir à la démocratie ?", "mettre toutes les informations sur le même plan", ["supprimer le suffrage universel", "interdire les réseaux sociaux"], "« un relativisme consistant à mettre toutes les informations sur le même plan »."),
        vf("Pour les auteurs, la démocratie repose uniquement sur le vote et l'État de droit.", false, "« celle-ci ne repose pas seulement sur le suffrage universel et sur l’État de droit »"),
        qcm("Pourquoi l'amende infligée à X/Twitter est-elle jugée inefficace ?", "Elle est trop faible par rapport aux profits.", ["Elle n'a jamais été payée.", "Elle a été annulée par la justice."], "« Ce montant, dérisoire par rapport aux profits… n’a donc aucun réel effet incitatif »."),
        qcm("Selon les auteurs, le principal défaut du cadre européen est…", "la timidité de son application", ["son architecture", "son coût"], "« ne pèche donc pas tant par son architecture… que par la timidité de sa mise en application »."),
        qcm("Le deuxième type de lutte (« adaptation ») part du principe que…", "le faux ne pourra jamais disparaître complètement", ["la régulation suffira", "les plateformes vont changer d'elles-mêmes"], "« un contexte dans lequel le faux et le manipulatoire ne pourront être totalement éradiqués »."),
        vf("Les auteurs proposent de priver l'infox de ses revenus publicitaires.", true, "« couper son financement publicitaire, qui se chiffre en dizaines de milliards de dollars »"),
        qcm("Selon Serge Tisseron, les personnes sensibles à l'infox sont souvent…", "en manque de respect, d'écoute et de visibilité", ["peu diplômées", "très actives sur les réseaux"], "« des personnes en manque de respect, d’écoute et de visibilité »."),
        qcm("Que recommandent les auteurs à l'égard de ces personnes ?", "les écouter avec bienveillance", ["les exclure des réseaux sociaux", "les sanctionner financièrement"], "« les considérer avec bienveillance, prendre le temps d’aller à leur rencontre et de les entendre »."),
        qcm("Qu'est-ce que le « biais de confirmation » ?", "accorder plus de foi aux informations qui confortent nos croyances", ["vérifier deux fois chaque information", "croire les sources officielles"], "« celui de confirmation, par lequel nous accordons plus de foi aux informations confortant nos croyances »."),
        qcm("Pour les auteurs, développer l'esprit critique signifie…", "doser la confiance accordée aux différentes sources", ["se méfier de tout", "ne lire que la presse papier"], "« non pas se méfier de tout, mais doser les degrés de confiance »."),
        qcm("Que veut dire la dernière phrase (« Les soldats… doivent être convenablement armés ») ?", "Ceux qui défendent l'information fiable ont besoin de moyens et de ressources.", ["Il faut une intervention militaire.", "Les journalistes doivent être protégés par la police."], "Métaphore guerrière : la « contre-offensive » doit disposer de moyens."),
      ] },
  ],
  PE: { tieuDe: "Production écrite C1 · Đề 2 : synthèse et essai sur l'information", consigne: "<p><strong>Production écrite : 2 h 30.</strong></p><p>À partir de votre lecture du texte « Comment lutter contre les informations toxiques ? » et de votre expérience, rédigez un <strong>essai argumenté</strong> (250 mots minimum) en réponse à la question suivante :</p><blockquote><p>« Faut-il obliger les plateformes numériques à contrôler les informations qu'elles diffusent, au risque de limiter la liberté d'expression ? »</p></blockquote><p>Votre essai présentera une introduction avec une problématique, un développement structuré et une conclusion.</p>",
    questions: [{ type: "open", prompt: "Rédigez votre essai argumenté (250 mots minimum)." }] },
  PO: { tieuDe: "Production orale C1 · Đề 2",
    consigne: p("<strong>Production orale : 30 minutes environ.</strong> 60 minutes de préparation.", "Vous tirez au sort deux thèmes et vous en choisissez un. À partir du document, vous préparez un <strong>exposé</strong> structuré (8 à 10 minutes) avec une problématique, un plan et une conclusion, puis vous participez à un <strong>entretien</strong> avec le jury (15 à 20 minutes)."),
    bocTham: { chuanBi: 60, phan: [
      { ten: "Exposé puis entretien avec le jury", cachLam: "Choisissez un thème.", soRut: 2, sujets: [
        S("1", "<strong>Les jeunes et le travail</strong>", "« Les sondages, les conférences ou les articles sur la « génération Z » se succèdent et, avec eux, des récits aussi prévisibles [que des chansons de mariage]. Les jeunes ne voudraient plus travailler […]. Et si leur comportement révélait surtout une très grande rationalité ? »", "<em>D'après Jean Pralong, The Conversation, 7 avril 2026.</em>"),
        S("2", "<strong>Communiquer en temps réel</strong>", "« On pourrait croire que le numérique est venu récemment satisfaire un vœu typique de la modernité, âge de la vitesse : mettre fin à l’attente […]. Loin d’avoir disparu, l’attente s’est profondément métamorphosée. »", "<em>D'après Jérôme Bourdon, The Conversation, 7 octobre 2026.</em>"),
        S("3", "<strong>Villes et inégalités</strong>", "« Le design uniformisé des toilettes publiques cache des normes de genre qui produisent des inégalités. Loin d’être triviale, la question des sanitaires interroge la conception des espaces urbains. »", "<em>D'après Belen Martinez, The Conversation, 4 août 2026.</em>"),
        S("4", "<strong>Écologie et justice sociale</strong>", "« En France, les zones à faibles émissions (ZFE) […] accusées d’être socialement injustes, […] alimentent la défiance d’une partie de la population. »", "<em>D'après Carole Treibich, The Conversation, 6 octobre 2026.</em>")] },
    ] } },
};

export const CAC_DE = [A1, A2, B1, B2, C1];
