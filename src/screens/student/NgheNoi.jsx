import React, { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square, Play, Turtle, RotateCcw, ArrowRight, ArrowLeft, Check, Lightbulb, Loader2, PenLine, TextCursorInput } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";
import NutTieng from "../../shared/NutTieng.jsx";
import { loiTranVip } from "../../shared/loiTranVip.js";
import { baoHetLuot } from "../../shared/HetLuot.jsx";
import { soCau } from "../../../supabase/functions/_shared/soCau.js";
import { choTrong } from "../../shared/choTrong.jsx";
import HocTapTab from "./HocTapTab.jsx";

/* « Nghe & Nói » (10/10): chép chính tả + luyện phát âm.
 *
 * Kho câu ở cau_luyen (migration 131), audio là GIỌNG TỔNG HỢP và màn hình nói
 * rõ điều đó. Chép chính tả chấm ngay trong trình duyệt bằng soCau (tính dấu)
 * rồi ghi qua RPC ghi_chinh_ta. Phát âm gửi bản ghi âm cho Edge Function
 * cham-phat-am: AI chép lại, so từng từ; điểm là « máy nghe ra đúng bao nhiêu
 * từ », không phải một con số phát âm bịa ra. Bản ghi âm không được lưu. */

const CAP = ["A1", "A2", "B1", "B2", "C1"];
const DAU = ["é", "è", "ê", "à", "â", "ç", "î", "ï", "ô", "û", "ù", "ë", "œ"];
const mauDiem = (d) => (d == null ? "bg-surface2 text-soft" : d >= 0.9 ? "bg-ok text-white" : d >= 0.6 ? "bg-amber-400 text-amber-950" : "bg-danger text-white");

function TuDaSo({ kq }) {
  return (
    <p className="m-0 flex flex-wrap gap-1.5 text-lg font-bold leading-relaxed">
      {kq.tu.map((t, i) => (
        <span key={i} title={t.khop === "sai_dau" ? tr(`Sai dấu: bạn viết « ${t.viet} »`, `Accent : vous avez écrit « ${t.viet} »`, `Accent: you wrote « ${t.viet} »`) : undefined}
          className={`rounded-lg px-1.5 ${t.khop === "dung" ? "bg-ok-soft text-ok" : t.khop === "sai_dau" ? "bg-warn-soft text-warn underline decoration-dotted" : "bg-danger-soft text-danger line-through decoration-danger/50"}`}>
          {t.goc}
        </span>
      ))}
      {kq.thua.map((w, i) => <span key={`x${i}`} className="rounded-lg bg-surface2 px-1.5 text-soft">+{w}</span>)}
    </p>
  );
}

