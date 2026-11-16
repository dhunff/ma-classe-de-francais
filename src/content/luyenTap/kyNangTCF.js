/* Cây Luyện thi TCF (16/11/2026, chủ dự án: « chia Luyện thi thành DELF và TCF, bài tập sát đề thi thử »).
 *
 * Cùng khuôn với kyNang.js (kỹ năng lớn → kỹ năng nhỏ → bài) nên dùng chung luật tiến trình ở
 * shared/tienTrinhLuyenTap.js, nhưng TCF chỉ có MỘT « trình độ »: đề TCF là một bài thi duy nhất,
 * câu khó dần từ A1 tới C2. Nên Nghe và Đọc chia kỹ năng nhỏ theo dải độ khó của chính đề,
 * còn Viết và Nói chia theo đúng ba bài (tâche) của đề.
 *
 * Format theo trang FEI (bản cho đợt 01/09/2026), trùng FormatDe.jsx và examPaper.js:
 * CO 39 câu 35 phút, nghe một lần; CE 39 câu 60 phút; PE 3 bài 60 phút; PO 3 phần 12 phút.
 * Phần « Cấu trúc ngôn ngữ » (MS) của TCF tout public không có cây riêng: luyện ở mục Ngữ pháp.
 *
 * `duKien`, `mienPhi`: kế hoạch NHÁP, chưa có trong docs/ke-hoach-ky-nang-DELF-DALF.xlsx, không hiện
 * cho học sinh. `bai`: id bài đã có, hoặc gắn bài bằng meta.kyNang = mã kỹ năng (vd « TCF-CO-1 »). */
export const KY_NANG_TCF = {
  TCF: {
    CO: [
      {"ma": "TCF-CO-1", "vi": "Hội thoại, tin nhắn đời thường (A1, A2)", "fr": "Dialogues et messages du quotidien (A1, A2)", "en": "Everyday dialogues and messages (A1, A2)", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "TCF-CO-2", "vi": "Thông báo, trao đổi nơi công cộng và công việc (B1)", "fr": "Annonces et échanges en public ou au travail (B1)", "en": "Announcements and exchanges in public or at work (B1)", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "TCF-CO-3", "vi": "Phỏng vấn, phóng sự radio (B2)", "fr": "Interviews et reportages radio (B2)", "en": "Interviews and radio reports (B2)", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "TCF-CO-4", "vi": "Bài nói chuyên sâu, tranh luận (C1, C2)", "fr": "Discours spécialisés et débats (C1, C2)", "en": "Specialised talks and debates (C1, C2)", "duKien": 5, "mienPhi": 1, "bai": []},
      {"ma": "TCF-CO-5", "vi": "Nghe một lần, giữ nhịp cả 39 câu", "fr": "Une seule écoute, tenir le rythme sur 39 questions", "en": "One listening only, keeping pace over 39 questions", "duKien": 3, "mienPhi": 1, "bai": []},
    ],
    CE: [
      {"ma": "TCF-CE-1", "vi": "Biển báo, tin nhắn, thông báo ngắn (A1, A2)", "fr": "Panneaux, messages et annonces courtes (A1, A2)", "en": "Signs, messages and short notices (A1, A2)", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "TCF-CE-2", "vi": "Thư, email, bài viết thông tin (B1)", "fr": "Lettres, courriels et textes informatifs (B1)", "en": "Letters, emails and informative texts (B1)", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "TCF-CE-3", "vi": "Bài báo nêu quan điểm (B2)", "fr": "Articles d'opinion (B2)", "en": "Opinion articles (B2)", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "TCF-CE-4", "vi": "Văn bản lập luận, văn chương (C1, C2)", "fr": "Textes argumentatifs et littéraires (C1, C2)", "en": "Argumentative and literary texts (C1, C2)", "duKien": 5, "mienPhi": 1, "bai": []},
      {"ma": "TCF-CE-5", "vi": "Giữ nhịp 39 câu trong 60 phút", "fr": "Tenir 39 questions en 60 minutes", "en": "Keeping pace: 39 questions in 60 minutes", "duKien": 3, "mienPhi": 1, "bai": []},
    ],
    PE: [
      {"ma": "TCF-PE-1", "vi": "Bài 1: tin nhắn mô tả, kể, giải thích (60 đến 120 từ)", "fr": "Tâche 1 : message pour décrire, raconter, expliquer (60 à 120 mots)", "en": "Task 1: a message to describe, narrate, explain (60 to 120 words)", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "TCF-PE-2", "vi": "Bài 2: kể một trải nghiệm, có nhận xét (120 đến 150 từ)", "fr": "Tâche 2 : récit d'une expérience avec commentaires (120 à 150 mots)", "en": "Task 2: an experience with your comments (120 to 150 words)", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "TCF-PE-3", "vi": "Bài 3: so sánh hai quan điểm rồi nêu ý kiến (120 đến 180 từ)", "fr": "Tâche 3 : comparer deux points de vue puis donner son avis (120 à 180 mots)", "en": "Task 3: compare two views, then give your opinion (120 to 180 words)", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "TCF-PE-4", "vi": "Viết đủ ba bài trong 60 phút", "fr": "Rédiger les trois tâches en 60 minutes", "en": "Writing all three tasks in 60 minutes", "duKien": 3, "mienPhi": 1, "bai": []},
    ],
    PO: [
      {"ma": "TCF-PO-1", "vi": "Phần 1: trò chuyện về bản thân (2 phút)", "fr": "Tâche 1 : entretien dirigé (2 min)", "en": "Task 1: guided interview (2 min)", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "TCF-PO-2", "vi": "Phần 2: đóng vai, đặt câu hỏi lấy thông tin (5 phút 30)", "fr": "Tâche 2 : exercice en interaction (5 min 30)", "en": "Task 2: role-play, asking questions (5 min 30)", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "TCF-PO-3", "vi": "Phần 3: trình bày và bảo vệ quan điểm (4 phút 30)", "fr": "Tâche 3 : expression d'un point de vue (4 min 30)", "en": "Task 3: giving and defending an opinion (4 min 30)", "duKien": 6, "mienPhi": 2, "bai": []},
    ],
  },
};

