/* Trang xem thử — TẠM THỜI, chỉ để kiểm chứng thị giác.
   Cố tình KHÔNG import App.jsx, vì App.jsx kéo theo storageShim.js vốn mở
   kết nối tới Supabase thật. Trang này không chạm vào dữ liệu nào.
   Dữ liệu dưới đây là fixture kiểm thử, không phải số hiển thị cho học sinh.

   ══ MÀN NÀO KHÔNG ĐƯỢC ĐƯA VÀO ĐÂY ══

   Bất cứ màn nào import tới `exerciseStore`, `examStore`, `profileStore`,
   `identity` — nói chung là tới `storageShim`. Chúng mở kết nối Supabase thật
   ngay lúc nạp module, và khi đó trang này không còn là bản dựng khô nữa.

   Đã thử một lần với danh sách bài của giáo viên (TeacherScreens) để bấm kiểm
   nút « Dupliquer », và nó GỬI THẬT một lệnh ghi lên production — bị RLS từ
   chối vì không có phiên giáo viên, nhưng chỉ vì thế mà thôi. Cạnh nút ấy là
   « Supprimer », gọi `deleteExercise`. Người mở trang này trên trình duyệt
   đang có phiên giáo viên mà bấm nhầm thì xoá bài thật.

   Trang này KHÔNG được deploy: Vite chỉ dựng `index.html`, và `dist/` không
   có `preview.html`. Nên rủi ro ở trên chỉ tồn tại khi chạy `npm run dev` trên
   máy của người đang đăng nhập bằng tài khoản giáo viên. Vẫn đủ để không làm.

   Ghi rõ vì tôi từng kết luận ngược: `https://www.fracile.vn/preview.html` trả
   200, và tôi đọc đó là "đang được deploy". Thật ra `vercel.json` rewrite MỌI
   đường dẫn về `/index.html`, nên một đường bịa hẳn tên cũng trả 200. Muốn
   biết một tệp có thật hay không thì so nội dung với trang chủ, đừng nhìn mã
   trạng thái.

   Muốn kiểm loại màn đó thì dựng riêng phần giao diện với hàm truyền vào —
   như `ONhapUsername` nhận `hoiConTrong` thay vì tự import. */
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/tailwind.css";
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import AppLayout from "./layout/AppLayout.jsx";
import { ROLE_HOME, TEACHER_NAV, STUDENT_NAV } from "./layout/navItems.js";

/* Những đường dẫn trang xem thử tự dựng màn hình THẬT (không phải Stub).
   Danh sách này là lý do duy nhất một mục menu được phép không sinh Stub. */
const PREVIEW_CO_SAN = ["/professeur/dashboard", "/professeur/carnet",
  "/etudiant/dashboard", "/etudiant/calendrier"];
import StudentDashboard from "./screens/dashboard/StudentDashboard.jsx";
import TeacherDashboard from "./screens/dashboard/TeacherDashboard.jsx";
import HomeDashboard from "./screens/dashboard/HomeDashboard.jsx";
import CalendarView from "./screens/calendar/CalendarView.jsx";
import PESelfEvaluation from "./screens/student/PESelfEvaluation.jsx";
import { PhanThi } from "./screens/exam/ExamMode.jsx";
import GrilleEditor from "./screens/teacher/GrilleEditor.jsx";
import TipsEditor from "./screens/teacher/TipsEditor.jsx";
import { ChonAvatar, ONhapUsername } from "./screens/account/DanhTinh.jsx";
import NotificationDropdown from "./screens/student/NotificationDropdown.jsx";
import { Avatar, DS_AVATAR } from "./shared/avatars.jsx";

