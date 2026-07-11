import './storageShim.js'
import React, { useState, useEffect, useCallback, useMemo } from "react";
import PracticeHub from './PracticeHub.jsx'
import mammoth from 'mammoth/mammoth.browser'
import { BookOpen, GraduationCap, Wine, Croissant, Landmark, Stamp, Feather, Coffee, BookMarked, MoreVertical, Pencil, Copy, Trash2, RotateCcw, Image as ImageIcon, X } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

/* ================= Ma Classe de Français v3 =================
Shared keys:
 "mcf-exercises"   [{id,title,level,skill,deadline,audioUrl,questions,createdAt}]
   question: {id, type:'qcm'|'fill'|'conj'|'open', prompt, options?, answer?, accepted?, model?}
 "mcf-accounts"    [{name, code}]
 "mcf-submissions" [{id,exerciseId,student,answers,autoScore,autoMax,openMarks:{qid:0|1},
                     late,at,comment,qComments:{qid},graded}]
 "mcf-teacher-pin"
Personal keys (per viewer): "mcf-draft-<exId>-<name>", "mcf-seen-<name>"
============================================================== */

const C = {
  bg: "var(--mcf-bg)", card: "var(--mcf-card)", ink: "var(--mcf-ink)", soft: "var(--mcf-soft)", line: "var(--mcf-line)",
  primary: "#3D5AF1", primarySoft: "var(--mcf-primarysoft)", accent: "#F26B4E",
  ok: "#1E9E6A", okSoft: "var(--mcf-oksoft)", warn: "#C98412", warnSoft: "var(--mcf-warnsoft)",
  danger: "#DE4B4B", dangerSoft: "var(--mcf-dangersoft)",
};
const LEVEL_COLORS = { A1: "#1E9E6A", A2: "#2A9D8F", B1: "#3D5AF1", B2: "#7048E8", "B2+": "#D6336C" };
const LEVEL_PASTEL = { A1: "#DDF6EB", A2: "#DDF2F0", B1: "#E6EBFE", B2: "#EFE9FC", "B2+": "#FBE3ED" };
const SKILLS = ["Grammaire", "Vocabulaire", "Écoute", "Lecture", "Production écrite", "Traduction", "Communication"];
const QTYPES = { qcm: "QCM", fill: "Texte à trous", conj: "Conjugaison", open: "Réponse libre / traduction" };

const FONTS = `
.mcf-root {
  --mcf-bg: #F8F9FA; --mcf-card: #FFFFFF; --mcf-surface: #FFFFFF; --mcf-surface2: #FBFCFE;
  --mcf-ink: #111827; --mcf-soft: #6B7280; --mcf-line: #EEF0F4;
  --mcf-primarysoft: #EDF1FE; --mcf-oksoft: #E7F7F0; --mcf-warnsoft: #FFF6E8; --mcf-dangersoft: #FDEEEE;
}
.mcf-root.mcf-dark {
  --mcf-bg: #0F172A; --mcf-card: #1E293B; --mcf-surface: #1E293B; --mcf-surface2: #0B1120;
  --mcf-ink: #E5E7EB; --mcf-soft: #94A3B8; --mcf-line: #334155;
  --mcf-primarysoft: #1E2A4D; --mcf-oksoft: #0F2E22; --mcf-warnsoft: #33290F; --mcf-dangersoft: #331616;
}
.mcf-dark input, .mcf-dark textarea, .mcf-dark select { color: var(--mcf-ink); }
.mcf-dark img { filter: brightness(.92); }

@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,600&family=Playfair+Display:ital,wght@0,700;0,800;1,500&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }
button { transition: transform .12s ease, box-shadow .12s ease, opacity .12s ease; }
button:hover:not(:disabled) { transform: translateY(-1px); }
input:focus, textarea:focus, select:focus { outline: none; border-color: #3D5AF1 !important; box-shadow: 0 0 0 3px #3D5AF122; }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.mcf-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.mcf-scroll::-webkit-scrollbar-track { background: transparent; }
.mcf-scroll::-webkit-scrollbar-thumb { background: #D6DAE3; border-radius: 99px; }
.mcf-scroll::-webkit-scrollbar-thumb:hover { background: #B9BFCC; }
.mcf-scroll { scrollbar-width: thin; scrollbar-color: #D6DAE3 transparent; }
.mcf-wide { position: relative; left: 50%; transform: translateX(-50%); width: min(100vw - 24px, 1600px); }
mark.mcf-hl { background: rgba(255, 224, 102, .85); border-radius: 4px; padding: 0 2px; }
.mcf-card { animation: fadeUp .25s ease both; }
@keyframes mcfPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.55); } 50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); } }
.mcf-pulse { animation: mcfPulse 1.8s ease-out infinite; }
`;

const S = {
  font: { fontFamily: "'Be Vietnam Pro', -apple-system, 'Segoe UI', sans-serif", color: C.ink },
  display: { fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, letterSpacing: "-0.5px", fontSize: 26, color: "var(--mcf-ink)" },
  card: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 32, boxShadow: "0 10px 30px rgba(17,24,39,0.06)", padding: "24px 28px" },
  btn: (primary, danger) => ({
    padding: "11px 22px", borderRadius: 999, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
    border: primary ? "none" : `1.5px solid ${danger ? C.danger : C.line}`,
    background: primary ? `linear-gradient(135deg, ${C.primary}, #5B7CFA)` : C.card,
    color: primary ? "#fff" : danger ? C.danger : C.ink,
    boxShadow: primary ? "0 4px 12px rgba(61,90,241,0.28)" : "0 1px 3px rgba(27,37,89,0.06)",
  }),
  input: { width: "100%", padding: "12px 16px", border: `1.5px solid ${C.line}`, borderRadius: 16, fontSize: 15, color: C.ink, background: "var(--mcf-surface2)", fontFamily: "inherit" },
  label: { fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", color: C.soft, fontWeight: 700 },
  badge: (lv) => ({ fontSize: 11.5, fontWeight: 800, color: LEVEL_COLORS[lv] || C.primary, background: LEVEL_PASTEL[lv] || C.primarySoft, borderRadius: 999, padding: "4px 12px", marginRight: 8, letterSpacing: 0.5 }),
  chip: (bg, col) => ({ fontSize: 12, fontWeight: 700, background: bg, color: col, borderRadius: 999, padding: "3px 10px" }),
};

