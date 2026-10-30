import React, { useMemo, useState } from "react";
import { Map as IconBanDo, BookOpen, Images, Lock, ArrowLeft, MapPin, GraduationCap, Moon, Lamp, Wallet, TreePine, Crown, Flower2, Cherry, Fish, Salad, Grape, Music, Soup, Cake, Ship, Sparkles } from "lucide-react";
import { DIA_DIEM, ALBUM, THANH_NGU } from "../../../content/troChoi/parisKyUc.js";
import { tr } from "../../../shared/i18n.jsx";

/* Bản đồ, sổ tay, album « Một năm ở Paris » (31/10, giai đoạn 5). Mọi thứ suy ra từ ván chơi. */
const TEN_THANG = () => [tr("Tháng 9", "Septembre", "September"), tr("Tháng 10", "Octobre", "October"), tr("Tháng 11", "Novembre", "November"), tr("Tháng 12", "Décembre", "December"), tr("Tháng 1", "Janvier", "January"), tr("Tháng 2", "Février", "February"), tr("Tháng 3", "Mars", "March"), tr("Tháng 4", "Avril", "April"), tr("Tháng 5", "Mai", "May"), tr("Tháng 6", "Juin", "June"), tr("Tháng 7", "Juillet", "July"), tr("Tháng 8", "Août", "August")];
export const HINH = { mu: GraduationCap, dem: Moon, den: Lamp, vi: Wallet, thong: TreePine, vuong: Crown, hoa: Flower2, anhdao: Cherry, ca: Fish, banh: Salad, nho: Grape, nhac: Music, pho: Soup, banhkem: Cake, thuyen: Ship, phao: Sparkles };

/* Đèn thành phố: đặt cố định theo công thức để không nhảy chỗ giữa các lần vẽ. */
const DEN_PHO = Array.from({ length: 150 }, (_, k) => {
  const goc = k * 2.399963, r = Math.sqrt((k + 0.5) / 150);
  return { x: 50 + Math.cos(goc) * r * 38, y: 50 + Math.sin(goc) * r * 28, tre: (k * 0.37) % 4 };
});

