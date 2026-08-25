/* Chấm bài viết (Production écrite) bằng Claude, theo grille DELF.
 *
 * ══ VÌ SAO CHẠY Ở MÁY CHỦ ══
 *
 * Kho��� API của Anthropic KHÔNG được phép xuống trình duyệt. Nó nằm sẵn trong
 * bundle thì ai cũng đọc được và tiêu tiền của bạn — cùng đúng lý do mà việc
 * chấm và đáp án đã dời lên máy chủ ở migration 019–022.
 *
 * ══ ĐIỂM AI VÀO THẲNG CỘT `score` ══
 *
 * Người dùng chọn như vậy (xem đầu migration 029). Tôi đã nêu rủi ro: bài lạc
 * đề hoặc chép mạng vẫn được điểm mà không ai nhìn qua. Nên hàm này để lại dấu
 * vết đầy đủ — `score_from_ai = true`, `ai_breakdown` từng tiêu chí, `ai_model`
 * — và giao diện nói rõ với học sinh rằng điểm do máy chấm. Giáo viên chấm đè
 * lên lúc nào cũng được, và khi đó cờ hạ xuống.
 *
 * Biến môi trường:
 *   ANTHROPIC_API_KEY          bạn tự đặt: supabase secrets set ANTHROPIC_API_KEY=...
 *   ANTHROPIC_MODEL            tuỳ chọn, mặc định claude-opus-5
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY   có sẵn
 */

import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.71.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore — JS thuần, dùng chung với bộ kiểm chạy bằng Node
import { GRILLE, tongDiem } from "../_shared/delfGrille.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status, headers: { ...CORS, "Content-Type": "application/json" },
  });

