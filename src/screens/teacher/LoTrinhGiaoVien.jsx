import React, { useEffect, useMemo, useState } from "react";
import { Map as MapIcon, Eye, EyeOff, Loader2, Users, Star, Crown, ChevronDown, ChevronUp, Check } from "lucide-react";
import { docLoTrinh, luuMan, docTienDo } from "../../shared/loTrinhStore.js";
import { Avatar } from "../../shared/avatars.jsx";
import { useT } from "../../shared/i18n.jsx";

/* Lộ trình học tập — màn GIÁO VIÊN (02/10, đổi sang chủ đề 06/10).
 *
 * Hai tab:
 *   Cấu trúc — 16 chủ đề × các màn (migration 115/116). Mỗi màn: bật/tắt, số
 *              câu (4–15), và xem trước 8 mục từ kèm loại từ. Ghi THẲNG lên
 *              lo_trinh_man (RLS: chỉ giáo viên), từng màn một, có biên nhận
 *              số dòng; 0 dòng = không ghi được và màn hình nói ra.
 *   Tiến độ  — mỗi học sinh: tổng sao, màn đã qua, thử thách đã hạ.
 *
 * Nội dung mục từ soạn ở scripts/lo-trinh/chu-de.mjs (có kiểm loại từ, trùng
 * lặp, dấu gạch dài) rồi sinh migration — không sửa từ ở màn này, để một lỗi
 * gõ không lọt vào 100 màn mà không qua bộ kiểm. */

const TEN_LOAI = { n: "danh từ", v: "động từ", a: "tính từ", x: "cụm từ", d: "trạng từ" };

