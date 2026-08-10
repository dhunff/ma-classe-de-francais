import React, { useState } from "react";
import {
  House, LayoutGrid, Flame, CalendarDays, BookOpen, ChartColumn,
  LogOut, Search, Bell, MessageCircle, ChevronRight, Plus,
  Sparkles, Wallet, GraduationCap, Clock,
} from "lucide-react";

/* Bảng điều khiển "Soft UI" — ba cột: điều hướng · nội dung · panel phụ.

   Màn hình này cố tình KHÔNG dùng token màu của app (bg/surface/ink/primary).
   Nó là một bản thiết kế riêng theo bảng slate + indigo của Tailwind, nên mọi
   lớp màu đều viết thẳng. Nếu sau này gộp vào hệ thiết kế chung thì đổi
   SLATE/INDIGO ở đây sang token là đủ.

   Lưu ý quan trọng: preflight của Tailwind bị TẮT trong dự án này
   (xem tailwind.config.js), nên thẻ h1/h2/p vẫn còn margin mặc định của trình
   duyệt và <button> vẫn còn viền xám. Vì vậy mọi tiêu đề đều có `m-0` và mọi
   nút đều đi qua hằng RESET_BTN — bỏ đi là giao diện vỡ ngay. */

const RESET_BTN = "cursor-pointer border-0 font-[inherit] appearance-none";
const CARD = "rounded-3xl bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgba(15,23,42,0.05)]";

/* ─────────────────────────  Nguyên liệu dùng chung  ───────────────────────── */

/* Ảnh đại diện dựng bằng chữ cái đầu: không phụ thuộc mạng, không bao giờ vỡ
   ảnh, và giữ đúng tông pastel của thiết kế. */
function Avatar({ name, size = 44, gradient, online = false, ring = true }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className={[
          "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br font-bold text-white",
          gradient,
          ring ? "ring-2 ring-white" : "",
        ].join(" ")}
        style={{ fontSize: size * 0.36 }}
      >
        {initials}
      </span>
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
      )}
    </span>
  );
}

/* ─────────────────────────────  Cột trái  ───────────────────────────────── */

const NAV = [
  { key: "accueil", label: "Accueil", Icon: House },
  { key: "cours", label: "Tous les cours", Icon: LayoutGrid },
  { key: "populaires", label: "Cours populaires", Icon: Flame },
  { key: "emploi", label: "Emploi du temps", Icon: CalendarDays },
  { key: "mes-cours", label: "Mes cours", Icon: BookOpen },
  { key: "stats", label: "Statistiques", Icon: ChartColumn },
];

