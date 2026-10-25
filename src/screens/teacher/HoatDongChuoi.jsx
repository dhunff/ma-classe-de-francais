import { useEffect, useState } from "react";
import { Flame, Dumbbell, Timer, AudioLines, Swords, Map as BanDo, BookA, Target, Layers } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";

/* Mọi hoạt động tính vào chuỗi ngày học của một học sinh (25/10, RPC hoat_dong_hoc_sinh,
 * migration 163). Dải 14 ngày (ô cam = có học) + dòng thời gian 30 ngày, gộp theo ngày.
 * Flashcard chỉ có giờ từ 25/10 (cột reviews.on_luc mới); trước đó chỉ thấy qua ô ngày. */
const LOAI = () => ({
  bai: [Dumbbell, "bg-primary-soft text-primary", tr("Bài tập", "Exercice", "Exercise")],
  thi: [Timer, "bg-danger-soft text-danger", tr("Thi thử", "Examen blanc", "Mock exam")],
  nghe_noi: [AudioLines, "bg-surface2 text-ink", tr("Nghe & Nói", "Écoute & Oral", "Listen & Speak")],
  thach_dau: [Swords, "bg-warn-soft text-warn", tr("Thách đấu", "Défi", "Duel")],
  lo_trinh: [BanDo, "bg-ok-soft text-ok", tr("Lộ trình", "Parcours", "Path")],
  ngu_phap: [BookA, "bg-primary-soft text-primary", tr("Học ngữ pháp", "Grammaire", "Grammar")],
  bai_luyen: [Target, "bg-danger-soft text-danger", tr("Bài luyện của tôi", "Entraînement perso", "My practice")],
  flashcard: [Layers, "bg-ok-soft text-ok", "Flashcard"],
});
const ngayVN = (d) => new Date(d).toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

export default function HoatDongChuoi({ uid }) {
  const [hd, setHd] = useState(undefined);
  useEffect(() => {
    if (!uid) { setHd(null); return; }
    supabase.rpc("hoat_dong_hoc_sinh", { p_uid: uid, p_ngay: 30 }).then(({ data, error }) => setHd(error ? null : data));
  }, [uid]);

  const coHoc = new Set(hd?.ngay ?? []);
  const muoiBon = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 86400000); return ngayVN(d); });
  const theoNgay = {};
  for (const e of hd?.su_kien ?? []) (theoNgay[ngayVN(e.luc)] ??= []).push(e);
  const L = LOAI();

  return (
    <div className="rounded-3xl border border-solid border-line bg-surface p-5">
      <h3 className="m-0 flex items-center gap-2 text-base font-extrabold text-ink"><Flame size={18} className="text-orange-500" /> {tr("Hoạt động giữ chuỗi", "Activité de la série", "Streak activity")}</h3>
      <p className="m-0 mt-1 text-xs text-soft">{tr("Mọi việc tính vào chuỗi ngày học: bài tập, thi thử, Flashcard, Thách đấu, Lộ trình, Nghe & Nói, Ngữ pháp, Bài luyện của tôi.", "Tout ce qui compte pour la série.", "Everything that counts toward the streak.")}</p>
      {hd === undefined ? <p className="m-0 mt-3 text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
        : hd === null ? <p className="m-0 mt-3 text-sm text-danger">{tr("Không đọc được hoạt động.", "Lecture impossible.", "Couldn't load.")}</p>
        : (
          <>
            <div className="mt-4 grid grid-cols-7 gap-1.5 sm:grid-cols-[repeat(14,minmax(0,1fr))]">
              {muoiBon.map((d) => (
                <div key={d} title={d} className={"grid h-10 place-items-center rounded-lg text-[11px] font-bold " + (coHoc.has(d) ? "bg-orange-500 text-white" : "bg-surface2 text-soft")}>
                  {d.slice(8)}/{d.slice(5, 7)}
                </div>
              ))}
            </div>
            <p className="m-0 mt-2 text-xs text-soft">{tr(`${hd.ngay.length} ngày có học trong 30 ngày qua`, `${hd.ngay.length} jours actifs sur 30`, `${hd.ngay.length} active days in the last 30`)}</p>

            <div className="mt-4 grid max-h-[28rem] gap-4 overflow-y-auto pr-1">
              {!Object.keys(theoNgay).length && <p className="m-0 text-sm text-soft">{tr("Chưa có hoạt động nào trong 30 ngày qua.", "Aucune activité.", "No activity.")}</p>}
              {Object.entries(theoNgay).sort(([a], [b]) => (a < b ? 1 : -1)).map(([ngay, ds]) => (
                <div key={ngay}>
                  <p className="m-0 mb-1.5 text-xs font-extrabold uppercase tracking-wide text-soft">{new Date(ngay + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })} · {ds.length}</p>
                  <ul className="m-0 grid list-none gap-1.5 p-0">
                    {ds.map((e, i) => {
                      const [Icon, mau, nhan] = L[e.loai] ?? L.bai;
                      return (
                        <li key={i} className="flex items-center gap-2.5 rounded-xl border border-solid border-line px-3 py-2">
                          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${mau}`}><Icon size={14} /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-ink" lang="fr">{e.ten}</span>
                            <span className="block text-[11px] text-soft">{nhan} · {new Date(e.luc).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" })}</span>
                          </span>
                          {e.kq && <span className="shrink-0 rounded-lg bg-surface2 px-2 py-1 text-xs font-bold tabular-nums text-ink">{e.kq}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
    </div>
  );
}
