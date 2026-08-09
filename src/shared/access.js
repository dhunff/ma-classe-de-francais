/* Quyền truy cập bài tập trả phí.

   LƯU Ý VỀ AN TOÀN — đọc trước khi mở rộng phần này.

   Dữ liệu nằm ở `kv_store` của Supabase, và app truy cập bằng anon key vốn
   được nhúng sẵn trong bundle gửi xuống trình duyệt. Nghĩa là các hàm dưới
   đây KHÔNG phải hàng rào bảo mật: một người mở devtools có thể tự ghi
   quyền cho mình mà không trả tiền. Chúng chỉ điều khiển giao diện.

   Rào chắn thật nằm ở chỗ khác: giáo viên là người xác nhận đã nhận được
   tiền rồi mới cấp quyền. Không có việc tự động cấp quyền dựa trên bất cứ
   thứ gì trình duyệt nói. Muốn tự động hoá, phải có webhook chạy phía máy
   chủ (Supabase Edge Function) và siết RLS — khi đó hãy sửa cả chú thích này. */

import { supabase } from "../storageShim.js";
import { load } from "./storage.js";

export const ACCESS_KEY = "mcf-access";
export const PAYMENT_KEY = "mcf-payment";
export const ACCESS_TABLE = "exercise_access";

export const STATUS = {
  PURCHASED: "PURCHASED",              // giáo viên đã đối chiếu và xác nhận có tiền vào
  GRANTED_BY_TEACHER: "GRANTED_BY_TEACHER", // cấp miễn phí, không qua thanh toán
};

export const isPremium = (ex) => !!ex?.isPremium && Number(ex?.price) > 0;

/* Đọc quyền truy cập — CHỈ từ bảng `exercise_access`.

   Trước đây hàm này còn gộp thêm khoá `mcf-access` trong kv_store, nơi nút
   « Cấp quyền » của giáo viên ghi vào. Đó là lỗ hổng cuối: trình duyệt ghi
   được kv_store, nên một học sinh tự tạo bản ghi "giáo viên cấp" cho mình là
   mở khoá được bài trả phí mà không trả tiền.

   Nay cả hai đường cấp quyền — mua và giáo viên cấp — đều đi qua Edge
   Function giữ service_role. Trình duyệt không còn ghi được vào đâu cả, nên
   không còn gì để giả mạo.

   Hệ quả cần biết: các bản ghi cũ nằm trong kv_store KHÔNG còn hiệu lực.
   Xem mục di trú trong supabase/README.md.

   Bảng chưa tồn tại (chưa chạy migration) → trả về rỗng: mọi bài trả phí đều
   khoá. Thà khoá nhầm còn hơn mở nhầm khi không biết chắc ai đã trả tiền. */
export async function loadAccess() {
  try {
    const { data, error } = await supabase
      .from(ACCESS_TABLE)
      .select("student, exercise_id, status");
    if (error) throw error;
    return (data ?? []).map((r) => ({
      student: r.student, exerciseId: r.exercise_id, status: r.status,
    }));
  } catch {
    return [];
  }
}

/* Gọi Edge Function để cấp / thu hồi. Token của giáo viên nằm trong
   localStorage của chính máy họ — không bao giờ ghi vào kv_store. */
export const TEACHER_TOKEN_KEY = "fracile-teacher-token";
export const getTeacherToken = () => {
  try { return localStorage.getItem(TEACHER_TOKEN_KEY) || ""; } catch { return ""; }
};
export const setTeacherToken = (v) => {
  try { localStorage.setItem(TEACHER_TOKEN_KEY, v); } catch {}
};

export async function setAccessRemote(action, student, exerciseId) {
  const token = getTeacherToken();
  if (!token) return { ok: false, reason: "no_token" };
  try {
    const { data, error } = await supabase.functions.invoke("grant-access", {
      body: { action, student, exercise_id: exerciseId },
      headers: { "x-teacher-token": token },
    });
    if (error) return { ok: false, reason: "call_failed", detail: String(error.message || error) };
    if (data?.error) return { ok: false, reason: data.error };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, reason: "call_failed", detail: String(e?.message || e) };
  }
}

export const hasAccess = (access, student, exerciseId) =>
  (Array.isArray(access) ? access : []).some(
    (a) => a.student === student && a.exerciseId === exerciseId,
  );

export const accessRecord = (access, student, exerciseId) =>
  (Array.isArray(access) ? access : []).find(
    (a) => a.student === student && a.exerciseId === exerciseId,
  ) || null;

/* Học sinh mở được bài khi bài miễn phí, hoặc đã có bản ghi quyền. */
export const canOpen = (ex, access, student) =>
  !isPremium(ex) || hasAccess(access, student, ex?.id);

export function grantAccess(access, student, exId, status = STATUS.GRANTED_BY_TEACHER) {
  const rest = (Array.isArray(access) ? access : []).filter(
    (a) => !(a.student === student && a.exerciseId === exId),
  );
  return [...rest, { student, exerciseId: exId, status, at: Date.now() }];
}

/* Thu hồi = xoá hẳn bản ghi. Không dùng trạng thái REVOKED vì một bản ghi
   "đã thu hồi" và "chưa từng có" cho ra cùng một kết quả, mà giữ lại thì
   phải nhớ lọc nó ở mọi chỗ kiểm tra — một chỗ quên là thủng. */
export const revokeAccess = (access, student, exId) =>
  (Array.isArray(access) ? access : []).filter(
    (a) => !(a.student === student && a.exerciseId === exId),
  );

export const fmtPrice = (vnd) =>
  new Intl.NumberFormat("vi-VN").format(Number(vnd) || 0) + " ₫";

/* Nội dung chuyển khoản. Giáo viên đối chiếu chuỗi này với sao kê ngân hàng,
   nên nó phải ngắn, không dấu, và nhận ra được bằng mắt. */
export const paymentMemo = (student, exId) =>
  `LMS ${String(student).replace(/\s+/g, "").slice(0, 12)} ${String(exId).slice(-6)}`;

/* Ảnh QR VietQR — chỉ là một URL, không cần máy chủ nào của ta.
   Trả null khi giáo viên chưa cấu hình tài khoản, để nơi gọi hiện hướng dẫn
   thay vì một ảnh hỏng. */
export function vietQrUrl(cfg, amount, memo) {
  if (!cfg?.bank || !cfg?.account) return null;
  const p = new URLSearchParams({
    amount: String(Math.round(Number(amount) || 0)),
    addInfo: memo,
    accountName: cfg.accountName || "",
  });
  return `https://img.vietqr.io/image/${encodeURIComponent(cfg.bank)}-${encodeURIComponent(cfg.account)}-compact2.png?${p}`;
}
