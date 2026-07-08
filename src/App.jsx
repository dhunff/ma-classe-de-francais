import './storageShim.js'
import React, { useState, useEffect, useCallback, useMemo } from "react";
import PracticeHub from './PracticeHub.jsx'
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
  bg: "#F4F6FB", card: "#FFFFFF", ink: "#1B2559", soft: "#6E7691", line: "#E4E8F4",
  primary: "#3D5AF1", primarySoft: "#EDF1FE", accent: "#F26B4E",
  ok: "#1E9E6A", okSoft: "#E7F7F0", warn: "#C98412", warnSoft: "#FFF6E8",
  danger: "#DE4B4B", dangerSoft: "#FDEEEE",
};
const LEVEL_COLORS = { A1: "#1E9E6A", A2: "#2A9D8F", B1: "#3D5AF1", B2: "#7048E8", "B2+": "#D6336C" };
const SKILLS = ["Grammaire", "Vocabulaire", "Écoute", "Lecture", "Traduction", "Communication"];
const QTYPES = { qcm: "QCM", fill: "Texte à trous", conj: "Conjugaison", open: "Réponse libre / traduction" };

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,600&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }
button { transition: transform .12s ease, box-shadow .12s ease, opacity .12s ease; }
button:hover:not(:disabled) { transform: translateY(-1px); }
input:focus, textarea:focus, select:focus { outline: none; border-color: #3D5AF1 !important; box-shadow: 0 0 0 3px #3D5AF122; }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.mcf-card { animation: fadeUp .25s ease both; }
`;

const S = {
  font: { fontFamily: "'Be Vietnam Pro', -apple-system, 'Segoe UI', sans-serif", color: C.ink },
  display: { fontFamily: "'Lora', Georgia, serif" },
  card: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: "0 2px 10px rgba(27,37,89,0.05)", padding: "18px 22px" },
  btn: (primary, danger) => ({
    padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
    border: primary ? "none" : `1.5px solid ${danger ? C.danger : C.line}`,
    background: primary ? `linear-gradient(135deg, ${C.primary}, #5B7CFA)` : C.card,
    color: primary ? "#fff" : danger ? C.danger : C.ink,
    boxShadow: primary ? "0 4px 12px rgba(61,90,241,0.28)" : "0 1px 3px rgba(27,37,89,0.06)",
  }),
  input: { width: "100%", padding: "11px 14px", border: `1.5px solid ${C.line}`, borderRadius: 10, fontSize: 15, color: C.ink, background: "#FBFCFE", fontFamily: "inherit" },
  label: { fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", color: C.soft, fontWeight: 700 },
  badge: (lv) => ({ fontSize: 11, fontWeight: 800, color: "#fff", background: LEVEL_COLORS[lv] || C.primary, borderRadius: 999, padding: "3px 10px", marginRight: 8, letterSpacing: 0.5 }),
  chip: (bg, col) => ({ fontSize: 12, fontWeight: 700, background: bg, color: col, borderRadius: 999, padding: "3px 10px" }),
};

/* ---------- storage helpers ---------- */
async function load(key, fallback, shared = true) {
  try { const r = await window.storage.get(key, shared); return r ? JSON.parse(r.value) : fallback; }
  catch { return fallback; }
}
async function save(key, value, shared = true) {
  try { await window.storage.set(key, JSON.stringify(value), shared); return true; } catch { return false; }
}
async function del(key, shared = false) { try { await window.storage.delete(key, shared); } catch {} }

const uid = () => Math.random().toString(36).slice(2, 9);
const fmtDate = (d) => new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
const isLate = (ex) => ex.deadline && Date.now() > new Date(ex.deadline).getTime();
const assignedTo = (ex, name) => !ex.assignedTo || ex.assignedTo.length === 0 || ex.assignedTo.includes(name);
const targetedAccounts = (ex, accounts) => (ex.assignedTo && ex.assignedTo.length ? accounts.filter((a) => ex.assignedTo.includes(a.name)) : accounts);
const norm = (s) => (s || "").trim().toLowerCase().normalize("NFC").replace(/\s+/g, " ").replace(/[’]/g, "'");
const fillOk = (q, ans) => (q.accepted || "").split("|").map(norm).filter(Boolean).includes(norm(ans));
const autoQ = (q) => q.type === "qcm" || q.type === "fill" || q.type === "conj";

