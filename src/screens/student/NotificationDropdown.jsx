import React from "react";
import { Bell, Megaphone, AlarmClock, CheckCircle2, RotateCcw } from "lucide-react";
import { thoiGianTuongDoi } from "../../shared/display.js";

/* Bảng thông báo thả xuống từ chuông.
 *
 * Tách khỏi Bell.jsx vì hai việc khác nhau: Bell lo NGUỒN dữ liệu (đọc bảng,
 * realtime, đánh dấu đã đọc), file này lo HIỂN THỊ. Bell.jsx đang là một file
 * gần 900 dòng chứa cả màn hình học sinh; nhồi thêm bố cục vào đó thì không ai
 * tìm ra thứ gì nữa.
 *
 * Nhận `notifs` đã dựng sẵn, không tự gọi mạng. Nhờ vậy nó dựng được trong
 * trang xem thử với dữ liệu giả — xem đầu preview.jsx về việc màn nào được
 * phép vào đó.
 *
 * ══ MÀU ĐI QUA TOKEN, KHÔNG VIẾT CỨNG ══
 *
 * Bản mô tả đề nghị `bg-[#1C1D22]`, `text-gray-200`, `text-blue-500`. Đúng màu
 * cho bản tối, nhưng viết cứng thì bảng này giữ nguyên màu tối khi người dùng
 * bật bản SÁNG — và `check:design` chặn (quy tắc 2 của dự án).
 *
 * Token cho ra đúng những màu ấy ở bản tối: `surface` = #1E1E27,
 * `surface2` = #14141A, `line` = #33333F, `primary` = #8AB4F8. Bản sáng thì
 * chúng tự đảo. Cùng một lớp CSS, hai diện mạo, không cần nhánh `if` nào. */

/* Bốn loại thông báo, mỗi loại một biểu tượng và một màu.
 *
 * Màu ở đây MANG NGHĨA, không phải trang trí: đỏ là việc phải làm lại, cam là
 * sắp hết hạn, xanh lá là đã xong, xanh dương là tin từ giáo viên. Người dùng
 * đọc màu trước khi đọc chữ.
 *
 * Không dùng emoji nữa. Emoji vẽ khác nhau trên mỗi hệ điều hành, không đổi
 * màu theo trạng thái, và trên Windows thì cỡ chữ nhảy — dự án đã dính một lần
 * với cờ 🇻🇳 (xem CLAUDE.md). Icon vector thì nhất quán và tô màu được. */
const LOAI = {
  annonce: { Icon: Megaphone,   nen: "bg-primary-soft", chu: "text-primary", ten: "Thông báo từ giáo viên" },
  due:     { Icon: AlarmClock,  nen: "bg-warn-soft",    chu: "text-warn",    ten: "Sắp đến hạn nộp" },
  graded:  { Icon: CheckCircle2, nen: "bg-ok-soft",     chu: "text-ok",      ten: "Bài đã được chấm" },
  redo:    { Icon: RotateCcw,   nen: "bg-danger-soft",  chu: "text-danger",  ten: "Cần làm lại" },
};

