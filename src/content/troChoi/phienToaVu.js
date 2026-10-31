/* Tám vụ còn lại của phiên toà (31/10). Quy ước như phienToa.js, vụ đầu tiên nằm ở đó.
 * Mỗi vụ xoay quanh một mảng ngữ pháp. Tình huống hư cấu. Không dùng dấu gạch dài.
 * Vụ cuối nối tiếp Thám tử mùa 1: Paul Garnier ra toà, còn ở mùa 2 hắn đã ngồi tù nên thua phiên này
 * cũng chỉ là hoãn xử, không được để hắn tự do. Ở vụ đó người chơi đứng về phía nguyên, thắng là « Coupable ». */

const L = (tu, dung, sai, luat, gt) => ({ tu, dung, sai, luat, gt });

export const VU_THEM = [
  {
    id: "chat-perdu", muc: "de", chuDe: "Mạo từ và danh từ",
    ten: "L'affaire du chat perdu", bi_cao: "Léa",
    mo: "Con mèo của bà Dubois đã biến mất, và cô hàng xóm Léa bị tố giấu nó. Bạn là luật sư của Léa. Vụ này hãy soi kỹ mạo từ và số nhiều của danh từ.",
    thang: "Bồi thẩm đoàn tuyên Léa vô tội. Còn con mèo? Nó đang ngủ trên mái nhà bên cạnh.",
    thua: "Lời khai vẫn đứng vững nên Léa chưa được giải oan. Lần sau hãy nghe kỹ từng mạo từ.",
    tangVat: ["billet"],
    tang: {
      billet: { ten: "Billet de train de Léa", van: "Samedi : départ 9 h, retour 18 h.", dich: "Thứ Bảy: đi lúc 9 giờ, về lúc 18 giờ." },
      planning: { ten: "Planning du gardien", van: "Samedi : jour de repos, pas de travail.", dich: "Thứ Bảy: ngày nghỉ, không làm việc." },
    },
    bienHo: [
      { hoi: "Mở đầu bài biện hộ", pa: [
        { van: "Mesdames et messieurs, Léa n'était pas là samedi.", dich: "Thưa quý vị, thứ Bảy Léa không có ở đó.", tag: "ly" },
        { van: "Mesdames et messieurs, Léa aime tous les animaux.", dich: "Thưa quý vị, Léa yêu mọi loài vật.", tag: "tinh" },
        { van: "Mesdames et messieurs, je parle aux jury.", dich: "Thưa quý vị, tôi nói với bồi thẩm đoàn.", sai: "« Jury » số ít nên phải là « au jury »." },
      ] },
      { hoi: "Lập luận chính", pa: [
        { van: "Son billet de train prouve qu'elle était loin.", dich: "Vé tàu chứng minh cô ấy ở xa.", tag: "ly" },
        { van: "Un chat trouve toujours son chemin, comme la vérité.", dich: "Mèo luôn tìm được đường về, như sự thật.", tag: "dep" },
        { van: "Une chat ne disparaît pas sans raison.", dich: "Một con mèo không biến mất vô cớ.", sai: "« Chat » giống đực nên phải là « un chat »." },
      ] },
      { hoi: "Lời kết", pa: [
        { van: "Rendez à Léa sa liberté.", dich: "Hãy trả lại tự do cho Léa.", tag: "tinh" },
        { van: "Que votre verdict soit doux comme une patte de chat.", dich: "Mong phán quyết của quý vị êm như chân mèo.", tag: "dep" },
        { van: "Merci pour votre écoute, mesdames et messieur.", dich: "Cảm ơn quý vị đã lắng nghe.", sai: "« Messieurs » luôn có -s khi nói với nhiều người." },
      ] },
    ],
    nhanChung: [
      {
        ten: "Anne Dubois", vai: "Chủ con mèo", mau: "#9333ea",
        gioiThieu: "Nhân chứng đầu tiên là bà Anne Dubois, chủ con mèo.",
        doiDap: [
          { cau: "Léa parle au gardien.", dung: true, loi: "Objection ! Il faut dire « à le gardien » !", dich: "Phản đối! Phải nói « à le gardien »!", luat: "mao_tu_ghep", gt: "à + le luôn thành « au », nên câu này đúng." },
          { cau: "Mme Dubois a deux chien.", dung: false, loi: "Objection ! Après « deux », il faut « chiens » !", dich: "Phản đối! Sau « deux » phải là « chiens »!", luat: "so_nhieu", gt: "Corbeau nói đúng: danh từ số nhiều thêm -s." },
        ],
        dong: [
          { van: "Je m'appelle Anne Dubois et j'habite ici depuis dix ans.", dich: "Tôi tên Anne Dubois, sống ở đây đã mười năm." },
          { van: "J'ai un chat gris et deux chien.", dich: "Tôi có một con mèo xám và hai con chó.", loi: L("chien", "chiens", ["chienne", "chiennes"], "so_nhieu", "Sau « deux » danh từ ở số nhiều, thêm -s: « chiens ».") },
          { van: "Samedi, mon chat était dans le jardin.", dich: "Thứ Bảy, mèo của tôi ở trong vườn.",
            them: { hoi: "Qui était dans le jardin avec lui ?", van: "Léa était dans le jardin à midi.", dich: "Lúc trưa, Léa ở trong vườn.", mau: { tang: "billet", gt: "Vé tàu cho thấy Léa đi từ 9 giờ tới 18 giờ, nên trưa hôm đó cô ấy không ở vườn." } } },
          { van: "Ensuite, je parle aux gardien de l'immeuble.", dich: "Sau đó, tôi nói chuyện với người gác toà nhà.", loi: L("aux", "au", ["des", "du"], "mao_tu_ghep", "« Gardien » số ít nên à + le thành « au », không phải « aux ».") },
          { van: "Le soir, mon chat n'était plus là.", dich: "Buổi tối, mèo của tôi không còn ở đó." },
        ],
      },
      {
        ten: "Michel Petit", vai: "Người gác toà nhà", mau: "#0f766e",
        gioiThieu: "Nhân chứng thứ hai là ông Michel Petit, người gác toà nhà.",
        doiDap: [
          { cau: "Léa aime les oiseaux.", dung: true, loi: "Objection ! Il faut écrire « les oiseaus » !", dich: "Phản đối! Phải viết « les oiseaus »!", luat: "so_nhieu", gt: "Từ tận cùng -eau thêm -x: « oiseaux » là đúng." },
          { cau: "Il y a une problème dans ce dossier.", dung: false, loi: "Objection ! « Problème » est masculin !", dich: "Phản đối! « Problème » là giống đực!", luat: "mao_tu_giong", gt: "Corbeau nói đúng: phải là « un problème »." },
        ],
        dong: [
          { van: "Je suis le gardien de cet immeuble.", dich: "Tôi là người gác toà nhà này.",
            them: { hoi: "Vous travaillez tous les jours ?", van: "Oui, mais le samedi, je vais chez mon frère.", dich: "Vâng, nhưng thứ Bảy tôi đến nhà anh trai.", tang: "planning" } },
          { van: "Léa a une maison près du parc.", dich: "Léa có một ngôi nhà gần công viên.",
            them: { hoi: "Elle a des animaux ?", van: "Elle a un oiseau et une poisson.", dich: "Cô ấy có một con chim và một con cá.", loi: L("une", "un", ["des", "la"], "mao_tu_giong", "« Poisson » là danh từ giống đực: « un poisson ».") } },
          { van: "Elle a acheté trois boîte de nourriture pour chat.", dich: "Cô ấy mua ba hộp thức ăn cho mèo.", loi: L("boîte", "boîtes", ["boîté", "boîter"], "so_nhieu", "Sau « trois » danh từ ở số nhiều: « boîtes ».") },
          { van: "Je l'ai vue avec un cage.", dich: "Tôi thấy cô ấy với một cái lồng.", loi: L("un", "une", ["des", "le"], "mao_tu_giong", "« Cage » là danh từ giống cái: « une cage ».") },
          { van: "Samedi, j'ai vu Léa avec le chat dans ses bras.", dich: "Thứ Bảy, tôi thấy Léa ôm con mèo trong tay.",
            them: { hoi: "Où étiez-vous samedi ?", van: "Samedi, j'étais ici toute la journée.", dich: "Thứ Bảy, tôi ở đây cả ngày.", mau: { tang: "planning", gt: "Lịch làm việc ghi thứ Bảy là ngày nghỉ, và chính ông nói hôm đó đến nhà anh trai." } } },
        ],
      },
    ],
  },
  {
    id: "velo-rouge", muc: "de", chuDe: "Chia động từ ở hiện tại",
    ten: "L'affaire du vélo rouge", bi_cao: "Hugo",
    mo: "Chiếc xe đạp đỏ của trường đã biến mất, và học sinh Hugo bị tố lấy trộm. Bạn là luật sư của Hugo. Vụ này hãy nghe kỹ cách chia động từ.",
    thang: "Bồi thẩm đoàn tuyên Hugo vô tội. Thầy thể dục mượn chiếc xe đạp để đi sửa mà quên báo.",
    thua: "Hugo chưa được giải oan. Lần sau hãy để ý động từ có khớp với chủ ngữ không.",
    tangVat: ["cahier"],
    tang: {
      cahier: { ten: "Cahier d'appel", van: "Mardi, 10 h : Hugo en cours de sport avec M. Roy.", dich: "Thứ Ba, 10 giờ: Hugo học thể dục với thầy Roy." },
      ticket: { ten: "Ticket de bus de Nina", van: "Mardi, 10 h : ligne 2, direction centre-ville.", dich: "Thứ Ba, 10 giờ: tuyến 2, hướng trung tâm." },
    },
    bienHo: [
      { hoi: "Mở đầu bài biện hộ", pa: [
        { van: "Mesdames et messieurs, Hugo était en classe mardi.", dich: "Thưa quý vị, thứ Ba Hugo ở trong lớp.", tag: "ly" },
        { van: "Mesdames et messieurs, Hugo est un garçon gentil.", dich: "Thưa quý vị, Hugo là một cậu bé ngoan.", tag: "tinh" },
        { van: "Mesdames et messieurs, les faits parle pour lui.", dich: "Thưa quý vị, sự thật lên tiếng cho cậu ấy.", sai: "Chủ ngữ số nhiều nên phải là « parlent »." },
      ] },
      { hoi: "Lập luận chính", pa: [
        { van: "Le cahier d'appel montre où il était.", dich: "Sổ điểm danh cho thấy cậu ấy ở đâu.", tag: "ly" },
        { van: "La vérité roule toujours plus vite que le mensonge.", dich: "Sự thật luôn lăn bánh nhanh hơn lời nói dối.", tag: "dep" },
        { van: "Les témoins faisent une erreur.", dich: "Các nhân chứng đã nhầm.", sai: "« Faire » chia bất quy tắc: « ils font »." },
      ] },
      { hoi: "Lời kết", pa: [
        { van: "Laissez Hugo retourner à l'école.", dich: "Hãy để Hugo trở lại trường.", tag: "tinh" },
        { van: "Que la justice avance comme une roue qui tourne.", dich: "Mong công lý tiến lên như bánh xe lăn đều.", tag: "dep" },
        { van: "Je vous demande de croire son mère.", dich: "Tôi xin quý vị tin mẹ cậu ấy.", sai: "« Mère » giống cái nên phải là « sa mère »." },
      ] },
    ],
    nhanChung: [
      {
        ten: "Sylvie Martin", vai: "Cô giáo", mau: "#c2410c",
        gioiThieu: "Nhân chứng đầu tiên là cô Sylvie Martin, giáo viên của trường.",
        doiDap: [
          { cau: "Hugo et Nina vont au lycée.", dung: true, loi: "Objection ! Il faut dire « Hugo et Nina allent » !", dich: "Phản đối! Phải nói « allent »!", luat: "bat_quy_tac", gt: "« Aller » bất quy tắc: « ils vont ». Câu này đúng." },
          { cau: "Vous faisez une erreur.", dung: false, loi: "Objection ! On dit « vous faites » !", dich: "Phản đối! Phải nói « vous faites »!", luat: "bat_quy_tac", gt: "Corbeau nói đúng: « faire » ở ngôi vous là « faites »." },
        ],
        dong: [
          { van: "Je suis professeure dans ce lycée.", dich: "Tôi là giáo viên ở trường này." },
          { van: "Les élèves arrive à huit heures le matin.", dich: "Học sinh đến lúc tám giờ sáng.", loi: L("arrive", "arrivent", ["arrivez", "arrives"], "chia_dong_tu", "« Les élèves » số nhiều nên chia « arrivent ».") },
          { van: "Mardi, le vélo rouge était devant l'école.", dich: "Thứ Ba, chiếc xe đạp đỏ ở trước trường.",
            them: { hoi: "Qui a vu le vélo partir ?", van: "Hugo a pris le vélo à dix heures.", dich: "Hugo lấy xe lúc mười giờ.", mau: { tang: "cahier", gt: "Sổ điểm danh ghi lúc 10 giờ Hugo đang học thể dục với thầy Roy." } } },
          { van: "Les garçons font du sport et les filles faisent de la musique.", dich: "Các nam sinh chơi thể thao còn các nữ sinh học nhạc.", loi: L("faisent", "font", ["faites", "fait"], "bat_quy_tac", "« Faire » chia bất quy tắc: « elles font ».") },
          { van: "Je connais bien Hugo et sa famille.", dich: "Tôi biết rõ Hugo và gia đình cậu ấy." },
        ],
      },
      {
        ten: "Nina Fabre", vai: "Bạn cùng lớp", mau: "#db2777",
        gioiThieu: "Nhân chứng thứ hai là Nina, bạn cùng lớp của Hugo.",
        doiDap: [
          { cau: "On va au stade.", dung: true, loi: "Objection ! Avec « on », il faut dire « on allons » !", dich: "Phản đối! Với « on » phải nói « on allons »!", luat: "on_chia", gt: "« On » chia như « il »: « on va » là đúng." },
          { cau: "Hugo cherche son sœur.", dung: false, loi: "Objection ! « Sœur » est féminin, il faut « sa sœur » !", dich: "Phản đối! « Sœur » giống cái, phải là « sa sœur »!", luat: "so_huu", gt: "Corbeau nói đúng: sở hữu theo giống của « sœur »." },
        ],
        dong: [
          { van: "Je m'appelle Nina et je suis dans la classe de Hugo.", dich: "Tôi tên Nina, học cùng lớp với Hugo.",
            them: { hoi: "Comment vas-tu à l'école ?", van: "Je prends le bus avec mon frère.", dich: "Tôi đi xe buýt với anh trai.", tang: "ticket" } },
          { van: "Hugo aime beaucoup les vélos.", dich: "Hugo rất thích xe đạp.",
            them: { hoi: "Comment est Hugo avec sa famille ?", van: "Il est gentil avec son sœur.", dich: "Cậu ấy tốt với em gái.", loi: L("son", "sa", ["ses", "mon"], "so_huu", "« Sœur » giống cái nên dùng « sa », dù Hugo là nam.") } },
          { van: "Il a une veste noir et un grand sac.", dich: "Cậu ấy có áo khoác đen và một cái túi lớn.", loi: L("noir", "noire", ["noirs", "noires"], "hop_tinh_tu", "« Veste » giống cái nên tính từ là « noire ».") },
          { van: "Mardi, on vont tous au stade.", dich: "Thứ Ba, tất cả chúng tôi đi ra sân vận động.", loi: L("vont", "va", ["allons", "allez"], "on_chia", "« On » chia như « il »: « on va ».") },
          { van: "Je suis sûre que c'est lui.", dich: "Tôi chắc chắn là cậu ấy.",
            them: { hoi: "Où étais-tu à dix heures ?", van: "À dix heures, j'étais devant l'école.", dich: "Lúc mười giờ, tôi ở trước trường.", mau: { tang: "ticket", gt: "Vé xe buýt cho thấy lúc 10 giờ Nina đang trên tuyến 2 đi về trung tâm." } } },
        ],
      },
    ],
  },
  {
    id: "tableau", muc: "vua", chuDe: "Quá khứ kép và trợ động từ",
    ten: "L'affaire du tableau disparu", bi_cao: "Marc",
    mo: "Một bức tranh biến mất khỏi bảo tàng, và người gác Marc bị buộc tội. Bạn là luật sư của Marc. Hãy nghe kỹ passé composé: trợ động từ, hợp giống số, participe bất quy tắc.",
    thang: "Bồi thẩm đoàn tuyên Marc vô tội. Bức tranh chỉ được chuyển đi phục chế mà chưa ai ghi sổ.",
    thua: "Marc chưa được giải oan. Lần sau hãy soi kỹ từng trợ động từ.",
    tangVat: ["badge", "horaires"],
    tang: {
      badge: { ten: "Badge de Marc", van: "Vendredi : sortie du bâtiment à 20 h.", dich: "Thứ Sáu: ra khỏi toà nhà lúc 20 giờ." },
      horaires: { ten: "Horaires du musée", van: "Le vendredi, le musée ferme à 18 h.", dich: "Thứ Sáu, bảo tàng đóng cửa lúc 18 giờ." },
    },
    bienHo: [
      { hoi: "Mở đầu bài biện hộ", pa: [
        { van: "Mesdames et messieurs, les preuves sont arrivées trop tard.", dich: "Thưa quý vị, chứng cứ đã đến quá muộn.", tag: "ly" },
        { van: "Mesdames et messieurs, Marc a servi ce musée pendant vingt ans.", dich: "Thưa quý vị, Marc đã phục vụ bảo tàng này hai mươi năm.", tag: "tinh" },
        { van: "Mesdames et messieurs, les témoins se sont trompé.", dich: "Thưa quý vị, các nhân chứng đã nhầm.", sai: "Động từ phản thân hợp với chủ ngữ số nhiều: « trompés »." },
      ] },
      { hoi: "Lập luận chính", pa: [
        { van: "Son badge prouve qu'il est sorti à vingt heures.", dich: "Thẻ ra vào chứng minh ông ấy rời đi lúc 20 giờ.", tag: "ly" },
        { van: "Un tableau peut disparaître, mais pas la vérité qu'il cache.", dich: "Bức tranh có thể biến mất, nhưng sự thật thì không.", tag: "dep" },
        { van: "Marc a prendu ses clés et il est rentré.", dich: "Marc lấy chìa khoá rồi về nhà.", sai: "Participe của « prendre » là « pris »." },
      ] },
      { hoi: "Lời kết", pa: [
        { van: "Rendez-lui son honneur et son métier.", dich: "Hãy trả lại danh dự và công việc cho ông ấy.", tag: "tinh" },
        { van: "Que votre verdict éclaire cette salle comme une toile de maître.", dich: "Mong phán quyết của quý vị soi sáng căn phòng như một kiệt tác.", tag: "dep" },
        { van: "Je vous remercie d'avoir venu ce matin.", dich: "Cảm ơn quý vị đã đến sáng nay.", sai: "« Venir » dùng être: « d'être venus »." },
      ] },
    ],
    nhanChung: [
      {
        ten: "Hélène Roche", vai: "Giám đốc bảo tàng", mau: "#6d28d9",
        gioiThieu: "Nhân chứng đầu tiên là bà Hélène Roche, giám đốc bảo tàng.",
        doiDap: [
          { cau: "Ils se sont levés à six heures.", dung: true, loi: "Objection ! Il faut « ils s'ont levés » !", dich: "Phản đối! Phải là « ils s'ont levés »!", luat: "phan_than", gt: "Động từ phản thân dùng être: « ils se sont levés » là đúng." },
          { cau: "Elle a mis le tableau ici et elle est sorti.", dung: false, loi: "Objection ! « Elle est sortie » prend un e !", dich: "Phản đối! « Elle est sortie » phải có chữ e!", luat: "hop_etre", gt: "Corbeau nói đúng: với être, participe hợp với chủ ngữ giống cái." },
        ],
        dong: [
          { van: "Je dirige ce musée depuis cinq ans.", dich: "Tôi điều hành bảo tàng này đã năm năm." },
          { van: "Vendredi soir, je suis partie à dix-neuf heures.", dich: "Tối thứ Sáu, tôi rời đi lúc mười chín giờ.",
            them: { hoi: "Qui est resté au musée ?", van: "Marc est resté seul dans la salle jusqu'à minuit.", dich: "Marc ở một mình trong phòng đến nửa đêm.", mau: { tang: "badge", gt: "Thẻ ra vào cho thấy Marc rời toà nhà lúc 20 giờ, không phải nửa đêm." } } },
          { van: "Samedi, ma secrétaire s'a levée très tôt.", dich: "Thứ Bảy, thư ký của tôi dậy rất sớm.", loi: L("s'a", "s'est", ["s'ont", "s'avait"], "phan_than", "Động từ phản thân dùng être: « elle s'est levée ».") },
          { van: "Elle a prendu le premier métro.", dich: "Cô ấy đi chuyến metro đầu tiên.", loi: L("prendu", "pris", ["prit", "prenu"], "pp_bat_quy_tac", "Participe của « prendre » là « pris ».") },
          { van: "Quand nous avons arrivées, le tableau n'était plus là.", dich: "Khi chúng tôi đến, bức tranh không còn đó.", loi: L("avons", "sommes", ["étions", "ont"], "tro_dong_tu", "« Arriver » dùng être: « nous sommes arrivées ».") },
        ],
      },
      {
        ten: "Rémi Blanc", vai: "Chuyên gia hội hoạ", mau: "#0e7490",
        gioiThieu: "Nhân chứng thứ hai là ông Rémi Blanc, chuyên gia hội hoạ.",
        doiDap: [
          { cau: "Je n'ai pas de preuve.", dung: true, loi: "Objection ! Il faut dire « pas une preuve » !", dich: "Phản đối! Phải nói « pas une preuve »!", luat: "sau_phu_dinh", gt: "Sau phủ định, « une » thành « de ». Câu này đúng." },
          { cau: "Nous avons voyé le gardien.", dung: false, loi: "Objection ! Le participe de « voir » est « vu » !", dich: "Phản đối! Participe của « voir » là « vu »!", luat: "pp_bat_quy_tac", gt: "Corbeau nói đúng: phải là « nous avons vu »." },
        ],
        dong: [
          { van: "Je suis expert en peinture.", dich: "Tôi là chuyên gia hội hoạ.",
            them: { hoi: "Vous connaissiez ce tableau ?", van: "Je n'ai pas une photo, mais je connais bien ce tableau.", dich: "Tôi không có ảnh, nhưng tôi biết rõ bức tranh này.", loi: L("une", "de", ["la", "des"], "sau_phu_dinh", "Sau phủ định, « une » thành « de »: « pas de photo ».") } },
          { van: "Vendredi, j'ai visité le musée avec ma femme.", dich: "Thứ Sáu, tôi tham quan bảo tàng với vợ.",
            them: { hoi: "À quelle heure êtes-vous parti ?", van: "Nous avons quitté le musée à vingt et une heures.", dich: "Chúng tôi rời bảo tàng lúc 21 giờ.", mau: { tang: "horaires", gt: "Thứ Sáu bảo tàng đóng cửa lúc 18 giờ, nên không thể ở đó tới 21 giờ." } } },
          { van: "Les deux gardiens sont sorti ensemble.", dich: "Hai người gác cùng đi ra.", loi: L("sorti", "sortis", ["sortie", "sorties"], "hop_etre", "Với être, participe hợp với chủ ngữ số nhiều: « sortis ».") },
          { van: "J'ai voyé Marc avec un grand paquet.", dich: "Tôi thấy Marc với một gói lớn.", loi: L("voyé", "vu", ["vois", "voir"], "pp_bat_quy_tac", "Participe của « voir » là « vu ».") },
          { van: "Je suis certain de ce que j'ai vu.", dich: "Tôi chắc chắn về những gì đã thấy." },
        ],
      },
    ],
  },
  {
    id: "concert", muc: "vua", chuDe: "Đại từ và giới từ",
    ten: "L'affaire du concert annulé", bi_cao: "Inès",
    mo: "Một buổi hoà nhạc bị huỷ, và người tổ chức Inès bị tố giữ tiền vé. Bạn là luật sư của Inès. Vụ này hãy soi đại từ và giới từ chỉ nơi chốn.",
    thang: "Bồi thẩm đoàn tuyên Inès vô tội. Tiền vé vẫn nằm nguyên trong tài khoản của nhà hát.",
    thua: "Inès chưa được giải oan. Lần sau hãy để ý từng đại từ nhỏ.",
    tangVat: ["contrat", "message"],
    tang: {
      contrat: { ten: "Contrat du concert", van: "Signé le mardi 4 mai, à Lyon.", dich: "Ký thứ Ba ngày 4 tháng 5, tại Lyon." },
      message: { ten: "Message de la salle", van: "M. Garcia annule le concert pour raison de santé.", dich: "Ông Garcia huỷ buổi diễn vì lý do sức khoẻ." },
    },
    bienHo: [
      { hoi: "Mở đầu bài biện hộ", pa: [
        { van: "Mesdames et messieurs, je vais vous montrer les faits.", dich: "Thưa quý vị, tôi sẽ cho quý vị thấy sự thật.", tag: "ly" },
        { van: "Mesdames et messieurs, je connais Inès et je lui fais confiance.", dich: "Thưa quý vị, tôi biết Inès và tin cô ấy.", tag: "tinh" },
        { van: "Mesdames et messieurs, je le parle au nom d'Inès.", dich: "Thưa quý vị, tôi nói thay cho Inès.", sai: "« Parler » không có bổ ngữ trực tiếp, bỏ « le »." },
      ] },
      { hoi: "Lập luận chính", pa: [
        { van: "Le message de la salle montre qui a annulé.", dich: "Tin nhắn của nhà hát cho thấy ai đã huỷ.", tag: "ly" },
        { van: "Une note fausse peut tromper l'oreille, pas le cœur.", dich: "Nốt nhạc sai có thể lừa đôi tai, không lừa được trái tim.", tag: "dep" },
        { van: "La femme qui vous voyez n'a rien pris.", dich: "Người phụ nữ quý vị thấy không lấy gì cả.", sai: "« Vous voyez » đã có chủ ngữ nên phải dùng « que »." },
      ] },
      { hoi: "Lời kết", pa: [
        { van: "Laissez-la rentrer chez elle la tête haute.", dich: "Hãy để cô ấy về nhà trong danh dự.", tag: "tinh" },
        { van: "Que votre verdict soit la dernière note de cette triste chanson.", dich: "Mong phán quyết là nốt cuối của bài ca buồn này.", tag: "dep" },
        { van: "Je vous demande de croire en elle et en ils.", dich: "Tôi xin quý vị tin cô ấy và họ.", sai: "Sau giới từ phải dùng đại từ nhấn mạnh: « eux »." },
      ] },
    ],
    nhanChung: [
      {
        ten: "Diego Garcia", vai: "Ca sĩ", mau: "#b91c1c",
        gioiThieu: "Nhân chứng đầu tiên là ca sĩ Diego Garcia.",
        doiDap: [
          { cau: "Je lui parle tous les jours.", dung: true, loi: "Objection ! Il faut dire « je le parle » !", dich: "Phản đối! Phải nói « je le parle »!", luat: "dai_tu_bo_ngu", gt: "« Parler à » cần bổ ngữ gián tiếp, nên « lui » là đúng." },
          { cau: "Elle habite à Japon.", dung: false, loi: "Objection ! On dit « au Japon » !", dich: "Phản đối! Phải nói « au Japon »!", luat: "gioi_tu_noi", gt: "Corbeau nói đúng: nước giống đực dùng « au »." },
        ],
        dong: [
          { van: "Je suis chanteur et je vis à Lyon.", dich: "Tôi là ca sĩ, sống ở Lyon." },
          { van: "L'an dernier, je travaillais à Espagne avec Inès.", dich: "Năm ngoái, tôi làm việc ở Tây Ban Nha với Inès.", loi: L("à", "en", ["au", "aux"], "gioi_tu_noi", "Nước giống cái dùng « en »: « en Espagne ».") },
          { van: "Je lui ai donné mon contrat.", dich: "Tôi đưa hợp đồng cho cô ấy.",
            them: { hoi: "Quand avez-vous signé ?", van: "Nous avons signé le contrat à Paris.", dich: "Chúng tôi ký hợp đồng ở Paris.", mau: { tang: "contrat", gt: "Hợp đồng ghi rõ được ký tại Lyon, không phải Paris." } } },
          { van: "Ensuite, je le parle tous les jours.", dich: "Sau đó, ngày nào tôi cũng nói chuyện với cô ấy.", loi: L("le", "lui", ["la", "les"], "dai_tu_bo_ngu", "« Parler à quelqu'un » cần đại từ gián tiếp: « je lui parle ».") },
          { van: "Inès est partie sans moi.", dich: "Inès đã đi mà không có tôi.",
            them: { hoi: "Où est-elle allée ?", van: "Elle est partie au Italie.", dich: "Cô ấy đi Ý.", loi: L("au", "en", ["à", "aux"], "gioi_tu_noi", "« Italie » giống cái: « en Italie ».") } },
        ],
      },
      {
        ten: "Lucie Faure", vai: "Kế toán nhà hát", mau: "#a16207",
        gioiThieu: "Nhân chứng thứ hai là bà Lucie Faure, kế toán của nhà hát.",
        doiDap: [
          { cau: "C'est un travail que j'aime.", dung: true, loi: "Objection ! Il faut « qui j'aime » !", dich: "Phản đối! Phải là « qui j'aime »!", luat: "quan_he", gt: "« J'aime » đã có chủ ngữ, « que » là bổ ngữ nên đúng." },
          { cau: "Lyon ? J'en habite depuis dix ans.", dung: false, loi: "Objection ! Pour un lieu, on dit « j'y habite » !", dich: "Phản đối! Chỉ nơi chốn phải nói « j'y habite »!", luat: "y_en", gt: "Corbeau nói đúng: « y » thay cho nơi chốn." },
        ],
        dong: [
          { van: "Je travaille pour cette salle de concert.", dich: "Tôi làm việc cho nhà hát này." },
          { van: "C'est la collègue qui je connais le mieux.", dich: "Đó là đồng nghiệp tôi biết rõ nhất.", loi: L("qui", "que", ["dont", "où"], "quan_he", "« Je connais » đã có chủ ngữ, cần « que » làm bổ ngữ.") },
          { van: "Paris ? J'en vais tous les mois.", dich: "Paris ư? Tháng nào tôi cũng đến.", loi: L("J'en", "J'y", ["Je", "J'ai"], "y_en", "« Y » thay cho nơi chốn: « j'y vais ».") },
          { van: "Elle a partagé l'argent avec ils.", dich: "Cô ấy chia tiền với họ.", loi: L("ils", "eux", ["leur", "lui"], "dai_tu_nhan_manh", "Sau giới từ « avec » dùng đại từ nhấn mạnh: « eux ».") },
          { van: "Le concert a été annulé vendredi.", dich: "Buổi diễn bị huỷ hôm thứ Sáu.",
            them: { hoi: "Qui a annulé le concert ?", van: "Inès a annulé le concert toute seule.", dich: "Inès tự mình huỷ buổi diễn.", mau: { tang: "message", gt: "Tin nhắn của nhà hát cho thấy chính ông Garcia huỷ vì lý do sức khoẻ." } } },
        ],
      },
    ],
  },
  {
    id: "lettre", muc: "vua", chuDe: "Tính từ và so sánh",
    ten: "L'affaire de la lettre anonyme", bi_cao: "Sophie",
    mo: "Một lá thư nặc danh làm cả làng xôn xao, và cô chủ hiệu sách Sophie bị nghi. Bạn là luật sư của Sophie. Vụ này hãy soi tính từ và so sánh.",
    thang: "Bồi thẩm đoàn tuyên Sophie vô tội. Người viết thư hoá ra là một chú học trò nghịch ngợm.",
    thua: "Sophie chưa được giải oan. Lần sau hãy để ý từng tính từ.",
    tangVat: ["facture", "certificat"],
    tang: {
      facture: { ten: "Facture de la papeterie", van: "Papier bleu : vendu dans tous les magasins du village.", dich: "Giấy xanh: bán ở mọi cửa hàng trong làng." },
      certificat: { ten: "Certificat de l'hôpital", van: "Mme Sophie Lenoir : hospitalisée de dimanche à mardi.", dich: "Bà Sophie Lenoir: nằm viện từ Chủ nhật đến thứ Ba." },
    },
    bienHo: [
      { hoi: "Mở đầu bài biện hộ", pa: [
        { van: "Mesdames et messieurs, cette accusation est fausse.", dich: "Thưa quý vị, lời buộc tội này là sai.", tag: "ly" },
        { van: "Mesdames et messieurs, Sophie est une femme généreuse.", dich: "Thưa quý vị, Sophie là người phụ nữ rộng lượng.", tag: "tinh" },
        { van: "Mesdames et messieurs, cette histoire est faux.", dich: "Thưa quý vị, câu chuyện này là sai.", sai: "« Histoire » giống cái nên phải là « fausse »." },
      ] },
      { hoi: "Lập luận chính", pa: [
        { van: "Le certificat prouve qu'elle était à l'hôpital.", dich: "Giấy chứng nhận chứng minh cô ấy ở bệnh viện.", tag: "ly" },
        { van: "Une lettre sans nom est plus légère que le vent.", dich: "Lá thư không tên nhẹ hơn cả gió.", tag: "dep" },
        { van: "Ce témoin est plus sûr de lui de moi.", dich: "Nhân chứng này tự tin hơn tôi.", sai: "So sánh dùng « que »: « plus sûr de lui que moi »." },
      ] },
      { hoi: "Lời kết", pa: [
        { van: "Rendez à Sophie la paix de ce beau village.", dich: "Hãy trả lại cho Sophie sự yên bình của ngôi làng đẹp này.", tag: "tinh" },
        { van: "Que votre verdict soit plus clair que l'eau de nos fontaines.", dich: "Mong phán quyết trong hơn nước các đài phun của làng.", tag: "dep" },
        { van: "Je vous remercie de ce beau accueil.", dich: "Cảm ơn sự đón tiếp tốt đẹp của quý vị.", sai: "Trước nguyên âm, « beau » thành « bel »: « ce bel accueil »." },
      ] },
    ],
    nhanChung: [
      {
        ten: "Alain Durand", vai: "Thị trưởng", mau: "#1d4ed8",
        gioiThieu: "Nhân chứng đầu tiên là ông Alain Durand, thị trưởng của làng.",
        doiDap: [
          { cau: "C'est un bel homme.", dung: true, loi: "Objection ! Il faut dire « un beau homme » !", dich: "Phản đối! Phải nói « un beau homme »!", luat: "bel_nouvel", gt: "Trước h câm, « beau » thành « bel ». Câu này đúng." },
          { cau: "Cette lettre est plus longue de l'autre.", dung: false, loi: "Objection ! On compare avec « que » !", dich: "Phản đối! So sánh phải dùng « que »!", luat: "so_sanh", gt: "Corbeau nói đúng: « plus longue que l'autre »." },
        ],
        dong: [
          { van: "Je suis le maire de ce beau village.", dich: "Tôi là thị trưởng ngôi làng đẹp này." },
          { van: "Un nouveau habitant est arrivé en mai.", dich: "Một cư dân mới đến vào tháng Năm.", loi: L("nouveau", "nouvel", ["nouvelle", "nouveaux"], "bel_nouvel", "Trước h câm, « nouveau » thành « nouvel ».") },
          { van: "La lettre était plus méchante de la première.", dich: "Lá thư này độc ác hơn lá đầu tiên.", loi: L("de", "que", ["à", "pour"], "so_sanh", "So sánh dùng « que »: « plus méchante que ».") },
          { van: "Elle était écrite à la main sur du papier bleu.", dich: "Thư được viết tay trên giấy xanh.",
            them: { hoi: "Qui utilise ce papier ?", van: "Seule Sophie vend ce papier bleu.", dich: "Chỉ Sophie bán loại giấy xanh này.", mau: { tang: "facture", gt: "Hoá đơn cho thấy giấy xanh được bán ở mọi cửa hàng trong làng." } } },
          { van: "Je veux seulement la vérité.", dich: "Tôi chỉ muốn sự thật." },
        ],
      },
      {
        ten: "Marie Perrin", vai: "Cô giáo làng", mau: "#be123c",
        gioiThieu: "Nhân chứng thứ hai là cô Marie Perrin, giáo viên trong làng.",
        doiDap: [
          { cau: "Ce pain est meilleur que l'autre.", dung: true, loi: "Objection ! Il faut dire « plus bon » !", dich: "Phản đối! Phải nói « plus bon »!", luat: "so_sanh", gt: "« Bon » so sánh thành « meilleur ». Câu này đúng." },
          { cau: "Elle porte des chaussures bleu.", dung: false, loi: "Objection ! Il faut « bleues » !", dich: "Phản đối! Phải là « bleues »!", luat: "hop_tinh_tu", gt: "Corbeau nói đúng: « chaussures » giống cái số nhiều." },
        ],
        dong: [
          { van: "Je suis institutrice et je connais tout le monde ici.", dich: "Tôi là giáo viên và biết mọi người ở đây." },
          { van: "Lundi, j'ai vu une femme avec des gants noir.", dich: "Thứ Hai, tôi thấy một phụ nữ đeo găng đen.", loi: L("noir", "noirs", ["noire", "noires"], "hop_tinh_tu", "« Gants » giống đực số nhiều nên là « noirs ».") },
          { van: "Elle marchait vite vers la poste.", dich: "Bà ấy đi nhanh về phía bưu điện.",
            them: { hoi: "Vous l'avez reconnue ?", van: "Oui, c'était Sophie, je l'ai vue de près.", dich: "Vâng, đó là Sophie, tôi nhìn rất gần.", mau: { tang: "certificat", gt: "Giấy chứng nhận cho thấy Sophie nằm viện từ Chủ nhật đến thứ Ba, nên thứ Hai cô không thể ở bưu điện." } } },
          { van: "Quand je suis entrée, Sophie parle avec le facteur.", dich: "Khi tôi bước vào, Sophie đang nói chuyện với người đưa thư.", loi: L("parle", "parlait", ["parlerait", "parlent"], "imparfait", "Tả việc đang diễn ra trong quá khứ dùng imparfait: « parlait ».") },
          { van: "C'est un bel endroit pour vivre en paix.", dich: "Đây là nơi đẹp để sống yên bình.",
            them: { hoi: "Vous êtes amie avec Sophie ?", van: "Non, sa sœur est plus gentil qu'elle.", dich: "Không, chị cô ấy tốt bụng hơn cô ấy.", loi: L("gentil", "gentille", ["gentils", "gentilles"], "hop_tinh_tu", "« Sœur » giống cái nên là « gentille ».") } },
        ],
      },
    ],
  },
  {
    id: "heritage", muc: "kho", chuDe: "Thì, thức và lời thuật lại",
    ten: "L'affaire de l'héritage", bi_cao: "Élise",
    mo: "Bà Aubry qua đời để lại một di chúc gây tranh cãi, và cô cháu Élise bị tố giả mạo. Bạn là luật sư của Élise. Vụ này hãy soi điều kiện với si, subjonctif và lời thuật lại.",
    thang: "Bồi thẩm đoàn tuyên Élise vô tội. Di chúc là thật, và ông Aubry phải giải trình về lá thư kỳ lạ của mình.",
    thua: "Élise chưa được giải oan. Lần sau hãy để ý thì của từng động từ.",
    tangVat: ["attestation", "deces"],
    tang: {
      attestation: { ten: "Attestation de l'employeur", van: "Élise Aubry a travaillé à Montréal du 1er au 30 avril.", dich: "Élise Aubry làm việc tại Montréal từ 1 đến 30 tháng Tư." },
      deces: { ten: "Acte de décès", van: "Mme Jeanne Aubry, décédée le 2 mai.", dich: "Bà Jeanne Aubry, mất ngày 2 tháng Năm." },
    },
    bienHo: [
      { hoi: "Mở đầu bài biện hộ", pa: [
        { van: "Mesdames et messieurs, il faut que vous examiniez les dates.", dich: "Thưa quý vị, quý vị cần xem xét các mốc thời gian.", tag: "ly" },
        { van: "Mesdames et messieurs, Élise a soigné sa tante jusqu'au bout.", dich: "Thưa quý vị, Élise đã chăm sóc cô mình đến cuối đời.", tag: "tinh" },
        { van: "Mesdames et messieurs, il faut que vous examinez les dates.", dich: "Thưa quý vị, quý vị cần xem xét các mốc thời gian.", sai: "Sau « il faut que » phải dùng subjonctif: « examiniez »." },
      ] },
      { hoi: "Lập luận chính", pa: [
        { van: "Si elle était à Montréal, elle n'a pas pu déposer ce document.", dich: "Nếu cô ấy ở Montréal, cô ấy không thể nộp giấy tờ này.", tag: "ly" },
        { van: "Un testament est la dernière voix de ceux qui se taisent.", dich: "Di chúc là tiếng nói cuối của những người đã im lặng.", tag: "dep" },
        { van: "Si ma cliente serait coupable, elle aurait fui.", dich: "Nếu thân chủ tôi có tội, cô ấy đã bỏ trốn.", sai: "Sau « si » không dùng conditionnel: « si ma cliente était »." },
      ] },
      { hoi: "Lời kết", pa: [
        { van: "Rendez à Élise le souvenir de sa tante.", dich: "Hãy trả lại cho Élise ký ức về người cô.", tag: "tinh" },
        { van: "Que la justice soit fidèle à la main qui a signé.", dich: "Mong công lý trung thành với bàn tay đã ký.", tag: "dep" },
        { van: "Quand vous rendez votre verdict tout à l'heure, souvenez-vous de ces dates.", dich: "Khi quý vị tuyên án lát nữa, hãy nhớ những mốc này.", sai: "Nói về tương lai, sau « quand » dùng futur: « rendrez »." },
      ] },
    ],
    nhanChung: [
      {
        ten: "Me Lambert", vai: "Công chứng viên", mau: "#334155",
        gioiThieu: "Nhân chứng đầu tiên là công chứng viên Lambert.",
        doiDap: [
          { cau: "Bien que ce soit tard, je continue.", dung: true, loi: "Objection ! Après « bien que », il faut « c'est » !", dich: "Phản đối! Sau « bien que » phải là « c'est »!", luat: "subjonctif", gt: "« Bien que » đòi subjonctif, nên « soit » là đúng." },
          { cau: "La lettre que j'ai écrit est ici.", dung: false, loi: "Objection ! Il faut « écrite » !", dich: "Phản đối! Phải là « écrite »!", luat: "hop_avoir", gt: "Corbeau nói đúng: bổ ngữ « que » giống cái đứng trước động từ." },
        ],
        dong: [
          { van: "J'ai rédigé le testament de Mme Aubry en mars.", dich: "Tôi soạn di chúc của bà Aubry vào tháng Ba." },
          { van: "Elle m'a dit qu'elle reviendra le lendemain pour signer.", dich: "Bà ấy nói hôm sau sẽ quay lại để ký.", loi: L("reviendra", "reviendrait", ["revient", "reviendrais"], "gian_tiep", "Thuật lại lời nói trong quá khứ, futur thành conditionnel.") },
          { van: "Il fallait que sa nièce vient avec elle.", dich: "Cháu gái bà ấy cần đi cùng.", loi: L("vient", "vienne", ["venait", "viendra"], "subjonctif", "Sau « il fallait que » dùng subjonctif: « vienne ».") },
          { van: "Les documents que j'ai reçu étaient complets.", dich: "Các giấy tờ tôi nhận đều đầy đủ.", loi: L("reçu", "reçus", ["reçue", "reçues"], "hop_avoir", "« Que » thay cho « documents » đứng trước động từ nên hợp số nhiều.") },
          { van: "Je n'ai jamais douté de cette signature.", dich: "Tôi chưa bao giờ nghi ngờ chữ ký này.",
            them: { hoi: "Qui a apporté le document ?", van: "Élise l'a déposé elle-même à mon étude le 15 avril.", dich: "Élise tự mang đến văn phòng tôi ngày 15 tháng Tư.", mau: { tang: "attestation", gt: "Giấy xác nhận cho thấy Élise làm việc ở Montréal suốt tháng Tư." } } },
        ],
      },
      {
        ten: "Henri Aubry", vai: "Cháu trai bà Aubry", mau: "#854d0e",
        gioiThieu: "Nhân chứng thứ hai là ông Henri Aubry, cháu trai người đã khuất.",
        doiDap: [
          { cau: "Si tu viens, je serai content.", dung: true, loi: "Objection ! Il faut dire « si tu viendras » !", dich: "Phản đối! Phải nói « si tu viendras »!", luat: "si_dieu_kien", gt: "Sau « si » không dùng futur. Câu này đúng." },
          { cau: "Quand il arrive demain, je partirai.", dung: false, loi: "Objection ! Il faut « quand il arrivera » !", dich: "Phản đối! Phải là « quand il arrivera »!", luat: "quand_futur", gt: "Corbeau nói đúng: nói về tương lai, sau « quand » dùng futur." },
        ],
        dong: [
          { van: "Je suis le neveu de Mme Aubry.", dich: "Tôi là cháu trai của bà Aubry.",
            them: { hoi: "Vous la voyiez souvent ?", van: "Si j'aurais su, je serais venu plus souvent.", dich: "Nếu biết trước, tôi đã đến thăm thường xuyên hơn.", loi: L("j'aurais", "j'avais", ["j'ai", "j'aie"], "si_dieu_kien", "Sau « si » không dùng conditionnel: « si j'avais su ».") } },
          { van: "Ma tante voulait que je garde la maison.", dich: "Cô tôi muốn tôi giữ ngôi nhà." },
          { van: "Si Élise gagnera, je perdrai tout.", dich: "Nếu Élise thắng, tôi sẽ mất tất cả.", loi: L("gagnera", "gagne", ["gagnerait", "gagnait"], "si_dieu_kien", "Sau « si » dùng présent, không dùng futur: « si Élise gagne ».") },
          { van: "Quand le juge rend sa décision demain, tout le monde saura la vérité.", dich: "Khi thẩm phán ra quyết định ngày mai, mọi người sẽ biết sự thật.", loi: L("rend", "rendra", ["rendait", "rendrait"], "quand_futur", "Nói về tương lai, sau « quand » dùng futur: « rendra ».") },
          { van: "La lettre que ma tante m'a écrite le prouve.", dich: "Lá thư cô tôi viết chứng minh điều đó.",
            them: { hoi: "Quand vous l'a-t-elle remise ?", van: "Elle me l'a remise en personne le 10 mai.", dich: "Bà ấy tự tay đưa cho tôi ngày 10 tháng Năm.", mau: { tang: "deces", gt: "Giấy khai tử ghi bà Aubry mất ngày 2 tháng Năm, nên không thể đưa thư ngày 10." } } },
        ],
      },
    ],
  },
  {
    id: "faux-tableau", muc: "kho", chuDe: "Đại từ quan hệ và thì quá khứ",
    ten: "L'affaire de la fausse toile", bi_cao: "Victor",
    mo: "Một bức tranh ký tên Monet bị nghi là giả, và ông chủ phòng tranh Victor bị buộc tội lừa đảo. Bạn là luật sư của Victor. Hãy soi đại từ quan hệ, imparfait và hợp giống số với avoir.",
    thang: "Bồi thẩm đoàn tuyên Victor vô tội. Bức tranh giả đã bị tráo sau khi rời phòng tranh.",
    thua: "Victor chưa được giải oan. Lần sau hãy để ý từng qui, que, dont.",
    tangVat: ["registre", "avion"],
    tang: {
      registre: { ten: "Registre du personnel", van: "Théo Marin : en congé du 1er au 15 juin.", dich: "Théo Marin: nghỉ phép từ 1 đến 15 tháng Sáu." },
      avion: { ten: "Billet d'avion de M. Serre", van: "Paris-Tokyo : départ le 18 juin, retour le 25 juin.", dich: "Paris-Tokyo: đi ngày 18, về ngày 25 tháng Sáu." },
    },
    bienHo: [
      { hoi: "Mở đầu bài biện hộ", pa: [
        { van: "Mesdames et messieurs, les pièces que vous avez lues sont claires.", dich: "Thưa quý vị, các tài liệu quý vị đã đọc rất rõ ràng.", tag: "ly" },
        { van: "Mesdames et messieurs, Victor aime l'art plus que l'argent.", dich: "Thưa quý vị, Victor yêu nghệ thuật hơn tiền bạc.", tag: "tinh" },
        { van: "Mesdames et messieurs, les pièces que vous avez lu sont claires.", dich: "Thưa quý vị, các tài liệu quý vị đã đọc rất rõ ràng.", sai: "« Que » thay « pièces » đứng trước động từ nên phải là « lues »." },
      ] },
      { hoi: "Lập luận chính", pa: [
        { van: "L'expert était à Tokyo le jour où il dit avoir travaillé.", dich: "Chuyên gia ở Tokyo vào ngày ông nói đã làm việc.", tag: "ly" },
        { van: "Une toile ne ment jamais, seuls les hommes le font.", dich: "Bức tranh không bao giờ nói dối, chỉ con người mới làm vậy.", tag: "dep" },
        { van: "Le témoin dont vous avez écouté s'est trompé.", dich: "Nhân chứng quý vị vừa nghe đã nhầm.", sai: "« Écouter » có bổ ngữ trực tiếp nên phải dùng « que »." },
      ] },
      { hoi: "Lời kết", pa: [
        { van: "Rendez-lui sa galerie et son nom.", dich: "Hãy trả lại phòng tranh và danh tiếng cho ông ấy.", tag: "tinh" },
        { van: "Que votre verdict ait la lumière des nymphéas au matin.", dich: "Mong phán quyết của quý vị có ánh sáng của hoa súng buổi sớm.", tag: "dep" },
        { van: "Bien que la journée est longue, écoutez-moi encore.", dich: "Dù ngày đã dài, hãy nghe tôi thêm chút nữa.", sai: "Sau « bien que » dùng subjonctif: « soit »." },
      ] },
    ],
    nhanChung: [
      {
        ten: "Colette Vidal", vai: "Nhà sưu tập", mau: "#7e22ce",
        gioiThieu: "Nhân chứng đầu tiên là bà Colette Vidal, nhà sưu tập tranh.",
        doiDap: [
          { cau: "C'est le tableau dont je vous ai parlé.", dung: true, loi: "Objection ! Il faut « que je vous ai parlé » !", dich: "Phản đối! Phải là « que je vous ai parlé »!", luat: "quan_he", gt: "« Parler de » nên dùng « dont ». Câu này đúng." },
          { cau: "Bien qu'il est riche, il travaille.", dung: false, loi: "Objection ! Après « bien que », il faut « soit » !", dich: "Phản đối! Sau « bien que » phải là « soit »!", luat: "subjonctif", gt: "Corbeau nói đúng: « bien que » đòi subjonctif." },
        ],
        dong: [
          { van: "Je collectionne les tableaux depuis trente ans.", dich: "Tôi sưu tập tranh đã ba mươi năm." },
          { van: "C'est la galerie dont je suis entrée le 3 juin.", dich: "Đó là phòng tranh tôi bước vào ngày 3 tháng Sáu.", loi: L("dont", "où", ["que", "qui"], "quan_he", "Chỉ nơi chốn dùng « où »: « la galerie où je suis entrée ».") },
          { van: "Bien que le prix est élevé, j'ai acheté le tableau.", dich: "Dù giá cao, tôi vẫn mua bức tranh.", loi: L("est", "soit", ["était", "sera"], "subjonctif", "Sau « bien que » dùng subjonctif: « soit ».") },
          { van: "La toile que j'ai acheté était signée Monet.", dich: "Bức tranh tôi mua có chữ ký Monet.", loi: L("acheté", "achetée", ["achetés", "achetées"], "hop_avoir", "« Que » thay « toile » giống cái đứng trước động từ: « achetée ».") },
          { van: "Monsieur Victor m'a juré que c'était un vrai.", dich: "Ông Victor thề với tôi đó là tranh thật.",
            them: { hoi: "Y avait-il un témoin ce jour-là ?", van: "Oui, son assistant Théo était là ce 3 juin.", dich: "Có, trợ lý Théo của ông ấy có mặt ngày 3 tháng Sáu.", mau: { tang: "registre", gt: "Sổ nhân sự ghi Théo nghỉ phép từ ngày 1 đến 15 tháng Sáu." } } },
        ],
      },
      {
        ten: "Jacques Serre", vai: "Chuyên gia giám định", mau: "#115e59",
        gioiThieu: "Nhân chứng thứ hai là ông Jacques Serre, chuyên gia giám định.",
        doiDap: [
          { cau: "Il pleuvait quand je suis sorti.", dung: true, loi: "Objection ! Il faut « il a plu » !", dich: "Phản đối! Phải là « il a plu »!", luat: "imparfait", gt: "Imparfait tả bối cảnh, câu này đúng." },
          { cau: "Il a dit qu'il viendra lundi.", dung: false, loi: "Objection ! Il faut « qu'il viendrait » !", dich: "Phản đối! Phải là « qu'il viendrait »!", luat: "gian_tiep", gt: "Corbeau nói đúng: thuật lại quá khứ, futur thành conditionnel." },
        ],
        dong: [
          { van: "J'ai analysé cette toile en laboratoire.", dich: "Tôi phân tích bức tranh trong phòng thí nghiệm.",
            them: { hoi: "Quand avez-vous fait ces analyses ?", van: "J'ai fait toutes les analyses le 20 juin à Paris.", dich: "Tôi làm mọi phân tích ngày 20 tháng Sáu ở Paris.", mau: { tang: "avion", gt: "Vé máy bay cho thấy ông Serre ở Tokyo từ ngày 18 đến 25 tháng Sáu." } } },
          { van: "La peinture qui j'ai examinée date de 1990.", dich: "Lớp sơn tôi kiểm tra có từ năm 1990.", loi: L("qui", "que", ["dont", "où"], "quan_he", "« J'ai examinée » đã có chủ ngữ, cần « que ».") },
          { van: "Quand je suis arrivé, M. Victor cache la facture.", dich: "Khi tôi đến, ông Victor đang giấu hoá đơn.", loi: L("cache", "cachait", ["cachera", "cacherait"], "imparfait", "Tả việc đang diễn ra trong quá khứ dùng imparfait: « cachait ».") },
          { van: "Cette galerie ? J'en suis allé deux fois.", dich: "Phòng tranh đó ư? Tôi đã đến hai lần.", loi: L("J'en", "J'y", ["Je", "J'ai"], "y_en", "« Y » thay cho nơi chốn: « j'y suis allé ».") },
          { van: "Je suis formel sur ce point.", dich: "Tôi khẳng định về điểm này.",
            them: { hoi: "M. Victor a-t-il vu vos résultats ?", van: "Non, il m'a dit qu'il viendra les voir.", dich: "Không, ông ấy nói sẽ đến xem.", loi: L("viendra", "viendrait", ["vient", "viendrais"], "gian_tiep", "Thuật lại lời nói trong quá khứ, futur thành conditionnel.") } },
        ],
      },
    ],
  },
  {
    id: "garnier", muc: "kho", chuDe: "Tổng hợp: phiên xử cuối",
    ten: "L'affaire Garnier", bi_cao: "các nạn nhân",
    nhanThang: "Coupable", nhanThua: "Non coupable",
    mo: "Phiên toà lớn nhất năm. Paul Garnier, nhà báo của Le Courrier de Rouen, tức P.G. mà Thanh tra Léon đã bắt, ra trước vành móng ngựa. Lần này bạn đứng về phía các nạn nhân, và bên kia Maître Corbeau cãi cho hắn. Một cây bút lớn mà khai sai ngữ pháp thì đừng hòng thoát.",
    thang: "Bồi thẩm đoàn tuyên Paul Garnier có tội. Hắn mỉm cười, cúi đầu chào, rồi để lại một chiếc lông vũ xám trên ghế bị cáo.",
    thua: "Bồi thẩm đoàn chưa đủ phiếu, toà hoãn phiên xử và Garnier vẫn bị tạm giam. Hãy chuẩn bị lại thật kỹ cho lần sau.",
    tangVat: ["billets", "registre"],
    tang: {
      billets: { ten: "Billets SNCF de M. Garnier", van: "Mardi 3 : Rouen-Paris 9 h 10, Paris-Rouen 19 h 40.", dich: "Thứ Ba ngày 3: Rouen đi Paris 9 giờ 10, Paris về Rouen 19 giờ 40." },
      registre: { ten: "Registre de la papeterie", van: "Ce papier à lettres : un seul client, M. Garnier.", dich: "Loại giấy viết thư này: chỉ một khách hàng, ông Garnier." },
    },
    bienHo: [
      { hoi: "Mở đầu bản luận tội", pa: [
        { van: "Mesdames et messieurs, les faits que vous avez entendus sont graves.", dich: "Thưa quý vị, những sự việc quý vị đã nghe là nghiêm trọng.", tag: "ly" },
        { van: "Mesdames et messieurs, pensez à ceux qui ont tout perdu.", dich: "Thưa quý vị, hãy nghĩ đến những người đã mất tất cả.", tag: "tinh" },
        { van: "Mesdames et messieurs, les faits que vous avez entendu sont graves.", dich: "Thưa quý vị, những sự việc quý vị đã nghe là nghiêm trọng.", sai: "« Que » thay « faits » đứng trước động từ nên phải là « entendus »." },
      ] },
      { hoi: "Lập luận chính", pa: [
        { van: "Ses billets prouvent qu'il était à Paris ce jour-là.", dich: "Vé tàu chứng minh hắn ở Paris hôm đó.", tag: "ly" },
        { van: "Une plume peut écrire le mensonge, elle ne peut pas l'effacer.", dich: "Ngòi bút có thể viết lời dối trá, nhưng không xoá được nó.", tag: "dep" },
        { van: "Si Garnier serait innocent, il n'aurait pas menti.", dich: "Nếu Garnier vô tội, hắn đã không nói dối.", sai: "Sau « si » không dùng conditionnel: « si Garnier était »." },
      ] },
      { hoi: "Lời kết", pa: [
        { van: "Rendez justice à ceux qu'il a pris pour des personnages.", dich: "Hãy trả lại công lý cho những người hắn coi là nhân vật truyện.", tag: "tinh" },
        { van: "Que cette chronique s'arrête ici, sur le mot justice.", dich: "Mong chuyên mục này dừng ở đây, trên chữ công lý.", tag: "dep" },
        { van: "Il faut que vous rendez un verdict juste.", dich: "Quý vị cần đưa ra phán quyết công bằng.", sai: "Sau « il faut que » dùng subjonctif: « rendiez »." },
      ] },
    ],
    nhanChung: [
      {
        ten: "Marcel Tessier", vai: "Người bán báo", mau: "#57534e",
        gioiThieu: "Nhân chứng đầu tiên là ông Marcel Tessier, người bán báo ở quảng trường Châtelet, bạn cũ của Garnier.",
        doiDap: [
          { cau: "Il faut que vous sachiez la vérité.", dung: true, loi: "Objection ! Il faut « que vous savez » !", dich: "Phản đối! Phải là « que vous savez »!", luat: "subjonctif", gt: "« Il faut que » đòi subjonctif: « sachiez » là đúng." },
          { cau: "Les articles qu'il a écrit sont célèbres.", dung: false, loi: "Objection ! Il faut « écrits » !", dich: "Phản đối! Phải là « écrits »!", luat: "hop_avoir", gt: "Corbeau bắt đúng lỗi của bạn: « que » thay « articles » đứng trước động từ." },
        ],
        dong: [
          { van: "Je tiens le kiosque de la place du Châtelet depuis vingt ans.", dich: "Tôi giữ sạp báo ở quảng trường Châtelet đã hai mươi năm." },
          { van: "M. Garnier est un homme que tout le monde respecte.", dich: "Ông Garnier là người ai cũng kính trọng.",
            them: { hoi: "Vous le connaissez depuis longtemps ?", van: "Oui, c'est l'homme qui je vois chaque matin.", dich: "Vâng, đó là người tôi gặp mỗi sáng.", loi: L("qui", "que", ["dont", "où"], "quan_he", "« Je vois » đã có chủ ngữ, cần « que ».") } },
          { van: "Il faut que vous savez une chose : il est innocent.", dich: "Quý vị cần biết một điều: ông ấy vô tội.", loi: L("savez", "sachiez", ["saurez", "saviez"], "subjonctif", "Sau « il faut que » dùng subjonctif: « sachiez ».") },
          { van: "Les chroniques qu'il a écrit parlaient de Paris.", dich: "Các chuyên mục ông ấy viết nói về Paris.", loi: L("écrit", "écrites", ["écrite", "écrits"], "hop_avoir", "« Que » thay « chroniques » giống cái số nhiều đứng trước động từ: « écrites ».") },
          { van: "Ce mardi 3, il achetait son journal chez moi.", dich: "Thứ Ba ngày 3 đó, ông ấy mua báo ở chỗ tôi.",
            them: { hoi: "Quand est-il reparti à Rouen ?", van: "Il est reparti à Rouen avant midi, j'en suis sûr.", dich: "Ông ấy về Rouen trước trưa, tôi chắc chắn.", mau: { tang: "billets", gt: "Vé SNCF cho thấy hắn rời Paris lúc 19 giờ 40, không phải trước trưa." } } },
        ],
      },
      {
        ten: "Odile Vasseur", vai: "Chủ hiệu giấy ở Rouen", mau: "#9d174d",
        gioiThieu: "Nhân chứng thứ hai là bà Odile Vasseur, chủ hiệu giấy Vasseur ở Rouen.",
        doiDap: [
          { cau: "Si je savais, je vous le dirais.", dung: true, loi: "Objection ! Il faut « si je saurais » !", dich: "Phản đối! Phải là « si je saurais »!", luat: "si_dieu_kien", gt: "Sau « si » dùng imparfait. Câu này đúng." },
          { cau: "Il a dit qu'il écrit ce livre.", dung: false, loi: "Objection ! Il faut « qu'il écrivait » !", dich: "Phản đối! Phải là « qu'il écrivait »!", luat: "gian_tiep", gt: "Corbeau nói đúng: thuật lại quá khứ, présent thành imparfait." },
        ],
        dong: [
          { van: "Je tiens la papeterie Vasseur, à Rouen.", dich: "Tôi giữ hiệu giấy Vasseur ở Rouen." },
          { van: "M. Garnier est un client dont je connais bien.", dich: "Ông Garnier là khách tôi biết rõ.", loi: L("dont", "que", ["qui", "où"], "quan_he", "« Connaître » có bổ ngữ trực tiếp nên dùng « que ».") },
          { van: "Si je saurais qui il est, je vous le dirais.", dich: "Nếu tôi biết ông ấy là ai, tôi đã nói với quý vị.", loi: L("saurais", "savais", ["sais", "saurai"], "si_dieu_kien", "Sau « si » dùng imparfait: « si je savais ».") },
          { van: "Il m'a dit qu'il écrit un livre sur la police.", dich: "Ông ấy nói đang viết một cuốn sách về cảnh sát.", loi: L("écrit", "écrivait", ["écrira", "écrivît"], "gian_tiep", "Thuật lại lời nói trong quá khứ, présent thành imparfait.") },
          { van: "Il achetait chez moi ce papier à lettres.", dich: "Ông ấy mua loại giấy viết thư này ở chỗ tôi.",
            them: { hoi: "Vous vendez ce papier à beaucoup de gens ?", van: "Oui, à des centaines de clients chaque mois.", dich: "Vâng, cho hàng trăm khách mỗi tháng.", mau: { tang: "registre", gt: "Sổ của chính hiệu giấy ghi loại giấy này chỉ có một khách: ông Garnier." } } },
        ],
      },
      {
        ten: "Paul Garnier", vai: "Bị cáo", mau: "#475569",
        gioiThieu: "Giờ đến lượt chính Paul Garnier ra khai. Hắn viết rất giỏi, nhưng có giữ được ngữ pháp khi bị dồn không?",
        doiDap: [
          { cau: "Je pense à ces plumes, j'y pense souvent.", dung: true, loi: "Objection ! Il faut « j'en pense » !", dich: "Phản đối! Phải là « j'en pense »!", luat: "y_en", gt: "« Penser à » nên dùng « y ». Câu này đúng." },
          { cau: "Quand il sort de prison, il écrira.", dung: false, loi: "Objection ! Il faut « quand il sortira » !", dich: "Phản đối! Phải là « quand il sortira »!", luat: "quand_futur", gt: "Corbeau nói đúng: nói về tương lai, sau « quand » dùng futur." },
        ],
        dong: [
          { van: "Je suis journaliste au Courrier de Rouen.", dich: "Tôi là nhà báo của Le Courrier de Rouen." },
          { van: "Je n'ai jamais mis les pieds à Paris ce mardi-là.", dich: "Thứ Ba đó tôi chưa hề đặt chân tới Paris.", mau: { tang: "billets", gt: "Vé SNCF ghi rõ thứ Ba ngày 3 hắn đi Paris lúc 9 giờ 10." } },
          { van: "Quand la cour me libère demain, j'écrirai mon livre.", dich: "Khi toà trả tự do cho tôi ngày mai, tôi sẽ viết sách.", loi: L("libère", "libérera", ["libérait", "libérerait"], "quand_futur", "Nói về tương lai, sau « quand » dùng futur: « libérera ».") },
          { van: "Cette chronique ? J'en pense tous les jours.", dich: "Chuyên mục ấy ư? Ngày nào tôi cũng nghĩ tới.", loi: L("J'en", "J'y", ["Je", "J'ai"], "y_en", "« Penser à » nên dùng « y »: « j'y pense ».") },
          { van: "Les plumes grises ? Je les ai laissé par jeu.", dich: "Những chiếc lông xám ư? Tôi để lại cho vui.", loi: L("laissé", "laissées", ["laissés", "laissée"], "hop_avoir", "« Les » thay « plumes » giống cái số nhiều đứng trước động từ: « laissées ».") },
        ],
      },
    ],
  },
];
