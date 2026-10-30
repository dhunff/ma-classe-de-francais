import React from "react";
import { Award, BadgeCheck, Feather, Trophy, Crown, Star, Handshake, EyeOff, GitFork, Lock, Users, CloudOff, KeyRound, BookLock } from "lucide-react";
import { VU_AN } from "../../../content/troChoi/thamTu.js";
import { tr } from "../../../shared/i18n.jsx";

/* Thành tích và bảng hạng (31/10, giai đoạn 6). Thành tích TÍNH từ tiến độ, không lưu riêng:
   hs = { id vụ: { diem, hang, ket[] } }, chon = { bruno, marcel }. */
const cuaMuc = (m) => VU_AN.filter((v) => v.muc === m && !v.mua).map((v) => v.id);
const MUA2 = VU_AN.filter((v) => v.mua === 2);
const hetMuc = (hs, m) => cuaMuc(m).every((id) => hs[id]);
export const THANH_TICH = () => [
  { ma: "dau", Icon: BadgeCheck, ten: tr("Vụ án đầu tiên", "Première affaire", "First case"), mo: tr("Phá một vụ bất kỳ", "Résoudre une affaire", "Solve any case"), dat: (hs) => Object.keys(hs).length > 0 },
  { ma: "de", Icon: Award, ten: tr("Trợ lý của Léon", "Assistant de Léon", "Léon's assistant"), mo: tr("Phá hết mức dễ", "Finir le niveau facile", "Finish easy"), dat: (hs) => hetMuc(hs, "de") },
  { ma: "vua", Icon: Feather, ten: tr("Dấu lông vũ", "La plume grise", "The grey feather"), mo: tr("Phá hết mức vừa", "Finir le niveau moyen", "Finish medium"), dat: (hs) => hetMuc(hs, "vua") },
  { ma: "kho", Icon: Trophy, ten: tr("Lật mặt P.G.", "P.G. démasqué", "P.G. unmasked"), mo: tr("Phá hết mức khó", "Finir le niveau difficile", "Finish hard"), dat: (hs) => hetMuc(hs, "kho") },
  { ma: "s3", Icon: Star, ten: tr("Tay nghề hạng S", "Talent de rang S", "S-rank talent"), mo: tr("Đạt hạng S ở 3 vụ", "Rang S sur 3 affaires", "S rank on 3 cases"), dat: (hs) => Object.values(hs).filter((x) => x.hang === "S").length >= 3 },
  { ma: "s9", Icon: Crown, ten: tr("Thám tử hoàn hảo", "Détective parfait", "Perfect detective"), mo: tr("Hạng S cả 9 vụ", "Rang S partout", "S rank on all 9"), dat: (hs) => VU_AN.filter((v) => !v.mua).every((v) => hs[v.id]?.hang === "S") },
  { ma: "bruno", Icon: Handshake, ten: tr("Bạn của Bruno", "L'ami de Bruno", "Bruno's friend"), mo: tr("Che chắn cho Bruno ở vụ 5", "Couvrir Bruno, affaire 5", "Cover for Bruno in case 5"), dat: (hs, c) => c.bruno === "giup" },
  { ma: "kin", Icon: EyeOff, ten: tr("Giữ kín như bưng", "Motus et bouche cousue", "Tight-lipped"), mo: tr("Giấu kế hoạch với Marcel", "Cacher le plan à Marcel", "Hide the plan from Marcel"), dat: (hs, c) => c.marcel === "giau" },
  { ma: "hai", Icon: GitFork, ten: tr("Cả hai kết cuộc", "Les deux fins", "Both endings"), mo: tr("Xem cả 2 kết của vụ 9", "Voir les 2 fins", "See both endings of case 9"), dat: (hs) => ["noi", "giau"].every((k) => hs.kiosque?.ket?.includes(k)) },
  { ma: "cle", Icon: KeyRound, ten: tr("Mở cánh cửa cuối", "La dernière porte", "The last door"), mo: tr("Lật mặt Le Serrurier", "Démasquer Le Serrurier", "Unmask Le Serrurier"), dat: (hs) => !!hs.editions },
  { ma: "m2", Icon: BookLock, ten: tr("Hết mùa hai", "Fin de la saison 2", "Season 2 complete"), mo: tr("Phá hết 6 vụ Mùa 2", "Résoudre les 6 affaires", "Solve all 6 cases"), dat: (hs) => MUA2.every((v) => hs[v.id]) },
];
export const thanhTichMoi = (truoc, sau, chon) => THANH_TICH().filter((t) => t.dat(sau, chon) && !t.dat(truoc, chon));

