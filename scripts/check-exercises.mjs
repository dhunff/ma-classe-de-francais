/* Kiểm ánh xạ bài tập giữa ứng dụng và hai bảng `exercises` + `questions`.
 *
 * Sáu loại câu hỏi có tập trường rất khác nhau. Một trường rơi khỏi `payload`
 * là một phần đề bài biến mất — mất phương án của câu QCM, mất các cột của
 * bảng so sánh — mà build vẫn xanh và giao diện vẫn dựng ra một câu hỏi trông
 * bình thường nhưng không làm được. */

import {
  EX_COLUMNS, EX_META, Q_COLUMNS,
  exerciseFromRow, questionFromRow, fromRows, toRows,
} from "../src/shared/exerciseMap.js";
import { isPremium, hasPrice, premiumThieuGia } from "../src/shared/premium.js";

let pass = 0, fail = 0;
const stable = (v) => {
  if (Array.isArray(v)) return v.map(stable);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable(v[k])]));
  }
  return v;
};
const t = (name, got, want) => {
  const ok = JSON.stringify(stable(got)) === JSON.stringify(stable(want));
  ok ? pass++ : fail++;
  if (!ok) console.log(`FAIL  ${name}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`);
};

/* Một câu cho MỖI loại, đúng những trường mà Builder sinh ra. */
const QUESTIONS = [
  { id: "q1", type: "qcm", prompt: "Le samedi, nous ___ le marché.",
    options: ["visitons", "visitez", "visitent"], answer: 0 },
  { id: "q2", type: "fill", prompt: "Il est parti ___ il pleuvait.",
    accepted: "parce que|car" },
  { id: "q3", type: "conj", prompt: "Nous ___ (aller) au cinéma.", accepted: "allons" },
  { id: "q4", type: "vf", prompt: "Paris est en Espagne.", answer: 1,
    justification: "Paris est en France." },
  { id: "q5", type: "ordre", prompt: "Remettez dans l'ordre.",
    elements: [{ id: "e1", texte: "Comme" }, { id: "e2", texte: "il" }, { id: "e3", texte: "pleut" }] },
  { id: "q6", type: "tableau", prompt: "Comparez.",
    colonnes: [{ id: "c1", titre: "Oral" }, { id: "c2", titre: "Écrit" }],
    criteres: [{ id: "r1", texte: "Formel" }],
    answers: { r1_c1: "NON", r1_c2: "OUI" } },
  { id: "q7", type: "open", prompt: "Racontez vos vacances.",
    model: "Réponse attendue de 80 mots." },
];

const EX = {
  id: "ex42", title: "L'expression de la cause", level: "A2",
  skills: ["Grammaire"], skill: "Grammaire",
  usageType: "practice", deadline: "", timeLimit: 20,
  consigne: "<p>Lisez bien.</p>", readingText: "Un texte long…",
  audioUrl: "", imageUrl: "", createdAt: 1755600000000,
  targeted: false, assignedTo: null, assignedClasses: [], assignedExtra: [],
  folderId: "f1", customCat: "",
  questions: QUESTIONS,
};

/* ── khứ hồi: app → hai bảng → app ── */
const { exRow, qRows } = toRows(EX, "practice");
const back = exerciseFromRow(exRow, qRows);

for (const k of ["id", "title", "level", "usageType", "consigne", "readingText", "createdAt"]) {
  t(`khứ hồi giữ "${k}"`, back[k], EX[k]);
}
t("khứ hồi giữ skills", back.skills, EX.skills);
t("khứ hồi giữ timeLimit", back.timeLimit, EX.timeLimit);
t("khứ hồi giữ folderId (trong meta)", back.folderId, EX.folderId);
t("khứ hồi giữ assignedClasses", back.assignedClasses, EX.assignedClasses);
t("số câu không đổi", back.questions.length, QUESTIONS.length);

/* Mỗi loại câu phải về nguyên vẹn — đây là phần dễ vỡ nhất. */
for (const q of QUESTIONS) {
  const got = back.questions.find((x) => x.id === q.id);
  t(`câu "${q.type}" về nguyên vẹn`, got, q);
}

/* ── cột nâng lên đúng chỗ, không lặp trong payload ── */
t("cột store", exRow.store, "practice");
t("cột level", exRow.level, "A2");
t("cột skills là mảng", exRow.skills, ["Grammaire"]);
t("cột time_limit", exRow.time_limit, 20);
for (const c of Q_COLUMNS) {
  t(`payload câu KHÔNG lặp cột "${c}"`, qRows.some((r) => c in r.payload), false);
}
for (const m of EX_META) {
  if (EX[m] !== undefined) t(`meta giữ "${m}"`, exRow.meta[m], EX[m]);
}
t("payload giữ options", qRows[0].payload.options, QUESTIONS[0].options);
t("payload giữ answers của tableau", qRows[5].payload.answers, QUESTIONS[5].answers);

