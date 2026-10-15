import React, { useEffect, useState } from "react";
import { ShieldCheck, Trophy, Clock, MessageSquare, ClipboardCheck, PenLine, ArrowLeft } from "lucide-react";
import PESelfEvaluation from "./PESelfEvaluation.jsx";
import POSelfEvaluation from "./POSelfEvaluation.jsx";
import { Mic } from "lucide-react";
import { loadMyExamResults } from "../../shared/examResults.js";
import { NGUONG_PHAN, NGUONG_TONG } from "../exam/examPaper.js";
import { chamChinhThuc } from "../../shared/chamPeAI.js";
import NhanXetAI from "./NhanXetAI.jsx";
import BaiVietMau from "./BaiVietMau.jsx";
import { grilleToRubric, chuanHoaGrille } from "../../shared/grilleRubric.js";
import { tr } from "../../shared/i18n.jsx";
import { supabase } from "../../storageShim.js";
import { Leon } from "../../shared/leon.jsx";
import NutTieng from "../../shared/NutTieng.jsx";
import { BangKetLuan, ThanhPhan } from "../exam/KetQuaVisual.jsx";

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
  const choCham = s.score == null && s.po ? tr("AI đang chấm… hoặc bạn tự chấm", "Correction IA en cours… ou auto-évaluez-vous", "AI grading… or self-assess") : s.score == null ? (s.choCham ? (s.aiLoi === "HET_LUOT" ? tr("Hết 3 lượt AI chấm hôm nay · mai mở lại trang (VIP tới 100 lượt AI/ngày)", "Plus de correction IA aujourd'hui (3 par jour) · revenez demain (VIP : 100 requêtes IA/jour)", "No AI grading left today (3 per day) · come back tomorrow (VIP: 100 AI requests/day)") : s.aiLoi ? tr("AI chưa chấm được, mở lại trang để thử lại", "L'IA n'a pas pu corriger, rouvrez la page pour réessayer", "The AI couldn't grade it, reopen the page to retry") : tr("AI đang chấm…", "Correction IA en cours…", "AI grading…")) : tr("chưa có điểm", "pas encore de note", "no score yet")) : null;
  return (
    <li className="list-none">
    <ThanhPhan code={s.code} score={s.score} points={s.points} nguong={s.points ? NGUONG_PHAN : null} choCham={choCham}>
      {/* Nhận xét và điểm từng tiêu chí. Đây là lý do màn hình này tồn tại —
          con số một mình không dạy được gì, "Cohérence 1/3" mới chỉ đúng chỗ
          cần sửa. */}
      {/* Phần nói (12/10): tự chấm theo grille PO chính thức, AI gợi ý. */}
      {s.po && (
        <button type="button" onClick={() => onTuCham({ loai: "po", po: s.po, exerciseId: s.exerciseId, consigne: s.consigne })}
          className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-surface px-3 py-2.5 text-left font-sans text-xs font-bold text-ink transition hover:bg-primary-soft">
          <Mic size={13} className="shrink-0 text-primary" aria-hidden="true" />
          {s.score != null
            ? (s.po.nguon === "ai" ? tr("AI đã chấm: xem chi tiết hoặc tự chấm lại", "Noté par l'IA : voir ou s'auto-évaluer", "AI-graded: review or self-assess") : tr("Xem lại / sửa bản tự chấm phần nói", "Revoir mon auto-évaluation orale", "Review my speaking self-assessment"))
            : tr("Tự chấm phần nói (AI gợi ý)", "M'auto-évaluer à l'oral (suggestions IA)", "Self-assess speaking (AI suggestions)")}
          <span className="ml-auto font-normal text-soft">{s.po.cap} · 25 {tr("điểm", "points", "points")}</span>
        </button>
      )}
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
          {p.answerId && p.loai === "open" && <BaiVietMau answerId={p.answerId} />}

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
    </ThanhPhan>
    </li>
  );
}

