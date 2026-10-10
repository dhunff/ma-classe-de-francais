/* Hỏi Leon (09/10): trợ lý chat của linh vật Leon cho học sinh.
 *
 * Cùng khuôn với cham-pe: khoá API chỉ ở máy chủ, nhà cung cấp suy ra từ tên
 * model (gpt-… → OpenAI, còn lại → Anthropic), model mặc định nằm trong git.
 *
 * Hạn mức: 10 câu hỏi mỗi ngày (giờ Việt Nam) cho tài khoản thường, VIP còn
 * hạn không giới hạn. Đếm từ bảng leon_hoi (migration 125), bảng chỉ máy chủ
 * ghi được.
 *
 * Lịch sử hội thoại đọc từ DATABASE (6 lượt gần nhất của chính người gọi),
 * không nhận từ client: client chỉ gửi câu hỏi mới, nên không ai nhồi một
 * « lời Leon » giả vào ngữ cảnh.
 *
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (Supabase tự đặt)
 *   OPENAI_API_KEY / ANTHROPIC_API_KEY         (đã đặt cho cham-pe)
 *   LEON_AI_MODEL                              (tuỳ chọn)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";
// @ts-ignore — JS thuần
import { bocJSON } from "../_shared/goiYPE.js";

const MODEL_MAC_DINH = "gpt-6-luna";
const laOpenAI = (m: string) => /^(gpt-|o\d)/.test(m);
const HAN_MUC = 10;
const TRAN_CAU_HOI = 1000;
const CAM = ["chao", "nhay-mat", "tuyet-voi", "duoc-do", "yeu-qua", "hum", "suy-nghi", "gian", "buon", "ngac-nhien",
  "haha", "buon-ngu", "lam-viec", "hoc", "co-len", "tam-biet", "xin-loi", "yeah", "ok", "phap", "hoi", "quyet-tam", "cuoi-lon", "mim-cuoi"];
const dauNgayVN = () => {
  const vn = new Date(Date.now() + 7 * 3600_000);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()) - 7 * 3600_000).toISOString();
};

const NGON_NGU: Record<string, string> = {
  vi: "Réponds en VIETNAMIEN (exemples français en italique avec traduction vietnamienne).",
  fr: "Réponds en FRANÇAIS simple, adapté au niveau de l'élève.",
  en: "Reply in ENGLISH (French examples in italics with English translation).",
};

const heThong = (lang: string, capDo: string) => [
  "Tu es Leon, le compagnon d'apprentissage et la mascotte de FRACILE, plateforme d'apprentissage du français (A1 à C1, préparation DELF/DALF).",
  "Tu es un bouledogue français mignon, malin et plein d'énergie, en marinière bleu et blanc avec un bandana rouge.",
  "",
  "TON : amical, encourageant, un peu joueur mais professionnel. Glisse des expressions françaises simples (Bonjour !, C'est super !, Allez, courage !, Ohlala…).",
  "Réponses COURTES et faciles à parcourir : listes à puces, termes clés de grammaire/vocabulaire en **gras**, mots français en *italique*. Pas de longs essais.",
  "Grammaire/vocabulaire : découpe la règle en petites étapes, donne 1 ou 2 exemples traduits.",
  "Correction d'une phrase de l'élève : méthode sandwich (féliciter, corriger en expliquant POURQUOI, encourager).",
  "Emojis permis avec modération (🐾 🦴 🐶 🇫🇷 🥐 ☕). Termine par une courte formule d'encouragement (À bientôt !, Leon croit en toi !).",
  "",
  "LIMITES :",
  "- Tu restes dans ton rôle de Leon. Si on te demande sincèrement si tu es une IA, réponds honnêtement que Leon est l'assistant IA de FRACILE.",
  "- Hors sujet (pas lié au français ou aux études) : réponds gentiment en une phrase et ramène vers le français.",
  "- Si l'élève colle un exercice ou un sujet d'examen à rendre, ne donne pas directement toutes les réponses : guide avec la règle et un exemple, puis laisse-le essayer.",
  "- N'invente pas de règles ; si tu n'es pas sûr, dis-le.",
  capDo ? `Niveau déclaré de l'élève : ${capDo}.` : "",
  NGON_NGU[lang] ?? NGON_NGU.vi,
  "",
  `Réponds UNIQUEMENT avec ce JSON : { "tra_loi": "<réponse en Markdown léger>", "cam": "<une émotion parmi : ${CAM.join(", ")}>" }`,
].filter((x) => x !== null).join("\n");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });

  const model = Deno.env.get("LEON_AI_MODEL") || Deno.env.get("PE_AI_MODEL") || MODEL_MAC_DINH;
  const KHOA = Deno.env.get(laOpenAI(model) ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY");
  if (!KHOA) return json(503, { ok: false, ma: "CHUA_CAU_HINH_KHOA" });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: u, error: loiU } = await admin.auth.getUser(token);
  const userId = u?.user?.id;
  if (loiU || !userId) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  let than: any = null;
  try { than = await req.json(); } catch { /* kiểm ở dưới */ }
  const cauHoi = String(than?.cauHoi ?? "").trim();
  const lang = ["vi", "fr", "en"].includes(than?.lang) ? than.lang : "vi";
  if (!cauHoi) return json(400, { ok: false, ma: "THIEU_CAU_HOI" });
  if (cauHoi.length > TRAN_CAU_HOI) return json(400, { ok: false, ma: "QUA_DAI", tran: TRAN_CAU_HOI });

  const { data: hs } = await admin.from("profiles").select("vip_den, level").eq("id", userId).maybeSingle();
  const laVip = !!hs?.vip_den && new Date(hs.vip_den).getTime() > Date.now();
  const { count: daDung } = await admin.from("leon_hoi").select("id", { count: "exact", head: true })
    .eq("user_id", userId).gte("created_at", dauNgayVN());
  if (!laVip && (daDung ?? 0) >= HAN_MUC) {
    return json(429, { ok: false, ma: "HET_LUOT", han_muc: HAN_MUC });
  }

  const { data: cu } = await admin.from("leon_hoi").select("cau_hoi, tra_loi")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(6);
  const lichSu = (cu ?? []).reverse().flatMap((r: any) => [
    { role: "user", content: String(r.cau_hoi).slice(0, TRAN_CAU_HOI) },
    { role: "assistant", content: JSON.stringify({ tra_loi: String(r.tra_loi).slice(0, 2000) }) },
  ]);
  const sys = heThong(lang, String(hs?.level ?? ""));
  const msgs = [...lichSu, { role: "user", content: cauHoi }];

  let phanHoi: Response;
  try {
    phanHoi = laOpenAI(model)
      ? await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${KHOA}` },
        body: JSON.stringify({
          model, max_completion_tokens: 4000, reasoning_effort: Deno.env.get("PE_AI_EFFORT") || "low",
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: sys }, ...msgs],
        }),
      })
      : await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": KHOA, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model, max_tokens: 1200, system: sys, messages: msgs }),
      });
  } catch (e) {
    return json(502, { ok: false, ma: "KHONG_GOI_DUOC", chi_tiet: String(e).slice(0, 200) });
  }
  if (!phanHoi.ok) {
    const chiTiet = (await phanHoi.text().catch(() => "")).slice(0, 300);
    return json(502, { ok: false, ma: "AI_TRA_LOI_LOI", trang_thai: phanHoi.status, chi_tiet: chiTiet });
  }
  const goi = await phanHoi.json().catch(() => null);
  const chu = laOpenAI(model) ? (goi?.choices?.[0]?.message?.content ?? "") : (goi?.content?.[0]?.text ?? "");
  const tho: any = bocJSON(chu);
  const traLoi = String(tho?.tra_loi ?? "").trim().slice(0, 4000);
  if (!traLoi) return json(502, { ok: false, ma: "AI_TRA_VE_SAI_KHUON" });
  const cam = CAM.includes(tho?.cam) ? tho.cam : "chao";

  const { error: loiGhi } = await admin.from("leon_hoi").insert({
    user_id: userId, cau_hoi: cauHoi, tra_loi: traLoi, cam, model,
    token_vao: goi?.usage?.input_tokens ?? goi?.usage?.prompt_tokens ?? null,
    token_ra: goi?.usage?.output_tokens ?? goi?.usage?.completion_tokens ?? null,
  });

  return json(200, {
    ok: true, tra_loi: traLoi, cam, da_luu: !loiGhi, vip: laVip,
    con_lai: laVip ? null : Math.max(0, HAN_MUC - (daDung ?? 0) - 1), han_muc: HAN_MUC,
  });
});
