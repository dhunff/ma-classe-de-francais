import React, { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Save, Headphones, BookOpen, PenLine, Mic, ChevronUp, ChevronDown, Pencil, FileText, Crown, Gift } from "lucide-react";
import { loadExercises, saveExercise } from "../../shared/exerciseStore.js";
import { uid } from "../../shared/questions.js";
import Builder from "./Builder.jsx";
import XemDeThu from "./XemDeThu.jsx";
import { nhomTheoTrinhDo } from "../../shared/trinhDoDe.js";
import { loadExams, saveExam, deleteExam, cotGrilleSanSang, luuThuTuDe } from "../../shared/examStore.js";
import { EXAM_STRUCTURE, khongCham } from "../exam/examPaper.js";
import GrilleEditor, { grilleLuuDuoc } from "./GrilleEditor.jsx";
import { tr } from "../../shared/i18n.jsx";

/* Soạn đề thi thử — màn hình của giáo viên.
 *
 * ══ Ý CHÍNH ══
 *
 * 19/10 (theo chủ dự án): soạn nội dung đề thi NGAY TẠI ĐÂY, không lấy bài từ
 * thư viện luyện tập. Mỗi phần thi có « Soạn bài mới » và « Sửa nội dung »; cả
 * hai mở Builder và lưu vào kho RIÊNG của đề thi (store 'exam', migration 140).
 * Đề vẫn chỉ THAM CHIẾU bài qua exam_sections (không chép câu hỏi), nên đáp án
 * vẫn khoá ở answer_key và Edge Function grade chấm như cũ.
 *
 * Nhờ vậy không có trình soạn thứ hai phải bảo trì song song, đáp án vẫn nằm
 * nguyên chỗ bị khoá, và Edge Function `grade` chấm đề thi bằng đúng đường nó
 * chấm bài luyện tập.
 *
 * ══ Vì sao lọc bài theo kỹ năng ══
 *
 * Ô chọn của phần CO chỉ liệt kê bài có kỹ năng « Écoute ». Cho chọn tự do thì
 * sớm muộn có đề mà phần "nghe hiểu" lại là một bài chia động từ — không có gì
 * chặn, và học sinh là người phát hiện ra.
 */

/* Mọi mã trong EXAM_STRUCTURE phải có một icon ở đây.
   Thiếu một dòng thì `const Icon = ICON[phan.code]` ra undefined, và React
   ném "Element type is invalid" — trắng cả màn soạn đề, không phải thiếu một
   hình. Đúng chuyện đã xảy ra khi PO được thêm vào cấu trúc mà quên dòng này;
   check:exam nay canh chỗ đó. */
const ICON = { CO: Headphones, CE: BookOpen, PE: PenLine, PO: Mic };

/* Số phần CHẤM ĐIỂM đã có bài. Phần không chấm không nằm trong phép đếm
   "đề đã đủ chưa" — nó không làm đề thiếu, và cũng không làm đề đủ. */
const soPhanCham = (sections) =>
  new Set((sections ?? []).filter((s) => !khongCham(s)).map((s) => s.code)).size;

/* Nhãn ngắn cho một bài trong đề: phần Viết / Nói không có câu hỏi (đề bài nằm
   ở consigne), nên ghi « đề bài » thay vì « 0 câu ». */
const nhanBai = (ex) => {
  const so = ex.questions?.length ?? 0;
  const phan = [so ? tr(`${so} câu`, `${so} questions`, `${so} questions`) : tr("đề bài", "sujet", "prompt")];
  if (ex.readingText) phan.push(tr("bài đọc", "texte", "text"));
  if (ex.audioUrl) phan.push(tr("âm thanh", "audio", "audio"));
  if (ex.bocTham) phan.push(tr("bốc thăm", "tirage", "draw"));
  return phan.join(" · ");
};

