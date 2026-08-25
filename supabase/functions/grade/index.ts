/* Chấm bài phía máy chủ.
 *
 * ══ VÌ SAO CẦN HÀM NÀY ══
 *
 * Tới migration 019, bài TRẢ PHÍ đã được RLS che kín: chưa mua thì không lấy
 * được câu hỏi nào. Nhưng còn một lỗ hổng nữa, độc lập hẳn:
 *
 *     Học sinh ĐÃ mua bài vẫn nhận đáp án về trình duyệt cùng lúc với đề.
 *
 * Vì việc chấm xảy ra ở client, nên client buộc phải biết đáp án. Mở tab
 * Network là thấy `payload.answer`, `payload.accepted`. Với tự luyện thì
 * không sao — gian lận ở đây chỉ hại chính người học. Với THI THỬ thì hỏng
 * hẳn: điểm số không còn nghĩa gì.
 *
 * Hàm này chuyển việc chấm lên máy chủ. Trình duyệt gửi câu trả lời, nhận về
 * đúng/sai. Đáp án không bao giờ rời khỏi database.
 *
 * ══ LOGIC CHẤM LẤY TỪ ĐÂU ══
 *
 * `_shared/gradingEngine.js` và `_shared/questions.js` là BẢN SAO NGUYÊN VĂN
 * của hai file cùng tên trong src/shared/. Không viết lại, vì viết lại là cách
 * chắc chắn nhất để hai bên chấm khác nhau — và một học sinh bị chấm sai vì
 * server với client bất đồng thì gần như không thể truy ra.
 *
 * `npm run check:parity` so từng byte hai cặp file. Sửa một bên mà quên bên
 * kia là bộ kiểm đỏ ngay.
 *
 * Biến môi trường: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (có sẵn).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore — JS thuần, cố ý không có khai báo kiểu
import { fillOk, vfOk, ordreOk, tableauOk, autoQ, isQuestionAnswered }
  from "../_shared/questions.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

/* Chấm MỘT câu. Trả về null cho câu tự luận — máy không chấm được bài viết,
   và giả vờ chấm được còn tệ hơn không chấm. */
function chamMotCau(q: any, traLoi: unknown, exercise: any) {
  if (!autoQ(q)) return null;
  switch (q.type) {
    case "qcm":     return traLoi != null && traLoi === q.answer;
    case "vf":      return vfOk(q, traLoi);
    case "ordre":   return ordreOk(q, traLoi);
    case "tableau": return tableauOk(q, traLoi);
    default:        return fillOk(q, traLoi, exercise);   // fill / conj
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }

  const exerciseId = String(body?.exerciseId ?? "");
  const answers = body?.answers && typeof body.answers === "object" ? body.answers : null;
  if (!exerciseId || !answers) return json(400, { error: "missing_fields" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  /* ── Cửa 1: người gọi có quyền mở bài này không? ──
   *
   * Dùng client mang ĐÚNG token của người gọi, rồi hỏi lại chính hàm RLS ở
   * migration 019. Không tự viết lại luật phân quyền ở đây: hai bản luật rồi
   * sẽ lệch nhau, và bản lỏng hơn sẽ là bản bị lợi dụng.
   *
   * Không có header thì vẫn hỏi — `can_open_exercise` xử lý được trường hợp
   * chưa đăng nhập (bài miễn phí vẫn true). */
  const authHeader = req.headers.get("Authorization") ?? "";
  const asCaller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
  const { data: duocMo, error: rlsErr } =
    await asCaller.rpc("can_open_exercise", { ex_id: exerciseId });
  if (rlsErr) return json(500, { error: "rls_check_failed", detail: rlsErr.message });
  if (duocMo !== true) return json(403, { error: "forbidden" });

  /* ── Cửa 2: lấy đáp án bằng service_role ──
   * Chỉ tới bước này mới dùng khoá mạnh, và chỉ để ĐỌC đáp án — không bao giờ
   * gửi chúng ra ngoài nguyên vẹn. */
  const admin = createClient(url, serviceKey);

  const [{ data: exRow }, { data: qRows, error: qErr }] = await Promise.all([
    admin.from("exercises").select("id, meta").eq("id", exerciseId).maybeSingle(),
    admin.from("questions").select("id, type, prompt, payload, explanation")
         .eq("exercise_id", exerciseId).order("ord", { ascending: true }),
  ]);
  if (qErr) return json(500, { error: "load_failed", detail: qErr.message });
  if (!qRows?.length) return json(404, { error: "exercise_empty" });

  /* Dựng lại hình dạng mà bộ chấm mong đợi: payload phẳng ra cùng cấp với
     type/prompt, đúng như `questionFromRow` phía client làm. */
  const exercise = { id: exerciseId, ...(exRow?.meta ?? {}) };
  const ketQua: Record<string, unknown> = {};
  let dung = 0, tong = 0;

  for (const row of qRows) {
    const q: any = { ...(row.payload ?? {}), id: row.id, type: row.type, prompt: row.prompt };
    const ok = chamMotCau(q, answers[row.id], exercise);

    if (ok === null) {
      /* Câu tự luận: không chấm, nhưng vẫn báo để giao diện biết mà hiện
         "chờ giáo viên chấm" thay vì im lặng bỏ qua. */
      ketQua[row.id] = { graded: false, correct: null, explanation: row.explanation ?? "" };
      continue;
    }

    tong++;
    if (ok) dung++;

    /* CÓ THỬ LÀM hay không quyết định việc lộ đáp án.
     *
     * Bản đầu chỉ xét đúng/sai, và để hở đúng một cửa sổ: nộp `{"answers":{}}`
     * thì mọi câu tính là sai, nên hàm trả về TRỌN BỘ đáp án. Đã thử thật —
     * 22/22 câu lộ. Người muốn gian lận chỉ cần nộp trống một lần, đọc đáp án,
     * rồi nộp lại cho đúng.
     *
     * Nên chỉ mở đáp án cho câu học sinh THẬT SỰ có làm. Bỏ trống thì vẫn tính
     * sai, nhưng không được gì. Ai muốn biết đáp án vẫn phải trả giá bằng một
     * lần trả lời sai — đúng như học trên giấy.
     *
     * `isQuestionAnswered` lấy từ cùng file dùng chung, nên định nghĩa "đã trả
     * lời" ở server khớp hệt cái nút "Nộp bài" bên client đang đếm. */
    const daLam = isQuestionAnswered(q, answers);

    ketQua[row.id] = {
      graded: true,
      attempted: daLam,
      correct: ok,
      explanation: !ok && daLam ? (row.explanation ?? "") : "",
      expected: !ok && daLam ? dapAnHienThi(q) : undefined,
    };
  }

  return json(200, { exerciseId, score: dung, max: tong, results: ketQua });
});

/* Dạng đáp án đúng để hiện cho người học SAU khi đã sai.
   Với câu tự luận thì không có gì để hiện. */
function dapAnHienThi(q: any): unknown {
  switch (q.type) {
    case "qcm":     return q.options?.[q.answer] ?? null;
    case "vf":      return q.answer;
    case "ordre":   return (q.elements ?? []).map((e: any) => e.texte);
    case "tableau": return q.answers ?? null;
    default:        return String(q.accepted ?? q.answer ?? "").split("|")[0];
  }
}
