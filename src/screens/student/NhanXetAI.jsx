import React, { useEffect, useState } from "react";
import { Award, ListChecks, PenLine } from "lucide-react";
import { docGoiYAI } from "../../shared/chamPeAI.js";
import { tr } from "../../shared/i18n.jsx";
import { LeonNoi } from "../../shared/leon.jsx";
import { BaiVietCoLoi, KhoiYeuCau, TieuChi } from "../practice/LoiVietAI.jsx";
import KhieuNaiDiem, { GhiChuChamDoi } from "./KhieuNaiDiem.jsx";

/* Phiếu nhận xét của giám khảo AI (08/10).
 *
 * Đọc bản có cấu trúc trong pe_ai_goi_y (điểm từng tiêu chí, điểm mạnh, cần cải
 * thiện, trích dẫn, ưu tiên sửa, câu viết lại). Bản cũ chỉ có `nhan_xet` +
 * `tong_quat` vẫn hiện được: trường thiếu thì khối đó không dựng.
 * Không đọc được bản có cấu trúc → hiện chữ thường trong answers.feedback. */

/* `mau`: dữ liệu dựng sẵn cho /preview.html (không gọi mạng). */
export default function NhanXetAI({ answerId, rubric, level, feedback, mau, baiLam }) {
  const [d, setD] = useState(mau ?? undefined);   // undefined đang tải · null không có
  useEffect(() => {
    if (mau) return undefined;
    let c = true; docGoiYAI(answerId).then((x) => { if (c) setD(x ?? null); }); return () => { c = false; };
  }, [answerId, mau]);

  const g = d?.goiY;
  if (d === undefined) return <p className="m-0 text-xs text-soft">{tr("Đang tải nhận xét…", "Chargement de l'évaluation…", "Loading feedback…")}</p>;
  if (!g) {
    return feedback ? <p className="m-0 whitespace-pre-line rounded-lg bg-surface p-3 text-xs leading-relaxed text-ink">{feedback}</p> : null;
  }
  const tc = (rubric?.criteria ?? []).filter((c) => g.tieu_chi?.[c.id]);
  return (
    <section className="overflow-hidden rounded-2xl border border-solid border-line bg-surface">
      <header className="flex items-center gap-3 border-0 border-b border-solid border-line bg-primary-soft/50 px-4 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white"><Award size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-extrabold text-ink">{tr("Phiếu nhận xét · DELF", "Fiche d'évaluation · DELF", "Assessment sheet · DELF")} {level}</p>
          <p className="m-0 text-[11px] text-soft">{tr("Giám khảo AI chấm theo grille chính thức", "Correcteur IA, grille officielle", "AI examiner, official grid")}</p>
        </div>
        <span className="text-xl font-extrabold tabular-nums text-ink">{g.tong}<span className="text-sm text-soft">/{g.tong_toi_da}</span></span>
      </header>

      <div className="grid gap-4 p-4">
        <GhiChuChamDoi chamDoi={g.cham_doi} />
        {(g.tong_quat || g.nhan_dinh_trinh_do) && (
          <div className="grid gap-1.5 text-[13px] leading-relaxed text-ink">
            {g.tong_quat && <p className="m-0">{g.tong_quat}</p>}
            {g.nhan_dinh_trinh_do && <p className="m-0 rounded-lg bg-surface2 px-3 py-2 font-semibold">{g.nhan_dinh_trinh_do}</p>}
          </div>
        )}

        {/* 06/11: yêu cầu của đề, số từ, lỗi tô trong bài. Phiếu chấm trước ngày này không có các trường đó. */}
        {(g.yeu_cau?.length > 0 || g.kiem_tra) && <KhoiYeuCau yeuCau={g.yeu_cau} kiemTra={g.kiem_tra} />}
        {Array.isArray(g.loi) && baiLam && <BaiVietCoLoi baiLam={baiLam} loi={g.loi} gon />}

        <div>
          <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wide text-soft">{tr("Điểm theo tiêu chí · bấm để xem chi tiết", "Note par critère · cliquez pour le détail", "Score per criterion · click for details")}</p>
          <ul className="m-0 grid list-none gap-1.5 p-0">
            {tc.map((c) => <TieuChi key={c.id} c={c} t={g.tieu_chi[c.id]} />)}
          </ul>
          {g.so_cham_duoc < g.so_tieu_chi && (
            <p className="m-0 mt-2 text-xs text-warn">{g.so_tieu_chi - g.so_cham_duoc} {tr("tiêu chí AI không chấm được.", "critère(s) non évalué(s) par l'IA.", "criteria the AI could not score.")}</p>
          )}
        </div>

        {g.uu_tien?.length > 0 && (
          <div className="rounded-xl bg-warn-soft p-3">
            <p className="m-0 mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-warn"><ListChecks size={14} /> {tr("Ưu tiên sửa để lên điểm", "Priorités pour gagner des points", "Priorities to gain points")}</p>
            <ol className="m-0 grid gap-1 pl-5 text-[13px] leading-relaxed text-ink">
              {g.uu_tien.map((x, i) => <li key={i}>{x}</li>)}
            </ol>
          </div>
        )}

        {g.cau_mau?.length > 0 && (
          <div>
            <p className="m-0 mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-soft"><PenLine size={13} /> {tr("Viết lại cho đúng", "Version corrigée", "Corrected version")}</p>
            <ul className="m-0 grid list-none gap-2 p-0">
              {g.cau_mau.map((x, i) => (
                <li key={i} className="rounded-xl border border-solid border-line p-3 text-[13px] leading-relaxed">
                  <p className="m-0 text-danger line-through decoration-danger/60">{x.goc}</p>
                  <p className="m-0 mt-1 font-semibold text-ok">{x.sua}</p>
                  {x.vi_sao && <p className="m-0 mt-1 text-xs text-soft">{x.vi_sao}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {g.loi_leon && (
          <LeonNoi size={64} cam={g.tong_toi_da && g.tong / g.tong_toi_da >= 0.7 ? "tuyet-voi" : g.tong_toi_da && g.tong / g.tong_toi_da >= 0.5 ? "duoc-do" : "co-len"}>
            <span className="block text-[11px] font-extrabold uppercase tracking-wide text-primary">{tr("Leon nhắn bạn", "Le mot de Leon", "A note from Leon")}</span>
            {g.loi_leon}
          </LeonNoi>
        )}
        {/* Giai đoạn 2 (06/11): khiếu nại theo phiếu; phiếu cũ không có `id` thì không hiện nút. */}
        <KhieuNaiDiem goiYId={d?.id} criteria={tc} thu={!!mau} />
        <p className="m-0 text-[11px] text-soft">{tr("Điểm do AI chấm có thể sai và không phải điểm DELF chính thức.", "La note de l'IA peut se tromper et n'est pas une note officielle du DELF.", "AI scores can be wrong and are not official DELF scores.")}</p>
      </div>
    </section>
  );
}
