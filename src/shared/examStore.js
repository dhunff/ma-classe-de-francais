import { supabase } from "../storageShim.js";
import { fromRows } from "./exerciseMap.js";
import { giongThangChuan } from "./grilleRubric.js";

/* Lớp truy cập đề thi thử (migration 026).
 *
 * Đề thi KHÔNG chứa câu hỏi. Nó chỉ trỏ tới ba bài trong thư viện — một cho
 * mỗi kỹ năng. Lý do đầy đủ ở đầu migration; tóm tắt: đáp án đang được khoá ở
 * `questions.answer_key`, việc chấm đi qua đúng một Edge Function, và trình
 * soạn bài đã có. Chép câu hỏi sang chỗ khác là tách đôi cả ba.
 */

/* Cột phải LIỆT KÊ, không dùng `*`.
   Từ migration 022, `answer_key` không cấp SELECT cho anon/authenticated, và
   PostgREST khai triển `*` thành mọi cột rồi trả 401 nguyên câu — không phải
   trả về ít cột hơn. `check:store` canh chỗ này. */
const Q_COLS = "id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram";
const EX_COLS = "*";   // bảng exercises không có cột bị khoá


/* ── Cột `grille` có thể chưa tồn tại ──
 *
 * Migration 035 do người vận hành chạy tay ở SQL Editor, nên có một quãng —
 * ngắn hay dài tuỳ lúc — mà mã đã deploy còn database thì chưa. PostgREST
 * không bỏ qua cột lạ: nó trả 42703 và HUỶ CẢ CÂU. Nghĩa là chỉ cần nhắc tới
 * `grille` sớm một nhịp là toàn bộ danh sách đề thi biến mất, chứ không phải
 * mất riêng cột đó.
 *
 * Nên: thử có `grille`, gặp đúng mã lỗi ấy thì thử lại không có. Ứng dụng lùi
 * về thang chuẩn — đúng thứ nó vẫn làm trước migration này.
 *
 * KHÔNG nuốt các lỗi khác. Mạng hỏng hay RLS chặn mà cũng lặng lẽ thử lại thì
 * mất luôn thông báo lỗi thật. */
const THIEU_COT = "42703";

async function chonCoGrille(dungCau) {
  const co = await dungCau(true);
  if (!co.error) return { ...co, coGrille: true };
  if (co.error.code !== THIEU_COT) return { ...co, coGrille: true };
  const khong = await dungCau(false);
  return { ...khong, coGrille: false };
}

/* Giao diện cần phân biệt "chưa chạy migration" với "giáo viên chưa soạn
   thang". Hai thứ đều cho ra thang chuẩn, nhưng một cái là việc phải làm. */
let cotGrilleCoSan = true;
export const cotGrilleSanSang = () => cotGrilleCoSan;

/* Danh sách đề. RLS lo phần phạm vi: học sinh chỉ nhận đề đã phát hành, giáo
   viên nhận cả bản nháp. Không lọc `is_published` ở đây — lọc ở client là thứ
   xoá được trong DevTools, và lọc hai nơi thì sớm muộn hai nơi lệch nhau. */
export async function loadExams() {
  const { data, error, coGrille } = await chonCoGrille((coGrille) => supabase
    .from("exams")
    .select("id, title, level, duration_min, is_published, created_at, "
          + (coGrille ? "grille, " : "")
          + "exam_sections (id, code, exercise_id, minutes, points, ord)")
    .order("created_at", { ascending: false }));
  cotGrilleCoSan = coGrille;
  if (error) { console.error("[exam] không đọc được danh sách đề:", error.message); return []; }
  return (data ?? []).map((e) => ({
    ...e,
    sections: [...(e.exam_sections ?? [])].sort((a, b) => a.ord - b.ord),
  }));
}

/* Một đề đầy đủ, kèm nội dung ba bài.
 *
 * Trả `missing` thay vì ném lỗi khi một phần trỏ tới bài không đọc được —
 * chuyện đó xảy ra thật: bài trả phí mà học sinh chưa mua sẽ bị RLS 019 giấu,
 * và khi đó phần thi rỗng. Giao diện cần biết để nói rõ, chứ không phải hiện
 * một phần thi trắng không lời giải thích. */
