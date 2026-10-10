import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Ba dạng câu DELF thêm 07/10, dùng chung cho mọi màn (luyện tập, bài giao,
 * thi thử, xem bài đã nộp, giáo viên chấm).
 *
 *   · GhepCap   « apparier »   : A2 nghe bài 4, đọc A1/A2. Mỗi mục chọn MỘT
 *                                phương án trong danh sách (thường thừa ra).
 *   · DienPhieu « formulaire » : A1 viết bài 1. Điền ô thông tin, không chấm.
 *   · AnhLuaChon               : ảnh cho phương án QCM (A1/A2 « chọn hình »).
 *
 * Đáp án KHÔNG đọc từ `q.answers` phía học sinh — từ 022 trường đó không tới
 * trình duyệt. Màn chữa bài truyền `dapAn` = `expected` của máy chủ (chỉ có khi
 * câu sai); câu đúng thì chính lựa chọn của học sinh là đáp án. */

const chu = (i) => String.fromCharCode(65 + i);

export function GhepCap({ q, value, onChange, readOnly, correction, dapAn }) {
  const items = q.items || [], choix = q.choix || [];
  const dung = correction ? (dapAn ?? value ?? {}) : null;
  return (
    <div className="grid gap-3">
      <ol className="m-0 grid list-none gap-1.5 rounded-xl bg-surface2 p-3 text-sm text-ink">
        {choix.map((c, i) => (
          <li key={c.id} className="flex gap-2"><strong className="w-5 shrink-0 text-primary">{chu(i)}</strong><span>{c.texte}</span></li>
        ))}
      </ol>
      <div className="grid gap-2">
        {items.map((it, n) => {
          const chon = value?.[it.id];
          const ok = correction ? chon != null && chon === dung?.[it.id] : null;
          const dapAnChu = correction && !ok && dung?.[it.id] != null ? chu(choix.findIndex((c) => c.id === dung[it.id])) : null;
          return (
            <div key={it.id} className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{it.texte || `${n + 1}`}</span>
              <div className="flex flex-wrap gap-1.5">
                {choix.map((c, i) => {
                  const sel = chon === c.id;
                  const mau = correction
                    ? (sel ? (ok ? "border-ok bg-ok-soft text-ok" : "border-danger bg-danger-soft text-danger")
                      : dung?.[it.id] === c.id ? "border-ok text-ok" : "border-line text-soft")
                    : sel ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink hover:border-primary";
                  return (
                    <button key={c.id} type="button" disabled={readOnly}
                      onClick={() => onChange?.({ ...value, [it.id]: sel ? undefined : c.id })}
                      className={`grid h-9 w-9 place-items-center rounded-lg border border-solid font-sans text-sm font-bold ${readOnly ? "cursor-default" : "cursor-pointer"} ${mau}`}>
                      {chu(i)}
                    </button>
                  );
                })}
              </div>
              {correction && (ok
                ? <CheckCircle2 size={18} className="text-ok" />
                : <span className="inline-flex items-center gap-1 text-xs font-bold text-ok"><XCircle size={16} className="text-danger" />{dapAnChu && tr(`Réponse : ${dapAnChu}`, `Đáp án: ${dapAnChu}`, `Answer: ${dapAnChu}`)}</span>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DienPhieu({ q, value, onChange, readOnly }) {
  return (
    <div className="grid gap-2.5 rounded-xl border border-solid border-line bg-surface p-4 sm:grid-cols-2">
      {(q.champs || []).map((c) => (
        <label key={c.id} className="grid gap-1 text-xs font-bold uppercase tracking-wide text-soft">
          {c.nhan}
          <input lang="fr" type="text" value={value?.[c.id] || ""} disabled={readOnly}
            onChange={(e) => onChange?.({ ...value, [c.id]: e.target.value })}
            className="h-10 rounded-lg border border-solid border-line bg-surface2 px-3 font-sans text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-primary" />
        </label>
      ))}
    </div>
  );
}

export function AnhLuaChon({ q, j }) {
  const src = q.optionImages?.[j];
  if (!src) return null;
  return <img src={src} alt="" className="block h-24 w-32 shrink-0 rounded-lg object-cover" />;
}

/* Câu trả lời dạng chữ cho bảng tóm tắt (giáo viên chấm, xem bài đã nộp). */
export const tomTatDangMoi = (q, a) => {
  if (q.type === "apparier") return (q.items || []).map((it, n) => {
    const i = (q.choix || []).findIndex((c) => c.id === a?.[it.id]);
    return `${n + 1}→${i >= 0 ? chu(i) : "?"}`;
  }).join("  ");
  if (q.type === "formulaire") return (q.champs || []).map((c) => `${c.nhan}: ${a?.[c.id] || "…"}`).join(" · ");
  return null;
};
