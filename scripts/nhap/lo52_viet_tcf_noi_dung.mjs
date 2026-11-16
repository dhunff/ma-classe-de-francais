/* Lô 52 (16/11/2026): NỘI DUNG bài Viết TCF cho cây Luyện thi TCF (kyNangTCF.js), TCF-PE-1 đến PE-4.
 * Khung theo format TCF (FEI): tâche 1 tin nhắn 60 à 120 mots; tâche 2 kể trải nghiệm có nhận xét 120 à 150 mots;
 * tâche 3 tóm hai quan điểm (40 à 60 mots) rồi nêu ý kiến (80 à 120 mots), tổng 120 à 180 mots.
 *   Bài PE-1..3: { sujet, docs?, tache, qcm: [[câu hỏi, đúng, [sai…], lời giải]], model } : đề hiện ở đầu bài,
 *   vài câu QCM phân tích đề, rồi MỘT câu viết (open) đúng tâche đó; nộp xong AI chấm theo tiêu chí TCF.
 *   Bài PE-4: { taches: [{ tache, sujet, docs?, model }] } : ba câu viết, giới hạn 60 phút.
 * Toàn bộ do FRACILE soạn, nhân vật và số liệu hư cấu. Không dùng dấu gạch dài. Lời giải tiếng Việt; đoạn
 * trích « » phải có nguyên văn trong đề, tài liệu hoặc phương án (máy dựng kiểm). Máy dựng: lo52_viet_tcf.mjs. */

const GH = { 1: "(60 mots minimum, 120 mots maximum)", 2: "(120 mots minimum, 150 mots maximum)", 3: "(120 mots minimum, 180 mots maximum)" };

