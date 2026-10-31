import React from "react";
import { X, Stamp } from "lucide-react";
import { tr } from "../../../shared/i18n.jsx";
import { LUAT, CHUONG } from "../../../content/troChoi/phienToa.js";
import { luatTheoMuc, chuongCo } from "./luat.js";

/* Bộ luật: các điều trong tầm trình độ của mức đang chơi, chia theo chương. */
export default function BoLuat({ muc, onDong, daMo, tk = {} }) {
  const ds = luatTheoMuc(muc);
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p lang="fr" className="m-0 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Code de la grammaire</p>
          <p className="m-0 mt-1 text-sm font-extrabold">{tr(`${ds.length} điều luật ở mức này`, `${ds.length} articles à ce niveau`, `${ds.length} articles at this level`)}{daMo ? ` · ${tr(`đã nắm ${ds.filter((m) => daMo.has(m)).length}`, `${ds.filter((m) => daMo.has(m)).length} maîtrisés`, `${ds.filter((m) => daMo.has(m)).length} mastered`)}` : ""}</p>
        </div>
        <button type="button" onClick={onDong} aria-label={tr("Đóng Bộ luật", "Fermer le Code", "Close the Code")} className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white"><X size={18} /></button>
      </div>
      <div className="mt-3 grid gap-3">
        {chuongCo(ds).map((c) => (
          <section key={c} className="rounded-xl bg-[#fbf6ea] p-3 text-[#2a1020]">
            <h3 lang="fr" className="m-0 text-sm font-black uppercase tracking-wider text-[#7f1d1d]">{CHUONG[c]}</h3>
            <dl className="m-0 mt-2 grid gap-2 sm:grid-cols-2">
              {ds.filter((ma) => LUAT[ma].chuong === c).map((ma) => (
                <div key={ma}>
                  <dt lang="fr" className="text-sm font-extrabold">{daMo?.has(ma) && <Stamp size={13} className="mr-1 inline text-[#b91c1c]" aria-label={tr("Đã nắm", "Maîtrisé", "Mastered")} />}Article {LUAT[ma].so} · {LUAT[ma].ten} <span className="text-[11px] font-bold text-[#8a6d4b]">{LUAT[ma].cap}</span></dt>
                  <dd className="m-0 text-xs leading-snug">{LUAT[ma].mo} <span lang="fr" className="italic text-[#7f1d1d]">{LUAT[ma].vd}</span>{tk[ma]?.sai > 0 && <span className="ml-1 font-bold text-[#b91c1c]">{tr(`Sai ${tk[ma].sai} lần`, `${tk[ma].sai} erreur(s)`, `${tk[ma].sai} mistake(s)`)}</span>}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