function totalScore(sub, ex) {
  const opens = ex.questions.filter((q) => q.type === "open");
  const manual = opens.reduce((n, q) => n + (sub.openMarks?.[q.id] ?? 0), 0);
  const graded = sub.graded;
  return { score: sub.autoScore + (graded ? manual : 0), max: sub.autoMax + (graded ? opens.length : 0), pending: !graded && opens.length > 0 };
}

/* ================= Root ================= */
export default function App() {
  const [session, setSession] = useState(null);
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

  return (
    <div style={{ background: C.bg, ...S.font, minHeight: "100vh" }}>
      <style>{FONTS}</style>
      <header style={{ background: `linear-gradient(120deg, ${C.ink} 0%, #2A3A8C 55%, ${C.primary} 100%)`, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🇫🇷</div>
          <div>
            <div style={{ ...S.display, fontSize: 23, fontWeight: 700, color: "#fff" }}>Ma Classe de Français</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)" }}>Professeur Do Quoc Hung · exercices & suivi des élèves</div>
          </div>
        </div>
        {session && (
          <div style={{ fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
            {session.role === "eleve" && <Bell name={session.name} exercises={exercises} submissions={submissions} />}
            <span style={{ color: "#fff", background: "rgba(255,255,255,0.14)", borderRadius: 999, padding: "6px 14px", fontWeight: 600 }}>
              {session.role === "prof" ? "👨‍🏫 Professeur" : `🎒 ${session.name}`}
            </span>
            <button style={{ ...S.btn(false), background: "transparent", border: "1.5px solid rgba(255,255,255,0.45)", color: "#fff", boxShadow: "none" }}
              onClick={() => setSession(null)}>Se déconnecter</button>
          </div>
        )}
      </header>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "26px 16px 60px" }}>
        {loading ? <p style={{ textAlign: "center", color: C.soft }}>Ouverture du cahier…</p>
          : !session ? <Login accounts={accounts} setAccounts={setAccounts} onLogin={(s) => { setSession(s); refresh(); }} />
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
      if (sub?.graded && !seen["graded-" + sub.id])
        list.push({ id: "graded-" + sub.id, icon: "✅", text: `Ta copie « ${ex.title} » a été corrigée.` });
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
      <button onClick={openBell} style={{ background: "rgba(255,255,255,0.14)", border: "none", borderRadius: 999, width: 38, height: 38, cursor: "pointer", fontSize: 17, color: "#fff", position: "relative" }}>
        🔔
        {notifs.length > 0 && (
          <span style={{ position: "absolute", top: -3, right: -3, background: C.accent, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 999, minWidth: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {notifs.length}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: 46, width: 300, background: "#fff", borderRadius: 14, boxShadow: "0 10px 30px rgba(27,37,89,0.18)", zIndex: 50, padding: 10, color: C.ink }}>
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

/* ================= Login ================= */
function Login({ accounts, setAccounts, onLogin }) {
  const [tab, setTab] = useState("eleve");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");

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

  return (
    <div style={{ maxWidth: 420, margin: "36px auto" }}>
      <div className="mcf-card" style={{ ...S.card, padding: 28 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 22, background: C.primarySoft, padding: 5, borderRadius: 12 }}>
          {[["eleve", "Élève"], ["prof", "Professeur"]].map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); setMsg(""); }}
              style={{ flex: 1, padding: 11, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit",
                background: tab === k ? C.primary : "transparent", color: tab === k ? "#fff" : C.soft, borderRadius: 10 }}>{l}</button>
          ))}
        </div>
        {tab === "eleve" ? (
          <>
            <div style={S.label}>Ton prénom</div>
            <input style={{ ...S.input, margin: "6px 0 12px" }} value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Linh" />
            <div style={S.label}>Ton mot de passe</div>
            <input style={{ ...S.input, margin: "6px 0 14px" }} type="password" value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="Donné par le professeur" onKeyDown={(e) => e.key === "Enter" && loginStudent()} />
            <button style={{ ...S.btn(true), width: "100%" }} onClick={loginStudent}>Entrer en classe</button>
            <p style={{ fontSize: 12, color: C.soft, marginTop: 12, marginBottom: 0 }}>
              Pas de compte ? L'inscription est fermée : seul le professeur peut créer les comptes.
            </p>
          </>
        ) : (
          <>
            <div style={S.label}>Code PIN professeur</div>
            <input style={{ ...S.input, margin: "6px 0 14px" }} type="password" value={pin} onChange={(e) => setPin(e.target.value)}
              placeholder="Défini à la première connexion" onKeyDown={(e) => e.key === "Enter" && loginTeacher()} />
            <button style={{ ...S.btn(true), width: "100%" }} onClick={loginTeacher}>Ouvrir le tableau de bord</button>
          </>
        )}
        {msg && <p style={{ color: C.danger, fontSize: 13, marginTop: 12 }}>{msg}</p>}
      </div>
    </div>
  );
}

/* ================= Teacher ================= */
function Teacher({ exercises, setExercises, submissions, setSubmissions, accounts, setAccounts, refresh }) {
  const [view, setView] = useState("list");
  const [draft, setDraft] = useState(null);

  const tabs = [["list", "📚 Exercices"], ["students", "👥 Élèves"], ["stats", "📊 Statistiques"], ["practice", "🏋️ Entraînement"]];
  const blank = () => ({ id: uid(), title: "", level: "B1", skill: "Grammaire", deadline: "", audioUrl: "", assignedTo: null, createdAt: Date.now(), questions: [] });

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
              const subs = submissions.filter((s) => s.exerciseId === ex.id);
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
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button style={S.btn(true)} onClick={() => setView("progress:" + ex.id)}>Suivi & correction</button>
                    <button style={S.btn(false)} onClick={() => { setDraft(JSON.parse(JSON.stringify(ex))); setView("new"); }}>Modifier</button>
                    <button style={S.btn(false, true)} onClick={() => remove(ex.id)}>Supprimer</button>
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
            <span><strong>{a.name}</strong>
              <span style={{ fontSize: 13, color: C.soft, marginLeft: 12 }}>mot de passe : {show ? a.code : "••••"}</span>
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
                return { ...totalScore(s, ex), late: s.late };
              });
              const pcts = cells.filter((c) => c && !c.na && c.max).map((c) => (c.score / c.max) * 100);
              const avg = pcts.length ? Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length) : null;
              const nAssigned = cells.filter((c) => !c || !c.na).length;
              return (
                <tr key={a.name}>
                  <td style={{ ...td, fontWeight: 700 }}>{a.name}</td>
                  <td style={td}>{cells.filter((c) => c && !c.na).length}/{nAssigned}</td>
                  {cells.map((c, i) => (
                    <td key={i} style={{ ...td, fontWeight: c && !c.na ? 700 : 400, color: !c ? C.soft : c.na ? C.line : c.pending ? C.warn : c.score / c.max >= 0.5 ? C.ok : C.danger }}>
                      {!c ? "—" : c.na ? "·" : `${c.score}/${c.max}${c.pending ? " ⏳" : ""}${c.late ? " 🕐" : ""}`}
                    </td>
                  ))}
                  <td style={{ ...td, fontWeight: 800, color: avg == null ? C.soft : avg >= 50 ? C.ok : C.danger }}>{avg == null ? "—" : avg + " %"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p style={{ fontSize: 12, color: C.soft, marginTop: 10, marginBottom: 0 }}>⏳ = réponses libres pas encore corrigées · 🕐 = rendu en retard · « · » = bài không giao cho học sinh này</p>
    </div>
  );
}

