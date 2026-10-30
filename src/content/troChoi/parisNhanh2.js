/* Cảnh rẽ nhánh bổ sung (31/10, giai đoạn 4), cùng khuôn parisNhanh.js, để bớt tuần yên ả.
 * KHÔNG dùng dấu gạch dài (quy tắc 7). */
export const NHANH_THEM = [
  {
    id: "thuyet_trinh", hd: "hoc", tu: 2, ai: "laurent", noi: "Salle B12",
    tinh: "Đến lượt bạn thuyết trình. Giáo sư hỏi bạn đã sẵn sàng chưa, trong khi tay bạn đang run.",
    noi_: "Vous êtes prêt ? Vous pouvez commencer quand vous voulez.",
    lua: [
      { c: "Merci, madame. Je voudrais vous parler de la ville de Hanoï.", tot: true, kq: { than: 1, phap: 2, nl: -5 }, dap: "Très bien, nous vous écoutons.", ghi: "« Je voudrais vous parler de… » là câu mở đầu chuẩn của một bài nói." },
      { c: "Pardon, je suis un peu stressé{e}. Puis-je prendre une minute ?", tot: true, kq: { tt: 4 }, dap: "Bien sûr, respirez.", ghi: "Nói thật cảm xúc cũng được, miễn là lịch sự. « stressé » hợp giống." },
      { c: "Non, ça me saoule, je passe.", tot: false, kq: { than: -1, tt: -4 }, dap: "Pardon ? Vous aurez zéro.", ghi: "« Ça me saoule » là tiếng lóng, tuyệt đối không dùng với giáo sư." },
    ],
  },
  {
    id: "thu_vien", hd: "hoc", tu: 4, ai: null, nguoi: "Une étudiante", noi: "Bibliothèque Sainte-Geneviève",
    tinh: "Người ngồi cạnh nói chuyện điện thoại khá to, bạn không học được.",
    noi_: "… oui, et alors je lui ai dit que… hein ? Vous voulez quelque chose ?",
    lua: [
      { c: "Excusez-moi, vous pourriez parler moins fort, s'il vous plaît ?", tot: true, kq: { phap: 2, tt: 2 }, dap: "Oh, pardon ! Je sors.", ghi: "So sánh « moins fort » và « pourriez » khiến lời nhờ nhẹ nhàng." },
      { c: "Chut !", tot: true, kq: { tt: -1 }, dap: "Ça va, ça va…", ghi: "Có tác dụng, nhưng hơi cộc." },
      { c: "Tais-toi, tu es nulle !", tot: false, kq: { tt: -5 }, dap: "Pardon ?! Vous êtes malade !", ghi: "« tu » với người lạ, lại còn xúc phạm. Tránh xa." },
    ],
  },
  {
    id: "thu_gioi_thieu", hd: "hoc", tu: 8, ai: "laurent", canThan: { laurent: 1 }, noi: "Bureau de Mme Laurent",
    tinh: "Bạn muốn xin giáo sư viết thư giới thiệu cho hồ sơ năm sau.",
    noi_: "Entrez. Vous vouliez me voir ?",
    lua: [
      { c: "Oui, madame. Accepteriez-vous de m'écrire une lettre de recommandation ?", tot: true, kq: { than: 1, phap: 3, co: "thu_gt" }, dap: "Avec plaisir. Vous avez bien travaillé cette année.", ghi: "Conditionnel « accepteriez-vous » là cách nhờ trang trọng nhất." },
      { c: "Il me faut une lettre pour demain.", tot: false, kq: { than: -1 }, dap: "Demain ? Vous plaisantez, j'espère.", ghi: "Đòi hỏi và gấp gáp, không phải cách nhờ giáo sư." },
    ],
  },
  {
    id: "pho_bien", hd: "lam", tu: 4, ai: "renard", noi: "Café Renard · terrasse",
    tinh: "Một nhóm khách Việt vào quán, họ không biết tiếng Pháp. Bà Renard nhìn bạn cầu cứu.",
    noi_: "Tu peux leur expliquer la carte ?",
    lua: [
      { c: "Bien sûr, je m'en occupe !", tot: true, kq: { tien: 25, tt: 6, than: 1 }, dap: "Tu es formidable. Tiens, le pourboire est pour toi.", ghi: "« Je m'en occupe » là câu nhận việc rất hay. Tiếng mẹ đẻ cũng là một lợi thế." },
      { c: "Ce n'est pas mon travail.", tot: false, kq: { than: -1 }, dap: "Ah. Je vois.", ghi: "Đúng ngữ pháp, nhưng lạnh lùng với người vừa nhờ." },
    ],
  },
  {
    id: "ca_som", hd: "lam", tu: 7, ai: "renard", noi: "Café Renard · 6 h 30",
    tinh: "Bạn đến trễ 20 phút ca sáng vì ngủ quên.",
    noi_: "Tu sais quelle heure il est ?",
    lua: [
      { c: "Je suis vraiment désolé{e}, ça ne se reproduira pas.", tot: true, kq: { than: 0, nl: -3 }, dap: "D'accord. Mets ton tablier.", ghi: "« Ça ne se reproduira pas » là lời hứa chuẩn khi xin lỗi." },
      { c: "Il est sept heures moins dix.", tot: false, kq: { than: -1 }, dap: "Très drôle.", ghi: "Trả lời đúng giờ, nhưng đây không phải câu hỏi về giờ!" },
    ],
  },
  {
    id: "on_thi", hd: "ban", tu: 5, ai: "camille", noi: "Chez Camille",
    tinh: "Camille rủ bạn ôn thi cùng, nhưng cô ấy cứ nói chuyện yêu đương.",
    noi_: "Bref, je crois qu'il ne m'aime plus… Tu en penses quoi ?",
    lua: [
      { c: "Tu devrais lui parler. On révise après ?", tot: true, kq: { than: 1, phap: 2 }, dap: "Tu as raison. Merci, toi.", ghi: "« Tu devrais » là lời khuyên nhẹ nhàng. « lui » thay cho anh ấy." },
      { c: "Je m'en fiche, on révise !", tot: false, kq: { than: -1 }, dap: "Sympa…", ghi: "« Je m'en fiche » là tôi không quan tâm, rất phũ." },
    ],
  },
  {
    id: "nau_an", hd: "ban", tu: 7, ai: "yuki", noi: "Cuisine de la résidence",
    tinh: "Yuki và bạn định nấu phở mời cả tầng. Thiếu mấy nguyên liệu.",
    noi_: "Il nous faut quoi pour le phở ?",
    lua: [
      { c: "Il nous faut du bœuf, des nouilles et de la coriandre.", tot: true, kq: { tien: -18, tt: 10, than: 1, phap: 2 }, dap: "Parfait, je vais au marché !", ghi: "Mạo từ bộ phận: du (đực), de la (cái), des (số nhiều)." },
      { c: "On commande une pizza ?", tot: true, kq: { tien: -10, tt: 3 }, dap: "Ah… d'accord.", ghi: "Dễ hơn, nhưng mất dịp giới thiệu món Việt." },
    ],
  },
  {
    id: "sinh_nhat", hd: "ban", tu: 9, ai: "camille", canThan: { camille: 2 }, noi: "Un bar du Marais",
    tinh: "Cả nhóm tổ chức bất ngờ sinh nhật cho bạn. Camille giơ ly lên.",
    noi_: "Surprise ! Un discours, un discours !",
    lua: [
      { c: "Merci à tous, vous êtes ma famille à Paris.", tot: true, kq: { tt: 15, than: 1 }, dap: "Ooooh ! Santé !", ghi: "Một câu ngắn, đúng lúc. Đây là phần thưởng của một năm kết bạn." },
      { c: "Je ne sais pas quoi dire… Merci !", tot: true, kq: { tt: 10 }, dap: "Ça suffit, on t'aime !", ghi: "Thành thật cũng đủ dễ thương." },
    ],
  },
  {
    id: "louvre", hd: "kham", tu: 3, ai: null, nguoi: "Le gardien du musée", noi: "Musée du Louvre",
    tinh: "Bạn lạc giữa bảo tàng, đang tìm bức Joconde.",
    noi_: "Vous cherchez quelque chose ?",
    lua: [
      { c: "Oui, pourriez-vous m'indiquer où se trouve la Joconde ?", tot: true, kq: { tt: 5, phap: 2 }, dap: "Premier étage, suivez les panneaux.", ghi: "Câu hỏi gián tiếp không đảo ngữ: « où se trouve… »." },
      { c: "Où est-ce que la Joconde est-elle ?", tot: false, kq: { tt: -1 }, dap: "Pardon ? Ah, la Joconde… par là.", ghi: "Không dùng « est-ce que » cùng với đảo ngữ." },
    ],
  },
  {
    id: "bateau", hd: "kham", tu: 9, ai: null, nguoi: "L'employée", noi: "Quai de la Tournelle",
    tinh: "Một buổi tối đẹp, bạn định đi thuyền trên sông Seine.",
    noi_: "Bonsoir ! C'est quinze euros, tarif étudiant dix euros.",
    lua: [
      { c: "Une place au tarif étudiant, s'il vous plaît. Voici ma carte.", tot: true, kq: { tien: -10, tt: 10, phap: 1 }, dap: "Merci, bonne soirée sur la Seine !", ghi: "Luôn hỏi tarif étudiant ở Pháp." },
      { c: "Quinze euros, d'accord.", tot: true, kq: { tien: -15, tt: 10 }, dap: "Bonne soirée !", ghi: "Bạn trả thêm 5 € dù có thẻ sinh viên." },
    ],
  },
];
