import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Timer, ShieldCheck, AlertTriangle, Clock, Volume2, ArrowLeft } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { loadExams, loadExam } from "../../shared/examStore.js";
import { gradeRemote } from "../../shared/gradeRemote.js";
import { EXAM_STRUCTURE, sectionScore, verdict, ghiPhan, gomTheoKyNang, NGUONG_PHAN, NGUONG_TONG }
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

function ManCho({ dsDe, chon, paper, onStart, dangTai }) {
  const level = paper?.level ?? "B1";
  const cauTruc = EXAM_STRUCTURE[level] ?? [];
  const tongPhut = cauTruc.reduce((n, p) => n + p.minutes, 0);
  const [sanSang, setSanSang] = useState(false);

  /* Chưa có đề nào thì nói rõ NGUYÊN NHÂN, đừng hiện một màn hình trống.
     Trạng thái này có thật và hay gặp lúc mới dựng lớp: giáo viên đã soạn bài
     nhưng chưa ghép thành đề, hoặc đã ghép mà chưa bấm phát hành. */
  if (!dangTai && dsDe.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="m-0 text-2xl font-extrabold text-ink">Thi thử DELF</h1>
        <div className="mt-6 rounded-3xl border border-line bg-surface p-8 text-center">
          <p className="m-0 font-bold text-ink">Chưa có đề thi nào</p>
          <p className="m-0 mt-2 text-sm text-soft">
            Đề thi thử do giáo viên soạn và phát hành. Khi có đề, nó sẽ hiện ở đây.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Lối ra. Màn hình thi nằm ngoài vỏ app nên KHÔNG có thanh bên — cố ý,
          phòng thi không có menu. Nhưng "không có menu" khác "không có lối ra":
          thiếu link này thì cách duy nhất rời trang là bấm Back của trình
          duyệt, và người dùng sẽ nghĩ mình bị nhốt. */}
      <Link to="/etudiant/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-soft no-underline hover:text-ink">
        <ArrowLeft size={15} /> Về trang chủ
      </Link>

      <h1 className="m-0 mt-4 text-2xl font-extrabold text-ink">Thi thử DELF</h1>
      <p className="m-0 mt-2 text-sm text-soft">
        Một lần duy nhất, có tính giờ, không xem đáp án giữa chừng.
      </p>

      {/* Chọn ĐỀ, không chọn trình độ. Trước đây học sinh chọn B1/B2 rồi máy
          bốc ngẫu nhiên ba bài — chạy được, nhưng không phải một đề thi. Giờ
          mỗi dòng ở đây là một vật phẩm giáo viên đã cân nhắc và phát hành. */}
      <div className="mt-6 space-y-2">
        {dsDe.map((e) => (
          <button key={e.id} type="button" onClick={() => chon(e.id)}
            className={`block w-full rounded-2xl border-0 px-5 py-3 text-left transition ${
              paper?.id === e.id ? "bg-primary text-white" : "bg-surface2 text-ink hover:brightness-95"}`}>
            <span className="text-sm font-bold">{e.title}</span>
            <span className={`ml-2 text-xs ${paper?.id === e.id ? "text-white/75" : "text-soft"}`}>
              {/* Đếm KỸ NĂNG, không đếm dòng — một đề 6 bài vẫn là 3 phần. */}
              {e.level} · {new Set(e.sections.map((s) => s.code)).size} phần
              {e.sections.length > 3 ? ` · ${e.sections.length} bài` : ""}
              {` · ${e.duration_min ?? 0}′`}
            </span>
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
              const co = (paper?.sections ?? []).filter((s) => s.code === p.code);
              return (
                <tr key={p.code} className="border-t border-line">
                  <td className="p-3 font-bold text-ink">{p.code}
                    <span className="ml-2 font-normal text-soft">{p.label}</span></td>
                  <td className="p-3 text-ink">{p.minutes}′</td>
                  <td className="p-3 text-ink">/{p.points}</td>
                  {/* Liệt kê ĐỦ số bài của phần, không chỉ bài đầu.
                      Một phần có thể có nhiều bài (migration 044), và học sinh
                      cần biết trước phần CO là một bài hay ba — nó quyết định
                      cách chia 25 phút. Bản cũ dùng `find` nên đề ba bài trông
                      y hệt đề một bài. */}
                  <td className="p-3">
                    {co.length === 0
                      ? <span className="font-bold text-danger">chưa có bài</span>
                      : (
                        <span className="text-soft">
                          {co.length > 1 && (
                            <strong className="text-ink">{co.length} bài · </strong>
                          )}
                          {co.map((s) => s.exercise?.title ?? "(không mở được)")
                            .join(" · ").slice(0, 46)}
                        </span>
                      )}
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
        <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs text-ink">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" />
          {/* `missing` ở đây KHÔNG phải "giáo viên quên chọn bài" — đề đã lưu
              thì phần nào cũng có exercise_id. Nó nghĩa là bài được trỏ tới
              hiện KHÔNG ĐỌC ĐƯỢC: bài trả phí mà em chưa mua (RLS 019 giấu
              câu hỏi), hoặc bài vừa bị xoá. Nói đúng nguyên nhân, vì hai
              trường hợp đó cần hai hành động khác nhau. */}
          <span>
            Không mở được phần <strong>{paper.missing.map((m) => m.code).join(", ")}</strong> của đề
            này — bài tương ứng có thể là bài trả phí bạn chưa có quyền, hoặc đã bị gỡ.
            Báo giáo viên; điểm phần đó sẽ không tính được.
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

/* ───────────────────── Audio giới hạn 2 lượt ───────────────────── */

/* Bộ đếm nằm ở MÁY CHỦ (`attempts.audio_plays`), không ở đây.
 *
 * Giữ trong state React thì học sinh chỉ cần F5 là nghe lại từ đầu — và đó
 * chính là thứ họ sẽ thử. Migration 024 còn bịt thêm hai đường vòng nữa: trình
 * duyệt không còn quyền UPDATE thẳng vào `attempts`, và `exam_start` DÙNG LẠI
 * lần làm chưa kết thúc nên tải lại trang cũng không đẻ ra bộ đếm mới.
 *
 * Ở đây chỉ còn một việc: hỏi máy chủ trước khi phát, và nếu bị từ chối thì
 * NÓI RÕ VÌ SAO. Nút chết lặng không giải thích là thứ khiến người dùng tưởng
 * trang hỏng. */
function AudioGioiHan({ src, attemptId, questionId }) {
  const [conLai, setConLai] = useState(null);   // null = chưa hỏi lần nào
  const [dangXin, setDangXin] = useState(false);
  const [loi, setLoi] = useState("");
  const ref = useRef(null);

  const het = conLai !== null && conLai <= 0;
  const chuaSanSang = !attemptId;

  /* Đọc bộ đếm THẬT khi vào, đừng mặc định "còn 2 lượt".
   *
   * Sau khi tải lại trang, `exam_start` trả về đúng lần làm cũ, nên máy chủ vẫn
   * nhớ đã nghe mấy lượt. Nhưng giao diện thì mới tinh — hiện "2 lượt" rồi bấm
   * vào bị từ chối là kiểu sai lệch khiến người dùng nghĩ hệ thống hỏng, chứ
   * không nghĩ mình đã hết lượt. */
  useEffect(() => {
    if (!attemptId) return;
    let huy = false;
    supabase.from("attempts").select("audio_plays").eq("id", attemptId).maybeSingle()
      .then(({ data }) => {
        if (huy || !data) return;
        const daNghe = Number(data.audio_plays?.[questionId] ?? 0);
        if (daNghe > 0) setConLai(Math.max(0, 2 - daNghe));
      });
    return () => { huy = true; };
  }, [attemptId, questionId]);

  const phat = async () => {
    if (het || dangXin || chuaSanSang) return;
    setDangXin(true); setLoi("");
    try {
      const { data, error } = await supabase.rpc("exam_play_audio", {
        p_attempt: attemptId, p_question: questionId,
      });
      if (error) throw error;
      if (data?.allowed) {
        setConLai(data.remaining ?? 0);
        ref.current?.play();
      } else {
        setConLai(0);
        setLoi(data?.reason === "limit"
          ? "Bạn đã dùng hết 2 lượt nghe cho phần này."
          : "Không ghi nhận được lượt nghe.");
      }
    } catch (e) {
      /* Không đếm được thì KHÔNG cho phát. Hướng an toàn ở đây là chặn: cho
         phát khi mất kết nối là mở đúng đường vòng mà cả migration 024 sinh ra
         để bịt — ngắt mạng một giây là nghe không giới hạn. */
      setLoi("Không kết nối được máy chủ, chưa phát được. Thử lại sau giây lát.");
      console.warn("[exam] exam_play_audio hỏng:", e?.message ?? e);
    } finally {
      setDangXin(false);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-line bg-surface p-4">
      {/* KHÔNG dùng `controls` mặc định: nó cho tua lại và phát lại tuỳ ý, tức
          là bỏ qua bộ đếm hoàn toàn. Chỉ một nút, mỗi lần bấm là một lượt. */}
      <audio ref={ref} src={src} onEnded={() => {}} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={phat} disabled={het || dangXin || chuaSanSang}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5 text-sm font-bold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
          <Volume2 size={15} /> {chuaSanSang ? "Đang mở bài thi…" : dangXin ? "…" : het ? "Hết lượt nghe" : "Phát"}
        </button>
        <span className="text-xs text-soft">
          {conLai === null ? "2 lượt nghe" : `Còn ${conLai} lượt`}
        </span>
      </div>
      {loi && <p className="m-0 mt-2 text-xs font-semibold text-danger">{loi}</p>}
    </div>
  );
}

/* ─────────────────────── Một phần thi ─────────────────────── */

/* Xuất tên để `preview.html` dựng được ĐÚNG component này với dữ liệu thật.
   Màn thi nằm sau đăng nhập và sau một lượt thi đang mở, nên không có đường nào
   khác để nhìn thấy nó — mà đúng ở đây thì mới có ảnh đề bài và consigne. */
export function PhanThi({ section, attemptId, answers, setAnswers, onDone, onBlur, onDoiBai }) {
  const [conLai, setConLai] = useState(section.minutes * 60);
  const doneRef = useRef(false);

  /* ══ NHIỀU BÀI TRONG MỘT PHẦN ══
   *
   * Từ migration 044, một kỹ năng chứa được nhiều bài. Nhưng phần thi vẫn là
   * MỘT khối có MỘT đồng hồ — đúng như DELF: CO là 25 phút cho cả ba bài, không
   * phải 25 phút mỗi bài.
   *
   * Nên `baiIdx` chỉ đổi thứ ĐANG HIỆN, không chạm vào đồng hồ và không nộp gì.
   * Câu trả lời nằm ở `answers` của cả buổi thi (state ở component cha), khoá
   * theo `question.id` — nên chuyển qua lại giữa các bài không mất gì, kể cả
   * khi bài kia đã bị gỡ khỏi DOM.
   *
   * Chỉ cho đi lại trong CÙNG một kỹ năng. Nhảy giữa CO và CE thì đồng hồ từng
   * phần mất nghĩa, và bài thi thử không còn dựng lại được kỳ thi thật. */
  const [baiIdx, setBaiIdx] = useState(0);
  const dsBai = section.exercises ?? (section.exercise ? [section.exercise] : []);
  const ex = dsBai[Math.min(baiIdx, dsBai.length - 1)];

  /* Đổi bài thì báo lên cha để nó mở `attempt` cho bài mới — bộ đếm lượt nghe
     audio gắn vào từng bài, không gắn vào cả phần. */
  useEffect(() => { onDoiBai?.(ex?.id); }, [ex?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  /* Chỉ để đổi CHỮ trên nút. Việc chặn do `doneRef` lo: ref đổi ngay trong cùng
     một nhịp, còn state thì phải đợi render kế — mà hai cú bấm liên tiếp lọt
     vừa đúng vào khe đó. */
  const [dangNop, setDangNop] = useState(false);

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

  const gap = conLai <= 60 ? "text-danger" : conLai <= 300 ? "text-warn" : "text-ink";

  const dat = (qid, v) => setAnswers((p) => ({ ...p, [qid]: v }));

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between gap-4 bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wide text-primary">{section.code}</div>
          <div className="truncate text-sm font-bold text-ink">{section.label}</div>
          {dsBai.length > 1 && (
            <div className="mt-0.5 text-xs text-soft">
              Bài {baiIdx + 1}/{dsBai.length} · dùng chung {section.minutes} phút của phần này
            </div>
          )}
        </div>
        {/* Không nhấp nháy: gây hoảng, không giúp gì thêm. */}
        <div className={`flex shrink-0 items-center gap-2 rounded-full bg-surface2 px-4 py-2 font-bold tabular-nums ${gap}`}>
          <Clock size={15} /> {dongHo(Math.max(0, conLai))}
        </div>
      </div>

      {/* Consigne là HTML, không phải chữ thuần.
         Trình soạn bài (RichTextEditor) sinh ra thẻ — căn giữa, in nghiêng, tô
         màu — và lưu nguyên vào `consigne`. Dựng bằng `{ex.consigne}` thì React
         escape hết, và học sinh đọc đúng nghĩa đen của mã nguồn:
         `<div style="text-align: center;"> <span style=…>Depuis une dizaine…`

         `Taking.jsx` và `PracticeHub.jsx` đã dùng dangerouslySetInnerHTML cho
         đúng trường này từ lâu; chỉ màn thi bị bỏ sót. Nội dung do giáo viên
         soạn và đã nằm sau `is_teacher()`, cùng mức tin cậy với `readingText`
         ngay bên dưới. */}
      {ex.consigne && (
        <div className="m-0 mb-4 text-sm italic leading-relaxed text-soft"
             dangerouslySetInnerHTML={{ __html: ex.consigne }} />
      )}
      {ex.audioUrl && (
        <AudioGioiHan src={ex.audioUrl} attemptId={attemptId} questionId={`ex:${ex.id}`} />
      )}

      {/* Ảnh đề bài — màn thi trước đây KHÔNG dựng nó.
         Với bài đọc hiểu, ảnh thường CHÍNH LÀ ngữ liệu: áp phích, vé tàu, quảng
         cáo. Thiếu nó thì câu hỏi vẫn hiện đủ nhưng không trả lời được, và học
         sinh mất điểm vì một thứ không phải lỗi của họ. */}
      {ex.imageUrl && (
        <figure className="m-0 mb-6">
          <img src={ex.imageUrl} alt="Document de l'exercice" loading="lazy"
            className="mx-auto block w-full max-w-3xl rounded-2xl border border-line object-contain" />
        </figure>
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

      {/* ── Đi lại giữa các bài TRONG phần này ──
         Chỉ trong cùng một kỹ năng. Nhảy sang CO khi đang làm CE thì đồng hồ
         từng phần mất nghĩa, và bài thi thử thôi dựng lại được kỳ thi thật.

         Câu trả lời nằm ở `answers` của cả buổi thi, khoá theo `question.id`,
         nên đi qua đi lại không mất gì — kể cả khi bài kia đã rời khỏi DOM. */}
      {dsBai.length > 1 && (
        <div className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl bg-surface2 p-3">
          <span className="mr-1 text-xs font-bold uppercase tracking-wide text-soft">
            Bài trong phần này
          </span>
          {dsBai.map((b, j) => {
            /* Đánh dấu bài ĐÃ TRẢ LỜI ÍT NHẤT MỘT CÂU — không đánh dấu "đã xong",
               vì ta không nói cho học sinh biết họ đã đủ hay chưa: đếm câu còn
               thiếu trong lúc thi là một dạng gợi ý. */
            const daDung = (b.questions ?? []).some((q) => answers[q.id] !== undefined);
            return (
              <button key={b.id} type="button" onClick={() => setBaiIdx(j)}
                className={`rounded-full border-0 px-3.5 py-1.5 text-xs font-bold transition ${
                  j === baiIdx ? "bg-primary text-white"
                    : daDung ? "bg-surface text-ink" : "bg-surface text-soft"}`}>
                {j + 1}
                {daDung && j !== baiIdx && <span className="ml-1 text-ok">•</span>}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-soft">
            Nộp một lần cho cả {dsBai.length} bài
          </span>
        </div>
      )}

      {/* ══ VÌ SAO PHẢI CHẶN BẤM LẦN THỨ HAI ══
       *
       * `onDone` là `xongPhan`, và nó `await gradeRemote(...)` — một vòng gọi
       * mạng — TRƯỚC khi chuyển sang phần kế. Suốt quãng chờ đó, nút vẫn bấm
       * được và màn hình không đổi gì.
       *
       * Người sốt ruột bấm thêm bốn lần thì `xongPhan` chạy năm lần cho CÙNG
       * một phần, và mỗi lần nối thêm một bản ghi vào `ketQua`. Kết quả thật đã
       * gặp: năm thẻ CO giống hệt nhau, tổng 47,5/150 thay vì 9,5/75.
       *
       * `doneRef` trước đây chỉ được ĐẶT ở đây chứ không được ĐỌC — nó chỉ chặn
       * đồng hồ bắn `onDone` lần nữa, không chặn ngón tay. */}
      <button type="button" disabled={doneRef.current}
        onClick={() => {
          if (doneRef.current) return;
          doneRef.current = true;
          setDangNop(true);
          onDone(false);
        }}
        className="mt-8 rounded-full border-0 bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg
                   disabled:cursor-not-allowed disabled:bg-surface2 disabled:text-soft disabled:shadow-none">
        {dangNop ? "Đang nộp…" : "Terminer cette partie"}
      </button>
    </div>
  );
}

/* ─────────────────────────── Kết quả ─────────────────────────── */

function KetQua({ sections, blurCount, onLai }) {
  /* Có phần nào KHÔNG lưu được lên máy chủ không.
   *
   * Không gộp vào `verdict`: điểm và "có lưu được không" là hai câu hỏi khác
   * nhau, và trộn chúng thì một buổi thi mất trắng sẽ hiện thành điểm thấp —
   * sai theo hướng nguy hiểm nhất, vì học sinh sẽ đi làm lại bài thay vì đăng
   * nhập lại. */
  const mat = sections.some((s) => s.luuDuoc === false);

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

      {mat && (
        <div className="mt-5 rounded-2xl border border-solid border-danger bg-danger-soft p-4">
          <p className="m-0 text-sm font-bold text-danger">
            ⚠️ Kết quả này CHƯA được lưu lên máy chủ.
          </p>
          <p className="m-0 mt-1 text-xs font-semibold text-danger">
            Máy chủ không nhận ra bạn là ai — nhiều khả năng phiên đăng nhập đã
            hết hạn. Điểm ở đây chỉ nằm trong trình duyệt và sẽ mất khi bạn tải
            lại trang; buổi thi này cũng sẽ không hiện ở « Kết quả thi ».
          </p>
          <p className="m-0 mt-1 text-xs text-danger">
            Đăng nhập lại rồi thi lại. Đừng đóng tab trước khi chép lại điểm nếu
            bạn cần.
          </p>
        </div>
      )}

      <ul className="m-0 mt-5 list-none space-y-3 p-0">
        {sections.map((s) => {
          const yeu = s.score != null && s.score < NGUONG_PHAN;
          return (
            <li key={s.code}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${
                  yeu ? "border-danger bg-danger-soft" : "border-line bg-surface"}`}>
              <div className="min-w-0">
                <div className="text-sm font-bold text-ink">{s.code} · {s.label}</div>
                {/* Lượt thi lưu TRƯỚC migration 044 mang `exercise`, lượt sau mang
                    `baiLabel`. Đọc cả hai: dữ liệu cũ không tự đổi hình khi mã
                    đổi, và một lượt thi cũ mở ra làm sập cả trang là cái giá
                    quá đắt cho một dòng chữ phụ. */}
                <div className="truncate text-xs text-soft">
                  {s.baiLabel ?? s.exercise?.title ?? ""}
                </div>
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

      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" onClick={onLai}
          className="rounded-full border-0 bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg">
          Thi đề khác
        </button>
        <Link to="/etudiant/dashboard"
          className="rounded-full px-5 py-3 text-sm font-semibold text-soft no-underline hover:text-ink">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────── Vỏ ─────────────────────────── */

export default function ExamMode() {
  const [dsDe, setDsDe] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [paper, setPaper] = useState(null);
  const [buoc, setBuoc] = useState("cho");         // cho | thi | cham | xong
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [ketQua, setKetQua] = useState([]);
  const [blurCount, setBlurCount] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  /* Bài đang hiện trong phần hiện tại. Đổi bài KHÔNG nộp gì và không chạm đồng
     hồ — nó chỉ quyết định mở `attempt` cho bài nào. */
  const [baiHienTai, setBaiHienTai] = useState(null);
  /* attempt của TỪNG bài. Bộ đếm lượt nghe audio gắn vào bài, không gắn vào
     phần, nên một phần ba bài cần ba dòng attempt. Dùng ref chứ không state:
     giá trị này chỉ để đọc lúc chấm, và đưa vào state sẽ khiến mỗi lần đổi bài
     render lại cả cây. */
  const attemptTheoBai = useRef({});

  /* Gom các dòng exam_sections thành KHỐI theo kỹ năng — một khối, một đồng hồ,
     nhiều bài bên trong. Xem gomTheoKyNang() trong examPaper.js. */
  const khoi = useMemo(() => gomTheoKyNang(paper?.sections), [paper]);

  /* Đề đến từ bảng `exams` — do giáo viên soạn và phát hành (migration 026).
     RLS lo phần lọc: học sinh chỉ nhận đề đã phát hành. Không lọc lại ở đây,
     vì lọc ở client là thứ xoá được trong DevTools. */
  useEffect(() => {
    loadExams()
      .then((ds) => { setDsDe(ds); if (ds.length === 1) chonDe(ds[0].id); })
      .catch(() => setDsDe([]))
      .finally(() => setDangTai(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chonDe = async (id) => {
    setDangTai(true);
    const de = await loadExam(id);
    setDangTai(false);
    if (!de) { alert("Không mở được đề này."); return; }
    setPaper(de);
  };

  const batDau = () => {
    setAnswers({}); setKetQua([]); setBlurCount(0); setIdx(0);
    setBaiHienTai(null); attemptTheoBai.current = {};
    setBuoc("thi");
  };

  /* Mở `attempt` NGAY khi vào phần thi, không đợi lúc nộp.
   *
   * Bộ đếm lượt nghe cần một dòng để ghi vào trong lúc đang làm bài. Nếu dòng
   * đó chỉ sinh ra lúc chấm thì suốt phần CO không có chỗ nào đếm, và giới hạn
   * 2 lượt lại phải quay về sống trong state React — đúng thứ roadmap §2.3 cấm.
   *
   * `exam_start` dùng lại lần làm chưa kết thúc, nên gọi lại nhiều lần cũng chỉ
   * ra một dòng. Đó cũng là thứ khiến F5 không cấp thêm lượt nghe. */
  useEffect(() => {
    const exId = baiHienTai ?? khoi[idx]?.exercises[0]?.id;
    if (buoc !== "thi" || !exId) return;
    let huy = false;
    setAttemptId(null);
    supabase.rpc("exam_start", {
      p_exercise_id: exId,
      /* Gắn lượt làm vào ĐỀ. Thiếu tham số này thì ba phần CO/CE/PE của cùng
         một buổi thi trông như ba lần luyện tập rời rạc, và màn hình kết quả
         không gom lại được — đúng lỗi migration 028 sửa. */
      p_exam_id: paper.id,
      p_mode: "exam",
    }).then(({ data, error }) => {
      if (huy) return;
      if (error) console.warn("[exam] không mở được attempt:", error.message);
      else { setAttemptId(data); attemptTheoBai.current[exId] = data; }
    });
    return () => { huy = true; };
  }, [buoc, idx, paper, baiHienTai]);

  const xongPhan = async () => {
    const k = khoi[idx];
    const conNua = idx + 1 < khoi.length;

    /* Nộp NGAY từng phần, không đợi hết bài: hết giờ phần này là câu trả lời
       của nó đã an toàn trên máy chủ. Đợi tới cuối thì một lần đóng tab là mất
       cả buổi thi.

       Một phần có thể có NHIỀU bài (migration 044), và mỗi bài là một lời gọi
       chấm riêng — `gradeRemote` nhận đúng một `exerciseId`. Nên chấm lần lượt
       rồi CỘNG DỒN, và chỉ quy về thang 25 MỘT LẦN ở cuối.

       Quy đổi từng bài rồi cộng là sai: hai bài 7 câu và 15 câu sẽ có trọng số
       bằng nhau, trong khi bài 15 câu đáng gấp đôi. Cộng thô rồi mới chia thì
       mỗi câu nặng như nhau — đúng cách DELF đếm. */
    let dung = 0, tong = 0;
    /* ── CÓ THẬT SỰ LƯU ĐƯỢC KHÔNG ──
     *
     * Hàm `grade` ghi `attempts` bên trong `if (userId)`, còn câu trả về nằm
     * NGOÀI khối đó. Máy chủ không nhận ra người gọi là ai — phiên hết hạn,
     * chưa đăng nhập, JWT không kèm theo — thì nó vẫn chấm và vẫn trả điểm
     * đúng, chỉ là `attemptId: null` và không một dòng nào được ghi.
     *
     * Đã xảy ra thật: một buổi thi đầy đủ, màn hình hiện CO 19 / CE 14.5, và
     * database không có lấy một dòng `attempts`. Học sinh chỉ phát hiện khi mở
     * trang Kết quả thi và không thấy buổi thi ấy ở đâu — muộn hơn nhiều, và
     * lúc đó bài làm đã mất hẳn.
     *
     * `attemptId` trả về là dấu hiệu chắc chắn: có id nghĩa là đã ghi. Đây là
     * lần thứ TƯ dự án gặp cùng một lỗi — báo thành công cho việc chưa làm.
     * Xem `saveExam`, `saveExercise`, `sendAnnonce`. */
    let luuDuoc = true;
    for (const ex of k.exercises) {
      const r = await gradeRemote(ex.id, answers, {
        mode: "exam", blurCount, attemptId: attemptTheoBai.current[ex.id],
        examId: paper?.id ?? null,
      });
      if (r) { dung += r.score ?? 0; tong += r.max ?? 0; }
      if (!r || !r.attemptId) luuDuoc = false;
    }

    const ghi = {
      code: k.code, points: k.points, exerciseId: k.exercises[0]?.id,
      /* Hai nhãn khác nhau, đừng gộp làm một: `label` là tên kỹ năng
         (« Compréhension de l'oral »), `baiLabel` là tên các bài đã làm. Màn
         kết quả hiện cả hai, dòng trên dòng dưới. Bản trước đặt tên bài vào
         `label` và làm mất tên kỹ năng khỏi thanh tiêu đề lúc đang thi. */
      label: k.label ?? k.code,
      baiLabel: k.exercises.map((e) => e.title).join(" · "),
      /* tong === 0 nghĩa là phần này không có câu nào máy chấm được (Production
         écrite chỉ có bài viết) → để `null`, tức "chờ chấm", chứ không phải 0. */
      score: tong > 0 ? sectionScore(dung, tong, k.points) : null,
      /* Phần này có được lưu lên máy chủ không. Màn kết quả dùng nó để nói
         thẳng khi bài thi chỉ tồn tại trong trình duyệt. */
      luuDuoc,
    };

    /* Nút đã chặn bấm lại (xem PhanThi) — đó là chỗ sửa NGUYÊN NHÂN. `ghiPhan`
       là lớp thứ hai: dù có đường nào lọt qua thì mảng vẫn không thể chứa hai
       bản ghi cùng `code`. Chặn một chỗ là sửa lỗi; làm cho trạng thái sai
       KHÔNG BIỂU DIỄN ĐƯỢC mới là hết lo. */
    setKetQua((p) => ghiPhan(p, ghi));

    /* Phần viết KHÔNG được chấm tự động ở đây — học sinh tự chấm ở màn
       « Kết quả thi », đối chiếu với bài mẫu. Xem migration 030. */

    /* KHÔNG xoá `answers` khi sang phần mới: nó khoá theo question.id, nên câu
       của phần trước không đụng gì tới phần sau — mà giữ lại thì nếu có đường
       nào quay lại, bài làm vẫn còn. Bản cũ xoá vì mỗi phần chỉ một bài. */
    if (conNua) { setIdx(idx + 1); setBaiHienTai(null); }
    else setBuoc("xong");
  };

  if (buoc === "cho") {
    return <ManCho dsDe={dsDe} chon={chonDe} paper={paper}
      dangTai={dangTai} onStart={batDau} />;
  }
  if (buoc === "thi") {
    /* `key` theo code: đổi phần thì PhanThi được dựng lại từ đầu, nên đồng hồ
       và chỉ số bài đều reset. Đổi BÀI trong cùng phần thì không — key không
       đổi, component sống tiếp, đồng hồ chạy tiếp. */
    return <PhanThi key={khoi[idx].code} section={khoi[idx]}
      attemptId={attemptId}
      answers={answers} setAnswers={setAnswers} onDone={xongPhan}
      onDoiBai={setBaiHienTai}
      onBlur={() => setBlurCount((n) => n + 1)} />;
  }
  return <KetQua sections={ketQua} blurCount={blurCount}
    onLai={() => { setPaper(null); setBuoc("cho"); }} />;
}
