import React, { useEffect, useMemo, useRef, useState } from "react";
import { Gavel, Scale, BookOpen, Check, ChevronLeft, ChevronRight, Undo2, MessageCircleQuestion, FileText, Flag } from "lucide-react";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import { Leon } from "../../../shared/leon.jsx";
import { LUAT, CHUONG, VU_TOA } from "../../../content/troChoi/phienToa.js";
import { PhaoGiay } from "../doVui/Minette.jsx";
import BoLuat from "./BoLuat.jsx";
import { UY_TIN_DAU, SO_BOI_THAM, PHIEU_THANG, DIEM_NHAT, DIEM_UY_TIN, THUONG_THANG, SO_HOI, DIEM_MAU, dongHien, trinhDung, chuongCo, tachDong, viTriLoi, dongDaSua, chamDung, tongNhat, chonTuDe, chonLuat, chonSua, khopSua, giayDoc, phieuThuan, thangToa, diemCuoi } from "./luat.js";

/* Phiên toà (31/10): tranh tụng theo nhịp. Nhân chứng khai từng dòng, người chơi hô OBJECTION rồi đi ba nhát:
   chỉ từ sai, viện điều luật, sửa lại. Hỏi thêm làm lộ dòng khai ẩn, trình tang vật phá mâu thuẫn; cả hai không bắt buộc nhưng thêm phiếu.
   Bản 60 giây cũ vẫn ở DungSai, chọn ở chế độ « Phiên nhanh ». */
const nen = "relative mt-6 overflow-hidden rounded-[2rem] bg-[#1d0f17] bg-[radial-gradient(ellipse_at_top,#6b1730_0,transparent_62%)] p-4 text-white sm:p-5";
const nutChinh = "cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2a1020]";

const LoiLeon = ({ cam = "lam-viec", children }) => (
  <div className="mcf-cau-vao mt-3 flex items-start gap-3">
    <Leon cam={cam} size={54} className="shrink-0" />
    <p className="m-0 rounded-3xl rounded-tl-md bg-white/10 px-4 py-3 text-sm leading-relaxed">{children}</p>
  </div>
);

