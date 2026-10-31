import { Headphones, CloudRain, VenusAndMars, Shuffle, Crosshair, Check, Keyboard, Drama, Search, Landmark, MapPinned, Swords, Layers } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Danh mục trò chơi (31/10): sảnh TroChoiNhanh và khối « Đề xuất trò chơi » ở trang chủ dùng
 * chung, thêm trò mới ở đây là cả hai cùng thấy. */

/* Mô tả ngắn trên thẻ ở sảnh cho hai trò có Léon đứng cạnh chữ (31/10, chủ dự án). Các trò khác và màn luật chơi dùng `mo`. */
export const MO_NGAN = {
  do_vui: ["Gameshow cùng MC Léon: tự chọn địa danh trên bản đồ, đua với bà Minette tới chung kết.", "Jeu télé avec Léon : choisissez vos étapes, défiez Minette et visez la finale à Paris.", "TV quiz with Léon: pick your stops, race Minette, reach the Paris final."],
  phieu_luu: ["Sống 12 tháng du học cùng Léon: tự chọn việc mỗi tuần, giữ tiền, sức và tinh thần.", "12 mois d'études avec Léon : choisissez chaque semaine, gérez argent, énergie et moral.", "12 student months with Léon: choose each week, manage money, energy and mood."],
};
export const TRO_CHOI = () => [
  /* 28/10 (chủ dự án): Flashcard vào sảnh, nhóm Ôn luyện. */
  { ma: "flashcard", den: "/etudiant/bo-the", nhom: "on", Icon: Layers, nen: "from-teal-500 to-emerald-600",
    ten: "Flashcard",
    mo: tr("Lật thẻ ôn từ theo bộ giáo viên soạn, lịch ôn giãn cách nhắc đúng lúc sắp quên.", "Cartes à retourner, révision espacée au bon moment.", "Flip cards with spaced repetition at the right time.") },
  /* 28/10 (chủ dự án): Thách đấu PvP vào sảnh, nhóm Từ vựng; `den` = màn riêng, không qua ManChoi. */
  { ma: "thach_dau", den: "/etudiant/thach-dau", nhom: "tu", Icon: Swords, nen: "from-violet-600 to-rose-500",
    ten: tr("Thách đấu PvP", "Duel PvP", "PvP duel"),
    mo: tr("Đấu từ vựng 1 chọi 1 với bạn bè, ai nhanh và đúng hơn thì thắng.", "Duel de vocabulaire en 1 contre 1 avec vos amis.", "1-on-1 vocabulary duel against friends.") },
  { ma: "gioi_tinh", nhom: "tu", Icon: VenusAndMars, nen: "from-sky-500 to-pink-500",
    ten: tr("Le hay La?", "Le ou La ?", "Le or La?"),
    mo: tr("Phân loại thư cho trưởng bưu cục Léon: vuốt mỗi danh từ vào bao LE hoặc LA trước giờ đóng cửa. Thư hoả tốc ×2, đúng liên tiếp để nhân điểm.", "Triez le courrier : glissez chaque nom dans le sac LE ou LA. Lettre express ×2.", "Sort the mail: swipe each noun into the LE or LA bag. Express letters ×2.") },
  { ma: "nghe_chon", nhom: "ng", Icon: Headphones, nen: "from-indigo-500 to-violet-600",
    ten: tr("Radio Léon: băng đứt", "Radio Léon : la bande coupée", "Radio Léon: the snapped tape"),
    mo: tr("DJ Léon làm đứt cuộn băng! Nghe liền một chuỗi đoạn (không hiện chữ) rồi ghép lại đúng thứ tự đã nghe.", "La bande de DJ Léon est coupée ! Écoutez une série d'extraits, puis remettez-les dans l'ordre.", "DJ Léon's tape snapped! Hear a run of clips (no text), then put them back in order.") },
  { ma: "mua_chu", nhom: "tu", Icon: CloudRain, nen: "from-emerald-500 to-cyan-600",
    ten: tr("Mưa chữ", "Pluie de mots", "Word rain"),
    mo: tr("Mưa chữ rơi xuống vườn của Léon: chọn nghĩa, bắt đúng giọt hoặc gõ từ trước khi nó chạm đất. Mỗi từ đúng nở một bông hoa. 3 mạng.", "Il pleut des mots sur le jardin de Léon : chaque bonne réponse fait une fleur. 3 vies.", "Words rain on Léon's garden: every right answer blooms a flower. 3 lives."),
    kieu: [
      { ma: "nghia", get ten() { return tr("Chọn nghĩa", "Le sens", "Meaning"); }, get mo() { return tr("Từ Pháp rơi, chọn nghĩa đúng.", "Le mot tombe, choisissez son sens.", "French falls, pick its meaning."); } },
      { ma: "bat", get ten() { return tr("Bắt từ", "Attrape-mot", "Catch"); }, get mo() { return tr("Nghĩa hiện ở dưới, chạm đúng giọt tiếng Pháp.", "Le sens s'affiche, touchez le bon mot.", "Meaning shown, tap the right word."); } },
      { ma: "go", get ten() { return tr("Gõ chữ", "Tape-mot", "Type it"); }, get mo() { return tr("Nghĩa rơi, gõ từ tiếng Pháp.", "Le sens tombe, tapez le mot.", "Meaning falls, type the French."); } },
    ] },
  { ma: "xep_cau", nhom: "np", Icon: Shuffle, nen: "from-orange-500 to-rose-500",
    ten: tr("Chuyến tàu của Léon", "Le train de Léon", "Léon's train"),
    mo: tr("Trưởng tàu Léon chạy tuyến Paris → Nice: móc các toa từ theo đúng thứ tự, mỗi câu đúng tàu tới một ga. Mức Vừa/Khó có toa lạ lẫn trên sân ga.", "Paris → Nice : accrochez les mots dans l'ordre, chaque phrase juste = une gare. Attention au wagon intrus.", "Paris → Nice: hook words in order, each right sentence reaches a station. Watch for the stray wagon.") },
  { ma: "san_loi", nhom: "np", Icon: Crosshair, nen: "from-red-500 to-amber-500",
    ten: tr("Toà soạn Léon", "La rédaction de Léon", "Léon's newsroom"),
    mo: tr("Làm biên tập viên cho tổng biên tập Léon: khoanh chữ sai trong bản thảo rồi chọn chữ đúng để thay, trước giờ in. 3 lọ mực.", "Entourez la faute puis choisissez la correction avant l'impression. 3 encriers.", "Circle the mistake, then pick the fix before printing. 3 inkwells.") },
  { ma: "dung_sai", nhom: "np", Icon: Check, nen: "from-teal-500 to-blue-600",
    ten: tr("Phiên toà ngữ pháp", "Le tribunal de la grammaire", "Grammar court"),
    mo: tr("Làm luật sư trước toà của thẩm phán Léon: nghe nhân chứng khai, hô OBJECTION đúng lúc, chỉ ra từ sai, viện điều luật và sửa lại để thuyết phục bồi thẩm đoàn.", "Avocat devant le juge Léon : écoutez les témoins, criez OBJECTION, citez la règle et corrigez pour convaincre le jury.", "Be a lawyer before Judge Léon: hear the witnesses, shout OBJECTION, cite the rule and correct it to win the jury."),
    kieu: [
      { ma: "phien", get ten() { return tr("Phiên xử", "Audience", "Hearing"); }, get mo() { return tr("Một vụ án trọn vẹn, tranh tụng từng lời khai.", "Une affaire complète, témoin après témoin.", "A full case, witness by witness."); } },
      { ma: "nhanh", get ten() { return tr("Phiên nhanh", "Audience rapide", "Quick hearing"); }, get mo() { return tr("60 giây, đóng dấu VRAI hay FAUX thật nhanh.", "60 secondes pour tamponner VRAI ou FAUX.", "60 seconds to stamp VRAI or FAUX."); } },
    ] },
  { ma: "chep_nhanh", nhom: "ng", Icon: Keyboard, nen: "from-fuchsia-500 to-purple-600",
    ten: tr("Mật thư của P.G.", "Les messages de P.G.", "P.G.'s secret messages"),
    mo: tr("Giải mã 5 bức điện của kẻ bí ẩn. Máy thu có ít pin: mỗi lần nghe tốn 1 vạch, pin còn dư được cộng điểm.", "Décodez 5 messages secrets. Chaque écoute coûte de la batterie.", "Decode 5 secret messages. Every listen costs battery.") },
  { ma: "noi_mo_khoa", nhom: "ng", Icon: Drama, nen: "from-rose-500 to-red-600",
    ten: tr("Sân khấu Léon", "Le théâtre de Léon", "Léon's theatre"),
    mo: tr("Bạn là diễn viên: đọc thoại vài giây, màn nhung kéo kín, rồi nói thuộc lòng. 3 cảnh, dùng lượt chấm phát âm trong ngày.", "Lisez la réplique, le rideau tombe, dites-la de mémoire. 3 scènes.", "Read your line, the curtain closes, say it from memory. 3 scenes.") },
  { ma: "tham_tu", nhom: "dv", Icon: Search, nen: "from-slate-600 to-indigo-700", leon: { src: "/leon/tham-tu-lon.webp", lop: "mcf-leon-ro top-[2%] -right-[14%] h-[105%] max-w-none", chu: "max-w-[60%]" },
    ten: tr("Thám tử Léon", "Détective Léon", "Detective Léon"),
    mo: tr("Làm trợ lý cho Thanh tra Léon: 9 vụ án, đọc manh mối tiếng Pháp và lần ra kẻ bí ẩn P.G.", "Assistez l'inspecteur Léon : 9 affaires, des indices en français et le mystérieux P.G.", "Assist Inspector Léon: 9 cases, French clues and the mysterious P.G.") },
  { ma: "do_vui", nhom: "dv", Icon: Landmark, nen: "from-blue-600 to-red-500", leon: { src: "/leon/mc-lon.webp", lop: "mcf-leon-ro top-[2%] -right-[17%] h-[105%] max-w-none", chu: "max-w-[60%]" },
    ten: tr("Đố vui nước Pháp", "Quiz France", "France quiz"),
    mo: tr("Gameshow vòng quanh nước Pháp do MC Léon dẫn: tự chọn từng địa danh trên bản đồ, đua cùng bà Minette, về Paris chung kết.", "Un jeu télé à travers la France : choisissez vos étapes sur la carte, puis finale à Paris.", "A TV quiz around France: pick your stops on the map, then the final in Paris.") },
  { ma: "phieu_luu", nhom: "dv", Icon: MapPinned, nen: "from-amber-500 to-orange-600", leon: { src: "/leon/du-hoc-lon.webp", lop: "mcf-leon-ro top-[2%] -right-[37%] h-[105%] max-w-none", chu: "max-w-[60%]", kieu: { "--mcf-mat-a": "57%", "--mcf-mat-b": "77%" } },
    ten: tr("Một năm ở Paris", "Une année à Paris", "A year in Paris"),
    mo: tr("Sống 12 tháng du học cùng Léon: mỗi tuần tự chọn việc, giữ tiền, sức và tinh thần, đối đáp đúng sắc thái.", "12 mois de vie étudiante avec Léon : choisissez chaque semaine, gérez argent, énergie et moral.", "12 months of student life with Léon: choose each week, manage money, energy and mood.") },
];

