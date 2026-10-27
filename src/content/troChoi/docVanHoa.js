/* Nội dung cho ba trò đọc hiểu và văn hoá (27/10, migration 170). Soạn riêng cho trò
 * chơi, không phải đề thi. Không dùng dấu gạch dài (quy tắc nội dung học). Đáp án là
 * chỉ số trong `pa` (đáp án đúng luôn đặt ở vị trí 0, trò chơi tự xáo khi hiện). */

/* ─── Thám tử đọc: văn bản ngắn đời thường + câu hỏi ai / gì / khi nào / ở đâu ─── */
export const THAM_TU = [
  { cap: "A1", tieuDe: "Un message", van: "Salut Léa ! Je suis malade aujourd'hui. Je ne vais pas à l'école. Tu peux me donner les devoirs de maths ? Merci ! Tom",
    hoi: [
      { q: "Pourquoi Tom ne va pas à l'école ?", pa: ["Il est malade.", "Il est en vacances.", "Il a un rendez-vous."] },
      { q: "Que demande Tom à Léa ?", pa: ["Les devoirs de maths.", "Un livre de français.", "Son numéro de téléphone."] },
    ] },
  { cap: "A1", tieuDe: "À la boulangerie", van: "Boulangerie Martin. Ouverte du mardi au dimanche, de 7 h à 19 h. Fermée le lundi. Baguette : 1,20 €. Croissant : 1,10 €.",
    hoi: [
      { q: "Quel jour la boulangerie est-elle fermée ?", pa: ["Le lundi.", "Le dimanche.", "Le mardi."] },
      { q: "Combien coûte une baguette ?", pa: ["1,20 €.", "1,10 €.", "7 €."] },
    ] },
  { cap: "A1", tieuDe: "Invitation", van: "Samedi, c'est mon anniversaire ! Je fais une fête chez moi à 18 h, 12 rue des Lilas. Apporte ta musique préférée. Réponds-moi avant jeudi. Inès",
    hoi: [
      { q: "Où est la fête ?", pa: ["Chez Inès.", "Au restaurant.", "À l'école."] },
      { q: "Avant quel jour faut-il répondre ?", pa: ["Jeudi.", "Samedi.", "Vendredi."] },
    ] },
  { cap: "A2", tieuDe: "Petite annonce", van: "Étudiante cherche une chambre à Lyon, près de l'université, pour septembre. Budget : 450 € par mois. Non-fumeuse, calme. Contact : marie.d@mail.fr",
    hoi: [
      { q: "Que cherche Marie ?", pa: ["Une chambre.", "Un travail.", "Une colocataire pour son appartement."] },
      { q: "À partir de quand ?", pa: ["Septembre.", "Maintenant.", "Janvier."] },
      { q: "Combien peut-elle payer ?", pa: ["450 € par mois.", "450 € par semaine.", "Elle ne le dit pas."] },
    ] },
  { cap: "A2", tieuDe: "Météo du week-end", van: "Samedi matin, il pleuvra sur tout le nord de la France. L'après-midi, le soleil reviendra. Dimanche, il fera chaud dans le sud, jusqu'à 30 degrés.",
    hoi: [
      { q: "Quel temps fera-t-il samedi matin dans le nord ?", pa: ["Il pleuvra.", "Il fera très chaud.", "Il neigera."] },
      { q: "Où fera-t-il chaud dimanche ?", pa: ["Dans le sud.", "Dans le nord.", "Partout."] },
    ] },
  { cap: "A2", tieuDe: "Règlement de la piscine", van: "Le bonnet de bain est obligatoire. Il est interdit de courir autour du bassin. Les enfants de moins de 10 ans doivent être accompagnés d'un adulte.",
    hoi: [
      { q: "Qu'est-ce qui est obligatoire ?", pa: ["Le bonnet de bain.", "Les lunettes de soleil.", "Une carte d'identité."] },
      { q: "Qui doit venir avec un adulte ?", pa: ["Les enfants de moins de 10 ans.", "Tous les enfants.", "Les nageurs débutants."] },
    ] },
  { cap: "B1", tieuDe: "Courriel professionnel", van: "Madame, suite à notre entretien de mardi, j'ai le plaisir de vous confirmer votre embauche. Vous commencerez le 3 novembre. Merci de nous envoyer votre RIB et une copie de votre diplôme avant la fin du mois.",
    hoi: [
      { q: "Quel est le but de ce courriel ?", pa: ["Confirmer une embauche.", "Refuser une candidature.", "Fixer un entretien."] },
      { q: "Que doit envoyer la personne ?", pa: ["Son RIB et une copie de son diplôme.", "Une lettre de motivation.", "Son CV mis à jour."] },
    ] },
  { cap: "B1", tieuDe: "Avis d'un client", van: "Hôtel très bien situé, à deux pas de la gare. La chambre était propre mais un peu petite. Le petit-déjeuner, en revanche, était décevant : peu de choix et pain rassis. Je reviendrai quand même pour l'emplacement.",
    hoi: [
      { q: "Qu'est-ce que le client a apprécié ?", pa: ["L'emplacement de l'hôtel.", "Le petit-déjeuner.", "La grande chambre."] },
      { q: "Le client reviendra-t-il ?", pa: ["Oui, malgré quelques défauts.", "Non, jamais.", "Il ne le dit pas."] },
    ] },
  { cap: "B1", tieuDe: "Article court", van: "De plus en plus de Français choisissent le vélo pour aller au travail. Selon les villes, les pistes cyclables se multiplient. Mais beaucoup de cyclistes regrettent encore le manque de parkings sécurisés.",
    hoi: [
      { q: "De quoi parle l'article ?", pa: ["Du vélo pour aller au travail.", "Des transports en commun.", "De la voiture électrique."] },
      { q: "Que regrettent les cyclistes ?", pa: ["Le manque de parkings sécurisés.", "Le prix des vélos.", "La pollution."] },
    ] },
];

