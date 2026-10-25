import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { timCau, laySua, napSuaNguPhap } from "../../content/nguPhap/index.js";

/* Giáo viên sửa một câu luyện « Học ngữ pháp » trên web (25/10, migration 166).
 * Ghi vào lớp đè ngu_phap_sua theo (mã bài, đề GỐC); nội dung gốc trong mã nguồn
 * không đổi. « Về bản gốc » xoá dòng đè; « Ẩn câu » bỏ câu khỏi bài. */
export default function SuaCauNguPhap({ ma, goc, onXong, onDong }) {
  const c = timCau(ma, goc);
  const daSua = laySua(ma, goc);
  const [de, setDe] = useState(c?.de ?? goc);
  const [giai, setGiai] = useState(c?.giai ?? "");
  const [pa, setPa] = useState((c?.pa ?? []).join("\n"));
  const [dapQcm, setDapQcm] = useState(typeof c?.dap === "number" ? c.dap : 0);
  const [dung, setDung] = useState(!!c?.dung);
  const [dap, setDap] = useState(Array.isArray(c?.dap) ? c.dap.join("\n") : "");
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState("");
  if (!c) return null;

  const ghi = async (hang) => {
    setDang(true); setLoi("");
    const { error } = hang === null
      ? await supabase.from("ngu_phap_sua").delete().eq("ma_bai", ma).eq("cau_goc", goc)
      : await supabase.from("ngu_phap_sua").upsert({ ma_bai: ma, cau_goc: goc, sua_luc: new Date().toISOString(), ...hang });
    if (error) { setDang(false); setLoi(error.message); return; }
    await napSuaNguPhap(supabase, { lamMoi: true });
    setDang(false); onXong?.();
  };
  const luu = () => {
    const nd = { de: de.trim(), giai: giai.trim() };
    if (!nd.de) { setLoi(tr("Đề không được trống.", "L'énoncé est vide.", "Prompt is empty.")); return; }
    if (c.loai === "qcm") {
      nd.pa = pa.split("\n").map((x) => x.trim()).filter(Boolean);
      if (nd.pa.length < 2 || dapQcm >= nd.pa.length) { setLoi(tr("Cần ít nhất 2 phương án và chọn đáp án đúng.", "Au moins 2 options et une bonne réponse.", "Need 2+ options and a correct one.")); return; }
      nd.dap = dapQcm;
    } else if (c.loai === "vf") nd.dung = dung;
    else {
      nd.dap = dap.split("\n").map((x) => x.trim()).filter(Boolean);
      if (!nd.dap.length) { setLoi(tr("Cần ít nhất một đáp án.", "Au moins une réponse.", "Need at least one answer.")); return; }
    }
    ghi({ noi_dung: nd, an: false });
  };

  const o = "w-full rounded-xl border border-solid border-line bg-surface px-3 py-2 font-sans text-sm text-ink";
  const nhan = "m-0 mb-1 mt-3 text-xs font-extrabold uppercase tracking-wider text-soft";
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={onDong}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-surface p-5 shadow-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-lg font-extrabold text-ink">{tr("Sửa câu luyện", "Modifier l'exercice", "Edit exercise")}</h2>
          <button type="button" onClick={onDong} className="cursor-pointer rounded-full border-0 bg-surface2 p-1.5 text-soft"><X size={16} /></button>
        </div>
        {daSua && <p className="m-0 mt-1 text-xs text-soft">{tr("Câu này đã được sửa trên web. Bản gốc", "Déjà modifié. Original", "Already edited. Original")}: <span lang="fr">{goc}</span></p>}

        <p className={nhan}>{c.loai === "sap" ? tr("Gợi ý (tiếng Việt)", "Consigne", "Hint") : tr("Đề", "Énoncé", "Prompt")}</p>
        <textarea lang="fr" rows={2} value={de} onChange={(e) => setDe(e.target.value)} className={o} />

        {c.loai === "qcm" && (<>
          <p className={nhan}>{tr("Phương án (mỗi dòng một)", "Options (une par ligne)", "Options (one per line)")}</p>
          <textarea lang="fr" rows={4} value={pa} onChange={(e) => setPa(e.target.value)} className={o} />
          <p className={nhan}>{tr("Đáp án đúng", "Bonne réponse", "Correct answer")}</p>
          <select value={dapQcm} onChange={(e) => setDapQcm(+e.target.value)} className={o}>
            {pa.split("\n").map((x) => x.trim()).filter(Boolean).map((x, i) => <option key={i} value={i}>{x}</option>)}
          </select>
        </>)}
        {c.loai === "vf" && (
          <label className="mt-3 flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={dung} onChange={(e) => setDung(e.target.checked)} /> {tr("Câu này ĐÚNG", "Cette phrase est VRAIE", "This statement is TRUE")}</label>
        )}
        {c.loai !== "qcm" && c.loai !== "vf" && (<>
          <p className={nhan}>{c.loai === "sap" ? tr("Câu đúng (tiếng Pháp)", "Phrase correcte", "Correct sentence") : tr("Đáp án chấp nhận (mỗi dòng một cách viết)", "Réponses acceptées (une par ligne)", "Accepted answers (one per line)")}</p>
          <textarea lang="fr" rows={3} value={dap} onChange={(e) => setDap(e.target.value)} className={o} />
        </>)}

        <p className={nhan}>{tr("Giải thích", "Explication", "Explanation")}</p>
        <textarea rows={3} value={giai} onChange={(e) => setGiai(e.target.value)} className={o} />

        {loi && <p className="m-0 mt-3 rounded-xl bg-danger-soft p-2.5 text-sm text-danger">{loi}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" disabled={dang} onClick={luu} className="cursor-pointer rounded-full border-0 bg-primary px-4 py-2 font-sans text-sm font-bold text-on-primary disabled:opacity-50">{tr("Lưu", "Enregistrer", "Save")}</button>
          <button type="button" disabled={dang} onClick={() => ghi({ noi_dung: {}, an: true })} className="cursor-pointer rounded-full border border-solid border-line bg-surface px-4 py-2 font-sans text-sm font-bold text-danger">{tr("Ẩn câu này", "Masquer", "Hide")}</button>
          {daSua && <button type="button" disabled={dang} onClick={() => ghi(null)} className="cursor-pointer rounded-full border border-solid border-line bg-surface px-4 py-2 font-sans text-sm font-bold text-ink">{tr("Về bản gốc", "Rétablir l'original", "Restore original")}</button>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
