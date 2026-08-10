import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Asterisk, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { supabase } from "../storageShim.js";
import { useT } from "../shared/i18n.jsx";

/* Màn hình đăng nhập hai khoang — bản thiết kế riêng, chưa nối vào luồng xác
   thực thật. Login.jsx mới là cổng đăng nhập đang chạy (PIN + i18n + storage);
   file này cố tình đứng tách để thử hình thức mà không đụng vào nó.

   Như SoftDashboard, màn hình này dùng thẳng bảng slate/blue của Tailwind chứ
   không dùng token trong tokens.css, nên chỉ có bản sáng.

   Preflight bị TẮT (tailwind.config.js), nên <input> và <button> vẫn giữ viền
   với nền mặc định của trình duyệt, còn h1/h2/p vẫn còn margin. Mọi tiêu đề
   dưới đây đều có `m-0`, mọi nút đi qua RESET_BTN, mọi ô nhập đi qua INPUT —
   bỏ đi là giao diện vỡ. */

const RESET_BTN = "cursor-pointer border-0 font-[inherit] appearance-none";

const INPUT =
  "w-full rounded-xl border border-solid border-gray-200 bg-white px-4 py-3 text-sm " +
  "font-medium text-slate-800 outline-none transition placeholder:text-slate-400 " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500";

/* ──────────────────────────  Biểu tượng mạng xã hội  ────────────────────── */
/* Lucide không có logo thương hiệu, nên ba cái này vẽ tay bằng SVG. */

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

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
      <path fill="#111827" d="M17.05 12.54c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.7-3.18-1.72-1.35-.14-2.64.8-3.33.8-.69 0-1.75-.78-2.87-.76-1.48.02-2.84.86-3.6 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.25 2.74 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.08 2.65-2.14.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.3-.88-2.32-3.5zM14.9 5.9c.6-.73 1.01-1.75.9-2.76-.87.03-1.92.58-2.55 1.31-.56.64-1.05 1.68-.92 2.67.97.08 1.96-.49 2.57-1.22z" />
    </svg>
  );
}

const SOCIALS = [
  { key: "google", label: "Google", Mark: GoogleMark },
  { key: "facebook", label: "Facebook", Mark: FacebookMark },
  { key: "apple", label: "Apple", Mark: AppleMark },
];

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

function Field({ id, label, type = "text", value, onChange, placeholder, autoComplete, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={INPUT + (children ? " pr-11" : "")}
        />
        {children}
      </div>
    </div>
  );
}

export default function LoginSplit({ accounts = [], onLogin }) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  /* Vai trò lấy theo thứ tự: user_metadata.role do người tạo tài khoản đặt →
     đối chiếu email trong bảng tài khoản → mặc định học sinh.

     Mặc định phải là "eleve", không phải "prof": đoán nhầm thành học sinh chỉ
     làm người ta thấy thiếu menu, đoán nhầm thành giáo viên là trao quyền
     xem bài và điểm của cả lớp. */
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
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7fa] p-4 font-sans">
      <div className="grid w-full max-w-5xl gap-0 rounded-[2rem] bg-white p-2.5 shadow-xl shadow-slate-200/50 md:grid-cols-2">
        <VisualPanel />

        <div className="flex min-h-[560px] flex-col justify-center p-8 sm:p-12">
          <Asterisk size={30} strokeWidth={2.6} className="text-blue-600" />

          <h1 className="m-0 mt-6 text-2xl font-extrabold tracking-tight text-slate-800">
            Se connecter à FRACILE
          </h1>
          <p className="m-0 mt-2 text-sm font-medium leading-relaxed text-gray-500">
            Accédez à vos cours et continuez votre apprentissage du français.
          </p>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
            <Field
              id="ls-email"
              label="Votre email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              autoComplete="email"
            />

            <Field
              id="ls-password"
              label="Mot de passe"
              type={visible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            >
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className={`${RESET_BTN} absolute right-3 top-1/2 -translate-y-1/2 bg-transparent p-1 text-slate-400 transition-colors hover:text-slate-600`}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>

            {msg && (
              <p role="alert" className="m-0 flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {msg}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className={`${RESET_BTN} mt-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-700 disabled:opacity-60`}
            >
              {busy && <Loader2 size={16} className="mcf-spin" />}
              Se connecter
            </button>
          </form>

          {/* Đường PIN vẫn còn cho tới khi mọi tài khoản được di trú sang
              Supabase Auth. Gỡ nó đi trước lúc đó là khoá cả lớp ra ngoài. */}
          <Link
            to="/login-pin"
            className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 no-underline hover:text-blue-600"
          >
            <KeyRound size={14} /> {t("login.use_pin")}
          </Link>

          {/* Đường kẻ chạy suốt hai bên nhờ flex-1, nên không phải đo tay. */}
          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-slate-400">or continue with</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="flex gap-3">
            {SOCIALS.map(({ key, label, Mark }) => (
              <button
                key={key}
                type="button"
                aria-label={`Continuer avec ${label}`}
                className={`${RESET_BTN} flex flex-1 items-center justify-center rounded-full bg-gray-100 py-3 transition-colors hover:bg-gray-200`}
              >
                <Mark />
              </button>
            ))}
          </div>

          <p className="m-0 mt-8 text-center text-sm font-medium text-slate-500">
            Vous n'avez pas de compte&nbsp;?{" "}
            <a href="#inscription" className="font-bold text-blue-600 no-underline hover:underline">
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
