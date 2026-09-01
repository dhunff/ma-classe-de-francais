import React, { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Save, AlertTriangle, Headphones, BookOpen, PenLine, Mic, ChevronUp, ChevronDown } from "lucide-react";
import { loadPractice } from "../../shared/exerciseStore.js";
import { loadExams, saveExam, deleteExam, cotGrilleSanSang } from "../../shared/examStore.js";
import { EXAM_STRUCTURE, khongCham } from "../exam/examPaper.js";
import GrilleEditor, { grilleLuuDuoc } from "./GrilleEditor.jsx";

/* Soạn đề thi thử — màn hình của giáo viên.
 *
 * ══ Ý CHÍNH ══
 *
 * Đề thi KHÔNG chứa câu hỏi; nó CHỌN ba bài đã có trong thư viện. Giáo viên
 * soạn nội dung bằng Builder như thường, rồi vào đây ghép ba bài thành một đề.
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

const coSkill = (ex, skill) =>
  Array.isArray(ex?.skills) ? ex.skills.includes(skill) : ex?.skill === skill;

/* Nhãn cho một bài trong ô chọn.
 *
 * ══ VÌ SAO KHÔNG THÊM TRÌNH ĐỘ ══
 *
 * Danh sách đã lọc `ex.level === draft.exam.level`, nên mọi dòng đều cùng một
 * trình độ. In nó ra thì mỗi dòng đều "B1" — tốn chỗ, không phân biệt được gì,
 * và làm loãng phần thật sự khác nhau.
 *
 * ══ THỨ THẬT SỰ PHÂN BIỆT ══
 *
 * Thư viện có hai bài cùng tên « Activité 1 »: một bài kèm ảnh, bài kia không.
 * Ô chọn cũ chỉ hiện tên và số câu, nên hai dòng trông y hệt — giáo viên chọn
 * nhầm thì học sinh vào phòng thi mới biết, và không ai truy được vì sao.
 *
 * Nên: đánh dấu NGỮ LIỆU (ảnh / bài đọc / nghe). Đó là thứ khác nhau giữa hai
 * bài trùng tên, và cũng là thứ giáo viên cần biết khi ghép đề.
 *
 * Mã id chỉ hiện khi tên bị TRÙNG trong chính danh sách này. Hiện mọi lúc là
 * thêm nhiễu cho trường hợp không có gì để phân biệt. */
const nhanBai = (ex, trungTen) => {
  const phan = [`${ex.questions.length} câu`];
  if (ex.imageUrl) phan.push("ảnh");
  if (ex.readingText) phan.push("bài đọc");
  if (ex.audioUrl) phan.push("âm thanh");
  if (trungTen) phan.push(`#${String(ex.id).slice(-4)}`);
  return `${ex.title} — ${phan.join(" · ")}`;
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
  return { exam: { title: "", level, is_published: false }, sections: [] };
}

