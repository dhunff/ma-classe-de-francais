/* Phiên toà của « Phiên toà ngữ pháp » (31/10). Người chơi là luật sư, lỗi ngữ pháp trong lời khai là sơ hở.
 * LUAT: điều luật để viện dẫn, ten bằng tiếng Pháp, mo giải thích bằng tiếng Việt.
 * VU_TOA: mỗi nhân chứng có các dòng khai. dich là bản dịch, hiện ở mức Dễ.
 * loi: { tu: đúng một từ sai trong dòng, dung: dạng đúng, sai: hai dạng nhiễu, luat: mã điều luật, gt: lời giải }.
 * them: dòng khai ẩn, chỉ lộ khi luật sư « Hỏi thêm » ở dòng đó. hoi là câu luật sư hỏi, tang là tang vật nhận được.
 * mau: { tang, gt }: dòng mâu thuẫn với tang vật tang, phải trình đúng tang vật mới phá được.
 * tangVat: tang vật có sẵn từ đầu phiên, tang: mọi tang vật của vụ.
 * doiDap: Maître Corbeau phản đối sau mỗi nhân chứng. cau là câu bị phản đối, dung: câu thật sự đúng (tức ông ấy nói sai),
 *   loi là lời ông ấy, dich bản dịch, luat điều luật liên quan, gt lời giải.
 * bienHo: ba lượt chọn câu cho bài biện hộ. tag: ly | dep | tinh là kiểu lập luận, sai: câu mắc lỗi ngữ pháp kèm gt.
 * Tình huống hư cấu. Không dùng dấu gạch dài. */

/* Chương của Bộ luật. Mỗi điều: chuong, cap (trình độ), so (số điều), ten, mo, vd (ví dụ đúng). */
/* Bảy bồi thẩm. thich: điều người đó coi trọng, hiện ở cảnh bỏ phiếu. Mã trùng với BANG_TAC_DONG trong phienToa/luat.js. */
export const BOI_THAM = [
  { ma: "kho_tinh", ten: "Mme Puriste", thich: "soi từng lỗi hợp giống số", mau: "#7c3aed", da: "#fcd9b6", mauToc: "#e5e7eb", kinh: true, toc: "M11 26c-1-12 6-17 13-17s14 5 13 17c-3-6-7-8-13-8s-10 2-13 8z" },
  { ma: "voi_vang", ten: "M. Pressé", thich: "thích người trả lời nhanh", mau: "#0369a1", da: "#e8b98f", mauToc: "#111827", toc: "M12 22c2-9 7-11 12-11s10 2 12 11c-4-3-8-4-12-4s-8 1-12 4z" },
  { ma: "nha_tho", ten: "Mlle Verlaine", thich: "yêu lời văn đẹp", mau: "#be185d", da: "#fcd9b6", mauToc: "#92400e", toc: "M9 34c-2-18 7-25 15-25s17 7 15 25c-2-8-3-13-6-15-5 2-13 2-18 0-3 2-4 7-6 15z" },
  { ma: "cong_chung", ten: "Me Notaire", thich: "chỉ tin điều luật viện dẫn đúng", mau: "#374151", da: "#f3d1b0", mauToc: "#6b7280", kinh: true, toc: "M12 24c0-8 6-13 12-13s12 5 12 13c-2-5-3-6-5-7-4 1-10 1-14 0-2 1-3 2-5 7z" },
  { ma: "bac_si", ten: "Dr Preuve", thich: "cần chứng cứ rõ ràng", mau: "#047857", da: "#c98f65", mauToc: "#1f2937", toc: "M12 23c1-9 7-12 12-12s11 3 12 12c-7-5-17-5-24 0z" },
  { ma: "sinh_vien", ten: "Julien", thich: "muốn thấy câu được sửa đúng", mau: "#b45309", da: "#fcd9b6", mauToc: "#451a03", toc: "M11 25c-1-7 3-15 13-15 8 0 14 6 13 15-2-4-5-7-8-7-1 2-3 3-6 3-2 0-3-1-4-2-3 1-6 3-8 6z" },
  { ma: "hang_xom", ten: "Mme Voisine", thich: "ghét phản đối vô căn cứ", mau: "#9f1239", da: "#e8b98f", mauToc: "#57534e", toc: "M12 25c-2-9 5-15 12-15s14 6 12 15c-1-3-3-6-5-7-5 2-9 2-14 0-2 1-4 4-5 7z" },
];

