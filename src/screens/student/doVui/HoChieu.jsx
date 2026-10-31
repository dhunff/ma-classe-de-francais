import React from "react";
import { Award, Stamp, X } from "lucide-react";
import { tr } from "../../../shared/i18n.jsx";
import { DIA_DANH } from "../../../content/troChoi/doVuiDiaDanh.js";
import { VUNG, huyHieu } from "./luat.js";

const TEN_VUNG = {
  "ile-de-france": "Île-de-France", nord: "Le Nord", normandie: "Normandie", bretagne: "Bretagne", loire: "Val de Loire", est: "L'Est",
  alpes: "Les Alpes", "massif-central": "Massif central", "sud-ouest": "Le Sud-Ouest", occitanie: "Occitanie", provence: "Provence", "cote-azur": "Côte d'Azur", corse: "Corse",
};

/* Hộ chiếu: mỗi vùng một trang tem, đủ tem cả vùng thì được huy hiệu. */
export default function HoChieu({ tem, onDong, ghiChu }) {
  const co = DIA_DANH.filter((d) => tem[d.id] != null).length, hh = huyHieu(tem);
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Passeport</p>
          <p className="m-0 mt-1 text-sm font-extrabold tabular-nums">{tr(`${co}/${DIA_DANH.length} tem · ${hh.length}/${VUNG.length} huy hiệu vùng`, `${co}/${DIA_DANH.length} tampons · ${hh.length}/${VUNG.length} médailles`, `${co}/${DIA_DANH.length} stamps · ${hh.length}/${VUNG.length} badges`)}</p>
        </div>
        <button type="button" onClick={onDong} aria-label={tr("Đóng hộ chiếu", "Fermer le passeport", "Close passport")} className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white"><X size={18} /></button>
      </div>
      {ghiChu}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {VUNG.map((v) => {
          const noi = DIA_DANH.filter((d) => d.vung === v), du = hh.includes(v);
          return (
            <section key={v} className={`rounded-2xl border-2 border-solid p-3 text-[#431407] ${du ? "border-amber-400 bg-[#fde68a]" : "border-[#7c2d12]/40 bg-[#fef3c7]"}`}>
              <h3 lang="fr" className="m-0 flex items-center justify-between gap-2 text-sm font-extrabold">{TEN_VUNG[v]}{du && <Award size={18} className="mcf-sao-no shrink-0 fill-amber-500 text-[#7c2d12]" aria-label={tr("Đã có huy hiệu", "Médaille obtenue", "Badge earned")} />}</h3>
              <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
                {noi.map((d) => {
                  const dau = tem[d.id] != null;
                  return <li key={d.id} lang="fr" className={`flex items-center gap-1 rounded-md border-2 px-2 py-1 text-[11px] font-black uppercase tracking-wide ${dau ? "-rotate-2 border-double border-[#b91c1c] text-[#b91c1c]" : "border-dashed border-[#7c2d12]/30 text-[#7c2d12]/50"}`}>{dau && <Stamp size={12} aria-hidden />}{d.ten}</li>;
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
