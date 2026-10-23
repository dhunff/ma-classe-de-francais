import { supabase } from "../storageShim.js";
import { questionFromRow } from "./exerciseMap.js";

/* « Bài luyện của tôi » (migration 158/159, Edge Function cham-on-tap).
 * docBaiLuyen(): { soCauSai, cau: [câu dạng questionFromRow + ly_do, title] } | null khi lỗi. */
export async function docBaiLuyen() {
  const { data, error } = await supabase.rpc("bai_luyen_cua_toi");
  if (error || !data?.ok) return null;
  return {
    soCauSai: data.so_cau_sai ?? 0,
    cau: (data.cau ?? []).map((r) => ({ ...questionFromRow(r), lyDo: r.ly_do, nguon: r.title, soLanSai: r.so_lan_sai })),
  };
}

/* Chấm ở máy chủ; trả đúng hình dạng gradeRemote để PracticeWorkspace dùng chung.
 * `null` = không chấm được (màn hình giữ bài để nộp lại, không bịa điểm 0). */
export async function chamBaiLuyen(answers) {
  const { data, error } = await supabase.functions.invoke("cham-on-tap", { body: { answers } });
  if (error || !data || data.error || typeof data.score !== "number") return null;
  return data;
}
