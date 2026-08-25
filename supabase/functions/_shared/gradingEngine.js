/* Bộ chấm bài tiếng Pháp — hàm thuần, không đụng React, không đụng kho dữ liệu.

   VIẾT BẰNG .js CHỨ KHÔNG PHẢI .ts. Dự án không có TypeScript: không tsconfig,
   không bước type-check, mọi file đều .js/.jsx. Vite vẫn nuốt được một file
   .ts lẻ, nhưng nó chỉ bị tước kiểu rồi bỏ qua — không ai kiểm tra gì cả. Đổi
   lại là thêm một ngôn ngữ thứ hai vào cây mã để lấy đúng con số không lợi
   ích. Kiểu dữ liệu ghi trong JSDoc bên dưới, IDE vẫn gợi ý được.

   ĐANG THAY THẾ CHO GÌ: shared/questions.js có `norm()` và `fillOk()` đang
   chấm mọi bài điền từ. Chúng CHƯA bị gỡ — file này mới chỉ là engine, chỗ
   gọi vẫn nguyên. Xem phần cảnh báo về `strictAccents` ở dưới trước khi nối. */

/* ─────────────────────────── Chuẩn hoá đầu vào ─────────────────────────── */

/* Dấu nháy: bàn phím điện thoại và Word tự đổi ' thành ’, nên cùng một câu gõ
   ở hai chỗ ra hai chuỗi khác nhau. Gom hết về nháy thẳng. */
const QUOTES = /[‘’‛ʼ]/g;
const DQUOTES = /[“”«»]/g;

/* Khoảng trắng lạ: tiếng Pháp dùng espace insécable (U+00A0) trước ? ! : ; và
   trong « … ». Trình soạn thảo chèn tự động, học sinh gõ dấu cách thường —
   không quy về một mối thì hai chuỗi nhìn giống hệt nhau lại không bằng nhau. */
const SPACES = /[   \t\r\n]+/g;

/* Élision. Danh sách đóng, không phải quy tắc chung "xoá dấu cách sau mọi dấu
   nháy": làm chung sẽ nuốt luôn dấu cách trong câu trích dẫn. Gồm cả các dạng
   dài (jusqu', lorsqu'…) vì chúng cùng một hiện tượng. */
