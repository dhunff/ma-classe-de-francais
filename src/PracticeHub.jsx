import React, { useState, useEffect, useRef } from "react";
import {
  Headphones, BookOpen, PenLine, Puzzle, BookA, Sparkles,
  RotateCcw, CheckCircle2, XCircle, Plus, ChevronLeft, PartyPopper, Trash2, Pencil, Copy, MoreVertical, Folder, FolderPlus,
} from "lucide-react";
import {
  C, S, QTYPES, uid, fillOk, stripHtml, autoQ,
  RichTextEditor, Builder, ReadingPanel, load, save,
} from "./App.jsx";

/* ============================================================
   PRACTICE HUB v3 — Tự luyện tập
   Dùng CHUNG Builder với phần Giao bài : trộn QCM / điền từ /
   chia động từ / tự luận, audio sticky, bài đọc split-screen,
   Import DOCX, giới hạn thời gian. Chấm ngay + lưu lịch sử.
   Shared key: "mcf-practice" · Lịch sử cá nhân: "mcf-ph-<name>"
============================================================ */

const CATS = [
  { skill: "Écoute", label: "Compréhension Orale", vi: "Luyện nghe", Icon: Headphones, color: "#3D5AF1", pastel: "#EDF1FE" },
  { skill: "Lecture", label: "Compréhension Écrite", vi: "Đọc hiểu", Icon: BookOpen, color: "#1E9E6A", pastel: "#E7F7F0" },
  { skill: "Production écrite", label: "Production Écrite", vi: "Luyện viết", Icon: PenLine, color: "#D6336C", pastel: "#FDEEF4" },
  { skill: "Grammaire", label: "Grammaire", vi: "Ngữ pháp", Icon: Puzzle, color: "#7048E8", pastel: "#F1EDFD" },
  { skill: "Vocabulaire", label: "Vocabulaire", vi: "Từ vựng", Icon: BookA, color: "#C98412", pastel: "#FFF6E8" },
  { skill: "__autres__", label: "Autres", vi: "Khác (dịch, giao tiếp…)", Icon: Sparkles, color: "#6E7691", pastel: "#F0F1F6" },
];
const catOf = (ex) => CATS.some((c) => c.skill === ex.skill) ? ex.skill : "__autres__";

