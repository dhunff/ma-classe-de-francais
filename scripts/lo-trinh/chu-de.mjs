/* Dữ liệu Lộ trình theo CHỦ ĐỀ XÃ HỘI (06/10) — 16 chủ đề, 100 màn, 8 mục/màn.
 *
 * Mỗi mục: "tiếng Pháp | nghĩa tiếng Việt | loại".
 *   n = danh từ (luôn kèm mạo từ), v = động từ nguyên thể, a = tính từ,
 *   x = cụm từ / thành ngữ, d = trạng từ.
 * LOẠI dùng để chọn phương án nhiễu CÙNG LOẠI (troChoiThe.js): đáp án đúng
 * không được lộ ra chỉ vì nó là động từ giữa ba danh từ.
 *
 * Quy tắc soạn: không dùng dấu gạch dài (CLAUDE.md, quy tắc 7); danh từ luôn
 * có mạo từ; nghĩa tiếng Việt ngắn, đúng nghĩa trong NGỮ CẢNH chủ đề.
 * Độ khó tăng dần trong mỗi chủ đề: A2 → B1 → B2. */

const m = (ten, cap, khoi) => ({ ten, cap, tu: khoi.trim().split(";").map((d) => d.trim()).filter(Boolean).map((d) => { const [fr, vi, loai] = d.split("|").map((x) => x.trim()); return { fr, vi, loai }; }) });

