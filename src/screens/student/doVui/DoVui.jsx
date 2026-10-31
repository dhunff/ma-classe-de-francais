import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Landmark, UtensilsCrossed, Mountain, ScrollText, Palette, Star, Stamp, MapPin, TrainFront, Ticket, Flag, Flame, Users, Phone, Hourglass, Scissors, Coins, LifeBuoy, Trophy } from "lucide-react";
import CauTracNghiem from "../CauTracNghiem.jsx";
import BanDoPhap from "./BanDoPhap.jsx";
import { Minette, PhaoGiay } from "./Minette.jsx";
import { LOI_MUC, LOI_MINETTE } from "../../../content/troChoi/doVuiDiaDanh.js";
import { GOC, SO_DUNG, VE_DAU, CUOC_TOI_DA, THEM_GIO, CO_CHUNG_KET, DIEM_MOI_VE, THUONG_THANG, P_MINETTE, TRO_GIUP, diaDanh, moO, diemDen, rutCau, rutChungKet, diemCau, heSoSao, heSoChuoi, thangTour, luaChon, demCo, mucKhoHon, chiemDuoc, minetteDi, loaiThuong, traThuong, boHai, binhChon, leonDoan, diemCuoi } from "./luat.js";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import { Leon, leonVai } from "../../../shared/leon.jsx";

/* « Le Grand Quiz de France »: Tour de France (31/10). Xuất phát ở Paris, người chơi tự chọn từng điểm
   dừng trên bản đồ, trả lời câu của nơi đó, rồi về Paris chung kết. Thắng thua là cuộc đua cờ với bà
   Minette: chiếm nơi nào được số cờ bằng số sao nơi đó (xem luat.js). Tem theo địa danh tạm lưu ở
   trình duyệt (khoá mới, dấu chín chặng cũ ở mcf-do-vui-v1 giữ nguyên); điểm thật ghi qua ghi_tro_choi. */
const KHOA_TEM = "mcf-do-vui-tem-v1";
const docTem = () => { try { return JSON.parse(localStorage.getItem(KHOA_TEM)) || {}; } catch { return {}; } };
const luuTem = (id, diem) => { try { const t = docTem(); t[id] = Math.max(t[id] ?? 0, diem); localStorage.setItem(KHOA_TEM, JSON.stringify(t)); } catch { /* bỏ qua */ } };

const LOAI = {
  di_tich: { Icon: Landmark, ten: () => tr("Di tích", "Monument", "Monument") },
  am_thuc: { Icon: UtensilsCrossed, ten: () => tr("Ẩm thực", "Gastronomie", "Food") },
  thien_nhien: { Icon: Mountain, ten: () => tr("Thiên nhiên", "Nature", "Nature") },
  lich_su: { Icon: ScrollText, ten: () => tr("Lịch sử", "Histoire", "History") },
  van_hoa: { Icon: Palette, ten: () => tr("Văn hoá", "Culture", "Culture") },
};
const GIUP = {
  nam_nam: { Icon: Scissors, ten: () => "50:50" },
  khan_gia: { Icon: Users, ten: () => tr("Khán giả", "Public", "Audience") },
  leon: { Icon: Phone, ten: () => tr("Gọi Léon", "Appeler Léon", "Call Léon") },
  them_gio: { Icon: Hourglass, ten: () => `+${THEM_GIO}s` },
};
const GIAY_TAU = 1100;
const ngauNhien = (ds) => ds[Math.floor(Math.random() * ds.length)];
const nen = "mt-6 rounded-[2rem] bg-[#140b33] bg-[radial-gradient(ellipse_at_top,#3b1d8f_0,transparent_60%)] p-4 text-white sm:p-5";
const Sao = ({ n }) => <span className="inline-flex gap-0.5" aria-label={`${n}/3`}>{[1, 2, 3].map((k) => <Star key={k} size={13} className={k <= n ? "fill-amber-400 text-amber-400" : "text-white/25"} />)}</span>;
const LoiMinette = ({ cam, children }) => (
  <div className="mcf-dv-bang mt-3 flex items-center justify-end gap-3">
    <p className="m-0 rounded-3xl rounded-br-md bg-pink-500/20 px-4 py-3 text-sm leading-relaxed text-white">{children}</p>
    <Minette cam={cam} size={56} />
  </div>
);
/* Thanh đua cờ: phần vàng của người chơi lấn dần sang phần hồng của Minette. */
const ThanhDua = ({ ban, mn }) => (
  <div className="flex items-center gap-2 text-xs font-extrabold tabular-nums">
    <span className="flex items-center gap-1 text-amber-300"><Flag size={14} className="fill-amber-300" />{ban}</span>
    <span className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-pink-400" aria-hidden><span className="mcf-dv-dua h-full bg-amber-400" style={{ width: `${((ban + 1) / (ban + mn + 2)) * 100}%` }} /></span>
    <span className="flex items-center gap-1 text-pink-300">{mn}<Flag size={14} className="fill-pink-300" /></span>
    <Minette cam={mn > ban ? "vui" : mn < ban ? "ngac-nhien" : "tu-tin"} size={30} />
  </div>
);
const LoiLeon = ({ cam, children }) => (
  <div className="mcf-cau-vao mt-4 flex items-start gap-3">
    <Leon cam={leonVai("mc", cam)} size={60} className="shrink-0" />
    <p className="m-0 rounded-3xl rounded-tl-md bg-white/10 px-4 py-3 text-sm leading-relaxed text-white">{children}</p>
  </div>
);

