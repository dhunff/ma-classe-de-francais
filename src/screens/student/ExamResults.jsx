import React, { useEffect, useState } from "react";
import { ShieldCheck, Clock, MessageSquare, ClipboardCheck, PenLine, ArrowLeft } from "lucide-react";
import PESelfEvaluation from "./PESelfEvaluation.jsx";
import { loadMyExamResults } from "../../shared/examResults.js";
import { NGUONG_PHAN, NGUONG_TONG } from "../exam/examPaper.js";

/* Kết quả thi thử — màn hình của học sinh.
 *
 * Đây là mảnh khép vòng chấm bài. Trước nó, điểm Production écrite và nhận xét
 * của giáo viên nằm trong database mà không có đường nào tới mắt người học —
 * giáo viên ngồi viết nhận xét cho một cái hộp rỗng.
 *
 * ══ VÌ SAO KHÔNG DÙNG LẠI MÀN KẾT QUẢ NGAY SAU KHI NỘP ══
 *
 * Màn hình đó tính điểm tại chỗ rồi vứt đi, và lúc đó phần PE còn "chờ chấm".
 * Điểm thật của PE chỉ có sau khi giáo viên chấm, có thể vài ngày sau. Nên ở
 * đây tổng điểm được tính LẠI mỗi lần mở, từ hai nguồn — máy chấm và người
 * chấm. Xem shared/examResults.js.
 */

const ngay = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

