import React, { useEffect, useState } from "react";
import { ClipboardCheck, BookOpen, Save, ChevronDown, ChevronUp, Info } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { GRILLE } from "../exam/delfGrille.js";

/* Tự chấm bài viết theo tiêu chí DELF.
 *
 * ══ VÌ SAO TỰ CHẤM, KHÔNG PHẢI MÁY CHẤM ══
 *
 * Giá trị không nằm ở con số. Nó nằm ở chỗ người học phải đọc lại bài mình
 * MỘT LẦN NỮA, lần này qua mắt của người chấm: "cohérence et cohésion — mình
 * có dùng connecteur nào không, hay toàn 'et' với 'après'?". Một con số ai đó
 * đưa cho không bắt ai làm việc đó.
 *
 * Nên giao diện này cố ý CHẬM: từng tiêu chí một, có mô tả, có bài mẫu để đối
 * chiếu. Nếu chỉ cần một con số thì đã có ô nhập tổng và xong trong ba giây —
 * và học được đúng bằng không.
 *
 * ══ BÀI MẪU CHỈ HIỆN SAU KHI NỘP ══
 *
 * Nằm ở `questions.answer_key.model`, mà cột đó không cấp SELECT cho trình
 * duyệt. RPC `get_model_answer` (migration 030) mở đúng một khe: đã nộp câu đó
 * thì đọc được. Thấy bài mẫu trước khi làm thì bài viết không đo được gì nữa.
 */

function TieuChi({ c, gia, onChange }) {
  /* Nút bấm chứ không phải thanh trượt: thang DELF là các nấc nửa điểm rời
     rạc, và thanh trượt gợi ý một sự chính xác không có thật. */
  const nac = [];
  for (let v = 0; v <= c.max; v += 0.5) nac.push(v);

  return (
    <li className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-ink">{c.label}</span>
        <span className="text-xs font-bold tabular-nums text-soft">
          {gia == null ? "—" : gia}/{c.max}
        </span>
      </div>
      <p className="m-0 mt-1 text-xs leading-relaxed text-soft">{c.aide}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {nac.map((v) => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`min-w-9 rounded-full border-0 px-2.5 py-1 text-xs font-bold tabular-nums transition ${
              gia === v ? "bg-primary text-white" : "bg-surface2 text-soft hover:text-ink"}`}>
            {v}
          </button>
        ))}
      </div>
    </li>
  );
}

export default function SelfAssess({ answerId, level, baiLam, deBai, questionId, daCo, onXong }) {
  const grille = GRILLE[level] ?? GRILLE.B1;
  const max = grille.criteres.reduce((n, c) => n + c.max, 0);

  const [diem, setDiem] = useState(() => {
    const d = {};
    for (const c of grille.criteres) d[c.id] = daCo?.[c.id]?.note ?? null;
    return d;
  });
  const [baiMau, setBaiMau] = useState(null);      // null = chưa xin
  const [moMau, setMoMau] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");

  const daCham = Object.values(diem).filter((v) => v != null).length;
  const xong = daCham === grille.criteres.length;
  const tong = Math.round(
    Object.values(diem).reduce((n, v) => n + (Number(v) || 0), 0) * 2) / 2;

  /* Bài mẫu tải khi người dùng MỞ, không tải sẵn. Tải sẵn thì nó nằm trong
     bộ nhớ trang ngay lúc học sinh chưa muốn xem — và mở DevTools là thấy. */
  const xinBaiMau = async () => {
    setMoMau((v) => !v);
    if (baiMau !== null) return;
    const { data, error } = await supabase.rpc("get_model_answer", { p_question: questionId });
    if (error) { setBaiMau(""); return; }
    setBaiMau(String(data ?? ""));
  };

  const luu = async () => {
    setDangLuu(true); setLoi("");
    const breakdown = {};
    for (const c of grille.criteres) {
      breakdown[c.id] = { note: diem[c.id], max: c.max, label: c.label };
    }
    const { data, error } = await supabase.rpc("save_self_assessment", {
      p_answer: answerId, p_score: tong, p_max: max, p_breakdown: breakdown,
    });
    setDangLuu(false);
    if (error || !data?.ok) {
      setLoi("Không lưu được: " + (data?.reason ?? error?.message ?? "lỗi không rõ"));
      return;
    }
    onXong?.(tong, breakdown);
  };

  return (
    <div className="mt-3 rounded-2xl border border-line bg-surface2 p-4">
      <div className="flex items-center gap-2">
        <ClipboardCheck size={15} className="text-primary" />
        <span className="text-sm font-bold text-ink">Tự chấm bài viết</span>
        <span className="ml-auto text-xs font-bold tabular-nums text-ink">
          {tong}/{max}
          {!xong && <span className="ml-1 font-normal text-warn">({daCham}/{grille.criteres.length} tiêu chí)</span>}
        </span>
      </div>

      {/* A1/A2 là thang phỏng theo — nói ra, đừng để người học tưởng đây là
          điểm chính thức của kỳ thi. */}
      {grille.adapted && (
        <p className="m-0 mt-2 flex items-start gap-2 text-xs text-soft">
          <Info size={12} className="mt-0.5 shrink-0" />
          Thang {level} ở đây là bản phỏng theo, quy về 25 điểm. Đề thi thật chia
          phần viết thành hai bài tập với thang riêng.
        </p>
      )}

      <p className="m-0 mt-3 rounded-xl bg-surface p-3 text-xs italic leading-relaxed text-soft">
        <strong className="not-italic text-ink">Đề: </strong>{deBai || "(không có đề)"}
      </p>

      <div className="mt-3 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-bg p-3 text-sm leading-relaxed text-ink">
        {String(baiLam ?? "").trim() || <span className="italic text-soft">(bạn nộp bài trống)</span>}
      </div>

      <ul className="m-0 mt-4 list-none space-y-2 p-0">
        {grille.criteres.map((c) => (
          <TieuChi key={c.id} c={c} gia={diem[c.id]}
            onChange={(v) => setDiem((p) => ({ ...p, [c.id]: v }))} />
        ))}
      </ul>

      {/* Bài mẫu đặt SAU phần chấm, không phải trước. Đọc bài mẫu trước rồi mới
          chấm thì người ta chấm bài mẫu chứ không chấm bài mình. */}
      <button type="button" onClick={xinBaiMau}
        className="mt-4 inline-flex items-center gap-2 rounded-full border-0 bg-surface px-4 py-2 text-sm font-semibold text-ink">
        <BookOpen size={14} />
        {moMau ? "Ẩn bài mẫu" : "Xem bài mẫu tham khảo"}
        {moMau ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {moMau && (
        <div className="mt-2 whitespace-pre-wrap rounded-xl border border-line bg-bg p-4 text-sm leading-relaxed text-ink">
          {baiMau === null
            ? <span className="text-soft">Đang tải…</span>
            : baiMau.trim()
              ? baiMau
              : <span className="italic text-soft">Đề này chưa có bài mẫu. Hãy hỏi giáo viên.</span>}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={luu} disabled={!xong || dangLuu}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
          <Save size={15} /> {dangLuu ? "Đang lưu…" : "Lưu bản tự chấm"}
        </button>
        {!xong && (
          <span className="text-xs text-soft">Chấm đủ {grille.criteres.length} tiêu chí rồi mới lưu được.</span>
        )}
      </div>

      {loi && <p className="m-0 mt-2 text-xs font-semibold text-danger">{loi}</p>}
    </div>
  );
}
