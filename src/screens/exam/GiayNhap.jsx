import React, { useEffect, useState } from "react";
import { NotebookPen, X } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Giấy nháp cho phần Nghe, Đọc, Viết trong thi thử (14/10, theo chủ dự án).
 *
 * Như tờ nháp phát trong phòng thi: KHÔNG chấm, KHÔNG gửi lên máy chủ. Lưu
 * tạm trong sessionStorage theo đề + phần, nên tải lại trang không mất chữ,
 * nhưng đóng tab là hết (như tờ giấy bị thu lại cuối giờ).
 * Phần nói (PO) có ô nháp riêng trong bước chuẩn bị (BocThamNoi). */
export default function GiayNhap({ khoa }) {
  const k = `giay-nhap:${khoa}`;
  const [mo, setMo] = useState(false);
  const [chu, setChu] = useState(() => { try { return sessionStorage.getItem(k) || ""; } catch { return ""; } });
  useEffect(() => { try { sessionStorage.setItem(k, chu); } catch { /* bộ nhớ bị chặn: vẫn dùng được */ } }, [k, chu]);

  return (
    <>
      <button type="button" onClick={() => setMo((x) => !x)} aria-expanded={mo}
        className="fixed bottom-5 right-5 z-40 inline-flex cursor-pointer items-center gap-2 rounded-none border-[1.5px] border-solid border-[#111] bg-white px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#111] shadow-[4px_4px_0_#111] hover:bg-[#f4f4f4]"
        style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>
        <NotebookPen size={16} /> {tr("Giấy nháp", "Brouillon", "Scratch paper")}{chu.trim() ? " •" : ""}
      </button>
      {mo && (
        <aside aria-label={tr("Giấy nháp", "Brouillon", "Scratch paper")}
          className="de-nhap fixed bottom-20 right-5 z-40 flex h-[min(70vh,520px)] w-[min(92vw,380px)] flex-col border-[1.5px] border-solid border-[#111] bg-white shadow-2xl"
          style={{ fontFamily: '"Roboto Condensed", sans-serif' }}>
          <div className="flex items-center justify-between border-0 border-b border-solid border-[#111] bg-[#efefef] px-3 py-2">
            <span className="text-[13px] font-bold uppercase tracking-wide text-[#111]">Brouillon</span>
            <span className="ml-2 flex-1 text-[11px] italic text-[#555]">{tr("không chấm, không nộp", "non noté, non rendu", "not graded, not submitted")}</span>
            <button type="button" onClick={() => setMo(false)} aria-label={tr("Đóng", "Fermer", "Close")}
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-none border-0 bg-transparent text-[#111] hover:bg-white"><X size={16} /></button>
          </div>
          <textarea lang="fr" value={chu} onChange={(e) => setChu(e.target.value)} autoFocus
            placeholder={tr("Ghi chú, từ khoá, dàn ý…", "Notes, mots-clés, plan…", "Notes, keywords, outline…")}
            className="de-dong-ke min-h-0 w-full flex-1 resize-none border-0 text-[15px]" />
        </aside>
      )}
    </>
  );
}