/* ---------- Doodles trang trí nền (Bento / Creative EdTech) ---------- */
function Doodles() {
  const star = (x, y, size, color, rot = 0) => (
    <div key={x + "-" + y} style={{ position: "absolute", left: x, top: y, fontSize: size, color, fontWeight: 900,
      transform: `rotate(${rot}deg)`, lineHeight: 1, userSelect: "none" }}>✳</div>
  );
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {star("6%", "18%", 26, "#FFD43B", 12)}
      {star("92%", "12%", 20, "#74C0FC", -8)}
      {star("88%", "72%", 30, "#FFD43B", 20)}
      {star("4%", "78%", 18, "#B197FC", 0)}
      <div style={{ position: "absolute", left: "12%", top: "60%", width: 14, height: 14, borderRadius: "50%", border: "3px solid #74C0FC" }} />
      <div style={{ position: "absolute", left: "80%", top: "38%", width: 10, height: 10, borderRadius: "50%", background: "#FFD43B" }} />
      <div style={{ position: "absolute", left: "45%", top: "8%", width: 12, height: 12, borderRadius: "50%", border: "3px solid #63E6BE" }} />
      <svg style={{ position: "absolute", left: "-2%", top: "40%", opacity: 0.7 }} width="140" height="40" viewBox="0 0 140 40" fill="none">
        <path d="M2 20 Q 20 2, 38 20 T 74 20 T 110 20 T 146 20" stroke="#FFD43B" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <svg style={{ position: "absolute", right: "-2%", bottom: "12%", opacity: 0.6 }} width="140" height="40" viewBox="0 0 140 40" fill="none">
        <path d="M2 20 Q 20 2, 38 20 T 74 20 T 110 20 T 146 20" stroke="#74C0FC" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ---------- Dropdown menu (⋮) dùng chung ---------- */
function KebabMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} title="Plus d'options"
        style={{ width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${C.line}`, background: "var(--mcf-surface)",
          cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "0 2px 8px rgba(17,24,39,.06)" }}>
        <MoreVertical size={18} color={C.ink} />
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: 46, minWidth: 190, background: "var(--mcf-surface)", borderRadius: 20,
          boxShadow: "0 14px 36px rgba(17,24,39,.16)", border: `1px solid ${C.line}`, padding: 6, zIndex: 60 }}>
          {items.map(({ label, icon, danger, onClick }, i) => (
            <button key={i} onClick={() => { setOpen(false); onClick(); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px",
                border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit",
                fontSize: 14, fontWeight: 600, borderRadius: 14, textAlign: "left",
                color: danger ? C.danger : C.ink }}
              onMouseEnter={(e) => e.currentTarget.style.background = danger ? C.dangerSoft : "var(--mcf-bg)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              {icon} {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- storage helpers ---------- */
async function load(key, fallback, shared = true) {
  try { const r = await window.storage.get(key, shared); return r ? JSON.parse(r.value) : fallback; }
  catch { return fallback; }
}
async function save(key, value, shared = true) {
  try { await window.storage.set(key, JSON.stringify(value), shared); return true; } catch { return false; }
}
async function del(key, shared = false) { try { await window.storage.delete(key, shared); } catch {} }

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const fmtDate = (d) => new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
const isLate = (ex) => ex.deadline && Date.now() > new Date(ex.deadline).getTime();
const assignedTo = (ex, name) => !ex.assignedTo || ex.assignedTo.length === 0 || ex.assignedTo.includes(name);
const targetedAccounts = (ex, accounts) => (ex.assignedTo && ex.assignedTo.length ? accounts.filter((a) => ex.assignedTo.includes(a.name)) : accounts);
const norm = (s) => (s || "").trim().toLowerCase().normalize("NFC").replace(/\s+/g, " ").replace(/[’]/g, "'");
const fileNameFromUrl = (u) => {
  try { return decodeURIComponent((u || "").split("/").pop().split("?")[0]) || "fichier"; }
  catch { return "fichier"; }
};

/* 🟢 Trạng thái online : quy đổi timestamp → nhãn tiếng Pháp */
function formatLastSeen(ts) {
  if (!ts) return { online: false, label: "Jamais connecté" };
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 5) return { online: true, label: "En ligne" };
  if (mins < 60) return { online: false, label: `Il y a ${mins} min` };
  const hours = Math.floor(mins / 60);
  if (hours < 24) return { online: false, label: `Il y a ${hours} heure${hours > 1 ? "s" : ""}` };
  const days = Math.floor(hours / 24);
  return { online: false, label: `Il y a ${days} jour${days > 1 ? "s" : ""}` };
}

const stripHtml = (h) => (h || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
const wordCount = (h) => { const t = stripHtml(h); return t ? t.split(" ").length : 0; };
/* ---- Import DOCX (CE) : tách bài đọc + câu hỏi ----
   Quy tắc: phần trước ---QUESTIONS--- = bài đọc;
   sau đó mỗi câu bắt đầu "1. ", đáp án "A. " ... , đáp án đúng có dấu * ở cuối. */
function parseDocxText(raw) {
  const marker = /-{2,}\s*QUESTIONS\s*-{2,}/i;
  const [textPart, qPart = ""] = raw.split(marker);
  const questions = [];
  let cur = null;
  qPart.split(/\r?\n/).map((l) => l.trim()).forEach((line) => {
    if (!line) return;
    const mQ = line.match(/^\d+[.)]\s*(.+)/);
    const mO = line.match(/^([A-D])[.)]\s*(.+)/i);
    if (mQ && !mO) {
      if (cur) questions.push(cur);
      cur = { id: uid(), type: "qcm", prompt: mQ[1].trim(), options: [], answer: 0 };
    } else if (mO && cur) {
      let opt = mO[2].trim();
      const isAnswer = /\*\s*$/.test(opt);
      opt = opt.replace(/\s*\*\s*$/, "");
      if (isAnswer) cur.answer = cur.options.length;
      cur.options.push(opt);
    } else if (cur && cur.options.length === 0) {
      cur.prompt += " " + line; // câu hỏi xuống dòng
    }
  });
  if (cur) questions.push(cur);
  return {
    readingText: textPart.trim(),
    questions: questions.filter((q) => q.prompt && q.options.length >= 2),
  };
}

const fillOk = (q, ans) => (q.accepted || "").split("|").map(norm).filter(Boolean).includes(norm(ans));
const autoQ = (q) => q.type === "qcm" || q.type === "fill" || q.type === "conj";

function totalScore(sub, ex) {
  const opens = ex.questions.filter((q) => q.type === "open");
  const manual = opens.reduce((n, q) => n + (sub.openMarks?.[q.id] ?? 0), 0);
  const graded = sub.graded;
  return { score: sub.autoScore + (graded ? manual : 0), max: sub.autoMax + (graded ? opens.length : 0), pending: !graded && opens.length > 0 };
}

/* ================= Root ================= */
const SESSION_KEY = "mcf-session";
const THEME_KEY = "mcf-theme";

export default function App() {
  const [dark, setDark] = useState(() => { try { return localStorage.getItem(THEME_KEY) === "dark"; } catch { return false; } });
  const toggleTheme = () => setDark((d) => { const n = !d; try { localStorage.setItem(THEME_KEY, n ? "dark" : "light"); } catch {} return n; });
  const [session, setSessionRaw] = useState(null);
  // Duy trì đăng nhập : lưu phiên vào localStorage
  const setSession = (s) => {
    setSessionRaw(s);
    try {
      if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
  };
  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [ex, sub, ac] = await Promise.all([
      load("mcf-exercises", []), load("mcf-submissions", []), load("mcf-accounts", []),
    ]);
    setExercises(ex); setSubmissions(sub); setAccounts(ac); setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  // Auto-login : khôi phục phiên từ localStorage khi app khởi chạy
  useEffect(() => {
    if (loading) return;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.role === "prof") setSessionRaw(saved);
      else if (saved.role === "eleve" && accounts.some((a) => a.name === saved.name)) setSessionRaw(saved);
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (!loading && !session) {
    return <Login accounts={accounts} setAccounts={setAccounts} onLogin={(s) => { setSession(s); refresh(); }} />;
  }

  return (
    <div className={"mcf-root" + (dark ? " mcf-dark" : "")} style={{ background: C.bg, ...S.font, minHeight: "100vh" }}>
      <style>{FONTS}</style>
      <Doodles />
      <header style={{ background: "transparent", padding: "26px 28px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 20, background: "#FFD43B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 8px 20px rgba(255,212,59,.4)" }}>🇫🇷</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 27, letterSpacing: "-0.8px", color: C.ink, lineHeight: 1.1 }}>
              Le Français Avec Hung<span style={{ color: "#FFD43B" }}> ✳</span>
            </div>
            <div style={{ fontSize: 13, color: C.soft, fontWeight: 600 }}>Parcours d'apprentissage · exercices & suivi des élèves</div>
          </div>
        </div>
        {session && (
          <div style={{ fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={toggleTheme} title={dark ? "Mode clair" : "Mode sombre"}
              style={{ width: 42, height: 42, borderRadius: 999, border: `1.5px solid ${C.line}`, background: "var(--mcf-surface)",
                cursor: "pointer", fontSize: 17, boxShadow: "0 4px 12px rgba(17,24,39,.06)" }}>
              {dark ? "☀️" : "🌙"}
            </button>
            {session.role === "eleve" && <Bell name={session.name} exercises={exercises} submissions={submissions} />}
            <span style={{ color: C.ink, background: "#E6EBFE", borderRadius: 999, padding: "8px 16px", fontWeight: 700, fontSize: 13 }}>
              {session.role === "prof" ? "👨‍🏫 Professeur" : `🎒 ${session.name}`}
            </span>
            <button style={S.btn(false)} onClick={() => setSession(null)}>Se déconnecter</button>
          </div>
        )}
      </header>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "26px 16px 60px", position: "relative", zIndex: 1 }}>
        {loading ? <p style={{ textAlign: "center", color: C.soft }}>Ouverture du cahier…</p>
          : !session ? null
          : session.role === "prof"
            ? <Teacher {...{ exercises, setExercises, submissions, setSubmissions, accounts, setAccounts, refresh }} />
            : <Student name={session.name} {...{ exercises, submissions, setSubmissions, accounts, setAccounts, refresh }} />}
      </main>
    </div>
  );
}

/* ================= Notifications bell ================= */
function Bell({ name, exercises, submissions }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState({});
  useEffect(() => { load(`mcf-seen-${name}`, {}, false).then(setSeen); }, [name]);

  const notifs = useMemo(() => {
    const list = [];
    const now = Date.now();
    exercises.filter((ex) => assignedTo(ex, name)).forEach((ex) => {
      const sub = submissions.find((s) => s.exerciseId === ex.id && s.student === name);
      if (ex.deadline && !sub) {
        const dt = new Date(ex.deadline).getTime() - now;
        if (dt > 0 && dt < 24 * 3600 * 1000)
          list.push({ id: "due-" + ex.id, icon: "⏰", text: `« ${ex.title} » est à rendre avant ${fmtDate(ex.deadline)} !` });
      }
      if (sub?.graded && !sub.redo && !seen["graded-" + sub.id])
        list.push({ id: "graded-" + sub.id, icon: "✅", text: `Ta copie « ${ex.title} » a été corrigée.` });
      if (sub?.redo)
        list.push({ id: "redo-" + sub.id, icon: "🔁", text: `Le professeur te demande de refaire « ${ex.title} »${sub.redoNote ? " : " + sub.redoNote : ""}.` });
    });
    return list;
  }, [exercises, submissions, name, seen]);

  const openBell = async () => {
    setOpen(!open);
    if (!open && notifs.length) {
      const next = { ...seen };
      notifs.forEach((n) => { if (n.id.startsWith("graded-")) next[n.id] = true; });
      setSeen(next); await save(`mcf-seen-${name}`, next, false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button onClick={openBell} style={{ background: "var(--mcf-surface)", border: `1.5px solid ${C.line}`, borderRadius: 999, width: 42, height: 42, cursor: "pointer", fontSize: 17, position: "relative", boxShadow: "0 4px 12px rgba(17,24,39,.06)" }}>
        🔔
        {notifs.length > 0 && (
          <span style={{ position: "absolute", top: -3, right: -3, background: C.accent, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 999, minWidth: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {notifs.length}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: 46, width: 300, background: "var(--mcf-surface)", borderRadius: 24, boxShadow: "0 14px 36px rgba(17,24,39,0.14)", zIndex: 50, padding: 10, color: C.ink }}>
          {notifs.length === 0
            ? <div style={{ padding: 12, fontSize: 13, color: C.soft }}>Aucune notification. Tout est à jour ! 🎉</div>
            : notifs.map((n) => (
              <div key={n.id} style={{ padding: "9px 10px", fontSize: 13, borderBottom: `1px solid ${C.line}` }}>
                {n.icon} {n.text}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/* ================= Login — Classic Parisian ================= */
function Login({ accounts, onLogin }) {
  const [tab, setTab] = useState("eleve");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");

  // 💬 Câu động lực tiếng Pháp — đổi câu mỗi 7 giây với hiệu ứng fade
  const QUOTES = [
    "« Le succès est la somme de petits efforts, répétés jour après jour. »",
    "« Petit à petit, l'oiseau fait son nid. »",
    "« Paris ne s'est pas fait en un jour. »",
    "« Vouloir, c'est pouvoir. »",
    "« L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde. »",
    "« Il n'y a pas de réussite facile ni d'échecs définitifs. »",
  ];
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [quoteVisible, setQuoteVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setQuoteVisible(false);                          // mờ đi
      setTimeout(() => {
        setQuoteIdx((i) => (i + 1) % QUOTES.length);   // đổi câu
        setQuoteVisible(true);                         // hiện lại
      }, 500);
    }, 7000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginStudent = () => {
    const acc = accounts.find((a) => a.name.toLowerCase() === name.trim().toLowerCase());
    if (!acc) { setMsg("Compte introuvable. Demande à ton professeur de créer ton compte."); return; }
    if (acc.code !== code.trim()) { setMsg("Mot de passe incorrect."); return; }
    onLogin({ role: "eleve", name: acc.name });
  };
  const loginTeacher = async () => {
    const stored = await load("mcf-teacher-pin", null);
    if (!stored) {
      if (pin.length < 4) { setMsg("Choisissez un code PIN d'au moins 4 caractères (première connexion)."); return; }
      await save("mcf-teacher-pin", pin); onLogin({ role: "prof" });
    } else if (stored === pin) onLogin({ role: "prof" });
    else setMsg("Code PIN incorrect.");
  };

  const NAVY = "#1e3a8a", CREAM = "#F8F5F0", GOLD = "#C9A227";
  const serif = { fontFamily: "'Playfair Display', Georgia, serif" };

  // Vị trí trang trí (placeholder lucide — thay bằng hình minh họa sau)
  const DECOR = [
    { Icon: Landmark, x: "6%", y: "10%", size: 90, rot: 0 },      // Tháp / công trình
    { Icon: Landmark, x: "84%", y: "8%", size: 84, rot: 0 },      // Khải Hoàn Môn
    { Icon: Croissant, x: "20%", y: "24%", size: 42, rot: -15 },
    { Icon: Wine, x: "74%", y: "30%", size: 40, rot: 8 },
    { Icon: Coffee, x: "8%", y: "52%", size: 44, rot: 0 },
    { Icon: Stamp, x: "88%", y: "50%", size: 46, rot: 12 },
    { Icon: BookMarked, x: "16%", y: "76%", size: 52, rot: -8 },
    { Icon: Feather, x: "46%", y: "84%", size: 42, rot: 15 },
    { Icon: Croissant, x: "70%", y: "78%", size: 40, rot: 20 },
    { Icon: Wine, x: "30%", y: "60%", size: 34, rot: -10 },
    { Icon: BookOpen, x: "60%", y: "14%", size: 38, rot: -5 },
  ];

  const inputStyle = {
    width: "100%", padding: "10px 2px", fontSize: 16, color: "#1B2559", background: "transparent",
    border: "none", borderBottom: "1.5px solid #D8D2C7", borderRadius: 0, fontFamily: "inherit", outline: "none",
  };
  const labelStyle = { fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: "#6B7280", fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif" };

  const FlagFR = ({ w = 30, round = false }) => (
    <span style={{ display: "inline-flex", width: w, height: round ? w : w * 0.66, borderRadius: round ? "50%" : 3,
      overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.2)", flexShrink: 0 }}>
      <span style={{ flex: 1, background: "#0B3D91" }} /><span style={{ flex: 1, background: "var(--mcf-surface)" }} /><span style={{ flex: 1, background: "#CE1126" }} />
    </span>
  );

  return (
    <div style={{ minHeight: "100vh", background: CREAM, position: "relative", overflow: "hidden",
      fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <style>{FONTS + `
        .lp-input:focus { border-bottom-color: ${NAVY} !important; border-bottom-width: 2px !important; }
        @media (max-width: 640px) { .lp-decor { display: none; } }
      `}</style>

      {/* ---- Trang trí xung quanh (placeholder lucide, nét mảnh xám nhạt) ---- */}
      {DECOR.map(({ Icon, x, y, size, rot }, i) => (
        <div key={i} className="lp-decor" aria-hidden
          style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, pointerEvents: "none", opacity: 0.55 }}>
          <Icon size={size} color="#B9B2A4" strokeWidth={1.1} />
        </div>
      ))}

      {/* ---- Branding ---- */}
      <div style={{ textAlign: "center", marginBottom: 34, position: "relative", zIndex: 2 }}>
        <h1 style={{ fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif", fontWeight: 800, letterSpacing: "-1px",
          fontSize: "clamp(28px, 5vw, 40px)", color: "#152A6E", margin: 0,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ color: GOLD, fontSize: "0.8em" }}>✳</span>
          Le Français Avec Hung
          <FlagFR w={30} round />
        </h1>
        <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontStyle: "italic", color: "#6B7280", fontSize: "clamp(14px, 2.4vw, 16px)", marginTop: 8 }}>
          Une méthode classique de style en France
        </p>
      </div>

      {/* ---- Login card ---- */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 420 }}>
        {/* Con dấu sáp */}
        <div aria-hidden style={{ position: "absolute", top: 34, right: -26, width: 62, height: 62, borderRadius: "50%",
          background: "radial-gradient(circle at 32% 30%, #C08552, #8B4A2F 62%, #6E3821)",
          display: "grid", placeItems: "center", boxShadow: "0 8px 18px rgba(110,56,33,.4), inset 0 2px 6px rgba(255,255,255,.3)",
          border: "3px solid #A0623F", zIndex: 3 }}>
          <span style={{ ...serif, color: "#F3E2CE", fontWeight: 800, fontSize: 26, textShadow: "0 1px 2px rgba(0,0,0,.35)" }}>H</span>
        </div>

        <div style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", borderRadius: "2rem",
          padding: "30px 30px 34px", boxShadow: "0 30px 70px rgba(30,58,138,0.16), 0 10px 26px rgba(30,58,138,0.08)" }}>

          {/* Tabs */}
          <div style={{ display: "flex", background: "#EEEBE4", borderRadius: 999, padding: 5, marginBottom: 26 }}>
            {[["eleve", "Élève", BookOpen], ["prof", "Professeur", GraduationCap]].map(([k, l, Icon]) => (
              <button key={k} onClick={() => { setTab(k); setMsg(""); }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "11px 10px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14.5,
                  fontFamily: "inherit", borderRadius: 999, transition: "all .18s ease",
                  background: tab === k ? NAVY : "transparent",
                  color: tab === k ? "#fff" : "#8B8577",
                  boxShadow: tab === k ? "0 6px 14px rgba(30,58,138,.35)" : "none" }}>
                <Icon size={17} /> {l}
              </button>
            ))}
          </div>

          {tab === "eleve" ? (
            <>
              <div style={labelStyle}>Ton prénom</div>
              <input className="lp-input" style={{ ...inputStyle, margin: "4px 0 22px" }} value={name}
                onChange={(e) => setName(e.target.value)} placeholder="ex. Linh" />
              <div style={labelStyle}>Ton mot de passe</div>
              <input className="lp-input" type="password" style={{ ...inputStyle, margin: "4px 0 28px" }} value={code}
                onChange={(e) => setCode(e.target.value)} placeholder="Donné par le professeur"
                onKeyDown={(e) => e.key === "Enter" && loginStudent()} />
              <button onClick={loginStudent}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontWeight: 700, fontSize: 15.5, color: "#fff",
                  background: `linear-gradient(135deg, ${NAVY}, #2b4cad)`,
                  boxShadow: "0 10px 24px rgba(30,58,138,.38), inset 0 1px 0 rgba(255,255,255,.25)" }}>
                <BookOpen size={18} /> Entrer en classe
              </button>
            </>
          ) : (
            <>
              <div style={labelStyle}>Code PIN professeur</div>
              <input className="lp-input" type="password" style={{ ...inputStyle, margin: "4px 0 28px" }} value={pin}
                onChange={(e) => setPin(e.target.value)} placeholder="Défini à la première connexion"
                onKeyDown={(e) => e.key === "Enter" && loginTeacher()} />
              <button onClick={loginTeacher}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontWeight: 700, fontSize: 15.5, color: "#fff",
                  background: `linear-gradient(135deg, ${NAVY}, #2b4cad)`,
                  boxShadow: "0 10px 24px rgba(30,58,138,.38), inset 0 1px 0 rgba(255,255,255,.25)" }}>
                <GraduationCap size={18} /> Ouvrir le tableau de bord
              </button>
            </>
          )}
          {msg && <p style={{ color: "#C0392B", fontSize: 13, marginTop: 16, marginBottom: 0, textAlign: "center" }}>{msg}</p>}
        </div>

        <p style={{ fontSize: 12, color: "#9A937F", textAlign: "center", marginTop: 16 }}>
          Seuls les élèves dont le compte a été créé par le professeur peuvent se connecter.
        </p>
      </div>

      {/* 💬 Câu động lực — fade đổi câu mỗi 7s */}
      <div style={{ position: "absolute", bottom: 58, left: "50%", transform: "translateX(-50%)", zIndex: 2,
        width: "min(92vw, 620px)", textAlign: "center" }}>
        <p style={{ fontSize: 14, fontStyle: "italic", color: "#9CA3AF", margin: 0, lineHeight: 1.6,
          opacity: quoteVisible ? 1 : 0, transition: "opacity .5s ease" }}>
          {QUOTES[quoteIdx]}
        </p>
      </div>

      {/* Cờ Pháp dưới cùng */}
      <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 2 }}>
        <FlagFR w={42} />
      </div>
    </div>
  );
}

