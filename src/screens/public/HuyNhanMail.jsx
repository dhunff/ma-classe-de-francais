import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";

/* Huỷ nhận mail nhắc học từ link trong mail (25/10, migration 167). Không cần đăng
 * nhập: token trong link là đủ. Huỷ đúng LOẠI mail đó; bật lại ở Tài khoản. */
export default function HuyNhanMail() {
  const [q] = useSearchParams();
  const token = q.get("t") ?? "";
  const loai = ["giu_chuoi", "tom_tat_tuan"].includes(q.get("loai")) ? q.get("loai") : "tat";
  const [tt, setTt] = useState("dang");           // dang | xong | loi
  useEffect(() => {
    if (!/^[0-9a-f-]{36}$/i.test(token)) { setTt("loi"); return; }
    supabase.rpc("huy_nhan_mail", { p_token: token, p_loai: loai })
      .then(({ data, error }) => setTt(!error && data?.ok ? "xong" : "loi"), () => setTt("loi"));
  }, [token, loai]);
  const ten = loai === "giu_chuoi" ? tr("nhắc giữ chuỗi", "rappel de série", "streak reminders")
    : loai === "tom_tat_tuan" ? tr("tóm tắt tuần", "bilan hebdomadaire", "weekly summaries")
    : tr("mọi mail nhắc học", "tous les rappels", "all reminders");
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-8 text-center shadow-md">
        <Leon cam={tt === "loi" ? "xin-loi" : "tam-biet"} size={110} className="mx-auto block" />
        <h1 className="m-0 mt-4 text-xl font-extrabold text-ink">
          {tt === "dang" ? tr("Đang xử lý…", "Traitement…", "Processing…")
            : tt === "xong" ? tr(`Đã tắt ${ten}`, `${ten} désactivé`, `${ten} turned off`)
            : tr("Link không hợp lệ", "Lien invalide", "Invalid link")}
        </h1>
        <p className="m-0 mt-2 text-sm text-soft">
          {tt === "loi" ? tr("Bạn có thể tắt mail trong Tài khoản → Thông báo email.", "Vous pouvez les désactiver dans Compte → Notifications e-mail.", "You can turn them off in Account → Email notifications.")
            : tr("Muốn nhận lại thì bật trong Tài khoản → Thông báo email.", "Pour les réactiver : Compte → Notifications e-mail.", "To turn them back on: Account → Email notifications.")}
        </p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary no-underline">{tr("Về FRACILE", "Retour à FRACILE", "Back to FRACILE")}</Link>
      </div>
    </div>
  );
}
