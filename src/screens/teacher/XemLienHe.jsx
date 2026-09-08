import React, { useEffect, useMemo, useState } from "react";
import { Inbox, RefreshCw, AlertTriangle, Mail, Phone } from "lucide-react";
import { docLienHe, VAI, MUC_TIEU } from "../../shared/lienHe.js";

/* Xem đăng ký tư vấn — màn hình của giáo viên.
 *
 * ══ MỘT NGƯỜI THẬT ĐÃ ĐỂ LẠI SỐ ĐIỆN THOẠI ══
 *
 * Mỗi dòng ở đây là một người đang chờ một cuộc gọi. Nên màn này ưu tiên hai
 * thứ: liên hệ được NGAY (mailto, tel bấm là gọi), và biết ai chờ LÂU NHẤT.
 *
 * Không có nút xoá. Xoá một dòng liên hệ là xoá dấu vết duy nhất rằng có người
 * đã tìm tới — và một cú bấm nhầm ở đây không hoàn lại được. Muốn dọn thì dọn
 * bằng SQL, có chủ đích. `anon` và `authenticated` đều không có quyền DELETE
 * (migration 077), nên kể cả có nút thì nó cũng không chạy.
 *
 * ══ KHÔNG CÓ Ô TÌM KIẾM, CHƯA CẦN ══
 *
 * Danh sách này sẽ dài rất chậm. Thêm bộ lọc bây giờ là dựng một cái điều
 * khiển cho một vấn đề chưa có, và nó chiếm chỗ của thứ đang cần: nhìn thấy
 * người mới nhất ngay khi mở màn.
 */

const TEN_VAI = Object.fromEntries(VAI);
const TEN_MUC = Object.fromEntries(MUC_TIEU);

/* Bao lâu rồi. Ngày giờ tuyệt đối trả lời "lúc nào", nhưng câu hỏi thật ở đây
   là "người này chờ bao lâu rồi" — và một khoảng thời gian trả lời thẳng câu
   đó mà không bắt ai trừ nhẩm. */
function baoLau(iso) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const phut = Math.floor((Date.now() - t) / 60000);
  if (phut < 1) return "vừa xong";
  if (phut < 60) return `${phut} phút trước`;
  const gio = Math.floor(phut / 60);
  if (gio < 24) return `${gio} giờ trước`;
  const ngay = Math.floor(gio / 24);
  return ngay === 1 ? "hôm qua" : `${ngay} ngày trước`;
}

function TheLienHe({ r }) {
  return (
    <li className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-ink">{r.ho_ten}</span>
        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
          {TEN_VAI[r.vai] ?? r.vai}
        </span>
        {r.muc_tieu && (
          <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-semibold text-soft">
            {TEN_MUC[r.muc_tieu] ?? r.muc_tieu}
          </span>
        )}
        <span className="ml-auto text-xs text-soft">{baoLau(r.created_at)}</span>
      </div>

      {/* Bấm là liên hệ được ngay. Bắt người ta bôi đen rồi chép sang ứng dụng
          khác là ba thao tác thừa cho việc sẽ làm mỗi ngày. */}
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <a href={`mailto:${r.email}`}
          className="inline-flex items-center gap-1.5 font-semibold text-primary no-underline">
          <Mail size={13} /> {r.email}
        </a>
        {r.dien_thoai && (
          <a href={`tel:${r.dien_thoai}`}
            className="inline-flex items-center gap-1.5 font-semibold text-primary no-underline">
            <Phone size={13} /> {r.dien_thoai}
          </a>
        )}
      </div>

      {r.noi_dung && (
        <p className="m-0 mt-3 whitespace-pre-wrap rounded-xl bg-surface2 p-3 text-sm leading-relaxed text-ink">
          {r.noi_dung}
        </p>
      )}
    </li>
  );
}

export default function XemLienHe() {
  const [ds, setDs] = useState(undefined);   // undefined = đang tải, null = lỗi

  const tai = async () => { setDs(undefined); setDs(await docLienHe(200)); };
  useEffect(() => { tai(); }, []);

  const moiHomNay = useMemo(() => {
    if (!Array.isArray(ds)) return 0;
    const mocDau = new Date(); mocDau.setHours(0, 0, 0, 0);
    return ds.filter((r) => new Date(r.created_at).getTime() >= mocDau.getTime()).length;
  }, [ds]);

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-ink">Đăng ký tư vấn</h1>
          <p className="m-0 mt-1 text-sm text-soft">
            Mỗi dòng là một người đang chờ bạn gọi lại.
          </p>
        </div>
        <button type="button" onClick={tai}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-left text-sm font-semibold text-ink">
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>

      {ds === undefined ? (
        <p className="mt-10 text-center text-sm text-soft">Đang tải…</p>
      ) : ds === null ? (
        /* "Không đọc được" KHÁC "chưa ai đăng ký". Gộp lại là báo tin vui cho
           một sự cố. */
        <div className="mt-8 rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">Không đọc được danh sách</p>
          <p className="m-0 mt-1 text-sm text-ink">
            Kiểm tra kết nối, và chắc chắn tài khoản này có vai giáo viên —
            chỉ giáo viên đọc được bảng này.
          </p>
        </div>
      ) : ds.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <Inbox size={22} className="mx-auto text-soft" />
          <p className="m-0 mt-2 font-bold text-ink">Chưa có ai đăng ký</p>
          {/* Nói đúng lý do đang có: form đã được gỡ khỏi trang giới thiệu,
              nên không có đường nào để ai gửi vào đây. Im lặng ở chỗ này thì
              giáo viên mở màn mỗi ngày và tưởng chưa ai quan tâm. */}
          <p className="m-0 mt-1 text-sm leading-relaxed text-soft">
            Form đăng ký hiện KHÔNG có trên trang giới thiệu, nên chưa có đường
            nào để ai gửi thông tin vào đây. Bật lại form thì các đăng ký mới sẽ
            hiện ở màn này.
          </p>
        </div>
      ) : (
        <>
          <p className="m-0 mt-5 text-xs font-semibold text-soft">
            {ds.length} người · {moiHomNay} người hôm nay
          </p>
          <ul className="m-0 mt-3 list-none space-y-3 p-0">
            {ds.map((r) => <TheLienHe key={r.id} r={r} />)}
          </ul>
        </>
      )}
    </div>
  );
}
