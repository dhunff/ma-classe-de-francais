import React, { useEffect, useState } from "react";
import { supabase } from "../../storageShim.js";
import { Link, useLocation } from "react-router-dom";
import { useSeo } from "../../shared/seo.js";
import { AlertTriangle, ChevronRight, Search, Send, Loader2 } from "lucide-react";
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
export const EMAIL_LIEN_HE = "leon@fracile.vn";   // chủ dự án đổi 28/10/2026 (trước: contact.fracile@gmail.com)

const CAP_NHAT = "28/10/2026";

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

/* trongApp (28/10): bản mở từ thanh bên học sinh, nằm trong vỏ app nên không có
   nền toàn màn hình và lối « ← FRACILE » về trang giới thiệu. */
function Khung({ tieuDe, children, trongApp = false }) {
  const { pathname } = useLocation();
  const [dangNhap, setDangNhap] = useState(false);
  useEffect(() => {
    let con = true;
    supabase.auth.getSession().then(({ data }) => { if (con) setDangNhap(!!data?.session); }, () => {});
    return () => { con = false; };
  }, []);
  useSeo({ tieuDe: `${tieuDe} · FRACILE`, moTa: `${tieuDe} của FRACILE, nền tảng học tiếng Pháp và luyện thi DELF bằng tiếng Việt.`, duongDan: pathname });
  return (
    <div className={trongApp ? "" : "min-h-screen bg-bg"}>
      <div className={`mx-auto max-w-3xl px-5 ${trongApp ? "py-6" : "py-12 sm:py-16"}`}>
        {/* 28/10: đã đăng nhập thì « ← » về trang chủ của vai (route « * » trong App.jsx lo
            việc chọn), chưa đăng nhập mới về trang giới thiệu. */}
        {!trongApp && <Link to={dangNhap ? "/" : "/gioi-thieu"} className="text-sm font-bold text-primary no-underline">← {dangNhap ? tr("Trang chủ", "Accueil", "Home") : "FRACILE"}</Link>}
        <h1 className="m-0 mt-4 text-[34px] font-bold leading-tight tracking-tight text-ink">{tieuDe}</h1>
        <p className="m-0 mt-2 text-xs text-soft">{tr("Cập nhật lần cuối", "Dernière mise à jour", "Last updated")}: {CAP_NHAT}</p>

        {!EMAIL_LIEN_HE && (
          <p className="m-0 mt-5 flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-3 text-xs leading-relaxed text-warn">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{tr("Trang này chưa có địa chỉ liên hệ chính thức.", "Cette page n'a pas encore d'adresse de contact officielle.", "This page has no official contact address yet.")}</span>
          </p>
        )}

        {/* 28/10: các khối hiện lần lượt từ dưới lên (mcfRise trong base.css, mỗi khối trễ thêm
            50 ms, trần 400 ms để trang dài không bắt chờ). Giảm chuyển động thì base.css tắt hết. */}
        <div className="mt-8 space-y-7 text-[15px] leading-relaxed text-ink">
          {React.Children.toArray(children).filter(Boolean).map((con, k) => (
            <div key={k} className="mcf-rise" style={{ "--mcf-delay": `${Math.min(k * 50, 400)}ms` }}>{con}</div>
          ))}
        </div>

        <FormLienHe trang={pathname} />

        {/* Ba trang pháp lý: danh sách nhóm kiểu inset, trang đang xem tô màu chính (28/10). */}
        <nav className="mt-12 overflow-hidden rounded-2xl bg-surface ring-1 ring-line" aria-label={tr("Trang thông tin", "Pages d'information", "Information pages")}>
          {[["/faq", tr("Câu hỏi thường gặp", "Questions fréquentes", "FAQ")], ["/dieu-khoan", tr("Điều khoản sử dụng", "Conditions d'utilisation", "Terms of use")], ["/bao-mat", tr("Chính sách bảo mật", "Politique de confidentialité", "Privacy policy")]].map(([to, ten]) => (
            <Link key={to} to={to} aria-current={pathname === to ? "page" : undefined}
              className={`flex min-h-[48px] items-center justify-between border-0 border-t border-solid border-line px-4 text-[15px] no-underline first:border-t-0 hover:bg-surface2 ${pathname === to ? "font-semibold text-primary" : "text-ink"}`}>
              {ten}<ChevronRight size={18} aria-hidden className="text-soft" />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

/* Form « Liên hệ » (28/10, theo chủ dự án): cuối cả ba trang. Gửi qua Edge Function
   gui-y-kien: ghi bằng RPC gui_lien_he (có chặn lũ) rồi chuyển mail tới EMAIL_LIEN_HE. */
const O_NHAP = "w-full rounded-xl border border-solid border-line bg-bg px-3.5 py-3 font-sans text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-soft focus:border-primary focus:ring-2 focus:ring-primary/30";
const CHU_DE_LH = () => [["gop_y", tr("Góp ý", "Suggestion", "Feedback")], ["bao_loi", tr("Báo lỗi", "Signaler un bug", "Report a bug")], ["thanh_toan", tr("Thanh toán, VIP", "Paiement, VIP", "Payment, VIP")], ["ban_quyen", tr("Bản quyền", "Droits d'auteur", "Copyright")], ["khac", tr("Khác", "Autre", "Other")]];
function FormLienHe({ trang }) {
  const [f, setF] = useState({ hoTen: "", email: "", chuDe: "gop_y", noiDung: "" });
  const [tt, setTt] = useState(null);      // null | "gui" | { ok, mail } | { loi, kemMail }
  const doi = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const gui = async (e) => {
    e.preventDefault();
    if (!f.hoTen.trim() || !f.email.trim() || !f.noiDung.trim()) { setTt({ loi: tr("Điền đủ họ tên, email và nội dung nhé.", "Remplissez nom, e-mail et message.", "Please fill in name, email and message.") }); return; }
    setTt("gui");
    const { data, error } = await supabase.functions.invoke("gui-y-kien", { body: { ...f, trang } });
    if (data?.ok) { setTt({ ok: true, mail: data.mail }); setF((x) => ({ ...x, noiDung: "" })); return; }
    let ma = data?.error;
    try { ma = ma || (await error?.context?.json?.())?.error; } catch { /* không đọc được thân lỗi */ }
    setTt({ loi: ma === "GUI_QUA_NHIEU" ? tr("Bạn đã gửi nhiều lần hôm nay. Mai gửi tiếp được, hoặc viết thẳng tới", "Trop d'envois aujourd'hui. Réessayez demain ou écrivez à", "Too many messages today. Try tomorrow or email")
      : ma === "SAI_DU_LIEU" ? tr("Email chưa đúng dạng. Kiểm tra lại giúp nhé.", "E-mail invalide.", "That email doesn't look right.")
      : tr("Chưa gửi được (lỗi kết nối). Thử lại, hoặc viết thẳng tới", "Envoi impossible (connexion). Réessayez ou écrivez à", "Couldn't send (connection). Try again or email"), kemMail: ma !== "SAI_DU_LIEU" });
  };
  return (
    <section id="lien-he" className="mcf-rise mt-12 scroll-mt-6" style={{ "--mcf-delay": "150ms" }}>
      <h2 className="m-0 mb-2 px-4 text-[17px] font-semibold tracking-tight text-ink">{tr("Liên hệ", "Contact", "Contact")}</h2>
      <form onSubmit={gui} className="space-y-3 rounded-2xl bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] ring-1 ring-line">
        <p className="m-0 text-[15px] text-soft">{tr("Góp ý, báo lỗi hay câu hỏi chưa có ở đây, cứ viết vào. Thư tới thẳng hộp thư", "Suggestion, bug ou question : écrivez-nous, le message arrive directement à", "Feedback, a bug or a question not covered here: write to us, it goes straight to")} <LienHe />.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={f.hoTen} onChange={doi("hoTen")} maxLength={120} autoComplete="name" placeholder={tr("Họ tên", "Nom", "Name")} aria-label={tr("Họ tên", "Nom", "Name")} className={O_NHAP} />
          <input type="email" value={f.email} onChange={doi("email")} maxLength={200} autoComplete="email" placeholder="Email" aria-label="Email" className={O_NHAP} />
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={tr("Chủ đề", "Sujet", "Topic")}>
          {CHU_DE_LH().map(([ma, ten]) => (
            <button key={ma} type="button" role="radio" aria-checked={f.chuDe === ma} onClick={() => setF((x) => ({ ...x, chuDe: ma }))}
              className={`cursor-pointer rounded-full border border-solid px-3.5 py-1.5 font-sans text-sm font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-95 ${f.chuDe === ma ? "border-primary bg-primary text-on-primary" : "border-line bg-surface2 text-ink hover:border-primary/40"}`}>{ten}</button>
          ))}
        </div>
        <textarea value={f.noiDung} onChange={doi("noiDung")} maxLength={1900} rows={5} placeholder={tr("Nội dung", "Votre message", "Your message")} aria-label={tr("Nội dung", "Message", "Message")} className={`${O_NHAP} resize-y`} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 min-h-[20px] flex-1 text-sm" aria-live="polite">
            {tt?.ok && <span className="mcf-rise inline-block font-semibold text-ok">{tt.mail ? tr("Đã gửi, cảm ơn bạn! Chúng tôi sẽ trả lời qua email.", "Envoyé, merci ! Réponse par e-mail.", "Sent, thank you! We'll reply by email.") : tr("Đã nhận và lưu lại, nhưng chưa chuyển được tới hộp thư. Chúng tôi vẫn đọc được.", "Reçu et enregistré, mais pas encore transmis par e-mail.", "Received and saved, but not forwarded by email yet.")}</span>}
            {tt?.loi && <span className="mcf-rise inline-block text-danger">{tt.loi}{tt.kemMail && <> <LienHe />.</>}</span>}
          </p>
          <button type="submit" disabled={tt === "gui"} className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-6 font-sans text-[15px] font-semibold text-on-primary transition-[transform,opacity] duration-150 active:scale-[0.97] disabled:cursor-wait disabled:opacity-70">
            {tt === "gui" ? <Loader2 size={16} className="mcf-spin" /> : <Send size={16} />} {tr("Gửi", "Envoyer", "Send")}
          </button>
        </div>
      </form>
    </section>
  );
}

/* 28/10 (apple-design-skill): mỗi mục là một khối bo góc kiểu « inset grouped », tiêu đề
   đứng ngoài khối; danh sách thành các dòng ngăn bằng đường kẻ mảnh thay chấm tròn. */
function Muc({ ten, children }) {
  return (
    <section>
      <h2 className="m-0 mb-2 px-4 text-[17px] font-semibold tracking-tight text-ink">{ten}</h2>
      <div className="space-y-3 rounded-2xl bg-surface px-4 py-4 text-soft shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] ring-1 ring-line [&_strong]:font-semibold [&_strong]:text-ink">{children}</div>
    </section>
  );
}

const P = ({ children }) => <p className="m-0">{children}</p>;
const UL = ({ children }) => <ul className="-mx-4 m-0 list-none p-0 [&>li]:border-0 [&>li]:border-t [&>li]:border-solid [&>li]:border-line [&>li]:px-4 [&>li]:py-3 [&>li:first-child]:border-t-0 [&>li:first-child]:pt-0 [&>li:last-child]:pb-0">{children}</ul>;

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
   tr("Trắc nghiệm, điền từ, chia động từ, đúng/sai, bảng, sắp xếp câu và ghép cặp được máy chủ chấm ngay khi bạn nộp. Bài viết trong bài thi thử được AI chấm tự động theo thang DELF của đúng trình độ, kèm phiếu nhận xét theo từng tiêu chí; đó là điểm phần viết. Bài viết luyện tập thì bạn tự chấm và có thể xin AI gợi ý. Tài khoản thường có 3 lượt AI chấm mỗi ngày (tính cả bài thi thử, mở lại lúc 0 giờ), VIP tới 100 lượt AI/ngày. Điểm do AI chấm có thể sai và không phải điểm DELF chính thức.",
      "QCM, textes à trous, conjugaison, vrai/faux, tableaux, phrases à remettre en ordre et appariements sont corrigés par le serveur dès l'envoi. La production écrite d'un examen blanc est corrigée automatiquement par l'IA avec la grille DELF du niveau, avec une fiche d'évaluation par critère ; c'est la note de l'écrit. À l'entraînement, vous vous auto-évaluez et pouvez demander une proposition à l'IA. Compte standard : 3 corrections IA par jour (examens blancs compris, renouvelées à minuit) ; VIP : jusqu'à 100 requêtes IA/jour. La note de l'IA peut se tromper et n'est pas une note officielle.",
      "Multiple choice, gap fills, conjugation, true/false, tables, sentence ordering and matching are graded by the server the moment you submit. Writing in a mock exam is graded automatically by AI against the DELF grid for that level, with a per-criterion assessment sheet; that is the writing score. In practice you self-assess and can ask the AI for a suggestion. Standard accounts get 3 AI gradings per day (mock exams included, reset at midnight); VIP gets up to 100 AI requests a day. AI scores can be wrong and are not official.")],
  [tr("Bài nói có được chấm điểm không?", "La production orale est-elle notée ?", "Is speaking scored?"),
   tr("Trong bài thi thử: có. Bạn tự chấm bài nói theo grille DELF chính thức của đúng trình độ, AI gợi ý điểm từng tiêu chí và bạn bấm « dùng số này » nếu đồng ý; điểm đó tính vào tổng /100. Bỏ phần nói ở màn chờ thì tổng là /75. Khi luyện tập: không có điểm, bạn ghi âm để nghe lại và có thể bấm « AI nhận xét » (6 lượt mỗi 24 giờ, VIP tới 100 lượt AI/ngày).",
      "À l'examen blanc : oui. Vous vous auto-évaluez avec la grille DELF officielle du niveau, l'IA propose une note par critère que vous validez avec « utiliser ce nombre » ; elle compte dans le total sur 100 (sur 75 si vous retirez l'oral). À l'entraînement : pas de note, vous vous enregistrez et pouvez demander l'« Avis de l'IA » (6 par 24 h ; VIP : jusqu'à 100 requêtes IA par jour).",
      "In a mock exam: yes. You self-assess with the official DELF grid for the level, the AI suggests a score per criterion that you accept with « use this number »; it counts towards the total out of 100 (out of 75 if you skip speaking). In practice: no score, you record yourself and can ask for « AI feedback » (6 per 24 h; VIP: up to 100 AI requests a day).")],
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
   tr("99.000 đ cho 30 ngày: mở mọi bài trả phí và đề thi thử, không giới hạn lượt thi thử, tới 100 lượt AI mỗi ngày, có huy hiệu vương miện trên ảnh đại diện. Gia hạn khi còn hạn thì 30 ngày được cộng nối tiếp. Hết hạn thì bài trả phí tự khoá lại, không tự trừ tiền.",
      "99 000 ₫ pour 30 jours : tous les exercices payants et examens blancs, sans limite d'essais d'examen, jusqu'à 100 requêtes IA par jour, badge couronne sur l'avatar. Prolonger avant la fin ajoute 30 jours. À l'expiration, les exercices payants se reverrouillent, sans prélèvement automatique.",
      "99,000 ₫ for 30 days: every paid exercise and mock exam, unlimited mock exams, up to 100 AI requests a day, and a crown badge on your avatar. Renewing early adds 30 more days. When it expires, paid content locks again, with no automatic charge.")],
  [tr("Chuỗi ngày học được tính ra sao?", "Comment la série de jours est-elle calculée ?", "How is the study streak counted?"),
   tr("Mỗi ngày nộp ít nhất một bài thì chuỗi tăng một ngày, theo giờ Việt Nam. Hôm nay chưa học thì chuỗi vẫn giữ tới nửa đêm. Ngày bỏ lỡ được tự đóng băng để giữ chuỗi, tối đa 5 ngày mỗi tháng; lỡ ngày thứ 6 trong tháng thì chuỗi đứt. Chuỗi tính ở máy chủ.",
      "Chaque jour avec au moins un exercice rendu ajoute un jour, heure du Vietnam. La série tient jusqu'à minuit. Un jour manqué est gelé automatiquement pour garder la série, jusqu'à 5 jours par mois ; au 6e, la série se casse. Elle est calculée par le serveur.",
      "Each day you submit at least one exercise adds a day, Vietnam time. The streak holds until midnight. A missed day is frozen automatically to keep it, up to 5 days a month; the 6th breaks it. It's calculated on the server.")],
  [tr("Theo dõi bạn học là gì?", "Suivre un camarade, c'est quoi ?", "What does following a classmate do?"),
   tr("Tìm bạn học theo tên hoặc @username (hoặc chọn trong phần gợi ý) để theo dõi, rồi thấy hôm nay bạn đó đã học chưa và đang online hay không. Người khác chỉ thấy tên hiển thị, @username, ảnh đại diện; bạn có thể ẩn trạng thái online.",
      "Cherchez un camarade par son nom ou son @username (ou dans les suggestions) pour le suivre et voir s'il a étudié aujourd'hui et s'il est en ligne. Les autres ne voient que votre nom, @username et avatar ; vous pouvez masquer votre statut en ligne.",
      "Search for a classmate by name or @username (or pick from suggestions) to follow them and see whether they studied today and whether they're online. Others only see your display name, @username and avatar; you can hide your online status.")],
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

/* Sở hữu trí tuệ (28/10, theo chủ dự án). Chỉ nói điều đúng với dự án: đề thi thử
   soạn theo KHUÔN DELF, không chép đề thật; audio luyện nghe là giọng tổng hợp; không
   tuyên bố đã đăng ký bản quyền hay nhãn hiệu ở đâu. */
const HOI_DAP_BAN_QUYEN = () => [
  [tr("Bài tập và đề thi trên FRACILE thuộc về ai?", "À qui appartiennent les exercices et sujets ?", "Who owns the exercises and exams?"),
   tr("Thuộc về FRACILE hoặc giáo viên soạn ra chúng. Trả phí hay đổi XP chỉ mở quyền dùng để tự học, không chuyển quyền sở hữu. Phạm vi đầy đủ ở mục 5 trang Điều khoản sử dụng.",
      "À FRACILE ou aux enseignants qui les ont créés. Payer ou dépenser des XP ouvre un droit d'usage pour apprendre, pas de propriété. Le détail figure à l'article 5 des Conditions d'utilisation.",
      "To FRACILE or the teachers who made them. Paying or spending XP grants a right to use them for study, not ownership. Full scope in section 5 of the Terms of use.")],
  [tr("Tôi có được chia sẻ, chụp lại hay đăng bài tập lên nơi khác không?", "Puis-je partager ou republier les exercices ?", "Can I share or repost the exercises?"),
   tr("Bạn được ghi chép và in ra để tự học. Không được sao chép, chụp màn hình hàng loạt, tải hoặc trích xuất tự động, bán lại, đăng lên mạng xã hội, nhóm học, trang web hay ứng dụng khác, hoặc dùng để soạn tài liệu, khoá học thương mại khi chưa có đồng ý bằng văn bản. Chia sẻ một vài câu để hỏi bài thì được, miễn ghi rõ nguồn FRACILE. Nội dung trả phí thì không được chia sẻ dưới bất kỳ hình thức nào.",
      "Vous pouvez prendre des notes et imprimer pour vous entraîner. Interdit sans accord écrit : copier, faire des captures en masse, télécharger ou extraire automatiquement, revendre, republier sur réseaux sociaux, groupes, sites ou applis, ou s'en servir pour des supports ou cours commerciaux. Citer quelques questions pour demander de l'aide est permis avec la mention FRACILE. Les contenus payants ne se partagent pas.",
      "You may take notes and print for your own study. Without written permission you may not copy, mass-screenshot, download or scrape, resell, repost on social media, groups, websites or apps, or use them for commercial materials or courses. Quoting a few questions to ask for help is fine if you credit FRACILE. Paid content may not be shared in any form.")],
  [tr("Léon là ai, tôi có được dùng hình Léon không?", "Qui est Léon ? Puis-je utiliser son image ?", "Who is Léon? Can I use his image?"),
   tr("Léon là linh vật của FRACILE. Tên, hình vẽ, các sticker và tính cách của Léon là tài sản của FRACILE. Bạn được dùng sticker Léon ngay trong ứng dụng, và chia sẻ ảnh chụp kết quả học có Léon cho bạn bè. Không được cắt hình Léon ra để in ấn, làm sản phẩm, logo, ảnh đại diện cho trang khác, quảng cáo, hay đưa vào công cụ tạo ảnh AI để làm nhân vật giống Léon.",
      "Léon est la mascotte de FRACILE. Son nom, ses dessins, ses stickers et sa personnalité appartiennent à FRACILE. Vous pouvez utiliser ses stickers dans l'appli et partager une capture de vos résultats avec Léon. Interdit : l'extraire pour imprimer, créer des produits, logos, avatars d'autres pages, publicités, ou le soumettre à une IA pour créer un personnage similaire.",
      "Léon is FRACILE's mascot. His name, drawings, stickers and personality belong to FRACILE. You may use Léon stickers inside the app and share screenshots of your results featuring him. You may not extract him for printing, merchandise, logos, avatars for other pages, ads, or feed him to an AI image tool to make a look-alike.")],
  [tr("Đề thi thử có phải đề DELF thật không? FRACILE có liên quan tới DELF chính thức không?", "Les examens blancs sont-ils de vrais sujets DELF ?", "Are mock exams real DELF papers?"),
   tr("Không. Đề thi thử được FRACILE tự soạn theo cấu trúc, thời gian và thang điểm công khai của kỳ thi, không chép nội dung đề thật. DELF và DALF là các bằng do Bộ Giáo dục Pháp cấp, tổ chức qua France Éducation international; FRACILE là dịch vụ luyện thi độc lập, không liên kết và không được các tổ chức này bảo trợ. Tên DELF, DALF chỉ dùng để mô tả kỳ thi bạn đang luyện.",
      "Non. Les examens blancs sont rédigés par FRACILE d'après la structure, la durée et le barème publics de l'examen, sans reprendre de vrais sujets. Le DELF et le DALF sont des diplômes du ministère français de l'Éducation, gérés par France Éducation international ; FRACILE est un service indépendant, sans lien ni parrainage avec ces organismes. Ces noms ne servent qu'à désigner l'examen préparé.",
      "No. Mock exams are written by FRACILE following the exam's public structure, timing and scoring, without copying real papers. DELF and DALF are diplomas of the French Ministry of Education, run by France Éducation international; FRACILE is an independent prep service, not affiliated with or endorsed by them. The names are used only to describe the exam you are preparing for.")],
  [tr("Bài viết, bản ghi âm của tôi thuộc về ai?", "À qui appartiennent mes textes et enregistrements ?", "Who owns my writing and recordings?"),
   tr("Vẫn là của bạn. Khi nộp, bạn cho phép FRACILE lưu và xử lý chúng (kể cả gửi cho dịch vụ AI để chấm, nhận xét, viết bài mẫu) chỉ nhằm phục vụ việc học của chính bạn. FRACILE không đăng công khai hay dùng bài của bạn làm tài liệu cho người khác khi chưa hỏi bạn.",
      "Ils restent à vous. En les envoyant, vous autorisez FRACILE à les stocker et les traiter (y compris via l'IA pour corriger, commenter ou rédiger un modèle) uniquement pour votre apprentissage. FRACILE ne les publie pas et ne les réutilise pas pour d'autres sans vous demander.",
      "They stay yours. By submitting them you let FRACILE store and process them (including sending them to the AI service for grading, feedback or model answers) only for your own learning. FRACILE won't publish them or reuse them for others without asking you.")],
  [tr("Tôi thấy nội dung FRACILE bị đăng lại ở nơi khác, hoặc FRACILE dùng nội dung của tôi?", "Contenu FRACILE republié ailleurs, ou mon contenu utilisé ?", "Found FRACILE content reposted, or my content used?"),
   tr("Hãy gửi email kèm đường dẫn và mô tả ngắn tới địa chỉ ở cuối trang. Nếu bạn là tác giả và cho rằng một nội dung trên FRACILE vi phạm quyền của bạn, chúng tôi sẽ xem xét và gỡ nội dung đó trong lúc xác minh.",
      "Écrivez-nous avec le lien et une brève description à l'adresse en bas de page. Si vous êtes auteur et pensez qu'un contenu FRACILE enfreint vos droits, nous l'examinerons et le retirerons le temps de vérifier.",
      "Email us the link and a short description at the address at the bottom. If you are an author and believe content on FRACILE infringes your rights, we will review it and take it down while we verify.")],
];

/* Giao diện FAQ (28/10, theo apple-design-skill): tiêu đề lớn, ô tìm kiếm đặt ngay đầu
   (tìm kiếm quan trọng thì không giấu), câu hỏi gom thành danh sách nhóm bo góc kiểu
   « inset grouped », mỗi dòng mở/đóng tại chỗ (tiết lộ dần thay vì bày hết chữ). Nhóm
   theo CHỈ SỐ trong HOI_DAP, nên thêm câu mới ở đó thì nhớ xếp vào nhóm ở đây. */
const NHOM_FAQ = () => [
  [tr("Bắt đầu", "Pour commencer", "Getting started"), [0, 1, 13]],
  [tr("Thi thử và chấm bài", "Examens et correction", "Exams and grading"), [2, 3, 4, 5, 6]],
  [tr("Thanh toán, XP và VIP", "Paiement, XP et VIP", "Payment, XP and VIP"), [7, 8, 9]],
  [tr("Học mỗi ngày", "Apprendre au quotidien", "Daily learning"), [10, 11, 12]],
  [tr("Dữ liệu và liên hệ", "Données et contact", "Data and contact"), [14, 15]],
];
const boDau = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

function DongHoi({ hoi, dap, mo, onDoi }) {
  return (
    <li className="border-0 border-t border-solid border-line first:border-t-0">
      <button type="button" onClick={onDoi} aria-expanded={mo}
        className="flex min-h-[48px] w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-4 py-3 text-left font-sans text-[15px] font-semibold text-ink transition-[background-color,transform] duration-150 hover:bg-surface2 active:scale-[0.99] focus-visible:bg-surface2 focus-visible:outline-none">
        <span className="flex-1">{hoi}</span>
        <ChevronRight size={18} aria-hidden className={`shrink-0 text-soft transition-transform duration-200 motion-reduce:transition-none ${mo ? "rotate-90" : ""}`} />
      </button>
      {/* Mở/đóng trượt mượt bằng grid-rows 0fr ↔ 1fr (đo được chiều cao tự nhiên, không cần JS). */}
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.23,1,.32,1)] motion-reduce:transition-none ${mo ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} aria-hidden={!mo}>
        <p className="m-0 min-h-0 overflow-hidden px-4 text-[15px] leading-relaxed text-soft"><span className="block pb-4">{dap}</span></p>
      </div>
    </li>
  );
}

export function TrangFAQ({ trongApp = false }) {
  const [q, setQ] = useState("");
  const [mo, setMo] = useState(() => new Set());
  const hd = HOI_DAP();
  const nhom = [...NHOM_FAQ().map(([ten, ids]) => [ten, ids.map((i) => hd[i]).filter(Boolean)]),
    [tr("Bản quyền và sở hữu trí tuệ", "Droits d'auteur et propriété intellectuelle", "Copyright and intellectual property"), HOI_DAP_BAN_QUYEN()]];
  const k = boDau(q.trim());
  const loc = nhom.map(([ten, ds]) => [ten, k ? ds.filter(([h, d]) => boDau(h).includes(k) || boDau(d).includes(k)) : ds]).filter(([, ds]) => ds.length);
  const doi = (h) => setMo((s) => { const n = new Set(s); n.has(h) ? n.delete(h) : n.add(h); return n; });
  return (
    <Khung trongApp={trongApp} tieuDe={tr("Câu hỏi thường gặp", "Questions fréquentes", "Frequently asked questions")}>
      <label className="flex h-11 items-center gap-2 rounded-xl bg-surface2 px-3 text-soft focus-within:ring-2 focus-within:ring-primary/40">
        <Search size={17} aria-hidden className="shrink-0" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder={tr("Tìm câu hỏi", "Rechercher une question", "Search questions")}
          aria-label={tr("Tìm câu hỏi", "Rechercher une question", "Search questions")}
          className="h-full w-full border-0 bg-transparent font-sans text-[15px] text-ink outline-none placeholder:text-soft" />
      </label>

      {loc.length === 0 && <p className="m-0 py-6 text-center text-[15px] text-soft">{tr(`Không có câu nào khớp « ${q} ».`, `Aucune question ne correspond à « ${q} ».`, `No question matches “${q}”.`)}</p>}

      {loc.map(([ten, ds]) => (
        <section key={ten}>
          <h2 className="m-0 mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-soft">{ten}</h2>
          <ul className="m-0 list-none overflow-hidden rounded-2xl bg-surface p-0 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] ring-1 ring-line">
            {ds.map(([hoi, dap]) => <DongHoi key={hoi} hoi={hoi} dap={dap} mo={!!k || mo.has(hoi)} onDoi={() => doi(hoi)} />)}
          </ul>
        </section>
      ))}

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
        <P>{tr("Một phần điểm do AI chấm hoặc gợi ý, hoặc do chính bạn tự chấm (cách chấm từng phần xem ở trang Câu hỏi thường gặp). Điểm do AI chấm có thể sai, và FRACILE không bảo đảm điểm thi thử khớp với điểm thi thật.",
          "Une partie des notes est donnée ou proposée par l'IA, ou issue de votre auto-évaluation (détails dans la FAQ). Les notes de l'IA peuvent se tromper et FRACILE ne garantit pas qu'une note d'examen blanc corresponde à la note réelle.",
          "Some scores are given or suggested by AI, or come from your own self-assessment (details in the FAQ). AI scores can be wrong, and FRACILE does not guarantee mock scores match real exam scores.")}</P>
      </Muc>

      <Muc ten={tr("4. Thanh toán", "4. Paiement", "4. Payment")}>
        <UL>
          <li>{tr("Một số bài tập là nội dung trả phí, giá hiển thị trên từng bài. Gói VIP có giá và thời hạn ghi rõ khi đăng ký.", "Certains exercices sont payants, prix affiché sur chacun. L'offre VIP indique son prix et sa durée.", "Some exercises are paid, with the price shown on each. VIP shows its price and duration when you sign up.")}</li>
          <li>{tr(<>Thanh toán bằng <strong>chuyển khoản ngân hàng</strong> theo mã QR; nội dung được mở sau khi hệ thống nhận thông báo giao dịch.</>, <>Paiement par <strong>virement bancaire</strong> via QR code ; le contenu s'ouvre à réception de la notification.</>, <>Payment by <strong>bank transfer</strong> via QR code; content unlocks once the payment is confirmed.</>)}</li>
          <li>{tr("Cần giữ nguyên nội dung chuyển khoản để hệ thống nhận ra giao dịch của bạn.", "Ne modifiez pas le libellé du virement pour que le système le reconnaisse.", "Keep the transfer note unchanged so the system can recognise your payment.")}</li>
          <li>{tr("Nếu chuyển nhầm, chuyển thiếu, hoặc đã chuyển mà nội dung chưa mở, hãy liên hệ", "En cas d'erreur, de montant insuffisant ou de contenu non débloqué, contactez", "If you paid the wrong amount or content didn't unlock, contact")} (<LienHe />).</li>
        </UL>
      </Muc>

      <Muc ten={tr("5. Nội dung và sở hữu trí tuệ", "5. Contenus et propriété intellectuelle", "5. Content and intellectual property")}>
        <P>{tr("Bài tập, đề thi thử, bài học ngữ pháp, bộ Flashcard, câu luyện nghe nói, trò chơi, file âm thanh và giao diện FRACILE thuộc quyền của FRACILE hoặc người soạn. Bạn được dùng chúng để tự học; không sao chép, trích xuất tự động, bán lại hoặc đăng lại ở nơi khác khi chưa có đồng ý bằng văn bản. Trả phí hay đổi XP chỉ mở quyền sử dụng, không chuyển quyền sở hữu.", "Exercices, examens blancs, leçons, flashcards, phrases d'écoute et d'oral, jeux, audio et interface appartiennent à FRACILE ou à leurs auteurs. Usage personnel d'apprentissage uniquement ; pas de copie, d'extraction automatique, de revente ni de republication sans accord écrit. Payer ou dépenser des XP ouvre un droit d'usage, pas de propriété.", "Exercises, mock exams, lessons, flashcards, listening and speaking sentences, games, audio and the interface belong to FRACILE or their authors. Use them for your own study only; no copying, scraping, reselling or reposting without written permission. Paying or spending XP grants a right of use, not ownership.")}</P>
        <P>{tr("Linh vật Léon (tên, hình vẽ, sticker) là tài sản của FRACILE, chỉ dùng trong ứng dụng và khi chia sẻ ảnh chụp kết quả học.", "La mascotte Léon (nom, dessins, stickers) appartient à FRACILE ; usage limité à l'appli et aux captures de vos résultats.", "The Léon mascot (name, drawings, stickers) belongs to FRACILE; use is limited to the app and screenshots of your results.")}</P>
        <P>{tr("Đề thi thử do FRACILE tự soạn theo cấu trúc công khai của kỳ thi, không phải đề thật. FRACILE độc lập, không liên kết với France Éducation international hay đơn vị tổ chức DELF, DALF.", "Les examens blancs sont rédigés par FRACILE d'après la structure publique de l'examen, ce ne sont pas de vrais sujets. FRACILE est indépendant de France Éducation international et des organisateurs du DELF et du DALF.", "Mock exams are written by FRACILE from the exam's public structure; they are not real papers. FRACILE is independent of France Éducation international and the DELF and DALF organisers.")}</P>
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
          <li>{tr("Dữ liệu được lưu và xử lý qua Supabase, Vercel, OpenAI (bài viết, bài nói, câu hỏi gửi Leon) và Resend (gửi mail nhắc học), máy chủ có thể đặt ngoài Việt Nam. Dữ liệu được giữ khi tài khoản còn tồn tại hoặc tới khi bạn yêu cầu xoá.", "Les données sont hébergées et traitées via Supabase, Vercel, OpenAI (textes, oraux, questions à Leon) et Resend (e-mails de rappel), parfois hors du Vietnam. Elles sont conservées tant que le compte existe ou jusqu'à votre demande de suppression.", "Data is stored and processed via Supabase, Vercel, OpenAI (writing, speaking, questions to Leon) and Resend (reminder emails), possibly outside Vietnam. It is kept while your account exists or until you ask for deletion.")}</li>
          <li>{tr("Bạn có quyền xem, sửa và yêu cầu xoá dữ liệu của mình.", "Vous pouvez consulter, corriger et demander la suppression de vos données.", "You can view, correct and request deletion of your data.")}</li>
        </UL>
      </Muc>

      <Muc ten={tr("1. Chúng tôi thu những gì", "1. Ce que nous collectons", "1. What we collect")}>
        <P>{tr(<><strong>Tài khoản:</strong> email, tên, tên hiển thị và tên người dùng, ảnh đại diện bạn chọn. Nếu đăng nhập bằng Google, chúng tôi nhận email và tên từ Google.</>, <><strong>Compte :</strong> e-mail, nom, nom affiché, nom d'utilisateur, avatar. Avec Google, nous recevons votre e-mail et votre nom.</>, <><strong>Account:</strong> email, name, display name, username and chosen avatar. With Google sign-in we receive your email and name.</>)}</P>
        <P>{tr(<><strong>Hồ sơ (không bắt buộc):</strong> họ tên, ngày sinh, giới tính, trường, địa chỉ, số điện thoại, trình độ và mục tiêu DELF, chỉ khi bạn tự điền.</>, <><strong>Profil (facultatif) :</strong> nom, date de naissance, genre, établissement, adresse, téléphone, niveau et objectif DELF, seulement si vous les saisissez.</>, <><strong>Profile (optional):</strong> full name, date of birth, gender, school, address, phone, DELF level and goal, only if you fill them in.</>)}</P>
        <P>{tr(<><strong>Việc học:</strong> câu trả lời, điểm, thời gian làm bài, kết quả tự chấm và chấm bằng AI, những ngày bạn học, thời điểm online gần nhất.</>, <><strong>Apprentissage :</strong> réponses, notes, temps passé, auto-évaluations et corrections IA, jours d'étude, dernière connexion.</>, <><strong>Learning:</strong> answers, scores, time spent, self and AI assessments, study days and last time online.</>)}</P>
        <P>{tr(<><strong>Bản ghi âm bài nói:</strong> lưu ở kho riêng tư, chỉ bạn và giáo viên nghe được. Khi bạn bấm « AI nhận xét », hệ thống lưu thêm bản chép lời và nhận xét của AI.</>, <><strong>Enregistrements oraux :</strong> stockés en privé, accessibles à vous et à l'enseignant. Avec « Avis de l'IA », la transcription et l'avis sont aussi conservés.</>, <><strong>Speaking recordings:</strong> stored privately, only you and the teacher can listen. With « AI feedback », the transcript and feedback are stored too.</>)}</P>
        <P>{tr(<><strong>Khi bạn bấm « Gửi câu hỏi »:</strong> họ tên, số điện thoại, năm sinh, email, vai trò, mục tiêu và nội dung câu hỏi, kèm địa chỉ IP để chặn gửi hàng loạt. Chỉ dùng để trả lời bạn.</>, <><strong>Quand vous posez une question :</strong> nom, téléphone, année de naissance, e-mail, rôle, objectif et message, avec l'adresse IP contre les envois massifs. Utilisé uniquement pour vous répondre.</>, <><strong>When you ask a question:</strong> name, phone, birth year, email, role, goal and message, plus the IP address to block spam. Used only to reply to you.</>)}</P>
        <P>{tr(<><strong>Form « Liên hệ » cuối các trang thông tin:</strong> họ tên, email, chủ đề và nội dung, kèm địa chỉ IP để chặn gửi hàng loạt. Được lưu lại và chuyển qua Resend tới hộp thư {EMAIL_LIEN_HE}. Chỉ dùng để trả lời bạn.</>, <><strong>Formulaire « Contact » en bas des pages d'information :</strong> nom, e-mail, sujet et message, avec l'adresse IP contre les envois massifs. Conservés et transmis via Resend à {EMAIL_LIEN_HE}. Utilisés uniquement pour vous répondre.</>, <><strong>The « Contact » form at the bottom of the information pages:</strong> name, email, topic and message, plus the IP address to block spam. Stored and forwarded via Resend to {EMAIL_LIEN_HE}. Used only to reply to you.</>)}</P>
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

      <Muc ten={tr("3. Quyền của bạn", "3. Vos droits", "3. Your rights")}>
        <P>{tr("Bạn có quyền xem, sửa, yêu cầu xoá dữ liệu cá nhân và rút lại sự đồng ý. Nhiều thông tin bạn tự sửa được ở trang Tài khoản; với yêu cầu khác, liên hệ", "Vous pouvez consulter, corriger, faire supprimer vos données et retirer votre consentement. Beaucoup se modifient dans « Mon compte » ; sinon, contactez", "You can view, correct and delete your personal data and withdraw consent. Much of it can be edited in your Account page; otherwise contact")}: <LienHe />.</P>
      </Muc>
    </Khung>
  );
}
