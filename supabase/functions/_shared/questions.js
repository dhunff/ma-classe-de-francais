/* Hàm thuần về câu hỏi: chấm tự động, đếm câu chưa trả lời, tiện ích chuỗi. */

import { evaluateQuestion } from "./gradingEngine.js";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const norm = (s) => (s || "").trim().toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")   // bỏ toàn bộ dấu tiếng Pháp (é→e, à→a…)
  .replace(/\s+/g, " ").replace(/[’]/g, "'");
const stripHtml = (h) => (h || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
const wordCount = (h) => { const t = stripHtml(h); return t ? t.split(" ").length : 0; };

const vfOk = (q, ans) => ans != null && ans.choice === q.answer;
const fillAccepted = (q) => q.accepted ?? q.answer ?? "";  // tương thích bài import cũ dùng "answer"

/* Chấm câu điền từ / chia động từ. Thân hàm đã chuyển sang gradingEngine.js,
   nhưng TÊN và chữ ký giữ nguyên: năm nơi đang gọi nó (Taking, PracticeHub,
   Student, TeacherScreens) phải cùng đi qua một đường chấm, nếu không màn
   hình chấm của giáo viên và màn hình làm bài của học sinh sẽ bất đồng về
   cùng một câu trả lời.

   ĐỔI HÀNH VI: trước đây `norm()` bỏ dấu vô điều kiện, nên "ou" được chấm
   đúng cho "où". Nay dấu được tính. Đã rà 88 câu điền/chia trong thư viện
   thật trước khi bật: các đáp án không dấu đều là từ vốn không có dấu
   (faisable, adaptateur, embarras…), không có đáp án nào thiếu dấu.

   `exercise` là tuỳ chọn — truyền vào thì bài đó đặt được mức chặt riêng
   qua `exercise.strictAccents`, cho các bài luyện gõ dành cho người mới. */
const fillOk = (q, ans, exercise) => evaluateQuestion(q, ans, { exercise }).correct;
const autoQ = (q) => q.type === "qcm" || q.type === "fill" || q.type === "conj" || q.type === "vf" || q.type === "tableau" || q.type === "ordre";
const ordreOk = (q, ans) => Array.isArray(ans) && ans.length === (q.elements || []).length && ans.every((id, i) => q.elements[i] && q.elements[i].id === id);
const seedShuffle = (arr, seedStr) => {
  let sd = 0; for (const c of String(seedStr)) sd = (sd * 31 + c.charCodeAt(0)) >>> 0; sd = sd || 1;
  const rnd = () => ((sd = (sd * 1103515245 + 12345) >>> 0) / 4294967296);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const tableauCells = (q) => (q.criteres || []).flatMap((cr) => (q.colonnes || []).map((co) => `${cr.id}_${co.id}`));

/* Ô CHẤM ĐƯỢC: ô mà đề có ghi đáp án.
 *
 * ══ VÌ SAO PHẢI LỌC ══
 *
 * Bài `mrig1rhvcezbf2` trong thư viện thật có 16 ô nhưng chỉ 15 ô có đáp án —
 * giáo viên soạn sót một ô. Với phép so `ans[k] === q.answers?.[k]`, ô đó gây
 * hai chuyện cùng lúc, cả hai đều lặng lẽ:
 *
 *   · BỎ TRỐNG thì `undefined === undefined` → tính là ĐÚNG. Nộp bài trắng
 *     vẫn được 1 điểm, và điểm ấy không cách nào lấy được bằng cách trả lời.
 *   · `tableauOk` đòi MỌI ô khớp, nên học sinh điền đủ 16 ô thì ô sót luôn
 *     lệch → cả bảng vĩnh viễn "sai". Đó là lý do bảng ấy ra 0 điểm dù người
 *     làm bài biết bài.
 *
 * Ô không có đáp án thì không phải câu hỏi. Bỏ nó ra khỏi cả tử số lẫn mẫu số:
 * học sinh được chấm trên 15 ô có thật, đạt tối đa được 15/15. Bắt họ gánh một
 * thiếu sót lúc soạn đề là chấm sai theo hướng có hại. */
const tableauCellsChamDuoc = (q) =>
  tableauCells(q).filter((k) => q.answers?.[k] !== undefined && q.answers?.[k] !== "");

const tableauOk = (q, ans) => { const cells = tableauCellsChamDuoc(q); return cells.length > 0 && cells.every((k) => ans && ans[k] === q.answers?.[k]); };

/* Điểm từng phần cho bảng OUI/NON.
 *
 * ══ VÌ SAO KHÔNG DÙNG `tableauOk` ĐỂ CHẤM ══
 *
 * `tableauOk` là `every()` — sai một ô là cả bảng 0 điểm. Với bảng 4 hàng × 4
 * cột, học sinh đúng 15/16 ô vẫn nhận 0. Đó không phải cách DELF chấm: mỗi ô là
 * một quyết định độc lập, và bài thi đếm theo item.
 *
 * `tableauOk` vẫn giữ nguyên và vẫn dùng — nhưng cho việc khác: tô màu "câu này
 * đúng hoàn toàn", và cột `answers.correct` (boolean, không chứa được điểm lẻ).
 *
 * ══ Ô KHÔNG CHỌN TÍNH LÀ SAI ══
 *
 * `ans[k]` undefined thì khác `q.answers[k]`, nên không được điểm. Cố ý: bỏ
 * trống không phải là trả lời, và cho điểm chỗ bỏ trống thì đoán bừa nửa bảng
 * sẽ có lợi hơn suy nghĩ.
 *
 * Trả `{ dung, tong }` chứ không trả tỉ lệ: bên gọi cộng dồn số nguyên vào
 * tổng của cả bài, và một bảng 16 ô nặng bằng 16 câu — đúng như DELF đếm. Trả
 * tỉ lệ thì mỗi bảng chỉ còn nặng bằng một câu, và phép cộng phải dùng số thực
 * ở mọi nơi khác. */
const tableauDiem = (q, ans) => {
  const cells = tableauCellsChamDuoc(q);
  return {
    dung: cells.filter((k) => ans && ans[k] === q.answers[k]).length,
    tong: cells.length,
  };
};

/* Một câu đáng bao nhiêu đơn vị, và học sinh được mấy.
 *
 * Mọi loại câu đều là 1 đơn vị, TRỪ bảng — bảng đáng đúng số ô của nó. Gom vào
 * một hàm vì có ba đường cùng cộng điểm: Edge Function `grade` (bài luyện tập
 * và bài thi), `Taking.jsx` (bài được giao), và phần hiện điểm của PracticeHub.
 * Ba chỗ tự cộng theo ba kiểu là ba con số lệch nhau, và không ai biết cái nào
 * đúng. */
const diemCau = (q, ans, exercise) => {
  if (!autoQ(q)) return { dung: 0, tong: 0 };          // câu tự luận: người chấm
  if (q.type === "tableau") return tableauDiem(q, ans);
  const ok = q.type === "qcm" ? (ans != null && ans === q.answer)
    : q.type === "vf" ? vfOk(q, ans)
      : q.type === "ordre" ? ordreOk(q, ans)
        : fillOk(q, ans, exercise);
  return { dung: ok ? 1 : 0, tong: 1 };
};

const isQuestionAnswered = (q, answers) => {
  const a = answers ? answers[q.id] : undefined;
  switch (q.type) {
    case "qcm": return a != null;
    case "tableau": {
      // répondu seulement si CHAQUE ligne × colonne est cochée
      const cells = tableauCells(q);
      return cells.length > 0 && cells.every((k) => a && a[k]);
    }
    case "ordre": return Array.isArray(a) && a.length === (q.elements || []).length && a.length > 0;
    case "vf": return a?.choice != null && (a.choice === 2 || String(a.just || "").trim() !== "");
    case "open": return stripHtml(a) !== "";
    default: return String(a || "").trim() !== "";   // fill / conj
  }
};
const getUnansweredQuestionsCount = (answers, questions) =>
  (Array.isArray(questions) ? questions : []).filter((q) => !isQuestionAnswered(q, answers)).length;

export { uid, norm, stripHtml, wordCount, vfOk, fillAccepted, fillOk, autoQ, ordreOk, seedShuffle, tableauCells, tableauOk, tableauDiem, diemCau, isQuestionAnswered, getUnansweredQuestionsCount };
