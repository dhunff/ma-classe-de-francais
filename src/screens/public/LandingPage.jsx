import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wand2, ArrowRight, CheckCircle2, Headphones, BookOpen, PenLine, Mic,
  Map, Swords, Layers, Timer, MessageCircle, LogIn, BookA, Gamepad2, Search,
}from "lucide-react";
import { Leon } from "../../shared/leon.jsx";
import { docSoLieu } from "../../shared/soLieuCongKhai.js";
import TeamSection from "./TeamSection.jsx";
import ContactDrawer from "./ContactDrawer.jsx";
import { tr } from "../../shared/i18n.jsx";
import { useSeo } from "../../shared/seo.js";

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
 * (06/11: nay đã có AI chấm thật, qua Edge Function cham-pe và nhan-xet-noi, nên trang viết
 * « AI chấm bài viết, bài nói ». Trang làm lại cùng ngày: thanh trên còn ba mục, ảnh chụp lại.)
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

/* Các phần có thật trong sản phẩm (đối chiếu với menu học sinh). Viết lại 06/11: bỏ « do giáo viên
   soạn », thêm lời nghe và phân tích (VIP), trò chơi. */
const TINH_NANG = () => [
  { Icon: Map, ten: tr("Lộ trình từ vựng", "Parcours de vocabulaire", "Vocabulary path"), mo: tr("Học từ vựng theo chủ đề qua từng màn, có sao và thử thách.", "Le vocabulaire par thèmes, niveau après niveau, avec étoiles et défis.", "Vocabulary by topic, level by level, with stars and challenges."), mau: "from-sky-500 to-blue-600" },
  { Icon: Layers, ten: "Flashcard", mo: tr("Ôn thẻ theo lịch lặp lại ngắt quãng: thẻ sắp quên sẽ quay lại đúng lúc.", "Révision espacée : les cartes reviennent juste avant l'oubli.", "Spaced repetition: cards come back right before you forget them."), mau: "from-fuchsia-500 to-purple-600" },
  { Icon: Headphones, ten: tr("Lời nghe và phân tích", "Transcription et analyse", "Transcripts and analysis"), mo: tr("Làm xong bài nghe, xem lại lời nghe, chủ đề và chỗ chứa đáp án (VIP).", "Après l'écoute : transcription, thème et passages des réponses (VIP).", "After listening: transcript, topic and where each answer is (VIP)."), mau: "from-emerald-500 to-teal-600" },
  { Icon: MessageCircle, ten: tr("Hỏi Léon", "Demande à Léon", "Ask Léon"), mo: tr("Trợ lý AI giải thích ngữ pháp và sửa câu tiếng Pháp ngay trong web.", "Assistant IA qui explique la grammaire et corrige vos phrases.", "AI assistant that explains grammar and fixes your sentences."), mau: "from-amber-400 to-orange-500" },
  { Icon: Swords, ten: tr("Thách đấu", "Défis", "Duels"), mo: tr("Thách bạn bè 10 câu từ vựng hoặc ngữ pháp, xem ai nhanh hơn.", "Défiez vos amis sur 10 questions de vocabulaire ou de grammaire.", "Challenge friends on 10 vocabulary or grammar questions."), mau: "from-rose-500 to-orange-500" },
  { Icon: Gamepad2, ten: tr("Trò chơi", "Jeux", "Games"), mo: tr("Trò chơi ngắn để ôn từ, giống và chính tả mà không thấy chán.", "Des jeux courts pour réviser le vocabulaire, le genre et l'orthographe.", "Short games to review vocabulary, gender and spelling."), mau: "from-indigo-500 to-violet-600" },
];

