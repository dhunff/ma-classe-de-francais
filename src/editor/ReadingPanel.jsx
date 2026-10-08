import React from "react";
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
  return (
    <div className="mcf-card mcf-scroll"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={embedded
        ? { ...S.card, minWidth: 0, flex: "1 1 auto", minHeight: 0, overflowY: "auto" }
        : { ...S.card, flex: "6 1 380px", minWidth: 0, maxHeight: "76vh", overflowY: "auto", position: "sticky", top: stickyTop }}>
      <div style={{ ...S.label, marginBottom: 10 }}>{tr("Văn bản", "Texte à lire", "Reading text")}</div>
      {/* Nội dung do giáo viên soạn, cùng mức tin cậy với consigne vốn đã dựng bằng HTML. */}
      {html
        ? <div className="mcf-van-ban" style={{ lineHeight: 1.9, fontSize: 16 }} dangerouslySetInnerHTML={{ __html: text }} />
        : <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.9, fontSize: 16 }}>{text}</div>}
    </div>
  );
}

export default ReadingPanel;
