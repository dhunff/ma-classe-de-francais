import React, { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Save, AlertTriangle, Headphones, BookOpen, PenLine } from "lucide-react";
import { loadPractice } from "../../shared/exerciseStore.js";
import { loadExams, saveExam, deleteExam, cotGrilleSanSang } from "../../shared/examStore.js";
import { EXAM_STRUCTURE } from "../exam/examPaper.js";
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

const ICON = { CO: Headphones, CE: BookOpen, PE: PenLine };

const coSkill = (ex, skill) =>
  Array.isArray(ex?.skills) ? ex.skills.includes(skill) : ex?.skill === skill;

function DeMoi(level) {
  return {
    exam: { title: "", level, is_published: false },
    sections: EXAM_STRUCTURE[level].map((p) => ({
      code: p.code, minutes: p.minutes, points: p.points, exercise_id: "",
    })),
  };
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
       B2 60′). Giữ nguyên bài đã chọn nếu bài đó cùng trình độ, còn không thì
       bỏ — một đề B2 mà phần CE là bài A1 thì không còn là đề B2. */
    sections: EXAM_STRUCTURE[level].map((p) => {
      const cu = d.sections.find((s) => s.code === p.code);
      const bai = kho.find((x) => x.id === cu?.exercise_id);
      return {
        code: p.code, minutes: p.minutes, points: p.points,
        exercise_id: bai && bai.level === level ? bai.id : "",
      };
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
                    {e.sections.length}/3 phần · {e.duration_min ?? 0}′
                    {e.sections.length < 3 && (
                      <span className="ml-2 font-bold text-danger">thiếu phần</span>
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
                      sections: EXAM_STRUCTURE[e.level].map((p) => {
                        const cu = e.sections.find((s) => s.code === p.code);
                        return { code: p.code, minutes: cu?.minutes ?? p.minutes,
                                 points: cu?.points ?? p.points, exercise_id: cu?.exercise_id ?? "" };
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
  const thieu = draft.sections.filter((s) => !s.exercise_id);

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
        {draft.sections.map((s, i) => {
          const phan = EXAM_STRUCTURE[draft.exam.level].find((p) => p.code === s.code);
          const Icon = ICON[s.code];
          const ungVien = kho.filter(
            (ex) => ex.level === draft.exam.level && coSkill(ex, phan.skill)
                 && (ex.questions?.length ?? 0) > 0,
          );
          const chon = (id) => setDraft({
            ...draft,
            sections: draft.sections.map((x, j) => (j === i ? { ...x, exercise_id: id } : x)),
          });

          return (
            <div key={s.code} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-primary" />
                <span className="text-sm font-bold text-ink">{s.code} · {phan.label}</span>
                <span className="ml-auto text-xs text-soft">{phan.minutes}′ · /{phan.points}</span>
              </div>

              {ungVien.length === 0 ? (
                <p className="m-0 mt-3 flex items-start gap-2 text-xs text-danger">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  Thư viện chưa có bài « {phan.skill} » trình độ {draft.exam.level}.
                  Soạn một bài ở mục Luyện tập trước đã.
                </p>
              ) : (
                <select value={s.exercise_id} onChange={(e) => chon(e.target.value)}
                  className="mt-3 w-full rounded-xl border border-line bg-surface2 px-4 py-2.5 text-sm text-ink">
                  <option value="">— chọn bài —</option>
                  {ungVien.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} ({ex.questions.length} câu)
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
