import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Headphones, BookOpen, PenLine, Puzzle, Languages, Mic, ArrowRight, Map, Swords, Layers, Timer, TrendingUp, BookA, Gamepad2 } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { nhanHoSo } from "../../shared/nhanHoSo.js";
import { exSkills } from "../../shared/exercises.js";
import { Leon } from "../../shared/leon.jsx";
import { keHoach, CAP } from "../../shared/deXuat.js";

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
/* Màu theo kỹ năng, khớp thẻ kỹ năng ở Thư viện luyện tập (23/10). */
const MAU_KN = {
  "Écoute": "from-blue-500 to-indigo-600", "Lecture": "from-emerald-500 to-teal-600", "Production écrite": "from-rose-500 to-pink-600",
  "Production orale": "from-fuchsia-500 to-purple-600", "Grammaire": "from-violet-500 to-purple-600", "Vocabulaire": "from-amber-400 to-orange-500",
};
const mauKN = (k) => MAU_KN[k] ?? "from-cyan-500 to-sky-600";
const IconKN = (k) => KY_NANG[k]?.Icon ?? BookOpen;
/* ─────────── Đề xuất bài ───────────
   Thuật toán ở shared/deXuat.js (15/10): theo trình độ + mục tiêu + kỹ năng yếu. */
export { chonDeXuat } from "../../shared/deXuat.js";

const NHAN_LY_DO = {
  yeu: () => tr("Kỹ năng cần luyện", "Compétence à renforcer", "Skill to strengthen"),
  cap: () => tr("Đúng trình độ", "À votre niveau", "Your level"),
  thu_thach: () => tr("Thử sức trình độ cao hơn", "Niveau au-dessus", "Next level up"),
  moi: () => tr("Chưa làm", "Pas encore fait", "Not done yet"),
  muc_tieu: () => tr("Hợp mục tiêu", "Pour votre objectif", "Fits your goal"),
};

/* Một dòng nói rõ kế hoạch suy ra từ hồ sơ, để học sinh hiểu VÌ SAO là các bài này. */
export function DongKeHoach({ level, goal }) {
  const kh = keHoach(level, goal);
  if (!kh) return null;
  const tu = level || CAP[kh.capChinh];
  return (
    <p className="m-0 mt-3 flex flex-wrap items-center gap-1.5 rounded-2xl bg-primary-soft px-3 py-2 text-xs text-ink">
      <span>
        <strong>{nhanHoSo(tu)}</strong>{goal ? <> → <strong>{nhanHoSo(goal)}</strong></> : null}
        {": "}{tr("ưu tiên bài", "priorité aux exercices", "focus on")} <strong>{CAP[kh.capChinh]}</strong>
        {kh.capThu != null && <>, {tr("thử sức", "puis", "then try")} <strong>{CAP[kh.capThu]}</strong></>}
        {kh.thi && <>; {tr("luyện đủ kỹ năng thi", "toutes les compétences de l'examen", "all exam skills")}</>}
      </span>
      {kh.thi && kh.dich != null && (
        <Link to="/etudiant/examen" className="ml-auto inline-flex items-center gap-1 font-bold text-primary no-underline">
          <Timer size={13} /> {tr("Thi thử", "Examen blanc", "Mock exam")} {CAP[kh.dich]}
        </Link>
      )}
    </p>
  );
}

