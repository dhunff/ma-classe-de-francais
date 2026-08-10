/** @type {import('tailwindcss').Config} */

// Màu lấy từ biến CSS trong src/styles/tokens.css dưới dạng bộ ba RGB, nên
// `bg-primary/10` hay `border-line/60` đều hoạt động. Không khai báo màu nào
// ở đây — đổi màu là sửa tokens.css, một chỗ duy nhất cho cả sáng lẫn tối.
const token = (name) => `rgb(var(--mcf-${name}-rgb) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  // App bật bản tối bằng cách gắn class lên <html> (App.jsx quản lý).
  darkMode: ["selector", "html.mcf-dark-root"],

  // Preflight bị tắt có chủ đích: nó reset heading, list, button, img trên
  // toàn trang, mà ~512 inline style của các màn hình cũ đang dựa vào mặc
  // định của trình duyệt. src/styles/base.css đã có reset riêng vừa đủ.
  corePlugins: { preflight: false },

  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        surface2: token("surface2"),
        ink: token("ink"),
        soft: token("soft"),
        line: token("line"),
        "line-strong": token("line-strong"),
        primary: { DEFAULT: token("primary"), soft: token("primarysoft") },
        "on-primary": token("on-primary"),
        ok: { DEFAULT: token("ok"), soft: token("oksoft") },
        warn: { DEFAULT: token("warn"), soft: token("warnsoft") },
        danger: { DEFAULT: token("danger"), soft: token("dangersoft") },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "Segoe UI", "sans-serif"],
      },
      /* Phải khớp --r-sm / --r-md trong tokens.css: nửa app dùng lớp Tailwind
         (rounded-md), nửa còn lại dùng inline style đọc var(--r-md). Lệch nhau
         là hai nửa giao diện bo góc khác nhau. */
      borderRadius: { sm: "14px", md: "22px", full: "999px" },
      boxShadow: { sm: "var(--sh-1)", md: "var(--sh-2)" },
      spacing: { sidebar: "260px", "sidebar-collapsed": "72px" },
      transitionDuration: { DEFAULT: "150ms" },
    },
  },
  plugins: [],
};
