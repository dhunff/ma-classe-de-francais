import React, { useState, useRef, useEffect } from "react";
import {
  Headphones, BookOpen, PenLine, Puzzle, BookA,
  Play, Pause, RotateCcw, CheckCircle2, XCircle, Plus,
  ChevronLeft, PartyPopper, Clock, Trash2,
} from "lucide-react";

/* ============================================================
   PRACTICE HUB — Kho bài tập tự luyện
   Component độc lập, chỉ cần: npm install lucide-react
   Style inline (không cần Tailwind) — tông navy / trắng / pastel
============================================================ */

/* ---------------- Mock data ---------------- */
const CATEGORIES = [
  { id: "CO", label: "Compréhension Orale", vi: "Luyện nghe", Icon: Headphones, color: "#3D5AF1", pastel: "#EDF1FE", progress: 65 },
  { id: "CE", label: "Compréhension Écrite", vi: "Đọc hiểu", Icon: BookOpen, color: "#1E9E6A", pastel: "#E7F7F0", progress: 40 },
  { id: "PE", label: "Production Écrite", vi: "Luyện viết", Icon: PenLine, color: "#D6336C", pastel: "#FDEEF4", progress: 20 },
  { id: "GR", label: "Grammaire", vi: "Ngữ pháp", Icon: Puzzle, color: "#7048E8", pastel: "#F1EDFD", progress: 80 },
  { id: "VO", label: "Vocabulaire", vi: "Từ vựng", Icon: BookA, color: "#C98412", pastel: "#FFF6E8", progress: 55 },
];

const MOCK_EXERCISES = [
  {
    id: "ex1", category: "GR", level: "B1", type: "qcm",
    title: "Le passé composé — auxiliaire être ou avoir ?",
    question: "Hier soir, nous ______ au cinéma avec des amis.",
    options: ["avons allé", "sommes allés", "sommes allé", "avons allés"],
    answer: 1,
    explanation: "« Aller » se conjugue avec être ; le participe s'accorde avec « nous » → sommes allés.",
  },
  {
    id: "ex2", category: "VO", level: "A2", type: "fill",
    title: "Les transports — complétez le texte",
    // Các đoạn text xen kẽ ô trống; blanks[i] là đáp án của ô thứ i (nhiều đáp án cách nhau bằng |)
    segments: ["Chaque matin, je prends le ", " pour aller au travail. Aux heures de pointe, il y a beaucoup de ", " sur la route, donc le métro est plus ", " que la voiture."],
    blanks: ["métro|bus", "monde|circulation|embouteillages", "rapide|pratique"],
  },
  {
    id: "ex3", category: "CO", level: "B1", type: "listening",
    title: "Journal en français facile — le smartphone",
    audioUrl: "https://aod-rfi.akamaized.net/rfi/francais/audio/jff/r001/journal_francais_facile.mp3",
    question: "D'après le journal, qu'est-ce qui fait baisser le nombre de naissances ?",
    options: ["Les ondes des téléphones", "Une baisse des relations sociales", "Le prix des logements", "Le climat"],
    answer: 1,
  },
  {
    id: "ex4", category: "PE", level: "B1", type: "writing",
    title: "Écrivez un e-mail — annuler un rendez-vous",
    question: "Écrivez un court e-mail (40-60 mots) à un ami pour annuler votre rendez-vous de demain. Excusez-vous, expliquez la raison et proposez une autre date.",
    sample: "Salut Marie ! Je suis vraiment désolé, mais je dois annuler notre rendez-vous de demain : je suis malade et je dois rester chez moi. Est-ce qu'on peut se voir vendredi à la place ? Encore pardon, et à très vite ! Hung",
  },
];

