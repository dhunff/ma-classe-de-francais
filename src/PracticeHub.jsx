import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  Headphones, BookOpen, PenLine, Puzzle, BookA, Sparkles,
  RotateCcw, CheckCircle2, XCircle, Plus, ChevronLeft, PartyPopper, Trash2, Pencil, Copy, MoreVertical, Folder, FolderPlus, Image as ImageIcon, ChevronDown, Lightbulb, FileCheck,
} from "lucide-react";
import { C, S, QTYPES, VF_OPTS } from "./shared/tokens.js";
import { uid, fillOk, fillAccepted, vfOk, stripHtml, autoQ, tableauOk, tableauCells, ordreOk, getUnansweredQuestionsCount } from "./shared/questions.js";
import { load, save } from "./shared/storage.js";
import { exSkills } from "./shared/exercises.js";
import { useT } from "./shared/i18n.jsx";
import { TableauCompare, OrdreBlocks, ConfirmSubmitModal } from "./screens/student/answers.jsx";
import RichTextEditor from "./editor/RichTextEditor.jsx";
import ReadingPanel from "./editor/ReadingPanel.jsx";
import Builder from "./screens/teacher/Builder.jsx";
import PaymentModal from "./screens/student/PaymentModal.jsx";
import { PAYMENT_KEY, isPremium, hasAccess, fmtPrice, loadAccess } from "./shared/access.js";
import { Lock } from "lucide-react";

/* ============================================================
   PRACTICE HUB v3 — Tự luyện tập
   Dùng CHUNG Builder với phần Giao bài : trộn QCM / điền từ /
   chia động từ / tự luận, audio sticky, bài đọc split-screen,
   Import DOCX, giới hạn thời gian. Chấm ngay + lưu lịch sử.
   Shared key: "mcf-practice" · Lịch sử cá nhân: "mcf-ph-<name>"
============================================================ */