export default function DoVui({ muc = "vua", he, onXong }) {
  const GIAY = Math.round(20 * (he?.gio ?? 1));
  const [buoc, setBuoc] = useState("mo");         // mo | chon | tau | hoi | xongDung | ket
  const [tem, setTem] = useState(docTem);
  const [lo, setLo] = useState([GOC]);            // lộ trình, phần tử đầu là Paris
  const [toi, setToi] = useState(null);           // điểm đang tới
  const [ds, setDs] = useState([]);               // câu của điểm dừng này
  const [i, setI] = useState(0);
  const [chon, setChon] = useState(null);         // chỉ số đã chọn, -1 = hết giờ
  const [con, setCon] = useState(GIAY);
  const [ve, setVe] = useState(VE_DAU);
  const [cuoc, setCuoc] = useState(0);            // số vé cược vào câu đang hỏi
  const [chuoi, setChuoi] = useState(0);          // số câu đúng liên tiếp
  const [daDung, setDaDung] = useState([]);       // trợ giúp đã dùng trong Tour
  const [an, setAn] = useState([]);               // 50:50 của câu đang hỏi
  const [binh, setBinh] = useState(null);         // bình chọn của khán giả
  const [leonChon, setLeonChon] = useState(null); // đáp án Léon đoán
  const [mnLo, setMnLo] = useState([GOC]);        // lộ trình của Minette
  const [chu, setChu] = useState({});             // { id: "ban" | "minette" }
  const [coKet, setCoKet] = useState({ ban: 0, mn: 0 });  // cờ giành ở chung kết
  const [mnDung, setMnDung] = useState(null);     // Minette trả lời câu chung kết này ra sao
  const [bienCo, setBienCo] = useState(null);     // tổng kết điểm dừng vừa xong
  const kq = useRef({ diem: 0, dung: 0, tong: 0 });
  const dung = useRef({ dung: 0 });               // số câu đúng ở điểm dừng hiện tại
  const daHoi = useRef([]);
  const batDau = useRef(Date.now());

  const moSet = useMemo(() => new Set(moO(muc).map((d) => d.id)), [muc]);
  const soDung = lo.length - 1;
  const hetTour = soDung >= SO_DUNG || moSet.size <= soDung;
  const diDuoc = useMemo(() => (buoc === "chon" ? diemDen(lo[lo.length - 1], lo, muc) : []), [buoc, lo, muc]);
  const chungKet = toi === GOC;
  const noi = toi ? diaDanh(toi) : null;
  const cuaMinette = !!toi && chu[toi] === "minette";
  const gioCau = cuaMinette && muc === "kho" ? Math.round(GIAY * 0.7) : GIAY;   // mức Khó không còn mức cao hơn nên nơi bà chiếm bớt giờ
  const luaCh = useMemo(() => luaChon(diDuoc, lo[lo.length - 1], ve), [diDuoc, lo, ve]);
  const coBan = demCo(chu, "ban") + coKet.ban, coMn = demCo(chu, "minette") + coKet.mn;

  const moiCau = () => { setChon(null); setCuoc(0); setAn([]); setBinh(null); setLeonChon(null); setMnDung(null); };

  const veDich = useCallback((id) => {
    const lc = luaCh.find((d) => d.id === id);
    if (lc && !lc.du) return;
    if (lc) setVe((v) => v - lc.gia);
    phat("batDau"); setToi(id); setBuoc("tau");
    const ca = id === GOC ? rutChungKet(muc, daHoi.current) : rutCau(id, chu[id] === "minette" ? mucKhoHon(muc) : muc);
    daHoi.current = [...daHoi.current, ...ca.map((c) => c.q)];
    setDs(ca); setI(0); moiCau(); dung.current = { dung: 0 };
    const ms = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : GIAY_TAU;
    window.setTimeout(() => setBuoc("hoi"), ms);
  }, [muc, luaCh, chu]);

  const tra = useCallback((k) => {
    if (chon != null || !noi) return;
    setChon(k); const ok = k === 0; phat(ok ? "dung" : "sai");
    kq.current.tong++;
    if (ok) {
      const moi = chuoi + 1;
      kq.current.dung++; dung.current.dung++; kq.current.diem += diemCau(con, noi.sao, moi, cuoc);
      setChuoi(moi); setVe((v) => v + 1 + cuoc);
      if (moi >= 3) phat("combo");
    } else { setChuoi(0); setVe((v) => v - cuoc); }
    if (chungKet) {
      const mn = Math.random() < P_MINETTE[muc];
      setMnDung(mn);
      setCoKet((c) => ({ ban: c.ban + (ok ? CO_CHUNG_KET : 0), mn: c.mn + (mn ? CO_CHUNG_KET : 0) }));
    }
  }, [chon, noi, con, chuoi, cuoc, chungKet, muc]);
  // Đồng hồ giữ hàm tra của lúc nó khởi động, nên hết giờ phải gọi bản mới nhất, kẻo mất vé đã cược.
  const traMoi = useRef(tra);
  traMoi.current = tra;

  const dungGiup = (ten) => {
    if (chon != null || daDung.includes(ten)) return;
    const c = ds[i];
    phat("tiep"); setDaDung([...daDung, ten]);
    if (ten === "nam_nam") setAn(boHai());
    if (ten === "khan_gia") setBinh(binhChon(c.muc, an));
    if (ten === "leon") setLeonChon(leonDoan(c.muc, an));
    if (ten === "them_gio") { batDau.current += THEM_GIO * 1000; setCon((g) => g + THEM_GIO); }
  };

  useEffect(() => {
    if (buoc !== "hoi" || chon != null) return;
    batDau.current = Date.now(); setCon(gioCau);
    const t = setInterval(() => {
      const c = Math.max(0, gioCau - Math.floor((Date.now() - batDau.current) / 1000));
      setCon(c);
      if (c === 0) { clearInterval(t); traMoi.current(-1); }
    }, 250);
    return () => clearInterval(t);
  }, [buoc, i, chon == null]); // eslint-disable-line react-hooks/exhaustive-deps

  const tiepCau = () => {
    if (i + 1 < ds.length) { moiCau(); setI(i + 1); return; }
    if (chungKet) { phat(thangTour(coBan, coMn) ? "thang" : "thua"); setBuoc("ket"); return; }
    const d = dung.current.dung, duoc = chiemDuoc(d, ds.length, cuaMinette);
    if (d > 0) { luuTem(toi, d); setTem(docTem()); }
    const thuong = d === ds.length ? traThuong(noi, daDung) : null;
    if (thuong === "ve") setVe((v) => v + 1);
    if (thuong === "tro_giup") setDaDung(daDung.slice(0, -1));
    // Lượt của Minette: bà đi sau người chơi, nên nơi vừa tới không bị giành mất.
    const mv = minetteDi(mnLo[mnLo.length - 1], [...lo, toi, ...mnLo, ...Object.keys(chu)], muc);
    const chuMoi = { ...chu };
    if (duoc) chuMoi[toi] = "ban";
    if (mv?.chiem) chuMoi[mv.id] = "minette";
    if (mv) setMnLo([...mnLo, mv.id]);
    setChu(chuMoi);
    const loai = cuaMinette && duoc ? "mat" : mv?.chiem ? "chiem" : "hut";
    setBienCo({ duoc, cuaM: cuaMinette, thuong, loai, loi: ngauNhien(LOI_MINETTE[loai]).replace("{noi}", loai === "mat" ? noi.ten : mv ? diaDanh(mv.id).ten : noi.ten) });
    setBuoc("xongDung");
  };
  const roiDung = () => { const m = [...lo, toi]; setLo(m); setToi(null); setBuoc("chon"); };

  // Gọi như hàm, không dựng thành component: component khai trong thân hàm sẽ gắn lại sau mỗi lần vẽ và làm chuyến tàu chạy lại từ đầu.
  const banDo = (them) => (
    <div className="rounded-2xl bg-[#0d0724] p-2">
      <BanDoPhap moSet={moSet} diDuoc={luaCh.filter((d) => d.du).map((d) => d.id)} daDi={lo} dangO={lo[lo.length - 1]} dangToi={buoc === "tau" ? toi : null} dau={tem} mnLo={mnLo} chu={chu} {...them} />
    </div>
  );
  const thanhTour = () => (
    <div className="mb-3 grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
        <span className="rounded-full bg-white/10 px-3 py-1 uppercase tracking-widest text-amber-300">{tr("Điểm dừng", "Étape", "Stop")} {Math.min(soDung + (toi ? 1 : 0), SO_DUNG)}/{SO_DUNG}</span>
        <span className="flex items-center gap-3 tabular-nums text-white/80">
          <span className="flex items-center gap-1 text-amber-300"><Ticket size={14} />{ve}</span>
          {chuoi >= 2 && <span key={chuoi} className="mcf-nay flex items-center gap-1 text-orange-300"><Flame size={14} className="mcf-lua-nhun fill-orange-400" />{chuoi}</span>}
          <span>{kq.current.diem} {tr("điểm", "pts", "pts")}</span>
        </span>
      </div>
      <ThanhDua ban={coBan} mn={coMn} />
    </div>
  );

  if (buoc === "mo") return (
    <div className={nen}>
      <LoiLeon cam="phap">{LOI_MUC[muc].mo}</LoiLeon>
      <LoiMinette cam="tu-tin">{tr("Lần này ta không ngồi chờ đâu. Ta đi tuyến riêng, chiếm nơi nào thì nơi đó có cờ của ta.", "Cette fois, je voyage aussi. Chaque lieu conquis portera mon drapeau.", "This time I travel too. Every place I take flies my flag.")}</LoiMinette>
      <div className="mt-4">{banDo({ nhan: [GOC] })}</div>
      <ul className="m-0 mt-3 grid list-none gap-1.5 p-0 text-xs leading-snug text-white/85 sm:grid-cols-3">
        <li className="flex gap-2 rounded-xl bg-white/10 p-2.5"><Flag size={15} className="mt-px shrink-0 text-amber-300" />{tr(`Đúng ít nhất 1 câu là chiếm được nơi đó, được số cờ bằng số sao. Về đích nhiều cờ hơn Minette thì thắng.`, `Une bonne réponse conquiert le lieu : autant de drapeaux que d'étoiles. Le plus de drapeaux gagne.`, `One right answer takes the place: flags equal its stars. Most flags wins.`)}</li>
        <li className="flex gap-2 rounded-xl bg-white/10 p-2.5"><Ticket size={15} className="mt-px shrink-0 text-amber-300" />{tr(`Có ${VE_DAU} vé. Đi xa tốn nhiều vé, đúng một câu được một vé, và có thể cược vé vào câu chắc ăn.`, `${VE_DAU} billets au départ. Loin coûte plus, chaque bonne réponse en rapporte un, et vous pouvez miser.`, `${VE_DAU} tickets to start. Far costs more, right answers earn one, and you can bet them.`)}</li>
        <li className="flex gap-2 rounded-xl bg-white/10 p-2.5"><LifeBuoy size={15} className="mt-px shrink-0 text-amber-300" />{tr("Bốn trợ giúp, mỗi loại dùng một lần. Đúng liên tiếp thì điểm nhân lên tới ×2.", "Quatre jokers, un usage chacun. Les séries multiplient les points jusqu'à ×2.", "Four lifelines, one use each. Streaks multiply points up to ×2.")}</li>
      </ul>
      <p className="m-0 mt-3 text-center text-xs text-white/70">{tr(`${moSet.size} địa danh đang chờ bạn. Mỗi Tour chỉ đi được ${SO_DUNG} nơi, nên hãy chọn khôn ngoan.`, `${moSet.size} lieux vous attendent. ${SO_DUNG} étapes par Tour : choisissez bien.`, `${moSet.size} places await. ${SO_DUNG} stops per Tour: choose wisely.`)}</p>
      <div className="mt-4 text-center">
        <button type="button" onClick={() => { phat("batDau"); setBuoc("chon"); }} className="cursor-pointer rounded-full border-0 bg-amber-400 px-8 py-3 font-sans text-base font-extrabold text-[#140b33] shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none">{tr("Lên tàu!", "En voiture !", "All aboard!")}</button>
      </div>
    </div>
  );

  if (buoc === "chon") {
    if (hetTour) return (
      <div className={nen}>
        {thanhTour()}
        {banDo({ nhan: [GOC] })}
        <LoiLeon cam="quyet-tam">{tr(`Đoàn làm phim về Paris! Ba câu chung kết, mỗi câu đúng được ${CO_CHUNG_KET} cờ, và bà Minette cũng trả lời cùng bạn.`, `Retour à Paris ! Trois questions, ${CO_CHUNG_KET} drapeaux chacune, et Minette répond aussi.`, `Back to Paris! Three questions, ${CO_CHUNG_KET} flags each, and Minette answers too.`)}</LoiLeon>
        <div className="mt-4 text-center"><button type="button" onClick={() => veDich(GOC)} className="cursor-pointer rounded-full border-0 bg-amber-400 px-8 py-3 font-sans text-base font-extrabold text-[#140b33] shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none">{tr("Vào chung kết", "Vers la finale", "To the final")}</button></div>
      </div>
    );
    return (
      <div className={nen}>
        {thanhTour()}
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
          {banDo({ onChon: veDich, nhan: luaCh.map((d) => d.id) })}
          <div className="grid gap-3">
            <p className="m-0 text-sm font-extrabold">{tr("Điểm dừng tiếp theo?", "Où va-t-on ?", "Where next?")}</p>
            {luaCh.map((d) => {
              const { Icon, ten } = LOAI[d.loai], heSo = heSoSao(d.sao), cuaBa = chu[d.id] === "minette";
              return (
                <button key={d.id} type="button" disabled={!d.du} onClick={() => veDich(d.id)}
                  className={`mcf-cau-vao flex gap-3 rounded-2xl border-2 border-solid ${cuaBa ? "border-pink-600" : "border-[#7c2d12]"} bg-[#fef3c7] p-3 text-left font-sans text-[#431407] shadow-[0_8px_18px_rgba(0,0,0,0.35)] transition-transform ${d.du ? "cursor-pointer hover:-translate-y-0.5" : "cursor-not-allowed opacity-55"}`}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#7c2d12] text-[#fef3c7]"><Icon size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2"><span lang="fr" className="text-base font-extrabold">{d.ten}</span>{tem[d.id] != null && <Stamp size={16} className="shrink-0 text-[#b91c1c]" aria-label={tr("Đã có tem", "Tampon obtenu", "Stamped")} />}</span>
                    <span className="block text-xs leading-snug">{d.mo}</span>
                    <span className="mt-1 flex items-center gap-2 text-[11px] font-bold text-[#9a3412]">{ten()}<span className="rounded-full bg-[#7c2d12] px-1.5 py-0.5"><Sao n={d.sao} /></span>{heSo > 1 && <span>{tr("điểm", "pts", "pts")} ×{String(heSo).replace(".", ",")}</span>}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-extrabold">
                      <span className="flex items-center gap-1"><Ticket size={13} />{d.diNho ? tr("Đi nhờ, miễn phí", "Stop gratuit", "Free ride") : d.du ? `${d.gia} ${tr("vé", "billet(s)", "ticket(s)")}` : tr(`Cần ${d.gia} vé`, `${d.gia} billets requis`, `Needs ${d.gia} tickets`)}</span>
                      <span className="flex items-center gap-1"><Flag size={13} />{d.sao}</span>
                      <span className="font-bold text-[#9a3412]">{tr("Đúng hết", "Sans faute", "Perfect")}: {loaiThuong(d) === "tro_giup" ? tr("hồi 1 trợ giúp", "1 joker rendu", "1 lifeline back") : tr("+1 vé", "+1 billet", "+1 ticket")}</span>
                    </span>
                    {cuaBa && <span className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-pink-600 px-2 py-1 text-[11px] font-extrabold leading-snug text-white"><Minette size={20} />{muc === "kho" ? tr("Của Minette: phải đúng hết, ít giờ hơn", "À Minette : sans faute, moins de temps", "Minette's: all correct, less time") : tr("Của Minette: phải đúng hết, câu khó hơn", "À Minette : sans faute, questions plus dures", "Minette's: all correct, harder questions")}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (buoc === "tau") return (
    <div className={nen}>
      {thanhTour()}
      {banDo({ nhan: [lo[lo.length - 1], toi] })}
      {cuaMinette && <p className="mcf-dv-bang m-0 mt-2 text-center text-xs font-extrabold text-pink-300">{tr("Vào đất của Minette, chuẩn bị câu khó!", "Territoire de Minette : ça va être dur !", "Minette's turf: brace yourself!")}</p>}
      <p className="m-0 mt-3 flex items-center justify-center gap-2 text-sm font-bold text-amber-300"><TrainFront size={16} /> {tr("Đang tới", "En route vers", "Heading to")} <span lang="fr">{noi.ten}</span></p>
    </div>
  );

  if (buoc === "xongDung") return (
    <div className={nen}>
      {thanhTour()}
      <p className="m-0 flex items-center justify-center gap-2 text-sm font-bold text-amber-300"><MapPin size={16} /> <span lang="fr">{noi.ten}</span></p>
      {dung.current.dung > 0
        ? <p lang="fr" className="mcf-dong mx-auto mt-5 w-fit rounded-md border-4 border-double border-amber-300 px-3 py-1 text-center text-sm font-black uppercase tracking-widest text-amber-300">{noi.ten}</p>
        : null}
      <div className="mx-auto mt-3 max-w-60">{banDo({ dangO: toi, daDi: [...lo, toi] })}</div>
      <LoiLeon cam={bienCo.duoc ? "cuoi-lon" : "co-len"}>
        {bienCo.duoc
          ? (bienCo.cuaM ? tr(`Giành lại ${noi.ten} từ tay Minette! Cờ của bạn đã cắm ở đây.`, `${noi.ten} reprise à Minette !`, `${noi.ten} won back from Minette!`) : tr(`Đúng ${dung.current.dung}/${ds.length} câu, tem và cờ của ${noi.ten} là của bạn!`, `${dung.current.dung}/${ds.length} : tampon et drapeau de ${noi.ten} !`, `${dung.current.dung}/${ds.length}: the ${noi.ten} stamp and flag are yours!`))
          : (bienCo.cuaM ? tr("Đất của Minette phải đúng hết mới giành được. Cờ của bà vẫn còn đó.", "Il fallait un sans-faute : le drapeau de Minette reste.", "It took a perfect stop: Minette's flag stays.") : tr("Lần này chưa có tem, nhưng chuyến đi vẫn tiếp tục.", "Pas de tampon cette fois, le voyage continue.", "No stamp this time, the trip goes on."))}
        {bienCo.thuong && <strong className="mcf-nay ml-1 inline-block text-amber-300">{bienCo.thuong === "ve" ? tr("Thưởng đúng hết: +1 vé.", "Sans faute : +1 billet.", "Perfect: +1 ticket.") : tr("Thưởng đúng hết: hồi 1 trợ giúp.", "Sans faute : 1 joker rendu.", "Perfect: 1 lifeline back.")}</strong>}
      </LoiLeon>
      <LoiMinette cam={bienCo.loai === "chiem" ? "vui" : bienCo.loai === "mat" ? "ngac-nhien" : "buon"}><span lang="fr">{bienCo.loi}</span></LoiMinette>
      <div className="mt-4 text-right"><button type="button" onClick={roiDung} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#140b33]">{tr("Lên đường", "En route", "Move on")} →</button></div>
    </div>
  );

  if (buoc === "hoi") {
    const c = ds[i];
    return (
      <div className={nen}>
        <div className="mb-3 flex items-center justify-center gap-2">
          <Leon cam={leonVai("mc", chon == null ? "hoi" : chon === 0 ? "yeah" : "hum")} size={48} />
          <span lang="fr" className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-300">{chungKet ? "La Grande Finale" : noi.ten}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <p className="m-0 flex items-center justify-center gap-1.5 rounded-xl bg-amber-400/90 p-2 text-center text-xs font-extrabold tabular-nums text-[#140b33]">{tr("Bạn", "Vous", "You")} <Flag size={13} className="fill-[#140b33]" />{coBan}<Ticket size={13} className="ml-1" />{ve}</p>
          <span className="relative grid h-14 w-14 place-items-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden><circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" stroke="rgba(255,255,255,0.15)" /><circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeLinecap="round" stroke={con <= 5 ? "#f87171" : "#fbbf24"} strokeDasharray="94.2" strokeDashoffset={94.2 * (1 - con / Math.max(gioCau, con))} /></svg>
            <span className="text-sm font-extrabold tabular-nums">{con}</span>
          </span>
          <p className="m-0 flex items-center justify-center gap-1.5 rounded-xl bg-pink-500/30 p-1 text-center text-xs font-extrabold tabular-nums"><Minette size={26} cam={mnDung === true ? "vui" : mnDung === false ? "buon" : "tu-tin"} /><Flag size={13} className="fill-white" />{coMn}</p>
        </div>
        {chuoi >= 2 && <p key={chuoi} className="mcf-nay m-0 mt-2 flex items-center justify-center gap-1 text-xs font-extrabold text-orange-300"><Flame size={15} className="mcf-lua-nhun fill-orange-400" />{tr(`Chuỗi ${chuoi}`, `Série de ${chuoi}`, `${chuoi} in a row`)} · ×{String(heSoChuoi(chuoi + (chon == null ? 1 : 0))).replace(".", ",")}</p>}
        <div className="mt-4 flex items-center gap-1.5" aria-hidden>
          {ds.map((_, k) => <span key={k} className={`h-2 flex-1 rounded-full ${k < i ? "bg-amber-400" : k === i ? "bg-white" : "bg-white/15"}`} />)}
        </div>
        <div className={`relative mt-4 rounded-2xl border-2 border-solid border-violet-400/60 bg-[#22145a] px-5 py-6 text-center shadow-[0_0_40px_rgba(139,92,246,0.35)] ${chon != null && chon !== 0 ? "mcf-rung" : ""}`}>
          {chon === 0 && <PhaoGiay />}
          {chon != null && (chon === 0 || cuoc > 0) && <span className={`mcf-dv-bay absolute right-3 top-2 flex items-center gap-1 text-sm font-black ${chon === 0 ? "text-amber-300" : "text-red-300"}`}><Ticket size={15} />{chon === 0 ? `+${1 + cuoc}` : `-${cuoc}`}</span>}
          <p lang={c.muc === "de" ? undefined : "fr"} className="m-0 text-xl font-extrabold leading-snug">{c.q}</p>
        </div>
        {chon == null && <>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {TRO_GIUP.map((ten) => {
              const { Icon, ten: nhan } = GIUP[ten], het = daDung.includes(ten);
              return <button key={ten} type="button" disabled={het} onClick={() => dungGiup(ten)} className={`flex items-center gap-1.5 rounded-full border-0 px-3 py-1.5 font-sans text-xs font-extrabold ${het ? "cursor-not-allowed bg-white/5 text-white/30 line-through" : "cursor-pointer bg-white/15 text-white hover:bg-white/25"}`}><Icon size={14} />{nhan()}</button>;
            })}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-white/80">
            <span className="flex items-center gap-1"><Coins size={14} className="text-amber-300" />{tr("Cược", "Miser", "Bet")}</span>
            {Array.from({ length: CUOC_TOI_DA }, (_, k) => k + 1).map((n) => {
              const bat = cuoc === n, duoc = n <= ve;
              return <button key={n} type="button" disabled={!duoc} aria-pressed={bat} onClick={() => { phat("bam"); setCuoc(bat ? 0 : n); }} className={`rounded-full border-0 px-3 py-1 font-sans text-xs font-extrabold ${bat ? "mcf-nay cursor-pointer bg-amber-400 text-[#140b33]" : duoc ? "cursor-pointer bg-white/15 text-white hover:bg-white/25" : "cursor-not-allowed bg-white/5 text-white/30"}`}>{n} {tr("vé", "billet(s)", "ticket(s)")}</button>;
            })}
            {cuoc > 0 && <span className="mcf-nay text-amber-300">{tr(`Đúng: thêm ${cuoc} vé, điểm ×${String(1 + cuoc * 0.5).replace(".", ",")}. Sai: mất ${cuoc} vé.`, `Juste : +${cuoc} billet(s), points ×${String(1 + cuoc * 0.5).replace(".", ",")}. Faux : -${cuoc}.`, `Right: +${cuoc} ticket(s), points ×${1 + cuoc * 0.5}. Wrong: -${cuoc}.`)}</span>}
          </div>
          {leonChon != null && <LoiLeon cam="tai-nghe">{tr("Léon nghe máy: ", "Léon au bout du fil : ", "Léon on the line: ")}<strong lang="fr">{c.pa[leonChon]}</strong>{tr(", nhưng ta không dám thề đâu nhé!", ", mais je n'en jurerais pas !", ", but don't quote me on that!")}</LoiLeon>}
        </>}
        <CauTracNghiem key={c.q} pa={c.pa} onTra={tra} daChon={chon} laPhap kieu="tv" an={an} phanTram={binh} />
        {chon != null && <>
          {chungKet && mnDung != null && <LoiMinette cam={mnDung ? "vui" : "buon"}>{mnDung ? tr(`Ta cũng đúng câu này: +${CO_CHUNG_KET} cờ.`, `Moi aussi, j'ai juste : +${CO_CHUNG_KET} drapeaux.`, `I got it too: +${CO_CHUNG_KET} flags.`) : tr("Zut ! Câu này ta sai mất rồi.", "Zut ! Celle-là, je l'ai ratée.", "Zut! I missed that one.")}</LoiMinette>}
          <LoiLeon cam={chon === 0 ? "tuyet-voi" : chon === -1 ? "ngac-nhien" : "xin-loi"}>
            {chon === 0 ? tr("Chính xác! ", "Exact ! ", "Correct! ") : chon === -1 ? tr("Hết giờ rồi! ", "Temps écoulé ! ", "Time's up! ") : tr("Tiếc quá! ", "Dommage ! ", "Too bad! ")}
            {chon !== 0 && <><strong lang="fr">{c.pa[0]}</strong>. </>}{c.gt}
          </LoiLeon>
          <div className="mt-4 text-right">
            <button type="button" onClick={tiepCau} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#140b33]">
              {i + 1 < ds.length ? tr("Câu tiếp", "Question suivante", "Next question") : chungKet ? tr("Kết quả Tour", "Résultat", "Results") : tr("Đóng dấu", "Tamponner", "Stamp")} →
            </button>
          </div>
        </>}
      </div>
    );
  }

  const thang = thangTour(coBan, coMn), tongDiem = diemCuoi(kq.current.diem, ve, thang);
  return (
    <div className={`relative overflow-hidden ${nen}`}>
      {thang && <PhaoGiay nhieu />}
      <p className="m-0 text-center text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Le Grand Quiz de France</p>
      {thang && <Trophy size={44} className="mcf-sao-no mx-auto mt-3 block fill-amber-300 text-amber-500" aria-hidden />}
      <div className="mt-4 flex items-center justify-center gap-6 text-center">
        <div><p className="m-0 text-xs font-bold text-white/70">{tr("Bạn", "Vous", "You")}</p><p className="m-0 flex items-center justify-center gap-1.5 text-3xl font-extrabold tabular-nums text-amber-300"><Flag size={22} className="fill-amber-300" />{coBan}</p><p className="m-0 text-xs text-white/70 tabular-nums">{kq.current.dung}/{kq.current.tong} {tr("câu đúng", "bonnes réponses", "correct")}</p></div>
        <span className="text-xl font-black text-white/50">VS</span>
        <div className="grid justify-items-center"><Minette cam={thang ? "buon" : "vui"} size={46} /><p className="m-0 flex items-center gap-1.5 text-3xl font-extrabold tabular-nums text-pink-300"><Flag size={22} className="fill-pink-300" />{coMn}</p></div>
      </div>
      <dl className="mx-auto mt-4 grid max-w-xs grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
        <dt className="text-white/70">{tr("Điểm câu hỏi", "Questions", "Questions")}</dt><dd className="m-0 text-right font-bold tabular-nums">{kq.current.diem}</dd>
        <dt className="text-white/70">{tr(`${ve} vé còn lại`, `${ve} billet(s) restant(s)`, `${ve} ticket(s) left`)}</dt><dd className="m-0 text-right font-bold tabular-nums">+{ve * DIEM_MOI_VE}</dd>
        {thang && <><dt className="text-white/70">{tr("Thưởng thắng Minette", "Victoire sur Minette", "Beating Minette")}</dt><dd className="m-0 text-right font-bold tabular-nums">+{THUONG_THANG}</dd></>}
        <dt className="font-extrabold text-amber-300">{tr("Tổng", "Total", "Total")}</dt><dd className="m-0 text-right font-extrabold tabular-nums text-amber-300">{tongDiem}</dd>
      </dl>
      <div className="mx-auto mt-4 max-w-sm">{banDo({ nhan: [GOC] })}</div>
      <LoiLeon cam={thang ? "cuoi-lon" : "co-len"}>{thang ? LOI_MUC[muc].thang : LOI_MUC[muc].thua}</LoiLeon>
      <div className="mt-5 text-right">
        <button type="button" onClick={() => onXong({ diem: tongDiem, dung: kq.current.dung, tong: kq.current.tong })}
          className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#140b33]">{tr("Lưu điểm", "Enregistrer", "Save score")} →</button>
      </div>
    </div>
  );
}
