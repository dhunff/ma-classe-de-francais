/* Vụ mẫu đủ vòng chơi (31/10, giai đoạn 4): sơ đồ, thẩm vấn, bảng ghim, buộc tội.
 * Có `ban` là chơi theo sơ đồ; vụ không có `ban` vẫn đi thẳng từng cảnh như cũ.
 *   canh[]: mỗi phần tử là MỘT ĐỊA ĐIỂM. canh[0] phải là tài liệu (cản trở « nhân chứng » đối chiếu với nó).
 *     x, y: vị trí trên sơ đồ, tính theo %. goi: Léon gợi ý, hiện ở sơ đồ sau khi đến đó.
 *     dong: địa điểm đóng khi số giờ còn lại nhỏ hơn số này.
 *     loai "hoi": thẩm vấn. pa[0] đúng sắc thái; sai[k] là phản ứng với pa[k + 1]; dap là lời đáp.
 *   matThuan: cặp manh mối mâu thuẫn. nang: manh mối đủ nặng để buộc tội (cần 3).
 * Manh mối định danh bằng chính câu chữ, nên dùng chung hằng M. KHÔNG dùng dấu gạch dài (quy tắc 7). */
const M = {
  email: "Tranh thật về bảo tàng thứ Ba lúc 14 h; một nhân viên phải ký nhận.",
  truc: "Thứ Ba Bernard nghỉ phép; Karim trực quầy lễ tân thay.",
  phieu: "Phiếu giao hàng: K. Benali nhận tranh lúc 14 h 05.",
  copie: "Thứ Ba 13 h: Karim mượn bản chép của Margaux, đến giờ chưa trả.",
  nhom: "Sổ đoàn khách: thứ Ba không có đoàn nào.",
  khoa: "Bernard giao chìa khoá kho tranh cho Karim tối thứ Hai.",
  khai: "Karim khai: thứ Ba 14 h anh ở tầng 2 với một đoàn khách, không gặp người giao hàng.",
  muon: "Karim khai: anh mượn bản chép để cho khách du lịch xem.",
  mt1: "MÂU THUẪN: Karim nói không gặp người giao hàng, nhưng chính anh ký nhận tranh lúc 14 h 05.",
  mt2: "MÂU THUẪN: Karim nói đi cùng đoàn khách, nhưng thứ Ba không có đoàn nào.",
};

