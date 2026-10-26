/* Edge Function `gui-nhac-hoc` — mail nhắc học qua Resend (25/10, migration 167).
 *
 * Chỉ pg_cron gọi (header x-cron-bi-mat, đối chiếu với vault qua kiem_bi_mat_cron),
 * deploy --no-verify-jwt. Danh sách người nhận do ds_mail_nhac() tính ở database:
 * đã bật loại mail đó, hôm nay (giờ VN) chưa nhận, và với « giu_chuoi » thì đang có
 * chuỗi mà hôm nay chưa học. Gửi xong ghi mail_da_gui để lần gọi lại không gửi trùng.
 *
 * body: { loai: "giu_chuoi" | "tom_tat_tuan", xemThu?: true }
 *   xemThu: KHÔNG gửi, chỉ trả số người nhận + HTML mẫu của người đầu tiên. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";

const WEB = "https://www.fracile.vn";
const NGUOI_GUI = "Leon từ FRACILE <leon@fracile.vn>";
const TRA_LOI = "contact.fracile@gmail.com";

type Nguoi = { uid: string; email: string; ten: string; token: string; chuoi: number; ngay_tuan: number; xp_tuan: number };

const thoat = (s: string) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function khung(anh: string, tieuDe: string, than: string, nut: string, link: string, huy: string) {
  return `<!doctype html><html lang="vi"><body style="margin:0;background:#eef3fb;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c2333">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;padding:32px 28px">
<tr><td align="center"><img src="${WEB}/leon/mail/${anh}.png?v=2" width="120" height="120" alt="Leon" style="display:block;border:0"></td></tr>
<tr><td style="padding-top:16px;font-size:22px;font-weight:700;text-align:center">${tieuDe}</td></tr>
<tr><td style="padding-top:12px;font-size:15px;line-height:1.6;text-align:center;color:#4a5468">${than}</td></tr>
<tr><td align="center" style="padding-top:24px"><a href="${link}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:999px">${nut}</a></td></tr>
</table>
<p style="max-width:520px;font-size:12px;line-height:1.5;color:#7a8499;text-align:center;margin:16px auto 0">
Bạn nhận mail này vì có tài khoản học trên FRACILE.<br>
<a href="${huy}" style="color:#7a8499">Không nhận loại mail này nữa</a> · <a href="${WEB}/etudiant/compte" style="color:#7a8499">Cài đặt thông báo</a></p>
</td></tr></table></body></html>`;
}

function soanMail(loai: string, n: Nguoi) {
  const ten = thoat(n.ten);
  const huy = `${WEB}/huy-nhan-mail?t=${n.token}&loai=${loai}`;
  if (loai === "giu_chuoi") {
    return {
      subject: `🔥 Chuỗi ${n.chuoi} ngày của bạn sắp mất`,
      html: khung("buon", `Chuỗi ${n.chuoi} ngày đang chờ bạn!`,
        `Chào ${ten}, hôm nay bạn chưa học buổi nào. Chỉ cần làm một bài ngắn trước nửa đêm là giữ được chuỗi <b>${n.chuoi} ngày</b>. Leon tin bạn làm được!`,
        "Học 5 phút ngay", `${WEB}/etudiant/dashboard`, huy),
      huy,
    };
  }
  const coHoc = n.ngay_tuan > 0;
  return {
    subject: coHoc ? `📅 Tuần qua bạn học ${n.ngay_tuan}/7 ngày` : "📅 Tuần mới, bắt đầu lại cùng Leon nhé",
    html: khung(coHoc ? "tuyet-voi" : "chao", coHoc ? "Tóm tắt tuần của bạn" : "Leon nhớ bạn!",
      coHoc
        ? `Chào ${ten}, tuần qua bạn học <b>${n.ngay_tuan}/7 ngày</b> và nhận <b>${n.xp_tuan} XP</b>. Chuỗi hiện tại: <b>${n.chuoi} ngày</b>. Tuần này mình làm tốt hơn nữa nhé!`
        : `Chào ${ten}, tuần qua bạn chưa học buổi nào. Một tuần mới vừa bắt đầu: chỉ 10 phút mỗi ngày là đủ để tiến bộ.`,
      "Vào học tuần này", `${WEB}/etudiant/dashboard`, huy),
    huy,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  const biMat = req.headers.get("x-cron-bi-mat") ?? "";
  const { data: hopLe } = await sb.rpc("kiem_bi_mat_cron", { p: biMat });
  if (!biMat || hopLe !== true) return json(401, { error: "KHONG_DUNG_BI_MAT" });

  let body: any = {};
  try { body = await req.json(); } catch { /* rỗng */ }
  const loai = body?.loai;
  if (loai !== "giu_chuoi" && loai !== "tom_tat_tuan") return json(400, { error: "SAI_LOAI" });

  const { data, error } = await sb.rpc("ds_mail_nhac", { p_loai: loai });
  if (error) return json(500, { error: error.message });
  const ngay: string = data.ngay;
  const ds: Nguoi[] = data.ds ?? [];

  /* guiThu: gửi MỘT mail mẫu tới địa chỉ chỉ định (dữ liệu minh hoạ, không ghi nhật ký). */
  if (typeof body?.guiThu === "string" && /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(body.guiThu)) {
    const khoaThu = Deno.env.get("RESEND_API_KEY");
    if (!khoaThu) return json(503, { error: "CHUA_CAU_HINH_KHOA" });
    const m = soanMail(loai, { uid: "", email: body.guiThu, ten: "bạn", token: "00000000-0000-0000-0000-000000000000", chuoi: 7, ngay_tuan: 4, xp_tuan: 120 });
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${khoaThu}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: NGUOI_GUI, to: [body.guiThu], reply_to: TRA_LOI, subject: `[Thử] ${m.subject}`, html: m.html }),
    });
    return json(r.ok ? 200 : 502, { guiThu: body.guiThu, ketQua: await r.json().catch(() => null) });
  }

  if (body?.xemThu) {
    const m = ds[0] ? soanMail(loai, ds[0]) : null;
    return json(200, { ngay, soNguoi: ds.length, mau: m && { subject: m.subject, html: m.html } });
  }

  const khoa = Deno.env.get("RESEND_API_KEY");
  if (!khoa) return json(503, { error: "CHUA_CAU_HINH_KHOA" });

  let daGui = 0; const loi: string[] = [];
  for (let i = 0; i < ds.length; i += 100) {          // Resend batch: tối đa 100 mail / lần
    const lo = ds.slice(i, i + 100);
    const thu = lo.map((n) => {
      const m = soanMail(loai, n);
      return { from: NGUOI_GUI, to: [n.email], reply_to: TRA_LOI, subject: m.subject, html: m.html,
        headers: { "List-Unsubscribe": `<${m.huy}>` } };
    });
    const r = await fetch("https://api.resend.com/emails/batch", {
      method: "POST", headers: { Authorization: `Bearer ${khoa}`, "Content-Type": "application/json" }, body: JSON.stringify(thu),
    });
    const kq = await r.json().catch(() => ({}));
    if (!r.ok) { loi.push(`${r.status} ${JSON.stringify(kq).slice(0, 300)}`); continue; }
    const ids: any[] = kq?.data ?? [];
    const dong = lo.map((n, j) => ({ user_id: n.uid, loai, ngay, resend_id: ids[j]?.id ?? null }));
    const { error: e2 } = await sb.from("mail_da_gui").upsert(dong, { onConflict: "user_id,loai,ngay" });
    if (e2) loi.push(e2.message);
    daGui += lo.length;
  }
  return json(200, { ngay, soNguoi: ds.length, daGui, loi });
});
