/* Luyện phát âm (10/10): học sinh đọc một câu, AI chép lại, so với câu gốc.
 *
 * KHÔNG chấm « điểm phát âm » theo kiểu 82%: không có mô hình đo âm vị nào
 * trong dự án, và một con số như vậy là bịa (quy tắc 1). Thứ đo được thật là
 * MÁY NGHE RA ĐÚNG BAO NHIÊU TỪ: đọc rõ thì máy chép đúng, đọc sai âm thì máy
 * chép thành từ khác. Giao diện gọi đúng tên đó.
 *
 * Bản ghi âm KHÔNG lưu: nhận, chép lời, bỏ. Chỉ lưu chữ máy nghe ra + điểm.
 * Câu gốc đọc từ DATABASE theo cauId, không nhận từ client.
 * Hạn mức: 20 lượt/ngày (giờ VN), VIP không giới hạn.
 *
 * Body: multipart/form-data { cauId, file (audio webm/mp4/wav, ≤ 4 MB) }
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";
// @ts-ignore — JS thuần
import { soCau } from "../_shared/soCau.js";

const HAN_MUC = 20;
const TRAN_BYTE = 4 * 1024 * 1024;
const dauNgayVN = () => {
  const vn = new Date(Date.now() + 7 * 3600_000);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()) - 7 * 3600_000).toISOString();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });
  const KHOA = Deno.env.get("OPENAI_API_KEY");
  if (!KHOA) return json(503, { ok: false, ma: "CHUA_CAU_HINH_KHOA" });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  /* Chế độ THỬ cho người vận hành (x-admin-token): không tính lượt, không ghi kết quả. */
  const tokenQt = Deno.env.get("TTS_ADMIN_TOKEN");
  const laThu = !!tokenQt && req.headers.get("x-admin-token") === tokenQt;
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: u } = !laThu && token ? await admin.auth.getUser(token) : { data: null } as any;
  const userId = u?.user?.id;
  if (!laThu && !userId) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  let fd: FormData;
  try { fd = await req.formData(); } catch { return json(400, { ok: false, ma: "THIEU_THAM_SO" }); }
  const cauId = String(fd.get("cauId") ?? "");
  const file = fd.get("file");
  if (!cauId || !(file instanceof File)) return json(400, { ok: false, ma: "THIEU_THAM_SO" });
  if (file.size < 1500) return json(400, { ok: false, ma: "QUA_NGAN" });
  if (file.size > TRAN_BYTE) return json(400, { ok: false, ma: "QUA_DAI" });

  const { data: cau } = await admin.from("cau_luyen").select("id, cau, loai, cong_khai").eq("id", cauId).maybeSingle();
  if (!cau || cau.loai !== "phat_am" || !cau.cong_khai) return json(404, { ok: false, ma: "KHONG_THAY_CAU" });

  const { data: hs } = await admin.from("profiles").select("vip_den").eq("id", userId).maybeSingle();
  const laVip = !!hs?.vip_den && new Date(hs.vip_den).getTime() > Date.now();
  const { data: dsPa } = await admin.from("cau_luyen").select("id").eq("loai", "phat_am");
  const { count: daDung } = await admin.from("cau_luyen_ket_qua").select("id", { count: "exact", head: true })
    .eq("user_id", userId).gte("created_at", dauNgayVN()).in("cau_id", (dsPa ?? []).map((x: any) => x.id));
  if (!laThu && !laVip && (daDung ?? 0) >= HAN_MUC) return json(429, { ok: false, ma: "HET_LUOT", han_muc: HAN_MUC });

  /* Chép lời. KHÔNG gửi câu gốc làm « prompt » cho mô hình: gợi ý câu gốc thì
     máy sẽ « nghe » ra đúng câu đó dù học sinh đọc sai, và phép đo mất nghĩa. */
  const gui = new FormData();
  gui.append("file", file, file.name || "bai-doc.webm");
  gui.append("model", Deno.env.get("PA_STT_MODEL") || "whisper-1");
  gui.append("language", "fr");
  gui.append("response_format", "json");
  let chu = "";
  try {
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { authorization: `Bearer ${KHOA}` }, body: gui });
    if (!r.ok) return json(502, { ok: false, ma: "AI_TRA_LOI_LOI", trang_thai: r.status, chi_tiet: (await r.text().catch(() => "")).slice(0, 200) });
    chu = String((await r.json())?.text ?? "").trim();
  } catch (e) {
    return json(502, { ok: false, ma: "KHONG_GOI_DUOC", chi_tiet: String(e).slice(0, 200) });
  }

  const kq = soCau(cau.cau, chu, { dau: false, amGan: true });
  if (!laThu) await admin.from("cau_luyen_ket_qua").insert({ user_id: userId, cau_id: cau.id, diem: kq.diem, chu: chu.slice(0, 600), kieu: "phat_am" });
  return json(200, { ok: true, chu, ...kq, con_lai: laVip ? null : Math.max(0, HAN_MUC - (daDung ?? 0) - 1), vip: laVip });
});
