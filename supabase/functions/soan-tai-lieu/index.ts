/* Soạn « Vocabulaire » + « Explications » cho một bài luyện tập (09/10).
 *
 * Chủ dự án yêu cầu mọi bài đều có hai phần này. Hàm đọc đề, ngữ liệu, câu
 * hỏi (kể cả đáp án, bằng service_role) rồi nhờ AI soạn, ghi vào
 * exercises.meta.vocabulaire / meta.explications.
 *
 * Quyền: header x-admin-token khớp TTS_ADMIN_TOKEN (người vận hành chạy hàng
 * loạt), hoặc JWT giáo viên. Mặc định KHÔNG ghi đè phần giáo viên đã viết;
 * gửi { ghiDe: true } mới ghi đè.
 *
 * Explications là TÀI LIỆU TRƯỚC KHI LÀM: giảng điểm ngữ pháp / chiến lược,
 * không đưa đáp án từng câu. Nội dung học: không dùng dấu gạch dài (quy tắc 7).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";
// @ts-ignore — JS thuần
import { bocJSON } from "../_shared/goiYPE.js";

const MODEL_MAC_DINH = "gpt-6-luna";
const laOpenAI = (m: string) => /^(gpt-|o\d)/.test(m);
const boGach = (s: string) => s.replace(/\s*[—–]\s*/g, ", ").trim();
const boThe = (s: string) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const tokenQt = Deno.env.get("TTS_ADMIN_TOKEN");
  let duoc = !!tokenQt && req.headers.get("x-admin-token") === tokenQt;
  if (!duoc) {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u } = token ? await admin.auth.getUser(token) : { data: null } as any;
    duoc = u?.user?.app_metadata?.role === "prof";
  }
  if (!duoc) return json(403, { ok: false, ma: "KHONG_CO_QUYEN" });

  const model = Deno.env.get("PE_AI_MODEL") || MODEL_MAC_DINH;
  const KHOA = Deno.env.get(laOpenAI(model) ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY");
  if (!KHOA) return json(503, { ok: false, ma: "CHUA_CAU_HINH_KHOA" });

  let than: any = null;
  try { than = await req.json(); } catch { /* */ }
  const id = than?.id;
  const ghiDe = than?.ghiDe === true;
  if (!id) return json(400, { ok: false, ma: "THIEU_ID" });

  const { data: ex } = await admin.from("exercises").select("id, title, level, skills, consigne, reading_text, meta").eq("id", id).maybeSingle();
  if (!ex) return json(404, { ok: false, ma: "KHONG_THAY_BAI" });
  const meta: any = ex.meta ?? {};
  const canVocab = ghiDe || !String(meta.vocabulaire ?? "").trim();
  const canExpl = ghiDe || !String(meta.explications ?? "").trim();
  if (!canVocab && !canExpl) return json(200, { ok: true, bo_qua: true });

  const { data: qs } = await admin.from("questions").select("type, prompt, payload, answer_key").eq("exercise_id", id).order("ord");
  const cauHoi = (qs ?? []).slice(0, 30).map((q: any, i: number) =>
    `${i + 1}. [${q.type}] ${boThe(q.prompt).slice(0, 300)} ${q.payload?.options ? "| Options : " + q.payload.options.map(boThe).join(" / ").slice(0, 300) : ""} ${q.answer_key ? "| Réponse : " + JSON.stringify(q.answer_key).slice(0, 200) : ""}`).join("\n");

  const heThong = [
    "Tu es professeur de FLE et prépares des fiches pour des apprenants vietnamiens (préparation DELF).",
    "Produis deux ressources pour l'exercice donné, à consulter AVANT ou PENDANT l'entraînement :",
    "1. vocabulaire : 8 à 15 mots ou expressions UTILES du texte/de l'exercice, une ligne chacun, format exact : « • mot (nature, genre si nom) : nghĩa tiếng Việt ». Ajoute un court exemple en français entre parenthèses si utile.",
    "2. explications : en VIETNAMIEN, 120 à 250 mots, structuré en lignes courtes commençant par « • ». Explique le point de grammaire ou la compétence travaillée, les pièges fréquents et une stratégie pour réussir ce type d'exercice. Exemples français entre guillemets « ».",
    "INTERDIT : donner la réponse d'une question précise de l'exercice. Ne cite aucune lettre de réponse.",
    "INTERDIT : le tiret long (—) et le tiret moyen (–). Utilise « : », la virgule ou des parenthèses.",
    "Pas de Markdown (pas de **, pas de #).",
    'Réponds UNIQUEMENT avec ce JSON : { "vocabulaire": "...", "explications": "..." }',
  ].join("\n");
  const nguoiDung = [
    `TITRE : ${ex.title}`, `NIVEAU : ${ex.level}`, `COMPÉTENCES : ${(ex.skills ?? []).join(", ")}`,
    `CONSIGNE : ${boThe(ex.consigne).slice(0, 800)}`,
    `TEXTE : ${boThe(ex.reading_text).slice(0, 5000) || "(aucun)"}`,
    "QUESTIONS :", cauHoi || "(aucune)",
  ].join("\n");

  let r: Response;
  try {
    r = laOpenAI(model)
      ? await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${KHOA}` },
        body: JSON.stringify({ model, max_completion_tokens: 6000, reasoning_effort: Deno.env.get("PE_AI_EFFORT") || "low",
          response_format: { type: "json_object" }, messages: [{ role: "system", content: heThong }, { role: "user", content: nguoiDung }] }),
      })
      : await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "content-type": "application/json", "x-api-key": KHOA, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model, max_tokens: 2500, system: heThong, messages: [{ role: "user", content: nguoiDung }] }),
      });
  } catch (e) { return json(502, { ok: false, ma: "KHONG_GOI_DUOC", chi_tiet: String(e).slice(0, 200) }); }
  if (!r.ok) return json(502, { ok: false, ma: "AI_TRA_LOI_LOI", trang_thai: r.status, chi_tiet: (await r.text().catch(() => "")).slice(0, 300) });
  const goi = await r.json().catch(() => null);
  const chu = laOpenAI(model) ? (goi?.choices?.[0]?.message?.content ?? "") : (goi?.content?.[0]?.text ?? "");
  const tho: any = bocJSON(chu);
  const vocab = boGach(String(tho?.vocabulaire ?? "")).slice(0, 4000);
  const expl = boGach(String(tho?.explications ?? "")).slice(0, 5000);
  if (!vocab || !expl) return json(502, { ok: false, ma: "AI_TRA_VE_SAI_KHUON" });

  const moi = { ...meta };
  if (canVocab) moi.vocabulaire = vocab;
  if (canExpl) moi.explications = expl;
  const { error } = await admin.from("exercises").update({ meta: moi }).eq("id", id);
  if (error) return json(500, { ok: false, ma: "GHI_LOI", chi_tiet: error.message });
  return json(200, { ok: true, vocab: canVocab, expl: canExpl });
});
