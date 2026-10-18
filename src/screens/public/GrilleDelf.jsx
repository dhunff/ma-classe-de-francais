import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PenLine, Mic, Info, Sparkles, BookA } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { useSeo } from "../../shared/seo.js";
import { GRILLE, tongDiem } from "../exam/delfGrille.js";
import { GRILLE_PO, mucCuaTieuChi } from "../../../supabase/functions/_shared/grillePO.js";

/* Trang công khai « Grille DELF giải thích » (18/10, việc G3 trong kế hoạch quảng bá).
 *
 * Đọc THẲNG hai bản thang đang dùng để chấm (delfGrille.js cho bài viết, grillePO.js
 * cho bài nói), không chép ra bản thứ ba: sửa thang một chỗ thì trang này đổi theo.
 * Bản A1, A2, C1 của bài viết là bản PHỎNG THEO quy về 25 điểm (cờ `adapted`), nên
 * trang nói rõ điều đó thay vì để người đọc tưởng là bản chính thức. */
const CAP = ["A1", "A2", "B1", "B2", "C1"];

function TheTieuChi({ ma, ten, tenVi, moTa, max, thang }) {
  return (
    <li className="rounded-2xl border border-solid border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm font-extrabold text-ink">{tenVi || ten}</p>
          {tenVi && <p className="m-0 mt-0.5 text-xs italic text-soft">{ten}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-extrabold tabular-nums text-primary">{max} {tr("đ", "pts", "pts")}</span>
      </div>
      {moTa && <p className="m-0 mt-2 text-sm leading-relaxed text-soft">{moTa}</p>}
      {thang?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {thang.map((m) => (
            <span key={`${ma}-${m.v}`} className="rounded-lg bg-surface2 px-2 py-0.5 text-[11px] font-bold tabular-nums text-ink" title={m.vi || ""}>
              {m.v}{m.vi ? ` · ${m.vi}` : ""}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

export default function GrilleDelf() {
  const [cap, setCap] = useState("B1");
  const pe = GRILLE[cap];
  const po = GRILLE_PO[cap];
  // Chữ thuần trong delfGrille.js (không phải HTML của đề), nên dựng như văn bản.
  const yeuCauPE = pe?.consigne ?? "";
  const tongPO = (po?.criteres ?? []).reduce((n, c) => n + c.max, 0);

  useSeo({
    tieuDe: tr("Grille DELF A1–C1 giải thích bằng tiếng Việt · FRACILE", "Grilles DELF A1–C1 expliquées · FRACILE", "DELF A1–C1 grading grids explained · FRACILE"),
    moTa: tr("Thang chấm bài Viết và bài Nói DELF A1, A2, B1, B2, DALF C1: từng tiêu chí, số điểm, giám khảo nhìn vào đâu. Giải thích bằng tiếng Việt.",
      "Grilles d'évaluation de la production écrite et orale, DELF A1 à DALF C1 : chaque critère et ses points.",
      "DELF A1 to DALF C1 writing and speaking grids: every criterion and its points, explained in Vietnamese."),
    duongDan: "/grille-delf",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: "Grille DELF A1–C1 giải thích",
      inLanguage: ["vi", "fr"],
      educationalLevel: CAP,
      url: "https://www.fracile.vn/grille-delf",
      provider: { "@type": "Organization", name: "FRACILE", url: "https://www.fracile.vn" },
    },
  });

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-5 sm:py-14">
        <Link to="/gioi-thieu" className="text-sm font-bold text-primary no-underline">← FRACILE</Link>
        <h1 className="m-0 mt-4 text-3xl font-extrabold tracking-tight text-ink [text-wrap:balance]">
          {tr("Grille DELF: giám khảo chấm bài Viết và bài Nói thế nào?", "Grilles DELF : comment sont notées l'écrit et l'oral ?", "DELF grids: how writing and speaking are graded")}
        </h1>
        <p className="m-0 mt-3 max-w-2xl text-sm leading-relaxed text-soft">
          {tr("Mỗi phần thi DELF chấm trên 25 điểm. Bài Viết và bài Nói không chấm theo cảm tính mà theo một tờ grille: mỗi tiêu chí một số điểm. Biết giám khảo nhìn vào đâu là biết mình cần luyện gì.",
            "Chaque épreuve du DELF est notée sur 25. L'écrit et l'oral sont évalués avec une grille : un nombre de points par critère.",
            "Each DELF paper is scored out of 25. Writing and speaking are graded with a grid: points for each criterion.")}
        </p>

        <div className="mt-6 flex flex-wrap gap-2" role="tablist">
          {CAP.map((c) => (
            <button key={c} type="button" role="tab" aria-selected={cap === c} onClick={() => setCap(c)}
              className={`cursor-pointer rounded-xl border-0 px-4 py-2 font-sans text-sm font-extrabold ${cap === c ? "bg-primary text-white" : "bg-surface2 text-ink hover:bg-primary-soft"}`}>
              {c === "C1" ? "DALF C1" : `DELF ${c}`}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-surface2 p-4 text-sm leading-relaxed text-ink">
          <p className="m-0 flex items-start gap-2">
            <Info size={16} className="mt-0.5 shrink-0 text-primary" />
            <span>{tr("Điều kiện đạt: tổng từ 50/100 và không phần nào dưới 5/25. Giỏi ba phần mà một phần dưới 5 vẫn trượt.",
              "Pour réussir : 50/100 au total et au moins 5/25 à chaque épreuve.",
              "To pass: 50/100 overall and at least 5/25 in every paper.")}</span>
          </p>
        </div>

        <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-2">
          <section className="min-w-0">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-ink">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary"><PenLine size={16} /></span>
              {tr("Bài Viết", "Production écrite", "Writing")} · {tongDiem(cap)} {tr("điểm", "points", "points")}
            </h2>
            {pe && (
              <p className="m-0 mt-2 text-xs leading-relaxed text-soft">
                <span className="italic">{yeuCauPE}</span>{pe.minWords ? ` · ${tr("tối thiểu", "minimum", "minimum")} ${pe.minWords} ${tr("từ", "mots", "words")}` : ""}
              </p>
            )}
            {pe?.adapted && (
              <p className="m-0 mt-2 rounded-xl bg-warn-soft px-3 py-2 text-xs leading-relaxed text-warn">
                {tr("Bản phỏng theo, quy về 25 điểm để tự chấm. Đề thật ở trình độ này chia bài Viết thành nhiều bài nhỏ với thang riêng.",
                  "Version adaptée, ramenée sur 25 pour l'auto-évaluation.",
                  "Adapted version, scaled to 25 for self-assessment.")}
              </p>
            )}
            <ul className="m-0 mt-3 list-none space-y-2 p-0">
              {(pe?.criteres ?? []).map((c) => (
                <TheTieuChi key={c.id} ma={c.id} ten={c.label} tenVi={tr(c.label_vi, c.label, c.label)} moTa={tr(c.aide_vi, c.aide, c.aide)} max={c.max} />
              ))}
            </ul>
          </section>

          <section className="min-w-0">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-ink">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary"><Mic size={16} /></span>
              {tr("Bài Nói", "Production orale", "Speaking")} · {tongPO} {tr("điểm", "points", "points")}
            </h2>
            <p className="m-0 mt-2 text-xs leading-relaxed text-soft">
              {po?.kieu === "nua"
                ? tr("Mỗi tiêu chí chấm theo nửa điểm, từ 0 tới mức tối đa.", "Chaque critère est noté par demi-points.", "Each criterion is scored in half points.")
                : tr("Mỗi tiêu chí có bốn mức: không trả lời, dưới mức, đạt mức, trên mức. Mỗi mức ứng với một khoảng điểm.", "Chaque critère a quatre niveaux, chacun correspondant à des points.", "Each criterion has four bands, each mapped to points.")}
            </p>
            <ul className="m-0 mt-3 list-none space-y-2 p-0">
              {(po?.criteres ?? []).map((c) => (
                <TheTieuChi key={c.id} ma={c.id} ten={c.label} tenVi={tr(c.vi, c.label, c.label)} max={c.max}
                  thang={po.kieu === "nua" ? [] : mucCuaTieuChi(cap, c)} />
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-10 grid gap-3 rounded-3xl border border-solid border-line bg-surface p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="m-0 text-base font-extrabold text-ink">{tr("Thử chấm bài của bạn theo đúng grille này", "Faites noter votre texte avec cette grille", "Get your text graded with this grid")}</p>
            <p className="m-0 mt-1 text-sm text-soft">
              {tr("Làm đề thi thử trên FRACILE: AI gợi ý điểm từng tiêu chí bài Viết và bài Nói, bạn đối chiếu rồi tự chấm.",
                "Passez un examen blanc : l'IA propose une note par critère, vous validez.",
                "Take a mock exam: AI suggests a score per criterion, you confirm.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-white no-underline">
              <Sparkles size={15} /> {tr("Làm thử miễn phí", "Essayer gratuitement", "Try for free")}
            </Link>
            <Link to="/ngu-phap" className="inline-flex items-center gap-1.5 rounded-xl bg-surface2 px-4 py-2.5 text-sm font-extrabold text-ink no-underline">
              <BookA size={15} /> {tr("Học ngữ pháp", "Grammaire", "Grammar")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