function Luot({ s, onTuCham, i = 0 }) {
  return (
    <li className="mcf-cau-vao rounded-3xl border border-solid border-line bg-surface p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]" style={{ animationDelay: `${i * 80}ms` }}>
      <BangKetLuan diem={s.total} toiDa={s.maxScored} passed={s.passed}
        tieuDe={[s.title, s.level].filter(Boolean).join(" · ")} phu={ngay(s.at)} />

      {/* Còn phần chưa chấm thì KHÔNG đoán kết luận. Nói "bạn đạt rồi" dựa trên
          hai phần ba bài thi là lời nói dối tử tế nhưng vẫn là nói dối. */}
      {s.passed === null && s.pending.length > 0 && (
        <p className="m-0 mt-2 text-xs text-soft">
          {tr("Còn", "Encore", "Still")} {s.pending.map((p) => p.code).join(", ")} {tr("chưa có điểm, nên chưa kết luận được.", "n'a pas encore de note, résultat impossible à conclure.", "has no score yet, so no verdict.")}
        </p>
      )}

      <ul className="m-0 mt-4 grid list-none gap-3 p-0">
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
    /* 14/10: phần nói chưa có điểm → AI chấm theo grille (cham-po chinhThuc). */
    for (const st of sittings) for (const sec of st.sections) {
      if (!sec.po || sec.score != null || daGoi.current.has(sec.po.attemptId)) continue;
      daGoi.current.add(sec.po.attemptId);
      viec.push(supabase.functions.invoke("cham-po", { body: { attemptId: sec.po.attemptId, chinhThuc: true } })
        .then(({ data }) => ({ ok: !!data?.ok, daGhi: data?.diem != null, ma: data?.ma })).catch(() => ({ ok: false })));
    }
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

        {dangCham.loai === "po" ? (
          <POSelfEvaluation {...dangCham} onXong={() => {
            loadMyExamResults().then(({ sittings: s }) => { if (s) setSittings(s); });
            setDangCham(null);
          }} />
        ) : (
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
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mcf-cau-vao relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-primary to-indigo-600 p-6 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
        <span aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <Leon cam="hoc" size={104} className="mcf-leon-bay shrink-0 drop-shadow-[0_12px_18px_rgba(0,0,0,0.3)] max-sm:h-20 max-sm:w-20" />
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-3xl font-extrabold tracking-tight">{tr("Kết quả thi thử", "Résultats des examens blancs", "Mock exam results")}</h1>
            <p className="m-0 mt-1 text-sm text-white/85">{tr("Điểm từng phần và phiếu nhận xét AI cho bài viết.", "Notes par partie et évaluation IA de la production écrite.", "Scores per part and AI feedback on your writing.")}</p>
            {Array.isArray(sittings) && sittings.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-extrabold">
                <span className="rounded-full bg-white/20 px-3 py-1">{sittings.length} {tr("lượt thi", "examen(s)", "sitting(s)")}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1"><Trophy size={12} /> {sittings.filter((x) => x.passed === true).length} {tr("đạt", "réussi(s)", "passed")}</span>
              </div>
            )}
          </div>
          <NutTieng />
        </div>
      </header>

      {/* Thang điểm nói ngay từ đầu, vì luật đạt có hai vế và vế thứ hai mới
          là vế hay làm trượt người ta. */}
      <p className="m-0 mt-4 flex items-start gap-2 rounded-2xl bg-surface2 p-3 text-xs text-soft">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" />
        <span>
          {tr("Đạt DELF cần", "Pour réussir le DELF :", "To pass DELF you need")} <strong className="text-ink">≥ 50 %{tr(" tổng điểm", " du total", " of the total")}</strong> {tr("VÀ", "ET", "AND")}{" "}
          <strong className="text-ink">≥ {NGUONG_PHAN}{tr("/25 mỗi phần", "/25 par partie", "/25 per part")}</strong>{tr(". Thi cả phần nói thì tổng /100 (cần 50); bỏ phần nói thì tổng /75 (cần 37,5). Phần nói bạn tự chấm theo thang DELF chính thức, có AI gợi ý.", ". Avec l'oral, total /100 (50 requis) ; sans l'oral, /75 (37,5 requis). L'oral s'auto-évalue avec la grille officielle, suggestions de l'IA.", ". With speaking the total is /100 (50 needed); without it /75 (37.5 needed). You self-assess speaking with the official grid, with AI suggestions.")}
        </span>
      </p>

      {loi && <p className="m-0 mt-5 rounded-xl bg-danger-soft p-4 text-sm font-semibold text-ink">{loi}</p>}

      {sittings === null ? (
        <p className="mt-8 text-center text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
      ) : sittings.length === 0 && !loi ? (
        <div className="mt-8 rounded-3xl border border-solid border-line bg-surface p-8 text-center">
          <Leon cam="buon-ngu" size={110} className="mx-auto block" />
          <p className="m-0 mt-2 font-bold text-ink">{tr("Bạn chưa thi thử lần nào", "Vous n'avez passé aucun examen blanc", "You haven't taken a mock exam yet")}</p>
          <p className="m-0 mt-1 text-sm text-soft">
            {tr("Vào mục « Thi thử » để làm một đề. Kết quả sẽ lưu lại ở đây.", "Allez dans « Examen blanc » pour passer un sujet. Les résultats s'afficheront ici.", "Go to « Mock exam » to take one. Results will appear here.")}
          </p>
        </div>
      ) : (
        <ul className="m-0 mt-6 list-none space-y-4 p-0">
          {sittings.map((s, i) => <Luot key={(s.examId ?? "cu") + i} i={i} s={{ ...s, sections: s.sections.map((x) => ({ ...x, aiLoi })) }} onTuCham={setDangCham} />)}
        </ul>
      )}
    </div>
  );
}
