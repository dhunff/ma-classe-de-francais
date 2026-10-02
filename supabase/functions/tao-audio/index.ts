/* TẠO BÀI NGHE BẰNG GIỌNG TỔNG HỢP (02/10) — OpenAI text-to-speech.
 *
 * Chủ dự án chọn giọng tổng hợp cho các bài nghe tự viết (docs/nghe/
 * kich-ban-nghe.md). Mọi bài tạo ra ở đây phải được GHI RÕ « giọng tổng hợp »
 * trong đề bài — không giới thiệu như audio bản xứ.
 *
 * Gọi bằng một trong hai:
 *   · JWT giáo viên (app_metadata.role = 'prof'), hoặc
 *   · header `x-admin-token` khớp bí mật TTS_ADMIN_TOKEN (người vận hành chạy
 *     lô từ dòng lệnh, không có phiên đăng nhập).
 *
 * Body: { ten: "a1-salle-sport", doan: [{ giong: "nova", chu: "…" }, …] }
 * Mỗi đoạn một lời gọi TTS, nối các mp3 lại (khung MP3 nối thẳng phát được),
 * tải lên kho `nghe` (114) tại nghe/<ten>.mp3, trả về URL công khai + số byte.
 *
 * Khoá OPENAI_API_KEY đã đặt từ 26/09; model đổi được bằng TTS_MODEL.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";

const GIONG = new Set(["alloy", "ash", "ballad", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer", "verse"]);
const TEN = /^[a-z0-9][a-z0-9-]{2,60}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });

  const KHOA = Deno.env.get("OPENAI_API_KEY");
  if (!KHOA) return json(503, { ok: false, ma: "CHUA_CAU_HINH_KHOA" });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // ── Quyền ──
  const tokenQt = Deno.env.get("TTS_ADMIN_TOKEN");
  const laQt = !!tokenQt && req.headers.get("x-admin-token") === tokenQt;
  if (!laQt) {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u } = token ? await admin.auth.getUser(token) : { data: null };
    if (u?.user?.app_metadata?.role !== "prof") return json(403, { ok: false, ma: "CHI_GIAO_VIEN" });
  }

  let than: any = null;
  try { than = await req.json(); } catch { /* kiểm dưới */ }

  /* ── Hai chế độ CHỈ cho quản trị (02/10), dùng khi cắt đoạn Wikipédia parlée:
     · taiLen: { ten, base64 } — đưa một mp3 đã cắt sẵn lên kho `nghe`.
     · chepLoi: { ten } — chép lời mp3 trong kho, kèm mốc thời gian từng đoạn,
       để chọn điểm cắt và viết câu hỏi theo đúng lời đã đọc. */
  if (than?.taiLen || than?.chepLoi || than?.xoa) {
    if (!laQt) return json(403, { ok: false, ma: "CHI_QUAN_TRI" });
    const tenTep = String(than.ten ?? "");
    if (!TEN.test(tenTep)) return json(400, { ok: false, ma: "TEN_KHONG_HOP_LE" });
    // xoa: dọn tệp thử / bản cắt tạm. Không xoá được bằng SQL (Storage chặn).
    if (than.xoa) {
      const { data, error } = await admin.storage.from("nghe").remove([`${tenTep}.mp3`]);
      return error ? json(500, { ok: false, ma: "XOA_LOI", chi_tiet: error.message }) : json(200, { ok: true, da_xoa: (data ?? []).length });
    }
    if (than.taiLen) {
      const bin = Uint8Array.from(atob(String(than.base64 ?? "")), (c) => c.charCodeAt(0));
      if (bin.length < 1000 || bin.length > 12 * 1024 * 1024) return json(400, { ok: false, ma: "KICH_THUOC" });
      const { error } = await admin.storage.from("nghe").upload(`${tenTep}.mp3`, bin, { contentType: "audio/mpeg", upsert: true });
      if (error) return json(500, { ok: false, ma: "LUU_LOI", chi_tiet: error.message });
      return json(200, { ok: true, url: admin.storage.from("nghe").getPublicUrl(`${tenTep}.mp3`).data.publicUrl, so_byte: bin.length });
    }
    const { data: tep, error } = await admin.storage.from("nghe").download(`${tenTep}.mp3`);
    if (error || !tep) return json(404, { ok: false, ma: "KHONG_THAY_TEP" });
    const fd = new FormData();
    fd.append("file", new File([tep], `${tenTep}.mp3`, { type: "audio/mpeg" }));
    fd.append("model", "whisper-1");
    fd.append("language", "fr");
    fd.append("response_format", "verbose_json");
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${KHOA}` }, body: fd });
    if (!r.ok) return json(502, { ok: false, ma: "CHEP_LOI_LOI", chi_tiet: (await r.text()).slice(0, 300) });
    const kq = await r.json();
    return json(200, { ok: true, doan: (kq.segments ?? []).map((s: any) => [Math.round(s.start * 10) / 10, Math.round(s.end * 10) / 10, s.text]) });
  }

  const ten = String(than?.ten ?? "");
  const doan = Array.isArray(than?.doan) ? than.doan : [];
  if (!TEN.test(ten)) return json(400, { ok: false, ma: "TEN_KHONG_HOP_LE" });
  if (!doan.length || doan.length > 40) return json(400, { ok: false, ma: "SO_DOAN_KHONG_HOP_LE" });
  const tongChu = doan.reduce((n: number, d: any) => n + String(d?.chu ?? "").length, 0);
  if (tongChu > 6000) return json(400, { ok: false, ma: "QUA_DAI" });

  // ── Tổng hợp từng đoạn ──
  const model = Deno.env.get("TTS_MODEL") || "gpt-4o-mini-tts";
  /* Gọi SONG SONG, giữ thứ tự bằng chỉ số: gọi lần lượt thì 6 đoạn đã vượt giới
     hạn chờ 150 giây của Edge Function (02/10, bài « six annonces »). */
  const ketQua = await Promise.all(doan.map(async (d: any) => {
    const giong = GIONG.has(d?.giong) ? d.giong : "alloy";
    const chu = String(d?.chu ?? "").trim();
    if (!chu) return null;
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${KHOA}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model, voice: giong, input: chu, response_format: "mp3",
        instructions: String(d?.cach ?? "Parle en français de France, ton naturel, débit clair."),
      }),
    });
    if (!r.ok) return { loi: (await r.text()).slice(0, 300) };
    return { bin: new Uint8Array(await r.arrayBuffer()) };
  }));
  const hong = ketQua.find((k) => k && "loi" in k);
  if (hong) return json(502, { ok: false, ma: "TTS_LOI", chi_tiet: (hong as any).loi });
  const manh = ketQua.filter((k): k is { bin: Uint8Array } => !!k && "bin" in k).map((k) => k.bin);
  const tong = manh.reduce((n, m) => n + m.length, 0);
  const tep = new Uint8Array(tong);
  let o = 0;
  for (const m of manh) { tep.set(m, o); o += m.length; }

  const duong = `${ten}.mp3`;
  const { error } = await admin.storage.from("nghe").upload(duong, tep, { contentType: "audio/mpeg", upsert: true });
  if (error) return json(500, { ok: false, ma: "LUU_LOI", chi_tiet: error.message });
  const { data: pub } = admin.storage.from("nghe").getPublicUrl(duong);
  return json(200, { ok: true, url: pub.publicUrl, so_byte: tong, so_doan: manh.length, model });
});
