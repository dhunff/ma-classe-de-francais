import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Mail, ConciergeBell, Warehouse, BookOpenText, Palette, MessagesSquare, Phone, Lock, Check, ArrowRight, Hourglass, MoonStar, Gavel, Search, Link2, UserRound, MessageCircle, Pin, Scale } from "lucide-react";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import { Leon, leonVai } from "../../../shared/leon.jsx";
import CauTracNghiem from "../CauTracNghiem.jsx";

/* Vòng chơi theo sơ đồ (31/10, giai đoạn 4): BanDo → ThamVan → BangGhim → ChonBangChung.
   Mỗi màn tự giữ trạng thái của nó, ThamTu chỉ giữ thứ sống qua cả vụ. */
const ICON = { thu: Mail, quay: ConciergeBell, kho: Warehouse, so: BookOpenText, xuong: Palette, hoi: MessagesSquare, goi: Phone };

const LoiNgan = ({ cam = "lam-viec", children }) => (
  <div className="mcf-cau-vao mt-4 flex items-start gap-3">
    <Leon cam={leonVai("tham-tu", cam)} size={56} className="shrink-0" />
    <p className="m-0 rounded-3xl rounded-tl-md bg-[#fef3c7] px-4 py-3 text-sm leading-relaxed text-[#2b2118]">{children}</p>
  </div>
);
const NUT = "cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118] disabled:cursor-not-allowed disabled:opacity-50";

