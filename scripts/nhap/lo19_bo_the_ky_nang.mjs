/* Lô 19 (15/10, theo chủ dự án): thêm Flashcard cho ba kỹ năng Nghe (CO),
 * Viết (PE), Nói (PO): mỗi kỹ năng 3 bộ × 12 thẻ, công khai, miễn phí.
 * Khuôn giống các bộ giáo viên đã soạn: mặt trước tiếng Pháp, mặt sau tiếng
 * Việt, câu ví dụ, `loai` cho Thách đấu (so|cau|nhom_tu|tu_noi|mo_dau|dong_tu|
 * tinh_tu|thanh_ngu). Nội dung học: KHÔNG dùng dấu gạch dài.
 *
 * Chạy: node scripts/nhap/lo19_bo_the_ky_nang.mjs > lo19.sql (rồi db query -f) */
const GV = "ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c";

const BO = [
  /* ── NGHE ── */
  { ten: "Nghe bản tin trên đài", ky: "CO", chu: "truyen-thong", mo: "Những cụm từ hay gặp trong bản tin radio và bài nghe DELF B1–C1.", the: [
    ["Selon nos informations…", "Theo thông tin chúng tôi có được…", "Selon nos informations, le ministre devrait démissionner ce soir.", "mo_dau"],
    ["D'après un sondage réalisé par…", "Theo một cuộc thăm dò do … thực hiện", "D'après un sondage réalisé par l'Ifop, 60 % des Français sont favorables.", "mo_dau"],
    ["Les faits remontent à…", "Sự việc xảy ra từ…", "Les faits remontent à la nuit de samedi à dimanche.", "cau"],
    ["Une enquête a été ouverte.", "Một cuộc điều tra đã được mở.", "Une enquête a été ouverte pour déterminer les causes de l'accident.", "cau"],
    ["en hausse / en baisse", "tăng / giảm", "Le chômage est en baisse pour le troisième mois consécutif.", "nhom_tu"],
    ["un bilan provisoire", "con số thống kê tạm thời (thương vong, thiệt hại)", "Le bilan provisoire fait état de trois blessés.", "nhom_tu"],
    ["faire état de", "cho biết, nêu ra", "Le rapport fait état de nombreuses irrégularités.", "dong_tu"],
    ["Il est question de…", "Đang có chuyện bàn đến…", "Il est question de fermer deux lignes de bus.", "cau"],
    ["les forces de l'ordre", "lực lượng giữ gìn trật tự (cảnh sát, hiến binh)", "Les forces de l'ordre sont intervenues rapidement.", "nhom_tu"],
    ["à l'heure où nous parlons", "ngay lúc này, khi chúng tôi đang lên sóng", "À l'heure où nous parlons, les négociations se poursuivent.", "mo_dau"],
    ["On fait le point avec…", "Chúng ta cùng điểm lại tình hình với…", "On fait le point avec notre correspondant à Lyon.", "cau"],
    ["Restez à l'écoute.", "Hãy tiếp tục theo dõi (đừng chuyển kênh).", "Restez à l'écoute, la suite après la publicité.", "cau"],
  ] },
  { ten: "Khẩu ngữ khi nghe hội thoại", ky: "CO", chu: "truyen-thong", mo: "Từ đệm và lối nói thân mật người Pháp dùng hằng ngày, hay khiến bài nghe khó hiểu.", the: [
    ["du coup", "thế là, vậy nên", "Le train était annulé, du coup j'ai pris la voiture.", "tu_noi"],
    ["en fait", "thật ra", "En fait, je ne suis pas d'accord avec toi.", "tu_noi"],
    ["bref", "tóm lại", "Bref, on a passé une super soirée.", "tu_noi"],
    ["bah / ben", "ừ thì, thì (từ đệm do dự)", "Ben, je sais pas trop, on verra.", "tu_noi"],
    ["… quoi", "… ấy mà, đấy (cuối câu, nhấn mạnh)", "C'était nul, quoi.", "tu_noi"],
    ["J'sais pas.", "Tôi không biết (je ne sais pas, nói nhanh).", "J'sais pas, demande à Paul.", "cau"],
    ["Y a pas de souci.", "Không vấn đề gì (il n'y a pas de souci).", "Tu peux venir demain ? Y a pas de souci.", "cau"],
    ["un truc", "một cái gì đó, đồ vật", "Passe-moi le truc sur la table.", "nhom_tu"],
    ["bosser", "làm việc (thân mật)", "Je bosse tout le week-end.", "dong_tu"],
    ["Ça marche !", "Được đấy! / Đồng ý!", "On se retrouve à huit heures ? Ça marche !", "cau"],
    ["C'est pas grave.", "Không sao đâu.", "Tu as oublié ? C'est pas grave.", "cau"],
    ["avoir la flemme", "lười, chẳng muốn làm", "J'ai la flemme de sortir ce soir.", "thanh_ngu"],
  ] },
  { ten: "Thông báo và hướng dẫn", ky: "CO", chu: "di-lai-so", mo: "Câu thường gặp trong thông báo ở nơi công cộng, tin nhắn thoại, hướng dẫn.", the: [
    ["Votre attention, s'il vous plaît.", "Xin quý khách chú ý.", "Votre attention, s'il vous plaît : le magasin fermera dans dix minutes.", "cau"],
    ["en raison de", "do, vì (lý do chính thức)", "En raison de travaux, la ligne 4 est interrompue.", "tu_noi"],
    ["Nous vous prions de bien vouloir…", "Kính mong quý khách vui lòng…", "Nous vous prions de bien vouloir nous excuser.", "mo_dau"],
    ["est reporté(e) à une date ultérieure", "được hoãn đến một ngày sau", "Le concert est reporté à une date ultérieure.", "cau"],
    ["Veuillez patienter.", "Xin vui lòng chờ.", "Tous nos conseillers sont occupés, veuillez patienter.", "cau"],
    ["un retard de vingt minutes", "chậm hai mươi phút", "Le TGV 6512 est annoncé avec un retard de vingt minutes.", "so"],
    ["Tapez 1.", "Bấm phím 1.", "Pour le service client, tapez 1.", "cau"],
    ["après le bip sonore", "sau tiếng bíp", "Laissez votre message après le bip sonore.", "nhom_tu"],
    ["les horaires d'ouverture", "giờ mở cửa", "Nos horaires d'ouverture sont du lundi au samedi.", "nhom_tu"],
    ["muni(e) de", "mang theo, có sẵn", "Présentez-vous muni d'une pièce d'identité.", "tinh_tu"],
    ["Il est rappelé que…", "Xin nhắc lại rằng…", "Il est rappelé qu'il est interdit de fumer dans la gare.", "mo_dau"],
    ["sous peine de", "nếu không sẽ bị (phạt)", "Compostez votre billet, sous peine d'amende.", "tu_noi"],
  ] },
  /* ── VIẾT ── */
  { ten: "Nguyên nhân và hệ quả", ky: "PE", chu: "tu-noi", mo: "Từ nối diễn đạt nguyên nhân và hệ quả, cần cho bài luận B1–C1.", the: [
    ["en raison de", "do, vì (+ danh từ)", "En raison de la crise, les prix ont augmenté.", "tu_noi"],
    ["étant donné que", "xét rằng, bởi lẽ", "Étant donné que les ressources sont limitées, il faut faire des choix.", "tu_noi"],
    ["dans la mesure où", "trong chừng mực, bởi vì", "Ce projet est utile dans la mesure où il crée des emplois.", "tu_noi"],
    ["faute de", "vì thiếu", "Faute de moyens, le projet a été abandonné.", "tu_noi"],
    ["grâce à", "nhờ có (nguyên nhân tích cực)", "Grâce à cette loi, la pollution a diminué.", "tu_noi"],
    ["à cause de", "tại vì (nguyên nhân tiêu cực)", "À cause du bruit, les habitants dorment mal.", "tu_noi"],
    ["par conséquent", "do đó", "Les loyers augmentent ; par conséquent, les jeunes s'éloignent.", "tu_noi"],
    ["c'est pourquoi", "đó là lý do vì sao", "Le temps presse, c'est pourquoi il faut agir.", "tu_noi"],
    ["si bien que", "đến nỗi, thành ra", "Il a beaucoup plu, si bien que la rivière a débordé.", "tu_noi"],
    ["entraîner", "kéo theo, gây ra", "Cette décision entraînera des licenciements.", "dong_tu"],
    ["découler de", "bắt nguồn từ", "Ces difficultés découlent d'un manque d'anticipation.", "dong_tu"],
    ["susciter", "khơi dậy, gây ra (cảm xúc, phản ứng)", "La réforme suscite de vives critiques.", "dong_tu"],
  ] },
  { ten: "Viết bài báo và bài blog", ky: "PE", chu: "truyen-thong", mo: "Cách mở bài, dẫn dắt và kết bài cho dạng article, blog, tribune.", the: [
    ["Qui n'a jamais rêvé de… ?", "Ai chưa từng mơ… ? (câu hỏi mở bài gây chú ý)", "Qui n'a jamais rêvé de travailler depuis la plage ?", "mo_dau"],
    ["Depuis quelques années, on assiste à…", "Vài năm gần đây, chúng ta chứng kiến…", "Depuis quelques années, on assiste à l'essor du vélo en ville.", "mo_dau"],
    ["Il suffit de… pour…", "Chỉ cần… là…", "Il suffit de se promener en ville pour s'en rendre compte.", "cau"],
    ["Prenons l'exemple de…", "Hãy lấy ví dụ…", "Prenons l'exemple de Copenhague.", "mo_dau"],
    ["Force est de constater que…", "Phải thừa nhận rằng…", "Force est de constater que les mentalités évoluent.", "mo_dau"],
    ["Reste à savoir si…", "Còn phải xem liệu…", "Reste à savoir si cette tendance durera.", "mo_dau"],
    ["Et vous, qu'en pensez-vous ?", "Còn bạn, bạn nghĩ sao? (kết bài blog)", "Et vous, qu'en pensez-vous ? Dites-le en commentaire !", "cau"],
    ["un titre accrocheur", "một tiêu đề thu hút", "Un bon article commence par un titre accrocheur.", "nhom_tu"],
    ["le chapeau", "đoạn dẫn (sa-pô) dưới tiêu đề", "Le chapeau résume l'article en deux phrases.", "nhom_tu"],
    ["témoigner", "kể lại, làm chứng", "Plusieurs habitants ont accepté de témoigner.", "dong_tu"],
    ["En somme,", "Tóm lại,", "En somme, le bilan est plutôt positif.", "tu_noi"],
    ["À méditer.", "Đáng để suy ngẫm. (câu kết)", "Moins d'écrans, plus de liens : à méditer.", "cau"],
  ] },
  { ten: "Đề xuất và kêu gọi hành động", ky: "PE", chu: "y-kien", mo: "Đưa ra giải pháp, khuyến nghị, kêu gọi: phần cuối của thư và bài luận.", the: [
    ["Il serait souhaitable que… (+ subjonctif)", "Sẽ là điều đáng mong muốn nếu…", "Il serait souhaitable que la mairie crée des pistes cyclables.", "mo_dau"],
    ["Il faudrait que… (+ subjonctif)", "Cần phải…", "Il faudrait que chacun réduise sa consommation.", "mo_dau"],
    ["Je propose que…", "Tôi đề xuất rằng…", "Je propose que les cours commencent plus tard.", "mo_dau"],
    ["Pourquoi ne pas… ?", "Sao không… ?", "Pourquoi ne pas organiser une journée sans voiture ?", "mo_dau"],
    ["mettre en place", "triển khai, thiết lập", "Il faut mettre en place un système de covoiturage.", "dong_tu"],
    ["sensibiliser à", "nâng cao nhận thức về", "Il est urgent de sensibiliser les jeunes au gaspillage.", "dong_tu"],
    ["inciter quelqu'un à", "khuyến khích ai làm gì", "Une taxe inciterait les entreprises à polluer moins.", "dong_tu"],
    ["une piste de réflexion", "một hướng suy nghĩ", "Voici quelques pistes de réflexion.", "nhom_tu"],
    ["Il est grand temps de…", "Đã đến lúc phải…", "Il est grand temps d'agir.", "mo_dau"],
    ["Mobilisons-nous !", "Hãy cùng hành động!", "Mobilisons-nous pour sauver ce parc !", "cau"],
    ["à court terme / à long terme", "ngắn hạn / dài hạn", "À court terme, la mesure coûte cher ; à long terme, elle rapporte.", "nhom_tu"],
    ["Dans l'attente de votre réponse,", "Trong khi chờ hồi âm của quý vị,", "Dans l'attente de votre réponse, veuillez agréer mes salutations.", "mo_dau"],
  ] },
  /* ── NÓI ── */
  { ten: "Giữ lượt và dẫn dắt khi nói", ky: "PO", chu: "y-kien", mo: "Cách xin lời, giữ lời, quay lại ý chính khi thảo luận với giám khảo.", the: [
    ["Si je peux me permettre…", "Nếu tôi được phép nói…", "Si je peux me permettre, je ne suis pas tout à fait d'accord.", "mo_dau"],
    ["Laissez-moi finir, s'il vous plaît.", "Xin để tôi nói hết.", "Laissez-moi finir, s'il vous plaît, c'est important.", "cau"],
    ["Pour revenir à…", "Để quay lại với…", "Pour revenir à votre question, je pense que…", "mo_dau"],
    ["J'aimerais ajouter que…", "Tôi muốn nói thêm rằng…", "J'aimerais ajouter que le coût est raisonnable.", "mo_dau"],
    ["Comment dire…", "Nói thế nào nhỉ… (câu để kéo dài thời gian suy nghĩ)", "C'est, comment dire, un peu compliqué.", "cau"],
    ["Ce que je veux dire, c'est que…", "Ý tôi muốn nói là…", "Ce que je veux dire, c'est que tout le monde y gagne.", "mo_dau"],
    ["D'une part… d'autre part…", "Một mặt… mặt khác…", "D'une part c'est utile, d'autre part c'est bon marché.", "tu_noi"],
    ["Pour ma part,", "Về phần tôi,", "Pour ma part, je préfère la deuxième solution.", "tu_noi"],
    ["Je vais aborder trois points.", "Tôi sẽ nói về ba ý.", "Je vais aborder trois points : le coût, la santé, l'environnement.", "cau"],
    ["Pour conclure,", "Để kết luận,", "Pour conclure, je dirais que les avantages l'emportent.", "tu_noi"],
    ["C'est une bonne question.", "Đó là một câu hỏi hay. (để có thời gian nghĩ)", "C'est une bonne question, je n'y avais pas pensé.", "cau"],
    ["Autrement dit,", "Nói cách khác,", "Autrement dit, il faut changer nos habitudes.", "tu_noi"],
  ] },
  { ten: "Thương lượng và thuyết phục", ky: "PO", chu: "y-kien", mo: "Cho phần tương tác (exercice en interaction): đề nghị, nhượng bộ, đi đến thoả thuận.", the: [
    ["Et si on… ?", "Hay là mình… ?", "Et si on partait plutôt en train ?", "mo_dau"],
    ["Je comprends votre point de vue, mais…", "Tôi hiểu quan điểm của anh/chị, nhưng…", "Je comprends votre point de vue, mais le prix est trop élevé.", "mo_dau"],
    ["Admettons que…", "Cứ cho là…", "Admettons que vous ayez raison.", "mo_dau"],
    ["Je vous l'accorde.", "Tôi thừa nhận điều đó với anh/chị.", "C'est cher, je vous l'accorde, mais c'est de qualité.", "cau"],
    ["Vous ne trouvez pas que… ?", "Anh/chị không thấy rằng… ?", "Vous ne trouvez pas que ce serait plus simple ?", "mo_dau"],
    ["faire un compromis", "thoả hiệp", "On pourrait faire un compromis : chacun paie la moitié.", "dong_tu"],
    ["Ça me paraît raisonnable.", "Tôi thấy hợp lý.", "Partir à dix heures ? Ça me paraît raisonnable.", "cau"],
    ["À condition que… (+ subjonctif)", "Với điều kiện là…", "J'accepte, à condition que vous m'aidiez.", "tu_noi"],
    ["Ce n'est pas tout à fait ça.", "Không hẳn là như vậy.", "Ce n'est pas tout à fait ça, laissez-moi expliquer.", "cau"],
    ["Je ne vois pas les choses ainsi.", "Tôi không nhìn nhận vấn đề như thế.", "Je ne vois pas les choses ainsi, au contraire.", "cau"],
    ["Marché conclu !", "Chốt vậy nhé! / Thoả thuận rồi!", "Vingt euros ? Marché conclu !", "cau"],
    ["Qu'est-ce que vous en dites ?", "Anh/chị thấy sao?", "On se retrouve samedi, qu'est-ce que vous en dites ?", "cau"],
  ] },
  { ten: "Hỏi lại và làm rõ", ky: "PO", chu: "truyen-thong", mo: "Khi chưa nghe rõ hoặc chưa hiểu câu hỏi của giám khảo: hỏi lại thay vì im lặng.", the: [
    ["Pourriez-vous répéter, s'il vous plaît ?", "Anh/chị có thể nhắc lại được không?", "Pardon, pourriez-vous répéter, s'il vous plaît ?", "cau"],
    ["Qu'entendez-vous par… ?", "Ý anh/chị là gì khi nói… ?", "Qu'entendez-vous par « mobilité douce » ?", "mo_dau"],
    ["Si je comprends bien, …", "Nếu tôi hiểu đúng thì…", "Si je comprends bien, vous êtes contre ce projet ?", "mo_dau"],
    ["Vous voulez dire que… ?", "Ý anh/chị là… ?", "Vous voulez dire que c'est trop tard ?", "mo_dau"],
    ["Je n'ai pas bien saisi.", "Tôi chưa nắm rõ lắm.", "Excusez-moi, je n'ai pas bien saisi la question.", "cau"],
    ["Pourriez-vous parler un peu plus lentement ?", "Anh/chị có thể nói chậm hơn một chút không?", "Pourriez-vous parler un peu plus lentement, s'il vous plaît ?", "cau"],
    ["Comment dit-on… en français ?", "… trong tiếng Pháp nói thế nào?", "Comment dit-on « deadline » en français ?", "cau"],
    ["Je ne connais pas ce mot.", "Tôi không biết từ này.", "Je ne connais pas ce mot, vous pouvez l'expliquer ?", "cau"],
    ["C'est-à-dire ?", "Nghĩa là sao?", "Vous parlez d'un changement radical. C'est-à-dire ?", "cau"],
    ["Pourriez-vous préciser ?", "Anh/chị có thể nói rõ hơn không?", "C'est intéressant. Pourriez-vous préciser ?", "cau"],
    ["Autrement dit, vous pensez que… ?", "Nói cách khác, anh/chị nghĩ rằng… ?", "Autrement dit, vous pensez que c'est inutile ?", "mo_dau"],
    ["Je reformule ma question.", "Tôi xin diễn đạt lại câu hỏi.", "Je reformule ma question : êtes-vous pour ou contre ?", "cau"],
  ] },
];

const q = (s) => (s == null ? "null" : "'" + String(s).replace(/'/g, "''") + "'");
const ra = [];
BO.forEach((b, i) => {
  const dong = b.the.map(([tr, sa, vd, lo], k) => `(${q(tr)}, ${q(sa)}, ${q(vd)}, ${q(lo)}, ${k})`).join(",\n  ");
  ra.push(`with b as (insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, ord, chu_de, tra_phi)
  select ${q(b.ten)}, ${q(b.ky)}, ${q(b.mo)}, ${q(GV)}, true, ${13 + i}, ${q(b.chu)}, false
  where not exists (select 1 from public.the_bo where ten = ${q(b.ten)}) returning id)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, vi_du, loai, ord)
select b.id, v.* from b, (values
  ${dong}
) as v(mat_truoc, mat_sau, vi_du, loai, ord);`);
});
const out = ra.join("\n\n");
if (out.includes("—")) { console.error("Còn dấu gạch dài"); process.exit(1); }
console.log(out);
