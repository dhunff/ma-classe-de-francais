import React, { useMemo, useState } from "react";
import { ChevronsRight, AlertTriangle, Layers } from "lucide-react";
import { KY_NANG } from "../../shared/kyNang.js";

/* Thư viện bộ thẻ — cột tab dọc bên trái, lưới thẻ bên phải.
 *
 * ══ TAB DỌC HOẠT ĐỘNG THẾ NÀO ══
 *
 * `[writing-mode:vertical-lr]` xoay DÒNG CHỮ, không xoay hộp: chữ chạy từ trên
 * xuống nhưng mỗi ký tự vẫn đứng thẳng. Đọc được, nhưng ngược chiều quen thuộc
 * của mắt — nên thêm `rotate-180` để dòng chạy từ dưới lên, đúng kiểu gáy sách.
 *
 * Hai lớp phải đi CÙNG NHAU. Chỉ `writing-mode` thì chữ đọc từ trên xuống và
 * nhãn cuối cùng nằm sát đáy; chỉ `rotate-180` thì cả khối chữ lộn ngược.
 *
 * `rotate-180` xoay quanh TÂM phần tử, nên nút phải có bề rộng cố định
 * (`w-11`) — để chiều rộng tự co theo chữ thì mỗi tab rộng một kiểu và sau khi
 * xoay chúng lệch nhau vài pixel theo trục ngang.
 *
 * `check:css` canh hai lớp này thật sự sinh ra CSS: Tailwind BỎ QUA lớp không
 * tồn tại mà không báo gì, và một tab dọc hỏng trông y hệt một tab thường.
 *
 * ══ VÌ SAO KHÔNG PHẢI `bg-gray-800/80` ══
 *
 * Bản mô tả yêu cầu màu tối viết cứng. Không dùng, vì dự án đã có token tự đảo
 * theo bản sáng/tối (`styles/tokens.css`): `bg-surface` là #FFFFFF ở bản sáng
 * và #1E1E27 ở bản tối. Viết `bg-gray-800/80` thì bản tối trông đúng ý còn bản
 * sáng thành thẻ xám than trên nền trắng — và `check:design` đo tương phản
 * WCAG sẽ đỏ. Token cho ra đúng cái "Premium Dark Soft UI" mong muốn, và không
 * đánh đổi bản sáng để lấy nó.
 */

/* Màu nhấn theo kỹ năng. NGOẠI LỆ có chủ ý với quy tắc 2, cùng loại với
   `STAT_GRADIENTS` và `LEVEL_COLORS`: đây là màu NHẬN DẠNG, và chữ đặt trên
   nó luôn là trắng nên tương phản không phụ thuộc sáng/tối. */
const SAC = {
  CO: "from-indigo-500 to-blue-600",
  CE: "from-emerald-500 to-teal-600",
  PE: "from-rose-500 to-pink-600",
  PO: "from-amber-500 to-orange-600",
};
const VIEN = {
  CO: "hover:shadow-indigo-500/25",
  CE: "hover:shadow-emerald-500/25",
  PE: "hover:shadow-rose-500/25",
  PO: "hover:shadow-amber-500/25",
};

function ChuCaiDau({ ten, avatar }) {
  if (avatar) {
    return <img src={avatar} alt="" className="h-6 w-6 rounded-full object-cover" />;
  }
  /* Không dùng dịch vụ ảnh đại diện ngẫu nhiên — chúng phục vụ chân dung người
     thật. Thiếu ảnh thì chữ cái đầu, đúng cách avatars.jsx đã làm từ lâu. */
  const chu = String(ten || "?").trim().split(/\s+/).slice(-1)[0]?.[0] ?? "?";
  return (
    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-soft text-[10px] font-extrabold text-primary">
      {chu.toUpperCase()}
    </span>
  );
}

