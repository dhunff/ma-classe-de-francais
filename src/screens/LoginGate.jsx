import React from "react";
import { createPortal } from "react-dom";
import { X, LogIn } from "lucide-react";
import { useT } from "../shared/i18n.jsx";
import EmailPasswordForm from "./auth/EmailPasswordForm.jsx";

/* Cửa đăng nhập bật lên khi khách bấm vào việc cần tài khoản.

   Dùng lại nguyên component Login thay vì dựng form thứ hai. Có hai form
   đăng nhập song song là cách chắc chắn để một hôm nào đó sửa chỗ này mà
   quên chỗ kia — rồi hai đường vào hành xử khác nhau.

   Đăng nhập xong, `onLogin` chuyển tiếp lên trên để nơi gọi mở đúng bài mà
   khách vừa bấm, chứ không bắt họ đi tìm lại từ đầu. */
export default function LoginGate({ accounts, onLogin, onClose }) {
  const t = useT();

  return createPortal(
    <div className="mcf-float fixed inset-0 z-[9999] overflow-y-auto bg-ink/50"
      onClick={onClose} role="dialog" aria-modal="true" aria-label={t("login.gate_title")}>
      <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
        <div onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-md border border-solid border-line bg-surface shadow-md">
          <div className="flex items-start justify-between gap-3 border-0 border-b border-solid border-line px-5 py-4">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <LogIn size={17} className="shrink-0 text-primary" />
                {t("login.gate_title")}
              </h2>
              <p className="mt-1 text-sm text-soft">{t("login.gate_body")}</p>
            </div>
            <button type="button" onClick={onClose} aria-label={t("pay.close")}
              className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-soft transition-colors hover:bg-surface2 hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/40">
              <X size={18} />
            </button>
          </div>

          <div className="p-5">
            <EmailPasswordForm accounts={accounts} onLogin={onLogin} autoFocus />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
