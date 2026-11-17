/* Lô 55 (17/11/2026): NỘI DUNG « DELF B1 · Đề 2 » NÂNG ĐỘ KHÓ, hai bài do máy soạn ở lô 14 (Nghe
 * « le covoiturage », Đọc « la semaine de quatre jours »). Hai bài giáo viên tự soạn của đề (id `mr…`,
 * audio thật, bảng tick) KHÔNG đụng tới. Giữ chủ đề và số câu, viết lại văn bản, kịch bản, câu hỏi.
 * Mọi nhân vật, công ty, số liệu là hư cấu. Không dùng dấu gạch dài (quy tắc 7). */

export function noiDung({ q, p, d }) {
  const RADIO = "Parle en français de France comme une animatrice de radio : débit naturel et rapide, ton vivant, sans ralentir pour des apprenants.";
  const JUL = "Parle en français de France comme un jeune entrepreneur interviewé à la radio : débit rapide, enthousiaste, quelques hésitations.";
  const CLA = "Parle en français de France comme une auditrice qui intervient par téléphone à la radio : débit naturel, spontané, ton souriant.";

  const CO1 = {
    id: "b1d2mv268e3y00h",
    gioiThieu: "Vous écoutez une émission de radio sur les déplacements domicile-travail.",
    doan: [
      d("sage", RADIO, "Bonjour à tous et bienvenue dans « Ville en mouvement ». Aujourd'hui, on parle de ces trajets domicile-travail que beaucoup d'entre vous font seuls, matin et soir. Avec nous, Julien Martin, qui a lancé il y a trois ans une application de covoiturage dans la région lyonnaise. Julien, au départ, c'était quoi, le déclic ?"),
      d("echo", JUL, "Le déclic, c'est un embouteillage, tout simplement ! Je passais plus d'une heure par jour seul dans ma voiture. Et un matin, à un feu rouge, je me suis rendu compte que la voiture d'à côté, c'était celle de mon voisin du troisième, qui allait, euh, exactement dans la même zone d'activité que moi. On se croisait tous les jours dans l'escalier, et on ne s'était jamais posé la question. C'est parti de là."),
      d("sage", RADIO, "Et aujourd'hui, qui sont vos utilisateurs ?"),
      d("echo", JUL, "On a environ douze mille inscrits. Ce ne sont pas tellement des étudiants, contrairement à ce qu'on pourrait croire, mais surtout des salariés de grandes entreprises installées en banlieue, là où les transports en commun sont rares. Le passager paie quatre-vingts centimes pour dix kilomètres, et tout l'argent va au conducteur. Nous, on ne prend rien sur les trajets : ce sont les entreprises qui paient un abonnement, parce que ça les aide à résoudre leurs problèmes de parking. Et puis, il faut le dire, ça fait aussi moins de voitures sur la route, donc moins de pollution."),
      d("sage", RADIO, "On a une auditrice en ligne. Claire, vous utilisez l'application ?"),
      d("nova", CLA, "Oui, depuis un an. Au début, c'était vraiment pour l'argent : je fais quarante kilomètres matin et soir, alors je gagne à peu près cent euros par mois en prenant deux collègues. Mais honnêtement, aujourd'hui, ce n'est plus ça qui compte le plus. On discute, on rigole, on s'entraide. Le vendredi, on s'arrête même parfois prendre un café ensemble. L'une d'elles est devenue une amie. Ce qui est moins drôle, par contre, c'est quand une réunion se termine tard et qu'on rate son retour. Les premières fois, j'étais un peu angoissée."),
      d("echo", JUL, "C'est la vraie limite du covoiturage, la flexibilité. C'est pour ça qu'on a signé un accord avec les taxis de la ville : si vous êtes bloqué, votre retour est remboursé, dans la limite de deux fois par mois. Et franchement, très peu de gens l'utilisent : savoir que la solution existe suffit souvent à rassurer."),
    ],
    cau: [
      q("Qu'est-ce qui a donné l'idée à Julien ?", "Il a vu que son voisin faisait le même trajet.", ["Son entreprise lui a demandé de trouver une solution.", "Il ne pouvait plus payer l'essence de sa voiture."], "« la voiture d'à côté, c'était celle de mon voisin du troisième, qui allait, euh, exactement dans la même zone d'activité que moi »."),
      q("Que dit Julien à propos de son voisin ?", "Ils n'avaient jamais pensé à partager la voiture.", ["Ils travaillaient dans la même entreprise.", "Ils faisaient déjà du covoiturage le week-end."], "« On se croisait tous les jours dans l'escalier, et on ne s'était jamais posé la question »."),
      q("Qui utilise surtout l'application ?", "des salariés qui travaillent en banlieue", ["des étudiants des universités lyonnaises", "des habitants du centre-ville"], "« Ce ne sont pas tellement des étudiants », mà « surtout des salariés de grandes entreprises installées en banlieue »."),
      q("Pourquoi les entreprises paient-elles un abonnement ?", "Cela réduit leurs difficultés de stationnement.", ["La loi les oblige à le faire.", "Elles touchent une partie du prix des trajets."], "« ça les aide à résoudre leurs problèmes de parking »."),
      q("Combien Claire gagne-t-elle environ grâce au covoiturage ?", "100 euros par mois", ["40 euros par mois", "100 euros par semaine"], "« je gagne à peu près cent euros par mois en prenant deux collègues ». 40 là số ki-lô-mét."),
      q("Aujourd'hui, qu'est-ce qui compte le plus pour Claire ?", "la relation avec ses collègues", ["l'argent qu'elle économise", "le temps gagné sur la route"], "« aujourd'hui, ce n'est plus ça qui compte le plus. On discute, on rigole, on s'entraide »."),
      q("Quelle difficulté Claire évoque-t-elle ?", "rater son retour après une réunion", ["trouver des passagers le matin", "partager les frais d'essence avec des inconnus"], "« quand une réunion se termine tard et qu'on rate son retour »."),
      q("Selon Julien, l'accord avec les taxis…", "rassure les gens, même s'ils s'en servent peu.", ["coûte beaucoup trop cher à son entreprise chaque mois.", "est utilisé tous les jours par les passagers."], "« très peu de gens l'utilisent : savoir que la solution existe suffit souvent à rassurer »."),
    ],
    phanTich: { loai: "Émission de radio avec un invité et une auditrice", chu_de: "Le covoiturage pour aller au travail", y_chinh: "Le créateur d'une application de covoiturage raconte d'où vient son idée et comment elle fonctionne (prix, abonnement des entreprises). Une utilisatrice explique que l'argent l'a d'abord motivée, puis que la relation avec ses collègues compte davantage ; la principale limite reste la flexibilité." },
  };

  const CE1 = {
    id: "b1d2mv268e3y00i", toiThieu: 430,
    consigne: "<p>Vous lisez cet article dans un magazine. Lisez le document puis répondez aux questions.</p>",
    readingText: p(
      "<strong>Travailler quatre jours par semaine : le pari d'une PME bretonne</strong>",
      "Depuis janvier, les quarante salariés de Kerlab, une entreprise de Rennes qui fabrique du matériel de laboratoire, ne travaillent plus le vendredi. Leur salaire, lui, n'a pas bougé d'un euro. « Nous n'avons pas réduit le temps de travail : nous avons gardé 35 heures, mais réparties sur quatre jours au lieu de cinq », précise la directrice, Anne Le Goff, qui tient à corriger une idée reçue. La semaine de quatre jours, rappelle-t-elle, ne signifie pas forcément travailler moins. Une décision qui, il y a encore quelques années, aurait semblé impensable dans une entreprise de cette taille.",
      "L'idée n'est pas venue de la direction, mais d'une enquête interne menée l'an dernier. Plus de la moitié des employés s'y disaient fatigués, et beaucoup passaient plus d'une heure par jour dans les transports. « Supprimer un jour de trajet, c'était déjà un vrai cadeau, sans même parler du reste », raconte Thomas, technicien, qui habite à quarante kilomètres de l'entreprise.",
      "Six mois plus tard, le bilan est plutôt encourageant. Les absences pour maladie ont baissé de 30 % et l'entreprise reçoit trois fois plus de candidatures qu'auparavant, un atout précieux dans un secteur où il est difficile de recruter. La production, elle, n'a ni augmenté ni diminué, ce que la direction considère comme une réussite : il s'agissait avant tout de prouver qu'on pouvait faire autant en quatre jours.",
      "Les clients, eux, n'ont rien remarqué, ou presque. Quelques fournisseurs se sont d'abord étonnés de ne plus pouvoir joindre les techniciens le vendredi, avant d'apprendre à anticiper leurs demandes. « On a simplement dû mieux nous organiser, et finalement, ce n'est pas plus mal », reconnaît le responsable des achats d'un laboratoire partenaire, qui avoue avoir été sceptique au début.",
      "Tout n'est pas rose pour autant. Les journées de neuf heures sont longues, surtout pour les parents qui doivent récupérer leurs enfants à l'école avant dix-huit heures. Certains ont dû réorganiser toute leur vie familiale, et deux salariés ont même demandé à revenir à l'ancien rythme, ce qui leur a été accordé. Le service client, de son côté, reste ouvert le vendredi grâce à un système de rotation : chaque salarié de ce service choisit un autre jour de repos dans la semaine.",
      "Pour Anne Le Goff, il n'est pas question de revenir en arrière. « Ce n'est pas une solution miracle, et elle ne convient pas à toutes les entreprises. Mais nos salariés sont plus motivés, et un salarié motivé travaille mieux. » Elle reconnaît toutefois que le vrai test viendra avec le temps : l'enthousiasme des débuts, prévient-elle, ne dure pas toujours.",
    ),
    cau: [
      q("Quelle idée reçue la directrice veut-elle corriger ?", "Quatre jours ne veut pas dire moins d'heures de travail.", ["Les petites entreprises ne peuvent pas changer d'horaires.", "Les salariés préfèrent toujours gagner plus d'argent."], "« La semaine de quatre jours, rappelle-t-elle, ne signifie pas forcément travailler moins »."),
      q("Avec la nouvelle organisation, le salaire des employés…", "n'a pas changé.", ["a légèrement augmenté.", "a baissé d'un cinquième."], "« Leur salaire, lui, n'a pas bougé d'un euro »."),
      q("D'où vient le projet ?", "des réponses des salariés à une enquête", ["d'une décision de la directrice seule", "d'une nouvelle loi sur le temps de travail"], "« L'idée n'est pas venue de la direction, mais d'une enquête interne »."),
      q("Pour Thomas, quel est l'avantage le plus immédiat ?", "un trajet de moins chaque semaine", ["un salaire plus élevé", "des journées plus courtes"], "« Supprimer un jour de trajet, c'était déjà un vrai cadeau »."),
      q("Pourquoi la hausse des candidatures compte-t-elle pour Kerlab ?", "Il est difficile de recruter dans son secteur.", ["Elle veut doubler le nombre de ses salariés.", "Elle doit remplacer les salariés partis."], "« un atout précieux dans un secteur où il est difficile de recruter »."),
      q("Comment la direction juge-t-elle les chiffres de la production ?", "Comme un succès, car ils sont stables.", ["Comme un échec, car ils n'ont pas augmenté.", "Comme une surprise, car ils ont beaucoup baissé."], "« La production, elle, n'a ni augmenté ni diminué, ce que la direction considère comme une réussite »."),
      q("Que s'est-il passé pour deux salariés ?", "Ils ont retrouvé la semaine de cinq jours.", ["Ils ont quitté l'entreprise.", "Ils ont été envoyés au service client le vendredi."], "« deux salariés ont même demandé à revenir à l'ancien rythme, ce qui leur a été accordé »."),
      q("Quelle réserve la directrice exprime-t-elle à la fin ?", "La motivation pourrait baisser avec le temps.", ["Les clients se plaignent du vendredi.", "La production risque de chuter cet hiver."], "« l'enthousiasme des débuts, prévient-elle, ne dure pas toujours »."),
    ],
  };

  return { CO: [CO1], CE: [CE1] };
}
