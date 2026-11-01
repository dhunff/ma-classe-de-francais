/* Cây Luyện tập: trình độ → kỹ năng lớn → kỹ năng nhỏ → bài tập (01/11/2026).
 * SINH TỰ ĐỘNG từ kế hoạch docs/ke-hoach-ky-nang-DELF-DALF.xlsx, sửa tay được.
 * `duKien`: số bài theo kế hoạch, KHÔNG phải số bài đang có. `mienPhi`: phần miễn phí của kế hoạch.
 * `bai`: id bài ĐÃ CÓ trong kho luyện tập, đúng thứ tự làm. Bài mới thì thêm id vào đây,
 * hoặc đặt `kyNang` trong exercises.meta (tienTrinhLuyenTap.js đọc cả hai). */
export const KY_NANG = {
  A1: {
    CO: [
      {"ma": "A1-CO-1", "vi": "Nghe số, giờ, ngày, giá", "fr": "Nombres, heures, dates et prix", "en": "Numbers, times, dates and prices", "duKien": 9, "mienPhi": 2, "bai": ["nhapmuof28x003r"]},
      {"ma": "A1-CO-2", "vi": "Hiểu tin nhắn thoại: ai, việc gì, khi nào", "fr": "Messages vocaux : qui, quoi, quand", "en": "Voice messages: who, what, when", "duKien": 6, "mienPhi": 2, "bai": ["nhapmur34xv8013"]},
      {"ma": "A1-CO-3", "vi": "Hiểu thông báo nơi công cộng", "fr": "Annonces dans les lieux publics", "en": "Public announcements", "duKien": 6, "mienPhi": 2, "bai": ["nhapmur351gr014"]},
      {"ma": "A1-CO-4", "vi": "Nhận ra tình huống hội thoại", "fr": "Reconnaître la situation d'un dialogue", "en": "Recognising the situation in a dialogue", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "A1-CO-5", "vi": "Nhận ra đồ vật được nhắc tới", "fr": "Reconnaître les objets cités", "en": "Recognising the objects mentioned", "duKien": 5, "mienPhi": 2, "bai": []},
    ],
    CE: [
      {"ma": "A1-CE-1", "vi": "Tìm ai, ở đâu, khi nào trong tin nhắn", "fr": "Trouver qui, où, quand dans un message", "en": "Finding who, where, when in a message", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "A1-CE-2", "vi": "Đọc chỉ dẫn đường", "fr": "Lire des indications de chemin", "en": "Reading directions", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "A1-CE-3", "vi": "Đọc lịch, thời gian biểu", "fr": "Lire un agenda, un emploi du temps", "en": "Reading a schedule or timetable", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "A1-CE-4", "vi": "Đọc quảng cáo, tờ thông tin", "fr": "Lire une publicité, un dépliant", "en": "Reading an ad or leaflet", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "A1-CE-5", "vi": "Chép đúng thông tin khi trả lời ngắn", "fr": "Recopier correctement l'information", "en": "Copying information correctly", "duKien": 4, "mienPhi": 2, "bai": []},
    ],
    PE: [
      {"ma": "A1-PE-1", "vi": "Điền phiếu thông tin", "fr": "Remplir une fiche", "en": "Filling in a form", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "A1-PE-2", "vi": "Giới thiệu và mô tả", "fr": "Se présenter et décrire", "en": "Introducing yourself and describing", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "A1-PE-3", "vi": "Viết thư ngắn đúng yêu cầu", "fr": "Écrire un court message conforme à la consigne", "en": "Writing a short message that fits the task", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "A1-PE-4", "vi": "Viết câu đơn đúng", "fr": "Écrire des phrases simples correctes", "en": "Writing correct simple sentences", "duKien": 6, "mienPhi": 1, "bai": ["nhapmuof28wy03q", "msfndd1bo1rujx"]},
      {"ma": "A1-PE-5", "vi": "Viết đúng từ, nối câu", "fr": "Écrire les mots justes, relier les phrases", "en": "Spelling words, linking sentences", "duKien": 4, "mienPhi": 1, "bai": []},
    ],
    PO: [
      {"ma": "A1-PO-1", "vi": "Trả lời về bản thân", "fr": "Répondre sur soi", "en": "Answering about yourself", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "A1-PO-2", "vi": "Đặt câu hỏi từ thẻ gợi ý", "fr": "Poser des questions à partir de cartes", "en": "Asking questions from prompt cards", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "A1-PO-3", "vi": "Nhập vai mua bán", "fr": "Jouer une situation d'achat", "en": "Role-playing a purchase", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "A1-PO-4", "vi": "Dùng công thức lịch sự", "fr": "Utiliser les formules de politesse", "en": "Using polite phrases", "duKien": 4, "mienPhi": 1, "bai": []},
      {"ma": "A1-PO-5", "vi": "Nói rõ để người nghe hiểu", "fr": "Parler clairement pour être compris", "en": "Speaking clearly enough to be understood", "duKien": 5, "mienPhi": 1, "bai": []},
    ],
  },
  A2: {
    CO: [
      {"ma": "A2-CO-1", "vi": "Hiểu thông báo công cộng", "fr": "Comprendre les annonces publiques", "en": "Understanding public announcements", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "A2-CO-2", "vi": "Hiểu tin nhắn, bản tin ngắn", "fr": "Comprendre messages et brèves", "en": "Understanding messages and short news", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "A2-CO-3", "vi": "Hiểu radio, phỏng vấn ngắn", "fr": "Comprendre radio et courtes interviews", "en": "Understanding radio and short interviews", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "A2-CO-4", "vi": "Nhận diện tình huống", "fr": "Identifier la situation", "en": "Identifying the situation", "duKien": 5, "mienPhi": 2, "bai": ["lo24mvfc69q702q"]},
      {"ma": "A2-CO-5", "vi": "Giữ nhịp qua nhiều tài liệu", "fr": "Garder le rythme sur plusieurs documents", "en": "Keeping up across several documents", "duKien": 4, "mienPhi": 2, "bai": []},
    ],
    CE: [
      {"ma": "A2-CE-1", "vi": "Hiểu thư, email đời sống", "fr": "Comprendre lettres et courriels", "en": "Understanding letters and emails", "duKien": 6, "mienPhi": 3, "bai": ["nhapmuof28x103u", "lo25mvg3fe8101y", "lo25mvg3fe86027", "lo25mvg3fe85024"]},
      {"ma": "A2-CE-2", "vi": "Đọc quảng cáo, chỉ dẫn", "fr": "Lire publicités et instructions", "en": "Reading ads and instructions", "duKien": 7, "mienPhi": 3, "bai": ["lo25mvg3fe85023", "lo25mvg3fe8401z", "lo25mvg3fe84021", "lo25mvg3fe84020", "lo24mvfc52z002p"]},
      {"ma": "A2-CE-3", "vi": "Tra bảng, lịch trình", "fr": "Lire tableaux et horaires", "en": "Reading tables and timetables", "duKien": 5, "mienPhi": 2, "bai": ["lo25mvg3fe85026"]},
      {"ma": "A2-CE-4", "vi": "Hiểu bài báo ngắn", "fr": "Comprendre un article court", "en": "Understanding a short article", "duKien": 5, "mienPhi": 2, "bai": ["lo25mvg3fe84022", "lo25mvg3fe85025"]},
      {"ma": "A2-CE-5", "vi": "Nhận ra cách nói khác", "fr": "Reconnaître une reformulation", "en": "Recognising a rewording", "duKien": 5, "mienPhi": 2, "bai": []},
    ],
    PE: [
      {"ma": "A2-PE-1", "vi": "Kể một sự kiện", "fr": "Raconter un événement", "en": "Telling about an event", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "A2-PE-2", "vi": "Nói cảm nhận", "fr": "Donner ses impressions", "en": "Giving your impressions", "duKien": 4, "mienPhi": 1, "bai": []},
      {"ma": "A2-PE-3", "vi": "Viết thư mời, cảm ơn", "fr": "Écrire une invitation, un remerciement", "en": "Writing an invitation or thank-you", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "A2-PE-4", "vi": "Viết thư xin lỗi, yêu cầu", "fr": "Écrire des excuses, une demande", "en": "Writing an apology or request", "duKien": 4, "mienPhi": 1, "bai": []},
      {"ma": "A2-PE-5", "vi": "Chọn đúng thì", "fr": "Choisir le bon temps", "en": "Choosing the right tense", "duKien": 6, "mienPhi": 1, "bai": ["nhapmuof28x003s", "lo24mvfc52yx02m"]},
      {"ma": "A2-PE-6", "vi": "Nối ý trong đoạn", "fr": "Relier les idées dans un paragraphe", "en": "Linking ideas in a paragraph", "duKien": 4, "mienPhi": 1, "bai": []},
    ],
    PO: [
      {"ma": "A2-PO-1", "vi": "Trò chuyện về bản thân", "fr": "Parler de soi", "en": "Talking about yourself", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "A2-PO-2", "vi": "Độc thoại ngắn", "fr": "Faire un court monologue", "en": "Giving a short monologue", "duKien": 7, "mienPhi": 3, "bai": []},
      {"ma": "A2-PO-3", "vi": "Nhập vai tình huống", "fr": "Jouer une situation", "en": "Role-playing a situation", "duKien": 7, "mienPhi": 3, "bai": []},
    ],
  },
  B1: {
    CO: [
      {"ma": "B1-CO-1", "vi": "Bắt ý tổng quát sau lần nghe đầu", "fr": "Saisir l'idée générale dès la première écoute", "en": "Getting the gist on first listening", "duKien": 6, "mienPhi": 2, "bai": ["nhapmur36rma01a", "nhapmur36y4201b"]},
      {"ma": "B1-CO-2", "vi": "Bắt chi tiết đúng chủ thể", "fr": "Saisir les détails et qui les dit", "en": "Catching details and who says them", "duKien": 7, "mienPhi": 3, "bai": ["nhapmur3635v018", "nhapmur5gsn4026"]},
      {"ma": "B1-CO-3", "vi": "Nhận thái độ người nói", "fr": "Reconnaître l'attitude de la personne", "en": "Recognising the speaker's attitude", "duKien": 6, "mienPhi": 2, "bai": ["nhapmur36fu4019"]},
      {"ma": "B1-CO-4", "vi": "Hiểu radio về nghề nghiệp", "fr": "Comprendre la radio sur le travail", "en": "Understanding radio about work", "duKien": 6, "mienPhi": 2, "bai": ["nhapmur5gjk6024"]},
      {"ma": "B1-CO-5", "vi": "Hiểu radio chủ đề thông thường", "fr": "Comprendre la radio sur des sujets courants", "en": "Understanding radio on everyday topics", "duKien": 6, "mienPhi": 2, "bai": ["nhapmur5gog2025", "mrhfrmeh70pewi_tv", "mrenas8c46ri1l_tv"]},
      {"ma": "B1-CO-6", "vi": "Ghi chú khi nghe", "fr": "Prendre des notes en écoutant", "en": "Taking notes while listening", "duKien": 5, "mienPhi": 1, "bai": []},
    ],
    CE: [
      {"ma": "B1-CE-1", "vi": "Tìm thông tin để giải quyết nhiệm vụ", "fr": "Trouver l'information pour une tâche", "en": "Finding information for a task", "duKien": 7, "mienPhi": 3, "bai": ["mrig1rhvcezbf2_tv", "mrihd2g3msbujz_tv", "nhapmuof28x103x"]},
      {"ma": "B1-CE-2", "vi": "Nắm ý chính bài báo", "fr": "Saisir l'idée principale d'un article", "en": "Getting the main idea of an article", "duKien": 6, "mienPhi": 2, "bai": ["lo24mvfc69q702r"]},
      {"ma": "B1-CE-3", "vi": "Phân biệt Đúng/Sai theo bài", "fr": "Distinguer vrai et faux selon le texte", "en": "Telling true from false in the text", "duKien": 5, "mienPhi": 2, "bai": ["mrhiqtbizbg5j1"]},
      {"ma": "B1-CE-4", "vi": "Suy luận, đoán từ theo ngữ cảnh", "fr": "Déduire, deviner un mot par le contexte", "en": "Inferring and guessing words from context", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "B1-CE-5", "vi": "Theo dõi lập luận", "fr": "Suivre l'argumentation", "en": "Following the argument", "duKien": 5, "mienPhi": 1, "bai": []},
    ],
    PE: [
      {"ma": "B1-PE-1", "vi": "Phân tích đề, lập dàn ý", "fr": "Analyser le sujet, faire un plan", "en": "Analysing the task, making a plan", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "B1-PE-2", "vi": "Trình bày sự việc", "fr": "Présenter des faits", "en": "Presenting facts", "duKien": 5, "mienPhi": 2, "bai": ["mrhvszpr7oxwre", "mrhvvnwbtdj44w"]},
      {"ma": "B1-PE-3", "vi": "Nêu ý kiến có lý do, ví dụ", "fr": "Donner son avis avec raisons et exemples", "en": "Giving an opinion with reasons and examples", "duKien": 6, "mienPhi": 2, "bai": ["mrhvmed09xt927_tv"]},
      {"ma": "B1-PE-4", "vi": "Liên kết các đoạn", "fr": "Relier les paragraphes", "en": "Linking paragraphs", "duKien": 5, "mienPhi": 2, "bai": ["nhapmuof28x103w"]},
      {"ma": "B1-PE-5", "vi": "Đa dạng câu và thì", "fr": "Varier les phrases et les temps", "en": "Varying sentences and tenses", "duKien": 7, "mienPhi": 1, "bai": ["nhapmuhwc8h701q", "lo24mvfc69q702t", "nhapmuhwc8h501o"]},
      {"ma": "B1-PE-6", "vi": "Viết đúng thể loại", "fr": "Respecter le genre du texte", "en": "Following the text type", "duKien": 6, "mienPhi": 1, "bai": ["lo24mvfc69q702s"]},
    ],
    PO: [
      {"ma": "B1-PO-1", "vi": "Trò chuyện có hướng dẫn", "fr": "Entretien dirigé", "en": "Guided conversation", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "B1-PO-2", "vi": "Xử lý tình huống", "fr": "Gérer une situation", "en": "Handling a situation", "duKien": 7, "mienPhi": 3, "bai": []},
      {"ma": "B1-PO-3", "vi": "Rút ý từ tài liệu ngắn", "fr": "Dégager les idées d'un court document", "en": "Drawing ideas from a short document", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "B1-PO-4", "vi": "Trình bày quan điểm", "fr": "Exprimer son point de vue", "en": "Expressing your point of view", "duKien": 7, "mienPhi": 3, "bai": []},
    ],
  },
  B2: {
    CO: [
      {"ma": "B2-CO-1", "vi": "Ghi chú tài liệu dài", "fr": "Prendre des notes sur un long document", "en": "Taking notes on a long document", "duKien": 11, "mienPhi": 3, "bai": ["nhapmur5hnlp029", "mrh3ctmp0dhugs"]},
      {"ma": "B2-CO-2", "vi": "Hiểu sau một lần nghe", "fr": "Comprendre en une seule écoute", "en": "Understanding on one listening", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "B2-CO-3", "vi": "Nhận hàm ý, thái độ", "fr": "Saisir sous-entendus et attitudes", "en": "Catching implications and attitudes", "duKien": 8, "mienPhi": 2, "bai": []},
      {"ma": "B2-CO-4", "vi": "Theo dõi lập luận", "fr": "Suivre l'argumentation", "en": "Following the argument", "duKien": 8, "mienPhi": 2, "bai": ["lo24mvfc6wnh02x"]},
      {"ma": "B2-CO-5", "vi": "Hiểu từ theo ngữ cảnh", "fr": "Comprendre les mots en contexte", "en": "Understanding words in context", "duKien": 5, "mienPhi": 1, "bai": []},
    ],
    CE: [
      {"ma": "B2-CE-1", "vi": "Đọc cấu trúc bài nghị luận", "fr": "Lire la structure d'un texte argumenté", "en": "Reading the structure of an argument", "duKien": 11, "mienPhi": 3, "bai": ["jf5jqzd_tv", "lo24mvfc69q702u"]},
      {"ma": "B2-CE-2", "vi": "Suy luận ý ngầm", "fr": "Déduire les idées implicites", "en": "Inferring implicit ideas", "duKien": 8, "mienPhi": 2, "bai": []},
      {"ma": "B2-CE-3", "vi": "Ghép ý kiến trên diễn đàn", "fr": "Associer les avis d'un forum", "en": "Matching forum opinions", "duKien": 6, "mienPhi": 3, "bai": []},
      {"ma": "B2-CE-4", "vi": "Phân biệt sắc thái", "fr": "Distinguer les nuances", "en": "Telling nuances apart", "duKien": 5, "mienPhi": 1, "bai": []},
      {"ma": "B2-CE-5", "vi": "Phân bổ 60 phút", "fr": "Répartir les 60 minutes", "en": "Managing the 60 minutes", "duKien": 4, "mienPhi": 1, "bai": []},
    ],
    PE: [
      {"ma": "B2-PE-1", "vi": "Phân tích đề, chọn thể loại", "fr": "Analyser le sujet, choisir le genre", "en": "Analysing the task, choosing the text type", "duKien": 6, "mienPhi": 2, "bai": ["mrhtbal42uk3no"]},
      {"ma": "B2-PE-2", "vi": "Chọn đúng giọng văn", "fr": "Choisir le bon registre", "en": "Choosing the right register", "duKien": 6, "mienPhi": 2, "bai": ["mrkm0jxn35lxlm"]},
      {"ma": "B2-PE-3", "vi": "Lập luận có ví dụ", "fr": "Argumenter avec des exemples", "en": "Arguing with examples", "duKien": 8, "mienPhi": 3, "bai": ["lo24mvfc69q802v"]},
      {"ma": "B2-PE-4", "vi": "Liên kết văn bản", "fr": "Assurer la cohésion du texte", "en": "Making the text cohesive", "duKien": 6, "mienPhi": 2, "bai": ["nhapmuof28x103z", "nhapmuhwc8h701r"]},
      {"ma": "B2-PE-5", "vi": "Dùng cấu trúc phức", "fr": "Utiliser des structures complexes", "en": "Using complex structures", "duKien": 8, "mienPhi": 1, "bai": ["nhapmuo5ehj4021", "nhapmuo5ehj4022", "nhapmuhwc8h701p", "nhapmuof28x103y"]},
    ],
    PO: [
      {"ma": "B2-PO-1", "vi": "Rút vấn đề từ tài liệu gợi ý", "fr": "Dégager le problème du document", "en": "Finding the issue in the document", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "B2-PO-2", "vi": "Lập dàn ý trong 30 phút", "fr": "Faire un plan en 30 minutes", "en": "Making a plan in 30 minutes", "duKien": 5, "mienPhi": 2, "bai": []},
      {"ma": "B2-PO-3", "vi": "Trình bày có lập luận", "fr": "Présenter une argumentation", "en": "Presenting an argument", "duKien": 8, "mienPhi": 3, "bai": []},
      {"ma": "B2-PO-4", "vi": "Tranh luận", "fr": "Débattre", "en": "Debating", "duKien": 8, "mienPhi": 3, "bai": []},
    ],
  },
  C1: {
    CO: [
      {"ma": "C1-CO-1", "vi": "Ghi chú tài liệu dài", "fr": "Prendre des notes sur un long document", "en": "Taking notes on a long document", "duKien": 11, "mienPhi": 3, "bai": []},
      {"ma": "C1-CO-2", "vi": "Hiểu tài liệu ngắn sau một lần nghe", "fr": "Comprendre des documents brefs en une écoute", "en": "Understanding short documents on one listening", "duKien": 7, "mienPhi": 2, "bai": []},
      {"ma": "C1-CO-3", "vi": "Nhận lập trường và giọng điệu", "fr": "Reconnaître position et ton", "en": "Recognising stance and tone", "duKien": 9, "mienPhi": 2, "bai": []},
      {"ma": "C1-CO-4", "vi": "Hiểu lập luận chuyên sâu", "fr": "Comprendre une argumentation spécialisée", "en": "Understanding specialised arguments", "duKien": 9, "mienPhi": 2, "bai": []},
      {"ma": "C1-CO-5", "vi": "Trả lời bằng lời của mình", "fr": "Répondre avec ses propres mots", "en": "Answering in your own words", "duKien": 6, "mienPhi": 1, "bai": []},
    ],
    CE: [
      {"ma": "C1-CE-1", "vi": "Đọc văn bản dài có chiều sâu", "fr": "Lire un long texte en profondeur", "en": "Reading a long text in depth", "duKien": 12, "mienPhi": 3, "bai": ["lo24mvfc6wnh02y"]},
      {"ma": "C1-CE-2", "vi": "Nhận dụng ý và ẩn ý", "fr": "Saisir intentions et sous-entendus", "en": "Catching intentions and implications", "duKien": 10, "mienPhi": 3, "bai": []},
      {"ma": "C1-CE-3", "vi": "Diễn đạt lại bằng lời của mình", "fr": "Reformuler avec ses propres mots", "en": "Rewording in your own words", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "C1-CE-4", "vi": "Từ học thuật trong ngữ cảnh", "fr": "Comprendre le lexique savant en contexte", "en": "Understanding academic words in context", "duKien": 7, "mienPhi": 1, "bai": ["nhapmuo5ehj4024", "nhapmuof28x2043"]},
      {"ma": "C1-CE-5", "vi": "Phân bổ 50 phút", "fr": "Répartir les 50 minutes", "en": "Managing the 50 minutes", "duKien": 4, "mienPhi": 1, "bai": []},
    ],
    PE: [
      {"ma": "C1-PE-1", "vi": "Đọc nhiều tài liệu, tìm ý chung", "fr": "Lire plusieurs documents, trouver l'axe commun", "en": "Reading several documents, finding the common thread", "duKien": 7, "mienPhi": 2, "bai": []},
      {"ma": "C1-PE-2", "vi": "Viết tổng hợp đúng luật", "fr": "Écrire une synthèse dans les règles", "en": "Writing a synthesis by the rules", "duKien": 9, "mienPhi": 3, "bai": []},
      {"ma": "C1-PE-3", "vi": "Giữ đúng độ dài", "fr": "Respecter la longueur", "en": "Keeping to the length", "duKien": 5, "mienPhi": 1, "bai": []},
      {"ma": "C1-PE-4", "vi": "Lập dàn ý bài luận", "fr": "Faire le plan de l'essai", "en": "Planning the essay", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "C1-PE-5", "vi": "Lập luận có sắc thái", "fr": "Argumenter avec nuance", "en": "Arguing with nuance", "duKien": 11, "mienPhi": 3, "bai": []},
      {"ma": "C1-PE-6", "vi": "Giọng văn và câu phức", "fr": "Registre et phrases complexes", "en": "Register and complex sentences", "duKien": 8, "mienPhi": 1, "bai": ["nhapmuof28x2042", "lo24mvfc6wnh02z", "nhapmuo5ehj4023"]},
    ],
    PO: [
      {"ma": "C1-PO-1", "vi": "Rút vấn đề từ nhiều tài liệu", "fr": "Dégager le problème de plusieurs documents", "en": "Finding the issue across several documents", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "C1-PO-2", "vi": "Lập dàn ý trong 1 giờ", "fr": "Faire un plan en 1 heure", "en": "Making a plan in 1 hour", "duKien": 6, "mienPhi": 2, "bai": []},
      {"ma": "C1-PO-3", "vi": "Trình bày bài nói dài", "fr": "Faire un long exposé", "en": "Giving a long presentation", "duKien": 8, "mienPhi": 3, "bai": []},
      {"ma": "C1-PO-4", "vi": "Trao đổi với hội đồng", "fr": "Échanger avec le jury", "en": "Discussing with the jury", "duKien": 8, "mienPhi": 3, "bai": []},
    ],
  },
  C2: {
    CO: [
      {"ma": "C2-CO-1", "vi": "Ghi chú tài liệu rất dài", "fr": "Prendre des notes sur un très long document", "en": "Taking notes on a very long document", "duKien": 15, "mienPhi": 3, "bai": []},
      {"ma": "C2-CO-2", "vi": "Hiểu nhiều giọng, tốc độ tự nhiên", "fr": "Comprendre des voix variées à vitesse naturelle", "en": "Understanding varied voices at natural speed", "duKien": 13, "mienPhi": 2, "bai": []},
      {"ma": "C2-CO-3", "vi": "Nắm lập luận và sắc thái", "fr": "Saisir argumentation et nuances", "en": "Catching argument and nuance", "duKien": 13, "mienPhi": 2, "bai": []},
      {"ma": "C2-CO-4", "vi": "Phân biệt ý chính và ý phụ", "fr": "Distinguer l'essentiel de l'accessoire", "en": "Separating main from secondary ideas", "duKien": 9, "mienPhi": 1, "bai": []},
    ],
    CE: [
      {"ma": "C2-CE-1", "vi": "Đọc nhanh hồ sơ dài", "fr": "Lire vite un long dossier", "en": "Reading a long file quickly", "duKien": 13, "mienPhi": 3, "bai": []},
      {"ma": "C2-CE-2", "vi": "So sánh quan điểm các nguồn", "fr": "Comparer les points de vue des sources", "en": "Comparing the sources' views", "duKien": 13, "mienPhi": 3, "bai": []},
      {"ma": "C2-CE-3", "vi": "Chọn thông tin theo nhiệm vụ", "fr": "Choisir l'information selon la tâche", "en": "Selecting information for the task", "duKien": 9, "mienPhi": 2, "bai": []},
    ],
    PE: [
      {"ma": "C2-PE-1", "vi": "Xác định thể loại và vai người viết", "fr": "Identifier le genre et le rôle", "en": "Identifying the genre and role", "duKien": 14, "mienPhi": 3, "bai": []},
      {"ma": "C2-PE-2", "vi": "Viết bài lớn dựa trên hồ sơ", "fr": "Écrire un long texte à partir d'un dossier", "en": "Writing a long text from a file", "duKien": 13, "mienPhi": 3, "bai": []},
      {"ma": "C2-PE-3", "vi": "Lập luận và văn phong cao", "fr": "Argumenter avec un style élevé", "en": "Arguing in a high style", "duKien": 13, "mienPhi": 2, "bai": []},
    ],
    PO: [
      {"ma": "C2-PO-1", "vi": "Trình bày lại tài liệu đã nghe", "fr": "Présenter le document écouté", "en": "Presenting the audio document", "duKien": 13, "mienPhi": 3, "bai": []},
      {"ma": "C2-PO-2", "vi": "Phát triển quan điểm cá nhân", "fr": "Développer son point de vue", "en": "Developing your point of view", "duKien": 12, "mienPhi": 3, "bai": []},
      {"ma": "C2-PO-3", "vi": "Tranh luận với hội đồng", "fr": "Débattre avec le jury", "en": "Debating with the jury", "duKien": 12, "mienPhi": 2, "bai": []},
    ],
  },
};
