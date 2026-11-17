/* Lô 54 (17/11/2026): NỘI DUNG « DELF B2 · Đề 2 » NÂNG ĐỘ KHÓ. Cùng chuẩn với Đề 1 (xem
 * lo54_b2_de1_kho_noi_dung.mjs): giữ chủ đề, số câu và thang điểm của đề cũ (lô 20), viết lại toàn bộ.
 * Mọi nội dung do FRACILE soạn; số liệu trong bài là hư cấu cho mục đích luyện thi.
 * Không dùng dấu gạch dài (quy tắc 7). Lời giải trích nguyên văn trong « ». */

export function noiDung({ q, ai, p, d }) {
  const RADIO = "Parle en français de France comme un journaliste de radio en direct : débit rapide et naturel, enchaîne sans marquer de pause entre les phrases.";
  const KHACH = "Parle en français de France comme un invité interviewé en direct à la radio : débit rapide, spontané, avec de vraies hésitations, sans articuler de façon scolaire.";
  const PHONG = "Parle en français de France comme une reporter de radio sur le terrain : débit soutenu, ton vivant.";
  const NGUOI = "Parle en français de France comme une personne interrogée sur son lieu de travail : débit rapide et familier, phrases qui s'enchaînent, quelques hésitations.";
  const TIN = "Parle en français de France comme une chronique radio : débit rapide et dense, sans pause.";

  /* ─────────────── ĐỌC 1 ─────────────── */
  const CE1 = {
    id: "lo20mv7grn3q03l",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Semaine de quatre jours : promesse tenue ou trompe-l'œil ?</strong>",
      "Longtemps cantonnée à quelques entreprises pionnières, la semaine de quatre jours gagne du terrain. Sans qu'aucune loi ne l'impose, plusieurs centaines de sociétés françaises l'ont adoptée, et des collectivités s'y essaient à leur tour. L'engouement est tel que la formule passe désormais, dans certains secteurs en tension, pour un argument de recrutement à part entière.",
      "C'est du reste ce qui a décidé une société lyonnaise de services informatiques à sauter le pas. « Nous n'arrivions plus à pourvoir nos postes, reconnaît sa dirigeante. Depuis que l'annonce figure sur nos offres, nous recevons trois fois plus de candidatures, et des profils que nous n'aurions jamais attirés auparavant. » La productivité, elle, n'a pas fléchi, ce que la direction attribue à la suppression de réunions jugées superflues plutôt qu'à un surcroît d'ardeur.",
      "Du côté des salariés, l'adhésion est quasi unanime. On cite un rendez-vous médical enfin possible, un enfant qu'on va chercher à l'école, une journée où l'on n'appartient à personne. Autrement dit, moins un gain de loisir qu'une vie personnelle et une vie professionnelle qui cessent de se télescoper.",
      "Laurent Simon, sociologue du travail, se refuse pourtant à y voir un progrès sans mélange. Dans la plupart des cas, souligne-t-il, la durée hebdomadaire n'a pas été réduite d'une minute : on a simplement comprimé trente-cinq ou trente-neuf heures sur quatre jours. « Des journées de dix heures, cela se supporte à trente ans, quand on n'a personne à charge. Pour un parent isolé ou un salarié vieillissant, c'est une autre histoire. Certains finissent la semaine plus éprouvés qu'avant, sans oser le dire, puisque tout le monde est censé se réjouir. »",
      "Sa principale réserve est ailleurs. La formule profite d'abord aux cadres et aux employés de bureau, dont l'activité se laisse réorganiser. « On voit mal comment l'appliquer à une infirmière, à un chauffeur de bus ou à une caissière, dont le métier exige une présence continue. Si l'on n'y prend garde, on creusera un fossé de plus entre ceux qui peuvent aménager leur temps et ceux qui ne le peuvent pas, et ce sont, sans surprise, les moins bien payés. » À l'hôpital, où quelques services ont tenté l'expérience, il a fallu embaucher pour combler les trous, ce que peu d'établissements peuvent s'offrir.",
      "Les organisations patronales, de leur côté, mettent en garde contre toute généralisation hâtive : ce qui réussit à une entreprise de quarante salariés ne se transpose pas d'emblée à une usine qui tourne jour et nuit, et rien ne dit que les gains observés la première année résisteront à l'usure du temps.",
      "Faut-il pour autant renoncer ? Le sociologue ne le pense pas, mais il juge que le débat est mal engagé. « On discute du nombre de jours alors que la vraie question est celle de la quantité de travail demandée. Tant qu'on exigera la même production en moins de temps, on n'aura fait que déplacer la fatigue. Une réforme digne de ce nom commencerait par alléger la charge, quitte à décider ensuite de la manière de la répartir. » Un ordre des priorités qui, admet-il, n'a rien pour séduire les employeurs.",
    ),
    cau: [
      q("Que dit l'article de la diffusion de la semaine de quatre jours en France ?",
        "Elle progresse sans y être poussée par la législation.",
        ["Elle s'est généralisée depuis qu'une loi l'encourage.", "Elle reste limitée à quelques grandes entreprises pionnières."],
        "Bài viết nói mô hình này « gagne du terrain » và « Sans qu'aucune loi ne l'impose », hàng trăm công ty đã áp dụng. Không có luật nào thúc đẩy, và nó cũng không còn bó hẹp ở vài doanh nghiệp tiên phong.", 1),
      q("Quel bénéfice la société lyonnaise a-t-elle tiré de ce changement ?",
        "Elle recrute beaucoup plus facilement.",
        ["Ses salariés travaillent avec davantage d'ardeur.", "Elle a pu réduire le nombre de ses postes."],
        "Giám đốc nói từ khi ghi điều này trong tin tuyển dụng, « nous recevons trois fois plus de candidatures ». Năng suất chỉ giữ nguyên, và ban lãnh đạo nói rõ đó không phải nhờ « un surcroît d'ardeur ».", 1.5),
      q("Qu'est-ce que les salariés apprécient avant tout ?",
        "De mieux articuler travail et vie privée.",
        ["De disposer de plus de temps pour les loisirs.", "De gagner autant en travaillant moins d'heures."],
        "Bài viết tóm lại: đây là « moins un gain de loisir » mà là đời sống riêng và công việc « cessent de se télescoper », tức là hai bên thôi giẫm lên nhau.", 1),
      q("Quel inconvénient Laurent Simon met-il d'abord en avant ?",
        "L'allongement des journées, pénible pour certains.",
        ["La baisse de salaire que subissent les parents isolés.", "L'ennui des salariés pendant leur jour libre."],
        "Ông nhắc số giờ tuần không giảm, chỉ bị dồn vào bốn ngày: « Des journées de dix heures » thì người trẻ chịu được, còn cha mẹ đơn thân hay người lớn tuổi thì khác. Bài không nói tới giảm lương.", 1.5),
      q("Quelle crainte principale exprime-t-il à propos de cette formule ?",
        "Qu'elle accentue l'écart entre catégories de travailleurs.",
        ["Qu'elle fasse disparaître des emplois peu qualifiés.", "Qu'elle pousse peu à peu les cadres à quitter le secteur public."],
        "Ông sợ sẽ « creusera un fossé de plus entre ceux qui peuvent aménager leur temps et ceux qui ne le peuvent pas », và nhóm thiệt là người lương thấp nhất. Ông không nói việc làm sẽ mất đi.", 2),
      q("Pourquoi certains métiers se prêtent-ils mal à ce modèle ?",
        "Parce qu'ils supposent d'être là sans interruption.",
        ["Parce qu'ils sont trop mal rémunérés.", "Parce que les syndicats de ces professions s'y opposent."],
        "Với y tá, tài xế xe buýt hay thu ngân, nghề của họ « exige une présence continue »: phải có mặt liên tục nên khó sắp xếp lại.", 0.5),
      q("Selon Laurent Simon, par quoi une vraie réforme devrait-elle commencer ?",
        "Par une diminution de ce qu'on demande aux salariés.",
        ["Par un accord national sur le nombre de jours travaillés.", "Par des embauches financées par l'État."],
        "Ông cho rằng người ta bàn số ngày trong khi câu hỏi thật là khối lượng công việc: một cải cách đúng nghĩa « commencerait par alléger la charge », rồi mới tính cách chia.", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 2 ─────────────── */
  const CE2 = {
    id: "lo20mv7grn3q03m",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Jeux de société : la revanche de la table</strong>",
      "On les croyait relégués au grenier par les consoles et les téléphones. Il n'en est rien : le marché français du jeu de société a doublé en dix ans, et l'on publie désormais plus d'un millier de nouveautés chaque année. Des bars spécialisés ont ouvert dans la plupart des grandes villes, où l'on vient jouer comme on irait au cinéma.",
      "Julie Lambert, sociologue des loisirs, se méfie des explications toutes faites. « On invoque la nostalgie, mais ceux qui remplissent ces bars ont vingt-cinq ans et n'ont pas connu les parties de leurs grands-parents. Je crois plutôt que le jeu répond à une lassitude : celle de relations qui passent presque toutes par un écran. Autour d'une table, on se regarde, on se coupe la parole, on rit au même instant. C'est banal, et c'est précisément ce qui manque. »",
      "Elle insiste sur un second ressort, plus discret. « Engager la conversation avec des inconnus intimide beaucoup de gens. Or le jeu fournit un cadre : on sait quoi faire, à quel moment, et de quoi parler. Les règles prennent en charge ce que la timidité rend difficile. » D'où le succès des soirées ouvertes, où l'on s'assoit à une table sans connaître personne et où l'on repart, deux heures plus tard, avec le sentiment d'avoir partagé quelque chose.",
      "Encore fallait-il que les jeux eux-mêmes changent. Ceux d'aujourd'hui n'ont plus grand-chose à voir avec les interminables parties d'autrefois, dont on sortait fâché. Les éditeurs ont raccourci les durées, soigné les illustrations, et surtout multiplié les genres : jeux d'enquête, de construction, d'ambiance, chacun finit par trouver chaussure à son pied. Les jeux coopératifs constituent la nouveauté la plus frappante : les participants n'y jouent plus les uns contre les autres, mais ensemble contre le jeu, de sorte qu'on gagne ou qu'on perd collectivement. « Beaucoup de familles y viennent parce qu'elles en ont assez des disputes, observe la sociologue. Mais ces jeux ont leur revers : il arrive qu'un joueur plus sûr de lui décide pour tout le monde. »",
      "Les collectivités ne s'y sont pas trompées : des médiathèques prêtent désormais des jeux comme elles prêtent des livres, et plusieurs mairies financent des ludothèques de quartier, avec l'espoir d'y faire se croiser des générations qui, d'ordinaire, s'ignorent.",
      "Cette abondance a un prix. Sur une table de salon professionnel, un auteur soupire : « Un jeu reste en rayon quelques mois, puis il est chassé par le suivant. Il faudrait en vendre des milliers pour en vivre, et bien peu y parviennent avant de disparaître. » La plupart exercent un autre métier, et certains redoutent qu'à force de produire, la profession ne finisse par lasser le public qu'elle a conquis.",
      "Julie Lambert ne partage pas tout à fait cette inquiétude. « Le jeu n'est qu'un prétexte. Ce qui compte, c'est l'envie de se retrouver dans une même pièce. Tant qu'elle existera, il y aura des joueurs ; si elle venait à s'éteindre, aucune nouveauté n'y changerait rien. »",
    ),
    cau: [
      q("Que constate l'article à propos du marché du jeu de société ?",
        "Il connaît une expansion remarquable.",
        ["Il résiste difficilement à la concurrence des écrans.", "Il se limite désormais à quelques bars spécialisés."],
        "Thị trường « a doublé en dix ans » và mỗi năm ra hơn một nghìn trò mới: tăng trưởng mạnh, trái với dự đoán bị màn hình đẩy lùi.", 1),
      q("Comment Julie Lambert explique-t-elle ce succès ?",
        "Par une fatigue des échanges à distance.",
        ["Par le souvenir des parties jouées en famille autrefois.", "Par le prix modéré des soirées dans les bars."],
        "Bà gạt lý do hoài niệm (người chơi mới hai mươi lăm tuổi) và cho rằng trò chơi đáp lại « une lassitude : celle de relations qui passent presque toutes par un écran ».", 1.5),
      q("Selon elle, en quoi les règles aident-elles les joueurs ?",
        "Elles facilitent le contact entre gens qui ne se connaissent pas.",
        ["Elles obligent chacun à respecter son tour de parole.", "Elles évitent que les timides soient mis à l'écart du groupe."],
        "Bà nói bắt chuyện với người lạ làm nhiều người ngại, còn trò chơi cho sẵn một khuôn: « Les règles prennent en charge ce que la timidité rend difficile ». Ý chính là dễ tiếp xúc với người chưa quen.", 1),
      q("Comment les jeux ont-ils évolué ?",
        "Ils durent moins longtemps et offrent plus de variété.",
        ["Ils sont devenus plus compétitifs et plus complexes.", "Ils reprennent les règles des grands classiques d'autrefois."],
        "Các nhà xuất bản « ont raccourci les durées » và « surtout multiplié les genres ». Bài viết còn đặt chúng đối lập với những ván dài lê thê ngày trước.", 1.5),
      q("Qu'est-ce qui caractérise les jeux coopératifs ?",
        "Tous les joueurs poursuivent un but commun.",
        ["Chaque joueur affronte les autres à tour de rôle.", "Un joueur désigné dirige la partie pour le groupe."],
        "Trong loại này người chơi không đấu nhau mà cùng chống lại trò chơi, « de sorte qu'on gagne ou qu'on perd collectivement ». Chuyện một người quyết thay cả bàn chỉ là mặt trái bà nêu, không phải luật chơi.", 2),
      q("Pourquoi les auteurs peinent-ils à vivre de leurs créations ?",
        "Leurs jeux sont très vite remplacés par d'autres.",
        ["Les éditeurs gardent pour eux l'essentiel des bénéfices.", "Le public se détourne des nouveautés."],
        "Một tác giả nói: « Un jeu reste en rayon quelques mois, puis il est chassé par le suivant ». Thời gian bán quá ngắn nên khó bán đủ để sống.", 0.5),
      q("Pour Julie Lambert, de quoi dépend l'avenir du jeu de société ?",
        "Du désir qu'ont les gens d'être réunis.",
        ["De la capacité des éditeurs à se renouveler.", "De la baisse du nombre de nouveautés."],
        "Bà nói trò chơi chỉ là cái cớ: điều quan trọng là « l'envie de se retrouver dans une même pièce ». Còn nó thì còn người chơi; mất nó thì « aucune nouveauté n'y changerait rien ».", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 3 ─────────────── */
  const TEN = ["Camille", "Hugo", "Martine"];
  const a = ai(TEN);
  const CE3 = {
    id: "lo20mv7grn3r03n",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Faut-il rendre le service civique obligatoire pour tous les jeunes ? »</p>",
    readingText: p(
      "<strong>Camille</strong>",
      "J'ai passé six mois en service civique auprès de personnes âgées isolées, et je n'hésite pas à dire que cette période m'a davantage appris que trois années d'université. Seulement, je l'avais voulue. Rendez la chose obligatoire, et vous verrez arriver dans les associations des jeunes qui traînent les pieds et comptent les jours. Les bénévoles qui les encadrent s'épuiseront à motiver des gens qui n'ont rien demandé, et les personnes aidées en pâtiront les premières. Un engagement contraint n'en est plus un. Si l'on veut davantage de volontaires, qu'on commence par faire connaître le dispositif et par le rémunérer décemment.",
      "<strong>Hugo</strong>",
      "Je suis favorable à l'obligation, et pour une raison simple. Un fils d'ouvrier et une fille d'avocat ne se rencontrent plus nulle part : ni dans le même établissement, ni dans le même quartier, ni sur les mêmes réseaux. Quelques mois passés côte à côte, à accomplir une tâche commune, seraient l'une des rares occasions de se frotter à des gens qui ne nous ressemblent pas. Une société tient par ce genre d'expérience partagée. J'y mets tout de même une réserve de taille : si c'est pour occuper les jeunes à des tâches sans intérêt, mieux vaut s'abstenir. Tout se jouera sur le contenu des missions.",
      "<strong>Martine</strong>",
      "J'enseigne en lycée depuis vingt ans, et je vois des élèves déjà usés par la course aux diplômes. Leur imposer plusieurs mois de plus avant le premier emploi, c'est repousser d'autant leur premier salaire, et tous n'ont pas des parents en mesure de les entretenir pendant ce temps. Ce sont, une fois encore, les familles modestes qui paieraient la note. Et puis, soyons sérieux sur les chiffres : encadrer chaque année une génération entière coûterait plusieurs milliards. Avant de les dépenser ainsi, je préférerais qu'on répare des établissements où il pleut dans les salles de classe.",
    ),
    cau: [
      a("Un service obligatoire permettrait à des jeunes d'origines différentes de se côtoyer.", "Hugo", "Hugo nhận xét con công nhân và con luật sư không còn gặp nhau ở đâu; vài tháng làm chung sẽ là dịp hiếm để « se frotter à des gens qui ne nous ressemblent pas ».", 2),
      a("Imposer l'engagement reviendrait à lui ôter sa valeur.", "Camille", "Camille viết: « Un engagement contraint n'en est plus un ». Bắt buộc thì không còn là dấn thân nữa.", 1.5),
      a("Cette mesure pèserait sur le budget des jeunes les moins favorisés.", "Martine", "Martine nói thêm vài tháng là lùi lại « leur premier salaire », và không phải cha mẹ nào cũng nuôi được con trong thời gian đó: « les familles modestes qui paieraient la note ».", 1),
      a("Tout dépendra de l'intérêt des missions proposées.", "Hugo", "Hugo đặt điều kiện: nếu chỉ giao việc vô bổ thì đừng làm. Câu kết của anh: « Tout se jouera sur le contenu des missions ».", 1.5),
      a("Les fonds publics seraient plus utiles au système scolaire.", "Martine", "Martine nhắc chi phí hàng tỷ và nói bà muốn dùng số tiền đó để sửa những ngôi trường « où il pleut dans les salles de classe ».", 0.5),
      a("J'ai tiré un grand profit de cette expérience.", "Camille", "Camille kể sáu tháng service civique « m'a davantage appris que trois années d'université ».", 0.5),
    ],
  };

  /* ─────────────── NGHE 1 ─────────────── */
  const CO1 = {
    id: "lo20mv7gq4db03i", ten: "b2k-de2-co1", hai: true,
    gioiThieu: "Vous écoutez une émission à la radio.",
    phanTich: { loai: "Interview à la radio", chu_de: "La sobriété numérique", y_chinh: "Un ingénieur explique que l'essentiel de l'impact du numérique vient de la fabrication des appareils : mieux vaut les garder longtemps que supprimer ses courriels, et utiliser le numérique avec mesure plutôt que s'en priver." },
    doan: [
      d("sage", RADIO, "Bonjour à tous. On parle beaucoup de l'avion ou de la voiture, beaucoup moins de nos écrans. Pourtant, le numérique pèserait aujourd'hui près de quatre pour cent des émissions mondiales de gaz à effet de serre, autant que l'aviation civile, et cette part augmente chaque année. Alors, faut-il vider sa boîte mail, renoncer aux séries, garder son vieux téléphone ? Pour faire le tri, nous recevons Thomas Renaud, ingénieur et auteur d'un guide sur la sobriété numérique. Thomas Renaud, bonjour. Par où commencer ?"),
      d("echo", KHACH, "Bonjour. Alors, par où commencer, euh, par savoir d'où vient le problème, parce que là-dessus, il y a un énorme malentendu. Les gens pensent à l'électricité que consomme leur ordinateur, ou aux fameux centres de données. Or, en France, les trois quarts de l'empreinte d'un appareil, c'est sa fabrication. Extraire les métaux, les raffiner, assembler les composants à l'autre bout du monde, tout ça, c'est fait avant même que vous sortiez le téléphone de sa boîte. Autrement dit, le jour où vous l'allumez pour la première fois, le plus gros du mal est déjà fait."),
      d("sage", RADIO, "Donc quand on nous conseille de supprimer nos vieux courriels, ça ne sert à rien ?"),
      d("echo", KHACH, "Ça ne sert, euh, à presque rien, soyons honnêtes. Ce n'est pas nuisible, hein, mais c'est dérisoire. Vous pouvez passer un dimanche à nettoyer dix ans de messages, vous aurez économisé l'équivalent de quelques kilomètres en voiture. Et ce qui m'agace un peu, c'est que ce genre de conseil donne bonne conscience à peu de frais. On a l'impression d'avoir fait sa part, et pendant ce temps on change de téléphone tous les deux ans."),
      d("sage", RADIO, "Alors, quel est le geste qui compte vraiment ?"),
      d("echo", KHACH, "Il n'y en a qu'un, et il est d'une simplicité désarmante : garder ses appareils le plus longtemps possible. Passer de deux à quatre ans pour un téléphone, c'est diviser son impact par deux, tout bêtement. Et quand il faut vraiment remplacer, acheter reconditionné plutôt que neuf. Tout le reste, franchement, c'est secondaire."),
      d("sage", RADIO, "Encore faut-il pouvoir les réparer. L'indice de réparabilité, affiché depuis 2021, a-t-il changé quelque chose ?"),
      d("echo", KHACH, "Oui, et, euh, davantage que je ne l'aurais cru. Pas tellement du côté des acheteurs, d'ailleurs : la plupart ne le regardent pas. Mais du côté des fabricants, ça a eu un effet très net. Personne n'a envie d'afficher un trois sur dix en magasin. Du coup, on a vu réapparaître des batteries qu'on peut changer soi-même, des pièces détachées disponibles plus longtemps, des notices de démontage. La note a fait bouger ceux qui conçoivent les produits, et c'était bien là l'essentiel."),
      d("sage", RADIO, "Et le streaming, qu'on accuse de tous les maux ?"),
      d("echo", KHACH, "Là encore, il faut garder le sens des proportions. Regarder un film en ligne, ce n'est pas un crime. En revanche, le regarder en très haute définition sur un écran de téléphone, là où l'œil ne voit de toute façon pas la différence, c'est du gaspillage pur. Baisser la qualité d'un cran, ça ne change rien au plaisir et ça divise les données par quatre ou cinq."),
      d("sage", RADIO, "Si vous deviez résumer votre message en une phrase ?"),
      d("echo", KHACH, "Je dirais : ni culpabilité ni abstinence. Je ne demande à personne de retourner à la bougie. Le numérique rend des services immenses. Ce que je demande, c'est qu'on s'en serve en connaissance de cause, comme de n'importe quelle ressource qui n'est pas illimitée."),
      d("sage", RADIO, "Thomas Renaud, merci."),
    ],
    cau: [
      q("Que dit le journaliste du poids du numérique dans les émissions mondiales ?",
        "Il est comparable à celui d'un secteur réputé polluant.",
        ["Il a commencé à diminuer nettement ces dernières années.", "Il dépasse désormais celui de la voiture."],
        "Nhà báo nói ngành số chiếm gần bốn phần trăm khí thải toàn cầu, « autant que l'aviation civile », và phần này tăng mỗi năm. Không có so sánh vượt ô tô, cũng không giảm.", 1.5),
      q("D'après Thomas Renaud, d'où vient l'essentiel de l'impact d'un appareil ?",
        "De sa production, avant tout usage.",
        ["De l'électricité qu'il consomme chaque jour.", "Des centres de données qu'il sollicite."],
        "Ông nói ở Pháp, ba phần tư dấu chân của một thiết bị « c'est sa fabrication »: mọi thứ diễn ra trước cả khi ta mở hộp. Điện tiêu thụ và trung tâm dữ liệu là điều người ta lầm tưởng.", 1),
      q("Que reproche-t-il au conseil de supprimer ses vieux courriels ?",
        "De rassurer à bon compte sans rien changer d'important.",
        ["D'augmenter en réalité la consommation électrique des serveurs.", "De faire perdre des informations utiles."],
        "Ông gọi việc này là « dérisoire » và bực vì nó « donne bonne conscience à peu de frais »: người ta tưởng đã góp phần, trong khi vẫn đổi điện thoại hai năm một lần.", 1.5),
      q("Quel geste juge-t-il le plus efficace ?",
        "Conserver ses appareils plus longtemps.",
        ["Acheter systématiquement du matériel neuf plus économe.", "Éteindre ses appareils la nuit."],
        "Theo ông chỉ có một việc đáng kể: « garder ses appareils le plus longtemps possible »; dùng điện thoại bốn năm thay vì hai là giảm một nửa tác động.", 1),
      q("Quel a été le principal effet de l'indice de réparabilité ?",
        "Il a incité les industriels à revoir la conception de leurs produits.",
        ["Il a modifié les habitudes d'achat de la majorité des consommateurs.", "Il a fait baisser le prix des réparations en magasin."],
        "Ông nói phần lớn người mua không nhìn chỉ số này, nhưng với nhà sản xuất thì tác động rõ: « La note a fait bouger ceux qui conçoivent les produits ».", 1.5),
      q("Que pense Thomas Renaud du streaming ?",
        "Le problème tient surtout à une qualité d'image inutilement élevée.",
        ["Il faudrait y renoncer complètement pour les films comme pour les séries.", "Son impact est négligeable, quelle que soit la définition."],
        "Ông nói xem phim trực tuyến không phải tội; thứ lãng phí là xem « en très haute définition sur un écran de téléphone », nơi mắt không thấy khác biệt.", 1.5),
      q("Quel est, en résumé, son message ?",
        "Utiliser le numérique en ayant conscience de ses limites.",
        ["Réduire au strict minimum l'usage quotidien de tous les écrans.", "Attendre que les fabricants règlent le problème."],
        "Ông tóm: « ni culpabilité ni abstinence »; điều ông mong là dùng số « en connaissance de cause », như mọi nguồn lực không vô hạn.", 1),
    ],
  };

  /* ─────────────── NGHE 2 ─────────────── */
  const CO2 = {
    id: "lo20mv7gqqxf03j", ten: "b2k-de2-co2", hai: true,
    gioiThieu: "Vous écoutez une émission à la radio.",
    phanTich: { loai: "Reportage radio", chu_de: "Le quotidien d'une gardienne de refuge de montagne", y_chinh: "Marion décrit un métier fait de conseils de sécurité, de logistique et de gestion de l'eau, bouleversé par le réchauffement, mais où tous les visiteurs se retrouvent à égalité." },
    doan: [
      d("nova", PHONG, "Deux mille quatre cents mètres d'altitude, dans le massif des Écrins. Il faut quatre heures de marche pour atteindre ce refuge, que Marion garde depuis neuf étés. Soixante couchages, pas de route, pas de réseau, et une vue à couper le souffle. Marion, on imagine un métier contemplatif. C'est le cas ?"),
      d("shimmer", NGUOI, "Alors, euh, contemplatif, pas vraiment, non. On se lève à quatre heures et demie pour les départs en course, on se couche à vingt-trois heures. Et entre les deux, ce qui me prend le plus de temps, ce n'est pas la cuisine, comme on le croit : c'est de parler aux gens. Tous ceux qui arrivent me demandent si tel col est praticable, si l'orage va tenir, s'il reste de la neige. Je passe mes après-midi à ça, et honnêtement, c'est la partie la plus importante du travail, parce qu'une mauvaise réponse, là-haut, ça peut coûter très cher."),
      d("nova", PHONG, "Les randonneurs arrivent bien préparés ?"),
      d("shimmer", NGUOI, "De moins en moins, malheureusement. Depuis quelques années, on voit monter des gens en baskets, sans veste, avec une demi-bouteille d'eau, parce qu'ils ont vu une photo sur les réseaux. Ils ne se rendent pas compte qu'à cette altitude, il peut neiger en août. Alors on prête des couvertures, on déconseille, on fait redescendre. Il m'est arrivé de refuser de laisser repartir quelqu'un, ce qui n'est jamais agréable."),
      d("nova", PHONG, "Soixante repas par soir, sans route. Comment fait-on ?"),
      d("shimmer", NGUOI, "On calcule, tout le temps. Tout ce qu'on mange ici arrive par hélicoptère, trois rotations par saison, pas une de plus, et chaque rotation coûte une fortune. Donc si je commande trop, je jette, et si je ne commande pas assez, je ne peux pas descendre au supermarché. Je sais au gramme près combien de pâtes mange un alpiniste. Et pour les déchets, c'est la même logique à l'envers : chacun redescend ses emballages dans son sac. Au début, certains protestaient ; maintenant, c'est entré dans les mœurs."),
      d("nova", PHONG, "Le réchauffement, vous le voyez depuis votre porte ?"),
      d("shimmer", NGUOI, "Je le vois, oui, et, euh, plus vite que je ne l'aurais imaginé. Le glacier en face a reculé de plusieurs centaines de mètres depuis que je suis là. Mais ce qui nous touche le plus directement, c'est l'eau. Le refuge est alimenté par la fonte d'un névé, et ce névé disparaît de plus en plus tôt. L'été dernier, à la mi-août, on n'avait plus une goutte. On a dû fermer trois semaines avant la date prévue. Pour un refuge qui fait son année sur dix semaines, c'est une catastrophe."),
      d("nova", PHONG, "Qu'est-ce qui vous fait revenir, malgré tout ?"),
      d("shimmer", NGUOI, "C'est difficile à expliquer. Ici, il n'y a pas de chambre individuelle, pas de menu à la carte. Le chirurgien et l'étudiant dorment dans le même dortoir, mangent la même soupe, et personne ne sait qui est qui. Les gens se parlent comme ils ne le feraient jamais en bas. Cette espèce d'égalité, je ne l'ai trouvée nulle part ailleurs."),
      d("nova", PHONG, "Et pour les années qui viennent ?"),
      d("shimmer", NGUOI, "Avec le parc national, on voudrait accueillir des classes en début de saison, des collégiens qui n'ont jamais dormi en montagne. S'ils comprennent d'où vient l'eau qu'ils boivent ici, on n'aura pas perdu notre temps."),
    ],
    cau: [
      q("Qu'est-ce qui occupe une grande partie des journées de Marion ?",
        "Renseigner les randonneurs pour qu'ils ne prennent pas de risques.",
        ["Préparer les repas pour soixante personnes.", "Entretenir les sentiers autour du refuge."],
        "Marion nói thứ chiếm nhiều thời gian nhất không phải nấu ăn mà là « parler aux gens »: ai tới cũng hỏi đèo có đi được không, giông có kéo dài không. Trả lời sai thì trên đó trả giá đắt.", 1.5),
      q("Que constate-t-elle chez de nombreux randonneurs ?",
        "Ils montent sans le matériel nécessaire.",
        ["Ils refusent d'écouter ses conseils.", "Ils viennent surtout pour prendre des photos."],
        "Chị thấy người ta lên núi « en baskets, sans veste, avec une demi-bouteille d'eau », không biết ở độ cao này tháng Tám vẫn có thể có tuyết: thiếu trang bị.", 1),
      q("Pourquoi doit-elle calculer ses commandes avec précision ?",
        "Parce que les livraisons sont peu fréquentes et très chères.",
        ["Parce que le refuge n'a pas de quoi conserver les aliments.", "Parce que le parc national limite les quantités autorisées."],
        "Mọi thứ đến bằng trực thăng, « trois rotations par saison, pas une de plus », và mỗi chuyến tốn rất nhiều tiền. Đặt thừa thì bỏ, đặt thiếu thì không có cách bù.", 2),
      q("Que deviennent les emballages des randonneurs ?",
        "Chacun les remporte avec soi.",
        ["Ils sont brûlés sur place en fin de saison.", "Ils sont évacués par hélicoptère."],
        "Chị nói: « chacun redescend ses emballages dans son sac », và nay việc đó đã thành nếp.", 1.5),
      q("Quel effet du réchauffement a le plus touché le refuge ?",
        "Une pénurie d'eau l'a obligé à fermer plus tôt.",
        ["Le recul du glacier a rendu l'accès au refuge dangereux.", "Les orages ont détruit une partie du bâtiment."],
        "Nhà trú lấy nước từ băng tuyết tan; hè trước giữa tháng Tám « on n'avait plus une goutte » và họ phải đóng cửa sớm ba tuần. Sông băng lùi có được nhắc, nhưng điều ảnh hưởng trực tiếp nhất là nước.", 1.5),
      q("Qu'est-ce que Marion apprécie le plus dans la vie au refuge ?",
        "Le fait que tous y soient traités de la même façon.",
        ["Le calme et la solitude qu'offre la haute montagne.", "La beauté du paysage depuis sa porte."],
        "Chị kể bác sĩ phẫu thuật và sinh viên ngủ chung phòng, ăn cùng nồi súp: « Cette espèce d'égalité, je ne l'ai trouvée nulle part ailleurs ».", 0.5),
      q("Quel projet envisage-t-elle ?",
        "Faire venir des élèves au refuge.",
        ["Ouvrir le refuge pendant l'hiver.", "Agrandir le dortoir avec l'aide du parc."],
        "Cùng với vườn quốc gia, chị muốn « accueillir des classes en début de saison », những học sinh chưa từng ngủ trên núi.", 1),
    ],
  };

  /* ─────────────── NGHE 3 ─────────────── */
  const CO3 = {
    id: "lo20mv7grn3q03k", ten: "b2k-de2-co3", hai: false,
    phanTich: { loai: "Trois courts documents radio", chu_de: "Jeux d'évasion en classe, prime au covoiturage, transmission d'un savoir-faire", y_chinh: "Trois chroniques brèves : des cours d'histoire transformés en jeux d'évasion, une prime locale pour le covoiturage, une céramiste qui forme des apprentis." },
    docs: [
      { doan: [d("alloy", TIN, "Et si l'on révisait la Révolution française en cherchant à ouvrir un cadenas ? Dans une vingtaine de collèges de l'académie de Lille, des professeurs d'histoire ont transformé certaines séances en jeux d'évasion : pour sortir de la salle, les élèves doivent résoudre une série d'énigmes à partir de documents d'époque. Les enseignants dressent un premier bilan plutôt flatteur. Ce ne sont pas les bons élèves qui en tirent le plus grand profit, mais ceux qui d'ordinaire restent en retrait : ils se révèlent souvent les plus ingénieux, et prennent la parole comme jamais. Reste un revers que personne ne cache : concevoir une seule séance exige une quinzaine d'heures de préparation, prises sur le temps personnel. Aucun professeur n'envisage donc d'en faire sa méthode habituelle.")],
        cau: [
          q("Selon les enseignants, quels élèves bénéficient le plus de ces séances ?",
            "Ceux qui sont habituellement en retrait.",
            ["Ceux qui obtiennent déjà les meilleurs résultats.", "Ceux qui connaissent bien les jeux vidéo."],
            "Bản tin nói người được lợi nhất không phải học sinh giỏi mà là những em « qui d'ordinaire restent en retrait »: các em tỏ ra khéo nhất và phát biểu nhiều chưa từng thấy.", 2),
          q("Quelle limite le document signale-t-il ?",
            "La préparation demande énormément de temps.",
            ["Le matériel nécessaire coûte cher aux établissements.", "Les élèves retiennent moins bien le cours."],
            "Mặt trái là soạn một buổi cần « une quinzaine d'heures de préparation », lấy từ thời gian riêng, nên không thầy cô nào coi đây là cách dạy thường ngày.", 1),
        ] },
      { doan: [d("nova", TIN, "Dans l'agglomération de Nantes, près de sept salariés sur dix se rendent seuls au travail en voiture. Pour changer cette habitude, la collectivité verse depuis septembre une prime aux conducteurs qui acceptent de partager leur véhicule : deux euros par trajet et par passager, la course étant gratuite pour celui qui monte à bord. Tout passe par une application, qui vérifie que le trajet a bien eu lieu. En trois mois, le nombre de covoiturages quotidiens a triplé. Les élus se gardent pourtant de crier victoire. L'opération, financée sur le budget des transports, est prévue pour un an seulement : il s'agit de savoir si l'habitude survivra une fois la prime supprimée. Les premières expériences menées ailleurs incitent à la prudence, puisque la moitié des conducteurs y avaient renoncé dès la fin de l'aide.")],
        cau: [
          q("Quel est le but de cette prime ?",
            "Inciter les salariés à faire le trajet à plusieurs.",
            ["Aider les salariés à acheter une voiture moins polluante.", "Financer de nouvelles lignes de transport en commun."],
            "Chính quyền trả tiền cho tài xế « qui acceptent de partager leur véhicule », để đổi thói quen bảy trên mười người đi làm một mình bằng ô tô.", 1.5),
          q("Que précise le document sur la durée de la mesure ?",
            "Elle est limitée dans le temps.",
            ["Elle sera maintenue tant que les résultats seront bons.", "Elle a déjà été prolongée de trois mois."],
            "Bản tin nói chương trình « est prévue pour un an seulement »; câu hỏi là thói quen có còn sau khi hết tiền thưởng hay không.", 1),
        ] },
      { doan: [d("echo", TIN, "Céramiste installée en Bourgogne depuis trente ans, Léa Morel a longtemps travaillé seule, par goût autant que par nécessité. Elle accueille désormais deux apprentis chaque année dans son atelier. Ce qui l'a fait changer d'avis, c'est la fermeture, coup sur coup, de trois ateliers voisins, dont les propriétaires sont partis à la retraite sans personne pour leur succéder. Avec eux ont disparu des techniques d'émaillage qu'aucun manuel ne décrit, et qui ne se transmettent que de la main à la main. Former des jeunes lui coûte du temps et ralentit sa production, elle ne s'en cache pas. Mais elle estime ne plus avoir le choix. Elle travaille d'ailleurs à un livre, illustré de ses propres croquis, où elle consigne les gestes qu'elle a mis une vie à maîtriser.")],
        cau: [
          q("Pourquoi Léa Morel s'est-elle mise à former des apprentis ?",
            "Pour que des techniques ne se perdent pas.",
            ["Pour augmenter la production de son atelier.", "Pour préparer la vente de son atelier."],
            "Ba xưởng bên cạnh đóng cửa mà không ai kế nghiệp, và cùng với họ « ont disparu des techniques d'émaillage qu'aucun manuel ne décrit ». Bà còn nói việc đào tạo làm chậm sản xuất, nên không phải để tăng sản lượng.", 1),
          q("À quoi travaille-t-elle par ailleurs ?",
            "À la rédaction d'un ouvrage.",
            ["À l'ouverture d'une école.", "À une exposition de croquis."],
            "Bà đang viết « un livre, illustré de ses propres croquis », ghi lại những thao tác bà mất cả đời để thành thạo.", 0.5),
        ] },
    ],
  };

  return { ten: "DELF B2 · Đề 2", CE: [CE1, CE2, CE3], CO: [CO1, CO2, CO3] };
}