function Phan({ s, onTuCham }) {
  const yeu = s.score != null && s.score < NGUONG_PHAN;
  return (
    <li className={`rounded-xl border p-3 ${yeu ? "border-danger bg-danger-soft" : "border-line bg-surface2"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-ink">{s.code}</span>
        <span className="text-right">
          {s.score == null
            ? <span className="inline-flex items-center gap-1 text-xs font-bold text-warn">
                <Clock size={12} /> {s.choCham ? "giáo viên đang chấm" : "chưa có điểm"}
              </span>
            : <span className="text-base font-extrabold tabular-nums text-ink">
                {s.score}<span className="text-xs text-soft">/{s.points}</span>
              </span>}
        </span>
      </div>

      {yeu && (
        <p className="m-0 mt-1 text-xs font-bold text-danger">
          Dưới {NGUONG_PHAN}/{s.points} — riêng phần này đã đủ làm trượt cả bài.
        </p>
      )}

      {/* Nhận xét và điểm từng tiêu chí. Đây là lý do màn hình này tồn tại —
          con số một mình không dạy được gì, "Cohérence 1/3" mới chỉ đúng chỗ
          cần sửa. */}
      {s.pe.map((p, i) => (
        <div key={i} className="mt-2 space-y-2">
          {/* Bản tự chấm — hiện RIÊNG, không cộng vào điểm phần thi.
              Tự chấm không phải điểm: gộp chung thì một em rộng tay với chính
              mình sẽ thấy "Đạt" trên màn hình và tin vào đó. */}
          {p.selfScore != null && (
            <p className="m-0 flex items-start gap-2 rounded-lg bg-surface p-2.5 text-xs text-soft">
              <ClipboardCheck size={13} className="mt-0.5 shrink-0 text-primary" />
              <span>
                Bạn tự chấm: <strong className="text-ink">{p.selfScore}/{p.max}</strong>.
                {p.score == null && " Đây là ước lượng của chính bạn, chưa phải điểm chính thức."}
              </span>
            </p>
          )}

          {/* Chưa ai chấm → mời tự chấm.
              Trước đây bảng tự chấm dựng THẲNG ở đây, bên trong thẻ này. Nhưng
              trang kết quả rộng max-w-2xl, mà bố cục chia đôi cần cả chiều
              rộng để bài viết nằm cạnh thang chấm — nhồi vào đây thì hai cột
              thành hai cột giấy hẹp và mất đúng cái lợi của nó.

              Nên nó mở ra thành một màn riêng chiếm cả trang. Không thêm route:
              vẫn là màn kết quả, chỉ đổi thứ đang hiện — thêm route thì phải
              đụng navItems và check:nav, cho một màn không nằm ở thanh bên. */}
          {p.answerId && p.score == null && (
            <button
              type="button"
              onClick={() => onTuCham({
                answerId: p.answerId, questionId: p.questionId,
                level: s.level, deBai: p.prompt, baiLam: p.raw,
                daCo: p.selfBreakdown,
                /* Thang riêng của đề, nếu giáo viên có soạn. null thì
                   PESelfEvaluation tự dựng thang chuẩn theo level. */
                rubric: s.grille,
              })}
              className="flex w-full items-center gap-2 rounded-lg border-0 bg-surface px-3 py-2.5
                         text-left text-xs font-bold text-ink transition hover:bg-primary-soft"
            >
              <PenLine size={13} className="shrink-0 text-primary" aria-hidden="true" />
              {p.selfScore != null ? "Xem lại bản tự chấm" : "Tự chấm bài viết này"}
              <span className="ml-auto font-normal text-soft">
                {p.selfScore != null ? "sửa được" : `${s.level} · ${p.max} điểm`}
              </span>
            </button>
          )}

          {p.feedback && (
            <p className="m-0 flex items-start gap-2 rounded-lg bg-surface p-2.5 text-xs leading-relaxed text-ink">
              <MessageSquare size={13} className="mt-0.5 shrink-0 text-primary" />
              <span><strong className="text-soft">Nhận xét:</strong> {p.feedback}</span>
            </p>
          )}

          {p.selfBreakdown && typeof p.selfBreakdown === "object" && (
            <ul className="m-0 list-none space-y-1 p-0">
              {Object.entries(p.selfBreakdown)
                .filter(([, v]) => v && typeof v === "object" && "note" in v)
                .map(([k, v]) => (
                  <li key={k} className="flex items-baseline justify-between gap-3 rounded-lg bg-surface px-2.5 py-1.5 text-xs">
                    <span className="min-w-0 text-ink">
                      {v.label ?? k}
                      {v.justification && (
                        <span className="block text-soft">{v.justification}</span>
                      )}
                    </span>
                    <span className="shrink-0 font-bold tabular-nums text-ink">
                      {v.note}<span className="text-soft">/{v.max}</span>
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      ))}
    </li>
  );
}

function Luot({ s, onTuCham }) {
  const mau = s.passed === true ? "text-ok" : s.passed === false ? "text-danger" : "text-warn";

  return (
    <li className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <span className="text-sm font-bold text-ink">{s.title}</span>
          {s.level && <span className="ml-2 rounded-full bg-surface2 px-2 py-0.5 text-xs font-bold text-soft">{s.level}</span>}
          <div className="mt-0.5 text-xs text-soft">{ngay(s.at)}</div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-extrabold tabular-nums ${mau}`}>
            {s.total}<span className="text-sm text-soft">/{s.maxScored}</span>
          </div>
          <div className={`text-xs font-bold ${mau}`}>
            {s.passed === true && "Đạt"}
            {s.passed === false && "Chưa đạt"}
            {s.passed === null && "Chưa kết luận"}
          </div>
        </div>
      </div>

      {/* Còn phần chưa chấm thì KHÔNG đoán kết luận. Nói "bạn đạt rồi" dựa trên
          hai phần ba bài thi là lời nói dối tử tế nhưng vẫn là nói dối. */}
      {s.passed === null && s.pending.length > 0 && (
        <p className="m-0 mt-2 text-xs text-soft">
          Còn {s.pending.map((p) => p.code).join(", ")} chưa có điểm, nên chưa kết luận được.
        </p>
      )}

      <ul className="m-0 mt-4 list-none space-y-2 p-0">
        {s.sections.map((x) => <Phan key={x.code + x.exerciseId} s={x} onTuCham={onTuCham} />)}
      </ul>
    </li>
  );
}

