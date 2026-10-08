import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wand2, ScrollText, Columns2, ClipboardList, ArrowRight,
} from "lucide-react";
import { docSoLieu } from "../../shared/soLieuCongKhai.js";
import TeamSection from "./TeamSection.jsx";
import ContactDrawer from "./ContactDrawer.jsx";
import { tr } from "../../shared/i18n.jsx";

/* Trang giới thiệu công khai — phễu marketing của FRACILE.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * BA CON SỐ TRONG BẢN MÔ TẢ KHÔNG CÓ THẬT, VÀ TÔI KHÔNG VIẾT CHÚNG
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Bản mô tả đề nghị: « 500+ Bài tập », « 10.000+ Câu hỏi », « Hàng ngàn bài
 * được chấm ». Đo trên database production ngày 03/09:
 *
 *     bài tập      34        (không phải 500+)
 *     câu hỏi     373        (không phải 10.000+)
 *     lượt đã chấm 43        (không phải hàng ngàn)
 *
 * Quy tắc 1 của dự án — không bịa dữ liệu — viết cho màn hình của học sinh.
 * Nó áp cho trang bán hàng MẠNH HƠN, không phải yếu hơn: ở đây con số dùng để
 * lấy tiền của người khác. Một người đăng ký vì « 500+ bài tập » rồi đếm được
 * 34 bài sẽ không quay lại, và họ có lý.
 *
 * Nên trang này ĐẾM THẬT, đọc thẳng từ máy chủ lúc tải trang. Số nhỏ thì nhỏ,
 * nhưng nó tự lớn lên khi thư viện lớn lên, và không ai phải nhớ sửa.
 *
 * ══ VÀ HAI TÍNH NĂNG KHÔNG TỒN TẠI ══
 *
 * « AI chấm nhanh » — FRACILE KHÔNG có AI chấm. `evaluateEssayWithAI()` trả về
 * `connected: false`, và KHÔNG chỗ nào trong mã gọi tới nó. Không Edge
 * Function LLM, không thư viện nào.
 *
 * « Nhập đề từ DOCX » — chỉ có JSON. Không có dòng mã nào đọc .docx.
 *
 * ══ VÀ MỘT LỜI HỨA ĐÃ PHẢI RÚT — 03/09 ══
 *
 * Bản đầu của trang này viết « Luyện thi DELF cùng giáo viên thật · Bài nào
 * cũng được chấm », và một thẻ lợi thế nói bài viết được « một giáo viên đọc,
 * cho điểm theo thang DELF ». Chủ dự án xác nhận: KHÔNG phải vậy — anh không
 * chấm bài, và phần đó do một công cụ AI bên ngoài xử lý.
 *
 * Nên cả hai câu bị gỡ, và KHÔNG thay bằng « AI chấm »: sản phẩm không làm
 * việc đó. Người đọc trang thấy chữ AI sẽ chờ một phản hồi tự động trong app,
 * và họ sẽ không nhận được.
 *
 * Thứ thay vào là thứ có thật và đo được: chấm tự động phần khách quan ở Edge
 * Function `grade`, và thang chấm DELF sáu tiêu chí để học sinh tự đối chiếu
 * (PESelfEvaluation + grilleRubric). Cái sau vẫn là một khác biệt thật — đối
 * thủ trả về điểm, còn ở đây người học thấy mình mất điểm ở tiêu chí nào.
 *
 * ══ FORM LIÊN HỆ: GỠ 03/09, BẬT LẠI 25/09 ══
 *
 * Nay là ngăn kéo « Gửi câu hỏi » (ContactDrawer.jsx), gửi thật qua RPC
 * `gui_lien_he`. Chính sách bảo mật (/bao-mat) dựng lại cùng ngày, có mục cho form này.
 */

/* Bốn ô số liệu. Ba ô đầu ĐẾM THẬT; ô thứ tư là một sự thật không phải con số
   — và nó mới là thứ phân biệt FRACILE với một cái kho bài tập. */
