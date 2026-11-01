import React from "react";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";

/* Khối « Đề bài » ở màn làm bài (luyện tập + bài được giao), làm lại 01/11: Léon đọc đề
   trong bong bóng thoại. `dam` là màu đậm của kỹ năng, chỉ dùng làm nền nhãn (chữ trắng)
   để đọc được ở cả bản sáng lẫn tối. */
export default function KhoiDeBai({ html, dam = "var(--mcf-primary)" }) {
  return (
    <div className="mb-5 flex items-end gap-3">
      <Leon cam="hoc" size={72} className="shrink-0 max-sm:h-14 max-sm:w-14" />
      <div className="relative min-w-0 flex-1 rounded-3xl rounded-bl-md border border-solid border-line bg-surface px-5 py-4 shadow-sm">
        <span aria-hidden className="absolute -left-[7px] bottom-4 h-3 w-3 rotate-45 border-0 border-b border-l border-solid border-line bg-surface" />
        <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold text-white" style={{ background: dam }}>{tr("Đề bài", "Consigne", "Instructions")}</span>
        {/* Nội dung do giáo viên soạn, cùng mức tin cậy với văn bản đọc. */}
        <div className="mt-2 text-base font-semibold leading-relaxed text-ink" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
