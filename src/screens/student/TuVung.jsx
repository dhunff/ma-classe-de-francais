import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, MotionConfig, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Volume2, X, RotateCcw, Shapes, Images, PencilLine, ChevronLeft, ChevronRight, Hand, Sparkles } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";
import HocTapTab from "./HocTapTab.jsx";
import { HinhTu } from "./hinhTuVung.jsx";
import { PhaoGiayLon } from "../exam/KetQuaVisual.jsx";
import { CHU_DE_TU_VUNG, CAP_TU_VUNG, timChuDe, taoBaiTap, maoTu, boMaoTu, giongTu, goDung } from "../../content/tuVung/index.js";

/* « Học từ vựng theo chủ đề » (10/11, theo chủ dự án): tab của mục Học tập.
 *
 * 11/11 LÀM LẠI GIAO DIỆN (chủ dự án: « đơn điệu quá, có cả animation »), giữ nguyên dữ liệu và
 * cách chấm:
 *  · Danh sách: khối đầu có hình từ vựng bay nhẹ quanh Léon; thanh chọn trình độ có vệt sáng trượt
 *    (layoutId); thẻ chủ đề là thẻ MÀU theo chủ đề, ba hình xếp quạt, xoè ra khi rê chuột.
 *  · Trang chủ đề: ba bước Học từ → Ghép hình → Luyện tập (thanh bước có vệt trượt, nội dung trượt
 *    ngang). Học từ = thẻ LẬT 3D (mặt trước hình, mặt sau từ + giống + nghĩa + câu ví dụ), vuốt
 *    hoặc mũi tên để đổi thẻ. Ghép đúng thì ô bật lên, xong lượt bắn pháo giấy. Luyện tập: phương
 *    án hiện so le, kết quả là vòng điểm tự vẽ.
 *  Chuyển động tắt theo cài đặt « giảm chuyển động » của máy (MotionConfig reducedMotion="user").
 *
 * Kết quả lưu ở bai_hoc_ket_qua (mã « tv-… ») qua RPC ghi_bai_hoc, chung với Học ngữ pháp, nên
 * không cần migration. Chưa đăng nhập hay lỗi mạng: vẫn học được, chỉ không lưu.
 * Nghe: giọng đọc của TRÌNH DUYỆT (speechSynthesis, fr-FR); không có giọng Pháp thì nút loa tự ẩn.
 * `thu`: { ketQua } cho /preview.html (không gọi mạng). */

const GOC = "/etudiant/tu-vung";
const EASE = [0.22, 1, 0.36, 1];
const LO_XO = { type: "spring", stiffness: 380, damping: 26 };

/* Màu nhận diện từng chủ đề: [nền chuyển màu (thẻ, khối đầu), nền nhạt + màu hình cho ô hình]. */
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
  A1: tr("Đồ vật và cảnh quen thuộc", "Objets du quotidien", "Everyday objects"),
  A2: tr("Quần áo, nghề, du lịch, mua sắm", "Vêtements, métiers, voyages", "Clothes, jobs, travel"),
  B1: tr("Sức khoẻ, môi trường, công việc", "Santé, environnement, travail", "Health, environment, work"),
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
function NutNghe({ cau, to = false }) {
  if (!coGiongDoc()) return null;
  return (
    <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={(e) => { e.stopPropagation(); docTo(cau); }}
      aria-label={tr("Nghe", "Écouter", "Listen")} title={tr("Nghe", "Écouter", "Listen")}
      className={`inline-grid shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-primary-soft text-primary hover:bg-primary hover:text-on-primary ${to ? "h-11 w-11" : "h-8 w-8"}`}>
      <Volume2 size={to ? 19 : 15} />
    </motion.button>
  );
}

