import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Award, Lock, Printer, X } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { KY } from "./LuyenTheoCap.jsx";
import HuyHieuHang from "./HuyHieuHang.jsx";
import { THANG_HANG, tinhMoiCap } from "../../shared/hangLuyenTap.js";

/* Tab Thành tựu của Luyện tập (01/11/2026): thang hạng và chứng nhận từng kỹ năng lớn, từng
 * trình độ. Mọi số tính từ `exercises` + `hist` qua shared/hangLuyenTap.js, không lưu riêng. */

const MO_TA_HANG = () => ({
  S: [tr("Xuất sắc", "Excellent", "Outstanding"), "95–100%"],
  A: [tr("Giỏi", "Très bien", "Very good"), "85–94%"],
  B: [tr("Đạt", "Validé", "Passed"), "70–84%"],
  C: [tr("Gần đạt", "Presque", "Almost"), "60–69%"],
  D: [tr("Cần ôn", "À revoir", "Needs review"), "50–59%"],
  F: [tr("Làm lại", "À refaire", "Try again"), tr("Dưới 50%", "Moins de 50 %", "Under 50%")],
});

/* Tờ chứng nhận: giấy trắng ở cả bản tối, vì nó là một tờ giấy và phải in được. */
function ToChungNhan({ cn, ten, onDong }) {
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={tr("Chứng nhận hoàn thành", "Certificat de réussite", "Certificate of completion")}
      className="mcf-in-cn mcf-float fixed inset-0 z-[9999] flex flex-col items-center gap-3 overflow-y-auto bg-ink/60 p-4 sm:justify-center">
      <div className="mcf-cn-nut flex w-full max-w-4xl justify-end gap-2">
        <button type="button" onClick={() => window.print()} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-surface px-4 py-2 font-sans text-sm font-bold text-ink"><Printer size={16} /> {tr("In chứng nhận", "Imprimer", "Print")}</button>
        <button type="button" onClick={onDong} aria-label={tr("Đóng", "Fermer", "Close")} className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border-0 bg-surface text-ink"><X size={18} /></button>
      </div>
      <article className="mcf-cn-giay w-full max-w-4xl shrink-0">
        <div className="mcf-cn-khung flex flex-col items-center text-center">
          <div className="flex items-center gap-2"><Leon cam="dau" size={40} /><span className="text-lg font-extrabold">FRACILE</span></div>
          <p className="mcf-cn-nhan m-0 mt-4">{tr("Chứng nhận hoàn thành", "Certificat de réussite", "Certificate of completion")}</p>
          <p className="m-0 mt-5 text-sm">{tr("Chứng nhận rằng", "Ce certificat atteste que", "This certifies that")}</p>
          <p className="mcf-cn-ten m-0 mt-1">{ten}</p>
          <p className="m-0 mt-3 text-sm">{tr("đã hoàn thành lộ trình luyện tập", "a terminé le parcours d'entraînement", "has completed the practice path")}</p>
          <p className="m-0 mt-1 text-2xl font-extrabold">{cn.ten}</p>
          <div className="mt-5 flex items-center gap-3">
            {cn.hang ? <HuyHieuHang hang={cn.hang} size={64} /> : <span className="grid h-16 w-16 place-items-center rounded-full bg-amber-400 text-amber-950"><Award size={34} /></span>}
            <p className="m-0 text-left text-sm font-bold leading-snug">
              {cn.hang ? tr(`Hạng ${cn.hang}`, `Rang ${cn.hang}`, `Rank ${cn.hang}`) : tr("Hoàn thành", "Terminé", "Completed")}
              {cn.tb !== null && <span className="block font-medium">{tr(`Trung bình ${Math.round(cn.tb * 100)}%`, `Moyenne ${Math.round(cn.tb * 100)} %`, `Average ${Math.round(cn.tb * 100)}%`)}</span>}
              {cn.luc > 0 && <span className="block font-medium">{new Date(cn.luc).toLocaleDateString("vi-VN")}</span>}
            </p>
          </div>
          <p className="mcf-cn-chu m-0 mt-5">{tr("Chứng nhận của FRACILE cho quá trình tự luyện, không phải bằng DELF hay DALF.", "Certificat FRACILE d'entraînement personnel. Ce n'est pas un diplôme DELF ou DALF.", "A FRACILE certificate for self-study. This is not a DELF or DALF diploma.")}</p>
        </div>
      </article>
    </div>,
    document.body
  );
}

