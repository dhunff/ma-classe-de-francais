import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Send, Smile, X, Crown } from "lucide-react";
import { supabase } from "../storageShim.js";
import { LangCtx, tr } from "./i18n.jsx";
import { Leon, BangSticker, nhanSticker } from "./leon.jsx";

/* Hỏi Leon (09/10): khung chat nổi góc phải dưới, chỉ cho học sinh.
 *
 * Ẩn ở màn thi thử và khi đang làm bài (FocusShell gắn .mcf-focus lên body):
 * hỏi AI giữa giờ thi là gian lận, dù chỉ hỏi ngữ pháp.
 * Lịch sử đọc từ leon_hoi (migration 125, chỉ đọc dòng của mình). Câu trả lời
 * do Edge Function `hoi-leon` sinh và ghi.
 *
 * Sticker học sinh gửi KHÔNG gọi AI và không tốn lượt: Leon đáp lại bằng một
 * sticker hợp cảm xúc, chỉ trong phiên này. */

const DAP_STICKER = {
  chao: "chao", "tam-biet": "tam-biet", buon: "co-len", gian: "xin-loi", "xin-loi": "ok",
  "yeu-qua": "yeu-qua", haha: "haha", hum: "suy-nghi", "buon-ngu": "co-len", "lam-viec": "hoc",
};

/* Markdown nhẹ → phần tử React (không dùng innerHTML): **đậm**, *nghiêng*,
   dòng bắt đầu bằng - hoặc • thành gạch đầu dòng. */
function dongChu(s, k) {
  const out = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let cuoi = 0, m, i = 0;
  while ((m = re.exec(s))) {
    if (m.index > cuoi) out.push(s.slice(cuoi, m.index));
    out.push(m[1] ? <strong key={`${k}-${i++}`}>{m[1]}</strong> : <em key={`${k}-${i++}`}>{m[2]}</em>);
    cuoi = m.index + m[0].length;
  }
  if (cuoi < s.length) out.push(s.slice(cuoi));
  return out;
}
function VanBan({ text }) {
  const dong = String(text).split(/\r?\n/);
  const khoi = [];
  let ds = null;
  dong.forEach((d, i) => {
    const m = /^\s*(?:[-•]|\d+\.)\s+(.*)$/.exec(d);
    if (m) { if (!ds) { ds = []; khoi.push(ds); } ds.push(<li key={i}>{dongChu(m[1], i)}</li>); return; }
    ds = null;
    if (d.trim()) khoi.push(<p key={i} className="m-0">{dongChu(d, i)}</p>);
  });
  return (
    <div className="grid gap-1.5">
      {khoi.map((b, i) => Array.isArray(b) ? <ul key={`u${i}`} className="m-0 grid gap-0.5 pl-4">{b}</ul> : b)}
    </div>
  );
}

const loiMa = (ma, d) => ({
  HET_LUOT: tr(`Ohlala, hôm nay bạn đã hỏi đủ ${d?.han_muc ?? 10} câu rồi! Mai Leon trả lời tiếp nhé. Gói VIP thì hỏi không giới hạn.`,
    `Ohlala, tu as posé tes ${d?.han_muc ?? 10} questions du jour ! Leon te répond demain. Avec le VIP, c'est illimité.`,
    `Ohlala, you've used your ${d?.han_muc ?? 10} questions for today! Leon will answer again tomorrow. VIP is unlimited.`),
  CHUA_CAU_HINH_KHOA: tr("Leon chưa được bật trên máy chủ. Đây là việc của người quản trị.", "Leon n'est pas encore activé sur le serveur.", "Leon isn't enabled on the server yet."),
  QUA_DAI: tr("Câu hỏi dài quá, bạn rút gọn dưới 1000 ký tự nhé.", "Question trop longue (1000 caractères max).", "Question too long (1000 characters max)."),
  CHUA_DANG_NHAP: tr("Phiên đăng nhập đã hết hạn. Đăng nhập lại nhé.", "Session expirée. Reconnecte-toi.", "Session expired. Please sign in again."),
}[ma] ?? tr("Leon chưa trả lời được. Thử lại sau ít phút nhé.", "Leon n'a pas pu répondre. Réessaie dans un instant.", "Leon couldn't answer. Try again in a moment."));

