import React, { useEffect, useMemo, useRef, useState } from "react";
import { Timer, ShieldCheck, AlertTriangle, CheckCircle2, Clock, FileText } from "lucide-react";
import { loadPractice } from "../../shared/exerciseStore.js";
import { gradeRemote } from "../../shared/gradeRemote.js";
import { EXAM_STRUCTURE, assemblePaper, sectionScore, verdict, NGUONG_PHAN, NGUONG_TONG }
  from "./examPaper.js";

/* Mode Examen — thi thử có tính giờ.
 *
 * ══ NGUYÊN TẮC KHÔNG ĐƯỢC PHÁ ══
 *
 * **Không hiện đúng/sai trong lúc thi.** Toàn bộ giá trị của bài thi thử nằm ở
 * chỗ nó mô phỏng áp lực: bạn phải quyết định mà không biết mình đúng hay sai,
 * đúng như phòng thi thật. Hiện phản hồi ngay là biến nó thành bài luyện tập,
 * và khi đó con số cuối cùng không dự đoán được gì.
 *
 * Hệ quả trong mã: màn hình làm bài KHÔNG gọi bộ chấm, không import `fillOk`,
 * không biết đáp án. Nó chỉ thu câu trả lời. Việc chấm xảy ra đúng một lần,
 * sau khi nộp, ở Edge Function — và từ migration 022, client cũng không còn
 * cách nào biết đáp án kể cả muốn.
 *
 * ══ VÌ SAO ĐIỂM PHẢI QUY ĐỔI ══
 *
 * Bài trong thư viện có 7, 8, 15 câu tuỳ bài; DELF chấm mỗi phần trên 25. Phép
 * quy đổi nằm ở examPaper.js và có bộ kiểm riêng (`npm run check:exam`).
 */

const hai = (n) => String(n).padStart(2, "0");
const dongHo = (giay) => `${hai(Math.floor(giay / 60))}:${hai(Math.max(0, giay % 60))}`;

/* ─────────────────────────── Màn chờ ─────────────────────────── */

