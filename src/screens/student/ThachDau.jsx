import React, { useCallback, useEffect, useState } from "react";
import { Swords, X, Timer, Trophy, Hourglass, Play } from "lucide-react";
import { Avatar } from "../../shared/avatars.jsx";
import { docDangTheoDoi } from "../../shared/xp.js";
import { docCacBo } from "../../shared/boThe.js";
import { dsThachDau, taoThachDau, layDe, nopThachDau } from "../../shared/thachDau.js";
import { useT } from "../../shared/i18n.jsx";

/* Thách đấu bạn bè (30/09) — hai người làm CÙNG một đề 8 câu rút từ một bộ
 * flashcard; ai đúng nhiều hơn thắng, bằng nhau thì ai nhanh hơn thắng.
 *
 * Màn này KHÔNG biết đáp án và KHÔNG tự tính giờ: máy chủ phát đề, bấm giờ từ
 * lúc gọi layDe(), và chấm khi nộp (migration 111). Đồng hồ trên màn hình chỉ
 * để người chơi nhìn — con số tính thắng thua là con số máy chủ trả về.
 *
 * Không đấu theo thời gian thực: mỗi người chơi lúc nào tiện. Điểm của đối
 * thủ bị máy chủ giấu cho tới khi mình nộp.
 */

const phutGiay = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/* "thang" | "thua" | "hoa" | null (chưa đủ hai bên) */
function ketCuc(d) {
  if (!d.toi_xong || !d.ho_xong || d.ho_dung == null) return null;
  if (d.toi_dung !== d.ho_dung) return d.toi_dung > d.ho_dung ? "thang" : "thua";
  if (d.toi_giay !== d.ho_giay) return d.toi_giay < d.ho_giay ? "thang" : "thua";
  return "hoa";
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
  const [tran, setTran] = useState(null);       // { id, doi, cau }

  const tai = useCallback(() => dsThachDau().then(setDs), []);
  useEffect(() => {
    tai();
    docDangTheoDoi().then(setBan);
    docCacBo().then((b) => setBo(b ? b.filter((x) => x.congKhai && x.soThe >= 4) : null));
  }, [tai]);

  const loiChu = (m) => t(`duel.err_${m}`) === `duel.err_${m}` ? t("duel.err_generic", { msg: m }) : t(`duel.err_${m}`);

  const tao = async () => {
    if (!chonBan || !chonBo) { setBaoLoi(t("duel.pick_both")); return; }
    setDangTao(true); setBaoLoi("");
    const r = await taoThachDau(chonBan, chonBo);
    setDangTao(false);
    if (r.loi) { setBaoLoi(loiChu(r.loi)); return; }
    await tai();
  };

  const choi = async (d) => {
    setBaoLoi("");
    const r = await layDe(d.id);
    if (r.loi) { setBaoLoi(loiChu(r.loi)); tai(); return; }
    if (!r.cau.length) { setBaoLoi(loiChu("BO_QUA_IT_THE")); return; }
    setTran({ id: d.id, doi: d.doi_phuong?.name, bo: d.bo, cau: r.cau });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <header className="mb-5">
        <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{t("nav.duel")}</h1>
        <p className="m-0 mt-1 text-sm text-soft">{t("duel.subtitle")}</p>
      </header>

      {/* Tạo thách đấu mới */}
      <section className="mb-6 rounded-2xl border border-solid border-line bg-surface p-4">
        <h2 className="m-0 mb-3 flex items-center gap-2 text-base font-extrabold text-ink">
          <Swords size={18} className="text-primary" />{t("duel.new")}
        </h2>
        {ban === null || bo === null ? (
          <p className="m-0 text-sm text-danger">{t("duel.load_error")}</p>
        ) : Array.isArray(ban) && !ban.length ? (
          <p className="m-0 text-sm text-soft">{t("duel.no_friends")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <select value={chonBan} onChange={(e) => setChonBan(e.target.value)} aria-label={t("duel.pick_friend")}
              className="rounded-xl border border-solid border-line bg-surface2 px-3 py-2.5 font-sans text-sm text-ink">
              <option value="">{t("duel.pick_friend")}</option>
              {(ban || []).map((b) => <option key={b.id} value={b.id}>{b.name}{b.username ? ` (@${b.username})` : ""}</option>)}
            </select>
            <select value={chonBo} onChange={(e) => setChonBo(e.target.value)} aria-label={t("duel.pick_deck")}
              className="rounded-xl border border-solid border-line bg-surface2 px-3 py-2.5 font-sans text-sm text-ink">
              <option value="">{t("duel.pick_deck")}</option>
              {(bo || []).map((b) => <option key={b.id} value={b.id}>{b.ten}</option>)}
            </select>
            <button type="button" onClick={tao} disabled={dangTao}
              className="cursor-pointer rounded-xl border-0 bg-primary px-5 py-2.5 font-sans text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-60">
              {dangTao ? t("duel.sending") : t("duel.send")}
            </button>
          </div>
        )}
        {baoLoi && <p className="m-0 mt-3 text-sm font-semibold text-danger" role="alert">{baoLoi}</p>}
      </section>

      {/* Danh sách */}
      {ds === undefined ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface2" />)}</div>
      ) : ds === null ? (
        <p className="text-sm text-danger">{t("duel.load_error")}</p>
      ) : !ds.length ? (
        <div className="py-10 text-center">
          <Swords size={32} className="mx-auto text-soft" />
          <p className="m-0 mt-3 text-sm text-soft">{t("duel.empty")}</p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {ds.map((d) => <Dong key={d.id} d={d} onChoi={() => choi(d)} t={t} />)}
        </ul>
      )}

      {tran && (
        <ManDau tran={tran} t={t} loiChu={loiChu}
          onDong={() => { setTran(null); tai(); }} />
      )}
    </div>
  );
}

