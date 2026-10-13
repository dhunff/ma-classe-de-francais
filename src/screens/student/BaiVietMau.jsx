import React, { useState } from "react";
import { Crown, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";

/* Bài viết mẫu (VIP) — 14/10, migration 143 + Edge Function viet-mau.
 *
 * AI viết lại CHÍNH bài của học sinh ở đúng trình độ đề, kèm các chỗ đã sửa.
 * Quyền VIP kiểm ở máy chủ; ở đây chỉ hiện lời mời nâng cấp khi nhận CAN_VIP.
 * Mỗi bài một bản: bấm lại chỉ đọc bản đã lưu, không tốn thêm. */
const loiTheoMa = (ma) => ({
  CAN_VIP: null,
  BAI_QUA_NGAN: tr("Bài quá ngắn để viết lại (cần ít nhất 15 từ).", "Texte trop court pour être réécrit (15 mots minimum).", "Too short to rewrite (at least 15 words)."),
  CHUA_CAU_HINH_KHOA: tr("Máy chủ chưa cấu hình AI. Đây là việc của quản trị viên.", "L'IA n'est pas configurée sur le serveur.", "AI is not configured on the server."),
}[ma] ?? tr("AI chưa viết được bài mẫu. Thử lại sau giây lát.", "L'IA n'a pas pu rédiger le modèle. Réessayez dans un instant.", "The AI couldn't write the model text. Try again shortly."));

export default function BaiVietMau({ answerId }) {
  const [trangThai, setTrangThai] = useState("cho"); // cho | dang | xong | vip | loi
  const [kq, setKq] = useState(null);
  const [loi, setLoi] = useState("");

  const goi = async () => {
    setTrangThai("dang"); setLoi("");
    const { data, error } = await supabase.functions.invoke("viet-mau", { body: { answerId } });
    let than = data;
    if (error) { try { than = await error.context?.json?.(); } catch { than = null; } }
    if (than?.ok) { setKq(than); setTrangThai("xong"); return; }
    if (than?.ma === "CAN_VIP") { setTrangThai("vip"); return; }
    setLoi(loiTheoMa(than?.ma)); setTrangThai("loi");
  };

  if (trangThai === "xong" && kq) {
    return (
      <div className="rounded-2xl border border-solid border-amber-400 bg-surface p-4">
        <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-warn">
          <Crown size={13} /> {tr("Bài viết mẫu từ bài của bạn", "Version modèle de votre texte", "Model version of your text")}
        </p>
        <div className="mt-2 whitespace-pre-wrap rounded-xl bg-surface2 p-3 text-sm leading-relaxed text-ink">{kq.ban_mau}</div>
        {kq.giai_thich?.length > 0 && (
          <>
            <p className="m-0 mt-3 text-xs font-bold text-soft">{tr("Những chỗ đã nâng cấp", "Ce qui a été amélioré", "What was improved")}</p>
            <ul className="m-0 mt-1 list-none space-y-2 p-0">
              {kq.giai_thich.map((g, i) => (
                <li key={i} className="rounded-xl bg-surface2 p-2.5 text-sm">
                  <span className="flex flex-wrap items-center gap-1.5">
                    {g.goc && <span className="text-danger line-through">{g.goc}</span>}
                    {g.goc && <ArrowRight size={13} className="text-soft" />}
                    <span className="font-bold text-ok">{g.sua}</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-soft">{g.ly_do}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-amber-400 bg-surface p-3">
      <p className="m-0 min-w-0 flex-1 text-sm text-ink">
        {trangThai === "vip"
          ? tr("Bài viết mẫu là quyền lợi của gói VIP. Nâng cấp ở mục Bài tập hoặc màn thi thử.", "La version modèle est réservée aux membres VIP.", "The model version is a VIP benefit.")
          : trangThai === "loi" ? <span className="text-danger">{loi}</span>
          : tr("Xem bài của bạn được AI viết lại ở trình độ đề, kèm từng chỗ đã sửa.", "Voyez votre texte réécrit par l'IA au niveau du sujet, avec chaque correction.", "See your text rewritten by AI at the exam level, with each change explained.")}
      </p>
      {trangThai !== "vip" && (
        <button type="button" onClick={goi} disabled={trangThai === "dang"}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-amber-400 px-4 py-2 font-sans text-sm font-extrabold text-amber-950 hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60">
          {trangThai === "dang" ? <Loader2 size={14} className="mcf-spin" /> : <Crown size={14} />}
          {trangThai === "dang" ? tr("AI đang viết…", "L'IA rédige…", "AI is writing…") : tr("Bài viết mẫu (VIP)", "Version modèle (VIP)", "Model text (VIP)")}
        </button>
      )}
    </div>
  );
}
