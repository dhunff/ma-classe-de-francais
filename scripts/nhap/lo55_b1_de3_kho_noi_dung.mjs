/* Lô 55 (17/11/2026): NỘI DUNG « DELF B1 · Đề 3 » NÂNG ĐỘ KHÓ. Giữ chủ đề và khung câu của lô 18.
 * Nghe 1, Nghe 2, Đọc 1: viết lại dài hơn, câu hỏi về ý và lập luận.
 * Đọc 2 là ĐOẠN TRÍCH THẬT (Anne Cordier, The Conversation, 21/07/2025): GIỮ NGUYÊN văn bản, lấy thẳng
 * từ lo18_noi_dung.mjs (không chép tay, không sửa một chữ), chỉ viết lại câu hỏi cho khó hơn.
 * Không dùng dấu gạch dài (quy tắc 7). */
import { B1 as CU } from "./lo18_noi_dung.mjs";

export function noiDung({ q, v, p, d, bang }) {
  const RADIO = "Parle en français de France comme un journaliste de radio locale en reportage : débit naturel et vivant, sans ralentir pour des apprenants.";
  const NATH = "Parle en français de France comme une bénévole enthousiaste interviewée à la radio : débit naturel et rapide, quelques hésitations.";
  const AMAN = "Parle en français de France comme une jeune femme qui raconte une anecdote au micro : débit rapide, spontané, ton amusé.";
  const CHEF = "Parle en français de France comme une responsable d'équipe qui laisse un message vocal à ses collègues : débit assez rapide, ton direct et professionnel.";

  const CO1 = {
    id: "lo18mv42gdao04l",
    gioiThieu: "Vous écoutez une émission de radio locale.",
    doan: [
      d("sage", RADIO, "Dans notre rubrique « Près de chez vous », nous avons passé la matinée au repair café de la maison de quartier des Tilleuls. Il y a du monde, des outils partout, une odeur de café. Nathalie, vous êtes l'une des fondatrices. Pour ceux qui ne connaissent pas, comment ça marche ?"),
      d("shimmer", NATH, "Alors, le principe est très simple. Le premier samedi du mois, les habitants viennent avec un objet en panne : un grille-pain, une lampe, un vélo, un pantalon dont la fermeture est cassée. Et des bénévoles, souvent des retraités qui étaient électriciens, couturières ou mécaniciens, les aident à le réparer. C'est gratuit. Mais, euh, attention, ce n'est pas un atelier où on dépose son objet et où on revient le chercher. On n'est pas un service de réparation. Les gens restent, ils démontent, ils regardent, ils tiennent le tournevis. L'idée, c'est qu'ils repartent en sachant faire quelque chose qu'ils ne savaient pas faire en arrivant."),
      d("sage", RADIO, "Amandine, vous êtes venue avec un grille-pain, c'est ça ?"),
      d("nova", AMAN, "Oui ! Il ne chauffait plus que d'un côté. Honnêtement, j'allais le jeter et en racheter un, ça coûte vingt euros. Une amie m'a dit d'essayer ici, alors je me suis dit : pourquoi pas ? Le monsieur qui m'a aidée m'a montré qu'un fil s'était simplement détaché. Vingt minutes, et c'était réglé. Ce qui m'a surprise, c'est qu'il ne voulait absolument pas le faire à ma place. Sur le moment, ça m'a un peu agacée, je l'avoue, mais en fait, maintenant, je sais ouvrir un appareil sans avoir peur."),
      d("sage", RADIO, "Nathalie, vous réussissez à tout réparer ?"),
      d("shimmer", NATH, "Ah non, loin de là ! On répare à peu près deux objets sur trois. Pour les autres, on prend le temps d'expliquer pourquoi ce n'est pas possible : souvent, c'est une pièce qui n'existe plus, ou un appareil fabriqué pour ne pas être ouvert. Et ça, les gens s'en souviennent au moment d'acheter le suivant. Et puis il y a le café et les gâteaux. Beaucoup de gens viennent aussi pour discuter, surtout des personnes seules. Notre vrai problème aujourd'hui, c'est qu'il nous manque des bénévoles pour les téléphones et les ordinateurs. On a des files d'attente énormes pour les écrans cassés. Alors si vous savez faire ça, même un peu, venez nous voir, on vous accueillera avec plaisir !"),
    ],
    cau: [
      q("Pourquoi, selon Nathalie, le repair café n'est-il pas un service de réparation ?", "Les visiteurs réparent eux-mêmes, avec de l'aide.", ["Les bénévoles acceptent seulement les objets électriques récents.", "Il faut payer les pièces à l'avance."], "« Les gens restent, ils démontent, ils regardent, ils tiennent le tournevis »: khách tự sửa với sự giúp đỡ."),
      q("Quel est l'objectif principal de l'atelier ?", "transmettre un savoir-faire", ["vendre des objets d'occasion", "réduire les déchets du quartier"], "« L'idée, c'est qu'ils repartent en sachant faire quelque chose qu'ils ne savaient pas faire en arrivant »."),
      q("Avant de venir, qu'avait prévu Amandine ?", "acheter un nouveau grille-pain", ["le faire réparer en magasin", "le donner à une amie"], "« j'allais le jeter et en racheter un »."),
      q("D'où venait la panne du grille-pain ?", "d'un fil détaché", ["d'une pièce introuvable", "d'un défaut de fabrication"], "« un fil s'était simplement détaché »."),
      q("Comment Amandine juge-t-elle l'attitude du bénévole ?", "D'abord agacée, elle en voit l'intérêt.", ["Elle l'a trouvé trop lent et trop bavard.", "Elle préfère revenir le mois suivant."], "« Sur le moment, ça m'a un peu agacée », nhưng giờ « je sais ouvrir un appareil sans avoir peur »."),
      q("Pourquoi Nathalie prend-elle le temps d'expliquer les échecs ?", "Cela aide les gens à mieux choisir leurs prochains achats.", ["Cela permet d'éviter les plaintes et les réclamations des visiteurs.", "C'est obligatoire pour l'assurance."], "« les gens s'en souviennent au moment d'acheter le suivant »."),
      q("De quoi le repair café a-t-il le plus besoin ?", "de bénévoles qui savent réparer les écrans", ["de dons d'argent pour acheter des outils", "d'une salle plus grande pour recevoir le public"], "« il nous manque des bénévoles pour les téléphones et les ordinateurs », « des files d'attente énormes pour les écrans cassés »."),
    ],
    phanTich: { loai: "Reportage radio avec interviews", chu_de: "Un repair café de quartier", y_chinh: "Une fondatrice explique que le repair café n'est pas un service de réparation mais un lieu où l'on apprend à réparer soi-même. Une visiteuse raconte comment elle a appris à réparer son grille-pain. L'atelier manque surtout de bénévoles pour les téléphones et les ordinateurs." },
  };

  const CO2 = {
    id: "lo18mv42gok004m",
    gioiThieu: "Vous travaillez dans une entreprise. Vous écoutez un message de votre responsable.",
    doan: [
      d("coral", CHEF, "Bonjour à tous, c'est Hélène. Je vous laisse ce message parce que je suis en déplacement jusqu'à jeudi et que plusieurs choses changent la semaine prochaine. D'abord, la réunion d'équipe du lundi est déplacée au mardi, à la même heure, neuf heures. Elle n'aura pas lieu dans la grande salle, qui est en travaux, mais en salle trois, au deuxième étage. Comme la salle est plus petite, ceux qui le souhaitent pourront suivre la réunion en visioconférence ; le lien vous sera envoyé lundi soir. Je vous demande de préparer chacun un bilan de vos projets en cours, mais court : cinq minutes maximum, pas de longue présentation, on a beaucoup de choses à voir. Autre point important : à partir du premier novembre, le télétravail passe de un à deux jours par semaine. Les jours ne seront pas les mêmes pour tout le monde : vous les choisirez avec votre chef d'équipe, pour qu'il reste toujours quelqu'un au bureau. Pour toute question urgente pendant mon absence, adressez-vous à Marc. Il est joignable toute la semaine sur son portable. Bonne journée à tous !"),
    ],
    cau: [
      q("Pourquoi Hélène laisse-t-elle un message ?", "Elle est absente jusqu'à jeudi.", ["Elle quitte bientôt l'entreprise.", "Elle est malade depuis lundi."], "« je suis en déplacement jusqu'à jeudi »."),
      q("Comment peut-on participer à la réunion sans être dans la salle ?", "en la suivant à distance", ["en envoyant son bilan par écrit", "en regardant un enregistrement"], "« ceux qui le souhaitent pourront suivre la réunion en visioconférence »."),
      q("Qu'est-ce qu'Hélène demande pour le bilan ?", "qu'il soit bref", ["qu'il soit envoyé avant lundi", "qu'il comporte des images"], "« mais court : cinq minutes maximum, pas de longue présentation »."),
      q("Qu'est-ce qui change au 1er novembre ?", "On aura un jour de télétravail en plus.", ["Le télétravail devient obligatoire le lundi.", "Le bureau ferme deux jours par semaine."], "« le télétravail passe de un à deux jours par semaine »."),
      q("Pourquoi les jours de télétravail sont-ils choisis avec le chef d'équipe ?", "pour que le bureau ne soit jamais vide", ["pour réduire les frais de transport", "pour respecter une nouvelle loi"], "« pour qu'il reste toujours quelqu'un au bureau »."),
    ],
    phanTich: { loai: "Message vocal professionnel", chu_de: "Changements dans l'organisation d'une équipe", y_chinh: "Une responsable absente annonce le déplacement de la réunion au mardi en salle trois (avec possibilité de visioconférence), demande des bilans courts, et explique le passage à deux jours de télétravail, choisis avec le chef d'équipe." },
  };

  const CE1 = {
    id: "lo18mv42gok004n",
    consigne: p("Vous travaillez à plein temps et vous voulez suivre un cours pour vous détendre et apprendre quelque chose de nouveau. Vous choisissez le cours en fonction des critères suivants :", "• cours le soir ou le week-end ;<br>• moins de 100 € au total ;<br>• petit groupe (10 personnes maximum) ;<br>• possibilité d'essayer avant de s'inscrire.", "Vous comparez ces quatre annonces. Pour chaque annonce, cochez (☒) OUI si cela correspond au critère ou NON si cela ne correspond pas."),
    readingText: "",
    cau: [
      bang("Pour chaque annonce, cochez OUI ou NON.", [
        { titre: "Atelier de photographie", texte: p("Envie de réussir enfin vos photos ? Notre atelier vous apprend à maîtriser la lumière et le cadrage avec votre propre appareil. Les séances ont lieu le mardi de 19 h à 21 h, après le travail. Le cycle de dix séances coûte 120 €, matériel non compris. Pour que chacun puisse poser ses questions, nous accueillons huit participants au maximum. Attention : l'inscription se fait pour le cycle complet, sans séance de découverte.") },
        { titre: "Cours de cuisine du monde", texte: p("Chaque mois, un pays à l'honneur : le Maroc en septembre, le Japon en octobre. Le cours a lieu le samedi matin, de 9 h 30 à midi, dans la cuisine de la maison de quartier. Vous cuisinez dans des groupes de douze personnes et vous repartez avec vos plats. Prix : 25 € la séance, ou 90 € pour les quatre séances du trimestre. La première séance peut être réservée seule : si elle ne vous plaît pas, vous ne vous engagez pas pour la suite.") },
        { titre: "Espagnol pour débutants", texte: p("Apprenez l'espagnol en douceur avec une professeure native. Les cours se déroulent en ligne le lundi et le jeudi, de 12 h 15 à 13 h, pendant la pause-déjeuner. Les classes réunissent cinq élèves au maximum, ce qui permet de beaucoup parler. Le trimestre coûte 85 €. Un premier cours gratuit est proposé à toute personne qui le souhaite, sans obligation de s'inscrire ensuite.") },
        { titre: "Théâtre d'improvisation", texte: p("Vous êtes timide ? Le théâtre d'improvisation est fait pour vous. Rendez-vous le mercredi à 20 h, salle Molière, pour deux heures de jeux et d'exercices. Nos groupes comptent entre quinze et vingt comédiens amateurs, pour que les scènes soient variées. L'adhésion annuelle est de 150 €, payable en trois fois. Venez assister gratuitement à une séance en septembre avant de vous décider !") },
      ], ["Horaires", "Prix", "Groupe", "Essai"], ["ONON", "OONO", "NOOO", "ONNO"],
      "Photographie: « le mardi de 19 h à 21 h » (OUI), « 120 € » (NON), « huit participants au maximum » (OUI), « sans séance de découverte » (NON). Cuisine: « le samedi matin » (OUI), « 90 € pour les quatre séances » (OUI), « groupes de douze personnes » (NON), « La première séance peut être réservée seule » (OUI). Espagnol: « de 12 h 15 à 13 h, pendant la pause-déjeuner » (NON), « Le trimestre coûte 85 € » (OUI), « cinq élèves au maximum » (OUI), « Un premier cours gratuit » (OUI). Théâtre: « le mercredi à 20 h » (OUI), « 150 € » (NON), « entre quinze et vingt comédiens » (NON), « assister gratuitement à une séance » (OUI)."),
    ],
  };

  const CE2 = {
    id: "lo18mv42gok004o",
    consigne: "<p>Lisez l'article puis répondez aux questions.</p>",
    readingText: CU.CE[1].readingText, giuVanBan: true,
    cau: [
      q("Quelle situation l'article décrit-il au début ?", "Des jeunes toujours connectés qui ne décrochent pas.", ["Des parents qui refusent de donner un téléphone à leurs enfants.", "Des adolescents qui n'ont plus de forfait téléphonique."], "« Les adolescents ont un téléphone greffé à la main… mais ne répondent pas quand on les appelle »."),
      v("Chez les adolescents, l'appel vocal reste le moyen de communication habituel.", false, "Chez les adolescents, l’appel vocal n’est plus le canal par défaut"),
      q("Dans quel cas un adolescent accepte-t-il encore d'appeler ?", "quand il a besoin d'être rassuré tout de suite", ["quand il doit organiser une sortie avec plusieurs amis", "quand il n'a plus de batterie"], "Cuộc gọi dành cho « situations urgentes, moments d’angoisse, besoin d’un réconfort immédiat »."),
      q("D'après l'auteure, pourquoi les adolescents préfèrent-ils écrire ?", "L'écrit leur laisse le temps de choisir leurs mots.", ["Les appels coûtent plus cher que les messages écrits.", "Ils sont trop paresseux pour parler."], "« Non pas par paresse », mà vì « On peut formuler, reformuler, supprimer, différer »."),
      v("Répondre tout de suite au téléphone peut donner aux adolescents l'impression de perdre le contrôle.", true, "cette immédiateté est perçue comme un stress, une perte de contrôle"),
      q("Que montre le « petit rituel » cité dans l'article ?", "Il est poli de demander avant d'appeler.", ["Ils n'aiment plus parler à leurs amis.", "Ils utilisent Snapchat seulement pour jouer."], "« sonder l’autre avant de se lancer dans un appel, devient une preuve de respect »."),
      q("Que propose l'auteure aux familles ?", "discuter des préférences de chacun", ["interdire les messages pendant les repas", "obliger les adolescents à répondre à tous les appels"], "« une discussion franche et tranquille sur les préférences de chacun en matière de communication »."),
      q("Comment l'auteure voit-elle ce « silence téléphonique » ?", "comme une occasion de changer nos habitudes", ["comme le signe d'une crise grave", "comme un simple caprice d'adolescent"], "« pourquoi ne pas y lire une occasion de réinventer nos façons de se parler ? »."),
    ],
  };

  return { CO: [CO1, CO2], CE: [CE1, CE2] };
}
