import React, { useEffect, useMemo, useState } from "react";
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

/* ── Khối đầu trang: tuần này ── */
function DauTrang({ d, ngay, homNay }) {
  const tuan = Array.from({ length: 7 }, (_, i) => congNgay(homNay, i - 6));
  const thu = THU();
  const O = ({ Icon, so, nhan }) => (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
      <Icon size={16} className="text-amber-300" />
      <p className="m-0 mt-2 text-3xl font-extrabold tabular-nums">{so}</p>
      <p className="m-0 text-xs text-white/70">{nhan}</p>
    </div>
  );
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-6 text-white shadow-[0_24px_60px_rgba(30,27,75,0.3)] sm:p-8">
      <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950"><Crown size={13} /> VIP</span>
          <h1 className="m-0 mt-3 text-2xl font-extrabold sm:text-3xl">{tr("Tiến bộ của bạn", "Vos progrès", "Your progress")}</h1>
          <p className="m-0 mt-1 text-sm text-white/70">{tr("7 ngày gần nhất", "7 derniers jours", "Last 7 days")}: {dm(d.tu)} → {dm(d.den)}</p>
        </div>
        {ngay && (
          <ol className="m-0 flex list-none gap-1.5 p-0" aria-label={tr("Ngày có học trong tuần", "Jours actifs de la semaine", "Active days this week")}>
            {tuan.map((x) => {
              const co = (ngay[x] ?? 0) > 0;
              return (
                <li key={x} className="grid justify-items-center gap-1" title={`${dm(x)}: ${ngay[x] ?? 0}`}>
                  <span className={`grid h-9 w-9 place-items-center rounded-full text-xs font-extrabold ${co ? "bg-amber-400 text-amber-950" : "bg-white/10 text-white/40"} ${x === homNay ? "ring-2 ring-white/70 ring-offset-2 ring-offset-indigo-950" : ""}`}>
                    {co ? <Check size={15} strokeWidth={3} /> : dm(x).slice(0, 2)}
                  </span>
                  <span className="text-[10px] font-bold text-white/60">{thu[thuCua(x)]}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
      <div className="relative mt-6 grid grid-cols-3 gap-3">
        <O Icon={BookOpen} so={d.so_bai} nhan={tr("bài đã nộp", "exercices rendus", "exercises submitted")} />
        <O Icon={Clock} so={thoiGian(d.giay)} nhan={tr("thời gian làm bài", "temps de travail", "time spent")} />
        <O Icon={Flame} so={`${d.ngay_hoc}/7`} nhan={tr("ngày có học", "jours actifs", "active days")} />
      </div>
    </section>
  );
}

/* ── Nhịp học 12 tuần ── */
const MUC = ["bg-surface2", "bg-primary/25", "bg-primary/45", "bg-primary/70", "bg-primary"];
const mucCua = (n) => (n <= 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);

function NhipHoc({ ngay, homNay }) {
  const { cot, soNgay, dainhat } = useMemo(() => {
    const dau = congNgay(homNay, -thuCua(homNay) - 7 * 11); // thứ Hai của 12 tuần trước
    const cot = Array.from({ length: 12 }, (_, c) => Array.from({ length: 7 }, (_, r) => congNgay(dau, c * 7 + r)));
    let soNgay = 0, chuoi = 0, dainhat = 0;
    cot.flat().filter((x) => x <= homNay).forEach((x) => {
      if ((ngay[x] ?? 0) > 0) { soNgay += 1; chuoi += 1; dainhat = Math.max(dainhat, chuoi); } else chuoi = 0;
    });
    return { cot, soNgay, dainhat };
  }, [ngay, homNay]);
  const thu = THU();
  return (
    <section className="rounded-3xl border border-solid border-line bg-surface p-5 sm:p-6">
      <TieuDe Icon={CalendarDays} phu={tr("Mỗi ô là một ngày", "Une case = un jour", "One square per day")}>{tr("Nhịp học 12 tuần", "Rythme sur 12 semaines", "12-week rhythm")}</TieuDe>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        {/* Cột nhãn thứ là lưới 7 hàng 1fr, cao bằng khối ô bên cạnh nên tự thẳng hàng. */}
        <div className="flex w-full max-w-[26rem] gap-2">
          <div className="grid shrink-0 grid-rows-7 gap-1 text-[10px] font-bold leading-none text-soft">
            {thu.map((t, i) => <span key={t} className={`flex items-center ${i % 2 ? "invisible" : ""}`}>{t}</span>)}
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-12 gap-1">
            {cot.map((c, i) => (
              <div key={i} className="grid grid-rows-7 gap-1">
                {c.map((x) => x > homNay
                  ? <span key={x} className="aspect-square" />
                  : <span key={x} title={`${dm(x)}: ${ngay[x] ?? 0} ${tr("bài", "exercice(s)", "exercise(s)")}`}
                      className={`aspect-square rounded-[5px] ${MUC[mucCua(ngay[x] ?? 0)]} ${x === homNay ? "ring-2 ring-primary ring-offset-1 ring-offset-surface" : ""}`} />)}
              </div>
            ))}
          </div>
        </div>
        <div className="grid min-w-[12rem] flex-1 gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-primary-soft p-3">
            <CalendarDays size={20} className="shrink-0 text-primary" />
            <div><p className="m-0 text-2xl font-extrabold tabular-nums text-primary">{soNgay}</p><p className="m-0 text-xs font-bold text-ink">{tr("ngày có học", "jours actifs", "active days")}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-warn-soft p-3">
            <Flame size={20} className="shrink-0 text-warn" />
            <div><p className="m-0 text-2xl font-extrabold tabular-nums text-warn">{dainhat}</p><p className="m-0 text-xs font-bold text-ink">{tr("ngày liền dài nhất", "jours d'affilée au maximum", "longest run of days")}</p></div>
          </div>
          <span className="flex items-center gap-1 text-xs text-soft">{tr("Ít", "Moins", "Less")}{MUC.map((m) => <span key={m} className={`h-3 w-3 rounded-[3px] ${m}`} />)}{tr("Nhiều", "Plus", "More")}</span>
        </div>
      </div>
    </section>
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
  ];
  const d = tab === "bao_cao" ? baoCao : cauSai;

  return (
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

          {tab === "ngu_phap" ? <OnNguPhap thu={thu?.nguPhap} /> : d === undefined ? <DangTai /> : !d?.ok ? <LoiDoc />
            : tab === "bao_cao" ? <BaoCao d={d} /> : <CauSai d={d} />}
        </>
      )}
      {payFor && <PaymentModal ex={payFor} student={name} config={payCfg}
        onClose={() => setPayFor(null)} onUnlocked={() => setLan((x) => x + 1)} />}
    </div>
  );
}
