import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Ba trang công khai: Câu hỏi thường gặp · Điều khoản sử dụng · Chính sách bảo mật.
 *
 * Chính sách bảo mật: gỡ 21/09, DỰNG LẠI 25/09 khi form « Gửi câu hỏi » bật lại
 * (thêm mục dữ liệu của form đó). Thêm tính năng thu dữ liệu mới thì PHẢI sửa
 * trang này trước.
 *
 * ══ MỌI CÂU Ở ĐÂY PHẢI ĐÚNG VỚI MÃ NGUỒN ══
 *
 * Quy tắc 1 của dự án — không bịa dữ liệu — áp cho ba trang này MẠNH HƠN mọi
 * màn hình khác: đây là lời cam kết pháp lý với người dùng. Nên không có câu
 * mẫu chép từ nơi khác. Mỗi khẳng định đối chiếu được, đo ngày 21/09/2026:
 *
 *   · Không có công cụ quảng cáo / phân tích nào: grep gtag, analytics,
 *     posthog, mixpanel, amplitude, hotjar, pixel trên src/ + index.html = 0.
 *   · Bản ghi âm ở bucket RIÊNG `bai-noi` (migration 057).
 *   · Bài viết gửi cho OpenAI khi học sinh bấm « Xin gợi ý », và TỰ ĐỘNG với
 *     phần viết bài thi thử (08/10, Edge Function `cham-pe`).
 *
 * 08/10: ba trang viết ĐỦ BA THỨ TIẾNG bằng tr(vi, fr, en) — tr nhận cả JSX.
 *   · Thanh toán là CHUYỂN KHOẢN qua mã VietQR, SePay báo về; hệ thống không
 *     bao giờ thấy số thẻ.
 *   · Không có cơ chế tự xoá dữ liệu theo thời hạn — nên chính sách nói thẳng
 *     điều đó, không hứa "xoá sau 12 tháng".
 *
 * Thêm tính năng thu dữ liệu mới (form, tracking, nhà cung cấp mới) mà không
 * sửa trang này là làm trang này nói sai. Đó là việc phải nhớ.
 *
 * ══ ĐÂY LÀ BẢN NHÁP, KHÔNG PHẢI TƯ VẤN PHÁP LÝ ══
 *
 * Viết để ĐÚNG VỚI SẢN PHẨM, chưa qua luật sư. Đặc biệt: Nghị định 13/2023/NĐ-CP
 * về bảo vệ dữ liệu cá nhân có những nghĩa vụ (đánh giá tác động, thông báo
 * khi chuyển dữ liệu ra nước ngoài…) mà một trang văn bản không tự làm thay.
 * Trang này không TUYÊN BỐ đã tuân thủ — nó chỉ mô tả trung thực việc đang làm.
 */

/* Email liên hệ — ĐỂ TRỐNG CÓ CHỦ Ý.
   Chính sách bảo mật bắt buộc có một địa chỉ để người dùng đòi quyền của họ,
   nhưng đưa email cá nhân của ai lên một trang công khai là quyết định của
   người đó, không phải của người viết mã. Điền vào đây là mọi trang tự đổi.
   Trống thì trang HIỆN RÕ là còn thiếu — một chính sách không có chỗ liên hệ
   mà trông như hoàn chỉnh còn tệ hơn một chính sách tự nói nó thiếu. */
export const EMAIL_LIEN_HE = "contact.fracile@gmail.com";   // chủ dự án chọn 23/09/2026

const CAP_NHAT = "08/10/2026";

function LienHe() {
  if (EMAIL_LIEN_HE) {
    return <a href={`mailto:${EMAIL_LIEN_HE}`} className="font-bold text-primary">{EMAIL_LIEN_HE}</a>;
  }
  return (
    <span className="rounded bg-warn-soft px-1.5 py-0.5 font-bold text-warn">
      {tr("[chưa công bố email liên hệ]", "[e-mail de contact non publié]", "[contact email not published]")}
    </span>
  );
}

function Khung({ tieuDe, children }) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <Link to="/gioi-thieu" className="text-sm font-bold text-primary no-underline">← FRACILE</Link>
        <h1 className="m-0 mt-4 text-3xl font-extrabold tracking-tight text-ink">{tieuDe}</h1>
        <p className="m-0 mt-2 text-xs text-soft">{tr("Cập nhật lần cuối", "Dernière mise à jour", "Last updated")}: {CAP_NHAT}</p>

        {!EMAIL_LIEN_HE && (
          <p className="m-0 mt-5 flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-3 text-xs leading-relaxed text-warn">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{tr("Trang này chưa có địa chỉ liên hệ chính thức.", "Cette page n'a pas encore d'adresse de contact officielle.", "This page has no official contact address yet.")}</span>
          </p>
        )}

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink">{children}</div>

        <nav className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-0 border-t border-solid border-line pt-6 text-sm">
          <Link to="/faq" className="text-soft no-underline hover:text-ink">{tr("Câu hỏi thường gặp", "Questions fréquentes", "FAQ")}</Link>
          <Link to="/dieu-khoan" className="text-soft no-underline hover:text-ink">{tr("Điều khoản sử dụng", "Conditions d'utilisation", "Terms of use")}</Link>
          <Link to="/bao-mat" className="text-soft no-underline hover:text-ink">{tr("Chính sách bảo mật", "Politique de confidentialité", "Privacy policy")}</Link>
        </nav>
      </div>
    </div>
  );
}

