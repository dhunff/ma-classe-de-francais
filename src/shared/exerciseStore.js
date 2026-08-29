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
    /* LIỆT KÊ CỘT, KHÔNG DÙNG `*`.
     *
     * Từ migration 022, `answer_key` không cấp SELECT cho anon/authenticated.
     * PostgREST khai triển `*` thành TẤT CẢ các cột, kể cả cột không có quyền,
     * nên cả câu truy vấn bị từ chối — 401 permission denied, không phải "trả
     * về ít cột hơn". Toàn bộ thư viện bài tập trắng xoá.
     *
     * Đã dính đúng một lần, ngay sau khi chạy 022. Bài học: khi khoá quyền ở
     * mức CỘT thì mọi `select("*")` trên bảng đó thành quả bom hẹn giờ. */
    layHet(() => supabase.from("questions")
      .select("id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram")
      .order("ord", { ascending: true })),
  ]);
  if (exRes.error) return [];

  /* ── Giáo viên phải nhận cả đáp án ──
   *
   * `answer_key` không cấp SELECT cho `authenticated`, và giáo viên cũng nằm
   * trong vai đó — GRANT không phân biệt được người trong cùng một vai. Nên
   * đáp án về qua RPC `get_answer_keys` (migration 040), nơi kiểm `is_teacher()`
   * từng NGƯỜI.
   *
   * Không phải để hiển thị. Là để KHÔNG XOÁ MẤT: `saveExercise` xoá hết câu hỏi
   * rồi chèn lại, nên client không cầm đáp án thì dòng mới sinh ra rỗng — mở
   * bài cũ sửa một dấu phẩy là mất đáp án cả bài.
   *
   * Học sinh không gọi RPC này. Không phải vì hàm sẽ trả 0 dòng (nó có trả),
   * mà để khỏi tốn một vòng mạng cho mỗi lần mở thư viện. */
  const rows = qRes.rows;
  if (await laGiaoVien()) {
    const ids = exRes.rows.map((e) => e.id);
    if (ids.length) {
      const { data, error } = await supabase.rpc("get_answer_keys", { p_exercise_ids: ids });
      if (error) {
        /* KHÔNG im lặng. Thiếu đáp án ở đây không làm hỏng màn hình ngay —
           thư viện vẫn hiện đủ bài — nhưng nó biến lần Lưu kế tiếp thành một
           lần xoá. Nói ra để còn lần theo được. */
        console.error("[exercises] không lấy được đáp án cho giáo viên:", error.message,
          "— ĐỪNG sửa và lưu bài lúc này, đáp án sẽ mất.");
      } else {
        const theoCau = new Map((data ?? []).map((r) => [r.question_id, r.answer_key]));
        for (const r of rows) {
          const ak = theoCau.get(r.id);
          if (ak && typeof ak === "object") Object.assign(r.payload ?? (r.payload = {}), ak);
        }
      }
    }
  }

  return fromRows(exRes.rows, rows);
}

/* Vai trò đọc từ JWT đang có sẵn trong bộ nhớ — không tốn vòng mạng nào.
 *
 * `app_metadata` là chỗ duy nhất người dùng không tự ghi được (xem
 * shared/authRole.js), và cũng chính là chỗ `is_teacher()` đọc. Ở đây nó chỉ
 * quyết định CÓ GỌI RPC HAY KHÔNG — quyền thật vẫn do hàm SQL kiểm. Đoán sai
 * phía này thì tệ nhất là một lời gọi thừa trả về 0 dòng. */
async function laGiaoVien() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.app_metadata?.role === "prof";
  } catch {
    return false;
  }
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

  /* ── ĐẾM LẠI TRƯỚC KHI BÁO THÀNH CÔNG ──
   *
   * Đã xảy ra thật với `saveExam`: giáo viên thêm hai bài vào một phần, giao
   * diện hiện đủ, bấm Lưu, thấy "✅ Đã lưu đề" — và database chỉ nhận một
   * dòng. Không lỗi nào được ném ra. Người dùng tin, đi tiếp, rồi phát hiện ở
   * một chỗ hoàn toàn khác và muộn hơn nhiều.
   *
   * `saveExercise` có đúng cùng hình dạng rủi ro, và còn nặng hơn: nó XOÁ
   * SẠCH câu hỏi rồi chèn lại. PostgREST không cho transaction, nên xoá và
   * chèn là hai lời gọi rời — chèn hỏng sau khi xoá xong thì bài tập còn
   * nguyên mà mất hết câu hỏi. Nếu lúc đó vẫn báo thành công, giáo viên đóng
   * tab và bài trở thành vỏ rỗng.
   *
   * Cách duy nhất biết chắc là đếm lại. Một vòng mạng, đổi lấy việc không bao
   * giờ nói dối về một thao tác phá huỷ.
   *
   * `head: true` nên chỉ lấy con số, không kéo về nội dung câu hỏi. */
  const { count, error: demErr } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("exercise_id", exRow.id);

  if (demErr) {
    return { ok: false, error: { message:
      "Đã ghi nhưng không đọc lại được để kiểm: " + demErr.message
      + ". Mở lại bài để xem có đủ câu hỏi không." } };
  }
  if (count !== qRows.length) {
    return { ok: false, error: { message:
      `Lưu thiếu: gửi ${qRows.length} câu, database nhận ${count}. `
      + "Bài đang ở trạng thái dở dang — mở lại và lưu một lần nữa." } };
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
