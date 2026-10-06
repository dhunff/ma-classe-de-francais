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
  return { sao: r.r_sao, xp: r.r_xp ?? 0 };
}

/* Cấu hình lộ trình do giáo viên đặt (migration 113).
   → Map<bo_id, { bat, ord, soCau }> — Map rỗng khi chưa ai chỉnh HOẶC không
   đọc được: cả hai trường hợp đều rơi về mặc định (bật hết, 8 câu), tức là
   lộ trình vẫn chơi được thay vì trống trơn. */
export async function docCauHinh() {
  const { data, error } = await supabase.from("lo_trinh_cau_hinh").select("bo_id, bat, ord, so_cau");
  if (error) return new Map();
  return new Map((data ?? []).map((r) => [r.bo_id, { bat: r.bat, ord: r.ord, soCau: r.so_cau }]));
}

/* Ghi cấu hình cho nhiều bộ một lượt. Trả về số dòng máy chủ XÁC NHẬN đã ghi
   (biên nhận), để màn giáo viên không báo « đã lưu » cho một lần ghi hỏng. */
export async function luuCauHinh(rows) {
  const { data, error } = await supabase.from("lo_trinh_cau_hinh")
    .upsert(rows.map((r) => ({ bo_id: r.boId, bat: r.bat, ord: r.ord, so_cau: r.soCau, cap_nhat: new Date().toISOString() })))
    .select("bo_id");
  if (error) return { loi: error.message };
  return { soDong: (data ?? []).length };
}

/* Tiến độ của mọi học sinh — chỉ giáo viên (máy chủ chặn vai khác). */
export async function docTienDo() {
  const { data, error } = await supabase.rpc("lo_trinh_tien_do");
  return error ? null : (Array.isArray(data) ? data : []);
}

/* Lộ trình theo CHỦ ĐỀ (migration 115/116). Ba bảng đọc song song rồi ghép.
   → { chuDe: [{ id, tenFr, tenVi, mau, man: [{ id, ten, cap, bat, soCau, tu: [...] }] }],
       kho: [mục…] } | null khi không đọc được.
   Mục có dạng troChoiThe cần: { id, matTruoc, matSau, loai, chuDe }. */
export async function docLoTrinh() {
  const [cd, mn, tu] = await Promise.all([
    supabase.from("lo_trinh_chu_de").select("id, ten_fr, ten_vi, mau, ord").order("ord"),
    supabase.from("lo_trinh_man").select("id, chu_de_id, ord, ten, cap, bat, so_cau").order("ord"),
    supabase.from("lo_trinh_tu").select("id, man_id, ord, fr, vi, loai").order("ord").limit(5000),
  ]);
  if (cd.error || mn.error || tu.error) return null;
  const chuDeCuaMan = new Map((mn.data ?? []).map((m) => [m.id, m.chu_de_id]));
  const kho = (tu.data ?? []).map((t) => ({ id: t.id, man: t.man_id, matTruoc: t.fr, matSau: t.vi, loai: t.loai, chuDe: chuDeCuaMan.get(t.man_id) }));
  const chuDe = (cd.data ?? []).map((c) => ({
    id: c.id, tenFr: c.ten_fr, tenVi: c.ten_vi, mau: c.mau,
    man: (mn.data ?? []).filter((m) => m.chu_de_id === c.id).map((m) => ({
      id: m.id, ten: m.ten, cap: m.cap, bat: m.bat, soCau: m.so_cau, tu: kho.filter((t) => t.man === m.id),
    })),
  }));
  return { chuDe, kho };
}

/* Giáo viên bật/tắt màn, đổi số câu (RLS 115: chỉ giáo viên). Trả số dòng
   máy chủ xác nhận đã ghi — 0 nghĩa là không có quyền hoặc không tồn tại. */
export async function luuMan(id, patch) {
  const { data, error } = await supabase.from("lo_trinh_man").update(patch).eq("id", id).select("id");
  if (error) return { loi: error.message };
  return { soDong: (data ?? []).length };
}
