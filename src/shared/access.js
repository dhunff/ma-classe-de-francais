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

/* Đọc quyền truy cập từ HAI nguồn, rồi gộp lại.

   1. Bảng `exercise_access` — nguồn đáng tin. RLS chỉ cho đọc; chỉ Edge
      Function giữ service_role mới ghi được. Đây là nơi webhook SePay ghi
      khi tiền vào.
   2. Khoá `mcf-access` trong kv_store — nơi nút « Cấp quyền » của giáo viên
      còn đang ghi. Trình duyệt ghi được, nên nguồn này KHÔNG đáng tin: một
      học sinh có thể tự tạo bản ghi cho mình. Nó tồn tại tạm cho tới khi có
      Edge Function `grant-access`. Xoá nhánh này ngay khi làm xong hàm đó.

   Bảng có thể chưa tồn tại (chưa chạy migration 001). Khi đó chỉ dùng nguồn
   2 và app vẫn chạy, thay vì hỏng trắng. */
export async function loadAccess() {
  const merged = [];

  try {
    const { data, error } = await supabase
      .from(ACCESS_TABLE)
      .select("student, exercise_id, status");
    if (error) throw error;
    for (const r of data ?? []) {
      merged.push({ student: r.student, exerciseId: r.exercise_id, status: r.status, trusted: true });
    }
  } catch {
    // Chưa có bảng, hoặc mạng lỗi. Không chặn app; nguồn 2 vẫn dùng được.
  }

  try {
    const legacy = await load(ACCESS_KEY, []);
    for (const a of Array.isArray(legacy) ? legacy : []) {
      const dup = merged.some((m) => m.student === a.student && m.exerciseId === a.exerciseId);
      if (!dup) merged.push({ ...a, trusted: false });
    }
  } catch { /* bỏ qua */ }

  return merged;
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