const ELISIONS = /\b(c|j|l|m|n|s|t|d|qu|jusqu|lorsqu|puisqu|quoiqu|aujourd)['’]\s+/gi;

/* Chữ ghép. "cœur" và "coeur" là cùng một từ với người học; bàn phím phổ thông
   không có œ nên bắt gõ đúng ký tự đó là chấm sai kỹ năng bàn phím, không phải
   kỹ năng tiếng Pháp. */
const LIGATURES = [[/œ/g, "oe"], [/Œ/g, "OE"], [/æ/g, "ae"], [/Æ/g, "AE"]];

/* Bỏ dấu phụ: NFD tách ký tự thành chữ cái + dấu, rồi xoá dải dấu.
   é→e, à→a, ç→c, ù→u. */
export function stripDiacritics(text) {
  return String(text ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Chuẩn hoá một câu trả lời tiếng Pháp về dạng so sánh được.
 *
 * @param {string} text
 * @param {object} [opts]
 * @param {boolean} [opts.stripAccents=false]  bỏ dấu trước khi so
 * @param {boolean} [opts.lowercase=true]      hạ chữ thường
 * @param {boolean} [opts.dropEdgePunctuation=true] bỏ dấu câu ở hai đầu
 * @returns {string}
 */
export function sanitizeFrenchText(text, opts = {}) {
  const {
    stripAccents = false,
    lowercase = true,
    dropEdgePunctuation = true,
  } = opts;

  let s = String(text ?? "");

  s = s.replace(QUOTES, "'").replace(DQUOTES, '"');
  for (const [re, to] of LIGATURES) s = s.replace(re, to);
  s = s.replace(SPACES, " ");
  if (lowercase) s = s.toLowerCase();

  /* Élision xử lý SAU khi hạ chữ thường để danh sách trên chỉ cần chữ thường,
     và TRƯỚC khi gộp khoảng trắng vì nó tự nuốt phần trắng nó cần. */
  s = s.replace(ELISIONS, "$1'");

  s = s.replace(/\s+/g, " ").trim();

  /* Chỉ cắt dấu câu ở HAI ĐẦU, không đụng bên trong: "l'eau, s'il te plaît"
     phải giữ nguyên dấu phẩy giữa câu. Học sinh hay gõ thừa dấu chấm cuối ô
     điền từ, và chấm sai vì một dấu chấm là chấm sai thứ không ai định hỏi. */
  if (dropEdgePunctuation) s = s.replace(/^[.,;:!?"']+|[.,;:!?"]+$/g, "").trim();

  if (stripAccents) s = stripDiacritics(s);
  return s;
}

/* ────────────────────────── Lấy danh sách đáp án ────────────────────────── */

/**
 * Đáp án đúng của một câu hỏi, dạng mảng.
 *
 * Đọc được CẢ HAI lược đồ, cố ý:
 *  · `correctAnswers: string[]` — dạng mới;
 *  · `accepted: "a|b|c"` — dạng đang có trong kho, do ô nhập của giáo viên
 *    sinh ra (Builder.jsx gợi ý đúng "suis allé|suis allée");
 *  · `answer` — bài nhập khẩu đời đầu.
 *
 * Bỏ nhánh cũ thì mọi bài đã soạn từ trước hoá thành không có đáp án và cả
 * thư viện chấm sai hàng loạt. Chuyển đổi kho dữ liệu là việc riêng, không
 * gộp vào đây.
 *
 * @param {object} q
 * @returns {string[]}
 */
export function acceptedVariants(q) {
  if (Array.isArray(q?.correctAnswers)) {
    return q.correctAnswers.map((v) => String(v)).filter((v) => v.trim() !== "");
  }
  const legacy = q?.accepted ?? q?.answer ?? "";
  return String(legacy).split("|").map((v) => v.trim()).filter(Boolean);
}

/* ──────────────────────────────── Chấm ─────────────────────────────────── */

/**
 * So một câu trả lời với danh sách đáp án.
 *
 * `strictAccents` mặc định TRUE, và đó là chỗ khác biệt lớn nhất so với hàm
 * `norm()` cũ — hàm cũ bỏ dấu vô điều kiện. Trong tiếng Pháp dấu đổi nghĩa
 * hẳn: "a" (động từ) ≠ "à" (giới từ), "ou" (hoặc) ≠ "où" (ở đâu),
 * "sur" (trên) ≠ "sûr" (chắc chắn). Chấm đúng cho một học sinh viết "ou" khi
 * đề hỏi "où" là dạy sai.
 *
 * Bài cho người mới, nơi mục tiêu là nhớ từ chứ không phải gõ dấu, thì truyền
 * `strictAccents: false`.
 *
 * @param {string} userAnswer
 * @param {string[]|string} correctAnswers
 * @param {object} [options]
 * @param {boolean} [options.strictAccents=true]
 * @param {boolean} [options.strictCase=false]
 * @param {boolean} [options.dropEdgePunctuation=true]
 * @returns {{correct: boolean, matched: string|null, normalizedUser: string}}
 */
export function evaluateAnswer(userAnswer, correctAnswers, options = {}) {
  const {
    strictAccents = true,
    strictCase = false,
    dropEdgePunctuation = true,
  } = options;

  const norm = (v) => sanitizeFrenchText(v, {
    stripAccents: !strictAccents,
    lowercase: !strictCase,
    dropEdgePunctuation,
  });

  const user = norm(userAnswer);
  const list = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];

  /* Chuỗi rỗng KHÔNG bao giờ đúng, kể cả khi đáp án cũng rỗng. Câu hỏi thiếu
     đáp án là lỗi soạn đề; cho nó tự động đúng thì cả lớp được điểm cho một
     câu chưa ai viết xong. */
  if (!user) return { correct: false, matched: null, normalizedUser: user };

  for (const raw of list) {
    const candidate = norm(raw);
    if (candidate && candidate === user) {
      return { correct: true, matched: String(raw), normalizedUser: user };
    }
  }
  return { correct: false, matched: null, normalizedUser: user };
}

/**
 * Chấm thẳng từ đối tượng câu hỏi — bọc `acceptedVariants` + `evaluateAnswer`,
 * và lấy luôn lời giải thích để giao diện hiện ra khi sai.
 *
 * `strictAccents` đọc theo thứ tự: tuỳ chọn của lời gọi → cờ trên câu hỏi →
 * cờ trên bài tập → mặc định. Nhờ vậy giáo viên đặt được mức chặt cho từng bài
 * mà không phải sửa mã.
 *
 * @param {object} q            câu hỏi
 * @param {string} userAnswer
 * @param {object} [options]
 * @param {object} [options.exercise] bài tập chứa câu hỏi, để đọc cờ chung
 * @returns {{correct: boolean, matched: string|null, explanation: string}}
 */
export function evaluateQuestion(q, userAnswer, options = {}) {
  const { exercise, ...rest } = options;

  const strictAccents = rest.strictAccents
    ?? q?.strictAccents
    ?? exercise?.strictAccents
    ?? true;

  const res = evaluateAnswer(userAnswer, acceptedVariants(q), { ...rest, strictAccents });

  return {
    ...res,
    /* Lời giải thích ở cấp CÂU HỎI. Kho hiện chỉ có `explications` ở cấp bài
       tập; rơi về đó để bài cũ vẫn nói được điều gì đó thay vì im lặng. */
    explanation: q?.explanation || q?.explication || exercise?.explications || "",
  };
}

/* ───────────────────── Chấm bài viết bằng AI (chưa nối) ────────────────── */

/**
 * CHƯA HOẠT ĐỘNG — chỗ giữ sẵn cho bước sau. Gọi vào sẽ nhận `connected:false`
 * chứ không phải điểm bịa: một hàm trả về số ngẫu nhiên trông như đã chạy sẽ
 * lặng lẽ chấm sai bài của học sinh thật.
 *
 * Khi nối thật, KHÔNG gọi thẳng từ trình duyệt. Khoá API đặt trong mã client
 * là khoá đã lộ — ai mở DevTools cũng lấy được và tiêu tiền của bạn. Đường đi
 * đúng: một Edge Function của Supabase giữ khoá, client gọi hàm đó.
 *
 * Phác thảo phía server:
 *   1. Nhận { userText, rubric, level }.
 *   2. System prompt: chấm ngữ pháp, độ phong phú từ vựng, cấu trúc câu theo
 *      `rubric`; trả JSON đúng khuôn { score, max, feedback[], corrected }.
 *   3. Gọi LLM với response_format JSON để khỏi phải dò chuỗi.
 *   4. Kiểm tra khuôn trả về TRƯỚC khi ghi vào bài nộp — mô hình vẫn có lúc
 *      trả thiếu trường, mà điểm ghi hỏng thì học sinh chịu.
 *   5. Điểm AI vào `openMarks` dưới dạng ĐỀ XUẤT, giáo viên chốt. Điểm số của
 *      một con người phải do một con người ký.
 *
 * @param {string} userText
 * @param {object} rubric
 * @returns {Promise<{connected: false, reason: string}>}
 */
export async function evaluateEssayWithAI(userText, rubric) {
  return {
    connected: false,
    reason: "not-implemented",
    userText: String(userText ?? "").slice(0, 0),  // giữ chữ ký, không giữ dữ liệu
    rubric: rubric ?? null,
  };
}
