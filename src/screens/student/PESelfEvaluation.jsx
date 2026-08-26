import React, { useMemo, useState } from "react";
import { FileText, ScrollText, Info, CheckCircle2, RotateCcw } from "lucide-react";

/* Tự chấm Production écrite — bố cục chia đôi màn hình.
 *
 * ══ Ý TƯỞNG BỐ CỤC ══
 *
 * Người học phải đọc lại bài mình TRONG LÚC đi qua từng tiêu chí. Nếu bài viết
 * cuộn mất lên trên khi họ chấm tới tiêu chí thứ tám, họ sẽ chấm bằng trí nhớ —
 * và trí nhớ về bài mình vừa viết là thứ rộng lượng nhất trên đời.
 *
 * Nên: cột trái (đề + bài làm) cuộn ĐỘC LẬP với cột phải (thang chấm). Hai vùng
 * cuộn riêng, không cái nào kéo cái nào.
 *
 * ══ MÀU: DÙNG TOKEN, KHÔNG VIẾT HEX ══
 *
 * `bg-surface` chứ không phải `bg-[#1C1D22]`. Token tự đảo giữa bản sáng và bản
 * tối (xem styles/tokens.css), còn hex thì đóng đinh một bản và bản kia thành
 * chữ tối trên nền tối. `check:design` canh chỗ này.
 *
 *   bg-surface   →  #FFFFFF sáng  ·  #1E1E27 tối
 *   bg-surface2  →  #FAFAFC sáng  ·  #14141A tối
 *   text-ink     →  #23232E sáng  ·  #E6E6EC tối
 *   text-soft    →  #6E7280 sáng  ·  #9A9AA8 tối
 *   border-line  →  #EDF0F5 sáng  ·  #33333F tối
 *
 * ══ TAILWIND PREFLIGHT ĐANG TẮT ══
 *
 * Nghĩa là `<button>` vẫn còn viền xám mặc định của trình duyệt và `<h2>` vẫn
 * còn margin. Nên mọi nút ở đây có `border-0`, mọi tiêu đề có `m-0`. Quên là
 * giao diện vỡ theo kiểu rất khó truy, vì mã nguồn trông đúng.
 */

/* ── Dữ liệu mẫu ──
 *
 * Dùng ĐỦ 11 tiêu chí B2 chứ không rút gọn, vì tổng phải cộng ra đúng 25. Rút
 * xuống 5 tiêu chí thì ô "x / 25" ở chân cột phải nói dối ngay từ lần render
 * đầu, và một con số sai trong bản mẫu có thói quen sống sót vào bản thật.  */
const SUJET = {
  level: "B2",
  minWords: 250,
  consigne:
    "Votre municipalité envisage de fermer la bibliothèque de quartier pour " +
    "financer un nouveau parking. Vous écrivez au maire pour exprimer votre " +
    "désaccord et proposer une alternative. (250 mots minimum)",
};