export const CHU_DE = [
  { id: "moi-truong", fr: "L'environnement et le climat", vi: "Môi trường và khí hậu", mau: "#16A34A", man: [
    m("La nature", "A2", "la forêt|rừng|n; la mer|biển|n; la montagne|núi|n; le fleuve|sông lớn|n; l'arbre|cây|n; la plage|bãi biển|n; le ciel|bầu trời|n; l'île|hòn đảo|n"),
    m("Le temps qu'il fait", "A2", "la pluie|mưa|n; la neige|tuyết|n; le vent|gió|n; le nuage|đám mây|n; l'orage|cơn giông|n; la chaleur|cái nóng|n; il fait froid|trời lạnh|x; il fait beau|trời đẹp|x"),
    m("Les gestes écologiques", "B1", "trier les déchets|phân loại rác|x; recycler|tái chế|v; jeter|vứt bỏ|v; économiser l'eau|tiết kiệm nước|x; éteindre la lumière|tắt đèn|x; le compost|phân ủ hữu cơ|n; la poubelle|thùng rác|n; réutiliser|tái sử dụng|v"),
    m("La pollution", "B1", "la pollution|sự ô nhiễm|n; les déchets|rác thải|n; polluer|gây ô nhiễm|v; la fumée|khói|n; l'air|không khí|n; sale|bẩn|a; propre|sạch|a; le plastique|nhựa|n"),
    m("Le climat change", "B1", "le réchauffement|sự nóng lên|n; la sécheresse|hạn hán|n; l'inondation|lũ lụt|n; la canicule|đợt nắng nóng|n; la tempête|cơn bão|n; fondre|tan chảy|v; augmenter|tăng lên|v; la température|nhiệt độ|n"),
    m("Agir pour le climat", "B2", "les émissions|lượng khí thải|n; le gaz à effet de serre|khí nhà kính|n; réduire|cắt giảm|v; l'empreinte carbone|dấu chân carbon|n; la transition|sự chuyển đổi|n; durable|bền vững|a; menacé|bị đe doạ|a; s'adapter|thích nghi|v"),
    m("La biodiversité", "B2", "la biodiversité|đa dạng sinh học|n; l'espèce|loài|n; disparaître|biến mất|v; protéger|bảo vệ|v; l'écosystème|hệ sinh thái|n; la déforestation|nạn phá rừng|n; la faune|hệ động vật|n; la flore|hệ thực vật|n"),
  ] },
  { id: "nang-luong", fr: "L'énergie et la consommation durable", vi: "Năng lượng và tiêu dùng bền vững", mau: "#CA8A04", man: [
    m("À la maison", "A2", "l'électricité|điện|n; le chauffage|hệ thống sưởi|n; la lampe|cái đèn|n; la facture|hoá đơn|n; allumer|bật|v; éteindre|tắt|v; le frigo|tủ lạnh|n; la prise|ổ cắm điện|n"),
    m("Se déplacer proprement", "A2", "le vélo|xe đạp|n; à pied|đi bộ|x; le train|tàu hoả|n; le bus|xe buýt|n; la voiture électrique|ô tô điện|n; le covoiturage|đi chung xe|n; la trottinette|xe trượt|n; le métro|tàu điện ngầm|n"),
    m("Les énergies", "B1", "le soleil|mặt trời|n; l'énergie solaire|năng lượng mặt trời|n; l'éolienne|tua-bin gió|n; le charbon|than đá|n; le pétrole|dầu mỏ|n; le gaz|khí đốt|n; renouvelable|tái tạo được|a; nucléaire|hạt nhân|a"),
    m("Consommer mieux", "B1", "acheter local|mua hàng địa phương|x; de saison|theo mùa|x; le gaspillage|sự lãng phí|n; gaspiller|lãng phí|v; le vrac|hàng bán cân|n; l'emballage|bao bì|n; réparer|sửa chữa|v; d'occasion|hàng đã qua sử dụng|x"),
    m("Économiser", "B1", "la consommation|mức tiêu thụ|n; consommer|tiêu thụ|v; économiser|tiết kiệm|v; isoler|cách nhiệt|v; la douche|vòi sen|n; le bain|bồn tắm|n; la veille|chế độ chờ|n; débrancher|rút phích cắm|v"),
    m("La sobriété", "B2", "la sobriété|sự tiết chế|n; la pénurie|sự khan hiếm|n; la ressource|tài nguyên|n; épuiser|làm cạn kiệt|v; produire|sản xuất|v; l'autonomie|sự tự chủ|n; coûteux|tốn kém|a; rentable|có lãi|a"),
    m("Le débat sur l'énergie", "B2", "la centrale|nhà máy điện|n; le réseau|mạng lưới điện|n; la facture énergétique|hoá đơn năng lượng|n; subventionner|trợ cấp|v; investir|đầu tư|v; la dépendance|sự phụ thuộc|n; propre|sạch|a; polluant|gây ô nhiễm|a"),
  ] },
  { id: "binh-dang-gioi", fr: "L'égalité femmes-hommes", vi: "Bình đẳng giới", mau: "#DB2777", man: [
    m("Les personnes", "A2", "la femme|người phụ nữ|n; l'homme|người đàn ông|n; la fille|cô gái|n; le garçon|cậu con trai|n; la mère|người mẹ|n; le père|người bố|n; la sœur|chị/em gái|n; le frère|anh/em trai|n"),
    m("Les métiers", "A2", "l'infirmière|nữ y tá|n; le pompier|lính cứu hoả|n; l'ingénieure|nữ kỹ sư|n; le médecin|bác sĩ|n; la cheffe|nữ quản lý|n; l'avocat|luật sư|n; la directrice|nữ giám đốc|n; le pilote|phi công|n"),
    m("À la maison", "B1", "les tâches ménagères|việc nhà|n; faire la vaisselle|rửa bát|x; faire le ménage|dọn dẹp nhà|x; s'occuper des enfants|chăm con|x; partager|chia sẻ|v; aider|giúp đỡ|v; la répartition|sự phân chia|n; le congé parental|nghỉ phép nuôi con|n"),
    m("Au travail", "B1", "le salaire|tiền lương|n; l'égalité|sự bình đẳng|n; l'inégalité|sự bất bình đẳng|n; le poste|vị trí công việc|n; embaucher|tuyển dụng|v; promouvoir|thăng chức|v; la promotion|sự thăng chức|n; l'écart|khoảng cách|n"),
    m("Les droits", "B1", "le droit de vote|quyền bầu cử|n; la liberté|tự do|n; le respect|sự tôn trọng|n; respecter|tôn trọng|v; la loi|luật|n; voter|bỏ phiếu|v; juste|công bằng|a; injuste|bất công|a"),
    m("Les discriminations", "B2", "la discrimination|sự phân biệt đối xử|n; le stéréotype|khuôn mẫu định kiến|n; le harcèlement|sự quấy rối|n; dénoncer|tố cáo|v; lutter contre|đấu tranh chống|x; le préjugé|thành kiến|n; sexiste|phân biệt giới tính|a; inégal|không đồng đều|a"),
    m("Le féminisme", "B2", "le féminisme|chủ nghĩa nữ quyền|n; la parité|sự cân bằng giới|n; revendiquer|đòi hỏi|v; l'émancipation|sự giải phóng|n; le plafond de verre|trần kính|n; la mixité|sự pha trộn giới|n; militant|mang tính đấu tranh|a; paritaire|cân bằng nam nữ|a"),
  ] },
  { id: "cong-nghe-so", fr: "Le numérique et l'intelligence artificielle", vi: "Công nghệ số và trí tuệ nhân tạo", mau: "#2563EB", man: [
    m("L'ordinateur", "A2", "l'écran|màn hình|n; le clavier|bàn phím|n; la souris|chuột máy tính|n; le fichier|tệp|n; cliquer|nhấp chuột|v; télécharger|tải xuống|v; imprimer|in|v; le mot de passe|mật khẩu|n"),
    m("Internet", "A2", "le site|trang web|n; le courriel|thư điện tử|n; envoyer|gửi|v; recevoir|nhận|v; la connexion|kết nối|n; en ligne|trực tuyến|x; chercher|tìm kiếm|v; le lien|đường liên kết|n"),
    m("Le téléphone", "B1", "l'application|ứng dụng|n; la batterie|pin|n; recharger|sạc lại|v; le message|tin nhắn|n; l'appel|cuộc gọi|n; la notification|thông báo|n; installer|cài đặt|v; mettre à jour|cập nhật|x"),
    m("Les données", "B1", "les données|dữ liệu|n; la vie privée|đời tư|n; protéger|bảo vệ|v; le compte|tài khoản|n; se connecter|đăng nhập|v; supprimer|xoá|v; sauvegarder|lưu|v; le piratage|vụ tin tặc|n"),
    m("L'intelligence artificielle", "B2", "l'intelligence artificielle|trí tuệ nhân tạo|n; l'algorithme|thuật toán|n; automatiser|tự động hoá|v; le robot|rô-bốt|n; remplacer|thay thế|v; générer|tạo ra|v; fiable|đáng tin cậy|a; l'outil|công cụ|n"),
    m("Les enjeux du numérique", "B2", "la fracture numérique|khoảng cách số|n; la cybersécurité|an ninh mạng|n; l'éthique|đạo đức|n; surveiller|giám sát|v; la dépendance|sự lệ thuộc|n; réglementer|điều tiết|v; anonyme|ẩn danh|a; numérique|kỹ thuật số|a"),
  ] },
  { id: "mang-xa-hoi", fr: "Les réseaux sociaux et l'information", vi: "Mạng xã hội và tin giả", mau: "#7C3AED", man: [
    m("Sur les réseaux", "A2", "la photo|bức ảnh|n; la vidéo|đoạn video|n; publier|đăng|v; partager|chia sẻ|v; aimer|thích|v; commenter|bình luận|v; l'ami|người bạn|n; le profil|trang cá nhân|n"),
    m("Les écrans", "A2", "l'écran|màn hình|n; le temps d'écran|thời gian dùng màn hình|n; regarder|xem|v; jouer|chơi|v; le jeu vidéo|trò chơi điện tử|n; la tablette|máy tính bảng|n; la série|phim bộ|n; la nuit|ban đêm|n"),
    m("La vie en ligne", "B1", "l'abonné|người theo dõi|n; s'abonner|đăng ký theo dõi|v; la story|tin 24 giờ|n; l'influenceur|người có ảnh hưởng|n; populaire|nổi tiếng|a; viral|lan truyền mạnh|a; le pseudo|biệt danh|n; bloquer|chặn|v"),
    m("Les risques", "B1", "le cyberharcèlement|bắt nạt trên mạng|n; l'arnaque|trò lừa đảo|n; la dépendance|sự nghiện|n; signaler|báo cáo|v; se méfier|cảnh giác|v; dangereux|nguy hiểm|a; isolé|bị cô lập|a; anxieux|lo âu|a"),
    m("Les fausses informations", "B2", "la fausse information|tin giả|n; la rumeur|tin đồn|n; la source|nguồn tin|n; vérifier|kiểm chứng|v; manipuler|thao túng|v; douteux|đáng ngờ|a; crédible|đáng tin|a; le complot|âm mưu|n"),
    m("L'esprit critique", "B2", "l'esprit critique|tư duy phản biện|n; le biais|thiên kiến|n; la bulle de filtres|bong bóng lọc|n; démentir|bác bỏ|v; relayer|chuyển tiếp|v; objectif|khách quan|a; trompeur|gây hiểu lầm|a; la désinformation|thông tin sai lệch|n"),
  ] },
  { id: "viec-lam", fr: "Le travail et le télétravail", vi: "Việc làm và làm việc từ xa", mau: "#0891B2", man: [
    m("Au bureau", "A2", "le travail|công việc|n; le bureau|văn phòng|n; le collègue|đồng nghiệp|n; le patron|ông chủ|n; travailler|làm việc|v; l'horaire|giờ làm việc|n; la réunion|cuộc họp|n; la pause|giờ nghỉ|n"),
    m("Chercher un emploi", "A2", "le CV|sơ yếu lý lịch|n; l'offre d'emploi|tin tuyển dụng|n; l'entretien|buổi phỏng vấn|n; postuler|nộp đơn|v; le stage|kỳ thực tập|n; le contrat|hợp đồng|n; le chômage|tình trạng thất nghiệp|n; embaucher|tuyển|v"),
    m("Le télétravail", "B1", "le télétravail|làm việc từ xa|n; à domicile|tại nhà|x; la visioconférence|họp trực tuyến|n; se déplacer|đi lại|v; flexible|linh hoạt|a; isolé|bị cô lập|a; l'équilibre|sự cân bằng|n; l'ordinateur portable|máy tính xách tay|n"),
    m("Les conditions de travail", "B1", "le salaire|tiền lương|n; les congés|ngày nghỉ phép|n; la retraite|sự nghỉ hưu|n; démissionner|xin nghỉ việc|v; licencier|sa thải|v; à temps partiel|bán thời gian|x; à temps plein|toàn thời gian|x; le syndicat|công đoàn|n"),
    m("Le monde du travail", "B2", "la productivité|năng suất|n; le recrutement|sự tuyển dụng|n; la reconversion|sự chuyển nghề|n; l'épuisement|sự kiệt sức|n; négocier|đàm phán|v; se former|tự đào tạo|v; précaire|bấp bênh|a; qualifié|có tay nghề|a"),
    m("L'avenir du travail", "B2", "la semaine de quatre jours|tuần làm bốn ngày|n; l'automatisation|sự tự động hoá|n; le travailleur indépendant|người làm tự do|n; la flexibilité|sự linh hoạt|n; délocaliser|chuyển ra nước ngoài|v; recruter|tuyển dụng|v; pénible|vất vả|a; épanouissant|giúp phát triển bản thân|a"),
  ] },
  { id: "nhap-cu", fr: "La migration et l'intégration", vi: "Nhập cư và hội nhập", mau: "#EA580C", man: [
    m("Voyager et s'installer", "A2", "le pays|đất nước|n; la frontière|biên giới|n; le passeport|hộ chiếu|n; le visa|thị thực|n; étranger|nước ngoài|a; habiter|sinh sống|v; déménager|chuyển nhà|v; la nationalité|quốc tịch|n"),
    m("Les langues", "A2", "la langue|ngôn ngữ|n; apprendre|học|v; parler|nói|v; comprendre|hiểu|v; traduire|dịch|v; l'accent|giọng nói|n; le dictionnaire|từ điển|n; bilingue|song ngữ|a"),
    m("Les démarches", "B1", "le titre de séjour|thẻ cư trú|n; la préfecture|sở hành chính tỉnh|n; le formulaire|mẫu đơn|n; remplir|điền|v; le rendez-vous|cuộc hẹn|n; le justificatif|giấy tờ chứng minh|n; renouveler|gia hạn|v; administratif|hành chính|a"),
    m("S'intégrer", "B1", "s'intégrer|hội nhập|v; la culture|văn hoá|n; la tradition|truyền thống|n; le voisin|hàng xóm|n; accueillir|đón tiếp|v; l'association|hội đoàn|n; s'habituer|quen dần|v; le mal du pays|nỗi nhớ quê|n"),
    m("Les migrations", "B2", "le migrant|người di cư|n; le réfugié|người tị nạn|n; l'exil|sự lưu vong|n; fuir|chạy trốn|v; la persécution|sự đàn áp|n; le droit d'asile|quyền tị nạn|n; clandestin|bất hợp pháp|a; humanitaire|nhân đạo|a"),
    m("Une société multiculturelle", "B2", "la diversité|sự đa dạng|n; le racisme|nạn phân biệt chủng tộc|n; la xénophobie|sự bài ngoại|n; la tolérance|lòng khoan dung|n; enrichir|làm phong phú|v; exclure|loại trừ|v; multiculturel|đa văn hoá|a; la naturalisation|sự nhập quốc tịch|n"),
  ] },
  { id: "suc-khoe", fr: "La santé, le sport et l'alimentation", vi: "Sức khoẻ, thể thao và ăn uống", mau: "#DC2626", man: [
    m("Le corps", "A2", "la tête|cái đầu|n; le bras|cánh tay|n; la jambe|cẳng chân|n; le dos|cái lưng|n; le ventre|cái bụng|n; la main|bàn tay|n; le pied|bàn chân|n; le cœur|trái tim|n"),
    m("Chez le médecin", "A2", "malade|bị ốm|a; la fièvre|cơn sốt|n; tousser|ho|v; le médicament|thuốc|n; l'ordonnance|đơn thuốc|n; la pharmacie|hiệu thuốc|n; avoir mal|bị đau|x; guérir|khỏi bệnh|v"),
    m("Le sport", "A2", "courir|chạy|v; nager|bơi|v; le match|trận đấu|n; l'équipe|đội|n; s'entraîner|tập luyện|v; la salle de sport|phòng tập|n; le ballon|quả bóng|n; gagner|thắng|v"),
    m("Bien manger", "B1", "les légumes|rau củ|n; les fruits|trái cây|n; le sucre|đường|n; le sel|muối|n; gras|nhiều mỡ|a; équilibré|cân bằng|a; le repas|bữa ăn|n; grignoter|ăn vặt|v"),
    m("Une vie saine", "B1", "le sommeil|giấc ngủ|n; le stress|căng thẳng|n; se reposer|nghỉ ngơi|v; bouger|vận động|v; sédentaire|ít vận động|a; la santé|sức khoẻ|n; en forme|khoẻ khoắn|x; l'habitude|thói quen|n"),
    m("La santé publique", "B2", "la prévention|sự phòng ngừa|n; le vaccin|vắc-xin|n; l'obésité|bệnh béo phì|n; la maladie chronique|bệnh mãn tính|n; rembourser|hoàn tiền|v; la sécurité sociale|bảo hiểm xã hội|n; nocif|có hại|a; bénéfique|có lợi|a"),
    m("Le bien-être", "B2", "le bien-être|sự an lạc|n; la méditation|thiền|n; l'épuisement professionnel|kiệt sức vì công việc|n; se détendre|thư giãn|v; prévenir|phòng ngừa|v; mental|tinh thần|a; physique|thể chất|a; l'équilibre de vie|cân bằng cuộc sống|n"),
  ] },
  { id: "giao-duc", fr: "L'éducation", vi: "Giáo dục", mau: "#4F46E5", man: [
    m("À l'école", "A2", "le professeur|giáo viên|n; l'élève|học sinh|n; la classe|lớp học|n; le cahier|quyển vở|n; le stylo|cây bút|n; le cours|tiết học|n; la récréation|giờ ra chơi|n; le cartable|cặp sách|n"),
    m("Les matières", "A2", "les mathématiques|môn toán|n; l'histoire|môn lịch sử|n; la géographie|môn địa lý|n; l'anglais|tiếng Anh|n; la physique|môn vật lý|n; le dessin|môn vẽ|n; la musique|môn âm nhạc|n; la biologie|môn sinh học|n"),
    m("Étudier", "B1", "réviser|ôn bài|v; l'examen|kỳ thi|n; la note|điểm số|n; réussir|thi đỗ|v; échouer|thi trượt|v; le diplôme|bằng cấp|n; les devoirs|bài tập về nhà|n; redoubler|học lại lớp|v"),
    m("L'université", "B1", "l'université|trường đại học|n; l'étudiant|sinh viên|n; la bourse|học bổng|n; la licence|bằng cử nhân|n; le master|bằng thạc sĩ|n; s'inscrire|ghi danh|v; l'amphithéâtre|giảng đường|n; les frais d'inscription|học phí|n"),
    m("Le système éducatif", "B2", "l'enseignement|sự giảng dạy|n; la scolarité|việc học hành|n; obligatoire|bắt buộc|a; gratuit|miễn phí|a; l'échec scolaire|thất bại học đường|n; le décrochage|sự bỏ học|n; orienter|định hướng|v; évaluer|đánh giá|v"),
    m("Apprendre autrement", "B2", "l'apprentissage|sự học tập|n; la formation continue|đào tạo liên tục|n; l'autonomie|tính tự chủ|n; la pédagogie|phương pháp sư phạm|n; motiver|tạo động lực|v; mémoriser|ghi nhớ|v; à distance|từ xa|x; ludique|mang tính trò chơi|a"),
  ] },
  { id: "gia-dinh", fr: "La famille et les générations", vi: "Gia đình và các thế hệ", mau: "#B45309", man: [
    m("La famille", "A2", "les parents|bố mẹ|n; l'enfant|đứa trẻ|n; les grands-parents|ông bà|n; l'oncle|chú, bác|n; la tante|cô, dì|n; le cousin|anh em họ|n; le mari|người chồng|n; l'épouse|người vợ|n"),
    m("Les étapes de la vie", "A2", "naître|được sinh ra|v; grandir|lớn lên|v; se marier|kết hôn|v; vieillir|già đi|v; le bébé|em bé|n; l'adolescent|thiếu niên|n; l'adulte|người lớn|n; la personne âgée|người cao tuổi|n"),
    m("La vie de famille", "B1", "le repas de famille|bữa cơm gia đình|n; s'entendre|hoà thuận|v; se disputer|cãi nhau|v; l'éducation|sự dạy dỗ con|n; élever|nuôi dạy|v; le divorce|việc ly hôn|n; la famille recomposée|gia đình tái hôn|n; monoparental|đơn thân|a"),
    m("Les générations", "B1", "la génération|thế hệ|n; transmettre|truyền lại|v; le souvenir|kỷ niệm|n; la retraite|sự nghỉ hưu|n; la maison de retraite|viện dưỡng lão|n; rendre visite|đến thăm|x; le petit-enfant|đứa cháu|n; âgé|lớn tuổi|a"),
    m("Entre les générations", "B2", "le conflit de générations|xung đột thế hệ|n; la solidarité|tình đoàn kết|n; le fossé|hố ngăn cách|n; cohabiter|sống chung|v; dépendant|phụ thuộc|a; autonome|tự lập|a; le vieillissement|sự già hoá|n; prendre soin de|chăm sóc|x"),
    m("La famille change", "B2", "la natalité|tỷ lệ sinh|n; le mariage|hôn nhân|n; l'union libre|sống chung không cưới|n; la parentalité|việc làm cha mẹ|n; l'adoption|việc nhận con nuôi|n; adopter|nhận con nuôi|v; traditionnel|truyền thống|a; nombreux|đông đúc|a"),
  ] },
  { id: "do-thi", fr: "La ville, les transports et le logement", vi: "Đô thị, giao thông và nhà ở", mau: "#475569", man: [
    m("En ville", "A2", "la rue|đường phố|n; la place|quảng trường|n; le pont|cây cầu|n; le parc|công viên|n; la mairie|toà thị chính|n; le quartier|khu phố|n; le carrefour|ngã tư|n; le trottoir|vỉa hè|n"),
    m("Se déplacer", "A2", "le ticket|tấm vé|n; l'arrêt|điểm dừng xe|n; la gare|ga tàu|n; prendre le bus|đi xe buýt|x; descendre|xuống xe|v; monter|lên xe|v; le retard|sự chậm trễ|n; l'horaire|giờ chạy|n"),
    m("Le logement", "A2", "l'appartement|căn hộ|n; la maison|ngôi nhà|n; le loyer|tiền thuê nhà|n; louer|thuê|v; la chambre|phòng ngủ|n; la cuisine|nhà bếp|n; le propriétaire|chủ nhà|n; le locataire|người thuê nhà|n"),
    m("La vie urbaine", "B1", "les embouteillages|tắc đường|n; le bruit|tiếng ồn|n; bruyant|ồn ào|a; calme|yên tĩnh|a; animé|nhộn nhịp|a; la banlieue|ngoại ô|n; le centre-ville|trung tâm thành phố|n; se garer|đỗ xe|v"),
    m("L'urbanisme", "B2", "l'urbanisme|quy hoạch đô thị|n; la piste cyclable|làn xe đạp|n; la zone piétonne|phố đi bộ|n; aménager|quy hoạch|v; rénover|cải tạo|v; l'espace vert|không gian xanh|n; dense|dày đặc|a; accessible|dễ tiếp cận|a"),
    m("La crise du logement", "B2", "la crise du logement|khủng hoảng nhà ở|n; le logement social|nhà ở xã hội|n; le sans-abri|người vô gia cư|n; expulser|trục xuất|v; spéculer|đầu cơ|v; la colocation|ở ghép|n; insalubre|mất vệ sinh|a; abordable|giá phải chăng|a"),
  ] },
  { id: "du-lich", fr: "Le tourisme et la culture", vi: "Du lịch và văn hoá", mau: "#0D9488", man: [
    m("Les vacances", "A2", "la valise|vali|n; l'hôtel|khách sạn|n; la réservation|việc đặt chỗ|n; le billet|tấm vé|n; partir|khởi hành|v; visiter|tham quan|v; le touriste|khách du lịch|n; le souvenir|quà lưu niệm|n"),
    m("Visiter une ville", "A2", "le musée|bảo tàng|n; le château|lâu đài|n; l'église|nhà thờ|n; le monument|công trình kỷ niệm|n; le guide|hướng dẫn viên|n; la visite guidée|chuyến tham quan có hướng dẫn|n; le plan|bản đồ|n; l'entrée|vé vào cửa|n"),
    m("La culture", "B1", "le spectacle|buổi biểu diễn|n; le concert|buổi hoà nhạc|n; l'exposition|cuộc triển lãm|n; le théâtre|nhà hát|n; le festival|lễ hội|n; l'artiste|nghệ sĩ|n; applaudir|vỗ tay|v; le patrimoine|di sản|n"),
    m("Voyager autrement", "B1", "le sac à dos|ba lô|n; l'auberge de jeunesse|nhà nghỉ thanh niên|n; chez l'habitant|ở nhà dân|x; le séjour|chuyến lưu trú|n; découvrir|khám phá|v; l'itinéraire|lộ trình|n; dépaysant|lạ lẫm thú vị|a; authentique|chân thực|a"),
    m("Le tourisme de masse", "B2", "le surtourisme|du lịch quá tải|n; la fréquentation|lượng khách|n; saturé|quá tải|a; dégrader|làm xuống cấp|v; le quota|hạn ngạch|n; la haute saison|mùa cao điểm|n; la basse saison|mùa thấp điểm|n; réglementer|điều tiết|v"),
    m("Le tourisme responsable", "B2", "le tourisme durable|du lịch bền vững|n; l'écotourisme|du lịch sinh thái|n; préserver|gìn giữ|v; respectueux|biết tôn trọng|a; la retombée économique|lợi ích kinh tế|n; la communauté locale|cộng đồng địa phương|n; l'empreinte|dấu vết|n; voyager|du lịch|v"),
  ] },
  { id: "tieu-dung", fr: "La consommation et la publicité", vi: "Tiêu dùng và quảng cáo", mau: "#9333EA", man: [
    m("Faire les courses", "A2", "le magasin|cửa hàng|n; le supermarché|siêu thị|n; le prix|giá tiền|n; payer|trả tiền|v; la caisse|quầy thu ngân|n; cher|đắt|a; bon marché|rẻ|x; le panier|giỏ hàng|n"),
    m("Les vêtements", "A2", "la chemise|áo sơ mi|n; le pantalon|quần dài|n; la robe|váy liền|n; les chaussures|đôi giày|n; la taille|cỡ|n; essayer|mặc thử|v; la couleur|màu sắc|n; le manteau|áo khoác|n"),
    m("Acheter en ligne", "B1", "commander|đặt hàng|v; livrer|giao hàng|v; la livraison|việc giao hàng|n; le colis|bưu kiện|n; rembourser|hoàn tiền|v; le retour|việc trả hàng|n; l'avis|lời đánh giá|n; la carte bancaire|thẻ ngân hàng|n"),
    m("Les soldes", "B1", "les soldes|đợt giảm giá|n; la promotion|khuyến mãi|n; la réduction|sự giảm giá|n; gratuit|miễn phí|a; une bonne affaire|món hời|x; dépenser|tiêu tiền|v; le reçu|biên lai|n; le budget|ngân sách|n"),
    m("La publicité", "B2", "la publicité|quảng cáo|n; la marque|thương hiệu|n; le slogan|khẩu hiệu|n; cibler|nhắm tới|v; inciter|thúc giục|v; le consommateur|người tiêu dùng|n; mensonger|sai sự thật|a; persuasif|có sức thuyết phục|a"),
    m("La société de consommation", "B2", "la surconsommation|tiêu dùng quá mức|n; l'achat compulsif|mua sắm bốc đồng|n; l'obsolescence programmée|lỗi thời có chủ đích|n; le pouvoir d'achat|sức mua|n; s'endetter|mắc nợ|v; superflu|thừa thãi|a; éphémère|ngắn ngủi|a; la décroissance|sự giảm tăng trưởng|n"),
  ] },
  { id: "cong-dong", fr: "Le bénévolat et la vie collective", vi: "Tình nguyện và cộng đồng", mau: "#059669", man: [
    m("Aider les autres", "A2", "aider|giúp đỡ|v; donner|cho|v; le voisin|người hàng xóm|n; gentil|tốt bụng|a; le cadeau|món quà|n; merci|cảm ơn|x; ensemble|cùng nhau|x; prêter|cho mượn|v"),
    m("Les associations", "A2", "l'association|hội|n; le membre|thành viên|n; la réunion|buổi họp|n; participer|tham gia|v; organiser|tổ chức|v; la fête|bữa tiệc|n; le club|câu lạc bộ|n; inscrit|đã đăng ký|a"),
    m("Le bénévolat", "B1", "le bénévole|tình nguyện viên|n; le bénévolat|công việc tình nguyện|n; s'engager|dấn thân|v; la collecte|đợt quyên góp|n; la distribution|việc phát chia|n; les sans-abri|người vô gia cư|n; solidaire|đoàn kết|a; utile|có ích|a"),
    m("Vivre ensemble", "B1", "le lien social|gắn kết xã hội|n; la fête des voisins|ngày hội hàng xóm|n; rencontrer|gặp gỡ|v; la solitude|sự cô đơn|n; s'entraider|giúp đỡ nhau|v; isolé|cô lập|a; convivial|thân mật|a; le quartier|khu phố|n"),
    m("L'engagement citoyen", "B2", "la citoyenneté|quyền công dân|n; l'engagement|sự dấn thân|n; le service civique|nghĩa vụ công dân tự nguyện|n; militer|hoạt động đấu tranh|v; mobiliser|huy động|v; la cause|sự nghiệp|n; altruiste|vị tha|a; bénévole|tự nguyện|a"),
    m("La solidarité", "B2", "la précarité|sự bấp bênh|n; l'exclusion|sự loại trừ|n; la pauvreté|cảnh nghèo đói|n; le don|khoản quyên góp|n; financer|tài trợ|v; soutenir|ủng hộ|v; démuni|túng thiếu|a; généreux|hào phóng|a"),
  ] },
  { id: "truyen-thong", fr: "Les médias et la presse", vi: "Truyền thông và báo chí", mau: "#1D4ED8", man: [
    m("Les médias", "A2", "le journal|tờ báo|n; la radio|đài phát thanh|n; la télévision|truyền hình|n; le magazine|tạp chí|n; lire|đọc|v; écouter|nghe|v; l'article|bài báo|n; les informations|tin tức|n"),
    m("À la télévision", "A2", "la chaîne|kênh truyền hình|n; l'émission|chương trình|n; le présentateur|người dẫn chương trình|n; la météo|dự báo thời tiết|n; le documentaire|phim tài liệu|n; le direct|chương trình trực tiếp|n; regarder|xem|v; zapper|chuyển kênh|v"),
    m("Le journalisme", "B1", "le journaliste|nhà báo|n; l'interview|cuộc phỏng vấn|n; le reportage|phóng sự|n; enquêter|điều tra|v; le titre|tít báo|n; la une|trang nhất|n; rédiger|soạn thảo|v; l'actualité|thời sự|n"),
    m("S'informer", "B1", "s'informer|tìm hiểu tin tức|v; l'abonnement|việc đặt mua dài hạn|n; quotidien|hằng ngày|a; hebdomadaire|hằng tuần|a; mensuel|hằng tháng|a; en ligne|trên mạng|x; le lecteur|độc giả|n; l'auditeur|thính giả|n"),
    m("La liberté de la presse", "B2", "la liberté de la presse|tự do báo chí|n; la censure|sự kiểm duyệt|n; censurer|kiểm duyệt|v; l'indépendance|sự độc lập|n; la déontologie|đạo đức nghề nghiệp|n; impartial|vô tư|a; engagé|có lập trường|a; le scoop|tin độc quyền|n"),
    m("Les médias aujourd'hui", "B2", "l'audience|lượng khán giả|n; le sensationnalisme|lối giật gân|n; décrypter|giải mã|v; diffuser|phát sóng|v; la rédaction|toà soạn|n; fiable|đáng tin cậy|a; partial|thiên vị|a; le média|phương tiện truyền thông|n"),
  ] },
  { id: "nghien", fr: "Le tabac et les addictions", vi: "Thuốc lá và các chứng nghiện", mau: "#57534E", man: [
    m("Le tabac", "A2", "la cigarette|điếu thuốc|n; fumer|hút thuốc|v; le fumeur|người hút thuốc|n; interdit|bị cấm|a; le briquet|bật lửa|n; la fumée|khói|n; arrêter|dừng lại|v; le paquet|bao thuốc|n"),
    m("Le souffle", "A2", "tousser|ho|v; respirer|thở|v; les poumons|phổi|n; dangereux|nguy hiểm|a; la toux|cơn ho|n; fatigué|mệt mỏi|a; le souffle|hơi thở|n; mauvais|có hại|a"),
    m("Arrêter de fumer", "B1", "le patch|miếng dán|n; le sevrage|việc cai nghiện|n; l'envie|cơn thèm|n; résister|kháng cự|v; rechuter|tái nghiện|v; tenir bon|giữ vững|x; le tabacologue|chuyên gia cai thuốc lá|n; motivé|có động lực|a"),
    m("Les addictions", "B1", "l'alcool|rượu|n; la drogue|ma tuý|n; dépendant|lệ thuộc|a; l'addiction|chứng nghiện|n; boire|uống|v; consommer|sử dụng|v; l'excès|sự quá độ|n; nocif|có hại|a"),
    m("La prévention", "B2", "la prévention|sự phòng ngừa|n; sensibiliser|nâng cao nhận thức|v; la campagne|chiến dịch|n; le paquet neutre|bao thuốc trơn|n; la taxe|thuế|n; interdire|cấm|v; le vapotage|việc hút thuốc lá điện tử|n; mineur|vị thành niên|a"),
    m("Le débat sur les addictions", "B2", "la toxicomanie|chứng nghiện ma tuý|n; la réduction des risques|giảm thiểu tác hại|n; dépénaliser|bỏ hình sự hoá|v; le lobby|nhóm vận động hành lang|n; la santé mentale|sức khoẻ tâm thần|n; accro|nghiện|a; illicite|bất hợp pháp|a; légal|hợp pháp|a"),
  ] },
];
