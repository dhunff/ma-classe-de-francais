import { supabase } from "../storageShim.js";
import { fromRows, toRows } from "./exerciseMap.js";

/* Lớp truy cập ngân hàng đề — bảng `exercises` + `questions` (migration 010).
 *
 * Thay cho `load("mcf-practice")` / `load("mcf-exercises")`. Lý do đầy đủ ở
 * đầu migration; tóm lại là blob 144 KB, ghi đè mất dữ liệu khi hai giáo viên
 * sửa cùng lúc, và không truy vấn được.
 *
 * HAI KHO: `store` phân biệt bài được giao ('assignment') với thư viện luyện
 * tập ('practice'). Ứng dụng vốn đọc hai khoá khác nhau, nên ranh giới đó phải
 * giữ — gộp làm một là thư viện luyện tập nuốt cả bài đang giao.
 *
 * Phần ánh xạ nằm ở exerciseMap.js — thuần, không I/O, có bộ kiểm riêng
 * (`npm run check:exercises`). Đó là chỗ dễ mất dữ liệu nhất: một trường rơi
 * khỏi payload là một phần đề bài biến mất mà build vẫn xanh.
 */

/* Đọc cả bài lẫn câu rồi ghép ở client. Hai truy vấn phẳng chạy song song
   nhanh hơn một truy vấn lồng, và tránh việc PostgREST trả về cây JSON mà ta
   phải làm phẳng lại. */
export async function loadExercises(store) {
  const [exRes, qRes] = await Promise.all([
    supabase.from("exercises").select("*").eq("store", store)
      .order("created_at", { ascending: true }),
    supabase.from("questions").select("*").order("ord", { ascending: true }),
  ]);
  if (exRes.error) return [];
  return fromRows(exRes.data || [], qRes.data || []);
}

export const loadPractice = () => loadExercises("practice");
export const loadAssignments = () => loadExercises("assignment");

/* Lưu MỘT bài tập cùng toàn bộ câu hỏi của nó.
 *
 * Câu hỏi thì xoá hết rồi chèn lại, không upsert từng câu: giáo viên xoá một
 * câu giữa bài thì upsert để lại câu đó nằm mồ côi trong bảng, và bài tập có
 * thêm một câu không ai thấy trong trình soạn. Xoá-rồi-chèn tốn hơn vài mili
 * giây và luôn đúng.
 *
 * KHÔNG dùng transaction vì PostgREST không cho. Nếu chèn hỏng sau khi xoá
 * xong thì bài tập còn nguyên nhưng mất câu hỏi — nên nhánh lỗi trả về rõ
 * ràng để giao diện báo và người dùng bấm lưu lại. */
export async function saveExercise(exercise, store) {
  const { exRow, qRows } = toRows(exercise, store);

  const up = await supabase.from("exercises").upsert(exRow, { onConflict: "id" });
  if (up.error) return { ok: false, error: up.error };

  const del = await supabase.from("questions").delete().eq("exercise_id", exRow.id);
  if (del.error) return { ok: false, error: del.error };

  if (qRows.length) {
    const ins = await supabase.from("questions").insert(qRows);
    if (ins.error) return { ok: false, error: ins.error };
  }
  return { ok: true };
}

/* Xoá bài. `on delete cascade` ở khoá ngoại lo phần câu hỏi. */
export async function deleteExercise(id) {
  const { error } = await supabase.from("exercises").delete().eq("id", id);
  return error ? { ok: false, error } : { ok: true };
}