export const VU_TABLEAU = {
  id: "tableau", muc: "vua", so: 4,
  ten: "Le faux tableau", tenVi: "Bức tranh giả",
  mo: "Bảo tàng nhỏ ở Montmartre phát hiện bức « Les Toits de Paris » trên tường chỉ là bản sao. Bức thật đã bị tráo. Trên khung tranh có một chiếc lông vũ xám và tờ giấy nhỏ ký « P.G. ». Ta chỉ có 5 giờ trước khi báo chí biết chuyện, không đủ đi hết mọi nơi. Chọn đường cho khéo, trợ lý.",
  moLai: "Lần trước hung thủ đã thoát vì ta thiếu bằng chứng. Tranh thật vẫn còn đâu đó trong bảo tàng. Làm lại từ đầu, lần này chọn đường kỹ hơn.",
  nghiPham: [
    { ten: "Bernard", vai: "Bảo vệ bảo tàng, làm ở đây 20 năm" },
    { ten: "Margaux", vai: "Họa sĩ, đang chép tranh cho lớp học" },
    { ten: "Karim Benali", vai: "Hướng dẫn viên, thay ca khi thiếu người" },
  ],
  ban: { gio: 5, dau: [50, 94] },
  canh: [
    {
      ma: "bureau", icon: "thu", ten: "Văn phòng giám đốc", tom: "Email về ngày tranh trở lại", x: 16, y: 20,
      noi: "Văn phòng giám đốc", cam: "lam-viec",
      leon: "Bức tranh vừa đi phục chế về. Nó trở lại bảo tàng lúc nào?",
      tl: { loai: "email", tieuDe: "Objet : Retour du tableau", van: "De : directrice@musee-montmartre.fr\nÀ : équipe\n\nBonjour à tous,\nL'atelier de restauration nous rapporte « Les Toits de Paris » mardi, vers 14 h. Quelqu'un de l'équipe devra signer le bon de livraison et vérifier le tableau avant de l'accrocher.\nMerci,\nClaire Fontaine" },
      tg: { neo: "mardi, vers 14 h", tu: [["l'atelier", "xưởng"], ["signer", "ký tên"], ["le bon de livraison", "phiếu giao hàng"]] },
      q: "Quand le tableau revient-il au musée ?",
      pa: ["Mardi, vers 14 h", "Lundi matin", "Mercredi soir", "Jeudi, vers midi"],
      gt: "« mardi, vers 14 h ». Người ký nhận hôm đó là người cầm tranh trong tay đầu tiên.",
      manh: M.email, goi: "Ai đã ký phiếu giao hàng hôm đó? Xuống kho tranh xem.",
    },
    {
      ma: "accueil", icon: "quay", ten: "Quầy lễ tân", tom: "Lịch trực trong tuần", x: 50, y: 66,
      noi: "Quầy lễ tân", cam: "hum",
      leon: "Bernard nói ông chẳng biết gì. Lịch trực có nói thật không?",
      tl: { loai: "bang", tieuDe: "Planning de la semaine", van: "Lundi : Bernard (8 h – 16 h)\nMardi : Bernard en congé · Karim remplace à l'accueil\nMercredi : Bernard en congé\nJeudi : Bernard (8 h – 16 h)" },
      tg: { neo: "Mardi : Bernard en congé · Karim remplace à l'accueil", tu: [["en congé", "nghỉ phép"], ["remplace", "thay thế"], ["l'accueil", "quầy lễ tân"]] },
      q: "Qui était à l'accueil mardi ?",
      pa: ["Karim", "Bernard", "Margaux", "La directrice"],
      gt: "« Mardi : Bernard en congé · Karim remplace à l'accueil ». Bernard nghỉ phép đúng hôm tranh về.",
      manh: M.truc, goi: "Bernard nghỉ, vậy chìa khoá kho nằm ở đâu? Gọi hỏi ông ấy, hoặc nói chuyện thẳng với Karim.",
    },
    {
      ma: "reserve", icon: "kho", ten: "Kho tranh", tom: "Phiếu giao hàng của xưởng", x: 84, y: 20,
      noi: "Kho tranh", cam: "ngac-nhien",
      leon: "Phiếu giao hàng còn kẹp trong sổ kho. Ai đã nhận tranh?",
      tl: { loai: "hoaDon", tieuDe: "Bon de livraison n° 418", van: "Atelier Lebrun · Restauration\nŒuvre : « Les Toits de Paris »\nLivré au musée : mardi, 14 h 05\nReçu par : K. Benali\nRemarque : tableau vérifié, rien à signaler." },
      tg: { neo: "Reçu par : K. Benali", tu: [["l'œuvre", "tác phẩm"], ["livré", "đã giao"], ["reçu par", "được nhận bởi"]] },
      q: "Qui a reçu le tableau au musée ?",
      pa: ["K. Benali", "Claire Fontaine", "Bernard", "L'atelier Lebrun"],
      gt: "« Reçu par : K. Benali ». Karim Benali là người cầm bức tranh thật lúc 14 h 05.",
      manh: M.phieu, goi: "Karim nhận tranh. Anh ta sẽ nói gì về chuyện đó? Thẩm vấn đi.",
    },
    {
      ma: "billetterie", icon: "so", ten: "Quầy vé", tom: "Sổ đăng ký đoàn khách", x: 16, y: 66,
      noi: "Quầy vé", cam: "suy-nghi",
      leon: "Sổ này ghi mọi đoàn đến thăm bảo tàng. Xem hôm thứ Ba có gì.",
      tl: { loai: "bang", tieuDe: "Registre des groupes", van: "Lundi : école Jules-Ferry, 25 élèves (10 h)\nMardi : aucun groupe\nMercredi : club des retraités, 12 personnes (15 h)\nJeudi : aucun groupe" },
      tg: { neo: "Mardi : aucun groupe", tu: [["les élèves", "học sinh"], ["aucun", "không có... nào"], ["les retraités", "người về hưu"]] },
      q: "Combien de groupes sont venus au musée mardi ?",
      pa: ["Aucun", "Un seul", "Deux", "Vingt-cinq"],
      gt: "« Mardi : aucun groupe ». Ai nói thứ Ba đi cùng đoàn khách thì đang nói dối.",
      manh: M.nhom, goi: "Thứ Ba không có đoàn nào. Ai từng nhắc tới khách du lịch nhỉ?",
    },
    {
      ma: "atelier", icon: "xuong", ten: "Xưởng của Margaux", tom: "Sổ tay của họa sĩ", x: 84, y: 66, dong: 2,
      noi: "Xưởng của Margaux", cam: "suy-nghi",
      leon: "Margaux có bản chép rất giống tranh thật. Đáng ngờ đấy! Xem sổ tay của cô ấy.",
      tl: { loai: "note", tieuDe: "Carnet de Margaux", van: "Lundi : j'ai fini ma copie des « Toits de Paris » pour le cours du soir.\nMardi : Karim m'a demandé de lui prêter ma copie « pour la montrer à un groupe de touristes ». Je la lui ai donnée à 13 h.\nJeudi : il ne me l'a toujours pas rendue…" },
      tg: { neo: "Je la lui ai donnée à 13 h.", tu: [["prêter", "cho mượn"], ["la copie", "bản sao"], ["rendue", "đã trả lại"]] },
      q: "Qu'est-ce que Margaux a fait mardi ?",
      pa: ["Elle a prêté sa copie à Karim", "Elle a vendu sa copie au musée", "Elle a fini sa copie", "Elle a donné un cours aux touristes"],
      gt: "« Karim m'a demandé de lui prêter ma copie… Je la lui ai donnée à 13 h », một tiếng TRƯỚC khi tranh thật về.",
      manh: M.copie, goi: "Karim giữ bản chép và kêu là cho khách du lịch xem. Kiểm tra sổ đoàn khách xem sao.",
    },
    {
      ma: "karim", loai: "hoi", icon: "hoi", ten: "Phòng hướng dẫn viên", tom: "Thẩm vấn Karim Benali", x: 50, y: 20,
      noi: "Phòng hướng dẫn viên", ai: "Karim Benali", kienNhan: 2,
      leon: "Karim là nhân viên, không phải nghi phạm chính thức. Hỏi lịch sự, dùng « vous », không thì anh ta im ngay.",
      luot: [
        {
          hoi: "Mở lời với Karim:",
          pa: ["Bonjour monsieur, pourriez-vous répondre à quelques questions ?", "Salut Karim, tu réponds à mes questions ?", "Répondez tout de suite !"],
          sai: ["Karim nhíu mày: ta đâu có thân với anh ta mà xưng « tu ».", "Karim khoanh tay: câu mệnh lệnh này quá thô lỗ."],
          dap: "Bien sûr. Je vous écoute.",
        },
        {
          hoi: "Hỏi anh ta ở đâu lúc tranh về:",
          pa: ["Où étiez-vous mardi vers 14 h ?", "Tu étais où mardi, hein ?", "Où êtes-vous allé demain ?"],
          sai: ["Lại « tu » và « hein », giọng này giống hỏi bạn nhậu hơn là thẩm vấn.", "« demain » là ngày mai, không đi với passé composé. Karim nhìn ta như nhìn người lạ."],
          dap: "Mardi à 14 h, j'étais au deuxième étage avec un groupe de touristes. Je n'ai pas vu le livreur.",
          manh: M.khai,
        },
        {
          hoi: "Hỏi về bản chép của Margaux:",
          pa: ["Pourquoi avez-vous emprunté la copie de Margaux ?", "Pourquoi tu as volé la copie, voleur ?", "Pourquoi avez-vous la copie emprunté ?"],
          sai: ["Buộc tội khi chưa có bằng chứng: Karim đòi gọi luật sư.", "Sai trật tự từ: phân từ « emprunté » phải đứng ngay sau « avez-vous »."],
          dap: "C'était pour la montrer aux touristes. Je vais la rendre bientôt.",
          manh: M.muon,
        },
      ],
      goi: "Karim vừa cho ta hai lời khai. Đặt chúng cạnh các tài liệu trên bảng ghim.",
    },
    {
      ma: "bernard", loai: "hoi", icon: "goi", ten: "Gọi cho Bernard", tom: "Điện thoại tới Honfleur", x: 50, y: 42,
      noi: "Điện thoại", ai: "Bernard", kienNhan: 2,
      leon: "Bernard đang nghỉ ở Honfleur. Ông ấy lớn tuổi và rất trọng lễ nghĩa.",
      luot: [
        {
          hoi: "Mở đầu cuộc gọi:",
          pa: ["Allô, monsieur Bernard ? Excusez-moi de vous déranger.", "Allô, c'est qui ?", "Allô Bernard, ça va, mon vieux ?"],
          sai: ["Chính ta gọi người ta mà lại hỏi « c'est qui ? ». Bernard suýt cúp máy.", "Quá suồng sã với một người vừa gặp lần đầu."],
          dap: "Vous ne me dérangez pas. Que puis-je faire pour vous ?",
        },
        {
          hoi: "Hỏi về chìa khoá kho tranh:",
          pa: ["Qui avait les clés de la réserve mardi ?", "Les clés de la réserve, ils sont où ?", "Donne-moi les clés !"],
          sai: ["« clés » là giống cái, phải là « elles », và câu hỏi này cũng chưa hỏi đúng ý.", "Vừa « tu » vừa ra lệnh, Bernard hừ một tiếng."],
          dap: "Je les ai données à Karim lundi soir, avant de partir à Honfleur.",
          manh: M.khoa,
        },
      ],
      goi: "Karim có chìa khoá kho. Ông Bernard thì ở Honfleur từ tối thứ Hai.",
    },
  ],
  matThuan: [
    { a: M.khai, b: M.phieu, t: M.mt1, leon: "Hắn nói không gặp người giao hàng, vậy chữ ký trên phiếu là của ai?" },
    { a: M.khai, b: M.nhom, t: M.mt2, leon: "Đoàn khách nào? Sổ ghi rõ thứ Ba không có đoàn nào cả!" },
    { a: M.muon, b: M.nhom, t: M.mt2, leon: "Không có đoàn nào thì bản chép đâu cần « cho khách xem »!" },
  ],
  nang: [M.phieu, M.copie, M.khoa, M.mt1, M.mt2],
  ket: {
    cam: "suy-nghi", leon: "Ai có cả bản chép LẪN cơ hội cầm bức thật trong tay vào chiều thứ Ba?",
    q: "Qui a échangé les tableaux ?",
    pa: ["Karim, le guide", "Bernard, le gardien", "Margaux, la peintre"],
    gt: "Bernard ở Honfleur, Margaux đã giao bản chép từ 13 h. Chỉ Karim có bản chép, chìa khoá và phiếu nhận tranh.",
  },
  ketDu: "Ghim ba bằng chứng lên bàn giám đốc. Thiếu thì Karim sẽ chối, còn ta sẽ để hắn thoát.",
  loiKet: { cam: "gian", loi: "Trước ba bằng chứng, Karim khai hết: một người lạ ký « P.G. » gửi thư chỉ cho anh ta cách tráo tranh, hứa trả rất nhiều tiền. Tranh thật tìm thấy trong tủ đồ của Karim. Nhưng P.G. là ai? Chiếc lông vũ xám lần thứ hai rồi…" },
  ketThieu: { cam: "hum", loi: "Tìm được tranh thật trong tủ đồ của Karim, nhưng hồ sơ còn mỏng nên luật sư của anh ta cãi được nửa vụ. Karim nhận tội nhẹ và không nói gì về P.G. Vụ án đóng lại với hạng B." },
};
