/* Kỷ niệm và kết cục « Một năm ở Paris » (31/10, giai đoạn 5).
 *   DIA_DIEM: điểm trên bản đồ, x y theo % khung vuông. khop: đoạn tên trong trường noi của cảnh, cảnh nào
 *     đã chơi có noi chứa đoạn đó thì điểm sáng đèn. hd: hoạt động dẫn tới đó, dùng để gợi ý.
 *   ALBUM: ảnh theo id cảnh. loi[k]: chú thích theo lựa chọn thứ k trong lua của cảnh đó.
 *   THANH_NGU: Léon dạy ở tuần yên ả.
 *   KET_CUC: bốn hướng theo cờ kq_* ở tháng 8, thêm một kết cục ẩn. dat: đủ điều kiện, do: dở dang.
 * KHÔNG dùng dấu gạch dài (quy tắc 7). */
import { NHANH } from "./parisNhanh.js";
import { LICH_THANG } from "./parisThang.js";

export const VIEC = [...NHANH, ...Object.values(LICH_THANG).flatMap((t) => Object.values(t.tuan).flat())];
export const VIEC_THEO_ID = Object.fromEntries(VIEC.map((v) => [v.id, v]));

export const DIA_DIEM = [
  { id: "roissy", ten: "Roissy-CDG", x: 87, y: 10, hd: "*", khop: ["Roissy"], ghi: "Nơi mọi chuyện bắt đầu, với một tấm hộ chiếu và hai vali." },
  { id: "puces", ten: "Puces de Saint-Ouen", x: 45, y: 13, hd: "kham", khop: ["Saint-Ouen"], ghi: "Khu chợ đồ cũ lớn bậc nhất châu Âu. Ở đây phải mặc cả." },
  { id: "montmartre", ten: "Montmartre", x: 50, y: 28, hd: "kham", khop: ["Montmartre"], ghi: "Ngọn đồi của các hoạ sĩ, còn giấu cả một vườn nho." },
  { id: "marais", ten: "Le Marais", x: 60, y: 41, hd: "ban", khop: ["Marais"], ghi: "Những con phố cổ, quán bar nhỏ và rất nhiều tiếng cười." },
  { id: "bastille", ten: "Bastille", x: 68, y: 46, hd: "ban", khop: ["Bastille"], ghi: "Quảng trường của Cách mạng, và của những đêm nhạc." },
  { id: "hotelville", ten: "Hôtel de Ville", x: 54, y: 43, hd: "kham", khop: ["Hôtel de Ville", "Rue de Rivoli"], ghi: "Toà thị chính, trái tim của Đêm Trắng tháng 10." },
  { id: "louvre", ten: "Musée du Louvre", x: 45, y: 40, hd: "kham", khop: ["Louvre"], ghi: "Bảo tàng lớn nhất thế giới, đi một ngày không hết." },
  { id: "orsay", ten: "Musée d'Orsay", x: 39, y: 48, hd: "kham", khop: ["Orsay"], ghi: "Một nhà ga cũ nay chứa tranh của Monet và Van Gogh." },
  { id: "eiffel", ten: "Champ-de-Mars", x: 29, y: 53, hd: "*", khop: ["Champ-de-Mars"], ghi: "Bãi cỏ dưới chân tháp Eiffel, chỗ ngồi đẹp nhất đêm 14/7." },
  { id: "prefecture", ten: "Préfecture de Police", x: 51, y: 48, hd: "*", khop: ["Préfecture"], ghi: "Trên đảo Cité. Không du học sinh nào thoát được chỗ xếp hàng này." },
  { id: "quais", ten: "Quais de Seine", x: 61, y: 57, hd: "kham", khop: ["quais de Seine", "Quai de la Tournelle"], ghi: "Bờ sông để ngồi nhìn thành phố và nghĩ về năm sau." },
  { id: "fac", ten: "Quartier latin", x: 49, y: 58, hd: "hoc", khop: ["Amphithéâtre", "de la fac", "Salle B12", "Salle d'examen", "Bureau de Mme Laurent", "Sainte-Geneviève"], ghi: "Khu đại học từ thời Trung cổ, nơi bạn học và thi." },
  { id: "renard", ten: "Café Renard", x: 57, y: 65, hd: "lam", khop: ["Café Renard"], ghi: "Quán đầu phố của bà Renard, nơi bạn kiếm tiền nhà." },
  { id: "treize", ten: "Le 13e", x: 66, y: 72, hd: "*", khop: ["13e", "Place d'Italie"], ghi: "Khu phố châu Á của Paris. Ở đây Tết rộn ràng như ở nhà." },
  { id: "residence", ten: "Résidence étudiante", x: 46, y: 75, hd: "*", khop: ["Résidence", "Cuisine de la résidence"], ghi: "Căn phòng nhỏ và bác Dubois ở cổng." },
  { id: "quartier", ten: "Mon quartier", x: 36, y: 69, hd: "kham", khop: ["Boulangerie", "Pharmacie", "Café de la place"], ghi: "Tiệm bánh, hiệu thuốc, quán quen: nơi bạn học nói những câu đầu tiên." },
  { id: "camille", ten: "Chez Camille", x: 18, y: 40, hd: "ban", khop: ["Chez Camille"], ghi: "Căn hộ nơi bạn được đón như người nhà." },
  { id: "sceaux", ten: "Parc de Sceaux", x: 42, y: 92, hd: "ban", khop: ["Sceaux"], ghi: "Rừng hoa anh đào phía nam Paris, nở vào tháng 4." },
];

