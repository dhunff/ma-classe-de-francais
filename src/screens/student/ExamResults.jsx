import React, { useEffect, useState } from "react";
import { ShieldCheck, Clock, MessageSquare, ClipboardCheck, PenLine, ArrowLeft } from "lucide-react";
import PESelfEvaluation from "./PESelfEvaluation.jsx";
import { loadMyExamResults } from "../../shared/examResults.js";
import { NGUONG_PHAN, NGUONG_TONG } from "../exam/examPaper.js";
import { chamChinhThuc } from "../../shared/chamPeAI.js";
import NhanXetAI from "./NhanXetAI.jsx";
import { grilleToRubric, chuanHoaGrille } from "../../shared/grilleRubric.js";
import { tr } from "../../shared/i18n.jsx";

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
                <Clock size={12} /> {s.choCham ? (s.aiLoi === "HET_LUOT" ? tr("Hết 3 lượt AI chấm hôm nay · mai mở lại trang (VIP không giới hạn)", "Plus de correction IA aujourd'hui (3 par jour) · revenez demain (VIP illimité)", "No AI grading left today (3 per day) · come back tomorrow (VIP unlimited)") : s.aiLoi ? tr("AI chưa chấm được, mở lại trang để thử lại", "L'IA n'a pas pu corriger, rouvrez la page pour réessayer", "The AI couldn't grade it, reopen the page to retry") : tr("AI đang chấm…", "Correction IA en cours…", "AI grading…")) : tr("chưa có điểm", "pas encore de note", "no score yet")}
              </span>
            : <span className="text-base font-extrabold tabular-nums text-ink">
                {s.score}<span className="text-xs text-soft">/{s.points}</span>
              </span>}
        </span>
      </div>

      {yeu && (
        <p className="m-0 mt-1 text-xs font-bold text-danger">
          {tr("Dưới", "Moins de", "Below")} {NGUONG_PHAN}/{s.points} {tr("— riêng phần này đã đủ làm trượt cả bài.", "— cette partie suffit à faire échouer l'examen.", "— this part alone fails the exam.")}
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
                {tr("Bạn tự chấm:", "Votre auto-évaluation :", "Your self-assessment:")} <strong className="text-ink">{p.selfScore}/{p.max}</strong>.
                {p.score == null && tr(" Đây là ước lượng của chính bạn, chưa phải điểm chính thức.", " C'est votre propre estimation, pas une note officielle.", " This is your own estimate, not an official score.")}
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
          {p.answerId && p.score == null && p.loai !== "formulaire" && (
            <button
              type="button"
              onClick={() => onTuCham({
                answerId: p.answerId, questionId: p.questionId,
                level: s.level, deBai: p.prompt, baiLam: p.raw,
                daCo: p.selfBreakdown,
                /* Thang riêng của đề, nếu giáo viên có soạn. null thì
                   PESelfEvaluation tự dựng thang chuẩn theo level. */
                rubric: s.grille,
                boiCanh: s.consigne,
              })}
              className="flex w-full items-center gap-2 rounded-lg border-0 bg-surface px-3 py-2.5
                         text-left text-xs font-bold text-ink transition hover:bg-primary-soft"
            >
              <PenLine size={13} className="shrink-0 text-primary" aria-hidden="true" />
              {p.selfScore != null ? tr("Xem lại bản tự chấm", "Revoir mon auto-évaluation", "Review my self-assessment") : tr("Tự chấm bài viết này", "M'auto-évaluer sur cette production", "Self-assess this writing")}
              <span className="ml-auto font-normal text-soft">
                {p.selfScore != null ? tr("sửa được", "modifiable", "editable") : tr(`${s.level} · ${p.max} điểm`, `${s.level} · ${p.max} points`, `${s.level} · ${p.max} points`)}
              </span>
            </button>
          )}

          {p.score != null && p.answerId && (
            <NhanXetAI answerId={p.answerId} level={s.level} feedback={p.feedback}
              rubric={s.grille ? chuanHoaGrille(s.grille, s.level) : grilleToRubric(s.level)} />
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
            {s.passed === true && tr("Đạt", "Réussi", "Pass")}
            {s.passed === false && tr("Chưa đạt", "Non réussi", "Fail")}
            {s.passed === null && tr("Chưa kết luận", "Non conclu", "Pending")}
          </div>
        </div>
      </div>

      {/* Còn phần chưa chấm thì KHÔNG đoán kết luận. Nói "bạn đạt rồi" dựa trên
          hai phần ba bài thi là lời nói dối tử tế nhưng vẫn là nói dối. */}
      {s.passed === null && s.pending.length > 0 && (
        <p className="m-0 mt-2 text-xs text-soft">
          Còn {s.pending.map((p) => p.code).join(", ")} {tr("chưa có điểm, nên chưa kết luận được.", "n'a pas encore de note, résultat impossible à conclure.", "has no score yet, so no verdict.")}
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

  /* AI chấm phần viết (08/10, theo chủ dự án): mở trang là tự gọi AI chấm
     mọi bài viết CHƯA có điểm, rồi nạp lại. Mỗi bài chỉ một lần mỗi lần mở
     trang; máy chủ từ chối chấm lại bài đã có điểm. */
  const daGoi = React.useRef(new Set());
  const [aiLoi, setAiLoi] = useState(false);
  useEffect(() => {
    if (!sittings) return;
    const viec = [];
    for (const st of sittings) for (const sec of st.sections) for (const p of sec.pe) {
      if (p.score != null || !p.answerId || p.loai !== "open" || daGoi.current.has(p.answerId)) continue;
      daGoi.current.add(p.answerId);
      const rubric = sec.grille ? chuanHoaGrille(sec.grille, sec.level) : grilleToRubric(sec.level);
      viec.push(chamChinhThuc(p.answerId, rubric));
    }
    if (!viec.length) return;
    Promise.all(viec).then((kq) => {
      const het = kq.find((k) => k.ma === "HET_LUOT");
      if (het) setAiLoi("HET_LUOT");
      else if (kq.some((k) => !k.ok || !k.daGhi)) setAiLoi(true);
      loadMyExamResults().then(({ sittings: s }) => { if (s) setSittings(s); });
    });
  }, [sittings]);

  useEffect(() => {
    loadMyExamResults().then(({ sittings: s, error }) => {
      if (error) {
        /* Lỗi ĐỌC khác "chưa thi lần nào" — hai thứ trông giống nhau trên màn
           hình trống mà cần hai hành động khác hẳn. */
        setLoi(tr("Không đọc được kết quả. Kiểm tra mạng rồi thử lại.", "Impossible de lire les résultats. Vérifiez la connexion et réessayez.", "Couldn't load results. Check your connection and try again."));
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
          {tr("Về kết quả thi", "Retour aux résultats", "Back to results")}
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
      <h1 className="m-0 text-2xl font-extrabold text-ink">{tr("Kết quả thi thử", "Résultats des examens blancs", "Mock exam results")}</h1>
      <p className="m-0 mt-1 text-sm text-soft">
        {tr("Điểm từng phần, và nhận xét của giáo viên cho bài viết.", "Notes par partie et évaluation de la production écrite.", "Scores per part and feedback on your writing.")}
      </p>

      {/* Thang điểm nói ngay từ đầu, vì luật đạt có hai vế và vế thứ hai mới
          là vế hay làm trượt người ta. */}
      <p className="m-0 mt-4 flex items-start gap-2 rounded-xl bg-surface2 p-3 text-xs text-soft">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" />
        <span>
          {tr("Đạt DELF cần", "Pour réussir le DELF :", "To pass DELF you need")} <strong className="text-ink">≥ {NGUONG_TONG}{tr("/100 toàn bài", "/100 au total", "/100 overall")}</strong> {tr("VÀ", "ET", "AND")}{" "}
          <strong className="text-ink">≥ {NGUONG_PHAN}{tr("/25 mỗi phần", "/25 par partie", "/25 per part")}</strong>{tr(". Các đề ở đây không có phần thi nói, nên tổng điểm chỉ tính trên những phần đã làm.", ". La production orale n'est pas notée ici : le total ne compte que les parties faites.", ". Speaking isn't scored here, so the total only counts the parts you took.")}
        </span>
      </p>

      {loi && <p className="m-0 mt-5 rounded-xl bg-danger-soft p-4 text-sm font-semibold text-ink">{loi}</p>}

      {sittings === null ? (
        <p className="mt-8 text-center text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
      ) : sittings.length === 0 && !loi ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="m-0 font-bold text-ink">{tr("Bạn chưa thi thử lần nào", "Vous n'avez passé aucun examen blanc", "You haven't taken a mock exam yet")}</p>
          <p className="m-0 mt-1 text-sm text-soft">
            {tr("Vào mục « Thi thử » để làm một đề. Kết quả sẽ lưu lại ở đây.", "Allez dans « Examen blanc » pour passer un sujet. Les résultats s'afficheront ici.", "Go to « Mock exam » to take one. Results will appear here.")}
          </p>
        </div>
      ) : (
        <ul className="m-0 mt-6 list-none space-y-4 p-0">
          {sittings.map((s, i) => <Luot key={(s.examId ?? "cu") + i} s={{ ...s, sections: s.sections.map((x) => ({ ...x, aiLoi })) }} onTuCham={setDangCham} />)}
        </ul>
      )}
    </div>
  );
}
