import { supabase } from "../storageShim.js";
import { fromRow, toRow, mergeByPair } from "./submissionMap.js";

/* Lớp truy cập bài nộp — bảng `public.submissions`, mỗi bài một dòng.
 *
 * VÌ SAO TỒN TẠI: trước đây toàn bộ bài nộp của cả lớp nằm trong MỘT dòng
 * kv_store (`s:mcf-submissions`). Nộp bài nghĩa là ghi đè cả dòng đó. RLS phân
 * quyền theo dòng, nên không có cách nào cho phép "sửa bài của mình" mà cấm
 * "ghi đè bài của người khác" — migration 002 nói thẳng điều này, và
 * migration 005 tạo bảng để đóng lỗ đó. Bảng đã sẵn sàng từ lâu; phần còn
 * thiếu là chỗ này, phía ứng dụng.
 *
 * Đọc blob còn để lộ thêm một chuyện nữa: policy `kv_auth_read` cho mọi người
 * đã đăng nhập đọc `s:%`, nên bất kỳ học sinh nào cũng đọc được bài nộp của
 * cả lớp. Bảng có RLS theo dòng nên chấm dứt luôn chuyện đó.
 *
 * ĐÃ CHUYỂN XONG. Migration 007 đối chiếu ra 12 = 12 — bảng chứa đủ mọi thứ
 * blob có — nên nhánh đọc blob đã bỏ. Giữ lại nó bây giờ còn có hại: nó sẽ
 * dựng lại chính những bản ghi mồ côi mà 008 vừa xoá.
 *
 * `s:mcf-submissions` VẪN CÒN trong kv_store, không đụng tới, làm bản sao lưu
 * đầy đủ. Muốn khôi phục thì chạy lại phần chèn của migration 007.
 *
 * Phần ánh xạ dữ liệu nằm ở submissionMap.js — thuần, không I/O, có bộ kiểm
 * riêng (`npm run check:submissions`).
 */

async function currentUserId() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  } catch { return null; }
}

/* Đọc bài nộp. RLS lo phần phạm vi: học sinh chỉ nhận dòng của mình, giáo viên
   nhận tất. Không lọc thêm ở đây — lọc phía client là hàng rào giả.

   Vẫn gộp qua mergeByPair dù chỉ còn một nguồn: bảng không có ràng buộc duy
   nhất trên (exercise_id, student), nên nếu một lần ghi nào đó lỡ để lại hai
   dòng cho cùng cặp thì giao diện phải hiện một, không phải hai. */
export async function loadSubmissions() {
  const { data, error } = await supabase.from("submissions").select("*");
  if (error) return [];
  return mergeByPair((data || []).map(fromRow));
}

/* Ghi một bài nộp MỚI. Thay bản cũ của cùng cặp (bài tập, học sinh), đúng
   hành vi giao diện vẫn có: nộp lại thì đè lên lần trước.
 *
 * Xoá trước rồi chèn, không upsert: id sinh mới mỗi lần nộp nên upsert theo
 * khoá chính sẽ để bản cũ nằm song song. */
export async function saveSubmission(sub) {
  const userId = await currentUserId();
  const row = toRow(sub, userId);

  const del = await supabase
    .from("submissions")
    .delete()
    .eq("exercise_id", row.exercise_id)
    .eq("student", row.student);
  if (del.error) return { ok: false, error: del.error };

  const ins = await supabase.from("submissions").insert(row);
  if (ins.error) return { ok: false, error: ins.error };
  return { ok: true };
}

/* Sửa một bài nộp đã có — giáo viên chấm điểm, hoặc yêu cầu làm lại.
 *
 * Upsert chứ không update: bài nộp có thể còn nằm ở blob mà chưa có dòng trong
 * bảng, và lúc đó update sẽ lặng lẽ không sửa được gì. */
export async function patchSubmission(sub) {
  const userId = await currentUserId();
  const { error } = await supabase
    .from("submissions")
    .upsert(toRow(sub, userId ?? sub.userId ?? null), { onConflict: "id" });
  return error ? { ok: false, error } : { ok: true };
}