export const ALBUM = [
  { id: "sep_rentree", thang: 0, hinh: "mu", nen: "from-amber-400 to-orange-600", ten: "La rentrée", loi: ["Lần đầu nói trước cả giảng đường.", "Ngày đầu tiên, vẫn chưa biết vì sao mình ở đây.", "Một câu sai, nhớ cả đời."] },
  { id: "oct_nuit", thang: 1, hinh: "dem", nen: "from-indigo-500 to-violet-800", ten: "Nuit Blanche", loi: ["Cả thành phố thức, và bạn thức cùng.", "Không hiểu gì, mà vẫn vui."] },
  { id: "cho_troi", thang: 2, hinh: "den", nen: "from-amber-600 to-stone-700", ten: "La lampe des Puces", loi: ["Chiếc đèn mặc cả được, sáng nhất phòng.", "Trả nguyên giá, nhưng thích là được.", "Đi về tay không, kèm một bài học."] },
  { id: "dec_vi", thang: 3, hinh: "vi", nen: "from-stone-500 to-slate-700", ten: "Le portefeuille", loi: ["Mất ví, nhưng biết cách khai báo.", "Bị chỉ đường trong khi đang mất ví.", "Hôm đó quát nhầm người."] },
  { id: "dec_noel", thang: 3, hinh: "thong", nen: "from-emerald-600 to-red-700", ten: "Noël", loi: ["Noël ở Lyon, nhà Camille có bánh khúc gỗ.", "Đêm Noël sau quầy, lương gấp đôi.", "Một cuộc gọi về nhà giữa trời đông."] },
  { id: "jan_galette", thang: 4, hinh: "vuong", nen: "from-yellow-400 to-amber-600", ten: "La fève", loi: ["Vương miện giấy, cả bàn tung hô.", "Suýt mẻ răng vì hạt đậu may mắn."] },
  { id: "fev_tet", thang: 5, hinh: "hoa", nen: "from-red-500 to-amber-500", ten: "Le Têt à Paris", loi: ["Kể về Tết bằng tiếng Pháp cho Yuki nghe.", "Giao thừa xa nhà, có Yuki ngồi cạnh."] },
  { id: "hanami", thang: 6, hinh: "anhdao", nen: "from-pink-400 to-rose-500", ten: "Les cerisiers", loi: ["Yuki bảo đó là ngày đẹp nhất năm.", "Hết tiền, Yuki vẫn chuẩn bị đủ cả."] },
  { id: "avr_cuoi", thang: 7, hinh: "ca", nen: "from-sky-400 to-teal-600", ten: "Poisson d'avril", loi: ["Bắt quả tang con cá giấy sau lưng.", "Bị lừa trọn một buổi sáng."] },
  { id: "avr_picnic", thang: 7, hinh: "banh", nen: "from-lime-500 to-emerald-700", ten: "Pique-nique", chung: "Bên sông Marne, ba người bạn, một giỏ đồ ăn." },
  { id: "mai_muguet", thang: 8, hinh: "hoa", nen: "from-emerald-400 to-teal-600", ten: "Le muguet", loi: ["Cành hoa nhỏ khiến bác Dubois lặng đi.", "Một ngày tháng Năm bình yên."] },
  { id: "bi_mat", thang: 8, hinh: "nho", nen: "from-violet-500 to-fuchsia-800", ten: "La vigne secrète", loi: ["Vườn nho bí mật giữa Montmartre.", "Một góc nhỏ ít ai biết."] },
  { id: "juin_nhac", thang: 9, hinh: "nhac", nen: "from-orange-500 to-pink-600", ten: "Fête de la musique", loi: ["Hát dở, nhưng hát to.", "Đứng dưới xem, tay vẫn nhịp theo."] },
  { id: "nau_an", thang: 9, hinh: "pho", nen: "from-orange-400 to-red-600", ten: "Le phở du couloir", loi: ["Cả tầng ký túc xá ăn phở của bạn.", "Pizza thay phở, vẫn đông vui."] },
  { id: "sinh_nhat", thang: 9, hinh: "banhkem", nen: "from-fuchsia-500 to-rose-600", ten: "Surprise !", loi: ["Một câu nói khiến cả quán nâng ly.", "Không nói nên lời, và thế là đủ."] },
  { id: "bateau", thang: 10, hinh: "thuyen", nen: "from-sky-500 to-blue-800", ten: "Sur la Seine", loi: ["Paris trôi qua từ mặt sông.", "Đắt hơn 5 €, nhưng vẫn đẹp."] },
  { id: "jul_14", thang: 10, hinh: "phao", nen: "from-blue-600 to-red-600", ten: "Le 14 juillet", loi: ["Pháo hoa và những người bạn đã gặp.", "Pháo hoa và lần đầu nói không sợ."] },
];