const NhanGiong = ({ tu }) => {
  const g = giongTu(tu);
  const [lop, chu] = g === "m" ? ["bg-primary-soft text-primary", tr("giống đực", "masculin", "masculine")]
    : g === "f" ? ["bg-warn-soft text-warn", tr("giống cái", "féminin", "feminine")]
      : ["bg-ok-soft text-ok", tr("số nhiều", "pluriel", "plural")];
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${lop}`}>{chu}</span>;
};

/* Ô hình vuông, màu theo chủ đề. */
const OHinh = ({ tu, ma, size = 56, className = "" }) => (
  <span className={`grid aspect-square place-items-center rounded-2xl ${mauCua(ma)[1]} ${className}`}><HinhTu tu={tu} size={size} /></span>
);

/* Hình trong ô trắng nổi (dùng trên nền màu). */
const OHinhTrang = ({ tu, size = 40, className = "" }) => (
  <span className={`grid aspect-square place-items-center rounded-2xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] ${className}`}><HinhTu tu={tu} size={size} /></span>
);

/* ── Danh sách: thẻ chủ đề ── */
/* forwardRef để thẻ dùng được bên trong các bộ chuyển động cần đo phần tử con. */
const TheChuDe = React.forwardRef(function TheChuDe({ cd, kq, k }, ref) {
  const ba = cd.tu.slice(0, 3);
  /* Ba hình xếp quạt; rê chuột thì xoè ra và nhấc lên (variants của framer-motion). */
  const quat = [
    { nghi: { rotate: -12, x: -52, y: 8 }, mo: { rotate: -20, x: -78, y: -2 } },
    { nghi: { rotate: 0, x: 0, y: 0 }, mo: { rotate: 0, x: 0, y: -14, scale: 1.06 } },
    { nghi: { rotate: 12, x: 52, y: 8 }, mo: { rotate: 20, x: 78, y: -2 } },
  ];
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.05 * k, ease: EASE }}>
      <motion.div initial="nghi" whileHover="mo" whileFocus="mo" animate="nghi" className="h-full">
        <Link to={`${GOC}/${cd.ma}`}
          className={`group relative flex h-full min-h-[230px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br ${mauCua(cd.ma)[0]} p-4 text-white no-underline shadow-md transition-shadow duration-300 hover:shadow-xl`}>
          <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125" />
          <span aria-hidden className="pointer-events-none absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-black/10" />
          <span className="relative mx-auto mt-2 grid h-[104px] w-full place-items-center">
            {ba.map((t, j) => (
              <motion.span key={t.fr} variants={quat[j]} transition={LO_XO} className="absolute" style={{ zIndex: j === 1 ? 2 : 1 }}>
                <OHinhTrang tu={t} size={j === 1 ? 52 : 40} className={j === 1 ? "h-[84px] w-[84px]" : "h-[66px] w-[66px]"} />
              </motion.span>
            ))}
          </span>
          <span className="relative mt-auto">
            <span className="block text-lg font-extrabold leading-tight">{cd.ten}</span>
            <span lang="fr" className="block text-xs italic text-white/85">{cd.tenFr}</span>
          </span>
          <span className="relative mt-3 flex items-center justify-between">
            {kq ? <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-extrabold tabular-nums text-ok"><Check size={12} /> {kq.diem}/{kq.tong}</span>
              : <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur">{tr("Chưa học", "À découvrir", "Not started")}</span>}
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-white group-hover:text-ink">
              <ArrowRight size={16} />
            </span>
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
});

/* Hình bay nhẹ trong khối đầu: lấy một từ của mỗi chủ đề đầu tiên. Chuyển động lặp chậm, chỉ để
   trang trí (aria-hidden), tắt khi máy bật giảm chuyển động. */
const VI_TRI_BAY = [
  "right-[33%] top-[12%]", "right-[24%] bottom-[10%]", "right-[16%] top-[8%]", "right-[5%] bottom-[14%]", "right-[3%] top-[22%]",
];
function HinhBay() {
  const ds = useMemo(() => CHU_DE_TU_VUNG.slice(0, 5).map((cd, k) => cd.tu[(k * 3) % cd.tu.length]), []);
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
      {ds.map((t, k) => (
        <motion.span key={t.fr} className={`absolute ${VI_TRI_BAY[k]}`}
          initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1, y: [0, -10, 0], rotate: [k % 2 ? -6 : 6, k % 2 ? 4 : -4, k % 2 ? -6 : 6] }}
          transition={{ opacity: { duration: 0.5, delay: 0.2 + k * 0.08 }, scale: { ...LO_XO, delay: 0.2 + k * 0.08 }, y: { duration: 3.6 + k * 0.5, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 5 + k * 0.6, repeat: Infinity, ease: "easeInOut" } }}>
          <OHinhTrang tu={t} size={30} className="h-14 w-14 opacity-95" />
        </motion.span>
      ))}
    </span>
  );
}

/* ── Bước 1: thẻ lật ── */
function TheLat({ tu, ma }) {
  const [lat, setLat] = useState(false);
  useEffect(() => { setLat(false); }, [tu]);
  const doi = () => { setLat((x) => { if (!x) docTo(tu.fr); return !x; }); };
  const mat = "absolute inset-0 grid place-items-center rounded-[1.75rem] border border-solid border-line p-6 [backface-visibility:hidden]";
  return (
    <div className="[perspective:1400px]">
      <motion.div role="button" tabIndex={0} aria-pressed={lat} aria-label={lat ? tu.fr : tr("Lật thẻ để xem từ", "Retourner la carte", "Flip the card")}
        onClick={doi} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doi(); } }}
        animate={{ rotateY: lat ? 180 : 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="relative h-[330px] w-full cursor-pointer outline-none [transform-style:preserve-3d] focus-visible:ring-4 focus-visible:ring-primary/40 rounded-[1.75rem]">
        {/* Mặt trước: hình */}
        <div className={`${mat} bg-surface shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)]`}>
          <span aria-hidden className={`absolute inset-3 rounded-[1.4rem] ${mauCua(ma)[1]}`} />
          <motion.span className="relative" animate={{ y: [0, -8, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
            <HinhTu tu={tu} size={150} />
          </motion.span>
          <span className="absolute bottom-6 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold text-soft shadow-sm">
            <Hand size={13} /> {tr("Bấm để lật thẻ", "Touchez pour retourner", "Tap to flip")}
          </span>
        </div>
        {/* Mặt sau: từ */}
        <div className={`${mat} bg-surface shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)] [transform:rotateY(180deg)]`}>
          <span aria-hidden className={`absolute inset-x-0 top-0 h-2 rounded-t-[1.75rem] bg-gradient-to-r ${mauCua(ma)[0]}`} />
          <div className="grid w-full justify-items-center gap-3 text-center">
            <OHinh tu={tu} ma={ma} size={44} className="h-16 w-16" />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span lang="fr" className="text-3xl font-extrabold tracking-tight text-ink">{tu.fr}</span>
              <NutNghe cau={tu.fr} />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <NhanGiong tu={tu} />
              <span className="text-base font-bold text-soft">{tu.vi}</span>
            </div>
            <p className="m-0 max-w-sm rounded-2xl bg-surface2 px-4 py-3 text-sm leading-relaxed">
              <span lang="fr" className="block italic text-ink">{tu.vd[0]}</span>
              <span className="block text-soft">{tu.vd[1]}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HocTu({ chuDe, onTiep }) {
  const [[i, huong], setI] = useState([0, 1]);
  const n = chuDe.tu.length;
  const den = (j) => setI(([cu]) => [((j % n) + n) % n, j > cu ? 1 : -1]);
  const tu = chuDe.tu[i];
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <div className="relative -mx-10 -mb-10 -mt-4 overflow-hidden px-10 pb-14 pt-4">
          <AnimatePresence mode="wait" custom={huong} initial={false}>
            <motion.div key={i} custom={huong}
              variants={{ vao: (h) => ({ x: h * 90, opacity: 0, rotate: h * 3 }), dung: { x: 0, opacity: 1, rotate: 0 }, ra: (h) => ({ x: -h * 90, opacity: 0, rotate: -h * 3 }) }}
              initial="vao" animate="dung" exit="ra" transition={{ duration: 0.32, ease: EASE }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25}
              onDragEnd={(_, info) => { if (info.offset.x < -70) den(i + 1); else if (info.offset.x > 70) den(i - 1); }}>
              <TheLat tu={tu} ma={chuDe.ma} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => den(i - 1)} aria-label={tr("Thẻ trước", "Carte précédente", "Previous card")}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-solid border-line bg-surface text-ink hover:border-primary hover:text-primary">
            <ChevronLeft size={20} />
          </motion.button>
          <div className="flex items-center gap-1.5" aria-hidden>
            {chuDe.tu.map((t, j) => (
              <motion.span key={t.fr} animate={{ width: j === i ? 22 : 8, opacity: j === i ? 1 : 0.35 }} transition={LO_XO}
                className={`block h-2 rounded-full bg-gradient-to-r ${mauCua(chuDe.ma)[0]}`} />
            ))}
          </div>
          <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => den(i + 1)} aria-label={tr("Thẻ sau", "Carte suivante", "Next card")}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-solid border-line bg-surface text-ink hover:border-primary hover:text-primary">
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </div>

      {/* Bảng tất cả từ: bấm để nhảy tới thẻ đó. */}
      <div className="rounded-3xl border border-solid border-line bg-surface p-4">
        <p className="m-0 mb-3 text-sm font-extrabold text-ink">{tr("Tất cả từ trong chủ đề", "Tous les mots du thème", "All words in this topic")}</p>
        <div className="grid grid-cols-5 gap-2 lg:grid-cols-3">
          {chuDe.tu.map((t, j) => (
            <motion.button key={t.fr} type="button" onClick={() => den(j)} whileHover={{ y: -3 }} whileTap={{ scale: 0.93 }}
              aria-label={t.fr} aria-current={j === i}
              className={`grid cursor-pointer place-items-center rounded-2xl border-2 border-solid p-1.5 font-sans ${j === i ? `border-primary ${mauCua(chuDe.ma)[1]}` : `border-transparent ${mauCua(chuDe.ma)[1]}`}`}>
              <HinhTu tu={t} size={34} />
            </motion.button>
          ))}
        </div>
        <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onTiep}
          className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 bg-primary px-4 py-3 font-sans text-sm font-extrabold text-on-primary shadow-md">
          {tr("Chơi ghép hình", "Jouer à associer", "Play the matching game")} <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}

/* ── Bước 2: ghép hình với từ ── */
const tron = (ds) => [...ds].sort(() => Math.random() - 0.5);
function GhepCap({ chuDe, onTiep }) {
  const [luot, setLuot] = useState(0);
  const { hinh, chu } = useMemo(() => {
    const nam = tron(chuDe.tu).slice(0, 5);
    return { hinh: tron(nam), chu: tron(nam) };
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
    <div className="relative rounded-3xl border border-solid border-line bg-surface p-4 sm:p-6">
      {het && <PhaoGiayLon />}
      <p className="m-0 flex items-center gap-2 text-sm font-bold text-soft"><Sparkles size={15} className="text-primary" />
        {tr("Bấm một hình, rồi bấm từ tiếng Pháp của nó.", "Touchez une image, puis le mot français qui correspond.", "Tap a picture, then its French word.")}</p>
      <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
        {hinh.map((t, k) => {
          const da = xong.includes(t.fr);
          const dangChon = chonHinh === t.fr;
          return (
            <motion.button key={`${luot}-${t.fr}`} type="button" disabled={da} onClick={() => setChonHinh(t.fr)} aria-pressed={dangChon} aria-label={t.vi}
              initial={{ opacity: 0, y: 16, scale: 0.8 }}
              animate={{ opacity: 1, y: dangChon ? -8 : 0, scale: da ? 0.92 : dangChon ? 1.06 : 1 }}
              transition={{ ...LO_XO, delay: luot ? 0 : k * 0.05 }} whileHover={da ? undefined : { y: -6 }}
              className={`relative grid aspect-square cursor-pointer place-items-center rounded-2xl border-2 border-solid p-1 font-sans ${da ? "cursor-default border-ok bg-ok-soft" : dangChon ? `border-primary shadow-lg ${mauCua(chuDe.ma)[1]}` : `border-transparent ${mauCua(chuDe.ma)[1]}`}`}>
              <span className={da ? "opacity-50" : ""}><HinhTu tu={t} size={64} /></span>
              <AnimatePresence>
                {da && (
                  <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute grid h-10 w-10 place-items-center rounded-full bg-ok text-white shadow-lg"><Check size={22} strokeWidth={3} /></motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {chu.map((t, k) => {
          const da = xong.includes(t.fr);
          return (
            <motion.button key={`${luot}-${t.fr}`} type="button" lang="fr" disabled={da} onClick={() => bamChu(t)}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, scale: da ? 0.95 : 1 }} transition={{ ...LO_XO, delay: luot ? 0 : 0.25 + k * 0.05 }}
              whileHover={da || !chonHinh ? undefined : { y: -3 }} whileTap={da ? undefined : { scale: 0.94 }}
              className={`cursor-pointer rounded-full border-2 border-solid px-4 py-2 font-sans text-sm font-bold transition-colors ${da ? "cursor-default border-ok bg-ok-soft text-ok line-through decoration-ok/40" : sai === t.fr ? "mcf-rung border-danger bg-danger-soft text-danger" : chonHinh ? "border-primary/50 bg-surface text-ink hover:border-primary" : "border-line bg-surface text-ink"}`}>
              {t.fr}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {het && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}
            className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-ok-soft p-3">
            <Leon cam="yeah" size={52} className="mcf-nay" />
            <p className="m-0 text-sm font-extrabold text-ok">{tr("Ghép đúng hết rồi!", "Tout est bien associé !", "All matched!")}</p>
            <button type="button" onClick={() => setLuot((x) => x + 1)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-surface px-4 py-2 font-sans text-sm font-bold text-ink hover:text-primary">
              <RotateCcw size={14} /> {tr("Chơi lại", "Rejouer", "Play again")}
            </button>
            <button type="button" onClick={onTiep}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-4 py-2 font-sans text-sm font-extrabold text-on-primary">
              {tr("Sang luyện tập", "Passer à l'entraînement", "Go to practice")} <ArrowRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Vòng điểm tự vẽ ở màn kết quả. */
function VongDiem({ dung, tong }) {
  const R = 46;
  return (
    <span className="relative grid h-32 w-32 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgb(var(--mcf-line-rgb))" strokeWidth="11" />
        <motion.circle cx="60" cy="60" r={R} fill="none" stroke="rgb(var(--mcf-ok-rgb))" strokeWidth="11" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: tong ? dung / tong : 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.2 }} />
      </svg>
      <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...LO_XO, delay: 0.3 }}
        className="text-3xl font-extrabold tabular-nums text-ink">{dung}<span className="text-base text-soft">/{tong}</span></motion.span>
    </span>
  );
}

/* ── Bước 3: luyện tập ── */
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
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }}
        className="relative flex flex-wrap items-center justify-center gap-6 overflow-hidden rounded-3xl border border-solid border-line bg-surface p-6 text-center sm:text-left">
        {tot && <PhaoGiayLon />}
        <VongDiem dung={dung} tong={ds.length} />
        <div className="min-w-0 max-w-sm">
          <Leon cam={tot ? "yeah" : "co-len"} size={72} className="mcf-nay mx-auto sm:mx-0" />
          <p className="m-0 mt-2 text-lg font-extrabold text-ink">{tot ? tr("Tuyệt vời!", "Excellent !", "Excellent!") : tr("Cố thêm chút nữa!", "Encore un effort !", "Almost there!")}</p>
          <p className="m-0 text-sm text-soft">{tot
            ? tr("Bạn nhớ chủ đề này rồi. Sang chủ đề khác nhé!", "Ce thème est acquis. Passez au suivant !", "You know this topic. Try another one!")
            : tr("Lật lại các thẻ từ rồi luyện thêm một lượt.", "Revoyez les cartes, puis refaites un tour.", "Review the cards, then try another round.")}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button type="button" onClick={lamLai}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
              <RotateCcw size={15} /> {tr("Luyện lại", "Recommencer", "Practise again")}
            </button>
            <Link to={GOC} className="inline-flex items-center gap-1.5 rounded-full bg-surface2 px-5 py-2.5 text-sm font-bold text-ink no-underline hover:text-primary">
              {tr("Chủ đề khác", "Autre thème", "Another topic")}
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  const lopPa = (k) => !daTraLoi ? "border-line bg-surface text-ink hover:border-primary"
    : k === c.dap ? "border-ok bg-ok-soft text-ok"
      : k === chon ? "mcf-rung border-danger bg-danger-soft text-danger" : "border-line bg-surface text-soft opacity-50";
  const nayDung = (k) => (daTraLoi && k === c.dap ? { scale: [1, 1.07, 1] } : {});
  const dungCau = c.loai === "go" ? chon === true : chon === c.dap;
  const hienPa = (k) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, ...nayDung(k) }, transition: { duration: 0.35, delay: daTraLoi ? 0 : 0.08 + k * 0.06, ease: EASE } });

  return (
    <div className="rounded-3xl border border-solid border-line bg-surface p-4 sm:p-6">
      <div className="h-2.5 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuemin={0} aria-valuemax={ds.length} aria-valuenow={i}>
        <motion.div className={`h-full rounded-full bg-gradient-to-r ${mauCua(ma)[0]}`} animate={{ width: `${(i / ds.length) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${luot}-${i}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.28, ease: EASE }} className="mt-5">
          {c.loai === "hinh" && (
            <>
              <p className="m-0 text-sm font-bold text-soft">{tr("Hình nào đúng với từ này?", "Quelle image correspond à ce mot ?", "Which picture matches this word?")}</p>
              <p className="m-0 mt-2 flex items-center gap-3"><span lang="fr" className="text-3xl font-extrabold text-ink">{c.tu.fr}</span><NutNghe cau={c.tu.fr} to /></p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {c.pa.map((t, k) => (
                  <motion.button key={t.fr} type="button" onClick={() => chonPa(k)} disabled={daTraLoi} aria-label={t.vi} {...hienPa(k)}
                    whileHover={daTraLoi ? undefined : { y: -6 }} whileTap={daTraLoi ? undefined : { scale: 0.95 }}
                    className={`grid cursor-pointer justify-items-center gap-1.5 rounded-2xl border-2 border-solid p-3 font-sans transition-colors ${daTraLoi ? "cursor-default" : ""} ${lopPa(k)}`}>
                    <OHinh tu={t} ma={ma} size={72} className="w-full max-w-[120px]" />
                    {/* Trả lời xong mới hiện chữ dưới mỗi hình, để ôn luôn ba từ còn lại. */}
                    <span lang="fr" className={`text-xs font-bold ${daTraLoi ? "" : "invisible"}`}>{t.fr}</span>
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {(c.loai === "tu" || c.loai === "mao" || c.loai === "go") && (
            <div className="flex flex-wrap items-start gap-5">
              <motion.span initial={{ scale: 0.7, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={LO_XO}>
                <OHinh tu={c.tu} ma={ma} size={92} className="h-36 w-36 shrink-0" />
              </motion.span>
              <div className="min-w-0 flex-1 basis-56">
                {c.loai === "tu" && (
                  <>
                    <p className="m-0 text-sm font-bold text-soft">{tr("Đây là gì?", "Qu'est-ce que c'est ?", "What is this?")}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {c.pa.map((t, k) => (
                        <motion.button key={t.fr} type="button" lang="fr" onClick={() => chonPa(k)} disabled={daTraLoi} {...hienPa(k)}
                          whileTap={daTraLoi ? undefined : { scale: 0.97 }}
                          className={`cursor-pointer rounded-2xl border-2 border-solid px-4 py-3 text-left font-sans text-base font-bold transition-colors ${daTraLoi ? "cursor-default" : ""} ${lopPa(k)}`}>{t.fr}</motion.button>
                      ))}
                    </div>
                  </>
                )}
                {c.loai === "mao" && (
                  <>
                    <p className="m-0 text-sm font-bold text-soft">{tr("Chọn mạo từ đúng.", "Choisissez le bon article.", "Pick the right article.")}</p>
                    <p lang="fr" className="m-0 mt-2 text-2xl font-extrabold text-ink">
                      <motion.span key={String(daTraLoi)} initial={{ scale: daTraLoi ? 1.4 : 1 }} animate={{ scale: 1 }} transition={LO_XO}
                        className="inline-block rounded-lg bg-surface2 px-2 text-primary">{daTraLoi ? maoTu(c.tu.fr) : "…"}</motion.span>{maoTu(c.tu.fr) === "l'" && daTraLoi ? "" : " "}{boMaoTu(c.tu.fr)}
                    </p>
                    <p className="m-0 text-sm text-soft">{c.tu.vi}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.pa.map((m, k) => (
                        <motion.button key={m} type="button" lang="fr" onClick={() => chonPa(k)} disabled={daTraLoi} {...hienPa(k)}
                          whileTap={daTraLoi ? undefined : { scale: 0.94 }}
                          className={`min-w-[4rem] cursor-pointer rounded-2xl border-2 border-solid px-4 py-2.5 font-sans text-base font-extrabold transition-colors ${daTraLoi ? "cursor-default" : ""} ${lopPa(k)}`}>{m}</motion.button>
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
                        className={`w-full rounded-2xl border-2 border-solid bg-surface2 px-4 py-3 font-sans text-base text-ink ${!daTraLoi ? "border-line focus:border-primary" : chon ? "border-ok" : "mcf-rung border-danger"}`} />
                    </label>
                    {!daTraLoi && (
                      <motion.button type="submit" whileTap={{ scale: 0.95 }} className="mt-3 cursor-pointer rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
                        {tr("Kiểm tra", "Vérifier", "Check")}
                      </motion.button>
                    )}
                  </form>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {daTraLoi && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}
            className={`mt-5 flex flex-wrap items-center gap-3 rounded-2xl p-3 ${dungCau ? "bg-ok-soft" : "bg-danger-soft"}`}>
            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 480, damping: 18 }}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ${dungCau ? "bg-ok" : "bg-danger"}`}>{dungCau ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}</motion.span>
            <p className="m-0 min-w-0 flex-1 text-sm text-ink">
              <strong>{dungCau ? tr("Đúng rồi!", "Bravo !", "Correct!") : tr("Chưa đúng.", "Pas tout à fait.", "Not quite.")}</strong>{" "}
              <span lang="fr" className="font-extrabold">{c.tu.fr}</span>: {c.tu.vi}
            </p>
            <motion.button type="button" onClick={tiep} autoFocus whileTap={{ scale: 0.95 }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
              {i + 1 >= ds.length ? tr("Xem kết quả", "Voir le résultat", "See result") : tr("Tiếp", "Suivant", "Next")} <ArrowRight size={15} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Trang một chủ đề ── */
const BUOC = () => [
  ["hoc", Images, tr("Học từ", "Les mots", "Learn")],
  ["ghep", Shapes, tr("Ghép hình", "Associer", "Match")],
  ["luyen", PencilLine, tr("Luyện tập", "Entraînement", "Practice")],
];
function TrangChuDe({ chuDe, onGhi }) {
  const [buoc, setBuoc] = useState("hoc");
  const thuTu = BUOC().map((b) => b[0]);
  const [huong, setHuong] = useState(1);
  const sang = (b) => { setHuong(thuTu.indexOf(b) >= thuTu.indexOf(buoc) ? 1 : -1); setBuoc(b); };
  const bon = chuDe.tu.slice(0, 4);
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <Link to={GOC} className="group inline-flex items-center gap-1.5 text-sm font-bold text-soft no-underline hover:text-ink">
        <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" /> {tr("Mọi chủ đề", "Tous les thèmes", "All topics")}
      </Link>
      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}
        className={`relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-br ${mauCua(chuDe.ma)[0]} p-6 text-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.5)] sm:p-7`}>
        <span aria-hidden className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
        <span aria-hidden className="absolute -right-14 -top-14 h-52 w-52 rounded-full bg-white/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold backdrop-blur">{chuDe.cap}</span>
            <h1 className="m-0 mt-2 text-3xl font-extrabold tracking-tight sm:text-[34px]">{chuDe.ten}</h1>
            <p lang="fr" className="m-0 mt-1 text-sm italic text-white/90">{chuDe.tenFr}</p>
          </div>
          <div className="flex -space-x-3" aria-hidden>
            {bon.map((t, k) => (
              <motion.span key={t.fr} initial={{ opacity: 0, y: 30, rotate: -20 }} animate={{ opacity: 1, y: 0, rotate: (k - 1.5) * 7 }}
                transition={{ ...LO_XO, delay: 0.15 + k * 0.07 }} whileHover={{ y: -8, rotate: 0, zIndex: 5 }}>
                <OHinhTrang tu={t} size={40} className="h-[68px] w-[68px] ring-4 ring-white/30" />
              </motion.span>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Ba bước, vệt sáng trượt theo bước đang mở. */}
      <div role="tablist" aria-label={tr("Các bước", "Étapes", "Steps")} className="mx-auto mt-6 flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl bg-surface p-1.5 shadow-sm no-scrollbar">
        {BUOC().map(([k, Icon, nhan], j) => (
          <button key={k} type="button" role="tab" aria-selected={buoc === k} onClick={() => sang(k)}
            className={`relative inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border-0 bg-transparent px-4 py-2.5 font-sans text-sm font-extrabold transition-colors ${buoc === k ? "text-white" : "text-soft hover:text-ink"}`}>
            {buoc === k && <motion.span layoutId="tv-buoc" transition={LO_XO} className={`absolute inset-0 rounded-xl bg-gradient-to-r ${mauCua(chuDe.ma)[0]} shadow-md`} />}
            <span className={`relative grid h-6 w-6 place-items-center rounded-full text-[11px] ${buoc === k ? "bg-white/25" : "bg-surface2"}`}>{j + 1}</span>
            <Icon size={15} className="relative" /><span className="relative">{nhan}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait" custom={huong} initial={false}>
          <motion.div key={buoc} custom={huong}
            variants={{ vao: (h) => ({ opacity: 0, x: h * 50 }), dung: { opacity: 1, x: 0 }, ra: (h) => ({ opacity: 0, x: -h * 50 }) }}
            initial="vao" animate="dung" exit="ra" transition={{ duration: 0.3, ease: EASE }}>
            {buoc === "hoc" && <HocTu chuDe={chuDe} onTiep={() => sang("ghep")} />}
            {buoc === "ghep" && <GhepCap chuDe={chuDe} onTiep={() => sang("luyen")} />}
            {buoc === "luyen" && <LuyenTap chuDe={chuDe} onXong={onGhi} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Danh sách chủ đề ── */
export default function TuVung({ thu }) {
  const { ma } = useParams();
  const [ketQua, setKetQua] = useState(thu?.ketQua ?? {});
  const [cap, setCap] = useState(CAP_TU_VUNG[0]);
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

  const dsCap = CHU_DE_TU_VUNG.filter((cd) => cd.cap === cap);
  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
        <HocTapTab />
        <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-[0_20px_50px_rgba(13,148,136,0.3)] sm:p-8">
          <span aria-hidden className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <span aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <HinhBay />
          <div className="relative flex items-center gap-4 sm:max-w-[62%]">
            <motion.span initial={{ opacity: 0, scale: 0.6, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ ...LO_XO, delay: 0.1 }} className="shrink-0">
              <Leon cam="hoc" size={110} className="mcf-leon-bay max-sm:h-20 max-sm:w-20" />
            </motion.span>
            <div className="min-w-0 flex-1">
              <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-white/80"><Images size={14} /> {tr("Nhìn hình, nhớ từ", "Une image, un mot", "See it, remember it")}</p>
              <h1 className="m-0 mt-1 text-3xl font-extrabold tracking-tight sm:text-[34px]">{tr("Học từ vựng", "Vocabulaire", "Vocabulary")}</h1>
              <p className="m-0 mt-1 text-sm text-white/85">{tr("Lật thẻ hình để học, chơi ghép hình, rồi luyện chọn và gõ từ.", "Retournez les cartes, associez, puis entraînez-vous.", "Flip picture cards, play matching, then practise.")}</p>
            </div>
          </div>
        </motion.header>

        {/* Chọn trình độ: vệt sáng trượt theo trình độ đang chọn. */}
        <div role="tablist" aria-label={tr("Trình độ", "Niveau", "Level")} className="mt-6 grid grid-cols-3 gap-1.5 rounded-3xl bg-surface p-1.5 shadow-sm">
          {CAP_TU_VUNG.map((c) => (
            <button key={c} type="button" role="tab" aria-selected={cap === c} onClick={() => setCap(c)}
              className={`relative flex cursor-pointer flex-col items-center rounded-2xl border-0 bg-transparent px-2 py-2.5 font-sans transition-colors sm:flex-row sm:justify-center sm:gap-2.5 ${cap === c ? "text-white" : "text-ink hover:bg-surface2"}`}>
              {cap === c && <motion.span layoutId="tv-cap" transition={LO_XO} className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${MAU_CAP[c] ?? MAU_CAP.A1} shadow-md`} />}
              <span className="relative text-lg font-extrabold leading-none">{c}</span>
              <span className={`relative mt-1 hidden text-xs font-semibold sm:mt-0 sm:inline ${cap === c ? "text-white/85" : "text-soft"}`}>{MO_TA_CAP()[c]}</span>
            </button>
          ))}
        </div>

        {/* key theo trình độ: đổi trình độ thì lưới dựng lại và thẻ mới bay vào so le. Cố ý KHÔNG có
            hiệu ứng thoát (AnimatePresence): thẻ cũ đang thoát dở có thể nằm lại khi trình duyệt
            ngừng vẽ khung (tab nền), và khi đó hai trình độ hiện chồng lên nhau. */}
        <div key={cap} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dsCap.map((cd, k) => <TheChuDe key={cd.ma} cd={cd} kq={ketQua[cd.ma]} k={k} />)}
        </div>
      </div>
    </MotionConfig>
  );
}