/* ─── Đố vui nước Pháp: văn hoá, địa lý, ẩm thực, ngôn ngữ ─── */
export const DO_VUI = [
  { q: "Thủ đô của Pháp là thành phố nào?", pa: ["Paris", "Lyon", "Marseille", "Nice"], gt: "Paris là thủ đô và là thành phố lớn nhất nước Pháp." },
  { q: "Ba màu của cờ Pháp, từ trái sang phải?", pa: ["Xanh, trắng, đỏ", "Đỏ, trắng, xanh", "Trắng, xanh, đỏ", "Xanh, đỏ, trắng"], gt: "Cờ tam tài: bleu, blanc, rouge." },
  { q: "Ngày Quốc khánh Pháp là ngày nào?", pa: ["14 tháng 7", "1 tháng 5", "11 tháng 11", "25 tháng 12"], gt: "14/7 kỷ niệm sự kiện phá ngục Bastille năm 1789." },
  { q: "Tháp Eiffel được hoàn thành cho sự kiện nào?", pa: ["Triển lãm Thế giới 1889", "Thế vận hội 1900", "Lễ đăng quang của Napoléon", "Kỷ niệm 1000 năm Paris"], gt: "Tháp hoàn thành năm 1889 cho Exposition universelle." },
  { q: "Sông nào chảy qua Paris?", pa: ["Sông Seine", "Sông Loire", "Sông Rhône", "Sông Garonne"], gt: "La Seine chảy qua trung tâm Paris." },
  { q: "Bảo tàng nào trưng bày bức « Mona Lisa » (La Joconde)?", pa: ["Bảo tàng Louvre", "Bảo tàng Orsay", "Trung tâm Pompidou", "Lâu đài Versailles"], gt: "La Joconde nằm ở Louvre, Paris." },
  { q: "Ngọn núi cao nhất nước Pháp?", pa: ["Mont Blanc", "Mont Ventoux", "Puy de Dôme", "Mont Saint-Michel"], gt: "Mont Blanc ở dãy Alpes, cao khoảng 4.800 m." },
  { q: "« Croissant » có hình gì?", pa: ["Trăng lưỡi liềm", "Ngôi sao", "Vòng tròn", "Hình vuông"], gt: "« Croissant » nghĩa đen là trăng lưỡi liềm." },
  { q: "Linh vật biểu tượng của nước Pháp là con vật nào?", pa: ["Gà trống", "Sư tử", "Đại bàng", "Gấu"], gt: "Le coq gaulois, thường thấy trên áo các đội thể thao Pháp." },
  { q: "Khẩu hiệu của nước Cộng hoà Pháp?", pa: ["Tự do, Bình đẳng, Bác ái", "Đoàn kết, Hoà bình, Tiến bộ", "Tổ quốc, Danh dự, Trách nhiệm", "Lao động, Gia đình, Tổ quốc"], gt: "Liberté, Égalité, Fraternité." },
  { q: "Bánh « galette des rois » thường ăn vào dịp nào?", pa: ["Lễ Hiển linh, đầu tháng 1", "Lễ Phục sinh", "Quốc khánh 14/7", "Lễ Giáng sinh"], gt: "Ai gặp « la fève » trong bánh sẽ làm vua." },
  { q: "Tour de France là giải đấu môn gì?", pa: ["Đua xe đạp", "Quần vợt", "Đua xe công thức 1", "Chạy marathon"], gt: "Giải đua xe đạp nổi tiếng nhất thế giới, diễn ra mỗi mùa hè." },
  { q: "Giải quần vợt Grand Slam nào diễn ra ở Paris?", pa: ["Roland-Garros", "Wimbledon", "US Open", "Australian Open"], gt: "Roland-Garros đánh trên sân đất nện." },
  { q: "Khi gặp người quen, người Pháp hay chào bằng cách nào?", pa: ["La bise (chạm má)", "Cúi đầu", "Chắp tay", "Vỗ vai"], gt: "Số lần « bise » khác nhau tuỳ vùng." },
  { q: "Ở Pháp, « TGV » là gì?", pa: ["Tàu cao tốc", "Đài truyền hình", "Thuế giá trị gia tăng", "Một loại pho mát"], gt: "Train à Grande Vitesse." },
  { q: "Lâu đài Versailles gắn với vị vua nào?", pa: ["Louis XIV", "Napoléon Bonaparte", "Charlemagne", "Henri IV"], gt: "« Vua Mặt Trời » Louis XIV biến Versailles thành nơi ở của triều đình." },
  { q: "Ở Pháp có khoảng bao nhiêu loại pho mát (ước lượng thường nói)?", pa: ["Hơn 1.000", "Khoảng 50", "Khoảng 100", "Khoảng 10"], gt: "Người ta thường nói Pháp có hơn 1.000 loại pho mát." },
  { q: "Tổ chức nào gồm các nước dùng tiếng Pháp, có cả Việt Nam?", pa: ["La Francophonie (OIF)", "Liên minh châu Âu", "ASEAN", "NATO"], gt: "Việt Nam là thành viên của Tổ chức Quốc tế Pháp ngữ." },
  { q: "Ở nhà hàng Pháp, « l'addition, s'il vous plaît » nghĩa là gì?", pa: ["Cho tôi hoá đơn", "Cho tôi thực đơn", "Cho tôi thêm nước", "Cho tôi món tráng miệng"], gt: "« L'addition » là hoá đơn thanh toán." },
  { q: "« Bon appétit ! » được nói khi nào?", pa: ["Trước bữa ăn", "Khi chia tay", "Khi chúc ngủ ngon", "Khi chúc mừng sinh nhật"], gt: "Lời chúc ngon miệng trước khi ăn." },
  { q: "Vùng nào của Pháp nổi tiếng với rượu sủi bọt mang tên vùng?", pa: ["Champagne", "Bretagne", "Normandie", "Alsace"], gt: "Chỉ rượu sản xuất ở vùng Champagne mới được gọi là champagne." },
  { q: "Món « crêpe » nổi tiếng gắn với vùng nào?", pa: ["Bretagne", "Provence", "Bourgogne", "Corse"], gt: "Bretagne nổi tiếng với crêpe và galette." },
  { q: "Đồng tiền đang dùng ở Pháp?", pa: ["Euro", "Franc", "Bảng Anh", "Đô la"], gt: "Pháp dùng euro từ năm 2002, thay cho franc." },
  { q: "Tác giả cuốn « Hoàng tử bé » (Le Petit Prince)?", pa: ["Antoine de Saint-Exupéry", "Victor Hugo", "Albert Camus", "Molière"], gt: "Sách xuất bản năm 1943." },
  { q: "Tác giả « Những người khốn khổ » (Les Misérables)?", pa: ["Victor Hugo", "Émile Zola", "Gustave Flaubert", "Jules Verne"], gt: "Victor Hugo, xuất bản năm 1862." },
];

