import React from "react";

/* Ảnh đại diện: tám con vật vẽ bằng SVG, có chớp mắt và ngoe nguẩy tai.
 *
 * ══ VÌ SAO KHÔNG PHẢI FILE .GIF ══
 *
 * Bản mô tả đề nghị `/avatars/fox.gif`. Hệ thống chưa có tệp nào như thế, và
 * chưa có chỗ để đặt: Supabase Storage chưa bật, thư mục `public/` chưa có
 * avatar. Ghi đường dẫn tới tệp không tồn tại nghĩa là mọi người dùng chọn
 * xong đều thấy một ô ảnh vỡ — và không có gì báo lỗi, vì 404 trên thẻ <img>
 * không làm gì cả ngoài việc hiện ra xấu.
 *
 * Vẽ thẳng bằng SVG thì: có thật ngay bây giờ, nét ở mọi kích thước, đổi màu
 * theo bản sáng/tối được, không tốn một lượt tải mạng nào, và nặng vài KB thay
 * vì vài trăm KB cho tám ảnh GIF.
 *
 * ══ MÀU VIẾT CỨNG — NGOẠI LỆ CÓ CHỦ Ý ══
 *
 * Quy tắc 2 của dự án nói màu phải đi qua token. Ở đây thì không: cáo màu cam
 * và gấu trúc màu đen trắng là thuộc tính của con vật, không phải của giao
 * diện. Cho chúng đảo theo bản tối sẽ ra một con cáo xanh. Cùng loại ngoại lệ
 * với `LEVEL_COLORS` và `STAT_GRADIENTS`.
 *
 * Phần ĐỔI theo chủ đề là nền phía sau, và nó dùng `currentColor` để chỗ gọi
 * quyết định. */

/* Tên khoá lưu xuống cột `profiles.avatar`. Ràng buộc
   `profiles_avatar_dang` (migration 046) chỉ nhận `^[a-z][a-z0-9_]{1,23}$`
   hoặc một địa chỉ https, nên mọi khoá ở đây phải là chữ thường không dấu. */

const M = ({ d, f, o }) => <path d={d} fill={f} opacity={o} />;
const C = ({ x, y, r, f, cls }) => <circle cx={x} cy={y} r={r} fill={f} className={cls} />;

/* Mắt: hai chấm đen có class `mcf-av-eye` để chớp. Tách thành hàm vì cả tám
   con đều dùng, và một chỗ sai thì sai đều — dễ thấy hơn tám chỗ sai khác
   nhau. */
const Mat = ({ x1, x2, y, r = 3, f = "#241C18" }) => (
  <>
    <C x={x1} y={y} r={r} f={f} cls="mcf-av-eye" />
    <C x={x2} y={y} r={r} f={f} cls="mcf-av-eye" />
  </>
);