/* ================= Teacher ================= */
function Teacher({ exercises, setExercises, submissions, setSubmissions, accounts, setAccounts, refresh }) {
  const [view, setView] = useState("list");
  const [draft, setDraft] = useState(null);

  const tabs = [["list", "📚 Exercices"], ["students", "👥 Élèves"], ["stats", "📊 Statistiques"], ["practice", "🏋️ Entraînement"]];
  const blank = () => ({ id: uid(), title: "", level: "B1", skill: "Grammaire", deadline: "", audioUrl: "", readingText: "", imageUrl: "", timeLimit: "", assignedTo: null, createdAt: Date.now(), questions: [] });

  const publish = async () => {
    const others = exercises.filter((e) => e.id !== draft.id);
    const next = [...others, draft].sort((a, b) => a.createdAt - b.createdAt);
    setExercises(next); await save("mcf-exercises", next); setView("list");
  };
  const remove = async (id) => {
    const next = exercises.filter((e) => e.id !== id);
    setExercises(next); await save("mcf-exercises", next);
  };

  if (view === "new") return <Builder draft={draft} setDraft={setDraft} publish={publish} cancel={() => setView("list")} accounts={accounts} />;
  if (view.startsWith("progress:")) {
    const ex = exercises.find((e) => e.id === view.slice(9));
    return <Progress ex={ex} submissions={submissions} setSubmissions={setSubmissions} accounts={accounts} back={() => setView("list")} />;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tabs.map(([k, l]) => <button key={k} onClick={() => setView(k)} style={{ ...S.btn(view === k), padding: "8px 14px" }}>{l}</button>)}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.btn(false)} onClick={refresh}>↻ Actualiser</button>
          {view === "list" && <button style={S.btn(true)} onClick={() => { setDraft(blank()); setView("new"); }}>+ Nouvel exercice</button>}
        </div>
      </div>

      {view === "students" && <Accounts accounts={accounts} setAccounts={setAccounts} />}
      {view === "practice" && <PracticeHub role="prof" />}
      {view === "stats" && <Stats accounts={accounts} exercises={exercises} submissions={submissions} />}
      {view === "list" && (
        exercises.length === 0 ? (
          <div className="mcf-card" style={{ ...S.card, textAlign: "center", padding: 40, color: C.soft }}>
            Aucun exercice pour le moment. Créez le premier avec « + Nouvel exercice ».
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {exercises.map((ex) => {
              const subs = submissions.filter((s) => s.exerciseId === ex.id && !s.redo);
              const toGrade = subs.filter((s) => !s.graded && ex.questions.some((q) => q.type === "open")).length;
              const late = isLate(ex);
              const targets = targetedAccounts(ex, accounts);
              return (
                <div key={ex.id} className="mcf-card" style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <span style={S.badge(ex.level)}>{ex.level}</span>
                    <span style={S.chip(C.primarySoft, C.primary)}>{ex.skill}</span>{" "}
                    <strong style={{ fontSize: 17 }}>{ex.title}</strong>
                    <div style={{ fontSize: 12, color: C.soft, marginTop: 5 }}>
                      {ex.questions.length} question(s) · {subs.length}/{targets.length} copies
                      {ex.assignedTo?.length ? <span style={{ color: C.primary, fontWeight: 700 }}> · 👤 {ex.assignedTo.join(", ")}</span> : " · 👥 toute la classe"}
                      {toGrade > 0 && <span style={{ color: C.accent, fontWeight: 700 }}> · ✏️ {toGrade} à corriger</span>}
                      {ex.deadline && <span style={{ color: late ? C.danger : C.warn, fontWeight: 700 }}> · ⏰ {fmtDate(ex.deadline)}{late && " (clôturé)"}</span>}
                      {ex.audioUrl && " · 🎧 audio"}
                      {ex.timeLimit && <span style={{ fontWeight: 700 }}> · ⏱ {ex.timeLimit} min</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button style={S.btn(true)} onClick={() => setView("progress:" + ex.id)}>Suivi & correction</button>
                    <KebabMenu items={[
                      { label: "Modifier", icon: <Pencil size={16} />, onClick: () => { setDraft(JSON.parse(JSON.stringify(ex))); setView("new"); } },
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
    </div>
  );
}

/* ================= Accounts ================= */
function Accounts({ accounts, setAccounts }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const [presence, setPresence] = useState({});
  const [, forceTick] = useState(0);

  // Nạp presence + tự làm mới mỗi 60 giây
  useEffect(() => {
    const fetchP = () => load("mcf-presence", {}).then(setPresence);
    fetchP();
    const t = setInterval(() => { fetchP(); forceTick((x) => x + 1); }, 60_000);
    return () => clearInterval(t);
  }, []);

  const add = async () => {
    const n = name.trim(), c = code.trim();
    if (!n || c.length < 4) { setMsg("Prénom requis et mot de passe d'au moins 4 caractères."); return; }
    if (accounts.some((a) => a.name.toLowerCase() === n.toLowerCase())) { setMsg("Ce prénom existe déjà."); return; }
    const next = [...accounts, { name: n, code: c }];
    setAccounts(next); await save("mcf-accounts", next);
    setName(""); setCode(""); setMsg("");
  };
  const delAcc = async (n) => {
    const next = accounts.filter((a) => a.name !== n);
    setAccounts(next); await save("mcf-accounts", next);
  };
  const reset = async (n) => {
    const c = prompt(`Nouveau mot de passe pour ${n} :`);
    if (!c || c.trim().length < 4) return;
    const next = accounts.map((a) => (a.name === n ? { ...a, code: c.trim() } : a));
    setAccounts(next); await save("mcf-accounts", next);
  };

  return (
    <div>
      <div className="mcf-card" style={{ ...S.card, marginBottom: 16 }}>
        <div style={S.label}>Créer un compte élève (l'élève pourra changer son mot de passe)</div>
        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <input style={{ ...S.input, flex: "1 1 160px" }} value={name} placeholder="Prénom de l'élève" onChange={(e) => setName(e.target.value)} />
          <input style={{ ...S.input, flex: "1 1 160px" }} value={code} placeholder="Mot de passe initial (min. 4)" onChange={(e) => setCode(e.target.value)} />
          <button style={S.btn(true)} onClick={add}>Créer le compte</button>
        </div>
        {msg && <p style={{ color: C.danger, fontSize: 13, marginTop: 10, marginBottom: 0 }}>{msg}</p>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: C.soft }}>{accounts.length} compte(s)</span>
        <button style={{ ...S.btn(false), fontSize: 12, padding: "5px 10px" }} onClick={() => setShow(!show)}>
          {show ? "Masquer les mots de passe" : "Afficher les mots de passe"}
        </button>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {accounts.map((a) => (
          <div key={a.name} className="mcf-card" style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <strong>{a.name}</strong>
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
              <span style={{ fontSize: 13, color: C.soft }}>mot de passe : {show ? a.code : "••••"}</span>
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btn(false), padding: "5px 12px", fontSize: 12 }} onClick={() => reset(a.name)}>Réinitialiser</button>
              <button style={{ ...S.btn(false, true), padding: "5px 12px", fontSize: 12 }} onClick={() => delAcc(a.name)}>Supprimer</button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && <p style={{ color: C.soft }}>Aucun compte. Les élèves ne peuvent pas encore se connecter.</p>}
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
    return { name: ex.title.length > 16 ? ex.title.slice(0, 15) + "…" : ex.title, full: ex.title, skill: ex.skill, moyenne: mean == null ? null : Math.round(mean), ecartType: Math.round(sd * 10) / 10, copies: pcts.length };
  });

  const radar = SKILLS.map((skill) => {
    const pcts = [];
    exercises.filter((e) => e.skill === skill).forEach((ex) => {
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
          <div style={S.label}>Moyenne & écart-type par exercice</div>
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
                <Bar dataKey="ecartType" name="Écart-type" fill={C.accent} radius={[6, 6, 0, 0]} />
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
      {accounts.length === 0 ? <p style={{ color: C.soft }}>Aucun élève inscrit.</p> : (
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
      <p style={{ fontSize: 12, color: C.soft, marginTop: 10, marginBottom: 0 }}>⏳ = réponses libres pas encore corrigées · 🕐 = rendu en retard · « · » = bài không giao cho học sinh này · 🔁 = yêu cầu làm lại</p>
    </div>
  );
}

/* ================= Builder ================= */
function Builder({ draft, setDraft, publish, cancel, accounts }) {
  const fileRef = React.useRef(null);
  const [importMsg, setImportMsg] = useState("");
  const [imgMsg, setImgMsg] = useState("");

  // Đọc file ảnh → base64 (giới hạn 1,5 MB để không vượt hạn mức lưu trữ)
  const handleImageFile = (file) => {
    setImgMsg("");
    if (!file.type.startsWith("image/")) { setImgMsg("⚠ Fichier non valide — choisissez une image."); return; }
    if (file.size > 1.5 * 1024 * 1024) { setImgMsg("⚠ Ảnh quá lớn (>1,5 MB). Hãy nén lại hoặc dán URL ảnh online."); return; }
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const importDocx = async (file) => {
    if (!file) return;
    setImportMsg("⏳ Đang đọc file…");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { value: raw } = await mammoth.extractRawText({ arrayBuffer });
      const { readingText, questions } = parseDocxText(raw);
      if (!questions.length) {
        setImportMsg("⚠ Không tìm thấy câu hỏi. Kiểm tra file có dòng ---QUESTIONS--- và câu hỏi dạng « 1. », đáp án « A. » (đáp án đúng thêm * ở cuối).");
        return;
      }
      setDraft({
        ...draft,
        title: draft.title || file.name.replace(/\.docx$/i, "").replace(/[_-]+/g, " "),
        skill: "Lecture",
        readingText,
        questions: [...draft.questions, ...questions],
      });
      setImportMsg(`✅ Đã import : bài đọc (${readingText.split(/\s+/).length} mots) + ${questions.length} câu hỏi. Hãy kiểm tra lại rồi bấm Publier.`);
    } catch (e) {
      setImportMsg("❌ Lỗi đọc file : " + e.message);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const addQ = (type) => {
    const base = { id: uid(), type, prompt: "" };
    const q = type === "qcm" ? { ...base, options: ["", "", "", ""], answer: 0 }
      : type === "open" ? { ...base, model: "" }
      : { ...base, accepted: "" }; // fill & conj
    setDraft({ ...draft, questions: [...draft.questions, q] });
  };
  const setQ = (id, patch) => setDraft({ ...draft, questions: draft.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) });
  const delQ = (id) => setDraft({ ...draft, questions: draft.questions.filter((q) => q.id !== id) });

  const ready = draft.title.trim() && draft.questions.length > 0 &&
    (!draft.assignedTo || draft.assignedTo.length > 0) &&
    draft.questions.every((q) => q.prompt.trim() &&
      (q.type === "qcm" ? q.options.length >= 2 && q.options.every((o) => o.trim()) : true) &&
      ((q.type === "fill" || q.type === "conj") ? q.accepted.trim() : true));

  const hint = {
    fill: "Écrivez la phrase avec ______ pour le trou. Réponses acceptées séparées par | (ex. « vais|me rends »).",
    conj: "Ex. de consigne : « Hier, nous (aller) ______ au cinéma. » Réponses acceptées séparées par | (ex. « sommes allés|sommes allées »).",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ ...S.display, marginTop: 0, marginBottom: 0 }}>{draft.title ? "Modifier l'exercice" : "Nouvel exercice"}</h2>
        {draft.skill === "Lecture" && (
        <div>
          <input ref={fileRef} type="file" accept=".docx" style={{ display: "none" }}
            onChange={(e) => importDocx(e.target.files?.[0])} />
          <button style={S.btn(false)} onClick={() => fileRef.current?.click()}>📄 Import DOCX (bài đọc CE)</button>
        </div>
        )}
      </div>
      {importMsg && (
        <div className="mcf-card" style={{ ...S.card, margin: "12px 0", padding: "10px 16px", fontSize: 13.5,
          borderLeft: `3px solid ${importMsg.startsWith("✅") ? C.ok : importMsg.startsWith("⏳") ? C.primary : C.danger}` }}>
          {importMsg}
          <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>
            Định dạng file Word : bài đọc ở trên → dòng <b>---QUESTIONS---</b> → «&nbsp;1. Câu hỏi&nbsp;» với đáp án «&nbsp;A. …&nbsp;», «&nbsp;B. …&nbsp;» ; đáp án đúng kết thúc bằng dấu <b>*</b>.
          </div>
        </div>
      )}
      <div className="mcf-card" style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "2 1 240px" }}>
            <div style={S.label}>Titre</div>
            <input style={{ ...S.input, marginTop: 6 }} value={draft.title} placeholder="ex. Passé composé — les transports"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <div style={S.label}>Niveau</div>
            <select style={{ ...S.input, marginTop: 6 }} value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })}>
              {Object.keys(LEVEL_COLORS).map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <div style={S.label}>Compétence</div>
            <select style={{ ...S.input, marginTop: 6 }} value={draft.skill}
              onChange={(e) => {
                const v = e.target.value;
                // Ẩn trường nào thì reset dữ liệu trường đó về rỗng
                setDraft({ ...draft, skill: v,
                  audioUrl: v === "Écoute" ? draft.audioUrl : "",
                  readingText: v === "Lecture" ? draft.readingText : "" });
              }}>
              {SKILLS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div style={S.label}>Date limite (optionnel)</div>
            <input type="datetime-local" style={{ ...S.input, marginTop: 6 }} value={draft.deadline}
              onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
          </div>
          <div>
            <div style={S.label}>⏱ Temps limite (min)</div>
            <input type="number" min="1" style={{ ...S.input, marginTop: 6, width: 110 }} value={draft.timeLimit || ""}
              placeholder="∞" onChange={(e) => setDraft({ ...draft, timeLimit: e.target.value })} />
          </div>
        </div>
        {/* 🖼 Image d'illustration (optionnel) — URL hoặc kéo thả file */}
        <div style={{ marginTop: 14 }}>
          <div style={S.label}>🖼 Image d'illustration (optionnel)</div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", alignItems: "stretch" }}>
            <input style={{ ...S.input, flex: "1 1 260px" }} value={draft.imageUrl || ""}
              placeholder="https://…/image.jpg"
              onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} />
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleImageFile(f);
              }}
              style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "14px 16px", borderRadius: 20, cursor: "pointer",
                border: `2px dashed ${C.line}`, background: "var(--mcf-surface2)", color: C.soft, fontSize: 12.5, textAlign: "center" }}>
              <ImageIcon size={22} color={C.soft} />
              Collez l'URL de l'image ou téléversez un fichier
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
            </label>
          </div>
          {imgMsg && <div style={{ fontSize: 12.5, color: C.danger, marginTop: 6 }}>{imgMsg}</div>}
          {draft.imageUrl && (
            <div style={{ position: "relative", display: "inline-block", marginTop: 12 }}>
              <img src={draft.imageUrl} alt="aperçu"
                onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
                style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 16, boxShadow: "0 4px 14px rgba(17,24,39,.12)", objectFit: "contain", display: "block" }} />
              <button title="Retirer l'image" onClick={() => setDraft({ ...draft, imageUrl: "" })}
                style={{ position: "absolute", top: -10, right: -10, width: 28, height: 28, borderRadius: "50%",
                  border: "none", background: C.danger, color: "#fff", cursor: "pointer", display: "grid",
                  placeItems: "center", boxShadow: "0 4px 10px rgba(222,75,75,.4)" }}>
                <X size={15} />
              </button>
            </div>
          )}
        </div>

        {draft.skill === "Écoute" && (
        <div style={{ marginTop: 12 }}>
          <div style={S.label}>Lien audio pour compréhension orale (optionnel — URL mp3)</div>
          <input style={{ ...S.input, marginTop: 6 }} value={draft.audioUrl} placeholder="https://…/audio.mp3"
            onChange={(e) => setDraft({ ...draft, audioUrl: e.target.value })} />
          <div style={{ fontSize: 12, color: C.soft, marginTop: 5 }}>💡 Mẹo tải file mp3 của bạn: upload vào Supabase Storage (bucket public) hoặc Google Drive (link chia sẻ trực tiếp) rồi dán URL vào đây.</div>
        </div>
        )}

        {draft.skill === "Lecture" && (
        <div style={{ marginTop: 12 }}>
          <div style={S.label}>📖 Texte de lecture (CE — optionnel) : dán bài đọc vào đây, học sinh sẽ thấy bố cục 2 cột (văn bản | câu hỏi)</div>
          <textarea style={{ ...S.input, marginTop: 6, minHeight: 110, resize: "vertical" }} value={draft.readingText || ""}
            placeholder="Collez ici l'article ou le texte à lire…"
            onChange={(e) => setDraft({ ...draft, readingText: e.target.value })} />
        </div>
        )}

        <div style={{ marginTop: 14 }}>
          <div style={S.label}>Destinataires — Giao bài cho ai ?</div>
          <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, cursor: "pointer" }}>
              <input type="radio" checked={!draft.assignedTo}
                onChange={() => setDraft({ ...draft, assignedTo: null })} />
              👥 Toute la classe (tất cả học sinh)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, cursor: "pointer" }}>
              <input type="radio" checked={!!draft.assignedTo}
                onChange={() => setDraft({ ...draft, assignedTo: [] })} />
              👤 Élèves choisis (chọn học sinh cụ thể)
            </label>
          </div>
          {draft.assignedTo && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, background: "var(--mcf-surface2)", border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px" }}>
              {accounts.length === 0 && <span style={{ fontSize: 13, color: C.soft }}>Aucun élève inscrit.</span>}
              {accounts.map((a) => {
                const on = draft.assignedTo.includes(a.name);
                return (
                  <label key={a.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, cursor: "pointer",
                    padding: "6px 12px", borderRadius: 999, fontWeight: 600,
                    border: `1.5px solid ${on ? C.primary : C.line}`,
                    background: on ? C.primarySoft : "#fff", color: on ? C.primary : C.ink }}>
                    <input type="checkbox" checked={on} style={{ display: "none" }}
                      onChange={() => setDraft({ ...draft, assignedTo: on ? draft.assignedTo.filter((n) => n !== a.name) : [...draft.assignedTo, a.name] })} />
                    {on ? "✓ " : ""}{a.name}
                  </label>
                );
              })}
              {draft.assignedTo.length === 0 && accounts.length > 0 &&
                <span style={{ fontSize: 12.5, color: C.warn, fontWeight: 700, alignSelf: "center" }}>⚠ Chưa chọn học sinh nào — bấm vào tên để chọn.</span>}
            </div>
          )}
        </div>
      </div>

      {draft.questions.map((q, i) => (
        <div key={q.id} className="mcf-card" style={{ ...S.card, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={S.label}>Question {i + 1} — {QTYPES[q.type]}{autoQ(q) && " (corrigé automatique)"}</span>
            <button style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }} onClick={() => delQ(q.id)}>retirer</button>
          </div>
          <textarea style={{ ...S.input, minHeight: 54, resize: "vertical" }} value={q.prompt}
            placeholder={q.type === "fill" || q.type === "conj" ? hint[q.type] : q.type === "qcm" ? "Énoncé de la question…" : "Consigne (ex. phrase à traduire)…"}
            onChange={(e) => setQ(q.id, { prompt: e.target.value })} />
          {q.type === "qcm" && (
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {q.options.map((o, j) => (
                <div key={j} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="radio" checked={q.answer === j} onChange={() => setQ(q.id, { answer: j })} title="Bonne réponse" />
                  <span style={{ fontWeight: 700, width: 20 }}>{String.fromCharCode(65 + j)}.</span>
                  <input style={S.input} value={o} placeholder={`Option ${String.fromCharCode(65 + j)}`}
                    onChange={(e) => setQ(q.id, { options: q.options.map((x, k) => (k === j ? e.target.value : x)) })} />
                  <button type="button" title={q.options.length > 2 ? "Supprimer cette option" : "Minimum 2 options"}
                    disabled={q.options.length <= 2}
                    onClick={() => {
                      const options = q.options.filter((_, k) => k !== j);
                      const answer = q.answer === j ? 0 : q.answer > j ? q.answer - 1 : q.answer;
                      setQ(q.id, { options, answer });
                    }}
                    style={{ border: "none", background: "transparent", cursor: q.options.length > 2 ? "pointer" : "not-allowed",
                      opacity: q.options.length > 2 ? 0.55 : 0.18, padding: 6, display: "grid", placeItems: "center" }}
                    onMouseEnter={(e) => { if (q.options.length > 2) e.currentTarget.style.opacity = 1; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = q.options.length > 2 ? 0.55 : 0.18; }}>
                    <Trash2 size={17} color={C.danger} />
                  </button>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button type="button" disabled={q.options.length >= 6}
                  onClick={() => setQ(q.id, { options: [...q.options, ""] })}
                  style={{ ...S.btn(false), padding: "7px 16px", fontSize: 13, opacity: q.options.length >= 6 ? 0.4 : 1 }}>
                  + Ajouter une option
                </button>
                <span style={{ fontSize: 12, color: C.soft }}>2-6 options · cochez la bonne réponse à gauche.</span>
              </div>
            </div>
          )}
          {(q.type === "fill" || q.type === "conj") && (
            <div style={{ marginTop: 10 }}>
              <div style={S.label}>Réponse(s) acceptée(s) — séparées par |</div>
              <input style={{ ...S.input, marginTop: 6 }} value={q.accepted} placeholder="ex. suis allé|suis allée"
                onChange={(e) => setQ(q.id, { accepted: e.target.value })} />
            </div>
          )}
          {q.type === "open" && (
            <div style={{ marginTop: 10 }}>
              <div style={S.label}>Réponse modèle (visible pour vous seulement)</div>
              <textarea style={{ ...S.input, marginTop: 6, minHeight: 44, resize: "vertical" }} value={q.model}
                onChange={(e) => setQ(q.id, { model: e.target.value })} />
            </div>
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <button style={S.btn(false)} onClick={() => addQ("qcm")}>+ QCM</button>
        <button style={S.btn(false)} onClick={() => addQ("fill")}>+ Texte à trous</button>
        <button style={S.btn(false)} onClick={() => addQ("conj")}>+ Conjugaison</button>
        <button style={S.btn(false)} onClick={() => addQ("open")}>+ Réponse libre</button>
        <button style={S.btn(false)} onClick={() => setDraft({ ...draft, questions: [...draft.questions, { id: uid(), type: "qcm", prompt: "", options: ["Vrai", "Faux", "On ne sait pas"], answer: 0 }] })}>+ Vrai / Faux / ?</button>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ ...S.btn(true), opacity: ready ? 1 : 0.4 }} disabled={!ready} onClick={publish}>Publier l'exercice</button>
        <button style={S.btn(false)} onClick={cancel}>Annuler</button>
      </div>
    </div>
  );
}

/* ================= Progress & grading ================= */
function Progress({ ex, submissions, setSubmissions, accounts, back }) {
  const [open, setOpen] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [qDrafts, setQDrafts] = useState({});
  const [marks, setMarks] = useState({});
  if (!ex) return null;
  const subs = submissions.filter((s) => s.exerciseId === ex.id && !s.redo);
  const byName = Object.fromEntries(submissions.filter((s) => s.exerciseId === ex.id).map((s) => [s.student, s]));
  const opens = ex.questions.filter((q) => q.type === "open");
  const roster = targetedAccounts(ex, accounts);

  const [attachDrafts, setAttachDrafts] = useState({});
  const [redoFor, setRedoFor] = useState(null); // tên học sinh đang yêu cầu làm lại
  const [redoNote, setRedoNote] = useState("");

  // 🔁 Yêu cầu làm lại : reset điểm, đổi trạng thái sang redo + lưu lý do
  const requestRedo = async (student) => {
    const latest = await load("mcf-submissions", []);
    const next = latest.map((s) => {
      if (!(s.exerciseId === ex.id && s.student === student)) return s;
      return { ...s, redo: true, redoNote: redoNote.trim(), graded: false, openMarks: {}, autoScore: 0 };
    });
    await save("mcf-submissions", next);
    setSubmissions(next); setRedoFor(null); setRedoNote("");
  };

  const saveGrading = async (student) => {
    const sub = byName[student];
    const latest = await load("mcf-submissions", []);
    const next = latest.map((s) => {
      if (!(s.exerciseId === ex.id && s.student === student)) return s;
      return {
        ...s,
        comment: (drafts[student] ?? s.comment ?? ""),
        feedbackUrl: (attachDrafts[student] ?? s.feedbackUrl ?? "").trim(),
        qComments: { ...(s.qComments || {}), ...(qDrafts[student] || {}) },
        openMarks: { ...(s.openMarks || {}), ...(marks[student] || {}) },
        graded: true,
      };
    });
    await save("mcf-submissions", next);
    setSubmissions(next);
  };

  return (
    <div>
      <button style={{ ...S.btn(false), marginBottom: 16 }} onClick={back}>← Retour</button>
      <h2 style={{ ...S.display, marginTop: 0 }}>{ex.title} <span style={{ fontSize: 13, color: C.soft, fontFamily: "'Be Vietnam Pro',sans-serif" }}>({ex.level} · {ex.skill})</span></h2>
      {ex.deadline && <p style={{ fontSize: 13, color: isLate(ex) ? C.danger : C.warn, fontWeight: 700 }}>⏰ Date limite : {fmtDate(ex.deadline)}{isLate(ex) && " — les rendus tardifs sont marqués 🕐"}</p>}

      <div className="mcf-card" style={{ ...S.card, marginBottom: 20 }}>
        <div style={S.label}>Progression de la classe</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>{subs.length} copie(s) rendue(s) sur {roster.length} élève(s) concerné(s)
          {ex.assignedTo?.length ? <span style={{ color: C.primary, fontWeight: 700 }}> · 👤 devoir individuel</span> : null}</div>
        <div style={{ height: 10, background: C.line, borderRadius: 99, marginTop: 8 }}>
          <div style={{ height: "100%", width: `${roster.length ? (subs.length / roster.length) * 100 : 0}%`, background: `linear-gradient(90deg, ${C.ok}, #37C48E)`, borderRadius: 99 }} />
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
                    <span style={{ color: C.ok, fontWeight: 700 }}>Rendu</span>
                    {" · "}<strong>{t.score}/{t.max}{t.pending && " ⏳"}</strong>
                    {" · "}{fmtDate(sub.at)}
                    {sub.timedOut && " · ⏱ auto (hết giờ)"}
                    {sub.graded && " · ✅ corrigé"}
                    <button style={{ ...S.btn(false), marginLeft: 12, padding: "4px 10px", fontSize: 12 }}
                      onClick={() => setOpen(open === name ? null : name)}>{open === name ? "Fermer" : "Corriger / voir"}</button>
                  </span>
                ) : <span style={{ fontSize: 13, color: C.danger, fontWeight: 700 }}>Pas encore rendu</span>}
              </div>

              {sub && open === name && (
                <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 12, display: "grid", gap: 14 }}>
                  {ex.questions.map((q, i) => {
                    const a = sub.answers[q.id];
                    const good = q.type === "qcm" ? a === q.answer : (q.type === "fill" || q.type === "conj") ? fillOk(q, a) : null;
                    return (
                      <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.line}` }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                        <div style={{ fontSize: 14 }}>
                          Réponse : {q.type === "qcm"
                            ? <strong style={{ color: good ? C.ok : C.danger }}>{a != null ? String.fromCharCode(65 + a) + ". " + q.options[a] : "—"}</strong>
                            : q.type === "open"
                            ? <div style={{ marginTop: 6, background: "var(--mcf-surface)", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: a || "—" }} />
                            : <em style={{ color: good ? C.ok : C.danger }}>{a || "—"}</em>}
                          {good === false && q.type === "qcm" && <span> · attendu : <strong>{String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}</strong></span>}
                          {good === false && (q.type === "fill" || q.type === "conj") && <span> · attendu : <strong>{q.accepted.split("|")[0]}</strong></span>}
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
                          placeholder="Commentaire sur cette question (visible par l'élève)…"
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
                      <div style={S.label}>📎 Joindre un fichier (optionnel) — URL bản chữa bài (PDF, DOCX, ảnh…)</div>
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
                        Enregistrer la correction {opens.length > 0 && "et la note"}
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
            <p style={{ fontSize: 13.5, color: C.soft, marginTop: 0 }}>La note sera remise à zéro et l'exercice retournera dans « À faire » de l'élève.</p>
            <div style={S.label}>Lý do / Remarque (hiện trên dashboard học sinh)</div>
            <textarea style={{ ...S.input, marginTop: 6, minHeight: 70, resize: "vertical" }} value={redoNote}
              placeholder="ex. Attention à l'accord du participe passé — refais les questions 3 et 5."
              onChange={(e) => setRedoNote(e.target.value)} autoFocus />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button style={{ ...S.btn(true), background: `linear-gradient(135deg, ${C.warn}, #E09A2B)`, boxShadow: "0 6px 16px rgba(201,132,18,.35)" }}
                onClick={() => requestRedo(redoFor)}>Confirmer</button>
              <button style={S.btn(false)} onClick={() => setRedoFor(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Student ================= */
function Student({ name, exercises, submissions, setSubmissions, accounts, setAccounts, refresh }) {
  const [taking, setTaking] = useState(null);

  // 🟢 Presence heartbeat : cập nhật last_active_at (debounce 90s) khi có tương tác
  useEffect(() => {
    let lastBeat = 0;
    const beat = async () => {
      lastBeat = Date.now();
      try {
        const p = await load("mcf-presence", {});
        p[name] = Date.now();
        await save("mcf-presence", p);
      } catch {}
    };
    const onActivity = () => { if (Date.now() - lastBeat > 90_000) beat(); };
    beat(); // đánh dấu online ngay khi vào
    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, onActivity));
  }, [name]);
  const [tab, setTab] = useState("todo");
  const [showPw, setShowPw] = useState(false);
  const mine = (exId) => submissions.find((s) => s.exerciseId === exId && s.student === name);
  const mineDone = (exId) => { const s0 = mine(exId); return s0 && !s0.redo ? s0 : null; };

  if (taking) return <Taking ex={taking} name={name} setSubmissions={setSubmissions} done={() => { setTaking(null); refresh(); }} />;

  const visible = exercises.filter((ex) => assignedTo(ex, name));
  const todo = visible.filter((ex) => !mineDone(ex.id))
    .sort((a, b) => (a.deadline ? new Date(a.deadline) : Infinity) - (b.deadline ? new Date(b.deadline) : Infinity));
  const doneList = visible.filter((ex) => mineDone(ex.id));
  const gradedList = doneList.filter((ex) => mine(ex.id).graded || !ex.questions.some((q) => q.type === "open"));

  const myScores = visible.map((ex, i) => {
    const s = mineDone(ex.id); if (!s) return null;
    const t = totalScore(s, ex); if (!t.max) return null;
    return { name: `Ex.${i + 1}`, full: ex.title, pct: Math.round((t.score / t.max) * 100), at: s.at };
  }).filter(Boolean).sort((a, b) => a.at - b.at);

  const radar = SKILLS.map((skill) => {
    const pcts = [];
    visible.filter((e) => e.skill === skill).forEach((ex) => {
      const s = mineDone(ex.id); if (!s) return;
      const t = totalScore(s, ex); if (t.max) pcts.push((t.score / t.max) * 100);
    });
    return { skill, moi: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0 };
  });

  const stamps = visible.filter((ex) => {
    const s = mineDone(ex.id); if (!s) return false;
    const t = totalScore(s, ex); return t.max && t.score / t.max >= 0.8;
  }).length;
  const JOURNEY = [
    { need: 1, icon: "🥐", label: "La boulangerie" }, { need: 3, icon: "🚉", label: "Gare de Lyon" },
    { need: 5, icon: "🖼️", label: "Le Louvre" }, { need: 8, icon: "🗼", label: "Tour Eiffel" },
    { need: 12, icon: "✈️", label: "Départ pour Paris !" },
  ];

  const tabs = [["todo", `📝 À faire (${todo.length})`], ["done", `📤 Rendus (${doneList.length})`], ["practice", "🏋️ Tự luyện"], ["progress", "📈 Ma progression"], ["settings", "⚙️ Mon compte"]];

  const changePw = async (oldPw, newPw, setMsg) => {
    const acc = accounts.find((a) => a.name === name);
    if (acc.code !== oldPw) { setMsg("Ancien mot de passe incorrect."); return; }
    if (newPw.trim().length < 4) { setMsg("Le nouveau mot de passe doit faire au moins 4 caractères."); return; }
    const latest = await load("mcf-accounts", []);
    const next = latest.map((a) => (a.name === name ? { ...a, code: newPw.trim() } : a));
    await save("mcf-accounts", next); setAccounts(next);
    setMsg("✅ Mot de passe modifié !");
  };

  const Card = ({ ex }) => {
    const subRaw = mine(ex.id);
    const redo = subRaw?.redo;
    const sub = redo ? null : subRaw;
    const late = isLate(ex);
    const t = sub && totalScore(sub, ex);
    return (
      <div className="mcf-card" style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <span style={S.badge(ex.level)}>{ex.level}</span>
            <span style={S.chip(C.primarySoft, C.primary)}>{ex.skill}</span>{" "}
            <strong style={{ fontSize: 16 }}>{ex.title}</strong>
            <div style={{ fontSize: 12, color: C.soft, marginTop: 5 }}>
              {ex.questions.length} question(s){ex.audioUrl && " · 🎧"}{ex.timeLimit && ` · ⏱ ${ex.timeLimit} min`}
              {ex.deadline && <span style={{ color: late ? C.danger : C.warn, fontWeight: 700 }}> · ⏰ {late ? "en retard si rendu maintenant" : `avant le ${fmtDate(ex.deadline)}`}</span>}
            </div>
          </div>
          {sub ? (
            <span style={{ fontSize: 13, fontWeight: 700, color: t.pending ? C.warn : C.ok }}>
              {t.pending ? `⏳ ${t.score}/${t.max} (en attente de correction)` : `✓ ${t.score}/${t.max}`}{sub.late && " 🕐"}
            </span>
          ) : (
            <button style={S.btn(true)} onClick={() => setTaking(ex)}>Commencer</button>
          )}
        </div>
        {redo && (
          <div style={{ marginTop: 12, background: C.warnSoft, border: `2px solid ${C.warn}`, borderRadius: 16, padding: "12px 16px", fontSize: 14, fontWeight: 600 }}>
            🔁 <strong>Le professeur te demande de refaire cet exercice.</strong>
            {subRaw.redoNote && <div style={{ marginTop: 4, fontWeight: 400 }}>💬 {subRaw.redoNote}</div>}
          </div>
        )}
        {sub?.comment && (
          <div style={{ marginTop: 12, background: C.warnSoft, border: `1px solid ${C.warn}44`, borderRadius: 12, padding: "10px 14px", fontSize: 14 }}>
            💬 <strong>Professeur :</strong> {sub.comment}
          </div>
        )}
        {sub?.feedbackUrl && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            background: C.primarySoft, border: `1px solid ${C.primary}33`, borderRadius: 16, padding: "12px 16px" }}>
            <span style={{ fontSize: 22 }}>📄</span>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, letterSpacing: 0.5, textTransform: "uppercase" }}>Correction du professeur</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, wordBreak: "break-all" }}>{fileNameFromUrl(sub.feedbackUrl)}</div>
            </div>
            <a href={sub.feedbackUrl} target="_blank" rel="noopener noreferrer"
              style={{ ...S.btn(true), textDecoration: "none", fontSize: 13, padding: "9px 18px" }}>
              Voir le fichier ↗
            </a>
          </div>
        )}
        {sub && Object.values(sub.qComments || {}).some(Boolean) && (
          <details style={{ marginTop: 8, fontSize: 13 }}>
            <summary style={{ cursor: "pointer", color: C.primary, fontWeight: 600 }}>Voir les remarques question par question</summary>
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {ex.questions.map((q, i) => sub.qComments?.[q.id] ? (
                <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 8, padding: "8px 12px", border: `1px solid ${C.line}` }}>
                  <strong>Q{i + 1} :</strong> {sub.qComments[q.id]}
                </div>
              ) : null)}
            </div>
          </details>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} style={{ ...S.btn(tab === k), padding: "8px 14px" }}>{l}</button>)}
        <button style={{ ...S.btn(false), marginLeft: "auto" }} onClick={refresh}>↻ Actualiser</button>
      </div>

      {tab === "todo" && (
        todo.length === 0
          ? <div className="mcf-card" style={{ ...S.card, textAlign: "center", padding: 36, color: C.soft }}>🎉 Tout est rendu ! Aucun exercice en attente.</div>
          : <div style={{ display: "grid", gap: 14 }}>{todo.map((ex) => <Card key={ex.id} ex={ex} />)}</div>
      )}
      {tab === "done" && (
        doneList.length === 0
          ? <div className="mcf-card" style={{ ...S.card, textAlign: "center", padding: 36, color: C.soft }}>Aucune copie rendue pour l'instant.</div>
          : <div style={{ display: "grid", gap: 14 }}>{doneList.map((ex) => <Card key={ex.id} ex={ex} />)}</div>
      )}

      {tab === "progress" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="mcf-card" style={{ ...S.card }}>
            <div style={S.label}>🗺️ Mon voyage vers Paris — {stamps} timbre(s) collecté(s)</div>
            <div style={{ fontSize: 12.5, color: C.soft, margin: "6px 0 14px" }}>Obtiens 80 % ou plus à un exercice pour gagner un timbre !</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {JOURNEY.map((m, i) => {
                const got = stamps >= m.need;
                return (
                  <React.Fragment key={m.need}>
                    {i > 0 && <div style={{ flex: 1, minWidth: 18, height: 3, borderRadius: 2, background: got ? C.ok : C.line }} />}
                    <div style={{ textAlign: "center", opacity: got ? 1 : 0.45 }}>
                      <div style={{ fontSize: 26, filter: got ? "none" : "grayscale(1)" }}>{m.icon}</div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: got ? C.ink : C.soft }}>{m.label}</div>
                      <div style={{ fontSize: 10, color: C.soft }}>{m.need} 🏵️</div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="mcf-card" style={{ ...S.card }}>
            <div style={S.label}>Mes notes au fil du temps</div>
            {myScores.length === 0 ? <p style={{ color: C.soft, fontSize: 14 }}>Rends ta première copie pour voir ta courbe !</p> : (
              <div style={{ width: "100%", height: 240, marginTop: 10 }}>
                <ResponsiveContainer>
                  <LineChart data={myScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => v + " %"} labelFormatter={(l, p) => p?.[0]?.payload?.full || l} />
                    <Line type="monotone" dataKey="pct" name="Note (%)" stroke={C.primary} strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mcf-card" style={{ ...S.card }}>
            <div style={S.label}>Mes points forts par compétence</div>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <RadarChart data={radar}>
                  <PolarGrid stroke={C.line} />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Moi" dataKey="moi" stroke={C.accent} fill={C.accent} fillOpacity={0.35} />
                  <Tooltip formatter={(v) => v + " %"} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "practice" && <PracticeHub role="eleve" name={name} />}
      {tab === "settings" && <PasswordForm changePw={changePw} showPw={showPw} setShowPw={setShowPw} />}
    </div>
  );
}

function PasswordForm({ changePw }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <div className="mcf-card" style={{ ...S.card, maxWidth: 420 }}>
      <div style={S.label}>Changer mon mot de passe</div>
      <input style={{ ...S.input, margin: "10px 0" }} type="password" placeholder="Ancien mot de passe" value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
      <input style={{ ...S.input, marginBottom: 12 }} type="password" placeholder="Nouveau mot de passe (min. 4)" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
      <button style={S.btn(true)} onClick={() => changePw(oldPw, newPw, setMsg)}>Enregistrer</button>
      {msg && <p style={{ fontSize: 13, marginTop: 10, color: msg.startsWith("✅") ? C.ok : C.danger }}>{msg}</p>}
    </div>
  );
}

/* ================= Taking (with auto-save) ================= */
function Taking({ ex, name, setSubmissions, done }) {
  const draftKey = `mcf-draft-${ex.id}-${name}`;
  const startKey = `mcf-start-${ex.id}-${name}`;
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [err, setErr] = useState("");
  const [remaining, setRemaining] = useState(null); // giây còn lại (null = không giới hạn)
  const [locked, setLocked] = useState(false);
  const [zen, setZen] = useState(false); // 🧘 chế độ tập trung
  const answersRef = React.useRef(answers);
  answersRef.current = answers;

  // ⏱ Đồng hồ đếm ngược : giờ bắt đầu lưu lại để reload trang không reset
  useEffect(() => {
    if (!ex.timeLimit) return;
    let timer;
    (async () => {
      let started = await load(startKey, null, false);
      if (!started) { started = Date.now(); await save(startKey, started, false); }
      const limitMs = Number(ex.timeLimit) * 60 * 1000;
      const tick = () => {
        const left = Math.max(0, Math.round((started + limitMs - Date.now()) / 1000));
        setRemaining(left);
        if (left <= 0) { clearInterval(timer); setLocked(true); autoSubmit(); }
      };
      tick();
      timer = setInterval(tick, 1000);
    })();
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.id]);

  const autoSubmit = async () => {
    const a = answersRef.current;
    const autos = ex.questions.filter(autoQ);
    const autoScore = autos.reduce((n, q) =>
      n + (q.type === "qcm" ? (a[q.id] === q.answer ? 1 : 0) : (fillOk(q, a[q.id]) ? 1 : 0)), 0);
    const sub = {
      id: uid(), exerciseId: ex.id, student: name, answers: a,
      autoScore, autoMax: autos.length, openMarks: {}, qComments: {},
      late: isLate(ex), at: Date.now(), comment: "", graded: false, timedOut: true,
    };
    const latest = await load("mcf-submissions", []);
    const next = [...latest.filter((s) => !(s.exerciseId === ex.id && s.student === name)), sub];
    await save("mcf-submissions", next);
    setSubmissions(next); await del(draftKey); await del(startKey);
    setTimeout(done, 1800); // cho học sinh thấy thông báo hết giờ rồi thoát
  };

  const fmtLeft = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  useEffect(() => { load(draftKey, null, false).then((d) => d && setAnswers(d)); }, [draftKey]);
  useEffect(() => {
    const t = setTimeout(async () => {
      if (Object.keys(answers).length) { await save(draftKey, answers, false); setSavedAt(new Date()); }
    }, 1200);
    return () => clearTimeout(t);
  }, [answers, draftKey]);

  const allAnswered = ex.questions.every((q) =>
    q.type === "qcm" ? answers[q.id] != null
    : q.type === "open" ? stripHtml(answers[q.id]) !== ""
    : (answers[q.id] || "").trim() !== "");

  const submit = async () => {
    setSaving(true); setErr("");
    const autos = ex.questions.filter(autoQ);
    const autoScore = autos.reduce((n, q) =>
      n + (q.type === "qcm" ? (answers[q.id] === q.answer ? 1 : 0) : (fillOk(q, answers[q.id]) ? 1 : 0)), 0);
    const sub = {
      id: uid(), exerciseId: ex.id, student: name, answers,
      autoScore, autoMax: autos.length, openMarks: {}, qComments: {},
      late: isLate(ex), at: Date.now(), comment: "", graded: false,
    };
    const latest = await load("mcf-submissions", []);
    const next = [...latest.filter((s) => !(s.exerciseId === ex.id && s.student === name)), sub];
    const ok = await save("mcf-submissions", next);
    if (ok) { setSubmissions(next); await del(draftKey); await del(startKey); done(); }
    else { setErr("Impossible d'enregistrer la copie. Réessaie."); setSaving(false); }
  };

  const questionCards = ex.questions.map((q, i) => (
    <div key={q.id} className="mcf-card" style={S.card}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>
        <span style={S.chip(C.primarySoft, C.primary)}>{QTYPES[q.type]}</span> {i + 1}. {q.prompt}
      </div>
      {q.type === "qcm" ? (
        <div style={{ display: "grid", gap: 8 }}>
          {q.options.map((o, j) => (
            <label key={j} style={{ fontSize: 15, display: "flex", gap: 10, alignItems: "center", padding: "9px 13px", borderRadius: 10, cursor: "pointer",
              border: `1.5px solid ${answers[q.id] === j ? C.primary : C.line}`,
              background: answers[q.id] === j ? C.primarySoft : "#fff" }}>
              <input type="radio" name={q.id} disabled={locked} checked={answers[q.id] === j} onChange={() => setAnswers({ ...answers, [q.id]: j })} />
              <strong>{String.fromCharCode(65 + j)}.</strong> {o}
            </label>
          ))}
        </div>
      ) : q.type === "open" ? (
        <RichTextEditor value={answers[q.id] || ""} readOnly={locked} onChange={(html) => setAnswers({ ...answers, [q.id]: html })} />
      ) : (
        <input style={S.input} disabled={locked} placeholder="Ta réponse…" value={answers[q.id] || ""}
          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
      )}
    </div>
  ));

  return (
    <div style={zen ? { position: "fixed", inset: 0, zIndex: 90, background: "var(--mcf-bg)", overflowY: "auto", padding: "28px 16px 80px" } : undefined}>
      {/* 🧘 Nút thoát Zen nổi */}
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
      {/* ⏱ Đồng hồ đếm ngược trôi nổi */}
      {remaining != null && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100,
          display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999,
          background: remaining <= 300 ? C.danger : C.ink, color: "#fff", fontWeight: 800, fontSize: 17,
          boxShadow: "0 8px 22px rgba(27,37,89,.35)", fontVariantNumeric: "tabular-nums" }}>
          ⏱ {fmtLeft(remaining)}
        </div>
      )}
      {locked && (
        <div className="mcf-card" style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.danger}`, fontWeight: 700, color: C.danger }}>
          ⏰ Temps écoulé ! Ta copie a été rendue automatiquement.
        </div>
      )}
      <h2 style={{ ...S.display, marginTop: 0 }}>{ex.title} <span style={{ fontSize: 13, color: C.soft, fontFamily: "'Be Vietnam Pro',sans-serif" }}>({ex.level} · {ex.skill})</span></h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        {!zen && (
          <button onClick={() => setZen(true)}
            style={{ ...S.btn(false), padding: "7px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 7 }}>
            🧘 Mode Zen
          </button>
        )}
        {ex.timeLimit && !locked && <span style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>⏱ Temps limite : {ex.timeLimit} minutes</span>}
        {ex.deadline && <span style={{ fontSize: 13, color: isLate(ex) ? C.danger : C.warn, fontWeight: 700 }}>
          ⏰ {isLate(ex) ? "Date limite dépassée — la copie sera marquée en retard" : `À rendre avant le ${fmtDate(ex.deadline)}`}
        </span>}
        <span style={{ fontSize: 12, color: C.soft }}>{savedAt ? `💾 Brouillon enregistré à ${savedAt.toLocaleTimeString("fr-FR")}` : "💾 Enregistrement automatique activé"}</span>
      </div>

      {/* 🎧 Audio player cố định (sticky) — cuộn trang vẫn thấy */}
      {ex.imageUrl && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <img src={ex.imageUrl} alt="illustration"
            style={{ maxHeight: 400, maxWidth: "100%", width: "auto", objectFit: "contain",
              borderRadius: 24, boxShadow: "0 6px 20px rgba(17,24,39,.10)" }} />
        </div>
      )}

      {ex.audioUrl && (
        <div className="mcf-card" style={{ ...S.card, marginBottom: 16, position: "sticky", top: 8, zIndex: 30, boxShadow: "0 6px 18px rgba(27,37,89,.12)" }}>
          <div style={{ ...S.label, marginBottom: 8 }}>🎧 Écoute le document audio (le lecteur reste visible pendant que tu réponds)</div>
          <audio controls controlsList="nodownload noplaybackrate" onContextMenu={(e) => e.preventDefault()}
            style={{ width: "100%" }} src={ex.audioUrl} />
        </div>
      )}

      {/* 📖 Bố cục 2 cột nếu có bài đọc */}
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

      {err && <p style={{ color: C.danger, fontSize: 13 }}>{err}</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button style={{ ...S.btn(true), opacity: allAnswered && !saving && !locked ? 1 : 0.4 }} disabled={!allAnswered || saving || locked} onClick={submit}>
          {saving ? "Envoi…" : "Rendre ma copie"}
        </button>
        <button style={S.btn(false)} onClick={done}>Quitter (brouillon sauvegardé)</button>
      </div>
      </div>
    </div>
  );
}

/* ============ Panel bài đọc : highlight + chống copy ============
   Học sinh bôi đen văn bản → hiện nút 🖍 nổi → bấm để tô vàng.
   Vẫn chặn Copy / chuột phải / kéo-thả để chống sao chép. */
function ReadingPanel({ text, stickyTop = 8 }) {
  const boxRef = React.useRef(null);
  const [btn, setBtn] = useState(null); // {x, y}
  const [fontSize, setFontSize] = useState(16); // 14 → 24 px

  const onSelect = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) { setBtn(null); return; }
    const range = sel.getRangeAt(0);
    if (!boxRef.current?.contains(range.commonAncestorContainer)) { setBtn(null); return; }
    const rect = range.getBoundingClientRect();
    setBtn({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const highlight = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const mark = document.createElement("mark");
    mark.className = "mcf-hl";
    try { range.surroundContents(mark); }
    catch { mark.appendChild(range.extractContents()); range.insertNode(mark); }
    sel.removeAllRanges();
    setBtn(null);
  };

  return (
    <>
      {btn && (
        <button onMouseDown={(e) => { e.preventDefault(); highlight(); }}
          style={{ position: "fixed", left: btn.x, top: btn.y - 44, transform: "translateX(-50%)", zIndex: 200,
            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 999, border: "none",
            background: "#111827", color: "#FFD43B", fontWeight: 800, fontSize: 13, cursor: "pointer",
            boxShadow: "0 8px 20px rgba(17,24,39,.3)", fontFamily: "inherit" }}>
          🖍 Surligner
        </button>
      )}
      <div ref={boxRef} className="mcf-card mcf-scroll"
        onMouseUp={onSelect} onTouchEnd={onSelect}
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ ...S.card, flex: "6 1 380px", minWidth: 0, maxHeight: "76vh", overflowY: "auto",
          position: "sticky", top: stickyTop }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <div style={S.label}>📖 Texte à lire <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>· bôi đen để tô vàng 🖍</span></div>
          {/* A- / A+ : chỉnh cỡ chữ 14-24px */}
          <div style={{ display: "flex", gap: 6 }}>
            {[["A−", -2], ["A+", 2]].map(([lbl, delta]) => (
              <button key={lbl} title={delta > 0 ? "Agrandir le texte" : "Réduire le texte"}
                disabled={delta > 0 ? fontSize >= 24 : fontSize <= 14}
                onClick={() => setFontSize((f) => Math.min(24, Math.max(14, f + delta)))}
                style={{ width: 36, height: 30, borderRadius: 999, border: `1.5px solid ${C.line}`,
                  background: "var(--mcf-surface)", color: C.ink, cursor: "pointer", fontWeight: 800,
                  fontSize: delta > 0 ? 14 : 11.5, fontFamily: "inherit",
                  opacity: (delta > 0 ? fontSize >= 24 : fontSize <= 14) ? 0.35 : 1 }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.9, fontSize }}>{text}</div>
      </div>
    </>
  );
}

/* ================= Rich Text Editor (PE) =================
   Bộ soạn thảo không cần thư viện ngoài — xuất HTML.
   Toolbar: font, cỡ chữ, B/I/U/S, x₂ x², màu chữ, highlight,
   căn lề, danh sách, indent, giãn dòng, xóa định dạng. */
function RichTextEditor({ value, onChange, wordLimit, readOnly }) {
  const ref = React.useRef(null);
  const [lineH, setLineH] = useState("1.8");
  const words = wordCount(value);

  // Đồng bộ khi nạp draft từ storage
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value && document.activeElement !== ref.current) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd, arg = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML || "");
  };

  const TBtn = ({ label, title, cmd, arg, wide }) => (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); exec(cmd, arg); }}
      style={{ minWidth: wide ? 34 : 30, height: 30, borderRadius: 7, border: "1px solid transparent", background: "transparent",
        color: C.ink, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--mcf-line)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
      {label}
    </button>
  );
  const Sep = () => <span style={{ width: 1, height: 20, background: C.line, margin: "0 4px" }} />;
  const sel = { height: 30, borderRadius: 7, border: `1px solid ${C.line}`, background: "var(--mcf-surface)", fontSize: 13, fontFamily: "inherit", color: C.ink, padding: "0 6px" };

  return (
    <div style={{ borderRadius: 24, boxShadow: "0 8px 24px rgba(17,24,39,.08)", border: `1px solid ${C.line}`, overflow: "hidden", background: "var(--mcf-surface)" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3, padding: "8px 10px", background: "var(--mcf-bg)", borderBottom: `1px solid ${C.line}` }}>
        <select style={sel} defaultValue="" title="Police" onChange={(e) => { if (e.target.value) exec("fontName", e.target.value); }}>
          <option value="" disabled>Police</option>
          <option value="'Segoe UI', sans-serif">Aptos / Segoe UI</option>
          <option value="Lora, Georgia, serif">Lora</option>
          <option value="'Be Vietnam Pro', sans-serif">Sans-serif</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
        </select>
        <select style={sel} defaultValue="" title="Taille" onChange={(e) => { if (e.target.value) exec("fontSize", e.target.value); }}>
          <option value="" disabled>Taille</option>
          <option value="2">Petit</option><option value="3">Normal</option>
          <option value="4">Grand</option><option value="5">Très grand</option>
        </select>
        <Sep />
        <TBtn label="B" title="Gras (in đậm)" cmd="bold" />
        <TBtn label={<i>I</i>} title="Italique" cmd="italic" />
        <TBtn label={<u>U</u>} title="Souligné" cmd="underline" />
        <TBtn label={<s>abc</s>} title="Barré" cmd="strikeThrough" wide />
        <TBtn label={<span>x<sub>2</sub></span>} title="Indice" cmd="subscript" wide />
        <TBtn label={<span>x<sup>2</sup></span>} title="Exposant" cmd="superscript" wide />
        <Sep />
        <label title="Couleur du texte" style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", width: 34, height: 30, justifyContent: "center", borderRadius: 7 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--mcf-line)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <span style={{ fontWeight: 800, borderBottom: "3px solid #DE4B4B", lineHeight: 1 }}>A</span>
          <input type="color" defaultValue="#DE4B4B" style={{ width: 0, height: 0, opacity: 0 }} onChange={(e) => exec("foreColor", e.target.value)} />
        </label>
        <label title="Surligneur (highlight)" style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", width: 34, height: 30, justifyContent: "center", borderRadius: 7 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--mcf-line)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <span style={{ fontWeight: 800, background: "#FFE066", padding: "0 4px", borderRadius: 3, lineHeight: 1.3 }}>ab</span>
          <input type="color" defaultValue="#FFE066" style={{ width: 0, height: 0, opacity: 0 }} onChange={(e) => exec("hiliteColor", e.target.value)} />
        </label>
        <Sep />
        <TBtn label="⯇" title="Aligner à gauche" cmd="justifyLeft" />
        <TBtn label="☰" title="Centrer" cmd="justifyCenter" />
        <TBtn label="⯈" title="Aligner à droite" cmd="justifyRight" />
        <TBtn label="≡" title="Justifier" cmd="justifyFull" />
        <Sep />
        <TBtn label="•≡" title="Liste à puces" cmd="insertUnorderedList" wide />
        <TBtn label="1≡" title="Liste numérotée" cmd="insertOrderedList" wide />
        <TBtn label="⇤" title="Diminuer le retrait" cmd="outdent" />
        <TBtn label="⇥" title="Augmenter le retrait" cmd="indent" />
        <Sep />
        <select style={sel} value={lineH} title="Interligne (giãn dòng)" onChange={(e) => setLineH(e.target.value)}>
          <option value="1.4">1,0</option><option value="1.8">1,5</option><option value="2.2">2,0</option>
        </select>
        <TBtn label="🧹" title="Effacer la mise en forme" cmd="removeFormat" wide />
      </div>

      {/* Vùng viết — "tờ giấy" */}
      <div ref={ref} contentEditable={!readOnly} suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || "")}
        style={{ minHeight: 280, maxHeight: 560, overflowY: "auto", padding: "20px 24px", fontSize: 15.5,
          lineHeight: lineH, color: C.ink, outline: "none", fontFamily: "'Be Vietnam Pro', sans-serif" }} />

      {/* Word counter */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 14px", borderTop: `1px solid ${C.line}`, background: "var(--mcf-surface2)" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: wordLimit && words > wordLimit ? C.danger : C.soft }}>
          {words}{wordLimit ? `/${wordLimit}` : ""} mots
        </span>
      </div>
    </div>
  );
}


/* ---- Xuất dùng chung cho PracticeHub ---- */
export { C, S, SKILLS, QTYPES, LEVEL_COLORS, uid, fillOk, stripHtml, wordCount, autoQ, isLate, RichTextEditor, Builder, ReadingPanel, load, save };
