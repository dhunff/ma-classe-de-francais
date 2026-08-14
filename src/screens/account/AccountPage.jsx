import React, { useEffect, useState } from "react";
import { User, Lock, LogOut, Calendar, Pencil, CheckCircle2, Loader2 } from "lucide-react";
import { load, save } from "../../shared/storage.js";
import { useT } from "../../shared/i18n.jsx";
import { emptyProfile, calculateProfileCompletion, validateProfile, LEVELS_PROFILE, GOALS_PROFILE } from "../../shared/profile.js";

/* Trang "Mon Compte" — hai cột: thẻ nhận dạng bên trái, biểu mẫu bên phải.

   MÀU đi qua token (surface/ink/soft/primary) chứ không phải bảng slate cứng
   như bản mô tả gọi tên. Token tự đảo ở bản tối và được check-design đo tương
   phản; một bảng màu song song ở đây sẽ khiến trang này lệch tông với phần
   còn lại trong bản tối.

   TRƯỜNG DỮ LIỆU: bản mô tả liệt kê giới tính, họ, tên, địa chỉ và bỏ `goal`,
   `level`, `school`. Không bỏ được — `goal` đang hiện trên trang chủ và cả ba
   nuôi thanh "hồ sơ hoàn thiện". Bỏ khỏi form nghĩa là không còn chỗ nào đặt
   chúng, và phần trăm tính trên những trường không ai điền được. Nên trang
   này có cả hai nhóm: phần nhận dạng mới, và phần học tập vốn có.

   Preflight bị tắt nên mọi input/button đều phải tự đặt border và nền. */

const INPUT =
  "w-full rounded-xl border-0 bg-surface2 px-4 py-3 text-sm font-medium text-ink " +
  "outline-none transition placeholder:text-soft focus:ring-2 focus:ring-primary/50";
const LABEL = "mb-1.5 block text-sm text-soft";

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <span className={LABEL}>{label}</span>
      {children}
    </div>
  );
}

function TabButton({ Icon, children, active, danger, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full cursor-pointer items-center gap-3 rounded-2xl border-0 px-4 py-3 text-left text-sm transition-colors",
        danger
          ? "bg-transparent font-medium text-soft hover:bg-danger-soft hover:text-danger"
          : active
            ? "bg-primary-soft font-bold text-primary"
            : "bg-transparent font-medium text-soft hover:bg-surface2 hover:text-ink",
      ].join(" ")}
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  );
}

