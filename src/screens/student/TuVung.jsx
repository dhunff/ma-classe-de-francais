import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Volume2, X, RotateCcw, Shapes, Images, PencilLine } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";
import HocTapTab from "./HocTapTab.jsx";
import { HinhTu } from "./hinhTuVung.jsx";
import { CHU_DE_TU_VUNG, CAP_TU_VUNG, timChuDe, taoBaiTap, maoTu, boMaoTu, giongTu, goDung } from "../../content/tuVung/index.js";

/* « Học từ vựng theo chủ đề » (10/11, theo chủ dự án): tab thứ tư của mục Học tập.
 *
 * Mỗi chủ đề là một bài như bài ngữ pháp: HỌC (thẻ từ có hình, nghe, câu ví dụ) → GHÉP CẶP hình
 * với từ → LUYỆN TẬP (chọn hình, chọn từ, chọn mạo từ, gõ từ; sinh tự động ở content/tuVung).
 * Kết quả lưu ở bai_hoc_ket_qua (mã « tv-… ») qua RPC ghi_bai_hoc, chung với Học ngữ pháp, nên
 * không cần migration. Chưa đăng nhập hay lỗi mạng: vẫn học được, chỉ không lưu.
 *
 * Nghe: giọng đọc của TRÌNH DUYỆT (speechSynthesis, fr-FR), không phải audio thu sẵn; trình duyệt
 * không có giọng Pháp thì nút loa tự ẩn.
 * `thu`: { ketQua } cho /preview.html (không gọi mạng). */

const GOC = "/etudiant/tu-vung";
const EASE = [0.22, 1, 0.36, 1];

/* Màu nhận diện từng chủ đề: [nền chuyển màu cho khối đầu, nền nhạt + màu hình cho ô hình]. */
const MAU = {
  "tv-do-an": ["from-amber-500 to-orange-600", "bg-amber-500/10 text-amber-600"],
  "tv-rau-qua-do-uong": ["from-lime-500 to-emerald-600", "bg-emerald-500/10 text-emerald-600"],
  "tv-dong-vat": ["from-orange-500 to-rose-500", "bg-orange-500/10 text-orange-600"],
  "tv-nha-cua": ["from-sky-500 to-blue-600", "bg-sky-500/10 text-sky-600"],
  "tv-giao-thong": ["from-indigo-500 to-violet-600", "bg-indigo-500/10 text-indigo-600"],
  "tv-thoi-tiet": ["from-cyan-500 to-sky-600", "bg-cyan-500/10 text-cyan-600"],
  "tv-thanh-pho": ["from-slate-500 to-slate-700", "bg-slate-500/10 text-slate-600"],
  "tv-truong-lop": ["from-violet-500 to-purple-600", "bg-violet-500/10 text-violet-600"],
  "tv-so-thich": ["from-fuchsia-500 to-pink-600", "bg-fuchsia-500/10 text-fuchsia-600"],
  "tv-co-the-suc-khoe": ["from-rose-500 to-red-600", "bg-rose-500/10 text-rose-600"],
  "tv-quan-ao": ["from-pink-500 to-rose-600", "bg-pink-500/10 text-pink-600"],
  "tv-nghe-nghiep": ["from-blue-600 to-indigo-700", "bg-blue-500/10 text-blue-600"],
  "tv-nha-bep": ["from-orange-500 to-amber-600", "bg-orange-500/10 text-orange-600"],
  "tv-du-lich": ["from-teal-500 to-cyan-600", "bg-teal-500/10 text-teal-600"],
  "tv-thien-nhien": ["from-green-500 to-emerald-700", "bg-green-500/10 text-green-600"],
  "tv-mua-sam": ["from-yellow-500 to-orange-500", "bg-yellow-500/10 text-yellow-700"],
  "tv-cong-nghe": ["from-slate-600 to-blue-700", "bg-slate-500/10 text-slate-600"],
  "tv-benh-vien": ["from-red-500 to-rose-600", "bg-red-500/10 text-red-600"],
  "tv-moi-truong": ["from-emerald-500 to-green-700", "bg-emerald-500/10 text-emerald-600"],
  "tv-van-phong": ["from-blue-500 to-slate-600", "bg-blue-500/10 text-blue-600"],
  "tv-the-thao": ["from-orange-500 to-red-500", "bg-orange-500/10 text-orange-600"],
  "tv-van-hoa": ["from-purple-500 to-fuchsia-600", "bg-purple-500/10 text-purple-600"],
  "tv-giao-thong-b1": ["from-amber-500 to-yellow-600", "bg-amber-500/10 text-amber-700"],
};
/* Màu nhãn trình độ, cùng bảng màu với danh sách bài ngữ pháp (NguPhap.jsx › MAU_CAP). */
const MAU_CAP = { A1: "from-amber-500 to-orange-600", A2: "from-sky-500 to-blue-600", B1: "from-violet-500 to-indigo-600" };
const MO_TA_CAP = () => ({
  A1: tr("Đồ vật và cảnh quen thuộc hằng ngày", "Objets et scènes du quotidien", "Everyday objects and scenes"),
  A2: tr("Quần áo, nghề nghiệp, du lịch, mua sắm, công nghệ", "Vêtements, métiers, voyages, achats, technologie", "Clothes, jobs, travel, shopping, tech"),
  B1: tr("Sức khoẻ, môi trường, công việc, văn hoá, giao thông", "Santé, environnement, travail, culture, circulation", "Health, environment, work, culture, traffic"),
});
const mauCua = (ma) => MAU[ma] ?? ["from-blue-500 to-indigo-600", "bg-primary-soft text-primary"];