export default function ExamComposer({ t }) {
  const [kho, setKho] = useState([]);
  const [dsDe, setDsDe] = useState([]);
  const [draft, setDraft] = useState(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState("de");

  const taiLai = () => loadExams().then(setDsDe);
  useEffect(() => { loadPractice().then(setKho); taiLai(); }, []);

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
    if (!ok.ok) { alert("❌ Thang chấm chưa dùng được: " + ok.vi); return; }

    setDangLuu(true);
    const r = await saveExam(draft.exam, draft.sections);
    setDangLuu(false);
    if (!r.ok) { alert("❌ Không lưu được đề: " + (r.error?.message ?? "")); return; }
    setToast("✅ Đã lưu đề.");
    setTimeout(() => setToast(""), 2500);
    setDraft(null);
    taiLai();
  };

  const xoa = async (id) => {
    if (!confirm("Xoá hẳn đề này? Bài tập bên trong vẫn còn nguyên trong thư viện.")) return;
    const r = await deleteExam(id);
    if (!r.ok) { alert("❌ Không xoá được: " + (r.error?.message ?? "")); return; }
    taiLai();
  };

  /* ── Danh sách ── */
  if (!draft) {
    return (
      <div className="mx-auto max-w-3xl py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-extrabold text-ink">Đề thi thử</h1>
            <p className="m-0 mt-1 text-sm text-soft">
              Ghép ba bài trong thư viện thành một đề CO + CE + PE.
            </p>
          </div>
          <button type="button" onClick={() => { setTab("de"); setDraft(DeMoi("B1")); }}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg">
            <Plus size={16} /> Soạn đề mới
          </button>
        </div>

        {toast && <p className="m-0 mt-4 text-sm font-semibold text-ok">{toast}</p>}

        {dsDe.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
            <p className="m-0 font-bold text-ink">Chưa có đề nào</p>
            <p className="m-0 mt-1 text-sm text-soft">
              Học sinh chỉ thấy đề đã phát hành. Chưa có đề thì mục « Thi thử »
              của các em sẽ trống.
            </p>
          </div>
        ) : (
          <ul className="m-0 mt-6 list-none space-y-3 p-0">
            {dsDe.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">{e.title}</span>
                    <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-bold text-soft">{e.level}</span>
                    {e.is_published
                      ? <span className="inline-flex items-center gap-1 text-xs font-bold text-ok"><Eye size={12} /> đã phát hành</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-bold text-warn"><EyeOff size={12} /> nháp</span>}
                  </div>
                  <div className="mt-1 text-xs text-soft">
                    {/* Đếm KỸ NĂNG, không đếm dòng: một đề 6 bài chia đều ba kỹ
                        năng vẫn là « 3/3 phần », không phải « 6/3 ».

                        Và chỉ đếm phần CHẤM ĐIỂM. PO là tuỳ chọn — đề không có
                        nó vẫn là đề đủ, học sinh còn bỏ chọn được ở màn chờ.
                        Tính PO vào đây thì mọi đề đang có bỗng hiện « thiếu
                        phần » màu đỏ, và lời cảnh báo đó là sai. */}
                    {soPhanCham(e.sections)}/3 phần
                    {e.sections.length > 3 && ` · ${e.sections.length} bài`}
                    {` · ${e.duration_min ?? 0}′`}
                    {soPhanCham(e.sections) < 3 && (
                      <span className="ml-2 font-bold text-danger">thiếu phần</span>
                    )}
                    {e.sections.some((s) => s.code === "PO") && (
                      <span className="ml-2 font-semibold text-primary">+ PO</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button"
                    onClick={() => { setTab("de"); setDraft({
                      /* `grille` phải mang theo. Bỏ sót nó thì mở đề ra rồi bấm
                         Lưu là thang riêng biến mất — không cảnh báo, không dấu
                         vết, và giáo viên chỉ phát hiện khi học sinh tự chấm. */
                      exam: { id: e.id, title: e.title, level: e.level,
                              is_published: e.is_published, grille: e.grille ?? null },
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
                    Sửa
                  </button>
                  <button type="button" onClick={() => xoa(e.id)}
                    className="rounded-full border-0 bg-surface2 px-3 py-2 text-danger">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  /* ── Trình soạn ── */
  /* Kỹ năng CHƯA CÓ BÀI NÀO. Bản cũ đếm dòng có exercise_id rỗng — hình dạng
     đó không còn tồn tại từ khi sections chỉ chứa bài đã chọn. */
  const thieu = EXAM_STRUCTURE[draft.exam.level]
    .filter((p) => !khongCham(p) && !draft.sections.some((s) => s.code === p.code));

  return (
    <div className="mx-auto max-w-3xl py-6">
      <h1 className="m-0 text-2xl font-extrabold text-ink">
        {draft.exam.id ? "Sửa đề thi" : "Soạn đề thi mới"}
      </h1>

      {/* Hai tab. Cấu trúc đề và thang chấm là hai việc khác nhau, làm ở hai
          lúc khác nhau — nhồi chung một trang thì thang chấm nằm dưới cùng, sau
          ba ô chọn bài, và không ai cuộn xuống tới nó. */}
      <div className="mt-5 flex gap-2 border-b border-line">
        {[["de", "Cấu trúc đề"], ["grille", "Thang chấm PE"]].map(([k, nhan]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`-mb-px border-0 border-b-2 bg-transparent px-4 py-2.5 text-sm font-bold ${
              tab === k ? "border-primary text-primary" : "border-transparent text-soft hover:text-ink"}`}>
            {nhan}
            {k === "grille" && draft.exam.grille && (
              <span className="ml-2 rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-bold text-warn">
                riêng
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
              <Save size={15} /> {dangLuu ? "Đang lưu…" : "Lưu đề"}
            </button>
            <button type="button" onClick={() => setDraft(null)}
              className="rounded-full border-0 bg-surface2 px-5 py-2.5 text-sm font-bold text-soft">
              Huỷ
            </button>
          </div>
        </div>
      ) : (
      <>
      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-soft">Tên đề</span>
          <input value={draft.exam.title}
            onChange={(e) => setDraft({ ...draft, exam: { ...draft.exam, title: e.target.value } })}
            placeholder="Ví dụ: DELF B1 — đề số 1"
            className="mt-1 w-full rounded-xl border border-line bg-surface2 px-4 py-2.5 text-sm text-ink" />
        </label>

        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-soft">Trình độ</span>
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
          /* Bài không có câu hỏi nào thì vô dụng — TRỪ phần không chấm.
             Bài nói không có câu để trả lời: đề bài nằm ở `consigne`, và màn
             thi thay danh sách câu hỏi bằng bộ ghi âm. Giữ nguyên điều kiện cũ
             cho PO thì thư viện luôn báo "chưa có bài" dù bài đã soạn xong, và
             không có gì chỉ ra vì sao. */
          const ungVien = kho.filter(
            (ex) => ex.level === draft.exam.level && coSkill(ex, phan.skill)
                 && (khongCham(phan) || (ex.questions?.length ?? 0) > 0),
          );
          /* Tên nào xuất hiện quá một lần TRONG CHÍNH danh sách này. Tính theo
             danh sách đã lọc, không theo cả thư viện: hai bài trùng tên nhưng
             khác kỹ năng thì không bao giờ đứng cạnh nhau, và gắn mã id cho
             chúng chỉ là nhiễu. */
          const demTen = {};
          for (const ex of ungVien) {
            const t = String(ex.title).trim();
            demTen[t] = (demTen[t] ?? 0) + 1;
          }
          const tenTrung = new Set(Object.keys(demTen).filter((t) => demTen[t] > 1));

          /* Bài đã chọn rồi thì không hiện lại trong ô thêm. Ràng buộc ở
             migration 044 chặn trùng ở tầng database, nhưng để giáo viên chọn
             được rồi mới báo lỗi khoá trùng là bắt họ đoán. */
          const daChonId = new Set(daChon.map((s) => s.exercise_id));
          const conLai = ungVien.filter((ex) => !daChonId.has(ex.id));

          const them = (id) => {
            if (!id) return;
            setDraft({
              ...draft,
              /* Nối vào CUỐI: thứ tự chọn là thứ tự học sinh sẽ làm, và giáo
                 viên chọn theo thứ tự họ muốn. `ord` sinh lúc lưu. */
              sections: [...draft.sections, {
                code: phan.code, minutes: phan.minutes, points: phan.points, exercise_id: id,
              }],
            });
          };
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
                  {phan.minutes}′ · {khongCham(phan) ? "không chấm điểm" : `/${phan.points}`}
                  {daChon.length > 0 && ` · ${daChon.length} bài`}
                </span>
              </div>

              {/* Đồng hồ và điểm thuộc về CẢ PHẦN, không phải từng bài. Nói ra
                  ở đây vì giáo viên thêm bài thứ ba rất dễ tưởng đề dài thêm
                  25 phút nữa. */}
              {khongCham(phan) && (
                <p className="m-0 mt-2 text-xs text-soft">
                  Phần tuỳ chọn. Học sinh ghi âm để tự nghe lại và bạn nghe ở mục
                  « Bài nói »; hệ thống không cho điểm, và học sinh bỏ chọn được
                  phần này khi vào thi. Đề không có PO vẫn là đề đủ.
                </p>
              )}

              {daChon.length > 1 && !khongCham(phan) && (
                <p className="m-0 mt-2 text-xs text-soft">
                  {daChon.length} bài dùng chung {phan.minutes} phút và {phan.points} điểm của phần này.
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
                        <span className="min-w-0 flex-1 truncate text-sm text-ink">
                          {ex ? nhanBai(ex, tenTrung.has(String(ex.title).trim()))
                              : `(bài ${s.exercise_id} không còn trong thư viện)`}
                        </span>
                        <button type="button" onClick={() => doiCho(s.exercise_id, -1)}
                          disabled={j === 0} title="Đưa lên trên"
                          className="shrink-0 rounded-full border-0 bg-transparent px-1.5 py-1 text-soft hover:text-ink disabled:opacity-30">
                          <ChevronUp size={15} />
                        </button>
                        <button type="button" onClick={() => doiCho(s.exercise_id, 1)}
                          disabled={j === daChon.length - 1} title="Đưa xuống dưới"
                          className="shrink-0 rounded-full border-0 bg-transparent px-1.5 py-1 text-soft hover:text-ink disabled:opacity-30">
                          <ChevronDown size={15} />
                        </button>
                        <button type="button" onClick={() => bo(s.exercise_id)} title="Bỏ khỏi đề"
                          className="shrink-0 rounded-full border-0 bg-transparent px-1.5 py-1 text-soft hover:text-danger">
                          <Trash2 size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}

              {ungVien.length === 0 ? (
                <p className="m-0 mt-3 flex items-start gap-2 text-xs text-danger">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  Thư viện chưa có bài « {phan.skill} » trình độ {draft.exam.level}.
                  Soạn một bài ở mục Luyện tập trước đã.
                </p>
              ) : conLai.length === 0 ? (
                <p className="m-0 mt-3 text-xs text-soft">
                  Đã dùng hết {ungVien.length} bài « {phan.skill} » {draft.exam.level} của thư viện.
                </p>
              ) : (
                /* `value=""` và reset ngay sau khi chọn: ô này là NÚT THÊM, không
                   phải ô hiển thị lựa chọn hiện tại. Để nó giữ giá trị thì chọn
                   lại cùng một bài lần nữa sẽ không kích hoạt onChange. */
                <select value="" onChange={(e) => them(e.target.value)}
                  className="mt-3 w-full rounded-xl border border-line bg-surface2 px-4 py-2.5 text-sm text-ink">
                  <option value="">
                    {daChon.length ? "+ thêm bài nữa vào phần này —" : "— chọn bài —"}
                  </option>
                  {conLai.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {nhanBai(ex, tenTrung.has(String(ex.title).trim()))}
                    </option>
                  ))}
                </select>
              )}
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
          <strong>Phát hành cho học sinh</strong>
          <span className="mt-0.5 block text-xs text-soft">
            Bỏ chọn thì đề là bản nháp — chỉ giáo viên thấy.
            {thieu.length > 0 && (
              <span className="mt-1 block font-bold text-danger">
                Đề còn thiếu {thieu.map((x) => x.code).join(", ")}. Phát hành lúc này thì
                học sinh mở ra sẽ gặp một đề khuyết phần.
              </span>
            )}
          </span>
        </span>
      </label>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={luu} disabled={dangLuu}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50">
          <Save size={16} /> {dangLuu ? "Đang lưu…" : "Lưu đề"}
        </button>
        <button type="button" onClick={() => setDraft(null)}
          className="rounded-full border-0 bg-transparent px-4 py-3 text-sm font-semibold text-soft">
          Huỷ
        </button>
      </div>
      </>
      )}
    </div>
  );
}