function OSoLieu({ so, nhan, phu }) {
  return (
    <div className="rounded-2xl border border-solid border-line bg-surface p-5 text-center">
      <div className="text-3xl font-extrabold tabular-nums text-ink">
        {so ?? <span className="text-soft">—</span>}
      </div>
      <div className="mt-1 text-sm font-bold text-ink">{nhan}</div>
      {phu && <div className="mt-0.5 text-xs text-soft">{phu}</div>}
    </div>
  );
}

/* Nội dung chủ dự án chốt 25/09. Ba chỗ được chỉnh cho khớp sản phẩm thật
   (quy tắc 1) — xem commit « Trang giới thiệu: nội dung mới ». */
/* Hàm chứ không hằng: chữ phải đổi theo ngôn ngữ đang chọn (08/10). */
const LOI_THE = () => [
  { Icon: Wand2, ten: tr("Hệ thống chấm điểm tự động, trả kết quả tức thì", "Correction automatique, résultats immédiats", "Automatic grading, instant results"),
    mo: tr("Không còn phải chờ đợi mỏi mòn để biết mình làm đúng hay sai. Các dạng bài từ trắc nghiệm, điền từ cho đến chia động từ đều được hệ thống xử lý và chấm điểm ngay lập tức sau cú click nộp bài. Điều này giúp học viên nhanh chóng nhận ra lỗi sai để khắc phục, đồng thời giúp giáo viên loại bỏ hoàn toàn gánh nặng chấm bài thủ công.",
      "Plus besoin d'attendre pour savoir si vous avez juste. QCM, textes à trous, conjugaison : tout est corrigé dès que vous cliquez sur « Rendre ». Les apprenants repèrent vite leurs erreurs, et les enseignants n'ont plus à corriger à la main.",
      "No more waiting to find out if you got it right. Multiple choice, gap fills and conjugation are graded the moment you submit. Learners spot their mistakes fast, and teachers no longer grade by hand.") },
  { Icon: ScrollText, ten: tr("Chữa bài Viết minh bạch, biết rõ điểm yếu", "Une correction de l'écrit transparente", "Transparent writing feedback"),
    mo: tr("Sợ nhất là nhận về một con số điểm vô hồn và không biết mình sai ở đâu. Tại FRACILE, bài Viết được chấm theo thang điểm DELF chính thức (từ vựng, ngữ pháp, độ mạch lạc, đáp ứng đề bài), tiêu chí nào cũng có mô tả từng mức điểm. Học viên biết chính xác mình mất điểm ở tiêu chí nào để lập tức cải thiện.",
      "Rien de pire qu'une note sans explication. Sur FRACILE, la production écrite est évaluée avec la grille officielle du DELF (lexique, grammaire, cohérence, respect de la consigne), avec un descriptif pour chaque niveau. L'apprenant sait exactement où il perd des points.",
      "Nothing is worse than a bare score with no explanation. On FRACILE, writing is assessed against the official DELF grid (vocabulary, grammar, coherence, task completion), with a description for every band. Learners know exactly where they lose points.") },
  { Icon: Columns2, ten: tr("Rèn luyện bản lĩnh áp lực phòng thi thật", "S'entraîner dans les conditions de l'examen", "Train under real exam pressure"),
    mo: tr("Điểm số lúc luyện tập luôn cao hơn đi thi vì bạn thiếu áp lực thời gian. FRACILE áp dụng bộ đếm ngược nghiêm ngặt và giới hạn số lượt phát âm thanh y như kỳ thi thực tế. Trải nghiệm làm bài được tối ưu hóa sự tập trung, giúp học viên không bị bỡ ngỡ khi bước vào phòng thi chính thức.",
      "On a toujours de meilleures notes à l'entraînement, faute de pression du temps. FRACILE applique un chronomètre strict et limite les écoutes comme à l'examen. Rien ne surprend le jour J.",
      "Practice scores are always higher than exam scores because there's no time pressure. FRACILE uses a strict countdown and limits audio plays just like the real exam, so nothing surprises you on the day.") },
  { Icon: ClipboardList, ten: tr("Quản lý tiến độ học tập sát sao, hiệu quả", "Un suivi des progrès rigoureux", "Close, effective progress tracking"),
    mo: tr("Cung cấp một chu trình khép kín: Giao bài tập, Hẹn giờ nộp, Chấm điểm, Báo cáo thống kê. Giáo viên và trung tâm dễ dàng theo dõi được sự tiến bộ của từng cá nhân qua từng tuần, từ đó cam kết được chất lượng đầu ra với phụ huynh và học viên.",
      "Un cycle complet : devoirs, échéances, correction, statistiques. Enseignants et centres suivent les progrès de chacun semaine après semaine.",
      "A complete loop: assignments, deadlines, grading, statistics. Teachers and schools follow each learner's progress week by week.") },
];