export function DeXuatBai({ dsDeXuat, onMo, coHoSo, level, goal, gon = false }) {
  return (
    <section className={gon ? "" : "rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex items-center gap-3">
          <Leon cam="hoc" size={60} className="shrink-0" />
          <div>
            <p className="m-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">{tr("Leon chọn cho bạn", "Leon a choisi pour vous", "Leon picked for you")}</p>
            <h2 className="m-0 mt-1 text-lg font-extrabold text-ink">{tr("Bài tập đề xuất", "Exercices recommandés", "Recommended exercises")}</h2>
          </div>
        </div>
        <Link to="/etudiant/entrainement" className="inline-flex items-center gap-1 text-sm font-bold text-primary no-underline">
          {tr("Toàn bộ thư viện", "Toute la bibliothèque", "Whole library")} <ArrowRight size={14} />
        </Link>
      </div>
      {(level || goal) && <DongKeHoach level={level} goal={goal} />}
      {!coHoSo && (
        <p className="m-0 mt-2 text-xs text-soft">
          {tr("Điền trình độ và mục tiêu ở trang Tài khoản để đề xuất sát hơn.", "Indiquez votre niveau et votre objectif dans « Mon compte » pour des suggestions plus précises.", "Set your level and goal in Account for better suggestions.")}
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
                  className="group relative flex h-full w-full cursor-pointer flex-col gap-3 overflow-hidden rounded-3xl border border-solid border-line bg-surface p-4 text-left font-sans shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.1)] active:scale-[0.985]">
                  {/* Vệt màu kỹ năng ở góc, mờ, chỉ để thẻ có sắc riêng. */}
                  <span aria-hidden className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${mauKN(kn)} opacity-15 transition-transform duration-300 group-hover:scale-125`} />
                  <span className="relative flex items-start gap-3">
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${mauKN(kn)} text-white shadow-[0_8px_16px_rgba(15,23,42,0.15)]`}><Icon size={22} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-soft">
                        {tenKN(kn)} <span className="rounded-md bg-surface2 px-1.5 py-px text-ink">{ex.level}</span>
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[15px] font-extrabold leading-snug text-ink">{ex.title}</span>
                    </span>
                  </span>
                  <span className="relative mt-auto flex flex-wrap items-center gap-1.5">
                    {ly.slice(0, 2).map((k) => (
                      <span key={k} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${k === "yeu" ? "bg-warn-soft text-warn" : k === "moi" ? "bg-surface2 text-soft" : "bg-ok-soft text-ok"}`}>{NHAN_LY_DO[k]()}</span>
                    ))}
                    <span className={`ml-auto grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${mauKN(kn)} text-white shadow-md transition-transform group-hover:translate-x-0.5 group-hover:scale-110`} aria-label={tr("Làm ngay", "Commencer", "Start")}>
                      <ArrowRight size={16} />
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
/* ─────────── Tiến độ « Học ngữ pháp » (16/10) ───────────
 * Số bài đã làm phần « Ôn tập cả bài » (bảng bai_hoc_ket_qua, migration 148) trên tổng
 * số bài trong mã nguồn. Nội dung bài nạp ĐỘNG để trang chủ không phải tải ~300 KB
 * bài học. Bài học tiếp: bài đầu tiên chưa làm ở trình độ của người học. */
export function TienDoNguPhap({ level }) {
  const [tt, setTt] = useState(null);       // null = đang tải; { tong, xong, theoCap, tiep }
  useEffect(() => {
    let huy = false;
    Promise.all([
      import("../../content/nguPhap/index.js"),
      supabase.from("bai_hoc_ket_qua").select("ma_bai").then((r) => r, () => ({ data: null })),
    ]).then(([m, { data }]) => {
      if (huy) return;
      const daLam = new Set((data ?? []).map((r) => r.ma_bai));
      const caps = m.CAP.map((c) => { const ds = m.TAT_CA.filter((b) => b.cap === c); return { c, tong: ds.length, xong: ds.filter((b) => daLam.has(b.ma)).length }; });
      /* Trình độ trong hồ sơ; chưa có thì dùng kết quả bài xếp trình độ (lưu ở máy). */
      let capXep = "";
      try { capXep = JSON.parse(localStorage.getItem("mcf-xep-trinh-do") || "null")?.cap ?? ""; } catch { /* bỏ qua */ }
      const capCua = String(level || capXep).toUpperCase().slice(0, 2);
      const tiep = m.TAT_CA.find((b) => b.cap === capCua && !daLam.has(b.ma)) ?? m.TAT_CA.find((b) => !daLam.has(b.ma)) ?? null;
      setTt({ tong: m.TAT_CA.length, xong: m.TAT_CA.filter((b) => daLam.has(b.ma)).length, caps, tiep, docDuoc: !!data });
    });
    return () => { huy = true; };
  }, [level]);
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><BookA size={20} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-lg font-extrabold text-ink">{tr("Học ngữ pháp", "Grammaire", "Grammar")}</h2>
          <p className="m-0 text-sm text-soft">
            {tt === null ? tr("Đang tải…", "Chargement…", "Loading…")
              : !tt.docDuoc ? tr("Chưa đọc được tiến độ.", "Progression indisponible.", "Progress unavailable.")
              : tr(`Đã học ${tt.xong}/${tt.tong} bài`, `${tt.xong}/${tt.tong} leçons faites`, `${tt.xong}/${tt.tong} lessons done`)}
          </p>
        </div>
        <Link to={tt?.tiep ? `/etudiant/ngu-phap/${tt.tiep.ma}` : "/etudiant/ngu-phap"}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary no-underline hover:opacity-90">
          {tt?.tiep ? tr("Học tiếp", "Continuer", "Continue") : tr("Mở", "Ouvrir", "Open")} <ArrowRight size={15} />
        </Link>
      </div>
      {tt?.tiep && <p className="m-0 mt-3 text-sm text-ink"><span className="text-soft">{tr("Bài tiếp theo", "Leçon suivante", "Next lesson")}:</span> <strong>{tt.tiep.cap} · {tt.tiep.ten}</strong></p>}
      {tt?.docDuoc && tt.xong === 0 && (
        <Link to="/etudiant/ngu-phap/xep-trinh-do" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary no-underline hover:underline">
          {tr("Chưa biết bắt đầu từ đâu? Làm bài xếp trình độ 20 câu", "Par où commencer ? Faites le test de niveau", "Where to start? Take the placement test")} <ArrowRight size={14} />
        </Link>
      )}
      {tt?.docDuoc && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {tt.caps.map((x) => (
            <div key={x.c} className="rounded-xl bg-surface2 p-2">
              <div className="flex items-baseline justify-between text-xs"><strong className="text-ink">{x.c}</strong><span className="tabular-nums text-soft">{x.xong}/{x.tong}</span></div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((x.xong / Math.max(1, x.tong)) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function TroChoi() {
  const o = [
    { to: "/etudiant/lo-trinh", Icon: Map, nen: "from-emerald-500 to-teal-600",
      ten: tr("Lộ trình học tập", "Parcours", "Learning path"), mo: tr("Vượt màn theo chủ đề, nhận sao và XP", "Franchissez les étapes, gagnez étoiles et XP", "Clear levels by topic, earn stars and XP") },
    { to: "/etudiant/thach-dau", Icon: Swords, nen: "from-rose-500 to-orange-500",
      ten: tr("Thách đấu", "Défis", "Duels"), mo: tr("Đấu từ vựng với bạn học", "Affrontez vos camarades", "Vocabulary duels with classmates") },
    { to: "/etudiant/tro-choi", Icon: Gamepad2, nen: "from-amber-500 to-pink-500",
      ten: tr("Trò chơi nhanh", "Jeux rapides", "Quick games"), mo: tr("11 trò chơi học tiếng Pháp", "11 jeux pour apprendre", "11 games to learn French") },
    { to: "/etudiant/bo-the", Icon: Layers, nen: "from-violet-500 to-indigo-600",
      ten: "Flashcard", mo: tr("Ôn thẻ đến hạn hôm nay", "Révisez les cartes du jour", "Review today's due cards") },
    { to: "/etudiant/examen", Icon: Timer, nen: "from-sky-500 to-blue-600",
      ten: tr("Thi thử DELF", "Examen blanc", "Mock exam"), mo: tr("Mô phỏng phòng thi thật", "Comme le jour J", "Real exam conditions") },
  ];
  return (
    <section>
      <h2 className="m-0 mb-3 text-lg font-extrabold text-ink">{tr("Trò chơi & thử thách", "Jeux et défis", "Games & challenges")}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {o.map((x) => (
          <Link key={x.to} to={x.to}
            className={`group relative flex min-h-[132px] w-full flex-col justify-between self-stretch rounded-3xl 2xl:aspect-[3/4] 2xl:min-h-[auto] bg-gradient-to-br ${x.nen} p-4 text-white no-underline shadow-md transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.985]`}>
            {/* 28/10: thẻ đứng 3:4. Chữ dồn lên trên ngay dưới biểu tượng, mũi tên « Vào » ở đáy;
                hình nền mờ to hơn, lùi xuống góc dưới để không đè lên chữ.
                31/10: 3:4 chỉ là chiều cao TỐI THIỂU. Khoá cứng (min-h-0) thì tên dài hai dòng tràn
                xuống và « Vào » lệch so với thẻ bên cạnh; self-stretch giữ cả hàng cao bằng nhau.
                overflow-hidden phải nằm ở lớp hình nền: đặt trên thẻ thì trình duyệt bỏ chiều cao
                tối thiểu theo nội dung và lỗi trên quay lại. w-full chặn tỉ lệ 3:4 nới rộng thẻ ra
                khỏi ô lưới khi thẻ cao thêm. */}
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <x.Icon size={96} strokeWidth={1.2} className="absolute -bottom-5 -right-5 opacity-15 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
            </span>
            <span className="relative flex flex-col gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20"><x.Icon size={22} /></span>
              <span>
                <span className="block text-lg font-extrabold leading-tight">{x.ten}</span>
                <span className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-white/85">{x.mo}</span>
              </span>
            </span>
            <span className="relative mt-3 inline-flex shrink-0 items-center gap-1 self-start rounded-full bg-white/20 px-3 py-1 text-xs font-bold transition-colors group-hover:bg-white/30">
              {tr("Vào", "Ouvrir", "Open")} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
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

export function DongDeuKyNang({ skills, ghiChu, gon = false }) {
  const ds = [...(skills ?? [])].sort((a, b) => b.value - a.value);
  const tb = ds.length ? Math.round(ds.reduce((n, s) => n + s.value, 0) / ds.length) : null;
  const chenh = ds.length > 1 ? ds[0].value - ds[ds.length - 1].value : 0;
  const yeu = ds[ds.length - 1];
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="m-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-soft"><TrendingUp size={14} /> {tr("Hồ sơ kỹ năng", "Profil de compétences", "Skill profile")}</p>
          <h2 className={"m-0 mt-1 font-extrabold text-ink " + (gon ? "hidden" : "text-lg")}>{tr("Mức độ đồng đều theo kỹ năng", "Équilibre entre les compétences", "Balance across skills")}</h2>
        </div>
      </div>
      {tb != null && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-primary-soft px-3 py-2">
            <p className="m-0 text-2xl font-extrabold leading-tight tabular-nums text-ink">{tb}%</p>
            <p className="m-0 text-[11px] font-bold text-soft">{tr("Trung bình", "Moyenne", "Average")}</p>
          </div>
          <div className={`rounded-2xl px-3 py-2 ${chenh > 30 ? "bg-warn-soft" : "bg-ok-soft"}`}>
            <p className={`m-0 text-2xl font-extrabold leading-tight tabular-nums ${chenh > 30 ? "text-warn" : "text-ok"}`}>{chenh}</p>
            <p className="m-0 text-[11px] font-bold text-soft">{tr("Độ chênh", "Écart", "Gap")}</p>
          </div>
        </div>
      )}
      {!ds.length ? (
        <p className="m-0 mt-4 rounded-2xl bg-surface2 p-4 text-sm text-soft">
          {tr("Làm vài bài ở các kỹ năng khác nhau để thấy hồ sơ của bạn.", "Faites quelques exercices dans différentes compétences pour voir votre profil.", "Do a few exercises across skills to see your profile.")}
        </p>
      ) : (
        <>
          <ul className="m-0 mt-4 grid list-none gap-3.5 p-0">
            {ds.map(({ skill, value }) => {
              const [m, nhan] = muc(value);
              const Icon = IconKN(skill);
              return (
                <li key={skill} className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-2xl ${MAU[m][2]} ${MAU[m][1]}`}><Icon size={18} /></span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="truncate text-sm font-bold text-ink">{tenKN(skill)}</span>
                      <span className={`text-[11px] font-bold ${MAU[m][1]}`}>{nhan()}</span>
                      <span className="ml-auto text-sm font-extrabold tabular-nums text-ink">{value}%</span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface2">
                      <div className={`h-full w-full rounded-full ${MAU[m][0]} transition-transform duration-[550ms] ease-out`} style={{ transform: `translateX(${Math.max(value, 3) - 100}%)` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {ds.length > 1 && yeu && (
            <p className={"m-0 rounded-2xl bg-surface2 text-xs leading-relaxed text-ink " + (gon ? "mt-3 px-3 py-2" : "mt-4 px-4 py-3")}>
              {tr(`Nên luyện thêm ${tenKN(yeu.skill)}, bài đề xuất đã ưu tiên kỹ năng này.`,
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