export default function PracticeHub({ role = "eleve", name = "" }) {
  const teacher = role === "prof";
  const [exercises, setExercises] = useState([]);
  const [cats, setCats] = useState([]);          // danh mục con của "Autres"
  const [catPopup, setCatPopup] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [hist, setHist] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState({ page: "home" });
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    (async () => {
      setExercises(await load("mcf-practice", []));
      setCats(await load("mcf-custom-cats", []));
      if (name) setHist(await load(`mcf-ph-${name}`, {}, false));
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const addCat = async () => {
    const n = newCat.trim();
    if (!n || cats.includes(n)) return;
    const next = [...cats, n];
    setCats(next); await save("mcf-custom-cats", next);
    setNewCat(""); setCatPopup(false);
  };

  const blank = () => ({ id: uid(), title: "", level: "B1", skill: "Grammaire", deadline: "", audioUrl: "", readingText: "", imageUrl: "", timeLimit: "", assignedTo: null, createdAt: Date.now(), questions: [] });

  if (!loaded) return <p style={{ color: C.soft, textAlign: "center" }}>Chargement…</p>;

  if (view.page === "builder") {
    return <Builder draft={draft} setDraft={setDraft} accounts={[]}
      publish={async () => {
        const others = exercises.filter((e) => e.id !== draft.id);
        const next = [...others, draft].sort((a, b) => a.createdAt - b.createdAt);
        const ok = await save("mcf-practice", next);
        if (!ok) { alert("❌ Lưu thất bại — dữ liệu quá lớn (thường do ảnh base64). Hãy dùng Public URL của ảnh."); return; }
        setExercises(next);
        setView(draft.customCat ? { page: "category", cat: "__autres__", folder: draft.customCat } : { page: "category", cat: catOf(draft) });
      }}
      cancel={() => setView({ page: "home" })} />;
  }

  if (view.page === "quiz") {
    const ex = exercises.find((e) => e.id === view.exId);
    return <PracticeWorkspace ex={ex} back={() => setView({ page: "category", cat: view.cat, folder: view.folder })}
      onFinish={(score, max) => saveHist(ex.id, score, max)} />;
  }

  /* -------- Sub-view "Autres" : thư mục danh mục con -------- */
  if (view.page === "autres") {
    const autresEx = exercises.filter((e) => catOf(e) === "__autres__");
    const unclassified = autresEx.filter((e) => !e.customCat);
    const folders = [
      ...cats.map((c) => ({ name: c, count: autresEx.filter((e) => e.customCat === c).length })),
      ...(unclassified.length ? [{ name: "__nc__", label: "Non classé", count: unclassified.length }] : []),
    ];
    return (
      <div>
        <button style={{ ...S.btn(false), marginBottom: 16 }} onClick={() => setView({ page: "home" })}><ChevronLeft size={16} /> Quay lại</button>
        <h2 style={{ ...S.display, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={24} color="#6E7691" /> Autres — Catégories
        </h2>

        {folders.length === 0 && !teacher ? (
          <div className="mcf-card" style={{ ...S.card, padding: 50, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🗂️</div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>Chưa có bài tập nào trong mục này</div>
            <div style={{ fontSize: 13.5, color: C.soft, marginTop: 6 }}>Le professeur n'a pas encore créé de catégorie. Reviens bientôt !</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 16 }}>
            {folders.map((f) => (
              <div key={f.name} className="mcf-card"
                onClick={() => setView({ page: "category", cat: "__autres__", folder: f.name })}
                style={{ ...S.card, padding: 22, cursor: "pointer" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#F0F1F6", display: "grid", placeItems: "center", marginBottom: 12 }}>
                  <Folder size={24} color="#6E7691" />
                </div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{f.label || f.name}</div>
                <div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>{f.count} bài tập</div>
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

  if (view.page === "category") {
    const meta = CATS.find((c) => c.skill === view.cat);
    let list = exercises.filter((e) => catOf(e) === view.cat);
    if (view.cat === "__autres__" && view.folder) {
      list = view.folder === "__nc__" ? list.filter((e) => !e.customCat) : list.filter((e) => e.customCat === view.folder);
    }
    return (
      <div>
        <button style={{ ...S.btn(false), marginBottom: 16 }}
          onClick={() => setView(view.folder ? { page: "autres" } : { page: "home" })}><ChevronLeft size={16} /> Quay lại</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ ...S.display, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <meta.Icon size={24} color={meta.color} /> {view.folder ? (view.folder === "__nc__" ? "Non classé" : view.folder) : meta.label}
          </h2>
          {teacher && <button style={S.btn(true)} onClick={() => {
            const d = { ...blank(), skill: view.cat === "__autres__" ? "Traduction" : view.cat };
            if (view.folder && view.folder !== "__nc__") d.customCat = view.folder;
            setDraft(d); setView({ page: "builder" });
          }}><Plus size={16} /> Thêm bài</button>}
        </div>
        {list.length === 0 ? (
          <div className="mcf-card" style={{ ...S.card, padding: 40, textAlign: "center", color: C.soft }}>Chưa có bài tập nào trong mục này.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {list.map((ex) => {
              const h = hist[ex.id];
              return (
                <div key={ex.id} className="mcf-card" style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <span style={S.badge(ex.level)}>{ex.level}</span>
                    <strong>{ex.title}</strong>
                    <div style={{ fontSize: 12.5, color: C.soft, marginTop: 4 }}>
                      {ex.questions.length} câu · {[...new Set(ex.questions.map((q) => QTYPES[q.type]))].join(" + ")}
                      {ex.audioUrl && " · 🎧"}{ex.readingText && " · 📖"}{ex.timeLimit && ` · ⏱ ${ex.timeLimit} min`}
                      {h && <span style={{ color: h.max && h.best / h.max >= 0.8 ? C.ok : C.primary, fontWeight: 700 }}> · 🏆 Meilleur : {h.best}/{h.max} ({h.tries} lần)</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button style={S.btn(true)} onClick={() => setView({ page: "quiz", cat: view.cat, folder: view.folder, exId: ex.id })}>Luyện tập</button>
                    {teacher && <HubMenu
                      onEdit={() => { setDraft(JSON.parse(JSON.stringify(ex))); setView({ page: "builder" }); }}
                      onDup={() => duplicate(ex)}
                      onDel={() => persist(exercises.filter((e) => e.id !== ex.id))} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* -------- Home dashboard -------- */
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ ...S.display, margin: 0 }}>🏋️ Kho bài tập tự luyện</h2>
        {teacher && <button style={S.btn(true)} onClick={() => { setDraft(blank()); setView({ page: "builder" }); }}><Plus size={16} /> Thêm bài tập mới</button>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
        {CATS.map((cat, i) => {
          const list = exercises.filter((e) => catOf(e) === cat.skill);
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
              <div style={{ fontSize: 13, color: C.soft, margin: "3px 0 14px" }}>{cat.vi} · {list.length} bài</div>
              {!teacher && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: C.soft, marginBottom: 5 }}>
                    <span>Đã luyện</span><span style={{ color: cat.color }}>{doneCount}/{list.length || 0}</span>
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
    </div>
  );
}

/* ---- Dropdown ⋮ cho thẻ bài tự luyện ---- */
function HubMenu({ onEdit, onDup, onDel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const item = (label, icon, onClick, danger) => (
    <button onClick={() => { setOpen(false); onClick(); }}
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", border: "none",
        background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
        borderRadius: 14, textAlign: "left", color: danger ? C.danger : C.ink }}
      onMouseEnter={(e) => e.currentTarget.style.background = danger ? C.dangerSoft : "#F4F6FB"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
      {icon} {label}
    </button>
  );
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} title="Plus d'options"
        style={{ width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${C.line}`, background: "#fff",
          cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "0 2px 8px rgba(17,24,39,.06)" }}>
        <MoreVertical size={18} color={C.ink} />
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: 46, minWidth: 180, background: "#fff", borderRadius: 20,
          boxShadow: "0 14px 36px rgba(17,24,39,.16)", border: `1px solid ${C.line}`, padding: 6, zIndex: 60 }}>
          {item("Modifier", <Pencil size={16} />, onEdit)}
          {item("Dupliquer", <Copy size={16} />, onDup)}
          {item("Supprimer", <Trash2 size={16} />, onDel, true)}
        </div>
      )}
    </div>
  );
}

/* ============ Workspace tự luyện — chấm ngay ============ */
function PracticeWorkspace({ ex, back, onFinish }) {
  const [answers, setAnswers] = useState({});
  const [graded, setGraded] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [zen, setZen] = useState(false); // 🧘 chế độ tập trung
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
  const isGood = (q) => q.type === "qcm" ? answersRef.current[q.id] === q.answer : fillOk(q, answersRef.current[q.id]);

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
    q.type === "qcm" ? answers[q.id] != null : q.type === "open" ? stripHtml(answers[q.id]) !== "" : (answers[q.id] || "").trim() !== "");
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
              let bg = "#fff", border = C.line, icon = null;
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
        ) : q.type === "open" ? (
          <>
            <RichTextEditor value={a || ""} readOnly={!!graded} onChange={(html) => setAnswers({ ...answers, [q.id]: html })} />
            {graded && q.model && (
              <div style={{ marginTop: 12 }}>
                <div style={{ ...S.label }}>📄 Bài mẫu tham khảo — tự đối chiếu</div>
                <div style={{ marginTop: 6, background: "#FBFCFE", border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 15px", fontSize: 14.5, fontStyle: "italic", lineHeight: 1.7 }}>{q.model}</div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input disabled={!!graded} value={a || ""} placeholder="Ta réponse…"
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              style={{ ...S.input, maxWidth: 320,
                border: `1.5px solid ${graded ? (good ? C.ok : C.danger) : C.line}`,
                background: graded ? (good ? C.okSoft : C.dangerSoft) : "#FBFCFE",
                textDecoration: graded && !good ? "line-through" : "none" }} />
            {graded && (good
              ? <CheckCircle2 size={18} color={C.ok} />
              : <span style={{ fontSize: 13.5, color: C.ok, fontWeight: 700 }}>✗ → {(q.accepted || "").split("|")[0]}</span>)}
          </div>
        )}
      </div>
    );
  });

  return (
    <div style={zen ? { position: "fixed", inset: 0, zIndex: 90, background: "var(--mcf-bg)", overflowY: "auto", padding: "28px 16px 80px" } : undefined}>
      {zen && (
        <button onClick={() => setZen(false)} title="Quitter le mode Zen"
          style={{ position: "fixed", top: 16, right: 16, zIndex: 120, display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
            background: C.ink, color: "var(--mcf-bg)", fontWeight: 700, fontSize: 13.5,
            boxShadow: "0 8px 22px rgba(17,24,39,.3)" }}>
          ⤡ Quitter le Zen
        </button>
      )}
      <div style={zen ? { maxWidth: 920, margin: "0 auto" } : undefined}>
      {remaining != null && !graded && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100, display: "flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 999, background: remaining <= 60 ? C.danger : C.ink, color: "#fff",
          fontWeight: 800, fontSize: 17, boxShadow: "0 8px 22px rgba(27,37,89,.35)", fontVariantNumeric: "tabular-nums" }}>
          ⏱ {fmtLeft(remaining)}
        </div>
      )}

      <button style={{ ...S.btn(false), marginBottom: 16 }} onClick={back}><ChevronLeft size={16} /> Quay lại</button>
      <h2 style={{ ...S.display, marginTop: 0 }}>{ex.title} <span style={{ fontSize: 13, color: C.soft, fontFamily: "'Be Vietnam Pro',sans-serif" }}>({ex.level} · {ex.skill})</span></h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        {!zen && (
          <button onClick={() => setZen(true)}
            style={{ ...S.btn(false), padding: "7px 16px", fontSize: 13 }}>🧘 Mode Zen</button>
        )}
        {ex.timeLimit && !graded && <span style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>⏱ Temps limite : {ex.timeLimit} minutes</span>}
      </div>

      {ex.imageUrl && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <img src={ex.imageUrl} alt="illustration"
            style={{ maxHeight: 400, maxWidth: "100%", width: "auto", objectFit: "contain",
              borderRadius: 24, boxShadow: "0 6px 20px rgba(17,24,39,.10)" }} />
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
        <button style={{ ...S.btn(true), marginTop: 20, opacity: allAnswered ? 1 : 0.4 }} disabled={!allAnswered} onClick={() => grade(false)}>
          Nộp bài & xem kết quả
        </button>
      ) : (
        <div className="mcf-card" style={{ marginTop: 20, textAlign: "center", background: perfect ? C.okSoft : C.primarySoft, borderRadius: 14, padding: "18px 16px" }}>
          {graded === "timeout" && <div style={{ color: C.danger, fontWeight: 800, marginBottom: 6 }}>⏰ Hết giờ — bài đã được chấm tự động</div>}
          <div style={{ fontSize: 30 }}>{perfect ? <PartyPopper size={34} color={C.ok} /> : "💪"}</div>
          <div style={{ fontWeight: 800, fontSize: 19, marginTop: 6, color: perfect ? C.ok : C.primary }}>
            {autos.length > 0 ? <>Bạn đạt {score}/{autos.length} điểm{perfect ? " — Xuất sắc ! 🎉" : ""}</> : "Đã hoàn thành !"}
          </div>
          {opens.length > 0 && <div style={{ fontSize: 13.5, color: C.soft, marginTop: 4 }}>({opens.length} câu tự luận — tự đối chiếu với bài mẫu phía trên)</div>}
          <button style={{ ...S.btn(false), marginTop: 14 }} onClick={retry}><RotateCcw size={15} /> Làm lại</button>
        </div>
      )}
      </div>
    </div>
  );
}
