import React, { useMemo, useState } from "react";
import { ShoppingBasket, Gift, Mail, ArrowRight, Check, X, Wallet, Heart, PenLine } from "lucide-react";
import { NHAN_VAT } from "../../../content/troChoi/parisNhanh.js";
import { VIEC_THU } from "../../../content/troChoi/parisThang.js";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import { Leon } from "../../../shared/leon.jsx";
import { tron } from "../../../shared/troChoiNhanh.js";

/* Màn phụ trong tháng (31/10, giai đoạn 3). Tự giữ trạng thái, xong thì trả hệ quả cho MotNam. */
const NUT = "cursor-pointer rounded-full border-0 bg-orange-500 px-6 py-2.5 font-sans text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50";
const LoiNgan = ({ cam, children }) => (
  <div className="mcf-cau-vao flex items-start gap-3">
    <Leon cam={cam} size={56} className="shrink-0" />
    <p className="m-0 rounded-3xl rounded-tl-md bg-orange-50 px-4 py-3 text-sm leading-relaxed text-ink dark:bg-orange-950/40">{children}</p>
  </div>
);

export function ChoNoel({ d, onXong }) {
  const hang = useMemo(() => tron(d.hang), [d]);
  const [gio, setGio] = useState([]);
  const [xong, setXong] = useState(false);
  const tong = gio.reduce((n, x) => n + x.gia, 0), lo = tong > d.ngan;
  const hop = gio.filter((x) => x.cho);
  const bam = (x) => { if (xong) return; phat("bam"); setGio((g) => (g.includes(x) ? g.filter((y) => y !== x) : g.length < 3 ? [...g, x] : g)); };
  const tra = () => {
    const than = {}; hop.forEach((x) => { than[x.cho] = 1; });
    onXong({ tien: -tong, tt: hop.length * 5, than, phap: hop.length });
  };
  return (
    <div>
      <LoiNgan cam="nhay-mat">{d.loi}</LoiNgan>
      <div className="mt-3 rounded-2xl bg-[#fef3c7] p-3 text-[#2b2118]">
        {d.ghi.map((g) => <p key={g} lang="fr" className="m-0 text-sm font-bold">• {g}</p>)}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {hang.map((x, k) => {
          const co = gio.includes(x), dung = xong && x.cho, sai = xong && co && !x.cho;
          return (
            <button key={x.ten} type="button" aria-pressed={co} onClick={() => bam(x)} style={{ animationDelay: `${k * 0.05}s` }}
              className={`mcf-pl-the flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-solid p-3 text-left font-sans ${co ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40" : "border-line bg-surface"} ${dung ? "border-ok" : ""} ${sai ? "border-danger" : ""}`}>
              <Gift size={18} className="shrink-0 text-rose-500" />
              <span lang="fr" className="min-w-0 flex-1 text-sm font-bold text-ink">{x.ten}</span>
              <span className="shrink-0 text-sm font-black tabular-nums text-ink">{x.gia} €</span>
            </button>
          );
        })}
      </div>
      <p className={`m-0 mt-3 flex items-center gap-2 text-sm font-bold ${lo ? "text-danger" : "text-ink"}`}><ShoppingBasket size={16} /> {gio.length}/3 · {tong}/{d.ngan} € {lo && tr("(quá ngân sách)", "(budget dépassé)", "(over budget)")}</p>
      {xong && <p className="mcf-cau-vao m-0 mt-3 text-sm text-ink">{hop.length === 3 ? tr("Đúng cả ba! Ai cũng cảm động.", "Trois sur trois ! Tout le monde est touché.", "All three right! Everyone's touched.") : tr(`Đúng ${hop.length}/3 món. Khung xanh là món hợp với lời ghi chú.`, `${hop.length}/3 bons cadeaux. Le cadre vert montre les bons choix.`, `${hop.length}/3 right. Green frames show the good choices.`)}</p>}
      <div className="mt-4 text-right">
        {!xong ? <button type="button" disabled={gio.length < 3 || lo} onClick={() => { phat(hop.length === 3 ? "thang" : "nop"); setXong(true); }} className={NUT}>{tr("Mua quà", "Acheter", "Buy gifts")}</button>
          : <button type="button" onClick={tra} className={NUT}>{tr("Tiếp tục", "Continuer", "Continue")} <ArrowRight size={15} className="inline align-[-3px]" /></button>}
      </div>
    </div>
  );
}

