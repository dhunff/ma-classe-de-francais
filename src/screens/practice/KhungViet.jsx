import React, { useMemo } from "react";
import { tr } from "../../shared/i18n.jsx";

/* Khung viết đơn giản cho câu tự luận của học sinh (07/10).

   Thay RichTextEditor (phông, cỡ chữ, màu, căn lề…) — chủ dự án thấy thừa:
   bài DELF chấm nội dung, không chấm định dạng. Trình soạn đầy đủ vẫn dùng
   cho giáo viên ở Builder.

   Câu trả lời VẪN LƯU DẠNG HTML để khớp mọi chỗ đang đọc nó (stripHtml khi
   chấm/đếm chữ, dangerouslySetInnerHTML ở màn xem bài): xuống dòng thành
   <br>, ký tự đặc biệt được thoát. Bản nháp cũ viết bằng trình soạn cũ được
   chuyển về chữ thường khi mở, không mất nội dung. */
const thoat = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const veHtml = (txt) => thoat(txt).replace(/\n/g, "<br>");
const veChu = (html) => {
  if (!html) return "";
  const d = document.createElement("div");
  d.innerHTML = String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h\d)>/gi, "\n");
  /* KHÔNG cắt xuống dòng cuối: textarea gửi lại giá trị sau mỗi phím, cắt ở
     đây thì bấm Enter ở cuối bài sẽ không bao giờ xuống được dòng. */
  return d.textContent || "";
};

export default function KhungViet({ value, onChange, readOnly }) {
  const chu = useMemo(() => veChu(value), [value]);
  const soChu = chu.trim() ? chu.trim().split(/\s+/).length : 0;
  return (
    <div className="overflow-hidden rounded-2xl border border-solid border-line bg-surface focus-within:border-primary">
      <textarea value={chu} readOnly={readOnly} rows={7}
        placeholder={readOnly ? "" : tr("Viết câu trả lời của bạn ở đây…", "Écrivez votre réponse ici…", "Write your answer here…")}
        onChange={(e) => onChange(veHtml(e.target.value))}
        className="block w-full resize-y border-0 bg-transparent px-4 py-3 font-sans text-base leading-relaxed text-ink outline-none"
        style={{ minHeight: 160 }} />
      <div className="border-0 border-t border-solid border-line px-4 py-1.5 text-right text-xs font-semibold tabular-nums text-soft">
        {soChu} {tr("từ", soChu > 1 ? "mots" : "mot", soChu === 1 ? "word" : "words")}
      </div>
    </div>
  );
}
