/* Lô 36 (04/11/2026): nội dung 23 bài ĐỌC B1 cho cây Luyện tập theo trình độ, đúng các dòng
 * « Cần soạn » của B1-CE ở tab « B1 danh sách bài » của docs/ke-hoach-ky-nang-DELF-DALF.xlsx
 * (trừ hai bài thi thu nhỏ T3). Máy dựng: lo36_doc_b1.mjs.
 * Văn bản do FRACILE tự viết, nhân vật và địa điểm hư cấu (tên thành phố có thật chỉ làm bối cảnh).
 * Nội dung học: KHÔNG dùng dấu gạch dài. Mọi đoạn trong « » ở lời giải phải có nguyên văn trong
 * văn bản đọc, câu hỏi hoặc phương án; đáp án câu điền phải có trong văn bản: máy dựng kiểm.
 * Không chỉ QCM (theo chủ dự án, 03/11): có câu tìm từ trong bài (`tim`), ghép đoạn với tiêu đề
 * (`ghep`), xếp lại thứ tự các phần của bài (`xep`), bảng tick (`tick`). */

const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
const nhan = (t) => `<strong>${t}</strong>`;
const tl = (t) => `<p><strong>${t}</strong></p>`;
const tai = (ten, ...ds) => p(`${nhan(ten)} ${ds.join(" ")}`);

