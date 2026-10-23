/* Edge Function `cham-on-tap` — chấm « Bài luyện của tôi » (migration 158).
 *
 * Bài luyện ghép câu từ NHIỀU bài, nên không đi qua `grade` (chấm theo một bài và ghi
 * attempts). Hàm này dùng lại ĐÚNG bộ chấm dùng chung (_shared/questions.js, cùng luật
 * với `grade`), kiểm quyền mở TỪNG bài gốc bằng can_open_exercise, và ghi kết quả vào
 * bảng riêng on_tap_luot. Đáp án chỉ trả cho câu học sinh đã làm mà sai, như `grade`.
 *
 * body: { answers: { <question_id>: trả lời } }, tối đa 20 câu.
 * trả:  { score, max, results: { <question_id>: { graded, attempted, correct, explanation, expected } } } */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
// @ts-ignore — JS thuần
import { fillOk, vfOk, ordreOk, tableauOk, apparierOk, autoQ, diemCau, isQuestionAnswered } from "../_shared/questions.js";
import { CORS, json } from "../_shared/cors.ts";

function chamMotCau(q: any, traLoi: unknown, exercise: any) {
  if (!autoQ(q)) return null;
  switch (q.type) {
    case "qcm":     return traLoi != null && traLoi === q.answer;
    case "vf":      return vfOk(q, traLoi);
    case "ordre":   return ordreOk(q, traLoi);
    case "tableau": return tableauOk(q, traLoi);
    case "apparier": return apparierOk(q, traLoi);
    default:        return fillOk(q, traLoi, exercise);
  }
}
function dapAnHienThi(q: any): unknown {
  switch (q.type) {
    case "qcm":     return q.options?.[q.answer] ?? null;
    case "vf":      return q.answer;
    case "ordre":   return (q.elements ?? []).map((e: any) => e.texte);
    case "tableau": return q.answers ?? null;
    case "apparier": return q.answers ?? null;
    default:        return String(q.accepted ?? q.answer ?? "").split("|")[0];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  const answers = body?.answers && typeof body.answers === "object" ? body.answers : null;
  const ids = answers ? Object.keys(answers).slice(0, 21) : [];
  if (!ids.length) return json(400, { error: "missing_fields" });
  if (ids.length > 20) return json(400, { error: "too_many" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const asCaller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: authHeader ? { Authorization: authHeader } : {} } });
  const { data: u } = token ? await asCaller.auth.getUser(token) : { data: null };
  const userId = u?.user?.id ?? null;
  if (!userId) return json(401, { error: "not_signed_in" });

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: qRows, error } = await admin.from("questions")
    .select("id, exercise_id, type, prompt, payload, answer_key, explanation").in("id", ids);
  if (error) return json(500, { error: "load_failed", detail: error.message });
  if (!qRows?.length) return json(404, { error: "not_found" });

  /* Quyền mở từng bài gốc: hỏi lại chính hàm RLS, bằng token người gọi. */
  const baiIds = [...new Set(qRows.map((r: any) => r.exercise_id))];
  const { data: exRows } = await admin.from("exercises").select("id, meta").in("id", baiIds);
  const metaBai = new Map((exRows ?? []).map((x: any) => [x.id, { id: x.id, ...(x.meta ?? {}) }]));
  for (const id of baiIds) {
    const { data: duoc, error: e } = await asCaller.rpc("can_open_exercise", { ex_id: id });
    if (e) return json(500, { error: "rls_check_failed", detail: e.message });
    if (duoc !== true) return json(403, { error: "forbidden" });
  }

  const results: Record<string, unknown> = {};
  const ghi: { user_id: string; question_id: string; correct: boolean }[] = [];
  let dung = 0, tong = 0;
  for (const row of qRows as any[]) {
    const q: any = { ...(row.payload ?? {}), ...(row.answer_key ?? {}), id: row.id, type: row.type, prompt: row.prompt };
    const ex = metaBai.get(row.exercise_id) ?? { id: row.exercise_id };
    const ok = chamMotCau(q, answers[row.id], ex);
    if (ok === null) { results[row.id] = { graded: false, correct: null, explanation: "" }; continue; }
    const { dung: d, tong: n } = diemCau(q, answers[row.id], ex);
    dung += d; tong += n;
    const daLam = isQuestionAnswered(q, answers);
    results[row.id] = { graded: true, attempted: daLam, correct: ok,
      explanation: !ok && daLam ? (row.explanation ?? "") : "", expected: !ok && daLam ? dapAnHienThi(q) : undefined };
    /* Chỉ ghi câu ĐÃ LÀM: bỏ trống không phải bằng chứng là vẫn chưa nắm. */
    if (daLam) ghi.push({ user_id: userId, question_id: row.id, correct: !!ok });
  }
  if (ghi.length) {
    const { error: e } = await admin.from("on_tap_luot").insert(ghi);
    if (e) console.warn("[cham-on-tap] không ghi được on_tap_luot:", e.message);
  }
  return json(200, { score: dung, max: tong, saved: ghi.length, results });
});