function Muc({ ten, children }) {
  return (
    <section>
      <h2 className="m-0 text-lg font-extrabold text-ink">{ten}</h2>
      <div className="mt-2 space-y-3 text-soft [&_strong]:text-ink">{children}</div>
    </section>
  );
}

const P = ({ children }) => <p className="m-0">{children}</p>;
const UL = ({ children }) => <ul className="m-0 list-disc space-y-1.5 pl-5">{children}</ul>;

/* ═══════════════════════════════ FAQ ═══════════════════════════════ */

/* Mỗi câu trả lời phải đúng với mã nguồn Ở THỜI ĐIỂM NÀY (08/10). Hàm, không
   hằng: chữ đổi theo ngôn ngữ đang chọn. */
const HOI_DAP = () => [
  [tr("FRACILE là gì?", "Qu'est-ce que FRACILE ?", "What is FRACILE?"),
   tr("Một nền tảng luyện thi tiếng Pháp DELF từ A1 đến B2 (và DALF C1): bài tập theo kỹ năng, đề thi thử có đồng hồ, lộ trình theo chủ đề và thẻ Flashcard do giáo viên soạn.",
      "Une plateforme de préparation au DELF du A1 au B2 (et au DALF C1) : exercices par compétence, examens blancs chronométrés, parcours thématique et flashcards créées par des enseignants.",
      "A French exam prep platform for DELF A1 to B2 (and DALF C1): skill-based exercises, timed mock exams, a topic-based path and teacher-made flashcards.")],
  [tr("Tạo tài khoản có mất phí không?", "La création de compte est-elle payante ?", "Is creating an account free?"),
   tr("Không. Bạn tự đăng ký bằng email hoặc tài khoản Google. Phần lớn bài tập miễn phí; một số bài nâng cao là bài trả phí và có ghi rõ trên thẻ bài.",
      "Non. Inscrivez-vous avec un e-mail ou un compte Google. La plupart des exercices sont gratuits ; certains exercices avancés sont payants et clairement signalés.",
      "Yes. Sign up with an email or a Google account. Most exercises are free; some advanced ones are paid and clearly marked.")],
  [tr("Điểm thi thử có phải điểm DELF chính thức không?", "La note de l'examen blanc est-elle une note officielle du DELF ?", "Is the mock exam score an official DELF score?"),
   tr("Không. Đề thi thử mô phỏng cấu trúc và thời gian của kỳ thi thật, nhưng điểm ở đây chỉ để bạn tự đánh giá. Điểm DELF chính thức chỉ do các trung tâm khảo thí được công nhận cấp.",
      "Non. L'examen blanc reproduit la structure et la durée du vrai examen, mais la note sert seulement à vous situer. Seuls les centres d'examen agréés délivrent une note officielle.",
      "No. Mock exams mirror the real exam's structure and timing, but the score is only for self-assessment. Only accredited exam centres issue official DELF scores.")],
  [tr("Ai chấm bài của tôi?", "Qui corrige mes réponses ?", "Who grades my work?"),
   tr("Trắc nghiệm, điền từ, chia động từ, đúng/sai, bảng, sắp xếp câu và ghép cặp được máy chủ chấm ngay khi bạn nộp. Bài viết trong bài thi thử được AI chấm tự động theo thang DELF của đúng trình độ, kèm phiếu nhận xét theo từng tiêu chí; đó là điểm phần viết. Bài viết luyện tập thì bạn tự chấm và có thể xin AI gợi ý. Tài khoản thường có 3 lượt AI chấm mỗi ngày (tính cả bài thi thử, mở lại lúc 0 giờ), VIP không giới hạn. Điểm do AI chấm có thể sai và không phải điểm DELF chính thức.",
      "QCM, textes à trous, conjugaison, vrai/faux, tableaux, phrases à remettre en ordre et appariements sont corrigés par le serveur dès l'envoi. La production écrite d'un examen blanc est corrigée automatiquement par l'IA avec la grille DELF du niveau, avec une fiche d'évaluation par critère ; c'est la note de l'écrit. À l'entraînement, vous vous auto-évaluez et pouvez demander une proposition à l'IA. Compte standard : 3 corrections IA par jour (examens blancs compris, renouvelées à minuit) ; VIP : illimité. La note de l'IA peut se tromper et n'est pas une note officielle.",
      "Multiple choice, gap fills, conjugation, true/false, tables, sentence ordering and matching are graded by the server the moment you submit. Writing in a mock exam is graded automatically by AI against the DELF grid for that level, with a per-criterion assessment sheet; that is the writing score. In practice you self-assess and can ask the AI for a suggestion. Standard accounts get 3 AI gradings per day (mock exams included, reset at midnight); VIP is unlimited. AI scores can be wrong and are not official.")],
  [tr("Bài nói có được chấm điểm không?", "La production orale est-elle notée ?", "Is speaking scored?"),
   tr("Không có điểm số. Kỳ thi thật chấm phần nói qua hội thoại với giám khảo. Bạn ghi âm để tự nghe lại, và có thể bấm « AI nhận xét » để nhận góp ý về ngữ pháp, từ vựng và cách nối ý (6 lượt mỗi 24 giờ, VIP không giới hạn).",
      "Pas de note. À l'examen réel, l'oral se passe face à un examinateur. Vous vous enregistrez pour vous réécouter, et pouvez cliquer sur « Avis de l'IA » pour des conseils de grammaire, de vocabulaire et d'enchaînement (6 par 24 h, illimité en VIP).",
      "No score. In the real exam, speaking is assessed in conversation with an examiner. You record yourself to listen back, and can click « AI feedback » for advice on grammar, vocabulary and flow (6 per 24 h, unlimited with VIP).")],
  [tr("Phần nghe trong thi thử diễn ra thế nào?", "Comment se passe la compréhension orale à l'examen blanc ?", "How does listening work in a mock exam?"),
   tr("Như phòng thi thật: mỗi bài nghe là một file gồm 30 giây đọc câu hỏi, lượt nghe 1, 30 giây nghỉ, lượt nghe 2 và 30 giây hoàn thành. Bạn bấm phát một lần, không tạm dừng hay tua lại được. Số lần phát được đếm ở máy chủ.",
      "Comme à l'examen : chaque enregistrement contient 30 secondes de lecture des questions, une 1re écoute, 30 secondes de pause, une 2e écoute et 30 secondes pour compléter. Vous le lancez une seule fois, sans pause ni retour. Les lectures sont comptées par le serveur.",
      "Like the real exam: each recording includes 30 seconds to read the questions, a 1st listening, a 30-second pause, a 2nd listening and 30 seconds to finish. You play it once, with no pausing or rewinding. Plays are counted on the server.")],
  [tr("Mỗi ngày được thi thử mấy lần?", "Combien d'examens blancs par jour ?", "How many mock exams per day?"),
   tr("Hai lượt mỗi ngày theo giờ Việt Nam (VIP không giới hạn). Bấm « Bắt đầu thi » là dùng một lượt; thoát giữa chừng, đóng tab hay tải lại trang đều mất lượt đó. Phần đã nộp vẫn được lưu.",
      "Deux par jour, heure du Vietnam (illimité en VIP). Commencer utilise un essai ; quitter en cours, fermer l'onglet ou recharger le fait perdre. Les parties rendues restent enregistrées.",
      "Two per day, Vietnam time (unlimited with VIP). Starting uses an attempt; leaving midway, closing the tab or reloading loses it. Parts already submitted stay saved.")],
  [tr("Làm sao để mở khoá bài trả phí?", "Comment débloquer un exercice payant ?", "How do I unlock a paid exercise?"),
   tr("Chuyển khoản theo mã QR hiện trên bài, giữ nguyên nội dung chuyển khoản; bài mở khi hệ thống nhận thông báo giao dịch. Hoặc đổi XP để mở bài, hoặc đăng ký gói VIP. Đã chuyển khoản mà bài chưa mở thì hãy liên hệ.",
      "Faites un virement avec le QR code affiché, sans modifier le libellé ; l'exercice s'ouvre à réception de la notification. Vous pouvez aussi utiliser vos XP ou prendre l'offre VIP. Virement fait mais exercice fermé ? Contactez-nous.",
      "Pay by bank transfer using the QR code shown, keeping the transfer note unchanged; it unlocks when the payment is confirmed. You can also spend XP or get VIP. Paid but still locked? Contact us.")],
  [tr("XP là gì và nhận XP thế nào?", "Que sont les XP et comment les gagner ?", "What is XP and how do I earn it?"),
   tr("XP là điểm kinh nghiệm do máy chủ cộng. Bạn nhận XP khi hoàn thành một bài lần đầu (10 XP cộng 1 XP mỗi điểm), qua một màn Lộ trình lần đầu (5 XP, thử thách cuối chủ đề 15 XP) và điểm danh mỗi ngày (5 XP). Tối đa 60 XP mỗi ngày và 300 XP mỗi tuần. Giữ chuỗi 7, 30, 100 ngày được thưởng thêm 30, 100, 300 XP. XP dùng để đổi bài trả phí (giá XP mặc định bằng giá tiền chia 100).",
      "Les XP sont des points d'expérience ajoutés par le serveur : 10 XP + 1 XP par point pour un premier exercice terminé, 5 XP par étape du parcours (15 XP pour le défi final), 5 XP de présence quotidienne. Maximum 60 XP par jour et 300 par semaine. Séries de 7, 30, 100 jours : +30, +100, +300 XP. Les XP débloquent des exercices payants (prix XP = prix ÷ 100).",
      "XP are experience points added by the server: 10 XP + 1 XP per point for a first completed exercise, 5 XP per path level (15 XP for the final challenge), 5 XP daily check-in. Max 60 XP a day and 300 a week. 7, 30, 100-day streaks give +30, +100, +300 XP. XP unlock paid exercises (XP price = money price ÷ 100).")],
  [tr("Gói VIP là gì?", "Qu'est-ce que l'offre VIP ?", "What is VIP?"),
   tr("99.000 đ cho 30 ngày: mở mọi bài trả phí và đề thi thử, không giới hạn lượt thi thử và lượt AI, có huy hiệu vương miện trên ảnh đại diện. Gia hạn khi còn hạn thì 30 ngày được cộng nối tiếp. Hết hạn thì bài trả phí tự khoá lại, không tự trừ tiền.",
      "99 000 ₫ pour 30 jours : tous les exercices payants et examens blancs, examens et corrections IA illimités, badge couronne sur l'avatar. Prolonger avant la fin ajoute 30 jours. À l'expiration, les exercices payants se reverrouillent, sans prélèvement automatique.",
      "99,000 ₫ for 30 days: every paid exercise and mock exam, unlimited mock exams and AI gradings, and a crown badge on your avatar. Renewing early adds 30 more days. When it expires, paid content locks again, with no automatic charge.")],
  [tr("Chuỗi ngày học được tính ra sao?", "Comment la série de jours est-elle calculée ?", "How is the study streak counted?"),
   tr("Mỗi ngày nộp ít nhất một bài thì chuỗi tăng một ngày, theo giờ Việt Nam. Hôm nay chưa học thì chuỗi vẫn giữ tới nửa đêm. Chuỗi tính ở máy chủ.",
      "Chaque jour avec au moins un exercice rendu ajoute un jour, heure du Vietnam. La série tient jusqu'à minuit. Elle est calculée par le serveur.",
      "Each day you submit at least one exercise adds a day, Vietnam time. The streak holds until midnight. It's calculated on the server.")],
  [tr("Theo dõi bạn học là gì?", "Suivre un camarade, c'est quoi ?", "What does following a classmate do?"),
   tr("Nhập @username của bạn học để theo dõi, rồi thấy hôm nay bạn đó đã học chưa và đang online hay không. Người khác chỉ thấy tên hiển thị, @username, ảnh đại diện; bạn có thể ẩn trạng thái online.",
      "Entrez le @username d'un camarade pour le suivre et voir s'il a étudié aujourd'hui et s'il est en ligne. Les autres ne voient que votre nom, @username et avatar ; vous pouvez masquer votre statut en ligne.",
      "Enter a classmate's @username to follow them and see whether they studied today and whether they're online. Others only see your display name, @username and avatar; you can hide your online status.")],
  [tr("Tôi có tự tạo Flashcard được không?", "Puis-je créer mes propres flashcards ?", "Can I make my own flashcards?"),
   tr("Không. Các bộ Flashcard do giáo viên soạn để bảo đảm chính xác. Bạn chọn một bộ rồi luyện; lịch ôn đưa lại đúng những thẻ bạn sắp quên.",
      "Non. Les paquets sont créés par les enseignants pour garantir leur exactitude. Choisissez-en un ; la révision espacée vous repropose les cartes au bon moment.",
      "No. Decks are made by teachers to keep them accurate. Pick one and practise; spaced review brings back the cards you're about to forget.")],
  [tr("Tôi quên mật khẩu thì làm sao?", "J'ai oublié mon mot de passe", "I forgot my password"),
   tr("Bấm « Quên mật khẩu? » ở trang đăng nhập và nhập email; liên kết đặt lại sẽ được gửi tới hộp thư. Đăng nhập bằng Google thì không cần mật khẩu.",
      "Cliquez sur « Mot de passe oublié ? » et saisissez votre e-mail ; un lien de réinitialisation vous sera envoyé. Avec Google, pas besoin de mot de passe.",
      "Click « Forgot password? » on the sign-in page and enter your email; a reset link will be sent. With Google sign-in you don't need a password.")],
  [tr("Dữ liệu của tôi được dùng vào việc gì?", "À quoi servent mes données ?", "What is my data used for?"),
   tr("Chỉ để vận hành việc học của bạn. Không bán dữ liệu, không dùng công cụ quảng cáo hay theo dõi. Chi tiết ở trang Chính sách bảo mật.",
      "Uniquement à faire fonctionner votre apprentissage. Aucune revente, aucun outil publicitaire ni de suivi. Détails dans la politique de confidentialité.",
      "Only to run your learning. No selling, no advertising or tracking tools. Details in the privacy policy.")],
  [tr("Tôi muốn hỏi thêm thì liên hệ ở đâu?", "Où poser d'autres questions ?", "Where can I ask more questions?"),
   tr("Bấm « Gửi câu hỏi » trên trang giới thiệu, hoặc viết thư tới địa chỉ email ở cuối trang này.",
      "Cliquez sur « Poser une question » sur la page d'accueil, ou écrivez à l'adresse e-mail en bas de cette page.",
      "Click « Ask a question » on the home page, or email the address at the bottom of this page.")],
];

