/* Nội dung cản trở Thám tử Léon (31/10, giai đoạn 3).
 *   BRUNO:    câu thách của Bruno, theo mức. pa[0] là đáp án đúng.
 *   TIN_GIA:  tin nhắn giả ký tên Léon. pa là ba câu trong tin, pa[0] là câu SAI tiếng Pháp.
 *   KHAI:     theo id vụ, một lời khai sai (gia) và một lời khai đúng (that), đều đối chiếu
 *             được với TÀI LIỆU CẢNH 0 của vụ đó. Sửa tài liệu ở thamTu.js thì đọc lại ở đây.
 * KHÔNG dùng dấu gạch dài (quy tắc 7). */
export const BRUNO = {
  de: [
    { q: "Hier, je ___ allé au commissariat.", pa: ["suis", "ai", "es", "vais"], gt: "« aller » dùng être ở passé composé: je suis allé." },
    { q: "Il y a ___ voitures devant la gare.", pa: ["beaucoup de", "beaucoup", "très", "trop"], gt: "Trước danh từ phải có « de »: beaucoup de voitures." },
    { q: "Elle ___ lève à sept heures.", pa: ["se", "me", "te", "nous"], gt: "Động từ phản thân với « elle »: elle se lève." },
    { q: "Nous allons ___ Paris demain.", pa: ["à", "en", "au", "dans"], gt: "Trước tên thành phố dùng « à »: à Paris." },
  ],
  vua: [
    { q: "Le témoin ___ j'ai téléphoné est parti.", pa: ["à qui", "que", "qui", "dont"], gt: "« téléphoner à quelqu'un » nên đại từ quan hệ là « à qui »." },
    { q: "Si j'avais le temps, je ___ le dossier.", pa: ["lirais", "lirai", "lisais", "lis"], gt: "Si + imparfait thì mệnh đề chính dùng conditionnel présent: je lirais." },
    { q: "Il faut que vous ___ ici.", pa: ["veniez", "venez", "venir", "viendrez"], gt: "« Il faut que » đòi subjonctif: que vous veniez." },
    { q: "Je n'ai vu ___ entrer dans le bureau.", pa: ["personne", "jamais", "plus", "aucun"], gt: "« ne… personne » đứng sau phân từ: je n'ai vu personne." },
  ],
  kho: [
    { q: "Bien qu'il ___ innocent, personne ne le croit.", pa: ["soit", "est", "sera", "était"], gt: "« Bien que » đòi subjonctif: bien qu'il soit." },
    { q: "C'est la raison pour ___ il a menti.", pa: ["laquelle", "lequel", "quoi", "que"], gt: "« raison » là giống cái, sau giới từ dùng « laquelle »." },
    { q: "Une fois le dossier ___, nous partirons.", pa: ["terminé", "terminant", "terminer", "termine"], gt: "« Une fois » + danh từ + phân từ quá khứ: une fois le dossier terminé." },
    { q: "Il nie tout, ___ les preuves sont accablantes.", pa: ["alors que", "puisque", "afin que", "pour que"], gt: "Cần ý đối lập: « alors que ». « afin que » và « pour que » còn đòi subjonctif." },
  ],
};

