import React, { useState } from "react";
import { Asterisk } from "lucide-react";
import EmailPasswordForm from "./auth/EmailPasswordForm.jsx";
import { useT } from "../shared/i18n.jsx";

/* Trang đăng nhập — vỏ hai khoang. Bản thân form nằm ở EmailPasswordForm,
   dùng chung với cửa bật lên cho khách trong LoginGate; ở đây chỉ còn phần
   trang trí và bố cục.

   Khoang trái (mesh gradient) giống nhau ở cả hai chế độ — chữ trắng trên nền
   đậm đọc được ở cả hai. Khoang phải có bản tối (`dark:`, 25/09): form bên
   trong (EmailPasswordForm) dùng token nên VỐN đã đổi theo nền tối; vỏ ngoài
   viết cứng màu sáng thì sau khi đăng xuất từ bản tối, nhãn trắng nằm trên
   thẻ trắng và biến mất.

   Preflight bị TẮT (tailwind.config.js), nên <button> vẫn giữ viền và nền
   mặc định của trình duyệt, còn h1/h2/p vẫn còn margin. Mọi tiêu đề dưới đây
   đều có `m-0`, mọi nút đi qua RESET_BTN — bỏ đi là giao diện vỡ. */

const RESET_BTN = "cursor-pointer border-0 font-[inherit] appearance-none";

/* Logo Google đã theo nút Google sang EmailPasswordForm — nó là thứ duy nhất
   dùng tới, để lại đây thành mã chết. */

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
  const changeMode = (next) => setMode(next);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7fa] p-4 font-sans text-ink transition-colors duration-300 dark:bg-[#131417]">
      <div className="grid w-full max-w-5xl gap-0 rounded-[2rem] border border-solid border-transparent bg-white p-2.5 shadow-xl shadow-slate-200/50 transition-colors duration-300 md:grid-cols-2 dark:border-gray-800 dark:bg-[#1C1D22] dark:shadow-2xl dark:shadow-black/40">
        <VisualPanel />

        <div className="flex min-h-[560px] flex-col justify-center p-8 sm:p-12">
          <Asterisk size={30} strokeWidth={2.6} className="text-blue-600 dark:text-blue-400" />

          <h1 className="m-0 mt-6 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {t(`login.title_${mode}`)}
          </h1>
          <p className="m-0 mt-2 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
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

          {/* Khối Google đã chuyển vào EmailPasswordForm để cửa bật lên cho
              khách (LoginGate) cũng có nó — trước đây chỉ trang này mới có,
              nên khách bị chặn giữa chừng chỉ còn lối email. Logic gọi OAuth
              nằm ở shared/googleAuth.js, giữ nguyên bước hỏi
              /auth/v1/settings trước khi chuyển hướng. */}

          {mode !== "reset" && (
            <p className="m-0 mt-8 text-center text-sm font-medium text-slate-500 dark:text-gray-400">
              {mode === "login" ? t("login.no_account") : t("login.have_account")}{" "}
              <button
                type="button"
                onClick={() => changeMode(mode === "login" ? "register" : "login")}
                className={`${RESET_BTN} bg-transparent p-0 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400`}
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
