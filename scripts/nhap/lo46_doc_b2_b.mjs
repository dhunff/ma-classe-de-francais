/* Lô 46 (14/11/2026), phần B: B2-CE-2 « Suy luận ý ngầm » (8 bài) và B2-CE-3 « Ghép ý kiến trên
 * diễn đàn » (6 bài). Máy dựng: lo46_doc_b2.mjs. Văn bản do FRACILE tự viết, người và nơi chốn hư cấu.
 * B2-CE-3 theo bài 3 của đề DELF B2: ba người trên một diễn đàn, mỗi câu chọn người nói ý đó.
 * KHÔNG dùng dấu gạch dài. Đoạn trong « » ở lời giải phải có nguyên văn trong văn bản. */
import { p, tl, tq } from "./lo46_doc_b2_a.mjs";

const DE_SUY = "<p>Lisez ce texte, puis répondez aux questions. Attention : certaines réponses ne sont pas écrites directement, il faut les déduire du texte.</p>";
const DE_DIEN_DAN = (chuDe) => `<p>Vous lisez l'opinion de ces trois personnes sur un forum francophone dont le sujet est : « ${chuDe} »</p><p>Pour chaque affirmation, choisissez la personne qui exprime cette idée.</p>`;
const dienDan = (ds) => ds.map(([ten, chu]) => `<p><strong>${ten}</strong></p><p>${chu}</p>`).join("");