export function BanDo({ vu, hud, daDen, khoa, vatChung, onDi, onMoKhoa, onGhim }) {
  const [ch, setCh] = useState(null);
  const [di, setDi] = useState(null);
  const hen = useRef(null);
  useEffect(() => () => clearTimeout(hen.current), []);
  const lui = daDen.map((k) => vu.canh[k]);
  const cuoi = lui[lui.length - 1];
  const dang = di != null ? vu.canh[di] : cuoi;
  const chuaDen = vu.canh.length - daDen.length;
  const hetGio = hud.gio <= 0 || chuaDen === 0;
  const diem = [{ x: vu.ban.dau[0], y: vu.ban.dau[1] }, ...lui, ...(di != null ? [vu.canh[di]] : [])];
  const c = ch != null ? vu.canh[ch] : null;
  const lyDo = (k) => {
    if (daDen.includes(k)) return tr("Đã đến", "Déjà visité", "Already visited");
    if (khoa === k) return tr("P.G. đã khoá chỗ này", "P.G. a verrouillé ce lieu", "P.G. locked this place");
    if (vu.canh[k].dong && hud.gio < vu.canh[k].dong) return tr("Đã đóng cửa", "Fermé", "Closed");
    return null;
  };
  const dinoi = (k) => {
    phat("tiep"); setDi(k); setCh(null);
    hen.current = setTimeout(() => onDi(k), 750);
  };
  return (
    <div className="mcf-cau-vao mt-4">
      <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#0b1d33]/85 px-3 py-1 text-[11px] font-bold text-sky-100"><Hourglass size={13} /> {tr(`Còn ${hud.gio} giờ, ${chuaDen} nơi chưa đến`, `${hud.gio} h, ${chuaDen} lieux restants`, `${hud.gio} h left, ${chuaDen} places left`)}</span>
      <div className="mcf-tt-bando relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:aspect-[16/9]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
          {diem.slice(1).map((d, k) => <line key={k} x1={diem[k].x} y1={diem[k].y} x2={d.x} y2={d.y} vectorEffect="non-scaling-stroke" className="mcf-tt-tuyen" />)}
        </svg>
        {vu.canh.map((n, k) => {
          const Icon = ICON[n.icon] ?? Search, den = daDen.includes(k), bi = khoa === k, dong = !den && n.dong && hud.gio < n.dong;
          return (
            <button key={n.ma} type="button" disabled={di != null || hetGio} onClick={() => { phat("bam"); setCh(k); }} aria-label={n.ten} aria-pressed={ch === k}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              className={`mcf-tt-diem absolute flex w-[92px] -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center gap-1 border-0 bg-transparent p-0 font-sans text-white disabled:cursor-default sm:w-[120px] ${den || dong ? "opacity-55" : ""}`}>
              <span className={`relative grid h-10 w-10 place-items-center rounded-full border-2 border-solid sm:h-12 sm:w-12 ${ch === k ? "mcf-tt-diem-chon border-amber-300 bg-amber-500" : bi ? "border-rose-300 bg-rose-800" : den ? "border-emerald-300 bg-emerald-700" : "border-sky-200 bg-[#1e3a5f]"}`}>
                {bi ? <Lock size={18} /> : den ? <Check size={18} /> : dong ? <MoonStar size={18} /> : <Icon size={18} />}
              </span>
              <span className="rounded bg-[#0b1d33]/85 px-1.5 py-0.5 text-center text-[10px] font-bold leading-tight sm:text-[11px]">{n.ten}</span>
            </button>
          );
        })}
        {dang && <span aria-hidden className="mcf-tt-toi absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-amber-300 text-[#2b2118]" style={{ left: `${dang.x}%`, top: `${dang.y}%` }}><Search size={13} /></span>}
      </div>

      {hetGio && <p className="mcf-cau-vao m-0 mt-4 rounded-2xl bg-[#ffe4e6] px-4 py-3 text-sm font-bold text-[#881337]">{hud.gio <= 0 ? tr("Hết giờ! Không đi đâu được nữa, phải kết luận với những gì đã có.", "Plus de temps : il faut conclure avec ce que nous avons.", "Out of time: we must conclude with what we have.") : tr("Đã đi hết mọi nơi. Đến lúc kết luận.", "Tout est visité. Il est temps de conclure.", "Every place is visited. Time to conclude.")}</p>}

      {!hetGio && cuoi?.goi && !c && <LoiNgan key={cuoi.ma} cam={cuoi.cam}>{cuoi.goi}</LoiNgan>}

      {c && !hetGio && (
        <div key={c.ma} className="mcf-cau-vao mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-black/30 p-4 text-[#fef3c7]">
          <span className="min-w-0 flex-1">
            <span className="block text-base font-extrabold">{c.ten}</span>
            <span className="block text-sm text-[#e7dcc8]">{c.tom}</span>
            {c.dong && !lyDo(ch) && <span className="mt-0.5 block text-xs font-bold text-amber-300">{tr(`Đóng cửa khi còn dưới ${c.dong} giờ`, `Ferme sous ${c.dong} h restantes`, `Closes under ${c.dong} h left`)}</span>}
          </span>
          {khoa === ch
            ? <button type="button" disabled={vatChung < 1} onClick={() => { phat("lat"); onMoKhoa(); }} className={NUT}>{vatChung < 1 ? tr("Cần 1 vật chứng để xin lệnh khám", "1 preuve requise", "Needs 1 evidence") : tr("Xin lệnh khám (−1 vật chứng)", "Mandat (−1 preuve)", "Warrant (−1 evidence)")}</button>
            : lyDo(ch) ? <span className="text-sm font-bold text-[#e7dcc8]">{lyDo(ch)}</span>
              : <button type="button" onClick={() => dinoi(ch)} className={NUT}>{tr("Đi tới (−1 giờ)", "Y aller (−1 h)", "Go (−1 h)")} <ArrowRight size={15} className="inline align-[-3px]" /></button>}
        </div>
      )}

      <div className="mt-4 text-right">
        <button type="button" onClick={onGhim} className={hetGio ? NUT : "cursor-pointer rounded-full border-0 bg-white/15 px-5 py-2.5 font-sans text-sm font-bold text-white"}><Pin size={14} className="mr-1 inline align-[-2px]" />{tr("Sang bảng ghim", "Tableau d'enquête", "Go to the board")}</button>
      </div>
    </div>
  );
}

