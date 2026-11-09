import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, animate, useReducedMotion, AnimatePresence, MotionConfig } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Crown, TrendingUp, TrendingDown, Minus, RotateCcw, CalendarDays, Clock, BookOpen, Loader2,
  Headphones, PenLine, Mic, Puzzle, BookA, Shapes, Flame, BarChart3, Target, ArrowRight,
  CheckCircle2, Repeat, Sparkles, Check,
} from "lucide-react";
import { supabase } from "../../storageShim.js";
import { load } from "../../shared/storage.js";
import { PAYMENT_KEY } from "../../shared/access.js";
import { goiVip } from "../../shared/vip.js";
import { tr } from "../../shared/i18n.jsx";
import PaymentModal from "./PaymentModal.jsx";
import { ThucHanh } from "./NguPhap.jsx";
import { timCau } from "../../content/nguPhap/index.js";
import { ngayHomNay } from "../../shared/hoatDong.js";
import { choTrong } from "../../shared/choTrong.jsx";
import HoSoLoiViet from "./HoSoLoiViet.jsx";
import { Leon } from "../../shared/leon.jsx";

/* Tiến bộ VIP — 14/10 (migration 143), LÀM LẠI 06/11 theo chủ dự án (« sơ sài, không có gì nổi bật »).
 *
 * Ba tab giữ nguyên dữ liệu: « Báo cáo tuần » (bao_cao_tuan), « Ôn câu sai » (cau_sai_cua_toi),
 * « Ôn ngữ pháp » (ngu_phap_cau_sai). Thêm « Nhịp học 12 tuần »: đếm lượt nộp bài mỗi ngày từ
 * `attempts` của chính người học (policy attempts_own), ngày theo giờ Việt Nam như bao_cao_tuan.
 * Quyền VIP vẫn kiểm ở MÁY CHỦ: hàm trả { ok:false, ma:'CAN_VIP' } thì chỉ hiện lời mời nâng cấp
 * và không đọc lịch. Mọi con số đọc từ dữ liệu thật (quy tắc 1); chủ dự án đồng ý hiện đủ số ở màn này.
 *
 * Màu: khối đầu trang là nền tối cố định (giống thanh bên), nên chữ trắng viết thẳng; màu từng
 * kỹ năng là dải màu nhận diện như trang giới thiệu. Còn lại đi qua token.
 *
 * `thu` (chỉ trang xem thử): { baoCao, cauSai, ngay: { "YYYY-MM-DD": số lượt }, nguPhap: [] }. */
