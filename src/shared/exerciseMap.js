/* Ánh xạ giữa hình dạng bài tập trong ứng dụng và hai bảng `exercises` +
 * `questions`.
 *
 * Tách khỏi exerciseStore.js để KIỂM ĐƯỢC: file này không import gì, nên
 * scripts/check-exercises.mjs chạy thẳng bằng node.
 *
 * Đây là chỗ dễ mất dữ liệu nhất trong lần chuyển đổi. Sáu loại câu hỏi có tập
 * trường rất khác nhau — qcm có options/answer, tableau có
 * colonnes/criteres/answers, ordre có elements — và một trường rơi khỏi
 * `payload` nghĩa là một phần đề bài biến mất, trong khi build vẫn xanh và
 * giao diện vẫn dựng.
 */

/* Trường được nâng thành cột thật. Phải khớp lược đồ ở migration 010. */
export const EX_COLUMNS = [
  "id", "title", "level", "skills", "usageType", "deadline", "timeLimit",
  "consigne", "readingText", "audioUrl", "imageUrl", "createdAt",
];
/* Trường của bài nằm trong `meta` — thứ ứng dụng dùng nhưng không cần truy vấn. */
export const EX_META = [
  "targeted", "assignedTo", "assignedClasses", "assignedExtra",
  "folderId", "customCat",
];
export const Q_COLUMNS = ["id", "type", "prompt", "explanation"];

const toIso = (v) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  const d = Number.isFinite(n) && n > 0 ? new Date(n) : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};
const toMs = (v) => {
  if (v == null) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
};

/* ── dòng bảng → hình dạng ứng dụng ── */

export function questionFromRow(row) {
  return {
    ...(row.payload || {}),
    id: row.id,
    type: row.type,
    prompt: row.prompt || "",
    /* Chỉ gắn khi có: `explanation: undefined` nằm trong object sẽ lọt vào
       payload ở lượt ghi sau và đọng lại vĩnh viễn. */
    ...(row.explanation ? { explanation: row.explanation } : {}),
    ...(row.competence ? { competence: row.competence } : {}),
    ...(row.point_gram ? { pointGram: row.point_gram } : {}),
  };
}

export function exerciseFromRow(row, questionRows = []) {
  return {
    ...(row.meta || {}),
    id: row.id,
    title: row.title,
    level: row.level,
    skills: Array.isArray(row.skills) ? row.skills : [],
    /* `skill` (số ít) là trường đời đầu mà nhiều màn hình vẫn đọc. Dựng lại từ
       phần tử đầu thay vì lưu trùng một cột nữa. */
    skill: (Array.isArray(row.skills) && row.skills[0]) || "",
    usageType: row.usage_type || "",
    deadline: row.deadline || "",
    timeLimit: row.time_limit ?? "",
    consigne: row.consigne || "",
    readingText: row.reading_text || "",
    audioUrl: row.audio_url || "",
    imageUrl: row.image_url || "",
    createdAt: toMs(row.created_at),
    questions: questionRows.map(questionFromRow),
  };
}

export function fromRows(exRows, qRows) {
  const byEx = new Map();
  for (const q of qRows) {
    if (!byEx.has(q.exercise_id)) byEx.set(q.exercise_id, []);
    byEx.get(q.exercise_id).push(q);
  }
  for (const list of byEx.values()) list.sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0));
  return exRows.map((e) => exerciseFromRow(e, byEx.get(e.id) || []));
}

/* ── hình dạng ứng dụng → dòng bảng ── */

export function toRows(ex, store) {
  const meta = {};
  for (const k of EX_META) if (ex[k] !== undefined) meta[k] = ex[k];

  const skills = Array.isArray(ex.skills) && ex.skills.length
    ? ex.skills.filter(Boolean)
    : (ex.skill ? [ex.skill] : []);

  const exRow = {
    id: String(ex.id),
    store,
    title: String(ex.title || "(Sans titre)"),
    level: String(ex.level || "B1"),
    skills,
    usage_type: ex.usageType || null,
    deadline: toIso(ex.deadline),
    time_limit: Number(ex.timeLimit) || null,
    consigne: ex.consigne || null,
    reading_text: ex.readingText || null,
    audio_url: ex.audioUrl || null,
    image_url: ex.imageUrl || null,
    meta,
    created_at: toIso(ex.createdAt) || new Date().toISOString(),
  };

  const qRows = (ex.questions || []).map((q, i) => {
    const payload = {};
    for (const [k, v] of Object.entries(q)) {
      if (!Q_COLUMNS.includes(k) && k !== "competence" && k !== "pointGram") {
        payload[k] = v;
      }
    }
    return {
      id: String(q.id),
      exercise_id: exRow.id,
      ord: i + 1,
      type: q.type || "fill",
      prompt: q.prompt || "",
      payload,
      explanation: q.explanation || null,
      competence: q.competence || null,
      point_gram: q.pointGram || null,
    };
  });

  return { exRow, qRows };
}