/* Thẩm vấn: chọn câu đúng sắc thái. Sai mất kiên nhẫn, hết kiên nhẫn thì nhân chứng im lặng. */
export function ThamVan({ c, onXong }) {
  const [luot, setLuot] = useState(0);
  const [nhat, setNhat] = useState([]);       // lời đã nói
  const [bo, setBo] = useState([]);           // phương án sai đã thử ở lượt này
  const [kn, setKn] = useState(c.kienNhan);
  const [phan, setPhan] = useState(null);     // phản ứng với câu vừa sai
  const [manh, setManh] = useState([]);
  const [sai, setSai] = useState(0);
  const cuoiKhung = useRef(null);
  useEffect(() => { cuoiKhung.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [nhat, phan]);
  const L = c.luot[luot], xong = kn <= 0 || luot >= c.luot.length;
  const tra = (k) => {
    if (k !== 0) {
      phat("sai"); setSai((n) => n + 1); setKn((n) => n - 1); setBo((b) => [...b, k]); setPhan(L.sai[k - 1]);
      return;
    }
    phat("dung"); setPhan(null); setBo([]);
    setNhat((d) => [...d, { ta: L.pa[0], ho: L.dap }]);
    if (L.manh) setManh((m) => [...m, L.manh]);
    setLuot((n) => n + 1);
  };
  return (
    <div className="mcf-cau-vao mt-4">
      <LoiNgan cam={c.cam}>{c.leon}</LoiNgan>
      <div className="mcf-tt-phong relative mt-4 overflow-hidden rounded-2xl p-4">
        <span aria-hidden className="mcf-tt-den-ban absolute left-1/2 top-0 h-full w-3/4 -translate-x-1/2" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#fff] text-[#6b7280]"><UserRound size={30} /></span>
          <span className="min-w-0 flex-1 text-white">
            <span lang="fr" className="block text-base font-extrabold">{c.ai}</span>
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#e7dcc8]" role="img" aria-label={tr(`Kiên nhẫn ${kn}/${c.kienNhan}`, `Patience ${kn}/${c.kienNhan}`, `Patience ${kn}/${c.kienNhan}`)}>
              {tr("Kiên nhẫn", "Patience", "Patience")} {Array.from({ length: c.kienNhan }, (_, k) => <MessageCircle key={k} size={14} className={k < kn ? "fill-amber-300 text-amber-300" : "mcf-tt-huy-mat text-white/25"} />)}
            </span>
          </span>
        </div>
        <div className="relative mt-4 grid gap-2">
          {nhat.map((d, k) => (
            <React.Fragment key={k}>
              <p lang="fr" className="m-0 ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-amber-300 px-3 py-2 text-sm text-[#2b2118]">{d.ta}</p>
              <p lang="fr" className="mcf-bong m-0 mr-auto max-w-[85%] rounded-2xl rounded-bl-md bg-[#fff] px-3 py-2 text-sm text-[#111]">{d.ho}</p>
            </React.Fragment>
          ))}
          {phan && <p key={phan} className="mcf-rung m-0 rounded-xl bg-rose-900/80 px-3 py-2 text-sm text-[#ffe4e6]">{phan}</p>}
          {kn <= 0 && <p className="mcf-cau-vao m-0 rounded-xl bg-black/50 px-3 py-2 text-sm font-bold text-[#fecdd3]">{tr(`${c.ai} không nói thêm gì nữa.`, `${c.ai} refuse de continuer.`, `${c.ai} refuses to say more.`)}</p>}
          <span ref={cuoiKhung} />
        </div>
      </div>
      {!xong && <>
        <p className="m-0 mt-4 text-xs font-extrabold uppercase tracking-widest text-[#e7dcc8]">{L.hoi}</p>
        <CauTracNghiem key={luot} pa={L.pa} onTra={tra} daChon={null} laPhap bo={bo} />
      </>}
      {xong && <div className="mt-4 text-right"><button type="button" onClick={() => onXong({ manh, sai })} className={NUT}>{tr("Kết thúc thẩm vấn", "Terminer l'interrogatoire", "End the interview")} <ArrowRight size={15} className="inline align-[-3px]" /></button></div>}
    </div>
  );
}

/* Bảng ghim: chọn hai manh mối để đối chiếu. Mâu thuẫn thật thành một bằng chứng mới. */
export function BangGhim({ vu, so, onThay, onSai, onTiep, conDi, onVe }) {
  const [chon, setChon] = useState([]);
  const [kq, setKq] = useState(null);   // { ok, leon }
  const [day, setDay] = useState(null);
  const bang = useRef(null), the = useRef({});
  const ds = so.filter((m) => typeof m === "string");
  useLayoutEffect(() => {
    if (chon.length < 2 || !bang.current) { setDay(null); return; }
    const g = bang.current.getBoundingClientRect();
    const tam = (t) => { const r = the.current[t]?.getBoundingClientRect(); return r ? [r.left - g.left + r.width / 2, r.top - g.top + 10] : [0, 0]; };
    setDay([...tam(chon[0]), ...tam(chon[1])]);
  }, [chon]);
  const bam = (t) => { phat("bam"); setKq(null); setChon((c) => (c.includes(t) ? c.filter((x) => x !== t) : c.length < 2 ? [...c, t] : [c[1], t])); };
  const doi = () => {
    const [a, b] = chon;
    const m = vu.matThuan.find((x) => ((x.a === a && x.b === b) || (x.a === b && x.b === a)) && !ds.includes(x.t));
    if (m) { phat("thang"); setKq({ ok: true, leon: m.leon }); onThay(m.t); } else { phat("sai"); setKq({ ok: false, leon: tr("Hai điều này không mâu thuẫn nhau. P.G. đang cười ta đấy.", "Ces deux éléments ne se contredisent pas. P.G. doit bien rire.", "These two don't contradict each other. P.G. must be laughing.") }); onSai(); }
    setChon([]);
  };
  return (
    <div className="mcf-cau-vao mt-4">
      <LoiNgan cam="suy-nghi">{tr("Chọn hai manh mối rồi đối chiếu. Mâu thuẫn thật sẽ thành bằng chứng mạnh. Đối chiếu sai thì P.G. nghi ngờ thêm.", "Choisissez deux indices et comparez. Une vraie contradiction devient une preuve solide. Une erreur augmente les soupçons de P.G.", "Pick two clues and compare. A real contradiction becomes strong evidence. A wrong guess raises P.G.'s suspicion.")}</LoiNgan>
      <div ref={bang} className="mcf-tt-ghim relative mt-4 rounded-2xl p-4">
        {day && <svg aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full"><line x1={day[0]} y1={day[1]} x2={day[2]} y2={day[3]} className="mcf-tt-chi" /></svg>}
        <div className="grid grid-cols-3 gap-3">
          {vu.nghiPham.map((n, k) => (
            <div key={n.ten} className="bg-[#fff] p-2 text-center text-[#1f2937] shadow-md" style={{ rotate: `${[-2, 1.5, -1][k % 3]}deg` }}>
              <div className="grid h-12 place-items-center bg-[#e5e7eb] text-[#9ca3af]" aria-hidden><UserRound size={24} /></div>
              <p lang="fr" className="m-0 mt-1 truncate text-xs font-bold">{n.ten}</p>
            </div>
          ))}
        </div>
        {ds.length === 0
          ? <p className="m-0 mt-4 rounded-xl bg-[#fffbeb] px-4 py-3 text-sm text-[#2b2118]">{tr("Chưa có manh mối nào trên bảng.", "Aucun indice sur le tableau.", "No clues on the board yet.")}</p>
          : <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ds.map((t, k) => {
                const co = chon.includes(t), mt = vu.matThuan.some((x) => x.t === t);
                return (
                  <button key={t} ref={(el) => { the.current[t] = el; }} type="button" onClick={() => bam(t)} aria-pressed={co} style={{ rotate: `${[-1, 0.8, 0.6, -0.8][k % 4]}deg` }}
                    className={`relative cursor-pointer border-0 px-3 pb-2.5 pt-4 text-left font-sans text-[13px] leading-snug shadow-[0_6px_14px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.02] ${mt ? "mcf-dong bg-[#fecaca] font-bold text-[#7f1d1d]" : "bg-[#fef9c3] text-[#1f2937]"} ${co ? "outline outline-[3px] outline-red-600" : ""}`}>
                    <span aria-hidden className={`absolute left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full shadow ${co ? "bg-red-600" : "bg-[#475569]"}`} />
                    {t}
                  </button>
                );
              })}
            </div>}
      </div>
      {kq && <p key={kq.leon} className={`m-0 mt-3 rounded-2xl px-4 py-3 text-sm font-bold ${kq.ok ? "mcf-dong bg-[#d1fae5] text-[#064e3b]" : "mcf-rung bg-[#ffe4e6] text-[#881337]"}`}>{kq.leon}</p>}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button type="button" disabled={chon.length < 2} onClick={doi} className="cursor-pointer rounded-full border-0 bg-red-600 px-5 py-2.5 font-sans text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"><Link2 size={14} className="mr-1 inline align-[-2px]" />{tr("Đối chiếu", "Comparer", "Compare")}</button>
        {conDi && <button type="button" onClick={onVe} className="cursor-pointer rounded-full border-0 bg-white/15 px-5 py-2.5 font-sans text-sm font-bold text-white">{tr("Về sơ đồ", "Retour au plan", "Back to the map")}</button>}
        <button type="button" onClick={onTiep} className={NUT}><Gavel size={14} className="mr-1 inline align-[-2px]" />{tr("Buộc tội", "Accuser", "Accuse")}</button>
      </div>
    </div>
  );
}

/* Quyết định sau khi phá án, mang sang vụ sau (vu.sauKet, lưu ở ThamTu). */
export function LuaChonSauKet({ sk, onChon }) {
  const [da, setDa] = useState(null);
  const chon = (x) => { if (da) return; phat("lat"); setDa(x); onChon(x.gt); };
  return (
    <div className="mcf-cau-vao mt-4 rounded-2xl bg-black/35 p-4 text-[#fef3c7]">
      <p className="m-0 flex items-center gap-2 text-sm font-extrabold"><Scale size={16} className="shrink-0 text-amber-300" />{sk.hoi}</p>
      {!da && <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[sk.a, sk.b].map((x) => <button key={x.gt} type="button" onClick={() => chon(x)} className="mcf-tt-la cursor-pointer rounded-2xl border-0 bg-[#fef9c3] p-3 text-left font-sans text-sm font-bold text-[#2b2118]">{x.t}</button>)}
      </div>}
      {da && <p className="mcf-cau-vao m-0 mt-3 text-sm italic">{da.loi}</p>}
    </div>
  );
}

