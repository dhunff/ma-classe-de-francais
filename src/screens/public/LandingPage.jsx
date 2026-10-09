import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wand2, ScrollText, Columns2, ClipboardList, ArrowRight, CheckCircle2, Headphones, BookOpen, PenLine, Mic,
  Map, Swords, Layers, Timer, MessageCircle, Sparkles, LogIn,
} from "lucide-react";
import { Leon } from "../../shared/leon.jsx";
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
  const n = Number(so);
  const [hien, setHien] = useState(Number.isFinite(n) ? 0 : so);
  const ref = React.useRef(null);
  useEffect(() => {
    if (!Number.isFinite(n)) { setHien(so); return undefined; }
    const giam = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (giam || !("IntersectionObserver" in window)) { setHien(n); return undefined; }
    let id;
    const ob = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      ob.disconnect();
      const t0 = performance.now();
      const buoc = (t) => { const p = Math.min(1, (t - t0) / 1100); setHien(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) id = requestAnimationFrame(buoc); };
      id = requestAnimationFrame(buoc);
    }, { threshold: 0.4 });
    if (ref.current) ob.observe(ref.current);
    return () => { ob.disconnect(); cancelAnimationFrame(id); };
  }, [so, n]);
  return (
    <div ref={ref} className="rounded-3xl bg-white/10 p-5 text-center ring-1 ring-white/15 backdrop-blur">
      <div className="text-4xl font-extrabold tabular-nums text-white">
        {so == null ? <span className="text-white/50">—</span> : hien}
      </div>
      <div className="mt-1 text-sm font-bold text-white">{nhan}</div>
      {phu && <div className="mt-1 text-xs leading-relaxed text-white/75">{phu}</div>}
    </div>
  );
}

/* Hiện dần khi cuộn tới (tắt khi giảm chuyển động). */
function HienDan({ children, className = "", tre = 0, as: Tag = "div" }) {
  const ref = React.useRef(null);
  const [thay, setThay] = useState(false);
  useEffect(() => {
    const giam = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (giam || !("IntersectionObserver" in window)) { setThay(true); return undefined; }
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setThay(true); ob.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`transition-all duration-700 ease-out ${thay ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className}`}
      style={{ transitionDelay: `${tre}ms` }}>
      {children}
    </Tag>
  );
}

