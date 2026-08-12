import React, { useState } from "react";
import { Asterisk, Loader2, AlertCircle } from "lucide-react";
import EmailPasswordForm from "./auth/EmailPasswordForm.jsx";
import { useT } from "../shared/i18n.jsx";
import { supabase } from "../storageShim.js";

/* Trang đăng nhập — vỏ hai khoang. Bản thân form nằm ở EmailPasswordForm,
   dùng chung với cửa bật lên cho khách trong LoginGate; ở đây chỉ còn phần
   trang trí và bố cục.

   Khoang trái dùng thẳng bảng slate/blue của Tailwind chứ không dùng token
   trong tokens.css, nên nó chỉ có bản sáng — đó là chủ ý, mesh gradient này
   không có bản tối tương ứng.

   Preflight bị TẮT (tailwind.config.js), nên <button> vẫn giữ viền và nền
   mặc định của trình duyệt, còn h1/h2/p vẫn còn margin. Mọi tiêu đề dưới đây
   đều có `m-0`, mọi nút đi qua RESET_BTN — bỏ đi là giao diện vỡ. */

const RESET_BTN = "cursor-pointer border-0 font-[inherit] appearance-none";

/* ──────────────────────────  Biểu tượng mạng xã hội  ────────────────────── */
/* Lucide không có logo thương hiệu nên vẽ tay bằng SVG.

   Chỉ còn Google. Facebook và Apple đã bỏ: Supabase báo `google_enabled:
   false, phone_enabled: false` — cả ba nút trước đây đều không nối vào đâu,
   mà nút chết trên màn đăng nhập là thứ người dùng thử trước tiên. Giữ đúng
   một lối, và lối đó sẽ được nối thật ở bước 2. */

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
      <path fill="#4285F4" d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.55z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1.03 7.6-2.79l-3.71-2.89c-1.03.69-2.35 1.1-3.89 1.1-2.99 0-5.52-2.02-6.43-4.74H1.74v2.98A11.5 11.5 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.57 14.68a6.9 6.9 0 0 1 0-4.4V7.3H1.74a11.5 11.5 0 0 0 0 10.36l3.83-2.98z" />
      <path fill="#EA4335" d="M12 4.75c1.69 0 3.2.58 4.39 1.72l3.29-3.29C17.7 1.24 15.1 0 12 0 7.5 0 3.61 2.58 1.74 6.34l3.83 2.98C6.48 6.77 9.01 4.75 12 4.75z" />
    </svg>
  );
}

/* ────────────────────────────  Khoang trái  ─────────────────────────────── */

/* Nền mesh: một gradient chéo làm nền, cộng hai quầng mờ chồng lên để màu
   không chuyển đều tăm tắp như gradient thuần. */
