/* Xoá tài khoản (20/11/2026, theo chủ dự án). Khối cuối tab Bảo mật của trang Tài khoản.
 *
 * Chỉ học sinh tự xoá được. Tài khoản giáo viên thấy lời nhắn liên hệ thay vì nút: xoá nhầm là mất đề,
 * lớp, quyền chấm. Edge Function `xoa-tai-khoan` kiểm lại vai trò ở máy chủ, nên ẩn nút ở đây chỉ là
 * cho gọn, không phải lớp bảo vệ.
 *
 * Hộp xác nhận bắt gõ một từ (XOA / SUPPRIMER / DELETE theo ngôn ngữ) để không xoá vì bấm nhầm.
 * Xoá xong thì đăng xuất. */
import React, { useEffect, useRef, useState } from "react";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { supabase } from "../../storageShim.js";

const LOI = {
  CHUA_DANG_NHAP: () => tr("Phiên đăng nhập đã hết. Đăng nhập lại rồi thử lần nữa.", "Session expirée. Reconnectez-vous puis réessayez.", "Your session expired. Sign in again and retry."),
  KHONG_PHAI_HOC_SINH: () => tr("Tài khoản giáo viên không tự xoá được. Hãy liên hệ FRACILE.", "Un compte professeur ne peut pas être supprimé ici. Contactez FRACILE.", "Teacher accounts can't be deleted here. Contact FRACILE."),
  XOA_HONG: () => tr("Chưa xoá được tài khoản. Dữ liệu vẫn còn nguyên, bạn thử lại sau ít phút.", "La suppression a échoué. Vos données sont intactes, réessayez dans quelques minutes.", "Deletion failed. Your data is intact; try again in a few minutes."),
};