export default function LandingPage({ imgSrc = "/images/hero-preview.png" }) {
  const [so, setSo] = useState(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  useEffect(() => {
    let con = true;
    docSoLieu().then((v) => { if (con) setSo(v); });
    return () => { con = false; };
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:pt-10">

        {/* ── HERO ── */}
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="m-0 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              {tr("Bứt phá điểm số DELF", "Boostez votre score au DELF", "Boost your DELF score")}{" "}
              <span className="text-primary">{tr("với hệ thống luyện thi toàn diện", "avec une préparation complète", "with complete exam preparation")}</span>
            </h1>
            <p className="m-0 mt-5 max-w-xl text-base leading-relaxed text-soft">
              {tr("Không chỉ là một kho bài tập. FRACILE mang đến lộ trình thực hành sát với đề thi thật, chấm tự động và đối chiếu theo đúng thang chấm DELF chính thức. Giải pháp hoàn hảo giúp học viên tự tin thi đỗ, và giúp giáo viên tối ưu hóa chất lượng giảng dạy.", "Bien plus qu'une banque d'exercices : FRACILE propose un parcours proche du vrai examen, corrigé automatiquement selon la grille officielle du DELF. Pour réussir sereinement, et pour mieux enseigner.", "More than an exercise bank: FRACILE offers practice that mirrors the real exam, graded automatically against the official DELF grid. Pass with confidence, and teach better.")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/decouvrir"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white no-underline shadow-lg shadow-primary/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/40 active:scale-[0.98] motion-reduce:transition-none">
                {tr("Trải nghiệm học thử ngay", "Essayer maintenant", "Try it now")} <ArrowRight size={16} />
              </Link>
              <button type="button" onClick={() => setIsContactFormOpen(true)}
                className="cursor-pointer font-sans rounded-full border border-solid border-line bg-transparent px-6 py-3 text-sm font-bold text-ink no-underline transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-surface2 active:scale-[0.98] motion-reduce:transition-none">
                {tr("Gửi câu hỏi", "Poser une question", "Ask a question")}
              </button>
            </div>
          </div>

          <AnhHero src={imgSrc} />
        </section>

        {/* ── SỐ LIỆU — ĐẾM THẬT ── */}
        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OSoLieu so={so?.baiTap} nhan={tr("Chuyên đề trọng tâm", "Thèmes clés", "Key topics")} phu={tr("Được phân bổ khoa học, bám sát lộ trình từ cơ bản đến nâng cao.", "Organisés progressivement, du niveau débutant au niveau avancé.", "Organised step by step, from beginner to advanced.")} />
          <OSoLieu so={so?.cauHoi} nhan={tr("Bài tập thực hành", "Exercices", "Practice exercises")} phu={tr("Đa dạng thể loại, phần lớn câu đi kèm lời giải thích cặn kẽ.", "Formats variés, la plupart avec une explication détaillée.", "Varied formats, most with a detailed explanation.")} />
          <OSoLieu so="4" nhan={tr("Kỹ năng toàn diện", "Toutes les compétences", "All skills")} phu={tr("Rèn luyện đồng đều Nghe - Nói - Đọc - Viết để không có kỹ năng nào bị bỏ lại.", "Compréhension orale, écrite, production orale et écrite : aucune compétence oubliée.", "Listening, speaking, reading and writing: no skill left behind.")} />
          <OSoLieu so="1" nhan={tr("Nền tảng duy nhất", "Une seule plateforme", "One platform")} phu={tr("Kết nối liền mạch giữa việc tự học của học sinh và công tác quản lý của giáo viên.", "Le travail des élèves et le suivi des enseignants au même endroit.", "Student self-study and teacher management in one place.")} />
        </section>

        {so === null && (
          <p className="m-0 mt-3 text-center text-xs text-soft">
            {tr("Số liệu đọc trực tiếp từ hệ thống, không phải con số quảng cáo.", "Chiffres lus en direct dans le système, pas des chiffres marketing.", "Figures read live from the system, not marketing numbers.")}
          </p>
        )}

        {/* ── LỢI THẾ ── */}
        <section className="mt-20">
          <h2 className="m-0 text-2xl font-extrabold tracking-tight text-ink">
            {tr("Bốn thứ khó tìm ở chỗ khác", "Quatre atouts difficiles à trouver ailleurs", "Four things that are hard to find elsewhere")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {LOI_THE().map(({ Icon, ten, mo }) => (
              <div key={ten}
                className="rounded-3xl border border-solid border-line bg-surface p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl motion-reduce:transition-none">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="m-0 mt-4 text-lg font-bold text-ink">{ten}</h3>
                <p className="m-0 mt-2 text-sm leading-relaxed text-soft">{mo}</p>
              </div>
            ))}
          </div>
        </section>

        <TeamSection />

      </div>

      {/* ── CHÂN TRANG — dải xanh thương hiệu, cùng nền với thanh bên
          (bg-primary / dark:#0e1526 như AppLayout), chữ trắng. ── */}
      <footer className="mt-20 bg-primary px-6 py-8 dark:bg-[#0e1526]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-base font-medium">
            <span className="flex items-center gap-2 text-lg font-extrabold text-white"><img src="/leon/dau.webp" alt="" width={32} height={32} className="h-8 w-8 object-contain" />FRACILE</span>
            {[["/decouvrir", tr("Thư viện bài tập", "Bibliothèque d'exercices", "Exercise library")], ["/login", tr("Đăng nhập", "Connexion", "Sign in")], ["/faq", tr("Câu hỏi thường gặp", "Questions fréquentes", "FAQ")], ["/dieu-khoan", tr("Điều khoản sử dụng", "Conditions d'utilisation", "Terms of use")], ["/bao-mat", tr("Chính sách bảo mật", "Politique de confidentialité", "Privacy policy")]].map(([to, ten]) => (
              <Link key={to} to={to} className="text-white no-underline transition-colors hover:text-blue-100">{ten}</Link>
            ))}
          </div>
          <p className="m-0 text-sm text-blue-100">© 2026 FRACILE</p>
        </div>
      </footer>

      <ContactDrawer isOpen={isContactFormOpen} onClose={() => setIsContactFormOpen(false)} />
    </div>
  );
}

/* Ảnh màn hình sản phẩm, đặt ở public/images/hero-preview.png. File chưa có
   (hoặc hỏng) thì KHÔNG hiện gì — một biểu tượng ảnh vỡ, hay một dòng nhắn
   cho người làm web, đều không nên lọt tới khách. */
function AnhHero({ src }) {
  const [hong, setHong] = useState(false);
  if (hong) return null;
  return (
    <img src={src} alt={tr("Màn hình luyện thi DELF của FRACILE", "Écran d'entraînement DELF de FRACILE", "FRACILE DELF practice screen")} onError={() => setHong(true)}
      className="w-full rounded-2xl border border-solid border-line object-cover shadow-2xl transition-transform duration-300 hover:scale-[1.01] motion-reduce:transition-none" />
  );
}
