import { LayoutDashboard, Library, Users, TrendingUp, Settings, BookOpen } from "lucide-react";

/* Điều hướng của vỏ app, gắn với URL thật.

   Hai vai trò có hai cây route tách hẳn nhau — đó là điều kiện để chặn chéo:
   học sinh gõ /professeur/... sẽ bị RequireRole đẩy về khu của mình.
   `titleKey` dùng cho tiêu đề trang trên Topbar. */

export const ROLE_HOME = { prof: "/professeur/dashboard", eleve: "/etudiant/dashboard" };

export const TEACHER_NAV = [
  { to: "/professeur/dashboard", labelKey: "nav.dashboard", Icon: LayoutDashboard },
  { to: "/professeur/exercices", labelKey: "nav.exercises", Icon: BookOpen },
  { to: "/professeur/eleves", labelKey: "nav.students", Icon: Users },
  { to: "/professeur/parametres", labelKey: "nav.settings", Icon: Settings },
];

export const STUDENT_NAV = [
  { to: "/etudiant/dashboard", labelKey: "nav.dashboard", Icon: LayoutDashboard },
  { to: "/etudiant/bibliotheque", labelKey: "nav.practice", Icon: Library },
  { to: "/etudiant/progression", labelKey: "nav.progress", Icon: TrendingUp },
  { to: "/etudiant/parametres", labelKey: "nav.settings", Icon: Settings },
];

export const navFor = (role) => (role === "prof" ? TEACHER_NAV : STUDENT_NAV);

/* Tiêu đề trang hiện tại, khớp theo đường dẫn dài nhất trùng khớp. */
export function titleKeyFor(pathname) {
  const all = [...TEACHER_NAV, ...STUDENT_NAV];
  const hit = all
    .filter((i) => pathname === i.to || pathname.startsWith(i.to + "/"))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return hit ? hit.labelKey : null;
}
