/* Trang xem thử — TẠM THỜI, chỉ để kiểm chứng thị giác.
   Cố tình KHÔNG import App.jsx, vì App.jsx kéo theo storageShim.js vốn mở
   kết nối tới Supabase thật. Trang này không chạm vào dữ liệu nào.
   Dữ liệu dưới đây là fixture kiểm thử, không phải số hiển thị cho học sinh. */
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/tailwind.css";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout.jsx";
import { ROLE_HOME } from "./layout/navItems.js";
import StudentDashboard from "./screens/dashboard/StudentDashboard.jsx";
import TeacherDashboard from "./screens/dashboard/TeacherDashboard.jsx";

const VI = {
  nav: { dashboard: "Tổng quan", exercises: "Thư viện bài tập", students: "Theo dõi học sinh",
    practice: "Luyện tập", progress: "Tiến độ của tôi", settings: "Cài đặt",
    primary: "Điều hướng chính", collapse: "Thu gọn thanh bên", expand: "Mở rộng thanh bên" },
  header: { teacher: "Giáo viên", student: "Học sinh", logout: "Đăng xuất",
    search: "Tìm bài tập, học sinh…", dark_mode: "Chuyển sang nền tối", light_mode: "Chuyển sang nền sáng" },
  empty: { no_submission: "Hiện tại chưa có bài nộp nào." },
  lang_label: "Ngôn ngữ",
  dash: {
    hello: "Xin chào", goal: "Mục tiêu", no_goal: "Bạn chưa đặt mục tiêu. Vào Cài đặt để chọn.",
    no_exercise_yet: "Chưa có bài tập nào được giao cho bạn.",
    completion: "Bài đã hoàn thành", submitted: "Đã nộp", of_assigned: "trên {n} bài được giao",
    profile_completion: "Hồ sơ hoàn thiện {pct}%",
    profile_hint: "Điền nốt để giáo viên hiểu rõ trình độ và mục tiêu của bạn.",
    avg_score: "Điểm trung bình", avg_empty: "Chưa có bài nào được chốt điểm",
    pending: "Đang chờ làm", overdue: "{n} bài đã quá hạn",
    streak: "Chuỗi ngày học",
    streak_empty: "Chưa tính được — hệ thống chưa ghi hoạt động theo ngày",
    skills: "Mức độ đồng đều theo kỹ năng", skills_note: "Tính từ các bài đã được chốt điểm.",
    skills_empty_title: "Chưa đủ dữ liệu để vẽ",
    skills_empty_body: "Cần bài đã chốt điểm ở ít nhất 3 kỹ năng khác nhau.",
    continue: "Học tiếp", continue_empty_title: "Không còn bài nào đang chờ",
    continue_empty_body: "Bạn đã nộp hết bài được giao.",
    questions: "{n} câu", due: "Hạn nộp", was_due: "Đã quá hạn",
    to_grade: "Bài cần chấm", recent_submissions: "Bài nộp gần đây",
    recent_empty_body: "Bài nộp của học sinh sẽ hiện ở đây.", awaiting: "Chờ chấm",
    nothing_assigned_title: "Chưa được giao bài nào",
  },
};
const dig = (o, k) => k.split(".").reduce((x, p) => (x == null ? undefined : x[p]), o);
const t = (key, vars) => {
  let s = dig(VI, key);
  if (typeof s !== "string") return key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
};
const LANGS = [["vi", "🇻🇳", "Tiếng Việt"], ["fr", "🇫🇷", "Français"], ["en", "🇬🇧", "English"]];

const day = (n) => new Date(Date.now() + n * 86400000).toISOString();
const qs = (n) => Array.from({ length: n }, (_, i) => ({ id: "q" + i, type: "qcm" }));

