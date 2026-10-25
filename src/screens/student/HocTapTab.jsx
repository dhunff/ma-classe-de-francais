import React from "react";
import { NavLink } from "react-router-dom";
import { Map, BookA } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Thanh tab của mục « Học tập » (23/10): Lộ trình · Ngữ pháp là hai màn
   riêng (đường dẫn cũ giữ nguyên), chung một mục trên thanh bên. */
const TAB = () => [
  /* 26/10 (theo chủ dự án): Ngữ pháp đứng đầu. */
  { to: "/etudiant/ngu-phap", Icon: BookA, nhan: tr("Ngữ pháp", "Grammaire", "Grammar") },
  { to: "/etudiant/lo-trinh", Icon: Map, nhan: tr("Lộ trình", "Parcours", "Path") },
];

export default function HocTapTab() {
  return (
    <nav aria-label={tr("Học tập", "Apprendre", "Learn")} className="mx-auto mb-5 flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl bg-surface p-1 shadow-sm no-scrollbar">
      {TAB().map(({ to, Icon, nhan }) => (
        <NavLink key={to} to={to}
          className={({ isActive }) => "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold no-underline transition-colors "
            + (isActive ? "bg-primary text-on-primary shadow-sm" : "text-soft hover:bg-surface2 hover:text-ink")}>
          <Icon size={16} /> {nhan}
        </NavLink>
      ))}
    </nav>
  );
}
