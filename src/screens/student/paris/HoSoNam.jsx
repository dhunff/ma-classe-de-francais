import React, { useEffect, useState } from "react";
import { Award, CalendarCheck, Shuffle, Crown, Heart, Lightbulb, Images, BookOpen, Languages, PiggyBank, Users, HandCoins, Lock, CloudOff, KeyRound, GraduationCap, Coffee, TrainFront } from "lucide-react";
import { DIA_DIEM, ALBUM, THANH_NGU, KET_CUC } from "../../../content/troChoi/parisKyUc.js";
import { tr } from "../../../shared/i18n.jsx";

/* Thành tích và bảng bạn bè (31/10, giai đoạn 6). Thành tích TÍNH từ kết cục và kỷ lục, không lưu riêng:
   h = { ket: { mã: bản }, noi, anh, cau, ngu, tien, ban, vay } do hoSoGop trong luat.js dựng. */
const HET_TRON = () => Object.keys(KET_CUC).filter((m) => !KET_CUC[m].an);
export const THANH_TICH = () => [
  { ma: "nam", Icon: CalendarCheck, ten: tr("Một năm trọn vẹn", "Une année complète", "A full year"), mo: tr("Sống hết 12 tháng", "Vivre les 12 mois", "Live all 12 months"), dat: (h) => Object.keys(h.ket).length > 0 },
  { ma: "ba", Icon: Shuffle, ten: tr("Ba số phận", "Trois destins", "Three destinies"), mo: tr("Mở 3 kết cục khác nhau", "Voir 3 fins différentes", "See 3 different endings"), dat: (h) => Object.keys(h.ket).length >= 3 },
  { ma: "tron", Icon: Crown, ten: tr("Mọi con đường", "Tous les chemins", "Every road"), mo: tr("Bản trọn vẹn của cả 4 hướng", "Les 4 fins accomplies", "All 4 full endings"), dat: (h) => HET_TRON().every((m) => h.ket[m] === "dat") },
  { ma: "nha", Icon: Heart, ten: tr("Paris, ngôi nhà", "Paris, ma maison", "Paris, my home"), mo: tr("Mở kết cục ẩn", "Trouver la fin cachée", "Find the hidden ending"), dat: (h) => !!h.ket.nha },
  { ma: "den", Icon: Lightbulb, ten: tr("Ville Lumière", "Ville Lumière", "City of Light"), mo: tr(`Thắp sáng ${DIA_DIEM.length} nơi`, `Allumer ${DIA_DIEM.length} lieux`, `Light ${DIA_DIEM.length} places`), dat: (h) => h.noi >= DIA_DIEM.length },
  { ma: "anh", Icon: Images, ten: tr("Album đầy", "Album complet", "Full album"), mo: tr(`Đủ ${ALBUM.length} ảnh trong một năm`, `${ALBUM.length} souvenirs en un an`, `${ALBUM.length} memories in a year`), dat: (h) => h.anh >= ALBUM.length },
  { ma: "so", Icon: BookOpen, ten: tr("Sổ tay dày", "Carnet bien rempli", "Thick notebook"), mo: tr("50 câu trong sổ tay", "50 phrases au carnet", "50 lines in the notebook"), dat: (h) => h.cau >= 50 },
  { ma: "ngu", Icon: Languages, ten: tr("Nói như người Pháp", "Parler comme un Français", "Speak like a local"), mo: tr(`Học đủ ${THANH_NGU.length} thành ngữ`, `Apprendre ${THANH_NGU.length} expressions`, `Learn ${THANH_NGU.length} idioms`), dat: (h) => h.ngu >= THANH_NGU.length },
  { ma: "tien", Icon: PiggyBank, ten: tr("Biết lo xa", "Économe", "Thrifty"), mo: tr("Hết năm còn 1000 €", "Finir avec 1000 €", "End with 1000 €"), dat: (h) => h.tien >= 1000 },
  { ma: "ban", Icon: Users, ten: tr("Ai cũng quý", "Aimé de tous", "Loved by all"), mo: tr("Cả 5 người thân 4 tim", "5 proches à 4 cœurs", "All 5 close, 4 hearts"), dat: (h) => h.ban >= 5 },
  { ma: "vay", Icon: HandCoins, ten: tr("Không nợ Léon", "Pas de dette", "Debt free"), mo: tr("Cả năm không vay tiền nhà", "Jamais d'emprunt", "Never borrow rent"), dat: (h) => h.vay === 0 },
];
export const thanhTichMoi = (truoc, sau) => THANH_TICH().filter((t) => t.dat(sau) && !t.dat(truoc));

