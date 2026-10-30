import React, { useRef, useState } from "react";
import { Lock, CircleCheck, Search, MapPin, NotebookPen, CircleHelp, UserRound, Languages, Lightbulb, Gift, Briefcase, ArrowRight, Eye, Flame } from "lucide-react";
import { VU_AN } from "../../../content/troChoi/thamTu.js";
import { TRO_GIUP_VU, goiYCau } from "../../../content/troChoi/thamTuTroGiup.js";
import { BRUNO, TIN_GIA, KHAI } from "../../../content/troChoi/thamTuSuKien.js";
import { MON, monCua, LaMon, KhayTui, HudVu, HieuUng } from "./TuiDo.jsx";
import TaiLieu from "./TaiLieu.jsx";
import ManSuKien, { SU_KIEN, DemNguoc } from "./SuKien.jsx";
import { BanDo, ThamVan, BangGhim, ChonBangChung } from "./BanDo.jsx";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import { Leon, leonVai } from "../../../shared/leon.jsx";
import CauTracNghiem from "../CauTracNghiem.jsx";
import { UY_TIN_DAU, soMonMangTheo, lyDoKhongDung, batDauVu, sauCanh, sauBuocToiOan, lyDoThua, giuManhKhiSai, laMucDe, hangVu, suKienHopLe, tungSuKien, sauSuKien, doiNghi, ketBuocToi, hangBuocToi, GIAY_KHAN } from "./luat.js";

/* ─────────── 9. Thám tử đọc: « Những vụ án của Thanh tra Léon » ───────────
   Chọn mức xong thì vào BẢNG VỤ ÁN của mức đó; mỗi vụ: mở hồ sơ → các cảnh (đọc tài
   liệu, trả lời) → phá án. Tiến độ (vụ đã phá) chỉ lưu ở trình duyệt: đây là tiện ích
   mở khoá vụ kế tiếp, điểm thật vẫn ghi qua ghi_tro_choi như mọi trò. */
const KHOA_TT = "mcf-tham-tu-v1";
const docTienDo = () => { try { return JSON.parse(localStorage.getItem(KHOA_TT)) || {}; } catch { return {}; } };
const KHOA_KHAN = "mcf-tham-tu-khan";
const docKhan = () => { try { return localStorage.getItem(KHOA_KHAN) !== "0"; } catch { return true; } };
const nhat = (ds) => ds[Math.floor(Math.random() * ds.length)];
/* Nội dung một cản trở, rút một lần lúc nó xảy ra để câu hỏi không đổi giữa chừng. */
const duSuKien = (ma, vu) => {
  if (ma === "bruno") return nhat(BRUNO[vu.muc]);
  if (ma === "tin_gia") return nhat(TIN_GIA[vu.muc]);
  if (ma !== "nhan_chung") return null;
  const that = Math.random() < 0.5, [fr, vi] = KHAI[vu.id][that ? "that" : "gia"];
  return { fr, vi, that };
};
const luuTienDo = (id, diem) => { try { const t = docTienDo(); t[id] = Math.max(t[id] ?? 0, diem); localStorage.setItem(KHOA_TT, JSON.stringify(t)); } catch { /* chế độ riêng tư: bỏ qua */ } };

