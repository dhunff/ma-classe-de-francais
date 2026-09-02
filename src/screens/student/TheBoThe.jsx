import React from "react";
import { ChevronRight } from "lucide-react";

/* Một thẻ bộ trong danh sách thẻ ghi nhớ.
 *
 * Tách khỏi TheGhiNho.jsx vì hai lý do, không phải để chia nhỏ cho vui:
 *   · TheGhiNho.jsx import `storageShim`, nên nó KHÔNG được phép có mặt ở
 *     /preview.html (xem đầu preview.jsx). Thành phần này thuần trình bày —
 *     nhận mọi thứ qua props — nên xem thử được, và hiệu ứng hover là thứ chỉ
 *     nhìn mới biết đúng hay sai.
 *   · Không có logic nào đi theo: cùng một `bo`, cùng một `onMo`.
 *
 * ══ VÌ SAO CẦN `font-sans` Ở ĐÂY ══
 *
 * Preflight của Tailwind ĐANG TẮT (xem CLAUDE.md, quy tắc 3). Preflight chính
 * là thứ đặt `button { font-family: inherit }`. Không có nó, `<button>` rơi về
 * font mặc định của trình duyệt cho phần tử biểu mẫu — và trên máy người dùng
 * nó ra một font chân, lạc hẳn khỏi phần còn lại của app.
 *
 * Đặt `font-sans` lên chính thẻ `<button>` thì mọi chữ bên trong thừa kế theo,
 * nên không phải rắc lại lớp đó lên từng dòng. `font-sans` của dự án đã được
 * trỏ về Plus Jakarta Sans trong tailwind.config.js — dùng nó, đừng viết cứng
 * tên font ở đây, nếu không đổi font toàn app sẽ bỏ sót đúng chỗ này.
 *
 * ══ HIỆU ỨNG ══
 *
 * `group` trên nút để mũi tên phản ứng theo cả thẻ, không phải chỉ khi trỏ
 * đúng vào mũi tên — vùng bấm là CẢ tấm thẻ, nên phản hồi cũng phải theo cả
 * tấm.
 *
 * `active:scale-[0.98]` cho cảm giác bấm được. Nhỏ có chủ ý: quá đà thì mỗi
 * cú bấm thành một hoạt cảnh, và thứ đó chóng chán hơn là chóng thích.
 *
 * ══ BÓNG HOVER NẰM Ở `bo.nen`, KHÔNG Ở ĐÂY ══
 *
 * Bản đầu để `hover:shadow-2xl` ngay trong file này. ĐO RA bóng biến MẤT khi
 * trỏ vào: `box-shadow` tính ra `rgba(0,0,0,0)`. Lý do là Tailwind tách bóng
 * thành hai biến — `--tw-shadow` (hình) và `--tw-shadow-color` (màu). Lớp
 * `shadow-2xl` chỉ đặt lại phần HÌNH, nên ở trạng thái hover nó dùng khuôn
 * mới với một màu không còn được khai — và ra trong suốt.
 *
 * Nên bóng hover phải đi kèm màu, và nằm cùng chỗ với bóng thường: mỗi bộ
 * khai `shadow-lg shadow-<màu>/30 hover:shadow-2xl hover:shadow-<màu>/40`.
 * Ảnh chụp KHÔNG cho thấy lỗi này — bóng nhạt trên nền sáng — chỉ
 * `getComputedStyle` mới thấy.
 *
 * `motion-reduce:transition-none` — người bật giảm chuyển động vẫn dùng được
 * đủ chức năng, chỉ là không có phần trượt. Bỏ qua nó là bỏ rơi đúng nhóm
 * người mà hoạt ảnh gây khó chịu thật sự. */

export default function TheBoThe({ bo, onMo }) {
  const { Icon } = bo;
  return (
    <button type="button" onClick={onMo}
      className={`group relative w-full overflow-hidden rounded-3xl border-0 p-5 text-left font-sans
        transition-all duration-300 ease-out
        hover:-translate-y-1.5
        active:scale-[0.98] active:duration-100
        motion-reduce:transition-none motion-reduce:hover:translate-y-0
        ${bo.nen}`}>

      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20">
        <Icon size={20} className="text-white" />
      </div>

      {/* Nhãn phụ mờ hơn tiêu đề để mắt bám vào tên bộ trước. Cùng một sắc
          trắng, khác độ trong — dùng hai màu khác nhau thì thẻ trông như hai
          mảnh ghép rời. */}
      <div className="mt-14 text-xs font-medium uppercase tracking-wide text-white/70">
        Thẻ ghi nhớ
      </div>
      <div className="text-2xl font-bold tracking-tight text-white">{bo.ten}</div>
      <div className="text-sm font-medium text-white/80">{bo.the.length} thẻ tới hạn</div>

      <span aria-hidden
        className="absolute bottom-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-white/25
          transition-transform duration-300 ease-out
          group-hover:translate-x-1.5
          motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
        <ChevronRight size={18} className="text-white" />
      </span>
    </button>
  );
}
