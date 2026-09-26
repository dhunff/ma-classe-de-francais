import React, { useEffect, useRef, useState } from "react";
import { Flame, UserPlus, X, Loader2, Users, UserMinus } from "lucide-react";
import { Avatar } from "../../shared/avatars.jsx";
import { docDangTheoDoi, theoDoi, boTheoDoi } from "../../shared/xp.js";

/* « Đang theo dõi » — trang chủ học sinh (26/09).
 *
 * Theo dõi MỘT CHIỀU bằng @username, như GitHub. Danh sách và trạng thái
 * "hôm nay đã học chưa" tính ở máy chủ (get_following_streaks, giờ VN); máy
 * chủ chỉ trả tên, @username, ảnh và một cờ true/false — không email, không
 * điểm của người khác.
 *
 * Thẻ theo kiểu các thẻ trang chủ (bg-surface/80, token màu) nên tự đổi
 * sáng/tối. `fixture` chỉ để preview.jsx bơm dữ liệu. */

export default function FollowingStreakWidget({ t, fixture }) {
  const [ds, setDs] = useState(undefined);   // undefined = đang tải, null = lỗi
  const [mo, setMo] = useState(false);

  const nap = () => {
    if (fixture !== undefined) { setDs(fixture); return; }
    docDangTheoDoi().then(setDs);
  };
  useEffect(nap, [fixture]); // eslint-disable-line react-hooks/exhaustive-deps

  const bo = async (id) => {
    setDs((x) => (Array.isArray(x) ? x.filter((n) => n.id !== id) : x));
    if (!(await boTheoDoi(id))) nap();
  };

  return (
    <section className="w-full rounded-3xl bg-surface/80 p-5 font-sans shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-colors duration-300">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-soft">{t("follow.title")}</p>
        <button type="button" onClick={() => setMo(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary-soft px-3 py-1.5 font-sans text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white">
          <UserPlus size={14} /> {t("follow.follow")}
        </button>
      </div>

      <div className="mt-4">
        {ds === undefined ? (
          <p className="m-0 text-sm text-soft">{t("loading")}</p>
        ) : ds === null ? (
          <p className="m-0 text-sm text-danger">{t("follow.error")}</p>
        ) : ds.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-3 text-center">
            <Users size={28} strokeWidth={1.5} className="text-soft" />
            <p className="m-0 text-sm text-soft">{t("follow.empty")}</p>
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {ds.map((n) => (
              <li key={n.id} className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-surface2">
                <Avatar khoa={n.avatar || ""} ten={n.name} size={36} dungYen />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{n.name}</span>
                  {n.username && <span className="block truncate text-xs text-soft">@{n.username}</span>}
                </span>
                <span className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold ${n.has_studied_today ? "text-orange-500" : "text-soft"}`}>
                  <Flame size={18}
                    className={n.has_studied_today
                      ? "fill-orange-500 text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]"
                      : "text-gray-300 dark:text-gray-600"} />
                  {n.has_studied_today ? t("follow.studied") : t("follow.not_yet")}
                </span>
                <button type="button" onClick={() => bo(n.id)} aria-label={t("follow.unfollow")} title={t("follow.unfollow")}
                  className="hidden h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-soft transition-colors hover:text-danger group-hover:grid">
                  <UserMinus size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {mo && <HopTheoDoi t={t} dong={() => setMo(false)} xong={() => { setMo(false); nap(); }} />}
    </section>
  );
}

function HopTheoDoi({ t, dong, xong }) {
  const [ten, setTen] = useState("");
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState("");
  const o = useRef(null);
  useEffect(() => {
    o.current?.focus();
    const esc = (e) => { if (e.key === "Escape") dong(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [dong]);

  const gui = async (e) => {
    e.preventDefault();
    if (!ten.trim()) return;
    setDang(true); setLoi("");
    const kq = await theoDoi(ten.trim());
    setDang(false);
    if (kq.ok) xong();
    else setLoi(t(`follow.err_${kq.loi}`) || t("follow.error"));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) dong(); }}>
      <form onSubmit={gui} role="dialog" aria-modal="true"
        className="w-full max-w-sm rounded-3xl border border-solid border-line bg-surface p-6 font-sans shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="m-0 text-lg font-bold text-ink">{t("follow.modal_title")}</h3>
          <button type="button" onClick={dong} aria-label={t("identity.close")}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <p className="m-0 mt-1 text-sm text-soft">{t("follow.modal_help")}</p>
        <label className="mt-4 flex items-center rounded-xl border border-solid border-line bg-bg px-3 focus-within:border-primary">
          <span className="text-sm font-bold text-soft">@</span>
          <input ref={o} value={ten} onChange={(e) => setTen(e.target.value)} placeholder="vidu_2026" autoCapitalize="none"
            className="w-full border-0 bg-transparent px-1.5 py-2.5 font-sans text-sm text-ink outline-none" />
        </label>
        {loi && <p className="m-0 mt-2 text-sm text-danger">{loi}</p>}
        <button type="submit" disabled={dang || !ten.trim()}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-4 py-2.5 font-sans text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
          {dang ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} {t("follow.follow")}
        </button>
      </form>
    </div>
  );
}