export default function AccountPage({ name, role, email, emailVerified, onLogout, changePw }) {
  const t = useT();
  const [tab, setTab] = useState("infos");
  const [p, setP] = useState(emptyProfile());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errs, setErrs] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      const all = await load("mcf-profiles", {});
      setP({ ...emptyProfile(), ...((all && all[name]) || {}) });
      setLoading(false);
    })();
  }, [name]);

  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const pct = calculateProfileCompletion(p);

  const submit = async (e) => {
    e.preventDefault();
    const found = validateProfile(p);
    setErrs(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    /* Đọc lại rồi mới ghi: hồ sơ của cả lớp nằm chung một object, nên ghi đè
       bằng bản đã tải lúc mở trang sẽ xoá thay đổi của người khác trong lúc
       mình đang mở form. */
    const all = await load("mcf-profiles", {});
    await save("mcf-profiles", { ...all, [name]: p });
    setSaving(false);
    setToast(t("account.saved"));
    setTimeout(() => setToast(""), 2500);
  };

  const roleLabel = role === "prof" ? t("header.teacher") : t("header.student");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">

      {/* ─────────────── Cột trái: nhận dạng + điều hướng ─────────────── */}
      <aside className="w-full shrink-0 lg:w-80">
        <div className="rounded-3xl bg-surface p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <span className="relative">
              <span aria-hidden className="grid h-24 w-24 place-items-center rounded-full bg-primary text-3xl font-extrabold text-on-primary">
                {(name || "?").trim().charAt(0).toUpperCase()}
              </span>
              {/* Nút sửa ảnh: hệ thống chưa có chỗ lưu ảnh đại diện, nên nó
                  không làm gì. Để `disabled` và nói rõ, thay vì một nút bấm
                  vào im lặng. */}
              <button
                type="button"
                disabled
                title={t("account.avatar_soon")}
                className="absolute bottom-0 right-0 grid h-8 w-8 cursor-not-allowed place-items-center rounded-full border-0 bg-primary text-on-primary opacity-60 shadow-md"
              >
                <Pencil size={14} />
              </button>
            </span>

            <p className="m-0 mt-4 text-lg font-bold text-ink">{name}</p>
            <p className="m-0 mt-0.5 text-sm text-soft">{roleLabel}</p>

            {pct < 100 && (
              <p className="m-0 mt-3 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                {t("account.completed", { pct })}
              </p>
            )}
          </div>

          <nav className="mt-6 flex flex-col gap-1">
            <TabButton Icon={User} active={tab === "infos"} onClick={() => setTab("infos")}>
              {t("account.nav_info")}
            </TabButton>
            <TabButton Icon={Lock} active={tab === "security"} onClick={() => setTab("security")}>
              {t("account.nav_security")}
            </TabButton>
            <TabButton Icon={LogOut} danger onClick={onLogout}>
              {t("account.logout")}
            </TabButton>
          </nav>
        </div>
      </aside>

      {/* ─────────────── Cột phải: biểu mẫu ─────────────── */}
      <section className="min-w-0 flex-1 rounded-3xl bg-surface p-8 shadow-sm">
        {tab === "infos" ? (
          <form onSubmit={submit}>
            <h1 className="m-0 text-2xl font-bold text-ink">{t("account.title")}</h1>

            {loading ? (
              <p className="mt-6 flex items-center gap-2 text-sm text-soft">
                <Loader2 size={16} className="mcf-spin" /> {t("account.loading")}
              </p>
            ) : (
              <>
                <div className="mt-6">
                  <span className={LABEL}>{t("account.gender")}</span>
                  <div className="flex flex-wrap gap-4">
                    {/* Giá trị lưu xuống ("homme"/"femme"/"autre") KHÔNG dịch
                        — đó là dữ liệu trong kho, đổi theo ngôn ngữ đang chọn
                        thì hồ sơ cũ đọc bằng thứ tiếng khác sẽ không khớp. */}
                    {[["homme", t("account.male")], ["femme", t("account.female")], ["autre", t("account.other")]].map(([v, l]) => (
                      <label key={v} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
                        <input type="radio" name="genre" value={v} checked={p.genre === v}
                          onChange={() => setP({ ...p, genre: v })}
                          className="h-4 w-4 accent-[color:var(--mcf-primary)]" />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field label={t("account.first_name")}>
                    <input className={INPUT} value={p.prenom || ""} onChange={set("prenom")} autoComplete="given-name" />
                  </Field>
                  <Field label={t("account.last_name")}>
                    <input className={INPUT} value={p.nom || ""} onChange={set("nom")} autoComplete="family-name" />
                  </Field>
                </div>

                <div className="mt-5">
                  <span className={LABEL}>{t("account.email")}</span>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Email đến từ tài khoản đăng nhập, không sửa ở đây được —
                        đổi email là đổi danh tính đăng nhập, phải qua Supabase. */}
                    <input className={`${INPUT} flex-1`} value={email || ""} readOnly disabled />
                    {emailVerified ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-ok-soft px-3 py-1.5 text-xs font-bold text-ok">
                        <CheckCircle2 size={13} /> {t("account.verified")}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-warn-soft px-3 py-1.5 text-xs font-bold text-warn">
                        {t("account.non_verified")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <Field label={t("account.address")}>
                    <input className={INPUT} value={p.adresse || ""} onChange={set("adresse")} autoComplete="street-address" />
                  </Field>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field label={t("account.phone")}>
                    <input className={INPUT} value={p.phone || ""} onChange={set("phone")} autoComplete="tel" />
                    {errs.phone && <p className="m-0 mt-1 text-xs font-semibold text-danger">{errs.phone}</p>}
                  </Field>
                  <Field label={t("account.dob")}>
                    <span className="relative block">
                      <input type="date" className={`${INPUT} pr-10`} value={p.dob || ""} onChange={set("dob")} />
                      <Calendar size={16} aria-hidden
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-soft" />
                    </span>
                    {errs.dob && <p className="m-0 mt-1 text-xs font-semibold text-danger">{errs.dob}</p>}
                  </Field>
                </div>

                {/* Phần học tập. Bản mô tả không nhắc tới, nhưng `goal` đang
                    hiện trên trang chủ và cả ba trường nuôi thanh hoàn thiện —
                    bỏ khỏi đây là không còn chỗ nào đặt chúng. */}
                <div className="mt-8 border-0 border-t border-solid border-line pt-6">
                  <h2 className="m-0 text-sm font-bold uppercase tracking-wider text-soft">{t("account.parcours")}</h2>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <Field label={t("account.level")}>
                      <select className={INPUT} value={p.level || ""} onChange={set("level")}>
                        <option value="">—</option>
                        {LEVELS_PROFILE.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </Field>
                    <Field label={t("account.goal")}>
                      <select className={INPUT} value={p.goal || ""} onChange={set("goal")}>
                        <option value="">—</option>
                        {GOALS_PROFILE.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="mt-5">
                    <Field label={t("account.school")}>
                      <input className={INPUT} value={p.school || ""} onChange={set("school")} />
                      {errs.school && <p className="m-0 mt-1 text-xs font-semibold text-danger">{errs.school}</p>}
                    </Field>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
                  {toast && <span className="mr-auto text-sm font-bold text-ok">{toast}</span>}
                  <button type="button" onClick={() => window.location.reload()}
                    className="cursor-pointer rounded-xl border-0 bg-transparent px-5 py-3 font-[inherit] text-sm font-semibold text-soft transition-colors hover:bg-surface2 hover:text-ink">
                    {t("account.cancel")}
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-primary px-6 py-3 font-[inherit] text-sm font-bold text-on-primary shadow-lg shadow-primary/30 transition hover:opacity-90 disabled:opacity-60">
                    {saving && <Loader2 size={15} className="mcf-spin" />}
                    {t("account.save")}
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          <SecurityTab changePw={changePw} />
        )}
      </section>
    </div>
  );
}

function SecurityTab({ changePw }) {
  const t = useT();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await changePw(oldPw, newPw, setMsg);
    setBusy(false);
    setOldPw(""); setNewPw("");
  };

  return (
    <form onSubmit={submit}>
      <h1 className="m-0 text-2xl font-bold text-ink">{t("account.security_title")}</h1>
      <div className="mt-6 grid max-w-md gap-5">
        <Field label={t("account.current_pw")}>
          <input type="password" className={INPUT} value={oldPw} onChange={(e) => setOldPw(e.target.value)} autoComplete="current-password" />
        </Field>
        <Field label={t("account.new_pw")}>
          <input type="password" className={INPUT} value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" />
        </Field>
        {msg && <p className="m-0 text-sm font-semibold text-ink">{msg}</p>}
        <div>
          <button type="submit" disabled={busy}
            className="flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-primary px-6 py-3 font-[inherit] text-sm font-bold text-on-primary shadow-lg shadow-primary/30 transition hover:opacity-90 disabled:opacity-60">
            {busy && <Loader2 size={15} className="mcf-spin" />}
            {t("account.save")}
          </button>
        </div>
      </div>
    </form>
  );
}
