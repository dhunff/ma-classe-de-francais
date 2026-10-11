import React, { useEffect, useMemo, useState } from "react";
import { Mic, Sparkles, Loader2, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { dsBaiNoi, duongNghe } from "../../shared/baiNoi.js";
import { GRILLE_PO, mucCuaTieuChi } from "../../../supabase/functions/_shared/grillePO.js";
import { tr } from "../../shared/i18n.jsx";

/* Tự chấm Production orale (12/10, migration 135).
 *
 * Học sinh nghe lại bản ghi của chính mình rồi chọn MỘT mức cho từng tiêu chí
 * của grille PO chính thức (France Éducation international). AI gợi ý mức cho
 * từng tiêu chí (Edge Function cham-po) nhưng KHÔNG tự điền: phải bấm « dùng »
 * — cùng lý do với PE: giá trị nằm ở lần nghe lại qua mắt giám khảo.
 *
 * Máy chủ tự cộng (luu_po_tu_cham) và từ chối giá trị không có trên grille,
 * nên con số trên màn hình là con số đã lưu, không phải phép cộng ở client. */
export default function POSelfEvaluation({ po, exerciseId, consigne, onXong }) {
  const grille = GRILLE_PO[po.cap];
  const [bang, setBang] = useState(() => ({ ...(po.tuCham ?? {}) }));
  const [banGhi, setBanGhi] = useState(null);
  const [ai, setAi] = useState(po.aiGoiY ?? null);
  const [aiTT, setAiTT] = useState(null);
  const [luu, setLuu] = useState(null);

  useEffect(() => {
    dsBaiNoi({ examId: po.examId, exerciseId }).then(async (ds) => {
      const moi = ds[0];
      setBanGhi(moi ? { ...moi, url: await duongNghe(moi.duongDan) } : false);
    });
  }, [po.examId, exerciseId]);

  const tong = useMemo(() => grille.criteres.reduce((n, c) => n + (Number(bang[c.id]) || 0), 0), [bang, grille]);
  const du = grille.criteres.every((c) => bang[c.id] != null);

  const xinAI = async () => {
    setAiTT("dang");
    const { data, error } = await supabase.functions.invoke("cham-po", { body: { attemptId: po.attemptId } });
    let kq = data;
    if (error && error.context?.json) kq = await error.context.json().catch(() => null);
    if (kq?.ok) { setAi(kq.goi_y); setAiTT(null); } else setAiTT(kq?.ma || "loi");
  };

  const ghi = async () => {
    setLuu("dang");
    const { data, error } = await supabase.rpc("luu_po_tu_cham", { p_attempt: po.attemptId, p_bang: bang });
    if (error || !data?.ok) { setLuu(error?.message || "loi"); return; }
    setLuu({ diem: Number(data.diem) });
    setTimeout(() => onXong?.(), 900);
  };

  const LOI_AI = {
    HET_LUOT: tr("Hết lượt AI gợi ý hôm nay (6 lượt / 24 giờ). VIP không giới hạn.", "Plus de suggestions IA aujourd'hui (6 / 24 h).", "No AI suggestions left today (6 per 24 h)."),
    CHUA_CO_BAN_GHI: tr("Chưa có bản ghi âm nào cho phần nói này.", "Aucun enregistrement pour cet oral.", "No recording for this speaking part."),
    KHONG_NGHE_RO: tr("AI không nghe ra lời nói nào trong bản ghi.", "L'IA n'entend aucune parole.", "The AI couldn't hear any speech."),
    DINH_DANG_KHONG_HO_TRO: tr("Định dạng ghi âm này (thường từ Firefox) AI chưa đọc được.", "Format non pris en charge.", "Unsupported recording format."),
    CHUA_CAU_HINH_KHOA: tr("Máy chủ chưa có khoá AI: việc của người quản trị.", "Clé IA absente côté serveur.", "AI key missing on the server."),
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      {/* ── Cột trái: đề + bản ghi + chép lời ── */}
      <div className="grid content-start gap-4 lg:sticky lg:top-4">
        <div className="rounded-3xl border border-solid border-line bg-surface p-5">
          <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-ink"><Mic size={18} className="text-primary" /> {tr("Bài nói của bạn", "Votre production orale", "Your speaking")} · {po.cap}</h2>
          {banGhi === null && <p className="m-0 mt-3 text-sm text-soft"><Loader2 size={14} className="inline animate-spin" /> {tr("Đang tìm bản ghi…", "Recherche de l'enregistrement…", "Finding the recording…")}</p>}
          {banGhi === false && <p className="m-0 mt-3 rounded-xl bg-warn-soft p-3 text-sm font-semibold text-warn">{tr("Không thấy bản ghi âm nào. Bạn vẫn tự chấm được nếu nhớ bài nói của mình, nhưng nên ghi lại ở lần thi sau.", "Aucun enregistrement trouvé.", "No recording found.")}</p>}
          {banGhi?.url && <audio controls src={banGhi.url} className="mt-3 w-full" />}
          {consigne && <details className="mt-3"><summary className="cursor-pointer text-sm font-bold text-ink">{tr("Đề bài", "Sujet", "Task")}</summary>
            <div className="mt-2 text-sm leading-relaxed text-ink [&_p]:m-0 [&_p+p]:mt-2" dangerouslySetInnerHTML={{ __html: consigne }} /></details>}
        </div>

        <div className="rounded-3xl border border-solid border-line bg-surface p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <h3 className="m-0 flex-1 text-base font-extrabold text-ink">{tr("AI gợi ý điểm", "Suggestions de l'IA", "AI suggestions")}</h3>
            {!ai && <button type="button" onClick={xinAI} disabled={aiTT === "dang"}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-3 py-2 font-sans text-xs font-extrabold text-white disabled:opacity-50">
              {aiTT === "dang" ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} {tr("Nhờ AI gợi ý", "Demander à l'IA", "Ask the AI")}</button>}
          </div>
          <p className="m-0 mt-2 flex items-start gap-1.5 text-xs text-soft"><Info size={13} className="mt-0.5 shrink-0" /> {tr("AI chỉ đọc bản chép lời: không nghe được ngữ điệu và không có giám khảo đối thoại, nên đây chỉ là gợi ý. Điểm tính là điểm BẠN chọn.", "L'IA ne lit que la transcription : simple suggestion. La note retenue est la vôtre.", "The AI only reads the transcript: it's just a suggestion. Your choice is what counts.")}</p>
          {aiTT && aiTT !== "dang" && <p className="m-0 mt-2 text-sm font-bold text-danger">{LOI_AI[aiTT] ?? tr("AI chưa gợi ý được, thử lại sau.", "Échec de l'IA, réessayez.", "AI failed, try again.")}</p>}
          {ai && (
            <>
              {ai.tong_quat && <p className="m-0 mt-3 text-sm leading-relaxed text-ink">{ai.tong_quat}</p>}
              {ai.chep_loi && <details className="mt-3"><summary className="cursor-pointer text-xs font-bold text-soft">{tr("Bản chép lời", "Transcription", "Transcript")}</summary>
                <p lang="fr" className="m-0 mt-2 whitespace-pre-line rounded-xl bg-surface2 p-3 text-sm text-ink">{ai.chep_loi}</p></details>}
            </>
          )}
        </div>
      </div>

      {/* ── Cột phải: grille ── */}
      <div className="rounded-3xl border border-solid border-line bg-surface p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="m-0 text-lg font-extrabold text-ink">{tr("Thang chấm Production orale", "Grille d'évaluation de la production orale", "Speaking grid")} {po.cap}</h2>
          <span className="text-2xl font-extrabold tabular-nums text-primary">{String(tong).replace(".", ",")}<span className="text-base text-soft">/25</span></span>
        </div>
        <p className="m-0 mt-1 text-xs text-soft">{tr("Theo grille chính thức của France Éducation international. Chọn một mức cho mỗi tiêu chí.", "Grille officielle de France Éducation international. Une note par critère.", "Official France Éducation international grid. One level per criterion.")}</p>

        <div className="mt-4 grid gap-4">
          {grille.criteres.map((c, i) => {
            const goiY = ai?.diem?.[c.id];
            const nhomMoi = i === 0 || grille.criteres[i - 1].nhom !== c.nhom;
            return (
              <div key={c.id}>
                {nhomMoi && <p className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-wide text-soft">{c.nhom}</p>}
                <div className={`rounded-2xl border border-solid p-3 ${bang[c.id] != null ? "border-line" : "border-warn"}`}>
                  <p lang="fr" className="m-0 text-sm font-bold text-ink">{c.label}</p>
                  <p className="m-0 mt-0.5 text-xs text-soft">{c.vi} · /{c.max}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {mucCuaTieuChi(po.cap, c).map((m) => (
                      <button key={m.v} type="button" title={m.fr ? `${m.fr} · ${m.vi}` : undefined}
                        onClick={() => setBang((b) => ({ ...b, [c.id]: m.v }))}
                        className={`cursor-pointer rounded-xl border border-solid px-3 py-1.5 text-left font-sans text-xs font-bold tabular-nums ${bang[c.id] === m.v ? "border-primary bg-primary text-white" : goiY === m.v ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-ink hover:border-primary"}`}>
                        {String(m.v).replace(".", ",")}{m.vi && <span className="ml-1 font-normal">{m.vi}</span>}
                      </button>
                    ))}
                  </div>
                  {goiY != null && (
                    <p className="m-0 mt-2 flex flex-wrap items-center gap-2 text-xs text-ink">
                      <Sparkles size={12} className="text-primary" /> AI: <strong>{String(goiY).replace(".", ",")}</strong>
                      {ai.ly_do?.[c.id] && <span className="text-soft">{ai.ly_do[c.id]}</span>}
                      {bang[c.id] !== goiY && <button type="button" onClick={() => setBang((b) => ({ ...b, [c.id]: goiY }))}
                        className="cursor-pointer rounded-lg border-0 bg-primary-soft px-2 py-1 font-sans text-xs font-bold text-primary">{tr("dùng số này", "utiliser", "use this")}</button>}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {typeof luu === "string" && luu !== "dang" && <p className="m-0 mt-4 flex items-center gap-2 text-sm font-bold text-danger"><AlertTriangle size={15} /> {tr("Không lưu được", "Échec de l'enregistrement", "Couldn't save")}: {luu}</p>}
        {luu?.diem != null ? (
          <p className="m-0 mt-4 flex items-center gap-2 rounded-2xl bg-ok-soft p-3 text-sm font-bold text-ok"><CheckCircle2 size={16} /> {tr("Đã lưu", "Enregistré", "Saved")}: {String(luu.diem).replace(".", ",")}/25</p>
        ) : (
          <button type="button" onClick={ghi} disabled={!du || luu === "dang"}
            className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 bg-primary px-5 py-3 font-sans text-sm font-extrabold text-white disabled:opacity-40">
            {luu === "dang" ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {du ? tr(`Lưu điểm phần nói: ${String(tong).replace(".", ",")}/25`, `Enregistrer : ${tong}/25`, `Save: ${tong}/25`) : tr("Chọn đủ mức cho mọi tiêu chí", "Notez tous les critères", "Rate every criterion")}
          </button>
        )}
      </div>
    </div>
  );
}
