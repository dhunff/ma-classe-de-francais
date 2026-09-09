import {
  LayoutDashboard, BookOpen, Users, BarChart3, Dumbbell,
  ClipboardList, CheckSquare, CalendarDays, Settings, Lightbulb, Timer, Trophy, Mic, Layers, Lightbulb as Bulb, Anchor, Inbox,
} from "lucide-react";

/* Điều hướng của vỏ app.

   Mỗi mục gắn với đúng MỘT màn hình bên trong qua trường `view`. Trước đây
   bốn route của giáo viên đều render cùng một component với tab mặc định,
   nên URL đổi mà nội dung không đổi — bấm « Theo dõi học sinh » vẫn ra thư
   viện bài tập. `view` là thứ nối URL với tab, để địa chỉ luôn mô tả đúng
   thứ đang hiển thị và bookmark / nút Back hoạt động.

   Không có mục nào không có màn hình đứng sau. Giáo viên không có màn hình
   cài đặt nên không có mục « Paramètres » — một mục dẫn tới trang trống còn
   tệ hơn là không có mục đó. */

export const ROLE_HOME = { prof: "/professeur/dashboard", eleve: "/etudiant/dashboard" };

export const TEACHER_NAV = [
  { to: "/professeur/dashboard", labelKey: "nav.dashboard", Icon: LayoutDashboard },
  { to: "/professeur/exercices", labelKey: "nav.exercises", Icon: BookOpen, view: "list" },
  { to: "/professeur/eleves", labelKey: "nav.students", Icon: Users, view: "students" },
  { to: "/professeur/statistiques", labelKey: "nav.stats", Icon: BarChart3, view: "stats" },
  { to: "/professeur/entrainement", labelKey: "nav.practice", Icon: Dumbbell, view: "practice" },
  /* Không có `view`: màn hình này không nằm trong Teacher.jsx mà là route
     riêng, nên App.jsx khai báo tay. */
  { to: "/professeur/carnet", labelKey: "nav.tips", Icon: Lightbulb },
  /* Soạn đề thi thử — cũng là route riêng, không có `view`. */
  { to: "/professeur/examens", labelKey: "nav.exams", Icon: Timer },
  /* « Chấm bài viết » (/professeur/copies) ĐÃ GỠ — 09/09/2026.
     Giáo viên không còn chấm bài; bài viết do học sinh tự chấm theo grille
     DELF chính thức ở « Kết quả thi ».

     Gỡ CẢ mục menu lẫn route, không giấu lối vào rồi giữ màn hình lại. Một
     route sống mà không có mục menu là thứ check:nav bắt lỗi đúng nghĩa —
     và ngoại lệ duy nhất đang có (« Ma progression ») được khai tường minh
     vì màn hình đó vẫn đúng, chỉ là không muốn hiện. Ở đây thì khác: màn
     chấm bài không còn đúng với cách sản phẩm vận hành.

     Muốn dựng lại thì lấy PEGrading.jsx từ commit trước 09/09/2026 và thêm
     lại ba chỗ: import + route ở App.jsx, một dòng ở đây, và khoá nav.grading
     ở i18n.jsx cùng preview.jsx. */
  /* Nghe bài nói. Màn này KHÔNG cho điểm — chỉ nghe và nhắn nhận xét — nên
     nó sống sót qua đợt gỡ trên. Trước đây chú thích ở đây giải thích vì sao
     nó tách khỏi « Chấm bài viết »; giờ không còn gì để tách khỏi. */
  { to: "/professeur/oral", labelKey: "nav.oral", Icon: Mic },
  /* Viết lời giải, xếp theo số học sinh từng sai. Route riêng, không có
     `view`. Đặt cạnh hai màn chấm vì cùng một loại việc: nhìn vào chỗ học
     sinh chưa hiểu rồi làm gì đó về nó. */
  { to: "/professeur/loi-giai", labelKey: "nav.explanations", Icon: Bulb },
  /* Đặt neo. Đứng cạnh « Câu cần lời giải » vì cùng một loại việc: nhìn vào
     chỗ học sinh chưa hiểu rồi làm gì đó về nó. */
  { to: "/professeur/neo", labelKey: "nav.anchors", Icon: Anchor },
  /* Soạn Flashcard. Đặt cạnh « Neo ngữ liệu » vì cùng loại việc: chuẩn bị ngữ
     liệu cho học sinh, khác với ba mục trên vốn là theo dõi và chấm. */
  { to: "/professeur/bo-the", labelKey: "nav.decks", Icon: Layers },
  /* Đăng ký tư vấn. Đứng cuối vì nó không phải việc dạy học — nhưng phải có
     mặt: một người để lại số điện thoại mà không ai thấy là một người bị bỏ
     rơi. */
  { to: "/professeur/lien-he", labelKey: "nav.leads", Icon: Inbox },
];

