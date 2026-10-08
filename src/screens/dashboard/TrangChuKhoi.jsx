import React from "react";
import { Link } from "react-router-dom";
import { Headphones, BookOpen, PenLine, Puzzle, Languages, Mic, Sparkles, ArrowRight, Map, Swords, Layers, Timer, TrendingUp } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { exSkills } from "../../shared/exercises.js";

/* Ba khối mới của trang chủ học sinh (08/10): trang chủ giờ chủ yếu là ĐỀ XUẤT
 * và TRÒ CHƠI; số liệu bài được giao đã sang trang « Bài tập được giao ».
 *
 *   · DeXuatBai      : chọn bài luyện tập cho riêng người học, kèm LÝ DO.
 *   · TroChoi        : lối vào Lộ trình, Thách đấu, Flashcard, Thi thử.
 *   · DongDeuKyNang  : mức độ đồng đều theo kỹ năng, dạng thanh ngang có nhãn.
 *
 * Mọi con số và lý do tính từ dữ liệu thật (quy tắc 1): kỹ năng yếu lấy từ
 * skillBreakdown, « chưa làm » từ lịch sử luyện tập, trình độ từ hồ sơ. */

const KY_NANG = {
  "Écoute": { Icon: Headphones, ten: () => tr("Nghe hiểu", "Compréhension orale", "Listening") },
  "Lecture": { Icon: BookOpen, ten: () => tr("Đọc hiểu", "Compréhension écrite", "Reading") },
  "Production écrite": { Icon: PenLine, ten: () => tr("Viết", "Production écrite", "Writing") },
  "Production orale": { Icon: Mic, ten: () => tr("Nói", "Production orale", "Speaking") },
  "Grammaire": { Icon: Puzzle, ten: () => tr("Ngữ pháp", "Grammaire", "Grammar") },
  "Vocabulaire": { Icon: Languages, ten: () => tr("Từ vựng", "Vocabulaire", "Vocabulary") },
  "Communication": { Icon: Mic, ten: () => tr("Giao tiếp", "Communication", "Communication") },
  "Traduction": { Icon: Languages, ten: () => tr("Dịch", "Traduction", "Translation") },
};
const tenKN = (k) => KY_NANG[k]?.ten() ?? k;
const IconKN = (k) => KY_NANG[k]?.Icon ?? Sparkles;
const CAP = ["A1", "A2", "B1", "B2", "C1"];

/* ─────────── Đề xuất bài ─────────── */
export function chonDeXuat({ practice, hist, skills, level, so = 4 }) {
  if (!Array.isArray(practice) || !practice.length) return [];
  const daLam = (ex) => hist?.[ex.id] && typeof hist[ex.id].best === "number" && hist[ex.id].best >= 0;
  const yeu = (skills ?? []).length ? [...skills].sort((a, b) => a.value - b.value)[0] : null;
  const viTriCap = CAP.indexOf(level);
  const diem = (ex) => {
    let d = 0;
    const ly = [];
    if (!daLam(ex)) { d += 3; ly.push("moi"); }
    if (yeu && exSkills(ex).includes(yeu.skill)) { d += 4; ly.push("yeu"); }
    if (viTriCap >= 0) {
      const c = CAP.indexOf(ex.level);
      if (c === viTriCap) { d += 3; ly.push("cap"); }
      else if (c === viTriCap + 1) { d += 1; ly.push("thu_thach"); }
      else if (c >= 0 && Math.abs(c - viTriCap) > 1) d -= 3;
    }
    if (ex.isPremium) d -= 1;
    return { ex, d, ly };
  };
  return practice.filter((ex) => (ex.questions ?? []).length).map(diem)
    .sort((a, b) => b.d - a.d || String(b.ex.createdAt ?? "").localeCompare(String(a.ex.createdAt ?? "")))
    .slice(0, so).map((x) => ({ ...x, yeu: yeu?.skill }));
}

const NHAN_LY_DO = {
  yeu: () => tr("Kỹ năng cần luyện", "Compétence à renforcer", "Skill to strengthen"),
  cap: () => tr("Đúng trình độ", "À votre niveau", "Your level"),
  thu_thach: () => tr("Thử sức trình độ cao hơn", "Niveau au-dessus", "Next level up"),
  moi: () => tr("Chưa làm", "Pas encore fait", "Not done yet"),
};