/* Ghi chú « Mẹo làm bài » cho từng kỹ năng nhỏ TCF. Format là dữ kiện của đề; lỗi hay mắc và mẹo
 * là nhận định sư phạm, chưa đo trên bài làm thật (như ghiChuKyNang.js). */
export const GHI_CHU_TCF = {
  "TCF-CO-1": {"can": "Số, giờ, ngày, giá; câu hỏi quen: qui, où, quand, combien", "luu": "Mỗi đoạn chỉ nghe MỘT lần, không có lượt nghe thứ hai như DELF", "loi": "Đứng lại nghĩ một câu khó rồi lỡ luôn câu sau", "meo": "Đọc câu hỏi và bốn phương án trước khi đoạn ghi âm chạy"},
  "TCF-CO-2": {"can": "Từ nơi công cộng và công việc: réunion, horaire, retard, annulé", "luu": "Phương án sai thường lặp lại đúng từ nghe được", "loi": "Chọn phương án có từ trùng với audio mà không xét nghĩa cả câu", "meo": "Nghe ý chính: ai cần làm gì, vì sao"},
  "TCF-CO-3": {"can": "Từ nối ý: pourtant, en revanche, c'est pourquoi", "luu": "Câu hỏi B2 hỏi ý kiến và thái độ của người nói, không chỉ thông tin", "loi": "Nhầm ý của người phỏng vấn với ý của khách mời", "meo": "Để ý giọng điệu và các từ đánh giá: heureusement, malheureusement"},
  "TCF-CO-4": {"can": "Từ trừu tượng, cách nói rào đón: il semblerait que, force est de constater", "luu": "Phương án đều hợp lý, chỉ một cái đúng với lập luận của người nói", "loi": "Chọn theo hiểu biết của mình thay vì theo bài nói", "meo": "Loại dần: gạch phương án nói quá hoặc nói ngược"},
  "TCF-CO-5": {"can": "Thói quen đọc trước câu hỏi trong vài giây", "luu": "Câu khó dần: nửa đầu dễ, đừng để mất điểm ở đó", "loi": "Bỏ trống câu không chắc", "meo": "Không bị trừ điểm khi sai: luôn chọn một phương án rồi đi tiếp"},
  "TCF-CE-1": {"can": "Từ biển báo và tin nhắn: interdit, fermé, sortie, rendez-vous", "luu": "Văn bản ngắn, thường chỉ một chi tiết quyết định", "loi": "Đọc lướt quá nhanh và bỏ sót chữ ne... pas", "meo": "Tìm đúng từ khoá của câu hỏi trong văn bản"},
  "TCF-CE-2": {"can": "Cấu trúc thư và email: objet, je vous écris pour, cordialement", "luu": "Câu hỏi hay hỏi mục đích của người viết", "loi": "Trả lời theo một câu lẻ thay vì cả bức thư", "meo": "Đọc dòng « objet » và đoạn đầu để biết người viết muốn gì"},
  "TCF-CE-3": {"can": "Từ nêu quan điểm: selon, il est clair que, à mon sens", "luu": "Bài báo thường nêu hai phía rồi mới kết luận", "loi": "Lấy ý của phía phản bác làm ý của tác giả", "meo": "Tìm câu kết luận của tác giả, thường ở đoạn cuối"},
  "TCF-CE-4": {"can": "Từ vựng trừu tượng, hàm ý, giọng mỉa mai", "luu": "Văn bản dài, câu hỏi về ý ngầm", "loi": "Sa đà đọc kỹ một đoạn rồi thiếu giờ cho các câu cuối", "meo": "Đọc câu hỏi trước, chỉ đọc kỹ đoạn chứa câu trả lời"},
  "TCF-CE-5": {"can": "60 phút cho 39 câu, trung bình khoảng 1 phút rưỡi một câu", "luu": "Câu đầu ngắn và dễ, câu cuối dài và khó", "loi": "Chia đều thời gian cho mọi câu", "meo": "Làm nhanh nửa đầu để dành giờ cho các văn bản dài cuối đề"},
  "TCF-PE-1": {"can": "Cách mở và đóng tin nhắn: Salut, Bonjour, À bientôt, Bises", "luu": "Phải đủ ý được hỏi và nằm trong 60 đến 120 từ", "loi": "Viết dài quá giới hạn, mất thời gian cho bài 2 và 3", "meo": "Gạch các ý đề yêu cầu, mỗi ý một hai câu"},
  "TCF-PE-2": {"can": "Thì kể chuyện: passé composé, imparfait; từ nêu cảm nhận", "luu": "Ngoài kể còn phải nhận xét, nêu cảm nghĩ của mình", "loi": "Chỉ kể sự việc, quên phần nhận xét", "meo": "Dàn ý ba đoạn: bối cảnh, diễn biến, nhận xét"},
  "TCF-PE-3": {"can": "Từ so sánh và nối ý: alors que, tandis que, d'un côté... de l'autre", "luu": "Phần đầu tóm lại hai quan điểm, phần sau mới nêu ý kiến riêng", "loi": "Chép nguyên câu của tài liệu", "meo": "Diễn đạt lại bằng lời của mình, rồi chọn một phía và nêu lý do"},
  "TCF-PE-4": {"can": "Giới hạn số từ của từng bài", "luu": "Ba bài chung 60 phút, bài 3 khó nhất", "loi": "Dồn hết giờ cho bài 1", "meo": "Chia khoảng 15, 20, 25 phút cho bài 1, 2, 3 và để vài phút đọc lại"},
  "TCF-PO-1": {"can": "Giới thiệu bản thân: gia đình, công việc, sở thích, dự định", "luu": "Giám khảo hỏi tiếp từ câu trả lời của bạn", "loi": "Trả lời một từ rồi im lặng", "meo": "Mỗi câu trả lời thêm một lý do hoặc một ví dụ"},
  "TCF-PO-2": {"can": "Đặt câu hỏi: Est-ce que, Combien, À quelle heure, Est-il possible de", "luu": "Bạn là người hỏi để lấy thông tin, giám khảo đóng vai", "loi": "Chỉ hỏi hai ba câu rồi hết ý", "meo": "Trong 2 phút chuẩn bị, ghi sẵn câu hỏi theo giá, giờ, địa điểm, điều kiện"},
  "TCF-PO-3": {"can": "Nêu và bảo vệ ý kiến: je pense que, d'abord, par exemple, en conclusion", "luu": "Không có thời gian chuẩn bị, phải vào đề ngay", "loi": "Nói lan man không có ý chính", "meo": "Nêu ý kiến ngay câu đầu, đưa hai lý do kèm ví dụ, chốt lại"},
};