function VisualPanel() {
  return (
    <div className="relative hidden overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-blue-700 via-purple-600 to-fuchsia-300 md:block">
      {/* Quầng fuchsia phải tránh góc trên trái: đó là chỗ duy nhất xanh lam
          của gradient lộ ra, chồng lên là cả khoang chỉ còn tím với hồng. */}
      <span aria-hidden className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-fuchsia-400/50 blur-3xl" />
      <span aria-hidden className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-pink-300/40 blur-3xl" />
      <span aria-hidden className="absolute -right-6 top-6 h-52 w-52 rounded-full bg-blue-500/50 blur-3xl" />
      <span aria-hidden className="absolute left-1/3 top-1/2 h-40 w-40 rounded-full bg-white/15 blur-2xl" />

      <div className="relative flex h-full flex-col justify-between p-10">
        <Asterisk size={40} strokeWidth={2.6} className="text-white" />

        <div>
          <p className="m-0 text-sm font-semibold text-white/80">Welcome back to FRACILE</p>
          <h2 className="m-0 mt-3 max-w-sm text-3xl font-extrabold leading-snug tracking-tight text-white">
            Get access to your personal hub for clarity and productivity
          </h2>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────  Khoang phải  ─────────────────────────────── */

export default function LoginSplit({ accounts = [], onLogin }) {
  const t = useT();
  /* "login" | "register" | "reset". Chế độ nằm ở đây chứ không nằm trong form,
     vì tiêu đề, nút Google và dòng chân trang đều đổi theo nó. Khoang trái
     không phụ thuộc gì — mesh gradient đứng yên suốt cả ba chế độ. */
  const [mode, setMode] = useState("login");
  const [oauthBusy, setOauthBusy] = useState(false);
  const [oauthError, setOauthError] = useState("");

  /* Lỗi OAuth phải chết khi đổi chế độ. Nó sống ở đây chứ không trong form,
     nên không tự biến mất như lỗi của form — để nguyên thì thông báo "Google
     chưa bật" còn treo trên màn đăng ký, nơi nó chẳng liên quan gì. */
  const changeMode = (next) => { setOauthError(""); setMode(next); };

  /* Google chuyển hướng rời khỏi trang, nên không có nhánh "thành công" ở đây
     — nếu đi trót lọt thì trình duyệt đã rời trang. Phiên quay về được App.jsx
     bắt lại qua onAuthStateChange.

     Phải hỏi /auth/v1/settings TRƯỚC khi chuyển hướng. signInWithOAuth không
     kiểm tra gì cả: provider tắt thì nó vẫn đẩy người dùng sang Supabase, và
     Supabase đáp lại bằng JSON thô giữa màn hình —
     {"code":400,...,"msg":"Unsupported provider: provider is not enabled"}.
     Nhánh `error` phía client không bao giờ chạy vì trang đã đi mất rồi. */
  const signInWithGoogle = async () => {
    setOauthError("");
    setOauthBusy(true);
    try {
      const base = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${base}/auth/v1/settings`, { headers: { apikey: key } });
      const settings = await res.json();

      if (!settings?.external?.google) {
        setOauthError(t("login.err_google_disabled"));
        setOauthBusy(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/login` },
      });
      if (error) { setOauthError(error.message); setOauthBusy(false); }
    } catch {
      setOauthError(t("login.err_network"));
      setOauthBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7fa] p-4 font-sans">
      <div className="grid w-full max-w-5xl gap-0 rounded-[2rem] bg-white p-2.5 shadow-xl shadow-slate-200/50 md:grid-cols-2">
        <VisualPanel />

        <div className="flex min-h-[560px] flex-col justify-center p-8 sm:p-12">
          <Asterisk size={30} strokeWidth={2.6} className="text-blue-600" />

          <h1 className="m-0 mt-6 text-2xl font-extrabold tracking-tight text-slate-800">
            {t(`login.title_${mode}`)}
          </h1>
          <p className="m-0 mt-2 text-sm font-medium leading-relaxed text-gray-500">
            {t(`login.subtitle_${mode}`)}
          </p>

          <div className="mt-8">
            <EmailPasswordForm
              key={mode}
              accounts={accounts}
              onLogin={onLogin}
              mode={mode}
              onModeChange={changeMode}
              autoFocus
            />
          </div>

          {/* Google ẩn ở chế độ đặt lại mật khẩu: người tới đó là để lấy lại
              tài khoản email, chào mời một lối đăng nhập khác chỉ gây phân tâm. */}
          {mode !== "reset" && (
            <>
              {/* Đường kẻ chạy suốt hai bên nhờ flex-1, nên không phải đo tay. */}
              <div className="my-7 flex items-center gap-4">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-medium text-slate-400">{t("login.or_continue")}</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={oauthBusy}
                className={`${RESET_BTN} flex w-full items-center justify-center gap-2.5 rounded-full bg-gray-100 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {oauthBusy ? <Loader2 size={18} className="mcf-spin" /> : <GoogleMark />}
                {oauthBusy ? t("login.pending") : t("login.with_google")}
              </button>

              {oauthError && (
                <p role="alert" className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /> {oauthError}
                </p>
              )}
            </>
          )}

          {mode !== "reset" && (
            <p className="m-0 mt-8 text-center text-sm font-medium text-slate-500">
              {mode === "login" ? t("login.no_account") : t("login.have_account")}{" "}
              <button
                type="button"
                onClick={() => changeMode(mode === "login" ? "register" : "login")}
                className={`${RESET_BTN} bg-transparent p-0 text-sm font-bold text-blue-600 hover:underline`}
              >
                {mode === "login" ? t("login.go_register") : t("login.go_login")}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
