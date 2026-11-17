/* Lô 54 (17/11/2026): NỘI DUNG « DELF B2 · Đề 4 » NÂNG ĐỘ KHÓ. Cùng chuẩn với Đề 1.
 *
 * KHÁC Đề 1 đến 3: hai bài báo của đề này (lô 23) được soạn TỪ NGUỒN THẬT và có ghi nguồn. Bản viết
 * lại GIỮ NGUYÊN mọi dữ kiện của bản cũ (ngày tháng, tên văn bản, con số) và KHÔNG thêm dữ kiện mới
 * về các sự kiện đó: phần dài thêm chỉ là diễn đạt, lập luận và ý kiến được nêu chung (« ses
 * partisans », « ses détracteurs »). Dòng ghi nguồn lấy lại nguyên văn từ lo23_b2_noi_dung.mjs.
 * Bài nghe và diễn đàn là tình huống do FRACILE dựng.
 * Không dùng dấu gạch dài (quy tắc 7). Lời giải trích nguyên văn trong « ». */
import { CAC_DE } from "./lo23_b2_noi_dung.mjs";

const duoiNguon = (t) => { const i = t.indexOf("Texte rédigé"); return i < 0 ? "" : t.slice(t.lastIndexOf("<p", i)).replace(/<\/p><\/p>$/, "</p>"); };

