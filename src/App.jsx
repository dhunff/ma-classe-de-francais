import './storageShim.js'
import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS as DndCSS } from "@dnd-kit/utilities";
import PracticeHub from './PracticeHub.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout.jsx'
import RequireRole from './routes/RequireRole.jsx'
import { ROLE_HOME } from './layout/navItems.js'
import StudentDashboard from './screens/dashboard/StudentDashboard.jsx'
import TeacherDashboard from './screens/dashboard/TeacherDashboard.jsx'
import { SKILLS, fmtDate, isLate, exSkills, assignedTo, totalScore } from './shared/exercises.js'
import { C, S, LEVEL_COLORS, LEVEL_PASTEL, QTYPES, VF_OPTS } from './shared/tokens.js'
import { load, save, del } from './shared/storage.js'
import { LANG_KEY, LANGS, I18N, getLang, LangCtx, digKey, useT } from './shared/i18n.jsx'
import { uid, norm, stripHtml, wordCount, vfOk, fillAccepted, fillOk, autoQ, ordreOk, seedShuffle, tableauCells, tableauOk, isQuestionAnswered, getUnansweredQuestionsCount } from './shared/questions.js'
import { PROFILE_FIELDS, LEVELS_PROFILE, GOALS_PROFILE, emptyProfile, calculateProfileCompletion, validateProfile } from './shared/profile.js'
import { FloatingLayer, KebabMenu } from './shared/ui.jsx'
import { OrdreChip, OrdreBlocks, TableauCompare, ConfirmSubmitModal } from './screens/student/answers.jsx'
import ReadingPanel from './editor/ReadingPanel.jsx'
import RichTextEditor from './editor/RichTextEditor.jsx'
import Builder from './screens/teacher/Builder.jsx'
import { BookOpen, GraduationCap, Wine, Croissant, Landmark, Stamp, Feather, Coffee, BookMarked, MoreVertical, Pencil, Copy, Trash2, RotateCcw, Image as ImageIcon, X, Phone, Calendar, Target, Briefcase, ChevronLeft, TrendingUp, Clock, CheckCircle } from 'lucide-react'
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

/* Token, i18n, hàm thuần về câu hỏi và hồ sơ nay nằm ở src/shared/ — xem khối import đầu file. */
const targetedAccounts = (ex, accounts) => (ex.assignedTo && ex.assignedTo.length ? accounts.filter((a) => ex.assignedTo.includes(a.name)) : accounts);
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


/* totalScore nay ở src/shared/exercises.js */

/* ================= Root ================= */
const SESSION_KEY = "mcf-session";
const THEME_KEY = "mcf-theme";

function AppInner() {
  const [dark, setDark] = useState(() => { try { return localStorage.getItem(THEME_KEY) === "dark"; } catch { return false; } });
  const toggleTheme = () => setDark((d) => { const n = !d; try { localStorage.setItem(THEME_KEY, n ? "dark" : "light"); } catch {} return n; });
  const [lang, setLang] = useState(getLang);
  const t = React.useCallback((key, vars) => {
    let str = digKey(I18N[lang], key);
    if (typeof str !== "string") str = digKey(I18N.vi, key);
    if (typeof str !== "string") str = key;
    if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.split(`{${k}}`).join(String(v)); });
    return str;
  }, [lang]);
  useEffect(() => { try { localStorage.setItem(LANG_KEY, lang); } catch {} }, [lang]);
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

  const [classes, setClasses] = useState([]);
  const refresh = useCallback(async () => {
    const [ex, sub, ac, cl] = await Promise.all([
      load("mcf-exercises", []), load("mcf-submissions", []), load("mcf-accounts", []), load("mcf-classes", []),
    ]);
    const cleanEx = (Array.isArray(ex) ? ex : []).map((e) => ({
      ...e,
      questions: Array.isArray(e.questions) ? e.questions : [],
      level: e.level || "B1",
      title: e.title || "(Sans titre)",
    }));
    setExercises(cleanEx); setSubmissions(Array.isArray(sub) ? sub : []); setAccounts(Array.isArray(ac) ? ac : []); setClasses(Array.isArray(cl) ? cl : []); setLoading(false);
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

  // 🌙 Đồng bộ class dark lên <html> để các lớp Portal (ngoài .mcf-root) đọc đúng biến CSS
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("mcf-dark-root", !!dark);
  }, [dark]);

  // Hồ sơ học sinh — Dashboard đọc mục tiêu DELF từ đây.
  const [profiles, setProfiles] = useState({});
  useEffect(() => { load("mcf-profiles", {}).then((p) => setProfiles(p || {})); }, []);

  if (loading) {
    return (
      <div className={"mcf-root" + (dark ? " mcf-dark" : "")}>
        <p className="p-8 text-center text-soft">{t("loading")}</p>
      </div>
    );
  }

  const shell = (
    <AppLayout
      session={session}
      t={t}
      lang={lang}
      langs={LANGS}
      onLang={setLang}
      dark={dark}
      onToggleDark={toggleTheme}
      onLogout={() => setSession(null)}
      bell={session?.role === "eleve"
        ? <Bell name={session.name} exercises={exercises} submissions={submissions} />
        : null}
    />
  );

  // Màn hình cũ: tab điều hướng còn nằm bên trong Teacher/Student, nên mọi
  // route ngoài dashboard tạm render nguyên component đó. Kéo tab ra là việc
  // của bước tách file.
  const teacherScreens = (
    <Teacher {...{ exercises, setExercises, submissions, setSubmissions, accounts, setAccounts, classes, setClasses, refresh }} />
  );
  const studentScreens = (
    <Student name={session?.name} {...{ exercises, submissions, setSubmissions, accounts, setAccounts, refresh }} />
  );

  return (
    <LangCtx.Provider value={lang}>
      <div className={"mcf-root" + (dark ? " mcf-dark" : "")}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                session ? (
                  <Navigate to={ROLE_HOME[session.role] || "/login"} replace />
                ) : (
                  <Login accounts={accounts} setAccounts={setAccounts}
                    onLogin={(s) => { setSession(s); refresh(); }} />
                )
              }
            />

            <Route element={<RequireRole session={session} role="prof">{shell}</RequireRole>}>
              <Route path="/professeur/dashboard"
                element={<TeacherDashboard {...{ exercises, submissions, accounts, t }} />} />
              <Route path="/professeur/exercices" element={teacherScreens} />
              <Route path="/professeur/eleves" element={teacherScreens} />
              <Route path="/professeur/parametres" element={teacherScreens} />
              <Route path="/professeur/*" element={<Navigate to="/professeur/dashboard" replace />} />
            </Route>

            <Route element={<RequireRole session={session} role="eleve">{shell}</RequireRole>}>
              <Route path="/etudiant/dashboard"
                element={<StudentDashboard name={session?.name} profile={profiles[session?.name]}
                  {...{ exercises, submissions, t }} />} />
              <Route path="/etudiant/bibliotheque" element={studentScreens} />
              <Route path="/etudiant/progression" element={studentScreens} />
              <Route path="/etudiant/parametres" element={studentScreens} />
              <Route path="/etudiant/*" element={<Navigate to="/etudiant/dashboard" replace />} />
            </Route>

            <Route path="*" element={
              <Navigate to={session ? (ROLE_HOME[session.role] || "/login") : "/login"} replace />
            } />
          </Routes>
        </BrowserRouter>
      </div>
    </LangCtx.Provider>
  );
}

