import React, { useMemo, useState } from "react";
import {
  FileText, ScrollText, Info, CheckCircle2, RotateCcw,
  BookOpen, ChevronDown, ChevronUp, AlertTriangle,
} from "lucide-react";
import { supabase } from "../../storageShim.js";
import { grilleToRubric, giongThangChuan } from "../../shared/grilleRubric.js";
import { TEN_NHOM, THU_TU_NHOM } from "../../shared/peBareme.js";

/* Tự chấm Production écrite — bố cục chia đôi màn hình.
 *
 * ══ VÌ SAO TỰ CHẤM, KHÔNG PHẢI MÁY CHẤM ══
 *
 * Giá trị không nằm ở con số. Nó nằm ở chỗ người học phải đọc lại bài mình MỘT
 * LẦN NỮA, lần này qua mắt của người chấm: "cohérence — mình có dùng connecteur
 * nào không, hay toàn 'et' với 'après'?". Một con số ai đó đưa cho không bắt ai
 * làm việc đó.
 *
 * ══ Ý TƯỞNG BỐ CỤC ══
 *
 * Người học phải đọc lại bài TRONG LÚC đi qua từng tiêu chí. Nếu bài viết cuộn
 * mất lên trên khi họ chấm tới tiêu chí thứ tám, họ sẽ chấm bằng trí nhớ — và
 * trí nhớ về bài mình vừa viết là thứ rộng lượng nhất trên đời.
 *
 * Nên: cột trái (đề + bài làm) cuộn ĐỘC LẬP với cột phải (thang chấm).
 *
 * ══ MÀU: DÙNG TOKEN, KHÔNG VIẾT HEX ══
 *
 * `bg-surface` chứ không phải `bg-[#1C1D22]`. Token tự đảo giữa bản sáng và bản
 * tối (xem styles/tokens.css), còn hex thì đóng đinh một bản và bản kia thành
 * chữ tối trên nền tối. `check:design` canh chỗ này.
 *
 *   bg-surface   →  #FFFFFF sáng  ·  #1E1E27 tối
 *   text-ink     →  #23232E sáng  ·  #E6E6EC tối
 *   text-soft    →  #6E7280 sáng  ·  #9A9AA8 tối
 *
 * ══ TAILWIND PREFLIGHT ĐANG TẮT ══
 *
 * `<button>` còn viền xám mặc định, `<h2>` còn margin. Nên mọi nút ở đây có
 * `border-0`, mọi tiêu đề có `m-0`.
 *
 * ══ CHẾ ĐỘ XEM THỬ ══
 *
 * Không có `answerId` nghĩa là không có gì để lưu — component dùng dữ liệu mẫu
 * và tắt nút lưu. Đó là cách `preview.html` dựng được màn này mà không cần đăng
 * nhập và không chạm vào dữ liệu thật.
 */

const SUJET_MAU =
  "Votre municipalité envisage de fermer la bibliothèque de quartier pour " +
  "financer un nouveau parking. Vous écrivez au maire pour exprimer votre " +
  "désaccord et proposer une alternative. (250 mots minimum)";

const COPIE_MAU = `Monsieur le Maire,

Je me permets de vous écrire au sujet du projet de fermeture de la bibliothèque
du quartier Saint-Michel, annoncé lors du conseil municipal du 12 mars. En tant
qu'habitante de ce quartier depuis huit ans, je souhaite vous faire part de mon
désaccord et vous soumettre une proposition.

Tout d'abord, il me semble important de rappeler que cette bibliothèque n'est pas
seulement un lieu où l'on emprunte des livres. Chaque mercredi, une quarantaine
d'enfants y participent à l'atelier de lecture, et les étudiants y trouvent un
espace de travail calme que beaucoup n'ont pas chez eux. Fermer ce lieu
reviendrait à supprimer le seul service public gratuit du quartier.

Certes, on pourrait objecter que le manque de places de stationnement gêne les
commerçants de la rue principale. Cette difficulté est réelle et je ne la
minimise pas. Toutefois, une étude menée en 2023 dans la ville voisine a montré
qu'un parking souterrain n'augmentait la fréquentation des commerces que de trois
pour cent, alors qu'une bibliothèque active attire un public quotidien.

C'est pourquoi je propose une solution intermédiaire : conserver la bibliothèque
et aménager le terrain vague situé derrière l'ancienne école. Ce terrain, qui
appartient déjà à la commune, permettrait de créer une trentaine de places sans
détruire un équipement culturel. Le coût serait d'ailleurs inférieur, puisqu'il
n'y aurait ni démolition ni dépollution à prévoir.

Je reste naturellement à votre disposition pour en discuter et vous remercie par
avance de l'attention que vous porterez à cette lettre.

Je vous prie d'agréer, Monsieur le Maire, l'expression de mes salutations
distinguées.

Claire Fontaine`;

