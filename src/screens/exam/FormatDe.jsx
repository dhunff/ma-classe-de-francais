import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Headphones, BookOpen, PenLine, Mic, Puzzle, LayoutList, Clock, X } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Khối « Format đề » trên màn chọn đề thi thử (15/11, chủ dự án): gom danh sách kỹ năng (trước là
 * thẻ « Cấu trúc đề » của DELF và lưới thẻ bài thi của TCF) vào MỘT mục thu gọn, nói chi tiết từng
 * phần. Đặt dưới danh sách đề để đề 1, 2, 3 nằm trên cùng. Gọn thành một nút nhỏ, bấm mở cửa sổ
 * (15/11, chủ dự án); Esc hoặc bấm nền để đóng.
 *
 * Nguồn: DELF A1 đến B2 theo docs/format-de-thi-DELF-A1-B2.xlsx (manuel du candidat FEI 12/2021,
 * sujet d'exemple A1 2022; A2 là nguồn thứ cấp), lấy theo « format 2 » mà FRACILE soạn. DALF C1 theo
 * format từ 03/2020 (không còn chọn lĩnh vực). TCF theo trang FEI (bản cho đợt 01/09/2026), thời
 * lượng và số câu trùng examPaper.js / shared/tcfCanada.js. Không ghi số câu từng bài khi nguồn
 * không chắc. Chuỗi là [vi, fr, en], gọi tr lúc dựng (không gọi ở cấp module). */

const ICON = { CO: Headphones, CE: BookOpen, PE: PenLine, PO: Mic, MS: Puzzle };
const MAU = { CO: "from-sky-500 to-blue-600", CE: "from-emerald-500 to-teal-600", PE: "from-amber-500 to-orange-600", PO: "from-fuchsia-500 to-purple-600", MS: "from-indigo-500 to-violet-600" };
const VI = { CO: ["Nghe hiểu", "Compréhension de l'oral", "Listening"], CE: ["Đọc hiểu", "Compréhension des écrits", "Reading"], PE: ["Viết", "Production écrite", "Writing"], PO: ["Nói", "Production orale", "Speaking"], MS: ["Cấu trúc ngôn ngữ", "Structures de la langue", "Language structures"] };

const TCF_PE = { code: "PE", ten: "Expression écrite", phut: 60, diem: "0 – 20", nhan: ["3 bài viết", "3 tâches", "3 tasks"], ct: [
  ["Bài 1: tin nhắn gửi một người để mô tả, kể hoặc giải thích (60 đến 120 từ).", "Tâche 1 : message pour décrire, raconter ou expliquer (60 à 120 mots).", "Task 1: a message to describe, narrate or explain (60 to 120 words)."],
  ["Bài 2: bài viết kể một trải nghiệm, có nhận xét của bản thân (120 đến 150 từ).", "Tâche 2 : article racontant une expérience, avec commentaires (120 à 150 mots).", "Task 2: an article about an experience, with your comments (120 to 150 words)."],
  ["Bài 3: đọc hai tài liệu trái chiều, so sánh hai quan điểm rồi nêu ý kiến của mình (120 đến 180 từ).", "Tâche 3 : comparer deux points de vue opposés puis donner son avis (120 à 180 mots).", "Task 3: compare two opposing views, then give your opinion (120 to 180 words)."],
] };
const TCF_PO = { code: "PO", ten: "Expression orale", phut: 12, diem: "0 – 20", nhan: ["3 phần", "3 tâches", "3 tasks"], ct: [
  ["Phần 1: trò chuyện với giám khảo về bản thân, không chuẩn bị (2 phút).", "Tâche 1 : entretien dirigé, sans préparation (2 min).", "Task 1: guided interview, no preparation (2 min)."],
  ["Phần 2: đóng vai, đặt câu hỏi cho giám khảo để lấy thông tin, có 2 phút chuẩn bị (5 phút 30).", "Tâche 2 : exercice en interaction, 2 min de préparation (5 min 30).", "Task 2: role-play asking the examiner questions, 2 min prep (5 min 30)."],
  ["Phần 3: trình bày và bảo vệ quan điểm về một chủ đề, không chuẩn bị (4 phút 30).", "Tâche 3 : expression d'un point de vue, sans préparation (4 min 30).", "Task 3: give and defend an opinion, no preparation (4 min 30)."],
] };
const QCM_TCF = (so, phut, ct) => ({ phut, diem: "0 – 699", nhan: [`${so} câu trắc nghiệm`, `${so} questions`, `${so} questions`], ct: [
  ...ct,
  ["Câu hỏi khó dần từ A1 đến C2, mỗi câu 4 phương án, chỉ một đáp án đúng.", "Difficulté croissante de A1 à C2, 4 choix, une seule bonne réponse.", "Difficulty rises from A1 to C2; 4 options, one correct answer."],
] });

const FORMAT = {
  A1: [
    { code: "CO", phut: 20, diem: "/25", ct: [
      ["Nghe tin nhắn thoại, thông báo nơi công cộng và hội thoại rất ngắn về đời sống hằng ngày.", "Messages, annonces et dialogues très courts de la vie quotidienne.", "Voicemails, public announcements and very short everyday dialogues."],
      ["Mỗi tài liệu nghe 2 lần. Chọn đáp án (có câu chọn hình), ghép hội thoại với hình.", "Chaque document est écouté 2 fois. QCM (parfois en images), association dialogues et images.", "Each recording is played twice. Multiple choice (some with pictures), matching dialogues to pictures."],
    ] },
    { code: "CE", phut: 30, diem: "/25", ct: [
      ["Đọc tin nhắn, chỉ dẫn đường, lịch hoạt động, tờ quảng cáo.", "Messages, itinéraires, horaires, publicités.", "Messages, directions, timetables, leaflets."],
      ["Chọn đáp án (nhiều câu chọn hình) và trả lời ngắn.", "QCM (souvent en images) et réponses courtes.", "Multiple choice (often with pictures) and short answers."],
    ] },
    { code: "PE", phut: 30, diem: "/25", ct: [
      ["Bài 1: điền một phiếu thông tin cá nhân (10 điểm).", "Exercice 1 : compléter une fiche (10 points).", "Task 1: fill in a form (10 points)."],
      ["Bài 2: viết tin nhắn hoặc thư ngắn cho bạn: mời, kể hoạt động (tối thiểu 40 từ, 15 điểm).", "Exercice 2 : message ou lettre amicale (40 mots minimum, 15 points).", "Task 2: a short message or letter to a friend (40 words min, 15 points)."],
    ] },
    { code: "PO", phut: "5 – 7", chuanBi: 10, diem: "/25", ct: [
      ["Phần 1: trả lời câu hỏi về bản thân (entretien dirigé).", "Entretien dirigé.", "Guided interview about yourself."],
      ["Phần 2: đặt câu hỏi từ các thẻ từ gợi ý (échange d'informations).", "Échange d'informations à partir de mots-clés.", "Asking questions from keyword cards."],
      ["Phần 3: đóng vai mua bán, đặt hàng (dialogue simulé). Có 10 phút chuẩn bị cho phần 2 và 3.", "Dialogue simulé. 10 min de préparation pour les parties 2 et 3.", "Role-play (shopping, ordering). 10 min prep for parts 2 and 3."],
    ] },
  ],
  A2: [
    { code: "CO", phut: 25, diem: "/25", ct: [
      ["Nghe khoảng một chục tài liệu ngắn: thông báo, tin nhắn, bản tin radio, hội thoại.", "Une dizaine de documents courts : annonces, messages, radio, dialogues.", "About a dozen short recordings: announcements, messages, radio, dialogues."],
      ["Mỗi tài liệu nghe 2 lần. Chọn đáp án, bài cuối ghép hội thoại với tình huống.", "Chaque document est écouté 2 fois. QCM, puis association dialogues et situations.", "Each played twice. Multiple choice, last task matches dialogues to situations."],
    ] },
    { code: "CE", phut: 30, diem: "/25", ct: [
      ["Đọc tài liệu đời sống: thư, email, quảng cáo, chỉ dẫn, bài báo ngắn.", "Documents de la vie quotidienne : lettres, courriels, annonces, consignes, articles courts.", "Everyday documents: letters, emails, ads, instructions, short articles."],
      ["Ghép tài liệu với người phù hợp, chọn đáp án, đúng hay sai.", "Association documents et personnes, QCM, vrai ou faux.", "Matching documents to people, multiple choice, true or false."],
    ] },
    { code: "PE", phut: 45, diem: "/25", ct: [
      ["Bài 1: kể một sự kiện hoặc trải nghiệm cá nhân (tối thiểu 60 từ).", "Exercice 1 : raconter un événement, une expérience (60 mots minimum).", "Task 1: describe an event or experience (60 words min)."],
      ["Bài 2: viết thư hoặc tin nhắn để mời, cảm ơn, xin lỗi, yêu cầu (tối thiểu 60 từ).", "Exercice 2 : inviter, remercier, s'excuser, demander (60 mots minimum).", "Task 2: invite, thank, apologise, request (60 words min)."],
    ] },
    { code: "PO", phut: "6 – 8", chuanBi: 10, diem: "/25", ct: [
      ["Phần 1: trả lời câu hỏi về bản thân (entretien dirigé).", "Entretien dirigé.", "Guided interview about yourself."],
      ["Phần 2: nói liền mạch về một chủ đề quen thuộc (monologue suivi).", "Monologue suivi.", "Short talk on a familiar topic."],
      ["Phần 3: đóng vai một tình huống đời sống với giám khảo (exercice en interaction). Có 10 phút chuẩn bị cho phần 2 và 3.", "Exercice en interaction. 10 min de préparation pour les parties 2 et 3.", "Role-play with the examiner. 10 min prep for parts 2 and 3."],
    ] },
  ],
  B1: [
    { code: "CO", phut: 25, diem: "/25", ct: [
      ["3 bài: một hội thoại đời sống, hai chương trình radio (một về nghề nghiệp).", "3 exercices : une conversation, deux émissions de radio.", "3 tasks: a conversation and two radio programmes."],
      ["Chọn đáp án. Câu đầu mỗi bài hỏi ý tổng quát.", "QCM. La première question porte sur le sens général.", "Multiple choice. The first question checks the overall meaning."],
    ] },
    { code: "CE", phut: 45, diem: "/25", ct: [
      ["Bài 1: tìm thông tin trong nhiều tài liệu để chọn phương án phù hợp, điền bảng có hoặc không.", "Exercice 1 : trouver des informations dans plusieurs documents, grille oui ou non.", "Task 1: find information across several documents, yes or no grid."],
      ["Bài 2 và 3: hiểu bài báo về chủ đề phổ thông: chọn đáp án, đúng hay sai.", "Exercices 2 et 3 : articles de presse, QCM, vrai ou faux.", "Tasks 2 and 3: press articles, multiple choice, true or false."],
    ] },
    { code: "PE", phut: 45, diem: "/25", ct: [
      ["Một bài bày tỏ quan điểm cá nhân về một chủ đề chung, dạng thư, email, bài báo hoặc bài diễn đàn (tối thiểu 160 từ).", "Exprimer son opinion sur un sujet général : lettre, courriel, article, forum (160 mots minimum).", "One opinion text on a general topic: letter, email, article or forum post (160 words min)."],
    ] },
    { code: "PO", phut: 15, chuanBi: 10, diem: "/25", ct: [
      ["Phần 1: trò chuyện về bản thân, không chuẩn bị (2 đến 3 phút).", "Entretien dirigé, sans préparation (2 à 3 min).", "Guided interview, no preparation (2 to 3 min)."],
      ["Phần 2: đóng vai giải quyết một tình huống với giám khảo, không chuẩn bị (3 đến 4 phút).", "Exercice en interaction, sans préparation (3 à 4 min).", "Role-play with the examiner, no preparation (3 to 4 min)."],
      ["Phần 3: bốc 2 tài liệu ngắn, chọn 1, nêu và bảo vệ quan điểm (5 đến 7 phút). Có 10 phút chuẩn bị cho phần này.", "Expression d'un point de vue sur un document (5 à 7 min), 10 min de préparation.", "Opinion on a short document (5 to 7 min), 10 min prep."],
    ] },
  ],
  B2: [
    { code: "CO", phut: 30, diem: "/25", ct: [
      ["Bài 1 và 2: tài liệu radio dài (hội thảo, phóng sự, phỏng vấn), nghe 2 lần.", "Exercices 1 et 2 : documents longs (conférence, reportage, interview), 2 écoutes.", "Tasks 1 and 2: long recordings (lecture, report, interview), played twice."],
      ["Bài 3: ba tài liệu ngắn, mỗi tài liệu chỉ nghe 1 lần.", "Exercice 3 : trois documents courts, une seule écoute.", "Task 3: three short recordings, played once."],
      ["Câu hỏi chủ yếu là trắc nghiệm.", "Questions surtout à choix multiple.", "Mostly multiple-choice questions."],
    ] },
    { code: "CE", phut: 60, diem: "/25", ct: [
      ["Bài 1 và 2: văn bản thông tin hoặc nghị luận về nước Pháp và thế giới Pháp ngữ.", "Exercices 1 et 2 : textes informatifs ou argumentatifs.", "Tasks 1 and 2: informative or argumentative texts."],
      ["Bài 3: hiểu quan điểm của một người viết.", "Exercice 3 : comprendre le point de vue d'un auteur.", "Task 3: understand a writer's point of view."],
    ] },
    { code: "PE", phut: 60, diem: "/25", ct: [
      ["Một bài nghị luận bảo vệ quan điểm: thư trang trọng, đóng góp cho một cuộc tranh luận, bài báo phê bình (tối thiểu 250 từ).", "Texte argumenté : lettre formelle, contribution à un débat, article critique (250 mots minimum).", "One argumentative text: formal letter, debate contribution, critical article (250 words min)."],
    ] },
    { code: "PO", phut: 20, chuanBi: 30, diem: "/25", ct: [
      ["Bốc 2 tài liệu ngắn, chọn 1, có 30 phút chuẩn bị.", "Tirage de 2 documents, choix d'un seul, 30 min de préparation.", "Draw 2 short documents, choose 1, 30 min prep."],
      ["Phần 1: độc thoại nêu vấn đề và bảo vệ quan điểm có lập luận (5 đến 7 phút).", "Monologue suivi : présenter et défendre un point de vue (5 à 7 min).", "Monologue: present and defend an argued opinion (5 to 7 min)."],
      ["Phần 2: tranh luận với giám khảo, giám khảo phản biện để bạn bảo vệ hoặc nhấn sắc thái ý kiến.", "Exercice en interaction : débat avec l'examinateur.", "Discussion: debate with the examiner, who challenges your view."],
    ] },
  ],
  C1: [
    { code: "CO", phut: 40, diem: "/25", ct: [
      ["Bài 1: một tài liệu dài (hội thảo, phỏng vấn, phóng sự), nghe 2 lần.", "Exercice 1 : un document long, 2 écoutes.", "Task 1: one long recording, played twice."],
      ["Bài 2: nhiều tài liệu ngắn trên radio, mỗi tài liệu nghe 1 lần.", "Exercice 2 : plusieurs documents courts, une seule écoute.", "Task 2: several short recordings, played once."],
    ] },
    { code: "CE", phut: 50, diem: "/25", ct: [
      ["Một văn bản dài (bài báo, tiểu luận) về chủ đề xã hội, trả lời nhiều dạng câu hỏi.", "Un texte long (article, essai), questions de compréhension variées.", "One long text (article, essay) with varied questions."],
    ] },
    { code: "PE", phut: 150, diem: "/25", ct: [
      ["Bài 1: tổng hợp nhiều tài liệu thành một bài viết khách quan (synthèse, khoảng 220 từ).", "Synthèse de documents (environ 220 mots).", "Synthesis of several documents (about 220 words)."],
      ["Bài 2: bài nghị luận về chủ đề của các tài liệu (essai argumenté, tối thiểu 250 từ).", "Essai argumenté (250 mots minimum).", "Argumentative essay (250 words min)."],
      ["Từ 03/2020 không còn chọn lĩnh vực.", "Plus de choix de domaine depuis mars 2020.", "No choice of field since March 2020."],
    ] },
    { code: "PO", phut: 30, chuanBi: 60, diem: "/25", ct: [
      ["Bốc 2 chủ đề, chọn 1, có 1 giờ chuẩn bị.", "Tirage de 2 thèmes, choix d'un seul, 1 h de préparation.", "Draw 2 themes, choose 1, 1 hour prep."],
      ["Phần 1: exposé có dàn ý rõ, phân tích và nêu quan điểm.", "Exposé structuré.", "A structured presentation."],
      ["Phần 2: trao đổi với hội đồng, trả lời câu hỏi và bảo vệ quan điểm.", "Entretien avec le jury.", "Discussion with the jury."],
    ] },
  ],
  TCF: [
    { code: "CO", ten: "Compréhension orale", ...QCM_TCF(39, 35, [["Nghe các đoạn ghi âm từ hội thoại đời thường đến bài nói chuyên sâu, mỗi đoạn nghe một lần.", "Documents sonores, de la conversation courante au discours spécialisé, une seule écoute.", "Recordings from everyday talk to specialised speech, each played once."]]) },
    { code: "CE", ten: "Compréhension écrite", ...QCM_TCF(39, 60, [["Đọc từ biển báo, tin nhắn ngắn đến bài báo và văn bản lập luận.", "De la signalétique et des messages courts aux articles et textes argumentatifs.", "From signs and short messages to articles and argumentative texts."]]) },
    TCF_PE, TCF_PO,
  ],
  TCF_TP: [
    { code: "CO", ten: "Compréhension orale", batBuoc: true, ...QCM_TCF(29, 25, [["Nghe các đoạn ghi âm từ hội thoại đời thường đến bài nói chuyên sâu, mỗi đoạn nghe một lần.", "Documents sonores, de la conversation courante au discours spécialisé, une seule écoute.", "Recordings from everyday talk to specialised speech, each played once."]]) },
    { code: "MS", ten: "Maîtrise des structures de la langue", batBuoc: true, ...QCM_TCF(18, 15, [["Chọn từ hoặc cấu trúc đúng (ngữ pháp, từ vựng) để hoàn thành câu.", "Choisir la forme correcte (grammaire, lexique).", "Choose the correct grammar or vocabulary form."]]) },
    { code: "CE", ten: "Compréhension écrite", batBuoc: true, ...QCM_TCF(29, 45, [["Đọc từ biển báo, tin nhắn ngắn đến bài báo và văn bản lập luận.", "De la signalétique et des messages courts aux articles et textes argumentatifs.", "From signs and short messages to articles and argumentative texts."]]) },
    { ...TCF_PE, batBuoc: false }, { ...TCF_PO, batBuoc: false },
  ],
};

const tenKy = (ma) => (ma === "TCF" ? "TCF Canada" : ma === "TCF_TP" ? "TCF tout public" : ma === "C1" ? "DALF C1" : `DELF ${ma}`);
const t3 = (x) => tr(x[0], x[1], x[2]);

/* Ô công cụ cạnh tab trình độ (15/11, chủ dự án): cùng khuôn với tab (khung bo 2xl, viền 2px, cao
 * bằng nhau), bấm mở cửa sổ. Kiểu nút phụ chung của web (viên thuốc viền xám, như « Kết quả thi của tôi »). Dùng cho « Format đề » và « Quy đổi điểm » của trang TCF. */
export function NutCuaSo({ icon: Icon, nhan, phu, tieuDe, rong = "max-w-2xl", children }) {
  const [mo, setMo] = useState(false);
  useEffect(() => {
    if (!mo) return;
    const dong = (e) => { if (e.key === "Escape") setMo(false); };
    window.addEventListener("keydown", dong);
    const cu = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", dong); document.body.style.overflow = cu; };
  }, [mo]);
  return (
    <>
      <button type="button" onClick={() => setMo(true)} aria-haspopup="dialog"
        className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-solid border-line bg-surface px-4 py-2 font-sans text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary">
        <Icon size={15} /> {nhan}{phu && <span className="font-semibold text-soft">· {phu}</span>}
      </button>
      {mo && createPortal(
        <div role="dialog" aria-modal="true" aria-label={tieuDe} onClick={() => setMo(false)}
          className="fixed inset-0 z-[300] grid place-items-center bg-black/55 p-4 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className={`flex max-h-[88vh] w-full ${rong} flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl`}>
            <div className="flex items-center gap-3 border-0 border-b border-solid border-line px-5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.3)]"><Icon size={17} /></span>
              <h2 className="m-0 min-w-0 flex-1 text-base font-extrabold text-ink">{tieuDe}</h2>
              <button type="button" onClick={() => setMo(false)} aria-label={tr("Đóng", "Fermer", "Close")} autoFocus
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-ink hover:bg-primary-soft hover:text-primary"><X size={17} /></button>
            </div>
            <div className="overflow-y-auto p-5">{children}</div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/* Màu nhạt theo kỹ năng cho thẻ và nhãn « Bài 1 » (15/11): chuỗi viết đủ để Tailwind quét được. */
const NHAT = {
  CO: { the: "border-sky-500/25 bg-sky-500/[0.05]", nhan: "bg-sky-500/15 text-sky-600", so: "text-sky-600" },
  CE: { the: "border-emerald-500/25 bg-emerald-500/[0.05]", nhan: "bg-emerald-500/15 text-emerald-600", so: "text-emerald-600" },
  PE: { the: "border-amber-500/25 bg-amber-500/[0.06]", nhan: "bg-amber-500/15 text-amber-600", so: "text-amber-600" },
  PO: { the: "border-fuchsia-500/25 bg-fuchsia-500/[0.05]", nhan: "bg-fuchsia-500/15 text-fuchsia-600", so: "text-fuchsia-600" },
  MS: { the: "border-indigo-500/25 bg-indigo-500/[0.05]", nhan: "bg-indigo-500/15 text-indigo-600", so: "text-indigo-600" },
};
/* « Bài 1 và 2: … » → nhãn « Bài 1 và 2 » + nội dung; dòng không có nhãn (ghi chú) giữ nguyên. */
const tachNhan = (t) => { const m = t.match(/^([^:]{1,30}\d[^:]{0,12}?)\s?:\s*(.+)$/); return m ? [m[1], m[2]] : [null, t]; };
const soPhut = (x) => Number(String(x).match(/\d+/)?.[0]) || 0;
const dongHo = (ph) => (ph >= 60 && typeof ph === "number" ? `${Math.floor(ph / 60)}h${ph % 60 ? String(ph % 60).padStart(2, "0") : ""}` : `${ph}′`);

export default function FormatDe({ ma }) {
  const ds = FORMAT[ma];
  if (!ds) return null;
  const tcf = ma === "TCF" || ma === "TCF_TP";
  /* 16/11 (chủ dự án): tổng làm tròn tới 5 phút. Phần nói ghi khoảng (« 6 – 8 ») nên tổng cộng theo cận
     dưới ra số lẻ (A2 ≈ 1h46); con số này vốn là ước lượng (≈), làm tròn đọc dễ hơn. */
  const tong = Math.round(ds.reduce((n, p) => n + soPhut(p.phut), 0) / 5) * 5;
  return (
    <NutCuaSo icon={LayoutList} nhan={tr("Format đề", "Format", "Format")} phu={tenKy(ma)} rong="max-w-3xl"
      tieuDe={`${tr("Format đề", "Format de l'épreuve", "Exam format")} ${tenKy(ma)}`}>
      {/* Thanh thời gian: mỗi kỹ năng một đoạn, dài theo số phút thi (không tính giờ chuẩn bị). */}
      <div className="rounded-2xl bg-surface2 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-bold text-soft">{tr("Thời gian làm bài", "Durée des épreuves", "Exam time")}</span>
          <span className="text-lg font-extrabold tabular-nums text-ink">≈ {dongHo(tong)}</span>
        </div>
        <div className="mt-2 flex h-3 gap-1 overflow-hidden rounded-full">
          {ds.map((p) => <span key={p.code} title={`${t3(VI[p.code])} · ${p.phut}′`} className={`h-full bg-gradient-to-r ${MAU[p.code]}`} style={{ flexGrow: soPhut(p.phut) }} />)}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-soft">
          {ds.map((p) => (
            <span key={p.code} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${MAU[p.code]}`} />{t3(VI[p.code])} <span className="tabular-nums text-ink">{p.phut}′</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ds.map((p) => {
          const Icon = ICON[p.code];
          const nh = NHAT[p.code];
          return (
            <article key={p.code} className={`flex flex-col gap-3 rounded-2xl border border-solid p-4 ${nh.the}`}>
              <header className="flex items-start gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${MAU[p.code]} text-white shadow-[0_6px_14px_rgba(15,23,42,0.15)]`}><Icon size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[15px] font-extrabold leading-tight text-ink">{t3(VI[p.code])}</p>
                  <p lang="fr" className="m-0 mt-0.5 text-xs italic text-soft">{p.ten ?? VI[p.code][1]}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`m-0 text-xl font-extrabold leading-none tabular-nums ${nh.so}`}>{dongHo(p.phut)}</p>
                  <p className="m-0 mt-1 text-[11px] font-bold text-soft">{tcf ? p.diem : `${tr("điểm", "points", "points")} ${p.diem}`}</p>
                </div>
              </header>
              {(p.batBuoc !== undefined || p.nhan || p.chuanBi) && (
                <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                  {p.batBuoc !== undefined && (
                    <span className={`rounded-full px-2.5 py-1 ${p.batBuoc ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>
                      {p.batBuoc ? tr("Bắt buộc", "Obligatoire", "Required") : tr("Tự chọn", "Facultative", "Optional")}
                    </span>
                  )}
                  {p.nhan && <span className="rounded-full bg-surface px-2.5 py-1 text-ink">{t3(p.nhan)}</span>}
                  {p.chuanBi && <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-ink"><Clock size={11} /> + {p.chuanBi}′ {tr("chuẩn bị", "de préparation", "prep")}</span>}
                </div>
              )}
              <ul className="m-0 grid list-none gap-2 p-0 text-[13px] leading-snug text-ink">
                {p.ct.map((c, k) => {
                  const [nhan, noi] = tachNhan(t3(c));
                  return (
                    <li key={k} className="flex items-start gap-2">
                      {nhan
                        ? <span className={`mt-px shrink-0 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-extrabold ${nh.nhan}`}>{nhan}</span>
                        : <span aria-hidden className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${MAU[p.code]}`} />}
                      <span className="min-w-0">{noi}</span>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
      {!tcf && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-primary-soft px-4 py-3 text-[13px] text-ink">
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-extrabold text-white">/100</span>
          {tr("Đậu khi đạt từ", "Réussite à partir de", "Pass from")} <strong>50/100</strong> {tr("và không kỹ năng nào dưới", "et au moins", "and no part below")} <strong>5/25</strong>{tr(".", " par épreuve.", ".")}
        </div>
      )}
    </NutCuaSo>
  );
}