/* Nhân chứng vẽ bằng SVG: bị bắt lỗi thì mắt tròn, đổ mồ hôi. */
const NhanChung = ({ mau, loi, size = 64 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className={`shrink-0 ${loi ? "mcf-rung" : "mcf-pt-tho"}`}>
    <path d="M10 64c2-16 12-22 22-22s20 6 22 22z" fill={mau} />
    <circle cx="32" cy="27" r="16" fill="#fcd9b6" />
    <path d="M15 26c0-14 9-18 17-18s17 4 17 18c-4-6-9-9-17-9s-13 3-17 9z" fill="#3b2417" />
    {loi
      ? <g fill="#1d0f17"><circle cx="26" cy="28" r="3" /><circle cx="38" cy="28" r="3" /><ellipse cx="32" cy="37" rx="2.5" ry="3" /></g>
      : <g fill="none" stroke="#1d0f17" strokeWidth="2" strokeLinecap="round"><path d="M23 28h5M36 28h5" /><path d="M28 37q4 2 8 0" /></g>}
    {loi && <path d="M49 22c2 3 3 5 1 6s-3-1-1-6z" fill="#7dd3fc" />}
  </svg>
);

/* Bảy ghế bồi thẩm: vàng là đang nghiêng về bạn. */
const BoiTham = ({ phieu, moLan }) => (
  <div className="flex items-center gap-1.5" role="img" aria-label={tr(`${phieu}/${SO_BOI_THAM} bồi thẩm nghiêng về bạn`, `${phieu}/${SO_BOI_THAM} jurés pour vous`, `${phieu}/${SO_BOI_THAM} jurors for you`)}>
    {Array.from({ length: SO_BOI_THAM }, (_, k) => (
      <span key={`${k}-${k < phieu}`} style={moLan ? { animationDelay: `${k * 0.18}s` } : undefined} className={`h-5 w-3.5 rounded-t-full ${moLan ? "mcf-sao-no" : "mcf-nay"} ${k < phieu ? "bg-amber-400" : "bg-white/20"}`} />
    ))}
  </div>
);

export default function PhienToa({ muc = "vua", he, onXong }) {
  const vu = VU_TOA[0];
  const tongSo = useMemo(() => tongNhat(vu), [vu]);
  const [buoc, setBuoc] = useState("mo");       // mo | khai | phan | tang | boLuat | luat | sua | sauLoi | chuyen | ket
  const [nc, setNc] = useState(0);              // nhân chứng đang khai
  const [d, setD] = useState(0);                // dòng đang khai
  const [daPha, setDaPha] = useState({});       // "nc:id": lời khai đã bị phá, hoặc mâu thuẫn đã bị phá
  const [daHoi, setDaHoi] = useState({});       // { nc: { chỉ số dòng: true } }
  const [luotHoi, setLuotHoi] = useState(SO_HOI);
  const [tang, setTang] = useState(() => vu.tangVat);
  const [hoiLuc, setHoiLuc] = useState(null);   // câu luật sư vừa hỏi
  const [uy, setUy] = useState(UY_TIN_DAU);
  const [bao, setBao] = useState(null);         // lời toà sau mỗi lượt: { cam, chu }
  const [no, setNo] = useState(0);              // tăng mỗi lần hô OBJECTION để chữ đập lại từ đầu
  const [dsLuat, setDsLuat] = useState([]);
  const [dsSua, setDsSua] = useState([]);
  const [go, setGo] = useState("");
  const [ketQua, setKetQua] = useState(null);   // { luat, sua } của lỗi vừa phá
  const kq = useRef({ diem: 0, dung: 0, tong: 0 });

  const N = vu.nhanChung[nc], ds = useMemo(() => dongHien(N, daHoi[nc]), [N, daHoi, nc]);
  const dong = ds[d], khoa = `${nc}:${dong.id}`, daSua = !!dong.loi && !!daPha[khoa], daMau = !!dong.mau && !!daPha[khoa];
  const conLoi = ds.some((x) => x.loi && !daPha[`${nc}:${x.id}`]);
  const tuDe = useMemo(() => chonTuDe(dong), [dong]);
  const phieu = phieuThuan(kq.current.dung, tongSo, uy);

  const ketThuc = () => { setBuoc("ket"); phat(thangToa(phieu) ? "thang" : "thua"); };
  const matUy = (chu) => {
    const m = uy - 1;
    setUy(m); phat("sai");
    if (m <= 0) { setBuoc("ket"); return true; }
    setBao({ cam: "co-len", chu });
    return false;
  };
  const tiep = () => {
    setBao(null); setHoiLuc(null);
    if (d + 1 < ds.length) { setD(d + 1); return; }
    ketThamVan();
  };
  const ketThamVan = () => {
    if (conLoi) {
      setD(0);
      if (muc === "de") setBao({ cam: "suy-nghi", chu: tr("Còn sơ hở chưa bị phát hiện. Nhân chứng khai lại từ đầu.", "Il reste une faille. Le témoin reprend.", "A flaw remains. The witness starts over.") });
      else matUy(tr("Bạn để lọt sơ hở, toà mất kiên nhẫn. Nhân chứng khai lại, bạn mất 1 uy tín.", "Une faille vous a échappé : -1 crédibilité.", "You missed a flaw: -1 credibility."));
      return;
    }
    setHoiLuc(null);
    if (nc + 1 < vu.nhanChung.length) { setBuoc("chuyen"); return; }
    ketThuc();
  };
  const hoiThem = () => {
    setLuotHoi(luotHoi - 1); setBao(null);
    const i = Number(dong.id);
    if (!dong.them || dong.laThem || daHoi[nc]?.[i]) {
      setHoiLuc(null);
      setBao({ cam: "suy-nghi", chu: tr("Nhân chứng không có gì để nói thêm ở dòng này.", "Le témoin n'a rien à ajouter ici.", "The witness has nothing to add here.") });
      return;
    }
    phat("lat");
    setDaHoi({ ...daHoi, [nc]: { ...daHoi[nc], [i]: true } }); setHoiLuc(dong.them.hoi); setD(d + 1);
    if (dong.them.tang && !tang.includes(dong.them.tang)) {
      setTang([...tang, dong.them.tang]);
      setBao({ cam: "tuyet-voi", chu: tr(`Tang vật mới: ${vu.tang[dong.them.tang].ten}. Mở mục Tang vật để đọc.`, `Nouvelle pièce : ${vu.tang[dong.them.tang].ten}.`, `New exhibit: ${vu.tang[dong.them.tang].ten}.`) });
    }
  };
  const trinh = (id) => {
    kq.current.tong++;
    setBuoc("khai");
    if (!trinhDung(dong, id)) { matUy(tr("Tang vật này không liên quan tới dòng khai đó. Toà bác, mất 1 uy tín.", "Cette pièce ne prouve rien ici : -1 crédibilité.", "That exhibit proves nothing here: -1 credibility.")); return; }
    kq.current.dung++; kq.current.diem += DIEM_MAU; phat("combo");
    setDaPha({ ...daPha, [khoa]: true }); setNo(no + 1);
    setBao({ cam: "tuyet-voi", chu: dong.mau.gt });
  };
  const tiepMoi = useRef(tiep);
  tiepMoi.current = tiep;

  // Mức Khó: lời khai tự chạy, lỡ là qua.
  const giay = giayDoc(daSua ? dongDaSua(dong) : dong.van, he?.gio ?? 1) + (hoiLuc ? 3 : 0);
  useEffect(() => {
    if (buoc !== "khai" || muc !== "kho") return undefined;
    const t = setTimeout(() => tiepMoi.current(), giay * 1000);
    return () => clearTimeout(t);
  }, [buoc, muc, nc, d, uy, giay, daPha]);

  const hoPhanDoi = () => { setBao(null); setNo(no + 1); setGo(""); phat("canhBao"); setBuoc("phan"); };
  const chamTu = (k) => {
    kq.current.tong++;
    if (!chamDung(dong, k)) {
      setBuoc("khai");
      matUy(dong.loi ? tr("Dòng này có lỗi, nhưng không phải từ đó. Phản đối bị bác, mất 1 uy tín.", "Pas ce mot-là. Objection rejetée : -1 crédibilité.", "Not that word. Overruled: -1 credibility.") : tr("Dòng này không có lỗi. Phản đối bị bác, mất 1 uy tín.", "Cette phrase est correcte. Objection rejetée : -1 crédibilité.", "That line is correct. Overruled: -1 credibility."));
      return;
    }
    kq.current.dung++; kq.current.diem += DIEM_NHAT; phat("dung");
    setDsLuat(chonLuat(dong.loi.luat, muc)); setKetQua({}); setBuoc("luat");
  };
  const vien = (ma) => {
    const ok = ma === dong.loi.luat;
    kq.current.tong++;
    if (ok) { kq.current.dung++; kq.current.diem += DIEM_NHAT; }
    phat(ok ? "dung" : "sai");
    setKetQua({ luat: ok }); setDsSua(chonSua(dong.loi)); setBuoc("sua");
  };
  const sua = (dap) => {
    const ok = khopSua(dap, dong.loi.dung);
    kq.current.tong++;
    if (ok) { kq.current.dung++; kq.current.diem += DIEM_NHAT; }
    phat(ok && ketQua.luat ? "combo" : ok ? "dung" : "sai");
    setKetQua({ ...ketQua, sua: ok }); setDaPha({ ...daPha, [khoa]: true }); setBuoc("sauLoi");
  };
  const sauLoi = () => {
    setBuoc("khai");
    if (!conLoi) setBao({ cam: "lam-viec", chu: tr("Hết lỗi đang thấy. Bạn có thể hỏi thêm, trình tang vật, hoặc kết thúc thẩm vấn.", "Plus de faute visible. Questionnez encore ou terminez.", "No visible errors left. Ask more or finish.") });
  };
  const moiNhanChung = () => { setNc(nc + 1); setD(0); setBao(null); setHoiLuc(null); setLuotHoi(SO_HOI); setBuoc("khai"); };

  const dauToa = (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
      <span lang="fr" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-amber-300"><Scale size={14} />{vu.ten}</span>
      <span className="flex items-center gap-3">
        <span className="flex items-center gap-1" aria-label={tr(`Uy tín ${uy}/${UY_TIN_DAU}`, `Crédibilité ${uy}/${UY_TIN_DAU}`, `Credibility ${uy}/${UY_TIN_DAU}`)}>
          {Array.from({ length: UY_TIN_DAU }, (_, k) => <Scale key={k} size={14} className={k < uy ? "text-amber-300" : "text-white/20"} />)}
        </span>
        <span className="tabular-nums">{kq.current.diem}</span>
      </span>
      <div className="w-full"><BoiTham phieu={phieu} /></div>
    </div>
  );
  const nguoiKhai = (loi) => (
    <div className="flex items-center gap-3">
      <NhanChung key={`${nc}-${loi}`} mau={N.mau} loi={loi} />
      <div className="min-w-0"><p lang="fr" className="m-0 text-sm font-extrabold">{N.ten}</p><p className="m-0 text-xs text-white/70">{N.vai} · {tr("dòng", "ligne", "line")} {d + 1}/{ds.length}</p></div>
    </div>
  );
  const toGiay = (noiDung, them = "") => <div className={`mt-3 rounded-sm bg-[#fbf6ea] px-5 py-4 text-[#1f2937] shadow-[0_12px_26px_rgba(0,0,0,0.4)] ${them}`}>{noiDung}</div>;

  if (buoc === "boLuat") return <div className={nen}><BoLuat muc={muc} onDong={() => setBuoc("khai")} /></div>;

  if (buoc === "tang") return (
    <div className={nen}>
      {dauToa}
      <p className="m-0 text-sm font-extrabold text-amber-300">{tr("Trình tang vật nào cho dòng khai này?", "Quelle pièce présenter ?", "Which exhibit do you present?")}</p>
      {toGiay(<p lang="fr" className="m-0 text-base font-semibold">{daSua ? dongDaSua(dong) : dong.van}</p>)}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {tang.map((id) => (
          <button key={id} type="button" onClick={() => trinh(id)} className="mcf-cau-vao flex cursor-pointer gap-3 rounded-xl border-2 border-solid border-[#a08868] bg-[#fbf6ea] p-3 text-left font-sans text-[#2a1020] hover:-translate-y-0.5">
            <FileText size={20} className="mt-0.5 shrink-0 text-[#7f1d1d]" />
            <span><span lang="fr" className="block text-sm font-extrabold">{vu.tang[id].ten}</span><span lang="fr" className="block text-sm">{vu.tang[id].van}</span>{muc === "de" && <span className="block text-xs text-[#6b5a45]">{vu.tang[id].dich}</span>}</span>
          </button>
        ))}
      </div>
      <p className="m-0 mt-3 text-center text-xs text-white/75">{tr("Trình sai mất 1 uy tín. Chỉ xem thì bấm Thu lại.", "Une pièce hors sujet coûte 1 crédibilité.", "A wrong exhibit costs 1 credibility.")}</p>
      <div className="mt-3 text-center"><button type="button" onClick={() => setBuoc("khai")} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-white/10 px-4 py-2 font-sans text-xs font-bold text-white"><Undo2 size={14} />{tr("Thu lại", "Reprendre", "Take back")}</button></div>
    </div>
  );

  if (buoc === "mo") return (
    <div className={nen}>
      <p className="m-0 text-center text-xs font-bold uppercase tracking-[0.3em] text-amber-300">La cour</p>
      <h2 lang="fr" className="m-0 mt-2 text-center text-2xl font-extrabold">{vu.ten}</h2>
      <LoiLeon>{vu.mo}</LoiLeon>
      <ol className="m-0 mt-4 grid list-none gap-2 p-0 text-xs leading-snug text-white/85 sm:grid-cols-3">
        {[tr("Chỉ đúng từ sai trong lời khai.", "Montrez le mot fautif.", "Point at the wrong word."), tr("Viện đúng điều luật bị vi phạm.", "Citez le bon article.", "Cite the right article."), tr("Sửa lại cho đúng.", "Corrigez la phrase.", "Correct the sentence.")].map((x, k) => (
          <li key={k} className="flex gap-2 rounded-xl bg-white/10 p-2.5"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-400 text-[11px] font-black text-[#2a1020]">{k + 1}</span>{x}</li>
        ))}
      </ol>
      <p className="m-0 mt-3 text-center text-xs text-white/75">{tr(`Phản đối nhầm mất 1 uy tín, hết ${UY_TIN_DAU} uy tín là thua phiên. Cần ${PHIEU_THANG}/${SO_BOI_THAM} phiếu bồi thẩm để thắng.`, `Objection infondée : -1 crédibilité. Il faut ${PHIEU_THANG}/${SO_BOI_THAM} voix.`, `A wrong objection costs 1 credibility. You need ${PHIEU_THANG}/${SO_BOI_THAM} votes.`)}</p>
      <div className="mt-4 text-center"><button type="button" onClick={() => { phat("batDau"); setBuoc("khai"); }} className={nutChinh}><Gavel size={16} className="mr-2 inline" />{tr("Khai mạc phiên toà", "Ouvrir l'audience", "Open the hearing")}</button></div>
    </div>
  );

  if (buoc === "khai") return (
    <div className={nen}>
      {dauToa}
      {nguoiKhai(daMau)}
      {hoiLuc && <p lang="fr" className="mcf-cau-vao m-0 mt-3 ml-auto w-fit rounded-2xl rounded-br-sm bg-amber-400/90 px-3 py-1.5 text-sm font-bold text-[#2a1020]">{hoiLuc}</p>}
      {toGiay(<>
        <p key={dong.id} lang="fr" className={`mcf-cau-vao m-0 text-lg font-semibold leading-snug ${daSua ? "text-emerald-800" : daMau ? "text-red-800 line-through" : ""}`}>{daSua ? dongDaSua(dong) : dong.van}</p>
        {muc === "de" && <p className="m-0 mt-2 text-sm text-[#6b5a45]">{dong.dich}</p>}
        {daMau && <span key={no} className="mcf-dong mt-2 inline-block rounded-md border-4 border-double border-red-700 px-2 py-0.5 text-xs font-black uppercase tracking-widest text-red-700">{tr("Mâu thuẫn", "Contradiction", "Contradiction")}</span>}
      </>)}
      {muc === "kho" && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden><div key={`${nc}-${d}-${uy}`} className="mcf-pt-gio h-full bg-amber-400" style={{ animationDuration: `${giay}s` }} /></div>}
      {bao && <LoiLeon cam={bao.cam}>{bao.chu}</LoiLeon>}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {muc !== "kho" && <button type="button" disabled={d === 0} onClick={() => { setBao(null); setD(d - 1); }} aria-label={tr("Dòng trước", "Ligne précédente", "Previous line")} className={`grid h-11 w-11 place-items-center rounded-full border-0 bg-white/15 text-white ${d === 0 ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}><ChevronLeft size={20} /></button>}
        <button type="button" disabled={daSua} onClick={hoPhanDoi} className={`rounded-xl border-0 bg-red-600 px-7 py-3 font-sans text-lg font-black tracking-widest text-white shadow-[0_6px_0_#7f1d1d] active:translate-y-1 active:shadow-none ${daSua ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>OBJECTION!</button>
        {muc !== "kho" && <button type="button" onClick={tiep} aria-label={tr("Dòng sau", "Ligne suivante", "Next line")} className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white"><ChevronRight size={20} /></button>}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button type="button" disabled={luotHoi < 1} onClick={hoiThem} className={`flex items-center gap-1.5 rounded-full border-0 px-3 py-2 font-sans text-xs font-extrabold ${luotHoi < 1 ? "cursor-not-allowed bg-white/5 text-white/30" : "cursor-pointer bg-sky-500/30 text-white hover:bg-sky-500/50"}`}><MessageCircleQuestion size={14} />{tr("Hỏi thêm", "Presser", "Press")} ({luotHoi})</button>
        <button type="button" disabled={daMau} onClick={() => { setBao(null); setBuoc("tang"); }} className={`flex items-center gap-1.5 rounded-full border-0 px-3 py-2 font-sans text-xs font-extrabold ${daMau ? "cursor-not-allowed bg-white/5 text-white/30" : "cursor-pointer bg-white/15 text-white hover:bg-white/25"}`}><FileText size={14} />{tr("Tang vật", "Pièces", "Exhibits")} ({tang.length})</button>
        {muc !== "kho" && <button type="button" onClick={() => setBuoc("boLuat")} className="flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-white/15 px-3 py-2 font-sans text-xs font-extrabold text-white hover:bg-white/25"><BookOpen size={14} />{tr("Bộ luật", "Le Code", "The Code")}</button>}
        {!conLoi && <button type="button" onClick={ketThamVan} className="flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-amber-400 px-3 py-2 font-sans text-xs font-extrabold text-[#2a1020]"><Flag size={14} />{tr("Kết thúc thẩm vấn", "Fin de l'interrogatoire", "End questioning")}</button>}
      </div>
    </div>
  );

  if (buoc === "phan") return (
    <div className={nen}>
      <span key={no} aria-hidden className="mcf-pt-obj pointer-events-none absolute inset-x-0 top-1/3 z-10 text-center text-5xl font-black tracking-wider text-red-500 sm:text-7xl">OBJECTION!</span>
      {dauToa}
      {nguoiKhai(false)}
      <p className="m-0 mt-3 text-sm font-extrabold text-amber-300">1 · {tr("Từ nào sai?", "Quel mot est fautif ?", "Which word is wrong?")}</p>
      {toGiay(<div lang="fr" className="flex flex-wrap gap-x-1.5 gap-y-2 text-lg font-semibold">
        {muc === "de"
          ? tachDong(dong.van).map((t, k) => <span key={k}>{t.chu}</span>)
          : tachDong(dong.van).map((t, k) => <button key={k} type="button" onClick={() => chamTu(k)} className="cursor-pointer rounded-md border-0 bg-transparent px-1 font-sans text-lg font-semibold text-[#1f2937] underline decoration-dotted decoration-[#a08868] underline-offset-4 hover:bg-amber-200">{t.chu}</button>)}
      </div>)}
      {muc === "de" && <div className="mt-3 flex flex-wrap justify-center gap-2">{tuDe.map((t) => <button key={t.k} type="button" lang="fr" onClick={() => chamTu(t.k)} className="cursor-pointer rounded-xl border-0 bg-white/15 px-5 py-2.5 font-sans text-base font-bold text-white hover:bg-white/25">{t.goc}</button>)}</div>}
      <div className="mt-4 text-center"><button type="button" onClick={() => setBuoc("khai")} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-white/10 px-4 py-2 font-sans text-xs font-bold text-white"><Undo2 size={14} />{tr("Rút phản đối", "Retirer l'objection", "Withdraw")}</button></div>
    </div>
  );

  if (buoc === "luat") return (
    <div className={nen}>
      {dauToa}
      <p className="m-0 text-sm font-extrabold text-amber-300">2 · {tr(`Từ « ${dong.loi.tu} » phạm điều luật nào?`, `Quel article cite-t-on contre « ${dong.loi.tu} » ?`, `Which article does "${dong.loi.tu}" break?`)}</p>
      {muc === "kho"
        ? <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-xl bg-[#fbf6ea] p-3 text-[#2a1020]">
            {chuongCo(dsLuat).map((c) => (
              <section key={c} className="mb-3 last:mb-0">
                <h3 lang="fr" className="m-0 text-xs font-black uppercase tracking-wider text-[#7f1d1d]">{CHUONG[c]}</h3>
                <div className="mt-1 grid gap-1 sm:grid-cols-2">{dsLuat.filter((ma) => LUAT[ma].chuong === c).map((ma) => <button key={ma} type="button" lang="fr" onClick={() => vien(ma)} className="cursor-pointer rounded-lg border-0 bg-transparent px-2 py-1.5 text-left font-sans text-sm font-bold text-[#2a1020] hover:bg-amber-200">{LUAT[ma].so}. {LUAT[ma].ten}</button>)}</div>
              </section>
            ))}
          </div>
        : <div className="mt-3 grid gap-3">
            {dsLuat.map((ma) => (
              <button key={ma} type="button" onClick={() => vien(ma)} className="mcf-cau-vao flex cursor-pointer gap-3 rounded-xl border-2 border-solid border-[#a08868] bg-[#fbf6ea] p-3 text-left font-sans text-[#2a1020] hover:-translate-y-0.5">
                <BookOpen size={20} className="mt-0.5 shrink-0 text-[#7f1d1d]" />
                <span><span lang="fr" className="block text-sm font-extrabold">Article {LUAT[ma].so} · {LUAT[ma].ten}</span><span className="block text-xs leading-snug">{LUAT[ma].mo}</span></span>
              </button>
            ))}
          </div>}
    </div>
  );

  if (buoc === "sua") return (
    <div className={nen}>
      {dauToa}
      <p className="m-0 flex items-center gap-2 text-sm font-extrabold text-amber-300">3 · {tr("Sửa lại cho đúng", "Corrigez", "Correct it")}</p>
      {toGiay(<p lang="fr" className="m-0 text-lg font-semibold">{tachDong(dong.van).map((t, k) => <React.Fragment key={k}>{k === viTriLoi(dong) ? <span className="rounded bg-red-200 px-1 text-red-800 line-through">{t.chu}</span> : t.chu}{" "}</React.Fragment>)}</p>)}
      {!ketQua.luat && <LoiLeon cam="co-len">{tr(`Điều luật đúng là Article ${LUAT[dong.loi.luat].so}: ${LUAT[dong.loi.luat].mo}`, `Le bon article est le ${LUAT[dong.loi.luat].so}.`, `The right article is ${LUAT[dong.loi.luat].so}.`)}</LoiLeon>}
      {muc === "kho"
        ? <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (go.trim()) sua(go); }}>
            <input autoFocus lang="fr" value={go} onChange={(e) => setGo(e.target.value)} autoComplete="off" spellCheck={false} aria-label={tr("Từ đúng", "Le mot correct", "The correct word")} className="min-w-0 flex-1 rounded-xl border-2 border-solid border-amber-300 bg-[#fbf6ea] px-4 py-2.5 font-sans text-base font-bold text-[#1f2937] outline-none" />
            <button type="submit" className={nutChinh}>{tr("Nộp", "Valider", "Submit")}</button>
          </form>
        : <div className="mt-4 flex flex-wrap justify-center gap-2">{dsSua.map((x) => <button key={x} type="button" lang="fr" onClick={() => sua(x)} className="cursor-pointer rounded-xl border-0 bg-white/15 px-6 py-2.5 font-sans text-base font-bold text-white hover:bg-white/25">{x}</button>)}</div>}
    </div>
  );

  if (buoc === "sauLoi") return (
    <div className={nen}>
      {ketQua.luat && ketQua.sua && <PhaoGiay />}
      {dauToa}
      {nguoiKhai(true)}
      {toGiay(<>
        <p lang="fr" className="m-0 text-lg font-semibold text-emerald-800">{dongDaSua(dong)}</p>
        <span className="mcf-dong mt-2 inline-block rounded-md border-4 border-double border-red-700 px-2 py-0.5 text-xs font-black uppercase tracking-widest text-red-700">{tr("Lời khai bị bác", "Témoignage rejeté", "Testimony rejected")}</span>
      </>)}
      <LoiLeon cam={ketQua.luat && ketQua.sua ? "tuyet-voi" : "co-len"}>
        {ketQua.luat && ketQua.sua ? tr("Đủ cả ba nhát! ", "Trois coups parfaits ! ", "All three strikes! ") : ""}
        {!ketQua.sua && <>{tr("Dạng đúng là ", "La bonne forme est ", "The right form is ")}<strong lang="fr">{dong.loi.dung}</strong>. </>}
        {dong.loi.gt}
      </LoiLeon>
      <div className="mt-4 text-right"><button type="button" onClick={sauLoi} className={nutChinh}>{tr("Tiếp tục", "Continuer", "Continue")} →</button></div>
    </div>
  );

  if (buoc === "chuyen") {
    const sau = vu.nhanChung[nc + 1];
    return (
      <div className={nen}>
        {dauToa}
        <LoiLeon cam="lam-viec">{sau.gioiThieu}</LoiLeon>
        <div className="mt-3 flex justify-center"><NhanChung mau={sau.mau} size={84} /></div>
        <div className="mt-4 text-right"><button type="button" onClick={moiNhanChung} className={nutChinh}>{tr("Mời nhân chứng", "Appeler le témoin", "Call the witness")} →</button></div>
      </div>
    );
  }

  const thang = thangToa(phieu), tongDiem = diemCuoi(kq.current.diem, uy, thang);
  return (
    <div className={nen}>
      {thang && <PhaoGiay nhieu />}
      <p className="m-0 text-center text-xs font-bold uppercase tracking-[0.3em] text-amber-300">{tr("Phán quyết", "Le verdict", "Verdict")}</p>
      <Gavel size={46} className="mcf-pt-bua mx-auto mt-3 block text-amber-300" aria-hidden />
      <p className="mcf-sao-no m-0 mt-2 text-center text-3xl font-black uppercase tracking-widest" style={{ animationDelay: "1.4s" }}>{thang ? "Non coupable" : "Coupable"}</p>
      <div className="mt-3 flex justify-center"><BoiTham phieu={phieu} moLan /></div>
      <p className="m-0 mt-2 text-center text-xs text-white/75 tabular-nums">{tr(`${phieu}/${SO_BOI_THAM} phiếu cho bị cáo ${vu.bi_cao}`, `${phieu}/${SO_BOI_THAM} voix pour ${vu.bi_cao}`, `${phieu}/${SO_BOI_THAM} votes for ${vu.bi_cao}`)}</p>
      <LoiLeon cam={thang ? "tuyet-voi" : "co-len"}>{thang ? vu.thang : vu.thua}</LoiLeon>
      <dl className="mx-auto mt-4 grid max-w-xs grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
        <dt className="text-white/70">{tr(`Nhát đúng ${kq.current.dung}/${kq.current.tong}`, `${kq.current.dung}/${kq.current.tong} coups justes`, `${kq.current.dung}/${kq.current.tong} right`)}</dt><dd className="m-0 text-right font-bold tabular-nums">{kq.current.diem}</dd>
        <dt className="text-white/70">{tr(`${uy} uy tín còn lại`, `${uy} crédibilité`, `${uy} credibility left`)}</dt><dd className="m-0 text-right font-bold tabular-nums">+{uy * DIEM_UY_TIN}</dd>
        {thang && <><dt className="text-white/70">{tr("Thưởng thắng kiện", "Affaire gagnée", "Case won")}</dt><dd className="m-0 text-right font-bold tabular-nums">+{THUONG_THANG}</dd></>}
        <dt className="font-extrabold text-amber-300">{tr("Tổng", "Total", "Total")}</dt><dd className="m-0 text-right font-extrabold tabular-nums text-amber-300">{tongDiem}</dd>
      </dl>
      <div className="mt-5 text-right"><button type="button" onClick={() => onXong({ diem: tongDiem, dung: kq.current.dung, tong: Math.max(1, kq.current.tong) })} className={nutChinh}><Check size={15} className="mr-1.5 inline" />{tr("Lưu điểm", "Enregistrer", "Save score")}</button></div>
    </div>
  );
}