/* ─── Phiêu lưu ở Paris: chọn câu đáp phù hợp tình huống. pa[0] là câu hợp nhất. ─── */
export const PHIEU_LUU = [
  { canh: "☕ Café", tinh: "Bạn vào quán cà phê, người phục vụ hỏi: « Bonjour, qu'est-ce que je vous sers ? »",
    pa: ["Bonjour, un café, s'il vous plaît.", "Au revoir, à demain !", "Je m'appelle Paul, et vous ?"], gt: "Gọi món lịch sự: « un café, s'il vous plaît »." },
  { canh: "☕ Café", tinh: "Uống xong, bạn muốn trả tiền.",
    pa: ["L'addition, s'il vous plaît.", "Le menu, s'il vous plaît.", "Encore un café, merci."], gt: "« L'addition » là hoá đơn." },
  { canh: "🚇 Métro", tinh: "Bạn không biết đường tới tháp Eiffel, bạn hỏi một người đi đường.",
    pa: ["Excusez-moi, pour aller à la tour Eiffel, s'il vous plaît ?", "Tu vas où, toi ?", "Je n'aime pas la tour Eiffel."], gt: "Mở đầu bằng « Excusez-moi » khi hỏi người lạ." },
  { canh: "🚇 Métro", tinh: "Ở quầy bán vé, nhân viên hỏi: « Vous voulez quel billet ? »",
    pa: ["Un ticket pour une personne, s'il vous plaît.", "Je voudrais une chambre double.", "C'est trop cher, au revoir."], gt: "Mua vé: « un ticket, s'il vous plaît »." },
  { canh: "🏨 Hôtel", tinh: "Bạn tới khách sạn đã đặt phòng trước.",
    pa: ["Bonsoir, j'ai une réservation au nom de Nguyen.", "Bonsoir, je cherche un restaurant.", "Bonsoir, où est la gare ?"], gt: "« J'ai une réservation au nom de… »." },
  { canh: "🏨 Hôtel", tinh: "Lễ tân hỏi: « Le petit-déjeuner est à quelle heure pour vous ? »",
    pa: ["Vers huit heures, s'il vous plaît.", "Pour trois nuits.", "Au deuxième étage."], gt: "Câu hỏi về giờ, trả lời bằng giờ." },
  { canh: "🥖 Boulangerie", tinh: "Bạn muốn mua hai chiếc bánh sừng bò.",
    pa: ["Deux croissants, s'il vous plaît.", "Deux baguettes, s'il vous plaît.", "Deux kilos de pommes, s'il vous plaît."], gt: "Croissant = bánh sừng bò." },
  { canh: "🥖 Boulangerie", tinh: "Người bán nói: « Ça fera 2,20 €. » Bạn chỉ có tờ 10 €.",
    pa: ["Voilà, j'ai seulement un billet de 10 €.", "Non merci, ça va.", "Je voudrais aussi un café."], gt: "Giải thích bạn trả bằng tờ tiền lớn." },
  { canh: "💊 Pharmacie", tinh: "Bạn bị đau đầu và vào hiệu thuốc.",
    pa: ["Bonjour, j'ai mal à la tête. Vous avez quelque chose ?", "Bonjour, je voudrais un billet de train.", "Bonjour, j'ai faim."], gt: "« J'ai mal à la tête » = tôi đau đầu." },
  { canh: "💊 Pharmacie", tinh: "Dược sĩ hỏi: « Vous êtes allergique à un médicament ? » Bạn không bị dị ứng gì.",
    pa: ["Non, je n'ai pas d'allergie.", "Oui, j'adore les médicaments.", "Je ne sais pas parler."], gt: "Phủ định với « pas de »: « je n'ai pas d'allergie »." },
  { canh: "🛍️ Magasin", tinh: "Bạn muốn thử một chiếc áo.",
    pa: ["Je peux essayer cette chemise ?", "Je peux manger cette chemise ?", "Cette chemise est à moi."], gt: "« Essayer » = thử (quần áo)." },
  { canh: "🛍️ Magasin", tinh: "Áo hơi chật, bạn hỏi cỡ khác.",
    pa: ["Vous l'avez en plus grand ?", "Vous l'avez en plus cher ?", "Elle est parfaite, merci."], gt: "« En plus grand » = cỡ lớn hơn." },
  { canh: "🍽️ Restaurant", tinh: "Người phục vụ hỏi: « Vous avez choisi ? » Bạn chưa chọn xong.",
    pa: ["Pas encore, encore quelques minutes, s'il vous plaît.", "Oui, l'addition.", "Non, je pars."], gt: "Xin thêm thời gian một cách lịch sự." },
  { canh: "🍽️ Restaurant", tinh: "Bạn không ăn thịt và muốn hỏi món chay.",
    pa: ["Vous avez un plat végétarien ?", "Vous avez un plat très épicé ?", "Je voudrais un steak, s'il vous plaît."], gt: "Végétarien = món chay." },
  { canh: "👋 Au revoir", tinh: "Bạn chia tay người bạn mới quen sau một buổi tối vui vẻ.",
    pa: ["Merci pour cette soirée, à bientôt !", "Bonjour, enchanté !", "Je suis désolé, je ne comprends pas."], gt: "« À bientôt » = hẹn sớm gặp lại." },
];
