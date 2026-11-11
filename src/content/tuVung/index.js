/* « Học từ vựng theo chủ đề » (10/11, theo chủ dự án): 10 chủ đề A1, mỗi chủ đề 10 từ CÓ HÌNH.
 *
 * Chỉ dữ liệu và hàm thuần (không JSX, không tr()), để `npm run check:tuvung` gọi thẳng bằng node.
 * Mỗi từ: tiếng Pháp KÈM MẠO TỪ, nghĩa tiếng Việt, tên hình, câu ví dụ + nghĩa, và giống (chỉ ghi
 * khi mạo từ là « l' », vì khi đó mạo từ không cho biết giống).
 *
 * HÌNH: `icon` là tên icon lucide-react (thư viện icon sẵn có của app; bảng tra ở
 * screens/student/hinhTuVung.jsx). Hình màu của Icons8 gắn sau qua HINH_ICONS8 (cũng ở file đó)
 * khi kết nối Icons8 được đăng nhập: id hình phải lấy từ công cụ tìm của Icons8, không tự đặt.
 *
 * Bài tập KHÔNG soạn tay: `taoBaiTap` sinh từ chính danh sách từ, nên thêm từ là có bài tập.
 * Quy tắc 7: không dùng dấu gạch dài trong nội dung học. Tiến độ lưu ở bảng bai_hoc_ket_qua
 * (migration 148) với mã « tv-… », chung đường ghi `ghi_bai_hoc` với Học ngữ pháp. */

const t = (fr, vi, icon, vdFr, vdVi, g) => ({ fr, vi, icon, vd: [vdFr, vdVi], ...(g ? { g } : {}) });

