import { supabase } from "../storageShim.js";
import { load } from "./storage.js";
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
 * GIAI ĐOẠN CHUYỂN TIẾP: đọc GỘP bảng + blob, GHI chỉ vào bảng.
 *   · Ghi chỉ vào bảng → lỗ bảo mật đóng ngay từ bản deploy này.
 *   · Đọc gộp → bài nộp cũ chưa kịp chép sang vẫn hiện, không ai mất gì.
 * Chạy migration 007 xong và số liệu khớp thì bỏ nhánh đọc blob bên dưới.
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

   Bảng hỏng thì vẫn trả về phần blob, không ném lỗi: mất mạng giữa chừng mà
   trang trắng thì tệ hơn là hiện dữ liệu cũ. */
export async function loadSubmissions() {
  const [tableRes, blob] = await Promise.all([
    supabase.from("submissions").select("*"),
    load("mcf-submissions", []),
  ]);

  const fromTable = (tableRes?.data || []).map(fromRow);
  const fromBlob = Array.isArray(blob) ? blob : [];

  /* Thứ tự truyền vào có ý nghĩa: blob trước, bảng sau, để khi `at` bằng nhau
     thì bản trong bảng thắng — nó là bản đã qua RLS. */
  return mergeByPair([...fromBlob, ...fromTable]);
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