export const phanB = ({ qcm, ai }) => {
  const f1 = ai(["Sophie", "Karim", "Hugo"]);
  const f2 = ai(["Élodie", "Marc", "Inès"]);
  const f3 = ai(["Gérard", "Nathalie", "Thomas"]);
  const f4 = ai(["Lina", "Pascal", "Mei"]);
  const f5 = ai(["Arnaud", "Céline", "Yasmine"]);
  const f6 = ai(["Laurent", "Amélie", "Rachid"]);
  return [
  /* ───────── B2-CE-2.1 : điều tác giả không nói thẳng ───────── */
  { ma: "B2-CE-2", vong: "hoc", tieuDe: tq("entre les lignes"), de: DE_SUY,
    van: tl("Une banque qui se transforme") + p(
      "La lettre est arrivée un lundi matin dans la boîte mail des quatre cents salariés de la banque régionale Duval. La direction y présente un grand projet de transformation, destiné à rapprocher la banque de ses clients. Les agences de six petites villes du département, explique-t-elle, seront regroupées dans un nouvel espace moderne au centre de la préfecture, ouvert jusqu'à vingt heures.",
      "La lettre insiste longuement sur les nouveaux services en ligne : application repensée, conseiller joignable par vidéo, signature électronique des contrats. Elle précise que les clients des agences concernées n'auront plus à se déplacer pour la plupart de leurs opérations.",
      "Le nombre de postes prévus dans le nouvel espace n'est pas mentionné. En revanche, la direction remercie chaleureusement les équipes pour leur capacité d'adaptation et annonce la création d'une cellule chargée d'étudier les projets professionnels de chacun. Des formations à d'autres métiers seront proposées à ceux qui le souhaitent.",
      "Dans les agences, la lettre a été lue plusieurs fois. Au guichet de Saint-Aubin, Martine, quarante ans de maison, a simplement demandé à son responsable si le nouvel espace avait une place de parking pour les clients âgés. Il n'a pas su lui répondre."),
    cau: [
      qcm("Que comprend-on au sujet des agences des six petites villes ?", "Elles vont fermer.", ["Elles vont ouvrir plus tard le soir.", "Elles vont être entièrement rénovées."], "Chữ « regroupées dans un nouvel espace moderne au centre de la préfecture » là cách nói giảm: sáu chi nhánh nhỏ sẽ không còn."),
      qcm("Pourquoi la lettre insiste-t-elle sur les services en ligne ?", "Pour présenter le changement comme un avantage pour les clients.", ["Pour annoncer la fin prochaine de l'application de la banque.", "Pour demander aux salariés leur avis sur ces nouveaux outils."], "Lá thư biến việc đóng chi nhánh thành lợi ích: khách « n'auront plus à se déplacer pour la plupart de leurs opérations »."),
      qcm("Que laisse deviner l'absence d'information sur les postes ?", "Des emplois pourraient disparaître.", ["Le nouvel espace va recruter massivement.", "La direction n'a pas encore choisi le lieu."], "Điều không nói cũng là thông tin: « Le nombre de postes prévus dans le nouvel espace n'est pas mentionné »."),
      qcm("La cellule chargée des projets professionnels suggère que…", "certains salariés devront changer de métier ou partir.", ["tous les salariés recevront une prime de fin d'année.", "les clients pourront demander des conseils sur leur carrière."], "« étudier les projets professionnels de chacun » và « formations à d'autres métiers »: có người sẽ không giữ được việc cũ."),
      qcm("Que révèle la question de Martine ?", "Elle doute que le nouvel espace convienne aux clients âgés.", ["Elle souhaite obtenir une place de parking pour elle-même.", "Elle veut être la première à travailler dans le nouvel espace."], "Bà nghĩ tới khách lớn tuổi không dùng mạng và phải đi xa: « une place de parking pour les clients âgés »."),
      qcm("Quel est le ton de l'auteur de ce texte ?", "Discrètement critique.", ["Franchement enthousiaste.", "Purement technique."], "Tác giả không phán xét thẳng nhưng chọn chi tiết để người đọc tự hiểu, kết bằng « Il n'a pas su lui répondre »."),
    ],
    tu: ["regrouper (verbe) : gộp lại", "la préfecture : thủ phủ tỉnh", "une cellule : nhóm phụ trách", "quarante ans de maison : làm cho công ty bốn mươi năm", "le guichet : quầy giao dịch"],
    meo: ["Suy luận = dựa vào chi tiết CÓ trong bài để rút ra điều bài không nói thẳng. Không suy diễn quá xa.", "Chú ý điều bị BỎ QUA (« n'est pas mentionné »): đó thường là ý ngầm của câu hỏi."] },

  /* ───────── B2-CE-2.2 : thái độ tác giả ───────── */
  { ma: "B2-CE-2", vong: "hoc", tieuDe: tq("l'auteur est-il convaincu ?"), de: DE_SUY,
    van: tl("La ville intelligente, vraiment ?") + p(
      "Depuis un an, notre ville se veut intelligente. Des capteurs mesurent le passage des voitures, les lampadaires baissent d'intensité quand la rue est vide, et une application permet de signaler un trou dans la chaussée. Sur le papier, tout cela est séduisant, et je reconnais volontiers que l'éclairage public consomme moins d'énergie qu'avant.",
      "Mais j'ai voulu tester l'application. J'ai signalé un trou devant l'école de mon quartier, photo à l'appui. Trois semaines plus tard, j'ai reçu un message automatique me remerciant pour ma participation citoyenne. Le trou, lui, est toujours là ; il s'est même agrandi, sans doute pour mieux être repéré par les capteurs.",
      "La mairie annonce fièrement que plus de dix mille signalements ont été envoyés. On aimerait savoir combien ont été traités. Collecter des données n'a jamais réparé une route : il faut ensuite des agents, du matériel et un budget, c'est-à-dire tout ce que la technologie ne fournit pas.",
      "Je ne suis pas opposé au progrès. Je constate simplement qu'une ville vraiment intelligente serait d'abord une ville qui écoute, puis qui agit. Pour l'instant, la nôtre écoute très bien."),
    cau: [
      qcm("Dans le premier paragraphe, l'auteur…", "reconnaît un avantage réel du projet.", ["affirme que les capteurs ne fonctionnent pas.", "regrette l'arrivée des lampadaires modernes."], "« je reconnais volontiers que l'éclairage public consomme moins d'énergie qu'avant »."),
      qcm("Quelle est son attitude quand il parle du trou qui s'agrandit ?", "Ironique.", ["Admirative.", "Indifférente."], "Câu « sans doute pour mieux être repéré par les capteurs » là mỉa mai: cái hố to ra không phải để được phát hiện."),
      qcm("Que montre le message automatique reçu par l'auteur ?", "Son signalement a été enregistré mais pas traité.", ["La mairie a réparé la route très rapidement.", "L'application ne reçoit pas les photos envoyées."], "Có tin nhắn cảm ơn, nhưng « Le trou, lui, est toujours là »."),
      qcm("Que pense l'auteur du chiffre annoncé par la mairie ?", "Il ne prouve pas que les problèmes sont réglés.", ["Il montre que les habitants aiment leur ville.", "Il est sans doute plus élevé en réalité."], "« On aimerait savoir combien ont été traités »: số lượt báo không nói lên số việc đã làm."),
      qcm("Selon l'auteur, qu'est-ce qui manque au projet ?", "Les moyens humains et financiers pour agir.", ["Un plus grand nombre de capteurs dans les rues.", "Une meilleure application pour les signalements."], "« il faut ensuite des agents, du matériel et un budget »."),
      qcm("Que signifie la dernière phrase ?", "La ville recueille les plaintes mais n'agit pas.", ["La ville est attentive et règle tous les problèmes.", "Les habitants n'utilisent pas assez l'application."], "Ngay trước đó: thành phố thông minh phải « une ville qui écoute, puis qui agit ». « Pour l'instant, la nôtre écoute très bien » nghĩa là chỉ nghe, chưa làm."),
    ],
    tu: ["un capteur : cảm biến", "la chaussée : mặt đường", "séduisant (adjectif) : hấp dẫn", "photo à l'appui : có ảnh làm bằng chứng", "un signalement : lượt báo cáo"],
    meo: ["Thái độ tác giả lộ qua từ đánh giá (« séduisant », « fièrement ») và qua giọng mỉa mai: câu khen mà nội dung lại chê.", "Câu nhượng bộ (« Je ne suis pas opposé au progrès ») chưa phải ý chính: ý chính nằm sau « Je constate simplement »."] },

  /* ───────── B2-CE-2.3 : mục đích tác giả ───────── */
  { ma: "B2-CE-2", vong: "hoc", tieuDe: tq("pourquoi écrit-il cela ?"), de: DE_SUY,
    van: tl("Apprendre à s'ennuyer") + p(
      "Dans le train, la salle d'attente ou la file du supermarché, un même geste : sortir son téléphone. Nous ne supportons plus le moindre temps mort. Pourtant, plusieurs chercheurs en psychologie s'intéressent aujourd'hui aux vertus de l'ennui.",
      "Leurs expériences sont parfois surprenantes. Dans l'une d'elles, des volontaires devaient d'abord recopier des numéros de téléphone pendant un quart d'heure, une tâche volontairement fastidieuse. On leur demandait ensuite de trouver le plus d'usages possibles pour deux gobelets en plastique. Ceux qui s'étaient ennuyés ont proposé des idées plus nombreuses et plus originales que les autres.",
      "L'explication tient en partie au fonctionnement du cerveau : quand rien ne retient notre attention, l'esprit vagabonde, fait des liens inattendus, revient sur des souvenirs. C'est souvent dans ces moments que surgissent les idées. Plus d'un écrivain raconte avoir trouvé le début d'un roman en regardant la pluie tomber.",
      "Il ne s'agit pas de faire l'éloge de l'ennui permanent, qui peut être le signe d'un malaise. Mais apprendre aux enfants à rester un moment sans écran, sans activité programmée, c'est peut-être leur offrir un espace où naît l'imagination. Les parents qui remplissent chaque mercredi de cours et d'ateliers devraient peut-être y penser."),
    cau: [
      qcm("Pourquoi l'auteur commence-t-il par des scènes de la vie quotidienne ?", "Pour que le lecteur se reconnaisse dans ce comportement.", ["Pour critiquer la mauvaise qualité des transports publics.", "Pour présenter les résultats d'une étude sur les écrans."], "Ai cũng từng thấy « un même geste : sortir son téléphone »: người đọc tự nhận ra mình."),
      qcm("Pourquoi l'expérience des numéros de téléphone est-elle citée ?", "Pour montrer que l'ennui peut favoriser la créativité.", ["Pour prouver que les gens ont une mauvaise mémoire.", "Pour expliquer comment recycler les gobelets en plastique."], "Người đã chán đưa ra « des idées plus nombreuses et plus originales »."),
      qcm("Pourquoi la première tâche était-elle volontairement fastidieuse ?", "Pour provoquer l'ennui chez les volontaires.", ["Pour sélectionner les volontaires les plus patients.", "Pour vérifier qu'ils savaient bien écrire les chiffres."], "Thí nghiệm cần người tham gia chán trước: « une tâche volontairement fastidieuse »."),
      qcm("Pourquoi l'auteur parle-t-il des écrivains ?", "Pour illustrer qu'une idée peut naître d'un moment vide.", ["Pour conseiller la lecture de romans aux enfants qui s'ennuient le mercredi.", "Pour montrer que les écrivains s'ennuient souvent."], "« trouvé le début d'un roman en regardant la pluie tomber » minh hoạ cho câu « C'est souvent dans ces moments que surgissent les idées »."),
      qcm("Pourquoi l'auteur précise-t-il que l'ennui permanent peut être un malaise ?", "Pour éviter qu'on déforme sa pensée.", ["Pour conseiller de consulter un médecin.", "Pour contredire les chercheurs cités."], "Tác giả rào trước: « Il ne s'agit pas de faire l'éloge de l'ennui permanent »."),
      qcm("À qui s'adresse indirectement la dernière phrase ?", "Aux parents qui chargent l'emploi du temps des enfants.", ["Aux enseignants qui donnent trop de devoirs le mercredi.", "Aux enfants qui passent trop de temps devant un écran."], "« Les parents qui remplissent chaque mercredi de cours et d'ateliers devraient peut-être y penser »."),
    ],
    tu: ["un temps mort : khoảng thời gian trống", "fastidieux (adjectif) : nhàm chán, tẻ nhạt", "vagabonder (verbe) : lang thang, (ý nghĩ) trôi đi", "surgir (verbe) : bất chợt xuất hiện", "faire l'éloge de : ca ngợi"],
    meo: ["Câu « Pourquoi l'auteur cite-t-il… ? » hỏi CHỨC NĂNG của chi tiết: ví dụ, bằng chứng, rào đón, hay lời khuyên. Tìm câu ý chính mà chi tiết đó minh hoạ.", "Phương án sai thường lấy chữ trong chính chi tiết (« gobelets », « écrivains ») nhưng gán sai mục đích."] },

  /* ───────── B2-CE-2.4 : bẫy kiến thức nền ───────── */
  { ma: "B2-CE-2", vong: "hoc", tieuDe: tq("vrai, mais pas dans le texte"), de: "<p>Lisez ce texte, puis répondez aux questions. Attention : répondez uniquement d'après le texte, même si une autre réponse vous paraît vraie dans la réalité.</p>",
    van: tl("Le loup, un retour qui divise") + p(
      "Disparu de France dans les années 1930, le loup est revenu naturellement par les Alpes au début des années 1990, depuis l'Italie. Aujourd'hui, on estime sa population à plus d'un millier d'individus, et il a été observé jusque dans des régions où personne ne l'attendait.",
      "Pour les éleveurs de moutons, ce retour est vécu comme une épreuve. Les attaques se comptent par milliers chaque année, et les clôtures électriques, les chiens de protection et les bergers supplémentaires ont un coût que les aides publiques ne couvrent pas entièrement. Au-delà de l'argent, beaucoup évoquent la fatigue de nuits passées à surveiller le troupeau.",
      "Les naturalistes rappellent que le loup joue un rôle dans les écosystèmes : en chassant cerfs et chevreuils, il limite leur nombre et permet aux jeunes arbres de repousser. Mais ils admettent que cet effet, bien documenté dans de grands espaces sauvages, est plus difficile à mesurer dans les paysages français, façonnés par l'homme.",
      "Entre ces deux mondes, l'État tente de tenir un équilibre : l'espèce reste protégée, mais un certain nombre de loups peuvent être abattus chaque année lorsque les attaques se répètent. Une solution qui ne satisfait vraiment personne."),
    cau: [
      qcm("Selon le texte, comment le loup est-il revenu en France ?", "Naturellement, en venant d'Italie.", ["Il a été réintroduit par des associations.", "Il est arrivé d'Espagne par les Pyrénées."], "« revenu naturellement par les Alpes… depuis l'Italie ». Bài không nhắc Tây Ban Nha hay việc thả lại."),
      qcm("D'après le texte, quelle difficulté les éleveurs rencontrent-ils ?", "Le coût de la protection des troupeaux.", ["La baisse du prix de la viande d'agneau.", "Le manque de jeunes qui veulent devenir bergers."], "« ont un coût que les aides publiques ne couvrent pas entièrement ». Hai phương án kia có thể đúng ngoài đời nhưng bài không nói."),
      qcm("Au-delà de l'argent, de quoi parlent beaucoup d'éleveurs ?", "De la fatigue liée à la surveillance nocturne.", ["De leur peur d'être eux-mêmes attaqués en montagne par les loups.", "De la colère des touristes en montagne."], "« la fatigue de nuits passées à surveiller le troupeau »."),
      qcm("Selon les naturalistes, le loup…", "aide la forêt à se renouveler.", ["chasse surtout les sangliers et les lapins.", "évite toujours de s'approcher des villages."], "Sói săn hươu nai nên « permet aux jeunes arbres de repousser ». Bài không nói lợn rừng hay làng mạc."),
      qcm("Que reconnaissent les naturalistes ?", "Cet effet est difficile à mesurer en France.", ["Le loup n'a aucun rôle utile dans la nature.", "Le loup a disparu des grands parcs sauvages."], "« plus difficile à mesurer dans les paysages français, façonnés par l'homme »."),
      qcm("Selon le texte, que permet la règle actuelle ?", "D'abattre certains loups après des attaques répétées.", ["De chasser le loup librement pendant toute l'année.", "De rembourser entièrement les pertes des éleveurs."], "« un certain nombre de loups peuvent être abattus chaque année lorsque les attaques se répètent ». Việc bồi hoàn đầy đủ trái với đoạn 2."),
    ],
    tu: ["un éleveur : người chăn nuôi", "un troupeau : đàn (gia súc)", "un chevreuil : hoẵng", "façonner (verbe) : nhào nặn, định hình", "abattre (verbe) : bắn hạ"],
    meo: ["Bẫy kiến thức nền: phương án đúng ngoài đời nhưng bài KHÔNG nói. Với mỗi phương án, hỏi: câu nào trong bài chứng minh?", "Câu hỏi có « Selon le texte », « D'après le texte » là lời nhắc: chỉ dựa vào bài."] },

  /* ───────── B2-CE-2.5 : ý ngầm trong bài xã luận ───────── */
  { ma: "B2-CE-2", vong: "hoc", tieuDe: tq("une tribune sur l'université"), de: DE_SUY,
    van: tl("L'université n'est pas une usine à diplômes") + p("<em>Tribune d'Hélène Vasseur, professeure de philosophie</em>",
      "Chaque année, à la rentrée, on me pose la même question : à quoi sert un diplôme de philosophie ? Sous-entendu : à quel métier mène-t-il, et combien rapporte-t-il ? La question est légitime ; les étudiants et leurs familles investissent du temps et de l'argent. Mais elle révèle une vision de l'université que je crois dangereuse.",
      "Depuis quelques années, les formations sont évaluées selon le taux d'insertion professionnelle de leurs diplômés, mesuré six mois après la fin des études. Les filières qui affichent de bons chiffres reçoivent des moyens supplémentaires ; les autres doivent se justifier. Je n'ai rien contre les chiffres. Je me demande seulement ce qu'on aurait pensé, six mois après leur diplôme, de bien des chercheurs dont les travaux ont changé notre vie des décennies plus tard.",
      "L'université n'a jamais eu pour seule mission de préparer à un emploi. Elle forme des citoyens capables de lire un texte difficile, de douter d'une information, d'argumenter face à quelqu'un qui ne pense pas comme eux. Ces compétences ne figurent dans aucun tableau d'indicateurs ; elles sont pourtant celles dont une démocratie a le plus besoin.",
      "On me répondra que les étudiants doivent bien vivre. C'est vrai, et c'est pourquoi il faut des stages, des liens avec les entreprises, une orientation plus honnête. Mais réduire la valeur d'une formation à un salaire de sortie, c'est oublier que les métiers de demain n'existent pas encore, et que la capacité d'apprendre comptera plus que tout savoir figé."),
    cau: [
      qcm("Que sous-entend la question qu'on pose chaque année à l'auteure ?", "Que la philosophie mène difficilement à un emploi.", ["Que les cours de philosophie sont trop difficiles.", "Que l'université devrait coûter moins cher."], "Chính tác giả giải mã: « Sous-entendu : à quel métier mène-t-il, et combien rapporte-t-il ? »"),
      qcm("Que pense l'auteure de cette question ?", "Elle la comprend mais en rejette la vision.", ["Elle la trouve ridicule et refuse d'y répondre.", "Elle l'accepte car elle partage cette vision."], "« La question est légitime » nhưng « une vision de l'université que je crois dangereuse »."),
      qcm("Avec l'exemple des chercheurs, l'auteure suggère que…", "la valeur d'une formation peut apparaître très tard.", ["les chercheurs trouvent rapidement un emploi bien payé.", "les statistiques sur l'emploi sont souvent fausses."], "Sáu tháng sau tốt nghiệp chưa thấy gì, nhưng công trình của họ thay đổi cuộc sống « des décennies plus tard »."),
      qcm("Quand elle écrit qu'elle n'a rien contre les chiffres, l'auteure…", "écarte un reproche avant de critiquer la méthode.", ["avoue qu'elle préfère les sciences à la philosophie.", "approuve totalement le système d'évaluation actuel."], "Câu rào đón, rồi phản biện ngay sau đó: « Je me demande seulement ce qu'on aurait pensé »."),
      qcm("Selon elle, quelles compétences l'université développe-t-elle ?", "L'esprit critique et l'argumentation.", ["La maîtrise des logiciels et des langues.", "La gestion d'entreprise et la vente."], "« de douter d'une information, d'argumenter face à quelqu'un qui ne pense pas comme eux »."),
      qcm("Pourquoi évoque-t-elle les métiers de demain ?", "Pour montrer que savoir apprendre comptera davantage.", ["Pour encourager les étudiants à choisir l'informatique.", "Pour annoncer la création de nouvelles formations."], "« la capacité d'apprendre comptera plus que tout savoir figé »."),
    ],
    tu: ["une tribune : bài viết quan điểm", "sous-entendu : hàm ý là", "l'insertion professionnelle : việc có việc làm sau khi học", "une filière : ngành học", "figé (adjectif) : cứng nhắc, bất biến"],
    meo: ["Trong xã luận, tác giả hay nhượng bộ trước (« La question est légitime », « C'est vrai ») rồi mới phản bác bằng « Mais ». Ý thật nằm sau « Mais ».", "Câu « On me répondra que… » báo hiệu tác giả đoán trước phản biện để bác nó."] },

  /* ───────── B2-CE-2.6 : suy luận trên bài bình luận (ôn) ───────── */
  { ma: "B2-CE-2", vong: "on", tieuDe: tq("une chronique"), de: DE_SUY,
    van: tl("La queue, nouveau luxe") + p(
      "Il y a, dans mon quartier, une boulangerie devant laquelle on fait la queue quarante minutes le samedi matin. Je l'ai découvert par hasard, en passant à huit heures et demie : une file d'une trentaine de personnes, calmes, téléphone à la main, comme devant l'entrée d'un concert.",
      "J'ai donc rejoint la file, par curiosité professionnelle. Devant moi, un couple filmait l'attente pour ses amis en direct. Derrière moi, une jeune femme m'a confié qu'elle venait de l'autre bout de la ville. Pour le pain ? Non, pour la brioche à la pistache, vue sur les réseaux.",
      "La brioche était bonne. Pas meilleure, me semble-t-il, que celle de la boulangerie d'en face, où personne n'attend et où la vendeuse connaît le prénom de ses clients. Mais celle d'en face n'a pas de vitrine en marbre, ni de sac en papier kraft orné d'un logo minimaliste.",
      "Je ne me moque pas : j'ai fait la queue moi aussi, et j'ai posté une photo. C'est peut-être cela qu'on achète, au fond : moins une brioche qu'une histoire à raconter. Le samedi suivant, je suis retourné en face. La vendeuse m'a demandé si j'avais été malade."),
    cau: [
      qcm("Pourquoi l'auteur compare-t-il la file à l'entrée d'un concert ?", "Pour souligner que l'attente est devenue un événement.", ["Pour expliquer que la boulangerie organise des concerts.", "Pour montrer que les clients sont bruyants et agités."], "« comme devant l'entrée d'un concert »: xếp hàng mua bánh thành một sự kiện."),
      qcm("Qu'est-ce qui attire la jeune femme dans cette boulangerie ?", "Un produit vu sur internet.", ["Le prix très bas du pain.", "L'accueil de la vendeuse."], "« pour la brioche à la pistache, vue sur les réseaux »."),
      qcm("Que pense l'auteur de la brioche ?", "Elle n'est pas supérieure à celle d'en face.", ["Elle est de loin la meilleure de toute la ville.", "Elle est trop chère pour sa qualité."], "« Pas meilleure, me semble-t-il, que celle de la boulangerie d'en face »."),
      qcm("En décrivant la vitrine et le sac, l'auteur suggère que…", "le succès tient surtout à l'image du magasin.", ["la boulangerie d'en face devrait fermer bientôt.", "les clients aiment acheter des sacs écologiques."], "Khác biệt nằm ở vẻ ngoài: « vitrine en marbre », « un logo minimaliste », không phải ở bánh."),
      qcm("Quand l'auteur écrit qu'il ne se moque pas, il…", "reconnaît qu'il a lui-même suivi la mode.", ["affirme qu'il n'a jamais fait la queue.", "critique sévèrement les autres clients."], "« j'ai fait la queue moi aussi, et j'ai posté une photo »."),
      qcm("Que montre la question de la vendeuse à la fin ?", "L'absence de l'auteur, client fidèle, a été remarquée.", ["La vendeuse s'inquiète pour la santé de tous les habitants du quartier.", "L'auteur a vraiment été malade après la brioche."], "Bà bán hàng tưởng ông ốm vì tuần trước ông không đến: « si j'avais été malade ». Ông là khách quen."),
    ],
    tu: ["faire la queue : xếp hàng", "par curiosité : vì tò mò", "confier (verbe) : tâm sự", "d'en face : ở phía đối diện", "orné de : được trang trí bằng"],
    meo: ["Chronique (tạp bút) hay hài hước, nói bóng gió. Đừng hiểu từng chữ: câu « La vendeuse m'a demandé si j'avais été malade » nói về sự quen thuộc, không về bệnh.", "Người viết tự giễu mình (« Je ne me moque pas ») để người đọc dễ đồng tình."] },

  /* ───────── B2-CE-2.7 : suy luận trên bài xã luận (ôn) ───────── */
  { ma: "B2-CE-2", vong: "on", tieuDe: tq("un éditorial sur la presse"), de: DE_SUY,
    van: tl("Payer pour s'informer") + p("<em>Éditorial</em>",
      "Nous avons tous pris une mauvaise habitude : celle de considérer l'information comme gratuite. Pendant des années, les journaux ont mis leurs articles en ligne sans rien demander, en espérant que la publicité suffirait à les financer. Elle n'a pas suffi.",
      "Pendant ce temps, les recettes publicitaires sont parties vers les grandes plateformes, qui diffusent nos articles sans les avoir produits. Une enquête sérieuse peut demander des mois de travail, des déplacements, parfois des avocats. Un message viral, lui, ne coûte rien à écrire ; il peut même rapporter beaucoup à celui qui l'invente.",
      "On nous reproche parfois de cacher nos articles derrière un abonnement. Je comprends l'agacement de ceux qui tombent sur un article bloqué. Mais demandons-nous ce qu'il advient d'une démocratie dans laquelle seule l'information qui ne coûte rien circule librement.",
      "Il ne s'agit pas de culpabiliser nos lecteurs, sans qui ce journal n'existerait pas. Il s'agit de rappeler une évidence que nous avons nous-mêmes contribué à faire oublier : une information fiable a un prix. La question est seulement de savoir qui le paie, et ce qu'il attend en échange."),
    cau: [
      qcm("Dans le premier paragraphe, l'auteur reconnaît que…", "les journaux ont eux-mêmes habitué le public à la gratuité.", ["les lecteurs ont toujours refusé de payer pour s'informer.", "la publicité a parfaitement financé les journaux en ligne."], "« les journaux ont mis leurs articles en ligne sans rien demander »; cuối bài nhắc lại « que nous avons nous-mêmes contribué à faire oublier »."),
      qcm("Que reproche-t-il aux grandes plateformes ?", "De profiter d'articles qu'elles n'ont pas produits.", ["De refuser de publier les articles des journaux.", "De demander trop d'argent aux lecteurs."], "« qui diffusent nos articles sans les avoir produits »."),
      qcm("Pourquoi compare-t-il une enquête et un message viral ?", "Pour montrer que l'information douteuse est plus rentable.", ["Pour expliquer comment écrire un bon article en ligne.", "Pour reprocher aux journalistes leur manque de travail."], "Điều tra tốn kém, còn tin lan truyền « ne coûte rien à écrire ; il peut même rapporter beaucoup à celui qui l'invente »."),
      qcm("Quelle attitude adopte-t-il face aux critiques sur les abonnements ?", "Il les comprend tout en défendant son choix.", ["Il les rejette en accusant ses lecteurs d'être égoïstes.", "Il promet de supprimer les abonnements."], "« Je comprends l'agacement » rồi « Mais demandons-nous »."),
      qcm("Quelle menace la question du troisième paragraphe suggère-t-elle ?", "Une démocratie où domineraient des informations peu fiables.", ["La disparition complète de la publicité dans tous les journaux du pays.", "Une hausse importante du prix des abonnements."], "« seule l'information qui ne coûte rien circule librement »: tức là tin không ai trả tiền làm, khó tin cậy."),
      qcm("Que laisse entendre la dernière phrase ?", "D'autres financeurs pourraient vouloir influencer l'information.", ["Les lecteurs paieront bientôt leur abonnement beaucoup moins cher qu'aujourd'hui.", "Le journal va être racheté par une grande plateforme."], "« qui le paie, et ce qu'il attend en échange »: nếu độc giả không trả, người trả tiền khác sẽ đòi điều gì đó."),
    ],
    tu: ["un éditorial : bài xã luận", "les recettes (nom féminin) : doanh thu", "viral (adjectif) : lan truyền nhanh", "l'agacement (nom masculin) : sự bực mình", "culpabiliser (verbe) : làm cho thấy có lỗi"],
    meo: ["Xã luận hay kết bằng câu mở: hãy hỏi « nếu… thì sao? » để tìm ý ngầm (« qui le paie, et ce qu'il attend en échange »).", "Câu hỏi tu từ « demandons-nous ce qu'il advient… » là một lời cảnh báo."] },

  /* ───────── B2-CE-2.8 : chốt, suy luận trộn ───────── */
  { ma: "B2-CE-2", vong: "chot", tieuDe: tq("sept questions d'inférence"), de: DE_SUY,
    van: tl("À Montclar, le cinéma tient bon") + p(
      "Le Rex n'a que cent vingt fauteuils, dont une dizaine grincent de façon inquiétante. Depuis trente ans, c'est Bernard Lafont qui choisit les films, vend les billets et, quand il le faut, répare le projecteur. Il ne prend jamais de vacances en août : « C'est le seul mois où il y a du monde. »",
      "Quand les plateformes de streaming sont arrivées, beaucoup lui ont prédit une fin rapide. Le Rex a perdu des spectateurs, c'est vrai, surtout parmi les jeunes. Mais il a aussi trouvé un nouveau public : des retraités qui viennent en groupe l'après-midi, des écoles des villages voisins, et même quelques adolescents depuis que Bernard organise une soirée par mois où ce sont eux qui choisissent le film.",
      "La mairie verse une subvention chaque année. Le maire en parle avec fierté, mais rappelle aussi que le budget de la commune est serré et que tout se discute. Bernard, lui, a appris à ne pas trop compter dessus : il a déjà repeint la façade avec des bénévoles et lancé une collecte pour changer les fauteuils.",
      "Ce qu'il défend, dit-il, ce n'est pas seulement le cinéma. C'est l'idée qu'un village a besoin d'endroits où l'on se retrouve sans rien avoir à acheter d'autre qu'un billet. Après chaque séance du jeudi, une partie du public reste dans le hall pour discuter du film. Certains, avoue-t-il en souriant, ne l'ont pas vraiment regardé.",
      "Bernard aura soixante-dix ans l'an prochain. Il ne parle pas de retraite. Quand on lui demande qui reprendra le Rex, il montre la jeune femme qui tient la caisse le samedi : « Elle connaît déjà tous les films par cœur. »"),
    cau: [
      qcm("Que suggère la remarque de Bernard sur le mois d'août ?", "Le reste de l'année, la salle est souvent peu remplie.", ["Il préfère partir en vacances pendant l'hiver, quand la montagne est plus calme.", "Les touristes n'aiment pas aller au cinéma."], "« C'est le seul mois où il y a du monde »: các tháng khác vắng."),
      qcm("Comment le Rex est-il présenté au début de l'article ?", "Comme une salle modeste qui tient grâce à un homme.", ["Comme un cinéma moderne qui vient d'être rénové.", "Comme une salle gérée par une grande entreprise."], "Ghế « grincent de façon inquiétante » và một mình Bernard làm mọi việc."),
      qcm("Pourquoi l'auteur mentionne-t-il la soirée des adolescents ?", "Pour montrer comment Bernard a regagné un public perdu.", ["Pour critiquer les goûts des jeunes en matière de films.", "Pour annoncer que le cinéma sera réservé aux jeunes."], "Rạp mất khán giả trẻ, nhưng có lại vài em « depuis que Bernard organise une soirée par mois où ce sont eux qui choisissent le film »."),
      qcm("Que laisse entendre le maire quand il dit que tout se discute ?", "La subvention pourrait un jour être réduite.", ["Le maire veut choisir les films projetés.", "Le cinéma recevra bientôt plus d'argent."], "Ông nhắc « que le budget de la commune est serré »: khoản trợ cấp không chắc chắn."),
      qcm("D'après le texte, pourquoi Bernard a-t-il lancé une collecte ?", "Il ne veut pas dépendre seulement de la mairie.", ["Les plateformes refusent de l'aider financièrement.", "Le cinéma doit fermer à la fin de l'année."], "« a appris à ne pas trop compter dessus », nên tự quyên góp và sơn lại với tình nguyện viên."),
      qcm("Que veut dire Bernard quand il dit que certains n'ont pas vraiment regardé le film ?", "Ils viennent surtout pour retrouver les autres.", ["Ils s'endorment parce que les fauteuils sont confortables.", "Ils trouvent les films choisis trop difficiles."], "Ông bảo vệ nơi gặp gỡ; sau suất chiếu « une partie du public reste dans le hall pour discuter »."),
      qcm("Que comprend-on à la fin de l'article ?", "Bernard a peut-être déjà trouvé qui lui succédera.", ["Bernard va prendre sa retraite l'an prochain et fermer la salle.", "La caissière veut ouvrir son propre cinéma."], "Hỏi ai tiếp quản, ông chỉ cô thu ngân: « Elle connaît déjà tous les films par cœur »."),
    ],
    tu: ["grincer (verbe) : kêu cót két", "prédire (verbe) : tiên đoán", "une subvention : tiền trợ cấp", "une collecte : cuộc quyên góp", "reprendre (verbe) : tiếp quản"],
    meo: ["Bài trộn đủ loại suy luận: ý ngầm, thái độ, mục đích chi tiết, bẫy kiến thức nền. Với mỗi câu, xác định trước nó thuộc loại nào.", "Câu trích lời ngắn của nhân vật (« tout se discute ») thường là chìa khoá ý ngầm: đọc câu ngay trước nó."] },

  /* ───────── B2-CE-3.1 : làm quen dạng bài ───────── */
  { ma: "B2-CE-3", vong: "hoc", tieuDe: tq("qui pense quoi ?"), de: DE_DIEN_DAN("Faut-il interdire le téléphone portable au collège ?"),
    van: dienDan([
      ["Sophie", "Je suis professeure de mathématiques et, depuis que notre collège a interdit les téléphones, l'ambiance a changé : les élèves se parlent à la récréation et il y a moins de disputes nées sur les réseaux. Au début, ils protestaient ; aujourd'hui, beaucoup avouent qu'ils se sentent plus libres. Je ne vois vraiment pas pourquoi on reviendrait en arrière."],
      ["Karim", "Mon fils prend deux bus pour aller au collège. Le téléphone, c'est ce qui me permet de savoir qu'il est bien arrivé, ou de le prévenir si je suis en retard. Qu'on l'interdise en classe, d'accord, c'est du bon sens. Mais le confisquer toute la journée, c'est ignorer la réalité des familles qui habitent loin."],
      ["Hugo", "On parle toujours des dangers du téléphone, jamais de ce qu'il apporte. Moi, je l'utilise pour réviser avec des applications et pour traduire des mots en anglais. Le vrai problème, c'est que personne ne nous apprend à bien l'utiliser. Interdire, c'est facile ; éduquer, c'est plus long mais plus utile."],
    ]),
    cau: [
      f1("L'interdiction a amélioré les relations entre élèves.", "Sophie", "Sophie : « les élèves se parlent à la récréation et il y a moins de disputes »."),
      f1("Il faudrait apprendre aux élèves à se servir de leur téléphone.", "Hugo", "Hugo : « personne ne nous apprend à bien l'utiliser »."),
      f1("Le téléphone rassure les parents.", "Karim", "Karim : « me permet de savoir qu'il est bien arrivé »."),
      f1("Une interdiction limitée aux cours serait acceptable.", "Karim", "Karim : « Qu'on l'interdise en classe, d'accord »."),
      f1("Les élèves ont fini par apprécier la mesure.", "Sophie", "Sophie : « Au début, ils protestaient ; aujourd'hui, beaucoup avouent qu'ils se sentent plus libres »."),
    ],
    tu: ["confisquer (verbe) : tịch thu", "la récréation : giờ ra chơi", "du bon sens : điều hợp lý", "revenir en arrière : quay lại như cũ", "éduquer (verbe) : giáo dục"],
    meo: ["Bài 3 của đề B2: ba ý kiến, mỗi nhận định chọn MỘT người. Một người có thể đúng cho nhiều câu.", "Đọc lướt ba ý kiến, ghi bên cạnh mỗi tên 2, 3 ý chính (Sophie: ổn hơn, học sinh quen; Karim: liên lạc, chỉ cấm trong lớp; Hugo: lợi ích, dạy cách dùng)."] },

  /* ───────── B2-CE-3.2 ───────── */
  { ma: "B2-CE-3", vong: "hoc", tieuDe: tq("végétarien ou pas"), de: DE_DIEN_DAN("Faut-il manger moins de viande ?"),
    van: dienDan([
      ["Élodie", "Je suis végétarienne depuis dix ans, mais je n'ai jamais essayé de convaincre ma famille. Chacun mange ce qu'il veut. En revanche, je trouve normal qu'on informe mieux sur l'impact de l'élevage intensif : la plupart des gens ne savent pas combien d'eau il faut pour produire un kilo de bœuf. Informer, ce n'est pas obliger."],
      ["Marc", "Je suis éleveur dans le Cantal, et j'en ai assez qu'on fasse de nous les coupables. Mes vaches mangent de l'herbe, entretiennent les prairies et font vivre tout un village. Mettre dans le même sac un élevage comme le mien et une usine à poulets, c'est malhonnête. Mangez moins de viande si vous voulez, mais choisissez-la mieux."],
      ["Inès", "Moi, je suis devenue flexitarienne pour une raison très simple : mon budget. La viande de qualité coûte cher, alors j'en mange deux fois par semaine, et je cuisine des lentilles et des pois chiches le reste du temps. Je n'en fais pas une question morale. Et franchement, je n'ai jamais aussi bien mangé."],
    ]),
    cau: [
      f2("Il ne faut pas confondre les différents types d'élevage.", "Marc", "Marc : « Mettre dans le même sac un élevage comme le mien et une usine à poulets, c'est malhonnête »."),
      f2("Son choix alimentaire est d'abord une question d'argent.", "Inès", "Inès : « pour une raison très simple : mon budget »."),
      f2("Le public manque d'informations sur la production de viande.", "Élodie", "Élodie : « la plupart des gens ne savent pas combien d'eau il faut »."),
      f2("Son alimentation s'est améliorée en changeant ses habitudes.", "Inès", "Inès : « je n'ai jamais aussi bien mangé »."),
      f2("Elle respecte les choix alimentaires de ses proches.", "Élodie", "Élodie : « je n'ai jamais essayé de convaincre ma famille. Chacun mange ce qu'il veut »."),
      f2("Il conseille de privilégier la qualité plutôt que la quantité.", "Marc", "Marc : « Mangez moins de viande si vous voulez, mais choisissez-la mieux »."),
    ],
    tu: ["l'élevage intensif : chăn nuôi công nghiệp", "une prairie : đồng cỏ", "mettre dans le même sac : vơ đũa cả nắm", "flexitarien (adjectif) : ăn chay linh hoạt", "les pois chiches : đậu gà"],
    meo: ["Nhận định trong câu hỏi được DIỄN ĐẠT LẠI, không chép nguyên chữ: « confondre » = « mettre dans le même sac ».", "Hai người cùng nói « manger moins » nhưng lý do khác: tìm lý do để phân biệt (tiền, môi trường, chất lượng)."] },

  /* ───────── B2-CE-3.3 ───────── */
  { ma: "B2-CE-3", vong: "hoc", tieuDe: tq("la retraite à 60 ans"), de: DE_DIEN_DAN("Faut-il revenir à la retraite à 60 ans ?"),
    van: dienDan([
      ["Gérard", "J'ai commencé à travailler sur des chantiers à dix-sept ans. À cinquante-huit ans, mon dos ne suit plus, et je ne suis pas le seul. Pour nous, partir à soixante ans n'est pas un caprice, c'est une question de santé. Qu'un cadre qui travaille assis parte plus tard, je le comprends, mais on ne peut pas appliquer la même règle à tout le monde."],
      ["Nathalie", "Je suis infirmière et j'adore mon métier, mais je vois bien que notre population vieillit. Il y a de moins en moins d'actifs pour financer les pensions. Je ne suis pas ravie de travailler plus longtemps, mais je préfère ça plutôt que de voir les retraites baisser pour mes enfants. Il faut être réaliste."],
      ["Thomas", "J'ai trente ans et, franchement, je ne crois plus que je toucherai une retraite correcte. Alors j'épargne de mon côté. Ce qui me choque, c'est que le débat ne porte que sur l'âge. Personne ne parle des seniors qu'on pousse vers la sortie bien avant soixante ans : à quoi sert de reculer l'âge si les entreprises n'embauchent pas les plus de cinquante-cinq ans ?"],
    ]),
    cau: [
      f3("L'âge de départ devrait dépendre de la pénibilité du métier.", "Gérard", "Gérard : « on ne peut pas appliquer la même règle à tout le monde »."),
      f3("Il doute de pouvoir compter un jour sur une pension suffisante.", "Thomas", "Thomas : « je ne crois plus que je toucherai une retraite correcte »."),
      f3("Elle accepte un effort pour protéger les générations futures.", "Nathalie", "Nathalie : « plutôt que de voir les retraites baisser pour mes enfants »."),
      f3("Le débat oublie la situation des salariés âgés au travail.", "Thomas", "Thomas : « Personne ne parle des seniors qu'on pousse vers la sortie »."),
      f3("L'évolution démographique rend un changement nécessaire.", "Nathalie", "Nathalie : « notre population vieillit. Il y a de moins en moins d'actifs »."),
      f3("Sa demande ne relève pas du confort personnel.", "Gérard", "Gérard : « partir à soixante ans n'est pas un caprice, c'est une question de santé »."),
    ],
    tu: ["un chantier : công trường", "un caprice : ý thích nhất thời", "un actif : người đang đi làm", "épargner (verbe) : tiết kiệm", "la pénibilité : sự nặng nhọc"],
    meo: ["Nhận định thường dùng từ trừu tượng (« pénibilité », « démographique ») cho ý mà người viết nói bằng ví dụ cụ thể (« mon dos ne suit plus », « population vieillit »).", "Một nhận định có thể khớp mơ hồ với hai người: chọn người nói RÕ nhất, có câu làm bằng chứng."] },

  /* ───────── B2-CE-3.4 ───────── */
  { ma: "B2-CE-3", vong: "hoc", tieuDe: tq("les cours de langue en ligne"), de: DE_DIEN_DAN("Peut-on vraiment apprendre une langue en ligne ?"),
    van: dienDan([
      ["Lina", "J'apprends l'italien avec une application depuis deux ans, dix minutes par jour, dans le métro. C'est pratique et ça m'a donné de bonnes bases de vocabulaire. Mais le jour où je suis arrivée à Rome, j'étais incapable de suivre une conversation. Les applications donnent l'illusion de progresser ; il manque l'essentiel : parler avec de vraies personnes."],
      ["Pascal", "Je donne des cours d'anglais par visioconférence depuis cinq ans. Mes élèves vivent dans des villages, travaillent en horaires décalés ou s'occupent de jeunes enfants : ils ne pourraient jamais venir dans une école. Pour eux, le cours en ligne n'est pas un choix par défaut, c'est la seule possibilité. Et avec une bonne connexion, on travaille aussi bien qu'en salle."],
      ["Mei", "J'ai essayé les deux. En ligne, j'avais tendance à faire autre chose en même temps : regarder mes messages, préparer un café. En classe, avec d'autres apprenants, je suis plus concentrée et je n'ose pas venir sans avoir fait mes devoirs. Je crois que ça dépend surtout de la personnalité : certains ont besoin d'un cadre."],
    ]),
    cau: [
      f4("L'enseignement à distance ouvre l'apprentissage à des personnes isolées.", "Pascal", "Pascal : « ils ne pourraient jamais venir dans une école »."),
      f4("Les applications ne suffisent pas pour communiquer réellement.", "Lina", "Lina : « il manque l'essentiel : parler avec de vraies personnes »."),
      f4("La présence des autres l'aide à rester sérieuse.", "Mei", "Mei : « avec d'autres apprenants, je suis plus concentrée et je n'ose pas venir sans avoir fait mes devoirs »."),
      f4("L'efficacité dépend du caractère de chacun.", "Mei", "Mei : « ça dépend surtout de la personnalité »."),
      f4("Un cours en ligne peut être aussi efficace qu'un cours en salle.", "Pascal", "Pascal : « on travaille aussi bien qu'en salle »."),
      f4("Elle a découvert ses limites lors d'un voyage.", "Lina", "Lina : « le jour où je suis arrivée à Rome, j'étais incapable de suivre une conversation »."),
    ],
    tu: ["la visioconférence : họp, học qua video", "des horaires décalés : giờ làm lệch ca", "par défaut : vì không còn cách khác", "un apprenant : người học", "un cadre : khuôn khổ, nề nếp"],
    meo: ["Chú ý phân biệt « en ligne » theo hai nghĩa: ứng dụng tự học (Lina) và lớp có giáo viên qua video (Pascal).", "Nhận định về bản thân (« Elle a découvert… », « l'aide à… ») ứng với người kể trải nghiệm riêng."] },

  /* ───────── B2-CE-3.5 : ý kiến gần giống nhau (ôn) ───────── */
  { ma: "B2-CE-3", vong: "on", tieuDe: tq("le vote obligatoire"), de: DE_DIEN_DAN("Faut-il rendre le vote obligatoire ?"),
    van: dienDan([
      ["Arnaud", "Je suis favorable au vote obligatoire, comme en Belgique. Quand seulement la moitié des électeurs se déplacent, les élus ne représentent qu'une partie du pays. Une petite amende suffirait à rappeler que voter est un devoir autant qu'un droit. Mais à une condition : que le vote blanc soit enfin reconnu, pour qu'on puisse dire qu'aucun candidat ne nous convient."],
      ["Céline", "Rendre le vote obligatoire, c'est soigner le symptôme et non la maladie. Si les gens ne votent plus, c'est qu'ils ont le sentiment que leur voix ne change rien. Moi, je préférerais qu'on les consulte plus souvent, sur des questions concrètes de leur ville ou de leur quartier. On retrouverait le goût de voter sans avoir besoin de sanction."],
      ["Yasmine", "Je comprends l'idée, et je vote moi-même à chaque élection. Mais obliger quelqu'un qui ne s'intéresse pas du tout à la politique, c'est l'inviter à choisir au hasard, ou pour le candidat qui crie le plus fort. Je pense qu'il faut commencer par l'école : des cours où l'on explique vraiment comment fonctionnent les institutions."],
    ]),
    cau: [
      f5("Une obligation pourrait produire des votes peu réfléchis.", "Yasmine", "Yasmine : « c'est l'inviter à choisir au hasard »."),
      f5("L'abstention vient d'un sentiment d'impuissance.", "Céline", "Céline : « ils ont le sentiment que leur voix ne change rien »."),
      f5("Il pose une condition à l'obligation de voter.", "Arnaud", "Arnaud : « Mais à une condition : que le vote blanc soit enfin reconnu »."),
      f5("La solution passe par l'éducation des jeunes.", "Yasmine", "Yasmine : « il faut commencer par l'école »."),
      f5("Une sanction financière serait utile.", "Arnaud", "Arnaud : « Une petite amende suffirait »."),
      f5("Les citoyens devraient participer à des décisions locales.", "Céline", "Céline : « sur des questions concrètes de leur ville ou de leur quartier »."),
    ],
    tu: ["un électeur : cử tri", "une amende : tiền phạt", "le vote blanc : phiếu trắng", "l'abstention (nom féminin) : việc không đi bầu", "une sanction : hình phạt"],
    meo: ["Ý kiến gần giống nhau: Céline và Yasmine đều không ủng hộ bắt buộc, nhưng giải pháp khác (hỏi ý dân địa phương / dạy ở trường). Phân biệt bằng GIẢI PHÁP.", "Céline nói « sans avoir besoin de sanction », Arnaud muốn « une petite amende »: chú ý chữ phủ định."] },

  /* ───────── B2-CE-3.6 : chốt, đúng định dạng bài 3 của đề ───────── */
  { ma: "B2-CE-3", vong: "chot", tieuDe: tq("le forum de discussion"), de: DE_DIEN_DAN("Faut-il interdire la publicité pour les produits trop sucrés ?"),
    van: dienDan([
      ["Laurent", "Je suis pédiatre et je vois chaque semaine des enfants en surpoids dès huit ans. Les publicités pour les céréales ou les sodas visent directement les enfants, avec des personnages de dessins animés et des cadeaux dans les paquets. Un enfant de six ans ne sait pas faire la différence entre un message publicitaire et un conseil. Il faut interdire ces publicités aux heures où les enfants sont devant les écrans."],
      ["Amélie", "Interdire la publicité ne changera pas grand-chose si, à la maison, les placards sont remplis de biscuits. Les parents ont leur part de responsabilité. Je préférerais que l'argent public serve à des ateliers de cuisine dans les écoles et à rendre les fruits et légumes moins chers. On mange souvent mal parce que bien manger coûte trop cher."],
      ["Rachid", "Je travaille dans une agence de communication, donc je connais la force d'une publicité. Mais une interdiction totale frapperait aussi de petites entreprises locales, des confiseurs artisanaux par exemple. Je serais plutôt favorable à des règles strictes : une information claire sur le taux de sucre, visible dans chaque publicité, et aucune promotion avec des jouets."],
    ]),
    cau: [
      f6("Les jeunes enfants ne savent pas reconnaître une publicité.", "Laurent", "Laurent : « Un enfant de six ans ne sait pas faire la différence entre un message publicitaire et un conseil »."),
      f6("Le prix des aliments sains explique en partie la mauvaise alimentation.", "Amélie", "Amélie : « On mange souvent mal parce que bien manger coûte trop cher »."),
      f6("Une interdiction aurait des conséquences pour de petits producteurs.", "Rachid", "Rachid : « frapperait aussi de petites entreprises locales »."),
      f6("Les familles sont aussi responsables de ce que mangent les enfants.", "Amélie", "Amélie : « Les parents ont leur part de responsabilité »."),
      f6("Il faudrait encadrer les publicités plutôt que les supprimer.", "Rachid", "Rachid : « Je serais plutôt favorable à des règles strictes »."),
      f6("Il s'appuie sur ce qu'il observe dans son travail.", "Laurent", "Laurent : « je vois chaque semaine des enfants en surpoids dès huit ans »."),
    ],
    tu: ["un pédiatre : bác sĩ nhi", "le surpoids : thừa cân", "un confiseur : thợ làm kẹo", "le taux de sucre : hàm lượng đường", "encadrer (verbe) : đặt khuôn khổ, quy định"],
    meo: ["Đúng định dạng đề: 6 nhận định, 3 người, khoảng 15 phút. Đọc 6 nhận định TRƯỚC, rồi đọc từng ý kiến và đánh dấu nhận định nào khớp.", "Rachid và Laurent cùng nói về quảng cáo cho trẻ: Laurent muốn CẤM theo giờ, Rachid muốn QUY ĐỊNH chặt. Phân biệt mức độ."] },
  ];
};
