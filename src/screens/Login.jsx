import React, { useState } from "react";
import { BookOpen, GraduationCap, Moon, Sun, AlertCircle, Loader2 } from "lucide-react";
import { load, save } from "../shared/storage.js";
import { useT } from "../shared/i18n.jsx";

/* Cổng đăng nhập chung cho cả hai vai trò.

   Bỏ hẳn lớp trang trí cũ (11 icon tháp Eiffel / croissant / ly rượu, cờ Pháp,
   con dấu sáp) — đó là hình dung "nước Pháp" kiểu bưu thiếp du lịch, không
   liên quan gì tới việc học tiếng Pháp, và nó chiếm chỗ của thứ duy nhất
   người dùng tới đây để làm: đăng nhập.

   Chữ chuyển sang đa ngôn ngữ. Bản cũ chỉ có tiếng Pháp, trong khi người mới
   bắt đầu — nhóm đông nhất — chưa đọc được "Ton prénom" hay "Code PIN". */

const QUOTES = [
  "Le succès est la somme de petits efforts, répétés jour après jour.",
  "Petit à petit, l'oiseau fait son nid.",
  "Paris ne s'est pas fait en un jour.",
  "Vouloir, c'est pouvoir.",
  "Il n'y a pas de réussite facile ni d'échecs définitifs.",
];

function Field({ id, label, hint, ...inputProps }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-soft">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="h-11 w-full rounded-md border border-solid border-line-strong bg-surface px-3 text-[15px] text-ink transition-colors placeholder:text-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {hint && <p className="mt-1.5 text-xs text-soft">{hint}</p>}
    </div>
  );
}