const CON_VAT = {
  renard: {
    ten: { vi: "Cáo", fr: "Renard", en: "Fox" }, nen: "#FDE8D2",
    ve: (
      <>
        <path className="mcf-av-ear" d="M14 26 L18 8 L31 20 Z" fill="#E8722F" />
        <path className="mcf-av-ear" d="M50 26 L46 8 L33 20 Z" fill="#E8722F" />
        <ellipse cx="32" cy="36" rx="21" ry="18" fill="#F08B3D" />
        <path d="M32 54c-9 0-16-6-18-13 5 6 11 8 18 8s13-2 18-8c-2 7-9 13-18 13Z" fill="#FFF3E6" />
        <Mat x1={24} x2={40} y={33} />
        <path d="M29 41h6l-3 4Z" fill="#3B2A22" />
      </>
    ),
  },
  chouette: {
    ten: { vi: "Cú", fr: "Chouette", en: "Owl" }, nen: "#E4E7F5",
    ve: (
      <>
        <path className="mcf-av-ear" d="M13 20 L20 9 L26 18 Z" fill="#7A6BA8" />
        <path className="mcf-av-ear" d="M51 20 L44 9 L38 18 Z" fill="#7A6BA8" />
        <ellipse cx="32" cy="35" rx="21" ry="19" fill="#8B7BBD" />
        <C x={24} y={32} r={9} f="#EFEAFB" /><C x={40} y={32} r={9} f="#EFEAFB" />
        <Mat x1={24} x2={40} y={32} r={4} />
        <path d="M32 38l4 5-4 4-4-4Z" fill="#F2A03D" />
      </>
    ),
  },
  chat: {
    ten: { vi: "Mèo", fr: "Chat", en: "Cat" }, nen: "#E9E3DC",
    ve: (
      <>
        <path className="mcf-av-ear" d="M15 25 L17 10 L29 19 Z" fill="#8A7F76" />
        <path className="mcf-av-ear" d="M49 25 L47 10 L35 19 Z" fill="#8A7F76" />
        <ellipse cx="32" cy="36" rx="21" ry="18" fill="#9C9089" />
        <Mat x1={24} x2={40} y={34} />
        <path d="M29 41h6l-3 3Z" fill="#4A3B36" />
        <path d="M8 38h12M8 43h12M44 38h12M44 43h12" stroke="#4A3B36" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
      </>
    ),
  },
  grenouille: {
    ten: { vi: "Ếch", fr: "Grenouille", en: "Frog" }, nen: "#DDF2DC",
    ve: (
      <>
        <C x={20} y={20} r={9} f="#6FBF63" /><C x={44} y={20} r={9} f="#6FBF63" />
        <C x={20} y={20} r={6} f="#FFFFFF" cls="mcf-av-eye" />
        <C x={44} y={20} r={6} f="#FFFFFF" cls="mcf-av-eye" />
        <C x={21} y={21} r={3} f="#241C18" />
        <C x={45} y={21} r={3} f="#241C18" />
        <ellipse cx="32" cy="40" rx="22" ry="16" fill="#7ACC6C" />
        <path d="M22 44c4 5 16 5 20 0" stroke="#2F6B2A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  panda: {
    ten: { vi: "Gấu trúc", fr: "Panda", en: "Panda" }, nen: "#E7E7EA",
    ve: (
      <>
        <C x={16} y={18} r={8} f="#2B2B30" cls="mcf-av-ear" />
        <C x={48} y={18} r={8} f="#2B2B30" cls="mcf-av-ear" />
        <ellipse cx="32" cy="36" rx="21" ry="18" fill="#FBFBFC" />
        <ellipse cx="24" cy="33" rx="6.5" ry="8" fill="#2B2B30" transform="rotate(-14 24 33)" />
        <ellipse cx="40" cy="33" rx="6.5" ry="8" fill="#2B2B30" transform="rotate(14 40 33)" />
        <Mat x1={24} x2={40} y={33} r={2.6} f="#FBFBFC" />
        <ellipse cx="32" cy="42" rx="3.4" ry="2.6" fill="#2B2B30" />
      </>
    ),
  },
  abeille: {
    ten: { vi: "Ong", fr: "Abeille", en: "Bee" }, nen: "#FCF1CE",
    ve: (
      <>
        <path d="M20 16 Q14 6 8 10" stroke="#3B3220" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M44 16 Q50 6 56 10" stroke="#3B3220" strokeWidth="2" fill="none" strokeLinecap="round" />
        <C x={7} y={9} r={2.6} f="#3B3220" /><C x={57} y={9} r={2.6} f="#3B3220" />
        <ellipse cx="14" cy="30" rx="9" ry="12" fill="#CFE6F7" opacity=".8" className="mcf-av-ear" />
        <ellipse cx="50" cy="30" rx="9" ry="12" fill="#CFE6F7" opacity=".8" className="mcf-av-ear" />
        <ellipse cx="32" cy="36" rx="19" ry="17" fill="#F5C63C" />
        <M d="M15 30h34v5H15zM17 41h30v5H17z" f="#3B3220" o=".9" />
        <Mat x1={25} x2={39} y={25} r={2.8} />
      </>
    ),
  },
  lapin: {
    ten: { vi: "Thỏ", fr: "Lapin", en: "Rabbit" }, nen: "#F7E6EC",
    ve: (
      <>
        <ellipse className="mcf-av-ear" cx="24" cy="14" rx="5" ry="13" fill="#E9D5DC" />
        <ellipse className="mcf-av-ear" cx="40" cy="14" rx="5" ry="13" fill="#E9D5DC" />
        <ellipse cx="24" cy="15" rx="2.4" ry="9" fill="#F2A8BC" />
        <ellipse cx="40" cy="15" rx="2.4" ry="9" fill="#F2A8BC" />
        <ellipse cx="32" cy="40" rx="20" ry="16" fill="#F6ECEF" />
        <Mat x1={25} x2={39} y={38} r={2.8} />
        <path d="M32 43l-2.5 2h5Z" fill="#E0748F" />
      </>
    ),
  },
  pingouin: {
    ten: { vi: "Chim cánh cụt", fr: "Pingouin", en: "Penguin" }, nen: "#DCEAF3",
    ve: (
      <>
        <ellipse cx="32" cy="34" rx="21" ry="20" fill="#2C3A47" />
        <ellipse cx="32" cy="39" rx="14" ry="15" fill="#F7FAFC" />
        <ellipse className="mcf-av-ear" cx="10" cy="36" rx="5" ry="11" fill="#2C3A47" />
        <ellipse className="mcf-av-ear" cx="54" cy="36" rx="5" ry="11" fill="#2C3A47" />
        <Mat x1={26} x2={38} y={29} r={2.8} />
        <path d="M32 33l5 4-5 4-5-4Z" fill="#F2A03D" />
      </>
    ),
  },
};

export const DS_AVATAR = Object.keys(CON_VAT);
export const AVATAR_MAC_DINH = "renard";

export const tenConVat = (khoa, lang = "vi") =>
  CON_VAT[khoa]?.ten?.[lang] ?? CON_VAT[khoa]?.ten?.vi ?? "";

/* Chữ cái đầu — vẫn giữ, và vẫn là mặc định.
 *
 * Không tự gán một con vật cho người chưa chọn: ảnh đại diện là thứ người khác
 * dùng để nhận ra bạn, và hệ thống tự đặt cho bạn một con gấu trúc thì lần đầu
 * mở trang bạn không biết đó có phải mình không. Chữ cái đầu thì luôn đúng. */
function ChuCaiDau({ ten }) {
  return (
    <span aria-hidden className="grid h-full w-full place-items-center rounded-full bg-primary font-extrabold text-on-primary"
          style={{ fontSize: "45%" }}>
      {(ten || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}

/* Một ảnh đại diện.
 *
 * `khoa` có ba dạng: rỗng (chữ cái đầu), khoá con vật, hoặc `https://…` cho
 * ảnh thật sau này. Nhánh https có sẵn ở đây để lúc bật Supabase Storage thì
 * không phải sửa mọi chỗ gọi — cột `avatar` đã nhận cả hai từ migration 046.
 *
 * `dungYen` để dùng trong danh sách dài (bảng lớp của giáo viên): ba mươi con
 * vật cùng chớp mắt là một trang không đọc nổi. */
export function Avatar({ khoa, ten, size = 96, dungYen = false, className = "" }) {
  const con = CON_VAT[khoa];
  const laAnh = typeof khoa === "string" && khoa.startsWith("https://");

  return (
    <span
      className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size, background: con ? con.nen : undefined }}
    >
      {laAnh
        ? <img src={khoa} alt="" width={size} height={size} className="h-full w-full object-cover" />
        : con
          ? (
            <svg viewBox="0 0 64 64" width={size} height={size} role="img"
                 aria-label={tenConVat(khoa)} className={dungYen ? "mcf-av-still" : ""}>
              {/* Lệch pha theo tên con vật để cả lưới không chớp mắt cùng lúc —
                  đồng loạt thì trông như một lỗi nhấp nháy, lệch nhau thì
                  trông như tám con vật khác nhau. */}
              <g className={dungYen ? "" : "mcf-av-bob"}
                 style={dungYen ? undefined : { animationDelay: `${(khoa.length % 5) * 0.4}s` }}>
                {con.ve}
              </g>
            </svg>
          )
          : <ChuCaiDau ten={ten} />}
    </span>
  );
}

export { CON_VAT };
