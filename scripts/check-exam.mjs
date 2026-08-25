/* Quy đổi điểm và luật đạt/trượt của thi thử.
 *
 * Cái đồng hồ không phải chỗ dễ sai. Chỗ dễ sai là ở đây: bài trong thư viện
 * có 7 / 8 / 15 câu, còn DELF chấm mỗi phần trên 25, nên "6 đúng" nghĩa là gì
 * hoàn toàn phụ thuộc vào phép quy đổi. Và luật đạt có HAI vế — quên vế thứ
 * hai thì hệ thống báo "đạt" cho một người sẽ trượt thật.
 */

import { EXAM_STRUCTURE, assemblePaper, sectionScore, verdict, NGUONG_PHAN }
  from "../src/screens/exam/examPaper.js";

let pass = 0, fail = 0;
const t = (ten, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++;
  else { fail++; console.log(`  ✗ ${ten}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`); }
};

/* ── quy đổi ── */
t("8/8 → 25", sectionScore(8, 8), 25);
t("0/8 → 0", sectionScore(0, 8), 0);
t("4/8 → 12.5", sectionScore(4, 8), 12.5);
t("7 câu và 15 câu cùng tỉ lệ thì cùng điểm",
  sectionScore(7, 7) === sectionScore(15, 15), true);
t("làm tròn tới nửa điểm", sectionScore(1, 7), 3.5);
t("bài rỗng không chia cho 0", sectionScore(0, 0), 0);

/* ── luật đạt: HAI vế ── */
const s = (score, points = 25) => ({ score, points });

t("đủ 50 và không phần nào dưới 5 → đạt",
  verdict([s(20), s(18), s(12)]).passed, true);
t("tổng 51 nhưng một phần 4/25 → TRƯỢT",
  verdict([s(24), s(23), s(4)]).passed, false);
t("phần yếu được liệt kê ra",
  verdict([s(24), s(23), s(4)]).weakSections.length, 1);
t("đúng 50 là đạt (ngưỡng bao gồm)",
  verdict([s(20), s(20), s(10)]).passed, true);
t("49 là trượt", verdict([s(20), s(20), s(9)]).passed, false);
t("đúng ngưỡng phần 5/25 vẫn đạt",
  verdict([s(25), s(25), s(NGUONG_PHAN)]).passed, true);

/* ── phần chưa chấm: KHÔNG được đoán ── */
const treo = verdict([s(20), s(18), { score: null, points: 25 }]);
t("còn phần chưa chấm → chưa kết luận", treo.passed, null);
t("phần chưa chấm được liệt kê", treo.pending.length, 1);
t("tổng chỉ cộng phần đã chấm", treo.total, 38);

t("chắc chắn trượt dù chưa chấm hết: có phần dưới ngưỡng",
  verdict([s(25), s(3), { score: null, points: 25 }]).passed, false);
t("chắc chắn trượt dù chưa chấm hết: tối đa vẫn không đủ 50",
  verdict([s(10), s(10), { score: null, points: 25 }]).passed, false);
t("còn cứu được thì vẫn để ngỏ",
  verdict([s(13), s(13), { score: null, points: 25 }]).passed, null);

/* ── lắp đề ── */
const kho = [
  { id: "co1", level: "B1", skills: ["Écoute"],            questions: [1, 2] },
  { id: "ce1", level: "B1", skills: ["Lecture"],           questions: [1] },
  { id: "pe1", level: "B1", skills: ["Production écrite"], questions: [1] },
  { id: "co2", level: "B2", skills: ["Écoute"],            questions: [1] },
  { id: "rong", level: "B1", skills: ["Lecture"],          questions: [] },
];
const de = assemblePaper(kho, "B1", () => 0);
t("đủ ba phần", de.sections.map((x) => x.code), ["CO", "CE", "PE"]);
t("không thiếu phần nào", de.missing.length, 0);
t("chỉ lấy bài đúng trình độ",
  de.sections.every((x) => x.exercise.level === "B1"), true);
t("thời lượng lấy từ cấu trúc thật",
  de.sections.map((x) => x.minutes), [25, 45, 45]);

/* Bài KHÔNG có câu hỏi nào phải bị loại — với RLS bài trả phí chưa mua trả về
   `questions: []`, và đưa nó vào đề thi nghĩa là một phần thi trống trơn. */
t("bỏ qua bài rỗng", de.sections.find((x) => x.code === "CE").exercise.id, "ce1");

/* Một phần thi 45 phút không được rơi vào bài có đúng một câu khi có bài dày
   hơn — cả 25 điểm dồn vào một câu thì kết quả không đo được gì. Đã suýt xảy
   ra với đề B1 thật: phần CE bốc trúng « Activité 2 », 1 câu. */
const khoLech = [
  { id: "ce_mong", level: "B1", skills: ["Lecture"], questions: [1] },
  { id: "ce_day",  level: "B1", skills: ["Lecture"], questions: [1, 2, 3, 4, 5, 6, 7] },
];
t("chọn bài nhiều câu nhất, không bốc bừa",
  assemblePaper(khoLech, "B1", () => 0).sections.find((x) => x.code === "CE").exercise.id,
  "ce_day");
t("chỉ có bài mỏng thì vẫn dùng, còn hơn thiếu phần",
  assemblePaper([khoLech[0]], "B1", () => 0).sections.length, 1);

const thieu = assemblePaper(kho, "B2", () => 0);
t("thiếu phần thì nói rõ thiếu phần nào",
  thieu.missing.map((x) => x.code), ["CE", "PE"]);
t("phần có thì vẫn lắp", thieu.sections.map((x) => x.code), ["CO"]);

t("trình độ không có cấu trúc → không dựng bừa",
  assemblePaper(kho, "A1", () => 0).unsupported, true);

/* PO cố ý không có: 25/100 của kỳ thi thật, hệ thống chưa tổ chức được. */
t("không bịa ra phần thi nói",
  EXAM_STRUCTURE.B1.some((x) => x.code === "PO"), false);

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
