import React, { useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { VU_AN } from "../../../content/troChoi/thamTu.js";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import { Leon, leonVai } from "../../../shared/leon.jsx";
import CauTracNghiem from "../CauTracNghiem.jsx";
import { UY_TIN_DAU, batDauVu, sauCanh, sauBuocToiOan, lyDoThua, giuManhKhiSai, laMucDe, hangVu } from "./luat.js";

/* ─────────── 9. Thám tử đọc: « Những vụ án của Thanh tra Léon » ───────────
   Chọn mức xong thì vào BẢNG VỤ ÁN của mức đó; mỗi vụ: mở hồ sơ → các cảnh (đọc tài
   liệu, trả lời) → phá án. Tiến độ (vụ đã phá) chỉ lưu ở trình duyệt: đây là tiện ích
   mở khoá vụ kế tiếp, điểm thật vẫn ghi qua ghi_tro_choi như mọi trò. */
const KHOA_TT = "mcf-tham-tu-v1";
const docTienDo = () => { try { return JSON.parse(localStorage.getItem(KHOA_TT)) || {}; } catch { return {}; } };
const luuTienDo = (id, diem) => { try { const t = docTienDo(); t[id] = Math.max(t[id] ?? 0, diem); localStorage.setItem(KHOA_TT, JSON.stringify(t)); } catch { /* chế độ riêng tư: bỏ qua */ } };

function TaiLieu({ tl }) {
  const dong = tl.van.split("\n").map((d, k) => <span key={k} className="block min-h-[1em]">{d}</span>);
  if (tl.loai === "sms") return (
    <div className="mx-auto max-w-sm rounded-[1.75rem] bg-[#111827] p-3 shadow-xl">
      <p className="m-0 pb-2 text-center text-xs font-bold text-white/70">{tl.tieuDe}</p>
      <p lang="fr" className="m-0 max-w-[85%] rounded-2xl rounded-bl-md bg-[#e5e7eb] px-4 py-2.5 text-[15px] leading-snug text-[#111]">{dong}</p>
    </div>
  );
  if (tl.loai === "ve" || tl.loai === "hoaDon") return (
    <div className="mx-auto max-w-sm border-0 border-y-4 border-dotted border-[#9ca3af] bg-[#fff] px-5 py-4 text-sm text-[#111] shadow-lg">
      <p className="m-0 mb-2 text-center font-bold uppercase tracking-widest">{tl.tieuDe}</p><div lang="fr">{dong}</div>
    </div>
  );
  if (tl.loai === "email") return (
    <div className="overflow-hidden rounded-xl bg-[#fff] text-[#111] shadow-lg">
      <p className="m-0 bg-[#e0e7ff] px-4 py-2 text-sm font-bold text-[#3730a3]">✉ {tl.tieuDe}</p>
      <div lang="fr" className="px-4 py-3 text-[15px] leading-relaxed">{dong}</div>
    </div>
  );
  if (tl.loai === "bao") return (
    <div className="bg-[#f5f1e6] px-5 py-4 text-[#1f1f1f] shadow-lg">
      <p className="m-0 border-0 border-b-2 border-solid border-[#1f1f1f] pb-1 text-sm font-black uppercase tracking-wider">{tl.tieuDe}</p>
      <p lang="fr" className="m-0 mt-3 text-[15px] leading-relaxed [column-gap:1.5rem] sm:columns-2">{tl.van}</p>
    </div>
  );
  if (tl.loai === "affiche" || tl.loai === "bien") return (
    <div className={`mx-auto max-w-md rounded-lg px-5 py-4 text-center shadow-lg ${tl.loai === "affiche" ? "bg-[#fde047] text-[#111]" : "bg-[#1e3a8a] text-white"}`}>
      <p className="m-0 text-lg font-black uppercase tracking-wider">{tl.tieuDe}</p>
      <div lang="fr" className="mt-2 text-[15px] leading-relaxed">{dong}</div>
    </div>
  );
  if (tl.loai === "loa") return (
    <div className="rounded-2xl bg-[#0f172a] px-5 py-4 text-[#e2e8f0] shadow-lg">
      <p className="m-0 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300"><Volume2 size={14} /> {tl.tieuDe}</p>
      <div lang="fr" className="mt-2 text-[15px] italic leading-relaxed">{dong}</div>
    </div>
  );
  // note · loiKhai · thu · bang · the · bai: tờ giấy viết tay / đánh máy
  return (
    <div className={`px-5 py-4 text-[#1f2937] shadow-lg ${tl.loai === "thu" ? "bg-[#fdf6e3]" : tl.loai === "bang" ? "bg-[#fff] text-sm" : "bg-[#fffbeb]"}`}>
      <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-wider text-[#92400e]">{tl.loai === "loiKhai" ? "🗣 " : "📄 "}{tl.tieuDe}</p>
      <div lang="fr" className="text-[15px] leading-relaxed">{dong}</div>
    </div>
  );
}

export default function ThamTu({ muc = "vua", onXong }) {
  const [td, setTd] = useState(docTienDo);
  const [vu, setVu] = useState(null);             // vụ đang chơi
  const [buoc, setBuoc] = useState("mo");         // mo | canh | ket | xong
  const [i, setI] = useState(0);
  const [chon, setChon] = useState(null);
  const [lyDo, setLyDo] = useState(null);         // gio | uy_tin | thoat
  const [so, setSo] = useState([]);               // sổ manh mối
  const kq = useRef({ diem: 0, dung: 0, sai: 0 });
  const [hud, setHud] = useState({ gio: 0, uy: UY_TIN_DAU });   // đồng hồ vụ án + uy tín
  const ds = VU_AN.filter((v) => v.muc === muc);

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
            <button key={v.id} type="button" disabled={khoa} onClick={() => { phat("batDau"); setVu(v); setBuoc("mo"); setI(0); setSo([]); setHud(batDauVu(v)); kq.current = { diem: 0, dung: 0, sai: 0 }; }}
              className="relative cursor-pointer rounded-sm border-0 bg-[#e8d3a5] p-4 pt-6 text-left font-sans text-[#2b2118] shadow-[0_10px_20px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
              <span className="absolute -top-3 left-4 rounded-t-lg bg-[#e8d3a5] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#7c5c2e]">{tr("Hồ sơ", "Dossier", "Case")} {v.so}</span>
              <span lang="fr" className="block text-lg font-bold">{v.ten}</span>
              <span className="mt-1 block text-xs text-[#6b5435]">{v.tenVi}</span>
              <span className="mt-3 block text-xs font-bold">
                {khoa ? `🔒 ${tr("Phá vụ trước để mở", "Résolvez l'affaire précédente", "Solve the previous case")}` : xong ? `✅ ${tr("Đã phá", "Résolue", "Solved")} · ${td[v.id]}` : `🔎 ${tr("Chưa phá", "À résoudre", "Unsolved")}`}
              </span>
              {xong && <span className="mcf-dong absolute right-2 top-3 rounded border-2 border-solid border-red-700 px-1 text-[10px] font-black text-red-700">{tr("ĐÃ PHÁ", "RÉSOLU", "SOLVED")}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const khung = (noi, con) => (
    <div className="mt-6 rounded-[2rem] bg-[#3f3a36] bg-[radial-gradient(#57504a_1px,transparent_1px)] bg-[length:10px_10px] p-5">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#e7dcc8]">
        <span>🔎 {tr("Hồ sơ", "Dossier", "Case")} {vu.so} · <span lang="fr">{vu.ten}</span></span><span className="tabular-nums">{kq.current.diem} pts</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-bold text-[#fef3c7]">
        <span className={`tabular-nums ${hud.gio <= 1 ? "text-red-300" : ""}`}>⏰ {tr(`Còn ${hud.gio} giờ`, `${hud.gio} h restantes`, `${hud.gio} h left`)}</span>
        <span aria-label={tr(`Uy tín ${hud.uy}/${UY_TIN_DAU}`, `Réputation ${hud.uy}/${UY_TIN_DAU}`, `Reputation ${hud.uy}/${UY_TIN_DAU}`)}>{"🎖️".repeat(hud.uy)}<span className="opacity-30">{"🎖️".repeat(UY_TIN_DAU - hud.uy)}</span></span>
      </div>
      {noi && <p className="m-0 mt-2 text-xs font-bold text-amber-300">📍 {noi}</p>}
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
      <summary className="cursor-pointer font-bold">📒 {tr("Sổ manh mối", "Carnet d'indices", "Clue notebook")} ({so.length})</summary>
      <ul className="m-0 mt-2 grid gap-1 pl-5">{so.map((m, k) => <li key={k}>{m}</li>)}</ul>
    </details>
  );

  if (buoc === "mo") return khung(null, <>
    <LoiLeon cam="lam-viec">{vu.mo}</LoiLeon>
    <p className="m-0 mt-5 text-xs font-extrabold uppercase tracking-widest text-[#e7dcc8]">{vu.muc === "kho" && vu.so === 7 ? tr("Giả thuyết", "Hypothèses", "Hypotheses") : tr("Những người liên quan", "Personnes impliquées", "People involved")}</p>
    <div className="mt-2 grid gap-3 sm:grid-cols-3">
      {vu.nghiPham.map((n, k) => (
        <div key={n.ten} className="bg-[#fff] p-3 text-[#1f2937] shadow-md" style={{ rotate: `${[-2, 1.5, -1, 2][k % 4]}deg` }}>
          <div className="grid h-16 place-items-center bg-[#e5e7eb] text-2xl" aria-hidden>❔</div>
          <p lang="fr" className="m-0 mt-2 text-sm font-bold">{n.ten}</p>
          <p className="m-0 text-xs text-[#6b7280]">{n.vai}</p>
        </div>
      ))}
    </div>
    <div className="mt-5 text-right">
      <button type="button" onClick={() => { phat("bam"); setBuoc("canh"); }} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118]">{tr("Điều tra ngay", "Enquêter", "Investigate")} →</button>
    </div>
  </>);

  if (buoc === "canh") {
    const c = vu.canh[i];
    const tra = (k) => {
      if (chon != null) return;
      setChon(k); const ok = k === 0; phat(ok ? "dung" : "sai");
      if (ok) { kq.current.dung++; kq.current.diem += 100; } else kq.current.sai++;
      if (ok || giuManhKhiSai(vu)) setSo((s) => [...s, c.manh]);
      setHud((h) => sauCanh(h, ok, vu));
    };
    const tiep = () => {
      setChon(null);
      const thua = lyDoThua(hud, vu, i + 1 >= vu.canh.length);
      if (thua) { phat("sai"); setLyDo(thua); setBuoc("thua"); return; }
      if (i + 1 >= vu.canh.length) setBuoc("ket"); else setI(i + 1);
    };
    return khung(c.noi, <>
      <LoiLeon key={`l${i}`} cam={c.cam}>{c.leon}</LoiLeon>
      <div key={`t${i}`} className="mcf-cau-vao mt-4"><TaiLieu tl={c.tl} /></div>
      <p lang="fr" className="m-0 mt-5 rounded-lg bg-black/30 px-4 py-2 text-base font-bold text-[#fef3c7]">❓ {c.q}</p>
      <CauTracNghiem key={i} pa={c.pa} onTra={tra} daChon={chon} laPhap kieu="manh" />
      {chon != null && <>
        <LoiLeon cam={chon === 0 ? "duoc-do" : "hum"}>{chon === 0 ? tr("Chính xác! ", "Exact ! ", "Exactly! ") : giuManhKhiSai(vu) ? tr("Chưa đúng, nhưng ta vẫn ghi manh mối vào sổ. ", "Raté, mais je note quand même l'indice. ", "Not quite, but I'll still note the clue. ") : tr("Sai rồi! Mất thêm 1 giờ, mất uy tín, và manh mối này trôi mất. ", "Raté ! Une heure et de la réputation perdues, et l'indice nous échappe. ", "Wrong! An hour and reputation lost, and the clue slips away. ")}{c.gt}</LoiLeon>
        <div className="mt-4 text-right">
          <button type="button" onClick={tiep} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118]">
            {i + 1 >= vu.canh.length ? tr("Phá án", "Résoudre", "Solve") : tr("Manh mối tiếp", "Indice suivant", "Next clue")} →
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
      if (ok) { kq.current.dung++; kq.current.diem += 300; } else kq.current.sai++;
    };
    return khung(tr("Phá án", "Résolution", "Solving"), <>
      <SoManhMoi />
      <LoiLeon cam={k_.cam}>{k_.leon}</LoiLeon>
      <p lang="fr" className="m-0 mt-5 rounded-lg bg-red-900/60 px-4 py-3 text-center text-xl font-bold text-[#fef3c7]">{k_.q}</p>
      <CauTracNghiem pa={k_.pa} onTra={tra} daChon={chon} laPhap kieu="manh" />
      {chon != null && <>
        <LoiLeon cam={chon === 0 ? vu.loiKet.cam : "buon"}>{chon === 0 ? vu.loiKet.loi : <>{tr("Ôi không, ta bắt nhầm người rồi! ", "Oh non, ce n'est pas le bon suspect ! ", "Oh no, wrong suspect! ")}{k_.gt}</>}</LoiLeon>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {chon !== 0 && <button type="button" onClick={() => {
            const h = sauBuocToiOan(hud, vu); setHud(h); setChon(null); kq.current.diem = Math.max(0, kq.current.diem - 100);
            if (h.uy <= 0) { setLyDo("uy_tin"); setBuoc("thua"); }
          }} className="cursor-pointer rounded-full border-0 bg-white/15 px-5 py-2.5 font-sans text-sm font-bold text-white">{laMucDe(vu) ? tr("Suy luận lại (−100)", "Réfléchir encore (−100)", "Think again (−100)") : tr("Suy luận lại (−1 uy tín)", "Réfléchir encore (−1 réputation)", "Think again (−1 reputation)")}</button>}
          {chon === 0 && <span className="mr-auto self-center rounded border-2 border-solid border-amber-300 px-2 py-1 text-sm font-black text-amber-300">{tr("Hạng", "Rang", "Rank")} {hangVu(kq.current.sai - 0)}</span>}
          <button type="button" onClick={() => {
            const ok = chon === 0;
            if (!ok) { setLyDo("thoat"); setBuoc("thua"); return; }
            if (ok) { luuTienDo(vu.id, kq.current.diem); setTd(docTienDo()); }
            onXong({ diem: kq.current.diem, dung: kq.current.dung, tong: vu.canh.length + 1 });
          }} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118]">{tr("Đóng hồ sơ", "Classer le dossier", "Close the case")} →</button>
        </div>
      </>}
    </>);
  }
  /* Thua: chơi lại ngay, không mất XP nhưng cũng không nhận thưởng (không gọi onXong). */
  if (buoc === "thua") return khung(tr("Vụ án thất bại", "Enquête ratée", "Case failed"), <>
    <LoiLeon cam="buon">
      {lyDo === "gio" ? tr("Hết giờ rồi! Hung thủ đã kịp tẩu thoát.", "Trop tard ! Le coupable s'est enfui.", "Out of time! The culprit got away.")
        : lyDo === "uy_tin" ? tr("Cấp trên đã rút chúng ta khỏi vụ này vì mất hết uy tín.", "Plus de réputation : on nous retire l'enquête.", "No reputation left: we're off the case.")
          : tr("Thủ phạm thật đã thoát vì ta buộc tội sai người.", "Mauvais suspect : le vrai coupable s'échappe.", "Wrong suspect: the real culprit escapes.")}
    </LoiLeon>
    <div className="mt-5 flex flex-wrap justify-end gap-2">
      <button type="button" onClick={() => setVu(null)} className="cursor-pointer rounded-full border-0 bg-white/15 px-5 py-2.5 font-sans text-sm font-bold text-white">{tr("Về bảng vụ án", "Retour aux dossiers", "Back to cases")}</button>
      <button type="button" onClick={() => { phat("batDau"); setBuoc("mo"); setI(0); setChon(null); setSo([]); setHud(batDauVu(vu)); kq.current = { diem: 0, dung: 0, sai: 0 }; }} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118]">{tr("Điều tra lại", "Recommencer", "Try again")} →</button>
    </div>
  </>);
  return null;
}

