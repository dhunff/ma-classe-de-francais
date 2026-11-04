import React, { useEffect, useState } from "react";
import { Headphones, Crown, Loader2, ChevronDown } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";

/* Lời nghe và phân tích bài nghe ở màn kết quả (04/11, theo chủ dự án: chỉ VIP).
 *
 * Nội dung nằm ở bảng `loi_nghe`, chỉ đọc được qua rpc `xem_loi_nghe` (migration 194). Hàm đó tự
 * kiểm VIP và đã nộp bài, nên giao diện không tự quyết ai được xem: `vip` ở đây chỉ để chọn lời mời.
 *   null              bài không có lời nghe: không hiện gì
 *   { khoa: "vip" }   mời mở VIP
 *   { khoa: "chua_nop" } không hiện (màn này chỉ hiện sau khi nộp; lượt chưa ghi thì thôi)
 * `loi` là mảng {giong, chu}, mỗi phần tử một đoạn. KHÔNG đánh số người nói theo giọng: ở bài nhiều
 * hội thoại, một giọng TTS đóng nhiều người khác nhau. Mốc « Dialogue un. », « Message deux. »… in đậm. */
const MOC = /^(Dialogue|Message|Annonce|Document)\s+[\p{L}\d-]+\.\s*/u;

/* `thu`: dữ liệu dựng sẵn cho trang xem thử (preview.html), bỏ qua rpc. */
export default function LoiNgheBai({ exId, onMuaVip, thu }) {
  const [kq, setKq] = useState(thu);
  useEffect(() => {
    if (thu !== undefined) return undefined;
    let huy = false;
    supabase.rpc("xem_loi_nghe", { p_ex: exId }).then(({ data, error }) => { if (!huy) setKq(error ? null : data ?? null); });
    return () => { huy = true; };
  }, [exId, thu]);

  if (kq === undefined) return <p className="m-0 mt-4 text-center text-sm text-soft"><Loader2 size={14} className="inline animate-spin" /> {tr("Đang tải lời nghe…", "Chargement de la transcription…", "Loading transcript…")}</p>;
  if (!kq || kq.khoa === "chua_nop") return null;

  if (kq.khoa === "vip") {
    return (
      <section className="mt-5 flex flex-wrap items-center gap-4 rounded-3xl border border-solid border-line bg-surface p-5 text-left">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-warn-soft text-warn"><Crown size={22} /></span>
        <div className="min-w-[12rem] flex-1">
          <p className="m-0 text-base font-extrabold text-ink">{tr("Lời nghe và phân tích bài", "Transcription et analyse", "Transcript and analysis")}</p>
          <p className="m-0 mt-1 text-sm text-soft">{tr("Đọc lại toàn bộ lời nghe, xem chủ đề và các ý chính của bài. Dành cho tài khoản VIP.", "Relisez tout le document, avec le thème et les idées principales. Réservé aux comptes VIP.", "Read the full transcript with the topic and main ideas. VIP accounts only.")}</p>
        </div>
        {onMuaVip && (
          <button type="button" onClick={onMuaVip} className="inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary shadow-sm">
            <Crown size={15} /> {tr("Mở VIP", "Passer VIP", "Go VIP")}
          </button>
        )}
      </section>
    );
  }

  const pt = kq.phan_tich;
  return (
    <section className="mt-5 rounded-3xl border border-solid border-line bg-surface p-5 text-left">
      <h3 className="m-0 flex items-center gap-2 text-base font-extrabold text-ink"><Headphones size={18} className="text-primary" /> {tr("Lời nghe và phân tích bài", "Transcription et analyse", "Transcript and analysis")}</h3>
      {pt && (
        <div className="mt-4 grid gap-3 rounded-2xl bg-primary-soft p-4 text-sm text-ink">
          {pt.loai && <p className="m-0"><strong>{tr("Loại tài liệu", "Type de document", "Document type")}:</strong> {pt.loai}</p>}
          {pt.chu_de && <p className="m-0"><strong>{tr("Chủ đề", "Thème", "Topic")}:</strong> {pt.chu_de}</p>}
          {pt.y_chinh?.length > 0 && (
            <div>
              <strong>{tr("Ý chính", "Idées principales", "Main ideas")}:</strong>
              <ul className="m-0 mt-1 grid gap-1 pl-5">{pt.y_chinh.map((y, i) => <li key={i}>{y}</li>)}</ul>
            </div>
          )}
        </div>
      )}
      <details open className="group mt-4">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-soft">
          <ChevronDown size={15} className="transition-transform group-open:rotate-180" /> {tr("Lời nghe", "Transcription", "Transcript")}
        </summary>
        <div lang="fr" className="mt-3 grid gap-3 text-[15px] leading-relaxed text-ink">
          {(kq.loi || []).map((d, i) => {
            const moc = d.chu.match(MOC);
            return (
              <p key={i} className="m-0">
                {moc ? <><strong>{moc[0].trim()}</strong> {d.chu.slice(moc[0].length)}</> : d.chu}
              </p>
            );
          })}
        </div>
      </details>
    </section>
  );
}
