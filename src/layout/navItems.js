import { LayoutDashboard, Library, Users, TrendingUp, Settings } from "lucide-react";

/* Điều hướng của vỏ app.
   `id` là thứ RootLayout báo ra ngoài; `labelKey` tra vào I18N (App.jsx).
   Hai vai trò thấy hai bộ menu khác nhau — giáo viên theo dõi lớp, học sinh
   theo dõi chính mình. */

export const TEACHER_NAV = [
  { id: "dashboard", labelKey: "nav.dashboard", Icon: LayoutDashboard },
  { id: "library", labelKey: "nav.exercises", Icon: Library },
  { id: "students", labelKey: "nav.students", Icon: Users },
  { id: "settings", labelKey: "nav.settings", Icon: Settings },
];

export const STUDENT_NAV = [
  { id: "dashboard", labelKey: "nav.dashboard", Icon: LayoutDashboard },
  { id: "library", labelKey: "nav.practice", Icon: Library },
  { id: "progress", labelKey: "nav.progress", Icon: TrendingUp },
  { id: "settings", labelKey: "nav.settings", Icon: Settings },
];

export const navFor = (role) => (role === "prof" ? TEACHER_NAV : STUDENT_NAV);
