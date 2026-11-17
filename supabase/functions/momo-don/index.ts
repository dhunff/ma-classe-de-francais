/* momo-don (17/11/2026): học sinh mua gói VIP bằng ví MoMo.
 *
 *   { hanh_dong: "tao", ve }   tạo đơn: GIÁ do máy chủ đặt (không nhận số tiền từ trình duyệt), ghi momo_don,
 *                              gọi MoMo /v2/gateway/api/create (requestType captureWallet), trả payUrl,
 *                              deeplink, qrCodeUrl. `ve` là trang MoMo đưa người dùng quay lại; chỉ nhận
 *                              tên miền của FRACILE, lạ thì về trang chủ học sinh.
 *   { hanh_dong: "kiem", ma }  học sinh bấm « đã thanh toán » hoặc quay lại từ MoMo: tra cứu đơn CỦA CHÍNH
 *                              MÌNH ở MoMo, đã trả thì cấp VIP (xacNhanDon). Phòng khi IPN không tới.
 *
 * verify_jwt tắt trong config.toml (lý do ở đó): hàm tự đọc JWT bằng auth.getUser(token). */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";
// @ts-ignore: JS thuần, dùng chung với bộ kiểm Node
import { chuoiTaoDon, hmacHex, maDonMoi } from "../_shared/momo.js";
import { docCauHinh, goiMoMo, xacNhanDon, VIP_GIA, VIP_MA } from "../_shared/momoXacNhan.ts";

const NGUON_HOP_LE = ["https://www.fracile.vn", "https://fracile.vn", "https://fracile.vercel.app", "http://localhost:5173"];
const VE_MAC_DINH = "https://www.fracile.vn/etudiant/dashboard";
const TRAN_DON_GIO = 10; // tối đa 10 đơn mới mỗi giờ cho một người: chặn bấm liên tục, không chặn người thật

const trangVe = (ve: unknown) => {
  try { const u = new URL(String(ve)); return NGUON_HOP_LE.includes(u.origin) ? `${u.origin}${u.pathname}` : VE_MAC_DINH; } catch { return VE_MAC_DINH; }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });
  const cfg = docCauHinh();
  if (!cfg) return json(503, { ok: false, ma: "CHUA_CAU_HINH_MOMO" });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: u, error: loiU } = await admin.auth.getUser(token);
  const userId = u?.user?.id;
  if (loiU || !userId) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  // deno-lint-ignore no-explicit-any
  let than: any = null;
  try { than = await req.json(); } catch { /* kiểm ở dưới */ }

  if (than?.hanh_dong === "kiem") {
    const ma = String(than?.ma ?? "");
    const { data: don } = await admin.from("momo_don").select("ma").eq("ma", ma).eq("user_id", userId).maybeSingle();
    if (!don) return json(404, { ok: false, ma: "KHONG_CO_DON" });
    const kq = await xacNhanDon(admin, cfg, ma, "hoc_sinh");
    return json(kq.ok ? 200 : 500, kq);
  }

  if (than?.hanh_dong !== "tao") return json(400, { ok: false, ma: "SAI_HANH_DONG" });
  const { data: hs } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!hs) return json(403, { ok: false, ma: "KHONG_CO_HO_SO" });
  const motGioTruoc = new Date(Date.now() - 3600e3).toISOString();
  const { count } = await admin.from("momo_don").select("ma", { count: "exact", head: true }).eq("user_id", userId).gte("tao_luc", motGioTruoc);
  if ((count ?? 0) >= TRAN_DON_GIO) return json(429, { ok: false, ma: "QUA_NHIEU_DON" });

  const orderId = maDonMoi();
  const { error: loiGhi } = await admin.from("momo_don").insert({ ma: orderId, user_id: userId, goi: VIP_MA, so_tien: VIP_GIA });
  if (loiGhi) return json(500, { ok: false, ma: "KHONG_GHI_DUOC_DON", chiTiet: loiGhi.message });

  const dl = {
    partnerCode: cfg.partnerCode, accessKey: cfg.accessKey, requestId: orderId, amount: VIP_GIA, orderId,
    orderInfo: "FRACILE: goi VIP 1 thang", redirectUrl: trangVe(than?.ve),
    ipnUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/momo-ipn`, extraData: "", requestType: "captureWallet",
  };
  const signature = await hmacHex(cfg.secretKey, chuoiTaoDon(dl));
  const { accessKey: _k, ...gui } = dl;
  const kq = await goiMoMo(cfg, "/v2/gateway/api/create", { ...gui, signature, lang: "vi", autoCapture: true });
  if (kq?.resultCode !== 0 || !kq?.payUrl) {
    await admin.from("momo_don").update({ trang_thai: "that_bai", ket_qua: { nguon: "tao", phan_hoi: kq } }).eq("ma", orderId);
    return json(502, { ok: false, ma: "MOMO_TU_CHOI", resultCode: kq?.resultCode ?? null, thongBao: kq?.message ?? "" });
  }
  return json(200, { ok: true, ma: orderId, payUrl: kq.payUrl, deeplink: kq.deeplink ?? null, qrCodeUrl: kq.qrCodeUrl ?? null, soTien: VIP_GIA });
});
