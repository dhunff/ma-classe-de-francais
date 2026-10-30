import React, { useEffect, useMemo, useState } from "react";
import { GraduationCap, BriefcaseBusiness, Users, Compass, BedDouble, Wallet, BatteryMedium, Heart, Languages, MapPin, UserRound, Thermometer, ArrowRight, Sparkles, Save, RotateCcw, CalendarDays, Check, Contact } from "lucide-react";
import { CHUONG } from "../../../content/troChoi/phieuLuu.js";
import { NHAN_VAT, NHANH } from "../../../content/troChoi/parisNhanh.js";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import { Leon } from "../../../shared/leon.jsx";
import { tron } from "../../../shared/troChoiNhanh.js";
import CauTracNghiem from "../CauTracNghiem.jsx";
import { HIEU_UNG, batDau, chuanHoa, chonCanh, sauCau, sauNhanh, hopGiong, THAN_MAX, cong, hetThang, hetNam, quaTuan, dungOm, tinhThang, sangThang, danhXung } from "./luat.js";

/* « Một năm ở Paris » (31/10, giai đoạn 1). Lịch 12 tháng thay cho chín chương rời. Cảnh đối thoại lấy
   nguyên từ phieuLuu.js theo thứ tự truyện. Ván chơi giữ ở trình duyệt, điểm thật ghi qua ghi_tro_choi
   mỗi khi người chơi lưu. Từ giai đoạn 2 cảnh đi theo hoạt động đã chọn, xen cảnh rẽ nhánh ở parisNhanh.js. */
const KHOA = "mcf-mot-nam-v1";
const KHOA_CU = "mcf-phieu-luu-v1";
const docVan = () => { try { return chuanHoa(JSON.parse(localStorage.getItem(KHOA))); } catch { return null; } };
const ghiVan = (s) => { try { if (s) localStorage.setItem(KHOA, JSON.stringify(s)); else localStorage.removeItem(KHOA); } catch { /* chế độ riêng tư: bỏ qua */ } };
const thuongCu = () => { try { return Object.keys(JSON.parse(localStorage.getItem(KHOA_CU)) || {}).length * 50; } catch { return 0; } };

const CANH = CHUONG.flatMap((c) => c.canh.map((x, k) => ({ ...x, ch: c, dau: k === 0, cuoi: k === c.canh.length - 1 })));

const THANG = () => [
  ["Septembre", tr("Tháng 9", "Septembre", "September"), "from-amber-500 to-orange-600"],
  ["Octobre", tr("Tháng 10", "Octobre", "October"), "from-orange-500 to-red-600"],
  ["Novembre", tr("Tháng 11", "Novembre", "November"), "from-stone-500 to-amber-800"],
  ["Décembre", tr("Tháng 12", "Décembre", "December"), "from-sky-600 to-indigo-700"],
  ["Janvier", tr("Tháng 1", "Janvier", "January"), "from-slate-500 to-sky-800"],
  ["Février", tr("Tháng 2", "Février", "February"), "from-indigo-500 to-slate-700"],
  ["Mars", tr("Tháng 3", "Mars", "March"), "from-teal-500 to-emerald-700"],
  ["Avril", tr("Tháng 4", "Avril", "April"), "from-emerald-500 to-lime-700"],
  ["Mai", tr("Tháng 5", "Mai", "May"), "from-pink-500 to-rose-600"],
  ["Juin", tr("Tháng 6", "Juin", "June"), "from-yellow-500 to-orange-600"],
  ["Juillet", tr("Tháng 7", "Juillet", "July"), "from-sky-500 to-red-600"],
  ["Août", tr("Tháng 8", "Août", "August"), "from-orange-400 to-rose-600"],
];
const HOAT = () => [
  { ma: "hoc", Icon: GraduationCap, ten: tr("Đi học", "Aller en cours", "Go to class"), nen: "from-sky-500 to-blue-600" },
  { ma: "lam", Icon: BriefcaseBusiness, ten: tr("Làm thêm", "Petit boulot", "Part-time job"), nen: "from-amber-500 to-orange-600" },
  { ma: "ban", Icon: Users, ten: tr("Gặp bạn bè", "Voir des amis", "See friends"), nen: "from-pink-500 to-rose-600" },
  { ma: "kham", Icon: Compass, ten: tr("Khám phá Paris", "Explorer Paris", "Explore Paris"), nen: "from-emerald-500 to-teal-600" },
  { ma: "nghi", Icon: BedDouble, ten: tr("Nghỉ ngơi", "Se reposer", "Rest"), nen: "from-indigo-500 to-violet-600" },
];
const CHI_SO = () => ({
  tien: [Wallet, tr("Tiền", "Argent", "Money"), "€"],
  nl: [BatteryMedium, tr("Sức", "Énergie", "Energy"), ""],
  tt: [Heart, tr("Tinh thần", "Moral", "Mood"), ""],
  phap: [Languages, tr("Tiếng Pháp", "Français", "French"), ""],
});
const DANH = () => [tr("Mới sang", "Nouveau venu", "Newcomer"), tr("Quen đường", "Habitué", "Getting around"), tr("Tự tin", "À l'aise", "Confident"), tr("Như người Paris", "Vrai Parisien", "True Parisian")];

