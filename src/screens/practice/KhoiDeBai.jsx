import React from "react";
import { ClipboardList } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Khối « Đề bài » ở màn làm bài (luyện tập + bài được giao), làm lại 20/10:
   nền xanh nhạt + biểu tượng thay cho thẻ trắng viền trái. */
export default function KhoiDeBai({ html }) {
  return (
    <div className="mb-5 flex items-start gap-4 rounded-3xl bg-gradient-to-r from-primary-soft to-surface px-5 py-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-on-primary shadow-[0_6px_16px_rgba(37,99,235,0.3)]">
        <ClipboardList size={19} />
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[11px] font-extrabold uppercase tracking-widest text-primary">{tr("Đề bài", "Consigne", "Instructions")}</p>
        {/* Nội dung do giáo viên soạn, cùng mức tin cậy với văn bản đọc. */}
        <div className="mt-1 text-[15.5px] font-semibold leading-relaxed text-ink" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
