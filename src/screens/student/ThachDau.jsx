import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Swords, X, Timer, Trophy, Hourglass, Play, Volume2, VolumeX, Send, Layers, Users, Check } from "lucide-react";
import { phat, amThanhBat, datAmThanh } from "../../shared/amThanh.js";
import { Avatar } from "../../shared/avatars.jsx";
import { docDangTheoDoi } from "../../shared/xp.js";
import { docCacBo } from "../../shared/boThe.js";
import { dsThachDau, taoThachDau, layDe, nopThachDau } from "../../shared/thachDau.js";
import { useT, tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";

/* Thách đấu bạn bè (30/09) — hai người làm CÙNG một đề 8 câu rút từ một bộ
 * flashcard; ai đúng nhiều hơn thắng, bằng nhau thì ai nhanh hơn thắng.
 *
 * Màn này KHÔNG biết đáp án và KHÔNG tự tính giờ: máy chủ phát đề, bấm giờ từ
 * lúc gọi layDe(), và chấm khi nộp (migration 111). Đồng hồ trên màn hình chỉ
 * để người chơi nhìn — con số tính thắng thua là con số máy chủ trả về.
 *
 * Làm lại 09/10: đấu trường có Leon, chọn bạn bằng ảnh đại diện, đếm ngược
 * 3-2-1 trước trận (gọi layDe() SAU khi đếm xong, để 3 giây đếm ngược không
 * bị máy chủ tính vào giờ làm bài), phím 1–4, màn kết quả có pháo giấy, âm
 * thanh dùng chung shared/amThanh.js.
 */

const phutGiay = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/* "thang" | "thua" | "hoa" | null (chưa đủ hai bên) */
function ketCuc(d) {
  if (!d.toi_xong || !d.ho_xong || d.ho_dung == null) return null;
  if (d.toi_dung !== d.ho_dung) return d.toi_dung > d.ho_dung ? "thang" : "thua";
  if (d.toi_giay !== d.ho_giay) return d.toi_giay < d.ho_giay ? "thang" : "thua";
  return "hoa";
}

function NutTieng() {
  const [tieng, setTieng] = useState(amThanhBat);
  return (
    <button type="button" onClick={() => { const m = !tieng; datAmThanh(m); setTieng(m); if (m) phat("bam"); }}
      aria-label={tieng ? tr("Tắt âm thanh", "Couper le son", "Mute") : tr("Bật âm thanh", "Activer le son", "Unmute")}
      title={tieng ? tr("Tắt âm thanh", "Couper le son", "Mute") : tr("Bật âm thanh", "Activer le son", "Unmute")}
      className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-current transition-colors hover:bg-white/25">
      {tieng ? <Volume2 size={19} /> : <VolumeX size={19} />}
    </button>
  );
}

export default function ThachDau() {
  const t = useT();
  const [ds, setDs] = useState(undefined);      // undefined = đang tải, null = lỗi
  const [ban, setBan] = useState(undefined);
  const [bo, setBo] = useState(undefined);
  const [chonBan, setChonBan] = useState("");
  const [chonBo, setChonBo] = useState("");
  const [baoLoi, setBaoLoi] = useState("");
  const [dangTao, setDangTao] = useState(false);
  const [vuaGui, setVuaGui] = useState(false);
  const [tran, setTran] = useState(null);       // { id, doi, bo }

  const tai = useCallback(() => dsThachDau().then(setDs), []);
  useEffect(() => {
    tai();
    docDangTheoDoi().then(setBan);
    docCacBo().then((b) => setBo(b ? b.filter((x) => x.congKhai && x.soThe >= 4) : null));
  }, [tai]);

  const loiChu = (m) => t(`duel.err_${m}`) === `duel.err_${m}` ? t("duel.err_generic", { msg: m }) : t(`duel.err_${m}`);

  /* Thành tích tính từ danh sách thật (quy tắc 1). */
  const thanhTich = useMemo(() => {
    const kq = { thang: 0, thua: 0, hoa: 0, cho: 0 };
    for (const d of ds || []) { const k = ketCuc(d); if (k) kq[k]++; else if (!d.toi_xong) kq.cho++; }
    return kq;
  }, [ds]);

  const tao = async () => {
    if (!chonBan || !chonBo) { phat("sai"); setBaoLoi(t("duel.pick_both")); return; }
    setDangTao(true); setBaoLoi("");
    const r = await taoThachDau(chonBan, chonBo);
    setDangTao(false);
    if (r.loi) { phat("sai"); setBaoLoi(loiChu(r.loi)); return; }
    phat("combo"); setVuaGui(true); setTimeout(() => setVuaGui(false), 2400);
    setChonBan(""); setChonBo("");
    await tai();
  };

  const choi = (d) => { setBaoLoi(""); phat("bam"); setTran({ id: d.id, doi: d.doi_phuong?.name, avatar: d.doi_phuong?.avatar, bo: d.bo }); };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      {/* ── Đấu trường ── */}
      <header className="mcf-cau-vao relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-[0_20px_50px_rgba(99,102,241,0.35)]">
        <span aria-hidden className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
        <span aria-hidden className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-300/20 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <Leon cam="gian" size={110} className="mcf-leon-bay shrink-0 drop-shadow-[0_12px_18px_rgba(0,0,0,0.3)] max-sm:h-20 max-sm:w-20" />
          <div className="min-w-0 flex-1">
            <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-white/80"><Swords size={14} /> {tr("Đấu trường", "L'arène", "The arena")}</p>
            <h1 className="m-0 mt-1 text-3xl font-extrabold tracking-tight">{t("nav.duel")}</h1>
            <p className="m-0 mt-1 text-sm text-white/85">{t("duel.subtitle")}</p>
          </div>
          <NutTieng />
        </div>
        <div className="relative mt-5 grid grid-cols-4 gap-2">
          {[["thang", tr("Thắng", "Victoires", "Wins"), "🏆"], ["thua", tr("Thua", "Défaites", "Losses"), "💥"], ["hoa", tr("Hoà", "Nuls", "Draws"), "🤝"], ["cho", tr("Đến lượt", "À jouer", "Your turn"), "⚡"]].map(([k, nhan, bieu], i) => (
            <div key={k} className="mcf-cau-vao rounded-2xl bg-white/15 px-3 py-2.5 text-center backdrop-blur" style={{ animationDelay: `${120 + i * 70}ms` }}>
              <p className="m-0 text-xl font-extrabold tabular-nums">{ds ? thanhTich[k] : "–"}</p>
              <p className="m-0 text-[11px] font-bold text-white/80">{bieu} {nhan}</p>
            </div>
          ))}
        </div>
      </header>

      {/* ── Tạo thách đấu mới ── */}
      <section className="mcf-cau-vao mb-6 rounded-3xl border border-solid border-line bg-surface p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]" style={{ animationDelay: "120ms" }}>
        <h2 className="m-0 mb-4 flex items-center gap-2 text-base font-extrabold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary"><Swords size={17} /></span>{t("duel.new")}
        </h2>
        {ban === null || bo === null ? (
          <p className="m-0 text-sm text-danger">{t("duel.load_error")}</p>
        ) : Array.isArray(ban) && !ban.length ? (
          <div className="flex items-center gap-3 rounded-2xl bg-surface2 p-4">
            <Leon cam="hum" size={64} />
            <p className="m-0 text-sm text-soft">{t("duel.no_friends")}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div>
              <p className="m-0 mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-soft"><Users size={13} /> {t("duel.pick_friend")}</p>
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {(ban || []).map((b) => {
                  const dang = chonBan === b.id;
                  return (
                    <button key={b.id} type="button" onClick={() => { phat("bam"); setChonBan(b.id); }} aria-pressed={dang}
                      className={`relative flex w-24 shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-solid px-2 py-3 font-sans transition-all duration-200 ${dang ? "-translate-y-1 border-primary bg-primary-soft shadow-[0_10px_24px_rgba(37,99,235,0.2)]" : "border-line bg-surface hover:-translate-y-0.5 hover:border-primary/40"}`}>
                      {dang && <span className="mcf-nay absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-white"><Check size={12} strokeWidth={3} /></span>}
                      <Avatar khoa={b.avatar || ""} ten={b.name} size={44} dungYen />
                      <span className="w-full truncate text-center text-xs font-bold text-ink">{b.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="m-0 mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-soft"><Layers size={13} /> {t("duel.pick_deck")}</p>
              <div className="flex flex-wrap gap-2">
                {(bo || []).map((b) => {
                  const dang = chonBo === b.id;
                  return (
                    <button key={b.id} type="button" onClick={() => { phat("bam"); setChonBo(b.id); }} aria-pressed={dang}
                      className={`cursor-pointer rounded-full border-2 border-solid px-4 py-2 font-sans text-sm font-bold transition-all duration-200 ${dang ? "border-primary bg-primary text-on-primary shadow-[0_8px_18px_rgba(37,99,235,0.25)]" : "border-line bg-surface text-ink hover:border-primary/40"}`}>
                      {b.ten}
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="button" onClick={tao} disabled={dangTao}
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 border-b-4 border-solid px-6 py-3.5 font-sans text-sm font-extrabold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0 disabled:opacity-60 ${vuaGui ? "mcf-nay border-green-700 bg-ok" : "border-indigo-800 bg-gradient-to-r from-indigo-600 to-violet-600"}`}>
              {vuaGui ? <><Check size={17} strokeWidth={3} />{tr("Đã gửi lời thách đấu!", "Défi envoyé !", "Challenge sent!")}</>
                : <><Send size={16} />{dangTao ? t("duel.sending") : t("duel.send")}</>}
            </button>
          </div>
        )}
        {baoLoi && <p className="mcf-rung m-0 mt-3 text-sm font-semibold text-danger" role="alert">{baoLoi}</p>}
      </section>

      {/* ── Danh sách trận ── */}
      {ds === undefined ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-3xl bg-surface2" />)}</div>
      ) : ds === null ? (
        <p className="text-sm text-danger">{t("duel.load_error")}</p>
      ) : !ds.length ? (
        <div className="flex flex-col items-center py-10 text-center">
          <Leon cam="buon-ngu" size={110} />
          <p className="m-0 mt-3 text-sm text-soft">{t("duel.empty")}</p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {ds.map((d, i) => <Dong key={d.id} d={d} i={i} onChoi={() => choi(d)} t={t} />)}
        </ul>
      )}

      {tran && (
        <ManDau tran={tran} t={t} loiChu={loiChu}
          onDong={() => { setTran(null); tai(); }} />
      )}
    </div>
  );
}

function Dong({ d, i, onChoi, t }) {
  const kc = ketCuc(d);
  const den = !d.toi_xong;
  const nhan = kc === "thang" ? ["bg-ok text-white", t("duel.win"), "tuyet-voi"]
    : kc === "thua" ? ["bg-danger text-white", t("duel.lose"), "buon"]
      : kc === "hoa" ? ["bg-surface2 text-ink", t("duel.draw"), "ok"]
        : den ? ["bg-warn text-white", t("duel.your_turn"), "gian"]
          : ["bg-surface2 text-soft", t("duel.waiting"), "buon-ngu"];
  const diem = (dung, giay) => dung == null ? "—" : `${dung}/${d.tong} · ${phutGiay(giay)}`;

  return (
    <li className={`mcf-cau-vao relative flex flex-wrap items-center gap-4 overflow-hidden rounded-3xl border-2 border-solid bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] ${den ? "border-warn/50 shadow-[0_0_0_4px_rgba(245,158,11,0.12)]" : "border-line"}`}
      style={{ animationDelay: `${180 + i * 60}ms` }}>
      <div className="flex items-center">
        <span className="rounded-full ring-4 ring-surface"><Avatar khoa={d.doi_phuong?.avatar || ""} ten={d.doi_phuong?.name} size={46} dungYen /></span>
        <span className="-ml-2 grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-[10px] font-extrabold text-white ring-4 ring-surface">VS</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-extrabold text-ink">
          {d.toi_thach ? t("duel.you_vs", { ten: d.doi_phuong?.name }) : t("duel.vs_you", { ten: d.doi_phuong?.name })}
        </p>
        <p className="m-0 mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-xs text-soft"><Layers size={12} />{d.bo}</p>
        {d.toi_xong && (
          <p className="m-0 mt-1.5 text-xs tabular-nums text-ink">
            {t("duel.me")}: <strong>{diem(d.toi_dung, d.toi_giay)}</strong>
            <span className="mx-2 text-soft">·</span>
            {d.doi_phuong?.name}: <strong>{d.ho_xong ? diem(d.ho_dung, d.ho_giay) : t("duel.not_played")}</strong>
          </p>
        )}
      </div>
      <Leon cam={nhan[2]} size={52} className="shrink-0 max-sm:hidden" />
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${nhan[0]}`}>
        {kc === "thang" ? <Trophy size={13} /> : d.toi_xong && !kc ? <Hourglass size={13} /> : null}
        {nhan[1]}
      </span>
      {den && (
        <button type="button" onClick={onChoi}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border-0 border-b-4 border-solid border-indigo-800 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 font-sans text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0">
          <Play size={14} fill="currentColor" />{t("duel.play")}
        </button>
      )}
    </li>
  );
}

/* Pháo giấy (giống màn Lộ trình). */
function PhaoGiay({ n = 22 }) {
  const mau = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#a855f7", "#06b6d4"];
  const manh = useMemo(() => Array.from({ length: n }, (_, k) => {
    const goc = (k / n) * Math.PI * 2 + Math.random() * 0.4;
    const xa = 80 + Math.random() * 90;
    return { k, c: mau[k % mau.length], dx: `${Math.cos(goc) * xa}px`, dy: `${Math.sin(goc) * xa - 30}px`, r: `${Math.random() * 540 - 270}deg` };
  }), [n]);
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      {manh.map((m) => <span key={m.k} className="mcf-phao absolute h-2.5 w-2.5 rounded-[2px]" style={{ background: m.c, "--dx": m.dx, "--dy": m.dy, "--r": m.r }} />)}
    </span>
  );
}

/* Màn đấu phủ kín. Không báo đúng/sai từng câu — màn này không có đáp án. */
function ManDau({ tran, onDong, t, loiChu }) {
  const [dem, setDem] = useState(3);           // 3,2,1,0(GO),-1 = đang chơi
  const [cauDe, setCauDe] = useState(null);    // null = chưa lấy · [] · {loi}
  const [i, setI] = useState(0);
  const [traLoi, setTraLoi] = useState([]);
  const [giay, setGiay] = useState(0);
  const [kq, setKq] = useState(null);          // null | "dang" | {dung,tong,giay} | {loi}
  const [vuaChon, setVuaChon] = useState(null);

  /* Đếm ngược rồi mới lấy đề: máy chủ bấm giờ từ layDe(). */
  useEffect(() => {
    phat("batDau");
    const h = [setTimeout(() => setDem(2), 350), setTimeout(() => setDem(1), 700), setTimeout(() => setDem(0), 1050),
      setTimeout(async () => {
        const r = await layDe(tran.id);
        if (r.loi) setCauDe({ loi: r.loi });
        else if (!r.cau.length) setCauDe({ loi: "BO_QUA_IT_THE" });
        else setCauDe(r.cau);
        setDem(-1);
      }, 1500)];
    return () => h.forEach(clearTimeout);
  }, [tran.id]);

  const dangChoi = dem < 0 && Array.isArray(cauDe) && !kq;
  useEffect(() => {
    if (!dangChoi) return undefined;
    const h = setInterval(() => setGiay((n) => n + 1), 1000);
    return () => clearInterval(h);
  }, [dangChoi]);

  useEffect(() => {
    if (!kq || kq === "dang") return;
    if (kq.loi) { phat("sai"); return; }
    phat(kq.tong && kq.dung / kq.tong >= 0.7 ? "thang" : "nop");
  }, [kq]);

  const chon = async (viTri) => {
    if (vuaChon !== null || !Array.isArray(cauDe)) return;
    phat("bam");
    setVuaChon(viTri);
    const moi = [...traLoi, viTri];
    await new Promise((r) => setTimeout(r, 220));   // để thấy ô vừa bấm sáng lên
    setTraLoi(moi); setVuaChon(null);
    if (i + 1 < cauDe.length) { phat("tiep"); setI(i + 1); return; }
    setKq("dang");
    setKq(await nopThachDau(tran.id, moi));
  };

  const refPhim = useRef(chon);
  refPhim.current = chon;
  useEffect(() => {
    const k = (e) => {
      if (e.key === "Escape") { onDong(); return; }
      if (/^[1-4]$/.test(e.key)) refPhim.current(Number(e.key) - 1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onDong]);

  const tong = Array.isArray(cauDe) ? cauDe.length : 8;
  const cau = Array.isArray(cauDe) ? cauDe[i] : null;
  const tiLe = ((kq ? tong : i) / tong) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-bg font-sans" role="dialog" aria-modal="true">
      {/* Thanh trên: đấu trường thu nhỏ */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <button type="button" onClick={onDong} aria-label={t("path.g_quit")}
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white hover:bg-white/25">
            <X size={20} />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Leon cam="dau" size={34} />
            <span className="text-xs font-extrabold">VS</span>
            <Avatar khoa={tran.avatar || ""} ten={tran.doi} size={30} dungYen />
            <span className="min-w-0 truncate text-sm font-bold">{tran.doi}</span>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm font-extrabold tabular-nums ${dangChoi ? "" : "opacity-70"}`}>
            <Timer size={15} />{phutGiay(kq?.giay ?? giay)}
          </span>
          <NutTieng />
        </div>
        <div className="h-1.5 bg-white/20">
          <div className="h-full bg-white transition-[width] duration-500 ease-out" style={{ width: `${tiLe}%` }} />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 py-6">
        {dem >= 0 ? (
          /* Đếm ngược */
          <div className="m-auto flex flex-col items-center gap-4 text-center">
            <Leon cam="gian" size={120} className="mcf-leon-bay" />
            <p key={dem} className="mcf-sao-no m-0 bg-gradient-to-br from-indigo-600 to-fuchsia-600 bg-clip-text text-8xl font-extrabold text-transparent">
              {dem > 0 ? dem : "GO!"}
            </p>
            <p className="m-0 text-sm font-bold text-soft">{tr(`Đối đầu ${tran.doi ?? ""}`, `Contre ${tran.doi ?? ""}`, `Against ${tran.doi ?? ""}`)} · {tran.bo}</p>
          </div>
        ) : cauDe?.loi ? (
          <div className="m-auto flex flex-col items-center text-center">
            <Leon cam="xin-loi" size={110} />
            <p className="m-0 mt-3 text-sm font-semibold text-danger">{loiChu(cauDe.loi)}</p>
            <button type="button" onClick={onDong}
              className="mt-4 cursor-pointer rounded-xl border-0 bg-primary px-5 py-2.5 font-sans text-sm font-bold text-on-primary">{t("duel.back")}</button>
          </div>
        ) : kq === "dang" ? (
          <div className="m-auto flex flex-col items-center gap-3 text-center">
            <Leon cam="suy-nghi" size={110} className="mcf-leon-bay" />
            <p className="m-0 text-soft">{t("duel.grading")}</p>
          </div>
        ) : kq?.loi ? (
          <div className="m-auto flex flex-col items-center text-center">
            <Leon cam="xin-loi" size={110} />
            <p className="m-0 mt-3 text-sm font-semibold text-danger">{loiChu(kq.loi)}</p>
            <button type="button" onClick={onDong}
              className="mt-4 cursor-pointer rounded-xl border-0 bg-primary px-5 py-2.5 font-sans text-sm font-bold text-on-primary">{t("duel.back")}</button>
          </div>
        ) : kq ? (
          <KetQuaDau kq={kq} tran={tran} onDong={onDong} t={t} />
        ) : cau ? (
          <div key={i} className="mcf-cau-vao flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-soft">{t("duel.vs", { ten: tran.doi })} · {i + 1}/{tong}</span>
              <span className="flex gap-1">
                {Array.from({ length: tong }, (_, k) => (
                  <span key={k} className={`h-2 w-2 rounded-full transition-colors ${k < i ? "bg-violet-500" : k === i ? "bg-violet-500 ring-4 ring-violet-500/20" : "bg-line"}`} />
                ))}
              </span>
            </div>
            <div className="flex items-end gap-3 sm:gap-5">
              <Leon cam="lam-viec" size={104} className="shrink-0 max-sm:h-20 max-sm:w-20" />
              <div className="mb-4 min-w-0 flex-1 rounded-3xl rounded-bl-md border-2 border-solid border-violet-200 bg-surface px-6 py-5 shadow-[0_10px_30px_rgba(124,58,237,0.08)] dark:border-violet-500/30">
                <p className="m-0 text-sm font-bold text-soft">{cau.chieu === "nghia" ? t("path.g_meaning") : t("path.g_french")}</p>
                <p className="m-0 mt-1 text-3xl font-extrabold tracking-tight text-ink" lang={cau.chieu === "nghia" ? "fr" : "vi"}>{cau.de}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {cau.luaChon.map((p, k) => (
                <button key={`${i}-${k}`} type="button" onClick={() => chon(k)} disabled={vuaChon !== null}
                  lang={cau.chieu === "nghia" ? "vi" : "fr"}
                  className={`flex items-center gap-3 rounded-2xl border-2 border-b-4 border-solid px-4 py-4 text-left font-sans text-base font-semibold transition-all duration-200 active:translate-y-0.5 active:border-b-2 ${
                    vuaChon === k ? "mcf-nay border-violet-500 bg-violet-50 text-ink dark:bg-violet-500/15" : vuaChon !== null ? "border-line bg-surface text-soft opacity-60" : "cursor-pointer border-line bg-surface text-ink hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-[0_8px_20px_rgba(124,58,237,0.15)]"}`}>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-solid text-xs font-extrabold ${vuaChon === k ? "border-violet-500 bg-violet-500 text-white" : "border-line text-soft"}`}>{k + 1}</span>
                  <span className="min-w-0 flex-1">{p}</span>
                </button>
              ))}
            </div>
            <p className="m-0 hidden text-center text-xs text-soft sm:block">
              {tr("Bấm phím 1–4 để chọn nhanh. Nhanh mà chắc nhé!", "Touches 1 à 4 pour répondre vite. Rapide mais sûr !", "Press 1–4 to answer fast. Quick but careful!")}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function KetQuaDau({ kq, tran, onDong, t }) {
  const tot = kq.tong && kq.dung / kq.tong >= 0.7;
  const [so, setSo] = useState(0);
  useEffect(() => {
    if (!kq.dung) return undefined;
    let n = 0;
    const h = setInterval(() => { n++; setSo(n); if (n >= kq.dung) clearInterval(h); }, 110);
    return () => clearInterval(h);
  }, [kq.dung]);
  return (
    <div className="mcf-cau-vao m-auto flex w-full max-w-sm flex-col items-center gap-4 text-center">
      <div className="relative">
        <Leon cam={tot ? "yeah" : "co-len"} size={150} className="mcf-nay drop-shadow-[0_14px_20px_rgba(0,0,0,0.15)]" />
        {tot && <PhaoGiay />}
      </div>
      <p className="m-0 bg-gradient-to-br from-indigo-600 to-fuchsia-600 bg-clip-text text-6xl font-extrabold tabular-nums text-transparent">
        {so}<span className="text-3xl">/{kq.tong}</span>
      </p>
      <p className="m-0 inline-flex items-center gap-1.5 rounded-full bg-surface2 px-3 py-1 text-sm font-bold text-ink"><Timer size={14} />{phutGiay(kq.giay)}</p>
      <p className="m-0 text-sm text-soft">{t("duel.done_body", { giay: phutGiay(kq.giay), ten: tran.doi })}</p>
      <button type="button" onClick={onDong}
        className="w-full cursor-pointer rounded-2xl border-0 border-b-4 border-solid border-indigo-800 bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 font-sans text-sm font-extrabold uppercase tracking-wide text-white transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0">{t("duel.back")}</button>
    </div>
  );
}
