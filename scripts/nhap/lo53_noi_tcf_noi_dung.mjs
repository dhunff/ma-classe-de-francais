/* Lô 53 (16/11/2026): NỘI DUNG bài Nói TCF cho cây Luyện thi TCF (kyNangTCF.js), TCF-PO-1 đến PO-3.
 * Khung theo format TCF (FEI): tâche 1 entretien dirigé 2 phút, không chuẩn bị; tâche 2 exercice en
 * interaction 5 phút 30 (2 phút chuẩn bị): thí sinh HỎI để lấy thông tin, giám khảo đóng vai; tâche 3
 * expression d'un point de vue 4 phút 30, không chuẩn bị.
 * Bài luyện tập chia một tâche thành nhiều lượt ghi âm (mỗi câu `open` một lượt, `giay` = thời lượng tối đa),
 * AI nhận xét từng lượt bằng nhan-xet-noi (lời nhắc riêng cho TCF). `tinhHuong` vào consigne (AI đọc được).
 * Không có audio câu hỏi (không có token TTS lúc soạn): lời giám khảo viết trên đề.
 * Toàn bộ do FRACILE soạn, nhân vật hư cấu. Không dùng dấu gạch dài. Máy dựng: lo53_noi_tcf.mjs. */

export const BAI = [
  /* ═══════════ TCF-PO-1 : Entretien dirigé (2 phút) ═══════════ */
  {
    ma: "TCF-PO-1", vong: "hoc", tieuDe: "Oral TCF : se présenter à l'examinateur",
    tinhHuong: "Tâche 1 du TCF : l'examinateur vous pose des questions sur vous, votre vie et vos projets. Il n'y a pas de préparation. Répondez à chaque question en 3 ou 4 phrases.",
    cau: [
      { giay: 60, prompt: "Bonjour. Pouvez-vous vous présenter, s'il vous plaît ?",
        model: "Bonjour. Je m'appelle Thu, j'ai vingt-huit ans et je suis vietnamienne. J'habite à Hô Chi Minh-Ville avec mon mari et notre petite fille de trois ans. Je travaille comme comptable dans une entreprise d'import-export." },
      { giay: 60, prompt: "Où habitez-vous ? Pouvez-vous décrire votre ville ?",
        model: "J'habite à Hô Chi Minh-Ville, dans le sud du Vietnam. C'est une très grande ville, dynamique et un peu bruyante, avec beaucoup de motos. J'aime surtout ses marchés et sa cuisine de rue, mais la circulation est parfois difficile." },
      { giay: 60, prompt: "Qu'est-ce que vous faites dans la vie ?",
        model: "Je suis comptable. Je prépare les factures et je contrôle les dépenses de l'entreprise. C'est un travail précis qui demande de la patience. Ce que j'apprécie, c'est de travailler avec des clients étrangers." },
      { giay: 60, prompt: "Que faites-vous pendant votre temps libre ?",
        model: "Le week-end, je passe du temps avec ma famille : nous allons au parc ou chez mes parents. J'aime aussi cuisiner et regarder des films français, ça m'aide à progresser. Quand j'ai le temps, je fais du yoga." },
      { giay: 60, prompt: "Pourquoi apprenez-vous le français ?",
        model: "J'apprends le français parce que nous voulons immigrer au Canada, au Québec. Le TCF est obligatoire pour notre dossier. Et puis j'aime cette langue depuis le lycée, je trouve qu'elle est élégante." },
      { giay: 60, prompt: "Quels sont vos projets pour les prochaines années ?",
        model: "Si tout va bien, nous partirons à Montréal dans deux ans. Je voudrais reprendre mes études pour faire reconnaître mon diplôme, puis trouver un poste de comptable. Plus tard, j'aimerais acheter une maison avec un jardin." },
    ],
    tu: ["un comptable, une comptable : kế toán", "bruyant (adjectif) : ồn ào", "la circulation : giao thông", "immigrer (verbe) : nhập cư", "faire reconnaître son diplôme : công nhận bằng cấp"],
    meo: ["Đừng trả lời một từ: mỗi câu nói 3 đến 4 câu, có một chi tiết cụ thể (tên, nơi, ví dụ).", "Câu hỏi về dự định thì dùng futur simple hoặc « je voudrais », « j'aimerais »."],
  },
  {
    ma: "TCF-PO-1", vong: "on", tieuDe: "Oral TCF : habitudes et souvenirs",
    tinhHuong: "Tâche 1 du TCF : l'examinateur continue l'entretien et vous pose des questions sur votre quotidien et vos souvenirs. Répondez en 3 ou 4 phrases, avec des exemples.",
    cau: [
      { giay: 60, prompt: "Parlez-moi de votre famille.",
        model: "J'ai une petite famille. Mes parents habitent à Huê, ils sont à la retraite. J'ai un frère aîné qui est médecin et qui a deux enfants. Nous nous retrouvons tous ensemble pour le Têt, c'est le moment de l'année que je préfère." },
      { giay: 60, prompt: "Comment se passe une journée normale pour vous ?",
        model: "Je me lève vers six heures et demie, je prépare le petit-déjeuner et j'emmène mon fils à l'école. Je commence le travail à huit heures. Le soir, je rentre vers dix-huit heures, nous dînons, puis j'étudie le français une demi-heure." },
      { giay: 60, prompt: "Racontez-moi votre dernier voyage.",
        model: "L'été dernier, je suis allé à Đà Lạt avec des amis. Il faisait frais, c'était agréable après la chaleur de la ville. Nous avons visité des fermes de fraises et nous avons fait une randonnée autour du lac. J'aimerais y retourner." },
      { giay: 60, prompt: "Quel est votre plat préféré ? Pourquoi ?",
        model: "Mon plat préféré, c'est le phở de ma mère. C'est une soupe de nouilles au bœuf, avec beaucoup d'herbes. Je l'aime parce qu'elle me rappelle mon enfance, les dimanches matin à la maison. J'ai essayé de la préparer, mais ce n'est jamais aussi bon !" },
      { giay: 60, prompt: "Quel souvenir d'enfance vous a marqué ?",
        model: "Quand j'avais huit ans, mon grand-père m'a appris à faire du vélo. Je tombais tout le temps, mais il restait patient. Le jour où j'ai réussi à rouler seul, il était plus fier que moi. Il est mort depuis, mais je pense souvent à ce moment." },
      { giay: 60, prompt: "Qu'est-ce que vous aimez et qu'est-ce que vous n'aimez pas dans votre travail ou vos études ?",
        model: "Dans mon travail, j'aime l'ambiance : mes collègues sont sympathiques et on s'entraide. En revanche, je n'aime pas les longues réunions qui ne servent à rien. Parfois, je dois aussi travailler tard le soir, et c'est fatigant." },
    ],
    tu: ["être à la retraite : đã nghỉ hưu", "un frère aîné : anh trai", "s'entraider (verbe) : giúp đỡ nhau", "marquer (verbe) : để lại dấu ấn", "en revanche : ngược lại"],
    meo: ["Kể chuyện đã qua: passé composé cho sự việc, imparfait cho bối cảnh và thói quen.", "Câu « aimez / n'aimez pas » nên có cả hai vế, nối bằng « en revanche » hoặc « par contre »."],
  },

  /* ═══════════ TCF-PO-2 : Exercice en interaction (5 phút 30) ═══════════ */
  {
    ma: "TCF-PO-2", vong: "hoc", tieuDe: "Oral TCF : s'inscrire dans une salle de sport",
    tinhHuong: "Tâche 2 du TCF. Situation : vous voulez vous inscrire dans une salle de sport près de chez vous. L'examinateur joue le rôle du réceptionniste. Posez-lui des questions pour obtenir toutes les informations utiles. C'est VOUS qui posez les questions.",
    cau: [
      { giay: 90, prompt: "Saluez, présentez votre demande, puis posez des questions sur les horaires d'ouverture et les activités proposées.",
        model: "Bonjour madame. Je viens d'emménager dans le quartier et je voudrais m'inscrire dans votre salle. Est-ce que je pourrais avoir quelques renseignements ? Quels sont vos horaires d'ouverture ? Est-ce que la salle est ouverte le dimanche ? Et quelles activités proposez-vous ? Il y a des cours collectifs, par exemple du yoga ou de la natation ?" },
      { giay: 90, prompt: "Posez des questions sur les prix, les formules d'abonnement et les réductions possibles.",
        model: "Combien coûte l'abonnement ? Est-ce qu'il y a une différence entre l'abonnement mensuel et l'abonnement annuel ? Les cours collectifs sont-ils compris dans le prix ? Je suis étudiant : est-ce que vous faites des réductions pour les étudiants ? Et est-ce qu'il y a des frais d'inscription ?" },
      { giay: 90, prompt: "Posez des questions sur les conditions (certificat médical, séance d'essai, résiliation), puis remerciez et prenez congé.",
        model: "Est-ce qu'il faut un certificat médical pour s'inscrire ? Est-il possible de faire une séance d'essai gratuite avant de décider ? Et si je déménage, est-ce que je peux arrêter l'abonnement facilement ? Quel est le délai ? Très bien, merci beaucoup pour toutes ces informations. Je reviendrai demain avec mes papiers. Bonne journée !" },
    ],
    tu: ["un renseignement : thông tin", "un abonnement mensuel / annuel : vé tháng / vé năm", "les frais d'inscription : phí đăng ký", "une séance d'essai : buổi tập thử", "résilier (verbe) : huỷ (hợp đồng)"],
    meo: ["Tâche 2 chấm khả năng ĐẶT CÂU HỎI: đổi kiểu hỏi (Est-ce que…, Quel…, Combien…, Est-il possible de…) để không lặp.", "Mở bằng lời chào và lý do, kết bằng lời cảm ơn: phần phù hợp tình huống cũng được chấm."],
  },
  {
    ma: "TCF-PO-2", vong: "on", tieuDe: "Oral TCF : louer un appartement",
    tinhHuong: "Tâche 2 du TCF. Situation : vous cherchez un appartement à louer et vous appelez une agence immobilière pour une annonce. L'examinateur joue le rôle de l'agent immobilier. Posez-lui des questions pour savoir si l'appartement vous convient.",
    cau: [
      { giay: 90, prompt: "Présentez-vous et posez des questions sur le logement : surface, nombre de pièces, étage, équipements, quartier.",
        model: "Bonjour monsieur, j'appelle au sujet de l'annonce pour le deux-pièces rue Victor-Hugo. Quelle est la surface de l'appartement ? Il est à quel étage ? Est-ce qu'il y a un ascenseur ? La cuisine est-elle équipée ? Et le quartier, il est calme ? Il y a des commerces et une station de métro à proximité ?" },
      { giay: 90, prompt: "Posez des questions sur le loyer, les charges, la caution et les documents à fournir.",
        model: "Quel est le montant du loyer ? Est-ce que les charges sont comprises ? Qu'est-ce qu'elles comprennent exactement, le chauffage et l'eau ? Combien faut-il verser pour la caution ? Et quels documents dois-je fournir pour le dossier ? Est-ce qu'un garant est obligatoire ?" },
      { giay: 90, prompt: "Posez des questions sur la visite et la date d'entrée, puis concluez poliment.",
        model: "L'appartement est disponible à partir de quand ? Est-ce que je pourrais le visiter cette semaine ? Le jeudi après dix-huit heures, est-ce que ça vous conviendrait ? Parfait. À quelle adresse dois-je vous retrouver ? Merci beaucoup, monsieur, à jeudi alors. Au revoir." },
    ],
    tu: ["un deux-pièces : căn hộ hai phòng", "les charges (nom féminin pluriel) : phí dịch vụ", "la caution : tiền đặt cọc", "un garant : người bảo lãnh", "à proximité : gần đó"],
    meo: ["Chuẩn bị 2 phút: ghi nhanh 4 nhóm câu hỏi (nhà, tiền, giấy tờ, lịch xem) để không cạn ý giữa chừng.", "Lắng nghe câu trả lời của giám khảo rồi hỏi tiếp từ đó (« Et le chauffage, il est compris ? »)."],
  },

  /* ═══════════ TCF-PO-3 : Expression d'un point de vue (4 phút 30) ═══════════ */
  {
    ma: "TCF-PO-3", vong: "hoc", tieuDe: "Oral TCF : le télétravail pour tous ?",
    tinhHuong: "Tâche 3 du TCF. Sujet : « Le télétravail devrait-il devenir la norme ? » Donnez votre opinion de manière claire et argumentée. Il n'y a pas de préparation.",
    cau: [
      { giay: 90, prompt: "Présentez le sujet, donnez clairement votre position et un premier argument.",
        model: "On parle beaucoup du télétravail depuis quelques années. Faut-il en faire la norme ? Personnellement, je pense que le télétravail est une bonne chose, mais qu'il ne doit pas remplacer complètement le bureau. Mon premier argument, c'est le temps gagné : beaucoup de salariés passent plus d'une heure par jour dans les transports, et ce temps pourrait servir à se reposer ou à voir sa famille." },
      { giay: 90, prompt: "Donnez un deuxième argument, avec un exemple concret (votre expérience ou celle d'un proche).",
        model: "Ensuite, le télétravail permet souvent d'être plus concentré. Par exemple, ma sœur travaille dans une banque. Au bureau, elle est sans cesse interrompue par des collègues ou des réunions. Depuis qu'elle travaille de chez elle deux jours par semaine, elle dit qu'elle fait en une journée ce qu'elle faisait avant en deux." },
      { giay: 90, prompt: "L'examinateur réagit : « Mais beaucoup de salariés se sentent seuls en télétravail. » Répondez à cette objection, puis concluez.",
        model: "C'est vrai, et c'est pour cela que je ne suis pas pour le télétravail à cent pour cent. L'être humain a besoin de contacts, et les échanges informels au bureau sont importants pour l'équipe. À mon avis, la meilleure solution est un modèle mixte : deux ou trois jours à la maison, le reste au bureau. En conclusion, le télétravail ne doit pas devenir la norme, mais une possibilité offerte à tous." },
    ],
    tu: ["la norme : chuẩn mực, điều mặc định", "sans cesse : liên tục", "être interrompu : bị ngắt quãng", "une objection : ý phản bác", "un modèle mixte : mô hình kết hợp"],
    meo: ["Nói lập trường NGAY câu thứ hai: giám khảo cần biết bạn nghĩ gì trước khi nghe lý lẽ.", "Gặp phản bác thì đồng ý một phần (« C'est vrai, mais… ») rồi kéo về ý mình: đó là kỹ năng được chấm ở tâche 3."],
  },
  {
    ma: "TCF-PO-3", vong: "on", tieuDe: "Oral TCF : des villes sans voitures ?",
    tinhHuong: "Tâche 3 du TCF. Sujet : « Faut-il interdire la voiture dans le centre des villes ? » Donnez votre opinion de manière claire et argumentée. Il n'y a pas de préparation.",
    cau: [
      { giay: 90, prompt: "Présentez le sujet, donnez clairement votre position et un premier argument.",
        model: "Dans beaucoup de grandes villes, on se demande s'il faut interdire les voitures dans le centre. Pour ma part, je suis plutôt favorable à cette idée. D'abord, pour la santé : la pollution de l'air provoque des maladies respiratoires, surtout chez les enfants et les personnes âgées. Moins de voitures, c'est un air plus propre pour tout le monde." },
      { giay: 90, prompt: "Donnez un deuxième argument, avec un exemple concret.",
        model: "Ensuite, un centre sans voitures est plus agréable à vivre. Par exemple, l'année dernière, j'ai visité une ville européenne où le centre est piéton. Les rues étaient calmes, il y avait des terrasses, des enfants qui jouaient, des gens à vélo. Les commerces avaient beaucoup de clients, parce que les gens prenaient le temps de se promener." },
      { giay: 90, prompt: "L'examinateur réagit : « Et les personnes âgées, les livreurs, les commerçants ? » Répondez à cette objection, puis concluez.",
        model: "C'est une bonne question, il ne faut oublier personne. On peut prévoir des exceptions : les livraisons le matin, les taxis, les voitures des personnes handicapées. Il faut aussi développer les transports en commun et les navettes gratuites avant d'interdire. En conclusion, je suis pour un centre sans voitures, mais seulement si la ville propose de vraies solutions pour se déplacer." },
    ],
    tu: ["un centre piéton : khu phố đi bộ", "les maladies respiratoires : bệnh hô hấp", "un livreur : người giao hàng", "prévoir des exceptions : dự liệu ngoại lệ", "une navette : xe đưa đón"],
    meo: ["Dùng từ nối để giám khảo theo kịp: d'abord, ensuite, par exemple, en conclusion.", "Ví dụ có thật (nơi đã đến, người quen) thuyết phục hơn số liệu bạn không chắc."],
  },
];
