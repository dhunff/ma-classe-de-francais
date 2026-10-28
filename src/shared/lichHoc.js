import { supabase } from "../storageShim.js";

/* Lịch học tự đặt (28/10, migration 172). Bảng `lich_hoc`, RLS chỉ cho đọc/ghi lịch của chính mình.
 * Mail Léon nhắc trước 30 phút do cron + Edge Function gui-nhac-lich lo, client chỉ đặt cờ nhac_mail.
 *
 * `chuaCoBang`: database chưa chạy 172 (PostgREST trả 42P01 / PGRST205). Màn lịch khi đó lùi về
 * blob cũ và nói rõ là chưa nhắc mail được, thay vì báo đã lưu mà không lưu gì. */
const thieuBang = (e) => e && (e.code === "42P01" || e.code === "PGRST205" || /lich_hoc/.test(e.message || "") && /exist|schema cache/i.test(e.message || ""));

export async function docLich(tu, den) {
  const { data, error } = await supabase.from("lich_hoc").select("id, tieu_de, muc, luc, nhac_mail")
    .gte("luc", tu.toISOString()).lt("luc", den.toISOString()).order("luc");
  if (error) return { loi: error, chuaCoBang: thieuBang(error) };
  return { ds: data ?? [] };
}

export async function themLich({ tieuDe, muc, luc, nhacMail = true }) {
  const { data, error } = await supabase.from("lich_hoc")
    .insert({ tieu_de: tieuDe.slice(0, 120), muc: muc || null, luc: luc.toISOString(), nhac_mail: nhacMail })
    .select("id, tieu_de, muc, luc, nhac_mail").single();
  if (error) return { loi: /QUA_NHIEU_LICH/.test(error.message || "") ? "qua_nhieu" : error.message, chuaCoBang: thieuBang(error) };
  return { lich: data };
}

export async function xoaLich(id) {
  const { error, count } = await supabase.from("lich_hoc").delete({ count: "exact" }).eq("id", id);
  return !error && count === 1;
}

export async function doiNhac(id, nhacMail) {
  const { error } = await supabase.from("lich_hoc").update({ nhac_mail: nhacMail }).eq("id", id);
  return !error;
}