const COPIE = `Monsieur le Maire,

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

/* Thang chấm — dạng rút gọn của lược đồ JSON (xem `grille jsonb` trên `exams`).
   `bareme` giữ nguyên là mảng: giáo viên phải thêm/bớt mốc được, mà object có
   khoá là số thì thứ tự không đảm bảo. */
const RUBRIC = {
  level: "B2",
  official: true,
  total: 25,
  criteria: [
    { id: "3f1a7c20", key: "consigne", category: "pragmatique", max_score: 2, step: 0.5,
      name: "Bám sát đề bài",
      description: "Đúng loại văn bản, đúng người nhận, đủ độ dài 250 từ.",
      bareme: [[2, "Đúng loại, đúng người nhận, đủ dài"], [1, "Thiếu độ dài rõ rệt hoặc quên hình thức bắt buộc"], [0.5, "Chỉ lờ mờ nhận ra loại văn bản"], [0, "Sai loại, hoặc quá ngắn để đánh giá"]] },
    { id: "7b2e4d18", key: "sociolang", category: "pragmatique", max_score: 2, step: 0.5,
      name: "Chọn đúng giọng văn",
      description: "Registre hợp với người nhận và giữ nhất quán cả bài.",
      bareme: [[2, "Đúng và đều cả bài"], [1, "Đúng cơ bản nhưng lệch vài chỗ"], [0.5, "Lẫn tu/vous hoặc trôi giữa bài"], [0, "Sai hẳn registre"]] },
    { id: "c94f0a37", key: "faits", category: "pragmatique", max_score: 3, step: 0.5,
      name: "Trình bày sự việc",
      description: "Nêu sự việc rõ và chính xác, phục vụ lập luận.",
      bareme: [[3, "Rõ và chính xác"], [2, "Rõ nhưng thiếu chi tiết cụ thể"], [1, "Mơ hồ, người đọc phải đoán"], [0, "Không trình bày được sự việc nào"]] },
    { id: "1d6b8e45", key: "argumenter", category: "pragmatique", max_score: 4, step: 0.5,
      name: "Lập luận",
      description: "Luận điểm phát triển, có ví dụ, có phản biện, có kết luận.",
      bareme: [[4, "2–3 luận điểm đầy đủ, có ví dụ và phản biện"], [3, "Rõ và có ví dụ, nhưng bỏ qua ý kiến ngược"], [2, "Có luận điểm nhưng phát triển nông"], [1, "Chỉ liệt kê ý"], [0, "Không có lập luận"]] },
    { id: "a58c3f92", key: "coherence", category: "pragmatique", max_score: 3, step: 0.5,
      name: "Mạch lạc và liên kết",
      description: "Bố cục rõ và connecteurs đa dạng. B2 cần 8–10 loại khác nhau.",
      bareme: [[3, "Bố cục rõ, connecteurs đa dạng và đúng"], [2, "Có bố cục, connecteurs lặp vài loại"], [1, "Rời rạc, chủ yếu et/mais"], [0.5, "Không thấy bố cục"], [0, "Các câu không liên hệ"]] },
    { id: "e27d4b06", key: "etendue_lex", category: "lexicale", max_score: 2, step: 0.5,
      name: "Vốn từ rộng",
      description: "Đủ rộng cho chủ đề, biết biến đổi để tránh lặp.",
      bareme: [[2, "Rộng, biết tránh lặp"], [1, "Đủ dùng nhưng lặp thấy rõ"], [0.5, "Rất hẹp, phải nói vòng"], [0, "Không đủ cho chủ đề"]] },
    { id: "b41a9c58", key: "maitrise_lex", category: "lexicale", max_score: 2, step: 0.5,
      name: "Dùng từ chính xác",
      description: "Biết nhiều từ nhưng dùng sai chỗ thì mất điểm ở đây.",
      bareme: [[2, "Hầu như không lỗi"], [1, "Có nhầm lẫn nhưng vẫn hiểu"], [0.5, "Lỗi gây hiểu sai"], [0, "Dùng từ sai liên tục"]] },
    { id: "6c8f2e14", key: "orthographe", category: "lexicale", max_score: 1, step: 0.5,
      name: "Chính tả và dấu câu",
      description: "Chỉ 1 điểm — đừng dành nửa thời gian làm bài cho nó.",
      bareme: [[1, "Tương đối chuẩn"], [0.5, "Lỗi rải rác nhưng đọc vẫn trôi"], [0, "Lỗi dày, cản việc đọc"]] },
    { id: "9e5b0d73", key: "phrases", category: "grammaticale", max_score: 2, step: 0.5,
      name: "Cấu trúc câu",
      description: "Trộn được câu đơn và phức, nhiều kiểu cấu trúc.",
      bareme: [[2, "Đa dạng, có câu phức nhiều kiểu"], [1, "Có câu phức nhưng lặp một kiểu"], [0.5, "Gần như toàn câu đơn"], [0, "Không kiểm soát được"]] },
    { id: "2a7c6e91", key: "temps", category: "grammaticale", max_score: 2, step: 0.5,
      name: "Thì và thức",
      description: "Ở B2, subjonctif là thứ được mong đợi, không phải điểm cộng.",
      bareme: [[2, "Kiểm soát tốt, lỗi không hệ thống"], [1, "Đúng ở thì cơ bản, sai khi phức tạp"], [0.5, "Gần như chỉ présent"], [0, "Không kiểm soát được thì"]] },
    { id: "8d3f5a27", key: "morpho", category: "grammaticale", max_score: 2, step: 0.5,
      name: "Hợp giống–số và chia động từ",
      description: "Hợp giống–số, mạo từ, đại từ, đuôi động từ.",
      bareme: [[2, "Lỗi hiếm, không gây hiểu nhầm"], [1, "Lỗi đều đặn nhưng vẫn hiểu"], [0.5, "Lỗi cản việc đọc"], [0, "Không kiểm soát được"]] },
  ],
};

const NHOM = {
  pragmatique: "Năng lực nội dung",
  lexicale: "Từ vựng và chính tả",
  grammaticale: "Ngữ pháp",
};

/* Thanh cuộn mảnh, tối.
 *
 * Không cần plugin: Tailwind cho phép nhắm thẳng pseudo-element bằng biến thể
 * tuỳ ý `[&::-webkit-scrollbar]`. `scrollbar-thin` của Firefox thì đi qua thuộc
 * tính CSS chuẩn, nên đặt trong style. Hai đường vì hai trình duyệt làm khác
 * nhau, chứ không phải thừa. */
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
 * điểm rời rạc, nên thanh trượt phải BÁM NẤC. Thanh trượt trơn sẽ gợi ý một độ
 * chính xác không có thật — không ai chấm được 2,37/4.
 *
 * Dưới thanh trượt luôn hiện MÔ TẢ của nấc đang chọn. Đây là chỗ thanh trượt
 * hay thua nút bấm: kéo thì nhanh, nhưng nhanh tới mức người ta không đọc mốc
 * nào cả. Hiện mô tả ngay tại chỗ là cách bù lại. */
function ThanhTieuChi({ c, gia, onChange }) {
  const chuaCham = gia == null;
  const v = chuaCham ? 0 : gia;

  /* Nấc đang áp dụng = mốc cao nhất mà điểm còn với tới. `bareme` xếp giảm dần
     nên chỉ cần tìm phần tử đầu tiên thoả. */
  const nac = c.bareme.find(([at]) => v >= at) ?? c.bareme[c.bareme.length - 1];
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
        /* `accent-primary` tô luôn cả vệt đã đi và núm — một dòng thay cho cả
           một bộ `::-webkit-slider-thumb` viết tay. */
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

      {/* Nhãn hai đầu: người dùng cần biết thang chạy tới đâu mà không phải kéo thử. */}
      <div className="mt-1.5 flex justify-between text-[10px] font-semibold tabular-nums text-soft">
        <span>0</span>
        <span>{c.max_score}</span>
      </div>

      <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-surface2 px-3 py-2 text-xs leading-relaxed text-soft">
        <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          {chuaCham ? (
            <>Kéo thanh trượt để chấm. Mốc cao nhất: <strong className="text-ink">{c.bareme[0][1]}</strong>.</>
          ) : (
            <><strong className="text-ink">{nac[0]} điểm</strong> — {nac[1]}</>
          )}
        </span>
      </p>
    </li>
  );
}

export default function PESelfEvaluation({ sujet = SUJET, copie = COPIE, rubric = RUBRIC, onSubmit }) {
  /* Một state duy nhất, khoá theo `id` của tiêu chí — KHÔNG theo chỉ số mảng.
     Giáo viên sửa thang sau khi đã có người chấm thì `id` là thứ còn neo được;
     chỉ số mảng sẽ lặng lẽ gán điểm của tiêu chí này sang tiêu chí khác. */
  const [diem, setDiem] = useState({});
  const [daNop, setDaNop] = useState(false);

  const dat = (id, v) => setDiem((cu) => ({ ...cu, [id]: v }));

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
  const soTu = copie.trim().split(/\s+/).length;
  const nhom = ["pragmatique", "lexicale", "grammaticale"];

  return (
    /* ══ CƠ CHẾ CHIA ĐÔI ══
     *
     * `items-start` là dòng quan trọng nhất ở đây. Mặc định grid kéo mọi ô cao
     * bằng nhau (`stretch`), và một ô cao bằng ô cạnh nó thì KHÔNG BAO GIỜ
     * sticky được — nó đã chạm đáy vùng cuộn rồi, không còn chỗ để dính.
     * `items-start` cho mỗi cột cao đúng nội dung của nó. */
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">

      {/* ── CỘT TRÁI: đề bài + bài làm ── */}
      <section className="lg:sticky lg:top-0">
        <div className="rounded-md bg-surface ring-1 ring-line">
          <header className="flex items-center gap-2.5 border-b border-line px-5 py-4">
            <ScrollText size={16} className="text-primary" aria-hidden="true" />
            <h2 className="m-0 text-sm font-bold text-ink">Đề bài</h2>
            <span className="ml-auto rounded-full bg-surface2 px-2.5 py-1 text-[11px] font-bold text-soft">
              {sujet.level} · tối thiểu {sujet.minWords} từ
            </span>
          </header>
          <p className="m-0 px-5 py-4 text-sm italic leading-relaxed text-soft">{sujet.consigne}</p>
        </div>

        <div className="mt-4 flex flex-col rounded-md bg-surface ring-1 ring-line">
          <header className="flex items-center gap-2.5 border-b border-line px-5 py-4">
            <FileText size={16} className="text-primary" aria-hidden="true" />
            <h2 className="m-0 text-sm font-bold text-ink">Bài làm của bạn</h2>
            <span
              className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${
                soTu >= sujet.minWords ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"
              }`}
            >
              {soTu} từ
            </span>
          </header>

          {/* Vùng cuộn ĐỘC LẬP.
             `max-h` chứ không phải `h`: bài ngắn thì thẻ co lại theo nội dung,
             không để một khoảng trống cao 60vh bên dưới. */
          }
          <div className={`max-h-[min(60vh,640px)] overflow-y-auto px-5 py-4 ${THANH_CUON}`}>
            <pre className="m-0 whitespace-pre-wrap font-sans text-sm leading-7 text-ink">
              {copie}
            </pre>
          </div>
        </div>
      </section>

      {/* ── CỘT PHẢI: thang chấm ── */}
      <section className="flex min-h-0 flex-col">
        <div className="mb-4">
          <h2 className="m-0 text-base font-bold text-ink">Tự chấm theo tiêu chí DELF {rubric.level}</h2>
          <p className="m-0 mt-1 text-xs leading-relaxed text-soft">
            Đọc lại bài bên trái theo từng tiêu chí một. Giá trị không nằm ở con số cuối —
            nó nằm ở chỗ bạn đọc bài mình một lần nữa qua mắt người chấm.
          </p>
        </div>

        {nhom.map((cat) => {
          const list = rubric.criteria.filter((c) => c.category === cat);
          if (!list.length) return null;
          const sum = list.reduce((n, c) => n + c.max_score, 0);
          return (
            <div key={cat} className="mb-6">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="m-0 text-[11px] font-bold uppercase tracking-widest text-soft">
                  {NHOM[cat]}
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
           `sticky bottom-0` dính vào ĐÁY vùng cuộn của trang. Nó nằm cuối cột
           phải nên khi cuộn giữa chừng nó nổi lên trên nội dung, và khi cuộn
           tới cuối nó về đúng chỗ của mình.

           ⚠️ Bẫy: `position: sticky` chết lặng nếu BẤT KỲ tổ tiên nào có
           `overflow: hidden`. Vỏ app của FRACILE (AppLayout) khoá tràn ở tấm
           thẻ và chỉ cho `<main>` cuộn — nên phần tử này dính theo `<main>`,
           không theo cửa sổ. Nếu một ngày nó ngừng dính, hãy đi ngược cây DOM
           tìm `overflow-hidden` chứ đừng sửa `bottom`. */}
        <div className="sticky bottom-0 -mx-1 mt-2 px-1 pb-1">
          <div className="rounded-md bg-surface p-4 shadow-md ring-1 ring-line backdrop-blur">
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
                    onClick={() => { setDiem({}); setDaNop(false); }}
                    className="flex items-center gap-1.5 rounded-full border-0 bg-surface2 px-3 py-2
                               text-xs font-bold text-soft transition hover:text-ink"
                  >
                    <RotateCcw size={13} aria-hidden="true" />
                    Chấm lại
                  </button>
                )}
                <button
                  type="button"
                  disabled={!xong || daNop}
                  onClick={() => { setDaNop(true); onSubmit?.({ diem, tong }); }}
                  className="flex items-center gap-1.5 rounded-full border-0 bg-primary px-4 py-2
                             text-xs font-bold text-on-primary transition
                             disabled:cursor-not-allowed disabled:bg-surface2 disabled:text-soft"
                >
                  <CheckCircle2 size={14} aria-hidden="true" />
                  {daNop ? "Đã lưu" : "Lưu kết quả"}
                </button>
              </div>
            </div>

            {/* Thanh tiến độ đo SỐ TIÊU CHÍ ĐÃ CHẤM, không đo điểm. Người dùng
                cần biết còn bao nhiêu việc, không phải mình đang được bao nhiêu. */}
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface2">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${(daCham / rubric.criteria.length) * 100}%` }}
              />
            </div>
            <p className="m-0 mt-2 text-[11px] font-semibold text-soft">
              {xong
                ? "Đã chấm đủ tiêu chí."
                : `Còn ${rubric.criteria.length - daCham} tiêu chí chưa chấm.`}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