export default function HoSoThamTu({ hs, chon, bang, may }) {
  const ds = THANH_TICH(), so = ds.filter((t) => t.dat(hs, chon)).length;
  return (
    <div className="mt-6">
      {may === "loi" && <p className="m-0 mb-3 flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-xs text-[#fde68a]"><CloudOff size={14} className="shrink-0" />{tr("Chưa nối được máy chủ: tiến độ đang giữ trên máy này và sẽ tự gửi lại lần sau.", "Serveur injoignable : la progression reste sur cet appareil et sera renvoyée.", "Server unreachable: progress stays on this device and will be resent.")}</p>}
      <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#e7dcc8]"><Award size={14} /> {tr("Thành tích", "Succès", "Achievements")} ({so}/{ds.length})</p>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {ds.map((t) => {
          const co = t.dat(hs, chon);
          return (
            <div key={t.ma} title={t.mo} className={`flex flex-col items-center gap-1 rounded-2xl p-2 text-center ${co ? "bg-black/30" : "bg-black/15"}`}>
              <span className={`grid h-10 w-10 place-items-center rounded-full ${co ? "mcf-tt-huy bg-gradient-to-br from-yellow-300 to-amber-500 text-[#5b3a06]" : "bg-white/10 text-white/30"}`}>{co ? <t.Icon size={20} /> : <Lock size={15} />}</span>
              <span className={`text-[10px] font-bold leading-tight ${co ? "text-[#fef3c7]" : "text-white/55"}`}>{t.ten}</span>
              <span className="text-[9px] leading-tight text-white/55">{t.mo}</span>
            </div>
          );
        })}
      </div>
      {bang !== undefined && (
        <div className="mt-5">
          <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#e7dcc8]"><Users size={14} /> {tr("Bảng hạng thám tử", "Classement", "Detective ranking")}</p>
          {bang === null
            ? <p className="m-0 mt-2 text-sm text-[#e7dcc8]">{tr("Chưa đọc được bảng hạng.", "Classement indisponible.", "Ranking unavailable.")}</p>
            : <ol className="m-0 mt-2 grid list-none gap-1.5 p-0">
                {bang.map((n) => (
                  <li key={n.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${n.la_toi ? "bg-amber-300 text-[#2b2118]" : "bg-black/25 text-[#fef3c7]"}`}>
                    <span className="w-5 text-center font-black tabular-nums">{n.hang}</span>
                    <span className="min-w-0 flex-1 truncate font-bold">{n.name}</span>
                    <span className="text-xs tabular-nums">{tr(`${n.so_vu} vụ · ${n.so_s} S`, `${n.so_vu} affaires · ${n.so_s} S`, `${n.so_vu} cases · ${n.so_s} S`)}</span>
                    <span className="w-14 text-right font-black tabular-nums">{n.diem}</span>
                  </li>
                ))}
              </ol>}
          {bang?.length === 1 && <p className="m-0 mt-2 text-xs text-[#e7dcc8]">{tr("Theo dõi bạn bè để so điểm phá án với họ.", "Suivez vos amis pour comparer vos scores.", "Follow friends to compare scores.")}</p>}
        </div>
      )}
    </div>
  );
}
