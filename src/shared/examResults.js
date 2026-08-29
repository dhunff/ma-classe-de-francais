import { supabase } from "../storageShim.js";
import { sectionScore, verdict, chiaLuotThi, gopDiemKyNang } from "../screens/exam/examPaper.js";

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
      /* Đọc `grille` bằng đường lùi được: migration 035 chạy tay ở SQL Editor,
         nên có quãng mà mã đã deploy còn cột thì chưa. PostgREST trả 42703 và
         HUỶ CẢ CÂU — nghĩa là nhắc tới cột sớm một nhịp thì mất luôn tên đề và
         trình độ, không phải mất riêng thang chấm. */
      ? supabase.from("exams").select("id, title, level, grille").in("id", examIds)
          .then((r) => (r.error?.code === "42703"
            ? supabase.from("exams").select("id, title, level").in("id", examIds)
            : r))
      : Promise.resolve({ data: [] }),
    examIds.length
      ? supabase.from("exam_sections")
          .select("exam_id, code, exercise_id, points, ord, "
                + /* `consigne` là BỐI CẢNH đề — "Depuis une dizaine d'années,
                     vous êtes membre de l'association…". Màn tự chấm trước đây
                     chỉ nhận `questions.prompt` ("Vous écrivez au président…"),
                     tức một nửa đề. Mà tiêu chí đầu tiên là « Bám sát đề bài »:
                     không có bối cảnh thì không có gì để bám. */
                  "exercises (consigne)")
          .in("exam_id", examIds)
      : Promise.resolve({ data: [] }),
    /* Chỉ lấy câu ĐÃ được chấm tay — phần PE. Câu trắc nghiệm đã nằm trong
       `attempts.score`, kéo về nữa là đếm hai lần. */
    supabase.from("answers")
      .select("id, attempt_id, raw, score, max_score, feedback, graded_at, self_score, self_breakdown, questions!inner (id, type, prompt)")
      .in("attempt_id", attemptIds)
      .eq("questions.type", "open"),
  ]);

  const de = Object.fromEntries((deRes.data ?? []).map((e) => [e.id, e]));
  const secs = secRes.data ?? [];
  const ansTheoAttempt = {};
  for (const a of ansRes.data ?? []) (ansTheoAttempt[a.attempt_id] ??= []).push(a);

  /* Gom theo LƯỢT THI: cùng đề VÀ liền nhau về thời gian.
   *
   * Bản trước gom chỉ theo `exam_id`, và chú thích của chính nó đã nói ra hệ
   * quả: thi lại cùng một đề thì mọi lượt dính vào một khối. Người dùng thi ba
   * lần thấy một thẻ duy nhất với sáu dòng CO và tổng /375 — cộng điểm của ba
   * buổi khác nhau lại làm một.
   *
   * Không có cột nào đánh dấu "lượt thi" trong `attempts`, nên cắt theo KHOẢNG
   * TRỐNG thời gian. Hai bài cách nhau hơn 4 giờ chắc chắn không thuộc cùng một
   * buổi: đề dài nhất (B2) là 30+60+60 = 150 phút, và người ta có thể tạm dừng
   * giữa các phần. Ngưỡng rộng thì rủi ro là gộp nhầm hai buổi liền kề; ngưỡng
   * hẹp thì cắt đôi một buổi có nghỉ giải lao. Gộp nhầm dễ nhận ra hơn — nó
   * hiện thành hai dòng cùng một kỹ năng — nên chọn rộng.
   *
   * Duyệt theo thời gian TĂNG dần để so được với dòng liền trước; `rows` đến
   * theo thứ tự giảm dần. */
  const nhom = new Map();
  {
    const theoDe = new Map();
    for (const r of rows) {
      const de = r.exam_id ?? "__khong_de__";
      if (!theoDe.has(de)) theoDe.set(de, []);
      theoDe.get(de).push(r);
    }
    /* `chiaLuotThi` là hàm THUẦN trong examPaper.js — `check:exam` chạy được
       nó bằng node, còn file này thì không vì nó import storageShim. */
    for (const [de, ds] of theoDe) {
      chiaLuotThi(ds).forEach((luot, i) => nhom.set(de + "#" + i, luot));
    }
  }

  const sittings = [];
  for (const [khoa, list] of nhom) {
    /* `khoa` giờ có dạng "<exam_id>#<số lượt>" — cắt lấy lại id để tra. */
    const examId = khoa.slice(0, khoa.lastIndexOf("#"));
    const thongTinDe = de[examId] ?? null;
    const phanCuaDe = secs.filter((s) => s.exam_id === examId);

    /* ══ MỘT KỸ NĂNG = MỘT DÒNG, dù có mấy bài ══
     *
     * Bản trước làm `list.map(r => …)`, tức MỖI DÒNG `attempts` thành một phần
     * thi. Từ migration 044 một kỹ năng chứa nhiều bài, và ExamMode gọi chấm
     * một lần cho MỖI BÀI — nên đề CO hai bài sinh ra hai dòng `attempts`, và
     * màn kết quả hiện hai dòng "CO", mỗi dòng trên thang 25.
     *
     * Hậu quả nhìn thấy được: một đề ba kỹ năng hiện 13 dòng, tổng /375 thay
     * vì /75. Và tệ hơn con số: mỗi bài bị đánh giá riêng theo ngưỡng 5/25, nên
     * một bài khó kéo cả buổi thi xuống "Chưa đạt" dù kỹ năng đó đạt.
     *
     * Đúng mô hình DELF, và giống hệt cách ExamMode chấm lúc đang thi: cộng
     * điểm THÔ của các bài rồi quy về thang 25 MỘT LẦN. Quy đổi từng bài rồi
     * cộng thì bài 7 câu nặng bằng bài 15 câu.
     *
     * `points` lấy từ dòng đầu của khối, KHÔNG cộng dồn — 25 là điểm của cả
     * kỹ năng, không phải của từng bài. Xem CLAUDE.md, mục 044. */
    const theoKyNang = new Map();
    for (const r of list) {
      const sec = phanCuaDe.find((x) => x.exercise_id === r.exercise_id);
      const code = sec?.code ?? "—";
      if (!theoKyNang.has(code)) theoKyNang.set(code, { sec, rows: [] });
      theoKyNang.get(code).rows.push(r);
    }

    const sections = [...theoKyNang.entries()].map(([code, { sec, rows: rs }]) => {
      const points = sec?.points ?? 25;

      /* Cộng thô phần máy chấm trên MỌI bài của kỹ năng này. */
      const tong = rs.reduce((n, r) => n + (Number(r.max) || 0), 0);
      const diemMay = gopDiemKyNang(rs, points);

      /* Bài viết của cả kỹ năng, gộp từ mọi lượt chấm. */
      const peAll = rs.flatMap((r) => ansTheoAttempt[r.id] ?? []);
      const peList = peAll.filter((a) => a.score != null);

      /* Ba trạng thái, và phải phân biệt đủ ba:
         · máy đã chấm (tong > 0)           → quy đổi về thang 25, một lần
         · người đã chấm (có answers.score) → dùng thẳng điểm đó
         · chưa ai chấm                     → null, tức "chờ chấm"        */
      let score = null;
      if (tong > 0) {
        score = diemMay;
      } else if (peList.length) {
        const t = peList.reduce((n, a) => n + Number(a.score), 0);
        const tMax = peList.reduce((n, a) => n + (Number(a.max_score) || points), 0);
        score = sectionScore(t, tMax, points);
      }

      return {
        code,
        ord: sec?.ord ?? 99,
        points,
        score,
        /* Bài ĐẦU của kỹ năng — màn tự chấm mở theo id này. Nhiều bài thì
           `peList` bên dưới vẫn gộp đủ, nên không mất bài viết nào. */
        exerciseId: rs[0]?.exercise_id,
        soBai: rs.length,
        finishedAt: rs.reduce((m, r) => (r.finished_at > m ? r.finished_at : m), ""),
        pe: peAll.map((a) => ({
          answerId: a.id, questionId: a.questions?.id, raw: a.raw ?? "",
          selfScore: a.self_score == null ? null : Number(a.self_score),
          selfBreakdown: a.self_breakdown ?? null,
          score: a.score == null ? null : Number(a.score), max: Number(a.max_score) || points,
          feedback: a.feedback, gradedAt: a.graded_at, prompt: a.questions?.prompt,
        })),
        /* Bài viết đã nộp nhưng CHƯA chấm — phân biệt với "phần này không có
           bài viết nào". Hai thứ trông giống nhau khi score = null. */
        choCham: tong === 0 && !peList.length,
        /* Trình độ của đề — màn tự chấm cần nó để chọn đúng grille. */
        level: thongTinDe?.level ?? "B1",
        /* Thang do giáo viên soạn, hoặc null = dùng thang chuẩn theo level. */
        grille: thongTinDe?.grille ?? null,
        /* Bối cảnh đề, dạng HTML do trình soạn sinh ra. Màn tự chấm dựng nó
           bằng dangerouslySetInnerHTML, giống Taking.jsx và ExamMode. */
        consigne: sec?.exercises?.consigne ?? "",
      };
    }).sort((a, b) => a.ord - b.ord);

    sittings.push({
      examId: examId === "__khong_de__" ? null : examId,
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
