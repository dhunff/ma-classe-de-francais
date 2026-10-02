import React, { useEffect, useMemo, useState } from "react";
import { Map as MapIcon, ArrowUp, ArrowDown, Eye, EyeOff, Save, Loader2, Users, Star, Crown, Headphones, BookOpen, PenLine, Mic } from "lucide-react";
import { docCacBo } from "../../shared/boThe.js";
import { KY_NANG } from "../../shared/kyNang.js";
import { docCauHinh, luuCauHinh, docTienDo } from "../../shared/loTrinhStore.js";
import { Avatar } from "../../shared/avatars.jsx";
import { useT } from "../../shared/i18n.jsx";

/* Lộ trình học tập — màn GIÁO VIÊN (02/10), /professeur/lo-trinh.
 *
 * Hai tab:
 *   Cấu trúc — với mỗi chương (kỹ năng), bật/tắt từng màn (= bộ flashcard công
 *              khai), đổi thứ tự, đặt số câu mỗi màn (4–15). Ghi vào
 *              lo_trinh_cau_hinh (113); học sinh đọc bảng đó khi dựng lộ trình.
 *   Tiến độ  — mỗi học sinh: tổng sao, số màn đã qua, số thử thách đã hạ,
 *              lần chơi gần nhất (RPC lo_trinh_tien_do, chỉ giáo viên).
 *
 * Chưa chỉnh gì thì bảng cấu hình rỗng và học sinh thấy lộ trình mặc định —
 * nên màn này HIỆN đúng trạng thái mặc định đó, không phải một danh sách trống.
 *
 * Lưu một lượt bằng nút « Lưu thay đổi », không ghi sau mỗi cú bấm: đổi thứ tự
 * năm màn là năm lần ghi, và nếu lần thứ ba hỏng thì lộ trình nằm ở một thứ tự
 * nửa vời mà không ai chọn. Máy chủ trả biên nhận số dòng đã ghi. */

const ICON = { CO: Headphones, CE: BookOpen, PE: PenLine, PO: Mic };

