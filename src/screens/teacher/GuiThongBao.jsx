import React, { useEffect, useMemo, useState } from "react";
import { Megaphone, Send, Loader2, Search, Bell, RotateCcw, Users, CheckCircle2 } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { guiThongBao } from "../../shared/notifications.js";
import { trangThaiOnline } from "../../shared/hienDien.js";
import { thoiGianTuongDoi } from "../../shared/display.js";
import { tr } from "../../shared/i18n.jsx";

/* Trang « Thông báo » của giáo viên (08/10). Thay hộp nổi cũ ở trang Bài tập.
 *
 *   Trái: soạn (mẫu nhanh, đếm ký tự), chọn người nhận (tất cả / từng em, có
 *   chấm online), xem trước đúng dạng một dòng trong chuông của học sinh.
 *   Phải: lịch sử đã gửi, gom theo lần gửi (cùng nội dung + cùng thời điểm,
 *   vì RPC chèn một lần cho mọi người nhận), kèm số em đã đọc.
 *
 * Gửi vẫn đi qua `guiThongBao` (RPC send_announcement_to_students): kiểm vai ở
 * máy chủ và TRẢ VỀ số người nhận, giao diện nói ra con số đó. */
/* Hàm: nhãn và nội dung mẫu đổi theo ngôn ngữ giao diện. */
const MAU = () => [
  [tr("Nhắc làm bài", "Rappel", "Reminder"), tr("Các em nhớ hoàn thành bài tập được giao trước hạn nộp nhé.", "N'oubliez pas de terminer vos devoirs avant la date limite.", "Remember to finish your assignments before the deadline.")],
  [tr("Bài mới", "Nouvel exercice", "New exercise"), tr("Thầy/cô vừa đăng bài tập mới trong Thư viện luyện tập. Vào làm thử nhé!", "Un nouvel exercice vient d'être publié dans la bibliothèque. Venez l'essayer !", "A new exercise is up in the practice library. Come and try it!")],
  [tr("Thi thử", "Examen blanc", "Mock exam"), tr("Cuối tuần này các em làm một đề thi thử DELF để kiểm tra trình độ nhé. Nhớ chuẩn bị chỗ yên tĩnh.", "Ce week-end, passez un examen blanc DELF pour faire le point. Installez-vous au calme.", "This weekend, take a DELF mock exam to check your level. Find a quiet place.")],
  [tr("Chúc mừng", "Bravo", "Well done"), tr("Chúc mừng các em đã học đều cả tuần! Tiếp tục giữ chuỗi ngày học nhé.", "Bravo pour votre régularité cette semaine ! Gardez votre série.", "Well done for studying all week! Keep your streak going.")],
];
const GIOI_HAN = 2000;
const o = "w-full rounded-xl border border-solid border-line bg-surface2 px-3 py-2 font-sans text-sm text-ink outline-none focus:border-primary";

