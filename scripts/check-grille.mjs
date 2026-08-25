/* Grille DELF phải cộng đúng 25, và mỗi tiêu chí phải có đủ thông tin để chấm.
 *
 * Một tiêu chí lệch 1 điểm là MỌI bài chấm lệch theo, và lệch âm thầm — không
 * có gì đỏ, chỉ có điểm sai gửi tới học sinh. Cộng lại là việc máy làm được,
 * nên để máy làm.
 */
import { GRILLE, tongDiem } from "../supabase/functions/_shared/delfGrille.js";

let pass = 0, fail = 0;
const no = (m) => { fail++; console.log("  ✗ " + m); };

for (const [lv, g] of Object.entries(GRILLE)) {
  const tong = tongDiem(lv);
  if (tong !== 25) no(`${lv}: tổng grille phải là 25, đang là ${tong}`); else pass++;

  const ids = g.criteres.map((c) => c.id);
  if (new Set(ids).size !== ids.length) no(`${lv}: có id tiêu chí trùng nhau`); else pass++;

  for (const c of g.criteres) {
    if (!(c.max > 0)) { no(`${lv}/${c.id}: max phải > 0`); continue; }
    if (!c.label || !c.aide) { no(`${lv}/${c.id}: thiếu label hoặc aide`); continue; }
    /* `aide` đi thẳng vào prompt gửi cho model — một dòng trống ở đây nghĩa là
       model phải tự đoán tiêu chí đó đo cái gì. */
    if (c.aide.length < 25) { no(`${lv}/${c.id}: aide quá ngắn để làm mô tả tiêu chí`); continue; }
    pass++;
  }

  if (!(g.minWords > 0)) no(`${lv}: thiếu minWords`); else pass++;
}

/* Hai trình độ phải khác nhau thật — B2 đòi lập luận, B1 thì không. */
if (JSON.stringify(GRILLE.B1.criteres.map((c) => c.id))
    === JSON.stringify(GRILLE.B2.criteres.map((c) => c.id))) {
  no("B1 và B2 có cùng bộ tiêu chí — nhiều khả năng copy nhầm");
} else pass++;

if (!GRILLE.B2.criteres.some((c) => c.id === "argumenter")) {
  no("B2 thiếu tiêu chí « argumenter » — đó là điểm phân biệt chính với B1");
} else pass++;

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