export const CHUONG = {
  nom: "Le nom et l'article",
  adj: "L'adjectif",
  verbe: "Le verbe",
  passe: "Le passé",
  temps: "Temps et modes",
  pron: "Pronoms et prépositions",
};

export const LUAT = {
  mao_tu_giong: { so: 1, chuong: "nom", cap: "A1", ten: "Genre de l'article", mo: "Mạo từ hợp giống và số với danh từ.", vd: "un sac, une table, des sacs" },
  mao_tu_ghep: { so: 2, chuong: "nom", cap: "A1", ten: "Articles contractés", mo: "à + le thành au, à + les thành aux, de + le thành du, de + les thành des.", vd: "Je vais au marché." },
  so_nhieu: { so: 3, chuong: "nom", cap: "A1", ten: "Pluriel du nom", mo: "Danh từ số nhiều thường thêm -s, từ tận cùng -eau thêm -x.", vd: "des livres, des gâteaux" },
  luoc_am: { so: 4, chuong: "nom", cap: "A1", ten: "L'élision", mo: "le, la, je, ne, que mất nguyên âm trước nguyên âm hoặc h câm.", vd: "l'ami, j'habite" },
  sau_phu_dinh: { so: 5, chuong: "nom", cap: "A2", ten: "L'article après la négation", mo: "Sau phủ định, un, une, du, de la, des thành de.", vd: "Je n'ai pas de voiture." },
  hop_tinh_tu: { so: 6, chuong: "adj", cap: "A1", ten: "Accord de l'adjectif", mo: "Tính từ hợp giống và số với danh từ mà nó bổ nghĩa.", vd: "un grand sac, une grande table" },
  so_huu: { so: 7, chuong: "adj", cap: "A1", ten: "L'adjectif possessif", mo: "son, sa, ses theo giống của vật được sở hữu, không theo người sở hữu.", vd: "sa mère, son père" },
  vi_tri_tinh_tu: { so: 8, chuong: "adj", cap: "A2", ten: "Place de l'adjectif", mo: "Phần lớn tính từ đứng sau danh từ, một số từ ngắn như grand, petit, bon đứng trước.", vd: "une robe rouge, un petit sac" },
  bel_nouvel: { so: 9, chuong: "adj", cap: "A2", ten: "Beau, nouveau, vieux", mo: "Trước danh từ giống đực mở đầu bằng nguyên âm, chúng thành bel, nouvel, vieil.", vd: "un bel homme, un nouvel ami" },
  so_sanh: { so: 10, chuong: "adj", cap: "A2", ten: "Le comparatif", mo: "plus, moins, aussi + tính từ + que; bon thành meilleur.", vd: "Ce pain est meilleur que l'autre." },
  chia_dong_tu: { so: 11, chuong: "verbe", cap: "A1", ten: "Accord du verbe", mo: "Động từ chia theo chủ ngữ: hai người trở lên thì chia số nhiều.", vd: "Paul et Anne parlent." },
  bat_quy_tac: { so: 12, chuong: "verbe", cap: "A1", ten: "Verbes irréguliers", mo: "aller, faire, prendre, venir chia bất quy tắc ở hiện tại.", vd: "ils vont, ils font, ils prennent" },
  phu_dinh: { so: 13, chuong: "verbe", cap: "A1", ten: "La négation", mo: "Phủ định gồm hai phần ne và pas đứng hai bên động từ đã chia.", vd: "Je ne sais pas." },
  on_chia: { so: 14, chuong: "verbe", cap: "A2", ten: "Le pronom on", mo: "on chia như il và elle, dù nghĩa là « chúng ta ».", vd: "On va au cinéma." },
  tro_dong_tu: { so: 15, chuong: "passe", cap: "A2", ten: "Choix de l'auxiliaire", mo: "Các động từ chỉ di chuyển như arriver, partir, venir dùng trợ động từ être.", vd: "Elle est arrivée." },
  hop_etre: { so: 16, chuong: "passe", cap: "A2", ten: "Accord avec être", mo: "Động từ đi với être: participe passé hợp giống và số với chủ ngữ.", vd: "Elle est partie." },
  phan_than: { so: 17, chuong: "passe", cap: "A2", ten: "Verbes pronominaux", mo: "Động từ phản thân dùng être ở passé composé.", vd: "Je me suis levé." },
  pp_bat_quy_tac: { so: 18, chuong: "passe", cap: "A2", ten: "Participes irréguliers", mo: "Nhiều participe passé bất quy tắc: pris, fait, vu, mis.", vd: "J'ai pris le bus." },
  hop_avoir: { so: 19, chuong: "passe", cap: "B1", ten: "Accord avec avoir", mo: "Với avoir, participe passé hợp với bổ ngữ trực tiếp khi nó đứng trước động từ.", vd: "la lettre que j'ai écrite" },
  imparfait: { so: 20, chuong: "passe", cap: "B1", ten: "Imparfait et passé composé", mo: "Imparfait tả bối cảnh, passé composé kể hành động đã xong.", vd: "Il pleuvait quand je suis sorti." },
  futur: { so: 21, chuong: "temps", cap: "A2", ten: "Le futur simple", mo: "Futur simple: gốc nguyên mẫu cộng -ai, -as, -a, -ons, -ez, -ont.", vd: "Je parlerai demain." },
  si_dieu_kien: { so: 22, chuong: "temps", cap: "B1", ten: "La condition avec si", mo: "Si + présent đi với futur, si + imparfait đi với conditionnel. Không dùng futur hay conditionnel ngay sau si.", vd: "Si tu viens, je serai content." },
  subjonctif: { so: 23, chuong: "temps", cap: "B1", ten: "Le subjonctif", mo: "Sau il faut que, vouloir que, bien que dùng subjonctif.", vd: "Il faut que tu viennes." },
  quand_futur: { so: 24, chuong: "temps", cap: "B2", ten: "Quand et le futur", mo: "Nói về tương lai thì sau quand dùng futur, khác với tiếng Anh.", vd: "Quand il arrivera, je partirai." },
  gian_tiep: { so: 25, chuong: "temps", cap: "B2", ten: "Le discours rapporté", mo: "Thuật lại lời nói trong quá khứ thì futur thành conditionnel, présent thành imparfait.", vd: "Il a dit qu'il viendrait." },
  dai_tu_bo_ngu: { so: 26, chuong: "pron", cap: "A2", ten: "Pronoms compléments", mo: "le, la, les thay bổ ngữ trực tiếp, lui, leur thay bổ ngữ gián tiếp.", vd: "Je le vois, je lui parle." },
  gioi_tu_noi: { so: 27, chuong: "pron", cap: "A2", ten: "Prépositions de lieu", mo: "à + thành phố, en + nước giống cái, au + nước giống đực.", vd: "à Paris, en France, au Japon" },
  quan_he: { so: 28, chuong: "pron", cap: "B1", ten: "Pronoms relatifs", mo: "qui làm chủ ngữ, que làm bổ ngữ, dont thay cho de, où chỉ nơi chốn.", vd: "le livre que je lis" },
  y_en: { so: 29, chuong: "pron", cap: "B1", ten: "Les pronoms y et en", mo: "y thay à + vật hoặc nơi, en thay de + vật.", vd: "J'y vais, j'en veux." },
  dai_tu_nhan_manh: { so: 30, chuong: "pron", cap: "A2", ten: "Pronoms toniques", mo: "Sau giới từ dùng moi, toi, lui, elle, nous, vous, eux, elles.", vd: "avec moi, chez eux" },
};