/* Các phần có thật trong sản phẩm (đối chiếu với menu học sinh). */
const TINH_NANG = () => [
  { Icon: Map, ten: tr("Lộ trình học tập", "Parcours", "Learning path"), mo: tr("16 chủ đề xã hội, học từ vựng qua từng màn có sao và thử thách.", "16 thèmes de société, vocabulaire en niveaux avec étoiles et défis.", "16 social topics, vocabulary in levels with stars and challenges."), mau: "from-sky-500 to-blue-600" },
  { Icon: Timer, ten: tr("Thi thử DELF", "Examens blancs DELF", "DELF mock exams"), mo: tr("Đề A1 tới C1 đúng cấu trúc, đồng hồ và lượt nghe như phòng thi.", "Sujets A1 à C1 au bon format, chrono et écoutes comme le jour J.", "A1 to C1 exams in the real format, timed like exam day."), mau: "from-indigo-500 to-violet-600" },
  { Icon: Layers, ten: "Flashcard", mo: tr("Bộ thẻ do giáo viên soạn, ôn theo lịch lặp lại ngắt quãng.", "Paquets créés par les enseignants, révision espacée.", "Teacher-made decks with spaced repetition."), mau: "from-fuchsia-500 to-purple-600" },
  { Icon: Swords, ten: tr("Thách đấu", "Défis", "Duels"), mo: tr("Thách bạn bè 10 câu theo chủ đề từ vựng hoặc ngữ pháp.", "Défiez vos amis sur 10 questions de vocabulaire ou de grammaire.", "Challenge friends on 10 vocabulary or grammar questions."), mau: "from-rose-500 to-orange-500" },
  { Icon: MessageCircle, ten: tr("Hỏi Leon", "Demande à Leon", "Ask Leon"), mo: tr("Trợ lý AI giải thích ngữ pháp, sửa câu tiếng Pháp ngay trong web.", "Assistant IA qui explique la grammaire et corrige vos phrases.", "AI assistant that explains grammar and fixes your sentences."), mau: "from-amber-400 to-orange-500" },
  { Icon: Sparkles, ten: tr("AI chấm bài viết", "Correction IA de l'écrit", "AI writing feedback"), mo: tr("Phiếu nhận xét theo grille DELF: điểm từng tiêu chí, câu viết lại.", "Fiche selon la grille DELF : note par critère, phrases corrigées.", "A DELF-grid sheet: score per criterion and rewritten sentences."), mau: "from-emerald-500 to-teal-600" },
];

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

  const KY_NANG_DELF = [
    ["CO", Headphones, tr("Nghe hiểu", "Compréhension de l'oral", "Listening"), tr("Bài nghe kiểu phòng thi: thời gian đọc câu hỏi, hai lượt nghe, khoảng nghỉ.", "Écoutes comme à l'examen : lecture des questions, deux écoutes, pauses.", "Exam-style audio: reading time, two plays, pauses."), "from-sky-500 to-blue-600"],
    ["CE", BookOpen, tr("Đọc hiểu", "Compréhension des écrits", "Reading"), tr("Văn bản thật, câu hỏi theo đúng dạng đề, đánh dấu chỗ chứa đáp án khi chữa.", "Textes authentiques, questions au format officiel, correction ancrée dans le texte.", "Authentic texts, official question types, answers anchored in the text."), "from-emerald-500 to-teal-600"],
    ["PE", PenLine, tr("Viết", "Production écrite", "Writing"), tr("Chấm theo thang DELF từng trình độ, có nhận xét chi tiết từng tiêu chí.", "Évaluée selon la grille DELF de chaque niveau, critère par critère.", "Assessed on the DELF grid for each level, criterion by criterion."), "from-amber-500 to-orange-600"],
    ["PO", Mic, tr("Nói", "Production orale", "Speaking"), tr("Ghi âm bài nói, nghe lại và nhận nhận xét của AI từ bản chép lời.", "Enregistrez-vous, réécoutez et recevez un avis de l'IA.", "Record yourself, listen back and get AI feedback."), "from-fuchsia-500 to-purple-600"],
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* ── THANH TRÊN ── */}
      <nav className="sticky top-0 z-40 border-0 border-b border-solid border-line/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
          <Link to="/gioi-thieu" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink no-underline">
            <img src="/leon/dau.webp" alt="" width={34} height={34} className="h-[34px] w-[34px] object-contain" />FRACILE<span className="text-primary">.</span>
          </Link>
          <div className="hidden flex-1 items-center gap-6 text-sm font-semibold text-soft md:flex">
            <a href="#tinh-nang" className="text-soft no-underline hover:text-ink">{tr("Tính năng", "Fonctionnalités", "Features")}</a>
            <a href="#ky-nang" className="text-soft no-underline hover:text-ink">{tr("4 kỹ năng DELF", "Les 4 compétences", "The 4 skills")}</a>
            <Link to="/decouvrir" className="text-soft no-underline hover:text-ink">{tr("Thư viện bài tập", "Bibliothèque", "Library")}</Link>
            <Link to="/faq" className="text-soft no-underline hover:text-ink">FAQ</Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-ink no-underline hover:bg-surface2 sm:inline-flex"><LogIn size={15} />{tr("Đăng nhập", "Connexion", "Sign in")}</Link>
            <Link to="/decouvrir" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white no-underline shadow-md shadow-primary/30 transition-transform hover:-translate-y-0.5">{tr("Học thử", "Essayer", "Try it")} <ArrowRight size={14} /></Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="relative overflow-hidden">
        <span aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -right-32 top-20 h-[24rem] w-[24rem] rounded-full bg-indigo-400/15 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgb(var(--mcf-line-rgb))_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-10 pt-12 lg:grid-cols-2 lg:pt-16">
          <div className="mcf-cau-vao">
            <span className="inline-flex items-center gap-2 rounded-full border border-solid border-primary/25 bg-primary-soft px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />{tr("Luyện thi DELF · A1 tới C1", "Préparation DELF · A1 à C1", "DELF prep · A1 to C1")}
            </span>
            <h1 className="m-0 mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-6xl" style={{ textWrap: "balance" }}>
              {tr("Bứt phá điểm số DELF", "Boostez votre score au DELF", "Boost your DELF score")}{" "}
              <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">{tr("với hệ thống luyện thi toàn diện", "avec une préparation complète", "with complete exam preparation")}</span>
            </h1>
            <p className="m-0 mt-5 max-w-xl text-base leading-relaxed text-soft sm:text-lg">
              {tr("Không chỉ là một kho bài tập. FRACILE mang đến lộ trình thực hành sát với đề thi thật, chấm tự động và đối chiếu theo đúng thang chấm DELF chính thức. Giải pháp hoàn hảo giúp học viên tự tin thi đỗ, và giúp giáo viên tối ưu hóa chất lượng giảng dạy.", "Bien plus qu'une banque d'exercices : FRACILE propose un parcours proche du vrai examen, corrigé automatiquement selon la grille officielle du DELF. Pour réussir sereinement, et pour mieux enseigner.", "More than an exercise bank: FRACILE offers practice that mirrors the real exam, graded automatically against the official DELF grid. Pass with confidence, and teach better.")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/decouvrir"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 px-7 py-3.5 text-sm font-extrabold text-white no-underline shadow-[0_14px_30px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(37,99,235,0.45)] motion-reduce:transition-none">
                {tr("Trải nghiệm học thử ngay", "Essayer maintenant", "Try it now")} <ArrowRight size={16} />
              </Link>
              <button type="button" onClick={() => setIsContactFormOpen(true)}
                className="cursor-pointer rounded-2xl border border-solid border-line bg-surface px-7 py-3.5 font-sans text-sm font-bold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 motion-reduce:transition-none">
                {tr("Gửi câu hỏi", "Poser une question", "Ask a question")}
              </button>
            </div>
            <ul className="m-0 mt-7 grid list-none gap-2 p-0 text-sm font-semibold text-ink sm:grid-cols-2">
              {[tr("Chấm theo thang DELF chính thức", "Grille officielle du DELF", "Official DELF grid"), tr("Nghe kiểu phòng thi", "Écoutes comme à l'examen", "Exam-style listening"), tr("AI nhận xét bài viết, bài nói", "Avis IA sur l'écrit et l'oral", "AI feedback on writing and speaking"), tr("Ba ngôn ngữ: Việt, Pháp, Anh", "Trois langues : vietnamien, français, anglais", "Three languages: Vietnamese, French, English")].map((x) => (
                <li key={x} className="flex items-center gap-2"><CheckCircle2 size={17} className="shrink-0 text-ok" />{x}</li>
              ))}
            </ul>
          </div>
          <LeonMoi src={imgSrc} />
        </div>
      </header>

      {/* ── SỐ LIỆU — ĐẾM THẬT ── */}
      <section className="px-5">
        <HienDan className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-primary to-indigo-600 p-6 shadow-[0_24px_60px_rgba(37,99,235,0.3)] sm:p-8">
          <span aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OSoLieu so={so?.baiTap} nhan={tr("Chuyên đề trọng tâm", "Thèmes clés", "Key topics")} phu={tr("Được phân bổ khoa học, bám sát lộ trình từ cơ bản đến nâng cao.", "Organisés progressivement, du niveau débutant au niveau avancé.", "Organised step by step, from beginner to advanced.")} />
            <OSoLieu so={so?.cauHoi} nhan={tr("Bài tập thực hành", "Exercices", "Practice exercises")} phu={tr("Đa dạng thể loại, phần lớn câu đi kèm lời giải thích cặn kẽ.", "Formats variés, la plupart avec une explication détaillée.", "Varied formats, most with a detailed explanation.")} />
            <OSoLieu so="4" nhan={tr("Kỹ năng toàn diện", "Toutes les compétences", "All skills")} phu={tr("Rèn luyện đồng đều Nghe - Nói - Đọc - Viết để không có kỹ năng nào bị bỏ lại.", "Compréhension orale, écrite, production orale et écrite : aucune compétence oubliée.", "Listening, speaking, reading and writing: no skill left behind.")} />
            <OSoLieu so="1" nhan={tr("Nền tảng duy nhất", "Une seule plateforme", "One platform")} phu={tr("Kết nối liền mạch giữa việc tự học của học sinh và công tác quản lý của giáo viên.", "Le travail des élèves et le suivi des enseignants au même endroit.", "Student self-study and teacher management in one place.")} />
          </div>
          <p className="relative m-0 mt-4 text-center text-xs text-white/70">
            {tr("Số liệu đọc trực tiếp từ hệ thống, không phải con số quảng cáo.", "Chiffres lus en direct dans le système, pas des chiffres marketing.", "Figures read live from the system, not marketing numbers.")}
          </p>
        </HienDan>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        {/* ── LỢI THẾ ── */}
        <section className="mt-24">
          <HienDan>
            <p className="m-0 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{tr("Vì sao chọn FRACILE", "Pourquoi FRACILE", "Why FRACILE")}</p>
            <h2 className="m-0 mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl" style={{ textWrap: "balance" }}>
              {tr("Bốn thứ khó tìm ở chỗ khác", "Quatre atouts difficiles à trouver ailleurs", "Four things that are hard to find elsewhere")}
            </h2>
          </HienDan>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {LOI_THE().map(({ Icon, ten, mo }, i) => (
              <HienDan key={ten} tre={i * 90}
                className="group relative overflow-hidden rounded-3xl border border-solid border-line bg-surface p-7 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                <span aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
                <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-md">
                  <Icon size={22} />
                </div>
                <h3 className="relative m-0 mt-5 text-lg font-extrabold text-ink">{ten}</h3>
                <p className="relative m-0 mt-2 text-sm leading-relaxed text-soft">{mo}</p>
              </HienDan>
            ))}
          </div>
        </section>

        {/* ── BỐN KỸ NĂNG ── */}
        <section id="ky-nang" className="mt-24 scroll-mt-24">
          <HienDan className="text-center">
            <p className="m-0 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">DELF</p>
            <h2 className="m-0 mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{tr("Đủ bốn kỹ năng của kỳ thi", "Les quatre compétences de l'examen", "All four exam skills")}</h2>
          </HienDan>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KY_NANG_DELF.map(([ma, Icon, ten, mo, mau], i) => (
              <HienDan key={ma} tre={i * 80} className="rounded-3xl border border-solid border-line bg-surface p-6 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${mau} text-white shadow-md`}><Icon size={22} /></span>
                  <span className="text-2xl font-extrabold text-ink">{ma}</span>
                </div>
                <h3 className="m-0 mt-4 text-base font-extrabold text-ink">{ten}</h3>
                <p className="m-0 mt-1.5 text-sm leading-relaxed text-soft">{mo}</p>
              </HienDan>
            ))}
          </div>
        </section>

        {/* ── TÍNH NĂNG ── */}
        <section id="tinh-nang" className="mt-24 scroll-mt-24">
          <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
            <HienDan>
              <p className="m-0 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{tr("Bên trong FRACILE", "Dans FRACILE", "Inside FRACILE")}</p>
              <h2 className="m-0 mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl" style={{ textWrap: "balance" }}>{tr("Học đều mỗi ngày mà không thấy chán", "Apprendre chaque jour sans s'ennuyer", "Study every day without getting bored")}</h2>
            </HienDan>
            <HienDan tre={150} className="hidden lg:block"><Leon cam="hoc" size={120} className="mcf-leon-bay" /></HienDan>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TINH_NANG().map(({ Icon, ten, mo, mau }, i) => (
              <HienDan key={ten} tre={i * 70} className="group flex gap-4 rounded-3xl border border-solid border-line bg-surface p-5 hover:-translate-y-1 hover:shadow-lg">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${mau} text-white shadow-md transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110`}><Icon size={22} /></span>
                <div className="min-w-0">
                  <h3 className="m-0 text-base font-extrabold text-ink">{ten}</h3>
                  <p className="m-0 mt-1 text-sm leading-relaxed text-soft">{mo}</p>
                </div>
              </HienDan>
            ))}
          </div>
        </section>

        <TeamSection />

        {/* ── LỜI MỜI CUỐI TRANG ── */}
        <HienDan as="section" className="relative mt-24 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-primary to-sky-500 p-8 text-white shadow-[0_24px_60px_rgba(37,99,235,0.3)] sm:p-12">
          <span aria-hidden className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <span aria-hidden className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-sky-300/20 blur-2xl" />
          <div className="relative flex flex-wrap items-center gap-8">
            <div className="min-w-0 flex-1">
              <h2 className="m-0 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ textWrap: "balance" }}>{tr("Sẵn sàng cho kỳ DELF của bạn?", "Prêt pour votre DELF ?", "Ready for your DELF?")}</h2>
              <p className="m-0 mt-3 max-w-xl text-base text-white/85">{tr("Làm thử một bài ngay, không cần tài khoản. Tạo tài khoản khi bạn muốn lưu tiến độ.", "Essayez un exercice tout de suite, sans compte. Créez-en un pour garder vos progrès.", "Try an exercise right now, no account needed. Sign up when you want to save progress.")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/decouvrir" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-primary no-underline shadow-lg transition-transform hover:-translate-y-0.5">{tr("Học thử miễn phí", "Essayer gratuitement", "Try for free")} <ArrowRight size={16} /></Link>
                <Link to="/login" className="inline-flex items-center gap-2 rounded-2xl border border-solid border-white/40 px-6 py-3 text-sm font-bold text-white no-underline transition-colors hover:bg-white/10">{tr("Đăng nhập", "Connexion", "Sign in")}</Link>
              </div>
            </div>
            <Leon cam="phap" size={170} className="mcf-leon-bay shrink-0 drop-shadow-[0_16px_24px_rgba(0,0,0,0.3)] max-sm:hidden" />
          </div>
        </HienDan>
      </div>

      {/* ── CHÂN TRANG ── */}
      <footer className="mt-24 bg-primary px-6 pb-8 pt-12 text-white dark:bg-[#0e1526]">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="flex items-center gap-2 text-xl font-extrabold"><img src="/leon/dau.webp" alt="" width={36} height={36} className="h-9 w-9 object-contain" />FRACILE</span>
            <p className="m-0 mt-3 max-w-sm text-sm leading-relaxed text-blue-100">{tr("Nền tảng luyện thi DELF cho học sinh và giáo viên Việt Nam.", "La plateforme de préparation au DELF pour les élèves et enseignants au Vietnam.", "The DELF prep platform for students and teachers in Vietnam.")}</p>
          </div>
          <div className="grid content-start gap-2 text-sm">
            <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-blue-200">{tr("Sản phẩm", "Produit", "Product")}</p>
            {[["/decouvrir", tr("Thư viện bài tập", "Bibliothèque d'exercices", "Exercise library")], ["/login", tr("Đăng nhập", "Connexion", "Sign in")]].map(([to, ten]) => (
              <Link key={to} to={to} className="text-white no-underline transition-colors hover:text-blue-100">{ten}</Link>
            ))}
          </div>
          <div className="grid content-start gap-2 text-sm">
            <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-blue-200">{tr("Hỗ trợ", "Aide", "Support")}</p>
            {[["/faq", tr("Câu hỏi thường gặp", "Questions fréquentes", "FAQ")], ["/dieu-khoan", tr("Điều khoản sử dụng", "Conditions d'utilisation", "Terms of use")], ["/bao-mat", tr("Chính sách bảo mật", "Politique de confidentialité", "Privacy policy")]].map(([to, ten]) => (
              <Link key={to} to={to} className="text-white no-underline transition-colors hover:text-blue-100">{ten}</Link>
            ))}
          </div>
        </div>
        <p className="m-0 mx-auto mt-10 max-w-6xl border-0 border-t border-solid border-white/15 pt-6 text-sm text-blue-100">© 2026 FRACILE</p>
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

/* Leon mời khách vào web (09/10, theo chủ dự án): GIỮ ảnh chụp màn hình,
   Leon cỡ lớn đứng chồng ở góc phải dưới như đang mời vào, kèm bong bóng lời. */
function LeonMoi({ src }) {
  return (
    <div className="relative pb-24 sm:pb-16 lg:pb-20">
      <AnhHero src={src} />
      <div className="pointer-events-none absolute -bottom-6 right-0 flex items-end 2xl:-right-12">
        <Link to="/decouvrir"
          className="mcf-leon-vao-bong group pointer-events-auto relative z-10 mb-44 -mr-6 max-w-[13rem] rounded-3xl rounded-br-md bg-surface px-4 py-3 text-ink no-underline shadow-[0_18px_40px_rgb(0,0,0,0.15)] sm:mb-52">
          <span className="block text-base font-extrabold"><em>Bonjour !</em> 🐾</span>
          <span className="mt-0.5 block text-[13px] leading-snug text-soft">{tr("Mình là Leon. Vào học thử cùng mình nhé!", "Moi, c'est Leon. Viens essayer avec moi !", "I'm Leon. Come and try it with me!")}</span>
          <span className="mt-1.5 inline-flex items-center gap-1 text-sm font-bold text-primary">{tr("Vào thôi", "C'est parti", "Let's go")} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
        </Link>
        <img src="/leon/leon-lon.webp" alt={tr("Leon, linh vật của FRACILE, đang chào bạn", "Leon, la mascotte de FRACILE, vous accueille", "Leon, FRACILE's mascot, welcomes you")}
          width={260} height={300} className="mcf-leon-bay h-[230px] w-auto object-contain drop-shadow-[0_16px_24px_rgb(0,0,0,0.18)] sm:h-[300px]" />
      </div>
    </div>
  );
}