export const CHU_DE_TU_VUNG = [
  { ma: "tv-do-an", ten: "Thức ăn", tenFr: "La nourriture", cap: "A1", tu: [
    t("le croissant", "bánh sừng bò", "Croissant", "Je mange un croissant le matin.", "Buổi sáng tôi ăn một cái bánh sừng bò."),
    t("le lait", "sữa", "Milk", "Elle boit du lait chaud.", "Cô ấy uống sữa nóng."),
    t("l'œuf", "quả trứng", "Egg", "Il y a un œuf dans le frigo.", "Có một quả trứng trong tủ lạnh.", "m"),
    t("le poisson", "cá", "Fish", "Nous mangeons du poisson le vendredi.", "Chúng tôi ăn cá vào thứ Sáu."),
    t("la pizza", "bánh pizza", "Pizza", "On commande une pizza ce soir ?", "Tối nay mình gọi pizza nhé?"),
    t("le sandwich", "bánh mì kẹp", "Sandwich", "Je prends un sandwich à midi.", "Buổi trưa tôi ăn một cái bánh mì kẹp."),
    t("la glace", "kem", "IceCreamCone", "Les enfants adorent la glace.", "Trẻ con rất thích kem."),
    t("le gâteau", "bánh ngọt", "CakeSlice", "Ce gâteau est délicieux.", "Cái bánh này ngon tuyệt."),
    t("la viande", "thịt", "Beef", "Je ne mange pas de viande.", "Tôi không ăn thịt."),
    t("la soupe", "món súp", "Soup", "La soupe est très chaude.", "Món súp rất nóng."),
  ] },
  { ma: "tv-rau-qua-do-uong", ten: "Rau quả và đồ uống", tenFr: "Les fruits, les légumes et les boissons", cap: "A1", tu: [
    t("la pomme", "quả táo", "Apple", "Je mange une pomme chaque jour.", "Mỗi ngày tôi ăn một quả táo."),
    t("la banane", "quả chuối", "Banana", "La banane est jaune.", "Quả chuối màu vàng."),
    t("la cerise", "quả anh đào", "Cherry", "Les cerises sont rouges.", "Những quả anh đào màu đỏ."),
    t("le raisin", "nho", "Grape", "J'achète du raisin au marché.", "Tôi mua nho ở chợ."),
    t("le citron", "quả chanh", "Citrus", "Je mets du citron dans mon thé.", "Tôi cho chanh vào trà."),
    t("la carotte", "củ cà rốt", "Carrot", "Le lapin mange une carotte.", "Con thỏ ăn một củ cà rốt."),
    t("la salade", "rau xà lách", "Salad", "Je prépare une salade verte.", "Tôi làm một đĩa xà lách xanh."),
    t("le café", "cà phê", "Coffee", "Un café, s'il vous plaît.", "Cho tôi một ly cà phê."),
    t("l'eau", "nước", "GlassWater", "Je bois de l'eau.", "Tôi uống nước.", "f"),
    t("le vin", "rượu vang", "Wine", "Ce vin vient de Bordeaux.", "Rượu vang này đến từ Bordeaux."),
  ] },
  { ma: "tv-dong-vat", ten: "Động vật", tenFr: "Les animaux", cap: "A1", tu: [
    t("le chat", "con mèo", "Cat", "Mon chat dort sur le canapé.", "Con mèo của tôi ngủ trên ghế sofa."),
    t("le chien", "con chó", "Dog", "Le chien joue dans le jardin.", "Con chó chơi trong vườn."),
    t("l'oiseau", "con chim", "Bird", "L'oiseau chante le matin.", "Con chim hót vào buổi sáng.", "m"),
    t("le lapin", "con thỏ", "Rabbit", "Le lapin est très rapide.", "Con thỏ rất nhanh."),
    t("l'écureuil", "con sóc", "Squirrel", "Il y a un écureuil dans l'arbre.", "Có một con sóc trên cây.", "m"),
    t("la tortue", "con rùa", "Turtle", "La tortue marche lentement.", "Con rùa đi chậm."),
    t("l'escargot", "con ốc sên", "Snail", "L'escargot sort après la pluie.", "Ốc sên bò ra sau cơn mưa.", "m"),
    t("le rat", "con chuột cống", "Rat", "Le rat habite dans la ville.", "Con chuột cống sống trong thành phố."),
    t("l'insecte", "côn trùng", "Bug", "Cet insecte est tout petit.", "Con côn trùng này bé tí.", "m"),
    t("le panda", "gấu trúc", "Panda", "Le panda mange du bambou.", "Gấu trúc ăn tre."),
  ] },
  { ma: "tv-nha-cua", ten: "Nhà cửa", tenFr: "La maison", cap: "A1", tu: [
    t("le lit", "cái giường", "Bed", "Je fais mon lit le matin.", "Buổi sáng tôi dọn giường."),
    t("le canapé", "ghế sofa", "Sofa", "Nous regardons un film sur le canapé.", "Chúng tôi xem phim trên ghế sofa."),
    t("la lampe", "cái đèn", "Lamp", "J'allume la lampe.", "Tôi bật đèn."),
    t("la porte", "cái cửa", "DoorOpen", "Ferme la porte, s'il te plaît.", "Làm ơn đóng cửa lại."),
    t("la baignoire", "bồn tắm", "Bath", "La baignoire est dans la salle de bains.", "Bồn tắm ở trong phòng tắm."),
    t("la douche", "vòi sen", "ShowerHead", "Je prends une douche le soir.", "Buổi tối tôi tắm vòi sen."),
    t("le réfrigérateur", "tủ lạnh", "Refrigerator", "Le lait est dans le réfrigérateur.", "Sữa ở trong tủ lạnh."),
    t("la télévision", "ti vi", "Tv", "Ils regardent la télévision.", "Họ xem ti vi."),
    t("le fauteuil", "ghế bành", "Armchair", "Grand-père lit dans son fauteuil.", "Ông đọc sách trên ghế bành."),
    t("la clé", "chìa khoá", "Key", "J'ai perdu ma clé.", "Tôi làm mất chìa khoá rồi."),
  ] },
  { ma: "tv-giao-thong", ten: "Phương tiện đi lại", tenFr: "Les transports", cap: "A1", tu: [
    t("la voiture", "ô tô", "Car", "Ma voiture est petite.", "Ô tô của tôi nhỏ."),
    t("le bus", "xe buýt", "Bus", "Je prends le bus pour aller au travail.", "Tôi đi xe buýt đến chỗ làm."),
    t("le train", "tàu hoả", "TrainFront", "Le train part à huit heures.", "Tàu khởi hành lúc tám giờ."),
    t("l'avion", "máy bay", "Plane", "L'avion arrive à Paris.", "Máy bay đến Paris.", "m"),
    t("le vélo", "xe đạp", "Bike", "Elle va à l'école à vélo.", "Cô ấy đi học bằng xe đạp."),
    t("le bateau", "tàu thuỷ", "Ship", "Le bateau traverse la mer.", "Con tàu vượt biển."),
    t("le camion", "xe tải", "Truck", "Le camion transporte des fruits.", "Xe tải chở hoa quả."),
    t("le tramway", "tàu điện", "TramFront", "Le tramway passe devant la gare.", "Tàu điện chạy qua trước nhà ga."),
    t("la moto", "xe máy", "Motorbike", "Il va au travail à moto.", "Anh ấy đi làm bằng xe máy."),
    t("l'ambulance", "xe cứu thương", "Ambulance", "L'ambulance va à l'hôpital.", "Xe cứu thương đi đến bệnh viện.", "f"),
  ] },
  { ma: "tv-thoi-tiet", ten: "Thời tiết", tenFr: "La météo", cap: "A1", tu: [
    t("le soleil", "mặt trời", "Sun", "Le soleil brille aujourd'hui.", "Hôm nay mặt trời chiếu sáng."),
    t("le nuage", "đám mây", "Cloud", "Il y a un gros nuage gris.", "Có một đám mây xám to."),
    t("la pluie", "mưa", "CloudRain", "Je n'aime pas la pluie.", "Tôi không thích mưa."),
    t("la neige", "tuyết", "CloudSnow", "Les enfants jouent dans la neige.", "Trẻ con chơi trong tuyết."),
    t("le vent", "gió", "Wind", "Le vent est fort ce matin.", "Sáng nay gió mạnh."),
    t("l'orage", "cơn giông", "CloudLightning", "Il y a un orage ce soir.", "Tối nay có giông.", "m"),
    t("l'arc-en-ciel", "cầu vồng", "Rainbow", "Regarde, un arc-en-ciel !", "Nhìn kìa, cầu vồng!", "m"),
    t("le brouillard", "sương mù", "CloudFog", "Il y a du brouillard sur la route.", "Trên đường có sương mù."),
    t("la lune", "mặt trăng", "Moon", "La lune est belle cette nuit.", "Đêm nay trăng đẹp."),
    t("la température", "nhiệt độ", "Thermometer", "La température monte en été.", "Nhiệt độ tăng vào mùa hè."),
  ] },
  { ma: "tv-thanh-pho", ten: "Trong thành phố", tenFr: "En ville", cap: "A1", tu: [
    t("l'hôpital", "bệnh viện", "Hospital", "L'hôpital est près d'ici.", "Bệnh viện ở gần đây.", "m"),
    t("l'école", "trường học", "School", "Les enfants vont à l'école.", "Trẻ con đi học.", "f"),
    t("le magasin", "cửa hàng", "Store", "Le magasin ouvre à neuf heures.", "Cửa hàng mở lúc chín giờ."),
    t("l'église", "nhà thờ", "Church", "Cette église est très ancienne.", "Nhà thờ này rất cổ.", "f"),
    t("l'immeuble", "toà chung cư", "Building", "J'habite dans un immeuble.", "Tôi sống trong một toà chung cư.", "m"),
    t("l'hôtel", "khách sạn", "Hotel", "Nous dormons à l'hôtel.", "Chúng tôi ngủ ở khách sạn.", "m"),
    t("le château", "lâu đài", "Castle", "Nous visitons un château.", "Chúng tôi tham quan một lâu đài."),
    t("l'usine", "nhà máy", "Factory", "Mon père travaille dans une usine.", "Bố tôi làm việc trong một nhà máy.", "f"),
    t("la station-service", "trạm xăng", "Fuel", "La station-service est ouverte la nuit.", "Trạm xăng mở cửa ban đêm."),
    t("la bibliothèque", "thư viện", "Library", "J'étudie à la bibliothèque.", "Tôi học ở thư viện."),
  ] },
  { ma: "tv-truong-lop", ten: "Trường lớp", tenFr: "À l'école", cap: "A1", tu: [
    t("le livre", "quyển sách", "Book", "Ouvrez votre livre à la page dix.", "Các em mở sách trang mười."),
    t("le crayon", "bút chì", "Pencil", "J'écris avec un crayon.", "Tôi viết bằng bút chì."),
    t("la règle", "cái thước", "Ruler", "Prends ta règle pour tracer une ligne.", "Lấy thước ra để kẻ một đường."),
    t("la calculatrice", "máy tính bỏ túi", "Calculator", "J'utilise une calculatrice en maths.", "Tôi dùng máy tính trong giờ toán."),
    t("la gomme", "cục tẩy", "Eraser", "Tu as une gomme ?", "Bạn có cục tẩy không?"),
    t("le cahier", "quyển vở", "Notebook", "J'écris dans mon cahier.", "Tôi viết vào vở."),
    t("le stylo", "cái bút", "Pen", "Mon stylo est bleu.", "Bút của tôi màu xanh."),
    t("les ciseaux", "cái kéo", "Scissors", "Les ciseaux sont sur la table.", "Cái kéo ở trên bàn."),
    t("le sac à dos", "ba lô", "Backpack", "Mon sac à dos est lourd.", "Ba lô của tôi nặng."),
    t("le tableau", "cái bảng", "Presentation", "Le professeur écrit au tableau.", "Thầy giáo viết lên bảng."),
  ] },
  { ma: "tv-so-thich", ten: "Sở thích", tenFr: "Les loisirs", cap: "A1", tu: [
    t("la musique", "âm nhạc", "Music", "J'écoute de la musique.", "Tôi nghe nhạc."),
    t("la guitare", "đàn ghi-ta", "Guitar", "Il joue de la guitare.", "Anh ấy chơi đàn ghi-ta."),
    t("l'appareil photo", "máy ảnh", "Camera", "J'ai un nouvel appareil photo.", "Tôi có một cái máy ảnh mới.", "m"),
    t("le jeu vidéo", "trò chơi điện tử", "Gamepad2", "Mon frère adore ce jeu vidéo.", "Em trai tôi rất thích trò chơi điện tử này."),
    t("le sport", "thể thao", "Dumbbell", "Je fais du sport le week-end.", "Cuối tuần tôi chơi thể thao."),
    t("le camping", "cắm trại", "Tent", "Nous faisons du camping en été.", "Mùa hè chúng tôi đi cắm trại."),
    t("le cinéma", "rạp chiếu phim", "Clapperboard", "On va au cinéma samedi ?", "Thứ Bảy mình đi xem phim nhé?"),
    t("la peinture", "hội hoạ", "Palette", "Elle fait de la peinture.", "Cô ấy vẽ tranh."),
    t("le volley-ball", "bóng chuyền", "Volleyball", "Nous jouons au volley-ball à la plage.", "Chúng tôi chơi bóng chuyền ở bãi biển."),
    t("le piano", "đàn piano", "Piano", "Elle joue du piano depuis cinq ans.", "Cô ấy chơi piano được năm năm rồi."),
  ] },
  { ma: "tv-co-the-suc-khoe", ten: "Cơ thể và sức khoẻ", tenFr: "Le corps et la santé", cap: "A1", tu: [
    t("l'œil", "con mắt", "Eye", "J'ai mal à l'œil.", "Tôi bị đau mắt.", "m"),
    t("l'oreille", "cái tai", "Ear", "J'ai mal à l'oreille.", "Tôi bị đau tai.", "f"),
    t("la main", "bàn tay", "Hand", "Lève la main !", "Giơ tay lên!"),
    t("le cœur", "trái tim", "Heart", "Mon cœur bat vite.", "Tim tôi đập nhanh."),
    t("le cerveau", "bộ não", "Brain", "Le cerveau a besoin de sommeil.", "Bộ não cần giấc ngủ."),
    t("l'os", "xương", "Bone", "Le chien a un os.", "Con chó có một khúc xương.", "m"),
    t("le pied", "bàn chân", "Footprints", "J'ai mal au pied.", "Tôi bị đau chân."),
    t("le médicament", "thuốc", "Pill", "Je prends un médicament.", "Tôi uống thuốc."),
    t("le pansement", "băng dán", "Bandage", "Il met un pansement sur son doigt.", "Anh ấy dán băng lên ngón tay."),
    t("la piqûre", "mũi tiêm", "Syringe", "L'infirmière fait une piqûre.", "Cô y tá tiêm một mũi."),
  ] },

  /* ── A2 (11/11, theo chủ dự án): 7 chủ đề, từ không trùng A1, câu ví dụ dài hơn, có quá khứ,
     tương lai gần, so sánh. ── */
  { ma: "tv-quan-ao", ten: "Quần áo và phụ kiện", tenFr: "Les vêtements et les accessoires", cap: "A2", tu: [
    t("la chemise", "áo sơ mi", "Shirt", "Il porte une chemise blanche pour son entretien.", "Anh ấy mặc áo sơ mi trắng đi phỏng vấn."),
    t("les lunettes", "kính", "Glasses", "J'ai oublié mes lunettes à la maison.", "Tôi để quên kính ở nhà."),
    t("la montre", "đồng hồ đeo tay", "Watch", "Ma grand-mère m'a offert cette montre.", "Bà tặng tôi chiếc đồng hồ này."),
    t("la bague", "chiếc nhẫn", "Gem", "Elle a perdu sa bague à la plage.", "Cô ấy làm mất nhẫn ở bãi biển."),
    t("le parapluie", "cái ô", "Umbrella", "Prends ton parapluie, il va pleuvoir.", "Mang ô theo đi, trời sắp mưa."),
    t("le sac à main", "túi xách", "Handbag", "Son sac à main est plus grand que le mien.", "Túi xách của cô ấy to hơn của tôi."),
    t("les chaussures", "giày", "Footprints", "Ces chaussures sont trop petites pour moi.", "Đôi giày này quá chật với tôi."),
    t("la cravate", "cà vạt", "Ribbon", "Mon père met une cravate pour aller au bureau.", "Bố tôi thắt cà vạt đi làm."),
    t("l'écharpe", "khăn quàng cổ", "Wind", "En hiver, je mets une écharpe en laine.", "Mùa đông tôi quàng khăn len.", "f"),
    t("le maillot de bain", "đồ bơi", "Waves", "N'oublie pas ton maillot de bain pour la piscine.", "Đừng quên đồ bơi khi đi bể bơi nhé."),
  ] },
  { ma: "tv-nghe-nghiep", ten: "Nghề nghiệp", tenFr: "Les métiers", cap: "A2", tu: [
    t("le médecin", "bác sĩ", "Stethoscope", "Le médecin m'a donné des médicaments.", "Bác sĩ đã cho tôi thuốc."),
    t("le cuisinier", "đầu bếp", "ChefHat", "Le cuisinier prépare le plat du jour.", "Đầu bếp đang nấu món của ngày."),
    t("l'ouvrier", "công nhân", "HardHat", "L'ouvrier construit une nouvelle maison.", "Người công nhân xây một ngôi nhà mới.", "m"),
    t("le mécanicien", "thợ sửa xe", "Wrench", "Le mécanicien va réparer ma voiture demain.", "Ngày mai thợ sẽ sửa xe cho tôi."),
    t("le peintre", "thợ sơn", "Paintbrush", "Le peintre repeint notre salon cette semaine.", "Tuần này thợ sơn sơn lại phòng khách nhà tôi."),
    t("le coiffeur", "thợ cắt tóc", "Scissors", "Je vais chez le coiffeur samedi.", "Thứ Bảy tôi đi cắt tóc."),
    t("le juge", "thẩm phán", "Gavel", "Le juge écoute les deux personnes.", "Thẩm phán lắng nghe cả hai người."),
    t("l'agriculteur", "nông dân", "Tractor", "L'agriculteur travaille dans les champs.", "Người nông dân làm việc ngoài đồng.", "m"),
    t("le pilote", "phi công", "Plane", "Le pilote a annoncé un petit retard.", "Phi công đã thông báo chậm một chút."),
    t("le facteur", "người đưa thư", "Mail", "Le facteur passe tous les matins.", "Người đưa thư ghé qua mỗi sáng."),
  ] },
  { ma: "tv-nha-bep", ten: "Trong bếp", tenFr: "Dans la cuisine", cap: "A2", tu: [
    t("la casserole", "cái nồi", "CookingPot", "Mets l'eau dans la casserole.", "Cho nước vào nồi đi."),
    t("le micro-ondes", "lò vi sóng", "Microwave", "Je réchauffe mon repas au micro-ondes.", "Tôi hâm nóng cơm bằng lò vi sóng."),
    t("la tasse", "cái tách", "Coffee", "Il boit une tasse de thé après le déjeuner.", "Anh ấy uống một tách trà sau bữa trưa."),
    t("la fourchette", "cái nĩa", "Utensils", "On mange la salade avec une fourchette.", "Người ta ăn xà lách bằng nĩa."),
    t("le couteau", "con dao", "UtensilsCrossed", "Attention, ce couteau coupe bien !", "Cẩn thận, con dao này sắc lắm!"),
    t("le bol", "cái bát", "Soup", "Le matin, je prends un bol de céréales.", "Buổi sáng tôi ăn một bát ngũ cốc."),
    t("le verre", "cái cốc", "GlassWater", "Tu veux un verre de jus d'orange ?", "Bạn muốn một cốc nước cam không?"),
    t("la poêle", "cái chảo", "Flame", "Je fais cuire les œufs dans la poêle.", "Tôi rán trứng trong chảo."),
    t("le minuteur", "đồng hồ hẹn giờ", "Timer", "Mets le minuteur sur dix minutes.", "Hẹn giờ mười phút nhé."),
    t("la bouteille", "cái chai", "CupSoda", "Il reste une bouteille d'eau dans le frigo.", "Trong tủ lạnh còn một chai nước."),
  ] },
  { ma: "tv-du-lich", ten: "Du lịch", tenFr: "Les voyages", cap: "A2", tu: [
    t("la valise", "va li", "Luggage", "Ma valise est plus lourde que la tienne.", "Va li của tôi nặng hơn của bạn."),
    t("le billet", "vé", "Ticket", "J'ai acheté mon billet de train en ligne.", "Tôi đã mua vé tàu trên mạng."),
    t("la carte", "bản đồ", "Map", "Regarde la carte, on est perdus !", "Xem bản đồ đi, mình lạc rồi!"),
    t("le passeport", "hộ chiếu", "BaggageClaim", "N'oublie pas ton passeport pour l'avion.", "Đừng quên hộ chiếu khi đi máy bay nhé."),
    t("la boussole", "la bàn", "Compass", "Avec une boussole, on trouve le nord.", "Có la bàn thì tìm được hướng bắc."),
    t("l'aéroport", "sân bay", "PlaneTakeoff", "Nous allons arriver à l'aéroport à midi.", "Chúng tôi sẽ đến sân bay lúc trưa.", "m"),
    t("la plage", "bãi biển", "Palmtree", "L'été dernier, nous sommes allés à la plage.", "Hè năm ngoái chúng tôi đã đi biển."),
    t("le panneau", "biển chỉ đường", "Signpost", "Suivez le panneau pour aller au centre-ville.", "Đi theo biển chỉ đường để vào trung tâm."),
    t("les jumelles", "ống nhòm", "Binoculars", "Avec les jumelles, on voit les oiseaux.", "Dùng ống nhòm thì nhìn thấy chim."),
    t("le drapeau", "lá cờ", "Flag", "Le drapeau français est bleu, blanc et rouge.", "Cờ Pháp có màu xanh, trắng và đỏ."),
  ] },
  { ma: "tv-thien-nhien", ten: "Thiên nhiên", tenFr: "La nature", cap: "A2", tu: [
    t("la montagne", "ngọn núi", "Mountain", "Nous allons faire une randonnée en montagne.", "Chúng tôi sẽ đi bộ đường dài trên núi."),
    t("la forêt", "khu rừng", "Trees", "Il y a beaucoup d'animaux dans la forêt.", "Trong rừng có nhiều động vật."),
    t("la fleur", "bông hoa", "Flower", "Il a offert une fleur à sa mère.", "Anh ấy tặng mẹ một bông hoa."),
    t("la feuille", "chiếc lá", "Leaf", "En automne, les feuilles tombent.", "Mùa thu, lá rụng."),
    t("la mer", "biển", "Waves", "La mer est plus calme aujourd'hui.", "Hôm nay biển lặng hơn."),
    t("l'arbre", "cái cây", "TreePine", "Cet arbre a plus de cent ans.", "Cái cây này hơn trăm tuổi.", "m"),
    t("le cactus", "cây xương rồng", "Sprout", "Le cactus n'a pas besoin de beaucoup d'eau.", "Cây xương rồng không cần nhiều nước."),
    t("l'île", "hòn đảo", "Palmtree", "Nous avons passé une semaine sur une petite île.", "Chúng tôi đã ở một tuần trên một hòn đảo nhỏ.", "f"),
    t("l'étoile", "ngôi sao", "Star", "On voit les étoiles à la campagne.", "Ở nông thôn nhìn thấy được sao.", "f"),
    t("le désert", "sa mạc", "Sun", "Il fait très chaud dans le désert.", "Trong sa mạc rất nóng."),
  ] },
  { ma: "tv-mua-sam", ten: "Mua sắm và tiền", tenFr: "Les achats et l'argent", cap: "A2", tu: [
    t("le chariot", "xe đẩy hàng", "ShoppingCart", "Le chariot est plein, on peut payer.", "Xe đẩy đầy rồi, mình đi trả tiền thôi."),
    t("le sac", "túi đựng hàng", "ShoppingBag", "Vous voulez un sac en papier ?", "Anh chị có cần túi giấy không?"),
    t("la carte bancaire", "thẻ ngân hàng", "CreditCard", "Je peux payer par carte bancaire ?", "Tôi trả bằng thẻ ngân hàng được không?"),
    t("le billet de banque", "tờ tiền", "Banknote", "J'ai un billet de banque de vingt euros.", "Tôi có một tờ hai mươi euro."),
    t("la pièce", "đồng xu", "Coins", "Il me faut une pièce pour le chariot.", "Tôi cần một đồng xu để lấy xe đẩy."),
    t("le ticket de caisse", "hoá đơn", "Receipt", "Gardez le ticket de caisse, s'il vous plaît.", "Anh chị giữ hoá đơn giúp nhé."),
    t("l'étiquette", "nhãn giá", "Tag", "Le prix est sur l'étiquette.", "Giá ghi trên nhãn.", "f"),
    t("la tirelire", "ống heo tiết kiệm", "PiggyBank", "Il met son argent dans sa tirelire.", "Cậu ấy bỏ tiền vào ống heo."),
    t("le portefeuille", "cái ví", "Wallet", "J'ai laissé mon portefeuille dans la voiture.", "Tôi để quên ví trong xe."),
    t("la cabine d'essayage", "phòng thử đồ", "Store", "La cabine d'essayage est au fond du magasin.", "Phòng thử đồ ở cuối cửa hàng."),
  ] },
  { ma: "tv-cong-nghe", ten: "Đồ công nghệ", tenFr: "Les objets technologiques", cap: "A2", tu: [
    t("l'ordinateur portable", "máy tính xách tay", "Laptop", "Je travaille sur mon ordinateur portable.", "Tôi làm việc trên máy tính xách tay.", "m"),
    t("le téléphone portable", "điện thoại di động", "Smartphone", "Éteignez votre téléphone portable, s'il vous plaît.", "Làm ơn tắt điện thoại di động."),
    t("la tablette", "máy tính bảng", "Tablet", "Ma fille lit des livres sur sa tablette.", "Con gái tôi đọc sách trên máy tính bảng."),
    t("l'écran", "màn hình", "Monitor", "L'écran de mon ordinateur est cassé.", "Màn hình máy tính của tôi bị vỡ.", "m"),
    t("le clavier", "bàn phím", "Keyboard", "Ce clavier est plus pratique.", "Bàn phím này tiện hơn."),
    t("la souris", "con chuột máy tính", "Mouse", "Clique avec la souris sur le lien.", "Bấm chuột vào đường liên kết."),
    t("l'imprimante", "máy in", "Printer", "L'imprimante ne marche plus.", "Máy in hỏng rồi.", "f"),
    t("le casque", "tai nghe chụp", "Headphones", "J'écoute de la musique avec mon casque.", "Tôi nghe nhạc bằng tai nghe."),
    t("la batterie", "pin", "Battery", "La batterie de mon téléphone est presque vide.", "Pin điện thoại của tôi gần hết."),
    t("le chargeur", "cục sạc", "Plug", "Tu peux me prêter ton chargeur ?", "Bạn cho tôi mượn cục sạc được không?"),
  ] },

  /* ── B1 (11/11, theo chủ dự án): 6 chủ đề gần đề DELF B1 (sức khoẻ, môi trường, công việc,
     thể thao, văn hoá, giao thông). Từ không trùng A1/A2; câu ví dụ có điều kiện, bị động,
     quá khứ, đại từ quan hệ. ── */
  { ma: "tv-benh-vien", ten: "Ở bệnh viện", tenFr: "À l'hôpital", cap: "B1", tu: [
    t("l'ordonnance", "đơn thuốc", "ClipboardList", "Le médecin m'a fait une ordonnance pour des antibiotiques.", "Bác sĩ đã kê cho tôi đơn thuốc kháng sinh.", "f"),
    t("le fauteuil roulant", "xe lăn", "Accessibility", "Depuis son accident, il se déplace en fauteuil roulant.", "Từ sau tai nạn, anh ấy đi lại bằng xe lăn."),
    t("la radiographie", "ảnh chụp X-quang", "Scan", "La radiographie montre que le bras est cassé.", "Ảnh X-quang cho thấy cánh tay bị gãy."),
    t("la pharmacie", "hiệu thuốc", "Cross", "Si tu passes devant la pharmacie, achète du sirop.", "Nếu đi qua hiệu thuốc thì mua giúp siro nhé."),
    t("le thermomètre", "nhiệt kế", "Thermometer", "Le thermomètre indique trente-neuf degrés.", "Nhiệt kế chỉ ba mươi chín độ."),
    t("le masque", "khẩu trang", "Shield", "On doit porter un masque dans la salle d'attente.", "Phải đeo khẩu trang trong phòng chờ."),
    t("l'infirmière", "nữ y tá", "HeartPulse", "L'infirmière qui s'occupe de moi est très gentille.", "Cô y tá chăm sóc tôi rất tử tế.", "f"),
    t("les urgences", "phòng cấp cứu", "Siren", "Il a été transporté aux urgences cette nuit.", "Đêm qua anh ấy đã được đưa vào phòng cấp cứu."),
    t("la prise de sang", "việc lấy máu xét nghiệm", "Droplet", "Il faut être à jeun pour la prise de sang.", "Phải nhịn ăn trước khi lấy máu xét nghiệm."),
    t("le rendez-vous", "cuộc hẹn khám", "CalendarClock", "J'aurais dû prendre rendez-vous plus tôt.", "Lẽ ra tôi phải đặt lịch khám sớm hơn."),
  ] },
  { ma: "tv-moi-truong", ten: "Môi trường", tenFr: "L'environnement", cap: "B1", tu: [
    t("le recyclage", "việc tái chế", "Recycle", "Le recyclage du verre est obligatoire dans notre ville.", "Ở thành phố chúng tôi, tái chế thuỷ tinh là bắt buộc."),
    t("la poubelle", "thùng rác", "Trash2", "Les bouteilles vont dans la poubelle jaune.", "Chai lọ bỏ vào thùng rác màu vàng."),
    t("l'éolienne", "tua-bin gió", "Fan", "Une éolienne a été installée près du village.", "Một tua-bin gió đã được lắp gần làng.", "f"),
    t("le panneau solaire", "tấm pin mặt trời", "SolarPanel", "Grâce au panneau solaire, nous payons moins d'électricité.", "Nhờ tấm pin mặt trời, chúng tôi trả ít tiền điện hơn."),
    t("la pollution", "sự ô nhiễm", "Factory", "La pollution de l'air est un problème dans les grandes villes.", "Ô nhiễm không khí là vấn đề ở các thành phố lớn."),
    t("le sac plastique", "túi ni lông", "ShoppingBag", "Le sac plastique est interdit dans les magasins.", "Túi ni lông bị cấm trong các cửa hàng."),
    t("la planète", "hành tinh", "Earth", "Nous devons protéger la planète pour nos enfants.", "Chúng ta phải bảo vệ hành tinh vì con cháu."),
    t("le compost", "phân ủ hữu cơ", "Sprout", "Les épluchures servent à faire du compost.", "Vỏ rau củ được dùng để ủ phân."),
    t("la voiture électrique", "ô tô điện", "Zap", "Si j'avais assez d'argent, j'achèterais une voiture électrique.", "Nếu có đủ tiền, tôi sẽ mua một chiếc ô tô điện."),
    t("l'ampoule", "bóng đèn", "Lightbulb", "Ces ampoules consomment moins d'énergie.", "Những bóng đèn này tốn ít điện hơn.", "f"),
  ] },
  { ma: "tv-van-phong", ten: "Ở văn phòng", tenFr: "Au bureau", cap: "B1", tu: [
    t("le classeur", "bìa còng hồ sơ", "FolderOpen", "Range les factures dans le classeur bleu.", "Cất hoá đơn vào bìa còng màu xanh."),
    t("la photocopieuse", "máy photocopy", "Printer", "La photocopieuse est encore en panne.", "Máy photocopy lại hỏng rồi."),
    t("la réunion", "cuộc họp", "Users", "La réunion a été reportée à jeudi.", "Cuộc họp đã được dời sang thứ Năm."),
    t("le badge", "thẻ ra vào", "IdCard", "Sans badge, on ne peut pas entrer dans le bâtiment.", "Không có thẻ thì không vào được toà nhà."),
    t("le calendrier", "lịch", "Calendar", "J'ai noté la date dans mon calendrier.", "Tôi đã ghi ngày đó vào lịch."),
    t("le trombone", "cái kẹp giấy", "Paperclip", "Attache les feuilles avec un trombone.", "Kẹp các tờ giấy lại bằng kẹp giấy."),
    t("le dossier", "tập hồ sơ", "Folder", "Le dossier dont tu as besoin est sur mon bureau.", "Tập hồ sơ mà bạn cần ở trên bàn tôi."),
    t("le tampon", "con dấu", "Stamp", "Il manque le tampon de l'entreprise sur ce document.", "Văn bản này còn thiếu con dấu của công ty."),
    t("le graphique", "biểu đồ", "ChartColumn", "Ce graphique montre l'évolution des ventes.", "Biểu đồ này cho thấy doanh số thay đổi ra sao."),
    t("la poignée de main", "cái bắt tay", "Handshake", "L'entretien a commencé par une poignée de main.", "Buổi phỏng vấn bắt đầu bằng một cái bắt tay."),
  ] },
  { ma: "tv-the-thao", ten: "Các môn thể thao", tenFr: "Les sports", cap: "B1", tu: [
    t("le ski", "trượt tuyết", "MountainSnow", "Chaque hiver, nous faisons du ski dans les Alpes.", "Mùa đông nào chúng tôi cũng trượt tuyết ở dãy Alpes."),
    t("la natation", "bơi lội", "Waves", "La natation est le sport le plus complet.", "Bơi lội là môn thể thao toàn diện nhất."),
    t("le tennis", "quần vợt", "Goal", "Elle joue au tennis depuis qu'elle a dix ans.", "Cô ấy chơi quần vợt từ năm mười tuổi."),
    t("la course à pied", "chạy bộ", "Footprints", "La course à pied m'aide à me détendre.", "Chạy bộ giúp tôi thư giãn."),
    t("le cyclisme", "đạp xe thể thao", "Bike", "Le Tour de France est la plus grande course de cyclisme.", "Tour de France là giải đua xe đạp lớn nhất."),
    t("l'escalade", "leo núi", "Mountain", "L'escalade demande de la force et du courage.", "Leo núi đòi hỏi sức khoẻ và lòng can đảm.", "f"),
    t("le judo", "võ judo", "Swords", "Mon frère a gagné une médaille de judo.", "Em trai tôi đã giành huy chương judo."),
    t("la randonnée", "đi bộ đường dài", "Map", "Nous avons fait une randonnée de vingt kilomètres.", "Chúng tôi đã đi bộ đường dài hai mươi cây số."),
    t("le football", "bóng đá", "Trophy", "Le football est le sport préféré des Français.", "Bóng đá là môn thể thao người Pháp thích nhất."),
    t("le basket", "bóng rổ", "Target", "Il est si grand qu'il devrait jouer au basket.", "Cậu ấy cao đến mức nên chơi bóng rổ."),
  ] },
  { ma: "tv-van-hoa", ten: "Văn hoá và giải trí", tenFr: "Les sorties culturelles", cap: "B1", tu: [
    t("le musée", "bảo tàng", "Landmark", "Le musée est gratuit le premier dimanche du mois.", "Bảo tàng miễn phí vào chủ nhật đầu tháng."),
    t("l'exposition", "triển lãm", "Frame", "L'exposition sur Monet a attiré beaucoup de visiteurs.", "Triển lãm về Monet đã thu hút rất nhiều khách.", "f"),
    t("le théâtre", "nhà hát kịch", "Drama", "Nous sommes allés au théâtre voir une pièce de Molière.", "Chúng tôi đã đi xem một vở kịch của Molière."),
    t("le concert", "buổi hoà nhạc", "Music2", "Le concert a été annulé à cause de la pluie.", "Buổi hoà nhạc đã bị huỷ vì trời mưa."),
    t("l'orchestre", "dàn nhạc", "Guitar", "L'orchestre joue ce soir à l'opéra.", "Tối nay dàn nhạc biểu diễn ở nhà hát opera.", "m"),
    t("le festival", "lễ hội", "PartyPopper", "Le festival de Cannes a lieu chaque année en mai.", "Liên hoan phim Cannes diễn ra vào tháng Năm hằng năm."),
    t("le spectacle", "buổi biểu diễn", "Theater", "Le spectacle commence à vingt heures précises.", "Buổi biểu diễn bắt đầu đúng tám giờ tối."),
    t("le roman", "tiểu thuyết", "BookOpen", "C'est le roman le plus intéressant que j'aie lu.", "Đó là cuốn tiểu thuyết hay nhất mà tôi từng đọc."),
    t("le micro", "micrô", "MicVocal", "Le chanteur a pris le micro pour remercier le public.", "Ca sĩ cầm micrô để cảm ơn khán giả."),
    t("la sculpture", "tác phẩm điêu khắc", "Crown", "Cette sculpture de Rodin est très célèbre.", "Tác phẩm điêu khắc này của Rodin rất nổi tiếng."),
  ] },
  { ma: "tv-giao-thong-b1", ten: "Đường phố và giao thông", tenFr: "La circulation", cap: "B1", tu: [
    t("le feu rouge", "đèn đỏ", "TrafficCone", "Il a été arrêté parce qu'il avait grillé un feu rouge.", "Anh ấy bị dừng xe vì đã vượt đèn đỏ."),
    t("le passage piéton", "vạch qua đường", "Footprints", "Traversez toujours sur le passage piéton.", "Luôn sang đường ở vạch dành cho người đi bộ."),
    t("le rond-point", "vòng xuyến", "RotateCw", "Au rond-point, prenez la deuxième sortie.", "Đến vòng xuyến, rẽ vào lối ra thứ hai."),
    t("l'embouteillage", "tắc đường", "CarFront", "Nous sommes restés une heure dans un embouteillage.", "Chúng tôi đã kẹt xe suốt một tiếng.", "m"),
    t("le parking", "bãi đỗ xe", "SquareParking", "Le parking de la gare est complet le lundi.", "Bãi đỗ xe ở nhà ga hết chỗ vào thứ Hai."),
    t("le permis de conduire", "bằng lái xe", "IdCard", "J'ai obtenu mon permis de conduire du premier coup.", "Tôi đã thi đỗ bằng lái ngay lần đầu."),
    t("la station de métro", "ga tàu điện ngầm", "TrainFront", "La station de métro la plus proche est à cinq minutes.", "Ga tàu điện ngầm gần nhất cách năm phút đi bộ."),
    t("l'amende", "tiền phạt", "Receipt", "Si vous vous garez ici, vous aurez une amende.", "Nếu đỗ xe ở đây, bạn sẽ bị phạt.", "f"),
    t("la station de recharge", "trạm sạc điện", "BatteryCharging", "Il y a une station de recharge sur le parking.", "Có một trạm sạc điện trong bãi đỗ xe."),
    t("les travaux", "công trình đang thi công", "Construction", "La rue est fermée à cause des travaux.", "Con phố bị chặn vì đang thi công."),
  ] },

  /* ── B2 (11/11, theo chủ dự án): 6 chủ đề gần đề DELF B2 (khoa học, kinh tế, đời sống công
     dân, truyền thông, y học, đô thị). Từ không trùng A1/A2/B1; câu ví dụ có giả định cách,
     gérondif, quá khứ hoàn thành, bị động, nhượng bộ. ── */
  { ma: "tv-khoa-hoc", ten: "Khoa học và công nghệ", tenFr: "Les sciences", cap: "B2", tu: [
    t("le microscope", "kính hiển vi", "Microscope", "Grâce au microscope, les chercheurs ont observé la bactérie.", "Nhờ kính hiển vi, các nhà nghiên cứu đã quan sát được vi khuẩn."),
    t("le télescope", "kính thiên văn", "Telescope", "Ce télescope permet d'observer des galaxies lointaines.", "Kính thiên văn này cho phép quan sát các thiên hà xa xôi."),
    t("la fusée", "tên lửa", "Rocket", "La fusée a été lancée malgré les mauvaises conditions météo.", "Tên lửa đã được phóng dù thời tiết xấu."),
    t("le satellite", "vệ tinh", "Satellite", "Ce satellite surveille l'évolution du climat depuis dix ans.", "Vệ tinh này theo dõi biến đổi khí hậu suốt mười năm nay."),
    t("l'ADN", "ADN", "Dna", "L'analyse de l'ADN a permis d'identifier le suspect.", "Phân tích ADN đã giúp xác định nghi phạm.", "m"),
    t("l'éprouvette", "ống nghiệm", "TestTube", "Il faut que tu nettoies l'éprouvette avant l'expérience.", "Bạn phải rửa ống nghiệm trước thí nghiệm.", "f"),
    t("l'aimant", "nam châm", "Magnet", "L'aimant attire tous les objets en fer.", "Nam châm hút mọi vật bằng sắt.", "m"),
    t("l'atome", "nguyên tử", "Atom", "Un atome est composé d'un noyau et d'électrons.", "Một nguyên tử gồm hạt nhân và các electron.", "m"),
    t("le robot", "rô-bốt", "Bot", "Ce robot effectue des opérations chirurgicales très précises.", "Rô-bốt này thực hiện các ca phẫu thuật rất chính xác."),
    t("la loupe", "kính lúp", "ZoomIn", "En regardant à la loupe, on voit les détails de l'insecte.", "Nhìn qua kính lúp, ta thấy rõ chi tiết của con côn trùng."),
  ] },
  { ma: "tv-kinh-te", ten: "Kinh tế", tenFr: "L'économie", cap: "B2", tu: [
    t("la banque", "ngân hàng", "Landmark", "La banque a refusé de m'accorder un crédit.", "Ngân hàng đã từ chối cho tôi vay."),
    t("le contrat", "hợp đồng", "FileSignature", "Avant de signer le contrat, lisez-le attentivement.", "Trước khi ký hợp đồng, hãy đọc kỹ."),
    t("l'impôt", "thuế", "Percent", "Bien que l'impôt ait augmenté, les dépenses publiques baissent.", "Dù thuế đã tăng, chi tiêu công vẫn giảm.", "m"),
    t("la croissance", "sự tăng trưởng", "TrendingUp", "La croissance économique a ralenti cette année.", "Năm nay tăng trưởng kinh tế đã chậm lại."),
    t("la bourse", "thị trường chứng khoán", "ChartCandlestick", "La bourse a chuté après l'annonce du gouvernement.", "Thị trường chứng khoán đã giảm mạnh sau thông báo của chính phủ."),
    t("le prêt", "khoản vay", "HandCoins", "Ils ont obtenu un prêt pour acheter leur appartement.", "Họ đã được vay tiền để mua căn hộ."),
    t("la mondialisation", "toàn cầu hoá", "Globe", "La mondialisation a transformé le commerce international.", "Toàn cầu hoá đã làm thay đổi thương mại quốc tế."),
    t("le cargo", "tàu chở hàng", "Ship", "Le cargo transporte des milliers de conteneurs vers l'Asie.", "Tàu chở hàng vận chuyển hàng nghìn công-te-nơ sang châu Á."),
    t("l'entrepôt", "nhà kho", "Warehouse", "Les colis sont stockés dans un immense entrepôt.", "Các kiện hàng được chứa trong một nhà kho khổng lồ.", "m"),
    t("la signature", "chữ ký", "Signature", "Il manque votre signature en bas de la page.", "Còn thiếu chữ ký của anh chị ở cuối trang."),
  ] },
  { ma: "tv-cong-dan", ten: "Đời sống công dân", tenFr: "La vie citoyenne", cap: "B2", tu: [
    t("le candidat", "ứng viên", "Vote", "Le candidat a présenté son programme devant les électeurs.", "Ứng viên đã trình bày chương trình trước cử tri."),
    t("le parlement", "nghị viện", "Landmark", "Le parlement a adopté la loi après un long débat.", "Nghị viện đã thông qua luật sau một cuộc tranh luận dài."),
    t("la manifestation", "cuộc biểu tình", "Megaphone", "Des milliers de personnes ont participé à la manifestation.", "Hàng nghìn người đã tham gia cuộc biểu tình."),
    t("le tribunal", "toà án", "Gavel", "L'affaire sera jugée par le tribunal le mois prochain.", "Vụ việc sẽ được toà án xét xử vào tháng tới."),
    t("la loi", "luật", "Scale", "Nul n'est censé ignorer la loi.", "Không ai được coi là không biết luật."),
    t("le débat", "cuộc tranh luận", "MessagesSquare", "Le débat entre les deux candidats a été très tendu.", "Cuộc tranh luận giữa hai ứng viên đã rất căng thẳng."),
    t("le sondage", "cuộc thăm dò ý kiến", "ChartPie", "D'après le dernier sondage, les jeunes votent moins.", "Theo cuộc thăm dò gần nhất, người trẻ đi bầu ít hơn."),
    t("le policier", "cảnh sát", "ShieldCheck", "Le policier nous a demandé nos papiers.", "Viên cảnh sát yêu cầu chúng tôi xuất trình giấy tờ."),
    t("la mairie", "toà thị chính", "Building", "Il faut s'inscrire à la mairie pour pouvoir voter.", "Phải đăng ký ở toà thị chính thì mới được đi bầu."),
    t("la pétition", "bản kiến nghị", "ClipboardPen", "Cette pétition a déjà recueilli cent mille signatures.", "Bản kiến nghị này đã thu được một trăm nghìn chữ ký."),
  ] },
  { ma: "tv-truyen-thong", ten: "Truyền thông", tenFr: "Les médias", cap: "B2", tu: [
    t("le journal", "tờ báo", "Newspaper", "Je lis le journal en prenant mon café.", "Tôi vừa uống cà phê vừa đọc báo."),
    t("la radio", "đài phát thanh", "Radio", "J'ai entendu la nouvelle à la radio ce matin.", "Sáng nay tôi đã nghe tin đó trên đài."),
    t("l'interview", "cuộc phỏng vấn", "Mic", "Le ministre a accordé une interview à une chaîne locale.", "Bộ trưởng đã trả lời phỏng vấn một kênh truyền hình địa phương.", "f"),
    t("le podcast", "chương trình podcast", "Podcast", "J'écoute un podcast d'histoire pendant mes trajets.", "Tôi nghe một podcast lịch sử trong lúc đi đường."),
    t("le journaliste", "nhà báo", "PenLine", "Le journaliste a vérifié ses sources avant de publier l'article.", "Nhà báo đã kiểm tra nguồn tin trước khi đăng bài."),
    t("l'antenne", "ăng-ten", "RadioTower", "Une nouvelle antenne a été installée sur le toit.", "Một ăng-ten mới đã được lắp trên mái nhà.", "f"),
    t("la publicité", "quảng cáo", "Megaphone", "Cette publicité vise surtout les adolescents.", "Quảng cáo này chủ yếu nhắm vào thanh thiếu niên."),
    t("le réseau social", "mạng xã hội", "Share2", "L'information s'est répandue très vite sur le réseau social.", "Thông tin đã lan rất nhanh trên mạng xã hội."),
    t("la caméra", "máy quay", "Video", "Une caméra filme l'entrée du bâtiment jour et nuit.", "Một máy quay ghi hình lối vào toà nhà cả ngày lẫn đêm."),
    t("le magazine", "tạp chí", "BookOpenText", "Ce magazine publie chaque mois un dossier sur l'environnement.", "Tạp chí này mỗi tháng đăng một chuyên đề về môi trường."),
  ] },
  { ma: "tv-y-hoc", ten: "Y học", tenFr: "La médecine", cap: "B2", tu: [
    t("le vaccin", "vắc-xin", "Syringe", "Ce vaccin protège contre plusieurs maladies graves.", "Loại vắc-xin này phòng được nhiều bệnh nặng."),
    t("le chirurgien", "bác sĩ phẫu thuật", "HeartPulse", "Le chirurgien avait déjà opéré ce patient l'an dernier.", "Bác sĩ phẫu thuật đã từng mổ cho bệnh nhân này năm ngoái."),
    t("le virus", "vi-rút", "Biohazard", "Le virus se transmet par l'air.", "Vi-rút lây qua không khí."),
    t("l'allergie", "dị ứng", "Flower", "Au printemps, son allergie au pollen l'empêche de dormir.", "Mùa xuân, chứng dị ứng phấn hoa khiến cô ấy mất ngủ.", "f"),
    t("les poumons", "phổi", "Wind", "Le tabac abîme gravement les poumons.", "Thuốc lá làm tổn hại nặng nề đến phổi."),
    t("le rein", "quả thận", "Bean", "Il attend une greffe de rein depuis deux ans.", "Anh ấy chờ ghép thận đã hai năm."),
    t("le squelette", "bộ xương", "Skull", "Le squelette humain compte plus de deux cents os.", "Bộ xương người có hơn hai trăm chiếc xương."),
    t("la dent", "cái răng", "Smile", "Je me suis cassé une dent en mangeant du nougat.", "Tôi bị gãy một cái răng khi ăn kẹo nougat."),
    t("le stéthoscope", "ống nghe", "Stethoscope", "Le médecin écoute le cœur avec son stéthoscope.", "Bác sĩ nghe tim bằng ống nghe."),
    t("le lit d'hôpital", "giường bệnh", "BedSingle", "Il est resté une semaine dans un lit d'hôpital.", "Anh ấy đã nằm giường bệnh một tuần."),
  ] },
  { ma: "tv-do-thi", ten: "Đô thị", tenFr: "La ville et l'urbanisme", cap: "B2", tu: [
    t("le gratte-ciel", "nhà chọc trời", "Building2", "Un nouveau gratte-ciel domine désormais le quartier d'affaires.", "Một toà nhà chọc trời mới giờ đây nổi bật giữa khu thương mại."),
    t("le pont", "cây cầu", "Milestone", "Le pont a été fermé pour que les ingénieurs puissent l'inspecter.", "Cây cầu đã bị đóng để các kỹ sư có thể kiểm tra."),
    t("la grue", "cần cẩu", "Construction", "Une grue géante soulève les poutres du nouvel immeuble.", "Một cần cẩu khổng lồ nâng các dầm thép của toà nhà mới."),
    t("le tunnel", "đường hầm", "Container", "Le tunnel sous la Manche relie la France à l'Angleterre.", "Đường hầm dưới eo biển Manche nối Pháp với Anh."),
    t("l'autoroute", "đường cao tốc", "Route", "En prenant l'autoroute, on gagne une heure.", "Đi đường cao tốc thì nhanh hơn một tiếng.", "f"),
    t("la piste cyclable", "làn đường xe đạp", "Bike", "La ville a créé une piste cyclable le long du fleuve.", "Thành phố đã làm một làn đường xe đạp dọc bờ sông."),
    t("le lampadaire", "cột đèn đường", "LampCeiling", "Les lampadaires s'allument automatiquement à la tombée de la nuit.", "Đèn đường tự bật khi trời sập tối."),
    t("la fontaine", "đài phun nước", "Droplets", "Les touristes jettent des pièces dans la fontaine.", "Khách du lịch ném đồng xu vào đài phun nước."),
    t("le parc", "công viên", "Trees", "Le parc a été réaménagé pour accueillir plus de familles.", "Công viên đã được cải tạo để đón nhiều gia đình hơn."),
    t("l'ascenseur", "thang máy", "ArrowUpDown", "L'ascenseur est en panne, il faudra prendre l'escalier.", "Thang máy hỏng rồi, sẽ phải đi cầu thang bộ.", "m"),
  ] },

  /* ── C1 (11/11, theo chủ dự án): 6 chủ đề gần đề DALF C1 nhưng vẫn vẽ được thành hình (tư pháp,
     thiên tai, nghệ thuật, công nghệ số, năng lượng, ẩm thực). Từ không trùng A1 đến B2; câu ví dụ
     văn phong trang trọng: bị động, giả định, phân từ, đảo ngữ, liên từ nhượng bộ. ── */
  { ma: "tv-tu-phap", ten: "Tư pháp và an ninh", tenFr: "La justice et la sécurité", cap: "C1", tu: [
    t("l'interpellation", "sự bắt giữ tại chỗ", "Lock", "L'interpellation du suspect s'est déroulée sans violence.", "Việc bắt giữ nghi phạm diễn ra không có bạo lực.", "f"),
    t("la détention provisoire", "tạm giam", "Grid3x3", "Le juge a ordonné la détention provisoire en attendant le procès.", "Thẩm phán đã ra lệnh tạm giam trong khi chờ xét xử."),
    t("le relevé d'empreintes", "việc thu dấu vân tay", "Fingerprint", "Le relevé d'empreintes a permis d'identifier l'auteur des faits.", "Việc thu dấu vân tay đã giúp xác định thủ phạm."),
    t("l'effraction", "sự phá khoá đột nhập", "DoorOpen", "Les enquêteurs n'ont relevé aucune trace d'effraction.", "Điều tra viên không tìm thấy dấu vết đột nhập nào.", "f"),
    t("le pot-de-vin", "tiền hối lộ", "Vault", "Le maire est soupçonné d'avoir accepté un pot-de-vin.", "Thị trưởng bị nghi đã nhận tiền hối lộ."),
    t("la vidéosurveillance", "hệ thống camera giám sát", "Cctv", "La vidéosurveillance de la gare a filmé toute la scène.", "Camera giám sát ở nhà ga đã ghi lại toàn bộ sự việc."),
    t("le signalement", "việc trình báo, tố giác", "BellRing", "Un simple signalement aux autorités a suffi à déclencher l'enquête.", "Chỉ một lời trình báo với nhà chức trách là đủ để mở cuộc điều tra."),
    t("la présomption d'innocence", "nguyên tắc suy đoán vô tội", "Scale", "La présomption d'innocence s'applique jusqu'au jugement définitif.", "Nguyên tắc suy đoán vô tội được áp dụng cho tới khi có bản án cuối cùng."),
    t("l'enquête préliminaire", "cuộc điều tra sơ bộ", "UserSearch", "Le parquet a ouvert une enquête préliminaire pour corruption.", "Viện công tố đã mở một cuộc điều tra sơ bộ về tội tham nhũng.", "f"),
    t("la pièce à conviction", "vật chứng", "Search", "Le couteau a été saisi comme pièce à conviction.", "Con dao đã bị thu giữ làm vật chứng."),
  ] },
  { ma: "tv-thien-tai", ten: "Thiên tai", tenFr: "Les catastrophes naturelles", cap: "C1", tu: [
    t("la secousse sismique", "chấn động địa chấn", "Activity", "Une secousse sismique a été ressentie jusqu'à Marseille.", "Một chấn động địa chấn đã được cảm nhận tới tận Marseille."),
    t("l'œil du cyclone", "mắt bão", "CloudLightning", "Au passage de l'œil du cyclone, le vent est tombé d'un coup.", "Khi mắt bão đi qua, gió bỗng lặng hẳn.", "m"),
    t("la coulée de lave", "dòng dung nham", "Mountain", "La coulée de lave a englouti plusieurs maisons du village.", "Dòng dung nham đã nuốt chửng nhiều ngôi nhà trong làng."),
    t("le raz-de-marée", "sóng thần, cơn sóng dâng", "Waves", "Le raz-de-marée a balayé le littoral en quelques minutes.", "Cơn sóng dâng đã quét sạch vùng ven biển trong vài phút."),
    t("le brasier", "biển lửa", "Flame", "Les pompiers ont lutté toute la nuit contre le brasier.", "Lính cứu hoả đã chiến đấu cả đêm với biển lửa."),
    t("la coulée de neige", "dòng tuyết lở", "MountainSnow", "Une coulée de neige a coupé la route du col.", "Một dòng tuyết lở đã chặn con đường qua đèo."),
    t("le stress hydrique", "tình trạng thiếu nước", "Sun", "Le stress hydrique menace désormais la moitié du pays.", "Tình trạng thiếu nước nay đe doạ một nửa đất nước."),
    t("le vent tourbillonnaire", "gió xoáy", "Tornado", "Un vent tourbillonnaire a arraché la toiture de l'école.", "Một cơn gió xoáy đã thổi bay mái trường."),
    t("la crue", "lũ (nước sông dâng)", "CloudRain", "La crue de la Seine a atteint son niveau le plus haut depuis 1910.", "Lũ sông Seine đã lên mức cao nhất kể từ năm 1910."),
    t("la fonte des glaces", "sự tan băng", "Snowflake", "La fonte des glaces fait monter le niveau des océans.", "Sự tan băng làm mực nước biển dâng lên."),
  ] },
  { ma: "tv-nghe-thuat", ten: "Nghệ thuật", tenFr: "Les arts", cap: "C1", tu: [
    t("le coup de pinceau", "nét cọ", "Paintbrush", "On reconnaît Van Gogh à son coup de pinceau tourmenté.", "Người ta nhận ra Van Gogh qua nét cọ dằn vặt của ông."),
    t("la toile de maître", "kiệt tác hội hoạ", "Presentation", "Cette toile de maître a été adjugée à un prix record.", "Kiệt tác hội hoạ này đã được bán đấu giá với mức kỷ lục."),
    t("le commissaire d'exposition", "người phụ trách triển lãm (giám tuyển)", "Landmark", "Le commissaire d'exposition a réuni des œuvres venues de douze pays.", "Người giám tuyển đã tập hợp các tác phẩm đến từ mười hai nước."),
    t("l'art abstrait", "nghệ thuật trừu tượng", "LayoutGrid", "Mondrian est l'une des grandes figures de l'art abstrait.", "Mondrian là một trong những gương mặt lớn của nghệ thuật trừu tượng.", "m"),
    t("la céramique", "nghệ thuật gốm", "Amphora", "Elle expose ses pièces de céramique dans une galerie lyonnaise.", "Cô trưng bày các tác phẩm gốm ở một phòng tranh tại Lyon."),
    t("le virtuose", "nghệ sĩ bậc thầy", "Music", "Ce jeune virtuose a donné son premier concert à douze ans.", "Nghệ sĩ bậc thầy trẻ tuổi này biểu diễn buổi hoà nhạc đầu tiên năm mười hai tuổi."),
    t("le solfège", "nhạc lý", "FileMusic", "Il a appris le solfège avant de toucher un instrument.", "Cậu học nhạc lý trước khi chạm vào nhạc cụ."),
    t("la chorégraphie", "biên đạo múa", "Footprints", "La chorégraphie de ce ballet a été entièrement repensée.", "Phần biên đạo của vở ba lê này đã được làm lại hoàn toàn."),
    t("la calligraphie à la plume", "thư pháp bút lông ngỗng", "PenTool", "La calligraphie à la plume exige une main très sûre.", "Thư pháp bút lông ngỗng đòi hỏi bàn tay rất vững."),
    t("la direction d'orchestre", "nghệ thuật chỉ huy dàn nhạc", "AudioLines", "Elle a étudié la direction d'orchestre au Conservatoire de Paris.", "Cô học chỉ huy dàn nhạc ở Nhạc viện Paris."),
  ] },
  { ma: "tv-cong-nghe-so", ten: "Công nghệ số", tenFr: "Le numérique", cap: "C1", tu: [
    t("l'hébergement de données", "lưu trữ dữ liệu (hosting)", "Server", "L'hébergement de données en Europe garantit le respect du RGPD.", "Lưu trữ dữ liệu ở châu Âu bảo đảm tuân thủ GDPR.", "m"),
    t("le stockage en ligne", "lưu trữ trực tuyến", "Cloud", "Le stockage en ligne permet d'accéder à ses fichiers partout.", "Lưu trữ trực tuyến cho phép truy cập tệp ở bất cứ đâu."),
    t("le pare-feu", "tường lửa", "ShieldCheck", "Le pare-feu a bloqué plusieurs tentatives d'intrusion.", "Tường lửa đã chặn nhiều lần xâm nhập."),
    t("l'arborescence", "cấu trúc dạng cây", "Workflow", "L'arborescence du site permet de trouver chaque page en trois clics.", "Cấu trúc dạng cây của trang web cho phép tìm mọi trang trong ba cú nhấp.", "f"),
    t("la réalité virtuelle", "thực tế ảo", "Glasses", "La réalité virtuelle sert désormais à former les chirurgiens.", "Thực tế ảo nay được dùng để đào tạo bác sĩ phẫu thuật."),
    t("le pilotage à distance", "điều khiển từ xa", "Navigation", "Le pilotage à distance exige une autorisation de vol.", "Điều khiển bay từ xa đòi hỏi giấy phép bay."),
    t("la fabrication additive", "sản xuất bồi đắp (in 3D)", "Printer", "La fabrication additive réduit fortement les déchets industriels.", "Sản xuất bồi đắp giảm mạnh phế thải công nghiệp."),
    t("le semi-conducteur", "chất bán dẫn", "Cpu", "La pénurie de semi-conducteurs a paralysé l'industrie automobile.", "Tình trạng thiếu chất bán dẫn đã làm tê liệt ngành ô tô."),
    t("le haut débit", "băng thông rộng", "Cable", "Le haut débit n'est toujours pas disponible dans certains villages.", "Một số làng vẫn chưa có mạng băng thông rộng."),
    t("la cyberattaque", "cuộc tấn công mạng", "Bug", "L'hôpital a été paralysé par une cyberattaque.", "Bệnh viện đã bị tê liệt vì một cuộc tấn công mạng."),
  ] },
  { ma: "tv-nang-luong", ten: "Năng lượng", tenFr: "L'énergie", cap: "C1", tu: [
    t("la fission nucléaire", "phân hạch hạt nhân", "Atom", "La fission nucléaire libère une énorme quantité d'énergie.", "Phân hạch hạt nhân giải phóng một lượng năng lượng khổng lồ."),
    t("l'énergie hydraulique", "thuỷ năng", "Waves", "L'énergie hydraulique fournit une grande part de l'électricité norvégienne.", "Thuỷ năng cung cấp phần lớn điện năng của Na Uy.", "f"),
    t("l'extraction pétrolière", "khai thác dầu mỏ", "Droplet", "L'extraction pétrolière a repris dans le golfe après la tempête.", "Hoạt động khai thác dầu mỏ ở vùng vịnh đã trở lại sau cơn bão.", "f"),
    t("le forage en mer", "khoan dầu ngoài khơi", "Anchor", "Le forage en mer présente des risques importants pour l'environnement.", "Khoan dầu ngoài khơi đem lại nhiều rủi ro cho môi trường."),
    t("la centrale à charbon", "nhà máy nhiệt điện than", "Pickaxe", "Le pays s'est engagé à fermer sa dernière centrale à charbon.", "Đất nước đã cam kết đóng cửa nhà máy nhiệt điện than cuối cùng."),
    t("le réseau électrique", "lưới điện", "Zap", "La vague de froid a mis le réseau électrique sous tension.", "Đợt rét đã khiến lưới điện quá tải."),
    t("le compteur intelligent", "công tơ thông minh", "Gauge", "Le compteur intelligent transmet la consommation en temps réel.", "Công tơ thông minh truyền dữ liệu tiêu thụ theo thời gian thực."),
    t("le gaz naturel liquéfié", "khí thiên nhiên hoá lỏng (LNG)", "Flame", "Le gaz naturel liquéfié arrive en Europe par méthanier.", "Khí thiên nhiên hoá lỏng được chở tới châu Âu bằng tàu chuyên dụng."),
    t("la biomasse", "sinh khối", "Leaf", "La biomasse transforme les déchets agricoles en chaleur.", "Sinh khối biến phế phẩm nông nghiệp thành nhiệt năng."),
    t("la mobilité électrique", "giao thông chạy điện", "PlugZap", "La mobilité électrique suppose des bornes de recharge partout.", "Giao thông chạy điện đòi hỏi trạm sạc ở khắp nơi."),
  ] },
  { ma: "tv-am-thuc", ten: "Ẩm thực Pháp", tenFr: "La gastronomie", cap: "C1", tu: [
    t("le plateau de fruits de mer", "mâm hải sản", "Shell", "Pour le réveillon, ils ont commandé un plateau de fruits de mer.", "Đêm giao thừa, họ đặt một mâm hải sản."),
    t("la bisque de homard", "súp kem tôm hùm", "Shrimp", "Le chef sert sa bisque de homard dans de petites tasses.", "Đầu bếp phục vụ món súp kem tôm hùm trong những tách nhỏ."),
    t("le velouté de champignons", "súp kem nấm", "Bean", "Un velouté de champignons ouvre le menu d'automne.", "Món súp kem nấm mở đầu thực đơn mùa thu."),
    t("le fromage au lait cru", "phô mai làm từ sữa tươi chưa tiệt trùng", "Pizza", "Le camembert de Normandie est un fromage au lait cru.", "Camembert vùng Normandie là phô mai làm từ sữa tươi."),
    t("le sommelier", "chuyên gia rượu vang", "Wine", "Le sommelier nous a conseillé un vin de Bourgogne.", "Chuyên gia rượu vang đã gợi ý cho chúng tôi một chai vang Bourgogne."),
    t("l'huile de première pression", "dầu ép lạnh lần đầu", "GlassWater", "Il assaisonne ses salades avec une huile de première pression à froid.", "Anh nêm salad bằng dầu ép lạnh lần đầu.", "f"),
    t("la pâtisserie fine", "bánh ngọt cao cấp", "Cookie", "Les macarons sont un classique de la pâtisserie fine française.", "Bánh macaron là món kinh điển của bánh ngọt cao cấp Pháp."),
    t("le pain au levain", "bánh mì men tự nhiên", "Wheat", "Le pain au levain se conserve plusieurs jours.", "Bánh mì men tự nhiên để được nhiều ngày."),
    t("la crêpe flambée", "bánh crêpe đốt rượu", "CookingPot", "Le serveur a préparé la crêpe flambée devant nous.", "Người phục vụ đốt rượu chiếc bánh crêpe ngay trước mặt chúng tôi."),
    t("l'accord mets-vins", "sự kết hợp món ăn và rượu", "Martini", "Le menu dégustation propose un accord mets-vins pour chaque plat.", "Thực đơn nếm thử gợi ý một cách kết hợp rượu cho từng món.", "m"),
  ] },
  { ma: "tv-hang-hai", ten: "Biển và hàng hải", tenFr: "La mer et la navigation", cap: "C2", tu: [
    t("le balisage maritime", "hệ thống đèn hiệu hàng hải", "TowerControl", "Le balisage maritime guide les navires à l'entrée du port.", "Hệ thống đèn hiệu dẫn tàu vào cảng."),
    t("le mouillage", "chỗ thả neo, sự thả neo", "Anchor", "Le voilier a trouvé un mouillage abrité pour la nuit.", "Chiếc thuyền buồm đã tìm được chỗ thả neo kín gió qua đêm."),
    t("le submersible", "tàu lặn", "Waves", "Le submersible est descendu à plus de quatre mille mètres.", "Tàu lặn đã xuống sâu hơn bốn nghìn mét."),
    t("le sauvetage en mer", "cứu hộ trên biển", "LifeBuoy", "Les bénévoles du sauvetage en mer sortent par tous les temps.", "Tình nguyện viên cứu hộ trên biển ra khơi bất kể thời tiết."),
    t("la liaison maritime", "tuyến tàu biển", "Ship", "Une liaison maritime relie Marseille à la Corse chaque jour.", "Một tuyến tàu biển nối Marseille với đảo Corse mỗi ngày."),
    t("le timonier", "người cầm lái tàu", "ShipWheel", "Le timonier a maintenu le cap malgré la houle.", "Người cầm lái đã giữ vững hướng đi bất chấp sóng lừng."),
    t("la détection radar", "phát hiện bằng ra-đa", "Radar", "La détection radar a permis d'éviter la collision.", "Nhờ phát hiện bằng ra-đa mà tránh được va chạm."),
    t("la pêche hauturière", "đánh bắt xa bờ", "Fish", "La pêche hauturière oblige les marins à partir plusieurs semaines.", "Đánh bắt xa bờ buộc ngư dân ra khơi nhiều tuần."),
    t("le scaphandrier", "thợ lặn mặc đồ lặn nặng", "HardHat", "Le scaphandrier inspecte la coque du navire.", "Người thợ lặn kiểm tra thân tàu."),
    t("la régate", "cuộc đua thuyền buồm", "Sailboat", "La régate a été annulée à cause du vent trop fort.", "Cuộc đua thuyền buồm bị huỷ vì gió quá mạnh."),
  ] },
  { ma: "tv-thien-van", ten: "Thiên văn học", tenFr: "L'astronomie", cap: "C2", tu: [
    t("la galaxie spirale", "thiên hà xoắn ốc", "Orbit", "Andromède est une galaxie spirale voisine de la nôtre.", "Andromeda là một thiên hà xoắn ốc láng giềng của chúng ta."),
    t("la queue de comète", "đuôi sao chổi", "Sparkles", "La queue de comète s'étire sur des millions de kilomètres.", "Đuôi sao chổi trải dài hàng triệu cây số."),
    t("l'éclipse totale", "nhật thực toàn phần", "Moon", "Lors de l'éclipse totale, le jour s'est assombri en plein midi.", "Khi nhật thực toàn phần, trời tối sầm giữa trưa.", "f"),
    t("la ceinture d'astéroïdes", "vành đai tiểu hành tinh", "Flame", "La ceinture d'astéroïdes se situe entre Mars et Jupiter.", "Vành đai tiểu hành tinh nằm giữa sao Hoả và sao Mộc."),
    t("l'apesanteur", "tình trạng không trọng lượng", "Rocket", "En apesanteur, la moindre goutte d'eau flotte dans la cabine.", "Trong tình trạng không trọng lượng, giọt nước nhỏ nhất cũng lơ lửng trong khoang.", "f"),
    t("la carte du ciel", "bản đồ sao", "Star", "Avec une carte du ciel, on repère facilement les constellations.", "Có bản đồ sao thì dễ dàng nhận ra các chòm sao."),
    t("l'horizon des événements", "chân trời sự kiện (hố đen)", "Circle", "Au-delà de l'horizon des événements, rien ne peut ressortir.", "Vượt qua chân trời sự kiện thì không gì thoát ra được.", "m"),
    t("la lunette astronomique", "kính thiên văn khúc xạ", "Telescope", "Galilée a observé les lunes de Jupiter avec une lunette astronomique.", "Galileo đã quan sát các mặt trăng của sao Mộc bằng kính thiên văn khúc xạ."),
    t("la nébuleuse planétaire", "tinh vân hành tinh", "Cloud", "Une nébuleuse planétaire se forme à la mort d'une étoile.", "Tinh vân hành tinh hình thành khi một ngôi sao chết đi."),
    t("la mise en orbite", "việc đưa vào quỹ đạo", "Plane", "La mise en orbite du satellite a été retardée de deux jours.", "Việc đưa vệ tinh vào quỹ đạo đã bị hoãn hai ngày."),
  ] },
  { ma: "tv-khao-co", ten: "Lịch sử và khảo cổ", tenFr: "L'histoire et l'archéologie", cap: "C2", tu: [
    t("le site archéologique", "di chỉ khảo cổ", "Triangle", "Le site archéologique a livré des objets vieux de cinq mille ans.", "Di chỉ khảo cổ đã cho ra những hiện vật năm nghìn năm tuổi."),
    t("la paléographie", "cổ tự học", "ScrollText", "La paléographie permet de dater un manuscrit à partir de son écriture.", "Cổ tự học cho phép định niên đại thủ bản dựa vào nét chữ."),
    t("l'embaumement", "thuật ướp xác", "Ghost", "Les Égyptiens maîtrisaient parfaitement l'embaumement.", "Người Ai Cập thông thạo thuật ướp xác.", "m"),
    t("la datation au carbone", "định tuổi bằng carbon", "Bone", "La datation au carbone a révélé l'âge réel de l'ossement.", "Phép định tuổi bằng carbon đã cho biết tuổi thật của mẩu xương."),
    t("la monarchie absolue", "chế độ quân chủ chuyên chế", "Crown", "Louis XIV incarne la monarchie absolue.", "Louis XIV là hiện thân của chế độ quân chủ chuyên chế."),
    t("la cotte de mailles", "áo giáp lưới", "HardHat", "La cotte de mailles protégeait des coups d'épée.", "Áo giáp lưới bảo vệ trước những nhát kiếm."),
    t("la chronologie", "niên biểu", "Hourglass", "Établir la chronologie des faits est la première tâche de l'historien.", "Lập niên biểu các sự kiện là việc đầu tiên của nhà sử học."),
    t("l'adoubement", "lễ phong tước hiệp sĩ", "Sword", "L'adoubement faisait d'un jeune noble un chevalier.", "Lễ phong tước biến một quý tộc trẻ thành hiệp sĩ.", "m"),
    t("la chevalerie", "tinh thần hiệp sĩ", "Swords", "Les romans de chevalerie ont nourri l'imaginaire médiéval.", "Tiểu thuyết hiệp sĩ đã nuôi dưỡng trí tưởng tượng thời Trung cổ."),
    t("le blason", "huy hiệu dòng họ", "Shield", "Le blason de la famille figurait sur chaque bouclier.", "Huy hiệu dòng họ được vẽ trên mỗi tấm khiên."),
  ] },
  { ma: "tv-tai-chinh", ten: "Tài chính và bảo hiểm", tenFr: "La finance", cap: "C2", tu: [
    t("la valeur refuge", "tài sản trú ẩn an toàn", "Coins", "En période d'incertitude, l'or reste une valeur refuge.", "Trong lúc bất ổn, vàng vẫn là tài sản trú ẩn an toàn."),
    t("la chaîne de blocs", "chuỗi khối (blockchain)", "Bitcoin", "Chaque transaction est inscrite dans la chaîne de blocs.", "Mỗi giao dịch được ghi vào chuỗi khối."),
    t("le chèque sans provision", "séc không đủ tiền", "NotebookPen", "Émettre un chèque sans provision peut entraîner une interdiction bancaire.", "Phát hành séc không đủ tiền có thể bị cấm giao dịch ngân hàng."),
    t("le retrait d'espèces", "việc rút tiền mặt", "Banknote", "Le retrait d'espèces à l'étranger entraîne des frais.", "Rút tiền mặt ở nước ngoài bị tính phí."),
    t("le prêt immobilier", "khoản vay mua nhà", "House", "Ils ont souscrit un prêt immobilier sur vingt-cinq ans.", "Họ đã ký một khoản vay mua nhà kỳ hạn hai mươi lăm năm."),
    t("le placement financier", "khoản đầu tư tài chính", "Briefcase", "Ce placement financier rapporte trois pour cent par an.", "Khoản đầu tư tài chính này sinh lời ba phần trăm mỗi năm."),
    t("la cessation de paiements", "tình trạng mất khả năng thanh toán", "TrendingDown", "L'entreprise s'est déclarée en cessation de paiements.", "Công ty đã tuyên bố mất khả năng thanh toán."),
    t("la banque centrale", "ngân hàng trung ương", "Percent", "La banque centrale a relevé ses taux pour freiner l'inflation.", "Ngân hàng trung ương đã nâng lãi suất để kiềm chế lạm phát."),
    t("le taux de change", "tỷ giá hối đoái", "Euro", "Le taux de change de l'euro a chuté face au dollar.", "Tỷ giá đồng euro đã giảm so với đô la."),
    t("la caution", "sự bảo lãnh", "Umbrella", "Ses parents se sont portés caution pour son appartement.", "Bố mẹ cô đã đứng ra bảo lãnh cho căn hộ của cô."),
  ] },
  { ma: "tv-nong-nghiep", ten: "Nông nghiệp", tenFr: "L'agriculture", cap: "C2", tu: [
    t("le machinisme agricole", "cơ giới hoá nông nghiệp", "Tractor", "Le machinisme agricole a vidé les campagnes de leur main-d'œuvre.", "Cơ giới hoá nông nghiệp đã làm nông thôn vắng bóng lao động."),
    t("le rendement à l'hectare", "năng suất trên mỗi héc-ta", "Wheat", "Le rendement à l'hectare a baissé à cause de la sécheresse.", "Năng suất trên mỗi héc-ta giảm vì hạn hán."),
    t("l'épandage", "việc rải phân bón", "Shovel", "L'épandage est interdit à proximité des cours d'eau.", "Rải phân bị cấm ở gần sông suối.", "m"),
    t("l'exploitation agricole", "trang trại, cơ sở sản xuất nông nghiệp", "Warehouse", "Elle a repris l'exploitation agricole de ses parents.", "Cô đã tiếp quản trang trại của bố mẹ.", "f"),
    t("l'ensilage", "ủ chua thức ăn gia súc", "Cylinder", "L'ensilage permet de nourrir le bétail tout l'hiver.", "Ủ chua thức ăn giúp nuôi gia súc suốt mùa đông.", "m"),
    t("l'engrais azoté", "phân đạm", "Sprout", "L'abus d'engrais azoté pollue les nappes phréatiques.", "Lạm dụng phân đạm làm ô nhiễm mạch nước ngầm.", "m"),
    t("la culture hors-sol", "canh tác không đất", "Home", "La culture hors-sol consomme beaucoup moins d'eau.", "Canh tác không đất tiêu thụ ít nước hơn nhiều."),
    t("l'apiculture", "nghề nuôi ong", "Hexagon", "L'apiculture souffre de la disparition des abeilles.", "Nghề nuôi ong bị ảnh hưởng vì ong ngày càng biến mất.", "f"),
    t("le labour", "việc cày đất", "Axe", "Certains agriculteurs renoncent au labour pour protéger les sols.", "Một số nông dân bỏ cày đất để bảo vệ thổ nhưỡng."),
    t("l'irrigation goutte-à-goutte", "tưới nhỏ giọt", "Droplets", "L'irrigation goutte-à-goutte réduit le gaspillage d'eau.", "Tưới nhỏ giọt giảm lãng phí nước.", "f"),
  ] },
  { ma: "tv-thoi-trang", ten: "Thời trang cao cấp", tenFr: "La haute couture", cap: "C2", tu: [
    t("la confection", "ngành may mặc", "Cog", "La confection a été délocalisée en grande partie vers l'Asie.", "Ngành may mặc phần lớn đã chuyển sang châu Á."),
    t("la couture à la main", "khâu tay", "Circle", "Les finitions sont réalisées en couture à la main.", "Các chi tiết hoàn thiện được làm bằng khâu tay."),
    t("le fil de soie", "chỉ tơ tằm", "Disc", "La doublure est cousue au fil de soie.", "Lớp lót được khâu bằng chỉ tơ tằm."),
    t("le moulage", "kỹ thuật dựng mẫu trên ma-nơ-canh", "PersonStanding", "Le moulage permet de travailler le tissu directement sur le buste.", "Kỹ thuật dựng mẫu cho phép xử lý vải ngay trên ma-nơ-canh."),
    t("la collection printemps-été", "bộ sưu tập xuân hè", "Sparkles", "La collection printemps-été a été présentée à Paris.", "Bộ sưu tập xuân hè đã được giới thiệu ở Paris."),
    t("le point de couture", "mũi khâu", "Pin", "Un point de couture invisible ferme l'ourlet.", "Một mũi khâu ẩn khép đường viền gấu."),
    t("le sur-mesure", "may đo", "Ruler", "Ce tailleur ne travaille qu'en sur-mesure.", "Người thợ may này chỉ nhận may đo."),
    t("l'étoffe", "vải vóc", "Layers", "Le couturier a choisi une étoffe précieuse pour la robe de mariée.", "Nhà thiết kế đã chọn một loại vải quý cho váy cưới.", "f"),
    t("la broderie d'art", "thêu nghệ thuật", "Flower2", "Cet atelier de broderie d'art travaille pour les grandes maisons.", "Xưởng thêu nghệ thuật này làm cho các nhà mốt lớn."),
    t("la note de tête", "hương đầu (nước hoa)", "SprayCan", "La note de tête s'évapore en quelques minutes.", "Hương đầu bay hơi trong vài phút."),
  ] },
];