function BanDoParis({ noi, cu, tenHoat }) {
  const sang = useMemo(() => new Set(noi.map((d) => d.id)), [noi]);
  const [chon, setChon] = useState(() => (noi.find((d) => !cu.includes(d.id)) ?? noi[noi.length - 1] ?? DIA_DIEM[0]).id);
  const d = DIA_DIEM.find((x) => x.id === chon), tile = sang.size / DIA_DIEM.length, soDen = Math.round(tile * DEN_PHO.length);
  return (
    <div>
      <div className="mcf-pl-dem relative mx-auto aspect-square w-full max-w-[28rem] overflow-hidden rounded-3xl">
        <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full">
          <defs><radialGradient id="mcfPlQuang"><stop offset="0" stopColor="#fde68a" stopOpacity=".75" /><stop offset="1" stopColor="#fbbf24" stopOpacity="0" /></radialGradient></defs>
          <ellipse cx="50" cy="50" rx="41" ry="31" fill="#111d3f" stroke="#64748b" strokeOpacity=".45" strokeWidth=".6" />
          <ellipse cx="14" cy="49" rx="6" ry="10" fill="#14342c" /><ellipse cx="86" cy="60" rx="6" ry="8" fill="#14342c" />
          <path d="M8 76C14 68 20 56 26 49c5-5 12-7 20-4 6 2 11 6 19 10 8 5 18 12 27 21" fill="none" stroke="#1e4e8c" strokeWidth="3.4" strokeLinecap="round" />
          <path className="mcf-pl-song" d="M8 76C14 68 20 56 26 49c5-5 12-7 20-4 6 2 11 6 19 10 8 5 18 12 27 21" fill="none" stroke="#7dd3fc" strokeOpacity=".55" strokeWidth=".7" strokeDasharray="3 5" strokeLinecap="round" />
          <ellipse cx="51.5" cy="47.5" rx="2.8" ry="1.1" transform="rotate(25 51.5 47.5)" fill="#111d3f" />
          {DEN_PHO.map((p, k) => <circle key={k} cx={p.x} cy={p.y} r=".42" fill={k < soDen ? "#fcd34d" : "#475569"} opacity={k < soDen ? 1 : 0.35} className={k < soDen ? "mcf-pl-sao" : undefined} style={k < soDen ? { animationDelay: `${p.tre}s` } : undefined} />)}
          {noi.map((p) => <circle key={p.id} cx={p.x} cy={p.y} r="9" fill="url(#mcfPlQuang)" className={cu.includes(p.id) ? undefined : "mcf-pl-bung"} style={{ transformOrigin: `${p.x}px ${p.y}px` }} />)}
          {sang.has("eiffel") && <path d="M29 42.5l.5 5 1.2 5.5h-3.4l1.2-5.5z" fill="#fde68a" />}
        </svg>
        {DIA_DIEM.map((p) => {
          const co = sang.has(p.id), dang = p.id === chon;
          return <button key={p.id} type="button" aria-label={co ? p.ten : tr("Nơi chưa tới", "Lieu inconnu", "Unknown place")} aria-pressed={dang} onClick={() => setChon(p.id)} style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className={`absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 ${dang ? "z-[2]" : ""}`}>
            <span className={`block rounded-full ${co ? "h-3 w-3 bg-amber-300 shadow-[0_0_10px_3px_rgba(252,211,77,.7)]" : "h-2 w-2 bg-slate-500"} ${dang ? "ring-2 ring-white ring-offset-2 ring-offset-[#0b1530]" : ""}`} />
          </button>;
        })}
        <p className="absolute left-3 top-3 m-0 rounded-full bg-black/40 px-3 py-1 text-xs font-extrabold tabular-nums text-amber-200">{tr(`${sang.size}/${DIA_DIEM.length} nơi sáng đèn`, `${sang.size}/${DIA_DIEM.length} lieux allumés`, `${sang.size}/${DIA_DIEM.length} places lit`)}</p>
      </div>
      <div key={chon} className="mcf-cau-vao mx-auto mt-3 flex max-w-[28rem] items-start gap-3 rounded-2xl bg-surface2 p-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${sang.has(chon) ? "bg-amber-400 text-[#2b2118]" : "bg-surface text-soft"}`}>{sang.has(chon) ? <MapPin size={18} /> : <Lock size={16} />}</span>
        {sang.has(chon)
          ? <div className="min-w-0"><b lang="fr" className="block text-sm text-ink">{d.ten}</b><p className="m-0 mt-0.5 text-sm text-soft">{d.ghi}</p></div>
          : <div className="min-w-0"><b className="block text-sm text-ink">{tr("Nơi này chưa sáng đèn", "Ce lieu reste à découvrir", "This place is still dark")}</b><p className="m-0 mt-0.5 text-sm text-soft">{d.hd === "*" ? tr("Cứ sống tiếp, mạch truyện sẽ đưa bạn tới.", "Continuez : l'histoire vous y mènera.", "Keep going: the story will take you there.") : tr(`Gợi ý: ${tenHoat(d.hd)}`, `Indice : ${tenHoat(d.hd)}`, `Hint: ${tenHoat(d.hd)}`)}</p></div>}
      </div>
    </div>
  );
}

function SoTay({ cau, ngu }) {
  const [loai, setLoai] = useState("cau");
  const ds = loai === "cau" ? cau : ngu.map((k) => THANH_NGU[k]);
  const Tab = ({ ma, children }) => <button type="button" aria-pressed={loai === ma} onClick={() => setLoai(ma)} className={`cursor-pointer rounded-full border-0 px-3 py-1 font-sans text-xs font-extrabold ${loai === ma ? "bg-[#92400e] text-white" : "bg-[#f3e4bf] text-[#7c2d12]"}`}>{children}</button>;
  return (
    <div className="mcf-pl-so rounded-2xl p-4 text-[#2b2118]">
      <div className="flex flex-wrap gap-2"><Tab ma="cau">{tr(`Câu hay (${cau.length})`, `Belles phrases (${cau.length})`, `Good lines (${cau.length})`)}</Tab><Tab ma="ngu">{tr(`Thành ngữ (${ngu.length})`, `Expressions (${ngu.length})`, `Idioms (${ngu.length})`)}</Tab></div>
      {!ds.length && <p className="m-0 mt-4 text-sm text-[#6b5435]">{loai === "cau" ? tr("Chưa có câu nào. Nói đúng sắc thái trong truyện, câu đó sẽ được chép vào đây.", "Rien pour l'instant. Chaque phrase bien choisie sera notée ici.", "Nothing yet. Each well-chosen line will be noted here.") : tr("Léon dạy thành ngữ vào những tuần yên ả.", "Léon enseigne les expressions pendant les semaines calmes.", "Léon teaches idioms during quiet weeks.")}</p>}
      <div className="no-scrollbar mt-3 max-h-96 overflow-y-auto">
        {ds.map((c, k) => <div key={c.fr} style={{ animationDelay: `${Math.min(k, 8) * 0.04}s` }} className="mcf-pl-the border-0 border-b border-dotted border-[#c9ad7a] py-2">
          <p lang="fr" className="m-0 font-serif text-base font-bold">{c.fr}</p>
          <p className="m-0 mt-0.5 text-xs leading-relaxed text-[#6b5435]">{c.vi}</p>
        </div>)}
      </div>
    </div>
  );
}

export function AnhKyNiem({ a, k = 0, nho }) {
  const Icon = HINH[a.hinh] ?? Sparkles;
  return (
    <figure style={{ "--xoay": `${[-2.5, 1.8, -1.2, 2.6, -1.8, 1.2][k % 6]}deg`, animationDelay: `${Math.min(k, 8) * 0.06}s` }} className="mcf-pl-anh m-0 bg-white p-2 pb-3 text-[#2b2118] shadow-[0_6px_18px_rgba(0,0,0,.25)]">
      <div className={`relative grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br ${a.nen} text-white`}>
        <span aria-hidden className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/15" />
        <span aria-hidden className="absolute -bottom-6 -left-4 h-16 w-16 rounded-full bg-black/10" />
        <Icon size={nho ? 28 : 38} strokeWidth={1.6} />
      </div>
      <figcaption className={nho ? "mt-1.5" : "mt-2"}>
        <b lang="fr" className="block font-serif text-sm leading-tight">{a.ten}</b>
        {!nho && <span className="mt-0.5 block text-xs leading-snug text-[#57473a]">{a.chu}</span>}
      </figcaption>
    </figure>
  );
}

function Album({ anh }) {
  const T = TEN_THANG(), co = new Set(anh.map((a) => a.id));
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ALBUM.map((a, k) => {
        const x = anh.find((y) => y.id === a.id);
        return co.has(a.id) ? <AnhKyNiem key={a.id} a={x} k={k} />
          : <div key={a.id} className="grid min-h-40 place-items-center rounded-lg border-2 border-dashed border-line bg-surface2 p-3 text-center text-soft"><span><Lock size={18} className="mx-auto block" /><span className="mt-1 block text-xs font-bold">{T[a.thang]}</span></span></div>;
      })}
    </div>
  );
}

