import React from "react";
import { Trash2 } from "lucide-react";
import { uid } from "../../shared/questions.js";
import { tr } from "../../shared/i18n.jsx";

/* Trình soạn cho hai dạng câu DELF thêm 07/10 (xem screens/student/dangMoi.jsx).
 * Tách khỏi Builder.jsx vì file đó đã quá dài; Builder chỉ gọi hai component
 * này với `q` và `setQ`. */

const chu = (i) => String.fromCharCode(65 + i);
const o = "h-9 min-w-0 flex-1 rounded-lg border border-solid border-line bg-surface2 px-3 font-sans text-sm text-ink outline-none focus:border-primary";
const nutThem = "h-8 cursor-pointer rounded-full border border-solid border-line bg-surface px-3 font-sans text-xs font-bold text-ink hover:border-primary";
const nutXoa = "grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-danger";

export const moiGhepCap = () => ({
  id: uid(), type: "apparier", prompt: "Associez chaque document à la situation correspondante.",
  items: [1, 2, 3, 4].map((n) => ({ id: uid(), texte: `Dialogue ${n}` })),
  choix: [1, 2, 3, 4, 5, 6].map((n) => ({ id: uid(), texte: `Situation ${n}` })),
  answers: {},
});
export const moiPhieu = () => ({
  id: uid(), type: "formulaire", prompt: "Vous vous inscrivez dans un club de sport. Remplissez le formulaire.",
  champs: ["Nom", "Prénom", "Nationalité", "Âge", "Adresse", "Sport préféré"].map((nhan) => ({ id: uid(), nhan })),
});

export function SoanGhepCap({ q, setQ }) {
  const items = q.items || [], choix = q.choix || [], ans = q.answers || {};
  const doi = (patch) => setQ(q.id, patch);
  return (
    <div className="mt-3 grid gap-4">
      <div className="grid gap-2">
        <p className="m-0 text-xs font-bold uppercase tracking-wide text-soft">{tr("Phương án (A, B, C…) · nên nhiều hơn số mục để có phương án thừa", "Choix (A, B, C…) · prévoyez plus de choix que d'éléments", "Options (A, B, C…) · add more options than items")}</p>
        {choix.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2">
            <strong className="w-5 text-primary">{chu(i)}</strong>
            <input className={o} value={c.texte} onChange={(e) => doi({ choix: choix.map((x) => x.id === c.id ? { ...x, texte: e.target.value } : x) })} />
            {choix.length > 2 && (
              <button type="button" className={nutXoa} title="Xoá" onClick={() => {
                const na = Object.fromEntries(Object.entries(ans).filter(([, v]) => v !== c.id));
                doi({ choix: choix.filter((x) => x.id !== c.id), answers: na });
              }}><Trash2 size={15} /></button>
            )}
          </div>
        ))}
        <div><button type="button" className={nutThem} onClick={() => doi({ choix: [...choix, { id: uid(), texte: "" }] })}>{tr("+ Phương án", "+ Choix", "+ Option")}</button></div>
      </div>
      <div className="grid gap-2">
        <p className="m-0 text-xs font-bold uppercase tracking-wide text-soft">{tr("Mục cần ghép và đáp án đúng", "Éléments à associer et bonne réponse", "Items to match and correct answer")}</p>
        {items.map((it, n) => (
          <div key={it.id} className="flex flex-wrap items-center gap-2">
            <span className="w-5 text-sm font-bold text-soft">{n + 1}</span>
            <input className={o} value={it.texte} onChange={(e) => doi({ items: items.map((x) => x.id === it.id ? { ...x, texte: e.target.value } : x) })} />
            <select value={ans[it.id] || ""} onChange={(e) => doi({ answers: { ...ans, [it.id]: e.target.value || undefined } })}
              className="h-9 rounded-lg border border-solid border-line bg-surface px-2 font-sans text-sm font-bold text-ink">
              <option value="">{tr("Đáp án…", "Réponse…", "Answer…")}</option>
              {choix.map((c, i) => <option key={c.id} value={c.id}>{chu(i)}</option>)}
            </select>
            {items.length > 1 && (
              <button type="button" className={nutXoa} title="Xoá" onClick={() => {
                const na = { ...ans }; delete na[it.id];
                doi({ items: items.filter((x) => x.id !== it.id), answers: na });
              }}><Trash2 size={15} /></button>
            )}
          </div>
        ))}
        <div><button type="button" className={nutThem} onClick={() => doi({ items: [...items, { id: uid(), texte: `Dialogue ${items.length + 1}` }] })}>{tr("+ Mục", "+ Élément", "+ Item")}</button></div>
      </div>
      <p className="m-0 text-xs text-soft">{tr("Chấm từng mục: 4 mục đúng 3 được 3 điểm, giống cách DELF đếm.", "Notation par élément : 3 bons sur 4 = 3 points, comme au DELF.", "Scored per item: 3 of 4 correct = 3 points, as in DELF.")}</p>
    </div>
  );
}

export function SoanPhieu({ q, setQ }) {
  const champs = q.champs || [];
  return (
    <div className="mt-3 grid gap-2">
      <p className="m-0 text-xs font-bold uppercase tracking-wide text-soft">{tr("Các ô của phiếu", "Champs du formulaire", "Form fields")}</p>
      {champs.map((c) => (
        <div key={c.id} className="flex items-center gap-2">
          <input className={o} value={c.nhan} onChange={(e) => setQ(q.id, { champs: champs.map((x) => x.id === c.id ? { ...x, nhan: e.target.value } : x) })} />
          {champs.length > 1 && (
            <button type="button" className={nutXoa} title="Xoá" onClick={() => setQ(q.id, { champs: champs.filter((x) => x.id !== c.id) })}><Trash2 size={15} /></button>
          )}
        </div>
      ))}
      <div><button type="button" className={nutThem} onClick={() => setQ(q.id, { champs: [...champs, { id: uid(), nhan: "" }] })}>+ Ô</button></div>
      <p className="m-0 text-xs text-soft">{tr("Thông tin cá nhân nên không chấm tự động; học sinh tự đối chiếu hoặc giáo viên xem.", "Informations personnelles : pas de correction automatique.", "Personal information: not auto-graded.")}</p>
    </div>
  );
}

/* Ô nhập đường dẫn ảnh cho một phương án QCM (A1/A2 « chọn hình »). */
export function AnhPhuongAn({ q, j, setQ }) {
  if (!Array.isArray(q.optionImages)) return null;
  return (
    <input className={`${o} ml-7 mt-1`} placeholder={`Lien de l'image ${chu(j)} (https://…)`} value={q.optionImages[j] || ""}
      onChange={(e) => setQ(q.id, { optionImages: q.options.map((_, k) => (k === j ? e.target.value : q.optionImages[k] || "")) })} />
  );
}
