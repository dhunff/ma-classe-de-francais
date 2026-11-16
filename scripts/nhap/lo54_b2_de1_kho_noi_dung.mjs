/* Lô 54 (17/11/2026): NỘI DUNG « DELF B2 · Đề 1 » NÂNG ĐỘ KHÓ (chủ dự án: « câu còn ngắn và đơn giản,
 * không có từ khó; tốc độ nói và file nghe còn dễ »). Giữ chủ đề, số câu và thang điểm của đề cũ
 * (lô 20), viết lại toàn bộ văn bản, kịch bản và câu hỏi:
 *   · Đọc: bài báo 500 đến 600 từ (trước khoảng 310), từ vựng báo chí, nhượng bộ, hàm ý;
 *   · Nghe: kịch bản dài gần gấp đôi, có ngập ngừng và nói lại như lời nói thật;
 *   · Câu hỏi hỏi Ý (hàm ý, thái độ, lập luận), phương án là câu diễn đạt lại chứ không chép chữ.
 * Mọi nội dung do FRACILE soạn; số liệu trong bài là hư cấu cho mục đích luyện thi.
 * Không dùng dấu gạch dài (quy tắc 7). Lời giải trích nguyên văn trong « ». */

export function noiDung({ q, ai, p, d }) {
  const RADIO = "Parle en français de France comme une journaliste de radio en direct : débit rapide et naturel, enchaîne sans marquer de pause entre les phrases.";
  const KHACH = "Parle en français de France comme une invitée interviewée en direct à la radio : débit rapide, spontané, avec de vraies hésitations, sans articuler de façon scolaire.";
  const PHONG = "Parle en français de France comme un reporter de radio sur le terrain : débit soutenu, ton vivant.";
  const NGUOI = "Parle en français de France comme une personne interrogée dans la rue : débit rapide et familier, phrases qui s'enchaînent, quelques hésitations.";
  const TIN = "Parle en français de France comme une chronique radio : débit rapide et dense, sans pause.";

  /* ─────────────── ĐỌC 1 ─────────────── */
  const CE1 = {
    id: "lo20mv7gpfq803f",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Vols courts : une interdiction plus symbolique qu'efficace ?</strong>",
      "Présentée lors de son adoption comme l'une des mesures phares de la loi Climat, l'interdiction des vols intérieurs lorsqu'une alternative ferroviaire existe en moins de deux heures trente devait incarner la volonté française de réduire l'empreinte carbone des transports. Trois ans plus tard, le bilan apparaît pour le moins contrasté. Le décret d'application, vidé d'une partie de sa substance par une série de dérogations, ne concerne en définitive que trois liaisons, toutes au départ de l'aéroport d'Orly. Les vols en correspondance, qui représentent l'essentiel du trafic sur ces axes, échappent quant à eux au dispositif.",
      "Sur le quai de la gare de Bordeaux, Hélène Garnier, consultante, hausse les épaules. « J'avais renoncé à l'avion bien avant que la loi ne s'en mêle : porte à porte, le train me fait gagner du temps, et je peux y travailler. » Elle n'en dresse pas pour autant un tableau idyllique. « Aux heures de pointe, le prix d'un aller simple frôle l'indécence. Quand l'entreprise règle la note, on n'y prête guère attention ; pour un étudiant ou une famille, c'est une autre affaire. »",
      "C'est précisément ce que dénoncent plusieurs associations d'usagers. En supprimant la concurrence aérienne sans encadrer les tarifs ferroviaires, les pouvoirs publics auraient, selon elles, offert à l'opérateur historique une rente de situation dont les voyageurs les plus modestes font les frais. Certains se rabattent sur l'autocar, d'autres, plus nombreux qu'on ne le croit, reprennent tout simplement leur voiture, ce qui revient à annuler le bénéfice attendu.",
      "Paul Lemaire, économiste des transports, invite toutefois à ne pas se tromper de procès. « Les lignes supprimées pesaient moins de 3 % des émissions du transport aérien intérieur. Personne de sérieux n'attendait de cette mesure qu'elle infléchisse la courbe à elle seule. » À ses yeux, l'essentiel se joue ailleurs : « Pour la première fois, un État a posé que prendre l'avion n'allait pas de soi lorsqu'une autre solution existe. Cette idée, d'abord jugée extravagante, est en train de s'installer dans les esprits, y compris chez nos voisins, qui observent l'expérience de près. » Il reconnaît néanmoins qu'un symbole ne saurait tenir lieu de politique : « Si l'on en reste là, on aura donné des arguments à ceux qui ne voient dans l'écologie qu'un affichage. »",
      "Les compagnies aériennes, elles, ont beau jeu de souligner que les créneaux libérés à Orly ont aussitôt été réaffectés à des destinations plus lointaines, donc plus polluantes. L'argument embarrasse jusque dans les rangs de la majorité.",
      "Plusieurs élus écologistes plaident désormais pour porter le seuil à quatre heures, ce qui engloberait une vingtaine de liaisons supplémentaires. Ils assortissent cependant leur proposition d'une condition qu'ils disent non négociable : un plan massif de modernisation du réseau, incluant la relance des trains de nuit et le plafonnement des prix sur les axes concernés. « Étendre l'interdiction sans donner au rail les moyens d'absorber la demande, ce serait se condamner à l'échec, et l'opinion ne nous le pardonnerait pas », résume l'un d'eux. Le ministère des Transports, qui met en avant l'état des finances publiques, se garde pour l'heure de tout engagement.",
    ),
    cau: [
      q("Que constate le journaliste à propos de l'interdiction, trois ans après son adoption ?",
        "Sa portée réelle a été fortement réduite par les exceptions prévues.",
        ["Elle a été progressivement étendue à la plupart des aéroports du pays.", "Son application a été repoussée faute de décret."],
        "Bài viết nói nghị định áp dụng đã bị « vidé d'une partie de sa substance par une série de dérogations » và chỉ còn liên quan tới « trois liaisons ». Lệnh cấm vẫn được áp dụng, và không hề mở rộng ra nhiều sân bay.", 1),
      q("Quelle est l'attitude d'Hélène Garnier face à cette mesure ?",
        "Elle se sent peu concernée, car elle avait déjà fait ce choix.",
        ["Elle estime que la loi l'a obligée à revoir ses déplacements professionnels.", "Elle regrette de perdre du temps depuis qu'elle ne prend plus l'avion."],
        "Bà nói « J'avais renoncé à l'avion bien avant que la loi ne s'en mêle »: thói quen có từ trước, luật không làm bà đổi gì. Bà còn nói tàu giúp bà « gagner du temps », trái với phương án mất thời gian.", 1.5),
      q("Quelle réserve Hélène Garnier exprime-t-elle ?",
        "Le train reste hors de portée de certains budgets.",
        ["Le confort à bord ne permet pas de travailler correctement.", "Les trains sont trop souvent en retard aux heures de pointe."],
        "Bà nói giá vé giờ cao điểm « frôle l'indécence » và với « un étudiant ou une famille, c'est une autre affaire ». Bà không chê tiện nghi (bà làm việc được trên tàu) và không nhắc tới trễ giờ.", 0.5),
      q("Que reprochent les associations d'usagers aux pouvoirs publics ?",
        "D'avoir laissé un opérateur sans concurrent fixer librement ses prix.",
        ["D'avoir favorisé l'autocar au détriment du train.", "D'avoir supprimé certaines lignes de train afin de financer la mesure."],
        "Theo các hiệp hội, nhà nước đã bỏ cạnh tranh hàng không « sans encadrer les tarifs ferroviaires », tặng cho hãng tàu « une rente de situation ». Xe khách chỉ là lựa chọn bất đắc dĩ của hành khách, không phải thứ nhà nước ưu ái.", 1),
      q("Comment Paul Lemaire juge-t-il l'effet de la mesure sur les émissions ?",
        "Négligeable, ce qui était prévisible dès le départ.",
        ["Décevant, alors que les experts en espéraient beaucoup.", "Encourageant, puisque la courbe commence à s'infléchir."],
        "Ông nhắc các tuyến bị bỏ chỉ chiếm « moins de 3 % des émissions » và « Personne de sérieux n'attendait de cette mesure qu'elle infléchisse la courbe à elle seule »: tác động nhỏ và ai cũng biết trước, nên không thể gọi là thất vọng so với kỳ vọng.", 1.5),
      q("Selon Paul Lemaire, quel est le véritable apport de cette interdiction ?",
        "Elle fait admettre que l'avion n'est plus un choix évident.",
        ["Elle prouve aux pays voisins qu'ils ont eu tort d'hésiter si longtemps.", "Elle montre que l'écologie n'est pas qu'un affichage."],
        "Với ông, điều cốt lõi là lần đầu một nhà nước khẳng định « prendre l'avion n'allait pas de soi lorsqu'une autre solution existe », và ý này « est en train de s'installer dans les esprits ». Ông còn cảnh báo ngược lại: nếu dừng ở đây thì sẽ tiếp tay cho người coi sinh thái là « un affichage ».", 2),
      q("À quelle condition les élus écologistes soutiennent-ils l'extension de l'interdiction ?",
        "Que le rail soit d'abord mis en état d'accueillir les voyageurs.",
        ["Que le ministère s'engage à réduire la dette publique.", "Que les compagnies aériennes renoncent d'elles-mêmes aux vols lointains."],
        "Họ đặt điều kiện « non négociable »: « un plan massif de modernisation du réseau », vì mở rộng lệnh cấm « sans donner au rail les moyens d'absorber la demande » là thất bại. Tài chính công là lý do bộ chần chừ, không phải điều kiện của các nghị sĩ.", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 2 ─────────────── */
  const CE2 = {
    id: "lo20mv7gpfq803g",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Devoirs à la maison : la fin d'un tabou ?</strong>",
      "Peu de parents le savent : dans les écoles primaires françaises, les devoirs écrits à la maison sont proscrits depuis une circulaire de 1956, maintes fois réaffirmée et tout aussi régulièrement ignorée. Soixante-dix ans plus tard, la pratique demeure si répandue qu'y renoncer passe encore, aux yeux de beaucoup, pour une forme de laxisme. C'est pourtant le pari qu'a fait, à la rentrée dernière, une école de la banlieue de Rennes.",
      "« Nous sommes partis d'un constat que chacun connaît sans oser le formuler, explique sa directrice, Sophie Le Guen. Le soir, certains élèves retrouvent un parent disponible, un bureau, du calme ; d'autres gardent leurs frères et sœurs dans un appartement bruyant. Leur demander le même travail, c'est faire comme si ces écarts n'existaient pas, et, en réalité, les creuser. » Les exercices écrits ont donc été rapatriés dans l'emploi du temps, sous la forme de trois séances hebdomadaires d'étude encadrée par les enseignants.",
      "L'annonce n'a pas été accueillie sans remous. Lors de la réunion de rentrée, plusieurs familles ont exprimé la crainte de voir leurs enfants décrocher, ou arriver démunis au collège. « On nous a soupçonnés de vouloir en faire moins, se souvient la directrice. Il a fallu expliquer que nous ne supprimions pas le travail, mais que nous le déplacions là où nous pouvions l'accompagner. »",
      "Un an après, les évaluations nationales ne font apparaître aucun recul ; les élèves les plus fragiles affichent même une légère progression en lecture. L'équipe se garde toutefois de tout triomphalisme : une seule année et une seule école ne font pas une démonstration, et le dispositif a un coût, puisqu'il a fallu rogner sur d'autres activités.",
      "Marc Dufour, professeur de collège et auteur d'un essai sur le sujet, se montre plus circonspect. « Je ne conteste pas le diagnostic, mais je me méfie du remède. Le travail personnel n'a pas pour seule fonction de fixer des connaissances : il apprend à s'organiser, à affronter seul une difficulté, à différer une récompense. Autant de compétences qu'on n'acquiert pas sous le regard permanent d'un adulte. » Il redoute qu'à vouloir protéger les élèves, on ne les prive d'un apprentissage dont l'absence se paiera plus tard, au lycée, au prix fort. Sa solution tient en une ligne : des tâches courtes, clairement délimitées, que l'enfant peut mener à bien sans aide, à l'opposé des exposés et autres dossiers qui finissent, de fait, rédigés par les parents.",
      "Reste un argument que ni l'une ni l'autre n'avaient anticipé. Pour une partie des familles, le cahier ouvert sur la table de la cuisine était moins une contrainte qu'une fenêtre : la seule occasion de savoir ce que l'enfant étudiait et où il peinait. « Depuis qu'il ne rapporte plus rien, j'ai l'impression d'être tenue à l'écart », confie une mère. L'école expérimente depuis janvier un carnet hebdomadaire, dans lequel chaque élève consigne ce qu'il a appris. Un compromis qui, de l'aveu même de l'équipe, ne remplace pas tout à fait ce qu'il prétend compenser.",
    ),
    cau: [
      q("Que nous apprend l'article sur la règle qui encadre les devoirs écrits à l'école primaire ?",
        "Elle est ancienne, mais elle est restée largement lettre morte.",
        ["Elle vient d'être adoptée et suscite déjà des résistances.", "Elle a fini par être abandonnée parce qu'elle paraissait trop laxiste."],
        "Bài viết nói bài tập viết ở nhà bị cấm « depuis une circulaire de 1956 », được nhắc lại nhiều lần và « tout aussi régulièrement ignorée ». Quy định vẫn còn hiệu lực, chỉ là không ai tuân theo.", 1),
      q("Selon Sophie Le Guen, que produit le fait de donner les mêmes devoirs à tous ?",
        "Cela aggrave des inégalités que l'école feint de ne pas voir.",
        ["Cela pousse les élèves à copier le travail de leurs camarades.", "Cela surcharge surtout les élèves qui ont des frères et sœurs."],
        "Bà nói giao cùng một việc cho mọi học sinh là « faire comme si ces écarts n'existaient pas, et, en réalité, les creuser »: làm khoảng cách sâu thêm. Anh chị em chỉ là một ví dụ về hoàn cảnh, không phải ý chính.", 1.5),
      q("Lors de la réunion de rentrée, que craignaient certaines familles ?",
        "Que leurs enfants prennent du retard.",
        ["Que l'étude encadrée soit facturée aux parents.", "Que les enseignants soient moins nombreux."],
        "Nhiều gia đình sợ con mình « décrocher, ou arriver démunis au collège », tức là tụt lại. Bài không nói gì tới phí hay số giáo viên.", 1),
      q("Comment l'école présente-t-elle les résultats obtenus après un an ?",
        "Avec prudence, bien qu'ils soient plutôt rassurants.",
        ["Comme la preuve que la méthode devrait être généralisée.", "Comme un échec relatif, à cause du recul en lecture."],
        "Kết quả không giảm, học sinh yếu còn tiến bộ nhẹ, nhưng nhóm giáo viên « se garde toutefois de tout triomphalisme » vì « une seule année et une seule école ne font pas une démonstration ». Không có sụt giảm nào về đọc.", 1.5),
      q("Pour Marc Dufour, qu'apporte avant tout le travail fait seul à la maison ?",
        "Des aptitudes qui dépassent le contenu des leçons.",
        ["Une meilleure mémorisation que le travail en classe.", "Une relation plus étroite entre l'enfant et ses parents."],
        "Ông nói việc tự học « n'a pas pour seule fonction de fixer des connaissances »: nó dạy « à s'organiser, à affronter seul une difficulté, à différer une récompense ». Đó là kỹ năng vượt ngoài nội dung bài học, không phải chuyện ghi nhớ tốt hơn.", 2),
      q("Quel type de devoirs Marc Dufour recommande-t-il ?",
        "Des exercices brefs que l'élève peut faire sans l'aide de personne.",
        ["Des dossiers documentés, à préparer en famille pendant le week-end.", "Des exposés à présenter devant la classe."],
        "Giải pháp của ông: « des tâches courtes, clairement délimitées, que l'enfant peut mener à bien sans aide ». Ông đặt chúng đối lập với « exposés et autres dossiers » mà rốt cuộc cha mẹ làm hộ.", 0.5),
      q("Que représentaient les devoirs pour une partie des familles ?",
        "Un moyen de rester informées de la scolarité de leur enfant.",
        ["Une contrainte dont elles se félicitent d'être libérées.", "Une occasion de vérifier le travail des enseignants."],
        "Với một số gia đình, cuốn vở trên bàn bếp là « moins une contrainte qu'une fenêtre »: dịp duy nhất để biết con học gì và vướng ở đâu. Một bà mẹ còn nói mình bị « tenue à l'écart », nên không thể là nhẹ nhõm.", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 3 ─────────────── */
  const TEN = ["Nadia", "Lucas", "Bertrand"];
  const a = ai(TEN);
  const CE3 = {
    id: "lo20mv7gpfq803h",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Faut-il interdire les voitures dans le centre-ville ? »</p>",
    readingText: p(
      "<strong>Nadia</strong>",
      "J'habite l'hypercentre depuis dix ans, et la piétonnisation de ma rue a transformé mon quotidien : le vacarme a cédé la place aux conversations, les enfants ont réinvesti la chaussée. Je serais pourtant malhonnête si j'en tirais une règle générale. Chez nous, l'opération a réussi parce que le tramway passe toutes les six minutes. Imposer la même chose à des quartiers mal desservis reviendrait à sanctionner des gens qui n'ont aucune solution de rechange, et l'on s'étonnerait ensuite qu'ils rejettent en bloc toute politique écologique. Qu'on procède donc rue par rue, à mesure que l'offre de transport suit, plutôt que de décréter du jour au lendemain une interdiction générale.",
      "<strong>Lucas</strong>",
      "Je tiens une librairie dans une rue fermée à la circulation depuis trois ans. Comme la plupart de mes confrères, j'étais vent debout contre le projet, persuadé que mes clients ne viendraient plus. C'est l'inverse qui s'est produit : on flâne, on s'attarde, on entre, et mon chiffre d'affaires a progressé d'un bon quart. Mais l'argument économique n'est même pas, à mes yeux, le plus décisif. On sait ce que la pollution de l'air coûte chaque année en maladies respiratoires, notamment chez les plus jeunes. Dès lors, je ne comprends pas qu'on mette en balance le confort de quelques automobilistes et les poumons de nos enfants. Le reste est secondaire.",
      "<strong>Bertrand</strong>",
      "Artisan plombier, je passe mes journées à transporter cent kilos de matériel d'un chantier à l'autre. On m'explique que je n'ai qu'à me garer dans un parking relais et finir à pied : c'est méconnaître totalement la réalité de mon métier. Chaque intervention en centre-ville me prend désormais une demi-heure de plus, que je dois bien répercuter sur la facture ou absorber sur ma marge. Ce qui m'exaspère le plus, c'est la méthode : les réunions de concertation se tiennent en pleine journée, quand ceux qui travaillent de leurs mains ne peuvent pas s'y rendre. On consulte les riverains et les cyclistes, jamais ceux qui font tourner la ville.",
    ),
    cau: [
      a("La fermeture des rues aux voitures profite à l'activité commerciale.", "Lucas", "Lucas, chủ hiệu sách, kể rằng sau khi phố cấm xe « mon chiffre d'affaires a progressé d'un bon quart »: việc buôn bán được lợi.", 2),
      a("Le changement doit se faire progressivement.", "Nadia", "Nadia muốn làm « rue par rue, à mesure que l'offre de transport suit », thay vì cấm đồng loạt « du jour au lendemain ».", 1.5),
      a("Les décisions sont prises sans que certains usagers puissent donner leur avis.", "Bertrand", "Bertrand bực vì các buổi tham vấn tổ chức giữa ngày, lúc người lao động chân tay không tới được: « On consulte les riverains et les cyclistes, jamais ceux qui font tourner la ville ».", 1),
      a("L'enjeu sanitaire l'emporte sur toute autre considération.", "Lucas", "Với Lucas, lý lẽ kinh tế không phải quan trọng nhất: ông không hiểu sao người ta đặt lên bàn cân tiện nghi của vài người lái xe và « les poumons de nos enfants », rồi kết: « Le reste est secondaire ».", 1.5),
      a("Une interdiction mal préparée risque de nuire à la cause qu'elle défend.", "Nadia", "Nadia cảnh báo: áp cho khu thiếu phương tiện công cộng thì người dân sẽ « rejettent en bloc toute politique écologique », tức là phản tác dụng với chính mục tiêu môi trường.", 0.5),
      a("Ces mesures entraînent un surcoût pour certains professionnels.", "Bertrand", "Bertrand mất thêm nửa giờ mỗi lần vào trung tâm, khoản đó phải « répercuter sur la facture ou absorber sur ma marge »: một chi phí phát sinh cho người làm nghề.", 0.5),
    ],
  };

  /* ─────────────── NGHE 1 ─────────────── */
  const CO1 = {
    id: "lo20mv7gnt9q03c", ten: "b2k-de1-co1", hai: true,
    gioiThieu: "Vous écoutez une émission à la radio.",
    phanTich: { loai: "Interview à la radio", chu_de: "Le droit à la déconnexion", y_chinh: "Une psychologue du travail explique pourquoi la loi ne suffit pas : la pression vient d'une norme implicite, et le changement dépend surtout de l'exemple donné par les dirigeants." },
    doan: [
      d("sage", RADIO, "Bonjour à toutes et à tous. Depuis 2017, la loi reconnaît aux salariés français un droit à la déconnexion. Sur le papier, c'était une petite révolution. Dans les faits, les courriels de vingt-deux heures et les messages du dimanche se portent à merveille : d'après une enquête parue ce mois-ci, près d'un salarié sur deux avoue consulter sa messagerie professionnelle pendant ses congés. Pour comprendre ce paradoxe, nous recevons Claire Marchand, psychologue du travail. Claire Marchand, bonjour. Pourquoi a-t-on tant de mal à décrocher ?"),
      d("shimmer", KHACH, "Bonjour. Alors, euh, d'abord parce qu'on se trompe de coupable. On accuse le téléphone, mais le téléphone, on sait l'éteindre. Ce qui est beaucoup plus difficile à éteindre, c'est, comment dire, la peur de passer pour quelqu'un qui ne s'investit pas assez. Ce que j'entends en consultation, c'est toujours la même phrase : si je ne réponds pas dans l'heure, on va croire que je m'en fiche. Et notez bien que personne, absolument personne, ne leur a demandé de répondre le soir. Simplement, tout le monde le fait, donc on s'aligne. C'est ce que j'appelle une norme invisible : elle n'est écrite nulle part, et c'est justement pour ça qu'elle est si difficile à contester."),
      d("sage", RADIO, "Vous êtes en train de nous dire que la loi n'a servi à rien ?"),
      d("shimmer", KHACH, "Non, non, je n'irais pas jusque-là. La loi a obligé les entreprises à ouvrir une négociation, et certaines ont joué le jeu, vraiment : des serveurs de messagerie coupés après vingt heures, des envois différés au lendemain matin, ce genre de choses. Le problème, c'est plutôt du côté des petites structures. Là, bien souvent, on a rédigé une charte, on l'a fait signer, on l'a rangée dans un tiroir, et, euh, voilà, on a coché la case. Le texte existe, hein. Ce qui manque, c'est tout ce qui permettrait de le faire vivre."),
      d("sage", RADIO, "Et sur le plan de la santé, que risque-t-on, concrètement ?"),
      d("shimmer", KHACH, "Alors, ce qu'on voit en premier, c'est le sommeil qui se dégrade. On s'endort avec un dossier en tête, on se réveille à quatre heures en pensant à un courriel. Ensuite vient une fatigue qui ne se répare plus pendant le week-end, et, dans les cas les plus sérieux, l'épuisement professionnel. Mais ce que les directions sous-estiment complètement, c'est que l'entreprise y perd, elle aussi. Un salarié qui ne récupère jamais devient moins créatif, il fait davantage d'erreurs, il finit par s'absenter. Autrement dit, on croit gagner en réactivité, et en fait on perd en qualité. C'est un très mauvais calcul."),
      d("sage", RADIO, "Alors que faudrait-il faire ? Durcir les sanctions ?"),
      d("shimmer", KHACH, "Franchement, je n'y crois pas beaucoup. On ne change pas une culture à coups d'amendes. Ce qui marche, et je le constate dans les équipes que j'accompagne, c'est l'exemple qui vient d'en haut. Tant qu'un directeur envoie ses instructions à vingt-trois heures, vous pouvez afficher toutes les chartes du monde, personne n'y croira. Le jour où il s'en abstient, et surtout où il le dit, là, quelque chose se débloque. Et puis, euh, il y a un exercice tout simple que je propose : on reprend ensemble les messages envoyés en dehors des horaires sur un mois, et on se demande lesquels ne pouvaient vraiment pas attendre. Eh bien, à chaque fois, les équipes tombent des nues : il y en a une poignée, pas plus. L'urgence, la vraie, elle est rarissime."),
      d("sage", RADIO, "Un dernier mot pour ceux qui nous écoutent, peut-être, le téléphone à la main ?"),
      d("shimmer", KHACH, "Oui : qu'ils essaient un soir, juste un. Ils verront que le lendemain matin, le monde ne s'est pas effondré."),
      d("sage", RADIO, "Claire Marchand, merci."),
    ],
    cau: [
      q("Que révèle l'enquête citée par la journaliste ?",
        "Beaucoup de salariés continuent à suivre leurs messages en vacances.",
        ["La moitié des entreprises ne respectent toujours pas la loi votée en 2017.", "Les salariés reçoivent deux fois plus de courriels qu'avant."],
        "Nhà báo dẫn khảo sát: gần một nửa người lao động thừa nhận « consulter sa messagerie professionnelle pendant ses congés ». Khảo sát nói về hành vi của người lao động, không nói doanh nghiệp vi phạm luật.", 1.5),
      q("D'après Claire Marchand, qu'est-ce qui empêche vraiment les salariés de décrocher ?",
        "La crainte d'être jugés peu engagés.",
        ["L'impossibilité technique d'éteindre leurs outils.", "Les consignes explicites de leur hiérarchie."],
        "Bà nói điện thoại thì tắt được; thứ khó tắt là « la peur de passer pour quelqu'un qui ne s'investit pas assez ». Bà còn nhấn mạnh không ai yêu cầu họ trả lời buổi tối, nên không phải do chỉ thị.", 1),
      q("Pourquoi la « norme invisible » est-elle, selon elle, difficile à remettre en cause ?",
        "Parce qu'elle n'est formulée dans aucun texte.",
        ["Parce qu'elle figure dans le contrat de travail.", "Parce que les syndicats la défendent."],
        "Bà giải thích chuẩn mực này « n'est écrite nulle part, et c'est justement pour ça qu'elle est si difficile à contester »: không có văn bản nào để phản đối.", 1.5),
      q("Que reproche-t-elle à de nombreuses petites structures ?",
        "De s'être contentées d'une formalité sans effet.",
        ["D'avoir refusé de signer la moindre charte.", "D'avoir coupé les serveurs sans prévenir les salariés."],
        "Ở các cơ sở nhỏ, người ta soạn một bản quy ước, cho ký, « on l'a rangée dans un tiroir » và coi như xong: « on a coché la case ». Văn bản có, nhưng chỉ là thủ tục.", 1),
      q("Selon Claire Marchand, que comprennent mal les directions ?",
        "Que l'entreprise est elle-même perdante.",
        ["Que les salariés fatigués travaillent plus vite.", "Que le sommeil relève de la vie privée."],
        "Bà nói điều ban lãnh đạo đánh giá thấp là « l'entreprise y perd, elle aussi »: nhân viên không hồi sức thì kém sáng tạo, sai nhiều hơn, rồi nghỉ ốm. Người ta tưởng được về tốc độ nhưng mất về chất lượng.", 1.5),
      q("Quelle solution lui paraît la plus efficace ?",
        "Que les dirigeants modifient d'abord leur propre comportement.",
        ["Que l'État augmente le montant des amendes.", "Que chaque entreprise affiche sa charte dans tous les bureaux."],
        "Bà không tin vào phạt tiền: « On ne change pas une culture à coups d'amendes ». Thứ hiệu quả là « l'exemple qui vient d'en haut »: khi giám đốc thôi gửi chỉ thị lúc khuya và nói rõ điều đó.", 1.5),
      q("Que découvrent les équipes grâce à l'exercice qu'elle propose ?",
        "Très peu de messages exigeaient une réponse immédiate.",
        ["La plupart des messages venaient de la direction.", "Les messages du soir étaient les plus importants."],
        "Khi xem lại tin nhắn gửi ngoài giờ trong một tháng, các nhóm « tombent des nues »: chỉ có « une poignée » là không thể chờ. Bà kết: « L'urgence, la vraie, elle est rarissime ».", 1),
    ],
  };

  /* ─────────────── NGHE 2 ─────────────── */
  const CO2 = {
    id: "lo20mv7gofev03d", ten: "b2k-de1-co2", hai: true,
    gioiThieu: "Vous écoutez une émission à la radio.",
    phanTich: { loai: "Reportage radio", chu_de: "Un atelier associatif de réparation de vélos", y_chinh: "Dans cet atelier, les adhérents apprennent à réparer eux-mêmes. Au-delà de la mécanique, le lieu crée de l'autonomie, du lien social et de la confiance en soi." },
    doan: [
      d("nova", PHONG, "Un samedi matin dans un ancien garage du nord de Lyon. Des roues suspendues au plafond, des cadres alignés contre le mur, et une odeur de graisse qui vous saisit dès la porte. Ici, on ne dépose pas son vélo pour venir le rechercher le soir : on met les mains dans le cambouis. C'est le principe de cet atelier associatif, que Samir a cofondé il y a six ans. Samir, comment est-ce que ça fonctionne, exactement ?"),
      d("echo", NGUOI, "Alors, c'est très simple : nous, on ne répare rien à votre place. Vous arrivez avec votre vélo, on vous prête les outils, on vous montre le geste, et c'est vous qui le faites. La première fois, les gens sont un peu, euh, déconcertés, ils s'attendaient à un service. Et puis au bout d'une heure, ils ont changé une chambre à air tout seuls, et là, vous voyez leur tête, franchement, ça vaut tous les discours."),
      d("nova", PHONG, "Les débuts ont été faciles ?"),
      d("echo", NGUOI, "Oh là, pas du tout. Au départ, on était quatre, dans une cave prêtée par un voisin, avec trois clés et une pompe. On ne pouvait accueillir que deux personnes à la fois, et on refusait du monde tous les samedis. C'est la mairie qui a fini par nous confier ce local, il y a quatre ans, contre un loyer symbolique. Sans ça, honnêtement, je crois qu'on aurait jeté l'éponge."),
      d("nova", PHONG, "Et qui pousse la porte, aujourd'hui ?"),
      d("echo", NGUOI, "De tout. Des étudiants fauchés, des livreurs, des retraités. Et puis, et ça, on ne l'avait pas vu venir, beaucoup de femmes, qui nous disent presque toutes la même chose : j'en ai assez de dépendre de quelqu'un dès que j'ai une crevaison. Elles ne viennent pas pour économiser trente euros, elles viennent pour ne plus avoir à demander. Du coup, on a ouvert un créneau qui leur est réservé le jeudi soir, parce que certaines n'osaient pas, euh, poser de questions devant tout le monde."),
      d("nova", PHONG, "Où trouvez-vous vos pièces ? Ça représente un budget, tout ça."),
      d("echo", NGUOI, "Justement, on n'achète presque rien. La ville nous cède les vélos abandonnés qu'elle ramasse dans les rues, plusieurs centaines par an. On les démonte entièrement, on trie, et ce qui est encore bon repart sur d'autres vélos. Ce qu'on ne peut pas réutiliser part à la ferraille. Ça nous permet de proposer des pièces à deux ou trois euros, et l'adhésion est à prix libre."),
      d("nova", PHONG, "Si vous deviez dire ce dont vous êtes le plus fier ?"),
      d("echo", NGUOI, "On me pose souvent la question, et les gens s'attendent à ce que je cite un chiffre, le nombre de vélos remis en circulation. Mais, euh, non. Ce qui me touche, c'est de voir des personnes qui se croyaient nulles de leurs mains repartir en se disant : finalement, j'en suis capable. Et ça déborde largement le vélo. Il y en a qui, après, se lancent dans des travaux chez eux. Et puis, il faut le dire, on vient aussi ici pour discuter. Il y a des habitués qui passent sans vélo, juste pour boire un café. Dans un quartier où les lieux de rencontre ont fermé les uns après les autres, ça compte."),
      d("nova", PHONG, "Et demain ?"),
      d("echo", NGUOI, "Demain, on voudrait aller là où les gens ne viennent pas jusqu'à nous. On est en train d'aménager une camionnette en atelier mobile, pour s'installer une fois par semaine au pied des immeubles, dans les quartiers où il n'y a ni réparateur ni piste cyclable. Si tout va bien, on démarre au printemps."),
    ],
    cau: [
      q("Qu'est-ce qui distingue cet atelier d'un réparateur classique ?",
        "Les adhérents font eux-mêmes les réparations.",
        ["Les réparations sont faites gratuitement par des bénévoles.", "Les vélos sont rendus le soir même."],
        "Samir nói rõ: « on ne répare rien à votre place »; người ta được mượn dụng cụ, được chỉ thao tác, « et c'est vous qui le faites ». Phóng viên cũng nói ở đây không gửi xe rồi chiều lấy.", 1.5),
      q("Quelle était la principale difficulté de l'association à ses débuts ?",
        "Elle manquait de place et d'équipement.",
        ["Elle ne trouvait pas assez d'adhérents.", "Elle devait payer un loyer trop élevé."],
        "Lúc đầu họ ở « une cave prêtée par un voisin, avec trois clés et une pompe », chỉ tiếp được hai người một lúc và tuần nào cũng phải từ chối khách: thiếu chỗ và thiếu đồ, không thiếu người.", 1),
      q("Selon Samir, que recherchent surtout les femmes qui viennent à l'atelier ?",
        "Ne plus avoir besoin de l'aide de quelqu'un.",
        ["Dépenser moins pour l'entretien de leur vélo.", "Apprendre un métier manuel."],
        "Các chị nói chán cảnh « dépendre de quelqu'un » mỗi lần thủng lốp. Samir nhấn: họ không tới để tiết kiệm ba mươi euro, « elles viennent pour ne plus avoir à demander ».", 2),
      q("Comment l'atelier se procure-t-il la plupart de ses pièces ?",
        "Il récupère des éléments sur des vélos délaissés.",
        ["Il les achète à bas prix à un grossiste.", "Il reçoit des dons d'un fabricant local."],
        "Thành phố nhượng cho họ « les vélos abandonnés qu'elle ramasse dans les rues »; họ tháo rời, phân loại, « ce qui est encore bon repart sur d'autres vélos ». Samir nói gần như không mua gì.", 1.5),
      q("En dehors de la mécanique, quel rôle l'atelier joue-t-il dans le quartier ?",
        "Il offre un endroit où les habitants se retrouvent.",
        ["Il sert de café associatif payant.", "Il remplace la maison de quartier fermée par la mairie."],
        "Samir nói người ta tới cả để trò chuyện, có khách quen ghé không mang xe; trong khu mà « les lieux de rencontre ont fermé les uns après les autres », điều đó có ý nghĩa.", 1.5),
      q("De quoi Samir est-il le plus fier ?",
        "De voir des personnes reprendre confiance en leurs capacités.",
        ["Du nombre de vélos remis en circulation chaque année.", "D'avoir obtenu un local de la mairie."],
        "Ông gạt con số xe được sửa sang một bên: điều làm ông xúc động là thấy người tưởng mình vụng về ra về và tự nhủ « finalement, j'en suis capable ».", 0.5),
      q("Quel projet l'association prépare-t-elle ?",
        "Un atelier itinérant pour les quartiers qui n'ont aucun service.",
        ["L'ouverture d'un second local, plus grand, en plein centre-ville.", "La création de pistes cyclables avec la mairie."],
        "Họ đang cải tạo « une camionnette en atelier mobile » để mỗi tuần tới đặt dưới chân các toà nhà, ở những khu « où il n'y a ni réparateur ni piste cyclable ».", 1),
    ],
  };

  /* ─────────────── NGHE 3 ─────────────── */
  const CO3 = {
    id: "lo20mv7gpfq803e", ten: "b2k-de1-co3", hai: false,
    phanTich: { loai: "Trois courts documents radio", chu_de: "Installation agricole, médiathèque ouverte le dimanche, lutherie", y_chinh: "Trois chroniques brèves : l'accès à la terre pour les jeunes agriculteurs, l'ouverture dominicale d'une médiathèque, un luthier qui cherche à transmettre son savoir-faire." },
    docs: [
      { doan: [d("alloy", TIN, "Ils ont moins de trente-cinq ans et rêvent de s'installer comme maraîchers. Dans la Drôme, une quinzaine de jeunes se sont regroupés pour y parvenir. Car, contrairement à ce qu'on imagine, ce n'est ni le savoir-faire ni la motivation qui leur font défaut : c'est la terre elle-même. Le prix de l'hectare a doublé en dix ans, et les exploitations qui se libèrent sont presque toujours rachetées par des voisins qui s'agrandissent. Le collectif a donc acheté quatre hectares en commun, grâce à une épargne citoyenne, et les loue à ses membres. Autre choix assumé : ils écoulent toute leur production sur les marchés et par paniers, sans passer par la grande distribution. Non par militantisme, précisent-ils, mais parce que c'est la seule façon de dégager un revenu correct.")],
        cau: [
          q("D'après le document, qu'est-ce qui freine le plus l'installation de ces jeunes ?",
            "La difficulté à acquérir des terres.",
            ["Le manque de formation agricole.", "Le refus des banques de leur prêter de l'argent."],
            "Bản tin nói thứ họ thiếu không phải tay nghề hay động lực: « c'est la terre elle-même ». Giá mỗi hécta tăng gấp đôi và đất trống thường bị hàng xóm mua lại. Ngân hàng không được nhắc tới.", 2),
          q("Pourquoi vendent-ils sans intermédiaire ?",
            "Parce que c'est plus rentable pour eux.",
            ["Par conviction politique avant tout.", "Parce que les supermarchés refusent leurs produits."],
            "Họ nói rõ là « Non par militantisme », mà vì đó là « la seule façon de dégager un revenu correct »: lý do là thu nhập.", 1),
        ] },
      { doan: [d("nova", TIN, "À Angers, la médiathèque centrale ouvrira désormais ses portes le dimanche après-midi, de quatorze à dix-huit heures. La décision fait suite à une consultation menée l'an dernier : plus de sept habitants sur dix réclamaient cette ouverture, en particulier les étudiants, qui manquent de lieux où travailler le week-end, et les familles. Le projet avait pourtant suscité des réticences parmi le personnel, inquiet de voir ses repos remis en cause. Un compromis a été trouvé : seuls les agents volontaires seront concernés, et ils bénéficieront d'une majoration de salaire. Des étudiants seront par ailleurs recrutés pour assurer l'accueil. La mairie dressera un bilan au bout de six mois avant de décider d'étendre, ou non, l'expérience aux bibliothèques de quartier.")],
        cau: [
          q("Qu'est-ce qui a conduit la mairie à ouvrir la médiathèque le dimanche ?",
            "Une forte attente exprimée par la population.",
            ["Une demande du personnel de la médiathèque.", "Le succès de l'ouverture des bibliothèques de quartier."],
            "Quyết định đến sau một cuộc tham vấn: « plus de sept habitants sur dix réclamaient cette ouverture ». Nhân viên thì ngược lại, còn e dè; thư viện khu phố thì chưa mở, đó là việc xét sau.", 1.5),
          q("Comment la question du personnel a-t-elle été réglée ?",
            "Seuls travailleront ceux qui l'acceptent.",
            ["Tous les agents travailleront un dimanche sur deux.", "L'accueil sera entièrement confié à des étudiants."],
            "Thoả hiệp là: « seuls les agents volontaires seront concernés », kèm phụ cấp lương. Sinh viên chỉ được tuyển thêm cho khâu đón tiếp, không thay toàn bộ.", 1),
        ] },
      { doan: [d("echo", TIN, "Dans son atelier de Mirecourt, dans les Vosges, Julien Arnaud fabrique des violons comme on le faisait il y a trois siècles. Sa particularité : il ne travaille que des bois anciens, qu'il récupère sur des charpentes ou de vieux meubles. Ce n'est pas une coquetterie d'artisan. Un bois qui a séché pendant un siècle est plus léger et plus stable, et il vibre mieux : l'instrument sonne tout de suite, là où un violon neuf met des années à s'ouvrir. Les musiciens ne s'y trompent pas, et la liste d'attente dépasse aujourd'hui deux ans. À cinquante-huit ans, Julien Arnaud s'inquiète pourtant moins de ses commandes que de la suite. Il cherche un apprenti à qui transmettre son savoir-faire, et, pour l'instant, personne ne s'est présenté.")],
        cau: [
          q("Pourquoi Julien Arnaud n'utilise-t-il que du bois ancien ?",
            "Pour obtenir une sonorité de qualité dès le départ.",
            ["Parce que le bois neuf est devenu trop cher.", "Pour respecter une tradition, sans effet sur le son."],
            "Bản tin nói đây không phải thói điệu của người thợ: gỗ đã khô cả thế kỷ « vibre mieux » và « l'instrument sonne tout de suite ». Lý do là âm thanh, không phải giá hay truyền thống suông.", 1),
          q("Quelle est aujourd'hui sa principale préoccupation ?",
            "Trouver quelqu'un à qui apprendre son métier.",
            ["Réduire sa liste d'attente.", "Trouver de nouveaux clients."],
            "Ông lo « moins de ses commandes que de la suite »: ông tìm « un apprenti à qui transmettre son savoir-faire ». Đơn hàng thì đã kín hơn hai năm.", 0.5),
        ] },
    ],
  };

  return { ten: "DELF B2 · Đề 1", CE: [CE1, CE2, CE3], CO: [CO1, CO2, CO3] };
}
