/* Cảnh rẽ nhánh « Một năm ở Paris » (31/10, giai đoạn 2). Mọi câu đáp đều được phép chọn, khác nhau ở hệ quả.
 *   hd: hoạt động mở cảnh. tu: tháng sớm nhất (0 = tháng 9). can: cờ phải có. canThan: { nhân vật: mức tối thiểu }.
 *   lua[]: { c: câu nói, kq: { tien, nl, tt, phap, than, co }, dap: lời đáp, ghi: Léon giải thích, tot: đúng sắc thái }.
 *   {e} trong câu nói: thành « e » nếu người chơi là nữ, bỏ đi nếu là nam (dạy hợp giống).
 * KHÔNG dùng dấu gạch dài (quy tắc 7). */
export const NHAN_VAT = {
  renard: { ten: "Mme Renard", vai: "Chủ Café Renard", nen: "from-amber-500 to-orange-600" },
  camille: { ten: "Camille", vai: "Bạn học", nen: "from-pink-500 to-rose-600" },
  yuki: { ten: "Yuki", vai: "Du học sinh Nhật", nen: "from-sky-500 to-indigo-600" },
  laurent: { ten: "Mme Laurent", vai: "Giáo sư", nen: "from-violet-500 to-purple-700" },
  dubois: { ten: "M. Dubois", vai: "Bác bảo vệ ký túc xá", nen: "from-emerald-500 to-teal-700" },
};

