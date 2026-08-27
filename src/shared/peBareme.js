/* Mốc cho điểm của từng tiêu chí Production écrite.
 *
 * ══ VÌ SAO TÁCH KHỎI delfGrille.js ══
 *
 * `delfGrille.js` giữ THANG ĐIỂM — mỗi tiêu chí bao nhiêu điểm, cộng lại đúng
 * 25. Đó là con số chính thức, và `check:grille` (59 ca) canh nó.
 *
 * File này giữ thứ khác hẳn: MÔ TẢ từng nấc. Nó không đổi tổng, không đổi max,
 * không thêm hay bớt tiêu chí nào. Trộn vào cùng file thì mỗi lần sửa chữ nghĩa
 * lại phải chạy qua bộ kiểm thang điểm, và một bộ kiểm hay báo động vì lý do
 * không liên quan là bộ kiểm người ta bắt đầu bỏ qua.
 *
 * ══ A1 / A2 CŨNG CÓ MỐC, VÀ VÌ SAO ĐỔI Ý ══
 *
 * Bản đầu cố ý bỏ trống A1/A2: thang hai trình độ ấy trong `delfGrille.js` tự
 * nhận là PHỎNG THEO, và viết mốc chi tiết cho một thang phỏng theo là cho nó
 * một vẻ chính xác mà nó không có.
 *
 * Lý do đó không còn đứng vững. Màn tự chấm nay hiện thẳng dòng « Thang A1 ở
 * đây là bản phỏng theo, quy về 25 điểm » (cờ `adapted` → `official: false`),
 * nên người học không thể nhầm nó với thang chính thức. Khi lời cảnh báo đã ở
 * đúng chỗ, giữ mốc trống chỉ còn là bỏ mặc người học A1 tự đoán "3/5 nghĩa là
 * gì" — mà đó chính là nhóm cần được dắt tay nhất.
 *
 * Chữ trong mốc A1/A2 cố ý viết ĐƠN GIẢN HƠN B1/B2: không nhắc tên thuật ngữ
 * (registre, connecteur, subjonctif) mà mô tả thẳng việc phải nhìn vào bài.
 *
 * Tiêu chí vẫn có thể không có mốc — thang do giáo viên tự soạn chẳng hạn — và
 * khi đó giao diện lùi về `aide`. Lối lùi ấy giữ nguyên.
 *
 * ══ ĐỌC THẾ NÀO ══
 *
 * Mảng xếp GIẢM DẦN theo điểm. Nấc đang áp dụng là mốc đầu tiên mà điểm còn
 * với tới — `bareme.find(([at]) => v >= at)`. Xếp sai thứ tự thì mọi bài chấm
 * đều rơi vào nấc thấp nhất mà không ai thấy gì bất thường.
 *
 * Mốc cao nhất PHẢI bằng `max` của tiêu chí, và mốc thấp nhất phải là 0.
 * `check:bareme` canh cả hai.
 */

