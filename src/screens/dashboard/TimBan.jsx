import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Search, UserPlus, Check, Link2, Users, Sparkles } from "lucide-react";
import { Avatar } from "../../shared/avatars.jsx";
import { tr } from "../../shared/i18n.jsx";
import { timBan, goiYBan, theoDoiId } from "../../shared/xp.js";
import { loadDanhTinh } from "../../shared/identity.js";

/* « Tìm bạn học » (19/10, thay hộp chỉ nhận @username gõ đúng).
 *
 * Trước đó: theo dõi = gõ ĐÚNG @username, mà 23/34 học sinh không có username
 * (migration 150 cấp cho tất cả). Nay ba đường vào:
 *   · tìm theo tên hoặc @username (không cần dấu, gõ một phần),
 *   · gợi ý kèm LÝ DO (theo dõi bạn, bạn chung, cùng trường, cùng trình độ…),
 *   · link kết bạn của chính mình để gửi qua Zalo / Messenger.
 * Dữ liệu chỉ có tên, @username, ảnh (như danh sách theo dõi đã có). */
export const LY_DO = (r) => ({
  theo_doi_ban: tr("Đang theo dõi bạn", "Vous suit", "Follows you"),
  ban_chung: r?.ban_chung ? tr(`${r.ban_chung} bạn chung`, `${r.ban_chung} ami(s) en commun`, `${r.ban_chung} mutual`) : tr("Bạn chung", "Ami en commun", "Mutual"),
  cung_truong: tr("Cùng trường", "Même école", "Same school"),
  cung_trinh_do: tr("Cùng trình độ", "Même niveau", "Same level"),
  cung_muc_tieu: tr("Cùng mục tiêu", "Même objectif", "Same goal"),
  moi_tham_gia: tr("Mới tham gia", "Nouveau", "New here"),
  hoc_vien: tr("Học viên FRACILE", "Élève FRACILE", "FRACILE learner"),
}[r?.ly_do] ?? "");

export const linkKetBan = (username) => `https://www.fracile.vn/etudiant/dashboard?ket_ban=${encodeURIComponent(username)}`;

