/* Ánh xạ giữa hình dạng bài nộp trong ứng dụng và dòng bảng `submissions`.
 *
 * Tách khỏi submissions.js để KIỂM ĐƯỢC: file này không import gì cả, nên
 * scripts/check-submissions.mjs chạy thẳng bằng node. submissions.js thì kéo
 * theo storageShim → import.meta.env, chỉ sống trong trình duyệt.
 *
 * Đây là chỗ dễ mất dữ liệu nhất trong cả lần chuyển đổi: một trường rơi khỏi
 * payload là một phần bài làm của học sinh biến mất, mà không có gì báo.
 */

/* Những trường được nâng thành cột thật; phần còn lại nằm trong `payload`.
   Phải khớp lược đồ ở migration 005. */
export const COLUMNS = ["id", "exerciseId", "student", "graded", "at"];

/* Ứng dụng dùng `at` là số mili-giây (Date.now()); cột `at` là timestamptz.
   Nhận cả hai kiểu vì dữ liệu cũ trong blob có lẫn — xem migration 007. */
export function toIso(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  const d = Number.isFinite(n) && n > 0 ? new Date(n) : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function toMs(v) {
  if (v == null) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

/* dòng bảng → hình dạng giao diện đang dùng */
export function fromRow(row) {
  return {
    ...(row.payload || {}),
    id: row.id,
    exerciseId: row.exercise_id,
    student: row.student,
    graded: !!row.graded,
    at: toMs(row.at),
  };
}

/* hình dạng giao diện → dòng bảng */
export function toRow(sub, userId) {
  const payload = {};
  for (const [k, v] of Object.entries(sub)) {
    if (!COLUMNS.includes(k)) payload[k] = v;
  }
  return {
    id: String(sub.id),
    exercise_id: String(sub.exerciseId ?? ""),
    student: String(sub.student ?? ""),
    user_id: userId ?? null,
    graded: !!sub.graded,
    at: toIso(sub.at),
    payload,
  };
}

/* Một bài nộp cho mỗi cặp (bài tập, học sinh). Cả bảng lẫn blob đều có thể
   chứa cùng một cặp; giữ bản có `at` lớn hơn.

   KHÔNG dedupe theo `id`: nộp lại sinh id mới, nên hai bản của cùng một cặp có
   id khác nhau và lọc theo id sẽ để lọt cả hai — học sinh thấy bài mình nộp
   hai lần. */
export function mergeByPair(rows) {
  const out = new Map();
  for (const s of rows) {
    if (!s || !s.exerciseId || !s.student) continue;
    const key = `${s.exerciseId} ${s.student}`;
    const prev = out.get(key);
    if (!prev || (Number(s.at) || 0) >= (Number(prev.at) || 0)) out.set(key, s);
  }
  return [...out.values()];
}
