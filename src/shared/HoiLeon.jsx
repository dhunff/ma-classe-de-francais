import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { Send, Smile, X, Crown, Settings2, Lightbulb, ChevronsRight, Check } from "lucide-react";
import { supabase } from "../storageShim.js";
import { LangCtx, tr } from "./i18n.jsx";
import { loiTranVip } from "./loiTranVip.js";
import { baoHetLuot } from "./HetLuot.jsx";
import { Leon, BangSticker, nhanSticker } from "./leon.jsx";
import { goiYTheoTrang, cauTiepTheo } from "../content/goiYLeon.js";

/* Hỏi Léon (09/10): khung chat nổi góc phải dưới, chỉ cho học sinh.
 *
 * Ẩn ở màn thi thử và khi đang làm bài (FocusShell gắn .mcf-focus lên body):
 * hỏi AI giữa giờ thi là gian lận, dù chỉ hỏi ngữ pháp.
 * Lịch sử đọc từ leon_hoi (migration 125, chỉ đọc dòng của mình). Câu trả lời
 * do Edge Function `hoi-leon` sinh và ghi.
 *
 * Sticker học sinh gửi KHÔNG gọi AI và không tốn lượt: Léon đáp lại bằng một
 * sticker hợp cảm xúc, chỉ trong phiên này.
 *
 * 18/11 (chủ dự án): câu hỏi gợi ý bấm là gửi (content/goiYLeon.js, theo trình độ hồ sơ và trang đang mở),
 * « câu hỏi tiếp theo » dưới mỗi câu trả lời, chuyển động (framer-motion, tắt khi giảm chuyển động), chủ đề
 * màu đổi được (bộ biến --l-… ở base.css, nhớ ở localStorage `mcf-leon-theme`) và cỡ chữ (`mcf-leon-co`).
 * Câu gợi ý tính vào hạn mức như câu tự gõ. `thu`: dữ liệu giả cho /preview.html, bỏ qua mọi lời gọi mạng. */

const DAP_STICKER = {
  chao: "chao", "tam-biet": "tam-biet", buon: "co-len", gian: "xin-loi", "xin-loi": "ok",
  "yeu-qua": "yeu-qua", haha: "haha", hum: "suy-nghi", "buon-ngu": "co-len", "lam-viec": "hoc",
};

/* Chủ đề màu: mã khớp data-chu-de trong base.css; `mau` chỉ để vẽ ô chọn. */
const CHU_DE = () => [
  { ma: "mac-dinh", ten: tr("Mặc định", "Par défaut", "Default"), mau: ["rgb(var(--mcf-primary-rgb))", "rgb(var(--mcf-primary-rgb))"] },
  { ma: "tricolore", ten: "Bleu-Blanc-Rouge", mau: ["#002395", "#c8102e"] },
  { ma: "hoang-hon", ten: tr("Hoàng hôn", "Coucher de soleil", "Sunset"), mau: ["#c2410c", "#be185d"] },
  { ma: "rung", ten: tr("Rừng xanh", "Forêt", "Forest"), mau: ["#166534", "#0f766e"] },
  { ma: "dem", ten: tr("Đêm", "Nuit", "Night"), mau: ["#312e81", "#6d28d9"] },
  { ma: "keo-ngot", ten: tr("Kẹo ngọt", "Bonbon", "Candy"), mau: ["#be185d", "#7c3aed"] },
];
const CO_CHU = { nho: "12px", vua: "13.5px", lon: "15.5px" };
const doc = (k, md) => { try { return localStorage.getItem(k) || md; } catch { return md; } };
const ghi = (k, v) => { try { localStorage.setItem(k, v); } catch { /* chế độ riêng tư: bỏ qua */ } };
const homNay = () => new Date().toLocaleDateString("sv-SE");

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

/* Câu trả lời MỚI hiện chữ dần (nhanh, theo cụm ký tự); bấm « Hiện hết » để bỏ qua.
   Giảm chuyển động thì hiện ngay. Câu trong lịch sử không chạy hiệu ứng này. */
