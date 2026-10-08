/* ═══════════════════════════════════════════════════════════════════════════
 * AI NHẬN XÉT BÀI NÓI (Production orale) — 27/09
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Học sinh bấm « AI nhận xét » cạnh một bản ghi âm của CHÍNH MÌNH:
 *   1. OpenAI `gpt-transcribe` chép lời bản ghi (tiếng Pháp).
 *   2. Model chữ (mặc định gpt-6-luna, cùng biến PE_AI_MODEL với chấm PE)
 *      nhận xét bằng tiếng Việt dựa trên BẢN CHÉP LỜI.
 *
 * ══ KHÔNG CÓ ĐIỂM SỐ ══
 * DELF chấm nói bằng đối thoại với giám khảo; một con số ở đây là bịa (xem
 * CLAUDE.md, mục Production Orale). Và AI chỉ đọc được CHỮ đã chép, không nghe
 * được ngữ điệu — nên phần phát âm chỉ là gián tiếp (từ nào máy chép lệch có
 * thể do phát âm chưa rõ), và lời nhắc cho AI nói thẳng điều đó.
 *
 * ══ AN TOÀN ══
 * · Chỉ file NẰM TRONG thư mục của người gọi: đường dẫn phải bắt đầu bằng
 *   `<user_id>/` (lấy từ JWT, không từ body). Service_role bỏ qua RLS của kho,
 *   nên phép so tiền tố này là hàng rào duy nhất.
 * · Hạn mức 6 lượt / 24 giờ / người (cửa sổ trượt, như cham-pe).
 * · Bản ghi đã có nhận xét → trả lại nhận xét cũ, KHÔNG gọi AI (không tốn tiền,
 *   không trừ lượt).
 * · Trần 25 MB (giới hạn của OpenAI) — đọc từ metadata trước khi tải.
 *
 * Biến môi trường: OPENAI_API_KEY (đã đặt cho cham-pe), PE_AI_MODEL (tuỳ
 * chọn), PO_STT_MODEL (tuỳ chọn, mặc định gpt-transcribe).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";

const KHO = "bai-noi";
const HAN_MUC = 6;
const CUA_SO_GIO = 24;
const TRAN_BYTE = 25 * 1024 * 1024;
const MODEL_CHU = "gpt-6-luna";
const MODEL_STT = "gpt-transcribe";
const DUOI_NHAN = /\.(webm|mp3|mp4|m4a|wav|mpeg|mpga)$/i; // OpenAI KHÔNG nhận ogg

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });

  const KHOA = Deno.env.get("OPENAI_API_KEY");
  if (!KHOA) return json(503, { ok: false, ma: "CHUA_CAU_HINH_KHOA", thong_bao: "Máy chủ chưa có khoá API." });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: u, error: loiU } = await admin.auth.getUser(token);
  const userId = u?.user?.id;
  if (loiU || !userId) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  let than: any = null;
  try { than = await req.json(); } catch { /* xuống kiểm dưới */ }
  const duongDan = String(than?.duongDan ?? "");
  // Chỉ file của CHÍNH người gọi, không cho `..` lách thư mục.
  if (!duongDan.startsWith(`${userId}/`) || duongDan.includes("..")) {
    return json(403, { ok: false, ma: "KHONG_PHAI_BAN_GHI_CUA_BAN" });
  }
  if (!DUOI_NHAN.test(duongDan)) {
    return json(400, { ok: false, ma: "DINH_DANG_KHONG_HO_TRO",
      thong_bao: "Định dạng này (thường là .ogg từ Firefox) chưa nhận xét được — hãy ghi lại bằng Chrome hoặc Edge." });
  }

  // Đã nhận xét rồi → trả lại, không tốn lượt.
  const { data: cu } = await admin.from("po_ai_nhan_xet")
    .select("ket_qua, chep_loi, model").eq("user_id", userId).eq("duong_dan", duongDan).maybeSingle();
  if (cu) return json(200, { ok: true, nhan_xet: cu.ket_qua, chep_loi: cu.chep_loi, model: cu.model, da_co: true });

  const tuLuc = new Date(Date.now() - CUA_SO_GIO * 3600_000).toISOString();
  /* VIP còn hạn: không giới hạn lượt (124). Đọc thẳng profiles bằng service_role. */
  const { data: hs } = await admin.from("profiles").select("vip_den").eq("id", userId).maybeSingle();
  const laVip = !!hs?.vip_den && new Date(hs.vip_den).getTime() > Date.now();
  const { count: daDung } = await admin.from("po_ai_nhan_xet")
    .select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", tuLuc);
  if (!laVip && (daDung ?? 0) >= HAN_MUC) {
    return json(429, { ok: false, ma: "HET_LUOT", han_muc: HAN_MUC, cua_so_gio: CUA_SO_GIO,
      thong_bao: `Hết lượt AI nhận xét (${HAN_MUC} lượt mỗi ${CUA_SO_GIO} giờ).` });
  }

  // Đề bài: exerciseId nằm trong tên file `<uid>/<exam>/<exerciseId>-<mốc>.<đuôi>`.
  const tenFile = duongDan.split("/").pop() ?? "";
  const exerciseId = tenFile.replace(/-\d{10,}\.[a-z0-9]+$/i, "");
  const { data: ex } = await admin.from("exercises").select("title, level, consigne").eq("id", exerciseId).maybeSingle();
  const deBai = [ex?.title, ex?.consigne].filter(Boolean).join("\n").replace(/<[^>]+>/g, " ").slice(0, 2000);

  const { data: file, error: loiTai } = await admin.storage.from(KHO).download(duongDan);
  if (loiTai || !file) return json(404, { ok: false, ma: "KHONG_THAY_BAN_GHI" });
  if (file.size > TRAN_BYTE) return json(413, { ok: false, ma: "BAN_GHI_QUA_LON" });

  // 1. Chép lời
  const form = new FormData();
  form.append("file", file, tenFile);
  form.append("model", Deno.env.get("PO_STT_MODEL") || MODEL_STT);
  let r1: Response;
  try {
    r1 = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST", headers: { authorization: `Bearer ${KHOA}` }, body: form,
    });
  } catch (e) { return json(502, { ok: false, ma: "KHONG_GOI_DUOC", chi_tiet: String(e).slice(0, 200) }); }
  if (!r1.ok) {
    return json(502, { ok: false, ma: "AI_TRA_LOI_LOI", buoc: "chep_loi", trang_thai: r1.status,
      chi_tiet: (await r1.text().catch(() => "")).slice(0, 300) });
  }
  const chepLoi = String((await r1.json().catch(() => null))?.text ?? "").trim();
  if (chepLoi.length < 5) return json(422, { ok: false, ma: "KHONG_NGHE_RO", thong_bao: "Không nghe được lời nói nào trong bản ghi." });

  // 2. Nhận xét
  const model = Deno.env.get("PE_AI_MODEL") || MODEL_CHU;
  const heThong = [
    "Bạn là giáo viên luyện thi DELF, nhận xét phần Production orale của học viên.",
    `Trình độ đề: ${ex?.level ?? "B1"}.`,
    "Bạn chỉ có BẢN CHÉP LỜI do máy tạo ra, không nghe được giọng. Vì vậy:",
    "- KHÔNG cho điểm số, không ước lượng điểm DELF.",
    "- Nhận xét ngữ pháp, từ vựng, cách nối ý, độ đầy đủ so với đề bài.",
    "- Về phát âm chỉ nói GIÁN TIẾP: nếu một từ bị chép sai/lạ, có thể do phát âm chưa rõ — nói rõ đó là phỏng đoán.",
    "- Viết bằng TIẾNG VIỆT, xưng « bạn ». Trích nguyên văn đoạn tiếng Pháp khi chỉ lỗi.",
    "- Không bịa lỗi. Chỗ nào tốt thì nói là tốt.",
    "",
    "Trả lời CHỈ bằng một object JSON đúng khuôn:",
    '{ "tong_quat": "<2-3 câu>", "diem_manh": ["<...>"], ',
    '  "can_sua": [{ "trich": "<tiếng Pháp trong bài>", "goi_y": "<cách nói đúng hơn, kèm giải thích ngắn>" }], ',
    '  "phat_am": "<lưu ý phát âm gián tiếp, hoặc chuỗi rỗng>", "luyen_tiep": "<1 việc nên luyện tiếp>", ',
    '  "loi_leon": "<1-2 câu động viên ấm áp, giọng Leon (linh vật chó bulldog Pháp của FRACILE), nêu một điểm mạnh THẬT, có thể chen một câu tiếng Pháp đơn giản như Allez, courage !>" }',
  ].join("\n");
  const nguoiDung = ["ĐỀ BÀI:", deBai || "(không rõ)", "", "BẢN CHÉP LỜI BÀI NÓI:", chepLoi.slice(0, 8000)].join("\n");

  let r2: Response;
  try {
    r2 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${KHOA}` },
      body: JSON.stringify({
        model, max_completion_tokens: 8000,
        reasoning_effort: Deno.env.get("PE_AI_EFFORT") || "low",
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: heThong }, { role: "user", content: nguoiDung }],
      }),
    });
  } catch (e) { return json(502, { ok: false, ma: "KHONG_GOI_DUOC", chi_tiet: String(e).slice(0, 200) }); }
  if (!r2.ok) {
    return json(502, { ok: false, ma: "AI_TRA_LOI_LOI", buoc: "nhan_xet", trang_thai: r2.status,
      chi_tiet: (await r2.text().catch(() => "")).slice(0, 300) });
  }
  let kq: any = null;
  try { kq = JSON.parse((await r2.json())?.choices?.[0]?.message?.content ?? ""); } catch { /* xuống dưới */ }

  // Kiểm khuôn: thiếu phần chính thì không lưu — đừng hiện một khung rỗng như thể AI đã nhận xét.
  const chuoi = (x: unknown) => (typeof x === "string" ? x.trim().slice(0, 1500) : "");
  if (!kq || !chuoi(kq.tong_quat)) return json(502, { ok: false, ma: "AI_TRA_VE_SAI_KHUON" });
  const nhanXet = {
    tong_quat: chuoi(kq.tong_quat),
    diem_manh: (Array.isArray(kq.diem_manh) ? kq.diem_manh : []).map(chuoi).filter(Boolean).slice(0, 6),
    can_sua: (Array.isArray(kq.can_sua) ? kq.can_sua : [])
      .map((x: any) => ({ trich: chuoi(x?.trich), goi_y: chuoi(x?.goi_y) }))
      .filter((x: any) => x.goi_y).slice(0, 8),
    phat_am: chuoi(kq.phat_am),
    luyen_tiep: chuoi(kq.luyen_tiep),
    loi_leon: chuoi(kq.loi_leon).slice(0, 400),
  };

  const { error: loiGhi } = await admin.from("po_ai_nhan_xet").insert({
    user_id: userId, duong_dan: duongDan, model, chep_loi: chepLoi.slice(0, 8000), ket_qua: nhanXet,
  });

  return json(200, { ok: true, nhan_xet: nhanXet, chep_loi: chepLoi, model, da_luu: !loiGhi,
    con_lai: Math.max(0, HAN_MUC - (daDung ?? 0) - 1) });
});
