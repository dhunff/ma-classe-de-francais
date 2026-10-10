import React, { useEffect, useMemo, useRef, useState } from "react";
import { Headphones, Mic, Square, Play, Turtle, RotateCcw, ArrowRight, ArrowLeft, Check, Lightbulb, Loader2, PenLine, Info } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";
import NutTieng from "../../shared/NutTieng.jsx";
import { soCau } from "../../../supabase/functions/_shared/soCau.js";

/* « Nghe & Nói » (10/10): chép chính tả + luyện phát âm.
 *
 * Kho câu ở cau_luyen (migration 131), audio là GIỌNG TỔNG HỢP và màn hình nói
 * rõ điều đó. Chép chính tả chấm ngay trong trình duyệt bằng soCau (tính dấu)
 * rồi ghi qua RPC ghi_chinh_ta. Phát âm gửi bản ghi âm cho Edge Function
 * cham-phat-am: AI chép lại, so từng từ; điểm là « máy nghe ra đúng bao nhiêu
 * từ », không phải một con số phát âm bịa ra. Bản ghi âm không được lưu. */

const CAP = ["A1", "A2", "B1", "B2"];
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
      <textarea ref={oNhap} value={go} onChange={(e) => setGo(e.target.value)} rows={3} disabled={!!kq}
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
          <p className="m-0 text-sm text-ink"><strong lang="fr">{cau.cau}</strong></p>
          {cau.nghia && <p className="m-0 text-sm text-soft">{cau.nghia}</p>}
          <button type="button" onClick={() => { setKq(null); setGo(""); }}
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-transparent px-0 font-sans text-sm font-bold text-primary"><RotateCcw size={14} /> {tr("Làm lại câu này", "Refaire", "Try again")}</button>
        </div>
      )}
    </div>
  );
}