/* Trình độ có chủ đề, theo thứ tự hiện trên danh sách. */
export const CAP_TU_VUNG = [...new Set(CHU_DE_TU_VUNG.map((c) => c.cap))];

export const timChuDe = (ma) => CHU_DE_TU_VUNG.find((c) => c.ma === ma) ?? null;

/* Mạo từ đứng đầu từ: "le" | "la" | "l'" | "les" ("" nếu không có, bộ kiểm không cho phép). */
export const maoTu = (fr) => (/^les /.test(fr) ? "les" : /^le /.test(fr) ? "le" : /^la /.test(fr) ? "la" : /^l['’]/.test(fr) ? "l'" : "");
/* Phần còn lại sau mạo từ: « le croissant » → « croissant », « l'œuf » → « œuf ». */
export const boMaoTu = (fr) => fr.replace(/^(les |le |la |l['’])/, "");
/* Giống của từ: m (đực), f (cái), pl (số nhiều). */
export const giongTu = (tu) => tu.g ?? { le: "m", la: "f", les: "pl" }[maoTu(tu.fr)] ?? "";
export const MAO_TU = ["le", "la", "l'", "les"];

/* So bài gõ: không phân biệt hoa thường, dấu nháy cong hay thẳng, khoảng trắng thừa; « oe » được
   nhận cho « œ » (bàn phím thường không có). DẤU vẫn tính: « ecole » khác « école ». */
export const chuanGo = (s) => String(s ?? "").toLowerCase().replace(/[’‘ʼ]/g, "'").replace(/œ/g, "oe").replace(/\s*'\s*/g, "'").replace(/\s+/g, " ").trim();
export const goDung = (go, tu) => chuanGo(go) === chuanGo(tu.fr);

const tron = (ds, rnd) => {
  const a = [...ds];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/* Sinh bài luyện của một chủ đề. Mỗi từ được hỏi ít nhất một lần:
 *   hinh : đọc (nghe) từ → chọn đúng HÌNH trong 4 hình
 *   tu   : nhìn hình → chọn đúng TỪ trong 4 từ
 *   mao  : nhìn hình + từ bỏ mạo từ → chọn le / la / l' / les
 *   go   : nhìn hình + nghĩa → GÕ từ kèm mạo từ
 * Phương án nhiễu lấy từ cùng chủ đề. `rnd` truyền vào để bộ kiểm chạy lặp lại được. */
export function taoBaiTap(chuDe, rnd = Math.random) {
  const tu = tron(chuDe.tu, rnd);
  const nua = Math.ceil(tu.length / 2);
  const chon4 = (dung) => {
    const pa = tron([dung, ...tron(chuDe.tu.filter((x) => x !== dung), rnd).slice(0, 3)], rnd);
    return { pa, dap: pa.indexOf(dung) };
  };
  const ds = [
    ...tu.slice(0, nua).map((x) => ({ loai: "hinh", tu: x, ...chon4(x) })),
    ...tu.slice(nua).map((x) => ({ loai: "tu", tu: x, ...chon4(x) })),
  ];
  const them = tron(chuDe.tu, rnd);
  them.slice(0, 3).forEach((x) => ds.push({ loai: "mao", tu: x, pa: MAO_TU, dap: MAO_TU.indexOf(maoTu(x.fr)) }));
  them.slice(3, 6).forEach((x) => ds.push({ loai: "go", tu: x }));
  return ds;
}
