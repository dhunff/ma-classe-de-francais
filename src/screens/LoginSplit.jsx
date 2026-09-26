import React, { useEffect, useState } from "react";
import { Asterisk } from "lucide-react";
import EmailPasswordForm from "./auth/EmailPasswordForm.jsx";
import { useT } from "../shared/i18n.jsx";

/* Trang đăng nhập / đăng ký — « lớp phủ trượt » (26/09).
 *
 * Máy tính (≥ md): hai form nằm cạnh nhau bên dưới, một tấm phủ xanh trượt
 * qua lại che một bên. Điện thoại: một form, chuyển bằng dòng chân trang —
 * cơ chế trượt cạnh nhau không đủ chỗ trên màn hẹp.
 *
 * Logic form (email/mật khẩu, Google, quên mật khẩu, lỗi, xác minh) nằm NGUYÊN
 * ở EmailPasswordForm — dùng chung với cửa bật lên LoginGate. Ở đây chỉ bố cục.
 *
 * Cách trượt (bố cục kinh điển của kiểu này):
 *  · Khoang đăng nhập ở nửa trái; khi sang đăng ký nó trượt sang phải và mờ đi.
 *  · Khoang đăng ký cũng đặt ở nửa trái nhưng ẩn; khi kích hoạt nó trượt sang
 *    nửa phải và hiện lên — nên luôn nằm ĐỐI DIỆN tấm phủ.
 *  · Tấm phủ ở nửa phải, trượt sang trái. Bên trong là một dải rộng 200% trượt
 *    NGƯỢC chiều, nên phần chữ đứng yên giữa tấm phủ trong lúc tấm phủ chạy.
 *
 * preflight TẮT: mọi tiêu đề `m-0`, mọi nút `border-0` + nền rõ ràng. */

const NUT_MA = "cursor-pointer rounded-full border-2 border-solid border-white bg-transparent px-8 py-2.5 font-sans text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:bg-white hover:text-blue-700 active:scale-95";

function useManRong() {
  const hoi = () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
  const [rong, setRong] = useState(hoi);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const doi = () => setRong(mq.matches);
    mq.addEventListener("change", doi);
    return () => mq.removeEventListener("change", doi);
  }, []);
  return rong;
}

function TieuDe({ t, mode }) {
  return (
    <>
      <Asterisk size={28} strokeWidth={2.6} className="text-blue-600 dark:text-blue-400" />
      <h1 className="m-0 mt-5 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
        {t(`login.title_${mode}`)}
      </h1>
      <p className="m-0 mt-2 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
        {t(`login.subtitle_${mode}`)}
      </p>
    </>
  );
}