function PhatAm({ cau, onXong }) {
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
      setLoi(d?.ma === "HET_LUOT" ? tr(`Hôm nay bạn đã dùng hết ${d.han_muc} lượt chấm phát âm. Mai luyện tiếp nhé, VIP không giới hạn.`, `Vous avez utilisé vos ${d.han_muc} essais du jour. VIP : illimité.`, `You've used today's ${d.han_muc} tries. VIP is unlimited.`)
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

export default function NgheNoi() {
  const [loai, setLoai] = useState("chinh_ta");
  const [cap, setCap] = useState("A1");
  const [ds, setDs] = useState(undefined);
  const [diem, setDiem] = useState(new Map());     // cau_id → điểm tốt nhất
  const [dang, setDang] = useState(null);           // chỉ số câu đang làm

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
      const { data: kq } = await supabase.from("cau_luyen_ket_qua").select("cau_id, diem").eq("user_id", uid);
      const m = new Map();
      for (const r of kq ?? []) m.set(r.cau_id, Math.max(m.get(r.cau_id) ?? 0, Number(r.diem)));
      if (con) setDiem(m);
    })();
    return () => { con = false; };
  }, []);

  const loc = useMemo(() => (ds || []).filter((c) => c.loai === loai && c.cap === cap), [ds, loai, cap]);
  const cau = dang != null ? loc[dang] : null;
  const xongCap = loc.filter((c) => (diem.get(c.id) ?? 0) >= 0.9).length;
  const ghiDiem = (d) => setDiem((m) => new Map(m).set(cau.id, Math.max(m.get(cau.id) ?? 0, d)));

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <header className="mcf-cau-vao relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-600 p-6 text-white shadow-[0_20px_50px_rgba(192,38,211,0.3)]">
        <span aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <Leon cam={loai === "phat_am" ? "chao" : "lam-viec"} size={104} className="mcf-leon-bay shrink-0 drop-shadow-[0_12px_18px_rgba(0,0,0,0.3)] max-sm:h-20 max-sm:w-20" />
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-3xl font-extrabold tracking-tight">{tr("Nghe & Nói", "Écoute & Oral", "Listen & Speak")}</h1>
            <p className="m-0 mt-1 text-sm text-white/85">{tr("Chép chính tả từng câu và luyện đọc cho máy nghe ra đúng.", "Dictées phrase par phrase et lecture à voix haute reconnue par la machine.", "Sentence dictations and read-aloud practice checked by speech recognition.")}</p>
          </div>
          <NutTieng className="border-white/30 bg-white/15 text-white hover:border-white hover:text-white" />
        </div>
        <div className="relative mt-5 inline-flex gap-1 rounded-2xl bg-white/15 p-1.5">
          {[["chinh_ta", PenLine, tr("Chép chính tả", "Dictée", "Dictation")], ["phat_am", Mic, tr("Phát âm", "Prononciation", "Pronunciation")]].map(([k, Icon, nhan]) => (
            <button key={k} type="button" onClick={() => { if (k !== loai) phat("tiep"); setLoai(k); setDang(null); }}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 px-4 py-2 font-sans text-sm font-extrabold transition-all ${loai === k ? "bg-white text-fuchsia-700 shadow" : "bg-transparent text-white hover:bg-white/15"}`}>
              <Icon size={15} /> {nhan}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {CAP.map((c) => (
          <button key={c} type="button" onClick={() => { setCap(c); setDang(null); phat("bam"); }}
            className={`cursor-pointer rounded-2xl border-2 border-solid px-4 py-2 font-sans text-sm font-extrabold transition-all ${cap === c ? "border-primary bg-primary text-white shadow-md" : "border-line bg-surface text-ink hover:border-primary/50"}`}>{c}</button>
        ))}
        {loc.length > 0 && <span className="ml-auto text-xs font-bold text-soft">{tr(`Hoàn thành ${xongCap}/${loc.length} câu (từ 90%)`, `${xongCap}/${loc.length} réussies (≥ 90 %)`, `${xongCap}/${loc.length} done (≥ 90%)`)}</span>}
      </div>
      <p className="m-0 mt-2 flex items-center gap-1.5 text-[11px] text-soft"><Info size={12} /> {tr("Câu mẫu đọc bằng giọng tổng hợp (AI), không phải người bản xứ thu âm.", "Les modèles sont lus par une voix de synthèse (IA).", "Model sentences use a synthetic (AI) voice.")}</p>

      {ds === undefined ? (
        <p className="mt-8 text-center text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
      ) : ds === null ? (
        <p className="mt-8 text-center text-sm text-danger">{tr("Không tải được kho câu. Kiểm tra mạng rồi thử lại.", "Impossible de charger les phrases.", "Couldn't load sentences.")}</p>
      ) : cau ? (
        <section className="mcf-cau-vao mt-5 rounded-3xl border border-solid border-line bg-surface p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]" key={cau.id}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setDang(null)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-surface2 px-3 py-1.5 font-sans text-xs font-bold text-ink"><ArrowLeft size={13} /> {tr("Danh sách", "Liste", "List")}</button>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-soft">{cap} · {tr("Câu", "Phrase", "Sentence")} {dang + 1}/{loc.length}</span>
          </div>
          {loai === "phat_am" && (
            <div className="mb-4">
              <p className="m-0 text-2xl font-extrabold leading-snug text-ink" lang="fr">{cau.cau}</p>
              {cau.nghia && <p className="m-0 mt-1 text-sm text-soft">{cau.nghia}</p>}
            </div>
          )}
          {loai === "chinh_ta" ? <ChepChinhTa cau={cau} onXong={ghiDiem} /> : <PhatAm cau={cau} onXong={ghiDiem} />}
          <div className="mt-5 flex justify-between gap-2 border-0 border-t border-solid border-line pt-4">
            <button type="button" disabled={dang === 0} onClick={() => setDang(dang - 1)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-surface2 px-4 py-2 font-sans text-sm font-bold text-ink disabled:opacity-40"><ArrowLeft size={14} /> {tr("Câu trước", "Précédente", "Previous")}</button>
            <button type="button" disabled={dang >= loc.length - 1} onClick={() => { phat("tiep"); setDang(dang + 1); }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-4 py-2 font-sans text-sm font-bold text-on-primary disabled:opacity-40">{tr("Câu tiếp", "Suivante", "Next")} <ArrowRight size={14} /></button>
          </div>
        </section>
      ) : (
        <ul className="m-0 mt-5 grid list-none gap-2.5 p-0 sm:grid-cols-2">
          {loc.map((c, i) => {
            const d = diem.get(c.id);
            return (
              <li key={c.id} className="mcf-cau-vao" style={{ animationDelay: `${i * 40}ms` }}>
                <button type="button" onClick={() => { phat("bam"); setDang(i); }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-solid border-line bg-surface p-3.5 text-left font-sans transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold tabular-nums ${mauDiem(d)}`}>
                    {d != null ? `${Math.round(d * 100)}` : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink" lang="fr">
                      {loai === "chinh_ta" ? (d != null ? c.cau : tr("Câu chép chính tả", "Dictée", "Dictation") + ` ${i + 1}`) : c.cau}
                    </span>
                    <span className="block truncate text-xs text-soft">{loai === "chinh_ta" && d == null ? tr("Nghe rồi gõ lại", "Écoutez puis écrivez", "Listen then type") : c.nghia}</span>
                  </span>
                  {loai === "chinh_ta" ? <Headphones size={16} className="shrink-0 text-soft" /> : <Mic size={16} className="shrink-0 text-soft" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