export const BAREME = {
  /* A1 — 40 từ: điền phiếu và viết vài câu đơn giản về mình.
     Mốc bám vào việc CỤ THỂ người học phải nhìn thấy trong bài, không bám vào
     tên khái niệm. Người ở trình độ này chưa biết "connecteur" là gì. */
  A1: {
    consigne: [
      [3, "Làm đúng việc đề yêu cầu và viết đủ số từ"],
      [2, "Đúng việc nhưng bài hơi ngắn"],
      [1, "Chỉ làm được một phần đề bài"],
      [0, "Không làm đúng việc đề yêu cầu"],
    ],
    fiche: [
      [3, "Điền đúng mọi ô: họ tên, tuổi, quốc tịch, địa chỉ"],
      [2, "Điền đúng phần lớn, nhầm một hai ô"],
      [1, "Điền được vài ô, nhầm nhiều chỗ"],
      [0, "Không điền được, hoặc điền sai hết"],
    ],
    informer: [
      [6, "Nhiều câu đơn giản về mình, sở thích và việc mình làm"],
      [4, "Viết được vài câu, nội dung còn mỏng"],
      [2, "Chỉ được một hai câu rời rạc"],
      [0, "Không viết được câu nào về bản thân"],
    ],
    lexique: [
      [5, "Dùng đúng vốn từ cơ bản, viết đúng chính tả từ quen"],
      [3, "Đủ từ để hiểu, nhưng sai chính tả nhiều"],
      [1, "Rất ít từ, người đọc phải đoán"],
      [0, "Không đủ từ để diễn đạt"],
    ],
    morpho: [
      [5, "Các câu đã học dùng đúng, lỗi không cản việc hiểu"],
      [3, "Đúng ở câu quen, sai khi ghép câu dài hơn"],
      [1, "Sai nhiều, người đọc phải tự ghép nghĩa"],
      [0, "Không kiểm soát được cấu trúc câu"],
    ],
    coherence: [
      [3, "Nối câu bằng et, alors, mais một cách hợp lý"],
      [2, "Có nối câu nhưng lặp đi lặp lại một từ"],
      [1, "Các câu đứng rời, gần như không nối"],
      [0, "Không có liên kết nào giữa các câu"],
    ],
  },

  /* A2 — 60 từ: kể một việc đã làm và nói cảm nhận. */
  A2: {
    consigne: [
      [2, "Đúng tình huống, đúng loại tin nhắn, đủ độ dài"],
      [1, "Đúng loại nhưng thiếu độ dài hoặc lệch tình huống"],
      [0.5, "Chỉ lờ mờ nhận ra đây là loại tin nhắn gì"],
      [0, "Sai loại, hoặc quá ngắn để đánh giá"],
    ],
    raconter: [
      [4, "Kể rõ việc đã làm, có thời gian và chi tiết"],
      [3, "Kể được nhưng thiếu chi tiết cụ thể"],
      [2, "Chỉ nêu sự việc, chưa kể được diễn biến"],
      [1, "Rời rạc, người đọc phải tự ghép"],
      [0, "Không kể được việc gì"],
    ],
    impressions: [
      [3, "Nói rõ mình thấy thế nào và vì sao"],
      [2, "Có nói cảm nhận nhưng chưa giải thích"],
      [1, "Chỉ nói thích hoặc không thích"],
      [0, "Không nói cảm nhận nào"],
    ],
    coherence: [
      [2, "Nối câu bằng et, mais, parce que một cách hợp lý"],
      [1, "Có nối nhưng lặp lại một hai từ"],
      [0.5, "Các câu gần như đứng rời nhau"],
      [0, "Không có liên kết nào giữa các câu"],
    ],
    etendue_lex: [
      [2, "Đủ từ cho các tình huống đời thường"],
      [1, "Đủ dùng nhưng lặp thấy rõ"],
      [0.5, "Rất hẹp, phải nói vòng mới diễn đạt được"],
      [0, "Không đủ từ để diễn đạt"],
    ],
    maitrise_lex: [
      [2, "Dùng từ đúng nghĩa, người đọc hiểu đúng ý"],
      [1, "Còn nhầm từ nhưng vẫn hiểu được"],
      [0.5, "Nhầm từ khiến người đọc hiểu sai"],
      [0, "Dùng từ sai liên tục"],
    ],
    orthographe: [
      [2, "Viết đúng chính tả các từ quen và cụm ngắn"],
      [1, "Sai rải rác nhưng đọc vẫn trôi"],
      [0.5, "Sai dày, phải đoán mới đọc được"],
      [0, "Lỗi chính tả khiến bài khó đọc"],
    ],
    phrases: [
      [2, "Viết câu đơn, thỉnh thoảng nối được hai câu"],
      [1, "Chỉ toàn câu đơn rất ngắn"],
      [0.5, "Câu chưa thành câu hoàn chỉnh"],
      [0, "Không kiểm soát được câu"],
    ],
    temps: [
      [3, "Dùng présent và passé composé nhìn chung đúng"],
      [2, "Đúng présent, còn lúng túng với quá khứ"],
      [1, "Gần như chỉ dùng présent"],
      [0, "Không kiểm soát được thì"],
    ],
    morpho: [
      [3, "Hợp giống–số cơ bản đúng, mạo từ dùng đúng"],
      [2, "Đúng ở cấu trúc quen, sai khi phức tạp hơn"],
      [1, "Sai hợp giống–số thường xuyên"],
      [0, "Không kiểm soát được"],
    ],
  },

  B1: {
    consigne: [
      [2, "Đúng loại văn bản, đúng người nhận, đủ độ dài"],
      [1, "Đúng loại nhưng thiếu độ dài rõ rệt, hoặc quên hình thức bắt buộc"],
      [0.5, "Chỉ lờ mờ nhận ra đây là loại văn bản gì"],
      [0, "Sai loại văn bản, hoặc quá ngắn để đánh giá"],
    ],
    faits: [
      [4, "Sự việc rõ ràng, có chi tiết, người đọc theo được từ đầu"],
      [3, "Hiểu được nhưng vài chỗ phải đoán, chi tiết thưa"],
      [2, "Chỉ hiểu đại ý, thiếu thông tin cụ thể"],
      [1, "Rời rạc, người đọc phải tự ghép"],
      [0, "Không trình bày được sự việc nào"],
    ],
    pensee: [
      [4, "Quan điểm rõ, có lý do, có ví dụ, có cả cảm nhận cá nhân"],
      [3, "Có quan điểm và lý do, nhưng thiếu ví dụ hoặc lý do hơi mỏng"],
      [2, "Có nói ý kiến nhưng chưa giải thích"],
      [1, "Chỉ thấy thích hoặc không thích, không có gì thêm"],
      [0, "Không thể hiện quan điểm nào"],
    ],
    coherence: [
      [3, "Bố cục rõ, đoạn mạch lạc, connecteurs đa dạng và dùng đúng"],
      [2, "Có bố cục, connecteurs đúng nhưng lặp lại vài loại quen thuộc"],
      [1, "Ý nối rời rạc, chủ yếu et/mais, chia đoạn tuỳ tiện"],
      [0.5, "Không thấy bố cục"],
      [0, "Các câu không liên hệ gì với nhau"],
    ],
    etendue_lex: [
      [2, "Vốn từ đủ rộng, biết biến đổi để tránh lặp"],
      [1, "Đủ dùng nhưng lặp thấy rõ"],
      [0.5, "Rất hẹp, phải nói vòng"],
      [0, "Không đủ để diễn đạt chủ đề"],
    ],
    maitrise_lex: [
      [2, "Hầu như không lỗi, không lỗi nào gây khó hiểu"],
      [1, "Có nhầm lẫn nhưng vẫn hiểu được"],
      [0.5, "Lỗi từ vựng gây hiểu sai"],
      [0, "Dùng từ sai liên tục"],
    ],
    orthographe: [
      [1, "Chính tả và dấu câu tương đối chuẩn"],
      [0.5, "Lỗi rải rác nhưng đọc vẫn trôi"],
      [0, "Lỗi dày tới mức cản việc đọc"],
    ],
    phrases: [
      [2, "Trộn được câu đơn và phức, nhiều kiểu cấu trúc"],
      [1, "Có câu phức nhưng lặp một kiểu"],
      [0.5, "Gần như toàn câu đơn"],
      [0, "Cấu trúc câu không kiểm soát được"],
    ],
    temps: [
      [2, "Kiểm soát tốt, lỗi không hệ thống"],
      [1, "Đúng ở thì cơ bản, sai khi cấu trúc phức tạp"],
      [0.5, "Dùng gần như chỉ présent"],
      [0, "Không kiểm soát được thì"],
    ],
    morpho: [
      [3, "Kiểm soát tốt, lỗi lẻ tẻ"],
      [2, "Đúng ở cấu trúc quen, sai khi phức tạp"],
      [1, "Lỗi hợp giống–số thường xuyên"],
      [0.5, "Lỗi dày tới mức cản việc đọc"],
      [0, "Không kiểm soát được"],
    ],
  },

  B2: {
    consigne: [
      [2, "Đúng loại văn bản, đúng người nhận, đủ độ dài"],
      [1, "Đúng loại nhưng thiếu độ dài rõ rệt, hoặc quên hình thức bắt buộc"],
      [0.5, "Chỉ lờ mờ nhận ra đây là loại văn bản gì"],
      [0, "Sai loại văn bản, hoặc quá ngắn để đánh giá"],
    ],
    sociolang: [
      [2, "Registre đúng và giữ đều cả bài; công thức mở và kết phù hợp"],
      [1, "Đúng về cơ bản nhưng lệch vài chỗ"],
      [0.5, "Lẫn lộn tu/vous, hoặc registre trôi giữa bài"],
      [0, "Sai hẳn registre so với người nhận"],
    ],
    faits: [
      [3, "Rõ ràng và chính xác, người đọc theo được"],
      [2, "Rõ nhưng thiếu độ chính xác, chi tiết thưa"],
      [1, "Mơ hồ, người đọc phải đoán"],
      [0, "Không trình bày được sự việc nào"],
    ],
    argumenter: [
      [4, "2–3 luận điểm phát triển đầy đủ, có ví dụ, có phản biện, có kết luận"],
      [3, "Lập luận rõ và có ví dụ, nhưng không đụng tới ý kiến ngược"],
      [2, "Có luận điểm nhưng phát triển nông, ví dụ thiếu"],
      [1, "Chỉ liệt kê ý, không phát triển"],
      [0, "Không có lập luận, chỉ mô tả"],
    ],
    coherence: [
      [3, "Bố cục rõ, đoạn mạch lạc, connecteurs đa dạng và dùng đúng"],
      [2, "Có bố cục, connecteurs đúng nhưng lặp lại vài loại quen thuộc"],
      [1, "Ý nối rời rạc, chủ yếu et/mais, chia đoạn tuỳ tiện"],
      [0.5, "Không thấy bố cục"],
      [0, "Các câu không liên hệ gì với nhau"],
    ],
    etendue_lex: [
      [2, "Vốn từ đủ rộng, biết biến đổi để tránh lặp"],
      [1, "Đủ dùng nhưng lặp thấy rõ"],
      [0.5, "Rất hẹp, phải nói vòng"],
      [0, "Không đủ để diễn đạt chủ đề"],
    ],
    maitrise_lex: [
      [2, "Hầu như không lỗi, không lỗi nào gây khó hiểu"],
      [1, "Có nhầm lẫn nhưng vẫn hiểu được"],
      [0.5, "Lỗi từ vựng gây hiểu sai"],
      [0, "Dùng từ sai liên tục"],
    ],
    orthographe: [
      [1, "Chính tả và dấu câu tương đối chuẩn"],
      [0.5, "Lỗi rải rác nhưng đọc vẫn trôi"],
      [0, "Lỗi dày tới mức cản việc đọc"],
    ],
    phrases: [
      [2, "Trộn được câu đơn và phức, nhiều kiểu cấu trúc"],
      [1, "Có câu phức nhưng lặp một kiểu"],
      [0.5, "Gần như toàn câu đơn"],
      [0, "Cấu trúc câu không kiểm soát được"],
    ],
    temps: [
      [2, "Kiểm soát tốt, lỗi không hệ thống"],
      [1, "Đúng ở thì cơ bản, sai khi cấu trúc phức tạp"],
      [0.5, "Dùng gần như chỉ présent"],
      [0, "Không kiểm soát được thì"],
    ],
    morpho: [
      [2, "Lỗi hiếm và không gây hiểu nhầm"],
      [1, "Lỗi đều đặn nhưng vẫn hiểu được"],
      [0.5, "Lỗi cản việc đọc"],
      [0, "Không kiểm soát được"],
    ],
  },
};

/* Xếp tiêu chí vào ba khối của grille chính thức.
 *
 * Phủ khoá của CẢ BỐN trình độ, kể cả `fiche`/`informer` (A1) và
 * `raconter`/`impressions` (A2) — thiếu một khoá thì tiêu chí đó rơi ra ngoài
 * mọi nhóm và biến mất khỏi màn hình, im lặng. `check:bareme` canh chỗ này. */
export const NHOM_CUA = {
  consigne: "pragmatique",
  fiche: "pragmatique",
  informer: "pragmatique",
  raconter: "pragmatique",
  impressions: "pragmatique",
  sociolang: "pragmatique",
  faits: "pragmatique",
  pensee: "pragmatique",
  argumenter: "pragmatique",
  coherence: "pragmatique",

  lexique: "lexicale",
  etendue_lex: "lexicale",
  maitrise_lex: "lexicale",
  orthographe: "lexicale",

  phrases: "grammaticale",
  temps: "grammaticale",
  morpho: "grammaticale",
};

export const TEN_NHOM = {
  pragmatique: "Năng lực nội dung",
  lexicale: "Từ vựng và chính tả",
  grammaticale: "Ngữ pháp",
};

export const THU_TU_NHOM = ["pragmatique", "lexicale", "grammaticale"];