function GoChu({ text, chay }) {
  const giam = useReducedMotion();
  const [n, setN] = useState(chay && !giam ? 0 : text.length);
  useEffect(() => {
    if (n >= text.length) return undefined;
    const id = setTimeout(() => setN((x) => Math.min(text.length, x + Math.max(2, Math.ceil(text.length / 120)))), 16);
    return () => clearTimeout(id);
  }, [n, text]); // eslint-disable-line react-hooks/exhaustive-deps
  const dangGo = n < text.length;
  return (
    <>
      <VanBan text={dangGo ? text.slice(0, n) : text} />
      {dangGo && (
        <button type="button" onClick={() => setN(text.length)}
          className="mt-1.5 inline-flex cursor-pointer items-center gap-1 rounded-full border-0 bg-transparent p-0 text-[11px] font-bold text-[var(--l-mo)] hover:underline">
          <ChevronsRight size={12} /> {tr("Hiện hết", "Tout afficher", "Show all")}
        </button>
      )}
    </>
  );
}

const loiMa = (ma, d) => ({
  HET_LUOT_VIP: loiTranVip(),
  HET_LUOT: tr(`Ohlala, hôm nay bạn đã hỏi đủ ${d?.han_muc ?? 10} câu rồi! Mai Léon trả lời tiếp nhé. Gói VIP được tới 100 lượt AI mỗi ngày.`,
    `Ohlala, tu as posé tes ${d?.han_muc ?? 10} questions du jour ! Léon te répond demain. Avec le VIP : jusqu'à 100 requêtes IA par jour.`,
    `Ohlala, you've used your ${d?.han_muc ?? 10} questions for today! Léon will answer again tomorrow. VIP gets up to 100 AI requests a day.`),
  CHUA_CAU_HINH_KHOA: tr("Léon chưa được bật trên máy chủ. Đây là việc của người quản trị.", "Léon n'est pas encore activé sur le serveur.", "Léon isn't enabled on the server yet."),
  QUA_DAI: tr("Câu hỏi dài quá, bạn rút gọn dưới 1000 ký tự nhé.", "Question trop longue (1000 caractères max).", "Question too long (1000 characters max)."),
  CHUA_DANG_NHAP: tr("Phiên đăng nhập đã hết hạn. Đăng nhập lại nhé.", "Session expirée. Reconnecte-toi.", "Session expired. Please sign in again."),
}[ma] ?? tr("Léon chưa trả lời được. Thử lại sau ít phút nhé.", "Léon n'a pas pu répondre. Réessaie dans un instant.", "Léon couldn't answer. Try again in a moment."));

