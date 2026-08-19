import { supabase } from "../storageShim.js";

/* Lớp truy cập sổ tay — bảng `public.tips`.
 *
 * Bảng chứ không phải một khoá kv_store nữa: xem lý do đầy đủ ở đầu
 * migration 009. Tóm lại là đọc-sửa-ghi cả blob thì hai giáo viên sửa cùng
 * lúc sẽ có một người mất trắng, và docs/roadmap-delf.md vừa nói đừng làm dày
 * thêm đống blob.
 *
 * Phân quyền do RLS lo: ai cũng ĐỌC được (kể cả khách chưa đăng nhập, vì mẹo
 * học là nội dung sư phạm), chỉ giáo viên GHI. Không kiểm vai ở đây — kiểm
 * phía client là hàng rào giả.
 */

/* Nhãn phải khớp bảng màu trong layout/CheatSheetPanel.jsx. Danh sách đóng để
   khỏi có `Grammaire`, `grammaire` và `Ngữ pháp` nằm cạnh nhau sau vài tháng. */
export const TIP_TAGS = ["Grammaire", "Vocabulaire", "Méthode", "Piège"];

export async function loadTips() {
  const { data, error } = await supabase
    .from("tips")
    .select("*")
    .order("ord", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return [];
  return data || [];
}

/* Thêm mẹo mới. `ord` đẩy xuống cuối danh sách — người soạn thường thêm vào
   cuối rồi mới sắp lại, chứ không chèn giữa. */
export async function createTip({ tag, title, body }, currentMaxOrd = 0) {
  const { data, error } = await supabase
    .from("tips")
    .insert({
      tag: TIP_TAGS.includes(tag) ? tag : TIP_TAGS[0],
      title: String(title || "").trim(),
      body: String(body || "").trim(),
      ord: Number(currentMaxOrd) + 10,
    })
    .select()
    .single();
  return error ? { ok: false, error } : { ok: true, tip: data };
}

export async function updateTip(id, { tag, title, body }) {
  const patch = {};
  if (tag !== undefined) patch.tag = TIP_TAGS.includes(tag) ? tag : TIP_TAGS[0];
  if (title !== undefined) patch.title = String(title).trim();
  if (body !== undefined) patch.body = String(body).trim();

  const { error } = await supabase.from("tips").update(patch).eq("id", id);
  return error ? { ok: false, error } : { ok: true };
}

export async function deleteTip(id) {
  const { error } = await supabase.from("tips").delete().eq("id", id);
  return error ? { ok: false, error } : { ok: true };
}

/* Đổi chỗ hai mẹo bằng cách hoán `ord`. Hai lệnh riêng chứ không phải một
   giao dịch — nếu lệnh thứ hai hỏng thì hai mẹo cùng `ord`, và thứ tự phụ
   `created_at` vẫn cho ra một danh sách ổn định. Không đẹp nhưng không vỡ. */
export async function swapOrder(a, b) {
  const r1 = await supabase.from("tips").update({ ord: b.ord }).eq("id", a.id);
  if (r1.error) return { ok: false, error: r1.error };
  const r2 = await supabase.from("tips").update({ ord: a.ord }).eq("id", b.id);
  return r2.error ? { ok: false, error: r2.error } : { ok: true };
}
