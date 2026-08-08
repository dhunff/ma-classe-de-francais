/* Trang xem thử vỏ ứng dụng — TẠM THỜI, chỉ để kiểm chứng thị giác.
   Cố tình KHÔNG import App.jsx, vì App.jsx kéo theo storageShim.js vốn mở
   kết nối tới Supabase thật. Trang này không chạm vào dữ liệu nào. */
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/tailwind.css";
import RootLayout from "./layout/RootLayout.jsx";

const DICT = {
  "nav.dashboard": "Tổng quan",
  "nav.exercises": "Thư viện bài tập",
  "nav.students": "Theo dõi học sinh",
  "nav.practice": "Luyện tập",
  "nav.progress": "Tiến độ của tôi",
  "nav.settings": "Cài đặt",
  "nav.primary": "Điều hướng chính",
  "nav.collapse": "Thu gọn thanh bên",
  "nav.expand": "Mở rộng thanh bên",
  "header.teacher": "Giáo viên",
  "header.student": "Học sinh",
  "header.logout": "Đăng xuất",
  "header.search": "Tìm bài tập, học sinh…",
  "header.dark_mode": "Chuyển sang nền tối",
  "header.light_mode": "Chuyển sang nền sáng",
  "lang_label": "Ngôn ngữ",
};
const t = (k) => DICT[k] || k;
const LANGS = [["vi", "🇻🇳", "Tiếng Việt"], ["fr", "🇫🇷", "Français"], ["en", "🇬🇧", "English"]];

function Preview() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("vi");
  const [section, setSection] = useState("dashboard");
  const [role, setRole] = useState("eleve");

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("mcf-dark-root", !d);
      return !d;
    });
  };

  return (
    <RootLayout
      session={{ role, name: role === "prof" ? "" : "Linh" }}
      t={t}
      lang={lang}
      langs={LANGS}
      onLang={setLang}
      dark={dark}
      onToggleDark={toggleDark}
      onLogout={() => {}}
      bell={null}
      section={section}
      onSection={setSection}
    >
      {({ section: s, query }) => (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setRole((r) => (r === "prof" ? "eleve" : "prof"))}
            className="rounded-md border border-solid border-line bg-surface px-4 py-2 text-sm font-bold text-ink shadow-sm"
          >
            Đổi vai trò (đang: {role})
          </button>

          <div className="rounded-md border border-solid border-line bg-surface p-6 shadow-sm">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Mục đang chọn: {t(`nav.${s === "library" ? (role === "prof" ? "exercises" : "practice") : s}`)}
            </h1>
            <p className="mt-2 text-sm text-soft">
              Vùng nội dung. Tìm kiếm: {query ? `« ${query} »` : "(trống)"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-md border border-solid border-line bg-surface p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-soft">Khối {n}</div>
                <div className="mt-2 text-lg font-bold text-ink">Nội dung mẫu</div>
                <div className="mt-1 text-sm text-soft">Viền mỏng, bóng nhẹ, nền phẳng.</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </RootLayout>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Preview />
  </React.StrictMode>,
);
