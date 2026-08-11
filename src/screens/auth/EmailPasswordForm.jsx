import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { useT } from "../../shared/i18n.jsx";

/* Form đăng nhập email + mật khẩu qua Supabase Auth.

   Một form duy nhất cho cả hai lối vào: trang /login và cửa bật lên khi khách
   bấm vào việc cần tài khoản. Có hai form song song là cách chắc chắn để một
   hôm nào đó sửa chỗ này mà quên chỗ kia — rồi hai đường vào hành xử khác
   nhau. Đây chính là nguyên tắc LoginGate đã đặt ra từ đầu.

   Preflight bị tắt (tailwind.config.js) nên <input> và <button> giữ viền cùng
   nền mặc định của trình duyệt. Mọi ô đi qua INPUT, mọi nút có border-0. */

const INPUT =
  "w-full rounded-xl border border-solid border-line bg-surface px-4 py-3 text-sm " +
  "font-medium text-ink outline-none transition placeholder:text-soft " +
  "focus:border-primary focus:ring-2 focus:ring-primary/40";

export default function EmailPasswordForm({ accounts = [], onLogin, autoFocus = false }) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  /* Vai trò lấy theo thứ tự: user_metadata.role do người tạo tài khoản đặt →
     đối chiếu email trong bảng tài khoản → mặc định học sinh.

     Mặc định phải là "eleve", không phải "prof": đoán nhầm thành học sinh chỉ
     làm người ta thấy thiếu menu, đoán nhầm thành giáo viên là trao quyền xem
     bài và điểm của cả lớp. */
  const resolveRole = (user) => {
    const meta = user?.user_metadata || {};
    if (meta.role === "prof" || meta.role === "eleve") {
      return { role: meta.role, name: meta.name || user.email };
    }
    const acc = accounts.find((a) => a.email && a.email.toLowerCase() === String(user?.email).toLowerCase());
    if (acc) return { role: "eleve", name: acc.name };
    return { role: "eleve", name: meta.name || String(user?.email || "").split("@")[0] };
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    const id = email.trim();
    if (!id || !password) { setMsg(t("login.err_generic")); return; }

    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: id, password });
      /* Một thông báo duy nhất cho mọi kiểu sai — nói rõ "email này không tồn
         tại" là cho người lạ biết địa chỉ nào có thật trong hệ thống. */
      if (error || !data?.user) { setMsg(t("login.err_generic")); return; }
      onLogin(resolveRole(data.user));
    } catch {
      setMsg(t("login.err_network"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="auth-email" className="block text-sm font-medium text-ink">
          {t("login.email_label")}
        </label>
        <input
          id="auth-email"
          type="email"
          autoFocus={autoFocus}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          className={`${INPUT} mt-2`}
        />
      </div>

      <div>
        <label htmlFor="auth-password" className="block text-sm font-medium text-ink">
          {t("login.password_label")}
        </label>
        <div className="relative mt-2">
          <input
            id="auth-password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

      {msg && (
        <p role="alert" className="m-0 flex items-start gap-2 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {msg}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-3.5 font-[inherit] text-sm font-bold text-on-primary shadow-lg shadow-primary/40 transition hover:opacity-90 disabled:opacity-60"
      >
        {busy && <Loader2 size={16} className="mcf-spin" />}
        {t("login.submit")}
      </button>
    </form>
  );
}