export default function HoiLeon() {
  const lang = useContext(LangCtx);
  const loc = useLocation();
  const [mo, setMo] = useState(false);
  const [tin, setTin] = useState(null);      // null = chưa nạp
  const [go, setGo] = useState("");
  const [cho, setCho] = useState(false);
  const [moSticker, setMoSticker] = useState(false);
  const [conLai, setConLai] = useState(undefined);
  const [focus, setFocus] = useState(false);
  const cuon = useRef(null);

  /* Theo dõi chế độ làm bài tập trung. */
  useEffect(() => {
    const xem = () => setFocus(!!document.querySelector(".mcf-focus, [data-che-do-thi]"));
    xem();
    const ob = new MutationObserver(xem);
    ob.observe(document.body, { childList: true, subtree: true });
    return () => ob.disconnect();
  }, []);

  useEffect(() => {
    if (!mo || tin !== null) return;
    let c = true;
    supabase.from("leon_hoi").select("cau_hoi, tra_loi, cam, created_at").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (!c) return;
        setTin((data ?? []).reverse().flatMap((r) => [{ ai: "hs", chu: r.cau_hoi }, { ai: "leon", chu: r.tra_loi, cam: r.cam }]));
      });
    return () => { c = false; };
  }, [mo, tin]);

  useEffect(() => { cuon.current?.scrollTo({ top: 1e6, behavior: "smooth" }); }, [tin, cho, mo]);

  if (loc.pathname.startsWith("/etudiant/examen") || focus) return null;

  const gui = async () => {
    const q = go.trim();
    if (!q || cho) return;
    setGo(""); setCho(true); setMoSticker(false);
    setTin((t) => [...(t ?? []), { ai: "hs", chu: q }]);
    const { data, error } = await supabase.functions.invoke("hoi-leon", { body: { cauHoi: q, lang } });
    let d = data;
    if (error) { try { d = await error.context?.json?.(); } catch { d = null; } }
    if (d?.ok) {
      setTin((t) => [...t, { ai: "leon", chu: d.tra_loi, cam: d.cam }]);
      setConLai(d.vip ? null : d.con_lai);
    } else {
      setTin((t) => [...t, { ai: "leon", chu: loiMa(d?.ma, d), cam: d?.ma === "HET_LUOT" ? "buon" : "xin-loi", loi: true }]);
      if (d?.ma === "HET_LUOT") setConLai(0);
    }
    setCho(false);
  };

  const guiSticker = (id) => {
    setMoSticker(false);
    setTin((t) => [...(t ?? []), { ai: "hs", sticker: id }, { ai: "leon", sticker: DAP_STICKER[id] ?? id }]);
  };

  return (
    <>
      {mo && (
        <section role="dialog" aria-label={tr("Hỏi Leon", "Demande à Leon", "Ask Leon")}
          className="fixed bottom-24 right-4 z-[55] flex h-[min(560px,calc(100vh-8rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl bg-surface shadow-[0_20px_60px_rgb(0,0,0,0.25)]">
          <header className="flex items-center gap-3 bg-primary px-4 py-3 text-on-primary">
            <Leon cam="dau" size={40} />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm font-extrabold">Leon</p>
              <p className="m-0 text-[11px] text-on-primary/80">
                {conLai === null ? <span className="inline-flex items-center gap-1"><Crown size={11} /> {tr("VIP: hỏi không giới hạn", "VIP : illimité", "VIP: unlimited")}</span>
                  : conLai !== undefined ? tr(`Còn ${conLai} câu hỏi hôm nay`, `Encore ${conLai} question(s) aujourd'hui`, `${conLai} question(s) left today`)
                  : tr("Bạn đồng hành học tiếng Pháp", "Ton compagnon de français", "Your French buddy")}
              </p>
            </div>
            <button type="button" onClick={() => setMo(false)} aria-label={tr("Đóng", "Fermer", "Close")}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-on-primary hover:bg-white/25"><X size={16} /></button>
          </header>

          <div ref={cuon} className="mcf-scroll flex-1 overflow-y-auto px-3 py-4">
            <div className="grid gap-3">
              <div className="flex items-end gap-2">
                <Leon cam="chao" size={44} className="shrink-0" />
                <div className="rounded-2xl rounded-bl-md bg-primary-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">
                  {tr(<>Gâu! <em>Bonjour</em>! Leon đây 🐾 Bạn muốn hỏi gì về ngữ pháp, từ vựng hay bài DELF nào? Gửi một câu tiếng Pháp, Leon sửa giúp cho!</>,
                    <>Ouaf ! <em>Bonjour</em> ! C'est Leon 🐾 Une question de grammaire, de vocabulaire ou sur le DELF ? Envoie-moi une phrase, je la corrige !</>,
                    <>Woof! <em>Bonjour</em>! It's Leon 🐾 Any question about grammar, vocabulary or the DELF? Send me a French sentence and I'll fix it!</>)}
                </div>
              </div>
              {tin === null && <p className="m-0 text-center text-xs text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>}
              {(tin ?? []).map((m, i) => m.ai === "hs" ? (
                <div key={i} className="flex justify-end">
                  {m.sticker ? <Leon cam={m.sticker} size={88} />
                    : <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[13px] leading-relaxed text-on-primary">{m.chu}</div>}
                </div>
              ) : (
                <div key={i} className="flex items-end gap-2">
                  {m.sticker ? <Leon cam={m.sticker} size={88} alt={nhanSticker(m.sticker)} /> : (
                    <>
                      <Leon cam={m.cam || "chao"} size={44} className="shrink-0" />
                      <div className={`max-w-[85%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] leading-relaxed text-ink ${m.loi ? "bg-warn-soft" : "bg-primary-soft"}`}>
                        <VanBan text={m.chu} />
                      </div>
                    </>
                  )}
                </div>
              ))}
              {cho && (
                <div className="flex items-end gap-2">
                  <Leon cam="suy-nghi" size={44} className="shrink-0" />
                  <div className="rounded-2xl rounded-bl-md bg-primary-soft px-3.5 py-2.5 text-[13px] text-soft">{tr("Leon đang nghĩ…", "Leon réfléchit…", "Leon is thinking…")}</div>
                </div>
              )}
            </div>
          </div>

          {moSticker && <BangSticker onChon={guiSticker} className="border-0 border-t border-solid border-line bg-surface p-2" />}
          <form onSubmit={(e) => { e.preventDefault(); gui(); }} className="flex items-end gap-2 border-0 border-t border-solid border-line p-2.5">
            <button type="button" onClick={() => setMoSticker(!moSticker)} aria-label={tr("Sticker", "Autocollants", "Stickers")}
              className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 ${moSticker ? "bg-primary-soft text-primary" : "bg-transparent text-soft hover:bg-surface2"}`}><Smile size={20} /></button>
            <textarea value={go} onChange={(e) => setGo(e.target.value.slice(0, 1000))} rows={1}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); gui(); } }}
              placeholder={tr("Hỏi Leon…", "Demande à Leon…", "Ask Leon…")}
              className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-solid border-line bg-surface2 px-3 py-2.5 font-sans text-[13px] text-ink outline-none focus:border-primary" />
            <button type="submit" disabled={!go.trim() || cho} aria-label={tr("Gửi", "Envoyer", "Send")}
              className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-primary text-on-primary disabled:cursor-not-allowed disabled:opacity-40"><Send size={17} /></button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setMo(!mo)} aria-label={tr("Hỏi Leon", "Demande à Leon", "Ask Leon")} title={tr("Hỏi Leon", "Demande à Leon", "Ask Leon")}
        className="mcf-leon-nut fixed bottom-5 right-4 z-[55] grid h-16 w-16 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 drop-shadow-[0_8px_16px_rgb(0,0,0,0.25)] transition-transform hover:-translate-y-1">
        <Leon cam="dau" size={64} />
      </button>
    </>
  );
}
