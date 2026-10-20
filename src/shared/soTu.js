import { supabase } from "../storageShim.js";

/* Sổ từ mới + tô sáng (migration 151, 152). Một bảng: loai 'tu' = từ ghi vào
 * sổ, 'to' = đoạn tô sáng. RLS chỉ trả dòng của chính người đang đăng nhập.
 * Trả `null` khi KHÔNG ĐỌC ĐƯỢC, `[]` khi chưa có gì. */
const COT = "id, exercise_id, ten_bai, loai, tu, nghia, ghi_chu, tao_luc";

export async function docSoTu(exerciseId) {
  let q = supabase.from("so_tu").select(COT).order("tao_luc", { ascending: false });
  if (exerciseId) q = q.eq("exercise_id", exerciseId);
  const { data, error } = await q;
  return error ? null : data;
}

/* Trả về chính dòng vừa ghi; `null` nghĩa là CHƯA lưu. */
export async function themTu({ exerciseId, tenBai, loai = "tu", tu, nghia, ghiChu }) {
  const { data, error } = await supabase.from("so_tu")
    .insert({ exercise_id: exerciseId ?? null, ten_bai: tenBai ?? null, loai, tu: tu.trim(), nghia: nghia?.trim() || null, ghi_chu: ghiChu?.trim() || null })
    .select(COT).single();
  return error ? null : data;
}

export async function xoaTu(id) {
  const { data, error } = await supabase.from("so_tu").delete().eq("id", id).select("id");
  return !error && data?.length === 1;
}