function MotThongBao({ n, onClick }) {
  const kieu = LOAI[n.loai] ?? LOAI.annonce;
  const { Icon } = kieu;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        /* `text-left` bắt buộc: preflight đang TẮT nên `<button>` giữ
           `text-align: center` mặc định của trình duyệt, và mọi dòng chữ trong
           đây sẽ nằm giữa. Quy tắc 3 của dự án. */
        className="flex w-full cursor-pointer items-start gap-3 rounded-xl border-0 bg-transparent p-3
                   text-left transition-colors hover:bg-surface2"
      >
        <span aria-hidden
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${kieu.nen} ${kieu.chu}`}>
          <Icon size={17} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink">{n.title ?? kieu.ten}</span>
          {/* `line-clamp-2`: thông báo dài tới 2000 ký tự, và một cái như thế
              sẽ đẩy mọi thứ khác ra khỏi tầm nhìn. Cắt ở hai dòng.

              KHÔNG thêm `block` ở đây. `line-clamp-2` đặt
              `display: -webkit-box`, và `block` ghi đè lên đúng thuộc tính ấy
              — khi đó `-webkit-line-clamp: 2` vẫn nằm trong CSS nhưng không có
              tác dụng gì. Đã đo: `display` ra `block`, chiều cao 520px thay vì
              hai dòng.

              Biến thể mới của bẫy Tailwind trong CLAUDE.md: lần trước là class
              KHÔNG sinh ra CSS, lần này class có sinh ra nhưng bị class khác
              đè. `check:css` bắt được cái thứ nhất, không bắt được cái này. */}
          <span className="mt-0.5 line-clamp-2 text-sm text-soft">{n.text}</span>
          {n.ts && (
            <span className="mt-1 block text-xs text-soft/80">{thoiGianTuongDoi(n.ts)}</span>
          )}
        </span>

        {/* Chấm chưa đọc. `animate-pulse` chứ không phải một chấm đứng yên —
            nó là thứ mắt bắt được khi lướt qua danh sách.

            `aria-label` chứ không phải chỉ màu: người dùng trình đọc màn hình
            và người mù màu đều không nhận được thông tin từ một chấm xanh. */}
        {n.chuaDoc && (
          <span aria-label="chưa đọc"
                className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
        )}
      </button>
    </li>
  );
}

export default function NotificationDropdown({ notifs, dangTai, soChuaDoc, onDocHet, onChon }) {
  return (
    /* `overflow-hidden` để góc bo cắt được danh sách bên trong — thiếu nó thì
       mục đầu và mục cuối tràn ra khỏi bốn góc tròn. */
    <div className="overflow-hidden rounded-2xl border border-solid border-line bg-surface shadow-2xl">

      {/* ── Đầu bảng ── */}
      <div className="flex items-center justify-between gap-3 border-0 border-b border-solid border-line px-4 py-3">
        <h2 className="m-0 text-base font-bold text-ink">
          Thông báo
          {soChuaDoc > 0 && (
            <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
              {soChuaDoc}
            </span>
          )}
        </h2>

        {/* Bản mô tả xin một liên kết "Xem tất cả". Hệ thống KHÔNG có trang
            thông báo nào — `navItems.js` không khai route đó — nên liên kết ấy
            sẽ dẫn tới trang trống. Quy tắc 1: đừng dựng thứ không có thật.

            Thay bằng một hành động CÓ THẬT và hữu ích hơn ở đúng vị trí ấy.
            Chỉ hiện khi còn thứ để đánh dấu — một nút bấm vào không đổi gì là
            một ngõ cụt câm. */}
        {soChuaDoc > 0 && (
          <button type="button" onClick={onDocHet}
            className="cursor-pointer rounded-lg border-0 bg-transparent px-2 py-1 text-sm font-semibold
                       text-primary transition-colors hover:bg-primary-soft">
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      {/* ── Thân ── */}
      {dangTai ? (
        /* BA nhánh, không phải hai. Lượt đọc đầu chưa xong thì danh sách rỗng,
           và hiện "không có thông báo nào" lúc ấy là khẳng định một điều ta
           chưa biết. Khung xương nói đúng thứ đang xảy ra. */
        <div className="space-y-3 p-3" aria-busy="true" aria-label="Đang tải thông báo">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface2" />
              <span className="flex-1 space-y-2 py-1">
                <span className="block h-3 w-2/5 animate-pulse rounded bg-surface2" />
                <span className="block h-3 animate-pulse rounded bg-surface2" />
                <span className="block h-3 w-3/4 animate-pulse rounded bg-surface2" />
              </span>
            </div>
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <span aria-hidden className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface2 text-soft">
            <Bell size={22} />
          </span>
          <p className="m-0 mt-3 text-sm font-bold text-ink">Aucune notification</p>
          <p className="m-0 mt-1 text-xs text-soft">Tout est à jour ! 🎉</p>
        </div>
      ) : (
        /* `max-h` + `mcf-scroll`: thanh cuộn mảnh, nền trong suốt, đã có sẵn
           trong base.css. `overscroll-contain` chặn việc cuộn hết danh sách rồi
           trang phía sau cuộn tiếp — trên trackpad thì hiện tượng đó khiến
           người dùng tưởng bảng tự đóng. */
        <ul className="mcf-scroll m-0 max-h-[400px] list-none overflow-y-auto overscroll-contain p-2">
          {notifs.map((n) => (
            <MotThongBao key={n.id} n={n} onClick={() => onChon?.(n)} />
          ))}
        </ul>
      )}
    </div>
  );
}
