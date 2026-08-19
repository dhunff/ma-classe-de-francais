/* Kiểm phần ánh xạ bài nộp giữa ứng dụng và bảng `submissions`.
 *
 * Đây là chỗ dễ mất dữ liệu nhất trong lần chuyển từ blob sang bảng: một
 * trường rơi khỏi `payload` là một phần bài làm của học sinh biến mất, và
 * không có gì báo — build vẫn xanh, giao diện vẫn chạy, chỉ là câu trả lời
 * không còn ở đó. */

import {
  COLUMNS, toIso, toMs, fromRow, toRow, mergeByPair,
} from "../src/shared/submissionMap.js";

let pass = 0, fail = 0;

/* So sánh KHÔNG phụ thuộc thứ tự khoá: khứ hồi qua bảng làm đổi thứ tự (cột
   được gắn lại sau payload), mà thứ tự khoá trong object thì không mang ý
   nghĩa gì. So thẳng bằng JSON.stringify sẽ báo hỏng một thứ vốn đúng. */
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

/* Một bài nộp thật, đủ mọi trường mà Taking.jsx và TeacherScreens.jsx sinh ra. */
const SUB = {
  id: "abc123", exerciseId: "e42", student: "Linh",
  answers: { q1: 2, q2: "l'eau", q3: { choice: 0, just: "parce que" } },
  autoScore: 7, autoMax: 10,
  openMarks: { q9: 3 }, qComments: { q9: "Bien vu" },
  late: false, at: 1755600000000, comment: "Correct", graded: true,
  durationMs: 845000, timedOut: false,
  redo: false, redoNote: "", feedbackUrl: "https://x/y.pdf",
};

/* ── vòng tròn: app → dòng bảng → app, không được rơi trường nào ── */
const round = fromRow(toRow(SUB, "u-1"));
t("khứ hồi giữ nguyên toàn bộ bản ghi", round, SUB);
for (const k of Object.keys(SUB)) {
  t(`khứ hồi giữ trường "${k}"`, round[k], SUB[k]);
}

/* ── cột được nâng lên đúng chỗ, không lặp trong payload ── */
const row = toRow(SUB, "u-1");
t("cột id", row.id, "abc123");
t("cột exercise_id", row.exercise_id, "e42");
t("cột student", row.student, "Linh");
t("cột graded", row.graded, true);
t("cột user_id", row.user_id, "u-1");
for (const c of COLUMNS) {
  t(`payload KHÔNG lặp lại cột "${c}"`, c in row.payload, false);
}
t("payload giữ answers", row.payload.answers, SUB.answers);
t("payload giữ openMarks", row.payload.openMarks, SUB.openMarks);

/* ── mốc thời gian: app ghi số, cột là timestamptz ── */
t("số ms → ISO", toIso(1755600000000), new Date(1755600000000).toISOString());
t("chuỗi ISO → ISO", toIso("2026-08-19T10:00:00.000Z"), "2026-08-19T10:00:00.000Z");
t("null → null", toIso(null), null);
t("chuỗi rỗng → null", toIso(""), null);
t("rác → null", toIso("không phải ngày"), null);
t("ISO → ms", toMs("2026-08-19T10:00:00.000Z"), Date.parse("2026-08-19T10:00:00.000Z"));
t("null ms → null", toMs(null), null);
t("mốc thời gian đi vòng vẫn nguyên", fromRow(toRow(SUB, null)).at, SUB.at);

/* ── gộp bảng + blob ── */
const cu = { id: "old", exerciseId: "e1", student: "Linh", at: 1000, autoScore: 3 };
const moi = { id: "new", exerciseId: "e1", student: "Linh", at: 2000, autoScore: 8 };
const khac = { id: "z", exerciseId: "e2", student: "Linh", at: 500 };

t("cùng cặp → giữ bản mới hơn", mergeByPair([cu, moi]).map((s) => s.id), ["new"]);
t("thứ tự đảo vẫn giữ bản mới", mergeByPair([moi, cu]).map((s) => s.id), ["new"]);
t("khác bài tập → giữ cả hai", mergeByPair([moi, khac]).length, 2);
t("at bằng nhau → bản sau thắng (bảng đứng sau blob)",
  mergeByPair([{ ...cu, at: 5 }, { ...moi, at: 5 }]).map((s) => s.id), ["new"]);
t("thiếu at coi như 0", mergeByPair([{ ...cu, at: undefined }, moi]).map((s) => s.id), ["new"]);
t("bỏ qua bản ghi hỏng", mergeByPair([null, {}, { exerciseId: "e" }, moi]).length, 1);
t("mảng rỗng", mergeByPair([]), []);

/* ── trường hợp biên ── */
t("id số → chuỗi", toRow({ id: 42, exerciseId: "e", student: "A" }, null).id, "42");
t("thiếu exerciseId → chuỗi rỗng", toRow({ id: "a", student: "A" }, null).exercise_id, "");
t("graded thiếu → false", toRow({ id: "a", exerciseId: "e", student: "A" }, null).graded, false);
t("payload rỗng đọc được", fromRow({ id: "a", exercise_id: "e", student: "A", graded: false, at: null }).id, "a");
t("payload null không nổ", fromRow({ id: "a", exercise_id: "e", student: "A", payload: null }).student, "A");

console.log(pass + fail === pass
  ? `\n${pass} đạt, 0 hỏng`
  : `\n${pass} đạt, ${fail} hỏng`);
process.exit(fail ? 1 : 0);
