/* Lô 55 (17/11/2026): NỘI DUNG « DELF B1 · Đề 4 » NÂNG ĐỘ KHÓ. Giữ chủ đề và khung câu của lô 22,
 * viết lại văn bản, kịch bản và câu hỏi: kịch bản nghe dài gấp đôi, có ba người nói và ngập ngừng;
 * thông báo dài hơn, câu hỏi phải ghép nhiều điều kiện; bài báo khoảng 470 từ, câu hỏi về ý và lập luận.
 * Bài báo (Đọc 2) soạn TỪ NGUỒN THẬT: giữ nguyên mọi dữ kiện, ngày tháng và dòng ghi nguồn của bản cũ,
 * KHÔNG thêm dữ kiện mới; phần dài thêm chỉ là lập luận nêu chung. Không dùng dấu gạch dài (quy tắc 7). */

export function noiDung({ q, v, p, d, bang }) {
  const RADIO = "Parle en français de France comme une journaliste de radio locale : débit naturel, vivant, sans ralentir pour des apprenants.";
  const PROF = "Parle en français de France comme une enseignante interviewée à la radio : débit naturel, spontané, avec de petites hésitations.";
  const ADO = "Parle en français de France comme un collégien de 13 ans un peu intimidé au micro : débit rapide, familier, quelques hésitations.";
  const SEC = "Parle en français de France comme une secrétaire qui enregistre un message pour les familles : débit naturel, assez rapide, ton professionnel.";
  const nguon = (...ds) => `<p><small><em>Texte rédigé par FRACILE à partir de : ${ds.join(" ; ")}.</em></small></p>`;

  const CO1 = {
    id: "lo22mvemx6ox023",
    gioiThieu: "Vous écoutez une émission de radio locale.",
    doan: [
      d("sage", RADIO, "Dans notre rubrique « Vie de quartier », direction le collège Jean-Moulin, où une classe de quatrième sort tout juste d'une expérience un peu particulière : sept jours sans réseaux sociaux. Madame Perrin, vous êtes leur professeure principale. Alors, c'est vous qui avez imposé ça à vos élèves ?"),
      d("shimmer", PROF, "Ah non, pas du tout, et c'est justement ce qui est intéressant ! L'idée est venue d'eux. En début d'année, on a fait un petit questionnaire sur le sommeil, et ils ont été, euh, assez choqués par leurs propres réponses : la moitié de la classe s'endormait après minuit en semaine. Alors un élève a lancé : « Et si on essayait de tout couper ? » Moi, j'étais un peu sceptique, je l'avoue. J'avais peur que ça tourne à la punition collective."),
      d("sage", RADIO, "Et comment vous avez organisé les choses, concrètement ?"),
      d("shimmer", PROF, "On a rédigé ensemble une sorte de contrat. Pas d'applications après le dîner, mais on a gardé une exception : les messages avec la famille, parce que certains parents travaillent tard et ont besoin de joindre leurs enfants. Et surtout, on ne voulait pas seulement enlever quelque chose, il fallait proposer autre chose à la place. Donc, avec deux collègues, on a monté des activités après les cours : un tournoi de jeux de société, un atelier cuisine, du basket."),
      d("sage", RADIO, "Lucas, tu fais partie de la classe. Honnêtement, c'était dur ?"),
      d("echo", ADO, "Les deux premiers jours, oui, franchement. Je regardais mon téléphone toutes les cinq minutes, même éteint, c'est bête. J'avais l'impression que tout le monde parlait de trucs sans moi. Et puis, vers le mercredi, bon, j'ai arrêté d'y penser. Le plus bizarre, c'est que le soir je m'ennuyais, alors j'ai ressorti des bandes dessinées que je n'avais pas ouvertes depuis des années."),
      d("sage", RADIO, "Et ça a marché pour tout le monde ?"),
      d("shimmer", PROF, "Non, et je tiens à le dire. Trois élèves ont craqué avant la fin. Mais ils sont venus me le dire eux-mêmes, sans qu'on leur demande rien, et ça, pour moi, c'est presque plus important que le reste. Ce qui m'a frappée, c'est que beaucoup disent avoir mieux dormi, oui, mais surtout qu'ils se sont davantage parlé pendant les récréations. Maintenant, ils veulent présenter tout ça aux parents à la réunion de décembre. Et à mon avis, ce sont peut-être les parents qui vont avoir le plus de mal à suivre l'exemple !"),
    ],
    cau: [
      q("D'après la professeure, l'idée de l'expérience…", "vient des élèves eux-mêmes.", ["a été imposée par la direction.", "était une punition pour une classe agitée."], "Cô Perrin nói rõ: « L'idée est venue d'eux ». Cô còn sợ nó thành hình phạt, nên « punition » là bẫy."),
      q("Qu'est-ce qui a poussé les élèves à tenter l'expérience ?", "Ils ont découvert qu'ils dormaient trop peu.", ["Leurs notes avaient beaucoup baissé.", "Leurs parents se plaignaient d'eux."], "Bảng hỏi về giấc ngủ cho thấy « la moitié de la classe s'endormait après minuit en semaine », tức là ngủ quá ít."),
      q("Au départ, quelle était l'attitude de la professeure ?", "Elle doutait du projet.", ["Elle était très enthousiaste.", "Elle a d'abord refusé le projet."], "« j'étais un peu sceptique, je l'avoue ». Sceptique là nghi ngờ, chứ không từ chối."),
      q("Pourquoi les messages avec la famille étaient-ils autorisés ?", "Certains parents doivent joindre leurs enfants le soir.", ["Les élèves refusaient de signer le contrat sans cette exception.", "Le collège n'a pas le droit d'interdire ce contact."], "« certains parents travaillent tard et ont besoin de joindre leurs enfants »."),
      q("Comment Lucas a-t-il vécu le début de la semaine ?", "Il se sentait exclu des conversations.", ["Il a lu beaucoup de bandes dessinées.", "Il a oublié son téléphone sans difficulté."], "« J'avais l'impression que tout le monde parlait de trucs sans moi ». Truyện tranh là chuyện sau thứ Tư, không phải lúc đầu."),
      q("À propos des trois élèves qui ont abandonné, qu'est-ce qui compte pour la professeure ?", "Ils l'ont reconnu d'eux-mêmes.", ["Ils ont promis de recommencer.", "Ils ont été sanctionnés par l'équipe."], "« ils sont venus me le dire eux-mêmes, sans qu'on leur demande rien, et ça, pour moi, c'est presque plus important que le reste »."),
      q("Que pense la professeure des parents ?", "Ils risquent d'avoir du mal à se passer d'écrans.", ["Ils refuseront de venir à la réunion.", "Ils ont déjà adopté les mêmes règles."], "« ce sont peut-être les parents qui vont avoir le plus de mal à suivre l'exemple »."),
    ],
    phanTich: { loai: "Reportage radio avec interview", chu_de: "Une semaine sans réseaux sociaux dans un collège", y_chinh: "Une classe de quatrième a choisi elle-même de couper les réseaux sociaux le soir pendant une semaine. La professeure et un élève racontent les difficultés du début, les activités proposées et un bilan nuancé : meilleur sommeil, plus d'échanges, mais trois abandons assumés." },
  };

  const CO2 = {
    id: "lo22mvemxfqi024",
    gioiThieu: "Vous êtes parent d'élève. Vous écoutez un message du lycée.",
    doan: [
      d("coral", SEC, "Bonjour, ici le secrétariat du lycée Victor-Hugo, avec un message destiné à toutes les familles. Comme vous le savez sans doute, depuis la rentrée, l'interdiction du téléphone portable, qui existait déjà au collège, s'applique aussi au lycée. Nous avons reçu beaucoup de questions, alors voici quelques précisions. Le téléphone doit rester éteint, et non pas simplement en mode silencieux, au fond du sac, de l'arrivée jusqu'à la sortie, y compris pendant la pause de midi. Seule exception : un professeur peut autoriser son utilisation en classe pour une activité précise, par exemple une recherche ou un enregistrement. Un élève surpris avec son téléphone devra le déposer au bureau de la vie scolaire, et ce sont les parents, et eux seuls, qui pourront venir le récupérer en fin de journée. Si vous devez joindre votre enfant en urgence, ne lui envoyez pas de message : appelez directement le secrétariat, qui transmettra. Enfin, pour répondre à vos questions, une réunion aura lieu non pas mercredi, comme annoncé par erreur sur le site, mais jeudi à dix-huit heures, en salle polyvalente. Merci de votre attention et bonne journée."),
    ],
    cau: [
      q("Pendant la pause de midi, le téléphone…", "doit rester éteint dans le sac.", ["peut être utilisé en mode silencieux.", "peut servir dans la cour du lycée."], "Điện thoại phải tắt hẳn, « et non pas simplement en mode silencieux », và « y compris pendant la pause de midi »."),
      q("Dans quel cas un élève peut-il se servir de son téléphone ?", "Pour une activité demandée en classe.", ["Pour appeler ses parents à midi.", "Pendant les heures sans cours."], "« un professeur peut autoriser son utilisation en classe pour une activité précise »."),
      q("Que se passe-t-il si un élève est surpris avec son téléphone ?", "Un parent doit venir chercher l'appareil.", ["L'élève le reprend lui-même le soir.", "Le téléphone est confisqué une semaine."], "« ce sont les parents, et eux seuls, qui pourront venir le récupérer en fin de journée »."),
      q("Pour joindre leur enfant en urgence, les parents doivent…", "téléphoner au secrétariat.", ["lui envoyer un message court.", "prévenir son professeur principal."], "« ne lui envoyez pas de message : appelez directement le secrétariat »."),
      q("Quelle information du site Internet était fausse ?", "le jour de la réunion", ["l'heure de la réunion", "la salle de la réunion"], "Cuộc họp diễn ra « non pas mercredi, comme annoncé par erreur sur le site, mais jeudi »."),
    ],
    phanTich: { loai: "Message enregistré", chu_de: "L'interdiction du portable au lycée", y_chinh: "Le lycée précise les règles : téléphone éteint toute la journée, usage seulement si un professeur le demande, récupération par les parents en cas de confiscation, contact d'urgence par le secrétariat, et correction de la date de la réunion." },
  };

  const CE1 = {
    id: "lo22mvemxfqi025",
    consigne: p("Votre neveu de 14 ans vient passer les vacances de printemps chez vous et vous lui cherchez une activité. Vous choisissez en fonction des critères suivants :", "• adaptée à son âge ;<br>• activité en groupe ;<br>• pendant la journée, en semaine ;<br>• gratuite.", "Vous comparez ces quatre annonces. Pour chaque annonce, cochez (☒) OUI si cela correspond au critère ou NON si cela ne correspond pas."),
    readingText: "",
    cau: [
      bang("Pour chaque annonce, cochez OUI ou NON.", [
        { titre: "Stage de robotique", texte: p("Pendant les vacances de printemps, le club Les Bricodeurs propose un stage de cinq matinées, du lundi au vendredi, de 9 h à 12 h. Les participants, âgés de 12 à 16 ans, travaillent par équipes de trois : ensemble, ils construisent un petit robot puis apprennent à le programmer pour qu'il suive une ligne ou évite des obstacles. Aucune connaissance en informatique n'est nécessaire. Le stage coûte 80 €, matériel compris ; une réduction est accordée à partir du deuxième enfant inscrit. Le vendredi midi, les familles sont invitées à venir voir les robots en action.") },
        { titre: "Atelier photo au smartphone", texte: p("Deux samedis matin pour apprendre à faire de belles photos avec son téléphone : cadrage, lumière, retouche et partage responsable sur les réseaux sociaux. Grâce au soutien de la mairie, l'atelier ne coûte rien aux familles. Il est toutefois réservé aux lycéens de 15 à 18 ans, car certains sujets abordés, comme le droit à l'image, demandent un peu de maturité. Ici, pas de travail collectif : chaque jeune mène son propre projet et bénéficie des conseils individuels d'un photographe professionnel. Les plus belles images seront exposées dans le hall de la mairie en juin.") },
        { titre: "Sortie nature", texte: p("Chaque mercredi des vacances, la maison de la nature emmène les 10-15 ans à la découverte de la forêt voisine. Départ à 9 h, retour à 17 h. Les jeunes partent à douze, accompagnés de deux animateurs diplômés : au programme, observation des oiseaux, construction de cabanes et course d'orientation avec carte et boussole. La sortie est entièrement prise en charge par le département, les familles n'ont rien à payer. Il suffit d'apporter un pique-nique, une gourde et de bonnes chaussures. En cas d'orage, la journée se déroule dans les locaux de la maison de la nature.") },
        { titre: "Tournois de jeux vidéo", texte: p("Le cybercafé Le Pixel organise des tournois de jeux vidéo en équipe le vendredi et le samedi soir, de 19 h à 23 h, sur grand écran. Chaque équipe de quatre joueurs affronte les autres dans une ambiance festive, avec un animateur qui commente les parties. Pour des raisons de sécurité et à cause des horaires tardifs, les tournois sont ouverts uniquement aux joueurs de 16 ans et plus, sur présentation d'une pièce d'identité. L'entrée coûte 5 € par soirée, boissons non alcoolisées comprises. Les meilleures équipes du mois remportent des bons d'achat.") },
      ], ["Âge", "Groupe", "Horaires", "Prix"], ["OOON", "NNNO", "OOOO", "NONN"],
      "Stage de robotique: « âgés de 12 à 16 ans » (OUI), « travaillent par équipes de trois » (OUI), « du lundi au vendredi, de 9 h à 12 h » (OUI), « Le stage coûte 80 € » (NON). Atelier photo au smartphone: « réservé aux lycéens de 15 à 18 ans » (NON), « chaque jeune mène son propre projet » (NON), « Deux samedis matin » (NON), « l'atelier ne coûte rien aux familles » (OUI). Sortie nature: « les 10-15 ans » (OUI), « Les jeunes partent à douze » (OUI), « Chaque mercredi des vacances » (OUI), « les familles n'ont rien à payer » (OUI). Tournois de jeux vidéo: « joueurs de 16 ans et plus » (NON), « Chaque équipe de quatre joueurs » (OUI), « le vendredi et le samedi soir » (NON), « L'entrée coûte 5 € par soirée » (NON)."),
    ],
  };

  const CE2 = {
    id: "lo22mvemxfqj026",
    consigne: "<p>Lisez l'article puis répondez aux questions.</p>",
    readingText: p(
      "<strong>Réseaux sociaux avant 15 ans : une interdiction votée… puis bloquée</strong>",
      "Le 21 juillet 2026, au terme de plusieurs mois de débats souvent tendus, les députés et les sénateurs ont adopté une loi que de nombreux parents attendaient avec impatience. À partir du 1er septembre, les jeunes de moins de 15 ans ne pourraient plus créer de compte sur les réseaux sociaux, et les comptes déjà ouverts devaient être supprimés avant le 1er janvier 2027. La France devenait ainsi le premier pays de l'Union européenne à voter une telle interdiction générale, une décision présentée par ses défenseurs comme un signal fort envoyé aux plateformes.",
      "Pourtant, la mesure n'est jamais entrée en vigueur. Saisi par des députés, le Conseil constitutionnel l'a censurée le 14 août. Contrairement à ce que certains ont cru comprendre, les juges n'ont pas contesté l'objectif de protéger les adolescents. Ce qu'ils ont reproché au texte, c'est d'aller trop loin. D'abord, il pouvait concerner des services sans danger prouvé pour les jeunes. Ensuite, il limitait la liberté d'expression. Enfin, il obligeait à vérifier l'âge de tous les utilisateurs, adultes compris, sans préciser comment leurs données personnelles seraient protégées.",
      "Ce dernier point est loin d'être un détail. Pour prouver qu'il a plus de 15 ans, un utilisateur doit bien fournir une information sur son identité, et il faut donc qu'un organisme la conserve, au moins pour un temps. Autrement dit, pour protéger une partie de la population, on risquait de demander à tout le monde de se faire contrôler.",
      "Une autre partie de la loi, en revanche, a survécu à la décision des juges. Depuis la rentrée 2026, l'interdiction du téléphone portable, qui existait déjà à l'école et au collège, s'applique aussi au lycée. Chaque établissement fixe les règles précises dans son règlement intérieur, ce qui peut expliquer des différences d'un lycée à l'autre.",
      "Le débat est donc loin d'être clos. Le gouvernement doit présenter un nouveau projet avant le printemps 2027, en tenant compte cette fois des objections du Conseil constitutionnel. De son côté, la Commission européenne prépare un outil commun de vérification de l'âge, sur lequel travaillent sept pays, dont la France. Une solution européenne aurait au moins un avantage : les plateformes ne pourraient plus invoquer la diversité des règles nationales pour ne rien changer. Reste une question, qui est au cœur de toutes les discussions : comment protéger les plus jeunes sans surveiller tout le monde ?",
      nguon("Toute l'Europe, « Les députés et sénateurs français approuvent l'interdiction de l'accès aux réseaux sociaux pour les moins de 15 ans », 21 juillet 2026 (touteleurope.eu)", "Toute l'Europe, « Pourquoi l'interdiction des réseaux sociaux aux moins de 15 ans reste un casse-tête en France et en Europe », mis à jour le 17 septembre 2026 (touteleurope.eu)"),
    ),
    cau: [
      q("Selon l'article, la loi adoptée en juillet 2026…", "visait aussi les comptes déjà existants.", ["ne concernait que les nouveaux téléphones.", "devait s'appliquer dès le 21 juillet."], "Luật không chỉ cấm tạo tài khoản mới: « les comptes déjà ouverts devaient être supprimés avant le 1er janvier 2027 »."),
      v("Avec cette loi, la France était le premier pays de l'Union européenne à voter une interdiction générale de ce type.", true, "La France devenait ainsi le premier pays de l'Union européenne à voter une telle interdiction générale"),
      q("Pourquoi le Conseil constitutionnel a-t-il censuré la mesure ?", "Il l'a jugée excessive.", ["Il contestait l'idée même de protéger les adolescents.", "Il voulait seulement en retarder l'application."], "« Ce qu'ils ont reproché au texte, c'est d'aller trop loin ». Bài nói rõ các thẩm phán « n'ont pas contesté l'objectif de protéger les adolescents »."),
      v("Le texte prévoyait de vérifier l'âge des seuls utilisateurs mineurs.", false, "il obligeait à vérifier l'âge de tous les utilisateurs, adultes compris"),
      q("D'après le troisième paragraphe, vérifier l'âge pose problème parce que…", "cela oblige à garder des données sur l'identité.", ["les adolescents mentent souvent sur leur âge.", "les plateformes refusent de payer ce contrôle."], "« un utilisateur doit bien fournir une information sur son identité, et il faut donc qu'un organisme la conserve »."),
      q("Que dit l'article de l'interdiction du portable au lycée ?", "Ses règles varient selon l'établissement.", ["Elle a été annulée par les juges.", "Elle remplace celle qui existait au collège."], "« Chaque établissement fixe les règles précises dans son règlement intérieur ». Phần này « a survécu à la décision des juges », nên không bị huỷ."),
      q("Quel serait l'intérêt d'un outil européen de vérification de l'âge ?", "Les plateformes perdraient une excuse pour ne rien faire.", ["Il coûterait moins cher que les outils de chaque pays.", "Il permettrait d'interdire les réseaux sociaux dans toute l'Europe."], "« les plateformes ne pourraient plus invoquer la diversité des règles nationales pour ne rien changer »."),
      q("Quelle difficulté l'article met-il en avant à la fin ?", "concilier protection des mineurs et vie privée", ["trouver de l'argent pour financer la loi", "convaincre les parents de l'utilité de la mesure"], "Câu kết: « comment protéger les plus jeunes sans surveiller tout le monde ? »."),
    ],
  };

  return { CO: [CO1, CO2], CE: [CE1, CE2] };
}