/* Thanh cuộn mảnh.
 *
 * Không cần plugin: Tailwind nhắm thẳng pseudo-element bằng biến thể tuỳ ý
 * `[&::-webkit-scrollbar]`. Firefox đi qua thuộc tính CSS chuẩn, nên cần cả
 * `[scrollbar-width:thin]` — hai dòng vì hai trình duyệt làm khác nhau. */
const THANH_CUON =
  "[scrollbar-width:thin] " +
  "[&::-webkit-scrollbar]:w-1.5 " +
  "[&::-webkit-scrollbar-track]:bg-transparent " +
  "[&::-webkit-scrollbar-thumb]:rounded-full " +
  "[&::-webkit-scrollbar-thumb]:bg-line-strong/40 " +
  "hover:[&::-webkit-scrollbar-thumb]:bg-line-strong/70";

/* Một tiêu chí, một thanh trượt.
 *
 * `step` lấy từ dữ liệu (0,5) chứ không viết cứng: thang DELF là các nấc nửa
 * điểm rời rạc, nên thanh trượt phải BÁM NẤC. Thanh trượt trơn gợi ý một độ
 * chính xác không có thật — không ai chấm được 2,37/4.
 *
 * Dưới thanh luôn hiện mô tả của nấc đang chọn. Đây là chỗ thanh trượt hay thua
 * nút bấm: kéo thì nhanh, nhưng nhanh tới mức người ta không đọc mốc nào cả. */