/* Danh sách câu gợi ý theo nhóm. `gon`: bản thu gọn mở bằng nút « Gợi ý » khi đã có lịch sử. */
function GoiY({ nhom, onChon, gon = false }) {
  const [chon, setChon] = useState(nhom[0]?.ma);
  const hien = nhom.find((x) => x.ma === chon) ?? nhom[0];
  return (
    <div className={gon ? "" : "mt-1"}>
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist">
        {nhom.map((x) => (
          <button key={x.ma} type="button" role="tab" aria-selected={x.ma === chon} onClick={() => setChon(x.ma)}
            className={`shrink-0 cursor-pointer rounded-full border-0 px-3 py-1 text-[11.5px] font-bold transition-colors ${x.ma === chon ? "bg-[var(--l-nhan)] text-[var(--l-chu-nhan)]" : "bg-[var(--l-chip)] text-[var(--l-chu-chip)] hover:opacity-90"}`}>
            {x.ten}
          </button>
        ))}
      </div>
      <motion.ul key={hien?.ma} initial="an" animate="hien" variants={{ hien: { transition: { staggerChildren: 0.05 } } }} className="m-0 mt-1.5 grid list-none gap-1.5 p-0">
        {(hien?.cau ?? []).map((c) => (
          <motion.li key={c} variants={{ an: { opacity: 0, y: 6 }, hien: { opacity: 1, y: 0 } }}>
            <button type="button" onClick={() => onChon(c)}
              className="flex w-full cursor-pointer items-start gap-2 rounded-xl border border-solid border-[var(--l-vien)] bg-[var(--l-nen)] px-3 py-2 text-left font-sans text-[12.5px] leading-snug text-[var(--l-chu)] transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[var(--l-nhan)]">
              <Lightbulb size={13} className="mt-0.5 shrink-0 text-[var(--l-chu-chip)]" /> <span>{c}</span>
            </button>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default function HoiLeon({ thu = null }) {
  const lang = useContext(LangCtx);
  const loc = useLocation();
  const [mo, setMo] = useState(!!thu?.mo);
  const [tin, setTin] = useState(thu ? thu.tin ?? [] : null);      // null = chưa nạp
  const [go, setGo] = useState("");
  const [cho, setCho] = useState(false);
  const [moSticker, setMoSticker] = useState(false);
  const [moGoiY, setMoGoiY] = useState(false);
  const [moCaiDat, setMoCaiDat] = useState(false);
  const [conLai, setConLai] = useState(thu?.conLai);
  const [focus, setFocus] = useState(false);
  const [level, setLevel] = useState(thu?.level ?? "");
  const [chuDe, setChuDe] = useState(() => doc("mcf-leon-theme", "mac-dinh"));
  const [co, setCo] = useState(() => doc("mcf-leon-co", "vua"));
  const [moiHomNay, setMoiHomNay] = useState(() => doc("mcf-leon-mo", "") !== homNay());
  const cuon = useRef(null);
  /* Bóng thoại chào cạnh nút mở: tự hiện một lần mỗi phiên (sau 2,5 s, trong 5 s), và khi rê chuột. */
  const [chao, setChao] = useState(!!thu?.chao);
  const [re, setRe] = useState(false);
  useEffect(() => {
    if (thu) return undefined;
    let daChao = false;
    try { daChao = sessionStorage.getItem("mcf-leon-chao") === "1"; } catch { /* trình duyệt chặn lưu trữ */ }
    if (daChao) return undefined;
    const t1 = setTimeout(() => { setChao(true); try { sessionStorage.setItem("mcf-leon-chao", "1"); } catch { /* bỏ qua */ } }, 2500);
    const t2 = setTimeout(() => setChao(false), 7500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [thu]);

  /* Theo dõi chế độ làm bài tập trung. */
  useEffect(() => {
    const xem = () => setFocus(!!document.querySelector(".mcf-focus, [data-che-do-thi]"));
    xem();
    const ob = new MutationObserver(xem);
    ob.observe(document.body, { childList: true, subtree: true });
    return () => ob.disconnect();
  }, []);

  useEffect(() => {
    if (thu || !mo || tin !== null) return undefined;
    let c = true;
    supabase.from("leon_hoi").select("cau_hoi, tra_loi, cam, created_at").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (!c) return;
        setTin((data ?? []).reverse().flatMap((r) => [{ ai: "hs", chu: r.cau_hoi }, { ai: "leon", chu: r.tra_loi, cam: r.cam }]));
      });
    /* Trình độ trong hồ sơ, để chọn bộ câu gợi ý (A, B1, B2 trở lên). Đọc không được thì dùng bộ B1. */
    supabase.auth.getSession().then(({ data }) => {
      const id = data?.session?.user?.id;
      if (!id) return;
      supabase.from("profiles").select("level").eq("id", id).maybeSingle().then(({ data: p }) => { if (c && p?.level) setLevel(p.level); });
    });
    return () => { c = false; };
  }, [mo, tin, thu]);

  useEffect(() => { cuon.current?.scrollTo({ top: 1e6, behavior: "smooth" }); }, [tin, cho, mo, moGoiY]);

  const nhomGoiY = useMemo(() => goiYTheoTrang(loc.pathname, level), [loc.pathname, level, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!thu && (loc.pathname.startsWith("/etudiant/examen") || focus)) return null;

  const mo_ = () => {
    setMo((v) => !v);
    if (moiHomNay) { setMoiHomNay(false); ghi("mcf-leon-mo", homNay()); }
  };

  const gui = async (cauSan) => {
    const q = String(cauSan ?? go).trim();
    if (!q || cho) return;
    if (cauSan == null) setGo("");
    setCho(true); setMoSticker(false); setMoGoiY(false);
    setTin((t) => [...(t ?? []), { ai: "hs", chu: q, moi: true }]);
    if (thu) {
      /* Xem thử: trả lời giả sau một nhịp, không gọi máy chủ. */
      setTimeout(() => { setTin((t) => [...t, { ai: "leon", chu: thu.traLoi ?? "…", cam: "chao", moi: true }]); setCho(false); }, 900);
      return;
    }
    const { data, error } = await supabase.functions.invoke("hoi-leon", { body: { cauHoi: q, lang } });
    let d = data;
    if (error) { try { d = await error.context?.json?.(); } catch { d = null; } }
    if (d?.ok) {
      setTin((t) => [...t, { ai: "leon", chu: d.tra_loi, cam: d.cam, moi: true }]);
      setConLai(d.vip ? null : d.con_lai);
    } else {
      setTin((t) => [...t, { ai: "leon", chu: loiMa(d?.ma, d), cam: d?.ma === "HET_LUOT" ? "buon" : "xin-loi", loi: true, moi: true }]);
      if (d?.ma === "HET_LUOT") { setConLai(0); baoHetLuot({ loai: "leon", hanMuc: d?.han_muc }); }
    }
    setCho(false);
  };

  const guiSticker = (id) => {
    setMoSticker(false);
    setTin((t) => [...(t ?? []), { ai: "hs", sticker: id, moi: true }, { ai: "leon", sticker: DAP_STICKER[id] ?? id, moi: true }]);
  };

  const doiChuDe = (ma) => { setChuDe(ma); ghi("mcf-leon-theme", ma); };
  const doiCo = (ma) => { setCo(ma); ghi("mcf-leon-co", ma); };

  /* « Câu hỏi tiếp theo » dưới câu trả lời cuối (không với lỗi, sticker, hay khi hết lượt). */
  const ds = tin ?? [];
  const cuoi = ds[ds.length - 1];
  const cauHsCuoi = [...ds].reverse().find((m) => m.ai === "hs" && m.chu)?.chu ?? "";
  const daHoi = ds.filter((m) => m.ai === "hs" && m.chu).map((m) => m.chu);
  const tiep = !cho && cuoi?.ai === "leon" && !cuoi.loi && !cuoi.sticker && conLai !== 0 ? cauTiepTheo(cauHsCuoi, level, daHoi) : [];
  const trong = tin !== null && ds.length === 0;
  const vao = { an: { opacity: 0, y: 10, scale: 0.98 }, hien: { opacity: 1, y: 0, scale: 1 } };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {mo && (
          <motion.section key="khung" role="dialog" aria-label={tr("Hỏi Léon", "Demande à Léon", "Ask Léon")} data-chu-de={chuDe}
            initial={{ opacity: 0, scale: 0.6, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.7, y: 30 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }} style={{ transformOrigin: "100% 100%", "--l-co": CO_CHU[co] ?? CO_CHU.vua }}
            className="leon-chat fixed inset-0 z-[55] flex flex-col overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.25)] sm:inset-auto sm:bottom-24 sm:right-4 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[min(400px,calc(100vw-2rem))] sm:rounded-3xl">
            <header className="relative flex items-center gap-3 px-4 py-3 text-[var(--l-chu-dau)]" style={{ background: "linear-gradient(135deg, var(--l-dau1), var(--l-dau2))" }}>
              <motion.span initial={{ rotate: -12, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}>
                <Leon cam="dau" size={42} />
              </motion.span>
              <div className="min-w-0 flex-1">
                <p className="m-0 flex items-center gap-1.5 text-sm font-extrabold">Léon <span className="h-2 w-2 rounded-full bg-ok" aria-hidden /></p>
                <p className="m-0 text-[11px] opacity-90">
                  {conLai === null ? <span className="inline-flex items-center gap-1"><Crown size={11} /> {tr("VIP: tới 100 lượt AI/ngày", "VIP : jusqu'à 100 requêtes IA/jour", "VIP: up to 100 AI requests/day")}</span>
                    : conLai !== undefined ? tr(`Còn ${conLai} câu hỏi hôm nay`, `Encore ${conLai} question(s) aujourd'hui`, `${conLai} question(s) left today`)
                    : tr("Bạn đồng hành học tiếng Pháp", "Ton compagnon de français", "Your French buddy")}
                </p>
              </div>
              <button type="button" onClick={() => setMoCaiDat((v) => !v)} aria-label={tr("Giao diện khung chat", "Apparence du chat", "Chat appearance")} aria-expanded={moCaiDat}
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-[var(--l-chu-dau)] hover:bg-white/25"><Settings2 size={16} /></button>
              <button type="button" onClick={() => setMo(false)} aria-label={tr("Đóng", "Fermer", "Close")}
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-[var(--l-chu-dau)] hover:bg-white/25"><X size={16} /></button>

              <AnimatePresence>
                {moCaiDat && (
                  <motion.div key="cai-dat" initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.16 }} style={{ transformOrigin: "100% 0%" }}
                    className="absolute right-3 top-full z-10 mt-2 w-64 rounded-2xl border border-solid border-[var(--l-vien)] bg-[var(--l-nen)] p-3 text-[var(--l-chu)] shadow-xl">
                    <p className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-wide text-[var(--l-mo)]">{tr("Chủ đề màu", "Thème", "Theme")}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {CHU_DE().map((x) => (
                        <button key={x.ma} type="button" onClick={() => doiChuDe(x.ma)} aria-pressed={chuDe === x.ma}
                          className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-solid p-1.5 text-[10.5px] font-bold leading-tight ${chuDe === x.ma ? "border-[var(--l-nhan)] bg-[var(--l-chip)] text-[var(--l-chu-chip)]" : "border-[var(--l-vien)] bg-transparent text-[var(--l-chu)] hover:border-[var(--l-mo)]"}`}>
                          <span className="relative grid h-7 w-7 place-items-center rounded-full" style={{ background: `linear-gradient(135deg, ${x.mau[0]}, ${x.mau[1]})` }}>
                            {chuDe === x.ma && <Check size={14} className="text-white" />}
                          </span>
                          <span className="text-center">{x.ten}</span>
                        </button>
                      ))}
                    </div>
                    <p className="m-0 mb-2 mt-3 text-[11px] font-extrabold uppercase tracking-wide text-[var(--l-mo)]">{tr("Cỡ chữ", "Taille du texte", "Text size")}</p>
                    <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--l-o)] p-1">
                      {[["nho", "A", "text-[11px]"], ["vua", "A", "text-[13px]"], ["lon", "A", "text-[16px]"]].map(([ma, chu, lop]) => (
                        <button key={ma} type="button" onClick={() => doiCo(ma)} aria-pressed={co === ma}
                          aria-label={{ nho: tr("Chữ nhỏ", "Petit", "Small"), vua: tr("Chữ vừa", "Moyen", "Medium"), lon: tr("Chữ lớn", "Grand", "Large") }[ma]}
                          className={`cursor-pointer rounded-lg border-0 py-1 font-extrabold ${lop} ${co === ma ? "bg-[var(--l-nen)] text-[var(--l-chu)] shadow-sm" : "bg-transparent text-[var(--l-mo)]"}`}>{chu}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </header>

            <div ref={cuon} className="mcf-scroll flex-1 overflow-y-auto px-3 py-4" style={{ fontSize: "var(--l-co)" }} onClick={() => moCaiDat && setMoCaiDat(false)}>
              <div className="grid gap-3">
                <motion.div initial="an" animate="hien" variants={vao} className="flex items-end gap-2">
                  <Leon cam="chao" size={44} className="shrink-0" />
                  <div className="rounded-2xl rounded-bl-md bg-[var(--l-leon)] px-3.5 py-2.5 leading-relaxed text-[var(--l-chu-leon)]">
                    {tr(<>Gâu! <em>Bonjour</em>! Léon đây 🐾 Bạn muốn hỏi gì về ngữ pháp, từ vựng hay bài DELF nào? Gửi một câu tiếng Pháp, Léon sửa giúp cho!</>,
                      <>Ouaf ! <em>Bonjour</em> ! C'est Léon 🐾 Une question de grammaire, de vocabulaire ou sur le DELF ? Envoie-moi une phrase, je la corrige !</>,
                      <>Woof! <em>Bonjour</em>! It's Léon 🐾 Any question about grammar, vocabulary or the DELF? Send me a French sentence and I'll fix it!</>)}
                  </div>
                </motion.div>

                {tin === null && <p className="m-0 text-center text-xs text-[var(--l-mo)]">{tr("Đang tải…", "Chargement…", "Loading…")}</p>}

                {trong && (
                  <motion.div initial="an" animate="hien" variants={vao} transition={{ delay: 0.12 }} className="rounded-2xl bg-[var(--l-o)] p-3">
                    <p className="m-0 mb-2 text-[12px] font-extrabold text-[var(--l-chu)]">{tr("Chưa biết hỏi gì? Bấm một câu là Léon trả lời ngay:", "Pas d'idée ? Clique sur une question :", "Not sure what to ask? Tap a question:")}</p>
                    <GoiY nhom={nhomGoiY} onChon={gui} />
                  </motion.div>
                )}

                {ds.map((m, i) => (
                  <motion.div key={i} initial={m.moi ? "an" : false} animate="hien" variants={vao} transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className={m.ai === "hs" ? "flex justify-end" : "flex items-end gap-2"}>
                    {m.ai === "hs" ? (
                      m.sticker ? <Leon cam={m.sticker} size={88} />
                        : <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[var(--l-hs)] px-3.5 py-2.5 leading-relaxed text-[var(--l-chu-hs)]">{m.chu}</div>
                    ) : m.sticker ? <Leon cam={m.sticker} size={88} alt={nhanSticker(m.sticker)} /> : (
                      <>
                        <Leon cam={m.cam || "chao"} size={44} className="shrink-0" />
                        <div className={`max-w-[85%] rounded-2xl rounded-bl-md px-3.5 py-2.5 leading-relaxed ${m.loi ? "bg-warn-soft text-ink" : "bg-[var(--l-leon)] text-[var(--l-chu-leon)]"}`}>
                          <GoChu text={String(m.chu ?? "")} chay={!!m.moi && !m.loi} />
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}

                {cho && (
                  <motion.div initial="an" animate="hien" variants={vao} className="flex items-end gap-2">
                    <Leon cam="suy-nghi" size={44} className="shrink-0" />
                    <div className="leon-cham flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-[var(--l-leon)] px-4 py-3.5" aria-label={tr("Léon đang nghĩ…", "Léon réfléchit…", "Léon is thinking…")}>
                      <span /><span /><span />
                    </div>
                  </motion.div>
                )}

                {tiep.length > 0 && (
                  <motion.div initial="an" animate="hien" variants={{ hien: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }} className="ml-[52px] flex flex-wrap gap-1.5">
                    {tiep.map((c) => (
                      <motion.button key={c} type="button" onClick={() => gui(c)} variants={{ an: { opacity: 0, y: 6 }, hien: { opacity: 1, y: 0 } }}
                        className="cursor-pointer rounded-full border border-solid border-[var(--l-vien)] bg-[var(--l-chip)] px-3 py-1.5 text-left font-sans text-[11.5px] font-semibold leading-snug text-[var(--l-chu-chip)] hover:border-[var(--l-nhan)]">
                        {c}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {moGoiY && !trong && (
                <motion.div key="goi-y" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="max-h-[45%] overflow-y-auto border-0 border-t border-solid border-[var(--l-vien)] bg-[var(--l-o)] px-3 py-2.5">
                  <GoiY nhom={nhomGoiY} onChon={gui} gon />
                </motion.div>
              )}
            </AnimatePresence>
            {moSticker && <BangSticker onChon={guiSticker} className="border-0 border-t border-solid border-[var(--l-vien)] bg-[var(--l-nen)] p-2" />}
            <form onSubmit={(e) => { e.preventDefault(); gui(); }} className="flex items-end gap-1.5 border-0 border-t border-solid border-[var(--l-vien)] p-2.5">
              <button type="button" onClick={() => { setMoGoiY((v) => !v); setMoSticker(false); }} aria-label={tr("Câu hỏi gợi ý", "Questions suggérées", "Suggested questions")} aria-pressed={moGoiY}
                className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 ${moGoiY ? "bg-[var(--l-chip)] text-[var(--l-chu-chip)]" : "bg-transparent text-[var(--l-mo)] hover:bg-[var(--l-o)]"}`}><Lightbulb size={19} /></button>
              <button type="button" onClick={() => { setMoSticker(!moSticker); setMoGoiY(false); }} aria-label={tr("Sticker", "Autocollants", "Stickers")}
                className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 ${moSticker ? "bg-[var(--l-chip)] text-[var(--l-chu-chip)]" : "bg-transparent text-[var(--l-mo)] hover:bg-[var(--l-o)]"}`}><Smile size={19} /></button>
              <textarea value={go} onChange={(e) => setGo(e.target.value.slice(0, 1000))} rows={1}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); gui(); } }}
                placeholder={tr("Hỏi Léon…", "Demande à Léon…", "Ask Léon…")}
                className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-solid border-[var(--l-vien)] bg-[var(--l-o)] px-3 py-2.5 font-sans text-[13px] text-[var(--l-chu)] outline-none focus:border-[var(--l-nhan)]" />
              <motion.button type="submit" disabled={!go.trim() || cho} aria-label={tr("Gửi", "Envoyer", "Send")} whileTap={{ scale: 0.88 }}
                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-[var(--l-nhan)] text-[var(--l-chu-nhan)] disabled:cursor-not-allowed disabled:opacity-40"><Send size={17} /></motion.button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
      {/* Nút mở: ô cửa tròn có vòng ba màu quay chậm, đầu Léon nhô lên khỏi mép trên. */}
      <div className={`fixed bottom-5 right-4 z-[55] ${mo ? "hidden sm:block" : "block"}`}>
        <AnimatePresence>
          {!mo && (chao || re) && (
            <motion.div key="chao" initial={{ opacity: 0, scale: 0.6, x: 12 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.7, x: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="leon-chao pointer-events-none absolute bottom-5 right-[78px] w-max max-w-[220px] origin-right rounded-2xl rounded-br-md px-3.5 py-2 font-sans text-[13px] font-semibold leading-snug">
              {chao && !re ? tr("Bí bài? Hỏi Léon nè!", "Une question ? Demande à Léon !", "Stuck? Ask Léon!") : tr("Hỏi Léon", "Demande à Léon", "Ask Léon")}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button type="button" onClick={mo_} aria-label={tr("Hỏi Léon", "Demande à Léon", "Ask Léon")}
          onHoverStart={() => setRe(true)} onHoverEnd={() => setRe(false)} onFocus={() => setRe(true)} onBlur={() => setRe(false)}
          whileHover="re" whileTap={{ scale: 0.92 }} initial={false}
          className="leon-nut-mo relative grid h-[66px] w-[66px] cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0">
          <span aria-hidden className="leon-vong absolute inset-0 rounded-full" />
          <span aria-hidden className="absolute inset-[4px] rounded-full bg-surface" />
          <motion.span aria-hidden variants={{ re: { y: -6, rotate: -6 } }} transition={{ type: "spring", stiffness: 380, damping: 14 }}
            className="leon-dau absolute inset-x-[4px] bottom-[4px] grid h-[86px] place-items-end justify-center">
            <Leon cam="mim-cuoi" size={76} alt="" className="leon-lac block" />
          </motion.span>
          {moiHomNay && !mo && <span aria-hidden className="leon-diem-moi absolute -right-2 top-2.5 z-10 h-4 w-4 rounded-full border-2 border-solid border-white bg-danger" />}
        </motion.button>
      </div>
    </MotionConfig>
  );
}
