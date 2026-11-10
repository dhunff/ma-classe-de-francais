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