const LoiLeon = ({ cam, children }) => (
  <div className="mcf-cau-vao mt-4 flex items-start gap-3">
    <Leon cam={cam} size={56} className="shrink-0" />
    <p className="m-0 rounded-3xl rounded-tl-md bg-orange-50 px-4 py-3 text-sm leading-relaxed text-ink dark:bg-orange-950/40">{children}</p>
  </div>
);
const Nut = ({ onClick, children, phu }) => (
  <button type="button" onClick={onClick} className={`cursor-pointer rounded-full border-0 px-6 py-2.5 font-sans text-sm font-extrabold ${phu ? "bg-surface2 text-ink" : "bg-orange-500 text-white"}`}>{children}</button>
);
const Chip = ({ ma, v }) => {
  const [Icon, , duoi] = CHI_SO()[ma];
  return <span className={`inline-flex items-center gap-0.5 rounded-full bg-black/20 px-1.5 py-0.5 text-[11px] font-bold tabular-nums`}><Icon size={11} />{v > 0 ? "+" : "−"}{Math.abs(v)}{duoi}</span>;
};

const TimThan = ({ v }) => <span className="flex gap-0.5" role="img" aria-label={`${v}/${THAN_MAX}`}>{Array.from({ length: THAN_MAX }, (_, k) => <Heart key={k} size={12} className={k < v ? "fill-rose-500 text-rose-500" : "text-line"} />)}</span>;

/* Người quen: chỉ hiện người đã gặp. */
function NguoiQuen({ s }) {
  const ds = Object.keys(NHAN_VAT).filter((m) => s.than[m] != null);
  if (!ds.length) return null;
  return (
    <div className="mt-5">
      <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-soft"><Contact size={14} /> {tr("Người quen ở Paris", "Mes proches à Paris", "People you know")}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ds.map((m) => <div key={m} className="flex items-center gap-2 rounded-2xl bg-surface2 p-2">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${NHAN_VAT[m].nen} text-white`}><UserRound size={18} /></span>
          <span className="min-w-0"><b lang="fr" className="block truncate text-sm text-ink">{NHAN_VAT[m].ten}</b><TimThan v={s.than[m]} /></span>
        </div>)}
      </div>
    </div>
  );
}