/* Fixture: 6 bài, 4 đã nộp và chốt điểm ở 4 kỹ năng khác nhau. */
const EXERCISES = [
  { id: "e1", title: "Les articles définis", level: "A1", skills: ["Grammaire"], questions: qs(10), deadline: day(-3) },
  { id: "e2", title: "Compréhension : Le marché", level: "A2", skills: ["Lecture"], questions: qs(8), deadline: day(-1) },
  { id: "e3", title: "Dictée n°4", level: "A2", skills: ["Écoute"], questions: qs(12), deadline: day(-6) },
  { id: "e4", title: "Vocabulaire de la ville", level: "B1", skills: ["Vocabulaire"], questions: qs(15), deadline: day(-9) },
  { id: "e5", title: "Le passé composé", level: "B1", skills: ["Grammaire"], questions: qs(14), deadline: day(-2) },
  { id: "e6", title: "Rédiger une lettre formelle", level: "B2", skills: ["Production écrite"], questions: qs(6), deadline: day(5) },
];
const SUBMISSIONS = [
  { id: "s1", exerciseId: "e1", student: "Linh", autoScore: 9, autoMax: 10, graded: true, openMarks: {}, at: day(-3) },
  { id: "s2", exerciseId: "e2", student: "Linh", autoScore: 6, autoMax: 8, graded: true, openMarks: {}, at: day(-1) },
  { id: "s3", exerciseId: "e3", student: "Linh", autoScore: 7, autoMax: 12, graded: true, openMarks: {}, at: day(-6) },
  { id: "s4", exerciseId: "e4", student: "Linh", autoScore: 13, autoMax: 15, graded: true, openMarks: {}, at: day(-9) },
  { id: "s5", exerciseId: "e1", student: "Minh", autoScore: 5, autoMax: 10, graded: false, openMarks: {}, at: day(-2) },
];
const ACCOUNTS = [{ name: "Linh" }, { name: "Minh" }, { name: "Trang" }];

function Preview() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("vi");
  const [role, setRole] = useState("eleve");
  const [empty, setEmpty] = useState(false);

  const toggleDark = () =>
    setDark((d) => { document.documentElement.classList.toggle("mcf-dark-root", !d); return !d; });

  const exercises = empty ? [] : EXERCISES;
  const submissions = empty ? [] : SUBMISSIONS;
  const session = { role, name: role === "prof" ? "" : "Linh" };

  const Controls = () => (
    <div className="mb-4 flex flex-wrap gap-2">
      <button type="button" onClick={() => setRole((r) => (r === "prof" ? "eleve" : "prof"))}
        className="rounded-md border border-solid border-line bg-surface px-4 py-2 text-sm font-bold text-ink shadow-sm">
        Vai trò: {role}
      </button>
      <button type="button" onClick={() => setEmpty((e) => !e)}
        className="rounded-md border border-solid border-line bg-surface px-4 py-2 text-sm font-bold text-ink shadow-sm">
        Dữ liệu: {empty ? "rỗng" : "có"}
      </button>
    </div>
  );

  const Stub = ({ label }) => (
    <>
      <Controls />
      <div className="rounded-md border border-solid border-line bg-surface p-6 shadow-sm">
        <p className="text-sm text-soft">Mục « {label} » — màn hình cũ sẽ render ở đây.</p>
      </div>
    </>
  );

  const shell = (
    <AppLayout
      session={session}
      t={t} lang={lang} langs={LANGS} onLang={setLang}
      dark={dark} onToggleDark={toggleDark} onLogout={() => {}} bell={null}
    />
  );

  return (
    <MemoryRouter initialEntries={[ROLE_HOME[role]]} key={role}>
      <Routes>
        <Route element={shell}>
          <Route path="/professeur/dashboard" element={
            <><Controls /><TeacherDashboard exercises={exercises} submissions={submissions} accounts={ACCOUNTS} t={t} /></>
          } />
          <Route path="/professeur/exercices" element={<Stub label={t("nav.exercises")} />} />
          <Route path="/professeur/eleves" element={<Stub label={t("nav.students")} />} />
          <Route path="/professeur/parametres" element={<Stub label={t("nav.settings")} />} />

          <Route path="/etudiant/dashboard" element={
            <><Controls /><StudentDashboard name="Linh" exercises={exercises} submissions={submissions}
              profile={{ goal: "DELF B1" }} t={t} /></>
          } />
          <Route path="/etudiant/bibliotheque" element={<Stub label={t("nav.practice")} />} />
          <Route path="/etudiant/progression" element={<Stub label={t("nav.progress")} />} />
          <Route path="/etudiant/parametres" element={<Stub label={t("nav.settings")} />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Preview /></React.StrictMode>,
);