export default function GuiThongBao() {
  const [hs, setHs] = useState(undefined);
  const [lichSu, setLichSu] = useState(undefined);
  const [noiDung, setNoiDung] = useState("");
  const [tatCa, setTatCa] = useState(true);
  const [chon, setChon] = useState(() => new Set());
  const [tim, setTim] = useState("");
  const [dang, setDang] = useState(false);
  const [kq, setKq] = useState(null);   // { ok, text }

  const taiHs = () => supabase.from("profiles").select("id, name, display_name, lan_cuoi_online").eq("role", "eleve").order("name")
    .then(({ data, error }) => setHs(error ? null : data ?? []));
  const taiLichSu = () => supabase.from("notifications").select("message, created_at, is_read")
    .eq("type", "announcement").order("created_at", { ascending: false }).limit(3000)
    .then(({ data, error }) => {
      if (error) { setLichSu(null); return; }
      const nhom = new Map();
      for (const r of data ?? []) {
        const k = `${r.created_at}|${r.message}`;
        const g = nhom.get(k) ?? { message: r.message, created_at: r.created_at, tong: 0, doc: 0 };
        g.tong += 1; if (r.is_read) g.doc += 1;
        nhom.set(k, g);
      }
      setLichSu([...nhom.values()].slice(0, 30));
    });
  useEffect(() => { taiHs(); taiLichSu(); }, []);

  const loc = useMemo(() => {
    const k = tim.trim().toLowerCase();
    return (hs ?? []).filter((p) => !k || `${p.name} ${p.display_name ?? ""}`.toLowerCase().includes(k));
  }, [hs, tim]);
  const soOnline = (hs ?? []).filter((p) => trangThaiOnline(p.lan_cuoi_online)?.online).length;
  const soNhan = tatCa ? (hs?.length ?? 0) : chon.size;

  const bat = (id) => setChon((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const chonHet = () => setChon((s) => { const n = new Set(s); loc.forEach((p) => n.add(p.id)); return n; });

  const gui = async () => {
    setKq(null);
    if (!noiDung.trim()) { setKq({ ok: false, text: tr("Chưa có nội dung thông báo.", "L'annonce est vide.", "The announcement is empty.") }); return; }
    if (!tatCa && !chon.size) { setKq({ ok: false, text: tr("Chưa chọn học sinh nào.", "Aucun élève sélectionné.", "No students selected.") }); return; }
    setDang(true);
    const r = await guiThongBao({ noiDung, choTatCa: tatCa, ids: [...chon] });
    setDang(false);
    if (!r.ok) {
      setKq({ ok: false, text: r.loi === "khong_phai_giao_vien" ? tr("Tài khoản này không có quyền gửi thông báo.", "Ce compte ne peut pas envoyer d'annonces.", "This account can't send announcements.")
        : r.loi === "dai" ? tr(`Thông báo dài quá ${GIOI_HAN} ký tự.`, `Annonce trop longue (${GIOI_HAN} caractères max).`, `Announcement too long (${GIOI_HAN} characters max).`) : tr(`Chưa gửi được. ${r.chiTiet ?? tr("Kiểm tra mạng rồi thử lại.", "Vérifiez la connexion et réessayez.", "Check your connection and try again.")}`, `Non envoyé. ${r.chiTiet ?? tr("Kiểm tra mạng rồi thử lại.", "Vérifiez la connexion et réessayez.", "Check your connection and try again.")}`, `Not sent. ${r.chiTiet ?? tr("Kiểm tra mạng rồi thử lại.", "Vérifiez la connexion et réessayez.", "Check your connection and try again.")}`) });
      return;
    }
    setKq({ ok: true, text: r.soNguoiNhan === 0 ? tr("Đã gửi, nhưng không có học sinh nào nhận.", "Envoyé, mais aucun élève ne l'a reçu.", "Sent, but no students received it.") : tr(`Đã gửi tới ${r.soNguoiNhan ?? ""} học sinh.`, `Envoyé à ${r.soNguoiNhan ?? ""} élève(s).`, `Sent to ${r.soNguoiNhan ?? ""} student(s).`) });
    setNoiDung(""); setChon(new Set()); taiLichSu();
  };

  return (
    <div className="mx-auto max-w-6xl py-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary"><Megaphone size={22} /></span>
        <div>
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{tr("Thông báo", "Annonces", "Announcements")}</h1>
          <p className="m-0 text-sm text-soft">{tr("Gửi tin tới chuông thông báo của học sinh.", "Envoyez un message dans les notifications des élèves.", "Send a message to students' notification bell.")}</p>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Soạn ── */}
        <section className="grid gap-5 rounded-3xl border border-solid border-line bg-surface p-5">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-soft">{tr("Nội dung", "Message", "Message")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {MAU().map(([ten, van]) => (
                <button key={ten} type="button" onClick={() => setNoiDung(van)}
                  className="cursor-pointer rounded-full border border-solid border-line bg-surface px-3 py-1 font-sans text-xs font-semibold text-ink hover:border-primary hover:text-primary">{ten}</button>
              ))}
            </div>
            <textarea value={noiDung} onChange={(e) => setNoiDung(e.target.value.slice(0, GIOI_HAN))} rows={6}
              placeholder={tr("Viết thông báo cho học sinh…", "Écrivez votre annonce…", "Write your announcement…")} className={`${o} mt-3 resize-y leading-relaxed`} />
            <p className={`m-0 mt-1 text-right text-xs tabular-nums ${noiDung.length > GIOI_HAN * 0.9 ? "text-warn" : "text-soft"}`}>{noiDung.length}/{GIOI_HAN}</p>
          </div>

          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-soft">{tr("Người nhận", "Destinataires", "Recipients")}</p>
            <div role="radiogroup" className="mt-2 inline-flex gap-1 rounded-full bg-surface2 p-1">
              {[[true, tr(`Tất cả học sinh${hs ? ` (${hs.length})` : ""}`, `Tous les élèves${hs ? ` (${hs.length})` : ""}`, `All students${hs ? ` (${hs.length})` : ""}`)], [false, tr("Chọn học sinh", "Choisir des élèves", "Choose students")]].map(([v, n]) => (
                <button key={String(v)} type="button" role="radio" aria-checked={tatCa === v} onClick={() => setTatCa(v)}
                  className={`h-9 cursor-pointer rounded-full border-0 px-4 font-sans text-sm font-bold ${tatCa === v ? "bg-surface text-ink shadow-sm" : "bg-transparent text-soft"}`}>{n}</button>
              ))}
            </div>
            {hs && <p className="m-0 mt-2 text-xs text-soft"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-ok" />{soOnline} {tr("học sinh đang online", "élève(s) en ligne", "student(s) online")}</p>}

            {!tatCa && (
              <div className="mt-3 rounded-2xl border border-solid border-line p-3">
                <div className="flex items-center gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
                    <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder={tr("Tìm học sinh…", "Rechercher un élève…", "Search students…")} className={`${o} pl-9`} />
                  </div>
                  <button type="button" onClick={chonHet} className="h-9 shrink-0 cursor-pointer rounded-full border-0 bg-surface2 px-3 font-sans text-xs font-bold text-ink">{tr("Chọn tất cả", "Tout sélectionner", "Select all")}</button>
                  {chon.size > 0 && <button type="button" onClick={() => setChon(new Set())} className="h-9 shrink-0 cursor-pointer rounded-full border-0 bg-transparent px-2 font-sans text-xs font-bold text-soft">{tr("Bỏ chọn", "Désélectionner", "Clear")}</button>}
                </div>
                <ul className="mcf-scroll m-0 mt-2 grid max-h-64 list-none gap-1 overflow-y-auto p-0 sm:grid-cols-2">
                  {hs === undefined && <li className="p-2 text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</li>}
                  {hs === null && <li className="p-2 text-sm text-danger">{tr("Không đọc được danh sách học sinh.", "Impossible de charger les élèves.", "Couldn't load students.")}</li>}
                  {loc.map((p) => {
                    const st = trangThaiOnline(p.lan_cuoi_online);
                    const on = chon.has(p.id);
                    return (
                      <li key={p.id}>
                        <label className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm ${on ? "bg-primary-soft" : "hover:bg-surface2"}`}>
                          <input type="checkbox" checked={on} onChange={() => bat(p.id)} className="h-4 w-4 cursor-pointer" />
                          <span className={`h-2 w-2 shrink-0 rounded-full ${st?.online ? "bg-ok" : "bg-line-strong"}`} title={st?.nhan ?? tr("Chưa online lần nào", "Jamais connecté", "Never online")} />
                          <span className="min-w-0 truncate font-semibold text-ink">{p.display_name || p.name}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-soft">{tr("Học sinh sẽ thấy", "Ce que verront les élèves", "What students will see")}</p>
            <div className="mt-2 flex gap-3 rounded-2xl bg-surface2 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Bell size={16} /></span>
              <div className="min-w-0">
                <p className="m-0 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{noiDung.trim() || <span className="text-soft">{tr("Nội dung thông báo hiện ở đây.", "Le message apparaîtra ici.", "Your message will appear here.")}</span>}</p>
                <p className="m-0 mt-1 text-xs text-soft">{tr("Vừa xong", "À l'instant", "Just now")}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-0 border-t border-solid border-line pt-4">
            {kq && <p role="status" className={`m-0 mr-auto text-sm font-semibold ${kq.ok ? "text-ok" : "text-danger"}`}>{kq.text}</p>}
            <span className="text-sm text-soft"><Users size={14} className="mr-1 inline align-[-2px]" />{soNhan} {tr("người nhận", "destinataire(s)", "recipient(s)")}</span>
            <button type="button" onClick={gui} disabled={dang}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-6 font-sans text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">
              {dang ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {tr("Gửi thông báo", "Envoyer l'annonce", "Send announcement")}
            </button>
          </div>
        </section>

        {/* ── Lịch sử ── */}
        <aside className="rounded-3xl border border-solid border-line bg-surface p-5 lg:sticky lg:top-4">
          <p className="m-0 text-xs font-bold uppercase tracking-wide text-soft">{tr("Đã gửi gần đây", "Envoyées récemment", "Recently sent")}</p>
          {lichSu === undefined ? <p className="m-0 mt-3 text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
            : lichSu === null ? <p className="m-0 mt-3 text-sm text-danger">{tr("Không đọc được lịch sử.", "Impossible de charger l'historique.", "Couldn't load history.")}</p>
            : !lichSu.length ? <p className="m-0 mt-3 text-sm text-soft">{tr("Chưa gửi thông báo nào.", "Aucune annonce envoyée.", "No announcements sent yet.")}</p>
            : (
              <ul className="mcf-scroll m-0 mt-3 grid max-h-[70vh] list-none gap-3 overflow-y-auto p-0">
                {lichSu.map((g) => (
                  <li key={`${g.created_at}${g.message}`} className="rounded-2xl bg-surface2 p-3.5">
                    <p className="m-0 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{g.message}</p>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-ok" style={{ width: `${g.tong ? (g.doc / g.tong) * 100 : 0}%` }} />
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-soft">
                      <CheckCircle2 size={13} className="text-ok" /> {g.doc}/{g.tong} {tr("đã đọc", "lu(s)", "read")}
                      <span>· {thoiGianTuongDoi(g.created_at)}</span>
                      <button type="button" onClick={() => { setNoiDung(g.message); window.scrollTo({ top: 0, behavior: "smooth" }); }} title={tr("Dùng lại nội dung", "Réutiliser ce message", "Reuse this message")}
                        className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-full border-0 bg-surface px-2.5 py-1 font-sans text-xs font-bold text-ink hover:text-primary">
                        <RotateCcw size={12} /> {tr("Dùng lại", "Réutiliser", "Reuse")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </aside>
      </div>
    </div>
  );
}
