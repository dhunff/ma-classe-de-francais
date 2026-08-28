import React, { useEffect, useRef, useState } from "react";
import { User, Lock, LogOut, Calendar, Pencil, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { useT } from "../../shared/i18n.jsx";
import { loadHoSo, luuHoSo } from "../../shared/profileStore.js";
import { emptyProfile, calculateProfileCompletion, validateProfile, LEVELS_PROFILE, GOALS_PROFILE } from "../../shared/profile.js";
import { Avatar } from "../../shared/avatars.jsx";
import { ChonAvatar, ONhapUsername } from "./DanhTinh.jsx";
import { loadDanhTinh, luuDanhTinh, usernameConTrong } from "../../shared/identity.js";
import { chuanHoaUsername, kiemUsername, goiYUsername, TEN_HIEN_THI_TOI_DA }
  from "../../shared/identityRules.js";

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

  /* ── Danh tính: ba trường nằm ở BẢNG `profiles`, không phải blob ──
     Lý do đầy đủ ở đầu shared/identity.js. Tóm tắt: `username` phải duy nhất
     toàn hệ thống, mà Postgres không nhìn được vào bên trong một cột JSON. */
  const [dt, setDt] = useState({ display_name: "", username: "", avatar: "" });
  const [dtGoc, setDtGoc] = useState({ username: "" });
  const [chuaCoCot, setChuaCoCot] = useState(false);
  /* Cờ riêng cho hồ sơ mở rộng: 046 và 048 là hai migration khác nhau, và
     database có thể chạy cái này mà chưa chạy cái kia. Gộp thành một cờ thì
     người vận hành đọc thông báo rồi đi chạy nhầm file. */
  const [chuaCoCotHoSo, setChuaCoCotHoSo] = useState(false);
  const [moChonAvatar, setMoChonAvatar] = useState(false);
  const [loiDt, setLoiDt] = useState("");
  const [loiHoSo, setLoiHoSo] = useState("");
  const oUsername = useRef(null);

  useEffect(() => {
    (async () => {
      /* Hai lời gọi, chạy song song. Cả hai đọc cùng một DÒNG `profiles` —
         gộp thành một câu select được, nhưng khi đó một cột thiếu ở phía này
         làm hỏng luôn phía kia: PostgREST trả 42703 và HUỶ CẢ CÂU. Tách ra thì
         database chạy 046 mà chưa chạy 048 chỉ mất một nửa trang, và nửa còn
         lại nói rõ mình thiếu gì. */
      const [hoSo, danhTinh] = await Promise.all([
        loadHoSo(),
        loadDanhTinh(),
      ]);
      if (hoSo) {
        const { chuaCoCot: thieuCot, ...truong } = hoSo;
        setP({ ...emptyProfile(), ...truong });
        setChuaCoCotHoSo(!!thieuCot);
      }
      if (danhTinh) {
        setDt({
          display_name: danhTinh.display_name || "",
          username: danhTinh.username || "",
          avatar: danhTinh.avatar || "",
        });
        setDtGoc({ username: danhTinh.username || "" });
        setChuaCoCot(!!danhTinh.chuaCoCot);
      }
      setLoading(false);
    })();
  }, [name]);

  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const setDtK = (k) => (v) => setDt((cu) => ({ ...cu, [k]: v }));
  const pct = calculateProfileCompletion(p);

  /* Tên hiển thị trong thẻ bên trái: ưu tiên tên tự đặt, lùi về tên tài khoản.
     Chưa đặt thì KHÔNG hiện ô trống — người dùng cần thấy mình là ai. */
  const tenHienThi = (dt.display_name || "").trim() || name;

  const submit = async (e) => {
    e.preventDefault();
    setLoiDt("");
    setLoiHoSo("");
    const found = validateProfile(p);
    setErrs(found);
    if (Object.keys(found).length) return;

    /* ── Kiểm username lần cuối TRƯỚC khi ghi ──
     *
     * Bộ kiểm có hoãn trong ô nhập là để tử tế với người dùng, không phải để
     * bảo đảm đúng: giữa lần hỏi cuối và lúc bấm Lưu vẫn có một khoảng, và
     * người dùng có thể bấm Lưu trước khi 500ms trôi qua. Hỏi lại ở đây, và
     * ràng buộc `unique` trong database là lớp cuối cùng — ba lớp cho một
     * thứ, vì hai người trùng `@username` là hỏng không sửa được từ giao diện.
     *
     * NÚT LƯU KHÔNG BỊ `disabled`. Bản mô tả yêu cầu khoá nút khi username
     * không hợp lệ; dự án này đã trả giá cho kiểu đó (xem CLAUDE.md, thanh
     * trượt tự chấm): nút xám bấm không được là ngõ cụt câm — người dùng
     * không biết vì sao, và nếu giao diện tính sai trạng thái thì họ mắc kẹt
     * vĩnh viễn. Thay vào đó nút vẫn bấm được, và khi có vấn đề thì nó CUỘN
     * TỚI và tô sáng đúng ô đang cản. */
    const dang = kiemUsername(dt.username);
    if (!dang.ok) {
      setLoiDt(t(`identity.bad_${dang.loi}`));
      oUsername.current?.focus();
      oUsername.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setSaving(true);

    if (dang.username && dang.username !== chuanHoaUsername(dtGoc.username)) {
      const con = await usernameConTrong(dang.username);
      if (con === false) {
        setSaving(false);
        setLoiDt(t("identity.err_username_taken"));
        oUsername.current?.focus();
        oUsername.current?.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      /* `con === null` (hỏi không được) thì VẪN gửi. Ràng buộc unique sẽ từ
         chối nếu trùng thật, và khi đó ta có câu trả lời chắc chắn thay vì
         chặn người dùng vì mạng chập chờn. */
    }

    /* Hồ sơ mở rộng đi qua RPC `update_my_profile`, ghi vào chín cột trên
       dòng của chính mình. Không còn bước "đọc lại rồi ghi đè cả object" —
       chuyện đó cần thiết khi cả lớp chung một blob, và chính nó là lỗ hổng:
       ai cũng ghi đè được hồ sơ của người khác. Xem migration 048.

       Ghi TRƯỚC danh tính vì nếu hai lời gọi mà một cái hỏng thì trường hợp dễ
       hiểu hơn là "hồ sơ đã lưu, tên chưa" — người dùng đang nhìn thẳng vào ô
       tên và thấy nó chưa đổi. Ngược lại thì họ không có gì để nhìn. */
    const kqHoSo = await luuHoSo(p);
    if (!kqHoSo.ok) {
      setSaving(false);
      /* Lỗi hồ sơ hiện cạnh NÚT LƯU, không phải trong khối danh tính. Cùng một
         câu chữ đặt sai chỗ là một chỉ dẫn sai: người dùng sẽ đi sửa ô
         @username trong khi thứ hỏng là ngày sinh. */
      setLoiHoSo(t(`identity.err_${kqHoSo.loi}`));
      return;
    }

    /* Ghi danh tính đi qua RPC `update_my_identity`, KHÔNG phải `.update()`:
       RLS phân quyền theo dòng, nên cho học sinh ghi dòng của mình là cho họ
       tự đặt `role = 'prof'`. Xem migration 046. */
    const kq = await luuDanhTinh({
      displayName: dt.display_name,
      username: dt.username,
      avatar: dt.avatar,
    });

    setSaving(false);

    if (!kq.ok) {
      setLoiDt(t(`identity.err_${kq.loi}`));
      if (kq.loi === "username_taken" || kq.loi === "username_invalid") {
        oUsername.current?.focus();
        oUsername.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      return;
    }

    setDtGoc({ username: chuanHoaUsername(dt.username) });
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
            {/* Nút sửa ảnh KHÔNG còn `disabled`. Trước đây nó xám và có
                `title` giải thích — nhưng `title` chỉ hiện khi rê chuột, tức
                là không bao giờ hiện trên điện thoại, nên với một nửa người
                dùng đó là một nút bấm vào không có gì xảy ra. Giờ nó mở hộp
                chọn con vật. */}
            <span className="relative">
              <button
                type="button"
                onClick={() => setMoChonAvatar(true)}
                aria-label={t("identity.avatar_change")}
                className="grid cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 transition hover:opacity-90"
              >
                <Avatar khoa={dt.avatar} ten={tenHienThi} size={96} />
              </button>
              <span aria-hidden
                className="pointer-events-none absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-primary text-on-primary shadow-md">
                <Pencil size={14} />
              </span>
            </span>

            <p className="m-0 mt-4 text-lg font-bold text-ink">{tenHienThi}</p>
            {/* @username dưới tên, như mọi nơi khác trên internet. Chưa đặt thì
                không hiện một dấu « @ » trơ trọi. */}
            {dt.username && <p className="m-0 mt-0.5 text-sm font-semibold text-primary">@{dt.username}</p>}
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
                {/* ─────────── Danh tính ─────────── */}
                <div className="mt-6 rounded-2xl bg-surface2/60 p-5">
                  <h2 className="m-0 text-sm font-bold uppercase tracking-wider text-soft">
                    {t("identity.identity_title")}
                  </h2>

                  {/* Migration 046 chưa chạy: nói thẳng thay vì để người dùng
                      gõ xong rồi nhận lỗi lúc bấm Lưu. Quy tắc 1 — trạng thái
                      rỗng phải nói rõ lý do. */}
                  {chuaCoCot && (
                    <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-warn-soft p-3 text-xs font-semibold text-warn">
                      <AlertTriangle size={14} className="mt-px shrink-0" />
                      {t("identity.chua_co_cot")}
                    </p>
                  )}

                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <div>
                      <span className={LABEL}>{t("identity.display_name")}</span>
                      <input
                        className={INPUT}
                        value={dt.display_name}
                        maxLength={TEN_HIEN_THI_TOI_DA}
                        placeholder={t("identity.display_name_ph")}
                        autoComplete="nickname"
                        onChange={(e) => setDtK("display_name")(e.target.value)}
                        /* Gợi ý username từ tên hiển thị, nhưng CHỈ khi ô
                           username còn trống. Đè lên thứ người dùng đã tự gõ
                           là lấy mất quyền quyết định của họ. */
                        onBlur={() => {
                          if (!dt.username) {
                            const g = goiYUsername(dt.display_name);
                            if (g) setDtK("username")(g);
                          }
                        }}
                      />
                      <p className="m-0 mt-1 min-h-[1.1rem] text-xs text-soft">
                        {t("identity.display_name_help")}
                      </p>
                    </div>

                    <ONhapUsername
                      giaTri={dt.username}
                      datGiaTri={setDtK("username")}
                      usernameHienTai={dtGoc.username}
                      tuTro={oUsername}
                      hoiConTrong={usernameConTrong}
                    />
                  </div>

                  {loiDt && (
                    <p className="m-0 mt-2 flex items-start gap-2 text-xs font-bold text-danger">
                      <AlertTriangle size={14} className="mt-px shrink-0" /> {loiDt}
                    </p>
                  )}
                </div>

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

                {/* Migration 048 chưa chạy: nói thẳng thay vì để người dùng
                    điền xong rồi nhận lỗi lúc bấm Lưu. Quy tắc 1 — trạng thái
                    rỗng phải nói rõ lý do. */}
                {chuaCoCotHoSo && (
                  <p className="m-0 mt-6 flex items-start gap-2 rounded-xl bg-warn-soft p-3 text-xs font-semibold text-warn">
                    <AlertTriangle size={14} className="mt-px shrink-0" />
                    {t("identity.chua_co_cot_ho_so")}
                  </p>
                )}

                {loiHoSo && (
                  <p className="m-0 mt-6 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs font-bold text-danger">
                    <AlertTriangle size={14} className="mt-px shrink-0" /> {loiHoSo}
                  </p>
                )}

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

      {/* Xem trước NGAY khi chọn, chưa ghi xuống database — người dùng còn phải
          bấm Lưu. Đóng hộp lại là thấy con vật mới trong thẻ bên trái. */}
      {moChonAvatar && (
        <ChonAvatar
          dangChon={dt.avatar}
          ten={tenHienThi}
          chon={(k) => { setDtK("avatar")(k); setMoChonAvatar(false); }}
          dong={() => setMoChonAvatar(false)}
        />
      )}
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