const TAB = () => [["bando", IconBanDo, tr("Bản đồ", "Carte", "Map")], ["so", BookOpen, tr("Sổ tay", "Carnet", "Notebook")], ["album", Images, tr("Album", "Album", "Album")]];

export function NutKyUc({ moi, onMo }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {TAB().map(([ma, Icon, ten], j) => (
        <button key={ma} type="button" onClick={() => onMo(ma)} className="relative flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-0 bg-surface2 px-2 py-2.5 font-sans text-sm font-extrabold text-ink">
          <Icon size={16} className="shrink-0 text-orange-600" /><span className="truncate">{ten}</span>
          {moi[j] > 0 && <span className="mcf-pl-moi absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[11px] font-black tabular-nums text-white">{moi[j]}</span>}
        </button>
      ))}
    </div>
  );
}

export function KhoKyUc({ tab, cu, ky, ngu, tenHoat, onTab, onDong }) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onDong} className="inline-flex cursor-pointer items-center gap-1 rounded-full border-0 bg-surface2 px-3 py-1.5 font-sans text-xs font-extrabold text-ink"><ArrowLeft size={14} /> {tr("Về tuần này", "Retour", "Back")}</button>
        <div className="ml-auto flex gap-1">
          {TAB().map(([ma, Icon, ten]) => <button key={ma} type="button" aria-label={ten} aria-pressed={tab === ma} onClick={() => onTab(ma)} className={`grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 ${tab === ma ? "bg-orange-500 text-white" : "bg-surface2 text-ink"}`}><Icon size={16} /></button>)}
        </div>
      </div>
      {tab === "bando" && <BanDoParis noi={ky.noi} cu={cu} tenHoat={tenHoat} />}
      {tab === "so" && <SoTay cau={ky.cau} ngu={ngu} />}
      {tab === "album" && <Album anh={ky.anh} />}
    </div>
  );
}
