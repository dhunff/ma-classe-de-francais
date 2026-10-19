import React from "react";
import { Plus, Trash2, Shuffle } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Soạn CHỦ ĐỀ BỐC THĂM cho bài Nói (19/10). Dữ liệu `bocTham` (migration 137) mà
 * màn thi đọc ở BocThamNoi.jsx:
 *   { chuanBi: phút, phan: [{ ten, cachLam, soRut, sujets: [{ ma, html }] }] }
 * Mỗi chủ đề lưu HTML (<p>…</p>). Ở đây giáo viên gõ chữ thường: mỗi đoạn cách
 * nhau một dòng trống thành một <p>; giữ được <strong>, <em> nếu gõ tay. */
const CHUAN_BI = { A1: 10, A2: 10, B1: 10, B2: 30, C1: 60 };

const htmlThanhChu = (h) => String(h ?? "").replace(/<\/p>\s*<p>/g, "\n\n").replace(/^<p>|<\/p>$/g, "");
/* KHÔNG trim / lọc đoạn rỗng: ô nhập là controlled, cắt dòng trống lúc đang gõ thì
   không xuống đoạn được. Đoạn rỗng <p></p> vô hại khi hiển thị. */
const chuThanhHtml = (t) => (String(t ?? "") ? String(t).split("\n\n").map((x) => `<p>${x}</p>`).join("") : "");

export const bocThamMacDinh = (level) => ({
  chuanBi: CHUAN_BI[level] ?? 10,
  phan: [{ ten: tr("Phần bốc thăm", "Partie tirée au sort", "Drawn part"), cachLam: "", soRut: level === "A1" ? 1 : 2, sujets: [{ ma: "1", html: "" }, { ma: "2", html: "" }] }],
});

const O = "w-full rounded-xl border border-solid border-line bg-surface px-3 py-2 font-sans text-sm text-ink";
const NHAN = "text-[11px] font-extrabold uppercase tracking-wide text-soft";