/* Một dòng người + nút Theo dõi. Dùng chung cho kết quả tìm, gợi ý, và thẻ trang chủ. */
export function DongBan({ n, phu, daTheoDoi, onTheoDoi, gon }) {
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState(false);
  const bam = async () => {
    if (dang || daTheoDoi) return;
    setDang(true); setLoi(false);
    const kq = await theoDoiId(n.id);
    setDang(false);
    if (kq.ok) onTheoDoi?.(n.id); else setLoi(true);
  };
  return (
    <li className={`flex items-center gap-3 rounded-2xl ${gon ? "px-1 py-1.5" : "px-2 py-2 hover:bg-surface2"}`}>
      <Avatar khoa={n.avatar || ""} ten={n.name} size={gon ? 32 : 40} dungYen />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink">{n.name}</span>
        <span className="block truncate text-xs text-soft">@{n.username}{phu ? ` · ${phu}` : ""}</span>
        {loi && <span className="block text-xs font-semibold text-danger">{tr("Chưa theo dõi được, thử lại.", "Échec, réessayez.", "Failed, try again.")}</span>}
      </span>
      <button type="button" onClick={bam} disabled={dang || daTheoDoi}
        className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border-0 px-3 py-1.5 font-sans text-xs font-extrabold transition-colors disabled:cursor-default ${daTheoDoi ? "bg-surface2 text-soft" : "bg-primary text-white hover:opacity-90"}`}>
        {dang ? <Loader2 size={13} className="animate-spin" /> : daTheoDoi ? <Check size={13} /> : <UserPlus size={13} />}
        {daTheoDoi ? tr("Đã theo dõi", "Suivi", "Following") : n.theo_doi_toi ? tr("Theo dõi lại", "Suivre aussi", "Follow back") : tr("Theo dõi", "Suivre", "Follow")}
      </button>
    </li>
  );
}

export default function TimBan({ dong, onDoi, tuKhoaDau = "" }) {
  const [q, setQ] = useState(tuKhoaDau);
  const [kq, setKq] = useState([]);
  const [dangTim, setDangTim] = useState(false);
  const [goiY, setGoiY] = useState(undefined);
  const [daTD, setDaTD] = useState(() => new Set());
  const [toi, setToi] = useState(null);
  const [daChep, setDaChep] = useState(false);
  const o = useRef(null);

  useEffect(() => {
    o.current?.focus();
    goiYBan().then(setGoiY);
    loadDanhTinh().then(setToi).catch(() => {});
    const esc = (e) => { if (e.key === "Escape") dong(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [dong]);

  /* Tìm sau 300 ms ngừng gõ; bỏ kết quả của lượt cũ nếu lượt mới đã bắt đầu. */
  useEffect(() => {
    const k = q.trim().replace(/^@+/, "");
    if (k.length < 2) { setKq([]); setDangTim(false); return undefined; }
    setDangTim(true);
    let con = true;
    const h = setTimeout(() => timBan(k).then((x) => { if (!con) return; setKq(x); setDangTim(false); }), 300);
    return () => { con = false; clearTimeout(h); };
  }, [q]);

  const daTheo = (id) => { setDaTD((s) => new Set(s).add(id)); onDoi?.(); };
  const chep = async () => {
    if (!toi?.username) return;
    try { await navigator.clipboard.writeText(linkKetBan(toi.username)); setDaChep(true); setTimeout(() => setDaChep(false), 2000); } catch { /* trình duyệt chặn */ }
  };
  const dangTimKiem = q.trim().replace(/^@+/, "").length >= 2;

  /* Portal ra body: thẻ trang chủ có backdrop-blur, mà backdrop-filter biến nó thành
     khung chứa của mọi con `fixed` — không portal thì hộp này bị kẹt trong thẻ. */
  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4 font-sans" onMouseDown={(e) => { if (e.target === e.currentTarget) dong(); }}>
      <div role="dialog" aria-modal="true" aria-label={tr("Tìm bạn học", "Trouver des camarades", "Find classmates")}
        className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-solid border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h3 className="m-0 flex items-center gap-2 text-lg font-extrabold text-ink"><Users size={20} className="text-primary" />{tr("Tìm bạn học", "Trouver des camarades", "Find classmates")}</h3>
          <button type="button" onClick={dong} aria-label={tr("Đóng", "Fermer", "Close")}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-ink"><X size={16} /></button>
        </div>

        <label className="mx-5 mt-4 flex items-center gap-2 rounded-xl border border-solid border-line bg-bg px-3 focus-within:border-primary">
          <Search size={16} className="shrink-0 text-soft" />
          <input ref={o} value={q} onChange={(e) => setQ(e.target.value)} autoCapitalize="none" autoComplete="off"
            placeholder={tr("Tên bạn học hoặc @username", "Nom ou @nom d'utilisateur", "Name or @username")}
            className="w-full border-0 bg-transparent py-2.5 font-sans text-sm text-ink outline-none" />
          {dangTim && <Loader2 size={15} className="shrink-0 animate-spin text-soft" />}
        </label>

        <div className="mt-3 min-h-[12rem] overflow-y-auto overscroll-contain px-3 pb-3">
          {dangTimKiem ? (
            kq === null ? <p className="m-0 p-4 text-sm text-danger">{tr("Không tìm được, thử lại.", "Recherche impossible.", "Search failed.")}</p>
              : !kq.length && !dangTim ? <p className="m-0 p-4 text-center text-sm text-soft">{tr("Không có bạn học nào khớp. Thử gõ tên khác, hoặc gửi link kết bạn ở dưới.", "Aucun résultat.", "No match.")}</p>
              : (
                <ul className="m-0 flex list-none flex-col p-0">
                  {kq.map((n) => <DongBan key={n.id} n={n} daTheoDoi={n.dang_theo_doi || daTD.has(n.id)} onTheoDoi={daTheo}
                    phu={n.theo_doi_toi ? tr("đang theo dõi bạn", "vous suit", "follows you") : ""} />)}
                </ul>
              )
          ) : (
            <>
              <p className="m-0 flex items-center gap-1.5 px-2 pt-1 text-xs font-extrabold uppercase tracking-wider text-soft"><Sparkles size={13} />{tr("Gợi ý cho bạn", "Suggestions", "Suggested for you")}</p>
              {goiY === undefined ? <div className="grid place-items-center py-8 text-soft"><Loader2 size={20} className="animate-spin" /></div>
                : goiY === null ? <p className="m-0 p-4 text-sm text-danger">{tr("Không tải được gợi ý.", "Suggestions indisponibles.", "Couldn't load suggestions.")}</p>
                : !goiY.length ? <p className="m-0 p-4 text-center text-sm text-soft">{tr("Bạn đã theo dõi hết mọi người rồi!", "Vous suivez déjà tout le monde !", "You already follow everyone!")}</p>
                : (
                  <ul className="m-0 mt-1 flex list-none flex-col p-0">
                    {goiY.map((n) => <DongBan key={n.id} n={n} phu={LY_DO(n)} daTheoDoi={daTD.has(n.id)} onTheoDoi={daTheo} />)}
                  </ul>
                )}
            </>
          )}
        </div>

        {toi?.username && (
          <div className="flex flex-wrap items-center gap-2 border-0 border-t border-solid border-line px-5 py-3">
            <span className="min-w-0 flex-1 text-xs text-soft">
              {tr("Tên của bạn", "Votre identifiant", "Your handle")}: <strong className="text-ink">@{toi.username}</strong>
            </span>
            <button type="button" onClick={chep}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary-soft px-3 py-1.5 font-sans text-xs font-extrabold text-primary hover:bg-primary hover:text-white">
              {daChep ? <Check size={13} /> : <Link2 size={13} />}{daChep ? tr("Đã chép link", "Lien copié", "Link copied") : tr("Chép link kết bạn", "Copier mon lien", "Copy my link")}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
