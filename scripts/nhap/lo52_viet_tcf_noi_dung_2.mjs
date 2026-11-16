/* Lô 52 (16/11/2026), đợt 2: soạn TIẾP bài Viết TCF cho đủ kế hoạch (PE-1, PE-2, PE-3 bài 3 đến 6; PE-4
 * bài 2 và 3). Cùng khuôn và quy ước với lo52_viet_tcf_noi_dung.mjs; máy dựng nối vào CUỐI danh sách.
 * Toàn bộ do FRACILE soạn, nhân vật và số liệu hư cấu. Không dùng dấu gạch dài. */

const GH = { 1: "(60 mots minimum, 120 mots maximum)", 2: "(120 mots minimum, 150 mots maximum)", 3: "(120 mots minimum, 180 mots maximum)" };
const SYNTHESE = "Vous lisez les deux documents ci-dessous. Vous résumez les deux points de vue (40 à 60 mots), puis vous donnez votre opinion (80 à 120 mots).";

export const BAI2 = [
  /* ═══════════ TCF-PE-1 : Tâche 1 ═══════════ */
  {
    ma: "TCF-PE-1", vong: "hoc", tieuDe: "Écriture TCF : message aux voisins", tache: 1,
    sujet: `Samedi prochain, vous organisez une fête chez vous pour votre anniversaire. Vous écrivez un message à vos voisins pour les prévenir, vous excuser à l'avance pour le bruit et les inviter à passer. ${GH[1]}`,
    qcm: [
      ["Quel est le premier but du message ?", "Prévenir les voisins de la fête.", ["Se plaindre du bruit fait par les voisins.", "Demander aux voisins de garder vos enfants."],
        "Đề nói « pour les prévenir »: báo trước cho hàng xóm."],
      ["Quel ton faut-il employer ?", "Aimable et poli.", ["Très officiel, comme une lettre administrative.", "Familier, avec des abréviations de SMS."],
        "Viết cho « vos voisins »: thân thiện, lịch sự, dùng « vous »."],
      ["Quelle phrase répond à la troisième demande du sujet ?", "N'hésitez pas à passer boire un verre !", ["La fête commencera vers vingt heures, chez moi au deuxième étage.", "Je suis désolé pour le bruit."],
        "Yêu cầu thứ ba là « les inviter à passer »: câu mời « N'hésitez pas à passer » đáp đúng ý này."],
    ],
    model: "Chers voisins,\nSamedi prochain, le 14 juin, je fête mon anniversaire à la maison avec une vingtaine d'amis. La soirée commencera vers vingt heures et se terminera au plus tard à une heure du matin. Je m'excuse à l'avance pour le bruit : nous ferons attention, surtout après minuit. Si vous avez un problème, n'hésitez pas à frapper à ma porte, au deuxième étage. Et surtout, si vous voulez, passez boire un verre avec nous, vous êtes les bienvenus !\nBonne semaine,\nThanh, appartement 2B",
    tu: ["prévenir (verbe) : báo trước", "s'excuser à l'avance : xin lỗi trước", "au plus tard : muộn nhất", "être le bienvenu : được hoan nghênh"],
    meo: ["Đề có ba việc (prévenir, s'excuser, inviter): viết mỗi việc ít nhất một câu rõ ràng.", "Thông tin cụ thể (ngày, giờ, số căn hộ) làm tin nhắn tự nhiên và đủ ý."],
  },
  {
    ma: "TCF-PE-1", vong: "on", tieuDe: "Écriture TCF : courriel au propriétaire", tache: 1,
    sujet: `Le chauffage de votre appartement ne fonctionne plus depuis trois jours. Vous écrivez un courriel à votre propriétaire pour décrire le problème, expliquer les conséquences et lui demander d'intervenir rapidement. ${GH[1]}`,
    qcm: [
      ["À qui écrivez-vous et quel registre utiliser ?", "Au propriétaire, avec un registre poli et formel.", ["À un ami, avec un registre familier.", "À un voisin, avec un registre très familier et des abréviations."],
        "Người nhận là « votre propriétaire »: lịch sự, dùng « vous », câu chào trang trọng."],
      ["Que faut-il expliquer en plus du problème ?", "Les conséquences de la panne.", ["Le prix de votre loyer mensuel.", "Vos projets pour les vacances d'hiver."],
        "Đề yêu cầu « expliquer les conséquences » (hậu quả của việc hỏng sưởi)."],
      ["Quelle formule de politesse convient pour terminer ?", "Je vous remercie par avance. Cordialement.", ["À plus, bisous !", "Salut, à bientôt !"],
        "Gửi chủ nhà: « Je vous remercie par avance. Cordialement. » vừa lịch sự vừa đúng kiểu email."],
    ],
    model: "Objet : panne de chauffage\nMonsieur Martin,\nJe vous écris car le chauffage de l'appartement ne fonctionne plus depuis lundi. Les radiateurs restent froids, même au maximum. Avec les températures actuelles, il fait moins de quinze degrés dans le salon, et ma fille de deux ans a déjà attrapé un rhume. Je dois utiliser un petit radiateur électrique, ce qui va augmenter ma facture. Pourriez-vous envoyer un technicien le plus rapidement possible ? Je suis disponible tous les jours après dix-sept heures.\nJe vous remercie par avance.\nCordialement,\nNgoc Anh Tran",
    tu: ["une panne : sự hỏng hóc", "un radiateur : lò sưởi", "attraper un rhume : bị cảm lạnh", "intervenir (verbe) : can thiệp, đến xử lý"],
    meo: ["Email phàn nàn: mô tả (chuyện gì) → hậu quả (ảnh hưởng ra sao) → yêu cầu (muốn gì, khi nào).", "Cho biết thời gian mình có mặt giúp yêu cầu cụ thể và dễ thực hiện."],
  },
  {
    ma: "TCF-PE-1", vong: "on", tieuDe: "Écriture TCF : organiser un départ", tache: 1,
    sujet: `Votre collègue Sophie quitte l'entreprise à la fin du mois. Vous écrivez un message à toute l'équipe pour proposer d'organiser une petite fête, expliquer ce que vous avez prévu et demander à chacun de participer. ${GH[1]}`,
    qcm: [
      ["Qui sont les destinataires ?", "Toute l'équipe, sauf Sophie.", ["Sophie seulement, pour l'inviter.", "Le directeur de l'entreprise, pour demander un budget."],
        "Đề nói « un message à toute l'équipe »; vì là tiệc chia tay bất ngờ, không gửi cho Sophie."],
      ["Que devez-vous expliquer ?", "Ce que vous avez prévu pour la fête.", ["Pourquoi Sophie quitte l'entreprise.", "Le nom de la personne qui va remplacer Sophie."],
        "Đề yêu cầu « expliquer ce que vous avez prévu »."],
      ["Comment « demander à chacun de participer » ?", "Proposer une petite somme pour un cadeau.", ["Exiger que chacun apporte un plat cher.", "Obliger tout le monde à rester tard le soir."],
        "« demander à chacun de participer »: mời góp một khoản nhỏ hoặc một món là cách lịch sự."],
    ],
    model: "Bonjour à tous,\nComme vous le savez, Sophie nous quitte le 30 juin après huit ans dans l'équipe. Je vous propose d'organiser un petit pot de départ le vendredi 27 juin à 17 h, dans la salle de réunion. J'ai prévu de commander des gâteaux et des boissons, et d'acheter un cadeau : un bon pour un week-end à la mer, car elle adore voyager. Pour le cadeau, pourriez-vous participer à hauteur de dix euros ? Vous pouvez me donner l'argent avant mercredi. Surtout, ne dites rien à Sophie, c'est une surprise !\nMerci à tous,\nDavid",
    tu: ["un pot de départ : tiệc chia tay", "à hauteur de : ở mức", "un bon (cadeau) : phiếu quà tặng", "une surprise : điều bất ngờ"],
    meo: ["Tin nhắn cho nhóm: nêu ngày, giờ, địa điểm ngay đầu.", "Kết bằng việc cụ thể mỗi người cần làm và hạn chót."],
  },
  {
    ma: "TCF-PE-1", vong: "chot", tieuDe: "Écriture TCF : demande d'informations", tache: 1,
    sujet: `Vous voulez suivre des cours de français le soir. Vous écrivez un courriel à une école de langues pour vous présenter rapidement, expliquer votre objectif et demander des informations sur les cours (horaires, prix, niveau). ${GH[1]}`,
    qcm: [
      ["Combien de parties le courriel doit-il contenir ?", "Trois : présentation, objectif, questions.", ["Une seule : la liste des questions.", "Deux : la présentation de vous-même et le paiement des cours."],
        "Đề có ba việc: « vous présenter rapidement », « expliquer votre objectif » và « demander des informations »."],
      ["Comment doit être la présentation ?", "Courte.", ["Très détaillée, avec tout votre parcours.", "Absente, l'école n'en a pas besoin."],
        "Đề ghi « vous présenter rapidement »: một hai câu là đủ."],
      ["Quelle question est la plus adaptée ?", "Quels sont les horaires des cours du soir ?", ["Tu peux m'appeler ce soir ?", "C'est combien, les cours, hein ?"],
        "Gửi trường học cần câu hỏi lịch sự, đúng chủ đề « horaires, prix, niveau »."],
    ],
    model: "Objet : cours de français du soir\nMadame, Monsieur,\nJe m'appelle Hoang, j'ai trente-deux ans et je travaille comme ingénieur à Lyon depuis six mois. Je souhaite améliorer mon français pour passer le TCF l'année prochaine, car je veux demander la nationalité. Mon niveau actuel est environ B1. Pourriez-vous m'indiquer les horaires de vos cours du soir et leur prix ? Proposez-vous un test de niveau avant l'inscription ? Enfin, est-il possible de commencer en cours d'année ?\nJe vous remercie de votre réponse.\nCordialement,\nHoang Minh",
    tu: ["le niveau actuel : trình độ hiện tại", "un test de niveau : bài kiểm tra xếp lớp", "en cours d'année : giữa năm học", "la nationalité : quốc tịch"],
    meo: ["Câu hỏi trong email trang trọng: « Pourriez-vous m'indiquer… », « Est-il possible de… ».", "Mỗi câu hỏi nhắm một thông tin đề yêu cầu (giờ, giá, trình độ)."],
  },

  /* ═══════════ TCF-PE-2 : Tâche 2 ═══════════ */
  {
    ma: "TCF-PE-2", vong: "hoc", tieuDe: "Écriture TCF : mon premier emploi", tache: 2,
    sujet: `Un site d'orientation pour les jeunes publie des témoignages sur le thème « Mon premier emploi ». Vous racontez votre premier travail et vous expliquez ce qu'il vous a appris. ${GH[2]}`,
    qcm: [
      ["À qui s'adresse le témoignage ?", "À des jeunes qui cherchent leur voie.", ["À votre ancien patron.", "Aux clients de votre premier employeur."],
        "Bài đăng trên « Un site d'orientation pour les jeunes »: người đọc là bạn trẻ đang định hướng nghề."],
      ["Quelles sont les deux parties attendues ?", "Le récit du travail et ce qu'il vous a appris.", ["Votre CV et une lettre de motivation.", "Le salaire exact et les horaires précis de votre premier travail."],
        "Đề đòi « vous racontez votre premier travail » và « vous expliquez ce qu'il vous a appris »."],
      ["Quel connecteur introduit bien la partie « leçon » ?", "Avec le recul, je comprends que…", ["Tout d'abord, je suis né en…", "Pour commencer, voici mon adresse."],
        "« Avec le recul » (nhìn lại) mở phần rút ra bài học."],
    ],
    model: "À dix-huit ans, j'ai trouvé mon premier emploi dans une pizzeria de mon quartier, pendant les vacances d'été. Je prenais les commandes au téléphone et je servais les clients en salle. Les premiers jours ont été difficiles : je me trompais dans les commandes et je n'osais pas parler aux clients mécontents. Mais la patronne m'a beaucoup aidé, et au bout d'un mois, je me sentais à l'aise.\nAvec le recul, je comprends que ce petit travail m'a appris l'essentiel. J'ai découvert l'importance de l'organisation et du travail en équipe. J'ai surtout appris à garder mon calme face aux problèmes. Aujourd'hui, je suis infirmier, et ces qualités me servent chaque jour. Alors, à tous les jeunes : n'ayez pas peur des petits boulots, ils forment plus qu'on ne le croit !",
    tu: ["un petit boulot : việc làm thêm", "une commande : đơn gọi món", "mécontent (adjectif) : không hài lòng", "être à l'aise : thoải mái", "avec le recul : nhìn lại"],
    meo: ["Kết bài bằng một lời khuyên cho người đọc (« à tous les jeunes ») phù hợp với trang định hướng.", "Đoạn bài học nên có 2 hoặc 3 ý cụ thể, không chỉ « j'ai beaucoup appris »."],
  },
  {
    ma: "TCF-PE-2", vong: "on", tieuDe: "Écriture TCF : une fête de mon pays", tache: 2,
    sujet: `Un forum international demande aux participants de présenter une fête traditionnelle de leur pays. Vous racontez comment vous avez célébré cette fête la dernière fois et vous dites ce qu'elle représente pour vous. ${GH[2]}`,
    qcm: [
      ["Qui va lire le texte ?", "Des personnes de différents pays.", ["Seulement des personnes de votre famille.", "Le gouvernement de votre pays."],
        "Đây là « Un forum international »: người đọc không biết lễ hội, cần giải thích rõ."],
      ["Quel temps utiliser pour raconter la dernière fête ?", "Le passé composé et l'imparfait.", ["Le futur simple seulement.", "Le présent du subjonctif."],
        "Đề nói « la dernière fois »: chuyện đã qua."],
      ["Que faut-il ajouter au récit ?", "Ce que la fête représente pour vous.", ["La liste de toutes les fêtes du monde.", "Le prix des billets d'avion pour votre pays."],
        "Đề đòi « vous dites ce qu'elle représente pour vous »."],
    ],
    model: "Au Vietnam, la fête la plus importante est le Têt, le Nouvel An lunaire. L'année dernière, je suis rentré à Huê pour le célébrer avec ma famille. Pendant une semaine, nous avons nettoyé et décoré la maison avec des fleurs de pêcher. La veille du Nouvel An, toute la famille s'est réunie autour d'un grand repas, avec le gâteau de riz traditionnel. À minuit, nous avons écouté les pétards et les enfants ont reçu des enveloppes rouges avec un peu d'argent.\nPour moi, le Têt représente avant tout les retrouvailles. Depuis que je vis en France, je ne vois ma famille qu'une fois par an, et ce moment est précieux. C'est aussi l'occasion de remercier nos ancêtres et de commencer l'année avec de bonnes résolutions.",
    tu: ["le Nouvel An lunaire : Tết âm lịch", "la veille : đêm trước", "les pétards : pháo", "les retrouvailles : sự đoàn tụ", "les ancêtres : tổ tiên"],
    meo: ["Người đọc nước ngoài: giải thích ngắn từ riêng (« le Têt, le Nouvel An lunaire »).", "Đoạn cảm nghĩ mở bằng « Pour moi, … représente avant tout… »."],
  },
  {
    ma: "TCF-PE-2", vong: "on", tieuDe: "Écriture TCF : un service public", tache: 2,
    sujet: `Le journal de votre ville demande aux habitants de partager une expérience avec un service public (hôpital, mairie, bibliothèque, transports…). Vous racontez cette expérience et vous donnez votre avis sur la qualité du service, avec une proposition d'amélioration. ${GH[2]}`,
    qcm: [
      ["Combien d'éléments le texte doit-il contenir ?", "Trois : récit, avis, proposition.", ["Un seul : le récit de l'expérience.", "Deux : l'avis et le nom des employés."],
        "Đề đòi kể « cette expérience », nêu « votre avis » và đưa « une proposition d'amélioration »."],
      ["Votre avis doit-il être négatif ?", "Non, il peut être positif ou négatif.", ["Oui, il faut toujours critiquer le service.", "Non, il faut rester totalement neutre."],
        "Đề chỉ nói « votre avis sur la qualité du service »: khen hay chê đều được, miễn có lý do."],
      ["Quelle proposition est la plus réaliste ?", "Ouvrir le service un soir par semaine.", ["Supprimer complètement le service public.", "Rendre tous les services gratuits pour tous."],
        "Đề xuất cụ thể, khả thi thuyết phục hơn ý cực đoan."],
    ],
    model: "Le mois dernier, j'ai dû renouveler mon titre de séjour à la préfecture. J'avais pris rendez-vous en ligne trois semaines à l'avance. Le jour venu, l'accueil était organisé : un agent m'a orienté vers le bon guichet et je n'ai attendu que vingt minutes. L'employée a été patiente et m'a expliqué clairement les documents qui manquaient.\nGlobalement, je suis satisfait de ce service, qui s'est beaucoup amélioré. Cependant, prendre rendez-vous reste difficile : les créneaux disparaissent en quelques minutes, et beaucoup de personnes n'ont pas accès à internet. Je propose donc d'ouvrir une ligne téléphonique pour les rendez-vous, et un guichet sans rendez-vous un soir par semaine pour les personnes qui travaillent. Ce serait un vrai progrès pour tous les usagers.",
    tu: ["renouveler (verbe) : gia hạn", "un titre de séjour : thẻ cư trú", "un guichet : quầy giao dịch", "un créneau : khung giờ", "globalement : nhìn chung"],
    meo: ["Ý kiến cân bằng: một điểm tốt, một điểm cần cải thiện, rồi đề xuất.", "Đề xuất bắt đầu bằng « Je propose donc de… » nối tự nhiên với phần chê."],
  },
  {
    ma: "TCF-PE-2", vong: "chot", tieuDe: "Écriture TCF : un livre qui m'a marqué", tache: 2,
    sujet: `Le blog de la médiathèque de votre quartier publie une rubrique « Le livre qui m'a marqué ». Vous présentez un livre que vous avez lu, vous racontez dans quelles circonstances vous l'avez découvert et vous expliquez pourquoi vous le recommandez. ${GH[2]}`,
    qcm: [
      ["Combien de tâches le sujet demande-t-il ?", "Trois : présenter, raconter la découverte, recommander.", ["Une seule : résumer toute l'histoire du livre.", "Deux : donner le prix du livre et la biographie complète de son auteur."],
        "Đề có ba việc: « vous présentez un livre », « vous racontez dans quelles circonstances » và « vous expliquez pourquoi vous le recommandez »."],
      ["Faut-il raconter toute l'histoire du livre ?", "Non, une courte présentation suffit.", ["Oui, avec tous les détails et la fin.", "Oui, chapitre par chapitre."],
        "Giới thiệu ngắn để còn chỗ cho phần kể và phần khuyên; kể hết truyện sẽ vượt 150 từ."],
      ["Quelle phrase sert bien la recommandation ?", "Je le conseille à tous ceux qui aiment les histoires vraies.", ["Le livre a 320 pages.", "Je l'ai acheté dans une petite librairie de mon quartier, l'an dernier."],
        "Lời khuyên nêu đối tượng người đọc phù hợp: « Je le conseille à tous ceux qui… »."],
    ],
    model: "Le livre qui m'a le plus marqué est un roman intitulé « Le Pays des oranges », d'une autrice canadienne. Il raconte l'histoire d'une jeune femme qui quitte son village pour étudier en ville et qui doit apprendre à vivre entre deux cultures.\nJe l'ai découvert il y a deux ans, pendant un long voyage en train. Une passagère l'avait oublié sur son siège. J'ai commencé à le lire par curiosité, et je ne l'ai plus lâché jusqu'à l'arrivée.\nJe recommande ce livre pour deux raisons. D'abord, le style est simple mais très émouvant, donc il est accessible même aux lecteurs qui apprennent le français. Ensuite, beaucoup de personnes qui ont quitté leur pays se reconnaîtront dans l'héroïne. Je le conseille à tous ceux qui aiment les histoires de vie !",
    tu: ["intitulé (adjectif) : có tựa đề", "par curiosité : vì tò mò", "lâcher (verbe) : buông", "émouvant (adjectif) : cảm động", "se reconnaître dans : thấy mình trong"],
    meo: ["Chia ba đoạn đúng ba việc của đề: dễ cho người chấm thấy bài đủ ý.", "Lời khuyên có hai lý do nối bằng « D'abord… Ensuite… »."],
  },

  /* ═══════════ TCF-PE-3 : Tâche 3 ═══════════ */
  {
    ma: "TCF-PE-3", vong: "hoc", tieuDe: "Écriture TCF : coder à l'école", tache: 3,
    sujet: `Un site d'éducation pose la question : « Faut-il apprendre à coder dès l'école primaire ? » ${SYNTHESE} ${GH[3]}`,
    docs: [
      "<strong>Document 1</strong> : « Le numérique est partout. Apprendre à coder tôt, c'est comprendre comment fonctionnent les outils que l'on utilise chaque jour, et se préparer aux métiers de demain. » <em>Lucie, ingénieure</em>",
      "<strong>Document 2</strong> : « À l'école primaire, les enfants ont d'abord besoin de bien lire, écrire et compter. Ajouter le code, c'est surcharger des programmes déjà trop chargés. » <em>Bernard, instituteur</em>",
    ],
    qcm: [
      ["Quel argument Lucie avance-t-elle ?", "Comprendre les outils numériques et préparer l'avenir.", ["Les enfants doivent d'abord apprendre à bien lire et à bien écrire.", "Le code remplace les mathématiques."],
        "Lucie viết « comprendre comment fonctionnent les outils » và « se préparer aux métiers de demain »."],
      ["Que craint Bernard ?", "Que les programmes soient trop chargés.", ["Que les enfants n'aiment pas les ordinateurs.", "Que les métiers de demain disparaissent."],
        "Bernard nói thêm môn lập trình là « surcharger des programmes déjà trop chargés »."],
      ["Quelle phrase résume bien les deux positions ?", "Lucie veut enseigner le code tôt, tandis que Bernard préfère les bases.", ["Lucie et Bernard veulent tous deux plus d'heures de mathématiques.", "Bernard est ingénieur et Lucie est institutrice."],
        "« tandis que » nối hai ý trái ngược, mỗi người một vế, đúng cách tóm tắt."],
    ],
    model: "Pour Lucie, ingénieure, apprendre à coder dès l'école primaire permet de comprendre les outils numériques du quotidien et de préparer les métiers de demain. Bernard, instituteur, estime au contraire que les enfants doivent d'abord maîtriser la lecture, l'écriture et le calcul, et que le code surchargerait les programmes.\nÀ mon avis, il est possible de concilier les deux points de vue. Il ne s'agit pas d'ajouter une matière, mais d'intégrer le code de façon ludique dans les cours existants. Par exemple, programmer un petit robot pour qu'il suive un chemin fait travailler la logique et les mathématiques. Mon neveu a fait cette activité en CM1, et il a enfin compris les angles ! En revanche, je suis d'accord avec Bernard : les bases restent prioritaires. Le code doit donc rester un outil au service des apprentissages fondamentaux, pas une fin en soi.",
    tu: ["surcharger (verbe) : làm quá tải", "maîtriser (verbe) : nắm vững", "ludique (adjectif) : mang tính vui chơi", "une fin en soi : mục đích tự thân", "concilier (verbe) : dung hoà"],
    meo: ["Tóm tắt: nghề nghiệp của người nói + ý chính, viết lại bằng từ của mình.", "Ý kiến thuyết phục khi đồng ý một phần với bên kia (« je suis d'accord avec Bernard : … »)."],
  },
  {
    ma: "TCF-PE-3", vong: "on", tieuDe: "Écriture TCF : l'uniforme scolaire", tache: 3,
    sujet: `Un magazine pour parents ouvre un débat : « Faut-il imposer l'uniforme à l'école ? » ${SYNTHESE} ${GH[3]}`,
    docs: [
      "<strong>Document 1</strong> : « Avec l'uniforme, plus de concours de marques. Les élèves sont tous égaux, et les familles modestes ne se sentent plus jugées. » <em>Isabelle, mère de trois enfants</em>",
      "<strong>Document 2</strong> : « L'adolescence est l'âge où l'on construit sa personnalité. Imposer les mêmes vêtements à tous, c'est empêcher les jeunes de s'exprimer. Et l'uniforme coûte cher. » <em>Théo, lycéen</em>",
    ],
    qcm: [
      ["Selon Isabelle, quel est l'avantage de l'uniforme ?", "Il réduit les différences sociales visibles.", ["Il permet aux jeunes d'exprimer leur personnalité.", "Il coûte moins cher que les vêtements de marque."],
        "Isabelle nói « Les élèves sont tous égaux, et les familles modestes ne se sentent plus jugées »."],
      ["Quels sont les deux arguments de Théo ?", "L'expression de soi et le coût.", ["L'égalité et la sécurité.", "Le confort et la mode."],
        "Théo nói uniforme « empêcher les jeunes de s'exprimer » và « l'uniforme coûte cher »."],
      ["Quel connecteur convient pour introduire une concession dans votre opinion ?", "Certes, … mais…", ["Tout d'abord…", "En conclusion…"],
        "« Certes, … mais… » là cấu trúc nhượng bộ: thừa nhận ý bên kia rồi phản bác."],
    ],
    model: "Isabelle, mère de famille, défend l'uniforme : selon elle, il supprime la compétition entre marques et protège les familles modestes du jugement des autres. Théo, lycéen, s'y oppose, car il empêcherait les adolescents d'exprimer leur personnalité et représenterait une dépense importante.\nPersonnellement, je suis plutôt favorable à une tenue commune, mais simple. Certes, l'adolescence est une période où l'on cherche son style, mais l'école n'est pas le seul lieu pour s'exprimer : le week-end et les loisirs offrent beaucoup de liberté. Au Vietnam, j'ai porté l'uniforme pendant toute ma scolarité, et je n'ai jamais eu le sentiment de perdre ma personnalité. Au contraire, le matin, je n'avais pas à choisir mes vêtements ! Pour répondre à l'argument du coût, l'école pourrait proposer des tenues à prix réduit ou d'occasion. Ainsi, l'uniforme favoriserait l'égalité sans peser sur le budget des familles.",
    tu: ["un concours de marques : cuộc đua hàng hiệu", "modeste (adjectif) : khiêm tốn, thu nhập thấp", "une tenue : trang phục", "la scolarité : thời đi học", "peser sur : đè nặng lên"],
    meo: ["Dùng « Certes, … mais… » để nhượng bộ: điểm cộng cho tiêu chí lập luận.", "Trả lời từng lý lẽ của bên kia (ở đây là « coût ») làm ý kiến chặt chẽ."],
  },
  {
    ma: "TCF-PE-3", vong: "on", tieuDe: "Écriture TCF : les vols courts", tache: 3,
    sujet: `Un journal en ligne pose la question : « Faut-il interdire les vols en avion quand le train fait le même trajet en moins de quatre heures ? » ${SYNTHESE} ${GH[3]}`,
    docs: [
      "<strong>Document 1</strong> : « Un trajet en avion pollue beaucoup plus qu'en train. Quand une alternative rapide existe, continuer à prendre l'avion n'a plus de sens face à l'urgence climatique. » <em>Amélie, militante écologiste</em>",
      "<strong>Document 2</strong> : « Le train coûte souvent plus cher que l'avion, et beaucoup de petites villes ne sont pas bien desservies. Interdire les vols pénaliserait d'abord les familles et les régions isolées. » <em>Patrick, maire d'une petite ville</em>",
    ],
    qcm: [
      ["Sur quoi Amélie fonde-t-elle sa position ?", "La pollution causée par l'avion.", ["Le prix élevé des billets de train.", "Le manque de gares dans les régions."],
        "Amélie nói « Un trajet en avion pollue beaucoup plus qu'en train »."],
      ["Qui serait pénalisé selon Patrick ?", "Les familles et les régions isolées.", ["Les compagnies aériennes.", "Les militants écologistes."],
        "Patrick viết cấm bay « pénaliserait d'abord les familles et les régions isolées »."],
      ["Quelle phrase de synthèse est correcte ?", "Amélie veut supprimer ces vols pour le climat, alors que Patrick craint leurs effets sociaux.", ["Amélie et Patrick souhaitent augmenter le prix du train.", "Patrick pense que l'avion pollue moins que le train."],
        "« alors que » đặt mỗi người một vế: Amélie vì khí hậu, Patrick lo hậu quả xã hội."],
    ],
    model: "Amélie, militante écologiste, souhaite interdire les vols courts lorsqu'un train rapide existe, car l'avion pollue bien davantage. Patrick, maire d'une petite ville, s'y oppose : le train est souvent plus cher et mal adapté aux régions isolées, qui seraient les premières pénalisées.\nSelon moi, l'interdiction est justifiée, mais seulement si le train devient une vraie solution pour tous. Il est vrai que l'urgence climatique impose de réduire les vols inutiles. Cependant, on ne peut pas demander aux familles de payer deux fois plus cher pour voyager. Par exemple, l'été dernier, un billet de train pour quatre personnes entre Paris et Marseille coûtait près de quatre cents euros, contre deux cents en avion. L'État devrait donc d'abord baisser le prix du train et améliorer les lignes vers les petites villes. Une fois ces conditions réunies, interdire les vols courts serait à la fois écologique et juste.",
    tu: ["une alternative : giải pháp thay thế", "l'urgence climatique : tình trạng khẩn cấp khí hậu", "desservi (participe) : có tuyến giao thông tới", "pénaliser (verbe) : gây thiệt thòi", "réunir des conditions : đủ điều kiện"],
    meo: ["Ý kiến có điều kiện (« oui, mais seulement si… ») là cách hay để dung hoà hai bên.", "Ví dụ có con số cụ thể (giá vé) làm lập luận thuyết phục, nhưng đừng bịa số không hợp lý."],
  },
  {
    ma: "TCF-PE-3", vong: "chot", tieuDe: "Écriture TCF : les réseaux sociaux", tache: 3,
    sujet: `Un forum de discussion propose le thème : « Les réseaux sociaux rapprochent-ils les gens ? » ${SYNTHESE} ${GH[3]}`,
    docs: [
      "<strong>Document 1</strong> : « Grâce aux réseaux sociaux, je parle chaque jour avec ma famille restée au Brésil. Sans eux, l'exil serait beaucoup plus difficile. » <em>Carla, étudiante</em>",
      "<strong>Document 2</strong> : « On a des centaines d'amis en ligne, mais on ne voit plus personne. Les réseaux remplacent les vraies rencontres par des échanges superficiels. » <em>Gérard, psychologue</em>",
    ],
    qcm: [
      ["Quelle expérience Carla décrit-elle ?", "Garder le contact avec sa famille à l'étranger.", ["Rencontrer de nouveaux amis brésiliens dans sa ville universitaire.", "Trouver un emploi grâce aux réseaux."],
        "Carla viết « je parle chaque jour avec ma famille restée au Brésil »."],
      ["Que reproche Gérard aux réseaux sociaux ?", "Ils remplacent les vraies rencontres.", ["Ils coûtent trop cher aux utilisateurs.", "Ils sont interdits dans certains pays."],
        "Gérard nói mạng xã hội « remplacent les vraies rencontres par des échanges superficiels »."],
      ["Dans la synthèse, comment présenter les deux avis ?", "Avec vos propres mots, sans donner encore votre opinion.", ["En recopiant les deux documents mot pour mot.", "En donnant tout de suite votre avis personnel, avant les deux documents."],
        "Phần tóm tắt chỉ trình bày hai ý bằng lời mình; ý kiến riêng để ở phần sau."],
    ],
    model: "Pour Carla, étudiante, les réseaux sociaux sont précieux : ils lui permettent de garder un lien quotidien avec sa famille restée au Brésil et rendent l'exil plus supportable. Gérard, psychologue, pense au contraire qu'ils isolent, en remplaçant les rencontres réelles par des relations superficielles.\nÀ mon avis, les réseaux sociaux rapprochent ceux qui sont loin, mais peuvent éloigner ceux qui sont proches. Comme Carla, je vis loin de mes parents, et les appels vidéo me permettent de voir grandir mes neveux. Sans cet outil, je me sentirais beaucoup plus seule. En revanche, je remarque que, lors des repas entre amis, chacun regarde souvent son téléphone au lieu de parler. Tout dépend donc de l'usage que l'on en fait. Les réseaux devraient compléter les relations réelles, et non les remplacer. Pour ma part, j'essaie de laisser mon téléphone dans mon sac quand je suis avec mes amis.",
    tu: ["l'exil (nom masculin) : cuộc sống xa xứ", "supportable (adjectif) : chịu đựng được", "superficiel (adjectif) : hời hợt", "au lieu de : thay vì", "compléter (verbe) : bổ sung"],
    meo: ["Câu ý kiến cân bằng ngắn gọn: « rapprochent ceux qui sont loin, mais peuvent éloigner ceux qui sont proches ».", "Kết bằng hành động cá nhân cụ thể giúp bài tự nhiên, có dấu ấn riêng."],
  },

  /* ═══════════ TCF-PE-4 : Ba tâche trong 60 phút ═══════════ */
  {
    ma: "TCF-PE-4", vong: "chot", tieuDe: "Écriture TCF : trois tâches, sujet 2", phut: 60,
    taches: [
      { tache: 1, sujet: `Vous avez trouvé un portefeuille dans le bus. Vous écrivez un message sur le groupe de votre quartier pour décrire l'objet, expliquer où et quand vous l'avez trouvé, et dire comment le récupérer. ${GH[1]}`,
        model: "Bonjour à tous,\nCe matin, vers huit heures, j'ai trouvé un portefeuille dans le bus numéro 12, sur un siège au fond, près de l'arrêt Gambetta. Il est en cuir marron, assez usé, avec une petite étiquette rouge. À l'intérieur, il y a des cartes et un peu d'argent, mais je n'ai pas regardé les noms par discrétion. Si c'est le vôtre, envoyez-moi un message privé en décrivant ce qu'il contient. Je pourrai vous le rendre ce soir après dix-huit heures, ou le déposer à la mairie demain.\nBonne journée,\nLan" },
      { tache: 2, sujet: `Vous écrivez un article pour le site d'une association sportive : vous racontez une compétition ou un défi sportif auquel vous avez participé et vous expliquez ce que cette expérience vous a apporté. ${GH[2]}`,
        model: "En avril dernier, j'ai participé à mon premier semi-marathon, à Bordeaux. Six mois plus tôt, je ne pouvais pas courir plus de vingt minutes. Je me suis entraînée trois fois par semaine avec les membres de notre club, sous la pluie comme sous le soleil. Le jour de la course, il faisait très chaud. Au quinzième kilomètre, j'ai cru que j'allais abandonner, mais une coureuse inconnue m'a encouragée et nous avons terminé ensemble, en deux heures et cinq minutes.\nCette expérience m'a apporté bien plus qu'une médaille. J'ai découvert que la régularité est plus importante que le talent. J'ai aussi compris la force du groupe : sans le club, je n'aurais jamais tenu. Aujourd'hui, j'ai plus confiance en moi, au travail comme dans la vie. Alors, si vous hésitez à vous lancer, rejoignez-nous !" },
      { tache: 3, sujet: `Un site d'actualité pose la question : « Faut-il interdire la publicité pour la malbouffe à la télévision ? » ${SYNTHESE} ${GH[3]}`,
        docs: [
          "<strong>Document 1</strong> : « Les enfants regardent des milliers de publicités pour des produits trop sucrés et trop gras. L'obésité infantile progresse : il faut protéger les plus jeunes. » <em>Docteur Lemaire, pédiatre</em>",
          "<strong>Document 2</strong> : « Interdire la publicité, c'est priver les chaînes de revenus importants. C'est aux parents d'éduquer leurs enfants, pas à l'État de tout interdire. » <em>Sylvie, directrice d'une chaîne de télévision</em>",
        ],
        model: "Le docteur Lemaire, pédiatre, souhaite interdire la publicité pour la malbouffe, car elle influence les enfants et contribue à la hausse de l'obésité infantile. Sylvie, directrice de chaîne, s'y oppose : cette mesure priverait la télévision de revenus et l'éducation alimentaire relève, selon elle, des parents.\nJe pense pour ma part qu'une interdiction aux heures où les enfants regardent la télévision serait justifiée. Bien sûr, les parents ont un rôle essentiel. Mais ils ne peuvent pas lutter seuls contre des publicités conçues par des professionnels pour séduire les enfants. Ma nièce de six ans réclame chaque semaine les céréales qu'elle a vues à la télévision, même si elle ne les aime pas vraiment ! Quant aux chaînes, elles pourraient remplacer ces annonces par des publicités pour des produits plus sains. Protéger la santé des enfants doit passer avant les intérêts économiques." },
    ],
    tu: ["un portefeuille : ví tiền", "par discrétion : vì tế nhị", "un semi-marathon : bán marathon", "la régularité : sự đều đặn", "la malbouffe : đồ ăn kém lành mạnh"],
    meo: ["Đọc cả ba đề trước, ghi nhanh vài ý cho mỗi đề, rồi mới viết.", "Chừa 5 phút cuối để đếm từ và sửa lỗi hoà hợp (giống, số, động từ)."],
  },
  {
    ma: "TCF-PE-4", vong: "chot", tieuDe: "Écriture TCF : trois tâches, sujet 3", phut: 60,
    taches: [
      { tache: 1, sujet: `Vous ne pouvez pas aller au mariage d'un(e) ami(e). Vous lui écrivez un message pour vous excuser, expliquer la raison et proposer de fêter l'événement autrement. ${GH[1]}`,
        model: "Chère Julie,\nJe suis vraiment désolée, mais je ne pourrai pas être à ton mariage le 21 septembre. Mon entreprise m'envoie en mission à Montréal pendant deux semaines, et je ne peux pas refuser. Tu sais combien je tenais à être là pour ce jour si important. Pour me faire pardonner, je te propose de vous inviter, Marc et toi, à dîner dans notre restaurant préféré dès mon retour. Tu me raconteras tout et tu me montreras les photos ! Je penserai très fort à vous ce jour-là.\nJe t'embrasse,\nHuong" },
      { tache: 2, sujet: `Le site de votre ancienne école publie des souvenirs d'élèves. Vous racontez un professeur qui vous a marqué et vous expliquez son influence sur votre vie. ${GH[2]}`,
        model: "Au collège, j'avais un professeur de français, Monsieur Lambert, que je n'oublierai jamais. Le premier jour, il est entré en classe avec une valise pleine de livres et nous a dit : « Ici, on ne lit pas pour avoir une note, on lit pour voyager. » Chaque vendredi, il nous lisait une page d'un roman à voix haute, et toute la classe écoutait en silence. Quand j'avais des difficultés, il restait après le cours pour m'expliquer.\nSon influence a été immense. Grâce à lui, j'ai découvert le plaisir de la lecture, que je n'avais jamais connu à la maison. Plus tard, j'ai choisi des études de lettres, et aujourd'hui, je suis bibliothécaire. Quand je conseille un livre à un enfant, je pense souvent à lui. Merci, Monsieur Lambert, de m'avoir donné le goût des histoires." },
      { tache: 3, sujet: `Un magazine pose la question : « Faut-il travailler jusqu'à 67 ans ? » ${SYNTHESE} ${GH[3]}`,
        docs: [
          "<strong>Document 1</strong> : « Nous vivons plus longtemps et en meilleure santé. Il est logique de travailler un peu plus longtemps pour financer les retraites. » <em>Henri, économiste</em>",
          "<strong>Document 2</strong> : « Après quarante ans de travail physique, mon corps est usé. Travailler jusqu'à 67 ans, c'est possible dans un bureau, pas sur un chantier. » <em>Joël, maçon</em>",
        ],
        model: "Henri, économiste, estime qu'il est logique de travailler plus longtemps, puisque l'espérance de vie augmente et qu'il faut financer les retraites. Joël, maçon, répond que cette solution ne tient pas compte des métiers physiques, qui usent le corps bien avant 67 ans.\nÀ mon avis, les deux arguments sont légitimes, et c'est pourquoi un âge unique pour tous me semble injuste. Il est vrai que notre système de retraites doit être financé. Cependant, un employé de bureau et un maçon ne vieillissent pas de la même façon. Mon père, chauffeur de camion, souffrait du dos dès cinquante-cinq ans, alors que mon oncle, comptable, travaille encore avec plaisir à soixante-cinq ans. Il faudrait donc tenir compte de la pénibilité de chaque métier : permettre aux travailleurs manuels de partir plus tôt, et laisser ceux qui le souhaitent continuer plus longtemps." },
    ],
    tu: ["se faire pardonner : xin được tha thứ", "les lettres (études) : ngành văn chương", "l'espérance de vie : tuổi thọ", "un chantier : công trường", "la pénibilité : mức độ nặng nhọc"],
    meo: ["Tâche 1 ngắn nhất: viết nhanh trong 15 phút để dành giờ cho tâche 3.", "Tâche 3: nếu hết giờ, ưu tiên viết đủ phần ý kiến hơn là chau chuốt phần tóm tắt."],
  },
];
