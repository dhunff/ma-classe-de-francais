import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { useT } from "../../shared/i18n.jsx";
import { resolveRole } from "../../shared/authRole.js";

/* Form xác thực — ba chế độ dùng chung một khung: đăng nhập, đăng ký, quên
   mật khẩu.

   Một form duy nhất cho cả trang /login lẫn cửa bật lên cho khách trong
   LoginGate. Hai form song song là cách chắc chắn để một hôm nào đó sửa chỗ
   này mà quên chỗ kia — nguyên tắc LoginGate đã đặt ra từ đầu.

   Mật khẩu KHÔNG băm ở đây. Băm phía trình duyệt là bảo mật giả: kẻ tấn công
   bỏ qua bước đó và gọi thẳng API. supabase.auth.signUp băm phía server, đó
   mới là chỗ duy nhất có ý nghĩa.

   Preflight bị tắt (tailwind.config.js) nên <input> và <button> giữ viền cùng
   nền mặc định của trình duyệt. Mọi ô đi qua INPUT, mọi nút có border-0. */

const INPUT =
  "w-full rounded-xl border border-solid border-line bg-surface px-4 py-3 text-sm " +
  "font-medium text-ink outline-none transition placeholder:text-soft " +
  "focus:border-primary focus:ring-2 focus:ring-primary/40";

const MIN_PASSWORD = 8;

function Field({ id, label, type = "text", value, onChange, placeholder, autoComplete, autoFocus, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label>
      <div className="relative mt-2">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={INPUT + (children ? " pr-11" : "")}
        />
        {children}
      </div>
    </div>
  );
}

function PasswordToggle({ visible, onToggle, t }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? t("login.hide_password") : t("login.show_password")}
      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-1 font-[inherit] text-soft transition-colors hover:text-ink"
    >
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

