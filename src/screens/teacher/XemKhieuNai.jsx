import React, { useEffect, useMemo, useState } from "react";
import { Scale, Check, RotateCcw, ChevronDown, Save, Loader2 } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { grilleToRubric } from "../../shared/grilleRubric.js";
import { BaiVietCoLoi, thangLuyen } from "../practice/LoiVietAI.jsx";
import { chuThuan } from "../../../supabase/functions/_shared/loiViet.js";

/* « Khiếu nại điểm AI » (06/11, giai đoạn 2 chấm AI, migration 196).
 *
 * Học sinh bấm « Tôi thấy điểm này chưa đúng » dưới phiếu AI chấm bài viết. Giáo viên đọc đề, bài
 * (lỗi AI tô sẵn), điểm AI từng tiêu chí, rồi:
 *   · « Giữ nguyên điểm AI »: AI đúng.
 *   · « Lưu điểm chấm lại »: điểm giáo viên từng tiêu chí. Bài thi thử thì điểm này THAY điểm AI.
 * Cả hai là dữ liệu có nhãn người chấm: `npm run check:chamai` dùng chúng để đo AI lệch bao nhiêu.
 *
 * Thang: bài luyện tập dùng thang DELF của trình độ (bỏ « fiche », như máy chủ); bài thi thử dùng
 * thang chuẩn của trình độ. Đề có thang giáo viên tự soạn thì tiêu chí lạ vẫn hiện bằng id, với
 * mức tối đa suy từ phiếu AI. */

const TRANG_THAI = {
  cho: () => [tr("Chờ xem", "À traiter", "Open"), "bg-warn-soft text-warn"],
  giu_nguyen: () => [tr("Giữ nguyên", "Confirmée", "Kept"), "bg-primary-soft text-primary"],
  da_cham_lai: () => [tr("Đã chấm lại", "Revue", "Re-marked"), "bg-ok-soft text-ok"],
};

function thangCua(r) {
  const goc = r.che_do === "exam" ? grilleToRubric(r.level || "B1") : thangLuyen(r.level || "B1");
  const theoId = new Map(goc.criteria.map((c) => [c.id, c]));
  const tc = r.ket_qua?.tieu_chi ?? {};
  return Object.keys(tc).map((id) => {
    const c = theoId.get(id);
    return c ? { id, name: c.name, name_fr: c.name_fr, max_score: c.max_score, step: c.step ?? 0.5 }
      : { id, name: id, name_fr: "", max_score: Math.max(Number(tc[id]?.diem) || 0, 1), step: 0.5 };
  });
}