export const STUDENT_NAV = [
  { to: "/etudiant/dashboard", labelKey: "nav.dashboard", Icon: LayoutDashboard },
  { to: "/etudiant/devoirs", labelKey: "nav.todo", Icon: ClipboardList, view: "todo" },
  { to: "/etudiant/rendus", labelKey: "nav.done", Icon: CheckSquare, view: "done" },
  { to: "/etudiant/entrainement", labelKey: "nav.practice", Icon: Dumbbell, view: "practice" },
  /* Không có `view`: là route riêng trong App.jsx, giống « Sổ tay » bên giáo viên.
     Ban đầu tôi cố ý KHÔNG đưa vào đây với lý do "vào là bắt đầu tính giờ, không
     phải mục menu thường". Sai — kết quả là một màn hình không ai tới được, tức
     là chưa làm xong. Chỗ cảnh báo trước khi tính giờ nằm ở màn chờ của chính
     ExamMode, không phải ở việc giấu lối vào. */
  { to: "/etudiant/examen", labelKey: "nav.exam", Icon: Timer },
  { to: "/etudiant/resultats", labelKey: "nav.results", Icon: Trophy },
  /* « Thẻ ghi nhớ » (/etudiant/the-ghi-nho) ĐÃ GỠ — 09/09/2026.
     Đó là thẻ SM-2 sinh từ chính câu học sinh làm sai. Flashcard giờ là bộ do
     GIÁO VIÊN soạn — mục ngay dưới đây.

     Bảng `cards` / `reviews` và 37 thẻ đang có KHÔNG bị xoá; chỉ đường VÀO là
     mất. Đường GHI cũng tắt cùng lúc (xem gradeRemote.js): để nguyên nó thì
     mỗi lần chấm bài lại ghi thêm thẻ vào chỗ không màn nào mở được — một
     đường ghi còn sống sau khi đường đọc đã chết. */
  { to: "/etudiant/bo-the", labelKey: "nav.decks", Icon: Layers },
  /* « Ma progression » đã rời khỏi menu theo yêu cầu. Route
     /etudiant/progression VẪN sống trong App.jsx nên hành trình tới Paris và
     biểu đồ điểm không mất — chỉ là hiện không còn lối vào từ thanh bên.
     Muốn dựng lại thì thêm một dòng ở đây, không phải viết lại màn hình. */
  { to: "/etudiant/calendrier", labelKey: "nav.calendar", Icon: CalendarDays },
  { to: "/etudiant/compte", labelKey: "nav.account", Icon: Settings, view: "settings" },
];

export const navFor = (role) => (role === "prof" ? TEACHER_NAV : STUDENT_NAV);

const ALL = [...TEACHER_NAV, ...STUDENT_NAV];

const matchFor = (pathname) =>
  ALL.filter((i) => pathname === i.to || pathname.startsWith(i.to + "/"))
    .sort((a, b) => b.to.length - a.to.length)[0];

/* Tiêu đề trang hiện tại, khớp theo đường dẫn dài nhất trùng khớp. */
export function titleKeyFor(pathname) {
  const hit = matchFor(pathname);
  return hit ? hit.labelKey : null;
}