/* Mô tả một dòng cho thẻ trôi ở trang chủ: thẻ nhỏ, không chứa nổi `mo`. */
const MO_THE_TROI = {
  gioi_tinh: ["Phân loại danh từ vào LE hay LA.", "Triez les noms : LE ou LA.", "Sort nouns into LE or LA."],
  nghe_chon: ["Nghe rồi ghép băng đúng thứ tự.", "Écoutez, remettez dans l'ordre.", "Listen, then put clips in order."],
  mua_chu: ["Bắt từ trước khi chạm đất.", "Attrapez les mots qui tombent.", "Catch words before they land."],
  xep_cau: ["Móc từ thành câu, đưa tàu tới ga.", "Accrochez les mots en phrase.", "Hook words into a sentence."],
  san_loi: ["Khoanh lỗi trước giờ in báo.", "Corrigez avant l'impression.", "Fix mistakes before print."],
  dung_sai: ["Làm luật sư, bắt lỗi lời khai.", "Avocat, traquez les fautes.", "Be the lawyer, catch the errors."],
  chep_nhanh: ["Nghe và giải mã 5 bức điện.", "Écoutez, décodez 5 messages.", "Listen and decode 5 messages."],
  noi_mo_khoa: ["Đọc thoại rồi nói thuộc lòng.", "Lisez, puis dites de mémoire.", "Read, then say it from memory."],
  tham_tu: ["9 vụ án, truy tìm P.G.", "9 affaires, traquez P.G.", "9 cases, hunt down P.G."],
  do_vui: ["Gameshow vòng quanh nước Pháp.", "Jeu télé à travers la France.", "A TV quiz around France."],
  phieu_luu: ["12 tháng du học cùng Léon.", "12 mois d'études avec Léon.", "12 student months with Léon."],
};

/* Thứ tự trên thẻ trôi: ba trò có ảnh Léon lên đầu (chủ dự án). Flashcard và Thách đấu có
 * `den` riêng và đã nằm ngay ở khối « Trò chơi & thử thách » phía trên nên không lặp lại. */
export function troChoiDeXuat() {
  const ds = TRO_CHOI().filter((x) => !x.den).map((x) => ({ ...x, moNgan: MO_THE_TROI[x.ma] ? tr(...MO_THE_TROI[x.ma]) : x.mo }));
  return [...ds.filter((x) => x.leon), ...ds.filter((x) => !x.leon)];
}
