/* Lô 30 (01/11/2026): nội dung 26 bài NÓI A1 cho cây Luyện tập theo trình độ, đúng danh sách ở
 * docs/ke-hoach-ky-nang-DELF-DALF.xlsx, tab « A1 danh sách bài ». Máy dựng: lo30_noi_a1.mjs.
 * Văn bản do FRACILE tự viết, nhân vật hư cấu. Nói không có điểm máy chấm: học sinh ghi âm,
 * nghe lại, xin AI nhận xét, nộp xong xem câu trả lời mẫu. Chỉ phần công thức lịch sự có QCM chấm được.
 * A1-PO-5 ghép từ kho câu phát âm cau_luyen (audio có sẵn, mã ở trường `ma`).
 * Nội dung học: KHÔNG dùng dấu gạch dài. */

const bang = (dau, hang) => `<div class="mcf-bang"><table><thead><tr>${dau.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${hang.map((h) => `<tr>${h.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

export const dungBai = ({ noi, qcm, doc }) => {
  const tq = (t) => `Oral A1 : ${t}`;
  const DE_HOI = "<p>Lisez les questions. Enregistrez-vous : répondez à chaque question avec une phrase complète.</p>";
  const DE_THE = "<p>Regardez chaque carte. Enregistrez-vous : posez une question avec ce mot.</p>";
  const DE_VAI = "<p>Vous jouez le client. Regardez les prix. Enregistrez-vous : dites chaque phrase de votre rôle.</p>";
  const DE_LS = "<p>Choisissez la bonne phrase pour chaque situation. Puis enregistrez-vous pour la dernière situation.</p>";
  const DE_DOC = "<p>Écoutez chaque phrase, puis répétez. Enregistrez toutes les phrases à la suite.</p>";
  return [
  /* ───────── A1-PO-1 : trả lời về bản thân ───────── */
  { ma: "A1-PO-1", vong: "hoc", tieuDe: tq("comment tu t'appelles ?"), tep: "a1-noi-ban-than", de: DE_HOI, giong: "nova",
    cau: [noi("Comment tu t'appelles ?", "Je m'appelle Lan."), noi("Comment ça s'écrit ?", "Ça s'écrit L, A, N."), noi("Tu as quel âge ?", "J'ai vingt-deux ans."), noi("Tu es de quelle nationalité ?", "Je suis vietnamienne."), noi("Tu habites où ?", "J'habite à Lyon, en France.")],
    tu: ["je m'appelle (expression) : tôi tên là", "ça s'écrit (expression) : đánh vần là", "j'ai… ans (expression) : tôi… tuổi", "la nationalité (nom féminin) : quốc tịch", "j'habite à (expression) : tôi sống ở"],
    meo: ["Đừng trả lời một từ: nói cả câu.", "Luyện đánh vần tên mình bằng tiếng Pháp, giám khảo hay hỏi."] },
  { ma: "A1-PO-1", vong: "hoc", tieuDe: tq("tu as des frères et sœurs ?"), tep: "a1-noi-gia-dinh", de: DE_HOI, giong: "onyx",
    cau: [noi("Tu as des frères et sœurs ?", "Oui, j'ai un frère et une sœur."), noi("Comment s'appelle ta mère ?", "Ma mère s'appelle Hoa."), noi("Qu'est-ce que fait ton père ?", "Mon père est médecin."), noi("Tu es marié ou mariée ?", "Non, je suis célibataire."), noi("Tu habites avec qui ?", "J'habite avec ma sœur.")],
    tu: ["un frère (nom masculin) : anh, em trai", "une sœur (nom féminin) : chị, em gái", "marié, mariée (adjectif) : đã kết hôn", "célibataire (adjectif) : độc thân", "avec qui (expression) : với ai"],
    meo: ["Mỗi câu nói thêm một chi tiết: tên, tuổi hoặc nghề.", "Trước nghề không có mạo từ: Il est médecin."] },
  { ma: "A1-PO-1", vong: "hoc", tieuDe: tq("qu'est-ce que tu aimes ?"), tep: "a1-noi-so-thich", de: DE_HOI, giong: "shimmer",
    cau: [noi("Qu'est-ce que tu aimes faire le week-end ?", "Le week-end, j'aime aller au cinéma."), noi("Tu aimes le sport ?", "Oui, j'aime le tennis."), noi("Quelle est ta couleur préférée ?", "Ma couleur préférée, c'est le bleu."), noi("Quelle musique tu aimes ?", "J'aime la musique française."), noi("Qu'est-ce que tu n'aimes pas ?", "Je n'aime pas le froid.")],
    tu: ["faire (verbe) : làm", "le week-end (nom masculin) : cuối tuần", "une couleur (nom féminin) : màu", "préféré, préférée (adjectif) : yêu thích", "le froid (nom masculin) : cái lạnh"],
    meo: ["Dùng J'aime và Je n'aime pas, thêm vì sao nếu được.", "Sau aimer dùng le, la, les."] },
  { ma: "A1-PO-1", vong: "hoc", tieuDe: tq("ta journée"), tep: "a1-noi-mot-ngay", de: DE_HOI, giong: "echo",
    cau: [noi("À quelle heure tu te lèves ?", "Je me lève à sept heures."), noi("Qu'est-ce que tu manges le matin ?", "Le matin, je mange du pain."), noi("Comment tu vas au travail ?", "Je vais au travail en bus."), noi("Tu habites dans une maison ou un appartement ?", "J'habite dans un petit appartement."), noi("Qu'est-ce que tu fais le soir ?", "Le soir, je regarde un film.")],
    tu: ["se lever (verbe) : thức dậy", "le matin (nom masculin) : buổi sáng", "en bus (expression) : bằng xe buýt", "un appartement (nom masculin) : căn hộ", "le soir (nom masculin) : buổi tối"],
    meo: ["Câu trả lời lặp lại một phần câu hỏi: Tu te lèves… Je me lève…", "Giờ: à sept heures, không cần phút ở A1."] },
  { ma: "A1-PO-1", vong: "on", tieuDe: tq("répondez vite"), tep: "a1-noi-nhanh", de: DE_HOI, giong: "alloy",
    cau: [noi("Tu habites où ?", "J'habite à Lyon."), noi("Tu as quel âge ?", "J'ai vingt-deux ans."), noi("Qu'est-ce que tu aimes ?", "J'aime la musique."), noi("Tu as des frères ?", "Oui, j'ai un frère."), noi("Tu parles quelles langues ?", "Je parle vietnamien et un peu français."), noi("Qu'est-ce que tu fais dans la vie ?", "Je suis étudiante.")],
    tu: ["une langue (nom féminin) : ngôn ngữ", "un peu (expression) : một chút", "qu'est-ce que tu fais dans la vie ? (expression) : bạn làm nghề gì?", "je parle (expression) : tôi nói", "étudiant, étudiante (nom) : sinh viên"],
    meo: ["Câu hỏi được xáo: nghe từ khoá rồi trả lời ngay.", "Không hiểu thì nói: Pouvez-vous répéter, s'il vous plaît ?"] },
  { ma: "A1-PO-1", vong: "chot", tieuDe: tq("l'entretien"), tep: "a1-noi-entretien", de: "<p>Comme à l'examen : répondez sans vous arrêter. Enregistrez toutes vos réponses à la suite.</p>", giong: "nova",
    cau: [noi("Bonjour. Comment vous appelez-vous ?", "Bonjour. Je m'appelle Lan Nguyen."), noi("Quel âge avez-vous ?", "J'ai vingt-deux ans."), noi("Où habitez-vous ?", "J'habite à Lyon."), noi("Quelle est votre profession ?", "Je suis étudiante."), noi("Parlez-moi de votre famille.", "Nous sommes quatre : mon père, ma mère, mon frère et moi."), noi("Qu'est-ce que vous aimez faire ?", "J'aime lire et aller au cinéma.")],
    tu: ["un entretien (nom masculin) : phần hỏi đáp", "vous (pronom) : ông, bà, anh, chị", "votre (adjectif) : của ông, bà", "parlez-moi de (expression) : hãy kể về", "nous sommes quatre (expression) : nhà có bốn người"],
    meo: ["Phòng thi dùng vous với giám khảo.", "Nói liền mạch khoảng một phút, không dừng lâu."] },

  /* ───────── A1-PO-2 : đặt câu hỏi từ thẻ ───────── */
  { ma: "A1-PO-2", vong: "hoc", tieuDe: tq("est-ce que ?"), de: "<p>Transformez chaque phrase en question avec « est-ce que ». Enregistrez-vous.</p>",
    cau: [noi("Tu aimes le café.", "Est-ce que tu aimes le café ?"), noi("Vous habitez à Paris.", "Est-ce que vous habitez à Paris ?"), noi("Tu as une voiture.", "Est-ce que tu as une voiture ?"), noi("Vous parlez anglais.", "Est-ce que vous parlez anglais ?"), noi("Il y a une gare.", "Est-ce qu'il y a une gare ?"), noi("Elle travaille ici.", "Est-ce qu'elle travaille ici ?")],
    tu: ["est-ce que (expression) : có… không", "aimer (verbe) : thích", "avoir (verbe) : có", "il y a (expression) : có", "ici (adverbe) : ở đây"],
    meo: ["Thêm Est-ce que vào đầu câu, lên giọng ở cuối.", "Trước nguyên âm viết và đọc Est-ce qu'."] },
  { ma: "A1-PO-2", vong: "hoc", tieuDe: tq("où, quand, combien"), de: "<p>Posez une question avec les deux mots de la carte. Enregistrez-vous.</p>",
    cau: [noi("Carte : où / la gare", "Où est la gare ?"), noi("Carte : quand / l'examen", "Quand est l'examen ?"), noi("Carte : combien / le billet", "Combien coûte le billet ?"), noi("Carte : à quelle heure / le train", "À quelle heure part le train ?"), noi("Carte : qui / cette personne", "Qui est cette personne ?"), noi("Carte : comment / tu vas au travail", "Comment tu vas au travail ?")],
    tu: ["où (adverbe) : ở đâu", "quand (adverbe) : khi nào", "combien (adverbe) : bao nhiêu", "à quelle heure (expression) : lúc mấy giờ", "qui (pronom) : ai"],
    meo: ["Từ để hỏi đứng đầu câu.", "Đừng chỉ đọc từ trên thẻ: phải thành câu có động từ."] },
  { ma: "A1-PO-2", vong: "hoc", tieuDe: tq("carte : âge, ville, sport"), de: DE_THE,
    cau: [noi("Carte : âge", "Quel âge avez-vous ?"), noi("Carte : ville", "Dans quelle ville habitez-vous ?"), noi("Carte : sport", "Est-ce que vous aimez le sport ?"), noi("Carte : profession", "Quelle est votre profession ?"), noi("Carte : langue", "Quelles langues parlez-vous ?"), noi("Carte : famille", "Est-ce que vous avez des enfants ?")],
    tu: ["quel, quelle (adjectif) : gì, nào", "un âge (nom masculin) : tuổi", "une ville (nom féminin) : thành phố", "un enfant (nom masculin) : đứa trẻ, con", "habiter (verbe) : sống"],
    meo: ["Phần 2 của đề: bạn hỏi giám khảo, nên dùng vous.", "Một thẻ có nhiều câu đúng: chọn câu bạn nhớ chắc nhất."] },
  { ma: "A1-PO-2", vong: "on", tieuDe: tq("carte : téléphone, voiture"), de: DE_THE,
    cau: [noi("Carte : téléphone", "Quel est votre numéro de téléphone ?"), noi("Carte : voiture", "Est-ce que vous avez une voiture ?"), noi("Carte : ordinateur", "Est-ce que vous avez un ordinateur ?"), noi("Carte : vélo", "Est-ce que vous allez au travail à vélo ?"), noi("Carte : clé", "Où est ma clé ?"), noi("Carte : sac", "C'est votre sac ?")],
    tu: ["un numéro (nom masculin) : số", "un ordinateur (nom masculin) : máy tính", "un vélo (nom masculin) : xe đạp", "une clé (nom féminin) : chìa khoá", "un sac (nom masculin) : túi"],
    meo: ["Đồ vật: hỏi có không, ở đâu hoặc của ai.", "Dùng đúng un, une trước tên đồ vật."] },
  { ma: "A1-PO-2", vong: "chot", tieuDe: tq("six cartes"), de: "<p>Comme à l'examen : six cartes à la suite. Enregistrez une question pour chaque carte.</p>",
    cau: [noi("Carte : week-end", "Qu'est-ce que vous faites le week-end ?"), noi("Carte : musique", "Est-ce que vous aimez la musique ?"), noi("Carte : petit déjeuner", "Qu'est-ce que vous mangez au petit déjeuner ?"), noi("Carte : ami", "Comment s'appelle votre ami ?"), noi("Carte : vacances", "Où allez-vous en vacances ?"), noi("Carte : restaurant", "Est-ce qu'il y a un restaurant ici ?")],
    tu: ["le petit déjeuner (nom masculin) : bữa sáng", "les vacances (nom féminin pluriel) : kỳ nghỉ", "un restaurant (nom masculin) : nhà hàng", "faire (verbe) : làm", "manger (verbe) : ăn"],
    meo: ["Luân phiên Est-ce que và từ để hỏi cho đa dạng.", "Mỗi thẻ nghĩ khoảng 5 giây rồi nói."] },

  /* ───────── A1-PO-3 : nhập vai mua bán ───────── */
  { ma: "A1-PO-3", vong: "hoc", tieuDe: tq("à la boulangerie"), de: DE_VAI, van: bang(["Produit", "Prix"], [["une baguette", "1 €"], ["un croissant", "1,20 €"], ["un pain au chocolat", "1,50 €"], ["une tarte", "12 €"]]),
    cau: [noi("Saluez la vendeuse et demandez une baguette.", "Bonjour madame, je voudrais une baguette, s'il vous plaît."), noi("Demandez le prix d'un croissant.", "C'est combien, un croissant ?"), noi("Vous prenez deux croissants.", "Je prends deux croissants, s'il vous plaît."), noi("Vous payez et vous partez.", "Voilà trois euros quarante. Merci, au revoir !")],
    tu: ["une boulangerie (nom féminin) : tiệm bánh", "je voudrais (expression) : tôi muốn", "c'est combien ? (expression) : bao nhiêu tiền?", "je prends (expression) : tôi lấy", "voilà (expression) : đây ạ"],
    meo: ["Đi đủ bốn bước: chào, hỏi, trả tiền, cảm ơn.", "Tính đúng tiền: 1 € + 2 × 1,20 € = 3,40 €."] },
  { ma: "A1-PO-3", vong: "hoc", tieuDe: tq("au café"), de: DE_VAI, van: bang(["Boisson, plat", "Prix"], [["un café", "2 €"], ["un thé", "3 €"], ["un jus d'orange", "4 €"], ["un sandwich", "6 €"]]),
    cau: [noi("Saluez le serveur et commandez un café.", "Bonjour monsieur, un café, s'il vous plaît."), noi("Demandez s'il y a des sandwichs.", "Est-ce que vous avez des sandwichs ?"), noi("Vous commandez un sandwich.", "Je voudrais un sandwich, s'il vous plaît."), noi("Vous demandez l'addition et vous payez.", "L'addition, s'il vous plaît. Voilà huit euros. Merci !")],
    tu: ["un serveur (nom masculin) : người phục vụ", "commander (verbe) : gọi món", "une boisson (nom féminin) : đồ uống", "l'addition (nom féminin) : hoá đơn", "payer (verbe) : trả tiền"],
    meo: ["Quán cà phê dùng « L'addition, s'il vous plaît ».", "Tính: 2 € + 6 € = 8 €."] },
  { ma: "A1-PO-3", vong: "hoc", tieuDe: tq("au magasin"), de: DE_VAI, van: bang(["Article", "Couleur", "Prix"], [["un pull", "bleu, noir", "30 €"], ["un pantalon", "noir", "40 €"], ["une robe", "rouge, verte", "50 €"]]),
    cau: [noi("Saluez et dites que vous cherchez un pull.", "Bonjour, je cherche un pull, s'il vous plaît."), noi("Demandez une autre couleur.", "Est-ce que vous l'avez en noir ?"), noi("Dites votre taille.", "Je fais du trente-huit."), noi("Vous achetez le pull et vous payez.", "Je le prends. C'est trente euros ? Voilà. Merci, au revoir !")],
    tu: ["un magasin (nom masculin) : cửa hàng", "chercher (verbe) : tìm", "une couleur (nom féminin) : màu", "une taille (nom féminin) : cỡ", "je le prends (expression) : tôi lấy cái này"],
    meo: ["Dùng Je cherche để bắt đầu trong cửa hàng.", "Cỡ quần áo: Je fais du 38."] },
  { ma: "A1-PO-3", vong: "hoc", tieuDe: tq("au guichet"), de: DE_VAI, van: bang(["Train", "Départ", "Prix"], [["Lyon", "10 h", "35 €"], ["Lyon", "14 h", "30 €"], ["Marseille", "9 h", "60 €"]]),
    cau: [noi("Saluez et demandez un billet pour Lyon.", "Bonjour, je voudrais un billet pour Lyon, s'il vous plaît."), noi("Demandez l'heure du train.", "À quelle heure part le train ?"), noi("Vous choisissez le train de 14 h.", "Je prends le train de quatorze heures."), noi("Vous payez et vous remerciez.", "C'est trente euros ? Voilà. Merci, bonne journée !")],
    tu: ["un guichet (nom masculin) : quầy vé", "un billet (nom masculin) : vé", "un départ (nom masculin) : giờ đi", "partir (verbe) : khởi hành", "bonne journée (expression) : chúc một ngày tốt lành"],
    meo: ["Vé đi đâu dùng pour: un billet pour Lyon.", "Đọc giờ 24 trên bảng: 14 h là quatorze heures."] },
  { ma: "A1-PO-3", vong: "on", tieuDe: tq("au marché"), de: DE_VAI, van: bang(["Produit", "Prix"], [["un kilo de pommes", "3 €"], ["un kilo de tomates", "4 €"], ["un melon", "2 €"], ["un fromage", "5 €"]]),
    cau: [noi("Saluez et demandez un kilo de pommes.", "Bonjour, je voudrais un kilo de pommes, s'il vous plaît."), noi("Demandez aussi un melon.", "Et un melon, s'il vous plaît."), noi("Demandez le total.", "Ça fait combien ?"), noi("Vous payez et vous partez.", "Voilà cinq euros. Merci, au revoir !")],
    tu: ["un marché (nom masculin) : chợ", "un kilo de (expression) : một ký", "une pomme (nom féminin) : quả táo", "une tomate (nom féminin) : cà chua", "ça fait combien ? (expression) : tổng bao nhiêu tiền?"],
    meo: ["Sau số lượng dùng de: un kilo de pommes.", "Tính: 3 € + 2 € = 5 €."] },
  { ma: "A1-PO-3", vong: "chot", tieuDe: tq("jeu de rôle"), de: "<p>Comme à l'examen : vous achetez un cadeau pour un ami. Regardez les prix et jouez toute la scène.</p>", van: bang(["Article", "Prix"], [["un livre", "15 €"], ["un stylo", "8 €"], ["un sac", "25 €"], ["une tasse", "7 €"]]),
    cau: [noi("Saluez et dites ce que vous cherchez.", "Bonjour madame, je cherche un cadeau pour un ami."), noi("Demandez le prix d'un livre et d'une tasse.", "C'est combien, le livre et la tasse ?"), noi("Vous choisissez deux articles.", "Je prends le livre et la tasse, s'il vous plaît."), noi("Vous payez et vous partez.", "Ça fait vingt-deux euros ? Voilà. Merci, au revoir !")],
    tu: ["un cadeau (nom masculin) : quà", "un article (nom masculin) : món hàng", "un livre (nom masculin) : sách", "une tasse (nom féminin) : cốc", "choisir (verbe) : chọn"],
    meo: ["Thi thật có thẻ đồ vật, giá và tiền giả: nói và đưa tiền.", "Mở đầu chào, kết thúc cảm ơn và tạm biệt."] },

  /* ───────── A1-PO-4 : công thức lịch sự ───────── */
  { ma: "A1-PO-4", vong: "hoc", tieuDe: tq("bonjour, merci"), de: DE_LS,
    cau: [
      qcm("Vous entrez dans un magasin le matin.", "Bonjour madame.", ["Bonsoir madame.", "Au revoir madame."], "Buổi sáng, khi đến: Bonjour."), qcm("Quelqu'un vous aide.", "Merci beaucoup.", ["S'il vous plaît.", "Pardon."], "Cảm ơn: Merci beaucoup."), qcm("On vous dit merci.", "De rien.", ["Bonjour.", "Excusez-moi."], "Đáp lại lời cảm ơn: De rien."),
      qcm("Vous partez le soir.", "Bonsoir, bonne soirée !", ["Bonjour !", "Enchanté !"], "Buổi tối: Bonsoir, bonne soirée."), qcm("Vous rencontrez une personne pour la première fois.", "Enchanté.", ["À demain.", "De rien."], "Gặp lần đầu: Enchanté."),
      noi("Dites bonjour à votre voisine et demandez comment elle va.", "Bonjour madame, comment allez-vous ?"),
    ],
    tu: ["bonjour (interjection) : xin chào", "bonsoir (interjection) : chào buổi tối", "de rien (expression) : không có gì", "enchanté, enchantée (adjectif) : rất vui được gặp", "à demain (expression) : hẹn mai gặp"],
    meo: ["Bonjour dùng ban ngày, bonsoir dùng buổi tối.", "Vào cửa hàng ở Pháp luôn chào trước."] },
  { ma: "A1-PO-4", vong: "hoc", tieuDe: tq("tu ou vous ?"), de: DE_LS,
    cau: [
      qcm("Vous parlez à un ami.", "Tu vas bien ?", ["Vous allez bien, monsieur ?", "Comment allez-vous ?"], "Bạn bè dùng tu."), qcm("Vous parlez à un médecin.", "Comment allez-vous ?", ["Salut, ça va ?", "Tu vas bien ?"], "Người không thân dùng vous."), qcm("Vous parlez à un enfant.", "Tu as quel âge ?", ["Quel âge avez-vous, monsieur ?", "Vous êtes de quelle nationalité ?"], "Với trẻ em dùng tu."),
      qcm("Vous parlez au professeur à l'examen.", "Pouvez-vous répéter ?", ["Tu peux répéter ?", "Répète !"], "Với giám khảo dùng vous."), qcm("Vous saluez un vendeur.", "Bonjour monsieur.", ["Salut !", "Coucou !"], "Salut chỉ dùng với người thân."),
      noi("Demandez poliment à un inconnu où est la gare.", "Excusez-moi monsieur, où est la gare, s'il vous plaît ?"),
    ],
    tu: ["tu (pronom) : bạn (thân mật)", "vous (pronom) : ông, bà (lịch sự)", "salut (interjection) : chào (thân mật)", "un inconnu (nom masculin) : người lạ", "poliment (adverbe) : lịch sự"],
    meo: ["Không chắc thì dùng vous.", "Trong phòng thi luôn dùng vous với giám khảo."] },
  { ma: "A1-PO-4", vong: "on", tieuDe: tq("s'il vous plaît, excusez-moi"), de: DE_LS,
    cau: [
      qcm("Vous voulez un café.", "Un café, s'il vous plaît.", ["Donne un café.", "Café !"], "Thêm s'il vous plaît khi xin."), qcm("Vous êtes en retard.", "Excusez-moi, je suis en retard.", ["Merci, je suis en retard.", "Bonjour, à demain."], "Xin lỗi: Excusez-moi."), qcm("Vous marchez sur le pied de quelqu'un.", "Pardon !", ["Enchanté !", "Bon appétit !"], "Xin lỗi nhanh: Pardon."),
      qcm("Vous ne comprenez pas.", "Je ne comprends pas. Pouvez-vous répéter ?", ["Je comprends. Au revoir.", "Merci, c'est tout."], "Không hiểu thì xin nhắc lại."), qcm("Vous voulez passer.", "Pardon, je peux passer ?", ["Passe !", "Bonsoir, je mange."], "Xin đi qua: Pardon, je peux passer ?"),
      noi("Vous arrivez en retard au cours. Excusez-vous auprès du professeur.", "Excusez-moi madame, je suis en retard. Le bus n'arrive pas."),
    ],
    tu: ["s'il vous plaît (expression) : làm ơn", "excusez-moi (expression) : xin lỗi", "pardon (nom masculin) : xin lỗi", "en retard (expression) : muộn", "je ne comprends pas (expression) : tôi không hiểu"],
    meo: ["Câu xin ngắn vẫn cần s'il vous plaît.", "Pouvez-vous répéter ? là câu cứu nguy trong phòng thi."] },
  { ma: "A1-PO-4", vong: "chot", tieuDe: tq("du bonjour au revoir"), de: DE_LS,
    cau: [
      qcm("Pour commencer une conversation à la boulangerie :", "Bonjour madame.", ["À bientôt.", "De rien."], "Mở đầu luôn chào."), qcm("Pour demander quelque chose :", "Je voudrais une baguette, s'il vous plaît.", ["Baguette.", "Tu me donnes une baguette."], "Dùng je voudrais."), qcm("Pour finir la conversation :", "Merci, au revoir !", ["Enchanté !", "Pardon !"], "Kết thúc: cảm ơn, tạm biệt."),
      noi("Jouez toute la scène : saluez, demandez, remerciez, dites au revoir.", "Bonjour madame. Je voudrais une baguette, s'il vous plaît. Merci beaucoup. Bonne journée, au revoir !"),
    ],
    tu: ["une conversation (nom féminin) : cuộc trò chuyện", "commencer (verbe) : bắt đầu", "finir (verbe) : kết thúc", "remercier (verbe) : cảm ơn", "au revoir (expression) : tạm biệt"],
    meo: ["Một lượt lịch sự: chào, xin, cảm ơn, tạm biệt.", "Điểm lịch sự có trong tiêu chí thi."] },

  /* ───────── A1-PO-5 : nói rõ, ghép từ kho câu phát âm ───────── */
  { ma: "A1-PO-5", vong: "hoc", tieuDe: tq("lettres muettes"), de: DE_DOC,
    cau: [doc("pa-a1-08", "Les enfants aiment les oiseaux."), doc("pa-a1-29", "Mes amis sont en vacances."), doc("pa-a1-28", "Le train part dans une minute."), doc("pa-a1-30", "Quel temps fait-il ?"), doc("pa-a1-20", "C'est un grand jardin."), doc("pa-a1-18", "Je suis très heureux."), doc("pa-a1-06", "Il y a deux euros sur la table."), doc("pa-a1-21", "Mon oncle habite à Bordeaux.")],
    tu: ["une lettre muette (expression) : chữ câm", "un oiseau (nom masculin) : con chim", "les vacances (nom féminin pluriel) : kỳ nghỉ", "heureux (adjectif) : hạnh phúc", "un oncle (nom masculin) : chú, bác"],
    meo: ["Phụ âm cuối thường không đọc: grand, temps, part.", "Không cần giọng chuẩn, cần người nghe hiểu."] },
  { ma: "A1-PO-5", vong: "hoc", tieuDe: tq("rue ou roue ?"), de: DE_DOC,
    cau: [doc("pa-a1-03", "Tu as vu la rue ?"), doc("pa-a1-04", "Où est la roue rouge ?"), doc("pa-a1-15", "Rose roule sur la route."), doc("pa-a1-13", "Le pull bleu est dans le placard."), doc("pa-a1-35", "Le chat noir saute sur le mur."), doc("pa-a1-47", "La rue est très étroite."), doc("pa-a1-14", "Tout le monde est là."), doc("pa-a1-24", "Où sont mes chaussures ?")],
    tu: ["la rue (nom féminin) : đường phố", "la roue (nom féminin) : bánh xe", "rouler (verbe) : lăn, chạy", "un mur (nom masculin) : bức tường", "des chaussures (nom féminin pluriel) : giày"],
    meo: ["u: chu môi tròn như nói « uy » nhưng giữ nguyên miệng.", "ou: đọc như « u » tiếng Việt."] },
  { ma: "A1-PO-5", vong: "hoc", tieuDe: tq("vin, vent, bon"), de: DE_DOC,
    cau: [doc("pa-a1-02", "Un bon vin blanc."), doc("pa-a1-12", "Un lapin brun mange du pain."), doc("pa-a1-11", "Le vent souffle fort ce soir."), doc("pa-a1-38", "Il y a du vent sur la plage."), doc("pa-a1-43", "Elle chante une chanson."), doc("pa-a1-42", "Mon père aime le poisson."), doc("pa-a1-33", "J'ai faim et j'ai soif."), doc("pa-a1-32", "Une grande tour blanche.")],
    tu: ["le vin (nom masculin) : rượu vang", "le vent (nom masculin) : gió", "bon, bonne (adjectif) : tốt, ngon", "le pain (nom masculin) : bánh mì", "une chanson (nom féminin) : bài hát"],
    meo: ["Âm mũi đọc bằng mũi, không đọc chữ n cuối.", "So sánh: vin, vent, bon là ba âm khác nhau."] },
  { ma: "A1-PO-5", vong: "on", tieuDe: tq("je me présente à voix haute"), de: DE_DOC,
    cau: [doc("pa-a1-01", "Bonjour, je suis content de vous voir."), doc("pa-a0-69", "je m'appelle Marie"), doc("pa-a0-71", "il habite à Paris"), doc("pa-a1-19", "Nous avons deux enfants."), doc("pa-a1-36", "Nous sommes dix dans la classe."), doc("pa-a1-39", "Je lis un livre intéressant."), doc("pa-a1-48", "Mes grands-parents vivent en Normandie."), doc("pa-a1-07", "Mon ami arrive à midi.")],
    tu: ["à voix haute (expression) : thành tiếng", "content, contente (adjectif) : vui", "une classe (nom féminin) : lớp", "lire (verbe) : đọc", "des grands-parents (nom masculin pluriel) : ông bà"],
    meo: ["Nối âm khi có thể: nous avons đọc liền.", "Tự nghe lại bản ghi: từ nào bạn nghe không rõ thì luyện thêm."] },
  { ma: "A1-PO-5", vong: "chot", tieuDe: tq("je voudrais, s'il vous plaît"), de: DE_DOC,
    cau: [doc("pa-a0-66", "bonjour"), doc("pa-a1-27", "Je voudrais du riz, s'il vous plaît."), doc("pa-a1-46", "Un croissant et un jus d'orange."), doc("pa-a0-68", "un café noir"), doc("pa-a0-65", "un verre d'eau"), doc("pa-a1-37", "Cette robe est trop longue."), doc("pa-a1-50", "Nous allons à la boulangerie."), doc("pa-a1-10", "Merci beaucoup, monsieur.")],
    tu: ["le riz (nom masculin) : gạo, cơm", "un jus d'orange (expression) : nước cam", "un verre (nom masculin) : cốc", "une robe (nom féminin) : váy", "long, longue (adjectif) : dài"],
    meo: ["Câu mua bán nói chậm và rõ, nhất là con số.", "S'il vous plaît đọc liền, không ngắt."] },
  ];
};
