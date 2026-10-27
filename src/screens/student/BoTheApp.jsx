import React, { useEffect, useState } from "react";
import ThuVienBoThe from "./ThuVienBoThe.jsx";
import LuyenBoThe from "./LuyenBoThe.jsx";
import { docCacBo, docQuyenBoCuaToi } from "../../shared/boThe.js";
import { Lock, X, CreditCard } from "lucide-react";
import PaymentModal from "./PaymentModal.jsx";
import { load } from "../../shared/storage.js";
import { PAYMENT_KEY, memoSafe } from "../../shared/access.js";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";
import { docTheSoTu, onTheSoTu, themTu, xoaTu } from "../../shared/soTu.js";
import { xepLichOn, ngayCong } from "../../shared/sm2.js";
import { BookMarked, ChevronRight, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NGUON_SO_TU = { doc: docTheSoTu, cham: onTheSoTu };

/* Vỏ chứa hai màn: thư viện và màn luyện, trượt ngang giữa hai bên.
 *
 * ══ VÌ SAO KHÔNG DÙNG ROUTE ══
 *
 * Đổi route thì React Router THÁO màn cũ khỏi cây DOM ngay khi màn mới gắn
 * vào — không còn gì để trượt ra. Muốn hoạt ảnh thì hai màn phải cùng tồn tại
 * trong một khoảnh khắc, nên trạng thái ở đây là `useState`, không phải URL.
 *
 * Đánh đổi có thật, và phải nói ra: nút Back của trình duyệt KHÔNG quay về thư
 * viện, và không bookmark được một bộ đang luyện. Bù lại bằng phím Escape và
 * một nút Back rõ ràng trong màn luyện. Nếu sau này cần chia sẻ link tới một
 * bộ, đây là chỗ phải đổi — và khi đó hoạt ảnh trượt sẽ phải hi sinh hoặc
 * chuyển sang View Transitions API.
 *
 * ══ HOẠT ẢNH TRƯỢT HOẠT ĐỘNG THẾ NÀO ══
 *
 * Vỏ ngoài `relative overflow-hidden`. Hai màn chồng lên nhau, mỗi màn
 * `w-full`, và chỉ dịch bằng `translate-x`:
 *
 *     LIBRARY:  thư viện  translate-x-0        · luyện  translate-x-full
 *     GAME:     thư viện  -translate-x-full    · luyện  translate-x-0
 *
 * `overflow-hidden` ở vỏ cắt phần tràn ra, nên không có thanh cuộn ngang nào
 * xuất hiện trong lúc trượt.
 *
 * Ba chi tiết dễ bỏ sót, mỗi cái hỏng một kiểu:
 *
 * 1. `pointer-events-none` cho màn đang ẩn. Thiếu nó thì màn nằm ngoài khung
 *    vẫn bắt được chuột và bàn phím — người dùng Tab vào một nút vô hình.
 * 2. `aria-hidden` cho màn ẩn, vì trình đọc màn hình không quan tâm phần tử
 *    nằm ngoài khung nhìn; thiếu nó thì nó đọc cả hai màn liền nhau.
 * 3. Màn ẩn vẫn chiếm chỗ trong luồng nếu để `static`. Nên màn thứ hai là
 *    `absolute inset-0` — và vì thế vỏ phải có chiều cao (`min-h-full`), nếu
 *    không nó sập xuống 0 và không thấy gì cả.
 *
 * `motion-reduce:transition-none` — người bật "giảm chuyển động" trong hệ điều
 * hành thường bật vì chuyển động làm họ chóng mặt, không phải vì thẩm mỹ.
 */

const NHIP = "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

export default function BoTheApp({ name }) {
  const [man, setMan] = useState("LIBRARY");   // 'LIBRARY' | 'GAME'
  const [bo, setBo] = useState(null);
  const [ds, setDs] = useState(undefined);

  useEffect(() => {
    let con = true;
    Promise.all([docCacBo(), docQuyenBoCuaToi().catch(() => ({ vip: false, bo: new Set() }))]).then(([v, q]) => {
      if (!con) return;
      /* Bộ trả phí mà chưa có quyền → khoá (RLS cũng chặn đọc thẻ, đây chỉ để hiện ổ khoá). */
      setDs(Array.isArray(v) ? v.map((b) => ({ ...b, khoa: b.traPhi && !q.vip && !q.bo.has(b.id) })) : v);
    });
    return () => { con = false; };
  }, []);

  /* Escape để thoát, bù cho việc nút Back của trình duyệt không dùng được ở
     đây. Gắn ở `window` chứ không ở một phần tử: lúc bấm Escape, tiêu điểm có
     thể đang ở bất kỳ đâu trong màn luyện. */
  useEffect(() => {
    if (man !== "GAME") return;
    const onKey = (e) => { if (e.key === "Escape") setMan("LIBRARY"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [man]);

  const oGame = man === "GAME";

  /* Sổ từ của tôi (23/10): từ học sinh tự ghi khi làm bài, ôn bằng SM-2. */
  const [soTu, setSoTu] = useState(undefined);
  useEffect(() => { if (man === "LIBRARY") docTheSoTu().then(setSoTu); }, [man]);
  const denHanSoTu = Array.isArray(soTu) ? xepLichOn(soTu, ngayCong(0)).length : 0;
  /* Học sinh TỰ TẠO thẻ (23/10, theo chủ dự án). Thẻ vào Sổ từ (bảng so_tu, RLS chỉ
     chủ dòng), ôn bằng SM-2 như thẻ giáo viên. Khác đường tao_the_tu_viet đã gỡ 09/09:
     không đụng bảng cards dùng chung, không có hạn mức vì chỉ người tạo thấy. */
  const [taoThe, setTaoThe] = useState(null);   // null đóng · { tu, nghia, viDu, loi, dang }
  const luuThe = async () => {
    if (!taoThe?.tu?.trim() || !taoThe?.nghia?.trim()) { setTaoThe((x) => ({ ...x, loi: tr("Cần cả mặt trước và mặt sau.", "Il faut le recto et le verso.", "Both sides are required.") })); return; }
    setTaoThe((x) => ({ ...x, dang: true, loi: "" }));
    const d = await themTu({ tu: taoThe.tu, nghia: taoThe.nghia, ghiChu: taoThe.viDu, tenBai: tr("Thẻ tự tạo", "Carte perso", "My card") });
    if (!d) { setTaoThe((x) => ({ ...x, dang: false, loi: tr("Chưa lưu được, thử lại nhé.", "Échec, réessayez.", "Couldn't save, try again.") })); return; }
    phat("dung"); setTaoThe({ tu: "", nghia: "", viDu: "", ok: d.tu }); docTheSoTu().then(setSoTu);
  };
  /* Xoá thẻ của tôi: hỏi lại, xoá trên máy chủ (RLS chỉ chủ dòng), đối chiếu số dòng. */
  const xoaThe = async (x) => {
    if (!window.confirm(tr(`Xoá thẻ « ${x.matTruoc} »? Lịch ôn của thẻ cũng mất.`, `Supprimer « ${x.matTruoc} » ?`, `Delete « ${x.matTruoc} »?`))) return;
    if (await xoaTu(x.id)) setSoTu((ds) => (ds ?? []).filter((y) => y.id !== x.id));
    else window.alert(tr("Chưa xoá được, thử lại nhé.", "Échec de la suppression.", "Couldn't delete."));
  };
  const moSoTu = () => { phat("batDau"); setBo({ id: "so-tu", ten: tr("Sổ từ của tôi", "Mon carnet", "My word list"), soTu: true }); setMan("GAME"); };
  useEffect(() => { if (new URLSearchParams(window.location.search).has("so-tu")) moSoTu(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [boKhoa, setBoKhoa] = useState(null);
  const [muaBo, setMuaBo] = useState(null);
  const [payCfg, setPayCfg] = useState(null);
  useEffect(() => { load(PAYMENT_KEY, null).then(setPayCfg).catch(() => {}); }, []);
  /* Mở khoá xong: đánh dấu bộ đã mở rồi vào luyện luôn. */
  const daMua = () => { const b = muaBo; setMuaBo(null); setDs((d) => (Array.isArray(d) ? d.map((x) => (x.id === b.boId ? { ...x, khoa: false } : x)) : d)); };
  const moBo = (b) => {
    if (b.khoa) { phat("sai"); setBoKhoa(b); return; }
    setBo(b); setMan("GAME");
  };

  return (
    <div className="relative min-h-full overflow-hidden">
      {/* ── THƯ VIỆN ── */}
      <div
        aria-hidden={oGame}
        className={`${NHIP} ${oGame
          ? "pointer-events-none -translate-x-full opacity-0"
          : "translate-x-0 opacity-100"}`}
      >
        <Link to="/etudiant/tro-choi" className="mx-4 mt-4 inline-flex items-center gap-1 text-sm font-bold text-soft no-underline hover:text-ink"><ArrowLeft size={16} /> {tr("Trò chơi", "Jeux", "Games")}</Link>
        {/* 26/10: « Thẻ của tôi » và « Bộ thẻ có sẵn » là hai tab ngang trong ThuVienBoThe. */}
        <ThuVienBoThe ds={ds} onMo={moBo} soTu={soTu} onOnSoTu={moSoTu}
          onTaoThe={() => setTaoThe({ tu: "", nghia: "", viDu: "" })} onXoaThe={xoaThe} />
      </div>

      {/* ── MÀN LUYỆN ──
          `absolute inset-0` để nó không đẩy thư viện xuống dưới. Chỉ dựng nội
          dung khi đã chọn bộ: dựng sẵn nghĩa là gọi mạng lấy thẻ cho một bộ
          chưa ai mở. */}
      <div
        aria-hidden={!oGame}
        className={`absolute inset-0 overflow-y-auto ${NHIP} ${oGame
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-full opacity-0"}`}
      >
        {bo && <LuyenBoThe key={bo.id} bo={bo} nguon={bo.soTu ? NGUON_SO_TU : undefined} onThoat={() => setMan("LIBRARY")} />}
      </div>

      {taoThe && (
        <div className="fixed inset-0 z-[450] grid place-items-center bg-black/40 p-4" onClick={() => setTaoThe(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); luuThe(); }}
            className="w-full max-w-md rounded-3xl bg-surface p-5 shadow-2xl">
            <p className="m-0 text-lg font-extrabold text-ink">{tr("Tạo thẻ của tôi", "Créer une carte", "Create a card")}</p>
            <p className="m-0 mt-1 text-xs text-soft">{tr("Thẻ vào « Sổ từ của tôi » và được hẹn lịch ôn tự động.", "La carte rejoint « Mon carnet » avec révisions programmées.", "Goes to « My word list » with scheduled reviews.")}</p>
            <div className="mt-4 grid gap-2.5">
              <input lang="fr" autoFocus maxLength={120} value={taoThe.tu} onChange={(e) => setTaoThe({ ...taoThe, tu: e.target.value, ok: null })}
                placeholder={tr("Mặt trước: từ / câu tiếng Pháp", "Recto : mot ou phrase", "Front: French word or phrase")}
                className="rounded-xl border-2 border-solid border-line bg-surface2 px-3 py-2.5 font-sans text-[15px] font-semibold text-ink outline-none focus:border-primary" />
              <input maxLength={300} value={taoThe.nghia} onChange={(e) => setTaoThe({ ...taoThe, nghia: e.target.value, ok: null })}
                placeholder={tr("Mặt sau: nghĩa", "Verso : sens", "Back: meaning")}
                className="rounded-xl border-2 border-solid border-line bg-surface2 px-3 py-2.5 font-sans text-[15px] text-ink outline-none focus:border-primary" />
              <input lang="fr" maxLength={300} value={taoThe.viDu} onChange={(e) => setTaoThe({ ...taoThe, viDu: e.target.value })}
                placeholder={tr("Ví dụ (không bắt buộc)", "Exemple (facultatif)", "Example (optional)")}
                className="rounded-xl border-2 border-solid border-line bg-surface2 px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-primary" />
            </div>
            {taoThe.loi && <p className="m-0 mt-2 text-sm font-semibold text-danger">{taoThe.loi}</p>}
            {taoThe.ok && <p className="m-0 mt-2 text-sm font-semibold text-ok">{tr(`Đã thêm « ${taoThe.ok} ». Tạo tiếp nhé!`, `« ${taoThe.ok} » ajoutée.`, `Added « ${taoThe.ok} ».`)}</p>}
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setTaoThe(null)} className="flex-1 cursor-pointer rounded-xl border border-solid border-line bg-surface px-4 py-2.5 font-sans text-sm font-bold text-ink">{tr("Đóng", "Fermer", "Close")}</button>
              <button type="submit" disabled={taoThe.dang} className="flex-1 cursor-pointer rounded-xl border-0 bg-primary px-4 py-2.5 font-sans text-sm font-bold text-on-primary disabled:opacity-60">{taoThe.dang ? "…" : tr("Lưu thẻ", "Enregistrer", "Save card")}</button>
            </div>
          </form>
        </div>
      )}

      {muaBo && <PaymentModal ex={muaBo} student={name} config={payCfg} onClose={() => setMuaBo(null)} onUnlocked={daMua} />}

      {/* Bộ trả phí chưa mở khoá */}
      {boKhoa && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setBoKhoa(null)}>
          <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
            className="mcf-cau-vao relative w-full max-w-sm rounded-3xl bg-surface p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
            <button type="button" onClick={() => setBoKhoa(null)} aria-label={tr("Đóng", "Fermer", "Close")}
              className="absolute right-3 top-3 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft"><X size={16} /></button>
            <Leon cam="hum" size={96} className="mx-auto block" />
            <p className="m-0 mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              <Lock size={12} /> {tr("Bộ trả phí", "Paquet payant", "Paid deck")}{boKhoa.gia ? ` · ${boKhoa.gia.toLocaleString("vi-VN")}đ` : ""}
            </p>
            <h2 className="m-0 mt-3 text-lg font-extrabold text-ink">{boKhoa.ten}</h2>
            <p className="m-0 mt-2 text-sm leading-relaxed text-soft">
              {tr("Mua bộ này bằng chuyển khoản để mở khoá ngay. Gói VIP cũng mở được mọi bộ trả phí, hoặc nhờ giáo viên cấp quyền.", "Achetez ce paquet par virement pour le débloquer. L'offre VIP ouvre aussi tous les paquets payants, ou demandez l'accès à votre enseignant.", "Buy this deck by bank transfer to unlock it. VIP also unlocks every paid deck, or ask your teacher for access.")}
            </p>
            {boKhoa.gia > 0 && name && (
              <button type="button" onClick={() => { const b = boKhoa; setBoKhoa(null); setMuaBo({ id: "BO" + memoSafe(b.id).slice(-4), boId: b.id, price: b.gia, title: b.ten, laBo: true }); }}
                className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 border-b-4 border-solid border-blue-800 bg-gradient-to-r from-primary to-indigo-600 px-5 py-3 font-sans text-sm font-extrabold text-white">
                <CreditCard size={16} /> {tr("Mua bằng chuyển khoản", "Acheter par virement", "Buy by bank transfer")} · {boKhoa.gia.toLocaleString("vi-VN")}đ
              </button>
            )}
            <button type="button" onClick={() => setBoKhoa(null)}
              className="mt-2 w-full cursor-pointer rounded-2xl border-0 bg-surface2 px-5 py-3 font-sans text-sm font-bold text-ink">{tr("Để sau", "Plus tard", "Later")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
