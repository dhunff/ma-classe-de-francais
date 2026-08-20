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
/* PostgREST cắt kết quả ở `max-rows` phía máy chủ (Supabase mặc định 1000) và
   KHÔNG báo lỗi khi cắt — chỉ trả về ít dòng hơn. Thư viện hiện có 416 câu nên
   chưa chạm ngưỡng, nhưng chạm rồi thì triệu chứng là vài bài tự dưng thiếu
   câu cuối, build xanh, không có gì trong console. Lấy theo trang cho xong
   chuyện, đừng chờ tới lúc phải đi tìm. */
const CO_TRANG = 1000;

async function layHet(query) {
  const rows = [];
  for (let tu = 0; ; tu += CO_TRANG) {
    const { data, error } = await query().range(tu, tu + CO_TRANG - 1);
    if (error) return { rows, error };
    rows.push(...(data || []));
    if (!data || data.length < CO_TRANG) return { rows, error: null };
  }
}

export async function loadExercises(store) {
  const [exRes, qRes] = await Promise.all([
    layHet(() => supabase.from("exercises").select("*").eq("store", store)
      .order("created_at", { ascending: true })),
    layHet(() => supabase.from("questions").select("*").order("ord", { ascending: true })),
  ]);
  if (exRes.error) return [];
  return fromRows(exRes.rows, qRes.rows);
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

/* Sửa vài trường trong `meta` mà KHÔNG đụng tới câu hỏi.
 *
 * Đổi thư mục của một bài mà gọi `saveExercise` là xoá sạch rồi chèn lại toàn
 * bộ câu hỏi của bài đó — chỉ để sửa một chuỗi trong jsonb. Vừa phí, vừa mở ra
 * đúng cái cửa sổ hỏng giữa chừng đã cảnh báo ở trên.
 *
 * Đọc-sửa-ghi ở đây an toàn vì phạm vi là MỘT dòng: PostgREST không cho viết
 * `meta = meta || '{…}'`, nhưng hai giáo viên phải cùng sửa đúng một bài trong
 * cùng một khoảnh khắc mới đè nhau — khác hẳn blob, nơi mọi thao tác đều ghi
 * lại cả 37 bài.
 *
 * Giá trị `undefined` hoặc `null` nghĩa là XOÁ khoá, không phải ghi null vào —
 * `folderId: undefined` là cách ứng dụng gỡ bài khỏi thư mục. */
export async function patchExerciseMeta(id, patch) {
  const cur = await supabase.from("exercises").select("meta").eq("id", id).maybeSingle();
  if (cur.error) return { ok: false, error: cur.error };

  const meta = { ...(cur.data?.meta || {}) };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === null) delete meta[k];
    else meta[k] = v;
  }

  const { error } = await supabase.from("exercises").update({ meta }).eq("id", id);
  return error ? { ok: false, error } : { ok: true, meta };
}

/* Gỡ mọi bài ra khỏi một thư mục trước khi xoá thư mục đó.
 *
 * Giữ đúng thứ tự của bản blob: giải phóng bài TRƯỚC, xoá thư mục SAU. Làm
 * ngược lại mà nửa chừng hỏng thì bài trỏ tới thư mục không còn tồn tại và
 * biến mất khỏi mọi màn hình — vẫn nằm trong bảng, nhưng không ai thấy.
 *
 * Lọc bằng `meta->>folderId` nên chỉ đụng đúng số dòng cần đụng. */
export async function clearFolder(folderId) {
  const res = await supabase.from("exercises").select("id")
    .eq("meta->>folderId", folderId);
  if (res.error) return { ok: false, error: res.error };

  for (const row of res.data || []) {
    const r = await patchExerciseMeta(row.id, { folderId: undefined });
    if (!r.ok) return r;
  }
  return { ok: true, freed: (res.data || []).length };
}