export const TIN_GIA = {
  de: [
    { van: "Bonjour, c'est Léon. J'ai allé à la gare ce matin. Viens vite, s'il te plaît.", pa: ["J'ai allé à la gare ce matin.", "Bonjour, c'est Léon.", "Viens vite, s'il te plaît."], gt: "Phải là « je suis allé ». Léon không bao giờ viết sai câu này." },
    { van: "C'est Léon. Rendez-vous à dix heures. Je vais à le marché.", pa: ["Je vais à le marché.", "C'est Léon.", "Rendez-vous à dix heures."], gt: "« à + le » phải gộp thành « au »: au marché." },
    { van: "Ici Léon. Regarde derrière la gare. La voiture est petit et rouge.", pa: ["La voiture est petit et rouge.", "Ici Léon.", "Regarde derrière la gare."], gt: "« voiture » là giống cái nên tính từ là « petite »." },
    { van: "C'est Léon. Il ne parle français pas. Attends-moi au café.", pa: ["Il ne parle français pas.", "C'est Léon.", "Attends-moi au café."], gt: "« pas » đứng ngay sau động từ: il ne parle pas français." },
  ],
  vua: [
    { van: "Ici Léon. Je te attends devant le musée. Ne dis rien à Bruno.", pa: ["Je te attends devant le musée.", "Ici Léon.", "Ne dis rien à Bruno."], gt: "« te » trước nguyên âm phải rút thành « t' »: je t'attends." },
    { van: "C'est Léon. Hier, nous sommes allé au marché. Reviens là-bas tout de suite.", pa: ["Hier, nous sommes allé au marché.", "C'est Léon.", "Reviens là-bas tout de suite."], gt: "Với être, phân từ hợp theo chủ ngữ: nous sommes allés." },
    { van: "Léon à l'appareil. Si tu viendras ce soir, je te montrerai la lettre. Prends le dernier métro.", pa: ["Si tu viendras ce soir, je te montrerai la lettre.", "Léon à l'appareil.", "Prends le dernier métro."], gt: "Sau « si » không dùng futur: si tu viens ce soir." },
    { van: "Ici Léon. Les témoins que j'ai vu sont partis. Va vite à l'hôtel de ville.", pa: ["Les témoins que j'ai vu sont partis.", "Ici Léon.", "Va vite à l'hôtel de ville."], gt: "Bổ ngữ trực tiếp « que » đứng trước avoir thì phân từ hợp theo: que j'ai vus." },
  ],
  kho: [
    { van: "Ici Léon. Bien que je suis en retard, ne partez pas sans moi. Le train part à midi.", pa: ["Bien que je suis en retard, ne partez pas sans moi.", "Ici Léon.", "Le train part à midi."], gt: "« Bien que » đòi subjonctif: bien que je sois en retard." },
    { van: "Léon à l'appareil. C'est le dossier dont je vous ai parlé de. Apportez-le à la gare du Nord.", pa: ["C'est le dossier dont je vous ai parlé de.", "Léon à l'appareil.", "Apportez-le à la gare du Nord."], gt: "« dont » đã chứa sẵn « de », viết thêm là thừa: dont je vous ai parlé." },
    { van: "Ici Léon. Les lettres que Garnier a écrit sont au bureau. Allez les chercher sans attendre.", pa: ["Les lettres que Garnier a écrit sont au bureau.", "Ici Léon.", "Allez les chercher sans attendre."], gt: "« que » thay cho « lettres » đứng trước avoir: que Garnier a écrites." },
    { van: "C'est Léon. Il faut que vous venez seul au kiosque. Ne prévenez personne.", pa: ["Il faut que vous venez seul au kiosque.", "C'est Léon.", "Ne prévenez personne."], gt: "« Il faut que » đòi subjonctif: que vous veniez." },
  ],
};

export const KHAI = {
  croissant: {
    gia: ["Mme Petit a mis le croissant dans le four.", "Ghi chú của bà Petit viết « sur la table », không phải trong lò."],
    that: ["À 7 h 30, le croissant n'était plus là.", "Ghi chú viết đúng như vậy: « À 7 h 30, le croissant n'est plus là ! »"],
  },
  valise: {
    gia: ["Antoine Morel habite à Lyon.", "Thẻ tên ghi « 13001 Marseille ». Lyon là nơi Léa vừa đi từ đó tới."],
    that: ["Antoine Morel habite rue des Lilas.", "Thẻ tên ghi « 12, rue des Lilas »."],
  },
  minou: {
    gia: ["Minou est un grand chat noir.", "Tờ rơi tả Minou nhỏ và xám: « gris », « il est petit »."],
    that: ["Minou a peur des chiens.", "Tờ rơi viết « il a peur des chiens »."],
  },
  tableau: {
    gia: ["Le tableau revient au musée mercredi.", "Email của giám đốc viết « mardi, vers 14 h »."],
    that: ["Quelqu'un de l'équipe doit signer le bon de livraison.", "Email viết « devra signer le bon de livraison »."],
  },
  marche: {
    gia: ["Le touriste en rouge est parti très vite vers la rue Crozatier.", "Người rời đi nhanh là chàng trai áo vàng. Du khách áo đỏ đứng chụp ảnh phô mai."],
    that: ["Le jeune homme en veste jaune s'est excusé.", "Ông bán phô mai kể « il s'est excusé »."],
  },
  concert: {
    gia: ["L'e-mail vient de l'adresse officielle du théâtre.", "Email gửi từ salle-etoile.com, còn địa chỉ chính thức là salle-etoile.fr."],
    that: ["L'adresse officielle du théâtre finit par .fr.", "Dòng cuối ghi địa chỉ chính thức: contact@salle-etoile.fr."],
  },
  lettres: {
    gia: ["Le papier de la lettre vient d'une papeterie de Paris.", "Hình in chìm ghi « Papeterie Vasseur, Rouen »."],
    that: ["P.G. écrit que la directrice sera en réunion.", "Lá thư viết « la directrice sera en réunion »."],
  },
  chronique: {
    gia: ["Paul Garnier admire le travail de l'inspecteur Léon.", "Garnier viết « Permettez-moi d'en douter » và muốn chứng minh Léon có thể bị thao túng."],
    that: ["Paul Garnier prépare un livre.", "Chuyên mục viết « Je prépare un livre sur ce sujet »."],
  },
  kiosque: {
    gia: ["P.G. passera au kiosque tous les jours.", "Câu đố viết « le seul jour où il ouvre plus tard »: chỉ một ngày."],
    that: ["P.G. viendra une heure après l'ouverture.", "Câu đố viết « exactement une heure après son ouverture »."],
  },
};
