import './storageShim.js'
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import AppLayout from './layout/AppLayout.jsx'
import RequireRole from './routes/RequireRole.jsx'
import LoginGate from './screens/LoginGate.jsx'
import { ROLE_HOME, TEACHER_NAV, STUDENT_NAV } from './layout/navItems.js'

import { C } from './shared/tokens.js'
import { load } from './shared/storage.js'
import { LANG_KEY, LANGS, I18N, getLang, LangCtx, digKey } from './shared/i18n.jsx'

import PracticeHub from './PracticeHub.jsx'
import Bell from './screens/student/Bell.jsx'
import Student from './screens/student/Student.jsx'
import { Teacher } from './screens/teacher/TeacherScreens.jsx'
import StudentDashboard from './screens/dashboard/StudentDashboard.jsx'
import TeacherDashboard from './screens/dashboard/TeacherDashboard.jsx'
import SoftDashboard from './screens/dashboard/SoftDashboard.jsx'
import LoginSplit from './screens/LoginSplit.jsx'

/* App.jsx chỉ còn ba việc: giữ state phiên + dữ liệu, định tuyến, và bắt lỗi.
   Mọi màn hình nằm ở src/screens/, mọi thứ dùng chung ở src/shared/. */
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

  /* Auto-login: khôi phục phiên từ localStorage khi app khởi chạy.

     `authChecked` tồn tại để không render route nào trước khi biết chắc
     người dùng đã đăng nhập hay chưa. Thiếu nó, có đúng một lần render với
     loading=false và session=null: RequireRole đẩy về /login, phiên khôi
     phục xong thì /login đẩy tiếp về trang chủ — và địa chỉ người dùng gõ
     vào bị mất giữa hai lần chuyển hướng. Mọi deep-link đều rơi về dashboard. */
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (loading) return;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.role === "prof") setSessionRaw(saved);
      else if (saved.role === "eleve" && accounts.some((a) => a.name === saved.name)) setSessionRaw(saved);
      else localStorage.removeItem(SESSION_KEY);
    } catch {} finally {
      setAuthChecked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // 🌙 Đồng bộ class dark lên <html> để các lớp Portal (ngoài .mcf-root) đọc đúng biến CSS
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("mcf-dark-root", !!dark);
  }, [dark]);

  // Hồ sơ học sinh — Dashboard đọc mục tiêu DELF từ đây.
  // Cửa đăng nhập bật lên khi khách bấm vào việc cần tài khoản.
  const [gate, setGate] = useState(null);
  const [profiles, setProfiles] = useState({});
  useEffect(() => { load("mcf-profiles", {}).then((p) => setProfiles(p || {})); }, []);

  if (loading || !authChecked) {
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

  /* Mỗi mục điều hướng có `view` sẽ thành một route render đúng tab đó.
     Sinh từ chính bảng nav để hai bên không thể lệch nhau: thêm một mục vào
     navItems.js là có route tương ứng, không phải nhớ sửa hai chỗ. */
  const teacherRoute = (view) => (
    <Teacher routeView={view} {...{ exercises, setExercises, submissions, setSubmissions, accounts, setAccounts, classes, setClasses, refresh }} />
  );
  const studentRoute = (view) => (
    <Student routeView={view} name={session?.name} {...{ exercises, submissions, setSubmissions, accounts, setAccounts, refresh }} />
  );

  return (
    <LangCtx.Provider value={lang}>
      <div className={"mcf-root" + (dark ? " mcf-dark" : "")}>
        <BrowserRouter>
          <Routes>
            {/* Bản thiết kế Soft UI — màn hình độc lập, tự dựng sidebar và
                chiếm trọn màn hình nên KHÔNG lồng vào shell của AppLayout. */}
            <Route path="/soft" element={<SoftDashboard />} />

            {/* Đăng nhập: email + mật khẩu qua Supabase Auth. Đường PIN cũ
                (tên + mã giáo viên cấp) đã gỡ sau khi tài khoản di trú xong —
                xem lịch sử git nếu cần dựng lại. */}
            <Route
              path="/login"
              element={
                session ? (
                  <Navigate to={ROLE_HOME[session.role] || "/login"} replace />
                ) : (
                  <LoginSplit
                    accounts={accounts}
                    onLogin={(s) => { setSession(s); refresh(); }}
                  />
                )
              }
            />

            <Route element={<RequireRole session={session} role="prof">{shell}</RequireRole>}>
              <Route path="/professeur/dashboard"
                element={<TeacherDashboard {...{ exercises, submissions, accounts, t }} />} />
              {TEACHER_NAV.filter((i) => i.view).map((i) => (
                <Route key={i.to} path={i.to} element={teacherRoute(i.view)} />
              ))}
              <Route path="/professeur/*" element={<Navigate to="/professeur/dashboard" replace />} />
            </Route>

            <Route element={<RequireRole session={session} role="eleve">{shell}</RequireRole>}>
              <Route path="/etudiant/dashboard"
                element={<StudentDashboard name={session?.name} profile={profiles[session?.name]}
                  {...{ exercises, submissions, t }} />} />
              {STUDENT_NAV.filter((i) => i.view).map((i) => (
                <Route key={i.to} path={i.to} element={studentRoute(i.view)} />
              ))}
              <Route path="/etudiant/*" element={<Navigate to="/etudiant/dashboard" replace />} />
            </Route>

            {/* Chế độ khách: thư viện luyện tập mở cho người chưa đăng nhập.
                Không đẩy về /login nữa — khách xem được có gì trước khi quyết
                định lập tài khoản. Chặn nằm ở hành động (bấm vào làm bài),
                không nằm ở đường vào. */}
            <Route path="/decouvrir" element={
              <AppLayout
                session={null} t={t} lang={lang} langs={LANGS} onLang={setLang}
                dark={dark} onToggleDark={toggleTheme} onLogout={() => {}} bell={null}
              />
            }>
              <Route index element={<PracticeHub role="guest" name="" onRequireLogin={() => setGate({})} />} />
            </Route>

            <Route path="*" element={
              <Navigate to={session ? (ROLE_HOME[session.role] || "/login") : "/decouvrir"} replace />
            } />
          </Routes>
          {gate && (
            <LoginGate
              accounts={accounts}
              onLogin={(sess) => { setSession(sess); setGate(null); refresh(); }}
              onClose={() => setGate(null)}
            />
          )}
        </BrowserRouter>
      </div>
    </LangCtx.Provider>
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