const boThe = (s) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const thoiGian = (giay) => {
  const p = Math.round((giay ?? 0) / 60);
  return p >= 60 ? `${Math.floor(p / 60)} h ${p % 60}′` : `${p}′`;
};
/* Ngày "YYYY-MM-DD" ± n ngày, tính theo UTC để không lệch múi giờ máy. */
const congNgay = (d, n) => { const t = new Date(`${d}T00:00:00Z`); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const thuCua = (d) => (new Date(`${d}T00:00:00Z`).getUTCDay() + 6) % 7; // 0 = thứ Hai
const ngayVN = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
const dm = (d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const THU = () => [tr("T2", "Lu", "Mo"), tr("T3", "Ma", "Tu"), tr("T4", "Me", "We"), tr("T5", "Je", "Th"), tr("T6", "Ve", "Fr"), tr("T7", "Sa", "Sa"), tr("CN", "Di", "Su")];

/* Nhãn và màu theo giá trị `skills` LƯU trong database (không dịch giá trị đó). */
const KY_NANG = () => ({
  "Écoute": { ten: tr("Nghe hiểu", "Compréhension orale", "Listening"), Icon: Headphones, mau: "from-sky-500 to-blue-600" },
  "Lecture": { ten: tr("Đọc hiểu", "Compréhension écrite", "Reading"), Icon: BookOpen, mau: "from-emerald-500 to-teal-600" },
  "Production écrite": { ten: tr("Viết", "Production écrite", "Writing"), Icon: PenLine, mau: "from-rose-500 to-pink-600" },
  "Production orale": { ten: tr("Nói", "Production orale", "Speaking"), Icon: Mic, mau: "from-violet-500 to-purple-600" },
  "Grammaire": { ten: tr("Ngữ pháp", "Grammaire", "Grammar"), Icon: Puzzle, mau: "from-indigo-500 to-violet-600" },
  "Vocabulaire": { ten: tr("Từ vựng", "Vocabulaire", "Vocabulary"), Icon: BookA, mau: "from-amber-400 to-orange-500" },
});
const kyNang = (sk) => KY_NANG()[sk] ?? { ten: sk, Icon: Shapes, mau: "from-slate-400 to-slate-600" };

const DangTai = () => <p className="m-0 mt-6 flex items-center gap-2 text-sm text-soft"><Loader2 size={16} className="mcf-spin" /> {tr("Đang tải…", "Chargement…", "Loading…")}</p>;
const LoiDoc = () => <p className="m-0 mt-6 rounded-2xl bg-danger-soft p-4 text-sm text-ink">{tr("Không đọc được dữ liệu. Tải lại trang (Ctrl+F5) rồi thử lại.", "Impossible de lire les données. Rechargez la page (Ctrl+F5).", "Couldn't load data. Reload the page (Ctrl+F5).")}</p>;
const TieuDe = ({ Icon, children, phu }) => (
  <div className="mb-3 flex items-end justify-between gap-3">
    <h2 className="m-0 flex items-center gap-2 text-base font-extrabold text-ink"><Icon size={18} className="text-primary" />{children}</h2>
    {phu && <span className="text-xs text-soft">{phu}</span>}
  </div>
);
const NutLamLai = ({ id, nho }) => {
  const nav = useNavigate();
  return (
    <button type="button" onClick={() => nav("/etudiant/entrainement", { state: { moBai: id } })}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border-0 bg-primary font-sans font-bold text-on-primary hover:opacity-90 ${nho ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"}`}>
      <RotateCcw size={nho ? 12 : 14} /> {tr("Làm lại bài", "Refaire", "Redo")}
    </button>
  );
};

/* ── Lời mời VIP ── */
function MoiVip({ onMua }) {
  const LOI = [
    [BarChart3, tr("Báo cáo tuần theo từng kỹ năng, so với tuần trước", "Bilan hebdomadaire par compétence, comparé à la semaine passée", "Weekly report by skill, compared with last week")],
    [CalendarDays, tr("Lịch nhịp học 12 tuần", "Calendrier d'activité sur 12 semaines", "12-week activity calendar")],
    [Target, tr("Danh sách câu còn sai để sửa tới khi đúng", "Vos questions encore ratées, jusqu'à les réussir", "Questions you still miss, until you get them right")],
    [Repeat, tr("Ôn câu ngữ pháp sai theo lịch giãn cách", "Révision espacée de vos erreurs de grammaire", "Spaced review of your grammar mistakes")],
  ];
  return (
    <div className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-7 text-white shadow-[0_24px_60px_rgba(30,27,75,0.35)] sm:p-9">
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950"><Crown size={13} /> VIP</span>
      <p className="relative m-0 mt-4 text-2xl font-extrabold">{tr("Thấy rõ mình tiến bộ tới đâu", "Voyez exactement où vous en êtes", "See exactly how far you've come")}</p>
      <ul className="relative m-0 mt-5 grid list-none gap-3 p-0 sm:grid-cols-2">
        {LOI.map(([Icon, chu]) => (
          <li key={chu} className="flex items-start gap-3 rounded-2xl bg-white/10 p-3 text-sm">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-amber-300"><Icon size={16} /></span>{chu}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onMua}
        className="relative mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-amber-400 px-6 py-3 font-sans text-sm font-extrabold text-amber-950 shadow-lg hover:bg-amber-300">
        <Crown size={16} /> {tr("Nâng cấp VIP", "Passer VIP", "Upgrade to VIP")}
      </button>
    </div>
  );
}

/* ── Chuyển động (09/11, theo chủ dự án: « chuyên nghiệp hơn, thêm animation ») ──
 * MỘT nhịp vào trang: số đếm lên, vòng tiến độ vẽ ra, các ngày trong tuần bật lên lần lượt,
 * lịch 12 tuần hiện theo đường chéo. Sau đó đứng yên, trừ vòng sáng nhẹ ở ô hôm nay.
 * Rê chuột lên ô lịch thì hiện thẻ ngày (chuyển động do người dùng gây ra).
 * `MotionConfig reducedMotion="user"` ở gốc trang tắt dịch chuyển cho ai bật giảm chuyển động;
 * SoChay tự kiểm và hiện thẳng số cuối. */
const EASE = [0.22, 1, 0.36, 1];

function SoChay({ den, dinhDang = (v) => Math.round(v), tre = 0 }) {
  const giam = useReducedMotion();
  const [v, setV] = useState(giam ? den : 0);
  useEffect(() => {
    if (giam) { setV(den); return undefined; }
    const c = animate(0, den, { duration: 1.1, delay: tre, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [den, giam, tre]);
  return <>{dinhDang(v)}</>;
}

/* Tên tháng ngắn cho nhãn cột lịch. */
const THANG_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const THANG_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const tenThang = (d) => { const m = Number(d.slice(5, 7)); return tr(`Th${m}`, THANG_FR[m - 1], THANG_EN[m - 1]); };
const THU_DAI = () => [tr("Thứ Hai", "Lundi", "Monday"), tr("Thứ Ba", "Mardi", "Tuesday"), tr("Thứ Tư", "Mercredi", "Wednesday"), tr("Thứ Năm", "Jeudi", "Thursday"), tr("Thứ Sáu", "Vendredi", "Friday"), tr("Thứ Bảy", "Samedi", "Saturday"), tr("Chủ nhật", "Dimanche", "Sunday")];

/* ── Khối đầu trang (09/11, theo chủ dự án: « đồng nhất với giao diện website ») ──
 * Cùng họ với HeroBanner trang chủ: nền xanh chuyển tím, lưới chấm mờ, quầng sáng, Léon bên phải,
 * chip trắng mờ. Dải 7 ngày cùng kiểu với thẻ « Chuỗi ngày học » (vòng tròn nối bằng vạch). */
const leonTheoTuan = (n) => (n >= 5 ? "yeah" : n >= 3 ? "co-len" : n >= 1 ? "hoc" : "buon-ngu");

function TuanNay({ ngay, homNay }) {
  const tuan = Array.from({ length: 7 }, (_, i) => congNgay(homNay, i - 6));
  const co = tuan.map((x) => (ngay[x] ?? 0) > 0);
  const thu = THU();
  return (
    <ol className="m-0 grid max-w-[22rem] list-none grid-cols-7 p-0" aria-label={tr("Ngày có học trong tuần", "Jours actifs de la semaine", "Active days this week")}>
      {tuan.map((x, i) => (
        <li key={x} className="relative flex flex-col items-center gap-1.5" title={`${dm(x)}: ${ngay[x] ?? 0}`}>
          {i < 6 && (
            <span aria-hidden className="absolute left-1/2 top-[17px] h-1 w-full -translate-y-1/2 overflow-hidden bg-white/20">
              {co[i] && co[i + 1] && (
                <motion.span className="block h-full origin-left bg-amber-300" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ duration: 0.25, delay: 0.35 + i * 0.07, ease: EASE }} />
              )}
            </span>
          )}
          <motion.span initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.15 + i * 0.07 }}
            className={`relative grid h-[34px] w-[34px] place-items-center rounded-full text-xs font-extrabold ${co[i] ? "bg-amber-400 text-amber-950 shadow-[0_6px_14px_rgba(251,191,36,0.4)]" : "bg-white/15 text-white/70"} ${x === homNay ? "ring-2 ring-white ring-offset-2 ring-offset-primary" : ""}`}>
            {co[i] ? <Check size={16} strokeWidth={3} /> : dm(x).slice(0, 2)}
          </motion.span>
          <span className={`text-xs ${x === homNay ? "font-bold text-white" : "text-white/70"}`}>{thu[thuCua(x)]}</span>
        </li>
      ))}
    </ol>
  );
}

/* Ô số liệu trong khối đầu: icon tròn màu như thẻ kỹ năng trang chủ, số đếm lên. */
const OSo = ({ Icon, mau, nhan, tre, children }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: tre, ease: EASE }}
    className="flex min-w-0 items-center gap-3 rounded-2xl bg-white/15 p-3 backdrop-blur sm:p-4">
    <span className={`hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${mau} text-white shadow-[0_8px_16px_rgba(15,23,42,0.2)] sm:grid`}><Icon size={20} /></span>
    <div className="min-w-0">
      <p className="m-0 whitespace-nowrap text-2xl font-extrabold leading-none tabular-nums sm:text-[28px]">{children}</p>
      <p className="m-0 mt-1 truncate text-xs font-medium text-white/80">{nhan}</p>
    </div>
  </motion.div>
);

function DauTrang({ d, ngay, homNay }) {
  const soNgay = d.ngay_hoc ?? 0;
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-primary to-[#6d5ce7] p-6 text-on-primary shadow-[0_20px_50px_rgba(37,99,235,0.3)] sm:p-8">
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
      <span aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl" />

      <div className="relative flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }} className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950 shadow-sm"><Crown size={13} /> VIP</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur"><CalendarDays size={13} /> {dm(d.tu)} → {dm(d.den)}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05, ease: EASE }}
            className="m-0 mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-[32px]">{tr("Tiến bộ của bạn", "Vos progrès", "Your progress")}</motion.h1>
          <p className="m-0 mt-2 max-w-md text-sm font-medium text-white/85">{tr("Nhịp học, điểm theo kỹ năng và những câu cần sửa lại.", "Votre rythme, vos scores par compétence et les questions à revoir.", "Your rhythm, scores by skill and the questions to fix.")}</p>
          {ngay && <div className="mt-5"><TuanNay ngay={ngay} homNay={homNay} /></div>}
        </div>
        {/* Léon đổi biểu cảm theo số ngày học trong tuần, nhảy vào sau cùng. */}
        <motion.div className="hidden shrink-0 self-end sm:block" initial={{ opacity: 0, y: 40, rotate: -8 }} animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.5 }}>
          <Leon cam={leonTheoTuan(soNgay)} size={132} className="drop-shadow-[0_12px_20px_rgba(15,23,42,0.3)]" />
        </motion.div>
      </div>

      <div className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        <OSo Icon={Flame} mau="from-orange-500 to-rose-600" tre={0.2} nhan={tr("ngày có học", "jours actifs", "active days")}>
          <SoChay den={soNgay} tre={0.2} /><span className="text-base font-bold text-white/70">/7</span>
        </OSo>
        <OSo Icon={BookOpen} mau="from-emerald-500 to-teal-600" tre={0.27} nhan={tr("bài đã nộp", "exercices rendus", "exercises submitted")}>
          <SoChay den={d.so_bai ?? 0} tre={0.27} />
        </OSo>
        <OSo Icon={Clock} mau="from-amber-400 to-orange-500" tre={0.34} nhan={tr("thời gian làm bài", "temps de travail", "time spent")}>
          <SoChay den={d.giay ?? 0} tre={0.34} dinhDang={thoiGian} />
        </OSo>
      </div>
    </section>
  );
}

/* ── Nhịp học 12 tuần ── */
const MUC = ["bg-surface2", "bg-primary/25", "bg-primary/45", "bg-primary/70", "bg-primary"];
const mucCua = (n) => (n <= 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);

/* Thẻ số liệu màu như thẻ « Chuỗi ngày học » / « Trò chơi » trang chủ: icon lớn mờ ở góc. */
const TheSo = ({ Icon, nen, nhan, tre, children }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: tre, ease: EASE }}
    className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${nen} p-4 text-white shadow-md`}>
    <Icon aria-hidden size={84} strokeWidth={1.5} className="pointer-events-none absolute -bottom-5 -right-4 fill-white/15 text-white/25" />
    <p className="relative m-0 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90 sm:text-xs">{nhan}</p>
    <p className="relative m-0 mt-1 text-4xl font-extrabold leading-none tabular-nums sm:text-5xl">{children}</p>
  </motion.div>
);

function NhipHoc({ ngay, homNay }) {
  const { cot, soNgay, dainhat, nhanThang } = useMemo(() => {
    const dau = congNgay(homNay, -thuCua(homNay) - 7 * 11); // thứ Hai của 12 tuần trước
    const cot = Array.from({ length: 12 }, (_, c) => Array.from({ length: 7 }, (_, r) => congNgay(dau, c * 7 + r)));
    let soNgay = 0, chuoi = 0, dainhat = 0;
    cot.flat().filter((x) => x <= homNay).forEach((x) => {
      if ((ngay[x] ?? 0) > 0) { soNgay += 1; chuoi += 1; dainhat = Math.max(dainhat, chuoi); } else chuoi = 0;
    });
    const nhanThang = cot.map((c) => c.find((x) => x.slice(8) === "01") ?? null);
    /* Cột đầu mang tên tháng đang dở, trừ khi tháng sau bắt đầu quá gần (hai nhãn sẽ đè nhau). */
    const sau = nhanThang.findIndex(Boolean);
    if (!nhanThang[0] && (sau === -1 || sau >= 3)) nhanThang[0] = cot[0][0];
    return { cot, soNgay, dainhat, nhanThang };
  }, [ngay, homNay]);
  const thu = THU();
  const thuDai = THU_DAI();
  const khung = useRef(null);
  const [tro, setTro] = useState(null); // ô đang rê chuột: { x, y, ngay, n }
  const vao = (e, x) => {
    const k = khung.current?.getBoundingClientRect();
    const o = e.currentTarget.getBoundingClientRect();
    /* Kẹp tâm thẻ để ô sát mép không đẩy thẻ tràn khỏi khung (gây cuộn ngang trên điện thoại). */
    if (k) setTro({ x: Math.min(Math.max(o.left - k.left + o.width / 2, 76), k.width - 76), y: o.top - k.top, ngay: x, n: ngay[x] ?? 0 });
  };
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
      className="rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_8px_16px_rgba(15,23,42,0.15)]"><CalendarDays size={19} /></span>
        <div className="min-w-0">
          <h2 className="m-0 text-lg font-extrabold text-ink">{tr("Nhịp học 12 tuần", "Rythme sur 12 semaines", "12-week rhythm")}</h2>
          <p className="m-0 text-xs text-soft">{tr("Mỗi ô là một ngày, càng đậm càng nhiều bài", "Une case = un jour, plus foncé = plus d'exercices", "One square per day, darker = more exercises")}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-stretch gap-x-6 gap-y-5">
        <div className="w-full max-w-[30rem] flex-1">
          <div ref={khung} className="relative flex gap-2" onMouseLeave={() => setTro(null)}>
            <div className="grid shrink-0 grid-rows-[auto_repeat(7,minmax(0,1fr))] gap-1 text-[10px] font-bold leading-none text-soft">
              <span className="h-4" />
              {thu.map((t, i) => <span key={t} className={`flex items-center ${i % 2 ? "invisible" : ""}`}>{t}</span>)}
            </div>
            <div className="grid min-w-0 flex-1 grid-cols-12 gap-1">
              {cot.map((c, i) => (
                <div key={i} className="grid grid-rows-[auto_repeat(7,minmax(0,1fr))] gap-1">
                  <span className="h-4 overflow-visible whitespace-nowrap text-[10px] font-bold leading-4 text-soft">{nhanThang[i] ? tenThang(nhanThang[i]) : ""}</span>
                  {c.map((x, r) => x > homNay
                    ? <span key={x} className="aspect-square" />
                    : (
                      <motion.span key={x} aria-label={`${dm(x)}: ${ngay[x] ?? 0}`}
                        initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: 0.3 + (i + r) * 0.022, ease: EASE }}
                        onMouseEnter={(e) => vao(e, x)}
                        className={`aspect-square rounded-[6px] transition-transform duration-150 hover:scale-110 ${MUC[mucCua(ngay[x] ?? 0)]} ${x === homNay ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""}`} />
                    ))}
                </div>
              ))}
            </div>
            <AnimatePresence>
              {tro && (
                <motion.div key="tro" role="tooltip" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-xs text-bg shadow-lg"
                  style={{ left: tro.x, top: tro.y - 8 }}>
                  <span className="block font-extrabold">{thuDai[thuCua(tro.ngay)]} {dm(tro.ngay)}</span>
                  <span className="block opacity-80">{tro.n > 0 ? tr(`${tro.n} bài đã nộp`, `${tro.n} exercice(s) rendu(s)`, `${tro.n} exercise(s) submitted`) : tr("Không làm bài", "Pas d'exercice", "No exercise")}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="mt-3 flex items-center justify-end gap-1 text-[11px] text-soft">{tr("Ít", "Moins", "Less")}{MUC.map((m) => <span key={m} className={`h-2.5 w-2.5 rounded-[3px] ${m}`} />)}{tr("Nhiều", "Plus", "More")}</span>
        </div>
        <div className="grid w-full grid-cols-2 content-center gap-3 sm:w-auto sm:min-w-[11rem] sm:max-w-[15rem] sm:flex-1 sm:grid-cols-1">
          <TheSo Icon={CalendarDays} nen="from-blue-500 to-indigo-600" tre={0.35} nhan={tr("Ngày có học", "Jours actifs", "Active days")}>
            <SoChay den={soNgay} tre={0.35} />
          </TheSo>
          <TheSo Icon={Flame} nen="from-orange-600 to-rose-600" tre={0.45} nhan={tr("Ngày liền dài nhất", "Plus longue série", "Longest run")}>
            <SoChay den={dainhat} tre={0.45} />
          </TheSo>
        </div>
      </div>
    </motion.section>
  );
}

/* ── Báo cáo tuần ── */
function BaoCao({ d }) {
  const ds = d.ky_nang ?? [];
  const yeu = ds.filter((k) => k.tuan_nay != null).sort((a, b) => a.tuan_nay - b.tuan_nay)[0];
  return (
    <div className="space-y-6">
      <section>
        <TieuDe Icon={BarChart3} phu={tr("% điểm trung bình tuần này", "% moyen cette semaine", "Average score this week")}>{tr("Theo kỹ năng", "Par compétence", "By skill")}</TieuDe>
        {!ds.length ? (
          <p className="m-0 rounded-2xl bg-surface2 p-4 text-sm text-soft">{tr("Chưa có bài nào được chấm trong hai tuần qua. Làm một bài để bắt đầu báo cáo.", "Aucun exercice noté ces deux dernières semaines. Faites-en un pour lancer le bilan.", "No graded exercise in the last two weeks. Do one to start your report.")}</p>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {ds.map((k) => {
              const { ten, Icon, mau } = kyNang(k.sk);
              const chenh = k.tuan_nay != null && k.tuan_truoc != null ? k.tuan_nay - k.tuan_truoc : null;
              const IconChenh = !chenh ? Minus : chenh > 0 ? TrendingUp : TrendingDown;
              return (
                <li key={k.sk} className="rounded-3xl border border-solid border-line bg-surface p-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${mau} text-white shadow-md`}><Icon size={20} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-sm font-extrabold text-ink">{ten}</p>
                      <p className="m-0 text-xs text-soft">{k.so_bai ?? 0} {tr("bài tuần này", "cette semaine", "this week")}</p>
                    </div>
                    <span className="text-2xl font-extrabold tabular-nums text-ink">{k.tuan_nay != null ? `${k.tuan_nay}%` : "–"}</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface2">
                    <div className={`h-full rounded-full bg-gradient-to-r ${mau}`} style={{ width: `${k.tuan_nay ?? 0}%` }} />
                  </div>
                  <p className={`m-0 mt-2 inline-flex items-center gap-1 text-xs font-bold ${chenh > 0 ? "text-ok" : chenh < 0 ? "text-danger" : "text-soft"}`}>
                    <IconChenh size={13} />
                    {chenh == null
                      ? (k.tuan_nay == null ? tr("Tuần này chưa làm bài", "Rien cette semaine", "Nothing this week") : tr("Tuần trước chưa làm bài", "Rien la semaine passée", "Nothing last week"))
                      : chenh === 0 ? tr("Giữ nguyên so với tuần trước", "Stable par rapport à la semaine passée", "Same as last week")
                      : `${chenh > 0 ? "+" : ""}${chenh} ${tr("so với tuần trước", "par rapport à la semaine passée", "vs last week")}`}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {(yeu || d.goi_y?.length > 0) && (
        <section className="rounded-3xl border border-solid border-primary/25 bg-primary-soft p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-on-primary"><Sparkles size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-base font-extrabold text-ink">{tr("Gợi ý cho tuần tới", "Pour la semaine prochaine", "For next week")}</p>
              {yeu && <p className="m-0 mt-1 text-sm text-soft">{tr("Kỹ năng điểm thấp nhất tuần này", "Compétence la plus faible cette semaine", "Weakest skill this week")}: <strong className="text-ink">{kyNang(yeu.sk).ten}</strong> ({yeu.tuan_nay}%).</p>}
            </div>
          </div>
          {d.goi_y?.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {d.goi_y.map((g) => <GoiYBai key={g.id} g={g} />)}
            </div>
          )}
        </section>
      )}

      {d.sai_lap?.length > 0 && (
        <section>
          <TieuDe Icon={Repeat}>{tr("Câu bạn hay sai lặp lại", "Questions ratées plusieurs fois", "Questions you keep missing")}</TieuDe>
          <ul className="m-0 grid list-none gap-2 p-0">
            {d.sai_lap.map((s, i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl border border-solid border-line bg-surface p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-sm font-extrabold tabular-nums text-danger" title={tr("số lần sai", "nombre d'erreurs", "times missed")}>×{s.so_lan}</span>
                <div className="min-w-0 flex-1">
                  <p lang="fr" className="m-0 line-clamp-2 text-sm text-ink">{boThe(s.prompt) || tr("(câu không có đề chữ)", "(question sans énoncé)", "(no text prompt)")}</p>
                  <p className="m-0 mt-0.5 truncate text-xs text-soft">{s.title}</p>
                </div>
                {s.exercise_id && <NutLamLai id={s.exercise_id} nho />}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function GoiYBai({ g }) {
  const nav = useNavigate();
  return (
    <button type="button" onClick={() => nav("/etudiant/entrainement", { state: { moBai: g.id } })}
      className="group flex cursor-pointer items-center gap-2 rounded-2xl border border-solid border-line bg-surface p-3 text-left font-sans hover:border-primary">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink">{g.title}</span>
        {g.level && <span className="mt-1 inline-block rounded-full bg-surface2 px-2 py-0.5 text-[11px] font-bold text-soft">{g.level}</span>}
      </span>
      <ArrowRight size={16} className="shrink-0 text-primary transition-transform group-hover:translate-x-1" />
    </button>
  );
}

/* ── Ôn câu sai ── */
function CauSai({ d }) {
  const ds = d.cau ?? [];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-3xl bg-danger-soft p-4">
          <Target size={22} className="shrink-0 text-danger" />
          <div><p className="m-0 text-2xl font-extrabold tabular-nums text-danger">{ds.length}</p><p className="m-0 text-xs font-bold text-ink">{tr("câu còn sai", "questions encore ratées", "questions still wrong")}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-3xl bg-ok-soft p-4">
          <CheckCircle2 size={22} className="shrink-0 text-ok" />
          <div><p className="m-0 text-2xl font-extrabold tabular-nums text-ok">{d.da_sua ?? 0}</p><p className="m-0 text-xs font-bold text-ink">{tr("câu đã sửa được", "questions corrigées", "questions fixed")}</p></div>
        </div>
      </div>
      <p className="m-0 text-sm text-soft">{tr("Câu có lần trả lời GẦN NHẤT vẫn sai. Làm lại bài cho tới khi đúng thì câu tự rời danh sách.", "Questions dont la DERNIÈRE réponse est fausse. Refaites l'exercice : une fois réussie, la question disparaît.", "Questions whose LATEST answer is still wrong. Redo the exercise: once right, it leaves the list.")}</p>
      {!ds.length ? (
        <p className="m-0 flex items-center gap-2 rounded-2xl bg-ok-soft p-4 text-sm font-bold text-ok"><CheckCircle2 size={18} /> {tr("Không còn câu sai nào. Tuyệt vời!", "Plus aucune question ratée. Bravo !", "No wrong questions left. Great job!")}</p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {ds.map((c) => (
            <li key={c.question_id} className="rounded-3xl border border-solid border-line bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-extrabold text-ink">{c.title}</span>
                {c.level && <span className="rounded-full bg-surface2 px-2 py-0.5 font-bold text-soft">{c.level}</span>}
                <span className="rounded-full bg-danger-soft px-2 py-0.5 font-bold text-danger">{tr("sai", "raté", "missed")} {c.so_lan_sai} {tr("lần", "fois", "times")}</span>
                {c.store === "practice" && <span className="ml-auto"><NutLamLai id={c.exercise_id} nho /></span>}
              </div>
              <p lang="fr" className="m-0 mt-2 text-sm text-ink">{boThe(c.prompt).slice(0, 240) || tr("(câu không có đề chữ)", "(question sans énoncé)", "(no text prompt)")}</p>
              {c.loi_giai && (
                <p className="m-0 mt-2 flex gap-2 rounded-2xl bg-surface2 p-3 text-xs leading-relaxed text-soft">
                  <span className="shrink-0 font-extrabold text-primary">{tr("Lời giải", "Explication", "Explanation")}</span>{boThe(c.loi_giai).slice(0, 300)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Ôn câu ngữ pháp sai (16/10, migration 149): câu « Học ngữ pháp » làm sai, lịch ôn
 * giãn cách (sai → hôm nay; đúng → 1, 2, 4… ngày, tối đa 60). Ghi qua ghi_cau_ngu_phap
 * ngay trong ThucHanh. Câu đã bị sửa / xoá khỏi nội dung thì timCau trả null: bỏ qua. */
function OnNguPhap({ thu }) {
  const [ds, setDs] = useState(thu ?? undefined);
  const [dangOn, setDangOn] = useState(null);
  const [lan, setLan] = useState(0);
  useEffect(() => {
    if (thu) return undefined;
    let huy = false;
    supabase.from("ngu_phap_cau_sai").select("ma_bai, cau, lan_sai, han").order("han").limit(500)
      .then(({ data, error }) => { if (!huy) setDs(error ? null : data ?? []); });
    return () => { huy = true; };
  }, [lan, thu]);
  if (ds === undefined) return <DangTai />;
  if (ds === null) return <LoiDoc />;
  const homNay = ngayHomNay();
  const conCau = ds.map((r) => ({ r, c: timCau(r.ma_bai, r.cau) })).filter((x) => x.c);
  const denHan = conCau.filter((x) => x.r.han <= homNay);
  const sapToi = conCau.length - denHan.length;
  if (dangOn) return (
    <div>
      <ThucHanh cau={dangOn} tieuDe={tr("Ôn câu ngữ pháp sai", "Révision grammaire", "Grammar review")} />
      <button type="button" onClick={() => { setDangOn(null); setLan((x) => x + 1); }}
        className="mt-4 cursor-pointer rounded-full border border-solid border-line bg-surface px-4 py-2 font-sans text-sm font-bold text-ink hover:border-primary">{tr("Xong, quay lại danh sách", "Terminé, retour à la liste", "Done, back to list")}</button>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-3xl bg-danger-soft p-4">
          <Flame size={22} className="shrink-0 text-danger" />
          <div><p className="m-0 text-2xl font-extrabold tabular-nums text-danger">{denHan.length}</p><p className="m-0 text-xs font-bold text-ink">{tr("câu cần ôn hôm nay", "à revoir aujourd'hui", "due today")}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-3xl bg-surface2 p-4">
          <CalendarDays size={22} className="shrink-0 text-soft" />
          <div><p className="m-0 text-2xl font-extrabold tabular-nums text-ink">{sapToi}</p><p className="m-0 text-xs font-bold text-soft">{tr("câu đã hẹn ôn ngày sau", "programmées plus tard", "scheduled later")}</p></div>
        </div>
      </div>
      <p className="m-0 text-sm text-soft">{tr("Câu trong « Học ngữ pháp » bạn từng làm sai. Làm đúng thì câu được hẹn ôn lại sau 1, 2, 4… ngày; sai thì quay lại ôn ngay.", "Questions de grammaire ratées. Bonne réponse : prochaine révision dans 1, 2, 4… jours ; erreur : à revoir tout de suite.", "Grammar questions you missed. Right answer: next review in 1, 2, 4… days; wrong: review again now.")}</p>
      {denHan.length ? (
        <button type="button" onClick={() => setDangOn(denHan.slice(0, 20).map((x) => x.c))}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-6 py-3 font-sans text-sm font-extrabold text-on-primary shadow-md hover:opacity-90">
          <RotateCcw size={16} /> {tr(`Bắt đầu ôn (${Math.min(20, denHan.length)} câu)`, `Commencer (${Math.min(20, denHan.length)} questions)`, `Start review (${Math.min(20, denHan.length)})`)}
        </button>
      ) : (
        <p className="m-0 flex items-center gap-2 rounded-2xl bg-ok-soft p-4 text-sm font-bold text-ok"><CheckCircle2 size={18} /> {conCau.length ? tr("Hôm nay không có câu nào cần ôn.", "Rien à revoir aujourd'hui.", "Nothing due today.") : tr("Chưa có câu ngữ pháp nào làm sai.", "Aucune erreur de grammaire enregistrée.", "No grammar mistakes yet.")}</p>
      )}
      {denHan.length > 0 && (
        <ul className="m-0 grid list-none gap-2 p-0">
          {denHan.slice(0, 20).map(({ r, c }) => (
            <li key={r.ma_bai + r.cau} className="rounded-2xl border border-solid border-line bg-surface p-3 text-sm">
              <p lang="fr" className="m-0 text-ink">{choTrong(c.loai === "sap" ? c.goiY : c.de)}</p>
              <p className="m-0 mt-1 text-xs text-soft">{c.__ten} · <span className="text-danger">{tr("sai", "raté", "missed")} {r.lan_sai} {tr("lần", "fois", "times")}</span></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Đếm lượt nộp bài mỗi ngày (giờ VN) trong 12 tuần + 1 tuần dự phòng. Chỉ chạy khi đã biết là VIP. */
async function docNgayHoc() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return null;
  const tu = new Date(Date.now() - 91 * 86400000).toISOString();
  const { data, error } = await supabase.from("attempts").select("id, finished_at")
    .eq("user_id", uid).not("finished_at", "is", null).gte("finished_at", tu)
    .order("finished_at").order("id").limit(5000);
  if (error) return null;
  const dem = {};
  (data ?? []).forEach((a) => { const k = ngayVN(a.finished_at); dem[k] = (dem[k] ?? 0) + 1; });
  return dem;
}

export default function TienBoVip({ name, thu }) {
  const [tab, setTab] = useState("bao_cao");
  const [baoCao, setBaoCao] = useState(thu?.baoCao);
  const [cauSai, setCauSai] = useState(thu?.cauSai);
  const [ngay, setNgay] = useState(thu?.ngay);
  const [payFor, setPayFor] = useState(null);
  const [payCfg, setPayCfg] = useState(null);
  const [lan, setLan] = useState(0);

  useEffect(() => { if (!thu) load(PAYMENT_KEY, null).then(setPayCfg).catch(() => {}); }, [thu]);
  useEffect(() => {
    if (thu) return undefined;
    let huy = false;
    supabase.rpc("bao_cao_tuan").then(({ data, error }) => { if (!huy) setBaoCao(error ? null : data); });
    supabase.rpc("cau_sai_cua_toi").then(({ data, error }) => { if (!huy) setCauSai(error ? null : data); });
    return () => { huy = true; };
  }, [lan, thu]);
  useEffect(() => {
    if (thu || !baoCao?.ok) return undefined;
    let huy = false;
    docNgayHoc().then((v) => { if (!huy) setNgay(v); });
    return () => { huy = true; };
  }, [baoCao?.ok, thu]);

  const canVip = baoCao?.ma === "CAN_VIP" || cauSai?.ma === "CAN_VIP";
  const homNay = baoCao?.den ?? ngayHomNay();
  const TABS = [
    ["bao_cao", BarChart3, tr("Báo cáo tuần", "Bilan de la semaine", "Weekly report")],
    ["cau_sai", Target, tr("Ôn câu sai", "Revoir mes erreurs", "Review mistakes")],
    ["ngu_phap", Repeat, tr("Ôn ngữ pháp", "Réviser la grammaire", "Grammar review")],
    /* Giai đoạn 3 chấm AI (09/11): lỗi viết cộng dồn qua các phiếu AI chấm. */
    ["loi_viet", PenLine, tr("Lỗi hay mắc", "Erreurs fréquentes", "Frequent errors")],
  ];
  const d = tab === "bao_cao" ? baoCao : cauSai;

  return (
    <MotionConfig reducedMotion="user">
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {canVip ? (
        <>
          <h1 className="m-0 flex items-center gap-2 text-2xl font-extrabold text-ink"><Crown size={22} className="text-warn" /> {tr("Tiến bộ VIP", "Progrès VIP", "VIP progress")}</h1>
          <MoiVip onMua={() => setPayFor(goiVip(tr("Gói VIP 1 tháng", "Abonnement VIP 1 mois", "1-month VIP plan")))} />
        </>
      ) : baoCao === undefined ? <DangTai /> : !baoCao?.ok ? <LoiDoc /> : (
        <>
          <DauTrang d={baoCao} ngay={ngay} homNay={homNay} />
          {ngay === null ? null : ngay ? <NhipHoc ngay={ngay} homNay={homNay} /> : <DangTai />}

          <div role="tablist" className="flex gap-1 overflow-x-auto rounded-full bg-surface2 p-1 no-scrollbar">
            {TABS.map(([k, Icon, nhan]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={`inline-flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-0 px-4 py-2.5 font-sans text-sm font-bold transition-colors ${tab === k ? "bg-surface text-primary shadow-sm" : "bg-transparent text-soft hover:text-ink"}`}>
                <Icon size={15} />{nhan}
              </button>
            ))}
          </div>

          {tab === "loi_viet" ? <HoSoLoiViet thu={thu?.loiViet} /> : tab === "ngu_phap" ? <OnNguPhap thu={thu?.nguPhap} /> : d === undefined ? <DangTai /> : !d?.ok ? <LoiDoc />
            : tab === "bao_cao" ? <BaoCao d={d} /> : <CauSai d={d} />}
        </>
      )}
      {payFor && <PaymentModal ex={payFor} student={name} config={payCfg}
        onClose={() => setPayFor(null)} onUnlocked={() => setLan((x) => x + 1)} />}
    </div>
    </MotionConfig>
  );
}
