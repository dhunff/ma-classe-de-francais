/* Lô 39 (04/11/2026): đưa 28 bài ĐỌC A2 trên cây về đúng khung đề DELF A2 tout public format mới
 * (Sujet_démo_A2TP_02, bản người chấm trên delfdalf.fr, đọc 04/11/2026). Máy dựng: lo39_doc_a2_de.mjs.
 *
 * Mỗi bài là MỘT activité của đề, đủ 6 mục:
 *   bài 1 của đề  (A2-CE-3)          : ghép 6 tài liệu với 8 người, hai người thừa.
 *   bài 2, bài 3  (A2-CE-1, 2, 5)    : 6 câu trắc nghiệm 3 phương án, KHÔNG có Vrai/Faux.
 *   bài 4         (A2-CE-4, bài báo) : 6 câu, trắc nghiệm 3 phương án kèm Vrai/Faux.
 * Theo chủ dự án (04/11): bám sát đề 100 %, sửa thẳng bài cũ, giữ id câu cũ theo thứ tự và ghi đè,
 * chỉ xoá câu thừa. Không đặt điểm lẻ (`heSo`) cho bài luyện tập.
 *
 * Cách ghi một bài:
 *   giu   : các `ord` cũ giữ lại, theo thứ tự mới. Câu `vf` cũ và câu Vrai/Faux tự đổi theo `vf`.
 *   bo    : { ord: "phương án bỏ" } cho câu 4 phương án.
 *   thay  : { ord: câu mới } thay nội dung câu ở vị trí đó.
 *   xoaVan: đoạn <p> bỏ khỏi văn bản (vì câu hỏi về nó đã bỏ).
 *   moi   : viết lại cả bài (tiêu đề, đề, văn bản, câu, từ vựng, mẹo).
 * Nội dung học: KHÔNG dùng dấu gạch dài. Đoạn trong « » ở lời giải phải có nguyên văn trong văn bản. */

const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
const nhan = (t) => `<strong>${t}</strong>`;
const tl = (...ds) => ds.map((x, i) => p(`${nhan(`Document ${i + 1}`)} ${x}`)).join("");
const DE_GHEP = "<p>Lisez les six documents. Associez chaque document à la personne qui correspond. Attention : deux personnes ne correspondent à aucun document.</p>";
const HOI_GHEP = "Pour chaque document, choisissez la bonne personne.";
const DOC = ["Document 1", "Document 2", "Document 3", "Document 4", "Document 5", "Document 6"];