function ThanhTieuChi({ c, gia, onChange }) {
  const chuaCham = gia == null;
  const v = chuaCham ? 0 : gia;

  /* Nấc đang áp dụng = mốc cao nhất mà điểm còn với tới. `bareme` xếp giảm dần
     nên chỉ cần tìm phần tử đầu tiên thoả. Thang không có mốc (A1/A2, hoặc
     thang giáo viên tự soạn) thì lùi về `description`. */
  const nac = c.bareme?.find(([at]) => v >= at) ?? null;
  const phanTram = (v / c.max_score) * 100;

  return (
    <li className="rounded-md bg-surface p-5 ring-1 ring-line">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="m-0 text-sm font-bold leading-snug text-ink">{c.name}</h4>
          <p className="m-0 mt-1 text-xs leading-relaxed text-soft">{c.description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
            chuaCham ? "bg-surface2 text-soft" : "bg-primary-soft text-primary"
          }`}
        >
          {chuaCham ? `— / ${c.max_score}` : `${v} / ${c.max_score}`}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={c.max_score}
        step={c.step}
        value={v}
        aria-label={`${c.name}, tối đa ${c.max_score} điểm`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface2 accent-primary
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                   focus-visible:outline-primary"
        style={{
          /* Vệt màu bên trái núm. `input[type=range]` không có phần tử riêng cho
             nó ở mọi trình duyệt, nên vẽ bằng gradient trên chính nền. */
          backgroundImage: chuaCham
            ? "none"
            : `linear-gradient(to right, rgb(var(--mcf-primary-rgb)) ${phanTram}%, transparent ${phanTram}%)`,
        }}
      />

      <div className="mt-1.5 flex justify-between text-[10px] font-semibold tabular-nums text-soft">
        <span>0</span>
        <span>{c.max_score}</span>
      </div>

      {nac && (
        <p className="m-0 mt-3 flex items-start gap-2 rounded-sm bg-surface2 px-3 py-2 text-xs leading-relaxed text-soft">
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {chuaCham ? (
              <>Kéo thanh trượt để chấm. Mốc cao nhất: <strong className="text-ink">{c.bareme[0][1]}</strong>.</>
            ) : (
              <><strong className="text-ink">{nac[0]} điểm</strong> — {nac[1]}</>
            )}
          </span>
        </p>
      )}
    </li>
  );
}

export default function PESelfEvaluation({
  answerId, questionId, level = "B2",
  deBai, baiLam, daCo, rubric: rubricNgoai, onXong,
}) {
  /* Không có `answerId` → chế độ xem thử: dữ liệu mẫu, không lưu được. */
  const xemThu = !answerId;
  const rubric = useMemo(() => {
    if (!rubricNgoai) return grilleToRubric(level);
    /* Tính LẠI `official` thay vì tin cờ đã lưu.
       Cờ nằm trong JSON có thể cũ hơn dữ liệu quanh nó: thang lưu trước khi cờ
       được tính đúng đang mang `official: false` dù không sửa gì, và học sinh
       sẽ đọc « không phải thang DELF chính thức » cho một thang chính thức.
       Suy lại từ nội dung thì không có bản nào cũ được. */
    return {
      ...rubricNgoai,
      official: giongThangChuan(rubricNgoai, rubricNgoai.level ?? level),
    };
  }, [rubricNgoai, level]);

  const consigne = (xemThu ? SUJET_MAU : deBai) || "(đề bài không còn trong hệ thống)";
  const copie = String((xemThu ? COPIE_MAU : baiLam) ?? "");

  /* Khoá theo `id` của tiêu chí, KHÔNG theo chỉ số mảng. Giáo viên sửa thang
     sau khi đã có người chấm thì `id` là thứ còn neo được; chỉ số mảng sẽ lặng
     lẽ gán điểm của tiêu chí này sang tiêu chí khác. */
  const [diem, setDiem] = useState(() => {
    const d = {};
    for (const c of rubric.criteria) {
      const cu = daCo?.[c.id]?.note;
      if (cu != null) d[c.id] = Number(cu);
    }
    return d;
  });
  const [dangLuu, setDangLuu] = useState(false);
  const [daLuu, setDaLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [baiMau, setBaiMau] = useState(null);   // null = chưa xin
  const [moMau, setMoMau] = useState(false);

  const dat = (id, v) => { setDiem((cu) => ({ ...cu, [id]: v })); setDaLuu(false); };

  const { tong, daCham } = useMemo(() => {
    const vals = rubric.criteria.map((c) => diem[c.id]).filter((v) => v != null);
    return {
      /* Nhân đôi rồi chia đôi: cộng nhiều số 0,5 trong dấu phẩy động có thể ra
         17.499999999999996, và ô điểm sẽ hiện đúng như vậy. */
      tong: Math.round(vals.reduce((n, v) => n + v, 0) * 2) / 2,
      daCham: vals.length,
    };
  }, [diem, rubric]);

  const xong = daCham === rubric.criteria.length;
  const soTu = copie.trim() ? copie.trim().split(/\s+/).length : 0;

  /* Bài mẫu tải khi người dùng MỞ, không tải sẵn. Tải sẵn thì nó nằm trong bộ
     nhớ trang ngay lúc học sinh chưa muốn xem — và mở DevTools là thấy.
     Nằm ở `questions.answer_key.model`, cột không cấp SELECT cho trình duyệt;
     RPC `get_model_answer` (migration 030) mở đúng một khe: đã nộp thì đọc được. */
  const xinBaiMau = async () => {
    setMoMau((v) => !v);
    if (baiMau !== null || !questionId) return;
    const { data, error } = await supabase.rpc("get_model_answer", { p_question: questionId });
    setBaiMau(error ? "" : String(data ?? ""));
  };

  const luu = async () => {
    if (xemThu) return;
    setDangLuu(true); setLoi("");
    const breakdown = {};
    for (const c of rubric.criteria) {
      breakdown[c.id] = { note: diem[c.id], max: c.max_score, label: c.name };
    }
    const { data, error } = await supabase.rpc("save_self_assessment", {
      p_answer: answerId, p_score: tong, p_max: rubric.total, p_breakdown: breakdown,
    });
    setDangLuu(false);
    if (error || !data?.ok) {
      setLoi("Không lưu được: " + (data?.reason ?? error?.message ?? "lỗi không rõ"));
      return;
    }
    setDaLuu(true);
    onXong?.(tong, breakdown);
  };

  return (
    /* ══ CƠ CHẾ CHIA ĐÔI ══
     *
     * `items-start` là dòng quan trọng nhất. Mặc định grid kéo mọi ô cao bằng
     * nhau (`stretch`), và một cột cao bằng cột cạnh nó thì KHÔNG BAO GIỜ sticky
     * được — nó đã chạm đáy vùng cuộn rồi, không còn chỗ để dính. */
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">

      {/* ── CỘT TRÁI: đề bài + bài làm ── */}
      <section className="lg:sticky lg:top-0">
        <div className="rounded-md bg-surface ring-1 ring-line">
          <header className="flex items-center gap-2.5 border-b border-line px-5 py-4">
            <ScrollText size={16} className="text-primary" aria-hidden="true" />
            <h2 className="m-0 text-sm font-bold text-ink">Đề bài</h2>
            <span className="ml-auto rounded-full bg-surface2 px-2.5 py-1 text-[11px] font-bold text-soft">
              {rubric.level}
              {rubric.min_words ? ` · tối thiểu ${rubric.min_words} từ` : ""}
            </span>
          </header>
          <p className="m-0 px-5 py-4 text-sm italic leading-relaxed text-soft">{consigne}</p>
        </div>

        <div className="mt-4 flex flex-col rounded-md bg-surface ring-1 ring-line">
          <header className="flex items-center gap-2.5 border-b border-line px-5 py-4">
            <FileText size={16} className="text-primary" aria-hidden="true" />
            <h2 className="m-0 text-sm font-bold text-ink">Bài làm của bạn</h2>
            {soTu > 0 && (
              <span
                className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${
                  !rubric.min_words || soTu >= rubric.min_words
                    ? "bg-ok-soft text-ok"
                    : "bg-warn-soft text-warn"
                }`}
              >
                {soTu} từ
              </span>
            )}
          </header>

          {/* Vùng cuộn ĐỘC LẬP.
             `max-h` chứ không phải `h`: bài ngắn thì thẻ co lại theo nội dung,
             không để một khoảng trống cao 60vh bên dưới. */}
          <div className={`max-h-[min(60vh,640px)] overflow-y-auto px-5 py-4 ${THANH_CUON}`}>
            {copie.trim() ? (
              <pre className="m-0 whitespace-pre-wrap font-sans text-sm leading-7 text-ink">{copie}</pre>
            ) : (
              <p className="m-0 text-sm italic text-soft">(bạn nộp bài trống)</p>
            )}
          </div>
        </div>

        {/* Bài mẫu đặt SAU phần bài làm, và phải bấm mới hiện. Đọc bài mẫu trước
            rồi mới chấm thì người ta chấm bài mẫu chứ không chấm bài mình. */}
        {questionId && (
          <div className="mt-4">
            <button
              type="button"
              onClick={xinBaiMau}
              className="flex w-full items-center gap-2 rounded-md border-0 bg-surface px-5 py-3.5
                         text-sm font-bold text-ink ring-1 ring-line transition hover:bg-surface2"
            >
              <BookOpen size={15} className="text-primary" aria-hidden="true" />
              {moMau ? "Ẩn bài mẫu" : "Xem bài mẫu tham khảo"}
              {moMau
                ? <ChevronUp size={15} className="ml-auto text-soft" aria-hidden="true" />
                : <ChevronDown size={15} className="ml-auto text-soft" aria-hidden="true" />}
            </button>

            {moMau && (
              <div className={`mt-2 max-h-[40vh] overflow-y-auto rounded-md bg-surface px-5 py-4 ring-1 ring-line ${THANH_CUON}`}>
                {baiMau === null ? (
                  <p className="m-0 text-sm text-soft">Đang tải…</p>
                ) : baiMau.trim() ? (
                  <pre className="m-0 whitespace-pre-wrap font-sans text-sm leading-7 text-ink">{baiMau}</pre>
                ) : (
                  <p className="m-0 text-sm italic text-soft">
                    Đề này chưa có bài mẫu. Hãy hỏi giáo viên.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── CỘT PHẢI: thang chấm ── */}
      <section className="flex min-h-0 flex-col">
        <div className="mb-4">
          <h2 className="m-0 text-base font-bold text-ink">
            Tự chấm theo tiêu chí DELF {rubric.level}
          </h2>
          <p className="m-0 mt-1 text-xs leading-relaxed text-soft">
            Đọc lại bài bên trái theo từng tiêu chí một. Giá trị không nằm ở con số cuối —
            nó nằm ở chỗ bạn đọc bài mình một lần nữa qua mắt người chấm.
          </p>
        </div>

        {/* A1/A2 là thang phỏng theo, và thang giáo viên tự sửa cũng vậy. Nói ra,
            đừng để người học tưởng con số này là điểm chính thức của kỳ thi. */}
        {!rubric.official && (
          <p className="m-0 mb-4 flex items-start gap-2 rounded-md bg-warn-soft px-4 py-3 text-xs leading-relaxed text-warn">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              {rubric.adapted
                ? `Thang ${rubric.level} ở đây là bản phỏng theo, quy về ${rubric.total} điểm. Đề thi thật chia phần viết thành hai bài tập với thang riêng.`
                : "Thang này do giáo viên tuỳ chỉnh, không phải thang DELF chính thức."}
            </span>
          </p>
        )}

        {THU_TU_NHOM.map((cat) => {
          const list = rubric.criteria.filter((c) => c.category === cat);
          if (!list.length) return null;
          const sum = list.reduce((n, c) => n + c.max_score, 0);
          return (
            <div key={cat} className="mb-6">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="m-0 text-[11px] font-bold uppercase tracking-widest text-soft">
                  {TEN_NHOM[cat]}
                </h3>
                <span className="text-[11px] font-bold tabular-nums text-soft">{sum} điểm</span>
              </div>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {list.map((c) => (
                  <ThanhTieuChi key={c.id} c={c} gia={diem[c.id]} onChange={(v) => dat(c.id, v)} />
                ))}
              </ul>
            </div>
          );
        })}

        {/* ── Chân cột: tổng điểm ──
           `sticky bottom-0` dính vào ĐÁY vùng cuộn.

           ⚠️ Bẫy: `position: sticky` chết lặng nếu BẤT KỲ tổ tiên nào có
           `overflow: hidden`. Vỏ app (AppLayout) khoá tràn ở tấm thẻ và chỉ cho
           `<main>` cuộn — nên phần tử này dính theo `<main>`, không theo cửa sổ.
           Nếu một ngày nó ngừng dính, hãy đi ngược cây DOM tìm `overflow-hidden`
           chứ đừng sửa `bottom`. */}
        <div className="sticky bottom-0 -mx-1 mt-2 px-1 pb-1">
          <div className="rounded-md bg-surface p-4 shadow-md ring-1 ring-line">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-widest text-soft">
                  Tổng điểm
                </span>
                <p className="m-0 mt-0.5 text-2xl font-extrabold tabular-nums leading-none text-ink">
                  {daCham === 0 ? "—" : tong}
                  <span className="ml-1 text-sm font-bold text-soft">/ {rubric.total}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {daCham > 0 && (
                  <button
                    type="button"
                    onClick={() => { setDiem({}); setDaLuu(false); setLoi(""); }}
                    className="flex items-center gap-1.5 rounded-full border-0 bg-surface2 px-3 py-2
                               text-xs font-bold text-soft transition hover:text-ink"
                  >
                    <RotateCcw size={13} aria-hidden="true" />
                    Chấm lại
                  </button>
                )}
                <button
                  type="button"
                  disabled={!xong || dangLuu || daLuu || xemThu}
                  onClick={luu}
                  className="flex items-center gap-1.5 rounded-full border-0 bg-primary px-4 py-2
                             text-xs font-bold text-on-primary transition
                             disabled:cursor-not-allowed disabled:bg-surface2 disabled:text-soft"
                >
                  <CheckCircle2 size={14} aria-hidden="true" />
                  {dangLuu ? "Đang lưu…" : daLuu ? "Đã lưu" : "Lưu bản tự chấm"}
                </button>
              </div>
            </div>

            {/* Thanh tiến độ đo SỐ TIÊU CHÍ ĐÃ CHẤM, không đo điểm. Người dùng cần
                biết còn bao nhiêu việc, không phải mình đang được bao nhiêu. */}
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface2">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${(daCham / rubric.criteria.length) * 100}%` }}
              />
            </div>

            <p className="m-0 mt-2 text-[11px] font-semibold text-soft">
              {xemThu
                ? "Chế độ xem thử — dữ liệu mẫu, không lưu được."
                : xong
                  ? "Đã chấm đủ tiêu chí."
                  : `Còn ${rubric.criteria.length - daCham} tiêu chí chưa chấm.`}
            </p>

            {loi && <p className="m-0 mt-2 text-xs font-bold text-danger">{loi}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