/* ---------------- Design tokens ---------------- */
const T = {
  navy: "#1B2559", soft: "#6E7691", line: "#E4E8F4", bg: "#F4F6FB",
  primary: "#3D5AF1", ok: "#1E9E6A", okBg: "#E7F7F0", bad: "#DE4B4B", badBg: "#FDEEEE",
  card: { background: "#fff", border: "1px solid #E4E8F4", borderRadius: 16, boxShadow: "0 2px 10px rgba(27,37,89,.05)" },
  btn: (primary) => ({
    display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10,
    fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
    border: primary ? "none" : "1.5px solid #E4E8F4",
    background: primary ? "linear-gradient(135deg,#3D5AF1,#5B7CFA)" : "#fff",
    color: primary ? "#fff" : "#1B2559",
    boxShadow: primary ? "0 4px 12px rgba(61,90,241,.28)" : "0 1px 3px rgba(27,37,89,.06)",
  }),
  input: { width: "100%", padding: "10px 13px", border: "1.5px solid #E4E8F4", borderRadius: 10, fontSize: 15, color: "#1B2559", background: "#FBFCFE", fontFamily: "inherit", boxSizing: "border-box" },
  label: { fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", color: "#6E7691", fontWeight: 700 },
};

/* ============================================================ */
export default function PracticeHub({ role = "eleve" }) {
  const teacherMode = role === "prof";
  const [exercises, setExercises] = useState(MOCK_EXERCISES);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState({ page: "home" });
  const [showForm, setShowForm] = useState(false);

  // Nạp bài tập tự luyện từ kho chung (shared storage)
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("mcf-practice", true);
        if (r) setExercises(JSON.parse(r.value));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const persist = async (next) => {
    setExercises(next);
    try { await window.storage.set("mcf-practice", JSON.stringify(next), true); } catch {}
  };

  if (!loaded) return <p style={{ color: T.soft, textAlign: "center" }}>Chargement…</p>;

  return (
    <div style={{ color: T.navy }}>
      <style>{`
        @keyframes pop{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}
        .ph-pop{animation:pop .3s ease both}
        @keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .ph-card{animation:rise .25s ease both}
      `}</style>

      {view.page === "home" && (
        <Dashboard exercises={exercises} teacherMode={teacherMode}
          openCategory={(id) => setView({ page: "category", cat: id })}
          onAdd={() => setShowForm(true)} />
      )}
      {view.page === "category" && (
        <CategoryList cat={view.cat} exercises={exercises} teacherMode={teacherMode}
          back={() => setView({ page: "home" })}
          open={(ex) => setView({ page: "quiz", cat: view.cat, exId: ex.id })}
          onAdd={() => setShowForm(true)}
          onDelete={(id) => persist(exercises.filter((e) => e.id !== id))} />
      )}
      {view.page === "quiz" && (
        <Workspace ex={exercises.find((e) => e.id === view.exId)}
          back={() => setView({ page: "category", cat: view.cat })} />
      )}

      {showForm && <TeacherForm close={() => setShowForm(false)}
        add={(ex) => { persist([...exercises, ex]); setShowForm(false); }} />}
    </div>
  );
}

/* ============ 1. Category Dashboard ============ */
function Dashboard({ exercises, teacherMode, openCategory, onAdd }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontFamily: "'Lora',serif", margin: 0, fontSize: 24 }}>Chọn kỹ năng luyện tập</h2>
        {teacherMode && <button style={T.btn(true)} onClick={onAdd}><Plus size={16} /> Thêm bài tập mới</button>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {CATEGORIES.map(({ id, label, vi, Icon, color, pastel, progress }, i) => {
          const count = exercises.filter((e) => e.category === id).length;
          return (
            <div key={id} className="ph-card" onClick={() => openCategory(id)}
              style={{ ...T.card, padding: 22, cursor: "pointer", animationDelay: `${i * 40}ms` }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: pastel, display: "grid", placeItems: "center", marginBottom: 14 }}>
                <Icon size={26} color={color} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 16.5 }}>{label}</div>
              <div style={{ fontSize: 13, color: T.soft, margin: "3px 0 14px" }}>{vi} · {count} bài tập</div>
              {/* Progress bar */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: T.soft, marginBottom: 5 }}>
                <span>Tiến độ lớp</span><span style={{ color }}>{progress} %</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: T.line }}>
                <div style={{ height: "100%", width: `${progress}%`, borderRadius: 99, background: `linear-gradient(90deg,${color},${color}AA)`, transition: "width .4s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Category exercise list ============ */
function CategoryList({ cat, exercises, teacherMode, back, open, onAdd, onDelete }) {
  const meta = CATEGORIES.find((c) => c.id === cat);
  const list = exercises.filter((e) => e.category === cat);
  return (
    <div>
      <button style={{ ...T.btn(false), marginBottom: 16 }} onClick={back}><ChevronLeft size={16} /> Quay lại</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontFamily: "'Lora',serif", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <meta.Icon size={24} color={meta.color} /> {meta.label}
        </h2>
        {teacherMode && <button style={T.btn(true)} onClick={onAdd}><Plus size={16} /> Thêm bài tập mới</button>}
      </div>
      {list.length === 0 ? (
        <div className="ph-card" style={{ ...T.card, padding: 40, textAlign: "center", color: T.soft }}>Chưa có bài tập nào trong mục này.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {list.map((ex) => (
            <div key={ex.id} className="ph-card" style={{ ...T.card, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: meta.color, borderRadius: 999, padding: "3px 10px", marginRight: 10 }}>{ex.level}</span>
                <strong>{ex.title}</strong>
                <div style={{ fontSize: 12.5, color: T.soft, marginTop: 4 }}>
                  {ex.type === "qcm" ? "Trắc nghiệm" : ex.type === "fill" ? "Điền từ vào chỗ trống" : ex.type === "listening" ? "Bài nghe" : "Bài viết tự luận"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={T.btn(true)} onClick={() => open(ex)}>Luyện tập</button>
                {teacherMode && (
                  <button style={{ ...T.btn(false), color: "#DE4B4B", borderColor: "#DE4B4B" }} onClick={() => onDelete(ex.id)}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ 2. Student Workspace ============ */
function Workspace({ ex, back }) {
  const [mcq, setMcq] = useState(null);
  const [fills, setFills] = useState({});
  const [text, setText] = useState("");
  const [result, setResult] = useState(null); // {score,max} | {writing:true}

  if (!ex) return null;
  const norm = (s) => (s || "").trim().toLowerCase().normalize("NFC");
  const okFill = (i) => ex.blanks[i].split("|").map(norm).includes(norm(fills[i]));

  const submit = () => {
    if (ex.type === "writing") { setResult({ writing: true }); return; }
    if (ex.type === "fill") {
      const score = ex.blanks.reduce((n, _, i) => n + (okFill(i) ? 1 : 0), 0);
      setResult({ score, max: ex.blanks.length });
    } else {
      setResult({ score: mcq === ex.answer ? 1 : 0, max: 1 });
    }
  };

  const graded = result && !result.writing;
  const perfect = graded && result.score === result.max;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button style={{ ...T.btn(false), marginBottom: 16 }} onClick={back}><ChevronLeft size={16} /> Quay lại</button>

      <div className="ph-card" style={{ ...T.card, padding: 26 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.primary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          {ex.level} · {CATEGORIES.find((c) => c.id === ex.category)?.label}
        </div>
        <h2 style={{ fontFamily: "'Lora',serif", margin: "0 0 18px", fontSize: 21 }}>{ex.title}</h2>

        {ex.type === "listening" && <AudioPlayer src={ex.audioUrl} />}

        {/* ----- QCM / listening MCQ ----- */}
        {(ex.type === "qcm" || ex.type === "listening") && (
          <>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{ex.question}</p>
            <div style={{ display: "grid", gap: 10 }}>
              {ex.options.map((o, i) => {
                let bg = "#fff", border = T.line, icon = null;
                if (graded) {
                  if (i === ex.answer) { bg = T.okBg; border = T.ok; icon = <CheckCircle2 size={18} color={T.ok} />; }
                  else if (i === mcq) { bg = T.badBg; border = T.bad; icon = <XCircle size={18} color={T.bad} />; }
                } else if (i === mcq) { bg = "#EDF1FE"; border = T.primary; }
                return (
                  <button key={i} disabled={graded} onClick={() => setMcq(i)}
                    style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "12px 15px", borderRadius: 12, fontSize: 15, fontFamily: "inherit", cursor: graded ? "default" : "pointer", background: bg, border: `1.5px solid ${border}`, color: T.navy, textDecoration: graded && i === mcq && i !== ex.answer ? "line-through" : "none" }}>
                    <strong>{String.fromCharCode(65 + i)}.</strong> {o}
                    <span style={{ marginLeft: "auto" }}>{icon}</span>
                  </button>
                );
              })}
            </div>
            {graded && ex.explanation && (
              <div style={{ marginTop: 14, background: "#FFF6E8", border: "1px solid #C9841244", borderRadius: 12, padding: "10px 14px", fontSize: 14 }}>
                💡 {ex.explanation}
              </div>
            )}
          </>
        )}

        {/* ----- Fill in the blanks ----- */}
        {ex.type === "fill" && (
          <p style={{ fontSize: 16.5, lineHeight: 2.2 }}>
            {ex.segments.map((seg, i) => (
              <React.Fragment key={i}>
                {seg}
                {i < ex.blanks.length && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <input disabled={graded} value={fills[i] || ""}
                      onChange={(e) => setFills({ ...fills, [i]: e.target.value })}
                      style={{ width: 130, padding: "5px 10px", borderRadius: 8, fontSize: 15, fontFamily: "inherit", textAlign: "center",
                        border: `1.5px solid ${graded ? (okFill(i) ? T.ok : T.bad) : T.line}`,
                        background: graded ? (okFill(i) ? T.okBg : T.badBg) : "#FBFCFE",
                        color: T.navy, textDecoration: graded && !okFill(i) ? "line-through" : "none" }} />
                    {graded && (okFill(i)
                      ? <CheckCircle2 size={16} color={T.ok} />
                      : <span style={{ fontSize: 13, color: T.ok, fontWeight: 700 }}>✗ → {ex.blanks[i].split("|")[0]}</span>)}
                  </span>
                )}
              </React.Fragment>
            ))}
          </p>
        )}

        {/* ----- Writing ----- */}
        {ex.type === "writing" && (
          <>
            <p style={{ fontSize: 15.5 }}>{ex.question}</p>
            <textarea disabled={!!result} value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Écris ta réponse ici…"
              style={{ ...T.input, minHeight: 130, resize: "vertical" }} />
          </>
        )}

        {/* ----- Submit / Result ----- */}
        {!result ? (
          <button style={{ ...T.btn(true), marginTop: 20, opacity: (ex.type === "writing" ? text.trim() : ex.type === "fill" ? Object.keys(fills).length === ex.blanks.length : mcq != null) ? 1 : 0.4 }}
            disabled={ex.type === "writing" ? !text.trim() : ex.type === "fill" ? Object.keys(fills).length !== ex.blanks.length : mcq == null}
            onClick={submit}>
            Nộp bài
          </button>
        ) : result.writing ? (
          <div className="ph-pop" style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFF6E8", border: "1px solid #C9841244", borderRadius: 12, padding: "12px 16px", fontWeight: 700, color: "#C98412" }}>
              <Clock size={18} /> Đã lưu — Chờ giáo viên chấm
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={T.label}>📄 Bài mẫu tham khảo</div>
              <div style={{ marginTop: 8, background: "#FBFCFE", border: `1px solid ${T.line}`, borderRadius: 12, padding: "13px 16px", fontSize: 14.5, fontStyle: "italic", lineHeight: 1.7 }}>
                {ex.sample}
              </div>
            </div>
          </div>
        ) : (
          <div className="ph-pop" style={{ marginTop: 20, textAlign: "center", background: perfect ? T.okBg : "#EDF1FE", borderRadius: 14, padding: "18px 16px" }}>
            <div style={{ fontSize: 30 }}>{perfect ? <PartyPopper size={34} color={T.ok} /> : "💪"}</div>
            <div style={{ fontWeight: 800, fontSize: 19, marginTop: 6, color: perfect ? T.ok : T.primary }}>
              Bạn đạt {result.score}/{result.max} điểm{perfect ? " — Xuất sắc ! 🎉" : ""}
            </div>
            {!perfect && <div style={{ fontSize: 13.5, color: T.soft, marginTop: 4 }}>Xem đáp án đúng được đánh dấu xanh phía trên để rút kinh nghiệm nhé !</div>}
            <button style={{ ...T.btn(false), marginTop: 14 }} onClick={() => { setResult(null); setMcq(null); setFills({}); setText(""); }}>
              <RotateCcw size={15} /> Làm lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ Audio player ============ */
function AudioPlayer({ src }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = ref.current; if (!a) return;
    const onTime = () => setT(a.currentTime);
    const onMeta = () => setDur(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime); a.addEventListener("loadedmetadata", onMeta); a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onMeta); a.removeEventListener("ended", onEnd); };
  }, []);

  const toggle = () => { const a = ref.current; if (!a) return; playing ? a.pause() : a.play(); setPlaying(!playing); };
  const fmt = (s) => isNaN(s) ? "0:00" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#EDF1FE", borderRadius: 14, padding: "12px 16px", marginBottom: 18 }}>
      <audio ref={ref} src={src} preload="metadata" />
      <button onClick={toggle} style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: "linear-gradient(135deg,#3D5AF1,#5B7CFA)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 4px 10px rgba(61,90,241,.3)" }}>
        {playing ? <Pause size={18} color="#fff" /> : <Play size={18} color="#fff" style={{ marginLeft: 2 }} />}
      </button>
      <input type="range" min={0} max={dur || 1} step={0.1} value={t}
        onChange={(e) => { ref.current.currentTime = +e.target.value; setT(+e.target.value); }}
        style={{ flex: 1, accentColor: "#3D5AF1" }} />
      <span style={{ fontSize: 12.5, fontWeight: 700, color: T.soft, minWidth: 76, textAlign: "right" }}>{fmt(t)} / {fmt(dur)}</span>
    </div>
  );
}

/* ============ 3. Teacher form ============ */
function TeacherForm({ close, add }) {
  const [f, setF] = useState({ title: "", category: "GR", level: "B1", type: "qcm", question: "", options: ["", "", "", ""], answer: 0, blanksRaw: "", sample: "", audioUrl: "" });
  const set = (patch) => setF({ ...f, ...patch });

  const submit = () => {
    const base = { id: "t" + Date.now(), category: f.category, level: f.level, title: f.title.trim(), type: f.type };
    let ex;
    if (f.type === "qcm" || f.type === "listening") {
      ex = { ...base, question: f.question, options: f.options, answer: f.answer, ...(f.type === "listening" ? { audioUrl: f.audioUrl } : {}) };
    } else if (f.type === "fill") {
      // Cú pháp: dùng [đáp án] trong câu, ví dụ: "Je [vais] à l'école en [bus|vélo]."
      const parts = f.question.split(/\[([^\]]+)\]/);
      const segments = parts.filter((_, i) => i % 2 === 0);
      const blanks = parts.filter((_, i) => i % 2 === 1);
      ex = { ...base, segments, blanks };
    } else {
      ex = { ...base, question: f.question, sample: f.sample };
    }
    add(ex);
  };

  const ready = f.title.trim() && f.question.trim() &&
    (f.type !== "qcm" && f.type !== "listening" || f.options.every((o) => o.trim())) &&
    (f.type !== "fill" || /\[[^\]]+\]/.test(f.question));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,37,89,.45)", display: "grid", placeItems: "center", padding: 16, zIndex: 100 }} onClick={close}>
      <div className="ph-pop" style={{ ...T.card, padding: 26, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontFamily: "'Lora',serif", marginTop: 0 }}>➕ Thêm bài tập mới</h3>

        <div style={T.label}>Tên bài</div>
        <input style={{ ...T.input, margin: "6px 0 14px" }} value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="ex. Le passé composé — exercice 2" />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={T.label}>Phân loại</div>
            <select style={{ ...T.input, marginTop: 6 }} value={f.category} onChange={(e) => set({ category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <div style={T.label}>Niveau</div>
            <select style={{ ...T.input, marginTop: 6 }} value={f.level} onChange={(e) => set({ level: e.target.value })}>
              {["A1", "A2", "B1", "B2", "B2+"].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <div style={T.label}>Dạng bài</div>
            <select style={{ ...T.input, marginTop: 6 }} value={f.type} onChange={(e) => set({ type: e.target.value })}>
              <option value="qcm">Trắc nghiệm</option>
              <option value="fill">Điền từ</option>
              <option value="listening">Bài nghe</option>
              <option value="writing">Bài viết</option>
            </select>
          </div>
        </div>

        {f.type === "listening" && (
          <>
            <div style={T.label}>Link audio (mp3)</div>
            <input style={{ ...T.input, margin: "6px 0 14px" }} value={f.audioUrl} onChange={(e) => set({ audioUrl: e.target.value })} placeholder="https://…/audio.mp3" />
          </>
        )}

        <div style={T.label}>{f.type === "fill" ? "Đoạn văn — đặt đáp án trong [ngoặc vuông]" : "Nội dung câu hỏi"}</div>
        <textarea style={{ ...T.input, margin: "6px 0 14px", minHeight: 70, resize: "vertical" }} value={f.question}
          onChange={(e) => set({ question: e.target.value })}
          placeholder={f.type === "fill" ? "ex. Je [vais] à l'école en [bus|vélo] chaque matin." : "Énoncé de la question…"} />

        {(f.type === "qcm" || f.type === "listening") && (
          <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
            <div style={T.label}>4 phương án — chọn nút tròn ở đáp án đúng (Answer Key)</div>
            {f.options.map((o, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="radio" checked={f.answer === i} onChange={() => set({ answer: i })} />
                <strong style={{ width: 18 }}>{String.fromCharCode(65 + i)}.</strong>
                <input style={T.input} value={o} onChange={(e) => set({ options: f.options.map((x, k) => k === i ? e.target.value : x) })} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
              </div>
            ))}
          </div>
        )}

        {f.type === "writing" && (
          <>
            <div style={T.label}>Bài mẫu (hiện cho học sinh sau khi nộp)</div>
            <textarea style={{ ...T.input, margin: "6px 0 14px", minHeight: 60, resize: "vertical" }} value={f.sample} onChange={(e) => set({ sample: e.target.value })} />
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button style={{ ...T.btn(true), opacity: ready ? 1 : 0.4 }} disabled={!ready} onClick={submit}>Lưu bài tập</button>
          <button style={T.btn(false)} onClick={close}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