function TheKhieuNai({ r, onXong }) {
  const thang = useMemo(() => thangCua(r), [r]);
  const ai = r.ket_qua?.tieu_chi ?? {};
  const [mo, setMo] = useState(r.trang_thai === "cho");
  const [diem, setDiem] = useState(() => Object.fromEntries(thang.map((c) => [c.id, r.diem_gv?.[c.id] ?? ai[c.id]?.diem ?? 0])));
  const [ghiChu, setGhiChu] = useState(r.ghi_chu_gv ?? "");
  const [dang, setDang] = useState("");
  const [loi, setLoi] = useState("");
  const [nhan, mau] = (TRANG_THAI[r.trang_thai] ?? TRANG_THAI.cho)();
  const tongGV = thang.reduce((n, c) => n + (Number(diem[c.id]) || 0), 0);
  const raw = typeof r.raw === "string" ? r.raw : r.raw == null ? "" : String(r.raw);
  const deBai = [chuThuan(r.consigne), chuThuan(r.prompt)].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join("\n");

  const luu = async (trangThai) => {
    setDang(trangThai); setLoi("");
    const { data, error } = await supabase.rpc("xu_ly_khieu_nai", {
      p_id: r.id, p_trang_thai: trangThai,
      p_diem: trangThai === "da_cham_lai" ? Object.fromEntries(thang.map((c) => [c.id, Number(diem[c.id]) || 0])) : null,
      p_thang: trangThai === "da_cham_lai" ? thang : null,
      p_ghi_chu: ghiChu.trim(),
    });
    setDang("");
    if (error || !data?.ok) { setLoi(error?.message ?? tr("Không lưu được.", "Enregistrement impossible.", "Could not save.")); return; }
    onXong();
  };

  return (
    <li className={`rounded-2xl border border-solid bg-surface ${r.trang_thai === "cho" ? "border-warn/40" : "border-line"}`}>
      <button type="button" onClick={() => setMo(!mo)} aria-expanded={mo}
        className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-start gap-3 border-0 bg-transparent p-4 text-left font-sans">
        <span className="grid min-w-0 gap-1">
          <span className="flex flex-wrap items-center gap-2 text-xs text-soft">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${mau}`}>{nhan}</span>
            <span className="font-bold text-ink">{r.hoc_sinh || tr("Học sinh", "Élève", "Student")}</span>
            <span>· {r.level} · {r.che_do === "exam" ? tr("Thi thử", "Examen blanc", "Mock exam") : tr("Luyện tập", "Entraînement", "Practice")}</span>
            <span>· {new Date(r.tao_luc).toLocaleString()}</span>
          </span>
          <span className="truncate text-sm font-bold text-ink">{r.tieu_de || tr("Bài viết", "Production écrite", "Writing")}</span>
          <span className="text-[13px] leading-relaxed text-ink">« {r.ly_do} »</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm font-extrabold tabular-nums text-ink">
          {r.trang_thai === "da_cham_lai" ? <>{r.ket_qua?.tong} → {Number(r.tong_gv)}</> : r.ket_qua?.tong}
          <span className="text-xs font-semibold text-soft">/{r.ket_qua?.tong_toi_da}</span>
          <ChevronDown size={16} className={`text-soft transition-transform ${mo ? "rotate-180" : ""}`} />
        </span>
      </button>

      {mo && (
        <div className="grid gap-4 border-0 border-t border-solid border-line p-4">
          {r.ket_qua?.cham_doi?.chua_chac && (
            <p className="m-0 rounded-xl bg-warn-soft px-3 py-2 text-xs text-ink">{tr("Máy chủ đã gắn cờ « điểm chưa chắc »: các lượt AI chấm lệch nhau", "Note signalée incertaine : corrections IA divergentes", "Flagged uncertain: AI markings disagreed")} ({(r.ket_qua.cham_doi.tong_cac_luot ?? []).join(" / ")}).</p>
          )}
          {deBai && (
            <div>
              <p className="m-0 mb-1.5 text-xs font-extrabold text-ink">{tr("Đề bài", "Consigne", "Task")}</p>
              <p lang="fr" className="m-0 whitespace-pre-line rounded-xl bg-surface2 p-3 text-[13px] leading-relaxed text-ink">{deBai}</p>
            </div>
          )}
          <div>
            <p className="m-0 mb-1.5 text-xs font-extrabold text-ink">{tr("Bài làm (lỗi AI tô sẵn)", "Copie (erreurs relevées par l'IA)", "Text (AI-flagged errors)")}</p>
            <BaiVietCoLoi baiLam={raw} loi={Array.isArray(r.ket_qua?.loi) ? r.ket_qua.loi : []} gon />
          </div>

          <div>
            <p className="m-0 mb-1.5 text-xs font-extrabold text-ink">{tr("Điểm từng tiêu chí", "Note par critère", "Score per criterion")}</p>
            <ul className="m-0 grid list-none gap-1.5 p-0">
              {thang.map((c) => {
                const t = ai[c.id] ?? {};
                const biBao = (r.tieu_chi ?? []).includes(c.id);
                return (
                  <li key={c.id} className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl px-3 py-2 ${biBao ? "bg-warn-soft" : "bg-surface2"}`}>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-ink">{c.name}</span>
                      {(t.can_cai_thien || t.nhan_xet) && <span className="block text-[11px] leading-snug text-soft">{t.can_cai_thien || t.nhan_xet}</span>}
                    </span>
                    <span className="text-xs tabular-nums text-soft">AI {t.diem ?? "?"}</span>
                    <label className="flex items-center gap-1 text-xs tabular-nums text-soft">
                      <input type="number" min={0} max={c.max_score} step={c.step} value={diem[c.id]}
                        onChange={(e) => setDiem((x) => ({ ...x, [c.id]: Math.min(c.max_score, Math.max(0, Number(e.target.value))) }))}
                        aria-label={`${c.name}, ${tr("điểm giáo viên", "note du professeur", "teacher score")}`}
                        className="w-16 rounded-lg border border-solid border-line bg-surface px-2 py-1 text-right font-sans text-sm font-bold text-ink" />
                      /{c.max_score}
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="m-0 mt-2 text-right text-sm font-extrabold tabular-nums text-ink">{tr("Tổng giáo viên", "Total professeur", "Teacher total")}: {tongGV}</p>
          </div>

          <label className="grid gap-1.5">
            <span className="text-xs font-extrabold text-ink">{tr("Ghi chú cho học sinh (không bắt buộc)", "Message à l'élève (facultatif)", "Note to the student (optional)")}</span>
            <textarea value={ghiChu} onChange={(e) => setGhiChu(e.target.value.slice(0, 1000))} rows={2}
              className="w-full resize-y rounded-xl border border-solid border-line bg-surface2 p-2.5 font-sans text-[13px] text-ink" />
          </label>
          {r.che_do === "exam" && <p className="m-0 text-[11px] text-soft">{tr("Bài thi thử: « Lưu điểm chấm lại » sẽ thay điểm AI bằng điểm của bạn.", "Examen blanc : votre note remplacera celle de l'IA.", "Mock exam: your score will replace the AI score.")}</p>}
          {loi && <p className="m-0 rounded-xl bg-danger-soft p-2.5 text-xs text-danger">{loi}</p>}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => luu("da_cham_lai")} disabled={!!dang}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-4 py-2 font-sans text-xs font-extrabold text-on-primary disabled:opacity-60">
              {dang === "da_cham_lai" ? <Loader2 size={14} className="mcf-spin" /> : <Save size={14} />} {tr("Lưu điểm chấm lại", "Enregistrer ma note", "Save my score")}
            </button>
            <button type="button" onClick={() => luu("giu_nguyen")} disabled={!!dang}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-surface2 px-4 py-2 font-sans text-xs font-bold text-ink disabled:opacity-60">
              <Check size={14} /> {tr("Giữ nguyên điểm AI", "Confirmer la note de l'IA", "Keep the AI score")}
            </button>
            {r.trang_thai !== "cho" && (
              <button type="button" onClick={() => luu("cho")} disabled={!!dang}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-solid border-line bg-surface px-4 py-2 font-sans text-xs font-bold text-ink disabled:opacity-60">
                <RotateCcw size={14} /> {tr("Mở lại", "Rouvrir", "Reopen")}
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

/* `thu`: danh sách dựng sẵn cho /preview.html (không gọi mạng). */
export default function XemKhieuNai({ thu }) {
  const [ds, setDs] = useState(thu ?? null);
  const [loi, setLoi] = useState("");
  const [loc, setLoc] = useState("cho");   // cho | xong | tat

  const tai = async () => {
    if (thu) return;
    const { data, error } = await supabase.rpc("ds_khieu_nai", { p_trang_thai: null });
    if (error) { setLoi(error.message); setDs([]); return; }
    setLoi(""); setDs(data ?? []);
  };
  useEffect(() => { tai(); }, []);

  const hien = (ds ?? []).filter((r) => (loc === "tat" ? true : loc === "cho" ? r.trang_thai === "cho" : r.trang_thai !== "cho"));
  const soCho = (ds ?? []).filter((r) => r.trang_thai === "cho").length;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      <h1 className="m-0 flex items-center gap-2 text-2xl font-extrabold text-ink"><Scale size={22} className="text-primary" /> {tr("Khiếu nại điểm AI", "Contestations de notes IA", "AI score appeals")}</h1>
      <p className="m-0 mt-1 text-sm text-soft">{tr("Học sinh thấy điểm AI chấm bài viết chưa đúng. Đọc bài, chấm lại từng tiêu chí hoặc giữ nguyên điểm AI. Mỗi bài bạn xem lại giúp đo độ chính xác của AI.", "Élèves contestant une note de l'IA. Relisez, notez critère par critère ou confirmez. Chaque relecture sert à mesurer la fiabilité de l'IA.", "Students disputing an AI writing score. Review, re-mark per criterion or confirm. Each review helps measure AI accuracy.")}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {[["cho", tr(`Chờ xem (${soCho})`, `À traiter (${soCho})`, `Open (${soCho})`)], ["xong", tr("Đã xử lý", "Traitées", "Handled")], ["tat", tr("Tất cả", "Toutes", "All")]].map(([k, t]) => (
          <button key={k} type="button" onClick={() => setLoc(k)}
            className={`cursor-pointer rounded-full border-0 px-4 py-1.5 font-sans text-sm font-bold ${loc === k ? "bg-primary text-on-primary" : "bg-surface2 text-ink"}`}>{t}</button>
        ))}
      </div>

      {loi && <p className="m-0 mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger">{loi}</p>}
      {ds === null ? <p className="m-0 mt-6 text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
        : hien.length === 0 ? <p className="m-0 mt-6 rounded-2xl bg-surface p-6 text-center text-sm text-soft">{tr("Không có khiếu nại nào ở mục này.", "Aucune contestation ici.", "No appeals here.")}</p>
        : (
          <ul className="m-0 mt-5 grid list-none gap-3 p-0">
            {hien.map((r) => <TheKhieuNai key={`${r.id}-${r.trang_thai}`} r={r} onXong={tai} />)}
          </ul>
        )}
    </div>
  );
}
