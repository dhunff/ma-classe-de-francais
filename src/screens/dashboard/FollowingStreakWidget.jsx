import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Flame, UserPlus, Users, UserMinus, Trophy, Star, Sparkles } from "lucide-react";
import { AvatarOnline, NhanOnline } from "./ChamOnline.jsx";
import { Avatar } from "../../shared/avatars.jsx";
import { docDangTheoDoi, docNguoiTheoDoiToi, boTheoDoi, docBangXepHang, goiYBan } from "../../shared/xp.js";
import TimBan, { DongBan, LY_DO } from "./TimBan.jsx";
import { tr } from "../../shared/i18n.jsx";
import NetworkManager from "./NetworkManager.jsx";

/* « Đang theo dõi » — trang chủ học sinh (26/09).
 *
 * Theo dõi MỘT CHIỀU, như GitHub. Từ 19/10 tìm theo tên + gợi ý (TimBan.jsx), không cần biết trước @username. Danh sách và trạng thái
 * "hôm nay đã học chưa" tính ở máy chủ (get_following_streaks, giờ VN); máy
 * chủ chỉ trả tên, @username, ảnh và một cờ true/false — không email, không
 * điểm của người khác.
 *
 * Thẻ theo kiểu các thẻ trang chủ (bg-surface/80, token màu) nên tự đổi
 * sáng/tối. `fixture` chỉ để preview.jsx bơm dữ liệu. */