function NutNghe({ src }) {
  const ref = useRef(null);
  const [dem, setDem] = useState(0);
  const nghe = (cham) => {
    const a = ref.current; if (!a) return;
    a.pause(); a.currentTime = 0; a.playbackRate = cham ? 0.7 : 1; a.play().catch(() => {}); setDem((n) => n + 1);
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <audio ref={ref} src={src} preload="auto" />
      <button type="button" onClick={() => nghe(false)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border-0 border-b-4 border-solid border-blue-800 bg-gradient-to-r from-primary to-indigo-600 px-5 py-3 font-sans text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0">
        <Play size={16} fill="currentColor" /> {tr("Nghe", "Écouter", "Listen")}
      </button>
      <button type="button" onClick={() => nghe(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-solid border-line bg-surface px-4 py-2.5 font-sans text-sm font-bold text-ink hover:border-primary">
        <Turtle size={16} /> {tr("Nghe chậm", "Plus lent", "Slower")}
      </button>
      {dem > 0 && <span className="text-xs font-semibold text-soft">{tr(`Đã nghe ${dem} lần`, `Écouté ${dem} fois`, `Played ${dem}×`)}</span>}
    </div>
  );
}

function ChepChinhTa({ cau, onXong }) {
  const [go, setGo] = useState("");
  const [kq, setKq] = useState(null);
  const oNhap = useRef(null);
  useEffect(() => { setGo(""); setKq(null); oNhap.current?.focus(); }, [cau.id]);
  const chen = (c) => {
    const el = oNhap.current; if (!el) { setGo((g) => g + c); return; }
    const a = el.selectionStart ?? go.length, b = el.selectionEnd ?? go.length;
    const moi = go.slice(0, a) + c + go.slice(b); setGo(moi);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + c.length, a + c.length); });
  };
  const kiem = async () => {
    if (!go.trim()) return;
    const r = soCau(cau.cau, go, { dau: true });
    setKq(r); phat(r.diem >= 0.9 ? "dung" : r.diem >= 0.6 ? "nop" : "sai");
    await supabase.rpc("ghi_chinh_ta", { p_cau: cau.id, p_diem: r.diem, p_chu: go });
    onXong(r.diem);
  };
  return (
    <div className="grid gap-4">
      <NutNghe src={cau.audio_url} />
      <textarea data-khong-bang-dau ref={oNhap} value={go} onChange={(e) => setGo(e.target.value)} rows={3} disabled={!!kq}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); kq ? null : kiem(); } }}
        placeholder={tr("Gõ lại câu bạn nghe được…", "Écrivez la phrase entendue…", "Type the sentence you hear…")} lang="fr" spellCheck={false}
        className="w-full resize-none rounded-2xl border-2 border-solid border-line bg-surface px-4 py-3 font-sans text-lg text-ink outline-none focus:border-primary disabled:opacity-80" />
      {!kq && (
        <div className="flex flex-wrap gap-1.5">
          {DAU.map((c) => (
            <button key={c} type="button" onClick={() => chen(c)}
              className="h-9 w-9 cursor-pointer rounded-xl border border-solid border-line bg-surface font-sans text-base font-bold text-ink hover:border-primary hover:text-primary">{c}</button>
          ))}
        </div>
      )}
      {!kq ? (
        <button type="button" onClick={kiem} disabled={!go.trim()}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 bg-ok px-5 py-3 font-sans text-sm font-extrabold text-white disabled:opacity-40 sm:w-auto">
          <Check size={16} strokeWidth={3} /> {tr("Kiểm tra", "Vérifier", "Check")}
        </button>
      ) : (
        <div className="mcf-cau-vao grid gap-3 rounded-2xl border border-solid border-line bg-surface2 p-4">
          <div className="flex items-center gap-3">
            <Leon cam={kq.diem >= 0.9 ? "tuyet-voi" : kq.diem >= 0.6 ? "duoc-do" : "co-len"} size={64} className="mcf-nay shrink-0" />
            <div>
              <p className="m-0 text-2xl font-extrabold tabular-nums text-ink">{Math.round(kq.diem * 100)}%</p>
              <p className="m-0 text-xs text-soft">{tr(`Đúng ${kq.dung}/${kq.tong} từ. Từ vàng: sai dấu (tính nửa điểm), từ đỏ: thiếu hoặc sai.`, `${kq.dung}/${kq.tong} mots justes. Jaune : accent, rouge : manquant ou faux.`, `${kq.dung}/${kq.tong} words right. Yellow: accent, red: missing or wrong.`)}</p>
            </div>
          </div>
          <TuDaSo kq={kq} />
          <p className="m-0 text-sm text-ink"><strong lang="fr">{choTrong(cau.cau)}</strong></p>
          {cau.nghia && <p className="m-0 text-sm text-soft">{cau.nghia}</p>}
          <button type="button" onClick={() => { setKq(null); setGo(""); }}
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-transparent px-0 font-sans text-sm font-bold text-primary"><RotateCcw size={14} /> {tr("Làm lại câu này", "Refaire", "Try again")}</button>
        </div>
      )}
    </div>
  );
}

/* ── Nghe điền từ (132) ──
   Ẩn vài từ « có nghĩa » (dài ≥ 4 chữ, không phải từ công cụ), chọn CỐ ĐỊNH
   theo câu để làm lại vẫn là cùng chỗ trống. Số chỗ trống theo trình độ. */