export const VU_TOA = [
  {
    id: "livre-recettes",
    ten: "L'affaire du livre de recettes",
    bi_cao: "Thomas",
    bienHo: [
      { hoi: "Mở đầu bài biện hộ", pa: [
        { van: "Mesdames et messieurs, les faits sont clairs.", dich: "Thưa quý vị, sự việc đã rõ ràng.", tag: "ly" },
        { van: "Mesdames et messieurs, Thomas est un jeune homme honnête.", dich: "Thưa quý vị, Thomas là một chàng trai trung thực.", tag: "tinh" },
        { van: "Mesdames et messieurs, les faits sont clair.", dich: "Thưa quý vị, sự việc đã rõ ràng.", sai: "« Faits » là số nhiều nên phải viết « clairs »." },
      ] },
      { hoi: "Lập luận chính", pa: [
        { van: "La feuille de présence prouve qu'il n'était pas là.", dich: "Bảng chấm công chứng minh cậu ấy không có mặt.", tag: "ly" },
        { van: "La vérité finit toujours par lever, comme le pain du matin.", dich: "Sự thật rồi sẽ nở ra, như ổ bánh mì buổi sớm.", tag: "dep" },
        { van: "Les témoins a menti devant vous.", dich: "Các nhân chứng đã nói dối trước quý vị.", sai: "Chủ ngữ số nhiều nên phải là « ont menti »." },
      ] },
      { hoi: "Lời kết", pa: [
        { van: "Rendez-lui son travail et sa dignité.", dich: "Hãy trả lại cho cậu ấy công việc và phẩm giá.", tag: "tinh" },
        { van: "Que la justice soit douce comme un croissant chaud.", dich: "Mong công lý ngọt ngào như chiếc bánh sừng bò nóng.", tag: "dep" },
        { van: "Je vous demande de le acquitter.", dich: "Tôi xin quý vị tha bổng cậu ấy.", sai: "« Le » trước nguyên âm phải lược âm: « de l'acquitter »." },
      ] },
    ],
    tangVat: ["feuille"],
    tang: {
      feuille: { ten: "Feuille de présence", van: "Lundi : Thomas arrive à 9 h.", dich: "Thứ Hai: Thomas đến lúc 9 giờ." },
      recu: { ten: "Reçu de l'opticien", van: "M. Renard : lunettes en réparation du lundi au jeudi.", dich: "Ông Renard: kính đang sửa từ thứ Hai đến thứ Năm." },
    },
    mo: "Trật tự! Cuốn công thức bí mật của tiệm bánh Lefort đã biến mất, và thợ học việc Thomas bị tố lấy trộm. Bạn là luật sư của Thomas. Ở toà này, lời khai sai ngữ pháp là lời khai mất giá trị. Nghe kỹ, thấy sơ hở thì hô OBJECTION!",
    thang: "Hai lời khai đều đầy sơ hở, bồi thẩm đoàn tuyên Thomas vô tội. Còn cuốn công thức ư? Bà Lefort tìm thấy nó sau tủ lò nướng.",
    thua: "Lời khai còn đứng vững nên bồi thẩm đoàn chưa tin Thomas. Phiên toà sau, ta mong bạn bắt lỗi chắc tay hơn.",
    nhanChung: [
      {
        ten: "Claire Lefort", vai: "Chủ tiệm bánh", mau: "#be185d",
        gioiThieu: "Nhân chứng đầu tiên là bà Claire Lefort, chủ tiệm bánh. Nhớ rằng người nói là phụ nữ nhé.",
        doiDap: [
          { cau: "Thomas est arrivé à neuf heures.", dung: true, loi: "Objection ! Il faut écrire « arrivée » avec un e !", dich: "Phản đối! Phải viết « arrivée » có chữ e!", luat: "hop_etre", gt: "Thomas là nam, số ít, nên « arrivé » là đúng. Corbeau cố tình dồn bạn." },
          { cau: "Mon client n'a pas pris le livres.", dung: false, loi: "Objection ! « Livres » est au pluriel, il faut « les livres » !", dich: "Phản đối! « Livres » là số nhiều, phải là « les livres »!", luat: "mao_tu_giong", gt: "Corbeau nói đúng: mạo từ phải hợp số với danh từ, viết « les livres » hoặc « le livre »." },
        ],
        dong: [
          { van: "Je m'appelle Claire Lefort et je suis boulangère depuis vingt ans.", dich: "Tôi tên Claire Lefort, làm thợ bánh đã hai mươi năm." },
          { van: "Lundi matin, je suis allé à la boulangerie à six heures.", dich: "Sáng thứ Hai, tôi đến tiệm bánh lúc sáu giờ.",
            loi: { tu: "allé", dung: "allée", sai: ["allés", "aller"], luat: "hop_etre", gt: "Người nói là phụ nữ và động từ đi với être, nên phải viết « allée »." } },
          { van: "Le livre de recettes était sur la table de la cuisine.", dich: "Cuốn công thức nằm trên bàn bếp.",
            them: { hoi: "Qui était dans la cuisine ce matin-là ?", van: "Thomas était seul dans la cuisine à huit heures.", dich: "Lúc tám giờ, Thomas ở một mình trong bếp.",
              mau: { tang: "feuille", gt: "Bảng chấm công ghi Thomas đến lúc 9 giờ, vậy lúc 8 giờ cậu ấy chưa có mặt ở tiệm." } } },
          { van: "À sept heures, Thomas a arrivé avec son vélo.", dich: "Lúc bảy giờ, Thomas đến bằng xe đạp.",
            loi: { tu: "a", dung: "est", sai: ["ont", "as"], luat: "tro_dong_tu", gt: "« Arriver » là động từ chỉ di chuyển, dùng être: « Thomas est arrivé »." } },
          { van: "Quand je suis revenue, le livre n'était plus là.", dich: "Khi tôi quay lại, cuốn sách không còn ở đó." },
        ],
      },
      {
        ten: "Louis Renard", vai: "Khách quen", mau: "#0369a1",
        gioiThieu: "Nhân chứng thứ hai là ông Louis Renard, khách quen của tiệm. Ông ấy nói rất tự tin, đừng để bị lừa.",
        doiDap: [
          { cau: "Thomas a pris son sac.", dung: true, loi: "Objection ! Thomas est un homme, il faut dire « sa sac » !", dich: "Phản đối! Thomas là đàn ông, phải nói « sa sac »!", luat: "so_huu", gt: "« Sac » giống đực nên dùng « son ». Tính từ sở hữu theo vật được sở hữu, không theo người." },
          { cau: "Thomas et Claire travaille ensemble.", dung: false, loi: "Objection ! Le sujet est au pluriel, il faut « travaillent » !", dich: "Phản đối! Chủ ngữ số nhiều, phải là « travaillent »!", luat: "chia_dong_tu", gt: "Corbeau nói đúng: hai người làm chủ ngữ nên động từ chia số nhiều." },
        ],
        dong: [
          { van: "Je suis un client fidèle de cette boulangerie.", dich: "Tôi là khách quen của tiệm bánh này.",
            them: { hoi: "Vous venez ici tous les jours ?", van: "Oui, sauf quand je vais chez l'opticien.", dich: "Vâng, trừ những hôm tôi đi hiệu kính.", tang: "recu" } },
          { van: "Lundi, j'ai vu Thomas devant la porte.", dich: "Thứ Hai, tôi thấy Thomas trước cửa.",
            them: { hoi: "Comment était Thomas ce jour-là ?", van: "Il semblait avoir une problème avec son vélo.", dich: "Cậu ấy có vẻ gặp trục trặc với chiếc xe đạp.",
              loi: { tu: "une", dung: "un", sai: ["des", "la"], luat: "mao_tu_giong", gt: "« Problème » là danh từ giống đực dù tận cùng bằng -e, nên phải nói « un problème »." } } },
          { van: "Il portait un grande sac noir.", dich: "Cậu ấy mang một chiếc túi đen lớn.",
            loi: { tu: "grande", dung: "grand", sai: ["grands", "grandes"], luat: "hop_tinh_tu", gt: "« Sac » là danh từ giống đực số ít, nên tính từ phải là « grand »." } },
          { van: "Ensuite, Thomas et son ami prend le bus.", dich: "Sau đó, Thomas và bạn cậu ấy lên xe buýt.",
            loi: { tu: "prend", dung: "prennent", sai: ["prends", "prenez"], luat: "chia_dong_tu", gt: "Chủ ngữ có hai người nên chia số nhiều: « prennent »." } },
          { van: "Je suis sûr de ce que j'ai vu.", dich: "Tôi chắc chắn về những gì mình đã thấy.",
            them: { hoi: "Vous voyez bien de loin ?", van: "Oui, ce lundi-là, je portais mes lunettes.", dich: "Vâng, hôm thứ Hai đó tôi đeo kính.",
              mau: { tang: "recu", gt: "Biên lai cho thấy kính của ông Renard đang được sửa từ thứ Hai, nên hôm đó ông không đeo kính." } } },
        ],
      },
    ],
  },
];
