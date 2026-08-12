import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, KeyRound } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { useT } from "../../shared/i18n.jsx";

/* Đổi mật khẩu sau khi bấm link trong email đặt lại.

   Màn này chỉ xuất hiện khi Supabase phát sự kiện PASSWORD_RECOVERY, tức là
   đã có một phiên tạm đủ quyền gọi updateUser. Không có phiên đó thì
   updateUser sẽ bị từ chối — nên đây không phải là đường vòng để đổi mật khẩu
   người khác.

   Cố ý KHÔNG thả thẳng người dùng vào app sau khi link được bấm: phiên lúc đó
   chỉ nên dùng cho đúng một việc là đặt mật khẩu mới. */

const INPUT =
  "w-full rounded-xl border border-solid border-line bg-surface px-4 py-3 text-sm " +
  "font-medium text-ink outline-none transition placeholder:text-soft " +
  "focus:border-primary focus:ring-2 focus:ring-primary/40";

const MIN_PASSWORD = 8;

export default function SetNewPassword({ onDone }) {
  const t = useT();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD) { setError(t("login.err_password_short", { n: MIN_PASSWORD })); return; }
    if (password !== confirm) { setError(t("login.err_password_mismatch")); return; }

    setBusy(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) { setError(err.message || t("login.err_network")); return; }
      setDone(true);
      /* Đăng xuất sau khi đổi: phiên khôi phục đã hết việc, và bắt đăng nhập
         lại bằng mật khẩu mới là cách duy nhất xác nhận người dùng nhớ được
         thứ họ vừa đặt. */
      try { await supabase.auth.signOut(); } catch {}
    } catch {
      setError(t("login.err_network"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md rounded-md bg-surface p-8 shadow-md">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-soft text-primary">
          <KeyRound size={20} />
        </span>

        <h1 className="m-0 mt-5 text-xl font-extrabold tracking-tight text-ink">
          {t("login.set_password_title")}
        </h1>
        <p className="m-0 mt-2 text-sm text-soft">{t("login.set_password_body")}</p>

        {done ? (
          <>
            <p role="status" className="m-0 mt-6 flex items-start gap-2 rounded-xl bg-ok-soft px-3.5 py-2.5 text-sm font-medium text-ok">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {t("login.password_changed")}
            </p>
            <button
              type="button"
              onClick={onDone}
              className="mt-5 w-full cursor-pointer rounded-xl border-0 bg-primary px-5 py-3.5 font-[inherit] text-sm font-bold text-on-primary transition hover:opacity-90"
            >
              {t("login.submit")}
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
            <div>
              <label htmlFor="np-password" className="block text-sm font-medium text-ink">
                {t("login.new_password_label")}
              </label>
              <div className="relative mt-2">
                <input
                  id="np-password"
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  placeholder="••••••••"
                  className={`${INPUT} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  aria-label={visible ? t("login.hide_password") : t("login.show_password")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-1 font-[inherit] text-soft transition-colors hover:text-ink"
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="np-confirm" className="block text-sm font-medium text-ink">
                {t("login.confirm_label")}
              </label>
              <input
                id="np-confirm"
                type={visible ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`${INPUT} mt-2`}
              />
            </div>

            {error && (
              <p role="alert" className="m-0 flex items-start gap-2 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-3.5 font-[inherit] text-sm font-bold text-on-primary shadow-lg shadow-primary/40 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="mcf-spin" />}
              {busy ? t("login.pending") : t("login.set_password_submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
