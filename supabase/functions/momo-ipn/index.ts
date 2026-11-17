/* momo-ipn (17/11/2026): MoMo gọi về đây (IPN, máy chủ tới máy chủ) khi một đơn có kết quả.
 *
 * KHÔNG tin nội dung IPN để cấp VIP. Hàm ghi lại chữ ký IPN có khớp không (cột ipn.ky_khop, để đối chiếu
 * công thức ký với giao dịch thật, như đã làm với SePay), rồi gọi xacNhanDon: TỰ tra cứu đơn ở MoMo bằng
 * khoá của mình và chỉ cấp VIP khi MoMo trả lời đã trả đủ tiền. Ai giả IPN thì chỉ khiến máy chủ hỏi lại MoMo.
 *
 * Luôn trả 204 (MoMo chờ 204 No Content; mã khác thì MoMo gửi lại). verify_jwt tắt (MoMo không có JWT). */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
// @ts-ignore: JS thuần, dùng chung với bộ kiểm Node
import { bangNhau, chuoiIpn, hmacHex } from "../_shared/momo.js";
import { docCauHinh, xacNhanDon } from "../_shared/momoXacNhan.ts";

const XONG = () => new Response(null, { status: 204 });

Deno.serve(async (req) => {
  if (req.method !== "POST") return XONG();
  const cfg = docCauHinh();
  // deno-lint-ignore no-explicit-any
  let than: any = null;
  try { than = await req.json(); } catch { return XONG(); }
  const ma = String(than?.orderId ?? "");
  if (!cfg || !/^FRM[0-9A-Z]+$/.test(ma) || than?.partnerCode !== cfg.partnerCode) return XONG();

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const kyKhop = bangNhau(await hmacHex(cfg.secretKey, chuoiIpn(than, cfg.accessKey)), than?.signature);
  const { signature: _bo, ...ipn } = than;
  await admin.from("momo_don").update({ ipn: { ky_khop: kyKhop, than: ipn, luc: new Date().toISOString() } }).eq("ma", ma);
  await xacNhanDon(admin, cfg, ma, kyKhop ? "ipn" : "ipn_ky_lech");
  return XONG();
});