export async function loadExam(examId) {
  const { data: exam, error, coGrille } = await chonCoGrille((coGrille) => supabase
    .from("exams")
    .select("id, title, level, duration_min, is_published, "
          + (coGrille ? "grille, " : "")
          + "exam_sections (id, code, exercise_id, minutes, points, ord)")
    .eq("id", examId)
    .maybeSingle());
  cotGrilleCoSan = coGrille;
  if (error || !exam) return null;

  const secs = [...(exam.exam_sections ?? [])].sort((a, b) => a.ord - b.ord);
  const ids = secs.map((s) => s.exercise_id);
  if (!ids.length) return { ...exam, sections: [], missing: [] };

  const [exRes, qRes] = await Promise.all([
    supabase.from("exercises").select(EX_COLS).in("id", ids),
    supabase.from("questions").select(Q_COLS).in("exercise_id", ids)
      .order("ord", { ascending: true }),
  ]);

  const baiTheoId = Object.fromEntries(
    fromRows(exRes.data ?? [], qRes.data ?? []).map((e) => [e.id, e]),
  );

  const sections = [];
  const missing = [];
  for (const s of secs) {
    const bai = baiTheoId[s.exercise_id];
    if (bai && (bai.questions?.length ?? 0) > 0) sections.push({ ...s, exercise: bai });
    else missing.push(s);
  }
  return { ...exam, sections, missing };
}

/* Lưu đề. Xoá hết phần rồi chèn lại, KHÔNG upsert từng phần.
 *
 * Cùng lý do như `saveExercise`: giáo viên gỡ phần PE khỏi đề thì upsert để
 * lại dòng PE cũ nằm mồ côi, và đề vẫn có ba phần trong khi trình soạn hiện
 * hai. Xoá-rồi-chèn tốn thêm vài mili giây và luôn đúng.
 *
 * PostgREST không cho transaction, nên nhánh lỗi trả về rõ ràng để giao diện
 * báo và người dùng bấm lưu lại. */
export async function saveExam(exam, sections) {
  const row = {
    title: String(exam.title || "").trim() || "(Đề chưa đặt tên)",
    level: exam.level || "B1",
    duration_min: sections.reduce((n, s) => n + (Number(s.minutes) || 0), 0) || null,
    is_published: !!exam.is_published,
  };
  if (exam.id) row.id = exam.id;
  /* Chỉ gửi `grille` khi có thật. Gửi `null` cũng chạm vào cột, nên trước
     migration 035 mọi lần lưu đề đều hỏng — kể cả đề không dùng thang riêng. */
  if (exam.grille) {
    /* Tính lại `official` ở ĐƯỜNG GHI, không chỉ lúc sửa trong trình soạn.
       Hai lý do: đề đã lưu với cờ sai sẽ tự đúng khi mở ra lưu lại, và bất kỳ
       đường ghi nào về sau cũng không phải nhớ làm việc này. Cờ suy ra được từ
       dữ liệu thì đừng để ai phải tự đặt. */
    row.grille = { ...exam.grille, official: giongThangChuan(exam.grille, row.level) };
  }

  const up = await supabase.from("exams").upsert(row, { onConflict: "id" })
    .select("id").maybeSingle();
  if (up.error) return { ok: false, error: up.error };
  const examId = up.data?.id;
  if (!examId) return { ok: false, error: { message: "không lấy được id đề" } };

  const del = await supabase.from("exam_sections").delete().eq("exam_id", examId);
  if (del.error) return { ok: false, error: del.error };

  const rows = sections
    .filter((s) => s.exercise_id)
    .map((s, i) => ({
      exam_id: examId,
      code: s.code,
      exercise_id: s.exercise_id,
      minutes: Number(s.minutes) || 0,
      points: Number(s.points) || 25,
      ord: i,
    }));
  if (rows.length) {
    const ins = await supabase.from("exam_sections").insert(rows);
    if (ins.error) return { ok: false, error: ins.error };
  }
  return { ok: true, id: examId };
}

export async function deleteExam(id) {
  const { error } = await supabase.from("exams").delete().eq("id", id);
  return error ? { ok: false, error } : { ok: true };
}
