import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuanLyVip from "./QuanLyVip.jsx";
import QuyenBaiTap from "./QuyenBaiTap.jsx";
import { C, S, LEVEL_COLORS, LEVEL_PASTEL, QTYPES, VF_OPTS } from "../../shared/tokens.js";
import { load, save, del } from "../../shared/storage.js";
import { loadPractice, saveExercise, deleteExercise } from "../../shared/exerciseStore.js";
import { loadSubmissions, patchSubmission } from "../../shared/submissions.js";
import { useT, tr } from "../../shared/i18n.jsx";
import { SKILLS, fmtDate, isLate, exSkills, assignedTo, totalScore } from "../../shared/exercises.js";
import { guiThongBao } from "../../shared/notifications.js";
import { uid, norm, stripHtml, wordCount, vfOk, fillAccepted, fillOk, autoQ, ordreOk, tableauCells, tableauOk, isQuestionAnswered, getUnansweredQuestionsCount } from "../../shared/questions.js";
import { AVA_COLORS, avaColor, fmtDateFR, fmtDuration, targetedAccounts, fileNameFromUrl, formatLastSeen } from "../../shared/display.js";
import { FloatingLayer, KebabMenu } from "../../shared/ui.jsx";
import { loadHoSoHocSinh } from "../../shared/profileStore.js";
import { PROFILE_FIELDS, LEVELS_PROFILE, GOALS_PROFILE, emptyProfile, calculateProfileCompletion, validateProfile } from "../../shared/profile.js";
import { OrdreChip, OrdreBlocks, TableauCompare, ConfirmSubmitModal } from "../student/answers.jsx";
import { GhepCap, DienPhieu } from "../student/dangMoi.jsx";
import { apparierOk } from "../../shared/questions.js";
import ReadingPanel from "../../editor/ReadingPanel.jsx";
import RichTextEditor from "../../editor/RichTextEditor.jsx";
import { BookOpen, GraduationCap, MoreVertical, Pencil, Copy, Trash2, RotateCcw, RotateCw, Bell, Loader2, Send, AlertTriangle, Image as ImageIcon, X, Phone, Calendar, Target, Briefcase, ChevronLeft, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Builder from "./Builder.jsx";
import PracticeHub from "../../PracticeHub.jsx";
import { PAYMENT_KEY, STATUS, accessRecord, fmtPrice, loadAccess, setAccessRemote, getTeacherToken, setTeacherToken, loadPremiumExercises } from "../../shared/access.js";
import { supabase } from "../../storageShim.js";
import { setClassFor } from "../../shared/roster.js";
import AccessPanel from "./AccessPanel.jsx";
import ThongKe from "./ThongKe.jsx";


/* ================= Teacher ================= */
/* Nút hình viên thuốc cho thanh công cụ.
 *
 * MÀU ĐI QUA TOKEN, không viết cứng. Bản mô tả đề nghị bg-[#1C1D22] và
 * border-gray-700/50 — đúng màu, nhưng viết cứng thì nút giữ nguyên màu tối
 * khi người dùng bật bản SÁNG, và `check:design` chặn (quy tắc 2). Chính
 * token là thứ tạo ra bản tối trong ảnh chụp: surface2 = #14141A ở bản tối,
 * #FAFAFC ở bản sáng.
 *
 * `border-0` bắt buộc vì preflight của Tailwind đang TẮT — thiếu nó thì nút
 * còn viền xám mặc định của trình duyệt chồng lên viền ta tự đặt. */
const NUT_PILL =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 " +
  "text-sm font-semibold text-soft ring-1 ring-inset ring-line transition-colors " +
  "hover:bg-primary-soft hover:text-primary hover:ring-primary/40 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

function Teacher({ exercises, setExercises, submissions, setSubmissions, accounts, setAccounts, classes, setClasses, refresh, routeView }) {
  /* `routeView` đến từ URL. State nội bộ vẫn giữ, vì hai màn hình không có
     địa chỉ riêng — trình soạn bài ("new") và màn chấm bài ("progress:<id>")
     mở chồng lên rồi đóng lại. URL đổi thì kéo state theo; các bước tạm thì
     tự quản. */
  const [view, setView] = useState(routeView || "list");
  /* 07/10: « Thư viện luyện tập » không còn mục menu riêng mà là tab thứ hai
     của trang Bài tập — một chỗ quản lý mọi bài. */
  const [khoBai, setKhoBai] = useState("giao");
  const navigate = useNavigate();
  useEffect(() => { if (routeView) setView(routeView); }, [routeView]);
  // 📣 Annonces
  const [annModal, setAnnModal] = useState(false);
  const [annMsg, setAnnMsg] = useState("");
  const [annAll, setAnnAll] = useState(true);
  const [annClasses, setAnnClasses] = useState([]);
  const [annStudents, setAnnStudents] = useState([]);
  const [annSearch, setAnnSearch] = useState("");
  const [annToast, setAnnToast] = useState("");
  const [annSending, setAnnSending] = useState(false);
  const [annLoi, setAnnLoi] = useState("");

  /* Gửi thông báo.
   *
   * Bản cũ có ba lỗi, và cả ba đều im lặng:
   *
   *   1. `await save(...)` rồi hiện "✅ Annonce envoyée !" mà KHÔNG đọc giá
   *      trị trả về. `save` nuốt lỗi và trả `false`, nên ghi hỏng vì mạng hay
   *      RLS thì giáo viên vẫn thấy dấu tích xanh. Cùng lỗi đã làm mất một
   *      buổi soạn đề (`saveExam`) và suýt xoá sạch câu hỏi (`saveExercise`).
   *
   *   2. Nhắm học sinh theo TÊN lấy từ danh bạ giáo viên gõ tay, còn Bell so
   *      với tên trong phiên đăng nhập. Lệch một dấu cách là không ai nhận,
   *      không có gì báo. Nay gửi kèm `id` để đường mới nhắm bằng uuid.
   *
   *   3. `if (!names.size) return;` — bấm Envoyer, không có gì xảy ra, không
   *      lời giải thích. Nay mọi nhánh thoát đều để lại một câu.
   */
  const sendAnnonce = async () => {
    setAnnLoi("");
    const chon = new Map();          // id/tên → { id, name }
    if (!annAll) {
      const them = (a) => chon.set(a.id || a.name, { id: a.id, name: a.name });
      accounts.filter((a) => annStudents.includes(a.name)).forEach(them);
      annClasses.forEach((cid) => accounts.filter((a) => a.classId === cid).forEach(them));
    }
    const ds = [...chon.values()];

    setAnnSending(true);
    const kq = await guiThongBao({
      noiDung: annMsg,
      choTatCa: annAll,
      ids: ds.map((x) => x.id).filter(Boolean),
      tens: ds.map((x) => x.name),
    });
    setAnnSending(false);

    if (!kq.ok) {
      setAnnLoi({
        trong: tr("Chưa nhập nội dung thông báo.", "L'annonce est vide.", "The announcement is empty."),
        dai: tr("Thông báo dài quá 2000 ký tự.", "Annonce trop longue (2000 caractères max).", "Announcement too long (2000 characters max)."),
        chua_chon_ai: tr("Chưa chọn lớp hoặc học sinh nào.", "Aucun élève sélectionné.", "No students selected."),
        khong_phai_giao_vien: tr("Phiên đăng nhập không có quyền giáo viên. Đăng nhập lại rồi thử lại.", "Session sans droits enseignant. Reconnectez-vous.", "This session lacks teacher rights. Sign in again."),
        chua_co_ham: tr("Máy chủ chưa sẵn sàng (migration 053 chưa chạy).", "Serveur pas prêt (migration 053).", "Server not ready (migration 053)."),
        mang: tr("Không gửi được. Kiểm tra kết nối rồi thử lại.", "Envoi impossible. Vérifiez la connexion.", "Couldn't send. Check your connection."),
      }[kq.loi] || tr("Không gửi được, chưa rõ lý do.", "Envoi impossible, raison inconnue.", "Couldn't send, unknown reason."));
      return;
    }

    setAnnModal(false);
    /* Nói SỐ NGƯỜI NHẬN khi biết. "Đã gửi cho 0 em" xảy ra thật khi lớp chưa
       có ai đăng ký, và im lặng thành công ở đó là nói dối. Đường cũ không
       đếm được nên trả `null`, và khi đó chỉ nói "đã gửi". */
    setAnnToast(
      kq.soNguoiNhan == null ? tr("✅ Đã gửi thông báo.", "✅ Annonce envoyée.", "✅ Announcement sent.")
        : kq.soNguoiNhan === 0 ? tr("⚠️ Đã gửi, nhưng không có học sinh nào nhận — lớp chưa có ai đăng ký tài khoản.", "⚠️ Envoyé, mais aucun élève ne l'a reçu.", "⚠️ Sent, but no student received it.")
          : tr(`✅ Đã gửi tới ${kq.soNguoiNhan} học sinh.`, `✅ Envoyé à ${kq.soNguoiNhan} élève(s).`, `✅ Sent to ${kq.soNguoiNhan} student(s).`));
    setTimeout(() => setAnnToast(""), 4500);
  };
  const [draft, setDraft] = useState(null);

  const t = useT();
  const blank = () => ({ id: uid(), title: "", level: "B1", skill: "Grammaire", skills: ["Grammaire"], consigne: "", usageType: "assignment", deadline: "", audioUrl: "", readingText: "", imageUrl: "", timeLimit: "", targeted: false, assignedClasses: [], assignedExtra: [], assignedTo: null, createdAt: Date.now(), questions: [] });

  // Gom danh sách học sinh được giao : lớp đã tick ∪ học sinh chọn lẻ → mảng unique
  const finalizeTargets = (d) => {
    if (!d.targeted) return { ...d, assignedTo: null };
    const names = new Set(d.assignedExtra || []);
    (d.assignedClasses || []).forEach((cid) =>
      accounts.filter((a) => a.classId === cid).forEach((a) => names.add(a.name)));
    return { ...d, assignedTo: [...names] };
  };

  // Chuẩn hoá bài cũ khi mở Modifier (chưa có skills/targeted)
  const editPrep = (ex) => {
    const c = JSON.parse(JSON.stringify(ex));
    if (!c.skills || !c.skills.length) c.skills = c.skill ? [c.skill] : [];
    if (c.consigne === undefined) c.consigne = "";
    if (!c.usageType) c.usageType = "assignment";
    if (c.targeted === undefined) {
      c.targeted = !!(c.assignedTo && c.assignedTo.length);
      c.assignedExtra = c.assignedTo || [];
      c.assignedClasses = [];
    }
    return c;
  };

  const publish = async () => {
    const final = finalizeTargets(draft);
    final.usageType = final.usageType || "assignment";

    /* Cả hai nhánh chỉ còn MỘT lệnh ghi. Cột `store` quyết định bài nằm ở kho
       nào, nên "đẩy sang Entraînement" và "gỡ khỏi devoir" là cùng một việc —
       trước đây là hai lần ghi hai blob, hỏng giữa chừng thì bài nhân đôi
       hoặc mất hẳn. */
    if (final.usageType === "practice") {
      const r = await saveExercise(
        { ...final, assignedTo: null, targeted: false, deadline: "" }, "practice");
      if (!r.ok) { alert(`${t("builder.save_failed")}

${r.error?.message ?? ""}`); return; }
      setExercises(exercises.filter((e) => e.id !== final.id));
      setView("list"); return;
    }

    const r = await saveExercise(final, "assignment");
    if (!r.ok) { alert(`${t("builder.save_failed")}

${r.error?.message ?? ""}`); return; }
    const others = exercises.filter((e) => e.id !== final.id);
    setExercises([...others, final].sort((a, b) => a.createdAt - b.createdAt));
    setView("list");
  };
  /* Nhân bản một bài thành BẢN NHÁP.
   *
   * Mục « Dupliquer » trong menu đã gọi hàm này từ lâu, nhưng hàm chưa bao giờ
   * tồn tại: giáo viên bấm vào là `duplicate is not defined`, error boundary
   * nuốt cả màn hình, và cách duy nhất thoát ra là tải lại trang. Bản nâng cấp
   * `check:imports` tìm ra — bản cũ chỉ dò thẻ JSX nên không thấy lời gọi hàm.
   *
   * Gỡ hạn nộp và danh sách được giao: bản sao là chỗ để sửa, không phải một
   * bài thứ hai lặng lẽ giao cho cả lớp với cùng deadline.
   *
   * `id` mới cho cả bài LẪN từng câu. Giữ id câu cũ thì hai bài chung câu hỏi,
   * và `submissions` khoá theo question.id sẽ trộn bài làm của hai bên. */
  const duplicate = async (ex) => {
    const ban = {
      ...structuredClone(ex),
      id: uid(),
      title: (ex.title || "Exercice") + tr(" (bản sao)", " (copie)", " (copy)"),
      createdAt: Date.now(),
      assignedTo: null,
      targeted: false,
      deadline: "",
      questions: (ex.questions ?? []).map((q) => ({ ...structuredClone(q), id: uid() })),
    };
    const store = ex.usageType === "practice" ? "practice" : "assignment";
    const r = await saveExercise(ban, store);
    if (!r.ok) { alert("❌ Échec de la duplication."); return; }
    setExercises([...exercises, ban].sort((a, b) => a.createdAt - b.createdAt));
  };

  const remove = async (id) => {
    const r = await deleteExercise(id);
    if (!r.ok) { alert("❌ Échec de la suppression."); return; }
    setExercises(exercises.filter((e) => e.id !== id));
  };

  if (view === "new") return <Builder draft={draft} setDraft={setDraft} publish={publish} cancel={() => setView("list")} accounts={accounts} classes={classes} />;
  if (view.startsWith("progress:")) {
    const ex = exercises.find((e) => e.id === view.slice(9));
    return <Progress ex={ex} submissions={submissions} setSubmissions={setSubmissions} accounts={accounts} back={() => setView("list")} />;
  }

  return (
    <div>
      {/* Hàng tab ngang đã bỏ: bốn nhãn của nó (Bibliothèque d'exercices,
          Suivi des élèves, Statistiques, Entraînement) trùng khít với thanh
          bên, và mỗi tab đều có route riêng trong TEACHER_NAV nên không mất
          lối vào nào. `view` vẫn giữ vì nó còn điều khiển hai màn con không
          có URL riêng: soạn bài mới và chấm bài. */}
      {view === "list" && (
        <div role="tablist" className="mb-4 inline-flex gap-1 rounded-full bg-surface2 p-1">
          {[["giao", tr("Bài được giao", "Devoirs", "Assigned")], ["luyen", tr("Thư viện luyện tập", "Bibliothèque d'entraînement", "Practice library")]].map(([k, nhan]) => (
            <button key={k} type="button" role="tab" aria-selected={khoBai === k} onClick={() => setKhoBai(k)}
              className={`h-9 cursor-pointer rounded-full border-0 px-4 font-sans text-sm font-bold ${khoBai === k ? "bg-surface text-ink shadow-sm" : "bg-transparent text-soft hover:text-ink"}`}>
              {nhan}
            </button>
          ))}
        </div>
      )}
      {view === "list" && khoBai === "luyen" ? <PracticeHub role="prof" accounts={accounts} /> : <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={refresh}
          className={NUT_PILL}>
          <RotateCw size={15} aria-hidden /> {t("actions.refresh")}
        </button>
        {view === "list" && (
          <button type="button"
            onClick={() => navigate("/professeur/thong-bao")}
            className={NUT_PILL}>
            <Bell size={15} aria-hidden /> {t("actions.announce")}
          </button>
        )}
        {view === "list" && (
          <button type="button" onClick={() => { setDraft(blank()); setView("new"); }}
            className="ml-auto rounded-md border border-solid border-transparent bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
            {t("actions.new_exercise")}
          </button>
        )}
      </div>

      {annModal && (
        /* Bấm ra ngoài để đóng — nhưng chỉ khi bấm ĐÚNG lớp phủ. `onMouseDown`
           chứ không `onClick`: bôi đen chữ trong ô nhập rồi thả chuột ra ngoài
           sẽ tính là một cú click trên lớp phủ và đóng mất hộp cùng nội dung
           đang gõ dở. */
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !annSending) setAnnModal(false); }}>
          <div role="dialog" aria-modal="true" aria-label={tr("Gửi thông báo", "Envoyer une annonce", "Send an announcement")}
            className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-surface p-6 shadow-2xl ring-1 ring-inset ring-line">
            <h3 className="m-0 flex items-center gap-2 text-lg font-bold text-ink">
              <Bell size={18} className="text-primary" aria-hidden /> {tr("Gửi thông báo", "Envoyer une annonce", "Send an announcement")}
            </h3>

            <textarea
              className="mt-4 min-h-[110px] w-full resize-y rounded-xl border-0 bg-surface2 px-4 py-3 text-sm
                         font-medium text-ink outline-none ring-1 ring-inset ring-line transition
                         placeholder:text-soft focus:ring-2 focus:ring-primary"
              value={annMsg} autoFocus maxLength={2000} disabled={annSending}
              placeholder="ex. Rappel : rendez le devoir B1 avant vendredi 19h !"
              onChange={(e) => { setAnnMsg(e.target.value); if (annLoi) setAnnLoi(""); }} />

            {/* Đếm ký tự chỉ hiện khi gần chạm giới hạn. Hiện suốt thì nó là
                nhiễu; im lặng tới lúc bị cắt thì là bẫy. */}
            {annMsg.length > 1800 && (
              <p className="m-0 mt-1 text-right text-xs font-semibold text-warn">
                {annMsg.length}/2000
              </p>
            )}

            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm font-bold text-ink">
              <input type="checkbox" checked={annAll} disabled={annSending}
                onChange={(e) => { setAnnAll(e.target.checked); if (annLoi) setAnnLoi(""); }}
                className="h-4 w-4 cursor-pointer accent-[color:var(--mcf-primary)]" />
              {tr("Gửi cho tất cả học sinh", "Envoyer à tous les élèves", "Send to all students")}
            </label>

            {!annAll && (
              <div style={{ marginTop: 10, background: "var(--mcf-surface2)", border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", display: "grid", gap: 12 }}>
                <div>
                  <div style={{ ...S.label, fontSize: 10.5 }}>👤 Par élèves</div>
                  <input style={{ ...S.input, marginTop: 8, maxWidth: 280 }} value={annSearch}
                    placeholder="🔍 Rechercher…" onChange={(e) => setAnnSearch(e.target.value)} />
                  <div className="mcf-scroll" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, maxHeight: 140, overflowY: "auto" }}>
                    {accounts.filter((a) => a.name.toLowerCase().includes(annSearch.trim().toLowerCase())).map((a) => {
                      const on = annStudents.includes(a.name);
                      return (
                        <label key={a.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer",
                          padding: "6px 13px", borderRadius: 999, fontWeight: 600,
                          border: `1.5px solid ${on ? C.primary : C.line}`,
                          background: on ? C.primarySoft : "var(--mcf-surface)", color: on ? C.primary : C.ink }}>
                          <input type="checkbox" checked={on} style={{ display: "none" }}
                            onChange={() => setAnnStudents(on ? annStudents.filter((n) => n !== a.name) : [...annStudents, a.name])} />
                          {on ? "✓ " : ""}{a.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Lỗi hiện Ở ĐÂY, cạnh nút, chứ không phải một alert() rồi biến
                mất. Người dùng cần đọc lại được lý do trong lúc sửa. */}
            {annLoi && (
              <p className="m-0 mt-4 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs font-bold text-danger">
                <AlertTriangle size={14} className="mt-px shrink-0" aria-hidden /> {annLoi}
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              {/* NÚT GỬI KHÔNG BỊ `disabled` khi thiếu thông tin.
                  CLAUDE.md: nút xám bấm không được là ngõ cụt câm — dự án đã
                  trả giá cho kiểu đó ở thanh trượt tự chấm. Bấm được, và
                  `guiThongBao` trả về đúng lý do để hiện ngay bên trên.
                  Chỉ khoá trong lúc ĐANG GỬI, để không gửi hai lần. */}
              <button type="button" onClick={() => setAnnModal(false)} disabled={annSending}
                className="cursor-pointer rounded-xl border-0 bg-transparent px-5 py-3 font-[inherit] text-sm
                           font-semibold text-soft transition-colors hover:bg-surface2 hover:text-ink
                           disabled:cursor-not-allowed disabled:opacity-50">
                {tr("Huỷ", "Annuler", "Cancel")}
              </button>
              <button type="button" onClick={sendAnnonce} disabled={annSending}
                className="flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-primary px-6 py-3
                           font-[inherit] text-sm font-bold text-on-primary shadow-lg shadow-primary/30
                           transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                {annSending
                  ? <><Loader2 size={15} className="mcf-spin" aria-hidden /> {tr("Đang gửi…", "Envoi…", "Sending…")}</>
                  : <><Send size={15} aria-hidden /> {tr("Gửi", "Envoyer", "Send")}</>}
              </button>
            </div>
          </div>
        </div>
      )}
      {annToast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: C.ok, color: "#fff", padding: "12px 26px", borderRadius: 999, fontWeight: 700, fontSize: 14,
          boxShadow: "0 10px 30px rgba(17,24,39,.35)" }}>{annToast}</div>
      )}
      {view === "students" && <Accounts accounts={accounts} setAccounts={setAccounts} classes={classes} setClasses={setClasses} exercises={exercises} submissions={submissions} />}
      {view === "stats" && <ThongKe accounts={accounts} />}
      {view === "list" && (
        exercises.length === 0 ? (
          <div className="mcf-card" style={{ ...S.card, textAlign: "center", padding: 40, color: C.soft }}>
            {t("empty.no_exercise")}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {exercises.map((ex) => {
              const targets = targetedAccounts(ex, accounts);
              const tNames = new Set(targets.map((a) => a.name));
              const subs = submissions.filter((s) => s.exerciseId === ex.id && !s.redo && tNames.has(s.student));
              const toGrade = subs.filter((s) => !s.graded && ex.questions.some((q) => q.type === "open")).length;
              const late = isLate(ex);
              return (
                <div key={ex.id} className="mcf-card" style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <span style={S.badge(ex.level)}>{ex.level}</span>
                    <span style={S.chip(C.primarySoft, C.primary)}>{exSkills(ex).join(" · ")}</span>{" "}
                    <strong style={{ fontSize: 17 }}>{ex.title}</strong>
                    <div style={{ fontSize: 12, color: C.soft, marginTop: 5 }}>
                      {ex.questions.length} {tr("câu ·", "question(s) ·", "question(s) ·")} {subs.length}/{targets.length} copies
                      {ex.assignedTo?.length
                        ? <span style={{ color: C.primary, fontWeight: 700 }} title={ex.assignedTo.join(", ")}> · 👤 {ex.assignedTo.length} élève{ex.assignedTo.length > 1 ? "s" : ""}{ex.assignedClasses?.length ? ` · 🏫 ${ex.assignedClasses.map((id) => classes.find((c) => c.id === id)?.name).filter(Boolean).join(", ")}` : ""}</span>
                        : " · 👥 tous les élèves"}
                      {toGrade > 0 && <span style={{ color: C.warn, fontWeight: 700 }}> · ✏️ {toGrade} à corriger</span>}
                      {ex.deadline && <span style={{ color: late ? C.danger : C.warn, fontWeight: 700 }}> · ⏰ {fmtDate(ex.deadline)}{late && tr(" (đã đóng)", " (clôturé)", " (closed)")}</span>}
                      {ex.audioUrl && " · 🎧 audio"}
                      {ex.timeLimit && <span style={{ fontWeight: 700 }}> · ⏱ {ex.timeLimit} min</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button style={S.btn(true)} onClick={() => setView("progress:" + ex.id)}>Suivi & correction</button>
                    <KebabMenu items={[
                      { label: "Modifier", icon: <Pencil size={16} />, onClick: () => { setDraft(editPrep(ex)); setView("new"); } },
                      { label: "Dupliquer", icon: <Copy size={16} />, onClick: () => duplicate(ex) },
                      { label: "Supprimer", icon: <Trash2 size={16} />, danger: true, onClick: () => remove(ex.id) },
                    ]} />
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
      </>}
    </div>
  );
}

/* ================= Accounts ================= */
function Accounts({ accounts, setAccounts, classes, setClasses, exercises = [], submissions = [] }) {
  /* Ô tìm kiếm ở thanh trên mở thẳng hồ sơ qua state `moHocSinh` (25/09). */
  const viTri = useLocation();
  const [openStudent, setOpenStudent] = useState(() => viTri.state?.moHocSinh ?? null);   // 📂 dossier détaillé
  useEffect(() => { if (viTri.state?.moHocSinh) setOpenStudent(viTri.state.moHocSinh); }, [viTri.key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [newClass, setNewClass] = useState("");
  const addClass = async () => {
    const n = newClass.trim(); if (!n) return;
    const next = [...classes, { id: uid(), name: n }];
    setClasses(next); await save("mcf-classes", next); setNewClass("");
  };
  const delClass = async (id) => {
    const next = classes.filter((c) => c.id !== id);
    setClasses(next); await save("mcf-classes", next);
  };
  /* Gán lớp phải ghi vào đúng nơi giữ người đó: hồ sơ trong bảng profiles nếu
     họ đã đăng ký, danh bạ kv_store nếu mới chỉ được mời. Ghi nhầm chỗ thì
     lựa chọn biến mất ở lần tải trang sau mà không báo gì. */
  const setStudentClass = async (student, classId) => {
    const latest = await load("mcf-accounts", []);
    const ok = await setClassFor(student, classId, Array.isArray(latest) ? latest : [],
      (next) => save("mcf-accounts", next));
    if (!ok) { setMsg(tr("Không lưu được lớp cho học sinh này.", "Classe non enregistrée pour cet élève.", "Couldn't save the class for this student.")); return; }
    await refresh();
  };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [presence, setPresence] = useState({});
  const [, forceTick] = useState(0);

  // Nạp presence + tự làm mới mỗi 60 giây
  useEffect(() => {
    /* 123: đọc cột profiles.lan_cuoi_online (giáo viên đọc được profiles),
       không đọc blob mcf-presence nữa. Khoá theo tên như cũ. */
    const fetchP = () => supabase.from("profiles").select("name, lan_cuoi_online").eq("role", "eleve")
      .then(({ data }) => setPresence(Object.fromEntries((data ?? []).filter((r) => r.lan_cuoi_online).map((r) => [r.name, Date.parse(r.lan_cuoi_online)]))));
    fetchP();
    const t = setInterval(() => { fetchP(); forceTick((x) => x + 1); }, 60_000);
    return () => clearInterval(t);
  }, []);

  /* Danh sách lớp giờ chỉ còn là DANH BẠ, không phải nơi giữ mật khẩu.

     Mật khẩu đã chuyển hẳn sang Supabase Auth. Trường `code` cũ chứa mã dạng
     thô trong kv_store — bảng đọc được bằng anon key từ trình duyệt, tức ai
     cũng xem được mật khẩu của cả lớp. Nó cũng không còn xác thực gì kể từ khi
     màn đăng nhập PIN bị gỡ: giáo viên vẫn phát mật khẩu, học sinh vẫn đổi
     mật khẩu, mà không cái nào có tác dụng.

     Thay vào đó giáo viên ghi email. Học sinh tự đăng ký bằng chính email đó,
     rồi resolveRole khớp lại để giữ đúng tên hiển thị giáo viên đã đặt. */
  const add = async () => {
    const n = name.trim(), e = email.trim().toLowerCase();
    if (!n) { setMsg("Prénom requis."); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { setMsg("Email invalide."); return; }
    if (accounts.some((a) => a.name.toLowerCase() === n.toLowerCase())) { setMsg("Ce prénom existe déjà."); return; }
    if (accounts.some((a) => (a.email || "").toLowerCase() === e)) { setMsg("Cet email est déjà utilisé."); return; }
    /* Ghi vào danh bạ mời, không phải profiles: client không tạo được tài
       khoản đăng nhập — việc đó cần service_role key. Học sinh vẫn phải tự
       đăng ký bằng chính email này, rồi loadRoster khớp hai bên lại.

       refresh() ngay sau đó để dòng mới hiện ra không cần tải lại trang. */
    const latest = await load("mcf-accounts", []);
    const next = [...(Array.isArray(latest) ? latest : []), { name: n, email: e }];
    await save("mcf-accounts", next);
    await refresh();
    setName(""); setEmail(""); setMsg("");
  };
  /* `accounts` giờ là danh sách GỘP (profiles + danh bạ mời). Lọc nó rồi ghi
     thẳng vào mcf-accounts sẽ đổ toàn bộ học sinh đã đăng ký vào danh bạ mời
     — mỗi lần xoá một người là nhân bản tất cả những người còn lại thành bản
     ghi ma. Phải xoá ở đúng kho đang giữ người đó. */
  const delAcc = async (student) => {
    if (student.status === "registered") {
      const { error } = await supabase.from("profiles").delete().eq("id", student.id);
      if (error) { setMsg(tr("Không xoá được hồ sơ này.", "Impossible de supprimer ce profil.", "Couldn't delete this profile.")); return; }
    } else {
      const latest = await load("mcf-accounts", []);
      const next = (Array.isArray(latest) ? latest : []).filter((a) => a.name !== student.name);
      await save("mcf-accounts", next);
    }
    await refresh();
  };

  /* Giáo viên không đặt mật khẩu hộ nữa — chỉ kích hoạt email đặt lại của
     Supabase. Mật khẩu chỉ đi qua tay chính học sinh, không qua lời nhắn. */
  const reset = async (n) => {
    const acc = accounts.find((a) => a.name === n);
    if (!acc?.email) { setMsg(`${n} n'a pas encore d'email. Ajoutez-le d'abord.`); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(acc.email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setMsg(error ? `Échec de l'envoi : ${error.message}` : `Lien de réinitialisation envoyé à ${acc.email}.`);
  };

  if (openStudent) {
    const acc = accounts.find((a) => a.name === openStudent);
    if (!acc) { setOpenStudent(null); return null; }
    return <StudentDossier acc={acc} classes={classes} exercises={exercises} submissions={submissions}
      presence={presence} back={() => setOpenStudent(null)} />;
  }

  return (
    <div>
      {/* Khung « Classes » (tạo/xoá lớp) đã gỡ 07/10 theo chủ dự án. */}
      <QuanLyVip />
      {/* Ô « Créer le compte » và nút « Supprimer » gỡ 24/09 theo yêu cầu chủ
          dự án: học sinh tự đăng ký, giáo viên chỉ theo dõi. */}
      {msg && <p style={{ color: C.danger, fontSize: 13, marginTop: 0, marginBottom: 10 }}>{msg}</p>}
      {/* Nút « Afficher les mots de passe » đã bỏ cùng với trường code — không
          còn mật khẩu nào ở đây để hiện. */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: C.soft }}>
          {accounts.length} compte(s)
          {accounts.some((a) => a.status === "invited") &&
            ` · ${accounts.filter((a) => a.status === "invited").length} en attente d'inscription`}
        </span>
      </div>

      {/* Danh sách rỗng nói rõ vì sao rỗng. Câu cũ — "Aucun compte. Les élèves
          ne peuvent pas encore se connecter" — sai kể từ khi có tự đăng ký:
          học sinh vào được mà không cần giáo viên tạo trước. */}
      {accounts.length === 0 && (
        <div className="mcf-card" style={{ ...S.card, textAlign: "center", color: C.soft }}>
          <div style={{ fontWeight: 700, color: C.ink, marginBottom: 6 }}>{tr("Chưa có học sinh nào đăng ký.", "Aucun élève inscrit pour le moment.", "No students registered yet.")}</div>
          <div style={{ fontSize: 13.5 }}>
            Les élèves apparaissent ici dès qu'ils créent leur compte.
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {accounts.map((a) => (
          <div key={a.id || a.name} className="mcf-card" style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => setOpenStudent(a.name)} title="Voir le dossier de l'élève"
                style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit",
                  fontWeight: 800, fontSize: 15, color: C.primary, padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
                {a.name}
              </button>

              {/* Đã đăng ký hay mới được mời — hai trạng thái rất khác nhau:
                  người "mời" chưa có tài khoản nào để đăng nhập. */}
              {a.status === "invited" ? (
                <span style={{ fontSize: 11.5, fontWeight: 700, color: C.warn, background: C.warnSoft,
                  borderRadius: 999, padding: "2px 9px" }}>En attente</span>
              ) : (
                <span style={{ fontSize: 11.5, fontWeight: 700, color: C.ok, background: C.okSoft,
                  borderRadius: 999, padding: "2px 9px" }}>Inscrit</span>
              )}

              {(() => {
                const st = formatLastSeen(presence[a.name]);
                return (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: st.online ? C.ok : C.soft, fontWeight: st.online ? 700 : 500 }}>
                    <span className={st.online ? "mcf-pulse" : ""}
                      style={{ width: 9, height: 9, borderRadius: "50%", background: st.online ? "#22C55E" : "#9CA3AF", flexShrink: 0 }} />
                    {st.label}
                  </span>
                );
              })()}

              <span style={{ fontSize: 13, color: a.email ? C.soft : C.warn }}>
                {a.email || "sans email — l'élève ne peut pas se connecter"}
              </span>

              {a.createdAt && (
                <span style={{ fontSize: 12.5, color: C.soft }}>
                  Inscrit le {fmtDateFR(a.createdAt)}
                </span>
              )}

            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btn(false), padding: "5px 12px", fontSize: 12 }} onClick={() => reset(a.name)}
                title="Envoie un lien de réinitialisation à l'élève">{tr("Gửi đường dẫn", "Envoyer un lien", "Send a link")}</button>            </div>
          </div>
        ))}
        {accounts.length === 0 && <p style={{ color: C.soft }}>{tr("Chưa có tài khoản nào.", "Aucun compte. Les élèves ne peuvent pas encore se connecter.", "No accounts yet.")}</p>}
      </div>

      <QuyenBaiTap accounts={accounts} exercises={exercises} />
    </div>
  );
}

/* AccessManager (bảng ma trận học sinh × bài) đã thay bằng QuyenBaiTap.jsx — 08/10. */

function StudentDossier({ acc, classes, exercises, submissions, presence, back }) {
  const name = acc.name;
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [practice, setPractice] = useState({});
  const [pracEx, setPracEx] = useState([]);

  useEffect(() => {
    (async () => {
      /* Hồ sơ đọc từ BẢNG `profiles` theo `acc.id`, không còn từ blob
         `s:mcf-profiles`. Xem migration 049: blob là một object khoá theo TÊN
         mà mọi học sinh đọc và ghi đè được.

         `acc.id` chỉ có với người đã ĐĂNG KÝ; người mới được mời qua danh bạ
         `mcf-accounts` thì chưa có dòng nào trong `profiles`, và
         `loadHoSoHocSinh` trả về `null`. Đổi thành `{}` để giao diện hiện
         "Non renseigné" cho từng ô — đúng sự thật — thay vì kẹt ở "Chargement…"
         vĩnh viễn, vì `profile === null` là trạng thái ĐANG TẢI ở dưới. */
      const [hoSo, notesAll, ph, prac] = await Promise.all([
        loadHoSoHocSinh(acc.id), load("mcf-teacher-notes", {}),
        load(`mcf-ph-${name}`, {}, false), loadPractice(),
      ]);
      setProfile(hoSo || {});
      setNotes((notesAll && notesAll[name]) || "");
      setPractice(ph && typeof ph === "object" ? ph : {});
      setPracEx(Array.isArray(prac) ? prac : []);
    })();
  }, [name]);

  const saveNotes = async () => {
    const all = await load("mcf-teacher-notes", {});
    all[name] = notes;
    await save("mcf-teacher-notes", all);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  // ---- statistiques ----
  const mySubs = submissions.filter((s) => s.student === name);
  const scored = mySubs.map((s) => {
    const ex = exercises.find((e) => e.id === s.exerciseId);
    if (!ex) return null;
    const t = totalScore(s, ex);
    return t.max ? { ex, s, pct: Math.round((t.score / t.max) * 100), score: t.score, max: t.max } : null;
  }).filter(Boolean);
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b.pct, 0) / scored.length) : null;
  const practiceRows = Object.entries(practice).filter(([, r]) => r && r.max);
  const totalDone = mySubs.length + practiceRows.length;
  const totalTime = mySubs.reduce((a, s) => a + (s.durationMs || 0), 0);
  const recent = [
    ...scored.map((r) => ({ title: r.ex.title, level: r.ex.level, pct: r.pct, label: `${r.score}/${r.max}`, at: r.s.at, kind: "Devoir" })),
    ...practiceRows.map(([exId, r]) => {
      const ex = pracEx.find((e) => e.id === exId);
      return { title: ex ? ex.title : tr("Bài đã bị xoá", "Exercice supprimé", "Exercise deleted"), level: ex ? ex.level : "", pct: Math.round((r.best / r.max) * 100), label: `${r.best}/${r.max}`, at: r.at || 0, kind: "Entraînement" };
    }),
  ].sort((a, b) => b.at - a.at).slice(0, 5);

  const st = formatLastSeen(presence[name]);
  const cls = classes.find((c) => c.id === acc.classId);
  const pct = calculateProfileCompletion(profile);

  const infoRow = (Icon, label, value) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <Icon size={17} color={C.primary} style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 11.5, color: C.soft, fontWeight: 700, letterSpacing: .3, textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 1 }}>{value || <span style={{ color: C.soft, fontWeight: 400 }}>Non renseigné</span>}</div>
      </div>
    </div>
  );

  const statCard = (Icon, label, value, color) => (
    <div className="mcf-card" style={{ ...S.card, padding: "16px 18px", textAlign: "center" }}>
      <Icon size={20} color={color} style={{ marginBottom: 6 }} />
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <button style={{ ...S.btn(false), marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={back}>
        <ChevronLeft size={16} /> Retour aux élèves
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(230px, 1fr) minmax(300px, 2fr)", gap: 16, alignItems: "start" }}>
        {/* ---- Colonne gauche : carte profil ---- */}
        <div className="mcf-card" style={{ ...S.card, textAlign: "center" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: avaColor(name), color: "#fff",
            fontSize: 40, fontWeight: 800, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ ...S.display, fontSize: 22, margin: "0 0 6px" }}>{name}</h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, marginBottom: 10,
            color: st.online ? C.ok : C.soft, fontWeight: st.online ? 700 : 500 }}>
            <span className={st.online ? "mcf-pulse" : ""} style={{ width: 9, height: 9, borderRadius: "50%", background: st.online ? "#22C55E" : "#9CA3AF" }} />
            {st.label}
          </div>
          <div style={{ marginTop: 16, textAlign: "left" }}>
            <div style={{ fontSize: 11.5, color: C.soft, fontWeight: 700, marginBottom: 6 }}>PROFIL COMPLÉTÉ À {pct} %</div>
            <div style={{ width: "100%", height: 8, borderRadius: 999, background: "var(--mcf-surface2)", border: `1px solid ${C.line}`, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? C.ok : C.primary, transition: "width .4s ease" }} />
            </div>
          </div>
        </div>

        {/* ---- Colonne droite ---- */}
        <div style={{ display: "grid", gap: 16 }}>
          {/* Informations personnelles */}
          <div className="mcf-card" style={{ ...S.card }}>
            <h3 style={{ ...S.display, fontSize: 17, margin: "0 0 16px" }}>📋 Informations personnelles</h3>
            {profile === null ? <p style={{ color: C.soft, margin: 0 }}>Chargement…</p> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
                {infoRow(Phone, "Téléphone", profile.phone)}
                {infoRow(Calendar, "Date de naissance", fmtDateFR(profile.dob))}
                {infoRow(Briefcase, "École / Profession", profile.school)}
                {infoRow(GraduationCap, "Niveau actuel", profile.level)}
                {infoRow(Target, "Objectif", profile.goal)}
              </div>
            )}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
              <div style={S.label}>{tr("🗝️ Ghi chú riêng (chỉ bạn thấy)", "🗝️ Notes privées (visibles uniquement par vous)", "🗝️ Private notes (only you can see)")}</div>
              <textarea style={{ ...S.input, marginTop: 8, minHeight: 76, resize: "vertical" }} value={notes}
                placeholder="ex. Prononciation du « r » à travailler ; très bon à l'écrit…"
                onChange={(e) => setNotes(e.target.value)} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                <button style={{ ...S.btn(true), padding: "8px 18px", fontSize: 13 }} onClick={saveNotes}>{tr("💾 Lưu ghi chú", "💾 Enregistrer les notes", "💾 Save notes")}</button>
                {notesSaved && <span style={{ fontSize: 13, color: C.ok, fontWeight: 700 }}>✅ Notes enregistrées</span>}
              </div>
            </div>

            <AccessPanel student={acc} exercises={exercises} />
          </div>

          {/* Aperçu des performances */}
          <div>
            <h3 style={{ ...S.display, fontSize: 17, margin: "0 0 12px" }}>📈 Aperçu des performances</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              {statCard(CheckCircle, "Exercices terminés", totalDone, C.primary)}
              {statCard(TrendingUp, "Score moyen", avg == null ? "—" : `${avg} %`, avg == null ? C.soft : avg >= 80 ? C.ok : avg >= 50 ? C.warn : C.danger)}
              {statCard(Clock, tr("Tổng thời gian", "Temps total", "Total time"), fmtDuration(totalTime), C.primary)}
            </div>
          </div>

          {/* Activités récentes */}
          <div className="mcf-card" style={{ ...S.card }}>
            <h3 style={{ ...S.display, fontSize: 17, margin: "0 0 14px" }}>⏱️ Activités récentes</h3>
            {recent.length === 0 ? (
              <p style={{ color: C.soft, margin: 0, fontSize: 14 }}>{tr("Chưa có hoạt động nào.", "Aucune activité pour le moment.", "No activity yet.")}</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {recent.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                    background: "var(--mcf-surface2)", border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 14px" }}>
                    {r.level && <span style={S.badge(r.level)}>{r.level}</span>}
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</div>
                      <div style={{ fontSize: 11.5, color: C.soft, marginTop: 1 }}>{r.kind} · {r.at ? new Date(r.at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—"}</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 14.5, color: r.pct >= 80 ? C.ok : r.pct >= 50 ? C.warn : C.danger }}>
                      {r.label} <span style={{ fontSize: 12, fontWeight: 600 }}>({r.pct} %)</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Stats (teacher) ================= */
function Stats({ accounts, exercises, submissions }) {
  const perExercise = exercises.map((ex) => {
    const pcts = submissions.filter((s) => s.exerciseId === ex.id).map((s) => {
      const t = totalScore(s, ex); return t.max ? (t.score / t.max) * 100 : null;
    }).filter((x) => x != null);
    const mean = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;
    const sd = pcts.length > 1 ? Math.sqrt(pcts.reduce((a, b) => a + (b - mean) ** 2, 0) / (pcts.length - 1)) : 0;
    return { name: ex.title.length > 16 ? ex.title.slice(0, 15) + "…" : ex.title, full: ex.title, skill: exSkills(ex).join(" · "), moyenne: mean == null ? null : Math.round(mean), ecartType: Math.round(sd * 10) / 10, copies: pcts.length };
  });

  const radar = SKILLS.map((skill) => {
    const pcts = [];
    exercises.filter((e) => exSkills(e).includes(skill)).forEach((ex) => {
      submissions.filter((s) => s.exerciseId === ex.id).forEach((s) => {
        const t = totalScore(s, ex); if (t.max) pcts.push((t.score / t.max) * 100);
      });
    });
    return { skill, classe: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0 };
  });

  const exportCSV = () => {
    const rows = [["Exercice", "Compétence", "Copies", "Moyenne (%)", "Écart-type"]];
    perExercise.forEach((r) => rows.push([r.full, r.skill, r.copies, r.moyenne ?? "", r.ecartType]));
    rows.push([]);
    rows.push(["Élève", ...exercises.map((e) => e.title), "Moyenne élève (%)"]);
    accounts.forEach((a) => {
      const cells = exercises.map((ex) => {
        const s = submissions.find((x) => x.exerciseId === ex.id && x.student === a.name);
        if (!s) return "";
        const t = totalScore(s, ex);
        return t.max ? `${t.score}/${t.max}` : "";
      });
      const pcts = exercises.map((ex) => {
        const s = submissions.find((x) => x.exerciseId === ex.id && x.student === a.name);
        if (!s) return null; const t = totalScore(s, ex); return t.max ? (t.score / t.max) * 100 : null;
      }).filter((x) => x != null);
      cells.push(pcts.length ? Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length) : "");
      rows.push([a.name, ...cells]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rapport_classe.csv";
    a.click();
  };

  const chartData = perExercise.filter((r) => r.moyenne != null);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="mcf-card" style={{ ...S.card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={S.label}>{tr("Trung bình và độ lệch chuẩn theo bài", "Moyenne & écart-type par exercice", "Average & standard deviation per exercise")}</div>
          <button style={S.btn(true)} onClick={exportCSV}>⬇ Exporter le rapport (CSV)</button>
        </div>
        {chartData.length === 0 ? <p style={{ color: C.soft, fontSize: 14 }}>Pas encore de copies notées.</p> : (
          <div style={{ width: "100%", height: 260, marginTop: 12 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, k) => [k === "moyenne" ? v + " %" : v, k === "moyenne" ? "Moyenne" : "Écart-type"]} />
                <Legend />
                <Bar dataKey="moyenne" name="Moyenne (%)" fill={C.primary} radius={[6, 6, 0, 0]} />
                <Bar dataKey="ecartType" name="Écart-type" fill={C.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mcf-card" style={{ ...S.card }}>
        <div style={S.label}>Profil de la classe par compétence</div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <RadarChart data={radar}>
              <PolarGrid stroke={C.line} />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Classe" dataKey="classe" stroke={C.primary} fill={C.primary} fillOpacity={0.35} />
              <Tooltip formatter={(v) => v + " %"} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <StudentTable accounts={accounts} exercises={exercises} submissions={submissions} />
    </div>
  );
}

function StudentTable({ accounts, exercises, submissions }) {
  const th = { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, color: C.soft, textAlign: "left", padding: "8px 10px", borderBottom: `2px solid ${C.line}` };
  const td = { fontSize: 14, padding: "9px 10px", borderBottom: `1px solid ${C.line}` };
  return (
    <div className="mcf-card" style={{ ...S.card, overflowX: "auto" }}>
      <div style={{ ...S.label, marginBottom: 10 }}>Notes par élève</div>
      {accounts.length === 0 ? <p style={{ color: C.soft }}>{tr("Chưa có học sinh nào.", "Aucun élève inscrit.", "No students registered.")}</p> : (
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 520 }}>
          <thead><tr>
            <th style={th}>Élève</th><th style={th}>Rendus</th>
            {exercises.map((ex) => <th key={ex.id} style={th} title={ex.title}>{ex.title.length > 13 ? ex.title.slice(0, 12) + "…" : ex.title}</th>)}
            <th style={th}>Moyenne</th>
          </tr></thead>
          <tbody>
            {accounts.map((a) => {
              const cells = exercises.map((ex) => {
                if (!assignedTo(ex, a.name)) return { na: true };
                const s = submissions.find((x) => x.exerciseId === ex.id && x.student === a.name);
                if (!s) return null;
                if (s.redo) return { redo: true };
                return { ...totalScore(s, ex), late: s.late };
              });
              const pcts = cells.filter((c) => c && !c.na && !c.redo && c.max).map((c) => (c.score / c.max) * 100);
              const avg = pcts.length ? Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length) : null;
              const nAssigned = cells.filter((c) => !c || !c.na).length;
              return (
                <tr key={a.name}>
                  <td style={{ ...td, fontWeight: 700 }}>{a.name}</td>
                  <td style={td}>{cells.filter((c) => c && !c.na && !c.redo).length}/{nAssigned}</td>
                  {cells.map((c, i) => (
                    <td key={i} style={{ ...td, fontWeight: c && !c.na ? 700 : 400, color: !c ? C.soft : c.na ? C.line : c.pending ? C.warn : c.score / c.max >= 0.5 ? C.ok : C.danger }}>
                      {!c ? "—" : c.na ? "·" : c.redo ? "🔁" : `${c.score}/${c.max}${c.pending ? " ⏳" : ""}${c.late ? " 🕐" : ""}`}
                    </td>
                  ))}
                  <td style={{ ...td, fontWeight: 800, color: avg == null ? C.soft : avg >= 50 ? C.ok : C.danger }}>{avg == null ? "—" : avg + " %"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p style={{ fontSize: 12, color: C.soft, marginTop: 10, marginBottom: 0 }}>{tr("⏳ = câu tự luận chưa chấm · 🕐 = nộp muộn · « · » = bài không giao cho em này · 🔁 = làm lại", "⏳ = réponses libres pas encore corrigées · 🕐 = rendu en retard · « · » = exercice non assigné à cet élève · 🔁 = à refaire", "⏳ = open answers not graded · 🕐 = late · « · » = not assigned · 🔁 = redo")}</p>
    </div>
  );
}

/* ================= Builder ================= */
/* ================= Progress & grading ================= */
function Progress({ ex, submissions, setSubmissions, accounts, back }) {
  const [open, setOpen] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [qDrafts, setQDrafts] = useState({});
  const [marks, setMarks] = useState({});
  const [attachDrafts, setAttachDrafts] = useState({});
  const [redoFor, setRedoFor] = useState(null); // tên học sinh đang yêu cầu làm lại
  const [redoNote, setRedoNote] = useState("");
  if (!ex) return null;
  const roster = targetedAccounts(ex, accounts);
  const rosterNames = new Set(roster.map((a) => a.name));
  // Chỉ đếm bài nộp của học sinh ĐANG được giao (tránh 2/1 khi đổi danh sách giao bài)
  const subs = submissions.filter((s) => s.exerciseId === ex.id && !s.redo && rosterNames.has(s.student));
  const byName = Object.fromEntries(submissions.filter((s) => s.exerciseId === ex.id).map((s) => [s.student, s]));
  const opens = ex.questions.filter((q) => q.type === "open");

  // 🔁 Yêu cầu làm lại : reset điểm, đổi trạng thái sang redo + lưu lý do
  const requestRedo = async (student) => {
    const sub = byName[student];
    if (!sub) return;
    await patchSubmission({
      ...sub, redo: true, redoNote: redoNote.trim(),
      graded: false, openMarks: {}, autoScore: 0,
    });
    setSubmissions(await loadSubmissions());
    setRedoFor(null); setRedoNote("");
  };

  const saveGrading = async (student) => {
    const sub = byName[student];
    if (!sub) return;
    await patchSubmission({
      ...sub,
      comment: (drafts[student] ?? sub.comment ?? ""),
      feedbackUrl: (attachDrafts[student] ?? sub.feedbackUrl ?? "").trim(),
      qComments: { ...(sub.qComments || {}), ...(qDrafts[student] || {}) },
      openMarks: { ...(sub.openMarks || {}), ...(marks[student] || {}) },
      graded: true,
    });
    setSubmissions(await loadSubmissions());
  };

  return (
    <div>
      <button style={{ ...S.btn(false), marginBottom: 16 }} onClick={back}>← Retour</button>
      <h2 style={{ ...S.display, marginTop: 0 }}>{ex.title} <span style={{ fontSize: 13, color: C.soft, fontFamily: "'Be Vietnam Pro',sans-serif" }}>({ex.level} · {exSkills(ex).join(" + ")})</span></h2>
      {ex.deadline && <p style={{ fontSize: 13, color: isLate(ex) ? C.danger : C.warn, fontWeight: 700 }}>⏰ Date limite : {fmtDate(ex.deadline)}{isLate(ex) && " — les rendus tardifs sont marqués 🕐"}</p>}

      <div className="mcf-card" style={{ ...S.card, marginBottom: 20 }}>
        <div style={S.label}>Progression de la classe</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>{subs.length} {tr("bài đã nộp trên", "copie(s) rendue(s) sur", "submitted out of")} {roster.length} élève(s) concerné(s)
          {ex.assignedTo?.length ? <span style={{ color: C.primary, fontWeight: 700 }}> · 👤 devoir individuel</span> : null}</div>
        <div style={{ height: 10, background: C.line, borderRadius: 99, marginTop: 8 }}>
          <div style={{ height: "100%", width: `${Math.min(100, roster.length ? (subs.length / roster.length) * 100 : 0)}%`, background: `linear-gradient(90deg, ${C.ok}, #37C48E)`, borderRadius: 99 }} />
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {roster.map(({ name }) => {
          const sub = byName[name];
          const t = sub && totalScore(sub, ex);
          return (
            <div key={name} className="mcf-card" style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <strong>{name}{sub?.late && <span style={S.chip(C.warnSoft, C.warn)}> 🕐 En retard</span>}</strong>
                {sub?.redo ? (
                  <span style={{ fontSize: 13, color: C.warn, fontWeight: 700 }}>🔁 À refaire demandé{sub.redoNote && ` — « ${sub.redoNote} »`}</span>
                ) : sub ? (
                  <span style={{ fontSize: 13 }}>
                    <span style={{ color: C.ok, fontWeight: 700 }}>{tr("Đã nộp", "Rendu", "Submitted")}</span>
                    {" · "}<strong>{t.score}/{t.max}{t.pending && " ⏳"}</strong>
                    {" · "}{fmtDate(sub.at)}
                    {sub.timedOut && " · ⏱ auto (temps écoulé)"}
                    {sub.graded && " · ✅ corrigé"}
                    <button style={{ ...S.btn(false), marginLeft: 12, padding: "4px 10px", fontSize: 12 }}
                      onClick={() => setOpen(open === name ? null : name)}>{open === name ? "Fermer" : "Corriger / voir"}</button>
                  </span>
                ) : <span style={{ fontSize: 13, color: C.danger, fontWeight: 700 }}>{tr("Chưa nộp", "Pas encore rendu", "Not submitted")}</span>}
              </div>

              {sub && open === name && (
                <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 12, display: "grid", gap: 14 }}>
                  {ex.questions.map((q, i) => {
                    const a = sub.answers[q.id];
                    const good = q.type === "qcm" ? a === q.answer
                      : q.type === "vf" ? vfOk(q, a)
                      : q.type === "tableau" ? tableauOk(q, a)
                      : q.type === "apparier" ? apparierOk(q, a)
                      : q.type === "ordre" ? ordreOk(q, a)
                      : (q.type === "fill" || q.type === "conj") ? fillOk(q, a) : null;
                    return (
                      <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.line}` }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                        <div style={{ fontSize: 14 }}>
                          {q.type === "tableau" && <div style={{ marginTop: 6 }}><TableauCompare q={q} value={a || {}} readOnly correction /></div>}
                          {q.type === "ordre" && <div style={{ marginTop: 6 }}><OrdreBlocks q={q} value={a || []} readOnly correction /></div>}
                          {q.type === "apparier" && <div style={{ marginTop: 6 }}><GhepCap q={q} value={a || {}} readOnly correction dapAn={q.answers} /></div>}
                          {q.type === "formulaire" && <div style={{ marginTop: 6 }}><DienPhieu q={q} value={a || {}} readOnly /></div>}
                          {!["vf", "tableau", "ordre", "apparier", "formulaire"].includes(q.type) && <>{tr("Trả lời:", "Réponse :", "Answer:")} </>}{["vf", "tableau", "ordre", "apparier", "formulaire"].includes(q.type) ? null : q.type === "qcm"
                            ? <strong style={{ color: good ? C.ok : C.danger }}>{a != null ? String.fromCharCode(65 + a) + ". " + q.options[a] : "—"}</strong>
                            : q.type === "open"
                            ? <div style={{ marginTop: 6, background: "var(--mcf-surface)", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: a || "—" }} />
                            : <em style={{ color: good ? C.ok : C.danger }}>{a || "—"}</em>}
                          {good === false && q.type === "qcm" && <span> {tr("· đáp án:", "· attendu :", "· expected:")} <strong>{String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}</strong></span>}
                          {(q.type === "fill" || q.type === "conj") && <span> {tr("· 💡 đáp án:", "· 💡 attendu :", "· 💡 expected:")} <strong>{String(fillAccepted(q)).split("|")[0]}</strong></span>}
                          {q.type === "vf" && (
                            <div style={{ marginTop: 4 }}>
                              {tr("Lựa chọn:", "Choix :", "Choice:")} <strong style={{ color: good ? C.ok : C.danger }}>{a?.choice != null ? VF_OPTS[a.choice] : "—"}</strong>
                              {good === false && <span> {tr("· đáp án:", "· attendu :", "· expected:")} <strong>{VF_OPTS[q.answer]}</strong></span>}
                              {a?.just && <div style={{ fontStyle: "italic", marginTop: 3 }}>{tr("Căn cứ của học sinh: «", "Justification de l'élève : «", "Student's justification: «")} {a.just} »</div>}
                              {q.answer !== 2 && q.justification && (
                                <div style={{ marginTop: 6, background: C.okSoft, border: `1px solid ${C.ok}44`, borderRadius: 10, padding: "8px 12px" }}>
                                  💡 <strong>{tr("Căn cứ đúng:", "Justification attendue :", "Expected justification:")}</strong> {q.justification}
                                </div>
                              )}
                            </div>
                          )}
                          {q.type === "open" && q.model && <div style={{ color: C.soft, marginTop: 4 }}>Modèle : {q.model}</div>}
                        </div>
                        {q.type === "open" && (
                          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: C.soft, fontWeight: 700 }}>NOTE :</span>
                            {[1, 0].map((v) => {
                              const cur = marks[name]?.[q.id] ?? sub.openMarks?.[q.id] ?? null;
                              return (
                                <button key={v} onClick={() => setMarks({ ...marks, [name]: { ...(marks[name] || {}), [q.id]: v } })}
                                  style={{ ...S.btn(cur === v), padding: "4px 12px", fontSize: 12, background: cur === v ? (v ? C.ok : C.danger) : C.card, boxShadow: "none" }}>
                                  {v ? "✓ Juste (1 pt)" : "✗ À revoir (0 pt)"}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <input style={{ ...S.input, marginTop: 8, fontSize: 13 }}
                          placeholder={tr("Nhận xét cho câu này (học sinh thấy)…", "Commentaire sur cette question (visible par l'élève)…", "Comment on this question (visible to the student)…")}
                          value={qDrafts[name]?.[q.id] ?? sub.qComments?.[q.id] ?? ""}
                          onChange={(e) => setQDrafts({ ...qDrafts, [name]: { ...(qDrafts[name] || {}), [q.id]: e.target.value } })} />
                      </div>
                    );
                  })}
                  <div>
                    <div style={S.label}>Appréciation générale</div>
                    <textarea style={{ ...S.input, marginTop: 6, minHeight: 60, resize: "vertical" }}
                      value={drafts[name] ?? sub.comment ?? ""}
                      placeholder="ex. Très bon travail ! Revois l'accord du participe passé."
                      onChange={(e) => setDrafts({ ...drafts, [name]: e.target.value })} />

                    {/* 📎 File chữa bài đính kèm (optionnel) */}
                    <div style={{ marginTop: 10 }}>
                      <div style={S.label}>📎 Joindre un fichier (optionnel) — URL de la correction (PDF, DOCX, image…)</div>
                      <input style={{ ...S.input, marginTop: 6 }}
                        value={attachDrafts[name] ?? sub.feedbackUrl ?? ""}
                        placeholder="https://…/correction.pdf"
                        onChange={(e) => setAttachDrafts({ ...attachDrafts, [name]: e.target.value })} />
                      {(attachDrafts[name] ?? sub.feedbackUrl) && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8,
                          background: C.primarySoft, color: C.primary, borderRadius: 999, padding: "6px 14px",
                          fontSize: 12.5, fontWeight: 700, maxWidth: "100%", overflow: "hidden" }}>
                          📄 {fileNameFromUrl(attachDrafts[name] ?? sub.feedbackUrl)}
                          <button title="Retirer" onClick={() => setAttachDrafts({ ...attachDrafts, [name]: "" })}
                            style={{ border: "none", background: "transparent", cursor: "pointer", color: C.danger, fontWeight: 800, padding: 0 }}>✕</button>
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                      <button style={S.btn(true)} onClick={() => saveGrading(name)}>
                        {tr("Lưu bài chấm", "Enregistrer la correction", "Save grading")} {opens.length > 0 && "et la note"}
                      </button>
                      <button onClick={() => { setRedoFor(name); setRedoNote(""); }}
                        style={{ ...S.btn(false), color: C.warn, borderColor: C.warn, display: "inline-flex", alignItems: "center", gap: 7 }}>
                        <RotateCcw size={15} /> Demander de refaire
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dialog lý do yêu cầu làm lại */}
      {redoFor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.45)", display: "grid", placeItems: "center", padding: 16, zIndex: 200 }}
          onClick={() => setRedoFor(null)}>
          <div className="mcf-card" style={{ ...S.card, width: "100%", maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ ...S.display, fontSize: 20, marginTop: 0 }}>🔁 Demander à {redoFor} de refaire</h3>
            <p style={{ fontSize: 13.5, color: C.soft, marginTop: 0 }}>{tr("Điểm sẽ về 0 và bài quay lại mục « Cần làm » của học sinh.", "La note sera remise à zéro et l'exercice retournera dans « À faire » de l'élève.", "The score resets and the exercise returns to the student's « To do ».")}</p>
            <div style={S.label}>Remarque (visible sur le tableau de bord de l'élève)</div>
            <textarea style={{ ...S.input, marginTop: 6, minHeight: 70, resize: "vertical" }} value={redoNote}
              placeholder={tr("ví dụ: Chú ý hợp giống phân từ quá khứ, làm lại câu 3 và 5.", "ex. Attention à l'accord du participe passé — refais les questions 3 et 5.", "e.g. Watch past participle agreement, redo questions 3 and 5.")}
              onChange={(e) => setRedoNote(e.target.value)} autoFocus />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button style={{ ...S.btn(true), background: `linear-gradient(135deg, ${C.warn}, #E09A2B)`, boxShadow: "0 6px 16px rgba(201,132,18,.35)" }}
                onClick={() => requestRedo(redoFor)}>Confirmer</button>
              <button style={S.btn(false)} onClick={() => setRedoFor(null)}>{tr("Huỷ", "Annuler", "Cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { Teacher, Accounts, StudentDossier, Stats, StudentTable, Progress };
export default Teacher;
