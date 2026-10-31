/* Địa danh của Tour de France trong « Le Grand Quiz de France » (31/10).
 * lon, lat là toạ độ thật, bản đồ tự chiếu ra màn hình nên thêm nơi mới không phải đo vị trí tay.
 * loai: di_tich | am_thuc | thien_nhien | lich_su | van_hoa. sao 1–3: nơi nhiều sao nhân điểm cao hơn.
 * mo: một câu Léon giới thiệu, hiện TRƯỚC khi chọn nên không được lộ đáp án.
 * Nơi chưa có câu ở mức đang chơi vẫn hiện trên bản đồ nhưng mờ đi, không chọn được. */

export const DIA_DANH = [
  { id: "paris", ten: "Paris", vung: "ile-de-france", lon: 2.35, lat: 48.86, loai: "di_tich", sao: 1, mo: "Trường quay Studio 1, nơi chuyến đi bắt đầu và kết thúc." },
  { id: "lille", ten: "Lille", vung: "nord", lon: 3.06, lat: 50.63, loai: "van_hoa", sao: 1, mo: "Thủ phủ miền Bắc, gần biên giới Bỉ." },
  { id: "reims", ten: "Reims", vung: "nord", lon: 4.03, lat: 49.25, loai: "di_tich", sao: 2, mo: "Thành phố của nhà thờ lớn và những hầm rượu sâu dưới đất." },
  { id: "plages-debarquement", ten: "Plages du Débarquement", vung: "normandie", lon: -0.87, lat: 49.37, loai: "lich_su", sao: 2, mo: "Những bãi cát dài của Normandie vẫn giữ một trang sử lớn." },
  { id: "pays-auge", ten: "Pays d'Auge", vung: "normandie", lon: 0.15, lat: 49.1, loai: "am_thuc", sao: 1, mo: "Đồi xanh, vườn táo, và những đàn bò vùng Normandie." },
  { id: "mont-saint-michel", ten: "Mont-Saint-Michel", vung: "normandie", lon: -1.51, lat: 48.64, loai: "di_tich", sao: 2, mo: "Một hòn đảo đá giữa vịnh, thủy triều lên xuống rất nhanh." },
  { id: "quimper", ten: "Quimper", vung: "bretagne", lon: -4.1, lat: 48.0, loai: "am_thuc", sao: 1, mo: "Thành phố Bretagne với gốm vẽ tay và mùi bơ mặn." },
  { id: "nantes", ten: "Nantes", vung: "loire", lon: -1.55, lat: 47.22, loai: "van_hoa", sao: 1, mo: "Thành phố bên cửa sông, quê của một nhà văn viễn tưởng lừng danh." },
  { id: "orleans", ten: "Orléans", vung: "loire", lon: 1.9, lat: 47.9, loai: "lich_su", sao: 2, mo: "Thành phố bên sông, từng bị vây hãm trong một cuộc chiến dài." },
  { id: "amboise", ten: "Amboise", vung: "loire", lon: 0.98, lat: 47.41, loai: "lich_su", sao: 2, mo: "Thị trấn hoàng gia, cách lâu đài Chenonceau một quãng ngắn." },
  { id: "chambord", ten: "Chambord", vung: "loire", lon: 1.52, lat: 47.62, loai: "di_tich", sao: 3, mo: "Lâu đài Phục Hưng lớn nhất thung lũng Loire." },
  { id: "strasbourg", ten: "Strasbourg", vung: "est", lon: 7.75, lat: 48.58, loai: "van_hoa", sao: 2, mo: "Thành phố giữa hai nền văn hoá, nhìn sang bờ sông Rhin." },
  { id: "nancy", ten: "Nancy", vung: "est", lon: 6.18, lat: 48.69, loai: "am_thuc", sao: 1, mo: "Quảng trường vàng rực và bếp ăn đậm chất Lorraine." },
  { id: "besancon", ten: "Besançon", vung: "est", lon: 6.02, lat: 47.24, loai: "van_hoa", sao: 3, mo: "Thành phố đồng hồ, nơi một đại văn hào cất tiếng khóc chào đời." },
  { id: "lyon", ten: "Lyon", vung: "alpes", lon: 4.83, lat: 45.76, loai: "am_thuc", sao: 2, mo: "Nơi hai con sông gặp nhau, được gọi là thủ đô ẩm thực." },
  { id: "annecy", ten: "Annecy", vung: "alpes", lon: 6.13, lat: 45.9, loai: "am_thuc", sao: 1, mo: "Hồ nước trong vắt dưới chân núi xứ Savoie." },
  { id: "chamonix", ten: "Chamonix", vung: "alpes", lon: 6.87, lat: 45.92, loai: "thien_nhien", sao: 2, mo: "Thị trấn leo núi nằm dưới những đỉnh cao nhất nước Pháp." },
  { id: "puy-de-dome", ten: "Puy de Dôme", vung: "massif-central", lon: 2.96, lat: 45.77, loai: "thien_nhien", sao: 2, mo: "Núi lửa đã ngủ giữa miền Trung nước Pháp." },
  { id: "bordeaux", ten: "Bordeaux", vung: "sud-ouest", lon: -0.58, lat: 44.84, loai: "am_thuc", sao: 1, mo: "Cảng sông cổ, bao quanh là những đồi nho ngút mắt." },
  { id: "dune-pilat", ten: "Dune du Pilat", vung: "sud-ouest", lon: -1.22, lat: 44.59, loai: "thien_nhien", sao: 2, mo: "Một bức tường cát khổng lồ giữa rừng thông và đại dương." },
  { id: "biarritz", ten: "Biarritz", vung: "sud-ouest", lon: -1.56, lat: 43.48, loai: "van_hoa", sao: 1, mo: "Sóng lớn, ván lướt và xứ Basque ngay sát bên." },
  { id: "gavarnie", ten: "Gavarnie", vung: "sud-ouest", lon: -0.01, lat: 42.74, loai: "thien_nhien", sao: 2, mo: "Vách núi hình lòng chảo ở sát biên giới phía Nam." },
  { id: "toulouse", ten: "Toulouse", vung: "sud-ouest", lon: 1.44, lat: 43.6, loai: "am_thuc", sao: 2, mo: "Thành phố của máy bay, rugby và những bức tường rực nắng." },
  { id: "carcassonne", ten: "Carcassonne", vung: "occitanie", lon: 2.35, lat: 43.21, loai: "di_tich", sao: 2, mo: "Một thành trì trung cổ với hai vòng tường bao." },
  { id: "avignon", ten: "Avignon", vung: "provence", lon: 4.81, lat: 43.95, loai: "lich_su", sao: 2, mo: "Thành phố từng là nơi ở của các giáo hoàng." },
  { id: "valensole", ten: "Valensole", vung: "provence", lon: 5.98, lat: 43.84, loai: "thien_nhien", sao: 1, mo: "Cao nguyên Provence, đầu hè cả vùng đổi màu." },
  { id: "marseille", ten: "Marseille", vung: "provence", lon: 5.37, lat: 43.3, loai: "am_thuc", sao: 2, mo: "Cảng biển lâu đời, ồn ào và đầy nắng." },
  { id: "cannes", ten: "Cannes", vung: "cote-azur", lon: 7.02, lat: 43.55, loai: "van_hoa", sao: 1, mo: "Thảm đỏ, du thuyền và những ngôi sao mỗi tháng Năm." },
  { id: "nice", ten: "Nice", vung: "cote-azur", lon: 7.27, lat: 43.7, loai: "am_thuc", sao: 1, mo: "Vịnh Thiên Thần và những khu chợ thơm mùi rau củ." },
  { id: "ajaccio", ten: "Ajaccio", vung: "corse", lon: 8.74, lat: 41.93, loai: "lich_su", sao: 3, mo: "Thành phố đảo Corse, quê hương một vị hoàng đế." },
];

