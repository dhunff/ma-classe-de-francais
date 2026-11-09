import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, TrendingDown, TrendingUp, Minus, Sparkles, CheckCircle2, Loader2, PenLine } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { gomHoSoLoi, baiChoLoi, capTuHoSo, CUA_SO_NGAY } from "../../shared/hoSoLoi.js";
import { TAT_CA } from "../../content/nguPhap/index.js";
import { NHOM, tenLoai } from "../practice/LoiVietAI.jsx";
import { LOAI_LOI } from "../../../supabase/functions/_shared/loiViet.js";

/* « Lỗi bạn hay mắc » (09/11, giai đoạn 3 chấm AI chuyên sâu), tab trong Tiến bộ VIP.
 *
 * Cộng dồn lỗi AI tìm trong các bài viết đã chấm (pe_ai_goi_y, học sinh đọc được phiếu của mình),
 * so 30 ngày gần nhất với 30 ngày trước đó theo số lỗi MỖI BÀI (xem shared/hoSoLoi.js). Mỗi loại
 * lỗi trỏ tới bài « Học ngữ pháp » của đúng trình độ, nếu có bài dạy đúng thứ đó.
 * `thu`: { dongs, level } dựng sẵn cho /preview.html (không gọi mạng). */

const XU_HUONG = {
  giam: () => [TrendingDown, "bg-ok-soft text-ok", tr("Đang giảm", "En baisse", "Decreasing")],
  het: () => [CheckCircle2, "bg-ok-soft text-ok", tr("Tháng này không còn", "Disparue ce mois-ci", "Gone this month")],
  tang: () => [TrendingUp, "bg-danger-soft text-danger", tr("Đang tăng", "En hausse", "Increasing")],
  on_dinh: () => [Minus, "bg-surface2 text-soft", tr("Chưa đổi", "Stable", "Stable")],
  moi: () => [Sparkles, "bg-primary-soft text-primary", tr("Mới ghi nhận", "Nouveau", "New")],
};

async function docDuLieu() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return null;
  const tu = new Date(Date.now() - 2 * CUA_SO_NGAY * 86400000).toISOString();
  const [phieu, noi, hoSo] = await Promise.all([
    supabase.from("pe_ai_goi_y").select("created_at, loi:ket_qua->loi").eq("user_id", uid)
      .gte("created_at", tu).order("created_at", { ascending: false }).limit(500),
    /* Lỗi nói của phần Nói thi thử (giai đoạn 5): lỗi ngữ pháp, dùng từ trong bản chép lời. */
    supabase.from("po_cham").select("ai_luc, loi:ai_goi_y->loi").eq("user_id", uid)
      .gte("ai_luc", tu).order("ai_luc", { ascending: false }).limit(200),
    supabase.from("profiles").select("level").eq("id", uid).maybeSingle(),
  ]);
  if (phieu.error) return null;
  const dongNoi = noi.error ? [] : (noi.data ?? []).filter((d) => Array.isArray(d.loi)).map((d) => ({ created_at: d.ai_luc, loi: d.loi, nguon: "noi" }));
  return { dongs: [...(phieu.data ?? []), ...dongNoi], level: hoSo.data?.level ?? null };
}

