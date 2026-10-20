import React, { useContext } from "react";
import { BookOpen } from "lucide-react";
import { SoTuCtx } from "../screens/practice/SoTuMoi.jsx";
import { S } from "../shared/tokens.js";
import { tr } from "../shared/i18n.jsx";

/* Khung văn bản đọc của học sinh.
 *
 * 08/10, theo chủ dự án: các công cụ chỉnh chữ (cỡ chữ A-/A+, bút tô) chỉ có ở
 * trình soạn bài của giáo viên; học sinh chỉ ĐỌC. Đồng thời sửa lỗi văn bản
 * dạng HTML (<p>, <strong>) hiện nguyên thẻ.
 *
 * `embedded` = panel nằm trong một cột do SplitPane dựng sẵn. Khi đó nó bỏ
 * flex-basis, sticky và maxHeight của chính mình: cột cha đã giữ vị trí và
 * chiều cao, panel chỉ ăn hết phần còn lại và tự cuộn. Để nguyên thì thành
 * sticky lồng trong sticky, và khối audio phía trên bị đẩy khỏi khung. */
const LA_HTML = /<\/?(p|strong|em|b|i|u|br|ul|ol|li|h[1-6]|span|div)\b[^>]*>/i;

function ReadingPanel({ text, stickyTop = 8, embedded = false }) {
  const html = LA_HTML.test(String(text ?? ""));
  const congCu = useContext(SoTuCtx);   // bút tô + sổ từ (chỉ khi học sinh làm bài)
  const soChu = String(text ?? "").replace(/<[^>]+>/g, " ").split(/s+/).filter(Boolean).length;
  return (
    <div className="mcf-card mcf-scroll"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={embedded
        ? { ...S.card, minWidth: 0, flex: "1 1 auto", minHeight: 0, overflowY: "auto" }
        : { ...S.card, flex: "6 1 380px", minWidth: 0, maxHeight: "76vh", overflowY: "auto", position: "sticky", top: stickyTop }}>
      {/* Đầu khung (20/10): biểu tượng, số chữ, công cụ bút tô + sổ từ bên phải. */}
      <div className="sticky -top-px z-[1] -mx-1 mb-3 flex items-center gap-3 border-0 border-b border-solid border-line bg-surface px-1 pb-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ok-soft text-ok"><BookOpen size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-extrabold text-ink">{tr("Văn bản", "Texte à lire", "Reading text")}</p>
          <p className="m-0 text-xs text-soft">{tr(`${soChu} chữ`, `${soChu} mots`, `${soChu} words`)}</p>
        </div>
        {congCu}
      </div>
      {/* Nội dung do giáo viên soạn, cùng mức tin cậy với consigne vốn đã dựng bằng HTML. */}
      {html
        ? <div className="mcf-van-ban" style={{ lineHeight: 1.95, fontSize: 16.5 }} dangerouslySetInnerHTML={{ __html: text }} />
        : <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.9, fontSize: 16 }}>{text}</div>}
    </div>
  );
}

export default ReadingPanel;
