import { supabase } from "../storageShim.js";

/* Thách đấu bạn bè (migration 111). Máy chủ phát đề, bấm giờ và chấm —
   file này chỉ chuyển lời gọi. Mọi hàm trả `{ loi }` khi hỏng, kèm mã lỗi của
   máy chủ để màn hình nói được lý do thật. */

const ma = (e) => String(e?.message || e || "").match(/[A-Z_]{6,}/)?.[0] || String(e?.message || e);

/* → [{ id, bo, ky_nang, tong, toi_thach, doi_phuong:{name,username,avatar},
        toi_xong, toi_dung, toi_giay, ho_xong, ho_dung, ho_giay, created_at }] | null */
export async function dsThachDau() {
  const { data, error } = await supabase.rpc("ds_thach_dau");
  return error ? null : (Array.isArray(data) ? data : []);
}

export async function taoThachDau(doiThuId, boId) {
  const { data, error } = await supabase.rpc("tao_thach_dau", { p_doi_thu: doiThuId, p_bo: boId });
  return error ? { loi: ma(error) } : { id: data };
}

/* Gọi hàm này là ĐỒNG HỒ BẮT ĐẦU CHẠY ở máy chủ (chỉ lần đầu). */
export async function layDe(id) {
  const { data, error } = await supabase.rpc("lay_de_thach_dau", { p_id: id });
  if (error) return { loi: ma(error) };
  return { cau: (data ?? []).map((c) => ({ chieu: c.chieu, de: c.de, luaChon: c.lua_chon || [] })) };
}

export async function nopThachDau(id, traLoi) {
  const { data, error } = await supabase.rpc("nop_thach_dau", { p_id: id, p_tra_loi: traLoi });
  if (error) return { loi: ma(error) };
  const r = Array.isArray(data) ? data[0] : data;
  if (!r) return { loi: "Máy chủ không trả biên nhận." };
  return { dung: r.r_dung, tong: r.r_tong, giay: r.r_giay };
}

/* Thách đấu theo CHỦ ĐỀ (10/10, migration 127): 10 thẻ ngẫu nhiên từ mọi bộ
   công khai cùng chủ đề. */
export async function dsChuDe() {
  const { data, error } = await supabase.rpc("ds_chu_de_thach_dau");
  return error ? null : (Array.isArray(data) ? data : []);
}

export async function taoThachDauChuDe(doiThuId, chuDe) {
  const { data, error } = await supabase.rpc("tao_thach_dau_chu_de", { p_doi_thu: doiThuId, p_chu_de: chuDe });
  return error ? { loi: ma(error) } : { id: data };
}