/* Ba bước học trên FRACILE (06/11): đúng thứ tự người học đi trong sản phẩm, nên đánh số. */
const BUOC = () => [
  { Icon: Map, ten: tr("Chọn trình độ, đi từng bước nhỏ", "Choisissez votre niveau, avancez pas à pas", "Pick your level, go step by step"),
    mo: tr("Làm bài kiểm tra xếp trình độ hoặc tự chọn từ A1 đến C1. Mỗi kỹ năng chia thành kỹ năng nhỏ, xong bước này thì bước sau tự mở.", "Faites le test de niveau ou choisissez de A1 à C1. Chaque compétence est découpée en petites étapes qui s'ouvrent l'une après l'autre.", "Take the placement test or pick from A1 to C1. Each skill is split into small steps that unlock one after another.") },
  { Icon: Wand2, ten: tr("Luyện đúng dạng đề, chấm ngay", "Entraînez-vous au format de l'examen", "Practise the exam format, graded instantly"),
    mo: tr("Mỗi bài là một phần của đề DELF thật, chấm ngay khi nộp, có lời giải bằng tiếng Việt. Bài viết, bài nói có AI nhận xét theo thang điểm chính thức.", "Chaque exercice reprend une partie du vrai DELF, corrigé dès l'envoi, expliqué en vietnamien. L'écrit et l'oral sont évalués par l'IA selon la grille officielle.", "Each exercise mirrors a real DELF task, graded on submission and explained in Vietnamese. Writing and speaking get AI feedback on the official grid.") },
  { Icon: Timer, ten: tr("Thi thử khi đã sẵn sàng", "Passez un examen blanc", "Sit a mock exam when ready"),
    mo: tr("Đề DELF A1 đến DALF C1 đủ bốn kỹ năng: đồng hồ đếm ngược, giới hạn lượt nghe, điểm quy về thang và ngưỡng đạt như kỳ thi thật.", "Du DELF A1 au DALF C1, les quatre épreuves : chronomètre, écoutes limitées, note et seuils comme à l'examen.", "DELF A1 to DALF C1 with all four papers: countdown, limited listening, scored with the official scale and pass marks.") },
];

/* Ba màn chụp từ bản đang chạy (06/11): ảnh ở public/images/landing-*.webp. Chữ chỉ nói thứ có thật. */
const TRUNG_BAY = () => [
  { anh: "/images/landing-thi-thu.webp", Icon: Timer, mau: "from-rose-500 to-red-600",
    ten: tr("Thi thử như ngồi trong phòng thi", "Un examen blanc comme le jour J", "Mock exams that feel like the real day"),
    mo: tr("Đề trình bày như tờ đề DELF thật, chia từng exercice, có đồng hồ đếm ngược cho cả phần thi.", "Le sujet ressemble à celui du DELF, exercice par exercice, avec un chronomètre pour toute l'épreuve.", "The paper looks like a real DELF paper, exercise by exercise, with a countdown for the whole section."),
    y: [tr("Giới hạn lượt nghe như kỳ thi thật", "Écoutes limitées comme à l'examen", "Limited listening, as in the exam"), tr("Điểm quy về thang 25 và ngưỡng đạt", "Note sur 25 et seuils de réussite", "Scored out of 25 with pass marks"), tr("Có giấy nháp ngay trên màn hình", "Brouillon intégré à l'écran", "Built-in scratch pad")],
    alt: tr("Màn thi thử DELF A2, phần Nghe hiểu", "Examen blanc DELF A2, compréhension de l'oral", "DELF A2 mock exam, listening section") },
  { anh: "/images/landing-lo-trinh.webp", Icon: Map, mau: "from-sky-500 to-blue-600",
    ten: tr("Lộ trình từ vựng theo chủ đề", "Un parcours de vocabulaire par thèmes", "A vocabulary path by topic"),
    mo: tr("Mỗi chủ đề là một chuỗi màn ngắn: nghe từ, chọn nghĩa, giữ đủ tim để qua màn và mở thử thách cuối chương.", "Chaque thème est une suite de niveaux courts : écouter, choisir le sens, garder ses cœurs pour avancer jusqu'au défi.", "Each topic is a run of short levels: listen, pick the meaning, keep your hearts to reach the chapter challenge."),
    y: [tr("Ba chương: A1–A2, B1, B2", "Trois chapitres : A1–A2, B1, B2", "Three chapters: A1–A2, B1, B2"), tr("Có phát âm cho từng từ", "Prononciation pour chaque mot", "Audio for every word"), tr("Bấm phím 1 đến 4 để chọn nhanh", "Touches 1 à 4 pour répondre vite", "Keys 1 to 4 to answer fast")],
    alt: tr("Một câu hỏi trong Lộ trình từ vựng", "Une question du parcours de vocabulaire", "A question from the vocabulary path") },
  { anh: "/images/landing-tham-tu.webp", Icon: Search, mau: "from-amber-500 to-yellow-700",
    ten: tr("Thám tử Léon: phá án bằng tiếng Pháp", "Détective Léon : résoudre des enquêtes en français", "Detective Léon: solve cases in French"),
    mo: tr("Cùng Léon đọc lời khai, soi manh mối và tìm ra thủ phạm. Mỗi mùa là một chuỗi vụ án nối tiếp nhau.", "Avec Léon, lisez les témoignages, examinez les indices et trouvez le coupable. Chaque saison enchaîne les enquêtes.", "With Léon, read statements, examine clues and find the culprit. Each season links the cases together."),
    y: [tr("Ba mức dễ, vừa, khó", "Trois niveaux : facile, moyen, difficile", "Easy, medium and hard"), tr("Phá vụ trước để mở vụ sau", "Résolvez une enquête pour ouvrir la suivante", "Solve one case to open the next"), tr("Thành tích và hạng cho từng vụ", "Succès et rang pour chaque enquête", "Achievements and a rank for every case")],
    alt: tr("Bảng vụ án của trò chơi Thám tử Léon", "Le tableau des enquêtes de Détective Léon", "The case board of Detective Léon") },
];