const TU_CONG_CU = new Set(["dans", "avec", "pour", "sans", "sous", "chez", "vers", "mais", "donc", "comme", "plus", "très", "tout", "toute", "tous", "leur", "leurs", "notre", "votre", "nous", "vous", "elle", "elles", "ils", "cette", "ces", "est", "sont", "avez", "avons", "être", "avoir", "que", "qui", "dont", "quand", "aussi", "bien", "encore", "depuis"]);
const SO_TRONG = { A1: 2, A2: 2, B1: 3, B2: 4, C1: 5 };
const bam = (x) => { let h = 0; for (const c of x) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const thuong = (w) => String(w).toLowerCase().normalize("NFC").trim();
const khongDau = (w) => thuong(w).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function tachTrong(cau, cap) {
  const manh = cau.split(/(\s+)/);
  const ung = [];
  manh.forEach((m, i) => {
    const g = m.match(/^([^A-Za-zÀ-ÿœŒ]*(?:[a-zA-Z]['’])?)([A-Za-zÀ-ÿœŒ-]+)([^A-Za-zÀ-ÿœŒ]*)$/);
    if (!g) return;
    const tu = g[2];
    if (tu.length < 4 || TU_CONG_CU.has(tu.toLowerCase()) || /^[A-ZÀ-Ý]/.test(tu) && i > 0) return;
    ung.push({ i, truoc: g[1], tu, sau: g[3], k: bam(cau + i) });
  });
  const chon = new Set(ung.sort((a, b) => a.k - b.k).slice(0, SO_TRONG[cap] ?? 2).map((x) => x.i));
  return manh.map((m, i) => (chon.has(i) ? ung.find((x) => x.i === i) : m));
}

function DienTu({ cau, onXong }) {
  const phan = useMemo(() => tachTrong(cau.cau, cau.cap), [cau.cau, cau.cap]);
  const trong = phan.filter((p) => typeof p === "object");
  const [dien, setDien] = useState({});
  const [kq, setKq] = useState(null);
  const dau = useRef(null);
  useEffect(() => { setDien({}); setKq(null); setTimeout(() => dau.current?.focus(), 50); }, [cau.id]);
  const kiem = async () => {
    const chi = trong.map((t) => {
      const v = dien[t.i] ?? "";
      const khop = thuong(v) === thuong(t.tu) ? "dung" : khongDau(v) === khongDau(t.tu) && v.trim() ? "sai_dau" : "sai";
      return { i: t.i, khop };
    });
    const diem = trong.length ? chi.reduce((n, c) => n + (c.khop === "dung" ? 1 : c.khop === "sai_dau" ? 0.5 : 0), 0) / trong.length : 0;
    const r = { chi: Object.fromEntries(chi.map((c) => [c.i, c.khop])), diem, dung: chi.filter((c) => c.khop === "dung").length, tong: trong.length };
    setKq(r); phat(diem >= 0.99 ? "dung" : diem >= 0.5 ? "nop" : "sai");
    await supabase.rpc("ghi_chinh_ta", { p_cau: cau.id, p_diem: diem, p_chu: trong.map((t) => dien[t.i] ?? "").join(" | "), p_kieu: "dien_tu" });
    onXong(diem);
  };
  let soO = 0;
  return (
    <div className="grid gap-4">
      <NutNghe src={cau.audio_url} />
      <p className="m-0 flex flex-wrap items-baseline gap-x-1 gap-y-2 text-xl font-semibold leading-loose text-ink" lang="fr">
        {phan.map((p, i) => {
          if (typeof p === "string") return <span key={i}>{p}</span>;
          const khop = kq?.chi[p.i];
          const laDau = soO++ === 0;
          return (
            <span key={i} className="inline-flex items-baseline">
              {p.truoc}
              {kq ? (
                <span className={`rounded-lg px-1.5 font-bold ${khop === "dung" ? "bg-ok-soft text-ok" : khop === "sai_dau" ? "bg-warn-soft text-warn" : "bg-danger-soft text-danger"}`}
                  title={khop !== "dung" ? tr(`Bạn điền: « ${dien[p.i] || "…"} »`, `Votre réponse : « ${dien[p.i] || "…"} »`, `You wrote: « ${dien[p.i] || "…"} »`) : undefined}>
                  {p.tu}
                </span>
              ) : (
                <input ref={laDau ? dau : undefined} value={dien[p.i] ?? ""} onChange={(e) => setDien({ ...dien, [p.i]: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); kiem(); } }}
                  spellCheck={false} autoComplete="off" aria-label={tr("Từ còn thiếu", "Mot manquant", "Missing word")}
                  style={{ width: `${Math.max(4, p.tu.length + 1)}ch` }}
                  className="rounded-lg border-0 border-b-2 border-solid border-primary bg-primary-soft px-1 text-center font-sans text-lg font-bold text-ink outline-none focus:bg-surface" />
              )}
              {p.sau}
            </span>
          );
        })}
      </p>
      {!kq ? (
        <button type="button" onClick={kiem}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 bg-ok px-5 py-3 font-sans text-sm font-extrabold text-white sm:w-auto">
          <Check size={16} strokeWidth={3} /> {tr("Kiểm tra", "Vérifier", "Check")}
        </button>
      ) : (
        <div className="mcf-cau-vao grid gap-3 rounded-2xl border border-solid border-line bg-surface2 p-4">
          <div className="flex items-center gap-3">
            <Leon cam={kq.diem >= 0.99 ? "tuyet-voi" : kq.diem >= 0.5 ? "duoc-do" : "co-len"} size={64} className="mcf-nay shrink-0" />
            <div>
              <p className="m-0 text-2xl font-extrabold tabular-nums text-ink">{kq.dung}/{kq.tong} <span className="text-sm font-bold text-soft">{tr("chỗ trống đúng", "réponses justes", "blanks right")}</span></p>
              <p className="m-0 text-xs text-soft">{tr("Xanh: đúng · vàng: sai dấu (nửa điểm) · đỏ: sai. Rê chuột lên từ để xem bạn đã điền gì.", "Vert : juste · jaune : accent · rouge : faux.", "Green: right · yellow: accent · red: wrong.")}</p>
            </div>
          </div>
          {cau.nghia && <p className="m-0 text-sm text-soft">{cau.nghia}</p>}
          <button type="button" onClick={() => { setKq(null); setDien({}); }}
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-transparent px-0 font-sans text-sm font-bold text-primary"><RotateCcw size={14} /> {tr("Làm lại câu này", "Refaire", "Try again")}</button>
        </div>
      )}
    </div>
  );
}

export function PhatAm({ cau, onXong }) {
  const [trangThai, setTT] = useState("cho");   // cho | ghi | gui | xong
  const [giay, setGiay] = useState(0);
  const [kq, setKq] = useState(null);
  const [loi, setLoi] = useState("");
  const rec = useRef(null);
  const manh = useRef([]);
  useEffect(() => { setTT("cho"); setKq(null); setLoi(""); }, [cau.id]);
  useEffect(() => {
    if (trangThai !== "ghi") return undefined;
    const h = setInterval(() => setGiay((n) => { if (n + 1 >= 20) dung(); return n + 1; }), 1000);
    return () => clearInterval(h);
  }, [trangThai]); // eslint-disable-line react-hooks/exhaustive-deps

  const batDau = async () => {
    setLoi("");
    try {
      const st = await navigator.mediaDevices.getUserMedia({ audio: true });
      const loai = ["audio/webm", "audio/mp4", "audio/ogg"].find((x) => window.MediaRecorder?.isTypeSupported?.(x)) || "";
      const r = new MediaRecorder(st, loai ? { mimeType: loai } : undefined);
      manh.current = [];
      r.ondataavailable = (e) => { if (e.data.size) manh.current.push(e.data); };
      r.onstop = () => { st.getTracks().forEach((t) => t.stop()); gui(new Blob(manh.current, { type: r.mimeType || "audio/webm" })); };
      rec.current = r; r.start(); setGiay(0); setTT("ghi"); phat("bam");
    } catch {
      setLoi(tr("Không mở được micro. Hãy cho phép trình duyệt dùng micro rồi thử lại.", "Micro inaccessible. Autorisez le micro puis réessayez.", "Can't access the microphone. Allow it and try again."));
    }
  };
  const dung = () => { if (rec.current?.state === "recording") rec.current.stop(); };
  const gui = async (blob) => {
    setTT("gui");
    const duoi = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
    const fd = new FormData();
    fd.append("cauId", cau.id);
    fd.append("file", new File([blob], `doc.${duoi}`, { type: blob.type }));
    const { data, error } = await supabase.functions.invoke("cham-phat-am", { body: fd });
    let d = data;
    if (error) { try { d = await error.context?.json?.(); } catch { d = null; } }
    if (!d?.ok) {
      setTT("cho"); phat("sai");
      if (d?.ma === "HET_LUOT") baoHetLuot({ loai: "phat_am", hanMuc: d?.han_muc });
      setLoi(d?.ma === "HET_LUOT_VIP" ? loiTranVip() : d?.ma === "HET_LUOT" ? tr(`Hôm nay bạn đã dùng hết ${d.han_muc} lượt chấm phát âm. Mai luyện tiếp nhé, VIP tới 100 lượt AI/ngày.`, `Vous avez utilisé vos ${d.han_muc} essais du jour. VIP : jusqu'à 100 requêtes IA/jour.`, `You've used today's ${d.han_muc} tries. VIP gets up to 100 AI requests a day.`)
        : d?.ma === "QUA_NGAN" ? tr("Bản ghi quá ngắn, hãy đọc cả câu.", "Enregistrement trop court.", "Recording too short.")
          : tr("Chưa chấm được lần này. Thử lại sau ít phút nhé.", "Échec de l'analyse, réessayez.", "Couldn't analyse it, try again."));
      return;
    }
    setKq(d); setTT("xong"); phat(d.diem >= 0.9 ? "thang" : d.diem >= 0.6 ? "dung" : "nop");
    onXong(d.diem);
  };

  return (
    <div className="grid gap-4">
      <NutNghe src={cau.audio_url} />
      {cau.meo && (
        <p className="m-0 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <Lightbulb size={16} className="mt-0.5 shrink-0" /> {cau.meo}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {trangThai === "ghi" ? (
          <button type="button" onClick={dung}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border-0 bg-danger px-6 py-3.5 font-sans text-sm font-extrabold text-white">
            <Square size={15} fill="currentColor" /> {tr("Dừng", "Arrêter", "Stop")} · {giay}s
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
          </button>
        ) : (
          <button type="button" onClick={batDau} disabled={trangThai === "gui"}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border-0 border-b-4 border-solid border-red-800 bg-gradient-to-r from-rose-500 to-red-600 px-6 py-3.5 font-sans text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60">
            {trangThai === "gui" ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
            {trangThai === "gui" ? tr("Leon đang nghe…", "Leon écoute…", "Leon is listening…") : kq ? tr("Đọc lại", "Relire", "Read again") : tr("Bấm và đọc câu", "Lire la phrase", "Tap and read")}
          </button>
        )}
        <span className="text-xs text-soft">{tr("Tối đa 20 giây", "20 secondes max", "Up to 20 seconds")}</span>
      </div>
      {loi && <p className="mcf-rung m-0 text-sm font-semibold text-danger">{loi}</p>}
      {kq && (
        <div className="mcf-cau-vao grid gap-3 rounded-2xl border border-solid border-line bg-surface2 p-4">
          <div className="flex items-center gap-3">
            <Leon cam={kq.diem >= 0.9 ? "yeah" : kq.diem >= 0.6 ? "duoc-do" : "co-len"} size={64} className="mcf-nay shrink-0" />
            <div>
              <p className="m-0 text-2xl font-extrabold tabular-nums text-ink">{kq.dung}/{kq.tong} <span className="text-sm font-bold text-soft">{tr("từ máy nghe ra đúng", "mots reconnus", "words recognised")}</span></p>
              {kq.con_lai != null && <p className="m-0 text-xs text-soft">{tr(`Còn ${kq.con_lai} lượt hôm nay`, `Encore ${kq.con_lai} essai(s) aujourd'hui`, `${kq.con_lai} tries left today`)}</p>}
            </div>
          </div>
          <TuDaSo kq={kq} />
          <p className="m-0 text-sm text-soft">{tr("Máy nghe ra:", "Transcription :", "Heard as:")} <em lang="fr" className="text-ink">« {kq.chu || "…"} »</em></p>
          <p className="m-0 text-[11px] text-soft">{tr("Từ đỏ là từ máy không nghe ra đúng: hãy nghe lại câu mẫu và chú ý âm đó.", "Les mots en rouge n'ont pas été reconnus : réécoutez le modèle.", "Red words weren't recognised: listen to the model again.")}</p>
        </div>
      )}
    </div>
  );
}

/* Hành trình (28/10): mỗi chế độ × trình độ chia thành các TRẠM 5 câu, đi theo thứ tự trên bản
   đồ. Sao của trạm TÍNH TỪ điểm tốt nhất đã lưu trên máy chủ (cau_luyen_ket_qua), câu chưa làm
   tính 0, nên tiến độ theo người học sang mọi máy và không cần lưu thêm gì. Trạm sau mở khi trạm
   trước có ít nhất 1 sao. */
const CO_TRAM = 5;
const saoTu = (tb) => (tb >= 0.9 ? 3 : tb >= 0.75 ? 2 : tb >= 0.5 ? 1 : 0);
const BIEU_TUONG = ["☕", "🥐", "🚲", "🎨", "🏛️", "🎭", "🧀", "🌻", "⛵", "🍷", "🎻", "🗼"];
const CHU_DE = () => ({
  chinh_ta: {
    ten: tr("Sổ tay phóng viên", "Le carnet du reporter", "The reporter's notebook"),
    mo: tr("Ta là phóng viên Léon! Hôm nay ta đi phỏng vấn khắp Paris, nhưng tay ta bận cầm micro. Bạn nghe rồi chép lại giúp ta từng câu nhé, nhớ đủ dấu!", "Moi, c'est Léon, reporter ! J'interviewe tout Paris mais j'ai les mains prises. Note chaque phrase pour moi, accents compris !", "I'm Léon the reporter! I'm interviewing all of Paris but my hands are busy. Write down each sentence for me, accents included!"),
    nen: "from-sky-500 to-indigo-600", vien: "border-sky-300", chu: "text-sky-700 dark:text-sky-300",
  },
  dien_tu: {
    ten: tr("Radio Léon", "Radio Léon", "Radio Léon"),
    mo: tr("Đài Radio Léon đang phát sóng, mà sóng chập chờn quá: vài từ bị rè mất. Bạn nghe kỹ và điền lại các từ đó để thính giả hiểu nhé!", "Radio Léon est en direct, mais la réception grésille : des mots disparaissent. Écoute bien et complète-les !", "Radio Léon is on air, but the signal crackles and some words drop out. Listen closely and fill them in!"),
    nen: "from-amber-500 to-rose-500", vien: "border-amber-300", chu: "text-amber-700 dark:text-amber-300",
  },
  phat_am: {
    ten: tr("Phòng thu lồng tiếng", "Le studio de doublage", "The dubbing studio"),
    mo: tr("Chào mừng tới phòng thu! Ta là đạo diễn Léon. Bạn nghe câu mẫu, rồi đọc to vào micro: máy nghe ra đúng càng nhiều từ thì cảnh quay càng đạt.", "Bienvenue au studio ! Je suis Léon, le réalisateur. Écoute le modèle puis lis à voix haute : plus la machine reconnaît de mots, meilleure est la prise.", "Welcome to the studio! I'm Léon, the director. Listen to the model, then read aloud: the more words the machine recognises, the better the take."),
    nen: "from-rose-500 to-fuchsia-600", vien: "border-rose-300", chu: "text-rose-700 dark:text-rose-300",
  },
});

function Sao({ n, to }) {
  return <span aria-label={`${n}/3`} className={to ? "text-2xl" : "text-sm"}>{[0, 1, 2].map((k) => <span key={k} className={k < n ? "text-amber-400" : "text-line"}>★</span>)}</span>;
}

export default function NgheNoi() {
  const [loai, setLoai] = useState("chinh_ta");
  const [cap, setCap] = useState("A1");
  const [ds, setDs] = useState(undefined);
  const [diem, setDiem] = useState(new Map());     // kieu:cau_id → điểm tốt nhất
  const [tram, setTram] = useState(null);           // chỉ số trạm đang chơi
  const [dang, setDang] = useState(0);              // chỉ số câu trong trạm
  const [ket, setKet] = useState(false);            // đang xem tổng kết trạm

  useEffect(() => {
    let con = true;
    (async () => {
      const [{ data: cau }, { data: u }] = await Promise.all([
        supabase.from("cau_luyen").select("id, loai, cap, cau, nghia, meo, audio_url, ord").eq("cong_khai", true).order("cap").order("ord"),
        supabase.auth.getUser(),
      ]);
      if (!con) return;
      setDs(cau ?? null);
      const uid = u?.user?.id;
      if (!uid) return;
      const { data: kq } = await supabase.from("cau_luyen_ket_qua").select("cau_id, diem, kieu").eq("user_id", uid);
      const m = new Map();
      for (const r of kq ?? []) { const k = `${r.kieu}:${r.cau_id}`; m.set(k, Math.max(m.get(k) ?? 0, Number(r.diem))); }
      if (con) setDiem(m);
    })();
    return () => { con = false; };
  }, []);

  const loaiCau = loai === "phat_am" ? "phat_am" : loai === "dien_tu" ? "dien_tu" : "chinh_ta";
  const kieu = loai === "phat_am" ? "phat_am" : loai === "dien_tu" ? "dien_tu" : "chep";
  const loc = useMemo(() => (ds || []).filter((c) => c.loai === loaiCau && c.cap === cap), [ds, loaiCau, cap]);
  const cacTram = useMemo(() => { const r = []; for (let i = 0; i < loc.length; i += CO_TRAM) r.push(loc.slice(i, i + CO_TRAM)); return r; }, [loc]);
  const dCau = (id) => diem.get(`${kieu}:${id}`);
  const tbTram = (t) => t.reduce((n, c) => n + (dCau(c.id) ?? 0), 0) / t.length;
  const saoTram = (k) => saoTu(tbTram(cacTram[k]));
  const tongSao = cacTram.reduce((n, _, k) => n + saoTram(k), 0);
  const cd = CHU_DE()[loai];
  const cauTram = tram != null ? cacTram[tram] : null;
  const cau = cauTram && !ket ? cauTram[dang] : null;
  const ghiDiem = (d) => setDiem((m) => { const k = `${kieu}:${cau.id}`; return new Map(m).set(k, Math.max(m.get(k) ?? 0, d)); });
  const vaoTram = (k) => { phat("batDau"); setTram(k); setDang(0); setKet(false); };
  const raBanDo = () => { setTram(null); setKet(false); };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <HocTapTab />
      <header className="mcf-cau-vao relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-600 p-6 text-white shadow-[0_20px_50px_rgba(192,38,211,0.3)]">
        <span aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <Leon cam={loai === "phat_am" ? "chao" : "lam-viec"} size={104} className="mcf-leon-bay shrink-0 drop-shadow-[0_12px_18px_rgba(0,0,0,0.3)] max-sm:h-20 max-sm:w-20" />
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-3xl font-extrabold tracking-tight">{tr("Nghe & Nói", "Écoute & Oral", "Listen & Speak")}</h1>
            <p className="m-0 mt-1 text-sm text-white/85">{tr("Đi hết các trạm cùng Léon: chép chính tả, nghe điền từ và luyện đọc cho máy nghe ra đúng.", "Parcours les étapes avec Léon : dictées, textes à trous et lecture à voix haute.", "Travel the stops with Léon: dictations, gap fills and read-aloud practice.")}</p>
          </div>
          <NutTieng className="border-white/30 bg-white/15 text-white hover:border-white hover:text-white" />
        </div>
        <div className="relative mt-5 inline-flex flex-wrap gap-1 rounded-2xl bg-white/15 p-1.5">
          {[["chinh_ta", PenLine, tr("Chép chính tả", "Dictée", "Dictation")], ["dien_tu", TextCursorInput, tr("Nghe điền từ", "Texte à trous", "Fill the gaps")], ["phat_am", Mic, tr("Phát âm", "Prononciation", "Pronunciation")]].map(([k, Icon, nhan]) => (
            <button key={k} type="button" onClick={() => { if (k !== loai) phat("tiep"); setLoai(k); raBanDo(); }}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 px-4 py-2 font-sans text-sm font-extrabold transition-all ${loai === k ? "bg-white text-fuchsia-700 shadow" : "bg-transparent text-white hover:bg-white/15"}`}>
              <Icon size={15} /> {nhan}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {CAP.map((c) => (
          <button key={c} type="button" onClick={() => { setCap(c); raBanDo(); phat("bam"); }}
            className={`cursor-pointer rounded-2xl border-2 border-solid px-4 py-2 font-sans text-sm font-extrabold transition-all ${cap === c ? "border-primary bg-primary text-white shadow-md" : "border-line bg-surface text-ink hover:border-primary/50"}`}>{c}</button>
        ))}
        {cacTram.length > 0 && <span className="ml-auto text-xs font-bold text-soft">★ {tongSao}/{cacTram.length * 3}</span>}
      </div>

      {ds === undefined ? (
        <p className="mt-8 text-center text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
      ) : ds === null ? (
        <p className="mt-8 text-center text-sm text-danger">{tr("Không tải được kho câu. Kiểm tra mạng rồi thử lại.", "Impossible de charger les phrases.", "Couldn't load sentences.")}</p>
      ) : cacTram.length === 0 ? (
        <p className="mt-8 text-center text-sm text-soft">{tr("Trình độ này chưa có câu nào cho chế độ này.", "Pas encore de phrases à ce niveau.", "No sentences at this level yet.")}</p>
      ) : cauTram && ket ? (
        <section className="mcf-cau-vao mt-5 overflow-hidden rounded-3xl border border-solid border-line bg-surface shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className={`bg-gradient-to-r ${cd.nen} px-5 py-4 text-white`}>
            <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-white/80">{cd.ten} · {cap}</p>
            <p className="m-0 mt-1 text-xl font-extrabold">{BIEU_TUONG[tram % BIEU_TUONG.length]} {tr("Trạm", "Étape", "Stop")} {tram + 1}</p>
          </div>
          <div className="grid gap-4 p-5">
            <div className="flex items-start gap-3">
              <Leon cam={saoTram(tram) >= 3 ? "yeah" : saoTram(tram) >= 1 ? "duoc-do" : "co-len"} size={72} className="mcf-nay shrink-0" />
              <div>
                <Sao n={saoTram(tram)} to />
                <p className="m-0 mt-1 rounded-3xl rounded-tl-md bg-surface2 px-4 py-3 text-sm leading-relaxed text-ink">
                  {saoTram(tram) >= 3 ? tr("Hoàn hảo! Ta không cần sửa chữ nào.", "Parfait ! Rien à corriger.", "Perfect! Nothing to fix.")
                    : saoTram(tram) >= 1 ? tr("Đạt rồi, trạm sau đã mở! Muốn đủ 3 sao thì làm lại những câu còn điểm thấp.", "Validé, l'étape suivante est ouverte ! Refais les phrases faibles pour 3 étoiles.", "Passed, the next stop is open! Redo the weaker sentences for 3 stars.")
                      : tr("Chưa đủ để mở trạm sau (cần trung bình từ 50%). Nghe chậm lại rồi thử lần nữa nhé.", "Pas encore assez pour l'étape suivante (50 % de moyenne). Réécoute plus lentement.", "Not enough yet for the next stop (50% average needed). Try again more slowly.")}
                </p>
              </div>
            </div>
            <ul className="m-0 grid list-none gap-1.5 p-0">
              {cauTram.map((c, i) => {
                const d = dCau(c.id);
                return (
                  <li key={c.id}>
                    <button type="button" onClick={() => { setKet(false); setDang(i); }}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-solid border-line bg-surface p-2.5 text-left font-sans hover:border-primary/40">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-extrabold tabular-nums ${mauDiem(d)}`}>{d != null ? Math.round(d * 100) : "–"}</span>
                      <span lang="fr" className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{d != null || loai === "phat_am" ? choTrong(c.cau) : `${tr("Câu", "Phrase", "Sentence")} ${i + 1}`}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap justify-between gap-2">
              <button type="button" onClick={raBanDo} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-surface2 px-4 py-2 font-sans text-sm font-bold text-ink"><ArrowLeft size={14} /> {tr("Bản đồ", "Carte", "Map")}</button>
              {saoTram(tram) >= 1 && tram + 1 < cacTram.length && (
                <button type="button" onClick={() => vaoTram(tram + 1)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-4 py-2 font-sans text-sm font-bold text-on-primary">{tr("Trạm tiếp", "Étape suivante", "Next stop")} <ArrowRight size={14} /></button>
              )}
            </div>
          </div>
        </section>
      ) : cau ? (
        <section className="mcf-cau-vao mt-5 rounded-3xl border border-solid border-line bg-surface p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]" key={cau.id}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <button type="button" onClick={raBanDo} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-surface2 px-3 py-1.5 font-sans text-xs font-bold text-ink"><ArrowLeft size={13} /> {tr("Bản đồ", "Carte", "Map")}</button>
            <span className={`text-xs font-extrabold uppercase tracking-[0.14em] ${cd.chu}`}>{BIEU_TUONG[tram % BIEU_TUONG.length]} {tr("Trạm", "Étape", "Stop")} {tram + 1} · {dang + 1}/{cauTram.length}</span>
          </div>
          <div className="mb-4 flex items-center gap-1.5" aria-hidden>
            {cauTram.map((c, i) => <span key={c.id} className={`h-2 flex-1 rounded-full ${i === dang ? "bg-primary" : dCau(c.id) != null ? "bg-ok" : "bg-surface2"}`} />)}
          </div>
          {loai === "phat_am" && (
            <div className="mb-4">
              <p className="m-0 text-2xl font-extrabold leading-snug text-ink" lang="fr">{choTrong(cau.cau)}</p>
              {cau.nghia && <p className="m-0 mt-1 text-sm text-soft">{cau.nghia}</p>}
            </div>
          )}
          {loai === "chinh_ta" ? <ChepChinhTa cau={cau} onXong={ghiDiem} /> : loai === "dien_tu" ? <DienTu cau={cau} onXong={ghiDiem} /> : <PhatAm cau={cau} onXong={ghiDiem} />}
          <div className="mt-5 flex justify-between gap-2 border-0 border-t border-solid border-line pt-4">
            <button type="button" disabled={dang === 0} onClick={() => setDang(dang - 1)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-surface2 px-4 py-2 font-sans text-sm font-bold text-ink disabled:opacity-40"><ArrowLeft size={14} /> {tr("Câu trước", "Précédente", "Previous")}</button>
            <button type="button" onClick={() => { if (dang + 1 >= cauTram.length) { setKet(true); phat(saoTram(tram) >= 1 ? "thang" : "tiep"); } else { phat("tiep"); setDang(dang + 1); } }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-4 py-2 font-sans text-sm font-bold text-on-primary">
              {dang + 1 >= cauTram.length ? tr("Kết thúc trạm", "Fin de l'étape", "Finish stop") : tr("Câu tiếp", "Suivante", "Next")} <ArrowRight size={14} />
            </button>
          </div>
        </section>
      ) : (
        <section className="mcf-cau-vao mt-5 overflow-hidden rounded-[2rem] bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className={`bg-gradient-to-r ${cd.nen} p-5 text-white`}>
            <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-white/80">{cap} · {cacTram.length} {tr("trạm", "étapes", "stops")}</p>
            <h2 className="m-0 mt-1 text-2xl font-extrabold">{cd.ten}</h2>
            <div className="mt-3 flex items-start gap-3">
              <Leon cam="nhay-mat" size={56} className="shrink-0" />
              <p className="m-0 rounded-3xl rounded-tl-md bg-white/15 px-4 py-3 text-sm leading-relaxed">{cd.mo}</p>
            </div>
          </div>
          <ol className="m-0 grid list-none grid-cols-2 gap-3 p-5 sm:grid-cols-4">
            {cacTram.map((t, k) => {
              const khoa = k > 0 && saoTram(k - 1) < 1;
              const daLam = t.filter((c) => dCau(c.id) != null).length;
              return (
                <li key={k} className="mcf-cau-vao" style={{ animationDelay: `${k * 40}ms` }}>
                  <button type="button" disabled={khoa} onClick={() => vaoTram(k)}
                    className={`flex w-full cursor-pointer flex-col items-center gap-1 rounded-3xl border-2 border-solid ${cd.vien} bg-surface p-3 font-sans transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0`}>
                    <span className="text-2xl" aria-hidden>{khoa ? "🔒" : BIEU_TUONG[k % BIEU_TUONG.length]}</span>
                    <span className={`text-xs font-extrabold uppercase tracking-wider ${cd.chu}`}>{tr("Trạm", "Étape", "Stop")} {k + 1}</span>
                    <Sao n={saoTram(k)} />
                    <span className="text-[11px] font-semibold text-soft">{daLam}/{t.length} {tr("câu", "phrases", "done")}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