const demTu = (s: string) => String(s ?? "").trim().split(/\s+/).filter(Boolean).length;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    /* Nói rõ THIẾU GÌ và SỬA THẾ NÀO. "Lỗi máy chủ" chung chung ở đây khiến
       người ta đi tìm bug trong mã, trong khi việc cần làm là một dòng lệnh. */
    return json(503, {
      error: "no_api_key",
      message: "Chưa đặt ANTHROPIC_API_KEY. Chạy: "
             + "supabase secrets set ANTHROPIC_API_KEY=sk-ant-...",
    });
  }

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  const answerId = String(body?.answerId ?? "");
  if (!answerId) return json(400, { error: "missing_answer_id" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  /* ── Ai được gọi ──
   * Chủ bài làm, hoặc giáo viên. Không kiểm thì bất kỳ ai biết một answer_id
   * cũng bắt hệ thống tiêu tiền API của bạn. */
  const authHeader = req.headers.get("Authorization") ?? "";
  const asCaller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
  const { data: userData } = await asCaller.auth.getUser();
  const userId = userData?.user?.id ?? null;
  if (!userId) return json(401, { error: "unauthenticated" });

  const { data: row, error: rowErr } = await admin
    .from("answers")
    .select("id, raw, score, questions!inner (type, prompt, exercise_id), "
          + "attempts!inner (user_id, exam_id)")
    .eq("id", answerId)
    .maybeSingle();
  if (rowErr || !row) return json(404, { error: "answer_not_found" });
  if ((row as any).questions.type !== "open") return json(400, { error: "not_open" });

  const laChu = (row as any).attempts.user_id === userId;
  const { data: laGV } = await asCaller.rpc("is_teacher");
  if (!laChu && laGV !== true) return json(403, { error: "forbidden" });

  /* Đã có điểm người chấm thì KHÔNG ghi đè. Giáo viên đọc rồi mà máy sửa lại
     là thứ không ai muốn giải thích với học sinh. */
  if (row.score != null && (row as any).score_from_ai === false) {
    return json(409, { error: "already_graded_by_teacher" });
  }

  const baiLam = String(row.raw ?? "").trim();
  const deBai = String((row as any).questions.prompt ?? "");

  /* Bài trống thì không gọi API. 0 điểm là kết luận đúng và miễn phí. */
  if (!baiLam) {
    await admin.from("answers").update({
      score: 0, max_score: 25, score_from_ai: true, ai_score: 0,
      ai_breakdown: { note: "Bài nộp trống." }, ai_at: new Date().toISOString(),
      feedback: "Bài nộp trống — không có gì để chấm.",
    }).eq("id", answerId);
    return json(200, { ok: true, score: 0, empty: true });
  }

  /* Trình độ lấy từ đề thi; không có thì mặc định B1. */
  let level = "B1";
  const examId = (row as any).attempts.exam_id;
  if (examId) {
    const { data: ex } = await admin.from("exams").select("level").eq("id", examId).maybeSingle();
    if (ex?.level && GRILLE[ex.level as keyof typeof GRILLE]) level = ex.level;
  }
  const grille = GRILLE[level as keyof typeof GRILLE];
  const max = tongDiem(level);

  /* ── Bắt Claude trả về đúng hình dạng ──
   * Dùng strict tool use thay vì "hãy trả JSON": schema được kiểm phía API, nên
   * không phải tự đoán và tự vá khi model trả về prose lẫn JSON. */
  const properties: Record<string, unknown> = {};
  for (const c of grille.criteres) {
    properties[c.id] = {
      type: "object",
      properties: {
        note: { type: "number", description: `0 à ${c.max}, par pas de 0,5` },
        justification: { type: "string", description: "Une phrase, en français." },
      },
      required: ["note", "justification"],
      additionalProperties: false,
    };
  }
  properties.commentaire_global = {
    type: "string",
    description: "2–3 phrases en français, adressées à l'apprenant : ce qui est réussi, "
               + "puis UNE chose précise à corriger la prochaine fois.",
  };

  const client = new Anthropic({ apiKey });
  const model = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-opus-5";

  const lignes = grille.criteres
    .map((c: any) => `- ${c.id} (sur ${c.max}) — ${c.label} : ${c.aide}`).join("\n");

  let res;
  try {
    res = await client.messages.create({
      model,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system:
        "Vous êtes correcteur certifié DELF pour France Éducation international. "
        + "Vous corrigez une production écrite selon la grille officielle, sans indulgence "
        + "ni sévérité excessive : la note doit être celle qu'un jury donnerait.\n\n"
        + "Règles : notez chaque critère séparément, par pas de 0,5, sans jamais dépasser "
        + "son maximum. Une copie hors sujet perd les points de « Respect de la consigne » "
        + "et de contenu, même si la langue est correcte. Une copie nettement plus courte "
        + "que la longueur demandée est pénalisée sur la consigne. "
        + "Justifiez en français, brièvement, en citant ce qui est observé dans la copie.",
      messages: [{
        role: "user",
        content:
          `Niveau : DELF ${level}. Type d'écrit attendu : ${grille.consigne} `
          + `Longueur demandée : environ ${grille.minWords} mots.\n\n`
          + `SUJET :\n${deBai}\n\n`
          + `COPIE DE L'APPRENANT (${demTu(baiLam)} mots) :\n"""\n${baiLam}\n"""\n\n`
          + `Grille (total ${max}) :\n${lignes}`,
      }],
      tools: [{
        name: "noter_copie",
        description: "Enregistre la note détaillée de la copie selon la grille DELF.",
        strict: true,
        input_schema: {
          type: "object",
          properties,
          required: [...grille.criteres.map((c: any) => c.id), "commentaire_global"],
          additionalProperties: false,
        },
      }],
      tool_choice: { type: "tool", name: "noter_copie" },
    });
  } catch (e) {
    console.error("[pe-ai] gọi Claude hỏng:", (e as Error)?.message);
    return json(502, { error: "model_call_failed", message: String((e as Error)?.message ?? e) });
  }

  const block = res.content.find((b: any) => b.type === "tool_use");
  if (!block) return json(502, { error: "no_tool_use" });
  const out: any = (block as any).input;

  /* Cộng điểm Ở ĐÂY, không dùng con số tổng do model tự cộng.
     Model cộng nhầm là chuyện có thật, và khi đó tổng không khớp breakdown —
     học sinh nhìn thấy ngay mà ta không giải thích được. */
  let tong = 0;
  const breakdown: Record<string, unknown> = {};
  for (const c of grille.criteres) {
    const n = Math.max(0, Math.min(Number(out?.[c.id]?.note) || 0, c.max));
    const lam = Math.round(n * 2) / 2;                  // ép về nửa điểm
    tong += lam;
    breakdown[c.id] = { note: lam, max: c.max, label: c.label,
                        justification: String(out?.[c.id]?.justification ?? "") };
  }
  tong = Math.round(tong * 2) / 2;

  const nhanXet = String(out?.commentaire_global ?? "").trim();

  const { error: upErr } = await admin.from("answers").update({
    score: tong, max_score: max, feedback: nhanXet || null,
    score_from_ai: true, ai_score: tong, ai_breakdown: breakdown,
    ai_model: model, ai_at: new Date().toISOString(),
  }).eq("id", answerId);
  if (upErr) return json(500, { error: "save_failed", message: upErr.message });

  return json(200, { ok: true, score: tong, max, level, breakdown, feedback: nhanXet, model });
});