export default function XoaTaiKhoan({ role, onLogout }) {
  const [mo, setMo] = useState(false);

  if (role === "prof") {
    return (
      <section className="rounded-2xl border border-solid border-line bg-surface p-5 sm:p-6">
        <h2 className="m-0 text-base font-extrabold text-ink">{tr("Xoá tài khoản", "Supprimer le compte", "Delete account")}</h2>
        <p className="m-0 mt-1 text-sm text-soft">{tr("Tài khoản giáo viên gắn với đề thi và lớp học nên không tự xoá ở đây. Muốn xoá, hãy liên hệ FRACILE.", "Un compte professeur est lié aux examens et aux classes : il ne se supprime pas ici. Contactez FRACILE.", "Teacher accounts are tied to exams and classes, so they can't be deleted here. Contact FRACILE.")}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-solid border-danger/40 bg-surface p-5 sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger"><Trash2 size={19} /></span>
          <div className="min-w-0">
            <h2 className="m-0 text-base font-extrabold text-ink">{tr("Xoá tài khoản", "Supprimer le compte", "Delete account")}</h2>
            <p className="m-0 mt-0.5 text-xs text-soft">{tr("Xoá vĩnh viễn tài khoản và toàn bộ dữ liệu học của bạn. Không khôi phục được.", "Supprime définitivement votre compte et toutes vos données. Irréversible.", "Permanently deletes your account and all your learning data. This can't be undone.")}</p>
          </div>
        </div>
        <button type="button" onClick={() => setMo(true)}
          className="shrink-0 cursor-pointer rounded-xl border border-solid border-danger bg-transparent px-5 py-2.5 font-[inherit] text-sm font-bold text-danger transition hover:bg-danger-soft">
          {tr("Xoá tài khoản", "Supprimer le compte", "Delete account")}
        </button>
      </div>
      {mo && <HopXacNhan dong={() => setMo(false)} onLogout={onLogout} />}
    </section>
  );
}

function HopXacNhan({ dong, onLogout }) {
  const tu = tr("XOA", "SUPPRIMER", "DELETE");
  const [go, setGo] = useState("");
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState("");
  const [xong, setXong] = useState(false);
  const o = useRef(null);
  const khop = go.trim().toUpperCase() === tu;

  useEffect(() => {
    o.current?.focus();
    const esc = (e) => { if (e.key === "Escape" && !dang && !xong) dong(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [dang, xong, dong]);

  const xoa = async (e) => {
    e.preventDefault();
    if (!khop || dang) return;
    setDang(true); setLoi("");
    const { data, error } = await supabase.functions.invoke("xoa-tai-khoan", { body: { xacNhan: true } });
    if (error || !data?.ok) {
      let ma = data?.ma;
      try { ma = ma || (await error?.context?.json?.())?.ma; } catch { /* không đọc được thân lỗi */ }
      setLoi((LOI[ma] ?? LOI.XOA_HONG)());
      setDang(false);
      return;
    }
    setXong(true);
    setTimeout(async () => { try { await supabase.auth.signOut(); } catch { /* phiên đã mất cùng tài khoản */ } onLogout?.(); }, 1800);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="xoa-tk-tieu-de"
      className="fixed inset-0 z-[400] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onClick={() => { if (!dang && !xong) dong(); }}>
      <form onSubmit={xoa} onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-surface p-6 shadow-[0_24px_60px_rgb(0,0,0,0.3)]">
        {xong ? (
          <div className="py-4 text-center">
            <p id="xoa-tk-tieu-de" className="m-0 text-lg font-extrabold text-ink">{tr("Đã xoá tài khoản", "Compte supprimé", "Account deleted")}</p>
            <p className="m-0 mt-2 text-sm text-soft">{tr("Dữ liệu của bạn đã được xoá. Đang đăng xuất…", "Vos données ont été supprimées. Déconnexion…", "Your data has been deleted. Signing out…")}</p>
          </div>
        ) : (
          <>
            {!dang && (
              <button type="button" onClick={dong} aria-label={tr("Đóng", "Fermer", "Close")}
                className="absolute right-4 top-4 grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-soft hover:bg-surface2"><X size={18} /></button>
            )}
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-danger-soft text-danger"><AlertTriangle size={22} /></span>
            <h2 id="xoa-tk-tieu-de" className="m-0 mt-4 text-lg font-extrabold text-ink">{tr("Xoá vĩnh viễn tài khoản?", "Supprimer définitivement le compte ?", "Permanently delete your account?")}</h2>
            <p className="m-0 mt-2 text-sm text-soft">{tr("Những thứ sau sẽ bị xoá và không lấy lại được:", "Ceci sera supprimé sans retour possible :", "The following will be deleted for good:")}</p>
            <ul className="m-0 mt-2 grid gap-1 pl-5 text-sm text-ink">
              <li>{tr("Hồ sơ, ảnh đại diện, tên người dùng", "Profil, avatar, nom d'utilisateur", "Profile, avatar, username")}</li>
              <li>{tr("Bài làm, kết quả thi thử, bài viết và bản ghi âm bài nói", "Copies, résultats d'examens blancs, textes et enregistrements oraux", "Answers, mock exam results, writing and speaking recordings")}</li>
              <li>{tr("Sổ từ, thẻ ôn tập, chuỗi ngày học, lịch sử hỏi Léon", "Carnet de mots, cartes, série de jours, historique Léon", "Word book, flashcards, streak, Léon chat history")}</li>
              <li>{tr("Gói VIP còn hạn và lịch sử thanh toán", "Abonnement VIP en cours et historique de paiement", "Any active VIP plan and payment history")}</li>
            </ul>
            <label className="mt-5 block text-sm font-semibold text-ink" htmlFor="xoa-tk-go">
              {tr("Gõ ", "Tapez ", "Type ")}<strong className="text-danger">{tu}</strong>{tr(" để xác nhận", " pour confirmer", " to confirm")}
            </label>
            <input id="xoa-tk-go" ref={o} value={go} onChange={(e) => setGo(e.target.value)} disabled={dang} autoComplete="off" spellCheck={false}
              className="mt-2 w-full rounded-xl border border-solid border-line bg-surface2 px-4 py-3 font-[inherit] text-sm text-ink outline-none focus:border-danger" />
            {loi && <p role="alert" className="m-0 mt-3 text-sm font-semibold text-danger">{loi}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={dong} disabled={dang}
                className="cursor-pointer rounded-xl border-0 bg-surface2 px-5 py-3 font-[inherit] text-sm font-bold text-ink hover:opacity-90 disabled:opacity-60">
                {tr("Giữ tài khoản", "Garder le compte", "Keep account")}
              </button>
              <button type="submit" disabled={!khop || dang}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-danger px-5 py-3 font-[inherit] text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                {dang && <Loader2 size={15} className="mcf-spin" />}
                {tr("Xoá vĩnh viễn", "Supprimer définitivement", "Delete permanently")}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