const CATS = [
  { skill: "Écoute", label: "Compréhension Orale", vi: "Écoute", Icon: Headphones, color: "#41608F", pastel: "#EAEFF7" },
  { skill: "Lecture", label: "Compréhension Écrite", vi: "Lecture", Icon: BookOpen, color: "#327654", pastel: "#E7F3EC" },
  { skill: "Production écrite", label: "Production Écrite", vi: "Écriture", Icon: PenLine, color: "#9B3D66", pastel: "#F8EAF0" },
  { skill: "Grammaire", label: "Grammaire", vi: "Règles et structure", Icon: Puzzle, color: "#5B4B9E", pastel: "#EFECF9" },
  { skill: "Vocabulaire", label: "Vocabulaire", vi: "Mots et expressions", Icon: BookA, color: "#8F5E22", pastel: "#F7EFE3" },
  { skill: "__autres__", label: "Autres", vi: "Traduction, communication…", Icon: Sparkles, color: "#626A85", pastel: "#EFF0F3" },
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
  useEffect(() => {
    loadAccess().then(setAccess);
    load(PAYMENT_KEY, null).then(setPayCfg);
  }, []);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState({ page: "home" });
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    (async () => {
      const rawEx = await load("mcf-practice", []);
      // Chuẩn hoá : bài hỏng (thiếu questions/level/title) không thể làm sập trang
      setExercises((Array.isArray(rawEx) ? rawEx : []).map((e) => ({
        ...e,
        questions: Array.isArray(e.questions) ? e.questions : [],
        level: e.level || "B1",
        title: e.title || "(Sans titre)",
      })));
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

  const persist = async (next) => { setExercises(next); await save("mcf-practice", next); };
  // 📋 Dupliquer : deep copy + regenerate toàn bộ ID (bài + câu hỏi)
  const duplicate = async (ex) => {
    const copy = typeof structuredClone === "function" ? structuredClone(ex) : JSON.parse(JSON.stringify(ex));
    copy.id = uid();
    copy.createdAt = Date.now();
    copy.title = (ex.title || "Exercice") + " (Copie)";
    copy.assignedTo = null; copy.deadline = "";
    copy.questions = (copy.questions || []).map((q) => ({ ...q, id: uid() }));
    const latest = await load("mcf-practice", []);
    const next = [...latest, copy];
    setExercises(next);
    await save("mcf-practice", next);
  };
  const saveHist = async (exId, score, max) => {
    const prev = hist[exId] || { best: -1, tries: 0 };
    const next = { ...hist, [exId]: { best: Math.max(prev.best, score), max, tries: prev.tries + 1, at: Date.now() } };
    setHist(next); if (name) await save(`mcf-ph-${name}`, next, false);
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
    const latest = await load("mcf-practice", []);
    const freed = latest.map((e) => (e.folderId === id ? { ...e, folderId: undefined } : e));
    setExercises(freed); await save("mcf-practice", freed);
    const next = folders.filter((f) => f.id !== id);
    setFolders(next); await save("mcf-folders", next);
    setDeleteFolder(null); showToast("✅ Dossier supprimé — les exercices ont été conservés.");
  };

  const moveTo = async (exId, folderId) => {
    const latest = await load("mcf-practice", []);
    const next = latest.map((e) => (e.id === exId ? { ...e, folderId: folderId || undefined } : e));
    setExercises(next); await save("mcf-practice", next);
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
          // → Chuyển sang danh sách Devoir (À faire)
          const exs = await load("mcf-exercises", []);
          const ne = [...exs.filter((e) => e.id !== draft.id), { ...draft, folderId: undefined }].sort((a, b) => a.createdAt - b.createdAt);
          const okE = await save("mcf-exercises", ne);
          if (!okE) { alert("❌ Échec de l'enregistrement."); return; }
          const next = exercises.filter((e) => e.id !== draft.id);
          setExercises(next); await save("mcf-practice", next);
          setView({ page: "home" }); return;
        }
        const others = exercises.filter((e) => e.id !== draft.id);
        const next = [...others, draft].sort((a, b) => a.createdAt - b.createdAt);
        const ok = await save("mcf-practice", next);
        if (!ok) { alert("❌ Échec de l'enregistrement — données trop volumineuses (image base64). Utilisez plutôt une URL publique."); return; }
        setExercises(next);
        setView(draft.customCat ? { page: "category", cat: "__autres__", folder: draft.customCat } : { page: "category", cat: catOf(draft) });
      }}
      cancel={() => setView({ page: "home" })} />;
  }

  if (view.page === "quiz") {
    const ex = exercises.find((e) => e.id === view.exId);
    return <PracticeWorkspace ex={ex} back={() => setView({ page: "category", cat: view.cat, folder: view.folder, niveau: view.niveau })}
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
        <button style={{ ...S.btn(false), marginBottom: 16 }} onClick={() => setView({ page: "home" })}><ChevronLeft size={16} /> Retour</button>
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
                      <SplitTrain open={trainMenu === ex.id} setOpen={(v) => setTrainMenu(v ? ex.id : null)}
                        onStart={() => { if (isGuest) return requireLogin(); setView({ page: "quiz", cat: "__autres__", exId: ex.id }); }}
                        onPick={(kind) => setMatModal({ exId: ex.id, kind })} />
                      {teacher && <HubMenu
                        onEdit={() => { const c = JSON.parse(JSON.stringify(ex)); if (!c.skills || !c.skills.length) c.skills = c.skill ? [c.skill] : []; if (c.consigne === undefined) c.consigne = ""; if (!c.usageType) c.usageType = "practice"; setDraft(c); setView({ page: "builder" }); }}
                        onDup={() => duplicate(ex)}
                        onMove={null}
                        onDel={() => persist(exercises.filter((e) => e.id !== ex.id))} />}
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
    const NIVEAUX = ["A1", "A2", "B1", "B2", "B2+"];
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
        {payFor && <PaymentModal ex={payFor} student={name} config={payCfg} onClose={() => setPayFor(null)} />}
        <button style={{ ...S.btn(false), marginBottom: 16 }}
          onClick={() => setView(view.folder ? { page: "autres" } : { page: "home" })}><ChevronLeft size={16} /> Retour</button>

        {/* Tabs kỹ năng: đổi kỹ năng ngay tại chỗ, không phải quay về trang
            chủ rồi chọn lại. Cuộn ngang trên màn hình hẹp thay vì xuống dòng,
            để dải tab luôn cao một hàng.
            Trạng thái đang chọn dùng cả nền, chữ đậm và aria-selected — không
            chỉ dựa vào màu. */}
        <div role="tablist" aria-label="Compétences"
          className="mcf-scroll -mx-1 mb-4 flex gap-1 overflow-x-auto px-1 pb-1">
          {CATS.map((c) => {
            const on = view.cat === c.skill && !view.folder;
            return (
              <button key={c.skill} role="tab" aria-selected={on}
                onClick={() => setView(c.skill === "__autres__"
                  ? { page: "autres" }
                  : { page: "category", cat: c.skill, niveau: view.niveau })}
                className={[
                  "flex shrink-0 items-center gap-2 rounded-full border-0 px-3.5 py-2 text-sm transition-colors",
                  on
                    ? "bg-primary-soft font-bold text-primary"
                    : "bg-surface2 font-medium text-soft hover:text-ink",
                ].join(" ")}>
                <c.Icon size={16} />
                {c.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ ...S.display, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <meta.Icon size={24} color={meta.color} /> {view.folder ? view.folder : meta.label}
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
              <h3 style={{ ...S.display, fontSize: 19, marginTop: 0 }}>📂 Nouveau dossier — {meta.label}</h3>
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
                  🏠 Racine ({meta.label})
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
          <div className="mcf-card" style={{ ...S.card, padding: 50, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📦</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>Aucun exercice disponible pour ce niveau pour le moment.</div>
            <div style={{ fontSize: 13.5, color: C.soft, marginTop: 6 }}>Essaie un autre niveau ou reviens bientôt !</div>
          </div>
        ) : (
          /* Lưới thẻ: ảnh 16:9 trên cùng, nội dung giữa, hành động dưới đáy.
             Mọi thẻ cao bằng nhau nhờ flex + mt-auto ở khối hành động, nên
             hàng không bị so le khi tiêu đề dài ngắn khác nhau. */
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((ex) => {
              const h = hist[ex.id];
              const types = [...new Set(ex.questions.map((q) => QTYPES[q.type]))].join(" + ");
              /* Giáo viên luôn xem được bài của chính mình; chỉ học sinh mới bị khoá. */
              const locked = !teacher && isPremium(ex) && !hasAccess(access, name, ex.id);
              return (
                <div key={ex.id}
                  className="flex flex-col overflow-hidden rounded-md border border-solid border-line bg-surface shadow-sm">
                  {/* Ảnh minh hoạ do giáo viên đặt. Không có thì dùng khối
                      trung tính — không dựng ảnh giả cho bài chưa có ảnh. */}
                  {ex.imageUrl ? (
                    <img src={ex.imageUrl} alt="" loading="lazy"
                      className="aspect-video w-full border-0 border-b border-solid border-line object-cover" />
                  ) : (
                    <div aria-hidden
                      className="grid aspect-video w-full place-items-center border-0 border-b border-solid border-line bg-surface2 text-3xl text-soft">
                      {ex.audioUrl ? "🎧" : ex.readingText ? "📖" : "✎"}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span style={S.badge(ex.level)}>{ex.level}</span>
                      {/* Trạng thái thu phí. Bài đã mở khoá không hiện gì thêm —
                          nhắc lại "đã mua" trên mọi thẻ chỉ làm nhiễu. */}
                      {!isPremium(ex) ? (
                        <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-[11px] font-bold text-ok">
                          {t("pay.free")}
                        </span>
                      ) : !locked ? null : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] font-bold text-warn">
                          <Lock size={11} /> {fmtPrice(ex.price)}
                        </span>
                      )}
                      {ex.folderId && folderName(ex.folderId) && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-solid border-line bg-surface2 px-2.5 py-0.5 text-[11px] font-bold text-soft">
                          <Folder size={11} /> {folderName(ex.folderId)}
                        </span>
                      )}
                    </div>

                    <strong className="mb-1 block text-[15px] leading-snug text-ink">{ex.title}</strong>

                    <div className="text-xs leading-relaxed text-soft">
                      {ex.questions.length} question{ex.questions.length > 1 ? "s" : ""}
                      {types && ` · ${types}`}
                      {ex.audioUrl && " · 🎧"}{ex.readingText && " · 📖"}{ex.timeLimit && ` · ⏱ ${ex.timeLimit} min`}
                    </div>
                    {h && (
                      <div className="mt-1 text-xs font-bold"
                        style={{ color: h.max && h.best / h.max >= 0.8 ? C.ok : C.primary }}>
                        🏆 Meilleur : {h.best}/{h.max} ({h.tries} essai{h.tries > 1 ? "s" : ""})
                      </div>
                    )}

                    {/* Hành động ở góc dưới. Menu ⋮ render qua Portal — quy tắc
                        kiến trúc sẵn có, để dropdown không bị kẹt z-index. */}
                    <div className="mt-auto flex items-center justify-end gap-2 pt-4">
                      {locked ? (
                        <button type="button" onClick={() => setPayFor(ex)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-solid border-transparent bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
                          <Lock size={15} /> {t("pay.buy")}
                        </button>
                      ) : (
                        <SplitTrain open={trainMenu === ex.id} setOpen={(v) => setTrainMenu(v ? ex.id : null)}
                          onStart={() => { if (isGuest) return requireLogin(); setView({ page: "quiz", cat: view.cat, folder: view.folder, niveau, exId: ex.id }); }}
                          onPick={(kind) => setMatModal({ exId: ex.id, kind })} />
                      )}
                      {teacher && <HubMenu
                        onEdit={() => { const c = JSON.parse(JSON.stringify(ex)); if (!c.skills || !c.skills.length) c.skills = c.skill ? [c.skill] : []; if (c.consigne === undefined) c.consigne = ""; if (!c.usageType) c.usageType = "practice"; setDraft(c); setView({ page: "builder" }); }}
                        onDup={() => duplicate(ex)}
                        onMove={view.cat !== "__autres__" ? () => setMoveEx(ex) : null}
                        onDel={() => persist(exercises.filter((e) => e.id !== ex.id))} />}
                    </div>
                  </div>
                </div>
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
        <h2 style={{ ...S.display, margin: 0 }}>🏋️ Bibliothèque d'entraînement</h2>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
        {CATS.map((cat, i) => {
          const list = exercises.filter((e) => inCat(e, cat.skill));
          if (cat.skill === "__autres__" && list.length === 0 && cats.length === 0 && !teacher) return null;
          const doneCount = list.filter((e) => hist[e.id]).length;
          const pct = list.length ? Math.round((doneCount / list.length) * 100) : 0;
          return (
            <div key={cat.skill} className="mcf-card"
              onClick={() => setView(cat.skill === "__autres__" ? { page: "autres" } : { page: "category", cat: cat.skill })}
              style={{ ...S.card, padding: 22, cursor: "pointer", animationDelay: `${i * 40}ms` }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: cat.pastel, display: "grid", placeItems: "center", marginBottom: 14 }}>
                <cat.Icon size={26} color={cat.color} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{cat.label}</div>
              <div style={{ fontSize: 13, color: C.soft, margin: "3px 0 14px" }}>{cat.vi} · {list.length} exercice{list.length > 1 ? "s" : ""}</div>
              {!teacher && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: C.soft, marginBottom: 5 }}>
                    <span>Complétés</span><span style={{ color: cat.color }}>{doneCount}/{list.length || 0}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: C.line }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg,${cat.color},${cat.color}AA)`, transition: "width .4s" }} />
                  </div>
                </>
              )}
            </div>
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
function SplitTrain({ onStart, onPick, open, setOpen }) {
  const ref = useRef(null);
  const ITEMS = [
    ["vocab", <BookOpen size={16} key="i" />, "Vocabulaire"],
    ["expl", <Lightbulb size={16} key="i" />, "Explications"],
    ["corrige", <FileCheck size={16} key="i" />, "Sujet et Corrigé"],
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
  const isGood = (q) => q.type === "qcm" ? answersRef.current[q.id] === q.answer
    : q.type === "vf" ? vfOk(q, answersRef.current[q.id])
    : q.type === "tableau" ? tableauOk(q, answersRef.current[q.id])
    : q.type === "ordre" ? ordreOk(q, answersRef.current[q.id])
    : fillOk(q, answersRef.current[q.id]);

  const grade = (timedOut = false) => {
    gradedRef.current = true;
    setGraded(timedOut ? "timeout" : true);
    const score = autos.reduce((n, q) => n + (isGood(q) ? 1 : 0), 0);
    onFinish(score, autos.length || 0);
  };
  const retry = () => { gradedRef.current = false; setGraded(false); setAnswers({}); };

  const score = graded ? autos.reduce((n, q) => n + (isGood(q) ? 1 : 0), 0) : 0;
  const perfect = graded && autos.length > 0 && score === autos.length;
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
                if (j === q.answer) { bg = C.okSoft; border = C.ok; icon = <CheckCircle2 size={17} color={C.ok} />; }
                else if (j === a) { bg = C.dangerSoft; border = C.danger; icon = <XCircle size={17} color={C.danger} />; }
              } else if (j === a) { bg = C.primarySoft; border = C.primary; }
              return (
                <button key={j} disabled={!!graded} onClick={() => setAnswers({ ...answers, [q.id]: j })}
                  style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "10px 14px", borderRadius: 10, fontSize: 15,
                    fontFamily: "inherit", cursor: graded ? "default" : "pointer", background: bg, border: `1.5px solid ${border}`, color: C.ink,
                    textDecoration: graded && j === a && j !== q.answer ? "line-through" : "none" }}>
                  <strong>{String.fromCharCode(65 + j)}.</strong> {o}<span style={{ marginLeft: "auto" }}>{icon}</span>
                </button>
              );
            })}
          </div>
        ) : q.type === "ordre" ? (
          <OrdreBlocks q={q} value={a || []} readOnly={!!graded} correction={!!graded}
            onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
        ) : q.type === "tableau" ? (
          <TableauCompare q={q} value={a || {}} readOnly={!!graded} correction={!!graded}
            onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
        ) : q.type === "vf" ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {VF_OPTS.map((o, j) => {
                const sel = a?.choice === j;
                let bg = sel ? C.primarySoft : "var(--mcf-surface)", border = sel ? C.primary : C.line, col = sel ? C.primary : C.ink;
                if (graded) {
                  if (j === q.answer) { bg = C.okSoft; border = C.ok; col = C.ok; }
                  else if (sel) { bg = C.dangerSoft; border = C.danger; col = C.danger; }
                }
                return (
                  <button key={j} disabled={!!graded}
                    onClick={() => setAnswers({ ...answers, [q.id]: { choice: j, just: j === 2 ? "" : (a?.just || "") } })}
                    style={{ padding: "10px 22px", borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                      cursor: graded ? "default" : "pointer", fontFamily: "inherit",
                      border: `1.5px solid ${border}`, background: bg, color: col }}>
                    {o}{graded && j === q.answer && " ✓"}
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
              : <span style={{ fontSize: 13.5, color: C.ok, fontWeight: 700 }}>✗ → {String(fillAccepted(q)).split("|")[0]}</span>)}
            {graded && (q.type === "fill" || q.type === "conj") && (
              <div style={{ marginTop: 8, background: C.okSoft, border: `1.5px solid ${C.ok}55`, borderRadius: 10, padding: "7px 12px", fontSize: 13, display: "inline-block" }}>
                💡 <strong style={{ color: C.ok }}>Réponse attendue :</strong> {String(fillAccepted(q)).split("|").join(" / ")}
              </div>
            )}
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

      <button style={{ ...S.btn(false), marginBottom: 16 }} onClick={back}><ChevronLeft size={16} /> Retour</button>
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

      {ex.audioUrl && (
        <div className="mcf-card" style={{ ...S.card, marginBottom: 16, position: "sticky", top: 8, zIndex: 30, boxShadow: "0 6px 18px rgba(27,37,89,.12)" }}>
          <div style={{ ...S.label, marginBottom: 8 }}>🎧 Écoute le document audio</div>
          <audio controls controlsList="nodownload noplaybackrate" onContextMenu={(e) => e.preventDefault()}
            style={{ width: "100%" }} src={ex.audioUrl} />
        </div>
      )}

      {ex.readingText ? (
        <div className="mcf-wide" style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <ReadingPanel text={ex.readingText} stickyTop={ex.audioUrl ? 110 : 8} />
          <div className="mcf-scroll" style={{ flex: "5 1 340px", minWidth: 0, display: "grid", gap: 16,
            maxHeight: "76vh", overflowY: "auto", position: "sticky", top: ex.audioUrl ? 110 : 8, paddingRight: 4 }}>
            {questionCards}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, maxWidth: 780, margin: "0 auto" }}>{questionCards}</div>
      )}

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
        <div className="mcf-card" style={{ marginTop: 20, textAlign: "center", background: perfect ? C.okSoft : C.primarySoft, borderRadius: 14, padding: "18px 16px" }}>
          {graded === "timeout" && <div style={{ color: C.danger, fontWeight: 800, marginBottom: 6 }}>⏰ Temps écoulé — correction automatique effectuée</div>}
          <div style={{ fontSize: 30 }}>{perfect ? <PartyPopper size={34} color={C.ok} /> : "💪"}</div>
          <div style={{ fontWeight: 800, fontSize: 19, marginTop: 6, color: perfect ? C.ok : C.primary }}>
            {autos.length > 0 ? <>Tu as obtenu {score}/{autos.length}{perfect ? " — Excellent ! 🎉" : ""}</> : "Terminé !"}
          </div>
          {opens.length > 0 && <div style={{ fontSize: 13.5, color: C.soft, marginTop: 4 }}>({opens.length} réponse(s) libre(s) — à comparer avec le modèle ci-dessus)</div>}
          <button style={{ ...S.btn(false), marginTop: 14 }} onClick={retry}><RotateCcw size={15} /> Recommencer</button>
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
