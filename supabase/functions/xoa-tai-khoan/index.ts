/* Edge Function `xoa-tai-khoan` — học sinh tự xoá tài khoản của mình (20/11/2026, theo chủ dự án).
 *
 * Gọi từ trang Tài khoản › Bảo mật, sau khi người dùng gõ cụm xác nhận. Body: { xacNhan: true }.
 * Hàm tự đọc JWT bằng auth.getUser(token) (verify_jwt tắt trong config.toml, cùng lý do với `grade`).
 *
 * Thứ tự xoá (service role):
 *   1. Từ chối tài khoản có app_metadata.role khác học sinh (prof, admin…): xoá nhầm tài khoản giáo viên
 *      là mất đề, lớp, quyền chấm. Muốn xoá thì làm tay trong Supabase.
 *   2. Tệp ghi âm bài nói ở bucket `bai-noi`, thư mục `<user_id>/…`.
 *   3. Các bảng KHÔNG tự xoá theo khi xoá người dùng (đọc pg_constraint 20/11):
 *        submissions.user_id  ON DELETE SET NULL → nếu để thì bài làm còn lại không chủ: xoá trước.
 *        the_bo.tac_gia       ON DELETE RESTRICT → bộ thẻ học sinh tự tạo chặn việc xoá: xoá trước.
 *      Mọi bảng còn lại trỏ tới auth.users hoặc profiles đều ON DELETE CASCADE (attempts, answers qua
 *      attempts, leon_hoi, vip_giao_dich, momo_don, follows…), hoặc SET NULL ở cột « ai xử lý / ai tạo »
 *      (exams.created_by, answers.graded_by…) là dữ liệu của người khác, giữ lại là đúng.
 *      danh_sach_den giữ email: người bị chặn xoá tài khoản rồi đăng ký lại vẫn bị chặn.
 *   4. auth.admin.deleteUser → profiles và các bảng con xoá theo. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";

// deno-lint-ignore no-explicit-any
async function lietKeTep(admin: any, bucket: string, thuMuc: string, ra: string[] = [], sau = 0): Promise<string[]> {
  if (sau > 4) return ra;
  for (let trang = 0; ; trang++) {
    const { data, error } = await admin.storage.from(bucket).list(thuMuc, { limit: 1000, offset: trang * 1000 });
    if (error || !data?.length) break;
    for (const muc of data) {
      const duong = `${thuMuc}/${muc.name}`;
      if (muc.id) ra.push(duong); // tệp có id; thư mục ảo thì không
      else await lietKeTep(admin, bucket, duong, ra, sau + 1);
    }
    if (data.length < 1000) break;
  }
  return ra;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "POST" });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: u, error: loiU } = await admin.auth.getUser(token);
  const nguoi = u?.user;
  if (loiU || !nguoi?.id) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  const than = await req.json().catch(() => null);
  if (than?.xacNhan !== true) return json(400, { ok: false, ma: "CHUA_XAC_NHAN" });

  const vai = nguoi.app_metadata?.role;
  if (vai && vai !== "eleve") return json(403, { ok: false, ma: "KHONG_PHAI_HOC_SINH" });

  const id = nguoi.id;
  try {
    const tep = await lietKeTep(admin, "bai-noi", id);
    for (let i = 0; i < tep.length; i += 100) {
      const { error } = await admin.storage.from("bai-noi").remove(tep.slice(i, i + 100));
      if (error) throw new Error(`bai-noi: ${error.message}`);
    }
    for (const [bang, cot] of [["submissions", "user_id"], ["the_bo", "tac_gia"]]) {
      const { error } = await admin.from(bang).delete().eq(cot, id);
      if (error) throw new Error(`${bang}: ${error.message}`);
    }
    const { error: loiXoa } = await admin.auth.admin.deleteUser(id);
    if (loiXoa) throw new Error(`deleteUser: ${loiXoa.message}`);
  } catch (e) {
    console.error("xoa-tai-khoan", id, String(e));
    return json(500, { ok: false, ma: "XOA_HONG" });
  }
  return json(200, { ok: true });
});