export const NHANH = [
  {
    id: "viec", hd: "lam", tu: 0, ai: "renard", noi: "Café Renard · comptoir",
    tinh: "Quán cà phê đầu phố tìm người làm thêm. Bà chủ hỏi kinh nghiệm của bạn.",
    noi_: "Vous avez déjà travaillé dans un café ?",
    lua: [
      { c: "Non, mais j'apprends vite et je suis très motivé{e}.", tot: true, kq: { than: 1, phap: 1 }, dap: "J'aime votre franchise. On essaie une semaine ?", ghi: "Thành thật và tự tin là câu trả lời hay nhất. « motivé » hợp giống với người nói." },
      { c: "Oui, très souvent !", tot: true, kq: { than: 0, tt: 3, co: "noi_doi" }, dap: "Parfait, alors vous commencez demain.", ghi: "Câu đúng, nhưng là lời nói dối. Bà Renard sẽ sớm biết thôi." },
      { c: "Salut ! Vous payez combien ?", tot: false, kq: { than: -1 }, dap: "Euh… on se calme. Vous pouvez commencer par dire bonjour.", ghi: "« Salut » quá thân mật với người sắp thuê mình, và hỏi lương ngay là vội." },
    ],
  },
  {
    id: "khach", hd: "lam", tu: 2, ai: "renard", noi: "Café Renard · terrasse",
    tinh: "Một ông khách gắt lên vì cà phê nguội, cả sân nhìn sang.",
    noi_: "Excusez-moi ! Ce café est froid !",
    lua: [
      { c: "Je suis désolé{e}, je vous en refais un tout de suite.", tot: true, kq: { than: 1, tt: 2 }, dap: "Ah… merci, c'est gentil.", ghi: "Xin lỗi và đề xuất cách sửa ngay. « en » thay cho « un café »." },
      { c: "Je vais chercher la patronne.", tot: true, kq: { phap: 1 }, dap: "Bon, si vous voulez.", ghi: "Không sai, nhưng bà Renard muốn bạn tự xử lý được." },
      { c: "Il n'est pas froid, monsieur.", tot: false, kq: { than: -1, tt: -3 }, dap: "Pardon ? Je veux parler à la patronne !", ghi: "Cãi khách là cách nhanh nhất để làm to chuyện." },
    ],
  },
  {
    id: "that_lo", hd: "lam", tu: 3, ai: "renard", can: "noi_doi", noi: "Café Renard · derrière le comptoir",
    tinh: "Bạn vừa làm hỏng máy pha cà phê. Bà Renard nhìn thẳng vào bạn.",
    noi_: "Vous m'aviez dit que vous aviez de l'expérience, non ?",
    lua: [
      { c: "Vous avez raison, j'ai menti. Je suis désolé{e}.", tot: true, kq: { than: 2, tt: -2 }, dap: "Merci de le dire. Je vais vous apprendre.", ghi: "Nhận lỗi muộn vẫn hơn không. « mentir » có phân từ « menti »." },
      { c: "C'est la machine qui est vieille.", tot: true, kq: { than: -1 }, dap: "Bien sûr. Comme par hasard.", ghi: "Đổ lỗi cho máy, bà ấy không tin đâu." },
      { c: "Bof, ce n'est pas grave.", tot: false, kq: { than: -2, tien: -40 }, dap: "Pour moi, si. Je retire la réparation de votre paie.", ghi: "« Bof » là thờ ơ, sai hẳn tình huống. Bạn còn mất 40 €." },
    ],
  },
  {
    id: "them_ca", hd: "lam", tu: 5, ai: "renard", canThan: { renard: 1 }, noi: "Café Renard · fermeture",
    tinh: "Giờ bà Renard đã xưng « tu » với bạn. Bà nhờ làm thêm tối thứ Bảy.",
    noi_: "Tu pourrais travailler samedi soir ? J'ai vraiment besoin de toi.",
    lua: [
      { c: "Oui, avec plaisir !", tot: true, kq: { tien: 60, nl: -15, than: 1 }, dap: "Tu me sauves ! Merci.", ghi: "Được tiền và thiện cảm, nhưng mất sức." },
      { c: "Désolé{e}, j'ai déjà quelque chose de prévu.", tot: true, kq: { tt: 5 }, dap: "Pas de souci, une autre fois.", ghi: "Từ chối lịch sự kiểu Pháp: « j'ai quelque chose de prévu »." },
      { c: "Non.", tot: false, kq: { than: -1 }, dap: "… D'accord.", ghi: "Một chữ « non » trần trụi nghe rất lạnh. Luôn thêm lý do." },
    ],
  },
  {
    id: "cinema", hd: "ban", tu: 1, ai: "camille", noi: "Sortie de la fac",
    tinh: "Camille rủ bạn đi xem phim tối nay.",
    noi_: "Tu veux venir au cinéma ce soir ?",
    lua: [
      { c: "Avec plaisir ! On se retrouve où ?", tot: true, kq: { tien: -12, tt: 8, than: 1 }, dap: "Devant le Rex, à vingt heures !", ghi: "« On se retrouve » là cách hẹn gặp rất tự nhiên." },
      { c: "Désolé{e}, je dois réviser. Une autre fois ?", tot: true, kq: { phap: 2 }, dap: "Pas de problème, bon courage !", ghi: "Từ chối khéo và mở đường cho lần sau." },
      { c: "Je ne souhaite pas vous accompagner, madame.", tot: false, kq: { than: -1 }, dap: "Euh… madame ? Tu rigoles ?", ghi: "Với bạn cùng lớp, « vous » và « madame » nghe xa cách đến buồn cười." },
    ],
  },
  {
    id: "nho_nha", hd: "ban", tu: 3, ai: "yuki", noi: "Cuisine de la résidence",
    tinh: "Yuki ngồi một mình trong bếp ký túc xá, mắt đỏ hoe.",
    noi_: "Je ne sais pas… Je me sens seule ici.",
    lua: [
      { c: "Je te comprends. On prend un thé ensemble ?", tot: true, kq: { tt: 6, than: 2, co: "yuki" }, dap: "Oui… merci. Ça me fait du bien.", ghi: "Lắng nghe và rủ làm việc nhỏ cùng nhau. Bạn vừa có một người bạn thật." },
      { c: "Courage, ça va passer.", tot: true, kq: { than: 0 }, dap: "Oui, peut-être.", ghi: "Đúng, nhưng hơi xã giao." },
      { c: "Ce n'est pas grave. Moi, je vais très bien.", tot: false, kq: { than: -1 }, dap: "Ah. Tant mieux pour toi.", ghi: "Nói về mình khi người khác đang buồn là thiếu tinh tế." },
    ],
  },
  {
    id: "hanami", hd: "ban", tu: 6, ai: "yuki", can: "yuki", noi: "Parc de Sceaux",
    tinh: "Tháng ba, Yuki rủ bạn đi ngắm hoa anh đào ở công viên Sceaux, như ở nhà cô ấy.",
    noi_: "Je voudrais te remercier pour cet hiver. Tu viens pique-niquer ?",
    lua: [
      { c: "Bien sûr ! J'apporte le dessert.", tot: true, kq: { tien: -15, tt: 15, than: 1 }, dap: "Génial ! C'est le plus beau jour de l'année.", ghi: "Quan tâm mùa đông năm ấy nay được đáp lại." },
      { c: "J'aimerais bien, mais je n'ai plus d'argent.", tot: true, kq: { tt: 5, than: 0 }, dap: "Ne t'inquiète pas, j'ai tout préparé !", ghi: "Thành thật với bạn thân thì không sao. « J'aimerais bien » là conditionnel." },
    ],
  },
  {
    id: "tre_bai", hd: "hoc", tu: 1, ai: "laurent", noi: "Bureau de Mme Laurent",
    tinh: "Bạn nộp bài trễ một ngày. Giáo sư gọi bạn lên.",
    noi_: "Votre devoir n'est pas arrivé. Une explication ?",
    lua: [
      { c: "Je vous prie de m'excuser. Puis-je vous le rendre demain ?", tot: true, kq: { than: 1, phap: 2 }, dap: "Bien. Demain, huit heures, pas plus tard.", ghi: "Công thức trang trọng « Je vous prie de m'excuser ». « le » thay cho « devoir »." },
      { c: "J'étais fatigué{e}.", tot: true, kq: { than: 0 }, dap: "Nous le sommes tous.", ghi: "Đúng ngữ pháp, nhưng không thuyết phục được ai." },
      { c: "Ouais, désolé{e}, j'ai zappé.", tot: false, kq: { than: -1 }, dap: "Pardon ? Surveillez votre langage.", ghi: "« Ouais », « zapper » là khẩu ngữ, không dùng với giáo sư." },
    ],
  },
  {
    id: "chep", hd: "hoc", tu: 3, ai: "laurent", noi: "Bibliothèque de la fac",
    tinh: "Hugo cùng lớp xin chép bài của bạn. Hạn nộp còn một tiếng.",
    noi_: "Hugo : Tu me passes ton devoir ? Je n'ai rien fait.",
    lua: [
      { c: "Je préfère t'expliquer, si tu veux.", tot: true, kq: { phap: 3 }, dap: "Hugo : Pfff… bon, d'accord, explique.", ghi: "Giúp mà không gian lận." },
      { c: "Bon, d'accord, tiens.", tot: true, kq: { tt: 2, co: "cho_chep" }, dap: "Hugo : Merci, tu me sauves !", ghi: "Nhẹ người lúc này, nhưng hai bài giống hệt nhau sẽ gây chuyện." },
      { c: "Débrouille-toi !", tot: true, kq: { tt: -2 }, dap: "Hugo : Sympa, merci…", ghi: "« Débrouille-toi » là tự xoay đi, nghe khá gắt." },
    ],
  },
  {
    id: "hai_bai", hd: "hoc", tu: 5, ai: "laurent", can: "cho_chep", noi: "Bureau de Mme Laurent",
    tinh: "Giáo sư đặt hai bài giống hệt nhau lên bàn.",
    noi_: "Ces deux copies sont identiques. Que s'est-il passé ?",
    lua: [
      { c: "Je lui ai donné mon devoir. Je suis désolé{e}.", tot: true, kq: { than: 1, tt: -3 }, dap: "C'est honnête. Je m'en souviendrai.", ghi: "« lui » là gián tiếp: donner À quelqu'un." },
      { c: "Je ne comprends pas de quoi vous parlez.", tot: true, kq: { than: -2 }, dap: "Vraiment ? Nous verrons cela avec le directeur.", ghi: "Câu đúng, nhưng chối trước bằng chứng thì mất lòng tin." },
    ],
  },
  {
    id: "cho_troi", hd: "kham", tu: 2, ai: null, nguoi: "Le brocanteur", noi: "Marché aux puces de Saint-Ouen",
    tinh: "Bạn thích một chiếc đèn cũ cho phòng ở chợ đồ cũ.",
    noi_: "Cette lampe ? Quarante euros, c'est donné !",
    lua: [
      { c: "Elle est belle, mais c'est un peu cher. Vous feriez vingt-cinq ?", tot: true, kq: { tien: -25, tt: 6, phap: 1 }, dap: "Trente, et elle est à vous !… Allez, vingt-cinq.", ghi: "Mặc cả lịch sự bằng conditionnel: « Vous feriez…? »." },
      { c: "D'accord, je la prends.", tot: true, kq: { tien: -40, tt: 4 }, dap: "Bon choix !", ghi: "Ở chợ đồ cũ, không mặc cả là phí tiền." },
      { c: "Quarante euros ? Vous êtes fou !", tot: false, kq: { tt: -2 }, dap: "Alors allez acheter ailleurs !", ghi: "Quá thô, người bán quay lưng luôn." },
    ],
  },
  {
    id: "montmartre", hd: "kham", tu: 4, ai: "dubois", noi: "Résidence · loge du gardien",
    tinh: "Bác Dubois sinh ra ở Montmartre và mời bạn đi dạo.",
    noi_: "Vous connaissez le vieux Montmartre ?",
    lua: [
      { c: "Non, pourriez-vous me le montrer ?", tot: true, kq: { tt: 8, than: 1, phap: 1 }, dap: "Avec joie ! Dimanche, je vous emmène.", ghi: "« Pourriez-vous » là lời nhờ lịch sự." },
      { c: "Non merci, je n'ai pas le temps.", tot: true, kq: { nl: 5 }, dap: "Comme vous voudrez.", ghi: "Lịch sự, nhưng bỏ lỡ một người bạn già." },
      { c: "Tu me fais visiter, mec ?", tot: false, kq: { than: -1 }, dap: "« Mec » ? On ne me parle pas ainsi.", ghi: "« Mec » và « tu » với bậc lớn tuổi là hỗn." },
    ],
  },
  {
    id: "bi_mat", hd: "kham", tu: 8, ai: "dubois", canThan: { dubois: 1 }, noi: "Montmartre · une petite rue",
    tinh: "Bác Dubois dẫn bạn vào một vườn nho nhỏ giữa Paris, nơi ít du khách biết.",
    noi_: "C'est mon secret. Vous savez qu'on fait du vin ici ?",
    lua: [
      { c: "Je n'en savais rien ! Merci de me le faire découvrir.", tot: true, kq: { tt: 12, than: 1, phap: 2 }, dap: "Revenez quand vous voulez. Vous êtes d'ici, maintenant.", ghi: "« en » thay cho « de ça ». Bạn đã mở được một góc Paris bí mật." },
      { c: "C'est sympa. On rentre ?", tot: true, kq: { than: 0 }, dap: "Si vous voulez…", ghi: "Hơi hờ hững trước một món quà tinh thần." },
    ],
  },
];
