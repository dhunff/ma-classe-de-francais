import React from "react";

/* Chỗ trống trong câu (« ______ ») vẽ thành MỘT gạch liền (23/10, theo chủ dự án).
 *
 * Dữ liệu vẫn lưu bằng dấu gạch dưới (chấm bài, đếm ô trống, neo đều dựa vào
 * đó), chỉ đổi lúc HIỆN: chuỗi « _ » liên tiếp ở nhiều phông trông như gạch đứt.
 * Độ dài gạch theo số dấu gạch dưới để giữ gợi ý về độ dài từ. */
export function choTrong(s) {
  if (typeof s !== "string" || !/_{2,}/.test(s)) return s;
  return s.split(/(_{2,})/).map((p, i) =>
    /^_{2,}$/.test(p)
      ? <span key={i} aria-label="___" className="mx-0.5 inline-block border-0 border-b-2 border-solid border-current align-baseline opacity-80"
          style={{ width: `${Math.min(8, Math.max(2.5, p.length * 0.5))}em`, height: "1em" }} />
      : p);
}