/* ── Nghe ── */
const coGiongDoc = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
function docTo(cau) {
  if (!coGiongDoc()) return;
  try {
    const u = new window.SpeechSynthesisUtterance(cau);
    u.lang = "fr-FR"; u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* bỏ qua */ }
}
function NutNghe({ cau, to = false, sang = false }) {
  if (!coGiongDoc()) return null;
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); docTo(cau); }}
      aria-label={tr("Nghe", "Écouter", "Listen")} title={tr("Nghe", "Écouter", "Listen")}
      className={`inline-grid shrink-0 cursor-pointer place-items-center rounded-full border-0 ${to ? "h-10 w-10" : "h-7 w-7"} ${sang ? "bg-white/20 text-white hover:bg-white/30" : "bg-primary-soft text-primary hover:bg-primary hover:text-on-primary"}`}>
      <Volume2 size={to ? 18 : 14} />
    </button>
  );
}

const NhanGiong = ({ tu }) => {
  const g = giongTu(tu);
  const [lop, chu] = g === "m" ? ["bg-primary-soft text-primary", tr("giống đực", "masculin", "masculine")]
    : g === "f" ? ["bg-warn-soft text-warn", tr("giống cái", "féminin", "feminine")]
      : ["bg-ok-soft text-ok", tr("số nhiều", "pluriel", "plural")];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${lop}`}>{chu}</span>;
};

/* Ô hình vuông, màu theo chủ đề. */
const OHinh = ({ tu, ma, size = 56, className = "" }) => (
  <span className={`grid aspect-square place-items-center rounded-2xl ${mauCua(ma)[1]} ${className}`}><HinhTu tu={tu} size={size} /></span>
);

/* ── 1. Học: thẻ từ ── */
function TheTu({ tu, ma, tre }) {
  return (
    <motion.li initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: tre, ease: EASE }}
      className="flex gap-3 rounded-2xl border border-solid border-line bg-surface p-3">
      <OHinh tu={tu} ma={ma} size={52} className="h-[72px] w-[72px] shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span lang="fr" className="text-base font-extrabold text-ink">{tu.fr}</span>
          <NutNghe cau={tu.fr} />
          <NhanGiong tu={tu} />
        </div>
        <p className="m-0 text-sm text-soft">{tu.vi}</p>
        <p className="m-0 mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug">
          <span className="min-w-0"><span lang="fr" className="italic text-ink">{tu.vd[0]}</span> <span className="text-soft">{tu.vd[1]}</span></span>
        </p>
      </div>
    </motion.li>
  );
}

/* ── 2. Ghép cặp hình với từ ── */
const tron = (ds) => [...ds].sort(() => Math.random() - 0.5);
function GhepCap({ chuDe }) {
  const [luot, setLuot] = useState(0);
  const { hinh, chu } = useMemo(() => {
    const bon = tron(chuDe.tu).slice(0, 5);
    return { hinh: tron(bon), chu: tron(bon) };
  }, [chuDe, luot]); // eslint-disable-line react-hooks/exhaustive-deps
  const [chonHinh, setChonHinh] = useState(null);
  const [xong, setXong] = useState([]);     // các từ (fr) đã ghép đúng
  const [sai, setSai] = useState(null);     // từ (fr) vừa bấm sai, để rung
  useEffect(() => { setChonHinh(null); setXong([]); setSai(null); }, [luot]);
  const bamChu = (t) => {
    if (!chonHinh || xong.includes(t.fr)) return;
    if (t.fr === chonHinh) { phat("dung"); docTo(t.fr); setXong((x) => [...x, t.fr]); setChonHinh(null); }
    else { phat("sai"); setSai(t.fr); setTimeout(() => setSai(null), 450); }
  };
  const het = xong.length === hinh.length;
  return (
    <div className="rounded-3xl border border-solid border-line bg-surface p-4 sm:p-5">
      <p className="m-0 text-sm text-soft">{tr("Bấm một hình, rồi bấm từ tiếng Pháp của nó.", "Touchez une image, puis le mot français qui correspond.", "Tap a picture, then its French word.")}</p>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {hinh.map((t) => {
          const da = xong.includes(t.fr);
          return (
            <button key={t.fr} type="button" disabled={da} onClick={() => setChonHinh(t.fr)} aria-pressed={chonHinh === t.fr} aria-label={t.vi}
              className={`grid aspect-square cursor-pointer place-items-center rounded-2xl border-2 border-solid p-1 font-sans transition-all ${da ? "cursor-default border-ok bg-ok-soft text-ok opacity-70" : chonHinh === t.fr ? `-translate-y-1 border-primary shadow-md ${mauCua(chuDe.ma)[1]}` : `border-transparent ${mauCua(chuDe.ma)[1]} hover:border-primary/40`}`}>
              <HinhTu tu={t} size={64} />
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chu.map((t) => {
          const da = xong.includes(t.fr);
          return (
            <button key={t.fr} type="button" lang="fr" disabled={da} onClick={() => bamChu(t)}
              className={`cursor-pointer rounded-full border-2 border-solid px-4 py-2 font-sans text-sm font-bold transition-colors ${da ? "cursor-default border-ok bg-ok-soft text-ok" : sai === t.fr ? "mcf-rung border-danger bg-danger-soft text-danger" : "border-line bg-surface text-ink hover:border-primary"}`}>
              {da && <Check size={13} className="mr-1 inline" />}{t.fr}
            </button>
          );
        })}
      </div>
      {het && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="m-0 flex items-center gap-1.5 text-sm font-extrabold text-ok"><Check size={16} /> {tr("Ghép đúng hết rồi!", "Tout est bien associé !", "All matched!")}</p>
          <button type="button" onClick={() => setLuot((x) => x + 1)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary-soft px-4 py-2 font-sans text-sm font-bold text-primary hover:bg-primary hover:text-on-primary">
            <RotateCcw size={14} /> {tr("Chơi với từ khác", "Rejouer avec d'autres mots", "Play again with other words")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── 3. Luyện tập ── */
function LuyenTap({ chuDe, onXong }) {
  const [luot, setLuot] = useState(0);
  const ds = useMemo(() => taoBaiTap(chuDe), [chuDe, luot]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [chon, setChon] = useState(null);       // chỉ số phương án đã chọn, hoặc true/false cho câu gõ
  const [go, setGo] = useState("");
  const [dung, setDung] = useState(0);
  const oGo = useRef(null);
  const c = ds[i];
  const daTraLoi = chon !== null;
  const ma = chuDe.ma;

  useEffect(() => { if (c?.loai === "hinh") docTo(c.tu.fr); if (c?.loai === "go") oGo.current?.focus(); }, [c]);

  const cham = (ok) => { phat(ok ? "dung" : "sai"); if (ok) setDung((d) => d + 1); if (c.loai !== "hinh") docTo(c.tu.fr); };
  const chonPa = (k) => { if (daTraLoi) return; setChon(k); cham(k === c.dap); };
  const nopGo = (e) => { e.preventDefault(); if (daTraLoi || !go.trim()) return; const ok = goDung(go, c.tu); setChon(ok); cham(ok); };
  const tiep = () => {
    if (i + 1 >= ds.length) { setI(ds.length); onXong(dung, ds.length); return; }
    setI(i + 1); setChon(null); setGo("");
  };
  const lamLai = () => { setLuot((x) => x + 1); setI(0); setChon(null); setGo(""); setDung(0); };

  if (i >= ds.length) {
    const tot = dung / ds.length >= 0.8;
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-solid border-line bg-surface p-5">
        <Leon cam={tot ? "yeah" : "co-len"} size={84} className="mcf-nay shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-2xl font-extrabold tabular-nums text-ink">{dung}/{ds.length}</p>
          <p className="m-0 text-sm text-soft">{tot
            ? tr("Bạn nhớ chủ đề này rồi. Sang chủ đề khác nhé!", "Ce thème est acquis. Passez au suivant !", "You know this topic. Try another one!")
            : tr("Xem lại các thẻ từ ở trên rồi luyện thêm một lượt.", "Revoyez les cartes ci-dessus, puis refaites un tour.", "Review the cards above, then try another round.")}</p>
        </div>
        <button type="button" onClick={lamLai}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
          <RotateCcw size={15} /> {tr("Luyện lại", "Recommencer", "Practise again")}
        </button>
      </div>
    );
  }

  const lopPa = (k) => !daTraLoi ? "border-line bg-surface text-ink hover:border-primary"
    : k === c.dap ? "border-ok bg-ok-soft text-ok"
      : k === chon ? "border-danger bg-danger-soft text-danger" : "border-line bg-surface text-soft opacity-60";
  const dungCau = c.loai === "go" ? chon === true : chon === c.dap;

  return (
    <div className="rounded-3xl border border-solid border-line bg-surface p-4 sm:p-6">
      <div className="h-2 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuemin={0} aria-valuemax={ds.length} aria-valuenow={i}>
        <div className={`h-full rounded-full bg-gradient-to-r ${mauCua(ma)[0]} transition-[width] duration-500`} style={{ width: `${(i / ds.length) * 100}%` }} />
      </div>

      <motion.div key={`${luot}-${i}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: EASE }} className="mt-5">
        {c.loai === "hinh" && (
          <>
            <p className="m-0 text-sm font-bold text-soft">{tr("Hình nào đúng với từ này?", "Quelle image correspond à ce mot ?", "Which picture matches this word?")}</p>
            <p className="m-0 mt-2 flex items-center gap-2"><span lang="fr" className="text-3xl font-extrabold text-ink">{c.tu.fr}</span><NutNghe cau={c.tu.fr} to /></p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {c.pa.map((t, k) => (
                <button key={t.fr} type="button" onClick={() => chonPa(k)} disabled={daTraLoi} aria-label={t.vi}
                  className={`grid cursor-pointer justify-items-center gap-1.5 rounded-2xl border-2 border-solid p-3 font-sans transition-all ${daTraLoi ? "cursor-default" : "hover:-translate-y-1 hover:shadow-md"} ${lopPa(k)}`}>
                  <OHinh tu={t} ma={ma} size={72} className="w-full max-w-[120px]" />
                  {/* Trả lời xong mới hiện chữ dưới mỗi hình, để ôn luôn ba từ còn lại. */}
                  <span lang="fr" className={`text-xs font-bold ${daTraLoi ? "" : "invisible"}`}>{t.fr}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {(c.loai === "tu" || c.loai === "mao" || c.loai === "go") && (
          <div className="flex flex-wrap items-start gap-4">
            <OHinh tu={c.tu} ma={ma} size={88} className="h-32 w-32 shrink-0" />
            <div className="min-w-0 flex-1 basis-56">
              {c.loai === "tu" && (
                <>
                  <p className="m-0 text-sm font-bold text-soft">{tr("Đây là gì?", "Qu'est-ce que c'est ?", "What is this?")}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {c.pa.map((t, k) => (
                      <button key={t.fr} type="button" lang="fr" onClick={() => chonPa(k)} disabled={daTraLoi}
                        className={`cursor-pointer rounded-2xl border-2 border-solid px-4 py-3 text-left font-sans text-base font-bold transition-colors ${daTraLoi ? "cursor-default" : ""} ${lopPa(k)}`}>{t.fr}</button>
                    ))}
                  </div>
                </>
              )}
              {c.loai === "mao" && (
                <>
                  <p className="m-0 text-sm font-bold text-soft">{tr("Chọn mạo từ đúng.", "Choisissez le bon article.", "Pick the right article.")}</p>
                  <p lang="fr" className="m-0 mt-2 text-2xl font-extrabold text-ink">
                    <span className="rounded-lg bg-surface2 px-2 text-primary">{daTraLoi ? maoTu(c.tu.fr) : "…"}</span>{maoTu(c.tu.fr) === "l'" && daTraLoi ? "" : " "}{boMaoTu(c.tu.fr)}
                  </p>
                  <p className="m-0 text-sm text-soft">{c.tu.vi}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.pa.map((m, k) => (
                      <button key={m} type="button" lang="fr" onClick={() => chonPa(k)} disabled={daTraLoi}
                        className={`min-w-[4rem] cursor-pointer rounded-2xl border-2 border-solid px-4 py-2.5 font-sans text-base font-extrabold transition-colors ${daTraLoi ? "cursor-default" : ""} ${lopPa(k)}`}>{m}</button>
                    ))}
                  </div>
                </>
              )}
              {c.loai === "go" && (
                <form onSubmit={nopGo}>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-soft">{tr("Gõ từ tiếng Pháp, kèm mạo từ.", "Écrivez le mot français avec son article.", "Type the French word with its article.")}</span>
                    <span className="text-lg font-extrabold text-ink">{c.tu.vi}</span>
                    <input ref={oGo} lang="fr" value={go} onChange={(e) => setGo(e.target.value)} disabled={daTraLoi} autoComplete="off" autoCapitalize="off" spellCheck={false}
                      placeholder={tr("ví dụ: le chat", "ex. : le chat", "e.g. le chat")}
                      className={`w-full rounded-2xl border-2 border-solid bg-surface2 px-4 py-3 font-sans text-base text-ink ${!daTraLoi ? "border-line" : chon ? "border-ok" : "border-danger"}`} />
                  </label>
                  {!daTraLoi && (
                    <button type="submit" className="mt-3 cursor-pointer rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
                      {tr("Kiểm tra", "Vérifier", "Check")}
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {daTraLoi && (
        <div className={`mt-5 flex flex-wrap items-center gap-3 rounded-2xl p-3 ${dungCau ? "bg-ok-soft" : "bg-danger-soft"}`}>
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white ${dungCau ? "bg-ok" : "bg-danger"}`}>{dungCau ? <Check size={18} /> : <X size={18} />}</span>
          <p className="m-0 min-w-0 flex-1 text-sm text-ink">
            <strong>{dungCau ? tr("Đúng rồi!", "Bravo !", "Correct!") : tr("Chưa đúng.", "Pas tout à fait.", "Not quite.")}</strong>{" "}
            <span lang="fr" className="font-extrabold">{c.tu.fr}</span>: {c.tu.vi}
          </p>
          <button type="button" onClick={tiep} autoFocus
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
            {i + 1 >= ds.length ? tr("Xem kết quả", "Voir le résultat", "See result") : tr("Tiếp", "Suivant", "Next")} <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

const TieuMuc = ({ Icon, children }) => (
  <h2 className="m-0 mb-3 mt-8 flex items-center gap-2 text-lg font-extrabold text-ink">
    <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={16} /></span>{children}
  </h2>
);

/* ── Trang một chủ đề ── */
function TrangChuDe({ chuDe, onGhi }) {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      <Link to={GOC} className="inline-flex items-center gap-1.5 text-sm font-bold text-soft no-underline hover:text-ink"><ArrowLeft size={15} /> {tr("Mọi chủ đề", "Tous les thèmes", "All topics")}</Link>
      <header className={`relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-br ${mauCua(chuDe.ma)[0]} p-6 text-white shadow-lg`}>
        <span aria-hidden className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
        <p className="relative m-0 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">{chuDe.cap}</p>
        <h1 className="relative m-0 mt-2 text-3xl font-extrabold tracking-tight">{chuDe.ten}</h1>
        <p lang="fr" className="relative m-0 mt-1 text-sm italic text-white/90">{chuDe.tenFr}</p>
      </header>

      <TieuMuc Icon={Images}>{tr("Học từ", "Les mots", "The words")}</TieuMuc>
      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
        {chuDe.tu.map((t, k) => <TheTu key={t.fr} tu={t} ma={chuDe.ma} tre={0.04 * k} />)}
      </ul>

      <TieuMuc Icon={Shapes}>{tr("Ghép hình với từ", "Associez image et mot", "Match picture and word")}</TieuMuc>
      <GhepCap chuDe={chuDe} />

      <TieuMuc Icon={PencilLine}>{tr("Luyện tập", "Entraînement", "Practice")}</TieuMuc>
      <LuyenTap chuDe={chuDe} onXong={onGhi} />
    </div>
  );
}

/* ── Danh sách chủ đề ── */
export default function TuVung({ thu }) {
  const { ma } = useParams();
  const [ketQua, setKetQua] = useState(thu?.ketQua ?? {});
  useEffect(() => {
    if (thu) return undefined;
    let con = true;
    supabase.from("bai_hoc_ket_qua").select("ma_bai, diem, tong").like("ma_bai", "tv-%").then(({ data }) => {
      if (con && Array.isArray(data)) setKetQua(Object.fromEntries(data.map((r) => [r.ma_bai, r])));
    }, () => {});
    return () => { con = false; };
  }, [thu]);
  const ghi = async (maBai, diem, tong) => {
    setKetQua((k) => ({ ...k, [maBai]: { ma_bai: maBai, diem: Math.max(diem, k[maBai]?.diem ?? 0), tong } }));
    if (thu) return;
    try { await supabase.rpc("ghi_bai_hoc", { p_ma: maBai, p_diem: diem, p_tong: tong }); } catch { /* chưa đăng nhập: vẫn học được, chỉ không lưu */ }
  };

  const chuDe = ma ? timChuDe(ma) : null;
  if (ma && chuDe) return <MotionConfig reducedMotion="user"><TrangChuDe key={ma} chuDe={chuDe} onGhi={(d, t) => ghi(chuDe.ma, d, t)} /></MotionConfig>;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
        <HocTapTab />
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-[0_20px_50px_rgba(13,148,136,0.3)]">
          <span aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <Leon cam="hoc" size={110} className="mcf-leon-bay shrink-0 max-sm:h-20 max-sm:w-20" />
            <div className="min-w-0 flex-1">
              <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-white/80"><Images size={14} /> {tr("Nhìn hình, nhớ từ", "Une image, un mot", "See it, remember it")}</p>
              <h1 className="m-0 mt-1 text-3xl font-extrabold tracking-tight">{tr("Học từ vựng", "Vocabulaire", "Vocabulary")}</h1>
              <p className="m-0 mt-1 text-sm text-white/85">{tr("Mỗi chủ đề: thẻ từ có hình và câu ví dụ, trò ghép cặp, rồi bài luyện chọn hình, chọn từ, gõ từ.", "Chaque thème : cartes illustrées avec exemples, jeu d'association, puis exercices avec images.", "Each topic: picture cards with examples, a matching game, then picture exercises.")}</p>
            </div>
          </div>
        </header>

        {/* 11/11: chia theo trình độ (A1, A2), như danh sách bài ngữ pháp. */}
        {CAP_TU_VUNG.map((cap) => (
        <section key={cap} className="mt-8">
        <h2 className="m-0 mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
          <span className={`rounded-xl bg-gradient-to-br ${MAU_CAP[cap] ?? MAU_CAP.A1} px-3 py-1 text-sm text-white`}>{cap}</span>
          <span className="text-sm font-semibold text-soft">{MO_TA_CAP()[cap]}</span>
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHU_DE_TU_VUNG.filter((cd) => cd.cap === cap).map((cd, k) => {
            const kq = ketQua[cd.ma];
            return (
              <motion.div key={cd.ma} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.04 * k, ease: EASE }}>
                <Link to={`${GOC}/${cd.ma}`}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-solid border-line bg-surface p-4 no-underline transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                  <span className="grid grid-cols-4 gap-1.5">
                    {cd.tu.slice(0, 4).map((t) => <OHinh key={t.fr} tu={t} ma={cd.ma} size={38} />)}
                  </span>
                  <span>
                    <span className="block text-base font-extrabold text-ink">{cd.ten}</span>
                    <span lang="fr" className="block text-xs italic text-soft">{cd.tenFr}</span>
                  </span>
                  <span className="mt-auto flex items-center justify-between">
                    {kq ? <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2.5 py-0.5 text-[11px] font-extrabold tabular-nums text-ok"><Check size={12} /> {kq.diem}/{kq.tong}</span>
                      : <span className="rounded-full bg-surface2 px-2.5 py-0.5 text-[11px] font-bold text-soft">{tr("Chưa học", "À découvrir", "Not started")}</span>}
                    <ArrowRight size={15} className="text-primary transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
        </section>
        ))}
      </div>
    </MotionConfig>
  );
}