export const dungBai = ({ qcm, vf, tick, tim, ghep, xep }) => {
  const tq = (t) => `Lecture B1 : ${t}`;
  return [
  /* ───────── B1-CE-1 : tìm thông tin để giải quyết nhiệm vụ (1.1 đến 1.3 đã có) ───────── */
  { ma: "B1-CE-1", vong: "hoc", tieuDe: tq("quel cours de langue ?"), loai: "ces quatre annonces",
    van: p(nhan("Votre situation :") + " vous voulez apprendre l'espagnol avec votre colocataire. Vous n'avez jamais étudié cette langue. Vous travaillez tous les deux la journée. Vous cherchez un cours le soir, pour débutants, en petit groupe (10 personnes au maximum), qui coûte moins de 250 € le trimestre.")
      + tai("A. École Hola Madrid :", "cours le mardi et le jeudi, de 18 h 30 à 20 h. Niveaux intermédiaire et avancé uniquement. Groupes de 8 élèves. 220 € le trimestre.")
      + tai("B. Association Puerta Abierta :", "pour les grands débutants, le samedi de 10 h à 12 h. Groupes de 6 personnes, ambiance conviviale. 150 € le trimestre.")
      + tai("C. Centre Cervantes Plus :", "tous niveaux, y compris débutants. Le lundi de 19 h à 21 h. Classes de 15 à 20 élèves. 180 € le trimestre.")
      + tai("D. Atelier Sol y Luna :", "cours pour débutants le mercredi de 19 h à 20 h 30. Groupes de 10 personnes au maximum. 240 € le trimestre, livre compris."),
    cau: [
      tick("Pour chaque annonce, cochez OUI ou NON.", ["A", "B", "C", "D"], [
        ["Le cours a lieu le soir.", [true, false, true, true]],
        ["Le cours accepte les débutants.", [false, true, true, true]],
        ["Le groupe a 10 personnes au maximum.", [true, true, false, true]],
        ["Le cours coûte moins de 250 € le trimestre.", [true, true, true, true]],
      ], "A: « niveaux intermédiaire et avancé uniquement ». B: « le samedi de 10 h à 12 h » là buổi sáng. C: « classes de 15 à 20 élèves ». D đạt cả bốn tiêu chí."),
      qcm("Quel cours choisissez-vous ?", "D. Atelier Sol y Luna", ["A. École Hola Madrid", "C. Centre Cervantes Plus"], "Chỉ D có đủ OUI ở mọi tiêu chí: « cours pour débutants le mercredi de 19 h à 20 h 30 », « 10 personnes au maximum », « 240 € le trimestre »."),
    ],
    tu: ["un trimestre (nom masculin) : ba tháng, một quý", "un débutant (nom masculin) : người mới học", "uniquement (adverbe) : chỉ", "convivial (adjectif) : thân mật, vui vẻ", "compris (adjectif) : đã bao gồm"],
    meo: ["Đọc tiêu chí trước, rồi quét từng quảng cáo theo từng tiêu chí, không đọc kỹ từng chữ.", "Chỉ một tài liệu đạt mọi tiêu chí. Thấy một chữ NON là bỏ tài liệu đó."] },
  { ma: "B1-CE-1", vong: "hoc", tieuDe: tq("un job pour l'été"), loai: "ces quatre offres d'emploi",
    van: p(nhan("Votre situation :") + " vous êtes étudiant ou étudiante et vous cherchez un travail pour tout l'été, en juillet et en août. Vous n'avez aucune expérience professionnelle. Vous voulez être logé sur place et travailler au moins 25 heures par semaine.")
      + tai("A. Glacier Le Cornet, Nice :", "nous recrutons un vendeur ou une vendeuse du 15 juillet au 15 août, 30 heures par semaine. Expérience dans la vente demandée. Pas de logement.")
      + tai("B. Ferme Dumas, Provence :", "cueillette de fruits en juillet et en août. Aucune expérience nécessaire. Chambre fournie à la ferme. 15 heures par semaine, le matin seulement.")
      + tai("C. Camping Les Pins, Vendée :", "nous cherchons des animateurs du 1er juillet au 31 août. Débutants acceptés, formation sur place. 35 heures par semaine. Logement offert dans un mobil-home.")
      + tai("D. Hôtel du Lac, Annecy :", "réceptionniste de juillet à fin août, 35 heures par semaine. Deux ans d'expérience exigés et anglais courant. Logement possible dans l'hôtel."),
    cau: [
      tick("Pour chaque offre, cochez OUI ou NON.", ["A", "B", "C", "D"], [
        ["Le travail dure tout l'été (juillet et août).", [false, true, true, true]],
        ["Aucune expérience n'est demandée.", [false, true, true, false]],
        ["Un logement est proposé.", [false, true, true, true]],
        ["On travaille au moins 25 heures par semaine.", [true, false, true, true]],
      ], "A: chỉ « du 15 juillet au 15 août » và cần kinh nghiệm. B: chỉ « 15 heures par semaine ». D: « deux ans d'expérience exigés ». C đạt cả bốn tiêu chí."),
      qcm("Quelle offre choisissez-vous ?", "C. Camping Les Pins", ["B. Ferme Dumas", "D. Hôtel du Lac"], "C: « du 1er juillet au 31 août », « débutants acceptés », « logement offert », « 35 heures par semaine »."),
    ],
    tu: ["recruter (verbe) : tuyển", "la cueillette (nom féminin) : việc hái quả", "fourni (adjectif) : được cấp", "exigé (adjectif) : bắt buộc phải có", "courant (adjectif) : (nói) trôi chảy"],
    meo: ["Cẩn thận với ngày: « du 15 juillet au 15 août » không phải cả hè.", "Débutants acceptés, aucune expérience nécessaire: hai cách nói cùng một ý."] },
  { ma: "B1-CE-1", vong: "on", tieuDe: tq("un séjour à la montagne"), loai: "ces quatre annonces",
    van: p(nhan("Votre situation :") + " vous partez une semaine à la montagne en février avec votre conjoint, vos deux enfants de 6 et 9 ans et votre chien. Vous voulez des activités pour les enfants, un logement à moins de 500 mètres des pistes de ski et un prix inférieur à 900 € la semaine.")
      + tai("A. Chalet Edelweiss :", "chalet pour 5 personnes, à 200 mètres des pistes. Club enfants à partir de 4 ans au village. 850 € la semaine. Animaux non admis.")
      + tai("B. Résidence Les Marmottes :", "appartements de 4 à 6 personnes, à 300 mètres des pistes. Garderie et jeux pour les 3 à 10 ans. Vos animaux sont les bienvenus. 780 € la semaine.")
      + tai("C. Gîte du Berger :", "au calme, à 3 kilomètres des pistes, navette gratuite. Chiens acceptés. Idéal pour les familles, aire de jeux pour enfants. 600 € la semaine.")
      + tai("D. Hôtel Le Sommet :", "au pied des pistes. Chiens acceptés. Cours de ski pour enfants dès 5 ans. 1 400 € la semaine pour quatre personnes."),
    cau: [
      tick("Pour chaque annonce, cochez OUI ou NON.", ["A", "B", "C", "D"], [
        ["Il y a des activités pour les enfants.", [true, true, true, true]],
        ["On peut venir avec un chien.", [false, true, true, true]],
        ["Le logement est à moins de 500 m des pistes.", [true, true, false, true]],
        ["La semaine coûte moins de 900 €.", [true, true, true, false]],
      ], "A: « animaux non admis ». C: « à 3 kilomètres des pistes ». D: « 1 400 € la semaine ». B đạt cả bốn tiêu chí."),
      qcm("Quel logement choisissez-vous ?", "B. Résidence Les Marmottes", ["A. Chalet Edelweiss", "C. Gîte du Berger"], "B: « à 300 mètres des pistes », « jeux pour les 3 à 10 ans », « vos animaux sont les bienvenus », « 780 € la semaine »."),
    ],
    tu: ["les pistes (nom féminin pluriel) : đường trượt tuyết", "admis (adjectif) : được chấp nhận", "une garderie (nom féminin) : nơi giữ trẻ", "une navette (nom féminin) : xe đưa đón", "au pied de (expression) : ngay chân (núi, dốc)"],
    meo: ["« Au pied des pistes » nghĩa là sát đường trượt: vẫn tính dưới 500 m.", "« Vos animaux sont les bienvenus » là cách nói lịch sự của « animaux acceptés »."] },
  { ma: "B1-CE-1", vong: "chot", tieuDe: tq("choisissez le bon document"), loai: "ces quatre documents",
    van: p(nhan("Votre situation :") + " vous voulez offrir un abonnement sportif à votre père, qui a 62 ans. Il veut des cours adaptés aux seniors, une salle ouverte avant 9 h du matin, une piscine et un parking gratuit.")
      + tai("A. Forme Plus :", "ouvert tous les jours de 6 h à 22 h. Piscine couverte. Cours de gym douce réservés aux plus de 60 ans le mardi et le jeudi. Parking payant, 2 € de l'heure.")
      + tai("B. Aqua Club :", "piscine olympique et bassin d'apprentissage. Ouvert de 10 h à 21 h. Aquagym pour les seniors tous les jours. Grand parking gratuit.")
      + tai("C. Salle Énergie :", "musculation et cardio, ouvert 24 heures sur 24. Cours collectifs intensifs, plutôt pour les 18 à 35 ans. Pas de piscine. Parking gratuit.")
      + tai("D. Centre Horizon :", "ouverture à 7 h du lundi au samedi. Programme Senior Actif : marche, étirements, équilibre. Bassin de 25 mètres. Parking gratuit pour les abonnés."),
    cau: [
      tick("Pour chaque document, cochez OUI ou NON.", ["A", "B", "C", "D"], [
        ["Il y a des cours pour les seniors.", [true, true, false, true]],
        ["La salle ouvre avant 9 h.", [true, false, true, true]],
        ["Il y a une piscine.", [true, true, false, true]],
        ["Le parking est gratuit.", [false, true, true, true]],
      ], "A: « parking payant ». B: « ouvert de 10 h à 21 h ». C: « plutôt pour les 18 à 35 ans », « pas de piscine ». D đạt cả bốn tiêu chí, « bassin de 25 mètres » cũng là hồ bơi."),
      qcm("Quel abonnement offrez-vous à votre père ?", "D. Centre Horizon", ["A. Forme Plus", "B. Aqua Club"], "D: « ouverture à 7 h », « programme senior actif », « bassin de 25 mètres », « parking gratuit pour les abonnés »."),
    ],
    tu: ["un abonnement (nom masculin) : vé tháng, gói hội viên", "la gym douce (nom féminin) : thể dục nhẹ nhàng", "un bassin (nom masculin) : bể bơi", "les étirements (nom masculin pluriel) : bài giãn cơ", "un abonné (nom masculin) : hội viên"],
    meo: ["Đề thật cho 15 phút: mỗi tài liệu chỉ nên quét khoảng 2 phút.", "Từ đồng nghĩa là bẫy quen thuộc: bassin là piscine, ouverture à 7 h là mở trước 9 h."] },

  /* ───────── B1-CE-2 : nắm ý chính bài báo (2.1 đã có) ───────── */
  { ma: "B1-CE-2", vong: "hoc", tieuDe: tq("les jeunes et l'information"), loai: "cet article",
    van: tl("Les 15-25 ans s'informent autrement")
      + p("Selon une enquête publiée en septembre par l'institut Médiascope, huit jeunes sur dix découvrent l'actualité sur les réseaux sociaux. La télévision et la radio, qui restent les principales sources d'information de leurs parents, arrivent loin derrière : seuls 15 % des 15-25 ans regardent un journal télévisé chaque semaine.",
        "Ce changement n'étonne pas les chercheurs. Pour Claire Fontaine, sociologue à l'université de Lille, les jeunes ne sont pas moins curieux qu'avant. Ils veulent simplement une information rapide, courte et disponible à tout moment sur leur téléphone. Une vidéo de deux minutes remplace souvent un long article.",
        "Mais cette habitude a un prix. Sur les réseaux, les vraies nouvelles se mélangent aux rumeurs, et il est parfois difficile de savoir qui a écrit un message. D'après l'enquête, un jeune sur trois a déjà partagé une information avant de découvrir qu'elle était fausse.",
        "Pour aider les élèves, de plus en plus de collèges et de lycées proposent des ateliers d'éducation aux médias. Les participants apprennent à vérifier une source, à comparer plusieurs articles et à reconnaître une photo truquée. Les premiers résultats sont encourageants : après six séances, les élèves repèrent deux fois plus de fausses informations."),
    cau: [
      qcm("Cet article parle surtout…", "de la façon dont les jeunes s'informent", ["de la fin de la télévision", "du travail des journalistes"], "Tiêu đề « les 15-25 ans s'informent autrement » đã nói ý chính."),
      qcm("D'après l'enquête, la plupart des jeunes découvrent l'actualité…", "sur les réseaux sociaux", ["à la télévision", "dans les journaux"], "« huit jeunes sur dix découvrent l'actualité sur les réseaux sociaux »."),
      qcm("Selon Claire Fontaine, les jeunes…", "veulent une information rapide et facile d'accès", ["s'intéressent moins à l'actualité", "préfèrent les longs articles"], "« les jeunes ne sont pas moins curieux qu'avant », họ muốn « une information rapide, courte et disponible à tout moment »."),
      qcm("Le troisième paragraphe présente…", "un risque de cette nouvelle habitude", ["une solution au problème", "l'avis des parents"], "Câu chủ đề của đoạn: « mais cette habitude a un prix »."),
      qcm("Un jeune sur trois…", "a déjà diffusé une fausse information sans le savoir", ["ne croit pas les réseaux sociaux", "écrit des rumeurs"], "« un jeune sur trois a déjà partagé une information avant de découvrir qu'elle était fausse »."),
      qcm("Dans les ateliers, les élèves apprennent surtout à…", "vérifier d'où vient une information", ["créer des vidéos courtes", "écrire des articles de presse"], "« vérifier une source » là kiểm tra thông tin từ đâu ra."),
      tim("Relevez dans le dernier paragraphe l'adjectif qui montre que les résultats des ateliers sont positifs.", "encourageants", "« les premiers résultats sont encourageants »."),
    ],
    tu: ["une enquête (nom féminin) : cuộc khảo sát", "l'actualité (nom féminin) : thời sự", "une rumeur (nom féminin) : tin đồn", "truqué (adjectif) : bị chỉnh sửa, giả", "repérer (verbe) : nhận ra, phát hiện"],
    meo: ["Ý chính của đoạn thường nằm ở câu đầu: « Mais cette habitude a un prix » báo trước một rủi ro.", "Đáp án đúng hay đổi chữ: « vérifier une source » thành « vérifier d'où vient une information »."] },
  { ma: "B1-CE-2", vong: "hoc", tieuDe: tq("une ville sans voitures"), loai: "cet article",
    van: tl("Pontevedra, la ville où le piéton est roi")
      + p("Il y a vingt ans, le centre de Pontevedra, en Espagne, ressemblait à beaucoup d'autres villes : des rues pleines de voitures, du bruit et peu de place pour marcher. Aujourd'hui, des visiteurs viennent du monde entier pour voir comment cette ville de 80 000 habitants a presque fait disparaître les voitures de son centre.",
        "Tout a commencé en 1999, quand le nouveau maire a décidé de fermer le centre historique à la circulation. Seuls les livreurs, les taxis et les véhicules des personnes handicapées peuvent encore y entrer, et leur vitesse est limitée à 30 km/h. Les parkings ont été construits à l'extérieur, à dix minutes à pied du centre.",
        "Au début, beaucoup de commerçants étaient inquiets. Ils pensaient que leurs clients ne viendraient plus. C'est le contraire qui s'est passé : les rues piétonnes attirent davantage de promeneurs, et plusieurs boutiques ont ouvert dans des quartiers autrefois abandonnés.",
        "Les effets sur la vie quotidienne sont nombreux. La pollution de l'air a fortement baissé, et les enfants vont de nouveau seuls à l'école. Le modèle a pourtant ses limites : les habitants des villages voisins, mal desservis par les bus, se plaignent de devoir faire un long trajet pour venir travailler en ville."),
    cau: [
      qcm("Le thème principal de l'article est…", "une ville qui a retiré les voitures de son centre", ["les problèmes de circulation en Espagne", "la construction de nouveaux parkings"], "« a presque fait disparaître les voitures de son centre »."),
      qcm("Avant 1999, le centre de Pontevedra…", "ressemblait à celui de beaucoup d'autres villes", ["était déjà réservé aux piétons", "attirait des visiteurs du monde entier"], "« ressemblait à beaucoup d'autres villes : des rues pleines de voitures »."),
      qcm("Aujourd'hui, qui peut encore circuler dans le centre ?", "quelques véhicules autorisés, comme les taxis", ["tous les habitants du centre", "personne, sans exception"], "« seuls les livreurs, les taxis et les véhicules des personnes handicapées peuvent encore y entrer »."),
      qcm("Le troisième paragraphe montre que les commerçants…", "avaient peur pour rien", ["ont fermé leurs boutiques", "ont refusé le projet du maire"], "Họ lo khách không đến, nhưng « c'est le contraire qui s'est passé »."),
      qcm("Quel effet positif l'article cite-t-il ?", "L'air est moins pollué.", ["Les bus sont plus nombreux.", "Les loyers ont baissé."], "« la pollution de l'air a fortement baissé »."),
      qcm("Le dernier paragraphe se termine sur…", "une limite du modèle", ["un nouveau projet du maire", "l'avis des enfants"], "« le modèle a pourtant ses limites » rồi nói về người ở làng bên."),
      tim("Relevez dans le deuxième paragraphe le nom qui désigne les personnes qui apportent des marchandises.", "livreurs|les livreurs", "« seuls les livreurs, les taxis »: livreur là người giao hàng."),
    ],
    tu: ["un piéton (nom masculin) : người đi bộ", "la circulation (nom féminin) : giao thông", "un commerçant (nom masculin) : người buôn bán", "autrefois (adverbe) : trước kia", "mal desservi (adjectif) : ít tuyến xe đi qua"],
    meo: ["Đoạn cuối hay đổi hướng bằng « pourtant »: ý chính của đoạn nằm sau từ đó.", "Câu hỏi về cả bài: đọc tiêu đề và câu cuối đoạn đầu."] },
  { ma: "B1-CE-2", vong: "hoc", tieuDe: tq("mieux dormir"), loai: "cet article",
    van: tl("Dormir : pourquoi nous manquons de sommeil")
      + p("Les Français dorment en moyenne 6 heures 40 par nuit en semaine, soit presque une heure et demie de moins qu'il y a cinquante ans. Pour les médecins, ce chiffre est inquiétant : un adulte a besoin de sept à neuf heures de sommeil pour rester en bonne santé.",
        "Les écrans sont souvent montrés du doigt. La lumière bleue des téléphones et des ordinateurs retarde l'endormissement, car elle fait croire au cerveau qu'il fait encore jour. Beaucoup de personnes consultent aussi leurs messages au lit, ce qui les empêche de se détendre.",
        "Le rythme de vie joue également un rôle. Les longs trajets entre le domicile et le travail obligent certains salariés à se lever très tôt, tandis que les sorties et les séries regardées tard le soir repoussent l'heure du coucher.",
        "Pourtant, quelques gestes simples suffisent souvent à mieux dormir. Les spécialistes conseillent de se coucher et de se lever à heures fixes, même le week-end, d'éviter le café après 16 heures et de laisser son téléphone hors de la chambre. Une courte sieste de vingt minutes en début d'après-midi peut aussi aider, à condition de ne pas la prolonger."),
    cau: [
      qcm("Quelle phrase résume le premier paragraphe ?", "Nous dormons moins qu'avant, et ce n'est pas assez.", ["Les médecins dorment peu.", "Les Français dorment plus le week-end."], "« presque une heure et demie de moins qu'il y a cinquante ans » và « un adulte a besoin de sept à neuf heures »."),
      qcm("Quelle phrase résume le deuxième paragraphe ?", "Les écrans nous empêchent de nous endormir.", ["Les écrans abîment les yeux.", "Il faut lire ses messages le soir."], "« la lumière bleue des téléphones et des ordinateurs retarde l'endormissement »."),
      qcm("Pourquoi la lumière bleue gêne-t-elle le sommeil ?", "Le cerveau pense qu'il fait encore jour.", ["Elle donne mal à la tête.", "Elle réveille les voisins."], "« elle fait croire au cerveau qu'il fait encore jour »."),
      qcm("Quelle phrase résume le troisième paragraphe ?", "Notre manière de vivre réduit le temps de sommeil.", ["Les salariés travaillent la nuit.", "Les séries sont trop longues."], "Câu chủ đề: « le rythme de vie joue également un rôle »."),
      qcm("Le quatrième paragraphe donne surtout…", "des conseils", ["des chiffres", "des témoignages"], "« les spécialistes conseillent de se coucher et de se lever à heures fixes »."),
      qcm("Que dit l'article sur la sieste ?", "Elle est utile si elle reste courte.", ["Elle est déconseillée.", "Elle doit durer une heure."], "« une courte sieste de vingt minutes », « à condition de ne pas la prolonger »."),
      tim("Relevez dans le deuxième paragraphe le nom qui signifie « le moment où l'on commence à dormir ».", "endormissement|l'endormissement", "« retarde l'endormissement »: s'endormir là bắt đầu ngủ."),
    ],
    tu: ["le sommeil (nom masculin) : giấc ngủ", "montrer du doigt (expression) : chỉ trích, đổ lỗi", "se détendre (verbe) : thư giãn", "le coucher (nom masculin) : giờ đi ngủ", "prolonger (verbe) : kéo dài"],
    meo: ["Tóm mỗi đoạn bằng 3 đến 5 từ tiếng Việt ở lề nháp trước khi đọc câu hỏi.", "Phương án chỉ lấy một chi tiết (« les séries ») thường không phải ý chính của đoạn."] },
  { ma: "B1-CE-2", vong: "on", tieuDe: tq("l'école autrement"), loai: "cet article",
    van: tl("Une école sans notes ni sonnerie")
      + p(`${nhan("1.")} Dans le petit village de Saint-Aubin, l'école Les Tilleuls ne ressemble à aucune autre. Ici, pas de sonnerie entre les cours, pas de notes sur 20 et pas de classes par âge : les 60 élèves, de 6 à 11 ans, travaillent ensemble dans de grandes salles ouvertes.`,
        `${nhan("2.")} Chaque lundi, chaque enfant choisit avec son enseignant les objectifs de sa semaine. Il organise ensuite lui-même son temps entre les mathématiques, la lecture et les projets. Les plus grands aident souvent les plus petits, ce qui leur permet de revoir ce qu'ils ont appris.`,
        `${nhan("3.")} L'après-midi, la classe sort régulièrement. Les élèves cultivent le jardin de l'école, observent les oiseaux de la rivière ou visitent les artisans du village. Pour la directrice, Hélène Morel, on apprend mieux ce qu'on a touché et vu de ses propres yeux.`,
        `${nhan("4.")} Ce fonctionnement ne plaît pas à tout le monde. Certains parents craignent que leurs enfants aient du mal à s'adapter au collège, où les règles sont plus strictes. Une mère a d'ailleurs retiré son fils l'an dernier, car il ne savait jamais s'il progressait.`,
        `${nhan("5.")} Les résultats semblent pourtant rassurer l'Éducation nationale. Aux évaluations nationales, les élèves des Tilleuls obtiennent des scores proches de la moyenne en français et un peu au-dessus en mathématiques. D'autres écoles de la région ont déjà demandé à visiter l'établissement.`),
    cau: [
      ghep("Associez chaque paragraphe à son titre. Un titre ne sert pas.", ["Paragraphe 1", "Paragraphe 2", "Paragraphe 3", "Paragraphe 4", "Paragraphe 5"],
        ["Apprendre dehors", "Des inquiétudes chez les parents", "Une école différente", "Des résultats corrects", "Chacun organise son travail", "Une école qui va fermer"], [2, 4, 0, 1, 3],
        "1: « ne ressemble à aucune autre ». 2: « il organise ensuite lui-même son temps ». 3: « la classe sort régulièrement ». 4: « certains parents craignent ». 5: « des scores proches de la moyenne ». Bài không nói trường sắp đóng cửa."),
      qcm("Dans cette école, les élèves…", "de plusieurs âges travaillent ensemble", ["ont des notes sur 20", "changent de salle à chaque sonnerie"], "« pas de classes par âge », « travaillent ensemble dans de grandes salles ouvertes »."),
      qcm("Selon l'article, aider les plus petits permet aux grands de…", "revoir ce qu'ils savent", ["gagner des points", "choisir leurs objectifs"], "« ce qui leur permet de revoir ce qu'ils ont appris »."),
      qcm("Selon la directrice, on apprend mieux…", "par l'expérience directe", ["dans le calme d'une classe", "avec des livres"], "« on apprend mieux ce qu'on a touché et vu de ses propres yeux »."),
      qcm("Pourquoi une mère a-t-elle retiré son fils de l'école ?", "Il ne savait pas s'il faisait des progrès.", ["Il s'ennuyait au jardin.", "Il entrait au collège."], "« il ne savait jamais s'il progressait »."),
      qcm("En mathématiques, les élèves des Tilleuls…", "font un peu mieux que la moyenne", ["sont très en retard", "ont les meilleurs résultats du pays"], "« un peu au-dessus en mathématiques »."),
    ],
    tu: ["une sonnerie (nom féminin) : chuông báo", "un objectif (nom masculin) : mục tiêu", "un artisan (nom masculin) : thợ thủ công", "craindre (verbe) : sợ, lo", "un établissement (nom masculin) : cơ sở, trường"],
    meo: ["Ghép đoạn với tiêu đề: tìm câu chủ đề của mỗi đoạn, thường là câu đầu.", "Luôn có một tiêu đề thừa: tiêu đề nói điều bài không hề nhắc."] },
  { ma: "B1-CE-2", vong: "chot", tieuDe: tq("un article de presse"), loai: "cet article",
    van: tl("Le grand retour des trains de nuit")
      + p("Longtemps considérés comme dépassés, les trains de nuit font leur retour en Europe. Depuis 2021, plusieurs lignes ont rouvert, comme Paris-Vienne ou Paris-Berlin, et d'autres sont prévues d'ici 2028. Leur promesse est simple : s'endormir dans une ville et se réveiller dans une autre, sans passer par l'aéroport.",
        "Ce succès s'explique d'abord par l'inquiétude face au changement climatique. Un trajet en train émet jusqu'à vingt fois moins de CO2 qu'un vol équivalent. De plus en plus de voyageurs, surtout parmi les jeunes, acceptent de passer plus de temps dans les transports pour réduire leur impact sur la planète.",
        "Le train de nuit présente aussi un avantage pratique : il fait gagner une nuit d'hôtel et arrive en plein centre-ville. Pour Marion, 34 ans, qui se rend à Vienne deux fois par an pour son travail, c'est devenu une évidence. Elle travaille dans le wagon-restaurant le soir, dort quelques heures et commence sa journée à 9 heures, reposée.",
        "Tout n'est pourtant pas parfait. Les billets restent souvent plus chers que les vols à bas prix, les retards sont fréquents et le confort des couchettes est jugé insuffisant par de nombreux passagers. Les compagnies ferroviaires expliquent que les wagons sont anciens et que les nouveaux modèles ne seront pas livrés avant plusieurs années.",
        "Les associations de voyageurs demandent donc aux États d'aider davantage ce mode de transport, par exemple en baissant les taxes sur les billets de train. Sans ce soutien, préviennent-elles, le retour des trains de nuit pourrait n'être qu'une mode passagère."),
    cau: [
      qcm("L'article parle surtout…", "du retour d'un moyen de transport", ["de la fermeture de lignes de train", "des avantages de l'avion"], "« les trains de nuit font leur retour en Europe »."),
      qcm("Selon le premier paragraphe, le train de nuit permet de…", "voyager en dormant", ["visiter plusieurs villes en un jour", "prendre l'avion plus facilement"], "« s'endormir dans une ville et se réveiller dans une autre »."),
      qcm("Quelle est la première raison de ce succès ?", "la préoccupation pour l'environnement", ["le prix des billets", "la vitesse des trains"], "« d'abord par l'inquiétude face au changement climatique »."),
      qcm("L'exemple de Marion montre que le train de nuit…", "peut être pratique pour les déplacements professionnels", ["est fatigant pour les salariés", "arrive trop tard pour travailler"], "« qui se rend à Vienne deux fois par an pour son travail », « commence sa journée à 9 heures, reposée »."),
      qcm("Quel problème l'article ne cite-t-il PAS ?", "le manque de lignes vers l'Espagne", ["les retards fréquents", "le prix élevé des billets"], "Đoạn 4 nêu « plus chers que les vols à bas prix », « les retards sont fréquents » và giường nằm. Không nhắc Tây Ban Nha."),
      qcm("Pourquoi le confort ne s'améliore-t-il pas tout de suite ?", "Les nouveaux wagons arriveront plus tard.", ["Les compagnies n'ont pas d'argent.", "Les passagers ne se plaignent pas."], "« les nouveaux modèles ne seront pas livrés avant plusieurs années »."),
      qcm("Dans le dernier paragraphe, les associations…", "demandent une aide publique", ["critiquent les voyageurs", "veulent fermer certaines lignes"], "« demandent donc aux États d'aider davantage ce mode de transport »."),
      tim("Relevez dans le dernier paragraphe l'expression qui désigne une chose à la mode qui ne dure pas.", "une mode passagère|mode passagère", "« pourrait n'être qu'une mode passagère »."),
    ],
    tu: ["dépassé (adjectif) : lỗi thời", "émettre (verbe) : thải ra", "une évidence (nom féminin) : điều hiển nhiên", "une couchette (nom féminin) : giường nằm trên tàu", "passager (adjectif) : thoáng qua, nhất thời"],
    meo: ["Câu hỏi « ne… PAS »: gạch từng ý có trong bài, phương án còn lại là đáp án.", "Bài báo B1 hay theo khuôn: hiện tượng, lý do, ví dụ, mặt trái, đề xuất."] },

  /* ───────── B1-CE-3 : đúng hay sai theo bài (3.1 đã có) ───────── */
  { ma: "B1-CE-3", vong: "hoc", tieuDe: tq("vrai ou faux selon le texte ?"), loai: "cet article",
    van: tl("Des abeilles sur les toits de Paris")
      + p("On les trouve sur le toit de l'Opéra, de grands hôtels ou de simples immeubles : Paris compte aujourd'hui environ 700 ruches. Ce chiffre a été multiplié par trois en dix ans.",
        "Contrairement à ce que l'on pourrait croire, les abeilles se portent plutôt bien en ville. Les parcs, les jardins et les arbres des avenues leur offrent des fleurs très variées, et on y utilise beaucoup moins de pesticides que dans les champs. Résultat : une ruche parisienne produit en moyenne plus de miel qu'une ruche de campagne.",
        "Les apiculteurs urbains restent cependant prudents. Selon eux, il y a désormais trop de ruches dans certains quartiers, et les abeilles manquent de fleurs au printemps. La mairie conseille donc aux habitants de planter des fleurs sur leurs balcons plutôt que d'installer de nouvelles ruches."),
    cau: [
      vf("Le nombre de ruches à Paris a augmenté ces dernières années.", true, "« ce chiffre a été multiplié par trois en dix ans »."),
      vf("Les abeilles vivent mal en ville.", false, "Nhiều người nghĩ vậy, nhưng bài nói ngược lại: « les abeilles se portent plutôt bien en ville »."),
      vf("En ville, on utilise moins de pesticides que dans les champs.", true, "« on y utilise beaucoup moins de pesticides que dans les champs »."),
      vf("Une ruche de campagne produit plus de miel qu'une ruche parisienne.", false, "« une ruche parisienne produit en moyenne plus de miel qu'une ruche de campagne »."),
      vf("Selon les apiculteurs, on peut encore installer beaucoup de ruches dans tous les quartiers.", false, "« il y a désormais trop de ruches dans certains quartiers »."),
      vf("La mairie encourage les habitants à planter des fleurs.", true, "« la mairie conseille donc aux habitants de planter des fleurs sur leurs balcons »."),
    ],
    tu: ["une ruche (nom féminin) : tổ ong nuôi", "une abeille (nom féminin) : con ong", "se porter bien (expression) : khoẻ mạnh", "un apiculteur (nom masculin) : người nuôi ong", "désormais (adverbe) : từ nay, giờ đây"],
    meo: ["Chọn theo bài, không theo điều mình biết: bài này cố ý nói ngược với suy nghĩ thông thường.", "Tìm đúng câu trong bài tương ứng với khẳng định, rồi mới chọn Vrai hay Faux."] },
  { ma: "B1-CE-3", vong: "hoc", tieuDe: tq("le vélo au travail"), loai: "cet article",
    van: tl("Au travail à vélo : l'entreprise paie")
      + p("Depuis janvier, la société lyonnaise Datavia verse 50 euros par mois aux salariés qui viennent travailler à vélo. Sur ses 120 employés, 38 ont déjà profité de cette aide, contre une dizaine de cyclistes seulement l'année dernière.",
        "Pour recevoir la prime, il suffit de déclarer ses trajets sur une application. L'entreprise a aussi installé un garage à vélos sécurisé et deux douches, une demande ancienne des salariés qui habitent loin.",
        "Le directeur, Thomas Ricard, ne cache pas que la mesure coûte cher. Mais il constate déjà moins d'arrêts maladie et une meilleure ambiance dans les équipes. Seul regret : les employés qui vivent à plus de 20 kilomètres continuent presque tous à prendre la voiture."),
    cau: [
      vf("Datavia aide les cyclistes depuis plusieurs années.", false, "« depuis janvier »: mới từ đầu năm nay."),
      vf("Plus de salariés viennent à vélo qu'avant.", true, "« 38 ont déjà profité de cette aide, contre une dizaine de cyclistes seulement l'année dernière »."),
      vf("Pour avoir la prime, il faut présenter un justificatif au directeur chaque semaine.", false, "« il suffit de déclarer ses trajets sur une application »."),
      vf("Les salariés avaient demandé des douches depuis longtemps.", true, "« une demande ancienne des salariés qui habitent loin »."),
      vf("Selon le directeur, la mesure ne coûte presque rien.", false, "« ne cache pas que la mesure coûte cher »."),
      vf("La plupart des employés qui habitent loin utilisent encore leur voiture.", true, "« continuent presque tous à prendre la voiture »."),
    ],
    tu: ["verser (verbe) : trả, chuyển (tiền)", "une prime (nom féminin) : tiền thưởng, trợ cấp", "déclarer (verbe) : khai báo", "un arrêt maladie (nom masculin) : nghỉ ốm", "un regret (nom masculin) : điều tiếc"],
    meo: ["Để ý từ chỉ thời gian và số lượng: « depuis janvier », « presque tous ».", "« Il suffit de » nghĩa là chỉ cần, không có thủ tục nào khác."] },
  { ma: "B1-CE-3", vong: "on", tieuDe: tq("vivre sans téléphone"), loai: "cet article",
    van: tl("Une semaine sans smartphone")
      + p("En mars, 200 lycéens de Rennes ont accepté de laisser leur smartphone dans une boîte pendant une semaine. L'idée venait d'une professeure de philosophie, Anne Kerlo, qui voulait faire réfléchir ses élèves à leur relation avec les écrans.",
        "Les deux premiers jours ont été les plus durs. Beaucoup d'élèves disent avoir ressenti de l'angoisse, surtout le soir, par peur de manquer une conversation entre amis. Certains ont dû acheter un vieux réveil, car ils utilisaient leur téléphone pour se lever le matin.",
        "Ensuite, les choses ont changé. Les participants ont redécouvert les jeux de société, les discussions pendant les repas et même la lecture. Une majorité affirme avoir mieux dormi. Pourtant, à la fin de l'expérience, presque tous ont repris leur téléphone avec plaisir : seuls quelques-uns ont décidé de limiter son usage à une heure par jour."),
    cau: [
      vf("L'expérience a été proposée par les élèves eux-mêmes.", false, "« l'idée venait d'une professeure de philosophie »."),
      vf("Le début de la semaine a été difficile.", true, "« les deux premiers jours ont été les plus durs »."),
      vf("Les élèves avaient surtout peur de ne pas pouvoir faire leurs devoirs.", false, "« par peur de manquer une conversation entre amis »."),
      vf("Certains élèves ont eu besoin d'un autre objet pour se réveiller.", true, "« certains ont dû acheter un vieux réveil »."),
      vf("La plupart des participants disent avoir mieux dormi.", true, "« une majorité affirme avoir mieux dormi »."),
      vf("Après l'expérience, la majorité a décidé d'utiliser son téléphone une heure par jour.", false, "« seuls quelques-uns ont décidé de limiter son usage à une heure par jour »."),
    ],
    tu: ["un lycéen (nom masculin) : học sinh cấp ba", "l'angoisse (nom féminin) : nỗi lo âu", "un réveil (nom masculin) : đồng hồ báo thức", "redécouvrir (verbe) : khám phá lại", "l'usage (nom masculin) : việc sử dụng"],
    meo: ["« Une majorité » là đa số, « quelques-uns » là vài người: đừng nhầm hai lượng này.", "Câu có « surtout » hỏi lý do chính: đối chiếu đúng lý do bài nêu."] },
  { ma: "B1-CE-3", vong: "chot", tieuDe: tq("vrai ou faux dans l'article"), loai: "cet article",
    van: tl("Les ressourceries, magasins de seconde vie")
      + p("Dans une ancienne usine de Nantes, on trouve des chaises, des vélos, des livres et même des pianos. Tous ces objets ont été donnés par des habitants et réparés par l'équipe de la ressourcerie La Fabrique, ouverte en 2019. Chaque année, l'association récupère près de 300 tonnes d'objets qui auraient sinon fini à la poubelle.",
        "Le principe est simple. Les habitants déposent gratuitement ce dont ils n'ont plus besoin. Les objets sont triés, nettoyés, parfois transformés, puis revendus à petit prix dans le magasin. Une commode coûte par exemple 40 euros, environ cinq fois moins cher que neuve.",
        "La ressourcerie a aussi un rôle social. Elle emploie 25 salariés, dont la moitié étaient au chômage depuis longtemps. Pendant deux ans, ils apprennent un métier, comme la menuiserie ou la réparation électrique, avant de chercher un emploi ailleurs. Selon le directeur, Karim Haddad, sept sur dix trouvent ensuite un travail.",
        "Le succès est tel que le magasin manque désormais de place. L'association cherche un nouveau local, plus grand, mais les loyers sont élevés dans le centre-ville. Elle a lancé un appel aux dons pour pouvoir déménager avant la fin de l'année prochaine."),
    cau: [
      vf("La Fabrique existe depuis plus de dix ans.", false, "« ouverte en 2019 »."),
      vf("Les habitants doivent payer pour déposer leurs objets.", false, "« les habitants déposent gratuitement »."),
      qcm("Une commode d'occasion coûte…", "beaucoup moins cher qu'une commode neuve", ["le même prix qu'une commode neuve", "deux fois plus cher qu'en magasin"], "« environ cinq fois moins cher que neuve »."),
      vf("Une partie des salariés n'avait pas de travail avant.", true, "« dont la moitié étaient au chômage depuis longtemps »."),
      qcm("Les salariés restent à la ressourcerie…", "pendant deux ans", ["toute leur carrière", "quelques semaines"], "« pendant deux ans, ils apprennent un métier »."),
      vf("La majorité des salariés trouve un emploi après la ressourcerie.", true, "« sept sur dix trouvent ensuite un travail »."),
      qcm("Aujourd'hui, le principal problème de l'association est…", "le manque d'espace", ["le manque d'objets", "le manque de clients"], "« le magasin manque désormais de place »."),
      vf("L'association a déjà trouvé un nouveau local.", false, "« l'association cherche un nouveau local »: vẫn đang tìm."),
    ],
    tu: ["une ressourcerie (nom féminin) : cửa hàng đồ cũ tái sử dụng", "trier (verbe) : phân loại", "une commode (nom féminin) : tủ ngăn kéo", "le chômage (nom masculin) : thất nghiệp", "un local (nom masculin) : mặt bằng, cơ sở"],
    meo: ["Đề thật trộn Vrai/Faux với A/B/C: đọc câu hỏi theo thứ tự, vì chúng đi theo thứ tự bài.", "Bài viết năm 2026: « ouverte en 2019 » là khoảng bảy năm."] },

  /* ───────── B1-CE-4 : suy luận, đoán từ theo ngữ cảnh ───────── */
  { ma: "B1-CE-4", vong: "hoc", tieuDe: tq("devinez le sens"), loai: "ce texte",
    van: tl("Le dimanche aux puces")
      + p("Chaque dimanche, Lucie se lève à l'aube, bien avant le lever du soleil, pour aller aux puces de Saint-Ouen. Elle aime y chiner : passer des heures entre les stands à la recherche d'un objet ancien que personne n'a encore remarqué.",
        "Ce matin, elle flâne sans se presser dans les allées. Elle ne cherche rien de précis. Soudain, au fond d'un stand rempli de bibelots, ces petits objets décoratifs que l'on pose sur une étagère, elle déniche une vieille lampe en cuivre. Elle n'en revient pas : c'est exactement le modèle qu'elle cherchait depuis des années.",
        "Le vendeur en demande 80 euros. Lucie trouve que c'est trop. Elle marchande pendant dix minutes, propose 50, puis 55 euros. Finalement, le vendeur accepte 60 euros. Pour une lampe de cette qualité, c'est une véritable aubaine : dans une boutique d'antiquités, elle coûterait trois fois plus.",
        "Sur le chemin du retour, Lucie est ravie, mais un peu inquiète : son appartement est déjà encombré, et elle ne sait pas encore où elle va mettre sa nouvelle trouvaille."),
    cau: [
      qcm("Dans le texte, « à l'aube » signifie…", "très tôt le matin", ["en retard", "le soir"], "Câu tự giải thích ngay sau: « bien avant le lever du soleil »."),
      qcm("« Chiner » signifie…", "chercher des objets anciens", ["vendre des meubles", "nettoyer un stand"], "Dấu hai chấm giải thích từ: « à la recherche d'un objet ancien »."),
      qcm("« Flâner » signifie…", "se promener lentement", ["courir", "se perdre"], "« sans se presser » và « elle ne cherche rien de précis »."),
      qcm("« Dénicher » signifie…", "trouver une chose rare", ["casser", "acheter cher"], "Câu sau: « c'est exactement le modèle qu'elle cherchait depuis des années »."),
      qcm("« Elle n'en revient pas » veut dire qu'elle est…", "très surprise", ["fatiguée", "déçue"], "Cô vừa tìm được đúng mẫu đèn « qu'elle cherchait depuis des années »: ngạc nhiên vì may."),
      qcm("« Marchander » signifie…", "discuter pour payer moins", ["refuser d'acheter", "payer en espèces"], "« propose 50, puis 55 euros » trong khi người bán đòi 80."),
      tim("Relevez dans le texte le mot qui désigne de petits objets décoratifs.", "bibelots|des bibelots", "« ces petits objets décoratifs que l'on pose sur une étagère » giải thích từ đứng trước nó."),
      tim("Relevez le mot qui signifie « une très bonne affaire ».", "aubaine|une aubaine|une véritable aubaine", "Ngay sau là lý do: « elle coûterait trois fois plus »."),
    ],
    tu: ["les puces (nom féminin pluriel) : chợ đồ cũ", "une allée (nom féminin) : lối đi", "le cuivre (nom masculin) : đồng (kim loại)", "encombré (adjectif) : chật, bừa đồ", "une trouvaille (nom féminin) : món tìm được"],
    meo: ["Từ lạ thường được giải thích ngay sau dấu phẩy hoặc dấu hai chấm.", "Không biết từ: đọc câu trước và câu sau, đoán nghĩa tích cực hay tiêu cực trước."] },
  { ma: "B1-CE-4", vong: "hoc", tieuDe: tq("la famille des mots"), loai: "ce texte",
    van: tl("Un premier mois en colocation")
      + p("Quand Inès a emménagé avec trois colocataires, elle s'attendait à quelques désaccords. Elle n'imaginait pas que le premier mois serait aussi inoubliable.",
        "Dès le premier jour, le déménagement a mal commencé : le camion est arrivé avec deux heures de retard, et le chauffeur, un peu malhonnête, a demandé trente euros de plus. Une fois installés, les colocataires ont découvert que l'appartement manquait de rangements : impossible de trouver une place pour les livres d'Inès.",
        "Ils ont donc décidé de réorganiser le salon. Ensemble, ils ont repeint les murs, monté des étagères et écrit les règles de la maison sur un grand tableau. Malheureusement, l'écriture de Paul était presque illisible, et il a fallu tout recopier.",
        "Aujourd'hui, Inès en rit. Vivre seule lui paraît désormais impensable : selon elle, la colocation lui a appris la patience et le partage."),
    cau: [
      qcm("Dans le mot « désaccords », le début dés- indique…", "le contraire", ["la répétition", "un lieu"], "dés + accord: không đồng ý, tức là bất đồng."),
      qcm("Un mois « inoubliable » est un mois…", "qu'on ne peut pas oublier", ["qu'on a déjà oublié", "qu'on veut oublier"], "in- là không, -able là có thể: không thể quên."),
      qcm("Un chauffeur « malhonnête » est un chauffeur…", "qui n'est pas honnête", ["très poli", "malade"], "mal + honnête: không trung thực. Ông đòi thêm tiền: « a demandé trente euros de plus »."),
      qcm("Des « rangements » sont…", "des endroits pour ranger ses affaires", ["des personnes qui rangent", "les règles de la maison"], "ranger + -ment tạo danh từ. Câu sau: « impossible de trouver une place pour les livres »."),
      qcm("Dans « réorganiser » et « recopier », le début re- ou ré- signifie…", "de nouveau", ["pas", "avant"], "« réorganiser le salon » là sắp xếp lại, « tout recopier » là chép lại."),
      qcm("Une écriture « illisible » est une écriture…", "qu'on ne peut pas lire", ["très belle", "écrite à l'ordinateur"], "il- là không, -ible là có thể. Vì thế « il a fallu tout recopier »."),
      tim("Trouvez dans le texte le nom formé sur le verbe « déménager ».", "déménagement|le déménagement", "« le déménagement a mal commencé »: déménager + -ment."),
      tim("Trouvez dans le texte l'adjectif qui signifie « qu'on ne peut pas imaginer ».", "impensable", "« vivre seule lui paraît désormais impensable »: im- + penser + -able."),
    ],
    tu: ["emménager (verbe) : dọn đến ở", "un colocataire (nom masculin) : bạn ở chung nhà", "un désaccord (nom masculin) : sự bất đồng", "une étagère (nom féminin) : kệ", "le partage (nom masculin) : sự chia sẻ"],
    meo: ["Tiền tố in-, im-, il-, dés-, mal- thường mang nghĩa phủ định; re-, ré- là làm lại.", "Hậu tố -able, -ible là có thể; -ment biến động từ thành danh từ."] },
  { ma: "B1-CE-4", vong: "hoc", tieuDe: tq("ce que l'auteur veut dire"), loai: "ce texte",
    van: tl("Le jour où j'ai vendu ma voiture")
      + p("Il y a deux ans, j'ai vendu ma voiture. Mes amis m'ont regardé comme si j'avais perdu la tête : comment allais-je faire les courses, partir en vacances, rendre visite à ma mère qui vit à la campagne ?",
        "Les premières semaines, je dois l'avouer, j'ai souvent regretté ma décision. Le bus de 7 h 12 passait rarement à 7 h 12, et la pluie de novembre ne m'a pas épargné. Puis, peu à peu, j'ai pris d'autres habitudes. Je fais mes courses au marché du quartier, à pied, et je connais maintenant le prénom de tous les commerçants.",
        "Pour aller voir ma mère, je prends le train du samedi. Elle vient me chercher à la gare, et nous avons ainsi vingt minutes de conversation en plus, que nous n'avions jamais quand je conduisais en écoutant la radio.",
        "Je ne dirai pas que tout le monde devrait m'imiter. Quand on habite loin de tout, la voiture reste indispensable. Mais pour moi, et pour mon compte en banque, ce fut sans doute la meilleure décision de la décennie."),
    cau: [
      qcm("Au début, les amis de l'auteur…", "trouvaient son choix déraisonnable", ["l'ont aidé à vendre sa voiture", "ont fait comme lui"], "« comme si j'avais perdu la tête »: như thể anh ấy mất trí."),
      qcm("Que comprend-on à propos du bus de 7 h 12 ?", "Il était souvent en retard.", ["Il était toujours plein.", "Il ne roulait pas en novembre."], "« passait rarement à 7 h 12 »: hiếm khi đúng giờ."),
      qcm("« La pluie de novembre ne m'a pas épargné » signifie que l'auteur…", "a souvent été mouillé", ["aime la pluie", "est resté chez lui"], "Đi bộ, chờ xe buýt dưới mưa: mưa không tha anh ấy."),
      qcm("Aujourd'hui, au marché, l'auteur…", "a créé des liens avec les vendeurs", ["achète moins qu'avant", "y va en bus"], "« je connais maintenant le prénom de tous les commerçants »."),
      qcm("Qu'est-ce qui a changé dans ses visites à sa mère ?", "Ils parlent davantage ensemble.", ["Il la voit moins souvent.", "Elle vient chez lui en voiture."], "« vingt minutes de conversation en plus »."),
      qcm("Quelle est l'opinion finale de l'auteur ?", "Sa solution lui convient, mais pas à tout le monde.", ["Tout le monde devrait vendre sa voiture.", "Il regrette d'avoir vendu sa voiture."], "« je ne dirai pas que tout le monde devrait m'imiter » nhưng với anh là « la meilleure décision de la décennie »."),
    ],
    tu: ["avouer (verbe) : thú nhận", "épargner (verbe) : tha, chừa ra", "imiter (verbe) : bắt chước", "indispensable (adjectif) : không thể thiếu", "une décennie (nom féminin) : thập kỷ"],
    meo: ["Câu hỏi suy luận không lặp chữ của bài: tìm câu có cùng ý rồi diễn đạt lại.", "Đáp án quá mạnh (« tout le monde devrait ») thường sai khi tác giả nói có chừng mực."] },
  { ma: "B1-CE-4", vong: "on", tieuDe: tq("un texte difficile"), loai: "ce texte",
    van: tl("Les glaneurs reviennent dans les champs")
      + p("Dans les champs de la Beauce, une fois la récolte terminée, on voit parfois des silhouettes courbées ramasser les pommes de terre oubliées par les machines. Ce sont des glaneurs. Le glanage, cette pratique très ancienne qui consiste à récupérer ce qui reste après la moisson, est toujours autorisé par la loi, à condition de le faire de jour et après le passage de l'agriculteur.",
        "Longtemps réservé aux plus pauvres, il attire aujourd'hui un public plus varié : des retraités, des étudiants, des familles soucieuses de lutter contre le gaspillage. Car les chiffres font frémir : chaque année, des milliers de tonnes de légumes parfaitement comestibles restent dans les champs, simplement parce qu'ils sont trop petits ou un peu abîmés pour être vendus.",
        "Certains agriculteurs voient d'un bon œil ces visiteurs, qui nettoient leurs terres gratuitement. D'autres se méfient : ils craignent les vols et les dégâts dans les cultures voisines. Pour apaiser les tensions, des associations organisent désormais des sorties encadrées, avec l'accord des propriétaires."),
    cau: [
      qcm("Les « glaneurs » sont des personnes qui…", "ramassent ce qui reste dans les champs", ["conduisent les machines agricoles", "vendent des légumes au marché"], "« ramasser les pommes de terre oubliées par les machines »."),
      qcm("« Les chiffres font frémir » signifie que les chiffres sont…", "inquiétants", ["difficiles à calculer", "faux"], "Ngay sau là con số lãng phí: « des milliers de tonnes de légumes »."),
      qcm("Des légumes « comestibles » sont des légumes…", "qu'on peut manger", ["très chers", "déjà cuisinés"], "Rau bị bỏ chỉ vì « trop petits ou un peu abîmés », tức là vẫn ăn được."),
      qcm("« Voient d'un bon œil » signifie que ces agriculteurs…", "acceptent volontiers les glaneurs", ["surveillent les glaneurs", "ne remarquent pas les glaneurs"], "Lý do tích cực « qui nettoient leurs terres gratuitement », đối lập với « d'autres se méfient »."),
      tim("Relevez dans le premier paragraphe le nom qui désigne la pratique de ramasser ce qui reste après la récolte.", "glanage|le glanage", "« le glanage, cette pratique très ancienne qui consiste à récupérer ce qui reste »."),
      tim("Relevez dans le dernier paragraphe le verbe qui signifie « calmer ».", "apaiser", "« pour apaiser les tensions »: làm dịu căng thẳng."),
    ],
    tu: ["la récolte (nom féminin) : vụ thu hoạch", "courbé (adjectif) : cúi lom khom", "le gaspillage (nom masculin) : sự lãng phí", "abîmé (adjectif) : bị dập, hư một phần", "se méfier (verbe) : nghi ngại, đề phòng"],
    meo: ["Bài nhiều từ mới: đọc hết đoạn một lượt, đừng dừng ở từ đầu tiên không biết.", "Thành ngữ (« voir d'un bon œil ») đoán qua câu đối lập đứng gần."] },
  { ma: "B1-CE-4", vong: "chot", tieuDe: tq("six questions difficiles"), loai: "ce texte",
    van: tl("Lussac, village des télétravailleurs")
      + p("Depuis trois ans, le village de Lussac, 600 habitants, a vu arriver une quarantaine de nouveaux venus. Ils ne sont ni agriculteurs ni retraités : ce sont des graphistes, des comptables ou des développeurs qui travaillent à distance pour des entreprises parisiennes. Le maire, qui craignait de voir fermer l'école faute d'élèves, se frotte les mains : une classe supplémentaire a même ouvert à la rentrée.",
        "L'intégration ne se fait pourtant pas sans heurts. Certains anciens habitants reprochent aux nouveaux de faire grimper le prix des maisons et de rester enfermés devant leur écran. Les nouveaux, eux, découvrent que la vie à la campagne a ses contraintes : la connexion internet est capricieuse, et la boulangerie la plus proche est à huit kilomètres.",
        "Pour rapprocher les deux groupes, la mairie a transformé l'ancienne poste en espace de travail partagé, où l'on peut aussi boire un café et lire le journal. Le pari semble réussi : le vendredi soir, on y croise désormais autant de chasseurs que de développeurs."),
    cau: [
      qcm("« Le maire se frotte les mains » signifie qu'il est…", "satisfait", ["inquiet", "en colère"], "Lý do ngay sau: « une classe supplémentaire a même ouvert à la rentrée »."),
      qcm("Pourquoi le maire était-il inquiet avant ?", "Il risquait de ne plus y avoir assez d'enfants.", ["Les agriculteurs quittaient le village.", "La poste allait fermer."], "« craignait de voir fermer l'école faute d'élèves »: faute de là vì thiếu."),
      qcm("« Sans heurts » signifie…", "sans difficultés ni conflits", ["sans retard", "sans argent"], "« pourtant pas sans heurts » rồi kể chuyện trách móc: « certains anciens habitants reprochent »."),
      qcm("Une connexion « capricieuse » est une connexion…", "qui ne marche pas toujours bien", ["très rapide", "trop chère"], "Nằm trong danh sách « ses contraintes », cạnh tiệm bánh ở xa tám cây số."),
      qcm("Que reprochent certains anciens habitants aux nouveaux ?", "Ils font monter les prix et restent entre eux.", ["Ils font trop de bruit le soir.", "Ils ne paient pas leurs impôts."], "« faire grimper le prix des maisons » và « rester enfermés devant leur écran »."),
      qcm("La dernière phrase montre que…", "les deux groupes se rencontrent maintenant", ["les chasseurs ont appris l'informatique", "l'espace de travail ferme le vendredi"], "« on y croise désormais autant de chasseurs que de développeurs »."),
    ],
    tu: ["à distance (expression) : từ xa", "faute de (préposition) : vì thiếu", "reprocher (verbe) : trách", "grimper (verbe) : leo, tăng vọt", "un pari (nom masculin) : canh bạc, việc đặt cược"],
    meo: ["Thành ngữ chỉ cảm xúc (« se frotter les mains ») đoán qua sự việc kể ngay sau.", "Từ « pourtant » ở đầu đoạn báo trước chuyện không suôn sẻ."] },

  /* ───────── B1-CE-5 : theo dõi lập luận ───────── */
  { ma: "B1-CE-5", vong: "hoc", tieuDe: tq("pourtant, cependant"), loai: "ce texte",
    van: tl("Le premier marathon de Léa")
      + p("Léa n'avait jamais couru plus de dix kilomètres. Pourtant, en janvier, elle s'est inscrite au marathon de Paris.",
        "Au début, l'entraînement était difficile. Elle courait trois fois par semaine, malgré le froid et la fatigue. Ses amis lui conseillaient d'abandonner ; elle, au contraire, augmentait chaque semaine la distance.",
        "En mars, une blessure au genou l'a obligée à s'arrêter quinze jours. Elle aurait pu renoncer. Cependant, elle a profité de cette pause pour nager et faire du vélo, deux sports qui ménagent les articulations.",
        "Le jour de la course, il faisait très chaud. Bien que beaucoup de coureurs aient ralenti, Léa a gardé son rythme. Elle n'a pas battu de record, mais elle a franchi la ligne d'arrivée en 4 heures 30, avec un grand sourire. Certes, elle avait mal aux jambes ; néanmoins, elle pensait déjà au prochain marathon."),
    cau: [
      qcm("Dans le premier paragraphe, « pourtant » montre que l'inscription de Léa est…", "surprenante", ["logique", "obligatoire"], "Trước « pourtant » là « n'avait jamais couru plus de dix kilomètres »: đăng ký marathon là điều bất ngờ."),
      qcm("« Malgré le froid et la fatigue » signifie que Léa courait…", "même s'il faisait froid et qu'elle était fatiguée", ["parce qu'il faisait froid", "seulement quand il faisait beau"], "malgré + danh từ: mặc dù có."),
      qcm("« Au contraire » oppose…", "le conseil des amis et l'attitude de Léa", ["le froid et la fatigue", "deux semaines d'entraînement"], "« ses amis lui conseillaient d'abandonner » đối lập với việc cô « augmentait chaque semaine la distance »."),
      qcm("Après sa blessure, Léa…", "a continué le sport autrement", ["a arrêté tout sport", "a couru moins vite"], "« elle a profité de cette pause pour nager et faire du vélo »."),
      qcm("Quel mot pourrait remplacer « cependant » sans changer le sens ?", "pourtant", ["donc", "ensuite"], "Cả hai đều báo ý ngược: đáng lẽ bỏ cuộc, nhưng cô vẫn tập."),
      qcm("« Bien que beaucoup de coureurs aient ralenti » exprime…", "une opposition", ["une cause", "un but"], "bien que + subjonctif: mặc dù. Người khác chậm lại, Léa thì không."),
      qcm("Dans la dernière phrase, « certes… néanmoins » sert à…", "reconnaître un point négatif, puis dire le contraire", ["donner deux causes", "raconter deux moments"], "« certes, elle avait mal aux jambes » rồi « néanmoins, elle pensait déjà au prochain marathon »."),
      tim("Relevez dans le troisième paragraphe le verbe qui signifie « abandonner ».", "renoncer", "« elle aurait pu renoncer »."),
    ],
    tu: ["s'inscrire (verbe) : đăng ký", "une blessure (nom féminin) : chấn thương", "ménager (verbe) : giữ gìn, không làm hại", "ralentir (verbe) : chậm lại", "franchir (verbe) : vượt qua"],
    meo: ["Pourtant, cependant, néanmoins, malgré, bien que: sau những từ này là ý trái với điều ta chờ đợi.", "Khoanh từ nối khi đọc để thấy tác giả đang đồng ý hay đối lập."] },
  { ma: "B1-CE-5", vong: "hoc", tieuDe: tq("donc, en effet, car"), loai: "cet article",
    van: tl("Pourquoi les librairies résistent")
      + p("On annonçait leur disparition il y a vingt ans. Les librairies indépendantes sont pourtant toujours là : en France, on en compte encore environ 3 500. Comment expliquer cette résistance ?",
        "D'abord, les Français restent attachés au livre papier. En effet, les livres numériques représentent moins de 10 % des ventes. Beaucoup de lecteurs aiment feuilleter un livre avant de l'acheter, car ils veulent juger le style de l'auteur.",
        "Ensuite, la loi protège les petites librairies. Depuis 1981, le prix d'un livre est le même partout, en ligne comme en magasin. Les grandes plateformes ne peuvent donc pas vendre beaucoup moins cher.",
        "Enfin, le libraire offre quelque chose qu'aucun algorithme ne remplace : le conseil. Il connaît ses clients, lit les nouveautés et organise des rencontres avec des écrivains. Par conséquent, la librairie devient un lieu de vie, et pas seulement un commerce.",
        "La situation reste fragile, car les loyers augmentent dans les centres-villes. Mais tant que les lecteurs pousseront la porte, les libraires continueront à se battre."),
    cau: [
      qcm("Dans le deuxième paragraphe, « en effet » introduit…", "une preuve de l'idée précédente", ["une opposition", "une conséquence"], "Ý trước: người Pháp gắn bó với sách giấy. Bằng chứng: « les livres numériques représentent moins de 10 % des ventes »."),
      qcm("Pourquoi les lecteurs aiment-ils feuilleter un livre ?", "Pour juger le style de l'auteur.", ["Pour payer moins cher.", "Pour rencontrer l'écrivain."], "« car ils veulent juger le style de l'auteur »: car nêu lý do."),
      qcm("Dans « les grandes plateformes ne peuvent donc pas vendre beaucoup moins cher », « donc » annonce…", "une conséquence de la loi", ["une cause", "un exemple"], "Vì « le prix d'un livre est le même partout » nên các nền tảng lớn không bán rẻ hơn được."),
      qcm("Pourquoi le prix d'un livre est-il le même partout ?", "À cause d'une loi de 1981.", ["Parce que les libraires se sont mis d'accord.", "Grâce aux plateformes en ligne."], "« depuis 1981, le prix d'un livre est le même partout »."),
      qcm("Quelle expression pourrait remplacer « par conséquent » ?", "c'est pourquoi", ["parce que", "pourtant"], "Par conséquent nêu kết quả, giống c'est pourquoi. Parce que nêu nguyên nhân."),
      qcm("D'après l'article, le principal atout du libraire est…", "le conseil personnalisé", ["le prix bas", "la livraison rapide"], "« quelque chose qu'aucun algorithme ne remplace : le conseil »."),
      qcm("Dans le dernier paragraphe, « car les loyers augmentent » explique…", "pourquoi la situation reste fragile", ["pourquoi les lecteurs viennent", "pourquoi les librairies ont disparu"], "« la situation reste fragile, car les loyers augmentent »."),
      qcm("Les mots « d'abord », « ensuite », « enfin » servent à…", "présenter plusieurs raisons dans l'ordre", ["opposer deux idées", "raconter une histoire"], "Bài trả lời câu hỏi « comment expliquer cette résistance ? » bằng ba lý do."),
    ],
    tu: ["une librairie (nom féminin) : hiệu sách", "attaché à (adjectif) : gắn bó với", "feuilleter (verbe) : lật xem", "un atout (nom masculin) : thế mạnh", "un loyer (nom masculin) : tiền thuê"],
    meo: ["En effet, car: giải thích hoặc chứng minh. Donc, par conséquent: kết quả.", "D'abord, ensuite, enfin cho biết bài có mấy lý do: đếm để không sót ý."] },
  { ma: "B1-CE-5", vong: "hoc", tieuDe: tq("le fil de l'article"), loai: "cet article",
    van: tl("Faut-il en finir avec les devoirs à la maison ?")
      + p("Chaque soir, dans des milliers de foyers, la même scène se répète : un enfant fatigué devant son cahier, un parent qui s'énerve, et des exercices qui durent parfois plus d'une heure. Officiellement, pourtant, les devoirs écrits sont interdits à l'école primaire en France depuis 1956.",
        "Pour leurs défenseurs, les devoirs sont indispensables. Ils permettent de revoir les leçons, de prendre de bonnes habitudes de travail et de montrer aux parents ce qui se fait en classe.",
        "Leurs adversaires répondent qu'ils creusent les inégalités. Un enfant dont les parents ont le temps et les connaissances pour l'aider avance plus vite ; un autre, seul à la maison, prend du retard. Plusieurs études montrent d'ailleurs que les devoirs ont peu d'effet sur les résultats avant le collège.",
        "Entre ces deux positions, des écoles cherchent une voie moyenne. Certaines proposent une heure d'aide aux devoirs après la classe, encadrée par des enseignants. Les élèves rentrent chez eux le travail terminé, et la soirée en famille redevient un moment calme."),
    cau: [
      qcm("Le premier paragraphe sert à…", "présenter la situation et le problème", ["donner l'avis de l'auteur", "proposer une solution"], "Tả cảnh tối nào cũng lặp lại, rồi nêu nghịch lý: « les devoirs écrits sont interdits à l'école primaire »."),
      qcm("Le deuxième paragraphe présente…", "les arguments pour les devoirs", ["les arguments contre les devoirs", "une étude scientifique"], "« pour leurs défenseurs, les devoirs sont indispensables »."),
      qcm("Le troisième paragraphe présente…", "les arguments contre les devoirs", ["l'histoire d'une loi", "l'avis des enseignants"], "« leurs adversaires répondent qu'ils creusent les inégalités »."),
      qcm("Dans le troisième paragraphe, « d'ailleurs » sert à…", "ajouter un argument qui renforce l'idée", ["introduire une opposition", "conclure l'article"], "Sau bất bình đẳng, thêm bằng chứng cùng hướng: « les devoirs ont peu d'effet sur les résultats »."),
      qcm("Le dernier paragraphe…", "propose un compromis", ["rejette les deux positions", "raconte l'histoire des devoirs"], "« des écoles cherchent une voie moyenne »."),
      xep("Remettez dans l'ordre les quatre étapes de l'article.", ["Une scène de tous les jours", "Les arguments pour", "Les arguments contre", "Une solution intermédiaire"], "Bài đi từ tình huống, sang hai phía tranh luận, rồi tới giải pháp ở giữa: « une voie moyenne »."),
    ],
    tu: ["un foyer (nom masculin) : gia đình, tổ ấm", "un défenseur (nom masculin) : người ủng hộ", "un adversaire (nom masculin) : người phản đối", "creuser les inégalités (expression) : làm sâu thêm bất bình đẳng", "encadré (adjectif) : có người hướng dẫn"],
    meo: ["Bài nghị luận B1 hay theo khuôn: tình huống, ý kiến ủng hộ, ý kiến phản đối, giải pháp.", "Câu đầu mỗi đoạn cho biết vai trò của đoạn: « pour leurs défenseurs », « leurs adversaires »."] },
  { ma: "B1-CE-5", vong: "on", tieuDe: tq("le mot manquant"), loai: "cet article et choisissez le mot qui manque",
    van: tl("Covoiturer pour aller au travail")
      + p("Chaque matin, des millions de Français prennent leur voiture seuls pour aller travailler. (1) ______, le covoiturage reste rare sur ces trajets quotidiens, (2) ______ il permettrait d'économiser de l'argent et de réduire les embouteillages.",
        "Pourquoi cette réticence ? (3) ______, les horaires de travail sont de plus en plus variables, ce qui rend l'organisation difficile. (4) ______, beaucoup de conducteurs tiennent à leur liberté : ils veulent pouvoir partir quand ils le souhaitent.",
        "Pour changer les habitudes, certaines régions offrent des trajets gratuits aux passagers. (5) ______, en Occitanie, un passager ne paie rien et le conducteur reçoit deux euros par trajet. Les résultats sont encourageants : le nombre de covoitureurs a doublé en un an. (6) ______, ces aides coûtent cher, et on ne sait pas si les habitudes resteront quand elles s'arrêteront.",
        "(7) ______, le covoiturage ne remplacera pas les transports en commun. Il peut (8) ______ être une solution utile dans les zones rurales, où les bus sont rares."),
    cau: [
      qcm("Mot manquant (1) :", "Pourtant", ["Donc", "Par exemple"], "Nhiều người đi xe một mình, vậy mà đi chung xe vẫn hiếm: ý ngược với điều chờ đợi."),
      qcm("Mot manquant (2) :", "alors qu'", ["parce qu'", "afin qu'"], "Đi chung xe hiếm, trong khi nó có lợi: alors que nêu sự tương phản."),
      qcm("Mot manquant (3) :", "D'abord", ["Pourtant", "Donc"], "« pourquoi cette réticence ? » rồi kể lý do thứ nhất."),
      qcm("Mot manquant (4) :", "Ensuite", ["Au contraire", "Car"], "Lý do thứ hai, tiếp sau lý do thứ nhất."),
      qcm("Mot manquant (5) :", "Par exemple", ["Cependant", "Donc"], "Vùng Occitanie là ví dụ cho « certaines régions »."),
      qcm("Mot manquant (6) :", "Cependant", ["En effet", "Ainsi"], "Sau kết quả tốt là mặt hạn chế: « ces aides coûtent cher »."),
      qcm("Mot manquant (7) :", "Bien sûr", ["Parce que", "Par exemple"], "Tác giả thừa nhận một giới hạn trước khi nêu ích lợi ở câu sau."),
      qcm("Mot manquant (8) :", "en revanche", ["car", "ensuite"], "Không thay được giao thông công cộng, ngược lại vẫn hữu ích ở nông thôn."),
    ],
    tu: ["le covoiturage (nom masculin) : đi chung xe", "un embouteillage (nom masculin) : tắc đường", "la réticence (nom féminin) : sự ngần ngại", "tenir à (verbe) : coi trọng, muốn giữ", "rural (adjectif) : thuộc nông thôn"],
    meo: ["Đọc cả câu trước và câu sau chỗ trống, hỏi: hai ý cùng hướng, ngược hướng, hay là ví dụ?", "Phương án sai ngữ pháp (« Il peut car être ») loại ngay."] },
  { ma: "B1-CE-5", vong: "chot", tieuDe: tq("que fait l'auteur ?"), loai: "cet article",
    van: tl("Trop de touristes ? Mieux vaut les répartir")
      + p("Venise, Barcelone, le Mont-Saint-Michel : chaque été, les mêmes images de foules montrent des rues bloquées et des habitants exaspérés. Le tourisme de masse est devenu un sujet de débat dans toute l'Europe.",
        "Il serait pourtant injuste de condamner les touristes. Dans de nombreuses régions, ils font vivre les hôtels, les restaurants et les commerces. Sans eux, des milliers d'emplois disparaîtraient.",
        "Le problème ne vient donc pas du nombre total de visiteurs, mais de leur concentration. Les trois quarts se pressent dans les mêmes lieux, aux mêmes semaines. Quelques kilomètres plus loin, des villages magnifiques restent presque vides.",
        "Certaines villes ont choisi la manière forte : Venise fait payer l'entrée aux visiteurs d'un jour, Amsterdam limite les nouveaux hôtels. D'autres préfèrent encourager les voyageurs à venir hors saison ou à découvrir d'autres quartiers.",
        "À mon avis, la seconde voie est la plus prometteuse. Interdire risque de réserver les plus beaux lieux aux plus riches ; mieux répartir les touristes profite à tous, habitants comme visiteurs."),
    cau: [
      qcm("Dans le premier paragraphe, l'auteur…", "présente un problème actuel", ["donne son opinion", "critique les habitants"], "« le tourisme de masse est devenu un sujet de débat dans toute l'Europe »."),
      qcm("Au début du deuxième paragraphe, l'auteur…", "nuance la critique contre les touristes", ["accuse les touristes", "change de sujet"], "« il serait pourtant injuste de condamner les touristes »."),
      qcm("Dans le troisième paragraphe, « donc » introduit…", "une conclusion tirée de ce qui précède", ["un exemple", "une opposition"], "Khách du lịch có ích (đoạn 2), vậy vấn đề không nằm ở số lượng: « le problème ne vient donc pas du nombre total de visiteurs »."),
      qcm("Selon l'auteur, le vrai problème est que les touristes…", "vont tous aux mêmes endroits", ["sont trop nombreux", "dépensent peu"], "« mais de leur concentration », « dans les mêmes lieux, aux mêmes semaines »."),
      qcm("Le quatrième paragraphe…", "compare deux types de solutions", ["raconte un voyage", "donne des chiffres sur l'emploi"], "« certaines villes ont choisi la manière forte » và « d'autres préfèrent encourager »."),
      qcm("Que pense l'auteur des solutions qui interdisent ou font payer ?", "Elles peuvent être injustes pour les moins riches.", ["Ce sont les meilleures solutions.", "Elles profitent à tous."], "« interdire risque de réserver les plus beaux lieux aux plus riches »."),
    ],
    tu: ["exaspéré (adjectif) : bực tức cực độ", "condamner (verbe) : lên án", "la concentration (nom féminin) : sự dồn vào một chỗ", "hors saison (expression) : ngoài mùa cao điểm", "prometteur (adjectif) : đầy hứa hẹn"],
    meo: ["Ý kiến của tác giả thường xuất hiện ở cuối, sau « à mon avis ».", "Hỏi « que fait l'auteur ? »: trả lời bằng động từ (présenter, nuancer, comparer, conclure)."] },
  ];
};