export const THANH_NGU = [
  { fr: "Avoir le cafard", vi: "buồn chán, tâm trạng xuống. Mùa đông Paris rất dễ « avoir le cafard »." },
  { fr: "Il pleut des cordes", vi: "mưa như trút nước." },
  { fr: "Faire la grasse matinée", vi: "ngủ nướng tới trưa." },
  { fr: "Avoir la pêche", vi: "tràn đầy năng lượng, nghĩa đen là « có quả đào »." },
  { fr: "Coûter les yeux de la tête", vi: "đắt cắt cổ." },
  { fr: "Poser un lapin", vi: "cho ai đó leo cây, không đến chỗ hẹn." },
  { fr: "Être dans la lune", vi: "đãng trí, đầu óc trên mây." },
  { fr: "Ce n'est pas la mer à boire", vi: "không khó đến thế đâu." },
  { fr: "Les doigts dans le nez", vi: "dễ như trở bàn tay." },
  { fr: "Avoir du pain sur la planche", vi: "có cả núi việc phải làm." },
  { fr: "Raconter des salades", vi: "nói dóc, kể chuyện không có thật." },
  { fr: "En faire tout un fromage", vi: "chuyện bé xé ra to." },
  { fr: "Tomber dans les pommes", vi: "ngất xỉu." },
  { fr: "Avoir un chat dans la gorge", vi: "bị khàn tiếng." },
  { fr: "Mettre son grain de sel", vi: "chen vào chuyện không ai hỏi tới mình." },
  { fr: "Mettre les pieds dans le plat", vi: "lỡ lời đúng chuyện tế nhị." },
];

/* can: điều kiện của bản « dat ». chi: chỉ số, than: thiện cảm một người, noi: số nơi đã tới,
   ban: số người đạt 4 tim, co: có một trong các cờ. {ban} là người thân nhất, {noi} là số nơi đã tới. */