function DauMan({ s }) {
  const T = THANG()[s.thang], C = CHI_SO();
  const Thanh = ({ ma }) => {
    const [Icon, ten] = C[ma], v = s[ma], thap = v <= 20;
    return (
      <div className="min-w-0">
        <p className="m-0 flex items-center gap-1 text-[11px] font-bold text-white/90"><Icon size={13} /> {ten}<span className="ml-auto tabular-nums">{v}</span></p>
        <span className="mt-1 block h-2 overflow-hidden rounded-full bg-black/25"><span className={`block h-full rounded-full transition-[width] duration-700 ${thap ? "bg-red-300" : "bg-white"}`} style={{ width: `${v}%` }} /></span>
      </div>
    );
  };
  return (
    <div key={s.thang} className={`mcf-pl-thang bg-gradient-to-br ${T[2]} p-5 text-white`}>
      <div className="flex items-center gap-4">
        <div className="mcf-pl-to shrink-0 overflow-hidden rounded-xl bg-white text-center text-[#2b2118] shadow-lg">
          <p className="m-0 bg-red-600 px-3 py-0.5 text-[10px] font-black uppercase text-white">{T[1]}</p>
          <p className="m-0 px-3 py-0.5 text-2xl font-black tabular-nums">{s.tuan + 1}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p lang="fr" className="m-0 text-xl font-black leading-tight">{T[0]}</p>
          <p className="m-0 text-xs font-bold text-white/85">{tr(`Tuần ${s.tuan + 1}/4 · Tháng ${s.thang + 1}/12`, `Semaine ${s.tuan + 1}/4 · Mois ${s.thang + 1}/12`, `Week ${s.tuan + 1}/4 · Month ${s.thang + 1}/12`)} · {DANH()[danhXung(s.phap)]}</p>
        </div>
        <p className="m-0 flex items-center gap-1 rounded-full bg-black/25 px-3 py-1 text-sm font-black tabular-nums"><Wallet size={15} /> {s.tien} €</p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3"><Thanh ma="nl" /><Thanh ma="tt" /><Thanh ma="phap" /></div>
    </div>
  );
}