export const BAI = [
  /* ═══════════ TCF-PE-1 : Tâche 1, tin nhắn (60 à 120 mots) ═══════════ */
  {
    ma: "TCF-PE-1", vong: "hoc", tieuDe: "Écriture TCF : message à des amis", tache: 1,
    sujet: `Vous venez d'emménager dans un nouvel appartement. Vous écrivez un message à vos amis pour leur décrire votre logement et votre quartier, et pour les inviter à venir vous voir. ${GH[1]}`,
    qcm: [
      ["À qui écrivez-vous ?", "À des amis.", ["À votre propriétaire.", "À vos nouveaux voisins de palier."],
        "Đề ghi « un message à vos amis »: giọng thân mật. Viết cho nhiều bạn thì dùng « vous » số nhiều."],
      ["Que devez-vous faire dans ce message ?", "Décrire le logement et le quartier, puis inviter.", ["Raconter le déménagement.", "Demander de l'aide pour porter les cartons."],
        "Đề có hai việc: « leur décrire votre logement et votre quartier » và « pour les inviter à venir vous voir »."],
      ["Quelle longueur est acceptée ?", "Entre 60 et 120 mots.", ["Au moins 120 mots, sans maximum.", "Moins de 60 mots, pour être bref."],
        "« 60 mots minimum, 120 mots maximum »: quá ngắn hay quá dài đều bị trừ ở tiêu chí phù hợp đề."],
    ],
    model: "Salut à tous !\nÇa y est, j'ai enfin déménagé ! Mon nouvel appartement est au troisième étage d'un vieil immeuble, rue des Lilas. Il est petit mais très lumineux : il y a un salon avec un balcon, une chambre et une cuisine toute neuve. Le quartier est calme et vivant à la fois : il y a un marché le samedi, une boulangerie en bas de chez moi et un grand parc à cinq minutes. Je vous invite à dîner samedi 14 à 19 h pour fêter ça. Dites-moi si vous pouvez venir !\nBises,\nLinh",
    tu: ["emménager (verbe) : dọn đến ở", "lumineux (adjectif) : nhiều ánh sáng", "en bas de chez moi : ngay dưới nhà tôi", "fêter (verbe) : ăn mừng"],
    meo: ["Tâche 1 chấm cả việc làm ĐỦ các ý của đề: gạch dưới từng động từ của đề (décrire, inviter…) và kiểm lại trước khi nộp.", "Mở và đóng thư đúng giọng: Salut / Bises cho bạn bè, Bonjour / Cordialement cho người lạ."],
  },
  {
    ma: "TCF-PE-1", vong: "on", tieuDe: "Écriture TCF : courriel à un collègue", tache: 1,
    sujet: `Vous ne pourrez pas aller à une réunion importante demain. Vous écrivez un courriel à votre collègue pour lui expliquer pourquoi, lui dire ce que vous avez préparé et lui demander de vous remplacer. ${GH[1]}`,
    qcm: [
      ["Quel registre convient ?", "Poli mais simple, comme entre collègues.", ["Très familier.", "Très administratif."],
        "Viết cho « votre collègue »: lịch sự, gọn, không cần văn phong hành chính."],
      ["Combien d'informations faut-il donner ?", "Trois : la raison, ce qui est prêt, la demande.", ["Une seule : la raison de votre absence demain.", "Deux : la raison de l'absence et la date de votre retour au bureau."],
        "Đề đòi « lui expliquer pourquoi », « lui dire ce que vous avez préparé » và « lui demander de vous remplacer »."],
      ["Quelle formule de fin est la plus adaptée ?", "Merci d'avance, à bientôt.", ["Je vous prie d'agréer mes salutations distinguées.", "Gros bisous, je t'adore !"],
        "Giữa đồng nghiệp, « Merci d'avance, à bientôt » vừa lịch sự vừa tự nhiên. Công thức kia trang trọng quá, còn « Gros bisous » thì quá thân mật."],
    ],
    model: "Objet : réunion de demain\nBonjour Clara,\nJe suis désolé, mais je ne pourrai pas venir à la réunion avec le client demain matin : mon fils est malade et je dois rester avec lui. J'ai déjà préparé la présentation et le budget, tu trouveras les deux fichiers dans le dossier partagé du projet. Est-ce que tu pourrais présenter à ma place ? Tu connais bien le dossier, je suis sûr que tout se passera bien. Je reste joignable par téléphone si tu as une question.\nMerci d'avance, à bientôt,\nMinh",
    tu: ["joignable (adjectif) : liên lạc được", "le dossier partagé : thư mục dùng chung", "à ma place : thay tôi", "remplacer (verbe) : thay thế"],
    meo: ["Đề có ba động từ (expliquer, dire, demander) thì bài cần ba ý rõ ràng, mỗi ý một hai câu.", "Dòng « Objet » ngắn giúp thư nhìn đúng kiểu email công việc."],
  },

  /* ═══════════ TCF-PE-2 : Tâche 2, kể trải nghiệm có nhận xét (120 à 150 mots) ═══════════ */
  {
    ma: "TCF-PE-2", vong: "hoc", tieuDe: "Écriture TCF : témoignage sur une rencontre", tache: 2,
    sujet: `Le site de votre association de quartier publie des témoignages sur le thème « Une rencontre qui a changé ma vie ». Vous racontez une rencontre importante et vous expliquez ce qu'elle vous a apporté. ${GH[2]}`,
    qcm: [
      ["Qui va lire votre texte ?", "Les membres et les visiteurs du site.", ["Seulement la personne que vous avez rencontrée.", "Le président de l'association, en privé."],
        "Bài đăng trên « Le site de votre association de quartier »: nhiều người đọc, không phải thư riêng."],
      ["Que faut-il ajouter au récit ?", "Ce que cette rencontre vous a apporté.", ["La biographie de la personne.", "Des conseils pour se faire des amis."],
        "Ngoài kể, đề đòi « vous expliquez ce qu'elle vous a apporté »: phần nhận xét, cảm nghĩ của bạn."],
      ["Quels temps utiliser pour raconter ?", "Le passé composé et l'imparfait.", ["Le futur simple et le conditionnel présent.", "Seulement le présent de l'indicatif."],
        "Đề nói « Vous racontez une rencontre importante »: chuyện đã qua, dùng passé composé cho sự việc, imparfait cho bối cảnh."],
    ],
    model: "Il y a cinq ans, je venais d'arriver en France et je ne connaissais personne. Un soir, à la bibliothèque, une dame âgée m'a demandé de l'aider à utiliser l'ordinateur. Elle s'appelait Odette et elle avait quatre-vingts ans. Pour me remercier, elle m'a proposé de corriger mon français une fois par semaine, autour d'un thé. Pendant deux ans, nous nous sommes vues tous les mercredis.\nCette rencontre m'a apporté bien plus qu'un meilleur niveau de français. Grâce à Odette, j'ai compris que l'on peut apprendre à tout âge et qu'une amitié peut naître entre deux personnes très différentes. Aujourd'hui, à mon tour, j'aide chaque semaine des personnes âgées de mon quartier avec leur téléphone. C'est ma façon de lui dire merci.",
    tu: ["un témoignage : bài chia sẻ trải nghiệm", "apporter (verbe) : mang lại", "naître (verbe) : nảy sinh", "à mon tour : đến lượt tôi"],
    meo: ["Chia bài làm hai đoạn: đoạn kể (chuyện gì, ở đâu, khi nào) và đoạn nhận xét (điều mình rút ra).", "Thiếu đoạn nhận xét thì tâche 2 khó vượt mức B1, dù câu chữ đúng hết."],
  },
  {
    ma: "TCF-PE-2", vong: "on", tieuDe: "Écriture TCF : article sur un événement", tache: 2,
    sujet: `Vous avez participé à un événement (festival, salon, compétition sportive…) dans votre ville. Vous écrivez un article pour le journal en ligne de votre entreprise : vous racontez cet événement et vous donnez votre opinion pour encourager, ou non, vos collègues à y participer l'année prochaine. ${GH[2]}`,
    qcm: [
      ["Quel est l'objectif de l'article ?", "Conseiller les collègues pour l'an prochain.", ["Vendre des billets pour la prochaine édition de l'événement.", "Se plaindre officiellement auprès des organisateurs."],
        "Đề nói « pour encourager, ou non, vos collègues à y participer l'année prochaine »."],
      ["Votre opinion doit-elle être positive ?", "Non, elle peut être positive ou négative.", ["Oui, il faut toujours encourager les collègues.", "Non, l'article doit rester totalement neutre."],
        "« encourager, ou non »: bạn được chọn khen hay chê, miễn là có lý do."],
      ["Qu'est-ce qui rend l'article plus convaincant ?", "Des détails précis et un exemple vécu.", ["Des phrases très longues et très compliquées.", "La liste complète de tous les participants de l'événement."],
        "Nhận xét kèm chi tiết thật thuyết phục hơn lời khen chung chung. Đề hỏi « vous racontez cet événement »: kể bằng chi tiết cụ thể."],
    ],
    model: "Le Salon du livre de Lille : à refaire !\nLe mois dernier, avec trois collègues du service comptable, j'ai passé une journée au Salon du livre de Lille. Plus de deux cents auteurs étaient présents et l'ambiance était chaleureuse. J'ai assisté à une rencontre passionnante avec une autrice de romans policiers, puis à un atelier d'écriture où nous avons inventé une histoire à plusieurs.\nJe recommande vivement cet événement. D'abord, il est accessible à tous : l'entrée coûte seulement cinq euros. Ensuite, c'est une excellente occasion de mieux connaître ses collègues en dehors du bureau. Seul petit regret : il y avait beaucoup de monde l'après-midi, il vaut donc mieux arriver tôt. L'année prochaine, pourquoi ne pas y aller en groupe ?",
    tu: ["un salon : hội chợ, triển lãm", "chaleureux (adjectif) : ấm áp", "recommander vivement : rất khuyên", "en dehors du bureau : ngoài giờ làm việc"],
    meo: ["Bài báo nên có tiêu đề ngắn nêu luôn ý kiến (« à refaire ! », « une déception »).", "Một ý trái chiều nhỏ (« Seul petit regret ») làm nhận xét đáng tin hơn."],
  },

  /* ═══════════ TCF-PE-3 : Tâche 3, so sánh hai quan điểm rồi nêu ý kiến (120 à 180 mots) ═══════════ */
  {
    ma: "TCF-PE-3", vong: "hoc", tieuDe: "Écriture TCF : le téléphone à l'école", tache: 3,
    sujet: `Vous participez à un forum sur le thème : « Faut-il interdire les téléphones portables à l'école ? » Vous lisez les deux documents ci-dessous. Vous résumez les deux points de vue (40 à 60 mots), puis vous donnez votre opinion (80 à 120 mots). ${GH[3]}`,
    docs: [
      "<strong>Document 1</strong> : « Depuis que notre collège a interdit les portables, les élèves se parlent à nouveau pendant la récréation. Les cas de harcèlement en ligne ont aussi diminué. » <em>Sandrine, professeure de mathématiques</em>",
      "<strong>Document 2</strong> : « Interdire, c'est facile. Mais le téléphone est aussi un outil : dictionnaire, calculatrice, recherches. L'école devrait apprendre aux jeunes à bien l'utiliser au lieu de le cacher. » <em>Yanis, parent d'élève</em>",
    ],
    qcm: [
      ["Que pense Sandrine ?", "L'interdiction a amélioré la vie des élèves.", ["Le téléphone est un très bon outil pour travailler en classe.", "Les élèves utilisent beaucoup trop la calculatrice."],
        "Sandrine kể từ khi cấm, học sinh « se parlent à nouveau » và bắt nạt trên mạng « ont aussi diminué »."],
      ["Que propose Yanis ?", "Éduquer les jeunes à bien l'utiliser.", ["Interdire le téléphone dans tous les collèges de France.", "Remplacer les téléphones par des ordinateurs portables."],
        "Yanis viết « L'école devrait apprendre aux jeunes à bien l'utiliser »."],
      ["Quelle phrase résume correctement les deux points de vue ?", "Alors que Sandrine approuve l'interdiction, Yanis y voit un outil.", ["Sandrine et Yanis veulent interdire le téléphone.", "Yanis pense que le harcèlement en ligne a complètement disparu."],
        "« Alors que » nối hai ý trái ngược: đúng cách tóm tắt ở phần đầu tâche 3, mỗi người một vế."],
      ["Dans la partie opinion, que faut-il éviter ?", "Recopier des phrases des documents.", ["Donner un exemple tiré de votre expérience.", "Annoncer votre avis avec « À mon avis »."],
        "Phần ý kiến phải bằng lời của bạn; câu chép lại từ tài liệu không chứng minh được trình độ. Mở ý bằng « À mon avis » là cách tốt."],
    ],
    model: "Pour Sandrine, professeure, l'interdiction des portables au collège a eu des effets positifs : les élèves communiquent davantage et le harcèlement en ligne a reculé. Yanis, parent d'élève, pense au contraire que le téléphone est un outil utile et que l'école devrait apprendre aux jeunes à s'en servir.\nÀ mon avis, ces deux positions ne s'opposent pas complètement. Je suis favorable à l'interdiction pendant les récréations, car les jeunes ont besoin de moments sans écran pour se parler et jouer. En revanche, interdire totalement le téléphone en classe me semble excessif. Par exemple, dans mon lycée, nous utilisions une application de dictionnaire pendant les cours de langues, sous le contrôle du professeur, et c'était très efficace. La meilleure solution serait donc une règle claire : téléphone rangé par défaut, mais utilisé quand l'enseignant le demande.",
    tu: ["le harcèlement en ligne : bắt nạt trên mạng", "reculer (verbe) : giảm, lùi lại", "se servir de : sử dụng", "par défaut : mặc định", "excessif (adjectif) : quá mức"],
    meo: ["Phần tóm tắt 40 à 60 mots: mỗi người một câu, viết lại bằng lời mình, không chép.", "Phần ý kiến 80 à 120 mots: nêu lập trường, một lý do, một ví dụ, một câu kết."],
  },
  {
    ma: "TCF-PE-3", vong: "on", tieuDe: "Écriture TCF : la semaine de quatre jours", tache: 3,
    sujet: `Le journal de votre ville ouvre un débat : « Faut-il travailler moins pour vivre mieux ? » Vous lisez les deux documents ci-dessous. Vous résumez les deux points de vue (40 à 60 mots), puis vous donnez votre opinion (80 à 120 mots). ${GH[3]}`,
    docs: [
      "<strong>Document 1</strong> : « Dans mon entreprise, nous travaillons quatre jours par semaine depuis un an. Je suis moins fatigué, je passe plus de temps avec mes enfants, et je suis plus efficace au travail. » <em>Karim, informaticien</em>",
      "<strong>Document 2</strong> : « La semaine de quatre jours, c'est bien pour les bureaux. Mais dans un hôpital ou un restaurant, qui va travailler le cinquième jour ? Il faudrait embaucher, et beaucoup d'entreprises n'en ont pas les moyens. » <em>Hélène, directrice d'une petite entreprise</em>",
    ],
    qcm: [
      ["Selon Karim, quel est l'avantage de la semaine de quatre jours ?", "Plus de temps libre et plus d'efficacité.", ["Un salaire plus élevé et des primes chaque mois.", "Des vacances d'été plus longues pour toute la famille."],
        "Karim: « je passe plus de temps avec mes enfants, et je suis plus efficace au travail »."],
      ["Quel problème Hélène soulève-t-elle ?", "Ce modèle ne convient pas à tous les métiers.", ["Les salariés travaillent moins bien.", "Les bureaux ferment trop tôt."],
        "Hélène hỏi « dans un hôpital ou un restaurant, qui va travailler le cinquième jour ? »."],
      ["Quel connecteur introduit bien votre opinion ?", "Pour ma part,", ["Selon Hélène,", "D'après le document 1,"],
        "« Pour ma part » mở phần ý kiến riêng; « Selon Hélène » và « D'après le document 1 » dẫn ý người khác, dùng ở phần tóm tắt."],
    ],
    model: "Karim, informaticien, travaille quatre jours par semaine et y voit surtout des avantages : moins de fatigue, plus de temps en famille et une meilleure efficacité. Hélène, cheffe d'entreprise, est plus réservée : selon elle, ce modèle ne peut pas s'appliquer partout, car certains secteurs devraient embaucher.\nPour ma part, je pense que la semaine de quatre jours est une bonne idée, mais qu'elle ne doit pas être imposée à tout le monde. Dans les métiers de bureau, elle permet de mieux concilier vie professionnelle et vie privée, et les salariés reposés font moins d'erreurs. Cependant, Hélène a raison : un petit restaurant ne peut pas fermer un jour de plus ni payer un employé supplémentaire. On pourrait donc laisser chaque secteur choisir son organisation. L'essentiel est de trouver un équilibre entre le bien-être des salariés et la santé des entreprises.",
    tu: ["embaucher (verbe) : tuyển dụng", "avoir les moyens de : có khả năng (tài chính)", "réservé (adjectif) : dè dặt", "concilier (verbe) : dung hoà", "imposer (verbe) : áp đặt"],
    meo: ["Tâche 3 đòi SO SÁNH: dùng alors que, tandis que, au contraire để nối hai người.", "Ý kiến hay nhất thường nhận phần đúng của cả hai bên rồi đề xuất một giải pháp."],
  },

  /* ═══════════ TCF-PE-4 : Ba tâche trong 60 phút ═══════════ */
  {
    ma: "TCF-PE-4", vong: "chot", tieuDe: "Écriture TCF : les trois tâches en 60 minutes", phut: 60,
    taches: [
      { tache: 1, sujet: `Un(e) ami(e) francophone va passer un week-end dans votre ville. Vous lui écrivez un message pour lui proposer un programme : lieux à visiter, restaurant, activité. ${GH[1]}`,
        model: "Coucou Sarah !\nJe suis trop contente que tu viennes ce week-end ! Voici mon programme. Samedi matin, on visitera la vieille ville et sa cathédrale, puis on montera à la tour de l'horloge : la vue est magnifique. À midi, je t'emmène dans un petit restaurant de spécialités locales, près du marché. L'après-midi, si le temps le permet, on louera des vélos pour faire le tour du lac. Dimanche, on pourra se reposer ou aller au musée, comme tu veux. Ça te va ?\nÀ samedi !\nMai" },
      { tache: 2, sujet: `Vous écrivez sur un blog de voyage : vous racontez un voyage qui s'est mal passé et vous expliquez ce que vous en avez appris. ${GH[2]}`,
        model: "L'été dernier, j'ai organisé un voyage de trois jours en Bretagne avec deux amis. Tout semblait parfait : le train était réservé, l'hôtel aussi. Malheureusement, le jour du départ, une grève a supprimé notre train. Nous avons dû louer une voiture à la dernière minute, beaucoup plus chère que prévu. Ensuite, arrivés à l'hôtel, nous avons découvert que notre réservation avait été annulée par erreur. Nous avons passé la première nuit dans une auberge de jeunesse bruyante.\nPourtant, ce voyage raté m'a beaucoup appris. Aujourd'hui, je prends toujours une assurance annulation et je vérifie mes réservations la veille. Surtout, j'ai compris que l'essentiel, c'est l'ambiance : malgré les problèmes, nous avons beaucoup ri, et c'est mon meilleur souvenir de vacances." },
      { tache: 3, sujet: `Un site d'information ouvre un débat : « Les musées doivent-ils être gratuits ? » Vous lisez les deux documents ci-dessous. Vous résumez les deux points de vue (40 à 60 mots), puis vous donnez votre opinion (80 à 120 mots). ${GH[3]}`,
        docs: [
          "<strong>Document 1</strong> : « Les musées gratuits attirent des visiteurs qui n'y seraient jamais allés : familles modestes, jeunes, curieux. La culture doit être accessible à tous. » <em>Paul, guide-conférencier</em>",
          "<strong>Document 2</strong> : « Un musée coûte cher : gardiens, restauration des œuvres, chauffage. Si l'entrée est gratuite, ce sont les impôts de tous qui paient, même pour ceux qui ne visitent jamais de musée. » <em>Maryse, élue municipale</em>",
        ],
        model: "Paul, guide-conférencier, défend la gratuité des musées, car elle permet à des publics modestes ou jeunes de découvrir la culture. Maryse, élue, rappelle au contraire qu'un musée coûte cher et que, sans billet, ce sont tous les contribuables qui paient.\nÀ mon avis, une gratuité totale n'est pas la meilleure solution, mais l'accès doit rester facile. Je trouve juste que les touristes et les adultes qui en ont les moyens paient leur entrée, car l'entretien des œuvres exige beaucoup d'argent. En revanche, les jeunes, les étudiants et les demandeurs d'emploi devraient entrer gratuitement. Dans ma ville, le musée est gratuit le premier dimanche du mois : ce jour-là, on voit beaucoup de familles qui ne viendraient pas autrement. Ce système me semble un bon équilibre entre l'accès à la culture et le financement des musées." },
    ],
    tu: ["une grève : cuộc đình công", "une assurance annulation : bảo hiểm huỷ chuyến", "la gratuité : sự miễn phí", "un contribuable : người đóng thuế", "l'entretien (nom masculin) : việc bảo dưỡng"],
    meo: ["Chia giờ khoảng 15, 20, 25 phút cho tâche 1, 2, 3, chừa 5 phút đọc lại.", "Đếm từ bằng mắt theo dòng: một dòng viết tay khoảng 10 từ, nên tâche 1 cần 6 đến 12 dòng."],
  },
];
