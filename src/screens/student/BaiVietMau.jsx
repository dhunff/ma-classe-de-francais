import React, { useState } from "react";
import { Crown, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { loiTranVip } from "../../shared/loiTranVip.js";
import { tr } from "../../shared/i18n.jsx";

/* Bài viết mẫu (VIP) — 14/10, migration 143 + Edge Function viet-mau.
 *
 * AI viết lại CHÍNH bài của học sinh ở đúng trình độ đề, kèm các chỗ đã sửa.
 * Quyền VIP kiểm ở máy chủ; ở đây chỉ hiện lời mời nâng cấp khi nhận CAN_VIP.
 * Mỗi bài một bản: bấm lại chỉ đọc bản đã lưu, không tốn thêm. */
const loiTheoMa = (ma) => ({
  CAN_VIP: null,
  HET_LUOT_VIP: loiTranVip(),
  BAI_QUA_NGAN: tr("Bài quá ngắn để viết lại (cần ít nhất 15 từ).", "Texte trop court pour être réécrit (15 mots minimum).", "Too short to rewrite (at least 15 words)."),
  CHUA_CAU_HINH_KHOA: tr("Máy chủ chưa cấu hình AI. Đây là việc của quản trị viên.", "L'IA n'est pas configurée sur le serveur.", "AI is not configured on the server."),
}[ma] ?? tr("AI chưa viết được bài mẫu. Thử lại sau giây lát.", "L'IA n'a pas pu rédiger le modèle. Réessayez dans un instant.", "The AI couldn't write the model text. Try again shortly."));

/* Đánh dấu chỗ sửa NGAY TRONG bài mẫu (18/10, theo chủ dự án): tìm nguyên văn
 * `sua` trong ban_mau, không chồng lấn. Chỗ nào AI viết `sua` không khớp nguyên
 * văn thì chỉ còn ở danh sách bên dưới, không đoán vị trí. */
function danhDau(van, ds) {
  const doan = [];
  (ds || []).forEach((g, i) => {
    const s = (g?.sua || "").trim();
    if (!s) return;
    let tu = 0;
    while (tu <= van.length) {
      const k = van.indexOf(s, tu);
      if (k < 0) break;
      if (!doan.some((d) => k < d.cuoi && k + s.length > d.dau)) { doan.push({ dau: k, cuoi: k + s.length, i }); break; }
      tu = k + 1;
    }
  });
  doan.sort((a, b) => a.dau - b.dau);
  const kq = [];
  let p = 0;
  for (const d of doan) {
    if (d.dau > p) kq.push(van.slice(p, d.dau));
    kq.push({ chu: van.slice(d.dau, d.cuoi), i: d.i });
    p = d.cuoi;
  }
  if (p < van.length) kq.push(van.slice(p));
  return kq;
}

export default function BaiVietMau({ answerId }) {
  const [trangThai, setTrangThai] = useState("cho"); // cho | dang | xong | vip | loi
  const [kq, setKq] = useState(null);
  const [loi, setLoi] = useState("");
  const [hienGoc, setHienGoc] = useState(true);
  const [dangChon, setDangChon] = useState(-1);
  const chon = (i) => {
    setDangChon(i);
    document.getElementById(`vm-${answerId}-${i}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

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
        {kq.giai_thich?.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <button type="button" onClick={() => setHienGoc((v) => !v)}
              className="cursor-pointer rounded-full border border-solid border-line bg-surface px-3 py-1 font-sans text-xs font-bold text-ink hover:border-primary">
              {hienGoc ? tr("Ẩn chữ cũ (đọc bài sạch)", "Masquer l'ancien texte", "Hide old wording") : tr("Hiện chữ cũ bị sửa", "Afficher l'ancien texte", "Show old wording")}
            </button>
            <span className="text-soft">
              <span className="rounded bg-danger-soft px-1 text-danger line-through">{tr("chữ cũ", "ancien", "old")}</span>{" → "}
              <span className="rounded bg-ok-soft px-1 font-bold text-ok">{tr("chữ mới", "nouveau", "new")}</span>
              {" · "}{tr("bấm vào chỗ sửa để xem lý do", "cliquez pour voir pourquoi", "click a change to see why")}
            </span>
          </div>
        )}
        <div className="mt-2 whitespace-pre-wrap rounded-xl bg-surface2 p-3 text-sm leading-relaxed text-ink">
          {danhDau(kq.ban_mau, kq.giai_thich).map((m, k) => typeof m === "string" ? m : (
            <span key={k} role="button" tabIndex={0} onClick={() => chon(m.i)} onKeyDown={(e) => e.key === "Enter" && chon(m.i)}
              title={kq.giai_thich[m.i]?.ly_do || ""}
              className={`cursor-pointer rounded px-0.5 ${dangChon === m.i ? "ring-2 ring-primary" : ""}`}>
              {hienGoc && kq.giai_thich[m.i]?.goc && <span className="mr-1 rounded bg-danger-soft px-0.5 text-danger line-through">{kq.giai_thich[m.i].goc}</span>}
              <span className="rounded bg-ok-soft px-0.5 font-semibold text-ok">{m.chu}</span>
              <sup className="ml-0.5 text-[10px] font-extrabold text-primary">{m.i + 1}</sup>
            </span>
          ))}
        </div>
        {kq.giai_thich?.length > 0 && (
          <>
            <p className="m-0 mt-3 text-xs font-bold text-soft">{tr("Những chỗ đã nâng cấp", "Ce qui a été amélioré", "What was improved")}</p>
            <ul className="m-0 mt-1 list-none space-y-2 p-0">
              {kq.giai_thich.map((g, i) => (
                <li key={i} id={`vm-${answerId}-${i}`} onClick={() => setDangChon(i)}
                  className={`cursor-pointer rounded-xl p-2.5 text-sm ${dangChon === i ? "bg-primary-soft ring-2 ring-primary" : "bg-surface2"}`}>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-white">{i + 1}</span>
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
