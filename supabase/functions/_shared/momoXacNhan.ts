/* MoMo (17/11/2026): phần dùng chung của momo-don và momo-ipn: đọc cấu hình, tra cứu đơn ở MoMo,
 * và XÁC NHẬN đơn (cấp VIP) chỉ khi chính MoMo trả lời « đã trả đủ tiền » qua API tra cứu.
 *
 * Biến môi trường (supabase secrets set …):
 *   MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY   lấy ở trang doanh nghiệp MoMo (business.momo.vn)
 *   MOMO_MOI_TRUONG   "test" (mặc định, máy chủ thử test-payment.momo.vn) hoặc "that" (payment.momo.vn)
 *
 * Gói VIP: mã, giá, số ngày PHẢI khớp src/shared/vip.js và sepay-webhook (check:momo canh). */
// @ts-ignore: JS thuần, dùng chung với bộ kiểm Node
import { MAY_CHU, chuoiTraCuu, hmacHex } from "./momo.js";

export const VIP_MA = "VIP1TH";
export const VIP_GIA = 99000;
export const VIP_NGAY = 30;

export type CauHinh = { partnerCode: string; accessKey: string; secretKey: string; moiTruong: "test" | "that" };

export function docCauHinh(): CauHinh | null {
  const partnerCode = Deno.env.get("MOMO_PARTNER_CODE") ?? "";
  const accessKey = Deno.env.get("MOMO_ACCESS_KEY") ?? "";
  const secretKey = Deno.env.get("MOMO_SECRET_KEY") ?? "";
  if (!partnerCode || !accessKey || !secretKey) return null;
  return { partnerCode, accessKey, secretKey, moiTruong: Deno.env.get("MOMO_MOI_TRUONG") === "that" ? "that" : "test" };
}

export async function goiMoMo(cfg: CauHinh, duong: string, than: Record<string, unknown>) {
  const r = await fetch(`${MAY_CHU[cfg.moiTruong]}${duong}`, {
    method: "POST", headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(than), signal: AbortSignal.timeout(30000), // MoMo dặn chờ tối thiểu 30 giây
  });
  const chu = await r.text();
  try { return JSON.parse(chu); } catch { return { resultCode: -1, message: `HTTP ${r.status}`, raw: chu.slice(0, 300) }; }
}

export async function traCuu(cfg: CauHinh, orderId: string) {
  const requestId = `${orderId}Q${Date.now()}`;
  const signature = await hmacHex(cfg.secretKey, chuoiTraCuu({ accessKey: cfg.accessKey, orderId, partnerCode: cfg.partnerCode, requestId }));
  return goiMoMo(cfg, "/v2/gateway/api/query", { partnerCode: cfg.partnerCode, requestId, orderId, signature, lang: "vi" });
}

/* Xác nhận một đơn. Chạy được nhiều lần, từ nhiều đường (IPN, học sinh bấm « đã thanh toán », màn trả về):
   gia_han_vip khoá theo `ref` = mã giao dịch MoMo nên không bao giờ cộng ngày hai lần. */
// deno-lint-ignore no-explicit-any
export async function xacNhanDon(admin: any, cfg: CauHinh, ma: string, nguon: string) {
  const { data: don } = await admin.from("momo_don").select("ma, user_id, goi, so_tien, trang_thai").eq("ma", ma).maybeSingle();
  if (!don) return { ok: false, loi: "khong_co_don" };
  if (don.trang_thai === "da_tra") return { ok: true, trangThai: "da_tra" };
  const kq = await traCuu(cfg, ma);
  const daTra = kq?.resultCode === 0 && Number(kq.amount) === Number(don.so_tien) && String(kq.orderId) === ma && kq.transId;
  if (!daTra) {
    await admin.from("momo_don").update({ ket_qua: { nguon, tra_cuu: kq, luc: new Date().toISOString() } }).eq("ma", ma).eq("trang_thai", "cho");
    return { ok: true, trangThai: "cho", resultCode: kq?.resultCode ?? null, thongBao: kq?.message ?? "" };
  }
  if (don.goi === VIP_MA) {
    const { error } = await admin.rpc("gia_han_vip", { p_user: don.user_id, p_ref: `momo:${kq.transId}`, p_so_tien: Number(don.so_tien), p_so_ngay: VIP_NGAY });
    if (error) return { ok: false, loi: "vip_write_failed", chiTiet: error.message };
  }
  await admin.from("momo_don").update({ trang_thai: "da_tra", ma_gd_momo: String(kq.transId), xong_luc: new Date().toISOString(), ket_qua: { nguon, tra_cuu: kq } }).eq("ma", ma);
  return { ok: true, trangThai: "da_tra" };
}
