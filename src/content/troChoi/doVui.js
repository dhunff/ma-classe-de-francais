/* « Le Grand Quiz de France » (28/10, theo chủ dự án).
 * Léon tham gia gameshow truyền hình quay vòng quanh nước Pháp. Mỗi CHẶNG quay ở một
 * vùng, 5 câu hỏi về vùng đó; đối thủ là bà Minette, mèo vô địch ba mùa liền. Trả lời
 * đúng ít nhất `dat` câu thì thắng chặng, được đóng dấu vào hộ chiếu và mở chặng sau.
 *
 * Ngôn ngữ câu hỏi tăng theo mức: Dễ hỏi bằng tiếng Việt (đáp án có từ tiếng Pháp),
 * Vừa hỏi bằng tiếng Pháp đơn giản, Khó hỏi bằng tiếng Pháp B1–B2. Lời giải (gt) tiếng Việt.
 * pa[0] luôn là đáp án đúng. KHÔNG dùng dấu gạch dài (quy tắc 7). */

export const CHANG = [
  /* ───────────── DỄ ───────────── */
  {
    id: "paris", muc: "de", so: 1, dat: 3, co: "🗼",
    noi: "Paris", ten: "Paris, ville lumière",
    mo: "Bonsoir la France! Tập đầu tiên quay ngay dưới chân tháp Eiffel. Bà Minette ngồi ghế bên kia, liếm móng, chẳng thèm nhìn ta. Trợ lý nhắc bài cho ta nhé!",
    cau: [
      { q: "Tháp Eiffel được hoàn thành năm nào?", pa: ["1889", "1789", "1920", "1950"], gt: "Tháp hoàn thành năm 1889 cho Triển lãm Thế giới (Exposition universelle), đúng 100 năm sau Cách mạng 1789." },
      { q: "Con sông nào chảy qua Paris?", pa: ["La Seine", "La Loire", "Le Rhône", "La Garonne"], gt: "La Seine chia Paris thành « rive droite » (bờ phải) và « rive gauche » (bờ trái)." },
      { q: "Bức « La Joconde » (Mona Lisa) được trưng bày ở đâu?", pa: ["Le Louvre", "Le musée d'Orsay", "Le Centre Pompidou", "Le château de Versailles"], gt: "La Joconde của Léonard de Vinci ở bảo tàng Louvre, bảo tàng được ghé thăm nhiều nhất thế giới." },
      { q: "Khải Hoàn Môn (l'Arc de Triomphe) nằm ở đầu đại lộ nào?", pa: ["Les Champs-Élysées", "Le boulevard Saint-Michel", "La rue de Rivoli", "L'avenue Montaigne"], gt: "Khải Hoàn Môn đứng ở đầu đại lộ Champs-Élysées, giữa quảng trường Charles-de-Gaulle." },
      { q: "Nhà thờ Đức Bà Paris có tên tiếng Pháp là gì?", pa: ["Notre-Dame de Paris", "Le Sacré-Cœur", "La Sainte-Chapelle", "Saint-Sulpice"], gt: "Notre-Dame de Paris, nghĩa đen « Đức Bà của chúng ta ». Nhà thờ mở cửa lại năm 2024 sau vụ cháy 2019." },
    ],
    thang: "Bà Minette nheo mắt: « Pas mal, le chien. » Dấu Paris đầu tiên trong hộ chiếu! Chuyến tàu tiếp theo: Normandie.",
    thua: "Bà Minette thắng sát nút, còn kêu « miaou » đầy khinh khỉnh. Không sao, quay lại tập này nhé!",
  },
  {
    id: "normandie", muc: "de", so: 2, dat: 3, co: "🏰",
    noi: "Normandie & Bretagne", ten: "Entre mer et pommiers",
    mo: "Gió biển thổi bay cả vương miện của bà Minette! Tập này quay giữa Normandie và Bretagne: biển, táo, bánh crêpe. Ta đói rồi đấy…",
    cau: [
      { q: "Món bánh mỏng nổi tiếng nhất của Bretagne là gì?", pa: ["La crêpe", "La baguette", "Le croissant", "Le macaron"], gt: "La crêpe (ngọt) và la galette (mặn, bột kiều mạch) là niềm tự hào của Bretagne." },
      { q: "Tu viện xây trên đảo đá, bị thủy triều bao quanh ở Normandie tên là gì?", pa: ["Le Mont-Saint-Michel", "Le château de Chambord", "La cité de Carcassonne", "Le palais des Papes"], gt: "Le Mont-Saint-Michel: khi triều lên, đảo gần như tách hẳn khỏi đất liền." },
      { q: "Loại pho mát mềm nổi tiếng nào mang tên một làng ở Normandie?", pa: ["Le camembert", "Le roquefort", "Le comté", "Le reblochon"], gt: "Camembert là tên một ngôi làng ở Normandie. Roquefort ở miền Nam, comté ở Jura, reblochon ở Savoie." },
      { q: "Đồ uống lên men từ táo, rất phổ biến ở Normandie và Bretagne?", pa: ["Le cidre", "Le champagne", "Le pastis", "Le cognac"], gt: "Le cidre (rượu táo nhẹ) thường uống kèm crêpe trong một chiếc bát nhỏ (bolée)." },
      { q: "Ngày D-Day, quân Đồng minh đổ bộ lên bờ biển Normandie là ngày nào?", pa: ["6 juin 1944", "14 juillet 1789", "11 novembre 1918", "8 mai 1945"], gt: "Le 6 juin 1944, cuộc đổ bộ lớn nhất lịch sử, mở đầu giải phóng nước Pháp." },
    ],
    thang: "Hai dấu rồi! Bà Minette bắt đầu lo, ngồi chải lông liên tục. Tập sau: nắng vàng Provence!",
    thua: "Lần này bà Minette hơn ta một chút. Ăn một chiếc crêpe cho lại sức rồi thử lại nhé.",
  },
  {
    id: "provence", muc: "de", so: 3, dat: 3, co: "🌻",
    noi: "Provence & Côte d'Azur", ten: "Soleil du Sud",
    mo: "Ve sầu kêu inh ỏi, nắng chói chang. Bà Minette đeo kính râm hàng hiệu. Tập cuối mùa « dễ » đây, thắng là lên hạng!",
    cau: [
      { q: "Những cánh đồng hoa màu tím nổi tiếng của Provence là hoa gì?", pa: ["La lavande", "La tulipe", "La rose", "Le tournesol"], gt: "La lavande (oải hương) nở rộ khoảng tháng Sáu, tháng Bảy." },
      { q: "Thành phố cảng lớn nhất nước Pháp, quê hương món súp cá bouillabaisse?", pa: ["Marseille", "Nice", "Lyon", "Bordeaux"], gt: "Marseille, thành phố lâu đời nhất nước Pháp, do người Hy Lạp lập ra khoảng năm 600 trước Công nguyên." },
      { q: "Liên hoan phim quốc tế nổi tiếng với giải « Cành cọ vàng » diễn ra ở đâu?", pa: ["Cannes", "Nice", "Avignon", "Toulon"], gt: "Festival de Cannes, mỗi tháng Năm. Giải cao nhất: la Palme d'or." },
      { q: "Món rau hầm truyền thống của Provence (cà tím, bí, ớt, cà chua)?", pa: ["La ratatouille", "Le cassoulet", "La choucroute", "Le pot-au-feu"], gt: "La ratatouille, món rau hầm của vùng Nice và Provence." },
      { q: "Trò chơi ném bóng sắt rất được yêu thích ở miền Nam nước Pháp?", pa: ["La pétanque", "Le rugby", "Le croquet", "Le golf"], gt: "La pétanque ra đời ở La Ciotat, gần Marseille, năm 1907." },
    ],
    thang: "Ba dấu! Ban tổ chức tuyên bố: Léon lên hạng « Moyen ». Từ giờ người dẫn chương trình sẽ hỏi bằng TIẾNG PHÁP. Bà Minette suýt làm rơi kính râm.",
    thua: "Nắng quá nên ta hơi chóng mặt. Uống ngụm nước rồi phục thù nào!",
  },

  /* ───────────── VỪA (hỏi bằng tiếng Pháp đơn giản) ───────────── */
  {
    id: "lyon", muc: "vua", so: 4, dat: 3, co: "🦁",
    noi: "Lyon & les Alpes", ten: "Gastronomie et montagnes",
    mo: "Hạng mới, luật mới: người dẫn chương trình chỉ nói tiếng Pháp! Tập này quay ở Lyon, thủ đô ẩm thực, rồi lên núi Alpes. Bà Minette đã đặt bàn ở nhà hàng ngon nhất…",
    cau: [
      { q: "À Lyon, comment s'appellent les petits restaurants traditionnels ?", pa: ["Les bouchons", "Les crêperies", "Les guinguettes", "Les brasseries"], gt: "« Les bouchons lyonnais »: quán nhỏ phục vụ món truyền thống của Lyon." },
      { q: "Quel est le plus haut sommet des Alpes ?", pa: ["Le mont Blanc", "Le mont Ventoux", "Le puy de Dôme", "Le Vignemale"], gt: "Le mont Blanc, khoảng 4 800 m, nằm ở biên giới Pháp và Ý." },
      { q: "Quel plat de montagne se mange avec du fromage fondu et du pain ?", pa: ["La fondue savoyarde", "La bouillabaisse", "La quiche lorraine", "Le cassoulet"], gt: "La fondue savoyarde: nhúng bánh mì vào nồi pho mát chảy, đặc sản Savoie." },
      { q: "Quelle fête illumine Lyon chaque année, début décembre ?", pa: ["La fête des Lumières", "La fête de la Musique", "Le carnaval", "La fête du Citron"], gt: "La fête des Lumières, khoảng ngày 8/12: cả thành phố thắp sáng. Fête du Citron là ở Menton." },
      { q: "À Lyon, les frères Lumière ont inventé…", pa: ["le cinématographe", "le téléphone", "l'avion", "la radio"], gt: "Năm 1895, anh em Lumière chiếu bộ phim đầu tiên với chiếc « cinématographe »." },
    ],
    thang: "Bravo ! Lần đầu nghe hỏi bằng tiếng Pháp mà vẫn thắng! Bà Minette hậm hực ăn hết nồi fondue.",
    thua: "Tiếng Pháp nghe nhanh quá phải không? Đọc lại câu hỏi chậm rãi, lần sau chắc chắn thắng.",
  },
  {
    id: "bordeaux", muc: "vua", so: 5, dat: 3, co: "🍇",
    noi: "Bordeaux & le Sud-Ouest", ten: "Vignes, dunes et ville rose",
    mo: "Tập này đi dọc miền Tây Nam: từ Bordeaux tới Toulouse. Nghe nói bà Minette đã lén học thuộc cả sách địa lý. Ta phải tỉnh táo!",
    cau: [
      { q: "La région de Bordeaux est surtout connue pour…", pa: ["son vin", "ses volcans", "ses stations de ski", "ses champs de lavande"], gt: "Bordeaux là một trong những vùng rượu vang nổi tiếng nhất thế giới." },
      { q: "Comment s'appelle la plus haute dune d'Europe, près d'Arcachon ?", pa: ["La dune du Pilat", "La dune Blanche", "La dune d'Or", "La dune du Nord"], gt: "La dune du Pilat cao hơn 100 m, nhìn ra Đại Tây Dương." },
      { q: "Qu'est-ce qu'il y a surtout dans un cassoulet ?", pa: ["Des haricots blancs et de la viande", "Du poisson et du riz", "Des pâtes et du fromage", "Des pommes et de la crème"], gt: "Le cassoulet: đậu trắng hầm với xúc xích, thịt vịt hoặc thịt lợn, đặc sản vùng Toulouse và Castelnaudary." },
      { q: "Quelles montagnes séparent la France de l'Espagne ?", pa: ["Les Pyrénées", "Les Alpes", "Le Jura", "Les Vosges"], gt: "Les Pyrénées chạy dọc biên giới Pháp và Tây Ban Nha." },
      { q: "Pourquoi appelle-t-on Toulouse « la ville rose » ?", pa: ["À cause de la couleur de ses briques", "À cause de ses fleurs", "À cause de son vin rosé", "À cause de ses couchers de soleil"], gt: "Nhà cửa ở Toulouse xây bằng gạch nung màu hồng cam." },
    ],
    thang: "Thắng nữa rồi! Bà Minette quay sang hỏi ta học tiếng Pháp ở đâu. Ta bảo: « Fracile, évidemment ! »",
    thua: "Bà Minette học thuộc sách thật! Ôn lại rồi mình phục thù nhé.",
  },
  {
    id: "alsace", muc: "vua", so: 6, dat: 4, co: "🎄",
    noi: "Alsace & Lorraine", ten: "Au cœur de l'Europe",
    mo: "Tập cuối hạng « Moyen », quay giữa chợ Giáng Sinh Strasbourg. Lần này phải đúng ít nhất 4 câu mới thắng được bà Minette!",
    cau: [
      { q: "Quelle institution européenne siège à Strasbourg ?", pa: ["Le Parlement européen", "La Banque centrale européenne", "La Commission européenne", "L'ONU"], gt: "Le Parlement européen họp ở Strasbourg. Ngân hàng Trung ương ở Frankfurt, Ủy ban ở Bruxelles." },
      { q: "Quel plat alsacien est fait avec du chou fermenté ?", pa: ["La choucroute", "La ratatouille", "La tartiflette", "La galette"], gt: "La choucroute: bắp cải muối chua ăn với xúc xích và thịt lợn." },
      { q: "En décembre, Strasbourg est célèbre pour…", pa: ["son marché de Noël", "son festival de cinéma", "son carnaval", "son tournoi de tennis"], gt: "Marché de Noël Strasbourg là một trong những chợ Giáng Sinh lâu đời nhất châu Âu (từ 1570)." },
      { q: "La quiche vient de quelle région ?", pa: ["La Lorraine", "La Bretagne", "La Provence", "La Corse"], gt: "« La quiche lorraine », bánh trứng kem với thịt xông khói, quê ở Lorraine." },
      { q: "Dans l'histoire, l'Alsace a souvent changé de pays. Avec quel voisin ?", pa: ["L'Allemagne", "L'Italie", "L'Espagne", "La Suisse"], gt: "Alsace nhiều lần đổi chủ giữa Pháp và Đức, nên tên làng và món ăn mang dấu ấn Đức." },
    ],
    thang: "Bốn câu trở lên! Hạng « Difficile » mở cửa: từ giờ là lịch sử, văn học, nước Pháp hôm nay. Bà Minette lần đầu tiên… vỗ tay.",
    thua: "Mức 4 câu khó thật đấy. Đọc kỹ lời giải, lần sau là của ta!",
  },

  /* ───────────── KHÓ (tiếng Pháp B1–B2) ───────────── */
  {
    id: "loire", muc: "kho", so: 7, dat: 3, co: "👑",
    noi: "Val de Loire", ten: "Châteaux et histoire",
    mo: "Hạng cao nhất! Trường quay đặt trong một lâu đài thời Phục Hưng. Bà Minette diện váy dạ hội. Câu hỏi bây giờ dài và khó, đọc kỹ từng chữ nhé trợ lý.",
    cau: [
      { q: "Quel château de la Loire est célèbre pour son escalier à double révolution, souvent attribué à l'influence de Léonard de Vinci ?", pa: ["Chambord", "Chenonceau", "Versailles", "Amboise"], gt: "Chambord: hai cầu thang xoắn lồng vào nhau, hai người đi lên xuống không bao giờ gặp nhau." },
      { q: "Où Léonard de Vinci a-t-il passé les dernières années de sa vie ?", pa: ["Au Clos Lucé, à Amboise", "À Florence", "Au Louvre", "À Chambord"], gt: "Theo lời mời của vua François Ier, Léonard sống ở Clos Lucé (Amboise) và mất ở đó năm 1519." },
      { q: "Pourquoi surnomme-t-on Chenonceau « le château des Dames » ?", pa: ["Parce que plusieurs femmes l'ont construit, embelli ou protégé", "Parce que seules les femmes pouvaient y entrer", "Parce que c'était une école de filles", "Parce qu'une reine l'a construit seule"], gt: "Nhiều phụ nữ nối tiếp nhau xây dựng, tô điểm và bảo vệ lâu đài qua các thế kỷ." },
      { q: "Quelle héroïne a libéré Orléans, assiégée par les Anglais, en 1429 ?", pa: ["Jeanne d'Arc", "Catherine de Médicis", "Marie-Antoinette", "Simone Veil"], gt: "Jeanne d'Arc giải vây Orléans năm 1429 trong Chiến tranh Trăm năm." },
      { q: "On présente souvent la Loire comme…", pa: ["le dernier grand fleuve sauvage de France", "le plus court fleuve de France", "le fleuve qui traverse Paris", "un fleuve entièrement canalisé"], gt: "Loire ít bị đắp đập, nắn dòng, nên thường được gọi là « dernier fleuve sauvage »." },
    ],
    thang: "Magnifique ! Bà Minette thì thầm: « Vous êtes un adversaire digne de moi. » Còn hai chặng nữa là chung kết!",
    thua: "Lịch sử Pháp dài thật. Đọc lời giải từng câu, lần sau ta sẽ nhớ.",
  },
  {
    id: "lettres", muc: "kho", so: 8, dat: 3, co: "📚",
    noi: "Quartier latin, Paris", ten: "Livres et République",
    mo: "Quay lại Paris, giữa khu Latinh đầy hiệu sách. Chủ đề: văn học và nền Cộng hòa. Bà Minette vừa đọc xong cả bộ « Les Misérables » trong một đêm. Hừm…",
    cau: [
      { q: "Qui a écrit « Les Misérables » ?", pa: ["Victor Hugo", "Émile Zola", "Molière", "Albert Camus"], gt: "Victor Hugo xuất bản « Les Misérables » năm 1862. Ông cũng viết « Notre-Dame de Paris »." },
      { q: "« Le Petit Prince » a été écrit par un aviateur. Lequel ?", pa: ["Antoine de Saint-Exupéry", "Jules Verne", "Marcel Proust", "Jean-Paul Sartre"], gt: "Saint-Exupéry, phi công và nhà văn, xuất bản « Le Petit Prince » năm 1943." },
      { q: "Quelle est la devise de la République française ?", pa: ["Liberté, Égalité, Fraternité", "Unité, Justice, Paix", "Honneur, Patrie, Valeur", "Paix, Travail, Progrès"], gt: "« Liberté, Égalité, Fraternité » khắc trên mặt tiền tòa thị chính và trường học khắp nước Pháp." },
      { q: "Que commémore-t-on le 14 juillet ?", pa: ["La prise de la Bastille, en 1789", "L'armistice de 1918", "La fin de la Seconde Guerre mondiale", "La naissance de Napoléon"], gt: "Ngày 14/7/1789 dân Paris chiếm ngục Bastille; năm sau là lễ Liên bang (fête de la Fédération)." },
      { q: "À Paris, le Panthéon accueille…", pa: ["les tombeaux de grandes personnalités de la nation", "le Parlement", "la Bibliothèque nationale", "la résidence du président"], gt: "« Aux grands hommes, la patrie reconnaissante »: Victor Hugo, Marie Curie, Simone Veil… yên nghỉ ở đây." },
    ],
    thang: "Đúng như một giáo sư văn học! Chung kết tuần sau, phát sóng trực tiếp. Bà Minette đang luyện thanh trong phòng chờ.",
    thua: "Văn học Pháp mênh mông lắm. Thử lại, lần này ta có kinh nghiệm rồi.",
  },
  {
    id: "finale", muc: "kho", so: 9, dat: 4, co: "🏆",
    noi: "Studio 1, Paris", ten: "La Grande Finale",
    mo: "CHUNG KẾT! Đèn sân khấu, khán giả cả nước, bà Minette với ba chiếc cúp vô địch. Chủ đề: nước Pháp hôm nay và thế giới nói tiếng Pháp. Cần ít nhất 4/5. Allez, trợ lý!",
    cau: [
      { q: "Dans combien de pays environ le français est-il langue officielle, seul ou avec d'autres langues ?", pa: ["Une trentaine", "Cinq", "Quatre-vingts", "Cent cinquante"], gt: "Khoảng 29 quốc gia dùng tiếng Pháp làm ngôn ngữ chính thức, từ Bỉ, Thụy Sĩ, Canada tới nhiều nước châu Phi." },
      { q: "Quelle institution, fondée en 1635, veille sur la langue française ?", pa: ["L'Académie française", "Le Sénat", "La Sorbonne", "L'UNESCO"], gt: "L'Académie française, do Richelieu lập năm 1635, soạn từ điển chính thức. Thành viên được gọi là « les Immortels »." },
      { q: "En France, le baccalauréat, c'est…", pa: ["l'examen de fin de lycée", "un diplôme de master", "un concours de cuisine", "le permis de conduire"], gt: "« Le bac » là kỳ thi cuối cấp ba, mở cửa vào đại học." },
      { q: "Dans l'expression « avoir le cafard », le mot « cafard » veut dire…", pa: ["la tristesse, le moral bas", "une très grande faim", "une colère soudaine", "la fatigue après le sport"], gt: "« Cafard » nghĩa đen là con gián, nhưng « avoir le cafard » là buồn, chán nản." },
      { q: "Depuis la réforme de 2016, combien de régions compte la France métropolitaine ?", pa: ["13", "22", "27", "101"], gt: "Từ 2016: 13 vùng ở chính quốc (22 vùng trước đó). 101 là số tỉnh (départements) tính cả hải ngoại." },
    ],
    thang: "LÉON VÔ ĐỊCH « LE GRAND QUIZ DE FRANCE » ! Pháo giấy tung bay, bà Minette trao cúp và… mời ta uống trà tuần sau. Trợ lý ơi, chiến thắng này là của cả hai ta!",
    thua: "Chỉ thiếu chút xíu! Bà Minette giữ cúp thêm một mùa. Nhưng chung kết luôn chờ người dám quay lại.",
  },
];
