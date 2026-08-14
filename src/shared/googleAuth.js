import { supabase } from "../storageShim.js";

/* Đăng nhập Google, dùng chung cho trang /login và cửa bật lên cho khách.

   Logic này vốn nằm trong LoginSplit.jsx. Đưa ra đây khi LoginGate cũng cần
   nó: chép sang file thứ hai là bảo đảm một hôm nào đó sửa chỗ này quên chỗ
   kia, và phần đắt giá nhất bên dưới — bước hỏi settings — chính là thứ dễ bị
   bỏ sót khi chép.

   PHẢI hỏi /auth/v1/settings TRƯỚC khi chuyển hướng. `signInWithOAuth` không
   kiểm tra gì cả: provider đang tắt thì nó vẫn đẩy người dùng sang Supabase,
   và Supabase đáp lại bằng JSON thô giữa màn hình —
   {"code":400,...,"msg":"Unsupported provider: provider is not enabled"}.
   Nhánh `error` phía client không bao giờ chạy, vì trang đã đi mất rồi.

   Không có nhánh "thành công": đi trót lọt nghĩa là trình duyệt đã rời trang.
   Phiên quay về được App.jsx bắt lại qua getSession/onAuthStateChange. */
export async function signInWithGoogle({ redirectTo } = {}) {
  const base = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let settings;
  try {
    const res = await fetch(`${base}/auth/v1/settings`, { headers: { apikey: key } });
    settings = await res.json();
  } catch {
    return { reason: "network" };
  }

  if (!settings?.external?.google) return { reason: "disabled" };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    /* Quay lại ĐÚNG trang đang đứng, không phải /login. Khách bấm vào một bài
       trong thư viện rồi bị hỏi đăng nhập; thả họ về trang chủ là bắt đi tìm
       lại bài đó từ đầu. */
    options: { redirectTo: redirectTo || window.location.href },
  });

  if (error) return { reason: "failed" };
  return { reason: null };   // đang chuyển hướng
}
