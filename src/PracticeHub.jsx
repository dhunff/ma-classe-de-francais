import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import {
  Headphones, BookOpen, PenLine, Puzzle, BookA, Sparkles, ArrowRight, Play, PackageOpen, Award, Target, Star,
  RotateCcw, CheckCircle2, XCircle, Plus, ChevronLeft, PartyPopper, Trash2, Pencil, Copy, MoreVertical, Folder, FolderPlus, Image as ImageIcon, ChevronDown, Lightbulb, FileCheck,
} from "lucide-react";
import { C, S, QTYPES, VF_OPTS, LEVEL_COLORS } from "./shared/tokens.js";
import { uid, fillOk, fillAccepted, vfOk, stripHtml, autoQ, tableauOk, tableauCells, diemCau, ordreOk, getUnansweredQuestionsCount } from "./shared/questions.js";
import { load, save } from "./shared/storage.js";
import { loadPractice, saveExercise, deleteExercise, patchExerciseMeta, clearFolder } from "./shared/exerciseStore.js";
import { exSkills } from "./shared/exercises.js";
import { WrongExplanation } from "./shared/ui.jsx";
import { useT } from "./shared/i18n.jsx";
import { TableauCompare, OrdreBlocks, ConfirmSubmitModal } from "./screens/student/answers.jsx";
import RichTextEditor from "./editor/RichTextEditor.jsx";
import SplitPane from "./screens/practice/SplitPane.jsx";
import Builder from "./screens/teacher/Builder.jsx";
import PaymentModal from "./screens/student/PaymentModal.jsx";
import PremiumLockCard from "./screens/student/PremiumLockCard.jsx";
import DoiXpModal from "./screens/practice/DoiXpModal.jsx";
import { docXp, baoXpDoi } from "./shared/xp.js";
import { gradeRemote } from "./shared/gradeRemote.js";
import { PAYMENT_KEY, isPremium, hasAccess, fmtPrice, loadAccess } from "./shared/access.js";
import ExerciseCard from "./screens/practice/ExerciseCard.jsx";
import { supabase } from "./storageShim.js";
import { Lock } from "lucide-react";

/* ============================================================
   PRACTICE HUB v3 — Tự luyện tập
   Dùng CHUNG Builder với phần Giao bài : trộn QCM / điền từ /
   chia động từ / tự luận, audio sticky, bài đọc split-screen,
   Import DOCX, giới hạn thời gian. Chấm ngay + lưu lịch sử.
   Kho đề: bảng `exercises` + `questions`, store='practice'
   Lịch sử cá nhân: vẫn là blob "mcf-ph-<name>"
============================================================ */

/* `skill` là GIÁ TRỊ LƯU trong database — ex.skill và ex.skills mang đúng
   chuỗi này, và mọi phép lọc, khớp danh mục, chọn kỹ năng trong Builder đều so
   sánh với nó. Tuyệt đối không dịch: đổi nó là mọi bài tập hiện có mất phân
   loại, và bài tạo trên máy tiếng Việt không khớp bài tạo trên máy tiếng Pháp.

   `key` chỉ dùng để tra nhãn hiển thị: t(`skill.${key}`) cho tiêu đề thẻ và
   t(`skill.${key}_sub`) cho phụ đề. Trường `vi` cũ đặt tên sai — nó chứa phụ
   đề tiếng Pháp chứ không phải bản dịch — nên đã bỏ. */
/* `tuoi`: màu tươi CHỈ cho vòng tròn biểu tượng ở lưới thẻ (biểu tượng trắng).
   `color` giữ tông đậm vì còn làm màu chữ/viền ở màn trong, cần đủ tương phản. */
const CATS = [
  { skill: "Écoute", key: "listening", Icon: Headphones, color: "#41608F", pastel: "#EAEFF7", tuoi: "linear-gradient(135deg,#60A5FA,#2563EB)" },
  { skill: "Lecture", key: "reading", Icon: BookOpen, color: "#327654", pastel: "#E7F3EC", tuoi: "linear-gradient(135deg,#34D399,#059669)" },
  { skill: "Production écrite", key: "writing", Icon: PenLine, color: "#9B3D66", pastel: "#F8EAF0", tuoi: "linear-gradient(135deg,#FB7185,#E11D48)" },
  { skill: "Grammaire", key: "grammar", Icon: Puzzle, color: "#5B4B9E", pastel: "#EFECF9", tuoi: "linear-gradient(135deg,#A78BFA,#7C3AED)" },
  { skill: "Vocabulaire", key: "vocab", Icon: BookA, color: "#8F5E22", pastel: "#F7EFE3", tuoi: "linear-gradient(135deg,#FBBF24,#F97316)" },
  { skill: "__autres__", key: "others", Icon: Sparkles, color: "#626A85", pastel: "#EFF0F3", tuoi: "linear-gradient(135deg,#22D3EE,#0891B2)" },
];
const MAIN_SKILLS = CATS.filter((c) => !c.skill.startsWith("__")).map((c) => c.skill);
const inCat = (ex, sk) => sk === "__autres__"
  ? exSkills(ex).every((s) => !MAIN_SKILLS.includes(s))
  : exSkills(ex).includes(sk);
const catOf = (ex) => MAIN_SKILLS.find((sk) => exSkills(ex).includes(sk)) || "__autres__";