function TheBo({ b, onMo }) {
  return (
    <button
      type="button"
      onClick={() => onMo(b)}
      /* preflight TẮT ⇒ `border-0` + nền rõ ràng + `text-left` + `font-sans`.
         `<button>` KHÔNG kế thừa font, nên thiếu `font-sans` thì cả thẻ rơi về
         font mặc định của trình duyệt và trông như của trang khác.

         Bóng: phải ghi CẢ hình dạng lẫn màu. Tailwind tách `--tw-shadow` khỏi
         `--tw-shadow-color`, nên `hover:shadow-2xl` một mình làm bóng màu thành
         TRONG SUỐT — đo được `rgba(0,0,0,0)`. Đã dính một lần. */
      className={`group relative w-full overflow-hidden rounded-3xl border-0 bg-surface
        p-5 text-left font-sans ring-1 ring-line transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-2xl ${VIEN[b.kyNang] ?? ""}
        motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
    >
      {/* Mảng màu góc trên — nhắc lại hình khối của bản thiết kế mà không phải
          tô nền cả thẻ, nhờ vậy chữ vẫn đặt trên `bg-surface` và tương phản
          không đổi giữa hai bản màu. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full
          bg-gradient-to-br ${SAC[b.kyNang] ?? SAC.CO} opacity-20
          transition-transform duration-500 ease-out group-hover:scale-125`}
      />

      <h3 className="m-0 text-lg font-extrabold tracking-tight text-ink">{b.ten}</h3>

      {b.moTa && (
        <p className="m-0 mt-1 line-clamp-2 text-xs leading-relaxed text-soft">{b.moTa}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] font-semibold text-soft">Soạn bởi</span>
        <ChuCaiDau ten={b.tacGia.ten} avatar={b.tacGia.avatar} />
        <span className="truncate text-[11px] font-bold text-ink">{b.tacGia.ten}</span>
      </div>

      {/* Bộ nháp chỉ giáo viên mới thấy (RLS). Nói ra để họ không tưởng học
          sinh đang nhìn thấy một bộ chưa xong. */}
      {!b.congKhai && (
        <span className="mt-3 inline-block rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-bold text-warn">
          nháp — học sinh chưa thấy
        </span>
      )}

      <span className="mt-4 flex w-fit items-center gap-2 rounded-full bg-surface2 px-3 py-1.5 text-xs font-bold text-ink">
        {b.soThe} thẻ
        <ChevronsRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </button>
  );
}

export default function ThuVienBoThe({ ds, onMo }) {
  const [kyNang, setKyNang] = useState("CO");

  const hien = useMemo(
    () => (Array.isArray(ds) ? ds.filter((b) => b.kyNang === kyNang) : []),
    [ds, kyNang],
  );

  return (
    <div className="mx-auto max-w-5xl py-6">
      <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">Flashcard</h1>
      <p className="m-0 mt-1 text-sm text-soft">
        Chọn một bộ để luyện. Các bộ này do giáo viên soạn.
      </p>

      <div className="mt-6 flex gap-4">
        {/* ══ CỘT TAB DỌC ══ */}
        <div className="flex shrink-0 flex-col gap-2">
          {KY_NANG.map((k) => {
            const chon = k.ma === kyNang;
            return (
              <button
                key={k.ma}
                type="button"
                onClick={() => setKyNang(k.ma)}
                aria-pressed={chon}
                /* `w-11` cố định: rotate-180 xoay quanh tâm, nên bề rộng co
                   theo chữ sẽ làm các tab lệch nhau sau khi xoay. */
                className={`flex w-11 items-center justify-center rounded-2xl border-0 py-6
                  font-sans text-xs font-bold uppercase tracking-widest
                  [writing-mode:vertical-lr] -rotate-180
                  transition-colors duration-300 ${
                    chon ? "bg-primary text-white" : "bg-surface2 text-soft hover:text-ink"
                  }`}
              >
                {k.ten}
              </button>
            );
          })}
        </div>

        {/* ══ LƯỚI THẺ ══ */}
        <div className="min-w-0 flex-1">
          {ds === undefined ? (
            <p className="m-0 py-10 text-center text-sm text-soft">Đang tải…</p>
          ) : ds === null ? (
            /* KHÔNG ĐỌC ĐƯỢC ≠ CHƯA CÓ BỘ NÀO. Gộp lại là báo tin vui cho một
               sự cố — người dùng sẽ đi tìm bộ thẻ ở chỗ khác. */
            <div className="rounded-2xl bg-danger-soft p-6 text-center">
              <AlertTriangle size={20} className="mx-auto text-danger" />
              <p className="m-0 mt-2 font-bold text-ink">Không đọc được thư viện</p>
              <p className="m-0 mt-1 text-sm text-ink">
                Danh sách trống ở đây KHÔNG có nghĩa là chưa có bộ nào — kiểm tra
                kết nối rồi tải lại.
              </p>
            </div>
          ) : hien.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center">
              <Layers size={22} className="mx-auto text-soft" />
              <p className="m-0 mt-2 font-bold text-ink">Chưa có bộ thẻ nào cho kỹ năng này</p>
              <p className="m-0 mt-1 text-sm leading-relaxed text-soft">
                Bộ thẻ do giáo viên soạn. Khi có bộ mới cho phần{" "}
                {KY_NANG.find((k) => k.ma === kyNang)?.ten.toLowerCase()}, nó sẽ hiện ở đây.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hien.map((b) => <TheBo key={b.id} b={b} onMo={onMo} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
