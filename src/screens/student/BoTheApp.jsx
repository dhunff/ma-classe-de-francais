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
        <ThuVienBoThe ds={ds} onMo={moBo} />
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
        {bo && <LuyenBoThe bo={bo} onThoat={() => setMan("LIBRARY")} />}
      </div>

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