export const chinhSua = ({ qcm, ghep }) => ({
  /* ───────── A2-CE-1 : thư, email (bài 2 của đề: chỉ QCM) ───────── */
  a2ce011su03l: { giu: [1, 2, 3, 4, 5, 7], thay: { 7: qcm("Aujourd'hui, la climatisation…", "ne marche toujours pas", ["a été réparée par un employé", "marche seulement la nuit"], "« personne n'est venu la réparer »: máy lạnh vẫn hỏng.") } },
  a2ce021sw03m: { giu: [1, 2, 3, 5, 6, 7] },
  nhapmuof28x103u: { giu: [1, 2, 3, 4, 6, 8], bo: { 1: "À Hanoï", 2: "Lundi prochain", 3: "Grand et sombre", 4: "Une heure à pied", 6: "Un musée", 8: "De partir à Paris" } },
  lo25mvg3fe8101y: { giu: [1, 2, 3, 4, 6, 7] },
  lo25mvg3fe86027: { giu: [1, 2, 4, 5, 6, 7] },
  lo25mvg3fe85024: { giu: [1, 2, 3, 4, 5, 6] },

  /* ───────── A2-CE-2 : quảng cáo, chỉ dẫn (bài 3 của đề: chỉ QCM) ───────── */
  a2ce031sw03n: { giu: [1, 2, 4, 5, 6, 7] },
  a2ce041sw03o: { giu: [1, 2, 4, 5, 6, 7], thay: {
    1: qcm("Qui peut participer à l'atelier ?", "Inès, 15 ans, qui habite dans la commune et qui est libre toute la semaine", ["Hugo, 18 ans, qui habite dans la commune", "Léa, 13 ans, qui peut venir seulement trois jours"], "Điều kiện: « avoir entre 12 et 17 ans et habiter dans la commune » và « les participants doivent être présents les cinq jours »."),
    2: qcm("Pourquoi Hugo ne peut-il pas s'inscrire ?", "Il est trop âgé.", ["Il n'habite pas dans la commune.", "Il n'est pas libre l'après-midi."], "Hugo 18 tuổi, đề đòi « avoir entre 12 et 17 ans »."),
  } },
  lo25mvg3fe85023: { giu: [1, 2, 3, 4, 5, 6], thay: { 4: qcm("Sur Internet, on peut prolonger…", "tous les documents, sauf les nouveautés", ["seulement les nouveautés", "les documents autant de fois qu'on veut"], "« vous pouvez prolonger une fois vos emprunts sur internet, sauf les nouveautés ».") } },
  lo25mvg3fe8401z: { giu: [1, 2, 3, 4, 5, 6], thay: { 6: qcm("Qu'est-ce qui est obligatoire dans la piscine ?", "le bonnet de bain", ["le short de bain", "la carte 10 entrées"], "« le bonnet de bain est obligatoire ». Quần short thì bị cấm: « les shorts de bain sont interdits ».") } },
  lo25mvg3fe84021: { giu: [1, 2, 3, 4, 5, 7] },
  lo25mvg3fe84020: { giu: [1, 2, 3, 4, 6, 7], thay: { 6: qcm("Les colocataires cherchent une personne…", "calme, qui ne fume pas et sans animal", ["qui a un petit chat", "qui fume seulement sur le balcon"], "« nous cherchons une personne calme et non-fumeuse » và « les animaux ne sont pas acceptés ».") } },
  lo24mvfc52z002p: { giu: [1, 2, 3, 6, 7, 8] },

  /* ───────── A2-CE-4 : bài báo (bài 4 của đề: QCM kèm Vrai/Faux) ───────── */
  a2ce091sx03t: { giu: [1, 2, 3, 5, 6, 7] },
  a2ce101sx03u: { giu: [1, 2, 3, 4, 5, 7] },
  a2ce111sy03v: { giu: [1, 2, 3, 4, 5, 6] },
  lo25mvg3fe84022: { giu: [1, 2, 3, 4, 6, 7] },
  lo25mvg3fe85025: { giu: [1, 2, 3, 5, 6, 7] },

  /* ───────── A2-CE-5 : nhận ra cách nói khác (dạng bài 2, 3 của đề: chỉ QCM) ───────── */
  a2ce121sy03w: { giu: [1, 2, 3, 4, 5, 6], xoaVan: ["7. Nous sommes complets ce soir.", "8. Mon frère cadet habite en banlieue."] },
  a2ce131sy03x: { giu: [1, 2, 3, 4, 5, 6], thay: { 6: qcm("Samedi, Emma…", "ne pourra pas aller à la fête de Nora", ["ira à la fête de Nora avec sa famille", "organisera une fête au restaurant italien"], "Cuối tuần Emma ở chỗ gia đình, tại một thành phố khác, nên xin lỗi và hẹn Nora dịp khác.") } },
  a2ce141sy03y: { giu: [1, 2, 3, 4, 5, 6] },
  a2ce151sy03z: { giu: [1, 2, 3, 4, 5, 6] },
  a2ce161sy040: { giu: [1, 2, 3, 4, 5, 6] },

  /* ───────── A2-CE-3 : bài 1 của đề, ghép 6 tài liệu với 8 người ───────── */
  lo25mvg3fe85026: { moi: { tieuDe: "Lecture A2 : les ateliers de la maison de quartier", de: DE_GHEP,
    van: tl("Atelier couture : apprenez à réparer et à transformer vos vêtements. Le mardi soir, de 18 h à 20 h. Machines à coudre fournies.",
      "Club d'échecs : débutants bienvenus ! Tous les mercredis après-midi, pour les enfants de 7 à 12 ans.",
      "Yoga doux pour les futures mamans : le jeudi à 10 h. Inscription à l'accueil.",
      "Cuisine du monde : chaque samedi, un pays différent. Ce mois-ci, le Vietnam et le Maroc.",
      "Groupe de marche : rendez-vous le dimanche à 9 h devant la maison de quartier. Balades de 8 km dans la campagne.",
      "Aide aux devoirs pour les collégiens : du lundi au jeudi, de 17 h à 18 h 30, avec des étudiants bénévoles."),
    cau: [ghep(HOI_GHEP, DOC, ["A. Claire sera maman dans trois mois.", "B. Lina veut réparer elle-même ses vieux jeans.", "C. Nadia veut apprendre à jouer de la guitare.", "D. M. Petit cherche une activité en plein air le week-end.", "E. Sami, 9 ans, veut apprendre un jeu de réflexion.", "F. Paul cherche un cours de natation pour adultes.", "G. Hugo aime découvrir des plats étrangers.", "H. Mme Roux cherche de l'aide pour son fils, qui est au collège."], [1, 4, 0, 6, 3, 7],
      "1: « apprenez à réparer et à transformer vos vêtements » (Lina). 2: « pour les enfants de 7 à 12 ans » (Sami). 3: « pour les futures mamans » (Claire). 4: « chaque samedi, un pays différent » (Hugo). 5: « balades de 8 km dans la campagne », le dimanche (M. Petit). 6: « aide aux devoirs pour les collégiens » (Mme Roux). Không tài liệu nào nói về đàn guitar hay bơi lội.")],
    tu: ["coudre (verbe) : may", "une future maman (nom féminin) : người sắp làm mẹ", "une balade (nom féminin) : cuộc đi dạo", "un collégien (nom masculin) : học sinh cấp hai", "bénévole (adjectif) : tình nguyện"],
    meo: ["Đọc tám người trước, gạch dưới nhu cầu của từng người, rồi mới đọc tài liệu.", "Hai người không có tài liệu nào: đừng cố ghép cho đủ."] } },
  a2ce051sw03p: { moi: { tieuDe: "Lecture A2 : des petites annonces", de: DE_GHEP,
    van: tl("Vends vélo de ville en très bon état, 80 €. Idéal pour aller au travail tous les jours.",
      "Cherche baby-sitter le mercredi après-midi pour deux enfants de 5 et 8 ans. 12 € de l'heure.",
      "Donne canapé trois places, gratuit. À venir chercher avant samedi.",
      "Professeur à la retraite donne des cours de mathématiques à domicile. Tous les niveaux, prix raisonnables.",
      "Perdu chat gris et blanc dans le quartier de la gare, le 3 mai. Récompense.",
      "Échange de langues : je vous apprends le portugais, vous m'apprenez le français. Rendez-vous dans un café."),
    cau: [ghep(HOI_GHEP, DOC, ["A. Karim vient d'emménager et n'a pas encore de meubles.", "B. Thomas cherche un appartement à louer.", "C. Julie veut aller au bureau sans prendre la voiture.", "D. Mme Lenoir a trouvé un chat devant sa porte, rue de la Gare.", "E. Sophie veut vendre sa voiture.", "F. Emma, étudiante, est libre le mercredi et adore les enfants.", "G. Ana, brésilienne, veut pratiquer son français.", "H. Les parents de Léo s'inquiètent de ses notes en maths."], [2, 5, 0, 7, 3, 6],
      "1: « idéal pour aller au travail » (Julie). 2: « cherche baby-sitter le mercredi après-midi » (Emma). 3: « donne canapé » (Karim, chưa có đồ đạc). 4: « cours de mathématiques » (bố mẹ Léo). 5: « perdu chat gris et blanc dans le quartier de la gare » (bà Lenoir tìm thấy một con mèo). 6: « je vous apprends le portugais » (Ana nói tiếng Bồ Đào Nha). Không ai cho thuê nhà hay mua xe hơi.")],
    tu: ["vendre (verbe) : bán", "donner (verbe) : cho, tặng", "à domicile (expression) : tại nhà", "une récompense (nom féminin) : tiền thưởng", "emménager (verbe) : dọn đến ở"],
    meo: ["Vends = tôi bán, cherche = tôi tìm, donne = tôi cho, perdu = tôi bị mất: động từ đầu tin rao cho biết người đăng cần gì.", "Người mất mèo và người nhặt được mèo khớp nhau qua địa điểm: rue de la Gare, quartier de la gare."] } },
  a2ce061sw03q: { moi: { tieuDe: "Lecture A2 : quel cours pour qui ?", de: DE_GHEP,
    van: tl("Anglais des affaires : préparez vos réunions et vos courriels professionnels. Le lundi à 19 h.",
      "Photo pour débutants : apprenez à utiliser votre appareil. Sorties en ville le samedi matin.",
      "Piano pour adultes : il n'est jamais trop tard pour commencer ! Cours individuels le soir.",
      "Danse pour les enfants de 4 à 6 ans : le mercredi matin, avec un parent.",
      "Informatique pour les seniors : envoyer un courriel, faire un appel vidéo. Le mardi après-midi.",
      "Cuisine rapide et saine : des repas prêts en 20 minutes pour les personnes pressées. Le jeudi soir."),
    cau: [ghep(HOI_GHEP, DOC, ["A. Lucas rentre tard du travail et mange souvent des plats tout prêts.", "B. Mme Bertin, 75 ans, veut parler à ses petits-enfants en vidéo.", "C. Inès a reçu un appareil photo et ne sait pas s'en servir.", "D. Marie veut apprendre le chinois.", "E. Antoine doit parler anglais avec des clients étrangers.", "F. Mme Faure cherche une activité à faire avec sa fille de 5 ans.", "G. Paul cherche un cours de tennis.", "H. M. Durand, 60 ans, a toujours rêvé de jouer d'un instrument."], [4, 2, 7, 5, 1, 0],
      "1: « anglais des affaires » (Antoine). 2: « photo pour débutants » (Inès). 3: « piano pour adultes » (ông Durand). 4: « pour les enfants de 4 à 6 ans », « avec un parent » (bà Faure). 5: « faire un appel vidéo » (bà Bertin). 6: « pour les personnes pressées » (Lucas). Không có lớp tiếng Trung hay quần vợt.")],
    tu: ["les affaires (nom féminin pluriel) : kinh doanh", "un appareil photo (nom masculin) : máy ảnh", "se servir de (verbe) : sử dụng", "pressé (adjectif) : vội vã", "un appel vidéo (nom masculin) : cuộc gọi video"],
    meo: ["Tìm từ đồng nghĩa giữa người và tài liệu: plats tout prêts và repas prêts en 20 minutes.", "Tuổi là manh mối nhanh: 5 ans, 60 ans, 75 ans."] } },
  a2ce071sw03r: { moi: { tieuDe: "Lecture A2 : les sorties du week-end", de: DE_GHEP,
    van: tl("Festival de jazz au parc : samedi, de 18 h à minuit. Entrée libre, apportez votre pique-nique.",
      "Musée des sciences : nouvelle exposition sur l'espace. Ateliers pour les enfants le dimanche.",
      "Marché aux fleurs : dimanche matin, place de la Mairie. Des conseils pour votre jardin.",
      "Course solidaire de 10 km : samedi à 9 h. Inscription 5 €, l'argent est donné à l'hôpital des enfants.",
      "Théâtre : une comédie en français facile, avec des sous-titres en anglais. Samedi à 20 h 30.",
      "Visite du vieux port en bateau : départ toutes les heures, dimanche de 10 h à 17 h."),
    cau: [ghep(HOI_GHEP, DOC, ["A. Les enfants de M. Blanc sont passionnés par les planètes.", "B. M. Morel cherche un restaurant pour un anniversaire.", "C. Yasmine court tous les matins et veut aider une association.", "D. Nicolas aime la musique, mais il n'a pas beaucoup d'argent.", "E. Sofia veut découvrir la ville depuis la mer.", "F. Lise veut voir un match de football.", "G. Mme Royer vient d'acheter une maison avec un jardin.", "H. Kenji apprend le français depuis six mois et adore le théâtre."], [3, 0, 6, 2, 7, 4],
      "1: « entrée libre » cho người ít tiền mê nhạc (Nicolas). 2: « exposition sur l'espace » (con ông Blanc). 3: « des conseils pour votre jardin » (bà Royer). 4: « course solidaire », « l'argent est donné à l'hôpital des enfants » (Yasmine). 5: « une comédie en français facile » (Kenji). 6: « visite du vieux port en bateau » (Sofia). Không có nhà hàng hay trận bóng.")],
    tu: ["l'entrée libre (expression) : vào cửa tự do", "l'espace (nom masculin) : vũ trụ", "solidaire (adjectif) : vì cộng đồng", "les sous-titres (nom masculin pluriel) : phụ đề", "un port (nom masculin) : bến cảng"],
    meo: ["« Entrée libre » nghĩa là miễn phí: khớp với người « n'a pas beaucoup d'argent ».", "Đọc lướt tài liệu tìm từ khoá chủ đề (jazz, espace, fleurs) trước, chi tiết giờ giấc sau."] } },
  a2ce081sx03s: { moi: { tieuDe: "Lecture A2 : quel document pour qui ?", de: DE_GHEP,
    van: tl("Agence Soleil : appartement de deux pièces à louer en centre-ville, 650 € par mois. Libre en septembre.",
      "Garage Dupont : réparation de vélos et de scooters, du lundi au samedi. Devis gratuit.",
      "Pharmacie de garde ce dimanche : Pharmacie du Centre, 12 rue Victor-Hugo, ouverte de 9 h à 20 h.",
      "Association Bon voisinage : nous cherchons des bénévoles pour apporter des repas aux personnes âgées, deux heures par semaine.",
      "Salle de sport Énergie : le premier mois est offert pour toute inscription avant le 30 septembre.",
      "Mairie : cours de français pour les étrangers, niveau A2, le soir. Inscription gratuite."),
    cau: [ghep(HOI_GHEP, DOC, ["A. Chloé, retraitée, veut se rendre utile.", "B. Le scooter de Nora ne démarre plus.", "C. Mme Petit cherche un vétérinaire pour son chien.", "D. Ahmed vient d'arriver en France et veut progresser en français.", "E. Hugo et Léa cherchent un logement en ville pour la rentrée.", "F. Tom veut reprendre le sport sans trop dépenser.", "G. Julien veut vendre son vieux vélo.", "H. M. Garcia a besoin d'un médicament dimanche."], [4, 1, 7, 0, 5, 3],
      "1: « appartement de deux pièces à louer en centre-ville », « libre en septembre » (Hugo và Léa). 2: « réparation de vélos et de scooters » (Nora; Julien muốn BÁN xe, không phải sửa). 3: « pharmacie de garde ce dimanche » (ông Garcia). 4: « nous cherchons des bénévoles » (Chloé). 5: « le premier mois est offert » (Tom). 6: « cours de français pour les étrangers » (Ahmed). Không có bác sĩ thú y.")],
    tu: ["un devis (nom masculin) : bảng báo giá", "une pharmacie de garde (nom féminin) : nhà thuốc trực", "se rendre utile (expression) : làm việc có ích", "offert (adjectif) : được tặng", "la rentrée (nom féminin) : đầu năm học (tháng 9)"],
    meo: ["Cẩn thận với người « gần đúng »: Julien có xe đạp, nhưng muốn bán chứ không cần sửa.", "« Libre en septembre » khớp với « pour la rentrée »: hai cách nói cùng một thời điểm."] } },
});