export function TrangFAQ() {
  return (
    <Khung tieuDe={tr("Câu hỏi thường gặp", "Questions fréquentes", "Frequently asked questions")}>
      {HOI_DAP().map(([hoi, dap]) => (
        <Muc key={hoi} ten={hoi}><P>{dap}</P></Muc>
      ))}
      <Muc ten={tr("Chưa thấy câu trả lời?", "Pas de réponse ?", "Didn't find an answer?")}><P>{tr("Liên hệ", "Contact", "Contact")}: <LienHe />.</P></Muc>
    </Khung>
  );
}

/* ═══════════════════════════ ĐIỀU KHOẢN ═══════════════════════════ */

export function TrangDieuKhoan() {
  return (
    <Khung tieuDe={tr("Điều khoản sử dụng", "Conditions d'utilisation", "Terms of use")}>
      <Muc ten={tr("1. Về dịch vụ", "1. Le service", "1. The service")}>
        <P>{tr("FRACILE là nền tảng luyện thi tiếng Pháp DELF, do Đỗ Quốc Hùng xây dựng và vận hành. Khi tạo tài khoản hoặc sử dụng dịch vụ, bạn đồng ý với các điều khoản dưới đây.",
          "FRACILE est une plateforme de préparation au DELF, créée et exploitée par Đỗ Quốc Hùng. En créant un compte ou en utilisant le service, vous acceptez les conditions ci-dessous.",
          "FRACILE is a DELF French exam prep platform built and run by Đỗ Quốc Hùng. By creating an account or using the service, you agree to the terms below.")}</P>
      </Muc>

      <Muc ten={tr("2. Tài khoản", "2. Compte", "2. Account")}>
        <UL>
          <li>{tr("Bạn chịu trách nhiệm giữ bí mật thông tin đăng nhập của mình.", "Vous êtes responsable de la confidentialité de vos identifiants.", "You are responsible for keeping your sign-in details secret.")}</li>
          <li>{tr("Mỗi tài khoản dành cho một người học. Không chia sẻ tài khoản cho người khác dùng chung.", "Un compte par apprenant. Ne partagez pas votre compte.", "One account per learner. Don't share your account.")}</li>
          <li>{tr("Nếu bạn dưới 16 tuổi, cha mẹ hoặc người giám hộ cần biết và đồng ý cho bạn sử dụng dịch vụ.", "Si vous avez moins de 16 ans, un parent ou tuteur doit être informé et donner son accord.", "If you are under 16, a parent or guardian must know about and agree to your use of the service.")}</li>
        </UL>
      </Muc>

      <Muc ten={tr("3. Điểm số và kết quả", "3. Notes et résultats", "3. Scores and results")}>
        <P>{tr(<><strong>Điểm trên FRACILE không phải kết quả DELF chính thức</strong> và không có giá trị thay thế chứng chỉ. Đề thi thử mô phỏng cấu trúc kỳ thi để bạn luyện tập.</>,
          <><strong>Les notes FRACILE ne sont pas des résultats officiels du DELF</strong> et ne remplacent pas le diplôme. Les examens blancs reproduisent la structure de l'examen pour vous entraîner.</>,
          <><strong>FRACILE scores are not official DELF results</strong> and do not replace the certificate. Mock exams mirror the exam's structure for practice.</>)}</P>
        <P>{tr("Bài viết của bài thi thử do AI chấm tự động theo thang DELF; bài viết luyện tập do bạn tự chấm, có thể xin gợi ý từ AI. Điểm do AI chấm có thể sai. Bài nói không được chấm điểm.",
          "La production écrite des examens blancs est corrigée automatiquement par l'IA selon la grille DELF ; à l'entraînement, vous vous auto-évaluez. La note de l'IA peut se tromper. L'oral n'est pas noté.",
          "Mock exam writing is graded automatically by AI against the DELF grid; in practice you self-assess. AI scores can be wrong. Speaking is not scored.")}</P>
      </Muc>

      <Muc ten={tr("4. Thanh toán", "4. Paiement", "4. Payment")}>
        <UL>
          <li>{tr("Một số bài tập là nội dung trả phí, giá hiển thị trên từng bài. Gói VIP có giá và thời hạn ghi rõ khi đăng ký.", "Certains exercices sont payants, prix affiché sur chacun. L'offre VIP indique son prix et sa durée.", "Some exercises are paid, with the price shown on each. VIP shows its price and duration when you sign up.")}</li>
          <li>{tr(<>Thanh toán bằng <strong>chuyển khoản ngân hàng</strong> theo mã QR; nội dung được mở sau khi hệ thống nhận thông báo giao dịch.</>, <>Paiement par <strong>virement bancaire</strong> via QR code ; le contenu s'ouvre à réception de la notification.</>, <>Payment by <strong>bank transfer</strong> via QR code; content unlocks once the payment is confirmed.</>)}</li>
          <li>{tr("Cần giữ nguyên nội dung chuyển khoản để hệ thống nhận ra giao dịch của bạn.", "Ne modifiez pas le libellé du virement pour que le système le reconnaisse.", "Keep the transfer note unchanged so the system can recognise your payment.")}</li>
          <li>{tr("Nếu chuyển nhầm, chuyển thiếu, hoặc đã chuyển mà nội dung chưa mở, hãy liên hệ", "En cas d'erreur, de montant insuffisant ou de contenu non débloqué, contactez", "If you paid the wrong amount or content didn't unlock, contact")} (<LienHe />).</li>
        </UL>
      </Muc>

      <Muc ten={tr("5. Nội dung", "5. Contenus", "5. Content")}>
        <P>{tr("Bài tập, đề thi và bộ Flashcard trên FRACILE thuộc về người soạn. Không sao chép hoặc phát tán lại khi chưa được đồng ý.", "Les exercices, sujets et flashcards appartiennent à leurs auteurs. Pas de copie ni de diffusion sans accord.", "Exercises, exams and flashcards belong to their authors. Don't copy or redistribute them without permission.")}</P>
        <P>{tr("Bài viết và bản ghi âm bạn tạo ra vẫn là của bạn.", "Vos textes et enregistrements restent les vôtres.", "Your writing and recordings remain yours.")}</P>
      </Muc>

      <Muc ten={tr("6. Sử dụng đúng mục đích", "6. Usage loyal", "6. Fair use")}>
        <P>{tr("Không được cố truy cập nội dung trả phí khi chưa mua, can thiệp vào hệ thống chấm điểm, hoặc truy cập dữ liệu của người khác. Tài khoản vi phạm có thể bị khoá.", "Interdit de contourner le paiement, de manipuler la correction ou d'accéder aux données d'autrui. Un compte en infraction peut être bloqué.", "Don't try to access paid content without buying it, tamper with grading or access other people's data. Violating accounts may be blocked.")}</P>
      </Muc>

      <Muc ten={tr("7. Thay đổi", "7. Modifications", "7. Changes")}>
        <P>{tr("Điều khoản có thể được cập nhật khi dịch vụ thay đổi. Ngày cập nhật ghi ở đầu trang.", "Ces conditions peuvent évoluer avec le service. La date de mise à jour figure en haut de page.", "These terms may change as the service changes. The update date is shown at the top.")}</P>
      </Muc>

      <Muc ten={tr("8. Liên hệ", "8. Contact", "8. Contact")}><P><LienHe /></P></Muc>
    </Khung>
  );
}

/* ═══════════════════════════ BẢO MẬT ═══════════════════════════ */

export function TrangBaoMat() {
  return (
    <Khung tieuDe={tr("Chính sách bảo mật", "Politique de confidentialité", "Privacy policy")}>
      <Muc ten={tr("Tóm tắt", "En bref", "Summary")}>
        <UL>
          <li>{tr("Chúng tôi chỉ thu những gì cần để bạn học.", "Nous ne collectons que ce qui est nécessaire à votre apprentissage.", "We only collect what's needed for you to learn.")}</li>
          <li><strong>{tr("Không bán dữ liệu. Không có công cụ quảng cáo hay theo dõi nào.", "Aucune revente de données. Aucun outil publicitaire ni de suivi.", "No selling of data. No advertising or tracking tools.")}</strong></li>
          <li>{tr("Bài viết của bạn được gửi cho dịch vụ AI khi bạn bấm « Xin gợi ý », và tự động khi bạn nộp phần viết của một bài thi thử (để chấm điểm).", "Vos textes sont envoyés au service d'IA quand vous demandez une proposition, et automatiquement pour la production écrite d'un examen blanc (pour la noter).", "Your writing is sent to the AI service when you ask for a suggestion, and automatically for mock exam writing (to grade it).")}</li>
          <li>{tr("Bạn có quyền xem, sửa và yêu cầu xoá dữ liệu của mình.", "Vous pouvez consulter, corriger et demander la suppression de vos données.", "You can view, correct and request deletion of your data.")}</li>
        </UL>
      </Muc>

      <Muc ten={tr("1. Chúng tôi thu những gì", "1. Ce que nous collectons", "1. What we collect")}>
        <P>{tr(<><strong>Tài khoản:</strong> email, tên, tên hiển thị và tên người dùng, ảnh đại diện bạn chọn. Nếu đăng nhập bằng Google, chúng tôi nhận email và tên từ Google.</>, <><strong>Compte :</strong> e-mail, nom, nom affiché, nom d'utilisateur, avatar. Avec Google, nous recevons votre e-mail et votre nom.</>, <><strong>Account:</strong> email, name, display name, username and chosen avatar. With Google sign-in we receive your email and name.</>)}</P>
        <P>{tr(<><strong>Hồ sơ (không bắt buộc):</strong> họ tên, ngày sinh, giới tính, trường, địa chỉ, số điện thoại, trình độ và mục tiêu DELF, chỉ khi bạn tự điền.</>, <><strong>Profil (facultatif) :</strong> nom, date de naissance, genre, établissement, adresse, téléphone, niveau et objectif DELF, seulement si vous les saisissez.</>, <><strong>Profile (optional):</strong> full name, date of birth, gender, school, address, phone, DELF level and goal, only if you fill them in.</>)}</P>
        <P>{tr(<><strong>Việc học:</strong> câu trả lời, điểm, thời gian làm bài, kết quả tự chấm và chấm bằng AI, những ngày bạn học, thời điểm online gần nhất.</>, <><strong>Apprentissage :</strong> réponses, notes, temps passé, auto-évaluations et corrections IA, jours d'étude, dernière connexion.</>, <><strong>Learning:</strong> answers, scores, time spent, self and AI assessments, study days and last time online.</>)}</P>
        <P>{tr(<><strong>Bản ghi âm bài nói:</strong> lưu ở kho riêng tư, chỉ bạn và giáo viên nghe được. Khi bạn bấm « AI nhận xét », hệ thống lưu thêm bản chép lời và nhận xét của AI.</>, <><strong>Enregistrements oraux :</strong> stockés en privé, accessibles à vous et à l'enseignant. Avec « Avis de l'IA », la transcription et l'avis sont aussi conservés.</>, <><strong>Speaking recordings:</strong> stored privately, only you and the teacher can listen. With « AI feedback », the transcript and feedback are stored too.</>)}</P>
        <P>{tr(<><strong>Khi bạn bấm « Gửi câu hỏi »:</strong> họ tên, số điện thoại, năm sinh, email, vai trò, mục tiêu và nội dung câu hỏi, kèm địa chỉ IP để chặn gửi hàng loạt. Chỉ dùng để trả lời bạn.</>, <><strong>Quand vous posez une question :</strong> nom, téléphone, année de naissance, e-mail, rôle, objectif et message, avec l'adresse IP contre les envois massifs. Utilisé uniquement pour vous répondre.</>, <><strong>When you ask a question:</strong> name, phone, birth year, email, role, goal and message, plus the IP address to block spam. Used only to reply to you.</>)}</P>
        <P>{tr(<><strong>Thanh toán:</strong> số tiền, nội dung chuyển khoản và thời điểm giao dịch. Chúng tôi <strong>không</strong> nhận số thẻ hay thông tin tài khoản ngân hàng của bạn.</>, <><strong>Paiement :</strong> montant, libellé et date du virement. Nous ne recevons <strong>pas</strong> vos numéros de carte ni vos coordonnées bancaires.</>, <><strong>Payments:</strong> amount, transfer note and time. We do <strong>not</strong> receive your card number or bank account details.</>)}</P>
        <P>{tr(<><strong>Trên thiết bị của bạn:</strong> trình duyệt lưu phiên đăng nhập, ngôn ngữ và chế độ sáng/tối. Không dùng cookie quảng cáo.</>, <><strong>Sur votre appareil :</strong> le navigateur garde votre session, votre langue et le thème clair/sombre. Pas de cookies publicitaires.</>, <><strong>On your device:</strong> the browser keeps your session, language and light/dark theme. No advertising cookies.</>)}</P>
      </Muc>

      <Muc ten={tr("2. Dùng vào việc gì", "2. Utilisation", "2. How we use it")}>
        <UL>
          <li>{tr("Cho bạn đăng nhập và lưu tiến độ.", "Vous connecter et enregistrer vos progrès.", "To sign you in and save your progress.")}</li>
          <li>{tr("Chấm bài, hiện kết quả, lời giải và phiếu nhận xét.", "Corriger, afficher résultats, explications et fiches d'évaluation.", "To grade work and show results, explanations and assessment sheets.")}</li>
          <li>{tr("Cho giáo viên theo dõi việc học, cấp quyền bài và quản lý gói VIP.", "Permettre à l'enseignant de suivre les progrès, gérer les accès et l'offre VIP.", "To let teachers track progress, manage access and VIP.")}</li>
          <li>{tr("Trả lời câu hỏi bạn gửi qua trang giới thiệu.", "Répondre aux questions envoyées depuis la page d'accueil.", "To answer questions sent from the home page.")}</li>
        </UL>
        <P>{tr("Không dùng cho quảng cáo, không bán, không chia sẻ cho bên thứ ba vì mục đích thương mại.", "Jamais pour la publicité, ni vendu, ni partagé à des fins commerciales.", "Never used for advertising, sold, or shared for commercial purposes.")}</P>
      </Muc>

      <Muc ten={tr("3. Những dịch vụ xử lý dữ liệu thay chúng tôi", "3. Sous-traitants", "3. Service providers")}>
        <UL>
          <li>{tr(<><strong>Supabase</strong>: lưu cơ sở dữ liệu, tài khoản và bản ghi âm.</>, <><strong>Supabase</strong> : base de données, comptes et enregistrements.</>, <><strong>Supabase</strong>: database, accounts and recordings.</>)}</li>
          <li>{tr(<><strong>Vercel</strong>: phục vụ trang web.</>, <><strong>Vercel</strong> : hébergement du site.</>, <><strong>Vercel</strong>: hosts the website.</>)}</li>
          <li>{tr(<><strong>OpenAI</strong>: khi bạn bấm « Xin gợi ý » hoặc « AI nhận xét », và tự động với phần viết của bài thi thử (đề bài, bài viết, phiếu đã điền).</>, <><strong>OpenAI</strong> : quand vous demandez une proposition ou un avis, et automatiquement pour l'écrit des examens blancs (consigne, texte, formulaire).</>, <><strong>OpenAI</strong>: when you ask for a suggestion or feedback, and automatically for mock exam writing (prompt, text, filled form).</>)}</li>
          <li>{tr(<><strong>Google (Google Sheets)</strong>: chỉ khi giáo viên bấm « Đồng bộ Google Sheets »: tên hiển thị, @username và kết quả học tập 30 ngày gần nhất. Không gửi email, số điện thoại hay bài làm.</>, <><strong>Google (Google Sheets)</strong> : seulement si l'enseignant synchronise : nom affiché, @username et résultats des 30 derniers jours. Ni e-mail, ni téléphone, ni copies.</>, <><strong>Google (Google Sheets)</strong>: only when the teacher syncs: display name, @username and the last 30 days of results. No email, phone or answers.</>)}</li>
          <li>{tr(<><strong>SePay</strong>: báo cho hệ thống khi có giao dịch chuyển khoản.</>, <><strong>SePay</strong> : notifie les virements.</>, <><strong>SePay</strong>: notifies the system of bank transfers.</>)}</li>
          <li>{tr(<><strong>Google</strong>: chỉ khi bạn chọn đăng nhập bằng Google.</>, <><strong>Google</strong> : seulement si vous vous connectez avec Google.</>, <><strong>Google</strong>: only if you sign in with Google.</>)}</li>
        </UL>
        <P>{tr("Một số dịch vụ trên đặt máy chủ ở ngoài Việt Nam, nên dữ liệu có thể được lưu trữ hoặc xử lý ở nước ngoài.", "Certains de ces services sont hébergés hors du Vietnam ; vos données peuvent donc être traitées à l'étranger.", "Some of these services are hosted outside Vietnam, so data may be stored or processed abroad.")}</P>
      </Muc>

      <Muc ten={tr("4. Lưu trong bao lâu", "4. Durée de conservation", "4. How long we keep it")}>
        <P>{tr("Chưa có cơ chế tự động xoá theo thời hạn: dữ liệu được giữ trong suốt thời gian tài khoản còn tồn tại, hoặc cho tới khi bạn yêu cầu xoá.", "Pas de suppression automatique : les données sont conservées tant que le compte existe ou jusqu'à votre demande de suppression.", "There's no automatic deletion: data is kept while the account exists or until you ask for deletion.")}</P>
      </Muc>

      <Muc ten={tr("5. Quyền của bạn", "5. Vos droits", "5. Your rights")}>
        <P>{tr("Bạn có quyền xem, sửa, yêu cầu xoá dữ liệu cá nhân và rút lại sự đồng ý. Nhiều thông tin bạn tự sửa được ở trang Tài khoản; với yêu cầu khác, liên hệ", "Vous pouvez consulter, corriger, faire supprimer vos données et retirer votre consentement. Beaucoup se modifient dans « Mon compte » ; sinon, contactez", "You can view, correct and delete your personal data and withdraw consent. Much of it can be edited in your Account page; otherwise contact")}: <LienHe />.</P>
      </Muc>

      <Muc ten={tr("6. Người dùng dưới 16 tuổi", "6. Utilisateurs de moins de 16 ans", "6. Users under 16")}>
        <P>{tr("Nhiều người học DELF là học sinh. Nếu bạn dưới 16 tuổi, cha mẹ hoặc người giám hộ cần biết và đồng ý với việc bạn sử dụng dịch vụ và với chính sách này. Bản ghi âm giọng nói được lưu ở kho riêng tư vì lý do này.", "Beaucoup de candidats au DELF sont élèves. Avant 16 ans, un parent ou tuteur doit être informé et accepter l'utilisation du service et cette politique. C'est pourquoi les enregistrements sont privés.", "Many DELF learners are school students. If you're under 16, a parent or guardian must know about and agree to your use of the service and this policy. That's why voice recordings are kept private.")}</P>
      </Muc>

      <Muc ten={tr("7. Thay đổi", "7. Modifications", "7. Changes")}>
        <P>{tr("Khi dịch vụ thu thêm loại dữ liệu mới hoặc dùng thêm nhà cung cấp mới, trang này sẽ được cập nhật trước. Ngày cập nhật ghi ở đầu trang.", "Toute nouvelle donnée collectée ou nouveau prestataire sera ajouté ici au préalable. La date figure en haut de page.", "If we start collecting new data or using a new provider, this page is updated first. The date is shown at the top.")}</P>
      </Muc>
    </Khung>
  );
}