export function DeXuatBai({ dsDeXuat, onMo, coHoSo }) {
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="m-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary"><Sparkles size={14} /> {tr("Dành cho bạn", "Pour vous", "For you")}</p>
          <h2 className="m-0 mt-1 text-lg font-extrabold text-ink">{tr("Bài tập đề xuất", "Exercices recommandés", "Recommended exercises")}</h2>
        </div>
        <Link to="/etudiant/entrainement" className="inline-flex items-center gap-1 text-sm font-bold text-primary no-underline">
          {tr("Toàn bộ thư viện", "Toute la bibliothèque", "Whole library")} <ArrowRight size={14} />
        </Link>
      </div>
      {!coHoSo && (
        <p className="m-0 mt-2 text-xs text-soft">
          {tr("Điền trình độ ở trang Tài khoản để đề xuất sát hơn.", "Indiquez votre niveau dans « Mon compte » pour des suggestions plus précises.", "Set your level in Account for better suggestions.")}
        </p>
      )}
      {dsDeXuat === null ? (
        <p className="m-0 mt-4 text-sm text-soft">{tr("Đang chọn bài…", "Sélection…", "Picking exercises…")}</p>
      ) : !dsDeXuat.length ? (
        <p className="m-0 mt-4 text-sm text-soft">{tr("Thư viện chưa có bài nào.", "La bibliothèque est vide.", "The library is empty.")}</p>
      ) : (
        <ul className="m-0 mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
          {dsDeXuat.map(({ ex, ly }) => {
            const kn = exSkills(ex)[0];
            const Icon = IconKN(kn);
            return (
              <li key={ex.id}>
                <button type="button" onClick={() => onMo(ex)}
                  className="group flex h-full w-full cursor-pointer flex-col gap-3 rounded-2xl border border-solid border-line bg-surface p-4 text-left font-sans transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={19} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-wide text-soft">{tenKN(kn)} · {ex.level}</span>
                      <span className="line-clamp-2 block text-sm font-bold leading-snug text-ink">{ex.title}</span>
                    </span>
                  </span>
                  <span className="mt-auto flex flex-wrap items-center gap-1.5">
                    {ly.slice(0, 2).map((k) => (
                      <span key={k} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${k === "yeu" ? "bg-warn-soft text-warn" : k === "moi" ? "bg-surface2 text-soft" : "bg-ok-soft text-ok"}`}>{NHAN_LY_DO[k]()}</span>
                    ))}
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-primary">
                      {tr("Làm ngay", "Commencer", "Start")} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ─────────── Trò chơi & thử thách ─────────── */
export function TroChoi() {
  const o = [
    { to: "/etudiant/lo-trinh", Icon: Map, nen: "from-emerald-500 to-teal-600",
      ten: tr("Lộ trình học tập", "Parcours", "Learning path"), mo: tr("Vượt màn theo chủ đề, nhận sao và XP", "Franchissez les étapes, gagnez étoiles et XP", "Clear levels by topic, earn stars and XP") },
    { to: "/etudiant/thach-dau", Icon: Swords, nen: "from-rose-500 to-orange-500",
      ten: tr("Thách đấu", "Défis", "Duels"), mo: tr("Đấu từ vựng với bạn học", "Affrontez vos camarades", "Vocabulary duels with classmates") },
    { to: "/etudiant/bo-the", Icon: Layers, nen: "from-violet-500 to-indigo-600",
      ten: "Flashcard", mo: tr("Ôn thẻ đến hạn hôm nay", "Révisez les cartes du jour", "Review today's due cards") },
    { to: "/etudiant/examen", Icon: Timer, nen: "from-sky-500 to-blue-600",
      ten: tr("Thi thử DELF", "Examen blanc", "Mock exam"), mo: tr("Mô phỏng phòng thi thật", "Comme le jour J", "Real exam conditions") },
  ];
  return (
    <section>
      <h2 className="m-0 mb-3 text-lg font-extrabold text-ink">{tr("Trò chơi & thử thách", "Jeux et défis", "Games & challenges")}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {o.map((x) => (
          <Link key={x.to} to={x.to}
            className={`group relative flex min-h-[132px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${x.nen} p-4 text-white no-underline shadow-md transition-transform duration-200 hover:-translate-y-1`}>
            <x.Icon size={64} strokeWidth={1.4} className="pointer-events-none absolute -bottom-3 -right-3 opacity-20" />
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20"><x.Icon size={20} /></span>
            <span>
              <span className="block text-base font-extrabold">{x.ten}</span>
              <span className="block text-xs text-white/85">{x.mo}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─────────── Mức độ đồng đều theo kỹ năng ─────────── */
const muc = (v) => (v >= 80 ? ["ok", () => tr("Vững", "Solide", "Strong")]
  : v >= 60 ? ["primary", () => tr("Khá", "Bien", "Good")]
    : v >= 40 ? ["warn", () => tr("Cần luyện", "À travailler", "Needs work")]
      : ["danger", () => tr("Yếu", "Fragile", "Weak")]);
const MAU = { ok: ["bg-ok", "text-ok", "bg-ok-soft"], primary: ["bg-primary", "text-primary", "bg-primary-soft"], warn: ["bg-warn", "text-warn", "bg-warn-soft"], danger: ["bg-danger", "text-danger", "bg-danger-soft"] };

export function DongDeuKyNang({ skills, ghiChu }) {
  const ds = [...(skills ?? [])].sort((a, b) => b.value - a.value);
  const tb = ds.length ? Math.round(ds.reduce((n, s) => n + s.value, 0) / ds.length) : null;
  const chenh = ds.length > 1 ? ds[0].value - ds[ds.length - 1].value : 0;
  const yeu = ds[ds.length - 1];
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="m-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-soft"><TrendingUp size={14} /> {tr("Hồ sơ kỹ năng", "Profil de compétences", "Skill profile")}</p>
          <h2 className="m-0 mt-1 text-lg font-extrabold text-ink">{tr("Mức độ đồng đều theo kỹ năng", "Équilibre entre les compétences", "Balance across skills")}</h2>
        </div>
        {tb != null && (
          <div className="flex gap-4 text-right">
            <div><p className="m-0 text-2xl font-extrabold tabular-nums text-ink">{tb}%</p><p className="m-0 text-[11px] text-soft">{tr("Trung bình", "Moyenne", "Average")}</p></div>
            <div><p className={`m-0 text-2xl font-extrabold tabular-nums ${chenh > 30 ? "text-warn" : "text-ok"}`}>{chenh}</p><p className="m-0 text-[11px] text-soft">{tr("Độ chênh", "Écart", "Gap")}</p></div>
          </div>
        )}
      </div>
      {!ds.length ? (
        <p className="m-0 mt-4 rounded-2xl bg-surface2 p-4 text-sm text-soft">
          {tr("Làm vài bài ở các kỹ năng khác nhau để thấy hồ sơ của bạn.", "Faites quelques exercices dans différentes compétences pour voir votre profil.", "Do a few exercises across skills to see your profile.")}
        </p>
      ) : (
        <>
          <ul className="m-0 mt-5 grid list-none gap-3.5 p-0">
            {ds.map(({ skill, value }) => {
              const [m, nhan] = muc(value);
              const Icon = IconKN(skill);
              return (
                <li key={skill} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${MAU[m][2]} ${MAU[m][1]}`}><Icon size={17} /></span>
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-bold text-ink">{tenKN(skill)}</span>
                      <span className={`text-[11px] font-bold ${MAU[m][1]}`}>{nhan()}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface2">
                      <div className={`h-full rounded-full ${MAU[m][0]} transition-[width] duration-700`} style={{ width: `${Math.max(value, 3)}%` }} />
                    </div>
                  </div>
                  <span className="w-11 text-right text-sm font-extrabold tabular-nums text-ink">{value}%</span>
                </li>
              );
            })}
          </ul>
          {ds.length > 1 && yeu && (
            <p className="m-0 mt-4 rounded-2xl bg-surface2 px-4 py-3 text-xs leading-relaxed text-ink">
              {tr(`Gợi ý: kỹ năng ${tenKN(yeu.skill)} đang thấp nhất. Các bài đề xuất phía trên ưu tiên kỹ năng này.`,
                `Conseil : ${tenKN(yeu.skill)} est votre point faible. Les recommandations ci-dessus le privilégient.`,
                `Tip: ${tenKN(yeu.skill)} is your weakest skill. The recommendations above focus on it.`)}
            </p>
          )}
          {ghiChu && <p className="m-0 mt-2 text-[11px] text-soft">{ghiChu}</p>}
        </>
      )}
    </section>
  );
}