export default function LoginSplit({ accounts = [], onLogin }) {
  const t = useT();
  const rong = useManRong();
  /* "login" | "register" | "reset". Khoang trái mang login HOẶC reset (quên
     mật khẩu là một nhánh của đăng nhập); khoang phải luôn là register. */
  const [mode, setMode] = useState("login");  const dangKy = mode === "register";
  const cheDoTrai = mode === "reset" ? "reset" : "login";

  const vo = "flex min-h-screen items-center justify-center bg-[#f4f7fa] p-4 font-sans text-ink transition-colors duration-300 dark:bg-[#131417]";
  const the = "relative w-full max-w-4xl overflow-hidden rounded-2xl border border-solid border-transparent bg-white shadow-2xl shadow-slate-200/60 transition-colors duration-300 dark:border-gray-800 dark:bg-[#1C1D22] dark:shadow-black/40";

  /* ── Điện thoại: một form, dòng chân trang để chuyển ── */
  if (!rong) {
    return (
      <div className={vo}>
        <div className={`${the} p-7`}>
          <TieuDe t={t} mode={mode} />
          <div className="mt-7">
            <EmailPasswordForm key={mode} accounts={accounts} onLogin={onLogin} mode={mode} onModeChange={setMode} autoFocus />
          </div>
          {mode !== "reset" && (
            <p className="m-0 mt-7 text-center text-sm font-medium text-slate-500 dark:text-gray-400">
              {dangKy ? t("login.have_account") : t("login.no_account")}{" "}
              <button type="button" onClick={() => setMode(dangKy ? "login" : "register")}
                className="cursor-pointer border-0 bg-transparent p-0 font-sans text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">
                {dangKy ? t("login.go_login") : t("login.go_register")}
              </button>
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ── Máy tính: hai khoang + tấm phủ trượt ── */
  const chuyen = "transition-all duration-700 ease-in-out motion-reduce:transition-none";
  return (
    <div className={vo}>
      <div className={`${the} h-[680px]`}>

        {/* Khoang đăng nhập (trái) */}
        <section aria-hidden={dangKy}
          className={`absolute inset-y-0 left-0 z-20 flex w-1/2 flex-col justify-center overflow-y-auto px-12 py-10 ${chuyen}
            ${dangKy ? "pointer-events-none translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}>
          <TieuDe t={t} mode={cheDoTrai} />
          <div className="mt-7">
            <EmailPasswordForm key={cheDoTrai} accounts={accounts} onLogin={onLogin} mode={cheDoTrai}
              onModeChange={setMode} autoFocus={!dangKy} idTruoc="dn-" />
          </div>
        </section>

        {/* Khoang đăng ký — đứng ở nửa trái khi ẩn, trượt sang phải khi hiện */}
        <section aria-hidden={!dangKy}
          className={`absolute inset-y-0 left-0 flex w-1/2 flex-col justify-center overflow-y-auto px-12 py-10 ${chuyen}
            ${dangKy ? "z-30 translate-x-full opacity-100" : "pointer-events-none z-10 translate-x-0 opacity-0"}`}>
          <TieuDe t={t} mode="register" />
          <div className="mt-7">
            <EmailPasswordForm key="register" accounts={accounts} onLogin={onLogin} mode="register"
              onModeChange={setMode} autoFocus={dangKy} idTruoc="dk-" />
          </div>
        </section>

        {/* Tấm phủ trượt */}
        <div className={`absolute inset-y-0 left-1/2 z-40 w-1/2 overflow-hidden ${chuyen} ${dangKy ? "-translate-x-full" : "translate-x-0"}`}>
          <div className={`relative -left-full h-full w-[200%] bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white ${chuyen}
            ${dangKy ? "translate-x-1/2" : "translate-x-0"}`}>
            <span aria-hidden className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute -bottom-20 right-10 h-80 w-80 rounded-full bg-indigo-400/40 blur-3xl" />

            {/* Nửa trái của dải — hiện khi đang ở ĐĂNG KÝ: mời quay lại đăng nhập */}
            <div className={`absolute inset-y-0 left-0 flex w-1/2 flex-col items-center justify-center px-14 text-center ${chuyen}
              ${dangKy ? "translate-x-0" : "-translate-x-[20%]"}`}>
              <h2 className="m-0 text-3xl font-extrabold tracking-tight">{t("login.slide_login_title")}</h2>
              <p className="m-0 mb-8 mt-4 text-sm leading-relaxed text-white/85">{t("login.slide_login_body")}</p>
              <button type="button" className={NUT_MA} onClick={() => setMode("login")}>{t("login.go_login")}</button>
            </div>

            {/* Nửa phải của dải — hiện khi đang ở ĐĂNG NHẬP: mời đăng ký */}
            <div className={`absolute inset-y-0 right-0 flex w-1/2 flex-col items-center justify-center px-14 text-center ${chuyen}
              ${dangKy ? "translate-x-[20%]" : "translate-x-0"}`}>
              <h2 className="m-0 text-3xl font-extrabold tracking-tight">{t("login.slide_register_title")}</h2>
              <p className="m-0 mb-8 mt-4 text-sm leading-relaxed text-white/85">{t("login.slide_register_body")}</p>
              <button type="button" className={NUT_MA} onClick={() => setMode("register")}>{t("login.go_register")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