export default function MotNam({ onXong }) {
  const [s, setS] = useState(docVan);
  const [buoc, setBuoc] = useState("lich");     // lich | canh | yen | thang | het
  const [k, setK] = useState(null);             // chỉ số cảnh đang chơi
  const [chon, setChon] = useState(null);
  const [bo, setBo] = useState(null);
  const [nh, setNh] = useState(null);           // cảnh rẽ nhánh đang chơi
  const [lc, setLc] = useState(null);           // lựa chọn vừa bấm
  const nhanhXao = useMemo(() => (nh ? tron(nh.lua) : []), [nh]);
  const thuong = useMemo(thuongCu, []);
  useEffect(() => { ghiVan(s); }, [s]);

  if (!s) return (
    <div className="mt-6 overflow-hidden rounded-[2rem] bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white">
        <p className="m-0 text-xs font-extrabold uppercase tracking-widest text-white/85">{tr("Bắt đầu năm du học", "Début de l'année", "Start your year")}</p>
        <p className="m-0 mt-1 text-2xl font-black" lang="fr">Une année à Paris</p>
      </div>
      <div className="p-5">
        <LoiLeon cam="chao">{tr("Chào bạn! Ta là Léon. Mười hai tháng tới, mỗi tuần bạn tự chọn đi học, làm thêm, gặp bạn hay khám phá Paris. Nhớ giữ tiền, sức khoẻ và tinh thần nhé. Cuối mỗi tháng phải trả tiền nhà đấy!", "Salut ! Moi, c'est Léon. Pendant douze mois, chaque semaine, tu choisis : cours, travail, amis ou découverte de Paris. Garde de l'argent, de l'énergie et du moral. Le loyer tombe chaque fin de mois !", "Hi! I'm Léon. For twelve months, each week you choose: class, work, friends or exploring Paris. Watch your money, energy and mood. Rent is due every month!")}</LoiLeon>
        {thuong > 0 && <p className="m-0 mt-3 flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-2 text-sm font-bold text-ink dark:bg-orange-950/40"><Sparkles size={16} className="shrink-0 text-orange-500" />{tr(`Thưởng từ các chương đã qua: +${thuong} € khởi đầu`, `Bonus des chapitres déjà faits : +${thuong} €`, `Bonus from past chapters: +${thuong} €`)}</p>}
        <p className="m-0 mt-5 text-sm font-bold text-soft">{tr("Bạn là ai?", "Qui êtes-vous ?", "Who are you?")}</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {[["nu", tr("Một bạn nữ", "Une étudiante", "A female student"), "from-pink-500 to-rose-600"], ["nam", tr("Một bạn nam", "Un étudiant", "A male student"), "from-sky-500 to-blue-600"]].map(([g, ten, nen]) => (
            <button key={g} type="button" onClick={() => { phat("batDau"); setS(batDau(g, thuong)); setBuoc("lich"); }} className={`mcf-tt-la flex cursor-pointer items-center gap-3 rounded-2xl border-0 bg-gradient-to-br ${nen} p-4 text-left font-sans text-white`}>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white/25"><UserRound size={24} /></span><span className="text-base font-extrabold">{ten}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const khung = (con) => <div className="mt-6 overflow-hidden rounded-[2rem] bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.06)]"><DauMan s={s} /><div className="p-5">{con}</div></div>;
  const quaTuanMoi = (x) => { if (hetThang(x)) { setS(x); setBuoc("thang"); } else { setS(quaTuan(x)); setBuoc("lich"); } };
  const luuDiem = (x) => { const r = { diem: x.diem, dung: x.dung, tong: Math.max(1, x.tong) }, sau = { ...x, diem: 0, dung: 0, tong: 0 }; ghiVan(sau); setS(sau); onXong(r); };   // ghi ngay: onXong gỡ màn này trước khi effect kịp chạy

  if (buoc === "lich") {
    if (s.om) return khung(<>
      <LoiLeon cam="buon">{tr("Bạn kiệt sức nên bị ốm cả tuần rồi. Nằm nghỉ đi, ta mang soupe sang cho.", "Tu es épuisé·e, te voilà malade pour la semaine. Repose-toi, je t'apporte une soupe.", "You're worn out and ill this week. Rest, I'll bring soup.")}</LoiLeon>
      <div className="mt-4 text-right"><Nut onClick={() => { phat("lat"); quaTuanMoi(dungOm(s)); }}><Thermometer size={15} className="mr-1 inline align-[-3px]" />{tr("Nghỉ hết tuần", "Se soigner", "Recover")}</Nut></div>
    </>);
    const chonHoat = (ma) => {
      phat("lat");
      const x = cong(s, HIEU_UNG[ma]), c = ma === "nghi" ? null : chonCanh(x, ma, CANH, NHANH);
      setS(x); setChon(null); setBo(null); setLc(null);
      if (!c) { setBuoc("yen"); return; }
      if (c.nhanh) { setNh(c.nhanh); setBuoc("nhanh"); return; }
      setK(c.truyen); setBuoc("canh");
    };
    return khung(<>
      <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-orange-600"><CalendarDays size={14} /> {tr("Tuần này bạn định làm gì?", "Que faire cette semaine ?", "What's the plan this week?")}</p>
      {s.buocLam && <p className="m-0 mt-2 rounded-2xl bg-orange-50 px-4 py-2 text-sm text-ink dark:bg-orange-950/40">{tr("Bạn đang nợ Léon tiền nhà, tuần này phải đi làm.", "Tu dois le loyer à Léon : cette semaine, au travail.", "You owe Léon the rent: work this week.")}</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {HOAT().map((h, j) => {
          const khoa = s.buocLam && h.ma !== "lam";
          return (
            <button key={h.ma} type="button" disabled={khoa} onClick={() => chonHoat(h.ma)} style={{ animationDelay: `${j * 0.06}s` }} className={`mcf-pl-the mcf-tt-la cursor-pointer rounded-2xl border-0 bg-gradient-to-br ${h.nen} p-3 text-left font-sans text-white disabled:cursor-not-allowed disabled:opacity-40`}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20"><h.Icon size={21} /></span>
              <span className="mt-2 block text-sm font-extrabold">{h.ten}</span>
              <span className="mt-1.5 flex flex-wrap gap-1">{Object.entries(HIEU_UNG[h.ma]).map(([m, v]) => <Chip key={m} ma={m} v={v} />)}</span>
            </button>
          );
        })}
      </div>
      <NguoiQuen s={s} />
    </>);
  }

  if (buoc === "nhanh") {
    const nv = nh.ai ? NHAN_VAT[nh.ai] : null, ten = nv?.ten ?? nh.nguoi;
    const bam = (l) => { if (lc) return; setLc(l); phat(l.tot ? "dung" : "sai"); };
    return khung(<>
      <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-600"><MapPin size={13} /><span lang="fr">{nh.noi}</span></p>
      <p className="m-0 mt-1 text-sm text-soft">{nh.tinh}</p>
      <div className="mcf-cau-vao mt-4 flex items-start gap-3">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${nv?.nen ?? "from-stone-400 to-stone-600"} text-white`} aria-hidden><UserRound size={24} /></span>
        <div>
          <p className="m-0 flex items-center gap-2 text-xs font-bold text-soft"><span lang="fr">{ten}</span>{nh.ai && <TimThan v={s.than[nh.ai] ?? 0} />}</p>
          <p lang="fr" className="m-0 mt-1 rounded-3xl rounded-tl-md bg-surface2 px-4 py-3 text-base text-ink">{nh.noi_}</p>
        </div>
      </div>
      {!lc && <div className="mt-4 flex flex-col items-end gap-2.5">
        {nhanhXao.map((l) => <button key={l.c} type="button" lang="fr" onClick={() => bam(l)} className="max-w-[90%] cursor-pointer rounded-3xl rounded-br-md border-2 border-solid border-orange-300 bg-surface px-4 py-2.5 text-left font-sans text-base text-ink">{hopGiong(l.c, s.gioi)}</button>)}
      </div>}
      {lc && <>
        <p lang="fr" className="mcf-cau-vao m-0 ml-auto mt-4 w-fit max-w-[90%] rounded-3xl rounded-br-md bg-orange-500 px-4 py-2.5 text-base text-white">{hopGiong(lc.c, s.gioi)}</p>
        <div className="mcf-cau-vao mt-3 flex items-start gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${nv?.nen ?? "from-stone-400 to-stone-600"} text-white`} aria-hidden><UserRound size={20} /></span>
          <p lang="fr" className="m-0 rounded-3xl rounded-tl-md bg-surface2 px-4 py-2.5 text-base text-ink">{lc.dap}</p>
        </div>
        <LoiLeon cam={lc.tot ? "duoc-do" : "hum"}>{lc.ghi}</LoiLeon>
        <p className="mcf-dong m-0 mt-3 flex w-fit flex-wrap items-center gap-1.5 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 px-3 py-1.5 text-white">
          {Object.entries(lc.kq).filter(([m, v]) => m !== "co" && m !== "than" && v).map(([m, v]) => <Chip key={m} ma={m} v={v} />)}
          {nh.ai && lc.kq.than ? <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-1.5 py-0.5 text-[11px] font-bold"><Heart size={11} className="fill-rose-400 text-rose-400" />{lc.kq.than > 0 ? "+" : "−"}{Math.abs(lc.kq.than)} {ten}</span> : null}
          {lc.kq.co ? <span className="text-[11px] font-bold">{tr("Chuyện này chưa kết thúc…", "Cette histoire n'est pas finie…", "This isn't over…")}</span> : null}
        </p>
        <div className="mt-4 text-right"><Nut onClick={() => { const x = sauNhanh(s, nh, lc); setNh(null); setLc(null); quaTuanMoi(x); }}>{tr("Tiếp tục", "Continuer", "Continue")} <ArrowRight size={15} className="inline align-[-3px]" /></Nut></div>
      </>}
    </>);
  }

  if (buoc === "yen") return khung(<>
    <LoiLeon cam="mim-cuoi">{tr("Một tuần yên ả ở Paris. Không có chuyện gì đặc biệt, và thế cũng tốt.", "Une semaine tranquille à Paris. Rien de spécial, et c'est très bien.", "A quiet week in Paris. Nothing special, and that's fine.")}</LoiLeon>
    <div className="mt-4 text-right"><Nut onClick={() => quaTuanMoi(s)}>{tr("Tuần sau", "Semaine suivante", "Next week")} <ArrowRight size={15} className="inline align-[-3px]" /></Nut></div>
  </>);

  if (buoc === "canh") {
    const c = CANH[k];
    const tra = (j) => { if (chon != null) return; setChon(j); phat(j === 0 ? "dung" : "sai"); };
    const nhac = () => { setBo(tron([1, 2, 3].filter((j) => j < c.pa.length)).slice(0, 2)); setS((x) => cong(x, { tt: -3 })); phat("bam"); };
    const tiep = () => { setChon(null); setBo(null); quaTuanMoi(sauCau(s, k, chon === 0)); };
    return khung(<>
      {c.dau && <LoiLeon cam="nhay-mat">{c.ch.mo}</LoiLeon>}
      <p className="m-0 mt-3 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-600"><MapPin size={13} /><span lang="fr">{c.noi}</span></p>
      <p className="m-0 mt-1 text-sm text-soft">{c.tinh}</p>
      <div className="mcf-cau-vao mt-4 flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface2 text-soft" aria-hidden><UserRound size={24} /></span>
        <div>
          <p className="m-0 text-xs font-bold text-soft" lang="fr">{c.ai}</p>
          <p lang="fr" className="m-0 mt-1 rounded-3xl rounded-tl-md bg-surface2 px-4 py-3 text-base text-ink">{c.noi_}</p>
        </div>
      </div>
      <CauTracNghiem key={k} pa={c.pa} onTra={tra} daChon={chon} laPhap kieu="thoai" bo={bo} />
      {chon == null && !bo && <button type="button" onClick={nhac} className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-solid border-orange-300 bg-surface px-3 py-1.5 font-sans text-xs font-bold text-ink"><Leon cam="nhay-mat" size={22} /> {tr("Léon nhắc nhỏ (−3 tinh thần)", "Léon souffle (−3 moral)", "Léon whispers (−3 mood)")}</button>}
      {chon != null && <>
        <div className="mcf-cau-vao mt-4 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface2 text-soft" aria-hidden><UserRound size={20} /></span>
          <p lang="fr" className="m-0 rounded-3xl rounded-tl-md bg-surface2 px-4 py-2.5 text-base text-ink">{chon === 0 ? c.dap : "… Pardon ?"}</p>
        </div>
        <LoiLeon cam={chon === 0 ? "duoc-do" : "hum"}>{chon === 0 ? tr("Chuẩn luôn! ", "Parfait ! ", "Spot on! ") : <>{tr("Câu hợp hơn là: ", "Il valait mieux dire : ", "Better to say: ")}<strong lang="fr">{c.pa[0]}</strong>. </>}{c.gt}</LoiLeon>
        {chon === 0 && c.cuoi && <LoiLeon cam="yeu-qua">{c.ch.ket}</LoiLeon>}
        <div className="mt-4 text-right"><Nut onClick={tiep}>{tr("Tiếp tục", "Continuer", "Continue")} <ArrowRight size={15} className="inline align-[-3px]" /></Nut></div>
      </>}
    </>);
  }

  if (buoc === "thang") {
    const t = tinhThang(s), cuoi = hetNam(s), sau = THANG()[Math.min(11, s.thang + 1)][1];
    const tiepThang = () => { phat("tiep"); if (cuoi) setBuoc("het"); else { setS(sangThang(s)); setBuoc("lich"); } };
    return khung(<>
      <p className="m-0 text-xs font-extrabold uppercase tracking-widest text-orange-600">{tr("Tổng kết tháng", "Bilan du mois", "Month review")}</p>
      <div className="mt-3 grid gap-1.5 rounded-2xl bg-surface2 p-4 text-sm text-ink">
        <p className="m-0 flex justify-between"><span>{tr("Tiền đang có", "Argent", "Money")}</span><b className="tabular-nums">{s.tien} €</b></p>
        <p className="m-0 flex justify-between"><span>{tr("Học bổng", "Bourse", "Grant")}</span><b className="tabular-nums text-ok">+{t.thu} €</b></p>
        <p className="m-0 flex justify-between"><span>{tr("Tiền nhà", "Loyer", "Rent")}</span><b className="tabular-nums text-danger">−{t.chi} €</b></p>
        <p className="m-0 flex justify-between border-0 border-t border-solid border-line pt-1.5"><span>{tr("Còn lại", "Reste", "Left")}</span><b className="tabular-nums">{t.con} €</b></p>
      </div>
      <LoiLeon cam={t.vay ? "hum" : "duoc-do"}>{t.vay ? tr("Thiếu tiền nhà rồi! Lần này ta cho vay, nhưng tuần đầu tháng sau bạn phải đi làm nhé.", "Il manque de quoi payer le loyer ! Je te prête, mais au travail la première semaine.", "You're short on rent! I'll lend you this time, but you work first week next month.") : tr("Một tháng nữa trôi qua êm đẹp. Paris bắt đầu quen với bạn rồi.", "Encore un mois de passé. Paris s'habitue à toi.", "Another month gone. Paris is getting used to you.")}</LoiLeon>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {s.tong > 0 && !cuoi && <Nut phu onClick={() => { const x = sangThang(s); setBuoc("lich"); luuDiem(x); }}><Save size={14} className="mr-1 inline align-[-2px]" />{tr("Lưu điểm và nghỉ", "Enregistrer et s'arrêter", "Save and stop")}</Nut>}
        <Nut onClick={tiepThang}>{cuoi ? tr("Kết thúc năm", "Fin de l'année", "End the year") : sau} <ArrowRight size={15} className="inline align-[-3px]" /></Nut>
      </div>
    </>);
  }

  /* het: tổng kết tạm, kết cục riêng làm ở giai đoạn 5. */
  return khung(<>
    <LoiLeon cam="yeu-qua">{tr(`Một năm đã qua! Từ người mới sang, giờ bạn là « ${DANH()[danhXung(s.phap)]} ». Paris sẽ nhớ bạn lắm.`, `Une année déjà ! Te voilà « ${DANH()[danhXung(s.phap)]} ». Paris se souviendra de toi.`, `A whole year! You're now “${DANH()[danhXung(s.phap)]}”. Paris will miss you.`)}</LoiLeon>
    <p className="mcf-dong mx-auto mt-4 flex w-fit items-center gap-2 rounded-md border-4 border-double border-orange-500 px-3 py-1 text-sm font-black uppercase tracking-widest text-orange-600"><Check size={15} /> {tr("Hoàn thành năm", "Année terminée", "Year complete")}</p>
    <div className="mt-5 flex flex-wrap justify-end gap-2">
      <Nut phu onClick={() => { setS(null); setBuoc("lich"); }}><RotateCcw size={14} className="mr-1 inline align-[-2px]" />{tr("Sống lại một năm", "Revivre l'année", "Live it again")}</Nut>
      <Nut onClick={() => { const r = { diem: s.diem, dung: s.dung, tong: Math.max(1, s.tong) }; ghiVan(null); setS(null); setBuoc("lich"); onXong(r); }}>{tr("Lưu điểm", "Enregistrer", "Save score")} <ArrowRight size={15} className="inline align-[-3px]" /></Nut>
    </div>
  </>);
}