export const KET_CUC = {
  olai: {
    co: "kq_olai", ten: "Rester à Paris", hinh: "chia", a: "#fbbf24", b: "#c2410c",
    can: [{ chi: "phap", min: 60 }, { than: "renard", min: 3 }, { chi: "tt", min: 40 }],
    dat: { tieu: "Chìa khoá của một căn hộ nhỏ", van: "Tháng 9 năm sau, bà Renard giao cho bạn ca sáng và tờ hợp đồng đầu tiên mang tên bạn. Khách quen gọi bạn bằng tên, {ban} ghé qua mỗi cuối tuần. Bạn đã đi qua {noi} nơi trên bản đồ, và giờ bạn chỉ đường cho người khác.", fr: "Je reste à Paris : c'est ici que ma vie continue." },
    do: { tieu: "Ở lại, và làm lại từ đầu", van: "Bạn ở lại, nhưng năm đầu đi làm không dễ. Vài nơi lắc đầu, bạn tạm nhận những việc ngắn hạn, và {ban} hay rủ đi ăn để bạn đỡ nản. Paris chưa mở cửa hẳn, nhưng bạn đã biết phải gõ vào đâu.", fr: "Je reste, et je n'ai pas dit mon dernier mot." },
  },
  hoc: {
    co: "kq_hoc", ten: "Le master", hinh: "mu", a: "#c4b5fd", b: "#5b21b6",
    can: [{ chi: "phap", min: 70 }, { than: "laurent", min: 3 }, { co: ["thu_gt"] }],
    dat: { tieu: "Lá thư nhập học", van: "Một sáng tháng 9, thư nhập học nằm trong hộp thư. Mme Laurent đính kèm một dòng viết tay, ngắn gọn như mọi khi: bà tin bạn. Năm ngoái bạn còn run khi hỏi đường, năm nay bạn chuẩn bị viết luận văn bằng tiếng Pháp.", fr: "Je continue : le français est devenu ma langue de travail." },
    do: { tieu: "Danh sách chờ", van: "Hồ sơ master của bạn nằm ở danh sách chờ. Bạn dành thêm một năm củng cố tiếng Pháp và xin lại. {ban} giúp bạn đọc lại thư xin học, từng dòng một. Cánh cửa chưa mở, nhưng cũng chưa đóng.", fr: "Je n'ai pas encore réussi, mais je recommencerai." },
  },
  ve: {
    co: "kq_ve", ten: "Le Petit Café", hinh: "ly", a: "#fdba74", b: "#7c2d12",
    can: [{ chi: "tien", min: 500 }, { than: "renard", min: 2 }, { chi: "phap", min: 50 }],
    dat: { tieu: "Một quán nhỏ ở Hà Nội", van: "Sáu tháng sau, Le Petit Café mở cửa ở Hà Nội. Trên tường có tấm vé métro cũ, trong bếp có công thức croissant của bà Renard. {ban} gửi bưu thiếp từ Paris, và bạn dán ngay cạnh quầy. Thực đơn viết hai thứ tiếng, chính tay bạn.", fr: "Je suis rentré{e}, et Paris est revenu avec moi." },
    do: { tieu: "Vali nhẹ hơn dự tính", van: "Bạn về nhà với số tiền chưa đủ mở quán. Bạn dạy tiếng Pháp cho bọn trẻ trong xóm và nướng bánh vào cuối tuần. Mỗi lần mẻ croissant phồng đúng, bạn nhắn cho {ban}. Quán sẽ có, chỉ là muộn hơn một chút.", fr: "Mon café attendra un peu, mais il ouvrira." },
  },
  di: {
    co: "kq_di", ten: "Le tour de France", hinh: "tau", a: "#7dd3fc", b: "#1e40af",
    can: [{ chi: "tien", min: 300 }, { noi: 12 }, { chi: "tt", min: 40 }],
    dat: { tieu: "Một tấm vé đi khắp nước Pháp", van: "Lyon, Marseille, Bordeaux, Strasbourg: bạn đi hết danh sách Léon đưa, ba lô nhẹ, sổ tay dày thêm. Ở mỗi nơi bạn tự hỏi đường, tự mặc cả, tự kết bạn. {ban} nhận được một bưu thiếp ở mỗi thành phố.", fr: "J'ai vu Paris, et maintenant je veux voir toute la France." },
    do: { tieu: "Chuyến đi ngắn", van: "Tiền chỉ đủ tới Lyon và ở lại hai tuần. Bạn đứng ở bờ sông Rhône, gọi cho {ban} và hứa sẽ đi tiếp. Nước Pháp còn dài, và lần sau bạn sẽ biết để dành từ tháng 9.", fr: "J'ai commencé par Lyon. Le reste viendra." },
  },
  nha: {
    an: true, ten: "Paris, ma maison", hinh: "tim", a: "#fda4af", b: "#be123c",
    can: [{ ban: 4 }, { chi: "tt", min: 60 }, { noi: 14 }, { chi: "phap", min: 75 }],
    dat: { tieu: "Một gia đình ở phía bên kia thế giới", van: "Ngày cuối tháng 8 có tiếng gõ cửa. Tất cả đều ở đó, trên hành lang chật: người mang bánh, người mang ghế, bác Dubois mang chai vang từ vườn nho bí mật. Bạn đã tới đây một mình với hai vali. Giờ thì đi đâu, bạn cũng có một ngôi nhà để trở về. {ban} chỉ nói một câu, và bạn hiểu hết từng chữ.", fr: "On ne dit pas au revoir : on dit à bientôt, chez nous." },
  },
};