export default function HoSoLoiViet({ thu }) {
  const [d, setD] = useState(thu ?? undefined);   // undefined đang tải · null không đọc được
  useEffect(() => {
    if (thu) return undefined;
    let con = true;
    docDuLieu().then((x) => { if (con) setD(x); });
    return () => { con = false; };
  }, [thu]);
  const hs = useMemo(() => (d ? gomHoSoLoi(d.dongs) : null), [d]);
  const cap = capTuHoSo(d?.level);
  const tenBai = useMemo(() => Object.fromEntries(TAT_CA.map((b) => [b.ma, b.ten])), []);

  if (d === undefined) return <p className="m-0 mt-6 flex items-center gap-2 text-sm text-soft"><Loader2 size={16} className="mcf-spin" /> {tr("Đang tải…", "Chargement…", "Loading…")}</p>;
  if (!d) return <p className="m-0 mt-6 rounded-2xl bg-danger-soft p-4 text-sm text-ink">{tr("Chưa đọc được các bài viết đã chấm. Tải lại trang rồi thử lại.", "Impossible de lire vos copies corrigées. Rechargez la page.", "Couldn't load your marked texts. Reload the page.")}</p>;
  if (!hs.so_bai_30 && !hs.so_bai_truoc) {
    return (
      <div className="grid justify-items-start gap-3 rounded-3xl border border-solid border-line bg-surface p-6">
        <PenLine size={22} className="text-primary" />
        <p className="m-0 text-sm font-bold text-ink">{tr("Chưa có bài viết hay bài nói thi thử nào được AI chấm trong 60 ngày qua.", "Aucune copie ni oral corrigé par l'IA ces 60 derniers jours.", "No AI-marked writing or mock speaking in the last 60 days.")}</p>
        <p className="m-0 text-[13px] text-soft">{tr("Làm một bài Viết ở Luyện tập: nộp xong AI tự chấm, và lỗi của bạn sẽ được gom lại ở đây.", "Faites un exercice d'écriture : l'IA le corrige et vos erreurs sont regroupées ici.", "Do a writing exercise: the AI marks it and your errors are collected here.")}</p>
      </div>
    );
  }

  const ds = hs.loai.slice(0, 8);
  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-solid border-line bg-surface p-5">
        <p className="m-0 text-base font-extrabold text-ink">{tr("Lỗi bạn hay mắc khi viết và nói", "Vos erreurs fréquentes à l'écrit et à l'oral", "Your frequent writing and speaking errors")}</p>
        <p className="m-0 mt-1 text-[13px] text-soft">
          {tr(`${hs.so_bai_30} bài được chấm trong 30 ngày qua, ${hs.so_bai_truoc} bài trong 30 ngày trước đó. Xu hướng so số lỗi trên mỗi bài, nên làm nhiều bài hơn không làm bạn trông kém đi.`,
            `${hs.so_bai_30} copies ces 30 derniers jours, ${hs.so_bai_truoc} les 30 jours précédents. La tendance compare les erreurs par copie.`,
            `${hs.so_bai_30} texts in the last 30 days, ${hs.so_bai_truoc} in the 30 days before. Trends compare errors per text.`)}
        </p>
      </div>

      <ul className="m-0 grid list-none gap-3 p-0">
        {ds.map((o) => {
          const [Icon, mauXH, nhanXH] = (XU_HUONG[o.xu_huong] ?? XU_HUONG.on_dinh)();
          const ma = baiChoLoi(o.loai, cap);
          return (
            <li key={o.loai} className="grid gap-3 rounded-2xl border border-solid border-line bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${(NHOM[LOAI_LOI[o.loai]] ?? NHOM.ngu_phap).chip}`}>{tenLoai(o.loai)}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${mauXH}`}><Icon size={12} />{nhanXH}</span>
                <span className="ml-auto text-xs tabular-nums text-soft">
                  {tr(`${o.dem30} lần trong 30 ngày`, `${o.dem30} fois en 30 jours`, `${o.dem30} times in 30 days`)}
                  {hs.so_bai_30 > 0 && o.dem30 > 0 ? tr(` · ${o.tiLe30} lỗi/bài`, ` · ${o.tiLe30} par copie`, ` · ${o.tiLe30} per text`) : ""}
                </span>
              </div>
              {o.vi_du.length > 0 && (
                <ul className="m-0 grid list-none gap-1.5 p-0">
                  {o.vi_du.map((v, i) => (
                    <li key={i} className="rounded-xl bg-surface2 px-3 py-2 text-[13px] leading-relaxed">
                      <p lang="fr" className="m-0 flex flex-wrap items-center gap-x-2">
                        <span className="text-danger line-through decoration-danger/60">{v.trich}</span>
                        <ArrowRight size={12} className="shrink-0 text-soft" />
                        <span className="font-bold text-ok">{v.sua}</span>
                        {v.nguon === "noi" && <span lang="vi" className="rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">{tr("bài nói", "oral", "speaking")}</span>}
                      </p>
                      {v.giai_thich && <p className="m-0 text-xs text-soft">{v.giai_thich}</p>}
                    </li>
                  ))}
                </ul>
              )}
              {ma && (
                <Link to={`/etudiant/ngu-phap/${ma}`}
                  className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary no-underline hover:opacity-90">
                  <BookOpen size={13} /> {tr("Ôn bài", "Réviser", "Review")}: {tenBai[ma] ?? ma}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