export function noiDung({ q, ai, p, d }) {
  const CU = CAC_DE[0];
  const RADIO = "Parle en français de France comme un journaliste de radio en direct : débit rapide et naturel, enchaîne sans marquer de pause entre les phrases.";
  const KHACH = "Parle en français de France comme une juriste interviewée en direct à la radio : débit rapide, spontané, avec de vraies hésitations, sans articuler de façon scolaire.";
  const PHONG = "Parle en français de France comme un reporter de radio sur le terrain : débit soutenu, ton vivant.";
  const HS = "Parle en français de France comme une lycéenne interrogée dans un couloir : débit très rapide, familier, phrases qui s'enchaînent.";
  const GV = "Parle en français de France comme un enseignant interrogé dans son établissement : débit rapide et naturel, quelques hésitations.";
  const TIN = "Parle en français de France comme une chronique radio : débit rapide et dense, sans pause.";

  /* ─────────────── ĐỌC 1 ─────────────── */
  const CE1 = {
    id: "lo23mven531h03f",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Protéger les enfants en ligne : l'Europe prend le relais</strong>",
      "L'été 2026 aura réservé bien des déconvenues aux défenseurs d'une « majorité numérique ». En juillet, le Parlement français adoptait l'interdiction des réseaux sociaux aux moins de 15 ans. Le répit fut de courte durée : dès le mois d'août, le Conseil constitutionnel censurait le texte, estimant notamment que la vérification de l'âge de l'ensemble des utilisateurs portait une atteinte excessive à la vie privée. Autrement dit, pour écarter les plus jeunes, il aurait fallu contrôler tout le monde, et c'est ce prix que les juges ont refusé de payer. Le gouvernement, qui ne s'avoue pas vaincu, promet une nouvelle copie avant le printemps 2027.",
      "Dans l'intervalle, c'est Bruxelles qui a repris la main. Le 17 septembre, la Commission européenne a dévoilé un projet de règlement baptisé « EU Kids Act ». Plutôt qu'un âge couperet, en deçà duquel tout serait interdit et au-delà duquel tout serait permis, le texte retient une démarche graduée : aucun réseau social avant 13 ans, un accès placé sous contrôle parental entre 13 et 15 ans, puis un accès sécurisé jusqu'à la majorité. Il entend en outre priver les mineurs des fonctionnalités jugées addictives et contraindre les plateformes à intégrer la sécurité dès la conception de leurs services, au lieu de la greffer après coup.",
      "L'approche a ses partisans, pour qui elle a le mérite d'épouser la réalité : on ne passe pas, du jour au lendemain, de l'enfance à l'autonomie. Ses détracteurs y voient à l'inverse une construction trop subtile pour être lisible par les familles, et redoutent que le contrôle parental ne repose, en pratique, que sur les parents déjà les mieux informés.",
      "L'atout d'un règlement européen ne fait en revanche guère débat. Il s'appliquerait de façon identique dans les vingt-sept États membres et mettrait fin au conflit permanent entre lois nationales et droit européen, celui-là même qui avait fragilisé le texte français. La Commission travaille d'ailleurs, avec sept États dont la France, à un outil commun de vérification de l'âge respectueux de la vie privée, qu'elle espère rendre disponible d'ici à la fin de l'année. De sa fiabilité dépendra, pour une bonne part, la crédibilité de l'ensemble.",
      "Rien n'est joué pour autant. Le projet doit encore être adopté par le Parlement européen et par les États, un parcours qui peut s'étirer sur des mois, voire des années, et dont un texte ne sort jamais tout à fait intact. Surtout, l'exemple australien invite à la modestie : l'interdiction en vigueur là-bas depuis décembre 2025 est largement contournée. Preuve, s'il en fallait une, qu'une règle ne vaut que par les moyens qu'on se donne de la faire respecter, et qu'il ne suffit pas de proclamer une interdiction pour qu'elle entre dans les faits.",
    ) + duoiNguon(CU.CE1.readingText),
    cau: [
      q("Pour quel motif le Conseil constitutionnel a-t-il censuré la loi française ?",
        "Le contrôle de l'âge empiétait trop sur la vie privée de tous.",
        ["Le texte ne prévoyait aucune sanction contre les plateformes concernées.", "L'interdiction entrait en conflit avec un règlement européen déjà voté."],
        "Hội đồng Hiến pháp cho rằng việc kiểm tra tuổi của toàn bộ người dùng « portait une atteinte excessive à la vie privée ». Bài không nói gì về chế tài, và quy định châu Âu khi đó mới chỉ là dự thảo.", 1),
      q("Qu'est-ce que l'« EU Kids Act » ?",
        "Une proposition de texte européen qui n'est pas encore en vigueur.",
        ["Une loi française réécrite après la décision du Conseil constitutionnel.", "Un outil technique de vérification de l'âge mis au point par sept États."],
        "Ngày 17 tháng 9, Uỷ ban châu Âu công bố « un projet de règlement baptisé « EU Kids Act » »: mới là dự thảo, còn phải được thông qua. Công cụ kiểm tra tuổi là một việc khác đang làm song song.", 1.5),
      q("Qu'est-ce qui caractérise la démarche retenue par la Commission ?",
        "Les règles évoluent par paliers selon l'âge.",
        ["Un seuil unique sépare ce qui est interdit et permis.", "Chaque État fixe librement l'âge qu'il juge adapté."],
        "Văn bản chọn « une démarche graduée » thay vì « un âge couperet »: trước 13 tuổi, 13 đến 15, rồi tới tuổi trưởng thành.", 0.5),
      q("Dans quelles conditions un jeune de 14 ans accéderait-il aux réseaux sociaux ?",
        "Avec une surveillance exercée par ses parents.",
        ["Librement, à condition de déclarer son âge réel.", "Uniquement sur des plateformes réservées aux mineurs."],
        "Từ 13 đến 15 tuổi, dự thảo quy định « un accès placé sous contrôle parental ».", 1),
      q("Quel avantage l'article reconnaît-il à un règlement européen ?",
        "Il éviterait les contradictions entre droit national et droit européen.",
        ["Il permettrait à chaque pays d'adapter les règles à sa propre situation.", "Il dispenserait les plateformes de vérifier l'âge de leurs utilisateurs."],
        "Quy định sẽ áp dụng như nhau ở hai mươi bảy nước và chấm dứt « conflit permanent entre lois nationales et droit européen », thứ đã làm luật Pháp yếu đi.", 1.5),
      q("Pourquoi l'issue du projet demeure-t-elle incertaine ?",
        "Il lui reste à franchir une procédure d'adoption longue, qui peut le modifier.",
        ["Les sept États associés au projet ont déjà annoncé qu'ils s'y opposeraient.", "Le Conseil constitutionnel français pourrait le censurer à son tour."],
        "Dự thảo còn phải được Nghị viện châu Âu và các nước thông qua, một chặng đường « qui peut s'étirer sur des mois, voire des années », và văn bản không bao giờ ra khỏi đó mà còn nguyên vẹn.", 2),
      q("Quelle leçon l'auteur tire-t-il de l'exemple australien ?",
        "Une interdiction reste lettre morte si l'on ne peut pas l'appliquer.",
        ["Une interdiction fonctionne mieux lorsqu'elle vise les moins de 16 ans.", "Une interdiction doit d'abord être testée dans un seul pays."],
        "Lệnh cấm ở Úc « est largement contournée »; tác giả kết: một quy tắc « ne vaut que par les moyens qu'on se donne de la faire respecter ».", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 2 ─────────────── */
  const CE2 = {
    id: "lo23mven531h03g",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Avec l'IA, l'école doit-elle encore transmettre des savoirs ?</strong>",
      "Le 13 octobre 2026, à Paris, des responsables d'établissements, des entreprises de la tech éducative et des institutions culturelles se sont retrouvés autour d'une interrogation qui taraude désormais tous les enseignants : à quoi sert l'école, dès lors qu'une machine répond en quelques secondes à presque n'importe quelle question ? Longtemps cantonné aux colloques de spécialistes, le débat s'est invité dans chaque salle de classe.",
      "Pour une partie des intervenants, l'intelligence artificielle constitue avant tout une chance. Elle permettrait d'ajuster les exercices au rythme de chaque élève, ce qu'aucun professeur, seul face à trente enfants, n'est matériellement en mesure de faire. Ils se gardent toutefois de tout enthousiasme indistinct, et prennent soin de séparer les outils généralistes, conçus pour tout faire, des outils pensés pour apprendre. Les premiers donnent la réponse ; les seconds sont censés conduire l'élève à la trouver. Encore faut-il savoir les reconnaître : d'où leur plaidoyer pour une formation des enseignants à la hauteur de l'enjeu, sans laquelle le choix se fera au hasard ou sous l'influence des vendeurs.",
      "D'autres ont préféré insister sur ce que la technologie ne saurait remplacer : la classe comme lieu collectif, où l'on apprend avec les autres, et parfois contre eux. Se mesurer à un camarade, défendre une idée devant un groupe, accepter d'être contredit, rien de cela ne s'obtient en tête-à-tête avec un écran. L'ambition, à les entendre, n'est pas d'évincer le professeur mais d'« augmenter l'humain », c'est-à-dire de mettre l'outil au service de celui qui enseigne. Et puisque l'école a perdu le monopole du savoir, le métier lui-même changerait de nature : il s'agirait moins de délivrer des connaissances que d'apprendre aux élèves à construire un raisonnement, à vérifier une source et à comprendre leurs propres erreurs.",
      "Ce déplacement n'a rien d'anodin : il suppose de revoir les programmes, les examens et jusqu'à la manière de noter, autant de chantiers dont chacun mesure la lenteur.",
      "La question du diplôme, elle, a nettement partagé l'assistance. Pour les uns, il conserve toute sa valeur, car il atteste d'un parcours de transformation et de qualités, tels l'esprit critique ou la créativité, qu'aucun test ponctuel ne mesure. Pour les autres, les employeurs gagneraient à juger davantage sur les compétences réelles que sur les titres, dont la signification s'érode à mesure qu'une machine peut rédiger un mémoire.",
      "Au bout du compte, les participants ont refusé l'alternative que suggérait l'intitulé de la rencontre. Opposer savoirs et réflexion leur est apparu comme un faux dilemme : sans connaissances solides, on ne peut pas penser par soi-même, et sans esprit critique, les connaissances ne protègent de rien. Une conviction, enfin, a fait l'unanimité : les écrans ne remplaceront pas les échanges humains.",
    ) + duoiNguon(CU.CE2.readingText),
    cau: [
      q("Quelle interrogation a réuni les participants de la rencontre du 13 octobre ?",
        "La raison d'être de l'école à l'heure des machines qui répondent à tout.",
        ["Le financement des outils numériques dans les établissements scolaires.", "L'interdiction de l'intelligence artificielle pendant les examens."],
        "Câu hỏi được nêu là: trường học để làm gì « dès lors qu'une machine répond en quelques secondes à presque n'importe quelle question ».", 1),
      q("Quel avantage certains intervenants prêtent-ils à l'intelligence artificielle ?",
        "Elle rendrait possible un travail adapté à chaque élève.",
        ["Elle permettrait de réduire le nombre d'élèves par classe.", "Elle dispenserait les enseignants de corriger les copies."],
        "Theo họ, AI cho phép « ajuster les exercices au rythme de chaque élève », điều một giáo viên đứng trước ba mươi học sinh không làm nổi.", 1.5),
      q("Quelle distinction ces intervenants établissent-ils ?",
        "Entre les outils polyvalents et ceux qui sont conçus pour apprendre.",
        ["Entre les outils gratuits et ceux que vendent les entreprises.", "Entre les outils destinés aux élèves et ceux des professeurs."],
        "Họ tách « les outils généralistes, conçus pour tout faire, des outils pensés pour apprendre »: loại đầu đưa đáp án, loại sau dẫn học sinh tự tìm.", 0.5),
      q("Que recouvre l'expression « augmenter l'humain » ?",
        "Faire de la technologie un appui pour l'enseignant.",
        ["Confier à la machine les tâches que le professeur fait mal.", "Demander aux élèves de travailler davantage à la maison."],
        "Bài viết giải thích: tham vọng không phải gạt giáo viên ra mà là « mettre l'outil au service de celui qui enseigne ».", 1),
      q("Comment le rôle du professeur évoluerait-il, l'école n'ayant plus le monopole du savoir ?",
        "Il consisterait surtout à former au raisonnement et à l'esprit de vérification.",
        ["Il se limiterait à surveiller l'usage que les élèves font des écrans.", "Il reviendrait à transmettre davantage de connaissances qu'auparavant."],
        "Nghề dạy học sẽ đổi bản chất: bớt truyền đạt kiến thức, thêm dạy học sinh « à construire un raisonnement, à vérifier une source et à comprendre leurs propres erreurs ».", 1.5),
      q("Quelle a été la position des participants sur la valeur du diplôme ?",
        "Ils n'ont pas réussi à s'accorder.",
        ["Ils ont jugé qu'il n'avait plus de sens.", "Ils ont estimé qu'il restait indispensable."],
        "Bài viết nói câu hỏi về bằng cấp « a nettement partagé l'assistance »: người cho rằng bằng vẫn giữ giá trị, người muốn nhà tuyển dụng xét năng lực thật.", 2),
      q("À quelle conclusion la rencontre aboutit-elle ?",
        "Connaissances et esprit critique sont indissociables.",
        ["La réflexion doit désormais passer avant les connaissances.", "Les savoirs doivent redevenir la priorité de l'école."],
        "Những người tham dự coi việc đối lập kiến thức và tư duy là « un faux dilemme »: thiếu kiến thức thì không tự nghĩ được, thiếu óc phê phán thì kiến thức không bảo vệ được gì.", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 3 ─────────────── */
  const TEN = ["Claire", "Mehdi", "Paul"];
  const a = ai(TEN);
  const CE3 = {
    id: "lo23mven531h03h",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Faut-il interdire l'IA pour les devoirs à la maison ? »</p>",
    readingText: p(
      "<strong>Claire</strong>",
      "J'enseigne le français en lycée, et je vais être franche : interdire ne rime à rien. Aucun de nous n'ira vérifier ce qui se passe, le soir, dans la chambre de trente-cinq élèves, et les logiciels censés détecter les textes produits par une machine se trompent une fois sur trois, au risque d'accuser un innocent. Plutôt que de jouer aux gendarmes, j'ai revu ma façon de faire. La rédaction se prépare désormais en classe, sous mes yeux ; à la maison, je demande une lecture, que nous discutons ensuite à l'oral. Et je choisis des sujets où l'élève doit engager son propre jugement. C'est à nous de nous adapter, pas à la technologie de disparaître.",
      "<strong>Mehdi</strong>",
      "Mon fils est en troisième. Il passe deux heures sur un commentaire de texte pendant que certains de ses camarades recopient, en cinq minutes, ce que leur fournit une machine, et récoltent une meilleure note que lui sans avoir rien compris. Comment voulez-vous que je lui explique que l'effort paie ? Ce qui me révolte, ce n'est pas l'outil, c'est le flou. Chaque professeur a sa doctrine, certains ferment les yeux, d'autres sanctionnent. Qu'on fixe une fois pour toutes ce qui est autorisé et ce qui ne l'est pas, par écrit, pour tout l'établissement. Tant que rien n'est clair, ce sont les élèves honnêtes qui sont pénalisés.",
      "<strong>Paul</strong>",
      "Je suis en terminale, et je m'en sers presque tous les soirs, sans m'en cacher. Mes parents n'ont pas fait d'études et n'ont pas les moyens de m'offrir des cours particuliers ; quand je bloque sur un exercice de physique à vingt-deux heures, je n'ai personne à qui demander. Je ne lui fais pas faire mon travail : je lui demande de m'expliquer autrement, ou de me dire où mon raisonnement déraille. Ceux qui veulent l'interdire oublient que les élèves des familles aisées ont toujours eu quelqu'un pour les aider. Pour une fois qu'un soutien est accessible à tout le monde, on voudrait nous le retirer.",
    ),
    cau: [
      a("L'IA apporte une aide à ceux qui ne peuvent compter sur personne d'autre.", "Paul", "Paul kể cha mẹ không học cao, không đủ tiền thuê gia sư: khi bí bài lúc mười giờ đêm, « je n'ai personne à qui demander ».", 2),
      a("Il est impossible de contrôler le respect d'une interdiction.", "Claire", "Claire nói không ai đi kiểm tra được chuyện xảy ra buổi tối trong phòng của ba mươi lăm học sinh, và phần mềm phát hiện thì « se trompent une fois sur trois ».", 1.5),
      a("Le recours à l'IA fausse l'égalité entre les élèves.", "Mehdi", "Con trai Mehdi mất hai giờ, trong khi bạn chép bài của máy trong năm phút và « récoltent une meilleure note que lui sans avoir rien compris ».", 1),
      a("C'est la conception même des devoirs qu'il faut repenser.", "Claire", "Claire đã đổi cách làm: bài viết chuẩn bị trên lớp, ở nhà chỉ đọc, đề bài đòi ý kiến riêng. Cô kết: « C'est à nous de nous adapter ».", 1.5),
      a("Il faudrait une règle écrite, valable pour toute l'école.", "Mehdi", "Mehdi bực vì mỗi giáo viên một kiểu, và đòi quy định rõ điều được phép « par écrit, pour tout l'établissement ».", 0.5),
      a("Je m'en sers pour comprendre, non pour qu'elle travaille à ma place.", "Paul", "Paul nói: « Je ne lui fais pas faire mon travail »; cậu nhờ giải thích cách khác hoặc chỉ ra chỗ lập luận sai.", 0.5),
    ],
  };

  /* ─────────────── NGHE 1 ─────────────── */
  const CO1 = {
    id: "lo23mven3lk303c", ten: "b2k-de4-co1", hai: true,
    gioiThieu: "Vous écoutez une émission à la radio.",
    phanTich: { loai: "Interview à la radio", chu_de: "La vérification de l'âge sur internet", y_chinh: "Une juriste explique pourquoi vérifier l'âge sans collecter de données est si difficile, présente le principe du double anonymat et rappelle que la technique ne remplace pas l'éducation." },
    doan: [
      d("sage", RADIO, "Bonjour à tous. Empêcher les mineurs d'accéder à certains contenus en ligne, voilà un objectif sur lequel tout le monde s'accorde. Les difficultés commencent dès qu'on se demande comment faire. Car vérifier l'âge d'un internaute, c'est forcément lui demander quelque chose, et tout l'enjeu est là : comment s'assurer qu'une personne est majeure sans constituer, au passage, un gigantesque fichier de ses données personnelles ? Nous recevons une juriste spécialiste du droit du numérique. Bonjour. On en est où, aujourd'hui ?"),
      d("shimmer", KHACH, "Bonjour. On en est, euh, à peu près nulle part, il faut avoir l'honnêteté de le dire. Le problème est très simple à énoncer et redoutable à résoudre. Aujourd'hui, la grande majorité des sites se contentent d'afficher une petite fenêtre : avez-vous plus de dix-huit ans, oui, non. C'est ce qu'on appelle une déclaration sur l'honneur. Et, vous imaginez bien, un enfant de dix ans clique sur oui en une seconde, sans même lire la question. Ça ne protège personne. Ça protège juridiquement le site, c'est tout."),
      d("sage", RADIO, "Alors pourquoi ne pas exiger une pièce d'identité, tout simplement ?"),
      d("shimmer", KHACH, "Parce que là, on tombe dans l'excès inverse. Demander une carte d'identité à chaque connexion, ça veut dire confier une copie de ses papiers à des entreprises privées, souvent installées à l'étranger, dont on ne sait pas très bien ce qu'elles en feront, ni combien de temps elles les garderont. Et puis, euh, il y a un autre danger dont on parle moins : ces fichiers, tôt ou tard, ils fuitent. Imaginez une base de données qui associe votre identité aux sites que vous consultez. Le remède serait pire que le mal."),
      d("sage", RADIO, "On entend beaucoup parler du « double anonymat ». De quoi s'agit-il ?"),
      d("shimmer", KHACH, "C'est l'idée la plus prometteuse, à mon sens. On fait intervenir un tiers, un intermédiaire, entre vous et le site. Vous prouvez votre âge à ce tiers, une fois. Lui, il sait qui vous êtes, mais il ignore totalement quel site vous allez consulter. Et le site, de son côté, ne reçoit qu'une seule information, une réponse par oui ou par non : cette personne est majeure, ou elle ne l'est pas. Il ne connaît ni votre nom, ni votre date de naissance. Chacun n'a donc qu'une moitié de l'information, et personne ne peut reconstituer l'ensemble. D'où ce nom de double anonymat."),
      d("sage", RADIO, "Sur le papier, c'est séduisant. Et dans la réalité ?"),
      d("shimmer", KHACH, "Dans la réalité, ça repose sur deux conditions, et aucune n'est acquise. La première, c'est que ce fameux tiers soit réellement indépendant : indépendant des plateformes, bien sûr, mais aussi, je dirais, de toute tentation de surveillance. Si c'est une filiale du réseau social, on n'a rien gagné. La seconde, c'est que les plateformes jouent le jeu, et là, euh, je suis plus réservée. Elles ont un intérêt économique évident à garder le plus d'utilisateurs possible, y compris les plus jeunes. Sans sanction dissuasive, elles traîneront les pieds."),
      d("sage", RADIO, "Si le système fonctionne, le problème sera réglé ?"),
      d("shimmer", KHACH, "Non, et c'est ce que je voudrais qu'on retienne. Je fais souvent la comparaison avec la ceinture de sécurité. Elle sauve des vies, personne ne songerait à s'en passer. Mais elle n'a jamais appris à quiconque à conduire. La vérification de l'âge, c'est pareil : elle limite les dégâts, elle n'apprend pas à un adolescent à se repérer en ligne, à reconnaître une manipulation, à poser un téléphone. Ça, aucune technique ne le fera à la place des parents et de l'école."),
      d("sage", RADIO, "Merci beaucoup."),
    ],
    cau: [
      q("Quelle difficulté le journaliste présente-t-il en introduction ?",
        "Contrôler l'âge sans accumuler de données personnelles.",
        ["Définir quels contenus doivent être interdits aux mineurs.", "Convaincre les parents de surveiller leurs enfants."],
        "Nhà báo nêu vấn đề: làm sao biết một người đã trưởng thành « sans constituer, au passage, un gigantesque fichier de ses données personnelles ». Về mục tiêu thì ai cũng đồng ý.", 1),
      q("Que font aujourd'hui la plupart des sites ?",
        "Ils se bornent à demander à l'internaute s'il est majeur.",
        ["Ils exigent l'envoi d'une copie d'une pièce d'identité.", "Ils confient la vérification à une entreprise indépendante."],
        "Phần lớn trang chỉ hiện một ô hỏi đã trên mười tám tuổi chưa: « une déclaration sur l'honneur ».", 1.5),
      q("Pourquoi cette méthode ne protège-t-elle pas les enfants ?",
        "Il leur suffit de mentir.",
        ["Elle n'existe que sur les sites étrangers.", "Elle demande trop de temps."],
        "Bà nói một đứa trẻ mười tuổi « clique sur oui en une seconde »; cách này chỉ bảo vệ trang web về mặt pháp lý.", 0.5),
      q("Quel danger y aurait-il à exiger une pièce d'identité ?",
        "Remettre des informations sensibles à des sociétés privées.",
        ["Empêcher les adultes sans papiers d'accéder à internet.", "Ralentir considérablement le fonctionnement des sites."],
        "Việc đó là giao bản sao giấy tờ cho « des entreprises privées, souvent installées à l'étranger »; và các tệp ấy sớm muộn cũng rò rỉ.", 1),
      q("Dans le système du « double anonymat », quelle information le site reçoit-il ?",
        "Uniquement une confirmation que l'utilisateur est majeur ou non.",
        ["Le nom de l'utilisateur, mais pas sa date de naissance.", "La liste des autres sites que l'utilisateur a consultés."],
        "Bà giải thích trang web « ne reçoit qu'une seule information, une réponse par oui ou par non »; nó không biết tên hay ngày sinh.", 1.5),
      q("À quelles conditions ce système peut-il fonctionner, selon la juriste ?",
        "Si l'intermédiaire est vraiment indépendant et si les plateformes coopèrent.",
        ["Si les parents acceptent de fournir eux-mêmes les papiers de leurs enfants.", "Si tous les pays européens adoptent la même pièce d'identité."],
        "Hai điều kiện: bên thứ ba phải « réellement indépendant », và các nền tảng « jouent le jeu »; về điều sau bà dè dặt vì chúng có lợi ích kinh tế giữ người dùng.", 2),
      q("Que veut-elle montrer en comparant ce dispositif à la ceinture de sécurité ?",
        "Qu'une protection technique ne remplace pas l'apprentissage.",
        ["Qu'il faudra des années avant que tout le monde l'accepte.", "Qu'il doit être rendu obligatoire par la loi pour être utile."],
        "Dây an toàn cứu mạng nhưng « n'a jamais appris à quiconque à conduire »; kiểm tra tuổi cũng vậy: giảm thiệt hại, không dạy thiếu niên cách tự định hướng trên mạng.", 1.5),
    ],
  };

  /* ─────────────── NGHE 2 ─────────────── */
  const CO2 = {
    id: "lo23mven47h703d", ten: "b2k-de4-co2", hai: true,
    gioiThieu: "Vous écoutez une émission à la radio.",
    phanTich: { loai: "Reportage radio", chu_de: "Un lycée où les téléphones restent éteints", y_chinh: "Six semaines après l'entrée en vigueur de la règle, élèves, enseignant et proviseur dressent un bilan nuancé : plus d'échanges et moins de conflits, mais des activités à repenser et des parents inquiets." },
    doan: [
      d("onyx", PHONG, "Huit heures moins dix, devant le lycée Marie-Curie. Les derniers messages s'envoient à la hâte, puis les téléphones disparaissent au fond des sacs, éteints. Depuis la rentrée, c'est la règle ici, comme désormais dans tous les lycées. Six semaines après, nous sommes venus voir ce que cela change. Et d'abord auprès des premiers concernés."),
      d("nova", HS, "Au début, on râlait tous, mais vraiment tous. Moi je pensais que ce serait l'horreur, que j'allais passer mes pauses à regarder le mur. Et en fait, euh, c'est bizarre à dire, mais à la récré on se parle. Avant, on était six sur un banc, chacun sur son écran. Maintenant il y a même des gens qui apportent des cartes, il y a des parties dans le hall, je n'avais jamais vu ça en trois ans. Bon, je ne vais pas vous mentir, il y en a qui trichent, qui vont aux toilettes pour regarder leurs messages. Mais c'est une minorité. Et puis, le truc auquel je ne m'attendais pas, c'est que le soir je suis moins fatiguée. Avant, j'avais l'impression d'avoir été sollicitée toute la journée, sans arrêt, par des messages auxquels il fallait répondre tout de suite. Là, pendant huit heures, personne n'attend rien de moi."),
      d("onyx", PHONG, "Chez les enseignants, le bilan est plus contrasté. Ce professeur d'histoire ne cache pas qu'il a dû s'adapter."),
      d("echo", GV, "Sur l'attention, il n'y a pas de débat : les dix premières minutes de cours, que je passais à faire ranger les appareils, je les ai récupérées. Les élèves entrent, ils sont là. En revanche, il faut être honnête, euh, ça m'a compliqué la tâche. J'utilisais beaucoup les téléphones pour des questionnaires en ligne, des petits sondages en direct, ça marchait très bien. Du jour au lendemain, j'ai dû tout revoir. Le lycée prête maintenant des tablettes pour ces séances, mais il y en a trente pour tout l'établissement, il faut les réserver une semaine à l'avance. La spontanéité, on l'a perdue."),
      d("onyx", PHONG, "Le proviseur, lui, retient un effet auquel il ne s'attendait pas forcément."),
      d("sage", GV, "Ce qui a le plus changé, de mon point de vue, ce sont les conflits. L'an dernier, je recevais chaque semaine des élèves, et parfois des professeurs, photographiés ou filmés en classe à leur insu, avec des images qui circulaient dans la soirée. C'était devenu une source permanente de tensions, et quelquefois de véritable harcèlement. Depuis septembre, ces signalements ont pratiquement disparu. Rien que pour cela, je ne reviendrais pas en arrière."),
      d("onyx", PHONG, "Tout le monde n'est pas rassuré pour autant. À la sortie, plusieurs parents confient leur malaise : ne plus pouvoir joindre leur enfant à tout moment, pour un rendez-vous déplacé ou un simple contretemps, leur paraît difficile à accepter. La réponse de l'établissement tient en une phrase : en cas de besoin, on appelle la vie scolaire, qui transmet le message, exactement comme on le faisait il y a vingt ans. Certains s'y résignent en souriant. D'autres attendent de voir, et le conseil d'administration fera le point en janvier."),
    ],
    cau: [
      q("Depuis quand les téléphones doivent-ils rester éteints dans ce lycée ?",
        "Depuis le début de l'année scolaire.",
        ["Depuis six semaines seulement, à titre d'essai.", "Depuis une décision prise en janvier dernier."],
        "Phóng viên nói: « Depuis la rentrée, c'est la règle ici ». Sáu tuần là khoảng thời gian đã trôi qua, không phải thời điểm thử nghiệm.", 1),
      q("Quelle était l'attitude de la lycéenne avant l'application de la règle ?",
        "Elle y était hostile et redoutait de s'ennuyer.",
        ["Elle y était favorable, contrairement à ses camarades.", "Elle n'avait pas d'avis, n'utilisant pas son téléphone."],
        "Em nói: « Au début, on râlait tous » và nghĩ sẽ là « l'horreur », rằng giờ nghỉ chỉ ngồi nhìn tường.", 1.5),
      q("Qu'observe-t-elle désormais pendant les pauses ?",
        "Les élèves discutent et jouent ensemble.",
        ["La plupart des élèves trichent aux toilettes.", "Les élèves restent seuls sur leur banc."],
        "Giờ ra chơi các bạn nói chuyện với nhau, có người mang bài, « il y a des parties dans le hall ». Người gian lận chỉ là thiểu số.", 0.5),
      q("Quel bénéfice le professeur d'histoire constate-t-il ?",
        "Les élèves sont attentifs dès le début de l'heure.",
        ["Les élèves obtiennent de meilleures notes qu'avant.", "Les élèves participent davantage aux sondages faits en classe."],
        "Thầy nói mười phút đầu giờ, trước đây mất để bắt cất máy, nay lấy lại được: « Les élèves entrent, ils sont là ».", 1),
      q("Comment le lycée compense-t-il la disparition des questionnaires sur téléphone ?",
        "Il met des tablettes à disposition, en nombre limité.",
        ["Il autorise de nouveau le téléphone pendant certains cours d'histoire.", "Il a équipé chaque salle d'un ordinateur."],
        "Trường cho mượn máy tính bảng, nhưng chỉ có « trente pour tout l'établissement » và phải đặt trước một tuần; thầy tiếc là mất tính tức thời.", 1.5),
      q("Quel changement le proviseur juge-t-il le plus important ?",
        "La quasi-disparition des tensions dues aux images prises en classe.",
        ["La baisse du nombre d'élèves absents en début de journée.", "L'amélioration des relations entre parents et professeurs."],
        "Năm ngoái tuần nào ông cũng tiếp những người bị chụp, quay lén trong lớp; từ tháng Chín, « ces signalements ont pratiquement disparu ».", 2),
      q("Que doivent faire les parents qui veulent joindre leur enfant ?",
        "S'adresser au service de la vie scolaire.",
        ["Attendre la sortie des cours, sauf en cas d'urgence médicale.", "Envoyer un message au professeur."],
        "Câu trả lời của trường: khi cần thì « on appelle la vie scolaire, qui transmet le message », như hai mươi năm trước.", 1.5),
    ],
  };

  /* ─────────────── NGHE 3 ─────────────── */
  const CO3 = {
    id: "lo23mven531h03e", ten: "b2k-de4-co3", hai: false,
    phanTich: { loai: "Trois courts documents radio", chu_de: "Ateliers parents-écrans, examens à l'oral, un mois sans écran le soir", y_chinh: "Trois chroniques brèves : des ateliers pour parents dans une bibliothèque, une école d'ingénieurs qui fait expliquer les devoirs à l'oral, un village qui propose des soirées sans écran." },
    docs: [
      { doan: [d("alloy", TIN, "Depuis septembre, une bibliothèque municipale de Lille propose, un samedi sur deux, des ateliers destinés non pas aux enfants, mais à leurs parents. Le programme annonçait une formation pratique : apprendre à régler les téléphones, limiter le temps d'utilisation, bloquer certains contenus. Les bibliothécaires ont pourtant vite compris que l'essentiel se jouait ailleurs. Une fois les réglages expliqués, les participants restent, et parlent entre eux : à quel âge avez-vous cédé, que faites-vous pendant les repas, comment tenez-vous quand tout le monde autour a dit oui ? Beaucoup confient qu'ils se croyaient seuls à hésiter. Interrogés à la sortie, huit sur dix citent ces échanges, et non la partie technique, comme ce qu'ils retiennent. Les séances affichent complet jusqu'en décembre, et deux autres bibliothèques s'apprêtent à reprendre la formule.")],
        cau: [
          q("À qui s'adressent ces ateliers et sur quoi portent-ils ?",
            "Aux parents, sur l'usage des écrans par leurs enfants.",
            ["Aux enfants, pour leur apprendre à se servir d'un téléphone.", "Aux bibliothécaires, pour les former aux outils numériques."],
            "Bản tin nói các buổi này dành « non pas aux enfants, mais à leurs parents », và nói về cách chỉnh điện thoại, giới hạn thời gian dùng.", 2),
          q("Qu'est-ce que les participants apprécient le plus ?",
            "De pouvoir discuter avec d'autres parents.",
            ["D'apprendre à bloquer certains contenus.", "De rencontrer des spécialistes de l'enfance."],
            "Khi được hỏi, tám trên mười người nêu « ces échanges, et non la partie technique » là điều họ giữ lại.", 1),
        ] },
      { doan: [d("nova", TIN, "Dans cette école d'ingénieurs de Grenoble, rendre un devoir ne suffit plus. Depuis la rentrée, chaque travail écrit réalisé à la maison est suivi d'un entretien de dix minutes : l'étudiant doit exposer son raisonnement devant un enseignant, justifier ses choix, et répondre à deux ou trois questions imprévues. La direction ne s'en cache pas : la mesure répond à l'arrivée des outils d'intelligence artificielle, capables de produire en quelques secondes une copie impeccable. Puisqu'on ne peut plus savoir qui a écrit le texte, on vérifie que celui qui le signe le comprend. Le dispositif a un coût, puisqu'il a fallu dégager des centaines d'heures d'enseignants. Les étudiants, d'abord hostiles, reconnaissent qu'ils préparent leurs devoirs plus sérieusement, sachant qu'ils devront les défendre.")],
        cau: [
          q("Qu'est-ce qui a changé dans cette école ?",
            "Les étudiants doivent expliquer de vive voix leur démarche.",
            ["Les devoirs à la maison ont été remplacés par des examens.", "Les étudiants rédigent leurs copies sous surveillance."],
            "Mỗi bài viết làm ở nhà nay kèm một buổi trao đổi mười phút: sinh viên phải « exposer son raisonnement devant un enseignant ».", 1.5),
          q("Pourquoi l'école a-t-elle pris cette décision ?",
            "Une machine peut désormais écrire le devoir à la place de l'étudiant.",
            ["Les étudiants avaient de trop mauvais résultats à l'écrit.", "Les enseignants manquaient de temps pour corriger."],
            "Ban giám hiệu nói rõ đây là để đáp lại các công cụ AI, « capables de produire en quelques secondes une copie impeccable ».", 1),
        ] },
      { doan: [d("echo", TIN, "Un village de la Drôme de cinq cents habitants s'est lancé cet automne un défi peu banal : un mois sans écran le soir, à partir de dix-neuf heures, pour toutes les familles qui le souhaitent. Pas d'obligation, pas de contrôle : chacun s'engage sur parole. En contrepartie, la mairie ouvre chaque soir la salle des fêtes et y organise une activité gratuite, chorale le lundi, observation des étoiles le mardi, jeux de société ou atelier de cuisine les autres jours. Une quarantaine de foyers se sont inscrits, bien plus que ne l'espérait le conseil municipal. Les premiers retours sont mitigés : les enfants s'y font plus vite que leurs parents. Le maire envisage de reconduire l'opération au printemps, et plusieurs communes voisines ont déjà demandé le mode d'emploi.")],
        cau: [
          q("En quoi consiste le défi lancé par ce village ?",
            "Renoncer aux écrans en soirée pendant un mois.",
            ["Éteindre son téléphone pendant les repas.", "Supprimer la télévision à l'école."],
            "Ngôi làng đặt thử thách: « un mois sans écran le soir, à partir de dix-neuf heures », cho các gia đình tự nguyện.", 1),
          q("Combien de foyers environ participent ?",
            "Une quarantaine.",
            ["Une dizaine.", "Cinq cents."],
            "Bản tin nói « Une quarantaine de foyers se sont inscrits »; năm trăm là số dân của làng.", 0.5),
        ] },
    ],
  };

  return { ten: "DELF B2 · Đề 4", CE: [CE1, CE2, CE3], CO: [CO1, CO2, CO3] };
}
