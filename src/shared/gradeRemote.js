import { supabase } from "../storageShim.js";

/* Gọi Edge Function `grade` để chấm bài ở máy chủ.
 *
 * VÌ SAO CÓ ĐƯỜNG LUI. Hàm này trả về `null` khi gọi hỏng, và nơi gọi sẽ tự
 * chấm bằng bộ chấm cũ ở trình duyệt.
 *
 * Nghe như làm hỏng mục đích bảo mật, nhưng không — vì đường lui CHỈ chạy
 * được chừng nào đáp án còn nằm trong `payload`. Sau khi chạy migration 021
 * (gỡ đáp án khỏi những gì client đọc được), bộ chấm cũ không còn gì để so,
 * nên đường lui tự nhiên biến mất. Nó tồn tại đúng cho giai đoạn chuyển tiếp
 * này, không phải mãi mãi.
 *
 * Sắp xếp như vậy vì hai việc cần tách rời:
 *   1. Đưa việc chấm lên máy chủ  ← làm được, kiểm được ngay
 *   2. Gỡ đáp án khỏi trình duyệt ← chỉ an toàn SAU khi (1) đã chạy thật
 *
 * Làm cả hai cùng lúc mà (1) có lỗi tinh vi thì học sinh bị chấm sai hàng
 * loạt, không có gì để so sánh, và không ai biết. Làm tuần tự thì giai đoạn
 * giữa vẫn đúng dù (1) hỏng.
 */
export async function gradeRemote(exerciseId, answers, opts = {}) {
  try {
    /* `mode` quyết định lần làm này vào thang LUYỆN TẬP hay thang THI THỬ —
       ranh giới đã chốt ở roadmap §3.0. Mặc định 'practice' để mọi nơi gọi cũ
       không vô tình ghi vào thang thi. */
    const { data, error } = await supabase.functions.invoke("grade", {
      body: {
        exerciseId,
        answers,
        mode: opts.mode === "exam" ? "exam" : "practice",
        blurCount: opts.blurCount ?? 0,
        msSpent: opts.msSpent ?? {},
        /* Thi thử mở attempt từ đầu (rpc exam_start) để đếm lượt nghe; gửi id
           lên để hàm ĐÓNG đúng dòng đó thay vì tạo dòng thứ hai. */
        attemptId: opts.attemptId ?? null,
        /* Gắn lượt làm vào ĐỀ. Cần cả khi `attemptId` rỗng: bài thứ hai của
           một kỹ năng thường chưa được mở, nên chưa có attempt nào, và hàm sẽ
           tạo dòng mới — thiếu tham số này thì dòng đó không gắn với đề nào.
           Máy chủ vẫn kiểm bài có thuộc đề thật không. */
        examId: opts.examId ?? null,
      },
    });
    if (error || !data || data.error) {
      console.warn("[grade] chấm ở máy chủ hỏng, tạm chấm ở trình duyệt.",
        error?.message ?? data?.error);
      return null;
    }
    if (!data.results || typeof data.score !== "number") {
      console.warn("[grade] máy chủ trả về hình dạng lạ, tạm chấm ở trình duyệt.");
      return null;
    }
    return data;
  } catch (e) {
    console.warn("[grade] không gọi được hàm chấm, tạm chấm ở trình duyệt.",
      e?.message ?? e);
    return null;
  }
}
