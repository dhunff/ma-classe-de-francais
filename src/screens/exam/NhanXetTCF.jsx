import React, { useEffect, useState } from "react";
import { Sparkles, ChevronDown, Loader2, AlertTriangle } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { chamTcf } from "../../shared/chamTcfAI.js";

/* Phiếu AI chấm Viết / Nói TCF (14/11): điểm /20, mức CECRL, NCLC (TCF Canada), mức từng tâche với
 * nhận xét theo ba nhóm tiêu chí của France Éducation international, lỗi, lời khuyên.
 * `ban` = phiếu đã có (đọc từ tcf_cham); không có thì tự gọi `cham-tcf` một lần khi dựng. */

const TEN_MUC = (m) => (m === "non_realisee" ? tr("Chưa làm", "Non réalisée", "Not done") : m === "<A1" ? tr("Chưa đạt A1", "A1 non atteint", "Below A1") : m);
const NHOM = () => [
  ["linguistique", tr("Ngôn ngữ", "Linguistique", "Language")],
  ["pragmatique", tr("Tổ chức, phát triển ý", "Pragmatique", "Organisation")],
  ["sociolinguistique", tr("Phù hợp tình huống", "Sociolinguistique", "Appropriateness")],
];

export default function NhanXetTCF({ attemptId, ban = null, tuDong = true }) {
  const [kq, setKq] = useState(ban);
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState("");
  const [mo, setMo] = useState(false);

  useEffect(() => {
    if (kq || !tuDong || !attemptId) return;
    let huy = false;
    setDang(true);
    chamTcf(attemptId).then((r) => {
      if (huy) return;
      setDang(false);
      if (r.ok) setKq(r); else setLoi(r.thongBao);
    });
    return () => { huy = true; };
  }, [attemptId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (dang) {
    return <p className="m-0 mt-3 flex items-center gap-2 text-xs font-semibold text-soft"><Loader2 size={14} className="animate-spin text-primary" /> {tr("AI đang chấm theo tiêu chí TCF…", "Correction IA selon les critères du TCF…", "AI grading with TCF criteria…")}</p>;
  }
  if (loi) return <p className="m-0 mt-3 flex items-start gap-2 text-xs font-semibold text-danger"><AlertTriangle size={14} className="mt-0.5 shrink-0" /> {loi}</p>;
  if (!kq) return null;

  const k = kq.ketQua ?? {};
  const laCanada = kq.level === "TCF";
  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="m-0 text-3xl font-extrabold leading-none tabular-nums text-ink">{kq.diem}<span className="text-base font-bold text-soft">/20</span></p>
        <div className="flex flex-wrap gap-1.5">
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${kq.cap ? "bg-primary-soft text-primary" : "bg-surface2 text-soft"}`}>
            {kq.cap ? `${tr("Trình độ", "Niveau", "Level")} ${kq.cap}` : tr("Chưa đạt A1", "A1 non atteint", "Below A1")}
          </span>
          {laCanada && (
            <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${kq.nclc >= 7 ? "bg-ok-soft text-ok" : kq.nclc >= 4 ? "bg-primary-soft text-primary" : "bg-surface2 text-soft"}`}>
              {kq.nclc >= 4 ? `NCLC ${kq.nclc}${kq.nclc === 10 ? "+" : ""}` : tr("Dưới NCLC 4", "Sous NCLC 4", "Below NCLC 4")}
            </span>
          )}
        </div>
      </div>
      {k.cham_doi?.chua_chac && (
        <p className="m-0 mt-2 text-xs text-warn">{tr("Các lượt AI chấm lệch nhau khá xa, điểm này chưa chắc.", "Les corrections IA divergent : note incertaine.", "AI gradings disagree: this score is uncertain.")}</p>
      )}
      {k.tong_quat && <p className="m-0 mt-2 flex items-start gap-2 text-xs leading-relaxed text-ink"><Sparkles size={13} className="mt-0.5 shrink-0 text-primary" /> {k.tong_quat}</p>}

      <button type="button" onClick={() => setMo((v) => !v)} aria-expanded={mo}
        className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-surface2 px-3 py-2 text-left font-sans text-xs font-bold text-ink hover:bg-primary-soft">
        {tr("Chi tiết từng tâche, lỗi và lời khuyên", "Détail par tâche, erreurs et conseils", "Per-task detail, errors and tips")}
        <ChevronDown size={14} className={`ml-auto shrink-0 text-soft transition-transform ${mo ? "rotate-180" : ""}`} />
      </button>
      {mo && (
        <div className="mt-2 grid gap-2">
          {(k.taches ?? []).map((t) => (
            <div key={t.so} className="rounded-xl border border-solid border-line p-3">
              <p className="m-0 flex items-center justify-between gap-2 text-xs font-extrabold text-ink">
                Tâche {t.so}
                {k.so_tu?.[t.so - 1] != null && <span className="font-semibold text-soft">{k.so_tu[t.so - 1]} {tr("từ", "mots", "words")}</span>}
                <span className="rounded-full bg-surface2 px-2 py-0.5 text-[11px]">{TEN_MUC(t.niveau)}</span>
              </p>
              {NHOM().map(([id, ten]) => t[id] ? (
                <p key={id} className="m-0 mt-1.5 text-xs leading-relaxed text-soft"><strong className="text-ink">{ten}:</strong> {t[id]}</p>
              ) : null)}
            </div>
          ))}
          {(k.loi ?? []).length > 0 && (
            <div className="rounded-xl border border-solid border-line p-3">
              <p className="m-0 text-xs font-extrabold text-ink">{tr("Lỗi cần sửa", "Erreurs à corriger", "Errors to fix")}</p>
              <ul className="m-0 mt-1.5 grid list-none gap-1.5 p-0">
                {k.loi.map((l, i) => (
                  <li key={i} className="text-xs leading-relaxed text-soft">
                    <span lang="fr" className="rounded bg-danger-soft px-1 text-danger line-through">{l.trich}</span> → <span lang="fr" className="rounded bg-ok-soft px-1 font-semibold text-ok">{l.sua}</span>
                    {l.giai_thich && <span className="block">{l.giai_thich}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(k.conseils ?? []).length > 0 && (
            <div className="rounded-xl bg-primary-soft p-3">
              <p className="m-0 text-xs font-extrabold text-ink">{tr("Để lên điểm", "Pour progresser", "To score higher")}</p>
              <ul className="m-0 mt-1 list-disc pl-4 text-xs leading-relaxed text-ink">{k.conseils.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
          {k.chep_loi && (
            <details className="rounded-xl border border-solid border-line p-3 text-xs text-soft">
              <summary className="cursor-pointer font-bold text-ink">{tr("Bản chép lời bài nói (máy chép)", "Transcription automatique", "Automatic transcript")}</summary>
              <p lang="fr" className="m-0 mt-2 whitespace-pre-line leading-relaxed">{k.chep_loi}</p>
            </details>
          )}
        </div>
      )}
      <p className="m-0 mt-2 text-[11px] text-soft">{tr("Điểm do AI ước lượng theo tiêu chí công bố của France Éducation international, không phải điểm chính thức.", "Note estimée par l'IA selon les critères publiés par France Éducation international, non officielle.", "AI estimate based on France Éducation international's published criteria, not an official score.")}</p>
    </div>
  );
}