/* Câu đầu thư đọc từ việc người chơi thật sự đã làm: kể sai thì mẹ biết ngay. */
const nhieuNhat = (ds) => {
  const dem = {}; ds.forEach((m) => { dem[m] = (dem[m] ?? 0) + 1; });
  const max = Math.max(0, ...Object.values(dem));
  return Object.keys(dem).filter((m) => dem[m] === max);
};
export function ThuNha({ d, hdThang, onXong }) {
  const cau = useMemo(() => d.cau.map((c) => {
    if (c.kieu !== "thuc") return { ...c, dung: [c.pa[0]], ds: tron(c.pa) };
    const dung = nhieuNhat(hdThang).map((m) => VIEC_THU[m]);
    const khac = Object.values(VIEC_THU).filter((v) => !dung.includes(v));
    return { ...c, dung, ds: tron([dung[0] ?? VIEC_THU.hoc, ...tron(khac).slice(0, 2)]), gt: tr("Câu này phải đúng với tháng vừa qua của bạn.", "Cette phrase doit raconter votre vrai mois.", "This must match your actual month.") };
  }), [d, hdThang]);
  const [chon, setChon] = useState({});
  const [gui, setGui] = useState(false);
  const dung = cau.filter((c, k) => c.dung.includes(chon[k])).length;
  const du = Object.keys(chon).length === cau.length;
  return (
    <div>
      <div className="mcf-pl-thu rounded-2xl bg-[#fdf6e3] p-4 text-[#1f2937] shadow-md">
        <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#92400e]"><Mail size={14} /> {tr(`Thư của ${d.tu}`, "Lettre de la maison", "A letter from home")}</p>
        <p className="m-0 mt-2 text-sm leading-relaxed">{d.van}</p>
      </div>
      <p className="m-0 mt-4 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-orange-600"><PenLine size={14} /> {tr("Viết thư trả lời", "Votre réponse", "Your reply")}</p>
      <div className="mt-2 grid gap-3">
        {cau.map((c, k) => (
          <div key={c.truoc} className="rounded-2xl bg-surface2 p-3">
            <p lang="fr" className="m-0 text-base text-ink">{c.truoc} <b className={`rounded px-1 ${!gui ? "text-orange-600" : c.dung.includes(chon[k]) ? "text-ok" : "text-danger"}`}>{chon[k] ?? "____"}</b> {c.sau}</p>
            {!gui && <div className="mt-2 flex flex-wrap gap-2">{c.ds.map((p) => <button key={p} type="button" lang="fr" aria-pressed={chon[k] === p} onClick={() => { phat("bam"); setChon((x) => ({ ...x, [k]: p })); }} className={`cursor-pointer rounded-full border-2 border-solid px-3 py-1 font-sans text-sm ${chon[k] === p ? "border-orange-500 bg-orange-100 text-[#7c2d12]" : "border-line bg-surface text-ink"}`}>{p}</button>)}</div>}
            {gui && <p className="mcf-cau-vao m-0 mt-1 flex items-start gap-1.5 text-xs text-soft">{c.dung.includes(chon[k]) ? <Check size={14} className="shrink-0 text-ok" /> : <X size={14} className="shrink-0 text-danger" />}{c.gt}</p>}
          </div>
        ))}
      </div>
      <div className="mt-4 text-right">
        {!gui ? <button type="button" disabled={!du} onClick={() => { phat(dung === cau.length ? "thang" : "nop"); setGui(true); }} className={NUT}>{tr("Gửi thư", "Envoyer", "Send")}</button>
          : <button type="button" onClick={() => onXong({ tt: dung * 5, phap: dung })} className={NUT}>{tr("Tiếp tục", "Continuer", "Continue")} <ArrowRight size={15} className="inline align-[-3px]" /></button>}
      </div>
    </div>
  );
}