/* ── thứ tự câu ── */
t("ord bắt đầu từ 1", qRows[0].ord, 1);
t("ord tăng dần", qRows.map((r) => r.ord), [1, 2, 3, 4, 5, 6, 7]);
t("fromRows sắp lại theo ord",
  fromRows([exRow], [...qRows].reverse()).map ? fromRows([exRow], [...qRows].reverse())[0].questions.map((q) => q.id)
    : null,
  QUESTIONS.map((q) => q.id));

/* ── skill số ít dựng lại từ skills ── */
t("skill số ít lấy phần tử đầu", back.skill, "Grammaire");
t("skills rỗng → skill rỗng",
  exerciseFromRow({ id: "x", title: "T", level: "B1", skills: [] }).skill, "");
t("chỉ có skill số ít → thành mảng",
  toRows({ id: "x", title: "T", skill: "Écoute", questions: [] }, "practice").exRow.skills, ["Écoute"]);

/* ── explanation và nhãn phân loại ── */
const withMeta = toRows({
  id: "x", title: "T", questions: [{ id: "q", type: "fill", prompt: "p",
    accepted: "a", explanation: "Vì sao sai", competence: "inference", pointGram: "cause_consequence" }],
}, "practice");
t("explanation lên cột", withMeta.qRows[0].explanation, "Vì sao sai");
t("competence lên cột", withMeta.qRows[0].competence, "inference");
t("point_gram lên cột", withMeta.qRows[0].point_gram, "cause_consequence");
t("ba trường đó KHÔNG lọt vào payload",
  ["explanation", "competence", "pointGram"].some((k) => k in withMeta.qRows[0].payload), false);
t("đọc lại ra pointGram", questionFromRow(withMeta.qRows[0]).pointGram, "cause_consequence");
t("không có explanation thì KHÔNG thêm khoá undefined",
  "explanation" in questionFromRow({ id: "a", type: "fill", prompt: "p", payload: {} }), false);

/* ── trường hợp biên ── */
t("bài không câu hỏi", toRows({ id: "x", title: "T", questions: [] }, "practice").qRows, []);
t("questions undefined không nổ", toRows({ id: "x", title: "T" }, "practice").qRows, []);
t("payload null đọc được", questionFromRow({ id: "a", type: "qcm", prompt: "p", payload: null }).id, "a");
t("meta null đọc được", exerciseFromRow({ id: "a", title: "T", level: "B1", meta: null }).id, "a");
t("thiếu tiêu đề → mặc định", toRows({ id: "x", questions: [] }, "practice").exRow.title, "(Sans titre)");
t("timeLimit rỗng → null", toRows({ id: "x", title: "T", timeLimit: "", questions: [] }, "practice").exRow.time_limit, null);

/* ── tường phí ──
   Cờ trả phí đi qua `meta`, không phải cột riêng. Nó từng RƠI KHỎI EX_META:
   giáo viên bật khoá, lưu, bài quay về miễn phí, không lỗi nào hiện ra. */
const paid = toRows({ id: "x", title: "T", isPremium: true, price: 50000, questions: [] }, "practice");
t("isPremium sống sót qua toRows", paid.exRow.meta.isPremium, true);
t("price sống sót qua toRows", paid.exRow.meta.price, 50000);
t("đọc lại vẫn còn isPremium", exerciseFromRow(paid.exRow).isPremium, true);
t("đọc lại vẫn còn price", exerciseFromRow(paid.exRow).price, 50000);
t("bài thường KHÔNG tự mọc cờ trả phí",
  "isPremium" in toRows({ id: "y", title: "T", questions: [] }, "practice").exRow.meta, false);


/* ── khoá bài trả phí: phải HỎNG THEO CHIỀU KHOÁ ── */
/* Bản cũ là `!!ex.isPremium && Number(ex.price) > 0`, nên tick trả phí mà quên
   gõ giá → Number("") === 0 → bài thành MIỄN PHÍ. Một thiếu sót lúc soạn bài
   biến thành nội dung phát không, âm thầm. Đây là ca kiểm cho đúng chỗ đó. */
t("tick trả phí + có giá → khoá", isPremium({ isPremium: true, price: 50000 }), true);
t("tick trả phí + QUÊN giá → VẪN khoá", isPremium({ isPremium: true, price: "" }), true);
t("tick trả phí + giá 0 → VẪN khoá", isPremium({ isPremium: true, price: 0 }), true);
t("không tick → miễn phí", isPremium({ price: 50000 }), false);
t("bài rỗng → miễn phí", isPremium({}), false);
t("undefined không nổ", isPremium(undefined), false);

t("có giá thì bán được", hasPrice({ price: 50000 }), true);
t("giá rỗng thì chưa bán được", hasPrice({ price: "" }), false);
t("khoá mà thiếu giá → cảnh báo cấu hình", premiumThieuGia({ isPremium: true }), true);
t("khoá và đủ giá → không cảnh báo", premiumThieuGia({ isPremium: true, price: 1000 }), false);
t("bài miễn phí không bao giờ cảnh báo", premiumThieuGia({ price: 0 }), false);

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