export default function SoanBocTham({ bocTham, level, onChange }) {
  if (!bocTham) {
    return (
      <button type="button" onClick={() => onChange(bocThamMacDinh(level))}
        className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-line bg-transparent px-4 py-2.5 font-sans text-sm font-bold text-primary hover:border-primary hover:bg-primary-soft">
        <Shuffle size={15} /> {tr("Thêm phần bốc thăm đề nói", "Ajouter un tirage au sort", "Add drawn topics")}
      </button>
    );
  }
  const bt = bocTham;
  const doiPhan = (i, sua) => onChange({ ...bt, phan: bt.phan.map((p, j) => (j === i ? { ...p, ...sua } : p)) });
  const doiSujet = (i, k, sua) => doiPhan(i, { sujets: bt.phan[i].sujets.map((s, j) => (j === k ? { ...s, ...sua } : s)) });

  return (
    <div className="mt-3 rounded-2xl border border-solid border-line bg-surface2 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm font-extrabold text-ink"><Shuffle size={15} className="text-primary" />{tr("Bốc thăm đề nói", "Tirage au sort", "Drawn topics")}</span>
        <label className="flex items-center gap-2 text-xs text-soft">
          {tr("Thời gian chuẩn bị (phút)", "Préparation (min)", "Preparation (min)")}
          <input type="number" min={0} max={120} value={bt.chuanBi ?? 0} onChange={(e) => onChange({ ...bt, chuanBi: Math.max(0, Number(e.target.value) || 0) })}
            className="w-20 rounded-lg border border-solid border-line bg-surface px-2 py-1 font-sans text-sm text-ink" />
        </label>
        <button type="button" onClick={() => { if (confirm(tr("Bỏ toàn bộ phần bốc thăm?", "Supprimer le tirage au sort ?", "Remove drawn topics?"))) onChange(undefined); }}
          className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-full border-0 bg-transparent px-2 py-1 font-sans text-xs font-bold text-soft hover:text-danger">
          <Trash2 size={13} /> {tr("Bỏ bốc thăm", "Retirer", "Remove")}
        </button>
      </div>

      {bt.phan.map((ph, i) => (
        <div key={i} className="mt-4 rounded-xl border border-solid border-line bg-surface p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <label className="grid gap-1"><span className={NHAN}>{tr("Tên phần", "Nom de la partie", "Part name")}</span>
              <input className={O} value={ph.ten ?? ""} onChange={(e) => doiPhan(i, { ten: e.target.value })} placeholder="3. Expression d'un point de vue (5 à 7 minutes)" />
            </label>
            <label className="grid gap-1"><span className={NHAN}>{tr("Số đề rút", "Nb tirés", "Drawn")}</span>
              <select className={O} value={ph.soRut ?? 1} onChange={(e) => doiPhan(i, { soRut: Number(e.target.value) })}>
                <option value={1}>{tr("Rút 1", "1 sujet", "Draw 1")}</option>
                <option value={2}>{tr("Rút 2, chọn 1", "2, en choisir 1", "Draw 2, pick 1")}</option>
              </select>
            </label>
          </div>
          <label className="mt-2 grid gap-1"><span className={NHAN}>{tr("Hướng dẫn", "Consigne", "Instructions")}</span>
            <input className={O} value={ph.cachLam ?? ""} onChange={(e) => doiPhan(i, { cachLam: e.target.value })} placeholder="Dégagez le thème du document, puis présentez votre opinion." />
          </label>

          <p className={`m-0 mt-3 ${NHAN}`}>{tr(`Chủ đề (${ph.sujets.length})`, `Sujets (${ph.sujets.length})`, `Topics (${ph.sujets.length})`)}</p>
          {ph.soRut === 2 && ph.sujets.length < 2 && <p className="m-0 mt-1 text-xs font-semibold text-warn">{tr("Rút 2 thì cần ít nhất 2 chủ đề.", "Il faut au moins 2 sujets.", "Need at least 2 topics.")}</p>}
          <div className="mt-2 grid gap-2">
            {ph.sujets.map((sj, k) => (
              <div key={k} className="flex gap-2">
                <input className="w-12 shrink-0 rounded-lg border border-solid border-line bg-surface px-2 py-1 text-center font-sans text-sm font-bold text-ink" value={sj.ma ?? ""} onChange={(e) => doiSujet(i, k, { ma: e.target.value })} title={tr("Mã thẻ", "Code", "Code")} />
                <textarea className={`${O} min-h-[72px] resize-y`} value={htmlThanhChu(sj.html)} onChange={(e) => doiSujet(i, k, { html: chuThanhHtml(e.target.value) })}
                  placeholder={tr("Nội dung thẻ. Cách một dòng trống để xuống đoạn. Có thể dùng <strong>…</strong>.", "Texte de la carte. Ligne vide = nouveau paragraphe.", "Card text. Blank line = new paragraph.")} />
                <button type="button" onClick={() => doiPhan(i, { sujets: ph.sujets.filter((_, j) => j !== k) })} title={tr("Xoá chủ đề", "Supprimer", "Delete")}
                  className="shrink-0 cursor-pointer self-start rounded-full border-0 bg-transparent p-1.5 text-soft hover:text-danger"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => doiPhan(i, { sujets: [...ph.sujets, { ma: String(ph.sujets.length + 1), html: "" }] })}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border-0 bg-primary-soft px-3 py-1.5 font-sans text-xs font-bold text-primary"><Plus size={13} /> {tr("Thêm chủ đề", "Ajouter un sujet", "Add topic")}</button>
            {bt.phan.length > 1 && (
              <button type="button" onClick={() => onChange({ ...bt, phan: bt.phan.filter((_, j) => j !== i) })}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border-0 bg-transparent px-3 py-1.5 font-sans text-xs font-bold text-soft hover:text-danger"><Trash2 size={13} /> {tr("Xoá phần này", "Supprimer la partie", "Delete part")}</button>
            )}
          </div>
        </div>
      ))}

      <button type="button" onClick={() => onChange({ ...bt, phan: [...bt.phan, { ten: "", cachLam: "", soRut: 2, sujets: [{ ma: "1", html: "" }, { ma: "2", html: "" }] }] })}
        className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-dashed border-line bg-transparent px-3 py-2 font-sans text-xs font-bold text-primary hover:border-primary">
        <Plus size={13} /> {tr("Thêm một phần bốc thăm", "Ajouter une partie", "Add a part")}
      </button>
      <p className="m-0 mt-2 text-xs text-soft">{tr("Phần không bốc thăm (ví dụ « Entretien dirigé ») ghi trong ô Hướng dẫn / consigne của bài.", "Les parties sans tirage vont dans la consigne.", "Parts without a draw go in the instructions.")}</p>
    </div>
  );
}