/* ================= Notifications bell ================= */
function Bell({ name, exercises, submissions }) {
  const bellRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState({});
  const [annonces, setAnnonces] = useState([]);
  useEffect(() => { load(`mcf-seen-${name}`, {}, false).then(setSeen); }, [name]);
  // 📣 Annonces du professeur : charge + rafraîchit toutes les 60 s
  useEffect(() => {
    const fetchA = () => load("mcf-notifs", []).then((all) =>
      setAnnonces(all.filter((n) => !n.targets || n.targets.includes(name))));
    fetchA();
    const t = setInterval(fetchA, 60_000);
    return () => clearInterval(t);
  }, [name]);

  const notifs = useMemo(() => {
    const list = [];
    annonces.forEach((n) => {
      if (!seen["ann-" + n.id])
        list.push({ id: "ann-" + n.id, icon: "📣", text: n.message, ts: n.createdAt });
    });
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
  }, [exercises, submissions, name, seen, annonces]);

  const openBell = async () => {
    setOpen(!open);
    if (!open && notifs.length) {
      const next = { ...seen };
      notifs.forEach((n) => { if (n.id.startsWith("graded-") || n.id.startsWith("ann-")) next[n.id] = true; });
      setSeen(next); await save(`mcf-seen-${name}`, next, false);
    }
  };

  return (
    <div ref={bellRef} style={{ position: "relative" }}>
      <button onClick={openBell} style={{ background: "var(--mcf-surface)", border: `1.5px solid ${C.line}`, borderRadius: 999, width: 42, height: 42, cursor: "pointer", fontSize: 17, position: "relative", boxShadow: "0 4px 12px rgba(17,24,39,.06)" }}>
        🔔
        {notifs.length > 0 && (
          <span style={{ position: "absolute", top: -3, right: -3, background: C.danger, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 999, minWidth: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {notifs.length}
          </span>
        )}
      </button>
      <FloatingLayer anchorRef={bellRef} open={open} onClose={() => setOpen(false)} width={300}>
        <div>
          {notifs.length === 0
            ? <div style={{ padding: 12, fontSize: 13, color: C.soft }}>Aucune notification. Tout est à jour ! 🎉</div>
            : notifs.map((n) => (
              <div key={n.id} style={{ padding: "9px 10px", fontSize: 13, borderBottom: `1px solid ${C.line}` }}>
                {n.icon} {n.text}
              </div>
            ))}
        </div>
      </FloatingLayer>
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
  const serif = { fontFamily: "var(--f-display)" };

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
      <style>{`
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
          <img src="/logo.png" alt="Logo" style={{ width: 46, height: 46, objectFit: "contain" }} />
          Apprendre le français avec Do Hung
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
function Teacher({ exercises, setExercises, submissions, setSubmissions, accounts, setAccounts, classes, setClasses, refresh }) {
  const [view, setView] = useState("list");
  // 📣 Annonces
  const [annModal, setAnnModal] = useState(false);
  const [annMsg, setAnnMsg] = useState("");
  const [annAll, setAnnAll] = useState(true);
  const [annClasses, setAnnClasses] = useState([]);
  const [annStudents, setAnnStudents] = useState([]);
  const [annSearch, setAnnSearch] = useState("");
  const [annToast, setAnnToast] = useState("");

  const sendAnnonce = async () => {
    const msg = annMsg.trim();
    if (!msg) return;
    let targets = null; // null = broadcast à tous
    if (!annAll) {
      const names = new Set(annStudents);
      annClasses.forEach((cid) => accounts.filter((a) => a.classId === cid).forEach((a) => names.add(a.name)));
      if (!names.size) return;
      targets = [...names];
    }
    const latest = await load("mcf-notifs", []);
    const next = [...latest, { id: uid(), message: msg, targets, createdAt: Date.now() }].slice(-30);
    await save("mcf-notifs", next);
    setAnnModal(false);
    setAnnToast("✅ Annonce envoyée !");
    setTimeout(() => setAnnToast(""), 3200);
  };
  const [draft, setDraft] = useState(null);

  const t = useT();
  const tabs = [["list", `📚 ${t("nav.exercises")}`], ["students", `👥 ${t("nav.students")}`], ["stats", `📊 ${t("nav.stats")}`], ["practice", `🏋️ ${t("nav.practice")}`]];
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

    if (final.usageType === "practice") {
      // → Đẩy sang kho Entraînement, gỡ khỏi danh sách devoir
      const prac = await load("mcf-practice", []);
      const np = [...prac.filter((e) => e.id !== final.id),
        { ...final, assignedTo: null, targeted: false, deadline: "" }].sort((a, b) => a.createdAt - b.createdAt);
      const okP = await save("mcf-practice", np);
      if (!okP) { alert("❌ Échec de l'enregistrement — données trop volumineuses. Utilisez une URL publique pour l'image."); return; }
      const next = exercises.filter((e) => e.id !== final.id);
      setExercises(next); await save("mcf-exercises", next);
      setView("list"); return;
    }

    const others = exercises.filter((e) => e.id !== final.id);
    const next = [...others, final].sort((a, b) => a.createdAt - b.createdAt);
    const ok = await save("mcf-exercises", next);
    if (!ok) { alert("❌ Échec de l'enregistrement — données trop volumineuses (image base64). Utilisez plutôt une URL publique."); return; }
    // Nếu bài này từng nằm bên Entraînement → gỡ khỏi đó (chuyển trạng thái)
    const prac = await load("mcf-practice", []);
    if (prac.some((e) => e.id === final.id)) await save("mcf-practice", prac.filter((e) => e.id !== final.id));
    setExercises(next); setView("list");
  };
  const remove = async (id) => {
    const next = exercises.filter((e) => e.id !== id);
    setExercises(next); await save("mcf-exercises", next);
  };

  if (view === "new") return <Builder draft={draft} setDraft={setDraft} publish={publish} cancel={() => setView("list")} accounts={accounts} classes={classes} />;
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
          <button style={S.btn(false)} onClick={refresh}>↻ {t("actions.refresh")}</button>
          {view === "list" && <button style={S.btn(false)} onClick={() => { setAnnModal(true); setAnnMsg(""); setAnnAll(true); setAnnClasses([]); setAnnStudents([]); setAnnSearch(""); }}>📣 {t("actions.announce")}</button>}
          {view === "list" && <button style={S.btn(true)} onClick={() => { setDraft(blank()); setView("new"); }}>{t("actions.new_exercise")}</button>}
        </div>
      </div>

      {annModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.55)", display: "grid", placeItems: "center", padding: 16, zIndex: 9999 }}
          onClick={() => setAnnModal(false)}>
          <div className="mcf-card" style={{ ...S.card, width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ ...S.display, fontSize: 20, marginTop: 0 }}>📣 Envoyer une annonce</h3>
            <textarea style={{ ...S.input, minHeight: 90, resize: "vertical" }} value={annMsg} autoFocus
              placeholder="ex. Rappel : rendez le devoir B1 avant vendredi 19h !"
              onChange={(e) => setAnnMsg(e.target.value)} />

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 700, cursor: "pointer", marginTop: 12 }}>
              <input type="checkbox" checked={annAll} onChange={(e) => setAnnAll(e.target.checked)} />
              👥 Envoyer à tous les élèves
            </label>

            {!annAll && (
              <div style={{ marginTop: 10, background: "var(--mcf-surface2)", border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", display: "grid", gap: 12 }}>
                <div>
                  <div style={{ ...S.label, fontSize: 10.5 }}>🏫 Par classes</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {classes.length === 0 && <span style={{ fontSize: 12.5, color: C.soft }}>Aucune classe créée.</span>}
                    {classes.map((cl) => {
                      const on = annClasses.includes(cl.id);
                      return (
                        <label key={cl.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer",
                          padding: "6px 13px", borderRadius: 999, fontWeight: 700,
                          border: `1.5px solid ${on ? C.primary : C.line}`,
                          background: on ? C.primarySoft : "var(--mcf-surface)", color: on ? C.primary : C.ink }}>
                          <input type="checkbox" checked={on} style={{ display: "none" }}
                            onChange={() => setAnnClasses(on ? annClasses.filter((x) => x !== cl.id) : [...annClasses, cl.id])} />
                          {on ? "✓ " : ""}{cl.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
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

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={{ ...S.btn(true), opacity: annMsg.trim() && (annAll || annClasses.length || annStudents.length) ? 1 : 0.4 }}
                disabled={!annMsg.trim() || (!annAll && !annClasses.length && !annStudents.length)}
                onClick={sendAnnonce}>📣 Envoyer</button>
              <button style={S.btn(false)} onClick={() => setAnnModal(false)}>Annuler</button>
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
      {view === "practice" && <PracticeHub role="prof" accounts={accounts} />}
      {view === "stats" && <Stats accounts={accounts} exercises={exercises} submissions={submissions} />}
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
                      {ex.questions.length} question(s) · {subs.length}/{targets.length} copies
                      {ex.assignedTo?.length
                        ? <span style={{ color: C.primary, fontWeight: 700 }} title={ex.assignedTo.join(", ")}> · 👤 {ex.assignedTo.length} élève{ex.assignedTo.length > 1 ? "s" : ""}{ex.assignedClasses?.length ? ` · 🏫 ${ex.assignedClasses.map((id) => classes.find((c) => c.id === id)?.name).filter(Boolean).join(", ")}` : ""}</span>
                        : " · 👥 tous les élèves"}
                      {toGrade > 0 && <span style={{ color: C.warn, fontWeight: 700 }}> · ✏️ {toGrade} à corriger</span>}
                      {ex.deadline && <span style={{ color: late ? C.danger : C.warn, fontWeight: 700 }}> · ⏰ {fmtDate(ex.deadline)}{late && " (clôturé)"}</span>}
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
    </div>
  );
}

/* ================= Accounts ================= */
function Accounts({ accounts, setAccounts, classes, setClasses, exercises = [], submissions = [] }) {
  const [openStudent, setOpenStudent] = useState(null);   // 📂 dossier détaillé
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
  const setStudentClass = async (name, classId) => {
    const latest = await load("mcf-accounts", []);
    const next = latest.map((a) => (a.name === name ? { ...a, classId: classId || undefined } : a));
    setAccounts(next); await save("mcf-accounts", next);
  };
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

  if (openStudent) {
    const acc = accounts.find((a) => a.name === openStudent);
    if (!acc) { setOpenStudent(null); return null; }
    return <StudentDossier acc={acc} classes={classes} exercises={exercises} submissions={submissions}
      presence={presence} back={() => setOpenStudent(null)} />;
  }

  return (
    <div>
      <div className="mcf-card" style={{ ...S.card, marginBottom: 16 }}>
        <div style={S.label}>🏫 Classes</div>
        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <input style={{ ...S.input, flex: "1 1 200px", maxWidth: 280 }} value={newClass}
            placeholder="ex. B1-Matin, A1-K1…" onChange={(e) => setNewClass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addClass()} />
          <button style={S.btn(true)} onClick={addClass}>Créer la classe</button>
        </div>
        {classes.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {classes.map((cl) => (
              <span key={cl.id} style={{ ...S.chip(C.primarySoft, C.primary), display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px" }}>
                🏫 {cl.name} ({accounts.filter((a) => a.classId === cl.id).length})
                <button title="Supprimer la classe" onClick={() => delClass(cl.id)}
                  style={{ border: "none", background: "transparent", color: C.danger, cursor: "pointer", fontWeight: 800, padding: 0 }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

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
              <button onClick={() => setOpenStudent(a.name)} title="Voir le dossier de l'élève"
                style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit",
                  fontWeight: 800, fontSize: 15, color: C.primary, padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
                {a.name}
              </button>
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
              <select value={a.classId || ""} onChange={(e) => setStudentClass(a.name, e.target.value)}
                style={{ ...S.input, width: "auto", padding: "5px 10px", fontSize: 12.5 }}>
                <option value="">— Sans classe —</option>
                {classes.map((cl) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
              </select>
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

/* ================= 📂 Dossier de l'élève (vue prof) ================= */
const AVA_COLORS = ["#5B4B9E", "#41608F", "#2C7573", "#327654", "#8F5E22", "#9B3D66"];
const avaColor = (n) => AVA_COLORS[[...String(n)].reduce((a, c) => a + c.charCodeAt(0), 0) % AVA_COLORS.length];
const fmtDateFR = (v) => { if (!v) return null; const d = new Date(v); return isNaN(d) ? null : d.toLocaleDateString("fr-FR"); };
const fmtDuration = (ms) => {
  if (!ms || ms < 1000) return "—";
  const m = Math.round(ms / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
};

function StudentDossier({ acc, classes, exercises, submissions, presence, back }) {
  const name = acc.name;
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [practice, setPractice] = useState({});
  const [pracEx, setPracEx] = useState([]);

  useEffect(() => {
    (async () => {
      const [profs, notesAll, ph, prac] = await Promise.all([
        load("mcf-profiles", {}), load("mcf-teacher-notes", {}),
        load(`mcf-ph-${name}`, {}, false), load("mcf-practice", []),
      ]);
      setProfile((profs && profs[name]) || {});
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
      return { title: ex ? ex.title : "Exercice supprimé", level: ex ? ex.level : "", pct: Math.round((r.best / r.max) * 100), label: `${r.best}/${r.max}`, at: r.at || 0, kind: "Entraînement" };
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
          {cls && <div><span style={S.chip(C.primarySoft, C.primary)}>🏫 {cls.name}</span></div>}
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
              <div style={S.label}>🗝️ Notes privées (visibles uniquement par vous)</div>
              <textarea style={{ ...S.input, marginTop: 8, minHeight: 76, resize: "vertical" }} value={notes}
                placeholder="ex. Prononciation du « r » à travailler ; très bon à l'écrit…"
                onChange={(e) => setNotes(e.target.value)} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                <button style={{ ...S.btn(true), padding: "8px 18px", fontSize: 13 }} onClick={saveNotes}>💾 Enregistrer les notes</button>
                {notesSaved && <span style={{ fontSize: 13, color: C.ok, fontWeight: 700 }}>✅ Notes enregistrées</span>}
              </div>
            </div>
          </div>

          {/* Aperçu des performances */}
          <div>
            <h3 style={{ ...S.display, fontSize: 17, margin: "0 0 12px" }}>📈 Aperçu des performances</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              {statCard(CheckCircle, "Exercices terminés", totalDone, C.primary)}
              {statCard(TrendingUp, "Score moyen", avg == null ? "—" : `${avg} %`, avg == null ? C.soft : avg >= 80 ? C.ok : avg >= 50 ? C.warn : C.danger)}
              {statCard(Clock, "Temps total", fmtDuration(totalTime), C.primary)}
            </div>
          </div>

          {/* Activités récentes */}
          <div className="mcf-card" style={{ ...S.card }}>
            <h3 style={{ ...S.display, fontSize: 17, margin: "0 0 14px" }}>⏱️ Activités récentes</h3>
            {recent.length === 0 ? (
              <p style={{ color: C.soft, margin: 0, fontSize: 14 }}>Aucune activité pour le moment.</p>
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
      <p style={{ fontSize: 12, color: C.soft, marginTop: 10, marginBottom: 0 }}>⏳ = réponses libres pas encore corrigées · 🕐 = rendu en retard · « · » = exercice non assigné à cet élève · 🔁 = à refaire</p>
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
      <h2 style={{ ...S.display, marginTop: 0 }}>{ex.title} <span style={{ fontSize: 13, color: C.soft, fontFamily: "'Be Vietnam Pro',sans-serif" }}>({ex.level} · {exSkills(ex).join(" + ")})</span></h2>
      {ex.deadline && <p style={{ fontSize: 13, color: isLate(ex) ? C.danger : C.warn, fontWeight: 700 }}>⏰ Date limite : {fmtDate(ex.deadline)}{isLate(ex) && " — les rendus tardifs sont marqués 🕐"}</p>}

      <div className="mcf-card" style={{ ...S.card, marginBottom: 20 }}>
        <div style={S.label}>Progression de la classe</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>{subs.length} copie(s) rendue(s) sur {roster.length} élève(s) concerné(s)
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
                    <span style={{ color: C.ok, fontWeight: 700 }}>Rendu</span>
                    {" · "}<strong>{t.score}/{t.max}{t.pending && " ⏳"}</strong>
                    {" · "}{fmtDate(sub.at)}
                    {sub.timedOut && " · ⏱ auto (temps écoulé)"}
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
                    const good = q.type === "qcm" ? a === q.answer
                      : q.type === "vf" ? vfOk(q, a)
                      : q.type === "tableau" ? tableauOk(q, a)
                      : q.type === "ordre" ? ordreOk(q, a)
                      : (q.type === "fill" || q.type === "conj") ? fillOk(q, a) : null;
                    return (
                      <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.line}` }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                        <div style={{ fontSize: 14 }}>
                          {q.type === "tableau" && <div style={{ marginTop: 6 }}><TableauCompare q={q} value={a || {}} readOnly correction /></div>}
                          {q.type === "ordre" && <div style={{ marginTop: 6 }}><OrdreBlocks q={q} value={a || []} readOnly correction /></div>}
                          {q.type !== "vf" && q.type !== "tableau" && q.type !== "ordre" && <>Réponse : </>}{q.type === "vf" || q.type === "tableau" || q.type === "ordre" ? null : q.type === "qcm"
                            ? <strong style={{ color: good ? C.ok : C.danger }}>{a != null ? String.fromCharCode(65 + a) + ". " + q.options[a] : "—"}</strong>
                            : q.type === "open"
                            ? <div style={{ marginTop: 6, background: "var(--mcf-surface)", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: a || "—" }} />
                            : <em style={{ color: good ? C.ok : C.danger }}>{a || "—"}</em>}
                          {good === false && q.type === "qcm" && <span> · attendu : <strong>{String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}</strong></span>}
                          {(q.type === "fill" || q.type === "conj") && <span> · 💡 attendu : <strong>{String(fillAccepted(q)).split("|")[0]}</strong></span>}
                          {q.type === "vf" && (
                            <div style={{ marginTop: 4 }}>
                              Choix : <strong style={{ color: good ? C.ok : C.danger }}>{a?.choice != null ? VF_OPTS[a.choice] : "—"}</strong>
                              {good === false && <span> · attendu : <strong>{VF_OPTS[q.answer]}</strong></span>}
                              {a?.just && <div style={{ fontStyle: "italic", marginTop: 3 }}>Justification de l'élève : « {a.just} »</div>}
                              {q.answer !== 2 && q.justification && (
                                <div style={{ marginTop: 6, background: C.okSoft, border: `1px solid ${C.ok}44`, borderRadius: 10, padding: "8px 12px" }}>
                                  💡 <strong>Justification attendue :</strong> {q.justification}
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
            <div style={S.label}>Remarque (visible sur le tableau de bord de l'élève)</div>
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
  const t = useT();
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
    visible.filter((e) => exSkills(e).includes(skill)).forEach((ex) => {
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

  const tabs = [["todo", `📝 ${t("nav.todo")} (${todo.length})`], ["done", `📤 ${t("nav.done")} (${doneList.length})`],
    ["practice", `🏋️ ${t("nav.practice")}`], ["progress", `📈 ${t("nav.progress")}`], ["settings", `⚙️ ${t("nav.account")}`]];

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
            <span style={S.chip(C.primarySoft, C.primary)}>{exSkills(ex).join(" · ")}</span>{" "}
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
        {sub?.graded && ex.questions.some((q) => q.type === "open" || q.type === "vf" || q.type === "tableau" || q.type === "ordre" || q.type === "fill" || q.type === "conj") && (
          <details style={{ marginTop: 10, fontSize: 13.5 }}>
            <summary style={{ cursor: "pointer", color: C.primary, fontWeight: 700 }}>📋 Voir ma copie corrigée</summary>
            <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
              {ex.questions.map((q, i) => {
                const a = sub.answers[q.id];
                if (q.type === "open") return (
                  <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                    <div style={{ fontSize: 12, color: C.soft, fontWeight: 700, marginBottom: 4 }}>MA RÉPONSE</div>
                    <div style={{ lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: a || "—" }} />
                    {q.model && (
                      <div style={{ marginTop: 10, background: C.okSoft, border: `1.5px solid ${C.ok}55`, borderRadius: 12, padding: "10px 14px" }}>
                        💡 <strong>Réponse suggérée :</strong>
                        <div style={{ marginTop: 4, fontStyle: "italic", lineHeight: 1.7 }}>{q.model}</div>
                      </div>
                    )}
                  </div>
                );
                if (q.type === "vf") {
                  const good = vfOk(q, a);
                  return (
                    <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                      Mon choix : <strong style={{ color: good ? C.ok : C.danger }}>{a?.choice != null ? VF_OPTS[a.choice] : "—"}</strong>
                      {!good && <span> · Bonne réponse : <strong>{VF_OPTS[q.answer]}</strong></span>}
                      {a?.just && <div style={{ fontStyle: "italic", marginTop: 4 }}>Ma justification : « {a.just} »</div>}
                      {q.answer !== 2 && q.justification && (
                        <div style={{ marginTop: 8, background: C.okSoft, border: `1.5px solid ${C.ok}55`, borderRadius: 12, padding: "10px 14px" }}>
                          💡 <strong>Justification attendue :</strong> <em>{q.justification}</em>
                        </div>
                      )}
                    </div>
                  );
                }
                if (q.type === "tableau") return (
                  <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>{i + 1}. {q.prompt}</div>
                    <TableauCompare q={q} value={a || {}} readOnly correction />
                  </div>
                );
                if (q.type === "fill" || q.type === "conj") {
                  const good = fillOk(q, a);
                  return (
                    <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                      <div>Ma réponse : <strong style={{ color: good ? C.ok : C.danger }}>{a || "—"}</strong></div>
                      <div style={{ marginTop: 6, background: C.okSoft, border: `1.5px solid ${C.ok}55`, borderRadius: 12, padding: "8px 12px", fontSize: 13.5 }}>
                        💡 <strong style={{ color: C.ok }}>Réponse attendue :</strong> {String(fillAccepted(q)).split("|").join(" / ")}
                      </div>
                    </div>
                  );
                }
                if (q.type === "ordre") return (
                  <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>{i + 1}. {q.prompt}</div>
                    <OrdreBlocks q={q} value={a || []} readOnly correction />
                  </div>
                );
                return null;
              })}
            </div>
          </details>
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
        <button style={{ ...S.btn(false), marginLeft: "auto" }} onClick={refresh}>↻ {t("actions.refresh")}</button>
      </div>

      {tab === "todo" && (
        todo.length === 0
          ? <div className="mcf-card" style={{ ...S.card, textAlign: "center", padding: 36, color: C.soft }}>{t("empty.all_done")}</div>
          : <div style={{ display: "grid", gap: 14 }}>{todo.map((ex) => <Card key={ex.id} ex={ex} />)}</div>
      )}
      {tab === "done" && (
        doneList.length === 0
          ? <div className="mcf-card" style={{ ...S.card, textAlign: "center", padding: 36, color: C.soft }}>{t("empty.no_submission")}</div>
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
                  <Radar name="Moi" dataKey="moi" stroke={C.primary} fill={C.primary} fillOpacity={0.35} />
                  <Tooltip formatter={(v) => v + " %"} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "practice" && <PracticeHub role="eleve" name={name} />}
      {tab === "settings" && (
        <div style={{ display: "grid", gap: 18 }}>
          <ProfileForm name={name} />
          <PasswordForm changePw={changePw} showPw={showPw} setShowPw={setShowPw} />
        </div>
      )}
    </div>
  );
}

function ProfileForm({ name }) {
  const [p, setP] = useState(emptyProfile());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errs, setErrs] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      const all = await load("mcf-profiles", {});
      setP({ ...emptyProfile(), ...((all && all[name]) || {}) });
      setLoading(false);
    })();
  }, [name]);

  const pct = calculateProfileCompletion(p);
  const set = (k, v) => { setP({ ...p, [k]: v }); if (errs[k]) setErrs({ ...errs, [k]: undefined }); };

  const submit = async () => {
    const e = validateProfile(p);
    setErrs(e);
    if (Object.keys(e).some((k) => e[k])) return;
    setSaving(true);
    try {
      const all = await load("mcf-profiles", {});            // relire pour ne pas écraser les autres
      all[name] = { ...p, updatedAt: Date.now() };
      await save("mcf-profiles", all);
      setToast("✅ Profil mis à jour avec succès !");
    } catch {
      setToast("❌ Erreur lors de l'enregistrement.");
    }
    setSaving(false);
    setTimeout(() => setToast(""), 3200);
  };

  if (loading) return <p style={{ color: C.soft }}>Chargement du profil…</p>;

  const field = (label, node, key) => (
    <div>
      <div style={S.label}>{label}</div>
      <div style={{ marginTop: 6 }}>{node}</div>
      {errs[key] && <div style={{ fontSize: 12, color: C.danger, marginTop: 4 }}>{errs[key]}</div>}
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 760 }}>
      {/* 🎮 Barre de progression du profil */}
      <div className="mcf-card" style={{ ...S.card, padding: "18px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <strong style={{ fontSize: 15 }}>
            {pct === 100 ? "🎉 Votre profil est complet à 100 % ! Merci !"
              : `Votre profil est complété à ${pct} % !`}
          </strong>
          {pct < 100 && <span style={{ fontSize: 12.5, color: C.soft }}>Complétez-le pour une meilleure expérience.</span>}
        </div>
        <div style={{ width: "100%", height: 10, borderRadius: 999, background: "var(--mcf-surface2)",
          border: `1px solid ${C.line}`, marginTop: 12, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999,
            background: pct === 100 ? C.ok : C.primary, transition: "width .45s cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </div>

      {/* 📝 Formulaire */}
      <div className="mcf-card" style={{ ...S.card }}>
        <h3 style={{ ...S.display, fontSize: 19, margin: "0 0 4px" }}>👤 Compléter mon profil</h3>
        <p style={{ fontSize: 13, color: C.soft, margin: "0 0 18px" }}>
          Ces informations aident votre professeur à mieux adapter les exercices à vos besoins.
        </p>

        <div className="mcf-grid2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {field("📞 Téléphone", (
            <input style={S.input} type="tel" value={p.phone} placeholder="ex. 0912 345 678"
              onChange={(e) => set("phone", e.target.value)} />
          ), "phone")}

          {field("🎂 Date de naissance", (
            <input style={S.input} type="date" value={p.dob} max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set("dob", e.target.value)} />
          ), "dob")}

          {field("📊 Niveau actuel", (
            <select style={S.input} value={p.level} onChange={(e) => set("level", e.target.value)}>
              <option value="">— Choisir —</option>
              {LEVELS_PROFILE.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          ), "level")}

          {field("🎯 Objectif d'apprentissage", (
            <select style={S.input} value={p.goal} onChange={(e) => set("goal", e.target.value)}>
              <option value="">— Choisir —</option>
              {GOALS_PROFILE.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          ), "goal")}

          <div style={{ gridColumn: "1 / -1" }}>
            {field("🏫 École ou lieu de travail", (
              <input style={S.input} value={p.school} placeholder="ex. Lycée Chu Văn An / Entreprise ABC"
                onChange={(e) => set("school", e.target.value)} />
            ), "school")}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
          <button style={{ ...S.btn(true), opacity: saving ? 0.65 : 1, display: "inline-flex", alignItems: "center", gap: 8 }}
            disabled={saving} onClick={submit}>
            {saving && <span className="mcf-spin" style={{ width: 14, height: 14, borderRadius: "50%",
              border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", display: "inline-block" }} />}
            {saving ? "Enregistrement…" : "💾 Enregistrer"}
          </button>
          {p.updatedAt && <span style={{ fontSize: 12, color: C.soft }}>
            Dernière mise à jour : {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
          </span>}
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: toast.startsWith("✅") ? C.ok : C.danger, color: "#fff", padding: "12px 26px",
          borderRadius: 999, fontWeight: 700, fontSize: 14, boxShadow: "0 10px 30px rgba(17,24,39,.35)" }}>{toast}</div>
      )}
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
/* ============ ORDONNANCEMENT — Duolingo-style word ordering (dnd-kit) ============ */

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
  const [imgZoom, setImgZoom] = useState(false); // 🔍 lightbox ảnh đề bài
  const answersRef = React.useRef(answers);
  answersRef.current = answers;
  const [confirmCount, setConfirmCount] = useState(null);   // ⚠️ modal copie incomplète
  const t = useT();
  const startedAtRef = React.useRef(Date.now());   // ⏱ đo thời lượng làm bài
  React.useEffect(() => {
    (async () => {
      const saved = await load(`mcf-began-${ex.id}-${name}`, null, false);
      if (saved) startedAtRef.current = saved;
      else await save(`mcf-began-${ex.id}-${name}`, startedAtRef.current, false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      n + (q.type === "qcm" ? (a[q.id] === q.answer ? 1 : 0)
        : q.type === "vf" ? (vfOk(q, a[q.id]) ? 1 : 0)
        : q.type === "tableau" ? (tableauOk(q, a[q.id]) ? 1 : 0)
        : q.type === "ordre" ? (ordreOk(q, a[q.id]) ? 1 : 0)
        : (fillOk(q, a[q.id]) ? 1 : 0)), 0);
    const sub = {
      id: uid(), exerciseId: ex.id, student: name, answers: a,
      autoScore, autoMax: autos.length, openMarks: {}, qComments: {},
      late: isLate(ex), at: Date.now(), comment: "", graded: false, timedOut: true,
      durationMs: Date.now() - startedAtRef.current,
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
    : q.type === "tableau" ? tableauCells(q).every((k) => answers[q.id] && answers[q.id][k])
    : q.type === "ordre" ? (Array.isArray(answers[q.id]) && answers[q.id].length === (q.elements || []).length)
    : q.type === "vf" ? (answers[q.id]?.choice != null && (answers[q.id].choice === 2 || (answers[q.id].just || "").trim() !== ""))
    : q.type === "open" ? stripHtml(answers[q.id]) !== ""
    : (answers[q.id] || "").trim() !== "");

  const submit = async () => {
    setSaving(true); setErr("");
    const autos = ex.questions.filter(autoQ);
    const autoScore = autos.reduce((n, q) =>
      n + (q.type === "qcm" ? (answers[q.id] === q.answer ? 1 : 0)
        : q.type === "vf" ? (vfOk(q, answers[q.id]) ? 1 : 0)
        : q.type === "tableau" ? (tableauOk(q, answers[q.id]) ? 1 : 0)
        : q.type === "ordre" ? (ordreOk(q, answers[q.id]) ? 1 : 0)
        : (fillOk(q, answers[q.id]) ? 1 : 0)), 0);
    const sub = {
      id: uid(), exerciseId: ex.id, student: name, answers,
      durationMs: Date.now() - startedAtRef.current,
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
              background: answers[q.id] === j ? C.primarySoft : "var(--mcf-surface)",
              color: answers[q.id] === j ? C.primary : C.ink }}>
              <input type="radio" name={q.id} disabled={locked} checked={answers[q.id] === j} onChange={() => setAnswers({ ...answers, [q.id]: j })} />
              <strong>{String.fromCharCode(65 + j)}.</strong> {o}
            </label>
          ))}
        </div>
      ) : q.type === "ordre" ? (
        <OrdreBlocks q={q} value={answers[q.id] || []} readOnly={locked}
          onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
      ) : q.type === "tableau" ? (
        <TableauCompare q={q} value={answers[q.id] || {}} readOnly={locked}
          onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
      ) : q.type === "vf" ? (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {VF_OPTS.map((o, j) => {
              const sel = answers[q.id]?.choice === j;
              return (
                <button key={j} disabled={locked}
                  onClick={() => setAnswers({ ...answers, [q.id]: { choice: j, just: j === 2 ? "" : (answers[q.id]?.just || "") } })}
                  style={{ padding: "10px 22px", borderRadius: 999, fontSize: 14.5, fontWeight: 700, cursor: locked ? "default" : "pointer",
                    fontFamily: "inherit", border: `1.5px solid ${sel ? C.primary : C.line}`,
                    background: sel ? C.primarySoft : "var(--mcf-surface)", color: sel ? C.primary : C.ink }}>
                  {o}
                </button>
              );
            })}
          </div>
          {(answers[q.id]?.choice === 0 || answers[q.id]?.choice === 1) && (
            <textarea disabled={locked} value={answers[q.id]?.just || ""}
              placeholder="Justifiez votre réponse en citant le texte…"
              onChange={(e) => setAnswers({ ...answers, [q.id]: { ...answers[q.id], just: e.target.value } })}
              style={{ ...S.input, minHeight: 60, resize: "vertical" }} />
          )}
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
        <button onClick={() => setZen(false)} title="Quitter le mode Focus"
          style={{ position: "fixed", top: 16, right: 16, zIndex: 120, display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
            background: C.ink, color: "var(--mcf-bg)", fontWeight: 700, fontSize: 13.5,
            boxShadow: "0 8px 22px rgba(17,24,39,.3)" }}>
          ⤡ Quitter le Focus
        </button>
      )}
      <div style={zen ? { maxWidth: 920, margin: "0 auto" } : undefined}>
      {/* ⏱ Đồng hồ đếm ngược trôi nổi */}
      {remaining != null && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100,
          display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999,
          background: remaining <= 300 ? C.danger : "#111827", color: "#fff", border: "1px solid var(--mcf-line)", fontWeight: 800, fontSize: 17,
          boxShadow: "0 8px 22px rgba(27,37,89,.35)", fontVariantNumeric: "tabular-nums" }}>
          ⏱ {fmtLeft(remaining)}
        </div>
      )}
      {locked && (
        <div className="mcf-card" style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.danger}`, fontWeight: 700, color: C.danger }}>
          ⏰ Temps écoulé ! Ta copie a été rendue automatiquement.
        </div>
      )}
      <h2 style={{ ...S.display, marginTop: 0 }}>{ex.title} <span style={{ fontSize: 13, color: C.soft, fontFamily: "'Be Vietnam Pro',sans-serif" }}>({ex.level} · {exSkills(ex).join(" + ")})</span></h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        {!zen && (
          <button onClick={() => setZen(true)}
            style={{ ...S.btn(false), padding: "7px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 7 }}>
            🎯 Focus
          </button>
        )}
        {ex.timeLimit && !locked && <span style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>⏱ Temps limite : {ex.timeLimit} minutes</span>}
        {ex.deadline && <span style={{ fontSize: 13, color: isLate(ex) ? C.danger : C.warn, fontWeight: 700 }}>
          ⏰ {isLate(ex) ? "Date limite dépassée — la copie sera marquée en retard" : `À rendre avant le ${fmtDate(ex.deadline)}`}
        </span>}
        <span style={{ fontSize: 12, color: C.soft }}>{savedAt ? `💾 Brouillon enregistré à ${savedAt.toLocaleTimeString("fr-FR")}` : "💾 Enregistrement automatique activé"}</span>
      </div>

      {/* 🎧 Audio player cố định (sticky) — cuộn trang vẫn thấy */}
      {ex.consigne && (
        <div className="mcf-card" style={{ ...S.card, marginBottom: 16, borderLeft: `4px solid ${C.primary}` }}>
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
        <button style={{ ...S.btn(true), opacity: !saving && !locked ? 1 : 0.4 }} disabled={saving || locked}
          onClick={() => {
            const n = getUnansweredQuestionsCount(answers, ex.questions);
            if (n > 0) setConfirmCount(n); else submit();
          }}>
          {saving ? t("sending") : t("submit_copy")}
        </button>
        <button style={S.btn(false)} onClick={done}>{t("quit_draft")}</button>
      </div>
      {confirmCount != null && (
        <ConfirmSubmitModal count={confirmCount}
          onCancel={() => setConfirmCount(null)}
          onConfirm={() => { setConfirmCount(null); submit(); }} />
      )}
      </div>
    </div>
  );
}

/* ---- Xuất dùng chung cho PracticeHub ---- */
/* Không export gì ngoài `App` nữa.
   Trước đây PracticeHub.jsx import ngược 24 thứ từ đây, tạo import vòng
   App ⇄ PracticeHub. Mọi thứ dùng chung nay nằm ở src/shared/, src/editor/
   và src/screens/ — cả hai bên cùng import xuống, không ai import ngang. */


/* ================= 🛡️ Lưới an toàn toàn cục =================
   Bất kỳ lỗi runtime nào cũng hiện hộp đỏ có thông báo + stack
   thay vì màn hình trắng, giúp chẩn đoán ngay lập tức. */
class RootErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null, info: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { this.setState({ info }); }
  render() {
    if (this.state.err) {
      const msg = String(this.state.err?.message || this.state.err);
      const stack = String(this.state.info?.componentStack || this.state.err?.stack || "").split("\n").slice(0, 8).join("\n");
      return (
        <div style={{ minHeight: "100vh", background: "#F8F9FA", padding: 24, fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif", color: "#111827" }}>
          <div style={{ maxWidth: 720, margin: "40px auto", background: "#fff", border: "1px solid #EEF0F4",
            borderTop: "5px solid #DE4B4B", borderRadius: 24, padding: 28, boxShadow: "0 10px 30px rgba(17,24,39,.08)" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
            <h2 style={{ margin: "0 0 6px", fontSize: 21, fontWeight: 800 }}>Une erreur est survenue</h2>
            <p style={{ fontSize: 13.5, color: "#6B7280", margin: "0 0 16px" }}>
              Envoyez cette capture d'écran au développeur / Gửi ảnh chụp màn hình này để được hỗ trợ.
            </p>
            <div style={{ background: "#FDEEEE", color: "#B42318", border: "1px solid #F5C2C2", borderRadius: 12,
              padding: "12px 16px", fontFamily: "monospace", fontSize: 13.5, fontWeight: 700, wordBreak: "break-word" }}>
              {msg}
            </div>
            {stack && (
              <pre style={{ marginTop: 12, background: "#F4F6FB", borderRadius: 12, padding: "12px 16px",
                fontSize: 11.5, lineHeight: 1.6, overflowX: "auto", color: "#374151", whiteSpace: "pre-wrap" }}>{stack}</pre>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <button onClick={() => window.location.reload()}
                style={{ padding: "11px 22px", borderRadius: 999, border: "none", cursor: "pointer",
                  background: C.primary, color: "#fff", fontWeight: 700, fontFamily: "inherit", fontSize: 14 }}>
                ↻ Recharger la page
              </button>
              <button onClick={() => { try { localStorage.removeItem("mcf-session"); } catch {} window.location.reload(); }}
                style={{ padding: "11px 22px", borderRadius: 999, border: "1.5px solid #EEF0F4", cursor: "pointer",
                  background: "#fff", color: "#111827", fontWeight: 700, fontFamily: "inherit", fontSize: 14 }}>
                🚪 Se déconnecter et recharger
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return <RootErrorBoundary><AppInner /></RootErrorBoundary>;
}
