import React, { useEffect, useState } from "react";
import { Ban, Loader2, Unlock } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";

/* « Danh sách đen » (09/11, migration 197, theo chủ dự án).
 *
 * Giáo viên nhập email để chặn đăng nhập. Chặn ở tầng xác thực của Supabase (banned_until), nên
 * mọi cách đăng nhập đều bị từ chối, phiên đang mở bị xoá, và email đó không đăng ký lại được.
 * Không chặn được tài khoản giáo viên. Bỏ chặn thì người đó đăng nhập lại bình thường, dữ liệu
 * học tập vẫn nguyên (chặn không xoá gì).
 * `thu`: danh sách dựng sẵn cho /preview.html (không gọi mạng). */

const LOI = {
  SAI_DU_LIEU: () => tr("Email không hợp lệ.", "Adresse e-mail invalide.", "Invalid email."),
  KHONG_CHAN_CHINH_MINH: () => tr("Không thể chặn chính tài khoản của bạn.", "Impossible de bloquer votre propre compte.", "You can't block your own account."),
  KHONG_CHAN_GIAO_VIEN: () => tr("Không chặn được tài khoản giáo viên.", "Impossible de bloquer un compte enseignant.", "Teacher accounts can't be blocked."),
  CHI_GIAO_VIEN: () => tr("Chỉ giáo viên mới dùng được mục này.", "Réservé aux enseignants.", "Teachers only."),
};
const dichLoi = (e) => {
  const ma = Object.keys(LOI).find((k) => String(e?.message ?? "").includes(k));
  return ma ? LOI[ma]() : (e?.message ?? tr("Không thực hiện được.", "Action impossible.", "Could not do that."));
};