function Sidebar({ active, onSelect }) {
  return (
    <aside className="flex w-[250px] shrink-0 flex-col px-5 py-7">
      <div className="flex items-center gap-2.5 px-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-[0_6px_16px_rgba(79,70,229,0.35)]">
          <Sparkles size={18} className="text-white" strokeWidth={2.5} />
        </span>
        <span className="text-[19px] font-extrabold tracking-tight text-slate-800">
          Français<span className="text-indigo-500">Pro</span>
        </span>
      </div>

      <nav className="mt-9 flex flex-col gap-1.5" aria-label="Navigation principale">
        {NAV.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-current={isActive ? "page" : undefined}
              className={[
                RESET_BTN,
                "flex items-center gap-3 rounded-full px-4 py-3 text-left text-sm transition-all duration-200",
                isActive
                  ? "bg-white font-bold text-slate-800 shadow-[0_6px_18px_rgba(15,23,42,0.07)]"
                  : "bg-transparent font-medium text-slate-500 hover:bg-white/60 hover:text-slate-700",
              ].join(" ")}
            >
              <Icon size={19} strokeWidth={isActive ? 2.4 : 2} className={isActive ? "text-indigo-500" : ""} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className={`${CARD} flex items-center gap-3 p-3.5`}>
          <Avatar name="Đỗ Quốc Hùng" size={42} gradient="from-indigo-400 to-blue-500" />
          <div className="min-w-0">
            <p className="m-0 truncate text-sm font-bold text-slate-800">Đỗ Quốc Hùng</p>
            <p className="m-0 truncate text-xs font-medium text-slate-400">Plan Premium</p>
          </div>
        </div>

        <button
          type="button"
          className={`${RESET_BTN} mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-transparent px-4 py-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-600`}
        >
          <LogOut size={17} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

/* ────────────────────────────  Cột giữa  ───────────────────────────────── */

function BalancePill({ Icon, label, value, tone }) {
  return (
    <div className={`${CARD} flex items-center gap-3 px-4 py-3`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}>
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <div>
        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="m-0 text-base font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

/* Biểu đồ cột tối giản. Chiều cao tính theo phần trăm của cột cao nhất để
   thêm/bớt ngày không phải sửa lại con số nào. */
const WEEK = [
  { day: "Lun", value: 38 },
  { day: "Mar", value: 62 },
  { day: "Mer", value: 45 },
  { day: "Jeu", value: 88 },
  { day: "Ven", value: 54 },
  { day: "Sam", value: 30 },
  { day: "Dim", value: 20 },
];
const ACTIVE_DAY = "Jeu";

function ActivityChart() {
  const max = Math.max(...WEEK.map((d) => d.value));

  return (
    <div className={`${CARD} flex-1 p-6`}>
      <div className="flex items-baseline justify-between">
        <h2 className="m-0 text-base font-bold text-slate-800">Mon activité</h2>
        <span className="text-xs font-medium text-slate-400">Cette semaine</span>
      </div>

      <div className="mt-6 flex h-40 items-end gap-3">
        {WEEK.map(({ day, value }) => {
          const isActive = day === ACTIVE_DAY;
          return (
            <div key={day} className="flex flex-1 flex-col items-center gap-3">
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className={[
                    "w-2.5 rounded-full transition-all duration-300",
                    isActive ? "bg-indigo-500 shadow-[0_6px_16px_rgba(99,102,241,0.4)]" : "bg-slate-200",
                  ].join(" ")}
                  style={{ height: `${(value / max) * 100}%` }}
                  title={`${day} · ${value} min`}
                />
              </div>
              <span
                className={[
                  "text-xs",
                  isActive ? "font-bold text-slate-700" : "font-medium text-slate-400",
                ].join(" ")}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const NEXT_UP = [
  { time: "10:00", title: "Grammaire de base", tone: "bg-amber-100 text-amber-600" },
  { time: "12:00", title: "Phonétique", tone: "bg-sky-100 text-sky-600" },
];

function UpcomingCards() {
  return (
    <div className="flex w-[220px] shrink-0 flex-col gap-4">
      {NEXT_UP.map(({ time, title, tone }) => (
        <div key={time} className={`${CARD} flex flex-1 flex-col justify-center gap-3 p-5`}>
          <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${tone}`}>
            <Clock size={17} strokeWidth={2.2} />
          </span>
          <div>
            <p className="m-0 text-xs font-semibold text-slate-400">{time}</p>
            <p className="m-0 mt-0.5 text-sm font-bold leading-snug text-slate-800">{title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const TEACHERS = [
  { name: "Camille Roy", gradient: "from-rose-400 to-pink-500", online: true },
  { name: "Antoine Le", gradient: "from-amber-400 to-orange-500", online: true },
  { name: "Sophie Marc", gradient: "from-violet-400 to-indigo-500", online: false },
  { name: "Lucas Petit", gradient: "from-teal-400 to-emerald-500", online: true },
];

function Teachers() {
  return (
    <section className="mt-8">
      <h2 className="m-0 text-base font-bold text-slate-800">Vos professeurs</h2>
      <div className="mt-5 flex items-start gap-7">
        {TEACHERS.map((t) => (
          <div key={t.name} className="flex w-16 flex-col items-center gap-2.5">
            <Avatar name={t.name} size={58} gradient={t.gradient} online={t.online} />
            <span className="text-center text-xs font-semibold leading-tight text-slate-500">
              {t.name.split(" ")[0]}
            </span>
          </div>
        ))}

        <button
          type="button"
          aria-label="Ajouter un professeur"
          className={`${RESET_BTN} flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white/80 text-slate-400 shadow-[0_6px_18px_rgba(15,23,42,0.06)] backdrop-blur-md transition-colors hover:text-indigo-500`}
        >
          <Plus size={22} strokeWidth={2.4} />
        </button>
      </div>
    </section>
  );
}

const POPULAR = [
  { title: "Vocabulaire A2", meta: "24 leçons", emoji: "🍊", bg: "bg-orange-100/80", ring: "bg-orange-200/70" },
  { title: "Logique et Grammaire", meta: "18 leçons", emoji: "🧊", bg: "bg-sky-100/80", ring: "bg-sky-200/70" },
  { title: "Phonétique fine", meta: "12 leçons", emoji: "🎧", bg: "bg-pink-100/80", ring: "bg-pink-200/70" },
  { title: "Français des affaires", meta: "30 leçons", emoji: "💼", bg: "bg-violet-100/80", ring: "bg-violet-200/70" },
];

function PopularCourses() {
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="m-0 text-base font-bold text-slate-800">Cours populaires</h2>
        <button
          type="button"
          className={`${RESET_BTN} bg-transparent p-0 text-xs font-semibold text-indigo-500 hover:text-indigo-600`}
        >
          Tout voir
        </button>
      </div>

      {/* overflow-x-auto giữ hàng thẻ trong khung của nó — trang không bao giờ
          trượt ngang theo. */}
      <div className="-mx-1 mt-5 flex gap-4 overflow-x-auto px-1 pb-2">
        {POPULAR.map(({ title, meta, emoji, bg, ring }) => (
          <button
            key={title}
            type="button"
            className={`${RESET_BTN} ${bg} w-[190px] shrink-0 rounded-3xl p-5 text-left transition-transform duration-200 hover:-translate-y-1`}
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${ring} text-2xl`}>
              {emoji}
            </span>
            <p className="m-0 mt-4 text-sm font-bold leading-snug text-slate-800">{title}</p>
            <p className="m-0 mt-1 text-xs font-medium text-slate-500">{meta}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────  Cột phải  ───────────────────────────────── */

function TopBar() {
  const [q, setQ] = useState("");

  return (
    <div className="flex items-center gap-2.5">
      <label className={`${CARD} flex min-w-0 flex-1 items-center gap-2.5 rounded-full px-4 py-2.5`}>
        <Search size={17} className="shrink-0 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher…"
          aria-label="Rechercher"
          className="w-full min-w-0 border-0 bg-transparent p-0 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
        />
      </label>

      {[Bell, MessageCircle].map((Icon, i) => (
        <button
          key={i}
          type="button"
          aria-label={i === 0 ? "Notifications" : "Messages"}
          className={`${RESET_BTN} ${CARD} relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-indigo-500`}
        >
          <Icon size={18} />
          {i === 0 && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-rose-400 ring-2 ring-white" />}
        </button>
      ))}
    </div>
  );
}

function PromoCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white shadow-[0_14px_34px_rgba(79,70,229,0.28)]">
      {/* Hai vòng tròn mờ tạo chiều sâu — trang trí thuần tuý, ẩn với trình đọc màn hình. */}
      <span aria-hidden className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15" />
      <span aria-hidden className="absolute -bottom-12 right-6 h-20 w-20 rounded-full bg-white/10" />

      <div className="relative">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
          <GraduationCap size={20} strokeWidth={2.2} />
        </span>
        <p className="m-0 mt-4 text-lg font-extrabold leading-snug">
          Testez votre niveau
          <br />
          de français&nbsp;!
        </p>
        <p className="m-0 mt-1.5 text-xs font-medium text-white/80">15 minutes · résultat immédiat</p>
        <button
          type="button"
          className={`${RESET_BTN} mt-5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-indigo-600 shadow-[0_6px_16px_rgba(15,23,42,0.15)] transition-transform hover:-translate-y-0.5`}
        >
          Passer le test
        </button>
      </div>
    </div>
  );
}

/* Vòng tiến độ vẽ bằng SVG: một cung nền và một cung màu cắt theo
   stroke-dasharray. Xoay -90° để mốc 0% bắt đầu từ đỉnh. */
function ProgressRing({ value, size = 92 }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;

  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(226 232 240)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="rgb(99 102 241)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-slate-800">
        {value}%
      </span>
    </span>
  );
}

function ActiveCourse() {
  return (
    <div className={`${CARD} p-5`}>
      <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cours en cours</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-bold leading-snug text-slate-800">Français pour voyager</p>
          <p className="m-0 mt-1.5 text-xs font-medium text-slate-400">Débuté le 12 mars</p>
          <p className="m-0 mt-3 text-xs font-semibold text-indigo-500">16 / 25 leçons</p>
        </div>
        <ProgressRing value={64} />
      </div>
    </div>
  );
}

const MY_COURSES = [
  { title: "Vocabulaire A2", lessons: 24, labs: 8, emoji: "🍊", bg: "bg-orange-100" },
  { title: "Logique et Grammaire", lessons: 18, labs: 6, emoji: "🧊", bg: "bg-sky-100" },
  { title: "Phonétique fine", lessons: 12, labs: 4, emoji: "🎧", bg: "bg-pink-100" },
  { title: "Expression écrite B1", lessons: 20, labs: 9, emoji: "✏️", bg: "bg-violet-100" },
];

function MyCourses() {
  return (
    <section>
      <div className="flex items-baseline justify-between px-1">
        <h2 className="m-0 text-base font-bold text-slate-800">Mes cours</h2>
        <span className="text-xs font-medium text-slate-400">{MY_COURSES.length}</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {MY_COURSES.map(({ title, lessons, labs, emoji, bg }) => (
          <button
            key={title}
            type="button"
            className={`${RESET_BTN} group flex items-center gap-3 rounded-3xl bg-white/70 px-3.5 py-3 text-left transition-colors hover:bg-white`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${bg} text-lg`}>
              {emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-sm font-bold text-slate-800">{title}</p>
              <p className="m-0 mt-0.5 text-xs font-medium text-slate-400">
                {lessons} leçons · {labs} travaux pratiques
              </p>
            </div>
            <ChevronRight size={17} className="shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" />
          </button>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────  Khung  ────────────────────────────────── */

export default function SoftDashboard() {
  const [active, setActive] = useState("accueil");

  return (
    <div className="flex min-h-screen w-full bg-[#eef2f6] font-sans text-slate-800">
      <Sidebar active={active} onSelect={setActive} />

      <main className="min-w-0 flex-1 px-8 py-7">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-extrabold tracking-tight text-slate-800">Accueil</h1>
            <p className="m-0 mt-1 text-sm font-medium text-slate-400">Bon retour&nbsp;!</p>
          </div>
          <div className="flex gap-3">
            <BalancePill Icon={Wallet} label="Solde" value="$323" tone="bg-emerald-100 text-emerald-600" />
            <BalancePill Icon={BookOpen} label="Dépôt" value="5 leçons" tone="bg-indigo-100 text-indigo-600" />
          </div>
        </header>

        <div className="mt-7 flex gap-5">
          <ActivityChart />
          <UpcomingCards />
        </div>

        <Teachers />
        <PopularCourses />
      </main>

      <aside className="flex w-[320px] shrink-0 flex-col gap-5 px-6 py-7">
        <TopBar />
        <PromoCard />
        <ActiveCourse />
        <MyCourses />
      </aside>
    </div>
  );
}
