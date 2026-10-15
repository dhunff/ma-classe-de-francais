/* Trần 100 lượt AI / ngày (giờ VN) cho VIP, cộng chung mọi hàm AI (migration 146).
 * Gọi NGAY TRƯỚC lời gọi AI tốn tiền, chỉ khi người gọi là VIP (tài khoản thường
 * đã có hạn mức riêng của từng hàm). Trả Response 429 nếu chạm trần, null nếu được. */
import { json } from "./cors.ts";

export const TRAN_VIP = 100;

export async function tranVip(admin: any, userId: string, ham: string): Promise<Response | null> {
  const { data, error } = await admin.rpc("ai_dung_luot", { p_user: userId, p_ham: ham, p_tran: TRAN_VIP });
  /* Không đếm được (lỗi mạng/DB) thì CHO QUA: trần này chặn lạm dụng, không phải
     điều kiện để học sinh VIP dùng được tính năng đã trả tiền. */
  if (error || typeof data !== "number") { console.error("[tranVip]", error?.message); return null; }
  if (data < 0) {
    return json(429, { ok: false, ma: "HET_LUOT_VIP", han_muc: TRAN_VIP,
      thong_bao: `Bạn đã dùng hết ${TRAN_VIP} lượt AI hôm nay (trần chung của gói VIP). Lượt mới mở lúc 0 giờ.` });
  }
  return null;
}
