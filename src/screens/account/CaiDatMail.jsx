import React, { useEffect, useState } from "react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";

/* Cài đặt mail nhắc học (25/10, migration 167). Dòng mail_cai_dat tạo lúc cần;
 * chưa có dòng nghĩa là cả hai loại đang BẬT (mặc định của bảng). */
export default function CaiDatMail() {
  const [cd, setCd] = useState(null);
  const [loi, setLoi] = useState("");
  const [uid, setUid] = useState(null);
  useEffect(() => {
    let con = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u?.user?.id; if (!con || !id) return;
      setUid(id);
      const { data, error } = await supabase.from("mail_cai_dat").select("giu_chuoi, tom_tat_tuan").eq("user_id", id).maybeSingle();
      if (!con) return;
      if (error) setLoi(error.message);
      setCd(data ?? { giu_chuoi: true, tom_tat_tuan: true });
    })();
    return () => { con = false; };
  }, []);

  const doi = async (k) => {
    const moi = { ...cd, [k]: !cd[k] };
    setCd(moi); setLoi("");
    const { data, error } = await supabase.from("mail_cai_dat")
      .upsert({ user_id: uid, giu_chuoi: moi.giu_chuoi, tom_tat_tuan: moi.tom_tat_tuan, cap_nhat: new Date().toISOString() }, { onConflict: "user_id" })
      .select("giu_chuoi, tom_tat_tuan").single();
    if (error || !data) { setCd(cd); setLoi(error?.message ?? tr("Không lưu được.", "Échec de l'enregistrement.", "Could not save.")); return; }
    setCd(data);
  };

  const MUC = [
    ["giu_chuoi", tr("Nhắc giữ chuỗi", "Rappel de série", "Streak reminder"), tr("19:00, chỉ khi hôm nay bạn chưa học và đang có chuỗi.", "19 h, seulement si vous n'avez pas étudié aujourd'hui.", "7 pm, only if you haven't studied today.")],
    ["tom_tat_tuan", tr("Tóm tắt tuần", "Bilan de la semaine", "Weekly summary"), tr("8:00 sáng thứ Hai: số ngày học, XP và chuỗi.", "Lundi 8 h : jours d'étude, XP et série.", "Monday 8 am: study days, XP and streak.")],
  ];
  return (
    <div className="grid gap-5">
      <div>
        <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{tr("Thông báo email", "Notifications e-mail", "Email notifications")}</h1>
        <p className="m-0 mt-1 text-sm text-soft">{tr("Leon gửi tối đa một mail mỗi loại mỗi ngày, từ leon@fracile.vn.", "Leon envoie au plus un e-mail par type et par jour, depuis leon@fracile.vn.", "Leon sends at most one email per type per day, from leon@fracile.vn.")}</p>
      </div>
      {cd === null ? <p className="m-0 text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p> : (
        <div className="grid gap-3">
          {MUC.map(([k, ten, mo]) => (
            <label key={k} className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-solid border-line bg-surface p-4">
              <span><span className="block text-sm font-bold text-ink">{ten}</span><span className="block text-xs text-soft">{mo}</span></span>
              <input type="checkbox" checked={!!cd[k]} onChange={() => doi(k)} className="h-5 w-5 cursor-pointer accent-[rgb(var(--mcf-primary-rgb))]" />
            </label>
          ))}
        </div>
      )}
      {loi && <p className="m-0 rounded-xl bg-danger-soft p-3 text-sm text-danger">{loi}</p>}
    </div>
  );
}
