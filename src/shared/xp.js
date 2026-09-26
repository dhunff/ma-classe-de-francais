import { supabase } from "../storageShim.js";

/* XP + theo dõi — mọi phép tính ở máy chủ (migration 101).
 *
 * Không hàm nào ở đây GỬI số XP hay giá lên: số dư do trigger trên `attempts`
 * cộng, giá đổi do giáo viên đặt trong `exercises.meta.xpCost`. Client chỉ hỏi
 * và yêu cầu; máy chủ quyết định.
 *
 * Quy ước trả về như các kho khác: `null` = không hỏi được máy chủ (khác với
 * 0 XP hay danh sách rỗng — hai thứ đó là sự thật về người dùng). */

/* Báo cho nhãn XP ở thanh trên đọc lại số dư (vừa nộp bài, vừa đổi XP). */
export const SU_KIEN_XP = "fracile:xp-doi";
export const baoXpDoi = () => { try { window.dispatchEvent(new Event(SU_KIEN_XP)); } catch { /* bỏ qua */ } };

export async function docXp() {
  try {
    const { data, error } = await supabase.rpc("get_my_xp");
    return error ? null : Number(data) || 0;
  } catch { return null; }
}

/* → { ok, xp_balance?, gia?, da_mo_san?, loi? }
   loi: chua_dang_nhap | khong_doi_duoc | khong_co_ho_so | khong_du_xp | mang */
export async function doiXpLayBai(exerciseId) {
  try {
    const { data, error } = await supabase.rpc("redeem_exercise_with_xp", { target_exercise_id: exerciseId });
    if (error) return { ok: false, loi: "mang", chiTiet: error.message };
    return data ?? { ok: false, loi: "mang" };
  } catch (e) { return { ok: false, loi: "mang", chiTiet: String(e) }; }
}

/* → { ok, loi? } — loi: chua_dang_nhap | khong_thay | chinh_minh | mang */
export async function theoDoi(username) {
  try {
    const { data, error } = await supabase.rpc("follow_user", { target_username: username });
    if (error) return { ok: false, loi: "mang" };
    return data ?? { ok: false, loi: "mang" };
  } catch { return { ok: false, loi: "mang" }; }
}

export async function boTheoDoi(id) {
  try {
    const { error } = await supabase.rpc("unfollow_user", { target_id: id });
    return !error;
  } catch { return false; }
}

/* → [{ id, name, username, avatar, has_studied_today }] | null */
export async function docDangTheoDoi() {
  try {
    const { data, error } = await supabase.rpc("get_following_streaks");
    return error ? null : (Array.isArray(data) ? data : []);
  } catch { return null; }
}

/* Bảng xếp hạng XP: mình + những người mình theo dõi (migration 105).
   → [{ hang, id, name, username, avatar, xp, la_toi }] | null */
export async function docBangXepHang() {
  try {
    const { data, error } = await supabase.rpc("get_bang_xep_hang");
    return error ? null : (Array.isArray(data) ? data : []);
  } catch { return null; }
}
