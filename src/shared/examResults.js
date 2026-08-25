import { supabase } from "../storageShim.js";
import { sectionScore, verdict } from "../screens/exam/examPaper.js";

/* Kết quả thi thử của CHÍNH học sinh đang đăng nhập.
 *
 * RLS lo phạm vi: `attempts_own` và `answers_own` chỉ trả dòng của người gọi.
 * Không lọc theo tên ở client — lọc ở client là thứ sửa được trong DevTools,
 * và lọc hai nơi thì sớm muộn hai nơi lệch nhau.
 *
 * ══ VÌ SAO PHẢI TÍNH LẠI, KHÔNG ĐỌC SẴN ══
 *
 * Màn hình kết quả ngay sau khi nộp tính điểm tại chỗ rồi vứt đi. Nó KHÔNG
 * dùng lại được ở đây, vì lúc đó phần Production écrite còn "chờ chấm" — điểm
 * thật của nó chỉ xuất hiện sau khi giáo viên chấm, có thể là vài ngày sau.
 *
 * Nên tổng điểm phải được tính LẠI mỗi lần mở màn hình này, từ hai nguồn:
 *   · `attempts.score / max`  — phần máy chấm (CO, CE)
 *   · `answers.score`         — phần người chấm (PE)
 */

/* Một lượt thi = nhiều `attempts` cùng `exam_id` (mỗi phần một dòng).
 *
 * Gom theo `exam_id` chứ không theo thời gian: thi lại cùng một đề vẫn ra hai
 * nhóm riêng nếu ta gom theo cả `exam_id` + ngày, nhưng gom chỉ theo thời gian
 * thì hai đề làm liền nhau sẽ dính vào nhau. */
export async function loadMyExamResults() {
  const { data: att, error } = await supabase
    .from("attempts")
    .select("id, exam_id, exercise_id, mode, score, max, finished_at, started_at")
    .eq("mode", "exam")
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false })
    .limit(100);

  if (error) return { sittings: [], error };
  const rows = att ?? [];
  if (!rows.length) return { sittings: [], error: null };

  const examIds = [...new Set(rows.map((r) => r.exam_id).filter(Boolean))];
  const attemptIds = rows.map((r) => r.id);

  const [deRes, secRes, ansRes] = await Promise.all([
    examIds.length
      ? supabase.from("exams").select("id, title, level").in("id", examIds)
      : Promise.resolve({ data: [] }),
    examIds.length
      ? supabase.from("exam_sections")
          .select("exam_id, code, exercise_id, points, ord").in("exam_id", examIds)
      : Promise.resolve({ data: [] }),
    /* Chỉ lấy câu ĐÃ được chấm tay — phần PE. Câu trắc nghiệm đã nằm trong
       `attempts.score`, kéo về nữa là đếm hai lần. */
    supabase.from("answers")
      .select("attempt_id, score, max_score, feedback, graded_at, questions!inner (type, prompt)")
      .in("attempt_id", attemptIds)
      .eq("questions.type", "open"),
  ]);

  const de = Object.fromEntries((deRes.data ?? []).map((e) => [e.id, e]));
  const secs = secRes.data ?? [];
  const ansTheoAttempt = {};
  for (const a of ansRes.data ?? []) (ansTheoAttempt[a.attempt_id] ??= []).push(a);

  /* Gom theo đề. `exam_id` null nghĩa là lượt thi từ trước khi có bảng `exams`
     (đề lắp ngẫu nhiên, đã bỏ). Vẫn hiện, nhưng nói rõ là không có đề. */
  const nhom = new Map();
  for (const r of rows) {
    const khoa = r.exam_id ?? "__khong_de__";
    if (!nhom.has(khoa)) nhom.set(khoa, []);
    nhom.get(khoa).push(r);
  }

  const sittings = [];
  for (const [khoa, list] of nhom) {
    const thongTinDe = de[khoa] ?? null;
    const phanCuaDe = secs.filter((s) => s.exam_id === khoa);

    const sections = list.map((r) => {
      const sec = phanCuaDe.find((s) => s.exercise_id === r.exercise_id);
      const points = sec?.points ?? 25;
      const peList = (ansTheoAttempt[r.id] ?? []).filter((a) => a.score != null);

      /* Ba trạng thái, và phải phân biệt đủ ba:
         · máy đã chấm (max > 0)            → quy đổi về thang 25
         · người đã chấm (có answers.score) → dùng thẳng điểm đó
         · chưa ai chấm                     → null, tức "chờ chấm"        */
      let score = null;
      if (r.max > 0) {
        score = sectionScore(r.score ?? 0, r.max, points);
      } else if (peList.length) {
        const tong = peList.reduce((n, a) => n + Number(a.score), 0);
        const tongMax = peList.reduce((n, a) => n + (Number(a.max_score) || points), 0);
        score = sectionScore(tong, tongMax, points);
      }

      return {
        code: sec?.code ?? "—",
        ord: sec?.ord ?? 99,
        points,
        score,
        exerciseId: r.exercise_id,
        finishedAt: r.finished_at,
        pe: peList.map((a) => ({
          score: Number(a.score), max: Number(a.max_score) || points,
          feedback: a.feedback, gradedAt: a.graded_at, prompt: a.questions?.prompt,
        })),
        /* Bài viết đã nộp nhưng CHƯA chấm — phân biệt với "phần này không có
           bài viết nào". Hai thứ trông giống nhau khi score = null. */
        choCham: r.max === 0 && !peList.length,
      };
    }).sort((a, b) => a.ord - b.ord);

    sittings.push({
      examId: khoa === "__khong_de__" ? null : khoa,
      title: thongTinDe?.title ?? "Lượt thi cũ (không gắn đề)",
      level: thongTinDe?.level ?? "",
      at: list.reduce((m, r) => (r.finished_at > m ? r.finished_at : m), ""),
      sections,
      ...verdict(sections),
    });
  }

  sittings.sort((a, b) => (a.at < b.at ? 1 : -1));
  return { sittings, error: null };
}