/* ================= Builder ================= */
function Builder({ draft, setDraft, publish, cancel, accounts }) {
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
      (q.type === "qcm" ? q.options.every((o) => o.trim()) : true) &&
      ((q.type === "fill" || q.type === "conj") ? q.accepted.trim() : true));

  const hint = {
    fill: "Écrivez la phrase avec ______ pour le trou. Réponses acceptées séparées par | (ex. « vais|me rends »).",
    conj: "Ex. de consigne : « Hier, nous (aller) ______ au cinéma. » Réponses acceptées séparées par | (ex. « sommes allés|sommes allées »).",
  };

  return (
    <div>
      <h2 style={{ ...S.display, marginTop: 0 }}>{draft.title ? "Modifier l'exercice" : "Nouvel exercice"}</h2>
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
            <select style={{ ...S.input, marginTop: 6 }} value={draft.skill} onChange={(e) => setDraft({ ...draft, skill: e.target.value })}>
              {SKILLS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div style={S.label}>Date limite (optionnel)</div>
            <input type="datetime-local" style={{ ...S.input, marginTop: 6 }} value={draft.deadline}
              onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={S.label}>Lien audio pour compréhension orale (optionnel — URL mp3)</div>
          <input style={{ ...S.input, marginTop: 6 }} value={draft.audioUrl} placeholder="https://…/audio.mp3"
            onChange={(e) => setDraft({ ...draft, audioUrl: e.target.value })} />
        </div>

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
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, background: "#FBFCFE", border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px" }}>
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
                  <span style={{ fontWeight: 700, width: 18 }}>{String.fromCharCode(65 + j)}.</span>
                  <input style={S.input} value={o} placeholder={`Option ${String.fromCharCode(65 + j)}`}
                    onChange={(e) => setQ(q.id, { options: q.options.map((x, k) => (k === j ? e.target.value : x)) })} />
                </div>
              ))}
              <div style={{ fontSize: 12, color: C.soft }}>Cochez la bonne réponse à gauche.</div>
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
  const subs = submissions.filter((s) => s.exerciseId === ex.id);
  const byName = Object.fromEntries(subs.map((s) => [s.student, s]));
  const opens = ex.questions.filter((q) => q.type === "open");
  const roster = targetedAccounts(ex, accounts);

  const saveGrading = async (student) => {
    const sub = byName[student];
    const latest = await load("mcf-submissions", []);
    const next = latest.map((s) => {
      if (!(s.exerciseId === ex.id && s.student === student)) return s;
      return {
        ...s,
        comment: (drafts[student] ?? s.comment ?? ""),
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
                {sub ? (
                  <span style={{ fontSize: 13 }}>
                    <span style={{ color: C.ok, fontWeight: 700 }}>Rendu</span>
                    {" · "}<strong>{t.score}/{t.max}{t.pending && " ⏳"}</strong>
                    {" · "}{fmtDate(sub.at)}
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
                      <div key={q.id} style={{ background: "#FBFCFE", borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.line}` }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                        <div style={{ fontSize: 14 }}>
                          Réponse : {q.type === "qcm"
                            ? <strong style={{ color: good ? C.ok : C.danger }}>{a != null ? String.fromCharCode(65 + a) + ". " + q.options[a] : "—"}</strong>
                            : <em style={{ color: good == null ? C.ink : good ? C.ok : C.danger }}>{a || "—"}</em>}
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
                    <button style={{ ...S.btn(true), marginTop: 8 }} onClick={() => saveGrading(name)}>
                      Enregistrer la correction {opens.length > 0 && "et la note"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= Student ================= */
function Student({ name, exercises, submissions, setSubmissions, accounts, setAccounts, refresh }) {
  const [taking, setTaking] = useState(null);
  const [tab, setTab] = useState("todo");
  const [showPw, setShowPw] = useState(false);
  const mine = (exId) => submissions.find((s) => s.exerciseId === exId && s.student === name);

  if (taking) return <Taking ex={taking} name={name} setSubmissions={setSubmissions} done={() => { setTaking(null); refresh(); }} />;

  const visible = exercises.filter((ex) => assignedTo(ex, name));
  const todo = visible.filter((ex) => !mine(ex.id))
    .sort((a, b) => (a.deadline ? new Date(a.deadline) : Infinity) - (b.deadline ? new Date(b.deadline) : Infinity));
  const doneList = visible.filter((ex) => mine(ex.id));
  const gradedList = doneList.filter((ex) => mine(ex.id).graded || !ex.questions.some((q) => q.type === "open"));

  const myScores = visible.map((ex, i) => {
    const s = mine(ex.id); if (!s) return null;
    const t = totalScore(s, ex); if (!t.max) return null;
    return { name: `Ex.${i + 1}`, full: ex.title, pct: Math.round((t.score / t.max) * 100), at: s.at };
  }).filter(Boolean).sort((a, b) => a.at - b.at);

  const radar = SKILLS.map((skill) => {
    const pcts = [];
    visible.filter((e) => e.skill === skill).forEach((ex) => {
      const s = mine(ex.id); if (!s) return;
      const t = totalScore(s, ex); if (t.max) pcts.push((t.score / t.max) * 100);
    });
    return { skill, moi: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0 };
  });

  const stamps = visible.filter((ex) => {
    const s = mine(ex.id); if (!s) return false;
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
    const sub = mine(ex.id);
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
              {ex.questions.length} question(s){ex.audioUrl && " · 🎧"}
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
        {sub?.comment && (
          <div style={{ marginTop: 12, background: C.warnSoft, border: `1px solid ${C.warn}44`, borderRadius: 12, padding: "10px 14px", fontSize: 14 }}>
            💬 <strong>Professeur :</strong> {sub.comment}
          </div>
        )}
        {sub && Object.values(sub.qComments || {}).some(Boolean) && (
          <details style={{ marginTop: 8, fontSize: 13 }}>
            <summary style={{ cursor: "pointer", color: C.primary, fontWeight: 600 }}>Voir les remarques question par question</summary>
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {ex.questions.map((q, i) => sub.qComments?.[q.id] ? (
                <div key={q.id} style={{ background: "#FBFCFE", borderRadius: 8, padding: "8px 12px", border: `1px solid ${C.line}` }}>
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

      {tab === "practice" && <PracticeHub role="eleve" />}
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
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => { load(draftKey, null, false).then((d) => d && setAnswers(d)); }, [draftKey]);
  useEffect(() => {
    const t = setTimeout(async () => {
      if (Object.keys(answers).length) { await save(draftKey, answers, false); setSavedAt(new Date()); }
    }, 1200);
    return () => clearTimeout(t);
  }, [answers, draftKey]);

  const allAnswered = ex.questions.every((q) =>
    q.type === "qcm" ? answers[q.id] != null : (answers[q.id] || "").trim() !== "");

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
    if (ok) { setSubmissions(next); await del(draftKey); done(); }
    else { setErr("Impossible d'enregistrer la copie. Réessaie."); setSaving(false); }
  };

  return (
    <div>
      <h2 style={{ ...S.display, marginTop: 0 }}>{ex.title} <span style={{ fontSize: 13, color: C.soft, fontFamily: "'Be Vietnam Pro',sans-serif" }}>({ex.level} · {ex.skill})</span></h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        {ex.deadline && <span style={{ fontSize: 13, color: isLate(ex) ? C.danger : C.warn, fontWeight: 700 }}>
          ⏰ {isLate(ex) ? "Date limite dépassée — la copie sera marquée en retard" : `À rendre avant le ${fmtDate(ex.deadline)}`}
        </span>}
        <span style={{ fontSize: 12, color: C.soft }}>{savedAt ? `💾 Brouillon enregistré à ${savedAt.toLocaleTimeString("fr-FR")}` : "💾 Enregistrement automatique activé"}</span>
      </div>

      {ex.audioUrl && (
        <div className="mcf-card" style={{ ...S.card, marginBottom: 16 }}>
          <div style={{ ...S.label, marginBottom: 8 }}>🎧 Écoute le document audio</div>
          <audio controls style={{ width: "100%" }} src={ex.audioUrl} />
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {ex.questions.map((q, i) => (
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
                    <input type="radio" name={q.id} checked={answers[q.id] === j} onChange={() => setAnswers({ ...answers, [q.id]: j })} />
                    <strong>{String.fromCharCode(65 + j)}.</strong> {o}
                  </label>
                ))}
              </div>
            ) : q.type === "open" ? (
              <textarea style={{ ...S.input, minHeight: 70, resize: "vertical" }} placeholder="Écris ta réponse ici…"
                value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
            ) : (
              <input style={S.input} placeholder="Ta réponse…" value={answers[q.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
            )}
          </div>
        ))}
      </div>
      {err && <p style={{ color: C.danger, fontSize: 13 }}>{err}</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button style={{ ...S.btn(true), opacity: allAnswered && !saving ? 1 : 0.4 }} disabled={!allAnswered || saving} onClick={submit}>
          {saving ? "Envoi…" : "Rendre ma copie"}
        </button>
        <button style={S.btn(false)} onClick={done}>Quitter (brouillon sauvegardé)</button>
      </div>
    </div>
  );
}
