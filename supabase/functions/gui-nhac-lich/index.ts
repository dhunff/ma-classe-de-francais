/* Edge Function `gui-nhac-lich` — Léon gửi mail nhắc trước giờ học đã đặt (28/10, migration 172).
 *
 * Chỉ pg_cron gọi (5 phút/lần, header x-cron-bi-mat đối chiếu vault như gui-nhac-hoc). Danh sách do
 * nhan_lich_can_nhac() NHẬN ở database: lịch bật nhắc, chưa nhắc, bắt đầu trong ≤ 31 phút tới. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";

const WEB = "https://www.fracile.vn";
const NGUOI_GUI = "Leon từ FRACILE <leon@fracile.vn>";
const DUONG: Record<string, [string, string]> = {
  "lo-trinh": ["/etudiant/lo-trinh", "Lộ trình học tập"], "luyen-tap": ["/etudiant/entrainement", "Luyện tập"],
  flashcard: ["/etudiant/bo-the", "Flashcard"], "thi-thu": ["/etudiant/examen", "Thi thử DELF"],
  "nghe-noi": ["/etudiant/nghe-noi", "Nghe & Nói"], "thach-dau": ["/etudiant/thach-dau", "Thách đấu"],
  "tro-choi": ["/etudiant/tro-choi", "Trò chơi"], "ngu-phap": ["/etudiant/ngu-phap", "Học ngữ pháp"],
};
type Lich = { id: string; email: string; ten: string; tieu_de: string; muc: string | null; luc: string };
const thoat = (s: string) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const gioVN = (iso: string) => new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", weekday: "long", day: "2-digit", month: "2-digit" }).format(new Date(iso));

function soan(l: Lich) {
  const [duong, tenMuc] = DUONG[l.muc ?? ""] ?? ["/etudiant/calendrier", "Lịch học"];
  const phut = Math.max(1, Math.round((new Date(l.luc).getTime() - Date.now()) / 60000));
  const gio = gioVN(l.luc);
  const html = `<!doctype html><html lang="vi"><body style="margin:0;background:#eef3fb;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c2333">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;padding:32px 28px">
<tr><td align="center"><img src="${WEB}/leon/mail/chao.png?v=2" width="120" height="120" alt="Leon" style="display:block;border:0"></td></tr>
<tr><td style="padding-top:16px;font-size:22px;font-weight:700;text-align:center">Còn ${phut} phút nữa là tới giờ học!</td></tr>
<tr><td style="padding-top:12px;font-size:15px;line-height:1.6;text-align:center;color:#4a5468">Chào ${thoat(l.ten)}, bạn đã hẹn với Leon: <b>${thoat(l.tieu_de)}</b><br>lúc <b>${thoat(gio)}</b>. Chuẩn bị một chỗ yên tĩnh rồi vào học thôi!</td></tr>
<tr><td align="center" style="padding-top:24px"><a href="${WEB}${duong}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:999px">Mở ${thoat(tenMuc)}</a></td></tr>
</table>
<p style="max-width:520px;font-size:12px;line-height:1.5;color:#7a8499;text-align:center;margin:16px auto 0">
Bạn nhận mail này vì đã bật « Leon nhắc qua mail » khi đặt lịch.<br><a href="${WEB}/etudiant/calendrier" style="color:#7a8499">Sửa hoặc tắt nhắc trong Lịch</a></p>
</td></tr></table></body></html>`;
  return { from: NGUOI_GUI, to: [l.email], subject: `⏰ ${phut} phút nữa: ${l.tieu_de}`, html };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const biMat = req.headers.get("x-cron-bi-mat") ?? "";
  const { data: hopLe } = await sb.rpc("kiem_bi_mat_cron", { p: biMat });
  if (!biMat || hopLe !== true) return json(401, { error: "KHONG_DUNG_BI_MAT" });

  const khoa = Deno.env.get("RESEND_API_KEY");
  if (!khoa) return json(503, { error: "CHUA_CAU_HINH_KHOA" });
  const { data, error } = await sb.rpc("nhan_lich_can_nhac");
  if (error) return json(500, { error: error.message });
  const ds: Lich[] = data ?? [];

  let daGui = 0; const loi: string[] = [];
  for (let i = 0; i < ds.length; i += 100) {
    const r = await fetch("https://api.resend.com/emails/batch", {
      method: "POST", headers: { Authorization: `Bearer ${khoa}`, "Content-Type": "application/json" },
      body: JSON.stringify(ds.slice(i, i + 100).map(soan)),
    });
    if (r.ok) daGui += Math.min(100, ds.length - i); else loi.push(`${r.status} ${(await r.text()).slice(0, 300)}`);
  }
  return json(200, { soLich: ds.length, daGui, loi });
});
