/* Lô 54 (17/11/2026): NỘI DUNG « DELF B2 · Đề 6 » NÂNG ĐỘ KHÓ. Cùng chuẩn với Đề 1.
 * Như Đề 4 và 5: hai bài báo (lô 23) soạn TỪ NGUỒN THẬT. Bản viết lại GIỮ NGUYÊN mọi dữ kiện và con
 * số của bản cũ, KHÔNG thêm dữ kiện mới; phần dài thêm là diễn đạt và lập luận nêu chung. Dòng ghi
 * nguồn lấy lại nguyên văn từ lo23_b2_noi_dung.mjs. Bài nghe và diễn đàn là tình huống FRACILE dựng.
 * Không dùng dấu gạch dài (quy tắc 7). Lời giải trích nguyên văn trong « ». */
import { CAC_DE } from "./lo23_b2_noi_dung.mjs";

const duoiNguon = (t) => { const i = t.indexOf("Texte rédigé"); return i < 0 ? "" : t.slice(t.lastIndexOf("<p", i)).replace(/<\/p><\/p>$/, "</p>"); };

export function noiDung({ q, ai, p, d }) {
  const CU = CAC_DE[2];
  const RADIO = "Parle en français de France comme une journaliste de radio en direct : débit rapide et naturel, enchaîne sans marquer de pause entre les phrases.";
  const KHACH = "Parle en français de France comme un architecte interviewé en direct à la radio : débit rapide, spontané, avec de vraies hésitations, sans articuler de façon scolaire.";
  const PHONG = "Parle en français de France comme un reporter de radio sur le terrain : débit soutenu, ton vivant.";
  const MAIRE = "Parle en français de France comme une maire de petite commune rurale interrogée sur place : débit rapide et direct, quelques hésitations.";
  const NONG = "Parle en français de France comme un agriculteur inquiet : débit rapide, ton franc et un peu las.";
  const TIN = "Parle en français de France comme une chronique radio : débit rapide et dense, sans pause.";

  /* ─────────────── ĐỌC 1 ─────────────── */
  const CE1 = {
    id: "lo23mven91gc03x",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Été 2026 : un record qui ressemble à un avertissement</strong>",
      "Les chiffres sont désormais officiels, et ils ne laissent place à aucune ambiguïté. Selon Météo-France, l'été 2026 est le plus chaud jamais mesuré en France, devant 2003 et 2022, deux millésimes restés pourtant dans toutes les mémoires. Juillet a été le mois le plus chaud depuis le début des relevés, en 1900. Quant à la vague de chaleur de la fin juin, elle a été la plus intense jamais enregistrée : le 25 juin, 72 départements se trouvaient simultanément en vigilance rouge, du jamais-vu depuis la création du dispositif en 2004. Ce qui passait naguère pour une alerte exceptionnelle a concerné, ce jour-là, la plus grande partie du pays.",
      "Le coût humain est considérable. Santé publique France estime à plus de 7 300 le nombre de décès en excès liés aux épisodes de chaleur, l'Île-de-France étant la région la plus touchée. Rien d'étonnant à cela : les grandes agglomérations paient le prix de leur minéralité. Le béton et le bitume emmagasinent la chaleur pendant la journée et la restituent la nuit, de sorte que les corps, privés de fraîcheur nocturne, ne parviennent plus à récupérer. Ce sont les organismes déjà fragilisés, par l'âge ou la maladie, qui cèdent les premiers.",
      "À la chaleur s'est ajoutée une sécheresse inédite. Les sols n'ont jamais été aussi secs depuis le début des mesures, et une large partie du territoire a connu des restrictions d'eau. Le système électrique a lui aussi été mis sous tension, pris en étau entre deux phénomènes contraires : la demande de climatisation augmentait au moment même où la sécheresse réduisait la production hydroélectrique et obligeait certaines centrales à baisser leur production. Plus on avait besoin de courant, moins on était en mesure d'en fournir.",
      "Ce cercle vicieux résume à lui seul le défi des prochaines années. Climatiser davantage, c'est consommer plus d'électricité et rejeter plus de chaleur dans les rues, donc aggraver le mal que l'on prétend combattre. La tentation est grande, pourtant, de s'en remettre à cette réponse immédiate, la seule qu'un ménage puisse mettre en œuvre sans attendre personne. S'adapter durablement suppose au contraire de transformer les villes elles-mêmes : végétaliser, isoler, repenser les horaires. Autant de chantiers lents, coûteux et peu spectaculaires, dont les effets ne se mesurent qu'au bout de plusieurs années, c'est-à-dire bien au-delà d'un mandat.",
      "Le gouvernement a promis de nouvelles mesures. Elles seront jugées à une aune précise : leur capacité à préparer le pays, non pas à un été exceptionnel, mais à des étés qui risquent de devenir ordinaires. Traiter 2026 comme un accident reviendrait à se condamner à l'improvisation, chaque année un peu plus tard et un peu plus cher.",
    ) + duoiNguon(CU.CE1.readingText),
    cau: [
      q("Que nous apprennent les données de Météo-France sur l'été 2026 ?",
        "Il dépasse tous les étés enregistrés jusqu'ici en France.",
        ["Il arrive juste derrière ceux de 2003 et de 2022.", "Il a été nettement plus chaud en août qu'au cours du mois de juillet."],
        "Theo Météo-France, mùa hè 2026 là « le plus chaud jamais mesuré en France, devant 2003 et 2022 ». Tháng nóng nhất là tháng Bảy.", 1),
      q("En quoi la journée du 25 juin a-t-elle été exceptionnelle ?",
        "Un nombre inédit de départements étaient en alerte maximale.",
        ["La température a dépassé le record absolu établi en 1900.", "Le dispositif de vigilance a été déclenché pour la première fois."],
        "Ngày 25 tháng 6, « 72 départements se trouvaient simultanément en vigilance rouge », chưa từng có kể từ khi hệ thống ra đời năm 2004. Năm 1900 là mốc bắt đầu đo đạc, không phải một kỷ lục.", 1.5),
      q("Quelle région a enregistré le plus de décès ?",
        "L'Île-de-France.",
        ["Le sud de la France.", "Les zones rurales."],
        "Bài viết ghi: « l'Île-de-France étant la région la plus touchée ».", 0.5),
      q("Pourquoi la chaleur est-elle plus redoutable dans les grandes villes ?",
        "Les matériaux y relâchent la nuit la chaleur accumulée.",
        ["Les habitants y sont en moyenne plus âgés que dans les campagnes.", "Les restrictions d'eau y ont été plus sévères."],
        "Bê tông và nhựa đường giữ nhiệt ban ngày và « la restituent la nuit », nên cơ thể không hồi sức được.", 1),
      q("Pourquoi le système électrique s'est-il trouvé en difficulté ?",
        "La consommation montait alors que la production reculait.",
        ["Les centrales ont été arrêtées par décision du gouvernement.", "Les climatiseurs ont provoqué des pannes dans les grandes villes."],
        "Nhu cầu máy lạnh tăng « au moment même où la sécheresse réduisait la production hydroélectrique » và buộc một số nhà máy giảm công suất.", 1.5),
      q("En quoi consiste le « cercle vicieux » décrit par l'auteur ?",
        "La climatisation accroît la consommation et réchauffe les rues.",
        ["La sécheresse fait augmenter le prix de l'eau et de l'électricité.", "La végétalisation exige une eau que la ville n'a plus."],
        "Tác giả viết: dùng máy lạnh nhiều hơn là « consommer plus d'électricité et rejeter plus de chaleur dans les rues », tức làm nặng thêm chính vấn đề.", 2),
      q("Sur quel critère les mesures du gouvernement devront-elles être jugées ?",
        "Leur aptitude à préparer des étés très chauds devenus habituels.",
        ["Leur capacité à éviter qu'un été comparable à celui de 2026 ne se reproduise.", "Leur coût pour les finances publiques à court terme."],
        "Các biện pháp sẽ được đánh giá theo khả năng chuẩn bị cho đất nước « non pas à un été exceptionnel, mais à des étés qui risquent de devenir ordinaires ».", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 2 ─────────────── */
  const CE2 = {
    id: "lo23mven91gc03y",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Réseaux sociaux interdits aux moins de 16 ans : le bilan mitigé de l'Australie</strong>",
      "Lorsque l'Australie a interdit, en décembre 2025, l'accès des moins de 16 ans à des plateformes comme Facebook, Instagram ou TikTok, le monde entier a tourné les yeux vers Canberra. Aucun pays n'était allé aussi loin, et beaucoup de gouvernements, tentés par une mesure comparable, attendaient de voir. Quelques mois plus tard, les premiers résultats invitent à la prudence plutôt qu'à l'imitation.",
      "Une étude publiée dans le British Medical Journal, après relecture par d'autres chercheurs, a interrogé plus de 400 jeunes juste avant l'entrée en vigueur de la loi, puis trois mois après. Ses conclusions sont tout en nuances : peu de changements chez les 12-13 ans, une légère baisse d'utilisation chez les 14-15 ans, et une hausse chez les 16 ans et plus, que le texte ne visait pas. Les auteurs ne trouvent pas de preuves suffisantes d'un effet important à court terme, et décrivent une loi appliquée de manière incomplète. On est loin du basculement que ses promoteurs annonçaient.",
      "C'est que les moyens de contournement ne manquent pas : comptes ouverts au nom d'un adulte, faux profils, navigation privée. Il suffit souvent de quelques minutes à un adolescent décidé pour retrouver l'accès qu'on prétendait lui fermer. Les plateformes encourent pourtant des amendes très élevées, jusqu'à 49,5 millions de dollars australiens, si elles ne prouvent pas des efforts significatifs. Pour la ministre des Communications, le diagnostic ne fait aucun doute : ce n'est pas la loi qui est défaillante, mais les géants du numérique qui ne la respectent pas. Une lecture commode, objecteront certains, puisqu'elle dispense de s'interroger sur le texte lui-même.",
      "Derrière cette passe d'armes se profile une difficulté plus profonde : vérifier l'âge d'un utilisateur sans recueillir de données sensibles reste un problème que personne n'a encore résolu de façon satisfaisante.",
      "L'expérience australienne est observée de près par d'autres pays, du Royaume-Uni à la Nouvelle-Zélande, et nourrit le débat européen. Elle montre qu'une interdiction, aussi populaire soit-elle auprès des parents, ne suffit pas : sans outils de contrôle fiables et sans coopération des entreprises, la règle reste en partie théorique. Le soutien de l'opinion, en somme, ne garantit rien quant à l'efficacité. Il peut même se retourner si la promesse faite aux familles n'est pas tenue.",
      "Il serait cependant prématuré d'en conclure à l'échec. Trois mois, rappellent les chercheurs, c'est bien peu pour juger d'un changement de société. Les habitudes numériques ne se défont pas en un trimestre, et les effets d'une telle mesure, s'ils existent, se liront peut-être d'abord chez les plus jeunes, ceux qui n'auront jamais ouvert de compte.",
    ) + duoiNguon(CU.CE2.readingText),
    cau: [
      q("Depuis quand cette interdiction est-elle appliquée en Australie ?",
        "Depuis la fin de l'année 2025.",
        ["Depuis le mois de juin 2026.", "Depuis trois mois seulement."],
        "Bài viết nói Úc cấm « en décembre 2025 ». Ba tháng là khoảng cách giữa hai lần khảo sát của nghiên cứu.", 1),
      q("Comment les chercheurs ont-ils procédé ?",
        "Ils ont questionné les mêmes jeunes avant la loi, puis quelques mois plus tard.",
        ["Ils ont comparé les jeunes Australiens à ceux d'autres pays anglophones.", "Ils ont analysé pendant un an les données d'utilisation fournies par les plateformes."],
        "Nghiên cứu hỏi hơn 400 bạn trẻ « juste avant l'entrée en vigueur de la loi, puis trois mois après ».", 1.5),
      q("Qu'a-t-on observé chez les jeunes de 16 ans et plus ?",
        "Leur usage a augmenté.",
        ["Leur usage a légèrement diminué.", "Leur usage est resté stable."],
        "Kết quả: ít thay đổi ở 12-13 tuổi, giảm nhẹ ở 14-15 tuổi, « et une hausse chez les 16 ans et plus ».", 0.5),
      q("Quelle conclusion les auteurs de l'étude formulent-ils ?",
        "Rien ne prouve, pour l'instant, que la loi ait un effet marqué.",
        ["La loi a clairement échoué et devrait être abandonnée.", "La loi fonctionne bien, du moins chez les plus jeunes des adolescents."],
        "Các tác giả « ne trouvent pas de preuves suffisantes d'un effet important à court terme » và mô tả một đạo luật được áp dụng chưa đầy đủ. Họ không kết luận là thất bại.", 1),
      q("Quel procédé de contournement l'article mentionne-t-il ?",
        "Créer un compte sous l'identité d'une personne majeure.",
        ["Utiliser une application conçue et hébergée dans un autre pays.", "Payer un abonnement réservé aux adultes."],
        "Bài viết liệt kê: « comptes ouverts au nom d'un adulte, faux profils, navigation privée ».", 1.5),
      q("À qui la ministre des Communications attribue-t-elle les difficultés ?",
        "Aux grandes entreprises du numérique, qui n'appliquent pas la loi.",
        ["Aux parents, qui ouvrent eux-mêmes des comptes à la place de leurs enfants.", "Aux chercheurs, dont l'étude serait trop limitée."],
        "Theo bà bộ trưởng, « ce n'est pas la loi qui est défaillante, mais les géants du numérique qui ne la respectent pas ».", 2),
      q("Sur quoi les chercheurs attirent-ils l'attention à la fin de l'article ?",
        "Le délai écoulé est trop bref pour tirer des conclusions.",
        ["Les autres pays devraient dès maintenant renoncer à imiter l'Australie.", "Les amendes prévues ne sont pas assez élevées."],
        "Các nhà nghiên cứu nhắc rằng ba tháng « c'est bien peu pour juger d'un changement de société ».", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 3 ─────────────── */
  const TEN = ["Gérard", "Yasmine", "Hugo"];
  const a = ai(TEN);
  const CE3 = {
    id: "lo23mven91gc03z",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Faut-il installer la climatisation dans tous les logements ? »</p>",
    readingText: p(
      "<strong>Gérard</strong>",
      "J'ai soixante-dix-huit ans et j'habite au dernier étage, sous les toits. Cet été, le thermomètre de ma chambre affichait trente-cinq degrés à minuit, plusieurs nuits de suite. Je ne dormais plus, je ne mangeais plus. Mon médecin a été catégorique : à mon âge, avec mon cœur, je jouais ma vie. J'ai donc fait poser un climatiseur, et je n'éprouve pas l'ombre d'un regret. Qu'on ne vienne pas me parler de confort ou de caprice : j'ai connu des étés sans rien, et je m'en accommodais. Pour quelqu'un comme moi, ce n'est plus un luxe, c'est ce qui permet de passer le mois d'août. Ceux qui me font la leçon ont en général quarante ans de moins.",
      "<strong>Yasmine</strong>",
      "Ingénieure dans le secteur de l'énergie, je comprends parfaitement les cas comme celui de ce monsieur, et personne ne songe à les lui reprocher. Mais raisonnons à l'échelle d'une ville. Si chaque logement s'équipe, la consommation d'électricité explose aux heures où le réseau est déjà saturé, et l'air chaud rejeté par des milliers d'appareils fait monter la température des rues. On rafraîchit son salon en réchauffant celui du voisin : le serpent se mord la queue. La priorité devrait aller à ce qui empêche la chaleur d'entrer, isolation, volets, toitures claires, arbres au pied des immeubles. La climatisation doit demeurer l'exception, réservée à ceux dont la santé l'exige.",
      "<strong>Hugo</strong>",
      "Tout cela est bien joli, mais on oublie ceux qui ne décident de rien. Je suis locataire d'un deux-pièces mal isolé. Je n'ai ni les moyens d'acheter un climatiseur, ni le droit de poser des volets ou de toucher à la façade. Chaque été, on m'explique ce qu'il faudrait faire, comme si cela dépendait de moi. Or c'est mon propriétaire qui tient les clés, et il n'a aucune raison de dépenser un euro puisque c'est moi qui étouffe. La loi l'oblige bien à me fournir un logement chauffé en hiver. Je ne vois pas pourquoi elle ne lui imposerait pas un logement supportable en été.",
    ),
    cau: [
      a("Pour certaines personnes, la climatisation est devenue indispensable.", "Gérard", "Gérard nói với người như ông, máy lạnh « ce n'est plus un luxe », mà là thứ giúp ông qua được tháng Tám; bác sĩ còn nói ông đang đánh cược mạng sống.", 2),
      a("Il faut commencer par empêcher la chaleur de pénétrer dans les bâtiments.", "Yasmine", "Yasmine cho rằng ưu tiên phải dành cho « ce qui empêche la chaleur d'entrer »: cách nhiệt, cửa chớp, mái sáng màu, cây xanh.", 1.5),
      a("Ceux qui louent leur logement n'ont aucun moyen d'agir.", "Hugo", "Hugo là người thuê nhà: anh không đủ tiền mua máy lạnh, cũng không có quyền lắp cửa chớp; « c'est mon propriétaire qui tient les clés ».", 1),
      a("Équiper tous les logements ne ferait qu'empirer la situation.", "Yasmine", "Yasmine giải thích nếu nhà nào cũng lắp thì điện tiêu thụ tăng vọt và khí nóng thải ra làm phố nóng thêm: « le serpent se mord la queue ».", 1.5),
      a("La loi devrait contraindre les bailleurs à garantir un logement vivable en été.", "Hugo", "Hugo nói luật buộc chủ nhà cung cấp chỗ ở có sưởi mùa đông, và anh không hiểu vì sao luật không buộc thêm « un logement supportable en été ».", 0.5),
      a("J'ai agi sur la recommandation d'un médecin.", "Gérard", "Gérard kể: « Mon médecin a été catégorique », nên ông đã cho lắp máy lạnh.", 0.5),
    ],
  };

  /* ─────────────── NGHE 1 ─────────────── */
  const CO1 = {
    id: "lo23mven7nhq03u", ten: "b2k-de6-co1", hai: true,
    gioiThieu: "Vous écoutez une émission à la radio.",
    phanTich: { loai: "Interview à la radio", chu_de: "Faut-il climatiser les écoles ?", y_chinh: "Un architecte défend l'idée que la climatisation doit rester le dernier recours : il faut d'abord empêcher la chaleur d'entrer, ventiler la nuit et planter des arbres, quitte à équiper une salle de repli en attendant." },
    doan: [
      d("sage", RADIO, "Bonjour à tous. Après l'été que nous venons de traverser, une question revient dans tous les conseils municipaux : faut-il équiper les écoles de climatiseurs ? Des parents le réclament, des enseignants ont dû faire classe par trente-quatre degrés, et certaines communes ont déjà voté les crédits. Notre invité, lui, appelle à ne pas se précipiter. Il est architecte, spécialiste des bâtiments scolaires. Bonjour. Vous êtes contre la climatisation dans les écoles ?"),
      d("echo", KHACH, "Bonjour. Alors, contre, euh, non, ce serait caricatural. Ce que je dis, et ça surprend souvent, c'est qu'elle doit être le dernier recours, pas le premier. Aujourd'hui, on fait exactement l'inverse : il fait chaud, on achète une machine. Or cette machine pose deux problèmes. Le premier, c'est qu'un climatiseur ne fait pas disparaître la chaleur, il la déplace. Il la prend dans la classe et il la rejette dehors, dans la cour, dans la rue. Multipliez ça par tous les bâtiments d'un quartier, et vous réchauffez la ville que vous prétendez rafraîchir."),
      d("sage", RADIO, "Et le second ?"),
      d("echo", KHACH, "Le second, c'est l'électricité. Un climatiseur consomme énormément, et il consomme précisément aux heures où tout le monde en a besoin, quand le réseau est déjà à la limite. On l'a vu cet été : il y a eu des journées où on n'était pas loin de devoir couper. Donc équiper dix mille écoles sans réfléchir, c'est, euh, préparer les difficultés de demain."),
      d("sage", RADIO, "Très bien, mais concrètement, que proposez-vous à la place ?"),
      d("echo", KHACH, "De prendre le problème dans l'ordre. La première étape, et de loin la plus efficace, c'est d'empêcher la chaleur d'entrer. Ça veut dire des volets ou des stores à l'extérieur des fenêtres, pas à l'intérieur, parce qu'une fois que le soleil a traversé la vitre, c'est trop tard. Ça veut dire des toitures claires ou végétalisées, et une isolation correcte. Deuxième étape : ventiler la nuit, quand l'air extérieur est plus frais, pour évacuer ce que les murs ont accumulé dans la journée. C'est tout bête, ça suppose simplement des fenêtres qu'on puisse ouvrir en sécurité. Et troisième étape, transformer les cours. Un arbre adulte, c'est une climatisation naturelle : il fait de l'ombre, il rafraîchit l'air, et il ne consomme rien. En combinant tout ça, on gagne facilement quatre ou cinq degrés dans les classes."),
      d("sage", RADIO, "Tout cela prend des années, et les enfants, eux, ont chaud maintenant."),
      d("echo", KHACH, "Vous avez raison, et je ne vais pas le nier : c'est long, et c'est cher. Je ne demande pas aux maires d'attendre dix ans les bras croisés. Pour les écoles qui ne peuvent pas attendre, ce que je conseille, c'est d'équiper au moins une salle, une seule, qu'on appelle une salle de repli. On y accueille à tour de rôle les enfants les plus fragiles, ceux qui ont de l'asthme, les plus petits, pour qu'ils puissent se reposer au frais. Ça coûte dix fois moins que de climatiser tout le bâtiment."),
      d("sage", RADIO, "Qu'est-ce qui vous inquiète le plus, au fond ?"),
      d("echo", KHACH, "C'est qu'on climatise partout sans rien changer aux bâtiments. Parce que là, on aurait tout perdu : on paierait des factures énormes pour refroidir des passoires, et on chaufferait encore un peu plus nos villes. La machine deviendrait une excuse pour ne pas faire les travaux."),
      d("sage", RADIO, "Merci beaucoup."),
    ],
    cau: [
      q("Quelle est la position de l'architecte sur la climatisation des écoles ?",
        "Elle ne doit être envisagée qu'après les autres solutions.",
        ["Elle devrait être purement et simplement interdite dans les bâtiments publics.", "Elle est la réponse la plus rapide et la plus sûre."],
        "Ông nói máy lạnh phải là « le dernier recours, pas le premier »; ông không phản đối tuyệt đối.", 1),
      q("Pourquoi la climatisation contribue-t-elle à réchauffer la ville ?",
        "Elle évacue vers l'extérieur la chaleur retirée des pièces.",
        ["Elle fait fonctionner davantage les centrales électriques de la région.", "Elle empêche l'air frais de circuler la nuit."],
        "Ông giải thích máy lạnh không làm nhiệt biến mất, nó dời nhiệt: lấy trong lớp và « il la rejette dehors, dans la cour, dans la rue ».", 1.5),
      q("Quel second inconvénient souligne-t-il ?",
        "Une consommation d'électricité élevée.",
        ["Un bruit gênant pour les élèves.", "Un entretien très coûteux."],
        "Vấn đề thứ hai là điện: máy lạnh « consomme énormément », đúng vào giờ lưới điện đã ở giới hạn.", 0.5),
      q("Par quoi faut-il commencer, selon lui ?",
        "Par ce qui évite que la chaleur ne pénètre dans le bâtiment.",
        ["Par l'installation de ventilateurs dans chaque classe.", "Par la plantation d'arbres adultes dans toutes les cours de récréation."],
        "Bước đầu, hiệu quả nhất, là « empêcher la chaleur d'entrer »: cửa chớp phía ngoài, mái sáng màu, cách nhiệt. Trồng cây là bước thứ ba.", 1),
      q("À quel moment recommande-t-il d'aérer les bâtiments ?",
        "Pendant la nuit, quand l'air est moins chaud.",
        ["En milieu de journée, pour renouveler l'air.", "Tôt le matin, juste avant l'arrivée des élèves."],
        "Bước hai: « ventiler la nuit, quand l'air extérieur est plus frais », để thải lượng nhiệt tường đã tích trong ngày.", 1.5),
      q("Que conseille-t-il aux écoles qui ne peuvent pas attendre les travaux ?",
        "De rafraîchir une seule pièce, destinée aux élèves les plus vulnérables.",
        ["De fermer l'établissement pendant les journées les plus chaudes.", "De climatiser provisoirement l'ensemble des classes situées au rez-de-chaussée."],
        "Ông khuyên trang bị ít nhất một phòng, « une salle de repli », nơi luân phiên đón các em yếu nhất; rẻ hơn mười lần so với làm lạnh cả toà nhà.", 2),
      q("Quel est, à ses yeux, le véritable danger ?",
        "Généraliser la climatisation sans améliorer les bâtiments.",
        ["Dépenser trop d'argent public pour planter des arbres dans les cours.", "Laisser chaque maire décider seul."],
        "Điều ông lo nhất là « on climatise partout sans rien changer aux bâtiments »: trả hoá đơn khổng lồ để làm lạnh những toà nhà hở, và làm thành phố nóng thêm.", 1.5),
    ],
  };

  /* ─────────────── NGHE 2 ─────────────── */
  const CO2 = {
    id: "lo23mven877c03v", ten: "b2k-de6-co2", hai: true,
    gioiThieu: "Vous écoutez un reportage à la radio.",
    phanTich: { loai: "Reportage radio", chu_de: "Une commune rurale face à la sécheresse", y_chinh: "Après trois semaines de coupures d'eau nocturnes, une maire raconte la solidarité et les tensions, présente le plan voté par la commune, tandis qu'un agriculteur s'inquiète pour ses cultures." },
    doan: [
      d("onyx", PHONG, "Dans cette commune du Gers de neuf cents habitants, l'été 2026 restera dans toutes les mémoires. Pendant trois semaines, au cœur du mois d'août, l'eau du robinet a été coupée chaque nuit, de vingt-deux heures à six heures, pour préserver ce qu'il restait dans les réserves. Du jamais-vu. La maire nous reçoit devant la salle des fêtes, où des packs d'eau sont encore empilés."),
      d("shimmer", MAIRE, "On n'avait jamais connu ça, jamais. Même les anciens du village, qui ont vu 1976, me disent que ce n'était pas comparable. Le plus urgent, ça a été de s'occuper de ceux qui ne pouvaient pas se débrouiller. On a distribué des bouteilles à domicile aux personnes âgées et aux familles qui avaient des bébés, parce qu'un biberon à trois heures du matin, euh, ça n'attend pas. Et là, je dois dire que les habitants ont été formidables. Des gens qui ne se parlaient pas se sont mis à faire les tournées ensemble. Mais je ne vais pas vous peindre un tableau idyllique. On a eu des tensions, des vraies. Il y avait ceux qui se privaient, et puis il y avait ceux qui continuaient tranquillement à remplir leur piscine. Quand vous n'avez pas d'eau pour vous laver et que vous entendez le tuyau du voisin, ça crée des rancœurs qui ne s'effacent pas en septembre."),
      d("onyx", PHONG, "Depuis, le conseil municipal a voté un plan en trois volets. D'abord, récupérer l'eau de pluie sur tous les bâtiments publics, l'école, la mairie, le gymnase, pour arroser et nettoyer sans toucher au réseau. Ensuite, et c'est le chantier le plus coûteux, réparer les canalisations. Car le diagnostic a révélé une réalité embarrassante : une part importante de l'eau se perdait dans les fuites avant même d'arriver chez les habitants. Enfin, la commune versera une aide aux particuliers qui installent chez eux un récupérateur."),
      d("shimmer", MAIRE, "Les fuites, franchement, ça m'a mise en colère. On demandait aux gens de fermer le robinet pendant qu'ils se brossaient les dents, et pendant ce temps, on perdait des milliers de litres sous la route. On aurait dû s'en occuper il y a vingt ans. Sauf que réparer un réseau, ça ne se voit pas, et ça ne rapporte aucune voix."),
      d("onyx", PHONG, "Tous ne sont pas rassurés. Autour du village, les agriculteurs redoutent la suite. L'un d'eux, producteur de maïs, nous a confié son inquiétude."),
      d("echo", NONG, "Moi, je veux bien qu'on économise l'eau, je suis le premier concerné. Mais si on nous restreint encore l'irrigation, il y a des cultures qu'on ne pourra tout simplement plus faire ici. Le maïs, c'est fini. Et on ne change pas de production comme de chemise : ça veut dire d'autres machines, d'autres débouchés, des années sans revenu."),
      d("onyx", PHONG, "La question sera au cœur d'une réunion publique prévue en décembre. Son ordre du jour tient en trois mots : partager l'eau. Entre les habitants, les agriculteurs et les quelques entreprises de la commune, il faudra bien décider qui passe en premier."),
    ],
    cau: [
      q("Que s'est-il passé dans cette commune au cours de l'été ?",
        "L'eau courante a été interrompue toutes les nuits.",
        ["L'eau du robinet a été déclarée impropre à la consommation.", "Les habitants ont dû quitter leur logement pendant les fortes chaleurs."],
        "Phóng viên nói nước máy « a été coupée chaque nuit, de vingt-deux heures à six heures », để giữ phần còn lại trong bể chứa.", 1),
      q("Combien de temps cette situation a-t-elle duré ?",
        "Trois semaines.",
        ["Tout le mois d'août.", "Une dizaine de jours."],
        "Việc cắt nước kéo dài « Pendant trois semaines, au cœur du mois d'août ».", 1.5),
      q("À qui la mairie a-t-elle apporté des bouteilles d'eau ?",
        "Aux personnes âgées et aux parents de nourrissons.",
        ["À l'ensemble des foyers du village.", "Aux agriculteurs des environs et à leurs employés saisonniers."],
        "Bà thị trưởng nói đã phát nước tận nhà « aux personnes âgées et aux familles qui avaient des bébés ».", 0.5),
      q("Qu'est-ce qui a provoqué des tensions entre habitants ?",
        "Certains continuaient à remplir leur piscine.",
        ["Certains refusaient d'aider aux distributions.", "Certains stockaient des bouteilles chez eux."],
        "Bà kể có người chịu thiếu thốn, và có người « continuaient tranquillement à remplir leur piscine », gây ra những oán giận kéo dài.", 1),
      q("Quelle mesure du plan concerne le réseau lui-même ?",
        "La réparation des fuites dans les canalisations.",
        ["La construction d'un nouveau réservoir.", "L'installation de compteurs individuels dans chaque foyer."],
        "Công trình tốn kém nhất là sửa đường ống, vì « une part importante de l'eau se perdait dans les fuites » trước khi tới nhà dân.", 1.5),
      q("Que redoutent les agriculteurs ?",
        "De devoir abandonner certaines cultures faute d'eau.",
        ["De payer l'eau beaucoup plus cher que les habitants du village.", "De perdre les aides versées par la commune."],
        "Người nông dân nói nếu tưới tiêu bị hạn chế thêm thì « il y a des cultures qu'on ne pourra tout simplement plus faire ici »; ngô thì hết.", 2),
      q("De quoi sera-t-il question lors de la réunion de décembre ?",
        "De la répartition de l'eau entre les usagers.",
        ["Du prix de l'eau pour l'année suivante.", "De l'interdiction définitive des piscines privées."],
        "Chương trình buổi họp gói trong ba chữ: « partager l'eau », giữa dân, nông dân và doanh nghiệp.", 1.5),
    ],
  };

  /* ─────────────── NGHE 3 ─────────────── */
  const CO3 = {
    id: "lo23mven91gc03w", ten: "b2k-de6-co3", hai: false,
    phanTich: { loai: "Trois courts documents radio", chu_de: "Plantations à Strasbourg, notifications nocturnes, carte des îlots de fraîcheur", y_chinh: "Trois chroniques brèves : une ville qui plante des arbres après un record de chaleur, un réseau social qui coupe les notifications nocturnes des mineurs, des collégiens qui cartographient les lieux frais de leur ville." },
    docs: [
      { doan: [d("alloy", TIN, "À Strasbourg, l'été a laissé des traces. Pour la première fois depuis que l'on y relève les températures, le thermomètre a dépassé les quarante degrés. La municipalité en a tiré une décision qu'elle présente comme une rupture : plusieurs milliers d'arbres seront plantés d'ici 2030. Tous les quartiers ne seront pas servis en même temps. La ville a choisi de commencer là où les habitants supportent le moins bien la chaleur, c'est-à-dire aux abords des écoles et des maisons de retraite. Le plan prévoit aussi de retirer le bitume de plusieurs places pour le remplacer par de la terre. Des commerçants s'inquiètent déjà de la disparition de places de stationnement. La mairie assume : entre une voiture garée et un arbre, dit-elle, elle a fait son choix.")],
        cau: [
          q("Quel événement s'est produit à Strasbourg cet été ?",
            "La température y a franchi un seuil jamais atteint auparavant.",
            ["La ville a dû fermer toutes ses écoles pendant plusieurs semaines.", "Des milliers d'arbres sont morts à cause de la sécheresse."],
            "Bản tin nói lần đầu tiên kể từ khi đo nhiệt độ ở đây, « le thermomètre a dépassé les quarante degrés ».", 2),
          q("Où les arbres seront-ils plantés en premier ?",
            "À proximité des écoles et des maisons de retraite.",
            ["Sur les places du centre-ville.", "Le long des grandes avenues."],
            "Thành phố bắt đầu ở nơi người dân chịu nóng kém nhất: « aux abords des écoles et des maisons de retraite ».", 1),
        ] },
      { doan: [d("nova", TIN, "C'est une annonce que les associations de parents attendaient depuis longtemps. L'un des réseaux sociaux les plus utilisés par les adolescents a fait savoir qu'il désactiverait désormais, par défaut, les notifications envoyées la nuit sur les comptes de mineurs. Entre vingt-deux heures et six heures, plus de sonnerie, plus de vibration : les messages attendront le matin. L'adolescent pourra modifier ce réglage, mais il devra le faire lui-même. La plateforme met en avant les études qui lient ces alertes nocturnes au manque de sommeil. Les associations saluent la décision, sans cacher une certaine amertume : elles la réclamaient depuis des années, et jugent qu'elle arrive bien tard. Plusieurs y voient surtout une manière de devancer des lois plus contraignantes.")],
        cau: [
          q("Quelle mesure ce réseau social annonce-t-il ?",
            "Couper automatiquement les alertes nocturnes pour les mineurs.",
            ["Interdire l'accès à l'application pendant la nuit.", "Supprimer définitivement les comptes des utilisateurs de moins de 16 ans."],
            "Mạng xã hội này sẽ tắt, theo mặc định, « les notifications envoyées la nuit sur les comptes de mineurs »; ứng dụng vẫn dùng được.", 1.5),
          q("Comment les associations de parents accueillent-elles cette annonce ?",
            "Elles l'approuvent, tout en regrettant qu'elle vienne si tard.",
            ["Elles la rejettent, car elle leur paraît inutile.", "Elles s'en réjouissent sans aucune réserve."],
            "Các hiệp hội hoan nghênh nhưng có phần cay đắng: họ đòi điều này từ nhiều năm và cho rằng nó « arrive bien tard ».", 1),
        ] },
      { doan: [d("echo", TIN, "Où se réfugier quand il fait trente-huit degrés et qu'on n'a pas de jardin ? Des élèves de quatrième d'un collège de Bretagne ont décidé d'y répondre eux-mêmes. Pendant trois mois, thermomètre en main, ils ont parcouru leur ville et relevé la température dans une centaine de lieux. Le résultat tient sur une feuille : une carte des îlots de fraîcheur, où figurent les parcs ombragés, les églises, les bibliothèques, les fontaines et les passages couverts. Les collégiens ont aussi noté les horaires d'ouverture et l'accessibilité aux fauteuils roulants. La mairie, séduite, a décidé d'imprimer le document et de le distribuer à tous les habitants avant l'été prochain. Leur professeur de géographie se dit surtout frappé par une chose : beaucoup ignoraient qu'ils avaient le droit d'entrer dans une église pour s'y reposer.")],
        cau: [
          q("Qu'ont réalisé ces élèves ?",
            "Un plan des endroits frais de leur ville.",
            ["Une étude sur la pollution de l'air en ville.", "Un guide des jardins privés."],
            "Các em làm « une carte des îlots de fraîcheur »: công viên có bóng mát, nhà thờ, thư viện, đài nước.", 1),
          q("Quand ce document sera-t-il remis aux habitants ?",
            "Avant le prochain été.",
            ["À la rentrée de septembre.", "Dès le mois prochain."],
            "Toà thị chính sẽ in và phát cho mọi người dân « avant l'été prochain ».", 0.5),
        ] },
    ],
  };

  return { ten: "DELF B2 · Đề 6", CE: [CE1, CE2, CE3], CO: [CO1, CO2, CO3] };
}
