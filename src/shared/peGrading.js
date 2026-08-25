import { supabase } from "../storageShim.js";

/* Đọc và chấm bài viết (Production écrite) — dành cho giáo viên.
 *
 * Máy không chấm được bài viết, nên `grade` Edge Function để câu `open` ở
 * trạng thái `graded: false`. File này là đường đưa chúng tới mắt giáo viên và
 * đưa điểm ngược lại.
 *
 * GHI đi qua RPC `grade_pe` chứ không phải `update`: migration 024 thu hết
 * quyền ghi thẳng vào `answers` khỏi trình duyệt, và cấp lại là mở đúng cái
 * cửa vừa đóng — học sinh cũng nằm trong vai `authenticated`.
 */

/* Danh sách bài viết cần chấm.
 *
 * Lọc `questions.type = 'open'` ở PHÍA MÁY CHỦ qua bộ lọc lồng của PostgREST,
 * chứ không tải hết rồi lọc ở client: một lớp học một học kỳ có thể có hàng
 * nghìn dòng `answers`, mà số bài viết chỉ vài chục.
 *
 * `chuaCham = true` là mặc định vì đó là việc giáo viên mở màn hình này để
 * làm. Xem lại bài đã chấm là việc phụ, phải bấm mới hiện. */
export async function loadPEAnswers({ chuaCham = true } = {}) {
  let q = supabase
    .from("answers")
    .select(
      "id, raw, score, max_score, feedback, graded_at, "
      + "questions!inner (id, type, prompt), "
      + "attempts!inner (id, user_id, mode, exercise_id, finished_at, exam_id)",
    )
    .eq("questions.type", "open")
    .order("id", { ascending: false })
    .limit(200);

  if (chuaCham) q = q.is("score", null);

  const { data, error } = await q;
  if (error) {
    console.error("[PE] không đọc được bài viết:", error.message);
    return { rows: [], error };
  }
  return { rows: data ?? [], error: null };
}

/* Tên học sinh. `attempts.user_id` là uuid; tên nằm ở `profiles`.
 *
 * Tách thành một truy vấn riêng thay vì nối trong câu trên: `answers` không có
 * khoá ngoại tới `profiles`, nên PostgREST không tự nối được, và thêm view chỉ
 * để hiện một cái tên là thêm một thứ phải bảo trì. */
export async function loadNames(userIds) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return {};
  const { data, error } = await supabase
    .from("profiles").select("id, name, email").in("id", ids);
  if (error) return {};
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.name || p.email || "—"]));
}

/* Chấm một bài. `max` mặc định 25 — thang của một phần thi DELF. */
export async function gradePE(answerId, score, feedback, max = 25) {
  const { data, error } = await supabase.rpc("grade_pe", {
    p_answer: answerId, p_score: score, p_max: max, p_feedback: feedback ?? null,
  });
  if (error) return { ok: false, reason: error.message };
  if (!data?.ok) return { ok: false, reason: data?.reason ?? "unknown" };
  return { ok: true };
}

/* Đếm từ — cùng cách tính với ô soạn bài của học sinh, để hai bên không nói
   hai con số khác nhau về cùng một bài. */
export const demTu = (s) =>
  String(s ?? "").trim().split(/\s+/).filter(Boolean).length;