/* Sau khi chỉ đúng hung thủ: chọn 3 manh mối làm bằng chứng. */
export function ChonBangChung({ vu, so, onChot }) {
  const ds = so.filter((m) => typeof m === "string");
  const can = Math.min(3, ds.length);
  const [chon, setChon] = useState([]);
  const chot = () => { phat("nop"); onChot(chon.filter((t) => vu.nang.includes(t)).length); };
  return (
    <div className="mcf-cau-vao mt-4">
      <LoiNgan cam="quyet-tam">{vu.ketDu}</LoiNgan>
      <p className="m-0 mt-4 text-xs font-extrabold uppercase tracking-widest text-[#e7dcc8]">{tr(`Chọn ${can} bằng chứng`, `Choisissez ${can} preuves`, `Pick ${can} pieces of evidence`)} ({chon.length}/{can})</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {ds.map((t) => {
          const co = chon.includes(t);
          return (
            <button key={t} type="button" aria-pressed={co} onClick={() => { phat("bam"); setChon((c) => (co ? c.filter((x) => x !== t) : c.length < can ? [...c, t] : c)); }}
              className={`mcf-tt-la cursor-pointer rounded-2xl border-0 p-3 text-left font-sans text-[13px] leading-snug ${co ? "mcf-tt-la-chon bg-[#fde68a] text-[#2b2118]" : "bg-[#fef9c3] text-[#1f2937]"}`}>{t}</button>
          );
        })}
      </div>
      <div className="mt-4 text-right">
        <button type="button" disabled={chon.length < can} onClick={chot} className={NUT}><Gavel size={14} className="mr-1 inline align-[-2px]" />{can === 0 ? tr("Buộc tội dù không có bằng chứng", "Accuser sans preuve", "Accuse without evidence") : tr("Trình bằng chứng", "Présenter les preuves", "Present the evidence")}</button>
      </div>
    </div>
  );
}