export default function ThamTu({ muc = "vua", onXong }) {
  const [td, setTd] = useState(docTienDo);
  const [vu, setVu] = useState(null);             // vụ đang chơi
  const [buoc, setBuoc] = useState("mo");         // mo | canh | ket | xong
  const [i, setI] = useState(0);
  const [chon, setChon] = useState(null);
  const [lyDo, setLyDo] = useState(null);         // gio | uy_tin | thoat
  const [sk, setSk] = useState(null);             // cản trở đang diễn ra: { ma, du, chan, mat }
  const [trinh, setTrinh] = useState(null);       // nước đi kế của P.G. đã bị Theo dõi ngầm thấy
  const [choKhan, setChoKhan] = useState(docKhan);   // cho phép đếm ngược ở mức khó
  const daCo = useRef([]);                        // cản trở đã gặp trong vụ này
  const [daDen, setDaDen] = useState([]);         // vụ theo sơ đồ: chỉ số địa điểm đã đến, theo thứ tự
  const [khoa, setKhoa] = useState(null);         // địa điểm P.G. đã khoá
  const [ketQua, setKetQua] = useState(null);     // kết buộc tội: du | thieu
  const [choiLai, setChoiLai] = useState(false);
  const [so, setSo] = useState([]);               // sổ manh mối: chuỗi, hoặc { t, loai: "gia" | "mat" }
  const kq = useRef({ diem: 0, dung: 0, sai: 0 });
  const [hud, setHud] = useState({ gio: 0, uy: UY_TIN_DAU, nghi: 0 });   // đồng hồ vụ án + uy tín
  const [tui, setTui] = useState([]);             // tối đa 3 món đang mang
  const [chonTui, setChonTui] = useState([]);     // món đang chọn ở màn mở hồ sơ
  const [vatChung, setVatChung] = useState(0);    // mỗi câu đúng được 1, Inès tiêu
  const [dungCanh, setDungCanh] = useState({ neo: false, tu: false, goiY: false, an: [], chay: false, khan: false });   // món đã bật ở cảnh này
  const [hieuUng, setHieuUng] = useState(null);
  const [moi, setMoi] = useState(null);           // vị trí món vừa nhận
  const chuoiDung = useRef(0);
  const ds = VU_AN.filter((v) => v.muc === muc);
  const gioDau = vu ? batDauVu(vu).gio : 1;
  const SACH = { neo: false, tu: false, goiY: false, an: [], chay: false, khan: false };

  /* Đưa mọi thứ về đầu vụ: dùng chung cho mở hồ sơ và « Điều tra lại ». */
  const moVu = (v, lai = false) => {
    phat("batDau"); setChoiLai(lai); setDaDen([]); setKhoa(null); setKetQua(null); setVu(v); setBuoc("mo"); setI(0); setChon(null); setSo([]); setHud(batDauVu(v));
    setTui([]); setChonTui([]); setVatChung(0); setDungCanh(SACH); setMoi(null); setSk(null); setTrinh(null); daCo.current = []; chuoiDung.current = 0;
    kq.current = { diem: 0, dung: 0, sai: 0 };
  };

  /* Dùng món ở ô k. Giá trừ ngay, món mất luôn, hiệu ứng chạy 1,3 giây. */
  const dungMon = (k, cau) => {
    const ma = tui[k]; if (!ma) return;
    phat("lat");
    setTui((t) => t.filter((_, j) => j !== k)); setMoi(null);
    setHieuUng(ma); setTimeout(() => setHieuUng(null), 1300);
    if (ma === "kinh") { setHud((h) => ({ ...h, gio: h.gio - 1 })); setDungCanh((d) => ({ ...d, neo: true })); }
    if (ma === "tu") setDungCanh((d) => ({ ...d, tu: true }));
    if (ma === "leon") { setHud((h) => ({ ...h, uy: h.uy - 1 })); setDungCanh((d) => ({ ...d, goiY: true })); }
    if (ma === "cafe") setHud((h) => ({ ...h, gio: h.gio - 2, uy: h.uy + 1 }));
    if (ma === "theo") setTrinh(tungSuKien(vu, nguCanh(), Math.random, true));
    if (ma === "ines") {
      setVatChung((n) => n - 1);
      const sai = cau.pa.map((_, j) => j).filter((j) => j !== 0 && !dungCanh.an.includes(j));
      const bo = sai[Math.floor(Math.random() * sai.length)];
      setTimeout(() => setDungCanh((d) => ({ ...d, an: [...d.an, bo] })), 700);
    }
  };
  const chuaDen = () => vu.canh.map((_, k) => k).filter((k) => !daDen.includes(k));
  const nguCanh = () => ({ nghi: hud.nghi, daCo: daCo.current, conLai: vu.ban ? Math.min(hud.gio, chuaDen().length) : vu.canh.length - (i + 1), soManh: so.filter((m) => typeof m === "string").length, choKhan });
  /* Sang cảnh sau hoặc màn phá án, mang theo hậu quả của cản trở vừa rồi. */
  const sangTiep = () => {
    setDungCanh({ ...SACH, chay: sk?.ma === "chay" && !sk.chan, khan: sk?.ma === "khan" && !sk.chan });
    setSk(null); setTrinh(null);
    if (vu.ban) setBuoc("ban");
    else if (i + 1 >= vu.canh.length) setBuoc("ket"); else { setI(i + 1); setBuoc("canh"); }
  };
  const vaoSuKien = (ma) => {
    daCo.current = [...daCo.current, ma];
    let chan = !!trinh, mat = null, noi = null;
    if (ma === "den_truoc" && vu.ban && !chan) {
      const k = nhat(chuaDen()); noi = vu.canh[k].ten; setKhoa(k);
    }
    if (ma === "trao" && !chan) {
      if (tui.includes("theo")) { chan = true; setTui((t) => t.filter((m) => m !== "theo")); }
      else {
        const con = so.map((m, k) => (typeof m === "string" ? k : -1)).filter((k) => k >= 0);
        const k = nhat(con); mat = so[k];
        setSo((ds) => ds.map((m, j) => (j === k ? { t: m, loai: "mat" } : m)));
        setVatChung((n) => Math.max(0, n - 1));
      }
    }
    setSk({ ma, du: duSuKien(ma, vu), chan, mat, noi }); setBuoc("sukien");
  };
  const chotSuKien = ({ tot, gio = 0, vat = 0, khai }) => {
    setHud((h) => sauSuKien(h, vu, { tot, gio, conLai: vu.ban ? 0 : vu.canh.length - (i + 1) }));
    if (tot === true || vat) setVatChung((n) => n + (tot === true ? 1 : 0) - vat);
    if (tot === false) kq.current.sai++;
    if (khai) setSo((ds) => [...ds, khai.that ? `« ${khai.fr} »` : { t: `« ${khai.fr} »`, loai: "gia" }]);
  };
  const vaoNoi = (k) => {
    setI(k); setChon(null); setDaDen((d) => [...d, k]); setBuoc(vu.canh[k].loai === "hoi" ? "hoi" : "canh");
  };
  const xongThamVan = ({ manh, sai }) => {
    setSo((s) => [...s, ...manh]); kq.current.sai += sai;
    setHud((h) => doiNghi({ ...h, gio: Math.max(0, h.gio - 1) }, sai));
    const ma = trinh ?? tungSuKien(vu, nguCanh());
    if (ma) vaoSuKien(ma); else sangTiep();
  };
  const phucHoi = () => {
    phat("lat"); setVatChung((n) => n - 1); setHieuUng("ines"); setTimeout(() => setHieuUng(null), 1300);
    setDungCanh((d) => ({ ...d, chay: false }));
  };
  const lyDoMon = (ma, cau, troGiup) => lyDoKhongDung(ma, {
    hud, vatChung, daTraLoi: chon != null, coTaiLieu: !!troGiup, soAn: dungCanh.an.length, soPa: cau.pa.length,
    daKinh: dungCanh.neo, daTu: dungCanh.tu, daGoiY: dungCanh.goiY, tr,
    coTheo: buoc === "canh" && !trinh && suKienHopLe(vu, nguCanh()).length > 0,
  });
  const khayTui = (cau, troGiup) => <KhayTui tui={tui} moi={moi} lyDo={(ma) => lyDoMon(ma, cau, troGiup)} onDung={(k) => dungMon(k, cau)} />;
  const ketQuaTroGiup = (cau, troGiup) => <>
    {trinh && <p className="mcf-cau-vao m-0 mt-4 flex items-center gap-2 rounded-2xl bg-[#e2e8f0] px-4 py-3 text-sm text-[#0f172a]"><Eye size={16} className="shrink-0" /><span>{tr("Nước đi kế của P.G.: ", "Prochain coup de P.G. : ", "P.G.'s next move: ")}<b>{SU_KIEN()[trinh]?.ten}</b>. {tr("Ta sẽ đón đầu.", "Nous le déjouerons.", "We'll foil it.")}</span></p>}
    {dungCanh.tu && troGiup && (
      <div className="mcf-tt-sach mt-4 rounded-2xl bg-[#e0f2fe] p-3 text-[#0c4a6e]">
        <p className="m-0 mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider"><Languages size={14} /> {tr("Từ điển Odile", "Dico d'Odile", "Odile's dictionary")}</p>
        <div className="grid gap-1.5 sm:grid-cols-3">
          {troGiup.tu.map(([fr, vi], k) => (
            <p key={fr} style={{ animationDelay: `${0.25 + k * 0.15}s` }} className="mcf-tt-tu m-0 rounded-lg bg-white px-2.5 py-1.5 text-sm"><b lang="fr">{fr}</b><span className="block text-xs">{vi}</span></p>
          ))}
        </div>
      </div>
    )}
    {dungCanh.goiY && (() => { const [dang, loi] = goiYCau(cau.q); return (
      <p className="mcf-cau-vao m-0 mt-4 rounded-2xl bg-[#ffe4e6] px-4 py-3 text-sm text-[#881337]"><Lightbulb size={15} className="mr-1.5 inline align-[-3px]" /><b lang="fr">{dang}</b>: {loi}</p>
    ); })()}
  </>;

  if (!vu) return (
    <div className="mt-6 rounded-[2rem] bg-[#3f3a36] bg-[radial-gradient(#57504a_1px,transparent_1px)] bg-[length:10px_10px] p-5">
      <div className="flex items-start gap-3">
        <Leon cam={leonVai("tham-tu", "kinh-lup")} size={72} className="shrink-0" />
        <p className="m-0 rounded-3xl rounded-tl-md bg-[#fef3c7] px-4 py-3 text-sm text-[#2b2118]">
          {muc === "de" ? tr("Chào trợ lý mới! Ta là Thanh tra Léon. Mấy vụ nhỏ trong khu phố đang chờ chúng ta. Bắt đầu từ hồ sơ số 1 nhé.", "Bienvenue, assistant ! Je suis l'inspecteur Léon. De petites affaires du quartier nous attendent. Commençons par le dossier 1.", "Welcome, assistant! I'm Inspector Léon. Some small neighbourhood cases await. Let's start with case 1.")
            : muc === "vua" ? tr("Gần đây hiện trường nào cũng có một chiếc lông vũ xám và chữ ký « P.G. ». Không phải trùng hợp đâu, trợ lý.", "Ces derniers temps, chaque scène de crime cache une plume grise et la signature « P.G. ». Ce n'est pas un hasard.", "Lately every crime scene has a grey feather and the signature “P.G.”. That's no coincidence.")
            : tr("Đã đến lúc lần ra P.G. Ba hồ sơ cuối, khó nhất. Ta tin ở cậu.", "Il est temps de démasquer P.G. Trois derniers dossiers, les plus durs. Je compte sur vous.", "Time to unmask P.G. Three final cases, the hardest. I'm counting on you.")}
        </p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {ds.map((v, k) => {
          const xong = td[v.id] != null, khoa = k > 0 && td[ds[k - 1].id] == null;
          return (
            <button key={v.id} type="button" disabled={khoa} onClick={() => moVu(v)}
              className="relative cursor-pointer rounded-sm border-0 bg-[#e8d3a5] p-4 pt-6 text-left font-sans text-[#2b2118] shadow-[0_10px_20px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
              <span className="absolute -top-3 left-4 rounded-t-lg bg-[#e8d3a5] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#7c5c2e]">{tr("Hồ sơ", "Dossier", "Case")} {v.so}</span>
              <span lang="fr" className="block text-lg font-bold">{v.ten}</span>
              <span className="mt-1 block text-xs text-[#6b5435]">{v.tenVi}</span>
              <span className="mt-3 block text-xs font-bold">
                {khoa ? <><Lock size={13} className="mr-1 inline align-[-2px]" />{tr("Phá vụ trước để mở", "Résolvez l'affaire précédente", "Solve the previous case")}</> : xong ? <><CircleCheck size={13} className="mr-1 inline align-[-2px]" />{tr("Đã phá", "Résolue", "Solved")} · {td[v.id]}</> : <><Search size={13} className="mr-1 inline align-[-2px]" />{tr("Chưa phá", "À résoudre", "Unsolved")}</>}
              </span>
              {xong && <span className="mcf-dong absolute right-2 top-3 rounded border-2 border-solid border-red-700 px-1 text-[10px] font-black text-red-700">{tr("ĐÃ PHÁ", "RÉSOLU", "SOLVED")}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const khung = (noi, con) => (
    <div className="relative mt-6 overflow-hidden rounded-[2rem] bg-[#3f3a36] bg-[radial-gradient(#57504a_1px,transparent_1px)] bg-[length:10px_10px] p-5">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#e7dcc8]">
        <span><Search size={13} className="mr-1 inline align-[-2px]" />{tr("Hồ sơ", "Dossier", "Case")} {vu.so} · <span lang="fr">{vu.ten}</span></span><span className="tabular-nums">{kq.current.diem} pts</span>
      </div>
      <HudVu hud={hud} gioDau={gioDau} vatChung={vatChung} />
      {hieuUng && <HieuUng key={hieuUng} ma={hieuUng} />}
      {kq.current.sai > 0 && <span key={kq.current.sai} aria-hidden className="mcf-tt-chop pointer-events-none absolute inset-0 z-10 bg-red-600" />}
      {noi && <p className="m-0 mt-2 text-xs font-bold text-amber-300"><MapPin size={13} className="mr-1 inline align-[-2px]" />{noi}</p>}
      {con}
    </div>
  );
  const LoiLeon = ({ cam, children }) => (
    <div className="mcf-cau-vao mt-4 flex items-start gap-3">
      <Leon cam={leonVai("tham-tu", cam)} size={64} className="shrink-0" />
      <p className="m-0 rounded-3xl rounded-tl-md bg-[#fef3c7] px-4 py-3 text-sm leading-relaxed text-[#2b2118]">{children}</p>
    </div>
  );
  const SoManhMoi = () => so.length > 0 && (
    <details className="mt-4 rounded-xl bg-black/25 px-4 py-2 text-sm text-[#fef3c7]" open={buoc === "ket"}>
      <summary className="cursor-pointer font-bold"><NotebookPen size={15} className="mr-1 inline align-[-3px]" />{tr("Sổ manh mối", "Carnet d'indices", "Clue notebook")} ({so.length})</summary>
      <ul className="m-0 mt-2 grid gap-1 pl-5">{so.map((m, k) => (typeof m === "string" ? <li key={k}>{m}</li>
        : m.loai === "mat" ? <li key={k} className="italic text-rose-300">{tr("Manh mối đã bị tráo", "Indice volé", "Clue stolen")}</li>
          : <li key={k}><span className="text-white/50 line-through">{m.t}</span> <span className="text-xs font-bold text-rose-300">{tr("khai giả", "faux témoignage", "false statement")}</span></li>))}</ul>
    </details>
  );

  if (buoc === "mo") return khung(null, <>
    <LoiLeon cam={choiLai && vu.moLai ? "quyet-tam" : "lam-viec"}>{choiLai && vu.moLai ? vu.moLai : vu.mo}</LoiLeon>
    <p className="m-0 mt-5 text-xs font-extrabold uppercase tracking-widest text-[#e7dcc8]">{vu.muc === "kho" && vu.so === 7 ? tr("Giả thuyết", "Hypothèses", "Hypotheses") : tr("Những người liên quan", "Personnes impliquées", "People involved")}</p>
    <div className="mt-2 grid gap-3 sm:grid-cols-3">
      {vu.nghiPham.map((n, k) => (
        <div key={n.ten} className="bg-[#fff] p-3 text-[#1f2937] shadow-md" style={{ rotate: `${[-2, 1.5, -1, 2][k % 4]}deg` }}>
          <div className="grid h-16 place-items-center bg-[#e5e7eb] text-[#9ca3af]" aria-hidden><UserRound size={34} /></div>
          <p lang="fr" className="m-0 mt-2 text-sm font-bold">{n.ten}</p>
          <p className="m-0 text-xs text-[#6b7280]">{n.vai}</p>
        </div>
      ))}
    </div>
    <p className="m-0 mt-5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#e7dcc8]"><Briefcase size={14} /> {tr(`Chọn ${soMonMangTheo(vu)} món mang theo`, `Choisissez ${soMonMangTheo(vu)} outils`, `Pick ${soMonMangTheo(vu)} tools`)} ({chonTui.length}/{soMonMangTheo(vu)})</p>
    <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {MON().filter((m) => !m.hiem).map((m) => {
        const co = chonTui.includes(m.ma);
        return <LaMon key={m.ma} m={m} chon={co} onClick={() => { phat("bam"); setChonTui((t) => (co ? t.filter((x) => x !== m.ma) : t.length < soMonMangTheo(vu) ? [...t, m.ma] : t)); }} />;
      })}
    </div>
    {vu.muc === "kho" && (
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-[#e7dcc8]">
        <input type="checkbox" checked={choKhan} onChange={(e) => { const b = e.target.checked; setChoKhan(b); try { localStorage.setItem(KHOA_KHAN, b ? "1" : "0"); } catch { /* chế độ riêng tư: bỏ qua */ } }} />
        {tr("Cho phép tình huống khẩn có đếm ngược", "Autoriser les urgences chronométrées", "Allow timed emergencies")}
      </label>
    )}
    <div className="mt-5 text-right">
      <button type="button" disabled={chonTui.length < soMonMangTheo(vu)} onClick={() => { phat("bam"); setTui(chonTui); setBuoc(vu.ban ? "ban" : "canh"); }} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118] disabled:cursor-not-allowed disabled:opacity-50">{tr("Điều tra ngay", "Enquêter", "Investigate")} <ArrowRight size={15} className="inline align-[-3px]" /></button>
    </div>
  </>);

  if (buoc === "ban") return khung(tr("Sơ đồ điều tra", "Plan de l'enquête", "Investigation map"), <>
    <BanDo vu={vu} hud={hud} daDen={daDen} khoa={khoa} vatChung={vatChung} onDi={vaoNoi}
      onMoKhoa={() => { setVatChung((n) => n - 1); setKhoa(null); }} onGhim={() => { phat("bam"); setBuoc("ghim"); }} />
    <SoManhMoi />
  </>);
  if (buoc === "hoi") return khung(vu.canh[i].noi, <ThamVan key={i} c={vu.canh[i]} onXong={xongThamVan} />);
  if (buoc === "ghim") return khung(tr("Bảng ghim", "Tableau d'enquête", "Evidence board"), (
    <BangGhim vu={vu} so={so} conDi={hud.gio > 0 && chuaDen().length > 0} onVe={() => setBuoc("ban")}
      onThay={(t) => { setSo((s) => [...s, t]); setVatChung((n) => n + 1); setHud((h) => doiNghi(h, -1)); }}
      onSai={() => setHud((h) => doiNghi(h, 1))}
      onTiep={() => { setChon(null); setDungCanh(SACH); setBuoc("ket"); }} />
  ));

  if (buoc === "canh") {
    const c = vu.canh[i];
    const tg = c.tg ?? TRO_GIUP_VU[vu.id]?.[i];
    const tra = (k) => {
      if (chon != null) return;
      setChon(k); const ok = k === 0; phat(ok ? "dung" : "sai");
      if (ok) { kq.current.dung++; kq.current.diem += 100; setVatChung((n) => n + 1); } else kq.current.sai++;
      /* Hai câu đúng liền nhau: nhận một món ngẫu nhiên nếu túi còn chỗ. */
      chuoiDung.current = ok ? chuoiDung.current + 1 : 0;
      setMoi(null);
      if (chuoiDung.current >= 2 && tui.length < 3) {
        chuoiDung.current = 0;
        const mon = nhat(MON().map((m) => m.ma).filter((m) => !tui.includes(m)));
        setTui((t) => [...t, mon]); setMoi(tui.length);
      }
      if (ok || giuManhKhiSai(vu)) setSo((s) => [...s, c.manh]);
      setHud((h) => sauCanh(h, ok, vu));
    };
    const tiep = () => {
      setChon(null);   // giữ `moi` để lá thưởng rơi vào khay khi khay hiện lại
      const thua = lyDoThua(hud, vu, !!vu.ban || i + 1 >= vu.canh.length);
      if (thua) { setDungCanh(SACH); phat("sai"); setLyDo(thua); setBuoc("thua"); return; }
      const ma = trinh ?? tungSuKien(vu, nguCanh());
      if (ma) vaoSuKien(ma); else sangTiep();
    };
    return khung(c.noi, <>
      <LoiLeon key={`l${i}`} cam={c.cam}>{c.leon}</LoiLeon>
      {dungCanh.khan && chon == null && <DemNguoc key={`d${i}`} giay={GIAY_KHAN} onHet={() => tra(-1)} />}
      <div key={`t${i}`} className={`mcf-cau-vao mt-4 ${dungCanh.chay && chon == null ? "mcf-tt-chay-khung" : ""}`}><TaiLieu tl={c.tl} neo={tg?.neo} to={dungCanh.neo} chay={dungCanh.chay && chon == null} /></div>
      {dungCanh.chay && chon == null && (
        <button type="button" disabled={vatChung < 1} onClick={phucHoi} className="mt-3 flex cursor-pointer items-center gap-2 rounded-full border-0 bg-emerald-600 px-4 py-2 font-sans text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"><Flame size={14} /> {vatChung < 1 ? tr("Chưa có vật chứng để Inès phục hồi", "Aucune preuve pour Inès", "No evidence for Inès yet") : tr("Nhờ Inès phục hồi (−1 vật chứng)", "Inès restaure (−1 preuve)", "Inès restores it (−1 evidence)")}</button>
      )}
      <p lang="fr" className="m-0 mt-5 rounded-lg bg-black/30 px-4 py-2 text-base font-bold text-[#fef3c7]"><CircleHelp size={17} className="mr-1.5 inline align-[-3px] text-amber-300" />{c.q}</p>
      {ketQuaTroGiup(c, tg)}
      <CauTracNghiem key={i} pa={c.pa} onTra={tra} daChon={chon} laPhap kieu="manh" an={dungCanh.an} />
      {chon == null && khayTui(c, tg)}
      {chon != null && moi != null && <p className="mcf-cau-vao m-0 mt-3 flex items-center gap-2 text-sm font-bold text-amber-300"><Gift size={16} /> {tr(`Hai câu đúng liền: nhận ${monCua(tui[moi])?.ten ?? ""}`, `Deux bonnes réponses : ${monCua(tui[moi])?.ten ?? ""} obtenu`, `Two in a row: got ${monCua(tui[moi])?.ten ?? ""}`)}</p>}
      {chon != null && <>
        <LoiLeon cam={chon === 0 ? "duoc-do" : "hum"}>{chon === -1 ? tr("Hết giờ, P.G. đã kịp lẩn đi! ", "Temps écoulé, P.G. s'est esquivé ! ", "Time's up, P.G. slipped away! ") : null}{chon === 0 ? tr("Chính xác! ", "Exact ! ", "Exactly! ") : giuManhKhiSai(vu) ? tr("Chưa đúng, nhưng ta vẫn ghi manh mối vào sổ. ", "Raté, mais je note quand même l'indice. ", "Not quite, but I'll still note the clue. ") : tr("Sai rồi! Mất thêm 1 giờ, mất uy tín, và manh mối này trôi mất. ", "Raté ! Une heure et de la réputation perdues, et l'indice nous échappe. ", "Wrong! An hour and reputation lost, and the clue slips away. ")}{c.gt}</LoiLeon>
        <div className="mt-4 text-right">
          <button type="button" onClick={tiep} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118]">
            {vu.ban ? tr("Về sơ đồ", "Retour au plan", "Back to the map") : i + 1 >= vu.canh.length ? tr("Phá án", "Résoudre", "Solve") : tr("Manh mối tiếp", "Indice suivant", "Next clue")} →
          </button>
        </div>
      </>}
      <SoManhMoi />
    </>);
  }

  if (buoc === "ket") {
    const k_ = vu.ket;
    const tra = (k) => {
      if (chon != null) return;
      setChon(k); const ok = k === 0; phat(ok ? "thang" : "sai");
      if (ok) { kq.current.dung++; if (!vu.ban) kq.current.diem += 300; } else kq.current.sai++;
    };
    const chotBuocToi = (soNang) => {
      const k = ketBuocToi(soNang);
      if (k === "thoat") { phat("sai"); setLyDo("thieu"); setBuoc("thua"); return; }
      phat("thang"); kq.current.diem += k === "du" ? 300 : 150; setKetQua(k);
    };
    const choBangChung = vu.ban && chon === 0 && !ketQua;
    const loiCuoi = ketQua === "thieu" ? vu.ketThieu : vu.loiKet;
    return khung(tr("Phá án", "Résolution", "Solving"), <>
      <SoManhMoi />
      <LoiLeon cam={k_.cam}>{k_.leon}</LoiLeon>
      <p lang="fr" className="m-0 mt-5 rounded-lg bg-red-900/60 px-4 py-3 text-center text-xl font-bold text-[#fef3c7]">{k_.q}</p>
      {ketQuaTroGiup(k_, null)}
      <CauTracNghiem pa={k_.pa} onTra={tra} daChon={chon} laPhap kieu="manh" an={dungCanh.an} />
      {chon == null && khayTui(k_, null)}
      {choBangChung && <ChonBangChung vu={vu} so={so} onChot={chotBuocToi} />}
      {chon != null && !choBangChung && <>
        <LoiLeon cam={chon === 0 ? loiCuoi.cam : "buon"}>{chon === 0 ? loiCuoi.loi : <>{tr("Ôi không, ta bắt nhầm người rồi! ", "Oh non, ce n'est pas le bon suspect ! ", "Oh no, wrong suspect! ")}{k_.gt}</>}</LoiLeon>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {chon !== 0 && <button type="button" onClick={() => {
            const h = sauBuocToiOan(hud, vu); setHud(h); setChon(null); kq.current.diem = Math.max(0, kq.current.diem - 100);
            if (h.uy <= 0) { setLyDo("uy_tin"); setBuoc("thua"); }
          }} className="cursor-pointer rounded-full border-0 bg-white/15 px-5 py-2.5 font-sans text-sm font-bold text-white">{laMucDe(vu) ? tr("Suy luận lại (−100)", "Réfléchir encore (−100)", "Think again (−100)") : tr("Suy luận lại (−1 uy tín)", "Réfléchir encore (−1 réputation)", "Think again (−1 reputation)")}</button>}
          {chon === 0 && <span className="mr-auto self-center rounded border-2 border-solid border-amber-300 px-2 py-1 text-sm font-black text-amber-300">{tr("Hạng", "Rang", "Rank")} {vu.ban ? hangBuocToi(ketQua, kq.current.sai) : hangVu(kq.current.sai - 0)}</span>}
          <button type="button" onClick={() => {
            const ok = chon === 0;
            if (!ok) { setLyDo("thoat"); setBuoc("thua"); return; }
            if (ok) { luuTienDo(vu.id, kq.current.diem); setTd(docTienDo()); }
            onXong({ diem: kq.current.diem, dung: kq.current.dung, tong: (vu.ban ? vu.canh.filter((c, k) => c.q && daDen.includes(k)).length : vu.canh.length) + 1 });
          }} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118]">{tr("Đóng hồ sơ", "Classer le dossier", "Close the case")} →</button>
        </div>
      </>}
    </>);
  }
  if (buoc === "sukien") return khung(tr("Cản trở", "Obstacle", "Obstacle"), <>
    <ManSuKien key={sk.ma} sk={sk} vu={vu} vatChung={vatChung} onChot={chotSuKien} onTiep={sangTiep} />
    <SoManhMoi />
  </>);
  /* Thua: chơi lại ngay, không mất XP nhưng cũng không nhận thưởng (không gọi onXong). */
  if (buoc === "thua") return khung(tr("Vụ án thất bại", "Enquête ratée", "Case failed"), <>
    <LoiLeon cam="buon">
      {lyDo === "gio" ? tr("Hết giờ rồi! Hung thủ đã kịp tẩu thoát.", "Trop tard ! Le coupable s'est enfui.", "Out of time! The culprit got away.")
        : lyDo === "uy_tin" ? tr("Cấp trên đã rút chúng ta khỏi vụ này vì mất hết uy tín.", "Plus de réputation : on nous retire l'enquête.", "No reputation left: we're off the case.")
          : lyDo === "thieu" ? tr("Bằng chứng quá yếu, tòa thả người. Hung thủ thoát ngay trước mắt ta.", "Preuves trop faibles : le coupable ressort libre.", "Evidence too weak: the culprit walks free.")
            : tr("Thủ phạm thật đã thoát vì ta buộc tội sai người.", "Mauvais suspect : le vrai coupable s'échappe.", "Wrong suspect: the real culprit escapes.")}
    </LoiLeon>
    <div className="mt-5 flex flex-wrap justify-end gap-2">
      <button type="button" onClick={() => setVu(null)} className="cursor-pointer rounded-full border-0 bg-white/15 px-5 py-2.5 font-sans text-sm font-bold text-white">{tr("Về bảng vụ án", "Retour aux dossiers", "Back to cases")}</button>
      <button type="button" onClick={() => moVu(vu, true)} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118]">{tr("Điều tra lại", "Recommencer", "Try again")} →</button>
    </div>
  </>);
  return null;
}

