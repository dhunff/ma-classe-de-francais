import React, { useState } from "react";
import { Send, Check, AlertTriangle } from "lucide-react";
import { guiLienHe, VAI, MUC_TIEU } from "../../shared/lienHe.js";

/* Form đăng ký tư vấn.
 *
 * ══ CHỈ HỎI THỨ SẼ DÙNG ══
 *
 * Bốn trường bắt buộc trở xuống. Form của đối thủ hỏi cả năm sinh; ở đây
 * không, vì nó không cần để gọi lại và lại là dữ liệu cá nhân của người có thể
 * là trẻ vị thành niên. Thu một trường mình không dùng là nhận một trách nhiệm
 * mình không cần.
 *
 * Số điện thoại để TUỲ CHỌN: ai muốn được gọi thì để lại. Bắt buộc nó là đổi
 * một phần tỉ lệ điền form lấy một thứ email đã làm được.
 *
 * ══ NÓI RÕ CHUYỆN GÌ XẢY RA SAU KHI BẤM ══
 *
 * Người để lại số điện thoại có quyền biết ai sẽ gọi và bao giờ. Một nút "Gửi"
 * trơ trọi rồi im lặng là cách nhanh nhất làm người ta tiếc vì đã điền.
 *
 * ══ HẾT HẠN MỨC KHÔNG PHẢI LỖI KỸ THUẬT ══
 *
 * Gửi quá 3 lượt/ngày cho một email thì máy chủ từ chối. Câu chữ phải nói đúng
 * điều đó, và tuyệt đối không nói "thử lại sau" — thử lại sẽ hỏng y hệt.
 */

export default function FormTuVan() {
  const [f, setF] = useState({
    hoTen: "", email: "", dienThoai: "", vai: "hoc_sinh", mucTieu: "chua_biet", noiDung: "",
  });
  const [dangGui, setDangGui] = useState(false);
  const [xong, setXong] = useState(false);
  const [loi, setLoi] = useState("");

  const dat = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const duGui = f.hoTen.trim() && f.email.trim();

  const gui = async () => {
    setDangGui(true); setLoi("");
    const kq = await guiLienHe({ ...f, nguon: "gioi-thieu" });
    setDangGui(false);
    /* Đọc kết quả TRƯỚC khi báo đã gửi. Ở đây hậu quả của việc bỏ qua nặng hơn
       mọi chỗ khác trong dự án: người dùng đóng tab và ngồi chờ một cuộc gọi
       không bao giờ tới. */
    if (!kq.ok) {
      setLoi({
        qua_nhieu: "Địa chỉ này đã gửi đủ ba lần hôm nay. Mai gửi tiếp được, hoặc nhắn thẳng cho giáo viên.",
        thieu_hoac_sai: "Kiểm tra lại họ tên và email — email cần có dạng ten@mien.com.",
      }[kq.loi] ?? "Không gửi được. Kiểm tra kết nối rồi thử lại.");
      return;
    }
    setXong(true);
  };

  if (xong) {
    return (
      <div className="rounded-2xl bg-ok-soft p-6 text-center">
        <Check size={22} className="mx-auto text-ok" />
        <p className="m-0 mt-2 font-bold text-ink">Đã nhận thông tin của bạn</p>
        <p className="m-0 mt-1 text-sm leading-relaxed text-ink">
          Một giáo viên sẽ liên hệ trong vòng hai ngày làm việc. Trong lúc chờ,
          bạn xem thử thư viện bài tập được ngay — không cần tài khoản.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-soft">Họ và tên *</span>
        <input value={f.hoTen} onChange={dat("hoTen")} autoComplete="name"
          className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-sm text-ink" />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-soft">Email *</span>
        <input value={f.email} onChange={dat("email")} type="email" autoComplete="email"
          placeholder="ten@mien.com"
          className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-sm text-ink" />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-soft">
          Số điện thoại <span className="font-normal normal-case">(không bắt buộc)</span>
        </span>
        <input value={f.dienThoai} onChange={dat("dienThoai")} type="tel" autoComplete="tel"
          className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-sm text-ink" />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-soft">Bạn là</span>
        <select value={f.vai} onChange={dat("vai")}
          className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-sm text-ink">
          {VAI.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-soft">Trình độ nhắm tới</span>
        <select value={f.mucTieu} onChange={dat("mucTieu")}
          className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-sm text-ink">
          {MUC_TIEU.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
        </select>
      </label>

      <label className="block sm:col-span-2">
        <span className="text-xs font-bold uppercase tracking-wide text-soft">
          Bạn muốn hỏi gì <span className="font-normal normal-case">(không bắt buộc)</span>
        </span>
        <textarea rows={3} value={f.noiDung} onChange={dat("noiDung")}
          placeholder="Ví dụ: em định thi B1 tháng 12, đang tự học được ba tháng."
          className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2.5 text-sm leading-relaxed text-ink" />
      </label>

      <div className="sm:col-span-2">
        <button type="button" onClick={gui} disabled={dangGui || !duGui}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-primary px-6 py-3 text-left text-sm font-bold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 motion-reduce:transition-none">
          <Send size={15} /> {dangGui ? "Đang gửi…" : "Gửi thông tin"}
        </button>

        {/* Nói trước chuyện gì sẽ xảy ra, và dữ liệu đi đâu. */}
        <p className="m-0 mt-3 text-xs leading-relaxed text-soft">
          Thông tin chỉ dùng để liên hệ tư vấn, và chỉ giáo viên của FRACILE đọc
          được. Không gửi cho bên thứ ba, không dùng để quảng cáo.
        </p>

        {loi && (
          <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-ink">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" /> {loi}
          </p>
        )}
      </div>
    </div>
  );
}