/* Lời MC theo mức. tu: đoạn mở đầu Tour; thang, thua: lời kết. */
/* Lời bà Minette sau mỗi lượt đi. {noi} là tên địa danh. */
export const LOI_MINETTE = {
  chiem: ["Merci beaucoup ! {noi} là của ta rồi.", "{noi} ư? Dễ như ăn một chiếc croissant.", "Cờ của ta đã cắm ở {noi}. À toi, mon petit !", "Ta tới {noi} trước nhé. Le chat gagne toujours."],
  hut: ["Hừm, câu hỏi ở {noi} khó thật. Ta sẽ quay lại.", "Zut ! Ta chưa giữ được {noi}.", "{noi} hôm nay không chiều ta. Mais ce n'est pas fini !"],
  mat: ["Sao? Bạn dám lấy lại {noi} của ta? Impressionnant.", "Oh là là ! Cờ của ta ở {noi} đâu rồi?"],
};

export const LOI_MUC = {
  de: {
    mo: "Bonsoir la France ! Ta là Léon, MC của « Le Grand Quiz de France ». Năm nay trường quay lên đường: bạn tự chọn từng điểm dừng trên bản đồ, đua cùng bà Minette, mèo vô địch ba mùa liền, rồi về Paris dự chung kết.",
    thang: "Ban tổ chức tuyên bố bạn hoàn thành Tour! Bà Minette suýt làm rơi kính râm, còn khán giả trường quay hô vang tên bạn.",
    thua: "Lần này bà Minette hơn ta một chút. Ăn một chiếc crêpe cho lại sức rồi lên đường lại nhé!",
  },
  vua: {
    mo: "Hạng « Moyen »: từ giờ MC Léon hỏi bằng tiếng Pháp! Chọn điểm dừng thật khôn, đọc câu hỏi thật kỹ. Nghe nói bà Minette đã lén học thuộc cả sách địa lý.",
    thang: "Bravo ! Cả Tour hỏi bằng tiếng Pháp mà vẫn thắng! Bà Minette hỏi bạn học ở đâu. MC Léon nháy mắt: « Fracile, évidemment ! »",
    thua: "Tiếng Pháp nghe nhanh quá phải không? Đọc lại lời giải, lần sau chắc chắn thắng.",
  },
  kho: {
    mo: "Hạng « Difficile »! Lịch sử, văn học và nước Pháp hôm nay, câu hỏi dài và khó. Bà Minette diện váy dạ hội chờ bạn ở chung kết. Allez !",
    thang: "BẠN LÀ NHÀ VÔ ĐỊCH « LE GRAND QUIZ DE FRANCE » ! Pháo giấy tung bay, bà Minette trao cúp tận tay. MC Léon xúc động: « Mesdames et messieurs, le trophée change de mains ! »",
    thua: "Chỉ thiếu chút xíu! Bà Minette giữ cúp thêm một mùa. Nhưng chung kết luôn chờ người dám quay lại.",
  },
};
