import React, { useEffect, useState } from "react";
import { X, Plus, AlertTriangle } from "lucide-react";
import { taoTheTuViet, demTheTuViet, HAN_MUC_NGAY } from "../../shared/theGhiNho.js";

/* Ô tạo thẻ của học sinh.
 *
 * ══ HIỆN HẠN MỨC TRƯỚC, KHÔNG PHẢI SAU ══
 *
 * Con số « 3/10 » đọc từ máy chủ NGAY KHI mở ô, trước cả khi người ta gõ chữ
 * đầu tiên. Bắt viết xong cả thẻ rồi mới báo "hết hạn mức hôm nay" là vứt đi
 * công của họ vì một luật mà họ không có cách nào biết trước.
 *
 * Hạn mức THẬT nằm ở máy chủ (migration 073). Con số ở đây chỉ để báo trước —
 * kiểm ở trình duyệt là kiểm ở nơi người dùng sửa được, nên nó không bao giờ
 * là hàng rào.
 *
 * ══ HẾT HẠN MỨC KHÔNG PHẢI LÀ LỖI ══
 *
 * Nên nó không hiện màu đỏ như một sự cố, và tuyệt đối không nói "thử lại
 * sau" — thử lại sẽ không thành công cho tới sáng mai. Nói đúng: hết hôm nay,
 * mai có tiếp, và giải thích vì sao có hạn mức. */

export default function OTaoThe({ mo, onDong, onXong }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [viDu, setViDu] = useState("");
  const [daTao, setDaTao] = useState(null);      // null = chưa đọc được
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");

  useEffect(() => {
    if (!mo) return;
    let con = true;
    demTheTuViet().then((v) => { if (con) setDaTao(v); });
    return () => { con = false; };
  }, [mo]);

  /* Đóng bằng phím Esc. Một hộp thoại chỉ đóng được bằng cách bấm đúng một
     chữ X nhỏ là hộp thoại bẫy người dùng. */
  useEffect(() => {
    if (!mo) return;
    const f = (e) => { if (e.key === "Escape") onDong(); };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [mo, onDong]);

  if (!mo) return null;

  const hetHanMuc = typeof daTao === "number" && daTao >= HAN_MUC_NGAY;

  const luu = async () => {
    setDangLuu(true); setLoi("");
    const kq = await taoTheTuViet({ front, back, viDu });
    setDangLuu(false);
    if (!kq.ok) {
      setLoi({
        het_han_muc: `Hôm nay bạn đã tạo đủ ${HAN_MUC_NGAY} thẻ. Mai tạo tiếp được.`,
        trong: "Mặt trước và mặt sau đều phải có nội dung.",
        qua_dai: "Nội dung quá dài. Thẻ ghi nhớ nên ngắn — một ý mỗi thẻ.",
        chua_dang_nhap: "Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử lại.",
      }[kq.loi] ?? "Không tạo được thẻ. Kiểm tra mạng rồi thử lại.");
      /* Hết hạn mức thì cập nhật luôn con số, để ô đếm khớp với thực tế thay
         vì vẫn hiện 9/10 sau khi máy chủ đã từ chối. */
      if (kq.loi === "het_han_muc") setDaTao(HAN_MUC_NGAY);
      return;
    }
    setFront(""); setBack(""); setViDu("");
    setDaTao(HAN_MUC_NGAY - kq.conLai);
    onXong(kq.conLai);
  };

  return (
    /* Nền mờ đóng hộp thoại khi bấm ra ngoài; `stopPropagation` ở trong để một
       cú bấm vào chính hộp không đóng nó. */
    <div onClick={onDong}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
        className="w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-xl">

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg font-extrabold text-ink">Thẻ của riêng bạn</h2>
            <p className="m-0 mt-1 text-sm text-soft">
              Một từ khó, một cấu trúc hay quên — viết ngắn, mỗi thẻ một ý.
            </p>
          </div>
          <button type="button" onClick={onDong} aria-label="Đóng"
            className="rounded-full border-0 bg-surface2 p-2 text-soft">
            <X size={16} />
          </button>
        </div>

        {/* Ba trạng thái cho con số, không phải hai: chưa đọc được KHÁC 0. */}
        <p className="m-0 mt-4 rounded-xl bg-surface2 px-4 py-2.5 text-sm font-semibold text-ink">
          {daTao === null
            ? "Chưa đọc được số thẻ đã tạo hôm nay."
            : `Bạn đã tạo ${daTao}/${HAN_MUC_NGAY} thẻ hôm nay.`}
          {!hetHanMuc && daTao !== null && (
            <span className="mt-1 block text-xs font-normal text-soft">
              Giới hạn để việc ôn còn vừa sức: mười thẻ mỗi ngày đã là nhiều.
            </span>
          )}
        </p>

        {hetHanMuc ? (
          /* Hết hạn mức không phải sự cố, nên không tô đỏ và không nói "thử
             lại sau" — thử lại sẽ không thành công cho tới sáng mai. */
          <div className="mt-4 rounded-2xl bg-surface2 p-5 text-center">
            <p className="m-0 font-bold text-ink">Đủ thẻ cho hôm nay rồi</p>
            <p className="m-0 mt-1 text-sm text-soft">
              Mai bạn tạo tiếp được. Giờ thì ôn lại những thẻ đang có — đó mới là
              phần làm bạn nhớ.
            </p>
          </div>
        ) : (
          <>
            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-wide text-soft">Mặt trước</span>
              <input value={front} onChange={(e) => setFront(e.target.value)}
                placeholder="Từ hoặc câu hỏi"
                className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm text-ink" />
            </label>

            <label className="mt-3 block">
              <span className="text-xs font-bold uppercase tracking-wide text-soft">Mặt sau</span>
              <textarea rows={2} value={back} onChange={(e) => setBack(e.target.value)}
                placeholder="Nghĩa, hoặc câu trả lời"
                className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm leading-relaxed text-ink" />
            </label>

            <label className="mt-3 block">
              <span className="text-xs font-bold uppercase tracking-wide text-soft">
                Câu ví dụ <span className="font-normal normal-case">(không bắt buộc)</span>
              </span>
              <textarea rows={2} value={viDu} onChange={(e) => setViDu(e.target.value)}
                placeholder="Một câu thật có dùng từ này — nhớ theo ngữ cảnh dễ hơn nhớ rời."
                className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm leading-relaxed text-ink" />
            </label>

            <button type="button" onClick={luu}
              disabled={dangLuu || !front.trim() || !back.trim()}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border-0 bg-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
              <Plus size={15} /> {dangLuu ? "Đang tạo…" : "Tạo thẻ"}
            </button>
          </>
        )}

        {loi && (
          <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-ink">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" /> {loi}
          </p>
        )}
      </div>
    </div>
  );
}
