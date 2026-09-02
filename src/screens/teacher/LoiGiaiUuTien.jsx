import React, { useEffect, useState } from "react";
import { Lightbulb, Users, RefreshCw, Check, AlertTriangle, Layers } from "lucide-react";
import { docCauCanLoiGiai, luuLoiGiai } from "../../shared/loiGiai.js";

/* Viết lời giải — màn hình của giáo viên.
 *
 * ══ VÌ SAO KHÔNG PHẢI MỘT DANH SÁCH 166 CÂU ══
 *
 * Thư viện thiếu 166 lời giải. Bày cả 166 ra là bày một việc không bao giờ
 * xong, và người ta đóng tab. Nhưng chúng KHÔNG đáng giá như nhau: một câu ba
 * học sinh cùng sai chín lượt đáng viết trước một câu chưa ai làm.
 *
 * Nên màn này xếp theo SỐ NGƯỜI từng sai. Viết mười câu đầu là chạm tới phần
 * lớn lỗi sai thật đang xảy ra — và mười câu thì làm được trong một buổi.
 *
 * ══ HAI CON SỐ, KHÔNG PHẢI MỘT ══
 *
 * « 3 học sinh · 9 lượt » nói hai điều khác nhau. Một người làm lại mười lần
 * và sai cả mười cho ra « 1 học sinh · 10 lượt » — trông y hệt mười người cùng
 * sai nếu chỉ đếm lượt. Cái sau là câu ra đề tốt, cái trước là một người đang
 * luyện. Gộp thành một con số là xoá mất phần phân biệt.
 */

function TheCau({ cau, onXong }) {
  const [chu, setChu] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");

  const luu = async () => {
    if (!chu.trim()) { setLoi("Chưa có gì để lưu."); return; }
    setDangLuu(true); setLoi("");
    const kq = await luuLoiGiai(cau.question_id, chu);
    setDangLuu(false);
    /* Đọc kết quả TRƯỚC khi gỡ thẻ khỏi danh sách. Bỏ qua thì câu biến mất
       khỏi màn hình, giáo viên tin đã viết xong, và nó vẫn thiếu lời giải. */
    if (!kq.ok) {
      setLoi(kq.loi === "khong_phai_giao_vien"
        ? "Tài khoản này không có quyền viết lời giải."
        : "Không lưu được. Kiểm tra mạng rồi thử lại.");
      return;
    }
    onXong(cau.question_id, kq.soTheLamMoi);
  };

  return (
    <li className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-bold text-ink">
          <Users size={12} /> {cau.so_hoc_sinh} học sinh
        </span>
        <span className="text-xs text-soft">{cau.so_lan_sai} lượt sai</span>
        <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-semibold text-soft">
          {cau.loai}
        </span>
        <span className="ml-auto truncate text-xs text-soft">{cau.ten_bai}</span>
      </div>

      <p className="m-0 mt-3 text-sm font-bold leading-relaxed text-ink">{cau.prompt}</p>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wide text-soft">
          Lời giải thích{" "}
          <span className="font-normal normal-case">
            (học sinh đọc khi làm sai, và nó thành mặt sau thẻ ghi nhớ)
          </span>
        </span>
        {/* Gợi ý viết gì, không phải gợi ý gõ gì. Ô trống với chữ mờ « Nhập nội
            dung » không giúp ai bắt đầu; một câu mẫu đúng kiểu thì có. */}
        <textarea rows={3} value={chu} onChange={(e) => setChu(e.target.value)}
          placeholder="Vì sao đáp án đúng là đúng, và vì sao đáp án hấp dẫn kia là bẫy."
          className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm leading-relaxed text-ink" />
      </label>

      <button type="button" onClick={luu} disabled={dangLuu || !chu.trim()}
        className="mt-3 rounded-full border-0 bg-primary px-5 py-2.5 text-left text-sm font-bold text-white disabled:opacity-50">
        {dangLuu ? "Đang lưu…" : "Lưu lời giải"}
      </button>

      {loi && <p className="m-0 mt-2 text-xs font-semibold text-danger">{loi}</p>}
    </li>
  );
}

export default function LoiGiaiUuTien() {
  const [ds, setDs] = useState(undefined);   // undefined = đang tải, null = lỗi
  const [tin, setTin] = useState("");

  const tai = async () => {
    setDs(undefined); setTin("");
    setDs(await docCauCanLoiGiai(40));
  };

  useEffect(() => { tai(); }, []);

  const xong = (id, soThe) => {
    setDs((p) => (p ?? []).filter((x) => x.question_id !== id));
    /* Nói ra số thẻ vừa được làm mới. Đây là chỗ duy nhất giáo viên thấy được
       rằng việc mình vừa làm chạm tới học sinh nào đó ngay lập tức — thay vì
       một câu "đã lưu" không nói gì thêm. */
    setTin(soThe > 0
      ? `Đã lưu, và làm mới ${soThe} thẻ ghi nhớ đang trống nội dung.`
      : "Đã lưu. Chưa có thẻ nào dựng từ câu này.");
  };

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-ink">Câu cần lời giải</h1>
          <p className="m-0 mt-1 text-sm text-soft">
            Xếp theo số học sinh từng làm sai. Viết mười câu đầu là chạm tới phần
            lớn lỗi sai đang xảy ra thật.
          </p>
        </div>
        <button type="button" onClick={tai}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-left text-sm font-semibold text-ink">
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>

      {tin && (
        <p className="m-0 mt-5 inline-flex items-center gap-2 rounded-xl bg-ok-soft px-4 py-3 text-sm font-semibold text-ink">
          <Check size={14} /> {tin}
        </p>
      )}

      {ds === undefined ? (
        <p className="mt-10 text-center text-sm text-soft">Đang tải…</p>
      ) : ds === null ? (
        /* "Không đọc được" KHÁC "đã viết hết". Gộp lại là chúc mừng người vừa
           gặp sự cố. */
        <div className="mt-8 rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">Không đọc được danh sách</p>
          <p className="m-0 mt-1 text-sm text-ink">
            Kiểm tra kết nối, và chắc chắn tài khoản này có vai giáo viên.
          </p>
        </div>
      ) : ds.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <Lightbulb size={22} className="mx-auto text-ok" />
          <p className="m-0 mt-2 font-bold text-ink">Không còn câu nào thiếu lời giải</p>
          <p className="m-0 mt-1 text-sm text-soft">
            Câu đúng/sai không nằm trong danh sách này: chúng đã có sẵn phần
            justification hiện ngay dưới đáp án.
          </p>
        </div>
      ) : (
        <>
          <p className="m-0 mt-5 flex items-center gap-2 text-xs font-semibold text-soft">
            <Layers size={13} /> {ds.length} câu trong danh sách
          </p>
          <ul className="m-0 mt-3 list-none space-y-4 p-0">
            {ds.map((c) => (
              <TheCau key={c.question_id} cau={c} onXong={xong} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
