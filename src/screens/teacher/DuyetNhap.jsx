import React, { useEffect, useMemo, useState } from "react";
import { FileCheck2, ChevronDown, ChevronUp, Check, Loader2, Rocket, BookOpen } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { loadAssignments } from "../../shared/exerciseStore.js";
import { LEVEL_COLORS } from "../../shared/tokens.js";
import { useT } from "../../shared/i18n.jsx";

/* Duyệt bài nháp (02/10) — /professeur/duyet-nhap.
 *
 * Nháp do scripts/nhap/ soạn sẵn: kho 'assignment', tiêu đề « [NHÁP] … »,
 * giao cho người nhận giả `__nhap__` nên học sinh không thấy.
 *
 * Màn này cho giáo viên ĐỌC TRỌN một bài — ngữ liệu, câu hỏi, đáp án tô xanh,
 * lời giải — rồi bấm « Xuất bản ». Xuất bản là RPC `xuat_ban_nhap` (113): một
 * lệnh UPDATE, không đi qua saveExercise (lối đó xoá rồi chèn lại câu hỏi).
 * Máy chủ trả biên nhận; chỉ khi biên nhận nói `store = practice` thì bài mới
 * rời danh sách.
 *
 * Đáp án đọc được ở đây vì loadAssignments() với vai giáo viên gọi
 * get_answer_keys (040). Thiếu đáp án (RPC hỏng) thì màn hình NÓI RA, vì
 * duyệt một bài mà không thấy đáp án là duyệt mù.
 *
 * Muốn SỬA câu chữ thì mở bài trong Thư viện bài tập — màn này chỉ đọc và
 * xuất bản, không dựng lại trình soạn thứ hai. */

const THU_TU = ["A1", "A2", "B1", "B2", "B2+", "C1"];