const VI = {
  /* Phải khớp đủ các khoá mà navItems.js dùng. Thiếu khoá nào thì t() trả về
     chính tên khoá, và thanh bên hiện "nav.todo" thay vì "Cần làm" — trang
     xem thử khi đó nói dối về diện mạo thật. */
  nav: { dashboard: "Trang chủ", exercises: "Thư viện bài tập", students: "Theo dõi học sinh",
    practice: "Luyện tập", calendar: "Lịch", settings: "Cài đặt",
    todo: "Cần làm", done: "Đã nộp", account: "Tài khoản", stats: "Thống kê", exam: "Thi thử", exams: "Đề thi thử", grading: "Chấm bài viết", oral: "Bài nói", results: "Kết quả thi",
    cards: "Thẻ ghi nhớ",
    primary: "Điều hướng chính", collapse: "Thu gọn thanh bên", expand: "Mở rộng thanh bên",
    menu: "Menu", people: "Lớp của bạn", close: "Đóng menu", open_menu: "Mở menu", tips: "Sổ tay lớp" },
  header: { teacher: "Giáo viên", student: "Học sinh", logout: "Đăng xuất",
    search: "Tìm bài tập, học sinh…", dark_mode: "Chuyển sang nền tối", light_mode: "Chuyển sang nền sáng",
    dark_mode_label: "Nền tối", settings: "Cài đặt" },
  identity: {
    display_name: "Tên hiển thị", display_name_ph: "Tên bạn muốn mọi người thấy",
    display_name_help: "Được trùng với người khác. Đổi lúc nào cũng được.",
    username: "Tên người dùng", username_ph: "vidu_2026",
    username_help: "Chữ thường, số và gạch dưới. Giáo viên tìm bạn bằng tên này.",
    checking: "Đang kiểm tra…", free: "Dùng được", taken: "Tên này đã có người dùng",
    unknown: "Chưa kiểm tra được — kiểm tra lại kết nối mạng",
    bad_ngan: "Quá ngắn — cần ít nhất 3 ký tự",
    bad_dai: "Quá dài — tối đa 20 ký tự",
    bad_bat_dau_so: "Không được bắt đầu bằng chữ số",
    bad_ky_tu_la: "Chỉ dùng chữ thường không dấu, số và gạch dưới",
    avatar_pick: "Chọn ảnh đại diện", avatar_help: "Tám con vật, hoặc chữ cái đầu tên bạn.",
    avatar_letter: "Chữ cái đầu", avatar_change: "Đổi ảnh đại diện", close: "Đóng",
    identity_title: "Danh tính",
  },
  empty: { no_submission: "Hiện tại chưa có bài nộp nào." },
  tips: {
    title: 'Sổ tay lớp', subtitle: 'Mẹo hiện trong sổ tay của học sinh',
    add: 'Thêm mẹo', edit: 'Sửa', delete: 'Xoá', cancel: 'Huỷ', save: 'Lưu',
    confirm_delete: 'Xoá hẳn mẹo này?',
    move_up: 'Đưa lên trên', move_down: 'Đưa xuống dưới',
    f_title: 'Tiêu đề', f_title_ph: 'Ví dụ: à cause de / grâce à',
    f_body: 'Nội dung', f_body_ph: 'Viết ngắn gọn. Mỗi dòng ở đây là một dòng trong sổ tay.',
    need_title: 'Hãy nhập tiêu đề.',
    err_save: 'Không lưu được. Kiểm tra mạng rồi thử lại.',
    empty_title: 'Chưa có mẹo nào',
    empty_body: 'Thêm mẹo đầu tiên — nó sẽ hiện trong sổ tay của mọi học sinh.',
  },
  carnet: {
    title: 'Sổ tay của tôi', subtitle: 'Mẹo và cấu trúc hay quên',
    open: 'Mở sổ tay', close: 'Đóng sổ tay',
    search: 'Tìm trong sổ tay…',
    empty_title: 'Sổ tay còn trống',
    empty_body: 'Giáo viên chưa thêm mẹo nào. Chúng sẽ hiện ở đây.',
    no_result_title: 'Không tìm thấy gì',
    no_result_body: 'Thử một từ khoá khác, hoặc xoá ô tìm kiếm.',
    count: '{n} mẹo',
  },
  msg: {
    title: "Tin nhắn", title_unread: "Tin nhắn, {n} chưa đọc", new: "Soạn tin mới",
    soon: "Nhắn tin chưa mở",
    empty_title: "Chưa có tin nhắn nào",
    empty_body: "Phần nhắn tin với giáo viên đang được làm. Sẽ mở ở đây.",
  },
  cal: {
    title: "Lịch", week_of: "Tuần của {date}", today: "Hôm nay",
    prev_week: "Tuần trước", next_week: "Tuần sau",
    d1: "Thứ 2", d2: "Thứ 3", d3: "Thứ 4", d4: "Thứ 5", d5: "Thứ 6", d6: "Thứ 7", d0: "CN",
    s1: "T2", s2: "T3", s3: "T4", s4: "T5", s5: "T6", s6: "T7", s0: "CN",
    m1: "Tháng 1", m2: "Tháng 2", m3: "Tháng 3", m4: "Tháng 4", m5: "Tháng 5", m6: "Tháng 6",
    m7: "Tháng 7", m8: "Tháng 8", m9: "Tháng 9", m10: "Tháng 10", m11: "Tháng 11", m12: "Tháng 12",
    new_event: "Sự kiện mới", f_title: "Tiêu đề", f_date: "Ngày", f_time: "Giờ",
    f_title_ph: "Ví dụ: Ôn thi DELF", add: "Thêm vào lịch",
    kind_devoir: "Bài phải nộp", kind_custom: "Cá nhân",
    empty_week: "Tuần này chưa có gì.",
    empty_week_body: "Hạn nộp bài sẽ tự hiện ở đây. Bạn cũng có thể tự thêm sự kiện.",
    deadline_at: "Hạn nộp {time}", saved: "Đã thêm vào lịch.",
    need_title: "Hãy nhập tiêu đề.", delete: "Xoá sự kiện",
  },
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
    streak_unit: "ngày",
    streak_loading: "Đang tính…",
    streak_error: "Không đọc được — thử tải lại trang",
    streak_zero: "Làm một bài hôm nay là bắt đầu chuỗi",
    streak_empty: "Chưa tính được — hệ thống chưa ghi hoạt động theo ngày",
    skills: "Mức độ đồng đều theo kỹ năng",
    skills_note: "Tính từ các bài được giao đã chốt điểm.",
    skills_note_practice: "Tính từ điểm tốt nhất của bạn ở phần luyện tập.",
    skills_note_both: "Tính từ bài được giao đã chốt điểm và điểm tốt nhất ở phần luyện tập. Điểm luyện tập là lần làm tốt nhất, nên thường cao hơn.",
    skills_empty_title: "Chưa đủ dữ liệu để vẽ",
    skills_empty_body: "Hãy làm một bài trong phần Luyện tập, hoặc chờ giáo viên chốt điểm một bài được giao.",
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
/* Thử trình soạn thang: giữ state thật để bấm được, như màn giáo viên. */
function GrilleThu() {
  const [g, setG] = React.useState(null);
  return <div className="mx-auto max-w-6xl py-6">
    <GrilleEditor level="B2" grille={g} onChange={setG} />
    <div className="mt-10 border-t border-line pt-8" id="mat-hoc-sinh">
      <PESelfEvaluation level="B2" rubric={g} />
    </div>
  </div>;
}

/* Một phần thi để xem thử.
 *
 * Màn thi nằm sau đăng nhập VÀ sau một lượt thi đang mở, nên không có đường nào
 * khác để nhìn thấy nó. Mà đúng ở đây mới có hai thứ từng hỏng lặng lẽ:
 *
 *   · `consigne` là HTML — dựng bằng chữ thuần thì học sinh đọc `<div style=…>`
 *   · `imageUrl` — với bài đọc hiểu, ảnh thường CHÍNH LÀ ngữ liệu
 *
 * Ảnh là data URI, không phải link Supabase: fixture không được phụ thuộc vào
 * mạng hay vào dữ liệu thật của lớp học. */
const ANH_MAU =
  "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340">
       <rect width="600" height="340" fill="#EEF2FF"/>
       <text x="300" y="150" font-family="sans-serif" font-size="26" font-weight="700"
             fill="#2563EB" text-anchor="middle">Document de l'exercice</text>
       <text x="300" y="190" font-family="sans-serif" font-size="15"
             fill="#6E7280" text-anchor="middle">affiche · ticket · annonce</text>
     </svg>`);

const PHAN_THI_MAU = {
  code: "CE", label: "Activité 1 — les musées de Paris", minutes: 45, points: 25,
  exercise: {
    id: "xem-thu", title: "Activité 1", level: "B1",
    consigne: '<div style="text-align: center;"><span style="color: var(--mcf-ink);">'
      + "Vous êtes en vacances avec vos parents&nbsp;à Paris.</span></div>"
      + "<div><i>Vous cherchez un musée qui intéresse les adolescents.</i></div>",
    imageUrl: ANH_MAU, readingText: "", audioUrl: "",
    questions: [
      { id: "q1", ord: 0, type: "qcm", prompt: "Quel musée convient le mieux ?",
        options: ["Palais de la découverte", "Grande Galerie", "Arts et Métiers"] },
    ],
  },
};

function PhanThiThu() {
  const [ans, setAns] = useState({});
  return (
    <div className="mx-auto max-w-4xl py-6">
      <PhanThi section={PHAN_THI_MAU} attemptId="xem-thu" answers={ans} setAnswers={setAns}
        onDone={() => {}} onBlur={() => {}} />
    </div>
  );
}

const dig = (o, k) => k.split(".").reduce((x, p) => (x == null ? undefined : x[p]), o);
const t = (key, vars) => {
  let s = dig(VI, key);
  if (typeof s !== "string") return key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
};
/* Phải khớp hình dạng của LANGS trong shared/i18n.jsx, kể cả phần tử thứ tư
   (mã ngắn). Thiếu nó thì nút chọn ngôn ngữ ở đây hiện mỗi lá cờ, và trang
   xem thử báo sai về diện mạo thật. */
const LANGS = [
  ["vi", "🇻🇳", "Tiếng Việt", "VN"],
  ["fr", "🇫🇷", "Français", "FR"],
  ["en", "🇬🇧", "English", "EN"],
];

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
/* Lịch sử luyện tập của "Linh", đúng dạng PracticeHub ghi ra:
   { [exId]: { best, max, tries, at } }.

   p6 để `best: -1` có chủ ý — đó là dạng bản ghi PracticeHub tạo trước khi có
   điểm thật, và nó PHẢI bị loại khỏi biểu đồ chứ không được tính thành 0%. */
const mockPracticeHistory = {
  p1: { best: 12, max: 15, tries: 3, at: hoursAgo(1) },
  p2: { best: 6, max: 10, tries: 1, at: hoursAgo(20) },
  p5: { best: 7, max: 8, tries: 2, at: hoursAgo(40) },
  p7: { best: 3, max: 6, tries: 4, at: hoursAgo(60) },
  p6: { best: -1, max: 9, tries: 0, at: hoursAgo(70) },
};

/* Sự kiện lịch tự thêm, neo vào TUẦN HIỆN TẠI chứ không phải một ngày cố
   định — fixture ghim ngày cứng thì tuần sau mở trang xem thử sẽ trống trơn
   và trông như hỏng. */
const thisMonday = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
})();
const atWeek = (dayOffset, h, m = 0) => {
  const d = new Date(thisMonday);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const mockCalendarEvents = [
  { id: "c1", title: "Cours de Grammaire", at: atWeek(0, 9), kind: "custom" },
  { id: "c2", title: "Atelier phonétique", at: atWeek(1, 14, 30), kind: "custom" },
  { id: "c3", title: "Réviser le subjonctif", at: atWeek(2, 11), kind: "custom" },
  { id: "c4", title: "Conversation avec Camille", at: atWeek(3, 16), kind: "custom" },
  { id: "c5", title: "Examen blanc DELF B1", at: atWeek(4, 8, 30), kind: "custom" },
  /* Cố ý đặt ngoài khung 08:00–19:00 để kiểm việc kẹp vị trí: sự kiện lúc
     22:00 phải dồn xuống đáy cột, không được biến mất. */
  { id: "c6", title: "Podcast en français", at: atWeek(4, 22), kind: "custom" },
];

/* Hội thoại giả — CHỈ sống trong trang xem thử. Đường chạy thật không truyền
   `conversations`, nên bảng tin nhắn hiện trạng thái rỗng nói rõ tính năng
   chưa nối. Nhét mấy cuộc này vào component là để học sinh mở ra, thấy tên
   giáo viên, bấm vào rồi không có gì xảy ra. */
const mockConversations = [
  { id: "m1", name: "Prof. Hùng", preview: "Em nộp bài trễ hai hôm rồi nhé.", at: "09:12", unread: true },
  { id: "m2", name: "Trang", preview: "Câu 4 bài Le passé composé làm sao ạ?", at: "Hôm qua", unread: true },
  { id: "m3", name: "Prof. Camille", preview: "Bien joué pour la dictée !", at: "T3", unread: false },
  { id: "m4", name: "Minh", preview: "Mai mình ôn cùng nhau không?", at: "12/08", unread: false },
];

/* Mẹo cho sổ tay — CHỈ trong trang xem thử. Đường chạy thật đọc kho
   `mcf-tips`; chưa có mẹo nào thì hiện trạng thái rỗng. */
const mockTips = [
  { id: "t1", tag: "Méthode", title: "Connecteurs: dừng lại ở từ đảo chiều",
    body: "néanmoins · cependant · toutefois · en revanche · or\nQuan điểm thật của tác giả thường nằm NGAY SAU những từ này. Đề CE hay đặt quan điểm đối lập ở phía trước để bẫy." },
  { id: "t2", tag: "Piège", title: "à cause de / grâce à",
    body: "grâce à = nguyên nhân TỐT. à cause de = nguyên nhân XẤU.\nCả hai đi với DANH TỪ hoặc đại từ nhấn, không đi với mệnh đề." },
  { id: "t3", tag: "Grammaire", title: "Co từ bắt buộc",
    body: "de + le → du · de + les → des\nà + le → au · à + les → aux\n« à cause de les » không tồn tại." },
  { id: "t4", tag: "Grammaire", title: "parce que → parce qu’",
    body: "Élision trước nguyên âm hoặc h câm: parce qu’il, parce qu’une." },
  { id: "t5", tag: "Méthode", title: "Comme luôn mở đầu câu",
    body: "Comme il pleut, je reste. ✓\nJe reste comme il pleut. ✗\nCar thì ngược lại: không bao giờ mở đầu câu." },
  { id: "t6", tag: "Vocabulaire", title: "Đoán nghĩa, đừng tra từ",
    body: "Trong phòng thi không có từ điển. Tập đoán từ tiền tố, hậu tố và ngữ cảnh — nhanh hơn, và đó chính là kỹ năng đề thi đo." },
];

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

  /* ── Màn hình KHÔNG có trong thanh bên ──
   *
   * Bốn màn này mở ra từ trong luồng (kết quả thi, soạn thang chấm, trang tài
   * khoản) chứ không phải từ menu, nên trước đây trang xem thử khai route cho
   * chúng mà KHÔNG có gì dẫn tới — muốn xem phải sửa `initialEntries` rồi tải
   * lại. Một màn hình xem thử được mà không ai tới được thì cũng như không có.
   *
   * MemoryRouter không đọc thanh địa chỉ, nên phải đi bằng `navigate`. */
  const MAN_PHU = [
    ["", "— màn hình phụ —"],
    ["/etudiant/danh-tinh", "Danh tính (avatar + @username)"],
    ["/etudiant/thong-bao", "Bảng thông báo"],
    ["/etudiant/auto-evaluation", "Tự chấm Production écrite"],
    ["/etudiant/phan-thi", "Một phần thi thử"],
    ["/professeur/grille", "Soạn thang chấm"],
  ];

  const ChonManPhu = () => {
    const di = useNavigate();
    const oDau = useLocation().pathname;
    return (
      <select
        value={MAN_PHU.some(([v]) => v === oDau) ? oDau : ""}
        onChange={(e) => e.target.value && di(e.target.value)}
        className="rounded-md border border-solid border-line bg-surface px-3 py-2 text-sm font-bold text-ink shadow-sm"
      >
        {MAN_PHU.map(([v, l]) => <option key={v || "x"} value={v}>{l}</option>)}
      </select>
    );
  };

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
      <ChonManPhu />
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
      conversations={empty ? [] : mockConversations}
      tips={empty ? [] : mockTips}
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
          {TEACHER_NAV.filter((i) => !PREVIEW_CO_SAN.includes(i.to)).map((i) => (
            <Route key={i.to} path={i.to} element={<Stub label={t(i.labelKey)} />} />
          ))}
          <Route path="/professeur/carnet" element={
            <><Controls /><TipsEditor t={t} initialTips={empty ? [] : mockTips.map((x,i)=>({...x, ord:(i+1)*10}))} /></>
          } />

          <Route path="/etudiant/dashboard" element={
            <><Controls /><StudentDashboard name="Linh" exercises={exercises} submissions={submissions}
              practice={empty ? [] : mockRecentExercises}
              practiceHistory={empty ? {} : mockPracticeHistory}
              chuoiFixture={empty ? 0 : 5}
              profile={{ goal: "DELF B1" }} t={t} /></>
          } />
          {/* Lịch: hạn nộp lấy từ EXERCISES nên có sẵn nội dung; `events`
              truyền vào để không đụng kho thật khi chỉ xem bố cục. */}
          <Route path="/etudiant/calendrier" element={
            <><Controls />
              <CalendarView name="Linh" t={t}
                exercises={empty ? [] : EXERCISES}
                events={empty ? [] : mockCalendarEvents} />
            </>
          } />
          {/* Màn tự chấm PE — nằm ngoài STUDENT_NAV vì nó mở ra từ trang kết
              quả thi thử, không phải từ thanh bên. Đặt ở đây để xem được bố cục
              chia đôi mà không cần đăng nhập và không cần thi thử trước. */}
          <Route path="/professeur/grille" element={<><Controls /><GrilleThu /></>} />
          <Route path="/etudiant/phan-thi" element={<><Controls /><PhanThiThu /></>} />
          <Route path="/etudiant/danh-tinh" element={<><Controls /><DanhTinhThu /></>} />
          <Route path="/etudiant/thong-bao" element={<><Controls /><ThongBaoThu /></>} />
          <Route path="/etudiant/auto-evaluation" element={
            <><Controls /><PESelfEvaluation /></>
          } />
          {/* Ba route cũ ở đây trỏ tới /etudiant/bibliotheque, /progression,
              /parametres — những đường dẫn app THẬT đã đổi tên từ lâu. Kết quả:
              bảy mục trong thanh bên dẫn tới trang trống, và trang xem thử nói
              dối về diện mạo thật của app, đúng thứ nó sinh ra để tránh.

              Nay sinh thẳng từ STUDENT_NAV/TEACHER_NAV, nên không lệch lại
              được. `check:nav` canh chỗ này. */}
          {STUDENT_NAV.filter((i) => !PREVIEW_CO_SAN.includes(i.to)).map((i) => (
            <Route key={i.to} path={i.to} element={<Stub label={t(i.labelKey)} />} />
          ))}
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

/* Danh tính: ảnh đại diện + @username.
 *
 * Ô @username có NĂM trạng thái và bốn trong số đó chỉ hiện ra khi mạng trả
 * lời. Không xem thử được thì cách duy nhất nhìn thấy chúng là đăng nhập bằng
 * tài khoản thật rồi cố tình gõ trùng tên người khác.
 *
 * `hoiConTrong` ở đây là fixture, KHÔNG gọi mạng: "marie" và "admin" coi như
 * đã có người lấy, "loi" trả về null để xem trạng thái « chưa kiểm được ».
 * Trễ 350ms để nhìn thấy vòng xoay chứ không phải một cái nháy. */
function DanhTinhThu() {
  const [ten, setTen] = React.useState("Hùng Đỗ");
  const [user, setUser] = React.useState("");
  const [avatar, setAvatar] = React.useState("renard");
  const [mo, setMo] = React.useState(false);

  const hoiConTrong = React.useCallback(async (u) => {
    await new Promise((r) => setTimeout(r, 350));
    if (u === "loi") return null;
    return !["marie", "admin", "hung"].includes(u);
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl bg-surface p-8 shadow-sm">
        <h1 className="m-0 text-2xl font-bold text-ink">Danh tính</h1>

        <div className="mt-6 flex items-center gap-5">
          <span className="relative">
            <button type="button" onClick={() => setMo(true)}
              className="grid cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0">
              <Avatar khoa={avatar} ten={ten} size={96} />
            </button>
          </span>
          <div className="min-w-0">
            <p className="m-0 text-lg font-bold text-ink">{ten || "—"}</p>
            {user && <p className="m-0 mt-0.5 text-sm font-semibold text-primary">@{user}</p>}
            <p className="m-0 mt-0.5 text-sm text-soft">Học sinh</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-sm text-soft">Tên hiển thị</span>
            <input
              className="w-full rounded-xl border-0 bg-surface2 px-4 py-3 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-primary/50"
              value={ten} onChange={(e) => setTen(e.target.value)} maxLength={40} />
            <p className="m-0 mt-1 min-h-[1.1rem] text-xs text-soft">
              Được trùng với người khác. Đổi lúc nào cũng được.
            </p>
          </div>
          <ONhapUsername giaTri={user} datGiaTri={setUser}
            usernameHienTai="" hoiConTrong={hoiConTrong} />
        </div>

        <p className="m-0 mt-6 rounded-xl bg-warn-soft p-3 text-xs font-semibold text-warn">
          Fixture: « marie », « admin », « hung » coi như đã có người lấy;
          « loi » trả về « chưa kiểm được ». Không gọi mạng.
        </p>

        {/* Cả tám con vật một lượt, để soi nét vẽ mà không phải mở hộp tám lần. */}
        <div className="mt-6 flex flex-wrap gap-3 border-0 border-t border-solid border-line pt-6">
          {DS_AVATAR.map((k) => <Avatar key={k} khoa={k} size={64} />)}
          <Avatar khoa="" ten={ten} size={64} />
        </div>
      </div>

      {mo && (
        <ChonAvatar dangChon={avatar} ten={ten}
          chon={(k) => { setAvatar(k); setMo(false); }} dong={() => setMo(false)} />
      )}
    </div>
  );
}

/* Bảng thông báo — dựng được ở đây vì nó nhận dữ liệu qua props và KHÔNG tự
 * gọi mạng. Đó cũng là lý do nó được tách khỏi Bell.jsx: Bell chạm storageShim
 * nên không đưa vào trang xem thử được (xem rào ở đầu file này).
 *
 * Bốn trạng thái cần nhìn tận mắt, và ba trong số đó khó dựng lại trên bản
 * thật: đang tải chỉ hiện chưa tới một giây, rỗng thì phải xoá hết thông báo,
 * và danh sách dài phải chờ tích đủ tin. */
function ThongBaoThu() {
  const [tt, setTt] = React.useState("co");

  const gio = (phut) => Date.now() - phut * 60000;
  const day = [
    { id: "a1", loai: "annonce", chuaDoc: true, ts: gio(3),
      text: "Rappel : rendez le devoir B1 avant vendredi 19h ! N'oubliez pas de relire la consigne avant de commencer, elle a changé depuis la semaine dernière." },
    { id: "a2", loai: "due", chuaDoc: true, ts: gio(45), title: "Le passé composé",
      text: "« Le passé composé » est à rendre avant 12/09/2026 !" },
    { id: "a3", loai: "graded", ts: gio(60 * 5), title: "Rédiger une lettre formelle",
      text: "Ta copie « Rédiger une lettre formelle » a été corrigée." },
    { id: "a4", loai: "redo", chuaDoc: true, ts: gio(60 * 30), title: "L'expression de la cause",
      text: "Le professeur te demande de refaire « L'expression de la cause » : relis la partie sur « parce que » et « car »." },
    { id: "a5", loai: "annonce", ts: gio(60 * 24 * 3),
      text: "Cours annulé mardi prochain." },
  ];

  const ds = tt === "co" ? day : tt === "dai" ? [...day, ...day, ...day].map((n, i) => ({ ...n, id: n.id + i })) : [];

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex flex-wrap gap-2">
        {[["co", "Có thông báo"], ["dai", "Danh sách dài"], ["rong", "Rỗng"], ["tai", "Đang tải"]].map(([v, l]) => (
          <button key={v} type="button" onClick={() => setTt(v)}
            className={`cursor-pointer rounded-full border-0 px-4 py-2 text-sm font-semibold transition-colors ${
              tt === v ? "bg-primary text-on-primary" : "bg-surface2 text-soft hover:text-ink"}`}>
            {l}
          </button>
        ))}
      </div>

      <NotificationDropdown
        notifs={ds}
        dangTai={tt === "tai"}
        soChuaDoc={ds.filter((n) => n.chuaDoc).length}
        onDocHet={() => alert("đánh dấu đã đọc tất cả")}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Preview /></React.StrictMode>,
);
