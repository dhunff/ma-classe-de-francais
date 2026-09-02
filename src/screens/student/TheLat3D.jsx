import React from "react";

/* Thẻ lật 3D + hiệu ứng chồng thẻ.
 *
 * ══ LẬT 3D HOẠT ĐỘNG THẾ NÀO ══
 *
 * Bốn mảnh, thiếu một mảnh là hỏng theo một kiểu khác nhau:
 *
 * 1. `perspective` đặt ở thẻ CHA. Đây là khoảng cách từ mắt người xem tới mặt
 *    phẳng. Không có nó thì phép quay vẫn chạy nhưng chiếu song song — chữ chỉ
 *    bẹp dần rồi nở ra, không có cảm giác chiều sâu. Số càng nhỏ thì phối cảnh
 *    càng mạnh; 1200px là mức thấy được mà không méo.
 *
 * 2. `transform-style: preserve-3d` ở lớp QUAY. Mặc định trình duyệt bẹp mọi
 *    con cháu về cùng một mặt phẳng, và khi đó mặt sau không bao giờ hiện ra
 *    dù có quay bao nhiêu độ.
 *
 * 3. `backface-visibility: hidden` ở CẢ HAI mặt. Đây là mảnh hay quên nhất:
 *    thiếu nó thì hai mặt cùng vẽ đè lên nhau, và giữa chừng cú lật người dùng
 *    đọc được chữ ngược của mặt kia.
 *
 * 4. Mặt sau bị quay sẵn `rotateY(180deg)`. Nó luôn nằm ngược 180° so với mặt
 *    trước, nên khi cả khối quay 180° thì mặt sau về đúng 0° và ngửa ra.
 *
 * Hai mặt phải CHỒNG lên nhau (`absolute inset-0`), không xếp dọc. Xếp dọc thì
 * thẻ cao gấp đôi và một nửa luôn trống.
 *
 * ══ VÌ SAO KHÔNG DÙNG `rotate-y-180` CỦA TAILWIND ══
 *
 * Tailwind 3 không có tiện ích xoay theo trục Y, và `check:css` của dự án tồn
 * tại đúng để bắt loại lớp không sinh ra CSS nào. Dùng giá trị tuỳ ý
 * `[transform:rotateY(180deg)]` thì Tailwind sinh CSS thật và bộ kiểm xác nhận
 * được.
 *
 * ══ CHỒNG THẺ ══
 *
 * Hai thẻ giả phía sau, thu nhỏ dần và đẩy LÊN trên. Chúng `aria-hidden` và
 * không nhận chuột — chúng là hình vẽ, không phải nội dung. Trình đọc màn hình
 * mà đọc ra ba thẻ trong khi chỉ có một thẻ thật là tệ hơn không có hiệu ứng
 * nào.
 *
 * `prefers-reduced-motion` được tôn trọng qua `motion-reduce:transition-none` —
 * người bật giảm chuyển động vẫn lật được thẻ, chỉ là đổi mặt tức thì. */

export default function TheLat3D({ mat, sau, viDu, daLat, onLat, conLai = 0 }) {
  return (
    <div className="relative mx-auto mt-4 w-full max-w-xl [perspective:1200px]">
      {/* Chồng thẻ: chỉ vẽ đúng số thẻ CÒN LẠI, tối đa hai. Vẽ cứng hai thẻ giả
          khi chỉ còn một thẻ thật là nói dối bằng hình ảnh — người học tưởng
          còn phải làm nhiều. */}
      {/* Độ lệch phải TÍNH, không đoán.
          `scale-90` thu nhỏ quanh TÂM, nên mép trên của thẻ giả tụt XUỐNG 5%
          chiều cao (≈11px với thẻ 224px). `-translate-y-4` chỉ kéo lên 16px,
          nên phần nhô ra thật sự chỉ còn ≈5px — bản đầu vẽ đúng như thế và
          trên màn hình không thấy gì cả. Đo bằng ảnh chụp mới ra.
          Nay kéo lên đủ để phần nhô bằng khoảng 12–14px mỗi lớp. */}
      {conLai > 2 && (
        <div aria-hidden
          className="pointer-events-none absolute inset-0 -translate-y-7 scale-[0.90] rounded-3xl border border-line bg-surface2" />
      )}
      {conLai > 1 && (
        <div aria-hidden
          className="pointer-events-none absolute inset-0 -translate-y-4 scale-[0.95] rounded-3xl border border-line bg-surface" />
      )}

      <button type="button" onClick={onLat}
        aria-pressed={daLat}
        className="relative block w-full cursor-pointer border-0 bg-transparent p-0 text-left">
        <div
          className={`relative min-h-56 w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
            daLat ? "[transform:rotateY(180deg)]" : ""}`}>

          {/* MẶT TRƯỚC */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 shadow-lg shadow-indigo-500/30 [backface-visibility:hidden]">
            <p className="m-0 text-center text-xl font-extrabold leading-relaxed text-white">{mat}</p>
            <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Chạm để lật
            </span>
          </div>

          {/* MẶT SAU — quay sẵn 180°, nên khi cả khối quay 180° thì nó về 0°. */}
          <div className="absolute inset-0 flex flex-col justify-center gap-4 overflow-y-auto rounded-3xl border border-line bg-surface p-7 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="m-0 text-center text-base font-bold leading-relaxed text-ink">{sau}</p>
            {viDu && (
              <div className="rounded-2xl bg-surface2 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-soft">Ví dụ</div>
                <p className="m-0 mt-1 text-sm italic leading-relaxed text-ink">{viDu}</p>
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