function ManCho({ level, setLevel, paper, onStart, dangTai }) {
  const cauTruc = EXAM_STRUCTURE[level] ?? [];
  const tongPhut = cauTruc.reduce((n, p) => n + p.minutes, 0);
  const [sanSang, setSanSang] = useState(false);

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="m-0 text-2xl font-extrabold text-ink">Thi thử DELF</h1>
      <p className="m-0 mt-2 text-sm text-soft">
        Một lần duy nhất, có tính giờ, không xem đáp án giữa chừng.
      </p>

      <div className="mt-6 flex gap-2">
        {Object.keys(EXAM_STRUCTURE).map((lv) => (
          <button key={lv} type="button" onClick={() => setLevel(lv)}
            className={`rounded-full border-0 px-5 py-2 text-sm font-bold transition ${
              lv === level ? "bg-primary text-white" : "bg-surface2 text-soft hover:text-ink"}`}>
            {lv}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface2 text-left text-xs uppercase tracking-wide text-soft">
              <th className="p-3 font-bold">Phần</th>
              <th className="p-3 font-bold">Thời gian</th>
              <th className="p-3 font-bold">Điểm</th>
              <th className="p-3 font-bold">Bài</th>
            </tr>
          </thead>
          <tbody>
            {cauTruc.map((p) => {
              const co = paper?.sections.find((s) => s.code === p.code);
              return (
                <tr key={p.code} className="border-t border-line">
                  <td className="p-3 font-bold text-ink">{p.code}
                    <span className="ml-2 font-normal text-soft">{p.label}</span></td>
                  <td className="p-3 text-ink">{p.minutes}′</td>
                  <td className="p-3 text-ink">/{p.points}</td>
                  <td className="p-3">
                    {co
                      ? <span className="text-soft">{co.exercise.title.slice(0, 34)}</span>
                      : <span className="font-bold text-danger">chưa có bài</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phần nói KHÔNG có, và phải nói ra. Nó là 25/100 của kỳ thi thật; im
          lặng ở đây là để học sinh tưởng điểm thi thử dự đoán được điểm thật. */}
      <p className="m-0 mt-4 flex items-start gap-2 rounded-xl bg-surface2 p-3 text-xs text-soft">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>
          Đề này <strong className="text-ink">không có phần thi nói (PO)</strong>, vốn chiếm
          25/100 điểm kỳ thi thật. Kết quả dưới đây chỉ phản ánh ba phần còn lại.
        </span>
      </p>

      {paper?.missing?.length > 0 && (
        <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-dangerSoft p-3 text-xs text-ink">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" />
          <span>
            Thư viện chưa có bài {level} cho{" "}
            <strong>{paper.missing.map((m) => m.label).join(", ")}</strong>. Đề thi sẽ thiếu
            phần đó, nên tổng điểm không so được với thang /100.
          </span>
        </p>
      )}

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-ink">
        <input type="checkbox" checked={sanSang} onChange={(e) => setSanSang(e.target.checked)}
          className="mt-1" />
        <span>
          Tôi có <strong>{tongPhut} phút liên tục</strong> và sẽ không rời khỏi bài thi.
          Đồng hồ chạy liên tục kể cả khi đóng tab.
        </span>
      </label>

      <button type="button" disabled={!sanSang || dangTai || !paper?.sections.length}
        onClick={onStart}
        className="mt-6 inline-flex items-center gap-2 rounded-full border-0 bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
        <Timer size={16} /> {dangTai ? "Đang tải đề…" : "Bắt đầu thi"}
      </button>
    </div>
  );
}

/* ─────────────────────── Một phần thi ─────────────────────── */

function PhanThi({ section, answers, setAnswers, onDone, onBlur }) {
  const [conLai, setConLai] = useState(section.minutes * 60);
  const doneRef = useRef(false);

  /* Đồng hồ neo vào MỐC THỜI GIAN THẬT, không cộng dồn từng giây.
     setInterval bị trình duyệt giảm nhịp ở tab nền, nên đếm ngược bằng cách
     trừ dần sẽ chạy chậm lại — học sinh chuyển tab là được thêm giờ. */
  useEffect(() => {
    const het = Date.now() + section.minutes * 60 * 1000;
    const id = setInterval(() => {
      const s = Math.ceil((het - Date.now()) / 1000);
      setConLai(s);
      if (s <= 0 && !doneRef.current) { doneRef.current = true; clearInterval(id); onDone(true); }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.code]);

  /* Rời tab: ghi nhận, KHÔNG chặn. Đây là tự học, không phải phòng thi có
     giám thị — chặn thì chỉ tạo cảm giác bị canh chừng mà không ngăn được gì. */
  useEffect(() => {
    const f = () => { if (document.hidden) onBlur(); };
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ex = section.exercise;
  const gap = conLai <= 60 ? "text-danger" : conLai <= 300 ? "text-warn" : "text-ink";

  const dat = (qid, v) => setAnswers((p) => ({ ...p, [qid]: v }));

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between gap-4 bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wide text-primary">{section.code}</div>
          <div className="truncate text-sm font-bold text-ink">{section.label}</div>
        </div>
        {/* Không nhấp nháy: gây hoảng, không giúp gì thêm. */}
        <div className={`flex shrink-0 items-center gap-2 rounded-full bg-surface2 px-4 py-2 font-bold tabular-nums ${gap}`}>
          <Clock size={15} /> {dongHo(Math.max(0, conLai))}
        </div>
      </div>

      {ex.consigne && <p className="m-0 mb-4 text-sm italic text-soft">{ex.consigne}</p>}
      {ex.audioUrl && (
        <audio controls src={ex.audioUrl} className="mb-5 w-full">
          Trình duyệt không phát được audio.
        </audio>
      )}
      {ex.readingText && (
        <div className="mb-6 max-h-80 overflow-y-auto rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-ink"
             dangerouslySetInnerHTML={{ __html: ex.readingText }} />
      )}

      <ol className="m-0 list-none space-y-5 p-0">
        {ex.questions.map((q, i) => (
          <li key={q.id} className="rounded-2xl border border-line bg-surface p-5">
            <div className="m-0 text-sm font-bold text-ink">
              <span className="mr-2 text-soft">{i + 1}.</span>{q.prompt}
            </div>

            {/* KHÔNG có tô màu đúng/sai ở đây — cố ý. Xem chú thích đầu file. */}
            {q.type === "qcm" && (
              <div className="mt-3 space-y-2">
                {(q.options ?? []).map((o, j) => (
                  <button key={j} type="button" onClick={() => dat(q.id, j)}
                    className={`block w-full rounded-xl border-0 px-4 py-2.5 text-left text-sm transition ${
                      answers[q.id] === j ? "bg-primary text-white" : "bg-surface2 text-ink hover:brightness-95"}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}

            {(q.type === "fill" || q.type === "conj") && (
              <input value={answers[q.id] ?? ""} onChange={(e) => dat(q.id, e.target.value)}
                placeholder="Réponse…"
                className="mt-3 w-full max-w-sm rounded-xl border border-line bg-surface2 px-4 py-2.5 text-sm text-ink" />
            )}

            {q.type === "vf" && (
              <div className="mt-3 flex gap-2">
                {["Vrai", "Faux", "?"].map((o, j) => (
                  <button key={j} type="button"
                    onClick={() => dat(q.id, { ...(answers[q.id] ?? {}), choice: j })}
                    className={`rounded-full border-0 px-4 py-2 text-sm font-semibold transition ${
                      answers[q.id]?.choice === j ? "bg-primary text-white" : "bg-surface2 text-ink"}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}

            {q.type === "open" && (
              <>
                <textarea rows={10} value={answers[q.id] ?? ""}
                  onChange={(e) => dat(q.id, e.target.value)}
                  placeholder="Votre texte…"
                  className="mt-3 w-full rounded-xl border border-line bg-surface2 p-4 text-sm leading-relaxed text-ink" />
                <div className="mt-1 text-xs text-soft">
                  {String(answers[q.id] ?? "").trim().split(/\s+/).filter(Boolean).length} mots
                </div>
              </>
            )}

            {q.type === "tableau" && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th />
                      {(q.colonnes ?? []).map((c) => (
                        <th key={c.id} className="p-2 text-xs font-bold text-soft">{c.titre}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(q.criteres ?? []).map((cr) => (
                      <tr key={cr.id} className="border-t border-line">
                        <td className="p-2 text-ink">{cr.texte}</td>
                        {(q.colonnes ?? []).map((co) => {
                          const key = `${cr.id}_${co.id}`;
                          const cur = answers[q.id]?.[key];
                          return (
                            <td key={co.id} className="p-2 text-center">
                              {["OUI", "NON"].map((v) => (
                                <button key={v} type="button"
                                  onClick={() => dat(q.id, { ...(answers[q.id] ?? {}), [key]: v })}
                                  className={`mx-0.5 rounded-full border-0 px-2.5 py-1 text-xs font-bold ${
                                    cur === v ? "bg-primary text-white" : "bg-surface2 text-soft"}`}>
                                  {v}
                                </button>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </li>
        ))}
      </ol>

      <button type="button" onClick={() => { doneRef.current = true; onDone(false); }}
        className="mt-8 rounded-full border-0 bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg">
        Terminer cette partie
      </button>
    </div>
  );
}

/* ─────────────────────────── Kết quả ─────────────────────────── */

function KetQua({ sections, blurCount, onLai }) {
  const v = verdict(sections);
  const mau = v.passed === true ? "text-ok" : v.passed === false ? "text-danger" : "text-warn";

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="m-0 text-2xl font-extrabold text-ink">Kết quả thi thử</h1>

      <div className="mt-6 rounded-3xl border border-line bg-surface p-6">
        <div className={`text-4xl font-extrabold tabular-nums ${mau}`}>
          {v.total}<span className="text-lg text-soft"> / {v.maxScored}</span>
        </div>
        <div className="mt-2 text-sm font-bold text-ink">
          {v.passed === true && "Đạt"}
          {v.passed === false && "Chưa đạt"}
          {v.passed === null && "Chưa kết luận được"}
        </div>

        {/* Chưa chấm hết thì KHÔNG đoán. Nói "bạn đạt rồi" dựa trên hai phần ba
            bài thi là lời nói dối tử tế nhưng vẫn là nói dối. */}
        {v.passed === null && (
          <p className="m-0 mt-2 text-xs text-soft">
            Còn {v.pending.map((p) => p.code).join(", ")} chờ giáo viên chấm.
            Máy không chấm được bài viết, và đoán thay thì con số mất hết ý nghĩa.
          </p>
        )}
      </div>

      <ul className="m-0 mt-5 list-none space-y-3 p-0">
        {sections.map((s) => {
          const yeu = s.score != null && s.score < NGUONG_PHAN;
          return (
            <li key={s.code}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${
                  yeu ? "border-danger bg-dangerSoft" : "border-line bg-surface"}`}>
              <div className="min-w-0">
                <div className="text-sm font-bold text-ink">{s.code} · {s.label}</div>
                <div className="truncate text-xs text-soft">{s.exercise.title}</div>
                {yeu && (
                  <div className="mt-1 text-xs font-bold text-danger">
                    Dưới {NGUONG_PHAN}/25 — riêng phần này đã đủ làm trượt cả bài.
                  </div>
                )}
              </div>
              <div className="shrink-0 text-right">
                {s.score == null
                  ? <span className="text-xs font-bold text-warn">chờ chấm</span>
                  : <span className="text-lg font-extrabold tabular-nums text-ink">
                      {s.score}<span className="text-xs text-soft">/{s.points}</span>
                    </span>}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Luật đạt có HAI vế, và vế thứ hai mới hay làm trượt người ta. */}
      <p className="m-0 mt-5 flex items-start gap-2 text-xs text-soft">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" />
        <span>
          Đạt DELF cần <strong className="text-ink">≥ {NGUONG_TONG}/100 toàn bài</strong> VÀ{" "}
          <strong className="text-ink">≥ {NGUONG_PHAN}/25 ở mỗi phần</strong>. Người ta thường
          trượt vì một kỹ năng yếu hẳn, chứ hiếm khi vì tổng điểm.
        </span>
      </p>

      {blurCount > 0 && (
        <p className="m-0 mt-3 text-xs text-soft">
          Bạn rời khỏi tab {blurCount} lần trong lúc thi. Không bị trừ điểm — chỉ để bạn biết,
          vì phòng thi thật thì không rời được.
        </p>
      )}

      <button type="button" onClick={onLai}
        className="mt-7 rounded-full border-0 bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg">
        Thi đề khác
      </button>
    </div>
  );
}

/* ─────────────────────────── Vỏ ─────────────────────────── */

export default function ExamMode() {
  const [level, setLevel] = useState("B1");
  const [kho, setKho] = useState(null);
  const [paper, setPaper] = useState(null);
  const [buoc, setBuoc] = useState("cho");         // cho | thi | cham | xong
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [ketQua, setKetQua] = useState([]);
  const [blurCount, setBlurCount] = useState(0);

  useEffect(() => { loadPractice().then(setKho).catch(() => setKho([])); }, []);
  useEffect(() => { if (kho) setPaper(assemblePaper(kho, level)); }, [kho, level]);

  const batDau = () => { setAnswers({}); setKetQua([]); setBlurCount(0); setIdx(0); setBuoc("thi"); };

  const xongPhan = async () => {
    const s = paper.sections[idx];
    const conNua = idx + 1 < paper.sections.length;

    /* Nộp NGAY từng phần, không đợi hết bài: hết giờ phần này là câu trả lời
       của nó đã an toàn trên máy chủ. Đợi tới cuối thì một lần đóng tab là mất
       cả buổi thi. */
    const res = await gradeRemote(s.exercise.id, answers, { mode: "exam", blurCount });

    setKetQua((p) => [...p, {
      ...s,
      /* max === 0 nghĩa là phần này không có câu nào máy chấm được (Production
         écrite chỉ có bài viết) → để `null`, tức "chờ chấm", chứ không phải 0. */
      score: res && res.max > 0 ? sectionScore(res.score, res.max, s.points) : null,
    }]);

    if (conNua) { setIdx(idx + 1); setAnswers({}); }
    else setBuoc("xong");
  };

  if (buoc === "cho") {
    return <ManCho level={level} setLevel={setLevel} paper={paper}
      dangTai={!kho} onStart={batDau} />;
  }
  if (buoc === "thi") {
    return <PhanThi key={paper.sections[idx].code} section={paper.sections[idx]}
      answers={answers} setAnswers={setAnswers} onDone={xongPhan}
      onBlur={() => setBlurCount((n) => n + 1)} />;
  }
  return <KetQua sections={ketQua} blurCount={blurCount}
    onLai={() => { setPaper(assemblePaper(kho, level)); setBuoc("cho"); }} />;
}
