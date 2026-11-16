import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Check, SkipForward, RotateCcw, MicOff } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";
import { soCau } from "../../../supabase/functions/_shared/soCau.js";
import { boMaoTu } from "../../content/tuVung/index.js";

/* « Nói theo » trong bước Học từ (11/11, theo chủ dự án): mỗi từ có hai lượt nói, TỪ (kèm mạo
 * từ) rồi CÂU VÍ DỤ. Nói đạt hoặc bấm « Bỏ qua » thì lượt đó xong; xong cả hai thì từ được tính
 * là đã học. « Không tiện nói lúc này » tắt phần nói cho mọi chủ đề trên máy này (bật lại được).
 *
 * Nhận giọng bằng bộ nhận giọng CỦA TRÌNH DUYỆT (Web Speech API, fr-FR): miễn phí, không trừ
 * lượt chấm phát âm AI trong ngày (một chủ đề có tới 22 lượt nói, quá hạn mức 20 lượt/ngày của
 * cham-phat-am). Trình duyệt không có bộ này (Firefox) thì phần nói ẩn và học như cũ.
 * Chấm bằng soCau (không tính dấu, so gần theo âm); KHÔNG hiện điểm số, chỉ tô màu từng từ.
 * 16/11 (chủ dự án): tô màu NGAY trên câu mẫu trong lúc đọc (kết quả tạm của bộ nhận giọng): từ
 * nào máy nghe ra thì xanh liền; đọc đủ mọi từ thì TỰ DỪNG, không phải bấm; ngừng nói thì bộ nhận
 * giọng cũng tự dừng. Dừng xong, từ chưa nghe ra chuyển đỏ.
 * Từ: đạt khi máy nghe ra đủ ≥ 75 % (được bỏ mạo từ, vì máy hay nuốt « le », « la »).
 * Câu: đạt khi ≥ 70 %. */

const LopNhan = () => (typeof window === "undefined" ? null : window.SpeechRecognition || window.webkitSpeechRecognition || null);
export const coNhanGiong = () => !!LopNhan();

const KHOA_TAT = "mcf-tv-tat-noi";
export const docTatNoi = () => { try { return localStorage.getItem(KHOA_TAT) === "1"; } catch { return false; } };
export const ghiTatNoi = (v) => { try { if (v) localStorage.setItem(KHOA_TAT, "1"); else localStorage.removeItem(KHOA_TAT); } catch { /* bỏ qua */ } };

const chamTu = (fr, nghe) => {
  let tot = null;
  for (const n of nghe) {
    const du = soCau(fr, n, { dau: false, amGan: true });
    const goc = soCau(boMaoTu(fr), n, { dau: false, amGan: true });
    const diem = Math.max(du.diem, goc.diem);
    if (!tot || diem > tot.diem) tot = { ...du, diem, chu: n };
  }
  return tot;
};
const chamCau = (cau, nghe) => {
  let tot = null;
  for (const n of nghe) {
    const k = soCau(cau, n, { dau: false, amGan: true });
    if (!tot || k.diem > tot.diem) tot = { ...k, chu: n };
  }
  return tot;
};