export default function EmailPasswordForm({ accounts = [], onLogin, mode = "login", onModeChange, autoFocus = false }) {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isReset = mode === "reset";

  /* Kiểm tra tại chỗ trước khi gọi mạng. Không thay cho kiểm tra phía server —
     Supabase vẫn từ chối mật khẩu yếu — nhưng nó trả lời ngay thay vì bắt
     người dùng chờ một vòng đi về rồi mới biết hai ô mật khẩu lệch nhau. */
  /* Không bao giờ đưa thẳng thông điệp của máy chủ ra màn hình.

     Supabase trả lỗi 500 dưới dạng {"code":500,"msg":"Error sending
     confirmation email"}, mà supabase-js không map được `msg` thành `message`
     — kết quả là người dùng nhìn thấy đúng hai dấu ngoặc `{}`. Ngay cả khi
     có chữ, đó là tiếng Anh dành cho lập trình viên, không phải cho học sinh.

     Riêng lỗi gửi thư được tách ra: nó không phải lỗi của người đăng ký, và
     bảo họ "thử lại" là sai — thử bao nhiêu lần cũng hỏng cho tới khi người
     quản trị sửa cấu hình thư. */
  const humanError = (err) => {
    const raw = String(err?.message ?? err?.msg ?? "").trim();
    if (/sending|smtp|mail/i.test(raw)) return t("login.err_mail_down");
    if (/already registered|already exists/i.test(raw)) return t("login.err_email_taken");
    if (/password/i.test(raw) && /weak|short|least/i.test(raw)) {
      return t("login.err_password_short", { n: MIN_PASSWORD });
    }
    if (/invalid|not valid/i.test(raw) && /email/i.test(raw)) return t("login.err_email_invalid");
    /* Không nhận ra thì dùng câu chung — thà mơ hồ còn hơn hiện `{}`. */
    return t("login.err_generic");
  };

  const localError = () => {
    if (!email.trim()) return t("login.err_generic");
    if (isReset) return "";
    if (!password) return t("login.err_generic");
    if (isRegister) {
      if (!name.trim()) return t("login.err_name_required");
      if (password.length < MIN_PASSWORD) return t("login.err_password_short", { n: MIN_PASSWORD });
      if (password !== confirm) return t("login.err_password_mismatch");
    }
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const bad = localError();
    if (bad) { setError(bad); return; }

    setBusy(true);
    try {
      if (isLogin) {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        /* Một thông báo duy nhất cho mọi kiểu sai — nói rõ "email này không
           tồn tại" là cho người lạ biết địa chỉ nào có thật trong hệ thống. */
        if (err || !data?.user) { setError(t("login.err_generic")); return; }
        onLogin(resolveRole(data.user, accounts));
        return;
      }

      if (isRegister) {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            /* Vai trò KHÔNG đặt ở đây. user_metadata do chính người dùng ghi
               được, nên ai cũng có thể tự phong mình làm giáo viên. Để trống
               thì resolveRole rơi về "eleve"; giáo viên phải được cấp quyền
               từ Dashboard bằng service role. */
            data: { name: name.trim() },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        if (err) { setError(humanError(err)); return; }

        /* Email đã tồn tại: Supabase cố tình trả về thành công với identities
           rỗng thay vì báo lỗi, để không tiết lộ địa chỉ nào đã đăng ký. Ta
           hiển thị đúng một thông điệp cho cả hai trường hợp. */
        if (data?.session) { onLogin(resolveRole(data.user, accounts)); return; }
        setNotice(t("login.check_inbox", { email: email.trim() }));
        return;
      }

      /* Đặt lại mật khẩu. Luôn báo "đã gửi" kể cả khi email không tồn tại —
         phản hồi khác nhau sẽ biến form này thành công cụ dò tài khoản. */
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (err && !/not found|invalid/i.test(err.message || "")) {
        setError(humanError(err));
        return;
      }
      setNotice(t("login.reset_sent", { email: email.trim() }));
    } catch {
      setError(t("login.err_network"));
    } finally {
      setBusy(false);
    }
  };

  const submitLabel = isLogin ? t("login.submit") : isRegister ? t("login.submit_register") : t("login.submit_reset");

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {isRegister && (
        <Field
          id="auth-name"
          label={t("login.name_label")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("login.name_placeholder")}
          autoComplete="name"
          autoFocus={autoFocus}
        />
      )}

      <Field
        id="auth-email"
        label={t("login.email_label")}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="vous@exemple.com"
        autoComplete="email"
        autoFocus={autoFocus && !isRegister}
      />

      {!isReset && (
        <Field
          id="auth-password"
          label={t("login.password_label")}
          type={visible ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={isRegister ? "new-password" : "current-password"}
        >
          <PasswordToggle visible={visible} onToggle={() => setVisible((v) => !v)} t={t} />
        </Field>
      )}

      {isRegister && (
        <Field
          id="auth-confirm"
          label={t("login.confirm_label")}
          type={visible ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      )}

      {/* Quên mật khẩu chỉ hiện ở chế độ đăng nhập — ở chế độ đăng ký nó vô
          nghĩa, ở chế độ đặt lại thì người dùng đã ở đúng chỗ rồi. */}
      {isLogin && (
        <div className="-mt-2 text-right">
          <button
            type="button"
            onClick={() => { setError(""); setNotice(""); onModeChange?.("reset"); }}
            className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-xs font-semibold text-primary hover:underline"
          >
            {t("login.forgot")}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="m-0 flex items-start gap-2 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      {notice && (
        <p role="status" className="m-0 flex items-start gap-2 rounded-xl bg-ok-soft px-3.5 py-2.5 text-sm font-medium text-ok">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {notice}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-3.5 font-[inherit] text-sm font-bold text-on-primary shadow-lg shadow-primary/40 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy && <Loader2 size={16} className="mcf-spin" />}
        {busy ? t("login.pending") : submitLabel}
      </button>

      {isReset && (
        <button
          type="button"
          onClick={() => { setError(""); setNotice(""); onModeChange?.("login"); }}
          className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-xs font-semibold text-soft hover:text-ink"
        >
          {t("login.back_to_login")}
        </button>
      )}
    </form>
  );
}
