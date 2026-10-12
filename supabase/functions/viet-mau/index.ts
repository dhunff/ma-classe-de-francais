/* ═══════════════════════════════════════════════════════════════════════════
 * BÀI VIẾT MẪU (VIP) — 14/10, theo chủ dự án
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * AI viết lại CHÍNH bài của học sinh: giữ ý và bố cục của họ, sửa lỗi, nâng từ
 * vựng và cấu trúc lên đúng trình độ của đề. Kèm danh sách chỗ đã sửa và vì sao.
 * Không phải một bài mẫu chung chung: học sinh thấy bài của mình « tốt hơn »
 * trông ra sao.
 *
 * · Chỉ VIP (profiles.vip_den còn hạn) và chỉ bài của CHÍNH người gọi.
 * · Bài đọc từ database theo answerId (không nhận chữ từ client).
 * · Mỗi bài một bản: gọi lại trả bản đã có, không tốn thêm.
 * Biến môi trường: OPENAI_API_KEY, PE_AI_MODEL (tuỳ chọn).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });
  const KHOA = Deno.env.get("OPENAI_API_KEY");
  if (!KHOA) return json(503, { ok: false, ma: "CHUA_CAU_HINH_KHOA" });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: u } = await admin.auth.getUser(token);
  const userId = u?.user?.id;
  if (!userId) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  let than: any = null;
  try { than = await req.json(); } catch { /* */ }
  const answerId = String(than?.answerId ?? "");

  const { data: cu } = await admin.from("bai_viet_mau").select("noi_dung").eq("answer_id", answerId).eq("user_id", userId).maybeSingle();
  if (cu) return json(200, { ok: true, ...cu.noi_dung, da_co: true });

  const { data: hs } = await admin.from("profiles").select("vip_den").eq("id", userId).maybeSingle();
  if (!(hs?.vip_den && new Date(hs.vip_den).getTime() > Date.now())) return json(403, { ok: false, ma: "CAN_VIP" });

  const { data: an } = await admin.from("answers").select("id, raw, attempt_id, question_id").eq("id", answerId).maybeSingle();
  if (!an) return json(404, { ok: false, ma: "KHONG_THAY_BAI" });
  const { data: att } = await admin.from("attempts").select("user_id, exercise_id").eq("id", an.attempt_id).maybeSingle();
  if (att?.user_id !== userId) return json(403, { ok: false, ma: "KHONG_PHAI_BAI_CUA_BAN" });
  const { data: q } = await admin.from("questions").select("prompt").eq("id", an.question_id).maybeSingle();
  const { data: ex } = await admin.from("exercises").select("level, consigne").eq("id", att.exercise_id).maybeSingle();

  const bai = String(an.raw ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (bai.split(" ").length < 15) return json(422, { ok: false, ma: "BAI_QUA_NGAN" });
  const deBai = `${ex?.consigne ?? ""}\n${q?.prompt ?? ""}`.replace(/<[^>]+>/g, " ").slice(0, 2500);
  const cap = ex?.level ?? "B1";

  const heThong = [
    `Bạn là giáo viên tiếng Pháp luyện thi DELF ${cap}. Viết lại BÀI CỦA HỌC VIÊN thành một bài mẫu trình độ ${cap}.`,
    "- GIỮ ý, lập trường, ví dụ và bố cục của học viên; không thêm ý mới lớn, không đổi quan điểm.",
    "- Sửa lỗi ngữ pháp, chính tả, chia động từ; nâng từ vựng và từ nối lên đúng trình độ; giữ độ dài gần bài gốc (có thể dài hơn tối đa 20 %).",
    "- Tuân thủ đề bài (thể loại, người nhận, công thức mở/kết thư nếu có).",
    "- Không dùng dấu gạch dài.",
    "Trả lời CHỈ bằng JSON: { \"ban_mau\": \"<bài viết lại, tiếng Pháp, xuống dòng bằng \\n>\", \"giai_thich\": [ { \"goc\": \"<trích bài gốc>\", \"sua\": \"<cách viết trong bản mẫu>\", \"ly_do\": \"<1 câu tiếng Việt>\" } ] } với 4 đến 8 mục giai_thich quan trọng nhất.",
  ].join("\n");
  const model = Deno.env.get("PE_AI_MODEL") || "gpt-6-luna";
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${KHOA}` },
    body: JSON.stringify({ model, max_completion_tokens: 8000, reasoning_effort: Deno.env.get("PE_AI_EFFORT") || "low",
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: heThong }, { role: "user", content: `ĐỀ BÀI:\n${deBai}\n\nBÀI CỦA HỌC VIÊN:\n${bai.slice(0, 6000)}` }] }),
  }).catch(() => null);
  if (!r?.ok) return json(502, { ok: false, ma: "AI_TRA_LOI_LOI" });
  let kq: any = null;
  try { kq = JSON.parse((await r.json())?.choices?.[0]?.message?.content ?? ""); } catch { /* */ }
  const banMau = typeof kq?.ban_mau === "string" ? kq.ban_mau.replace(/—/g, ",").trim().slice(0, 8000) : "";
  if (banMau.length < 40) return json(502, { ok: false, ma: "AI_TRA_VE_SAI_KHUON" });
  const chuoi = (x: unknown) => (typeof x === "string" ? x.replace(/—/g, ",").trim().slice(0, 600) : "");
  const giaiThich = (Array.isArray(kq.giai_thich) ? kq.giai_thich : [])
    .map((g: any) => ({ goc: chuoi(g?.goc), sua: chuoi(g?.sua), ly_do: chuoi(g?.ly_do) }))
    .filter((g: any) => g.sua && g.ly_do).slice(0, 8);
  const noiDung = { ban_mau: banMau, giai_thich: giaiThich };
  await admin.from("bai_viet_mau").insert({ answer_id: answerId, user_id: userId, noi_dung: noiDung, model });
  return json(200, { ok: true, ...noiDung });
});