function Dong({ d, onChoi, t }) {
  const kc = ketCuc(d);
  const nhan = kc === "thang" ? ["bg-ok-soft text-ok", t("duel.win")]
    : kc === "thua" ? ["bg-danger-soft text-danger", t("duel.lose")]
      : kc === "hoa" ? ["bg-surface2 text-ink", t("duel.draw")]
        : !d.toi_xong ? ["bg-warn-soft text-ink", t("duel.your_turn")]
          : ["bg-surface2 text-soft", t("duel.waiting")];
  const diem = (dung, giay) => dung == null ? "—" : `${dung}/${d.tong} · ${phutGiay(giay)}`;

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl border border-solid border-line bg-surface p-4">
      <Avatar khoa={d.doi_phuong?.avatar || ""} ten={d.doi_phuong?.name} size={40} dungYen />
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-bold text-ink">
          {d.toi_thach ? t("duel.you_vs", { ten: d.doi_phuong?.name }) : t("duel.vs_you", { ten: d.doi_phuong?.name })}
        </p>
        <p className="m-0 truncate text-xs text-soft">{d.bo}</p>
        {d.toi_xong && (
          <p className="m-0 mt-1 text-xs tabular-nums text-ink">
            {t("duel.me")}: <strong>{diem(d.toi_dung, d.toi_giay)}</strong>
            <span className="mx-2 text-soft">·</span>
            {d.doi_phuong?.name}: <strong>{d.ho_xong ? diem(d.ho_dung, d.ho_giay) : t("duel.not_played")}</strong>
          </p>
        )}
      </div>
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${nhan[0]}`}>
        {kc === "thang" ? <Trophy size={13} /> : !d.toi_xong ? null : !kc ? <Hourglass size={13} /> : null}
        {nhan[1]}
      </span>
      {!d.toi_xong && (
        <button type="button" onClick={onChoi}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-4 py-2 font-sans text-sm font-bold text-on-primary hover:opacity-90">
          <Play size={14} fill="currentColor" />{t("duel.play")}
        </button>
      )}
    </li>
  );
}

/* Màn đấu phủ kín. Không báo đúng/sai từng câu — màn này không có đáp án. */
function ManDau({ tran, onDong, t, loiChu }) {
  const [i, setI] = useState(0);
  const [traLoi, setTraLoi] = useState([]);
  const [giay, setGiay] = useState(0);
  const [kq, setKq] = useState(null);     // null | "dang" | {dung,tong,giay} | {loi}

  useEffect(() => {
    if (kq) return undefined;
    const h = setInterval(() => setGiay((n) => n + 1), 1000);
    return () => clearInterval(h);
  }, [kq]);

  const chon = async (viTri) => {
    const moi = [...traLoi, viTri];
    setTraLoi(moi);
    if (i + 1 < tran.cau.length) { setI(i + 1); return; }
    setKq("dang");
    setKq(await nopThachDau(tran.id, moi));
  };

  const cau = tran.cau[i];
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-bg font-sans" role="dialog" aria-modal="true">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-4 px-4 pt-5">
        <button type="button" onClick={onDong} aria-label={t("path.g_quit")}
          className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-soft hover:bg-surface2 hover:text-ink">
          <X size={22} />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-surface2">
          <div className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((kq ? tran.cau.length : i) / tran.cau.length) * 100}%` }} />
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums text-ink">
          <Timer size={16} className="text-soft" />{phutGiay(kq?.giay ?? giay)}
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto px-4 py-6">
        {kq === "dang" ? (
          <p className="m-auto text-soft">{t("duel.grading")}</p>
        ) : kq?.loi ? (
          <div className="m-auto text-center">
            <p className="m-0 text-sm font-semibold text-danger">{loiChu(kq.loi)}</p>
            <button type="button" onClick={onDong}
              className="mt-4 cursor-pointer rounded-xl border-0 bg-primary px-5 py-2.5 font-sans text-sm font-bold text-on-primary">{t("duel.back")}</button>
          </div>
        ) : kq ? (
          <div className="m-auto flex max-w-sm flex-col items-center gap-4 text-center">
            <Swords size={48} className="text-primary" />
            <h2 className="m-0 text-2xl font-extrabold text-ink">{kq.dung}/{kq.tong}</h2>
            <p className="m-0 text-sm text-soft">{t("duel.done_body", { giay: phutGiay(kq.giay), ten: tran.doi })}</p>
            <button type="button" onClick={onDong}
              className="cursor-pointer rounded-2xl border-0 bg-primary px-8 py-3 font-sans text-sm font-extrabold uppercase tracking-wide text-on-primary">{t("duel.back")}</button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-wider text-soft">{t("duel.vs", { ten: tran.doi })} · {i + 1}/{tran.cau.length}</p>
              <h2 className="m-0 mt-1 text-lg font-extrabold text-ink">
                {cau.chieu === "nghia" ? t("path.g_meaning") : t("path.g_french")}
              </h2>
            </div>
            <div className="rounded-2xl border-2 border-solid border-line bg-surface px-5 py-8 text-center">
              <p className="m-0 text-2xl font-bold text-ink" lang={cau.chieu === "nghia" ? "fr" : "vi"}>{cau.de}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {cau.luaChon.map((p, k) => (
                <button key={`${i}-${k}`} type="button" onClick={() => chon(k)}
                  lang={cau.chieu === "nghia" ? "vi" : "fr"}
                  className="cursor-pointer rounded-2xl border-2 border-b-4 border-solid border-line bg-surface px-4 py-4 text-left font-sans text-base font-semibold text-ink transition hover:bg-surface2 active:translate-y-0.5">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
