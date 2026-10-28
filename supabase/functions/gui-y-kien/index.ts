/* Edge Function `gui-y-kien` — form « Liên hệ » cuối các trang FAQ / Điều khoản / Bảo mật (28/10).
 *
 * Hai bước, theo đúng thứ tự:
 *   1. GHI qua RPC `gui_lien_he` (migration 077) bằng khoá anon, chuyển tiếp IP người gửi trong
 *      x-forwarded-for. Mọi phép kiểm và chặn lũ (3 lượt/ngày/email, 10 lượt/giờ/IP) nằm ở đó;
 *      RPC từ chối thì DỪNG, không gửi mail. Nhờ vậy hàm này không thành cửa spam hộp thư.
 *   2. CHUYỂN TIẾP qua Resend tới hộp thư chủ dự án (biến LIEN_HE_NHAN, mặc định leon@fracile.vn),
 *      reply_to = email người gửi để bấm « Trả lời » là trả lời thẳng họ.
 *
 * Mail hỏng sau khi đã ghi thì vẫn báo ĐÃ NHẬN (dòng đã nằm trong `leads`), kèm cờ `mail: false`
 * để giao diện không nói dối là đã tới hộp thư. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";

const NGUOI_GUI = "Form liên hệ FRACILE <leon@fracile.vn>";
const CHU_DE = ["gop_y", "bao_loi", "thanh_toan", "ban_quyen", "khac"];
const TEN_CHU_DE: Record<string, string> = { gop_y: "Góp ý", bao_loi: "Báo lỗi", thanh_toan: "Thanh toán / VIP", ban_quyen: "Bản quyền", khac: "Khác" };
const thoat = (s: string) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "POST" });

  const b = await req.json().catch(() => null);
  const hoTen = String(b?.hoTen ?? "").trim().slice(0, 120);
  const email = String(b?.email ?? "").trim().slice(0, 200);
  const chuDe = CHU_DE.includes(b?.chuDe) ? b.chuDe : "khac";
  const noiDung = String(b?.noiDung ?? "").trim().slice(0, 1900);
  const trang = String(b?.trang ?? "").slice(0, 40);
  if (!hoTen || !email || !noiDung) return json(400, { error: "THIEU" });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    auth: { persistSession: false },
    global: { headers: ip ? { "x-forwarded-for": ip } : {} },
  });
  const { error } = await sb.rpc("gui_lien_he", {
    p_ho_ten: hoTen, p_email: email, p_dien_thoai: null, p_vai: "khac", p_muc_tieu: null,
    p_noi_dung: `[${TEN_CHU_DE[chuDe]}] ${noiDung}`, p_nguon: `lien-he:${trang}`,
  });
  if (error) {
    if (/GUI_QUA_NHIEU/.test(error.message)) return json(429, { error: "GUI_QUA_NHIEU" });
    if (error.code === "22023") return json(400, { error: "SAI_DU_LIEU" });
    return json(500, { error: "GHI_HONG", chiTiet: error.message });
  }

  const khoa = Deno.env.get("RESEND_API_KEY");
  if (!khoa) return json(200, { ok: true, mail: false });
  const nhan = Deno.env.get("LIEN_HE_NHAN") || "leon@fracile.vn";
  const html = `<div style="font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1c2333">
<p style="margin:0 0 12px"><b>${thoat(TEN_CHU_DE[chuDe])}</b> · từ trang ${thoat(trang || "?")}</p>
<p style="margin:0">Họ tên: <b>${thoat(hoTen)}</b><br>Email: <a href="mailto:${thoat(email)}">${thoat(email)}</a></p>
<div style="margin-top:16px;padding:14px 16px;background:#f3f5fa;border-radius:12px;white-space:pre-wrap">${thoat(noiDung)}</div>
<p style="margin:16px 0 0;font-size:12px;color:#7a8499">Bấm « Trả lời » để trả lời thẳng người gửi.</p></div>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${khoa}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: NGUOI_GUI, to: [nhan], reply_to: email, subject: `[FRACILE · ${TEN_CHU_DE[chuDe]}] ${hoTen}`, html }),
  });
  return json(200, { ok: true, mail: r.ok });
});