export default function DuyetNhap() {
  const t = useT();
  const [ds, setDs] = useState(null);       // null = đang tải, false = lỗi
  const [mo, setMo] = useState(null);
  const [dang, setDang] = useState({});
  const [baoLoi, setBaoLoi] = useState("");
  const [vuaXong, setVuaXong] = useState([]);

  useEffect(() => {
    loadAssignments().then((bai) => {
      if (!Array.isArray(bai)) { setDs(false); return; }
      setDs(bai.filter((b) => String(b.title || "").startsWith("[NHÁP]")));
    }).catch(() => setDs(false));
  }, []);

  const theoCap = useMemo(() => {
    const m = new Map();
    for (const b of ds || []) {
      const c = b.level || "?";
      if (!m.has(c)) m.set(c, []);
      m.get(c).push(b);
    }
    return [...m.entries()].sort((a, b) => {
      const ia = THU_TU.indexOf(a[0]), ib = THU_TU.indexOf(b[0]);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
  }, [ds]);

  const xuatBan = async (b) => {
    if (dang[b.id]) return;
    setDang((d) => ({ ...d, [b.id]: true })); setBaoLoi("");
    const { data, error } = await supabase.rpc("xuat_ban_nhap", { p_id: String(b.id) });
    setDang((d) => ({ ...d, [b.id]: false }));
    if (error || !data?.ok || data.store !== "practice") {
      setBaoLoi(t("drafts.err", { msg: error?.message || data?.loi || "?" }));
      return;
    }
    setDs((x) => x.filter((y) => y.id !== b.id));
    setVuaXong((v) => [data.title, ...v]);
    if (mo === b.id) setMo(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 font-sans">
      <header className="mb-5">
        <h1 className="m-0 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink">
          <FileCheck2 size={24} className="text-primary" />{t("nav.drafts")}
        </h1>
        <p className="m-0 mt-1 text-sm text-soft">{t("drafts.subtitle")}</p>
      </header>

      {vuaXong.length > 0 && (
        <div className="mb-4 rounded-2xl bg-ok-soft px-4 py-3 text-sm text-ink" role="status">
          <strong>{t("drafts.published_n", { n: vuaXong.length })}</strong> {vuaXong.slice(0, 3).join(" · ")}{vuaXong.length > 3 ? " …" : ""}
        </div>
      )}
      {baoLoi && <p className="mb-4 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger" role="alert">{baoLoi}</p>}

      {ds === null ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface2" />)}</div>
      ) : ds === false ? (
        <p className="text-sm text-danger">{t("drafts.load_error")}</p>
      ) : !ds.length ? (
        <div className="py-16 text-center">
          <Check size={36} className="mx-auto text-ok" />
          <p className="m-0 mt-3 font-bold text-ink">{t("drafts.empty")}</p>
        </div>
      ) : theoCap.map(([cap, bai]) => (
        <section key={cap} className="mb-6">
          <h2 className="m-0 mb-2 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-soft">
            <span className="rounded-full px-2.5 py-0.5 text-xs text-white" style={{ backgroundColor: LEVEL_COLORS[cap] || "#64748b" }}>{cap}</span>
            {t("drafts.count", { n: bai.length })}
          </h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {bai.map((b) => (
              <li key={b.id} className="overflow-hidden rounded-2xl border border-solid border-line bg-surface">
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <button type="button" onClick={() => setMo(mo === b.id ? null : b.id)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left font-sans">
                    {mo === b.id ? <ChevronUp size={18} className="shrink-0 text-soft" /> : <ChevronDown size={18} className="shrink-0 text-soft" />}
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-ink">{b.title.replace(/^\[NHÁP\]\s*/, "")}</span>
                      <span className="block text-xs text-soft">
                        {(b.skills || []).join(" · ")} · {t("drafts.q_count", { n: b.questions?.length || 0 })}
                        {b.readingText ? ` · ${t("drafts.has_text")}` : ""}
                      </span>
                    </span>
                  </button>
                  <button type="button" onClick={() => xuatBan(b)} disabled={!!dang[b.id]}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-4 py-2 font-sans text-sm font-bold text-on-primary hover:opacity-90 disabled:cursor-wait disabled:opacity-70">
                    {dang[b.id] ? <Loader2 size={15} className="animate-spin" /> : <Rocket size={15} />}{t("drafts.publish")}
                  </button>
                </div>
                {mo === b.id && <XemBai b={b} t={t} />}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* Xem trọn một bài: ngữ liệu, câu hỏi, đáp án tô xanh, lời giải. */
function XemBai({ b, t }) {
  const thieuDapAn = (b.questions || []).some((q) =>
    (q.type === "qcm" && q.answer === undefined) || (q.type === "fill" && !q.accepted && q.answer === undefined));
  return (
    <div className="border-0 border-t border-solid border-line bg-surface2/40 p-4">
      {thieuDapAn && <p className="m-0 mb-3 rounded-xl bg-warn-soft px-3 py-2 text-sm font-semibold text-ink">{t("drafts.no_keys")}</p>}
      {/* consigne có thể là HTML từ trình soạn (giống ExamMode) — dựng dạng chữ
          thô sẽ in ra thẻ <p> nguyên văn. */}
      {b.consigne && <div className="mb-3 text-sm italic text-soft" dangerouslySetInnerHTML={{ __html: b.consigne }} />}
      {b.readingText && (
        <div className="mb-4 rounded-xl border border-solid border-line bg-surface p-4 text-sm leading-relaxed text-ink">
          <p className="m-0 mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-soft"><BookOpen size={13} />{t("drafts.text")}</p>
          {/* Ngữ liệu do chính dự án soạn (scripts/nhap), chỉ giáo viên thấy màn này. */}
          <div lang="fr" dangerouslySetInnerHTML={{ __html: b.readingText }} />
        </div>
      )}
      <ol className="m-0 flex flex-col gap-3 pl-5">
        {(b.questions || []).map((q) => (
          <li key={q.id} className="text-sm text-ink">
            <p className="m-0 font-semibold" lang="fr">{q.prompt}</p>
            {q.type === "qcm" ? (
              <ul className="m-0 mt-1 flex list-none flex-wrap gap-1.5 p-0">
                {(q.options || []).map((o, i) => (
                  <li key={i} className={`rounded-lg px-2.5 py-1 text-xs ${i === q.answer ? "bg-ok-soft font-bold text-ok" : "bg-surface text-soft"}`}>
                    {i === q.answer && <Check size={11} className="mr-1 inline" />}{o}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 mt-1 text-xs"><span className="rounded-lg bg-ok-soft px-2.5 py-1 font-bold text-ok">{String(q.accepted ?? q.answer ?? "—").split("|").join(" / ")}</span></p>
            )}
            {q.explanation && <p className="m-0 mt-1 text-xs text-soft">{q.explanation}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