/* Một lượt nói. `kieu` "tu" | "cau"; `xong` null | "dat" | "bo". */
function LuotNoi({ kieu, mau, xong, dangMo, onDat, onBoQua }) {
  const [tt, setTT] = useState("cho");           // cho | nghe | xong
  const [kq, setKq] = useState(null);
  const [tam, setTam] = useState(null);          // kết quả tạm trong lúc đang nghe
  const [loi, setLoi] = useState("");
  const rec = useRef(null);
  useEffect(() => () => { try { rec.current?.abort(); } catch { /* bỏ qua */ } }, []);

  const batDau = () => {
    const L = LopNhan();
    if (!L) return;
    setLoi(""); setKq(null); setTam(null);
    const r = new L();
    r.lang = "fr-FR"; r.interimResults = true; r.maxAlternatives = 5; r.continuous = false;
    const cham = kieu === "tu" ? chamTu : chamCau;
    let nghe = [], moiNhat = "";
    let hong = false;
    r.onresult = (e) => {
      /* Sự kiện này bắn nhiều lần (kết quả tạm rồi kết quả chốt), mỗi lần mang CẢ danh sách: dựng lại từ đầu. */
      nghe = []; moiNhat = "";
      for (const res of e.results) {
        moiNhat += " " + (res[0]?.transcript || "");
        if (res.isFinal) for (const a of res) nghe.push(a.transcript);
      }
      moiNhat = moiNhat.trim();
      if (!moiNhat) return;
      const k = cham(mau, [moiNhat]);
      setTam(k);
      /* Đã nghe ra đủ mọi từ: dừng luôn, không chờ khoảng lặng. */
      if (k.tu.length && k.tu.every((t) => t.khop !== "thieu")) { try { r.stop(); } catch { /* bỏ qua */ } }
    };
    r.onerror = (e) => {
      hong = true; setTT("cho"); setTam(null);
      setLoi(e.error === "not-allowed" || e.error === "service-not-allowed"
        ? tr("Trình duyệt chưa được dùng micro. Cho phép micro rồi thử lại, hoặc bấm « Bỏ qua ».", "Micro non autorisé. Autorisez-le ou passez.", "Microphone blocked. Allow it, or skip.")
        : e.error === "no-speech"
          ? tr("Chưa nghe thấy gì. Bấm micro rồi nói to, rõ hơn nhé.", "Rien entendu. Parlez plus fort.", "Didn't hear anything. Speak up.")
          : e.error === "network"
            ? tr("Bộ nhận giọng cần mạng. Kiểm tra kết nối hoặc bấm « Bỏ qua ».", "Pas de réseau pour la reconnaissance.", "Speech recognition needs a connection.")
            : tr("Chưa nghe được lần này, thử lại nhé.", "Échec, réessayez.", "Didn't work, try again."));
    };
    r.onend = () => {
      rec.current = null;
      if (hong) return;
      if (moiNhat && !nghe.includes(moiNhat)) nghe.push(moiNhat);
      if (!nghe.length) { setTT("cho"); setTam(null); setLoi(tr("Chưa nghe thấy gì. Bấm micro rồi nói to, rõ hơn nhé.", "Rien entendu. Parlez plus fort.", "Didn't hear anything. Speak up.")); return; }
      const k = cham(mau, nghe);
      const dat = k.diem >= (kieu === "tu" ? 0.75 : 0.7);
      setKq({ ...k, dat }); setTam(null); setTT("xong");
      phat(dat ? "dung" : "sai");
      if (dat) onDat();
    };
    rec.current = r;
    try { r.start(); setTT("nghe"); phat("bam"); } catch { setTT("cho"); }
    setTimeout(() => { if (rec.current === r) { try { r.stop(); } catch { /* bỏ qua */ } } }, kieu === "tu" ? 7000 : 15000);
  };
  const dung = () => { try { rec.current?.stop(); } catch { /* bỏ qua */ } };

  const nhan = kieu === "tu" ? tr("Nói từ", "Dites le mot", "Say the word") : tr("Nói câu ví dụ", "Dites l'exemple", "Say the example");
  const daXong = xong === "dat" || xong === "bo";
  /* Câu mẫu tô màu: đang nghe thì từ đã nghe ra xanh, từ chưa tới giữ màu chữ; dừng rồi thì từ
     chưa nghe ra đỏ. */
  const dangNghe = tt === "nghe";
  const toMau = dangNghe ? tam : kq;
  return (
    <div className={`grid gap-2.5 rounded-2xl border-2 border-solid p-3.5 transition-colors ${dangMo && !daXong ? "border-primary/40 bg-surface" : "border-transparent bg-surface2"}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${xong === "dat" ? "bg-ok text-white" : xong === "bo" ? "bg-surface text-soft" : "bg-primary-soft text-primary"}`}>
          {xong === "dat" ? <Check size={15} strokeWidth={3} /> : xong === "bo" ? <SkipForward size={13} /> : <Mic size={14} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.1em] text-soft">{nhan}</p>
          {toMau ? (
            <p lang="fr" aria-label={mau} className={`m-0 flex flex-wrap gap-x-1 gap-y-0.5 font-bold leading-snug ${kieu === "tu" ? "text-base" : "text-sm italic"}`}>
              {toMau.tu.map((t, j) => (
                <span key={j} className={`rounded-md px-1 transition-colors duration-200 ${t.khop !== "thieu" ? "bg-ok-soft text-ok" : dangNghe ? "text-ink" : "bg-danger-soft text-danger"}`}>{t.goc}</span>
              ))}
            </p>
          ) : <p lang="fr" className={`m-0 font-bold leading-snug text-ink ${kieu === "tu" ? "text-base" : "text-sm italic"}`}>{mau}</p>}
        </div>
        {xong === "dat" && <span className="rounded-full bg-ok-soft px-3 py-1 text-xs font-extrabold text-ok">{tr("Đạt", "Réussi", "Passed")}</span>}
        {xong === "bo" && <span className="rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-soft">{tr("Đã bỏ qua", "Passé", "Skipped")}</span>}
        {(dangMo || daXong) && (
          tt === "nghe" ? (
            <motion.button type="button" onClick={dung} whileTap={{ scale: 0.92 }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-danger px-4 py-2.5 font-sans text-sm font-extrabold text-white">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" /> {tr("Đang nghe, đọc xong tự dừng", "J'écoute, arrêt automatique", "Listening, stops by itself")} <Square size={12} fill="currentColor" />
            </motion.button>
          ) : (
            <motion.button type="button" onClick={batDau} whileTap={{ scale: 0.92 }} whileHover={{ y: -2 }}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 px-4 py-2.5 font-sans text-sm font-extrabold ${daXong ? "bg-surface text-soft hover:text-ink" : "bg-primary text-on-primary shadow-md"}`}>
              {kq || daXong ? <RotateCcw size={14} /> : <Mic size={15} />}
              {kq || daXong ? tr("Nói lại", "Redire", "Again") : tr("Bấm và nói", "Parler", "Tap and speak")}
            </motion.button>
          )
        )}
        {dangMo && !daXong && tt !== "nghe" && (
          <button type="button" onClick={onBoQua}
            className="inline-flex cursor-pointer items-center gap-1 rounded-xl border-0 bg-transparent px-2 py-2 font-sans text-sm font-bold text-soft hover:text-ink">
            {tr("Bỏ qua", "Passer", "Skip")} <SkipForward size={13} />
          </button>
        )}
      </div>
      {loi && <p className="mcf-rung m-0 text-sm font-semibold text-danger">{loi}</p>}
      <AnimatePresence>
        {kq && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="grid gap-1.5 overflow-hidden">
            <p className="m-0 text-xs text-soft">
              {kq.dat ? tr("Tốt lắm! ", "Très bien ! ", "Great! ", ) : tr("Từ xanh là máy nghe ra đúng, từ đỏ là chưa nghe ra: bấm loa nghe mẫu rồi nói lại. ", "Les mots en rouge n'ont pas été reconnus. ", "Red words weren't recognised. ")}
              {tr("Máy nghe ra:", "Entendu :", "Heard:")} <em lang="fr" className="text-ink">« {kq.chu} »</em>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Khối « Nói theo » dưới thẻ học. `ket` = { tu, cau } (null | "dat" | "bo"). */
export function NoiTheo({ tu, ket, onDoi, onTat }) {
  const k = ket || {};
  const motXong = !!k.tu;
  return (
    <div className="grid gap-2.5 rounded-[1.5rem] border border-solid border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 flex items-center gap-2 text-sm font-extrabold text-ink"><Mic size={16} className="text-primary" /> {tr("Nói theo", "Répétez", "Speak")}</p>
        <button type="button" onClick={onTat}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-transparent p-0 font-sans text-xs font-bold text-soft hover:text-ink">
          <MicOff size={13} /> {tr("Không tiện nói lúc này", "Pas possible de parler", "Can't speak right now")}
        </button>
      </div>
      <LuotNoi key={`${tu.fr}-tu`} kieu="tu" mau={tu.fr} xong={k.tu} dangMo
        onDat={() => onDoi({ ...k, tu: "dat" })} onBoQua={() => onDoi({ ...k, tu: "bo" })} />
      <LuotNoi key={`${tu.fr}-cau`} kieu="cau" mau={tu.vd[0]} xong={k.cau} dangMo={motXong}
        onDat={() => onDoi({ ...k, tu: k.tu || "dat", cau: "dat" })} onBoQua={() => onDoi({ ...k, cau: "bo" })} />
    </div>
  );
}
