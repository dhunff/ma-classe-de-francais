import React, { useEffect, useMemo, useState } from "react";
import { Crown } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { VIP, vipConHan } from "../../shared/vip.js";
import { fmtPrice } from "../../shared/access.js";
import { tr } from "../../shared/i18n.jsx";

/* Quản lý gói VIP (07/10). Học sinh mua qua SePay thì tự gia hạn (118);
 * khung này cho giáo viên xem ai đang VIP, tới ngày nào, và tự gia hạn/thu
 * hồi khi cần (trả tiền mặt, tặng, sửa sai). Mọi lần gia hạn đi qua
 * gv_gia_han_vip (122) nên vẫn có dòng trong vip_giao_dich. */
const ngay = (d) => new Date(d).toLocaleDateString("vi-VN");

export default function QuanLyVip() {
  const [ds, setDs] = useState(null);
  const [loi, setLoi] = useState("");
  const [tim, setTim] = useState("");
  const [dang, setDang] = useState(null);

  const tai = () => supabase.from("profiles").select("id, name, display_name, vip_den").eq("role", "eleve").order("name")
    .then(({ data, error }) => { if (error) setLoi(error.message); else setDs(data ?? []); });
  useEffect(() => { tai(); }, []);

  const loc = useMemo(() => {
    const k = tim.trim().toLowerCase();
    const d = (ds ?? []).filter((p) => !k || `${p.name} ${p.display_name ?? ""}`.toLowerCase().includes(k));
    return d.sort((a, b) => Number(vipConHan(b.vip_den)) - Number(vipConHan(a.vip_den)));
  }, [ds, tim]);
  const soVip = (ds ?? []).filter((p) => vipConHan(p.vip_den)).length;

  const goi = async (p, fn, args) => {
    setDang(p.id); setLoi("");
    const { data, error } = await supabase.rpc(fn, args);
    setDang(null);
    if (error || !data?.ok) { setLoi(tr(`Không lưu được cho ${p.name}: ${error?.message ?? data?.ma ?? tr("lỗi", "erreur", "error")}`, `Non enregistré pour ${p.name} : ${error?.message ?? data?.ma ?? tr("lỗi", "erreur", "error")}`, `Couldn't save for ${p.name}: ${error?.message ?? data?.ma ?? tr("lỗi", "erreur", "error")}`)); return; }
    tai();
  };

  return (
    <section className="mb-6 rounded-3xl border border-solid border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-warn-soft text-warn"><Crown size={20} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-base font-extrabold text-ink">Gói VIP</h2>
          <p className="m-0 text-xs text-soft">{fmtPrice(VIP.gia)} / {VIP.ngay} ngày · {ds ? tr(`${soVip} học sinh đang VIP`, `${soVip} élève(s) VIP`, `${soVip} VIP student(s)`) : tr("Đang tải…", "Chargement…", "Loading…")}</p>
        </div>
        <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder={tr("Tìm học sinh…", "Rechercher un élève…", "Search students…")}
          className="h-9 w-48 rounded-lg border border-solid border-line bg-surface2 px-3 font-sans text-sm text-ink outline-none focus:border-primary" />
      </div>
      {loi && <p className="m-0 mt-3 text-sm font-semibold text-danger">{loi}</p>}
      <div className="mcf-scroll mt-4 max-h-80 overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-soft">
              <th className="py-2 font-bold">{tr("Học sinh", "Élève", "Student")}</th><th className="py-2 font-bold">{tr("Trạng thái", "Statut", "Status")}</th><th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {loc.map((p) => {
              const con = vipConHan(p.vip_den);
              return (
                <tr key={p.id} className="border-0 border-t border-solid border-line">
                  <td className="py-2 pr-3 font-semibold text-ink">{p.display_name || p.name}</td>
                  <td className="py-2 pr-3">
                    {con ? <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-xs font-bold text-ok">{tr("VIP đến", "VIP jusqu'au", "VIP until")} {ngay(p.vip_den)}</span>
                      : <span className="text-xs text-soft">{p.vip_den ? tr(`Hết hạn ${ngay(p.vip_den)}`, `Expiré le ${ngay(p.vip_den)}`, `Expired ${ngay(p.vip_den)}`) : tr("Chưa VIP", "Pas VIP", "Not VIP")}</span>}
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button type="button" disabled={dang === p.id} onClick={() => goi(p, "gv_gia_han_vip", { p_user: p.id, p_so_ngay: VIP.ngay })}
                      className="h-8 cursor-pointer rounded-full border-0 bg-primary px-3 font-sans text-xs font-bold text-white disabled:opacity-50">
                      +{VIP.ngay} ngày
                    </button>
                    {con && (
                      <button type="button" disabled={dang === p.id}
                        onClick={() => { if (window.confirm(tr(`Thu hồi VIP của ${p.name}? Hạn còn lại sẽ mất.`, `Retirer le VIP de ${p.name} ? Les jours restants seront perdus.`, `Revoke ${p.name}'s VIP? The remaining days will be lost.`))) goi(p, "gv_thu_hoi_vip", { p_user: p.id }); }}
                        className="ml-2 h-8 cursor-pointer rounded-full border border-solid border-line bg-surface px-3 font-sans text-xs font-bold text-soft hover:text-danger disabled:opacity-50">
                        {tr("Thu hồi", "Retirer", "Revoke")}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {ds && !loc.length && <p className="m-0 py-4 text-center text-sm text-soft">{tr("Không có học sinh nào khớp.", "Aucun élève ne correspond.", "No matching students.")}</p>}
      </div>
    </section>
  );
}