export default function Login({ accounts, onLogin, lang, langs, onLang, dark, onToggleDark }) {
  const t = useT();
  const [tab, setTab] = useState("eleve");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Một câu, chọn khi mở trang. Bản cũ đổi câu mỗi 7 giây — chuyển động nền
  // ngay cạnh ô đang gõ là thứ gây nhiễu, không phải thứ giúp đăng nhập.
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (tab === "eleve") {
      const acc = accounts.find((a) => a.name.toLowerCase() === name.trim().toLowerCase());
      if (!acc) { setMsg(t("login.err_no_account", { name: name.trim() })); return; }
      if (acc.code !== code.trim()) { setMsg(t("login.err_wrong_password")); return; }
      // App.jsx nạp lại bài tập và bài nộp ngay sau đây, nên chờ đợi là có thật.
      setBusy(true);
      onLogin({ role: "eleve", name: acc.name });
      return;
    }
    setBusy(true);
    try {
      const stored = await load("mcf-teacher-pin", null);
      if (!stored) {
        if (pin.length < 4) { setMsg(t("login.err_pin_short")); return; }
        await save("mcf-teacher-pin", pin);
        onLogin({ role: "prof" });
      } else if (stored === pin) {
        onLogin({ role: "prof" });
      } else {
        setMsg(t("login.err_wrong_pin"));
      }
    } finally {
      setBusy(false);
    }
  };

  /* Điều hướng sau đăng nhập nằm ở App.jsx: onLogin đặt session, rồi
     RequireRole đưa prof về /professeur/dashboard và eleve về
     /etudiant/dashboard. Đặt ở đó thay vì ở đây để một người gõ thẳng URL
     cũng đi qua đúng luật, chứ không chỉ người bấm nút này. */

  const isStudent = tab === "eleve";

  return (
    <div className="flex min-h-screen flex-col bg-bg font-sans text-ink">
      {/* Ngôn ngữ + sáng/tối: đặt ở đây vì người chưa đăng nhập cũng cần đọc
          được màn hình này. */}
      <div className="flex items-center justify-end gap-2 p-4">
        <label className="relative">
          <span className="sr-only">{t("lang_label")}</span>
          <select
            value={lang}
            onChange={(e) => onLang(e.target.value)}
            className="h-10 cursor-pointer rounded-md border border-solid border-line bg-surface px-2 text-sm font-semibold text-ink transition-colors focus:border-primary focus:outline-none"
          >
            {langs.map(([code2, flag, label]) => (
              <option key={code2} value={code2}>{flag} {label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onToggleDark}
          title={dark ? t("header.light_mode") : t("header.dark_mode")}
          aria-pressed={dark}
          className="grid h-10 w-10 place-items-center rounded-md border border-solid border-line bg-surface text-soft transition-colors hover:text-ink"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <main className="flex flex-1 items-start justify-center px-4 pb-10 pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center">
            <img
              src="/logo.png"
              alt=""
              aria-hidden
              className="mx-auto mb-3 h-12 w-12 rounded-md object-contain"
            />
            <div className="text-2xl font-extrabold tracking-tight text-ink">
              FRACILE<span className="text-primary">.</span>
            </div>
            <h1 className="mt-3 text-xl font-bold tracking-tight text-ink">{t("login.welcome")}</h1>
            <p className="mt-1 text-sm text-soft">{t("login.subtitle")}</p>
          </div>

          <div className="rounded-md border border-solid border-line bg-surface p-6 shadow-sm sm:p-7">
            {/* Chọn vai trò */}
            <div role="tablist" className="mb-6 flex gap-1 rounded-md bg-surface2 p-1">
              {[
                ["eleve", t("login.tab_student"), BookOpen],
                ["prof", t("login.tab_teacher"), GraduationCap],
              ].map(([k, label, Icon]) => {
                const on = tab === k;
                return (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => { setTab(k); setMsg(""); setShowHelp(false); }}
                    className={[
                      "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5",
                      "text-sm transition-colors",
                      on ? "bg-surface font-bold text-primary shadow-sm" : "font-medium text-soft hover:text-ink",
                    ].join(" ")}
                  >
                    <Icon size={16} /> {label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={submit} noValidate>
              {/* Lỗi đặt TRÊN ô đầu tiên: người dùng đọc từ trên xuống, nên
                  thông báo phải nằm trước thứ cần sửa, không phải sau nó. */}
              {msg && (
                <p
                  role="alert"
                  className="mb-4 flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2.5 text-sm text-danger"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{msg}</span>
                </p>
              )}

              {isStudent ? (
                <>
                  <Field
                    id="login-name"
                    label={t("login.name_label")}
                    placeholder={t("login.name_placeholder")}
                    value={name}
                    autoComplete="username"
                    autoCapitalize="words"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Field
                    id="login-password"
                    label={t("login.password_label")}
                    placeholder={t("login.password_placeholder")}
                    type="password"
                    value={code}
                    autoComplete="current-password"
                    onChange={(e) => setCode(e.target.value)}
                  />
                </>
              ) : (
                <Field
                  id="login-pin"
                  label={t("login.pin_label")}
                  placeholder={t("login.pin_placeholder")}
                  hint={t("login.pin_hint")}
                  type="password"
                  value={pin}
                  autoComplete="current-password"
                  onChange={(e) => setPin(e.target.value)}
                />
              )}

              {/* Quên mật khẩu — nói đúng cách khôi phục có thật.
                  Hệ thống không gửi email đặt lại (không có email), nhưng giáo
                  viên có nút « Réinitialiser » trong danh sách học sinh. Một
                  link dẫn tới trang trống còn tệ hơn là không có link. */}
              {isStudent && (
                <div className="mb-5 text-right">
                  <button
                    type="button"
                    onClick={() => setShowHelp((v) => !v)}
                    aria-expanded={showHelp}
                    className="rounded-sm text-sm font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {t("login.forgot")}
                  </button>
                  {showHelp && (
                    <p className="mt-2 rounded-md bg-surface2 px-3 py-2.5 text-left text-sm leading-relaxed text-soft">
                      {t("login.forgot_help")}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-solid border-transparent bg-primary text-[15px] font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 size={17} className="mcf-spin" />
                    {t("login.signing_in")}
                  </>
                ) : (
                  <>
                    {isStudent ? <BookOpen size={17} /> : <GraduationCap size={17} />}
                    {isStudent ? t("login.submit_student") : t("login.submit_teacher")}
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs leading-relaxed text-soft">
            {t("login.footnote")}
          </p>

          <p className="mt-8 text-center text-sm italic text-soft">« {quote} »</p>
        </div>
      </main>
    </div>
  );
}
