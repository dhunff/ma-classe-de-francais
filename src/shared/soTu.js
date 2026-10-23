import { supabase } from "../storageShim.js";
import { onLai } from "./sm2.js";

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

/* Ôn sổ từ bằng SM-2 (migration 157). Trả thẻ đúng khuôn LuyenBoThe dùng
 * (card_id, matTruoc, matSau, due_at, ease, reps, lapses, interval_days).
 * `null` = không đọc được. */
export async function docTheSoTu() {
  const { data, error } = await supabase.from("so_tu")
    .select("id, tu, nghia, ten_bai, due_at, interval_days, ease, reps, lapses")
    .eq("loai", "tu").order("due_at");
  if (error) return null;
  return (data ?? []).map((r) => ({ card_id: r.id, id: r.id, matTruoc: r.tu, matSau: r.nghia || "(chưa ghi nghĩa)", viDu: r.ten_bai || "",
    due_at: r.due_at, interval_days: r.interval_days, ease: r.ease, reps: r.reps, lapses: r.lapses }));
}

/* Một lần ôn. Ghi xong phải nhận lại đúng dòng đã ghi mới báo ok: ghi im lặng
   mà không trả gì là lỗi đã giấu lịch ôn Flashcard ba tuần (CLAUDE.md). */
export async function onTheSoTu(the, q) {
  const moi = onLai(the, q);
  const { data, error } = await supabase.from("so_tu").update(moi).eq("id", the.card_id).select("id, due_at");
  if (error) return { ok: false, loi: error.message };
  if (!data?.length || data[0].due_at !== moi.due_at) return { ok: false, loi: "không có dòng nào được ghi" };
  return { ok: true, moi };
}
