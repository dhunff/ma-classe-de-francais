/* Giáo viên cấp / thu hồi quyền — chạy phía máy chủ.
 *
 * Tồn tại để đóng lối vòng cuối: trước đây nút « Cấp quyền » ghi thẳng vào
 * kv_store, nơi mọi trình duyệt ghi được, nên một học sinh có thể tự tạo bản
 * ghi "giáo viên cấp" cho mình và mở khoá bài trả phí mà không trả tiền.
 *
 * Biến môi trường:
 *   TEACHER_TOKEN             chuỗi bí mật giáo viên nhập một lần trong app
 *   SUPABASE_URL              có sẵn
 *   SUPABASE_SERVICE_ROLE_KEY có sẵn
 *
 * TEACHER_TOKEN không bao giờ được lưu vào kv_store — ai cũng đọc được ở đó.
 * Nó nằm trong localStorage của máy giáo viên, và chỉ ở đó.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* CORS dùng chung — xem _shared/cors.ts. Bản khai tại chỗ trước đây thiếu
   `x-client-info` VÀ `apikey`, nên nút « Cấp quyền » của giáo viên bị trình
   duyệt chặn trước khi request rời máy. */
import { CORS, json } from "../_shared/cors.ts";


/* So sánh không phụ thuộc độ dài khớp sớm, tránh rò rỉ thông tin qua thời gian. */
const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const expected = Deno.env.get("TEACHER_TOKEN") ?? "";
  const got = req.headers.get("x-teacher-token") ?? "";
  if (!expected || !safeEqual(got, expected)) return json(401, { error: "unauthorized" });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }

  const action = String(body.action ?? "");
  const student = String(body.student ?? "").trim();
  const exerciseId = String(body.exercise_id ?? "").trim();
  if (!student || !exerciseId) return json(400, { error: "missing_fields" });
  if (action !== "grant" && action !== "revoke") return json(400, { error: "bad_action" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (action === "revoke") {
    /* Chỉ gỡ được quyền do giáo viên cấp. Quyền đã thanh toán không xoá bằng
       đường này — tiền đã vào thì việc rút lại là quyết định cần dấu vết, không
       phải một cú bấm nút. */
    const { data: removed, error } = await supabase
      .from("exercise_access")
      .delete()
      .eq("student", student)
      .eq("exercise_id", exerciseId)
      .eq("status", "GRANTED_BY_TEACHER")
      .select("id");
    if (error) return json(500, { error: "delete_failed", detail: error.message });

    /* Nói đúng chuyện đã xảy ra. Trả `ok: true` khi không xoá được gì sẽ khiến
       giáo viên tưởng đã thu hồi trong khi học sinh vẫn mở được bài.
       Bản ghi PURCHASED cố ý không gỡ bằng đường này: tiền đã vào thì việc rút
       lại cần thao tác có chủ đích trong database, không phải một cú bấm. */
    if (!removed || removed.length === 0) {
      const { data: still } = await supabase
        .from("exercise_access")
        .select("status")
        .eq("student", student)
        .eq("exercise_id", exerciseId)
        .maybeSingle();
      return json(200, {
        ok: false,
        removed: 0,
        reason: still?.status === "PURCHASED" ? "purchased_not_revocable" : "no_such_grant",
        student,
        exercise_id: exerciseId,
      });
    }
    return json(200, { ok: true, action, removed: removed.length, student, exercise_id: exerciseId });
  }

  /* Cấp: không đè lên bản ghi đã thanh toán. */
  const { data: existing } = await supabase
    .from("exercise_access")
    .select("status")
    .eq("student", student)
    .eq("exercise_id", exerciseId)
    .maybeSingle();
  if (existing?.status === "PURCHASED") return json(200, { ok: true, unchanged: "already_purchased" });

  const { error } = await supabase
    .from("exercise_access")
    .upsert(
      { student, exercise_id: exerciseId, status: "GRANTED_BY_TEACHER" },
      { onConflict: "student,exercise_id" },
    );
  if (error) return json(500, { error: "write_failed", detail: error.message });

  return json(200, { ok: true, action, student, exercise_id: exerciseId });
});
