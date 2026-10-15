/* ═══════════════════════════════════════════════════════════════════════════
 * AI GỢI Ý ĐIỂM PHẦN NÓI (Production orale) — 12/10
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Học sinh vừa thi PO trong thi thử, mở màn tự chấm và bấm « AI gợi ý »:
 *   1. Tìm bản ghi MỚI NHẤT của chính người đó cho bài PO của lượt thi này
 *      (kho riêng tư bai-noi, thư mục `<uid>/<exam_id>/`).
 *   2. Chép lời (gpt-transcribe), rồi model chữ đề xuất một mức cho TỪNG tiêu
 *      chí của grille PO chính thức (supabase/functions/_shared/grillePO.js).
 *   3. Lưu vào po_cham.ai_goi_y. KHÔNG ghi vào điểm: học sinh phải tự bấm.
 *
 * ══ AI CHỈ ĐỀ XUẤT ══ (như cham-pe) Giá trị không có trên tờ grille thì BỎ,
 * không kẹp về biên. AI chỉ đọc chữ đã chép: phần phát âm là gián tiếp, và
 * phần tương tác với giám khảo không có trong bản ghi tự học — lời nhắc nói
 * thẳng điều đó để AI không bịa.
 *
 * Hạn mức 6 lượt / 24 giờ (VIP không giới hạn). Đã có gợi ý → trả lại, không tốn lượt.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";
import { tranVip } from "../_shared/tranVip.ts";
import { GRILLE_PO, mucCuaTieuChi } from "../_shared/grillePO.js";

const KHO = "bai-noi";
const HAN_MUC = 6;
const TRAN_BYTE = 25 * 1024 * 1024;
const DUOI_NHAN = /\.(webm|mp3|mp4|m4a|wav|mpeg|mpga)$/i;

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
  const attemptId = String(than?.attemptId ?? "");
  /* 14/10: chinhThuc = AI CHẤM luôn (như phần viết): đủ mọi tiêu chí hợp lệ thì
     ghi điểm vào po_cham (nguon 'ai'), CHỈ khi học sinh chưa tự chấm. */
  const chinhThuc = than?.chinhThuc === true;

  const { data: pc } = await admin.from("po_cham").select("cap, ai_goi_y, de_boc, diem").eq("attempt_id", attemptId).eq("user_id", userId).maybeSingle();
  if (!pc) return json(404, { ok: false, ma: "KHONG_THAY_BAI_NOI" });
  const ghiDiem = async (goiY: any) => {
    if (!chinhThuc || pc.diem != null) return null;
    const g = (GRILLE_PO as any)[pc.cap];
    if (!g || !g.criteres.every((c: any) => typeof goiY?.diem?.[c.id] === "number")) return null;
    const tong = g.criteres.reduce((n: number, c: any) => n + goiY.diem[c.id], 0);
    await admin.from("po_cham").update({ tu_cham: goiY.diem, diem: tong, nguon: "ai", cap_nhat: new Date().toISOString() })
      .eq("attempt_id", attemptId).is("diem", null);
    return tong;
  };
  if (pc.ai_goi_y) return json(200, { ok: true, goi_y: pc.ai_goi_y, da_co: true, diem: await ghiDiem(pc.ai_goi_y) });
  const grille = (GRILLE_PO as any)[pc.cap];
  if (!grille) return json(400, { ok: false, ma: "KHONG_CO_THANG" });

  const { data: hs } = await admin.from("profiles").select("vip_den").eq("id", userId).maybeSingle();
  const laVip = !!hs?.vip_den && new Date(hs.vip_den).getTime() > Date.now();
  const { count: daDung } = await admin.from("po_cham").select("attempt_id", { count: "exact", head: true })
    .eq("user_id", userId).gte("ai_luc", new Date(Date.now() - 24 * 3600_000).toISOString());
  if (!laVip && (daDung ?? 0) >= HAN_MUC) return json(429, { ok: false, ma: "HET_LUOT", han_muc: HAN_MUC });
  if (laVip) { const tran = await tranVip(admin, userId, "cham-po"); if (tran) return tran; }

  const { data: att } = await admin.from("attempts").select("exam_id, exercise_id").eq("id", attemptId).maybeSingle();
  if (!att?.exam_id) return json(404, { ok: false, ma: "KHONG_THAY_BAI_NOI" });
  const thuMuc = `${userId}/${att.exam_id}`;
  const { data: ds } = await admin.storage.from(KHO).list(thuMuc, { limit: 100 });
  const tep = (ds ?? []).filter((f: any) => f.name.startsWith(`${att.exercise_id}-`)).sort((a: any, b: any) => (a.name < b.name ? 1 : -1))[0];
  if (!tep) return json(404, { ok: false, ma: "CHUA_CO_BAN_GHI", thong_bao: "Chưa có bản ghi âm nào cho phần nói này." });
  if (!DUOI_NHAN.test(tep.name)) return json(400, { ok: false, ma: "DINH_DANG_KHONG_HO_TRO" });

  const { data: file } = await admin.storage.from(KHO).download(`${thuMuc}/${tep.name}`);
  if (!file) return json(404, { ok: false, ma: "KHONG_THAY_BAN_GHI" });
  if (file.size > TRAN_BYTE) return json(413, { ok: false, ma: "BAN_GHI_QUA_LON" });

  const form = new FormData();
  form.append("file", file, tep.name);
  form.append("model", Deno.env.get("PO_STT_MODEL") || "gpt-transcribe");
  const r1 = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { authorization: `Bearer ${KHOA}` }, body: form }).catch(() => null);
  if (!r1?.ok) return json(502, { ok: false, ma: "AI_TRA_LOI_LOI", buoc: "chep_loi" });
  const chepLoi = String((await r1.json().catch(() => null))?.text ?? "").trim();
  if (chepLoi.length < 5) return json(422, { ok: false, ma: "KHONG_NGHE_RO" });

  const { data: ex } = await admin.from("exercises").select("consigne").eq("id", att.exercise_id).maybeSingle();
  /* Đề học sinh đã BỐC và CHỌN (137) quan trọng hơn consigne chung. */
  const deBoc = Array.isArray(pc.de_boc) ? pc.de_boc.map((d: any) => `${d.phan} : ${d.html}`).join("\n") : "";
  const deBai = `${ex?.consigne ?? ""}\n${deBoc}`.replace(/<[^>]+>/g, " ").slice(0, 3500);
  const moTa = grille.criteres.map((c: any) => `- ${c.id} (${c.nhom}) « ${c.label} » : giá trị được phép ${JSON.stringify(mucCuaTieuChi(pc.cap, c).map((m: any) => m.v))}`).join("\n");
  const heThong = [
    `Bạn là giám khảo DELF ${pc.cap}, chấm Production orale theo grille chính thức của France Éducation international.`,
    "Bạn chỉ có BẢN CHÉP LỜI do máy tạo từ bản ghi tự luyện ở nhà: không nghe được giọng, không có giám khảo đối thoại.",
    "- Phần phát âm chỉ suy đoán gián tiếp; phần tương tác chỉ đánh giá theo những gì học viên tự nói.",
    "- Phần nào học viên KHÔNG làm trong bản ghi thì cho mức thấp nhất và nói rõ lý do.",
    "- Mỗi tiêu chí chỉ được chọn MỘT giá trị trong danh sách cho phép.",
    "Các tiêu chí:", moTa, "",
    "Trả lời CHỈ bằng JSON: { \"diem\": { \"<id>\": <số> }, \"ly_do\": { \"<id>\": \"<1 câu tiếng Việt>\" }, \"tong_quat\": \"<2-3 câu tiếng Việt, xưng bạn>\" }",
  ].join("\n");
  const model = Deno.env.get("PE_AI_MODEL") || "gpt-6-luna";
  const r2 = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${KHOA}` },
    body: JSON.stringify({ model, max_completion_tokens: 6000, reasoning_effort: Deno.env.get("PE_AI_EFFORT") || "low",
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: heThong }, { role: "user", content: `ĐỀ BÀI:\n${deBai}\n\nBẢN CHÉP LỜI:\n${chepLoi.slice(0, 8000)}` }] }),
  }).catch(() => null);
  if (!r2?.ok) return json(502, { ok: false, ma: "AI_TRA_LOI_LOI", buoc: "cham" });
  let kq: any = null;
  try { kq = JSON.parse((await r2.json())?.choices?.[0]?.message?.content ?? ""); } catch { /* */ }
  if (!kq?.diem) return json(502, { ok: false, ma: "AI_TRA_VE_SAI_KHUON" });

  // Giá trị không có trên grille → BỎ (không kẹp). Thiếu thì để trống.
  const diem: Record<string, number> = {}, lyDo: Record<string, string> = {};
  for (const c of grille.criteres) {
    const v = Number(kq.diem?.[c.id]);
    if (mucCuaTieuChi(pc.cap, c).some((m: any) => m.v === v)) diem[c.id] = v;
    if (typeof kq.ly_do?.[c.id] === "string") lyDo[c.id] = kq.ly_do[c.id].slice(0, 400);
  }
  const goiY = { diem, ly_do: lyDo, tong_quat: String(kq.tong_quat ?? "").slice(0, 1200), chep_loi: chepLoi.slice(0, 8000), tep: tep.name, model };
  await admin.from("po_cham").update({ ai_goi_y: goiY, ai_luc: new Date().toISOString() }).eq("attempt_id", attemptId);
  return json(200, { ok: true, goi_y: goiY, diem: await ghiDiem(goiY) });
});
