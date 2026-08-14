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
import HomeDashboard from "./screens/dashboard/HomeDashboard.jsx";

const VI = {
  /* Phải khớp đủ các khoá mà navItems.js dùng. Thiếu khoá nào thì t() trả về
     chính tên khoá, và thanh bên hiện "nav.todo" thay vì "Cần làm" — trang
     xem thử khi đó nói dối về diện mạo thật. */
  nav: { dashboard: "Trang chủ", exercises: "Thư viện bài tập", students: "Theo dõi học sinh",
    practice: "Luyện tập", progress: "Tiến độ của tôi", settings: "Cài đặt",
    todo: "Cần làm", done: "Đã nộp", account: "Tài khoản", stats: "Thống kê",
    primary: "Điều hướng chính", collapse: "Thu gọn thanh bên", expand: "Mở rộng thanh bên",
    close: "Đóng menu" },
  header: { teacher: "Giáo viên", student: "Học sinh", logout: "Đăng xuất",
    search: "Tìm bài tập, học sinh…", dark_mode: "Chuyển sang nền tối", light_mode: "Chuyển sang nền sáng" },
  empty: { no_submission: "Hiện tại chưa có bài nộp nào." },
  /* Chân thanh bên đổi sang lối "Đăng nhập" khi session là null — trạng thái
     chỉ xuất hiện từ khi có chế độ khách, nên khoá này trước đây chưa cần. */
  login: { signin: "Đăng nhập" },
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
  home: {
    welcome_back: "Chào mừng trở lại, {name}!",
    welcome_guest: "Chào mừng tới FRACILE",
    hero_sub_user: "Tiếp tục chỗ bạn đang dở, hoặc thử một bài mới ra.",
    hero_sub_guest: "Học tiếng Pháp qua bài tập có chấm điểm. Xem thử không cần tài khoản.",
    discover: "Khám phá bài mới",
    todo_title: "Cần làm",
    start: "Bắt đầu",
    new_practice: "Mới ra · Luyện tập",
    see_all: "Xem tất cả",
    questions: "{n} câu",
    minutes: "{n} phút",
    no_practice_title: "Chưa có bài luyện tập nào",
    no_practice_body: "Giáo viên chưa đăng bài luyện tập nào. Quay lại sau nhé.",
    guest_promo_title: "Tạo tài khoản để lưu tiến độ",
    guest_promo_body: "Không có tài khoản thì điểm và bài đã làm sẽ không được ghi lại.",
    signup: "Đăng ký",
    hours_title: "Giờ học",
    hours_empty: "Chưa tính được — hệ thống chưa ghi thời gian học theo ngày.",
    activity_title: "Hoạt động gần đây",
    activity_empty: "Bài bạn nộp sẽ hiện ở đây.",
    scroll_prev: "Xem thẻ trước",
    scroll_next: "Xem thẻ sau",
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

/* Fixture cho HomeDashboard — CHỈ sống trong trang xem thử này.

   Đây là chỗ duy nhất trong dự án được phép có bài tập bịa. Nhúng chúng vào
   chính component thì học sinh thật sẽ thấy bài không tồn tại và bấm vào là
   hỏng; ở đây thì không đường nào chạm tới người dùng.

   `createdAt` là số mili-giây như PracticeHub sinh ra, đảo lộn có chủ ý để
   thấy rõ việc sắp xếp "mới nhất trước" có thật sự chạy. */
const hoursAgo = (h) => Date.now() - h * 3600000;

const mockRecentExercises = [
  { id: "p1", title: "Les expressions de la cause", level: "B1", skills: ["Grammaire"],
    questions: qs(15), timeLimit: 20, createdAt: hoursAgo(2) },
  { id: "p2", title: "Au téléphone : prendre un rendez-vous", level: "A2", skills: ["Écoute"],
    questions: qs(10), timeLimit: 15, createdAt: hoursAgo(30) },
  { id: "p3", title: "Le subjonctif présent", level: "B2", skills: ["Grammaire"],
    questions: qs(18), timeLimit: 25, createdAt: hoursAgo(6) },
  { id: "p4", title: "Vocabulaire : la santé", level: "A1", skills: ["Vocabulaire"],
    questions: qs(12), createdAt: hoursAgo(96) },
  { id: "p5", title: "Lire un article de presse", level: "B2", skills: ["Lecture"],
    questions: qs(8), timeLimit: 30, createdAt: hoursAgo(50) },
  { id: "p6", title: "Traduire des proverbes", level: "B2+", skills: ["Traduction"],
    questions: qs(9), createdAt: hoursAgo(12) },
  { id: "p7", title: "Se présenter à l'oral", level: "A1", skills: ["Communication"],
    questions: qs(6), timeLimit: 10, createdAt: hoursAgo(72) },
];

/* Bài "Cần làm" đi qua nextUp(), vốn lọc theo người được giao và bỏ bài đã
   nộp — nên fixture phải là bài CHƯA có trong SUBMISSIONS của Linh, nếu
   không khối này sẽ rỗng và trông như hỏng. */
const mockPendingTasks = [
  { id: "t1", title: "Le passé composé", level: "B1", skills: ["Grammaire"],
    questions: qs(14), deadline: day(-2), createdAt: hoursAgo(120) },
  { id: "t2", title: "Rédiger une lettre formelle", level: "B2", skills: ["Production écrite"],
    questions: qs(6), deadline: day(5), createdAt: hoursAgo(20) },
];

function Preview() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("vi");
  const [role, setRole] = useState("eleve");
  const [empty, setEmpty] = useState(false);
  /* Hai công tắc riêng cho trang chủ chung: mở nó ra, và xem nó dưới con mắt
     người chưa đăng nhập — đó là trạng thái dễ quên kiểm nhất. */
  const [home, setHome] = useState(false);
  const [guest, setGuest] = useState(false);

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
      <button type="button" onClick={() => setHome((h) => !h)}
        className="rounded-md border border-solid border-line bg-surface px-4 py-2 text-sm font-bold text-ink shadow-sm">
        Màn hình: {home ? "Trang chủ chung" : "Dashboard"}
      </button>
      {home && (
        <button type="button" onClick={() => setGuest((g) => !g)}
          className="rounded-md border border-solid border-line bg-surface px-4 py-2 text-sm font-bold text-ink shadow-sm">
          Phiên: {guest ? "khách" : "đã đăng nhập"}
        </button>
      )}
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

  /* Thanh bên phải theo đúng trạng thái đang xem. Để nguyên session khi bật
     chế độ khách thì trang xem thử nói dối: khách sẽ thấy tên và nút Đăng
     xuất của người khác. */
  const shell = (
    <AppLayout
      session={home && guest ? null : session}
      t={t} lang={lang} langs={LANGS} onLang={setLang}
      dark={dark} onToggleDark={toggleDark} onLogout={() => {}} bell={null}
    />
  );

  return (
    <MemoryRouter initialEntries={[home ? "/decouvrir" : ROLE_HOME[role]]} key={`${role}-${home}`}>
      <Routes>
        <Route element={shell}>
          {/* Trang chủ chung. `practice` truyền thẳng fixture nên component
              không gọi mạng; `onOpen` rỗng để bấm thẻ không rời trang xem
              thử. Khách = session null, đúng thứ App.jsx đưa vào lúc chạy. */}
          <Route path="/decouvrir" element={
            <><Controls />
              <HomeDashboard
                session={guest ? null : { role: "eleve", name: "Linh" }}
                exercises={empty ? [] : mockPendingTasks}
                submissions={[]}
                practice={empty ? [] : mockRecentExercises}
                t={t}
                onOpen={() => {}}
                onRequireLogin={() => {}}
              />
            </>
          } />
          <Route path="/professeur/dashboard" element={
            <><Controls /><TeacherDashboard exercises={exercises} submissions={submissions} accounts={ACCOUNTS} t={t} /></>
          } />
          <Route path="/professeur/exercices" element={<Stub label={t("nav.exercises")} />} />
          <Route path="/professeur/eleves" element={<Stub label={t("nav.students")} />} />
          <Route path="/professeur/parametres" element={<Stub label={t("nav.settings")} />} />

          <Route path="/etudiant/dashboard" element={
            <><Controls /><StudentDashboard name="Linh" exercises={exercises} submissions={submissions}
              practice={empty ? [] : mockRecentExercises}
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
