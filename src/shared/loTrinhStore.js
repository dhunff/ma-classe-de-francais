import { supabase } from "../storageShim.js";

/* Tiến độ lộ trình dạng game (migration 108/109).
 *
 * `null` = không đọc được, KHÁC Map rỗng = chưa chơi màn nào. */
export async function docKetQua() {
  const { data, error } = await supabase.from("lo_trinh_ket_qua").select("ma_man, sao");
  if (error) return null;
  return new Map((data ?? []).map((r) => [r.ma_man, r.sao]));
}

/* Ghi kết quả một lượt. Máy chủ giữ sao CAO NHẤT và TRẢ VỀ số sao đang lưu —
   client đối chiếu biên nhận thay vì tin "không lỗi là đã lưu" (CLAUDE.md,
   bẫy tab chạy mã cũ). */
export async function ghiKetQua(maMan, sao) {
  const { data, error } = await supabase.rpc("ghi_ket_qua_man", { p_ma_man: maMan, p_sao: sao });
  if (error) return { loi: error.message };
  const r = Array.isArray(data) ? data[0] : data;
  if (!r || r.r_ma_man !== maMan) return { loi: "Máy chủ không trả biên nhận." };
  return { sao: r.r_sao };
}