export const HINH_KET = { chia: KeyRound, mu: GraduationCap, ly: Coffee, tau: TrainFront, tim: Heart };

export function CacKetCuc({ ket, toi }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Object.entries(KET_CUC).map(([ma, x]) => {
        const co = ket[ma];
        const HinhKet = HINH_KET[x.hinh];
        return (
          <div key={ma} className="text-center">
            <span className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${co === "dat" ? "text-[#2b2118]" : co ? (toi ? "bg-white/20 text-white" : "bg-surface2 text-ink") : toi ? "bg-black/30 text-white/40" : "bg-surface2 text-soft"}`} style={co === "dat" ? { background: x.a } : undefined}>{co ? <HinhKet size={19} /> : <Lock size={15} />}</span>
            <span lang="fr" className={`mt-1 block text-[10px] font-bold leading-tight ${toi ? "text-white/85" : "text-ink"}`}>{co || !x.an ? x.ten : "???"}</span>
          </div>
        );
      })}
    </div>
  );
}

export const DongMay = ({ may }) => may === "loi" && <p className="m-0 flex items-center gap-2 rounded-xl bg-surface2 px-3 py-2 text-xs text-soft"><CloudOff size={14} className="shrink-0" />{tr("Chưa nối được máy chủ: ván chơi đang lưu trên máy này và sẽ gửi lại sau.", "Serveur injoignable : la partie reste sur cet appareil et sera renvoyée plus tard.", "Server unavailable: your game stays on this device and will sync later.")}</p>;

export default function HoSoNam({ h, kho, may }) {
  const [bang, setBang] = useState(null);
  useEffect(() => { let con = true; kho?.bangBan?.().then((r) => { if (con) setBang(r); }); return () => { con = false; }; }, [kho]);
  const ds = THANH_TICH(), so = ds.filter((t) => t.dat(h)).length;
  return (
    <div className="grid gap-4">
      <DongMay may={may} />
      <div>
        <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-widest text-soft">{tr("Các kết cục", "Les fins", "Endings")} ({Object.keys(h.ket).length}/{Object.keys(KET_CUC).length})</p>
        <CacKetCuc ket={h.ket} />
      </div>
      <div>
        <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-soft"><Award size={14} /> {tr("Thành tích", "Succès", "Achievements")} ({so}/{ds.length})</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ds.map((t) => {
            const co = t.dat(h);
            return (
              <div key={t.ma} className={`flex items-center gap-2 rounded-2xl p-2 ${co ? "bg-orange-50 dark:bg-orange-950/40" : "bg-surface2"}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${co ? "bg-gradient-to-br from-amber-300 to-orange-500 text-[#5b3a06]" : "bg-surface text-soft"}`}>{co ? <t.Icon size={18} /> : <Lock size={14} />}</span>
                <span className="min-w-0"><b className="block text-xs leading-tight text-ink">{t.ten}</b><span className="block text-[11px] leading-tight text-soft">{t.mo}</span></span>
              </div>
            );
          })}
        </div>
      </div>
      {bang?.length > 1 && <div>
        <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-soft"><Users size={14} /> {tr("Bạn bè ở Paris", "Mes amis à Paris", "Friends in Paris")}</p>
        <div className="mt-2 grid gap-1.5">
          {bang.map((b) => (
            <div key={b.id} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink ${b.la_toi ? "bg-orange-50 dark:bg-orange-950/40" : "bg-surface2"}`}>
              <b className="w-5 text-center tabular-nums">{b.hang}</b><span className="min-w-0 flex-1 truncate font-bold">{b.name}</span>
              <span className="shrink-0 text-xs text-soft">{tr(`${b.so_ket}/5 kết cục · ${b.so_dat} trọn vẹn`, `${b.so_ket}/5 fins · ${b.so_dat} accomplies`, `${b.so_ket}/5 endings · ${b.so_dat} full`)}</span>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}
