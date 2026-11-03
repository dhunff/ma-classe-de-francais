/* Lô 34 (03/11/2026): nội dung 20 bài NÓI A2 cho cây Luyện tập theo trình độ, đúng các dòng
 * « Cần soạn » ở docs/ke-hoach-ky-nang-DELF-DALF.xlsx, tab « A2 danh sách bài » (trừ hai bài thi thu
 * nhỏ A2-PO-T3). Máy dựng: lo34_noi_a2.mjs. Văn bản do FRACILE tự viết, nhân vật hư cấu.
 *
 * Ba phần như đề DELF A2: hỏi đáp (PO-1, có audio câu hỏi `tep`), độc thoại (PO-2, một đề nói
 * 1 đến 2 phút), nhập vai (PO-3, bốn lượt lời theo thẻ tình huống). Học sinh ghi âm từng câu, AI chấm
 * bằng nhan-xet-noi, nộp xong xem câu trả lời mẫu. Nội dung học: KHÔNG dùng dấu gạch dài. */

const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
const bang = (dau, hang) => `<div class="mcf-bang"><table><thead><tr>${dau.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${hang.map((h) => `<tr>${h.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

export const dungBai = ({ noi }) => {
  const tq = (t) => `Oral A2 : ${t}`;
  const DE_HOI = "<p>Écoutez les questions (elles sont aussi écrites). Enregistrez-vous : répondez à chaque question en deux ou trois phrases.</p>";
  const DE_MONO = "<p>Lisez le sujet et préparez-vous quelques minutes. Enregistrez-vous : parlez 1 à 2 minutes.</p>";
  const DE_VAI = "<p>Lisez la situation. Vous jouez votre rôle : enregistrez-vous pour chaque réplique.</p>";
  return [
  /* ───────── A2-PO-1 : trò chuyện về bản thân ───────── */
  { ma: "A2-PO-1", vong: "hoc", tieuDe: tq("parle-moi de ta famille"), tep: "a2-noi-famille", giong: "nova", de: DE_HOI,
    cau: [
      noi("Tu peux me parler de ta famille ?", "Oui, bien sûr. Nous sommes cinq : mes parents, mes deux sœurs et moi. Mes parents habitent à Hanoï et mes sœurs sont encore au lycée."),
      noi("Qui est la personne la plus proche de toi dans ta famille ?", "C'est ma grande sœur. Elle a trois ans de plus que moi et on se raconte tout. On s'appelle presque tous les jours."),
      noi("Tu as beaucoup d'amis ici ?", "Pas encore beaucoup, parce que je suis arrivée il y a six mois. Mais j'ai deux bonnes amies dans ma classe : une Italienne et une Française."),
      noi("Qu'est-ce que vous faites ensemble, avec tes amis ?", "Le week-end, on va souvent au café ou au cinéma. Parfois, on cuisine ensemble : je leur prépare des nems et elles adorent ça !"),
    ],
    tu: ["proche de (expression) : gần gũi với", "se raconter tout (expression) : kể cho nhau mọi chuyện", "il y a six mois (expression) : sáu tháng trước", "ensemble (adverbe) : cùng nhau", "parfois (adverbe) : thỉnh thoảng"],
    meo: ["Ở A2, đừng trả lời một câu: thêm một chi tiết hoặc một lý do.", "Nghe từ để hỏi (qui, qu'est-ce que) để trả lời đúng trọng tâm."] },
  { ma: "A2-PO-1", vong: "hoc", tieuDe: tq("tes études, ton travail"), tep: "a2-noi-travail", giong: "onyx", de: DE_HOI,
    cau: [
      noi("Qu'est-ce que tu fais dans la vie ?", "Je suis développeur dans une entreprise d'informatique. Je travaille sur des applications pour les téléphones."),
      noi("Tu aimes ton travail ? Pourquoi ?", "Oui, j'aime beaucoup mon travail parce que mes collègues sont sympas et j'apprends des choses nouvelles chaque jour. Par contre, les journées sont parfois longues."),
      noi("Pourquoi est-ce que tu apprends le français ?", "J'apprends le français parce que je voudrais travailler en France dans deux ans. Et puis, j'aime beaucoup la culture française, surtout le cinéma."),
      noi("Comment est-ce que tu apprends ?", "Je suis des cours en ligne trois fois par semaine. Le soir, j'écoute aussi des podcasts et je regarde des séries avec les sous-titres en français."),
    ],
    tu: ["une entreprise (nom féminin) : công ty", "un collègue (nom masculin) : đồng nghiệp", "sympa (adjectif) : dễ mến", "suivre un cours (expression) : theo học một khoá", "les sous-titres (nom masculin pluriel) : phụ đề"],
    meo: ["Câu hỏi Pourquoi ? thì trả lời bằng parce que.", "Thêm ví dụ cụ thể: trois fois par semaine, le soir."] },
  { ma: "A2-PO-1", vong: "hoc", tieuDe: tq("le soir, le week-end"), tep: "a2-noi-habitudes", giong: "shimmer", de: DE_HOI,
    cau: [
      noi("Qu'est-ce que tu fais le soir, après le travail ?", "En général, je rentre vers dix-huit heures. Je prépare le dîner, puis je regarde une série ou je lis un peu. Je me couche vers vingt-trois heures."),
      noi("Et le week-end, qu'est-ce que tu aimes faire ?", "Le samedi matin, je fais du sport au parc avec une amie. L'après-midi, je fais les courses. Le dimanche, je me repose et j'appelle ma famille."),
      noi("Tu as un loisir préféré ?", "Oui, j'adore la photographie. Je prends des photos de la ville, surtout le soir, parce que les lumières sont belles."),
      noi("Tu fais du sport ?", "Oui, je cours deux fois par semaine, le mardi et le samedi. Ça me fait du bien et ça m'aide à dormir."),
    ],
    tu: ["en général (expression) : thường thì", "se coucher (verbe) : đi ngủ", "faire les courses (expression) : đi chợ, mua sắm", "se reposer (verbe) : nghỉ ngơi", "ça me fait du bien (expression) : việc đó tốt cho tôi"],
    meo: ["Thói quen dùng thì hiện tại và từ chỉ tần suất: souvent, deux fois par semaine.", "Le samedi (có le) nghĩa là thứ bảy nào cũng vậy."] },
  { ma: "A2-PO-1", vong: "hoc", tieuDe: tq("hier et demain"), tep: "a2-noi-hier-demain", giong: "echo", de: DE_HOI,
    cau: [
      noi("Qu'est-ce que tu as fait hier soir ?", "Hier soir, je suis allé chez un ami. Nous avons dîné ensemble et nous avons regardé un match de football. Je suis rentré assez tard."),
      noi("Qu'est-ce que tu as fait le week-end dernier ?", "Le week-end dernier, je suis allé à la campagne avec ma famille. Il faisait beau, alors nous avons fait une longue promenade."),
      noi("Qu'est-ce que tu vas faire ce week-end ?", "Ce week-end, je vais aider mon frère à déménager. Ensuite, dimanche soir, nous allons manger au restaurant pour fêter ça."),
      noi("Quels sont tes projets pour l'année prochaine ?", "L'année prochaine, je vais passer le DELF B1. Je voudrais aussi partir en vacances au Japon avec ma femme."),
    ],
    tu: ["hier soir (expression) : tối qua", "le week-end dernier (expression) : cuối tuần trước", "déménager (verbe) : chuyển nhà", "fêter (verbe) : ăn mừng", "un projet (nom masculin) : dự định"],
    meo: ["Nghe thì của câu hỏi và trả lời cùng thì: tu as fait → j'ai fait, tu vas faire → je vais faire.", "Futur proche (aller + động từ) đủ dùng cho mọi dự định ở A2."] },
  { ma: "A2-PO-1", vong: "on", tieuDe: tq("répondez en trois phrases"), tep: "a2-noi-trois-phrases", giong: "alloy", de: DE_HOI,
    cau: [
      noi("Tu habites où ?", "J'habite à Nantes, dans un petit appartement. C'est près du centre-ville. J'aime bien mon quartier parce qu'il est calme."),
      noi("Tu as des animaux ?", "Oui, j'ai un chat qui s'appelle Mochi. Il a trois ans. Il dort toute la journée sur mon lit !"),
      noi("Quelle est ta saison préférée ?", "Ma saison préférée, c'est l'automne. Il ne fait ni trop chaud ni trop froid. Et j'adore les couleurs des arbres."),
      noi("Qu'est-ce que tu as mangé ce matin ?", "Ce matin, j'ai mangé du pain avec du beurre. J'ai aussi bu un café au lait. Je n'avais pas beaucoup de temps."),
      noi("Tu préfères la ville ou la campagne ?", "Je préfère la ville parce qu'il y a beaucoup de choses à faire. Mais le week-end, j'aime aller à la campagne. C'est plus calme."),
      noi("Qu'est-ce que tu vas faire pendant les prochaines vacances ?", "Je vais rentrer au Vietnam. Je vais voir ma famille et mes amis. Je vais aussi manger tous mes plats préférés !"),
    ],
    tu: ["un quartier (nom masculin) : khu phố", "une saison (nom féminin) : mùa", "ni… ni… (expression) : không… cũng không…", "le beurre (nom masculin) : bơ", "préférer (verbe) : thích hơn"],
    meo: ["Khung ba câu: trả lời, thêm chi tiết, thêm lý do hoặc cảm nghĩ.", "Câu hỏi bị xáo thì: để ý hôm qua, thường ngày hay sắp tới."] },
  { ma: "A2-PO-1", vong: "chot", tieuDe: tq("l'entretien dirigé"), tep: "a2-noi-entretien", giong: "nova", de: "<p>Comme à l'examen : l'examinateur vous pose des questions sur vous. Répondez sans vous arrêter, en deux ou trois phrases. Enregistrez chaque réponse.</p>",
    cau: [
      noi("Bonjour. Pouvez-vous vous présenter ?", "Bonjour. Je m'appelle Lan Nguyen, j'ai vingt-quatre ans et je suis vietnamienne. J'habite à Lyon depuis un an."),
      noi("Que faites-vous dans la vie ?", "Je suis étudiante en master de commerce. Je fais aussi un stage dans une petite entreprise trois jours par semaine."),
      noi("Parlez-moi de votre famille.", "Ma famille habite au Vietnam, à Hanoï. J'ai un frère plus jeune qui est encore au lycée. Mes parents ont un petit restaurant."),
      noi("Qu'est-ce que vous aimez faire pendant votre temps libre ?", "J'aime beaucoup lire et me promener au bord du Rhône. Le week-end, je vais souvent au marché avec des amis."),
      noi("Qu'est-ce que vous avez fait le week-end dernier ?", "Le week-end dernier, je suis allée à Annecy avec des amis. Nous avons fait le tour du lac à vélo. C'était magnifique."),
      noi("Pourquoi apprenez-vous le français ?", "J'apprends le français pour mes études, et aussi parce que je voudrais trouver un travail en France plus tard."),
    ],
    tu: ["se présenter (verbe) : giới thiệu bản thân", "un stage (nom masculin) : thực tập", "le temps libre (expression) : thời gian rảnh", "faire le tour de (expression) : đi một vòng quanh", "plus tard (expression) : sau này"],
    meo: ["Phần 1 của đề DELF A2 dài khoảng một phút rưỡi, không có thời gian chuẩn bị.", "Giám khảo dùng vous, bạn cũng trả lời lịch sự và đủ câu."] },

  /* ───────── A2-PO-2 : độc thoại ngắn ───────── */
  { ma: "A2-PO-2", vong: "hoc", tieuDe: tq("mon meilleur souvenir"), de: DE_MONO,
    cau: [noi("Parlez de votre meilleur souvenir : quand, où, avec qui, ce qui s'est passé et pourquoi c'est important pour vous.", "Mon meilleur souvenir, c'est mon premier voyage à l'étranger. J'avais dix-huit ans et je suis partie en Thaïlande avec ma meilleure amie. Nous avions très peu d'argent, alors nous avons dormi dans de petites auberges et nous avons voyagé en bus. Un soir, sur une plage, nous avons rencontré une famille thaïlandaise très gentille. Ils nous ont invitées à dîner chez eux. Nous ne parlions pas la même langue, mais nous avons beaucoup ri. Ce souvenir est important pour moi parce que c'était la première fois que je partais sans mes parents. J'ai compris que j'aimais découvrir d'autres cultures.")],
    tu: ["à l'étranger (expression) : ở nước ngoài", "une auberge (nom féminin) : nhà trọ", "rencontrer (verbe) : gặp", "rire (verbe) : cười", "découvrir (verbe) : khám phá"],
    meo: ["Dàn ý bốn bước: khi nào, ở đâu; chuyện gì xảy ra; cảm xúc; vì sao quan trọng.", "Bối cảnh dùng imparfait, sự việc dùng passé composé."] },
  { ma: "A2-PO-2", vong: "hoc", tieuDe: tq("la ville où j'habite"), de: DE_MONO,
    cau: [noi("Décrivez la ville où vous habitez : où elle se trouve, ce qu'il y a, ce que vous aimez et ce que vous n'aimez pas.", "J'habite à Da Nang, une ville au centre du Vietnam, au bord de la mer. C'est une ville moderne, avec de grandes avenues et beaucoup de ponts. Il y a de belles plages, des montagnes tout près et beaucoup de restaurants de fruits de mer. Ce que j'aime le plus, c'est la mer : le matin, je vais souvent nager avant le travail. Les gens sont aussi très accueillants. Par contre, il y a de plus en plus de touristes et de circulation, et en automne, il pleut beaucoup. Mais pour moi, c'est une ville agréable pour vivre.")],
    tu: ["se trouver (verbe) : nằm ở", "un pont (nom masculin) : cây cầu", "les fruits de mer (nom masculin pluriel) : hải sản", "accueillant, accueillante (adjectif) : hiếu khách", "la circulation (nom féminin) : giao thông"],
    meo: ["Mô tả rồi đánh giá: Il y a…, puis Ce que j'aime, c'est…", "Có cả điểm cộng và điểm trừ thì bài nói tự nhiên hơn: par contre."] },
  { ma: "A2-PO-2", vong: "hoc", tieuDe: tq("mon loisir préféré"), de: DE_MONO,
    cau: [noi("Parlez de votre loisir préféré : ce que c'est, depuis quand vous le pratiquez et pourquoi vous l'aimez. Donnez un exemple.", "Mon loisir préféré, c'est la cuisine. J'ai commencé à cuisiner il y a cinq ans, quand je suis arrivé en France pour mes études. Au début, je préparais seulement des pâtes, mais petit à petit, j'ai appris des recettes vietnamiennes et françaises. J'aime cuisiner parce que ça me détend après une journée de travail. En plus, j'adore partager un repas avec mes amis. Par exemple, le mois dernier, j'ai organisé un dîner pour six personnes : j'ai préparé des nems en entrée et une tarte aux pommes en dessert. Tout le monde a aimé ! Maintenant, je voudrais apprendre à faire du pain.")],
    tu: ["un loisir (nom masculin) : sở thích", "petit à petit (expression) : dần dần", "une recette (nom féminin) : công thức nấu ăn", "détendre (verbe) : thư giãn", "partager (verbe) : chia sẻ"],
    meo: ["Ví dụ cụ thể làm bài nói sinh động: Par exemple, le mois dernier…", "Kết thúc bằng một dự định: Maintenant, je voudrais…"] },
  { ma: "A2-PO-2", vong: "hoc", tieuDe: tq("une personne que j'aime"), de: DE_MONO,
    cau: [noi("Présentez une personne importante pour vous : qui c'est, comment elle est (physique, caractère) et ce que vous faites ensemble.", "Je voudrais vous parler de ma grand-mère. Elle a soixante-dix-huit ans et elle habite dans un village près de Hué. Elle est petite, elle a les cheveux blancs et elle sourit tout le temps. Elle est très gentille, patiente et elle a beaucoup d'humour. Quand j'étais enfant, je passais toutes mes vacances chez elle. Elle me racontait des histoires et elle m'a appris à cuisiner. Aujourd'hui, j'habite loin, mais je l'appelle chaque dimanche. Quand je rentre au Vietnam, nous allons ensemble au marché et nous préparons son plat préféré. Pour moi, c'est la personne la plus importante de ma vie.")],
    tu: ["le physique (nom masculin) : ngoại hình", "le caractère (nom masculin) : tính cách", "sourire (verbe) : mỉm cười", "patient, patiente (adjectif) : kiên nhẫn", "avoir de l'humour (expression) : hài hước"],
    meo: ["Ngoại hình dùng être và avoir: elle est petite, elle a les cheveux blancs.", "Nói xong ngoại hình thì sang tính cách, rồi kỷ niệm chung."] },
  { ma: "A2-PO-2", vong: "hoc", tieuDe: tq("mes prochaines vacances"), de: DE_MONO,
    cau: [noi("Parlez de vos prochaines vacances : où vous allez partir, avec qui, ce que vous allez faire et pourquoi vous avez choisi cette destination.", "Pour mes prochaines vacances, en juillet, je vais partir en Bretagne avec deux amis. Nous allons prendre le train jusqu'à Rennes, puis nous allons louer une voiture. Nous avons réservé une petite maison près de la mer pour dix jours. Là-bas, je vais me reposer, nager et faire des randonnées sur la côte. Je voudrais aussi visiter Saint-Malo et goûter les crêpes et les fruits de mer. J'ai choisi la Bretagne parce que mes collègues m'ont dit que les paysages sont magnifiques. En plus, il ne fait pas trop chaud en été, et ça, c'est parfait pour moi !")],
    tu: ["une destination (nom féminin) : điểm đến", "louer (verbe) : thuê", "une randonnée (nom féminin) : chuyến đi bộ đường dài", "la côte (nom féminin) : bờ biển", "choisir (verbe) : chọn"],
    meo: ["Dự định dùng futur proche: je vais partir, nous allons louer.", "Lý do chọn nơi đến là ý giám khảo chờ nghe: đừng bỏ."] },
  { ma: "A2-PO-2", vong: "on", tieuDe: tq("sujet surprise"), de: "<p>Vous découvrez le sujet maintenant. Préparez-vous une minute, puis enregistrez-vous : parlez 1 à 2 minutes.</p>",
    cau: [noi("Sujet : parlez d'un objet important pour vous. Qu'est-ce que c'est ? D'où vient-il ? Pourquoi est-il important ?", "L'objet le plus important pour moi, c'est un vieux vélo bleu. Mon père me l'a offert quand j'avais quinze ans. À cette époque, j'allais au lycée avec ce vélo tous les jours, même quand il pleuvait. Il n'est pas très beau maintenant : la peinture est abîmée et il fait du bruit. Mais je ne veux pas le changer. Quand je suis parti étudier en France, je l'ai laissé chez mes parents, et chaque fois que je rentre, je fais un tour avec lui dans mon quartier. Ce vélo me rappelle mon adolescence et mon père. C'est pour ça qu'il est si important pour moi.")],
    tu: ["un objet (nom masculin) : đồ vật", "à cette époque (expression) : thời đó", "abîmé, abîmée (adjectif) : hư, cũ", "rappeler (verbe) : gợi nhớ", "l'adolescence (nom féminin) : tuổi thiếu niên"],
    meo: ["Một phút chuẩn bị: ghi ba ý chính, không viết cả câu.", "Bí ý thì kể một kỷ niệm gắn với chủ đề."] },
  { ma: "A2-PO-2", vong: "chot", tieuDe: tq("le monologue suivi"), de: "<p>Comme à l'examen : préparez-vous, puis enregistrez-vous et parlez environ 2 minutes sans vous arrêter.</p>",
    cau: [noi("Sujet : parlez d'une fête importante pour vous. Où était-ce ? Avec qui ? Qu'avez-vous fait ? Qu'avez-vous ressenti ?", "Je voudrais vous parler du Têt, le Nouvel An vietnamien. C'est la fête la plus importante pour ma famille. L'année dernière, je suis rentré au Vietnam pour le Têt, après deux ans en France. Avant la fête, nous avons nettoyé et décoré toute la maison avec des fleurs jaunes. Ma mère a préparé des gâteaux de riz traditionnels. Le premier jour de l'année, nous avons rendu visite à mes grands-parents et les enfants ont reçu des enveloppes rouges avec de l'argent. Il y avait beaucoup de monde, beaucoup de bruit et beaucoup à manger ! J'étais très heureux de retrouver ma famille. C'est un souvenir que je ne vais jamais oublier.")],
    tu: ["une fête (nom féminin) : lễ hội, bữa tiệc", "décorer (verbe) : trang trí", "rendre visite à (expression) : đến thăm", "une enveloppe (nom féminin) : phong bì", "retrouver (verbe) : gặp lại"],
    meo: ["Phần 2 của đề DELF A2 dài khoảng hai phút, chuẩn bị chung với phần 3.", "Mở bài bằng Je voudrais vous parler de… để vào đề ngay."] },

  /* ───────── A2-PO-3 : nhập vai tình huống ───────── */
  { ma: "A2-PO-3", vong: "hoc", tieuDe: tq("prendre rendez-vous"), de: DE_VAI,
    van: p("Vous appelez le cabinet du docteur Martin. Vous avez mal à la gorge depuis trois jours. Vous travaillez de 9 h à 18 h, du lundi au vendredi. La secrétaire répond au téléphone."),
    cau: [
      noi("Saluez, présentez-vous et dites pourquoi vous appelez.", "Bonjour madame, je m'appelle Minh Tran. Je voudrais prendre rendez-vous avec le docteur Martin, s'il vous plaît. J'ai mal à la gorge depuis trois jours."),
      noi("La secrétaire propose demain à 11 h. Vous ne pouvez pas : expliquez et proposez un autre moment.", "Demain à onze heures, ce n'est pas possible pour moi, je suis au travail. Est-ce que vous avez un rendez-vous après dix-huit heures, ou samedi matin ?"),
      noi("Elle propose jeudi à 18 h 30. Acceptez et demandez s'il faut apporter quelque chose.", "Jeudi à dix-huit heures trente, c'est parfait. Est-ce que je dois apporter quelque chose, ma carte Vitale par exemple ?"),
      noi("Remerciez et terminez la conversation.", "D'accord, merci beaucoup madame. À jeudi, au revoir !"),
    ],
    tu: ["un cabinet (nom masculin) : phòng khám", "avoir mal à la gorge (expression) : đau họng", "prendre rendez-vous (expression) : đặt lịch hẹn", "ce n'est pas possible (expression) : không được", "la carte Vitale (expression) : thẻ bảo hiểm y tế Pháp"],
    meo: ["Từ chối giờ hẹn thì luôn đề nghị giờ khác.", "Đọc giờ 24: 18 h 30 là dix-huit heures trente."] },
  { ma: "A2-PO-3", vong: "hoc", tieuDe: tq("échanger un article"), de: DE_VAI,
    van: p("La semaine dernière, vous avez acheté un pull dans ce magasin. Il a un trou sur la manche. Vous avez le ticket de caisse. Le vendeur joue son rôle."),
    cau: [
      noi("Saluez le vendeur et expliquez le problème.", "Bonjour monsieur. J'ai acheté ce pull ici la semaine dernière, mais regardez : il y a un trou sur la manche."),
      noi("Le vendeur demande le ticket. Répondez et dites ce que vous voulez.", "Oui, voici le ticket de caisse. Je voudrais l'échanger contre le même pull, en taille M, s'il vous plaît."),
      noi("Il n'y a plus de taille M. Demandez une autre solution.", "Ah, c'est dommage. Est-ce que je peux prendre un autre modèle au même prix ? Sinon, est-ce que vous pouvez me rembourser ?"),
      noi("Le vendeur vous propose un remboursement. Acceptez et remerciez.", "D'accord, je préfère être remboursé. Merci beaucoup pour votre aide. Bonne journée !"),
    ],
    tu: ["un trou (nom masculin) : lỗ thủng", "la manche (nom féminin) : tay áo", "le ticket de caisse (expression) : hoá đơn", "échanger (verbe) : đổi", "rembourser (verbe) : hoàn tiền"],
    meo: ["Nói rõ vấn đề trước, yêu cầu sau.", "Hết hàng thì hỏi phương án khác: Sinon, est-ce que…"] },
  { ma: "A2-PO-3", vong: "hoc", tieuDe: tq("réserver une chambre"), de: DE_VAI,
    van: bang(["Hôtel du Parc", "Prix"], [["Chambre simple", "65 € la nuit"], ["Chambre double", "85 € la nuit"], ["Petit déjeuner", "10 € par personne"]]) + p("Vous téléphonez à l'hôtel. Vous voulez une chambre pour deux personnes, du 12 au 14 mai. Vous venez en voiture."),
    cau: [
      noi("Saluez et dites ce que vous voulez réserver.", "Bonjour madame. Je voudrais réserver une chambre double pour deux personnes, du 12 au 14 mai, s'il vous plaît."),
      noi("Demandez le prix et si le petit déjeuner est compris.", "C'est combien la nuit ? Et est-ce que le petit déjeuner est compris ?"),
      noi("Posez une question sur un service (parking, wifi…).", "Est-ce qu'il y a un parking à l'hôtel ? Nous venons en voiture. Et il y a le wifi dans la chambre ?"),
      noi("Confirmez la réservation et donnez votre nom.", "Très bien, je prends la chambre avec le petit déjeuner. C'est au nom de Pham, P, H, A, M. Merci, au revoir !"),
    ],
    tu: ["réserver (verbe) : đặt trước", "une chambre double (expression) : phòng đôi", "compris, comprise (adjectif) : đã bao gồm", "un parking (nom masculin) : bãi đỗ xe", "au nom de (expression) : đứng tên"],
    meo: ["Đặt phòng cần đủ: loại phòng, số người, ngày đến, ngày đi.", "Đánh vần họ của mình bằng tiếng Pháp: luyện trước cho trôi chảy."] },
  { ma: "A2-PO-3", vong: "hoc", tieuDe: tq("partir ensemble"), de: DE_VAI,
    van: p("Vous et un ami français voulez partir ensemble un week-end. Vous préférez la mer, votre ami préfère la montagne. Vous avez un budget de 150 euros chacun. L'examinateur joue le rôle de l'ami : vous utilisez tu."),
    cau: [
      noi("Proposez une destination et donnez vos raisons.", "J'ai une idée : on pourrait aller à la mer, à La Rochelle par exemple. Il va faire beau ce week-end et on pourrait se baigner."),
      noi("Votre ami préfère la montagne. Donnez votre avis et proposez un compromis.", "Je comprends, la montagne, c'est joli aussi. Et si on allait à Annecy ? Il y a un lac pour se baigner et des montagnes pour faire de la randonnée. Comme ça, on est contents tous les deux !"),
      noi("Mettez-vous d'accord sur le transport et le logement.", "On peut prendre le train, c'est plus rapide et moins fatigant. Pour dormir, je propose une auberge de jeunesse, pour rester dans notre budget."),
      noi("Fixez le jour et l'heure du départ.", "Alors on part samedi matin, vers huit heures ? Je réserve les billets ce soir et je t'envoie un message. D'accord ?"),
    ],
    tu: ["on pourrait (expression) : mình có thể", "se baigner (verbe) : tắm biển, bơi", "et si on… ? (expression) : hay là mình…?", "un compromis (nom masculin) : sự thoả hiệp", "une auberge de jeunesse (expression) : nhà nghỉ thanh niên"],
    meo: ["Đề nghị lịch sự: on pourrait, et si on…, je propose…", "Mục tiêu là đi tới thống nhất: kết thúc bằng một kế hoạch rõ ràng."] },
  { ma: "A2-PO-3", vong: "hoc", tieuDe: tq("il y a un problème"), de: DE_VAI,
    van: p("Vous êtes à l'hôtel, chambre 214. La douche ne marche pas et il y a beaucoup de bruit dans la rue. Vous allez à la réception. L'examinateur joue le réceptionniste."),
    cau: [
      noi("Saluez et expliquez les deux problèmes.", "Bonsoir monsieur. Je suis dans la chambre 214. Il y a deux problèmes : la douche ne marche pas et la chambre est très bruyante, à cause de la rue."),
      noi("Demandez une solution.", "Est-ce que quelqu'un peut réparer la douche ce soir ? Ou est-ce que je peux changer de chambre ?"),
      noi("Le réceptionniste propose une chambre plus calme, mais plus petite. Répondez.", "Une chambre plus petite, ce n'est pas un problème. Le plus important, c'est de bien dormir. Est-ce que la douche marche bien dans cette chambre ?"),
      noi("Remerciez et demandez un petit geste (réduction, petit déjeuner offert…).", "Merci beaucoup. Est-ce que c'est possible d'avoir le petit déjeuner offert demain matin, pour le dérangement ?"),
    ],
    tu: ["la réception (nom féminin) : quầy lễ tân", "bruyant, bruyante (adjectif) : ồn ào", "à cause de (expression) : vì (lý do xấu)", "réparer (verbe) : sửa", "le dérangement (nom masculin) : sự phiền phức"],
    meo: ["Phàn nàn bình tĩnh và lịch sự: giám khảo chấm cả cách ứng xử.", "À cause de dùng cho nguyên nhân gây phiền."] },
  { ma: "A2-PO-3", vong: "on", tieuDe: tq("ce n'est plus possible"), de: "<p>Lisez la situation. Attention : pendant la conversation, la situation change. Enregistrez-vous pour chaque réplique.</p>",
    van: p("Vous avez réservé une table pour quatre personnes, ce soir à 20 h, au restaurant Chez Lucie. C'est pour l'anniversaire d'un ami. Vous téléphonez pour confirmer."),
    cau: [
      noi("Saluez et confirmez votre réservation.", "Bonjour, j'ai réservé une table pour quatre personnes ce soir à vingt heures, au nom de Nguyen. Je voudrais confirmer, s'il vous plaît."),
      noi("On vous dit que la réservation n'est pas dans l'agenda et qu'il n'y a plus de table à 20 h. Réagissez poliment.", "Ah bon ? Pourtant, j'ai appelé lundi et on m'a dit que c'était d'accord. C'est un peu embêtant, nous fêtons l'anniversaire d'un ami."),
      noi("On vous propose 21 h 30 ou une table en terrasse à 20 h. Choisissez et expliquez pourquoi.", "Vingt et une heures trente, c'est un peu tard pour nous. Nous prenons la table en terrasse à vingt heures. Est-ce qu'il y a un chauffage, s'il fait froid ?"),
      noi("Un ami vient avec sa femme : vous êtes cinq maintenant. Demandez si c'est possible et terminez.", "Ah, une dernière chose : un ami vient avec sa femme, donc nous serons cinq. Est-ce que c'est possible ? Merci beaucoup, à ce soir !"),
    ],
    tu: ["confirmer (verbe) : xác nhận", "ah bon ? (expression) : thế à?", "pourtant (adverbe) : thế nhưng", "embêtant, embêtante (adjectif) : phiền", "une terrasse (nom féminin) : bàn ngoài trời"],
    meo: ["Tình huống đổi thì phản ứng ngắn rồi tìm giải pháp, đừng im lặng.", "Pourtant giúp phản đối nhẹ nhàng: Pourtant, j'ai appelé lundi."] },
  { ma: "A2-PO-3", vong: "chot", tieuDe: tq("l'exercice en interaction"), de: "<p>Comme à l'examen : lisez la situation, préparez-vous, puis jouez toute la scène. Enregistrez-vous pour chaque réplique.</p>",
    van: p("Vous êtes en France. Vous voulez vous inscrire à un club de sport. Vous allez à l'accueil pour demander des informations (activités, horaires, prix), puis vous vous inscrivez. L'examinateur joue le rôle de l'employé."),
    cau: [
      noi("Saluez et dites ce que vous cherchez.", "Bonjour madame. Je voudrais m'inscrire dans votre club. Je cherche une activité pour me remettre au sport, peut-être la natation ou le yoga."),
      noi("Posez des questions sur les horaires et les prix.", "Quels sont les horaires des cours de yoga ? Et combien coûte l'abonnement, par mois ou pour l'année ?"),
      noi("L'abonnement coûte 40 euros par mois. Essayez d'obtenir un meilleur prix (tarif étudiant, cours d'essai…).", "C'est un peu cher pour moi. Je suis étudiante : est-ce qu'il y a un tarif réduit ? Et est-ce que je peux faire un cours d'essai gratuit ?"),
      noi("Inscrivez-vous et terminez poliment.", "Très bien, je m'inscris pour trois mois avec le tarif étudiant. Qu'est-ce que je dois apporter : une photo, un certificat médical ? Merci, bonne journée !"),
    ],
    tu: ["s'inscrire (verbe) : đăng ký", "se remettre au sport (expression) : chơi thể thao trở lại", "un abonnement (nom masculin) : thẻ hội viên", "un tarif réduit (expression) : giá ưu đãi", "un cours d'essai (expression) : buổi học thử"],
    meo: ["Phần 3 của đề DELF A2 kéo dài ba đến bốn phút: hỏi, thương lượng, chốt.", "Mỗi lượt lời nên có một câu hỏi để cuộc trò chuyện tiếp tục."] },
  ];
};
