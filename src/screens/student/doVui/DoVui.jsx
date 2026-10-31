import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Landmark, UtensilsCrossed, Mountain, ScrollText, Palette, Star, Stamp, MapPin, TrainFront } from "lucide-react";
import CauTracNghiem from "../CauTracNghiem.jsx";
import BanDoPhap from "./BanDoPhap.jsx";
import { LOI_MUC } from "../../../content/troChoi/doVuiDiaDanh.js";
import { GOC, SO_DUNG, diaDanh, moO, cauCua, diemDen, rutCau, rutChungKet, diemCau, heSoSao, thangTour } from "./luat.js";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import { Leon, leonVai } from "../../../shared/leon.jsx";

/* « Le Grand Quiz de France »: Tour de France (31/10). Xuất phát ở Paris, người chơi tự chọn từng điểm
   dừng trên bản đồ, trả lời câu của nơi đó, rồi về Paris chung kết. Tem theo địa danh tạm lưu ở
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
const GIAY_TAU = 1100;
const nen = "mt-6 rounded-[2rem] bg-[#140b33] bg-[radial-gradient(ellipse_at_top,#3b1d8f_0,transparent_60%)] p-4 text-white sm:p-5";
const Sao = ({ n }) => <span className="inline-flex gap-0.5" aria-label={`${n}/3`}>{[1, 2, 3].map((k) => <Star key={k} size={13} className={k <= n ? "fill-amber-400 text-amber-400" : "text-white/25"} />)}</span>;
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
  const [minette, setMinette] = useState(0);
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

  const veDich = useCallback((id) => {
    phat("batDau"); setToi(id); setBuoc("tau");
    const ca = id === GOC ? rutChungKet(muc, daHoi.current) : rutCau(id, muc);
    daHoi.current = [...daHoi.current, ...ca.map((c) => c.q)];
    setDs(ca); setI(0); setChon(null); dung.current = { dung: 0 };
    const ms = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : GIAY_TAU;
    window.setTimeout(() => setBuoc("hoi"), ms);
  }, [muc]);

  const tra = useCallback((k) => {
    if (chon != null || !noi) return;
    setChon(k); const ok = k === 0; phat(ok ? "dung" : "sai");
    kq.current.tong++;
    if (ok) { kq.current.dung++; dung.current.dung++; kq.current.diem += diemCau(con, noi.sao); }
    // Bà Minette trả lời đúng khoảng 60%: đủ để là đối thủ, không đủ để không thể thắng.
    if (Math.random() < 0.6) setMinette((m) => m + 1);
  }, [chon, noi, con]);

  useEffect(() => {
    if (buoc !== "hoi" || chon != null) return;
    batDau.current = Date.now(); setCon(GIAY);
    const t = setInterval(() => {
      const c = Math.max(0, GIAY - Math.floor((Date.now() - batDau.current) / 1000));
      setCon(c);
      if (c === 0) { clearInterval(t); tra(-1); }
    }, 250);
    return () => clearInterval(t);
  }, [buoc, i, chon == null]); // eslint-disable-line react-hooks/exhaustive-deps

  const tiepCau = () => {
    if (i + 1 < ds.length) { setChon(null); setI(i + 1); return; }
    if (chungKet) { if (thangTour(kq.current.dung, kq.current.tong)) phat("thang"); setBuoc("ket"); return; }
    if (dung.current.dung > 0) { luuTem(toi, dung.current.dung); setTem(docTem()); }
    setBuoc("xongDung");
  };
  const roiDung = () => { const m = [...lo, toi]; setLo(m); setToi(null); setBuoc("chon"); };

  // Gọi như hàm, không dựng thành component: component khai trong thân hàm sẽ gắn lại sau mỗi lần vẽ và làm chuyến tàu chạy lại từ đầu.
  const banDo = (them) => (
    <div className="rounded-2xl bg-[#0d0724] p-2">
      <BanDoPhap moSet={moSet} diDuoc={diDuoc.map((d) => d.id)} daDi={lo} dangO={lo[lo.length - 1]} dangToi={buoc === "tau" ? toi : null} dau={tem} {...them} />
    </div>
  );
  const thanhTour = () => (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
      <span className="rounded-full bg-white/10 px-3 py-1 uppercase tracking-widest text-amber-300">{tr("Điểm dừng", "Étape", "Stop")} {Math.min(soDung + (toi ? 1 : 0), SO_DUNG)}/{SO_DUNG}</span>
      <span className="tabular-nums text-white/80">{kq.current.diem} {tr("điểm", "pts", "pts")} · Minette {minette}</span>
    </div>
  );

  if (buoc === "mo") return (
    <div className={nen}>
      <LoiLeon cam="phap">{LOI_MUC[muc].mo}</LoiLeon>
      <div className="mt-4">{banDo({ nhan: [GOC] })}</div>
      <p className="m-0 mt-3 text-center text-xs text-white/70">{tr(`${moSet.size} địa danh đang mở ở mức này. Chấm mờ sẽ mở khi có thêm câu hỏi.`, `${moSet.size} lieux ouverts à ce niveau. Les points pâles ouvriront plus tard.`, `${moSet.size} places open at this level. Faded dots open later.`)}</p>
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
        <LoiLeon cam="quyet-tam">{tr("Đoàn làm phim về Paris! Studio 1 đã lên đèn, đây là chặng chung kết.", "Retour à Paris ! Le Studio 1 s'allume pour la finale.", "Back to Paris! Studio 1 is lit for the final.")}</LoiLeon>
        <div className="mt-4 text-center"><button type="button" onClick={() => veDich(GOC)} className="cursor-pointer rounded-full border-0 bg-amber-400 px-8 py-3 font-sans text-base font-extrabold text-[#140b33] shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none">{tr("Vào chung kết", "Vers la finale", "To the final")}</button></div>
      </div>
    );
    return (
      <div className={nen}>
        {thanhTour()}
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
          {banDo({ onChon: veDich, nhan: diDuoc.map((d) => d.id) })}
          <div className="grid gap-3">
            <p className="m-0 text-sm font-extrabold">{tr("Điểm dừng tiếp theo?", "Où va-t-on ?", "Where next?")}</p>
            {diDuoc.map((d) => {
              const { Icon, ten } = LOAI[d.loai], heSo = heSoSao(d.sao);
              return (
                <button key={d.id} type="button" onClick={() => veDich(d.id)}
                  className="mcf-cau-vao flex cursor-pointer gap-3 rounded-2xl border-2 border-solid border-[#7c2d12] bg-[#fef3c7] p-3 text-left font-sans text-[#431407] shadow-[0_8px_18px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#7c2d12] text-[#fef3c7]"><Icon size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2"><span lang="fr" className="text-base font-extrabold">{d.ten}</span>{tem[d.id] != null && <Stamp size={16} className="shrink-0 text-[#b91c1c]" aria-label={tr("Đã có tem", "Tampon obtenu", "Stamped")} />}</span>
                    <span className="block text-xs leading-snug">{d.mo}</span>
                    <span className="mt-1 flex items-center gap-2 text-[11px] font-bold text-[#9a3412]">{ten()}<span className="rounded-full bg-[#7c2d12] px-1.5 py-0.5"><Sao n={d.sao} /></span>{heSo > 1 && <span>{tr("điểm", "pts", "pts")} ×{String(heSo).replace(".", ",")}</span>}<span className="ml-auto">{cauCua(d.id, muc).length > 1 ? tr("2 câu", "2 questions", "2 questions") : tr("1 câu", "1 question", "1 question")}</span></span>
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
      <LoiLeon cam={dung.current.dung > 0 ? "cuoi-lon" : "co-len"}>{dung.current.dung > 0 ? tr(`Đúng ${dung.current.dung}/${ds.length} câu, tem của ${noi.ten} đã vào hộ chiếu!`, `${dung.current.dung}/${ds.length} : le tampon de ${noi.ten} est dans le passeport !`, `${dung.current.dung}/${ds.length}: the ${noi.ten} stamp is in your passport!`) : tr("Lần này chưa có tem, nhưng chuyến đi vẫn tiếp tục.", "Pas de tampon cette fois, le voyage continue.", "No stamp this time, the trip goes on.")}</LoiLeon>
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
          <p className="m-0 rounded-xl bg-amber-400/90 p-2 text-center text-xs font-extrabold text-[#140b33]">{tr("Bạn", "Vous", "You")} · {kq.current.dung}</p>
          <span className="relative grid h-14 w-14 place-items-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden><circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" stroke="rgba(255,255,255,0.15)" /><circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeLinecap="round" stroke={con <= 5 ? "#f87171" : "#fbbf24"} strokeDasharray="94.2" strokeDashoffset={94.2 * (1 - con / GIAY)} /></svg>
            <span className="text-sm font-extrabold tabular-nums">{con}</span>
          </span>
          <p className="m-0 rounded-xl bg-white/15 p-2 text-center text-xs font-extrabold">Minette · {minette}</p>
        </div>
        <div className="mt-4 flex items-center gap-1.5" aria-hidden>
          {ds.map((_, k) => <span key={k} className={`h-2 flex-1 rounded-full ${k < i ? "bg-amber-400" : k === i ? "bg-white" : "bg-white/15"}`} />)}
        </div>
        <div className="mt-4 rounded-2xl border-2 border-solid border-violet-400/60 bg-[#22145a] px-5 py-6 text-center shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          <p lang={c.muc === "de" ? undefined : "fr"} className="m-0 text-xl font-extrabold leading-snug">{c.q}</p>
        </div>
        <CauTracNghiem key={c.q} pa={c.pa} onTra={tra} daChon={chon} laPhap kieu="tv" />
        {chon != null && <>
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

  const thang = thangTour(kq.current.dung, kq.current.tong);
  return (
    <div className={nen}>
      <p className="m-0 text-center text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Le Grand Quiz de France</p>
      <div className="mt-4 flex items-center justify-center gap-8 text-center">
        <div><p className="m-0 text-xs font-bold text-white/70">{tr("Bạn", "Vous", "You")}</p><p className="m-0 text-3xl font-extrabold tabular-nums">{kq.current.dung}/{kq.current.tong}</p></div>
        <span className="text-xl font-black text-white/50">VS</span>
        <div><p className="m-0 text-xs font-bold text-white/70">Minette</p><p className="m-0 text-3xl font-extrabold tabular-nums">{minette}</p></div>
      </div>
      <div className="mx-auto mt-4 max-w-sm">{banDo({ nhan: [GOC] })}</div>
      <LoiLeon cam={thang ? "cuoi-lon" : "co-len"}>{thang ? LOI_MUC[muc].thang : LOI_MUC[muc].thua}</LoiLeon>
      <div className="mt-5 text-right">
        <button type="button" onClick={() => onXong({ diem: kq.current.diem, dung: kq.current.dung, tong: kq.current.tong })}
          className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#140b33]">{tr("Lưu điểm", "Enregistrer", "Save score")} →</button>
      </div>
    </div>
  );
}