export default function LoTrinhGiaoVien() {
  const t = useT();
  const [tab, setTab] = useState("cau_truc");
  const [ds, setDs] = useState(null);         // null = đang tải, false = lỗi
  const [ban, setBan] = useState(null);       // bản đang sửa: [{boId, ten, kyNang, soThe, bat, ord, soCau}]
  const [goc, setGoc] = useState("");
  const [luu, setLuu] = useState(null);       // null | "dang" | {soDong} | {loi}
  const [tienDo, setTienDo] = useState(undefined);

  useEffect(() => {
    Promise.all([docCacBo(), docCauHinh()]).then(([b, ch]) => {
      if (b === null) { setDs(false); return; }
      const hop = b.filter((x) => x.congKhai && x.soThe >= 4).map((x) => {
        const c = ch.get(x.id);
        return { boId: x.id, ten: x.ten, kyNang: x.kyNang, soThe: x.soThe,
          bat: c?.bat ?? true, ord: c?.ord ?? 1000 + (x.ord ?? 0), soCau: c?.soCau ?? 8 };
      }).sort((a, z) => a.ord - z.ord);
      setDs(hop); setBan(hop); setGoc(JSON.stringify(hop));
    });
  }, []);

  useEffect(() => {
    if (tab === "tien_do" && tienDo === undefined) docTienDo().then(setTienDo);
  }, [tab, tienDo]);

  const daDoi = ban && JSON.stringify(ban) !== goc;
  const sua = (boId, patch) => { setLuu(null); setBan((b) => b.map((x) => (x.boId === boId ? { ...x, ...patch } : x))); };

  const doi = (ma, i, huong) => {
    setLuu(null);
    setBan((b) => {
      const trong = b.filter((x) => x.kyNang === ma);
      const j = i + huong;
      if (j < 0 || j >= trong.length) return b;
      [trong[i], trong[j]] = [trong[j], trong[i]];
      const ngoai = b.filter((x) => x.kyNang !== ma);
      return [...ngoai, ...trong];
    });
  };

  const luuLai = async () => {
    setLuu("dang");
    /* Thứ tự ghi = vị trí trong chương × 10, để chèn thêm sau này không phải
       đánh số lại cả bảng. */
    const rows = KY_NANG.flatMap(({ ma }) => ban.filter((x) => x.kyNang === ma)
      .map((x, i) => ({ boId: x.boId, bat: x.bat, ord: (i + 1) * 10, soCau: x.soCau })));
    const r = await luuCauHinh(rows);
    if (r.loi || r.soDong !== rows.length) { setLuu({ loi: r.loi || t("tpath.err_receipt", { a: r.soDong, b: rows.length }) }); return; }
    const moi = ban.map((x) => ({ ...x, ord: rows.find((y) => y.boId === x.boId).ord }));
    setBan(moi); setGoc(JSON.stringify(moi)); setLuu(r);
  };

  const tongMan = useMemo(() => (ban || []).filter((x) => x.bat).length, [ban]);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 font-sans">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink">
            <MapIcon size={24} className="text-primary" />{t("nav.path")}
          </h1>
          <p className="m-0 mt-1 text-sm text-soft">{t("tpath.subtitle")}</p>
        </div>
        <div role="tablist" className="flex gap-1 rounded-full bg-surface2 p-1">
          {[["cau_truc", t("tpath.tab_structure")], ["tien_do", t("tpath.tab_progress")]].map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`cursor-pointer rounded-full border-0 px-4 py-2 font-sans text-sm font-bold transition-colors ${tab === k ? "bg-surface text-ink shadow" : "bg-transparent text-soft hover:text-ink"}`}>
              {l}
            </button>
          ))}
        </div>
      </header>

      {tab === "cau_truc" ? (
        ds === null ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface2" />)}</div>
        ) : ds === false ? (
          <p className="text-sm text-danger">{t("tpath.load_error")}</p>
        ) : !ds.length ? (
          <p className="text-sm text-soft">{t("tpath.no_decks")}</p>
        ) : (
          <>
            {/* Thanh lưu dính trên cùng: thấy được từ bất kỳ chương nào. */}
            <div className="sticky top-0 z-10 -mx-4 mb-4 flex flex-wrap items-center gap-3 bg-surface/90 px-4 py-2 backdrop-blur">
              <span className="text-sm text-soft">{t("tpath.summary", { n: tongMan })}</span>
              <span className="flex-1" />
              {luu?.loi && <span className="text-sm font-semibold text-danger" role="alert">{luu.loi}</span>}
              {luu?.soDong >= 0 && !daDoi && <span className="text-sm font-semibold text-ok" role="status">{t("tpath.saved")}</span>}
              <button type="button" onClick={luuLai} disabled={!daDoi || luu === "dang"}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-4 py-2 font-sans text-sm font-bold text-on-primary hover:opacity-90 disabled:cursor-default disabled:opacity-50">
                {luu === "dang" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}{t("tpath.save")}
              </button>
            </div>

            {KY_NANG.map(({ ma }) => {
              const trong = ban.filter((x) => x.kyNang === ma);
              if (!trong.length) return null;
              const Icon = ICON[ma];
              return (
                <section key={ma} className="mb-6">
                  <h2 className="m-0 mb-2 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-soft">
                    <Icon size={16} />{t("path.chapter", { ky: t(`path.sk_${ma}`) })}
                  </h2>
                  <ol className="m-0 flex list-none flex-col gap-2 p-0">
                    {trong.map((x, i) => (
                      <li key={x.boId} className={`flex flex-wrap items-center gap-3 rounded-2xl border border-solid border-line p-3 ${x.bat ? "bg-surface" : "bg-surface2 opacity-70"}`}>
                        <span className="w-6 text-center text-sm font-extrabold tabular-nums text-soft">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate font-bold ${x.bat ? "text-ink" : "text-soft line-through"}`}>{x.ten}</span>
                          <span className="block text-xs text-soft">{t("path.cards_n", { n: x.soThe })}</span>
                        </span>
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-soft">
                          {t("tpath.questions")}
                          <select value={x.soCau} onChange={(e) => sua(x.boId, { soCau: Number(e.target.value) })} disabled={!x.bat}
                            className="rounded-lg border border-solid border-line bg-surface2 px-2 py-1 font-sans text-sm text-ink">
                            {[4, 5, 6, 7, 8, 9, 10, 12, 15].map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </label>
                        <span className="flex gap-1">
                          <button type="button" onClick={() => doi(ma, i, -1)} disabled={i === 0} aria-label={t("tpath.up")}
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border-0 bg-surface2 text-soft hover:text-ink disabled:cursor-default disabled:opacity-40"><ArrowUp size={15} /></button>
                          <button type="button" onClick={() => doi(ma, i, 1)} disabled={i === trong.length - 1} aria-label={t("tpath.down")}
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border-0 bg-surface2 text-soft hover:text-ink disabled:cursor-default disabled:opacity-40"><ArrowDown size={15} /></button>
                          <button type="button" onClick={() => sua(x.boId, { bat: !x.bat })}
                            aria-label={x.bat ? t("tpath.hide") : t("tpath.show")} title={x.bat ? t("tpath.hide") : t("tpath.show")}
                            className={`grid h-8 w-8 cursor-pointer place-items-center rounded-lg border-0 ${x.bat ? "bg-primary-soft text-primary" : "bg-surface2 text-soft"}`}>
                            {x.bat ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="m-0 mt-2 flex items-center gap-1.5 pl-9 text-xs text-soft"><Crown size={13} className="text-warn" />{t("tpath.boss_note")}</p>
                </section>
              );
            })}
          </>
        )
      ) : (
        tienDo === undefined ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-surface2" />)}</div>
        ) : tienDo === null ? (
          <p className="text-sm text-danger">{t("tpath.load_error")}</p>
        ) : !tienDo.length ? (
          <div className="py-12 text-center"><Users size={32} className="mx-auto text-soft" /><p className="m-0 mt-3 text-sm text-soft">{t("tpath.no_progress")}</p></div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-solid border-line bg-surface">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-soft">
                  <th className="p-3 font-bold">{t("tpath.col_student")}</th>
                  <th className="p-3 text-right font-bold">{t("tpath.col_stars")}</th>
                  <th className="p-3 text-right font-bold">{t("tpath.col_levels")}</th>
                  <th className="p-3 text-right font-bold">{t("tpath.col_bosses")}</th>
                  <th className="p-3 text-right font-bold">{t("tpath.col_last")}</th>
                </tr>
              </thead>
              <tbody>
                {tienDo.map((h) => (
                  <tr key={h.id} className="border-0 border-t border-solid border-line">
                    <td className="p-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar khoa={h.avatar || ""} ten={h.name} size={32} dungYen />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-ink">{h.name}</span>
                          {h.username && <span className="block truncate text-xs text-soft">@{h.username}</span>}
                        </span>
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold tabular-nums text-ink"><Star size={13} className="mr-1 inline text-warn" fill="currentColor" />{h.sao}</td>
                    <td className="p-3 text-right tabular-nums text-ink">{h.man_qua - h.trum_qua}/{tongMan}</td>
                    <td className="p-3 text-right tabular-nums text-ink">{h.trum_qua}</td>
                    <td className="p-3 text-right text-xs text-soft">{h.gan_nhat ? new Date(h.gan_nhat).toLocaleDateString("vi-VN") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
