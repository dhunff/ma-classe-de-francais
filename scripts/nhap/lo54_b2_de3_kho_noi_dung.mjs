/* Lô 54 (17/11/2026): NỘI DUNG « DELF B2 · Đề 3 » NÂNG ĐỘ KHÓ. Cùng chuẩn với Đề 1 (xem
 * lo54_b2_de1_kho_noi_dung.mjs): giữ chủ đề, số câu và thang điểm của đề cũ (lô 20), viết lại toàn bộ.
 * Mọi nội dung do FRACILE soạn; số liệu trong bài là hư cấu cho mục đích luyện thi.
 * Không dùng dấu gạch dài (quy tắc 7). Lời giải trích nguyên văn trong « ». */

export function noiDung({ q, ai, p, d }) {
  const RADIO = "Parle en français de France comme une journaliste de radio en direct : débit rapide et naturel, enchaîne sans marquer de pause entre les phrases.";
  const KHACH = "Parle en français de France comme une chercheuse interviewée en direct à la radio : débit rapide, spontané, avec de vraies hésitations, sans articuler de façon scolaire.";
  const PHONG = "Parle en français de France comme une reporter de radio sur le terrain : débit soutenu, ton vivant.";
  const NGUOI = "Parle en français de France comme une personne interrogée sur son lieu de travail : débit rapide et familier, phrases qui s'enchaînent, quelques hésitations.";
  const TIN = "Parle en français de France comme une chronique radio : débit rapide et dense, sans pause.";

  /* ─────────────── ĐỌC 1 ─────────────── */
  const CE1 = {
    id: "lo20mv7gtqge03r",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Canicules : les villes en quête de fraîcheur</strong>",
      "Les étés se suivent et battent leurs propres records, mais tous les territoires ne sont pas logés à la même enseigne. En ville, le béton et le bitume emmagasinent la chaleur pendant la journée et la restituent une fois le soleil couché : c'est ce que les climatologues nomment l'îlot de chaleur urbain. Dans certains quartiers denses, l'écart avec la campagne environnante dépasse huit degrés au cœur de la nuit. Or c'est précisément la nuit que l'organisme récupère ; privés de ce répit, les habitants les plus fragiles s'épuisent jour après jour.",
      "Face à ce constat, les municipalités misent d'abord sur le végétal. À Lyon, une trentaine d'écoles ont vu leur cour goudronnée céder la place à de la terre, des arbres, des copeaux de bois et des fontaines. Ces « cours oasis », comme on les a baptisées, affichent en été jusqu'à sept degrés de moins que les cours voisines. Et parce que les quartiers concernés comptent parmi les moins bien pourvus en parcs, la ville a décidé de les ouvrir aux riverains le samedi et le dimanche, une initiative qui a d'abord suscité des réticences chez certains parents, inquiets des dégradations, avant de s'imposer.",
      "Karim Haddad, urbaniste, salue ces réalisations tout en invitant à tempérer l'enthousiasme. « On inaugure une plantation comme si le problème était réglé. Or un jeune arbre ne fait pas d'ombre : il lui faut quinze à vingt ans pour jouer pleinement son rôle. Nous plantons pour les étés de 2045, pas pour celui qui vient. » Encore faut-il planter à bon escient. Bien des essences qui ornent aujourd'hui nos avenues ne résisteront pas aux sécheresses annoncées, et certaines villes ont dû abattre, faute d'eau, des alignements entiers plantés dix ans plus tôt. « Choisir un arbre, c'est parier sur le climat qu'il connaîtra à l'âge adulte », résume-t-il.",
      "D'autres leviers agissent plus vite : peindre les toits en blanc, remplacer l'asphalte par des revêtements clairs, rouvrir des cours d'eau jadis enterrés. Mais plusieurs associations font observer que ces efforts se concentrent volontiers dans les centres rénovés, alors que les logements les plus mal isolés se trouvent en périphérie. À leurs yeux, s'adapter à la chaleur ne relève pas seulement de la technique : c'est aussi décider qui sera protégé et qui ne le sera pas. Les relevés leur donnent raison, puisque les quartiers populaires cumulent le moins d'arbres et les températures les plus élevées.",
      "Reste la solution que beaucoup de ménages adoptent sans attendre : la climatisation. Les ventes ont triplé en cinq ans. La plupart des spécialistes s'en alarment. Outre sa consommation d'électricité, un climatiseur rejette dans la rue la chaleur qu'il retire du logement : il rafraîchit l'intérieur en réchauffant l'extérieur, au détriment de ceux qui n'en ont pas. Généralisée, elle rendrait la ville plus étouffante encore. Nul ne songe pourtant à l'interdire aux hôpitaux ou aux maisons de retraite, où elle sauve des vies.",
    ),
    cau: [
      q("Pourquoi les îlots de chaleur sont-ils particulièrement pénibles pour les habitants ?",
        "Parce que la température ne redescend pas la nuit.",
        ["Parce que les records de chaleur sont battus chaque après-midi.", "Parce que les campagnes voisines se réchauffent elles aussi."],
        "Bê tông và nhựa đường giữ nhiệt ban ngày rồi nhả ra khi mặt trời lặn; mà chính ban đêm cơ thể mới hồi sức: « privés de ce répit », người yếu kiệt dần.", 1),
      q("Que sont les « cours oasis » ?",
        "D'anciennes cours d'école réaménagées avec de la végétation.",
        ["Des parcs publics créés à proximité immédiate des écoles.", "Des fontaines installées dans les cours pendant les mois d'été."],
        "Ở Lyon, khoảng ba mươi trường đã thay sân tráng nhựa bằng đất, cây, dăm gỗ và đài nước: « Ces « cours oasis » » chính là sân trường được làm lại, không phải công viên mới.", 1.5),
      q("Pourquoi la ville ouvre-t-elle ces cours le week-end ?",
        "Le quartier dispose de peu d'espaces verts.",
        ["Les parents d'élèves en avaient fait la demande.", "Les travaux ont été financés par les riverains."],
        "Vì các khu này « comptent parmi les moins bien pourvus en parcs », thành phố mở sân cho dân quanh đó. Một số phụ huynh lúc đầu còn dè dặt, nên không phải họ đề nghị.", 0.5),
      q("Que rappelle Karim Haddad à propos des plantations ?",
        "Leurs bienfaits ne se feront sentir que dans longtemps.",
        ["Elles coûtent plus cher que les autres solutions possibles.", "Elles ont déjà permis de régler le problème à Lyon."],
        "Ông nói cây non không cho bóng mát, cần mười lăm đến hai mươi năm: « Nous plantons pour les étés de 2045, pas pour celui qui vient ».", 1),
      q("Pourquoi le choix des essences est-il décisif ?",
        "Certains arbres ne survivront pas au manque d'eau à venir.",
        ["Certains arbres poussent trop lentement pour donner de l'ombre.", "Certains arbres abîment les revêtements des avenues."],
        "Nhiều loài cây đang trồng « ne résisteront pas aux sécheresses annoncées », có thành phố đã phải chặt cả hàng cây vì thiếu nước. Chọn cây là đặt cược vào khí hậu lúc cây trưởng thành.", 1.5),
      q("Que soulignent les associations à propos de l'adaptation à la chaleur ?",
        "Elle pose une question de justice entre les quartiers.",
        ["Elle devrait être confiée aux habitants plutôt qu'aux techniciens.", "Elle progresse plus vite en périphérie que dans les centres."],
        "Theo các hiệp hội, thích nghi với nóng không chỉ là kỹ thuật: « c'est aussi décider qui sera protégé et qui ne le sera pas ». Nỗ lực lại dồn về trung tâm, trong khi khu bình dân ít cây và nóng nhất.", 2),
      q("Que reprochent la plupart des spécialistes à la climatisation ?",
        "De contribuer à réchauffer davantage l'espace urbain.",
        ["D'être inefficace dans les logements mal isolés.", "D'être réservée aux hôpitaux et aux maisons de retraite."],
        "Máy lạnh thải ra phố lượng nhiệt nó lấy khỏi nhà: « il rafraîchit l'intérieur en réchauffant l'extérieur ». Dùng đại trà thì thành phố còn ngột ngạt hơn.", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 2 ─────────────── */
  const CE2 = {
    id: "lo20mv7gtqge03s",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Faut-il apprendre à coder dès l'école primaire ?</strong>",
      "Entrée discrètement dans les programmes il y a une dizaine d'années, l'initiation à la programmation concerne désormais tous les élèves, du cours préparatoire au lycée. On commence par guider un petit robot sur un quadrillage, on finit par concevoir un jeu sur tablette. Pour ses partisans, la cause est entendue : dans un monde façonné par les algorithmes, savoir comment une machine obéit à des instructions relèverait du même socle que lire, écrire et compter.",
      "Professeure des écoles à Toulouse, Isabelle Roche n'avait rien d'une convaincue. « Je n'ai aucune formation scientifique, et l'idée d'enseigner une matière que je ne maîtrisais pas me paralysait. J'avais le sentiment qu'on me demandait de faire semblant. » Trois jours de stage et beaucoup de tâtonnements ont eu raison de ses réticences. Ce qu'elle retient de l'expérience n'est pourtant pas ce qu'elle attendait. « Les enfants n'apprennent pas l'informatique, ils apprennent à se tromper. Quand le robot part dans le mauvais sens, personne n'a “faux” : il faut chercher l'instruction fautive, la corriger, recommencer. Découper une difficulté en petites étapes, vérifier chacune d'elles, c'est une méthode qui leur sert ensuite en mathématiques comme en rédaction. »",
      "Elle observe un autre effet, qu'elle n'avait pas davantage prévu. « Des élèves qui se taisent d'habitude, parce qu'ils sont mal à l'aise à l'écrit, prennent soudain les choses en main. On découvre chez eux une rigueur et une patience que les exercices classiques ne laissaient pas deviner. Leurs camarades les regardent autrement, et eux aussi. »",
      "Pierre Vidal, chercheur en sciences de l'éducation, ne conteste pas ces observations ; il en tire une conclusion différente. « Ce qui est formateur, c'est la logique, non l'écran. On peut faire exécuter un parcours à un camarade qui joue le robot, écrire un algorithme avec un crayon, trier des cartes selon une règle. Ces activités dites débranchées donnent les mêmes résultats, et elles ne coûtent rien. » Il s'inquiète en revanche de voir l'école ajouter des heures d'écran à des enfants qui en consomment déjà trop à la maison, au moment même où les médecins recommandent de les limiter. Il y voit une contradiction que l'institution se garde bien de regarder en face.",
      "Les éditeurs de matériel scolaire, eux, ne s'embarrassent pas de ces nuances : robots, tablettes et abonnements à des plateformes représentent désormais un marché considérable, que les communes financent tant bien que mal, et de façon très inégale d'une école à l'autre.",
      "Le chercheur met aussi en garde contre un argument qu'on entend souvent : former dès aujourd'hui les informaticiens de demain. « Les langages qu'on enseigne à un enfant de huit ans auront disparu quand il cherchera du travail. Si l'on présente la programmation comme une préparation à un métier, on se trompe de cible et l'on déçoit tout le monde. Elle n'a d'intérêt à l'école que comme un moyen, parmi d'autres, d'apprendre à raisonner. » Une position médiane, qui renvoie dos à dos les enthousiastes et les sceptiques.",
    ),
    cau: [
      q("Comment les partisans de cet enseignement considèrent-ils la programmation ?",
        "Comme un savoir de base au même titre que la lecture.",
        ["Comme une option utile pour les futurs scientifiques.", "Comme une matière qui remplacera bientôt le calcul."],
        "Với người ủng hộ, hiểu cách máy làm theo lệnh « relèverait du même socle que lire, écrire et compter »: một kiến thức nền, không phải môn tự chọn.", 1),
      q("Pourquoi Isabelle Roche était-elle réticente au début ?",
        "Elle ne se sentait pas à la hauteur.",
        ["Elle jugeait cet enseignement inutile pour de jeunes enfants.", "Elle manquait de matériel dans son école."],
        "Cô nói mình không có nền khoa học, và ý nghĩ phải dạy một môn « que je ne maîtrisais pas me paralysait »: cô nghi ngờ năng lực của chính mình.", 1.5),
      q("Qu'a-t-elle constaté en pratiquant ces activités avec ses élèves ?",
        "Elles leur apprennent une démarche pour venir à bout d'une difficulté.",
        ["Elles leur donnent le goût des métiers de l'informatique.", "Elles améliorent surtout leur rapidité en calcul mental."],
        "Theo cô, trẻ học cách sai rồi sửa: « Découper une difficulté en petites étapes, vérifier chacune d'elles » là phương pháp dùng được cả trong toán lẫn viết văn.", 1),
      q("Selon elle, que permettent ces activités à certains élèves ?",
        "De montrer des capacités qui passaient inaperçues.",
        ["De rattraper leur retard à l'écrit en quelques semaines.", "De travailler seuls sans dépendre de leurs camarades."],
        "Những em thường im lặng vì yếu viết bỗng chủ động: người ta thấy ở các em « une rigueur et une patience que les exercices classiques ne laissaient pas deviner ».", 1.5),
      q("Que soutient Pierre Vidal à propos de l'apprentissage de la logique ?",
        "Il n'exige pas de recourir à un appareil.",
        ["Il n'est possible qu'à partir du collège.", "Il réussit mieux lorsque l'élève travaille sur tablette."],
        "Ông nói: « Ce qui est formateur, c'est la logique, non l'écran »; các hoạt động « débranchées » (bạn đóng vai robot, viết thuật toán bằng bút chì) cho kết quả như nhau.", 2),
      q("Quelle crainte exprime-t-il ?",
        "Que l'école augmente encore le temps passé devant les écrans.",
        ["Que les enseignants soient insuffisamment formés.", "Que les familles achètent des tablettes trop tôt."],
        "Ông lo nhà trường « ajouter des heures d'écran » cho những đứa trẻ vốn đã dùng quá nhiều ở nhà, đúng lúc bác sĩ khuyên hạn chế.", 0.5),
      q("Pour Pierre Vidal, à quoi la programmation doit-elle servir à l'école ?",
        "À exercer la capacité de raisonnement.",
        ["À préparer les élèves aux emplois du numérique.", "À familiariser les enfants avec les langages actuels."],
        "Ông bác lý lẽ đào tạo lập trình viên tương lai: lập trình ở trường chỉ có ý nghĩa « comme un moyen, parmi d'autres, d'apprendre à raisonner ».", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 3 ─────────────── */
  const TEN = ["Élise", "Karim", "Joséphine"];
  const a = ai(TEN);
  const CE3 = {
    id: "lo20mv7gtqge03t",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Faut-il interdire le smartphone aux enfants de moins de 15 ans ? »</p>",
    readingText: p(
      "<strong>Élise</strong>",
      "Mère de deux adolescents, j'ai tenu bon jusqu'à leurs quatorze ans, et je ne le regrette pas un instant. De là à réclamer une loi, il y a un pas que je ne franchirai pas : qui irait contrôler ce qui se passe dans les chambres, et au nom de quoi ? Un texte que personne ne peut faire respecter discrédite ceux qui l'ont voté. Ce qui a fonctionné chez nous, c'est une entente entre familles. Dans la classe de mon fils, une vingtaine de parents se sont engagés à attendre la même date. Du jour au lendemain, l'argument « je suis le seul à ne pas en avoir » est tombé de lui-même.",
      "<strong>Karim</strong>",
      "Pédiatre, je reçois chaque semaine des enfants de dix ans qui dorment mal, peinent à se concentrer et s'angoissent dès qu'on leur retire l'appareil. Qu'on ne me dise pas qu'il suffit de leur faire confiance : ces applications sont conçues par des équipes d'ingénieurs dont le métier consiste précisément à empêcher qu'on les quitte. Un enfant n'est pas de taille. Nous interdisons bien la vente d'alcool et de tabac aux mineurs sans que personne y voie une atteinte aux libertés. Il faut une règle fixée par la société, sans quoi les parents qui tiennent bon passeront toujours pour des tyrans auprès de leurs propres enfants.",
      "<strong>Joséphine</strong>",
      "J'ai dix-neuf ans, j'ai eu mon premier téléphone à onze, et je ne me reconnais pas dans le portrait qu'on dresse de ma génération. Quand mes parents se sont séparés et que j'ai changé de ville, c'est grâce à lui que j'ai gardé mes amis d'enfance. Interdire jusqu'à quinze ans, c'est lâcher ensuite des adolescents dans le grand bain sans leur avoir appris à nager. On ferait mieux de les accompagner tôt : expliquer comment fonctionne une notification, pourquoi une vidéo en appelle une autre, comment on se protège. Un usage, cela s'apprend, et cela s'apprend avec quelqu'un.",
    ),
    cau: [
      a("Seule une règle légale peut protéger efficacement les enfants.", "Karim", "Karim so sánh với việc cấm bán rượu, thuốc lá cho trẻ vị thành niên và kết: « Il faut une règle fixée par la société ».", 2),
      a("Un accord entre parents donne de meilleurs résultats qu'une loi.", "Élise", "Élise kể điều hiệu quả ở chỗ chị là « une entente entre familles »: khoảng hai mươi phụ huynh cùng hẹn một ngày, và lý lẽ « je suis le seul à ne pas en avoir » tự biến mất.", 1.5),
      a("Il vaut mieux former les jeunes à l'usage du téléphone que le leur interdire.", "Joséphine", "Joséphine cho rằng nên đồng hành sớm, giải thích cách thông báo hoạt động, cách tự bảo vệ: « Un usage, cela s'apprend, et cela s'apprend avec quelqu'un ».", 1),
      a("Ces outils sont fabriqués pour qu'on ne puisse pas s'en détacher.", "Karim", "Karim nói các ứng dụng do những nhóm kỹ sư thiết kế, nghề của họ là « empêcher qu'on les quitte »; một đứa trẻ không đủ sức chống lại.", 1.5),
      a("Le téléphone aide à maintenir des relations.", "Joséphine", "Khi cha mẹ chia tay và cô đổi thành phố, nhờ điện thoại mà cô « j'ai gardé mes amis d'enfance ».", 0.5),
      a("Une interdiction légale serait impossible à faire appliquer.", "Élise", "Élise hỏi ai sẽ đi kiểm tra trong phòng ngủ: « Un texte que personne ne peut faire respecter » chỉ làm mất uy tín người thông qua nó.", 0.5),
    ],
  };

  /* ─────────────── NGHE 1 ─────────────── */
  const CO1 = {
    id: "lo20mv7gs9qn03o", ten: "b2k-de3-co1", hai: true,
    gioiThieu: "Vous écoutez une émission à la radio.",
    phanTich: { loai: "Interview à la radio", chu_de: "La fatigue informationnelle", y_chinh: "Une chercheuse explique pourquoi d'anciens gros consommateurs d'actualité s'en détournent pour se protéger, ce que cela fait courir comme risque à la démocratie, et comment s'informer autrement." },
    doan: [
      d("sage", RADIO, "Bonjour à tous. Alertes sur le téléphone, chaînes en continu, fils d'actualité qui ne s'arrêtent jamais : nous n'avons jamais eu autant d'informations à portée de main. Et pourtant, d'après un sondage publié la semaine dernière, un Français sur trois déclare aujourd'hui se détourner volontairement de l'actualité. Paresse, indifférence, ras-le-bol ? Nous posons la question à Nadia Belkacem, chercheuse en sciences de l'information. Nadia Belkacem, bonjour. De qui parle-t-on, exactement ?"),
      d("shimmer", KHACH, "Bonjour. Alors, justement, pas de ceux qu'on croit. On imagine des gens qui ne se sont jamais intéressés à rien. Or, euh, quand on regarde les enquêtes de près, c'est l'inverse : ce sont très souvent d'anciens gros consommateurs d'information. Des personnes qui écoutaient la radio le matin, lisaient un quotidien, suivaient les débats le soir, et qui, un jour, ont tout coupé. Ce n'est pas un désintérêt, c'est une saturation. On appelle ça la fatigue informationnelle."),
      d("sage", RADIO, "Et pourquoi coupent-ils ?"),
      d("shimmer", KHACH, "Parce qu'ils se sentent impuissants, tout simplement. On leur montre, heure après heure, des guerres, des catastrophes, des crises sur lesquelles ils n'ont aucune prise. Au bout d'un moment, euh, ça génère de l'angoisse, des insomnies, parfois un vrai abattement. Alors se détourner, pour eux, ce n'est pas fuir le monde, c'est se protéger. Je le dis parce qu'on a tendance à leur faire la morale, et c'est une erreur : on ne reproche pas à quelqu'un de retirer sa main d'une plaque brûlante."),
      d("sage", RADIO, "Les médias ont-ils leur part de responsabilité ?"),
      d("shimmer", KHACH, "Les médias, oui, mais surtout, comment dire, la manière dont l'information nous arrive désormais. Sur les réseaux, ce qu'on voit n'est pas trié par un journaliste, c'est trié par un algorithme, et cet algorithme n'a qu'un critère : est-ce que ça fait réagir ? Or ce qui fait réagir, c'est la colère, la peur, l'indignation. Un reportage nuancé de dix minutes ne pèse rien face à une vidéo de quinze secondes qui scandalise. Du coup, on ne reçoit plus l'actualité telle qu'elle est, on en reçoit la version la plus anxiogène."),
      d("sage", RADIO, "En quoi est-ce un problème pour la vie démocratique ?"),
      d("shimmer", KHACH, "C'est un problème sérieux, et on le sous-estime. Quelqu'un qui ne s'informe plus n'est pas quelqu'un qui n'entend plus rien. Il continue à recevoir des bribes, par des proches, par des groupes de discussion, sans aucun moyen de les vérifier. Et c'est exactement dans ce vide que prospèrent les rumeurs. Les gens qui ont décroché ne deviennent pas indifférents, ils deviennent plus vulnérables aux fausses nouvelles."),
      d("sage", RADIO, "Y a-t-il malgré tout une lecture plus optimiste ?"),
      d("shimmer", KHACH, "Oui, j'y tiens. Quand on interroge ces personnes, elles ne disent pas : je ne veux plus rien savoir. Elles disent : je veux qu'on m'explique, qu'on me donne du contexte, qu'on me parle aussi de ce qui marche. Autrement dit, elles ne rejettent pas l'information, elles en réclament une meilleure. C'est d'ailleurs ce qui explique le succès des formats longs, des podcasts, du journalisme dit de solutions."),
      d("sage", RADIO, "Un conseil pratique, pour finir ?"),
      d("shimmer", KHACH, "Un seul : reprendre la main sur le moment. Couper les notifications, et se fixer deux rendez-vous par jour, un le matin, un le soir, un quart d'heure chacun. On est aussi bien informé, et on cesse d'être interrompu toute la journée par des nouvelles qu'on n'a pas choisi de recevoir."),
      d("sage", RADIO, "Nadia Belkacem, merci."),
    ],
    cau: [
      q("Que montre le sondage cité par la journaliste ?",
        "Une part importante des Français fuit volontairement l'actualité.",
        ["Les Français consacrent trois fois moins de temps qu'avant à s'informer.", "Un Français sur trois ne fait plus confiance aux journalistes."],
        "Khảo sát cho thấy một phần ba người Pháp nói mình « se détourner volontairement de l'actualité ». Nó không đo thời gian đọc tin hay lòng tin với nhà báo.", 1.5),
      q("Qui sont, d'après Nadia Belkacem, ceux qui évitent l'actualité ?",
        "Des gens qui s'informaient beaucoup auparavant.",
        ["Des gens qui ne se sont jamais intéressés à l'actualité.", "Des jeunes qui ne lisent que les réseaux sociaux."],
        "Bà nói thực tế ngược với điều ta tưởng: đó rất thường là « d'anciens gros consommateurs d'information », những người từng nghe đài, đọc báo, xem tranh luận rồi một ngày cắt hết.", 1),
      q("Comment interprète-t-elle leur attitude ?",
        "Comme un moyen de se préserver.",
        ["Comme un refus d'assumer leurs responsabilités de citoyens.", "Comme une mode passagère entretenue par les réseaux."],
        "Bà nói quay lưng với tin tức « ce n'est pas fuir le monde, c'est se protéger », và trách móc họ là sai.", 1.5),
      q("Que reproche-t-elle aux algorithmes des réseaux sociaux ?",
        "De mettre en avant ce qui suscite les réactions les plus vives.",
        ["De cacher aux utilisateurs les informations internationales.", "De privilégier les longs reportages que personne ne regarde."],
        "Thuật toán chỉ có một tiêu chí: « est-ce que ça fait réagir ? »; mà thứ khiến người ta phản ứng là giận dữ, sợ hãi, phẫn nộ, nên ta nhận bản tin gây lo âu nhất.", 1),
      q("Quel risque voit-elle pour la démocratie ?",
        "Ces citoyens croient plus facilement des informations inexactes.",
        ["Ces citoyens cessent complètement d'aller voter.", "Ces citoyens se replient sur leur vie de famille."],
        "Người thôi theo dõi tin vẫn nhận tin vụn từ người quen mà không kiểm chứng được: họ « deviennent plus vulnérables aux fausses nouvelles ».", 1.5),
      q("Qu'attendent en réalité ces personnes, selon elle ?",
        "Une information plus approfondie.",
        ["Une information entièrement gratuite et plus rapide.", "Une information limitée aux bonnes nouvelles."],
        "Họ muốn được giải thích, được cho bối cảnh: « elles ne rejettent pas l'information, elles en réclament une meilleure ». Nói về điều tích cực chỉ là một phần, không phải chỉ tin vui.", 1.5),
      q("Que conseille-t-elle de faire ?",
        "Choisir des moments fixes pour s'informer.",
        ["Remplacer la radio et la presse par des podcasts.", "Supprimer toutes ses applications d'actualité."],
        "Lời khuyên: tắt thông báo và đặt « deux rendez-vous par jour », sáng và tối, mỗi lần mười lăm phút.", 1),
    ],
  };

  /* ─────────────── NGHE 2 ─────────────── */
  const CO2 = {
    id: "lo20mv7gsvqk03p", ten: "b2k-de3-co2", hai: true,
    gioiThieu: "Vous écoutez une émission à la radio.",
    phanTich: { loai: "Reportage radio", chu_de: "Une ferme maraîchère sur un toit en ville", y_chinh: "La responsable d'un potager installé sur un toit explique les contraintes techniques, la qualité des récoltes, les débouchés, et reconnaît que ces fermes ne nourriront pas la ville." },
    doan: [
      d("nova", PHONG, "Il faut prendre un monte-charge, traverser un parking, pousser une porte de service, et l'on débouche soudain au milieu des fraisiers. Nous sommes sur le toit d'un centre commercial du sud de Paris : quatorze mille mètres carrés de cultures, l'une des plus grandes fermes urbaines d'Europe. Pauline en est la responsable. Pauline, quand vous avez lancé le projet, on vous a prise au sérieux ?"),
      d("shimmer", NGUOI, "Pas vraiment, non. Au début, euh, on nous regardait comme des doux rêveurs. Et il y avait une objection qui revenait tout le temps : vos légumes vont pousser au-dessus du périphérique, ils seront bourrés de particules, personne ne voudra les manger. C'était une inquiétude légitime, d'ailleurs, on se la posait nous-mêmes."),
      d("nova", PHONG, "Et qu'avez-vous répondu ?"),
      d("shimmer", NGUOI, "On n'a pas répondu, on a fait mesurer. On a confié nos récoltes à un laboratoire indépendant, pendant deux saisons. Résultat : des teneurs en métaux lourds et en polluants tout à fait comparables à celles de légumes cultivés en pleine campagne, et très en dessous des seuils réglementaires. L'explication, c'est qu'à vingt mètres de hauteur, on est au-dessus de la couche où stagnent les gaz d'échappement. Et puis nos plantes ne poussent pas dans le sol de la ville."),
      d("nova", PHONG, "Justement, je ne vois pas de terre. Tout pousse dans ces grandes colonnes blanches…"),
      d("shimmer", NGUOI, "Oui, et ce n'est pas un caprice de designer. Un toit, ça ne supporte pas n'importe quelle charge. Si on avait étalé cinquante centimètres de terre mouillée sur toute la surface, le bâtiment ne l'aurait pas supporté. Donc on cultive à la verticale, dans des colonnes et des bacs très légers, avec des racines à l'air libre ou dans un substrat de fibre de coco. C'est la contrainte du poids qui a dicté toute la conception."),
      d("nova", PHONG, "Et pour l'arrosage ?"),
      d("shimmer", NGUOI, "C'est un circuit fermé. L'eau, enrichie en nutriments, ruisselle le long des racines, on la récupère en bas et on la renvoie en haut. On consomme, euh, à peu près dix fois moins d'eau qu'en pleine terre, pour le même rendement. En période de sécheresse, je vous assure que ça compte."),
      d("nova", PHONG, "Qui achète vos produits ?"),
      d("shimmer", NGUOI, "Surtout des restaurants du quartier, et les habitants, par abonnement. Les chefs, ce qui les séduit, ce n'est pas tellement le côté local, qui fait joli sur la carte. C'est qu'une fraise cueillie à huit heures est dans leur cuisine à neuf. Elle n'a pas passé trois jours dans un camion frigorifique, donc on peut la cueillir mûre, et ça, au goût, ça change tout."),
      d("nova", PHONG, "Est-ce qu'on pourrait nourrir Paris de cette façon ?"),
      d("shimmer", NGUOI, "Non, et il faut arrêter de le laisser croire. Même en couvrant tous les toits qui s'y prêtent, on fournirait quelques pour cent des fruits et légumes de la ville, pas plus. On ne fera jamais pousser de blé ou de pommes de terre ici. Notre rôle est ailleurs : produire du très frais, rafraîchir le bâtiment, et montrer aux citadins comment pousse ce qu'ils mangent."),
      d("nova", PHONG, "Et la suite ?"),
      d("shimmer", NGUOI, "On monte une formation avec la mission locale : chaque année, une douzaine de jeunes sans diplôme, qu'on forme pendant neuf mois au maraîchage urbain. Les deux premières promotions ont presque toutes trouvé un emploi."),
    ],
    cau: [
      q("Quelle objection revenait souvent au lancement du projet ?",
        "Les récoltes seraient contaminées par l'air de la ville.",
        ["Le toit du centre commercial serait trop petit pour être rentable.", "Les habitants refuseraient de monter sur un toit pour acheter."],
        "Người ta nói rau trồng trên đường vành đai sẽ « bourrés de particules » và không ai muốn ăn: nỗi lo là ô nhiễm.", 1.5),
      q("Qu'ont révélé les analyses du laboratoire ?",
        "Des légumes d'une qualité équivalente à ceux de la campagne.",
        ["Des légumes nettement plus riches en vitamines que la moyenne.", "Des légumes pollués seulement pendant la première saison."],
        "Kết quả: hàm lượng kim loại nặng và chất ô nhiễm « tout à fait comparables à celles de légumes cultivés en pleine campagne », thấp hơn nhiều so với ngưỡng quy định.", 1),
      q("Pourquoi cultive-t-on dans des colonnes et des bacs légers ?",
        "Parce que le bâtiment ne pourrait pas porter une couche de terre.",
        ["Parce que cela permet de protéger les racines de la pollution.", "Parce que les architectes voulaient un aspect plus moderne."],
        "Pauline nói mái nhà không chịu được tải bất kỳ: trải nửa mét đất ướt thì toà nhà không chịu nổi. « C'est la contrainte du poids qui a dicté toute la conception ».", 2),
      q("Quel est l'intérêt du système d'arrosage ?",
        "Il réduit fortement la consommation d'eau.",
        ["Il permet de se passer totalement de nutriments.", "Il fonctionne uniquement avec de l'eau de pluie."],
        "Nước chạy theo vòng kín, được thu lại và bơm lên: họ dùng « à peu près dix fois moins d'eau qu'en pleine terre » cho cùng năng suất.", 1.5),
      q("Qu'est-ce qui attire avant tout les restaurateurs ?",
        "La fraîcheur des produits livrés.",
        ["L'image locale qu'ils peuvent afficher sur leur carte.", "Le prix inférieur à celui des grossistes."],
        "Theo Pauline, điều hấp dẫn các bếp trưởng không hẳn là yếu tố địa phương, mà là « une fraise cueillie à huit heures est dans leur cuisine à neuf »: hái được khi chín, nên vị khác hẳn.", 1.5),
      q("Que dit Pauline de la capacité de ces fermes à nourrir la ville ?",
        "Elle restera très limitée.",
        ["Elle suffira d'ici une dizaine d'années.", "Elle dépendra du prix des terrains."],
        "Chị nói thẳng là không: phủ hết các mái phù hợp cũng chỉ cung cấp « quelques pour cent des fruits et légumes de la ville, pas plus ».", 0.5),
      q("Quel projet l'équipe prépare-t-elle ?",
        "Former de jeunes gens au métier.",
        ["Ouvrir un restaurant sur le toit.", "Installer une seconde ferme en banlieue."],
        "Họ lập một khoá đào tạo với mission locale: mỗi năm khoảng mười hai bạn trẻ không bằng cấp học « neuf mois au maraîchage urbain ».", 1),
    ],
  };

  /* ─────────────── NGHE 3 ─────────────── */
  const CO3 = {
    id: "lo20mv7gtqge03q", ten: "b2k-de3-co3", hai: false,
    phanTich: { loai: "Trois courts documents radio", chu_de: "Retour du train de nuit, cuisine antigaspillage, photographie animalière", y_chinh: "Trois chroniques brèves : le succès et les faiblesses du train de nuit, un atelier de cuisine contre le gaspillage, un photographe qui refuse d'appâter les animaux." },
    docs: [
      { doan: [d("alloy", TIN, "On le disait condamné, le voilà qui revient. Après deux décennies de fermetures, plusieurs lignes de train de nuit ont rouvert au départ de Paris, vers Nice, Vienne ou Berlin, et les réservations dépassent toutes les prévisions. Ce qui séduit les voyageurs, d'après une enquête de l'opérateur, ce n'est ni le prix, guère inférieur à celui de l'avion, ni le gain de temps, souvent discutable : c'est le sentiment de se déplacer sans alourdir son bilan carbone. Le tableau n'est pourtant pas sans ombre. Faute de wagons neufs, on a remis en service des voitures vieilles de quarante ans, où la climatisation tombe en panne et où les retards se comptent en heures. Tant que ce matériel n'aura pas été renouvelé, préviennent les associations d'usagers, l'engouement risque de retomber aussi vite qu'il est venu.")],
        cau: [
          q("Pour quelle raison principale les voyageurs choisissent-ils le train de nuit ?",
            "Pour limiter l'impact de leurs déplacements sur le climat.",
            ["Pour payer beaucoup moins cher qu'en prenant l'avion.", "Pour arriver plus tôt à destination le lendemain."],
            "Theo khảo sát, thứ hấp dẫn không phải giá hay thời gian, mà là cảm giác đi lại « sans alourdir son bilan carbone ».", 2),
          q("Qu'est-ce qui doit être amélioré, d'après le document ?",
            "L'état du matériel roulant.",
            ["Le nombre de destinations proposées.", "Le système de réservation."],
            "Vì thiếu toa mới, người ta dùng lại « des voitures vieilles de quarante ans », máy lạnh hỏng, trễ hàng giờ; chừng nào chưa thay thì sự hào hứng có thể xẹp.", 1),
        ] },
      { doan: [d("nova", TIN, "Chaque mercredi soir, dans un centre social de Lille, une quinzaine d'habitants enfilent un tablier. Aux fourneaux, une cheffe leur apprend à tirer parti de ce qui finit d'ordinaire à la poubelle : pain rassis, fanes de carottes, légumes trop mûrs. L'atelier est né d'une observation faite par les travailleurs sociaux du quartier. Les familles ne jetaient pas par négligence, encore moins par aisance : elles jetaient parce qu'elles ne savaient pas quoi faire de ces restes, ni comment les conserver. Deux ans plus tard, les participants disent avoir réduit leurs dépenses alimentaires d'un cinquième. Pour toucher ceux qui ne peuvent pas venir, les recettes ont été réunies dans un livret illustré, distribué gratuitement dans les boîtes aux lettres du quartier et traduit en trois langues.")],
        cau: [
          q("Quel constat est à l'origine de cet atelier ?",
            "Les habitants jetaient faute de savoir utiliser les restes.",
            ["Les habitants achetaient des produits trop chers pour eux.", "Les habitants n'avaient pas de quoi cuisiner chez eux."],
            "Nhân viên xã hội nhận thấy các gia đình vứt đồ không phải vì cẩu thả: « elles ne savaient pas quoi faire de ces restes, ni comment les conserver ».", 1.5),
          q("Comment les recettes sont-elles diffusées auprès des autres habitants ?",
            "Au moyen d'une brochure.",
            ["Par des vidéos en ligne.", "Lors de repas de quartier."],
            "Các công thức được gom trong « un livret illustré », phát miễn phí vào hộp thư của khu phố.", 1),
        ] },
      { doan: [d("echo", TIN, "Antoine Roux peut rester quatre jours immobile sous une toile de camouflage pour une seule image de lynx. Photographe animalier depuis vingt ans, il s'inquiète d'une pratique qui gagne du terrain dans son métier : déposer de la viande ou des graines pour faire venir l'animal à l'endroit voulu. Lui s'y refuse catégoriquement. D'abord parce qu'un animal nourri par l'homme perd sa méfiance et finit souvent par s'approcher des routes ou des chasseurs. Ensuite parce qu'à ses yeux, une image ainsi obtenue est une mise en scène, pas un témoignage. Il lui arrive de rentrer bredouille, et il l'accepte. Ses clichés, pris dans le Jura au fil de six hivers, seront présentés à partir du mois prochain au muséum de Besançon, accompagnés de ses carnets de terrain.")],
        cau: [
          q("Quelle pratique Antoine Roux refuse-t-il ?",
            "Attirer les animaux en leur donnant à manger.",
            ["Photographier les animaux pendant l'hiver.", "Retoucher ses images à l'ordinateur."],
            "Ông lo ngại việc « déposer de la viande ou des graines pour faire venir l'animal » và từ chối dứt khoát.", 1),
          q("Qu'apprend-on sur son actualité ?",
            "Ses photos vont être exposées.",
            ["Il publie un livre sur le lynx.", "Il part travailler dans le Jura."],
            "Ảnh của ông « seront présentés à partir du mois prochain au muséum de Besançon », kèm sổ tay thực địa.", 0.5),
        ] },
    ],
  };

  return { ten: "DELF B2 · Đề 3", CE: [CE1, CE2, CE3], CO: [CO1, CO2, CO3] };
}
