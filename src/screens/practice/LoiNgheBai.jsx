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

/* Tô xanh chỗ chứa đáp án (04/11, theo chủ dự án). Lời giải của bài nghe trích NGUYÊN VĂN lời nghe
   trong « » (máy dựng lô 27, 31, 35 kiểm điều đó), nên dò lại đúng các đoạn trích ấy trong lời nghe.
   Đoạn có « … » ở giữa là hai mảnh. Mảnh dưới 6 ký tự bỏ qua để không tô nhầm chữ ngắn lặp lại. */
const chuan = (x) => x.toLowerCase().replace(/[’]/g, "'");
function manhDapAn(cau) {
  const ra = [];
  (cau || []).forEach((q, i) => {
    for (const m of (q.explanation || "").matchAll(/« ([^»]+) »/g)) {
      for (const manh of m[1].split("…")) {
        const x = manh.trim().replace(/^[.,;:!?]+|[.,;:!?]+$/g, "").trim();
        if (x.length >= 6) ra.push({ x: chuan(x), so: i + 1 });
      }
    }
  });
  return ra;
}
/* Cắt một đoạn thành các khúc thường và khúc tô; khúc tô mang số câu (gộp khi trùng chỗ). */
function toDapAn(chu, manh) {
  const c = chuan(chu);
  const vung = [];
  for (const { x, so } of manh) {
    for (let i = c.indexOf(x); i >= 0; i = c.indexOf(x, i + 1)) vung.push([i, i + x.length, so]);
  }
  if (!vung.length) return [{ chu }];
  vung.sort((a, b) => a[0] - b[0]);
  const gop = [];
  for (const [a, b, so] of vung) {
    const cuoi = gop[gop.length - 1];
    if (cuoi && a <= cuoi.b) { cuoi.b = Math.max(cuoi.b, b); if (!cuoi.so.includes(so)) cuoi.so.push(so); }
    else gop.push({ a, b, so: [so] });
  }
  const ra = [];
  let k = 0;
  for (const g of gop) {
    if (g.a > k) ra.push({ chu: chu.slice(k, g.a) });
    ra.push({ chu: chu.slice(g.a, g.b), so: g.so.sort((x, y) => x - y) });
    k = g.b;
  }
  if (k < chu.length) ra.push({ chu: chu.slice(k) });
  return ra;
}
const Khuc = ({ ds }) => ds.map((k, i) => (k.so
  ? <mark key={i} title={tr(`Câu ${k.so.join(", ")}`, `Question ${k.so.join(", ")}`, `Question ${k.so.join(", ")}`)} className="rounded bg-ok-soft px-0.5 text-ink">{k.chu}<sup className="ml-0.5 text-[10px] font-extrabold text-ok">{k.so.join(",")}</sup></mark>
  : <React.Fragment key={i}>{k.chu}</React.Fragment>));

/* `thu`: dữ liệu dựng sẵn cho trang xem thử (preview.html), bỏ qua rpc. `cau`: câu hỏi của bài, để tô đáp án. */
export default function LoiNgheBai({ exId, onMuaVip, thu, cau }) {
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
  const manh = manhDapAn(cau);
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
        {manh.length > 0 && <p className="m-0 mt-2 text-xs text-soft"><mark className="rounded bg-ok-soft px-1 text-ink">{tr("Đoạn tô xanh", "En vert", "Green")}</mark> {tr("là chỗ chứa đáp án, số nhỏ là số câu.", ": l'endroit où se trouve la réponse, avec le numéro de la question.", ": where the answer is, with the question number.")}</p>}
        <div lang="fr" className="mt-3 grid gap-3 text-[15px] leading-relaxed text-ink">
          {(kq.loi || []).map((d, i) => {
            const moc = d.chu.match(MOC);
            const than = moc ? d.chu.slice(moc[0].length) : d.chu;
            return (
              <p key={i} className="m-0">
                {moc && <><strong>{moc[0].trim()}</strong> </>}
                <Khuc ds={toDapAn(than, manh)} />
              </p>
            );
          })}
        </div>
      </details>
    </section>
  );
}