export default function DanhSachDen({ thu }) {
  const [ds, setDs] = useState(thu ?? null);
  const [email, setEmail] = useState("");
  const [lyDo, setLyDo] = useState("");
  const [dang, setDang] = useState(null);   // "chan" | id đang bỏ chặn
  const [loi, setLoi] = useState("");
  const [baoXong, setBaoXong] = useState("");

  const tai = async () => {
    if (thu) return;
    const { data, error } = await supabase.from("danh_sach_den").select("id, email, user_id, ly_do, chan_luc").order("chan_luc", { ascending: false });
    if (error) { setLoi(error.message); setDs([]); return; }
    setDs(data ?? []);
  };
  useEffect(() => { tai(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chan = async (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setLoi(LOI.SAI_DU_LIEU()); return; }
    if (!window.confirm(tr(`Chặn đăng nhập ${em}? Người này bị đăng xuất và không vào được nữa cho tới khi bạn bỏ chặn.`, `Bloquer ${em} ? La personne sera déconnectée jusqu'au déblocage.`, `Block ${em}? They will be signed out until you unblock them.`))) return;
    setDang("chan"); setLoi(""); setBaoXong("");
    const { data, error } = thu ? { data: { ok: true, co_tai_khoan: true } } : await supabase.rpc("chan_tai_khoan", { p_email: em, p_ly_do: lyDo.trim() });
    setDang(null);
    if (error || !data?.ok) { setLoi(dichLoi(error)); return; }
    setBaoXong(data.co_tai_khoan
      ? tr(`Đã chặn ${em}. Các phiên đang mở đã bị xoá.`, `${em} est bloqué. Ses sessions ont été fermées.`, `${em} is blocked. Their sessions were closed.`)
      : tr(`Đã chặn ${em}. Email này chưa có tài khoản và sẽ không đăng ký được.`, `${em} est bloqué. Aucun compte n'existe ; l'inscription sera refusée.`, `${em} is blocked. No account exists yet; sign-up will be refused.`));
    setEmail(""); setLyDo("");
    if (thu) setDs((x) => [{ id: Date.now(), email: em, user_id: "x", ly_do: lyDo.trim(), chan_luc: new Date().toISOString() }, ...(x ?? [])]);
    else tai();
  };

  const boChan = async (r) => {
    if (!window.confirm(tr(`Bỏ chặn ${r.email}?`, `Débloquer ${r.email} ?`, `Unblock ${r.email}?`))) return;
    setDang(r.id); setLoi(""); setBaoXong("");
    const { data, error } = thu ? { data: { ok: true } } : await supabase.rpc("bo_chan_tai_khoan", { p_id: r.id });
    setDang(null);
    if (error || !data?.ok) { setLoi(dichLoi(error)); return; }
    setBaoXong(tr(`Đã bỏ chặn ${r.email}.`, `${r.email} est débloqué.`, `${r.email} is unblocked.`));
    if (thu) setDs((x) => x.filter((y) => y.id !== r.id)); else tai();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <h1 className="m-0 flex items-center gap-2 text-2xl font-extrabold text-ink"><Ban size={22} className="text-danger" /> {tr("Danh sách đen", "Liste noire", "Blocklist")}</h1>
      <p className="m-0 mt-1 text-sm text-soft">{tr("Email trong danh sách không đăng nhập được, kể cả bằng Google, và không đăng ký tài khoản mới được. Dữ liệu học tập của người đó vẫn giữ nguyên.", "Les adresses listées ne peuvent ni se connecter (Google compris) ni créer de compte. Leurs données sont conservées.", "Listed emails can't sign in (Google included) or create an account. Their data is kept.")}</p>

      <form onSubmit={chan} className="mt-5 grid gap-3 rounded-2xl border border-solid border-line bg-surface p-4">
        <label className="grid gap-1.5">
          <span className="text-xs font-extrabold text-ink">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten@vidu.com" autoComplete="off"
            className="rounded-xl border border-solid border-line bg-surface2 px-3 py-2 font-sans text-sm text-ink" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-extrabold text-ink">{tr("Lý do (không bắt buộc, chỉ giáo viên thấy)", "Motif (facultatif, visible des enseignants)", "Reason (optional, teachers only)")}</span>
          <input type="text" value={lyDo} onChange={(e) => setLyDo(e.target.value.slice(0, 500))}
            className="rounded-xl border border-solid border-line bg-surface2 px-3 py-2 font-sans text-sm text-ink" />
        </label>
        <button type="submit" disabled={dang === "chan"}
          className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-full border-0 bg-danger px-4 py-2 font-sans text-sm font-extrabold text-white disabled:opacity-60">
          {dang === "chan" ? <Loader2 size={15} className="mcf-spin" /> : <Ban size={15} />} {tr("Chặn đăng nhập", "Bloquer", "Block sign-in")}
        </button>
      </form>

      {loi && <p className="m-0 mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger">{loi}</p>}
      {baoXong && <p className="m-0 mt-4 rounded-xl bg-ok-soft p-3 text-sm text-ok">{baoXong}</p>}

      {ds === null ? <p className="m-0 mt-6 text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
        : ds.length === 0 ? <p className="m-0 mt-6 rounded-2xl bg-surface p-6 text-center text-sm text-soft">{tr("Chưa chặn email nào.", "Aucune adresse bloquée.", "No blocked emails.")}</p>
        : (
          <ul className="m-0 mt-5 grid list-none gap-2 p-0">
            {ds.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-solid border-line bg-surface px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-sm font-bold text-ink">{r.email}</p>
                  <p className="m-0 text-xs text-soft">
                    {new Date(r.chan_luc).toLocaleString()} · {r.user_id ? tr("có tài khoản", "compte existant", "has an account") : tr("chưa có tài khoản", "aucun compte", "no account")}
                    {r.ly_do ? ` · ${r.ly_do}` : ""}
                  </p>
                </div>
                <button type="button" onClick={() => boChan(r)} disabled={dang === r.id}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-solid border-line bg-surface px-3 py-1.5 font-sans text-xs font-bold text-ink disabled:opacity-60">
                  {dang === r.id ? <Loader2 size={13} className="mcf-spin" /> : <Unlock size={13} />} {tr("Bỏ chặn", "Débloquer", "Unblock")}
                </button>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
