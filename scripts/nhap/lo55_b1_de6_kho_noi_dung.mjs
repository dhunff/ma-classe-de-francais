/* Lô 55 (17/11/2026): NỘI DUNG « DELF B1 · Đề 6 » NÂNG ĐỘ KHÓ (chủ đề mùa hè 2026 và nắng nóng).
 * Giữ chủ đề và khung câu của lô 22, viết lại văn bản, kịch bản, câu hỏi.
 * Bài báo (Đọc 2) soạn TỪ NGUỒN THẬT: giữ nguyên mọi dữ kiện, con số và dòng ghi nguồn của bản cũ,
 * KHÔNG thêm dữ kiện mới; phần dài thêm chỉ là lập luận nêu chung. Không dùng dấu gạch dài (quy tắc 7). */

export function noiDung({ q, v, p, d }) {
  const RADIO = "Parle en français de France comme une journaliste de radio locale en reportage : débit naturel et vivant, sans ralentir pour des apprenants.";
  const DIR = "Parle en français de France comme un directeur d'école interviewé à la radio : débit naturel, chaleureux, quelques hésitations.";
  const MERE = "Parle en français de France comme une mère d'élève qui donne son avis au micro : débit rapide et spontané, ton franc.";
  const MAIRIE = "Parle en français de France comme une employée de mairie qui laisse un message sur un répondeur : débit naturel, ton aimable et clair, sans ralentir.";
  const nguon = (...ds) => `<p><small><em>Texte rédigé par FRACILE à partir de : ${ds.join(" ; ")}.</em></small></p>`;

  const CO1 = {
    id: "lo22mvemy7r602h",
    gioiThieu: "Vous écoutez une émission de radio locale.",
    doan: [
      d("sage", RADIO, "Dans « Ma ville demain », nous sommes ce matin à l'école Jules-Ferry, où la cour de récréation a été entièrement refaite pendant l'été. Monsieur Lambert, vous dirigez l'école depuis dix ans. Pour ceux qui ne la connaissaient pas avant, à quoi ressemblait cette cour ?"),
      d("echo", DIR, "Oh, c'était très simple : un grand rectangle de goudron noir, deux paniers de basket et, euh, pas un seul arbre. Pendant des années, ça ne posait de problème à personne. Mais en juin dernier, pendant la canicule, on a mesuré plus de cinquante degrés au sol en début d'après-midi. Les enfants ne pouvaient plus sortir, on gardait tout le monde à l'intérieur, dans des classes elles-mêmes étouffantes. Là, on s'est dit que ça ne pouvait plus durer."),
      d("sage", RADIO, "Et qu'est-ce qui a été fait ?"),
      d("echo", DIR, "On a retiré à peu près les deux tiers du goudron. À la place, il y a de la terre, de l'herbe, quinze arbres, un petit jardin potager et deux fontaines à eau. Et ce qui me rend assez fier, c'est que ce ne sont pas des adultes qui ont tout décidé. Les élèves de CM1 et de CM2 ont travaillé avec une architecte pendant trois mois, ils ont dessiné des plans, voté pour les meilleures idées. Certaines étaient irréalisables, une piscine par exemple, mais beaucoup ont été retenues."),
      d("sage", RADIO, "Sophie, vous êtes maman d'un élève. Vous étiez convaincue dès le départ ?"),
      d("coral", MERE, "Pas vraiment, non, je vais être honnête. Moi, je voyais surtout les enfants revenir couverts de boue dès qu'il pleuvrait, et puis, avec moins de goudron, je me demandais où ils allaient jouer au ballon. On en a beaucoup discuté en réunion. Finalement, l'école a gardé un terrain dur pour les jeux de ballon, et on a prévu des bottes en caoutchouc à l'entrée. Et depuis la rentrée, mon fils, qui détestait la récréation, me parle tous les soirs des fraises du jardin. Alors, voilà, j'ai changé d'avis."),
      d("sage", RADIO, "Il paraît que la cour ne sert plus seulement aux élèves ?"),
      d("echo", DIR, "C'est vrai. Le samedi matin, elle est ouverte aux habitants du quartier. Il y a des personnes âgées qui viennent lire à l'ombre, des parents avec des poussettes. Pour un quartier où il y a très peu d'espaces verts, ça change vraiment les choses. Et les enseignants me disent que les enfants rentrent en classe plus calmes."),
    ],
    cau: [
      q("Avant les travaux, la cour…", "n'offrait aucune ombre.", ["était trop petite pour les élèves.", "était couverte d'herbe et de sable."], "Sân cũ là « un grand rectangle de goudron noir, deux paniers de basket et, euh, pas un seul arbre », tức không có bóng mát."),
      q("Qu'est-ce qui a décidé l'école à transformer la cour ?", "la chaleur du sol pendant la canicule", ["une plainte des habitants du quartier", "un accident pendant la récréation"], "« pendant la canicule, on a mesuré plus de cinquante degrés au sol en début d'après-midi »."),
      q("Quelle part du goudron a été retirée ?", "environ les deux tiers", ["à peu près un tiers seulement", "la totalité"], "« On a retiré à peu près les deux tiers du goudron »."),
      q("Qu'est-ce qui rend le directeur fier ?", "Les élèves ont participé aux décisions.", ["Les travaux ont coûté très peu.", "L'école a obtenu une piscine."], "« ce ne sont pas des adultes qui ont tout décidé »: học sinh vẽ sơ đồ và bỏ phiếu. Bể bơi là ý tưởng bị loại."),
      q("Au début, que craignait Sophie ?", "la boue et le manque d'espace pour le ballon", ["le bruit des habitants le samedi", "le coût des travaux payé par les familles du quartier"], "« je voyais surtout les enfants revenir couverts de boue » và « je me demandais où ils allaient jouer au ballon »."),
      q("Pourquoi Sophie a-t-elle changé d'avis ?", "Son fils apprécie désormais la récréation.", ["L'école a renoncé au jardin potager.", "Les bottes sont fournies gratuitement."], "« mon fils, qui détestait la récréation, me parle tous les soirs des fraises du jardin »."),
      q("Le samedi matin, la cour…", "accueille les gens du quartier.", ["sert à des cours de jardinage.", "est réservée aux familles des élèves."], "« Le samedi matin, elle est ouverte aux habitants du quartier »."),
    ],
    phanTich: { loai: "Reportage radio avec interviews", chu_de: "Une cour d'école transformée après la canicule", y_chinh: "Après une canicule où le sol de la cour dépassait cinquante degrés, une école a remplacé une grande partie du goudron par des arbres et un jardin, avec la participation des élèves. Une mère d'élève, d'abord sceptique, a changé d'avis, et la cour est ouverte au quartier le samedi." },
  };

  const CO2 = {
    id: "lo22mvemyhx902i",
    gioiThieu: "Vous écoutez un message de la mairie sur votre répondeur.",
    doan: [
      d("shimmer", MAIRIE, "Bonjour, ici le service des solidarités de la mairie. Vous recevez ce message parce que vous êtes inscrit sur notre registre des personnes à contacter pendant les fortes chaleurs. Après l'été que nous venons de vivre, nous préparons déjà le suivant, et nous avons besoin de vous. Pour mettre votre dossier à jour, merci de nous rappeler avant le trente novembre : nous vérifierons avec vous votre adresse, votre numéro de téléphone et le nom d'une personne proche à prévenir en cas de besoin. Si vous avez déménagé ou si vous ne souhaitez plus figurer sur le registre, dites-le-nous également. Autre information : l'été prochain, en cas de canicule, trois salles rafraîchies seront ouvertes dans la ville, au lieu d'une seule cette année. L'une d'elles se trouvera à la médiathèque, qui restera ouverte jusqu'à vingt-deux heures pendant les alertes. Un minibus gratuit pourra venir vous chercher chez vous sur simple appel. Nous restons à votre disposition du lundi au vendredi, de neuf heures à dix-sept heures, au zéro un, quarante-cinq, vingt, trente, dix. En attendant, gardez bien ce numéro près de votre téléphone. Merci et à bientôt."),
    ],
    cau: [
      q("Pourquoi cette personne reçoit-elle le message ?", "Elle figure sur une liste de personnes à protéger.", ["Elle a demandé une place à la médiathèque.", "Elle a signalé une panne de climatisation."], "« vous êtes inscrit sur notre registre des personnes à contacter pendant les fortes chaleurs »."),
      q("Lors du rappel, la mairie demandera notamment…", "le nom d'un proche à prévenir.", ["un certificat médical de moins de trois mois.", "le montant de vos revenus."], "« le nom d'une personne proche à prévenir en cas de besoin »."),
      q("Qu'est-ce qui change par rapport à cette année ?", "Il y aura davantage de salles rafraîchies.", ["Le registre va être supprimé.", "La médiathèque fermera l'été."], "« trois salles rafraîchies seront ouvertes dans la ville, au lieu d'une seule cette année »."),
      q("Pendant les alertes, la médiathèque…", "restera ouverte jusqu'à 22 h.", ["sera réservée aux personnes âgées.", "ouvrira dès six heures du matin."], "« la médiathèque, qui restera ouverte jusqu'à vingt-deux heures pendant les alertes »."),
      q("Comment rejoindre une salle rafraîchie sans voiture ?", "en appelant un minibus gratuit", ["en prenant un taxi remboursé", "avec un ticket de bus offert par la mairie"], "« Un minibus gratuit pourra venir vous chercher chez vous sur simple appel »."),
    ],
    phanTich: { loai: "Message sur répondeur", chu_de: "Le registre canicule de la mairie", y_chinh: "La mairie demande aux personnes inscrites sur le registre canicule de mettre leur dossier à jour avant le 30 novembre et annonce trois salles rafraîchies pour l'été prochain, dont la médiathèque, avec un minibus gratuit." },
  };

  const CE1 = {
    id: "lo22mvemyhx902j",
    consigne: "<p>C'est l'été et il fait très chaud. Lisez les annonces et répondez aux questions.</p>",
    readingText: p(
      "<strong>A. Musée des Beaux-Arts</strong> : salles climatisées, ouvert jusqu'à 21 h tous les jours en juillet et en août. Entrée 8 €, gratuite le premier dimanche du mois et pour les moins de 18 ans. Visites guidées « Peintres du soleil » le jeudi à 18 h, sur réservation. Café en terrasse ombragée dans le jardin du musée.",
      "<strong>B. Baignade au lac de Vassy</strong> : plage surveillée de 11 h à 19 h. Parking payant à l'entrée, mais une navette gratuite part de la gare toutes les trente minutes. Location de parasols sur place. Chiens interdits sur la plage. Baignade interdite en dehors des horaires de surveillance.",
      "<strong>C. Cinéma en plein air</strong> : chaque vendredi à 22 h, dans le parc municipal. Films en version originale sous-titrée. Gratuit. Pensez à apporter votre couverture et un vêtement chaud : la nuit, la température baisse vite près de la rivière. Annulé en cas d'orage. Programme complet affiché à l'entrée du parc chaque lundi.",
      "<strong>D. Grottes du Val-Noir</strong> : 13 °C toute l'année ! Départ toutes les heures, de 10 h à 17 h. Durée : 1 h 15. 9 € par adulte, 5 € par enfant. Chaussures fermées obligatoires, un pull conseillé. Visite déconseillée aux personnes qui ont peur des espaces fermés.",
      "<strong>E. Balade à vélo de nuit</strong> : le mercredi à 21 h 30, départ place du Marché. Parcours de 15 km sur pistes cyclables, à allure tranquille. Vélo, casque et lumières prêtés. 5 €. Âge minimum : 12 ans, accompagné d'un adulte jusqu'à 16 ans.",
    ),
    cau: [
      q("Vous voulez avoir frais et découvrir de la peinture avec un guide. Vous choisissez…", "A", ["C", "D"], "A: « salles climatisées » và « Visites guidées « Peintres du soleil » »."),
      q("Vous voulez nager, mais vous n'avez pas de voiture. Vous choisissez…", "B", ["D", "E"], "B: « une navette gratuite part de la gare toutes les trente minutes »."),
      q("Votre fille de 13 ans adore le vélo, mais vous n'en avez pas. Vous choisissez…", "E", ["A", "B"], "E: « Vélo, casque et lumières prêtés » và « Âge minimum : 12 ans »."),
      q("Quelle activité ne convient pas à quelqu'un qui a peur d'être enfermé ?", "D", ["C", "E"], "D: « Visite déconseillée aux personnes qui ont peur des espaces fermés »."),
      q("Pourquoi faut-il un vêtement chaud au cinéma en plein air ?", "Il fait frais la nuit près de la rivière.", ["Les films durent souvent plus de trois heures.", "Le parc ne propose pas de sièges."], "« la nuit, la température baisse vite près de la rivière »."),
    ],
  };

  const CE2 = {
    id: "lo22mvemyhx902k",
    consigne: "<p>Lisez l'article puis répondez aux questions.</p>",
    readingText: p(
      "<strong>Été 2026 : la France n'a jamais eu aussi chaud</strong>",
      "Le verdict de Météo-France est tombé : l'été 2026 est le plus chaud jamais mesuré en France, devant 2003 et 2022, deux étés qui avaient pourtant marqué les esprits. Juillet a même été le mois le plus chaud depuis le début des relevés, en 1900. Partout dans le pays, des records sont tombés, y compris dans des régions que l'on croyait à l'abri des fortes chaleurs : Strasbourg a ainsi dépassé 40 °C, une première dans l'histoire de la ville.",
      "La vague de chaleur de la fin juin a été particulièrement violente. Le 25 juin, 72 départements ont été placés en vigilance rouge canicule, une situation jamais vue depuis la création de ce système d'alerte, en 2004. Les écoles ont adapté leurs horaires, et de nombreuses villes ont ouvert des salles rafraîchies pour les personnes âgées. Ces mesures d'urgence, utiles, montrent toutefois les limites d'un pays qui réagit à la crise plus qu'il ne s'y prépare. Adapter des horaires ou ouvrir une salle pendant quelques jours ne transforme ni une ville ni un bâtiment.",
      "Le bilan humain est lourd. Selon les premières estimations de Santé publique France, plus de 7 300 décès supplémentaires sont liés aux épisodes de chaleur de cet été. L'Île-de-France a été la région la plus touchée, en partie parce que les grandes villes, avec leur béton et leur goudron, gardent la chaleur la nuit. Or c'est justement la nuit que le corps a besoin de récupérer : quand la température ne redescend pas, la fatigue s'accumule de jour en jour, en particulier chez les plus fragiles. Ce constat rappelle que la chaleur n'est pas seulement une question de confort, mais aussi de santé publique.",
      "À la chaleur s'est ajoutée la sécheresse : jamais les sols n'avaient été aussi secs, et des dizaines de départements ont dû limiter l'usage de l'eau. Pour beaucoup d'experts, cet été n'est pas une exception mais un aperçu de l'avenir. La question n'est donc plus seulement de réduire les émissions de gaz à effet de serre, mais aussi d'adapter nos villes, nos écoles et nos logements à des étés de plus en plus brûlants. Les deux efforts ne s'opposent pas, rappellent-ils : s'adapter sans réduire les émissions reviendrait à courir derrière un problème qui ne cesse de grandir.",
      nguon("Banque des Territoires, « Canicule, sécheresse, incendies : le bilan climatique hors normes de l'été 2026 » (banquedesterritoires.fr)", "Selectra, « Canicules de l'été 2026 : bilan » (selectra.info)", "données Météo-France et Santé publique France citées par ces articles"),
    ),
    cau: [
      q("Que nous apprend l'article sur les étés 2003 et 2022 ?", "Ils ont été moins chauds que celui de 2026.", ["Ils restent aujourd'hui les plus chauds de l'histoire.", "Ils ont été plus meurtriers que 2026."], "« l'été 2026 est le plus chaud jamais mesuré en France, devant 2003 et 2022 »."),
      q("Pourquoi le record de Strasbourg est-il remarquable ?", "La ville n'avait jamais connu une telle chaleur.", ["C'est la ville la plus chaude de France.", "Il a été mesuré au début du printemps."], "Strasbourg vượt 40 °C, « une première dans l'histoire de la ville », ở một vùng « que l'on croyait à l'abri des fortes chaleurs »."),
      v("Le nombre de départements en vigilance rouge le 25 juin n'avait jamais été atteint depuis la création de ce système.", true, "une situation jamais vue depuis la création de ce système d'alerte"),
      q("Quelle critique l'auteur fait-il des mesures prises en juin ?", "Elles répondent à la crise au lieu de l'anticiper.", ["Elles ont été inutiles et coûteuses.", "Elles ont oublié les personnes âgées des campagnes."], "Các biện pháp « utiles », nhưng cho thấy « un pays qui réagit à la crise plus qu'il ne s'y prépare »."),
      q("Selon les premières estimations, combien de décès supplémentaires sont liés aux chaleurs ?", "plus de 7 300", ["environ 730", "plus de 73 000"], "« plus de 7 300 décès supplémentaires sont liés aux épisodes de chaleur »."),
      q("Pourquoi la chaleur de la nuit est-elle particulièrement dangereuse ?", "Le corps ne parvient pas à récupérer.", ["Les hôpitaux ferment pendant la nuit.", "On boit moins d'eau quand on dort."], "« c'est justement la nuit que le corps a besoin de récupérer : quand la température ne redescend pas, la fatigue s'accumule »."),
      v("Malgré la chaleur, l'usage de l'eau n'a été limité dans aucun département.", false, "des dizaines de départements ont dû limiter l'usage de l'eau"),
      q("Selon les experts, faut-il choisir entre réduire les émissions et s'adapter ?", "Non, les deux sont nécessaires.", ["Oui, il faut d'abord s'adapter.", "Oui, réduire les émissions suffit."], "« Les deux efforts ne s'opposent pas »: thích nghi mà không giảm phát thải là « courir derrière un problème qui ne cesse de grandir »."),
    ],
  };

  return { CO: [CO1, CO2], CE: [CE1, CE2] };
}
