/* Lô 55 (17/11/2026): NỘI DUNG « DELF B1 · Đề 5 » NÂNG ĐỘ KHÓ (chủ đề sức khoẻ tinh thần của người trẻ).
 * Giữ chủ đề và khung câu của lô 22, viết lại văn bản, kịch bản, câu hỏi.
 * Bài báo (Đọc 2) soạn TỪ NGUỒN THẬT: giữ nguyên mọi dữ kiện, con số và dòng ghi nguồn của bản cũ,
 * KHÔNG thêm dữ kiện mới; phần dài thêm chỉ là lập luận nêu chung. Không dùng dấu gạch dài (quy tắc 7). */

export function noiDung({ q, v, p, d, bang }) {
  const RADIO = "Parle en français de France comme un animateur de radio étudiante : débit naturel et rapide, ton chaleureux, sans ralentir pour des apprenants.";
  const INES = "Parle en français de France comme une étudiante bénévole interviewée à la radio : débit naturel, spontané, quelques hésitations.";
  const KARIM = "Parle en français de France comme un jeune étudiant qui raconte un souvenir personnel : débit naturel, un peu hésitant, ton sincère.";
  const MUT = "Parle en français de France comme un message enregistré de mutuelle : débit assez rapide, ton professionnel et neutre.";
  const nguon = (...ds) => `<p><small><em>Texte rédigé par FRACILE à partir de : ${ds.join(" ; ")}.</em></small></p>`;

  const CO1 = {
    id: "lo22mvemxpdq02a",
    gioiThieu: "Vous écoutez une émission de radio étudiante.",
    doan: [
      d("sage", RADIO, "Bienvenue dans « Campus Info ». Aujourd'hui, on parle d'une ligne d'écoute un peu particulière, puisqu'elle a été créée par des étudiants, pour des étudiants. Inès, vous êtes en master de sociologie et vous êtes bénévole depuis deux ans. Comment ça fonctionne, exactement ?"),
      d("nova", INES, "Alors, c'est un numéro qu'on peut appeler tous les soirs, de vingt et une heures à deux heures du matin. Au bout du fil, ce sont des étudiants, comme moi, qui répondent. Mais attention, on n'improvise pas : on a tous suivi une formation de trente heures avec des psychologues, et on continue à se retrouver une fois par mois pour parler des appels difficiles. Ce qu'il faut bien comprendre, c'est qu'on n'est pas là pour soigner. On écoute, sans juger, et si on sent que la personne a besoin de plus, on l'oriente vers un professionnel."),
      d("sage", RADIO, "Pourquoi uniquement le soir ?"),
      d("nova", INES, "Parce que c'est là que, euh, les choses deviennent lourdes. La journée, il y a les cours, les copains, on est occupé. Le soir, quand on vient d'arriver dans une ville où on ne connaît personne, on se retrouve seul dans une chambre de neuf mètres carrés, et c'est là que les angoisses remontent. Et puis, il faut le dire, la nuit, tout paraît plus grave qu'en plein jour."),
      d("sage", RADIO, "Karim, vous, vous avez appelé cette ligne l'an dernier."),
      d("ash", KARIM, "Oui. J'étais en première année, loin de ma famille, et je n'arrivais plus à dormir avant les partiels. J'ai hésité pendant des semaines, franchement. Je me disais : il y a sûrement des gens qui vont plus mal que moi, je vais prendre la place de quelqu'un. Finalement, j'ai appelé un soir vers une heure du matin. Je me sentais un peu ridicule au début, je ne savais pas quoi dire. Et puis on a parlé presque quarante minutes. Ça n'a pas tout réglé, hein, mais le lendemain, j'ai pris rendez-vous avec le service de santé de la fac, ce que je repoussais depuis le début de l'année."),
      d("nova", INES, "Ce que dit Karim, on l'entend tout le temps : « Je ne voulais pas déranger. » Alors on le répète : on ne dérange jamais. Et on rappelle aussi que les étudiants ont droit à des séances gratuites avec un psychologue. Beaucoup ne le savent tout simplement pas."),
    ],
    cau: [
      q("Qui répond aux appels ?", "des étudiants formés", ["des psychologues bénévoles", "des médecins de l'université"], "« ce sont des étudiants, comme moi, qui répondent », và họ đã học « une formation de trente heures avec des psychologues »."),
      q("En plus de leur formation, les bénévoles…", "font le point chaque mois sur les appels.", ["passent un examen tous les ans.", "travaillent la journée à l'hôpital."], "« on continue à se retrouver une fois par mois pour parler des appels difficiles »."),
      q("Quel est le rôle des bénévoles ?", "écouter et, si besoin, orienter", ["donner des conseils médicaux", "soigner les étudiants anxieux"], "« on n'est pas là pour soigner. On écoute, sans juger », rồi « on l'oriente vers un professionnel »."),
      q("Selon Inès, pourquoi le soir est-il un moment difficile ?", "On se retrouve seul après une journée occupée.", ["Les services de santé sont fermés.", "Les examens ont souvent lieu le soir."], "Ban ngày bận rộn, còn « Le soir, quand on vient d'arriver dans une ville où on ne connaît personne, on se retrouve seul »."),
      q("Pourquoi Karim a-t-il hésité à appeler ?", "Il pensait que d'autres en avaient plus besoin.", ["Il avait peur que sa famille l'apprenne.", "Il ne connaissait pas les horaires."], "« il y a sûrement des gens qui vont plus mal que moi, je vais prendre la place de quelqu'un »."),
      q("Qu'est-ce que l'appel a changé pour Karim ?", "Il a enfin consulté le service de santé.", ["Il a pu dormir dès le soir même.", "Il a décidé de rentrer chez ses parents."], "« le lendemain, j'ai pris rendez-vous avec le service de santé de la fac, ce que je repoussais depuis le début de l'année ». Karim nói cuộc gọi « n'a pas tout réglé »."),
      q("D'après Inès, beaucoup d'étudiants…", "ignorent une aide à laquelle ils ont droit.", ["trouvent les psychologues trop chers.", "appellent la ligne plusieurs fois par semaine."], "« les étudiants ont droit à des séances gratuites avec un psychologue. Beaucoup ne le savent tout simplement pas »."),
    ],
    phanTich: { loai: "Émission de radio avec deux invités", chu_de: "Une ligne d'écoute tenue par des étudiants", y_chinh: "Une bénévole explique le fonctionnement de la ligne (étudiants formés, écoute sans soin, orientation vers des professionnels) et pourquoi le soir est le moment le plus dur. Un ancien appelant raconte qu'il a longtemps hésité, puis que l'appel l'a poussé à consulter." },
  };

  const CO2 = {
    id: "lo22mvemxyon02b",
    gioiThieu: "Vous écoutez un message de votre mutuelle étudiante.",
    doan: [
      d("shimmer", MUT, "Bonjour, ici votre mutuelle étudiante. Ce message concerne tous nos adhérents. À partir du premier octobre, deux changements importants entrent en vigueur. D'abord, les culottes et les coupes menstruelles sont désormais remboursées pour les moins de vingt-six ans, à condition d'être achetées en pharmacie : les achats faits en supermarché ou sur Internet ne sont pas concernés. Pensez donc à garder votre ticket. Les remboursements seront versés directement sur votre compte bancaire, en général sous dix jours. Ensuite, pour le dispositif « Mon soutien psy », vous n'avez plus besoin d'avancer l'argent chez le psychologue : vous présentez simplement votre carte Vitale, comme chez un médecin. Attention, cela ne change rien au nombre de séances prises en charge. Si vous avez déjà payé une séance depuis le début du mois, vous serez remboursé normalement, il n'y a aucune démarche à faire. Nous vous rappelons enfin que votre carte d'adhérent doit être mise à jour chaque année. Pour toute question, rendez-vous sur notre site ou passez à notre accueil, ouvert du lundi au vendredi ; il sera exceptionnellement fermé le vendredi de la semaine prochaine. Bonne journée."),
    ],
    cau: [
      q("Pour être remboursées, les protections menstruelles doivent…", "être achetées en pharmacie.", ["être commandées sur Internet.", "être prescrites par un médecin."], "« à condition d'être achetées en pharmacie : les achats faits en supermarché ou sur Internet ne sont pas concernés »."),
      q("Ce remboursement concerne…", "les adhérents de moins de 26 ans.", ["toutes les adhérentes, sans condition.", "les étudiantes boursières seulement."], "« remboursées pour les moins de vingt-six ans »."),
      q("Avec « Mon soutien psy », qu'est-ce qui change ?", "On ne paie plus la séance d'avance.", ["On a droit à davantage de séances.", "Il faut désormais une ordonnance."], "« vous n'avez plus besoin d'avancer l'argent », và « cela ne change rien au nombre de séances prises en charge »."),
      q("Une personne qui a déjà payé une séance ce mois-ci…", "n'a rien à faire pour être remboursée.", ["doit envoyer sa facture à la mutuelle.", "ne sera pas remboursée de cette séance."], "« vous serez remboursé normalement, il n'y a aucune démarche à faire »."),
      q("Que dit le message sur l'accueil de la mutuelle ?", "Il sera fermé un vendredi.", ["Il ouvre aussi le samedi.", "Il est remplacé par le site."], "« il sera exceptionnellement fermé le vendredi de la semaine prochaine »."),
    ],
    phanTich: { loai: "Message enregistré", chu_de: "Deux nouveaux remboursements pour les étudiants", y_chinh: "La mutuelle annonce le remboursement des protections menstruelles achetées en pharmacie pour les moins de 26 ans et la fin de l'avance de frais pour « Mon soutien psy », sans changement du nombre de séances." },
  };

  const CE1 = {
    id: "lo22mvemxyoo02c",
    consigne: p("Vous êtes étudiant(e) et vous vous sentez très stressé(e) en période d'examens. Vous cherchez une activité pour vous détendre en fonction des critères suivants :", "• le soir, après les cours ;<br>• gratuite ;<br>• sans inscription à l'avance ;<br>• avec d'autres personnes.", "Vous comparez ces quatre annonces. Pour chaque annonce, cochez (☒) OUI si cela correspond au critère ou NON si cela ne correspond pas."),
    readingText: "",
    cau: [
      bang("Pour chaque annonce, cochez OUI ou NON.", [
        { titre: "Yoga au parc", texte: p("Le dimanche matin à 10 h, venez pratiquer le yoga en plein air avec d'autres amateurs, tous niveaux confondus. La séance est gratuite et sans inscription : il suffit d'apporter son tapis. En cas de pluie, elle est annulée et un message est publié sur la page de l'association. Après la séance, ceux qui le souhaitent prennent souvent un café ensemble au kiosque du parc.") },
        { titre: "Groupe de parole étudiant", texte: p("Le jeudi à 19 h, à la maison des étudiants, une psychologue anime un temps d'échange sur le stress et la solitude. Les groupes sont limités à huit personnes et l'inscription est obligatoire une semaine avant. La participation est gratuite pour les étudiants, sur présentation de la carte. Ce qui se dit pendant la séance reste confidentiel, et personne n'est obligé de prendre la parole.") },
        { titre: "Piscine du campus", texte: p("La piscine du campus ouvre ses bassins aux étudiants du lundi au vendredi, de 12 h à 14 h. L'entrée coûte 2 €, sans réservation : présentez simplement votre carte d'étudiant à l'accueil. Les nageurs pratiquent chacun dans leur couloir, en silence. Des serviettes et des bonnets de bain sont en vente à l'accueil pour ceux qui les ont oubliés.") },
        { titre: "Chorale du quartier", texte: p("Chaque lundi à 20 h, une trentaine d'habitants se retrouvent à la salle des fêtes pour chanter ensemble. Aucun niveau n'est demandé et vous pouvez venir à n'importe quelle répétition sans prévenir. L'adhésion coûte 40 € pour l'année, partitions comprises. Deux concerts sont donnés chaque année, mais personne n'est obligé d'y participer, et les débutants sont toujours bien accueillis par les anciens.") },
      ], ["Horaires", "Prix", "Inscription", "Groupe"], ["NOOO", "OONO", "NNON", "ONOO"],
      "Yoga: « Le dimanche matin à 10 h » (NON), « La séance est gratuite et sans inscription » (OUI cho giá và cho đăng ký), « avec d'autres amateurs » (OUI). Groupe de parole: « Le jeudi à 19 h » (OUI), « La participation est gratuite » (OUI), « l'inscription est obligatoire une semaine avant » (NON), « Les groupes sont limités à huit personnes » (OUI). Piscine: « de 12 h à 14 h » (NON), « L'entrée coûte 2 € » (NON), « sans réservation » (OUI), « chacun dans leur couloir, en silence » (NON). Chorale: « Chaque lundi à 20 h » (OUI), « L'adhésion coûte 40 € » (NON), « sans prévenir » (OUI), « une trentaine d'habitants » (OUI)."),
    ],
  };

  const CE2 = {
    id: "lo22mvemxyoo02d",
    consigne: "<p>Lisez l'article puis répondez aux questions.</p>",
    readingText: p(
      "<strong>Santé mentale des jeunes : une grande cause qui doit encore faire ses preuves</strong>",
      "En 2025, la santé mentale avait été déclarée « grande cause nationale » en France. Fin novembre 2025, le gouvernement a annoncé qu'elle le resterait en 2026, en promettant cette fois des actions plus concrètes. Cette décision répondait notamment à une demande des hôpitaux publics, qui souhaitaient que l'effort porte en priorité sur les jeunes. Reconduire un label, cependant, ne coûte rien ; c'est à ce qui suit qu'on juge une politique.",
      "Les chiffres expliquent l'inquiétude des soignants. Selon une étude de Santé publique France menée auprès de 17 000 jeunes, environ un tiers des 11 à 24 ans présente des signes de détresse anxieuse ou dépressive, de modérée à sévère. Les hôpitaux constatent par ailleurs que les jeunes de 5 à 19 ans ont été beaucoup plus nombreux que prévu à être hospitalisés pour des troubles psychiatriques en 2024. Derrière ces pourcentages, il y a des familles qui attendent, parfois longtemps, une réponse qui ne vient pas.",
      "Car l'offre de soins ne suit pas. Les services de psychiatrie sont saturés, de nombreux postes ne sont pas pourvus, et beaucoup de patients disent avoir déjà renoncé à un rendez-vous faute de place. Ce renoncement est sans doute le plus préoccupant : un jeune qui a trouvé le courage de demander de l'aide et qui se heurte à une porte fermée risque de ne pas frapper une deuxième fois. Chaque mois d'attente compte, surtout à un âge où les difficultés peuvent vite s'aggraver. Des députés ont d'ailleurs regretté que les mesures avancent trop lentement.",
      "Quelques changements concrets arrivent malgré tout. Depuis le 1er octobre 2026, les patients du dispositif « Mon soutien psy » n'ont plus à avancer les frais chez le psychologue, ce qui supprime un obstacle financier réel pour les plus modestes. Les étudiants, eux, peuvent toujours bénéficier de séances gratuites. Pour les spécialistes, ces aides sont utiles, mais elles ne remplacent pas un vrai plan pour former et recruter des soignants. Faciliter l'accès à un psychologue n'a guère de sens, rappellent-ils, si les professionnels manquent pour recevoir ceux qui en ont besoin. Autrement dit, ouvrir la porte ne suffit pas ; encore faut-il que quelqu'un attende derrière. C'est sur ce point que les prochains mois diront si la grande cause en était vraiment une.",
      nguon("Fédération hospitalière de France, lettre ouverte, 27 novembre 2025 (fhf.fr)", "CIDJ, « Ce qui change en octobre 2026 », 1er octobre 2026 (cidj.com)", "Pourquoi Docteur, « Santé mentale, grande cause nationale 2026 » (pourquoidocteur.fr)"),
    ),
    cau: [
      q("Selon l'auteur, reconduire la « grande cause nationale »…", "ne suffit pas à juger une politique.", ["a coûté très cher à l'État.", "a été critiqué par les hôpitaux publics."], "« Reconduire un label, cependant, ne coûte rien ; c'est à ce qui suit qu'on juge une politique »."),
      q("Qu'avaient demandé les hôpitaux publics ?", "que les jeunes soient la priorité", ["que la grande cause soit abandonnée", "que les étudiants paient moins cher"], "« qui souhaitaient que l'effort porte en priorité sur les jeunes »."),
      q("D'après l'étude de Santé publique France,…", "environ un jeune sur trois montre des signes de détresse.", ["la moitié des jeunes a déjà été hospitalisée.", "17 000 jeunes souffrent d'une dépression grave et durable."], "« environ un tiers des 11 à 24 ans présente des signes de détresse anxieuse ou dépressive ». 17 000 là số người được khảo sát."),
      v("En 2024, les jeunes hospitalisés pour des troubles psychiatriques ont été moins nombreux que prévu.", false, "ont été beaucoup plus nombreux que prévu à être hospitalisés"),
      q("Pourquoi l'auteur juge-t-il le renoncement aux soins particulièrement grave ?", "Un jeune refusé une fois risque de ne plus demander d'aide.", ["Les rendez-vous non honorés font perdre beaucoup d'argent aux hôpitaux.", "Les familles portent plainte contre les services."], "« un jeune qui a trouvé le courage de demander de l'aide et qui se heurte à une porte fermée risque de ne pas frapper une deuxième fois »."),
      q("Qu'ont reproché des députés ?", "la lenteur des mesures", ["le coût des séances gratuites", "le manque de chiffres fiables"], "« Des députés ont d'ailleurs regretté que les mesures avancent trop lentement »."),
      v("Depuis le 1er octobre 2026, les patients de « Mon soutien psy » ne paient plus les frais à l'avance.", true, "n'ont plus à avancer les frais chez le psychologue"),
      q("Quelle limite les spécialistes voient-ils dans les nouvelles aides ?", "Elles ne règlent pas le manque de soignants.", ["Elles ne concernent que les étudiants.", "Elles coûtent trop cher à la Sécurité sociale."], "« elles ne remplacent pas un vrai plan pour former et recruter des soignants »."),
    ],
  };

  return { CO: [CO1, CO2], CE: [CE1, CE2] };
}
