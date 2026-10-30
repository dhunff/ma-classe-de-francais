/* Mở rộng tám vụ sang vòng chơi sơ đồ (31/10, giai đoạn 5). Tài liệu và câu hỏi cũ giữ ở thamTu.js;
 * file này chỉ thêm: ban, noi (vị trí cho từng cảnh cũ, CÙNG THỨ TỰ), them (địa điểm mới), matThuan,
 * nang, ketDu, ketThieu, moLai, và các đoạn truyện.
 * "@ma" trong matThuan / nang là manh mối của địa điểm mang mã đó. Khuôn địa điểm: vuMauTableau.js.
 *   sauKet: lựa chọn sau khi phá án, lưu ở trình duyệt, đổi vụ sau qua theoChon (xem thamTu.js).
 * KHÔNG dùng dấu gạch dài (quy tắc 7). */
const NAM = [[16, 20], [50, 20], [84, 20], [30, 66], [70, 66]];
const SAU = [[16, 20], [50, 20], [84, 20], [16, 66], [50, 66], [84, 66]];
const dat = (khuon, k) => ({ x: khuon[k][0], y: khuon[k][1] });

export const MO_RONG = {
  /* ─────────────── DỄ: đi được hết, hồ sơ mỏng vẫn phá được ─────────────── */
  croissant: {
    ban: { gio: 5, dau: [50, 94] },
    moLai: "Bà Petit vẫn đang đợi. Ta đi lại từ đầu nhé, trợ lý.",
    noi: [
      { ma: "bep", icon: "kho", ten: "Bếp tiệm bánh", tom: "Ghi chú của bà Petit", ...dat(NAM, 0), goi: "Cửa sổ mở, vậy ai ở gần cửa sổ? Xem tin của Hugo và lời khai của Chloé." },
      { ma: "tin", icon: "thu", ten: "Tin nhắn của Hugo", tom: "Hugo đến trễ", ...dat(NAM, 1), goi: "Hugo nói đi xe buýt. Hỏi cậu ấy cho chắc." },
      { ma: "pho", icon: "so", ten: "Trước cửa tiệm", tom: "Lời khai của Chloé", ...dat(NAM, 2), goi: "Chú chó trắng là của ai? Bà Lenoir nhà bên có Max." },
    ],
    them: [
      {
        ma: "lenoir", icon: "xuong", ten: "Nhà bà Lenoir", tom: "Tin nhắn của hàng xóm", ...dat(NAM, 3),
        noi: "Nhà bà Lenoir", cam: "hum",
        leon: "Bà Lenoir là chủ của Max. Bà ấy trả lời thế nào?",
        tl: { loai: "sms", tieuDe: "Mme Lenoir", van: "Bonjour Madame Petit ! Max ? Non, il ne sort jamais le matin. Il dort dans le jardin. Mais la porte du jardin est cassée depuis hier." },
        tg: { neo: "la porte du jardin est cassée", tu: [["jamais", "không bao giờ"], ["le jardin", "khu vườn"], ["cassée", "bị hỏng"]] },
        q: "Qu'est-ce qui est cassé ?",
        pa: ["La porte du jardin", "La fenêtre de la cuisine", "Le vélo de Max", "La table"],
        gt: "« la porte du jardin est cassée depuis hier ». Vậy Max ra ngoài được!",
        manh: "Bà Lenoir nói Max không ra ngoài buổi sáng, nhưng cổng vườn hỏng từ hôm qua.",
        goi: "Bà Lenoir chắc Max ở nhà. Đặt lời này cạnh lời của Chloé trên bảng ghim.",
      },
      {
        ma: "hugo", loai: "hoi", icon: "hoi", ten: "Bến xe buýt", tom: "Hỏi Hugo", ...dat(NAM, 4),
        noi: "Bến xe buýt", ai: "Hugo", kienNhan: 2, cam: "lam-viec",
        leon: "Hugo là người lớn ta mới gặp. Nhớ dùng « vous » nhé.",
        luot: [
          {
            hoi: "Chào Hugo:",
            pa: ["Bonjour Hugo. Vous pouvez m'aider ?", "Hé, toi, viens ici !", "Bonjour Hugo. Quel âge as-tu ?"],
            sai: ["Câu này ra lệnh và rất thô lỗ.", "Tuổi của cậu ấy không liên quan, và ta chưa thân để xưng « tu »."],
            dap: "Bien sûr. Que voulez-vous savoir ?",
          },
          {
            hoi: "Hỏi cậu ấy ở đâu lúc 7 h 15:",
            pa: ["Où étiez-vous à 7 h 15 ?", "Où êtes-vous demain ?", "Quand étiez-vous au bus ?"],
            sai: ["« demain » là ngày mai, ta đang hỏi về sáng nay.", "« quand » hỏi thời gian, còn ta muốn biết nơi chốn."],
            dap: "J'étais dans le bus. Voici mon ticket : 7 h 12.",
            manh: "Hugo khai: 7 h 15 cậu ở trên xe buýt, có vé lúc 7 h 12.",
          },
        ],
        goi: "Hugo có vé xe buýt, cậu ấy không ở tiệm.",
      },
    ],
    matThuan: [{ a: "@pho", b: "@lenoir", t: "MÂU THUẪN: bà Lenoir nói Max không ra ngoài, nhưng 7 h 15 Chloé thấy chó trắng ở cửa sổ.", leon: "Cổng vườn hỏng, nên Max đã ra ngoài mà chủ không biết!" }],
    nang: ["@bep", "@pho", "@lenoir", "Hugo khai: 7 h 15 cậu ở trên xe buýt, có vé lúc 7 h 12.", "MÂU THUẪN: bà Lenoir nói Max không ra ngoài, nhưng 7 h 15 Chloé thấy chó trắng ở cửa sổ."],
    ketDu: "Chọn ba manh mối chứng minh chiếc bánh đã đi đâu.",
    ketThieu: { cam: "haha", loi: "Chúng ta tìm thấy vụn bánh trong ổ của Max, nhưng phải mất cả buổi mới thuyết phục được bà Lenoir. Bà Petit vẫn kịp nướng chiếc mới. Vụ đầu tiên, tạm ổn trợ lý nhé!" },
  },
  valise: {
    ban: { gio: 5, dau: [50, 94] },
    moLai: "Đồng hồ ở ga vẫn chạy. Bắt đầu lại nào.",
    noi: [
      { ma: "the", icon: "so", ten: "Sảnh ga", tom: "Thẻ tên trên vali", ...dat(NAM, 0), goi: "Anh Antoine về Marseille. Nghe thông báo ở bảng tàu xem." },
      { ma: "loa", icon: "goi", ten: "Bảng thông báo", tom: "Tàu đi Marseille", ...dat(NAM, 1), goi: "Tàu chạy từ đường ray 7. Hỏi nhân viên soát vé xem họ thấy gì." },
      { ma: "ve", icon: "thu", ten: "Túi trước của vali", tom: "Bản sao vé tàu", ...dat(NAM, 2), goi: "Toa 4, ghế 52. Nhưng có chắc vali của Léa ở trên tàu không?" },
    ],
    them: [
      {
        ma: "lea", icon: "quay", ten: "Ghế chờ", tom: "Ghi chú của Léa", ...dat(NAM, 3),
        noi: "Ghế chờ", cam: "hum",
        leon: "Léa viết ra đặc điểm vali của cô ấy.",
        tl: { loai: "note", tieuDe: "Note de Léa", van: "Ma valise est bleue, avec un ruban rouge sur la poignée. Dedans, il y a mon CV et une robe noire. Cette valise-ci n'a pas de ruban : ce n'est pas la mienne !" },
        tg: { neo: "avec un ruban rouge sur la poignée", tu: [["un ruban", "dải ruy băng"], ["la poignée", "tay cầm"], ["la mienne", "cái của tôi"]] },
        q: "Comment est la valise de Léa ?",
        pa: ["Bleue, avec un ruban rouge", "Rouge, avec un ruban bleu", "Noire, sans ruban", "Bleue, sans ruban"],
        gt: "« bleue, avec un ruban rouge sur la poignée ». Vali trong tay ta không có ruy băng.",
        manh: "Vali của Léa có ruy băng đỏ; vali trong tay ta không có.",
        goi: "Ai đã thấy một vali có ruy băng đỏ? Hỏi ông Paul.",
      },
      {
        ma: "paul", loai: "hoi", icon: "hoi", ten: "Cửa lên tàu", tom: "Hỏi nhân viên Paul", ...dat(NAM, 4),
        noi: "Cửa lên tàu", ai: "Paul", kienNhan: 2, cam: "lam-viec",
        leon: "Ông Paul đang rất bận. Hỏi ngắn và lịch sự.",
        luot: [
          {
            hoi: "Bắt chuyện:",
            pa: ["Excusez-moi, monsieur. Vous avez une minute ?", "Tu as une minute, Paul ?", "Attendez ! Parlez !"],
            sai: ["Ông Paul không quen ta, không xưng « tu » được.", "Hai mệnh lệnh liền nhau, quá thô lỗ."],
            dap: "Oui, mais vite, le train part bientôt.",
          },
          {
            hoi: "Hỏi về chiếc vali:",
            pa: ["Avez-vous vu une valise bleue ?", "Avez-vous vu un valise bleu ?", "Où est mon chat bleu ?"],
            sai: ["« valise » là giống cái: une valise bleue.", "Ta đang tìm vali, không phải mèo!"],
            dap: "Oui ! Un homme est monté voiture 4 avec une valise bleue. Elle avait un ruban rouge.",
            manh: "Paul khai: một người đàn ông lên toa 4 với vali xanh có ruy băng đỏ.",
          },
        ],
        goi: "Một vali xanh có ruy băng đỏ đã lên tàu. Đối chiếu với ghi chú của Léa.",
      },
    ],
    matThuan: [{ a: "@lea", b: "Paul khai: một người đàn ông lên toa 4 với vali xanh có ruy băng đỏ.", t: "MÂU THUẪN: vali của Antoine không có ruy băng, vậy mà anh ấy lên tàu với vali có ruy băng đỏ.", leon: "Vậy là Antoine đang cầm đúng vali của Léa!" }],
    nang: ["@the", "@loa", "@ve", "Paul khai: một người đàn ông lên toa 4 với vali xanh có ruy băng đỏ.", "MÂU THUẪN: vali của Antoine không có ruy băng, vậy mà anh ấy lên tàu với vali có ruy băng đỏ."],
    ketDu: "Chọn ba manh mối chỉ ra vali của Léa đang ở đâu.",
    ketThieu: { cam: "yeah", loi: "Ta chạy khắp ga rồi mới tìm được toa 4, kịp đổi vali lúc 10 h 11, chỉ một phút trước giờ tàu chạy! Léa vẫn đi phỏng vấn được, dù tóc tai hơi rối." },
  },
  minou: {
    ban: { gio: 5, dau: [50, 94] },
    moLai: "Bà Rose vẫn ngồi khóc ngoài cửa. Tìm lại từ đầu thôi.",
    noi: [
      { ma: "ro", icon: "so", ten: "Cột đèn", tom: "Tờ rơi tìm mèo", ...dat(NAM, 0), goi: "Mèo mê cá. Ai đã thấy nó tối qua?" },
      { ma: "tin", icon: "thu", ten: "Nhà ông Bernard", tom: "Tin nhắn của hàng xóm", ...dat(NAM, 1), goi: "Nó đi về phía nhà hàng đầu phố. Đến xem." },
      { ma: "bien", icon: "quay", ten: "Cửa Chez Marcel", tom: "Biển giờ mở cửa", ...dat(NAM, 2), goi: "Cá giao tối Chủ nhật. Xem phiếu giao hàng, rồi gọi chủ quán." },
    ],
    them: [
      {
        ma: "phieu", icon: "kho", ten: "Hộp thư nhà hàng", tom: "Phiếu giao cá", ...dat(NAM, 3),
        noi: "Hộp thư nhà hàng", cam: "suy-nghi",
        leon: "Người giao cá để lại phiếu trong hộp thư.",
        tl: { loai: "hoaDon", tieuDe: "Bon de livraison", van: "Poissonnerie du Port\nDimanche, 19 h 30\n3 caisses de poisson frais\nLieu : la cour\nPorte de la cour fermée à 20 h" },
        tg: { neo: "Porte de la cour fermée à 20 h", tu: [["une caisse", "cái thùng"], ["frais", "tươi"], ["la cour", "cái sân"]] },
        q: "À quelle heure la porte de la cour est-elle fermée ?",
        pa: ["À 20 h", "À 19 h 30", "À 18 h", "À 12 h"],
        gt: "« Porte de la cour fermée à 20 h ». Minou tới lúc 18 h, nên có thể đã bị nhốt trong sân.",
        manh: "Phiếu giao cá: cổng sân đóng lúc 20 h tối Chủ nhật.",
        goi: "18 h mèo đi tới đó, 20 h cổng sân đóng. Gọi ông Marcel xem.",
      },
      {
        ma: "marcel", loai: "hoi", icon: "goi", ten: "Gọi ông Marcel", tom: "Chủ nhà hàng", ...dat(NAM, 4),
        noi: "Điện thoại", ai: "Marcel", kienNhan: 2, cam: "lam-viec",
        leon: "Hôm nay nhà hàng nghỉ, ông Marcel đang ở nhà. Nói năng lịch sự nhé.",
        luot: [
          {
            hoi: "Mở đầu cuộc gọi:",
            pa: ["Bonjour monsieur Marcel. Je vous appelle pour un chat.", "Allô, tu as mon chat ?", "Salut, c'est quoi ton nom ?"],
            sai: ["Vừa « tu » vừa như buộc tội ông ấy.", "Ta gọi ông ấy mà không biết tên sao? Lại còn « tu »."],
            dap: "Un chat ? Dites-moi tout.",
          },
          {
            hoi: "Hỏi về con mèo:",
            pa: ["Avez-vous vu un petit chat gris ?", "Avez-vous vu une petite chat gris ?", "Combien coûte le poisson ?"],
            sai: ["« chat » là giống đực: un petit chat.", "Giá cá không liên quan tới vụ này."],
            dap: "Non, il n'y a pas de chat chez moi. J'ai tout fermé dimanche soir.",
            manh: "Marcel khai: ở nhà hàng không có mèo, tối Chủ nhật đã đóng hết cửa.",
          },
        ],
        goi: "Ông Marcel chắc chắn không có mèo. Nhưng ông ấy có thấy sân lúc đó không?",
      },
    ],
    matThuan: [{ a: "@tin", b: "Marcel khai: ở nhà hàng không có mèo, tối Chủ nhật đã đóng hết cửa.", t: "MÂU THUẪN: Marcel nói không có mèo, nhưng 18 h mèo đã đi về phía nhà hàng, trước khi cổng đóng.", leon: "Ông ấy không thấy Minou, không có nghĩa là Minou không ở đó!" }],
    nang: ["@ro", "@tin", "@phieu", "@bien", "MÂU THUẪN: Marcel nói không có mèo, nhưng 18 h mèo đã đi về phía nhà hàng, trước khi cổng đóng."],
    ketDu: "Chọn ba manh mối chỉ ra Minou đang ở đâu.",
    ketThieu: { cam: "yeu-qua", loi: "Ta gõ cửa cả khu phố mới tới được sân sau. Minou nằm ngủ trên thùng cá, bụng tròn vo! Bà Rose ôm nó khóc vì vui. Cạnh thùng cá có một chiếc lông vũ XÁM. Lạ thật." },
    loiKet: { cam: "yeu-qua", loi: "Minou nằm ngủ trên thùng cá, bụng tròn vo! Ông Marcel mở cổng, cười xoà rồi tặng cả khu phố một bữa cá. Từ nay ông hứa sẽ báo cho Léon mọi tin hay trong khu phố. Nhưng… trợ lý có thấy chiếc lông vũ XÁM cạnh thùng cá không? Lạ thật. Léon cất nó vào sổ." },
  },

  /* ─────────────── VỪA ─────────────── */
  marche: {
    ban: { gio: 4, dau: [50, 94] },
    moLai: "Cảnh sát Bruno đang cười ta ở góc chợ. Làm lại, và đừng để thiếu bằng chứng lần nữa.",
    mo: "Chợ phiên Aligre sáng thứ Bảy. Ông Lambert bị mất ví lúc 11 giờ. Trong túi áo ông, Léon tìm thấy… một chiếc lông vũ xám. Cảnh sát Bruno đã tới trước, đang giữ một du khách Anh và tuyên bố phá xong vụ án. Ta có 4 giờ để chứng minh ông ấy sai.",
    noi: [
      { ma: "pho", icon: "quay", ten: "Quầy phô mai", tom: "Lời khai ông bán phô mai", ...dat(SAU, 0), goi: "Áo vàng rời đi về phố Crozatier. Du khách áo đỏ thì đứng yên chụp ảnh." },
      { ma: "hoa", icon: "xuong", ten: "Quầy hoa", tom: "Lời khai của Nadia", ...dat(SAU, 1), goi: "Théo bỏ diễn lúc 11 h. Hắn nói sao về chuyện đó?" },
      { ma: "hd", icon: "thu", ten: "Ngân hàng của ông Lambert", tom: "Hoá đơn thẻ", ...dat(SAU, 2), goi: "Thẻ bị dùng ở café Le Crozatier. Hỏi người phục vụ." },
    ],
    them: [
      {
        ma: "anh", icon: "so", ten: "Đồn cảnh sát tạm", tom: "Máy ảnh của Mr Smith", ...dat(SAU, 3),
        noi: "Đồn cảnh sát tạm", cam: "hum",
        leon: "Bruno đang giữ Mr Smith. Máy ảnh của ông ấy ghi giờ từng tấm.",
        tl: { loai: "bang", tieuDe: "Appareil photo de Mr Smith", van: "10 h 50 : fromages\n11 h 00 : fromages\n11 h 05 : la fontaine, le jongleur n'est plus là\n11 h 15 : fleurs de Nadia" },
        tg: { neo: "le jongleur n'est plus là", tu: [["un appareil photo", "máy ảnh"], ["la fontaine", "đài phun nước"], ["le jongleur", "người tung hứng"]] },
        q: "Que montre la photo de 11 h 05 ?",
        pa: ["Le jongleur n'est plus à la fontaine", "Le jongleur joue à la fontaine", "M. Lambert achète des fleurs", "Mr Smith est au café"],
        gt: "« le jongleur n'est plus là ». Và Mr Smith chụp ảnh liên tục, không rời chợ.",
        manh: "Ảnh của Mr Smith: 11 h 05 Théo đã rời đài phun nước, còn ông ấy vẫn chụp ảnh trong chợ.",
        goi: "Mr Smith vô can. Nói Bruno thả ông ấy ra, rồi tìm Théo.",
      },
      {
        ma: "theo", loai: "hoi", icon: "hoi", ten: "Đài phun nước", tom: "Thẩm vấn Théo", ...dat(SAU, 4),
        noi: "Đài phun nước", ai: "Théo", kienNhan: 2, cam: "gian",
        leon: "Théo quay lại lấy bóng. Hắn trẻ thật, nhưng ta đang hỏi cung: vẫn phải « vous ».",
        luot: [
          {
            hoi: "Chặn Théo lại:",
            pa: ["Bonjour monsieur. Nous avons quelques questions à vous poser.", "Salut mon pote, ça roule ?", "Avoue tout de suite, voleur !"],
            sai: ["Quá thân mật, Théo cười khẩy.", "Chưa có bằng chứng mà đã gọi là kẻ trộm."],
            dap: "Moi ? Je vous écoute, mais je suis pressé.",
          },
          {
            hoi: "Hỏi vì sao hắn bỏ diễn:",
            pa: ["Pourquoi êtes-vous parti à 11 h ?", "Pourquoi vous êtes partis à 11 h ?", "Pourquoi partirez-vous à 11 h ?"],
            sai: ["Thiếu đảo ngữ và phân từ thừa « s »: ta đang hỏi một người.", "Thì tương lai, trong khi việc đã xảy ra rồi."],
            dap: "J'étais malade. Je suis rentré directement chez moi, rue de Charonne. Je ne suis pas allé dans la rue Crozatier.",
            manh: "Théo khai: bị ốm, về thẳng nhà ở phố Charonne, không đi phố Crozatier.",
          },
        ],
        goi: "Hắn khẳng định không đi phố Crozatier. Ta có gì để cãi lại không?",
      },
      {
        ma: "cafe", loai: "hoi", icon: "goi", ten: "Café Le Crozatier", tom: "Hỏi người phục vụ", ...dat(SAU, 5),
        noi: "Café Le Crozatier", ai: "La serveuse", kienNhan: 2, cam: "lam-viec",
        leon: "Quán đang đông. Lịch sự và hỏi đúng trọng tâm.",
        luot: [
          {
            hoi: "Gọi người phục vụ:",
            pa: ["Pardon, madame, puis-je vous poser une question ?", "Hé, la serveuse !", "Tu peux venir, s'il te plaît ?"],
            sai: ["Gọi người ta như gọi người ở, cô ấy làm ngơ.", "« tu » với người lạ đang làm việc là bất lịch sự."],
            dap: "Oui, bien sûr, je vous écoute.",
          },
          {
            hoi: "Hỏi về người trả tiền lúc 11 h 20:",
            pa: ["Qui a payé par carte vers 11 h 20 ?", "Qui a payé par carte vers midi demain ?", "Quelle carte voulez-vous ?"],
            sai: ["« demain » không đi với passé composé.", "Đó là câu của người bán hàng, không phải của thám tử."],
            dap: "Un jeune homme en veste jaune. Il a pris deux chocolats chauds et un croissant.",
            manh: "Người phục vụ: 11 h 20, chàng trai áo vàng trả bằng thẻ ở quán.",
          },
        ],
        goi: "Áo vàng ở phố Crozatier lúc 11 h 20. Ai vừa nói không đi phố đó?",
      },
    ],
    matThuan: [
      { a: "Théo khai: bị ốm, về thẳng nhà ở phố Charonne, không đi phố Crozatier.", b: "Người phục vụ: 11 h 20, chàng trai áo vàng trả bằng thẻ ở quán.", t: "MÂU THUẪN: Théo nói không đi phố Crozatier, nhưng áo vàng trả tiền ở đó lúc 11 h 20.", leon: "Bị ốm mà uống hai cốc sô-cô-la nóng ở phố Crozatier sao?" },
      { a: "Théo khai: bị ốm, về thẳng nhà ở phố Charonne, không đi phố Crozatier.", b: "@pho", t: "MÂU THUẪN: Théo nói về thẳng nhà, nhưng ông bán phô mai thấy áo vàng chạy về phố Crozatier.", leon: "Nhân chứng thấy hắn chạy đúng hướng hắn chối!" },
    ],
    nang: ["@pho", "@hoa", "@hd", "Người phục vụ: 11 h 20, chàng trai áo vàng trả bằng thẻ ở quán.", "MÂU THUẪN: Théo nói không đi phố Crozatier, nhưng áo vàng trả tiền ở đó lúc 11 h 20.", "MÂU THUẪN: Théo nói về thẳng nhà, nhưng ông bán phô mai thấy áo vàng chạy về phố Crozatier."],
    ketDu: "Bruno đang đứng đó khoanh tay. Ba bằng chứng, và ông ta sẽ phải thả Mr Smith.",
    ketThieu: { cam: "hum", loi: "Tìm được ví trong áo Théo, nhưng hắn nói nhặt được ngoài đường. Bruno cười ta suốt cả buổi. Lá thư ký P.G. trong túi Théo cho thấy kẻ này đang dàn dựng cả một chuỗi vụ án." },
    sauKet: {
      ma: "bruno",
      hoi: "Bruno bắt nhầm người và đang rất xấu hổ. Báo cáo gửi cấp trên, ta viết thế nào?",
      a: { gt: "giup", t: "Không nêu tên Bruno", loi: "Bruno lúng túng gật đầu: « Tôi nợ cậu một lần, trợ lý. »" },
      b: { gt: "bao", t: "Ghi rõ lỗi của Bruno", loi: "Sự thật được ghi lại đầy đủ. Bruno bỏ đi, không nói một lời." },
    },
  },
  concert: {
    ban: { gio: 4, dau: [50, 94] },
    moLai: "Đêm diễn sắp bắt đầu. Xem lại từ đầu, ai nói dối thì sẽ lộ.",
    noi: [
      { ma: "mail", icon: "thu", ten: "Hộp thư ban nhạc", tom: "Email báo hủy", ...dat(SAU, 0), goi: "Tên miền giả. Ai đã mua nó?" },
      { ma: "marc", icon: "so", ten: "Văn phòng của Marc", tom: "Lời khai của quản lý", ...dat(SAU, 1), goi: "Marc chỉ thiệt nếu show bị hủy. Xem ai được lợi." },
      { ma: "bai", icon: "xuong", ten: "Mạng xã hội của Julie", tom: "Bài đăng 15 h 30", ...dat(SAU, 2), goi: "Julie biết tin rất sớm. Cô ấy nói biết tin lúc nào?" },
    ],
    them: [
      {
        ma: "domain", icon: "kho", ten: "Công ty tên miền", tom: "Hoá đơn mua tên miền", ...dat(SAU, 3),
        noi: "Công ty tên miền", cam: "ngac-nhien",
        leon: "Inès của phòng thí nghiệm lần ra được hoá đơn mua tên miền giả.",
        tl: { loai: "hoaDon", tieuDe: "Facture Domaines-Web", van: "Nom de domaine : salle-etoile.com\nAcheté le : lundi\nDurée : 1 mois\nCliente : J. Ricard\nPaiement : carte bancaire" },
        tg: { neo: "Cliente : J. Ricard", tu: [["une facture", "hoá đơn"], ["acheté", "đã mua"], ["la durée", "thời hạn"]] },
        q: "Qui a acheté le nom de domaine ?",
        pa: ["J. Ricard", "La salle Étoile", "Marc", "Sophie"],
        gt: "« Cliente : J. Ricard ». Julie Ricard mua tên miền từ thứ Hai, chỉ dùng một tháng.",
        manh: "Hoá đơn: J. Ricard mua tên miền salle-etoile.com hôm thứ Hai.",
        goi: "J. Ricard chính là Julie Ricard. Xem cô ấy trả lời thế nào.",
      },
      {
        ma: "julie", loai: "hoi", icon: "hoi", ten: "Phòng hóa trang", tom: "Thẩm vấn Julie", ...dat(SAU, 4),
        noi: "Phòng hóa trang", ai: "Julie Ricard", kienNhan: 2, cam: "gian",
        leon: "Julie là ngôi sao, lại rất giỏi diễn. Lịch sự, nhưng đừng để cô ấy lái câu chuyện.",
        luot: [
          {
            hoi: "Xin phép nói chuyện:",
            pa: ["Madame Ricard, auriez-vous quelques minutes à m'accorder ?", "Julie, viens, on parle.", "Vous allez parler, oui ou non ?"],
            sai: ["Xưng « tu » với một ngôi sao vừa gặp.", "Giọng đe doạ, cô ấy gọi luôn cho luật sư."],
            dap: "Quelques minutes seulement. Je chante ce soir.",
          },
          {
            hoi: "Hỏi cô ấy biết tin lúc nào:",
            pa: ["Quand avez-vous appris l'annulation ?", "Quand vous apprenez l'annulation demain ?", "Pourquoi l'annulation vous aimez ?"],
            sai: ["Sai thì và sai thời gian: việc đã xảy ra.", "Câu này sai trật tự từ và chẳng rõ nghĩa."],
            dap: "À 17 h. La directrice de la salle m'a téléphoné. Avant, je ne savais rien.",
            manh: "Julie khai: 17 h mới biết tin, do giám đốc nhà hát gọi.",
          },
        ],
        goi: "17 h mới biết tin? Xem lại giờ cô ấy đăng bài.",
      },
      {
        ma: "sophie", loai: "hoi", icon: "goi", ten: "Phòng âm thanh", tom: "Hỏi Sophie", ...dat(SAU, 5),
        noi: "Phòng âm thanh", ai: "Sophie", kienNhan: 2, cam: "lam-viec",
        leon: "Sophie làm việc ở nhà hát nhiều năm và rất ghét tin đồn.",
        luot: [
          {
            hoi: "Mở lời:",
            pa: ["Bonjour Sophie. Puis-je vous déranger un instant ?", "Coucou, ma belle !", "Toi, arrête la musique !"],
            sai: ["Quá suồng sã trong một cuộc điều tra.", "Ra lệnh và xưng « tu », cô ấy vặn nhạc to hơn."],
            dap: "Oui, allez-y. Je vérifie les micros.",
          },
          {
            hoi: "Hỏi về việc nhà hát biết chuyện khi nào:",
            pa: ["Quand la directrice a-t-elle su pour l'annulation ?", "Quand la directrice a su-t-elle ?", "La directrice, elle chante bien ?"],
            sai: ["Đảo ngữ đặt sai chỗ: phải là « a-t-elle su ».", "Câu này lạc đề."],
            dap: "À 18 h seulement. Elle a été très surprise. Elle n'a appelé personne avant.",
            manh: "Sophie: 18 h giám đốc mới biết chuyện, trước đó không gọi cho ai.",
          },
        ],
        goi: "Giám đốc biết lúc 18 h. Vậy ai đã gọi cho Julie lúc 17 h?",
      },
    ],
    matThuan: [
      { a: "Julie khai: 17 h mới biết tin, do giám đốc nhà hát gọi.", b: "@bai", t: "MÂU THUẪN: Julie nói 17 h mới biết tin, nhưng 15 h 30 cô đã khoe sẽ hát thay.", leon: "Đăng bài trước khi biết tin. Cô ấy đoán tương lai giỏi thật!" },
      { a: "Julie khai: 17 h mới biết tin, do giám đốc nhà hát gọi.", b: "Sophie: 18 h giám đốc mới biết chuyện, trước đó không gọi cho ai.", t: "MÂU THUẪN: Julie nói giám đốc gọi lúc 17 h, nhưng 18 h giám đốc mới biết.", leon: "Một cuộc gọi chưa từng tồn tại!" },
    ],
    nang: ["@bai", "@domain", "@mail", "MÂU THUẪN: Julie nói 17 h mới biết tin, nhưng 15 h 30 cô đã khoe sẽ hát thay.", "MÂU THUẪN: Julie nói giám đốc gọi lúc 17 h, nhưng 18 h giám đốc mới biết."],
    ketDu: "Julie có luật sư. Ba bằng chứng, không ít hơn.",
    ketThieu: { cam: "hum", loi: "Julie thừa nhận nửa vời rồi im lặng. Nhóm Les Lucioles được hát lại, nhưng lá thư ký P.G. biến mất trước khi ta kịp đọc kỹ. Rồi về văn phòng, tủ hồ sơ có dấu bị mở. Có nội gián trong văn phòng Léon." },
    loiKet: { cam: "quyet-tam", loi: "Julie thú nhận, và đưa ra lá thư thứ ba ký « P.G. ». Ba vụ, ba lá thư, ba chiếc lông vũ. Nhưng về tới văn phòng, Léon mở tủ hồ sơ và đứng sững: lá thư ở vụ chợ đã bị thay bằng tờ giấy trắng. Tủ không hề bị phá. Chỉ người trong văn phòng mới mở được. Có nội gián." },
  },

  /* ─────────────── KHÓ ─────────────── */
  lettres: {
    ban: { gio: 4, dau: [50, 94] },
    moLai: "Đơn tố cáo vẫn nằm trên bàn cấp trên. Đọc lại ba lá thư, lần này đừng bỏ sót.",
    mo: "Một đơn tố cáo nặc danh gửi tới sở cảnh sát: Léon bị buộc tội làm giả chứng cứ, và ngay sáng nay ông bị tước thẻ thanh tra. Từ giờ ta điều tra không chính thức. Marcel, ông chủ quán nay thành người đưa tin của Léon, lén mang ba lá thư từ ba vụ án tới. Không dấu vân tay, không địa chỉ gửi. Nhưng một người viết nhiều thì luôn để lại dấu vết trong chính câu chữ.",
    noi: [
      { ma: "thu1", icon: "thu", ten: "Lá thư gửi Karim", tom: "Hình in chìm trên giấy", ...dat(SAU, 0), goi: "Giấy mua ở Rouen. Tiệm giấy đó bán cho ai?" },
      { ma: "thu2", icon: "thu", ten: "Lá thư gửi Théo", tom: "Một câu đáng chú ý", ...dat(SAU, 1), goi: "Hắn nói về một chuyên mục. Bruno có giả thuyết khác, nghe thử xem." },
      { ma: "thu3", icon: "thu", ten: "Lá thư gửi Julie", tom: "Hắn tự hào về điều gì", ...dat(SAU, 2), goi: "P.G. có độc giả. Karim có biết gì về chuyện này không?" },
    ],
    them: [
      {
        ma: "giay", icon: "kho", ten: "Tiệm giấy Vasseur", tom: "Sổ khách hàng", ...dat(SAU, 3),
        noi: "Tiệm giấy Vasseur, Rouen", cam: "suy-nghi",
        leon: "Marcel gọi điện nhờ người ở Rouen chép lại sổ khách quen của tiệm.",
        tl: { loai: "bang", tieuDe: "Papeterie Vasseur · Clients réguliers", van: "Lycée Corneille : cahiers (chaque mois)\nMairie de Rouen : enveloppes (chaque trimestre)\nLe Courrier de Rouen : papier à lettres filigrané (chaque semaine)\nHôtel de la Gare : cartes postales (en été)" },
        tg: { neo: "Le Courrier de Rouen : papier à lettres filigrané (chaque semaine)", tu: [["filigrané", "có hình in chìm"], ["le trimestre", "quý (ba tháng)"], ["régulier", "thường xuyên"]] },
        q: "Qui achète le papier filigrané ?",
        pa: ["Le Courrier de Rouen", "Le lycée Corneille", "La mairie de Rouen", "L'hôtel de la Gare"],
        gt: "« Le Courrier de Rouen : papier à lettres filigrané ». Chỉ một khách quen mua đúng loại giấy này, và đó là một tờ báo.",
        manh: "Sổ tiệm giấy: giấy có hình in chìm chỉ bán cho Le Courrier de Rouen.",
        goi: "Một tờ báo. Mọi thứ đang chỉ về cùng một hướng.",
      },
      {
        ma: "karim", loai: "hoi", icon: "hoi", ten: "Trại giam", tom: "Hỏi lại Karim", ...dat(SAU, 4),
        noi: "Trại giam", ai: "Karim Benali", kienNhan: 2, cam: "gian",
        leon: "Karim đang bực vì P.G. bỏ rơi anh ta. Đừng khiêu khích, cứ giữ lối hỏi trang trọng.",
        luot: [
          {
            hoi: "Mở đầu:",
            pa: ["Monsieur Benali, accepteriez-vous de répondre à quelques questions ?", "Alors, le voleur, on discute ?", "Vous êtes obligé, tu comprends ?"],
            sai: ["Mỉa mai một người đang trong tù, anh ta quay mặt đi.", "Lẫn lộn « vous » với « tu » trong cùng một câu."],
            dap: "Pourquoi pas. Je n'ai plus rien à perdre.",
          },
          {
            hoi: "Hỏi về người viết thư:",
            pa: ["Comment P.G. vous a-t-il contacté ?", "Comment P.G. vous a contacté-t-il ?", "Comment P.G. vous contactera-t-il hier ?"],
            sai: ["Đảo ngữ phải đặt ở trợ động từ: « vous a-t-il contacté ».", "Thì tương lai không đi với « hier »."],
            dap: "Toujours par la poste, avec un cachet de Rouen. Il écrivait : « Vous lirez bientôt votre histoire dans ma colonne. »",
            manh: "Karim khai: thư đóng dấu Rouen, P.G. hứa kể chuyện trong « cột báo » của hắn.",
          },
        ],
        goi: "« Ma colonne »: cột báo. Hắn không giấu nghề của mình.",
      },
      {
        ma: "bruno", loai: "hoi", icon: "goi", ten: "Gặp Bruno", tom: "Giả thuyết của cảnh sát", ...dat(SAU, 5),
        noi: "Quán café của bà Odile", ai: "Bruno", kienNhan: 2, cam: "hum",
        leon: "Bruno gặp ta lén ở quán của bà Odile. Lúc này ông ấy là đồng nghiệp, hỏi lịch sự nhưng thẳng thắn.",
        luot: [
          {
            hoi: "Mở đầu:",
            pa: ["Merci d'être venu. Pourrions-nous parler de P.G. ?", "Tu dois tout me dire, Bruno.", "Vous avez peur, n'est-ce pas ?"],
            sai: ["Ra lệnh cho một sĩ quan, ông ấy đứng dậy.", "Khiêu khích người duy nhất còn chịu gặp ta."],
            dap: "D'accord, mais ce rendez-vous n'a jamais eu lieu.",
          },
          {
            hoi: "Hỏi giả thuyết của ông ấy:",
            pa: ["D'après vous, qui pourrait être P.G. ?", "D'après vous, qui peut être serait P.G. ?", "Qui êtes-vous, P.G. ?"],
            sai: ["Câu dùng hai động từ chia cùng lúc.", "Bruno không phải P.G.!"],
            dap: "Pour moi, c'est un touriste étranger. Il connaît mal Paris, il était de passage et il est déjà reparti.",
            manh: "Bruno cho rằng P.G. là du khách nước ngoài, vừa qua Paris rồi đi.",
          },
        ],
        goi: "Bruno nghĩ là du khách. Lá thư thứ hai có đồng ý không?",
      },
    ],
    matThuan: [
      { a: "Bruno cho rằng P.G. là du khách nước ngoài, vừa qua Paris rồi đi.", b: "@thu2", t: "MÂU THUẪN: Bruno nói P.G. chỉ ghé qua, nhưng hắn tự viết đã quan sát ba tuần.", leon: "Du khách nào lại rình một ông già ba tuần để viết chuyên mục?" },
      { a: "Karim khai: thư đóng dấu Rouen, P.G. hứa kể chuyện trong « cột báo » của hắn.", b: "Bruno cho rằng P.G. là du khách nước ngoài, vừa qua Paris rồi đi.", t: "MÂU THUẪN: du khách không thể có « cột báo » riêng và gửi thư đều từ Rouen.", leon: "Một người có cột báo là người sống bằng nghề viết!" },
    ],
    nang: ["@thu2", "@giay", "Karim khai: thư đóng dấu Rouen, P.G. hứa kể chuyện trong « cột báo » của hắn.", "MÂU THUẪN: Bruno nói P.G. chỉ ghé qua, nhưng hắn tự viết đã quan sát ba tuần.", "MÂU THUẪN: du khách không thể có « cột báo » riêng và gửi thư đều từ Rouen."],
    ketDu: "Không có thẻ thanh tra, ta chỉ còn lý lẽ. Chọn ba chứng cứ về nghề nghiệp của P.G.",
    ketThieu: { cam: "hum", loi: "Hướng đi đúng, nhưng còn quá ít để thuyết phục ai. Marcel hứa sẽ tìm thêm ở kho lưu trữ báo chí. Léon nhìn theo ông ấy, trầm ngâm." },
  },
  chronique: {
    ban: { gio: 4, dau: [50, 94] },
    moLai: "Garnier vẫn tự do và cuốn sách sắp ra. Đi lại, lần này chặn hết đường chối của hắn.",
    noi: [
      { ma: "cot", icon: "so", ten: "Lưu trữ báo", tom: "Chuyên mục mới nhất", ...dat(SAU, 0), goi: "Hắn chuẩn bị một cuốn sách. Nhà xuất bản nào nhận?" },
      { ma: "radio", icon: "goi", ten: "Radio Normandie", tom: "Đoạn phỏng vấn", ...dat(SAU, 1), goi: "« Un coup d'avance ». Sếp của hắn có biết không?" },
      { ma: "ve", icon: "thu", ten: "Lịch sử vé SNCF", tom: "Vé của Paul Garnier", ...dat(SAU, 2), goi: "Hắn có mặt ở Paris đúng ba ngày đó. Hỏi xem hắn khai thế nào." },
    ],
    them: [
      {
        ma: "hopdong", icon: "kho", ten: "Nhà xuất bản du Lac", tom: "Hợp đồng sách", ...dat(SAU, 3),
        noi: "Nhà xuất bản du Lac", cam: "ngac-nhien",
        leon: "Hợp đồng ghi rõ điều kiện kỳ lạ. Đọc kỹ điều 3.",
        tl: { loai: "bang", tieuDe: "Éditions du Lac · Contrat", van: "Auteur : M. Paul Garnier\nTitre : « L'Inspecteur manipulé »\nArticle 3 : le manuscrit doit raconter des affaires réelles, résolues avant la fin du mois.\nArticle 4 : une avance de 5 000 € sera versée à la signature." },
        tg: { neo: "le manuscrit doit raconter des affaires réelles", tu: [["le manuscrit", "bản thảo"], ["une avance", "khoản ứng trước"], ["versée", "được trả"]] },
        q: "Que doit contenir le manuscrit selon l'article 3 ?",
        pa: ["Des affaires réelles", "Un roman d'amour", "Des recettes de cuisine", "Des photos de Rouen"],
        gt: "« le manuscrit doit raconter des affaires réelles »: các vụ án phải có thật, nên hắn tự dựng chúng.",
        manh: "Hợp đồng sách: bản thảo phải kể các vụ án có thật, trước cuối tháng.",
        goi: "Hắn cần vụ án thật cho cuốn sách. Động cơ rõ rồi.",
      },
      {
        ma: "duval", loai: "hoi", icon: "goi", ten: "Toà soạn báo", tom: "Hỏi tổng biên tập", ...dat(SAU, 4),
        noi: "Le Courrier de Rouen", ai: "Mme Duval", kienNhan: 2, cam: "lam-viec",
        leon: "Bà Duval là tổng biên tập và rất bảo vệ phóng viên của mình. Cần trang trọng, tinh tế.",
        luot: [
          {
            hoi: "Xin bà ấy tiếp chuyện:",
            pa: ["Madame, je vous remercie de me recevoir. Puis-je vous parler de M. Garnier ?", "Madame, votre journaliste est un criminel.", "Ça va ? On parle de Paul ?"],
            sai: ["Kết tội ngay câu đầu, bà ấy đứng dậy tiễn khách.", "Quá thân mật với một tổng biên tập."],
            dap: "Paul travaille ici depuis quinze ans. Que voulez-vous savoir ?",
          },
          {
            hoi: "Hỏi về việc đi lại của Garnier:",
            pa: ["Avait-il des raisons d'aller à Paris ce mois-ci ?", "Avait-il des raisons d'allé à Paris ?", "Aura-t-il eu raisons à Paris hier ?"],
            sai: ["Sau « de » phải là nguyên mẫu: « d'aller ».", "Thì và cấu trúc đều sai với « hier »."],
            dap: "Non. Il ne quitte jamais Rouen, il me l'a répété ce matin. Il n'a pas mis les pieds à Paris ce mois-ci.",
            manh: "Bà Duval: Garnier nói tháng này không hề đặt chân tới Paris.",
          },
        ],
        goi: "Hắn nói với sếp là không đi Paris. Ta có giấy tờ nói khác.",
      },
      {
        ma: "garnier", loai: "hoi", icon: "hoi", ten: "Gọi Paul Garnier", tom: "Đối mặt với P.G.", ...dat(SAU, 5),
        noi: "Điện thoại", ai: "Paul Garnier", kienNhan: 2, cam: "gian",
        leon: "Hắn sẽ bắt bẻ từng từ. Một câu sai ngữ pháp là hắn cười vào mặt ta.",
        luot: [
          {
            hoi: "Mở đầu:",
            pa: ["Monsieur Garnier, je vous prie de m'excuser de vous importuner.", "Allô, c'est toi, P.G. ?", "Je vous importune, excuser moi."],
            sai: ["Lộ bài ngay câu đầu tiên.", "Sai hình thức: « excusez-moi »."],
            dap: "Tiens, l'assistant du célèbre Léon. Quel honneur.",
          },
          {
            hoi: "Hỏi hắn đã ở đâu trong các ngày xảy ra vụ án:",
            pa: ["Étiez-vous à Paris le mardi 3 ou le samedi 7 ?", "Étiez-vous à Paris le mardi 3 ou le samedi 7, voleur ?", "Serez-vous été à Paris le mardi 3 ?"],
            sai: ["Hắn cười: « Une insulte ? Il vous manque des preuves. »", "« Serez-vous été » không phải dạng đúng."],
            dap: "Jamais de la vie. Je n'ai pas quitté Rouen depuis un an. Et je n'ai rien contre Léon.",
            manh: "Garnier khai: không rời Rouen suốt một năm, không có ác ý với Léon.",
          },
        ],
        goi: "Hắn vừa nói dối qua điện thoại. Mang lời đó lên bảng ghim.",
      },
    ],
    matThuan: [
      { a: "Garnier khai: không rời Rouen suốt một năm, không có ác ý với Léon.", b: "@ve", t: "MÂU THUẪN: Garnier nói không rời Rouen, nhưng vé tàu cho thấy ba lần đi Paris.", leon: "Vé tàu không biết nói dối, Monsieur Garnier." },
      { a: "Bà Duval: Garnier nói tháng này không hề đặt chân tới Paris.", b: "@ve", t: "MÂU THUẪN: hắn nói với sếp là không đi Paris, nhưng có ba vé tàu.", leon: "Nói dối cả tổng biên tập của mình!" },
      { a: "Garnier khai: không rời Rouen suốt một năm, không có ác ý với Léon.", b: "@cot", t: "MÂU THUẪN: Garnier nói không có ác ý, nhưng hắn viết sách để chứng minh Léon bị dắt mũi.", leon: "Không có ác ý, nhưng cả cuốn sách nhắm vào Léon!" },
    ],
    nang: ["@cot", "@radio", "@hopdong", "MÂU THUẪN: Garnier nói không rời Rouen, nhưng vé tàu cho thấy ba lần đi Paris.", "MÂU THUẪN: hắn nói với sếp là không đi Paris, nhưng có ba vé tàu.", "MÂU THUẪN: Garnier nói không có ác ý, nhưng hắn viết sách để chứng minh Léon bị dắt mũi."],
    ketDu: "Ta đã biết hắn là ai. Giờ chọn ba chứng cứ về lý do hắn làm vậy.",
    ketThieu: { cam: "hum", loi: "Ta hiểu động cơ, nhưng chưa đủ để gỡ án cho Léon. Rồi một phong bì mới gửi tới: chiếc lông vũ xám thứ năm và một câu đố. P.G. muốn chơi tiếp." },
    sauKet: {
      ma: "marcel",
      hoi: "Marcel xin được biết kế hoạch giăng bẫy để « giúp một tay ». Ta có nói cho ông ấy không?",
      a: { gt: "noi", t: "Nói hết cho Marcel", loi: "Marcel gật gù ghi lại ngày giờ, rồi vội vã rời đi." },
      b: { gt: "giau", t: "Giữ kín, chỉ có ta và Léon", loi: "Marcel hơi thất vọng. Léon khẽ gật đầu với ta." },
    },
    theoChon: {
      bruno: {
        giup: { gio: 1, moThem: "Bruno vẫn nhớ món nợ: ông ấy lén gửi trước lịch sử vé SNCF, nên ta có thêm 1 giờ." },
        bao: { moThem: "Bruno không muốn dính vào vụ này, ta phải tự xoay xở." },
      },
    },
  },
  kiosque: {
    ban: { gio: 4, dau: [50, 94] },
    moLai: "Hắn đã thoát một lần. Chủ nhật sau, sạp báo Châtelet, ta đi lại từ đầu.",
    noi: [
      { ma: "do", icon: "thu", ten: "Lá thư câu đố", tom: "Hẹn ở sạp báo", ...dat(SAU, 0), goi: "Ngày mở muộn nhất. Xem bảng giờ." },
      { ma: "gio", icon: "quay", ten: "Bảng giờ sạp báo", tom: "Giờ mở cửa", ...dat(SAU, 1), goi: "Chủ nhật 10 h 30. Ai sẽ ở đó? Hỏi người bán báo." },
      { ma: "tin", icon: "so", ten: "Bản tin của Garnier", tom: "Hắn tả chính mình", ...dat(SAU, 2), goi: "Mũ xám, và báo của hắn. Đặt cạnh lời người bán báo." },
    ],
    them: [
      {
        ma: "dat", icon: "kho", ten: "Sổ đặt báo", tom: "Sổ của sạp báo", ...dat(SAU, 3),
        noi: "Quầy sạp báo", cam: "ngac-nhien",
        leon: "Sổ ghi các khách đặt trước. Có gì lạ không?",
        tl: { loai: "bang", tieuDe: "Commandes du kiosque", van: "Le Monde : 40 exemplaires chaque jour\nLe Figaro : 25 exemplaires chaque jour\nLe Courrier de Rouen : 1 exemplaire, le dimanche seulement, commande spéciale de M. G.\nPrix : 2,50 €" },
        tg: { neo: "1 exemplaire, le dimanche seulement, commande spéciale de M. G.", tu: [["un exemplaire", "một bản (báo)"], ["une commande", "đơn đặt hàng"], ["seulement", "chỉ"]] },
        q: "Combien d'exemplaires du Courrier de Rouen le kiosque reçoit-il ?",
        pa: ["Un seul, le dimanche", "Quarante, chaque jour", "Vingt-cinq, chaque jour", "Aucun"],
        gt: "« 1 exemplaire, le dimanche seulement, commande spéciale de M. G. »: chỉ một người ở Paris mua tờ này tại đây.",
        manh: "Sổ đặt báo: sạp chỉ có 1 bản Le Courrier de Rouen mỗi Chủ nhật, cho « M. G. ».",
        goi: "Chỉ một người cầm tờ báo đó ở quảng trường. Dễ nhận ra rồi.",
      },
      {
        ma: "ban", loai: "hoi", icon: "hoi", ten: "Người bán báo", tom: "Hỏi về khách quen", ...dat(SAU, 4),
        noi: "Sạp báo Châtelet", ai: "Le kiosquier", kienNhan: 2, cam: "lam-viec",
        leon: "Ông bán báo là người Paris chính hiệu: hay càu nhàu nhưng biết hết. Đừng làm ông ấy phật ý.",
        luot: [
          {
            hoi: "Bắt chuyện:",
            pa: ["Bonjour monsieur. Excusez-moi de vous interrompre pendant votre travail.", "Oh, le vieux, tu vends quoi ?", "Interrompez votre travail, je vous l'ordonne."],
            sai: ["Gọi ông ấy là « le vieux », ông ấy đóng sập cửa sạp.", "Ta đã bị tước thẻ, không có quyền ra lệnh."],
            dap: "Vous ne m'interrompez pas. Il n'y a personne à cette heure.",
          },
          {
            hoi: "Hỏi về khách đặt báo Rouen:",
            pa: ["Connaissez-vous le client qui commande Le Courrier de Rouen ?", "Connaissez-vous le client qui il commande ?", "Savez-vous le client que commande ce journal ?"],
            sai: ["« qui » đã là chủ ngữ, không thêm « il ».", "Với người dùng « connaître », và ở đây cần « qui »."],
            dap: "Bien sûr. Il vient ici chaque dimanche depuis trois mois, toujours à la même heure, avec son chapeau gris.",
            manh: "Người bán báo: khách đội mũ xám đến mỗi Chủ nhật suốt ba tháng.",
          },
        ],
        goi: "Mỗi Chủ nhật, mũ xám. Ta sẽ nghe người đó nói gì.",
      },
      {
        ma: "mu", loai: "hoi", icon: "hoi", ten: "Người đội mũ xám", tom: "Đối chất tại chỗ", ...dat(SAU, 5),
        noi: "Quảng trường Châtelet", ai: "L'homme au chapeau gris", kienNhan: 2, cam: "gian",
        leon: "Đừng để lộ là ta biết hắn. Hỏi nhẹ nhàng như người đi đường.",
        luot: [
          {
            hoi: "Làm quen:",
            pa: ["Pardon, monsieur, me permettez-vous de vous poser une question ?", "Bonjour monsieur Garnier !", "Vous êtes P.G., n'est-ce pas ?"],
            sai: ["Gọi tên hắn thì lộ hết bẫy.", "Hắn mỉm cười và lùi một bước. Quá vội."],
            dap: "Je vous en prie.",
          },
          {
            hoi: "Hỏi hắn có hay tới đây không:",
            pa: ["Venez-vous souvent à ce kiosque le dimanche ?", "Venez-vous souvent à ce kiosque le dimanche prochain ?", "Êtes-vous venu souvent demain ?"],
            sai: ["« souvent » không đi với một Chủ nhật cụ thể sắp tới.", "« demain » không đi với passé composé."],
            dap: "Moi ? Jamais. Je ne suis pas de Paris, je passe ici par hasard, pour la première fois.",
            manh: "Người đội mũ xám: chưa bao giờ tới đây, chỉ tình cờ đi ngang lần đầu.",
          },
        ],
        goi: "Lần đầu tới? Người bán báo không nói thế.",
      },
    ],
    matThuan: [
      { a: "Người đội mũ xám: chưa bao giờ tới đây, chỉ tình cờ đi ngang lần đầu.", b: "Người bán báo: khách đội mũ xám đến mỗi Chủ nhật suốt ba tháng.", t: "MÂU THUẪN: hắn nói tới lần đầu, nhưng người bán báo thấy hắn mỗi Chủ nhật suốt ba tháng.", leon: "Ba tháng « tình cờ » đúng một giờ, đúng một chỗ!" },
      { a: "Người đội mũ xám: chưa bao giờ tới đây, chỉ tình cờ đi ngang lần đầu.", b: "@dat", t: "MÂU THUẪN: hắn nói không quen nơi này, nhưng sạp có đơn đặt báo riêng cho « M. G. ».", leon: "Đơn đặt riêng cho một người chưa bao giờ tới!" },
    ],
    nang: ["@gio", "@tin", "@dat", "Người bán báo: khách đội mũ xám đến mỗi Chủ nhật suốt ba tháng.", "MÂU THUẪN: hắn nói tới lần đầu, nhưng người bán báo thấy hắn mỗi Chủ nhật suốt ba tháng.", "MÂU THUẪN: hắn nói không quen nơi này, nhưng sạp có đơn đặt báo riêng cho « M. G. »."],
    ketDu: "Đây là lần duy nhất. Ba bằng chứng, trước mặt tất cả mọi người.",
    ketThieu: { cam: "quyet-tam", loi: "Ta bắt được Paul Garnier, nhưng hắn cười: bằng chứng này không đủ để giữ hắn lâu. Bruno đứng ra nhận vụ án, và Léon được trả lại thẻ. Hắn sẽ trả lời trước toà. Hết mùa một, với một dấu hỏi nhỏ." },
    theoChon: {
      marcel: {
        noi: {
          gio: -1, moThem: "Hắn dường như đã biết trước kế hoạch: ta mất 1 giờ vì quảng trường đầy người lạ.",
          loiKet: { cam: "ngac-nhien", loi: "Vừa còng tay Garnier, Léon thấy Marcel đứng sau lưng hắn, tay cầm tờ giấy ghi kế hoạch của ta. Chính Marcel là nội gián: từ đơn tố cáo đến tủ hồ sơ. « Hắn trả tiền cho quán của tôi », ông ấy cúi đầu. Bruno bước ra từ đám đông, còng nốt người thứ hai. Léon lấy lại thẻ, nhưng mất đi một người bạn. Hết mùa một." },
        },
        giau: {
          loiKet: { cam: "tuyet-voi", loi: "« Monsieur Garnier, je crois que votre chronique s'arrête ici. » Garnier nhìn quanh tìm Marcel, nhưng Marcel chẳng biết gì để báo cho hắn: chính sự im lặng của ta đã làm nội gián lộ mặt. Đơn tố cáo được rút lại, Léon lấy lại thẻ. Garnier mỉm cười, cắm chiếc lông vũ cuối cùng vào túi áo Léon: « Échec et mat, inspecteur. » Hết mùa một. Trợ lý xuất sắc nhất Paris là bạn đấy!" },
        },
      },
    },
  },
};
