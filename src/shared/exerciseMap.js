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

/* Xáo có hạt giống, dùng cho câu `ordre`.
 *
 * Trùng thuật toán với `seedShuffle` trong shared/questions.js, và CỐ Ý chép
 * lại chứ không import: giao ước ở đầu file là file này không phụ thuộc gì, để
 * `check-exercises.mjs` chạy thẳng bằng node.
 *
 * Chép mã thường là mở đường cho hai bản trôi khỏi nhau, nhưng ở đây thì không
 * hại: bản đúng thứ tự nằm ở `answer_key.elements`, còn cái này chỉ cần cho ra
 * MỘT hoán vị nào đó để payload không tiết lộ đáp án. Hai bên xáo khác nhau
 * cũng không ai chấm sai. */
function xaoTheoHat(arr, seedStr) {
  let sd = 0;
  for (const c of String(seedStr)) sd = (sd * 31 + c.charCodeAt(0)) >>> 0;
  sd = sd || 1;
  const rnd = () => ((sd = (sd * 1103515245 + 12345) >>> 0) / 4294967296);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Trường được nâng thành cột thật. Phải khớp lược đồ ở migration 010. */
export const EX_COLUMNS = [
  "id", "title", "level", "skills", "usageType", "deadline", "timeLimit",
  "consigne", "readingText", "audioUrl", "imageUrl", "createdAt",
];
/* Trường của bài nằm trong `meta` — thứ ứng dụng dùng nhưng không cần truy vấn. */
export const EX_META = [
  "targeted", "assignedTo", "assignedClasses", "assignedExtra",
  "folderId", "customCat",
  /* isPremium + price: Builder.jsx:336 ghi hai trường này khi giáo viên bật
     "bài trả phí". Thiếu chúng ở đây thì `toRows` lặng lẽ vứt đi — giáo viên
     bật khoá, bấm lưu, bài quay về miễn phí, và KHÔNG có gì báo. Cả tường phí
     sập mà build vẫn xanh.

     Chưa gây hậu quả vì hiện chưa có bài trả phí nào (0/40), nhưng nó sẽ nổ
     đúng vào lần đầu tiên có người dùng tính năng này. `check:exercises` nay
     có ca kiểm cho đúng chỗ đó. */
  "isPremium", "price",
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

    /* ── ĐÁP ÁN KHÔNG ĐƯỢC Ở LẠI TRONG `payload` ──
     *
     * `payload` cấp SELECT cho anon; `answer_key` thì KHÔNG (migration 022).
     * Vòng lặp trên gom mọi trường lạ vào payload, nên nếu để nguyên thì đáp án
     * đi thẳng ra chỗ ai cũng đọc được.
     *
     * Migration 022 đã dọn một lần. Nhưng hàm này ghi lại payload mỗi lần giáo
     * viên bấm Lưu, nên nó ĐẶT NGƯỢC đáp án về chỗ cũ — 022 dọn, Builder bày
     * lại. Đo được: câu tableau mrigyggjafq4jz lộ trọn bộ đáp án qua khoá anon,
     * và đó chính là câu được sửa gần đây nhất.
     *
     * Danh sách trường phải khớp HỆT migration 022. Thiếu một tên ở đây là một
     * loại câu tiếp tục lộ, và không có gì trên màn hình nói ra. */
    const answer_key = {};
    for (const k of ["answer", "accepted", "justification", "answers", "model"]) {
      if (payload[k] !== undefined) { answer_key[k] = payload[k]; delete payload[k]; }
    }

    /* ── `evidence` CŨNG PHẢI RỜI KHỎI payload ──
     *
     * "Đoạn văn chứa câu trả lời" chính là câu trả lời, chỉ nói vòng. Vòng lặp
     * gom-mọi-trường-lạ ở trên sẽ đẩy nó vào `payload`, mà `payload` cấp
     * SELECT cho anon — tức là mỗi lần giáo viên bấm Lưu là neo được bày ra
     * chỗ ai cũng đọc, TRƯỚC khi học sinh làm bài.
     *
     * Đúng cơ chế đã làm lộ trọn bộ đáp án câu `tableau` trước migration 022:
     * 022 dọn một lần, còn hàm này đặt lại vào chỗ cũ mỗi lượt ghi. */
    const evidence = payload.evidence !== undefined ? payload.evidence : null;
    delete payload.evidence;

    /* `ordre`: đáp án chính là THỨ TỰ của mảng, không có trường riêng để giấu.
       Client vẫn cần nội dung các mảnh để hiển thị, nên payload giữ elements đã
       XÁO, còn bản đúng thứ tự nằm ở answer_key — đúng như 022 làm, và `grade`
       ưu tiên answer_key nên nó chấm theo bản đúng. */
    if ((q.type === "ordre") && Array.isArray(payload.elements)) {
      answer_key.elements = payload.elements;
      payload.elements = xaoTheoHat(payload.elements, String(q.id));
    }

    return {
      id: String(q.id),
      exercise_id: exRow.id,
      ord: i + 1,
      type: q.type || "fill",
      prompt: q.prompt || "",
      payload,
      answer_key,
      explanation: q.explanation || null,
      competence: q.competence || null,
      point_gram: q.pointGram || null,
      evidence,
    };
  });

  return { exRow, qRows };
}
