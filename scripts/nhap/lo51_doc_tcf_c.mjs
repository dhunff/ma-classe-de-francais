/* Lô 51 (16/11/2026), phần C: TCF-CE-5 « Giữ nhịp 39 câu trong 60 phút ». Bài này là đề Đọc TCF thu nhỏ:
 * 12 câu khó dần, 2 câu mỗi mức A1 đến C2, giới hạn 18 phút (nhịp 60 phút cho 39 câu của đề thật).
 * Cùng khuôn với lo51_doc_tcf_a.mjs. Nội dung hư cấu, FRACILE soạn. */

export const phanC = ({ doc }) => [
  {
    ma: "TCF-CE-5", vong: "chot", tieuDe: "Lecture TCF : mini-test en 12 questions", phut: 18,
    cau: [
      /* A1 */
      doc(["<strong>CAFÉ DES AMIS</strong>", "Ouvert tous les jours de 7 h à 22 h.", "Fermé le 25 décembre."],
        "Quel jour le café est-il fermé ?", "Le 25 décembre.", ["Le dimanche.", "Le lundi.", "Le 22 décembre."],
        "Biển ghi « Fermé le 25 décembre ». Ngoài ra quán mở « tous les jours »."),
      doc(["Maman,", "Je dors chez Lisa ce soir. Je rentre demain matin avant l'école.", "Bisous, Emma"],
        "Où Emma dort-elle ce soir ?", "Chez une amie.", ["À la maison.", "À l'école.", "Chez sa grand-mère."],
        "Emma viết « Je dors chez Lisa ce soir »."),
      /* A2 */
      doc(["<strong>Cours de yoga</strong>", "Le cours du jeudi soir est déplacé au vendredi, même heure, même salle, pendant tout le mois de mai."],
        "Qu'est-ce qui change en mai ?", "Le jour du cours.", ["L'heure du cours.", "La salle du cours.", "Le professeur."],
        "Lớp chuyển « au vendredi, même heure, même salle »: chỉ đổi ngày."),
      doc(["Bonjour Monsieur Petit,", "Votre voiture est réparée. Vous pouvez venir la chercher à partir de demain 14 h. Attention, le garage ferme à 18 h.", "Garage Martin"],
        "Quand Monsieur Petit peut-il récupérer sa voiture ?", "Demain après-midi.", ["Aujourd'hui avant 18 h.", "Demain matin.", "Après-demain."],
        "Garage báo « à partir de demain 14 h », và đóng cửa lúc 18 h."),
      /* B1 */
      doc(["<strong>Objet :</strong> abonnement à la salle de sport", "Madame, Monsieur,", "Je déménage à Nantes le mois prochain et je ne pourrai plus venir à votre salle. Je souhaite donc mettre fin à mon abonnement à partir du 1er mars.", "Paul Renard"],
        "Que demande Paul Renard ?", "D'arrêter son abonnement.", ["De changer de salle à Nantes.", "De payer moins cher.", "De commencer un abonnement en mars."],
        "Anh viết « Je souhaite donc mettre fin à mon abonnement »."),
      doc(["<strong>Une ferme en pleine ville</strong>", "Sur le toit d'un ancien parking, une association cultive des légumes vendus chaque samedi aux habitants du quartier. Le projet emploie aussi des personnes en recherche d'emploi, formées au maraîchage."],
        "Quel est l'un des objectifs du projet ?", "Aider des personnes à trouver du travail.", ["Construire un nouveau parking.", "Vendre des légumes aux restaurants du centre-ville chaque samedi.", "Former des étudiants en agriculture."],
        "Dự án « emploie aussi des personnes en recherche d'emploi »."),
      /* B2 */
      doc(["Les bibliothèques ont-elles encore un avenir à l'heure d'Internet ? La question revient souvent. Elle oublie que les bibliothèques ne servent plus seulement à prêter des livres : on y vient pour travailler au calme, se faire aider dans des démarches administratives ou simplement rompre la solitude. Leur fréquentation, d'ailleurs, ne baisse pas."],
        "Selon l'auteur, les bibliothèques…", "Ont élargi leur rôle.", ["Vont bientôt disparaître.", "Prêtent de moins en moins de livres.", "Sont remplacées par Internet."],
        "Thư viện « ne servent plus seulement à prêter des livres » và lượng người đến « ne baisse pas »."),
      doc(["On présente souvent la voiture électrique comme la solution miracle à la pollution. C'est aller un peu vite. Si elle ne rejette rien en roulant, sa fabrication, et en particulier celle de la batterie, consomme beaucoup d'énergie et de métaux rares. Elle est un progrès, à condition de rouler moins, pas seulement autrement."],
        "Quelle est la position de l'auteur sur la voiture électrique ?", "Elle est utile si l'on réduit aussi ses déplacements.", ["Elle ne pollue pas du tout.", "Elle pollue davantage que la voiture à essence sur toute sa vie.", "Elle doit être interdite."],
        "Tác giả nói đó là tiến bộ « à condition de rouler moins, pas seulement autrement »."),
      /* C1 */
      doc(["On confond volontiers l'ennui avec le vide. Or l'ennui est peut-être la condition même de la création : c'est lorsque rien ne nous occupe que l'esprit se met à vagabonder, à associer des idées éloignées. En remplissant chaque minute libre par un écran, nous ne supprimons pas seulement l'ennui ; nous nous privons de l'espace où naissent les idées neuves."],
        "Que reproche l'auteur à l'usage constant des écrans ?", "Il empêche l'esprit de produire des idées.", ["Il rend les gens plus ennuyeux.", "Il fait perdre la mémoire des choses apprises à l'école.", "Il crée trop d'idées inutiles."],
        "Dùng màn hình mọi lúc rảnh làm ta « nous nous privons de l'espace où naissent les idées neuves »."),
      doc(["<em>Extrait d'un roman</em>", "Il avait promis d'écrire chaque semaine. Les premières lettres furent longues, pleines de détails sur la ville et le travail. Puis elles raccourcirent, s'espacèrent. La dernière tenait en trois lignes et parlait du temps qu'il faisait. Elle la relut plusieurs fois, comme on cherche, dans un silence, ce qu'il ne dit pas."],
        "Que comprend-on de la relation entre les deux personnages ?", "Elle s'éloigne peu à peu.", ["Elle devient plus forte.", "Elle commence à peine.", "Elle reste toujours la même."],
        "Thư ngắn dần, thưa dần (« elles raccourcirent, s'espacèrent ») và lá cuối chỉ nói chuyện thời tiết: hai người xa nhau dần."),
      /* C2 */
      doc(["Toute mémoire collective est sélective : une nation se souvient de ce qui la grandit et oublie volontiers ce qui la dérange. Prétendre corriger cet oubli en multipliant les commémorations serait illusoire ; on ne décrète pas le souvenir. C'est par l'enseignement patient de l'histoire, dans ce qu'elle a de complexe et d'inconfortable, qu'une société apprend à se regarder en face."],
        "Que rejette l'auteur ?", "L'idée que les cérémonies suffisent à entretenir la mémoire.", ["L'enseignement de l'histoire.", "L'idée que la mémoire collective est sélective.", "Le souvenir des événements dérangeants."],
        "Tác giả nói nhân nhiều lễ tưởng niệm « serait illusoire ; on ne décrète pas le souvenir »."),
      doc(["Le paradoxe de la transparence est qu'elle peut produire l'opacité. À force d'exiger que tout soit publié, rapports, chiffres, comptes rendus, on noie l'information essentielle sous une masse de documents que personne ne lit. La véritable transparence ne consiste pas à tout montrer, mais à rendre compréhensible ce qui compte."],
        "Quel paradoxe l'auteur décrit-il ?", "Trop d'informations publiées rend la vérité moins visible.", ["Les documents publiés sont souvent faux.", "Personne ne veut publier de chiffres.", "La transparence oblige les institutions à cacher certaines informations."],
        "Đòi công bố mọi thứ khiến « on noie l'information essentielle sous une masse de documents que personne ne lit »."),
    ],
    tu: ["mettre fin à : chấm dứt", "le maraîchage : nghề trồng rau", "vagabonder (verbe) : lang thang (ý nghĩ)", "s'espacer (verbe) : thưa dần", "décréter (verbe) : ra lệnh, áp đặt", "l'opacité (nom féminin) : sự mù mờ"],
    meo: ["12 câu trong 18 phút: hai câu đầu mỗi mức nên xong dưới một phút để dành giờ cho C1, C2.", "TCF không trừ điểm câu sai: hết giờ mà chưa chắc thì vẫn chọn một đáp án."],
  },
];