export default function FollowingStreakWidget({ t, fixture, bxhFixture }) {
  const [ds, setDs] = useState(undefined);   // undefined = đang tải, null = lỗi
  const [mo, setMo] = useState(false);
  const [moMang, setMoMang] = useState(false);
  /* Link kết bạn (19/10): /etudiant/dashboard?ket_ban=<username> mở sẵn khung tìm
     bạn với username đó, để người nhận chỉ còn bấm « Theo dõi ». */
  const [tuKhoa, setTuKhoa] = useState("");
  useEffect(() => {
    try {
      const u = new URLSearchParams(window.location.search).get("ket_ban");
      if (!u) return;
      setTuKhoa(u); setMo(true);
      const url = new URL(window.location.href); url.searchParams.delete("ket_ban");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    } catch { /* bỏ qua */ }
  }, []);
  /* Gợi ý ngay trên thẻ (19/10): 3 người, để không ai phải biết trước @username. */
  const [goiY, setGoiY] = useState(undefined);
  const [daTD, setDaTD] = useState(() => new Set());
  /* Đến từ thông báo « người theo dõi mới » (16/10): mở sẵn bảng mạng lưới. */
  const viTriTB = useLocation();
  useEffect(() => {
    if (!viTriTB.state?.moMang) return;
    setMoMang("followers");
    try { window.history.replaceState({ ...window.history.state, usr: null }, ""); } catch { /* bỏ qua */ }
  }, [viTriTB.state]);
  /* Tab « Xếp hạng XP » (26/09): mình + người mình theo dõi, hạng tính ở máy chủ. */
  const [tab, setTab] = useState("hom_nay");
  const [bxh, setBxh] = useState(undefined);
  useEffect(() => {
    if (tab !== "xep_hang") return;
    if (bxhFixture !== undefined) { setBxh(bxhFixture); return; }
    setBxh(undefined);
    docBangXepHang().then(setBxh);
  }, [tab, ds, bxhFixture]);

  /* Số người theo dõi mình (16/10): đọc cùng lúc với danh sách đang theo dõi. */
  const [soNguoiTD, setSoNguoiTD] = useState(undefined);
  const nap = () => {
    if (fixture !== undefined) { setDs(fixture); setSoNguoiTD(null); return; }
    docDangTheoDoi().then(setDs);
    docNguoiTheoDoiToi().then((x) => setSoNguoiTD(Array.isArray(x) ? x.length : null));
    goiYBan().then(setGoiY);
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
        <span className="flex-1" />
        {fixture === undefined && (
          <button type="button" onClick={() => setMoMang(true)} title={t("network.title")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-surface2 px-3 py-1.5 font-sans text-xs font-bold text-ink transition-colors hover:bg-primary-soft hover:text-primary">
            <Users size={14} /> {t("network.open")}
          </button>
        )}
        <button type="button" onClick={() => setMo(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary-soft px-3 py-1.5 font-sans text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white">
          <UserPlus size={14} /> {tr("Tìm bạn", "Trouver", "Find")}
        </button>
      </div>

      {/* Hai con số (16/10): bấm vào mở bảng Mạng lưới đúng tab. */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[["followers", tr("Người theo dõi", "Abonnés", "Followers"), soNguoiTD], ["following", tr("Đang theo dõi", "Abonnements", "Following"), Array.isArray(ds) ? ds.length : null]].map(([k, l, so]) => (
          <button key={k} type="button" disabled={fixture !== undefined} onClick={() => setMoMang(k)}
            className="flex cursor-pointer flex-col items-start rounded-2xl border-0 bg-surface2 px-3 py-2 text-left font-sans transition-colors hover:bg-primary-soft disabled:cursor-default">
            <span className="text-xl font-extrabold tabular-nums text-ink">{so == null ? "–" : so}</span>
            <span className="text-xs font-semibold text-soft">{l}</span>
          </button>
        ))}
      </div>

      <div role="tablist" className="mt-3 flex gap-1 rounded-full bg-surface2 p-1">
        {[["hom_nay", t("follow.tab_today"), Flame], ["xep_hang", t("follow.tab_rank"), Trophy]].map(([k, l, Icon]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 px-3 py-1.5 font-sans text-xs font-bold transition-colors ${tab === k ? "bg-surface text-ink shadow-sm" : "bg-transparent text-soft hover:text-ink"}`}>
            <Icon size={13} /> {l}
          </button>
        ))}
      </div>

      {tab === "xep_hang" ? (
        <div className="mt-3">
          {bxh === undefined ? <p className="m-0 text-sm text-soft">{t("loading")}</p>
            : bxh === null ? <p className="m-0 text-sm text-danger">{t("follow.error")}</p>
            : (
              <ol className="no-scrollbar m-0 flex max-h-[22rem] list-none flex-col gap-1 overflow-y-auto p-0">
                {bxh.map((n) => (
                  <li key={n.id} className={`flex items-center gap-3 rounded-2xl px-2 py-2 ${n.la_toi ? "bg-primary-soft" : ""}`}>
                    <span className={`w-6 text-center text-sm font-extrabold tabular-nums ${n.hang === 1 ? "text-amber-500" : "text-soft"}`}>{n.hang}</span>
                    <Avatar khoa={n.avatar || ""} ten={n.name} size={32} dungYen />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                      {n.name}{n.la_toi && <span className="ml-1 text-xs font-bold text-primary">({t("follow.you")})</span>}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums text-amber-600 dark:text-amber-400">
                      <Star size={13} className="fill-amber-500/20 text-amber-500" /> {Number(n.xp).toLocaleString("vi-VN")}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          {Array.isArray(bxh) && bxh.length <= 1 && <p className="m-0 mt-2 text-xs text-soft">{t("follow.rank_hint")}</p>}
        </div>
      ) : (
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
          <ul className="m-0 flex max-h-[22rem] list-none flex-col gap-1 overflow-y-auto p-0 [scrollbar-width:thin]">
            {ds.map((n) => (
              <li key={n.id} className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-surface2">
                <AvatarOnline n={n} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{n.name}</span>
                  <NhanOnline n={n} />
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
      )}

      {fixture === undefined && Array.isArray(goiY) && goiY.length > 0 && (
        <div className="mt-4 border-0 border-t border-solid border-line pt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="m-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-soft"><Sparkles size={13} />{tr("Gợi ý theo dõi", "Suggestions", "Suggested")}</p>
            <button type="button" onClick={() => setMo(true)} className="cursor-pointer border-0 bg-transparent p-0 font-sans text-xs font-bold text-primary hover:underline">{tr("Xem thêm", "Voir plus", "See more")}</button>
          </div>
          <ul className="m-0 mt-1 flex list-none flex-col p-0">
            {goiY.filter((n) => !daTD.has(n.id)).slice(0, 3).map((n) => (
              <DongBan key={n.id} n={n} gon phu={LY_DO(n)} onTheoDoi={(id) => { setDaTD((x) => new Set(x).add(id)); nap(); }} />
            ))}
          </ul>
        </div>
      )}

      {moMang && <NetworkManager t={t} tabDau={typeof moMang === "string" ? moMang : undefined} dong={() => setMoMang(false)} onDoi={nap} />}
      {mo && <TimBan tuKhoaDau={tuKhoa} onDoi={nap} dong={() => { setMo(false); setTuKhoa(""); nap(); }} />}
    </section>
  );
}
