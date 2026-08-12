/* Hàm thuần về bài tập và điểm số.
   Đặt ở đây thay vì trong App.jsx để Dashboard (và các màn hình tách sau)
   dùng được mà không phải import ngược lên App.jsx. */

export const SKILLS = [
  "Grammaire", "Vocabulaire", "Écoute", "Lecture",
  "Production écrite", "Traduction", "Communication",
];

export const fmtDate = (d) =>
  new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

export const isLate = (ex) => ex.deadline && Date.now() > new Date(ex.deadline).getTime();

export const exSkills = (ex) =>
  ex.skills && ex.skills.length ? ex.skills : ex.skill ? [ex.skill] : [];

export const assignedTo = (ex, name) =>
  !ex.assignedTo || ex.assignedTo.length === 0 || ex.assignedTo.includes(name);

/* Điểm của một bài nộp.
   `pending` = còn câu tự luận mà giáo viên chưa chấm, nên điểm chưa chốt. */
/* Chịu được `ex` không còn. Bài nộp trỏ tới bài tập theo id, mà bài tập xoá
   được trong khi bài nộp vẫn nằm lại — hiện có 9 bài nộp như vậy.

   Mọi nơi gọi hàm này đều đang duyệt từ danh sách exercises hoặc tự chặn
   `if (!ex)`, nên chưa có đường nào ném lỗi. Đây là rào phòng xa cho hàm dùng
   chung, không phải sửa lỗi đang xảy ra. Không có đề thì coi như không có câu
   tự luận: điểm tự động vẫn đúng, phần chấm tay bằng 0. */
export function totalScore(sub, ex) {
  const opens = (ex?.questions || []).filter((q) => q.type === "open");
  const manual = opens.reduce((n, q) => n + (sub.openMarks?.[q.id] ?? 0), 0);
  const graded = sub.graded;
  return {
    score: sub.autoScore + (graded ? manual : 0),
    max: sub.autoMax + (graded ? opens.length : 0),
    pending: !graded && opens.length > 0,
  };
}

/* ---------- Tổng hợp cho Dashboard ---------- */

/* Bài được giao cho một học sinh, kèm bài nộp tương ứng (nếu có). */
export function studentWorkload(exercises, submissions, name) {
  const mine = exercises.filter((ex) => assignedTo(ex, name));
  const subOf = (ex) => submissions.find((s) => s.exerciseId === ex.id && s.student === name);
  const done = mine.filter((ex) => subOf(ex));
  const todo = mine.filter((ex) => !subOf(ex));
  return { assigned: mine, done, todo, subOf };
}

/* Điểm trung bình (%) trên các bài đã chốt điểm. `null` khi chưa có bài nào
   chốt — nơi gọi phải hiện trạng thái rỗng, không được hiện 0%. */
export function averageScore(exercises, submissions, name) {
  const { done, subOf } = studentWorkload(exercises, submissions, name);
  const pcts = [];
  for (const ex of done) {
    const sub = subOf(ex);
    const { score, max, pending } = totalScore(sub, ex);
    if (pending || !max) continue;
    pcts.push((score / max) * 100);
  }
  if (!pcts.length) return null;
  return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
}

/* Điểm trung bình theo từng kỹ năng, chỉ gồm kỹ năng thực sự có bài đã chốt.
   Một bài gắn nhiều kỹ năng thì tính cho tất cả các kỹ năng đó. */
export function skillBreakdown(exercises, submissions, name) {
  const { done, subOf } = studentWorkload(exercises, submissions, name);
  const acc = new Map();
  for (const ex of done) {
    const sub = subOf(ex);
    const { score, max, pending } = totalScore(sub, ex);
    if (pending || !max) continue;
    const pct = (score / max) * 100;
    for (const sk of exSkills(ex)) {
      if (!acc.has(sk)) acc.set(sk, []);
      acc.get(sk).push(pct);
    }
  }
  return [...acc.entries()]
    .map(([skill, list]) => ({
      skill,
      value: Math.round(list.reduce((a, b) => a + b, 0) / list.length),
      count: list.length,
    }))
    .sort((a, b) => SKILLS.indexOf(a.skill) - SKILLS.indexOf(b.skill));
}

/* Bài nên làm tiếp: chưa nộp, ưu tiên hạn gần nhất còn hiệu lực;
   bài quá hạn xếp sau; bài không hạn xếp cuối. */
export function nextUp(exercises, submissions, name, limit = 3) {
  const { todo } = studentWorkload(exercises, submissions, name);
  const rank = (ex) => {
    if (!ex.deadline) return 2;
    return isLate(ex) ? 1 : 0;
  };
  return [...todo]
    .sort((a, b) => {
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
      return 0;
    })
    .slice(0, limit);
}
