import { useEffect, useMemo, useState } from "react";
import { MessageCircle, ClipboardList, ChevronRight, ChevronLeft, Flame, Clock, BookOpen, Trophy, AlertTriangle, Loader2, X, Send, Check, Star, Crown, Search } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { guiThongBao } from "../../shared/notifications.js";
import { patchExerciseMeta } from "../../shared/exerciseStore.js";

/* Theo dõi học sinh (10/10). Thay danh sách cũ chỉ có nút « Gửi đường dẫn ».
 * Mọi con số đọc từ RPC tong_quan_hoc_sinh / chi_tiet_hoc_sinh (migration 134),
 * tính từ attempts + daily_activity + profiles. Không có số ước lượng nào.
 *
 * « Jamais connecté » cũ sai vì ghép presence theo TÊN, trong khi danh sách
 * hiển thị display_name. Nay ghép theo id, và lấy mốc muộn hơn giữa lần online
 * cuối với lần nộp bài cuối: cột lan_cuoi_online chỉ có từ 07/10 (migration 123). */

const NGAY = 86400000;
const luc = (ts) => {
  if (!ts) return null;
  const p = Math.floor((Date.now() - Date.parse(ts)) / 60000);
  if (p < 5) return tr("Đang online", "En ligne", "Online");
  if (p < 60) return tr(`${p} phút trước`, `Il y a ${p} min`, `${p} min ago`);
  const g = Math.floor(p / 60);
  if (g < 24) return tr(`${g} giờ trước`, `Il y a ${g} h`, `${g} h ago`);
  const n = Math.floor(g / 24);
  if (n <= 30) return tr(`${n} ngày trước`, `Il y a ${n} j`, `${n} d ago`);
  return new Date(ts).toLocaleDateString("vi-VN");
};
const gio = (giay) => (giay >= 3600 ? `${Math.floor(giay / 3600)} h ${String(Math.floor((giay % 3600) / 60)).padStart(2, "0")}` : `${Math.round(giay / 60)} ph`);

/* Kết luận lượt thi gần nhất theo luật DELF: mỗi phần ≥ 5/25, tổng ≥ 50 %.
 * Phần chưa có điểm (PE chờ chấm, phần bỏ dở) → « chưa đủ điểm », không đoán. */
export const ketLuanThi = (thi) => {
  if (!thi?.phan) return null;
  const ds = Object.values(thi.phan);
  if (!ds.length || ds.some((x) => x == null)) return { trang: "do", tong: null };
  const tong = ds.reduce((a, b) => a + Number(b), 0);
  const dat = ds.every((x) => x >= 5) && tong >= ds.length * 12.5;
  return { trang: dat ? "dat" : "truot", tong, max: ds.length * 25 };
};

const canhBao = (r) => {
  const ds = [];
  const cuoi = r.hoat_dong_cuoi ? Date.parse(r.hoat_dong_cuoi) : 0;
  if (!cuoi || Date.now() - cuoi > 7 * NGAY) ds.push(tr("Hơn 7 ngày không học", "Inactif depuis 7 j+", "Inactive 7+ days"));
  if (ketLuanThi(r.thi)?.trang === "truot") ds.push(tr("Trượt thi thử gần nhất", "Échec au dernier examen blanc", "Failed last mock exam"));
  return ds;
};

