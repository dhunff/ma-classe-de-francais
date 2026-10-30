/* Nội dung riêng từng tháng « Một năm ở Paris » (31/10, giai đoạn 3). Khoá là chỉ số tháng (3 = tháng 12).
 *   mo: Léon mở đầu tháng. tuyet: rơi tuyết ở đầu màn.
 *   tuan[k]: việc xảy ra SAU tuần k, theo thứ tự. loai "su" dùng khuôn cảnh rẽ nhánh (parisNhanh.js),
 *   "mini" là mua đồ theo ghi chú (món đúng có cho hoặc dung), "thu" là thư nhà. id không trùng nhau: chạy một lần trong ván.
 * KHÔNG dùng dấu gạch dài (quy tắc 7). */
export const LICH_THANG = {
  0: {
    mo: "Tháng đầu tiên! Mọi thứ đều mới: tiền Euro, métro, cách chào hỏi. Tháng này cứ đi đâu cũng có chuyện để học.",
    tuan: {
      1: [{
        loai: "mini", id: "sep_mua", ngan: 40,
        loi: "Phòng ký túc trống trơn. Với 40 €, mua đủ ba thứ cần nhất nhé. Ta ghi danh sách bằng tiếng Pháp.",
        ghi: ["Il te faut une couverture pour dormir.", "Il te faut de quoi manger le matin.", "Il te faut une lampe pour étudier."],
        hang: [
          { ten: "Couverture chaude", gia: 18, dung: true },
          { ten: "Lampe de bureau", gia: 12, dung: true },
          { ten: "Paquet de céréales", gia: 4, dung: true },
          { ten: "Parapluie", gia: 9 },
          { ten: "Tapis de sol", gia: 15 },
          { ten: "Bouteille de vin", gia: 8 },
        ],
      }],
      3: [{
        loai: "su", id: "sep_rentree", ai: "laurent", noi: "Amphithéâtre · rentrée",
        tinh: "Ngày khai giảng. Giáo sư Laurent đọc tên và hỏi vì sao bạn tới Pháp.",
        noi_: "Pourquoi avez-vous choisi la France ?",
        lua: [
          { c: "Parce que j'aime la langue française et je veux étudier ici.", tot: true, kq: { than: 1, phap: 2 }, dap: "Excellente raison. Bienvenue.", ghi: "« Parce que » trả lời cho « pourquoi »." },
          { c: "Je ne sais pas, c'est comme ça.", tot: true, kq: { tt: -2 }, dap: "Il faudra trouver une réponse.", ghi: "Câu đúng, nhưng thiếu thiện chí trong ngày đầu." },
          { c: "Pour toi, madame.", tot: false, kq: { than: -1 }, dap: "Pardon ?", ghi: "« toi » với giáo sư là sai, và câu cũng chẳng có nghĩa." },
        ],
      }],
    },
  },
  1: {
    mo: "Tháng 10, lá vàng rơi ở Luxembourg. Thành phố mở cửa thâu đêm một lần trong năm, đừng bỏ lỡ.",
    tuan: {
      1: [{
        loai: "su", id: "oct_nuit", ai: null, nguoi: "Une artiste", noi: "Nuit Blanche · Hôtel de Ville",
        tinh: "Đêm Trắng: bảo tàng và quảng trường mở tới sáng. Một nghệ sĩ hỏi cảm nghĩ của bạn về tác phẩm.",
        noi_: "Alors, qu'est-ce que vous en pensez ?",
        lua: [
          { c: "Je trouve ça très beau, ça me rappelle mon pays.", tot: true, kq: { tt: 10, nl: -5, phap: 2 }, dap: "Quel beau compliment, merci !", ghi: "« Ça me rappelle » là nó gợi tôi nhớ tới. « en » trong câu hỏi thay cho « tác phẩm »." },
          { c: "Je n'y comprends rien, désolé{e}.", tot: true, kq: { tt: 4 }, dap: "Moi non plus, parfois !", ghi: "Người Pháp thích sự thẳng thắn có duyên." },
        ],
      }],
    },
  },
  2: {
    mo: "Tháng 11 ở Paris xám và mưa. Ai mới sang cũng thấy buồn tháng này, giữ tinh thần nhé.",
    tuan: {
      2: [{
        loai: "su", id: "nov_suoi", ai: null, nguoi: "Le gestionnaire", noi: "Au téléphone",
        tinh: "Lò sưởi trong phòng hỏng ba ngày rồi. Bạn gọi người quản lý.",
        noi_: "Résidence, bonjour. Je vous écoute.",
        lua: [
          { c: "Bonjour, le chauffage ne fonctionne plus dans ma chambre depuis trois jours.", tot: true, kq: { phap: 3, tt: 3 }, dap: "Je vous envoie un technicien demain matin.", ghi: "« depuis » + thời gian với thì hiện tại: việc vẫn đang tiếp diễn." },
          { c: "Il fait froid.", tot: true, kq: { nl: -8 }, dap: "Oui, c'est l'hiver…", ghi: "Quá mơ hồ, họ không hiểu bạn cần gì." },
          { c: "Votre résidence est nulle !", tot: false, kq: { tt: -4, nl: -8 }, dap: "Je ne peux pas vous aider sur ce ton.", ghi: "Giận dữ không sửa được lò sưởi." },
        ],
      }],
    },
  },
  4: {
    tuyet: true,
    mo: "Bonne année! Tháng 1 lạnh nhất, nhưng có một món bánh khiến cả nước Pháp vui.",
    tuan: {
      1: [{
        loai: "su", id: "jan_galette", ai: "camille", noi: "Chez Camille",
        tinh: "Galette des rois: ai ăn trúng hạt đậu (la fève) sẽ thành vua. Bạn vừa cắn phải thứ gì cứng!",
        noi_: "Oh ! Tu as la fève ? Tu dois choisir ton roi !",
        lua: [
          { c: "Oui ! Je te choisis, Camille, tu seras ma reine.", tot: true, kq: { tt: 10, than: 1 }, dap: "Vive le roi ! Vive la reine !", ghi: "Phong tục Épiphanie: người có fève được đội vương miện giấy và chọn bạn đồng hành." },
          { c: "Aïe, ma dent ! C'est quoi, ça ?", tot: true, kq: { tt: 5, phap: 1 }, dap: "Ha ha ! C'est la tradition !", ghi: "Phản ứng tự nhiên, cả bàn bật cười." },
        ],
      }],
    },
  },
  5: {
    mo: "Tháng 2 là tháng dài nhất với người xa nhà, và Tết đang tới. Khu 13e rộn ràng lắm, đi xem đi.",
    tuan: {
      2: [{
        loai: "su", id: "fev_tet", ai: "yuki", noi: "Avenue d'Ivry · 13e",
        tinh: "Giao thừa ở quận 13. Yuki đi cùng, tò mò hỏi về Tết.",
        noi_: "C'est quoi, le Têt, pour toi ?",
        lua: [
          { c: "C'est la fête la plus importante : toute la famille se retrouve.", tot: true, kq: { tt: 12, than: 1, phap: 3 }, dap: "C'est beau. Ta famille doit te manquer.", ghi: "So sánh nhất: « la plus importante ». Nói về văn hoá mình bằng tiếng Pháp là tiến bộ lớn." },
          { c: "Je préfère ne pas en parler, ça me rend triste.", tot: true, kq: { tt: -3 }, dap: "Je comprends. Je reste avec toi.", ghi: "Được phép buồn. « en » thay cho « về chuyện đó »." },
        ],
      }],
    },
  },
  6: {
    mo: "Xuân về rồi! Nửa chặng đường đã qua. Hoa bắt đầu nở, và kỳ giữa năm cũng tới.",
    tuan: {
      1: [{
        loai: "su", id: "mar_prefecture", ai: null, nguoi: "L'agent", noi: "Préfecture · file d'attente",
        tinh: "Thẻ cư trú sắp hết hạn. Bạn chờ ba giờ, và bị nói thiếu một giấy.",
        noi_: "Il vous manque une attestation de domicile.",
        lua: [
          { c: "Je comprends. Puis-je vous l'envoyer par courrier ou dois-je revenir ?", tot: true, kq: { phap: 3, nl: -6 }, dap: "Par courrier, cela suffira.", ghi: "Hỏi rõ cách xử lý. « vous l' » : gián tiếp trước trực tiếp." },
          { c: "C'est pas possible ! J'attends depuis trois heures !", tot: true, kq: { tt: -6, nl: -8 }, dap: "Je n'y peux rien. Suivant !", ghi: "Dễ hiểu, nhưng cãi không giúp được gì ở préfecture." },
        ],
      }],
      3: [{
        loai: "thu", id: "mar_thu", tu: "Bố",
        van: "Con à, bố đọc thư con gửi cô giáo rồi, tiến bộ lắm. Mùa này ở nhà nồm, chắc Paris đẹp hơn. Viết thêm cho cô vài dòng về tháng này nhé.",
        cau: [
          { truoc: "Ce mois-ci, j'ai surtout", sau: ".", kieu: "thuc" },
          { truoc: "Au printemps, les arbres", sau: "en fleurs.", pa: ["sont", "ont", "font"], gt: "« être en fleurs »: đang nở hoa." },
          { truoc: "Je pense", sau: "vous tous les jours.", pa: ["à", "de", "sur"], gt: "« penser à quelqu'un »: nghĩ tới ai." },
        ],
      }],
    },
  },
  7: {
    mo: "Tháng 4! Coi chừng cá trên lưng áo, rồi rủ bạn đi picnic ven sông Marne đi.",
    tuan: {
      0: [{
        loai: "su", id: "avr_cuoi", ai: "camille", noi: "Couloir de la fac",
        tinh: "Ngày 1/4. Camille cười khúc khích, sau lưng bạn có một con cá giấy.",
        noi_: "Tout le monde te regarde… Tu ne sens rien dans ton dos ?",
        lua: [
          { c: "Ah, je vois ! Poisson d'avril !", tot: true, kq: { tt: 8, than: 1 }, dap: "Bien joué ! Ha ha !", ghi: "« Poisson d'avril » là ngày Cá tháng Tư ở Pháp, trẻ con dán cá giấy sau lưng." },
          { c: "Quoi ? Qu'est-ce que j'ai fait ?", tot: true, kq: { tt: 2 }, dap: "Regarde ton dos, idiot{e} !", ghi: "Bạn bị lừa thật rồi, không sao cả." },
        ],
      }],
      2: [{
        loai: "mini", id: "avr_picnic", ngan: 20,
        loi: "Picnic thôi! 20 € mua đồ cho ba người bạn, đọc yêu cầu của họ nhé.",
        ghi: ["Yuki ne mange pas de viande.", "Camille veut quelque chose de sucré.", "M. Dubois apporte le pain, il lui faut du fromage."],
        hang: [
          { ten: "Salade de tomates", gia: 5, cho: "yuki" },
          { ten: "Tarte aux pommes", gia: 7, cho: "camille" },
          { ten: "Camembert", gia: 4, cho: "dubois" },
          { ten: "Saucisson", gia: 6 },
          { ten: "Poulet rôti", gia: 11 },
          { ten: "Chips au sel", gia: 3 },
        ],
      }],
    },
  },
  8: {
    mo: "Tháng 5 nhiều ngày nghỉ nhất năm. Người Paris tặng nhau hoa, và kỳ thi cũng gần kề.",
    tuan: {
      0: [{
        loai: "su", id: "mai_muguet", ai: "dubois", noi: "Résidence · entrée",
        tinh: "Ngày 1/5, người Pháp tặng nhau cành muguet (hoa linh lan). Bạn có một cành, gặp bác Dubois.",
        noi_: "Tiens, bonjour ! Vous avez l'air content.",
        lua: [
          { c: "Bonjour ! Ce muguet est pour vous. Bon 1er mai !", tot: true, kq: { than: 2, tt: 8, tien: -3 }, dap: "Ça alors… Cela porte bonheur, vous savez. Merci.", ghi: "Tặng muguet ngày 1/5 mang lại may mắn. Một cử chỉ nhỏ, bác nhớ lâu." },
          { c: "Bonjour ! Bonne journée !", tot: true, kq: { tt: 1 }, dap: "Bonne journée à vous.", ghi: "Lịch sự, nhưng bỏ lỡ dịp đẹp." },
        ],
      }],
    },
  },
  9: {
    mo: "Tháng 6: thi cuối năm, và ngày dài nhất năm cả Paris hát ngoài phố.",
    tuan: {
      1: [{
        loai: "su", id: "juin_thi", ai: "laurent", noi: "Salle d'examen",
        tinh: "Vào phòng thi vấn đáp. Bạn không hiểu câu hỏi.",
        noi_: "Quel est, selon vous, l'enjeu principal de ce texte ?",
        lua: [
          { c: "Excusez-moi, pourriez-vous reformuler la question ?", tot: true, kq: { than: 1, phap: 3 }, dap: "Bien sûr. Quelle est l'idée la plus importante ?", ghi: "Xin nói lại là kỹ năng thi quan trọng: « reformuler ». « L'enjeu » là vấn đề mấu chốt." },
          { c: "L'enjeu, c'est… euh… un jeu ?", tot: false, kq: { than: -1, tt: -5 }, dap: "Non.", ghi: "« Enjeu » không phải « jeu ». Thà hỏi lại còn hơn đoán." },
        ],
      }],
      2: [{
        loai: "su", id: "juin_nhac", ai: "camille", noi: "Fête de la musique · Bastille",
        tinh: "21/6, nhạc khắp phố. Camille kéo bạn lên hát cùng ban nhạc.",
        noi_: "Viens chanter avec nous !",
        lua: [
          { c: "D'accord, mais je chante très mal !", tot: true, kq: { tt: 14, than: 1, nl: -5 }, dap: "On s'en fiche, allez !", ghi: "« On s'en fiche » giữa bạn bè nghĩa là kệ đi, không sao." },
          { c: "Non merci, je préfère regarder.", tot: true, kq: { tt: 5 }, dap: "Comme tu veux !", ghi: "Vẫn vui, chỉ là ít kỷ niệm hơn." },
        ],
      }],
      3: [{
        loai: "thu", id: "juin_thu", tu: "Mẹ",
        van: "Con ơi, sắp hết năm học rồi. Mẹ mong con lắm. Con kể cô giáo nghe tháng thi cử thế nào nhé.",
        cau: [
          { truoc: "Ce mois-ci, j'ai surtout", sau: ".", kieu: "thuc" },
          { truoc: "Les examens", sau: "très difficiles.", pa: ["étaient", "était", "étions"], gt: "Chủ ngữ số nhiều « les examens » đi với « étaient »." },
          { truoc: "J'espère", sau: "bientôt.", pa: ["vous revoir", "vous revois", "vous reverrai"], gt: "Sau « espérer » cùng chủ ngữ dùng nguyên mẫu." },
        ],
      }],
    },
  },
  10: {
    mo: "Tháng 7! Paris nóng lên, pháo hoa chuẩn bị bay trên tháp Eiffel.",
    tuan: {
      1: [{
        loai: "su", id: "jul_14", ai: "dubois", noi: "Champ-de-Mars · 14 juillet",
        tinh: "Bác Dubois giữ chỗ cho bạn xem pháo hoa, và hỏi điều gì khiến bạn nhớ nhất.",
        noi_: "Alors, quel a été votre plus beau souvenir de Paris ?",
        lua: [
          { c: "Les amis que j'ai rencontrés ici, sans aucun doute.", tot: true, kq: { tt: 10, than: 1, phap: 2 }, dap: "C'est le plus important, en effet.", ghi: "Phân từ hợp với « amis » đứng trước avoir: rencontrés." },
          { c: "La première fois que j'ai parlé français sans avoir peur.", tot: true, kq: { tt: 10, phap: 3 }, dap: "Ah, voilà une belle réponse.", ghi: "Sau « sans » dùng nguyên mẫu." },
        ],
      }],
    },
  },
  11: {
    mo: "Tháng 8, Paris vắng người. Một năm sắp khép lại. Đã đến lúc nghĩ về năm sau.",
    tuan: {
      1: [{
        loai: "su", id: "aout_mai_sau", ai: null, nguoi: "Léon", noi: "Sur les quais de Seine",
        tinh: "Léon ngồi bên bạn trên bờ sông Seine.",
        noi_: "Alors, qu'est-ce que tu vas faire l'année prochaine ?",
        lua: [
          { c: "Je voudrais rester à Paris et trouver un travail.", tot: true, kq: { tt: 3, co: "kq_olai" }, dap: "Paris te gardera, j'en suis sûr.", ghi: "« Je voudrais » nói về mong muốn." },
          { c: "Je vais continuer mes études en master.", tot: true, kq: { tt: 3, co: "kq_hoc" }, dap: "Bravo ! Tu l'as mérité.", ghi: "Tương lai gần: aller + nguyên mẫu." },
          { c: "Je rentrerai au Vietnam ouvrir un café français.", tot: true, kq: { tt: 3, co: "kq_ve" }, dap: "Je viendrai goûter tes croissants !", ghi: "Tương lai đơn: je rentrerai." },
          { c: "Je veux d'abord voyager dans toute la France.", tot: true, kq: { tt: 3, co: "kq_di" }, dap: "Quelle bonne idée, je te donne une liste !", ghi: "« D'abord » là trước hết." },
        ],
      }],
    },
  },
  3: {
    tuyet: true,
    mo: "Tháng 12 rồi! Paris lên đèn, trời lạnh cắt da, và cả thành phố nói về Noël. Coi chừng đình công nhé, người Pháp mùa này hay xuống đường lắm.",
    tuan: {
      0: [{
        loai: "su", id: "dec_vi", ai: null, nguoi: "L'agent de police", noi: "Commissariat · 13e arrondissement",
        tinh: "Bạn sờ túi áo khoác sau khi xuống métro: chiếc ví đã biến mất! Bạn tới đồn cảnh sát.",
        noi_: "Bonjour. Qu'est-ce qui vous amène ?",
        lua: [
          { c: "Bonjour, on m'a volé mon portefeuille dans le métro.", tot: true, kq: { tien: -20, phap: 2 }, dap: "Je prends votre déclaration. Il y avait beaucoup d'argent ?", ghi: "« On m'a volé » là cách nói tự nhiên khi bị móc túi. Khai báo sớm giúp bạn làm lại giấy tờ." },
          { c: "Bonjour, je suis perdu{e} dans le métro.", tot: false, kq: { tien: -40, tt: -4 }, dap: "Vous êtes perdu ? La sortie est à gauche.", ghi: "« Être perdu » là bị lạc, không phải mất đồ. Viên cảnh sát chỉ đường cho bạn, và bạn mất thêm thời gian." },
          { c: "Rendez-moi mon portefeuille !", tot: false, kq: { tien: -40, tt: -6 }, dap: "Calmez-vous. Ce n'est pas moi qui l'ai pris.", ghi: "Mệnh lệnh này nhắm nhầm người. Ở đồn, hãy bình tĩnh trình bày." },
        ],
      }],
      1: [{
        loai: "su", id: "dec_greve", ai: null, nguoi: "Panneau RATP", noi: "Station Place d'Italie",
        tinh: "Sáng nay bạn có kiểm tra. Bảng thông báo ở ga ghi dòng này. Bạn quyết định thế nào?",
        noi_: "Mouvement social : aucun métro sur la ligne 6 ce matin. Les bus 83 et 47 circulent normalement.",
        lua: [
          { c: "Je prends le bus 83.", tot: true, kq: { phap: 2, tt: 3 }, dap: "Vous arrivez à la fac juste à l'heure.", ghi: "« Mouvement social » là cách nói lịch sự của đình công. « Aucun métro » nghĩa là không có chuyến nào." },
          { c: "J'attends le prochain métro.", tot: false, kq: { nl: -10, tt: -6 }, dap: "Vingt minutes plus tard, le quai est toujours vide.", ghi: "« Aucun » là không có chuyến nào cả. Bạn trễ giờ kiểm tra." },
          { c: "Je vais à pied.", tot: true, kq: { nl: -12 }, dap: "Quarante minutes dans le froid, mais vous arrivez.", ghi: "Tới nơi được, nhưng bảng đã ghi có xe buýt." },
        ],
      }],
      2: [{
        loai: "mini", id: "dec_cho", ngan: 30,
        loi: "Chợ Noël ở La Défense! Bạn có 30 € mua quà cho ba người. Ta ghi sẵn sở thích của họ bằng tiếng Pháp, đọc kỹ nhé.",
        ghi: ["Yuki adore le thé.", "Camille préfère le chocolat noir.", "M. Dubois a toujours froid au cou."],
        hang: [
          { ten: "Boîte de thé vert", gia: 9, cho: "yuki" },
          { ten: "Tablette de chocolat noir", gia: 6, cho: "camille" },
          { ten: "Écharpe en laine", gia: 14, cho: "dubois" },
          { ten: "Tablette de chocolat au lait", gia: 6 },
          { ten: "Gants de ski", gia: 18 },
          { ten: "Bougie parfumée", gia: 7 },
          { ten: "Pain d'épices", gia: 5 },
        ],
      }],
      3: [{
        loai: "su", id: "dec_noel", ai: "camille", noi: "Couloir de la fac",
        tinh: "Ngày 23/12. Camille chặn bạn ở hành lang. Cùng lúc, bà Renard vừa nhắn: đêm Noël trả lương gấp đôi.",
        noi_: "Tu fais quoi pour Noël ? Viens chez mes parents, à Lyon !",
        lua: [
          { c: "Avec joie ! Qu'est-ce que je peux apporter ?", tot: true, kq: { tien: -35, tt: 16, than: 2 }, dap: "Rien du tout, juste toi ! Ma mère prépare la bûche.", ghi: "Hỏi mang gì tới là phép lịch sự khi được mời. « La bûche » là bánh khúc gỗ của Noël Pháp." },
          { c: "Merci, c'est gentil, mais je travaille ce soir-là.", tot: true, kq: { tien: 150, nl: -20, tt: -8 }, dap: "Oh, dommage. Bon courage alors !", ghi: "Từ chối lịch sự. Túi đầy lên, nhưng đêm Noël một mình sau quầy khá buồn." },
          { c: "Non, je reste ici. J'appellerai ma famille.", tot: true, kq: { nl: 15, tt: 4, than: -1 }, dap: "D'accord… Joyeux Noël quand même.", ghi: "Được nghỉ ngơi, gọi về nhà ấm lòng, nhưng Camille hơi buồn vì câu đáp cụt." },
        ],
      }, {
        loai: "thu", id: "dec_thu",
        tu: "Mẹ",
        van: "Con yêu, ở nhà ai cũng nhắc con. Bố bảo trời Paris chắc lạnh lắm, nhớ mặc ấm. Cô giáo tiếng Pháp cũ của con muốn đọc thư con viết bằng tiếng Pháp, con gửi cho cô vài dòng nhé. Tháng này con làm gì nhiều nhất?",
        cau: [
          { truoc: "Ce mois-ci, j'ai surtout", sau: ".", kieu: "thuc" },
          { truoc: "À Paris, en décembre, il fait très", sau: ".", pa: ["froid", "chaud", "sec"], gt: "Thời tiết dùng « il fait + tính từ »: il fait froid." },
          { truoc: "Je vous", sau: "très fort.", pa: ["embrasse", "embrassez", "embrasser"], gt: "Công thức cuối thư gửi người thân: « Je vous embrasse ». Chia theo « je »." },
        ],
      }],
    },
  },
};

/* Câu thứ nhất của thư: phải kể đúng việc người chơi đã làm nhiều nhất tháng này. */
export const VIEC_THU = { hoc: "étudié", lam: "travaillé", ban: "vu mes amis", kham: "visité Paris", nghi: "dormi" };
