import React, { useRef } from "react";
import { chuThuan } from "../../shared/neoNguLieu.js";

/* Bôi đen một đoạn trong ngữ liệu.
 *
 * Tách khỏi DatNeo.jsx vì DatNeo import `exerciseStore` → `storageShim`, nên
 * cả file đó KHÔNG được vào /preview.html (xem đầu preview.jsx). Thành phần
 * này chỉ import một hàm thuần, nên xem thử được — và nó là chỗ rủi ro nhất
 * của cả màn: `getSelection` phụ thuộc hành vi trình duyệt, không phải logic
 * kiểm được bằng bộ kiểm.
 *
 * ══ VÌ SAO PHẢI KIỂM VÙNG CHỌN NẰM TRONG ĐOẠN VĂN ══
 *
 * `window.getSelection()` trả về vùng bôi đen của CẢ TRANG. Không kiểm thì
 * giáo viên bôi đen ở tiêu đề, ở câu hỏi, hay ở một ô nhập khác cũng được nhận
 * — và neo trỏ vào một chuỗi không hề có trong bài. Học sinh sau đó nhận cảnh
 * báo "chỗ đánh dấu không còn khớp" cho một bài chưa ai sửa.
 *
 * Kiểm CẢ HAI đầu (`anchorNode` và `focusNode`): bôi đen từ trong đoạn văn kéo
 * ra ngoài thì một đầu vẫn nằm trong, và chuỗi nhận được sẽ dài hơn đoạn văn. */

export default function ChonDoanVan({ vanBan, onChon }) {
  const oRef = useRef(null);

  const layChon = () => {
    const sel = window.getSelection?.();
    if (!sel || sel.isCollapsed || !oRef.current) return "";
    if (!oRef.current.contains(sel.anchorNode) || !oRef.current.contains(sel.focusNode)) return "";
    return sel.toString();
  };

  return (
    <div ref={oRef} onMouseUp={() => onChon(layChon())} onKeyUp={() => onChon(layChon())}
      className="max-h-96 select-text overflow-y-auto whitespace-pre-wrap rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-ink">
      {chuThuan(vanBan)}
    </div>
  );
}