function HopNhan({ hs, dong }) {
  const [chu, setChu] = useState("");
  const [tt, setTt] = useState(null);
  const gui = async () => {
    setTt("dang");
    const r = await guiThongBao({ noiDung: chu, choTatCa: false, ids: [hs.id], tens: [hs.name] });
    setTt(r.ok ? "xong" : r.loi || "loi");
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={dong}>
      <div className="w-full max-w-md rounded-3xl bg-surface p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 text-lg font-extrabold text-ink">{tr("Nhắn cho", "Message à", "Message to")} {hs.name}</h3>
          <button type="button" onClick={dong} className="cursor-pointer rounded-full border-0 bg-transparent p-1 text-soft"><X size={18} /></button>
        </div>
        {tt === "xong" ? (
          <p className="m-0 flex items-center gap-2 rounded-2xl bg-ok-soft p-4 text-sm font-bold text-ok"><Check size={16} /> {tr("Đã gửi. Học sinh nhận ở chuông thông báo.", "Envoyé. L'élève le verra dans ses notifications.", "Sent. The student will see it in notifications.")}</p>
        ) : (
          <>
            <textarea data-khong-bang-dau value={chu} onChange={(e) => setChu(e.target.value)} rows={5} maxLength={2000} autoFocus
              placeholder={tr("Lời nhắc, lời khen, nhận xét…", "Rappel, encouragement, remarque…", "Reminder, praise, feedback…")}
              className="w-full resize-none rounded-2xl border border-solid border-line bg-surface px-4 py-3 font-sans text-sm text-ink outline-none focus:border-primary" />
            {tt && tt !== "dang" && <p className="m-0 mt-2 text-sm font-bold text-danger">{tr("Không gửi được", "Échec de l'envoi", "Couldn't send")} ({tt}).</p>}
            <button type="button" onClick={gui} disabled={!chu.trim() || tt === "dang"}
              className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 bg-primary px-4 py-3 font-sans text-sm font-extrabold text-white disabled:opacity-40">
              {tt === "dang" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {tr("Gửi", "Envoyer", "Send")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* Giao bài: chỉ thêm/bớt TÊN học sinh trong meta.assignedTo của bài tập được
 * giao. Bài đang để trống danh sách = giao cho cả lớp: không cho bỏ tick ở đây,
 * vì thêm một tên vào danh sách rỗng là THU bài khỏi mọi học sinh khác. */
function HopGiaoBai({ hs, exercises, onDoi, dong }) {
  const [ds, setDs] = useState(exercises);
  const [dang, setDang] = useState(null);
  const [loi, setLoi] = useState("");
  const doi = async (ex) => {
    const co = (ex.assignedTo || []).includes(hs.name);
    const moi = co ? ex.assignedTo.filter((n) => n !== hs.name) : [...(ex.assignedTo || []), hs.name];
    setDang(ex.id); setLoi("");
    const r = await patchExerciseMeta(ex.id, { assignedTo: moi, targeted: true });
    setDang(null);
    if (!r.ok) { setLoi(r.error?.message || "?"); return; }
    setDs((x) => x.map((e) => (e.id === ex.id ? { ...e, assignedTo: moi, targeted: true } : e)));
    onDoi?.();
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={dong}>
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-3xl bg-surface p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 text-lg font-extrabold text-ink">{tr("Giao bài cho", "Assigner à", "Assign to")} {hs.name}</h3>
          <button type="button" onClick={dong} className="cursor-pointer rounded-full border-0 bg-transparent p-1 text-soft"><X size={18} /></button>
        </div>
        {loi && <p className="m-0 mb-2 text-sm font-bold text-danger">{loi}</p>}
        {!ds.length && <p className="m-0 text-sm text-soft">{tr("Chưa có bài tập được giao nào. Soạn bài ở mục Bài tập trước.", "Aucun devoir. Créez-en un d'abord.", "No assignments yet. Create one first.")}</p>}
        <div className="grid gap-2 overflow-y-auto">
          {ds.map((ex) => {
            const caLop = !ex.assignedTo || ex.assignedTo.length === 0;
            const co = caLop || ex.assignedTo.includes(hs.name);
            return (
              <button key={ex.id} type="button" disabled={caLop || dang === ex.id} onClick={() => doi(ex)}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border border-solid px-4 py-3 text-left font-sans ${co ? "border-primary bg-primary-soft" : "border-line bg-surface"} disabled:cursor-default`}>
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${co ? "bg-primary text-white" : "border border-solid border-line-strong bg-surface"}`}>
                  {dang === ex.id ? <Loader2 size={13} className="animate-spin" /> : co && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">{ex.title}</span>
                  <span className="block text-xs text-soft">{ex.level}{caLop ? ` · ${tr("đã giao cho cả lớp", "assigné à toute la classe", "assigned to everyone")}` : ""}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function useTongQuan() {
  const [tq, setTq] = useState(undefined);
  const tai = () => supabase.rpc("tong_quan_hoc_sinh").then(({ data, error }) =>
    setTq(error ? null : Object.fromEntries((data ?? []).map((r) => [r.id, r]))));
  useEffect(() => { tai(); const t = setInterval(tai, 60_000); return () => clearInterval(t); }, []);
  return [tq, tai];
}

export function DanhSachHocSinh({ accounts, exercises, onMo, onDoi }) {
  const [tq] = useTongQuan();
  const [loc, setLoc] = useState("tat_ca");
  const [tim, setTim] = useState("");
  const [hop, setHop] = useState(null);
  const ds = useMemo(() => accounts.map((a) => ({ ...a, tq: a.id ? tq?.[a.id] : null }))
    .map((a) => ({ ...a, cb: a.tq ? canhBao(a.tq) : [] }))
    .filter((a) => (loc === "can" ? a.cb.length : true) && a.name.toLowerCase().includes(tim.trim().toLowerCase()))
    .sort((x, y) => (Date.parse(y.tq?.hoat_dong_cuoi || 0) || 0) - (Date.parse(x.tq?.hoat_dong_cuoi || 0) || 0)), [accounts, tq, loc, tim]);
  const soCan = accounts.filter((a) => a.id && tq?.[a.id] && canhBao(tq[a.id]).length).length;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {[["tat_ca", tr(`Tất cả (${accounts.length})`, `Tous (${accounts.length})`, `All (${accounts.length})`)], ["can", tr(`Cần quan tâm (${soCan})`, `À suivre (${soCan})`, `Needs attention (${soCan})`)]].map(([k, nhan]) => (
          <button key={k} type="button" onClick={() => setLoc(k)}
            className={`cursor-pointer rounded-full border-0 px-4 py-1.5 font-sans text-sm font-extrabold ${loc === k ? (k === "can" ? "bg-warn text-white" : "bg-primary text-white") : "bg-surface2 text-soft"}`}>{nhan}</button>
        ))}
        <label className="ml-auto flex items-center gap-2 rounded-full border border-solid border-line bg-surface px-3 py-1.5">
          <Search size={14} className="text-soft" />
          <input data-khong-bang-dau value={tim} onChange={(e) => setTim(e.target.value)} placeholder={tr("Tìm học sinh…", "Rechercher…", "Search…")}
            className="w-40 border-0 bg-transparent font-sans text-sm text-ink outline-none" />
        </label>
      </div>
      {tq === null && <p className="m-0 rounded-2xl bg-danger-soft p-3 text-sm font-bold text-danger">{tr("Không đọc được số liệu học tập (migration 134).", "Statistiques indisponibles (migration 134).", "Couldn't load stats (migration 134).")}</p>}

      {ds.map((a) => {
        const r = a.tq;
        const kl = ketLuanThi(r?.thi);
        const online = r?.lan_cuoi_online && Date.now() - Date.parse(r.lan_cuoi_online) < 5 * 60000;
        const vip = r?.vip_den && Date.parse(r.vip_den) > Date.now();
        return (
          <div key={a.id || a.name} className={`rounded-3xl border border-solid bg-surface p-4 shadow-sm ${a.cb.length ? "border-warn" : "border-line"}`}>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => onMo(a.name)} className="flex min-w-0 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left font-sans">
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-soft text-base font-extrabold text-primary">
                  {a.name.charAt(0).toUpperCase()}
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-solid border-surface ${online ? "bg-ok" : "bg-line-strong"}`} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-base font-extrabold text-ink">{a.name}{vip && <Crown size={14} className="text-amber-500" />}</span>
                  <span className="block text-xs text-soft">
                    {a.status === "invited" ? tr("Chưa đăng ký", "Pas encore inscrit", "Not registered yet")
                      : r?.hoat_dong_cuoi ? `${tr("Hoạt động", "Actif", "Active")} ${luc(r.hoat_dong_cuoi)}` : tr("Chưa ghi nhận hoạt động", "Aucune activité enregistrée", "No activity recorded")}
                    {a.email ? ` · ${a.email}` : ""}
                  </span>
                </span>
              </button>
              <div className="ml-auto flex flex-wrap gap-2">
                {a.id && <button type="button" onClick={() => setHop({ loai: "nhan", hs: a })}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-solid border-line bg-surface px-3 py-2 font-sans text-xs font-extrabold text-ink hover:border-primary hover:text-primary"><MessageCircle size={14} /> {tr("Nhắn tin", "Message", "Message")}</button>}
                <button type="button" onClick={() => setHop({ loai: "giao", hs: a })}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-solid border-line bg-surface px-3 py-2 font-sans text-xs font-extrabold text-ink hover:border-primary hover:text-primary"><ClipboardList size={14} /> {tr("Giao bài", "Assigner", "Assign")}</button>
                <button type="button" onClick={() => onMo(a.name)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-xl border-0 bg-primary px-3 py-2 font-sans text-xs font-extrabold text-white">{tr("Chi tiết", "Détails", "Details")} <ChevronRight size={14} /></button>
              </div>
            </div>
            {r && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="inline-flex items-center gap-1 rounded-full bg-surface2 px-2.5 py-1 text-ink"><Flame size={13} className="text-orange-500" /> {tr(`${r.chuoi} ngày liên tiếp`, `${r.chuoi} j d'affilée`, `${r.chuoi}-day streak`)}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface2 px-2.5 py-1 text-ink"><BookOpen size={13} className="text-primary" /> {tr(`${r.bai_7_ngay} bài / 7 ngày`, `${r.bai_7_ngay} exos / 7 j`, `${r.bai_7_ngay} exercises / 7 d`)}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface2 px-2.5 py-1 text-ink"><Clock size={13} className="text-sky-600" /> {gio(r.giay_7_ngay)} / 7 {tr("ngày", "j", "d")}</span>
                {r.diem_tb != null && <span className="inline-flex items-center gap-1 rounded-full bg-surface2 px-2.5 py-1 text-ink"><Trophy size={13} className="text-amber-500" /> {tr("TB", "Moy.", "Avg")} {r.diem_tb}%</span>}
                <span className="inline-flex items-center gap-1 rounded-full bg-surface2 px-2.5 py-1 text-ink"><Star size={13} className="text-amber-500" /> {r.xp} XP</span>
                {r.thi && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${kl?.trang === "dat" ? "bg-ok-soft text-ok" : kl?.trang === "truot" ? "bg-danger-soft text-danger" : "bg-surface2 text-soft"}`}>
                    {r.thi.title}: {kl?.trang === "dat" ? tr("Đạt", "Réussi", "Pass") : kl?.trang === "truot" ? tr("Trượt", "Échec", "Fail") : tr("chưa đủ điểm", "incomplet", "incomplete")}
                    {kl?.tong != null && ` ${kl.tong}/${kl.max}`}
                  </span>
                )}
                {a.cb.map((c) => <span key={c} className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-1 text-warn"><AlertTriangle size={13} /> {c}</span>)}
              </div>
            )}
          </div>
        );
      })}
      {!ds.length && <p className="m-0 text-sm text-soft">{loc === "can" ? tr("Không có học sinh nào cần quan tâm.", "Aucun élève à suivre.", "No one needs attention.") : tr("Chưa có học sinh nào.", "Aucun élève.", "No students yet.")}</p>}

      {hop?.loai === "nhan" && <HopNhan hs={hop.hs} dong={() => setHop(null)} />}
      {hop?.loai === "giao" && <HopGiaoBai hs={hop.hs} exercises={exercises} onDoi={onDoi} dong={() => setHop(null)} />}
    </div>
  );
}

export function ChiTietHocSinh({ acc, exercises, onDoi, back }) {
  const [tq] = useTongQuan();
  const [ct, setCt] = useState(undefined);
  const [hop, setHop] = useState(null);
  useEffect(() => {
    if (!acc.id) { setCt(null); return; }
    supabase.rpc("chi_tiet_hoc_sinh", { p_uid: acc.id }).then(({ data, error }) => setCt(error ? null : data));
  }, [acc.id]);
  const r = acc.id ? tq?.[acc.id] : null;
  const kl = ketLuanThi(r?.thi);
  const o = (Icon, mau, so, nhan) => (
    <div className="rounded-2xl border border-solid border-line bg-surface p-4">
      <Icon size={18} className={mau} />
      <div className="mt-1 text-2xl font-extrabold tabular-nums text-ink">{so}</div>
      <div className="text-xs font-bold text-soft">{nhan}</div>
    </div>
  );
  return (
    <div className="grid gap-4">
      <button type="button" onClick={back} className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-xl border border-solid border-line bg-surface px-3 py-2 font-sans text-sm font-bold text-ink">
        <ChevronLeft size={16} /> {tr("Danh sách học sinh", "Liste des élèves", "Student list")}
      </button>
      <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-5 text-white">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-white/20 text-2xl font-extrabold">{acc.name.charAt(0).toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-2xl font-extrabold">{acc.name}</h2>
          <p className="m-0 text-sm text-white/85">{acc.email}{r?.hoat_dong_cuoi ? ` · ${tr("Hoạt động", "Actif", "Active")} ${luc(r.hoat_dong_cuoi)}` : ""}</p>
        </div>
        {acc.id && <button type="button" onClick={() => setHop("nhan")} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-white px-4 py-2 font-sans text-sm font-extrabold text-primary"><MessageCircle size={15} /> {tr("Nhắn tin", "Message", "Message")}</button>}
        <button type="button" onClick={() => setHop("giao")} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-white/20 px-4 py-2 font-sans text-sm font-extrabold text-white"><ClipboardList size={15} /> {tr("Giao bài", "Assigner", "Assign")}</button>
      </div>

      {!acc.id ? <p className="m-0 text-sm text-soft">{tr("Học sinh này chưa đăng ký tài khoản nên chưa có số liệu.", "Cet élève n'est pas encore inscrit.", "This student hasn't registered yet.")}</p> : (
        <>
          {r && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {o(Flame, "text-orange-500", r.chuoi, tr("ngày liên tiếp", "jours d'affilée", "day streak"))}
              {o(BookOpen, "text-primary", r.tong_bai, tr("lượt đã nộp", "envois", "submissions"))}
              {o(Clock, "text-sky-600", gio(r.giay_7_ngay), tr("giờ học 7 ngày", "temps / 7 j", "time / 7 d"))}
              {o(Trophy, "text-amber-500", r.diem_tb != null ? `${r.diem_tb}%` : "–", tr("điểm trung bình", "moyenne", "average"))}
              {o(Star, "text-amber-500", r.xp, "XP")}
            </div>
          )}
          {r?.thi && (
            <div className="rounded-3xl border border-solid border-line bg-surface p-5">
              <h3 className="m-0 mb-3 text-base font-extrabold text-ink">{tr("Thi thử gần nhất", "Dernier examen blanc", "Latest mock exam")}: {r.thi.title}</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(r.thi.phan).map(([k, v]) => (
                  <span key={k} className={`rounded-xl px-3 py-2 text-sm font-extrabold tabular-nums ${v == null ? "bg-surface2 text-soft" : v < 5 ? "bg-danger-soft text-danger" : "bg-ok-soft text-ok"}`}>{k} {v == null ? tr("chờ điểm", "en attente", "pending") : `${v}/25`}</span>
                ))}
                {kl && <span className={`rounded-xl px-3 py-2 text-sm font-extrabold ${kl.trang === "dat" ? "bg-ok text-white" : kl.trang === "truot" ? "bg-danger text-white" : "bg-surface2 text-soft"}`}>
                  {kl.trang === "dat" ? tr("Đạt", "Réussi", "Pass") : kl.trang === "truot" ? tr("Trượt", "Échec", "Fail") : tr("Chưa đủ điểm để kết luận", "Résultat incomplet", "Incomplete")}{kl.tong != null && ` · ${kl.tong}/${kl.max}`}
                </span>}
              </div>
            </div>
          )}
          {ct === undefined && <p className="m-0 flex items-center gap-2 text-sm text-soft"><Loader2 size={15} className="animate-spin" /> {tr("Đang tải…", "Chargement…", "Loading…")}</p>}
          {ct === null && <p className="m-0 text-sm font-bold text-danger">{tr("Không đọc được chi tiết.", "Détails indisponibles.", "Couldn't load details.")}</p>}
          {ct && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-solid border-line bg-surface p-5">
                <h3 className="m-0 mb-3 text-base font-extrabold text-ink">{tr("Điểm theo kỹ năng", "Par compétence", "By skill")}</h3>
                {!Object.keys(ct.theo_ky_nang).length && <p className="m-0 text-sm text-soft">{tr("Chưa có bài chấm điểm.", "Aucun exercice noté.", "No graded work yet.")}</p>}
                <div className="grid gap-2.5">
                  {Object.entries(ct.theo_ky_nang).sort((a, b) => a[1] - b[1]).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-sm font-bold text-ink"><span>{k}</span><span className="tabular-nums">{v}%</span></div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface2"><div className={`h-full rounded-full ${v < 50 ? "bg-danger" : v < 70 ? "bg-warn" : "bg-ok"}`} style={{ width: `${v}%` }} /></div>
                    </div>
                  ))}
                </div>
                <h3 className="m-0 mb-3 mt-6 text-base font-extrabold text-ink">{tr("Câu sai nhiều nhất", "Questions les plus ratées", "Most-missed questions")}</h3>
                {!ct.cau_sai.length && <p className="m-0 text-sm text-soft">{tr("Chưa có câu sai nào được ghi lại.", "Aucune erreur enregistrée.", "No mistakes recorded.")}</p>}
                <ol className="m-0 grid list-none gap-2 p-0">
                  {ct.cau_sai.map((c, i) => (
                    <li key={i} className="rounded-xl bg-surface2 px-3 py-2">
                      <div className="line-clamp-2 text-sm font-semibold text-ink" lang="fr">{c.prompt}</div>
                      <div className="text-xs text-soft">{c.title} · {tr(`sai ${c.so_lan} lần`, `${c.so_lan} erreur(s)`, `missed ${c.so_lan}×`)}</div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-3xl border border-solid border-line bg-surface p-5">
                <h3 className="m-0 mb-3 text-base font-extrabold text-ink">{tr("Lượt làm gần đây", "Activité récente", "Recent attempts")}</h3>
                {!ct.luot.length && <p className="m-0 text-sm text-soft">{tr("Chưa nộp bài nào.", "Aucun envoi.", "No submissions yet.")}</p>}
                <div className="grid gap-2">
                  {ct.luot.map((l) => {
                    const pct = l.max > 0 ? Math.round((l.score / l.max) * 100) : null;
                    return (
                      <div key={l.id} className="flex items-center gap-3 rounded-xl border border-solid border-line px-3 py-2">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-ink">{l.title}</span>
                          <span className="block text-xs text-soft">{l.level} · {l.de ? `${tr("Thi thử", "Examen blanc", "Mock exam")} ${l.de}` : tr("Luyện tập", "Entraînement", "Practice")} · {luc(l.luc)}</span>
                        </span>
                        <span className={`shrink-0 rounded-lg px-2 py-1 text-xs font-extrabold tabular-nums ${pct == null ? "bg-surface2 text-soft" : pct >= 70 ? "bg-ok-soft text-ok" : pct >= 50 ? "bg-warn-soft text-warn" : "bg-danger-soft text-danger"}`}>
                          {pct == null ? tr("chờ chấm", "à corriger", "pending") : `${l.score}/${l.max}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {hop === "nhan" && <HopNhan hs={acc} dong={() => setHop(null)} />}
      {hop === "giao" && <HopGiaoBai hs={acc} exercises={exercises} onDoi={onDoi} dong={() => setHop(null)} />}
    </div>
  );
}