export default function LandingPage({ imgSrc = "/images/landing-luyen-tap.webp" }) {
  const [so, setSo] = useState(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  useSeo({
    tieuDe: "FRACILE: học tiếng Pháp và luyện thi DELF, DALF bằng tiếng Việt",
    moTa: "Luyện tiếng Pháp theo trình độ A1 đến C1 với bài tập đúng khung đề DELF, chấm ngay, giải thích bằng tiếng Việt; AI nhận xét bài viết, bài nói; ngữ pháp A0 đến C1 và đề thi thử DELF A1 đến DALF C1.",
    duongDan: "/",
    /* Tên thương hiệu dễ bị Google sửa thành « fragile »: khai rõ tên, tên khác và
       trang web để máy tìm kiếm (và AI tìm kiếm) nối đúng thực thể. */
    jsonLd: { "@context": "https://schema.org", "@graph": [
      { "@type": "EducationalOrganization", "@id": "https://www.fracile.vn/#org", name: "FRACILE", alternateName: ["Fracile", "fracile.vn", "FRACILE tiếng Pháp"], url: "https://www.fracile.vn/", logo: "https://www.fracile.vn/logo.png", email: "leon@fracile.vn",
        description: "Nền tảng học tiếng Pháp và luyện thi DELF, DALF bằng tiếng Việt: luyện tập theo trình độ, ngữ pháp A0 đến C1, đề thi thử DELF A1 đến DALF C1 có chấm điểm." },
      { "@type": "WebSite", "@id": "https://www.fracile.vn/#web", name: "FRACILE", alternateName: "Fracile", url: "https://www.fracile.vn/", inLanguage: "vi", publisher: { "@id": "https://www.fracile.vn/#org" } },
    ] },
  });

  useEffect(() => {
    let con = true;
    docSoLieu().then((v) => { if (con) setSo(v); });
    return () => { con = false; };
  }, []);

  const KY_NANG_DELF = [
    ["CO", Headphones, tr("Nghe hiểu", "Compréhension de l'oral", "Listening"), tr("Thông báo, tin nhắn, radio, phỏng vấn: nghe theo đúng dạng đề, xem lại lời nghe sau khi làm.", "Annonces, messages, radio, interviews au format de l'examen, transcription après coup.", "Announcements, messages, radio and interviews in exam format, with transcripts afterwards."), "from-sky-500 to-blue-600"],
    ["CE", BookOpen, tr("Đọc hiểu", "Compréhension des écrits", "Reading"), tr("Thư, quảng cáo, bài báo: trắc nghiệm, bảng tick, ghép tài liệu như trong đề.", "Lettres, annonces, articles : QCM, tableaux, appariements comme à l'examen.", "Letters, ads, articles: multiple choice, tick tables and matching as in the exam."), "from-emerald-500 to-teal-600"],
    ["PE", PenLine, tr("Viết", "Production écrite", "Writing"), tr("AI chấm theo thang DELF từng trình độ, nhận xét từng tiêu chí, có bài mẫu để đối chiếu.", "L'IA évalue selon la grille DELF de chaque niveau, critère par critère, avec un modèle.", "AI marks on the DELF grid for each level, criterion by criterion, with a model answer."), "from-amber-500 to-orange-600"],
    ["PO", Mic, tr("Nói", "Production orale", "Speaking"), tr("Ghi âm ngay trên trang, nghe lại và nhận xét của AI về nội dung và phát âm.", "Enregistrez-vous sur la page, réécoutez et recevez l'avis de l'IA.", "Record yourself on the page, listen back and get AI feedback."), "from-fuchsia-500 to-purple-600"],
  ];

  const NAV = [
    ["#cach-hoc", tr("Cách học", "Méthode", "How it works")],
    ["/ngu-phap", tr("Ngữ pháp", "Grammaire", "Grammar")],
    ["/lich-thi-delf", tr("Lịch thi DELF", "Calendrier DELF", "DELF dates")],
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* ── THANH TRÊN (06/11: gọn còn ba mục; thư viện, grille, FAQ xuống chân trang) ── */}
      <nav className="sticky top-0 z-40 border-0 border-b border-solid border-line/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
          <Link to="/gioi-thieu" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink no-underline">
            <img src="/logo-fracile.webp" alt="" width={34} height={34} className="h-[34px] w-[34px] object-contain" />FRACILE<span className="text-primary">.</span>
          </Link>
          <div className="hidden flex-1 items-center gap-7 text-sm font-semibold md:flex">
            {NAV.map(([to, ten]) => (to.startsWith("#")
              ? <a key={to} href={to} className="text-soft no-underline transition-colors hover:text-ink">{ten}</a>
              : <Link key={to} to={to} className="text-soft no-underline transition-colors hover:text-ink">{ten}</Link>))}
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
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-10 pt-12 lg:grid-cols-[1fr_1.1fr] lg:pt-16">
          <div className="mcf-cau-vao">
            <span className="inline-flex items-center gap-2 rounded-full border border-solid border-primary/25 bg-primary-soft px-3 py-1 text-xs font-extrabold text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />{tr("Học tiếng Pháp và luyện thi DELF, DALF", "Français et préparation au DELF, DALF", "French and DELF, DALF prep")}
            </span>
            <h1 className="m-0 mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-[3.4rem]" style={{ textWrap: "balance" }}>
              {tr("Học tiếng Pháp mỗi ngày,", "Le français chaque jour,", "French every day,")}{" "}
              <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">{tr("tự tin bước vào kỳ thi DELF", "le DELF en toute confiance", "the DELF with confidence")}</span>
            </h1>
            <p className="m-0 mt-5 max-w-xl text-base leading-relaxed text-soft sm:text-lg">
              {tr("Bài luyện theo đúng khung đề DELF, DALF, giải thích bằng tiếng Việt và chấm ngay khi nộp. Bài viết, bài nói có AI nhận xét theo thang điểm chính thức.", "Des exercices au format du DELF et du DALF, expliqués en vietnamien et corrigés dès l'envoi. L'écrit et l'oral sont évalués par l'IA selon la grille officielle.", "Exercises in the DELF and DALF format, explained in Vietnamese and graded on submission. Writing and speaking get AI feedback on the official grid.")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/decouvrir"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 px-7 py-3.5 text-sm font-extrabold text-white no-underline shadow-[0_14px_30px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(37,99,235,0.45)] motion-reduce:transition-none">
                {tr("Học thử miễn phí", "Essayer gratuitement", "Try it free")} <ArrowRight size={16} />
              </Link>
              <button type="button" onClick={() => setIsContactFormOpen(true)}
                className="cursor-pointer rounded-2xl border border-solid border-line bg-surface px-7 py-3.5 font-sans text-sm font-bold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 motion-reduce:transition-none">
                {tr("Gửi câu hỏi", "Poser une question", "Ask a question")}
              </button>
            </div>
            <ul className="m-0 mt-7 grid list-none gap-2 p-0 text-sm font-semibold text-ink sm:grid-cols-2">
              {[tr("Luyện theo trình độ A1 đến C1", "Du niveau A1 au C1", "Levels A1 to C1"), tr("Bài tập đúng khung đề DELF", "Au format officiel du DELF", "Official DELF format"), tr("AI chấm bài viết, bài nói", "Écrit et oral évalués par l'IA", "AI-marked writing and speaking"), tr("Học thử không cần tài khoản", "Essai sans compte", "Try without an account")].map((x) => (
                <li key={x} className="flex items-center gap-2"><CheckCircle2 size={17} className="shrink-0 text-ok" />{x}</li>
              ))}
            </ul>
          </div>
          <LeonMoi src={imgSrc} />
        </div>
      </header>

      {/* ── SỐ LIỆU: hai ô đầu ĐẾM THẬT ── */}
      <section className="px-5">
        <HienDan className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-primary to-indigo-600 p-6 shadow-[0_24px_60px_rgba(37,99,235,0.3)] sm:p-8">
          <span aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OSoLieu so={so?.baiTap} nhan={tr("Bài tập và đề thi", "Exercices et examens", "Exercises and exams")} phu={tr("Từ A1 đến C1, chia theo kỹ năng và trình độ.", "De A1 à C1, classés par compétence et niveau.", "From A1 to C1, by skill and level.")} />
            <OSoLieu so={so?.cauHoi} nhan={tr("Câu hỏi", "Questions", "Questions")} phu={tr("Phần lớn có lời giải bằng tiếng Việt.", "La plupart avec une explication en vietnamien.", "Most come with a Vietnamese explanation.")} />
            <OSoLieu so="4" nhan={tr("Kỹ năng DELF", "Compétences du DELF", "DELF skills")} phu={tr("Nghe, Đọc, Viết, Nói, luyện đều cả bốn.", "Écouter, lire, écrire, parler : les quatre.", "Listening, reading, writing, speaking: all four.")} />
            <OSoLieu so="AI" nhan={tr("Chấm bài viết, bài nói", "Écrit et oral évalués", "Writing and speaking marked")} phu={tr("Theo thang điểm DELF chính thức, nhận xét từng tiêu chí.", "Selon la grille officielle du DELF, critère par critère.", "On the official DELF grid, criterion by criterion.")} />
          </div>
          <p className="relative m-0 mt-4 text-center text-xs text-white/70">
            {tr("Số liệu đọc trực tiếp từ hệ thống, không phải con số quảng cáo.", "Chiffres lus en direct dans le système, pas des chiffres marketing.", "Figures read live from the system, not marketing numbers.")}
          </p>
        </HienDan>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        {/* ── CÁCH HỌC: ba bước có thứ tự thật ── */}
        <section id="cach-hoc" className="mt-24 scroll-mt-24">
          <HienDan>
            <p className="m-0 text-sm font-extrabold text-primary">{tr("Cách học trên FRACILE", "La méthode FRACILE", "How FRACILE works")}</p>
            <h2 className="m-0 mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl" style={{ textWrap: "balance" }}>
              {tr("Từ bài đầu tiên tới ngày thi, đi theo ba bước", "Du premier exercice au jour de l'examen, en trois étapes", "From your first exercise to exam day, in three steps")}
            </h2>
          </HienDan>
          <ol className="m-0 mt-8 grid list-none gap-4 p-0 lg:grid-cols-3">
            {BUOC().map(({ Icon, ten, mo }, i) => (
              <HienDan as="li" key={ten} tre={i * 90}
                className="relative overflow-hidden rounded-3xl border border-solid border-line bg-surface p-7">
                <span aria-hidden className="pointer-events-none absolute -right-2 -top-6 text-[7rem] font-extrabold leading-none text-primary/[0.07]">{i + 1}</span>
                <div className="relative flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-md"><Icon size={20} /></span>
                  <span className="text-sm font-extrabold text-primary">{tr(`Bước ${i + 1}`, `Étape ${i + 1}`, `Step ${i + 1}`)}</span>
                </div>
                <h3 className="relative m-0 mt-5 text-lg font-extrabold text-ink">{ten}</h3>
                <p className="relative m-0 mt-2 text-sm leading-relaxed text-soft">{mo}</p>
              </HienDan>
            ))}
          </ol>
        </section>

        {/* ── NGỮ PHÁP: ảnh màn hình thật ── */}
        <section className="mt-24 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <HienDan>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md"><BookA size={22} /></span>
            <h2 className="m-0 mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl" style={{ textWrap: "balance" }}>{tr("Ngữ pháp A0 đến C1, giải thích bằng tiếng Việt", "La grammaire de A0 à C1, expliquée en vietnamien", "Grammar from A0 to C1, explained in Vietnamese")}</h2>
            <p className="m-0 mt-4 max-w-lg text-base leading-relaxed text-soft">{tr("Hơn 80 bài chia thành phần nhỏ. Mỗi phần có giải thích rõ ràng, bảng, ví dụ có âm thanh và bài luyện chấm ngay.", "Plus de 80 leçons en petites parties, chacune avec explications, tableaux, exemples audio et exercices corrigés.", "Over 80 lessons in small parts, each with explanations, tables, audio examples and instantly graded practice.")}</p>
            <Link to="/ngu-phap" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-primary no-underline hover:underline">{tr("Xem các bài ngữ pháp", "Voir la grammaire", "Browse the grammar")} <ArrowRight size={15} /></Link>
          </HienDan>
          <HienDan tre={120}><KhungTrinhDuyet src="/images/landing-ngu-phap.webp" alt={tr("Bài ngữ pháp Être và avoir trên FRACILE", "Leçon Être et avoir sur FRACILE", "The Être and avoir lesson on FRACILE")} /></HienDan>
        </section>

        {/* ── TRƯNG BÀY: ảnh chụp thật của thi thử, lộ trình, thám tử (06/11, theo chủ dự án) ── */}
        <section className="mt-24 grid gap-20">
          {TRUNG_BAY().map((m, i) => (
            <div key={m.anh} className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <HienDan className={i % 2 ? "" : "lg:order-2"}>
                <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${m.mau} text-white shadow-md`}><m.Icon size={22} /></span>
                <h2 className="m-0 mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl" style={{ textWrap: "balance" }}>{m.ten}</h2>
                <p className="m-0 mt-4 max-w-lg text-base leading-relaxed text-soft">{m.mo}</p>
                <ul className="m-0 mt-5 grid list-none gap-2 p-0 text-sm font-semibold text-ink">
                  {m.y.map((x) => <li key={x} className="flex items-start gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-ok" />{x}</li>)}
                </ul>
              </HienDan>
              <HienDan tre={120} className={i % 2 ? "" : "lg:order-1"}><KhungTrinhDuyet src={m.anh} alt={m.alt} /></HienDan>
            </div>
          ))}
        </section>

        {/* ── BỐN KỸ NĂNG ── */}
        <section id="ky-nang" className="mt-24 scroll-mt-24">
          <HienDan className="text-center">
            <p className="m-0 text-sm font-extrabold text-primary">DELF, DALF</p>
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
              <p className="m-0 text-sm font-extrabold text-primary">{tr("Ngoài giờ luyện đề", "En dehors des sujets", "Beyond exam practice")}</p>
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
            <span className="flex items-center gap-2 text-xl font-extrabold"><img src="/logo-fracile.webp" alt="" width={36} height={36} className="h-9 w-9 object-contain" />FRACILE</span>
            <p className="m-0 mt-3 max-w-sm text-sm leading-relaxed text-blue-100">{tr("Học tiếng Pháp và luyện thi DELF, DALF bằng tiếng Việt.", "Apprendre le français et préparer le DELF, le DALF, en vietnamien.", "Learn French and prepare for the DELF and DALF, in Vietnamese.")}</p>
          </div>
          <div className="grid content-start gap-2 text-sm">
            <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-blue-200">{tr("Học", "Apprendre", "Learn")}</p>
            {[["/decouvrir", tr("Thư viện bài tập", "Bibliothèque d'exercices", "Exercise library")], ["/ngu-phap", tr("Ngữ pháp tiếng Pháp", "Grammaire française", "French grammar")], ["/lich-thi-delf", tr("Lịch thi DELF, DALF", "Calendrier DELF, DALF", "DELF, DALF dates")], ["/grille-delf", tr("Grille DELF giải thích", "Grilles DELF expliquées", "DELF grids explained")]].map(([to, ten]) => (
              <Link key={to} to={to} className="text-white no-underline transition-colors hover:text-blue-100">{ten}</Link>
            ))}
          </div>
          <div className="grid content-start gap-2 text-sm">
            <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-blue-200">{tr("Hỗ trợ", "Aide", "Support")}</p>
            {[["/faq", tr("Câu hỏi thường gặp", "Questions fréquentes", "FAQ")], ["/login", tr("Đăng nhập", "Connexion", "Sign in")], ["/dieu-khoan", tr("Điều khoản sử dụng", "Conditions d'utilisation", "Terms of use")], ["/bao-mat", tr("Chính sách bảo mật", "Politique de confidentialité", "Privacy policy")]].map(([to, ten]) => (
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

/* Ảnh màn hình sản phẩm trong khung trình duyệt (06/11, chụp lại từ bản đang chạy).
   File chưa có (hoặc hỏng) thì KHÔNG hiện gì: một biểu tượng ảnh vỡ không nên lọt tới khách. */
function KhungTrinhDuyet({ src, alt }) {
  const [hong, setHong] = useState(false);
  if (hong) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-solid border-line bg-surface shadow-[0_30px_70px_rgba(15,23,42,0.18)]">
      <div className="flex items-center gap-1.5 border-0 border-b border-solid border-line bg-surface2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/60" /><span className="h-2.5 w-2.5 rounded-full bg-warn/60" /><span className="h-2.5 w-2.5 rounded-full bg-ok/60" />
        <span className="ml-3 truncate rounded-full bg-surface px-3 py-0.5 text-[11px] font-semibold text-soft">fracile.vn</span>
      </div>
      <img src={src} alt={alt} onError={() => setHong(true)} loading="lazy" className="block w-full" />
    </div>
  );
}

/* Leon mời khách vào web (09/10, theo chủ dự án): GIỮ ảnh chụp màn hình,
   Leon cỡ lớn đứng chồng ở góc phải dưới như đang mời vào, kèm bong bóng lời. */
function LeonMoi({ src }) {
  return (
    <div className="relative pb-24 sm:pb-16 lg:pb-20">
      <KhungTrinhDuyet src={src} alt={tr("Màn Luyện tập theo trình độ của FRACILE", "L'écran d'entraînement par niveau de FRACILE", "FRACILE's level-based practice screen")} />
      <div className="pointer-events-none absolute -bottom-6 right-0 flex items-end 2xl:-right-12">
        <Link to="/decouvrir"
          className="mcf-leon-vao-bong group pointer-events-auto relative z-10 mb-44 -mr-6 max-w-[13rem] rounded-3xl rounded-br-md bg-surface px-4 py-3 text-ink no-underline shadow-[0_18px_40px_rgb(0,0,0,0.15)] sm:mb-52">
          <span className="block text-base font-extrabold"><em>Bonjour !</em> 🐾</span>
          <span className="mt-0.5 block text-[13px] leading-snug text-soft">{tr("Mình là Léon. Vào học thử cùng mình nhé!", "Moi, c'est Léon. Viens essayer avec moi !", "I'm Léon. Come and try it with me!")}</span>
          <span className="mt-1.5 inline-flex items-center gap-1 text-sm font-bold text-primary">{tr("Vào thôi", "C'est parti", "Let's go")} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
        </Link>
        <img src="/leon/leon-lon.webp" alt={tr("Léon, linh vật của FRACILE, đang chào bạn", "Léon, la mascotte de FRACILE, vous accueille", "Léon, FRACILE's mascot, welcomes you")}
          width={260} height={300} className="mcf-leon-bay h-[230px] w-auto object-contain drop-shadow-[0_16px_24px_rgb(0,0,0,0.18)] sm:h-[300px]" />
      </div>
    </div>
  );
}