export default function LoTrinhGiaoVien() {
  const t = useT();
  const [tab, setTab] = useState("cau_truc");
  const [lt, setLt] = useState(null);
  const [mo, setMo] = useState({});
  const [dang, setDang] = useState({});
  const [loi, setLoi] = useState("");
  const [tienDo, setTienDo] = useState(undefined);

  useEffect(() => { docLoTrinh().then((d) => setLt(d || false)); }, []);
  useEffect(() => { if (tab === "tien_do" && tienDo === undefined) docTienDo().then(setTienDo); }, [tab, tienDo]);

  const tongMan = useMemo(() => (lt ? lt.chuDe.reduce((n, c) => n + c.man.filter((m) => m.bat).length, 0) : 0), [lt]);

  const sua = async (manId, patch) => {
    setDang((d) => ({ ...d, [manId]: true })); setLoi("");
    const r = await luuMan(manId, patch);
    setDang((d) => ({ ...d, [manId]: false }));
    if (r.loi || r.soDong !== 1) { setLoi(t("tpath.err_receipt", { a: r.soDong ?? 0, b: 1 }) + (r.loi ? " " + r.loi : "")); return; }
    setLt((x) => ({ ...x, chuDe: x.chuDe.map((c) => ({ ...c, man: c.man.map((m) => (m.id === manId ? { ...m, ...("bat" in patch ? { bat: patch.bat } : {}), ...("so_cau" in patch ? { soCau: patch.so_cau } : {}) } : m)) })) }));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 font-sans">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink"><MapIcon size={24} className="text-primary" />{t("nav.path")}</h1>
          <p className="m-0 mt-1 text-sm text-soft">{t("tpath.subtitle_topics")}</p>
        </div>
        <div role="tablist" className="flex gap-1 rounded-full bg-surface2 p-1">
          {[["cau_truc", t("tpath.tab_structure")], ["tien_do", t("tpath.tab_progress")]].map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`cursor-pointer rounded-full border-0 px-4 py-2 font-sans text-sm font-bold transition-colors ${tab === k ? "bg-surface text-ink shadow" : "bg-transparent text-soft hover:text-ink"}`}>{l}</button>
          ))}
        </div>
      </header>

      {loi && <p className="mb-4 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger" role="alert">{loi}</p>}

      {tab === "cau_truc" ? (
        lt === null ? <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface2" />)}</div>
          : lt === false ? <p className="text-sm text-danger">{t("tpath.load_error")}</p>
          : (
            <>
              <p className="mb-4 text-sm text-soft">{t("tpath.summary", { n: tongMan })}</p>
              {lt.chuDe.map((c) => (
                <section key={c.id} className="mb-6">
                  <h2 className="m-0 mb-2 flex items-center gap-2 text-sm font-extrabold text-ink">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.mau }} />{c.tenVi}
                    <span className="font-semibold text-soft">· {c.tenFr}</span>
                  </h2>
                  <ol className="m-0 flex list-none flex-col gap-2 p-0">
                    {c.man.map((m, i) => (
                      <li key={m.id} className={`rounded-2xl border border-solid border-line ${m.bat ? "bg-surface" : "bg-surface2 opacity-70"}`}>
                        <div className="flex flex-wrap items-center gap-3 p-3">
                          <span className="w-6 text-center text-sm font-extrabold tabular-nums text-soft">{i + 1}</span>
                          <button type="button" onClick={() => setMo((x) => ({ ...x, [m.id]: !x[m.id] }))}
                            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left font-sans">
                            {mo[m.id] ? <ChevronUp size={16} className="text-soft" /> : <ChevronDown size={16} className="text-soft" />}
                            <span className={`truncate font-bold ${m.bat ? "text-ink" : "text-soft line-through"}`}>{m.ten}</span>
                            <span className="rounded-full bg-surface2 px-2 py-0.5 text-[11px] font-bold text-soft">{m.cap}</span>
                          </button>
                          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-soft">
                            {t("tpath.questions")}
                            <select value={m.soCau} disabled={!m.bat || dang[m.id]} onChange={(e) => sua(m.id, { so_cau: Number(e.target.value) })}
                              className="rounded-lg border border-solid border-line bg-surface2 px-2 py-1 font-sans text-sm text-ink">
                              {[4, 5, 6, 7, 8, 9, 10, 12, 15].map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </label>
                          <button type="button" disabled={dang[m.id]} onClick={() => sua(m.id, { bat: !m.bat })}
                            aria-label={m.bat ? t("tpath.hide") : t("tpath.show")} title={m.bat ? t("tpath.hide") : t("tpath.show")}
                            className={`grid h-8 w-8 cursor-pointer place-items-center rounded-lg border-0 ${m.bat ? "bg-primary-soft text-primary" : "bg-surface2 text-soft"}`}>
                            {dang[m.id] ? <Loader2 size={15} className="animate-spin" /> : m.bat ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                        </div>
                        {mo[m.id] && (
                          <ul className="m-0 grid list-none gap-1 border-0 border-t border-solid border-line p-3 sm:grid-cols-2">
                            {m.tu.map((w) => (
                              <li key={w.id} className="flex items-baseline gap-2 text-sm">
                                <span lang="fr" className="font-semibold text-ink">{w.matTruoc}</span>
                                <span className="text-soft">{w.matSau}</span>
                                <span className="ml-auto text-[11px] text-soft">{TEN_LOAI[w.loai]}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                  <p className="m-0 mt-2 flex items-center gap-1.5 pl-9 text-xs text-soft"><Crown size={13} className="text-warn" />{t("tpath.boss_note")}</p>
                </section>
              ))}
            </>
          )
      ) : (
        tienDo === undefined ? <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-surface2" />)}</div>
          : tienDo === null ? <p className="text-sm text-danger">{t("tpath.load_error")}</p>
          : !tienDo.length ? <div className="py-12 text-center"><Users size={32} className="mx-auto text-soft" /><p className="m-0 mt-3 text-sm text-soft">{t("tpath.no_progress")}</p></div>
          : (
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
                  {tienDo.map((h) => {
                    /* Chỉ đếm khoá MỚI (man:/trum:<chủ đề>), bỏ kết quả lộ trình cũ theo kỹ năng. */
                    const kq = Object.entries(h.ket_qua || {}).filter(([k]) => k.startsWith("man:") || (k.startsWith("trum:") && !/^trum:(CO|CE|PE|PO)$/.test(k)));
                    const sao = kq.reduce((n, [, v]) => n + v, 0);
                    const manQua = kq.filter(([k, v]) => k.startsWith("man:") && v > 0).length;
                    const trumQua = kq.filter(([k, v]) => k.startsWith("trum:") && v > 0).length;
                    return (
                      <tr key={h.id} className="border-0 border-t border-solid border-line">
                        <td className="p-3"><span className="flex items-center gap-2.5"><Avatar khoa={h.avatar || ""} ten={h.name} size={32} dungYen />
                          <span className="min-w-0"><span className="block truncate font-semibold text-ink">{h.name}</span>{h.username && <span className="block truncate text-xs text-soft">@{h.username}</span>}</span></span></td>
                        <td className="p-3 text-right font-bold tabular-nums text-ink"><Star size={13} className="mr-1 inline text-warn" fill="currentColor" />{sao}</td>
                        <td className="p-3 text-right tabular-nums text-ink">{manQua}/{tongMan}</td>
                        <td className="p-3 text-right tabular-nums text-ink">{trumQua > 0 ? <><Check size={13} className="mr-1 inline text-ok" />{trumQua}</> : 0}</td>
                        <td className="p-3 text-right text-xs text-soft">{h.gan_nhat ? new Date(h.gan_nhat).toLocaleDateString("vi-VN") : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
      )}
    </div>
  );
}