/* `sections` giờ chỉ chứa những bài ĐÃ CHỌN, mỗi bài một dòng.
 *
 * Bản cũ tạo sẵn ba dòng rỗng — một cho mỗi kỹ năng — vì mỗi kỹ năng chỉ nhận
 * đúng một bài. Từ migration 044 thì một kỹ năng nhận được nhiều bài, nên "ba
 * dòng rỗng" không còn là hình dạng đúng: nó vừa giới hạn số bài, vừa buộc mọi
 * chỗ đọc phải phân biệt dòng rỗng với dòng thật.
 *
 * Nay mảng bắt đầu RỖNG và chỉ dài ra khi giáo viên chọn. Khung ba kỹ năng vẫn
 * hiện đủ, nhưng nó dựng từ EXAM_STRUCTURE chứ không từ dữ liệu — cấu trúc kỳ
 * thi là hằng số, không phải thứ nằm trong bản nháp. */
function DeMoi(level) {
  return { exam: { title: "", level, is_published: false, chi_vip: false }, sections: [] };
}

export default function ExamComposer({ t }) {
  const [kho, setKho] = useState([]);
  const [dsDe, setDsDe] = useState([]);
  const [draft, setDraft] = useState(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState("de");
  /* Bài đang soạn trong Builder: { bai, code, moi }. */
  const [soan, setSoan] = useState(null);
  /* « Xem như học sinh » (19/10): đề đang xem thử, dạng { title, id, sections }. */
  const [xemThu, setXemThu] = useState(null);
  const lopXem = xemThu && <XemDeThu exam={xemThu} kho={kho} dong={() => setXemThu(null)} />;

  const taiLai = () => loadExams().then(setDsDe);
  /* 13/10: đề thi thử chỉ ghép bài trong kho thi thử (store 'exam'), không lấy từ thư viện luyện tập. */
  useEffect(() => { loadExercises("exam").then(setKho); taiLai(); }, []);

  const doiLevel = (level) => setDraft((d) => ({
    exam: { ...d.exam, level,
      /* Thang riêng đi theo đề, nhưng nhãn trình độ bên trong phải khớp — nếu
         không nó tự giới thiệu là thang B1 trên một đề B2. */
      grille: d.exam.grille ? { ...d.exam.grille, level } : null },
    /* Đổi trình độ thì thời lượng từng phần đổi theo cấu trúc thật (B1 45′ CE,
       B2 60′). Giữ những bài đã chọn NẾU chúng cùng trình độ, bỏ những bài
       không — một đề B2 mà phần CE là bài A1 thì không còn là đề B2.
       Bỏ im lặng là đúng ở đây: giáo viên vừa tự tay đổi trình độ, nên việc
       danh sách bài đổi theo không phải là điều bất ngờ. */
    sections: d.sections
      .filter((s) => kho.find((x) => x.id === s.exercise_id)?.level === level)
      .map((s) => {
        const p = EXAM_STRUCTURE[level].find((x) => x.code === s.code);
        return { ...s, minutes: p.minutes, points: p.points };
      }),
  }));

  const luu = async () => {
    /* Kiểm thang TRƯỚC khi gọi mạng. Ràng buộc ở migration 035 sẽ chặn thật,
       nhưng nó trả về một thông báo Postgres thô — giáo viên đọc xong vẫn không
       biết tiêu chí nào sai. Kiểm ở đây để nói được tên tiêu chí. */
    const ok = grilleLuuDuoc(draft.exam.grille);
    if (!ok.ok) { alert(tr("❌ Thang chấm chưa dùng được: ", "❌ Grille inutilisable : ", "❌ Grid not usable: ") + ok.vi); return; }

    setDangLuu(true);
    const r = await saveExam(draft.exam, draft.sections);
    setDangLuu(false);
    if (!r.ok) { alert(tr("❌ Không lưu được đề: ", "❌ Sujet non enregistré : ", "❌ Couldn't save the exam: ") + (r.error?.message ?? "")); return; }
    setToast(tr("✅ Đã lưu đề.", "✅ Sujet enregistré.", "✅ Exam saved."));
    setTimeout(() => setToast(""), 2500);
    setDraft(null);
    taiLai();
  };

  /* Đổi chỗ đề trong cùng trình độ (25/10). Cập nhật tại chỗ trước, lưu sau; lưu hỏng
     thì báo và tải lại thứ tự thật từ máy chủ. */
  const [loiThuTu, setLoiThuTu] = useState("");
  const doiCho = async (nhom, i, huong) => {
    const j = i + huong;
    if (j < 0 || j >= nhom.length) return;
    const moi = [...nhom]; [moi[i], moi[j]] = [moi[j], moi[i]];
    const viTri = new Map(moi.map((e, k) => [e.id, k]));
    setDsDe((ds) => [...ds].sort((a, b) => (a.level === b.level && viTri.has(a.id) && viTri.has(b.id) ? viTri.get(a.id) - viTri.get(b.id) : 0)));
    const n = await luuThuTuDe(moi.map((e) => e.id));
    if (n !== moi.length) { setLoiThuTu(tr("Chưa lưu được thứ tự, đã tải lại.", "Ordre non enregistré.", "Order not saved.")); taiLai(); }
    else setLoiThuTu("");
  };

  const xoa = async (id) => {
    if (!confirm(tr("Xoá hẳn đề này? Nội dung các bài vẫn được giữ trong kho đề thi.", "Supprimer ce sujet ? Le contenu des épreuves est conservé.", "Delete this exam? Its exercise content is kept."))) return;
    const r = await deleteExam(id);
    if (!r.ok) { alert(tr("❌ Không xoá được: ", "❌ Suppression impossible : ", "❌ Couldn't delete: ") + (r.error?.message ?? "")); return; }
    taiLai();
  };

  /* ── Danh sách ── */
  if (!draft) {
    return (
      <div className="mx-auto max-w-3xl py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-extrabold text-ink">{tr("Đề thi thử", "Examens blancs", "Mock exams")}</h1>
            <p className="m-0 mt-1 text-sm text-soft">
              {tr("Soạn trọn một đề: Nghe, Đọc, Viết, Nói. Nội dung đề thi nằm riêng, không lẫn với thư viện luyện tập.", "Rédigez un sujet complet : CO, CE, PE, PO. Le contenu des examens est séparé de la bibliothèque.", "Write a full exam: listening, reading, writing, speaking. Exam content is kept apart from the practice library.")}
            </p>
          </div>
          <button type="button" onClick={() => { setTab("de"); setDraft(DeMoi("B1")); }}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg">
            <Plus size={16} /> {tr("Soạn đề mới", "Nouveau sujet", "New exam")}
          </button>
        </div>

        {toast && <p className="m-0 mt-4 text-sm font-semibold text-ok">{toast}</p>}
        {lopXem}

        {loiThuTu && <p className="m-0 mt-4 text-sm font-semibold text-danger">{loiThuTu}</p>}
        {dsDe.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
            <p className="m-0 font-bold text-ink">{tr("Chưa có đề nào", "Aucun sujet", "No exams yet")}</p>
            <p className="m-0 mt-1 text-sm text-soft">
              {tr("Học sinh chỉ thấy đề đã phát hành. Chưa có đề thì mục « Thi thử » của các em sẽ trống.", "Les élèves ne voient que les sujets publiés.", "Students only see published exams.")}
            </p>
          </div>
        ) : (
          nhomTheoTrinhDo(dsDe).map((g) => (
          <section key={g.level} className="mt-6">
            <h3 className="m-0 mb-2 flex items-baseline gap-2 text-sm font-extrabold text-ink">
              DELF {g.level}
              <span className="text-xs font-semibold text-soft">{g.de.length} {tr("đề ·", "sujet(s) ·", "exam(s) ·")} {g.de.filter((e) => e.is_published).length} {tr("đã phát hành", "publié(s)", "published")}</span>
            </h3>
            {g.de.length === 0 && <p className="m-0 rounded-2xl bg-surface2 px-4 py-3 text-xs text-soft">{tr("Chưa có đề", "Aucun sujet", "No exam at")} {g.level}.</p>}
          <ul className="m-0 list-none space-y-3 p-0">
            {g.de.map((e, i) => (
              <li key={e.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
                <div className="flex shrink-0 flex-col gap-1">
                  <button type="button" onClick={() => doiCho(g.de, i, -1)} disabled={i === 0} title={tr("Lên trên", "Monter", "Move up")}
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg border-0 bg-surface2 text-soft hover:text-primary disabled:cursor-default disabled:opacity-30"><ChevronUp size={15} /></button>
                  <button type="button" onClick={() => doiCho(g.de, i, 1)} disabled={i === g.de.length - 1} title={tr("Xuống dưới", "Descendre", "Move down")}
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg border-0 bg-surface2 text-soft hover:text-primary disabled:cursor-default disabled:opacity-30"><ChevronDown size={15} /></button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">{e.title}</span>
                    <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-bold text-soft">{e.level}</span>
                    {e.chi_vip
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2 py-0.5 text-xs font-bold text-warn"><Crown size={12} /> VIP</span>
                      : <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-bold text-soft">{tr("Thường", "Gratuit", "Free")}</span>}
                    {e.is_published
                      ? <span className="inline-flex items-center gap-1 text-xs font-bold text-ok"><Eye size={12} /> {tr("đã phát hành", "publié(s)", "published")}</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-bold text-warn"><EyeOff size={12} /> nháp</span>}
                  </div>
                  <div className="mt-1 text-xs text-soft">
                    {/* Đếm KỸ NĂNG, không đếm dòng: một đề 6 bài chia đều ba kỹ
                        năng vẫn là « 3/3 phần », không phải « 6/3 ».

                        Và chỉ đếm phần CHẤM ĐIỂM. PO là tuỳ chọn — đề không có
                        nó vẫn là đề đủ, học sinh còn bỏ chọn được ở màn chờ.
                        Tính PO vào đây thì mọi đề đang có bỗng hiện « thiếu
                        phần » màu đỏ, và lời cảnh báo đó là sai. */}
                    {soPhanCham(e.sections)}{tr("/3 phần", "/3 parties", "/3 parts")}
                    {e.sections.length > 3 && tr(` · ${e.sections.length} bài`, ` · ${e.sections.length} exercices`, ` · ${e.sections.length} exercises`)}
                    {` · ${e.duration_min ?? 0}′`}
                    {soPhanCham(e.sections) < 3 && (
                      <span className="ml-2 font-bold text-danger">{tr("thiếu phần", "incomplet", "missing parts")}</span>
                    )}
                    {e.sections.some((s) => s.code === "PO") && (
                      <span className="ml-2 font-semibold text-primary">+ PO</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => setXemThu(e)} title={tr("Xem đề như học sinh", "Voir comme un élève", "View as a student")}
                    className="inline-flex items-center gap-1.5 rounded-full border-0 bg-primary-soft px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white">
                    <Eye size={15} /> {tr("Xem như học sinh", "Aperçu élève", "Student view")}
                  </button>
                  <button type="button"
                    onClick={() => { setTab("de"); setDraft({
                      /* `grille` phải mang theo. Bỏ sót nó thì mở đề ra rồi bấm
                         Lưu là thang riêng biến mất — không cảnh báo, không dấu
                         vết, và giáo viên chỉ phát hiện khi học sinh tự chấm. */
                      exam: { id: e.id, title: e.title, level: e.level,
                              is_published: e.is_published, chi_vip: !!e.chi_vip, grille: e.grille ?? null },
                      /* Mang theo MỌI dòng, không gom về một dòng mỗi kỹ năng.
                         Bản cũ dùng `find` nên đề có ba bài CO mở ra chỉ còn
                         bài đầu — và bấm Lưu là hai bài kia biến mất. */
                      sections: (e.sections ?? []).map((cu) => {
                        const p = EXAM_STRUCTURE[e.level].find((x) => x.code === cu.code);
                        return { code: cu.code, exercise_id: cu.exercise_id,
                                 minutes: p?.minutes ?? cu.minutes, points: p?.points ?? cu.points };
                      }),
                    }); }}
                    className="rounded-full border-0 bg-surface2 px-4 py-2 text-sm font-semibold text-ink">
                    {tr("Sửa", "Modifier", "Edit")}
                  </button>
                  <button type="button" onClick={() => xoa(e.id)}
                    className="rounded-full border-0 bg-surface2 px-3 py-2 text-danger">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          </section>
          ))
        )}
      </div>
    );
  }

  /* ── Soạn / sửa NỘI DUNG một bài của đề (Builder) ── */
  if (draft && soan) {
    return <Builder draft={soan.bai} setDraft={(b) => setSoan((x) => ({ ...x, bai: typeof b === "function" ? b(x.bai) : b }))} accounts={[]}
      publish={async () => {
        const bai = { ...soan.bai, usageType: "practice", level: draft.exam.level };
        const ket = await saveExercise(bai, "exam");
        if (!ket.ok) { alert(tr("❌ Không lưu được bài: ", "❌ Épreuve non enregistrée : ", "❌ Couldn't save: ") + (ket.error?.message ?? "")); return; }
        setKho((k) => [...k.filter((x) => x.id !== bai.id), bai]);
        if (soan.moi) {
          const p = EXAM_STRUCTURE[draft.exam.level].find((x) => x.code === soan.code);
          setDraft((d) => ({ ...d, sections: [...d.sections, { code: soan.code, minutes: p.minutes, points: p.points, exercise_id: bai.id }] }));
        }
        setSoan(null);
      }}
      cancel={() => setSoan(null)} />;
  }

  /* ── Trình soạn ── */
  /* Kỹ năng CHƯA CÓ BÀI NÀO. Bản cũ đếm dòng có exercise_id rỗng — hình dạng
     đó không còn tồn tại từ khi sections chỉ chứa bài đã chọn. */
  const thieu = EXAM_STRUCTURE[draft.exam.level]
    .filter((p) => !khongCham(p) && !draft.sections.some((s) => s.code === p.code));

  return (
    <div className="mx-auto max-w-3xl py-6">
      {lopXem}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 text-2xl font-extrabold text-ink">
          {draft.exam.id ? tr("Sửa đề thi", "Modifier le sujet", "Edit exam") : tr("Soạn đề thi mới", "Nouveau sujet", "New exam")}
        </h1>
        {/* Xem bản ĐANG SOẠN (chưa cần lưu): dùng sections của bản nháp. */}
        <button type="button" onClick={() => setXemThu({ id: draft.exam.id, title: draft.exam.title || tr("Đề đang soạn", "Sujet en cours", "Draft exam"), sections: draft.sections.map((x, i) => ({ ...x, ord: i })) })}
          className="inline-flex items-center gap-1.5 rounded-full border-0 bg-primary-soft px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white">
          <Eye size={15} /> {tr("Xem như học sinh", "Aperçu élève", "Student view")}
        </button>
      </div>

      {/* Hai tab. Cấu trúc đề và thang chấm là hai việc khác nhau, làm ở hai
          lúc khác nhau — nhồi chung một trang thì thang chấm nằm dưới cùng, sau
          ba ô chọn bài, và không ai cuộn xuống tới nó. */}
      <div className="mt-5 flex gap-2 border-b border-line">
        {[["de", tr("Cấu trúc đề", "Structure", "Structure")], ["grille", tr("Thang chấm PE", "Grille PE", "PE grid")]].map(([k, nhan]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`-mb-px border-0 border-b-2 bg-transparent px-4 py-2.5 text-sm font-bold ${
              tab === k ? "border-primary text-primary" : "border-transparent text-soft hover:text-ink"}`}>
            {nhan}
            {k === "grille" && draft.exam.grille && (
              <span className="ml-2 rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-bold text-warn">
                {tr("riêng", "personnalisée", "custom")}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "grille" ? (
        <div className="mt-6">
          <GrilleEditor
            level={draft.exam.level}
            grille={draft.exam.grille ?? null}
            cotSanSang={cotGrilleSanSang()}
            onChange={(g) => setDraft({ ...draft, exam: { ...draft.exam, grille: g } })}
          />
          <div className="mt-8 flex items-center gap-3 border-t border-line pt-5">
            <button type="button" onClick={luu} disabled={dangLuu}
              className="inline-flex items-center gap-2 rounded-full border-0 bg-primary px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40">
              <Save size={15} /> {dangLuu ? tr("Đang lưu…", "Enregistrement…", "Saving…") : tr("Lưu đề", "Enregistrer", "Save exam")}
            </button>
            <button type="button" onClick={() => setDraft(null)}
              className="rounded-full border-0 bg-surface2 px-5 py-2.5 text-sm font-bold text-soft">
              {tr("Huỷ", "Annuler", "Cancel")}
            </button>
          </div>
        </div>
      ) : (
      <>
      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-soft">{tr("Tên đề", "Titre du sujet", "Exam title")}</span>
          <input value={draft.exam.title}
            onChange={(e) => setDraft({ ...draft, exam: { ...draft.exam, title: e.target.value } })}
            placeholder={tr("Ví dụ: DELF B1 — đề số 1", "Ex. : DELF B1 · Sujet 1", "e.g. DELF B1 · Exam 1")}
            className="mt-1 w-full rounded-xl border border-line bg-surface2 px-4 py-2.5 text-sm text-ink" />
        </label>

        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-soft">{tr("Trình độ", "Niveau", "Level")}</span>
          <div className="mt-1 flex gap-2">
            {Object.keys(EXAM_STRUCTURE).map((lv) => (
              <button key={lv} type="button" onClick={() => doiLevel(lv)}
                className={`rounded-full border-0 px-5 py-2 text-sm font-bold ${
                  lv === draft.exam.level ? "bg-primary text-white" : "bg-surface2 text-soft"}`}>
                {lv}
              </button>
            ))}
          </div>
        </div>

        {/* Loại đề (19/10): thường hay VIP. Đề VIP: tài khoản thường thấy đề kèm nhãn
            VIP và nút nâng cấp, máy chủ từ chối bắt đầu thi (CAN_VIP). */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-soft">{tr("Loại đề", "Accès", "Access")}</span>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {[[false, Gift, tr("Đề thường", "Sujet gratuit", "Free exam"), tr("Mọi học sinh đều làm được.", "Ouvert à tous les élèves.", "Open to every student.")],
              [true, Crown, tr("Đề VIP", "Sujet VIP", "VIP exam"), tr("Chỉ tài khoản VIP làm được; tài khoản thường thấy nhãn VIP và nút nâng cấp.", "Réservé aux membres VIP.", "VIP members only.")]].map(([gt, Icon, ten, mo]) => {
              const on = !!draft.exam.chi_vip === gt;
              return (
                <button key={String(gt)} type="button" onClick={() => setDraft({ ...draft, exam: { ...draft.exam, chi_vip: gt } })} aria-pressed={on}
                  className={`flex items-start gap-3 rounded-2xl border-2 border-solid p-3 text-left ${on ? (gt ? "border-amber-400 bg-warn-soft" : "border-primary bg-primary-soft") : "border-line bg-surface hover:border-primary/40"}`}>
                  <Icon size={18} className={`mt-0.5 shrink-0 ${gt ? "text-amber-500" : "text-primary"}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold text-ink">{ten}</span>
                    <span className="block text-xs text-soft">{mo}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ba phần thi. Thời lượng lấy từ cấu trúc DELF thật và KHÔNG cho sửa —
          đó là con số của kỳ thi, không phải tuỳ chọn. */}
      <div className="mt-8 space-y-4">
        {/* Lặp theo CẤU TRÚC KỲ THI, không theo dữ liệu nháp.
           Cấu trúc DELF là hằng số — ba phần, thời lượng cố định — nên khung
           phải luôn hiện đủ ba kể cả khi chưa chọn bài nào. Lặp theo
           `draft.sections` như bản cũ thì đề rỗng hiện ra một trang trắng, và
           giáo viên không biết mình đang thiếu gì. */}
        {EXAM_STRUCTURE[draft.exam.level].map((phan) => {
          const daChon = draft.sections.filter((s) => s.code === phan.code);
          const Icon = ICON[phan.code];
          /* Bài mới: đúng trình độ + kỹ năng của phần, lưu vào kho đề thi. */
          const soanMoi = () => setSoan({ moi: true, code: phan.code, bai: {
            id: uid(), title: `${phan.label} ${draft.exam.level} · ${draft.exam.title || tr("đề mới", "nouveau sujet", "new exam")}`,
            level: draft.exam.level, skill: phan.skill, skills: [phan.skill], consigne: "", usageType: "practice",
            deadline: "", audioUrl: "", readingText: "", imageUrl: "", timeLimit: "", targeted: false,
            assignedClasses: [], assignedExtra: [], assignedTo: null, createdAt: Date.now(), questions: [] } });
          const suaBai = (ex) => setSoan({ moi: false, code: phan.code, bai: JSON.parse(JSON.stringify(ex)) });

          const bo = (id) => setDraft({
            ...draft,
            sections: draft.sections.filter((s) => !(s.code === phan.code && s.exercise_id === id)),
          });
          const doiCho = (id, huong) => {
            const ds = [...draft.sections];
            const iTrong = ds.findIndex((s) => s.code === phan.code && s.exercise_id === id);
            /* Đổi chỗ với bài LIỀN KỀ CÙNG KỸ NĂNG, không phải với phần tử liền
               kề trong mảng — mảng trộn lẫn cả ba kỹ năng, nên đổi mù sẽ đẩy
               một bài CO sang giữa nhóm CE. */
            const cungCode = ds.map((s, j) => (s.code === phan.code ? j : -1)).filter((j) => j >= 0);
            const viTri = cungCode.indexOf(iTrong);
            const dich = cungCode[viTri + huong];
            if (dich === undefined) return;
            [ds[iTrong], ds[dich]] = [ds[dich], ds[iTrong]];
            setDraft({ ...draft, sections: ds });
          };

          return (
            <div key={phan.code} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-primary" />
                <span className="text-sm font-bold text-ink">{phan.code} · {phan.label}</span>
                <span className="ml-auto text-xs text-soft">
                  {phan.minutes}′ · {khongCham(phan) ? tr("không chấm điểm", "non noté", "not scored") : `/${phan.points}`}
                  {daChon.length > 0 && tr(` · ${daChon.length} bài`, ` · ${daChon.length} exercices`, ` · ${daChon.length} exercises`)}
                </span>
              </div>

              {/* Đồng hồ và điểm thuộc về CẢ PHẦN, không phải từng bài. Nói ra
                  ở đây vì giáo viên thêm bài thứ ba rất dễ tưởng đề dài thêm
                  25 phút nữa. */}
              {khongCham(phan) && (
                <p className="m-0 mt-2 text-xs text-soft">
                  {tr("Phần tuỳ chọn. Học sinh ghi âm để tự nghe lại và bạn nghe ở mục « Bài nói »; hệ thống không cho điểm, và học sinh bỏ chọn được phần này khi vào thi. Đề không có PO vẫn là đề đủ.", "Partie facultative : l'élève s'enregistre pour se réécouter, sans note. Un sujet sans PO reste complet.", "Optional part: students record themselves to listen back, no score. An exam without PO is still complete.")}
                </p>
              )}

              {daChon.length > 1 && !khongCham(phan) && (
                <p className="m-0 mt-2 text-xs text-soft">
                  {daChon.length} {tr("bài dùng chung", "exercices partagent", "exercises share")} {phan.minutes} {tr("phút và", "minutes et", "minutes and")} {phan.points} {tr("điểm của phần này.", "points pour cette partie.", "points for this part.")}
                </p>
              )}

              {daChon.length > 0 && (
                <ol className="m-0 mt-3 list-none space-y-2 p-0">
                  {daChon.map((s, j) => {
                    const ex = kho.find((x) => x.id === s.exercise_id);
                    return (
                      <li key={s.exercise_id}
                          className="flex items-center gap-2 rounded-xl bg-surface2 px-3 py-2">
                        <span className="shrink-0 text-xs font-bold tabular-nums text-soft">{j + 1}.</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">{ex ? ex.title : tr("(bài này đã bị xoá)", "(épreuve supprimée)", "(deleted)")}</span>
                          {ex && <span className="block text-xs text-soft">{nhanBai(ex)}</span>}
                        </span>
                        {ex && (
                          <button type="button" onClick={() => suaBai(ex)} title={tr("Sửa nội dung", "Modifier le contenu", "Edit content")}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full border-0 bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white">
                            <Pencil size={12} /> {tr("Sửa nội dung", "Modifier", "Edit")}
                          </button>
                        )}
                        <button type="button" onClick={() => doiCho(s.exercise_id, -1)}
                          disabled={j === 0} title={tr("Đưa lên trên", "Monter", "Move up")}
                          className="shrink-0 rounded-full border-0 bg-transparent px-1.5 py-1 text-soft hover:text-ink disabled:opacity-30">
                          <ChevronUp size={15} />
                        </button>
                        <button type="button" onClick={() => doiCho(s.exercise_id, 1)}
                          disabled={j === daChon.length - 1} title={tr("Đưa xuống dưới", "Descendre", "Move down")}
                          className="shrink-0 rounded-full border-0 bg-transparent px-1.5 py-1 text-soft hover:text-ink disabled:opacity-30">
                          <ChevronDown size={15} />
                        </button>
                        <button type="button" onClick={() => { if (confirm(tr("Bỏ bài này khỏi đề? Nội dung bài vẫn được giữ trong kho đề thi.", "Retirer cette épreuve du sujet ? Son contenu est conservé.", "Remove from this exam? Its content is kept."))) bo(s.exercise_id); }} title={tr("Bỏ khỏi đề", "Retirer du sujet", "Remove from exam")}
                          className="shrink-0 rounded-full border-0 bg-transparent px-1.5 py-1 text-soft hover:text-danger">
                          <Trash2 size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}

              <button type="button" onClick={soanMoi}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-transparent px-4 py-2.5 text-sm font-bold text-primary hover:border-primary hover:bg-primary-soft">
                {daChon.length ? <Plus size={15} /> : <FileText size={15} />}
                {daChon.length ? tr("Thêm bài cho phần này", "Ajouter une épreuve", "Add an exercise") : tr("Soạn nội dung phần này", "Rédiger cette partie", "Write this part")}
              </button>
            </div>
          );
        })}
      </div>

      {/* Phát hành là hành động có hậu quả: học sinh thấy ngay. Nên nó nằm
          riêng, có lời cảnh báo, không lẫn vào các ô khác. */}
      <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl bg-surface2 p-4 text-sm text-ink">
        <input type="checkbox" checked={draft.exam.is_published}
          onChange={(e) => setDraft({ ...draft, exam: { ...draft.exam, is_published: e.target.checked } })}
          className="mt-1" />
        <span>
          <strong>{tr("Phát hành cho học sinh", "Publier pour les élèves", "Publish to students")}</strong>
          <span className="mt-0.5 block text-xs text-soft">
            {tr("Bỏ chọn thì đề là bản nháp — chỉ giáo viên thấy.", "Décoché, le sujet reste un brouillon visible par les enseignants.", "Unticked, the exam stays a draft only teachers see.")}
            {thieu.length > 0 && (
              <span className="mt-1 block font-bold text-danger">
                {tr("Đề còn thiếu", "Il manque", "Missing")} {thieu.map((x) => x.code).join(", ")}{tr(". Phát hành lúc này thì học sinh mở ra sẽ gặp một đề khuyết phần.", ". Publier maintenant donnerait un sujet incomplet.", ". Publishing now would give students an incomplete exam.")}
              </span>
            )}
          </span>
        </span>
      </label>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={luu} disabled={dangLuu}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50">
          <Save size={16} /> {dangLuu ? tr("Đang lưu…", "Enregistrement…", "Saving…") : tr("Lưu đề", "Enregistrer", "Save exam")}
        </button>
        <button type="button" onClick={() => setDraft(null)}
          className="rounded-full border-0 bg-transparent px-4 py-3 text-sm font-semibold text-soft">
          {tr("Huỷ", "Annuler", "Cancel")}
        </button>
      </div>
      </>
      )}
    </div>
  );
}