function PracticeHubInner({ role = "eleve", name = "", accounts = [], onRequireLogin }) {
  /* Khách xem được thư viện nhưng không làm được bài. Chặn đặt ở HÀNH ĐỘNG
     chứ không ở đường vào: người vãng lai thấy có gì rồi mới quyết định lập
     tài khoản, thay vì bị đá về trang đăng nhập ngay từ đầu. */
  const isGuest = role === "guest";
  const requireLogin = () => { onRequireLogin?.(); };
  const t = useT();
  const [topTab, setTopTab] = useState("bib");      // "bib" | "suivi" (prof)
  const [suivi, setSuivi] = useState(null);          // null = en cours de chargement
  const [suiviOpen, setSuiviOpen] = useState(null);  // ligne dépliée
  const [matModal, setMatModal] = useState(null);    // {exId, kind: "vocab"|"expl"|"corrige"}
  const [trainMenu, setTrainMenu] = useState(null);  // id thẻ đang mở dropdown → nâng z-index
  const teacher = role === "prof";
  const [exercises, setExercises] = useState([]);
  const [cats, setCats] = useState([]);
  const [folders, setFolders] = useState([]);    // dossiers par compétence [{id,name,cat}]
  const [folderPopup, setFolderPopup] = useState(false);
  const [renameFolder, setRenameFolder] = useState(null); // {id, name}
  const [deleteFolder, setDeleteFolder] = useState(null); // {id, name}
  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); };
  const [newFolder, setNewFolder] = useState("");
  const [moveEx, setMoveEx] = useState(null);    // exercice đang được "Déplacer vers…"          // danh mục con của "Autres"
  const [catPopup, setCatPopup] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [hist, setHist] = useState({});
  // Quyền truy cập bài trả phí + tài khoản nhận tiền của giáo viên.
  const [access, setAccess] = useState([]);
  const [payCfg, setPayCfg] = useState(null);
  const [payFor, setPayFor] = useState(null);
  /* XP (migration 101): số dư đọc từ máy chủ; `doiXp` = bài đang hỏi xác nhận đổi. */
  const [xp, setXp] = useState(null);
  const [doiXp, setDoiXp] = useState(null);
  useEffect(() => { if (role === "eleve") docXp().then(setXp); }, [role]);
  /* Cờ "mở toàn quyền" của chính học sinh đang đăng nhập. RLS trong 003 cho
     mỗi người đọc đúng dòng hồ sơ của mình, nên client hỏi được mà không thấy
     hồ sơ người khác — và không tự bật lên được, vì chỉ giáo viên có quyền
     ghi. Bảng chưa tồn tại thì lỗi bị nuốt và cờ ở lại false, tức khoá vẫn
     hoạt động như cũ. */
  const [fullAccess, setFullAccess] = useState(false);
  useEffect(() => {
    let off = false;
    supabase.from("profiles").select("has_premium_access").limit(1).maybeSingle()
      .then(({ data }) => { if (!off) setFullAccess(!!data?.has_premium_access); })
      .catch(() => {});
    return () => { off = true; };
  }, [name]);

  useEffect(() => {
    loadAccess().then(setAccess);
    load(PAYMENT_KEY, null).then(setPayCfg);
  }, []);
  const [loaded, setLoaded] = useState(false);
  /* Ô tìm kiếm ở thanh trên mở thẳng một bài qua state `moBai` (25/09). */
  const viTri = useLocation();
  const [view, setView] = useState(() => (viTri.state?.moBai ? { page: "quiz", exId: viTri.state.moBai, tuTimKiem: true } : { page: "home" }));
  useEffect(() => {
    if (viTri.state?.moBai) setView({ page: "quiz", exId: viTri.state.moBai, tuTimKiem: true });
  }, [viTri.key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    (async () => {
      /* Không còn bước chuẩn hoá thủ công: `exerciseFromRow` đã bảo đảm
         questions luôn là mảng, còn title/level có DEFAULT NOT NULL trong
         lược đồ (migration 010). Bài hỏng không lọt tới đây được nữa. */
      setExercises(await loadPractice());
      const rawCats = await load("mcf-custom-cats", []);
      setCats(Array.isArray(rawCats) ? rawCats.filter((c) => typeof c === "string" && c.trim()) : []);
      const rawFolders = await load("mcf-folders", []);
      setFolders(Array.isArray(rawFolders) ? rawFolders : []);
      if (name) setHist(await load(`mcf-ph-${name}`, {}, false));
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 📊 Suivi des élèves (prof) : lit l'historique d'entraînement de chaque élève
  const loadSuivi = async () => {
    setSuivi(null);
    const rows = [];
    await Promise.all(accounts.map(async (a) => {
      const ph = await load(`mcf-ph-${a.name}`, {}, false);
      if (ph && typeof ph === "object")
        Object.entries(ph).forEach(([exId, r]) => {
          if (r && r.max) rows.push({ id: a.name + "__" + exId, student: a.name, exId,
            best: r.best ?? 0, max: r.max, tries: r.tries ?? 1, at: r.at ?? 0 });
        });
    }));
    rows.sort((x, y) => y.at - x.at);
    setSuivi(rows);
  };
  useEffect(() => {
    if (teacher && topTab === "suivi") loadSuivi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topTab]);

  /* Trước đây là `persist(mảng-mới)`: ghi lại cả 37 bài chỉ để xoá một bài.
     Giờ xoá đúng một dòng, và lỗi được BÁO ra thay vì im lặng — trước kia
     `save` trả false thì giao diện vẫn hiện như đã xoá xong. */
  const removeEx = async (id) => {
    const r = await deleteExercise(id);
    if (!r.ok) { alert("❌ Échec de la suppression."); return; }
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };
  // 📋 Dupliquer : deep copy + regenerate toàn bộ ID (bài + câu hỏi)
  const duplicate = async (ex) => {
    const copy = typeof structuredClone === "function" ? structuredClone(ex) : JSON.parse(JSON.stringify(ex));
    copy.id = uid();
    copy.createdAt = Date.now();
    copy.title = (ex.title || "Exercice") + " (Copie)";
    copy.assignedTo = null; copy.deadline = "";
    copy.questions = (copy.questions || []).map((q) => ({ ...q, id: uid() }));
    /* Không cần đọc lại cả kho trước khi thêm: chèn một dòng không đụng gì tới
       các bài khác. Bước `load` cũ tồn tại chỉ để khỏi đè mất bài người khác
       vừa tạo — với bảng thì chuyện đó không xảy ra được. */
    const r = await saveExercise(copy, "practice");
    if (!r.ok) { alert("❌ Échec de la duplication."); return; }
    setExercises((prev) => [...prev, copy]);
  };
  const saveHist = async (exId, score, max) => {
    const prev = hist[exId] || { best: -1, tries: 0 };
    const next = { ...hist, [exId]: { best: Math.max(prev.best, score), max, tries: prev.tries + 1, at: Date.now() } };
    setHist(next); if (name) await save(`mcf-ph-${name}`, next, false);
    /* Máy chủ vừa chấm lượt này — trigger có thể đã cộng XP. Đọc lại số dư. */
    if (role === "eleve") { docXp().then((v) => v !== null && setXp(v)); baoXpDoi(); }
  };

  const addFolder = async (cat) => {
    const n = newFolder.trim(); if (!n) return;
    const next = [...folders, { id: uid(), name: n, cat }];
    setFolders(next); await save("mcf-folders", next);
    setNewFolder(""); setFolderPopup(false);
  };
  const doRenameFolder = async () => {
    const n = (renameFolder?.name || "").trim();
    if (!n) return;
    const next = folders.map((f) => (f.id === renameFolder.id ? { ...f, name: n } : f));
    setFolders(next); await save("mcf-folders", next);
    setRenameFolder(null); showToast("✅ Dossier renommé !");
  };

  /* Suppression SÛRE : 1) libérer les exercices (folderId -> null)  2) supprimer le dossier */
  const doDeleteFolder = async () => {
    const id = deleteFolder.id;
    const r = await clearFolder(id);
    if (!r.ok) { alert("❌ Échec — les exercices n'ont pas pu être libérés."); return; }
    setExercises((prev) => prev.map((e) => (e.folderId === id ? { ...e, folderId: undefined } : e)));
    const next = folders.filter((f) => f.id !== id);
    setFolders(next); await save("mcf-folders", next);
    setDeleteFolder(null); showToast("✅ Dossier supprimé — les exercices ont été conservés.");
  };

  /* Webhook SePay vừa ghi quyền — nạp lại HAI thứ, không phải một.
   *
   * Bản cũ chỉ gọi `loadAccess()`, và thế là ĐỦ hồi ổ khoá còn thuần giao
   * diện. Từ migration 019 thì không: RLS giấu luôn câu hỏi của bài chưa mua,
   * nên lúc tải trang `ex.questions` về rỗng. Nạp lại mỗi bảng quyền thì thẻ
   * khoá VẪN hiện, vì điều kiện của nó là "bài trả phí mà không có câu nào" —
   * và số câu vẫn đang là 0.
   *
   * Triệu chứng đúng như được báo: trả tiền xong, thấy dấu tích xanh, rồi vẫn
   * bị khoá cho tới khi tự tải lại trang.
   *
   * `loadPractice()` là lúc server mới chịu trả câu hỏi về, vì RLS giờ đã thấy
   * dòng quyền của em đó. */
  const sauKhiMoKhoa = async () => {
    const [acc, kho] = await Promise.all([loadAccess(), loadPractice()]);
    setAccess(acc);
    setExercises(kho);
  };

  const moveTo = async (exId, folderId) => {
    /* Chỉ sửa `meta`, không chạm tới câu hỏi — xem patchExerciseMeta. */
    const r = await patchExerciseMeta(exId, { folderId: folderId || undefined });
    if (!r.ok) { alert("❌ Échec du déplacement."); return; }
    setExercises((prev) => prev.map((e) => (e.id === exId ? { ...e, folderId: folderId || undefined } : e)));
    setMoveEx(null);
  };

  const addCat = async () => {
    const n = newCat.trim();
    if (!n || cats.includes(n)) return;
    const next = [...cats, n];
    setCats(next); await save("mcf-custom-cats", next);
    setNewCat(""); setCatPopup(false);
  };

  const blank = () => ({ id: uid(), title: "", level: "B1", skill: "Grammaire", skills: ["Grammaire"], consigne: "", usageType: "practice", deadline: "", audioUrl: "", readingText: "", imageUrl: "", timeLimit: "", targeted: false, assignedClasses: [], assignedExtra: [], assignedTo: null, createdAt: Date.now(), questions: [] });

  if (!loaded) return <p style={{ color: C.soft, textAlign: "center" }}>Chargement…</p>;

  if (view.page === "builder") {
    return <Builder draft={draft} setDraft={setDraft} accounts={[]}
      publish={async () => {
        if ((draft.usageType || "practice") === "assignment") {
          /* Chuyển sang danh sách Devoir. Trước đây phải GHI HAI KHO — thêm vào
             blob này, gỡ khỏi blob kia — và hỏng giữa chừng thì bài nằm ở cả
             hai nơi hoặc biến mất khỏi cả hai. Giờ chỉ là cột `store` đổi giá
             trị trong đúng một dòng: một lệnh ghi, không có trạng thái lửng. */
          const r = await saveExercise({ ...draft, folderId: undefined }, "assignment");
          if (!r.ok) { alert("❌ Échec de l'enregistrement."); return; }
          setExercises((prev) => prev.filter((e) => e.id !== draft.id));
          setView({ page: "home" }); return;
        }
        const r = await saveExercise(draft, "practice");
        if (!r.ok) { alert("❌ Échec de l'enregistrement."); return; }
        const others = exercises.filter((e) => e.id !== draft.id);
        setExercises([...others, draft].sort((a, b) => a.createdAt - b.createdAt));
        setView(draft.customCat ? { page: "category", cat: "__autres__", folder: draft.customCat } : { page: "category", cat: catOf(draft) });
      }}
      cancel={() => setView({ page: "home" })} />;
  }

  if (view.page === "quiz") {
    const ex = exercises.find((e) => e.id === view.exId);
    const back = () => setView(view.tuTimKiem ? { page: "home" } : { page: "category", cat: view.cat, folder: view.folder, niveau: view.niveau });
    /* Bài mở từ ô tìm kiếm có thể không nằm trong kho luyện tập (giáo viên tìm
       thấy cả bài giao). Nói thẳng thay vì dựng một màn làm bài rỗng. */
    if (!ex) {
      return (
        <div style={{ ...S.card, textAlign: "center" }}>
          <p style={{ color: C.soft, marginTop: 0 }}>Bài này không nằm trong kho luyện tập.</p>
          <button style={S.btn(false)} onClick={() => setView({ page: "home" })}>← {t("back")}</button>
        </div>
      );
    }

    /* Tường phí, phía giao diện.
     *
     * Điều kiện KHÔNG phải `canOpen(...)`. Nó là "bài trả phí mà server không
     * gửi câu hỏi nào về" — tức chính RLS ở migration 019 đã chặn.
     *
     * Vì sao hỏi dữ liệu thay vì hỏi biến JS: server là bên duy nhất có thẩm
     * quyền. Nếu client tự tính ra "được mở" mà RLS nghĩ khác, học sinh sẽ thấy
     * một bài trống trơn không lời giải thích — đúng cái lỗi "trang trắng".
     * Đọc theo dữ liệu thật thì hai bên không thể nói khác nhau.
     *
     * Giáo viên và học sinh có quyền vẫn nhận đủ câu hỏi, nên không rơi vào
     * nhánh này. */
    const bịKhoá = ex && isPremium(ex) && (ex.questions?.length ?? 0) === 0;
    if (bịKhoá) {
      return <PremiumLockCard ex={ex} onBack={back} onBuy={() => setPayFor(ex)}
        price={ex.price ? fmtPrice(ex.price) : ""} />;
    }

    return <PracticeWorkspace ex={ex} back={back}
      onFinish={(score, max) => saveHist(ex.id, score, max)} />;
  }

  /* -------- Sub-view "Autres" : thư mục danh mục con -------- */
  if (view.page === "autres") {
    const autresEx = exercises.filter((e) => inCat(e, "__autres__"));
    const unclassified = autresEx.filter((e) => !e.customCat);
    // « Non classé » retiré : seuls les dossiers créés explicitement apparaissent ;
    // les exercices sans catégorie sont listés directement sous les dossiers.
    const folders = cats.map((c) => ({ name: c, count: autresEx.filter((e) => e.customCat === c).length }));
    return (
      <div>
        {MatModal()}
        <button style={{ ...S.btn(false), marginBottom: 16 }} onClick={() => setView({ page: "home" })}><ChevronLeft size={16} /> {t("practice.back")}</button>
        <h2 style={{ ...S.display, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={24} color="#6E7691" /> Autres — Catégories
        </h2>

        {folders.length === 0 && !teacher ? (
          <div className="mcf-card" style={{ ...S.card, padding: 50, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🗂️</div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>Aucun exercice dans cette section</div>
            <div style={{ fontSize: 13.5, color: C.soft, marginTop: 6 }}>Le professeur n'a pas encore créé de catégorie. Reviens bientôt !</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 16 }}>
            {folders.map((f) => (
              <div key={f.name} className="mcf-card"
                onClick={() => setView({ page: "category", cat: "__autres__", folder: f.name })}
                style={{ ...S.card, padding: 22, cursor: "pointer" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--mcf-surface2)", border: "1px solid var(--mcf-line)", display: "grid", placeItems: "center", marginBottom: 12 }}>
                  <Folder size={24} color="#6E7691" />
                </div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{f.label || f.name}</div>
                <div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>{f.count} exercice{f.count > 1 ? "s" : ""}</div>
              </div>
            ))}
            {/* Thẻ + chỉ dành cho giáo viên */}
            {teacher && (
              <div onClick={() => setCatPopup(true)}
                style={{ borderRadius: 32, border: `2px dashed ${C.line}`, background: "transparent", cursor: "pointer",
                  padding: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 10, minHeight: 150, color: C.soft }}>
                <FolderPlus size={30} color={C.primary} />
                <div style={{ fontWeight: 700, fontSize: 14.5, color: C.primary }}>+ Créer une catégorie</div>
              </div>
            )}
          </div>
        )}

        {/* Exercices sans catégorie : listés directement sous les dossiers */}
        {unclassified.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <div style={{ ...S.label, marginBottom: 12 }}>Exercices sans catégorie</div>
            <div style={{ display: "grid", gap: 12 }}>
              {unclassified.map((ex) => {
                const hh = hist[ex.id];
                return (
                  <div key={ex.id} className="mcf-card" style={{ ...S.card, padding: "18px 20px", display: "flex", flexDirection: "column", width: "100%",
                    position: "relative" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: ex.imageUrl ? 14 : 10 }}>
                    <div>
                    <span style={S.badge(ex.level)}>{ex.level}</span>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 800, fontSize: 15.5 }}>{ex.title}</div>
                      <div style={{ fontSize: 12.5, color: C.soft, marginTop: 2 }}>
                        {ex.questions.length} question{ex.questions.length > 1 ? "s" : ""}
                        {hh && <> · 🏆 Meilleur : {hh.best}/{hh.max} ({hh.tries} essai{hh.tries > 1 ? "s" : ""})</>}
                      </div>
                    </div>
    </div>
                    </div>
                    {ex.imageUrl && (
                      <img src={ex.imageUrl} alt="" loading="lazy"
                        style={{ width: 240, maxWidth: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 12,
                      border: `1px solid ${C.line}`, marginBottom: 14, alignSelf: "flex-start" }} />
                    )}
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: "auto" }}>
                      <SplitTrain open={trainMenu === ex.id} setOpen={(v) => setTrainMenu(v ? ex.id : null)} teacher={teacher}
                        onStart={() => { if (isGuest) return requireLogin(); setView({ page: "quiz", cat: "__autres__", exId: ex.id }); }}
                        onPick={(kind) => setMatModal({ exId: ex.id, kind })} />
                      {teacher && <HubMenu
                        onEdit={() => { const c = JSON.parse(JSON.stringify(ex)); if (!c.skills || !c.skills.length) c.skills = c.skill ? [c.skill] : []; if (c.consigne === undefined) c.consigne = ""; if (!c.usageType) c.usageType = "practice"; setDraft(c); setView({ page: "builder" }); }}
                        onDup={() => duplicate(ex)}
                        onMove={null}
                        onDel={() => removeEx(ex.id)} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Popup tạo danh mục */}
        {catPopup && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.45)", display: "grid", placeItems: "center", padding: 16, zIndex: 200 }}
            onClick={() => setCatPopup(false)}>
            <div className="mcf-card" style={{ ...S.card, width: "100%", maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ ...S.display, fontSize: 19, marginTop: 0 }}>🗂️ Nouvelle catégorie</h3>
              <input style={{ ...S.input }} value={newCat} autoFocus
                placeholder="ex. Traduction, Culture, Argot…"
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCat()} />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button style={S.btn(true)} onClick={addCat}>Créer</button>
                <button style={S.btn(false)} onClick={() => setCatPopup(false)}>Annuler</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const Toast = toast ? (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 300,
      background: "#1E9E6A", color: "#fff", padding: "12px 26px", borderRadius: 999,
      fontWeight: 700, fontSize: 14, boxShadow: "0 10px 30px rgba(17,24,39,.35)" }}>{toast}</div>
  ) : null;

  if (view.page === "category") {
    const meta = CATS.find((c) => c.skill === view.cat);
    let all = exercises.filter((e) => inCat(e, view.cat));
    if (view.cat === "__autres__" && view.folder) {
      all = all.filter((e) => e.customCat === view.folder);
    }
    const NIVEAUX = Object.keys(LEVEL_COLORS); // A1 → C1, cùng nguồn với Builder
    // Tab par defaut : niveau du dernier exercice pratique dans cette categorie, sinon A1
    const defaultNiveau = (() => {
      const recent = all.filter((e) => hist[e.id]).sort((a, b) => (hist[b.id].at || 0) - (hist[a.id].at || 0))[0];
      if (recent) return recent.level;
      // Sinon : premier niveau qui contient réellement des exercices (évite un écran vide, ex. « Non classé »)
      const firstWith = NIVEAUX.find((lv) => all.some((e) => e.level === lv));
      return firstWith || "A1";
    })();
    const niveau = view.niveau || defaultNiveau;
    const catFolders = view.cat === "__autres__" ? [] : folders.filter((f) => f.cat === view.cat);
    const curFolder = view.folderId ? catFolders.find((f) => f.id === view.folderId) : null;
    // Dossier = TAG/FILTRE : par défaut on montre TOUT ; un dossier actif filtre la liste
    const inFolder = (e) => (view.folderId ? e.folderId === view.folderId : true);
    const folderName = (id) => catFolders.find((f) => f.id === id)?.name;
    const list = all.filter((e) => e.level === niveau && inFolder(e));
    return (
      <div>
        {MatModal()}
        {Toast}
        {/* Sau khi trả tiền: nạp lại CẢ quyền LẪN bài — xem sauKhiMoKhoa. */}
        {payFor && <PaymentModal ex={payFor} student={name} config={payCfg}
          onClose={() => setPayFor(null)}
          onUnlocked={sauKhiMoKhoa} />}
        {doiXp && <DoiXpModal ex={doiXp} xp={xp} t={t}
          onClose={() => setDoiXp(null)}
          onDone={(soDu) => { setXp(soDu); setDoiXp(null); baoXpDoi(); sauKhiMoKhoa(); }} />}
        <button style={{ ...S.btn(false), marginBottom: 16 }}
          onClick={() => setView(view.folder ? { page: "autres" } : { page: "home" })}><ChevronLeft size={16} /> {t("practice.back")}</button>

        {/* Dải tab chọn kỹ năng ở đây đã gỡ 25/09 theo yêu cầu chủ dự án —
            đổi kỹ năng bằng nút Quay lại về lưới thẻ. */}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ ...S.display, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <meta.Icon size={24} color={meta.color} /> {view.folder ? view.folder : t(`skill.${meta.key}`)}
          </h2>
          {teacher && <button style={S.btn(true)} onClick={() => {
            const sk = view.cat === "__autres__" ? "Traduction" : view.cat;
            const d = { ...blank(), skill: sk, skills: [sk], level: niveau };
            if (view.folder) d.customCat = view.folder;
            setDraft(d); setView({ page: "builder" });
          }}><Plus size={16} /> Nouvel exercice</button>}
        </div>

        {/* 📂 Dossiers = filtres (pills) */}
        {view.cat !== "__autres__" && (catFolders.length > 0 || teacher) && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
            <button onClick={() => setView({ ...view, folderId: null })}
              style={{ padding: "8px 18px", borderRadius: 999, fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                cursor: "pointer", border: `1.5px solid ${!view.folderId ? meta.color : C.line}`,
                background: !view.folderId ? `${meta.color}18` : "var(--mcf-surface)",
                color: !view.folderId ? meta.color : C.soft }}>
              Tous
            </button>
            {catFolders.map((f) => {
              const active = view.folderId === f.id;
              const n = all.filter((e) => e.folderId === f.id).length;
              return (
                <span key={f.id} style={{ display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "6px 8px 6px 16px", borderRadius: 999,
                  border: `1.5px solid ${active ? meta.color : C.line}`,
                  background: active ? `${meta.color}18` : "var(--mcf-surface)" }}>
                  <button onClick={() => setView({ ...view, folderId: active ? null : f.id })}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "transparent",
                      cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                      color: active ? meta.color : C.ink, padding: 0 }}>
                    <Folder size={14} color={meta.color} /> {f.name}
                    <span style={{ fontSize: 11, color: C.soft }}>({n})</span>
                  </button>
                  {teacher && (
                    <>
                      <button title="Renommer" onClick={() => setRenameFolder({ id: f.id, name: f.name })}
                        style={{ border: "none", background: "transparent", cursor: "pointer", padding: "2px 4px", color: C.soft, display: "flex" }}>
                        <Pencil size={13} />
                      </button>
                      <button title="Supprimer" onClick={() => setDeleteFolder(f)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", padding: "2px 4px", color: "#DE4B4B", display: "flex" }}>
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </span>
              );
            })}
            {teacher && (
              <button onClick={() => { setNewFolder(""); setFolderPopup(true); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 999,
                  border: `2px dashed ${C.line}`, background: "transparent", cursor: "pointer",
                  fontFamily: "inherit", fontWeight: 700, fontSize: 13, color: C.primary }}>
                <FolderPlus size={14} /> Créer un dossier
              </button>
            )}
          </div>
        )}

        {/* Tabs niveau A1 -> B2+ */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {NIVEAUX.map((lv) => {
            const active = niveau === lv;
            const count = all.filter((e) => e.level === lv).length;
            return (
              <button key={lv} onClick={() => setView({ ...view, niveau: lv })}
                style={{ padding: "9px 20px", borderRadius: 999, fontWeight: 800, fontSize: 14, cursor: "pointer",
                  fontFamily: "inherit", border: active ? "none" : `1.5px solid ${C.line}`,
                  background: active ? "var(--mcf-primary)" : "var(--mcf-surface)",
                  color: active ? "#fff" : C.soft,
                  boxShadow: active ? "0 6px 16px rgba(30,58,138,.32)" : "none",
                  transition: "all .15s ease" }}>
                {lv}{count > 0 && <span style={{ marginLeft: 6, fontSize: 11.5, opacity: 0.75 }}>({count})</span>}
              </button>
            );
          })}
        </div>
        {renameFolder && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.45)", display: "grid", placeItems: "center", padding: 16, zIndex: 200 }}
            onClick={() => setRenameFolder(null)}>
            <div className="mcf-card" style={{ ...S.card, width: "100%", maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ ...S.display, fontSize: 19, marginTop: 0 }}>✏️ Renommer le dossier</h3>
              <input style={{ ...S.input }} value={renameFolder.name} autoFocus
                onChange={(e) => setRenameFolder({ ...renameFolder, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && doRenameFolder()} />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button style={S.btn(true)} onClick={doRenameFolder}>Enregistrer</button>
                <button style={S.btn(false)} onClick={() => setRenameFolder(null)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {deleteFolder && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.45)", display: "grid", placeItems: "center", padding: 16, zIndex: 200 }}
            onClick={() => setDeleteFolder(null)}>
            <div className="mcf-card" style={{ ...S.card, width: "100%", maxWidth: 440, borderTop: "4px solid #DE4B4B" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ ...S.display, fontSize: 19, marginTop: 0 }}>🗑 Supprimer « {deleteFolder.name} » ?</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65 }}>
                Êtes-vous sûr de vouloir supprimer ce dossier ?<br />
                <strong>Les exercices à l'intérieur ne seront PAS supprimés</strong> — ils redeviendront simplement visibles sans dossier.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button style={{ ...S.btn(true), background: "#DE4B4B" }} onClick={doDeleteFolder}>Oui, supprimer</button>
                <button style={S.btn(false)} onClick={() => setDeleteFolder(null)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {folderPopup && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.45)", display: "grid", placeItems: "center", padding: 16, zIndex: 200 }}
            onClick={() => setFolderPopup(false)}>
            <div className="mcf-card" style={{ ...S.card, width: "100%", maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ ...S.display, fontSize: 19, marginTop: 0 }}>📂 Nouveau dossier — {t(`skill.${meta.key}`)}</h3>
              <input style={{ ...S.input }} value={newFolder} autoFocus
                placeholder="ex. Passé composé, DELF B1…"
                onChange={(e) => setNewFolder(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFolder(view.cat)} />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button style={S.btn(true)} onClick={() => addFolder(view.cat)}>Créer</button>
                <button style={S.btn(false)} onClick={() => setFolderPopup(false)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {moveEx && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.45)", display: "grid", placeItems: "center", padding: 16, zIndex: 200 }}
            onClick={() => setMoveEx(null)}>
            <div className="mcf-card" style={{ ...S.card, width: "100%", maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ ...S.display, fontSize: 19, marginTop: 0 }}>📂 Déplacer « {moveEx.title} » vers…</h3>
              <div style={{ display: "grid", gap: 8, marginTop: 4 }}>
                <button onClick={() => moveTo(moveEx.id, null)}
                  style={{ ...S.btn(false), justifyContent: "flex-start", textAlign: "left", opacity: !moveEx.folderId ? 0.5 : 1 }}>
                  🏠 Racine ({t(`skill.${meta.key}`)})
                </button>
                {catFolders.map((f) => (
                  <button key={f.id} onClick={() => moveTo(moveEx.id, f.id)}
                    style={{ ...S.btn(false), justifyContent: "flex-start", textAlign: "left", opacity: moveEx.folderId === f.id ? 0.5 : 1 }}>
                    📂 {f.name}
                  </button>
                ))}
                {catFolders.length === 0 && <span style={{ fontSize: 13, color: C.soft }}>Aucun dossier — créez-en un d'abord.</span>}
              </div>
              <button style={{ ...S.btn(false), marginTop: 14 }} onClick={() => setMoveEx(null)}>Annuler</button>
            </div>
          </div>
        )}

        {list.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center rounded-3xl border border-solid border-line bg-surface px-6 py-16 text-center shadow-sm transition-colors duration-300 dark:shadow-none">
            <PackageOpen size={48} strokeWidth={1.5} className="mb-3 text-soft" />
            <p className="m-0 text-lg font-semibold text-ink">{t("practice.level_empty_title")}</p>
            <p className="m-0 mt-1 text-sm text-soft">{t("practice.level_empty_body")}</p>
          </div>
        ) : (
          /* Lưới thẻ ngang: ảnh 16:9 bên trái, nội dung bên phải.

             Một cột cho tới 1536px. Thẻ ngang cần bề ngang: chia đôi ở 1280px
             thì ảnh 16rem đã nuốt gần nửa thẻ, tiêu đề rớt xuống ba dòng còn
             hàng nút thì dính vào chữ.

             Toàn bộ thân thẻ nằm trong ExerciseCard; ở đây chỉ còn việc dẫn
             dữ liệu và hành động vào. */
          <div className="grid gap-4 2xl:grid-cols-2">
            {list.map((ex) => {
              const h = hist[ex.id];
              const types = [...new Set(ex.questions.map((q) => QTYPES[q.type]))].join(" + ");
              /* Giáo viên luôn xem được bài của chính mình; chỉ học sinh mới bị khoá. */
              const locked = !teacher && !fullAccess && isPremium(ex) && !hasAccess(access, name, ex.id);
              return (
                <ExerciseCard
                  key={ex.id}
                  ex={ex}
                  premium={isPremium(ex)}
                  locked={locked}
                  best={h}
                  typesLabel={types}
                  folderLabel={ex.folderId ? folderName(ex.folderId) : null}
                  t={t}
                  onStart={() => { if (isGuest) return requireLogin(); setView({ page: "quiz", cat: view.cat, folder: view.folder, niveau, exId: ex.id }); }}
                  onPickMaterial={(kind) => setMatModal({ exId: ex.id, kind })}
                  onBuy={() => setPayFor(ex)}
                  onDoiXp={role === "eleve" ? () => setDoiXp(ex) : null}
                  teacherActions={!teacher ? null : [
                    { label: "Modifier", icon: <Pencil size={16} />, onClick: () => { const c = JSON.parse(JSON.stringify(ex)); if (!c.skills || !c.skills.length) c.skills = c.skill ? [c.skill] : []; if (c.consigne === undefined) c.consigne = ""; if (!c.usageType) c.usageType = "practice"; setDraft(c); setView({ page: "builder" }); } },
                    { label: "Dupliquer", icon: <Copy size={16} />, onClick: () => duplicate(ex) },
                    ...(view.cat !== "__autres__" ? [{ label: "Déplacer vers…", icon: <Folder size={16} />, onClick: () => setMoveEx(ex) }] : []),
                    { label: "Supprimer", icon: <Trash2 size={16} />, danger: true, onClick: () => removeEx(ex.id) },
                  ]}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* -------- 📚 Modal matériaux (Vocabulaire / Explications / Corrigé) -------- */
  function MatModal() {
    if (!matModal) return null;
    const ex = exercises.find((e) => e.id === matModal.exId);
    if (!ex) return null;
    const kind = matModal.kind;
    const TITLES = { vocab: ["📖 Vocabulaire de l'exercice"], expl: ["💡 Explications et Astuces"], corrige: ["📝 Sujet et Corrigé détaillé"] };
    const [title] = TITLES[kind] || ["", null];
    const content = kind === "vocab" ? (ex.vocabulaire || "") : kind === "expl" ? (ex.explications || "") : null;
    if (typeof document === "undefined") return null;
    return createPortal(
      <div className="mcf-float" style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", backdropFilter: "blur(4px)",
        display: "grid", placeItems: "center", padding: 16, zIndex: 9999 }}
        onClick={() => setMatModal(null)}>
        <div className="mcf-scroll" style={{ ...S.card, width: "100%", maxWidth: 640, maxHeight: "86vh", overflowY: "auto",
          background: "var(--mcf-card, #FFFFFF)", color: "var(--mcf-ink, #111827)", opacity: 1,
          border: "1px solid var(--mcf-line, #EEF0F4)", boxShadow: "0 24px 60px rgba(15,23,42,.35)" }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h3 style={{ ...S.display, fontSize: 20, margin: 0 }}>{title}</h3>
            <button onClick={() => setMatModal(null)} title="Fermer"
              style={{ width: 34, height: 34, borderRadius: 999, border: `1.5px solid ${C.line}`, background: "var(--mcf-surface)", cursor: "pointer", fontWeight: 800, color: C.ink }}>✕</button>
          </div>
          <div style={{ fontSize: 13, color: C.soft, marginBottom: 14 }}>
            <span style={S.badge(ex.level)}>{ex.level}</span> {ex.title}
          </div>

          {kind !== "corrige" ? (
            content && content.trim() ? (
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.85, fontSize: 15 }}>{content}</div>
            ) : (
              <div style={{ textAlign: "center", padding: "34px 16px", color: C.soft }}>
                <div style={{ fontSize: 38, marginBottom: 8 }}>{kind === "vocab" ? "📖" : "💡"}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>Le contenu est en cours de mise à jour. Revenez plus tard !</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Le professeur peut l'ajouter en modifiant l'exercice (champ « {kind === "vocab" ? "Vocabulaire" : "Explications"} »).</div>
              </div>
            )
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {ex.questions.map((q, i) => (
                <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    <span style={S.chip(C.primarySoft, C.primary)}>{QTYPES[q.type]}</span> {i + 1}. {q.prompt}
                  </div>
                  {q.type === "qcm" && (
                    <div style={{ fontSize: 14 }}>✅ <strong style={{ color: C.ok }}>{String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}</strong></div>
                  )}
                  {(q.type === "fill" || q.type === "conj") && (
                    <div style={{ fontSize: 14 }}>✅ <strong style={{ color: C.ok }}>{String(fillAccepted(q)).split("|").join(" / ")}</strong></div>
                  )}
                  {q.type === "vf" && (
                    <div style={{ fontSize: 14 }}>
                      ✅ <strong style={{ color: C.ok }}>{VF_OPTS[q.answer]}</strong>
                      {q.answer !== 2 && q.justification && <div style={{ fontStyle: "italic", marginTop: 4, color: C.soft }}>💡 {q.justification}</div>}
                    </div>
                  )}
                  {q.type === "ordre" && (
                    <div style={{ fontSize: 14 }}>✅ <strong style={{ color: C.ok }}>{(q.elements || []).map((e) => e.texte).join(" ")}</strong></div>
                  )}
                  {q.type === "tableau" && <TableauCompare q={q} value={q.answers || {}} readOnly correction />}
                  {q.type === "open" && (
                    q.model ? <div style={{ fontSize: 14, fontStyle: "italic", lineHeight: 1.7 }}>💡 {q.model}</div>
                      : <div style={{ fontSize: 13, color: C.soft }}>Réponse libre — pas de corrigé type fourni.</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }

  /* -------- 📊 Suivi des élèves (prof) -------- */
  const fmtAt = (t) => t ? new Date(t).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—";
  const AVATAR_COLORS = ["#5B4B9E", "#41608F", "#2C7573", "#327654", "#8F5E22", "#9B3D66"];
  const avatarColor = (n) => AVATAR_COLORS[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

  const renderSuivi = () => {
    if (suivi === null) return <p style={{ color: C.soft, textAlign: "center", padding: 30 }}>Chargement du suivi…</p>;
    if (suivi.length === 0) return (
      <div className="mcf-card" style={{ ...S.card, padding: 50, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🏋️</div>
        <div style={{ fontWeight: 800, fontSize: 17 }}>Aucun entraînement n'a été effectué pour le moment</div>
        <div style={{ fontSize: 13.5, color: C.soft, marginTop: 6 }}>Dès qu'un élève termine un exercice de la bibliothèque, ses résultats apparaîtront ici.</div>
      </div>
    );
    return (
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 13, color: C.soft }}>{suivi.length} entraînement{suivi.length > 1 ? "s" : ""} enregistré{suivi.length > 1 ? "s" : ""} · {new Set(suivi.map((r) => r.student)).size} élève{new Set(suivi.map((r) => r.student)).size > 1 ? "s" : ""}</span>
          <button style={{ ...S.btn(false), padding: "6px 14px", fontSize: 12.5 }} onClick={loadSuivi}>↻ Actualiser</button>
        </div>
        {suivi.map((r) => {
          const ex = exercises.find((e) => e.id === r.exId);
          const pct = r.max ? Math.round((r.best / r.max) * 100) : 0;
          const open = suiviOpen === r.id;
          return (
            <div key={r.id} className="mcf-card" style={{ ...S.card, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                {/* Élève */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 140 }}>
                  <span style={{ width: 38, height: 38, borderRadius: "50%", background: avatarColor(r.student),
                    color: "#fff", fontWeight: 800, fontSize: 15, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {r.student.charAt(0).toUpperCase()}
                  </span>
                  <strong style={{ fontSize: 14.5 }}>{r.student}</strong>
                </div>
                {/* Exercice */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  {ex ? (
                    <>
                      <span style={S.badge(ex.level)}>{ex.level}</span>
                      <strong style={{ fontSize: 14 }}>{ex.title}</strong>
                      <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>{exSkills(ex).join(" · ") || "—"}</div>
                    </>
                  ) : <em style={{ color: C.soft, fontSize: 13 }}>Exercice supprimé</em>}
                </div>
                {/* Score */}
                <div style={{ textAlign: "center", minWidth: 90 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: pct >= 80 ? C.ok : pct >= 50 ? C.warn : C.danger }}>{r.best}/{r.max}</div>
                  <div style={{ fontSize: 11.5, color: C.soft }}>{pct} % · {r.tries} essai{r.tries > 1 ? "s" : ""}</div>
                </div>
                {/* Date */}
                <div style={{ fontSize: 12.5, color: C.soft, minWidth: 110 }}>{fmtAt(r.at)}</div>
                <button style={{ ...S.btn(false), padding: "7px 14px", fontSize: 12.5 }}
                  onClick={() => setSuiviOpen(open ? null : r.id)}>{open ? "Fermer" : "Voir les détails"}</button>
              </div>
              {open && (
                <div style={{ marginTop: 12, borderTop: `1px solid ${C.line}`, paddingTop: 12, fontSize: 13.5, display: "grid", gap: 6 }}>
                  <div>🏆 <strong>Meilleur score :</strong> {r.best}/{r.max} ({pct} %)</div>
                  <div>🔁 <strong>Nombre d'essais :</strong> {r.tries}</div>
                  <div>🕐 <strong>Dernière tentative :</strong> {fmtAt(r.at)}</div>
                  {ex && <div>📚 <strong>Compétence(s) :</strong> {exSkills(ex).join(", ") || "—"} · <strong>Niveau :</strong> {ex.level}</div>}
                  <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>ℹ️ L'entraînement est corrigé instantanément côté élève : seuls le meilleur score, le nombre d'essais et la date sont conservés (pas les réponses détaillées).</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /* -------- Home dashboard -------- */
  return (
    <div>
      {MatModal()}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{t("practice.library_title")}</h2>
          {xp !== null && (
            <span title={t("xp.balance_hint")}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-sm font-bold tabular-nums text-primary">
              <Star size={15} className="fill-current" /> {xp.toLocaleString("vi-VN")} XP
            </span>
          )}
        </div>
        {teacher && topTab === "bib" && <button style={S.btn(true)} onClick={() => { setDraft(blank()); setView({ page: "builder" }); }}><Plus size={16} /> Nouvel exercice</button>}
      </div>
      {teacher && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["bib", "📚 Bibliothèque"], ["suivi", "📊 Suivi des élèves"]].map(([k, l]) => (
            <button key={k} onClick={() => setTopTab(k)} style={{ ...S.btn(topTab === k), padding: "8px 16px" }}>{l}</button>
          ))}
        </div>
      )}
      {teacher && topTab === "suivi" ? renderSuivi() : null}
      {teacher && topTab === "suivi" ? null : (<>
      {/* Lưới thẻ nhóm — dựng lại 25/09. Số bài và tiến độ đếm từ dữ liệu thật
          (`exercises`, `hist`), không có danh sách giả. Màu biểu tượng lấy từ
          CATS (ngoại lệ màu nhận dạng, chữ trắng trên nền đậm). */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CATS.map((cat, i) => {
          const list = exercises.filter((e) => inCat(e, cat.skill));
          if (cat.skill === "__autres__" && list.length === 0 && cats.length === 0 && !teacher) return null;
          const doneCount = list.filter((e) => hist[e.id]).length;
          const pct = list.length ? Math.round((doneCount / list.length) * 100) : 0;
          return (
            <button key={cat.skill} type="button"
              onClick={() => setView(cat.skill === "__autres__" ? { page: "autres" } : { page: "category", cat: cat.skill })}
              style={{ animationDelay: `${i * 40}ms` }}
              className="mcf-card group relative flex cursor-pointer flex-col rounded-3xl border border-solid border-line bg-surface p-6 text-left font-sans shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:shadow-2xl dark:hover:shadow-blue-900/20">
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-full text-white shadow-md transition-transform duration-300 group-hover:scale-110" style={{ background: cat.tuoi || cat.color }}>
                <cat.Icon size={22} />
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold text-ink">{t(`skill.${cat.key}`)}</span>
                <span className="rounded-full bg-surface2 px-2.5 py-0.5 text-xs font-medium text-soft">
                  {t("practice.exercises_count", { n: list.length })}
                </span>
              </span>
              <span className="mb-6 mt-1 line-clamp-1 text-sm text-soft">{t(`skill.${cat.key}_sub`)}</span>

              {!teacher && list.length > 0 && (
                <span className="mb-5 block">
                  <span className="mb-1.5 flex justify-between text-xs font-semibold text-soft">
                    <span>{t("practice.completed")}</span>
                    <span className="tabular-nums">{doneCount}/{list.length}</span>
                  </span>
                  <span className="block h-1.5 overflow-hidden rounded-full bg-surface2">
                    <span className="block h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
                  </span>
                </span>
              )}

              <span className="mt-auto flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {t("home.start")}
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-solid border-line-strong text-soft transition-colors duration-300 group-hover:border-primary group-hover:text-primary">
                  <Play size={13} className="ml-0.5" />
                </span>
              </span>
            </button>
          );
        })}
      </div>
      </>)}
    </div>
  );
}

/* ============================================================
   🏗️ RÈGLE D'ARCHITECTURE (à respecter pour tout nouveau code)
   Tout élément flottant (Dropdown, Popover, Select, Tooltip, Modal)
   DOIT être rendu via React Portal dans document.body avec un
   z-index global (9999). Ne JAMAIS rendre un menu déroulant à
   l'intérieur du DOM d'une Card ou d'un élément de liste :
   les propriétés animation / transform / filter / opacity des
   cartes créent un stacking context qui emprisonne le z-index.
   ============================================================ */
function FloatingMenu({ anchorRef, open, onClose, children, minWidth = 180, align = "right" }) {
  const [pos, setPos] = useState(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const place = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r) return;
      const w = Math.max(minWidth, menuRef.current?.offsetWidth || minWidth);
      const h = menuRef.current?.offsetHeight || 200;
      let left = align === "right" ? r.right - w : r.left;
      left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
      // bascule au-dessus si pas de place en bas
      const below = r.bottom + 6;
      const top = (below + h > window.innerHeight - 8 && r.top - h - 6 > 8) ? r.top - h - 6 : below;
      setPos({ top, left, width: w });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => { window.removeEventListener("scroll", place, true); window.removeEventListener("resize", place); };
  }, [open, minWidth, align, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return;
      onClose();
    };
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div ref={menuRef} role="menu" className="mcf-float"
      style={{ position: "fixed", top: pos?.top ?? -9999, left: pos?.left ?? -9999, minWidth,
        zIndex: 9999, background: "var(--mcf-surface, #FFFFFF)", borderRadius: 18, padding: 6,
        border: "1px solid var(--mcf-line, #EEF0F4)", color: "var(--mcf-ink, #111827)", opacity: 1,
        boxShadow: "0 18px 44px rgba(17,24,39,.28)", visibility: pos ? "visible" : "hidden" }}>
      {children}
    </div>,
    document.body
  );
}

/* ---- Split button "S'entraîner ▾" : làm bài + tài liệu bổ trợ ---- */
function SplitTrain({ onStart, onPick, open, setOpen, teacher = false }) {
  const ref = useRef(null);
  /* « Sujet et Corrigé » CHỈ cho giáo viên.
     Hộp đó dựng đáp án từ `q.answer`, mà từ migration 022 trình duyệt của học
     sinh không đọc được `answer_key` — nên với họ nó vẽ ra một bảng đáp án
     RỖNG. Một mục menu hứa « corrigé » rồi trả về trống còn tệ hơn là không có
     mục đó. Học sinh thấy đáp án ở màn chấm bài, nơi máy chủ gửi kèm. */
  const ITEMS = [
    ["vocab", <BookOpen size={16} key="i" />, "Vocabulaire"],
    ["expl", <Lightbulb size={16} key="i" />, "Explications"],
    ...(teacher ? [["corrige", <FileCheck size={16} key="i" />, "Sujet et Corrigé"]] : []),
  ];
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button onClick={onStart}
        style={{ ...S.btn(true), borderRadius: "999px 0 0 999px", paddingRight: 14 }}>S'entraîner</button>
      <button onClick={() => setOpen(!open)} title="Ressources de l'exercice" aria-haspopup="menu" aria-expanded={open}
        style={{ ...S.btn(true), borderRadius: "0 999px 999px 0", padding: "11px 12px", marginLeft: 1,
          display: "inline-flex", alignItems: "center" }}>
        <ChevronDown size={17} style={{ transition: "transform .15s ease", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      <FloatingMenu anchorRef={ref} open={open} onClose={() => setOpen(false)} minWidth={210}>
        {ITEMS.map(([k, icon, label]) => (
          <button key={k} onClick={() => { setOpen(false); onPick(k); }} role="menuitem"
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px",
              border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit",
              fontSize: 14, fontWeight: 600, borderRadius: 12, textAlign: "left", color: "var(--mcf-ink)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--mcf-bg)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            {icon} {label}
          </button>
        ))}
      </FloatingMenu>
    </div>
  );
}

/* ---- Dropdown ⋮ cho thẻ bài tự luyện ---- */
function HubMenu({ onEdit, onDup, onDel, onMove }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const item = (label, icon, onClick, danger) => (
    <button onClick={() => { setOpen(false); onClick(); }}
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", border: "none",
        background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
        borderRadius: 14, textAlign: "left", color: danger ? C.danger : C.ink }}
      onMouseEnter={(e) => e.currentTarget.style.background = danger ? C.dangerSoft : "var(--mcf-bg)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
      {icon} {label}
    </button>
  );
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} title="Plus d'options"
        style={{ width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${C.line}`, background: "var(--mcf-surface)",
          cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "0 2px 8px rgba(17,24,39,.06)" }}>
        <MoreVertical size={18} color={C.ink} />
      </button>
      <FloatingMenu anchorRef={ref} open={open} onClose={() => setOpen(false)} minWidth={190}>
        {item("Modifier", <Pencil size={16} />, onEdit)}
        {item("Dupliquer", <Copy size={16} />, onDup)}
        {onMove && item("Déplacer vers…", <Folder size={16} />, onMove)}
        {item("Supprimer", <Trash2 size={16} />, onDel, true)}
      </FloatingMenu>
    </div>
  );
}

/* ============ Workspace tự luyện — chấm ngay ============ */
function PracticeWorkspace({ ex, back, onFinish }) {
  const [answers, setAnswers] = useState({});
  const [confirmCount, setConfirmCount] = useState(null);   // ⚠️ copie incomplète
  const t = useT();
  const [graded, setGraded] = useState(false);
  const [remote, setRemote] = useState(null);   // kết quả chấm từ máy chủ
  const [diemMayChu, setDiemMayChu] = useState(null);  // { score, max } — điểm THẬT, xem chú thích dưới
  const [remaining, setRemaining] = useState(null);
  const [zen, setZen] = useState(false); // 🧘 chế độ tập trung
  const [imgZoom, setImgZoom] = useState(false); // 🔍 lightbox ảnh đề bài
  const answersRef = useRef(answers); answersRef.current = answers;
  const gradedRef = useRef(false);

  // ⏱ Đếm ngược (nếu có giới hạn thời gian) — tự chấm khi hết giờ
  useEffect(() => {
    if (!ex?.timeLimit) return;
    const end = Date.now() + Number(ex.timeLimit) * 60 * 1000;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.round((end - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) { clearInterval(timer); if (!gradedRef.current) grade(true); }
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex?.id]);

  if (!ex) return null;
  const autos = ex.questions.filter(autoQ);
  const opens = ex.questions.filter((q) => q.type === "open");
  /* Máy chủ nói trước, trình duyệt chỉ nói khi máy chủ im.
   *
   * `remote` là kết quả từ Edge Function `grade`. Có nó thì dùng nó — đó là
   * bên duy nhất còn thấy đáp án sau migration 021. Chưa có (đang gọi, hoặc
   * gọi hỏng) thì tạm chấm tại chỗ như trước.
   *
   * Giữ nguyên tên `isGood` và chữ ký: nó được gọi ở hơn chục chỗ trong phần
   * dựng giao diện, và đổi tên ở đây nghĩa là sửa hết chừng ấy chỗ cho một
   * thay đổi vốn không cần ai bên ngoài biết. */
  const isGood = (q) => {
    const r = remote?.[q.id];
    if (r && typeof r.correct === "boolean") return r.correct;
    return q.type === "qcm" ? answersRef.current[q.id] === q.answer
      : q.type === "vf" ? vfOk(q, answersRef.current[q.id])
      : q.type === "tableau" ? tableauOk(q, answersRef.current[q.id])
      : q.type === "ordre" ? ordreOk(q, answersRef.current[q.id])
      : fillOk(q, answersRef.current[q.id]);
  };

  const grade = async (timedOut = false) => {
    gradedRef.current = true;
    setGraded(timedOut ? "timeout" : true);

    const res = await gradeRemote(ex.id, answersRef.current);

    /* Máy chủ không trả lời VÀ đáp án cũng không còn ở client → không ai chấm
       được. Từ migration 022, `payload` không còn `answer`/`accepted`, nên bộ
       chấm cũ sẽ thấy mọi câu đều sai và hiện 0 điểm.

       Một con số 0 bịa ra tệ hơn hẳn một lời báo lỗi: học sinh tưởng mình làm
       sai hết, và bài đã làm thì mất. Nên thà nói thẳng là chưa chấm được và
       giữ nguyên bài cho họ nộp lại. */
    const conDapAnCucBo = autos.some((q) =>
      q.answer !== undefined || q.accepted !== undefined || q.answers !== undefined);
    if (!res && !conDapAnCucBo) {
      gradedRef.current = false;
      setGraded(false);
      alert("⚠️ Chưa chấm được bài lúc này — máy chủ chấm không phản hồi.\n"
          + "Bài của bạn vẫn còn nguyên, hãy thử nộp lại sau ít phút.");
      return;
    }

    if (res) { setRemote(res.results); setDiemMayChu({ score: res.score, max: res.max }); }

    /* Điểm lấy từ máy chủ khi có. Tự cộng lại ở đây là mở đường cho hai con số
       lệch nhau — màn hình hiện một đằng, lịch sử lưu một nẻo. */
    const score = res ? res.score : autos.reduce((n, q) => n + (isGood(q) ? 1 : 0), 0);
    onFinish(score, res ? res.max : (autos.length || 0));
  };
  /* Đáp án của câu điền từ / chia động từ.
   *
   * Ưu tiên `expected` của máy chủ (chỉ có khi câu SAI — đúng thì chữ học sinh
   * gõ chính là đáp án). Lùi về `fillAccepted(q)` cho giáo viên và cho lúc máy
   * chủ không trả lời. Không có gì thì trả chuỗi rỗng, và nơi gọi ẩn hẳn khối
   * đáp án — « Réponse attendue : » bỏ trống là một lời hứa không giữ. */
  const dapAnFill = (q) => {
    const mc = remote?.[q.id]?.expected;
    if (mc != null && mc !== "") return String(mc);
    const cuc = fillAccepted(q);
    return cuc == null ? "" : String(cuc);
  };

  const retry = () => {
    gradedRef.current = false; setGraded(false); setAnswers({}); setRemote(null); setDiemMayChu(null);
  };

  /* Điểm hiển thị phải cộng theo ĐƠN VỊ, không theo số câu: một bảng OUI/NON
     đáng bằng số ô của nó ở máy chủ, nên cộng "mỗi câu 1 điểm" ở đây sẽ ra một
     con số khác con số đã lưu. Xem diemCau() trong shared/questions.js. */
  /* ĐIỂM LẤY TỪ MÁY CHỦ KHI CÓ.
   *
   * `diemCau` chấm tại chỗ, và để chấm thì nó phải đọc `q.answer` — thứ mà từ
   * migration 022 trình duyệt của học sinh KHÔNG có. Nên mọi câu ra sai và màn
   * hình hiện « Tu as obtenu 0/7 » cho một bài làm đúng gần hết, trong khi
   * điểm máy chủ lưu vào lịch sử lại đúng. Hai con số cho cùng một bài.
   *
   * Nhánh tự cộng giữ lại cho lúc máy chủ không trả lời và cho giáo viên (họ
   * CÓ đáp án qua get_answer_keys) — nhưng nó là nhánh lùi, không phải nhánh
   * chính. */
  const score = graded
    ? (diemMayChu ? diemMayChu.score
      : autos.reduce((n, q) => n + diemCau(q, answersRef.current[q.id], ex).dung, 0))
    : 0;
  const tongDiem = diemMayChu ? diemMayChu.max : autos.length;
  const perfect = graded && tongDiem > 0 && score === tongDiem;
  const allAnswered = ex.questions.every((q) =>
    q.type === "qcm" ? answers[q.id] != null
    : q.type === "tableau" ? tableauCells(q).every((k) => answers[q.id] && answers[q.id][k])
    : q.type === "ordre" ? (Array.isArray(answers[q.id]) && answers[q.id].length === (q.elements || []).length)
    : q.type === "vf" ? (answers[q.id]?.choice != null && (answers[q.id].choice === 2 || (answers[q.id].just || "").trim() !== ""))
    : q.type === "open" ? stripHtml(answers[q.id]) !== "" : (answers[q.id] || "").trim() !== "");
  const fmtLeft = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const questionCards = ex.questions.map((q, i) => {
    const a = answers[q.id];
    const good = graded && autoQ(q) ? isGood(q) : null;
    return (
      <div key={q.id} className="mcf-card" style={S.card}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>
          <span style={S.chip(C.primarySoft, C.primary)}>{QTYPES[q.type]}</span> {i + 1}. {q.prompt}
        </div>

        {q.type === "qcm" ? (
          <div style={{ display: "grid", gap: 8 }}>
            {q.options.map((o, j) => {
              let bg = "var(--mcf-surface)", border = C.line, icon = null;
              if (graded) {
                /* ══ VÌ SAO KHÔNG DÙNG `q.answer` ══
                 *
                 * Từ migration 022, `answer_key` KHÔNG cấp SELECT cho trình
                 * duyệt, nên với học sinh `q.answer` là `undefined`. Khối cũ so
                 * `j === q.answer` nên KHÔNG Ô NÀO xanh, còn nhánh `else if`
                 * tô ĐỎ ô học sinh chọn — kể cả khi họ làm ĐÚNG. Máy chủ chấm
                 * đúng, màn hình vẽ ngược lại: mọi câu hiện như sai hết.
                 *
                 * Nguồn đúng là kết quả máy chủ: `dung` cho biết đúng/sai,
                 * `dapAn` là đáp án máy chủ gửi kèm (`expected`) và chỉ có mặt
                 * khi học sinh làm SAI — đúng thì không cần, ô họ chọn chính là
                 * đáp án. */
                const dung = isGood(q);
                const dapAn = remote?.[q.id]?.expected;
                if (j === a) {
                  bg = dung ? C.okSoft : C.dangerSoft;
                  border = dung ? C.ok : C.danger;
                  icon = dung ? <CheckCircle2 size={17} color={C.ok} /> : <XCircle size={17} color={C.danger} />;
                } else if (!dung && dapAn != null && o === dapAn) {
                  bg = C.okSoft; border = C.ok; icon = <CheckCircle2 size={17} color={C.ok} />;
                }
              } else if (j === a) { bg = C.primarySoft; border = C.primary; }
              return (
                <button key={j} disabled={!!graded} onClick={() => setAnswers({ ...answers, [q.id]: j })}
                  style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "10px 14px", borderRadius: 10, fontSize: 15,
                    fontFamily: "inherit", cursor: graded ? "default" : "pointer", background: bg, border: `1.5px solid ${border}`, color: C.ink,
                    /* Gạch ngang CHỈ khi ô này là lựa chọn SAI. Điều kiện cũ
                       `j !== q.answer` luôn đúng với học sinh (q.answer rỗng),
                       nên ô họ chọn bị gạch cả khi làm đúng — chữ gạch ngang
                       trên một ô đang tô xanh đọc ra hai nghĩa trái nhau. */
                    textDecoration: graded && j === a && !isGood(q) ? "line-through" : "none" }}>
                  <strong>{String.fromCharCode(65 + j)}.</strong> {o}<span style={{ marginLeft: "auto" }}>{icon}</span>
                </button>
              );
            })}
          </div>
        ) : q.type === "ordre" ? (
          <OrdreBlocks q={q} value={a || []} readOnly={!!graded} correction={!!graded}
            dapAn={remote?.[q.id]?.expected} dung={graded && remote?.[q.id] ? isGood(q) : undefined}
            onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
        ) : q.type === "tableau" ? (
          /* `dapAn`: bảng đáp án của máy chủ (`expected`, chỉ gửi khi câu SAI).
             Làm đúng thì chính ô học sinh chọn là đáp án — truyền `a` vào để
             bảng vẫn đánh dấu xanh thay vì trắng trơn. */
          <TableauCompare q={q} value={a || {}} readOnly={!!graded} correction={!!graded}
            dapAn={remote?.[q.id]?.expected ?? (graded && isGood(q) ? a : undefined)}
            onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
        ) : q.type === "vf" ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {VF_OPTS.map((o, j) => {
                const sel = a?.choice === j;
                let bg = sel ? C.primarySoft : "var(--mcf-surface)", border = sel ? C.primary : C.line, col = sel ? C.primary : C.ink;
                if (graded) {
                  /* Cùng lỗi, cùng cách sửa như khối qcm ở trên: với học sinh
                     `q.answer` là undefined từ migration 022. `expected` của
                     câu vf là CHỈ SỐ (0/1/2), không phải chữ. */
                  const dung = isGood(q);
                  const dapAn = remote?.[q.id]?.expected;
                  if (sel) {
                    bg = dung ? C.okSoft : C.dangerSoft;
                    border = dung ? C.ok : C.danger;
                    col = dung ? C.ok : C.danger;
                  } else if (!dung && dapAn != null && j === Number(dapAn)) {
                    bg = C.okSoft; border = C.ok; col = C.ok;
                  }
                }
                return (
                  <button key={j} disabled={!!graded}
                    onClick={() => setAnswers({ ...answers, [q.id]: { choice: j, just: j === 2 ? "" : (a?.just || "") } })}
                    style={{ padding: "10px 22px", borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                      cursor: graded ? "default" : "pointer", fontFamily: "inherit",
                      border: `1.5px solid ${border}`, background: bg, color: col }}>
                    {/* Dấu ✓ đi theo đúng ô được tô xanh ở trên, không theo
                        `q.answer` — với học sinh nó là undefined nên dấu này
                        trước đây không bao giờ hiện. */}
                    {o}{graded && col === C.ok && " ✓"}
                  </button>
                );
              })}
            </div>
            {!graded && (a?.choice === 0 || a?.choice === 1) && (
              <textarea value={a?.just || ""}
                placeholder="Justifiez votre réponse en citant le texte…"
                onChange={(e) => setAnswers({ ...answers, [q.id]: { ...a, just: e.target.value } })}
                style={{ ...S.input, minHeight: 60, resize: "vertical" }} />
            )}
            {graded && (
              <div style={{ fontSize: 14 }}>
                {a?.just && <div style={{ fontStyle: "italic" }}>Ma justification : « {a.just} »</div>}
                {q.answer !== 2 && q.justification && (
                  <div style={{ marginTop: 8, background: C.okSoft, border: `1.5px solid ${C.ok}55`, borderRadius: 12, padding: "10px 14px" }}>
                    💡 <strong>Justification attendue :</strong> <em>{q.justification}</em>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : q.type === "open" ? (
          <>
            <RichTextEditor value={a || ""} readOnly={!!graded} onChange={(html) => setAnswers({ ...answers, [q.id]: html })} />
            {graded && q.model && (
              <div style={{ marginTop: 12, background: C.okSoft, border: `1.5px solid ${C.ok}55`, borderRadius: 12, padding: "12px 15px" }}>
                💡 <strong>Réponse suggérée :</strong>
                <div style={{ marginTop: 4, fontSize: 14.5, fontStyle: "italic", lineHeight: 1.7 }}>{q.model}</div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input disabled={!!graded} value={a || ""} placeholder="Ta réponse…"
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              style={{ ...S.input, maxWidth: 320,
                border: `1.5px solid ${graded ? (good ? C.ok : C.danger) : C.line}`,
                background: graded ? (good ? C.okSoft : C.dangerSoft) : "var(--mcf-surface2)",
                textDecoration: graded && !good ? "line-through" : "none" }} />
            {graded && (good
              ? <CheckCircle2 size={18} color={C.ok} />
              : dapAnFill(q) && <span style={{ fontSize: 13.5, color: C.ok, fontWeight: 700 }}>✗ → {String(dapAnFill(q)).split("|")[0]}</span>)}
            {/* Chỉ hiện khi THẬT SỰ có đáp án. `fillAccepted` đọc `q.accepted`,
                mà migration 022 gỡ trường đó khỏi payload của học sinh — khối
                này vì thế từng hiện « Réponse attendue : » rồi bỏ trống. */}
            {graded && (q.type === "fill" || q.type === "conj") && dapAnFill(q) && (
              <div style={{ marginTop: 8, background: C.okSoft, border: `1.5px solid ${C.ok}55`, borderRadius: 10, padding: "7px 12px", fontSize: 13, display: "inline-block" }}>
                💡 <strong style={{ color: C.ok }}>Réponse attendue :</strong> {String(dapAnFill(q)).split("|").join(" / ")}
              </div>
            )}
            {/* Lời giải thích chỉ hiện khi sai — đó là lúc nó có việc để làm. */}
            <WrongExplanation show={graded && good === false} explanation={q.explanation || q.explication || ex.explications} />
          </div>
        )}
      </div>
    );
  });

  return (
    <div style={zen ? { position: "fixed", inset: 0, zIndex: 90, background: "var(--mcf-bg)", overflowY: "auto", padding: "28px 16px 80px" } : undefined}>
      {zen && (
        <button onClick={() => setZen(false)} title="Quitter le mode Focus"
          style={{ position: "fixed", top: 16, right: 16, zIndex: 120, display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
            background: C.ink, color: "var(--mcf-bg)", fontWeight: 700, fontSize: 13.5,
            boxShadow: "0 8px 22px rgba(17,24,39,.3)" }}>
          ⤡ Quitter le Focus
        </button>
      )}
      <div style={zen ? { maxWidth: 920, margin: "0 auto" } : undefined}>
      {remaining != null && !graded && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100, display: "flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 999, background: remaining <= 60 ? C.danger : "#111827", color: "#fff", border: "1px solid var(--mcf-line)",
          fontWeight: 800, fontSize: 17, boxShadow: "0 8px 22px rgba(27,37,89,.35)", fontVariantNumeric: "tabular-nums" }}>
          ⏱ {fmtLeft(remaining)}
        </div>
      )}

      <button style={{ ...S.btn(false), marginBottom: 16 }} onClick={back}><ChevronLeft size={16} /> {t("practice.back")}</button>
      <h2 style={{ ...S.display, marginTop: 0 }}>{ex.title} <span style={{ fontSize: 13, color: C.soft, fontFamily: "'Be Vietnam Pro',sans-serif" }}>({ex.level} · {exSkills(ex).join(" + ")})</span></h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        {!zen && (
          <button onClick={() => setZen(true)}
            style={{ ...S.btn(false), padding: "7px 16px", fontSize: 13 }}>🎯 Focus</button>
        )}
        {ex.timeLimit && !graded && <span style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>⏱ Temps limite : {ex.timeLimit} minutes</span>}
      </div>

      {ex.consigne && (
        <div className="mcf-card" style={{ ...S.card, marginBottom: 16, borderLeft: `4px solid var(--mcf-primary)` }}>
          <div style={S.label}>📋 Consigne</div>
          <div style={{ fontSize: 15.5, lineHeight: 1.75, marginTop: 6, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: ex.consigne }} />
        </div>
      )}

      {ex.imageUrl && (
        <div style={{ marginBottom: 16 }}>
          <img src={ex.imageUrl} alt="illustration — cliquez pour agrandir" title="Cliquez pour agrandir 🔍"
            onClick={() => setImgZoom(true)}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
            style={{ display: "block", width: "100%", maxWidth: 900, margin: "0 auto", objectFit: "contain",
              borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: "0 3px 12px rgba(17,24,39,.08)",
              cursor: "zoom-in", transition: "opacity .15s ease" }} />
          <div style={{ textAlign: "center", fontSize: 12, color: C.soft, marginTop: 6 }}>🔍 Cliquez sur l'image pour l'agrandir</div>
        </div>
      )}
      {imgZoom && (
        <div onClick={() => setImgZoom(false)}
          style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,.9)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <button onClick={() => setImgZoom(false)} title="Fermer"
            style={{ position: "fixed", top: 16, right: 16, zIndex: 401, width: 44, height: 44, borderRadius: 999,
              border: "none", background: "rgba(255,255,255,.15)", color: "#fff", fontSize: 22, fontWeight: 800,
              cursor: "pointer", display: "grid", placeItems: "center" }}>✕</button>
          <img src={ex.imageUrl} alt="illustration agrandie" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, cursor: "zoom-out" }} />
        </div>
      )}

      <SplitPane audioUrl={ex.audioUrl} readingText={ex.readingText}>
        {questionCards}
      </SplitPane>

      {!graded ? (
        <>
        <button style={{ ...S.btn(true), marginTop: 20 }}
          onClick={() => {
            const n = getUnansweredQuestionsCount(answers, ex.questions);
            if (n > 0) setConfirmCount(n); else grade(false);
          }}>
          {t("submit_button")}
        </button>
        {confirmCount != null && (
          <ConfirmSubmitModal count={confirmCount}
            onCancel={() => setConfirmCount(null)}
            onConfirm={() => { setConfirmCount(null); grade(false); }} />
        )}
        </>
      ) : (
        <div className="mcf-card mt-5 flex flex-col items-center justify-center rounded-3xl bg-surface py-8 text-center">
          {graded === "timeout" && <p className="m-0 mb-3 text-sm font-bold text-danger">{t("exercise.timeout")}</p>}
          {perfect
            ? <Award size={40} className="mx-auto mb-3 text-ok drop-shadow-[0_0_8px_rgba(34,197,94,0.45)]" />
            : <Target size={40} className="mx-auto mb-3 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
          <p className="m-0 mb-1 text-xl font-bold text-ink">
            {autos.length > 0 ? t("exercise.score_result", { score, total: tongDiem }) : t("exercise.finished")}
          </p>
          {perfect && autos.length > 0 && <p className="m-0 text-sm font-semibold text-ok">{t("exercise.perfect")}</p>}
          {opens.length > 0 && <p className="m-0 mt-1 text-sm text-soft">{t("exercise.open_note", { n: opens.length })}</p>}
          <button type="button" onClick={retry}
            className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-full border border-solid border-line bg-surface px-6 py-2.5 font-sans text-sm font-medium text-ink shadow-sm transition-all duration-200 hover:bg-surface2 hover:shadow-md active:scale-95 dark:shadow-none">
            <RotateCcw size={16} /> {t("exercise.retry")}
          </button>
        </div>
      )}
      </div>
    </div>
  );
}


/* ---- Error Boundary : crash hiện hộp lỗi rõ ràng thay vì trang trắng ---- */
class HubErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <div className="mcf-card" style={{ ...S.card, borderTop: "4px solid #DE4B4B", padding: 30 }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>Une erreur est survenue dans la Bibliothèque</div>
          <div style={{ fontSize: 13, color: "#DE4B4B", fontFamily: "monospace", background: "var(--mcf-surface2)", borderRadius: 10, padding: "10px 14px", wordBreak: "break-all" }}>
            {String(this.state.err?.message || this.state.err)}
          </div>
          <button onClick={() => this.setState({ err: null })}
            style={{ marginTop: 14, padding: "10px 22px", borderRadius: 999, border: "none", cursor: "pointer",
              background: "var(--mcf-primary)", color: "#fff", fontWeight: 700, fontFamily: "inherit" }}>
            ↻ Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PracticeHub(props) {
  return <HubErrorBoundary><PracticeHubInner {...props} /></HubErrorBoundary>;
}