export default function ExamResults() {
  const [sittings, setSittings] = useState(null);
  const [loi, setLoi] = useState("");
  /* Bài đang tự chấm, hoặc null khi đang xem danh sách. Giữ cả object thay vì
     mỗi answerId: dữ liệu đã nằm sẵn trong `sittings`, đi tìm lại nó bằng id là
     thêm một đường có thể lệch mà chẳng được gì. */
  const [dangCham, setDangCham] = useState(null);

  useEffect(() => {
    loadMyExamResults().then(({ sittings: s, error }) => {
      if (error) {
        /* Lỗi ĐỌC khác "chưa thi lần nào" — hai thứ trông giống nhau trên màn
           hình trống mà cần hai hành động khác hẳn. */
        setLoi("Không đọc được kết quả. Kiểm tra mạng rồi thử lại.");
        setSittings([]);
        return;
      }
      setSittings(s);
    });
  }, []);

  /* ── Màn tự chấm ──
   *
   * Rộng hơn hẳn trang kết quả (max-w-6xl thay vì max-w-2xl) vì bố cục chia đôi
   * cần chỗ cho bài viết nằm CẠNH thang chấm. Đó là toàn bộ lý do nó là một màn
   * riêng chứ không nhét vào thẻ kết quả. */
  if (dangCham) {
    return (
      <div className="mx-auto max-w-6xl py-6">
        <button
          type="button"
          onClick={() => setDangCham(null)}
          className="mb-5 flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2
                     text-xs font-bold text-soft transition hover:text-ink"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Về kết quả thi
        </button>

        <PESelfEvaluation
          {...dangCham}
          /* Lưu xong thì đọc lại kết quả và quay ra, KHÔNG reload cả trang.
             Bản cũ gọi window.location.reload() — nó chạy được, nhưng vứt luôn
             vị trí cuộn và bắt tải lại toàn bộ ứng dụng cho một dòng dữ liệu
             vừa đổi. */
          onXong={() => {
            loadMyExamResults().then(({ sittings: s }) => { if (s) setSittings(s); });
            setDangCham(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="m-0 text-2xl font-extrabold text-ink">Kết quả thi thử</h1>
      <p className="m-0 mt-1 text-sm text-soft">
        Điểm từng phần, và nhận xét của giáo viên cho bài viết.
      </p>

      {/* Thang điểm nói ngay từ đầu, vì luật đạt có hai vế và vế thứ hai mới
          là vế hay làm trượt người ta. */}
      <p className="m-0 mt-4 flex items-start gap-2 rounded-xl bg-surface2 p-3 text-xs text-soft">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" />
        <span>
          Đạt DELF cần <strong className="text-ink">≥ {NGUONG_TONG}/100 toàn bài</strong> VÀ{" "}
          <strong className="text-ink">≥ {NGUONG_PHAN}/25 mỗi phần</strong>. Các đề ở đây không
          có phần thi nói, nên tổng điểm chỉ tính trên những phần đã làm.
        </span>
      </p>

      {loi && <p className="m-0 mt-5 rounded-xl bg-danger-soft p-4 text-sm font-semibold text-ink">{loi}</p>}

      {sittings === null ? (
        <p className="mt-8 text-center text-sm text-soft">Đang tải…</p>
      ) : sittings.length === 0 && !loi ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="m-0 font-bold text-ink">Bạn chưa thi thử lần nào</p>
          <p className="m-0 mt-1 text-sm text-soft">
            Vào mục « Thi thử » để làm một đề. Kết quả sẽ lưu lại ở đây.
          </p>
        </div>
      ) : (
        <ul className="m-0 mt-6 list-none space-y-4 p-0">
          {sittings.map((s, i) => <Luot key={(s.examId ?? "cu") + i} s={s} onTuCham={setDangCham} />)}
        </ul>
      )}
    </div>
  );
}
