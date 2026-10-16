import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flag, Check, RotateCcw, ExternalLink } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { TAT_CA, timCau } from "../../content/nguPhap/index.js";

/* « Báo lỗi ngữ pháp » (16/10, migration 149): học sinh bấm « Báo lỗi câu này » ở
 * phần luyện tập của Học ngữ pháp; giáo viên xem, sửa nội dung trong mã nguồn
 * (src/content/nguPhap), rồi đánh dấu đã xử lý. Không có nút xoá: báo cáo là dấu
 * vết, đánh dấu xong là đủ. */
export default function BaoLoiNguPhap() {
  const [ds, setDs] = useState(null);
  const [loi, setLoi] = useState("");
  const [loc, setLoc] = useState("mo");          // mo | xong | tat
  const tenBai = useMemo(() => Object.fromEntries(TAT_CA.map((b) => [b.ma, `${b.cap} · ${b.ten}`])), []);

  const tai = async () => {
    const { data, error } = await supabase.from("ngu_phap_bao_loi").select("id, ma_bai, cau, ghi_chu, tao_luc, da_xu_ly").order("tao_luc", { ascending: false }).limit(300);
    if (error) { setLoi(error.message); setDs([]); return; }
    setLoi(""); setDs(data ?? []);
  };
  useEffect(() => { tai(); }, []);

  const danhDau = async (id, xong) => {
    const { data, error } = await supabase.rpc("xu_ly_bao_loi_ngu_phap", { p_id: id, p_xong: xong });
    if (error || !data?.ok) { setLoi(error?.message ?? tr("Không cập nhật được.", "Mise à jour impossible.", "Could not update.")); return; }
    setDs((x) => x.map((r) => (r.id === id ? { ...r, da_xu_ly: xong } : r)));
  };

  const hien = (ds ?? []).filter((r) => (loc === "tat" ? true : loc === "xong" ? r.da_xu_ly : !r.da_xu_ly));
  const soMo = (ds ?? []).filter((r) => !r.da_xu_ly).length;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      <h1 className="m-0 flex items-center gap-2 text-2xl font-extrabold text-ink"><Flag size={22} className="text-primary" /> {tr("Báo lỗi ngữ pháp", "Signalements de grammaire", "Grammar reports")}</h1>
      <p className="m-0 mt-1 text-sm text-soft">{tr("Câu luyện trong « Học ngữ pháp » bị học sinh báo sai. Sửa nội dung trong src/content/nguPhap rồi đánh dấu đã xử lý.", "Exercices signalés dans « Grammaire ». Corrigez le contenu dans src/content/nguPhap puis marquez comme traité.", "Exercises reported in Grammar. Fix the content in src/content/nguPhap, then mark as handled.")}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {[["mo", tr(`Chưa xử lý (${soMo})`, `À traiter (${soMo})`, `Open (${soMo})`)], ["xong", tr("Đã xử lý", "Traités", "Handled")], ["tat", tr("Tất cả", "Tous", "All")]].map(([k, t]) => (
          <button key={k} type="button" onClick={() => setLoc(k)}
            className={`cursor-pointer rounded-full border-0 px-4 py-1.5 font-sans text-sm font-bold ${loc === k ? "bg-primary text-on-primary" : "bg-surface2 text-ink"}`}>{t}</button>
        ))}
      </div>

      {loi && <p className="m-0 mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger">{loi}</p>}
      {ds === null ? <p className="m-0 mt-6 text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
        : hien.length === 0 ? <p className="m-0 mt-6 rounded-2xl bg-surface p-6 text-center text-sm text-soft">{tr("Không có báo lỗi nào ở mục này.", "Aucun signalement ici.", "No reports here.")}</p>
        : (
          <ul className="m-0 mt-5 grid list-none gap-3 p-0">
            {hien.map((r) => {
              const cau = timCau(r.ma_bai, r.cau);
              return (
                <li key={r.id} className={`rounded-2xl border border-solid p-4 ${r.da_xu_ly ? "border-line bg-surface opacity-70" : "border-warn/40 bg-surface"}`}>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-soft">
                    <span className="font-bold text-ink">{tenBai[r.ma_bai] ?? r.ma_bai}</span>
                    <span>· {new Date(r.tao_luc).toLocaleString()}</span>
                    <Link to={`/etudiant/ngu-phap/${r.ma_bai}`} className="inline-flex items-center gap-1 font-bold text-primary no-underline"><ExternalLink size={12} /> {tr("Mở bài", "Ouvrir", "Open")}</Link>
                  </div>
                  <p lang="fr" className="m-0 mt-2 font-bold text-ink">{r.cau}</p>
                  {cau ? (
                    <p className="m-0 mt-1 text-xs text-soft">{tr("Đáp án hiện tại", "Réponse actuelle", "Current answer")}: <strong lang="fr" className="text-ink">{cau.loai === "qcm" ? cau.pa[cau.dap] : cau.loai === "vf" ? (cau.dung ? "Vrai" : "Faux") : cau.dap[0]}</strong></p>
                  ) : (
                    <p className="m-0 mt-1 text-xs font-bold text-ok">{tr("Câu này không còn trong nội dung (đã sửa hoặc xoá).", "Cette question n'existe plus (corrigée ou supprimée).", "This question no longer exists (fixed or removed).")}</p>
                  )}
                  {r.ghi_chu && <p className="m-0 mt-2 rounded-xl bg-surface2 p-2.5 text-sm text-ink">{r.ghi_chu}</p>}
                  <div className="mt-3">
                    {r.da_xu_ly ? (
                      <button type="button" onClick={() => danhDau(r.id, false)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-solid border-line bg-surface px-3 py-1.5 font-sans text-xs font-bold text-ink"><RotateCcw size={13} /> {tr("Mở lại", "Rouvrir", "Reopen")}</button>
                    ) : (
                      <button type="button" onClick={() => danhDau(r.id, true)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-ok px-3 py-1.5 font-sans text-xs font-bold text-white"><Check size={13} /> {tr("Đã xử lý", "Traité", "Handled")}</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
    </div>
  );
}