/* Một ô chứng nhận: đã nhận thì mở được, chưa nhận thì nói còn thiếu gì. */
function OChungNhan({ ten, Icon, nen, cn, moTa, onMo }) {
  const Goc = cn.du ? "button" : "div";
  return (
    <Goc {...(cn.du ? { type: "button", onClick: onMo } : {})}
      className={`flex min-w-0 items-center gap-3 rounded-2xl border border-solid p-3 text-left font-sans ${cn.du ? "cursor-pointer border-amber-300 bg-surface shadow-sm transition-shadow hover:shadow-md" : "border-line bg-surface2"}`}>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white ${cn.du ? "" : "opacity-50"}`} style={{ background: nen }}><Icon size={20} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-ink">{ten}</span>
        <span className={`block text-xs font-semibold ${cn.du ? "text-ok" : "text-soft"}`}>{moTa}</span>
      </span>
      {cn.du ? (cn.hang ? <HuyHieuHang hang={cn.hang} size={32} /> : <Award size={22} className="shrink-0 text-warn" />) : <Lock size={15} className="shrink-0 text-soft" />}
    </Goc>
  );
}

export default function ThanhTuu({ exercises, hist, biKhoa, ten }) {
  const moiCap = useMemo(() => tinhMoiCap(exercises, hist, biKhoa), [exercises, hist, biKhoa]);
  const [xem, setXem] = useState(null);
  const KYN = KY();
  const moTaHang = MO_TA_HANG();
  const dem = Object.fromEntries(THANG_HANG.map(({ hang }) => [hang, moiCap.reduce((n, c) => n + c.dem[hang], 0)]));
  const soCn = moiCap.reduce((n, c) => n + c.kyLon.filter((k) => k.du).length + (c.du ? 1 : 0), 0);
  const mo = (cn, tenCn) => setXem({ ...cn, ten: tenCn });
  const moTaKy = (k) => {
    if (k.du) return tr("Xem chứng nhận", "Voir le certificat", "View certificate");
    if (k.sapCo) return tr(`Đạt ${k.dat}/${k.tong}, còn kỹ năng đang soạn`, `${k.dat}/${k.tong} validées, d'autres en préparation`, `${k.dat}/${k.tong} passed, others being prepared`);
    return tr(`Đạt ${k.dat}/${k.tong} kỹ năng nhỏ`, `${k.dat}/${k.tong} sous-compétences validées`, `${k.dat}/${k.tong} sub-skills passed`);
  };
  return (
    <div>
      <section className="mcf-cau-vao mb-6 flex flex-wrap items-center gap-4 rounded-3xl border border-solid border-line bg-surface p-4 shadow-sm">
        <Leon cam={soCn ? "yeah" : "quyet-tam"} size={64} className="shrink-0" />
        <div className="min-w-[12rem] flex-1">
          <h2 className="m-0 text-lg font-extrabold text-ink">{soCn ? tr(`Bạn có ${soCn} chứng nhận`, `Vous avez ${soCn} certificat${soCn > 1 ? "s" : ""}`, `You have ${soCn} certificate${soCn > 1 ? "s" : ""}`) : tr("Chứng nhận đầu tiên đang chờ bạn", "Votre premier certificat vous attend", "Your first certificate is waiting")}</h2>
          <p className="m-0 mt-0.5 text-sm text-soft">{tr("Đạt mọi kỹ năng nhỏ của một kỹ năng lớn để nhận chứng nhận. Đủ bốn kỹ năng lớn là nhận chứng nhận cả trình độ.", "Validez toutes les sous-compétences d'une compétence pour obtenir son certificat. Les quatre compétences donnent le certificat du niveau.", "Pass every sub-skill of a skill to earn its certificate. All four skills earn the level certificate.")}</p>
        </div>
      </section>

      <h2 className="m-0 mb-3 text-base font-extrabold text-ink">{tr("Thang hạng", "Échelle des rangs", "Rank scale")}</h2>
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-6">
        {THANG_HANG.map(({ hang }) => (
          <li key={hang} className="flex items-center gap-3 rounded-2xl border border-solid border-line bg-surface p-3">
            <HuyHieuHang hang={hang} size={40} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-ink">{moTaHang[hang][0]}</span>
              <span className="block text-xs text-soft">{moTaHang[hang][1]}</span>
              <span className="block text-xs font-bold tabular-nums text-ink">{tr(`${dem[hang]} kỹ năng`, `${dem[hang]} compét.`, `${dem[hang]} skills`)}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="m-0 mb-6 mt-3 text-sm text-soft">{tr("Mỗi bài lấy điểm cao nhất, nên làm lại chỉ có thể lên hạng. Từ B trở lên là đạt. Bài viết tự do và bài nói chưa có điểm máy chấm nên ghi Hoàn thành, không xếp hạng.", "Chaque exercice compte pour sa meilleure note : refaire ne peut que faire monter. À partir de B, c'est validé. Les textes libres et l'oral n'ont pas de note automatique : ils comptent comme terminés, sans rang.", "Each exercise counts its best score, so retrying can only raise your rank. B or above is a pass. Free writing and speaking have no automatic score, so they show as completed without a rank.")}</p>

      <div className="flex flex-col gap-5">
        {moiCap.map((c) => {
          const tenCap = tr(`Trình độ ${c.cap}`, `Niveau ${c.cap}`, `Level ${c.cap}`);
          return (
            <section key={c.cap}>
              <h2 className="m-0 mb-2 text-base font-extrabold text-ink">{c.cap}</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11rem),1fr))] gap-3">
                {c.kyLon.map((k) => {
                  const m = KYN[k.ky];
                  const tenKy = `${m.ten} ${c.cap}`;
                  return <OChungNhan key={k.ky} ten={tenKy} Icon={m.Icon} nen={m.nen} cn={k} moTa={moTaKy(k)} onMo={() => mo(k, tenKy)} />;
                })}
                <OChungNhan ten={tenCap} Icon={Award} nen="linear-gradient(135deg,#F59E0B,#B45309)" cn={c}
                  moTa={c.du ? tr("Xem chứng nhận", "Voir le certificat", "View certificate") : tr(`Cần đủ 4 kỹ năng, có ${c.kyLon.filter((k) => k.du).length}`, `${c.kyLon.filter((k) => k.du).length}/4 compétences`, `${c.kyLon.filter((k) => k.du).length}/4 skills`)}
                  onMo={() => mo(c, tenCap)} />
              </div>
            </section>
          );
        })}
      </div>
      {xem && <ToChungNhan cn={xem} ten={ten} onDong={() => setXem(null)} />}
    </div>
  );
}
