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

export const ACCESS_KEY = "mcf-access";
export const PAYMENT_KEY = "mcf-payment";

export const STATUS = {
  PURCHASED: "PURCHASED",              // giáo viên đã đối chiếu và xác nhận có tiền vào
  GRANTED_BY_TEACHER: "GRANTED_BY_TEACHER", // cấp miễn phí, không qua thanh toán
};

export const isPremium = (ex) => !!ex?.isPremium && Number(ex?.price) > 0;

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
